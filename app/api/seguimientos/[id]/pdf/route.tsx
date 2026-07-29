import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { SeguimientoDocument } from "@/components/pdf/SeguimientoDocument";
import type { DatosSeguimientoPDF } from "@/lib/types";

/**
 * GET /api/seguimientos/:id/pdf
 *
 * 1. Verifica que el seguimiento pertenezca al usuario autenticado.
 * 2. Recopila perfil, empresa, jefe inmediato y avances del periodo.
 * 3. Renderiza el PDF con react-pdf.
 * 4. Sube el PDF a Supabase Storage y marca el seguimiento como "generado".
 * 5. Devuelve el archivo para descarga inmediata.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: seguimiento, error: errSeguimiento } = await supabase
    .from("seguimientos")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", user.id)
    .single();

  if (errSeguimiento || !seguimiento) {
    return NextResponse.json({ error: "Seguimiento no encontrado" }, { status: 404 });
  }

  const [{ data: perfil }, { data: empresa }, { data: jefeInmediato }, { data: avances }] =
    await Promise.all([
      supabase.from("perfiles").select("*").eq("id", user.id).single(),
      supabase.from("empresas").select("*").eq("usuario_id", user.id).single(),
      supabase.from("jefes_inmediatos").select("*").eq("usuario_id", user.id).single(),
      supabase
        .from("avances_mensuales")
        .select("*, actividades(*)")
        .eq("seguimiento_id", id),
    ]);

  if (!perfil || !empresa || !jefeInmediato) {
    return NextResponse.json(
      { error: "Faltan datos generales (estudiante, empresa o jefe inmediato) por diligenciar" },
      { status: 400 }
    );
  }

  const fechaGeneracion = new Date().toLocaleString("es-CO", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const datos: DatosSeguimientoPDF = {
    perfil,
    empresa,
    jefeInmediato,
    periodo: seguimiento.periodo,
    fechaGeneracion,
    actividades: (avances ?? []).map((a: any) => ({
      actividad: a.actividades,
      porcentajeAvance: Number(a.porcentaje_avance),
      comentario: a.comentario ?? null,
      // Se considera "nueva este mes" si su fecha de asignación cae dentro del periodo
      esNuevaEsteMes: !a.actividades.es_actividad_inicial &&
        a.actividades.fecha_asignacion?.slice(0, 7) === seguimiento.periodo,
    })),
  };

  const pdfBuffer = await renderToBuffer(<SeguimientoDocument datos={datos} />);

  const rutaArchivo = `${user.id}/${seguimiento.periodo}.pdf`;
  const { error: errUpload } = await supabase.storage
    .from("seguimientos-pdf")
    .upload(rutaArchivo, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (errUpload) {
    return NextResponse.json({ error: "No se pudo guardar el PDF" }, { status: 500 });
  }

  await supabase
    .from("seguimientos")
    .update({
      estado: "generado",
      pdf_path: rutaArchivo,
      fecha_generacion: new Date().toISOString(),
    })
    .eq("id", id);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="seguimiento-${seguimiento.periodo}.pdf"`,
    },
  });
}

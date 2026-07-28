import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/estudiantes/:estudianteId/pdf/:periodo
 *
 * Protegido por requireAdmin() (cookie de sesión simple, ver
 * lib/admin-auth.ts). Usa el cliente con Service Role para leer
 * el archivo sin depender de RLS.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ estudianteId: string; periodo: string }> }
) {
  const { estudianteId, periodo } = await params;
  const { supabase } = await requireAdmin();

  const rutaArchivo = `${estudianteId}/${periodo}.pdf`;

  const { data, error } = await supabase.storage
    .from("seguimientos-pdf")
    .download(rutaArchivo);

  if (error || !data) {
    return NextResponse.json({ error: "No se encontró el PDF" }, { status: 404 });
  }

  return new NextResponse(await data.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="seguimiento-${estudianteId}-${periodo}.pdf"`,
    },
  });
}

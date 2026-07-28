import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/actividades
 * Crea una nueva actividad. Si esActividadInicial es false, exige
 * observacionAdicion no vacía (regla de negocio RF06), validada aquí
 * en el backend además de en el formulario del frontend.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { nombre, descripcion, esActividadInicial, observacionAdicion } = body;

  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return NextResponse.json({ error: "El nombre de la actividad es obligatorio" }, { status: 400 });
  }

  if (!esActividadInicial && (!observacionAdicion || observacionAdicion.trim().length === 0)) {
    return NextResponse.json(
      { error: "Debes explicar por qué se agrega esta nueva actividad" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("actividades")
    .insert({
      usuario_id: user.id,
      nombre: nombre.trim(),
      descripcion: descripcion ?? null,
      es_actividad_inicial: !!esActividadInicial,
      observacion_adicion: esActividadInicial ? null : observacionAdicion.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ actividad: data }, { status: 201 });
}

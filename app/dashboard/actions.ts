"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Guarda (crea o actualiza) la empresa y el jefe inmediato del
 * estudiante autenticado. Se usa tanto para el diligenciamiento
 * inicial como para editar estos datos más adelante (RF15).
 */
export async function guardarDatosGenerales(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nombre = String(formData.get("nombre") ?? "").trim();
  // Normalizar documento y teléfonos: solo dígitos, máximo 11
  const documento = String(formData.get("documento") ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
  const programaAcademico = String(formData.get("programa_academico") ?? "").trim();
  const semestre = String(formData.get("semestre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
  const fechaInicio = String(formData.get("fecha_inicio_practica") ?? "").trim();
  const fechaFin = String(formData.get("fecha_fin_practica") ?? "").trim();

  const nombreEmpresa = String(formData.get("nombre_empresa") ?? "").trim();
  const nit = String(formData.get("nit") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const empresaTelefono = String(formData.get("empresa_telefono") ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

  const nombreJefe = String(formData.get("jefe_nombre") ?? "").trim();
  const cargo = String(formData.get("jefe_cargo") ?? "").trim();
  const correoJefe = String(formData.get("jefe_correo") ?? "").trim();
  const telefonoJefe = String(formData.get("jefe_telefono") ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

  await supabase
    .from("perfiles")
    .update({
      nombre: nombre || null,
      documento: documento || null,
      programa_academico: programaAcademico || null,
      semestre: semestre || null,
      telefono: telefono || null,
      fecha_inicio_practica: fechaInicio || null,
      fecha_fin_practica: fechaFin || null,
    })
    .eq("id", user.id);

  await supabase
    .from("empresas")
    .upsert(
      { usuario_id: user.id, nombre_empresa: nombreEmpresa, nit, direccion, sector, telefono: empresaTelefono },
      { onConflict: "usuario_id" }
    );

  await supabase
    .from("jefes_inmediatos")
    .upsert(
      { usuario_id: user.id, nombre: nombreJefe, cargo, correo: correoJefe, telefono: telefonoJefe },
      { onConflict: "usuario_id" }
    );

  revalidatePath("/dashboard");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function periodoActual() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
}

function periodoValido(periodo: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(periodo);
}

/**
 * Crea una nueva actividad. Si el estudiante ya generó al menos un
 * seguimiento antes, se considera "no inicial" y exige observación
 * (RF06). Devuelve { error } en vez de lanzar, para que el formulario
 * cliente pueda mostrar el mensaje sin perder lo ya escrito.
 */
export async function agregarActividad(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const observacion = String(formData.get("observacion") ?? "").trim();

  if (!nombre) {
    return { error: "El nombre de la actividad es obligatorio" };
  }

  const { count } = await supabase
    .from("seguimientos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("estado", "generado");

  const esActividadInicial = !count;

  if (!esActividadInicial && !observacion) {
    return { error: "Debes explicar por qué se agrega esta nueva actividad" };
  }

  const { error } = await supabase.from("actividades").insert({
    usuario_id: user.id,
    nombre,
    descripcion: descripcion || null,
    es_actividad_inicial: esActividadInicial,
    observacion_adicion: esActividadInicial ? null : observacion,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

/**
 * Guarda (o actualiza) el % de avance de cada actividad para el
 * seguimiento del mes en curso. Crea el seguimiento en estado
 * "borrador" si todavía no existe. Si el seguimiento del periodo ya
 * quedó "generado", no permite seguir editando (RF09).
 */
export async function guardarAvanceMensual(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const periodo = String(formData.get("periodo") ?? "").trim();
  const periodoSeleccionado = periodoValido(periodo) ? periodo : periodoActual();

  const { data: existente } = await supabase
    .from("seguimientos")
    .select("id, estado")
    .eq("usuario_id", user.id)
    .eq("periodo", periodoSeleccionado)
    .maybeSingle();

  let seguimientoId = existente?.id as string | undefined;

  if (!seguimientoId) {
    const { data: nuevo, error: errCrear } = await supabase
      .from("seguimientos")
      .insert({ usuario_id: user.id, periodo: periodoSeleccionado, estado: "borrador" })
      .select("id")
      .single();

    if (errCrear || !nuevo) {
      return { error: errCrear?.message ?? "No se pudo crear el seguimiento" };
    }
    seguimientoId = nuevo.id;
  }

  const entradas = Array.from(formData.entries()).filter(([clave]) =>
    clave.startsWith("avance_")
  );

  for (const [clave, valor] of entradas) {
    const actividadId = clave.replace("avance_", "");
    const porcentaje = Math.max(0, Math.min(100, Number(valor)));
    const comentario = String(formData.get(`comentario_${actividadId}`) ?? "").trim();

    await supabase.from("avances_mensuales").upsert(
      {
        seguimiento_id: seguimientoId,
        actividad_id: actividadId,
        porcentaje_avance: porcentaje,
        comentario: comentario || null,
      },
      { onConflict: "seguimiento_id,actividad_id" }
    );
  }

  revalidatePath("/dashboard");
  return { error: null, seguimientoId };
}

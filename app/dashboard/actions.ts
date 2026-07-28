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

  const nombreEmpresa = String(formData.get("nombre_empresa") ?? "").trim();
  const nit = String(formData.get("nit") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();

  const nombreJefe = String(formData.get("jefe_nombre") ?? "").trim();
  const cargo = String(formData.get("jefe_cargo") ?? "").trim();
  const correoJefe = String(formData.get("jefe_correo") ?? "").trim();
  const telefonoJefe = String(formData.get("jefe_telefono") ?? "").trim();

  await supabase
    .from("empresas")
    .upsert(
      { usuario_id: user.id, nombre_empresa: nombreEmpresa, nit, direccion, sector },
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

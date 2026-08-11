import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/navigation/StudentShell";
import { DatosGeneralesForm } from "@/components/dashboard/DatosGeneralesForm";

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: perfil }, { data: empresa }, { data: jefe }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("id", user.id).single(),
    supabase.from("empresas").select("*").eq("usuario_id", user.id).maybeSingle(),
    supabase.from("jefes_inmediatos").select("*").eq("usuario_id", user.id).maybeSingle(),
  ]);

  return (
    <StudentShell
      title="Configuración de Perfil"
      nombreEstudiante={perfil?.nombre ?? "Estudiante"}
      correoEstudiante={perfil?.correo}
    >
      <DatosGeneralesForm perfil={perfil!} empresa={empresa ?? null} jefe={jefe ?? null} />
    </StudentShell>
  );
}

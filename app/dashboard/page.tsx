import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DatosGeneralesForm } from "@/components/dashboard/DatosGeneralesForm";
import { cerrarSesion } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: perfil }, { data: empresa }, { data: jefe }, { data: actividades }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("id", user.id).single(),
    supabase.from("empresas").select("*").eq("usuario_id", user.id).maybeSingle(),
    supabase.from("jefes_inmediatos").select("*").eq("usuario_id", user.id).maybeSingle(),
    supabase
      .from("actividades")
      .select("*, avances_mensuales(porcentaje_avance, fecha_registro)")
      .eq("usuario_id", user.id)
      .eq("activa", true)
      .order("fecha_asignacion", { ascending: true }),
  ]);

  const datosGeneralesCompletos = !!empresa && !!jefe;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>Mi seguimiento de práctica</h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{perfil?.nombre}</p>
        </div>
        <form action={cerrarSesion}>
          <button
            type="submit"
            style={{ fontSize: 13, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {!datosGeneralesCompletos ? (
        <div>
          <p style={{ fontSize: 14, color: "#a15c00", background: "#fff4e5", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
            Antes de continuar, completa los datos de tu empresa y de tu jefe inmediato.
          </p>
          <DatosGeneralesForm empresa={empresa ?? null} jefe={jefe ?? null} />
        </div>
      ) : (
        <>
          <div style={{ background: "#f7f7f8", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>Datos generales</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
              <div>
                <p style={{ color: "#888", margin: "0 0 2px" }}>Empresa</p>
                <p style={{ margin: 0 }}>{empresa!.nombre_empresa}</p>
              </div>
              <div>
                <p style={{ color: "#888", margin: "0 0 2px" }}>Jefe inmediato</p>
                <p style={{ margin: 0 }}>{jefe!.nombre}</p>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>Actividades asignadas</span>
            </div>

            {(actividades ?? []).length === 0 && (
              <p style={{ fontSize: 13, color: "#888" }}>
                Aún no tienes actividades registradas.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(actividades ?? []).map((act) => {
                const avances = (act.avances_mensuales ?? []) as Array<{ porcentaje_avance: number; fecha_registro: string }>;
                const ultimoAvance = avances.length
                  ? avances.reduce((a, b) => (a.fecha_registro > b.fecha_registro ? a : b))
                  : null;
                const porcentaje = ultimoAvance ? ultimoAvance.porcentaje_avance : 0;

                return (
                  <div key={act.id} style={{ background: "#f7f7f8", border: "1px solid #eee", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{act.nombre}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>{porcentaje}%</span>
                    </div>
                    <div style={{ height: 6, background: "#e5e5e5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${porcentaje}%`, background: "#3b82f6", borderRadius: 4 }} />
                    </div>
                    {!act.es_actividad_inicial && act.observacion_adicion && (
                      <p style={{ fontSize: 12, color: "#a15c00", marginTop: 6, marginBottom: 0 }}>
                        Actividad nueva: {act.observacion_adicion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

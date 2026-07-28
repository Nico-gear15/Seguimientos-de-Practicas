import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default async function DetalleEstudiantePage({
  params,
}: {
  params: Promise<{ estudianteId: string }>;
}) {
  const { estudianteId } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: perfil }, { data: empresa }, { data: jefe }, { data: actividades }, { data: seguimientos }] =
    await Promise.all([
      supabase.from("perfiles").select("*").eq("id", estudianteId).single(),
      supabase.from("empresas").select("*").eq("usuario_id", estudianteId).maybeSingle(),
      supabase.from("jefes_inmediatos").select("*").eq("usuario_id", estudianteId).maybeSingle(),
      supabase
        .from("actividades")
        .select("*")
        .eq("usuario_id", estudianteId)
        .order("fecha_asignacion", { ascending: true }),
      supabase
        .from("seguimientos")
        .select("*, avances_mensuales(*)")
        .eq("usuario_id", estudianteId)
        .order("periodo", { ascending: true }),
    ]);

  if (!perfil) return notFound();

  const periodos = (seguimientos ?? []).map((s) => s.periodo);

  // Mapa: actividad_id -> { periodo -> porcentaje }
  const avancePorActividad = new Map<string, Map<string, number>>();
  for (const s of seguimientos ?? []) {
    for (const av of s.avances_mensuales ?? []) {
      if (!avancePorActividad.has(av.actividad_id)) {
        avancePorActividad.set(av.actividad_id, new Map());
      }
      avancePorActividad.get(av.actividad_id)!.set(s.periodo, av.porcentaje_avance);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
      <Link href="/admin" style={{ fontSize: 13, color: "#2563eb" }}>← Volver al panel</Link>

      <h1 style={{ fontSize: 20, fontWeight: 600, margin: "12px 0 2px" }}>{perfil.nombre}</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>{perfil.correo} · {perfil.programa_academico ?? "Programa no registrado"}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16 }}>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>Empresa</p>
          {empresa ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}>{empresa.nombre_empresa}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{empresa.nit ?? "-"} · {empresa.direccion ?? "-"}</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#888" }}>Aún no diligenciado</p>
          )}
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16 }}>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>Jefe inmediato</p>
          {jefe ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}>{jefe.nombre} · {jefe.cargo ?? "-"}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{jefe.correo ?? "-"}</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#888" }}>Aún no diligenciado</p>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Avance mes a mes por actividad</h2>
      <div style={{ overflowX: "auto", marginBottom: 28 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd", color: "#666" }}>
              <th style={{ padding: "8px 6px", minWidth: 220 }}>Actividad</th>
              {periodos.map((p) => (
                <th key={p} style={{ padding: "8px 6px", textAlign: "center" }}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(actividades ?? []).map((act) => (
              <tr key={act.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                <td style={{ padding: "8px 6px" }}>
                  {act.nombre}
                  {!act.es_actividad_inicial && (
                    <div style={{ fontSize: 11, color: "#a15c00", marginTop: 2 }}>
                      Agregada: {act.observacion_adicion}
                    </div>
                  )}
                </td>
                {periodos.map((p) => {
                  const valor = avancePorActividad.get(act.id)?.get(p);
                  return (
                    <td key={p} style={{ padding: "8px 6px", textAlign: "center", color: valor === undefined ? "#ccc" : "inherit" }}>
                      {valor === undefined ? "—" : `${valor}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Seguimientos entregados</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(seguimientos ?? []).map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #eee",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div>
              <span style={{ fontWeight: 500 }}>{s.periodo}</span>{" "}
              <span style={{ fontSize: 12, color: s.estado === "generado" ? "#1e7e34" : "#a15c00" }}>
                {s.estado === "generado" ? "Generado" : "Borrador"}
              </span>
            </div>
            {s.estado === "generado" && s.pdf_path && (
              <a
                href={`/api/admin/estudiantes/${estudianteId}/pdf/${s.periodo}`}
                style={{ fontSize: 13, color: "#2563eb" }}
              >
                Descargar PDF
              </a>
            )}
          </div>
        ))}
        {(seguimientos ?? []).length === 0 && (
          <p style={{ fontSize: 13, color: "#888" }}>Este estudiante aún no ha generado ningún seguimiento.</p>
        )}
      </div>
    </div>
  );
}

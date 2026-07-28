import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

interface FilaEstudiante {
  usuario_id: string;
  nombre: string;
  correo: string;
  programa_academico: string | null;
  nombre_empresa: string | null;
  ultimo_periodo: string | null;
  ultimo_estado: "borrador" | "generado" | null;
  avance_global_promedio: number;
}

function EstadoBadge({ estado }: { estado: FilaEstudiante["ultimo_estado"] }) {
  if (estado === "generado") {
    return (
      <span style={{ background: "#e6f4ea", color: "#1e7e34", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>
        Al día
      </span>
    );
  }
  if (estado === "borrador") {
    return (
      <span style={{ background: "#fff4e5", color: "#a15c00", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>
        Pendiente de entregar
      </span>
    );
  }
  return (
    <span style={{ background: "#fdeaea", color: "#b02a2a", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>
      Sin seguimientos
    </span>
  );
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  // La vista ya filtra por rol = 'estudiante' y respeta RLS (security_invoker),
  // así que un admin ve a todos y un no-admin no vería nada.
  const { data: estudiantes, error } = await supabase
    .from("vista_avance_estudiantes")
    .select("*")
    .order("avance_global_promedio", { ascending: true });

  if (error) {
    return <p style={{ color: "crimson" }}>Error al cargar los estudiantes: {error.message}</p>;
  }

  const filas = (estudiantes ?? []) as FilaEstudiante[];
  const enRiesgo = filas.filter((f) => f.avance_global_promedio < 30).length;
  const pendientes = filas.filter((f) => f.ultimo_estado !== "generado").length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Panel de seguimiento — Practicantes</h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
            Vista general del avance de cada estudiante según su último seguimiento mensual.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            style={{ fontSize: 13, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "12px 16px" }}>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Estudiantes</p>
          <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{filas.length}</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "12px 16px" }}>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Con seguimiento pendiente</p>
          <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{pendientes}</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "12px 16px" }}>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Avance {"<"} 30%</p>
          <p style={{ fontSize: 22, fontWeight: 600, margin: 0, color: enRiesgo > 0 ? "#b02a2a" : "inherit" }}>
            {enRiesgo}
          </p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd", color: "#666" }}>
            <th style={{ padding: "8px 4px" }}>Estudiante</th>
            <th style={{ padding: "8px 4px" }}>Empresa</th>
            <th style={{ padding: "8px 4px" }}>Último periodo</th>
            <th style={{ padding: "8px 4px" }}>Estado</th>
            <th style={{ padding: "8px 4px" }}>Avance</th>
            <th style={{ padding: "8px 4px" }}></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.usuario_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "10px 4px" }}>
                <div style={{ fontWeight: 500 }}>{f.nombre}</div>
                <div style={{ color: "#888", fontSize: 12 }}>{f.correo}</div>
              </td>
              <td style={{ padding: "10px 4px" }}>{f.nombre_empresa ?? "-"}</td>
              <td style={{ padding: "10px 4px" }}>{f.ultimo_periodo ?? "-"}</td>
              <td style={{ padding: "10px 4px" }}>
                <EstadoBadge estado={f.ultimo_estado} />
              </td>
              <td style={{ padding: "10px 4px", minWidth: 140 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${f.avance_global_promedio}%`,
                        background: f.avance_global_promedio < 30 ? "#d9534f" : "#3b82f6",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#666", width: 34 }}>{f.avance_global_promedio}%</span>
                </div>
              </td>
              <td style={{ padding: "10px 4px" }}>
                <Link href={`/admin/${f.usuario_id}`} style={{ fontSize: 13, color: "#2563eb" }}>
                  Ver detalle →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filas.length === 0 && (
        <p style={{ color: "#888", marginTop: 24 }}>Aún no hay estudiantes registrados.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { ShieldCheck, LogOut, ArrowRight } from "lucide-react";
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
      <span className="rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success">
        Al día
      </span>
    );
  }
  if (estado === "borrador") {
    return (
      <span className="rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning">
        Pendiente de entregar
      </span>
    );
  }
  return (
    <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger">
      Sin seguimientos
    </span>
  );
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const { data: estudiantes, error } = await supabase
    .from("vista_avance_estudiantes")
    .select("*")
    .order("avance_global_promedio", { ascending: true });

  if (error) {
    return <p className="p-8 text-danger">Error al cargar los estudiantes: {error.message}</p>;
  }

  const filas = (estudiantes ?? []) as FilaEstudiante[];
  const enRiesgo = filas.filter((f) => f.avance_global_promedio < 30).length;
  const pendientes = filas.filter((f) => f.ultimo_estado !== "generado").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck size={19} className="text-accent" />
              <h1 className="text-[15px] font-medium">Panel de seguimiento — Practicantes</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vista general del avance de cada estudiante según su último seguimiento mensual.
            </p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Estudiantes</p>
            <p className="text-2xl font-semibold">{filas.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Con seguimiento pendiente</p>
            <p className="text-2xl font-semibold">{pendientes}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Avance {"<"} 30%</p>
            <p className={`text-2xl font-semibold ${enRiesgo > 0 ? "text-danger" : ""}`}>{enRiesgo}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-700 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Estudiante</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Último periodo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Avance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.usuario_id} className="border-b border-gray-100 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <td className="px-4 py-3">
                    <div className="font-medium">{f.nombre}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">{f.correo}</div>
                  </td>
                  <td className="px-4 py-3">{f.nombre_empresa ?? "-"}</td>
                  <td className="px-4 py-3">{f.ultimo_periodo ?? "-"}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={f.ultimo_estado} />
                  </td>
                  <td className="min-w-[140px] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-neutral-700">
                        <div
                          className={`h-full rounded ${f.avance_global_promedio < 30 ? "bg-danger" : "bg-accent"}`}
                          style={{ width: `${f.avance_global_promedio}%` }}
                        />
                      </div>
                      <span className="w-9 text-xs text-gray-500 dark:text-gray-400">{f.avance_global_promedio}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/${f.usuario_id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      Ver detalle
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filas.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">Aún no hay estudiantes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

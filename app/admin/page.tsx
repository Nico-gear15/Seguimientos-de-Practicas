import Link from "next/link";
import { ShieldCheck, LogOut, ArrowRight, Users, AlertTriangle, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
        Al día
      </span>
    );
  }
  if (estado === "borrador") {
    return (
      <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
        Pendiente
      </span>
    );
  }
  return (
    <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 px-3 py-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
      Sin entregas
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
    return (
      <div className="p-8 text-rose-600 font-bold bg-rose-50 rounded-2xl m-8">
        Error al cargar los estudiantes: {error.message}
      </div>
    );
  }

  const filas = (estudiantes ?? []) as FilaEstudiante[];
  const enRiesgo = filas.filter((f) => f.avance_global_promedio < 30).length;
  const pendientes = filas.filter((f) => f.ultimo_estado !== "generado").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg shadow-brand-950/20">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-950 dark:text-white tracking-tight">
                Panel de Coordinación de Prácticas
              </h1>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Vista general del avance y entregables de todos los practicantes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Practicantes
              </p>
              <p className="text-3xl font-black text-brand-950 dark:text-white mt-1">
                {filas.length}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
              <Users size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Entregas Pendientes
              </p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {pendientes}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileText size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Avance {"<"} 30%
              </p>
              <p className={`text-3xl font-black mt-1 ${enRiesgo > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                {enRiesgo}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Último Periodo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Avance Global</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filas.map((f) => (
                  <tr key={f.usuario_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{f.nombre}</div>
                      <div className="text-[11px] text-slate-400">{f.correo}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {f.nombre_empresa ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold">
                      {f.ultimo_periodo ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={f.ultimo_estado} />
                    </td>
                    <td className="px-6 py-4 min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              f.avance_global_promedio < 30 ? "bg-rose-500" : "bg-brand-700 dark:bg-brand-500"
                            }`}
                            style={{ width: `${f.avance_global_promedio}%` }}
                          />
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-xs w-8">
                          {f.avance_global_promedio}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/${f.usuario_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-bold hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                      >
                        Detalle
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filas.length === 0 && (
            <p className="p-8 text-center text-xs font-semibold text-slate-400">
              Aún no hay estudiantes registrados en la plataforma.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, Building2, UserCheck, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Back Link + Theme */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline"
          >
            <ArrowLeft size={16} />
            Volver al Panel de Administración
          </Link>
          <ThemeToggle />
        </div>

        {/* Student Title Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-950 dark:text-white tracking-tight">
              {perfil.nombre}
            </h1>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
              {perfil.correo} · <strong className="text-slate-700 dark:text-slate-300">{perfil.programa_academico ?? "Programa no registrado"}</strong>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 text-xs font-bold w-fit">
            Semestre: {perfil.semestre ?? "N/A"}
          </span>
        </div>

        {/* Company & Boss details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building2 size={18} className="text-brand-700 dark:text-brand-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Información de la Empresa
              </h3>
            </div>
            {empresa ? (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {empresa.nombre_empresa}
                </p>
                <p className="text-xs text-slate-500">
                  NIT: <span className="font-semibold text-slate-700 dark:text-slate-300">{empresa.nit ?? "-"}</span> · Dirección: <span className="font-semibold text-slate-700 dark:text-slate-300">{empresa.direccion ?? "-"}</span>
                </p>
                {empresa.sector && <p className="text-xs text-slate-400">Sector: {empresa.sector}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Aún no ha diligenciado los datos de la empresa.</p>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <UserCheck size={18} className="text-brand-700 dark:text-brand-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Jefe Inmediato
              </h3>
            </div>
            {jefe ? (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {jefe.nombre}
                </p>
                <p className="text-xs text-slate-500">
                  Cargo: <span className="font-semibold text-slate-700 dark:text-slate-300">{jefe.cargo ?? "-"}</span>
                </p>
                <p className="text-xs text-slate-400">{jefe.correo ?? "-"}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Aún no ha diligenciado el jefe inmediato.</p>
            )}
          </div>
        </div>

        {/* Progress Month to Month Matrix */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-brand-950 dark:text-white">
            Avance mes a mes por actividad
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="min-w-[240px] px-6 py-4">Actividad</th>
                    {periodos.map((p) => (
                      <th key={p} className="px-4 py-4 text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {(actividades ?? []).map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white">{act.nombre}</span>
                        {!act.es_actividad_inicial && (
                          <div className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Adicional: {act.observacion_adicion}
                          </div>
                        )}
                      </td>
                      {periodos.map((p) => {
                        const valor = avancePorActividad.get(act.id)?.get(p);
                        return (
                          <td
                            key={p}
                            className={`px-4 py-4 text-center font-bold ${
                              valor === undefined ? "text-slate-300 dark:text-slate-700" : "text-brand-800 dark:text-brand-300"
                            }`}
                          >
                            {valor === undefined ? "—" : `${valor}%`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delivered Reports List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-brand-950 dark:text-white">
            Seguimientos Entregados
          </h2>
          <div className="space-y-3">
            {(seguimientos ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{s.periodo}</span>
                  {s.estado === "generado" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      Generado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      Borrador
                    </span>
                  )}
                </div>

                {s.estado === "generado" && s.pdf_path && (
                  <a
                    href={`/api/admin/estudiantes/${estudianteId}/pdf/${s.periodo}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow"
                  >
                    <FileDown size={14} />
                    Descargar PDF
                  </a>
                )}
              </div>
            ))}
            {(seguimientos ?? []).length === 0 && (
              <p className="p-6 text-center text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                Este estudiante aún no ha generado ningún seguimiento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  FileText,
  Calendar as CalendarIcon,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  Briefcase,
  FileUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/navigation/StudentShell";
import { DatosGeneralesForm } from "@/components/dashboard/DatosGeneralesForm";

function periodoActual() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const periodo = periodoActual();

  const [{ data: perfil }, { data: empresa }, { data: jefe }, { data: actividades }, { data: seguimientoMes }] =
    await Promise.all([
      supabase.from("perfiles").select("*").eq("id", user.id).single(),
      supabase.from("empresas").select("*").eq("usuario_id", user.id).maybeSingle(),
      supabase.from("jefes_inmediatos").select("*").eq("usuario_id", user.id).maybeSingle(),
      supabase
        .from("actividades")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("activa", true)
        .order("fecha_asignacion", { ascending: true }),
      supabase
        .from("seguimientos")
        .select("*, avances_mensuales(actividad_id, porcentaje_avance, comentario)")
        .eq("usuario_id", user.id)
        .eq("periodo", periodo)
        .maybeSingle(),
    ]);

  const { count: seguimientosGenerados } = await supabase
    .from("seguimientos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("estado", "generado");

  const datosGeneralesCompletos = !!empresa && !!jefe;

  const avancesDelMes = new Map<string, { porcentaje: number; comentario: string | null }>(
    (seguimientoMes?.avances_mensuales ?? []).map((a: any) => [
      a.actividad_id,
      { porcentaje: a.porcentaje_avance, comentario: a.comentario ?? null },
    ])
  );

  const actividadesConAvance = (actividades ?? []).map((actividad) => {
    const avance = avancesDelMes.get(actividad.id);
    return {
      actividad,
      porcentajeActual: avance?.porcentaje ?? 0,
      comentarioActual: avance?.comentario ?? null,
    };
  });

  const avanceGlobal = actividadesConAvance.length
    ? Math.round(
        actividadesConAvance.reduce((suma, a) => suma + a.porcentajeActual, 0) / actividadesConAvance.length
      )
    : 0;

  const horasEstimadas = Math.round((avanceGlobal * 300) / 100);

  return (
    <StudentShell
      title="Dashboard"
      nombreEstudiante={perfil?.nombre ?? "Estudiante"}
      correoEstudiante={perfil?.correo}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-900 dark:text-white">
            Hola, <span className="text-brand-700 dark:text-brand-400">{perfil?.nombre ?? "Estudiante"}</span>!
          </h1>

          {/* Pending submission alert */}
          {!datosGeneralesCompletos ? (
            <div className="mt-3 inline-flex items-center gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Antes de continuar, completa los datos de tu empresa y jefe inmediato.</span>
            </div>
          ) : seguimientoMes?.estado !== "generado" ? (
            <div className="mt-3 inline-flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-4 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>Tiene una entrega pendiente este mes</span>
            </div>
          ) : null}
        </div>

        {!datosGeneralesCompletos ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-900 dark:text-white mb-4">
              Completa tu Información General
            </h2>
            <DatosGeneralesForm perfil={perfil!} empresa={empresa ?? null} jefe={jefe ?? null} />
          </div>
        ) : (
          <>
            {/* Top Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Progress Card (2 cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-7 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-900 dark:text-white tracking-tight">
                    Avance Total de Prácticas
                  </h2>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                    Progreso hacia el cumplimiento de horas requeridas.
                  </p>
                </div>

                <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                  {/* Big Progress Box */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-4 border-brand-800 dark:border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-center">
                    <span className="text-3xl font-black text-brand-900 dark:text-white">
                      {avanceGlobal}%
                    </span>
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-400 mt-1">
                      Completado
                    </span>
                  </div>

                  {/* Stat Box 1 */}
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                      HORAS REGISTRADAS
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {horasEstimadas}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ 300 hrs</span>
                    </div>
                  </div>

                  {/* Stat Box 2 */}
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                      ENTREGABLES
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {seguimientosGenerados ?? 0}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ 5 entregados</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Empresa: <strong className="text-slate-700 dark:text-slate-300">{empresa.nombre_empresa}</strong></span>
                  <span>Jefe: <strong className="text-slate-700 dark:text-slate-300">{jefe.nombre}</strong></span>
                </div>
              </div>

              {/* Right Column Cards */}
              <div className="space-y-5 flex flex-col justify-between">
                {/* Indigo Solid Card: Reporte Mensual */}
                <div className="p-6 rounded-2xl bg-brand-900 text-white shadow-lg shadow-brand-950/20 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                    <FileText size={100} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold leading-snug">Reporte Mensual</h3>
                    <p className="text-xs text-brand-100/80 mt-1.5 leading-relaxed">
                      Genera el documento consolidado de tus actividades del mes para revisión.
                    </p>
                  </div>
                  <Link
                    href="/reportes"
                    className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-white text-brand-900 font-bold py-2.5 text-xs shadow hover:bg-brand-50 transition-colors"
                  >
                    <FileUp size={15} />
                    Generar Reporte del Mes
                  </Link>
                </div>

                {/* Blue Accent Card: Recordatorio */}
                <div className="p-6 rounded-2xl bg-brand-700 text-white shadow-md shadow-brand-900/10 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 flex-shrink-0">
                    <CalendarIcon size={22} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200">
                      RECORDATORIO IMPORTANTE
                    </span>
                    <p className="text-xs font-medium text-white mt-1 leading-relaxed">
                      Próximo Seguimiento Mensual: Fin de mes. No olvides subirlo al Aula Virtual.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Actividades Recientes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-900 dark:text-white tracking-tight">
                  Actividades Recientes
                </h2>
                <Link
                  href="/actividades"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline"
                >
                  Ver todas
                  <ArrowRight size={14} />
                </Link>
              </div>

              {actividadesConAvance.length === 0 ? (
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 py-4">
                  Aún no tienes actividades registradas. Ve a la sección de Actividades para comenzar.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {actividadesConAvance.slice(0, 3).map(({ actividad, porcentajeActual }, idx) => {
                    const statusConfig =
                      porcentajeActual === 100
                        ? { label: "COMPLETADO", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300", icon: CheckCircle2 }
                        : porcentajeActual > 0
                        ? { label: "EN PROGRESO", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300", icon: Users }
                        : { label: "POR INICIAR", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300", icon: Clock };

                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={actividad.id}
                        className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
                            <StatusIcon size={18} />
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                            {actividad.nombre}
                          </h4>
                        </div>

                        <div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 mb-2">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${porcentajeActual}%` }}
                            />
                          </div>
                          <div className="flex justify-end text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                            {porcentajeActual}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudentShell>
  );
}

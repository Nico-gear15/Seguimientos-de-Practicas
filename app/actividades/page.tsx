import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/navigation/StudentShell";
import { ActividadForm } from "@/components/dashboard/ActividadForm";
import { SeguimientoMensual } from "@/components/dashboard/SeguimientoMensual";
import { SelectorPeriodo } from "@/components/dashboard/SelectorPeriodo";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function periodoActual() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
}

function normalizarPeriodo(periodo?: string | null) {
  if (!periodo) return null;
  const match = /^\d{4}-(0[1-9]|1[0-2])$/.exec(periodo);
  return match ? periodo : null;
}

function periodoLabel(periodo: string) {
  const [anio, mes] = periodo.split("-").map(Number);
  const indice = (mes ?? 1) - 1;
  return `${MESES[indice] ?? "mes"} de ${anio}`;
}

function opcionesPeriodos() {
  const opciones: Array<{ value: string; label: string }> = [];
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 6, 1);
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 6, 1);

  for (let fecha = new Date(inicio); fecha <= fin; fecha.setMonth(fecha.getMonth() + 1)) {
    const value = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    opciones.push({ value, label: periodoLabel(value) });
  }

  return opciones;
}

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams?: Promise<{ periodo?: string | string[] }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const periodoSeleccionado = normalizarPeriodo(
    Array.isArray(params?.periodo) ? params.periodo[0] : params?.periodo
  );
  const periodo = periodoSeleccionado ?? periodoActual();
  const label = periodoLabel(periodo);

  const [{ data: perfil }, { data: actividades }, { data: seguimientoMes }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("id", user.id).single(),
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

  const { data: seguimientosAnteriores } = await supabase
    .from("seguimientos")
    .select("id, periodo, avances_mensuales(actividad_id, porcentaje_avance)")
    .eq("usuario_id", user.id)
    .lt("periodo", periodo);

  const avanceMinimoPorActividad = new Map<string, number>();
  for (const s of seguimientosAnteriores ?? []) {
    for (const av of (s as any).avances_mensuales ?? []) {
      const prevMax = avanceMinimoPorActividad.get(av.actividad_id) ?? 0;
      avanceMinimoPorActividad.set(av.actividad_id, Math.max(prevMax, Number(av.porcentaje_avance)));
    }
  }

  const avancesDelMes = new Map<string, { porcentaje: number; comentario: string | null }>(
    (seguimientoMes?.avances_mensuales ?? []).map((a: any) => [
      a.actividad_id,
      { porcentaje: a.porcentaje_avance, comentario: a.comentario ?? null },
    ])
  );

  const actividadesConAvance = (actividades ?? []).map((actividad) => {
    const avance = avancesDelMes.get(actividad.id);
    const minPermitido = avanceMinimoPorActividad.get(actividad.id) ?? 0;
    return {
      actividad,
      porcentajeMinimo: minPermitido,
      porcentajeActual: avance?.porcentaje ?? minPermitido,
      comentarioActual: avance?.comentario ?? null,
    };
  });

  const completadasCount = actividadesConAvance.filter((a) => a.porcentajeActual === 100).length;
  const enProcesoCount = actividadesConAvance.filter((a) => a.porcentajeActual > 0 && a.porcentajeActual < 100).length;

  const avanceGlobal = actividadesConAvance.length
    ? Math.round(
        actividadesConAvance.reduce((suma, a) => suma + a.porcentajeActual, 0) / actividadesConAvance.length
      )
    : 0;

  const horasAcumuladas = Math.round((avanceGlobal * 126) / 100);

  return (
    <StudentShell
      title="Gestión de Actividades"
      nombreEstudiante={perfil?.nombre ?? "Estudiante"}
      correoEstudiante={perfil?.correo}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-900 dark:text-white">
              Gestión de Actividades Mensuales
            </h1>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
              Registra y actualiza el progreso de tus tareas asignadas.
            </p>
          </div>

          {/* Month Selector Dropdown (Actualización Automática) */}
          <SelectorPeriodo
            opciones={opcionesPeriodos()}
            periodoActual={periodo}
            basePath="/actividades"
          />
        </div>

        {/* Main Grid matching Mockup 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Progreso Mensual (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-lg font-bold text-brand-900 dark:text-white tracking-tight">
                Progreso Mensual
              </h2>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                Resumen de avance total de horas y tareas para {label}.
              </p>
            </div>

            {/* Big Progress Stat */}
            <div className="py-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-black text-brand-900 dark:text-white">
                  {avanceGlobal}%
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {horasAcumuladas} / 126 hrs
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-800 dark:bg-brand-500 transition-all duration-500"
                  style={{ width: `${avanceGlobal}%` }}
                />
              </div>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Completadas
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {completadasCount}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  En Proceso
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {enProcesoCount}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Actividades (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-900 dark:text-white tracking-tight">
                Actividades
              </h2>
              <ActividadForm requiereObservacion={!!seguimientosGenerados} />
            </div>

            <SeguimientoMensual
              key={periodo}
              actividades={actividadesConAvance}
              periodo={periodo}
              periodoLabel={label}
              seguimientoGeneradoId={seguimientoMes?.estado === "generado" ? seguimientoMes.id : null}
            />
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

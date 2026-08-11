import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/navigation/StudentShell";
import { FileDown, CheckSquare } from "lucide-react";

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

export default async function ReportesPage({
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

  const pdfDownloadUrl = seguimientoMes?.id
    ? `/api/seguimientos/${seguimientoMes.id}/pdf`
    : null;

  return (
    <StudentShell
      title="Generación de Reportes"
      nombreEstudiante={perfil?.nombre ?? "Estudiante"}
      correoEstudiante={perfil?.correo}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-900 dark:text-white">
            Generación de Reporte Mensual
          </h1>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
            Revisa la vista previa de tu informe consolidado antes de descargarlo en formato PDF.
          </p>
        </div>

        {/* Grid matching Mockup 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Report Settings (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-brand-900 dark:text-white tracking-tight">
                Configuración del Reporte
              </h2>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                Configura tu informe mensual de seguimiento antes de generar el archivo PDF.
              </p>
            </div>

            <form method="get" className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Seleccionar Mes
                </label>
                <select
                  name="periodo"
                  defaultValue={periodo}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {opcionesPeriodos().map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 text-xs font-bold transition-colors"
              >
                Actualizar Vista Previa
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Configuración de Firmas
              </span>
              <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-700 accent-brand-700" />
                  <span>Incluir línea de firma del practicante</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-700 accent-brand-700" />
                  <span>Incluir línea de firma del jefe inmediato</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-700 accent-brand-700" />
                  <span>Incluir línea de firma del monitor académico</span>
                </label>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-2">
              {pdfDownloadUrl ? (
                <a
                  href={pdfDownloadUrl}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white py-3 text-xs font-bold shadow-lg shadow-brand-950/20 transition-all"
                >
                  <FileDown size={16} />
                  Descargar PDF
                </a>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Primero debes registrar los avances en la sección de Actividades para generar el PDF.
                  </p>
                  <a
                    href="/actividades"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white py-3 text-xs font-bold shadow"
                  >
                    Ir a Actividades
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Document Preview Sheet (2 cols) */}
          <div className="lg:col-span-2 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
            {/* Sheet Header */}
            <div className="text-center border-b-2 border-brand-800 pb-5">
              <h2 className="text-xl font-black text-brand-950 uppercase tracking-tight">
                Reporte Mensual de Seguimiento
              </h2>
              <p className="text-xs font-bold text-brand-800 mt-1">
                Prácticas Profesionales y Estancias Académicas — Periodo: {label}
              </p>
            </div>

            {/* General Info Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-600 w-1/3">Estudiante:</td>
                    <td className="p-3 font-semibold text-slate-900">{perfil?.nombre ?? "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 font-bold text-slate-600">Matrícula / Doc:</td>
                    <td className="p-3 font-semibold text-slate-900">{perfil?.documento ?? "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-600">Empresa / Institución:</td>
                    <td className="p-3 font-semibold text-slate-900">{empresa?.nombre_empresa ?? "-"}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-600">Jefe Directo:</td>
                    <td className="p-3 font-semibold text-slate-900">{jefe?.nombre ?? "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Activities Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-brand-50 text-brand-900 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-1/2">Actividad / Tarea</th>
                    <th className="p-3 text-center w-1/6">% Avance</th>
                    <th className="p-3 w-1/3">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {actividadesConAvance.map(({ actividad, porcentajeActual, comentarioActual }) => (
                    <tr key={actividad.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800">{actividad.nombre}</td>
                      <td className="p-3 text-center font-bold text-brand-800">{porcentajeActual}%</td>
                      <td className="p-3 text-slate-600 italic">
                        {comentarioActual ?? actividad.observacion_adicion ?? "Sin observaciones registrados."}
                      </td>
                    </tr>
                  ))}
                  {actividadesConAvance.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                        No hay actividades registradas para este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Lines Preview */}
            <div className="pt-10 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500">
              <div className="space-y-1">
                <div className="border-t border-slate-300 pt-2 font-bold text-slate-800">
                  Firma Practicante
                </div>
                <p>{perfil?.nombre}</p>
              </div>
              <div className="space-y-1">
                <div className="border-t border-slate-300 pt-2 font-bold text-slate-800">
                  Firma Jefe Directo
                </div>
                <p>{jefe?.nombre ?? "Jefe Inmediato"}</p>
              </div>
              <div className="space-y-1">
                <div className="border-t border-slate-300 pt-2 font-bold text-slate-800">
                  Monitor Universidad
                </div>
                <p>Coordinador de Prácticas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

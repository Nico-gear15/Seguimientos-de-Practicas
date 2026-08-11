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
          <div className="lg:col-span-2 bg-white text-slate-900 rounded-2xl border-2 border-slate-800 shadow-2xl p-6 space-y-4">
            {/* Main Header Title */}
            <div className="bg-brand-900 text-white p-3 rounded-lg text-center font-black text-xs uppercase tracking-tight">
              FORMATO SEGUIMIENTO DEL PLAN DE TRABAJO Y PROPUESTA DE MEJORA DE LA PRÁCTICA PROFESIONAL
            </div>

            {/* General Info Grid */}
            <div className="border border-slate-800 text-xs">
              <div className="flex border-b border-slate-800">
                <div className="w-1/3 bg-slate-100 p-2 font-bold uppercase border-r border-slate-800">
                  NOMBRE COMPLETO PRACTICANTE:
                </div>
                <div className="w-2/3 p-2 font-semibold">{perfil?.nombre ?? "-"}</div>
              </div>

              <div className="flex border-b border-slate-800">
                <div className="w-1/3 bg-slate-100 p-2 font-bold uppercase border-r border-slate-800">
                  NOMBRE COMPLETO TUTOR (JEFE INMEDIATO):
                </div>
                <div className="w-2/3 p-2 font-semibold">{jefe?.nombre ?? "-"}</div>
              </div>

              <div className="flex">
                <div className="w-1/6 bg-slate-100 p-2 font-bold uppercase border-r border-slate-800 flex items-center">
                  ORGANIZACIÓN
                </div>
                <div className="w-1/3 p-2 font-semibold border-r border-slate-800 flex items-center">
                  {empresa?.nombre_empresa ?? "-"}
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="flex border-b border-slate-800">
                    <div className="w-3/5 bg-slate-100 p-1.5 font-bold text-[10px] border-r border-slate-800">
                      FECHA DE SEGUIMIENTO DESDE MES N°
                    </div>
                    <div className="w-2/5 p-1.5 text-[10px] font-semibold">
                      {perfil?.fecha_inicio_practica ?? label}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-3/5 bg-slate-100 p-1.5 font-bold text-[10px] border-r border-slate-800">
                      FECHA DE SEGUIMIENTO HASTA MES FINAL
                    </div>
                    <div className="w-2/5 p-1.5 text-[10px] font-semibold">
                      {perfil?.fecha_fin_practica ?? label}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: AVANCE DE LA PROPUESTA DE MEJORA */}
            <div className="border border-slate-800 text-xs">
              <div className="bg-brand-100 text-brand-950 font-bold p-2 text-center text-xs uppercase border-b border-slate-800">
                AVANCE DE LA PROPUESTA DE MEJORA
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2 w-5/12 border-r border-slate-800">
                      Avance de las actividades de la propuesta de mejora de la práctica profesional
                    </th>
                    <th className="p-2 w-2/12 text-center border-r border-slate-800">% de cumplimiento</th>
                    <th className="p-2 w-5/12">Explique la evolución de cada fase de la propuesta de mejora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {actividadesConAvance
                    .filter((a) => !a.actividad.es_actividad_inicial)
                    .map(({ actividad, porcentajeActual, comentarioActual }) => (
                      <tr key={actividad.id}>
                        <td className="p-2 font-medium border-r border-slate-800">{actividad.nombre}</td>
                        <td className="p-2 text-center font-bold text-brand-900 border-r border-slate-800">
                          {porcentajeActual}%
                        </td>
                        <td className="p-2 text-slate-600 italic">
                          {comentarioActual ?? actividad.observacion_adicion ?? "En desarrollo."}
                        </td>
                      </tr>
                    ))}
                  {actividadesConAvance.filter((a) => !a.actividad.es_actividad_inicial).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-slate-400 italic">
                        No hay actividades registradas en la propuesta de mejora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN 2: SEGUIMIENTO DEL PLAN DE TRABAJO */}
            <div className="border border-slate-800 text-xs">
              <div className="bg-brand-100 text-brand-950 font-bold p-2 text-center text-xs uppercase border-b border-slate-800">
                SEGUIMIENTO DEL PLAN DE TRABAJO (OBJETIVOS DEL PLAN DE TRABAJO)
                <p className="text-[10px] font-normal italic text-slate-600 normal-case">
                  (Por favor diligenciar la columna "seguimiento" de acuerdo al PLAN DE TRABAJO)
                </p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2 w-5/12 border-r border-slate-800">
                      Seguimiento a las actividades de práctica profesional
                    </th>
                    <th className="p-2 w-2/12 text-center border-r border-slate-800">% de cumplimiento</th>
                    <th className="p-2 w-5/12">Observaciones y/o comentarios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {actividadesConAvance
                    .filter((a) => a.actividad.es_actividad_inicial)
                    .map(({ actividad, porcentajeActual, comentarioActual }) => (
                      <tr key={actividad.id}>
                        <td className="p-2 font-medium border-r border-slate-800">{actividad.nombre}</td>
                        <td className="p-2 text-center font-bold text-brand-900 border-r border-slate-800">
                          {porcentajeActual}%
                        </td>
                        <td className="p-2 text-slate-600 italic">
                          {comentarioActual ?? "Sin observaciones adicionales."}
                        </td>
                      </tr>
                    ))}
                  {actividadesConAvance.filter((a) => a.actividad.es_actividad_inicial).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-slate-400 italic">
                        No hay actividades iniciales en el plan de trabajo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Lines Preview */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-center text-[10px]">
              <div className="border border-slate-800 p-3 h-20 flex flex-col justify-end">
                <div className="border-t border-slate-600 pt-1 font-bold">Firma Practicante</div>
                <p className="text-slate-500 text-[9px]">{perfil?.nombre}</p>
              </div>
              <div className="border border-slate-800 p-3 h-20 flex flex-col justify-end">
                <div className="border-t border-slate-600 pt-1 font-bold">Firma Tutor (Jefe Inmediato)</div>
                <p className="text-slate-500 text-[9px]">{jefe?.nombre ?? "Jefe Inmediato"}</p>
              </div>
              <div className="border border-slate-800 p-3 h-20 flex flex-col justify-end">
                <div className="border-t border-slate-600 pt-1 font-bold">Firma Monitor Académico</div>
                <p className="text-slate-500 text-[9px]">Universidad El Bosque</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

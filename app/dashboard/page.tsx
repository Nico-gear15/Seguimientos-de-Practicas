import { redirect } from "next/navigation";
import { Briefcase, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DatosGeneralesForm } from "@/components/dashboard/DatosGeneralesForm";
import { ActividadForm } from "@/components/dashboard/ActividadForm";
import { SeguimientoMensual } from "@/components/dashboard/SeguimientoMensual";
import { cerrarSesion } from "@/app/dashboard/actions";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function periodoActual() {
  const ahora = new Date();
  const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  const label = `${MESES[ahora.getMonth()]} de ${ahora.getFullYear()}`;
  return { periodo, label };
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { periodo, label } = periodoActual();

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
        .select("*, avances_mensuales(actividad_id, porcentaje_avance)")
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

  const avancesDelMes = new Map<string, number>(
    (seguimientoMes?.avances_mensuales ?? []).map((a: any) => [a.actividad_id, a.porcentaje_avance])
  );

  const actividadesConAvance = (actividades ?? []).map((actividad) => ({
    actividad,
    porcentajeActual: avancesDelMes.get(actividad.id) ?? 0,
  }));

  const avanceGlobal = actividadesConAvance.length
    ? Math.round(
        actividadesConAvance.reduce((suma, a) => suma + a.porcentajeActual, 0) / actividadesConAvance.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={19} className="text-accent" />
            <span className="text-[15px] font-medium">Seguimiento de práctica</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-medium text-accent">
              {iniciales(perfil?.nombre ?? "?")}
            </div>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700"
              >
                <LogOut size={13} />
                Salir
              </button>
            </form>
          </div>
        </div>

        {!datosGeneralesCompletos ? (
          <div>
            <p className="mb-5 rounded-lg bg-warning-bg px-3.5 py-2.5 text-sm text-warning">
              Antes de continuar, completa los datos de tu empresa y de tu jefe inmediato.
            </p>
            <DatosGeneralesForm perfil={perfil!} empresa={empresa ?? null} jefe={jefe ?? null} />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Avance global</p>
                <p className="text-2xl font-semibold">{avanceGlobal}%</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Actividades activas</p>
                <p className="text-2xl font-semibold">{actividadesConAvance.length}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Seguimientos entregados</p>
                <p className="text-2xl font-semibold">{seguimientosGenerados ?? 0}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4">
              <p className="mb-3 text-sm font-medium">Datos generales</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="mb-0.5 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Estudiante</p>
                  <p>{perfil?.nombre}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Empresa</p>
                  <p>{empresa!.nombre_empresa}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Jefe inmediato</p>
                  <p>{jefe!.nombre}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-medium">Actividades asignadas</p>
                <ActividadForm requiereObservacion={!!seguimientosGenerados} />
              </div>

              {actividadesConAvance.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">Aún no tienes actividades registradas.</p>
              )}

              <div className="flex flex-col gap-2.5">
                {actividadesConAvance.map(({ actividad, porcentajeActual }) => (
                  <div key={actividad.id} className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3.5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{actividad.nombre}</span>
                      <span className="font-medium text-gray-500 dark:text-gray-400">{porcentajeActual}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded bg-gray-100 dark:bg-neutral-700">
                      <div
                        className="h-full rounded bg-accent"
                        style={{ width: `${porcentajeActual}%` }}
                      />
                    </div>
                    {!actividad.es_actividad_inicial && actividad.observacion_adicion && (
                      <div className="mt-2 flex gap-1.5 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs text-accent">
                        Actividad nueva: {actividad.observacion_adicion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <SeguimientoMensual
              actividades={actividadesConAvance}
              periodoLabel={label}
              seguimientoGeneradoId={seguimientoMes?.estado === "generado" ? seguimientoMes.id : null}
            />
          </div>
        )}
      </div>
    </div>
  );
}

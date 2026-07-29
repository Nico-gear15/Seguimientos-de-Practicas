import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
          <ArrowLeft size={14} />
          Volver al panel
        </Link>

        <h1 className="mb-0.5 text-lg font-semibold">{perfil.nombre}</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {perfil.correo} · {perfil.programa_academico ?? "Programa no registrado"}
        </p>

        <div className="mb-7 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
            <p className="mb-2 text-sm font-medium">Empresa</p>
            {empresa ? (
              <>
                <p className="text-sm">{empresa.nombre_empresa}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                  {empresa.nit ?? "-"} · {empresa.direccion ?? "-"}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Aún no diligenciado</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
            <p className="mb-2 text-sm font-medium">Jefe inmediato</p>
            {jefe ? (
              <>
                <p className="text-sm">
                  {jefe.nombre} · {jefe.cargo ?? "-"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">{jefe.correo ?? "-"}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">Aún no diligenciado</p>
            )}
          </div>
        </div>

        <h2 className="mb-2.5 text-sm font-medium">Avance mes a mes por actividad</h2>
        <div className="mb-7 overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-700 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="min-w-[220px] px-4 py-3 font-medium">Actividad</th>
                {periodos.map((p) => (
                  <th key={p} className="px-3 py-3 text-center font-medium">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(actividades ?? []).map((act) => (
                <tr key={act.id} className="border-b border-gray-100 dark:border-neutral-700 last:border-0">
                  <td className="px-4 py-3">
                    {act.nombre}
                    {!act.es_actividad_inicial && (
                      <div className="mt-0.5 text-xs text-warning">Agregada: {act.observacion_adicion}</div>
                    )}
                  </td>
                  {periodos.map((p) => {
                    const valor = avancePorActividad.get(act.id)?.get(p);
                    return (
                      <td
                        key={p}
                        className={`px-3 py-3 text-center ${valor === undefined ? "text-gray-300 dark:text-gray-600" : ""}`}
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

        <h2 className="mb-2.5 text-sm font-medium">Seguimientos entregados</h2>
        <div className="flex flex-col gap-2">
          {(seguimientos ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5"
            >
              <div className="text-sm">
                <span className="font-medium">{s.periodo}</span>{" "}
                <span className={s.estado === "generado" ? "text-xs text-success" : "text-xs text-warning"}>
                  {s.estado === "generado" ? "Generado" : "Borrador"}
                </span>
              </div>
              {s.estado === "generado" && s.pdf_path && (
                <a
                  href={`/api/admin/estudiantes/${estudianteId}/pdf/${s.periodo}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  <FileDown size={14} />
                  Descargar PDF
                </a>
              )}
            </div>
          ))}
          {(seguimientos ?? []).length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">Este estudiante aún no ha generado ningún seguimiento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

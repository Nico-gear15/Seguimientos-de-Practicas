"use client";

import { useActionState, useState } from "react";
import { FileDown, Save, CheckCircle2, Clock } from "lucide-react";
import { guardarAvanceMensual } from "@/app/dashboard/actions";
import type { Actividad } from "@/lib/types";

interface ActividadConAvance {
  actividad: Actividad;
  porcentajeActual: number;
  comentarioActual: string | null;
}

const estadoInicial = { error: null as string | null, seguimientoId: undefined as string | undefined };

export function SeguimientoMensual({
  actividades,
  periodo,
  periodoLabel,
  seguimientoGeneradoId,
}: {
  actividades: ActividadConAvance[];
  periodo: string;
  periodoLabel: string;
  /** Si el seguimiento del mes ya fue generado, aquí llega su id (para el link de descarga) */
  seguimientoGeneradoId: string | null;
}) {
  const [valores, setValores] = useState<Record<string, number>>(
    Object.fromEntries(actividades.map((a) => [a.actividad.id, a.porcentajeActual]))
  );

  const [estado, formAction, enviando] = useActionState(async (_prev: typeof estadoInicial, formData: FormData) => {
    const resultado = await guardarAvanceMensual(formData);
    return {
      error: resultado?.error ?? null,
      seguimientoId: resultado?.seguimientoId,
    };
  }, estadoInicial);

  const soloLectura = Boolean(seguimientoGeneradoId);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-brand-900 dark:text-white">
              Seguimiento de {periodoLabel}
            </h3>
            {seguimientoGeneradoId ? (
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Generado
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Borrador
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
            {soloLectura
              ? "Este seguimiento ya fue generado y se encuentra bloqueado para futuras ediciones."
              : "Actualiza el % de avance de cada actividad y guarda para conservar el registro del mes."}
          </p>
        </div>

        {seguimientoGeneradoId && (
          <a
            href={`/api/seguimientos/${seguimientoGeneradoId}/pdf`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white px-4 py-2 text-xs font-bold shadow-md shadow-brand-900/20 transition-all"
          >
            <FileDown size={15} />
            Descargar PDF
          </a>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="periodo" value={periodo} />

        {actividades.map(({ actividad, porcentajeActual, comentarioActual }, idx) => {
          const valActual = valores[actividad.id] ?? porcentajeActual;
          const refCode = `INT-${String(idx + 1).padStart(3, "0")}`;

          return (
            <div
              key={actividad.id}
              className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {actividad.nombre}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {valActual === 100 ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        Completado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 text-[10px] font-bold">
                        En progreso
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400">
                      Ref: ACT-{String(idx + 1).padStart(3, "0")}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-brand-900 dark:text-brand-400">
                  {valActual}%
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  name={`avance_${actividad.id}`}
                  min={0}
                  max={100}
                  step={5}
                  disabled={soloLectura}
                  defaultValue={porcentajeActual}
                  onChange={(e) =>
                    setValores((prev) => ({ ...prev, [actividad.id]: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-700 dark:accent-brand-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Comment Input */}
              <input
                type="text"
                name={`comentario_${actividad.id}`}
                placeholder="Escribe un comentario opcional sobre el avance de esta tarea..."
                defaultValue={comentarioActual ?? ""}
                disabled={soloLectura}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50"
              />
            </div>
          );
        })}

        {actividades.length === 0 && (
          <p className="text-xs font-medium text-slate-400 py-4 text-center">
            Aún no tienes actividades registradas para este periodo.
          </p>
        )}

        {estado.error && (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{estado.error}</p>
        )}

        {!soloLectura && actividades.length > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-brand-900/20 disabled:opacity-60 transition-all"
            >
              <Save size={16} />
              {enviando ? "Guardando..." : "Guardar avance mensual"}
            </button>
          </div>
        )}
      </form>

      {!soloLectura && estado.seguimientoId && (
        <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-900 dark:text-brand-200">
            ¡Avances guardados correctamente! Puedes generar el PDF ahora.
          </span>
          <a
            href={`/api/seguimientos/${estado.seguimientoId}/pdf`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white px-3.5 py-2 text-xs font-bold shadow"
          >
            <FileDown size={15} />
            Generar PDF de {periodoLabel}
          </a>
        </div>
      )}
    </div>
  );
}

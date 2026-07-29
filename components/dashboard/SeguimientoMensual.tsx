"use client";

import { useActionState, useState } from "react";
import { FileDown, Save } from "lucide-react";
import { guardarAvanceMensual } from "@/app/dashboard/actions";
import type { Actividad } from "@/lib/types";

interface ActividadConAvance {
  actividad: Actividad;
  porcentajeActual: number;
}

const estadoInicial = { error: null as string | null, seguimientoId: undefined as string | undefined };

export function SeguimientoMensual({
  actividades,
  periodoLabel,
  seguimientoGeneradoId,
}: {
  actividades: ActividadConAvance[];
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

  const soloLectura = !!seguimientoGeneradoId;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Seguimiento de {periodoLabel}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {soloLectura
              ? "Este seguimiento ya fue generado y no se puede editar."
              : "Actualiza el % de avance de cada actividad y guarda antes de generar el PDF."}
          </p>
        </div>
        {seguimientoGeneradoId && (
          <a
            href={`/api/seguimientos/${seguimientoGeneradoId}/pdf`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-50 dark:hover:bg-neutral-700"
          >
            <FileDown size={15} />
            Descargar PDF
          </a>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {actividades.map(({ actividad, porcentajeActual }) => (
          <div key={actividad.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{actividad.nombre}</span>
              <span className="font-medium text-gray-600 dark:text-gray-300 dark:text-gray-600">
                {valores[actividad.id] ?? porcentajeActual}%
              </span>
            </div>
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
              className="w-full accent-accent disabled:opacity-50"
            />
            <input
              type="text"
              name={`comentario_${actividad.id}`}
              placeholder="Comentario del avance (opcional)"
              disabled={soloLectura}
              className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
          </div>
        ))}

        {actividades.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">Agrega actividades para poder registrar su avance.</p>
        )}

        {estado.error && <p className="text-sm text-danger">{estado.error}</p>}

        {!soloLectura && actividades.length > 0 && (
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Save size={15} />
            {enviando ? "Guardando..." : "Guardar avance"}
          </button>
        )}
      </form>

      {!soloLectura && estado.seguimientoId && (
        <a
          href={`/api/seguimientos/${estado.seguimientoId}/pdf`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-50 dark:hover:bg-neutral-700"
        >
          <FileDown size={15} />
          Guardar y generar PDF de {periodoLabel}
        </a>
      )}
    </div>
  );
}

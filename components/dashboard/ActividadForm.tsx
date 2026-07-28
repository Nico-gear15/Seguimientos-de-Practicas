"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { agregarActividad } from "@/app/dashboard/actions";

const estadoInicial = { error: null as string | null };

export function ActividadForm({ requiereObservacion }: { requiereObservacion: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, formAction, enviando] = useActionState(async (_prev: typeof estadoInicial, formData: FormData) => {
    const resultado = await agregarActividad(formData);
    if (!resultado?.error) {
      setAbierto(false);
    }
    return { error: resultado?.error ?? null };
  }, estadoInicial);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Plus size={15} />
        Agregar actividad
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nueva actividad</span>
        <button type="button" onClick={() => setAbierto(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Nombre de la actividad</label>
        <input
          name="nombre"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Descripción (opcional)</label>
        <textarea
          name="descripcion"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {requiereObservacion && (
        <div>
          <label className="mb-1 block text-xs text-warning">
            Observación — explica por qué se agrega esta actividad nueva (obligatorio)
          </label>
          <textarea
            name="observacion"
            required
            rows={2}
            className="w-full rounded-lg border border-warning/40 bg-warning-bg/40 px-3 py-2 text-sm"
          />
        </div>
      )}

      {estado.error && <p className="text-sm text-danger">{estado.error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Guardando..." : "Guardar actividad"}
      </button>
    </form>
  );
}

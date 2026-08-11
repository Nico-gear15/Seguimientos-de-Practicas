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
        type="button"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white px-4 py-2 text-xs font-bold shadow-md shadow-brand-900/20 transition-all"
      >
        <Plus size={16} />
        Añadir Nueva Actividad
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-200 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-950/40 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-brand-900 dark:text-white">Nueva Actividad</span>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-400">
          Nombre de la actividad
        </label>
        <input
          name="nombre"
          required
          placeholder="Ej. Desarrollo de Módulo de Reportes"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-400">
          Descripción (obligatoria)
        </label>
        <textarea
          name="descripcion"
          required
          rows={2}
          placeholder="Detalla los objetivos y tareas asignadas..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      {requiereObservacion && (
        <div>
          <label className="mb-1 block text-xs font-bold text-amber-700 dark:text-amber-400">
            Observación — explica por qué se agrega esta actividad adicional (obligatorio)
          </label>
          <textarea
            name="observacion"
            required
            rows={2}
            className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {estado.error && <p className="text-xs font-bold text-rose-600">{estado.error}</p>}

      <div className="flex justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-brand-800 hover:bg-brand-900 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-60"
        >
          {enviando ? "Guardando..." : "Guardar actividad"}
        </button>
      </div>
    </form>
  );
}

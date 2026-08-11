"use client";

import { useRouter } from "next/navigation";

interface SelectorPeriodoProps {
  opciones: Array<{ value: string; label: string }>;
  periodoActual: string;
  basePath: string; // p. ej. "/actividades" o "/reportes"
  className?: string;
}

export function SelectorPeriodo({
  opciones,
  periodoActual,
  basePath,
  className = "",
}: SelectorPeriodoProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuevoPeriodo = e.target.value;
    router.push(`${basePath}?periodo=${nuevoPeriodo}`);
  }

  return (
    <select
      value={periodoActual}
      onChange={handleChange}
      className={`rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer transition-all ${className}`}
    >
      {opciones.map((opcion) => (
        <option key={opcion.value} value={opcion.value}>
          {opcion.label}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [oscuro, setOscuro] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    setOscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const nuevoValor = !oscuro;
    setOscuro(nuevoValor);
    document.documentElement.classList.toggle("dark", nuevoValor);
    localStorage.setItem("theme", nuevoValor ? "dark" : "light");
  }

  if (!montado) {
    return <div className={className ?? "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 opacity-50"} />;
  }

  return (
    <button
      onClick={alternar}
      type="button"
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={
        className ??
        "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
      }
    >
      {oscuro ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600 dark:text-slate-300" />}
    </button>
  );
}

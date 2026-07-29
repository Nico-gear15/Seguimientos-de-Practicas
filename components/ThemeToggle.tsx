"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
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

  // Evita un parpadeo mostrando el ícono equivocado antes de saber
  // el tema real (que se decide en el script inline del layout).
  if (!montado) {
    return <div className="fixed right-4 top-4 z-50 h-9 w-9" />;
  }

  return (
    <button
      onClick={alternar}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
    >
      {oscuro ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

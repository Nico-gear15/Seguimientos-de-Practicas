"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Calendar, ClipboardList, User, FileText, CheckCircle2, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  title?: string;
}

const NOTIFICACIONES_MOCK = [
  {
    id: "1",
    titulo: "Seguimiento Mensual Pendiente",
    descripcion: "Recuerda actualizar el porcentaje de avance de tus actividades para el mes en curso.",
    href: "/actividades",
    linkTexto: "Ir a Actividades",
    icono: ClipboardList,
    tipo: "warning",
    tiempo: "Hace 10 min",
  },
  {
    id: "2",
    titulo: "Información de Empresa y Jefe",
    descripcion: "Verifica que los datos de tu empresa y jefe inmediato estén completos para la emisión de reportes.",
    href: "/perfil",
    linkTexto: "Revisar Perfil",
    icono: User,
    tipo: "info",
    tiempo: "Hace 1 hora",
  },
  {
    id: "3",
    titulo: "Reporte PDF Disponible",
    descripcion: "Ya puedes generar y descargar la vista previa de tus reportes consolidados.",
    href: "/reportes",
    linkTexto: "Ver Reportes",
    icono: FileText,
    tipo: "success",
    tiempo: "Hoy",
  },
];

export function Header({ title = "Plataforma de Prácticas" }: HeaderProps) {
  const [abierto, setAbierto] = useState(false);
  const [notis, setNotis] = useState(NOTIFICACIONES_MOCK);
  const [leidas, setLeidas] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fechaActual = new Date().toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
  });

  // Cerrar al hacer clic fuera del menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMenu() {
    setAbierto((prev) => !prev);
    setLeidas(true);
  }

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div>
        <h2 className="text-base font-bold text-brand-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Widget de Fecha */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar size={15} className="text-brand-600 dark:text-brand-400" />
          <span>{fechaActual}</span>
        </div>

        {/* Notificaciones Bell + Popover */}
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Notificaciones"
            title="Notificaciones y avisos"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Bell size={17} />
            {!leidas && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Menú Desplegable (Popover) */}
          {abierto && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 p-4 space-y-3 transition-all animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-brand-700 dark:text-brand-400" />
                  <h3 className="text-xs font-black text-brand-950 dark:text-white uppercase tracking-wider">
                    Centro de Notificaciones
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notis.map((n) => {
                  const IconComponent = n.icono;
                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
                            <IconComponent size={14} />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {n.titulo}
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {n.tiempo}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {n.descripcion}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <Link
                          href={n.href}
                          onClick={() => setAbierto(false)}
                          className="text-[11px] font-extrabold text-brand-700 dark:text-brand-400 hover:underline"
                        >
                          {n.linkTexto} →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400">
                  Todas las notificaciones están al día
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

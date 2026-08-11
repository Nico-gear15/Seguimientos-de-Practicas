"use client";

import { Bell, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Internship Platform" }: HeaderProps) {
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
  });

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div>
        <h2 className="text-base font-bold text-brand-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Calendar widget */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar size={15} className="text-brand-600 dark:text-brand-400" />
          <span>{fechaActual}</span>
        </div>

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Bell size={17} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

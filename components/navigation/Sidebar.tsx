"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ClipboardList,
  User,
  FileBarChart,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { cerrarSesion } from "@/app/dashboard/actions";

interface SidebarProps {
  nombreEstudiante?: string;
  correoEstudiante?: string;
}

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Actividades", href: "/actividades", icon: ClipboardList },
  { name: "Perfil", href: "/perfil", icon: User },
  { name: "Reportes", href: "/reportes", icon: FileBarChart },
];

function iniciales(nombre?: string) {
  if (!nombre) return "E";
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ nombreEstudiante = "Estudiante", correoEstudiante }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between min-h-screen transition-colors">
      <div>
        {/* Brand Header (Clicable hacia /dashboard) */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-85 transition-opacity group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white shadow-md shadow-brand-900/20 group-hover:scale-105 transition-transform">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-brand-900 dark:text-white leading-tight">
                Portal de Prácticas
              </h1>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Seguimiento Académico
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm border-r-4 border-brand-700"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon
                  size={19}
                  className={isActive ? "text-brand-700 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile footer (Clicable hacia /perfil) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <Link
            href="/perfil"
            className="flex items-center gap-3 overflow-hidden group hover:opacity-85 transition-opacity min-w-0"
            title="Ir a mi perfil"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-xs dark:bg-brand-900/80 dark:text-brand-200 group-hover:ring-2 group-hover:ring-brand-500 transition-all">
              {iniciales(nombreEstudiante)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                {nombreEstudiante}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {correoEstudiante ?? "Estudiante"}
              </p>
            </div>
          </Link>
          <form action={cerrarSesion}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

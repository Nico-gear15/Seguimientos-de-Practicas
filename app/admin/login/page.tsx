"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LoaderCircle, User, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const cargandoTotal = cargando || isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
    });

    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar sesión");
      return;
    }

    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-brand-950/10 space-y-6">
        {/* Admin Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg shadow-brand-950/30">
            <ShieldCheck size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-950 dark:text-white">
              Panel de Administración
            </h1>
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mt-0.5">
              Coordinación de Prácticas Profesionales
            </p>
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 pt-1">
            Acceso exclusivo para coordinadores y supervisores de práctica.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Usuario Coordinador
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                required
                placeholder="admin"
                disabled={cargandoTotal}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                disabled={cargandoTotal}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargandoTotal}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 hover:bg-brand-950 text-white py-3 text-xs font-bold shadow-lg shadow-brand-900/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
          >
            {cargandoTotal ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              "Ingresar al Panel"
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">
            ¿Eres practicante?{" "}
            <a href="/login" className="font-bold text-brand-700 dark:text-brand-400 hover:underline">
              Iniciar Sesión de Estudiante
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

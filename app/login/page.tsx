"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LoaderCircle, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const cargandoTotal = cargando || isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error: errLogin } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    setCargando(false);

    if (errLogin) {
      setError(
        errLogin.message.includes("Invalid login credentials")
          ? "Correo o contraseña incorrectos"
          : errLogin.message
      );
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-brand-950/10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 text-white shadow-lg shadow-brand-900/30">
            <GraduationCap size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-950 dark:text-white">
              Internship Portal
            </h1>
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mt-0.5">
              Academic Milestone Tracker
            </p>
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 pt-1">
            Ingresa tus credenciales para acceder a tu seguimiento de prácticas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="username"
                required
                placeholder="estudiante@universidad.edu.co"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white py-3 text-xs font-bold shadow-lg shadow-brand-900/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
          >
            {cargandoTotal ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">
            ¿Eres coordinador?{" "}
            <a href="/admin/login" className="font-bold text-brand-700 dark:text-brand-400 hover:underline">
              Acceso Administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

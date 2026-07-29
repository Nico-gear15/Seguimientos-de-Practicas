"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

    const { data, error: errLogin } = await supabase.auth.signInWithPassword({
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

    const usuario = data?.user;

    if (usuario) {
      const { data: perfil } = await supabase.from("perfiles").select("nombre, documento, programa_academico, semestre").eq("id", usuario.id).maybeSingle();

      const perfilCompleto = Boolean(
        perfil?.nombre?.trim() &&
          perfil?.documento?.trim() &&
          perfil?.programa_academico?.trim() &&
          perfil?.semestre?.trim()
      );

      startTransition(() => {
        router.push(perfilCompleto ? "/dashboard" : "/registro");
        router.refresh();
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Briefcase size={19} className="text-accent" />
          <span className="text-[15px] font-medium">Seguimiento de práctica</span>
        </div>

        <h1 className="mb-1 text-lg font-semibold">Iniciar sesión</h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Ingresa para ver tu seguimiento de práctica.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="username"
              required
              disabled={cargandoTotal}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              required
              disabled={cargandoTotal}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={cargandoTotal}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargandoTotal ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-accent">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

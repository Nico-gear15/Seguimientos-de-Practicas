"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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

    router.push("/dashboard");
    router.refresh();
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
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 rounded-lg bg-accent py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
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

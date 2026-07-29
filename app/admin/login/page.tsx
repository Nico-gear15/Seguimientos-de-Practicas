"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LoaderCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck size={19} className="text-accent" />
          <span className="text-[15px] font-medium">Panel de administración</span>
        </div>

        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Acceso exclusivo para coordinadores.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
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
      </div>
    </div>
  );
}

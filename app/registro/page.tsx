"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    correo: "",
    contrasena: "",
    programa_academico: "",
    semestre: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function actualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setCargando(true);

    const { data, error: errSignUp } = await supabase.auth.signUp({
      email: form.correo,
      password: form.contrasena,
      options: {
        data: {
          nombre: form.nombre,
          documento: form.documento,
          programa_academico: form.programa_academico,
          semestre: form.semestre,
        },
      },
    });

    setCargando(false);

    if (errSignUp) {
      setError(errSignUp.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMensaje("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Briefcase size={19} className="text-accent" />
          <span className="text-[15px] font-medium">Seguimiento de práctica</span>
        </div>

        <h1 className="mb-1 text-lg font-semibold">Crear cuenta</h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Regístrate para empezar a diligenciar tu seguimiento de práctica.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Campo label="Nombre completo" value={form.nombre} onChange={(v) => actualizar("nombre", v)} required />
          <Campo label="Documento de identidad" value={form.documento} onChange={(v) => actualizar("documento", v)} />
          <div className="flex gap-3">
            <div className="flex-1">
              <Campo
                label="Programa académico"
                value={form.programa_academico}
                onChange={(v) => actualizar("programa_academico", v)}
              />
            </div>
            <div className="w-24">
              <Campo label="Semestre" value={form.semestre} onChange={(v) => actualizar("semestre", v)} />
            </div>
          </div>
          <Campo
            label="Correo"
            type="email"
            value={form.correo}
            onChange={(v) => actualizar("correo", v)}
            required
            autoComplete="username"
          />
          <Campo
            label="Contraseña"
            type="password"
            value={form.contrasena}
            onChange={(v) => actualizar("contrasena", v)}
            required
            autoComplete="new-password"
            minLength={6}
          />

          {error && <p className="text-sm text-danger">{error}</p>}
          {mensaje && <p className="text-sm text-success">{mensaje}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 rounded-lg bg-accent py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 px-3 py-2 text-sm"
      />
    </div>
  );
}

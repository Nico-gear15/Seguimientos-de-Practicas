"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      // La cuenta quedó activa de inmediato (confirmación de correo desactivada)
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Requiere confirmar el correo antes de poder iniciar sesión
    setMensaje("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Crear cuenta</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>
        Regístrate para empezar a diligenciar tu seguimiento de práctica.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Campo label="Nombre completo" value={form.nombre} onChange={(v) => actualizar("nombre", v)} required />
        <Campo label="Documento de identidad" value={form.documento} onChange={(v) => actualizar("documento", v)} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Campo label="Programa académico" value={form.programa_academico} onChange={(v) => actualizar("programa_academico", v)} />
          </div>
          <div style={{ width: 100 }}>
            <Campo label="Semestre" value={form.semestre} onChange={(v) => actualizar("semestre", v)} />
          </div>
        </div>
        <Campo label="Correo" type="email" value={form.correo} onChange={(v) => actualizar("correo", v)} required autoComplete="username" />
        <Campo label="Contraseña" type="password" value={form.contrasena} onChange={(v) => actualizar("contrasena", v)} required autoComplete="new-password" minLength={6} />

        {error && <p style={{ color: "#b02a2a", fontSize: 13, margin: 0 }}>{error}</p>}
        {mensaje && <p style={{ color: "#1e7e34", fontSize: 13, margin: 0 }}>{mensaje}</p>}

        <button
          type="submit"
          disabled={cargando}
          style={{
            marginTop: 8,
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: cargando ? "default" : "pointer",
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ fontSize: 13, color: "#666", marginTop: 16 }}>
        ¿Ya tienes cuenta? <Link href="/login" style={{ color: "#2563eb" }}>Inicia sesión</Link>
      </p>
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
      <label style={{ fontSize: 13, color: "#444", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <div style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Iniciar sesión</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>
        Ingresa para ver y actualizar tu seguimiento de práctica.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, color: "#444", display: "block", marginBottom: 4 }}>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="username"
            required
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#444", display: "block", marginBottom: 4 }}>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            required
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        {error && <p style={{ color: "#b02a2a", fontSize: 13, margin: 0 }}>{error}</p>}

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
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p style={{ fontSize: 13, color: "#666", marginTop: 16 }}>
        ¿No tienes cuenta? <Link href="/registro" style={{ color: "#2563eb" }}>Regístrate</Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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

    router.push("/admin");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Panel de administración</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>
        Acceso exclusivo para coordinadores.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, color: "#444", display: "block", marginBottom: 4 }}>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#444", display: "block", marginBottom: 4 }}>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 }}
            required
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
    </div>
  );
}

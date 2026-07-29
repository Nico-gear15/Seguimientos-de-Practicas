"use client";

import { useState } from "react";
import { guardarDatosGenerales } from "@/app/dashboard/actions";
import type { Empresa, JefeInmediato, Perfil } from "@/lib/types";

const PROGRAMAS_INGENIERIA = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Ingeniería Electrónica",
  "Ingeniería Ambiental",
  "Bioingeniería",
  "Ingeniería Robótica",
];

const campo = "mb-3";
const label = "mb-1 block text-xs text-gray-500 dark:text-gray-400";
const input = "w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100";

export function DatosGeneralesForm({
  perfil,
  empresa,
  jefe,
}: {
  perfil: Perfil;
  empresa: Empresa | null;
  jefe: JefeInmediato | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    // Quick client-side validation: documento/telefonos mínimo 5 dígitos
    const documento = String(fd.get("documento") ?? "").replace(/\D/g, "").slice(0, 11);
    const telefono = String(fd.get("telefono") ?? "").replace(/\D/g, "").slice(0, 11);
    const empresaTelefono = String(fd.get("empresa_telefono") ?? "").replace(/\D/g, "").slice(0, 11);
    const jefeTelefono = String(fd.get("jefe_telefono") ?? "").replace(/\D/g, "").slice(0, 11);

    if (documento && documento.length < 5) {
      setError("El documento debe tener al menos 5 dígitos");
      setLoading(false);
      return;
    }

    const telefonoChecks = [telefono, empresaTelefono, jefeTelefono].filter(Boolean);
    for (const t of telefonoChecks) {
      if (t.length < 5) {
        setError("Los teléfonos deben tener al menos 5 dígitos");
        setLoading(false);
        return;
      }
    }

    // submit to server action
    try {
      const res = await guardarDatosGenerales(fd as any);
      // Server action currently redirects on success; if it returns, clear loading
      setLoading(false);
      return res;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <h2 className="mb-3 text-sm font-medium">Datos del estudiante</h2>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Nombre completo</label>
            <input name="nombre" defaultValue={perfil.nombre ?? ""} required className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Documento</label>
            <input
              name="documento"
              defaultValue={perfil.documento ?? ""}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              title="Solo números, máximo 11 caracteres"
              className={input}
            />
          </div>
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Programa académico</label>
            <select name="programa_academico" defaultValue={perfil.programa_academico ?? ""} required className={input}>
              <option value="">Selecciona un programa</option>
              {PROGRAMAS_INGENIERIA.map((programa) => (
                <option key={programa} value={programa}>
                  {programa}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className={label}>Semestre</label>
            <input name="semestre" defaultValue={perfil.semestre ?? ""} required className={input} />
          </div>
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Teléfono</label>
            <input
              name="telefono"
              defaultValue={perfil.telefono ?? ""}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              title="Solo números, máximo 11 caracteres"
              className={input}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={label}>Inicio de práctica</label>
            <input type="date" name="fecha_inicio_practica" defaultValue={perfil.fecha_inicio_practica ?? ""} className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Fin de práctica</label>
            <input type="date" name="fecha_fin_practica" defaultValue={perfil.fecha_fin_practica ?? ""} className={input} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <h2 className="mb-3 text-sm font-medium">Datos de la empresa</h2>
        <div className={campo}>
          <label className={label}>Nombre de la empresa</label>
          <input name="nombre_empresa" defaultValue={empresa?.nombre_empresa ?? ""} required className={input} />
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>NIT</label>
            <input name="nit" defaultValue={empresa?.nit ?? ""} className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Sector</label>
            <input name="sector" defaultValue={empresa?.sector ?? ""} className={input} />
          </div>
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Dirección</label>
            <input name="direccion" defaultValue={empresa?.direccion ?? ""} className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Teléfono</label>
            <input
              name="empresa_telefono"
              defaultValue={empresa?.telefono ?? ""}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              title="Solo números, máximo 11 caracteres"
              className={input}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <h2 className="mb-3 text-sm font-medium">Jefe inmediato</h2>
        <div className={campo}>
          <label className={label}>Nombre</label>
          <input name="jefe_nombre" defaultValue={jefe?.nombre ?? ""} required className={input} />
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Cargo</label>
            <input name="jefe_cargo" defaultValue={jefe?.cargo ?? ""} className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Teléfono</label>
            <input
              name="jefe_telefono"
              defaultValue={jefe?.telefono ?? ""}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              title="Solo números, máximo 11 caracteres"
              className={input}
            />
          </div>
        </div>
        <div>
          <label className={label}>Correo</label>
          <input name="jefe_correo" type="email" defaultValue={jefe?.correo ?? ""} className={input} />
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar datos generales"}
      </button>
    </form>
  );
}

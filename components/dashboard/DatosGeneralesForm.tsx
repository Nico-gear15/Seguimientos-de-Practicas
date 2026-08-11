"use client";

import { useState } from "react";
import { GraduationCap, Building2, UserCheck, Save, CheckCircle } from "lucide-react";
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

const labelClass = "mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

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

    try {
      await guardarDatosGenerales(fd as any);
      setSuccess("¡Datos actualizados con éxito!");
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Top Bar Action */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-brand-900 dark:text-white">
            Configuración de Perfil
          </h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Gestione sus datos personales y la información de su práctica profesional actual.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-brand-900/20 disabled:opacity-60 transition-all"
        >
          <Save size={16} />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* 3 Columns Layout matching Mockup 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Card 1: Estudiante */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
                <GraduationCap size={18} />
              </div>
              <h3 className="text-sm font-extrabold text-brand-900 dark:text-white">
                1. Estudiante
              </h3>
            </div>

            <div>
              <label className={labelClass}>Nombre Completo</label>
              <input name="nombre" defaultValue={perfil.nombre ?? ""} required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>ID Estudiantil (Documento)</label>
              <input
                name="documento"
                defaultValue={perfil.documento ?? ""}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Carrera / Programa</label>
              <select name="programa_academico" defaultValue={perfil.programa_academico ?? ""} required className={inputClass}>
                <option value="">Selecciona un programa</option>
                {PROGRAMAS_INGENIERIA.map((programa) => (
                  <option key={programa} value={programa}>
                    {programa}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Semestre</label>
                <input name="semestre" defaultValue={perfil.semestre ?? ""} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input name="telefono" defaultValue={perfil.telefono ?? ""} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Fecha Inicio</label>
                <input type="date" name="fecha_inicio_practica" defaultValue={perfil.fecha_inicio_practica ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha Fin</label>
                <input type="date" name="fecha_fin_practica" defaultValue={perfil.fecha_fin_practica ?? ""} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Widget Inferior: Estado de Práctica */}
          <div className="mt-6 p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ESTADO DE PRÁCTICA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Activa
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-brand-700 dark:bg-brand-500 w-[45%]" />
            </div>
            <p className="text-[11px] font-bold text-center text-brand-900 dark:text-brand-300 pt-0.5">
              180 / 400 Horas Completadas
            </p>
          </div>
        </div>

        {/* Card 2: Empresa */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
              <Building2 size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-brand-900 dark:text-white">
              2. Empresa
            </h3>
          </div>

          <div>
            <label className={labelClass}>Nombre de la Empresa</label>
            <input name="nombre_empresa" defaultValue={empresa?.nombre_empresa ?? ""} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>NIT</label>
            <input name="nit" defaultValue={empresa?.nit ?? ""} placeholder="900.123.456-7" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Dirección Principal</label>
            <input name="direccion" defaultValue={empresa?.direccion ?? ""} placeholder="Edificio Empresarial, Piso 4" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sector</label>
              <input name="sector" defaultValue={empresa?.sector ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono Empresa</label>
              <input name="empresa_telefono" defaultValue={empresa?.telefono ?? ""} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Card 3: Jefe Inmediato */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400">
              <UserCheck size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-brand-900 dark:text-white">
              3. Jefe Inmediato
            </h3>
          </div>

          <div>
            <label className={labelClass}>Nombre Completo</label>
            <input name="jefe_nombre" defaultValue={jefe?.nombre ?? ""} required placeholder="Ej. Dra. Laura Gómez" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Cargo</label>
            <input name="jefe_cargo" defaultValue={jefe?.cargo ?? ""} placeholder="Ej. Director de Proyectos" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Correo Electrónico Corporativo</label>
            <input name="jefe_correo" type="email" defaultValue={jefe?.correo ?? ""} placeholder="correo@empresa.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Teléfono de Contacto</label>
            <input name="jefe_telefono" defaultValue={jefe?.telefono ?? ""} placeholder="+57 (300) 000-0000" className={inputClass} />
          </div>
        </div>
      </div>
    </form>
  );
}

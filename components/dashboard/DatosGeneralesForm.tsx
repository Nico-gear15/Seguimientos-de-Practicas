import { guardarDatosGenerales } from "@/app/dashboard/actions";
import type { Empresa, JefeInmediato, Perfil } from "@/lib/types";

const PROGRAMAS_INGENIERIA = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Ingeniería Electrónica",
  "Ingeniería Ambiental",
  "Bioingeniería",
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
  return (
    <form action={guardarDatosGenerales} className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <h2 className="mb-3 text-sm font-medium">Datos del estudiante</h2>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className={label}>Nombre completo</label>
            <input name="nombre" defaultValue={perfil.nombre ?? ""} required className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Documento</label>
            <input name="documento" defaultValue={perfil.documento ?? ""} required className={input} />
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
            <input name="telefono" defaultValue={perfil.telefono ?? ""} className={input} />
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
            <input name="empresa_telefono" defaultValue={empresa?.telefono ?? ""} className={input} />
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
            <input name="jefe_telefono" defaultValue={jefe?.telefono ?? ""} className={input} />
          </div>
        </div>
        <div>
          <label className={label}>Correo</label>
          <input name="jefe_correo" type="email" defaultValue={jefe?.correo ?? ""} className={input} />
        </div>
      </div>

      <button
        type="submit"
        className="w-fit rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Guardar datos generales
      </button>
    </form>
  );
}

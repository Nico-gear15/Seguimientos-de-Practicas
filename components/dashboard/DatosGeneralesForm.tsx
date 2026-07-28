import { guardarDatosGenerales } from "@/app/dashboard/actions";
import type { Empresa, JefeInmediato } from "@/lib/types";

const estilos = {
  campo: { marginBottom: 10 } as React.CSSProperties,
  label: { fontSize: 13, color: "#444", display: "block", marginBottom: 4 } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
  } as React.CSSProperties,
};

export function DatosGeneralesForm({
  empresa,
  jefe,
}: {
  empresa: Empresa | null;
  jefe: JefeInmediato | null;
}) {
  return (
    <form action={guardarDatosGenerales} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Datos de la empresa</h2>
        <div style={estilos.campo}>
          <label style={estilos.label}>Nombre de la empresa</label>
          <input name="nombre_empresa" defaultValue={empresa?.nombre_empresa ?? ""} required style={estilos.input} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...estilos.campo, flex: 1 }}>
            <label style={estilos.label}>NIT</label>
            <input name="nit" defaultValue={empresa?.nit ?? ""} style={estilos.input} />
          </div>
          <div style={{ ...estilos.campo, flex: 1 }}>
            <label style={estilos.label}>Sector</label>
            <input name="sector" defaultValue={empresa?.sector ?? ""} style={estilos.input} />
          </div>
        </div>
        <div style={estilos.campo}>
          <label style={estilos.label}>Dirección</label>
          <input name="direccion" defaultValue={empresa?.direccion ?? ""} style={estilos.input} />
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Jefe inmediato</h2>
        <div style={estilos.campo}>
          <label style={estilos.label}>Nombre</label>
          <input name="jefe_nombre" defaultValue={jefe?.nombre ?? ""} required style={estilos.input} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...estilos.campo, flex: 1 }}>
            <label style={estilos.label}>Cargo</label>
            <input name="jefe_cargo" defaultValue={jefe?.cargo ?? ""} style={estilos.input} />
          </div>
          <div style={{ ...estilos.campo, flex: 1 }}>
            <label style={estilos.label}>Teléfono</label>
            <input name="jefe_telefono" defaultValue={jefe?.telefono ?? ""} style={estilos.input} />
          </div>
        </div>
        <div style={estilos.campo}>
          <label style={estilos.label}>Correo</label>
          <input name="jefe_correo" type="email" defaultValue={jefe?.correo ?? ""} style={estilos.input} />
        </div>
      </div>

      <button
        type="submit"
        style={{
          alignSelf: "flex-start",
          padding: "9px 18px",
          borderRadius: 8,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Guardar datos generales
      </button>
    </form>
  );
}

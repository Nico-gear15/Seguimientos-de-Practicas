export interface Perfil {
  id: string;
  nombre: string;
  documento: string | null;
  correo: string;
  telefono: string | null;
  programa_academico: string | null;
  semestre: string | null;
  fecha_inicio_practica: string | null;
  fecha_fin_practica: string | null;
}

export interface Empresa {
  id: string;
  usuario_id: string;
  nombre_empresa: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  sector: string | null;
}

export interface JefeInmediato {
  id: string;
  usuario_id: string;
  nombre: string;
  cargo: string | null;
  correo: string | null;
  telefono: string | null;
}

export interface Actividad {
  id: string;
  usuario_id: string;
  nombre: string;
  descripcion: string | null;
  fecha_asignacion: string;
  es_actividad_inicial: boolean;
  observacion_adicion: string | null;
  activa: boolean;
}

export interface AvanceMensual {
  id: string;
  seguimiento_id: string;
  actividad_id: string;
  porcentaje_avance: number;
  comentario: string | null;
  fecha_registro: string;
}

export interface Seguimiento {
  id: string;
  usuario_id: string;
  periodo: string; // 'YYYY-MM'
  estado: "borrador" | "generado";
  pdf_path: string | null;
  fecha_generacion: string | null;
}

/** Forma de los datos ya combinados, lista para pintar el PDF */
export interface DatosSeguimientoPDF {
  perfil: Perfil;
  empresa: Empresa;
  jefeInmediato: JefeInmediato;
  periodo: string;
  fechaGeneracion: string;
  actividades: Array<{
    actividad: Actividad;
    porcentajeAvance: number;
    comentario: string | null;
    esNuevaEsteMes: boolean;
  }>;
}

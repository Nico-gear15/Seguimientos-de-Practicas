import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DatosSeguimientoPDF } from "@/lib/types";

/**
 * Documento PDF del seguimiento mensual de práctica profesional.
 * Recibe los datos ya combinados (perfil, empresa, jefe, actividades
 * con su % de avance del mes) y produce el formato institucional.
 */

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  titulo: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 700,
  },
  subtitulo: {
    fontSize: 10,
    marginBottom: 16,
    color: "#555555",
  },
  seccion: {
    marginBottom: 14,
  },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    borderBottom: "1pt solid #cccccc",
    paddingBottom: 3,
  },
  filaDatos: {
    flexDirection: "row",
    marginBottom: 3,
  },
  etiqueta: {
    width: 110,
    color: "#555555",
  },
  valor: {
    flex: 1,
  },
  tabla: {
    marginTop: 4,
  },
  filaTabla: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #dddddd",
    paddingVertical: 4,
  },
  encabezadoTabla: {
    flexDirection: "row",
    borderBottom: "1pt solid #999999",
    paddingBottom: 4,
    marginBottom: 2,
    fontWeight: 700,
  },
  colActividad: { flex: 3 },
  colAvance: { flex: 1, textAlign: "right" },
  observacion: {
    fontSize: 9,
    color: "#8a5a00",
    marginTop: 2,
  },
  piePagina: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

function formatearPeriodo(periodo: string) {
  const [anio, mes] = periodo.split("-");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${meses[Number(mes) - 1]} de ${anio}`;
}

export function SeguimientoDocument({ datos }: { datos: DatosSeguimientoPDF }) {
  const { perfil, empresa, jefeInmediato, periodo, actividades } = datos;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.titulo}>Seguimiento mensual de práctica profesional</Text>
        <Text style={styles.subtitulo}>Periodo: {formatearPeriodo(periodo)}</Text>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Datos del estudiante</Text>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Nombre</Text>
            <Text style={styles.valor}>{perfil.nombre}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Documento</Text>
            <Text style={styles.valor}>{perfil.documento ?? "-"}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Programa académico</Text>
            <Text style={styles.valor}>{perfil.programa_academico ?? "-"}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Correo</Text>
            <Text style={styles.valor}>{perfil.correo}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Datos de la empresa</Text>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Empresa</Text>
            <Text style={styles.valor}>{empresa.nombre_empresa}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>NIT</Text>
            <Text style={styles.valor}>{empresa.nit ?? "-"}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Dirección</Text>
            <Text style={styles.valor}>{empresa.direccion ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Jefe inmediato</Text>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Nombre</Text>
            <Text style={styles.valor}>{jefeInmediato.nombre}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Cargo</Text>
            <Text style={styles.valor}>{jefeInmediato.cargo ?? "-"}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.etiqueta}>Correo</Text>
            <Text style={styles.valor}>{jefeInmediato.correo ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Actividades y avance del periodo</Text>
          <View style={styles.tabla}>
            <View style={styles.encabezadoTabla}>
              <Text style={styles.colActividad}>Actividad</Text>
              <Text style={styles.colAvance}>% Avance</Text>
            </View>
            {actividades.map(({ actividad, porcentajeAvance, esNuevaEsteMes }) => (
              <View key={actividad.id} style={styles.filaTabla}>
                <View style={styles.colActividad}>
                  <Text>{actividad.nombre}</Text>
                  {esNuevaEsteMes && actividad.observacion_adicion && (
                    <Text style={styles.observacion}>
                      Actividad nueva: {actividad.observacion_adicion}
                    </Text>
                  )}
                </View>
                <Text style={styles.colAvance}>{porcentajeAvance}%</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.piePagina}>
          Documento generado automáticamente por la plataforma de seguimiento de práctica profesional.
        </Text>
      </Page>
    </Document>
  );
}

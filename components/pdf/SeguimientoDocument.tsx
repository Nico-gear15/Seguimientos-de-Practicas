import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DatosSeguimientoPDF } from "@/lib/types";

const COLOR_BRAND_BG = "#312e81"; // Deep Indigo Header
const COLOR_HEADER_TEXT = "#ffffff";
const COLOR_BORDER = "#1e293b"; // Dark Slate border
const COLOR_SECTION_BG = "#e0e7ff"; // Soft Indigo Section Header
const COLOR_TEXT = "#0f172a";
const COLOR_LABEL_BG = "#f1f5f9";

const styles = StyleSheet.create({
  page: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: COLOR_TEXT,
    backgroundColor: "#ffffff",
    padding: 24,
  },
  // Contenedor principal estilo tabla institucional
  container: {
    border: "1.5pt solid " + COLOR_BORDER,
  },
  // Título Principal Superior
  mainTitleBox: {
    backgroundColor: COLOR_BRAND_BG,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1.5pt solid " + COLOR_BORDER,
  },
  mainTitleText: {
    color: COLOR_HEADER_TEXT,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
  },
  // Filas de Información General
  infoRow: {
    flexDirection: "row",
    borderBottom: "1pt solid " + COLOR_BORDER,
  },
  labelCell: {
    width: "35%",
    backgroundColor: COLOR_LABEL_BG,
    padding: 5,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  labelText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLOR_TEXT,
    textTransform: "uppercase",
  },
  valueCell: {
    width: "65%",
    padding: 5,
    justifyContent: "center",
  },
  valueText: {
    fontSize: 8.5,
    color: COLOR_TEXT,
    fontWeight: 400,
  },
  // Fila de Organización + Fechas compuestas
  orgLabelCell: {
    width: "18%",
    backgroundColor: COLOR_LABEL_BG,
    padding: 5,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  orgValueCell: {
    width: "32%",
    padding: 5,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  datesContainer: {
    width: "50%",
    flexDirection: "column",
  },
  dateSubRow: {
    flexDirection: "row",
    height: 16,
  },
  dateSubRowBorder: {
    borderBottom: "1pt solid " + COLOR_BORDER,
  },
  dateLabelCell: {
    width: "60%",
    backgroundColor: COLOR_LABEL_BG,
    padding: 3,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  dateValueCell: {
    width: "40%",
    padding: 3,
    justifyContent: "center",
  },
  // Banner de Sección (Fondo Gris / Índigo Institucional)
  sectionHeaderBar: {
    backgroundColor: COLOR_SECTION_BG,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottom: "1pt solid " + COLOR_BORDER,
    alignItems: "center",
  },
  sectionHeaderText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLOR_BRAND_BG,
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionSubText: {
    fontSize: 7,
    fontStyle: "italic",
    color: "#475569",
    textAlign: "center",
    marginTop: 1,
  },
  // Encabezados de Tablas de Actividades
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR_LABEL_BG,
    borderBottom: "1pt solid " + COLOR_BORDER,
  },
  colActividadHeader: {
    width: "45%",
    padding: 4,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  colCumplimientoHeader: {
    width: "15%",
    padding: 4,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  colExplicacionHeader: {
    width: "40%",
    padding: 4,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLOR_TEXT,
    textAlign: "center",
  },
  // Filas de Datos de Actividades
  tableDataRow: {
    flexDirection: "row",
    borderBottom: "1pt solid " + COLOR_BORDER,
    minHeight: 22,
  },
  colActividadData: {
    width: "45%",
    padding: 4,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
  },
  colCumplimientoData: {
    width: "15%",
    padding: 4,
    borderRight: "1pt solid " + COLOR_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  colExplicacionData: {
    width: "40%",
    padding: 4,
    justifyContent: "center",
  },
  tableDataText: {
    fontSize: 8,
    color: COLOR_TEXT,
  },
  tableDataTextCenter: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLOR_BRAND_BG,
    textAlign: "center",
  },
  // Sección de Firmas
  firmasRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  firmaBox: {
    flex: 1,
    border: "1pt solid " + COLOR_BORDER,
    padding: 6,
    height: 65,
    justifyContent: "space-between",
  },
  firmaLine: {
    borderTop: "1pt solid #475569",
    marginTop: 25,
    paddingTop: 3,
  },
  firmaRoleText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLOR_TEXT,
    textAlign: "center",
    textTransform: "uppercase",
  },
  firmaNameText: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "center",
  },
});

function formatearPeriodo(periodo: string) {
  const [anio, mes] = periodo.split("-");
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${meses[Number(mes) - 1]} de ${anio}`;
}

export function SeguimientoDocument({ datos }: { datos: DatosSeguimientoPDF }) {
  const { perfil, empresa, jefeInmediato, periodo, fechaGeneracion, actividades } = datos;

  // Clasificar actividades entre Propuesta de Mejora y Plan de Trabajo
  const propuestaMejora = actividades.filter((a) => !a.actividad.es_actividad_inicial);
  const planDeTrabajo = actividades.filter((a) => a.actividad.es_actividad_inicial);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.container}>
          {/* Título Principal */}
          <View style={styles.mainTitleBox}>
            <Text style={styles.mainTitleText}>
              FORMATO SEGUIMIENTO DEL PLAN DE TRABAJO Y PROPUESTA DE MEJORA DE LA PRÁCTICA PROFESIONAL
            </Text>
          </View>

          {/* Fila 1: Nombre Practicante */}
          <View style={styles.infoRow}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>NOMBRE COMPLETO PRACTICANTE:</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.valueText}>{perfil.nombre}</Text>
            </View>
          </View>

          {/* Fila 2: Nombre Tutor / Jefe Inmediato */}
          <View style={styles.infoRow}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>NOMBRE COMPLETO TUTOR (JEFE INMEDIATO):</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.valueText}>{jefeInmediato.nombre}</Text>
            </View>
          </View>

          {/* Fila 3: Organización + Fechas */}
          <View style={styles.infoRow}>
            <View style={styles.orgLabelCell}>
              <Text style={styles.labelText}>ORGANIZACIÓN</Text>
            </View>
            <View style={styles.orgValueCell}>
              <Text style={styles.valueText}>{empresa.nombre_empresa}</Text>
            </View>
            <View style={styles.datesContainer}>
              <View style={[styles.dateSubRow, styles.dateSubRowBorder]}>
                <View style={styles.dateLabelCell}>
                  <Text style={styles.labelText}>FECHA DE SEGUIMIENTO DESDE MES N°</Text>
                </View>
                <View style={styles.dateValueCell}>
                  <Text style={styles.valueText}>{perfil.fecha_inicio_practica ?? formatearPeriodo(periodo)}</Text>
                </View>
              </View>
              <View style={styles.dateSubRow}>
                <View style={styles.dateLabelCell}>
                  <Text style={styles.labelText}>FECHA DE SEGUIMIENTO HASTA MES FINAL</Text>
                </View>
                <View style={styles.dateValueCell}>
                  <Text style={styles.valueText}>{perfil.fecha_fin_practica ?? fechaGeneracion}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* SECCIÓN 1: AVANCE DE LA PROPUESTA DE MEJORA */}
          <View style={styles.sectionHeaderBar}>
            <Text style={styles.sectionHeaderText}>AVANCE DE LA PROPUESTA DE MEJORA</Text>
          </View>

          {/* Encabezado de la tabla 1 */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.colActividadHeader}>
              <Text style={styles.tableHeaderText}>
                Avance de las actividades de la propuesta de mejora de la práctica profesional
              </Text>
            </View>
            <View style={styles.colCumplimientoHeader}>
              <Text style={styles.tableHeaderText}>% de cumplimiento</Text>
            </View>
            <View style={styles.colExplicacionHeader}>
              <Text style={styles.tableHeaderText}>
                Explique la evolución de cada fase de la propuesta de mejora
              </Text>
            </View>
          </View>

          {/* Filas de la tabla 1 */}
          {propuestaMejora.map(({ actividad, porcentajeAvance, comentario }) => (
            <View key={actividad.id} style={styles.tableDataRow}>
              <View style={styles.colActividadData}>
                <Text style={styles.tableDataText}>{actividad.nombre}</Text>
              </View>
              <View style={styles.colCumplimientoData}>
                <Text style={styles.tableDataTextCenter}>{porcentajeAvance}%</Text>
              </View>
              <View style={styles.colExplicacionData}>
                <Text style={styles.tableDataText}>
                  {comentario ?? actividad.observacion_adicion ?? "En desarrollo."}
                </Text>
              </View>
            </View>
          ))}

          {propuestaMejora.length === 0 && (
            <View style={styles.tableDataRow}>
              <View style={styles.colActividadData}>
                <Text style={styles.tableDataText}>Actividades iniciales de propuesta de mejora</Text>
              </View>
              <View style={styles.colCumplimientoData}>
                <Text style={styles.tableDataTextCenter}>0%</Text>
              </View>
              <View style={styles.colExplicacionData}>
                <Text style={styles.tableDataText}>No se han agregado actividades adicionales de propuesta de mejora.</Text>
              </View>
            </View>
          )}

          {/* SECCIÓN 2: SEGUIMIENTO DEL PLAN DE TRABAJO */}
          <View style={styles.sectionHeaderBar}>
            <Text style={styles.sectionHeaderText}>
              SEGUIMIENTO DEL PLAN DE TRABAJO (OBJETIVOS DEL PLAN DE TRABAJO)
            </Text>
            <Text style={styles.sectionSubText}>
              (Por favor diligenciar la columna "seguimiento" de acuerdo al PLAN DE TRABAJO)
            </Text>
          </View>

          {/* Encabezado de la tabla 2 */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.colActividadHeader}>
              <Text style={styles.tableHeaderText}>
                Seguimiento a las actividades de práctica profesional
              </Text>
            </View>
            <View style={styles.colCumplimientoHeader}>
              <Text style={styles.tableHeaderText}>% de cumplimiento</Text>
            </View>
            <View style={styles.colExplicacionHeader}>
              <Text style={styles.tableHeaderText}>Observaciones y/o comentarios</Text>
            </View>
          </View>

          {/* Filas de la tabla 2 */}
          {planDeTrabajo.map(({ actividad, porcentajeAvance, comentario }) => (
            <View key={actividad.id} style={styles.tableDataRow}>
              <View style={styles.colActividadData}>
                <Text style={styles.tableDataText}>{actividad.nombre}</Text>
              </View>
              <View style={styles.colCumplimientoData}>
                <Text style={styles.tableDataTextCenter}>{porcentajeAvance}%</Text>
              </View>
              <View style={styles.colExplicacionData}>
                <Text style={styles.tableDataText}>{comentario ?? "Sin observaciones adicionales."}</Text>
              </View>
            </View>
          ))}

          {planDeTrabajo.length === 0 && (
            <View style={styles.tableDataRow}>
              <View style={styles.colActividadData}>
                <Text style={styles.tableDataText}>Sin actividades del plan de trabajo registradas</Text>
              </View>
              <View style={styles.colCumplimientoData}>
                <Text style={styles.tableDataTextCenter}>—</Text>
              </View>
              <View style={styles.colExplicacionData}>
                <Text style={styles.tableDataText}>No hay actividades en el plan de trabajo.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Sección de Firmas al final */}
        <View style={styles.firmasRow}>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine}>
              <Text style={styles.firmaRoleText}>Firma Practicante</Text>
              <Text style={styles.firmaNameText}>{perfil.nombre}</Text>
            </View>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine}>
              <Text style={styles.firmaRoleText}>Firma Tutor (Jefe Inmediato)</Text>
              <Text style={styles.firmaNameText}>{jefeInmediato.nombre}</Text>
            </View>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine}>
              <Text style={styles.firmaRoleText}>Firma Monitor Académico</Text>
              <Text style={styles.firmaNameText}>Universidad El Bosque</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

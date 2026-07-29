import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DatosSeguimientoPDF } from "@/lib/types";

const COLOR_HEADER_BG = "#1e2749";
const COLOR_SECCION = "#276749";
const COLOR_LABEL = "#5b6b82";
const COLOR_TEXTO = "#1a1a1a";
const COLOR_BARRA_FONDO = "#e5e7eb";
const COLOR_BARRA_RELLENO = "#22a06b";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLOR_TEXTO,
  },
  header: {
    backgroundColor: COLOR_HEADER_BG,
    color: "#ffffff",
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 32,
  },
  headerTitulo: {
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 6,
  },
  headerSubtitulo: {
    fontSize: 11,
    color: "#d6dbe8",
    marginBottom: 3,
  },
  headerFecha: {
    fontSize: 8.5,
    color: "#9aa3ba",
  },
  cuerpo: {
    padding: 32,
  },
  seccion: {
    marginBottom: 18,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: 700,
    color: COLOR_SECCION,
    marginBottom: 4,
  },
  seccionLinea: {
    borderBottom: "1pt solid #e2e2e2",
    marginBottom: 10,
  },
  fila: {
    flexDirection: "row",
    marginBottom: 10,
  },
  campo: {
    flex: 1,
    paddingRight: 12,
  },
  etiqueta: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLOR_LABEL,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valor: {
    fontSize: 10,
    color: COLOR_TEXTO,
  },
  actividad: {
    marginBottom: 14,
  },
  actividadFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  actividadNombre: {
    fontSize: 10.5,
    fontWeight: 700,
  },
  actividadPorcentaje: {
    fontSize: 10.5,
    fontWeight: 700,
  },
  barraFondo: {
    height: 6,
    backgroundColor: COLOR_BARRA_FONDO,
    borderRadius: 3,
  },
  barraRelleno: {
    height: 6,
    backgroundColor: COLOR_BARRA_RELLENO,
    borderRadius: 3,
  },
  comentario: {
    fontSize: 8.5,
    fontStyle: "italic",
    color: "#666666",
    marginTop: 4,
  },
  firmasFila: {
    flexDirection: "row",
    marginTop: 10,
  },
  firmaColumna: {
    flex: 1,
    paddingRight: 14,
  },
  firmaEspacio: {
    height: 44,
  },
  firmaLinea: {
    borderTop: "1pt solid #999999",
    marginBottom: 5,
  },
  firmaRol: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLOR_TEXTO,
    marginBottom: 1,
  },
  firmaNombre: {
    fontSize: 8.5,
    color: COLOR_LABEL,
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

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor || "-"}</Text>
    </View>
  );
}

export function SeguimientoDocument({ datos }: { datos: DatosSeguimientoPDF }) {
  const { perfil, empresa, jefeInmediato, periodo, fechaGeneracion, actividades } = datos;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>Seguimiento de Práctica Profesional</Text>
          <Text style={styles.headerSubtitulo}>Periodo: {formatearPeriodo(periodo)}</Text>
          <Text style={styles.headerFecha}>Generado el {fechaGeneracion}</Text>
        </View>

        <View style={styles.cuerpo}>
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Datos del estudiante</Text>
            <View style={styles.seccionLinea} />
            <View style={styles.fila}>
              <Campo etiqueta="NOMBRE COMPLETO" valor={perfil.nombre} />
              <Campo etiqueta="DOCUMENTO" valor={perfil.documento ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="PROGRAMA" valor={perfil.programa_academico ?? ""} />
              <Campo etiqueta="SEMESTRE" valor={perfil.semestre ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="CORREO" valor={perfil.correo} />
              <Campo etiqueta="TELÉFONO" valor={perfil.telefono ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="INICIO DE PRÁCTICA" valor={perfil.fecha_inicio_practica ?? ""} />
              <Campo etiqueta="FIN DE PRÁCTICA" valor={perfil.fecha_fin_practica ?? ""} />
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Datos de la empresa</Text>
            <View style={styles.seccionLinea} />
            <View style={styles.fila}>
              <Campo etiqueta="EMPRESA" valor={empresa.nombre_empresa} />
              <Campo etiqueta="NIT" valor={empresa.nit ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="DIRECCIÓN" valor={empresa.direccion ?? ""} />
              <Campo etiqueta="TELÉFONO" valor={empresa.telefono ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="SECTOR" valor={empresa.sector ?? ""} />
              <View style={styles.campo} />
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Datos del jefe inmediato</Text>
            <View style={styles.seccionLinea} />
            <View style={styles.fila}>
              <Campo etiqueta="NOMBRE" valor={jefeInmediato.nombre} />
              <Campo etiqueta="CARGO" valor={jefeInmediato.cargo ?? ""} />
            </View>
            <View style={styles.fila}>
              <Campo etiqueta="CORREO" valor={jefeInmediato.correo ?? ""} />
              <Campo etiqueta="TELÉFONO" valor={jefeInmediato.telefono ?? ""} />
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Actividades y avance a la fecha</Text>
            <View style={styles.seccionLinea} />

            {actividades.map(({ actividad, porcentajeAvance, comentario, esNuevaEsteMes }, i) => (
              <View key={actividad.id} style={styles.actividad}>
                <View style={styles.actividadFila}>
                  <Text style={styles.actividadNombre}>{i + 1}. {actividad.nombre}</Text>
                  <Text style={styles.actividadPorcentaje}>{porcentajeAvance}%</Text>
                </View>
                <View style={styles.barraFondo}>
                  <View style={[styles.barraRelleno, { width: `${porcentajeAvance}%` }]} />
                </View>
                {esNuevaEsteMes && actividad.observacion_adicion && (
                  <Text style={styles.comentario}>{actividad.observacion_adicion}</Text>
                )}
                {!esNuevaEsteMes && comentario && (
                  <Text style={styles.comentario}>{comentario}</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Firmas</Text>
            <View style={styles.seccionLinea} />
            <View style={styles.firmasFila}>
              <View style={styles.firmaColumna}>
                <View style={styles.firmaEspacio} />
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaRol}>Practicante</Text>
                <Text style={styles.firmaNombre}>{perfil.nombre}</Text>
              </View>
              <View style={styles.firmaColumna}>
                <View style={styles.firmaEspacio} />
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaRol}>Jefe inmediato</Text>
                <Text style={styles.firmaNombre}>{jefeInmediato.nombre}</Text>
              </View>
              <View style={styles.firmaColumna}>
                <View style={styles.firmaEspacio} />
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaRol}>Monitor de práctica (Universidad)</Text>
                <Text style={styles.firmaNombre}> </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

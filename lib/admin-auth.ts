import { createHmac, timingSafeEqual } from "crypto";

const NOMBRE_COOKIE = "admin_session";
const DURACION_SEGUNDOS = 8 * 60 * 60; // 8 horas

function secreto() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) {
    throw new Error("Falta configurar ADMIN_SESSION_SECRET en las variables de entorno");
  }
  return s;
}

/** Genera el valor firmado que se guarda en la cookie tras un login exitoso */
export function generarTokenSesion(): string {
  const vencimiento = Date.now() + DURACION_SEGUNDOS * 1000;
  const firma = createHmac("sha256", secreto()).update(String(vencimiento)).digest("hex");
  return `${vencimiento}.${firma}`;
}

/** Verifica que el token de la cookie sea válido y no haya expirado */
export function tokenSesionValido(token: string | undefined | null): boolean {
  if (!token) return false;
  const [vencimientoStr, firma] = token.split(".");
  if (!vencimientoStr || !firma) return false;

  const vencimiento = Number(vencimientoStr);
  if (Number.isNaN(vencimiento) || Date.now() > vencimiento) return false;

  const firmaEsperada = createHmac("sha256", secreto()).update(vencimientoStr).digest("hex");

  const bufA = Buffer.from(firma);
  const bufB = Buffer.from(firmaEsperada);
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
}

export const ADMIN_COOKIE = {
  nombre: NOMBRE_COOKIE,
  maxAge: DURACION_SEGUNDOS,
};

/** Compara usuario/contraseña ingresados contra las credenciales configuradas */
export function credencialesValidas(usuario: string, contrasena: string): boolean {
  const usuarioEsperado = process.env.ADMIN_USERNAME ?? "admin";
  const contrasenaEsperada = process.env.ADMIN_PASSWORD ?? "admin123456789";
  return usuario === usuarioEsperado && contrasena === contrasenaEsperada;
}

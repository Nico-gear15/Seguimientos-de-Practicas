import { NextRequest, NextResponse } from "next/server";
import { credencialesValidas, generarTokenSesion, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { usuario, contrasena } = await req.json();

  if (!usuario || !contrasena) {
    return NextResponse.json({ error: "Usuario y contraseña son obligatorios" }, { status: 400 });
  }

  if (!credencialesValidas(usuario, contrasena)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE.nombre, generarTokenSesion(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE.maxAge,
  });

  return response;
}

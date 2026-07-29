import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

function cerrarSesion(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE.nombre, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(req: NextRequest) {
  return cerrarSesion(req);
}

export async function POST(req: NextRequest) {
  return cerrarSesion(req);
}

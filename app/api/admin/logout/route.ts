import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url));
  response.cookies.set(ADMIN_COOKIE.nombre, "", { path: "/", maxAge: 0 });
  return response;
}

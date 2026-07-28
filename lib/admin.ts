import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, tokenSesionValido } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * Protege páginas/rutas exclusivas del panel de admin.
 * Verifica la cookie de sesión simple (usuario/contraseña fijos,
 * ver lib/admin-auth.ts) y, si es válida, entrega un cliente de
 * Supabase con Service Role (lee todos los datos sin RLS).
 *
 * Si la cookie falta o expiró, redirige a /admin/login.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE.nombre)?.value;

  if (!tokenSesionValido(token)) {
    redirect("/admin/login");
  }

  return { supabase: createAdminClient() };
}

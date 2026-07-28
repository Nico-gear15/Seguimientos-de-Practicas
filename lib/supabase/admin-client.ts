import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la Service Role Key.
 *
 * SOLO se usa dentro de rutas/páginas ya protegidas por
 * `requireAdmin()` (ver lib/admin.ts). Este cliente ignora RLS,
 * así que NUNCA debe exponerse al navegador ni usarse fuera de
 * contextos ya validados como admin.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

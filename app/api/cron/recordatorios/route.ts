import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

/**
 * GET /api/cron/recordatorios
 *
 * Pensado para ejecutarse 1 vez al mes vía Vercel Cron (ver vercel.json).
 * Revisa qué usuarios NO tienen un seguimiento "generado" para el periodo
 * actual y les envía un correo recordatorio, registrando el envío para
 * no duplicarlo.
 *
 * Usa la Service Role Key (solo en el servidor) porque necesita leer
 * datos de todos los usuarios, no solo los del usuario autenticado.
 */
function periodoActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
}

export async function GET(req: NextRequest) {
  // Protege el endpoint para que solo Vercel Cron (con el secret) lo dispare
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const periodo = periodoActual();

  const { data: perfiles, error } = await supabaseAdmin
    .from("perfiles")
    .select("id, nombre, correo");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let enviados = 0;

  for (const perfil of perfiles ?? []) {
    const { data: seguimientoGenerado } = await supabaseAdmin
      .from("seguimientos")
      .select("id")
      .eq("usuario_id", perfil.id)
      .eq("periodo", periodo)
      .eq("estado", "generado")
      .maybeSingle();

    if (seguimientoGenerado) continue; // Ya lo subió, no se le recuerda

    const { data: yaEnviado } = await supabaseAdmin
      .from("recordatorios_enviados")
      .select("id")
      .eq("usuario_id", perfil.id)
      .eq("periodo", periodo)
      .maybeSingle();

    if (yaEnviado) continue; // Ya se le envió el recordatorio este periodo

    await resend.emails.send({
      from: "Seguimiento de práctica <notificaciones@tu-dominio.com>",
      to: perfil.correo,
      subject: `Recordatorio: sube tu seguimiento de práctica de ${periodo}`,
      text: `Hola ${perfil.nombre}, recuerda diligenciar y subir tu seguimiento mensual de práctica profesional al aula virtual antes del cierre del mes.`,
    });

    await supabaseAdmin
      .from("recordatorios_enviados")
      .insert({ usuario_id: perfil.id, periodo });

    enviados++;
  }

  return NextResponse.json({ periodo, recordatoriosEnviados: enviados });
}

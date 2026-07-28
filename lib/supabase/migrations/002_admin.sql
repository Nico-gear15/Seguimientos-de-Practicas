-- ============================================================
-- Migración: soporte de rol "admin" para el panel de revisión
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- 1. Agregar rol al perfil (por defecto todo usuario nuevo es estudiante)
alter table public.perfiles
  add column if not exists rol text not null default 'estudiante'
  check (rol in ('estudiante', 'admin'));

-- 2. Función auxiliar: ¿el usuario autenticado es admin?
--    security definer para poder leer perfiles sin quedar atrapada
--    en su propia RLS al evaluarse dentro de otras políticas.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- 3. Políticas adicionales: el admin puede LEER todo (no editar),
--    se agregan como políticas permisivas extra junto a las que ya
--    existen ("propio"), por lo que no rompen el acceso normal del
--    estudiante a sus propios datos.
create policy "admin_lee_perfiles" on public.perfiles
  for select using (public.is_admin());

create policy "admin_lee_empresas" on public.empresas
  for select using (public.is_admin());

create policy "admin_lee_jefes" on public.jefes_inmediatos
  for select using (public.is_admin());

create policy "admin_lee_actividades" on public.actividades
  for select using (public.is_admin());

create policy "admin_lee_seguimientos" on public.seguimientos
  for select using (public.is_admin());

create policy "admin_lee_avances" on public.avances_mensuales
  for select using (public.is_admin());

-- 4. El admin también debe poder descargar los PDF generados
--    (bucket privado "seguimientos-pdf")
create policy "admin_lee_pdfs" on storage.objects
  for select using (bucket_id = 'seguimientos-pdf' and public.is_admin());

-- ============================================================
-- 5. Vista de resumen: un renglón por estudiante con su avance
--    global del ÚLTIMO periodo y el estado de ese seguimiento.
--    security_invoker = true hace que la RLS se evalúe con los
--    permisos del usuario que consulta la vista (el admin), no
--    con los del dueño de la vista.
-- ============================================================
create or replace view public.vista_avance_estudiantes
with (security_invoker = true) as
select
  p.id as usuario_id,
  p.nombre,
  p.correo,
  p.programa_academico,
  emp.nombre_empresa,
  ultimo.periodo as ultimo_periodo,
  ultimo.estado as ultimo_estado,
  ultimo.fecha_generacion as ultima_fecha_generacion,
  round(coalesce(prom.avance_promedio, 0), 1) as avance_global_promedio
from public.perfiles p
left join public.empresas emp on emp.usuario_id = p.id
left join lateral (
  select s.periodo, s.estado, s.fecha_generacion, s.id
  from public.seguimientos s
  where s.usuario_id = p.id
  order by s.periodo desc
  limit 1
) ultimo on true
left join lateral (
  select avg(am.porcentaje_avance) as avance_promedio
  from public.avances_mensuales am
  where am.seguimiento_id = ultimo.id
) prom on true
where p.rol = 'estudiante';

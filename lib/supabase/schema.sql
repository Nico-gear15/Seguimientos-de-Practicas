-- ============================================================
-- Esquema: Plataforma de Seguimiento de Práctica Profesional
-- Motor: PostgreSQL (Supabase)
-- ============================================================

-- Extensión para generar UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Perfil del estudiante (extiende auth.users de Supabase)
-- ------------------------------------------------------------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  documento text,
  correo text not null,
  programa_academico text,
  semestre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Empresa de práctica (1:1 con el usuario, editable)
-- ------------------------------------------------------------
create table if not exists public.empresas (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  nombre_empresa text not null,
  nit text,
  direccion text,
  sector text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id)
);

-- ------------------------------------------------------------
-- 3. Jefe inmediato (1:1 con el usuario, editable)
-- ------------------------------------------------------------
create table if not exists public.jefes_inmediatos (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null,
  cargo text,
  correo text,
  telefono text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id)
);

-- ------------------------------------------------------------
-- 4. Actividades asignadas al practicante
-- ------------------------------------------------------------
create table if not exists public.actividades (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null,
  descripcion text,
  fecha_asignacion date not null default current_date,
  es_actividad_inicial boolean not null default true,
  observacion_adicion text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  -- Regla de negocio: si NO es actividad inicial, la observación es obligatoria
  constraint observacion_obligatoria_si_no_inicial check (
    es_actividad_inicial = true or (observacion_adicion is not null and length(trim(observacion_adicion)) > 0)
  )
);

-- ------------------------------------------------------------
-- 5. Seguimientos mensuales (uno por usuario y periodo)
-- ------------------------------------------------------------
create table if not exists public.seguimientos (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  periodo text not null, -- formato 'YYYY-MM', ej. '2026-07'
  estado text not null default 'borrador' check (estado in ('borrador', 'generado')),
  pdf_path text, -- ruta dentro del bucket de Storage
  fecha_generacion timestamptz,
  created_at timestamptz not null default now(),
  unique (usuario_id, periodo)
);

-- ------------------------------------------------------------
-- 6. Avance mensual por actividad (histórico / trazabilidad)
-- ------------------------------------------------------------
create table if not exists public.avances_mensuales (
  id uuid primary key default uuid_generate_v4(),
  seguimiento_id uuid not null references public.seguimientos (id) on delete cascade,
  actividad_id uuid not null references public.actividades (id) on delete cascade,
  porcentaje_avance numeric(5,2) not null check (porcentaje_avance >= 0 and porcentaje_avance <= 100),
  fecha_registro timestamptz not null default now(),
  unique (seguimiento_id, actividad_id)
);

-- ------------------------------------------------------------
-- 7. Recordatorios enviados (para no duplicar envíos en el mes)
-- ------------------------------------------------------------
create table if not exists public.recordatorios_enviados (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  periodo text not null,
  fecha_envio timestamptz not null default now(),
  unique (usuario_id, periodo)
);

-- ============================================================
-- Row Level Security: cada usuario solo ve/edita sus propios datos
-- ============================================================
alter table public.perfiles enable row level security;
alter table public.empresas enable row level security;
alter table public.jefes_inmediatos enable row level security;
alter table public.actividades enable row level security;
alter table public.seguimientos enable row level security;
alter table public.avances_mensuales enable row level security;
alter table public.recordatorios_enviados enable row level security;

create policy "perfiles_propio" on public.perfiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "empresas_propio" on public.empresas
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "jefes_propio" on public.jefes_inmediatos
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "actividades_propio" on public.actividades
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "seguimientos_propio" on public.seguimientos
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "avances_propio" on public.avances_mensuales
  for all using (
    auth.uid() = (select usuario_id from public.seguimientos s where s.id = seguimiento_id)
  ) with check (
    auth.uid() = (select usuario_id from public.seguimientos s where s.id = seguimiento_id)
  );

create policy "recordatorios_propio" on public.recordatorios_enviados
  for select using (auth.uid() = usuario_id);

-- ============================================================
-- Función de utilidad: no permitir más de un seguimiento
-- "generado" por usuario/periodo (regla RF09)
-- ============================================================
create or replace function public.validar_seguimiento_unico()
returns trigger as $$
begin
  if new.estado = 'generado' then
    if exists (
      select 1 from public.seguimientos
      where usuario_id = new.usuario_id
        and periodo = new.periodo
        and estado = 'generado'
        and id <> new.id
    ) then
      raise exception 'Ya existe un seguimiento generado para este periodo';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_validar_seguimiento_unico
  before insert or update on public.seguimientos
  for each row execute function public.validar_seguimiento_unico();

-- ============================================================
-- Bucket de almacenamiento para los PDFs (ejecutar desde el
-- dashboard de Supabase o vía API si se prefiere scriptado)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('seguimientos-pdf', 'seguimientos-pdf', false);
-- Política sugerida: solo el dueño (auth.uid()) puede leer/escribir
-- su propia carpeta, ej. rutas tipo `{usuario_id}/2026-07.pdf`.

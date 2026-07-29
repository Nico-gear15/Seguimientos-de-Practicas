-- ============================================================
-- Migración: campos adicionales para el nuevo formato del PDF
-- Ejecutar DESPUÉS de 003_trigger_perfil.sql
-- ============================================================

alter table public.perfiles
  add column if not exists telefono text,
  add column if not exists fecha_inicio_practica date,
  add column if not exists fecha_fin_practica date;

alter table public.empresas
  add column if not exists telefono text;

-- Comentario opcional que el estudiante puede escribir al registrar
-- el avance de una actividad en el seguimiento del mes (ej. "Avanzado",
-- "Retrasado por vacaciones del jefe", etc.)
alter table public.avances_mensuales
  add column if not exists comentario text;

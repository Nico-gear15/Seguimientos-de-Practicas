-- ============================================================
-- Migración: creación automática de perfil al registrarse
-- Ejecutar DESPUÉS de schema.sql y 002_admin.sql
-- ============================================================

-- Toma los datos que se envían en el registro (auth.signUp con
-- `options.data`) y crea la fila correspondiente en public.perfiles.
-- security definer: corre con privilegios elevados porque se
-- dispara sobre auth.users, una tabla que el usuario todavía no
-- puede leer/escribir directamente en ese momento.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, correo, documento, programa_academico, semestre)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'documento',
    new.raw_user_meta_data->>'programa_academico',
    new.raw_user_meta_data->>'semestre'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

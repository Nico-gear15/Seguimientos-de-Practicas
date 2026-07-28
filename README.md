# Plataforma de seguimiento de práctica profesional — esqueleto del proyecto

Esqueleto inicial basado en el diseño técnico acordado: **Next.js + Supabase + react-pdf + Vercel**.

## Qué incluye este esqueleto

```
practica-seguimiento/
├── app/
│   ├── api/
│   │   ├── actividades/route.ts             # crear actividades (valida observación obligatoria)
│   │   ├── seguimientos/[id]/pdf/route.ts   # genera y guarda el PDF del seguimiento
│   │   ├── cron/recordatorios/route.ts      # tarea mensual de recordatorios por correo
│   │   ├── admin/estudiantes/[estudianteId]/pdf/[periodo]/route.ts  # descarga PDF (admin)
│   │   └── admin/login|logout/route.ts      # login/logout del panel (credenciales fijas)
│   ├── admin/
│   │   ├── login/page.tsx                   # formulario de acceso al panel
│   │   ├── page.tsx                         # panel: lista de estudiantes y su avance
│   │   └── [estudianteId]/page.tsx          # detalle de avance de un estudiante
│   ├── dashboard/                           # (pendiente de maquetar la UI)
│   ├── actividades/                         # (pendiente de maquetar la UI)
│   ├── login/                               # (pendiente de maquetar la UI)
│   └── registro/                            # (pendiente de maquetar la UI)
├── components/
│   └── pdf/SeguimientoDocument.tsx          # formato del PDF (react-pdf)
├── lib/
│   ├── admin.ts                             # requireAdmin(): protege el panel de admin
│   ├── admin-auth.ts                        # cookie de sesión firmada + verificación de credenciales
│   ├── supabase/
│   │   ├── client.ts                        # cliente Supabase (browser)
│   │   ├── server.ts                        # cliente Supabase (server)
│   │   ├── admin-client.ts                  # cliente con Service Role (solo para el panel de admin)
│   │   ├── schema.sql                       # esquema base + RLS
│   │   └── migrations/002_admin.sql         # rol admin, RLS extra y vista de avance
│   └── types.ts                             # tipos TypeScript del dominio
├── middleware.ts                           # refresca la sesión de Supabase
├── vercel.json                             # cron mensual de recordatorios
├── package.json
├── tsconfig.json
└── .env.example
```

## Pasos para levantar el proyecto

1. **Crear el proyecto en Supabase** (gratis en supabase.com).
   - En el editor SQL del dashboard, ejecutar el contenido de `lib/supabase/schema.sql`.
   - En *Storage*, crear un bucket privado llamado `seguimientos-pdf` (o descomentar la línea sugerida al final del `schema.sql` y ejecutarla).
   - Copiar la URL del proyecto y las llaves (`anon` y `service_role`) desde *Project Settings > API*.

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # completar con tus llaves de Supabase y de Resend
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Correr en desarrollo**
   ```bash
   npm run dev
   ```

5. **Desplegar en Vercel**
   - Conectar el repositorio de GitHub a Vercel (plan Hobby, gratis).
   - Agregar las mismas variables de entorno en *Project Settings > Environment Variables*.
   - El archivo `vercel.json` ya deja configurado el cron mensual (día 25 de cada mes) que dispara los recordatorios.

## Panel de administración

Se agregó un panel de solo lectura para que un coordinador/admin revise el avance de todos los estudiantes.

- **`lib/supabase/migrations/002_admin.sql`** — agrega la columna `rol` a `perfiles` ('estudiante' | 'admin'), una función `is_admin()`, políticas RLS adicionales para que el admin pueda **leer** todas las tablas (los estudiantes siguen viendo solo lo suyo), una política de Storage para que el admin descargue cualquier PDF, y una vista `vista_avance_estudiantes` con el avance global del último periodo por estudiante.
  - Ejecutar este archivo **después** de `schema.sql`.
  - Para convertir a alguien en admin: `update perfiles set rol = 'admin' where correo = 'coordinador@tu-universidad.edu';`
- **`app/admin/page.tsx`** — tabla con todos los estudiantes: empresa, último periodo, estado (al día / pendiente / sin seguimientos) y barra de avance global, con estudiantes por debajo del 30% resaltados.
- **`app/admin/[estudianteId]/page.tsx`** — detalle de un estudiante: datos de empresa y jefe inmediato, tabla de avance mes a mes por actividad (incluye la observación de las actividades agregadas después del inicio), y lista de seguimientos entregados con descarga de PDF.
- **`app/api/admin/estudiantes/[estudianteId]/pdf/[periodo]/route.ts`** — endpoint de descarga de PDF para el admin.
- **`lib/admin.ts`** — helper `requireAdmin()` que protege cualquier página/endpoint exclusivo del panel.

### Login del panel (usuario y contraseña fijos)

Para simplificar el acceso, el panel de admin usa un **login independiente de Supabase Auth**, con usuario y contraseña definidos por variables de entorno:

- `ADMIN_USERNAME` (por defecto `admin`)
- `ADMIN_PASSWORD` (por defecto `admin123456789`)
- `ADMIN_SESSION_SECRET`: string aleatorio usado para firmar la cookie de sesión (genera uno propio, no lo dejes vacío)

Flujo: `app/admin/login` envía las credenciales a `POST /api/admin/login`; si coinciden, se crea una cookie httpOnly firmada válida por 8 horas. `lib/admin.ts` (`requireAdmin()`) verifica esa cookie en cada página/endpoint del panel y, si es válida, entrega un cliente de Supabase con **Service Role** (lee todos los datos sin depender de RLS, ya que el login ya no está atado a un usuario real de Supabase Auth).

**Nota de seguridad:** un usuario y contraseña fijos —aunque estén en variables de entorno y no "quemados" en el código— son aceptables para un proyecto académico o una demo, pero no para producción real: cualquiera con la contraseña tiene acceso total y no hay manera de revocar el acceso a una sola persona ni de saber quién entró. Antes de un despliegue real, lo recomendable es volver a un login por usuario individual (por ejemplo, reutilizar Supabase Auth con el rol `admin` que ya quedó definido en `lib/supabase/migrations/002_admin.sql`, el cual sigue funcionando y puede reactivarse fácilmente).

## Lo que falta por construir (siguiente paso natural)

- Maquetar las páginas de `app/login`, `app/registro`, `app/dashboard` y `app/actividades` reutilizando el boceto de interfaz ya diseñado.
- Formulario de "agregar actividad" en el frontend que exija la observación cuando la actividad no es inicial (la regla ya está validada en el backend en `app/api/actividades/route.ts`, pero falta la UI).
- Formulario de "diligenciar seguimiento mensual" que guarde los `avances_mensuales` antes de llamar al endpoint de generación de PDF.
- Pantalla de historial de seguimientos (lista de PDFs generados, con descarga desde Supabase Storage).

## Notas de la regla de negocio de observación obligatoria

Está implementada en dos capas, como recomienda el diseño técnico:

1. **Base de datos** (`schema.sql`): un `check constraint` impide guardar una actividad con `es_actividad_inicial = false` si `observacion_adicion` está vacía.
2. **API** (`app/api/actividades/route.ts`): valida lo mismo antes de tocar la base de datos, para devolver un mensaje de error claro al frontend.

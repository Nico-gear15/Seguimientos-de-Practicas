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
# 🎓 Portal de Prácticas — Academic Milestone Tracker
Plataforma web integral diseñada para la gestión, seguimiento mensual y consolidación del avance de estudiantes en su proceso de Práctica Profesional y Estancias Académicas.
---
## 📌 Descripción del Proyecto
El **Portal de Prácticas** proporciona a los estudiantes practicantes y a los coordinadores académicos un ecosistema centralizado e interactivo para registrar el cumplimiento de actividades, monitorear horas acumuladas y generar automáticamente el **Formato Oficial de Seguimiento del Plan de Trabajo y Propuesta de Mejora** en formato PDF institucional.
El sistema garantiza la integridad de la información mediante reglas de negocio estrictas (como la validación de avance incremental no decreciente entre periodos y la justificación obligatoria para actividades adicionadas) ofreciendo además una interfaz moderna, responsiva y adaptable a modo claro y oscuro.
---
## ✨ Características Principales
### 📊 1. Panel de Control (Dashboard)
- **Métricas de Avance Global:** Cálculo automático del porcentaje de cumplimiento de prácticas y estimación de horas completadas.
- **Widgets de Resumen:** Indicadores de horas registradas, entregables completados y tarjetas de alertas condicionales.
- **Acceso Rápido:** Accesos directos al informe mensual en curso y recordatorios de entregas.
  
### 📋 2. Gestión Incremental de Actividades
- **Sliders Interactivos:** Deslizadores para ajustar el porcentaje de avance por actividad.
- **Regla de Avance Incremental:** Restricción en cliente y servidor que impide reducir el porcentaje alcanzado en periodos anteriores.
- **Selector de Mes Reactivo:** Navegación entre meses con actualización automática instantánea.
- **Registro de Actividades Adicionales:** Formulario con justificación obligatoria validada en base de datos.
  
### 📄 3. Generación y revisualización de Reportes PDF
- **Formato Oficial Institucional:** Estructura reglamentaria organizada en tablas bordeadas con secciones independientes:
  - *Avance de la Propuesta de Mejora*
  - *Seguimiento al Plan de Trabajo (Objetivos)*
  - *Recuadros para Firmas del Practicante, Tutor/Jefe Inmediato y Monitor Académico*
- **Vista Previa en Vivo (Live Preview):** Hoja interactiva tipo documento impreso que refleja los datos en tiempo real antes de descargar.

### 🛡️ 4. Panel de Coordinación y Administración
- **Vista Matricial de Practicantes:** Monitoreo general de todos los estudiantes, programas académicos y empresas vinculadas.
- **Indicadores de Riesgo:** Resalte automático de estudiantes con avance global inferior al 30%.
- **Descarga de Historial:** Acceso directo a la descarga de los reportes PDF generados en periodos anteriores.

### 🎨 5. Diseño y Experiencia de Usuario
- **Identidad Visual de Marca:** Paleta de colores índigo/púrpura institucional con acabados y bordes redondeados.
- **Soporte de Tema Claro / Oscuro:** Alternancia de tema mediante botón en cabecera con persistencia y prevención de parpadeo.
- **Navegación Fluida:** Menú lateral persistente, marca interactiva hacia el Dashboard, perfil directo y centro de notificaciones flotante.
---
## 🛠️ Arquitectura y Tecnologías
- **Framework:** Next.js (App Router), React, TypeScript
- **Estilos & UI:** Tailwind CSS, Lucide Icons
- **Base de Datos & Servicios:** Supabase (PostgreSQL, Row Level Security, Storage, Auth)
- **Generación de Documentos:** `@react-pdf/renderer`

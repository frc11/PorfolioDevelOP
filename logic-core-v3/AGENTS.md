CONTEXTO DEL PROYECTO — Agency OS v2 (Migración a Admin Unificado)

La Agency OS v1 ya está construida y funcionando bajo src/app/(protected)/admin/os/.
Un admin viejo existe en src/app/(protected)/admin/ con lógica conectada al portal de clientes.
El objetivo de v2 es unificar ambos en un solo /admin/os con la estética de la OS.

═══════════════════════════════════════════════════════════════
ESTRATEGIA DE MODELOS — 3 CAPAS (NO NEGOCIABLE)
═══════════════════════════════════════════════════════════════

CAPA 1 — Modelos del portal (INTOCABLES, solo leer/escribir):
  organization, user, subscription, service, project, task, ticket,
  ticketMessage, message, contactSubmission, clientAssets, notification,
  agencySettings, modulePricing
  → Estos modelos NO se renombran, NO se duplican, NO se eliminan.
  → La OS v2 los consume directamente con prisma.project, prisma.task, etc.
  → El portal de clientes (/dashboard) depende de ellos.

CAPA 2 — Modelos exclusivos de la OS (se mantienen con prefijo Os):
  OsLead, OsLeadActivity, OsDemo
  → No tienen equivalente en el portal. El pipeline comercial es interno.
  → Se siguen usando con prisma.osLead, prisma.osDemo, etc.

CAPA 3 — Modelos que se fusionan (ELIMINAR tras migración de datos):
  OsProject → sus campos financieros se agregan a project (Capa 1)
  OsTask → se elimina, se usa task (Capa 1) + campos nuevos
  OsPaymentMilestone → se mantiene pero referencia project (no OsProject)
  OsMaintenancePayment → se mantiene pero referencia project (no OsProject)
  OsTimeEntry → se mantiene pero referencia task (no OsTask)

═══════════════════════════════════════════════════════════════
3 PENDIENTES DE FASE 8 (recordatorio para no olvidar)
═══════════════════════════════════════════════════════════════

PENDIENTE 1: src/actions/task-approvals.ts líneas 73 y 107 generan
  notification.actionUrl = `/admin/projects/${task.projectId}`
  Debe apuntar a /admin/os/projects/ o tener redirect.

PENDIENTE 2: src/lib/actions/projects.ts usa revalidatePath('/admin/projects/...')
  en múltiples funciones. Debe actualizarse a /admin/os/projects/...

PENDIENTE 3: sendTaskForApprovalAction crea un message para el cliente cuando
  el admin envía tarea a aprobación. Este flujo DEBE sobrevivir intacto.
  project.organizationId es el campo clave que lo conecta.

═══════════════════════════════════════════════════════════════

STACK:
- Next.js 16 (App Router), TypeScript estricto (sin any)
- Tailwind CSS 4, Framer Motion
- Prisma ORM + Neon PostgreSQL
- NextAuth v5 con roles: SUPER_ADMIN y ORG_MEMBER/CLIENT
- Deploy: Vercel (free tier)
- Diseño: dark mode obligatorio, glassmorphism, colores por servicio:
  - WEB: cyan (#06b6d4)
  - AI_AGENT: violeta (#8b5cf6)
  - AUTOMATION: verde (#22c55e)
  - CUSTOM_SOFTWARE: amarillo (#eab308)

ESTRUCTURA ACTUAL:
- src/app/(protected)/admin/ → admin viejo (se retira progresivamente)
- src/app/(protected)/admin/os/ → Agency OS v1 (se expande a v2)
- src/app/(protected)/dashboard/ → portal de clientes (NO TOCAR)
- src/actions/ → server actions compartidas (task-approvals.ts)
- src/lib/actions/ → server actions del admin viejo (projects.ts)

CONVENCIÓN DE SERVER ACTIONS (sin cambios respecto a v1):
- Un archivo por entidad: {entity}.actions.ts
- Funciones: {verb}{Entity} (createLead, updateProjectStatus)
- Schemas Zod: {Verb}{Entity}Schema, exportados
- Secuencia: requireSuperAdmin() → Schema.parse(input) → Prisma → revalidatePath() → ok/fail
- Return type: Promise<ActionResult<T>>
- revalidatePath SIEMPRE bajo /admin/os/

ARCHIVOS QUE NO DEBES MODIFICAR (salvo que el prompt lo indique explícitamente):
- src/app/(protected)/dashboard/** — portal de clientes
- src/app/api/auth/** — configuración de NextAuth
- src/components/ui/** — componentes UI base
- tailwind.config.ts, next.config.ts

REGLA DE ORO: Después de cada cambio al schema, verificar que
npm run build pasa Y que /dashboard + /dashboard/project cargan correctamente.
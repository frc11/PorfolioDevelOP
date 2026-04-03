CONTEXTO DEL PROYECTO — Agency OS

Este proyecto es la expansión del panel SUPER_ADMIN dentro de un portal Next.js existente.
NO es una app nueva. Estamos agregando funcionalidad al proyecto que ya existe.

ESTRUCTURA DEL PROYECTO:
- Raíz del proyecto Next.js: logic-core-v3/
- Código fuente: src/ (la raíz de todo el código)
- Alias @/ apunta a src/
- Rutas protegidas: src/app/(protected)/
- Admin existente: src/app/(protected)/admin/ ← NO TOCAR
- Agency OS nueva: src/app/(protected)/admin/os/ ← TODO LO NUEVO VA ACÁ
- Utilidades compartidas: src/lib/
- Schema Prisma: prisma/schema.prisma

COEXISTENCIA CON ADMIN EXISTENTE:
Ya existe un admin funcional en src/app/(protected)/admin/ con estas rutas:
  - leads/, projects/, clients/, tickets/, messages/, agency-dashboard/, settings/
Estas rutas tienen lógica real en producción. La Agency OS se construye bajo /admin/os/
para coexistir sin conflicto. NUNCA modificar, renombrar ni eliminar archivos del admin existente.

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

CONVENCIÓN DE SERVER ACTIONS:
- Un archivo por entidad: {entity}.actions.ts
- Funciones: {verb}{Entity} (createLead, updateProjectStatus, deleteTask)
- Schemas Zod: {Verb}{Entity}Schema, exportados para uso client-side
- Secuencia interna: requireSuperAdmin() → Schema.parse(input) → Prisma query → revalidatePath() → return ok(data)
- Return type: Promise<ActionResult<T>> usando ok()/fail() de src/lib/action-utils.ts
- Try/catch envuelve todo, catch retorna fail(message)
- Imports de actions entre módulos OS usan alias: @/app/(protected)/admin/os/{modulo}/_actions/{entity}.actions

CONVENCIÓN DE COMPONENTES:
- Componentes específicos de módulo van en _components/ dentro de su ruta bajo os/
- Componentes compartidos entre módulos OS van en src/app/(protected)/admin/os/_components/
- Nombres en kebab-case: lead-card.tsx, stat-card.tsx
- "use client" solo cuando sea necesario (interactividad, hooks)

ARCHIVOS QUE NO DEBES MODIFICAR (salvo que el prompt lo indique explícitamente):
- src/app/(protected)/admin/leads/** — admin existente
- src/app/(protected)/admin/projects/** — admin existente
- src/app/(protected)/admin/clients/** — admin existente
- src/app/(protected)/admin/tickets/** — admin existente
- src/app/(protected)/admin/messages/** — admin existente
- src/app/(protected)/admin/agency-dashboard/** — admin existente
- src/app/(protected)/admin/settings/** — admin existente
- src/app/(protected)/admin/layout.tsx — layout del admin existente
- src/app/(protected)/admin/page.tsx — página del admin existente
- src/app/(portal)/** — rutas del portal de clientes
- src/app/api/auth/** — configuración de NextAuth
- src/components/ui/** — componentes UI base del portal
- tailwind.config.ts — ya configurado
- next.config.ts — ya configurado

ESTRUCTURA DE CARPETAS AGENCY OS:
src/app/(protected)/admin/os/
  layout.tsx, page.tsx
  leads/ (page, [leadId]/page, _components/, _actions/)
  projects/ (page, [projectId]/layout+page+tasks/+hours/+payments/, _components/, _actions/)
  team/ (page, _components/, _actions/)
  _components/ (compartidos dentro de OS)
src/lib/
  action-utils.ts, auth-guards.ts, follow-up.ts, prisma.ts (ya existe)

MODELOS PRISMA — REGLA CRÍTICA:
Todos los modelos nuevos de Agency OS llevan prefijo Os:
OsLead, OsLeadActivity, OsDemo, OsProject, OsPaymentMilestone,
OsMaintenancePayment, OsTask, OsTimeEntry.

Las relaciones en User también llevan prefijo:
osAssignedLeads, osActivities, osAssignedTasks, osTimeEntries.

Los relation labels llevan prefijo: "OsLeadAssignee", "OsActivityPerformer",
"OsTaskAssignee", "OsTimeEntryUser".

En los server actions usar SIEMPRE prisma.osLead, prisma.osProject, etc.
NUNCA prisma.lead ni prisma.project — esos son modelos existentes distintos.

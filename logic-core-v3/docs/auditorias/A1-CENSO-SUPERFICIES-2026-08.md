# A1 — Censo de superficies: qué es interno y qué es de cliente

**Fecha:** 2026-08-13 · **Modo:** read-only, cero mutaciones · **Base:** `main` @ 05ae1a87
**Método:** todo verificado contra código. La documentación del repo (`STATUS.md`, `README.md`, `AGENTS.md`) se usó SOLO como fuente de contraste — las divergencias van en la última sección.

> Sin recomendaciones. Solo hallazgos.

---

## 0. Aclaración que condiciona todas las cifras

`src/app/**` es delgado. Las rutas son cáscara; el peso vive en `src/components/`, `src/modules/` y `src/lib/`. Medir solo por carpeta de ruta subestima brutalmente al sitio público (cuyo cuerpo está en `src/components/sections|ia|automation|software`) y al chatbot (cuyo cuerpo está en `src/modules/chatbot`, 49.592 líneas).

Por eso hay **dos tablas**: superficie por ruta, y peso real por dominio.

---

## 1. Tabla de superficies (por ruta de nivel superior)

| Ruta | Clasificación | Rol que la consume | Archivos | Líneas | Evidencia |
|---|---|---|---|---|---|
| `/` | CLIENTE | visitante anónimo | 1 page + layout | 2.331 B page | `src/app/page.tsx`; `robots.ts` la permite |
| `/web-development` | CLIENTE | visitante | 2 | 361 | landing de servicio |
| `/ai-implementations` | CLIENTE | visitante | 2 | 332 | landing de servicio |
| `/process-automation` | CLIENTE | visitante | 2 | 186 | landing de servicio |
| `/software-development` | CLIENTE | visitante | 2 | 204 | landing de servicio |
| `/contact` | CLIENTE | visitante | 2 | 382 | formulario público |
| `/styleguide` | **INTERNO** | develOP (diseño) | 10 | 1.366 | `styleguide/page.tsx:23-27` — `robots: { index:false, follow:false }`, comentario explícito "Página interna del rediseño… se llega solo escribiendo la URL". **NO tiene gate de auth** |
| `/embed/[slug]` | CLIENTE | visitante en el sitio DEL cliente | 2 | 55 | iframe del chatbot; `next.config.ts:100-108` le pone `frame-ancestors *` |
| `/login` | MIXTA | los 3 roles | 2 | 675 | única puerta para SUPER_ADMIN, ORG_MEMBER y SETTER |
| `/cambiar-password` | MIXTA | los 3 roles | 3 | 326 | `proxy.ts:84-90` fuerza el paso para cualquier rol con `passwordResetRequired` |
| `/forgot-password` | MIXTA | los 3 roles | 2 | 378 | |
| `/reset-password` | MIXTA | los 3 roles | 3 | 425 | |
| `/accept-invite` | CLIENTE | invitado de una org | 4 | 432 | alta de miembro de organización |
| `/bienvenida` | CLIENTE | ORG_MEMBER sin onboarding | 7 | 528 | `proxy.ts:158-166`; un SETTER nunca entra (`proxy.ts:117-122`) |
| `/(protected)/dashboard/**` | CLIENTE | ORG_MEMBER / CLIENT | 89 | 7.934 | `proxy.ts:154`; `dashboard/layout.tsx` resuelve `organizationId` |
| `/(protected)/admin/**` | **INTERNO** | SUPER_ADMIN (Franco) | 245 | 32.675 | `proxy.ts:148-152`; `admin/layout.tsx` |
| `/(protected)/setter/**` | **INTERNO** | SETTER (Toba, Peter) | 91 | 11.230 | `proxy.ts:117-122`; `setter/layout.tsx:32-34` |
| `/api/**` | mixta — ver §1.2 | — | 41 | 3.133 | |

### 1.1 Desglose de `/admin` (todo INTERNO, pero con dueño de dominio distinto)

| Sub-superficie | Archivos | Líneas | Dominio |
|---|---|---|---|
| `admin/leads` | 41 | 5.647 | LeadOS (pipeline comercial) |
| `admin/leados` | 13 | 2.208 | LeadOS (cabina de revisión de demos + setters) |
| `admin/leados/setter/[setterId]` | (incl. arriba) | | LeadOS |
| `admin/fg2-lab` | 3 | 592 | LeadOS (prototipo, gate abierto) |
| `admin/projects` | 34 | 6.693 | entrega a cliente |
| `admin/clients` | 36 | 4.055 | cliente |
| `admin/chatbots` | 27 | 2.911 | cliente (producto chatbot) |
| `admin/chatbot` (activity/health) | 4 | 386 | cliente (producto chatbot) |
| `admin/tickets` | 12 | 1.302 | cliente (soporte) |
| `admin/messages` | 16 | 1.033 | cliente |
| `admin/settings` | 12 | 1.635 | agencia |
| `admin/team` | 8 | 1.447 | agencia |
| `admin/alerts` | 9 | 858 | cliente (bot) |
| `admin/audit-log` | 6 | 888 | agencia |
| `admin/announcements` | 5 | 507 | cliente |
| `admin/referrals` | 3 | 213 | cliente |
| `admin/_components` | 12 | 1.278 | shell del panel |

**Hallazgo:** `/admin` NO es una superficie homogénea. Tiene ~8.447 líneas de LeadOS (leads + leados + fg2-lab) y ~24.000 líneas que son la contracara operativa de lo que el cliente ve en `/dashboard`. Clasificarla entera como "interno" oculta que la mayor parte es la mitad-admin del producto de cliente.

### 1.2 Desglose de `/api`

| Ruta | Clasificación | Justificación |
|---|---|---|
| `api/auth/[...nextauth]` | MIXTA | sesión de los 3 roles |
| `api/chatbot/[slug]/{chat,config,health,smoke}` | CLIENTE | API pública del bot del cliente |
| `api/dashboard/{chatbot/leads/export, leads/recent}` | CLIENTE | |
| `api/email/optout/[contactId]`, `api/email/unsubscribe-executive` | CLIENTE | links en mails a contactos del cliente |
| `api/auth/google-business/*`, `api/auth/tiendanube/*` | CLIENTE | OAuth de integraciones del cliente |
| `api/motor/webhook/[channelToken]` | CLIENTE | entrada WhatsApp del motor multi-tenant |
| `api/reports/client-monthly` | CLIENTE | |
| `api/track` | CLIENTE | requiere sesión (`api/track/route.ts:11-12`) |
| `api/admin/**` (6 rutas) | INTERNO | |
| `api/cron/**` (8 rutas) | INTERNO (sistema) | protegidas por `CRON_SECRET` |
| `api/cron/os-follow-up` | **INTERNO — LeadOS** | única cron del setter |
| `api/reports/monthly` | INTERNO | PDF de agencia |
| `api/dev/email-preview/*` | INTERNO | |
| `api/qa/login` | INTERNO (QA) | triple guard documentado en `api/qa/login/route.ts:16-24` |
| `api/test-sentry`, `api/version` | INTERNO | |

---

## 2. Peso real por dominio (dónde está el código de verdad)

| Dominio | Lado | Archivos | Líneas | Dónde vive |
|---|---|---|---|---|
| Chatbot multi-tenant | CLIENTE | 330 | 49.592 | `src/modules/chatbot/` |
| Sitio público (secciones) | CLIENTE | ~87 | ~42.500 | `components/sections` 12.050 · `ia` 9.302 · `automation` 10.389 · `software` 8.952 · `canvas` 1.500 · `3d` 248 · `brand` 66 |
| Panel admin | INTERNO | 249 | ~33.000 | `app/(protected)/admin` + `components/admin` |
| Dashboard cliente | CLIENTE | 176 | ~18.600 | `app/(protected)/dashboard` 7.934 + `components/dashboard` 10.697 |
| LeadOS / setter | INTERNO | 144 | 21.387 | `app/(protected)/setter` 11.230 + `lib/leados` 10.157 |
| Motor WhatsApp | CLIENTE (infra) | 16 | 1.862 | `src/modules/motor/` |
| `src/lib` (sin leados) | COMPARTIDO | 169 | 21.100 | |
| `src/components/ui` | COMPARTIDO | 40 | 4.070 | |
| `prisma/` | COMPARTIDO | 11 | 6.427 | `schema.prisma` = 2.247 líneas |

---

## 3. Grafo de acoplamiento de las superficies INTERNAS

### 3.1 `/setter` (LeadOS) — censo de imports resueltos

Conteo de `from '@/...'` en `app/(protected)/setter/**` + `lib/leados/**`:

| Dependencia | Refs | ¿Compartida con CLIENTE? |
|---|---|---|
| `@/components/ui` | 41 | **SÍ** — dashboard (10), admin (12+), `modules/chatbot` (7) |
| `@/lib/leados/*` (flow, contracts, guidance-content, ownership, copy-blocks, manual, isolation, turno, dossier, novedades…) | ~120 | Parcial — ver §3.2 |
| `@/lib/prisma` | 14 | **SÍ** — cliente singleton único |
| `@/lib/utils` (`cn()`) | 14 | **SÍ** — todo el repo |
| `@/lib/auth-guards` | 12 | **SÍ** — `requireSuperAdmin` vive en el mismo archivo |
| `@/lib/action-utils` | 9 | **SÍ** |
| `@/lib/use-unsaved-guard`, `use-step-action`, `use-autosave`, `use-reduced-motion` | 19 | **SÍ** (hooks genéricos en `src/lib/`) |
| `@/lib/design-tokens` (`zIndex`) | 2 | **SÍ** — escala z global |
| `@/lib/logger` | 3 | **SÍ** |
| `@/lib/os-commercial` | 2 | **SÍ** con admin |
| `@/lib/integrations/cal-com-v2` | 2 | Exclusivo del setter hoy |
| `@/lib/notifications/telegram` | 1 | **SÍ** con admin |
| `@/context/TransitionContext` | 1 | **SÍ** — y es archivo FROZEN, montado en el root layout |
| `@/auth` | 1 | **SÍ** — NextAuth único |
| `@/actions/auth-actions` (`signOutAction`) | 1 | **SÍ** |

### 3.2 `lib/leados` NO es exclusivo del setter

Archivos que lo importan, por carpeta:

```
21  setter/leads/[leadId]/manual/_components
15  setter/_components
14  lib/leados (interno)
10  setter/_actions
 8  setter/leads/[leadId]/_components
 3  admin/leads/_actions          <-- ADMIN
 2  admin/leads/_components       <-- ADMIN
 2  admin/fg2-lab/_components     <-- ADMIN
 1  api/cron/os-follow-up         <-- CRON
 …  admin/leados/{_actions,_components,[leadId],setter/[setterId]}  <-- ADMIN (6 más)
```

`lib/leados` es el núcleo compartido entre **el setter y el admin de LeadOS**, no una librería del setter. Ambos lados son INTERNOS, así que esto no cruza la frontera interno/cliente — pero significa que "mover el setter" implica mover también `admin/leads` + `admin/leados` + `admin/fg2-lab` + `api/cron/os-follow-up`, o duplicar `lib/leados`.

### 3.3 `/admin` — de qué depende

- Modelos Prisma: prácticamente **todos** (Organization, Project, Task, Ticket, Message, BotConfig, ChatbotLead, Subscription, Invoice, Plan, BotAlert, AdminAuditLog, PanelAnnouncement, Referral, Os*…).
- `src/modules/chatbot/index.server` — el panel admin consume el módulo de producto directamente.
- `@/lib/impersonation` + `proxy.ts:154` — el admin puede entrar a `/dashboard` de un cliente vía cookie `impersonation-token`. **El panel interno tiene una puerta legítima hacia la superficie de cliente.**
- `unstable_cache` con tags globales (`admin-alerts-count`, `admin-revision-resumen`) — `admin/layout.tsx:10-31`.

---

## 4. El caso LeadOS / setter en detalle

### 4.1 Modelos de Prisma

**Exclusivos de LeadOS** (no los toca ninguna superficie de cliente):

| Modelo | Línea | Nota |
|---|---|---|
| `OsLead` | `schema.prisma:862` | |
| `OsLeadSetterMeta` | `:909` | pin/snooze/nota privados del setter |
| `OsSetterNotice` | `:939` | novedades dirigidas |
| `OsLeadActivity` | `:956` | |
| `OsDemo` | `:972` | |
| `OsLeadDossier` | `:988` | |
| Enums: `LeadStatus`, `OsServiceType`, `ActivityChannel`, `ActivityResult`, `DossierStage`, `OsSetterNoticeKind`, `MilestoneType` | `:1072-1140` | |

**Os\* que NO son del setter — cuelgan de `Project` (cliente):**

| Modelo | Línea | FK |
|---|---|---|
| `OsPaymentMilestone` | `:1022` | → `Project` |
| `OsMaintenancePayment` | `:1036` | → `Project` |
| `OsTimeEntry` | `:1051` | → `Task`, `Project`, `User` |

**Compartidos con cliente (hard):** `User` (`:286`), `Session` (`:267`), `Account` (`:248`), `Project` (`:547`).

### 4.2 Aislamiento por `assignedToId` — CONFIRMADO

Fuente única: `src/lib/leados/isolation.ts`.

- Lectura de un lead: `ownedLeadWhere(leadId, userId) → { id, assignedToId: userId }` — `isolation.ts:26-31`.
- Lectura de la lista: `ownedListWhere(userId) → { assignedToId: userId }` — `isolation.ts:34-36`.
- Escritura: `ownedLeadCreateData()` **deriva `assignedToId` del `userId` de sesión, campo por campo** (no spread), para que un `assignedToId` inyectado ni se lea — `isolation.ts:79-96`.
- Datos privados del setter: `ownSetterMetaWhere(userId) → { setterId }` — `isolation.ts:105-107`.
- Novedades dirigidas: `ownSetterNoticeWhere(userId) → { setterId }` — `isolation.ts:139-143`.
- **`organizationId` no aparece en ningún `where` del setter.** Un SETTER no tiene `OrgMember` (lo dice el comentario en `proxy.ts:114-116`).

**Dónde está documentado:** el propio `isolation.ts` es la documentación (docblock de 20 líneas, `:1-19`). Además hay chequeos de invariante que lo verifican **sin tocar la DB**: `alta-propia.invariant.ts`, `assignment-trail.invariant.ts`, `setter-meta.invariant.ts`, `progreso-isolation.invariant.ts`. NO está documentado en `AGENTS.md` ni en `STATUS.md` (ninguno de los dos menciona la palabra "setter" — ver §7).

### 4.3 Helpers propios del setter

`src/lib/leados/` — 53 archivos, 10.157 líneas. Los más grandes: `guidance-content.ts` (48 KB), `flow.ts` (37 KB), `manual.ts` (25 KB), `dossier.ts` (19 KB), `agenda.ts` (15 KB). 18 de esos 53 archivos son `*.invariant.ts` (chequeos puros sin DB).

### 4.4 Atadura al sistema de auth compartido

- `requireSetter()` vive en `src/lib/auth-guards.ts:13-21`, **en el mismo archivo que `requireSuperAdmin()`**, y ambos llaman a `auth()` de `@/auth`.
- El rol `SETTER` es un valor del enum `Role` en el schema compartido y está hardcodeado en `auth.config.ts:4` y en `proxy.ts:15`.
- El middleware de rutas (`proxy.ts`) es **uno solo** para las tres zonas: la rama SETTER (`:117-122`) convive con las de ADMIN y ORG_MEMBER en la misma función.
- La cookie de sesión es única (`SESSION_COOKIE_NAME` de `src/lib/auth-cookies.ts`), compartida por los tres roles.

---

## 5. Acoplamiento DURO (no se separa sin cirugía)

Ordenado por costo de desacople, de mayor a menor.

### D1 — `Project.osLeadId` suelda el pipeline interno al modelo de cliente
`schema.prisma:556` (`osLeadId String? @unique`) y `:562` (`osLead OsLead? @relation(...)`).
La cadena es `OsLead → Project → Organization → (Subscription, Invoice, Task, Ticket, Message, BotConfig…)`. Un lead ganado *se convierte* en un proyecto de cliente. Separar los repos parte esta relación en dos bases de datos: la FK deja de existir.

### D2 — `User` / `Session` / `Account` son una sola tabla para los tres roles
`schema.prisma:286` — `User.role: Role` con `SUPER_ADMIN | ORG_MEMBER | CLIENT | SETTER` en el mismo enum (`:12`). El mismo `User` cuelga de `orgMemberships`, `tickets` y `notifications` (cliente) **y** de `osAssignedLeads`, `osLeadSetterMetas`, `osSetterNotices`, `osActivities` (interno) — `:299-313`. Un setter y un cliente son filas de la misma tabla, autenticadas por el mismo `AUTH_SECRET` y la misma cookie.

### D3 — El middleware es único e indivisible
`src/proxy.ts:70-169` y su `matcher` (`:171-173`) cubren `/admin`, `/dashboard`, `/setter`, `/login`, `/bienvenida`, `/cambiar-password` en un solo archivo. Las reglas están entrelazadas: la rama SETTER existe precisamente *porque* si no cae en el camino ORG_MEMBER (comentario `:114-116`).

### D4 — El root layout monta el sitio público en TODA ruta
`src/app/layout.tsx:107-135`. `PreloaderProvider` → `SmoothScroll` → `TransitionProvider` → children, más `Toaster` y `ChatWidgetMount` fuera del provider. `/setter` y `/admin` viven adentro de ese árbol; lo único que los "apaga" es `PublicOnlyComponents`, que filtra por `PORTAL_PREFIXES = ['/admin','/dashboard','/embed','/setter']` (`components/layout/publicRoute.ts:16`). Es decir: el portal interno no está aislado del sitio de marketing — está *condicionalmente ocultado* dentro de él. `TransitionContext.tsx` además es archivo FROZEN por `CLAUDE.md`, y `setter-nav.tsx:36` lo consume.

### D5 — `@/lib/prisma` es un cliente singleton contra un schema único
`src/lib/prisma.ts` (285 bytes). Un solo `PrismaClient`, un solo `DATABASE_URL`, un solo `schema.prisma` de 2.247 líneas con 60+ modelos. No hay separación por esquema ni por base.

### D6 — Variables de entorno comunes
51 vars distintas referenciadas en código. Las que cruzan la frontera:
`DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, `NEXT_RUNTIME`, `NETLIFY`, `CRON_SECRET`, `IMPERSONATION_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`.
El setter además usa el mismo canal de email/alertas que el cliente (`BREVO_*`, `RESEND_*`, `TELEGRAM_*`).

### D7 — `@/components/ui` es el vocabulario visual de las cuatro superficies
40 archivos / 4.070 líneas consumidos por dashboard, admin, setter y `modules/chatbot`. Y `@/lib/design-tokens` define la escala `zIndex` que usa el shell del setter (`setter-shell.tsx:29`) y la del resto.

### D8 — `lib/leados` es compartido entre setter y admin
Ver §3.2. Interno-con-interno, pero bloquea "mover solo `/setter`".

### D9 — `@/lib/auth-guards` mezcla el guard interno y el de cliente en un archivo de 21 líneas
`src/lib/auth-guards.ts` — `requireSuperAdmin` y `requireSetter` juntos.

---

## 6. Acoplamiento BLANDO (se movería copiando archivos)

| Pieza | Archivos | Por qué es blando |
|---|---|---|
| `src/lib/leados/**` | 53 / 10.157 | Módulos puros. 18 son invariantes sin DB. Único acople externo: `@prisma/client` (tipos) y `@/lib/prisma` |
| `app/(protected)/setter/**` | 91 / 11.230 | Todas las rutas son `force-dynamic`; no comparten componentes con cliente salvo `@/components/ui` |
| `docs/manual-usuario/**` | 22 md / 5.682 líneas | Contenido puro, sin código |
| `src/lib/leados/herramientas.ts` | 1 / 6 KB | Registro editable de herramientas externas |
| `src/lib/integrations/cal-com-v2` | — | Hoy solo lo usa el setter |
| `src/lib/dates-ar.ts` + `tz-ar.ts` | 2 | Utilidades puras, copiables |
| `src/components/ui` | 40 / 4.070 | Copiable, pero se duplicaría (no es "mover") |
| `/styleguide` | 10 / 1.366 | Sin gate de auth, sin links entrantes, sin dependencias del dominio |
| `admin/fg2-lab` | 3 / 592 | Prototipo aislado, gate abierto |
| Suites Playwright del setter | `playwright.setter.config.ts`, `playwright.leados.config.ts` + `tests/leados` | Ya corren con `distDir` propio (`.next-setter/`) y puerto propio |

---

## 7. Discrepancias documentación vs. código real

| # | Documento | Afirma | Realidad verificada |
|---|---|---|---|
| 1 | `STATUS.md` (se autodefine "fuente de verdad", `README.md:...`) | Última verificación **2026-05-21**; "42 migrations found" | **86 migraciones** en `prisma/migrations/`. El doc está ~3 meses atrasado |
| 2 | `STATUS.md` | Inventario completo del proyecto | **0 menciones** de "setter" o "leados". La superficie interna más grande después de admin (21.387 líneas) no existe en el documento |
| 3 | `AGENTS.md` | "Este repo contiene: 1. Landing pública, 2. Portal SaaS multi-tenant, 3. Panel admin" | Faltan LeadOS/`/setter`, `/embed`, `widget.js` y `src/modules/motor`. **0 menciones** de setter/leados |
| 4 | `AGENTS.md` "Paleta por servicio" | IA = `#8b5cf6` violet · Automatizaciones = `#10b981` emerald · Software = `#f59e0b` amber | `globals.css:60-63`: `--color-ds-accent-ia: #10b981` · `--color-ds-accent-automation: #f59e0b` · `--color-ds-accent-software: #8b5cf6`. **`AGENTS.md` tiene IA y Software invertidos.** `CLAUDE.md` sí coincide con el CSS |
| 5 | `AGENTS.md` | "IA: Anthropic SDK (Claude Haiku 4.5)" | El runtime del chatbot es **Gemini 2.5 Flash sobre Vertex** (`createBot.ts:88`, `handleChatRequest.ts:829-931`). `LlmProvider` tiene los tres, pero el default sembrado es `GOOGLE` |
| 6 | `README.md` tabla de rutas | Lista `/admin/_design` como playground | **No existe.** `find src/app -type d -name "_design"` → vacío. El playground real es `/styleguide` |
| 7 | `README.md` tabla de rutas | No lista `/setter` ni `/admin/leads` ni `/admin/leados` | Existen, 8.447 + 11.230 líneas |
| 8 | `README.md` | "`docs/operations/` — 6 workflows operativos" | 13 archivos en `docs/operations/` |
| 9 | `CLAUDE.md` | "TypeScript strict · Never use `any`. Zero exceptions" | `next.config.ts:31-33` → `typescript: { ignoreBuildErrors: true }`. El build **no verifica tipos**; la regla depende de correr `tsc` aparte |
| 10 | `CLAUDE.md` (Navegación) | En portales "`triggerTransition()` no aplica (el Shutter no existe ahí)" | `setter-nav.tsx:36-44` usa `triggerTransition()` para toda la navegación del rail del setter, y su comentario dice "decisión cerrada · CLAUDE.md". Las dos afirmaciones se contradicen |

### Hallazgo de seguridad detectado al pasar (fuera de scope de A1, se anota y se reporta)

`next.config.ts:83-88` aplica `X-Frame-Options: DENY` a `/(admin|dashboard)(.*)`. **`/setter` no está en esa lista.** El único otro control es la CSP con `frame-ancestors 'none'`, que está en modo `Content-Security-Policy-Report-Only` (`:66`) — es decir, no se aplica. La zona del setter es embebible en un iframe de terceros.

---

## 8. Resumen del acoplamiento, en una línea cada uno

- **Lo que NO se separa sin cirugía:** la base de datos (un schema, un `User`, `Project.osLeadId`), la sesión (una cookie, un `AUTH_SECRET`, un enum `Role`), el middleware (un archivo para tres zonas) y el root layout (el sitio público envuelve a los portales).
- **Lo que se movería copiando:** `lib/leados` entero, `app/(protected)/setter` entero, `docs/manual-usuario`, las suites de test del setter y `/styleguide`.
- **La frontera real no es setter-vs-cliente:** es **LeadOS (setter + `admin/leads` + `admin/leados` + `admin/fg2-lab` + `api/cron/os-follow-up`) vs. el resto**. El setter solo no es una unidad separable — `lib/leados` lo comparte con el admin.

> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Arquitectura

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/ARQUITECTURA.md`.
> **Esta página se genera desde el Atlas.** La fuente es `docs/auditoria-2026-10/06-ATLAS/arquitectura.md`, escrita en F5 a partir de `atlas.json`; los conteos finos están en `rutas.md`, `datos.md`, `dependencias.md` y `modulos/`, que se regeneran (ver `06-ATLAS/regenerar.md`). Si cambia la forma del sistema (otra app, otro hosting, otra base), se reescribe el Atlas y se regenera esta página (atlas:arquitectura.md:3).
> Fuentes: rutas relativas a `logic-core-v3/`; `atlas:` = `docs/auditoria-2026-10/06-ATLAS/`; `INV` = `docs/auditoria-2026-10/01-INVENTARIO.md`; `CE` y `CP` = contexto estable y profundo del Drive (`docs/_insumos/drive/Franco/Work Flow/Proyecto DevelOP/Contexto/`). **[A DECIDIR]** = contradicción sin resolver.

## 1. El sistema en una frase

Una sola app Next.js 16 (`logic-core-v3/`) desplegada en Netlify, con Neon Postgres por Prisma (63 modelos), cinco tipos de persona y siete familias de servicios externos (atlas:arquitectura.md:5-63).

## 2. Zonas y quién entra

| Zona | Rutas | Rol | Herramientas del Atlas |
|---|---|---|---|
| Sitio público | `/`, 4 landings, contacto, baja de emails | anónimo | h6 |
| Acceso | login, recupero, cambio forzado, invitación, impersonación | todos | h1 |
| Portal del cliente | `/dashboard/*` | ORG_MEMBER | h2 y h3.cli-chatbot |
| Admin | `/admin/*` | SUPER_ADMIN | h4 y h3.adm-* |
| Setter / LeadOS | `/setter/*`, más `/admin/leads` y `/admin/leados` | SETTER y SUPER_ADMIN | h5 |
| Widget y API del chatbot | `/embed/[slug]`, `public/widget.js`, `/api/chatbot/[slug]/*` | visitante | h3.vis-* |
| Crons | `/api/cron/*` | `CRON_SECRET` | — |

Fuente: atlas:arquitectura.md:17-25, 67-72; herramientas en atlas:atlas.curado.json:5-355.

- El proxy reparte por rol: SUPER_ADMIN → `/admin`, ORG_MEMBER → `/dashboard`, SETTER → `/setter` (src/proxy.ts:10-16; atlas:arquitectura.md:67). **[A DECIDIR]** raíz:CLAUDE.md:109 lista un rol CLIENT con acceso a `/dashboard` que el proxy no admite.
- La frontera real del código es LeadOS (setter, admin/leads, admin/leados, fg2-lab y el cron os-follow-up) contra el resto (docs/auditorias/A1-CENSO-SUPERFICIES-2026-08.md:87-100, 281-285). Peso medido en agosto: chatbot 49.592 líneas, LeadOS 21.387 (A1:207-258).

## 3. Cómo fluyen los datos (resumen del Atlas)

- **Acceso.** NextAuth v5 (`src/auth.ts`, congelado y de Franco) con contraseña, magic link o Google; la sesión lleva la organización del usuario (atlas:arquitectura.md:67).
- **Chatbot.** El widget habla con `/api/chatbot/[slug]/*`, que arma el prompt con la KB, llama a Vertex/Gemini y guarda conversaciones, mensajes, leads y eventos pasando por el helper de aislamiento. Los leads llegan al portal, al admin y, si está configurado, al CRM del cliente por n8n y a Telegram (atlas:arquitectura.md:68).
- **Portal.** Lee lo de su organización y las integraciones conectadas (GA4, Search Console, Google Business Profile, Tiendanube, Cal.com); los resúmenes con IA se generan por cron y por demanda (atlas:arquitectura.md:69).
- **Admin.** Único lugar con lecturas cross-tenant legítimas; hoy el SUPER_ADMIN lo exige solo el layout (SEC-023) (atlas:arquitectura.md:70).
- **Setter.** Pipeline comercial interno: `OsLead*`, agenda con Cal.com, manual del lead y revisión de demos (atlas:arquitectura.md:71).
- **Crons.** Netlify dispara 3 scheduled functions; otros 3 crons están solo en `vercel.json` y no corren (BUG-047); el detector de alertas no tiene disparador (FAL-016) (atlas:arquitectura.md:72).
- **Emails.** Brevo y Resend conviven, con varios remitentes (DEU-070) (atlas:arquitectura.md:73).
- **Observabilidad.** Sentry depende de `NEXT_PUBLIC_SENTRY_DSN` en el build (FAL-030) y las integraciones casi no reportan (FAL-029) (atlas:arquitectura.md:74).
- **Respaldo.** El backup diario nunca corrió por falta de secrets (BUG-171) (atlas:arquitectura.md:75).

## 4. Aislamiento multi-tenant

- Sin RLS: el aislamiento es por helper (`forOrg` y `unsafeGlobalQuery` en `src/lib/isolation/`), con where compuesto, guard atómico, escape explícito y greppable, regla de lint estructural y golden suite (CE:29; CP:91-93; docs/motor-whatsapp/bitacora.md:110-150).
- LeadOS aísla por `OsLead.assignedToId`, no por `organizationId`, a propósito (CE:30; docs/leados-alta-setter.md:3-6; src/lib/leados/ownership.ts).
- Los helpers viejos `assertTicketBelongsToOrg` y `assertProjectBelongsToOrg` (docs/bitacora-roadmap.md:6727-6745) no tienen referencias en `src`: los reemplazó `src/lib/isolation`.
- Las server actions no pasan por el middleware: cada una necesita su propio guard; un gate en un layout es solo de render (docs/baselines/2026-07-auditoria-seguridad.md:45, 60-62). Caso abierto: `runPreflightChecks` es `'use server'` sin guard de rol (src/modules/chatbot/server/admin/preflightChecks.ts:1-13).

## 5. El runtime del chatbot

- Recorrido: widget → `POST /api/chatbot/[slug]/chat` → validación de origen contra `allowedDomains` y rate limit → resolución del bot (cache 60 s) → reserva atómica de cuota → prompt con identidad, KB y reglas → tools filtradas por plan → `streamText` a Vertex → `onFinish` persiste en `$transaction` (docs/auditoria-seguridad-2026-05.md:388-417; docs/audit-chatbot-runtime.md:26-58; src/modules/chatbot/server/chat/persistTurn.ts:412).
- Modelo `gemini-2.5-flash` en Vertex (us-central1) para los tres planes (prisma/seeds/sync-plans.ts:73, 89, 105; docs/releases/v1.0.0.md:89). Un solo modelo efectivo para costo y ejecución, con fallback y WARN (src/modules/chatbot/server/llm/resolveEffectiveModel.ts:7-21).
- Latencia de referencia: p50 ~4 s, p95 ~13–14 s; Vertex se lleva cerca del 85 % (docs/baselines/2026-05-chatbot-runtime.md:6, 14-21).
- Historial: ventana de 30 mensajes y cap duro de 40 con degradación a WhatsApp (src/modules/chatbot/shared/historyPolicy.ts:31, 61; src/modules/chatbot/server/chat/degradedResponse.ts:22).
- Atribución UTM first-touch: se escribe solo en el create de `Conversation`, el lead la hereda y se sanitiza en silencio (docs/sprints/utm-1-captura.md:47-56, 94-113; src/modules/chatbot/shared/attribution.ts).
- Cold start: dedup del mensaje por «cola huérfana» (90 s) y retry del widget de 3 intentos (2 s y 4 s) solo en red y 5xx; `connection_failed` reemplaza al handoff ante fallas de red (docs/sprints/infra-2-cold-start-retry.md:39-53, 74-88).
- Fallas de persistencia: sink primario a stderr (Netlify Function Logs) antes de cualquier write; Sentry secundario (docs/sprints/infra-1-observabilidad.md:18, 35-42).
- Trabajo post-turno (aviso al cliente, Telegram, sync al CRM) es fire-and-forget y puede perderse con el freeze de la lambda; se aceptó sin outbox (docs/bitacora-roadmap.md:17140-17161). **[A DECIDIR]** CE:37 describe los leads al CRM «vía patrón outbox/async».
- Riesgos abiertos conocidos: `sessionId` es `@unique` global (prisma/schema.prisma:1375); temperatura fija en 0.7 aunque el admin la edite (src/modules/chatbot/server/chat/handleChatRequest.ts:952); `/widget.js` con cache de 1 h (docs/sprints/utm-1-captura.md:239-242); `handleChatRequest.ts` con 1.412 líneas.
- Packs verticales en código (`src/modules/chatbot/server/verticals/packs/{base,agencia,usados}.ts`), con `verticalPack` por defecto `base` (prisma/schema.prisma:1329).
- Evaluación: batería de 36 conversaciones (12 por pack) con 3 bots QA dedicados, asserts duros y juez LLM solo para lo perceptual (docs/sprints/q1-1-harness.md:29-45; docs/sprints/q1-2-scoring.md:12-14); el README vive en `src/modules/chatbot/evals/README.md`. Regresión del bot matsu: set FULL de 19 casos y SMOKE de 4 (scripts/regression/run-baseline.ts:14; docs/regression/smoke-2026-05-23T21-46-53-107Z.md:1-12).

## 6. Integraciones

Las credenciales, qué se cae si vencen y cómo se renuevan están en OPERACIONES.md §5 (fuente INV:95-118).

- **Vertex / Gemini**: chat, insights, brief y resumen ejecutivo. Credencial vencida hoy (INV:101).
- **Anthropic**: insights de Resultados y borrador de respuesta a reseñas (INV:102).
- **Google Business Profile**: descubrimiento de cuenta y local con fetch crudo a la API v1 y `gbpLocationId` compuesto para v4; nunca verificado contra una cuenta real; tokens en claro (docs/sprints/p3-a-1-gbp-connection.md:29-37, 73-94; prisma/schema.prisma:359, 367, 375).
- **Cal.com**: la agenda del setter usa la API v2 sin key (src/lib/integrations/cal-com-v2.ts:20; docs/b7-probe-cal-com.md:100-105); `getCalSummary` sigue en v1, apagada el 8 de abril de 2026 (src/lib/integrations/cal-com.ts:4; docs/b7-probe-cal-com.md:14). LeadOS aborta si hay más de una org con `calComUsername` (src/lib/leados/agenda.ts:70-81).
- **GA4 y Search Console**: service account con rol Viewer por propiedad de cada cliente (docs/onboarding-data-connections.md:32-58).
- **Tiendanube, PageSpeed, Telegram, n8n, Brevo, Resend**: OPERACIONES.md §5.
- **Motor WhatsApp (360dialog)**: módulo, webhook `src/app/api/motor/webhook/[channelToken]/route.ts`, schema con FKs compuestas y adaptadores de entrada y salida; latente: nada consume los entrantes y el envío no tiene llamadores (docs/motor-whatsapp/bitacora.md:17, 352, 468, 583; INV:112).

## 7. Datos

- 63 modelos (atlas:arquitectura.md:27). Quién lee y escribe cada tabla: `atlas:datos.md`.
- Planes: modelo `Plan` con FK `planId` (prisma/schema.prisma:606), que reemplazó a `Subscription.planName` (docs/audits/2026-05-auditoria-db.md:240-321).
- Dos pipelines de leads separados: `LeadStatus` (CRM interno) y `ChatbotLeadStatus` (tenants) (prisma/schema.prisma:1072, 1528).
- `RateLimit` persistente en Neon (prisma/schema.prisma:1765).
- 86 migraciones al 2026-09-06 (docs/bitacora-beta-3.md:10945).

## 8. Dónde mirar

- Cada ruta con su auth, rol y tenant: `atlas:rutas.md`.
- Modelo de datos: `atlas:datos.md`. Dependencias entre módulos: `atlas:dependencias.md`. Una ficha por módulo: `atlas:modulos/`. Ramas y worktrees: `atlas:ramas.md` (atlas:arquitectura.md:77-84).
- Credenciales y operación: OPERACIONES.md. Motor y reglas de LeadOS: LEADOS.md.

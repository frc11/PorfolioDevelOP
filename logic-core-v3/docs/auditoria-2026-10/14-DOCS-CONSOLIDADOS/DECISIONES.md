> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Decisiones

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/DECISIONES.md`.
> Solo decisiones **vigentes**, deduplicadas, con fecha y fuente; la columna «En el código» dice dónde se ve en la base. Las que las fuentes contradicen **no están acá**: van a la lista `a_decidir` de E11 y se marcan **[A DECIDIR]** donde se las nombra. Una decisión nueva se agrega con ID, fecha y fuente; una que cambia se mueve a «Reemplazadas», no se borra.
> Fuentes: rutas relativas a `logic-core-v3/`; `raíz:` = raíz del repo; `drive:` = `docs/_insumos/drive/`; `CE` y `CP` = contexto estable y profundo del Drive.

## A. Producto y oferta

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-01 | Tres planes del chatbot (Starter, Pro, Business) con gating en 7 dimensiones; el modelo `Plan` con FK `planId` reemplaza `planName`; `planId` nullable con fallback a Starter | 2026-05-21/22 | docs/audits/2026-05-auditoria-db.md:240-321; docs/bitacora-roadmap.md:1977-2030 | prisma/schema.prisma:606; prisma/seeds/sync-plans.ts:66-114 |
| D-02 | Los módulos premium son add-ons fuera del plan; se piden con `requestUpsellAction`, sin autoactivación; `User.unlockedFeatures` se elimina | 2026-05-23 | docs/bitacora-roadmap.md:2495-2501; docs/audits/2026-05-auditoria-db.md:155, 330 | schema sin `unlockedFeatures` |
| D-03 | El portal es para el dueño no técnico: todo lo técnico (URLs, secrets, modelos, KB editable) vive en el admin | 2026-05 (CC.1) | docs/bitacora-roadmap.md:9760; CE:63 | — |
| D-04 | El webhook y el secret de n8n los configura SUPER_ADMIN; el cliente solo ve «CRM conectado» | 2026-05 (CC.2) | docs/bitacora-roadmap.md:9881-9900 | src/modules/chatbot/server/admin/integrations/ |
| D-05 | Retry del CRM: 3 intentos en vuelo más reintento manual; sin cron hasta que haya volumen | 2026-05-24 | docs/roadmap-pendientes.md:9-14 | — |
| D-06 | No se inventan cifras ni casos; sale «+47 negocios»; lo que falta queda marcado y visible | 2026-07-30 | docs/sprints/sprint-b05-sanidad-sitio.md:22-30; raíz:PRODUCT.md:75, 83 | `+47` no aparece en `src` |
| D-07 | Motor de Reseñas con 3 estados (locked, connecting, operational) donde el gating comercial le gana al técnico; la vitrina lleva al LockedView como único camino de pedido | 2026-07-04 | docs/sprints/p3-a-2-venta.md:18-31, 158-193 | LockedView.tsx:151; services/page.tsx:325 |
| D-08 | Campaña nula = «Sin campaña», nunca el utm crudo; sin campañas, estado vacío honesto | 2026-07-04 | docs/sprints/p4-1-render-utm.md:26-33 | src/lib/dashboard/lead-origin.ts:105-108 |
| D-09 | Fuera del portal los datos falsos: TrendChip oculto, sin «Fuente principal: Google Ads», nunca `result.error` al cliente | 2026-06 | docs/client-portal/changelog/inicio.md:100; raíz:lane-resultados-redesign-log.md:130-132 | — |

## B. Chatbot y runtime

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-10 | Verticales en código: un vertical nuevo es un PR, nunca un bot separado ni un fork | 2026-07-06 | drive:Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:34; CE:35 | src/modules/chatbot/server/verticals/packs/ |
| D-11 | La KB nunca se autoactualiza: toda sugerencia de IA pasa por aprobación humana | 2026-07 | HANDOFF-cierre-sesion-evolucion.md:36; CE:34 | — |
| D-12 | Señales legacy del lead en dual-write, sin fecha de salida, porque las ve el cliente | 2026-07-06 | HANDOFF-cierre-sesion-evolucion.md:35 | — |
| D-13 | Cap duro de unos 40 turnos con degradación a WhatsApp; el server trunca el historial en vez de devolver 400 (D-C2) | 2026-07-06 | drive:Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:13; drive:Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md:37 | src/modules/chatbot/shared/historyPolicy.ts:31, 61 |
| D-14 | La reserva de turnos en el chat es del proyecto agenda, no del bot (D-C3) | 2026-07-06 | ROADMAP-CHATBOT-bloques-C.md:14 | — |
| D-15 | Sin failover Vertex→Anthropic (D-C4) | 2026-07-06 | ROADMAP-CHATBOT-bloques-C.md:15; CP:207 | — |
| D-16 | GCP en un solo proyecto; se revisa con el cliente activo número 5 | 2026-07-06 | ROADMAP-MEJORA-post-auditoria.md:50; HANDOFF-cierre-sesion-evolucion.md:41 | — |
| D-17 | `onFinish` en `$transaction` antes que paralelizar writes | 2026-07-07 | docs/consolidacion-planoA-runtime.md:76 | src/modules/chatbot/server/chat/persistTurn.ts:412 |
| D-18 | UTM first-touch: solo en el create de `Conversation`, el lead la hereda, sanitización silenciosa | 2026-07-04 | docs/sprints/utm-1-captura.md:47-56, 94-113 | src/modules/chatbot/shared/attribution.ts |
| D-19 | Cold start: dedup de 90 s, retry de 3 intentos (2 s y 4 s) solo en red y 5xx, sin timeout de cliente; `connection_failed` en vez del handoff | 2026-07-06 | docs/sprints/infra-2-cold-start-retry.md:39-53, 74-88 | dedup.ts; chatRetryPolicy.ts |
| D-20 | Fallas de persistencia: sink a stderr antes de cualquier write; Sentry secundario | 2026-07-05 | docs/sprints/infra-1-observabilidad.md:18, 35-42 | `logPersistFailure` en handleChatRequest.ts y persistTurn.ts |
| D-21 | Widget por iframe más script vanilla, sin React en el sitio del cliente; CORS dinámico por `allowedDomains` del bot | 2026-05 | STATUS.md:217-218 | public/widget.js; src/lib/security/validate-origin.ts |
| D-22 | Evals con 3 bots QA dedicados (nunca demo ni de cliente); asserts duros y juez LLM solo para lo perceptual, modelo por `EVALS_JUDGE_MODEL` | 2026-07-05 | docs/sprints/q1-1-harness.md:29-45; docs/sprints/q1-2-scoring.md:12-14, 26-29 | evals/scoring/judge.ts:29 |
| D-23 | Rate limit persistente en Postgres (UPSERT atómico), no en memoria; presets por sesión y por bot | 2026-05 (B14.1) | docs/bitacora-roadmap.md:9326-9345; docs/auditoria-seguridad-2026-05.md:158 | prisma/schema.prisma:1765; src/lib/rate-limit/limiter.ts |
| D-24 | `/smoke` se elimina; `/health` queda en el carril de seguridad | 2026-07 | ROADMAP-MEJORA-post-auditoria.md:5, 52; docs/consolidacion-planoA-runtime.md:35, 40 | commit 02a2f812 |
| D-25 | La agenda del setter usa Cal.com v2 sin API key para slots y bookings | 2026-06-12 | docs/b7-probe-cal-com.md:100-105 | src/lib/integrations/cal-com-v2.ts:20 |
| D-26 | GBP con fetch crudo a la API v1, sin agregar googleapis; `gbpLocationId` compuesto | 2026-07-04 | docs/sprints/p3-a-1-gbp-connection.md:29-37, 80-94 | — |

## C. Datos

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-27 | `LeadStatus` (CRM interno) y `ChatbotLeadStatus` (tenants) no se fusionan | 2026-05-21 | docs/audits/2026-05-auditoria-db.md:158 | prisma/schema.prisma:1072, 1528 |
| D-28 | `ChatbotEvent.type` queda String; solo role, intent y level son enum | 2026-05-21 | docs/audits/2026-05-auditoria-db.md:154 | — |
| D-29 | El project huérfano va a la org develop y `Project.organizationId` pasa a NOT NULL | 2026-05-21 | docs/audits/2026-05-cleanup-db-dev.md:145-161 | — |
| D-30 | `chatbot_events` se purga a los 30 días con un cron diario | 2026-07-11 (T0.2) | docs/bitacora-roadmap.md:13516 | src/app/api/cron/cleanup-old-events/route.ts:14 |
| D-31 | No se borran índices mirando la DB dev; recién con prod viva 2 semanas y `pg_stat_reset` | 2026-05-25 | docs/roadmap-pendientes.md:94-101 | — |
| D-32 | Guard anti-prod en los seeds (`ALLOW_PROD_SEED=1` para forzar) y contraseñas de seed por env var sin default; sync-plans y sync-premium-modules corren contra prod a propósito | 2026-06-17 | docs/bitacora-beta.md:18-26 | prisma/seed-guard.ts |
| D-33 | El seed crea `setter-qa` con `passwordResetRequired: false` sin tocar el camino real de auth | 2026-06-13 | docs/b8a-auditoria.md:76-79 | prisma/seed.ts:157, 165 |

## D. Plataforma y operación

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-34 | Backups: `pg_dump` diario 06:00 UTC por GitHub Actions contra la conexión directa, GPG AES256, artifact de 30 días y restore-test; sin storage externo | 2026-05-26 (B14.3) | docs/bitacora-roadmap.md:9446-9532; docs/operations/neon-backups.md:5-43 | raíz:.github/workflows/db-backup.yml:41 |
| D-35 | Cada cron es una Netlify Function real que llama a la ruta por HTTP | 2026-07-11 | docs/bitacora-roadmap.md:13841-13850 | netlify/functions/ (3); netlify.toml:25-32 |
| D-36 | `CRON_SECRET` por `Authorization: Bearer` o `X-Cron-Secret`, con helper compartido que falla cerrado | 2026-08 (H.2) | docs/bitacora-roadmap.md:15846-15870 | src/lib/cron/cron-secret.ts:40-44 |
| D-37 | Migraciones: nunca `migrate reset`; deploy aditivo con el SQL a la vista; con drift, `migration.sql` a mano y no `migrate dev`; nada se aplica a la Neon compartida sin commit y push | 2026-06/07 | raíz:CLAUDE.md (reglas no negociables); docs/microaudit-frozen-frontera-CO.md:83-115; docs/admin-changelog/Operaciones rdc.md:66, 103; drive:Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:74 | — |
| D-38 | Gate de verificación: CI en la raíz en push y PR con tipos e invariantes; `check:invariants` descubre la lista desde package.json; sin `ignoreBuildErrors` | 2026-07/08 | docs/bitacora-beta-3.md:5182-5200; docs/audit-repo-20260707.md:235; docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md:54-58 | raíz:.github/workflows/ci.yml:63-105; next.config.ts:31-36; scripts/run-invariants.mjs |
| D-39 | OAuth state firmado con HMAC; `sessionVersion` invalida el JWT tras un reset; middleware global en `proxy.ts` | 2026-06/07 | docs/audits/2026-06-revalidacion.md:90; docs/baselines/2026-07-auditoria-seguridad.md:2934 | prisma/schema.prisma:294; src/proxy.ts |
| D-40 | `/setter` con `X-Frame-Options: DENY` y `frame-ancestors 'none'`; la CSP global queda en Report-Only | 2026-08 | docs/auditorias/A1-CENSO-SUPERFICIES-2026-08.md:275-279 | next.config.ts:72, 96-113 |
| D-41 | Cache del admin con `unstable_cache` (30/60 s) y `revalidateTag` | 2026-05-19 | docs/baselines/2026-05-admin-performance.md:52-62 | admin/clients/page.tsx; admin/layout.tsx; admin/leads/page.tsx |
| D-42 | Los PNG de los diagnósticos no van al repo; la fuente es MANIFIESTO y REPORTE | 2026-08-20 | docs/diagnostico-visual-2026-08/.gitignore:1-6 | — |
| D-43 | Aislamiento sin RLS, por helper; LeadOS por `assignedToId` | 2026-07 | CP:91-93; docs/motor-whatsapp/bitacora.md:110-150 | src/lib/isolation/; src/lib/leados/ownership.ts |

## E. Admin

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-44 | El Command Center (`/admin/agency-dashboard`) se migra a `/admin/clients/[id]` con tabs | 2026-05 | docs/sprints/alpha-RESUMEN-FINAL.md:45 | la ruta vieja no existe |
| D-45 | `/admin/_design` se borra; el playground vigente es `/styleguide` | 2026-06-28 | docs/admin-design-system-audit.md:72-78 | no hay ruta `_design` |
| D-46 | Inteligencia del admin mono-bot (slug develop); el per-tenant se archiva | 2026-06 | docs/admin-changelog/Admin Completo rdc.md:47; drive:Olme/Ideas de nuevas features.md:28-32 | — |
| D-47 | Borrado de cliente: archivar por defecto y borrado definitivo con confirmación por texto; la cascada opción C preserva los OsLead | 2026-06 | Admin Completo rdc.md:45; docs/admin-changelog/Clientes rdc.md:51-52 | — |
| D-48 | Avatar del cliente sin infraestructura externa (emoji, imagen base64, iniciales) | 2026-06 | Admin Completo rdc.md:46 | — |
| D-49 | El editor de tema en runtime (config-design) es no-go | 2026-06-19 | docs/admin-changelog/Configuracion rdc.md:83-92 | — |
| D-50 | Schemas Zod en `.schemas.ts` fuera de `'use server'`; los modales del admin se portalean a `body` por el `backdrop-filter` | 2026-06 | Admin Completo rdc.md:55-57; docs/admin-changelog/Leads rdc.md:72-73 | — |
| D-51 | El orden persistente del kanban (`pipelineOrder`) se difiere porque toca schema | 2026-06 | docs/admin-changelog/Leads rdc.md:47 | sin campo en schema |

## F. Sitio público

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-52 | Producción vuelve a la home clásica por restauración de archivos; el rediseño queda experimental en `origin/redesign/home`; la regresión de performance se acepta de forma declarada | 2026-08-12 | docs/bitacora-rediseno.md:3604-3610, 3683-3693 | src/app/page.tsx:7-19 |
| D-53 | CustomCursor y NoiseOverlay quedan afuera también en la home clásica | 2026-08-12 | docs/bitacora-rediseno.md:3655-3663 | src/app/layout.tsx:84-96 |
| D-54 | `sitemap.ts` solo con rutas públicas; `robots.ts` excluye dashboard, admin, setter, api, embed, login y bienvenida | 2026-07-30 | docs/sprints/sprint-b05-sanidad-sitio.md:52-56 | src/app/sitemap.ts; src/app/robots.ts |
| D-55 | Acentos por servicio: web cian `#06b6d4`, IA verde `#10b981`, automatización ámbar `#f59e0b`, software violeta `#8b5cf6` (Gate 1, opción del código). **[A DECIDIR]** AGENTS.md y PRODUCT.md siguen con otra asignación | 2026-07-30 | docs/sprints/sprint-b05-sanidad-sitio.md:58-65; raíz:DESIGN.md:125 | raíz:CLAUDE.md:99-103 y globals.css |

## G. LeadOS (zona de Franco)

| ID | Decisión | Fecha | Fuente | En el código |
|---|---|---|---|---|
| D-56 | El caliente operativo es `OsLead.caliente` y lo marca Franco; score y veredicto del setter son informativos; `gateBriefAbierto(status, caliente)` es la regla única en UI, action y server | 2026-06-27/29 | docs/bitacora-beta-2.md:179, 260, 294 | prisma/schema.prisma:880; src/lib/leados/flow.ts:81 |
| D-57 | El panel entrega una cola de 5 (el foco más 4) con dedup de novedades | 2026-09-03 | docs/bitacora-beta-3.md:10240, 10323-10340 | src/lib/leados/cola.ts |
| D-58 | Foco sticky por cookie httpOnly `leados-foco-v1`, sin DB | 2026-06-27 | docs/bitacora-beta-2.md:317 | src/lib/leados/foco-cookie.ts:22 |
| D-59 | El pin ordena el foco, no lo excluye (Sprint 6.1, A-05) | 2026-07-04 | docs/bitacora-beta-3.md:1024; docs/metodo/LECCIONES-LEADOS.md:575-580 | — |
| D-60 | Un POSTERGADO con `reactivateAt <= now` vuelve a ser accionable; el cron solo notifica (D6) | 2026-06-27 | docs/bitacora-beta-2.md:345-393 | src/lib/leados/flow.invariant.ts |
| D-61 | El manual paso por pantalla reemplaza al wizard; el motor (stages, gates, línea de envío, aislamiento) es intocable | 2026-07-04 | docs/auditorias/REGRESION-FINAL-2026-07.md:86, 132-136 | src/lib/leados/flow.ts:92 |
| D-62 | La construcción se hace en dos pantallas (Construir y Refinar, corte 3+3) | 2026-08-04 | docs/probe-construccion-p6.md:150-175 | mc1 y mc2 (A3-VIABILIDAD-DECISIONES:1180-1184) |
| D-63 | Con la cadencia agotada se limpia `nextFollowUpAt`; RECHAZADO y RESPONDIO también lo limpian | 2026-07-07 | docs/auditorias/AUDITORIA-CIERRE-2026-07.md:150-156 | os-commercial.ts:15-23 |
| D-64 | Reglas inviolables: el precio lo habla Franco; su revisión no se automatiza; el ojo no se proceduraliza; aislamiento por setter; el motor no se toca sin premortem | 2026-07-31 | docs/BRIEF-VISION-FLUJO-SETTER-v3.md:98-104 | — |
| D-65 | Alta de setter solo por credentials, con `passwordResetRequired`, `emailVerified` y sin OrgMember | 2026-06-12 | docs/leados-alta-setter.md:10-18 | src/auth.ts (Google crea ORG_MEMBER) |

Descartes de producto (registro anti-reproposición): VISION.md §7.

## Vigencia sin confirmar

No se contradicen entre fuentes, pero ninguna fuente reciente las confirma. Se revalidan antes de usarlas.

- El foco prioriza construir la demo antes que contactar (docs/bitacora-beta-3.md:2795-2800, 2026-08-04).
- Ninguna columna JSON pasa a relacional (docs/audits/2026-05-auditoria-db.md:223).
- Re-agendar tras RE_SEGUIMIENTO: no tocar hasta después del piloto (docs/b8a-auditoria.md:37-41).
- Propuestas descartadas por guardarraíl en LeadOS: auto-cerrar a PERDIDO, caliente automático por score, chequeo final asistido, bloquear toques por fecha, Gems como API (docs/auditorias/AUDITORIA-CIERRE-2026-07.md:254-260).
- Valores canónicos del admin: `p-5` en cards, `p-6` en secciones, `rounded-2xl`, `space-y-6/3`, `border-white/10`, `bg-white/[0.02]` (docs/design-system-audit.md:88-97).
- Secuencia de verticales usados → salud → inmobiliarias (CE:24-25).
- Métricas honestas como apuesta comercial número 1 (ROADMAP-MEJORA-post-auditoria.md:3).
- Identidad del visitante y cierre de conversación se diseñan juntos (HANDOFF-cierre-sesion-evolucion.md:40).
- Orden de C2: consultas sin responder, catálogo, memoria (ROADMAP-CHATBOT-bloques-C.md:12).
- Frontera de trabajo: runtime, widget y KB en el chat Chatbot; admin y dashboard en el chat Panel (drive:Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md:32).
- La causa raíz de conexión (INFRA.3) espera la firma real de prod y el DSN de Sentry (docs/sprints/infra-2-cold-start-retry.md:7-14, 130-133).
- El setter presencial vende página + chatbot; lo demás es mencionable (drive:Franco/Work Flow/handoff-producto-develop.md:153-157).

## Reemplazadas (no reabrir)

| Decisión vieja | Fuente | Reemplazo |
|---|---|---|
| Un lead accionable por vez | docs/bitacora-beta-2.md:306-341, 549 | D-57 |
| El pin excluye del foco (2.1a) | docs/bitacora-beta-2.md:556 | D-59 |
| Helpers `assert*BelongsToOrg` por modelo | docs/bitacora-roadmap.md:6727-6745 | D-43 |
| E2E como estrategia primaria, sin unit tests | docs/sprints/alpha-RESUMEN-FINAL.md:50 | D-38 |
| Reportes sin opt-in | STATUS.md:219 | existe `executiveReportOptOut` (prisma/schema.prisma:387) |
| Upstash Redis para el rate limit | docs/auditoria-seguridad-2026-05.md:158 | D-23 |
| Planes profesional / ai-care / maintenance por `planName` | docs/audits/2026-05-auditoria-db.md:294-297 | D-01 |
| Badge de ubicación con raya | docs/sprints/sprint-b0-bis-cierre.md:35-40 | la home clásica volvió al guion (About.tsx:245, 280) |
| Preloader importa MarketingIntro dinámico (plan A) | docs/sprints/sprint-b0-bis-cierre.md:25-33 | plan B: BrandedIntroCanvas dinámico dentro de MarketingIntro (MarketingIntro.tsx:19-20) |

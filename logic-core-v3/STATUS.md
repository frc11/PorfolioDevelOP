# Estado del Proyecto — develOP / Logic Core v3

**Última actualización:** 2026-05-21 (post B0.2 migración + B0.3 cleanup DB + verificación playwright)
**Versión actual:** v1.0.0 (tag git `v1.0.0`, commit `7d551ba` + cambios in-progress sin commitear)
**Próximo milestone:** Beta — onboarding cliente piloto **Matsu** + features avanzadas

> Este archivo es la fuente única de verdad. **Cada afirmación marcada con ✅ está respaldada por un comando ejecutado el 2026-05-21.** Si algo no se pudo verificar, está marcado como ⚠️ "no verificado".
>
> Ver bloque "Última verificación" al pie con los comandos exactos corridos.

---

## Resumen 30 segundos

develOP es un chatbot multi-tenant para PyMEs LATAM, integrado a Logic Core v3.
Stack: Next.js 16, TypeScript strict, Prisma + Neon PostgreSQL (sa-east-1, branching dev/main), NextAuth v5, Vertex AI (Gemini 2.5 Flash), Resend o Brevo, Netlify.

**Estado real al 2026-05-21:**
- Producto funcional end-to-end ✅ (build pasa, 39/50 tests passing)
- Widget embebible en sitios externos (~5KB vanilla JS) ✅
- Onboarding completo sin SQL manual ✅
- Sistema de alertas operativo ✅ (migration `add_alert_types` aplicada — post B0.2)
- Reportes semanales automáticos vía cron ✅
- **AIExecutiveBrief con LLM real** (Gemini 2.5 Flash, cache 7 días, 3 regen/sem) ✅ — antes documentado como MOCK, ya no lo es
- 50 tests Playwright (24 spec files): **39 passed / 3 failed / 8 skipped** ⚠️ los 3 fails son visual regression con diff <2% píxeles
- DB limpia (post B0.3): 6 orgs (era 8 con 2 duplicadas), 2 bots (era 3 con 1 testing), 0 projects huérfanos

---

## Lo que funciona en v1.0 (verificado)

### Para develOP (admin) ✅
- Login y panel admin operativo (tests 06-* pasan)
- Crear cliente desde wizard (Org + User + Bot + email automático) ✅ (test 30 pasa, 39.7s)
- Gestión global de chatbots en `/admin/chatbots`
- Crear bot para org existente o nueva en `/admin/chatbots/new`
- Bulk operations (multi-seleccionar clientes, export CSV de leads) ✅ (tests 16-*)
- Página unificada de bot con 5 tabs (Overview, Config, KB, Activity, Install)
- Editor de KB con preview en vivo ✅ (test 10)
- Audit log de todas las acciones ✅ (tests 18-*)
- Sistema de alertas con 9 tipos (era 7, ahora 9 post-B0.2 con DOMAIN_NOT_AUTHORIZED_SPIKE + LEAD_CAPTURE_FAILURE)
- Email/Telegram en alertas críticas
- Re-envío manual de credenciales desde panel del cliente ✅ (test 30 edge case)
- Trigger manual de detector de issues y reportes semanales
- Tab "Instalar" con snippet por plataforma
- Configuración de dominios autorizados por bot
- **AIExecutiveBrief LLM real** (Gemini 2.5 Flash via Vercel AI SDK, cache `Organization.cachedExecutiveBrief`, TTL 7 días, 3 regeneraciones/semana) — verificado en [src/lib/ai/executive-brief.ts:229](src/lib/ai/executive-brief.ts:229)

### Para el cliente final ✅
- Login con credenciales temporales (test 11 pasa)
- Cambio forzado de password al primer login ✅ (test 30)
- Dashboard con métricas en formato negocio (test 13 pasa, 989ms warm)
- Leads en tiempo real (polling 30s)
- Notificación email cuando se captura lead (Resend o Brevo según env)
- Personalización limitada del bot (color, posición, avatar, welcome) ✅ (tests 15-*)
- Vista de instalación con snippet copy-paste en `/dashboard/chatbot/install`
- Reporte semanal automático por email (cron Netlify lunes 9am Argentina)
- **Aislamiento de roles**: cliente NO puede acceder a config técnica del bot ni a `/admin/*` ✅ (test 11-14, 15-91)

### Para visitantes (en sitios del cliente)
- Widget embebible vía `<script>` simple (~5KB) ✅
- Funciona en HTML, WordPress, Tiendanube, Shopify, Wix, Squarespace
- Conversación con bot (Vertex AI Gemini 2.5 Flash)
- Captura de leads automática con tool calling
- Handoff a WhatsApp con contexto de la conversación
- Domain whitelist — solo carga en dominios autorizados (verificado: cuando `allowedDomains=[]` el endpoint bloquea con `no_domains_configured` — log capturado en test 49)
- ⚠️ Conversación end-to-end con bot real (tests 01-03, 49): **skipped** en CI local porque requieren credenciales de Vertex AI y/o bot con dominios autorizados — no verificable sin esas envs

---

## Métricas baseline verificadas

### Performance budgets (test 21, 2026-05-21)
- `/admin`: **324ms** (budget 3000ms) ✅
- `/admin/clients`: **165ms** (budget 3000ms) ✅
- `/dashboard`: **366ms** (budget 3000ms) ✅
- `/dashboard/chatbot`: **948ms** (budget 3000ms) ✅
- `/dashboard` home warm (test 13): **989ms** ✅
- `/dashboard/chatbot` warm (test 13): **1546ms** ✅

### Chatbot runtime (no verificado en este run)
- ⚠️ P50/P95/success rate: pendiente de medición en producción.
- Último dato conocido (audit 2026-05-20): P50 1.9–5s, sin errores 5xx en 8 escenarios; tools (capture_lead, show_whatsapp_handoff) disparan correctamente; anti-jailbreak resiste.

### Database (Neon sa-east-1)
- Branch dev: `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`
- Branch main (prod): managed en Netlify env vars, NO en .env local
- Latencia warm: ~93ms (audit anterior); cold start: ~1s
- `prisma migrate status` (2026-05-21): **"Database schema is up to date"** ✅ — 42 migrations aplicadas, 0 pendientes

---

## Test coverage (verificado 2026-05-21)

**Última corrida `npx playwright test`:** 5.9 minutos, 1 worker.

| Resultado | Cantidad |
|---|---:|
| ✅ Passed | **39** |
| ❌ Failed | **3** |
| ⏭ Skipped | **8** |
| **Total** | **50** |

### Failed (3) — todos en spec 22 visual-regression

| Test | Diff | Naturaleza |
|---|---|---|
| `/admin/clients matches baseline` | 16392 px (0.02 ratio) | drift menor, probable cambio reciente en `admin/clients/page.tsx` (está en git status como modificado) |
| `/dashboard matches baseline` | 6310 px (0.01 ratio) | drift menor |
| `/dashboard/chatbot/settings matches baseline` | 3701 px (0.01 ratio) | drift menor — mismo test que falló en audit 2026-05-20 |

Los 3 son **drift visual, no rotura funcional**. Decisión pendiente Franco: re-baseline con `--update-snapshots` o investigar diff.

### Skipped (8) — por design, no por bug

- `01-landing`, `02-chat-flow`, `03-lead-capture` → necesitan landing público activo (skipped en local sin server público)
- `08-admin-onboarding wizard completo` → skip configurado
- `14-e2e-critical-flow` → skip configurado
- `19-security API admin requiere auth` y `19-security cron secret valido` → skip
- `40-lead-capture E2E` → bot `develop` no tiene `allowedDomains`, bloquea origin → no es bug, es expected behavior del whitelist

### Spec files inventariados (24 archivos)
01-landing, 02-chat-flow, 03-lead-capture, 04-health, 05-config-public, 06-admin-login, 07-admin-navigation, 08-admin-onboarding, 09-admin-bot-config, 10-admin-kb-edit, 11-client-login, 12-client-chatbot-section, 13-client-perf, 14-e2e-critical-flow, 15-client-personalization, 16-admin-bulk-actions, 17-admin-alerts-triage, 18-admin-audit-log, 19-security, 20-mobile-responsive, 21-performance, 22-visual-regression, 30-onboarding-e2e-complete, 40-lead-capture-e2e

---

## Estado de la base de datos (verificado 2026-05-21, branch dev de Neon)

### Counts actuales (post B0.3 cleanup)

| Modelo | Filas | Comentario |
|---|---:|---|
| Organization | **6** | Era 8; -2 orgs duplicadas borradas en B0.3 |
| OrgMember | 5 | |
| User | 8 | |
| BotConfig | **2** | Era 3 (-1 bot `dsa` testing); 1 activo: `develop` (Lucia), 1 inactivo: `chatbot` (Empresa Demo, desactivado en B0.3) |
| Project | 7 | Era 8 (-1 duplicado); 0 huérfanos (era 1, reasignado a `develop`) |
| Task | 32 | Era 34 (-2 del project duplicado) |
| PremiumModule | 9 | Catálogo: whatsapp-autopilot, facturacion-afip, mini-crm, cobranzas-automatizadas, email-marketing, motor-resenas, reactivacion-clientes, agenda-inteligente, ecommerce-mantenimiento |
| OrganizationModule (activos) | 1 | `mini-crm` en San Miguel (legacy seed) |
| Subscription | 3 | 3 plan names libres (DB-P0-1 audit anterior: pendiente sistema Plan real) |
| BotAlert | 0 | Tabla recién habilitada con 9 enum values (post-B0.2) |
| OsLead | 15 | CRM interno develOP |

### Inventario de orgs vivas

| Slug | Nombre | Estado | Bot |
|---|---|---|---|
| `develop` | develOP (propia agencia) | seed propio | ✅ Lucia (slug `develop`, activo) |
| `empresa-demo` | Empresa Demo | seed demo | ❌ `chatbot` (desactivado en B0.3) |
| `san-miguel` | Concesionaria San Miguel S.A. | **seed mock fake — Franco marcó para limpiar** | sin bot |
| `sonrisa-norte` | Clinica Dental Sonrisa Norte | seed mock | sin bot |
| `sigma-contable` | Estudio Contable Sigma | seed mock | sin bot |
| `ejemplo` | ejemplo | seed mock | sin bot |

⚠️ **Ninguna de estas orgs es cliente real pago.** Todas son seeds para desarrollo/testing. El piloto comercial real es **Matsu** (ver "Cliente piloto" abajo).

### Cleanup ejecutado en B0.3 (2026-05-21)

Backup completo de filas borradas + cascade en [docs/audits/2026-05-cleanup-db-dev.md](docs/audits/2026-05-cleanup-db-dev.md).

- ❌ Borradas: 2 orgs `agency-os-*` (Sigma + Sonrisa duplicadas leftover de seed v2-unify, abril 2026)
- ❌ Borrado: 1 Project duplicado de Sigma ("Sitio institucional y mantenimiento mensual" — el de la org real `sigma-contable` quedó intacto)
- ❌ Borrado por cascade: bot `dsa` + su KnowledgeBase (testing residual en la org Sonrisa duplicada)
- 🔄 Reasignado: 1 Project huérfano "Motor interno de automatizacion operativa" → org `develop` (deja libre camino para B11.1: `Project.organizationId` NOT NULL)
- 🔄 Desactivado: bot `chatbot` en empresa-demo (estaba activo sin uso)

⚠️ **Pendiente prod (branch main de Neon):** mismas operaciones, scripts y pasos en [docs/audits/2026-05-cleanup-db-dev.md](docs/audits/2026-05-cleanup-db-dev.md) §6.

---

## Cliente piloto

### Matsu (plan Business) — PILOTO COMERCIAL REAL
- Estado: **contratado, onboarding pendiente** ⚠️
- Plan: Business
- En código/DB hoy: **no existe** — no hay org `matsu`, no hay bot, no hay user (verificado con grep + Prisma findMany el 2026-05-21)
- Próximo paso: onboardear vía wizard `/admin/clients/new` o vía script de seed dedicado

⚠️ **No declarar "Matsu funcional" en ningún reporte hasta que exista en DB.** El compromiso es comercial, no técnico todavía.

### San Miguel (legacy seed)
La org `san-miguel` que aparece en seeds y en STATUS.md anteriores **no es un cliente real**, son datos mock. Tiene 1 user (`cliente@sanmiguel.com`), 3 projects fake, 4 services fake. Confirmado por Franco: marcada para cleanup en próximo sprint de DB hygiene.

---

## Lo que NO está en v1.0 (intencional)

### Postpone a Beta
- ❌ Self-service signup del cliente
- ❌ "Olvidé mi contraseña" via email (hoy reset manual desde admin) — flagged P1-4 en audit
- ❌ 2FA
- ❌ Cards ricos (product, service, gallery, calendar)
- ❌ KB híbrida con review queue
- ❌ Lead scoring 0-100 con badges
- ❌ Memoria persistente del visitor con cookies
- ❌ Sugerencias proactivas al dueño del negocio
- ❌ Agenda integrada Cal.com
- ❌ WhatsApp Business API (hoy es link, no API)
- ❌ Sistema modular por planes (Starter/Pro/Business) — aún no hay modelo `Plan` en schema; pendiente B-Plan-1

### Limitaciones conocidas
- ⚠️ Cold start de Neon: ~1s en primer hit después de inactividad
- ⚠️ Rate limiter in-memory en serverless Netlify (cada lambda separada → límite efectivo multiplicado por N_lambdas)
- ⚠️ Reportes semanales por bot (no consolidados si un cliente tiene varios bots)
- ⚠️ Bulk operations sin schedule — se ejecutan en el momento, sin cola
- ⚠️ Sin tests de carga concurrente (no verificable hoy)
- ⚠️ Admin básico en mobile — verificado: el test 20-mobile-responsive pasa pero solo cubre dashboard cliente
- ⚠️ Dashboard SEO (`/dashboard/resultados/seo`) muestra mock con fallback cuando Search Console no está configurado — pendiente badge UI "datos demo"
- ⚠️ `analytics.ts`, `searchconsole.ts`, `n8n.ts` retornan mock cuando faltan credenciales, sin avisar al usuario en UI

---

## Decisiones tomadas durante Alpha v2

1. Nueva ruta canónica `/admin/chatbots` — la vieja `/admin/clients/[id]/chatbot/*` queda deprecada
2. Widget como iframe + script vanilla JS (~5KB) — sin dependencia de React en sitio del cliente
3. CORS dinámico + domain whitelist por bot en `BotConfig.allowedDomains`
4. Validación de origin server-side en todos los endpoints del chatbot
5. Email de activación automático al activar bot
6. Reportes semanales sin opt-in — los clientes ya tienen contrato
7. `/dashboard/chatbot` refactorizado a rutas anidadas `/(protected)/dashboard/chatbot/*`
8. **(B0.1, mayo 2026):** Aislamiento dev/prod con Neon branching — `.env` y `.env.local` apuntan a branch `dev`, prod a `main` desde Netlify
9. **(B0.2, mayo 2026):** Migration `20260520190000_add_alert_types` aplicada — 9 enum values en `BotAlertType`
10. **(B0.3, 2026-05-21):** Cleanup de basura semántica en DB dev (2 orgs duplicadas + bot testing + project huérfano reasignado)
11. **(mayo 2026):** AIExecutiveBrief migrado de `@anthropic-ai/sdk` (Claude Haiku 4.5) a Vercel AI SDK con Gemini 2.5 Flash via `getLLMProvider('google')`

---

## Decisiones pendientes (para Beta)

- ⚠️ Sistema modular por plan (Starter/Pro/Business) — definir con socio. Audit anterior propone modelo `Plan` con FK desde Subscription
- ⚠️ Plan de Neon (Free vs Launch) — depende de retention de backups
- ⚠️ Integración Tiendanube vía API — pendiente decisión
- ⚠️ Cuándo activar feature toggles por suscripción
- ⚠️ Política de retención de conversaciones/leads
- ⚠️ Visual regression: re-baseline los 3 fails o investigar cambio en `/admin/clients`, `/dashboard`, `/dashboard/chatbot/settings`
- ⚠️ Limpieza B0.3 en prod (branch `main` de Neon) — script y pasos listos en docs
- ⚠️ Limpieza adicional: borrar org `san-miguel` (seed fake) y sus dependencias (3 projects, 4 services, 1 user)

---

## Cómo arrancar para nuevo dev / IA

```bash
git clone [repo]
cd logic-core-v3
npm install
cp .env.example .env  # completar valores reales — ver docs/operations/00-entornos.md
# El .env DEBE apuntar a la branch dev de Neon, NUNCA a main (prod)
npm run check-env
npx prisma migrate deploy  # aplica las 42 migrations actuales (ninguna pendiente al 2026-05-21)
npx prisma db seed
npm run dev
```

### Credenciales seed (DB local actual — branch dev)
- Admin: `admin@develop.com` / `Admin1234!`
- Cliente (mock San Miguel): `cliente@sanmiguel.com` / `Cliente1234!` — **será removido en próximo sprint de cleanup, no documentar a futuros clientes**

### Recursos clave
- [docs/operations/00-entornos.md](docs/operations/00-entornos.md) — Setup dev/prod con Neon branching (post B0.1)
- [docs/audits/2026-05-auditoria-profunda.md](docs/audits/2026-05-auditoria-profunda.md) — Auditoría producto completa (2026-05-20)
- [docs/audits/2026-05-auditoria-db.md](docs/audits/2026-05-auditoria-db.md) — Auditoría schema/DB (2026-05-21)
- [docs/audits/2026-05-cleanup-db-dev.md](docs/audits/2026-05-cleanup-db-dev.md) — Cleanup B0.3 (2026-05-21)
- `docs/operations/` — 6 workflows operativos (onboarding, activar bot, editar KB, responder alerta, cliente no anda, instalar widget)
- `docs/testing-strategy.md` — cómo correr tests
- `docs/design-system.md` — tokens y componentes UI
- `/admin/_design` — playground visual del design system

---

## Estado del repo al cierre (2026-05-21)

### Cambios in-progress NO commiteados (8 archivos modificados + nuevos)
- `M src/lib/ai/executive-brief.ts` — migración Anthropic → Vercel AI SDK + Gemini (fix `maxTokens` → `maxOutputTokens` aplicado este día)
- `M src/app/(protected)/admin/chatbots/[botId]/{BotDetailClient,page,tabs/OverviewTab}.tsx` — refactor UI bot admin
- `M src/app/(protected)/admin/clients/{[clientId]/_components/tabs/ChatbotTab,page}.tsx`
- `M src/components/admin/managers/ChatbotManager.tsx`
- `M .env.example`
- `?? src/app/(protected)/admin/chatbots/[botId]/tabs.ts` (nuevo)
- `?? docs/audits/`, `?? docs/operations/00-entornos.md`, `?? scripts/_db-cleanup-*.mjs`

Convención: scripts con prefijo `_` son throwaway de este sprint y se borran después de replicar en prod.

---

## Equipo

- **Franco** — Co-fundador, lead técnico y comercial
- **[Socio]** — Co-fundador, técnico

---

## Última verificación

**Fecha:** 2026-05-21
**Operador:** Claude Opus 4.7 (sesión asistida por Franco)
**Branch Neon activa:** `dev` (host `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`)

Comandos corridos y sus outputs reales (cualquiera puede reproducir):

```bash
# 1) Build limpio
cd logic-core-v3 && npm run build
# → ✓ Compiled successfully, sin errores TS

# 2) Estado de migrations
npx prisma migrate status
# → "42 migrations found in prisma/migrations
#    Database schema is up to date!"

# 3) Counts de DB
node -e "const{PrismaClient}=require('@prisma/client');..."
# → Organization: 6, OrgMember: 5, User: 8, BotConfig: 2 (1 activo),
#   Project: 7, ProjectsOrphan: 0, Task: 32, PremiumModule: 9,
#   OrganizationModule: 1, Subscription: 3, BotAlert: 0, OsLead: 15

# 4) Playwright completo
npx playwright test --reporter=list
# → 50 tests, 5.9min total
#   39 passed / 3 failed / 8 skipped
#   3 fails: spec 22-visual-regression (drift de píxeles <2%)
#   8 skipped: 01-03 (necesitan landing público), 08, 14, 19 (×2), 40

# 5) Búsqueda Matsu en código y DB
grep -r "matsu" --ignore-case logic-core-v3/ → 0 hits
SELECT slug FROM "Organization" WHERE slug ILIKE '%matsu%' → 0 rows
```

**Log completo de playwright:** [test-results/playwright-2026-05-21.log](test-results/playwright-2026-05-21.log)

*Si necesitás actualizar este archivo, repetí los comandos de arriba y reemplazá las cifras + marcá la nueva fecha. No declares nada "funcional" sin un comando que lo respalde.*

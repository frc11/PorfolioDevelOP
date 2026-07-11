# Auditoría integral read-only del repo — 2026-07-07

**Método:** 6 pasadas paralelas de lectura estática (runtime core, runtime periferia/widget/KB, dashboard cliente, admin, capa compartida/prisma/provider, e inventario de roadmap para el cruce). Cero modificaciones al repo. Cada hallazgo indica **VISTO** (archivo abierto, línea leída) o **INFERIDO** (deducción de lectura estática no ejercitada en runtime).

**Línea base respetada:** INFRA.1 (sink stderr de fallas de persistencia + onError), INFRA.2 (dedup user message + retry del widget), UTM.1 (atribución first-touch), Q1.1/Q1.2 (harness de evals), P3-A (reseñas GBP), P4.1 (render UTM en panel) se tratan como aplicados; solo se reporta lo que esas mitigaciones **no** cubren.

**Etiquetas de superficie:** `[RUNTIME]` = chatbot (`/api/chatbot/*`, widget, embed, KB, scoring, packs, `src/modules/chatbot/server/*`) · `[PANEL]` = `/dashboard` + `/admin` · `[COMPARTIDO]` = prisma/schema, lib común, auth, config.

**IDs:** `RT-*` runtime core · `RE-*` runtime periferia · `PD-*` panel dashboard cliente · `PA-*` panel admin · `CO-*` compartido.

**Nota sobre el cruce (Sección C):** los bloques de roadmap "C0–C3 / T0 / MH / RB" **no existen en este repo** como identificadores (búsqueda con word-boundary en `docs/**` y raíz del workspace; "C1/C2" solo aparecen como probes IDOR del bloque B11/B-SEC y como casos de test de `tests/setter/02-isolation.spec.ts`). El cruce se hizo contra `docs/roadmap-pendientes.md`, la cola de `docs/bitacora-roadmap.md`, `docs/baselines/*`, `docs/audits/2026-06-revalidacion*.md`, `docs/auditorias/REGRESION-FINAL-2026-07.md` y `docs/motor-whatsapp/bitacora.md`. Donde el ítem externo no sea verificable, se marca **"no verificable contra roadmap externo"**.

---

## SECCIÓN A — Diagnóstico

### A.1 — [RUNTIME] Core del pipeline (`handleChatRequest`, conversación, tools, scoring, quota, provider)

**RT-1 · ALTA · Telemetría de costo calculada con el modelo equivocado — VISTO**
`src/modules/chatbot/server/chat/handleChatRequest.ts:606-607` vs `:771-776`. El modelo que corre viene del plan (`provider.getModel(plan.llmModel)`), pero el costo se calcula con el campo legacy del bot: `calculateCost(normalizeLlmProvider(resolvedBot.llmProvider), resolvedBot.llmModel, ...)`. El propio comentario B4.2 (línea 602) marca `bot.llmModel` como legacy. Si difieren, `Conversation.estimatedCostUsd` y `QuotaUsage.costUsd` registran el precio de OTRO modelo; y si `bot.llmModel` no existe en `GOOGLE_MODELS`, `estimateCost` devuelve **$0 en silencio** (`providers/google.ts:93-95`, `pricing/costs.ts:32-33`). La telemetría de costo por conversación —insumo del negocio— puede estar sistemáticamente mal o en cero.

**RT-2 · ALTA · `/api/chatbot/[slug]/smoke` quema tokens reales sin auth ni rate limit — VISTO**
`src/app/api/chatbot/[slug]/smoke/route.ts:16-42` + `server/health/smokeTest.ts:26`. GET público que dispara un `streamText` real contra Gemini, sin sesión, sin `validateOrigin`, sin rate limit. Cualquiera con un slug puede loopearlo = costo directo. Viola la regla del repo "rate-limit all public endpoints". El comment "Use sparingly — consumes tokens" no lo enforce nada.

**RT-3 · MEDIA · `Conversation.sessionId` es `@unique` GLOBAL, no por bot — VISTO**
`prisma/schema.prisma:1358` + `server/conversation/resolver.ts:70-108`. El lookup es `findFirst({ botConfigId, sessionId })` pero el unique es global: (a) el mismo sessionId bajo OTRO bot no lo ve el `findFirst` y el `create` revienta con P2002 → 500 al visitante (mismo navegador visitando dos sitios de clientes distintos); (b) `findFirst`+`create` no es atómico → dos primeros mensajes concurrentes = P2002 → 500 (el retry INFRA.2 lo tapa a medias pero quema un intento y demora el turno).

**RT-4 · MEDIA · Historial aportado por el cliente, sin cap ni reconciliación — VISTO**
`server/chat/handleChatRequest.ts:54-63, 679-691`. El body admite hasta 50 mensajes × 8000 chars (~100k tokens de input) y se manda entero a Vertex cada turno, sin truncado de turnos viejos ni verificación contra el transcript de la DB. Amplificación de costo para un cliente hostil (30 req/min por IP × ~400KB) y costo linealmente creciente para uno legítimo. El system prompt + KB completa se re-manda cada turno (solo mitigado por el implicit caching de Gemini, no controlado).

**RT-5 · MEDIA · Turnos `assistant` del body van al modelo sin verificación — VISTO**
`handleChatRequest.ts:687-690`. Un cliente puede inyectar turnos "assistant" fabricados ("ya te confirmé el precio en $X") que el modelo trata como su propia voz — esquiva el spotlighting SEC-LLM-01, que solo envuelve user/system. La defensa de pertenencia de phone/email aguanta (`captureLead.ts:228-233` lee solo filas USER de la DB), pero el steering conversacional queda abierto.

**RT-6 · MEDIA · Provider por tenant con stubs que rompen el bot, y el admin los ofrece — VISTO**
`server/llm/providers/anthropic.ts:17-19` (+ openai análogo) + `handleChatRequest.ts:606`; lado UI: `components/admin/config/tabs/AdvancedTab.tsx:17-18`. `AnthropicProvider.getModel()` lanza `ProviderNotImplementedError` — un BotConfig con `llmProvider=ANTHROPIC` rompe el 100% de los turnos con 500, sin fallback a Google. El select del admin ofrece "Claude Sonnet 4.5" (`claude-sonnet-4-5`, id que además no existe en el registry: hay `claude-sonnet-4-6`) y "Claude Haiku 4.5" — el camino al 500 está a un click de un SUPER_ADMIN. `calculateCost` con provider anthropic + modelId Gemini devuelve 0.

**RT-7 · MEDIA · Sin cap duro de mensajes por conversación — VISTO**
`handleChatRequest.ts:286, 316-347, 453` + `route.ts:76`. La reserva atómica de cupo aplica solo a conversaciones nuevas; una conversación abierta puede seguir generando llamadas LLM ilimitadas en el mes (frenos: rate limit 10/min por sesión + soft-cap de prompt a 15 turnos — sugerencia al modelo, no gate).

**RT-8 · BAJA · Race write-write del dedup INFRA.2 — VISTO**
`handleChatRequest.ts:516-529`. Lectura de cola + create no atómicos: dos requests concurrentes de la misma conversación (doble tab) duplican el user message. La mitigación INFRA.2 cubre el retry secuencial del widget, no la concurrencia. Impacto: fila repetida + `messageCount` inflado.

**RT-9 · BAJA · `userTurnsCount = floor(messageCount/2)` deriva — VISTO**
`handleChatRequest.ts:568, 796, 858`. `messageCount` se incrementa +2 solo en onFinish exitoso; persist fallidos, duplicados (RT-8) o asistentes vacíos desincronizan el contador vs las filas reales. El soft-cap B4.5 y el `turnIndex` del log INFRA.1 heredan la deriva.

**RT-10 · BAJA · Queries redundantes en tools — VISTO**
`server/tools/captureLead.ts:406-409` (`notifyClient` re-consulta `botConfig` + org que el handler ya tenía) y `showWhatsappHandoff.ts:93-103` (query extra por handoff). 1-2 queries extra por lead/handoff, no por turno.

**RT-11 · BAJA · Default `USADOS_PACK.scoring` en `calculateLeadScore` — VISTO**
`server/scoring/calculateLeadScore.ts:259-261`. Un call-site nuevo que olvide pasar el pack puntúa en silencio con la tabla de concesionaria — exactamente el bug de paridad que EV.3 documenta como gate. Riesgo latente (captureLead siempre lo pasa hoy). Relacionado: el gate de backfill `verticalPack='usados'` sigue abierto (dato, no código — `captureLead.ts:313-324`).

**RT-12 · BAJA · Filas ASSISTANT vacías persistidas — VISTO**
`handleChatRequest.ts:779-790` + `dedup.ts:59-62`. Run que termina solo en tool call client-side o con `text` vacío persiste `content: ''`; el dedup entonces re-persiste el user en retry (correcto) pero el transcript que ve el panel queda con filas vacías.

**RT-13 · BAJA · Tenancy runtime: verificación positiva con una arista intra-tenant — VISTO**
`resolver.ts` + `captureLead.ts` + `quota/checker.ts`: toda la cadena queda scopeada al bot resuelto por slug; **no se encontró camino cross-tenant**. Arista: `sessionId` adivinable/robable permite continuar la conversación de otro visitante DEL MISMO bot (intra-tenant, no cross-tenant).

**RT-14 · BAJA · Doble rate-limit = 2 round-trips a Neon por turno — VISTO**
`src/lib/rate-limit/presets.ts:27-33`. Route (origin+IP 30/min) + handler (slug+sessionId 10/min) = dos UPSERTs seriales a Neon antes del LLM, justo en el hot path que sufre el cold-start (track INFRA). El propio comment lo anota como pendiente.

### A.2 — [RUNTIME] Periferia (widget, embed, KB, crons, insights, reports, CRM)

**RE-1 · MEDIA · `develop:init-request` no tiene handler en widget.js — VISTO (handler ausente); race INFERIDO**
`public/widget.js:165-189` + `components/embed/ChatbotEmbed.tsx:87`. El embed pide re-handshake con `develop:init-request` pero el switch de widget.js solo maneja `close/ready/lead-captured/navigate`. El único `develop:init` sale en el `load` del iframe (widget.js:133-142); si llega antes de que React registre el listener, `attribution` queda `undefined` para toda la carga: el fallback es código muerto. Distinto del gap ya documentado (embed abierto directo, roadmap-pendientes:106).

**RE-2 · MEDIA · Fetch de config fallido → spinner eterno, cacheado — VISTO (código); síntoma INFERIDO**
`ChatbotEmbed.tsx:146-170` + `shared/configCache.ts:15-27` + `useChatbot.ts:190-193`. Si `/config` falla (red, cold-start), queda `config=null` con `isLoading=false` → spinner de pulso para siempre, sin error ni retry; `configCache` cachea la promesa resuelta a `null` sin TTL, así que ni un remount lo recupera. Viola el quality baseline.

**RE-3 · MEDIA · El embed es un fork visual del chat del sitio — VISTO**
`ChatbotEmbed.tsx:174-527` (527 líneas). Re-implementa con estilos inline la lista de mensajes, quick replies, thinking dots e input que ya existen en `components/chat/`, y rendea con `ReactMarkdown` crudo (línea 336) en vez de `StreamingMarkdown`/`revealSafeMarkdown` — sin typewriter ni revelado seguro de markdown parcial. Doble mantenimiento; solo `ChatHeader`/`DegradedBanner` están unificados.

**RE-4 · MEDIA · Prop `theme` del embed es funcionalidad muerta — VISTO**
`ChatbotEmbed.tsx:19`: se declara `theme` en props pero se destructura solo `{ slug }`. El `data-theme` que widget.js propaga (widget.js:27,129) y que `embed/[slug]/page.tsx:40-43` valida y pasa termina en nada: siempre gradiente dark hardcodeado.

**RE-5 · MEDIA · Branding develOP hardcodeado en canal white-label — VISTO**
`ChatbotEmbed.tsx:277-283, 318-330, 505` + `widget.js:64`. El config público expone `accentColor/accentSecondary/surfaceStyle` (`getPublicConfig.ts:74-93`) pero embed y launcher hardcodean el cyan develOP (`#06b6d4`). Bots de clientes quedan con branding de la agencia.

**RE-6 · BAJA · `window.develOP.open()` sin guard + doble script tag — INFERIDO**
`widget.js:145-153, 192-196`. `open()` expuesto antes de que exista el bubble (TypeError si el host lo llama temprano); dos `<script data-bot>` en la misma página se pisan el slug (widget.js:14-15).

**RE-7 · BAJA · El embed acepta `develop:init` de cualquier origin — VISTO**
`ChatbotEmbed.tsx:63-89`. Sin allowlist; adopta `event.origin` como destino de todos los `notifyParent` y acepta `parentUrl` arbitrario → atribución spoofeable por cualquier window con handle al iframe. Riesgo acotado (una línea, no pentest).

**RE-8 · BAJA (fix 1 línea) · `CRON_SECRET` ausente = header "Bearer undefined" adivinable — VISTO**
`src/app/api/cron/generate-insights/route.ts:11-15` y `send-weekly-reports/route.ts:7-9`. Si la env no está seteada, el secreto esperado es el literal `"Bearer undefined"`; comparación no timing-safe.

**RE-9 · MEDIA · `const org: any` en cron de insights — VISTO**
`generate-insights/route.ts:58`. Viola la regla no-negociable del repo; ya sancionado como baseline de lint en D4/D5.

**RE-10 · MEDIA · Insights: over-fetch 4x, sin telemetría de costo, duplicables desde admin — VISTO**
`server/insights/generateInsights.ts:29-42, 98-99, 115-129`. (a) Trae 200 conversaciones con TODOS sus mensajes pero usa 50 y solo mensajes USER truncados a 400 chars. (b) `gemini-2.5-flash` hardcodeado sin registrar usage/costo (QuotaUsage no ve estos runs). (c) El guard de `pendingCount >= 5` existe en el cron (`cron/generate-insights:39-44`) pero NO en la ruta manual `api/admin/chatbot/insights/generate` → PENDING apilables.

**RE-11 · BAJA · Reporte semanal: `recentMessages` sin `orderBy` + heurística débil — VISTO**
`server/reports/buildWeeklyReport.ts:79-89, 165-177`. `take: 100` sin orden → los "top queries" salen de un subconjunto arbitrario; `extractTopThemes` agrupa por "primeras 3 palabras" ("hola quería saber" gana siempre).

**RE-12 · BAJA · Envío semanal sin idempotencia — VISTO**
`server/reports/sendWeeklyReports.ts:14-90`. Cron ejecutado dos veces = emails duplicados a todos los clientes; el evento `REPORT.WEEKLY_SENT` se registra pero nunca se consulta como guard. Ventana con `new Date()` rolling, fuera del helper canónico de fechas AR.

**RE-13 · MEDIA · `/api/chatbot/[slug]/health` público expone internals — VISTO**
`health/route.ts:6-19` + `server/health/checkHealth.ts:34,55`. Sin auth ni rate limit; devuelve `error.message` de DB/LLM y el detalle de qué env vars críticas faltan. Probe gratis contra Neon + leak de configuración.

**RE-14 · BAJA · KB: error crudo al cliente + invalidación de cache in-memory por instancia — VISTO (a) / INFERIDO (b)**
`server/admin/saveKnowledgeBase.ts:72-75, 48`. (a) El catch devuelve `error.message` crudo (superficie SUPER_ADMIN, mitigado). (b) `invalidateBotCache(slug)` es in-memory: en serverless multi-instancia, otras lambdas sirven la KB vieja hasta reciclarse, sin señal — el problema de cache no compartida ya identificado en el baseline 2026-05.

**RE-15 · BAJA · Helpers de insights confían en el slug del caller — INFERIDO (no se abrieron todos los callers)**
`server/insights/queries.ts:3-34`. `getPendingInsightsByOrgSlug` scopea bien por slug→bot, pero no verifica pertenencia — un caller futuro que pase un slug de URL cruza tenants. No se encontró caller roto hoy.

**RE-16 · BAJA · SSRF residual en `postToN8n` — VISTO**
`server/crm/postToN8n.ts:87`. La URL solo se valida al configurarse; al POST se fetchea tal cual (DNS rebinding / cambio posterior). Ya documentado en roadmap-pendientes (B5.8).

### A.3 — [PANEL] Dashboard cliente

**PD-1 · ALTA · Credenciales de onboarding en texto plano con etiqueta "ENCRIPTADO" — VISTO**
`src/actions/onboarding-actions.ts:110-132`. `completeOnboardingAction` guarda credenciales de dominio/hosting y redes en `ClientAsset.description` en texto plano, con `url: 'ENCRIPTADO_EN_TEXTO'` — la etiqueta sugiere un cifrado que no existe. El input (`OnboardingData`, línea 27) no pasa por Zod.

**PD-2 · MEDIA · `task-approvals.ts`: server actions muertas pero invocables — VISTO**
`src/actions/task-approvals.ts:7-136`. Duplica 1:1 `dashboard-actions.ts` (approve/reject) sin Zod, con `throw new Error` crudo y sin notificaciones; ningún componente lo importa. Incluye `requestTaskApproval`, que dejaría a un cliente auto-poner su task en PENDING_APPROVAL.

**PD-3 · MEDIA · Import de contactos: N llamadas HTTP seriales a Brevo + parser CSV naive — VISTO**
`dashboard/modules/email-marketing/_actions.ts:84-122`. Loop secuencial upsert + `syncContact` por fila → timeout con CSVs de cientos de filas; `parseCSV` (44-69) rompe con comas entre comillas; `catch {}` silencioso mete errores reales en `skipped`. Sin Zod.

**PD-4 · MEDIA · Campañas: sin Zod + race de doble envío — VISTO (race INFERIDO)**
`email-marketing/_actions.ts:128-181`. `createCampaignAction` valida solo presencia (`formData.get(...) as string`); `sendCampaignAction` chequea `status !== 'DRAFT'` (181) y actualiza (207) sin update condicional — dos submits concurrentes disparan doble envío a Brevo. Tenancy OK (findFirst con organizationId). Se suma a lo ya reportado post-SEC (updates scoped solo por id, htmlContent sin sanitizar).

**PD-5 · MEDIA · Saludo y fecha del home en TZ del server — VISTO**
`dashboard/page.tsx:32-48`. `getGreeting()`/`formatDateES()` usan hora local del server (UTC en prod): saludo corrido 3h y fecha adelantada un día entre 21:00-23:59 AR. El helper canónico (`dates-ar.ts`/`tz-ar`) existe y no se usa acá. Ya anotado como refactor en P1.C.

**PD-6 · BAJA · `messages.ts`/`referrals.ts` no pasan por `resolveOrgId()` — VISTO**
`src/lib/actions/messages.ts:119`, `referrals.ts:14`. Derivan org de `session.user.organizationId` directo — sin IDOR (sigue siendo sesión), pero rompen impersonation/preview: un SUPER_ADMIN en preview recibe "Sesión inválida".

**PD-7 · BAJA · `markNotificationAsRead` sin check de `userId` — VISTO**
`src/actions/dashboard-actions.ts:188-218`. Valida org pero no destinatario: cualquier miembro marca leídas notificaciones de otro usuario (intra-org). Además la query de superAdmins corre antes de validar el task (26-33, 114-121).

**PD-8 · BAJA · `getClientChatbotSession`: `findFirst` de membership sin `orderBy` — VISTO**
`server/admin/getClientSession.ts:10`. Con membresía múltiple, el scoping de TODO el módulo chatbot del panel sería no determinista (hoy latente: modelo 1 user = 1 org). Tampoco soporta impersonation (asimetría con `resolveOrgId`). Mismo patrón en la capa auth (CO-4).

**PD-9 · BAJA · "Registro de actividad" de la bóveda es data fake presentada como real — VISTO**
`dashboard/cuenta/boveda/page.tsx:~53` (`ACTIVITY_LOG`). "Accediste a Credenciales de Dominio hace 2 h" hardcodeado — información falsa sobre accesos a credenciales, en prod. Mismo eje de honestidad de datos que B9.3.

**PD-10 · BAJA · Waterfalls paralelizables — VISTO**
`dashboard/chatbot/leads/[id]/page.tsx:34-76` (lead → plan → messages, seriales; lead+plan son independientes); `messages.ts:143-179` consulta la organización dos veces.

**PD-11 · BAJA · `upsertBusinessMetrics` sin Zod — VISTO**
`src/actions/metrics-actions.ts:9-53`. SUPER_ADMIN-only y tenancy OK, pero `month` string libre y rates sin rango — inconsistente con la regla "Zod en toda server action" (misma familia que P1-12 de la revalidación 2026-06).

### A.4 — [PANEL] Admin develOP

**PA-1 · ALTA · `runPreflightChecks` es una server action sin auth — VISTO**
`src/modules/chatbot/server/admin/preflightChecks.ts:13`. Archivo `'use server'` cuya action no llama `auth()` ni `requireSuperAdmin()` ni valida `botId` con Zod. Invocable sin sesión: permite sondear bots por ID y leer datos operativos — el check de WhatsApp devuelve `Numero: +${bot.whatsappNumber}` (línea 117), más estado de KB, quota y color. Es la excepción a una disciplina de guards que en el resto del admin es prácticamente universal (~50 actions y 9 API routes verificadas con re-check). Fix de una línea, prioridad inmediata.

**PA-2 · MEDIA · CSV bulk de leads sin escape de comillas ni anti-fórmula — VISTO**
`admin/chatbots/bulk-actions.ts:133-144`. Solo `intent` escapa `"`; name/email/phone/companyName/botName van crudos entre comillas → un `"` en el nombre corre las columnas; sin mitigación de `= + - @` para Excel. (El export CSV del dashboard cliente SÍ tiene anti-injection — criterio inconsistente.)

**PA-3 · MEDIA · Bulk actions tragan el "Forbidden" — VISTO**
`bulk-actions.ts:18-24, 64-70, 163-169`. Sin SUPER_ADMIN devuelven `{ success: 0, failed: N, failures: [] }` — la UI solo puede decir "N fallaron" sin causa.

**PA-4 · MEDIA · Bulk loops: 2N round-trips seriales a Neon — VISTO**
`bulk-actions.ts:30-58, 76-104, 181-229`. `update/delete` + `logAdminAction` secuenciales por bot.

**PA-5 · MEDIA · Listados admin sin paginación; conversación de mensajes sin `take` — VISTO**
`admin/messages/_actions/message.actions.ts:144-151` (`findMany` de TODOS los mensajes de la org), `admin/leads/page.tsx:23`, `admin/clients/page.tsx:22`. A escala agencia tolerable hoy; el peor caso es la conversación de mensajes (crece sin cota por org).

**PA-6 · MEDIA · Código de scope CLIENTE viviendo bajo `server/admin/` — VISTO**
`server/admin/saveClientSettings.ts:34`, `updateLeadStatus.ts:18`, `getClientSession.ts:5`. No es hueco hoy (delegan a guards de cliente), pero la ubicación miente: un caller futuro puede asumir que `admin/` implica `requireSuperAdmin`.

**PA-7 · BAJA · Delete bulk de bots con confirmación genérica — VISTO**
`BulkActionBar.tsx:202` vs `hardDeleteClient.ts:107` + `ClientsListClient.tsx:522`. Borrar 10 bots en cascada (conversaciones+leads+eventos) pide menos fricción que borrar 1 cliente (type-to-confirm con resumen).

**PA-8 · BAJA · Componentes gigantes — VISTO**
`ClientsListClient.tsx` (772 líneas), `BotDetailClient.tsx` (517) — ambos sobre la regla anti-vibecode de 300.

**PA-9 · BAJA · Criterio inconsistente de re-check de sesión en páginas — VISTO**
`admin/leads/page.tsx:106` y ~17 páginas más dependen solo del guard del layout (`admin/layout.tsx:41-48`), mientras `clients/page.tsx:91` re-chequea. Las actions y API routes SÍ están guardadas — es una inconsistencia de criterio, no un hueco.

**PA-10 · BAJA · `revalidatePath` faltante tras mutar config/KB — INFERIDO**
`saveBotConfig.ts:122`, `saveKnowledgeBase.ts:48`. Invalidan el cache runtime del bot pero no las vistas admin cacheadas (`listAllBots` con `cache()`, tag `admin-clients`) — pueden servir listados viejos hasta el TTL.

### A.5 — [COMPARTIDO] Prisma, auth, lib, provider, higiene

**CO-1 · ALTA · El build de prod deploya ignorando tipos y lint — VISTO**
`next.config.ts:10-15`: `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true`. Netlify corre `npm run build` → se puede deployar con errores de tipos presentes; la única red es `tsc --noEmit` manual (y `ts_errors.txt` trackeado con errores históricos demuestra que la deuda es real: 1 error tsc baseline en `src/lib/searchconsole.ts` + 103 errores/135 warnings de lint según la bitácora del motor). Todo lo demás del repo se apoya en esa red rota.

**CO-2 · MEDIA · Callback JWT = un round-trip a Neon por request autenticado — VISTO**
`src/auth.ts:205-231`. `getUserAccessState()` (join a memberships+organization) corre en CADA request con `!user`, no solo en signIn/update. Deliberado (sessionVersion / SEC-AUTH-03) pero sin TTL — cada `auth()` paga Neon, en serverless con cold-starts.

**CO-3 · MEDIA · Membership "primaria" no determinista — VISTO**
`src/auth.ts:26-37, 146-149`: `orgMemberships: { take: 1 }` sin `orderBy` (×2). El schema permite N memberships y nada lo impide; si aparece la segunda, la org de la sesión queda al azar de Postgres. Eco exacto en `getClientSession.ts:10` (PD-8).

**CO-4 · BAJA · Adopción desigual de `resolveOrgId()` — VISTO**
Fundamento sano (`lib/preview.ts:6` + `lib/security/org-scope.ts:20`, puro y testeado), pero `task-approvals.ts`, `dashboard-actions.ts:14-18` y `api/track/route.ts:24-27` leen `session.user.organizationId` directo (sin fuga, pero re-implementan y no pasan por impersonation). En `/api/track`, el path SUPER_ADMIN acepta `organizationId` del body sin verificar que la org exista.

**CO-5 · MEDIA · Índices de org faltantes en 3 tablas del portal — VISTO**
`prisma/schema.prisma:528-536, 584-593, 659-673`: `Service`, `Message` e `Invoice` sin `@@index([organizationId])` mientras todos sus hermanos lo tienen → seq scan en cada lectura del portal. Para `Message` conviene `([organizationId, createdAt])` por el orden del inbox.

**CO-6 · MEDIA · `ContactSubmission` stringly-typed y sin índices de listado — VISTO**
`schema.prisma:675-691`. `leadStatus String? @default("NUEVO")` en un repo que enum-izó todo en B11.4; sin índice por `createdAt`/`read` (listado admin) ni por `referralCode` (match de conversión de referidos P5.5).

**CO-7 · MEDIA · Tokens OAuth de terceros en texto plano — VISTO**
`schema.prisma:357-377`: `gbpAccessToken`/`gbpRefreshToken`, `tiendanubeAccessToken`, `calComApiKey` sin cifrar, mientras `CrmIntegration` SÍ cifra su secret con AES-256-GCM (`schema.prisma:1687-1692`). Criterio inconsistente para material equivalente. (Una línea, no pentest.)

**CO-8 · BAJA · Modelo `Session` muerto + índice redundante — VISTO**
`schema.prisma:267-274, 1326`. La app usa `strategy: 'jwt'` → la tabla Session nunca se escribe; `BotConfig @@index([slug])` redundante con `slug @unique` (ya candidato en B11.5).

**CO-9 · MEDIA · Modelo default hardcodeado en ≥7 sitios — VISTO**
`'gemini-2.5-flash'` en `lib/plan/fallback.ts:51`, `lib/onboarding/core.ts:133`, `server/admin/createBot.ts:82`, `createClientWithBot.ts:172`, `api/admin/chatbot/test-prompt/route.ts:36`, `lib/ai/executive-brief.ts:19` + seed; ids Claude internos también dispersos. Cambiar el default = tocar 7+ archivos. La key es global por proveedor (correcto para el modelo de negocio actual); la atribución de costo por bot existe vía QuotaUsage (pero ver RT-1).

**CO-10 · MEDIA · Deps redundantes + email no-op que reporta éxito — VISTO**
`package.json:88-124`. (a) DOS stacks de PDF: `@react-pdf/renderer` (server) + `jspdf`+`html2canvas` (~700KB, solo `DownloadReportButton.tsx` — cuyo motor ya está anotado como código muerto en P2.C). (b) DOS proveedores de email: Brevo (canónico) + `resend` vivo en `src/lib/email.ts` y `notify-message.ts`; `email.ts:15-17` devuelve `{success: true}` si `RESEND_API_KEY` no está — mails "enviados" que nunca salieron, con remitente hardcodeado.

**CO-11 · MEDIA · ~25 artefactos de debugging trackeados en git — VISTO**
Raíz de logic-core-v3: `script.js/script2/script3/script_*.js`, `ts_errors.txt/.log`, `unused_report*.txt` (stale, UTF-16, citan deps ya removidas), `audit.txt`, `prisma_err.txt`, `find_unused.js`, `replace_analytics.js`, logs de dev en `scripts/` (`_b13-dev.log`, `_ms4-full-run.log`), ~10 `_lane-*-log.md`, y un `vercel.json` en un deploy Netlify. `knip.ts` está bien configurado pero sus reportes están vencidos.

**CO-12 · BAJA · `getLegacyAdminRedirectPath` es 100% código muerto — VISTO**
`src/proxy.ts:22-65`. La primera condición devuelve `null` para todo path admin, así que las ~10 ramas de abajo son inalcanzables (y si se alcanzaran, redirigen al mismo path = loop 308).

**CO-13 · VERIFICACIÓN POSITIVA · `vertex-credentials.json` NO está en git — VISTO**
`git ls-files` vacío; `git check-ignore` matchea `.gitignore:51` (entrada duplicada, nit cosmético). No se verificó el historial completo (nota: la revalidación 2026-06 dejó abierto A.4 — otro secret, `enviroment.env`, en el history de origin/main con purga preparada y force-push nunca ejecutado; key rotada).

**Positivos verificados (transversal):** impersonation con token firmado + audit trail completo (`lib/actions/impersonation.ts:11-48`); `hardDeleteClient` ejemplar (guard+Zod+tx+type-to-confirm); rate limiter atómico en Postgres con placeholders parametrizados y fail-closed; `dates-ar.ts`/`tz-ar.ts` sin duplicación; `getPublicConfig` con select estricto; CSV del dashboard cliente con anti-injection; `syncLeadToCrm` resuelve tenant desde el lead (imposible cruzar orgs); emails de notificación escapan HTML. **`src/modules/motor/` es un esqueleto B0-S1 intencional, no deuda**: frontera de imports enforced por eslint (`eslint.config.mjs:16-41`), prohibición preventiva de `@/lib/prisma`, cero duplicación — el único riesgo es que B0-S2 (`src/lib/isolation/`) y B2 (`chatbot/public-api`) queden como promesas colgadas.

**Aislamiento multi-tenant — veredicto global:** las tres pasadas (runtime, dashboard, admin) hicieron verificación positiva y **no se encontró ningún camino cross-tenant**. El patrón org-de-sesión + guards relacionales está aplicado sistemáticamente. Los hallazgos de esta lente son de *robustez del fundamento* (CO-3/PD-8 membership no determinista, RE-15 contrato de confianza de helpers, PD-6/CO-4 bypass de impersonation), no fugas.

**No determinable por lectura estática (instrumentación sugerida, sin implementar):** (1) si el mismatch `bot.llmModel` vs `plan.llmModel` (RT-1) ocurre en datos reales → un `SELECT` comparativo one-off en prod; (2) la frecuencia del race del handshake (RE-1) → contador `attribution_missing` en el evento de conversación; (3) el costo real del callback JWT (CO-2) → percentil de latencia de `auth()` en logs Netlify; (4) si hay filas con `Session`/índices muertos → ya gated a pg_stat de PROD (B11.5).

---

## SECCIÓN B — Direcciones de mejora (rankeadas por impacto/esfuerzo)

### Tier 1 — Impacto alto, esfuerzo bajo (candidatos a microsprints inmediatos)

1. **[PANEL] PA-1** — `requireSuperAdmin()` + Zod al inicio de `runPreflightChecks`; mover `canActivate` a módulo no-action. *Una línea cierra el único hueco de rol del admin.*
2. **[RUNTIME] RT-2 + RE-13** — Gate de auth (o secret) + rate limit en `/smoke` y `/health`; para `/health` no autenticado, respuesta binaria ok/503 sin details. *Corta quema de tokens y leak de internals.*
3. **[RUNTIME] RT-1** — Pasar `plan.llmModel` (la misma fuente que `getModel`) a `calculateCost` + WARN cuando el pricing devuelve 0 por modelo desconocido. *Arregla la telemetría de costo del negocio.*
4. **[RUNTIME] RE-8** — Rechazar 500/503 si `!process.env.CRON_SECRET` antes de comparar, en ambos crons.
5. **[COMPARTIDO] RT-6/CO-9 (parte UI)** — Sacar/deshabilitar las opciones Claude del select del admin hasta implementar el provider; fallback explícito a google con WARN en `getModel`. *Elimina un 500 total del bot a un click de distancia.*
6. **[PANEL] PD-1** — Dejar de persistir credenciales de onboarding en texto plano: cifrarlas con el esquema AES-GCM ya existente (el de CrmIntegration) o derivarlas a la bóveda; Zod en el input; corregir la etiqueta engañosa.
7. **[COMPARTIDO] CO-1** — Cablear `tsc --noEmit` como gate obligatorio (CI en .github, que existe) mientras el flag siga prendido; plan de quema de la deuda con `/build-fix` para apagarlo.

### Tier 2 — Impacto alto, esfuerzo medio

8. **[RUNTIME] RT-4 + RT-5 + RT-7** — Endurecer el contrato del historial: cap server-side de N últimos turnos + límite agregado de chars del body; evaluar reconstruir el historial desde `ChatMessage` (fuente autoritativa), lo que cierra de una vez el steering de turnos assistant (RT-5); hard-cap de turnos por conversación en el gating (degradar a WhatsApp), no en el prompt (RT-7). *Un solo rediseño chico cierra costo + steering + DoS económico.*
9. **[RUNTIME] RT-3** — Unique compuesto `(botConfigId, sessionId)` + upsert/catch P2002 con re-read. *Requiere migración — coordinable con el gate INFRA.3 y con el `@@unique` que el race del dedup (RT-8) también necesita: una sola migración cierra ambos.*
10. **[COMPARTIDO] CO-2** — TTL en el access-state del token (revalidar cada N min) o lookup liviano (`select sessionVersion`) en vez del join completo. *Baja un query de Neon de CADA request del panel.*
11. **[RUNTIME] RE-2** — Estado de error con retry en el embed cuando falla `/config` + no cachear resoluciones `null` (o TTL corto) en `configCache`.
12. **[RUNTIME] RE-1** — `case 'develop:init-request'` en widget.js que re-envíe el init; o timeout→`EMPTY_ATTRIBUTION` en el embed. *Complementa el fix de embed directo ya planeado en roadmap-pendientes.*
13. **[COMPARTIDO] CO-5 + CO-6** — Migración aditiva: índices de org en Service/Message/Invoice + enum e índices de ContactSubmission (playbook B11.4).
14. **[PANEL] PD-3 + PD-4** — Madurar email-marketing: Zod en ambas actions, envío con `updateMany` condicional (`status: 'DRAFT'` en el where) para matar el doble envío, import por chunks/batch contra Brevo, parser CSV real.
15. **[RUNTIME] RE-10 + RE-12** — Operabilidad de crons: guard de PENDING también en la ruta admin de insights, `select` acotado de mensajes USER, registrar usage del `generateObject`; idempotencia del weekly report consultando `REPORT.WEEKLY_SENT`.
16. **[COMPARTIDO] CO-7** — Cifrar tokens GBP/Tiendanube/Cal.com con el esquema AES-GCM ya existente.

### Tier 3 — Impacto medio, esfuerzo medio (deuda que va a doler)

17. **[RUNTIME] RE-3 + RE-4 + RE-5** — Unificar embed con `components/chat/` (o extraer message-list/input compartidos), implementar el theme o quitarlo de la API pública, y aplicar los tokens de appearance del config (white-label real del canal embed).
18. **[COMPARTIDO] CO-9 + CO-10** — `DEFAULT_CHAT_MODEL` como constante única; migrar los 2-3 consumidores de Resend a brevo-service y remover la dep (y que el no-op devuelva `success:false` con WARN); consolidar en un solo stack de PDF (el motor A ya está sentenciado en P2.C).
19. **[PANEL] PA-4 + PA-5** — `updateMany` + audit log bulk en las bulk actions; `take`+cursor en la conversación de mensajes del admin.
20. **[COMPARTIDO] CO-3 (+PD-8)** — `orderBy` determinista en las 3 lecturas de membership o invariante 1:1 enforced; decidir si `getClientChatbotSession` debe pasar por `resolveOrgId` (cierra también PD-6).
21. **[COMPARTIDO] CO-11 (+CO-8, CO-12, F2-nit)** — Sprint de housekeeping: `git rm` de artefactos, extender .gitignore, borrar `vercel.json`, `proxy.ts` muerto, modelo Session; regenerar reporte knip fresco. *Ya pedido dos veces (revalidación 2026-06 y sobrantes B13).*
22. **[PANEL] PD-2** — Borrar `task-approvals.ts` (o reducir a re-export gateado).
23. **[RUNTIME] RT-14** — Consolidar el doble rate-limit en una sola capa (una escritura a Neon por turno).
24. **[PANEL] PA-2 + PA-3 + PA-7** — Helper único de escape CSV (reusar el del dashboard) + shape de retorno con error explícito + type-to-confirm en delete bulk.

### Tier 4 — Menores / oportunistas

25. **[RUNTIME] RT-9, RT-10, RT-11, RT-12, RE-6, RE-7, RE-11, RE-14, RE-15** — contadores derivados de DB donde importe exactitud; enriquecer `ToolCallContext`; quitar el default de scoring; skip de ASSISTANT vacíos; guards del widget JS; orderBy del weekly; TTL del cache de bot; contrato explícito de los helpers de insights.
26. **[PANEL] PD-5 (helper AR en home), PD-7, PD-9 (ocultar/etiquetar activity log fake), PD-10, PD-11, PA-6, PA-8, PA-9, PA-10.**
27. **[COMPARTIDO] CO-4 (migrar 3 archivos a resolveOrgId).**

---

## SECCIÓN C — Cruce contra el roadmap existente

Claves: **(a)** ya contemplado en roadmap/pendiente existente · **(b)** ya mitigado por la línea base · **(c)** NUEVO. Los bloques externos C0-C3/T0/MH/RB no existen en el repo (ver nota inicial): donde aplicaría, se marca *no verificable contra roadmap externo*.

| Hallazgo | Veredicto | Referencia |
|---|---|---|
| RT-1 costo con modelo legacy | **(c) NUEVO** | Nadie lo lista; QuotaUsage se consideraba correcto. |
| RT-2 /smoke sin auth | **(c) NUEVO** | La revalidación 2026-06 (N-3) reporta otro problema de smoke/health (503 falso-negativo por `CHATBOT_GOOGLE_API_KEY`, aún sin cierre documentado) — el hueco de auth/costo no está listado. |
| RT-3 sessionId @unique global | **(a)** | Anotado como fuera-de-scope de UTM.1 en bitácora (:12752-12765). La consecuencia 500/P2002 concreta es aporte nuevo. |
| RT-4 historial sin cap | **(c) NUEVO** (pariente: "system prompt trimming" en los 5 P2 de seguridad post-B13, track distinto) | bitácora :8916-8924. |
| RT-5 assistant turns inyectables | **(c) NUEVO** | SEC-LLM-01 (spotlighting) existe pero no cubre este vector. |
| RT-6 provider stub + UI ofrece Claude | **(c) NUEVO** | — |
| RT-7 sin hard-cap por conversación | **(c) NUEVO** | El soft-cap 15 (B4.5) es conocido; que no sea gate, no está listado. |
| RT-8 race write-write dedup | **(b)+(a)** | Flagueado explícitamente al cierre de INFRA.2 como residual que exige `@@unique` (migración no diseñada). Coordinar con RT-3. |
| RT-9 deriva de messageCount | **(c) NUEVO** | — |
| RT-10 queries extra en tools | **(c) NUEVO** | — |
| RT-11 default USADOS_PACK | **(a) parcial** | El gate de backfill `verticalPack` (EV.2/EV.3) está en la bitácora y memoria; el default riesgoso en el código es aporte nuevo. |
| RT-12 ASSISTANT vacíos | **(c) NUEVO** | INFRA.2 no lo cubre (no era su objetivo). |
| RT-13 sessionId adivinable (intra-tenant) | **(a) parcial** | SEC-RATELIMIT-02 ("key con sessionId controlable") toca la misma raíz; el ángulo de continuidad de conversación es nuevo. |
| RT-14 doble rate-limit | **(a)** | Anotado como pendiente en el propio `presets.ts`. |
| RE-1 init-request sin handler | **(c) NUEVO** | Distinto del gap documentado (embed directo, roadmap-pendientes:106-108); el race del primer mensaje sin atribución sí está anotado como best-effort aceptado (:12752). |
| RE-2 config fail → spinner eterno | **(c) NUEVO** (pariente: P1-1/P1-2 de revalidación, error/loading faltantes en rutas chatbot del panel — superficie distinta). |
| RE-3 embed fork visual | **(c) NUEVO** | — |
| RE-4 theme muerto | **(c) NUEVO** | — |
| RE-5 branding hardcodeado en embed | **(c) NUEVO** | — |
| RE-6 develOP.open() race | **(c) NUEVO** | — |
| RE-7 init de cualquier origin | **(c) NUEVO** (una línea; el barrido de seguridad va aparte). |
| RE-8 CRON_SECRET undefined | **(c) NUEVO** | — |
| RE-9 org:any | **(a)** | Sancionado como baseline de lint en D4/D5 (bitácora :12213). Sigue violando la regla no-negociable. |
| RE-10 insights overfetch/telemetría/dup | **(c) NUEVO** (pariente: B9.3 "conectar insights reales" es el render, no esto). |
| RE-11 weekly sin orderBy | **(c) NUEVO** | — |
| RE-12 weekly sin idempotencia | **(c) NUEVO** (la fecha rolling se suma a los "manejos de fecha frágiles" de P1.A, que listan otros dos). |
| RE-13 health expone internals | **(c) NUEVO** (N-3 de la revalidación es el falso-negativo, no la exposición). |
| RE-14 cache KB por instancia | **(a)** | Baseline 2026-05: "cache in-memory no compartida entre lambdas — mitigación futura Upstash Redis", abierto. El error crudo al cliente es nuevo (menor). |
| RE-15 helpers insights confían en caller | **(c) NUEVO** | — |
| RE-16 SSRF residual n8n | **(a)** | roadmap-pendientes:16-21 (B5.8 DNS rebinding), textual. |
| PD-1 credenciales en texto plano | **(c) NUEVO** (pariente: P1-12 lista `saveOnboardingProfile` sin Zod; el plaintext con etiqueta engañosa no está listado). |
| PD-2 task-approvals muerto | **(c) NUEVO** (la revalidación lista "10 componentes dead-code"; esto es una action invocable, peor). |
| PD-3 import Brevo serial | **(c) NUEVO** | — |
| PD-4 campañas sin Zod + doble envío | **(a) parcial** | El post-SEC-sprint (bitácora ~11020) ya reportó "2 update de sendCampaignAction scoped solo por id" y "htmlContent sin sanitizar" para decisión; el race de doble envío es aporte nuevo. |
| PD-5 saludo/fecha TZ server | **(a)** | Refactor anotado al cierre de P1.C (bitácora :11207). |
| PD-6 messages/referrals sin resolveOrgId | **(c) NUEVO** | — |
| PD-7 notificaciones sin userId | **(c) NUEVO** | — |
| PD-8 membership sin orderBy (cliente) | **(c) NUEVO** (misma raíz que CO-3). |
| PD-9 activity log fake en bóveda | **(a) parcial** | Mismo eje que B9.3/P1-7/8 (honestidad de datos demo), pero esta superficie concreta no está listada. |
| PD-10 waterfalls | **(c) NUEVO** | — |
| PD-11 metrics sin Zod | **(a)** | Familia P1-12 de la revalidación 2026-06 (server actions sin Zod), abierta. |
| PA-1 runPreflightChecks sin auth | **(c) NUEVO** | El hallazgo individual más urgente del reporte. |
| PA-2 CSV bulk sin escape | **(c) NUEVO** | — |
| PA-3 forbidden tragado | **(c) NUEVO** | — |
| PA-4 bulk seriales | **(c) NUEVO** | — |
| PA-5 listados sin paginación | **(c) NUEVO** (A-31 "cartera sin paginación" es del setter, otra superficie). |
| PA-6 código cliente en server/admin | **(c) NUEVO** | — |
| PA-7/PA-8/PA-9/PA-10 | **(c) NUEVOS** (PA-8 es pariente de A-26 del setter — steps de 300-427 líneas — pero en admin). |
| CO-1 ignoreBuildErrors | **(a) parcial → accionar** | Conocido operacionalmente (memoria del repo: "next build IGNORA tipos/lint — usar tsc --noEmit"; baseline tsc en bitácora del motor), pero NO existe como ítem de roadmap con dueño. Este reporte lo eleva a ítem. |
| CO-2 JWT query per request | **(c) NUEVO** | — |
| CO-3 membership sin orderBy (auth) | **(c) NUEVO** | — |
| CO-4 adopción resolveOrgId | **(c) NUEVO** | — |
| CO-5 índices org faltantes | **(c) NUEVO** (complementa B11.5, que es DROP de índices muertos gated a prod; esto es ADD y no está gated). |
| CO-6 ContactSubmission stringly | **(c) NUEVO** | — |
| CO-7 tokens OAuth plaintext | **(c) NUEVO** | — |
| CO-8 Session muerto + índice slug | **(a) parcial** | El `@@index([slug])` redundante ya es candidato de B11.5 (roadmap-pendientes:95-100); el modelo Session muerto es nuevo. |
| CO-9 modelo hardcodeado ×7 | **(c) NUEVO** | — |
| CO-10 deps duplicadas + email no-op | **(a) parcial** | El motor A de PDF ya está sentenciado como código muerto (P2.C, bitácora :12071); el test email por Resend anotado en P2.A (:11883); SEC-PII-01 toca `notify-message.ts`. El no-op `{success:true}` sin key es aporte nuevo. |
| CO-11 basura trackeada | **(a)** | "10 scripts basura en raíz" (revalidación 2026-06, limpieza abierta) + housekeeping filesystem en sobrantes B13 (:8916-8924). Este reporte amplía el inventario (~25 archivos). |
| CO-12 proxy muerto | **(c) NUEVO** | — |
| CO-13 vertex-credentials | **verificación OK** | Recordatorio relacionado ya conocido: A.4 (secret `enviroment.env` en history de origin/main, purga preparada sin force-push) sigue sin cierre documentado. |

**Pendientes de roadmap que esta auditoría re-confirma vigentes (sin re-descubrirlos):** backfill `verticalPack` (gate EV, bloquea paridad de scoring en prod), INFRA.3 gated en la firma de Netlify + Sentry DSN ausente (`NEXT_PUBLIC_SENTRY_DSN`), fallback de atribución en embed directo (UTM), los 2 manejos de fecha frágiles de P1.A (`currentPeriodKey()` en UTC — cuota/billing en mes equivocado las últimas 3h AR de cada mes — y `week-results.ts`), N-3 (health falso-negativo por env var equivocada) y A.4/A.1/A.5 de la revalidación 2026-06 sin cierre documentado.

---

*Reporte generado por auditoría multi-agente read-only (6 pasadas paralelas). Ningún archivo del repo fue modificado; este documento es el único artefacto nuevo.*

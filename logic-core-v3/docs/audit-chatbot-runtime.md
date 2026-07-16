# Auditoría de diagnóstico — Runtime del chatbot

**Fecha:** 2026-07-06 · **Tipo:** relevamiento read-only (PROBE-FIRST, cero cambios de código) · **Alcance:** `/api/chatbot/[slug]/*` + `src/modules/chatbot/server/**` + lado widget del hot-path.
**Docs previos leídos:** `auditoria-total-pre-deploy.md`, `roadmap-pendientes.md`, `bitacora-roadmap.md` (cierres R2/B1.4, B-SEC.*, MS-1/MS-2, B4.x, B5.x, EV.*, UTM.1). ⚠️ `docs/probe-modulos-premium.md` **no existe en el repo** (ver NO DETERMINADO).
**Convención:** cada hallazgo marca **[CERTEZA]** (visto en código, con archivo:línea) o **[INFERENCIA]** (deducción con base declarada). Lo ya registrado se referencia en una línea, no se re-reporta.

---

## Resumen ejecutivo (≤12 líneas)

1. **Aislamiento multi-tenant del runtime: SIN huecos.** Toda query cuelga de la cadena `slug (unique) → BotConfig → organization` y `(botConfigId, sessionId) → Conversation → ChatMessage/ChatbotLead`. No existe punto donde datos de una org lleguen a otra.
2. **El hallazgo que más urge no es un bug nuevo sino una deuda que cambió de estado:** `navigate_to_page` tiene las rutas del sitio de develOP hardcodeadas y los planes PRO/BUSINESS la sirven a TODO tenant — con la concesionaria entrando, su bot puede navegar visitantes a rutas 404 del dominio del cliente.
3. **Una conversación muere en silencio en el mensaje 51:** el schema rechaza >50 mensajes, el widget nunca recorta el historial, y un 400 no activa el modo degradado. Lead perdido justo en las conversaciones más largas (las más calientes).
4. **Costo unitario:** el historial completo (client-authoritative) se re-manda a Vertex cada turno sin ventana; el nonce anti-inyección rota POR REQUEST y reescribe todo el historial, anulando el prefijo cacheable de Gemini sobre los mensajes; no hay cap duro de turnos por conversación (la cuota solo cuenta conversaciones nuevas).
5. **Contabilidad de costo latente:** el modelo que responde es `plan.llmModel`, pero el costo se calcula con `bot.llmModel` — hoy coinciden por default; si divergen, el costo registrado queda mal o en $0 silencioso.
6. **Knobs que mienten:** `BotConfig.temperature`, `maxOutputTokens` y `monthlyQuota` se editan/persisten desde admin pero el runtime los ignora.
7. **Robustez del provider:** sin `onError` en `streamText`; un corte de Vertex a mitad de stream deja mensaje de usuario persistido sin respuesta, cupo consumido y transcript de DB divergente del historial del widget.
8. `/api/chatbot/[slug]/smoke` es GET público sin auth ni rate-limit que dispara una llamada Vertex real por hit.
9. Perf DB: ~12-15 round-trips por mensaje (doble rate-limit en DB, `validateOrigin` duplica el fetch del bot sin cache, 4 writes secuenciales post-LLM). Con Vertex ≈85% de la latencia (B1.3/B1.4), es secundario pero barato de recortar.
10. El motor de scoring (B5.2-B5.4 + packs EV.3) está sano: puro, consistente, DQ y decay correctos. No se encontraron estados imposibles.

---

# SECCIÓN A — DIAGNÓSTICO

## A.0 Mapa del flujo de una conversación (columna vertebral)

```
Widget (useChatbot.ts)
 │  sessionId = crypto.randomUUID() en sessionStorage['chatbot:sessionId'] (clave NO namespaced por slug)
 │  POST /api/chatbot/[slug]/chat — body: TODO el historial visible (solo filtra burbujas proactive-*)
 ▼
route.ts
 │  1. validateOrigin (query BotConfig por slug, SIN cache)          [validate-origin.ts:58]
 │  2. rate-limit #1 origin+ipHash (UPSERT tabla rate_limit en Neon) [route.ts:70-91]
 ▼
handleChatRequest.ts
 │  3. Zod body (messages ≤50 × ≤8000 chars)                         [:53-75]
 │  4. resolveBotBySlug (cache in-memory 60s; incluye KB + org)      [resolver.ts:17-37]
 │  5. rate-limit #2 slug+sessionId (segundo UPSERT en rate_limit)   [:281-305]
 │  6. Promise.all: getPlanForOrg (cache 60s) ‖ checkQuota ‖ getOrCreateConversation  [:315-346]
 │  7. Gates: cap de dominios del plan → cuota optimista → reserva atómica (solo conv. nueva)  [:360-497]
 │  8. Persistir ÚLTIMO mensaje user                                 [:500-515]
 │  9. detectIntent (regex del pack vertical) + buildSystemPrompt (9 secciones + KB completa)  [:518-557]
 │ 10. getTools filtrado por plan.tools (capture_lead / offer_handoff / whatsapp_handoff / navigate)  [:563-584]
 │ 11. streamText: system enriquecido (intent guidance + opener validado) + historial DEL CLIENTE
 │     envuelto en <vmsg_{nonce-por-request}>; stopWhen stepCountIs(3); temperature 0.7 hardcoded  [:665-838]
 │       └─ tools server-side: capture_lead → scoring puro (pack vertical) → ChatbotLead + tx
 │          → notifs fire-and-forget (Telegram/email/n8n CRM)          [captureLead.ts]
 │ 12. onFinish: validateOutput (solo warnings) → 4 writes SECUENCIALES:
 │     chatMessage(assistant) → conversation.update → incrementQuota → chatbotEvent  [:751-820]
 ▼
 stream UI → widget (5xx → degradado WhatsApp; JSON degraded → CTA WhatsApp)
```

Cuota: 1 conversación nueva = 1 cupo (reserva atómica anti-TOCTOU, B4.2). Mensajes dentro de una conversación existente NO consumen cupo. Scoring: 100% server-side, cero LLM.

---

## A.1 Correctitud

### C-1 · La conversación muere en el mensaje 51 — **[CERTEZA schema/widget · INFERENCIA UX exacta]**
- `requestBodySchema` acepta `messages` con `.max(50)` ([handleChatRequest.ts:53-62](../src/modules/chatbot/server/chat/handleChatRequest.ts#L53)). El widget manda SIEMPRE el historial completo y solo filtra burbujas `proactive-*` ([useChatbot.ts:268-273](../src/modules/chatbot/hooks/useChatbot.ts#L268)) — nunca recorta.
- A ~2 mensajes por turno, el turno 26 del visitante produce un body de 51 mensajes → Zod falla → **400** ([:244-248](../src/modules/chatbot/server/chat/handleChatRequest.ts#L244)).
- El wrapper de fetch del widget solo degrada a WhatsApp con `status >= 500` o falla de red ([useChatbot.ts:213-215](../src/modules/chatbot/hooks/useChatbot.ts#L213)). Un 400 pasa crudo al SDK → estado `error` sin UI de degradación visible en el hook. **[INFERENCIA]**: el visitante ve que el chat "no contesta más", sin CTA de salida.
- El soft-cap de sesión larga (15 turnos) solo *sugiere* derivar en el prompt ([sections.ts:184-206](../src/modules/chatbot/server/prompts/sections.ts#L184)); nada impide llegar al límite duro. Las conversaciones que llegan a 25+ turnos son precisamente las de mayor intención — es el peor lugar para morir sin handoff.

### C-2 · `sessionId` es `@unique` GLOBAL pero el código lo trata como compuesto por bot — **[CERTEZA estructura · INFERENCIA escenario]**
- Schema: `sessionId String @unique` en `Conversation` ([schema.prisma:1358](../prisma/schema.prisma#L1358)). Resolver: `findFirst({ botConfigId, sessionId })` ([resolver.ts:70-75](../src/modules/chatbot/server/conversation/resolver.ts#L70)) — semántica compuesta que el schema no respalda.
- El widget guarda el sessionId en `sessionStorage['chatbot:sessionId']` **sin namespacing por slug** ([useChatbot.ts:15](../src/modules/chatbot/hooks/useChatbot.ts#L15)).
- Escenario de rotura: dos bots distintos embebidos en el mismo origin (o el mismo visitante alcanzando dos bots del mismo dominio) comparten sessionId → el segundo bot no encuentra conversación para SU `botConfigId` → intenta `create` → violación P2002 → **500 en cada mensaje** a ese bot. También hay race benigno: dos primeros mensajes concurrentes de una misma sesión → un `create` falla → 500 puntual.
- **NO es fuga multi-tenant** (el `findFirst` filtra `botConfigId`; nunca se lee la conversación ajena) — ver T-1.

### C-3 · Error del provider a mitad de stream: sin manejo, con efectos residuales — **[CERTEZA código · INFERENCIA semántica SDK]**
- `streamText` no define `onError` ([handleChatRequest.ts:665-838](../src/modules/chatbot/server/chat/handleChatRequest.ts#L665)); `onFinish` no corre si el stream aborta. Consecuencias del corte de Vertex a mitad de respuesta:
  1. El mensaje del usuario ya quedó persistido (paso 8) sin respuesta del asistente — el transcript en DB queda cojo.
  2. Si era conversación nueva, el cupo ya se reservó ([:452-497](../src/modules/chatbot/server/chat/handleChatRequest.ts#L452)) y **no hay rollback** → el cliente "paga" un cupo por una conversación que nunca obtuvo respuesta.
  3. El widget conserva el texto parcial en su historial local y lo re-manda como turno `assistant` en el próximo request → **lo que ve el modelo diverge de lo que la DB registra** (el dueño lee en el dashboard una conversación distinta de la real).
  4. Sin evento `chat.*` persistido para ese fallo (solo el `catch` externo cubre throws pre-stream) → invisible para el panel de salud.

### C-4 · `navigate_to_page` con rutas develOP hardcodeadas, servida a todos los tenants PRO/BUSINESS — **[CERTEZA]** · deuda registrada que CAMBIÓ de estado
- `VALID_PATHS` = 8 rutas del sitio del portfolio ([navigateToPage.ts:15-24](../src/modules/chatbot/server/tools/navigateToPage.ts#L15)); el propio archivo lo registra como "Phase 1.5 deferred" (README Deferred Decisions).
- PERO los seeds de planes incluyen la tool en PRO y BUSINESS para cualquier org ([sync-plans.ts:41-46](../prisma/seeds/sync-plans.ts#L41)), y el widget ejecuta `window.location.href = path` en el dominio donde esté embebido ([useChatbot.ts:388-391](../src/modules/chatbot/hooks/useChatbot.ts#L388)).
- Con el primer cliente real (concesionaria) en un plan PRO: el modelo puede navegar a su visitante a `/web-development` **en el dominio de la concesionaria** → 404. La deuda pasó de "diferible" a "activa antes del onboarding". Referenciado en una línea porque ya está registrado; se reporta el **cambio de estado**.

### C-5 · El costo se calcula con el modelo equivocado (latente) — **[CERTEZA]**
- El modelo que responde es `plan.llmModel` ([handleChatRequest.ts:592-593](../src/modules/chatbot/server/chat/handleChatRequest.ts#L592)); el costo se calcula con `resolvedBot.llmModel` ([:743-748](../src/modules/chatbot/server/chat/handleChatRequest.ts#L743)).
- Hoy ambos defaultean a `gemini-2.5-flash` → sin efecto visible. Si un plan migra a `flash-lite` (o un BotConfig viejo quedó con otro valor), `estimatedCostUsd`/`QuotaUsage.costUsd` se calculan con el pricing de otro modelo — y si el string no está en el catálogo, `calculateCost` devuelve **$0 silencioso** ([costs.ts:31-33](../src/modules/chatbot/server/pricing/costs.ts#L31)). Toda la telemetría de costo por conversación (la base del pricing de planes) queda corrupta sin error alguno.

### C-6 · El transcript de DB no es el historial que ve el modelo — **[CERTEZA]**
- Solo se persiste el ÚLTIMO mensaje `user` del body ([handleChatRequest.ts:500-515](../src/modules/chatbot/server/chat/handleChatRequest.ts#L500)), pero al LLM se le manda el array completo **provisto por el cliente**, sin verificar que coincida con lo persistido ([:668-677](../src/modules/chatbot/server/chat/handleChatRequest.ts#L668)).
- Un cliente malicioso (o un bug del widget, ver C-3.3) puede fabricar turnos `assistant` que el modelo tratará como propios. Impacto correctitud: el dashboard del dueño muestra una conversación que no es la que produjo el lead. Impacto costo: ver P-2.

### C-7 · Filas `Conversation` huérfanas en modo degradado — **[CERTEZA]** (menor)
- `getOrCreateConversation` corre en el `Promise.all` ANTES de los gates de dominio/cuota ([handleChatRequest.ts:315-346](../src/modules/chatbot/server/chat/handleChatRequest.ts#L315) vs [:360-497](../src/modules/chatbot/server/chat/handleChatRequest.ts#L360)). Con cuota agotada, cada sesión nueva que escribe crea igual su fila de Conversation (con 0 mensajes) + un ChatbotEvent por mensaje bloqueado → `count(Conversation)` del período > `QuotaUsage.conversationsCount`, y los dashboards que cuenten conversaciones desde la tabla divergen del contador oficial.

### Calificación de leads: verificada, sin hallazgos nuevos — **[CERTEZA]**
- Motor puro y consistente ([calculateLeadScore.ts:259-329](../src/modules/chatbot/server/scoring/calculateLeadScore.ts#L259)): DQ por categoría pisa todo, penalties post-combos, clamp [0,100], DQ nunca "revive" por decay ([:461-485](../src/modules/chatbot/server/scoring/calculateLeadScore.ts#L461)). Decay solo en lectura, tolerante a fechas serializadas (B5.5). Anti-fabricación de canales (pertenencia por cola de 7 dígitos / email textual) y re-ask graceful correctos ([captureLead.ts:119-296](../src/modules/chatbot/server/tools/captureLead.ts#L119)).
- Ítems conocidos, sin cambio de estado: backfill `verticalPack='usados'` requerido pre-producción (registrado en bitácora EV.3, gate de despliegue); H2/H3 texto-vacío/encadenamiento cerrados por MS-1 (`stepCountIs(3)`); `invalidateBotCache` — el bug de B1.4 está **cerrado** (todos los saves de admin/dashboard invalidan hoy; verificado por grep).

---

## A.2 Rendimiento y costo (por conversación)

### P-1 · ~12-15 round-trips de DB por mensaje — **[CERTEZA]**
Camino caliente para un mensaje en conversación existente (caches calientes): `validateOrigin` (1) + rate-limit route (1 UPSERT) + rate-limit handler (1 UPSERT) + checkQuota (1) + conv findFirst+update (2) + user msg create (1) + [post-LLM] assistant msg + conversation.update + quota upsert + event create (4 secuenciales) ≈ **11**; conversación nueva suma reserva atómica (3: upsert + raw UPDATE + findUnique). Piezas puntuales:
- **Doble rate-limit = 2 writes a Neon por request** ([route.ts:70-91](../src/app/api/chatbot/[slug]/chat/route.ts#L70) + [handleChatRequest.ts:281-305](../src/modules/chatbot/server/chat/handleChatRequest.ts#L281)). La consolidación ya está registrada como pendiente en [presets.ts:28-33](../src/lib/rate-limit/presets.ts#L28) — **ángulo nuevo**: desde B14.1 el limiter es una tabla en Neon, así que la duplicación dejó de ser "limpieza" y pasó a ser 1 write extra por mensaje.
- `validateOrigin` hace su propio `botConfig.findUnique` sin cache ([validate-origin.ts:58-61](../src/lib/security/validate-origin.ts#L58)) cuando `resolveBotBySlug` cachea el mismo bot 3 líneas después — 1 query redundante por request (y también en cada OPTIONS preflight).
- `getPlanForOrg` en cada miss hace 2 queries secuenciales (`applyPendingPlanIfDue` + el fetch real) ([get-plan-for-org.ts:39-59, 72-96](../src/lib/plan/get-plan-for-org.ts#L39)) — fusionables en una.
- Los 4 writes post-LLM del `onFinish` son secuenciales ([handleChatRequest.ts:751-820](../src/modules/chatbot/server/chat/handleChatRequest.ts#L751)); al menos 3 son independientes entre sí. **[INFERENCIA]** según semántica del SDK, el cierre del stream hacia el widget puede estar esperando ese onFinish (ver NO DETERMINADO — los `timings.post_persist_ms` ya persistidos en `chat.message_completed` permiten responderlo con datos existentes).
- Contexto ya registrado: Vertex ≈85-86% de `total_ms` (B1.3/B1.4) — nada de esto mueve la aguja de latencia percibida; es costo de Neon/robustez, no UX.

### P-2 · Historial client-authoritative completo re-enviado a Vertex cada turno, sin ventana ni cap de turnos — **[CERTEZA]**
- Cada request re-manda TODO el historial al modelo ([handleChatRequest.ts:668-677](../src/modules/chatbot/server/chat/handleChatRequest.ts#L668)); el costo de input por conversación crece ~cuadrático con los turnos. Cota superior por request permitida por el schema: 50 × 8000 chars ≈ ~100k tokens ≈ **$0.03 de input por mensaje** en 2.5 Flash; con rate-limit de 10 msg/min por sesión y 30/min por IP ([presets.ts:27-33](../src/lib/rate-limit/presets.ts#L27)), un actor hostil sostiene ~$1.8-5.4/hora sin tocar la cuota (los mensajes en conversación existente no consumen cupo).
- **No hay cap duro server-side de turnos por conversación** — la política de soft-cap es solo prompt ([sections.ts:184](../src/modules/chatbot/server/prompts/sections.ts#L184)). La economía lockeada (planes fijos, develOP paga IA) definió modo degradado por *conversaciones*; el eje *mensajes-por-conversación* quedó sin enforcement. No re-abro la decisión: señalo que la palanca de enforcement no existe.
- El system prompt (~1.5k tokens fijos + KB, cap 5k chars por sección × 7 — [validateKB.ts:66](../src/modules/chatbot/server/admin/validateKB.ts#L66)) se re-manda entero cada turno. Inherente al diseño stateless; el punto accionable es P-3.

### P-3 · El nonce de spotlighting rota POR REQUEST y reescribe todo el historial — anula el prefijo cacheable — **[CERTEZA mecánica · INFERENCIA impacto]**
- `vmsg_${randomUUID()}` se genera en cada request y envuelve TODOS los mensajes del visitante, incluidos los turnos viejos ([handleChatRequest.ts:657-663](../src/modules/chatbot/server/chat/handleChatRequest.ts#L657)). Resultado: byte-a-byte, el historial de los turnos 1..N-1 es DISTINTO en cada request.
- El implicit caching de Gemini 2.5 descuenta ~75% de los tokens de input con prefijo idéntico entre requests. Las secciones estables del system prompt sí se benefician; el historial (la parte que CRECE) nunca, por el nonce. La seguridad del spotlighting no exige nonce por-request: exige que el visitante no lo pueda predecir — un nonce estable por conversación (p.ej. HMAC(conversationId, secret)) da la misma garantía con prefijo estable. Impacto real no medible desde código (ver NO DETERMINADO).

### P-4 · `/smoke` público quema tokens sin auth ni rate-limit — **[CERTEZA]**
- GET `/api/chatbot/[slug]/smoke` sin auth, sin origin-check, sin rate-limit, ejecuta una llamada Vertex real por hit ([smoke/route.ts:16-42](../src/app/api/chatbot/[slug]/smoke/route.ts#L16) → [smokeTest.ts:26-36](../src/modules/chatbot/server/health/smokeTest.ts#L26)). Costo por hit ínfimo pero ilimitado y anónimo. De paso (una línea, barrido de seguridad aparte): `/health` y `/smoke` devuelven detalle interno (qué env vars faltan, mensajes de error de Prisma/provider) a cualquier anónimo — roza la regla "never expose internal error messages".

### P-5 · `capture_lead` re-fetchea BotConfig + Organization completos por lead — **[CERTEZA]** (menor)
- `notifyClient()` hace `botConfig.findUnique({ include: { organization: true } })` ([captureLead.ts:406-409](../src/modules/chatbot/server/tools/captureLead.ts#L406)) trayendo la fila entera de Organization cuando el handler ya tenía bot+org resueltos y solo usa 4 campos. Es 1 vez por lead y fire-and-forget → costo marginal; es más smell de acoplamiento (el tool no recibe lo que el contexto ya sabía) que problema de perf.

---

## A.3 Aislamiento multi-tenant (correctitud de datos)

**Veredicto: sin huecos encontrados.** Barrido de todas las queries Prisma del hot-path (`chat/`, `tools/`, `conversation/`, `quota/`, `config/`):

| Query | Scope | Evidencia |
|---|---|---|
| `botConfig.findUnique({ slug })` | slug `@unique` → 1 bot → 1 org (`organizationId @unique`) | [resolver.ts:21-29](../src/modules/chatbot/server/conversation/resolver.ts#L21) |
| `conversation.findFirst` | `{ botConfigId, sessionId }` — siempre filtra por el bot resuelto | [resolver.ts:70-75](../src/modules/chatbot/server/conversation/resolver.ts#L70) |
| `chatMessage.*` / `chatbotLead.*` | por `conversationId` derivado de la conversación scopeada | [captureLead.ts:201, 229](../src/modules/chatbot/server/tools/captureLead.ts#L201) |
| `quotaUsage.*` / reserva atómica | por `botConfigId` del bot resuelto | [checker.ts:34-153](../src/modules/chatbot/server/quota/checker.ts#L34) |
| `ChatbotLead.create` | `botConfigId` + `conversationId` del ctx (nunca del LLM/input) | [captureLead.ts:358-393](../src/modules/chatbot/server/tools/captureLead.ts#L358) |

La cadena org→bot→conversación→lead que pedía verificar el brief está cerrada: `ChatbotLead.botConfigId` viene del contexto construido a partir del bot resuelto por slug, y `BotConfig.organizationId` es 1:1 — no hay forma de que un lead quede colgado de otra org.

- **T-1 [CERTEZA]** — Único matiz estructural: el `sessionId @unique` global (ver C-2) hace que el schema no garantice la semántica per-bot que el código asume. La consecuencia de un choque es **500, nunca datos ajenos** (el `findFirst` filtra `botConfigId` antes de leer). Es correctitud, no aislamiento — pero es la única costura donde schema y semántica multi-tenant no coinciden, y conviene cerrarla antes de tener N bots reales.
- **T-2** — `rate_limit` es tabla global pero las keys embeben `slug`/`origin`+`ipHash` → un tenant no puede agotar el bucket de otro. OK.

---

## A.4 Config de proveedor

### V-1 · Knobs de BotConfig que el runtime ignora — **[CERTEZA]**
- `temperature`: se valida y guarda desde admin ([saveBotConfig.ts:46](../src/modules/chatbot/server/admin/saveBotConfig.ts#L46)) pero el runtime usa `0.7` hardcoded ([handleChatRequest.ts:679](../src/modules/chatbot/server/chat/handleChatRequest.ts#L679)).
- `maxOutputTokens`: se guarda ([saveBotConfig.ts:47](../src/modules/chatbot/server/admin/saveBotConfig.ts#L47)) pero `streamText` no recibe ningún cap de output — rige el default del modelo (8192). El prompt pide 3-4 oraciones, así que el riesgo práctico es bajo; el problema es que el admin cree que controla algo que no controla.
- `monthlyQuota`: reemplazado por `plan.quota` desde B4.2 (documentado en el propio handler [:309-312](../src/modules/chatbot/server/chat/handleChatRequest.ts#L309)) pero sigue editable/visible. Familia completa de "config que miente".

### V-2 · `plan.llmModel` sin validar contra el catálogo → 500 de flota entera — **[CERTEZA throw · INFERENCIA path de edición]**
- `provider.getModel(plan.llmModel)` lanza `ModelNotSupportedError` si el string no está en `GOOGLE_MODELS` ([google.ts:85-91](../src/modules/chatbot/server/llm/providers/google.ts#L85)). `Plan.llmModel` es un string libre en DB — un typo al editar el plan (o un seed desalineado con el catálogo) rompe con 500 **todas las conversaciones de todas las orgs de ese plan**, sin fallback a modelo default ni alerta específica.

### V-3 · Sin failover de provider (por diseño, con matiz) — **[CERTEZA]**
- Los providers Anthropic/OpenAI existen ([factory.ts:20-47](../src/modules/chatbot/server/llm/factory.ts#L20)) pero solo se seleccionan por `bot.llmProvider`; no hay retry cross-provider ante caída de Vertex. La UX de degradación a WhatsApp ante 5xx está resuelta (MS-2, registrado). El matiz: `streamText` corre con los retries default del SDK sin configuración explícita (`maxRetries`), y no hay telemetría que distinga "Vertex reintentó y salvó" de "falló directo". El "Anthropic SDK secundario" del stack hoy es capacidad instalada, no resiliencia activa.
- Eficiencia del credencial global (decisión registrada, no se re-abre): instanciación lazy + singleton por lambda ([factory.ts:14](../src/modules/chatbot/server/llm/factory.ts#L14), [google.ts:65-83](../src/modules/chatbot/server/llm/providers/google.ts#L65)) — correcta, sin trabajo redundante por request.

### V-4 · `maxDuration = 30` vs p95 medido de 26s + multi-step — **[INFERENCIA]**
- El route corre con `maxDuration = 30` ([route.ts:9](../src/app/api/chatbot/[slug]/chat/route.ts#L9)). B1.4 midió `total_ms` p95 = 26s con **un** step; MS-1 habilitó hasta 3 steps (2-3 llamadas Vertex encadenadas en el turno de captura — justo el turno del lead). El margen es fino: un timeout de plataforma mata el stream sin persistencia ni evento (mismos residuos que C-3). Frecuencia real no determinable desde código — medible con los timings ya persistidos.

---

## A.5 Deuda técnica (solo la que muerde el runtime)

- **D-1 [CERTEZA]** — `handleChatRequest.ts` (870 líneas) concentra parsing, gating, prompt, tools, streaming y TODA la persistencia post-LLM inline dentro del `onFinish` ([:694-837](../src/modules/chatbot/server/chat/handleChatRequest.ts#L694)). Cualquier cambio del flujo (C-3, P-1, V-1) toca este archivo; la persistencia post-turno no es testeable sin montar el stream completo. Es el archivo que más va a doler.
- **D-2 [CERTEZA]** — `logChatbotEvent` se documenta "fire and forget" pero AWAITEA el `create` ([persistentLogger.ts:42-53](../src/modules/chatbot/server/logging/persistentLogger.ts#L42)) y todos los call-sites del handler lo awaitean → en los paths de gating agrega 1 write bloqueante por request degradado, y en el happy-path 1 write más al cierre. Contrato y uso desalineados.
- **D-3 [CERTEZA]** — `checkQuota(bot.id, Number.MAX_SAFE_INTEGER)` ([handleChatRequest.ts:326](../src/modules/chatbot/server/chat/handleChatRequest.ts#L326)): post-B4.2 la función se usa solo como "leé el contador", su `withinQuota` devuelve siempre true y el nombre engaña. API zombie del diseño pre-plan.
- **D-4 [CERTEZA]** — La dualidad `bot.llmProvider` (BotConfig) + `plan.llmModel` (Plan) parte la definición del modelo efectivo en dos tablas sin dueño único — es la raíz de C-5 y V-2. (El desalineo enum↔tipo del factory ya está registrado post-deploy; esto es el eslabón operativo que sigue vivo.)

**Lo que está bien y no hay que volver a tocar** (evita re-auditoría): reserva atómica de cuota anti-TOCTOU ([checker.ts:121-162](../src/modules/chatbot/server/quota/checker.ts#L121)); idempotencia de `capture_lead` por conversación + validación de pertenencia de canales; upsell alert idempotente por mes vía `degradedAt`; rate-limit compartido en Neon (fail-closed); spotlighting + validación exacta del `proactiveOpener`; UTM first-touch create-only; caches 60s con invalidación hoy cableada (bug B1.4 cerrado).

---

# SECCIÓN B — DIRECCIONES DE MEJORA (rankeadas)

**Ancla:** equipo de 2, primer cliente real (concesionaria, volumen chico) entrando, develOP paga la IA contra planes fijos USD 49-150, pre-escala. Prioriza: no perder leads, no romper al primer cliente, costo unitario por conversación. Escala futura va abajo.

| # | Hallazgo | Dirección | Impacto | Esfuerzo |
|---|----------|-----------|---------|----------|
| 1 | **C-4** navigate_to_page rutas develOP a todo tenant | Cortocircuito para el onboarding: sacar `navigate_to_page` de `plan.tools` de PRO/BUSINESS en el seed (o gatearla a org develOP) hasta implementar la Phase 1.5 real (`BotConfig.allowedNavigationPaths`). Es un array en un seed: minutos, no sprint. | ALTO — bug visible del primer cliente | Bajísimo |
| 2 | **C-1** muerte en mensaje 51 | Doble cinturón: (a) el widget manda ventana deslizante (últimos ~30 mensajes) en `prepareSendMessagesRequest`; (b) el server, en vez de rechazar >50, recorta con `slice(-N)` conservando el último user. Complemento barato: convertir el soft-cap 15 turnos en degradación digna a WhatsApp a los N turnos (reusa `degradedResponse`). | ALTO — lead caliente perdido | Bajo |
| 3 | **P-2/P-3** costo por conversación | Tres palancas en orden de ROI: (1) nonce `vmsg` estable POR CONVERSACIÓN (HMAC de conversationId) — misma seguridad, prefijo cacheable; (2) la misma ventana de historial del ítem 2 acota el crecimiento cuadrático; (3) bajar los caps del schema (p.ej. mensajes ≤4000 chars, ≤30 items) al percentil real de uso. Después medir: comparar `tokensIn` promedio antes/después con los eventos ya persistidos. | ALTO — costo unitario recurrente, develOP lo paga | Bajo-medio |
| 4 | **C-3/V-4** corte de provider mid-stream | Agregar `onError` a `streamText`: persistir evento `chat.stream_error` + mensaje assistant parcial (o marcador), y NO contar el turno. Evaluar liberar la reserva de cupo si el fallo ocurre antes del primer token. Con eso el transcript deja de divergir y el fallo se vuelve visible en el panel. | MEDIO-ALTO — hoy es invisible | Bajo-medio |
| 5 | **C-5/V-2/D-4** modelo efectivo partido | Unificar la fuente: pasar `plan.llmModel` también a `calculateCost`, y en `getModel` hacer fallback a `gemini-2.5-flash` + evento WARN en vez de throw. Cierra la contabilidad corrupta y el 500 de flota con ~10 líneas. | MEDIO — latente pero barato y protege la telemetría de pricing | Bajísimo |
| 6 | **V-1** knobs muertos | Decidir por knob: honrarlo (pasar `temperature`/`maxOutputTokens` del BotConfig a `streamText` — 2 líneas) o quitarlo del form admin. `monthlyQuota`: ocultarlo o rotularlo "legacy (rige el plan)". Evita el "toqué y no pasó nada" del admin en soporte. | MEDIO — confianza operativa | Bajo |
| 7 | **C-2/T-1** sessionId global-unique | Migración aditiva: `@@unique([botConfigId, sessionId])` y drop del unique global + widget namespacea la key (`chatbot:sessionId:${slug}`). Cierra el 500 de dos-bots-mismo-origin y el race del primer mensaje, y alinea schema con semántica multi-tenant. | MEDIO — pre-requisito para tener N bots reales | Bajo |
| 8 | **P-4** /smoke público | Gatearlo: header secreto (env compartida con el monitor) o auth de admin + rate-limit preset. `/health` sin el detalle de env para anónimos. | MEDIO — costo/exposición, arreglo trivial | Bajísimo |
| 9 | **P-1** round-trips DB | En orden: (1) consolidar el doble rate-limit (ya registrado como pendiente — ejecutarlo; ahorra 1 write/request); (2) `validateOrigin` acepta el bot cacheado o se fusiona con `resolveBotBySlug`; (3) paralelizar los writes del `onFinish` (`Promise.all` de los 3 independientes); (4) fusionar las 2 queries de `getPlanForOrg`. Ninguno mueve la latencia percibida (Vertex domina) — es robustez/costo Neon y son cambios chicos. | BAJO-MEDIO | Bajo |
| 10 | **P-2** cap duro de turnos por conversación | Si Franco quiere enforcement del "uso justo" (la política ya existe como soft-cap): a los N turnos (p.ej. 40) responder `degradedResponse` con CTA WhatsApp. Una comparación sobre `messageCount` que ya viaja en el request. | BAJO-MEDIO — protege la economía del plan fijo | Bajísimo |
| 11 | **C-7** conversaciones huérfanas en degradado | Opción barata: crear la Conversation DESPUÉS de los gates (mover el create, mantener el lookup). Opción más barata aún: aceptar las filas y que los dashboards cuenten conversaciones "con mensajes". Decidir y documentar. | BAJO | Bajo |
| 12 | **D-1/D-2/D-3** deuda del handler | Cuando se toque el handler por los ítems 2-4: extraer la persistencia post-turno a un módulo `persistTurn()` testeable; hacer `logChatbotEvent` realmente fire-and-forget en paths de gating (`void`); renombrar/simplificar `checkQuota` → `readQuotaUsage`. No como sprint propio — como regla de "dejar mejor lo que se toca". | BAJO (previene, no cura) | Se amortiza |
| 13 | **V-3** failover Anthropic | Solo si la caída de Vertex se vuelve recurrente (hoy la degradación a WhatsApp cubre): retry cross-provider en el primer token fallido. No antes — agrega complejidad de paridad de tools/prompt por proveedor que hoy nadie mantiene. | BAJO hoy | Alto |

**Fuera de ranking (escala futura, no ahora):** streaming de exports, Upstash para caches multi-instancia, índices DB ya documentados en `auditoria-db` §3.2 — todo registrado, sin cambio de estado.

---

## NO DETERMINADO

1. **`docs/probe-modulos-premium.md` no existe** en el repo (glob + grep exhaustivos). El Paso 0 se completó con los otros 3 documentos + los cierres de bitácora sobre módulos premium (B4.4/B4.6). Si el doc vive en otra rama/carpeta, este audit no lo vio.
2. **Hit-rate real del implicit caching de Vertex** (impacto exacto de P-3): no medible desde código; requiere comparar `cachedContentTokenCount` en respuestas reales de Vertex (el SDK lo expone en `providerMetadata`) antes/después de estabilizar el nonce.
3. **Si el cierre del stream hacia el widget espera al `onFinish`** (los 4 writes post-LLM retrasando el "done" del visitante): semántica interna del AI SDK v6 (`ai@6.0.177`); respondible con los `timings.post_persist_ms` ya persistidos en `chat.message_completed` + una prueba de red. No lo afirmo sin medirlo.
4. **UX exacta del widget ante un 400** (C-1): el código muestra que no hay rama para 4xx, pero el comportamiento visible (¿spinner infinito? ¿mensaje del SDK?) requiere prueba en runtime.
5. **Frecuencia real de timeouts a 30s** (V-4): requiere consultar la distribución de `durationMs` en `ChatbotEvent`/Sentry de las últimas semanas — datos que existen pero esta pasada no consultó DB.
6. **Comportamiento multi-instancia de los caches in-memory en Netlify prod** (invalidación solo local a la lambda): ya discutido en B1.4 §6 como hipotético; sigue sin medición en prod real.

---

## Cierre

- **Reporte:** `logic-core-v3/docs/audit-chatbot-runtime.md` (este archivo — única escritura de la sesión). No se registró en bitácora (relevamiento, no cambio).
- **Los 3 hallazgos que más me preocupan:**
  1. **C-4** — `navigate_to_page` con rutas develOP servida a los planes PRO/BUSINESS: es el único hallazgo que el primer cliente real puede VER en su propio dominio, y el fix es un array en un seed.
  2. **C-1** — la conversación muere en silencio en el mensaje 51 sin CTA de salida: mata exactamente las conversaciones más largas y calientes, que son las que pagan el producto.
  3. **P-2/P-3** — el costo por conversación crece cuadrático con historial client-authoritative sin ventana y con el nonce por-request rompiendo el prefijo cacheable: es plata de develOP contra planes fijos, todos los días, y las tres palancas de mitigación son baratas.

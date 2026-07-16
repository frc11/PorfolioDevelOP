# Roadmap pendientes

Lista única de deuda explícita conocida. Cada entrada referencia el sprint que la generó y la condición que la haría prioritaria. Cuando una pendiente se ejecuta, se mueve a la bitácora como su propio sprint cerrado.

---

## B5.8 — CRM Integration (n8n)

### Cron diario de retry para `CrmSyncAttempt` FAILED
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Un cron (Vercel Cron o equivalente) que cada 24h barra `CrmSyncAttempt` con `status='FAILED'` del último día y dispare `syncLeadToCrm({ leadId, trigger: 'cron' })` para reintentar.
- **Por qué se postpuso:** En B5.8 el usuario decidió "in-flight + manual" (3 intentos automáticos al momento + botón "Reintentar" desde UI). Sin volumen real, el cron sería infra sin uso. El dueño puede recuperar manualmente desde el historial.
- **Cuándo prioritarlo:** Cuando haya una org con ≥1 lead FAILED por día durante una semana seguida sin que el dueño aprete "Reintentar" → señal de que el manual no escala. Si Matsu reporta "se me cae mucho n8n y no me doy cuenta", entra esto.
- **Notas:** Requiere `vercel.json` o equivalente (hoy no existe). Considerar Inngest si se necesita queue durable más allá de cron simple.

### DNS rebinding protection en `validateWebhookUrl`
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** El anti-SSRF actual rechaza IPs privadas LITERALES (`https://192.168.1.1/...`). Pero un dominio público (`https://attacker.com/...`) cuyo DNS resuelve a una IP privada pasaría. La protección completa: resolver la IP justo antes del POST en `postToN8n` y rechazar si cae en rango privado.
- **Por qué se postpuso:** Complejidad sustancial para un escenario de amenaza específico (atacante con cuenta comprometida que registra dominio malicioso). El audit log de cambios al webhook URL ya da rastro, y el operador puede detectar el ataque post-facto.
- **Cuándo prioritarlo:** Antes de aceptar clientes que manejen datos sensibles regulados (salud, financiero) — el threat model crece. O si se detecta intento real.
- **Implementación:** En `postToN8n.singlePost`, antes del fetch hacer `dns.lookup(parsed.hostname)` (con timeout corto) y volver a validar la IP resuelta contra la blacklist de `validateWebhookUrl`. Cachear resolución por unos segundos para no spamear DNS.
- **Nota de cruce:** Esta pendiente = el hallazgo **RE-16** de la auditoría 2026-07-07 (SSRF residual en `postToN8n`). Vive en el carril de seguridad que corre Franco (ver Punteros al final).

### Vista admin read-only del CrmIntegration por org
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** En `/admin/clients/[clientId]/chatbot/` o equivalente, una sección read-only que muestre la `CrmIntegration` de esa org (URL — quizás truncada para evitar leak en pantallas de soporte, `enabled`, `secretConfigured: bool`, `lastSyncAt`, `lastErrorAt`, `lastErrorMessage`) + las últimas 20 entradas del historial. Sin permisos de edición.
- **Por qué se postpuso:** El audit log + impersonation ya cubren los casos prácticos de soporte (develOP puede ver lo que el cliente ve haciendo impersonate). Un panel admin dedicado es UX-extra, no funcional-crítico.
- **Cuándo prioritarlo:** Si develOP termina haciendo soporte de configuración n8n recurrente y el flujo impersonation se siente lento.
- **Notas:** No edición desde admin para no introducir confusión "¿quién es el actor?" en el audit log. Si en el futuro develOP necesita editar en nombre del cliente, agregar columna `actorRole: SUPER_ADMIN | CLIENT` en `AdminAuditLog`.

### Nota legal/UX sobre PII a terceros en el form de CRM
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Línea de advertencia visible en `CrmConfigForm` cuando se activa el sync: "Vas a enviar datos personales de tus clientes (nombre, contacto, mensaje) a este endpoint. Asegurate de cumplir con la legislación de privacidad aplicable en tu jurisdicción (LGPD / ley 25.326 en AR, etc.)."
- **Por qué se postpuso:** Una vez que el dueño decide enviar sus leads a su propio CRM, la responsabilidad legal pasa a su tratamiento. La nota es defensiva (CYA) más que funcional.
- **Cuándo prioritarlo:** Antes del lanzamiento del plan Business comercial real. Es UX prudente, no urgente para infra.
- **Notas:** Coordinar texto con un abogado. No sobre-escalar a "muro de checkbox" — es una nota informativa, no un consentimiento que bloquea el guardar.

### Idempotencia opt-in en payload a n8n (header `Idempotency-Key: leadId`)
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Mandar un header `Idempotency-Key: <leadId>` en cada POST a n8n. Si el cliente arma su flow n8n con dedupe por ese header, retries automáticos + retries manuales no generan duplicados en su CRM downstream (ej. no se manda el email al lead 2 veces).
- **Por qué se postpuso:** Para B5.8 MVP no se considera problema — captureLead ya es idempotente por conversationId, y retries de un mismo leadId son raros. El cliente puede deduplicar en n8n usando `leadId` del payload.
- **Cuándo prioritarlo:** Si un cliente reporta duplicados en su downstream o si Matsu pide explícitamente.

---

## B5.9 — Exportar leads a CSV

### Streaming / paginación cuando se excede EXPORT_LIMIT (10k)
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Hoy el endpoint `/api/dashboard/chatbot/leads/export` carga hasta 10k leads en memoria y devuelve el CSV completo en una sola Response. Si una org excede ese cap, se trunca silenciosamente. Solución: streaming con `ReadableStream` que pagina por cursor + escribe el CSV chunk a chunk al cliente.
- **Por qué se postpuso:** 10k leads cubre PyME por años. Una concesionaria PyME captura ~50-300 leads/mes con un chatbot bien configurado. 10k = 3-15 años de leads. Cuando aparezca el primer cliente que excede, se prioritiza.
- **Cuándo prioritarlo:** Cuando un audit log muestre exports con `count === 10000` (el cap exacto) → señal de truncado.
- **Notas:** Heredería el filtro multi-tenant + audit log + anti-injection sin cambios. El reto es solamente la mecánica del stream + UX de "este export tiene 50k filas, va a tardar".

### Export en `.xlsx` nativo (Excel)
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Generar archivos Excel `.xlsx` con formato (negrita en headers, anchos de columna, freeze de la primera fila, validación en la celda de estado). CSV es lowest common denominator pero `.xlsx` da mejor first-run experience.
- **Por qué se postpuso:** Requiere lib pesada (`xlsx` ~600KB, `exceljs` ~1.5MB). CSV cubre 100% de los casos prácticos. Si un cliente premium lo pide explícitamente, se considera.
- **Cuándo prioritarlo:** Si Matsu o un cliente Business equivalente lo pide. Mientras tanto, CSV con BOM abre limpio en Excel.

### Plantillas de export personalizadas por industria
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Que el dueño elija "exportar para CRM X" y obtener un CSV con las columnas + nombres + formato que ese CRM espera. Hoy es un CSV develOP-standard.
- **Por qué se postpuso:** Sin volumen suficiente para saber qué CRMs realmente importan a los clientes. Mientras tanto, el cliente puede mapear columnas manualmente en su importer.
- **Cuándo prioritarlo:** Cuando haya ≥3 clientes pidiendo el mismo CRM target (HubSpot, Salesforce, Pipedrive, Zoho, etc.).

---

## B9.3 — Disclaimer de IA en outputs LLM

### Badge "Generado por IA" en briefs/insights/summaries
- **Sprint origen:** B9.3 (2026-05-25) — fuera de scope por decisión Franco
- **Qué:** Agregar un disclaimer visible tipo "Generado por IA · puede contener imprecisiones · datos al [fecha]" en outputs que vienen de un LLM real. Hoy `AIExecutiveBrief` se rendea como prosa final sin marca. Cuando se conecten insights AI reales en `ChatbotOverview` (hoy se removió el placeholder), también requieren disclaimer.
- **Por qué se postpuso:** B9.3 era "honestidad de DATOS DEMO" (mock data presentado como real). El disclaimer de IA es un eje distinto: el dato ES real (el LLM realmente lo generó) pero puede ser impreciso. Decisión de producto aparte para no mezclar dos cambios de UX en el mismo sprint.
- **Cuándo prioritarlo:** Antes del lanzamiento comercial del plan que incluya AIExecutiveBrief (Pro+). Si un cliente toma decisiones de negocio leyendo un brief con alucinación del LLM y la marca no avisa que es IA, hay riesgo reputacional y legal.
- **Notas:** Coordinar el tono con el de `PreviewBanner` para que sean familias coherentes (uno marca "no es tu dato aún", otro marca "es tu dato pero generado por IA"). Considerar un componente compartido `DataOriginBadge` con variantes `demo | ai-generated | real-time`.

### Conectar insights AI reales en `ChatbotOverview`
- **Sprint origen:** B9.3 (2026-05-25) — el placeholder se removió en este sprint
- **Qué:** El card "Insights AI placeholder" se sacó del render porque era 100% inventado. El feature existe parcialmente en server (`getPendingInsightsByOrgSlug`, `getInsightsCountForBot` en `src/modules/chatbot/server/insights/`). Falta conectar el dashboard cliente para que rendee los insights reales cuando los haya.
- **Por qué se postpuso:** Implementar el render real requiere decidir UX (¿qué insights se muestran? ¿cómo se actúan? ¿se aprueban?). B9.3 priorizó eliminar el placeholder engañoso sobre construir el feature completo.
- **Cuándo prioritarlo:** Cuando los insights generados tengan valor accionable consistente para el dueño (no antes — un insight genérico es ruido).
- **Notas:** Reactivar el card en `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx` (estaba al final del render, después del bloque de handoffs). Aplicar disclaimer de IA del item anterior si el insight viene de LLM.

### Milestone real del proyecto en `/dashboard/project`
- **Sprint origen:** B9.3 (2026-05-25) — el milestone hardcoded se removió en este sprint
- **Qué:** El bloque "Lanzamiento del Panel de Control · 15 de Abril 2026" era hardcoded — se rendeaba para TODOS los clientes idéntico. Se removió. Falta modelo Prisma para milestones de proyecto (hoy solo existe `OsPaymentMilestone`, que es de pagos OS, no aplica) + UI para que admin defina milestones por proyecto.
- **Por qué se postpuso:** El modelo de datos no existe y la UX del lado admin es no-trivial. Quitar el dato falso era urgente; construir el reemplazo no.
- **Cuándo prioritarlo:** Cuando develOP necesite comunicar fases formales al cliente (no solo tareas sueltas). Para el MVP actual, el `ProjectTaskTabs` ya muestra entregables concretos con fecha.
- **Implementación:** Agregar `ProjectMilestone { id, projectId, title, description, dueDate, completedAt }` al schema + admin UI para CRUD + reactivar `CurrentMilestone` en `/dashboard/project` consumiendo el primer milestone pendiente del proyecto. Component `CurrentMilestone` ya existe (`src/components/dashboard/CurrentMilestone.tsx`), no hay que reescribir.

---

## B11.5 — Borrado de 6 índices "muertos" (diferido a post-B14)

### Drop de índices con 0 scans en pg_stat_user_indexes
- **Sprint origen:** B11.5 (2026-05-25) — solo se agregaron los 3 faltantes, NO se borró nada.
- **Qué:** El audit `docs/audits/2026-05-auditoria-db.md` §3.1 propone borrar 6 índices marcados con 0 idx_scan en pg_stat_user_indexes (P2-1, P2-2, P2-3): `@@index([slug])` de BotConfig (redundante por `slug @unique`), `@@index([status])` y `@@index([nextFollowUpAt])` de OsLead (subsumidos por el compuesto `(status, nextFollowUpAt)`), `@@index([organizationId])` solos de EmailContact y EmailCampaign (subsumidos por sus compuestos), y otros en ChatbotLead/ChatbotEvent/Task de la sección 3.1 del audit.
- **Por qué se postpuso:** **`pg_stat_user_indexes` del Neon de DEV no es base válida para decidir borrados.** Dev casi no tiene tráfico, así que CASI TODOS los índices marcan 0 scans — incluyendo los críticos. Borrar acá sería "borrar a ciegas con disfraz de dato". La regla del sprint fue explícita: **solo AGREGAR en B11.5**.
- **Cuándo prioritarlo:** **Post-B14, con la PROD de Matsu viva ≥ 2 semanas** (tiempo suficiente para que las queries de dashboard cliente + admin + crons hayan ejecutado al menos una vez cada una). Recién entonces `pg_stat_user_indexes` refleja uso real y los índices con `idx_scan=0` son razonablemente seguros de dropear.
- **Implementación:** Re-correr la query del audit (`docs/audits/2026-05-auditoria-db.md` §3.1) contra PROD, cruzar contra los 6 candidatos, confirmar que siguen con 0 scans + revisar que no son del path crítico de algún feature recién lanzado, y entonces migration aditiva de DROPs. Reset `pg_stat_user_indexes` con `pg_stat_reset()` ANTES del período de medición para descartar arrastre histórico.

---

## UTM.1 — Deuda de seguimiento (identificada en investigación read-only post-P4.1)

### UTM — embed directo sin atribución (deuda, no urgente)
- **Sprint origen:** UTM.1 (2026-07-04) — deuda identificada en investigación read-only de seguimiento a P4.1
- **Qué:** `/embed/[slug]` abierto como documento top-level (iframe a mano, o link directo compartido) no recibe el `postMessage develop:init` → `attribution` queda `undefined` → la sesión entera va sin UTM/referrer, en silencio. Producción usa `widget.js` (no afectado). Fix: fallback en `ChatbotEmbed` que lea `location.search` propio cuando no llega el handshake. Microsprint chico. Evidencia: `ChatbotEmbed.tsx:64-84`, `useChatbot.ts:123-135`.
- **Nota de cruce:** Distinto del hallazgo **RE-1** de la auditoría (init-request sin handler → race de atribución). RE-1 es un sprint aparte, aún no corrido; comparte archivos con RE-2/C0.2, tenerlo en cuenta al secuenciar.

### UTM — punto ciego de tests (camino cliente)
- **Sprint origen:** UTM.1 (2026-07-04) — deuda identificada en investigación read-only de seguimiento a P4.1
- **Qué:** Ningún test ejercita el camino real del cliente: handshake iframe → `parseAttribution` → `firstTouchRef` → body del request. `utm1-smoke.mjs` fabrica el body a mano; la verificación de UTM.1 invoca `capture_lead` directo. Ambos bypassean la capa que falló en prueba manual (abrir `/embed` pelado). Si se toca widget/embed, ese camino no tiene red automatizada.

---

## COST-1 — Telemetría de costo con modelo efectivo (implementado, verificación pendiente)

### Verificación en prod del costo real (SELECT + volumen de WARN)
- **Sprint origen:** COST-1 (2026-07-10)
- **Estado:** Implementado, gate de lógica verde (8/8 checks, `tsc`/lint OK). NO verificado contra datos reales — el bug era invisible al build, no se cierra por tsc verde.
- **Qué falta para cerrar:** (1) SELECT comparativo en PROD sobre `Conversation`/`QuotaUsage` — `estimatedCostUsd`/`costUsd` reciente vs el modelo del plan; confirmar que el costo registrado es ≠ $0 y corresponde al modelo efectivo. (2) Medir el volumen de eventos `chat.cost_model_unknown` en `chatbotEvent` para dimensionar qué tan extendido estaba el mismatch en prod.
- **Notas:** Al verificar, anotar el resultado en la entrada de COST-1 en la bitácora y borrar esta pendiente.

### Chequeos de cobertura — RESUELTOS por las pasadas read-only 2026-07-11
- **Sprint origen:** COST-1 (2026-07-10), cerrados en investigación read-only (2026-07-11)
- **(a) Otros call-sites de `getModel`:** confirmado. El runtime de cada turno, insights, brief, smoke-test y reportes están protegidos (hardcodeo `'google'` + try/catch). Único gap real: `demo-chat/[slug]/route.ts` → ver COST-2b abajo. Cerrado como investigación.
- **(b) WARN registry vs pricing:** la hipótesis "son dos tablas distintas" era **falsa para Google** — `getModel`/`estimateCost`/`listModels` leen el mismo objeto `GOOGLE_MODELS`, y TS strict hace imposible un modelo sin precio. El escenario hipotetizado NO es alcanzable. El gap real que sí apareció (clave≠id en el breakdown) se cerró en **COST-2** (ya commiteado).

---

## RE-2 — Resiliencia de carga del widget (implementado, verificación pendiente)

### Verificación visual + coreografía con Neon dormida
- **Sprint origen:** RE-2 (2026-07-10)
- **Estado:** Implementado, gate de lógica verde (6/6, `tsc`/lint OK, el no-envenenamiento del cache testeado contra el módulo real). NO verificado visualmente.
- **Qué falta para cerrar:** (1) Visual-qa del estado de error/reintento en desktop + mobile, en ambos render (embed + on-site) — bloqueado por el MCP de preview sin cablear (ver Gaps de entorno). (2) Coreografía real con Neon dormida DE VERDAD (cold-start real, no mock): ver el auto-retry disparándose y recuperándose, por grabación. El mock del smoke no sustituye esto ("verde ≠ se ve").
- **⚠️ Riesgo de contaminación:** la verificación manual previa se hizo (en parte) contra un dev server colgado a nivel proceso desde el commit `dd5da60` (ver Gaps). Rehacer en un server sano — lo poco que se miró puede no ser válido.
- **Notas:** Al verificar, anotar en la entrada de RE-2 y borrar esta pendiente.

### Decisión diferida: microcopy durante el retry de `/config`
- **Sprint origen:** RE-2 (2026-07-10)
- **Qué:** Mientras `/config` reintenta, el widget muestra el spinner normal, sin texto. Se evaluó un microcopy tipo "cargando…". Decisión: NO agregarlo por ahora (spinner solo); el estado "Conectando…" queda reservado al POST de `/chat` de INFRA.2, no a la carga de config — no fundir los dos vocabularios.
- **Cuándo prioritarlo:** Revisar CON la grabación de Neon dormida en mano — si el spinner se siente muerto durante los 2s/4s de backoff real, ahí se evalúa un microcopy. No antes, sin el dato.

---

## C0.2 — La conversación larga no muere muda (implementado, verificación pendiente)

### Conversación real de 30+ turnos con el widget
- **Sprint origen:** C0.2 (2026-07-11)
- **Estado:** Implementado y verificado con smoke de 22 turnos + body fabricado (recorte, degradación al turno 21). NO verificado con el widget real en conversación larga por Valentino. El smoke propio de CC corrió sobre el server colgado `dd5da60` (más razón para rehacerlo).
- **Qué falta para cerrar:** conversación de 30+ turnos con el widget de verdad en `:3000` (server sano): que fluya sin cortes ni 400, que al ~turno 21 aparezca el cartel de WhatsApp con el input bloqueado, y que una charla corta se sienta idéntica a siempre.
- **Notas:** Se verifica junto con RE-2 (conviven en el widget). Al cerrar, anotar en la entrada de C0.2 y borrar esta pendiente.

---

## COST-2b — `demo-chat` route: camino feliz roto (código muerto)

- **Sprint origen:** investigación read-only de COST-1 (2026-07-11)
- **Qué:** `app/api/admin/chatbot/demo-chat/[slug]/route.ts` (líneas ~45,47) hace `getLLMProvider(bot.llmProvider as ...)` + `provider.getModel(bot.llmModel)` con valores dinámicos de la DB, **sin** `normalizeLlmProvider` ni `resolveEffectiveModel`, y **sin** try/catch. El enum Prisma devuelve `'GOOGLE'` (mayúsculas), el switch de `getLLMProvider` matchea `'google'` (minúsculas) case-sensitive → **throwea para el 100% de los bots**, no solo los stub — el camino feliz está roto, no un edge case. El cast `as` le miente al compilador; `normalizeLlmProvider` existe justo para esto.
- **Por qué se postpuso:** Es **código muerto** — `grep -ri "demo-chat"` no encuentra ningún caller (ni UI ni fetch), y está tras `requireSuperAdmin()`. Endpoint roto que nadie llama = deuda latente, no fuga. No amerita sprint propio urgente.
- **Cuándo prioritarlo:** Cuando algún sprint toque ese endpoint, o cuando se cablee un preview de demo. Fix mecánico: reemplazar por `resolveEffectiveModel(normalizeLlmProvider(bot.llmProvider), bot.llmModel)` (el patrón de `handleChatRequest.ts:694-695`), que de paso le da el degrade-con-WARN en vez de 500 crudo. La investigación ya está hecha.
- **Corrección de registro:** la nota "modelo hardcodeado" que COST-1 dejó sobre este archivo en la bitácora es **falsa** — el modelo es dinámico desde la DB, el problema es el cast sin normalizar. Corregir esa nota si se toca la bitácora.

---

## COST-2c — Breakdown input/output y validación de providers reales (latente)

- **Sprint origen:** investigación read-only de COST-1 + cierre de COST-2 (2026-07-11)
- **Qué:** (1) `costs.ts` en la rama `!modelInfo` ya devuelve el `total` autoritativo (COST-2), pero el split `inputUsd/outputUsd` cae a 0/0 — honesto pero no exacto; si algún consumidor necesita el split fino ahí, falta. (2) Cuando se implemente `getModel` real de Anthropic/OpenAI (hoy stubs que tiran `ProviderNotImplementedError`), debe validar contra la misma tabla que `estimateCost`/`listModels` (como Google), para no abrir una tercera fuente de verdad desalineable.
- **Por qué se postpuso:** Ambos son latentes, no fugas activas. El split 0/0 solo importa si un consumidor lee input/output por separado en el caso degradado; los providers reales no existen aún.
- **Cuándo prioritarlo:** (1) si un reporte necesita el desglose fino; (2) cuando se implemente Anthropic/OpenAI de verdad.

---

## Corrección de registro (línea vieja de este doc)

- **Frase "son dos tablas distintas" (registry vs pricing):** era engañosa para Google — es el mismo objeto `GOOGLE_MODELS` leído tres veces, no dos tablas desincronizables. Las únicas tablas genuinamente separadas (Anthropic/OpenAI) no pueden producir el mismatch porque su `getModel` nunca dice "sí" a nada (stubs). Cerrado en COST-2. Esta corrección reemplaza cualquier versión previa de esa nota.

---

## Deuda técnica abierta por COST-1

### `chat.cost_model_unknown` refuerza la urgencia de T0.2 — SALDADO
- **Sprint origen:** COST-1 (2026-07-10)
- **Qué:** El WARN nuevo (`chat.cost_model_unknown`) puede dispararse por turno en un bot mal configurado, y se persiste en `chatbotEvent`. **T0.2 ya cableó el cron `cleanupOldEvents`** (retención 30d), así que el crecimiento está acotado. Queda como contexto histórico; el riesgo agudo se cerró.

### `logChatbotEvent` await-eado = instancia de C3.6
- **Sprint origen:** COST-1 (2026-07-10)
- **Qué:** COST-1 emite el WARN vía `logChatbotEvent`, que hoy NO es fire-and-forget (persiste a `chatbotEvent` de forma bloqueante). En un bot roto eso es un write extra a Neon en cada turno, en el hot path que sufre el cold-start. Es exactamente C3.6 (hacer `logChatbotEvent` fire-and-forget en el gating).
- **Cuándo prioritarlo:** Se salda cuando se toque el handler por el cluster onFinish (donde vive C3.6 como regla "dejar mejor lo que se toca").

---

## Deuda técnica abierta por T0.2

### Configs de cron desincronizadas (`netlify.toml` vs `vercel.json`)
- **Sprint origen:** T0.2 (2026-07-11)
- **Qué:** El repo tiene 7 crons: 2 en `netlify.toml` y otros 3 en `vercel.json` — dos sets de config distintos y desincronizados. `cleanup-old-events` se agregó a `netlify.toml`. No se resolvió cuál es la fuente de verdad ni si los de `vercel.json` corren en el deploy actual (Netlify).
- **Cuándo prioritarlo:** Antes de confiar en cualquier cron para algo crítico — hay que saber cuáles agenda efectivamente el deploy de producción. Candidato a un microsprint de consolidación (read-only + limpiar la config muerta).

### Helper de auth de crons duplicado 4×
- **Sprint origen:** T0.2 (2026-07-11)
- **Qué:** La verificación de `CRON_SECRET` está copiada en cada ruta de cron (4ª vez con `cleanup-old-events`, a propósito para no tocar archivos ajenos al sprint). Extraerlo a un helper compartido tocaría los otros crons.
- **Cuándo prioritarlo:** Cuando se consoliden las configs de cron (arriba) o se toque otro cron — hacerlo de paso.

### Índice con `createdAt` líder para `ChatbotEvent`
- **Sprint origen:** T0.2 (2026-07-11)
- **Qué:** Ninguno de los 3 índices de `ChatbotEvent` tiene `createdAt` como columna líder, así que el `deleteMany` del cron de limpieza no puede usar índice de plano. A 172 filas no importa; si la tabla crece mucho antes de que el cron corra seguido, un índice `(createdAt)` lo justificaría.
- **Cuándo prioritarlo:** Si `chatbotEvent` crece a decenas de miles de filas. Sería migración aditiva (coordinar con Franco, branch compartida).

---

## Gaps de entorno (bloquean verificación, no build)

### MCP de preview sin cablear para el subagente visual-qa
- **Sprint origen:** INFRA.2, repetido en RE-2/C0.2 (2026-07-11)
- **Qué:** El subagente visual-qa no tiene el MCP de preview conectado, así que no puede capturar el estado renderizado en desktop/mobile. Ya lo documentó INFRA.2; RE-2 y C0.2 lo volvieron a chocar. Todo sprint con superficie visual queda cojo hasta resolverlo — la verificación de reposo cae sobre Valentino a mano.
- **Cuándo prioritarlo:** ANTES del próximo sprint visual pesado. Es config de entorno/herramienta, no código del proyecto.

### Dev server colgado a nivel proceso (`dd5da60`) — contaminó verificaciones
- **Sprint origen:** detectado en C0.2 (2026-07-11)
- **Qué:** El dev server en `:3000` estaba colgado ("Jest worker exceptions") desde el commit `dd5da60` — TODA ruta API devolvía 500. Cualquier verificación manual hecha en `:3000` desde ese commit (parte de RE-2, quizás COST-1) puede ser inválida. CC lo reinició en su sesión, pero puede recaer.
- **Cuándo prioritarlo:** Como precondición de la tanda de verificación de RE-2/C0.2/COST-1 — levantar un server sano (ahora en el worktree `runtime/mejoras`) antes de dar por buena cualquier verificación.

### Encoding roto en `docs/bitacora-roadmap.md`
- **Sprint origen:** detectado al commitear COST-2 (2026-07-11)
- **Qué:** La bitácora tiene caracteres mal codificados (`Ô£à` en vez de `✅`, `ÔÇö` en vez de `—`) — se escribió sin UTF-8. No rompe nada funcional; es cosmético. Molesta al leer.
- **Cuándo prioritarlo:** En una pasada de limpieza cuando se toque la bitácora por otra cosa. No amerita sprint propio.

---

## Nota de proceso (git) — 2026-07-11

- **COST-2 quedó en dos commits** por un staging parcial: `e0d2ac0` se llevó solo docs+`package.json` (los `git add -p`), y el código (`costs.ts` + 3 providers + test) quedó afuera hasta un segundo commit `3819c7a`. Lección: en commits multi-archivo, `git add` de los archivos enteros PRIMERO, `git status` para confirmar staged, y recién ahí los `-p` de los compartidos. Y `git show <commit> --stat` después de cada commit importante para cazar un commit al que le falta la mitad.
- **Working tree compartido resuelto:** el chat Panel commiteó PD-1 (`b06ca12`) sobre la rama `b0-isolation-motor-chatbot` mientras el runtime trabajaba sobre el mismo checkout. Se separó en worktree `runtime/mejoras` (`../logic-core-runtime/logic-core-v3`). De acá en más: runtime en ese worktree, Panel en el original. No volver a compartir carpeta+rama entre sesiones.

---

## PD-1.2 — Cifrado de credenciales de onboarding

### `VaultManager` no muestra errores al admin (solo `console.error`)
- **Sprint origen:** PD-1.2 (2026-07-11)
- **Qué:** Con el fallo duro de PD-1.2 (guardar una credencial ACCESS sin `ONBOARDING_SECRET_KEY`
  configurada lanza en vez de guardar en claro), el formulario admin (`VaultManager.tsx`) no se
  limpia tras el error — pero no muestra ningún mensaje al admin, solo `console.error` en el catch
  del cliente. El admin ve que "no pasó nada" sin saber por qué.
- **Por qué se postpuso:** Fuera de scope de PD-1.2 (era cableado de cifrado, no UX de formulario).
- **Cuándo prioritarlo:** Candidato a mini-sprint de UX cuando se toque `VaultManager` de nuevo, o
  antes de que un admin real se tope con el fallo duro en producción sin explicación.

### `completeOnboardingAction` sin caller y con auth débil
- **Sprint origen:** PD-1.2 (2026-07-11)
- **Qué:** La action que escribe las credenciales de onboarding (`completeOnboardingAction`) no
  tiene ningún caller en `src/` — parece ruta muerta o a medio cablear. Además su guard de auth es
  débil: obtiene `session` de `auth()` pero no la usa (solo gatea vía `resolveOrgId()`).
- **Por qué se postpuso:** Auditado y cifrado igual (PD-1.2 pidió cifrar la action existiera o no
  caller), pero decidir si es ruta muerta a borrar o feature a terminar de cablear quedó pendiente.
- **Cuándo prioritarlo:** Antes de reactivar el flujo de onboarding con credenciales, o al hacer
  limpieza de código muerto.

### `src/lib/crypto/` con dos helpers AES-GCM conviviendo
- **Sprint origen:** PD-1.2 (2026-07-11), agravado por el merge del motor B1 (2026-07-16)
- **Qué:** `src/lib/crypto/` tiene `secret-box.ts` (del motor, llegó con el merge de B1) y
  `credential-cipher.ts`/`encrypt-for-storage.ts` (del panel, PD-1) — dos implementaciones AES-GCM
  independientes en el mismo directorio, sin relación entre sí.
- **Por qué se postpuso:** Cada una nació en su propio lane sin saber de la otra; consolidar implica
  decidir cuál es la fuente de verdad y migrar callers.
- **Cuándo prioritarlo:** Evaluar consolidación la próxima vez que se toque cualquiera de las dos, o
  en una pasada de limpieza dedicada.

---

## PA-2 — CSV anti-inyección en exports admin de leads

### `src/lib/csv/csv-escape.ts` es copia deliberada, no compartida
- **Sprint origen:** PA-2 (2026-07-11)
- **Qué:** `src/lib/csv/csv-escape.ts` duplica la lógica de
  `modules/chatbot/server/leads/csv/csvEscape.ts` por frontera de módulo (no se puede importar
  desde `app/admin` hacia `modules/chatbot/server`). Si cambia la lógica de escape (nuevos
  caracteres peligrosos, ajuste de RFC 4180), hay que sincronizar ambas copias a mano.
- **Por qué se postpuso:** Extraer a un compartido cruza la frontera de módulo — decisión de
  arquitectura fuera de scope de un fix de seguridad puntual.
- **Cuándo prioritarlo:** Si la lógica de escape necesita un tercer cambio, o cuando se revise la
  frontera de módulo del chatbot en general.

### Lead de prueba "Promo SEO (descartar)" (`qaseed-dirty-...-0009`) en la base
- **Sprint origen:** PA-2 (2026-07-11)
- **Qué:** Quedó un lead de prueba con ese nombre en la base, de un seed distinto al de
  `qa-seed-leads-dirty.ts` — revisar que el script de limpieza correspondiente lo contemple.
- **Cuándo prioritarlo:** Próxima pasada de limpieza de datos QA.

---

## Punteros a la consolidación (detalle en `docs/consolidacion-planoA-runtime.md`)

- **Carril seguridad (lo corre Franco, aparte del flujo de sprints):** RT-2 (`/smoke` sin auth quema Gemini), RE-13 (`/health` expone internals), RE-16 (SSRF/DNS-rebinding en `postToN8n` — ya listado arriba en B5.8), RE-7 (atribución spoofeable por cualquier origin), RT-13 (sessionId adivinable → secuestro intra-tenant), CO-7 + PD-1 (cripto en reposo: tokens OAuth de terceros / credenciales de onboarding en texto plano; PD-1.1/PD-1.3a ya commiteado por el chat Panel en `b06ca12`), A.4 (secret en history sin purga).
- **Decisiones abiertas que gatean bloques:** T0.1 (`/smoke` gate: runtime vs carril Franco), firma real de prod (gatea el cluster onFinish: INFRA.3 + RB.3 + MH.2 — sin decidir en toda la sesión), fork de historial (ya decidido para C0.2: slice mínimo; la reconstrucción DB-autoritativa queda para E2).
- **Drift de migraciones (bloqueante de sprints con migración):** la DB de dev tiene 3 migraciones del motor B1 que la rama de runtime no conoce + `add_portal_indexes` local sin aplicar. Conciliar con Franco (revisión de SQL, jamás `reset`) ANTES de C3.2 o cualquier bloque con migración.
- El detalle, veredictos y orden de ejecución de las mejoras del runtime viven en `consolidacion-planoA-runtime.md`. Esta lista solo puntea; no dupliques el detalle acá para no crear dos fuentes.

---

*Convenio: cuando una pendiente se ejecuta, se moverá a `bitacora-roadmap.md` como su propio sprint cerrado y se borrará de acá. No se acumulan entradas resueltas.*

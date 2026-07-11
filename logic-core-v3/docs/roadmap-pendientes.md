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

### UTM — punto ciego de tests (camino cliente)
- **Sprint origen:** UTM.1 (2026-07-04) — deuda identificada en investigación read-only de seguimiento a P4.1
- **Qué:** Ningún test ejercita el camino real del cliente: handshake iframe → `parseAttribution` → `firstTouchRef` → body del request. `utm1-smoke.mjs` fabrica el body a mano; la verificación de UTM.1 invoca `capture_lead` directo. Ambos bypassean la capa que falló en prueba manual (abrir `/embed` pelado). Si se toca widget/embed, ese camino no tiene red automatizada.

---

## COST-1 — Telemetría de costo con modelo efectivo (implementado, verificación pendiente)

### Verificación en prod del costo real (SELECT + volumen de WARN)
- **Sprint origen:** COST-1 (2026-07-10)
- **Estado:** Implementado, gate de lógica verde (8/8 checks, `tsc`/lint OK). NO verificado contra datos reales — el bug era invisible al build, no se cierra por tsc verde.
- **Qué falta para cerrar:** (1) SELECT comparativo en PROD sobre `Conversation`/`QuotaUsage` — `estimatedCostUsd`/`costUsd` reciente vs el modelo del plan; confirmar que el costo registrado es ≠ $0 y corresponde al modelo efectivo. (2) Medir el volumen de eventos `chat.cost_model_unknown` en `chatbotEvent` para dimensionar qué tan extendido estaba el mismatch en prod.
- **Notas:** Al verificar, anotar el resultado en la entrada `## ✅ COST-1` de la bitácora y borrar esta pendiente.

### Chequeos abiertos de cobertura (dos `rg`, baratos)
- **Sprint origen:** COST-1 (2026-07-10)
- **Qué:** El fix protege `handleChatRequest`, pero el fallback vive en el call-site (`resolveEffectiveModel`), no en el provider. Quedan dos huecos posibles a confirmar por lectura:
  - **(a) Otros call-sites de `getModel`** fuera de `resolveEffectiveModel.ts` que sigan tirando 500 con un provider stub (`rg "getModel|ProviderNotImplementedError" src/`) — p.ej. `smokeTest`, insights, brief, si resuelven modelo por su cuenta.
  - **(b) El WARN cubre registry, no pricing:** son dos tablas distintas (registry de modelos en `google.ts` vs tabla de precios en `pricing/costs.ts`). Un modelo presente en el registry pero ausente en pricing sigue devolviendo $0 sin disparar WARN (`rg "cost_model_unknown" src/` y ver contra qué valida).
- **Cuándo prioritarlo:** Junto con la verificación en prod de arriba, o antes si el volumen de WARN sale bajo y sospechás falsos negativos.

---

## RE-2 — Resiliencia de carga del widget (implementado, verificación pendiente)

### Verificación visual + coreografía con Neon dormida
- **Sprint origen:** RE-2 (2026-07-10)
- **Estado:** Implementado, gate de lógica verde (6/6, `tsc`/lint OK, el no-envenenamiento del cache testeado contra el módulo real). NO verificado visualmente.
- **Qué falta para cerrar:** (1) Visual-qa del estado de error/reintento en desktop + mobile, en ambos render (embed + on-site) — bloqueado hoy por el MCP de preview sin cablear (ver Gaps de entorno). (2) Coreografía real con Neon dormida DE VERDAD (cold-start real, no mock): ver el auto-retry disparándose y recuperándose, por grabación. El mock del smoke no sustituye esto ("verde ≠ se ve").
- **Notas:** Al verificar, anotar en la entrada `## ✅ RE-2` y borrar esta pendiente.

### Decisión diferida: microcopy durante el retry de `/config`
- **Sprint origen:** RE-2 (2026-07-10)
- **Qué:** Mientras `/config` reintenta, el widget muestra el spinner normal, sin texto. Se evaluó un microcopy tipo "cargando…". Decisión: NO agregarlo por ahora (spinner solo); el estado "Conectando…" queda reservado al POST de `/chat` de INFRA.2, no a la carga de config — no fundir los dos vocabularios.
- **Cuándo prioritarlo:** Revisar CON la grabación de Neon dormida en mano — si el spinner se siente muerto durante los 2s/4s de backoff real, ahí se evalúa un microcopy. No antes, sin el dato.

---

## Deuda técnica abierta por COST-1 (detalle de bloques en `docs/consolidacion-planoA-runtime.md`)

### `chat.cost_model_unknown` refuerza la urgencia de T0.2
- **Sprint origen:** COST-1 (2026-07-10)
- **Qué:** El WARN nuevo (`chat.cost_model_unknown`) puede dispararse por turno en un bot mal configurado, y se persiste en `chatbotEvent` — la tabla de crecimiento más rápido. T0.2 (cron `cleanupOldEvents`, aún sin hacer) pasa de "higiene" a tener un evento más que la alimenta.
- **Cuándo prioritarlo:** Cuando se corra T0.2, este evento es parte del argumento.

### `logChatbotEvent` await-eado = instancia de C3.6
- **Sprint origen:** COST-1 (2026-07-10)
- **Qué:** COST-1 emite el WARN vía `logChatbotEvent`, que hoy NO es fire-and-forget (persiste a `chatbotEvent` de forma bloqueante). En un bot roto eso es un write extra a Neon en cada turno, en el hot path que sufre el cold-start. Es exactamente C3.6 (hacer `logChatbotEvent` fire-and-forget en el gating).
- **Cuándo prioritarlo:** Se salda cuando se toque el handler por el cluster onFinish (donde vive C3.6 como regla "dejar mejor lo que se toca").

---

## Gaps de entorno (bloquean verificación, no build)

### MCP de preview sin cablear para el subagente visual-qa
- **Sprint origen:** INFRA.2, repetido en RE-2 (2026-07-10)
- **Qué:** El subagente visual-qa no tiene el MCP de preview conectado, así que no puede capturar el estado renderizado en desktop/mobile. Ya lo documentó INFRA.2; RE-2 lo volvió a chocar. Todo sprint con superficie visual queda cojo hasta resolverlo — la verificación de reposo cae sobre Valentino a mano.
- **Cuándo prioritarlo:** ANTES de C0.2 (conversación no muere muda), que es visual y de negocio. Entrar a C0.2 con el visual-qa roto es fabricar el tercer sprint cojo seguido.
- **Notas:** Es config de entorno/herramienta, no código del proyecto.

---

## Punteros a la consolidación (detalle en `docs/consolidacion-planoA-runtime.md`)

- **Carril seguridad (lo corre Franco, aparte del flujo de sprints):** RT-2 (`/smoke` sin auth quema Gemini), RE-13 (`/health` expone internals), RE-16 (SSRF/DNS-rebinding en `postToN8n` — ya listado arriba en B5.8), RE-7 (atribución spoofeable por cualquier origin), RT-13 (sessionId adivinable → secuestro intra-tenant), CO-7 + PD-1 (cripto en reposo: tokens OAuth de terceros / credenciales de onboarding en texto plano), A.4 (secret en history sin purga).
- **Decisiones abiertas que gatean bloques:** T0.1 (`/smoke` gate: runtime vs carril Franco), firma real de prod (gatea el cluster onFinish: INFRA.3 + RB.3 + MH.2), fork de historial (gatea C0.2: slice mínimo vs reconstruir desde `ChatMessage`).
- El detalle, veredictos y orden de ejecución de las mejoras del runtime viven en `consolidacion-planoA-runtime.md`. Esta lista solo puntea; no dupliques el detalle acá para no crear dos fuentes.

---

*Convenio: cuando una pendiente se ejecuta, se moverá a `bitacora-roadmap.md` como su propio sprint cerrado y se borrará de acá. No se acumulan entradas resueltas.*
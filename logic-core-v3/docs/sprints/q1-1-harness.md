# Q1.1 — Corredor de conversaciones doradas (ejecuta y captura, NO evalúa)

**Fecha:** 2026-07-05 · **Estado:** ✅ implementado (verificación humana de la corrida LLM pendiente)

## Context

Tras el bloque EV, el bot resuelve su comportamiento (scoring, intents, copy) desde packs
verticales (`base`, `usados`, `agencia`) según `BotConfig.verticalPack`. No había forma
automatizada de verificar que un cambio de prompt / pack / modelo (Gemini) no rompió el
comportamiento — se probaba conversando a mano. Este sprint construye el **corredor**: ejecuta
conversaciones scripteadas contra el bot **real** (Gemini real, sin mocks) y **captura** las
respuestas crudas en JSON para evaluación posterior.

> **Q1.1 NO evalúa ni puntúa.** Sólo ejecuta y captura. Las `expectations` viajan verbatim al
> output. El scoring contra ellas es **Q1.2**.

## Paso 0 — Discovery (hallazgos)

- **Endpoint:** `POST /api/chatbot/{slug}/chat` — bot por `slug` en la URL (no botId en el body).
  Body Zod: `{ messages:[{role,content}], sessionId, currentPath?, referrer?, utm* }`. `Origin` es
  gatekeeper → en dev con `QA_ALLOW_LOCALHOST=1` (`npm run dev:qa`, :3002) se acepta localhost. Bot
  inactivo → 404.
- **Stream:** dos shapes — SSE (`text/event-stream`, AI SDK v6 `toUIMessageStreamResponse()`) o JSON
  plano (degradado por quota/dominio, o error). Se ramifica por `Content-Type`. El patrón probado del
  repo (`scripts/regression/run-baseline.ts`) **no** parsea el SSE para capturar: drena el stream y
  lee texto + toolCalls (con `input`) **canónicos desde la fila persistida** (`ChatMessage`, que
  `handleChatRequest.onFinish` escribe). Se adoptó ese patrón. El intent NO viaja en el wire → se
  reconstruye offline con el mismo `detectIntent` del server.
- **Bots QA:** ningún `qaseed-bot-*` cubría `usados`/`agencia` (todos `base`, `isActive:false`).
  `BotConfig.verticalPack` es `String @default("base")`. **Decisión (usuario): seedear 3 bots QA
  propios**, uno por pack — nunca bots demo (sanmiguel/develop) ni cliente (matsu).
- **Gating:** org → `Subscription` → `Plan{quota, tools[], llmModel}`. Plan **BUSINESS** = quota 5000,
  los 4 tools, `maxDomains:null`. `QuotaUsage` es contador por `(bot,año,mes)`, **no** se reembolsa al
  borrar. Cleanup dev-only por prefijo de `sessionId` (patrón `purge.ts`, transaccional + host guard).

## Decisión: 3 bots QA dedicados

| Pack | Bot slug | Org slug |
|------|----------|----------|
| `base` | `qaseed-evals-base` | `qa-evals-base` |
| `usados` | `qaseed-evals-usados` | `qa-evals-usados` |
| `agencia` | `qaseed-evals-agencia` | `qa-evals-agencia` |

`seed-eval-bots.ts` (idempotente, dev-only): Organization → Subscription (→ BUSINESS) → BotConfig
(`isActive:true`, pack, KB liviana con `forbiddenStatements`). `--teardown` borra las 3 orgs (cascade).

## Arquitectura (`src/modules/chatbot/evals/`)

```
shared.ts          constantes (slugs QA, prefijo evals-, host dev) + guardDevHost
types.ts           Zod (Scenario/Expectations) + tipos de captura (CapturedTurn/RunResult)
scenarios/*.json   36 escenarios (12 × 3 packs) — DATOS, sin lógica
client.ts          postTurn(): fetch + Origin + consumo del stream (SSE vs JSON degradado)
capture.ts         readBack canónico desde DB (waitForAssistantMessage + parseToolCalls + lead)
seed-eval-bots.ts  seed idempotente de los 3 bots QA
cleanup.ts         purga por prefijo + reset de QuotaUsage; librería + entry standalone
runner.ts          orquesta: carga+Zod → verify bots → preflight → correr → dump JSON → cleanup
results/           <ISO>.json (gitignored)
```

## Escenarios (Paso 3)

12 arquetipos por pack: 6 compartidos (caliente, explorador, fuera-de-KB, inyección de prompt,
precio, humano) + 6 del rubro. `expectedIntent` usa las claves reales de cada pack
(usados: `purchase_ready/schedule_visit/trade_in/financing_inquiry/specific_model/price_inquiry/human_handoff`;
agencia: `price/urgency/comparison/service_inquiry/consultation`; base: `price/consultation`).

## Comandos

```bash
npm run dev:qa                         # dev server QA (:3002, QA_ALLOW_LOCALHOST=1)
npm run evals:seed                     # una vez: crear/asegurar los 3 bots QA (idempotente)
npm run evals                          # 36 conversaciones → results/<ISO>.json
#   flags: --pack base|usados|agencia  ·  --keep (no limpia)
npm run evals:purge -- --dry           # contar filas evals- (read-only)
npm run evals:purge -- --reset-quota   # + resetear QuotaUsage de los bots QA
```

## Log de verificación (esta sesión)

| Check | Resultado |
|-------|-----------|
| `tsc --noEmit` | ✅ sin errores en `evals/` (único ruido: `.next/dev/types/validator.ts` generado, baseline ajeno) |
| `eslint src/modules/chatbot/evals/**/*.ts` | ✅ limpio (0 problems) |
| `npm run evals:seed` | ✅ 3 bots creados vs schema real, plan BUSINESS, `isActive:true` |
| `npm run evals:purge --dry` | ✅ host guard + Prisma + query de purga OK (0 filas) |
| runner front-half (server abajo) | ✅ carga + Zod de los 36 escenarios + verify de los 3 bots + abort en preflight, sin LLM ni writes |
| smoke real `npm run evals --pack base` (12 conv, Gemini real) | ✅ pipeline completo (POST→stream→readback DB→captura→JSON→cleanup); 13/14 turnos capturados + 1 timeout capturado como `error`; DB limpia post-run |
| batería LLM completa 36 (`usados` + `agencia` en vivo) | ⏳ **verificación humana de Valentino** (real Gemini) |

Cero `any`. Cero modificación fuera de `evals/` + `package.json` + `.gitignore`. Cero migración, cero
cambio de runtime/packs/scoring/prompts/schema. Build no es gate.

## Pendiente del humano (Valentino)

1. `npm run dev:qa`, luego `npm run evals` una vez → confirmar que las 36 conversaciones se ejecutan y
   se capturan (NO que estén "bien" — eso es Q1.2) y que el cleanup dejó la DB limpia
   (`npm run evals:purge -- --dry` → 0 filas). Los 3 bots QA ya quedaron seedeados.
2. Commitear cuando revises.

## Fuera de scope (anotado)

- Backfill `verticalPack` de bots reales (`develop`→agencia, `matsu`→usados): gate abierto, ajeno a Q1.1.
- Quota: corridas repetidas consumen `QuotaUsage` mensual de los bots QA; mitigado por quota alta + reset.
- No-determinismo del LLM en la captura de tools: esperado; Q1.2 define tolerancias.

---

## Q1.1-fix — Readback timeout en turnos lentos/tool-only (2026-07-05, sesión posterior)

Al correr la batería completa aparecieron 3 escenarios no-evaluables por
`"timeout esperando persistencia del assistant message"` (`base-hot`, `usados-hot`,
`agencia-hot` — los de mayor intención comercial). Reproducido de forma independiente en 3
corridas distintas (el smoke test de este sprint, la corrida de verificación de Q1.2, y la
batería de 36 de este fix). Este addendum diagnostica y ajusta el harness — no toca el bot.

### Diagnóstico

**La hipótesis original era falsa.** No es que un turno tool-only no persista texto: el write
del `ChatMessage` de assistant en `onFinish` (`handleChatRequest.ts:751`) es **incondicional**,
sin ningún guard de longitud. Confirmado además que el stream HTTP de respuesta **no puede
cerrar** hasta que `onFinish` (con toda su cadena de persistencia Prisma) termine — verificado
leyendo el código fuente instalado de `ai@6.0.214` (`flush()` awaitea `onFinish` completo antes
de soltar el EOF). Consecuencia directa: el timeout de 30s del harness era, en el 100% de los
casos reales, tiempo muerto — para cuando el harness empieza a pollear, la fila **ya está
escrita o nunca va a aparecer**.

**Por qué nunca aparece — evidencia de la re-corrida con `--keep`** (antes no se podía
confirmar: el cleanup automático del propio harness purgaba `ChatMessage`/`ChatbotEvent` de
toda corrida no explícitamente `--keep`, incluida la que originalmente vio el síntoma). Con la
DB preservada esta vez, los 5 turnos que fallaron en la corrida de verificación muestran un
patrón limpio y consistente: **el turno que falla tiene CERO filas `ChatbotEvent` de cualquier
tipo** — ni `chat.message_completed` (éxito) ni `chat.persist_error` (el catch de `onFinish` sí
loguea explícitamente al fallar) — mientras que el turno anterior de la MISMA conversación
tiene su rastro de eventos completo e intacto. Como el logueo del error (`logChatbotEvent`) es
un write Prisma independiente y protegido contra su propia excepción, su ausencia total apunta
a algo más severo que "una línea tiró y se atrapó": más probable es una falla transitoria de
conexión/pool (Neon) que tumba TODOS los writes de esa request puntual, incluido el propio
intento de loguear el fallo.

**Refutado también: no es específico de `capture_lead` ni de los escenarios "hot".** La
re-corrida golpeó 5 escenarios distintos (`base-hot`, `usados-hot`, `base-generic-inquiry`,
`usados-modelo-testdrive`, `agencia-human`) — ninguno de los turnos que falló esta vez
involucraba `capture_lead` (dos son `show_whatsapp_handoff` previos, uno es texto plano, dos
son primer-turno sin tools). Y `agencia-hot` — que había fallado en la corrida original —
esta vez completó sus 2 turnos limpio, con `capture_lead` disparando y persistiendo bien
(`tool.lead_captured` en el log). Es decir: **es una falla intermitente a nivel de
request/infraestructura, no determinística por contenido ni por escenario.**

### Fix (harness-only, `src/modules/chatbot/evals/`)

1. **`capture.ts`** — `ASSISTANT_MESSAGE_POLL_TIMEOUT_MS` bajado de 30s a 10s (constante
   nombrada + comentario explicando por qué, para que no se vuelva a subir "por las dudas").
2. **`runner.ts`** — un timeout de persistencia ya no aborta el resto del escenario
   (`break`→`continue`): el turno queda marcado con error (no-evaluable para Q1.2) pero se
   sigue con los turnos restantes. Requirió corregir el contador de turnos esperados
   (`assistantCount` → `confirmedAssistantCount`, solo avanza en éxito confirmado — si no,
   un turno posterior exitoso pediría la posición equivocada y timeotearía siempre) y decidir
   qué empujar al historial local en el turno fallido (`{role:'assistant', content:''}` —
   el server usa el array `messages` del cliente **verbatim**, sin reconstruir de la DB, así
   que mantener la alternancia user/assistant que Gemini/Vertex espera importa de verdad).

Cero `any`, cero cambio de tipos, cero archivo tocado fuera de `capture.ts`/`runner.ts`.

### Verificación

Corrida completa (36 escenarios, `--keep`) tras el fix: **43→44 turnos** (exactamente el +1
esperado — `agencia-hot` ahora intenta y completa su 2º turno, antes nunca se alcanzaba).
Comparación automatizada escenario-por-escenario contra la corrida base: de 36, solo 4
difieren en presencia de error, y los 4 son consistentes con la intermitencia ya confirmada
(2 nuevos golpes aleatorios, 1 recuperación completa de `agencia-hot`, ver arriba) — cero
diferencias atribuibles al cambio de código. `base-hot`/`usados-hot` siguen fallando en su
turno de contacto en ambas corridas (no es algo que el harness pueda arreglar — es el bug de
arriba) pero ahora sin quemar 20s+ extra de espera muerta. `tsc --noEmit` sin errores nuevos
(baseline `searchconsole.ts:119`); lint limpio en los 2 archivos tocados.

### Pendiente / hallazgo para un sprint futuro (bot, no harness)

Bug de confiabilidad en `handleChatRequest.ts`: `onFinish` envuelve toda su cadena de
persistencia en un `try/catch` que loguea pero nunca re-lanza — si la conexión a la DB falla
para esa request puntual, el visitante recibe un HTTP 200 normal y la conversación pierde ese
turno **sin ningún rastro** (ni siquiera el evento de error, aparentemente por la misma causa
que tumbó el write original). Tasa observada: ~11-14% de turnos en una corrida de 44 bajo
carga secuencial sostenida. Posible pista a seguir: agregar un `onError` a `streamText` +
decidir si reintentar la persistencia o al menos garantizar que el logueo del fallo sobreviva
aunque el resto de la cadena no. No implementado acá — fuera de scope (harness-only).

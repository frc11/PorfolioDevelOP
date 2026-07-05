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

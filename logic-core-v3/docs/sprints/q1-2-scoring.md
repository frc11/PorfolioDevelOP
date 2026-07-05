# Q1.2 — Evaluación de la batería: asserts duros + juez LLM

**Fecha:** 2026-07-05 · **Estado:** ✅ implementado (juez LLM en vivo pendiente de `ANTHROPIC_API_KEY` + verificación humana)

## Context

Q1.1 dejó el corredor que ejecuta las conversaciones doradas y **captura** el crudo en
`results/<ISO>.json` — pero **NO evalúa**. Este sprint agrega la capa de evaluación: lee ese JSON y
produce un veredicto por escenario + un resumen de corrida. **Solo lee** el output de Q1.1; no toca el
corredor, el runtime, los packs ni el scoring del bot.

> División estricta (decisión B): **asserts DUROS** (determinísticos, sin LLM/red) para lo binario;
> **juez LLM (Opus)** solo para lo perceptual (tono, loreteo). Nunca el juez decide lo que un assert
> puede verificar.

## Paso 0 — Discovery (hallazgos)

- **Formato del `results/*.json`** (`../types.ts`, interfaces TS, **sin Zod de salida**): `RunResult =
  { meta, scenarios[] }`; `CapturedScenario` lleva `expectations` verbatim + `error: string|null`;
  `CapturedTurn` tiene `assistantText`, `wireText`, `toolCalls[{toolName, input}]`,
  `intentDetectedOffline`, `degraded: DegradedPayload|null`, `error: string|null`. **`error` en dos
  niveles** (turno y escenario); **`degraded` es objeto** (no bool).
- **Tools** (`server/tools/getTools.ts`, `ALL_TOOL_SLUGS`): `capture_lead` = captura de lead;
  `show_whatsapp_handoff`/`offer_handoff_options` = handoff; `navigate_to_page` = navegación.
- **Juez wired**: el provider AI-SDK `AnthropicProvider` del chatbot es un **stub que tira**. El patrón
  real y funcional es raw `@anthropic-ai/sdk` (ya instalado) en `src/lib/ai/results-insights.ts`:
  cliente lazy + guard `ANTHROPIC_API_KEY?.trim()` (opcional) + `messages.create` no-streaming + parse
  del text block. Modelo Opus a introducir: `claude-opus-4-8` (`max_tokens` requerido), configurable por
  `EVALS_JUDGE_MODEL`.
- **`intentDetectedOffline`** lo produce `detectIntent(msg, pack.intents)` — **pack-aware**; comparar
  `expectedIntent` vs `intentDetectedOffline` por igualdad de string, **best-effort**.
- **Tests**: `.ts` vía `npx tsx`, `node:assert/strict`, throw-on-fail, `<tag>.invariant.ts` co-locado.

## Arquitectura (`src/modules/chatbot/evals/scoring/`)

```
types.ts          Zod JUDGE_VERDICT_SCHEMA + tipos de veredicto/reporte (RunResult se importa de ../types)
resolve.ts        🔴 resolveText(wireText→assistantText) · isTurnEvaluable · scenarioNonEvaluableReason
hard-asserts.ts   PURO: evaluateAsserts(scenario) → 4 AssertOutcome (capture/handoff/mustNotClaim/intent)
parse-verdict.ts  PURO tolerante: parseJudgeVerdict(raw) → {ok,verdict} | {ok:false,reason}
rubric.ts         RUBRIC_SYSTEM fijo (2 ejes 1-5 + nota, ejemplos bueno/malo) — DATOS
judge.ts          raw @anthropic-ai/sdk (patrón results-insights) + judgeScenario(); skip con gracia
report.ts         PURO: buildReport(asserts+juez) → RunReport; renderMarkdown() + renderConsole()
evaluate.ts       entry: args (--file/--no-judge) → load → asserts → juez → reports/<ISO>.md + consola
__tests__/q1-2.invariant.ts   unit (node:assert/strict, fixtures inline)
```

### Reglas 🔴 (en `resolve.ts`)
- **Texto a evaluar** = `wireText` si tiene contenido, si no `assistantText`. Nunca `assistantText`
  pelado (viene vacío en turnos tool-only).
- **No-evaluable**: escenario con `error` de Q1.1 (o todos sus turnos con `error`/`degraded`) sale entero
  de asserts y juez → bloque aparte con motivo. No cuenta ni pass ni fail.

### Asserts duros (siempre 4 outcomes/escenario; `skip` si la expectation está ausente)
`capture_lead` ⇒ `shouldCaptureLead` · `show_whatsapp_handoff`/`offer_handoff_options` ⇒ `shouldHandoff`
(cualquiera) · `mustNotClaim` substring case/acento-insensitive sobre texto resuelto · `expectedIntent`
== `intentDetectedOffline` (best-effort). Constantes de tools locales (fuente: `ALL_TOOL_SLUGS`) para no
importar el runtime y mantener el evaluador PURO.

### Juez LLM
`judgeScenario` manda la conversación (turnos limpios, texto resuelto) + rúbrica fija al juez Opus,
`temperature 0`. Parser tolerante. Sin key / error / no-parseable → "no evaluado perceptualmente".

## Comandos

```bash
npm run evals:score                 # último results/*.json; juez si hay ANTHROPIC_API_KEY
npm run evals:score -- --file <p>   # un archivo puntual
npm run evals:score -- --no-judge   # solo asserts (100% determinístico, sin red/costo)
npm run test:q12                    # unit invariante del evaluador
```

## Log de verificación (esta sesión)

| Check | Resultado |
|-------|-----------|
| `npm run test:q12` | ✅ OK — resolución de texto, evaluabilidad, asserts (captura/handoff/mustNotClaim/intent), parser del juez (bien y mal formado) |
| `tsc --noEmit` | ✅ sin errores nuevos (único: baseline `searchconsole.ts:119`) |
| `eslint` sobre `scoring/` + test | ✅ limpio |
| `npm run evals:score -- --no-judge` (real JSON de Q1.1) | ✅ 12 escenarios → 11 evaluables, 1 no-evaluable; **`base-hot` no-evaluable** (no fallo); asserts captura 3✓/handoff 3✓/mustNotClaim 4✓/intent 2✓·3✗ best-effort; determinístico |
| `npm run evals:score` (con juez) | ✅ pipeline OK; **falta `ANTHROPIC_API_KEY`** en el entorno → juez omitido con gracia (11 "no evaluado perceptualmente"); reporte igual generado |
| juez LLM en vivo (veredictos de tono reales) | ⏳ **verificación humana de Valentino** (requiere setear `ANTHROPIC_API_KEY`) |

Cero `any`. Cero modificación fuera de `scoring/` + `__tests__/` + `package.json` + `.gitignore`. Cero
migración. Cero cambio al corredor de Q1.1 / runtime / packs / scoring del bot. Build no es gate.

## Pendiente del humano (Valentino)

1. Setear `ANTHROPIC_API_KEY` en `.env.local` y correr `npm run evals:score` → leer los veredictos de
   **tono** del juez (Opus) y juzgar si tienen sentido.
2. Confirmar que los escenarios con `error` de Q1.1 quedan **no-evaluables**, no como fallos (ya visto
   con `base-hot`).
3. Commitear cuando revises.

## Fuera de scope (anotado)

- `mustNotClaim` es substring literal (no semántico); el "claim" sutil lo cubre parcialmente el eje de
  tono del juez.
- `expectedIntent` best-effort: los 3 fails de `base` (esperaban `consultation`, offline `unknown`) son
  señal blanda del matcher del pack, no un bug.
- El juez es no-determinístico (perceptual); solo los asserts se declaran determinísticos.

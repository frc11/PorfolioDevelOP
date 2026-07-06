# INFRA.1 — Rastro off-Neon de toda falla de persistencia + `onError` + `.code`/`.cause`

**Fecha:** 2026-07-05 · **Estado:** ✅ implementado (solo observabilidad) · **Gate:** `npm run test:infra1` (5/5)

## Context

En prod el bot pierde ~11-14% de turnos bajo carga sostenida **sin dejar rastro** (hallazgo abierto por Q1.1-fix, `bitacora-roadmap.md`). La cadena de persistencia de `onFinish` corre sobre una conexión Prisma que quedó idle durante el stream de Vertex; cuando muere contra Neon mid-request, **todos los writes de esa request caen — incluido el log del propio error** — y el visitante igual recibe HTTP 200.

> **Scope:** solo observabilidad. NO se toca la conexión a Neon ni se intenta que el write no falle — eso es **INFRA.2** (causa raíz). Acá solo se garantiza el rastro y se captura el diagnóstico (`.code`/`.cause`).

## Paso 0 — Discovery (hallazgos verificados)

| Pregunta | Hallazgo |
|---|---|
| El `catch (persistError)` hoy | `handleChatRequest.ts:821`. Orden: `chatbotError` (stderr+Sentry) → `await logChatbotEvent` (write Neon) → `Sentry.captureException`. |
| ¿`logChatbotEvent` traga y no relanza? | Sí. `persistentLogger.ts:44` es `await prisma.chatbotEvent.create(...)` (mismo `@/lib/prisma`/Neon); su catch (54-64) emite solo `logger.persist_failed` con `error.message` y retorna void. Bajo Neon caída → cero filas. |
| ¿`chatbotError` incluye `.code`/`.cause`? | **No.** `logger.ts:62-65` extrae solo `{ message, name, stack }`. Ningún helper del repo leía `.code`/`.cause` → hubo que construir el extractor. |
| Sentry DSN | `NEXT_PUBLIC_SENTRY_DSN` (`src/instrumentation.ts`), sin fallback → `captureException` no-op silencioso sin DSN. Ausente en prod (OPTIONAL en `check-env.js:65`). → **sink primario = stderr**; Sentry secundario best-effort → `[FALTA:sentry-dsn]`. |
| `onError` en `streamText` | **Ausente** (cero matches). Errores mid-stream enmascarados como 200 por `toUIMessageStreamResponse()`. |
| Firma del error de Neon | Dos formas (`scripts/regression/run-baseline.ts:62-68`): `e.message === 'terminated'` directo de Prisma, **o** `e.message === 'fetch failed'` con el socket error en `e.cause` (undici, `code` tipo `UND_ERR_SOCKET`). Prisma-known errors traen `.code` (P1017/P2024/P1001). |
| Testing | Sin Vitest/Jest, `prisma` singleton de módulo (sin DI). Convención: `*.invariant.ts` con `npx tsx` + `node:assert/strict`, cero DB/network. **Gate elegido: invariant test del sink.** |

## Arquitectura

```
src/modules/chatbot/server/
  logging/
    logger.ts                                  # + extractDbErrorInfo() + logPersistFailure()  [sink off-Neon]
    index.ts                                   # exporta ambas del barrel
    __tests__/persist-failure-sink.invariant.ts  # GATE (nuevo)
  chat/
    handleChatRequest.ts                       # onError en streamText + sink en 2 catches
```

**`logPersistFailure(event, error, fields)`** — sink off-Neon garantizado: una línea JSON a `console.error` (→ Netlify Function Logs) con `{ type, level, timestamp, ...fields, ...extractDbErrorInfo(error) }`. No toca Prisma, no depende de Sentry, nunca lanza. Por eso **sobrevive a la muerte de la conexión**: no hay conexión que pueda afectarlo.

**`extractDbErrorInfo(error)`** — `{ errorName, errorMessage, prismaCode?, causeCode?, causeMessage? }`. Desenvuelve `PrismaClientKnownRequestError.code` (+ `PrismaClientInitializationError.errorCode`) y `error.cause` de undici. Cero `any` (narrowing con `instanceof` + `in`).

**Cableado en `handleChatRequest.ts`** (el sink va **primero**, antes de cualquier write a Neon):
- `onError` nuevo en `streamText` → `chat.stream_error` (captura fallas mid-stream hoy invisibles).
- `catch` de persistencia → `chat.persist_failed` (sink primero) + `logChatbotEvent` best-effort después + Sentry explícito.
- `catch` top-level → `chat.unhandled_failed` (sink primero) + resto intacto (incluido el 500).

**Mapa de nombres de evento** (para filtros de log): stderr `error.chat.persist_error` → `chat.persist_failed`, `error.chat.unhandled_error` → `chat.unhandled_failed`, nuevo `chat.stream_error`. Los event types de **DB** (`chat.persist_error`, `chat.unhandled_error`) se mantienen vía `logChatbotEvent`.

## Comandos

```bash
npm run test:infra1                                  # GATE — el sink sobrevive + captura .code/.cause
.\node_modules\.bin\tsc.cmd --noEmit                 # solo baseline searchconsole.ts:119
.\node_modules\.bin\eslint.cmd src/modules/chatbot/server/logging src/modules/chatbot/server/chat/handleChatRequest.ts
git diff --stat                                      # confirmar que lib/prisma.ts NO aparece
```

## Log de verificación (esta sesión)

| Check | Resultado |
|---|---|
| `npm run test:infra1` | ✅ 5/5 — undici cause, P1017, P2024, no-Error, nunca-lanza |
| `tsc --noEmit` | ✅ solo baseline `searchconsole.ts:119`, cero errores nuevos |
| `eslint` (tocados) | ✅ 0 errores; 1 warning **pre-existente** (`toolResults` sin usar en `onFinish`, no introducido por INFRA.1) |
| `git diff` | ✅ 5 archivos; **`lib/prisma.ts` NO tocado** (config de conexión intacta) |

El gate simula la caída de conexión alimentando al sink las firmas reales de prod (`P1017` terminated, `P2024` pool, `fetch failed`+`cause: terminated`/`UND_ERR_SOCKET`) y confirma que emite la línea estructurada con `prismaCode`/`causeMessage` y nunca lanza. Como el sink no tiene dependencia de DB, testearlo aislado **es** probar que el rastro sobrevive a Neon caída.

## Pendiente del humano (Valentino)

1. **Revisar el gate**: que `persist-failure-sink.invariant.ts` prueba lo que dice (supervivencia + `.code`/`.cause`).
2. **`[FALTA:sentry-dsn]`**: setear `NEXT_PUBLIC_SENTRY_DSN` en Netlify para activar el canal Sentry secundario (hoy ausente → no-op). El sink primario (stderr) ya funciona sin config.
3. **Con tráfico real**: grepear `chat.persist_failed` en Netlify Function Logs y leer `prismaCode` / `causeMessage`. **Esa es la firma real de prod que decide INFRA.2** (terminated vs pool vs prepared-stmt vs connect).

## Fuera de scope (anotado)

- **INFRA.2 (causa raíz)**: no se tocó `lib/prisma.ts`, connection string, pooler, `DIRECT_URL`, `connection_limit`; sin reintento del write.
- **Paso 4 diferido**: los `console.error` fire-and-forget de `captureLead.ts` (`notifyClient` L466-468, `syncLeadToCrm` L478-480) siguen en texto plano — follow-up barato; el módulo ya emite `capture_lead.*` estructurado.
- Warning pre-existente `toolResults` sin usar en `onFinish` — no se tocó (fuera de objetivo).

# Evals — corredor de conversaciones doradas (Q1.1)

Ejecuta conversaciones scripteadas contra los bots QA **reales** (Gemini real,
sin mocks) y **captura** las respuestas crudas en `results/<timestamp>.json`
para evaluación posterior.

> **Este bloque NO evalúa ni puntúa.** Sólo ejecuta y captura. Las
> `expectations` de cada escenario viajan verbatim al output, sin tocarse. El
> scoring contra ellas es **Q1.2**.

## Cómo correrlo

```bash
# 1. Levantar el dev server QA (puerto 3002, QA_ALLOW_LOCALHOST=1)
npm run dev:qa

# 2. Una sola vez: seedear los 3 bots QA (idempotente)
npm run evals:seed

# 3. Correr el corredor (36 conversaciones = 12 escenarios × 3 packs)
npm run evals
#    Flags:  --pack base|usados|agencia   (un solo pack)
#            --keep                        (no limpia; deja las filas para inspección)

# Purga standalone de filas que quedaron de una corrida interrumpida:
npm run evals:purge            # borra filas con sessionId "evals-"
npm run evals:purge -- --dry   # sólo cuenta
npm run evals:purge -- --reset-quota   # + resetea QuotaUsage de los bots QA
```

El JSON de resultados se escribe en `results/<ISO-timestamp>.json` (gitignored).

## Bots QA destino

`npm run evals:seed` crea/asegura, **sólo** en orgs QA descartables `qa-evals-*`
(nunca toca bots demo como `sanmiguel`/`develop` ni de cliente como `matsu`):

| Pack | Bot slug | Org slug |
|------|----------|----------|
| `base` | `qaseed-evals-base` | `qa-evals-base` |
| `usados` | `qaseed-evals-usados` | `qa-evals-usados` |
| `agencia` | `qaseed-evals-agencia` | `qa-evals-agencia` |

Cada bot es `isActive:true`, con el `verticalPack` correcto, KB liviana por
vertical, y suscripto al plan `BUSINESS` (habilita las 4 tools + quota alta).
`npm run evals:seed -- --teardown` borra las 3 orgs QA (cascade).

## Formato de escenario (`scenarios/*.json`)

Archivos de datos versionados, uno por pack. Validados con Zod al cargar
(`types.ts`). Agregar un escenario **no** toca la lógica del corredor.

```jsonc
{
  "id": "usados-permuta-financiacion",   // único, kebab-case
  "pack": "usados",                       // base | usados | agencia
  "description": "…",
  "turns": ["mensaje 1 del visitante", "mensaje 2 …"],  // en orden (role user)
  "expectations": {                       // TRANSPORTADAS, no evaluadas (Q1.2 las usa)
    "shouldCaptureLead": true,
    "shouldHandoff": false,
    "expectedIntent": "trade_in",         // clave de detectIntent del pack, best-effort
    "mustNotClaim": ["una tasa exacta"],  // afirmaciones prohibidas
    "toneNotes": "…"
  }
}
```

## Cómo se consume el stream

El endpoint (`POST /api/chatbot/{slug}/chat`) responde de dos formas:
- **SSE** (`text/event-stream`, AI SDK v6) en el camino normal, o
- **JSON plano** en modo degradado (quota/dominio) o error.

El corredor ramifica por `Content-Type`. Para el SSE bufferiza el cuerpo (lo que
**drena** el stream y dispara el `onFinish` del server que persiste el mensaje),
y luego lee el **texto y las toolCalls canónicos desde la fila persistida**
(`ChatMessage.content` + `ChatMessage.toolCalls`, con sus `input`) — más fiable
que parsear el SSE. Es el patrón de `scripts/regression/run-baseline.ts`. El
texto del wire se guarda como `wireText` secundario. El `intent` no viaja en el
wire: se reconstruye offline con el mismo `detectIntent` del server.

## Cleanup

Toda fila creada usa `sessionId` con prefijo `evals-`. Al terminar (sin
`--keep`), el corredor borra en transacción `ChatbotEvent → ChatbotLead →
Conversation` (cascade a `ChatMessage`) y resetea el `QuotaUsage` de los bots QA.
Guard de host dev-only sobre `DATABASE_URL` en cada entry.

## Archivos

- `types.ts` — schemas Zod + tipos del escenario y del resultado.
- `shared.ts` — constantes (slugs QA, prefijo, host dev) + host guard.
- `client.ts` — POST + consumo del stream.
- `capture.ts` — lectura canónica desde la DB.
- `seed-eval-bots.ts` — seed idempotente de los 3 bots QA.
- `cleanup.ts` — purga por prefijo + reset de quota.
- `runner.ts` — orquestación + volcado del JSON.
- `scenarios/*.json` — los 36 escenarios (datos).

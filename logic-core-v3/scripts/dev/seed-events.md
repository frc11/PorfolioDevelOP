# Sprint 1 — Seed de eventos para Activity (lane `intel-actividad`)

Doc de mapeo + reversibilidad del seed `scripts/dev/seed-events.ts`.
Objetivo: poblar `ChatbotEvent` (tabla compartida chatbots/Health/Activity) para
probar los filtros y el chart de `/admin/chatbot/activity`. **Solo INSERTA data.**
No toca `queries.ts`, el filtro/`ActivityLog.tsx`, ni el schema.

---

## Mapeo de filtros (verificado en código, ANTES de seedear)

El filtrado es **client-side** en `ActivityLog.tsx:126-132`, sobre el array de eventos
(la página carga los 50 más recientes del bot vía `listRecentEvents(organizationId, bot.id, 50)`
— B0-S3 antepuso `organizationId` para el scope de aislamiento).

### Filtro TIPO — `EVENT_TYPES` (ActivityLog.tsx:37-44)
Predicado: `e.type.toLowerCase().includes(typeFilter)` → **substring**, case-insensitive,
sobre `ChatbotEvent.type` (String libre).

| Opción UI        | value    | Matchea `type` que contenga | Tipos sembrados (ejemplos)                                                                              |
|------------------|----------|-----------------------------|--------------------------------------------------------------------------------------------------------|
| Todos los tipos  | `''`     | (todo)                      | —                                                                                                      |
| Chat             | `chat`   | `"chat"`                    | `chat.message_completed`, `chat.session_started`, `chat.quota_exceeded`, `chat.gating_domain_overflow`, `chat.unhandled_error`, `chat.llm_request_start` |
| Lead             | `lead`   | `"lead"`                    | `tool.lead_captured`, `lead.status_changed`, `tool.lead_reask`                                          |
| Errores          | `error`  | `"error"`                   | `chat.unhandled_error`, `chat.persist_error`, `llm.error`                                               |
| Quota            | `quota`  | `"quota"`                   | `chat.quota_exceeded`, `quota.warning`                                                                  |
| Config           | `config` | `"config"`                  | `config.updated`, `config.kb_reindexed`                                                                 |

> Nota: `config` no tiene emisor en runtime hoy. Como `type` es String libre y el filtro
> es substring, sembrar `config.*` es válido y 100% solo-data (no toca código).

### Filtro NIVEL — `SEVERITY_OPTIONS` (ActivityLog.tsx:46-52)
Predicado: `e.level !== levelFilter` → **igualdad exacta** sobre `ChatbotEvent.level`.

| Opción UI | value   | Campo            |
|-----------|---------|------------------|
| Todos     | `''`    | —                |
| Info      | `info`  | `level`          |
| Warning   | `warn`  | `level`          |
| Error     | `error` | `level`          |
| Debug     | `debug` | `level`          |

### ⚠️ BUG PRE-EXISTENTE — el filtro de NIVEL no matchea data real (fuera de scope)

`ChatbotEvent.level` es el enum `ChatbotEventLevel = INFO | WARN | ERROR | DEBUG`
(**MAYÚSCULAS**; `schema.prisma:171-176` y `:1412`). El logger lo escribe en mayúscula
(`persistentLogger.ts:48`, `LEVEL_TO_ENUM`). En runtime `e.level === 'INFO'`. Pero:

- `page.tsx:36` hace `level: e.level as 'info'|...` → **es un cast TS, no transforma el valor**.
- `ActivityLog.tsx:127` compara `e.level !== levelFilter` con value en minúscula, **sin normalizar**.

→ `'INFO' !== 'info'` es siempre `true` → con cualquier filtro de nivel activo el log da
**0 resultados** ("Sin eventos para los filtros seleccionados"). Mismo origen: `LEVEL_STYLES[event.level]`
y `LEVEL_ICONS[event.level]` (líneas 222/230) tampoco matchean → hoy todos los eventos se ven
con estilo `info` y sin ícono.

**No se puede arreglar con data**: `level` es enum, no admite minúsculas.

**FIX APLICADO** (decisión del humano, 2026-06-18) — normalización en el **borde de datos**,
sin tocar el componente de filtros `ActivityLog.tsx`:

```ts
// page.tsx:36 (eventos iniciales)
level: e.level.toLowerCase() as 'info' | 'warn' | 'error' | 'debug',
// route.ts:28  (eventos del polling /api/admin/chatbot/events)
level: e.level.toLowerCase(),
```

Al llegar el `level` en minúscula a `ActivityLog`, quedan correctos de una el filtro (127),
los estilos `LEVEL_STYLES` (222) y los íconos `LEVEL_ICONS` (230), para data inicial y polled.
Va en **commit propio**, separado del seed y del hover.

El seed escribe niveles correctos (enum). Con el fix aplicado, **filtro de TIPO, NIVEL y FECHA
+ el CHART + el hover** quedan operativos.

---

## conversationId
`ChatbotEvent.conversationId` es **opcional** (`String?`, `onDelete: SetNull`;
`schema.prisma:1413/1419`). No es obligatorio. Igual sembramos 3 `Conversation` de prueba
(para realismo y para ejercitar la línea path/session del log) y atamos a ellas los eventos
"de conversación" (chat/lead). `Conversation` requiere `botConfigId` + `sessionId` (único);
no tiene campo `metadata`, así que se marcan por **prefijo de sessionId** `seed-intel-actividad`.

---

## Datos sembrados
- Bot: `BotConfig.slug = 'develop'` (el que consulta `activity/page.tsx`). Si no existe → aborta.
- ~62 eventos distribuidos **12/06–18/06** (ventana del chart = `getActivityChartData`, 7 días).
- El bucket de **hoy** recibe el pool completo (14 tipos) en los minutos previos a "ahora"
  → garantiza que TODAS las combos queden en el top del stream (la página carga 50 por bot).
- Cada evento lleva `metadata._seed = 'intel-actividad'`.
- 3 conversaciones de prueba con `sessionId` prefijo `seed-intel-actividad`.

---

## Cómo correr  (desde `logic-core-v3/`)
```bash
npx ts-node --transpile-only scripts/dev/seed-events.ts
```
Usa `.env.local` (no hay `.env`). Runner del proyecto = `ts-node` (tsx no está instalado).

## Reversibilidad / cleanup
Orden FK: **eventos primero, conversations después**.
```bash
npx ts-node --transpile-only scripts/dev/seed-events.ts --clean
```
Equivalente manual (Prisma):
```ts
await prisma.chatbotEvent.deleteMany({ where: { metadata: { path: ['_seed'], equals: 'intel-actividad' } } })
await prisma.conversation.deleteMany({ where: { sessionId: { startsWith: 'seed-intel-actividad' } } })
```

> ⚠️ Estos eventos también aparecen en Health y en los dashboards de chatbots
> (tabla compartida `chatbot_events`). Es **esperado**.

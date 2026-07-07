# INFRA.2 — Idempotencia del user message + retry del widget para el cold-start

**Fecha:** 2026-07-06 · **Estado:** ✅ implementado · **Gate:** `npm run test:infra2` (2 suites)

## ⚠ Re-scope (leer primero)

INFRA.1 y su memoria describían **INFRA.2 como la "causa raíz" de conexión**. Este sprint
**re-escopa** el track:

| Sprint | Objetivo |
|---|---|
| INFRA.1 | Observabilidad (sink off-Neon) — hecho (2026-07-05). |
| **INFRA.2 (este)** | **Idempotencia del user message + retry acotado del widget** para recuperar el cold-start. |
| **INFRA.3 (antes "INFRA.2")** | **Causa raíz de conexión**: `lib/prisma.ts`, connection string, pooler, `DIRECT_URL`, retry server-side en `onFinish`. Sigue gated en la firma real de prod + Sentry DSN. |

## Context

Neon (branch **free**) autosuspende. Cuando un visitante escribe tras inactividad, el
cold-start (14–30s) puede exceder el límite de la función serverless (Netlify **free** ~10s)
→ la función muere antes de responder y el turno se pierde. INFRA.1 dejó el rastro; INFRA.2 es
**la defensa del free tier**: que el widget **reintente** el POST a `/chat` (el 2º request pega
contra la DB ya despierta), y que el server sea **idempotente** para que el reintento no
duplique el mensaje del visitante.

> **Scope:** dedup del user message (server) + retry del widget (cliente). **NO se toca la
> conexión a Neon** (`lib/prisma.ts`, connection string, pooler, `DIRECT_URL`, retry en
> `onFinish`) — eso es INFRA.3. Sin migración de schema.

## Paso 0 — Discovery (hallazgos verificados)

| Pregunta | Hallazgo |
|---|---|
| Persistencia del user message | `handleChatRequest.ts:509` — `prisma.chatMessage.create` **plano, sin guard**, corre **antes** del stream. Un retry lo re-ejecuta → fila duplicada. |
| `getOrCreateConversation` | `conversation/resolver.ts:67` — idempotente por `(botConfigId, sessionId)`. La conversación NO se duplica; el mensaje sí. |
| Idempotencia sin migración | `ChatMessage` (`schema.prisma:1400`) tiene `role`/`content`/`conversationId`/`createdAt` + `@@index([conversationId, createdAt])`, **sin `@@unique`**. Dedup por la cola (`findFirst orderBy createdAt desc`) usa solo columnas existentes → **sin migración**. |
| El widget | `useChatbot.ts` — Vercel AI SDK `useChat` con `fetch` custom en `DefaultChatTransport`. Único choke point de fallos: el `catch`/`5xx` del closure. **NO había retry ni timeout de cliente.** `sessionId` estable entre retries (`useRef` + `sessionStorage`). `fetch` resuelve en **headers** (pre-1er-byte) → el wrapper solo captura fallos pre-primer-byte (el caso cold-start). |
| Rate-limit | route `chatbotPerSession` 30/60s + handler `chatbotPerBotSession` 10/60s. 1 turno cold-start = máx **3 POSTs** → holgado. Los 429 no se reintentan. |

## Decisiones

1. **Dedup por "cola sin responder" (orphaned tail)**, no `content + ventana` a secas: solo se
   saltea cuando el USER idéntico es la **cola sin ASSISTANT después** — la huella de un retry
   perdido. Así una afirmación repetida legítima ("ok"/"dale" dos veces, ya respondida) NO se
   tira. Ventana `90s` (solo el borde para no adoptar un huérfano viejo; la corrección la da el
   rol de la cola).
2. **Fallo final → estado honesto "probá de nuevo"** (`connection_failed`), input **habilitado**
   para reintentar a mano. **Supersede** al viejo `provider_error` (que degradaba a WhatsApp al
   primer fallo de red/5xx). ⚠ Consecuencia deliberada: una caída **sostenida pre-stream** del
   proveedor (Vertex 5xx antes de headers) ahora muestra "probá de nuevo" en vez del handoff a
   WhatsApp. Elegido explícitamente sobre reusar el handoff.
3. **Sin timeout de cliente en v1**: cada intento lo corta la plataforma (`maxDuration`). Evita
   el race de doble-respuesta (ver Edge). Implicancia: el test local de "Neon dormido" en
   `next dev` NO dispara el retry (local no corta) → **verificar local simulando un 5xx**.

## Arquitectura

```
src/modules/chatbot/
  server/chat/
    dedup.ts                                   # NUEVO — shouldSkipUserPersist (puro, orphaned-tail)
    handleChatRequest.ts                       # guard de cola pre-L509 (findFirst → skip/create)
    __tests__/user-persist-dedup.invariant.ts  # NUEVO — gate del dedup
  shared/
    chatRetryPolicy.ts                         # NUEVO — política pura (classify/shouldRetry/backoff)
    __tests__/chat-retry-policy.invariant.ts   # NUEVO — gate del retry
  hooks/useChatbot.ts                          # retry loop en el transport; reconnecting; connection_failed
  components/chat/ChatHeader.tsx               # "Conectando…" + punto ámbar
  components/chat/DegradedBanner.tsx           # rama connection_failed (WifiOff ámbar, "probá de nuevo")
  components/chat/ChatWindow.tsx               # threading reconnecting + input via inputLockedByDegrade
  components/LogicCompanion.tsx                # pasa reconnecting + inputLockedByDegrade
  components/embed/ChatbotEmbed.tsx            # idem para el renderer iframe
```

**Server — `shouldSkipUserPersist(tail, incomingContent, now, windowMs=90_000)`**: puro,
clock-inyectado, sin DB. `true` (saltea) solo si la cola es USER, mismo contenido, dentro de la
ventana. El caller lee la cola con `findFirst({ where:{conversationId}, orderBy:{createdAt:'desc'},
select:{role,content,createdAt} })` y crea solo si `!shouldSkipUserPersist`. `messageCount += 2`
(en `onFinish`) no se toca → sin doble-conteo (el user deduped no incrementa; el increment
representa el turno user+assistant del intento que sí completó).

**Cliente — retry loop en el `fetch` del transport**: hasta `CHAT_RETRY_MAX_ATTEMPTS=3` (1+2),
backoff `[2000,4000]ms`. Reintenta SOLO transitorios (network-error / 5xx); 4xx (incl. 429) pasa
tal cual (Retry-After honrado por no martillar). En reintento setea `reconnecting=true`
("Conectando…" + punto ámbar en el header). Al agotar → `connection_failed` (banner ámbar "No
pudimos conectar. Probá de nuevo en un momento." + "Escribí de nuevo y seguimos.", input
habilitado). `inputLockedByDegrade` = todos los degradados menos `connection_failed`, así el
input queda editable para el reintento manual; `sendMessage` limpia el degrade reactivo al
reenviar.

## Coherencia con INFRA.1
El retry es un **POST independiente**: el intento-1 fallido sigue logueando en el sink off-Neon
(`chat.stream_error`/`chat.persist_failed`/`chat.unhandled_failed`) igual que hoy. `conversationId`
+ `sessionId` estables → el turno reintentado queda correlacionable. Nada se doble-cuenta.
**Límite:** el retry solo recupera fallos **pre-primer-byte**; la caída mid-stream (headers ya
flusheados) sigue enmascarada como 200 = INFRA.1/INFRA.3.

## Edge — doble respuesta (documentado, no guardado)
`onFinish` corre tras flushear el stream → el cliente ya resolvió su `fetch` = éxito, que nunca
reintenta. El retry solo dispara pre-1er-byte, mutuamente excluyente con "assistant ya
persistido". **Inalcanzable bajo este diseño**, salvo que se agregue un timeout de cliente <
`maxDuration` (por eso v1 va sin timeout). Peor caso teórico: 1 USER (deduped) + 2 ASSISTANT +
`messageCount+=4`. Mitigación futura si se agrega timeout: dedup de cola del lado assistant.

## Comandos

```bash
npm run test:infra2                        # GATE — dedup (orphaned-tail) + política de retry
.\node_modules\.bin\tsc.cmd --noEmit       # solo baseline searchconsole.ts:119
.\node_modules\.bin\eslint.cmd <tocados>
git diff -- lib/prisma.ts prisma/schema.prisma   # vacío (sin migración, sin tocar conexión)
```

## Log de verificación (esta sesión)

| Check | Resultado |
|---|---|
| `npm run test:infra2` | ✅ 2 suites verdes — dedup (7 casos, incl. "ok dos veces" y 3-retry→1 fila) + retry (clasificación, 4xx/429 nunca, acotado a 3, backoff clamp, Retry-After) |
| `tsc --noEmit` | ✅ solo baseline `searchconsole.ts:119`, cero errores nuevos en tocados |
| `eslint` (tocados) | ✅ cero errores nuevos. 3 issues **pre-existentes** en regiones NO tocadas (probado por los rangos de hunk): `ChatbotEmbed:295` messages.map (react-hooks/refs), `useChatbot:354` `setPendingSubmit` en effect, `handleChatRequest:722` `toolResults` sin usar. El build ignora lint (tsc es el gate). |
| `git diff` | ✅ **`lib/prisma.ts` y `prisma/schema.prisma` NO tocados** — sin migración, conexión intacta |
| visual-qa | ⚠ bloqueo de entorno: el MCP de preview/browser no estaba cableado en el subagente de esta sesión (y el dev server no estaba levantado). Happy-path del widget + los estados nuevos (reconnecting / connection_failed, que necesitan inyectar un 5xx) → **verificación humana en :3000**. |

## Pendiente / verificación humana (Valentino)
1. En `:3000`, **simular un 5xx** (no "Neon dormido", que en `next dev` no corta): ver que el
   widget muestra "Conectando…", reintenta, y se recupera sin error crudo ni mensaje duplicado; y
   que un lead capturado en el reintento no queda duplicado.
2. Confirmar el copy del estado `connection_failed` ("probá de nuevo") y que el input queda
   habilitado para reintentar.

## Fuera de scope (anotado)
- **INFRA.3 (causa raíz de conexión)**: no se tocó `lib/prisma.ts`, connection string, pooler,
  `DIRECT_URL`, `connection_limit`, ni se agregó retry server-side en `onFinish`. Sigue gated en la
  firma real de prod (Netlify Function Logs: `prismaCode`/`causeMessage`) + Sentry DSN.
- **Race write-write residual**: si el USER-create del intento-1 sigue sin commitear cuando el
  intento-2 lee la cola (muy estrecho dado el backoff ≥2s), podría colarse una 2ª fila. Cerrarlo
  del todo requiere un `@@unique` → migración → fuera de scope; flageado, no diseñado.
- **Pérdida mid-stream** (headers ya flusheados): no la cubre el retry → INFRA.1/INFRA.3.
- Los 3 warnings/errores de lint pre-existentes: no se tocaron (fuera de objetivo).

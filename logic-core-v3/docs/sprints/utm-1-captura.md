# UTM.1 — Captura de atribución first-touch (widget → conversación → lead)

> Fuente de verdad del sprint (plan + log de ejecución). Cierra el camino completo
> widget → request → `Conversation` → `ChatbotLead` con semántica first-touch, terminando lo que
> EV.2 dejó a mitad de camino (columnas migradas en `ChatbotLead`, nunca escritas).

## Objetivo

EV.2 agregó `ChatbotLead.utmSource/utmMedium/utmCampaign` con la intención declarada en el propio
comentario del schema ("se capturan al inicio de la sesión desde los parámetros de la URL del
widget"), pero nunca se construyó el lado de captura: ni el widget lee la URL del visitante, ni
el servidor persiste nada ahí. Las tres columnas estaban 100% muertas en producción, y el
dashboard de leads (`lead-origin.ts`, `LeadDetail.tsx`) ya las lee para categorizar el origen del
lead (Google/Instagram/Directo/...), pero siempre caía a "Directo"/"Otros" porque ambos inputs
eran siempre `null`. Este sprint construye la captura real, con semántica **first-touch**: el
primer set de UTM/referrer con que el visitante llegó es el que vale, y no se pisa con
navegación posterior.

## Paso 0 — Descubrimiento y rama elegida

Tres agentes de exploración (widget/cliente, resolver/servidor, schema/lead/bitácora) + lectura
directa de cada archivo confirmaron, sin ambigüedad:

- `Conversation` (`prisma/schema.prisma`) tenía `referrerUrl String?` y `currentPath String?`,
  pero **ninguna columna UTM**. Ninguno de los dos preservaba el query string completo:
  `currentPath` llegaba como pathname de `usePathname()` (Next.js lo excluye por diseño) o como
  literal `'/'` hardcodeado en `ChatbotEmbed.tsx`; `referrer` estaba en el Zod schema del request
  pero **ningún cliente lo mandaba nunca** — dead code desde que se agregó.
- `ChatbotLead` ya tenía `utmSource/utmMedium/utmCampaign String?` (migración
  `20260629195726_ev2_vertical_pack_signals_utm`, que tocó únicamente `chatbot_bot_config` y
  `chatbot_lead` — nunca `chatbot_conversation`). `captureLead.ts` no las escribía ni leía
  `Conversation`.

**→ Rama (b):** migración aditiva agregando `utmSource/utmMedium/utmCampaign String?` a
`Conversation` (mismos nombres/tipo que las columnas ya existentes y muertas de `ChatbotLead`).
`ChatbotLead` no necesitó migración — solo un write-site nuevo en `captureLead.ts`.

**Complicación arquitectónica no anticipada en el brief original:** la mayoría del tráfico real
no pasa por el sitio propio de develOP sino por el **widget embebido en sitios de clientes**
(`public/widget.js` + iframe en `/embed/[slug]`). Ese iframe corre en el origin de
develop.com.ar — leer `window.location`/`document.referrer` ahí adentro nunca ve la URL real del
sitio del cliente. `widget.js` **ya enviaba** la URL completa del padre (`parentUrl:
window.location.href`, con query string intacto) vía `postMessage({type:'develop:init', ...})`
al crear el iframe — pero `ChatbotEmbed.tsx` descartaba ese dato (solo leía `event.origin`). Esta
captura aprovecha ese canal ya existente en vez de agregar plumbing paralelo.

## Decisiones resueltas con el usuario antes de implementar

- **Sanitización de caracteres de control:** limpiar en silencio (strip + cap), nunca rechazar la
  request. Los UTM/referrer son atribución best-effort, no lógica crítica — una request de chat
  legítima no debe cortarse por un parámetro de tracking malformado.
- **Alcance de `referrer`:** se extendió el mismo sanitizado (strip de caracteres de control) al
  campo `referrer` ya existente, ya que este sprint lo activa por primera vez (antes era dead
  code) y se edita el mismo schema de todos modos. Mantiene su cap de 500 (no se homologó a 255,
  ese límite es específico de UTMs por el brief).

## Qué se construyó

### 1. Migración — aditiva, `Conversation`

`prisma/migrations/20260704224423_utm1_add_conversation_utm_fields/migration.sql`:
```sql
-- AlterTable
ALTER TABLE "chatbot_conversation" ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;
```
Solo `ADD COLUMN`, nullable, sin `DEFAULT`, una sola tabla — inspeccionada antes de aplicar,
100% aditiva. Sin backfill (filas existentes quedan `NULL`, correcto — no hay UTM que inventar
para conversaciones pasadas).

### 2. `src/modules/chatbot/shared/attribution.ts` (nuevo)

Utilidad pura (sin `'use client'`/`'use server'`), vive junto a `publicConfig.ts`/
`field-normalize.ts` — el patrón ya establecido de helpers puros del módulo:
- `parseAttribution(pageUrl, referrer)`: extrae `utm_source`/`utm_medium`/`utm_campaign` +
  referrer desde una URL cruda vía `URLSearchParams`. Usado por `LogicCompanion.tsx` (su propia
  URL) y `ChatbotEmbed.tsx` (URL del padre, recibida por `postMessage`). No lanza ante URLs
  malformadas (`try/catch` → `EMPTY_ATTRIBUTION`).
- `sanitizeAttributionField(raw, maxLength)`: quita caracteres de control (códigos 0–31 + 127,
  construido desde `charCodeAt` — no un regex con escapes literales, para evitar ambigüedad de
  codificación), recorta espacios, limita a `maxLength`, colapsa a `undefined` si queda vacío
  (nunca persiste `""`).
- `ParsedAttribution` (tipo) + `EMPTY_ATTRIBUTION` (constante) — compartidos por cliente,
  servidor y tests.

### 3. `server/tools/types.ts` — `ToolCallContext`

Suma `utmSource?/utmMedium?/utmCampaign?: string` (flat, mismo estilo que `visitorIpHash`/
`visitorUserAgent`). `getTools.ts` reenvía `ctx` sin destructurar — no necesitó cambios.

### 4. `server/conversation/resolver.ts`

`GetOrCreateConversationInput` suma los tres campos. **El branch `existing` (`update`) no se
tocó** — solo el branch `create` gana las tres líneas, calcadas de `referrerUrl` (que también es
create-only). Esta es la garantía completa de first-touch del sprint: si alguna vez se agregaran
al `update{}` por error, el first-touch se rompería en silencio (igual que le pasaría a
`currentPath`, que sí se actualiza en cada mensaje — patrón deliberadamente distinto).

### 5. `server/chat/handleChatRequest.ts`

- **Zod schema**: `utmSource/utmMedium/utmCampaign` nuevos (opcionales, sanitizados vía
  `sanitizeAttributionField(v, 255)`), `referrer` existente ahora también sanitizado
  (`sanitizeAttributionField(v, 500)`, antes solo tenía `.max(500)`). `requestBodySchema` se
  exportó (antes privado del módulo) para que el invariant de tests lo ejercite directamente.
- **Threading a `getOrCreateConversation`**: `body.utmSource/utmMedium/utmCampaign` — junto a
  `currentPath`/`referrer` existentes.
- **Threading a `getTools()` — detalle de corrección crítico**: se usa `conversation.utmSource ??
  undefined` (la fila YA resuelta por `getOrCreateConversation`, autoritativa), **no**
  `body.utmSource`. Un mensaje #2+ de una conversación existente puede traer UTMs distintos (o
  ninguno) en su body — el resolver los ignora en el branch `update`, así que usar `body.*` acá
  habría filtrado atribución incorrecta hacia `capture_lead` si el lead se captura en un turno
  posterior al primero.

### 6. `server/tools/captureLead.ts`

Copia 1:1 `utmSource/utmMedium/utmCampaign: ctx.utm* ?? null` al `tx.chatbotLead.create({data:
{...}})` existente — sin nueva query, `ctx` ya trae los valores desde el paso 5.

Nota informativa (no tocado): `src/lib/dashboard/lead-origin.ts` y
`src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx` ya leen estos campos para
categorizar el origen del lead — el dashboard "se enciende solo" con este write-path.

### 7. `hooks/useChatbot.ts`

- `UseChatbotOptions` suma `attribution?: ParsedAttribution` (candidato de esta mount;
  `undefined` = aún no resuelto — caso embed, esperando el handshake `postMessage`).
- Guard de first-touch en `sessionStorage['chatbot:firstTouch']` (JSON-stringified), mismo
  patrón que `getOrCreateSessionId` para `chatbot:sessionId`: si ya hay algo cacheado, se usa eso
  y se ignora el candidato nuevo; si no hay nada Y llega un candidato, se cachea (una sola vez).
  `firstTouchRef` + `useEffect` con dep `[attribution]` — necesario (a diferencia de
  `sessionId`, que resuelve sincrónico en el primer render vía `useRef(initializer)`) porque en
  el caso embebido `attribution` llega recién cuando el handshake responde, DESPUÉS del mount.
- `prepareSendMessagesRequest` suma los campos resueltos al body de cada request (se manda en
  cada turno; el servidor solo actúa sobre ellos al crear la conversación, igual trato que
  `currentPath`/`referrer` hoy).
- **Por qué cachear en el hook si el servidor ya es create-only**: `ChatWidgetMount` desmonta/
  remonta `LogicCompanion` al entrar/salir de rutas de portal (`isPortalRoute`). Sin el guard de
  sessionStorage, un remount recalcularía la atribución desde la URL actual — si ese remount
  coincidiera con el primer request real de la sesión, el first-touch persistido sería el de la
  página del remount, no el de la entrada real.

### 8. `components/LogicCompanion.tsx`

Same-origin, sin iframe — `useMemo(() => parseAttribution(window.location.href,
document.referrer || null), [])`, deps vacías a propósito: resuelto una sola vez por mount, para
no recalcular first-touch en cada cambio de ruta client-side.

### 9. `components/embed/ChatbotEmbed.tsx`

Estado nuevo (`attribution`, inicial `undefined`), poblado dentro del `handleMessage` YA
existente (que ya reaccionaba a `develop:init` para el handshake de origin): lee
`event.data.parentUrl`/`event.data.referrer`, llama `parseAttribution`, o cae a
`EMPTY_ATTRIBUTION` si `parentUrl` no llegó (widget.js viejo cacheado — ver riesgo abajo). Nunca
crashea, nunca inventa valores.

### 10. `public/widget.js`

Una línea sumada al `postMessage` ya existente: `referrer: document.referrer` (`parentUrl` ya se
mandaba antes de este sprint).

## Tests

**`test:utm1`** (`src/modules/chatbot/server/chat/__tests__/utm-attribution.invariant.ts`, patrón
`.invariant.ts` puro — cero DB/red, `npx tsx`): UTM válido pasa verbatim · 300 chars recorta a
255 · caracteres de control se limpian (no rechazan) · solo-control-chars colapsa a `undefined`
(nunca `""`) · request sin ninguna key de atribución sigue siendo válida · `null` explícito
también resuelve a `undefined` · `parseAttribution` extrae correctamente desde una URL cruda,
normaliza referrer vacío/URL malformada a `EMPTY_ATTRIBUTION`. **Todas las aserciones pasaron.**

**`scripts/utm1-verify-attribution.ts`** (DB real contra la branch Neon dev, sin LLM — invoca
`buildCaptureLeadTool(ctx).execute(...)` directo, exportado "for testing" en
`server/tools/index.ts`): conversación nueva persiste los UTMs del create · segunda visita con
UTMs distintos NO pisa el first-touch · lead capturado hereda los UTMs de su conversación ·
conversación sin UTMs queda `null` · lead de tráfico directo tiene los 3 campos en `null`. Limpia
sus propias filas en `finally` (lead primero — `ChatbotLead.conversation` es `onDelete:
SetNull`, no cascade — después la conversación, que sí cascadea sus `ChatMessage`).
**5/5 checks OK.**

## Smoke (paso 5)

`scripts/utm1-smoke.mjs` — POST real a `/api/chatbot/{slug}/chat` contra el dev server (`npm run
dev:qa`, puerto 3002):
1. Turno 1: `sessionId` nuevo + `utmSource=google/utmMedium=cpc/utmCampaign=launch_q3/
   referrer=https://google.com/search` → crea la conversación.
2. Turno 2: mismo `sessionId`, UTMs **distintos** (`newsletter/email/q3_newsletter`) → prueba el
   guard first-touch a nivel wire.
3. Turno 3: mensaje de alta señal (nombre + teléfono + pedido de contacto) para llevar al bot a
   invocar `capture_lead` naturalmente.
4. Lectura directa con `PrismaClient`: conversación con los UTMs del turno 1 (no del 2); lead (si
   se capturó) con los mismos UTMs heredados.

Primera corrida: el LLM no invocó `capture_lead` (no determinístico, señalado con ⚠️ sin contar
como falla — la corrección de la copia ya está probada de forma determinística en el script de
verificación). Segunda corrida: **6/6 checks OK**, `capture_lead` sí se disparó. Fila de
`ChatbotLead` resultante:
```json
{
  "id": "cmr6zsfbx001vuphs23v76e9q",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "launch_q3",
  "capturedAt": "2026-07-04T23:27:23.037Z"
}
```
El script limpia sus propias filas al final (`--keep` para dejarlas e inspeccionar a mano).

## Verificación

- `tsc --noEmit`: sin errores nuevos (único: baseline `searchconsole.ts:119`, ya conocido).
- `eslint` en los 9 archivos tocados/creados: 3 errores + 1 warning — **los 4 confirmados
  preexistentes**, comparando contra la versión en `HEAD` de cada archivo (mismo hallazgo, misma
  línea lógica, ninguno introducido por este sprint):
  - `ChatbotEmbed.tsx` — `react-hooks/refs` en el `.map()` de mensajes (JSX no tocado por este
    sprint).
  - `useChatbot.ts` — `react-hooks/refs` en el `useMemo` del transport (ya leía
    `sessionIdRef.current`/`proactiveOpenerRef.current` antes de este sprint; se sumó un ref más
    al mismo patrón) + `react-hooks/set-state-in-effect` en un efecto no relacionado
    (`setPendingSubmit`).
  - `handleChatRequest.ts` — warning `toolResults` sin usar, en el `onFinish` (no tocado).
- EV1–EV5: todas las suites verdes.
- `npx prisma migrate status`: limpio, "Database schema is up to date!".
- `npm run build`: verde — necesitó `NODE_OPTIONS=--max-old-space-size=6144` (el heap default del
  entorno quedó corto para este build; confirmado ambiental, no relacionado al diff — con más
  heap compila y genera las 31 rutas estáticas + todas las dinámicas, incluidas
  `/api/chatbot/[slug]/chat` y `/embed/[slug]`, sin error).

**⚠️ La migración se aplicó sobre la branch Neon compartida (dev) — requiere aviso al socio.**
SQL 100% aditivo (pegado arriba), sin `DROP`/`ALTER` destructivo, sin backfill.

## Fuera de scope (anotado, no implementado)

- **`ChatbotEmbed.tsx` hardcodea `currentPath: '/'`** — bug preexistente, no relacionado a UTM (la
  iframe tampoco tiene visibilidad del path real del cliente; mismo problema de raíz que el
  boundary del iframe, pero no es lo que este sprint pidió arreglar).
- **`Conversation.sessionId` es `@unique` global**, no `@@unique([botConfigId, sessionId])` —
  preexistente. Implica que la garantía first-touch es efectivamente por tab de navegador, no
  por bot (riesgo tangencial de colisión cross-bot con el mismo sessionId, no tocado).
- **Cache de 1h de `/widget.js`** (`Cache-Control: public, max-age=3600, s-maxage=3600` en
  `next.config.ts`): durante esa ventana, embeds con copia vieja cacheada no mandan `referrer`
  (pero sí `parentUrl`, que ya iba desde antes de este sprint) — impacto parcial, acotado a 1
  hora, no total.
- **Race real en el path embebido**: `ChatbotEmbed.tsx` llama `chatbot.open()` inmediatamente al
  montar, independiente de que el handshake `postMessage` haya llegado. Un visitante muy rápido
  podría mandar el primer mensaje (creando la `Conversation`) antes de que `attribution` se
  resuelva, dejando esa sesión fijada en "sin atribución" aunque los datos reales lleguen un
  instante después. No se ingenierizó una solución (bloquear el envío hasta resolver atribución)
  — es atribución best-effort, no lógica crítica, consistente con la regla del brief.

## Pendiente del humano

1. **Avisar al socio** de la migración aditiva sobre la branch Neon compartida (SQL arriba).
2. Sprint 100% backend + lógica de cliente, sin pantallas nuevas — no requirió `visual-qa`. Para
   confirmar visualmente: probar el widget propio en `:3000` con `?utm_source=...` en la URL, y
   el embed en un sitio de prueba vía `widget.js` (con un `?utm_source=...` en la página host).
3. **Avisar al frente panel** que la captura de UTM está viva → P4.1 puede consumirla. El
   dashboard (`lead-origin.ts`/`LeadDetail.tsx`) ya leía estos campos — antes siempre `null`, a
   partir de ahora reflejan atribución real.
4. **Commitear** cuando revises (lo hacés vos): 8 archivos editados + 5 nuevos (migración,
   `shared/attribution.ts`, `__tests__/utm-attribution.invariant.ts`,
   `scripts/utm1-verify-attribution.ts`, `scripts/utm1-smoke.mjs`) + bitácora + este archivo.

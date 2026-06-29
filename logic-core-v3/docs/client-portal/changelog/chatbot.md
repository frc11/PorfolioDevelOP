# Changelog — Chatbot / Mi Chatbot (Portal Cliente)

> Sección `/dashboard/chatbot`. El cliente ve y configura su bot (Aki en Matsu),
> sus leads y conversaciones.
> Estado: **cerrada y mergeada a main.**

---

## Qué se hizo

### Fix del Decimal en runtime (bloqueante)
- `chatbot/page.tsx` tronaba con `usage.costUsd.toNumber is not a function`.
- Causa raíz: `getUsageByOrgSlug` envuelve la query en `unstable_cache`, que
  serializa el valor. En un cache HIT, `costUsd` ya no es instancia
  `Prisma.Decimal` (no tiene `.toNumber()`), sino number/string.
- Fix: `Number(usage.costUsd)` — robusto a Decimal | number | string. Funciona en
  cache miss y hit.

### Config acotada del cliente (BotPersonalization)
Se agregó SOLO (lo grande quedó para un lane futuro):
- **Color secundario + tinte del chat** (ColorPicker del admin, nullable, hex +
  sugerencias + Limpiar, preview en vivo).
- **Imagen custom de avatar** (estilo 'image' + AvatarUploader del admin, recorta/
  comprime a 200×200 WebP base64, sin infra externa).
- **Emoji por quick-reply** (EmojiPickerField por fila; el guardado preserva el
  emoji, antes lo descartaba).
- **Dirty-state**: "Guardar cambios" activo solo con cambios reales
  (`JSON.stringify(state) !== JSON.stringify(savedState)`).
- NO se agregó: nombre, tono, estilos extra, prompts/colores por ruta (lane futuro).
- Sin tocar schema: `accentSecondary`, `chatSurfaceTint`, `avatarImageUrl`,
  `quickReplies` (JSON) ya existían en BotConfig. Todo fue wiring + Zod.

### Loadings full-width
- Los skeletons de cada tab igualan el ancho de su contenido (no solo full-width:
  Overview/Conversaciones/Instalación pierden el cap; Leads gana `max-w-5xl`; Lead
  detail `max-w-3xl`).

### Sin bot → activación, no redirect
- Si el cliente no tiene chatbot, antes el layout redirigía a /dashboard. Ahora el
  layout NO redirige y la page muestra `ChatbotUpsellLanding` ("activá tu chatbot").

### Hover en Overview e Información
- `adminHoverCls` en los bloques de Overview y de Información (los que no tienen
  inputs). Tab Información full-width.

### Leads estilo pipeline admin
- Componentes client-only nuevos en `dashboard/lead-pipeline/` (classes +
  LeadPipeline + LeadPipelineColumn + LeadColumnOverview).
- 3 columnas de clasificación (**Calientes / Tibios / Fríos**), estático (sin DnD),
  full-width, portando el chrome del admin (cuerpo con cap + fade, overview "Ver
  todos" portaleado a `document.body`).
- Filtros (estado + fecha) re-skinneados como chips en la barra glass del admin.
  `dq` (descartados) en toggle aparte. Planes sin scoring → grilla plana.
- Reusa `BusinessLeadCard` / `CLASS_CONFIG` del módulo compartido vía props (NO
  edita el admin).

### Fix del filtro de fecha (bloqueante)
- Elegir un filtro de fecha rompía la vista de leads y no se podía seguir filtrando.
- Fix: distinguir inbox vacío real de resultado-filtrado-vacío; la barra de filtros
  queda montada cuando hay filtro activo (cubre fecha Y estado), así siempre se
  puede limpiar.

### Conversaciones expandibles + ver conversación origen
- Conversaciones del cliente: prop `expandable` + action client-scoped
  (`getClientConversationTranscriptAction`, org de sesión, anti-IDOR vía el guard
  relacional existente). Al expandir una fila → transcript completo inline. NO edita
  `ConversationsTable`.
- Desde un lead (LeadDetail): label "Conversación origen" si el lead tiene
  conversationId, reusando el transcript inline.

### Accent del widget
- Los 3 puntos cyan hardcodeados en `ChatWindow.tsx` ahora siguen el accent del
  tenant vía el seam `[ar,ag,ab]` existente (cyan fallback = cero regresión).
- Sparkles del empty-state: `strokeWidth={1.5}`.
- `thinkPulse`: código muerto borrado.

---

## Seed de datos de prueba (Matsu)

- `scripts/seed-matsu-chatbot.ts`: INSERT-only, idempotente, revertible, no migra.
- Guard `assertDevSeedTarget` (aborta si no es Neon dev/local) + aborta si no existe
  BotConfig slug `matsu` (no crea org/bot).
- Inserta: ~5 conversaciones (sessionId `seed-matsu-chat-01..05`, contexto Toyota
  Rioplatense), ~9 leads (3 hot / 3 warm / 2 cold / 1 dq; 5 atados a conversación +
  4 standalone), ~3 handoffs `handoff.whatsapp` (level `INFO`), QuotaUsage del mes
  (solo si no existe, no pisa usage real).
- Idempotente: marcadores (`sessionId` prefix, `internalNotes [seed:matsu-chat]`,
  `metadata.seedTag`). `--clean` revierte en orden FK-seguro.
- **Lo corre Valentino**, no CC: `npx tsx scripts/seed-matsu-chatbot.ts`
  (o `--clean` para revertir).
- Drift de Franco intacto: todos los modelos `chatbot_*`, cero FK a OsLead/setter/
  ActivityChannel; `convertedToOsLeadId` queda null.

---

## Enums críticos del seed (casing — referencia)

- `ChatMessageRole`: USER/ASSISTANT
- `ChatbotLeadIntent`: UPPER (PURCHASE_READY/SCHEDULE_VISIT/QUOTE_REQUEST/...)
- `ChatbotLeadStatus`: UPPER (NEW/CONTACTED/IN_NEGOTIATION/WON/LOST)
- `LeadCategory`: lowercase (sales/postventa/...)
- `LeadClassification`: lowercase (hot/warm/cold/dq)
- `ChatbotEventLevel`: UPPER (¡el código vivo manda 'info' y lo mapea; un create()
  directo debe usar INFO!)

---

## Pendientes / a futuro

- Config completa del cliente: nombre, tono, estilos extra, prompts por ruta, mapa
  de color por ruta, unificar editor con el admin. (Requiere decisiones de producto:
  ¿el cliente edita nombre+tono? ¿prompts por ruta van al cliente?)
- "Close lead → convertir a cliente con hard ID link": requiere migración
  (`ChatbotLead.convertedToOsLeadId` como FK), relevamiento de flujo, state machine.
- Avatar uploader con storage externo (hoy es base64 inline): pendiente decisión de
  infra.

---

## Lecciones

- **`Number()` en vez de `.toNumber()`** en boundaries con `unstable_cache`: el cache
  serializa los Decimal y dejan de ser instancias.
- **Reusar componentes compartidos vía props** (no editar el admin) es la forma
  correcta de "que el cliente sea igual al admin" cuando el módulo se comparte.
- TUNABLES del pipeline (MAX_VISIBLE_CARDS, COLUMN_BODY_MAX_H, COLUMN_FADE_HEIGHT)
  son ajustables a ojo — calibrar tras ver en pantalla.

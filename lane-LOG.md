# lane/chatbots — LOG (lote de 4 features)

Worktree: `lane/chatbots` · Base: `251cb3a` · Gate: `.\node_modules\.bin\tsc.cmd --noEmit` → exit 0 (verde antes y después).

## Plan / decisiones de arranque (de un relevamiento read-only previo)

Discovery read-only (subagentes) confirmó dos hechos que reencuadraron el lote:

1. **Existe un `ConfirmDialog` canónico compartido** en `@/app/(protected)/admin/_components/confirm-dialog` (portal a body, `isPending`, variantes `danger`/`destructive`/`warning`/`default`, ya usado por leads y por ImpersonateButton). → Se **reutiliza por import** en F1 y F2 (no se duplica, no se modifica).
2. **El `<Select>` compartido (`@/components/ui/Select`) ya es un listbox custom accesible** (no un `<select>` nativo). Los filtros de la lista ya lo usaban. → La premisa de F3 ("selects nativos de Chrome") estaba **desactualizada** (ver F3).

Aislamiento: **solo se editaron archivos bajo `src/app/(protected)/admin/chatbots/**`** (6 archivos). Ningún archivo compartido ni `schema.prisma` fue modificado (sí importados, lo cual está permitido).

---

## F1 — Modal de confirmación in-app para acciones bulk
**Commit:** `f369600` feat(chatbots): modal de confirmación in-app para acciones bulk
**Archivos:** `src/app/(protected)/admin/chatbots/BulkActionBar.tsx`

- **Viejo:** `handlePause` usaba `window.confirm(...)` nativo (cartel del browser). `handleActivate` no tenía confirmación.
- **Nuevo:** se eliminó todo `window.confirm`. Estado `confirm: 'pause' | 'activate' | null`. Pausar y Activar abren el `ConfirmDialog` compartido (centrado, portal a body). `isPending` atado al `useTransition` existente; el confirm queda deshabilitado mientras corre la action; `router.refresh()` no aplica acá (las actions ya hacen `revalidatePath`). Variantes: pausar = `warning`, activar = `default`.
- a11y: el `ConfirmDialog` aporta `role=dialog`, `aria-modal`, `aria-label` en cerrar; se sumó `aria-label` al botón X de limpiar selección. (Ver "Pendientes" sobre focus-trap/Escape.)
- **Aceptación:** sin `window.confirm`/`alert` en el flujo bulk; modal centrado que matchea la estética; pausar/activar siguen funcionando.

## F2 — Eliminar bot (individual + bulk)
**Commit:** `e36f14c` feat(chatbots): eliminar bot (individual y bulk) con confirmación y auditoría
**Archivos:** `[botId]/actions.ts`, `bulk-actions.ts`, `[botId]/BotDetailClient.tsx`, `BulkActionBar.tsx`

- **Viejo:** no existía borrado de bots.
- **Nuevo server actions** (en archivos exclusivos, gate de auth replicando `toggleBotActiveAction` + Zod):
  - `deleteBotAction(botId)`: valida con `DeleteBotSchema` (Zod), gatea `SUPER_ADMIN`, captura identidad + conteos de hijas, borra con un **único** `prisma.botConfig.delete({ where: { id } })`, audita, invalida cache, y hace **`redirect('/admin/chatbots')` server-side** (fuera del try/catch para no tragarse el `NEXT_REDIRECT`). Devuelve `{ ok:false, error }` solo en fallo.
  - `bulkDeleteBotsAction(botIds)`: `BulkBotIdsSchema` (Zod), gate `SUPER_ADMIN`, loop tolerante a fallos parciales (`BulkResult`), mismo borrado cascado por id, `revalidatePath`. La lista refresca con `router.refresh()` desde el cliente.
- **Estrategia de borrado (verificada contra `schema.prisma`, FROZEN, solo lectura):** todas las relaciones hijas de `BotConfig` son `onDelete: Cascade` (KnowledgeBase, Conversation→ChatMessage, ChatbotLead→CrmSyncAttempt, QuotaUsage, ChatbotEvent, ChatbotInsight, BotAlert). Por eso **un solo delete arrastra todo el subárbol**, scopeado al bot; no se toca `CrmIntegration` (cuelga de Organization) ni otras orgs. No hizo falta `$transaction` con `deleteMany`.
- **UI:** botón **"Eliminar bot"** (Button `variant="danger"`) en el header del detalle, junto a "Test endpoint"; acción **"Eliminar"** (danger) en el bulk action bar. Ambos confirman con `ConfirmDialog` `variant="danger"` y copy destructivo. Individual → redirige a la lista; bulk → `router.refresh()`.
- Limpieza in-scope: se removió un `import Link` muerto pre-existente en `BotDetailClient.tsx` para dejar el archivo lint-limpio.
- **Autorización:** SUPER_ADMIN es ya el rol más alto; no existe un rol "más restrictivo" para borrar que para pausar, así que se replica el mismo gate (sin PARADA de autorización).
- **Aceptación:** botón en ambos lugares, confirmación destructiva, borrado scopeado + cascado + auditado, individual redirige, bulk refresca, tsc verde, sin `any`.

### PENDIENTE DE COORDINACIÓN (F2 — audit type)
El enum `AuditActionType` **no tiene** un valor `BOT_DELETED`, y `AdminAuditLog.actionType` es ese enum (no String); `logAdminAction` tipa `actionType: AuditActionType`. Agregar `BOT_DELETED` requiere editar `prisma/schema.prisma` (FROZEN) + migración → **coordinación**, no este lane.
**Hecho como fallback (sin tocar schema):** se audita con `actionType: 'OTHER'` + `metadata: { subAction: 'BOT_DELETED', botSlug, organizationId, deletedCounts }`. Queda trazable, pero el filtro de audit-log por enum no aísla los borrados hasta sumar el valor dedicado.
**Acción sugerida (coordinación):** agregar `BOT_DELETED` al enum `AuditActionType` (cambio aditivo, `migrate dev`, no reset) y cambiar los dos `actionType: 'OTHER'` por `'BOT_DELETED'`.

## F3 — Restyle de los selects (filtros)
**Commit:** `b386b6c` style(chatbots): selects estilizados acordes a la UI
**Archivos:** `BotsListClient.tsx`

- **PREMISA DESACTUALIZADA (reportado, no asumido):** los filtros "Todos los estados"/"Todas las industrias" **ya NO eran `<select>` nativos de Chrome**: usaban el `<Select>` compartido (`@/components/ui/Select`), que es un listbox custom accesible (trigger + panel portalizado con motion, navegación por teclado, aria, tema dark). Un grep de `<select` crudo en todo el scope de chatbots da **cero** resultados. No había dropdown nativo que reemplazar.
- **Decisión:** NO construir un select lane-local (duplicaría el compartido) ni modificar el `<Select>` compartido. Se aplicó un **polish presentacional** real dentro del scope:
  - **Viejo:** los dos selects sin ancho fijo (se dimensionaban al texto → barra de filtros despareja); etiquetas de industria = slug crudo (`medico_odontologico`).
  - **Nuevo:** anchos consistentes (`sm:w-44` estado / `sm:w-52` industria); etiquetas de industria humanizadas vía `formatIndustry()` (**solo el label**; el `value` sigue siendo el slug crudo → el filtrado es idéntico); `aria-label` en ambos selects.
- **Aceptación:** los selects matchean la estética dark (ya lo hacían) y quedan más prolijos; el filtrado funciona idéntico. Si lo que se quería era otro control (p.ej. combobox de industria con búsqueda), ver nice-to-have.

## F4 — Overview del bot menos vacío
**Commit:** `dedcc8a` feat(chatbots): overview del bot con hover y layout a ancho completo
**Archivos:** `[botId]/tabs/OverviewTab.tsx`

- **Viejo:** dos grillas desbalanceadas (fila de 4 + fila de 3) → hueco/espacio muerto abajo en pantallas anchas; cards sin hover.
- **Nuevo:** una sola grilla responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` con 12 celdas (11 StatCards + panel Detalles) → llena 4×3 / 3×4 / 2×6 sin orphan. Hover estilo dashboard del cliente **replicado** (wrapper `motion.div whileHover y:-1` + `hover:bg-white/[0.04] hover:border-white/20` en la card), respetando reduced-motion; sin importar archivos del dashboard.
- **Cards nuevas, todas con data ya en props (sin queries nuevas):** Tasa de conversión (leads/conversaciones), Uso de cuota mensual (con `progress`), Knowledge Base x/7 (con `progress`, contando secciones no vacías), Modelo LLM (+ proveedor), Dominios autorizados. Se conservan las existentes (conversaciones mes/total, leads, tokens, costo, eventos, Detalles).
- **Aceptación:** hover consistente con el dashboard, cards a ancho completo, sin espacio muerto abajo.

---

## Review adversaria del diff completo
**Commit de fixes:** `ae7a89a` fix(chatbots): toasts de error y selección bulk acotada al filtro (review)

Se corrió una review adversaria (5 agentes read-only: 4 dimensiones + adjudicador) sobre `git diff 251cb3a..HEAD`. Veredicto: **fix-then-ship**. Confirmó como correctos: el patrón redirect-on-success vs el guard `if (result && !result.ok)`, el unmount-durante-pending del bulk bar, la seguridad de hidratación en OverviewTab (solo `whileHover`), la nulabilidad/indexado de KB, la ausencia de div-by-zero, el grid de 12 celdas, y que **ningún archivo compartido/frozen fue modificado**.

Issues reales corregidos (en `ae7a89a`):
- **HIGH** — los handlers bulk mostraban `toast.success` aun con fallo total (`success:0`, p.ej. forbidden). Fix: helper `announceBulk` → `toast.error` cuando no se completó.
- **MEDIUM (footgun destructivo)** — la selección bulk no se acotaba al filtro visible → Eliminar bulk podía borrar bots fuera de vista. Fix: se pasa `visibleSelectedIds = selected ∩ filtered` al bulk action bar.
- **LOW** — `onClear()` corría en fallo parcial; ahora solo limpia en éxito total (los que fallan quedan seleccionados para reintentar).

Issue real PRE-EXISTENTE (no introducido por el lane → no corregido, fuera de scope):
- **LOW — hidratación en `BotsListClient`:** `initial={reduce ? false : 'hidden'}` (motion.div del grid, línea pre-existente) puede causar un mismatch de hidratación para usuarios con `prefers-reduced-motion`. Es la misma clase de bug que el memory note `useHydratedReducedMotion`. No lo introdujo este lote (mi cambio de F3 no tocó esa línea). **Recomendación:** aplicar el patrón `useHydratedReducedMotion` ahí, en un sprint propio.

## Nice-to-have detectados (no construidos — evitar over-engineering / fuera de scope de datos)
- **F2 audit:** valor de enum `BOT_DELETED` dedicado (coordinación, arriba).
- **ConfirmDialog a11y:** el `ConfirmDialog` compartido no tiene focus-trap ni Escape-to-close (sí aria). Es una limitación del componente canónico de todo el admin; mejorarlo conviene hacerlo **en ese archivo compartido (coordinación)** para que beneficie a leads/impersonate también, en vez de forkearlo lane-local.
- **F3:** si se quisiera un combobox de industria con búsqueda, el patrón de referencia in-repo es `LocationTypeahead` (`admin/leads/_components/location-typeahead.tsx`) — generalizarlo en vez de escribir uno nuevo. Además `formatIndustry` capitaliza simple ('ecommerce'→'Ecommerce'); un label map canónico compartido sería más prolijo pero está fuera de scope.
- **F4:** métricas más ricas (costo por conversación histórico, serie temporal de uso) requerirían queries nuevas → no se hicieron por la regla de no agregar queries / no tocar server files compartidos.
- **Pre-existente:** hidratación reduced-motion en `BotsListClient` (ver arriba).

## Verificación
- Gate por feature + fix: `.\node_modules\.bin\tsc.cmd --noEmit` exit 0 + `eslint` exit 0 en archivos tocados (en cada commit).
- Aislamiento confirmado por la review: solo 6 archivos bajo `admin/chatbots/**`; ningún compartido ni `schema.prisma` modificado (sí importados).
- Verificación visual: la hace el humano a ojo en :3000.

## Commits del lane (sobre `251cb3a`)
- `f369600` feat(chatbots): modal de confirmación in-app para acciones bulk (F1)
- `e36f14c` feat(chatbots): eliminar bot (individual y bulk) con confirmación y auditoría (F2)
- `b386b6c` style(chatbots): selects estilizados acordes a la UI (F3)
- `dedcc8a` feat(chatbots): overview del bot con hover y layout a ancho completo (F4)
- `ae7a89a` fix(chatbots): toasts de error y selección bulk acotada al filtro (review)

---

# LOTE 2 (9 cambios) — sobre `6fa0bca`

Discovery read-only (8 subagentes) mapeó cada feature antes de tocar código. Gate por feature: `tsc --noEmit` exit 0 + `eslint` exit 0 en lo tocado. Solo se editaron archivos del scope exclusivo + los 3 compartidos autorizados (ActivityLog, LeadsTable, ConversationsTable), siempre de forma ADITIVA; ningún archivo forbidden ni `schema.prisma`.

## F1 — Checkbox de selección · `5cf8163` (style)
`BotsListClient.tsx`. Viejo: `<input type=checkbox>` nativo con `accent-cyan`. Nuevo: checkbox custom dark (input `sr-only peer` + caja `peer-checked` con Check de lucide, focus ring, aria-label). Mantiene checked/onChange y la selección bulk; accesible (label, teclado, foco). Presentación.

## F2 — Card de validación de KB · `eb99ccc` (style)
`kb/KBValidation.tsx`. Viejo: cards de issues con fills planos `bg-{sev}-500/[0.06]`, `rounded-xl`, sin glass. Nuevo: glassmorphism (`backdrop-blur-[20px] backdrop-saturate-[180%]`, `rounded-2xl`), tintes por severidad atenuados (red/amber/white /0.04), color semántico conservado en texto/ícono. Empty-state también con glass. Sin tocar `validateKB.ts` (lógica/texto de warnings).

## F3 — Emoji picker en respuestas rápidas · `5bede50` (feat)
`config/tabs/BehaviorTab.tsx`. Viejo: input de texto "Icono" por chip. Nuevo: reusa el `EmojiPickerField` del tab Apariencia (mismo UX + límite 8 unidades). Mantiene el campo de datos `emoji` (string) y su persistencia; adapta el contrato `null<->''` del picker. Grid ensanchado (`minmax(140px,190px)`). Sin tocar el Zod de enums.

## F4 — Preview alineado al título · `18c6d53` (style)
`BotConfigEditor.tsx` (1 línea + comentario). Viejo: aside `lg:flex lg:h-[calc(...)] lg:items-center lg:justify-center` → centraba el preview y en tabs cortos (Identidad) lo empujaba abajo. Nuevo: `lg:sticky lg:top-6 lg:self-start` → en tabs cortos el top del preview se alinea al título; sticky preservado en tabs con scroll. Pura CSS.

## F5 — Color por ruta · DIAGNÓSTICO (sin commit, PENDIENTE)
Trace completo: (a) admin save **funciona** (saveBotConfig valida y persiste `routeColorMap`, invalida cache); (b) API **funciona** (`getPublicConfig` devuelve `routeColorMap`, está en `PublicBotConfig`); (c) **widget runtime ROTO**: `useChatbot.ts`/`LogicCompanion.tsx`/`ChatWindow.tsx` nunca leen `routeColorMap` — siempre pintan `config.accentColor`. El eslabón roto está en la capa del widget, **fuera del scope del lane** (chat/**, hooks/**, LogicCompanion). El admin-save (lo que sí es del lane) ya está correcto → no hay nada que arreglar in-lane. Síntoma "el preview del admin no cambia" = **esperado** (el preview es estático, no simula ruta). Ver PENDIENTE abajo.

## F6 — Subidor de foto de avatar · `29cd541` (feat, parcial) + PENDIENTE
No existe infra de storage reutilizable en el repo (sin SDK de Blob/S3/Cloudinary, sin route de upload, package.json sin deps de storage). Sin inventar storage ni agregar dependencia. **Hecho in-scope (mejora opcional del campo URL):** `AppearanceTab.tsx` — hint más claro + feedback de validación client-side (avisa si la URL no es http/https absoluta, que fallaría en el Zod de guardado). El subidor real queda PENDIENTE.

## F7 — Toggle de metadata por banner completo · `14ffbf1` (feat)
`components/admin/ActivityLog.tsx` (compartido autorizado, cambio interno). Viejo: metadata abría solo desde el `<summary>` del `<details>`. Nuevo: todo el banner es el target del toggle cuando hay metadata — `role=button`, `tabIndex`, `aria-expanded`, Enter/Espacio, focus ring; estado `Set<string>` por id; `<details>` reemplazado por render controlado. Sin cambio de contrato → ActivityTab y la página legacy quedan byte-idénticas. Comentario documentando la convención `stopPropagation` para futuros controles.

## F8 — Convertir lead del bot → Lead CRM · `d6d4d7b` (feat)
- Nueva server action `convertChatbotLeadToOsLead` (scope exclusivo, `_actions/`): `requireSuperAdmin` + Zod + `$transaction`; **verifica `slug='develop'` server-side** (no solo UI); idempotencia por email (`source='Chatbot'`); crea `OsLead` espejando `convertInboundToLead`.
- `LeadsTable.tsx` (compartido autorizado): prop ADITIVA opcional `renderRowAction?` (default ausente) → el cliente (`dashboard/leads/page.tsx`) que solo pasa `leads` queda byte-idéntico.
- `LeadsTab.tsx` recibe `slug` y solo si `='develop'` pasa `ConvertChatbotLeadButton` por fila (estado optimista "Ya convertido"). `BotDetailClient` pasa `bot.slug`.

## F9 — Expandir conversación → transcript · `9655a42` (feat)
- `ConversationsTable.tsx` (compartido autorizado): props ADITIVAS `expandable?`/`fetchTranscript?` (default off) → fila expandible con transcript (burbujas user/bot, loading/error/empty). Cliente (`dashboard/chatbot/conversations/page.tsx`) byte-idéntico. De paso, se eliminó el `any` preexistente de `estimatedCostUsd` → `number | string | Prisma.Decimal`.
- Nueva server action `getConversationTranscriptAction` (scope exclusivo): auth SUPER_ADMIN + Zod + reutiliza `getConversationMessagesForOrg` (org-scopeada; sin tocar `queries.ts`). Rol normalizado a MAYÚSCULAS (no se replica el bug lowercase de `LeadDetail`).
- `ConversationsTab` (admin) habilita `expandable` y adapta la action.

## PENDIENTE DE COORDINACIÓN (lote 2)
1. **F5 — color por ruta (widget runtime, fuera de lane).** Falta el "último tramo": resolver el color por ruta y aplicarlo en el widget. Spec:
   - Nuevo helper `resolveAccentColor(config, currentPath)` en `shared/` → `config.routeColorMap[currentPath] ?? config.routeColorMap['/'] ?? config.accentColor` (misma política de match que `ProactiveTooltip.listForPath`; el editor seedea la key `'/'`).
   - `hooks/useChatbot.ts`: derivar `accentColor` con ese helper desde `config` + `currentPath` (ya disponibles) y exponerlo.
   - Reemplazar los reads fijos de `config.accentColor` por el resuelto en `components/chat/ChatWindow.tsx` (líneas ~99/102/221/326/410/493) y `LogicCompanion.tsx` (~182/201/203). `hexToRgb`/`ACCENT_FALLBACK` quedan igual.
   - (Opcional) que el `BotConfigPreview` del admin simule color por ruta: requiere sumar `routeColorMap` + selector de ruta simulada a `BotPreviewState`/`BotConfigPreview` (preview/** es editable, pero es mejora separada).
2. **F6 — subidor de avatar.** Requiere backend de storage: proveedor (Cloudinary, o S3/R2 vía `@aws-sdk/client-s3`) + **dependencia nueva** (necesita aprobación) + env vars. Implementación sugerida: route `POST /api/admin/chatbot/avatar-upload` con `requireSuperAdmin` + validación tipo/peso (~2MB) + rate-limit (presets existentes), y un uploader client en `AppearanceTab` (patrón `ImportCSVButton`) que deje la URL pública en `avatarImageUrl`.
3. **F8 — "Ya convertido" persistente entre recargas.** Hoy el badge es optimista in-session (la idempotencia de datos sí persiste por email). Para un badge fiable al recargar: o `ChatbotLead.convertedToOsLeadId String?` (schema FROZEN → migración aditiva) + exponerlo en `listLeadsForBot`/`LeadItem` (`queries.ts`, fuera de scope), o left-join contra `OsLead source='Chatbot'` por email (también `queries.ts`). Leads sin email no son deduplicables de forma persistente.

## Nice-to-have (lote 2)
- F8: convertir muestra "Ya convertido" solo in-session; ver PENDIENTE 3.
- F9: el transcript se trae on-demand (lazy) por fila — bien para no inflar el payload; cachea por sesión.
- Pre-existente (no del lote): bug lowercase de roles en `LeadDetail.tsx:470` (filtra `'user'/'assistant'` contra enum MAYÚSCULAS) — el transcript de leads probablemente cae al fallback "mensajes técnicos". Fuera de scope; el nuevo transcript NO lo replica.

## Review adversaria (lote 2)
5 agentes read-only (4 dimensiones + adjudicador) sobre `git diff 6fa0bca..HEAD`. Veredicto: **ship**. Verificó OK: cero `any` nuevo; ningún archivo forbidden tocado; gates Zod+rol en las 2 actions nuevas; **regla develop-only enforced server-side** en la convert action; consumidores no-admin de los 3 compartidos byte-idénticos (props opcionales default-off); el cambio de tipo `estimatedCostUsd → Prisma.Decimal` no rompe ni compila ni runtime.
Corregido (commit de fixes):
- **LOW** ActivityLog: el `select-none` del banner lo heredaba el `<pre>` → JSON no copiable. Fix: `select-text` + `stopPropagation` en el `<pre>`.
- **LOW** BehaviorTab: respuesta rápida nueva (`emoji ''`) mostraba placeholder + "Quitar" a la vez. Fix: `value={reply.emoji || null}`.
Reconocidos sin cambio (documentados): dedupe por email solo (leads sin email re-convertibles tras recarga → PENDIENTE 3); `error.message` al cliente en las actions (convención repo-wide, ambas SUPER_ADMIN-gated — endurecer repo-wide en commit aparte).

## Commits del lote 2 (sobre `6fa0bca`)
- `5cf8163` style(chatbots): checkbox de selección acorde a la UI (F1)
- `eb99ccc` style(chatbots): card de validación de KB integrada a la UI (F2)
- `5bede50` feat(chatbots): selector de emojis en iconos de respuestas rápidas (F3)
- `18c6d53` style(chatbots): preview alineado al título en tabs sin scroll (F4)
- `29cd541` feat(chatbots): claridad del campo URL de avatar (subida directa pendiente) (F6)
- `14ffbf1` feat(chatbots): toggle de metadata por banner completo en Actividad (F7)
- `d6d4d7b` feat(chatbots): convertir lead del bot a Lead CRM (solo develop, admin) (F8)
- `9655a42` feat(chatbots): expandir conversación para ver transcript (F9)
- `(review-fix)` fix(chatbots): metadata copiable y emoji vacío sin Quitar (review)

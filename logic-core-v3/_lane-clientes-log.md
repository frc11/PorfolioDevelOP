# Lote visual — Sección CLIENTES · log de cierre

**Worktree:** `C:\develop-clientes-clients` · **Branch:** `lane/clientes-clients`
**Scope:** `src/app/(protected)/admin/clients/**` (sólo) · **Fecha:** 2026-06-18
**Gate:** `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3` → **EXIT 0 (verde)** · baseline previo también 0.
**Verificación visual:** la hace el humano en `:3000` (por directiva del goal). No auto-confirmado por compilar.

> Cero ediciones a shared/forbidden/schema. Los 11 archivos tocados están todos bajo `clients/`.
> Componentes shared (StatCard, Card, ConfirmDialog) y módulos (ChatbotManager, ProjectManager,
> VaultManager) se **consumen**, no se editan.

---

## Commits por bloque

| Commit | Pedido(s) | Qué |
|--------|-----------|-----|
| `100ace1` | (foundation) | `HoverScaleCard.tsx` — wrapper local que replica el hover de ActivityLog 1:1 + variante `hoverTint` color-only |
| `d7853ef` | 1 | Lista: toggle-on-click en modo selección + X para limpiar |
| `d84051a` | 2, 3, 4 | Detalle: hover scale en stats, color hover en tabs/filas, encender textos |
| `763bb90` | 6, 8, (9) | Billing: datepicker oscuro + ConfirmDialog para quitar override |
| `83133ff` | 11, 10, 5, (12) | Chatbot tab: hover stats, CTA al form de bot, sin flechas decorativas |
| `7bce425` | 14, 15, 16, (13) | Proyectos/Bóveda/Soporte: cards navegables + hover |

Pedidos entre paréntesis = sin cambio de código (auditoría o PENDIENTE) — documentados abajo.

---

## Hover transversal (foundation)

`clients/_components/HoverScaleCard.tsx` (local al worktree, **no** edita ni importa ActivityLog/StatCard).
Valores extraídos de `src/modules/chatbot/components/admin/ActivityLog.tsx` y replicados 1:1:

- `whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}`
- ring/shadow CSS: `hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:shadow-none`
- gate reduced-motion: `const reduce = Boolean(useReducedMotion())` (de `motion/react`) → si `reduce`, `whileHover=undefined`.
- `rounded-2xl` por defecto, pisable por `className` (tailwind-merge vía `cn`) para que el ring matchee el radio de la card interna (`rounded-xl` en chips/tickets/mensajes).
- `h-full` en wrapper + StatCard cuando van en grid, para preservar alturas iguales.

`hoverTint` (variante color-only, pedido 3): `transition-colors hover:border-white/20 hover:bg-white/[0.05]` — sin transform, para hovers densos.

La unificación a un componente shared queda para **post-merge** (no se hizo acá, por scope).

---

## Log por sprint

**Sprint 1 — Lista (`ClientsListClient.tsx`) · pedido 1.** Replica el patrón de `BotsListClient`:
con ≥1 seleccionado el click en la card hace `preventDefault()` + togglea la selección (no navega);
con 0 seleccionados navega como antes. El checkbox siempre togglea (con `stopPropagation`).
"Deseleccionar" (texto) → icono **X** (lucide, strokeWidth 1.5, aria-label) al extremo derecho de la barra.
**NO** se agregó el botón borrar cliente (ver PENDIENTE #1b).

**Sprint 2 — Overview + Header · pedidos 2, 3, 4.** (2) `HoverScaleCard` en las 4 StatCards del Overview
y en los 6 StatChips del header. (3) color-only: tabs inactivos del `ClientTabsNav` (bg + brillo de texto en
hover) y filas de contacto del Overview (`hoverTint`). (4) encendido de textos apagados (ver old→new).

**Sprint 3 — Plan & Billing · pedidos 6, 8, 9.** (6) `[color-scheme:dark]` en el `<input type=date>`
"Vigente hasta" (único date input del scope). (8) `confirm()` nativo → `ConfirmDialog` compartido
(variant `warning`, consumido no editado); botón "Quitar override" siempre visible pero **deshabilitado**
cuando no hay override vigente (`overrideActive` calculado en `BillingOverrideCard` y pasado como prop).
(9) → PENDIENTE (ver abajo: no hay bug en `plan.actions.ts`).

**Sprint 4 — Chatbot tab (`ChatbotTab.tsx`) · pedidos 10, 11, 12, 5.** (11) `HoverScaleCard` en las 4
StatCards. (5) removidas las flechas decorativas `ArrowRight` de las QuickActionCards del panel. (10) CTA
del empty-state corregido `→ /admin/chatbots/new` (antes `→ /admin/clients/new`, crear CLIENTE = mal);
preselección de org = PENDIENTE. (12) → PENDIENTE (botones en ChatbotManager, forbidden).

**Sprint 5 — Proyectos / Bóveda / Soporte · pedidos 13, 14, 15, 16.** (13) auditoría sin cambios (ver abajo).
(14) cards de proyecto = `<Link>` a `/admin/projects/[projectId]` + `HoverScaleCard`. (15) `HoverScaleCard`
en las cards de asset de la Bóveda (las renderiza `VaultTab`, scope propio; `VaultManager` es sólo el form de
subida). (16) Soporte: ticket → `<Link>` `/admin/tickets/[ticketId]`; mensaje → `<Link>`
`/admin/messages/[orgId]` (el thread es por organización, `orgId` = `clientId`); hover scale + color;
"Ver todos" → botón con borde/bg y área de click amplia.

---

## PENDIENTES (con motivo)

1. **#1b — Botón "borrar cliente".** Fuera del lote por directiva (acción destructiva, definición del humano).
   No ejecutado.

2. **#7 — Notas internas funcionales.** Requiere migración aditiva a `Organization` (schema **frozen**) y la
   DB es **compartida** entre worktrees. Coordinación. El placeholder "Próximamente…" del Overview queda como
   está.

3. **#9 — Audit log del `reason` (motivo del cambio de plan).** **No es un bug.** El `reason` YA llega al
   audit log: `assignPlanToOrg` lo pasa a `logAdminAction` dentro de `metadata` como `reason: reason ?? null`
   en **ambas** ramas (downgrade L161, upgrade/first_assignment L226), y `logAdminAction` (`src/lib/audit-log.ts`)
   persiste `metadata` en la columna `AdminAuditLog.metadata` (Json). El form lo envía bien
   (`PlanAssignmentForm` L45) y el no-op "Sin cambios" (mismo plan) está deshabilitado en UI, así que no hay
   path que pierda el reason. → **Si la queja es que no se VE en el viewer de audit:** el reason vive dentro del
   blob `metadata` (no en columna propia ni en `diff`); surfacearlo requiere editar el viewer/query del audit log
   **o** agregar columna en el schema — ambos **fuera de scope clientes / frozen**. La corrección **no** está en
   `plan.actions.ts`. Decisión del humano: ¿columna `reason` propia (schema) o que el viewer lea `metadata.reason`?

4. **#10 — Preselección de org en el form de bot.** El destino del CTA se corrigió a `/admin/chatbots/new`,
   pero **la preselección por URL no existe**: `chatbots/new/page.tsx` no lee `searchParams` y `CreateBotForm`
   inicializa la org en `orgsAvailable[0]` (1ra org sin bot, alfabético). Soportarlo requiere editar el form de
   chatbots (`page.tsx` + `CreateBotForm.tsx`), **fuera de scope clientes**. No inventé el contrato.

5. **#12 — Eliminar los 3 botones redundantes.** Redundancia **confirmada**: "Configurar bot" → `?tab=config`,
   "Editar conocimiento" → `?tab=knowledge`, "Ver detalle completo" → `?tab=overview` — los mismos destinos que
   las QuickActionCards del panel de abajo. PERO los 3 botones viven en
   `src/components/admin/managers/ChatbotManager.tsx` (módulo **forbidden**). No se pueden borrar sin editar el
   módulo. PENDIENTE de coordinación.

---

## Auditoría #13 — "Crear entregable" (read-only, sin cambios)

**Dónde:** panel derecho "Crear entregable" de `ProjectsTab.tsx` → renderiza `<ProjectManager>` (módulo,
forbidden) cuando hay proyecto activo. El botón real ("Crear y Notificar al Cliente") está en
`ProjectManager.tsx` y llama la server action `createTaskForClientAction(projectId, organizationId, {title, description})`
(`src/actions/agency-actions.ts`).

**Qué crea:** un **`Task`** (NO existe entidad "Deliverable" propia; "entregable" == Task) en el proyecto
**activo**, con `status: TODO` y `approvalStatus: PENDING_APPROVAL` (es exactamente el contador que muestra la
columna izquierda). En la **misma transacción** crea `Notification` (ACTION_REQUIRED) para **cada OrgMember** del org.

**Qué notifica:** (1) **in-app** — notificaciones ACTION_REQUIRED por miembro (alimentan el dashboard del cliente,
`actionUrl: /dashboard/project`); (2) **email** — loop fire-and-forget con Resend (`ActionRequiredEmail`),
best-effort, no-op silencioso si falta `RESEND_API_KEY`. **No hay toast** de éxito (queda un TODO comment).

**Cableado:** end-to-end real, no es stub. SUPER_ADMIN-gated + `assertProjectBelongsToOrg` (guard cross-tenant) +
`revalidatePath('/admin/clients')`. El dashboard del cliente consume las notifications y tiene flujo approve/reject.

**Sentido de producto:** el core (postear entregable → Task PENDING_APPROVAL → notificación + email → aprobar/
rechazar) es **coherente**. Smells reales:
- **(a)** el "entregable" se persiste como `Task` genérico **sin archivo/URL adjunto**, pero el email promete un
  artefacto ("listo en tu Bóveda B2B", "Ver Entregable") → **entregable sin payload**. Existe un
  `createClientAssetAction` separado para assets reales que **no está enlazado** acá.
- **(b)** siempre apunta a `activeProject` (1er IN_PROGRESS/REVIEW/cualquiera); no se puede elegir proyecto desde
  el panel → frágil para clientes multi-proyecto.
- **(c)** sin input de `dueDate` en UI aunque la action lo soporta.
- **(d)** sin feedback de éxito en el cliente (sólo se limpia el form).

Conceptualmente sano; el gap "entregable sin contenido" es el smell que conviene revisar a nivel producto.

---

## old → new (cambios cosméticos, para calibración)

| Lugar | Antes | Después |
|------|-------|---------|
| Lista — barra selección | botón texto "Deseleccionar" (izq) | icono **X** (aria-label) al extremo derecho |
| Lista — click en card (modo selección) | siempre navegaba | togglea selección (no navega) si hay ≥1 seleccionado |
| Header — eyebrow "Cliente" | `text-zinc-500` | `text-zinc-400` |
| Header — StatChip label | `text-zinc-500` | `text-zinc-400` + hover scale |
| Header — separadores "/" | `text-zinc-700` | `text-zinc-600` |
| Overview — StatCards / StatChips | sin hover | hover scale 1.015 + ring |
| Overview — filas de contacto | sin hover | hover color (`hoverTint`); label `zinc-500 → zinc-400` |
| Tabs (ClientTabsNav) — inactivos | sin hover | `hover:bg-white/[0.05]` + texto `zinc-400 → zinc-200` en hover |
| Billing — `<input type=date>` | calendario claro (nativo) | `[color-scheme:dark]` |
| Billing — "Quitar override" | `confirm()` nativo; sólo visible con override | `ConfirmDialog` (warning); **siempre visible**, disabled si no hay override vigente |
| ChatbotTab — CTA empty-state | `/admin/clients/new?prefillOrgSlug=…` | `/admin/chatbots/new` |
| ChatbotTab — QuickActionCards | con flecha decorativa `→` | sin flecha |
| ChatbotTab — StatCards | sin hover | hover scale + ring |
| Proyectos — cards | estáticas | `<Link>` a `/admin/projects/[id]` + hover scale; textos `zinc-500 → zinc-400/300` |
| Bóveda — cards de asset | sin hover | hover scale + ring; textos `zinc-500 → zinc-400` |
| Soporte — ticket/mensaje | estáticos | `<Link>` (ticket→`/admin/tickets/[id]`, mensaje→`/admin/messages/[orgId]`) + hover scale + color |
| Soporte — "Ver todos" | link de texto chico | botón con borde/bg, área de click amplia |

### Decisiones cosméticas/UX tomadas (a criterio, registradas)
- **Hover:** wrapper local 1:1 con ActivityLog (no se unificó a shared — post-merge).
- **Color-only (pedido 3):** elegí tabs inactivos + filas de contacto.
- **Encender (pedido 4):** bump conservador de 1 step (`zinc-500→400`, `700→600`), sin romper jerarquía; WCAG AA OK (zinc-400 ~7:1 sobre fondo oscuro).
- **#10:** corregí el destino roto del CTA aunque la preselección quede PENDIENTE — "crear cliente" desde "Configurar chatbot" era inequívocamente incorrecto.
- **#8:** "Quitar override" pasa a render permanente + disabled (lectura literal de "deshabilitá cuando no hay vigente").
- **Flechas (pedido 5):** removidas sólo de las nav cards del panel; dejé la flecha del CTA primario "Configurar chatbot →" (afordancia direccional de CTA, no es nav card).

---

## Rutas a verificar en `:3000` (humano)
- `/admin/clients` — selección múltiple: checkbox inicia selección; con ≥1 seleccionado, click en otra card la togglea sin navegar; con 0, click navega; X limpia.
- `/admin/clients/[id]?tab=overview` — hover en StatCards/StatChips/tabs/filas; textos más presentes; datepicker oscuro y ConfirmDialog en Billing (override).
- `/admin/clients/[id]?tab=chatbot` — hover en StatCards; CTA del empty-state (cliente sin bot) lleva a `/admin/chatbots/new`; sin flechas en el panel.
- `/admin/clients/[id]?tab=projects` — cards navegan a `/admin/projects/[id]`.
- `/admin/clients/[id]?tab=vault` — hover en cards de asset.
- `/admin/clients/[id]?tab=support` — ticket/mensaje navegan; "Ver todos" cómodos.

---
---

# LOTE 2 — Sección CLIENTES · log de cierre (cosmético, sobre lo ya commiteado)

**Worktree/Branch:** mismos (`C:\develop-clientes-clients` · `lane/clientes-clients`) · **Scope:** `src/app/(protected)/admin/clients/**` · **Fecha:** 2026-06-19
**Gate:** `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3` → **EXIT 0**; baseline previo (antes de tocar nada) también **EXIT 0** ⇒ regresión de tipos atribuible a estos cambios = **ninguna**.
**Verificación visual:** la hace el humano en `:3000` (directiva del goal). **No** auto-confirmado por compilar.
**Self-review:** workflow adversarial de **5 revisores** (1 por ajuste + auditoría de scope/forbidden) → **5/5 pass, 0 issues**.

> Cero ediciones a shared/forbidden/schema. **4 archivos** tocados, todos bajo `clients/`. `HoverScaleCard`/`hoverTint` (lote 1) se **reusan**; no se creó otro wrapper ni se movió a shared.

## Commits por bloque (LOTE 2)

| Commit | Pedido | Archivo | Qué |
|--------|--------|---------|-----|
| `6aeb750` | 1 | `ClientsListClient.tsx` | checkbox de selección re-estilado 1:1 con `BotsListClient` |
| `709de62` | 3 | `BillingOverrideCard.tsx` | hover **scale** (`HoverScaleCard`) en las 3 cards de billing override |
| `9605637` | 5 | `PlanAssignmentCard.tsx` | hover de **color** (`hoverTint`, sin transform) en filas de la tabla de gating |
| `f991c01` | 6 | `BillingOverrideForm.tsx` | quitar flechas ↑↓ del input number "Precio override" (CSS local) |

## Log por ajuste

**Ajuste 1 (pedido 1) — Estética del checkbox de la lista.** El toggle-on-click ya existía (lote 1, Sprint 1); faltaba el **look**. El `<input type=checkbox>` nativo (`h-4 w-4 … accent-cyan-400`) se reemplazó por el patrón de `BotsListClient`: `<label>` (absolute left-3 top-3 z-10 inline-flex cursor-pointer, `stopPropagation`) › `<input class="peer sr-only">` + `<span>` estilado (h-5 w-5, rounded-md, border-white/20, bg-zinc-950/80, backdrop-blur, `peer-checked:bg-cyan-400 peer-checked:text-zinc-950`, `peer-focus-visible:ring-2`) con `<Check>` (lucide, strokeWidth 1.5). Markup **byte-for-byte = Bots**. Comportamiento intacto (`checked`/`onChange`/`aria-label`; sigue siendo sibling del `<Link>` → no navega; en modo selección la card togglea sin navegar). `Check` agregado al import de lucide. A11y: el input real es `sr-only` (focusable, no `hidden`) y suma `peer-focus-visible:ring`.

**Ajuste 2 (pedido 3) — Contacto + billing.** *Contacto:* las 4 filas (Email primario, WhatsApp, Website, Creado) **YA** pasan por `InfoRow` con `hoverTint` desde lote 1 (Sprint 2) ⇒ **ya completo, sin cambio nuevo**. *Billing:* las 3 cards del helper `Stat` (Precio del plan / Override vigente / Se factura) ahora se envuelven en `<HoverScaleCard className="h-full rounded-xl">` (scale 1.015 + ring). El `rounded-xl` pisa el default `rounded-2xl` vía `cn`/twMerge para que el **ring matchee** la card interna; `h-full` (wrapper + div interno) preserva alturas iguales en el grid `sm:grid-cols-3`. `BillingOverrideCard` es server component que renderiza el client `HoverScaleCard` con children server-rendered (mismo patrón RSC que OverviewTab con `<StatCard>`).

**Ajuste 3 (pedido 5) — Tabla de gating.** En el helper `Row` de `PlanAssignmentCard` (dentro del `<details>` "Comparación de las 7 dimensiones de gating"), el `<tr>` de cada fila de datos recibió `hoverTint` (`transition-colors hover:border-white/20 hover:bg-white/[0.05]`) ⇒ coloreo bg/border en hover, **sin transform** (no se agranda — lectura literal del pedido). El `<thead>` queda igual. El bg del `<tr>` pinta detrás de las celdas transparentes (precedente en el mismo stylesheet: `.admin-table tbody tr:hover` en `globals.css`). `hoverTint` es un `const` string importado en server component → resuelve al **valor real** (no a un client-reference proxy): mismo patrón ya probado en `OverviewTab` (server) / lote 1.

**Ajuste 4 (pedido 6) — Spinners del input precio.** Al `<input type=number>` "Precio override (USD/mes)" se le agregaron 5 clases locales: `[-moz-appearance:textfield]` (Firefox) + `[&::-webkit-inner-spin-button]:appearance-none` · `:m-0` y `[&::-webkit-outer-spin-button]:appearance-none` · `:m-0` (Chromium). `type`, `min/max/step` y la validación (`Number()`/`Number.isNaN`/`< 0` en `handleSet`) **sin tocar**. Cambio local a ese único input (el date y el text no se tocan).

## PENDIENTE — Ajuste 5 (pedido 7): BLOQUEADO por forbidden

**Pedido:** hover **scale** en 3 cards del "ChatbotTab" — la card del **nombre del bot** (fila "Lucia · develop · gemini-2.5-flash" + estado Activo), **"Consumo (Este mes)"** y **"Actividad reciente"**.

**Por qué no se hizo:** esas 3 cards **NO** están en `ChatbotTab.tsx` (ahí sólo hay 4 StatCards, que ya tienen `HoverScaleCard` desde lote 1). Las renderiza `src/components/admin/managers/ChatbotManager.tsx` — la del bot en líneas **65-80**, "Consumo" en **83-100**, "Actividad reciente" en **102-121** — **módulo de la lista forbidden** ("CONSUMIR sí; EDITAR no"). No hay forma de darle scale+ring **individual** a esas 3 cards sin editar el módulo: envolver el `<ChatbotManager>` entero desde `ChatbotTab` escalaría también los 3 botones y la lista "Últimos Leads" (rompe la aceptación "esas 3 cards reaccionan con scale+ring, consistente con las StatCards"). Importar el `HoverScaleCard` local-al-worktree dentro de un módulo shared sería, además, un cross-boundary incorrecto. **Hermano de PENDIENTE #12** (los 3 botones redundantes, también en `ChatbotManager`).

**Decisión del humano:** ¿autorizar una edición puntual a `ChatbotManager.tsx` (como se autorizó `ActivityLog.tsx` en otra lane) para envolver esas 3 cards en hover? Si **sí** → commit propio, explícitamente fuera de scope clientes. Si **no** → post-merge. No se asumió.

## old → new (LOTE 2)

| Lugar | Antes | Después |
|------|-------|---------|
| Lista — checkbox de selección | `<input>` nativo (`h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-cyan-400`) | `<label>` + `<input peer sr-only>` + `<span>` estilado h-5 w-5 con `<Check>` — idéntico a `/admin/chatbots` |
| Overview/Billing — 3 cards de override (Precio del plan / Override vigente / Se factura) | sin hover | hover **scale 1.015 + ring** (`HoverScaleCard`, `rounded-xl`, `h-full`) |
| Gating — filas `<tr>` de la tabla de 7 dimensiones | sin hover | hover **color** `hoverTint` (bg + border; **sin** agrandar) |
| Billing form — input "Precio override" | flechas ↑↓ del navegador | sin flechas (`appearance-none` webkit inner/outer + `[-moz-appearance:textfield]`) |
| ChatbotTab — 3 cards (bot / Consumo / Actividad) | sin hover | **sin cambio** → BLOQUEADO (viven en `ChatbotManager`, forbidden) |

## Rutas a verificar en `:3000` (humano) — LOTE 2
- `/admin/clients` — el checkbox de cada card ahora se ve **igual** al de `/admin/chatbots` (cuadrado redondeado, check cyan al marcar). Conviene compararlas lado a lado.
- `/admin/clients/[id]?tab=overview` — **Billing override:** las 3 cards (Precio del plan / Override vigente / Se factura) hacen **scale+ring** en hover; el input "Precio override (USD/mes)" **no** muestra flechas ↑↓. Abrir el `<details>` "Comparación de las 7 dimensiones de gating": cada **fila** se colorea en hover **sin agrandarse**.
- `/admin/clients/[id]?tab=chatbot` — (Ajuste 5 **no** aplicado) las cards de bot/Consumo/Actividad siguen sin hover; pendiente de decisión sobre `ChatbotManager`.

---
---

# LOTE 3 — CLIENTES · log de cierre (fixes de hover + ediciones de módulo AUTORIZADAS)

**Worktree/Branch:** mismos (`C:\develop-clientes-clients` · `lane/clientes-clients`) · **Fecha:** 2026-06-19
**Gate:** `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3` → **EXIT 0** tras cada bloque (baseline previo también 0).
**Verificación visual:** la hace el humano en `:3000`. Para los hovers (#1, #2) el criterio es que se **VEAN**, no que compilen.
**Self-review:** workflow adversarial de **6 revisores** (1 por ajuste + auditoría de scope/forbidden) → **6/6 pass**. Único hallazgo: un `any` **preexistente** en ChatbotManager (no introducido por este lote) → lo limpié de paso (ver #7/#12).
**Autorización:** este lote tenía OK explícito del humano para editar `ChatbotManager` (#7,#12), `chatbots/new/*` y el viewer del audit log (#9), que antes eran forbidden/fuera de scope.

## Archivos tocados FUERA de `admin/clients/` (para coordinación de merge)

| Archivo | Ajuste | Por qué |
|---------|--------|---------|
| `src/components/admin/managers/ChatbotManager.tsx` | #7, #12 | hover en 3 cards + borrar 3 botones + limpiar `any` (módulo, edición autorizada) |
| `src/app/(protected)/admin/chatbots/new/page.tsx` | #8 | leer `searchParams.organizationId` y pasarlo al form |
| `src/app/(protected)/admin/chatbots/new/CreateBotForm.tsx` | #8 | prop `preselectedOrgId` + init de org validado |
| `src/app/(protected)/admin/audit-log/_components/AuditLogClient.tsx` | #9 | render de `metadata.reason` en cada entrada (solo viewer) |

Dentro de `clients/`: `PlanAssignmentCard.tsx` (#1), `tabs/OverviewTab.tsx` (#2), `tabs/ChatbotTab.tsx` (#8, el CTA).

## Commits por bloque (LOTE 3)

| Commit | # | Archivo(s) | Qué |
|--------|---|-----------|-----|
| `89a307b` | 1 | `PlanAssignmentCard.tsx` | hover de fila **VISIBLE** en la tabla de gating (replica la tabla de horas) |
| `56de07b` | 2 | `OverviewTab.tsx` | hover **visible** en filas de info de contacto (inline, sin tocar `hoverTint`) |
| `57203c8` | 7, 12 | `ChatbotManager.tsx` | hover scale+ring en 3 cards + borrar 3 botones redundantes + `any` cleanup |
| `0060243` | 8 | `chatbots/new/page.tsx` · `CreateBotForm.tsx` · `ChatbotTab.tsx` | preselección de org por `?organizationId=` |
| `156c090` | 9 | `AuditLogClient.tsx` | `metadata.reason` visible en el viewer |

## Log por ajuste

**#1 — Hover VISIBLE en la tabla de gating (URGENTE, falló 2 veces).** *Causa raíz del fallo:* el `hoverTint` previo era `hover:bg-white/[0.05]` (5%) sobre un `<tbody>` **sin superficie base** (className solo `text-zinc-300`) y filas compactas → delta imperceptible. *Fix:* repliqué el mecanismo de la tabla que SÍ se ve, "registros de horas" (`time-entry-panel.tsx:321-362`): `<tbody>` con superficie + divisores (`divide-y divide-white/5 bg-white/[0.02]`) y `<tr>` con `transition-colors duration-200 hover:bg-white/10`. La referencia prueba que el bg del `<tr>` pinta en esta app (lo hace con delta de apenas +1%); acá el delta es +8% (base 2% → hover 10%), claramente perceptible. Padding de celda `py-1.5 → py-2`. **Sin transform** (no se agranda). Quité el import de `hoverTint` (ya no se usa en este archivo). *El humano confirma en `:3000` que ahora se ve.*

**#2 — Hover VISIBLE en Información de contacto.** Las 4 filas (`InfoRow` en `OverviewTab`) usaban `hoverTint` (5%, no se notaba). Las pasé a hover **inline** `transition-colors hover:border-white/15 hover:bg-white/10` (mismo white/10 que #1, consistente). **Decisión de scope:** NO toqué la constante compartida `hoverTint` (la consumen también las cards de `SupportTab`); de haberla subido habría cambiado Soporte sin pedirlo. Por eso el cambio es inline en `InfoRow`. Quité el import de `hoverTint` de `OverviewTab` (sigue importando `HoverScaleCard` para las StatCards). Padding `py-1 → py-1.5`.

**#7 — Hover en las 3 cards del ChatbotManager (módulo, AUTORIZADO).** Las 3 cards (nombre del bot, "Consumo (Este mes)", "Actividad reciente") ahora son `<motion.div>` con `whileHover` scale `1.015` + ring (`HOVER_RING`) + gate `useReducedMotion()`, replicando **inline** el patrón de `ActivityLog`/`HoverScaleCard` (NO se importó el `HoverScaleCard` local de clients → sería cross-boundary; está documentado en el comentario). `useReducedMotion()` se llama **antes** del early-return `if (!botConfig)` (regla de hooks). `motion` viene de `motion/react`.

**#12 — Borrar los 3 botones redundantes (AUTORIZADO).** Removí el bloque `<div className="mt-6 flex flex-wrap gap-3">` con "Configurar bot" / "Editar conocimiento" / "Ver detalle completo" (redundantes con las QuickActionCards del panel del `ChatbotTab`: `?tab=config|knowledge|overview`). Quedan la lista "Últimos Leads" y el empty-state. Quité los imports lucide que quedaron sin uso (`Settings`, `BookOpen`, `ArrowRight`); `Link`/`clientPath`/`Sparkles` siguen usándose en el empty-state. **Bonus:** limpié un `any` **preexistente** (`leads.map((lead: any)` → `(lead)`, el tipo se infiere de `ChatbotManagerBotConfig`) por la regla "Cero any, sin excepciones"; no cambia comportamiento.

**#8 — Preselección de org en el form de bot (AUTORIZADO).** `chatbots/new/page.tsx`: firma con `searchParams: Promise<{ organizationId?: string }>` (Next 16), se `await`-ea y se pasa `preselectedOrgId`. `CreateBotForm`: nuevo prop opcional `preselectedOrgId`; `initialOrgId` = ese id **solo si existe en `orgsAvailable`** (`.some(...)`), si no cae al default `orgsAvailable[0]`. `ChatbotTab` (clients): el CTA del empty-state ahora es `/admin/chatbots/new?organizationId=${clientId}`. Org inválida/stale nunca llega al estado (la valida contra las opciones del Select). Sin `any`; el `router.push` del submit es **preexistente** (no es uno nuevo).

**#9 — Reason visible en el audit log (AUTORIZADO, solo viewer).** El `reason` ya se persiste en `AdminAuditLog.metadata.reason` (Json) y `listAuditLog` ya devuelve `metadata` (sin `select` restrictivo) → **no hizo falta tocar query ni schema**. En `AuditLogClient` agregué `extractReason(metadata: unknown): string | null` (narrowing seguro, **sin `any`**) y una línea "Motivo: …" que se muestra cuando hay reason. Cambio 100% en el viewer.

## old → new (LOTE 3)

| Lugar | Antes | Después |
|------|-------|---------|
| Gating — filas de la tabla de 7 dimensiones | `<tr>` con `hoverTint` 5% sobre tbody sin base → **no se veía** | `<tbody>` con base `bg-white/[0.02]` + `divide-y`, `<tr>` `hover:bg-white/10` (delta +8%); `py-1.5→py-2` |
| Overview — filas de info de contacto | `hoverTint` 5% → no se notaba | inline `hover:border-white/15 hover:bg-white/10`; `py-1→py-1.5` |
| ChatbotManager — 3 cards (bot/Consumo/Actividad) | sin hover | `motion.div` hover **scale 1.015 + ring** (gate reduced-motion) |
| ChatbotManager — 3 botones de arriba | Configurar bot / Editar conocimiento / Ver detalle completo | **eliminados** (redundantes con el panel) |
| ChatbotManager — `leads.map((lead: any))` | `any` preexistente | `(lead)` (tipo inferido) |
| chatbots/new — selección de org | siempre `orgsAvailable[0]` | preselecciona la org de `?organizationId=` si es válida |
| ChatbotTab — CTA empty-state | `/admin/chatbots/new` | `/admin/chatbots/new?organizationId=${clientId}` |
| Audit log — entrada | sin motivo visible | línea "Motivo: …" leída de `metadata.reason` cuando existe |

## Rutas a verificar en `:3000` (humano) — LOTE 3
- `/admin/clients/[id]?tab=overview` — **#1:** abrir el `<details>` "Comparación de las 7 dimensiones de gating"; pasar el mouse por una fila debe **colorearla de forma evidente** (como la tabla de horas), sin agrandar. **#2:** las filas de "Información de contacto" deben colorearse claramente al hover.
- `/admin/clients/[id]?tab=chatbot` — **#7:** las cards de nombre del bot, "Consumo (Este mes)" y "Actividad reciente" hacen scale+ring. **#12:** ya **no** están los 3 botones de arriba (Configurar bot / Editar conocimiento / Ver detalle completo); el panel de QuickActionCards de abajo sigue llevando a los mismos destinos. **#8:** desde un cliente **sin bot**, "Configurar chatbot" abre `/admin/chatbots/new` con **esa** org ya seleccionada.
- `/admin/projects/[id]/hours` — referencia visual del hover de tabla que se replicó (para comparar con #1).
- `/admin/audit-log` — **#9:** una entrada de cambio de plan con motivo cargado muestra la línea "Motivo: …".

---

# Lote — Refactor del creador de clientes (con/sin bot) · log de cierre

**Worktree:** `C:\develop-clientes-clients` · **Branch:** `lane/clientes-clients` · **Fecha:** 2026-06-19
**Gate:** `.\node_modules\.bin\tsc.cmd --noEmit` → **EXIT 0** tras cada commit. `npm run build` final → **EXIT 0** (ver nota al pie).
**Verificación visual:** humano en `:3000` (el subagente `visual-qa` / Preview MCP no está disponible esta sesión).

> ⚠️ **Scope distinto a los lotes visuales:** la mayoría del trabajo cae **FUERA** de `clients/` — vive en
> `src/modules/chatbot/` (módulo) y `src/lib/email/templates/` (infra compartida). El usuario autorizó
> explícitamente este refactor del módulo onboarding. El "creador de clientes" **ES** el `OnboardingWizard`
> del módulo chatbot, montado en `/admin/clients/new`.

## Decisión de producto
Alta con **toggle con bot / sin bot**. Sin bot = solo Organization + User admin (sin BotConfig/KB).
4 decisiones tomadas esta sesión: industria **omitida** sin-bot (evita migración) · email **variante**
sin-bot · post-alta sin-bot → **`/admin/clients`** · apariencia rica **se persiste** al crear.

## Commits por bloque (9)

| Commit | Sprint | Qué |
|--------|--------|-----|
| `2074bfd` | 1a | `createClientOnly` (alta sin bot) + variante sin-bot del email (`welcome-client`, flag `withBot`) |
| `64ae22e` | 1b | toggle `withBot` + step machine dinámico (render por clave) + draft backward-compat + toggle UI en Step1 |
| `f467c8a` | 1c | review/submit condicionales: oculta secciones de bot, ramifica a `createClientOnly`, nav a `/admin/clients` |
| `24119f1` | 2a | page full-width (`max-w-3xl`→`max-w-5xl`) + copy bot-agnóstico |
| `f78f6d1` | 2b | campos redondeados: inputs→`Input`, `Select` sin override, textareas con `TEXTAREA_CLASS`, botones `rounded-xl` |
| `7b42446` | 3 | layout del review sin celda vacía (LLM full-width con grid interno) |
| `7688985` | 4a | estado + action: 4 campos de apariencia (Zod valida + `BotConfig.create` persiste, **sin migración**) |
| `0983a1f` | 4b | Step4 con `ColorPicker`×3 + `AvatarPicker` + `AvatarUploader` + `EmojiPickerField`; review los refleja |
| `71376a7` | 5 | `ExpandableTextField` (Modal glass + `MarkdownEditor`) en las 7 textareas de KB |

## Archivos FUERA de `clients/` (coordinación de merge)
- `src/modules/chatbot/components/admin/onboarding/*` — wizard + 5 steps + `types.ts` + `useOnboardingDraft.ts` + 2 nuevos (`field-styles.ts`, `ExpandableTextField.tsx`).
- `src/modules/chatbot/server/admin/createClientOnly.ts` (**nuevo**) + `createClientWithBot.ts` (extensión apariencia, sin tocar la transacción base).
- `src/lib/email/templates/welcome-client.ts` — **infra compartida** (flag `withBot`, default `true` = sin regresión al con-bot).
- Único bajo la lane: `src/app/(protected)/admin/clients/new/page.tsx`.
- Se **consumen** (no editan): `@/components/ui/{Modal,Input,Select,Field}`, `kb/MarkdownEditor`, `config/{ColorPicker,AvatarUploader,EmojiPickerField}`, `avatar/AvatarPicker`.

## Paradas (resueltas)
- **#1 schema/migración:** NO hace falta. `Organization.botConfig` ya es opcional; `createClientWithBot` ni crea `Subscription`; la apariencia rica usa columnas **ya existentes** en `BotConfig`. Verificado read-only.
- **#2 negocio:** las 4 decisiones de producto de arriba.

## old → new
| Lugar | Antes | Después |
|------|-------|---------|
| Alta | siempre crea cliente **con** bot | toggle con/sin bot; sin-bot = `createClientOnly` (org + admin) |
| Pasos | 5 fijos (Empresa→Bot→KB→Apariencia→Review) | dinámicos: sin-bot = Empresa→Review |
| Email bienvenida | menciona el chatbot siempre | variante sin-bot omite las líneas del bot |
| Form | `max-w-3xl`, inputs `rounded` (4px) | `max-w-5xl`, `Input`/`Select`/textarea del sistema (`rounded-xl`) |
| Apariencia | color hex + select de avatar; `accentSecondary/chatSurfaceTint/avatar*` → `null` | ColorPicker×3 + AvatarPicker (preview vivo) + uploader/emoji; los 4 campos **se persisten** |
| Review | grid con celda vacía al final | LLM full-width → sin huecos; refleja apariencia rica |
| KB (Step3) | 7 textareas planas | cada una con "Expandir" → modal glass con MarkdownEditor (Editar/Split/Preview) |

## Rutas a verificar en `:3000` (humano)
- `/admin/clients/new` **con bot:** alta end-to-end **igual que antes** (no regresión); la apariencia rica **persiste** (crear → abrir config del bot → ver color secundario, tinte, avatar imagen/emoji).
- `/admin/clients/new` **sin bot:** toggle OFF → solo **Empresa + Review**; crea cliente sin bot; el email **no** menciona bot; redirige a **`/admin/clients`**; el cliente aparece en la lista; su tab Chatbot muestra el empty state.
- **cambio 3:** en KB, "Expandir" de cualquier textarea → modal **centrado con fondo blurreado** (Editar/Split/Preview); lo editado se refleja en el campo inline.
- **cambios 2/5/6:** form full-width, campos `rounded-xl`, review **sin celda vacía**, responsive sin overflow.

> **Nota build:** `npm run build` (Next 16, webpack) → **EXIT 0**. Requiere subir el heap de Node
> (`NODE_OPTIONS=--max-old-space-size=8192`): con el default (~2GB) el webpack build hace OOM
> (`heap out of memory`, exit 134) — es un techo de memoria del entorno, no del código (tsc verde).

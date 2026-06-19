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

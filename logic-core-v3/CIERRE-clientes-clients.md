# Cierre — lane/clientes-clients

**Worktree:** `C:\develop-clientes-clients\logic-core-v3`
**Branch:** `lane/clientes-clients`
**Base:** `lane/clientes @ 3ba49df`
**Fecha de cierre:** 2026-06-19
**Gate final:** `tsc --noEmit` → EXIT 0 · ESLint archivos clave → limpio · Working tree limpio

---

## Resumen de la lane

Lote de trabajo completo sobre la sección **Clientes** del panel admin develOP. Cubre:

1. **Lotes visuales 1/2/3** — hover, checkbox, billing, gating, proyectos/bóveda/soporte, tabs.
2. **Tabla gating full-width** — bordes a borde de la card.
3. **Refactor del creador de clientes** — chatbot opcional (toggle con/sin bot), full-width, campos redondeados, editor de color+avatar rico (persiste al crear), inputs KB expandibles en modal Editar/Split/Preview, layout de review sin celda vacía.
4. **Correcciones del creador** — normalización de websiteUrl/whatsapp, errores Zod legibles, preview rico vía `BotConfigPreview`, expandir como botón bordeado + auto-expand, espaciado card LLM.
5. **Editor de datos del cliente** — action `updateClient`, ruta `/admin/clients/[clientId]/edit`, botón de entrada.
6. **Ajuste del header** — "Editar datos" movido de la card de contacto al header junto a "Impersonar".

---

## Commits por lote (34 commits)

### Lote visual 1 — hover detalle + billing + chatbot-tab + proyectos/bóveda/soporte
```
d84051a feat(clientes/detalle): hover scale en stats + color hover en tabs/filas + encender textos (pedidos 2,3,4)
763bb90 feat(clientes/billing): datepicker oscuro + ConfirmDialog para quitar override (pedidos 6,8)
83133ff feat(clientes/chatbot-tab): hover en stats + CTA al form de bot + sin flechas decorativas (pedidos 11,10,5)
7bce425 feat(clientes/proyectos-boveda-soporte): cards navegables + hover (pedidos 14,15,16)
38ca850 docs(clientes): log de cierre del lote visual
```

### Lote visual 2 — checkbox + HoverScaleCard + billing card + gating hover
```
100ace1 feat(clientes): wrapper local HoverScaleCard (hover ActivityLog 1:1) + variante color-only
d7853ef feat(clientes/lista): toggle-on-click en modo seleccion + X para limpiar (pedido 1)
6aeb750 feat(clientes/lista): checkbox de seleccion con el look de la lista de chatbots (pedido 1)
709de62 feat(clientes/overview): hover scale en las 3 cards de billing override (pedido 3)
9605637 feat(clientes/gating): hover de color sin agrandar en filas de la tabla de gating (pedido 5)
f991c01 feat(clientes/billing): quitar las flechas del input number de precio override (pedido 6)
2067371 docs(clientes): log de cierre LOTE 2
```

### Lote visual 3 — hover visible filas, ChatbotManager (autorizado), preselección org, audit reason
```
89a307b fix(clientes/gating): hover de fila VISIBLE replicando la tabla de horas (#1)
56de07b fix(clientes/overview): hover visible en filas de info de contacto (#2)
57203c8 feat(chatbot-manager): hover scale+ring en las 3 cards + quitar 3 botones redundantes + limpiar any preexistente en leads (#7,#12)
0060243 feat(chatbots/new): preseleccion de org via searchParams + CTA del ChatbotTab pasa organizationId (#8)
156c090 feat(audit-log): mostrar metadata.reason en el viewer del audit log (#9)
e8e7c5d docs(clientes): log de cierre LOTE 3
```

### Tabla gating full-width
```
bb247e0 feat(clientes/plan-card): tabla gating full-width en contenedor
```

### Creador de clientes — refactor (9 sprints)
```
2074bfd feat(clientes/alta): action createClientOnly + variante email sin-bot
64ae22e feat(clientes/alta): toggle con/sin bot + step machine dinamico
f467c8a feat(clientes/alta): review + submit condicionales por toggle
24119f1 feat(clientes/alta): shell full-width + copy bot-agnostico
f78f6d1 feat(clientes/alta): campos redondeados matcheando el sistema
7b42446 fix(clientes/alta): layout del review sin celda vacia
7688985 feat(clientes/alta): captura y persiste apariencia rica del bot
0983a1f feat(clientes/alta): editor de color+avatar rico en el paso de apariencia
71376a7 feat(clientes/alta): inputs de KB expandibles en modal tipo Knowledge Base
d147805 docs(clientes): log de cierre del refactor del creador de clientes
```

### Correcciones del creador (5 fixes)
```
d235239 fix(clientes/alta): wizard full-width sin franjas muertas
ed3e858 fix(clientes/alta): creacion con bot - normaliza inputs y errores legibles
02b6b62 feat(clientes/alta): preview rico reusado de la config del bot
25b97ae feat(clientes/alta): expandir como boton + auto-expand al enfocar
fbcce55 fix(clientes/alta): espaciado de la card LLM en el review
f2b96fc docs(clientes): log de cierre de las correcciones del creador
```

### Editor de datos del cliente
```
2864d3a feat(clientes/editor): action updateClient (datos de empresa + admin)
216a8cb feat(clientes/editor): ruta /edit + form de una pantalla
99f0493 feat(clientes/editor): boton Editar datos en el detalle
4be1a13 docs(clientes): log de cierre del editor de datos del cliente
```

### Ajuste del header
```
71556ba refactor(clientes/header): mover boton Editar datos al header del cliente
```

---

## Archivos tocados (36 archivos + log de lane)

### (a) Dentro de `src/app/(protected)/admin/clients/` — 15 archivos

| Estado | Archivo |
|--------|---------|
| M | `[clientId]/_components/BillingOverrideCard.tsx` |
| M | `[clientId]/_components/BillingOverrideForm.tsx` |
| M | `[clientId]/_components/ClientHeader.tsx` |
| M | `[clientId]/_components/ClientTabsNav.tsx` |
| M | `[clientId]/_components/PlanAssignmentCard.tsx` |
| M | `[clientId]/_components/tabs/ChatbotTab.tsx` |
| M | `[clientId]/_components/tabs/OverviewTab.tsx` |
| M | `[clientId]/_components/tabs/ProjectsTab.tsx` |
| M | `[clientId]/_components/tabs/SupportTab.tsx` |
| M | `[clientId]/_components/tabs/VaultTab.tsx` |
| **A** | `[clientId]/edit/EditClientForm.tsx` _(nuevo)_ |
| **A** | `[clientId]/edit/page.tsx` _(nuevo)_ |
| M | `_components/ClientsListClient.tsx` |
| **A** | `_components/HoverScaleCard.tsx` _(nuevo)_ |
| M | `new/page.tsx` |

### (b) Fuera de `clients/` — 21 archivos (todos autorizados)

| Estado | Archivo | Autorización |
|--------|---------|--------------|
| M | `admin/audit-log/_components/AuditLogClient.tsx` | Lote 3, pedido #9 |
| M | `admin/chatbots/new/CreateBotForm.tsx` | Lote 3, pedido #8 |
| M | `admin/chatbots/new/page.tsx` | Lote 3, pedido #8 |
| M | `components/admin/managers/ChatbotManager.tsx` | Lote 3, pedido #7/#12 — autorizado explícito |
| M | `lib/email/templates/welcome-client.ts` | Creador: variante email sin-bot |
| **D** | `modules/chatbot/components/admin/onboarding/BotPreview.tsx` | Eliminado: reemplazado por `BotConfigPreview` (compartido) |
| **A** | `modules/chatbot/components/admin/onboarding/ExpandableTextField.tsx` | Creador: nuevo helper |
| M | `modules/chatbot/components/admin/onboarding/OnboardingWizard.tsx` | Creador: refactor núcleo |
| M | `modules/chatbot/components/admin/onboarding/Step1Company.tsx` | Creador: toggle + normalización |
| M | `modules/chatbot/components/admin/onboarding/Step2BotIdentity.tsx` | Creador: redondeados |
| M | `modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx` | Creador: expandibles |
| M | `modules/chatbot/components/admin/onboarding/Step4Appearance.tsx` | Creador: apariencia rica |
| M | `modules/chatbot/components/admin/onboarding/Step5Review.tsx` | Creador: review/submit condicional |
| **A** | `modules/chatbot/components/admin/onboarding/field-styles.ts` | Creador: constantes de estilo |
| M | `modules/chatbot/components/admin/onboarding/types.ts` | Creador: `withBot` + campos apariencia ricos |
| M | `modules/chatbot/components/admin/onboarding/useOnboardingDraft.ts` | Creador: backward-compat draft |
| **A** | `modules/chatbot/server/admin/createClientOnly.ts` | Creador: alta sin bot |
| M | `modules/chatbot/server/admin/createClientWithBot.ts` | Creador: apariencia rica persiste |
| **A** | `modules/chatbot/server/admin/updateClient.ts` | Editor: action nueva |
| **A** | `modules/chatbot/shared/field-normalize.ts` | Creador: helpers compartidos client+server |

_(M = modificado · A = nuevo · D = eliminado)_

**Archivos no esperados:** ninguno.

---

## old → new consolidado (visible)

| Pantalla / Componente | Antes | Después |
|---|---|---|
| `/admin/clients` lista | Checkbox básico; sin hover en filas | Checkbox restyled (look chatbot-list); hover visible filas |
| `/admin/clients/[id]` tabs | Sin hover en tab activo/hover | Color hover en tabs + subrayado activo |
| `/admin/clients/[id]` stats header | Sin hover | `HoverScaleCard` scale+lift |
| `/admin/clients/[id]` header | Solo botón "Impersonar" | "Editar datos" + "Impersonar" juntos arriba a la derecha |
| Card Información de contacto | Header con botón "Editar datos" inline | Label simple (botón subió al header) |
| Info rows contacto | Sin hover visible | `border-white/10` + `bg-white/10` en hover |
| BillingOverrideCard | Input number con flechas; sin ConfirmDialog para quitar override | Sin flechas; `ConfirmDialog` en "Quitar override"; 3 cards con hover scale |
| Tabla gating (PlanAssignmentCard) | Padding lateral; filas sin hover; hover invisible | Bordes a borde; `hover:bg-white/[0.08]` visible |
| ChatbotTab | Stats sin hover; CTA sin destino; flechas decorativas | Hover en stats; CTA → `/admin/chatbots/new?organizationId=…`; sin flechas |
| Proyectos / Bóveda / Soporte tabs | Cards sin hover | Cards navegables + hover scale |
| `/admin/chatbots/new` | Sin preselección de org | `organizationId` via searchParams → preseleccionado |
| `ChatbotManager` | 3 botones redundantes; leads sin hover | Botones borrados; hover scale+ring en 3 cards; sin `any` en leads |
| Audit log viewer | `metadata` no visible | `metadata.reason` renderizado si presente |
| `/admin/clients/new` (creador) | Max-w-3xl; solo con-bot; campos crudos `rounded`; preview estático `BotPreview`; textarea plana; review celda vacía | Full-width; toggle con/sin bot; campos `rounded-xl`; `BotConfigPreview` idle/pensando/flotando; expandibles con modal Editar/Split/Preview; review balanceado |
| Apariencia en creador (con-bot) | Color único básico; avatar con selector mínimo; no persiste al crear | `ColorPicker`×3 (primario/secundario/tinte); `AvatarPicker`+`AvatarUploader`+`EmojiPickerField`; persiste en `BotConfig` |
| Creación SIN bot | No existía | Alta Org+User+OrgMember sin `BotConfig`; email variante sin-bot; redirige a `/admin/clients` |
| Normalización inputs | `websiteUrl` rechazaba dominio pelado; `whatsapp` prefill `549` rompía validación | `normalizeWebsiteUrl` prepend `https://`; `normalizeWhatsapp` strip no-dígitos; errores legibles por campo |
| `/admin/clients/[id]/edit` | No existía | `updateClient` (Org+User, unicidad email, audit `CLIENT_UPDATED`); form 2 columnas, 1 pantalla, sin wizard |

---

## Auditoría de reglas

| Regla | Estado |
|---|---|
| Cero `any` nuevo | ✅ Solo comentario explicativo en `AuditLogClient.tsx` (`// se lee de forma segura, sin 'any'`); sin instancias de tipo `any` en ningún archivo nuevo |
| Cero `router.push` directo | ✅ 0 hits en el diff; navegación vía `triggerTransition` o `Link` |
| `prisma/schema.prisma` no tocado | ✅ 0 líneas cambiadas |
| Componentes consumidos no editados | ✅ `BotConfigPreview`, `ColorPicker`, `AvatarPicker`, `AvatarUploader`, `EmojiPickerField`, `Modal`, `MarkdownEditor`, `Card`, `Field`, `Input` — solo consumidos |
| Archivos fuera de clients/ todos autorizados | ✅ Ver tabla grupo (b) — cada uno con su autorización |
| `requireSuperAdmin` + Zod en actions nuevas | ✅ `createClientOnly`, `updateClient` |
| Secrets/hardcode | ✅ Ninguno |

---

## Nota DB — ALTER aplicado en dev (no es cambio de lane)

Durante el desarrollo de este branch se detectó drift entre la migración registrada y el estado real de Neon dev: la columna `chatbot_lead.convertedToOsLeadId` estaba en `_prisma_migrations` pero ausente en la tabla real. Se aplicó:

```sql
ALTER TABLE "chatbot_lead" ADD COLUMN "convertedToOsLeadId" TEXT;
```

vía `prisma db execute`. **El schema no fue modificado** (la definición ya existía desde una migración anterior). Este ALTER es para dev; al deployar a producción hay que verificar si esa columna también falta allí y aplicar el mismo `ALTER` antes del deploy, o bien correr `prisma migrate deploy` si la migración ya está registrada en la DB de prod.

---

## Pendientes POST-MERGE

| Item | Descripción | Requiere |
|---|---|---|
| `city` en Organization | El creador lo omitió (sin columna en schema) | Migración aditiva `Organization.city String?` |
| Avatar del cliente | Editor de cliente omitió avatar (van juntos con `city`) | Migración aditiva `Organization.avatarEmoji/avatarImageUrl` |
| Notas internas | Placeholder "Próximamente" en OverviewTab | Migración `Organization.internalNotes String?` + editor |
| Eliminar cliente | No implementado (sin spec de soft/hard + cascade) | Decisión de producto + migración / cascade Prisma |
| Consolidar `HoverScaleCard` | Copia local en `/admin/clients/_components/`; la original live en `ActivityLog` | Mover a `@/components/ui` shared en una lane propia |

---

## Nota final

**Listo para merge a `lane/clientes`.** El merge lo coordina el chat principal.

Verificación visual en `:3000` completada por el humano antes del cierre. No se auto-confirma compilación como verificación funcional.

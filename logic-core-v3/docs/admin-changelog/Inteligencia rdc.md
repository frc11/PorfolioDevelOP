# Registro de cambios — Sector INTELIGENCIA (admin)

- **Fecha de cierre:** 2026-06-19  
- **Lanes:** `lane/intel-alertas` · `lane/intel-health` · `lane/intel-actividad`  
- **Base:** `main`  
- **Estado:** features cerradas · gates verdes (`tsc --noEmit` exit 0 · `eslint` archivos tocados exit 0\) · **pendiente: merge \+ pasada visual final**

---

## Resumen

Tres rutas independientes del panel admin, desarrolladas en worktrees aislados:

| Lane | Ruta | Qué es | Escritura |
| :---- | :---- | :---- | :---- |
| Alertas | `/admin/alerts` | Alertas del sistema (kanban PENDING/ACK/RESOLVED) | sí (ack/resolve \+ audit) |
| Health | `/admin/chatbot/health` | Health score del bot (verdict \+ latencia P50/P95) | read-only |
| Actividad | `/admin/chatbot/activity` (+ tab por-bot) | Stream de eventos del bot | read-only |

Los tres lanes **no comparten un solo archivo de código entre sí**. El único punto común es la tabla `ChatbotEvent` (data de los seeds), no código.

---

## Lane ALERTAS — `lane/intel-alertas`

### Entregado

- **Lote 1:** badge `pendingAlerts` se refresca tras ack/resolve (`revalidateTag('admin-alerts-count')`); validación Zod de `alertId` en los writes.  
- **Lote 2:** seed dev de 14 alertas; hover en las 4 stat cards.  
- **Lote 3:** filtro de fecha client-side (presets \+ personalizado, default "Última semana"); difuminado \+ overview de columna en portal (umbral configurable); hover por card sin recorte (overlay gradiente \+ z-index, sin `overflow-hidden`).  
- **Lote 4:** "Ver bot" como botón real (nav in-app con `<Link>`, no `triggerTransition` — el admin no lo usa); rango "Personalizado" en popover a la derecha; altura uniforme de columnas (cap 4 parejo).  
- **Lote 5:** hover del header de columna de borde a borde (full-bleed), solo en columnas con overview.

### Commits

`404b224` `e90a195` `e60dca4` `a665ffc` `5f73f80` `8be5a26` `31cdda7` `991e13c` `fc93652` `bc3a09a` `e415b51` `4d2f516` `a9f2d7b` `63a63a2` `7034c34` `00f7c48` `89bab08`

### Archivos

- **Propios:** `AlertsClient.tsx`, `alerts/_components/{alert-card, alert-column-overview, alert-types, alerts-filters, alerts-date-filter}`, `scripts/dev/seed-alerts.ts`, `manageAlerts.schemas.ts`.  
- **Compartido modificado:** `manageAlerts.ts` (server/admin) — agregado `revalidateTag` \+ Zod; **signatures públicas sin cambios**; importadores solo dentro de `alerts/` \+ contrato de cache con `admin/layout.tsx`.

### Decisiones

- Cap de columnas uniforme en 4 (el botón "Ver bot" igualó la altura de las cards, anulando el supuesto de "resueltas más bajas"). `VISIBLE_CAP` y `lg:min-h-[40rem]` quedan calibrables.  
- Hover de card vía `whileHover` (motion), no `:hover` CSS (coexistencia con `motion.div layout`).  
- Filtros client-side (severidad \+ fecha) sobre datos ya cargados.

### Deuda conocida

- Filtros client-side: si el volumen de alertas crece, bajar el filtrado al Server Action `listAlerts`. No urgente.  
- `alert-column-overview.tsx` replica el patrón de Leads 1:1 (no se abstrajo a compartido para no salir del scope del lane).

---

## Lane HEALTH — `lane/intel-health`

### Entregado

- **Lote 2:** seed dev de latencia (\~96 `ChatbotEvent`); hover en 4 bloques (Estado general, BD, LLM, Config) \+ hover por-fila en Variables de entorno.  
- **Lote 3:** hover en la card del chart **sin scale** (el scale desfasa el tooltip de recharts; variante local `chartCardHoverCls`); fix del `formatter` del tooltip que descartaba el label P50/P95.

### Commits

`c1dfbc9` `5590e6d` `558813c` `624d1b6` — total vs `main`: 5 archivos, \+218 / −5.

### Archivos

- **Propios:** `scripts/dev/seed-latency.{ts,md}`, `health/LatencyChart.tsx`, `health/page.tsx`.  
- **Compartido modificado:** `package.json` (+1 script `seed:latency`, aditivo).  
- **Compartidos NO tocados (verificado):** `lib/hover.ts`, `ui/*`, `prisma.ts`, `auth.ts`, `schema.prisma`, `queries.ts`.

### Decisiones

- `chartCardHoverCls` local (no se agregó al `lib/hover.ts` compartido — es específico del caso recharts).  
- `conversationId = null` en el seed (campo opcional; sin FK ordering).

### Deuda conocida — \[BAJA\] (no arreglar, por decisión)

- `getLatencyHistory.ts`: desalineación ventana/buckets (`since = now−24h` vs `emptyBuckets(24)` que cubre `now−23h…now`) → \~1h de borde se excluye silenciosamente del conteo. Impacto nulo en el chart/verdict. Fix correcto toca business-logic → mini-lote futuro si se prioriza.

---

## Lane ACTIVIDAD — `lane/intel-actividad`

### Entregado

- **Lote 2:** seed dev (63 `ChatbotEvent` \+ 3 `Conversation`); hover en la card "Eventos por día"; fix de casing del filtro de nivel (`toLowerCase` en `page.tsx` \+ `route.ts`).  
- **Lote 3:** tooltip/explicación del botón Pausar; presets de fecha (default "Última semana"); reset de filtros; "Cargar más" client-side (take 50→250, polling cap 200→300). Normalización case-insensitive del nivel **dentro del componente compartido** para robustez en ambas superficies.  
- **Lote 4:** opción "Todos" en el período; barra de filtros inline (selects angostos \+ rango personalizado a la derecha).

### Commits

`90b3c95` `3ae17ab` `2b418d2` `0f48ba7` `8fa175a` `1d6753f`

### Archivos

- **Propios:** `activity/ActivityChart.tsx`, `activity/activityFilters.ts`, `activity/ActivityDateFilter.tsx`, `activity/page.tsx`, `scripts/dev/seed-events.{ts,md}`.  
- **⚠️ Compartido modificado:** `ActivityLog.tsx` (usado por `/admin/chatbot/activity` **y** por `chatbots/[botId]/tabs/ActivityTab.tsx`) — edición **autorizada**; `route.ts` (api events, cambio aditivo).

### Decisiones

- Editar `ActivityLog.tsx` compartido (autorizado): las features mejoran ambas superficies sin romperlas.  
- Nivel normalizado dentro del componente (el loader de la tab por-bot, vetado, manda el enum en MAYÚSCULA).  
- "Cargar más" client-side sobre el pool de 250 (no se tocó `queries.ts`).  
- Anchos de filtros vía contenedores, no editando `ui/Select`.

### Deuda conocida

- Take de 250 fijo en el argumento; paginación server-side real requeriría sprint propio (tocaría `queries.ts`).  
- `chatbots/[botId]/page.tsx:75` manda nivel en MAYÚSCULA (mitigado en el componente, pero la fuente queda dirty).  
- Untracked en `scripts/dev/`: `intel-actividad-reporte.md`, `*-coordinacion.md`, `*-lote3-reporte.md` → decidir commitear o descartar antes del merge.

---

## Gate (los tres lanes)

| Lane | tsc \--noEmit | eslint (archivos tocados) | build |
| :---- | :---- | :---- | :---- |
| Alertas | exit 0 | exit 0 | correr post-merge |
| Health | exit 0 | exit 0 | correr post-merge |
| Actividad | exit 0 | exit 0 | correr post-merge |

`npm run lint` global da exit 1 por deuda pre-existente ajena (archivos fuera del scope de Inteligencia). Cada lane verificó exit 0 en sus propios archivos.

---

## Verificación visual

- **Humana iterativa:** sí — el desarrollo fue guiado por capturas en `:3000` ronda por ronda; Health quedó explícitamente aprobado por el humano.  
- **`visual-qa` automático:** NO corrió en ninguna sesión (preview MCP ausente toda la etapa).  
- **Recomendado antes/después del merge:** una pasada visual final consolidada de las 3 rutas \+ la **tab por-bot de chatbots** (afectada por el cambio en `ActivityLog.tsx`).

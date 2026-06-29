# develOP — Proyectos \+ Equipo (admin): registro de cambios (cierre de etapa)

Cierre del trabajo sobre los **módulos Proyectos \+ Equipo del admin** (Logic Core v3). Cubre tres tandas: el **lane/proyectos** del trabajo en paralelo, el **kanban drag-and-drop** (migración a `@dnd-kit`, post-merge) y el **bug de proyectos internos** con sus follow-ups. **Repo:** github.com/frc11/PorfolioDevelOP · **app:** logic-core-v3/ · **archivos:** `src/app/(protected)/admin/projects/**` \+ `admin/team/_actions/*`. **Fecha de cierre:** 16 de junio de 2026\.

**Por qué Proyectos y Equipo van juntos.** Son inseparables: Proyectos es dueño de las páginas/UI de tasks y horas, pero las server actions de `Task`/`OsTimeEntry` viven en `team/_actions/*` (importadas por 5 sitios de Proyectos), con revalidación bidireccional. Cualquier trabajo de tasks/time-tracking toca ambas carpetas. Por eso fueron un solo lane y un solo registro.

---

## 1\. Lane/proyectos — el trabajo en paralelo (mergeado en `b9d4475`)

Review adversarial de cierre: 13 checks (A–M), 6 agentes. Veredicto **MERGEABLE, sin bloqueantes**.

### Fix importante — proyecto interno invisible en el board

`matchesStart(null, {period:'6m'})` devolvía `false`: un proyecto interno recién creado sin monto, sin milestones, sin time entries ni mantenimiento tiene `startDate: null` (cero candidatos en `deriveProjectStartDate`). Como el filtro por defecto es 6m, la card **desaparecía** del board justo después del `router.refresh()` — parecía un "create silencioso". **Fix:** `if (!startDate) return true` en `matchesStart`. Verificado end-to-end por el escéptico independiente.

### Otros fixes del lane

- **Fuga de error de Prisma al cliente** (`deleteProject`): el catch filtraba el mensaje crudo de Prisma vía `result.error` → reemplazado por error genérico.  
- **`deriveProjectLastActivityAt` \+ `lastActivityAt`** serializado y tipado (sin consumidor en el lane todavía — base para uso futuro).  
- **Menores latentes fichados** (no bloqueantes): el botón X de `overlay-modal` saltea el guard `dismissible`; scroll-lock por instancia con orden no-LIFO; `TaskApprovalControl` no inspecciona `result.success`; `confirmingId` compartido entre board-preview y popup (glitch visual menor).

### Notas de calidad (verificadas limpias)

Multi-tenant, auth/role (los 7 actions con `requireSuperAdmin()` primera línea), Zod, enum casing (PLANNING/IN\_PROGRESS/REVIEW/COMPLETED en mayúsculas de punta a punta), cero `any`, sin `router.push` directo (solo `router.refresh()` \+ `<Link>`), DnD HTML5 con `preventDefault`/`data-no-drag`/auto-scroll con rAF limpio.

---

## 2\. Kanban drag-and-drop — migración a `@dnd-kit` (post-merge, en main)

**Objetivo:** poder arrastrar un proyecto **desde la vista expandida (overview) de una columna** hacia otra, cambiándole el estado por drag — replicando lo que Leads ya resolvió.

**Decisión de arquitectura (B): migrar el board de Proyectos de DnD HTML5 nativo a `@dnd-kit`.** Razón: para soltar en una columna del board, el overview-modal tiene que cerrarse a mitad del drag, y con HTML5 nativo desmontar el nodo fuente **aborta el drop de forma no confiable** entre navegadores (Chromium dispara un `dragend` sintético). Es el mismo blocker que Leads abandonó al migrar a `@dnd-kit`. El `DragOverlay` de dnd-kit desacopla el preview del estado de montaje de la fuente → fix limpio. `@dnd-kit` ya estaba instalado (entró con Leads), no fue dep nueva. El camino "mixto" (board nativo \+ dnd-kit solo en overview) se descartó: los dos sistemas no pueden soltar en los droppables del otro.

Commits (cada uno con gate verde):

- **`26a4922`** — regenerar el lock tras las deps de dnd-kit del merge.  
- **`5f86933`** — `ProjectCard` acepta props de drag \+ variante `presentational` (para el clon del `DragOverlay`).  
- **`7c17f00`** — wrappers nuevos `DroppableProjectColumn` \+ `DraggableProjectCard` (con la guarda anti phantom-click).  
- **`82a213c`** — wiring: `DndContext` \+ sensores HOLD 200/5 \+ captura del proyecto activo en `handleDragStart` \+ `DragOverlay`; quita el DnD nativo y el rAF; `project-list` controlado en `popupStatus` (lift al dueño del `DndContext`).  
- **`ab2a182`** / **`a32932c`** — hint "Mantené apretada una card para moverla de estado" \+ cursor `grab`/`grabbing` (paridad con Leads). El cursor necesitó `!important` para ganarle al `cursor-pointer` que el `<a>` del `<Link>` trae por defecto.  
- **`a83e61c`** — `id` estable en el `DndContext` para evitar un mismatch de hidratación (dnd-kit autogeneraba `aria-describedby="DndDescribedBy-N"` con número distinto entre server y client).

**Gotchas resueltos (heredados de Leads):** el drop-perdido (capturar `activeDragProject` en `handleDragStart`, no leer del evento que se vacía); el phantom-click (el HOLD resuelve el inicio del drag pero no el fin → guarda `wasDragged` \+ `onClickCapture` para que el tap post-drop no navegue al detalle); `data-no-drag` bajo pointer events (no spreadear `listeners` en el subtree del tacho); autoscroll del drag largo (el rAF nativo no dispara bajo dnd-kit → autoscroll propio de dnd-kit sobre `<main>`). La mutación sigue por `updateProjectStatus` (Zod \+ `requireSuperAdmin` \+ revalidate; sella `deliveredAt` en COMPLETED), sin inventar camino nuevo.

---

## 3\. Bug de proyectos internos \+ follow-ups (en main)

### El bug (`0dfc004`)

Crear un proyecto **sin cliente** ("Proyecto interno de develOP") fallaba con `organizationId is required — Project must belong to an organization (B11.1)`. Causa: el form manda `organizationId: null`, el Zod lo acepta (nullable), pero revienta un guard imperativo en `resolveProjectOrganization`. `Project.organizationId` es `NOT NULL` en el schema (deliberado — la migración B11.1 revirtió a propósito una previa que lo hacía nullable). **Fix a nivel action (sin tocar schema):** cuando no hay cliente, resolver la org de la agencia (slug `develop`, que ya existe por seed) y usar su id. Mismo fallback aplicado a `updateProject` y `convertLeadToProject` por consistencia. \+ criterio del badge "interno" cambiado de `organizationId === null` a "es la org develop".

### Unificación del criterio interno/cliente (`336e0df`)

El fix dejó la clasificación inconsistente: un interno (org develop) aparecía como "con cliente" en el filtro/contador, y el chip decía "Cliente portal". Causa: la condición "es interno" estaba **duplicada** en varios lugares y solo se actualizó en algunos. **Fix:** helper único `isInternalProject(project)` usado en filtro, contadores, chip y badge — una sola fuente de verdad, no condiciones repetidas.

### Presentación de internos (`251cb3a`)

Los internos mostraban el `companyName` crudo "develOP". Se cambió la **presentación** (no el dato — la org `develop` es compartida con el chatbot, intacta): dropdown del form arranca en "Seleccioná el cliente", la opción interno dice "Proyecto interno de develOP" (sin `develop` duplicado entre los clientes reales), y las cards/detalle de internos muestran "Proyecto interno de develOP" en vez de "develOP".

---

## 4\. Deuda / pendiente

- **Menores latentes del lane** (no bloqueantes): X de `overlay-modal` saltea `dismissible`; `TaskApprovalControl` sin chequeo de `result.success` (falla silenciosa); scroll-lock no-LIFO; `confirmingId` compartido (glitch visual).  
- **`updateProjectStatus` es superadmin-global** (`requireSuperAdmin`, sin filtro por `organizationId`) — comportamiento actual del board, se reusó tal cual; cualquier cambio de authz es decisión aparte.  
- **Fallback `develop` del `seed-agency-os`** está roto (el map `organizationIdBySlug` nunca recibe la key). Bug separado — la action resuelve contra la DB, no vía ese map.

---

## 5\. Estado del gate

- **`tsc --noEmit`** (binario local) → exit 0 en cada commit de las tres tandas.  
- **Lint** → limpio en los archivos tocados; sin errores nuevos.  
- **Verificación visual** (humano en :3000): drag board→board y desde-overview, cursor grab/grabbing, sin mismatch de hidratación, creación de internos sin B11.1, clasificación y presentación de internos correctas.

---

## 6\. Lecciones / notas

- **El criterio duplicado es una bomba de tiempo.** El bug de la clasificación interno/cliente salió de tener la misma condición (`=== null`) repetida en 4 lugares y actualizar solo algunos. Se resolvió extrayendo `isInternalProject` — un solo helper. Regla: si una condición de negocio aparece en \>1 lugar, helper.  
- **Presentación vs dato.** "Que diga Proyecto interno de develOP" se resolvió cambiando cómo se muestra, NO renombrando la org en la DB — porque esa org es compartida con el chatbot en producción. Distinguir siempre "cambio de etiqueta visual" de "cambio de dato".  
- **El cursor en un `<a>` necesita `!important`:** el `<Link>` renderiza un anchor con `cursor: pointer` propio que le gana a `cursor-grab`. Para drag sobre links, `!cursor-grab`.  
- **Reuso del patrón de Leads:** la migración a dnd-kit y el drag-desde-overview reutilizaron la receta de Leads (capturar en `handleDragStart`, HOLD, portal del overlay). Leer el módulo hermano como referencia evitó repetir los 2 commits de blocker.

# Changelog — Lane Project (Portal Cliente `/dashboard/project`)

**Fecha:** 2026-06-25 → 2026-06-27 · **Branch:** `lane/project` · **Commits:** S1–S6 + A7.1–A7.7

Rediseño visual y funcional del Portal Cliente `/dashboard/project` para llevarlo a paridad
visual con el panel de administración (tokens admin: glassmorphism, tipografía, hover, empties).
Además de la pulida visual se sumó selección de proyecto múltiple, tiles de datos contextuales
del proyecto, y el botón de eliminación en el detalle admin — todo sin cambios de schema.

---

## 1. Chrome / encabezado de la página

El header dejó de usar el componente genérico `PageHeader` (tipografía decorativa uppercase,
blobs de color, bordes cyan) y adoptó el token de panel del admin: fondo translúcido, borde
sutil, tipografía `font-semibold`. El pill de estado (`IN_PROGRESS`, `DONE`, etc.) se alineó
al sistema de color del admin (sky, amber, etc.). El skeleton de carga espeja fielmente el
nuevo diseño. (`e644e55`)

## 2. Cards y lista de entregas

Cada `TaskCard` (entrega del proyecto) ahora usa el token de tile del admin: bordes y
fondos neutros en lugar del diseño anterior con blur excesivo y tipografía en mayúsculas.
Los badges de aprobación ("Requiere aprobación" / "✓ Aprobado") y los chips de fecha adoptaron
el sistema de píldoras del admin (`rounded-full`, pesos y tracking normales). El resultado es
coherente con la vista de tareas del panel administrador. (`92f1218`)

## 3. Hero — progreso del proyecto

El card de progreso principal (porcentaje de avance + barra animada) pasó del diseño anterior
con `shadow-2xl`, blobs cyan decorativos y contadores `font-black` a un panel admin limpio.
El `AnimatedCounter` y la barra animada (`AnimatedProgressBar`) son primitivos FROZEN que se
reestilaron solo por `className`: el número ahora es `text-3xl font-semibold` y el subtítulo
usa la micro-label del admin (`text-[10px] uppercase tracking-[0.22em] text-zinc-500`).
La barra y su animación no se tocaron. (`e86ae3d`)

## 4. Tiles de datos del proyecto

Grilla de cuatro tiles de solo lectura bajo el hero: **Tipo de proyecto**, **Monto acordado**,
**Fecha de inicio** y **Entrega estimada**. Aportan contexto del proyecto al cliente sin requerir
que vaya al admin a buscarlo. Tipo e Inicio se derivan de los modelos relacionados (lead, hitos,
pagos) — igual que el panel admin — sin alterar el schema de base de datos. Si algún dato no está
cargado, el tile correspondiente se oculta (no aparece "null"). (`7876c02`)

## 5. Selección de proyecto múltiple (switcher)

Para organizaciones con más de un proyecto activo, aparece una barra de navegación de pills
que permite cambiar entre proyectos vía parámetro de URL (`?p=<id>`). El proyecto inicial es
el que esté `IN_PROGRESS`; si se pasa un ID inválido o ajeno, cae al fallback silenciosamente
(sin error, sin fuga multi-tenant). Con un solo proyecto, el switcher no se muestra. (`be6aa4c`)

## 6. Hover en cards de entregas

Las cards de entregas ahora tienen el mismo efecto de hover del admin: escala sutil, anillo
blanco y sombra suave. Se implementó con el helper `adminHoverCls` de la lib compartida,
siguiendo el patrón split-wrapper (CSS hover en un div externo, animación de entrada en el
`motion.div` interno) para que no interfieran entre sí. El reveal de la descripción al hover
y los botones de aprobación se preservaron. (`8c71ec1`)

## 7. Admin: eliminar proyecto desde el detalle

El detalle admin de cada proyecto (`/admin/projects/[id]`) ahora incluye una sección "Zona de
peligro" con un botón de eliminación. Al clickear abre un modal de confirmación; al confirmar,
ejecuta la acción `deleteProjectAction` (Server Action ya existente, con guard `SUPER_ADMIN` y
redirect server-side a `/admin/projects`). No se creó ninguna acción nueva ni se modificó el
guard. (`5733e29`)

## 8. Pulida: fullwidth, banner y empties

Cuatro ajustes menores sobre el resultado verificado de S1–S6:

- **Fullwidth en `/dashboard/project`:** se quitó el constraint local `max-w-5xl` para que la
  grilla de tiles y la lista de entregas usen todo el ancho disponible, igual que el admin.
  La pantalla de "sin proyectos" se mantuvo centrada (mensaje único, sin grillas). (`fe89c1b`)
- **Bug del banner de aprobación:** el botón "Ver ahora" llevaba siempre al tab "En curso",
  pero las entregas pendientes de aprobación tienen estado `DONE` y viven en "Completadas".
  Ahora deriva el tab destino del lugar donde realmente está la tarea. (`32caad8`)
- **Loading del detalle admin:** el skeleton de carga tenía un `max-w-7xl` que no coincidía
  con el contenido real (fullwidth). Se alinearon. (`f5b1b28`)
- **Empties sin tinte teal:** varios estados vacíos mostraban el ícono con un glow teal
  (del primitivo `ui/EmptyState`) que leía como verde sobre el fondo ambiente del shell.
  Se hand-rollearon en sus archivos propios (`ProjectEmptyState.tsx` en el cliente y el
  empty por-columna de `task-list.tsx` en el admin) para usar un contenedor de ícono
  transparente, sin acento de color. (`962a61c`, `4954b6f`, `d727cb5`)

---

## Notas para el merge / pendientes

**Merge:** lo realiza Valentino desde `lane/project` a `main`. La verificación visual fue
delegada a Valentino en cada sprint (el MCP de preview estuvo ausente en la corrida headless).

**Pendientes identificados (no críticos, fuera de scope de este lane):**

- El empty "Sin proyectos" en `page.tsx` (cuando la organización no tiene proyectos asignados)
  usa el mismo patrón de ícono con tinte teal (`FolderOpen` + overlay cyan). No se tocó porque
  no era el empty señalado; si se quiere consistente, es un cambio de 1 línea en `page.tsx`.
- Los otros dos `<EmptyState>` de `task-list.tsx` (lista completa sin tareas + registros de
  tiempo) aún consumen el primitivo frozen y tienen el mismo glow. No eran las columnas
  objetivo; si se quiere unificar, aplica el mismo hand-roll.
- Tono de `bg-zinc-950/70` en el empty por-tab del cliente: elegido con margen de seguridad
  (no pude verificar visualmente). Si resultara visualmente muy oscuro, se ajusta subiendo la
  opacidad 1 token.

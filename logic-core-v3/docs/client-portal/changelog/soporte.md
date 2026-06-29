# Changelog — Soporte (Portal Cliente) + Chat Compartido

> Sección `/dashboard/soporte`. Centro de soporte del cliente: tickets + chat por
> ticket. Incluye el componente transversal **ClientChatThread** (chat compartido
> Mensajes ↔ Ticket).
> Estado: **cerrada y mergeada a main.**

---

## SOPORTE

### Consolidación de actions (deuda técnica)
- 3 sets de actions de tickets consolidados en `lib/tickets/{actions,schemas}.ts`.
  - Responder NO cambia el status del ticket.
  - Toda respuesta del admin dispara email al cliente.
- Borrados los dead files: `actions/ticket-actions.ts`, `lib/actions/tickets.ts`.
- Schemas de ticket removidos de `lib/actions/schemas.ts`.

### Badges en el admin (paridad inversa)
- El ticket del cliente mostraba más datos (categoría + prioridad) que el admin.
  Se llevaron esos badges también al admin de tickets (lista + detalle), con pulse
  en URGENT. Cross-rol, sin cambiar lógica.

### Rediseño a 3 columnas estilo pipeline admin
- La lista de tickets pasó de grid de cards oscuras/cuadradas a **3 columnas**
  (Abiertos / En curso / Resueltos), estilo el pipeline de Leads del admin.
- Cada columna con header de color (tinte por columna), cards con estética admin
  (no el cuadrado oscuro).
- Componente: `SoporteBoard.tsx` (renombrado desde `SoporteTabsClient.tsx`).

### Fade "Ver más" + overview por columna
- Cada columna muestra máximo 2 tickets. Si hay más, el 2º se desvanece con un
  **fade suave** (mask/gradiente que se funde con el fondo real de la columna,
  esquinas redondeadas, NO banda negra dura) + pill "Ver más (N)".
- Click en el header de columna O en "Ver más" → **overview modal** (portaleado a
  `document.body`) con todos los tickets de esa categoría, scroll interno.
- Referencia: el fade del pipeline de Leads del admin (no el de AlertsClient).

### No-scroll de página
- La página de Soporte (header + stat cards + 3 columnas + recursos de
  autogestión) entra en una pantalla SIN scroll de página.
- Mecanismo final: `lg:min-h-[calc(100svh-12.5rem)]` (min-height, no overflow-
  hidden, para no recortar recursos en laptops bajas) + cap de altura de columnas
  (`max-height` ~220px en el cuerpo, overflow al modal). Header/stats `shrink-0`,
  recursos `shrink-0` abajo.
- Iteración larga (K2 → M → N → O → P → Q): el no-scroll costó varios pasos porque
  depende de la altura exacta del viewport. La solución estructural (calc) fue lo
  que lo cerró, no recortar px.

### Hover acotado
- El hover de las cards pasó de `scale-[1.02]` (que sacaba el borde fuera de la
  columna) a `adminHoverCls` calibrado para no desbordar el padding de la columna.

### Otros pulidos
- Full-width, hover en los 3 stat cards, botón "Abrir nuevo ticket" sin glow
  (Button variant primary), empty state "TODO EN ORDEN" atenuado.

---

## CHAT COMPARTIDO (componente transversal)

> **Decisión de arquitectura clave de esta ola.**

### El problema
Mensajes-cliente y el chat del Ticket-cliente eran componentes separados que se
venían puliendo a mano para que se vieran iguales. Loop infinito de "este no quedó
igual al otro". El admin ya resuelve esto teniendo UN mismo lenguaje de chat para
Mensajes y Tickets.

### La solución
Se extrajo un componente de UI reusable a partir del `MessageThread` ya pulido:
- **`ClientChatThread.tsx`** — shell presentacional con slots (header / subHeader /
  emptyState / composer), scroll interno, auto-scroll.
- **`ChatBubble.tsx`** — burbuja canónica, extraída 1:1.
- **`ClientChatComposer.tsx`** — el composer (emoji + textarea + enviar).
- `AnimatedChatBubble.tsx` eliminado (reemplazado por ChatBubble vía PresenceContext).

### Lo CRÍTICO: datos separados
- Los **datos** de un ticket y los de Mensajes están en tablas/contextos distintos,
  **NO se mezclan.** Lo único compartido es el **molde de UI.** Cada sección lo
  renderiza con SUS propios datos.
- El componente compartido NO importa Prisma, no tiene server action, no tiene
  onSend — la data entra por props desde cada sección.

### Aplicación
- **Mensajes**: migrado a `ClientChatThread` quedando byte-identical (mismo DOM,
  clases, animaciones — verificado). Pasa quick-replies + welcome como slots.
- **Ticket cliente** (`soporte/[ticketId]`): adopta el mismo molde. Burbujas L/R
  (cliente derecha, develOP izquierda), header estilo admin, composer con emoji.
  "Marcar como resuelto" movido al **header** (centrado vertical), no abajo. SIN
  welcome/quick-replies (exclusivos de Mensajes). Panel Timeline + detalles a la
  derecha.

### Cambios cross-rol en el admin (ver general.md)
El input del chat del ticket admin se unificó al estilo cliente, Enter envía, y se
agregó auto-scroll al enviar. Detalle en `general.md`.

---

## Pendientes / a futuro

- **Botón "volver atrás"** en el ticket (patrón global del admin) — diferido a la
  próxima ola.
- Tiempo real en tickets (polling/SSE/websockets) — feature de arquitectura aparte,
  fichada, sin diseñar.

---

## Lecciones

- **Componente compartido = paralelismo por construcción**, no a mano. Si dos
  vistas tienen que verse iguales, compartir el componente lo garantiza; replicar
  estética a mano es un loop infinito.
- **"Compartido" ≠ datos mezclados.** El molde de UI se comparte; los datos quedan
  separados (sin Prisma ni actions en el componente compartido).
- **No-scroll = calc de viewport estructural**, no recortar px a ciegas. Y `min-h`
  en vez de `overflow-hidden` para no recortar contenido en pantallas bajas.
- **Apuntar a la referencia correcta del admin**: el fade tenía que copiar el de
  Leads (pipeline-column), no el de AlertsClient. Especificar QUÉ componente del
  admin es la referencia.
- Renombrar archivos (`SoporteTabsClient` → `SoporteBoard`) aparece en el merge como
  borrado + nuevo. Normal.

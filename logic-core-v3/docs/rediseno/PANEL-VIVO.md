# TU PANEL VIVO — el mapeo (SPRINT NOCTURNO, Parte B)

Cada feature de Tu panel (`src/app/v3/_secciones/tu-panel/contenido.ts`, `TARJETAS`) deja de ser una captura quieta y pasa
a ser una demo armada con los componentes del panel de clientes que ya existe (`src/app/(protected)/dashboard`), con
datos de ejemplo locales. Este documento es el mapeo **feature → módulo → componentes**, y por cada componente si se
IMPORTA (sólo la parte visual, sin servidor ni sesión) o se COPIA a `src/app/v3/_panel-vivo/` (copia, no edición: el
dashboard no se toca), con su origen.

## Las reglas (del pedido)

- **No se modifica nada del dashboard real** ni de las zonas de Franco (OsLead*, `/leados/`, `/setter`, ActivityChannel).
  Ningún componente de esta lista importa nada de esas zonas (verificado: sólo `ChatbotLead.convertedToOsLeadId` es una
  columna del tipo).
- **Congelados** (`src/components/ui/*`, PreloaderContext, TransitionContext): sólo se consumen.
- **Nunca** se importa una server action, prisma (salvo `import type`), auth, `next/navigation` ni nada que pida sesión.
- **Cero red.** Todo con datos de ejemplo locales y la etiqueta «Ejemplo» en cada demo. **Ningún `next/link` real** se
  renderiza en una demo: en producción `<Link>` hace prefetch al entrar en pantalla, y `/dashboard/*` está detrás del
  `proxy.ts` (redirige a `/login`): sería una petición de red. Por eso todo componente que trae un `<Link>` siempre a la
  vista se COPIA con un botón local en su lugar.
- **Contenido inventado** (`_secciones/_contrato/inventado.ts`): nombres, mensajes y números claramente de ejemplo.
  **Ningún precio** (tampoco de ejemplo: «un precio inventado en una pantalla se convierte en la expectativa de alguien»):
  la columna de costo de las conversaciones, el monto del proyecto y los precios de los módulos se van.
- **Carga diferida y pausa**: cada demo se descarga y se monta cuando su tarjeta entra en pantalla, y se pausa al salir.
  Con movimiento reducido no se mueve sola: se avanza a mano.

## Dónde vive cada cosa

| Lugar | Qué |
|---|---|
| `src/app/v3/_panel-vivo/` | la carpeta de las demos (fuera de `_secciones/`: no es una sección, y su código importa del dashboard, que el lane de las secciones no permite) |
| `_panel-vivo/catalogo.ts` | qué demo va en cada tarjeta y qué ítem del panel se marca |
| `_panel-vivo/DemoDelPanel.tsx` | la carga diferida (un `import()` por demo), la miniatura escalada y la pausa fuera de cuadro |
| `_panel-vivo/MarcoDelPanel.tsx` | el marco que se ve como el panel (la carcasa oscura, la barra lateral, la barra de arriba) con «Ejemplo» |
| `_panel-vivo/demos/*` | una demo por feature (su copia del dashboard, si la hay, al lado, con el origen en su cabecera) |
| `_secciones/tu-panel/Tarjeta.tsx` | la captura queda debajo (es el respaldo y el HTML del servidor); encima, la demo en miniatura |
| `_secciones/tu-panel/Ampliacion.tsx` | la ampliación muestra la demo grande, usable, en lugar de la imagen |

## El mapeo

Rutas relativas a `src/`. `DASH` = `app/(protected)/dashboard`. Veredicto: **IMPORTA** (se usa tal cual, sólo props) ·
**COPIA** (a `_panel-vivo/`, con el motivo).

### 1 · «Revisá cada conversación de tu chatbot» (Chatbot)

Módulo: `/dashboard/chatbot/conversations` — `DASH/chatbot/conversations/page.tsx` (servidor), con el encabezado y las
pestañas de `DASH/chatbot/layout.tsx`.

| Componente | Origen | Veredicto |
|---|---|---|
| `ConversationsTable` + `TranscriptDetail` | `modules/chatbot/components/dashboards/ConversationsTable.tsx` | COPIA: la columna «Costo» muestra dólares (sin precios), el transcript se pinta de una vez (la demo lo despliega mensaje a mensaje) y el estado vacío trae un `<Link>` |
| `PageHeader` | `components/ui/PageHeader.tsx` | IMPORTA |
| `ClientDashboardTabs` | `modules/chatbot/components/dashboard/ClientDashboardTabs.tsx` | COPIA: la pestaña activa sale de `usePathname` y cada pestaña es un `<Link>`; en la demo, las pestañas cambian de vista adentro |
| el «escribiendo…» | el widget público, `modules/chatbot/components/chat/ChatWindow.tsx` (los tres puntos) | COPIA del marcado (no está exportado y su avatar carga lienzos pesados) |

### 2 · «Recibí los leads ya calificados que consultaron tu página» (Leads)

Módulo: `/dashboard/chatbot/leads` — `DASH/chatbot/leads/page.tsx` (servidor: puntaje con el decaimiento, plan).

| Componente | Origen | Veredicto |
|---|---|---|
| `CLASS_ORDER`, `CLASS_META`, `groupByClassification` | `modules/chatbot/components/dashboard/lead-pipeline/classes.ts` | IMPORTA (las listas: Calientes, Tibios, Fríos) |
| `LeadPipelineColumn` | `.../lead-pipeline/LeadPipelineColumn.tsx` | IMPORTA (la columna, con `renderCard`) |
| `LeadPipeline` | `.../lead-pipeline/LeadPipeline.tsx` | COPIA: trae la tarjeta con la server action y un `href` a `/dashboard` |
| `BusinessLeadCard` | `modules/chatbot/components/dashboard/BusinessLeadCard.tsx` | COPIA: `LeadStatusActions` llama a `updateLeadStatus` (server action) y la tarjeta entera es un `<Link>` |
| `LeadStatusActions` | `.../LeadStatusActions.tsx` | COPIA (las acciones de un toque, con estado local) |
| `LeadDetail` | `.../LeadDetail.tsx` | COPIA: guarda con `updateLeadStatus`; en la demo, el detalle se abre adentro |
| `intentLabel`, `OWNER_ACTION_STATUS` | `modules/chatbot/lead-intent-labels.ts`, `lead-status-rules.ts` | IMPORTA (puros; Prisma sólo en tipos) |

### 3 · «Creá tickets para que cambiemos lo que necesites» (Soporte)

Módulo: `/dashboard/soporte` — `DASH/soporte/page.tsx` (servidor); acciones en `lib/tickets/actions.ts` (`'use server'`).

| Componente | Origen | Veredicto |
|---|---|---|
| `SoporteBoard` (`TicketColumn`, `TicketCard`) | `components/dashboard/SoporteBoard.tsx` | COPIA: cada tarjeta es un `<Link>` a `/dashboard/soporte/:id` |
| `NewTicketModal` | `components/dashboard/NewTicketModal.tsx` | COPIA: `createTicketAction` (server action) y `router.push`; el formulario y su validación (Zod en el cliente) quedan, y el envío agrega el ticket a la lista sin mandar nada |
| `StatCard`, `PageHeader`, `Button`, `Select`, `Modal` | `components/ui/*` | IMPORTA |

### 4 · «Chateá con nosotros directo, por lo que sea» (Soporte)

Módulo: `/dashboard/messages` — `DASH/messages/page.tsx` (servidor); envío en `lib/actions/messages.ts` (`'use server'`).

| Componente | Origen | Veredicto |
|---|---|---|
| `ChatBubble` | `components/dashboard/ChatBubble.tsx` | IMPORTA |
| `ClientChatComposer` | `components/dashboard/ClientChatComposer.tsx` | IMPORTA, con un envoltorio que le da el valor, el estado y una acción local |
| `MessageThread` | `components/dashboard/MessageThread.tsx` | COPIA: envía con `sendClientMessageAction` y lee `useSearchParams` |
| `ClientChatThread` | `components/dashboard/ClientChatThread.tsx` | COPIA: hace `scrollIntoView` (movería la página de atrás); en la demo baja adentro de su caja |
| las respuestas rápidas | `lib/data/message-context.ts` | IMPORTA (puro) |

### 5 · «Pedí servicios nuevos a medida que los sumamos» (Servicios)

Módulo: `/dashboard/services` — `DASH/services/page.tsx` (servidor); estados en `lib/modules/showroom.ts`.

| Componente | Origen | Veredicto |
|---|---|---|
| `PremiumModuleCard` | `components/dashboard/PremiumModuleCard.tsx` | COPIA: `requestUpsellAction` (server action), `window.location.assign` y el precio por mes (sin precios) |
| `ServiceDetailModal` | `components/dashboard/ServiceDetailModal.tsx` | IMPORTA (si la demo lo usa) |
| `classifyModuleState`, `ShowroomState` | `lib/modules/showroom.ts` | IMPORTA (puro) |

### 6 · «Mirá el resumen de tu proyecto» (Proyecto)

Módulo: `/dashboard/project` — `DASH/project/page.tsx` (servidor; el marcado del resumen está en la página misma).

| Componente | Origen | Veredicto |
|---|---|---|
| el resumen (encabezado, avance, las fichas) | `DASH/project/page.tsx` | COPIA del marcado (es JSX de una página de servidor); sin «Monto acordado» (sin precios) |
| `AnimatedProgressBar`, `AnimatedCounter` | `components/dashboard/*` | IMPORTA |
| `ProjectTaskTabs`, `TaskApprovalButtons` | `components/dashboard/*` | COPIA: aprobar y rechazar son server actions; en la demo, estado local |

### 7 · «Seguí tus resultados» (Resultados)

Módulo: `/dashboard/resultados/trafico` — `DASH/resultados/trafico/page.tsx` (servidor: Google Analytics).

| Componente | Origen | Veredicto |
|---|---|---|
| `AnalyticsMetricCard` | `components/dashboard/AnalyticsMetricCard.tsx` | IMPORTA |
| `SessionsChart` | `components/dashboard/SessionsChart.tsx` | IMPORTA (recharts: llega sólo con esta demo) |
| `ResultadosTabs` | `components/dashboard/ResultadosTabs.tsx` | COPIA: la pestaña activa sale de `usePathname` |
| la composición (las métricas, el gráfico) | `DASH/resultados/trafico/page.tsx` | COPIA del marcado |

### 8 · «Configurá cómo responde tu chatbot» (Chatbot)

Módulo: `/dashboard/chatbot/knowledge` (pestaña «Información») — `DASH/chatbot/knowledge/page.tsx` (servidor).

| Componente | Origen | Veredicto |
|---|---|---|
| `ClientKnowledgeView` | `modules/chatbot/components/dashboard/ClientKnowledgeView.tsx` | COPIA: su llamado «¿Necesitás actualizar algo?» es un `<Link>` siempre a la vista |
| `Card`, `Section` | `components/ui/*` | IMPORTA |
| el encabezado y las pestañas del chatbot | ver la feature 1 | (las mismas) |

**Ninguna feature quedó sin su módulo real.** Lo que no se pudo, si hay algo, está al final.

## Lo que quedó

Las ocho tienen su demo (commits B1 07d31058 · B2 ad493b87 · B3 3788e401 · B4 fa2d6afa · B5 49edb3af · B6 4af921a3 ·
B7 3f2f0534 · B8 bd683268, más f487b7b1, 5e26006a y 7b9cc020: la miniatura corre cinco segundos por entrada y queda
quieta del todo). Lo que no se pudo o quedó afuera, y por qué:

- **El botón de emojis del chat**: `EmojiPopover` abre su selector en un portal al `body` (z 210), por debajo de la
  ampliación (z 10000): no se vería. El campo del chat es el real sin ese botón.
- **Los modales que son portales al `body`** quedarían detrás de la ampliación: la vista general de una lista de leads
  o de tickets va en lugar de las columnas; el formulario de ticket nuevo y el detalle de un módulo van encima, ADENTRO
  del marco de la demo (`MarcoDelPanel`, prop `encima`), con Escape para cerrarlos (el formulario, además, atrapa el
  foco). Por lo mismo, los selects del formulario de ticket son los nativos (el `Select` de `components/ui` abre su
  lista en un portal).
- **Pestañas sin demo**: en el chatbot, Overview, Configuración (`BotPersonalization` carga avatares 3D y guarda con una
  server action) e Instalación quedan como texto; en Resultados, SEO, Reputación y Análisis dicen qué muestran en el
  panel. En la barra lateral, Inicio, Mi plan, Recomendá y ganá y Mi cuenta no llevan a ninguna demo.
- **Sin «Exportar»** en los leads (descarga de la API) ni el aviso de vista previa de Resultados.
- **Sin precios ni cifras reales de develOP**: la columna «Costo», «Monto acordado», el precio por mes de los módulos,
  el tiempo de respuesta del panel y la fecha de lanzamiento escrita a mano en los módulos.

En el teléfono: la misma demo, con el diseño del propio panel en celular (la grande ocupa el alto de la pantalla; la
tabla de conversaciones, sin tokens ni ruta abajo de `sm`).

Visto en el panel real, no tocado: `ConversationsTable` muestra la intención del lead en crudo («(HUMAN_REQUEST)»; la
demo usa `intentLabel`), y `LeadDetail` sólo muestra los roles en minúscula en su charla (lo anota su propio código).

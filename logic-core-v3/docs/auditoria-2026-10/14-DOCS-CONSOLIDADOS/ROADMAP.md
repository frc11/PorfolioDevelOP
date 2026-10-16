> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Roadmap

> **Borrador E11 · esqueleto** · base `57c421bc` · destino propuesto `logic-core-v3/docs/ROADMAP.md`.
> La fuente del alcance es `docs/auditoria-2026-10/06-ATLAS/atlas.curado.json` (abajo, `curado`). El backlog se completa después, desde el backlog de la auditoría; acá queda la estructura y el insumo heredado ya verificado. Esta página se regenera cuando cambie el curado: no se edita a mano.
> Fuentes: rutas relativas a `logic-core-v3/`; `drive:` = `docs/_insumos/drive/` (copias sin trackear). **[A DECIDIR]** = contradicción sin resolver.

## 1. Cómo se lee

- El campo `alcance` lo deciden Valentino y Franco; la auditoría solo llenó `alcance_propuesto`, con su razón en `notas` (curado:3). Hoy los 496 nodos tienen `alcance: sin-decidir` y las 51 herramientas tienen `veredicto: decidir`.
- Criterio de la propuesta **1.0**: camino del cliente o de la operación diaria que el primer cliente real necesita (acceso, portal, chatbot, admin básico, contacto y baja de emails); el setter entra porque la operación comercial ya corre sobre él (curado:10).
- Criterio de **después**: módulo premium, panel mono-bot o herramienta interna que el primer cliente no necesita para arrancar (curado, notas de los nodos `despues`).
- Conteo de nodos (herramientas y funcionalidades): 387 en `1.0`, 92 en `despues`, 17 en `descartado`.

## 2. Alcance propuesto por herramienta

### 2.1 Propuestas para 1.0 (36 herramientas)

| Zona | Herramientas | Líneas en el curado |
|---|---|---|
| Acceso | h1.auth-login, h1.auth-recupero, h1.auth-cambio, h1.auth-invite, h1.auth-impersonacion | :5, :12, :19, :26, :33 |
| Portal | h2.cli-bienvenida, h2.cli-shell, h2.cli-inicio, h2.cli-proyecto, h2.cli-resultados, h2.cli-servicios, h2.cli-mensajes, h2.cli-soporte, h2.cli-plan, h2.cli-cuenta, h2.cli-reportes-email | :40, :47, :54, :61, :68, :75, :82, :89, :96, :110, :117 |
| Chatbot | h3.cli-chatbot, h3.adm-chatbots, h3.vis-widget-cliente, h3.vis-api-chatbot, h3.vis-widget-develop | :152, :159, :180, :187, :194 |
| Admin | h4.adm-shell, h4.adm-dashboard, h4.adm-clientes, h4.adm-proyectos, h4.adm-tickets, h4.adm-mensajes, h4.adm-alertas, h4.adm-config | :208, :215, :222, :229, :250, :257, :278, :285 |
| Setter | h5.set-dia, h5.set-nuevo, h5.set-importar, h5.set-lead, h5.set-manual | :299, :306, :313, :320, :327 |
| Sitio | h6.vis-contacto, h6.vis-optout | :348, :355 |

### 2.2 Propuestas para después (14 herramientas)

h2.cli-referidos (:103), h2.cli-resenas (:124), h2.cli-email-mkt (:131), h2.cli-tienda (:138), h2.cli-agenda (:145), h3.adm-actividad (:166), h3.adm-health (:173), h3.vis-whatsapp (:201), h4.adm-equipo (:236), h4.adm-leads (:243), h4.adm-novedades (:264), h4.adm-referidos (:271), h4.adm-audit (:292), h5.adm-revision-demos (:334).

- **[A DECIDIR]** h5.adm-revision-demos queda en «después» mientras el setter va a 1.0, y el link de la demo solo sale con la demo APROBADA en esa revisión (src/lib/leados/flow.ts:92).
- **[A DECIDIR]** Los 4 módulos premium que el código vende como ACTIVE quedan en «después» (VISION.md §4.3).

### 2.3 Propuesta de descarte

- Herramienta: h5.adm-fg2lab (:341), «experimento (FG-2 Lab)». **[A DECIDIR]** correr el experimento o borrarlo.
- Funcionalidades propuestas como descartadas dentro de herramientas que van a 1.0: h2.cli-bienvenida.guardar-perfil-legacy, h2.cli-reportes-email.pdf-reporte-ejecutivo, h2.cli-shell.notificaciones, h2.cli-mensajes.enviar-mensaje, h2.cli-servicios.activacion-modulo-premium, h3.adm-chatbots.preflight-activacion, h3.cli-chatbot.gestionar-insights, h3.adm-chatbots.email-prueba-notificacion, h4.adm-clientes.redireccion-chatbot-legacy, h4.adm-leads.demos, h4.adm-clientes.servicios-contratados, h4.adm-equipo.invitar-miembro, h6.vis-contacto.atribucion-referido, h5.set-dia.cartera-vistas-y-filtros, y dos nodos de fg2lab (curado, nodos con `alcance_propuesto: descartado`).

## 3. Hitos

| Hito | Criterio de salida | Fuente del criterio | Estado |
|---|---|---|---|
| 1.0 — primer cliente real | Herramientas con `alcance: 1.0` en la madurez acordada | curado (por decidir) | sin decidir |
| Después | Herramientas con `alcance: despues` | curado | sin decidir |

- **[A DECIDIR]** El criterio viejo para firmar v1.0.0 era «Matsu usándolo 30 días en producción» (docs/bitacora-roadmap.md:9694-9705; docs/operations/b14-deploy-checklist.md:325-332); `package.json:3` sigue en 0.1.0.

## 4. Backlog (a completar)

Estructura prevista: una sección por zona del Atlas (h1 a h6) y una transversal (plataforma, seguridad, datos). Cada ítem lleva: id del hallazgo, herramienta del Atlas, alcance, dueño (Valentino, Franco o zona de Franco) y criterio de disparo.

> Pendiente: se llena desde el backlog de la auditoría 2026-10. No se copian acá los backlogs viejos; el §5 es solo insumo para cruzar.

## 5. Insumo heredado (verificado contra `57c421bc`)

### 5.1 Lo que espera a Franco

| Ítem | Estado | Evidencia |
|---|---|---|
| Purga del secret de la historia y force-push (B0.6) | no empezado | docs/bitacora-roadmap.md:45-48; `git log --all -- logic-core-v3/enviroment.env` |
| Cargar los secrets del backup y validar el primer run (B14.3) | no empezado (gh, 2026-10-15: 140 corridas fallidas y 0 secrets; BUG-171) | docs/bitacora-roadmap.md:9527-9532; atlas:arquitectura.md:75 |
| `NEXT_PUBLIC_SENTRY_DSN` en Netlify | sin verificar (según la bitácora, inactivo en 2026-08; VH-135) | docs/sprints/infra-1-observabilidad.md:69; docs/bitacora-roadmap.md:17135 |
| Precio del Motor de Reseñas | no empezado | docs/sprints/p3-a-2-venta.md:153; LockedView.tsx:151 |
| 4 URLs de herramientas del setter | no empezado | src/lib/leados/herramientas.ts:63, 78, 90, 117 |
| Experimento FG-2 | no empezado | docs/bitacora-beta.md:1556-1562; docs/experimentos/fg2-brief-experimento.md:166-201 |
| Aviso de Telegram con PII de visitantes | no empezado | docs/privacidad-afirmaciones-cliente.md:58-66; docs/bitacora-roadmap.md:16897 |
| Carril de seguridad RT-2, RE-13, RE-16, RE-7, RT-13, CO-7 + PD-1, A.4 | sin verificar | docs/roadmap-pendientes.md:175 |
| Onboarding real de Matsu y firma de versión | parcial | STATUS.md:174-180; docs/bitacora-roadmap.md:9707-9718 |
| Cal.com en NULL en las 16 orgs | no empezado | docs/verificacion-arranque-oslead-vii.md:71-77 |

### 5.2 Runtime del chatbot

Hechos (no reabrir): C0.1 `navigate_to_page` solo en el bot de la agencia (getTools.ts:62-82), C0.2 y C1.3 ventana y cap de 40 (historyPolicy.ts:31, 61), C0.3 modelo efectivo único (resolveEffectiveModel.ts:7-21), C3.1 corte a mitad del stream (handleChatRequest.ts:1046), C3.5 y MH.2 conversaciones degradadas no se cuentan (handleChatRequest.ts:261-300), RB.1 P2002 como éxito (resolver.ts:116-132; captureLead.ts:560-587), RB.2 techo de historial en el server, RB.3 `onFinish` transaccional (persistTurn.ts:412), T0.1 `/smoke` eliminado (commit 02a2f812), T0.2 cron de limpieza (cleanup-old-events/route.ts:14), T0.3 `CRON_SECRET` que falla cerrado (src/lib/cron/cron-secret.ts:40-44).

Abiertos:

| Ítem | Evidencia |
|---|---|
| C1.1 nonce estable por conversación | handleChatRequest.ts:883 |
| C1.2 caps al percentil real (parcial) | historyPolicy.ts:39, 50 |
| C1.4 medir el efecto de caché | `git grep cachedContentTokenCount` vacío |
| C2.1 / E1 consultas sin responder y propuestas de KB | `git grep kbGap` vacío |
| C2.2 catálogo visual | `git grep catalog` en el módulo vacío |
| C2.3 memoria del visitante (depende de C3.2) | `git grep visitorId` vacío |
| C3.2 / A1.2 `sessionId` compuesto | prisma/schema.prisma:1375 |
| C3.3 knobs que no mienten | handleChatRequest.ts:952; ConfigTab.tsx:35-37 |
| C3.6 renombrar `checkQuota` (parcial) | quota/checker.ts:32 |
| MH.1 `orderBy` en reportes y latencias | buildWeeklyReport.ts:74-102; getLatencyHistory.ts:76-83 |
| MH.3 `messageCount` real e insights livianos | persistTurn.ts:447; generateInsights.ts:29-42 |
| MH.4 «Salud del bot» por org y su widget en el portal | `git grep botHealth` vacío |
| R1 reporte de ROI (parcial) | business-profile.actions.ts:17; home-metrics-logic.ts:93 |
| A1.8 decay del score sobre actividad real | dashboard/chatbot/leads/page.tsx:87 |
| A4.3 `/health` público que expone internos | api/chatbot/[slug]/health/route.ts:7-20; checkHealth.ts:93 |
| EST.0 shell de chat común | ChatWindow.tsx:12; ChatbotEmbed.tsx:14 |
| A5.2 descomponer `handleChatRequest` (parcial) | 1.412 líneas |
| E0 identidad del visitante y cierre de conversación; política de retención | `git grep endedAt` vacío; cleanup-old-events/route.ts:14 |
| `getActivityChartData` sin `take` | getActivityChartData.ts:12-19 |
| Render de señales para un vertical que no sea autos | prisma/schema.prisma:1477 |

Fuentes: drive:Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md; drive:Franco/Bloques a Ejecutar/CHATBOT/ROADMAP-MEJORA-post-auditoria.md; drive:Franco/Bloques a Ejecutar/CHATBOT/DERIVACION-chat-panel.md; docs/consolidacion-planoA-runtime.md.

### 5.3 LeadOS (zona de Franco)

- Trabajo de OSLead VII reportado como hecho y ausente del repo (P43, M14, calibración, M1, G2, F1–F4): ver LEADOS.md §6. **[A DECIDIR]**.
- Hallazgos adversariales abiertos en la base: H-01 doble formulario en m6 (dossier.schemas.ts:93), H-02 autosave apagado (brief-form.tsx:85, 115), H-06 m13 congela el link en RECHAZADA (m13-borrador.tsx:118-122), H-07 falta el control «¿Exportaste después del último refinamiento?» (dossier.schemas.ts:129), H-08 gate de decisor solo al confirmar (agenda.schemas.ts:9-13), H-09 Cal.com con más de una org (agenda.ts:70-81), S7 rótulo «Contexto del lead» (pantalla-manual.tsx:205) (drive:Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md).
- Baches del recorrido del 31 de agosto, B1 a B9 (docs/corrida-recorrido-2026-08-31/REPORTE.md:51-260), y los vivos de docs/manual-usuario/BACHES-RE-VERIFICADOS.md y HALLAZGOS-MANUAL-v3.md (H-00 a H-17).
- Manual y galería desfasados por P11: regenerar (docs/verificacion-arranque-oslead-vii.md:52-56, 440-446).
- Piloto demo-first: no hay evidencia de que se haya corrido (docs/PILOTO-DEMO-FIRST.md).

### 5.4 Portal y admin

- `/dashboard/plan` sin `error.tsx` (docs/client-portal/changelog/plan.md).
- Leads de toda la agencia en Inicio: `week-results.ts:42-50` cuenta `ContactSubmission` sin `organizationId` (docs/client-portal/changelog/inicio.md).
- `ACTIVITY_LOG` falso en la Bóveda (boveda/page.tsx:53; docs/client-portal/relevamiento-global.md:613-674).
- Orden persistente del kanban (`pipelineOrder`) (docs/admin-changelog/Leads rdc.md:47).
- Color por ruta (`resolveAccentColor`) sin cablear (raíz:lane-LOG.md:134-142).
- Buckets desalineados en `getLatencyHistory` (docs/admin-changelog/Inteligencia rdc.md:80).
- `updateTimeEntry` sin guard de pertenencia y `updateProjectStatus` global (docs/admin-changelog/Equipo rdc.md; docs/admin-changelog/Proyectos rdc.md:66-68).
- Ideas: cerrar lead → cliente con vínculo duro, Inteligencia per-tenant, Route B del preloader (drive:Olme/Ideas de nuevas features.md).

### 5.5 Backlog viejo con condición de disparo

- Borrar índices sin uso: recién con la prod viva al menos 2 semanas y `pg_stat_reset` previo (docs/roadmap-pendientes.md:94-101).
- Cron de retry del CRM: cuando haya volumen (docs/roadmap-pendientes.md:9-14).
- El resto de docs/roadmap-pendientes.md se revalida contra el código antes de entrar: T0.2 ya está hecho, la vista de CRM la superó CC.2 y `vercel.json` sí existe.

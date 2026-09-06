# Manifiesto — Diagnóstico visual del ADMIN (el lado de Franco)

> Generado POR la corrida, no escrito a mano: cada fila sale del DOM y del PNG.
> Esta carpeta es **diagnóstico descartable**. No reemplaza a `docs/manual-usuario/galeria/`
> ni a `docs/diagnostico-visual-2026-08/` (la corrida del setter), que no se tocaron.

## Cabecera

| | |
|---|---|
| Base (commit) | `cbfaa27f14121a294b7ad72565ab361072ecb166` |
| Worktree | `C:/tmp/wt-corrida-admin` — **propio**, detached sobre la base |
| Build | producción, `E2E_DIST_DIR=.next-corrida-admin`, exit 0 |
| Puerto | `127.0.0.1:3022` (propio; no 3000/3001/3003/3004/3005/3006/3013 ni el 3021 de la corrida del setter) |
| Viewport | **1440 × 900**, desktop, `deviceScaleFactor: 1` |
| Login | JWT minteado client-side, leído de `tests/helpers/setter-auth.ts`; personas `admin@develop.com` y `setter-qa@develop.test` |
| Animaciones | congeladas por CSS inyectado post-carga (no se tocó fetch) |

### Estado de la base al capturar (Paso 1)

| | antes de los seeds | después (lo que retratan las fotos) |
|---|---|---|
| Leads total / del setter QA / sin asignar | 111 / 76 / 7 | **111 / 76 / 7** |
| Novedades del setter QA: total / sin leer / huérfanas | 3 / 3 / 0 | **3 / 3 / 0** |
| Dossiers en la cola de Franco (`EN_REVISION`) | 13 | **13** |
| Fixtures QA-W / QA-M | 13 / 4 | **13 / 4** |
| Escalamientos vivos ("me trabé") | 1 | **1** |

Reparto de stages al capturar: `FICHA` 13 · `EVALUADA` 22 · `BRIEF` 4 · `CONSTRUCCION` 15 · `EN_REVISION` 13 · `APROBADA` 15 · `RECHAZADA` 6 · `DESCARTADA` 4.

La limpieza de novedades huérfanas del setter QA (`leadId = null`) corrió y fue **no-op**:
0 antes → 0 borradas → 0 después (la corrida del setter ya las había limpiado).

### Cómo se esquivó la trampa del fold

El shell del admin es `fixed inset-0` (`AdminLayoutClient.tsx:30`) y el scroller es el
`<main class="absolute inset-0 overflow-y-auto">` interno (`:99`) — la misma trampa que el
shell del setter. **No se usó `fullPage` en ninguna toma.** Para las `-full` se midió el alto
real del contenido del `<main>` y se agrandó el *viewport* a `scrollHeight + cromo`, iterando
hasta que el contenedor deja de scrollear. Las dimensiones de cada PNG se leen del **IHDR** del
archivo, no de lo que se pidió. Cuando el contenido ya entraba en el fold **no se emitió `-full`**,
para no fabricar un duplicado byte a byte del `-fold`.

## Los tres chequeos obligatorios

**1 · md5 duplicados** — colisiones: **0**.

Ningún par de PNG comparte md5.

**2 · Cobertura de rutas** — 32/34 rutas UI del admin con captura.

| ruta sin captura | superficie |
|---|---|
| `/admin/clients/[clientId]/chatbot` | Redirect legacy (sin UI) |
| `/admin/projects/[projectId]/hours` | Horas |

**3 · `-full` capadas por el fold** — **0**.

Ninguna captura tiene la altura del viewport (900 px) con contenido que la exceda.

**Nota — 12 capturas no convergen, y la causa es del diseño, no del método.**

Todas son la misma superficie, `/admin/leados/[leadId]`. Su columna izquierda (el preview
de la demo) es `xl:sticky` con `xl:h-[calc(100vh-12.5rem)]` (`page.tsx:218`) y el `<iframe>`
adentro es `h-[60vh] xl:h-full` (`:240`). Al agrandar el viewport esa columna **crece 1:1**,
así que el faltante se mantiene constante y no existe una captura "página completa" canónica:
cada píxel de viewport que se agrega, se lo lleva el preview. Las capturas muestran el
contenido de los paneles con el faltante que se indica.

| captura | contenido | visible | falta |
|---|---|---|---|
| `02-leados-detalle-en-revision-full.png` | 2429 px | 2236 px | 193 px |
| `03-leados-rechazo-vacio.png` | 2429 px | 2236 px | 193 px |
| `04-leados-rechazo-completado.png` | 2429 px | 2236 px | 193 px |
| `05-leados-aprobar-vacio.png` | 2429 px | 2236 px | 193 px |
| `06-leados-aprobar-completado.png` | 2429 px | 2236 px | 193 px |
| `07-leados-detalle-aprobada-con-link.png` | 2407 px | 2179 px | 228 px |
| `08-leados-detalle-aprobada-sin-link.png` | 2407 px | 2179 px | 228 px |
| `09-leados-detalle-rechazada.png` | 2705 px | 2477 px | 228 px |
| `PAR-1-rechazar-admin-antes.png` | 2213 px | 2063 px | 150 px |
| `PAR-1-rechazar-admin-despues.png` | 2661 px | 2433 px | 228 px |
| `PAR-2-aprobar-admin-antes.png` | 2213 px | 2063 px | 150 px |
| `PAR-2-aprobar-admin-despues.png` | 2407 px | 2179 px | 228 px |

## Las capturas

`scroll/visible` = alto del contenido del `<main>` vs alto visible, medidos en el DOM al disparar.

| # | archivo | superficie · ruta | estado leído de la base | dim (IHDR) | modo | mut | scroll/visible | md5 |
|---|---|---|---|---|---|---|---|---|
| 1 | `01-leados-cola-fold.png` | Cola de revisión<br>`/admin/leados` | 13 dossiers EN_REVISION · 1 setter trabado | 1440×900 | fold | no | 8662/756 | `0d8a5e69c9ff` |
| 2 | `01-leados-cola-full.png` | Cola de revisión<br>`/admin/leados` | 13 dossiers EN_REVISION · 1 setter trabado | 1440×8814 | full | no | 8670/8670 | `3b01fec571c4` |
| 3 | `02-leados-detalle-en-revision-fold.png` | Dossier en revisión<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · draftUrl presente · self-check exigible | 1440×900 | fold | no | 1625/756 | `47dd9fb2f5b6` |
| 4 | `02-leados-detalle-en-revision-full.png` | Dossier en revisión<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · draftUrl presente · self-check exigible | 1440×2380 | full | no | 2429/2236 | `6e86d82bc02c` |
| 5 | `03-leados-rechazo-vacio.png` | Modal de rechazo (vacío)<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · modal abierto, 3 campos vacíos | 1440×2380 | full | no | 2429/2236 | `616b1f43d0bb` |
| 6 | `04-leados-rechazo-completado.png` | Modal de rechazo (completado)<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · modal con los 3 campos escritos, SIN enviar | 1440×2380 | full | no | 2429/2236 | `26ce57f1950c` |
| 7 | `05-leados-aprobar-vacio.png` | Modal de aprobación (vacío)<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · modal abierto, URL permanente vacía | 1440×2380 | full | no | 2429/2236 | `91700eb32512` |
| 8 | `06-leados-aprobar-completado.png` | Modal de aprobación (completado)<br>`/admin/leados/cmqb33b0400019fvklbgoc55q` | EN_REVISION · URL permanente escrita, SIN enviar | 1440×2380 | full | no | 2429/2236 | `d861a9b69137` |
| 9 | `07-leados-detalle-aprobada-con-link.png` | Dossier aprobado (con link)<br>`/admin/leados/cmr035eyw000t9fl8qzhjluhh` | APROBADA · finalUrl presente · sin barra de decisión | 1440×2323 | full | no | 2407/2179 | `af83cf15bf33` |
| 10 | `08-leados-detalle-aprobada-sin-link.png` | Dossier aprobado (sin link)<br>`/admin/leados/cmr035f3q000x9fl84hnv2s8b` | APROBADA · finalUrl NULL — estado que el admin no puede producir | 1440×2323 | full | no | 2407/2179 | `df1c7fff4f90` |
| 11 | `09-leados-detalle-rechazada.png` | Dossier rechazado<br>`/admin/leados/cmr035f8m00119fl8d87obbrh` | RECHAZADA · historial de rechazos | 1440×2621 | full | no | 2705/2477 | `2dde05c85218` |
| 12 | `10-leados-setter-evaluaciones.png` | Evaluaciones de un setter<br>`/admin/leados/setter/cmq9zt64w00009f54psdq8wc8` | setter-qa · 76 leads en cartera | 1440×10403 | full | no | 10259/10259 | `27fda2ef9c09` |
| 13 | `11-leados-setter-sin-datos.png` | Evaluaciones de un setter (sin datos)<br>`/admin/leados/setter/cmsndndde003q9f14vha131du` | setter M0-GAL vacío · sin evaluaciones | 1440×900 | fold | no | 756/756 | `8f19b7f193bd` |
| 14 | `12-leads-pipeline.png` | Pipeline comercial<br>`/admin/leads` | 111 leads · tab outbound | 1440×2462 | full | no | 2318/2318 | `396f67777f9e` |
| 15 | `13-leads-inbound.png` | Pipeline comercial (inbound)<br>`/admin/leads?tab=inbound` | tab inbound | 1440×900 | fold | no | 756/756 | `745ec8a6de0b` |
| 16 | `14-leads-detalle-asignar.png` | Ficha de lead + asignar setter<br>`/admin/leads/cmr035eu2000p9fl84dk0f450` | asignado a setter-qa · control de reasignación visible | 1440×2014 | full | no | 1870/1870 | `d39f298410b5` |
| 17 | `15-settings-fold.png` | Centro de control operativo<br>`/admin/settings` | AgencySettings · sin campos de herramientas ni Cal.com | 1440×900 | fold | no | 3913/756 | `cc97df199265` |
| 18 | `15-settings-full.png` | Centro de control operativo<br>`/admin/settings` | AgencySettings · sin campos de herramientas ni Cal.com | 1440×4065 | full | no | 3921/3921 | `2e380dbd36d1` |
| 19 | `16-settings-alerts.png` | Sistema de alertas<br>`/admin/settings/alerts` | ruta huérfana (no linkeada en el menú) | 1440×1427 | full | no | 1283/1283 | `d4e36cf12bd7` |
| 20 | `17-settings-reports.png` | Reportes semanales<br>`/admin/settings/reports` | ruta huérfana (no linkeada en el menú) | 1440×900 | fold | no | 756/756 | `69cabecaf8b7` |
| 21 | `18-team.png` | Workload por miembro<br>`/admin/team` | solo SUPER_ADMIN — los SETTER no aparecen | 1440×1682 | full | no | 1538/1538 | `e0e17af3d2a1` |
| 22 | `19-clients.png` | Todos los clientes<br>`/admin/clients` | 16 organizaciones | 1440×1861 | full | no | 1717/1717 | `04bd82b33939` |
| 23 | `20-client-detalle-impersonacion.png` | Ficha de cliente (botón impersonar)<br>`/admin/clients/cmqpeyfo80000upcwzni9v9tx` | San Miguel · superficie de impersonación visible, NO ejecutada | 1440×2009 | full | no | 1865/1865 | `e5b25de35b05` |
| 24 | `21-client-edit.png` | Editar cliente<br>`/admin/clients/cmqpeyfo80000upcwzni9v9tx/edit` | form de empresa/usuario/avatar | 1440×1433 | full | no | 1289/1289 | `4f01d4e91b7a` |
| 25 | `22-clients-new.png` | Nuevo cliente<br>`/admin/clients/new` | alta vacía | 1440×1654 | full | no | 1510/1510 | `263444894c81` |
| 26 | `23-dashboard-fold.png` | Dashboard raíz<br>`/admin` | KPIs comerciales/operativos/financieros | 1440×900 | fold | no | 2417/756 | `d8b2c1340848` |
| 27 | `23-dashboard-full.png` | Dashboard raíz<br>`/admin` | KPIs comerciales/operativos/financieros | 1440×2569 | full | no | 2425/2425 | `f107a369d482` |
| 28 | `24-alerts.png` | Alertas del sistema<br>`/admin/alerts` | cola del detector de bots | 1440×1426 | full | no | 1282/1282 | `775cbf873255` |
| 29 | `25-announcements.png` | Novedades del panel<br>`/admin/announcements` | publicador + listado | 1440×1256 | full | no | 1112/1112 | `24ba9f0e2527` |
| 30 | `26-audit-log.png` | Audit log<br>`/admin/audit-log` | registro de acciones admin | 1440×1618 | full | no | 1474/1474 | `0e9e66d729f0` |
| 31 | `27-chatbots.png` | Chatbots<br>`/admin/chatbots` | listado con stats | 1440×1516 | full | no | 1372/1372 | `bcf9ea45f082` |
| 32 | `28-chatbot-detalle.png` | Detalle de chatbot<br>`/admin/chatbots/cmphgpbpy00059fb0wa8gi9vo` | bot Aki · tab overview | 1440×900 | fold | no | 756/756 | `0a68a1f048e8` |
| 33 | `29-chatbots-new.png` | Nuevo chatbot<br>`/admin/chatbots/new` | alta vacía | 1440×1060 | full | no | 916/916 | `d51b35c9eb79` |
| 34 | `30-chatbot-activity.png` | Activity log del bot<br>`/admin/chatbot/activity` | stream global de eventos | 1440×935 | full | no | 791/791 | `820fa92c135a` |
| 35 | `31-chatbot-health.png` | Health score<br>`/admin/chatbot/health` | env vars, DB, LLM provider | 1440×1512 | full | no | 1368/1368 | `8c4a93a4a287` |
| 36 | `32-messages.png` | Bandeja de mensajes (vacía)<br>`/admin/messages` | sin conversación seleccionada | 1440×900 | fold | no | 756/756 | `d68e7bdaaf0d` |
| 37 | `33-messages-org.png` | Hilo de mensajes<br>`/admin/messages/cmqpeyfo80000upcwzni9v9tx` | hilo con San Miguel | 1440×900 | fold | no | 756/756 | `89b978bbe5ef` |
| 38 | `34-projects.png` | Board de proyectos<br>`/admin/projects` | entregas + mantenimiento + rentabilidad | 1440×3009 | full | no | 2865/2865 | `c3ed9f487512` |
| 39 | `35-project-detalle.png` | Detalle de proyecto<br>`/admin/projects/cmn06hj3500089f14g1wbmvzx` | Sitio Web Corporativo · overview | 1440×1326 | full | no | 1182/1182 | `e39b99a8dea3` |
| 40 | `36-project-tasks.png` | Tareas del proyecto<br>`/admin/projects/cmn06hj3500089f14g1wbmvzx/tasks` | lista y alta de tareas | 1440×1352 | full | no | 1208/1208 | `2f2247e5751b` |
| 41 | `37-project-payments.png` | Pagos del proyecto<br>`/admin/projects/cmn06hj3500089f14g1wbmvzx/payments` | hitos + mantenimiento mensual | 1440×900 | fold | no | 756/756 | `76c9a537924e` |
| 42 | `38-referrals.png` | Referidos<br>`/admin/referrals` | tabla de referidos | 1440×900 | fold | no | 756/756 | `1c2e38d95e3d` |
| 43 | `39-tickets.png` | Tickets<br>`/admin/tickets` | bandeja unificada por estado | 1440×900 | fold | no | 756/756 | `f53b7f3e21db` |
| 44 | `40-ticket-detalle.png` | Chat de ticket<br>`/admin/tickets/cmqqfhb0q0001upy81514qj5o` | ticket "Ayuda" | 1440×900 | fold | no | 756/756 | `a8fa7239a9f5` |
| 45 | `41-fg2-lab.png` | FG-2 Lab (experimental)<br>`/admin/fg2-lab` | ruta huérfana · prototipo descartable | 1440×1736 | full | no | 1592/1592 | `2af276c1940a` |
| 46 | `PAR-1-rechazar-admin-antes.png` | Dossier en revisión (antes del rechazo)<br>`/admin/leados/cmr035eu2000p9fl84dk0f450` | QA-W En Revision · stage EN_REVISION · barra de decisión visible | 1440×2207 | full | **sí** | 2213/2063 | `392d9d6b2952` |
| 47 | `PAR-1-rechazar-admin-despues.png` | Dossier rechazado (después)<br>`/admin/leados/cmr035eu2000p9fl84dk0f450` | stage RECHAZADA · rechazo appendeado al historial · sin barra de decisión | 1440×2577 | full | **sí** | 2661/2433 | `e26836b96928` |
| 48 | `PAR-1-rechazar-setter.png` | Guía de retrabajo del setter<br>`/setter/leads/cmr035eu2000p9fl84dk0f450/manual/mr` | el setter ve lo que Franco escribió: qué / dónde / arreglo | 1440×1554 | full | **sí** | 1442/1442 | `318fcf6b6b97` |
| 49 | `PAR-2-aprobar-admin-antes.png` | Dossier en revisión (antes de aprobar)<br>`/admin/leados/cmr035eu2000p9fl84dk0f450` | QA-W En Revision · stage EN_REVISION (re-sembrado) · barra de decisión visible | 1440×2207 | full | **sí** | 2213/2063 | `4c8cdb1b528b` |
| 50 | `PAR-2-aprobar-admin-despues.png` | Dossier aprobado (después)<br>`/admin/leados/cmr035eu2000p9fl84dk0f450` | stage APROBADA · aprobadaAt + finalUrl escritos · sin barra de decisión | 1440×2323 | full | **sí** | 2407/2179 | `18f61d284c0c` |
| 51 | `PAR-2-aprobar-setter.png` | m15 del setter tras la aprobación<br>`/setter/leads/cmr035eu2000p9fl84dk0f450/manual/m15` | APROBADA con finalUrl — el gate de envío abre | 1440×1341 | full | **sí** | 1229/1229 | `eaef48e4ce71` |
| 52 | `PAR-2-aprobar-setter-sin-link.png` | m15 del setter, aprobada SIN link permanente<br>`/setter/leads/cmr035f3q000x9fl84hnv2s8b/manual/m15` | fixture QA-W Aprobada Gate Cerrado · APROBADA con finalUrl NULL — estado no alcanzable desde el admin | 1440×1204 | full | **sí** | 1092/1092 | `a9ecf4996034` |

## El texto de cada pantalla, transcripto del DOM

Sale de `textContent` (no `innerText`, que devuelve `''` en contenido plegado), scopeado al
`<main>` — o al `[role="dialog"]` cuando hay un modal abierto. **El vocabulario cruzado se caza
comparando estas columnas, no mirando cuarenta imágenes.**

### `01-leados-cola-fold.png`

- **Encabezados** — «Pipeline de producción» · «Setters trabados — 1 pidió ayuda» · «Atascos — 61 demos sin moverse» · «Cola de revisión» · «DEMO Web · The Ethereal Resort» · «DEMO Web · Skyline Estates» · «DEMO Web · NEXO Bold» · «DEMO Web · YAKU Nebula» · «QA-B3 Café La Esquina» · «Centro Pilates Armonía»
- **Instrucción / cuerpo** — «Telegram sin configurar» · «No te llegan los avisos automáticos de leads calientes, setters trabados ni reuniones. El panel los muestra igual, pero configurá el bot para recibirlos al instante en el celular.» · «develOP / LeadOS» · «Dónde están las demos antes de tu revisión y hace cuánto no se mueven. La antigüedad es la última señal de actividad del dossier — lo que delata un atasco.»
- **Controles visibles** — «Configurar Telegram» · «Café de la EsquinaFichaSin setterSin movimiento hace 51 días» · «QA-B4 Barbería El FaroScore 3/5QA SetterEspera hace 70 días» · «Gimnasio Nova FitScore 3/5QA SetterEspera hace 10 días» · «QA-W En RevisionScore 4/5QA SetterEspera hace 21 min»

### `01-leados-cola-full.png`

- **Encabezados** — «Pipeline de producción» · «Setters trabados — 1 pidió ayuda» · «Atascos — 61 demos sin moverse» · «Cola de revisión» · «DEMO Web · The Ethereal Resort» · «DEMO Web · Skyline Estates» · «DEMO Web · NEXO Bold» · «DEMO Web · YAKU Nebula» · «QA-B3 Café La Esquina» · «Centro Pilates Armonía»
- **Instrucción / cuerpo** — «Telegram sin configurar» · «No te llegan los avisos automáticos de leads calientes, setters trabados ni reuniones. El panel los muestra igual, pero configurá el bot para recibirlos al instante en el celular.» · «develOP / LeadOS» · «Dónde están las demos antes de tu revisión y hace cuánto no se mueven. La antigüedad es la última señal de actividad del dossier — lo que delata un atasco.»
- **Controles visibles** — «Configurar Telegram» · «Café de la EsquinaFichaSin setterSin movimiento hace 51 días» · «QA-B4 Barbería El FaroScore 3/5QA SetterEspera hace 70 días» · «Gimnasio Nova FitScore 3/5QA SetterEspera hace 10 días» · «QA-W En RevisionScore 4/5QA SetterEspera hace 21 min»

### `02-leados-detalle-en-revision-fold.png`

- **Encabezados** — «QA-B4 Barbería El Faro» · «La demo» · «Tu veredicto» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Aprobar registra la URL permanente que ya publicaste. Rechazar le da al setter dirección concreta de retrabajo.» · «Negocio vivo con reseñas que piden turnos online — demo con CTA de WhatsApp tiene chance.» · «Demo Barbería El Faro»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Instagram» · «Abrir en pestaña nueva» · «Aprobar» · «Rechazar» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `02-leados-detalle-en-revision-full.png`

- **Encabezados** — «QA-B4 Barbería El Faro» · «La demo» · «Tu veredicto» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Aprobar registra la URL permanente que ya publicaste. Rechazar le da al setter dirección concreta de retrabajo.» · «Negocio vivo con reseñas que piden turnos online — demo con CTA de WhatsApp tiene chance.» · «Demo Barbería El Faro»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Instagram» · «Abrir en pestaña nueva» · «Aprobar» · «Rechazar» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `03-leados-rechazo-vacio.png`

- **Encabezados** — «Rechazar con dirección»
- **Etiquetas de campo** — «Qué está mal (corto)» · «Dónde (sección / elemento)» · «Arreglo concreto (qué hacer)»
- **Instrucción / cuerpo** — «develOP / LeadOS» · «El setter va a ver esto tal cual en su panel como guía de retrabajo de QA-B4 Barbería El Faro.»
- **Controles visibles** — «Cerrar» · «Cancelar» · «Confirmar rechazo»

### `04-leados-rechazo-completado.png`

- **Encabezados** — «Rechazar con dirección»
- **Etiquetas de campo** — «Qué está mal (corto)» · «Dónde (sección / elemento)» · «Arreglo concreto (qué hacer)»
- **Instrucción / cuerpo** — «develOP / LeadOS» · «El setter va a ver esto tal cual en su panel como guía de retrabajo de QA-B4 Barbería El Faro.»
- **Controles visibles** — «Cerrar» · «Cancelar» · «Confirmar rechazo»

### `05-leados-aprobar-vacio.png`

- **Encabezados** — «Aprobar demo»
- **Etiquetas de campo** — «URL permanente»
- **Instrucción / cuerpo** — «develOP / LeadOS» · «Publicaste la demo de QA-B4 Barbería El Faro a mano (Netlify, bajo develOP). Pegá acá la URL permanente — el panel solo la registra.»
- **Controles visibles** — «Cerrar» · «Cancelar» · «Confirmar aprobación»

### `06-leados-aprobar-completado.png`

- **Encabezados** — «Aprobar demo»
- **Etiquetas de campo** — «URL permanente»
- **Instrucción / cuerpo** — «develOP / LeadOS» · «Publicaste la demo de QA-B4 Barbería El Faro a mano (Netlify, bajo develOP). Pegá acá la URL permanente — el panel solo la registra.»
- **Controles visibles** — «Cerrar» · «Cancelar» · «Confirmar aprobación»

### `07-leados-detalle-aprobada-con-link.png`

- **Encabezados** — «QA-W Aprobada Gate Abierto» · «La demo» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Esta demo ya no está en revisión — estado actual: Aprobada · URL permanente» · «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Estética Aura»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «URL permanente» · «Abrir en pestaña nueva» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `08-leados-detalle-aprobada-sin-link.png`

- **Encabezados** — «QA-W Aprobada Gate Cerrado» · «La demo» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Esta demo ya no está en revisión — estado actual: Aprobada» · «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Ferretería El Tornillo»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Abrir en pestaña nueva» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `09-leados-detalle-rechazada.png`

- **Encabezados** — «QA-W Rechazada» · «La demo» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Rechazos previos (1)» · «Ficha de observación»
- **Instrucción / cuerpo** — «Esta demo ya no está en revisión — estado actual: Rechazada» · «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Florería Las Dalias»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Abrir en pestaña nueva» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `10-leados-setter-evaluaciones.png`

- **Encabezados** — «QA Setter»
- **Instrucción / cuerpo** — «Las últimas evaluaciones de este setter — score, veredicto y el razonamiento detrás. El criterio detrás del filtro, sin buscar en la base.» · «69 evaluadas · 3 descartes · 66 avances (4% descarte)» · «Negocio vivo con demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Negocio vivo con demanda desatendida — una demo con CTA de WhatsApp tiene chance.»
- **Controles visibles** — «Volver a la cola» · «QA-M16 Agendada» · «QA-M16 Abierta» · «QA-M5 Agotada» · «QA-M5 Toque» · «QA-W Postergado Futuro» · «QA-W Postergado Vencido» · «QA-W Descartada» · «QA-W Rechazada» · «QA-W Aprobada Gate Cerrado» · «QA-W Aprobada Gate Abierto» · «QA-W En Revision» · «QA-W Construccion» · «QA-W Brief» · «QA-W Evaluada Gate Abierto» · «QA-W Evaluada Gate Cerrado» · «Gimnasio Nova Fit» · «M0-GAL 34-archivo-perdido» · «M0-GAL 33-m5-post-envio» · «M0-GAL 32-m16-agendada» · «M0-GAL 31-m16-ofrecidos» · «M0-GAL 30-m16-virgen» · «M0-GAL 29-m15-espera-sin-final-url» · «M0-GAL 28-m15-espera-sin-respuesta»

### `11-leados-setter-sin-datos.png`

- **Encabezados** — «M0-GAL home vacío»
- **Instrucción / cuerpo** — «Las últimas evaluaciones de este setter — score, veredicto y el razonamiento detrás. El criterio detrás del filtro, sin buscar en la base.» · «Este setter todavía no tiene evaluaciones registradas.»
- **Controles visibles** — «Volver a la cola»

### `12-leads-pipeline.png`

- **Encabezados** — «Pipeline comercial» · «Prospecto» · «Demo enviada» · «Vio video» · «Respondio» · «Call agendada» · «Cerrado» · «Perdido» · «Postergado»
- **Etiquetas de campo** — «ServicioTodosAI AgentAutomationCustom SoftwareWebSin servicioTodos» · «PeriodoCualquier periodo1 semana1 mes6 meses1 añoPersonalizadoCualquier periodo» · «SetterTodosFranco DevelOPM0-GAL home foco construirM0-GAL home foco espera acciónM0-GAL home nada para trabajarQA SetterSMOKE-SETTER EXPValentino DevelOPSin asignarTodos» · «Ubicacion»
- **Instrucción / cuerpo** — «develOP / Leads» · «Seguimiento visual de prospectos, demos y cierres con prioridad operativa sobre cada lead.» · «Leads activos» · «Mantené apretada una card para moverla de estado»
- **Controles visibles** — «Nuevo lead» · «Outbound» · «Inbound» · «Demanda» · «Filtrar por servicio» · «Filtrar por periodo» · «Filtrar por setter» · «Ver todos los leads de Prospecto» · «Eliminar lead» · «Clic para ver las 61 →» · «Ver todos los leads de Demo enviada» · «Clic para ver las 7 →» · «Ver todos los leads de Vio video» · «Clic para ver las 3 →» · «Ver todos los leads de Respondio» · «Clic para ver las 24 →» · «Ver todos los leads de Call agendada» · «Clic para ver las 4 →» · «Ver todos los leads de Cerrado» · «Ver todos los leads de Perdido» · «Ver todos los leads de Postergado»

### `13-leads-inbound.png`

- **Encabezados** — «Pipeline comercial»
- **Instrucción / cuerpo** — «develOP / Leads» · «Formularios entrantes del portal que pueden convertirse al pipeline comercial interno.» · «Leads inbound» · «Leads inbound»
- **Controles visibles** — «Outbound» · «Inbound» · «Demanda» · «1 semana» · «1 mes» · «6 meses» · «1 año» · «Personalizado»

### `14-leads-detalle-asignar.png`

- **Encabezados** — «QA-W En Revision» · «Datos del lead» · «Actividad comercial» · «Setter asignado» · «Demos» · «Acciones rápidas»
- **Instrucción / cuerpo** — «develOP / Leads / Ficha» · «San Miguel de Tucumán» · «Sin links cargados.» · «Proyecto vinculado»
- **Controles visibles** — «Volver a leads» · «Ver revisión de la demo (LeadOS) →» · «Editar» · «Cambiar estado del lead» · «+ Registrar actividad» · «Registrar actividad» · «Setter asignado» · «Guardar asignación» · «Agregar demo»

### `15-settings-fold.png`

- **Encabezados** — «Centro de control operativo» · «Configuracion compartida y precios premium» · «Datos y alertas» · «Pricing de modulos premium» · «Parametros internos del equipo» · «Operacion comercial» · «Miembros del equipo» · «Telegram y referencias operativas» · «Canales internos»
- **Etiquetas de campo** — «Email principal» · «WhatsApp» · «Sitio web» · «Webhook de alertas» · «Objetivo semanal de demos» · «Telegram Bot Token» · «Telegram Chat ID»
- **Instrucción / cuerpo** — «develOP / Configuración» · «Ajusta la configuracion compartida del portal, el pricing de modulos y los parametros internos que usa el equipo comercial y operativo.» · «Portal de clientes» · «Adopta la misma base del admin clasico para contacto, alertas y catalogo comercial del portal.»
- **Controles visibles** — «Guardar»

### `15-settings-full.png`

- **Encabezados** — «Centro de control operativo» · «Configuracion compartida y precios premium» · «Datos y alertas» · «Pricing de modulos premium» · «Parametros internos del equipo» · «Operacion comercial» · «Miembros del equipo» · «Telegram y referencias operativas» · «Canales internos»
- **Etiquetas de campo** — «Email principal» · «WhatsApp» · «Sitio web» · «Webhook de alertas» · «Objetivo semanal de demos» · «Telegram Bot Token» · «Telegram Chat ID»
- **Instrucción / cuerpo** — «develOP / Configuración» · «Ajusta la configuracion compartida del portal, el pricing de modulos y los parametros internos que usa el equipo comercial y operativo.» · «Portal de clientes» · «Adopta la misma base del admin clasico para contacto, alertas y catalogo comercial del portal.»
- **Controles visibles** — «Guardar»

### `16-settings-alerts.png`

- **Encabezados** — «Sistema de alertas» · «Tipos de alerta — condiciones de disparo»
- **Instrucción / cuerpo** — «Settings · Alertas» · «Configuración del detector automático y notificaciones.» · «Total alertas» · «Ejecutar detector ahora»
- **Controles visibles** — «Probar detector»

### `17-settings-reports.png`

- **Encabezados** — «Reportes semanales»
- **Instrucción / cuerpo** — «Settings · Reportes» · «Resumen automático enviado cada lunes a todos los clientes con bot activo.» · «Envíos recientes» · «Enviar reportes ahora»
- **Controles visibles** — «Enviar ahora»

### `18-team.png`

- **Encabezados** — «Workload por miembro»
- **Instrucción / cuerpo** — «develOP / Equipo» · «Capacidad operativa del equipo, tareas activas por proyecto y tiempo invertido esta semana y este mes.» · «Admin DevelOP» · «admin@develop.com»
- **Controles visibles** — «aaa0.0 h · 1 tarea» · «Ver tareas en Proyectos →» · «Motor interno de automatizacion operativa0.0 h · 1 tarea» · «Asistente IA de consultas y turnos5.5 h · 1 tarea» · «Motor interno de automatizacion operativa14.5 h · 2 tareas» · «Nuevo sitio comercial y CRM de ventas11.5 h · 3 tareas» · «Asistente IA de consultas y turnos5.0 h · 2 tareas» · «Nuevo sitio comercial y CRM de ventas9.5 h · 2 tareas»

### `19-clients.png`

- **Encabezados** — «Todos los clientes» · «T0.2 Cleanup Retention Test» · «QA Evals — Agencia» · «QA Evals — Usados» · «QA Evals — Base» · «Org Duplicada E2E» · «Sigma Contable» · «Sonrisa Norte» · «San Miguel» · «El Garage»
- **Instrucción / cuerpo** — «16 clientes activos en el sistema» · «Mostrando 16 de 16» · «t02-cleanup-retention-test» · «qa-evals-agencia»
- **Controles visibles** — «Todos los bots» · «Recientes primero» · «Nuevo cliente» · «Activos» · «Archivados» · «Archivar T0.2 Cleanup Retention Test» · «Pinear» · «Archivar QA Evals — Agencia» · «Archivar QA Evals — Usados» · «ActivoQA Evals — Baseqa-evals-baseBusiness0Proy0Tickets0Msgs» · «Archivar QA Evals — Base» · «Archivar Org Duplicada E2E» · «ActivoSigma Contablesigma-contableStarter0Proy1Tickets0Msgs» · «Archivar Sigma Contable» · «ActivoSonrisa Nortesonrisa-nortePro1Proy1Tickets3Msgs» · «Archivar Sonrisa Norte» · «San Miguelsan-miguelBusiness1Proy2Tickets5Msgs» · «Archivar San Miguel» · «ActivoEl Garageel-garageSin plan0Proy0Tickets0Msgs» · «Archivar El Garage» · «Archivar Consecionaria El Garage» · «Archivar Consecionaria Birinbow» · «QA Cliente B SAqa-cliente-bBusiness1Proy8Tickets9Msgs» · «Archivar QA Cliente B SA»

### `20-client-detalle-impersonacion.png`

- **Encabezados** — «San Miguel» · «Plan asignado» · «Billing override» · «Reporte ejecutivo semanal»
- **Etiquetas de campo** — «Seleccionar plan» · «Motivo (opcional, queda en audit log)» · «Precio override (USD/mes)» · «Vigente hasta» · «Motivo (opcional, queda visible y en audit)»
- **Instrucción / cuerpo** — «Conversaciones» · «Estado suscripcion» · «Usuario primario» · «Carlos Mendoza»
- **Controles visibles** — «Clientes» · «San MiguelCtrl K» · «Editar datos» · «Impersonar» · «Overview» · «Chatbot» · «Proyectos» · «Boveda» · «Soporte» · «Business — $150/mes» · «Sin cambios» · «Comparación de las 7 dimensiones de gating» · «Aplicar override» · «Quitar override» · «Enviar reporte ahora» · «Re-enviar credenciales» · «Editar»

### `21-client-edit.png`

- **Encabezados** — «Editar datos» · «Empresa» · «Usuario administrador» · «Avatar del cliente» · «Notas internas»
- **Etiquetas de campo** — «Nombre de la empresa*(obligatorio)» · «Ciudad» · «URL del sitio web» · «Email*(obligatorio)» · «Nombre completo*(obligatorio)» · «Teléfono» · «Emoji» · «Iniciales» · «Notas del equipo develOP»
- **Instrucción / cuerpo** — «Actualizá los datos de la empresa y del usuario administrador.» · «Opcional. Podés escribir el dominio solo; le agregamos https:// automáticamente.» · «Opcional. Se usa si no hay imagen.» · «Opcional, máx 2 caracteres a mano. Se usan si no hay imagen ni emoji.»
- **Controles visibles** — «Subir imagen» · «Elegir emoji del avatar» · «Cancelar» · «Guardar cambios»

### `22-clients-new.png`

- **Encabezados** — «Nuevo cliente» · «1. Datos de la empresa»
- **Etiquetas de campo** — «Nombre de la empresa» · «Industria» · «Ciudad» · «URL del sitio web (opcional)» · «Avatar del cliente (opcional)» · «Emoji» · «Iniciales» · «Nombre completo del cliente» · «Email del cliente» · «Teléfono de contacto (opcional)»
- **Instrucción / cuerpo** — «Creá la cuenta del cliente. Con chatbot, sumás identidad, base de conocimiento y apariencia.» · «¿Este cliente va a tener chatbot?» · «Con chatbot configurás identidad, conocimiento y apariencia. Sin chatbot creás solo la cuenta del cliente.» · «Podés escribir el dominio solo; le agregamos https:// automáticamente.»
- **Controles visibles** — «Con chatbot» · «Sin chatbot» · «Industria» · «Subir imagen» · «Elegir emoji del avatar» · «Continuar →» · «Flotando» · «Abierto» · «Idle» · «Pensando» · «Hablando»

### `23-dashboard-fold.png`

- **Encabezados** — «KPIs comerciales, operativos y financieros» · «KPIs comerciales» · «KPIs operativos» · «Ingresos y financiero» · «Tendencias últimas semanas y meses»
- **Instrucción / cuerpo** — «develOP / Dashboard» · «Unifica el pulso comercial de la OS con la operación real del portal y la rentabilidad del trabajo entregado.» · «Datos del panel para velocidad de venta, seguimiento y conversión.» · «Demos enviadas esta semana»
- **Controles visibles** — —

### `23-dashboard-full.png`

- **Encabezados** — «KPIs comerciales, operativos y financieros» · «KPIs comerciales» · «KPIs operativos» · «Ingresos y financiero» · «Tendencias últimas semanas y meses»
- **Instrucción / cuerpo** — «develOP / Dashboard» · «Unifica el pulso comercial de la OS con la operación real del portal y la rentabilidad del trabajo entregado.» · «Datos del panel para velocidad de venta, seguimiento y conversión.» · «Demos enviadas esta semana»
- **Controles visibles** — —

### `24-alerts.png`

- **Encabezados** — «Alertas del sistema»
- **Instrucción / cuerpo** — «Sistema / Alertas» · «Issues detectados automaticamente cada 15 minutos» · «Críticas pendientes» · «Totales pendientes»
- **Controles visibles** — «Todas» · «Crítica» · «Alta» · «Warning» · «Info» · «Última semana» · «1 mes» · «6 meses» · «1 año» · «Personalizado»

### `25-announcements.png`

- **Encabezados** — «Novedades del panel» · «Publicar novedad» · «Publicadas» · «JAJA» · «Ben yedder POTM»
- **Etiquetas de campo** — «Título» · «Cuerpo» · «Alcance» · «Caduca el (opcional)»
- **Instrucción / cuerpo** — «develOP / Novedades» · «Cada feature que entregás se anuncia acá. Los clientes la ven en su panel con un badge; el badge se apaga cuando la leen. Las novedades con fecha caducan solas.» · «Se anuncia en el panel del cliente. Elegí si la ven todos o una sola organización.» · «Sin fecha = no caduca.»
- **Controles visibles** — «Todos los clientes» · «Publicar novedad» · «Retirar novedad JAJA» · «Retirar novedad Ben yedder POTM»

### `26-audit-log.png`

- **Encabezados** — «Audit log»
- **Instrucción / cuerpo** — «Registro de acciones administrativas y cambios sensibles.» · «Total registros» · «Ultimos 7 dias» · «Tipos de accion»
- **Controles visibles** — «Todas las acciones» · «Filtrar por fecha» · «Cargar mas»

### `27-chatbots.png`

- **Encabezados** — «Chatbots» · «Lucia» · «T0.2 Retention Bot» · «Bot de prueba QA — sigma-contable» · «Bot de prueba QA — sonrisa-norte» · «Asistente QA (agencia)» · «Asistente QA (usados)» · «Asistente QA (base)» · «Bot Duplicado» · «Marcus»
- **Instrucción / cuerpo** — «11 bots configurados · 11 activos» · «de 11 totales» · «Bots pausados» · «Conversaciones»
- **Controles visibles** — «Nuevo chatbot» · «Filtrar por estado» · «Filtrar por industria» · «● ActivoLuciadevelOP · generico/developCharlas165Leads20» · «● ActivoAkiMatsu · concesionaria/matsuCharlas18Leads21»

### `28-chatbot-detalle.png`

- **Encabezados** — «Aki»
- **Instrucción / cuerpo** — «Conversaciones este mes» · «Conversaciones totales» · «Leads totales» · «Tasa de conversión»
- **Controles visibles** — «Volver a chatbots» · «Pausar bot» · «Test endpoint» · «Eliminar bot» · «Overview» · «Configuración» · «Knowledge Base» · «Actividad» · «Leads» · «Conversaciones» · «Instalación» · «Integraciones»

### `29-chatbots-new.png`

- **Encabezados** — «Nuevo chatbot»
- **Etiquetas de campo** — «Organización*(obligatorio)» · «Nombre del bot*(obligatorio)» · «Industria*(obligatorio)» · «Color de acento» · «WhatsApp»
- **Instrucción / cuerpo** — «Creá un bot para una organización existente o creá ambos de cero.» · «¿Para quién es el chatbot?» · «Para una organización existente» · «5 sin bot todavía»
- **Controles visibles** — «Para una organización existente5 sin bot todavía» · «Crear org + bot de ceroOnboarding completo» · «Consecionaria Birinbow» · «Médico / Odontológico» · «Cancelar» · «Crear chatbot»

### `30-chatbot-activity.png`

- **Encabezados** — «Activity Log»
- **Instrucción / cuerpo** — «Stream de eventos del chatbot en tiempo real» · «Actividad última semana» · «Eventos por día»
- **Controles visibles** — «Filtrar por tipo» · «Filtrar por nivel» · «Filtrar por fecha»

### `31-chatbot-health.png`

- **Encabezados** — «Health Score» · «Todo OK» · «Variables de entorno» · «Base de datos» · «LLM Provider» · «Configuración del bot»
- **Instrucción / cuerpo** — «Estado operacional del chatbot develOP» · «Estado general» · «Todos los sistemas responden. El bot está listo para recibir consultas.» · «Checked at: 2026-08-22T04:57:08.949Z»
- **Controles visibles** — —

### `32-messages.png`

- **Encabezados** — —
- **Instrucción / cuerpo** — «Conversaciones» · «7 conversaciones con historial» · «Hola! Me interesa activar el módulo Email Marketing Pro. ¿Pueden darme más info y los próximos pasos?» · «Sonrisa Norte»
- **Controles visibles** — «Eejemplo19-marAdmin: hola»

### `33-messages-org.png`

- **Encabezados** — «San Miguel»
- **Instrucción / cuerpo** — «Conversaciones» · «7 conversaciones con historial» · «Hola! Me interesa activar el módulo Email Marketing Pro. ¿Pueden darme más info y los próximos pasos?» · «Sonrisa Norte»
- **Controles visibles** — «Volver a mensajes» · «Eejemplo19-marAdmin: hola» · «Insertar emoji» · «Enviar mensaje»

### `34-projects.png`

- **Encabezados** — «Entregas, mantenimiento y rentabilidad»
- **Instrucción / cuerpo** — «develOP / Proyectos» · «Seguimiento centralizado de proyectos del portal y proyectos internos desde una sola vista.» · «Mantené apretada una card para moverla de estado» · «Automatización de postventa»
- **Controles visibles** — «Nuevo proyecto» · «Todos» · «Con cliente» · «Internos» · «Filtrar por tipo de servicio» · «Filtrar por fecha de inicio» · «Filtrar por fecha de entrega estimada» · «Ver todos los proyectos en Planning» · «Eliminar proyecto Automatización de postventa» · «Eliminar proyecto AAA» · «Eliminar proyecto aaa» · «Eliminar proyecto Motor interno de automatizacion operativa» · «Ver todos los proyectos en En progreso» · «Eliminar proyecto Sitio web institucional Matsu» · «Eliminar proyecto Nuevo sitio comercial y CRM de ventas» · «Ver todos los proyectos en Revision» · «Eliminar proyecto Asistente IA de consultas y turnos» · «Ver todos los proyectos en Completado»

### `35-project-detalle.png`

- **Encabezados** — «Sitio Web Corporativo» · «Resumen del proyecto» · «Tareas» · «Finanzas» · «Zona de peligro»
- **Instrucción / cuerpo** — «develOP / Proyectos / Ficha» · «Desarrollo del sitio web principal» · «Sitio Web Corporativo» · «Estado actual: IN PROGRESS»
- **Controles visibles** — «Volver a proyectos» · «Ver como cliente» · «Estado del proyecto» · «Editar» · «Overview» · «Tareas» · «Horas» · «Pagos» · «Eliminar proyecto»

### `36-project-tasks.png`

- **Encabezados** — «Sitio Web Corporativo» · «Tareas del proyecto»
- **Instrucción / cuerpo** — «develOP / Proyectos / Ficha» · «Backlog operativo agrupado por estado, con edición inline y trazabilidad de horas.» · «Integración CMS» · «Sin estimar / 0.0 h»
- **Controles visibles** — «Volver a proyectos» · «Ver como cliente» · «Estado del proyecto» · «Editar» · «Overview» · «Tareas» · «Horas» · «Pagos» · «Nueva tarea» · «Eliminar tarea Integración CMS» · «Eliminar tarea Desarrollo frontend» · «Eliminar tarea Diseño de wireframes»

### `37-project-payments.png`

- **Encabezados** — «Sitio Web Corporativo» · «Hitos de desarrollo» · «Mantenimiento mensual»
- **Instrucción / cuerpo** — «develOP / Proyectos / Ficha» · «Seguimiento del cobro inicial y contra entrega del proyecto.» · «Estado de pagos recurrentes luego de la entrega.»
- **Controles visibles** — «Volver a proyectos» · «Ver como cliente» · «Estado del proyecto» · «Editar» · «Overview» · «Tareas» · «Horas» · «Pagos»

### `38-referrals.png`

- **Encabezados** — «Referidos»
- **Instrucción / cuerpo** — «develOP / Referidos» · «Cuando un cliente recomienda develOP y el negocio referido contrata un plan, marcá la conversión y luego el mes bonificado acreditado. La aplicación en facturación la hacés vos.» · «jaja@gmail.com» · «Referido por El Garage · 01 de jul de 2026 · bonificado 01 de jul de 2026»
- **Controles visibles** — —

### `39-tickets.png`

- **Encabezados** — «Tickets»
- **Instrucción / cuerpo** — «develOP / Soporte» · «Bandeja unificada de conversaciones de soporte del portal, con seguimiento por estado y respuesta directa desde el panel.» · «No hay tickets en esta bandeja» · «Cuando entren nuevas conversaciones de soporte para este estado, van a aparecer aca.»
- **Controles visibles** — «Todos0» · «Abiertos0» · «En progreso0» · «Resueltos0» · «Todos» · «1 mes» · «3 meses» · «6 meses» · «1 año» · «Personalizado»

### `40-ticket-detalle.png`

- **Encabezados** — «Ayuda»
- **Instrucción / cuerpo** — «develOP / Tickets» · «Socorro aaaaa»
- **Controles visibles** — «Volver a tickets» · «Cambiar estado del ticket» · «Insertar emoji» · «Enviar respuesta»

### `41-fg2-lab.png`

- **Encabezados** — «FG-2 Lab — Formulario estructurado (gastronomía)» · «Prompt estructurado» · «Harness de medición»
- **Etiquetas de campo** — «Precargar un caso del experimento» · «Autocompletar desde un lead» · «Nombre del negocio*(obligatorio)» · «Zona» · «Estilo visual» · «Tono del copy» · «Secciones de la landing» · «CTA principal» · «WhatsApp del negocio» · «Diferencial / plato estrella»
- **Instrucción / cuerpo** — «Prototipo experimental — descartable» · «Esto NO es producción ni parte del flujo del setter. Es el prototipo para correr el experimento de FG-2: ¿un formulario estructurado da mejores demos que el prompteo libre? Generá las 5 demos del rubro con este formulario, registrá costo y calidad con el harness, y compará contra 5 hechas a mano. El protocolo completo está en docs/experimentos/fg2-brief-experimento.md.» · «Llena TODO el formulario (estilo, secciones, CTA, diferencial, WhatsApp incluidos) para correr el 5-vs-5 sin tipear. Ver docs/experimentos/fg2-brief-experimento.md.» · «Trae nombre, zona, reseñas y links de la ficha. Lo demás lo elegís vos.»
- **Controles visibles** — «— Elegí un caso precargado o cargá a mano —» · «— Elegí un lead o cargá a mano —» · «Cálido y apetitoso» · «Cercano y familiar» · «Hero con plato estrella» · «Menú destacado» · «Sobre nosotros» · «Galería» · «Reseñas (prueba social)» · «Ubicación y horarios» · «Cierre con CTA de contacto» · «Pedí por WhatsApp» · «Copiar prompt» · «Arrancar» · «Copiar fila de log» · «Copiar encabezado»

### `PAR-1-rechazar-admin-antes.png`

- **Encabezados** — «QA-W En Revision» · «La demo» · «Tu veredicto» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Aprobar registra la URL permanente que ya publicaste. Rechazar le da al setter dirección concreta de retrabajo.» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Gimnasio Atlas»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Abrir en pestaña nueva» · «Aprobar» · «Rechazar» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `PAR-1-rechazar-admin-despues.png`

- **Encabezados** — «QA-W En Revision» · «La demo» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Rechazos previos (1)» · «Ficha de observación»
- **Instrucción / cuerpo** — «Esta demo ya no está en revisión — estado actual: Rechazada» · «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Gimnasio Atlas»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Abrir en pestaña nueva» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `PAR-1-rechazar-setter.png`

- **Encabezados** — «QA-W En Revision» · «Aplicá las correcciones de Franco» · «Historial del lead»
- **Instrucción / cuerpo** — «Manual paso a paso» · «Pablo · Gimnasio · San Miguel de Tucumán» · «Notas del lead: QA-W — EN_REVISION: esperando revisión de Franco.» · «Guía de retrabajo — lo que Franco pidió corregir»
- **Controles visibles** — «Volver a tu cartera» · «Copiar bloque» · «Reabrir construcción» · «1Construir» · «2Refinar» · «Ficha» · «Evaluación» · «Brief» · «Borrador» · «Ver historial del lead— sin movimientos»

### `PAR-2-aprobar-admin-antes.png`

- **Encabezados** — «QA-W En Revision» · «La demo» · «Tu veredicto» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Aprobar registra la URL permanente que ya publicaste. Rechazar le da al setter dirección concreta de retrabajo.» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Gimnasio Atlas»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «Abrir en pestaña nueva» · «Aprobar» · «Rechazar» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `PAR-2-aprobar-admin-despues.png`

- **Encabezados** — «QA-W En Revision» · «La demo» · «Evaluación» · «Brief de diseño» · «Self-check del setter» · «Ficha de observación»
- **Instrucción / cuerpo** — «Esta demo ya no está en revisión — estado actual: Aprobada · URL permanente» · «Si el embed no carga (algunos hosts lo bloquean), usá «Abrir en pestaña nueva».» · «Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance.» · «Demo Gimnasio Atlas»
- **Controles visibles** — «Volver a la cola» · «Ver ficha completa del lead →» · «Siguiente en la cola →» · «URL permanente» · «Abrir en pestaña nueva» · «Identidad» · «Presencia digital» · «Reseñas» · «Contenido real»

### `PAR-2-aprobar-setter.png`

- **Encabezados** — «QA-W En Revision» · «Mandá el link al negocio» · «Historial del lead»
- **Instrucción / cuerpo** — «Manual paso a paso» · «Pablo · Gimnasio · San Miguel de Tucumán» · «Notas del lead: QA-W — EN_REVISION: esperando revisión de Franco.» · «El segundo mensaje: la demo aprobada, con su link, al negocio que respondió.»
- **Controles visibles** — «Volver a tu cartera» · «https://qa-w-en-revision.develop.com.ar» · «Copiar bloque» · «Ya la envié — registrar» · «Ficha» · «Evaluación» · «Brief» · «Borrador» · «Chequeo final» · «Ver historial del lead— sin movimientos»

### `PAR-2-aprobar-setter-sin-link.png`

- **Encabezados** — «QA-W Aprobada Gate Cerrado» · «Mandá el link al negocio» · «Historial del lead»
- **Instrucción / cuerpo** — «Manual paso a paso» · «Hernán · Ferretería · Tafí Viejo» · «Notas del lead: QA-W — APROBADA sin finalUrl y PROSPECTO: "el link se libera cuando el negocio responda".» · «El segundo mensaje: la demo aprobada, con su link, al negocio que respondió.»
- **Controles visibles** — «Volver a tu cartera» · «Seguí la cadencia — registrá un toque» · «Ir a tu paso actual» · «Ficha» · «Evaluación» · «Brief» · «Borrador» · «Chequeo final» · «Ver historial del lead— sin movimientos»

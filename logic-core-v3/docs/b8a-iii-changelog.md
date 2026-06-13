# B8A-III — Changelog de ejecución

**Branch:** `leados/b8a-iii` (ramificada de `main` con B8a + B8a-II) · **Fecha:** 13/jun/2026

Cambios agrupados por **clase de riesgo** (mergeables por separado):
- **SEGURO** — UI / copy / UX / presentación de datos existentes. Una pasada.
- **SENSIBLE** — toca la maquinaria comercial (guard de entrada). Revisar con lupa.

Cada cambio referencia su hallazgo en [`b8a-iii-auditoria.md`](./b8a-iii-auditoria.md).
Verificación transversal: `npx tsc --noEmit` → exit 0 después de cada tanda; recorrido de runtime en `dev:qa` (3002) con sesión setter/admin minteada para los cambios observables; `npm run build` → ver pie.

---

## SEGURO  *(commit `feat(b8a-iii/seguro)`)*

### S1 — NIII-3: el envío a revisión reporta el fallo con error inline persistente, no solo toast
**Archivos:** `setter/leads/[leadId]/_components/self-check-step.tsx` · `…/construccion-step.tsx`.
**Qué:** ambos componentes ahora setean un `serverError` (useState) en las ramas de fallo de sus actions y lo renderizan persistente (`<p>` rojo) arriba de los botones; el toast queda como refuerzo. Eran las DOS únicas superficies del wizard que reportaban el fallo solo con toast efímero.
**Por qué:** "Enviar a revisión" es la entrega del trabajo del setter a Franco; `enviarARevision` re-valida contra la DB (stage/draftUrl/self-check) y puede rebotar. Un toast de ~4s que pasa desapercibido producía un falso éxito tragado en silencio (la demo nunca llega a la cola). Hace la herramienta más difícil de usar mal.
**Riesgo:** nulo. Patrón idéntico al ya presente en ficha/brief/opener/agenda/evaluación. Cero librerías. `tsc` limpio.
**Verificado:** `tsc` exit 0; el patrón es el mismo verificado en runtime en los otros pasos. (El rebote real del server requiere forzar un fallo de DB/gate — queda como check opcional de Franco, igual posture que la sesión 1.)

### S2 — NIII-4: el hard-check `fielAlBrief` ahora es bidireccional (ni de más ni de menos)
**Archivos:** `src/lib/leados/flow.ts` (`HARD_CHECKS` → `fielAlBrief`).
**Qué:** el `nombre` pasó a "La demo dice lo que el brief pedía — ni de más ni de menos" y el `comoVerificar` ahora pregunta por completitud **y** por sobrante ("¿está TODO lo que pedía y NADA que no pidiera? Si Claude Design agregó secciones de su cuenta… sacalas"). El `arreglo` también.
**Por qué:** el shell ya declara "No agregues secciones que el brief no pide", pero el gate sólo cazaba faltantes — una demo con secciones inventadas pasaba en verde y le llegaba a Franco con scope inflado. Cierra el hueco guía↔gate.
**Riesgo:** nulo. Sólo cambia la **FORMA/redacción** de una constante marcada `PROVISORIO` (permitido explícitamente); no agrega checks ni umbrales; `selfCheckAprobado` intacto. `tsc` limpio.
**Verificado:** runtime — el texto bidireccional aparece en el Paso 6 sobre un lead en CONSTRUCCION.

### S3 — NIII-5: el onboarding del setter (paso 4) describe lo que el panel YA hace
**Archivos:** `setter/_components/onboarding-hint.tsx` (`PASOS[3]`).
**Qué:** el paso 4 pasó de "Lo que sigue / Construcción de la demo, revisión y envío llegan en los próximos pasos del panel" a "Construí, revisá y enviá / El panel te guía la construcción de la demo fase por fase y el self-check antes de mandarla a Franco; el link sale recién cuando el negocio responde". "En cuatro pasos" sigue honesto.
**Por qué:** la tarjeta "Cómo funciona" es lo primero que lee un setter nuevo; describir como futuro lo que ya está construido subvende el producto y mina la confianza en la guía.
**Riesgo:** nulo. Sólo copy. `tsc` limpio.
**Verificado:** runtime — con la tarjeta visible (localStorage limpio), el paso 4 muestra el copy nuevo.

### S4 — NIII-6: el SelfCheckPanel de Franco lidera con los softFlags y condensa los duros
**Archivos:** `admin/leados/[leadId]/_components/dossier-panels.tsx` (`SelfCheckPanel`).
**Qué:** cuando hay self-check, ahora se muestran PRIMERO los `softFlags` (los reparos de diseño que el setter levantó — la señal discriminante), en caja ámbar prominente; si no hay, se dice explícito ("El setter no levantó reparos de diseño"). La lista de hard-checks (100% verde en cola por construcción del gate) se condensó a un `<details>` "N/N obligatorios verificados ›". Si por un cambio de `HARD_CHECKS` algún duro no estuviera ok, el detalle se abre solo y marca en rosa (la rama roja no es código muerto).
**Por qué:** en una revisión de 2 min, la pieza de mayor protagonismo visual era la de menor valor informativo. Acelera y afila el escaneo de Franco.
**Riesgo:** bajo. Sólo jerarquía visual de un panel read-only; no cambia `HARD_CHECKS`/`SOFT_CHECKS` ni umbrales. `tsc` limpio.
**Verificado:** runtime + captura — sobre QA-B4 Barbería El Faro (tiene un softFlag "Tiene más de 3 colores"): el panel lidera con "REPAROS QUE LEVANTÓ EL SETTER — MIRALOS · Tiene más de 3 colores" y condensa a "6/6 obligatorios verificados ›".

### S5 — NIII-7: el shell apunta al "Bloque para Claude Design (acá arriba)" por su nombre real
**Archivos:** `src/lib/leados/flow.ts` (`SHELL_CONSTRUCCION` fase Estructura, item 1).
**Qué:** el item 1 pasó de "Copiá el bloque del brief (está acá abajo)…" a "Copiá el «Bloque para Claude Design» (acá arriba) y pegalo como primer mensaje". Corrige el doble desajuste con la UI (ubicación + nombre).
**Por qué:** un no-técnico leía la fase 1 y miraba abajo buscando un bloque que está arriba y con otro nombre — fricción de navegación en el primerísimo paso de la construcción.
**Riesgo:** nulo. Copy de una constante `PROVISORIO`. `tsc` limpio.
**Verificado:** runtime — el item 1 muestra el copy nuevo sobre un lead en CONSTRUCCION.

### S6 — NIII-8: el conflicto al confirmar reunión refresca a la tarjeta-resumen
**Archivos:** `setter/leads/[leadId]/_components/agenda-step.tsx` (`confirmar()`).
**Qué:** ante un error de conflicto ("Este lead ya tiene la reunión agendada" / "Ya hay una confirmación en curso… recargá"), `confirmar()` ahora llama `router.refresh()` (además del error rojo), para que el paso pase a su tarjeta-resumen "Reunión agendada" en vez de dejar el formulario contradictorio en pantalla.
**Por qué:** en un camino de concurrencia/stale el server rechaza el duplicado correctamente (idempotencia intacta), pero la UI dejaba al setter mirando un form que insistía en agendar algo ya agendado.
**Riesgo:** nulo. `router.refresh()` ya importado/usado en la rama de éxito; no toca el server ni la idempotencia. `tsc` limpio.
**Verificado:** `tsc` exit 0 + revisión de código. El valor es `needs-runtime` (requiere reproducir la carrera) — el camino de éxito que se reusa ya está fogueado.

---

## SENSIBLE  *(commit `fix(b8a-iii/sensible)`)*

### N1 — NIII-1: guard de CALL_AGENDADA en `registrarResultado` (Paso 9) + ocultar los botones de resultado *(impacto ALTO)*
**Archivos:** `setter/_actions/outreach.actions.ts` (`registrarResultado`) · `setter/leads/[leadId]/_components/seguimiento-step.tsx`.
**Qué:**
1. **Server:** `registrarResultado` ahora rechaza con "Este lead ya tiene la reunión agendada — la cierra Franco" si `lead.status === 'CALL_AGENDADA'`, espejando el guard del camino de agenda (`gateAgenda` en `agenda.actions.ts`).
2. **UI:** `seguimiento-step` oculta el bloque "Registrá lo que pasó" (los 4 botones de resultado) cuando `status === 'CALL_AGENDADA'` y muestra una nota coherente con el home ("Reunión agendada — la cierra Franco. No registres más resultados acá…").
**Por qué:** sin el guard, un setter podía bajar un lead `CALL_AGENDADA` a POSTERGADO/RESPONDIO/SIN_RESPUESTA con un click en un botón aún visible del Paso 9 — pisando el CALL_AGENDADA, dejando el booking de Cal.com **huérfano** en `agendaJson` y creando una `OsLeadActivity` que **ensucia el orden que el cron lee como "último contacto"** (línea roja 5). El outcome más valioso del sistema (la reunión que cierra Franco) quedaba corrompido en silencio. Las sesiones 1-2 cubrieron compensación (H1) y display (H3), no este **guard de entrada**.
**Por qué refuerza (no degrada) un invariante:** protege la línea roja 5 y la idempotencia/persistencia de la agenda. No toca `transitionDossier`/`os-commercial` ni el aislamiento por `assignedToId`. El `createActivity` del admin queda intacto a propósito (Franco maneja el ciclo post-reunión).
**Riesgo:** bajo. Guard aditivo + ocultamiento de UI; el server re-valida aunque la UI cambie. `tsc` limpio.
**Verificado en runtime (antes/después):** sobre un lead descartable forzado a `CALL_AGENDADA` con un opener (`contactos>0`), creado y borrado en la verificación — **antes:** los 4 botones de resultado salían habilitados; **después:** ocultos + la nota "la cierra Franco". El guard server-side queda como defensa en profundidad (verificado por código + `tsc`; mismo pattern que `gateAgenda`).

### N2 — NIII-2: el wizard es consciente de CALL_AGENDADA (ficha read-only)
**Archivos:** `setter/leads/[leadId]/_components/lead-wizard.tsx`.
**Qué:** `fichaEditable` pasa a `false` cuando `lead.status === 'CALL_AGENDADA'` (la evaluación lo hereda) — el wizard deja de ofrecer la Ficha (Paso 1) como formulario activo "completá la ficha" sobre un lead ya agendado. En el mismo espíritu que el short-circuit de `DESCARTADA`.
**Por qué:** vivido en runtime sobre QA-B7 Vivero El Aromo (CALL_AGENDADA, stage FICHA): el wizard invitaba al setter a volver al Paso 1 mientras el home ya decía "Reunión agendada — la cierra Franco" (H3 arregló el card, no el wizard). Incoherencia que mina la confianza.
**Riesgo:** nulo. Una condición de booleano; la Ficha pasa a su vista read-only ya existente. `tsc` limpio.
**Verificado en runtime:** sobre el lead temp CALL_AGENDADA — la Ficha quedó read-only ("Ver la ficha de observación (congelada…)"), sin el form activo.

---

## Propuestas NO ejecutadas

- **resultado-sin-realizada (future-work):** `guardarResultadoReunionAdmin` permite registrar GANADO/PERDIDO sin marcar `realizadaAt`. **No ejecutado:** el lector de esa métrica (conteo de B8) todavía no existe — optimizarla ahora es pulir un campo sin consumidor, y la semántica (auto-derivar `realizadaAt` vs exigir "realizada") es decisión de Franco para cuando se construya B8.
- **error.message crudo en actions admin B6/B7 (marginal):** divergencia del patrón `mapError` en `reunion`/`activity`/`demo` (requireSuperAdmin). Admin-only, no mueve la vara — higiene a criterio de Franco.
- **H2 / H4 / H6 (RESERVADOS):** sin cambios. Re-confirmados en runtime; recomendaciones de las sesiones 1-2 vigentes.

---

## Estado al cierre
- `npx tsc --noEmit` → **exit 0** después de cada tanda.
- `npm run build` → ver reporte final.
- Migraciones: **sin cambios** (ningún fix tocó `schema.prisma`). El lead temp de verificación se creó y se borró (cero fixtures tocadas).
- Líneas rojas: **ninguna degradada.** NIII-1 refuerza la línea roja 5 (orden de "último contacto").

# Bitácora Beta 3 — Bloque 3: el wizard del lead (trabajar el lead que el foco entrega)

> Registro vivo de la EJECUCIÓN del Bloque 3. Regla de oro: nada ✅ sin el chequeo que lo prueba.
>
> Continúa la línea `bitacora-beta.md` → `bitacora-beta-2.md` (que cerró el Bloque 2 "foco / modo dirección"). El Bloque 3 trabaja el OTRO lado: el foco entrega UN lead; el wizard guía el trabajo de ESE lead. Por eso abre archivo propio.

---

## Estado global

- Bloque 2 (foco / modo dirección) CERRADO en `bitacora-beta-2.md` (2.1 → 2.5).
- **Bloque 3 — wizard del lead. 3.1 (shell) + 3.2 (entrada: ficha → evaluación → opener) + 3.3 (brief + «esperando respuesta») + 3.4 (construcción → draft → self-check + gate proactivo del envío) + 3.5 (en revisión + envío del link / flujo invertido) + 3.6 (seguimiento guiado + agenda) + 3.7 (robustez: boundary del lead + skeleton modo-dirección + single-source de títulos) CERRADOS. BLOQUE 3 CERRADO** (ver CIERRE al pie) — a falta de la pasada perceptual de Franco y de una decisión de producto sobre la numeración «Paso N» (flagueada en 3.7, fuera de scope del wizard).

---

## Sprint 3.1 — Shell del wizard: el micro-paso activo, protagonista · 2026-06-29

**Objetivo.** Que un setter NO-técnico vea CLARAMENTE qué hacer AHORA con el lead abierto, con el progreso visible, sin una página larga indiferenciada. Solo el SHELL/MARCO que orquesta los pasos — NO el contenido de cada `*-step.tsx` (eso es 3.2–3.6).

**Descubrimiento (read-only, subagentes).** Mapa del entrelazado antes de tocar:
- Los 9 `*-step.tsx` se **auto-gatean**: cada uno renderiza su propio `<Card>` (o `<details>` la ficha congelada) con su propio `<h2>` "Paso N" y sus variantes bloqueado/activo/hecho (`variant="subtle"` cuando está bloqueado → ya se atenúan solos). El shell NO puede agregar headers ni manejar su estado por prop; SÍ puede envolver el JSX externo.
- `LeadWizard` se renderiza UNA vez (`page.tsx:222`). La duplicación responsive que menciona `step-anchor.tsx` es anticipatoria (hoy no hay copia real; la guarda `offsetParent===null` queda como blindaje a futuro). Scroll root: `<main overflow-y-auto>` (`setter-shell.tsx:78`), no el window.
- **Línea roja confirmada:** `pasoActual()` (dossier-stepper.tsx) es fuente única del rail Y del scroll-anchor (vía `anchorActivo`). El rail tiene 5 fases pero `pasoActual` devuelve 0,2,3,4,5 → el índice 1 (Evaluación) nunca es "actual" (la evaluación pasa en el límite FICHA↔EVALUADA). Asimetrías intencionales: DESCARTADA (rail bloqueado en 2, scroll a `evaluacion` por el intercept) y EN_REVISION (rail en 4, scroll a `construccion`).

**Propuesta (realce dentro del modelo, NO transformador → se siguió sin parar).** El problema no es que los pasos se vean iguales (los bloqueados/hechos ya se auto-atenúan): falta (a) que el activo SALTE y (b) un cartel en castellano claro de "qué hacer ahora". Dos piezas, ambas derivadas de la MISMA fuente única, así nunca divergen del rail/scroll. Se descartó el modelo "un paso a la vez / colapsar" por transformador (rompe el scroll y mete mano en el contenido de los steps — fuera de este sprint).

**Cambio (3 archivos, solo shell):**
- **NUEVO** `paso-actual-banner.tsx` — `<PasoActualBanner>`, el cartel de "modo dirección" del wizard (hermano liviano del `FocoSurface` del home). `describirFoco(stage, gateAbierto)`: switch exhaustivo que devuelve `{tono, icon, eyebrow, titulo, detalle}`. cyan (`foco`) solo si hay trabajo del setter AHORA; zinc neutral (`espera`/`cerrado`) en revisión, descartado o si falta que el lead responda. Deriva del `stage` + el `gateAbierto` que el shell YA calcula (`gateBriefAbierto`) — lo RECIBE, no lo re-deriva.
- **EDITADO** `step-anchor.tsx` — cuando la sección es la activa (el MISMO prop `active` que dispara el scroll), envuelve el `<Card>` con el marco de acento (barra cyan/zinc a la izquierda + sombra en `foco`) + `aria-current="step"`. Reusa `active` → el marco ES la señal del scroll: no pueden divergir por construcción. El `scrollIntoView` + la guarda `offsetParent` quedan idénticos.
- **EDITADO** `lead-wizard.tsx` — monta el cartel bajo el rail y pasa `frameTone` (tono derivado del mismo `describirFoco`) a los 4 `StepAnchor`. `pasoActual`/`anchorActivo`/el intercept de DESCARTADA/los gates/el orden — intactos. NO se tocó `dossier-stepper.tsx` (la línea roja): solo se IMPORTA `pasoActual`.

**Review adversarial (workflow multi-lente: rail/scroll/stage · react/css · a11y/contraste · DRY/drift; find→verify, solo cuenta lo CONFIRMADO). 6 confirmados:**
- ✅ **HIGH — EVALUADA contradicción (gate-cerrado):** el cartel decía cyan "generá el brief" mientras la card del brief decía "esperá la respuesta del primer contacto". FIX: `describirFoco` ahora recibe `gateAbierto` → EVALUADA sin gate cae a `espera` (zinc) "esperá la respuesta para arrancar el brief". Banda ↔ marco ↔ card, todo coherente.
- ✅ **MEDIUM — APROBADA omitía el gate del envío:** mismo arreglo — sin gate, `espera` "el link se libera cuando el negocio responda (o si es caliente)" (igual que la card de Seguimiento).
- ✅ **HIGH — contraste WCAG AA:** `text-zinc-500` en el detalle de `espera`/`cerrado` daba ~4.27:1 (< 4.5:1). Subido a `text-zinc-400` (~7.9:1).
- ✅ **HIGH — exhaustividad de `describirFoco`:** agregado guard `default: { const _e: never = stage; throw }` (un stage nuevo rompe el build, igual que mi comentario prometía).
- ✅ **MEDIUM — marco sin `overflow-hidden`:** la barra recta asomaba en las esquinas redondeadas del Card. Agregado `overflow-hidden` (mismo patrón que el cartel). Se verificó que el único hijo que se sale (el `EscalarModal`) es un `createPortal` a `<body>` con `fixed` → no se recorta.
- ❌ **RECHAZADO — `pasoActual` sin guard (HIGH):** fuera de scope (archivo de la línea roja `dossier-stepper.tsx`, preexistente, no parte de mi diff) y la premisa ("undefined silencioso") es falsa bajo TS strict: su tipo de retorno `: number` ya hace fallar el build si se agrega un stage. No se tocó.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → exit 0 (post-refactor gate-aware).
- ✅ `eslint` (3 archivos tocados) → 0 problemas.
- ✅ `npm run build` → exit 0 (`/setter/leads/[leadId]` compila).
- ✅ Invariantes: `check:invariant` (assignment-trail) · `check:invariant:flow` (D6) · `check:invariant:foco` (D7) → OK. Sin schema, sin invariante nuevo (es presentación pura).
- ✅ **Funcional + visual (dev:qa :3002, QA `setter`, REVERTIBLE — verificación MEDIDA por eval/inspect, el método del repo para pantallas LeadOS pesadas):** los 7 stages + null recorridos con leads QA reales. Matriz cartel↔marco verificada por color (oklab) y zona:
  - FICHA → cartel cyan "Cargá la ficha", SIN marco (anchor null, la ficha editable ya es la card protagonista arriba).
  - EVALUADA (gate-cerrado) → cartel zinc "EN ESPERA · Brief", marco **neutral** en "Paso 3 — Brief" (coincide con la card bloqueada).
  - BRIEF/CONSTRUCCION → cartel cyan, marco **cyan** en "Paso 4 — Construcción".
  - RECHAZADA → cartel cyan "Aplicá las correcciones", marco cyan en Construcción + el Callout rosa coexiste (orden DOM: rail → cartel → callout).
  - EN_REVISION → cartel zinc "Franco está revisando", marco **neutral** en Construcción (disciplina B9: sin cyan donde el setter no acciona).
  - APROBADA (caliente) → cartel cyan "Enviá el link", marco cyan en "Seguimiento".
  - DESCARTADA → cartel zinc "RESULTADO · Lead descartado", marco neutral en "Paso 2 — Evaluación"; SOLO renderizan ficha (colapsada) + evaluación (intercept OK).
  - Siempre exactamente 1 `aria-current="step"`; mobile 480px sin overflow horizontal (doc y `<main>`).
- ⚠️ **Screenshots NO capturados:** la ventana del browser de preview reporta `visibilityState:"hidden"` en este entorno → `preview_screenshot` se cuelga a 30s (eval/inspect sí funcionan). Se verificó por geometría/medición (método endorsado para LeadOS pesado). **Pendiente para Franco: pasada visual a ojo.**
- ✅ `npm run test:e2e` → **32 passed / 10 failed / 8 skipped — idéntico a la base 32/10/8**. Los 10 fallos son los preexistentes (visual-regression `01-moke-admin`/`20-rd-chatbot`/`22`/`61-dashboard` + `16-admin-bulk-actions` + `30-onboarding` cliente) — ninguno toca `/setter` ni el wizard. Ningún verde se rompió; el cambio es e2e-inalcanzable (no hay spec de `/setter`).

**Restricciones respetadas (líneas rojas):** modelo stage-driven intacto (sin `router.push`, sin estado de paso local). `pasoActual` NO tocado (solo importado) → rail y scroll siguen coincidiendo en los 8 stages (verificado por medición). Intercept de DESCARTADA antes del switch, gates y `transitionDossier` sin tocar. Aislamiento/ownership intactos. Solo el shell — ningún `*-step.tsx` modificado.

**Salida:** el wizard ahora abre con un cartel de dirección ("Tu paso ahora / En espera / Franco está revisando / Resultado") en castellano claro + el paso activo enmarcado en cyan (o zinc cuando no es accionable), mientras los bloqueados/hechos se atenúan solos. El no-técnico ve qué hacer de un vistazo sin perder el mapa (rail) ni el contexto (pasos hechos read-only, futuros bloqueados). Cero cambios al modelo stage-driven ni a la fuente única `pasoActual`.

**Pendientes flagueados a Franco (no bloqueantes):**
1. **Pasada visual a ojo** del cartel+marco en los stages (los screenshots no se pudieron capturar por el `visibilityState:hidden` del entorno; todo lo demás verificado por medición).
2. **APROBADA gate-cerrado** (cartel "En espera · el link se libera…") quedó verificado por LÓGICA (mismo branch que EVALUADA gate-cerrado, que sí se observó) pero no por dato: el único lead APROBADA seedeado es caliente (gate abierto).

---

## Sprint 3.2 — Pasos de entrada guiados: ficha → evaluación → opener · 2026-06-29

**Objetivo.** Que un setter NO-técnico entienda el CONTENIDO de los tres primeros pasos —cargar la ficha, evaluar el lead, escribir el opener— y que los TRES gates de esos pasos queden CLAROS (no rehechos): señal mínima de ficha (`fichaFaltantes`), descarte automático score≤2, y link prohibido en el opener (`contieneLink`, flujo invertido). Solo GUÍA/contenido — cero lógica, gates, schemas o transiciones.

**Descubrimiento (read-only, subagente `Explore` + lectura directa):**
- **Capa de contenido ya instalada (FG-1):** `guidance-content.ts` es la fuente única tipada; `TeachPanel` consume `porque`+`ejemplos`. La **ficha** está totalmente migrada (`GUIA_FICHA`) con nudges advisory de `ficha-calidad.ts` (FG-1.3, ORIENTAN, no gatean) y `FichaEjemplo` (FG-1.4). El **opener** ya tenía `TeachPanel id="opener"` (FG-1.2). La **evaluación** NO tenía entrada en `GUIA_PASOS` ni teach: `CRITERIOS` y labels/hints hardcodeados en el componente — el hueco más grande.
- **Cómo se comunicaba cada gate hoy:** `fichaFaltantes` → caja amber con la lista, sin decir el PORQUÉ del mínimo. score≤2 → caja inline + modal + label del botón (bien, pero hardcodeado). `contieneLink` → error rosa de una línea **solo al tipear un link** + botón `disabled` (el "por qué" terso y enterrado en el teach colapsado — el "botón disabled mudo" que el task pedía romper).
- **Línea roja (3.1):** `pasoActual`, `describirFoco`, `PasoActualBanner`, `StepAnchor` — no se tocan. Los gates (`fichaFaltantes`/`fichaTieneSenal` en `flow.ts`, el chain score≤2 en `dossier.actions.ts`, `contieneLink` en `flow.ts` + `OpenerInputSchema`) — se RESPETAN y EXPLICAN, no se rehacen.

**Cambio (4 archivos, capa de contenido — espeja FG-1.0/1.2):**
- **`guidance-content.ts`** — 2 tipos aditivos: `CriterioGuia` (qué mira un evaluador externo) y `GateGuia` (`titulo` + `detalle: LineaRica` — explica un gate en idioma del setter; el TONO lo elige el componente). 2 campos opcionales en `PasoGuia`: `criterios?` / `gate?`. **`GUIA_EVALUACION` NUEVO** (intro, `criterios` migrados, `campos` score/veredicto/razonamiento, `gate` para el score≤2, `porque`+`ejemplos` teach sobre transcribir fiel). `GUIA_OPENER` ampliado con `intro` (migrado del componente) + `gate` (el PORQUÉ del link block: "abre conversación, no vende → se lee como publicidad / spam → el link viaja en el 2.º mensaje con la demo, desde Seguimiento"). `GUIA_FICHA.validacion.pendienteTitulo` enriquecido: ahora dice el PORQUÉ del mínimo ("El Evaluador no puede juzgar a ciegas: necesita esta señal mínima para puntuar. Todavía falta:"). `GUIA_PASOS` registra `evaluacion`. `GUIA_EVALUACION`/`GUIA_OPENER` pasan a `export` (los consume el step directo, como `GUIA_FICHA`).
- **`teach-panel.tsx`** — `LineaRicaText` pasa a `export` (un solo render de `LineaRica`, no se duplica el map) + prop opcional `emphasisClassName` (default neutro; el gate rosa del opener pasa el suyo). Sin tocar la lógica del panel.
- **`evaluacion-step.tsx`** — lee intro/criterios/labels/hints de `GUIA_EVALUACION`; suma `<TeachPanel id="evaluacion">` (colapsado, complemento); la caja del score≤2 ahora se arma desde `gate` (tono zinc B9: desenlace neutro, no error). Cero cambio de lógica/gates/submit/modal.
- **`opener-step.tsx`** — intro desde `GUIA_OPENER.intro`; la caja del link block ahora es un `[role="alert"]` rosa con `gate.titulo` + `gate.detalle` (el PORQUÉ completo) — el botón sigue `disabled` pero con la explicación al lado, NO mudo.

**Disciplina B9 sostenida:** cyan = accionable (intacto); teach/criterios = neutro; el gate del opener = rosa (bloqueo/error); el descarte score≤2 = zinc (desenlace neutro, no fracaso). El contenido es agnóstico al tono; cada componente aplica el suyo.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → exit 0 (atrapó 2 errores en la primera pasada: `GUIA_EVALUACION`/`GUIA_OPENER` sin `export` → `any` implícito en `criterio`; corregido con los `export`, re-verde).
- ✅ `eslint --max-warnings 0` sobre los 4 archivos → 0 problemas.
- ✅ `npm run build` → exit 0 (`/setter/leads/[leadId]` compila; baseline pre-sprint también verde).
- ✅ Invariantes `check:invariant:flow` (D6) y `check:invariant:foco` (D7) → OK (es presentación pura, no toca lógica; sin schema, sin invariante nuevo).
- ✅ `prisma migrate status` → up to date (73 migraciones). El bug histórico de `schema.prisma` (enum `BOT_DELETED` duplicado, P1012) ya está resuelto (solo L192).
- ✅ **Runtime — opener verificado en prod-QA (`next-prod-qa` :3001, sesión `setter` por `/api/qa/login`, hidratado e interactivo):** la migración del intro renderiza con énfasis ("dolor-first"); al inyectar un link por el `onChange` real del fiber → la caja rosa `[role="alert"]` muestra el PORQUÉ completo ("abre una conversación, no vende… se lee como publicidad… Instagram lo manda a spam… segundo mensaje, con la demo ya aprobada… desde «Seguimiento»") con los fragmentos en `<strong>`, y el botón "Ya lo mandé…" queda `disabled` CON la explicación al lado (no mudo). Al limpiar el link → la caja desaparece, el botón se re-habilita y aparece el bloque "listo para pegar". `TeachPanel` del opener presente. Screenshot capturado (1600px). Cero errores de consola.
- ✅ **Los 7 leads del setter cargan 200** con el resumen de evaluación, sin romper.

**⚠️ Pendiente de verificación perceptual flagueado a Franco (verificado por build/tsc + código + evidencia transitiva, NO observado en runtime):**
1. **Form ACTIVO de evaluación** (`GUIA_EVALUACION`: intro + criterios + teach + hints de score/veredicto/razonamiento + caja score≤2) y **la caja de señal mínima nueva de la ficha**: NO alcanzables en runtime — **ningún lead asignado a la persona `setter-qa` está en stage FICHA** (los 7 ya tienen evaluación → muestran el resumen; los leads QA de FICHA/EVALUADA del sprint 0.3 son de `franco`, no del setter). El render reusa los MISMOS mecanismos confirmados en vivo en el opener (`LineaRicaText`, contenido tipado) y en la ficha (map de campos). Para la pasada: abrir un lead **setter-owned en FICHA** con ficha incompleta (ver la caja "El Evaluador no puede juzgar a ciegas") y luego completa (ver el form de evaluación + seleccionar score 1–2 para ver la caja de descarte).
2. **dev:qa (`next-dev-qa` :3002) NO hidrata el wizard** (textarea sin React fiber, confirmado desde el page-world) — coherente con la deuda documentada "hidratación rota en dev:qa para pantallas LeadOS pesadas". La verificación interactiva se hizo en **prod-QA :3001** (que sí hidrata y NO rebota a :3000 con este build). Caveat de IPv6: el browser de preview resuelve `localhost`→`::1` donde Next no escucha; navegar por `127.0.0.1` explícito.

**Restricciones respetadas (líneas rojas):** cero cambios a `pasoActual`/`describirFoco`/`PasoActualBanner`/`StepAnchor`. Los 3 gates intactos (`fichaFaltantes`, chain score≤2, `contieneLink` + schema) — solo se EXPLICAN. Modelo stage-driven, autosave, ownership/aislamiento sin tocar. Los nudges advisory de la ficha (FG-1.3) NO se convirtieron en gate. Solo contenido + presentación; tipado estricto, cero `any`.

**Salida:** los tres pasos de entrada explican qué hacer y por qué, y los tres gates dejan de ser mudos — la ficha dice por qué pide señal mínima, la evaluación enseña a transcribir fiel + por qué el score≤2 descarta, y el opener explica por qué el link no va todavía (en vez de un botón deshabilitado sin razón). Todo el copy vive en `guidance-content.ts`, editable por Franco en un solo archivo.

---

## Sprint 3.3 — Brief de diseño guiado + el estado «esperando respuesta» · 2026-06-29

**Objetivo.** Que el setter entienda QUÉ completar en el brief (el paso que dispara la demo) y, cuando el gate EVALUADA→BRIEF está cerrado, POR QUÉ todavía no puede — con un estado «esperando respuesta» claro y coherente con el cartel del wizard (3.1). Solo GUÍA/contenido + el estado de espera: cero lógica, gates o transiciones.

**Descubrimiento (read-only, subagente `Explore` + lectura directa):**
- **admin-1d ya alineó UI y server al MISMO gate.** El server (`guardarBrief` → `transitionDossier`, `dossier.ts` case `BRIEF`) y la UI (`lead-wizard.tsx:118` → prop) llaman ambos a `gateBriefAbierto(status, caliente)` (`flow.ts:77` = `leadRespondio(status) || esCaliente(caliente)`). `brief-step` **recibe** `gateAbierto` por prop — no lo re-deriva. Confirmado: una sola copia de la regla, no divergen.
- **`'brief'` ya estaba en `GuiaPasoId` pero SIN `GUIA_BRIEF`** (el hueco que llena este sprint, igual que 3.2 sumó `GUIA_EVALUACION`). El copy del brief estaba hardcodeado en `brief-step.tsx` (intro, labels/hints, y el estado de espera).
- **El copy viejo de la espera era INEXACTO.** Decía «cuando responda (o si la evaluación hubiera dado 4–5), este paso se abre solo». Pero `dossier.actions.ts:152-166` (admin-1c): un score ≥ 4 **NO** abre el gate ni marca `caliente` — solo dispara un aviso INFORMATIVO para que Franco CONSIDERE marcarlo; `caliente` es campo exclusivo de Franco (admin-1b). El gate real es `respondió ∨ caliente`. Se corrigió.

**Cambio (2 archivos de contenido/presentación + 1 de tooling — espeja 3.2):**
- **`guidance-content.ts`** — **`GUIA_BRIEF` NUEVO** (`export const`, consumido directo por el step como `GUIA_FICHA`/`GUIA_EVALUACION`): `titulo`, `intro` (migrada), `campos` (claves 1:1 con el estado del form: pegadoGem/titulo/cta/seccionesTexto/concepto/notasMarca — labels + hints; `titulo` suma hint nuevo), `gate` (el estado «esperando respuesta»: `titulo` «Esperando la respuesta del primer contacto» + `detalle` rica «el brief se abre cuando el negocio responde… —o si Franco lo marca caliente—… mandá el opener y registrá en Seguimiento… se abre solo»), y `porque`+`ejemplos` (teach: el brief es el plano; esto-sí/esto-no de secciones concretas vs plantilla). Registrado `brief: GUIA_BRIEF` en `GUIA_PASOS`.
- **`brief-step.tsx`** — consume `GUIA_BRIEF`: título unificado en las 5 ramas (single-source); `intro` + labels/hints de los 6 campos desde `GUIA_BRIEF`; suma `<TeachPanel id="brief">`. El estado de espera (rama `EVALUADA && !gateAbierto`) reconstruido desde `gate` (tono **zinc** = espera, no bloqueo; detalle en `text-zinc-400` para AA ≥ 4.5:1, igual que el fix de 3.1; corrige el copy inexacto del 4–5). `LineaRicaText`/`TeachPanel` reusados (mismos primitivos que el opener en 3.2). **Cero cambio** a `formVisible`/`mostrarFormulario`/autosave/`guardar`: `gateAbierto` se RECIBE.
- **`.claude/launch.json`** — + config `next-prod-qa` (:3001, `npm run start:qa`) para documentar el server prod-QA que referencia la memoria.

**Disciplina B9 sostenida:** cyan = accionable (el form abierto, intacto); teach/labels = neutro; el estado de espera = zinc (desenlace neutro, no error/bloqueo). El contenido es agnóstico al tono; el componente aplica el suyo.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → exit 0 (valida el acceso tipado `GUIA_BRIEF.campos.*`, `gate.detalle: LineaRica`, `TeachPanel id="brief"`).
- ✅ `eslint --max-warnings 0` sobre los 2 archivos → 0 problemas.
- ✅ `npm run build` → exit 0 (`/setter/leads/[leadId]` compila).
- ✅ Invariantes `check:invariant:flow` (D6) + `check:invariant:foco` (D7) → OK (presentación pura; sin schema, sin invariante nuevo).
- ✅ `prisma migrate status` → up to date (73 migraciones).
- ✅ **Runtime — AMBOS gate states en prod-QA (`next start:qa` :3001, sesión `setter` por `/api/qa/login`, MEDIDO sobre el SSR — método del repo para LeadOS pesado; la página renderiza 200 SIN rebote a :3000 con la cookie de sesión):**
  - **gate-CERRADO** (lead QA-B7 «Estética Bella Vista», EVALUADA · DEMO_ENVIADA · caliente=false): el estado de espera muestra el copy nuevo (`gate.titulo` + `detalle`: «el negocio responde el primer contacto», «Franco lo marca caliente», «Mientras tanto, mandá el opener», «este paso se abre solo»); el copy viejo del 4–5 **AUSENTE**; el banner coincide («En espera» + «esperá la respuesta del primer contacto para arrancar el brief»).
  - **gate-ABIERTO** (flip REVERTIBLE `caliente=true` sobre el mismo lead): el FORM muestra `intro` + TeachPanel («¿Por qué importa?» + esto-sí/esto-no) + los 6 labels + el hint nuevo del título + el CopyBlock; el banner cambia a «Tu paso ahora · generá el brief». **Revertido** a `caliente=false` (re-verificado: espera restaurada, banner «En espera», «generá el brief»=0). Scripts QA temporales borrados.

**Restricciones respetadas (líneas rojas):** cero cambios a `gateBriefAbierto`/`transitionDossier`/`guardarBrief`/`describirFoco`/`PasoActualBanner`. `gateAbierto` se RECIBE, no se re-deriva. Modelo stage-driven, autosave, ownership/aislamiento sin tocar. Solo contenido + presentación; tipado estricto, cero `any`.

**⚠️ Pendiente flagueado a Franco (no bloqueante):** **pasada visual a ojo** del estado de espera y del form — los screenshots no se capturan en este entorno (`visibilityState:hidden` → `preview_screenshot` cuelga, igual que 3.1/3.2). Todo lo demás verificado por medición del SSR en prod-QA (copy presente/ausente + coherencia con el banner, en ambos gate states).

**Salida:** el brief dice qué completar (intro + teach + labels/hints, todo en `GUIA_BRIEF` editable por Franco) y el estado de espera dice por qué no abre aún —el negocio tiene que responder, o Franco marcarlo caliente— coherente con el cartel del wizard, sin el «4–5 se abre solo» que era falso. El gate sigue decidiéndose en `flow.ts`; el step solo lo EXPLICA.

---

## Sprint 3.4 — Construcción guiada + self-check + el gate proactivo del envío · 2026-06-29

**Objetivo.** Que el setter entienda la construcción (arrancar → draft) y el self-check (qué revisar, por qué Franco lo va a ver, los hard-blocks), y que «Enviar a revisión» quede disabled CON explicación — no un rebote mudo —, manteniendo la re-validación server. Solo GUÍA/contenido + presentación del gate; cero lógica, gates o transiciones.

**Descubrimiento (read-only, subagente `Explore` + lectura directa):**
- **`construccion-step` YA estaba bien guiado** (TeachPanel `id="construccion"`, `SHELL_CONSTRUCCION`, materiales reales, urgencia/retrabajo, copy de «Arrancar construcción»). El gap real: **draft** (hardcodeado, sin guidance ni `'draft'` en `GUIA_PASOS`) y **self-check** (intro/headers hardcodeados).
- **El «rebote mudo» del botón — premisa PARCIALMENTE FALSA.** `self-check-step` ya maneja los dos casos proactivamente: draft-missing → early-exit (`:102`) que bloquea el paso con motivo; check-not-passed → botón `disabled={!todosDurosOk}` + Callout. No hay rebote mudo alcanzable por UI. Y `draftUrl` no se puede limpiar por UI (`DraftUrlInputSchema` exige URL válida) → un `|| !draftUrl` en el botón sería **dead-code** (el early-exit ya lo cubre; el server es el backstop) → NO se agregó.
- **Líneas rojas:** `enviarARevision` (gate `draftUrl` + `selfCheckAprobado`, `dossier.actions.ts`), `selfCheckAprobado`/`HARD_CHECKS`/`SOFT_CHECKS` (`flow.ts`/`flow-content.ts`) — se RESPETAN y EXPLICAN.

**Cambio (4 archivos, capa de contenido + presentación del gate):**
- **`guidance-content.ts`** — `PasoGuia` suma `pasos?: readonly string[]` (instructivo ordenado mecánico). **`GUIA_DRAFT` NUEVO** (`export`, registrado): `titulo`/`intro`/`pasos` (las INSTRUCCIONES migradas)/`campos.draftUrl`. `GUIA_CONSTRUCCION` → `export` + `intro` (el encuadre de arrancar). `GUIA_SELF_CHECK` → `export` + `intro` (migrada) + `gate` (`GateGuia`: el envío se habilita con todo en verde; último filtro antes de Franco; un check falso vuelve como rechazo).
- **`construccion-step.tsx`** — la intro de arranque (rama BRIEF) migrada a `GUIA_CONSTRUCCION.intro` (`LineaRicaText`). Nada más tocado (el paso ya estaba guiado).
- **`draft-step.tsx`** — consume `GUIA_DRAFT`: título unificado en las 4 ramas, `intro`, `pasos` (la `<ol>` ahora desde `GUIA_DRAFT.pasos`), `campos.draftUrl` label/hint. Borrado el `const INSTRUCCIONES` local.
- **`self-check-step.tsx`** — `intro` desde `GUIA_SELF_CHECK`; el **draft-lock** refinado (explícito: «el paso de arriba», «no el export local», AA `text-zinc-400`); el **callout del gate** ahora es guidance-driven y cuenta los faltantes («Quedan N obligatorios en rojo» + `gate.titulo` + `gate.detalle`), pegado al botón. Botón sigue `disabled={!todosDurosOk}` (sin dead-code de draftUrl). El `enviar()` guarda-y-reenvía; el server re-valida — intacto.

**Disciplina B9 sostenida:** cyan = accionable; teach/guía = neutro; el gate del envío = neutral (es una espera con motivo, no un error). El draft-lock = lock zinc (precondición). Cada componente aplica su tono; el contenido es agnóstico.

**Verde (nada ✅ sin chequeo):**
- ✅ `npx tsc --noEmit` → exit 0 (valida `GUIA_DRAFT.pasos.map`, `campos.draftUrl.*`, `GUIA_SELF_CHECK.gate`, `Callout title`).
- ✅ `eslint --max-warnings 0` (4 archivos) → 0.
- ✅ `npm run build` → exit 0 (`/setter/leads/[leadId]`).
- ✅ Invariantes `check:invariant:flow` (D6) + `:foco` (D7) → OK. `prisma migrate status` → up to date (73).
- ✅ **Runtime — los 3 estados del gate en prod-QA (`start:qa` :3001, sesión `setter`, SSR MEDIDO; lead QA «Noir Dining» CONSTRUCCION; flips REVERTIBLES de `draftUrl`/`selfCheckJson` con backup+restore):**
  - **A — draft + 6/6 verde:** self-check `intro` + success callout; botón «Enviar a revisión» **habilitado** (`disabled=""`=0 en todo el doc); draft en estado verificado (link + «Cambiar el link»); vista de construcción intacta.
  - **B — sin draft:** draft-capture guiado (`GUIA_DRAFT` intro + 4 pasos + field label/hint) + self-check **draft-lock** refinado; el form activo NO aparece.
  - **C — draft + selfCheck vacío:** self-check activo + botón **disabled** (`disabled=""`=1 exacto, vs 0 en A) CON explicación proactiva («Quedan 6 obligatorios en rojo» + `gate.titulo` + `detalle`); success ausente.
  - Lead **restaurado** a su estado original (draft + 6/6, botón habilitado). Scripts QA temporales borrados.

**⚠️ Pendiente flagueado a Franco (no bloqueante):** la **intro de arranque** (`GUIA_CONSTRUCCION.intro`, rama BRIEF) no se alcanzó en runtime — ningún lead `setter-qa` está en stage BRIEF. Es una migración de una línea (`LineaRicaText`), mismo mecanismo verificado en las otras intros (draft/self-check confirmadas en vivo).

**Cómo quedó el gap del botón.** La premisa «rebote mudo» estaba **mayormente cubierta** (draft → lock proactivo; check → disabled + callout). 3.4 lo dejó **más claro y guidance-driven**: el lock del draft ahora es explícito (publicá el draft, no el export local) y el callout del check cuenta los faltantes + el porqué (`GUIA_SELF_CHECK.gate`), pegado al botón disabled. NO se agregó `|| !draftUrl` al botón (sería dead-code: el early-exit lo cubre y la URL no se puede vaciar por UI). La re-validación server (`enviarARevision`) queda intacta como backstop — verificado que el botón está disabled exactamente cuando faltan obligatorios.

**Salida:** la construcción se explica de punta a punta —arrancar, publicar el draft (instructivo en `GUIA_DRAFT`), y el self-check (qué revisar + por qué Franco lo ve, en `GUIA_SELF_CHECK`)— y el envío queda disabled CON el motivo al lado (cuántos faltan + el porqué), nunca mudo. Todo el copy editable por Franco en `guidance-content.ts`; el gate sigue decidiéndose en `flow.ts`/`dossier.actions.ts`.

---

## Sprint 3.5 — El estado «en revisión» + el envío del link (el flujo invertido) · 2026-06-29

**Objetivo.** Que el setter entienda los dos estados post-construcción: EN_REVISION (la pelota la tiene Franco — esperá, nada que hacer ahora) y APROBADA (el envío guiado: cuándo, cómo, y el gate claro). ESTE es el momento BISAGRA del flujo invertido — el link de la demo SALE acá y solo acá. Solo GUÍA/contenido + presentación del gate; CERO lógica, gates o transiciones.

**LÍNEA ROJA MÁXIMA (intacta, ni rozada):** el link nunca viaja antes de (a) Franco aprueba Y (b) el lead respondió o es caliente. Lo enforcan `gateEnvioDemo` (`flow.ts:88-99` — `APROBADA && finalUrl && gateBriefAbierto`) + el claim atómico `marcarDemoEnviadaOwned` (`dossier.ts:365-380` — `updateMany where enviadaAt:null` = un solo OsDemo aunque haya doble click) + la re-validación server en `enviarDemoAprobada` (`outreach.actions.ts:223-230`). NADA de eso se tocó: el `git diff` no roza esos tres archivos.

**Descubrimiento (read-only, subagente `Explore` + lectura directa):**
- **El banner de 3.1 (`describirFoco`) YA dirige EN_REVISION y APROBADA** (EN_REVISION → zinc «Franco está revisando»; APROBADA → cyan «Enviá el link» / zinc «el link se libera…» según gate). El gap NO es la dirección: es el COPY hardcodeado del envío y de las notas «lo que sigue».
- **`seguimiento-step.tsx`** ya tenía el envío bien estructurado y el gate proactivo: el bloque deriva 3 estados (`demoEnviada` / `puedeEnviar && finalUrl` / el «todavía no»), y el «todavía no» ya ramificaba en 3 sub-mensajes según qué falta. Todo hardcodeado. `puedeEnviar` llama a `gateEnvioDemo` (no re-deriva el criterio) — el step RECIBE el veredicto del gate, correcto.
- **`lead-wizard.tsx`** tenía `POST_BRIEF_NOTAS` (EN_REVISION + APROBADA) hardcodeado en la card «Lo que sigue».

**Cambio (3 archivos, capa de contenido + presentación):**
- **`guidance-content.ts`** — **`GUIA_REVISION` NUEVO** (`export`): las dos notas «lo que sigue» (`enRevision` / `aprobada`) como `LineaRica`, que espejan el banner sin contradecirlo. **Tipo `EnvioGuia` + `GUIA_ENVIO` NUEVOS** (`export`): `intro` (la disciplina: «el link sale acá y solo acá»), `listo` (header del momento), `preventivo` (camino caliente), `copyBlock`, `enviada` (confirmación → la reunión), y `espera` con los TRES mensajes del «todavía no» — porque el gate del flujo invertido tiene DOS condiciones independientes (Franco aprueba · el negocio engancha) y el porqué-todavía-no depende de cuál falta (`aprobadaSinEnganche` / `engancheSinAprobar` / `niEngancheNiAprobada`). Cero lógica: el componente deriva CUÁL; acá viven solo las palabras.
- **`seguimiento-step.tsx`** — el bloque de envío consume `GUIA_ENVIO` (header `listo`, intro de disciplina, `preventivo`, `copyBlock`, `enviada`); el «todavía no» ahora es `<LineaRicaText>` con el ternario IDÉNTICO (`stage==='APROBADA' ? espera.aprobadaSinEnganche : respondio ? espera.engancheSinAprobar : espera.niEngancheNiAprobada`) — solo migraron los strings, la rama no cambió. Color del «todavía no» subido `zinc-500 → zinc-400` (AA). El botón «Ya la envié», `registrarEnvioDemo`, `puedeEnviar`/`gateEnvioDemo` — sin tocar.
- **`lead-wizard.tsx`** — `POST_BRIEF_NOTAS` (Record hardcodeado) reemplazado por una derivación directa a `GUIA_REVISION.enRevision`/`.aprobada` (`LineaRicaText`); color `zinc-500 → zinc-400` (AA). `gateBriefAbierto`/anchors/props de steps — intactos.

**Disciplina B9 sostenida:** cyan = accionable (el envío cuando el gate abre); el «todavía no» = neutral zinc (espera con motivo, no error); el banner manda la dirección, las notas/copy la espejan. El contenido es agnóstico de tono; cada componente lo aplica.

**Verde (nada ✅ sin chequeo):**
- ✅ `tsc --noEmit` → exit 0 (valida `EnvioGuia`, `GUIA_ENVIO.espera.*`, `GUIA_REVISION`, los consumos por `LineaRicaText`).
- ✅ `eslint` (3 archivos) → 0 nuevos. (1 error PRE-EXISTENTE, ajeno: `react-hooks/purity` sobre `new Date(Date.now())` en `seguimiento-step.tsx:200` — el `min` del date-picker de POSTERGADO, en HEAD, fuera de mi diff. Flagueado, no tocado.)
- ✅ `npm run build` → exit 0.
- ✅ Invariantes `flow` (D6) + `foco` (D7) → OK. `prisma migrate status` → up to date (73).
- ✅ **Runtime — estados en prod-QA (`start:qa` :3001, sesión `setter`, SSR MEDIDO; flips REVERTIBLES con backup+restore):**
  - **«Gimnasio Atlas» (APROBADA + finalUrl + caliente, no respondió → ready-preventivo):** `listo` + `intro` («sale acá y solo acá») + `preventivo` (camino caliente) + `copyBlock` + botón «Ya la envié» PRESENTE (gate abierto); nota «lo que sigue» `aprobada`; banner cyan «Enviá el link de la demo».
  - **«Panadería Doña Rosa» (RESPONDIO + EN_REVISION):** banner zinc «Franco está revisando tu demo»; nota `enRevision` («en revisión de Franco»); el «todavía no» del envío = `engancheSinAprobar` («cuando Franco apruebe la demo»).
  - **Atlas flipeado a gate-CERRADO (APROBADA, finalUrl=null):** el «todavía no» = `aprobadaSinEnganche` («el link se libera cuando el negocio responda») y el botón «Ya la envié» AUSENTE — el envío NO se ofrece sin URL. Lead restaurado a su original (APROBADA/url/caliente). Script QA temporal borrado.
  - **CIERRA el pendiente #2 de 3.1** (APROBADA gate-cerrado, antes solo verificado por lógica): ahora observado por dato — mensaje correcto + botón ausente.

**Cómo quedó el flujo invertido.** Reforzado en palabras, intacto en lógica. El copy ahora NOMBRA la disciplina en el momento del envío («el link sale acá y solo acá — nunca en el opener ni antes de que Franco apruebe») y el «todavía no» dice CUÁL de las dos condiciones falta. El gate (`gateEnvioDemo`), el claim atómico y la re-validación server quedan EXACTAMENTE como estaban — verificado en runtime que el botón aparece SOLO con el gate abierto (Atlas caliente) y desaparece al cerrarlo (Atlas sin URL). No se debilitó nada: solo se explicó mejor.

**Salida:** EN_REVISION dice claro que la pelota la tiene Franco (esperá), coherente con el banner; APROBADA guía el envío (cuándo: ya aprobada + enganche; cómo: copiar y confirmar) y el gate proactivo dice por qué todavía no cuando falta. Todo el copy editable por Franco en `guidance-content.ts`; el gate sigue decidiéndose en `flow.ts`/`dossier.ts`/`outreach.actions.ts`.

**Pendientes flagueados a Franco (no bloqueantes):**
1. **Pasada PERCEPTUAL a ojo** (desktop + mobile) del bloque de envío y las notas — el SSR-curl prueba que el copy RENDERIZA en cada estado, no cómo se VE (spacing, jerarquía).
2. `espera.niEngancheNiAprobada` (lead no respondió + no aprobada + con contacto) no se alcanzó por dato — mismo `LineaRicaText` que los otros dos `espera` ya observados, rama tsc-verificada.
3. **PRE-EXISTENTE (ajeno a 3.5):** `react-hooks/purity` en `seguimiento-step.tsx:200` (`new Date(Date.now())` como `min` del date-picker). El build no bloquea por él, pero `eslint` sí. Fix correcto requiere cuidado SSR (módulo-scope congela el valor en el server) — candidato a sprint propio.

---

## Sprint 3.6 — Seguimiento guiado + agenda · 2026-06-29

**Objetivo.** Cerrar el wizard: que el setter entienda el seguimiento post-demo (el negocio responde / no responde, la cadencia) y la agenda (cómo ofrecer horarios y confirmar, con el gate RESPONDIO claro). Solo GUÍA/contenido + presentación del gate; CERO lógica, gates, actions ni transiciones.

**LÍNEA ROJA (intacta, ni rozada):** las actions de agenda (`agenda.actions.ts`: `gateAgenda`/`ofrecerHorarios`/`confirmarReunion`), los claims atómicos (`marcarAgendandoOwned`), la re-validación fresca del slot y la transición →CALL_AGENDADA (vía `registrarContactoComercial`). El `git diff` NO toca `agenda.actions.ts` ni ninguna action.

**Descubrimiento (read-only):**
- **`seguimiento-step.tsx`** — el registro de resultados (`OPCIONES`) y el recuadro de cadencia (`cadenciaInfo`, `PLANTILLAS_FOLLOW_UP`) ya existían, hardcodeados. El **gap de la probe:** «Registrar resultado» (`<Button disabled={resultado === null}>`) quedaba disabled **sin explicación** cuando no hay opción elegida.
- **`agenda-step.tsx`** — el flujo (decisor → buscar horarios → ofrecer → marcar → confirmar) y el estado locked ya estaban; el copy del gate (`status !== 'RESPONDIO'`) era una frase hardcodeada, sin nombrar el porqué.
- **Cadencia:** `follow-up.ts: calculateNextFollowUp` = +2/+2/+3 y corte (3 toques). El cálculo manda; faltaba **hacer legible el ritmo** al setter.

**Cambio (3 archivos, capa de contenido + presentación):**
- **`guidance-content.ts`** — campo NUEVO `cadencia?: LineaRica` en `PasoGuia` (el ritmo en palabras; el cómputo sigue en `follow-up.ts`). **`GUIA_SEGUIMIENTO` NUEVO** (`export`): `intro` (registrás cada toque, la maquinaria mueve estado+cadencia, vos no calculás fechas), `cadencia` (el +2/+2/+3-stop legible), `porque`/`ejemplos` (qué hacer cuando responde / cuando no — esto-sí/esto-no). **`GUIA_AGENDA` NUEVO** (`export`): `intro` (el momento «sí, reunámonos» → 3 horarios reales + booking, Cal.com manda confirmación/recordatorio), `pasos` (el how-to real de la pantalla), `gate` (por qué espera hasta RESPONDIO — no es trigger automático). Ambos registrados en `GUIA_PASOS` (`seguimiento`, `agenda`). El traspaso/objeciones siguen en sus `GUIA_*` propias.
- **`seguimiento-step.tsx`** — h2 ← `GUIA_SEGUIMIENTO.titulo`; `intro` como subtítulo (`LineaRicaText`); `<TeachPanel id="seguimiento" />` (porqué responde/no responde); pie del recuadro de cadencia ← `GUIA_SEGUIMIENTO.cadencia`, gated `!respondio && status!=='POSTERGADO' && !cadencia.agotada` (el cierre lo cubre la línea ámbar de «cadencia completa» — no se repiten). **Gap del botón:** hint `«Elegí arriba qué pasó… para habilitar el registro»` visible cuando `resultado === null`, pegado al botón disabled. El botón, `registrar`, `OPCIONES`, la cadencia y el bloque de envío (3.5) — sin tocar.
- **`agenda-step.tsx`** — h2 ← `GUIA_AGENDA.titulo`; `intro` como subtítulo; `pasos` como `<ol>` (mismo idiom que `GUIA_DRAFT.pasos` en draft-step); estado locked: CALL_AGENDADA mantiene su copy de caso-borde, el resto (espera del gate) ahora muestra `gate.titulo` + `gate.detalle` (tono zinc = espera, igual que el gate de brief-step). El checkbox decisor, `buscarHorarios`, `confirmar`, `ConfirmarReunionSchema` y la card de «Reunión agendada» — sin tocar.

**Verde (nada ✅ sin chequeo):**
- ✅ `npm run build` (`next build --webpack`) → exit 0 (`/setter/leads/[leadId]` en el árbol de rutas; valida `GUIA_SEGUIMIENTO.intro/cadencia`, `GUIA_AGENDA.intro/pasos/gate.*` por los consumos `LineaRicaText` / `.map`).
- ✅ `eslint` (3 archivos) → 0 nuevos. (1 error PRE-EXISTENTE, ajeno: `react-hooks/purity` sobre `new Date(Date.now())` en `seguimiento-step.tsx:198` — el `min` del date-picker de POSTERGADO; estaba en HEAD en :200, se corrió a :198 porque colapsé un `<h2>` de 3→1 líneas arriba. Fuera de mi diff. Flagueado, no tocado — candidato a sprint propio, mismo de 3.5.)
- ✅ `npx prisma migrate status` → *Database schema is up to date!* (74 migs; cero migraciones — es contenido + presentación).

**⚠️ Runtime NO auto-verificado — flagueado a Franco (no bloqueante):** otra sesión de chat tiene el dev server de la carpeta corriendo en :3000. La verificación runtime de estas pantallas pesa por prod-QA (`start:qa` :3001), pero el detalle de lead en :3001 rebota a :3000 por `AUTH_URL` del build (registrado en memoria) → caería en el server de la otra sesión, inestable y con riesgo de interferir su estado de DB. Por eso NO se levantó prod-QA ni se flipearon leads QA esta vez. Pasada perceptual + de copy pendiente de Franco — pasos abajo.

**Cómo verificarlo (Franco, dev:qa con la carpeta libre):**
1. `npm run dev:qa` (:3002) · `POST /api/qa/login {persona: setter-qa}`.
2. **Seguimiento — lead RESPONDIO con contactos:** el subtítulo `intro` + el panel «¿Por qué importa?» (responde→brief / no responde→cadencia) + el pie del recuadro de cadencia («Tres toques y para: 2 / 2 / 3 días…»). Lead con contacto y SIN opción elegida: bajo «Registrá lo que pasó», el botón «Registrar resultado» disabled **con** el hint «Elegí arriba qué pasó…» al lado (ya no mudo).
3. **Agenda — lead NO RESPONDIO:** card locked muestra `gate.titulo` («Se agenda cuando el negocio respondió y acepta reunirse») + el detalle (no es trigger automático; lo abrís al marcar «Respondió»). **Lead RESPONDIO sin reunión:** subtítulo `intro` + la lista `pasos` (1→4) arriba del checkbox decisor.

**Cómo quedó el gap del botón.** «Registrar resultado» seguía `disabled={resultado === null}` (premisa correcta: sin opción no hay nada que registrar). 3.6 NO cambió esa regla —elegir una opción sigue siendo el requisito— sino que la **explica**: un hint zinc aparece exactamente cuando el botón está disabled y dice qué hacer para habilitarlo. Cero lógica nueva; el disabled se discrimina por `resultado === null`, no por la clase `disabled:`.

**Salida:** el seguimiento se explica (qué hacer cuando responde / cuando no, y el ritmo +2/+2/+3-stop legible), la agenda guía el how-to (ofrecer → confirmar) con el gate RESPONDIO nombrado, y el botón disabled ya no queda mudo. Todo el copy editable por Franco en `guidance-content.ts`; los gates/cadencia/claims siguen decidiéndose en `flow.ts`/`follow-up.ts`/`agenda.actions.ts`. **Cierra el contenido del Bloque 3 (a falta de la pasada perceptual de Franco).**

---

## Sprint 3.7 — Robustez + consistencia del wizard · 2026-06-29

**Objetivo.** Con los pasos guiados ya armados (3.2–3.6), endurecer el wizard como CONJUNTO: estados error/carga de la pantalla del lead, consistencia entre los pasos rediseñados, y gaps UX residuales de la probe.

**Descubrimiento (read-only, subagente `Explore` + lectura directa + grep):**
- **Boundaries del lead:** `[leadId]` tenía `loading.tsx` pero **NO** `error.tsx`. Un error en la carga del dossier/timeline o en el render del wizard caía al boundary PADRE `setter/error.tsx` («Algo se rompió cargando el **panel**» — habla de la HOME, ofrece solo «Reintentar», sin volver a la cartera). El `loading.tsx` existía pero predataba el cartel de 3.1: dibujaba **una sola barra** donde hoy van el rail + el cartel de dirección. `not-found` ya está cubierto: `setter/not-found.tsx` («Ese lead no está en tu cartera») atrapa el lead ajeno/inexistente — sin hueco.
- **Consistencia (el `Explore` mapeó los 9 steps):** los pasos **YA se sienten un flujo** —mismo `Card`/tono/gate-explicado, estado-bloqueado idéntico en los 8 (3.2–3.6 hicieron su trabajo; cero waiting/disabled mudos)—. Lo que el `Explore` marcó como divergencias del resto (la ficha en `<details>`, el draft sin TeachPanel, el tinte emerald de la agenda, el badge/urgencia de construcción) son **por diseño** según los comentarios de `guidance-content` — no se tocan. La ÚNICA divergencia visible real: la numeración **«Paso N»** en los h2, que además dos steps (evaluación, construcción) **hardcodeaban** mientras el resto la lee de `guidance-content` (el drift HIGH del `Explore`).

**Hallazgo clave — «Paso N» es vocabulario FLOW-WIDE, no local del wizard (decisión deferida, NO medio-arreglada):** un grep mostró que «Paso N» (1–10) vive en TODO el flujo del setter: `flow.ts` (`proximaAccion` del foco), `outreach.actions.ts`/`agenda.actions.ts` (toasts de error), `herramientas.ts` (`dondeSeUsa`), `flow-content.ts` (arreglos del self-check), `guidance-content` (teach). Y YA era **parcial/inconsistente ANTES de 3.7**: solo las cards 1–4 mostraban su número; las 5–10 (draft/self-check/opener/seguimiento/agenda) nunca lo mostraron, aunque el foco las referencia («enviá el link (Paso 9)»). Quitar el número solo de las 4 cards lo EMPEORA (rompe las refs a Paso 2/3/4 que sí resolvían). Resolverlo coherente (quitar en todo el flujo, o numerar las 9) toca `flow.ts`/actions/home-foco — **fuera del scope del wizard** y media una decisión de producto. → Se descartó tocar la numeración visible; se flagueó (pendiente #2).

**Cambio (4 archivos del wizard + 1 de contenido — boundary + skeleton + single-source, cero lógica):**
- **NUEVO `error.tsx`** (boundary de `[leadId]`, hermano del de la home 2.4): copy en **modo dirección** («No se pudo abrir este lead» + dos salidas: **Reintentar** / **Volver a tu cartera**) + el par de **OBSERVABILIDAD B12.1/B14.5** (logger + Sentry con tag `setter-lead`; sin él el boundary se tragaría el error sin telemetría). El cliente nunca ve el detalle técnico.
- **`loading.tsx` refinado:** el skeleton ahora espeja el render **post-3.1** —cabecera (volver/título/meta/links) + rail + el **cartel de dirección como PROTAGONISTA** (`h-[92px]`) + las cards de pasos—, igual que 2.4 alineó el skeleton de la home al modo dirección. El anterior dibujaba una barra indistinta donde van el rail Y el cartel (silueta incoherente al cargar).
- **Consistencia — single-source, ZERO-VISIBLE-CHANGE:** los h2 de evaluación (2) y construcción (5) ahora leen `GUIA_EVALUACION.titulo` / `GUIA_CONSTRUCCION.titulo` en vez de hardcodear el string. El «Paso 4 —» se movió a `GUIA_CONSTRUCCION.titulo` (su ÚNICO consumidor es el h2 del step — verificado por grep; `TeachPanel` no usa `titulo`). Texto visible **idéntico** a baseline; elimina el drift que marcó el `Explore`. Franco edita el título en UN lugar.

**Disciplina respetada (líneas rojas):** cero cambios a la numeración «Paso N» VISIBLE (se revirtieron los intentos de quitarla, que rompían refs cruzadas en `flow.ts`/`herramientas.ts`/copy). Cero lógica/gates/actions/schemas/`pasoActual`/`describirFoco`. Solo boundary + skeleton + single-source de títulos. Tipado estricto, cero `any`.

**Verde (nada ✅ sin chequeo):**
- ✅ `eslint --max-warnings 0` (los 5 tocados: `error.tsx`, `loading.tsx`, `guidance-content.ts`, `evaluacion-step.tsx`, `construccion-step.tsx`) → 0.
- ✅ `npm run build` → exit 0 (baseline pre-sprint también verde; el árbol de rutas incluye `/setter/leads/[leadId]` con su nuevo `error`).
- ✅ `prisma migrate status` → up to date (74 migs; cero migraciones — boundary + presentación).
- ✅ **Runtime — los DOS boundaries verificados en prod-QA (`start:qa` :3001, sesión `setter`, SSR/flight MEDIDO; inyección temporal en `page.tsx` revertida — método «inyección temporal revertida» del 2.4):**
  - **error.tsx:** con un `throw` forzado, el payload RSC registra `[leadId]/error` como el handler del segmento (`"error":"$1b"`) y el page tiró (error serializado `E{digest:973727466}`); el mensaje técnico «QA-3.7…» **NO leakea** al HTML (0 ocurrencias) — solo el digest opaco viaja (lo que confirma «el cliente nunca ve el detalle técnico»). El `EmptyState` renderiza client-side (Next exige que `error.tsx` sea boundary client).
  - **loading.tsx:** con un `delay` forzado, el flight serializa **exactamente** el skeleton nuevo (`aria-label="Cargando el lead"` → rail `h-8` + cartel `h-[92px]` + ficha `h-72` + 2 cards `h-24`).
- ✅ **Single-source behavior-neutral:** curl a los 7 leads del setter → los h2 muestran «Paso 2 — Evaluación» / «Paso 3 — Brief de diseño» / «Paso 4 — Construcción de la demo» **idénticos** a baseline.
- ⚠️ **dev:qa NO sirve para el error boundary:** en `next dev` el overlay de error de Next intercepta antes que `error.tsx` (muestra el stack crudo). Por eso el error se verificó en **prod-QA** (`next start`), donde el boundary sí gobierna.

**Pendientes flagueados a Franco (no bloqueantes):**
1. **Pasada PERCEPTUAL a ojo** (desktop + mobile) del `error.tsx` (el `EmptyState` renderiza client-side) y del `loading.tsx` — el flight prueba la ESTRUCTURA, no cómo se VE (spacing, jerarquía).
2. **DECISIÓN de producto — la numeración «Paso N» (FUERA del scope del wizard):** hoy es un vocabulario flow-wide parcial (cards 1–4 con número, 5–10 sin; el foco/tools/errores referencian «Paso 5/7/9/10» que ninguna card rotula). Unificarlo toca `flow.ts`/actions/`herramientas.ts`/`flow-content.ts` (lógica + home-foco). **Recomendación:** referir por NOMBRE en todo el flujo (apoyado en el banner/marco de 3.1 + las refs ««Nombre»» que ya domina el copy nuevo). Sprint propio.
3. **PRE-EXISTENTE (ajeno a 3.7):** `react-hooks/purity` en `seguimiento-step.tsx:198` (`new Date(Date.now())` del date-picker de POSTERGADO) — el build no bloquea, `eslint` sí; candidato a sprint propio (mismo que 3.5/3.6).

**Salida:** la pantalla del lead ahora **falla con gracia** (boundary propio en modo dirección, con telemetría y dos salidas) y **carga con una silueta que coincide con el render real** (rail + cartel protagonista). Los títulos de los pasos quedaron **single-sourced** (un lugar para editarlos, sin drift) sin mover una sola palabra visible. La numeración «Paso N» —única inconsistencia visible que queda— se documentó como decisión de producto para un sprint propio, en vez de medio-arreglarla rompiendo refs cruzadas.

---

## CIERRE — Bloque 3 (el wizard del lead)

**Bloque 3 CERRADO.** El foco (Bloque 2) entrega UN lead; el wizard guía el trabajo de ESE lead, de punta a punta:

- **3.1 — shell:** cartel de dirección (`PasoActualBanner`) + marco del paso activo (`StepAnchor`), ambos derivados de `describirFoco(stage, gateAbierto)`; `pasoActual` (rail) intacto como fuente única de posición.
- **3.2–3.6 — contenido guiado:** cada `*-step.tsx` explica QUÉ hacer y POR QUÉ, y cada gate dejó de ser mudo (ficha→evaluación→opener; brief + «esperando respuesta»; construcción→draft→self-check; en revisión + envío del link/flujo invertido; seguimiento + agenda). Todo el copy vive en `guidance-content.ts`, editable por Franco en un solo archivo.
- **3.7 — robustez + consistencia:** boundary propio del lead (`error.tsx`) + skeleton coherente con el modo dirección (`loading.tsx`) + títulos single-sourced.

**Líneas rojas sostenidas todo el bloque:** modelo stage-driven (`pasoActual`/`describirFoco`) intacto; gates/claims/transiciones decididos en `flow.ts`/`dossier.ts`/`*.actions.ts` (la capa de contenido solo los EXPLICA); ownership/aislamiento sin tocar; tipado estricto, cero `any`.

**Lo que queda (no bloqueante, para Franco):** (a) la **pasada perceptual a ojo** del bloque completo (desktop + mobile) — todo lo verificable por SSR/flight/medición está ✅, falta el ojo humano; (b) la **decisión de producto sobre la numeración «Paso N»** (vocabulario flow-wide parcial, sprint propio); (c) el lint pre-existente `react-hooks/purity` en `seguimiento-step.tsx:198` (ajeno, candidato a sprint propio).

---

## V-1 — Seed QA del setter: un lead en CADA estado del wizard

**Por qué.** El Bloque 3 se verificó por SSR/medición, pero varios estados del wizard NO se pudieron mirar a ojo porque los leads QA en esos stages eran de **franco**, no de **setter-qa** (los del setter no cubrían FICHA, BRIEF ni los sub-estados de gate). Sin un lead OWNED por el setter en cada estado, la pasada perceptual quedaba con huecos.

**Qué hace.** Nuevo `scripts/v1-qa-wizard-states.ts` (hermano de los `b3..b7-qa-*`): siembra **13 leads "QA-W \<estado\>" owned por setter-qa**, uno por cada estado que el wizard distingue —FICHA incompleta · FICHA completa · EVALUADA gate-cerrado · EVALUADA gate-abierto · BRIEF · CONSTRUCCION (draft + self-check 6/6) · EN_REVISION · APROBADA gate-abierto · APROBADA gate-cerrado · RECHAZADA · DESCARTADA · POSTERGADO vencido · POSTERGADO futuro—. Mismo guard que los `b-scripts` (solo branch Neon dev `ep-quiet-waterfall`), dotenv + imports dinámicos, y solo AGREGA/reconcilia los `QA-W` (no toca producción ni los leads de franco).

**Decisiones.**
- **Stage DIRECTO en el dossier (no `transitionDossier`):** en un SEED crear el `OsLeadDossier` en su stage es lo normal y aceptable — la línea roja "no setees stage con Prisma directo" aplica a la app, no al seed. Esto permite sembrar los estados que `transitionDossier` BLOQUEARÍA (EVALUADA con gate cerrado; APROBADA sin finalUrl), que son justo los que faltaba ver.
- **Blobs Json validados con los contratos** (`FichaSchema`/`EvaluacionSchema`/`BriefSchema`/`SelfCheckSchema`/`RechazosSchema`) antes de tocar Prisma — el self-check 6/6 se arma mapeando `HARD_CHECKS` (queda en sync si la lista cambia → `selfCheckAprobado` true).
- **Gates sembrados explícitos:** EVALUADA/APROBADA-abierto = `status RESPONDIO`; cerrado = `PROSPECTO`/sin `finalUrl`. La APROBADA-cerrado (sin finalUrl, PROSPECTO) muestra el copy `GUIA_ENVIO.espera.aprobadaSinEnganche` ("el link se libera cuando el negocio responda").
- **Idempotencia real:** lead por `businessName` (find-or-create + reconcilia `assignedToId/status/caliente/reactivateAt/notes`); dossier por `leadId` (`upsert` con TODOS los campos del estado deseado; Json? en null → `Prisma.DbNull`). `reactivateAt` se compara por LADO (pasado/futuro), no por ms, para que el relative-date no fuerce un update cada corrida.

**Verde (chequeado, no asumido).**
- ✅ 1ª corrida: 13 creados, **cobertura completa** (la aserción RELEE de la DB stage/status/finalUrl/reactivateAt — no asume).
- ✅ 2ª/3ª corrida: **13 `[ok]`, 0 creados/reconciliados** → idempotente, converge.
- ✅ `prisma migrate status` → up to date (74 migs; es seed, no schema).

**Flip de los OTROS 2 sub-estados de CONSTRUCCION** (lo imprime el script al final, sobre "QA-W Construccion"): `draftUrl = NULL` → ver el gate "publicá el draft"; `selfCheckJson = NULL` (o cualquier `itemsDuros[].ok=false`) → botón "Enviar a revisión" deshabilitado. Re-correr el seed lo devuelve a draft + 6/6.

**Salida:** tabla `estado · businessName · leadId` lista para la pasada perceptual de Franco (abrir cada `/setter/leads/<leadId>` y ver el wizard en su estado real). Cubre el hueco que dejó la verificación SSR del Bloque 3.

---

## 4·A — Librería de prompts de diseño prefijados (la pieza net-new del Bloque 4)

**Por qué.** El motor de calidad del Bloque 4 tenía una sola pieza realmente net-new y de alto valor (probe Bloque 4): una librería de **prompts estandarizados y LEAD-AGNÓSTICOS** —«pulí la estética», «adaptá a mobile», «mejorá el motion»— que el setter copia a Claude Design / el Gem para REFINAR una demo ya construida. Hasta hoy esa dirección de diseño vivía como **prosa dispersa** (las directivas «CALIDAD (no negociable)» del lab FG-2 y las fases «Calidad y motion» / «Mobile» del shell), redactada como instrucción al setter — no como prompt copiable.

**Qué hace.** Nuevo registro `src/lib/leados/prompts-disenio.ts` (hermano de `guidance-content.ts` / `herramientas.ts`): strings tipados puros, sin Prisma ni `'use server'`, importable server+client. Cada entrada `{ id, titulo, instruccion, prompt }` casa 1:1 con las props de `CopyBlock` (`titulo`/`instruccion`/`texto`=`prompt`) → el componente la entrega tal cual, **cero contenido en el JSX**. Sembrado con 3 prompts (`estetica` · `mobile` · `motion`) cosechando la prosa de FG-2 + shell, **reescrita** del registro «instrucción al setter» al registro «prompt para la IA». En la Construcción (`construccion-step.tsx`), un sub-componente `PromptsDisenio` los pinta con `CopyBlock` (sin tocarlo), tras el `<ol>` de fases —donde la demo ya está armada y el pulido tiene sentido—.

**Decisiones / líneas de límite.**
- **Ortogonal a `copy-blocks.ts` (intocado):** aquel arma INPUTS con los datos del lead (ficha/brief/materiales) — capa de datos, sensible/compartida. Esto es la capa de DIRECCIÓN de diseño, sin datos. No se fusionan.
- **`SHELL_CONSTRUCCION` sigue siendo fuente única:** los prompts COSECHAN sus ideas reescribiéndolas de registro — no copian sus strings ni lo importan. El `<ol>` de fases sigue consumiendo `SHELL_CONSTRUCCION` tal cual.
- **`instruccion` en el registro (no en el componente):** el shape suma `instruccion` a `{ id, titulo, prompt }` para calzar con `CopyBlock` sin inventar copy en el JSX — todo el contenido en un solo archivo.
- **Semilla, no obra final:** el contenido FINO lo cura Franco después (tarea paralela); la cabecera del archivo lo documenta. Agregar un prompt = sumar el `id` al union + appendear una entrada, todo en ESTE archivo (un typo no compila).
- **CERO lógica de gate tocada (confirmado explícito):** no se tocó `flow.ts`, `dossier.actions.ts`, `copy-blocks.ts`, el componente `CopyBlock` ni la lógica de `SHELL_CONSTRUCCION`. Solo se sumó un módulo de contenido + un sub-componente presentacional + 2 imports.

**Verde (chequeado, no asumido).**
- ✅ `npm run build` → exit 0 (compiló en ~37s; la generación de páginas terminó OK).
- ✅ `tsc --noEmit` → **0 errores en los archivos tocados** (`prompts-disenio.ts` / `construccion-step.tsx`); el único error de tsc es PRE-EXISTENTE y ajeno (`src/lib/searchconsole.ts:119`, SEO) — por eso el build de Next salta la validación de tipos.

**Lo que queda (no bloqueante, para Franco):** (a) la **pasada perceptual a ojo** del stack de 3 `CopyBlock` en la Construcción (desktop + mobile) — abrir el lead **QA-W Construccion** (seed V-1) en `CONSTRUCCION`; estructuralmente es bajo riesgo (reusa `CopyBlock`, ya probado en ese mismo stage, + el idiom de `MaterialesNegocio`), pero el ojo humano sobre el peso visual del stack queda para Franco; (b) el **curado del contenido fino** de los prompts (tarea paralela ya prevista).

---

## 4·B — Puente self-check: el prompt que arregla CADA hard-check en rojo

**Por qué.** El self-check es el **ÚNICO** gate cuyo bloqueo se resuelve mejorando un **artefacto** (la demo) — por eso es donde 4.1 (mostrar la salida) y 4·A (el prompt) se enganchan. Hasta hoy un hard-check en rojo mostraba el **arreglo humano** (`HardCheck.arreglo`, instrucción de qué hacer) + el botón "Enviar a revisión" disabled + el server re-validando `selfCheckAprobado` — pero NO el **prompt copiable** que arregla ESE check en Claude Design.

**Qué hace.** Por cada hard-check en rojo que se arregla refinando la demo, el self-check muestra —al lado del arreglo humano— su prompt de la librería 4·A vía `CopyBlock`. Dos piezas:
- **Mapeo editable** `HARD_CHECK_PROMPT` (`HardCheck.id → PromptDisenioId`) + resolver puro `promptParaHardCheck(id)` en `prompts-disenio.ts` (el archivo de contenido de Franco, junto a los prompts).
- **UI additive** en `self-check-step.tsx`: si el check está en rojo y hay prompt mapeado, su `CopyBlock` se pinta como **fila full-width nueva DEBAJO** de la fila flex existente (texto + Toggle), dentro de la misma card. No reestructura el item (gap que marcó el probe en :184-189) — **+17 / −0**, ninguna línea existente tocada.

**Decisiones / líneas de límite.**
- **Mapa explícito, no join por id-equality:** los dos id-spaces son vocabularios distintos (HARD_CHECKS describen *problemas*; PROMPTS_DISENIO describen *direcciones de diseño*) que comparten un solo token (`mobile`). Un join por igualdad sería accidental/frágil; el probe sancionó el mapa explícito. Claves `string` a propósito (`HardCheck.id` ES `string`, no un union); valor atado al union por la anotación (un `promptId` con typo NO compila).
- **PARCIAL a propósito y HONESTO — hoy SOLO `mobile`→`mobile`.** Los otros 5 hard-checks no se arreglan con un prompt **lead-agnóstico**: `carga` se re-publica en Netlify; `sinRelleno`/`datosReales`/`fielAlBrief` necesitan los DATOS del lead (rompen la invariante lead-agnóstica de 4·A); `linksWhatsapp` es funcional. `estetica`/`motion` alinean con los SOFT-checks (paleta/fuente/motion), fuera del scope de ESTE gate. **NO inventé prompts lead-specific para forzar un 1:1** — sería corromper 4·A y meterme en el lane de contenido de Franco. Sin entrada en el mapa → el check muestra solo el arreglo humano, como antes.
- **Crecer cobertura = 1 línea en el mapa** (más, si el prompt no existe, una entrada en `PROMPTS_DISENIO`) — el header del mapa documenta los 6 estados y los candidatos.
- **`prompts-disenio.ts` NO importa `flow-content`:** se mantiene la ortogonalidad capa-de-dirección-de-diseño vs capa-de-gate (misma frontera que con `copy-blocks.ts`).
- **LÍNEA ROJA intacta (confirmado explícito):** `selfCheckAprobado` (`flow.ts:175`), el botón disabled (`self-check-step.tsx:262`) y el early-exit server de `enviarARevision` (`dossier.actions.ts:353`) **NO se tocaron**. Solo se AGREGA el affordance del prompt en la capa UI. **El gate NO se relajó** — no hay forma nueva de "saltear" un check.

**Verde (chequeado, no asumido).**
- ✅ `npm run build` → exit 0. `tsc --noEmit` → **0 errores en los 2 archivos tocados**; eslint → limpio en los 2. (Único error de tsc = PRE-EXISTENTE y ajeno: `src/lib/searchconsole.ts:119`, SEO/google-auth — por eso Next salta la validación de tipos.)
- ✅ **Diff = additive puro:** `flow.ts` / `dossier.actions.ts` / `flow-content.ts` **NO** en el diff; `self-check-step.tsx` **+17 / −0** (ni el botón disabled ni el Callout del gate alterados).
- ✅ **Runtime SSR** (prod-QA `:3001`, sesión setter real vía `/api/qa/login`, lead **QA-W Construccion** flipeado a `selfCheckJson=NULL`): self-check con **6 checks rojos → EXACTAMENTE 1 `CopyBlock`** (el de `mobile`); `estetica`/`motion` ausentes del self-check; "Adaptá a mobile" aparece **2×** en la página (1 Construcción + 1 self-check) vs `estetica`/`motion` 1×; botón "Enviar a revisión" **disabled**; orden DOM `selfHdr < arreglo-rosa < CopyBlock < botón`. **Control negativo:** restaurado a 6/6 → **0 rojos, 0 CopyBlocks** (el affordance solo aparece en rojo). Fixture restaurada al estado seed, script temporal de flip borrado, server apagado.

**Lo que queda (no bloqueante, para Franco):** (a) **pasada perceptual a ojo** del `CopyBlock` cyan anidado en la card del check rojo (desktop + mobile) — repro: abrir **QA-W Construccion** y flipear el toggle "Se ve bien en tu celular" a rojo → aparece el prompt "Adaptá a mobile" bajo su arreglo y el botón se deshabilita (sin tocar la DB); (b) **decisión de producto/contenido (su lane):** si querés prompt para más hard-checks (`linksWhatsapp`, `sinRelleno`), curar 1–2 prompts lead-agnósticos nuevos (candidatos: «QA de links/CTA», «caza de relleno/placeholders») y sumar su línea al mapa — la arquitectura ya lo soporta, falta el contenido.

---

## 4·C — Las salidas de los gates de evento-externo: de prosa a affordance (deep-link)

**Por qué.** Cinco gates del wizard NO tienen artefacto que arreglar: se resuelven cuando ocurre un **evento externo** (la ficha se completa, el negocio responde el primer contacto, el draft se publica, Franco aprueba / el negocio engancha, el negocio acepta reunirse). Hasta hoy cada uno **describía su salida en prosa** ("mirá el paso 1", "mandá el opener", "el paso de arriba", "marcás «Respondió» en Seguimiento"). El setter leía a dónde ir, pero tenía que scrollear a mano. SOLO presentación: ninguna lógica de gate, transición ni claim atómico se tocó — todos siguen server-enforced.

**Qué hace.** Convierte la prosa-puntero en un **salto de un click** al paso destino, reusando el mecanismo de aterrizaje por scroll que ya existe (`StepAnchor`), NO `router.push` (los pasos viven todos en la misma página, no son rutas).
- **Primitiva nueva** `step-nav.tsx` → `<StepLink to="…">`: botón que resuelve su destino DENTRO de la copia visible del wizard (`closest('[data-lead-wizard]')` + `querySelectorAll('[data-step]')`, con guarda `offsetParent` para saltar la copia bajo `display:none`) y hace `scrollIntoView({ behavior: 'smooth' })`. Mismo idiom que el `StepAnchor` (que enfoca el paso activo al abrir), sin re-implementar nada.
- **Marcadores** `data-step`: `StepAnchor` gana un prop opcional `anchorId` (pinta `data-step`, no toca scroll-on-mount ni gateo); el shell marca la raíz con `data-lead-wizard` y envuelve Ficha / Opener / Draft con un `StepAnchor active={false}` (solo marca, sin enmarcar) — Seguimiento ya estaba envuelto, suma `anchorId`. La cadencia de follow-up lleva un `data-step="cadencia"` inline.
- **Por gate:**
  - `fichaTieneSenal` (evaluacion-step): el detalle de `faltantes` **sube AL gate** (antes era un puntero ciego "mirá el paso 1"; ahora muestra las líneas concretas de `fichaFaltantes`, mismas que valida la ficha) + `StepLink → ficha` ("Ir a la ficha (Paso 1)").
  - `gateBriefAbierto` (brief-step): `StepLink → opener` ("Ir al opener").
  - `draftUrl` (self-check-step): "(el paso de arriba)" → `StepLink → draft` ("Ir a publicar el draft").
  - `gateEnvioDemo` (seguimiento-step): `StepLink → cadencia` ("Ir a la cadencia de follow-up", misma pantalla).
  - agenda `RESPONDIO` (agenda-step): `StepLink → seguimiento` ("Ir a Seguimiento").

**Decisiones / líneas de límite.**
- **Reusa el scroll, no inventa navegación.** El task pedía explícitamente no meter `router.push` si rompe el modelo: los pasos son secciones de una página, así que la "salida" honesta es scroll a la sección, idéntico a como `StepAnchor` ya aterriza el foco al abrir.
- **Scoping por copia (`data-lead-wizard`).** El `StepAnchor` documenta que el shell se **duplica responsive** (una copia bajo `display:none`). Por eso el `StepLink` resuelve su destino dentro de la copia del botón que se clickeó (`closest`), no global por `id` — así no hay ambigüedad de a qué copia saltar, y la guarda `offsetParent` ignora la oculta. Mismo criterio anti-duplicación que el `StepAnchor` original.
- **Numeración honesta.** Los labels usan el vocabulario REAL de cada destino ("Paso 1 — Ficha" sí existe en el rail; "opener", "publicar el draft", "Seguimiento" por su título de step). NO se etiquetó el draft como "Paso 5" (el rail llama "Revisión" al Paso 5 — sería confuso). La numeración fina del task ("Paso 7", "Paso 5") era para identificarme los destinos, no copy literal.
- **Cero lógica de gate tocada.** Ningún criterio de gate, transición ni claim cambió. El `StepLink` no muta estado: solo scrollea. Los gates siguen server-enforced; esto es la capa de presentación pura.

**Verde (chequeado, no asumido).**
- ✅ `npm run build` → exit 0 (Next imprime el árbol de rutas completo, que solo sale tras compilar + type-check OK).
- ✅ `npm run lint` → **0 errores nuevos** en los 8 archivos tocados (step-nav, step-anchor, lead-wizard, evaluacion/brief/self-check/seguimiento/agenda-step). El único hit en archivo tocado es `seguimiento-step.tsx:199` (`Date.now()` impuro en `minReactivacion`) — **PRE-EXISTENTE y ajeno**, mis ediciones fueron en otras líneas del archivo.

**Lo que queda (no bloqueante, para Franco):** **pasada perceptual + interacción** de los 5 deep-links — un screenshot no prueba el scroll-on-click, así que queda para el ojo humano. Repro con el seed V-1 (`v1-qa-wizard-states`, un lead "QA-W" por estado): abrir el lead en cada estado gateado y clickear el `StepLink` → debe aterrizar en el paso destino. Estados: **QA-W Ficha** (sin señal → "Ir a la ficha"), **EVALUADA gate-cerrado** ("Ir al opener"), **QA-W Construccion** sin draft ("Ir a publicar el draft"), **APROBADA sin enganche** ("Ir a la cadencia"), **RESPONDIO** en agenda ("Ir a Seguimiento").

---

## A.1 — Carga manual de un prospecto por el setter (la segunda fuente de leads)

**Por qué.** Desde el día uno el setter no solo trabaja lo que Franco le asigna: carga sus propios prospectos. Habilita el CTA del `HomeEmpty` (2.4) y el primer uso real sin esperar asignación. Dos fuentes de leads: asignados por Franco (él marca caliente) / auto-cargados por el setter (entran FRÍOS). Un auto-cargado entra FRÍO en FICHA — el setter NO marca caliente (eso es de Franco al asignar, D1=B); lo evalúa (descarte/avance) como cualquier otro. Autonomía adicional, no rompe el modelo de dos fuentes.

**Qué hace.**
- **Builder de escritura aislado** `ownedLeadCreateData(fields, userId)` en `isolation.ts` — el espejo de ESCRITURA de `ownedLeadWhere`/`ownedListWhere`. Arma el registro campo por campo (NO `...spread`) y FUERZA `assignedToId = userId` (sesión), `caliente = false`, `source = FUENTE_SETTER`. Fuente única de la regla de alta del setter.
- **Schema** `prospecto.schemas.ts` (`NuevoProspectoSchema`, sin `'use server'` → reusable en cliente): `businessName` obligatorio (único mínimo para entrar a FICHA) + 8 opcionales (contacto/teléfono/email/rubro/zona/IG/web/notas). El `z.object` descarta cualquier `assignedToId`/`caliente` que mande el cliente.
- **Action** `prospecto.actions.ts` (`cargarProspecto`): `requireSetter()` → `parse` → `prisma.osLead.create({ data: ownedLeadCreateData(parsed, userId) })` → `revalidatePath('/setter','/admin/leados')`. Mismo molde que el `createLead` del admin, gate cambiado a setter y dueño derivado de la sesión.
- **Ruta** `/setter/nuevo`: page server (gate `requireSetter`, trae los nombres propios para el aviso de duplicado vía `ownedListWhere`) + `nuevo-prospecto-form.tsx` cliente (inputs controlados + `useTransition` + `toast` + push al wizard del lead nuevo, molde `ficha-step`). Aviso NO bloqueante de posible duplicado por nombre (cotejo normalizado contra la cartera propia).
- **Entradas:** CTA del `HomeEmpty` (`href:/setter/nuevo`, copy reescrita a las dos fuentes) + link sobrio en `HomeEnEspera` (los dos estados sin-foco; fuera del foco activo a propósito — respeta "un lead a la vez" y la disciplina B9 de color).
- El lead entra a la cola `trabajar` del foco por construcción (`flow.ts`: PROSPECTO + stage null → fallthrough `trabajar`, `proximaAccion` default "Completá la ficha", accionable).

**Decisiones / líneas de límite.**
- **La regla de alta vive en `isolation.ts`, no en la action.** El anti-IDOR de escritura es el mismo aislamiento que el de lectura (la frontera es `assignedToId`), así que su regla va junto a `ownedLeadWhere`/`ownedListWhere`. La action solo orquesta.
- **Construcción campo-por-campo, no `...fields`.** La garantía aguanta aunque el schema se configurara mal: el builder nunca lee un `assignedToId` del input. Defensa en profundidad: (1) `requireSetter` da el id de sesión, (2) `z.object` descarta claves extra, (3) el builder fuerza el dueño.
- **El setter NO marca caliente.** `caliente: false` forzado — ni inyectándolo se crea caliente. El caliente es de Franco al asignar (admin-1b/D1=B), intacto.
- **NO se tocaron los claims atómicos** (`marcarDemoEnviadaOwned`/`marcarAgendandoOwned`) ni los otros invariantes. El cambio en `isolation.ts` es ADITIVO (nuevo tipo + const + función; los helpers existentes intactos).
- **Estado inicial por defaults de Prisma:** no se setea `status` (→ PROSPECTO) ni se crea el dossier (FICHA lazy al abrir). Un lead así es indistinguible de uno recién asignado a efectos del foco/wizard.
- **Aviso de duplicado NO bloqueante** (el task lo marcó "menor" para A.1): cotejo por nombre normalizado contra la cartera PROPIA (aislado), nunca frena el alta — puede ser otra sucursal/homónimo.

**Verde (chequeado, no asumido).**
- ✅ **Invariante OBLIGATORIO nuevo** `alta-propia.invariant.ts` (`npm run check:invariant:alta-propia`) → verde. Prueba ejecutable, sin DB: dueño = sesión incluso con `assignedToId` inyectado (anti-IDOR de escritura); `caliente` falso incluso inyectado; misma frontera que lectura (`ownedListWhere`/`ownedLeadWhere`); `source = Setter`; no fuerza status.
- ✅ **Los 6 invariantes de aislamiento existentes** verdes (assignment-trail, setter-meta, escalamiento, novedades, mis-numeros, timeline) + foco/flow/security → **10/10 ✓**.
- ✅ `npm run build` → exit 0 (Next imprime el árbol de rutas; `/setter/nuevo` aparece como `ƒ` dynamic). Valida tipos + boundary server/client del form nuevo.
- ✅ **Runtime SSR** (prod-QA `:3001`, sesión setter real vía `/api/qa/login` → `setter-qa`, role SETTER): `GET /setter/nuevo` → **200, sin rebote**, HTML con toda la copy nueva (PageHeader, label "Nombre del negocio", botón "Cargar prospecto", helper "Entra frío, en ficha"). Server apagado al terminar.

**Confirmación explícita (DoD):** `assignedToId` derivado de la sesión server-side (nunca del cliente) · el setter NO marca caliente (`caliente:false` forzado) · el lead entra FRÍO en FICHA y cae en la cola `trabajar` del foco.

**Lo que queda (no bloqueante, para Franco):** **pasada perceptual + end-to-end interactivo** — un screenshot no prueba el submit→navegación. Repro: con un setter SIN leads se ve el `HomeEmpty` con CTA "Cargar un prospecto"; con todo en-espera, el link en `HomeEnEspera`. Abrir `/setter/nuevo`, cargar un negocio (solo el nombre alcanza) → debe crear el lead, tostar OK y aterrizar en el wizard del lead en FICHA; volver al home → el lead nuevo es el foco ("Completá la ficha"). (setter-qa del seed YA tiene leads → para ver `HomeEmpty`/`HomeEnEspera` usar un setter sin cartera / con todo en vuelo.)

---

## A.2 — Importación MASIVA de prospectos del setter desde CSV (la segunda fuente, en lote)

**Por qué.** El setter no carga uno por uno la lista que le pasa Franco: la importa de una. Cada fila → un lead FRÍO, en FICHA, asignado al setter — la versión EN TANDA del alta de A.1, sin un solo lead fugado. Reusa el builder aislado de A.1 fila por fila → el aislamiento queda garantizado por construcción, idéntico al alta unitaria.

**Qué hace.**
- **Módulo PURO** `lib/leados/prospecto-import.ts` — parser CSV correcto (RFC-4180: respeta comas/saltos/comillas `""` dentro de campos entre comillas; tolera BOM/CRLF/CR; el split naíf por `,` del módulo de email-marketing rompía con "Palermo, CABA"), mapeo de encabezado por header canónico + alias (normalizado), dedup intra-lote por nombre normalizado, y `construirAltasLote(datos, userId) = datos.map(d => ownedLeadCreateData(d, userId))` (la pieza que el invariante verifica). Cero DB, cero `'use server'` → se importa igual desde el cliente (preview) y el server. Único import de valor: `./isolation.ts` (con extensión `.ts`, requisito de ts-node ESM en la cadena del invariante).
- **Formato FIJO v1** (`COLUMNAS_IMPORT`): `nombre` (obligatorio) + contacto/telefono/email/rubro/zona/instagram/web/notas (opcionales), con alias por columna. `PLANTILLA_CSV` descargable. Mapeo flexible = futuro.
- **Action** `prospecto-bulk.actions.ts` (`importarProspectos(formData)`): `requireSetter()` → lee el CSV string (patrón `ImportCSVButton`: `FileReader.readAsText` en cliente, FormData string) → parse+map → valida CADA fila con el MISMO `NuevoProspectoSchema` de A.1 (inválidas REPORTADAS, no rompen la tanda) → dedup intra-archivo → dedup contra cartera (`ownedListWhere`) y contra el sistema → alta de los insertables vía `prisma.$transaction` de `create` con `construirAltasLote` (atómico) → `revalidatePath('/setter','/admin/leados')`. Reporte final: `{ creados, invalidas[{fila,nombre,motivo}], duplicadas[{fila,nombre,motivo}], totalFilas }`. Tope `MAX_FILAS_IMPORT=500` (entrada no confiable acotada; rebota con mensaje, NO trunca en silencio).
- **Ruta** `/setter/nuevo/importar`: page server (gate `requireSetter`) + `importar-prospectos-form.tsx` cliente (dropzone, preview LOCAL instantáneo reusando el módulo puro, botón Importar, descarga de plantilla, referencia de columnas, y tarjeta de reporte). Entradas: link en `/setter/nuevo` ("¿Tenés una lista? Importá varios de una") + secundario en `HomeEmpty` (cartera vacía = el momento del bulk).
- **Invariante OBLIGATORIO nuevo** `prospecto-import.invariant.ts` (`check:invariant:prospecto-import`) — corre el pipeline REAL (parseCsv→mapearFilas→`NuevoProspectoSchema`→dedupEnLote→construirAltasLote), sin DB.

**Decisión de producto resuelta (la dejó a mi criterio): dedup CROSS-SETTER = EXISTENCIA GLOBAL.** Un negocio ya asignado a OTRO setter (que el importador no ve por aislamiento de lectura) se SALTEA + reporta ("ya en el sistema"). Implementado como la excepción más angosta posible: `nombresEnSistema()` en el action (NUNCA en `isolation.ts` — ese es el contrato puro que el invariante verifica) devuelve solo un BIT de existencia por nombre, jamás el dueño ni dato ajeno; el reporte al cliente solo nombra lo que el PROPIO setter importó. Defendible porque develOP es un EQUIPO (no multi-tenant): evita que una tanda genere duplicados a nivel equipo que Franco tendría que reconciliar, y lo pedía el roadmap. Es una excepción DELIBERADA y documentada al aislamiento de lectura que A.1 blindó; el invariante de NO-ROBO de escritura queda intacto. (Franco eligió CSV-only nativo para el parseo — sin dependencia nueva.)

**Decisiones / líneas de límite.**
- **El builder de A.1 se reusa fila por fila** (`construirAltasLote → ownedLeadCreateData`): el dueño se fuerza a la sesión campo por campo; un `assignedToId`/`owner` en el archivo NI se lee. Anti-IDOR de escritura EN LOTE por construcción.
- **`$transaction` de `create`, NO `createMany`** (createMany no devuelve ids ni corre hooks, y diluiría el "por el builder"): cada fila pasa por el builder; el lote válido entra atómico (todo o nada). Las inválidas/duplicadas se filtran ANTES → no entran a la transacción → no fugan.
- **Validación = el MISMO schema de A.1** (DRY, un solo contrato de entrada no confiable). Email/links mal formados → fila reportada con el mensaje exacto de A.1, no se traga.
- **Módulo puro sin import del schema** (DI inversa): la validación la aplica el llamador (action + invariante), así el grafo del módulo puro queda en `./isolation.ts` y la cadena del invariante corre en ts-node.
- **NO se tocaron** los claims atómicos, `isolation.ts` (es solo consumidor), ni los otros invariantes. Todo aditivo.

**Verde (chequeado, no asumido).**
- ✅ **Invariante nuevo** `prospecto-import.invariant.ts` → verde. Prueba sin DB: cada fila del lote (incluso con columna `assignedToId`/`owner` hostil) queda en la sesión, fría, `source=Setter`; el pipeline real descarta inválidas (no se construye su alta → sin fuga); dedup intra-archivo cuenta una vez; el parser no parte campos entre comillas; sin columna `nombre` falla limpio.
- ✅ **Suite completa 11/11** verde: assignment-trail, setter-meta, escalamiento, novedades, mis-numeros, timeline, foco, flow, **alta-propia (A.1)**, **prospecto-import (A.2)**, security/idor.
- ✅ `npm run build` → exit 0; `/setter/nuevo/importar` aparece como `ƒ` dynamic. `migrate status` verde (sin cambios de schema). Lint de los archivos nuevos limpio.
- ✅ **Runtime end-to-end** (dev-QA `:3002`, sesión `setter-qa` real vía `/api/qa/login`): importé un CSV de 5 filas (2 válidas, 1 dup-en-archivo, 1 sin-nombre, 1 email-roto, + columna `assignedToId` hostil) → reporte **2 creados · 2 filas con error (fila 5 sin nombre, fila 6 email inválido — mensajes de A.1) · 1 dup "repetido en el archivo"**; los 2 leads quedaron de setter-qa (la columna `assignedToId` del archivo no tuvo efecto). RE-import del mismo archivo → **0 creados · 3 duplicados (1 en-archivo + 2 "ya en tu cartera")** = idempotente, rama en-cartera verificada en vivo. Sin errores de consola; desktop + mobile capturados. Datos de prueba `A2-QA` purgados al terminar; preview apagado.

**Confirmación explícita (DoD):** el lote ENTERO es del setter por construcción (cada fila por el builder, dueño = sesión server-side, nunca del archivo) · entrada NO confiable validada por fila con el schema de A.1 · inválidas y duplicados (en archivo / en cartera / en sistema) se reportan SIN romper la tanda · decisión cross-setter resuelta y documentada (existencia global, excepción angosta) · invariante de lote verde · build verde.

**Lo que queda (no bloqueante, para Franco):** **pasada perceptual** del flujo real (elegir archivo de Excel→CSV, ver preview, importar, ver el reporte y los leads nuevos en el foco). La rama dedup **en-sistema** (cross-setter) quedó cubierta por código + invariante pero no ejercitada en vivo (requiere sembrar un lead de OTRO setter con el mismo nombre fuera de la cartera de setter-qa); el camino es idéntico al en-cartera ya verificado (membresía en Set).

---

## 5.2 — Los 2 gaps que solo la DB real alcanza: claim-atómico de concurrencia + admin assign/caliente cross-actor · 2026-06-30

**Por qué.** De los huecos candidatos del test-hardening, la verificación adversarial confirmó que solo DOS son genuinos y SOLO los alcanza la DB real (concurrencia / dos actores) — el resto resultó ya-cubierto o invariante puro. **(a)** El claim atómico del envío de demo: dos envíos simultáneos sobre el MISMO lead deben dar UN solo `OsDemo`. **(b)** El admin asigna un lead a otro setter + lo marca caliente: el destinatario lo gana y el gate del brief le abre, el saliente lo pierde, y `requireSuperAdmin` bloquea el intento desde contexto setter. Ningún test los ejercía. **Test-only: NO se tocó la lógica de claims/gates/roles — se TESTEA.**

**Qué hace.** Dos specs nuevos en `tests/setter/` (suite `playwright.setter.config.ts`):
- **`06-claim-atomico.spec.ts` (gap a) — in-process, DB real.** Importa la cadena REAL (`marcarDemoEnviadaOwned` de `dossier.ts` —la línea roja— + `crearDemoComercial`) y corre DOS envíos en `Promise.all` sobre el mismo lead APROBADA. **F1:** exactamente 1 `'marcada'` + 1 `'ya-enviada'` → exactamente 1 `OsDemo` (el ganador lo crea, el perdedor se compensa solo). **F2:** contrato del claim — re-marcar es idempotente (`'ya-enviada'`); `revertirDemoEnviadaOwned` reabre el claim (reintento). El thunk es mirror FIEL del cuerpo post-gate de `enviarDemoAprobada` (se omiten requireSetter/Zod/gate — guards por-request atados a `next/headers`, NO sensibles a concurrencia).
- **`07-admin-assign-caliente.spec.ts` (gap b) — acción real + dos actores.** **G1:** super-admin ejecuta la acción REAL `assignLeadSetter` por el control `AssignSetterControl` (pickSelect del `<Select>` no-nativo + switch caliente + guardar) → la DB confirma `assignedToId=B` + `caliente=true`; B (minteado) ve el lead en su portal y el form del brief ABRE para B (gate caliente, señal `«Respuesta del Gem»` que solo renderiza con gate abierto en EVALUADA); A (setter-qa) PIERDE el lead («Ese lead no está en tu cartera»). **G2:** `requireSuperAdmin` — un setter minteado que sondea `/admin/leads/[id]` recibe un redirect server-side (`fetch` same-origin `redirect:'manual'` → `opaqueredirect`), nunca el control de asignación.

**Decisiones / líneas de límite.**
- **(a) in-process, no por HTTP.** `enviarDemoAprobada` corre bajo `auth()` (cookies de request, inalcanzable desde el runner) y dos POST paralelos contra Neon son el camino MÁS flaky (lo advertía el sprint). Llamar la primitiva `marcarDemoEnviadaOwned` directo, contra la DB real, vía `Promise.all` ejercita el claim (el `updateMany where enviadaAt:null` arbitra) de forma determinista. Verificado por probe descartable (corrida y borrada) que `dossier.ts`/`os-commercial.ts`/`flow.ts` se importan en el runner — el alias `@/` lo resuelve Playwright 1.60 por tsconfig, y su árbol NO trae `server-only`/`next/headers`.
- **Guard anti-flaky (mandato del sprint):** namespacing `SMOKE-SETTER` + teardown POR ID (helpers existentes) + ping `SELECT 1` y precondición ANTES de la carrera + clasificador de error de conexión que reetiqueta un fallo de pool stale (`«corré prisma migrate status; NO es bug de concurrencia»`). Si (a) diera 2 `OsDemo` sería bug REAL → reportar, no enverdecer.
- **(b) `requireSuperAdmin` por el rebote server-side, no invocando la action como setter** (eso exigiría POSTear el server-action con su id de build — frágil). El layout admin (`role!=='SUPER_ADMIN' → redirect('/dashboard')`) es la frontera alcanzable; la action además llama `requireSuperAdmin()` como defensa en profundidad. El `fetch redirect:'manual'` evita el bounce AMBIENTAL `AUTH_URL :3001→:3000` (que daba `ERR_CONNECTION_REFUSED` si el browser SEGUÍA el redirect — ruido ajeno al guard, no un fallo de rol).
- **Actores con `mintSessionCookie`, no real-login** (evita el bounce AUTH_URL). `<Select>` compartido manejado con `pickSelect` (trigger button + opciones portaleadas, no nativo). La opción de B se matchea por su nombre con stamp único (anti-ambigüedad si un run previo dejó un «assign-b»).
- **CERO cambios a la lógica:** `marcarDemoEnviadaOwned`/`crearDemoComercial`/`enviarDemoAprobada`/`assignLeadSetter`/`requireSuperAdmin`/`gateBriefAbierto` intactos — solo se importan/ejercitan.

**Verde (chequeado, no asumido).**
- ✅ Los 4 tests nuevos verdes, en AISLAMIENTO y dentro del SUITE completo: F1, F2 (06) · G1, G2 (07).
- ✅ Suite setter completa (`playwright.setter.config.ts`): **32 passed**. Las 2 únicas rojas son PRE-EXISTENTES y ajenas (corren ANTES de mis specs): **B3** (copy-drift del opener en `01-flow.spec.ts` — la frase «El opener va SIN link» vive hoy solo en el schema Zod `outreach.schemas.ts:41`; documentada «NO TOCAR, fuera de scope») y **B10** (flaky — **PASA en aislamiento**; las 5 «did not run» B4-B8 son el cascade del describe serial tras B3). Ninguna tocada por 5.2.
- ✅ `npm run build` → exit 0 (incluye el type-check de los specs nuevos). `prisma migrate status` → up to date (74 migs; es test, sin schema).
- ✅ **Teardown hygiene:** check de huérfanos → `leads=0 users=0 demos=0` SMOKE-SETTER tras el suite (teardown-por-id limpio). Probe + check descartables borrados.

**Lo que queda (no bloqueante, para Franco):** (a) **B3** (copy-drift del opener) y **B10** (flaky) son deuda PRE-EXISTENTE de `01-flow.spec.ts` (fuera del scope test-only de 5.2; B3 marcado «NO TOCAR») — si querés, un sprint propio actualiza la aserción de B3 al copy actual y estabiliza B10. (b) El `requireSuperAdmin` se ejercita por el rebote del layout (la frontera alcanzable en e2e); invocar la action directamente como setter exigiría POSTear el server-action por id de build — no se hizo a propósito.

---

## 5.3 — Cosecha de durabilidad: el harness manual del dossier → regresión wired + negativos finos + invariantes de gates · 2026-06-30

**Por qué.** Buena parte de la brecha de durabilidad YA existía como `scripts/b2-verify-dossier.ts` (ejerce el gate del brief bloqueado+permitido, el append de `rechazos[]`, el motivo obligatorio y el re-loop RECHAZADA→CONSTRUCCION preservando historia) — pero estaba **host-gateado** a la branch Neon dev (`ep-quiet-waterfall` con `process.exit(1)`) + `npx tsx` MANUAL, **NO wired a la suite/CI**. El objetivo no fue escribir de cero: fue darle **durabilidad**. Sumado: los negativos finos que solo la DB real alcanza y los 2 gates que faltaban en la capa invariante. **Test-only + invariantes: NINGÚN gate se relajó — se prueba que NO se saltean.**

**Qué hace.**
- **COSECHA (regresión durable).** Nuevo config `playwright.leados.config.ts` (`npm run test:leados`, testDir `tests/leados`) — **sin `webServer`**: llama la lógica pura + Prisma directo (mismo patrón in-process que 06-claim-atomico), corre solo con la DB (Neon dev en local vía `.env.local`, DB de test dedicada en CI). Aislado de `tests/integration` (que SÍ necesita server/HTTP). `tests/leados/dossier-gates.spec.ts` porta los checks de `b2-verify` como specs durables SIN el host-gate: unicidad 1:1 + idempotencia de `ensureOwnedDossier`, ownership cross-setter → null, transición ilegal + contrato zod, **gate EVALUADA→BRIEF** (bloquea frío aun con score 5, abre al marcar `caliente`, abre con RESPONDIO), DESCARTADA motivo-obligatorio + terminal, **RECHAZADA** motivo-req + append al historial + **re-loop que preserva la historia** (2 rechazos sobreviven hasta APROBADA), cascade.
- **NEGATIVOS FINOS (e2e/DB real).** `envio-demo-rechazo.spec.ts` — **la mitad que faltaba de `gateEnvioDemo`**: el RECHAZO (06 cubría el camino feliz). Espejo del núcleo de `enviarDemoAprobada`: rechaza stage no-APROBADA (y la primitiva `marcarDemoEnviadaOwned` rebota en defensa-en-profundidad), APROBADA con gate del brief cerrado (frío), APROBADA sin `finalUrl` — sin residuo (`enviadaAt` null, 0 `OsDemo`). `selfcheck-anti-bypass.spec.ts` — el servidor DESCONFÍA de la UI: un payload hostil «todo aprobado» con ids que NO son hard-blocks NO saltea el gate (`buildSelfCheck` reconstruye contra `HARD_CHECKS`, `selfCheckAprobado` re-valida lo persistido); un hard-block en falso tampoco; solo el self-check completo abre EN_REVISION. **Asertado por COMPORTAMIENTO (rechazado/enviado + stage), NO por etiquetas internas** — los fixtures se derivan de `HARD_CHECKS` en vivo, sin acoplarse a un shape que FG-2 puede cambiar. `alta-import.spec.ts` — A.1 (el alta escribe un lead REALMENTE aislado: dueño=sesión, frío, fuente Setter; A lo ve, B no) + A.2 (**dedup GLOBAL cross-setter**: un negocio ya existente bajo OTRO setter sale `en-sistema` y no se duplica — la query `nombresEnSistema` + `$transaction` atómico, el gap exacto que solo alcanza la DB con dos setters).
- **INVARIANTES PURAS NUEVAS (junto a las 11).** `gate-envio-demo.invariant.ts` (`check:invariant:gate-envio`) — `gateEnvioDemo` es la composición EXACTA `APROBADA ∧ finalUrl ∧ gateBriefAbierto`: cada factor necesario, el tercero es la MISMA regla que el brief (sin drift). `self-check-gate.invariant.ts` (`check:invariant:self-check`) — `selfCheckAprobado` exige TODOS los hard-blocks VIGENTES en verde, valida contra `HARD_CHECKS` no contra lo que el blob afirme (dientes ante el drift de FG-2). Ambas puras, sin DB, `@/`-free (mismo patrón que `flow.invariant.ts`).

**Decisiones / líneas de límite.**
- **Config aparte, no el de setter/e2e.** Los tests de cosecha/negativos NO tocan browser ni server Next → sin `start:qa`/build, CI-baratos. Cada spec **se auto-provisiona** (crea su setter namespaced con `createSetter`, limpia por id exacto) → NO depende de personas seedeadas: corre igual en Neon dev que sobre una DB de test fresca en CI. `tests/integration` (alerts-detector, que SÍ necesita server) queda intacto.
- **Espejo del núcleo post-guard, no la action completa** (mismo criterio que 06): se omiten `requireSetter()`/Zod/`revalidate` (por-request, atados a `next/headers`, no sensibles a la invariante). Se ejercita la línea roja REAL — `transitionDossier`/`marcarDemoEnviadaOwned`/`saveOwnedSelfCheck`/`gateEnvioDemo`/`selfCheckAprobado` — sin tocarla.
- **Resolución del host-gate (mandato del sprint).** `b2-verify-dossier.ts` queda como herramienta manual de dev (anotado en su header); la fuente de verdad de regresión es el spec, que usa la `DATABASE_URL` de la config — sin el `process.exit(1)` a `ep-quiet-waterfall`. La DB de test queda resuelta: `.env.local` en local, `secrets.DATABASE_URL_TEST` en CI.
- **Wired a CI.** `.github/workflows/e2e.yml` suma dos jobs: `invariants` (`npm run check:invariants` — las 13 puras, sin DB ni server) y `leados-integration` (`prisma migrate deploy` + `npm run test:leados` sobre `DATABASE_URL_TEST`, sin build/server). Nuevo script agregado `check:invariants` corre las 13 en fila.
- **CERO cambios a la lógica de gates.** `gateEnvioDemo`/`selfCheckAprobado`/`transitionDossier`/`marcarDemoEnviadaOwned`/`buildSelfCheck`/`ownedLeadCreateData`/`nombresEnSistema` intactos — solo se importan/ejercitan. Anti-bypass = probar que el gate NO se saltea, jamás abrir una forma de saltearlo.

**Verde (chequeado, no asumido).**
- ✅ `npm run test:leados` → **18/18 passed** (4 specs) contra Neon dev.
- ✅ `npm run check:invariants` → **13/13 OK** (las 11 previas + `gate-envio` + `self-check`) — puras, corren sin DB.
- ✅ `npm run build` → exit 0 (type-check de los `.invariant.ts` nuevos bajo `src` + los specs bajo `tests`, incluidos en tsconfig).
- ✅ `eslint` sobre los 7 archivos nuevos → limpio. `prisma migrate status` → up to date (74 migs).
- ✅ Teardown por id exacto (namespacing `SMOKE-SETTER`) — sin residuo sobre la Neon dev compartida.

**Lo que queda (no bloqueante, para Franco):** (a) La ruta `/setter/nuevo` (render del form de alta) NO tiene test de browser propio — A.1 acá cubre el núcleo del action (write aislado) contra la DB; el render de la ruta se puede sumar al suite de setter (prod-QA) en un sprint de UI. (b) Los jobs de CI nuevos quedan definidos pero no ejecutados desde acá (no hay runner en esta sesión) — el verde reportado es local; requieren que `secrets.DATABASE_URL_TEST` esté cargado en el repo.

---

## E.1 — La base de la explosión de CONSTRUCCION: persistencia del progreso (migración SOLA, cero UI) · 2026-06-30

**Por qué.** La CONSTRUCCION se va a explotar en **fases-una-a-la-vez-con-estado** (E.2). E.1 es la BASE y va SOLA y PRIMERO: el campo que persiste el progreso + el contrato + la escritura aislada + el id estable, para verificarla contra la **columna vertebral** (self-check / transición / re-loop) ANTES de que exista UI que la enmascare. El progreso es un **CHECKLIST auto-reportado, NO un gate** — jamás se cablea a la transición EN_REVISION.

**Qué hace.**
- **SCHEMA (aditivo).** Campo `progresoJson Json?` en `OsLeadDossier` (hermano de `selfCheckJson`/`agendaJson`), nullable, SIN default. Migración `20260630000000_add_dossier_progreso` = `ALTER TABLE "OsLeadDossier" ADD COLUMN "progresoJson" JSONB;`, aplicada con **`prisma migrate deploy`** (forward-only). SIN backfill (`NULL` = checklist fresco; es progreso, no gate). **NUNCA** `migrate dev`/`reset`.
- **CONTRATO (`contracts.ts`).** `FASE_IDS` id-keyed (`estructura`·`personalizacion`·`assets`·`cta`·`calidad`·`mobile` — IDs ESTABLES, no índices) + `FaseId` + `ProgresoSchema` (`completadas`: `FaseId[]` default `[]`; `faseActual?`; `marcadas?`: record `FaseId`→ISO datetime). Default `{ completadas: [] }`.
- **id ESTABLE (`flow-content.ts`).** `ShellFase` suma `id: FaseId` (atado al enum) + los 6 ids en `SHELL_CONSTRUCCION`. Aditivo de CONTENIDO, no de schema. El `<ol>` de `construccion-step` sigue mapeando por posición (E.2 lo cambia).
- **ESCRITURA AISLADA (`dossier.ts`).** `saveOwnedProgreso` — espejo EXACTO de `saveOwnedSelfCheck`: `getOwnedDossier` (ownership) → guard `stage === CONSTRUCCION` → `ProgresoSchema.parse` ANTES de Prisma → `updateMany where {leadId, stage}` (guard optimista; SIN `assignedToId` — ownership derivado) → `data { progresoJson }`. **NUNCA toca `stage`.**
- **INVARIANTE (la 14ª).** `progreso-isolation.invariant.ts` (`check:invariant:progreso`) — pura, sin DB, `@/`-free (patrón escalamiento/alta-propia): aislamiento por (id + dueño) vía `ownedLeadWhere`; el payload del write es `{ progresoJson }` sin `stage`; el parse rechaza shape inválido (fase inventada / tipo malo / datetime basura); el default es checklist fresco; y los ids del shell son **EXACTAMENTE** `FASE_IDS` (biyección id-keyed).

**Decisiones / líneas de límite.**
- **Progreso = CHECKLIST, no gate (línea roja).** `progresoJson` JAMÁS se cablea a EN_REVISION. El único gate del envío a revisión sigue siendo `draftUrl` + `selfCheckAprobado`, INTACTO.
- **Re-loop PRESERVA (decisión adoptada).** NO se agregó `progresoJson` al reset de `transitionDossier` (preservar = zero-touch): el progreso sobrevive RECHAZADA→CONSTRUCCION, como corresponde a un checklist en curso.
- **Invariante pura de un write impuro.** `saveOwnedProgreso` usa Prisma → NO se importa en el harness ts-node; se testean las piezas PURAS que compone (`ownedLeadWhere` + `ProgresoSchema` + el payload reconstruido) — mismo patrón que `escalamiento`/`alta-propia` prueban `marcarEscaladoOwned`/`ownedLeadCreateData` sin tocar Neon.
- **Set INTOCABLE confirmado.** `self-check-gate.invariant.ts` + `selfcheck-anti-bypass.spec.ts` + la transición CONSTRUCCION→EN_REVISION + el re-loop RECHAZADA→CONSTRUCCION — NO tocados (verificados verdes).

**Verde (chequeado, no asumido).**
- ✅ `prisma migrate deploy` → migración aplicada forward-only (nunca `dev`/`reset`); `migrate status` → up to date (**75 migs**).
- ✅ `migrate diff` (live→schema): `progresoJson` **EN SYNC** — cero drift sobre `OsLeadDossier`. El diff NO-vacío es **DRIFT PRE-EXISTENTE y AJENO** del lane chatbot/dashboard (`Organization.averageTicketUsd`, `chatbot_bot_config.verticalPack`, `chatbot_lead.firstContactedAt/signals/utm*` — 7 columnas físicas que el schema ya no declara), **NO** de E.1. (`migrate status` verde lo esconde; `migrate diff` lo caza — la trampa ya anotada del drift físico.)
- ✅ `npm run check:invariants` → **14/14 OK** (las 13 previas + `progreso`) — puras, sin DB.
- ✅ `npm run test:leados` → **18/18** contra Neon dev: `dossier-gates` (incl. re-loop preserva historia) + `envio-demo-rechazo` + **`selfcheck-anti-bypass`** + `alta-import` — el gate/transición/re-loop siguen verdes con el campo nuevo.
- ✅ `npm run build` → exit 0. `tsc --noEmit` → **0 errores en los 4 archivos tocados** (único error tsc = PRE-EXISTENTE y ajeno: `src/lib/searchconsole.ts:119`, SEO — por eso Next salta la validación de tipos).
- ✅ Diff **surgical/additive**: `schema.prisma` +6, `contracts.ts` +34, `flow-content.ts` +13, `dossier.ts` +34, `package.json` +2 (mías) + migración + invariante nuevos. Nada más tocado; `transitionDossier`/`selfCheckAprobado`/`gateEnvioDemo` intactos.

**Lo que queda (no bloqueante, para Franco):** (a) La suite de flujo **browser 5.5** (`01-flow`, `test:setter`) NO se corrió acá (necesita chromium + prod-QA `start:qa` + el bounce AUTH_URL:3001); E.1 es **cero-UI/aditivo** → no puede afectar el wizard, y el core puro (`flow.invariant`) + el comportamiento del dossier (leados 18/18) están verdes. (b) El **drift PRE-EXISTENTE del lane chatbot** (7 columnas) queda flagueado: es del lane disjunto (dashboard/chatbot), NO de leados; reconciliarlo (con una migración aditiva propia o dropeando columnas) es decisión de Franco, fuera del scope de E.1. (c) **E.2** —la UI de fases-una-a-la-vez que CONSUME `progresoJson` (`saveOwnedProgreso` + explotar el `<ol>` a checklist persistido)— es el próximo paso: E.1 dejó la base verificada contra la columna vertebral.

---

## B1.A — Promover `TextArea` al kit UI (primitiva de formulario en su lugar correcto) · 2026-07-01

**Por qué.** La `TextArea` del wizard ya era una **primitiva consolidada** (18 usos en 9 archivos, 16+ dentro de `<Field>`, cero `<textarea>` crudo suelto) pero vivía en `setter/_components/text-area.tsx`. Su propio comentario lo delataba (*"el kit no trae una"*). El problema era de **UBICACIÓN, no de diseño**: es un primitivo de formulario genérico, hermano de `Input`. Sprint **mecánico/presentacional, riesgo ~0** — mové-de-archivo + barrel + imports. NO toca flujo/estado/contenido(FG)/dual-copy/StepAnchor.

**Qué hace.**
- **MOVER.** `setter/_components/text-area.tsx` → `components/ui/Textarea.tsx` (junto a `Input`). API EXACTA (mismas props: `invalid?` + `TextareaHTMLAttributes`), símbolo `TextArea` sin cambios. **Server-safe** (función plana, sin `'use client'`/`forwardRef`) — se mantiene como estaba, que es lo que pide "primitivo del kit"; no se agregó `forwardRef` (sería rediseño y forzaría `'use client'`; ningún uso pasa `ref`).
- **BARREL.** `export { TextArea } from './Textarea'` en `components/ui/index.ts` (alfabético, entre `Tabs` y `Toggle`).
- **REPUNTE (opción preferida, kit limpio para el handoff).** Los **9 archivos** que importaban de `_components/text-area` ahora importan `TextArea` del **barrel** `@/components/ui`. Los 9 YA importaban del barrel → se **fusionó** `TextArea` en el import existente (alfabético) y se borró la línea suelta. **Cero imports mixtos** (todos del kit, ninguno del shim; no se dejó shim). Archivos: `ficha`/`opener`/`brief`/`evaluacion`/`agenda`/`seguimiento`-step, `escalar-modal`, `lead-card-actions`, `nuevo-prospecto-form`.
- **ESTILO.** Borde/focus/error ya eran **idénticos** a `Input` (no había qué alinear). El único delta es `placeholder:text-zinc-600` (vs `-500` de `Input`), NO listado en el align y fuera del "sin cambiar el look percibido" → se preservó tal cual. **Cero cambio visual** por construcción (mové de archivo).

**Decisiones / líneas de límite.**
- **Promoción, no rediseño (línea roja).** Componente byte-idéntico salvo el comentario stale. No `forwardRef`, no `'use client'`, no tocar el placeholder. Los `<Field>` que envuelven las `TextArea` quedan igual.
- **Barrel sobre shim.** Se eligió repuntar los 9 imports (deja `_components/` sin el primitivo, kit limpio) en vez de dejar un re-export shim. Regla respetada: **no imports mixtos**.

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores en los 11 archivos tocados** (Textarea.tsx + index.ts + 9 consumidores). El resto del proyecto: 1 error AMBIENTE pre-existente y ajeno (`src/lib/searchconsole.ts:119`, conflicto de tipos `google-auth-library`/`google-gax`) — verificado presente en HEAD limpio, NO mío.
- ✅ **Drift Prisma ambiente resuelto en el entorno, no en el schema.** El `tsc` inicial tiró 19 errores del lane chatbot/dashboard (`verticalPack`/`averageTicketUsd`/`firstContactedAt`/`signals`); el schema YA declara esos campos → era **cliente Prisma stale**. `npx prisma generate` (solo `node_modules`, NO toca schema/DB, NO `migrate reset`) los limpió 18/19. Sprint **sin cambios de schema**, como corresponde.
- ✅ `npm run build` → exit 0, compiló `/setter`, `/setter/leads/[leadId]`, `/setter/nuevo` (`ignoreBuildErrors: true` salta el 1 ambiente).
- ✅ `npm run test:leados` → **21/21** contra Neon dev.
- ✅ `npm run test:setter` → **39/39** (browser, prod-QA:3001): incluye B1–B11 del wizard (ficha/opener/brief/agenda/evaluación/seguimiento renderizando la `TextArea` movida) + alta/import del nuevo-prospecto. Cero regresión perceptual.
- ✅ Diff **surgical**: 1 archivo nuevo (`Textarea.tsx`), 1 borrado (`text-area.tsx`), `index.ts` +1, 9 consumidores +0/−0 neto en líneas (import fusionado − import suelto). `git status` = exactamente el scope.

**Lo que queda (para Franco):** (a) **Drift PRE-EXISTENTE del lane chatbot** (las 7 columnas físicas) sigue flagueado como en E.1 — ajeno a este sprint, decisión de reconciliación de Franco. (b) Pasada **perceptual** opcional: la `TextArea` se ve igual por construcción (byte-idéntica) y los 39 tests de setter la ejercitan, pero si Franco quiere un ojo humano sobre los formularios del wizard, queda anotado (no bloqueante).

---

## B6.1 — La dirección del wizard apunta a la ACCIÓN pendiente, no al paso-por-stage bloqueado · 2026-07-01

**Por qué.** El auto-scroll y el cartel «Tu paso ahora» derivaban el paso activo del `stage` (vía `pasoActual`), pero eso dejaba al setter mirando lo equivocado en dos estados concretos (medido en el proof-e2e):
- **EVALUADA con gate cerrado** (esperando respuesta): scroll + cartel iban al **Brief bloqueado** y **salteaban el opener**, que es la acción realmente pendiente. El cartel decía «esperá la respuesta» sin mandar a mandar el primer contacto.
- **RECHAZADA**: el scroll saltaba a Construcción (~2200px) y dejaba la nota de Franco (el Callout de retrabajo) 2+ pantallas arriba del viewport. La tarjeta decía «lo tenés arriba», pero el auto-scroll ya te había sacado de arriba.

**Qué hace.** Dos correcciones quirúrgicas, layered sobre `pasoActual` (NO se re-implementa el flujo, NO se toca gate/transición/§3):
- **Fix 1 — EVALUADA + opener pendiente → el opener es el paso activo.** El shell calcula `openerPendiente = stage==='EVALUADA' && !gateAbierto && outreach.contactos===0` (exactamente el caso en que el Brief está bloqueado *y* no salió el primer contacto) y lo pasa a `anchorActivo` y a `describirFoco` (igual que `gateAbierto`, sin re-derivarlo). Con eso: el `StepAnchor` del opener pasa a `active` (ahí aterriza el scroll + se enmarca en cyan) y el cartel dice **«Mandá el primer mensaje (opener)»** en tono `foco`, no «esperá la respuesta». Acotado a **gate cerrado**: EVALUADA con gate abierto (respondió/caliente) sigue apuntando al Brief — ese camino ya funcionaba.
- **Fix 2 — RECHAZADA → la nota de Franco donde el setter aterriza.** La rama `RECHAZADA` de `construccion-step.tsx` ahora renderiza el **mismo `GuiaRetrabajo`** que la rama `CONSTRUCCION` ya mostraba tras reabrir. Como el auto-scroll aterriza en Construcción (paso activo, sin cambios), la nota cae **junto** al punto de aterrizaje. El «lo tenés arriba» ahora apunta a la guía inline directamente encima del párrafo. La opción que **menos toca el `StepAnchor`** (cero cambios al scroll/anchor de RECHAZADA).

**Archivos (3, todos presentacionales del wizard):** `paso-actual-banner.tsx` (`describirFoco`/`PasoActualBanner` reciben `openerPendiente`; rama EVALUADA + ícono `Send`), `lead-wizard.tsx` (deriva `openerPendiente`, lo pasa a `anchorActivo`/`describirFoco`/banner; `StepAnchorId` suma `'opener'`; el `StepAnchor` del opener se activa/enmarca), `construccion-step.tsx` (rama RECHAZADA renderiza `GuiaRetrabajo`).

**Decisiones / líneas de límite.**
- **Fix acotado a gate cerrado** (no a todo «EVALUADA sin opener»): el problema es el **Brief bloqueado**. Con gate abierto (caliente/respondió) el Brief SÍ es accionable → dirigir ahí es correcto (camino preventivo del caliente, intacto).
- **`StepAnchor` intacto**: no se tocó su lógica de scroll ni el dual-copy (scoped por `offsetParent`, nunca global-by-id). Solo cambia qué sección recibe `active`/`frameTone` desde el shell.
- **Duplicación benigna en RECHAZADA**: el Callout rico del tope (`lead-wizard`) coexiste con el `GuiaRetrabajo` inline (compacto). Nunca se ven juntos (2+ pantallas de distancia) y espeja el patrón que ya existía en CONSTRUCCION. Se prefirió AGREGAR la guía inline antes que mover/remover el Callout del tope (menos superficie tocada).

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores en los 3 archivos tocados**. Único error del repo: el AMBIENTE pre-existente y ajeno `src/lib/searchconsole.ts:119` (`google-auth-library`/`google-gax`), el mismo flagueado en B1.A — NO mío.
- ✅ `npm run check:invariants` → verde (lógica pura de `lib/leados`, no la toca este sprint).
- ✅ `npm run test:leados` → **21/21** (Neon dev).
- ✅ `npm run test:setter` → **39/39** (browser, prod-QA:3001), incluye **B3 opener** (el form del opener sigue funcionando con el marco activo nuevo) y **B10 rechazo** + el recorrido **B1–B11** (ficha→evaluación→construcción→aprobada avanza sin regresión).
- ✅ **Pasada perceptual + geométrica** (`scripts/qa-corridas/_verify-b61.ts`, desktop 1440×900 + mobile 390×844, contra los leads `QA-W` del seed V-1), screenshots en `docs/proof-screenshots/b6-1/`:
  - **Caso 1** (`QA-W Evaluada Gate Cerrado`): cartel = «Mandá el primer mensaje (opener)» (sin «esperá la respuesta»); el opener aterriza **dentro** del viewport (y=217 desktop / y=265 mobile).
  - **Caso 2** (`QA-W Rechazada`): la «Guía de retrabajo — lo que Franco pidió corregir» aterriza **dentro** del viewport (y=270 / y=351), enmarcada como paso activo.
  - **Regresión A** (`QA-W Evaluada Gate Abierto`): sigue en «Brief de diseño» (fix acotado, gate abierto intacto).
  - **Regresión B** (`QA-W Construccion`): «Seguí construyendo la demo» sin cambios.

**Lo que queda (para Franco):** (a) el error de tipos AMBIENTE de `searchconsole.ts` sigue pre-existente y ajeno (decisión de reconciliación de deps, fuera de scope). (b) El sub-caso EVALUADA gate-cerrado con opener YA mandado (contactos>0, esperando respuesta) mantiene su comportamiento previo (cartel «espera», scroll al Brief): no estaba en el alcance de los dos casos rotos; si se quiere reencauzarlo a «Seguimiento», es un sprint aparte.

---

## B6.2 — El re-loop RECHAZADA→CONSTRUCCION resetea el self-check (gate), preservando fases + draft · 2026-07-01

**Por qué.** El proof-e2e del re-loop de rechazo (corrida C, `scripts/qa-corridas/rejection-reloop.ts`) mostró una tensión: preservar TODO el progreso al reabrir un rechazo ayuda en una parte y confunde en otra.
- **El checklist de fases (auto-reporte) preservado AYUDA:** el setter retoma sabiendo que la base está hecha. Se mantiene (decisión de E.1/E.4, ya con su invariante `progreso`).
- **El self-check preservado CONFUNDE:** al reabrir, los 6 hard-checks + «Enviar a revisión» quedaban como antes del rechazo (6/6 en verde). Un setter podía reenviar SIN corregir nada real. La distinción es de naturaleza: el checklist de fases es **auto-reporte** (preservar = bien); el self-check es un **GATE** (preservar = deja saltear la corrección).

**Qué hace.** Reset QUIRÚRGICO del self-check acotado al único loop-back, layered sobre `transitionDossier` (NO se re-implementa la máquina, NO se toca el gate ni `enviarARevision`):
- **`escalamiento.ts` (donde vive `ESCALADO_RESET`):** dos primitivas puras nuevas — `esReloopRechazo(from, to)` (el único loop-back: `RECHAZADA→CONSTRUCCION`) y `RELOOP_RESET = { selfCheckJson: Prisma.DbNull }` (limpia SOLO el self-check; `Json?` en null exige `Prisma.DbNull`, no `null` literal — mismo criterio que `agendaJson`).
- **`transitionDossier` (dossier.ts):** el `data` de la transición ahora es `{ stage, ...ESCALADO_RESET, ...(esReloopRechazo(from, to) ? RELOOP_RESET : {}) }`. Al reabrir un rechazo, además del escalado se limpia `selfCheckJson` → `selfCheckAprobado` vuelve a `false` → el setter re-verifica los 6 antes de reenviar. En la UI eso ya cae solo: `durosIniciales(null)` deja los 6 toggles en rojo y «Enviar a revisión» queda `disabled` hasta 6/6.

**Decisiones / líneas de límite.**
- **NO se agregó `selfCheckJson` a `ESCALADO_RESET` (línea roja invertida).** El pedido literal («agregar al `ESCALADO_RESET`») habría sido una REGRESIÓN: `ESCALADO_RESET` se mergea en CADA transición, así que borraría el self-check también en `CONSTRUCCION→EN_REVISION` — donde DEBE sobrevivir, porque el admin lo lee en la superficie de revisión (`SelfCheckPanel`, `exigible` en EN_REVISION/APROBADA muestra un Callout de anomalía si falta). Además rompería el invariante existente `escalamiento` (que fija `ESCALADO_RESET === {escaladoAt, escaladoNota}`). Por eso el reset se **acota** al re-loop vía `esReloopRechazo`, cumpliendo el intent (que RECHAZADA→CONSTRUCCION limpie el self-check) sin la regresión.
- **El GATE no cambia.** Sigue siendo `draftUrl` + `selfCheckAprobado`. Solo que al limpiar `selfCheckJson`, `selfCheckAprobado` vuelve a `false` hasta la re-verificación. `enviarARevision` y `selfCheckAprobado` **intactos** (verificados verdes).
- **Preserva `progresoJson` y `draftUrl`** — `RELOOP_RESET` toca SOLO `selfCheckJson` (la ausencia de clave = zero-touch). El re-loop sigue siendo el **único** loop-back.
- **No toca schema.** Solo se limpia una columna existente en una transición existente.

**Verde (chequeado, no asumido).**
- ✅ `npx prisma migrate status` → up to date (**77 migs**); sprint sin cambios de schema.
- ✅ `npm run check:invariants` → **15/15 OK** (los 14 previos + **`reloop-selfcheck`** nuevo). El invariante `escalamiento` (que fija `ESCALADO_RESET`) sigue verde: confirma que NO se contaminó el reset global.
- ✅ `npm run test:leados` → **22/22** (Neon dev): incluye el **test nuevo B6.2** (`el re-loop RECHAZADA→CONSTRUCCION resetea el self-check y preserva fases + draft` — prueba también que el self-check SOBREVIVE a EN_REVISION, la anti-regresión, contra la DB real) + el `progreso`-preservado del re-loop SIGUE verde (sin cambios) + los `selfcheck-anti-bypass` (el gate) intactos.
- ✅ `npm run test:setter` → **39/39** (browser, prod-QA:3001): B6 (draft+self-check+enviar, self-check llega a EN_REVISION) y B10 (rechazo) sin regresión.
- ✅ `npx tsc --noEmit` → **0 errores nuevos** en los archivos tocados (único error tsc = PRE-EXISTENTE y ajeno: `src/lib/searchconsole.ts:119`, SEO/`google-auth-library`, el mismo flagueado en B1.A/B6.1 — NO mío).
- ✅ Diff **surgical/additive**: `escalamiento.ts` (+`esReloopRechazo`/`RELOOP_RESET`/import valor `Prisma`), `dossier.ts` (import + 1 línea en el spread de `data`), `reloop-selfcheck-reset.invariant.ts` (NUEVO), `package.json` (+2), `tests/leados/dossier-gates.spec.ts` (imports + 1 test). `transitionDossier`/`selfCheckAprobado`/`enviarARevision`/`ESCALADO_RESET` intactos.

**Lo que queda (para Franco):** (a) El guion manual `scripts/qa-corridas/rejection-reloop.ts` (corrida C, **untracked**) se actualizó a la conducta nueva (pasos [12]/[14]: el self-check llega VACÍO tras reabrir y el setter re-verifica los 6) pero **NO se re-corrió** acá (necesita `start:qa` + el seed V-1 `QA-W`) — queda para regenerar los screenshots de `corrida-2` cuando quieras el ojo humano. (b) **Pasada perceptual del wizard = B6.6** (fuera de este sprint, que es lógica de transición): el core está cubierto por el test DB nuevo + los 39 de setter, pero el recorrido visual del re-loop (self-check vacío, botón disabled hasta 6/6) lo cierra B6.6. (c) El error de tipos AMBIENTE de `searchconsole.ts` sigue pre-existente y ajeno.

---

## B6.3 — Acceso persistente a «Cargar prospecto» en el rail del setter (visible con cartera activa) · 2026-07-02

**Por qué.** El proof-e2e mostró que el único acceso a `/setter/nuevo` (alta individual + puerta a la importación por lista) vivía dentro de estados de cartera VACÍA: `home-empty.tsx` (empty state) y el link sobrio de `home-en-espera.tsx` (todo en espera). Un setter con cartera ACTIVA —el estado real de trabajo— no tenía dónde cargar sus propios prospectos sin ir por URL directa. Confirmado en código (rail/foco/cartera: cero menciones de «Cargar/Importar» fuera del vacío) y contra el build (SSR de `/setter` con foco activo no traía ningún CTA de alta).

**Qué hace.** Un botón persistente **«Cargar prospecto»** al TOPE del rail del setter (`setter-nav.tsx`), presente en TODA la zona `/setter` (incluida la cartera activa), sin scroll. Navega por `triggerTransition('/setter/nuevo')` — desde donde ya se llega tanto al alta individual como a la importación (el link «¿Tenés una lista?» vive en `/setter/nuevo`). Presentacional puro: no toca flujo, estado ni gates.

**Decisiones / líneas de límite.**
- **Rail, no home/foco.** El rail es fijo y visible sin scrollear en todos los estados (vacío / foco / en-espera / detalle de lead); un CTA en el home solo cubriría el home. La línea B6.3 pedía «SIEMPRE visible» → el rail lo garantiza estructuralmente.
- **FUERA de `NAV_ITEMS`, no adentro.** `NAV_ITEMS` son *hubs* con activo por subárbol (`startsWith('/setter/…')`): meter `/setter/nuevo` ahí habría prendido DOS `aria-current="page"` a la vez (Cartera + Cargar) en `/setter/nuevo`. Es una **acción**, no un destino de barra → botón propio (cyan sobrio, `bg-cyan-400/15`) antes del `<nav>`, sin `aria-current`. Los asserts de nav (`filter hasText 'Cartera'`, `button[aria-current="page"]`) quedan intactos.
- **`triggerTransition`, como el resto del rail** (decisión cerrada · CLAUDE.md para la zona setter): consistente con `NAV_ITEMS`; cierra el drawer mobile vía `onNavigate`.

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores** en el archivo tocado. Único error del repo = pre-existente y ajeno `src/lib/searchconsole.ts:119` (`google-auth-library`) — NO mío.
- ✅ `npm run test:setter` → **39/39** (browser, prod-QA:3001): el botón nuevo NO rompió A2 (nav + rail + aria-current) ni F6 (a11y landmarks / aria-current en el destino activo).
- ✅ `npm run test:leados` → **22/22** y `npm run check:invariants` → **15/15** (sin cambios de lógica).
- ✅ **Proof SSR autenticado** (setter-qa, cookie `__Secure-authjs.session-token` minteada como el helper e2e) contra el build en `:3001`: `/setter` → **200**, «Cargar prospecto» **server-rendered** al TOPE del rail (precede a «Tus herramientas»), con la home «Tu día» (cartera ACTIVA, no el empty state).

**Lo que queda (para Franco):** (a) **Pasada perceptual del home = B6.6** (fuera de este sprint): el CTA está probado presente y posicionado por SSR + los 39 de setter, pero el ojo humano (contraste, peso visual del cyan en el rail) lo cierra B6.6. (b) `searchconsole.ts` sigue pre-existente y ajeno.

---

## B6.5 — Tres fixes menores acotados (router.refresh escalado · puente self-check→prompt · CTA del home sobre el fold) · 2026-07-02

**1. `EscalarModal` — `router.refresh()` tras escalar (hallazgo 5.5).**
- *Por qué.* La marca `escaladoAt` que enciende el banner «Ya avisaste a Franco» (`construccion-step.tsx`) baja por props del server component; la action `escalarConstruccion` NO revalida el path → el banner recién aparecía tras un reload manual.
- *Qué hace.* `escalar-modal.tsx` (client) ahora importa `useRouter` y llama `router.refresh()` tras el éxito (después de cerrar el modal y limpiar el textarea, antes del toast). El server re-renderiza con `escaladoAt` poblado → el banner aparece al instante. No toca la action, el gate ni la notificación por Telegram.

**2. Puente self-check→prompt (`HARD_CHECK_PROMPT` en `prompts-disenio.ts`).**
- *Hallazgo tras verificar el código.* El pedido asumía un techo de ~3/6 «porque hay 3 prompts» (estetica/mobile/motion). Pero el mapeo es por **correspondencia hard-check→prompt**, no por conteo de prompts. Los 6 hard-blocks (`carga`, `mobile`, `sinRelleno`, `linksWhatsapp`, `datosReales`, `fielAlBrief`) son gates **funcionales/de contenido**; el único que corresponde a un prompt de diseño lead-agnóstico es `mobile` (→ ya mapeado). `estetica` («pulí la estética» — explícitamente *«no reescribas los textos»*) y `motion` («animaciones/estados») NO casan con ningún hard-block: `estetica`/`motion` en realidad corresponden a los **SOFT-checks** (`coloresDeMas`, `fuenteDefault`, `imagenesDeformadas`…), que son otra superficie (no bloquean; los lee el ADMIN en revisión, no el setter en el self-check).
- *Decisión (línea roja «no fuerces los que no tienen prompt»).* Mapear `sinRelleno`/`datosReales`/`fielAlBrief` a `estetica` sería **activamente erróneo** (el prompt estetica se niega a tocar el texto/contenido, que es justo lo que esos checks piden) y `carga`/`linksWhatsapp` a `motion` es un sinsentido. El techo real es **1/6**, ya cubierto. **Sin cambio de código** en item 2 — el mapa ya está en su cobertura honesta; la cabecera del propio archivo ya documentaba el porqué de cada no-mapeo. Surface, no fuerzo.

**3. Onboarding vs CTA del home (proof S3).**
- *Por qué.* La tarjeta pedagógica `OnboardingHint` («Cómo funciona tu día», buena — se queda) se renderizaba ARRIBA de la acción, empujando el CTA («Ir a trabajarlo» / «Cargar prospecto») fuera del fold para el setter nuevo.
- *Qué hace.* `page.tsx`: se movió `<OnboardingHint />` de ANTES a DESPUÉS del branch de acción (foco / en-espera / vacío). La acción queda pegada al header (sobre el fold); la guía baja íntegra —cero pérdida de contenido pedagógico— y su copy («Arriba está el que toca ahora») ahora describe literalmente el foco que quedó por encima. Sigue descartable (localStorage): el que ya la cerró no la ve.

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores** en los archivos tocados (único = pre-existente/ajeno `searchconsole.ts:119`).
- ✅ `npm run test:setter` → **39/39** (prod-QA:3001): B5 (escalar «me trabé» persiste) y B6 (draft+self-check+enviar + **reset escalado**) verdes → el `router.refresh()` no rompió el flujo de escalamiento.
- ✅ `npm run test:leados` → **22/22** y `npm run check:invariants` → **15/15** (item 2 sin cambios; items 1 y 3 son UI, no tocan `lib/leados`).
- ✅ Diff surgical: `escalar-modal.tsx` (+import `useRouter`, +`const router`, +`router.refresh()`), `page.tsx` (reordenado `OnboardingHint`). `prompts-disenio.ts` **sin tocar** (item 2 = no-op justificado).

**Lo que queda (para Franco):** (a) **Item 2:** si querés cobertura >1/6, el camino correcto es enganchar `estetica`/`motion` a los **SOFT-checks** (su superficie natural), no forzar los hard-blocks — es un sprint aparte porque toca otra superficie (revisión del admin) y sumaría un mapa nuevo, fuera de lo «acotado» de B6.5. (b) **Pasada perceptual home/wizard = B6.6**: el `router.refresh()` y el reorden están cubiertos por los 39 de setter, pero el ojo humano (banner al instante sin parpadeo, CTA sobre el fold en 1440 y 390) lo cierra B6.6. (c) `searchconsole.ts` sigue pre-existente y ajeno.

---

## AUD-1 — Auditoría read-only del setter vs Brief de Visión v2 · 2026-07-02

**Qué se hizo.** Auditoría estática read-only del repo completo contra el **Brief de Visión v2** (02/07/2026): verificación del gating de aislamiento (meta-chequeo), cobertura sección por sección §2–§9, fase "fuera del guion" con lentes propias, y verificación adversarial independiente de cada hallazgo (evidencia archivo:línea releída una por una). Cero modificaciones al repo salvo las dos escrituras autorizadas del Cierre (este append + el informe).

**Veredicto de gating (una línea).** **GATEA — con perímetro acotado:** los tests de aislamiento ejercitan el mecanismo real (ownership 100% capa aplicación, sin RLS) con identidad de sesión real y asserts por contenido que fallarían ante una fuga de lectura o del chokepoint compartido de ownership; la denegación de MUTACIÓN cruzada solo está testeada en 2 de ~19 funciones de escritura (progreso y alta) — el resto se sostiene por consistencia de patrón verificada por lectura, no por tests.

**Informe.** `AUDITORIA-VS-BRIEF-2026-07.md` (raíz del repo): 29 divergencias verificadas (2 sev 4 — wizard página-larga §3 y fuga de nomenclatura "caliente" §5 —, 9 sev 3, 13 sev 2, 5 sev 1), §6 y §9 **sin divergencias** (línea inviolable del envío verificada server-side + invariante), las 4 decisiones fijadas del §8 **cumplen**.

**Queda para verificación humana (del informe, sección 6):** (a) links de herramientas externas (§12.3) cargados en producción (`herramientas.ts` / badge "pendiente" del rail); (b) prueba dinámica que cierre el perímetro del gating: sesión real de setter B disparando las server actions de dossier/outreach/agenda/cartera/foco con `leadId` de A (denegación + fila intacta); (c) lectura y triage del informe por Franco — nada de lo propuesto se ejecutó.

**DoD estándar — N/A declarados.** `npx tsc --noEmit` **N/A**: no se tocó código (y rige la regla 2 de no-ejecución de la auditoría). `npx prisma generate` **N/A**: no se tocó el schema.

---

## Sprint 2.3 — Datos que vuelven: teléfono re-servido, evaluación protegida, archivo categorizado que suma (cierre del BLOQUE 2 de remediación post-auditoría · A-14/A-24/A-09) · 2026-07-02

**Por qué.** Tres hallazgos de `AUDITORIA-VS-BRIEF-2026-07.md` (AUD-1), independientes entre sí, todos de la misma naturaleza: dato que YA existe en el motor pero nunca se expone o nunca se protege en la superficie del setter.
- **A-14 (§3, re-servido):** el teléfono se captura en el alta (`nuevo-prospecto-form.tsx`) y `OsLead.phone` viaja completo en `getOwnedLead` (sin `select`), pero `page.tsx` lo omitía del objeto `lead` de `WizardData` — no se mostraba en ningún lado del panel.
- **A-24 (§1/§3):** Ficha y Brief tienen `useUnsavedGuard` (autosave); Evaluación no — es un formulario de una sola pasada sin borrador, así que cerrar la pestaña a mitad del razonamiento lo perdía entero.
- **A-09 (§5):** PERDIDO (status) y DESCARTADA (stage) colapsaban en un único grupo `archivo` sin categoría (`flow.ts`); el motivo real de la caída ya está persistido y `dossier.ts` lo EXIGE en la transición EVALUADA→DESCARTADA (`motivoDescarte`, `contracts.ts:52`), pero nunca se exponía; y ningún archivado sumaba a "Tu semana" (`progreso.ts`) pese a que el propio copy de Evaluación ya dice "el descarte honesto es trabajo bien hecho".

**Qué hace.** Los tres, capa de presentación/derivación pura — cero cambios a transiciones, gates o schema:
- **A-14.** `page.tsx` agrega `phone: lead.phone` al objeto `lead` (dato ya traído, sin query nueva) y lo suma a la línea de `meta` del header. `WizardLead` (`lead-wizard.tsx`) suma el campo y lo pasa como `leadPhone` a `SeguimientoStep` y `AgendaStep` (mismo patrón que `contactName`/`leadEmail`, no el objeto `lead` completo). Se re-sirve con ícono `Phone`: en el header, al tope de Seguimiento y al tope de Agenda (+ en el resumen "Con:" de una reunión ya agendada).
- **A-24.** `evaluacion-step.tsx`: se hoisteó `faltantesFicha`/`fichaFaltantes(ficha)` antes de los early-return (para no violar rules-of-hooks) y se agregó `formVisible = !evaluacion && habilitado && faltantesFicha.length === 0` + `hayCambiosSinGuardar` (true si `score`/`veredicto`/`razonamiento`/`motivoDescarte` tienen contenido Y el form sigue editable) → `useUnsavedGuard(hayCambiosSinGuardar)`. Mismo hook que Ficha/Brief; acá sin autosave que lo alimente, se deriva del estado del form directamente.
- **A-09.** `flow.ts` suma `agenda: Agenda | null` a `HomeLeadInput` (parseado en `home.ts` vía `parseAgenda(dossier.agendaJson)`, dossier ya incluido — cero queries nuevas) y una función pura nueva `archivoMotivo(lead)`: distingue `descartado` (stage DESCARTADA, motivo = `evaluacion.motivoDescarte`, SIEMPRE presente por el gate de `dossier.ts`) de `perdido` (status PERDIDO, motivo = `agenda.resultado.nota`, OPCIONAL — el schema no lo exige, así que puede venir `null`). `VistaCartera` pasa de `HomeGroupKey | 'pausados'` a `Exclude<HomeGroupKey, 'archivo'> | 'archivo-descartado' | 'archivo-perdido' | 'pausados'` (el `HomeGroupKey`/`grupoPara` del home NO se toca — el `'archivo'` bare sigue existiendo ahí; solo la vista de la cartera se subdivide). `cartera-toolbar.tsx` reemplaza el filtro único "Descartados y perdidos" por dos opciones ("Descartados (antes de la demo)" / "Perdidos (post-reunión)"); `home-sections.tsx` (`LeadCard`) muestra el motivo real cuando existe ("Motivo:" / "Nota del cierre:"). `progreso.ts` suma `archivados` a `ProgresoSemana` (descartado por `evaluacionJson.fecha`, perdido por `agenda.resultado.fecha`, ambos dentro de la ventana de 7 días) y lo entra al `total` (para que un setter que solo descartó/perdió esta semana deje de ver "Tu semana" oculta); `progreso-semana.tsx` agrega el ítem "N negocios filtrados o cerrados".

**Decisiones / líneas de límite.**
- **PERDIDO no fuerza un motivo que no está garantizado.** El pedido cita `contracts.ts:52`/`dossier.ts:193-205` como evidencia de que el motivo "ya está persistido" — pero eso aplica solo a `motivoDescarte` (DESCARTADA, exigido por la transición). La nota de PERDIDO (`agenda.resultado.nota`) es `textoLibre` opcional en `AgendaSchema`; `archivoMotivo` lo refleja devolviendo `motivo: null` cuando no existe, en vez de inventar un texto o forzar el campo a requerido (eso sí sería tocar el contrato, fuera de scope).
- **No se tocó `HomeGroupKey`/`grupoPara`/`agruparParaHome`** (la partición del home/foco): la subcategorización vive SOLO en `VistaCartera`/`vistaDeLead`/`archivoMotivo`, la capa que ya era exclusiva del filtro de la cartera secundaria. El home sigue viendo un solo `'archivo'` internamente (sin cambio de comportamiento en foco/en-espera).
- **`archivados` SÍ suma al `total` de `ProgresoSemana`** (no es un contador aparte): si no sumara, un setter que solo filtró/cerró leads esta semana seguiría viendo la sección "Tu semana" oculta (`total === 0`) — exactamente el síntoma que A-09 pedía corregir ("que sume a la sensación de progreso").
- **`mis-numeros.ts` no se tocó.** El hallazgo lo cita como evidencia del gap (`activos` excluye PERDIDO), pero el fix pedido explícitamente apunta a "Tu semana" (`progreso.ts`), no a "Mis números" — cambiar la semántica de `activos` (leads vivos en cartera, un concepto distinto) hubiera sido una regresión de alcance no pedida.

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores** (incluye dos fixtures de invariante que construían `HomeLeadInput` a mano — `flow.invariant.ts`, `foco.invariant.ts` — actualizados con `agenda: null`).
- ✅ `npm run check:invariants` → **15/15 OK** (sin cambios de invariante nuevos; los existentes — incluido `reloop-selfcheck` de B6.2 — siguen verdes, confirmando que la derivación nueva no tocó ninguna transición).
- ✅ `npm run test:leados` → **22/22** (Neon dev, sin cambios de comportamiento en el motor).
- ✅ `npm run build` + `npm run test:setter` → **39/39** (browser, prod-QA:3001) — cero regresión en el recorrido B1–B11, aislamiento, cabina, admin, claim atómico.
- ✅ **Verificación en vivo** (prod-QA:3001, sesión real `setter-qa` vía `/api/qa/login` + `preview_*`): header/Seguimiento/Agenda muestran el teléfono con ícono cuando el lead lo tiene (probado seteando y revirtiendo el campo en un lead propio, sin dejar rastro); el filtro de la cartera lista las dos opciones nuevas ("Descartados (antes de la demo)" / "Perdidos (post-reunión)"); las cards de archivo muestran "Motivo: …" en los DESCARTADA reales del seed y correctamente NO muestran nada en el PERDIDO del seed (sin nota persistida) — sin errores de consola. Un script ad-hoc (`assert.strict`, borrado tras correr) confirmó `vistaDeLead`/`archivoMotivo`/`filtrarYOrdenarCartera` puros contra fixtures propios (descartado/perdido-con-nota/perdido-sin-nota/activo). La guardia de Evaluación se probó disparando un `beforeunload` sintético: `defaultPrevented=true` con el razonamiento tipeado, `false` con el campo vacío.
- ✅ Diff **surgical/additive**: 13 archivos de código (`flow.ts` +37/−, `home.ts` +4, `progreso.ts` +29/−, `cartera-toolbar.tsx` +4/−, `home-sections.tsx` +12, `progreso-semana.tsx` +9/−, `page.tsx` +7/−, `lead-wizard.tsx` +5, `seguimiento-step.tsx`/`agenda-step.tsx` +15/− c/u, `evaluacion-step.tsx` +14/−, dos invariantes +1 línea c/u). `dossier.ts`, `escalamiento.ts`, `schema.prisma` **sin tocar** — motor intacto.

**Lo que queda (para Franco):** (a) si en algún momento se quiere garantizar también un motivo para PERDIDO, el camino correcto es volver `agenda.resultado.nota` obligatorio en `AgendaSchema` — decisión de contrato, fuera de esta capa de presentación. (b) Pasada perceptual humana de las tres superficies (contraste del ícono de teléfono, peso visual del "Motivo:" en la card) queda para cuando Franco la quiera — cubierta acá por la verificación en vivo + los 39 de setter, no por un ojo humano.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 2.3 / BLOQUE 2: cerró verde. A-14: ok · A-24: ok · A-09: ok.
Desvíos: ninguno de fondo — el catch-up de commits pendientes (B1.A/B6.1-B6.5/AUD-1, seis sprints previos sin commitear) se resolvió con un commit aparte antes de arrancar 2.3, y `docs/proof-screenshots/` se gitignoró (159MB de PNGs de corridas QA previas) en vez de commitearse. Pendiente: nada de este sprint; queda anotado (b) de arriba para cuando Franco quiera la pasada perceptual humana.

## Sprint 3.1 — Hook `useStepAction`: el ciclo submit de los steps, en un solo lugar (BLOQUE 3 de remediación post-auditoría · A-16) · 2026-07-02

**Hallazgo (A-16).** El mismo ciclo submit copy-pasteado en los steps del wizard: el mapeo `ZodError → FormErrors` idéntico 3 veces (Evaluación ×2, Brief ×1) y el ciclo `startTransition → action → toast → router.refresh()` en 7 transiciones de 5 archivos. El Bloque 4/5 va a multiplicar pantallas — cada una repetiría este boilerplate.

**Qué se hizo.** Se extrajo el ciclo a `src/lib/use-step-action.ts` (hermano de `use-autosave.ts` / `use-unsaved-guard.ts`), con dos exports:
- `useStepAction()` → `{ isPending, run }`: ejecuta la server action dentro de la transición; ante `!result.success` corre `onError` (estado propio del step) + `toast.error(result.error)`; ante éxito corre `onSuccess`, el toast de éxito (`successToast`: string fijo o función del payload — omitido = sin toast) y `router.refresh()` (`refresh: false` lo apaga). El hook NO homogeneiza: todo lo que variaba entra por parámetro.
- `erroresPorCampo<Campo>(zodError)`: el loop compartido «primer mensaje por campo, solo `path[0]`» que los steps con errores per-campo copiaban idéntico.

**Censo (Fase 1) — 9 call-sites en los 5 archivos listados, 9 migrados:**

| Call-site | Action | Particularidades preservadas por parámetro |
|---|---|---|
| Evaluación · `enviar` | `registrarEvaluacion` | `setServerError` en `onError`; cierre del modal en `onSuccess`; toast condicional en 3 variantes (`descartado`/`gateAbierto`/espera) |
| Evaluación · `intentarEnviar` | — (solo validación) | sin transición: solo adopta `erroresPorCampo`; la apertura del modal ante «solo falta `motivoDescarte`» queda EN el step |
| Brief · `guardar` | `guardarBrief` | `setServerError`; `autosave.markSaved()` + `setEditando(false)` + `setSanityOk(false)` en `onSuccess`; toast fijo |
| Construcción · `transicionar` (×2: iniciar/reabrir) | `iniciarConstruccion`/`reabrirConstruccion` | sin estado de error propio (solo toast); mensaje de éxito por parámetro — el helper local quedó de 10 líneas a 1 |
| Agenda · `buscarHorarios` | `ofrecerHorarios` | **variación**: SIN toast de éxito y SIN refresh (solo carga slots) → `successToast` omitido + `refresh: false` |
| Agenda · `confirmar` | `confirmarReunion` | **variación**: reset condicional de slots cuando el error dice «se acaba de ocupar» — preservado dentro de `onError`; toast derivado del slot confirmado |
| Seguimiento · `registrar` | `registrarResultado` | limpieza del form (resultado/nota/fecha) en `onSuccess`; toast derivado vía `toastDeResultado` |
| Seguimiento · `registrarEnvioDemo` | `enviarDemoAprobada` | sin estado de error propio; toast derivado de `yaEnviada` |

El mapeo Zod «primer issue → string único» de Agenda·`confirmar` y Seguimiento·`registrar` es OTRO patrón (no per-campo): se queda en el step tal cual, no se forzó al helper.

**Decisiones / líneas de límite.**
- **Orden interno del bloque de éxito.** El hook fija `onSuccess → toast → refresh`. En el original, Evaluación seteaba estado antes del toast y Brief/Seguimiento al revés — todo dentro del mismo bloque síncrono post-`await` (batching de React + toast imperativo), sin diferencia observable. Anotado por transparencia, no es un cambio de comportamiento.
- **El barrido encontró el mismo ciclo FUERA del scope listado** (~10 componentes: `ficha-step`, `opener-step`, `draft-step`, `self-check-step`, `escalar-modal`, `checklist-construccion`, `nuevo-prospecto-form`, `importar-prospectos-form`, `foco-surface`, `lead-card-actions`, `novedades-marcar-visto`). NO se tocaron (regla 2: solo los listados): quedan como candidatos de adopción incremental para cuando cada uno se pise por otra razón.
- **Cero cambios de copy/motor**: los strings de todos los toasts se movieron carácter por carácter; `dossier.ts`, actions y schemas sin tocar.

**Verde (chequeado, no asumido) — idéntico a la línea base del cierre de 2.3.**
- ✅ `npx tsc --noEmit` → **0 errores**.
- ✅ `npm run test:leados` → **22/22** (== línea base 22/22).
- ✅ `npm run build` + `npm run test:setter` → **39/39** (== línea base 39/39) — el recorrido browser contra prod-QA:3001 ejercita los mismos submits migrados (evaluación, brief, seguimiento, claim del envío-demo).
- ✅ `npx prisma migrate status` → «Database schema is up to date».
- ✅ Diff neto en steps: **68+/129−** (5 archivos) + el hook nuevo (~90 líneas con doc). Sin push (regla 4).

**Desvío de forma (Fase 0).** Los «commits de 2.1, 2.2 y 2.3» no existen como tres commits: el Bloque 2 completo aterrizó en UNO (`6dd4946`, A-14/A-24/A-09 — el título lista los tres entregables). Se verificó el contenido en los archivos (guardia A-24 presente en Evaluación, etc.) y se consideró cumplido el gate.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 3.1: cerró verde. Call-sites migrados: 9 de 9 censados (7 transiciones + 2 sitios de mapeo Zod per-campo); variaciones preservadas: búsqueda de horarios sin toast/refresh, reset condicional de slots en el error de confirmar, modal de descarte de Evaluación, post-éxitos propios de Brief/Seguimiento.
Comportamiento cambiado: ninguno — suites idénticas (22/22 y 39/39, iguales a la línea base de 2.3). Desvíos: solo de forma — el gate de Fase 0 pedía los commits 2.1/2.2/2.3 y el Bloque 2 está en un único commit (6dd4946); verificado por contenido. Pendiente: nada; queda anotado el mismo ciclo en ~10 componentes fuera del scope listado como adopción incremental futura.

## Sprint 4.1 — Esqueleto del manual paso-por-pantalla en ruta paralela (BLOQUE 4 · mapa v1) · 2026-07-03

**Qué se hizo.** La infraestructura del manual del mapa v1 (16 pantallas + 2 estados + 1 reentrada), en ruta PARALELA al wizard — `/setter/leads/[leadId]/manual/[paso]` — sin tocar ni importar nada del wizard viejo (convive hasta el corte del Bloque 5). Todo server components; 9 archivos nuevos, cero modificados:

- `src/lib/leados/manual.ts` — el registro de pantallas (ids `m1…m16` + `mr` + `espera`/`revision`, títulos-instrucción del mapa, fases con indicador "paso N de M" POR FASE; m7–m12 toman título/bajada de `SHELL_CONSTRUCCION`, única copia editable) y `derivarPantalla(input) → { actual, completadas[], habilitadas[] }`: la derivación de posición a granularidad de pantalla, pura, SIN persistir posición — se re-deriva en cada request de stage + datos capturados + checklist, con los MISMOS gates del motor (`gateBriefAbierto`, `gateEnvioDemo`, `cadenciaInfo`, `fichaTieneSenal`, `reunionAgendada`). Exhaustiva por stage (un stage nuevo rompe el build). Invariante interna: la `actual` siempre es accesible (sin loops de redirect).
- `manual/_data.ts` — carga owned con los MISMOS caminos que el wizard (`getOwnedLead` → 404 sin leakear, `getOwnedDossier`, `listOwnedLeadActivities`, `countFollowUps`); reloj request-time para `followUpVencido`. Solo lectura: el manual no escribe ni transiciona nada.
- `manual/page.tsx` — entrada sin pantalla: re-deriva y `redirect()` a la actual. `manual/[paso]/page.tsx` — la GUARDIA como servidor, no CSS: id desconocido → actual; pantalla ni habilitada ni completada (el futuro) → `redirect()` a la actual, sin renderizarse ni como fachada; completadas navegables sin resetear nada.
- `_components/pantalla-manual.tsx` — el layout-tipo con slots: instrucción (una línea, protagonista; marco cyan solo si es el paso de ahora — disciplina B9), zona de contexto re-servido, zona de munición (bloque copiable / link externo), zona de registro, avance ("Ir a tu paso actual" cuando no estás parado en él) y navegación atrás. Los slots vacíos muestran placeholder honesto (la pantalla real los llena al migrar) — nunca zonas en blanco.
- `_components/manual-nav.tsx` — cabecera común + chips de completadas (atrás siempre libre) + el rail de las 6 fases de Construcción con navegación LIBRE entre todas (auto-reporte, jamás gates — §6-3).
- `_components/estado-manual.tsx` — las dos pantallas de estado (espera con "próximo toque el X" desde `nextFollowUpAt`; revisión), tono zinc sin checklist ni indicador; desde espera se puede saltar a m5 si algo pasa antes.
- Reentrada M-R: aterrizaje en `mr` con la nota de Franco al frente (Callout danger con motivo/dónde/arreglo desde `ultimoRechazo`); checklist y borrador preservados (motor `RELOOP_RESET`), chequeo final reseteado → m14 vuelve a ser futuro.
- `manual/loading.tsx` + `manual/error.tsx` — estados completos del shell (skeleton que espeja el layout-tipo; boundary con logger+Sentry `setter-manual` y salida al lead).

**Supuestos del mapa (Fase 1 — mapa vs repo).** Confirmados; ninguna diferencia estructural. Ajustes MENORES adoptados del motor: (a) la derivación previa se llama `pasoActual` (dossier-stepper), no `derivarPasoDelLead` — `derivarPantalla` nació en lib espejando su mapeo stage→paso, sin importar el wizard; (b) el gate de M3 exige score+veredicto+razonamiento (el mapa decía score+razonamiento); (c) APROBADA-sin-condición-de-envío (falta respuesta o `finalUrl`) no está explícita en el mapa — re-usa el estado ESPERA con m5 alcanzable (mismo tono "falta condición externa"); (d) la evaluación ocurre con stage=FICHA (registrar el veredicto ES la transición): m2/m3 se habilitan con la señal de la ficha, y m3 queda alcanzable desde m2 (tarea externa con vuelta; no hay dato que persista "fui al Evaluador" — la posición no se guarda). DESCARTADA (terminal de archivo, sin pantalla en el mapa) deriva a m3 completada.

**Decisiones / líneas de límite.**
- **El motor no se tocó y el wizard no se tocó** — cero diffs en tracked files; el manual ni importa de `[leadId]/_components/`. La dependencia es SOLO `flow.ts`/`contracts.ts`/`flow-content.ts` (lib estable committeada) + los reads owned.
- **Navegación libre de Construcción es real**: m7–m12 SIEMPRE habilitadas en BRIEF/CONSTRUCCION/RECHAZADA, en cualquier orden. Los que sí condicionan: m13 recién en CONSTRUCCION (el motor solo acepta draft ahí) y m14 solo con draft publicado — gates del motor, no del checklist.
- **`habilitadas` y `completadas` pueden solaparse** (m5 es por-toque, repetible en APROBADA post-envío) — documentado en el tipo.
- **Sin push** (regla 6).

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores**. ✅ eslint sobre los 9 archivos nuevos → **0 problemas** (el `npm run lint` global arrastra ~101 errores pre-existentes de lanes ajenos — intactos, no son de este sprint).
- ✅ `npm run check:invariants` → **15/15 OK** (incluido `reloop-selfcheck`, que confirma lo que la derivación asume del re-loop).
- ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde, con `/setter/leads/[leadId]/manual` y `/manual/[paso]` en el árbol (ƒ dynamic). ✅ `npx prisma migrate status` → al día (77). ✅ `npm run test:setter` → **39/39** (== línea base) — el wizard viejo intacto también en runtime.
- ✅ **Matriz de guardias en vivo: 28/28 PASS** (prod-QA :3001, sesión real setter-qa vía `/api/qa/login`, SSR por curl con cookie cruda, sobre los 13 leads QA-W del seed V-1): la entrada `/manual` re-deriva bien en los 11 estados (m1/m2/m4/m6/revision/m15/espera/mr/m3); el futuro redirige server-side (m14 en FICHA→m1 · m6 con gate cerrado→m4 · m13 en BRIEF→m7 · m15 en EN_REVISION→revision · m14 en RECHAZADA→mr por el reset); atrás libre (m1 completada navegable en EVALUADA); navegación libre real entre fases (m9/m12 en BRIEF, m8 en re-loop); m14 habilitada con draft; estados renderizan con su tono; M-R con la nota de Franco al frente; id basura → actual; lead ajeno/inexistente → 404 por contenido (sin leakear).
- ⚠️ `npm run test:e2e` (batería global, EXTRA a las dos suites del cierre): **21 passed / 7 skipped**, con fallas SOLO en lanes ajenos al setter (specs 11-client-login/12-client-chatbot/13-client-perf/15-personalization/16-admin-bulk/20-idor-mobile/21-performance/22-visual-regression/30-onboarding) — los mismos que ya estaban rojos en la línea base pre-existente de esa suite, corridos además bajo doble carga de CPU (el lane A-29 compilando en paralelo, 14.9m vs ~6m normales). Cero specs de setter en la lista de fallas; la batería del wizard es `test:setter` (39/39 arriba). La e2e global necesita su propia pasada de mantenimiento — fuera de scope (lanes dashboard/cliente).

**Colisión de lane detectada al cierre (para coordinación).** Durante la verificación final de ESTE sprint apareció trabajo en vivo de OTRA sesión sobre el mismo árbol (mtimes 04:08–04:11): `src/lib/leados/paso.ts` (A-29 — unifica `pasoActual`/`describirFoco`/`anchorActivo` en `derivarPasoDelLead`), `guia-retrabajo.tsx`, `prompts-disenio.tsx` y otros, más 4 archivos del wizard modificados sin commitear. Es exactamente la "3.2" que la Fase 0 de este sprint no encontró en el log (por eso `derivarPantalla` se construyó autosuficiente sobre `flow.ts`, espejando el mapeo de `pasoActual` — divergencia menor ya anotada). Cero solapamiento de archivos entre ambos lanes; el commit de 4.1 es quirúrgico (solo sus 9 archivos + bitácora + last-runs). **Follow-up de una costura**: cuando A-29 commitee, re-basar el switch por stage de `posicionDe` (manual.ts) sobre `derivarPasoDelLead` para que la fuente del "paso del lead" vuelva a ser una sola.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 4.1: cerró verde. Supuestos del mapa: confirmados sin diferencias estructurales; ajustes menores: (a) la derivación se llama `pasoActual`, no `derivarPasoDelLead` — `derivarPantalla` nació en lib sin importar el wizard; (b) gate de M3 = score+veredicto+razonamiento; (c) APROBADA-sin-condición-de-envío re-usa el estado ESPERA; (d) evaluación ocurre con stage=FICHA y m3 queda alcanzable desde m2 (externa con vuelta).
Ruta paralela: navegable, guardias probadas en vivo 28/28 (redirect server-side del futuro, atrás libre, navegación libre m7–m12, estados, M-R con nota al frente, 404 de ownership). Desvíos: colisión de lane al cierre — A-29 (`derivarPasoDelLead`) aterrizó EN PARALELO sin commitear mientras 4.1 verificaba; sin solapamiento de archivos; queda el follow-up de una costura (re-basar `posicionDe` sobre `derivarPasoDelLead` cuando A-29 commitee). Pendiente: nada del esqueleto; la e2e global (lanes dashboard/cliente) sigue roja pre-existente, fuera de scope.

---

## Sprint 3.2 — Auxiliares de los steps extraídos + derivación única del paso (BLOQUE 3 de remediación post-auditoría · A-26, A-29) · 2026-07-03

**A-26 — 5 auxiliares a archivos hermanos (+1 forzado por dependencia).** Los 5 componentes auxiliares inline de `construccion-step.tsx` (383→210 líneas) salieron a archivos hermanos en `_components/` del lead, movidos carácter por carácter: `badge-provisorio.tsx` · `urgencia-banner.tsx` · `guia-retrabajo.tsx` (candidato directo a la pantalla M-R del mapa v1) · `materiales-negocio.tsx` · `prompts-disenio.tsx`. Ninguno dependía de estado/closure local del step — todos ya recibían props o nada. Excepción anotada (Fase 1): `useHidratado` es un hook local compartido por `UrgenciaBanner` Y el body del step; extraer el banner sin extraer el hook creaba un import circular → salió como 6º archivo `use-hidratado.ts` (mismo patrón que `use-step-action.ts` del 3.1).

**A-29 — comparación celda por celda ANTES de unificar; después, una sola derivación.** `pasoActual` × `describirFoco` × `anchorActivo` comparadas por stage (y por gate/opener donde aplican): **sin discrepancias reales**. El único caso asimétrico —EVALUADA + opener pendiente, donde banner y anchor dirigen al opener mientras el rail marca «Brief»— NO es divergencia: el rail de 5 pasos no tiene un paso Opener en su codominio, y ambos consumidores conservan hoy (y conservan tras unificar) exactamente su salida. Con eso, las tres derivaciones se movieron VERBATIM a `src/lib/leados/paso.ts` (hermano de `flow.ts`, módulo de dominio de experiencia) como funciones privadas; el único export de lógica es `derivarPasoDelLead(stage, gateAbierto, openerPendiente)` → `{ indice, foco, anchor }`. `lead-wizard` la llama UNA vez y reparte las tres caras: `indice` → `DossierStepper` (ahora recibe `actual` por prop, ya no deriva) · `foco` → `PasoActualBanner` (ahora presentación pura, recibe el descriptor) + el tono del marco del step activo · `anchor` → `StepAnchor`. Los tipos `FocoTono`/`FocoDescriptor`/`StepAnchorId` viven en `paso.ts` y se re-consumen desde ahí.

**Verde (chequeado, no asumido) — idéntico a la línea base del 3.1.**
- ✅ `npx tsc --noEmit` → **0 errores** (corrido después de TODOS los edits).
- ✅ `npm run test:leados` → **22/22** (== línea base).
- ✅ `npm run build` + `npm run test:setter` → **39/39** (== línea base) — el recorrido browser contra prod-QA:3001 ejercita rail + cartel + aterrizaje + construcción re-derivados desde `derivarPasoDelLead`.
- ✅ `npm run check:invariants` → **15/15 OK**.
- ✅ `npx prisma migrate status` → «Database schema is up to date» (77).
- Diff del commit `2d8a3bc`: **11 archivos, 473+/414−** (los +473 son los 7 archivos nuevos con su doc; el neto en los 4 tocados es −377). Sin push (regla 4).

**Concurrencia con el lane 4.1 (desvío operativo, resuelto limpio).** Este sprint corrió EN PARALELO con la sesión del Bloque 4.1 (`manual/`). Fase 0 encontró git no-limpio por archivos de ESE lane (disjuntos — no se tocaron ni se comitearon). El `npm run build` + `test:setter` se difirieron hasta que el `next start` de esa sesión (:3000, arrancado 4:11) terminó solo, para no pisarle `.next` en caliente (waiter sobre las conexiones del puerto). Su commit (`8781724`) aterrizó primero; el de 3.2 (`2d8a3bc`) se hizo por pathspec literal para no arrastrar su índice — historia linear, cero entrelazado. Esta entrada viaja en un commit docs aparte porque la bitácora ya viajó en el commit de 4.1. **Queda viva la costura que 4.1 anotó**: re-basar el switch por stage de `posicionDe` (`manual.ts`) sobre `derivarPasoDelLead` — ahora posible porque A-29 ya está commiteado; es scope del lane 4.x, no de este sprint.

**CIERRE DEL BLOQUE 3.** 3.1 (`useStepAction` — el ciclo submit) + 3.2 (auxiliares + `derivarPasoDelLead` — las piezas y la posición): el corte del wizard del Bloque 4/5 queda abaratado — submit, auxiliares y derivación del paso son piezas únicas reutilizables por pantalla.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 3.2 / BLOQUE 3: cerró verde. Auxiliares extraídos: 5 (+1: el hook compartido `use-hidratado.ts`, forzado por dependencia — anotado). Derivación: unificada en `derivarPasoDelLead` (`src/lib/leados/paso.ts`) alimentando stepper, anchor y banner desde una sola llamada del shell; comparación celda-por-celda sin discrepancias (el caso EVALUADA+opener es asimetría de granularidad del rail, no divergencia — cada consumidor conserva su salida exacta).
Comportamiento cambiado: ninguno — suites idénticas a la línea base (22/22 leados, 39/39 setter) + 15/15 invariantes + tsc 0 errores. Desvíos: operativos por el lane 4.1 en paralelo — Fase 0 con git no-limpio por archivos ajenos disjuntos (no tocados), build/test:setter diferidos hasta que su server :3000 terminó, commit por pathspec literal, bitácora en commit docs aparte (la de 4.1 viajó en SU commit). Pendiente: nada de este sprint; queda la costura anotada por 4.1 (re-basar `posicionDe` de `manual.ts` sobre `derivarPasoDelLead`), scope del lane 4.x.

---

## Sprint 4.2 — Pantalla M1 Ficha: piloto del patrón del manual (BLOQUE 4 · mapa v1) · 2026-07-03

**Qué se hizo.** La PRIMERA pantalla real del manual — M1 «Cargá los datos del negocio» — montada sobre el layout-tipo del 4.1, re-empaquetando la lógica existente del `ficha-step` SIN lógica de negocio nueva. Commit `a8e7747`: 2 archivos nuevos + 3 tocados (neto −186 en los tocados).

- `_components/ficha-form.tsx` (nuevo) — el CUERPO de registro de la ficha extraído VERBATIM de `FichaStep`: estado del form, nudges de calidad (`campoFichaFlojo`), gate visible con faltantes (`fichaFaltantes`, mismos mensajes), guardar + autosave (`useAutosave` sobre `guardarFicha` — parcial-safe, jamás transiciona stage, ownership adentro) + guardia de salida (`useUnsavedGuard`). Un solo camino de escritura para las dos presentaciones.
- `_components/ficha-step.tsx` — queda como CHROME del wizard (Card + encabezado + `FichaEjemplo` + `CopyBlock` al completar) alrededor de `<FichaForm>`; la rama congelada (details solo-lectura) intacta. Comportamiento idéntico — suites como testigo.
- `manual/_data.ts` — suma lo que M1 re-sirve: `leadCopy` (identidad + links, mismo shape del wizard), `ficha` y `fichaEditable` (MISMA regla del wizard: editable hasta que la evaluación quede registrada).
- `manual/_components/m1-ficha.tsx` (nuevo) — llena los TRES slots del layout-tipo: contexto (rubro·zona + links del alta, con vacío honesto si el alta no trajo links), munición (`FichaEjemplo`, la misma pieza), registro (`FichaForm` vivo, o la vista congelada existente de `FichaStep` post-evaluación).
- `manual/[paso]/page.tsx` — despacho de slots por `pantalla.id`; la guardia, el indicador «Ficha — paso 1 de 1», el avance («Ir a tu paso actual» apenas la derivación mueve la actual) y el atrás libre ya los pone el esqueleto — cero código nuevo de navegación.

**El patrón (para repetir en cada tramo del Bloque 5).**
1. Extraer de `<x>-step.tsx` el cuerpo de registro (estado + hooks + action + gate, verbatim) a `_components/<x>-form.tsx`; el step del wizard queda como chrome alrededor — comportamiento idéntico, suites como testigo.
2. Sumar a `manual/_data.ts` SOLO los datos que la pantalla re-sirve, espejando las reglas del wizard (ej. `fichaEditable`), nunca inventando reglas nuevas.
3. Crear `manual/_components/m<N>-<tarea>.tsx` que llena los tres slots: contexto re-servido / munición / registro (el form compartido; el estado congelado reusa la vista solo-lectura que ya exista).
4. Despachar los slots por `pantalla.id` en `manual/[paso]/page.tsx` — guardia, indicador, avance y atrás ya vienen del layout-tipo + `derivarPantalla`; si la pantalla pide navegación propia, sospechar.
5. Verificar las DOS presentaciones (wizard intacto + pantalla nueva) y el recorrido completo: entrar → completar → gate → avanzar → atrás sin reset.

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → **0 errores**. ✅ `npm run check:invariants` → **15/15 OK**. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde. ✅ `npm run test:setter` → **39/39** (== línea base) — el wizard viejo intacto también en runtime. ✅ `npx prisma migrate status` → al día (77).
- ✅ **Recorrido browser de M1 completo** (dev:qa :3002, sesión real setter-qa vía `/api/qa/login`, sobre los leads QA-W del seed V-1, restaurado al cierre): lead nuevo («QA-W Ficha Incompleta») aterriza en m1 con «Tu paso ahora» + gate ámbar con los 2 faltantes existentes → completar en vivo flipea el gate a «✓ Señal mínima lista» sin recargar → «Guardar ficha» avanza la derivación (badge «Completada», sección Avance → m2 «Evaluación — paso 1 de 2») → atrás por el chip de Completadas re-sirve el form con TODO lo guardado, editable, sin reset → pedir m6 (futuro) redirige server-side a la actual (m2) → la variante congelada (lead post-evaluación) muestra el details solo-lectura sin form. Wizard viejo verificado con la misma data: chrome completo (Paso 1 — Ficha de observación, ejemplo, copy block) y los mismos valores. Capturas desktop (1600) + mobile (480) limpias.
- Nota QA-infra (no del sprint): en dev:qa el browser de preview debe navegar por `localhost` — con `127.0.0.1`, Next 16 dev bloquea sus dev-resources cross-origin y la página queda SIN hidratar (forms muertos sin error de consola). Documentado en memoria; `allowedDevOrigins` no se tocó (fuera de scope).

**CIERRE DEL BLOQUE 4.** 4.1 (esqueleto: registro de pantallas + `derivarPantalla` + layout-tipo + guardias) + 4·A/B/C (prompts de diseño + puente self-check→prompt + deep-links) + 4.2 (M1, piloto del patrón): el manual tiene infraestructura, munición y su primera pantalla real. Los tramos del Bloque 5 repiten el patrón de arriba pantalla por pantalla hasta el corte. **Costura viva** (anotada desde 4.1, fuera del scope de M1): re-basar el switch por stage de `posicionDe` (`manual.ts`) sobre `derivarPasoDelLead` (`paso.ts`, ya commiteado por A-29) — candidato natural al primer tramo del Bloque 5.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 4.2 / BLOQUE 4: cerró verde. M1: operativa en `/setter/leads/[leadId]/manual/m1` con el patrón completo (instrucción de una línea, contexto/munición/registro, gate con faltantes existentes, autosave+guardia, indicador por fase, avance y atrás derivados).
Patrón para el Bloque 5: confirmado — extraer cuerpo de registro a `<x>-form.tsx` compartido + chrome del wizard intacto + módulo `m<N>-*.tsx` de slots + despacho por id (5 pasos documentados en la bitácora). Desvíos: ninguno de código; nota QA-infra (dev:qa se navega por `localhost`, no `127.0.0.1` — hidratación) documentada en memoria. Pendiente: la costura `posicionDe`→`derivarPasoDelLead` (viva desde 4.1, fuera del scope M1) — primer candidato del Bloque 5.

---

## Sprint 5.0 — Costura de derivaciones + salud del árbol post-lanes (pre-arranque BLOQUE 5) · 2026-07-03

**Qué se hizo.** Cierra la costura anotada tres veces (4.1 → 3.2 → 4.2): `posicionDe` (`manual.ts`) re-derivaba a mano, con su propio switch, exactamente lo que `derivarPasoDelLead` (`paso.ts`, A-29) ya resuelve para EVALUADA — abierto / espera / opener pendiente. Ahora `posicionDe` computa `gateAbierto`/`openerPendiente` UNA vez al tope de la función, llama a `derivarPasoDelLead(stage, gateAbierto, openerPendiente)`, y la rama EVALUADA lee `paso.anchor === 'opener'` / `paso.foco.tono === 'foco'` en vez de re-invocar `gateBriefAbierto(...)` y el proxy `contactos === 0` para `openerPendiente`. Commit `2e75007`, 1 archivo, +24/−11.

**Lo que NO se tocó, a propósito.** La rama APROBADA sigue llamando a `gateEnvioDemo` directo: exige `finalUrl` (la URL que el admin registra AL APROBAR, en la MISMA transición — ver `aprobarRevision` en `revision.actions.ts`), un factor que `derivarPasoDelLead`/`gateAbierto` no reciben. En todo estado alcanzable ambos coinciden (finalUrl siempre viaja junto con APROBADA), pero leer el `gateAbierto` genérico ahí habría cambiado el comportamiento en el borde teórico finalUrl=null — no era la duplicación que A-29 eliminó (acá no se re-deriva el mismo hecho: se deriva uno DISTINTO que el wizard no necesita). Las demás ramas (FICHA/null, DESCARTADA, BRIEF/CONSTRUCCION, RECHAZADA, EN_REVISION) no llamaban a ningún gate compartido — son navegación de pantallas (progreso/draft/checklist) sin equivalente en el rail de 5 pasos del wizard; nada que re-basar ahí.

**Diff de comportamiento nulo, probado exhaustivamente (no asumido).** Oráculo temporal (`_costura-oracle.ts` + snapshot `manual.OLD.ts` de HEAD, ambos vía ts-node, borrados al cerrar la fase — no viajan en el commit): corrió `derivarPantalla` VIEJA vs NUEVA sobre **331.776 combinaciones** ({9 stages × 8 status} × caliente × contactos × followUpVencido × followUpCount × draftUrl × demoEnviada × finalUrl × agenda × progreso × ficha) — **0 mismatches**.

**Fase 1 — Salud del árbol post-lanes.**
- ✅ Fase 0: git limpio, `npx tsc --noEmit` → 0 errores, commits de 3.2 (`2d8a3bc`/`af561ec`) / 4.1 (`8781724`) / 4.2 (`a8e7747`/`ff08411`) presentes en el log.
- ✅ `npm run check:invariants` → 15/15 OK.
- ✅ `npm run test:leados` → 22/22 (== línea base).
- ✅ `npm run build` + `npm run test:setter` → 39/39 (== línea base).
- ⚠️ `npm run test:e2e` (batería global, re-verificada de punta a punta): **21 passed / 27 failed / 7 skipped** (14.9m). Las 27 fallas están TODAS en `tests/e2e` (lanes dashboard/cliente/admin) — ninguna toca `/setter` ni `/manual`. Patrón dominante: timeout de `submitLogin`/`waitForURL` en `tests/helpers/auth.ts:12` (login de cliente/admin no completa en 45s), que arrastra en cascada a client-login, chatbot-section, perf, personalization, bulk-actions, idor-optout, mobile-responsive, performance, visual-regression (7 specs) y el onboarding E2E completo. Es la MISMA roja pre-existente que 4.1 y 4.2 ya habían registrado (mismos specs: 11/12/13/14/15/16/20/21/22/30) — no la introdujo este sprint, no es de la superficie setter/manual. Por regla 2 del sprint: se reporta, no se toca.

**Fase 2 — Costura.** Ver "Qué se hizo" arriba. No se re-corrió a mano la matriz de 28 vivo del 4.1: nada de lo que esas 28 comprobaciones ejercitan cambió (el oráculo de 331.776 combos las cubre con margen) y `test:setter` 39/39 ejercita en runtime real el mismo camino EVALUADA→brief/opener/espera contra prod-QA.

**Fase 3 — Verificación.** tsc 0 errores + invariantes 15/15 + test:leados 22/22 + test:setter 39/39, todos re-corridos DESPUÉS del edit — idénticos a la línea base.

**Fase 4 — Commit.** `2e75007` — `refactor(manual): posicionDe deriva de derivarPasoDelLead — una sola fuente del paso`. Diff-stat: 1 archivo, +24/−11. Sin push (regla 3).

**CIERRE DE LA COSTURA.** La anotada tres veces (4.1 → 3.2 → 4.2) queda resuelta: `pasoActual`/`describirFoco`/`anchorActivo` (A-29, unificadas en `derivarPasoDelLead`) y la porción de `posicionDe` que las duplicaba (EVALUADA) ahora comparten una sola fuente. Lo que queda deliberadamente aparte (APROBADA vía `gateEnvioDemo`, y la navegación fina de FICHA/BRIEF-CONSTRUCCION/RECHAZADA) no es duplicación — es información que el mapa de 16 pantallas necesita y que el rail de 5 pasos no.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.0: cerró verde. Derivación única: sí — `posicionDe` (rama EVALUADA) ahora lee `derivarPasoDelLead` en vez de re-derivar `gateBriefAbierto`/`openerPendiente`; probado sin diffs sobre 331.776 combinaciones (oráculo temporal, no committeado). E2e roja: existía y sigue existiendo — es 100% de lanes ajenos (dashboard/cliente/admin, specs 11/12/13/14/15/16/20/21/22/30, timeout de login en `tests/helpers/auth.ts`), la misma que 4.1/4.2 ya habían registrado; no es del setter/manual, no se tocó.
Desvíos: ninguno de código — la rama APROBADA (`gateEnvioDemo`, exige `finalUrl`) se dejó a propósito sin re-basar porque deriva un factor que `derivarPasoDelLead` no recibe (re-basarla habría sido un cambio de comportamiento real en el borde finalUrl=null). Pendiente: nada del Bloque 5; el árbol del setter queda con una sola fuente del paso, listo para que el Bloque 5 arranque sobre verde propio (la e2e global es tarea de otro lane).

---

## Sprint 5.1 — Tramo Evaluación: pantallas M2 y M3 (BLOQUE 5) · 2026-07-03

**Qué se hizo.** El segundo tramo del manual — M2 «Llevá la ficha al Evaluador» y M3 «Registrá el veredicto» — repitiendo el patrón del 4.2 sobre el paso de evaluación del wizard. Commit `8fa48f6`: 3 archivos nuevos + 3 tocados (+582/−261; el step del wizard adelgaza ~260 líneas al quedar como chrome).

- `_components/evaluacion-form.tsx` (nuevo) — el CUERPO del registro extraído VERBATIM de `EvaluacionStep`: estado del form, gate triple score+veredicto+razonamiento (`EvaluacionInputSchema`, mismos mensajes), descarte encadenado por score 1–2 (modal + motivo), guardia de salida (`useUnsavedGuard`; **A-24 preservado: la evaluación NUNCA tuvo autosave a propósito** — formulario de una sola pasada, no se le agregó) y la nota de score 3 con gate cerrado. Misma action (`registrarEvaluacion`) — motor intacto. Incluye `EvaluacionResumen` (la vista registrada, extraída entera para que el wizard quede pixel-idéntico). Los TEXTOS del veredicto son parámetro de presentación con default = wizard: los VALORES (`VEREDICTO_VALUES`) no cambian jamás.
- `_components/evaluacion-step.tsx` — queda como CHROME del wizard (Card + intro + `ToolGuide` + criterios + `TeachPanel` alrededor de `<EvaluacionForm>`; resumen y candado con faltantes como ramas propias). Labels históricos intactos («Caliente» incluido) — suites como testigo.
- `manual/_data.ts` — suma lo que el tramo re-sirve espejando al wizard: `evaluacion` (`parseEvaluacion`, mismo contrato), `leadStatus` y `caliente` (los datos de la nota de score 3).
- `manual/_components/m2-evaluador.tsx` (nuevo) — tarea EXTERNA con vuelta, tres slots: contexto = la ficha re-servida como bloque copiable (`buildFichaCopyBlock` + `CopyBlock`, instrucción propia de una línea porque la de `GUIA_FICHA.copyBlock` dice «al paso 2» — numeración del wizard); munición = `ToolGuide('evaluador')` (link de `herramientas.ts`); registro = el registro de VUELTA (link a m3 — sin estado ni gates: m3 ya viene habilitada por `derivarPantalla`, que contempla la externa-con-vuelta sin flag persistido). Con veredicto registrado, el registro pasa a modo consulta.
- `manual/_components/m3-veredicto.tsx` (nuevo) — contexto = **la ficha ABIERTA a la vista mientras se transcribe (cierra A-22 en el manual** — en el wizard sigue colapsada); munición = `ToolGuide('evaluador')` (volver a la herramienta si la respuesta quedó en otra pestaña); registro = `EvaluacionForm` compartido con **labels de prioridad post-2.1/admin-1b: `CALIENTE` → «Avanzar con prioridad»** (cero «caliente» en el veredicto — esa palabra queda para el campo operativo de Franco) + hints propios (el del wizard dice «4–5 marca el lead como caliente», que post admin-1b es falso: solo notifica a Franco). Registrado → `EvaluacionResumen` con título «Veredicto registrado».
- `manual/[paso]/page.tsx` — despacho de slots para m2/m3 por `pantalla.id`; guardia, indicador («Evaluación — paso 1/2 de 2»), avance y atrás siguen siendo del esqueleto — cero navegación nueva (la vuelta de M2 es un link a una pantalla YA habilitada).

**Verde (chequeado, no asumido).**
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa OK. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde. ✅ `npm run test:setter` → **39/39** (== línea base; el 01-flow registra la evaluación VÍA WIZARD con los labels viejos — las dos presentaciones probadas en runtime). ✅ `npx prisma migrate status` → al día (80).
- ✅ **Recorrido browser completo** (dev:qa :3002 por `localhost`, sesión setter-qa vía `/api/qa/login`, leads QA-W del seed V-1, restaurado al cierre): «QA-W Ficha Completa» → la entrada del manual deriva a **m2** («Tu paso ahora», Evaluación — paso 1 de 2) → «Copiar bloque» flipea a «Copiado» (página hidratada verificada por `__reactProps$`) → ToolGuide Evaluador con «Link pendiente» (TODO de Franco ya conocido, no del sprint) → vuelta a **m3** por el link del registro → gate triple EN VIVO (submit vacío = los 3 errores del schema) → select con «Descartar / Avanzar / **Avanzar con prioridad**» → registrar (score 3 + Avanzar) → toast «El brief arranca cuando el negocio responda» y la MISMA pantalla flipea sin recarga a «Completada» + resumen «Veredicto registrado» → Avance apunta a m4 y la entrada del manual redirige a m4 (**avance 100% derivado**) → m2 queda en consulta («El veredicto ya quedó registrado») con chips Ficha · Al Evaluador · Veredicto — atrás libre sin resets. «QA-W Descartada»: entra directo a m3 con badge «Descartar» + box «Lead descartado» + motivo. **Wizard viejo verificado en paralelo sobre el MISMO lead**: rail de 4 pasos, criterios, y el select con «Descartar / Avanzar / Caliente» (labels históricos). Capturas desktop (1600) + mobile (480) de M2 y M3 limpias, sin desbordes.
- Nota de alcance: los bloques de enseñanza del wizard (criterios «Qué mira el Evaluador» + `TeachPanel`) quedaron como chrome SOLO del wizard — el manual mantiene pantallas magras (una tarea, una instrucción); si Franco los quiere en el manual, es un slot más, no una re-extracción.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.1: cerró verde. M2: ok — bloque copiable + link del Evaluador + registro de vuelta (link a m3, sin flag persistido: la derivación ya contemplaba la externa-con-vuelta y no se tocó). M3: ok — gate triple vivo, ficha a la vista (A-22 cerrado en el manual), labels de prioridad («Avanzar con prioridad», cero «caliente» en el veredicto), resumen registrado y descarte encadenado visibles. Patrón: sostuvo — misma receta del 4.2 sin fricción; la única pieza nueva que pidió fue parametrizar los TEXTOS del veredicto en el form compartido (default = wizard) porque las dos presentaciones divergen en lenguaje, no en motor.
Desvíos: ninguno de código. Notas: (1) el hint del wizard «4–5 marca el lead como caliente» (`GUIA_EVALUACION.campos.score.hint`) quedó desactualizado post admin-1b — el wizard lo sigue mostrando; corregirlo es un cambio de copy del wizard, fuera de este scope; (2) `package-lock.json` estaba sucio al arrancar (+23 líneas de deps opcionales wasm de un `npm install` ajeno) y quedó FUERA del commit, igual que los `.last-run.json` de Playwright. Pendiente: el resto del Bloque 5 pantalla por pantalla (m4 opener es el próximo tramo natural); el link real del Evaluador en `herramientas.ts` sigue TODO de Franco.

---

## Sprint 5.2 — Tramo Opener: pantalla M4 + estado de espera (BLOQUE 5) · 2026-07-03

**Qué se hizo.** El tercer tramo del manual — M4 «Mandá el opener» — repitiendo el patrón 4.2/5.1 sobre el paso del opener del wizard, y la PRESENTACIÓN del estado de espera al que el motor manda el lead tras registrar el envío. Commit `5654716`: 2 archivos nuevos + 3 tocados (+267/−116; `opener-step.tsx` adelgaza al quedar como chrome).

- `_components/opener-form.tsx` (nuevo) — el CUERPO del registro extraído VERBATIM de `OpenerStep`: estado del mensaje, el hard-block de link EN VIVO (`contieneLink`, `GUIA_OPENER.gate`, **A-25: el link deshabilita el botón Y muestra el motivo**), el `CopyBlock` «listo para pegar» con la instrucción de envío por DM, el `GuardrailRol` y el botón que llama a `registrarOpener`. Misma action, mismo `OpenerInputSchema` — **motor y schema server-side intocados** (el hard-block ya vivía en el schema: la UI lo hace imposible y el server lo rebota igual). Incluye `OpenerResumen` (el «Enviado»), extraído entero para reusarlo en las dos presentaciones.
- `_components/opener-step.tsx` — queda como CHROME del wizard (intro `GUIA_OPENER`, `TeachPanel`, `CanalSeguridad`, `ToolGuide`, el bloque del Gem) alrededor de `<OpenerForm>`; el branch `contactos > 0` ahora renderiza `<OpenerResumen>`. **La firma del componente NO cambió → `lead-wizard.tsx` intacto** (cero cambios en el wizard salvo la extracción interna). Las guardias (stage apagado, `leadRespondio`) quedan como estaban.
- `manual/_data.ts` — suma lo que M4 re-sirve: `openerEnviado` (proxy `contactos > 0`, mismo que usa el wizard) y `ultimoContacto` (`actividades[0].createdAt`, misma fuente que la página del wizard). `proximoToque` y `evaluacion` ya estaban.
- `manual/_components/m4-opener.tsx` (nuevo) — los tres slots: contexto = el bloque del Gem de outreach re-servido (`buildOpenerInputBlock`, mismo builder del wizard) con instrucción propia; munición = `ToolGuide('gemOutreach')`; registro = `<OpenerForm>` (vivo) o `<OpenerResumen>` (congelado al volver desde la espera).
- `manual/[paso]/page.tsx` — despacho de slots para m4 por `pantalla.id`.
- **Estado de espera (Fase 2): CERO código nuevo.** El esqueleto (4.1) ya lo tenía todo — `derivarPantalla` (rama EVALUADA de `posicionDe`) manda opener-ya-mandado + gate-cerrado a `{ actual: 'espera', habilitadas: ['espera','m5'] }`, `[paso]/page.tsx` despacha `EstadoManual` con `proximoToque`, y `estado-manual.tsx` lo pinta SIN checklist ni gate (§6-2), tono de espera (zinc, sin cyan), próximo toque visible y el salto a m5 disponible. El motor (`registrarOpener` → `registrarContactoComercial`) setea `nextFollowUpAt`. Este tramo solo lo PRESENTA — verificado que el flujo completo funciona, no que compile.

**Verde (chequeado, no asumido — corrido con `cd` explícito y leyendo el exit real, no la notificación).**
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa OK. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde. ✅ `npm run test:setter` → **39/39** (== línea base; **B3 «OPENER: rechaza link + registra + idempotencia» es el testigo del wizard**: registra el opener VÍA WIZARD a través del `OpenerForm` extraído). ✅ `npx prisma migrate status` → al día (80).
- ✅ **Recorrido browser completo** (prod-QA :3001 vía `/api/qa/login` persona setter, sobre «QA-W Evaluada Gate Cerrado» — EVALUADA opener-pendiente; restaurado al cierre): la entrada del manual deriva a **m4** («TU PASO AHORA», Opener — paso 1 de 1) → contexto = bloque del Gem con ficha+evaluación (Score 3/5 AVANZAR) + «Copiar bloque»; munición = ToolGuide gemOutreach («Link pendiente», TODO de Franco); registro = el form → **A-25 EN VIVO: texto con link ⇒ botón deshabilitado + callout rose «El link NO va en el opener — sacalo»; sin link ⇒ botón habilitado + `CopyBlock` «listo para pegar»** → registrar (POST server action 200) → la entrada del manual redirige a **`espera`**: «Esperando respuesta del negocio» + «Próximo toque el 5/7 — el foco te lo trae cuando llegue» (fecha DERIVADA, +2 días), SIN registro ni gate, con el salto «¿Respondió o pasó algo antes? Registralo» → volver a m4 (ya completada) muestra `OpenerResumen` «Primer contacto registrado… la conversación sigue en Seguimiento» → en el **home el lead SALIÓ DEL FOCO**: «TU FOCO AHORA» pasó a otro accionable («QA-W Evaluada Gate Abierto → Generá el brief»), el nuestro ya no está en la cola de trabajo. Capturas desktop (1600) + mobile (480) de M4 y espera, sin desbordes (scrollWidth == innerWidth). **Wizard verificado en paralelo sobre el mismo lead**: el paso opener renderiza chrome completo (teach, canal, Gem) + el `OpenerForm` (textarea + guardrail + botón), sin errores de consola.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.2: cerró verde. M4: ok — bloque del Gem re-servido + ToolGuide + registro compartido (`OpenerForm`) con el hard-block de link A-25 EN VIVO y server-side intocado. Espera: ok, foco liberado — el estado de espera lo entrega el esqueleto (4.1) sin código nuevo (§6-2: sin gate, próximo toque, tono de espera); registrar el opener mueve el lead a `espera` y lo saca del foco del home, comprobado en runtime. Patrón: sostuvo — misma receta 4.2/5.1 (extraer el registro a `<x>-form.tsx` compartido + wizard como chrome + módulo `m<N>-*.tsx` + despacho por id); la firma de `OpenerStep` no cambió, así que `lead-wizard.tsx` quedó intacto.
Desvíos: ninguno de código. Notas: (1) `ToolGuide('gemOutreach')` muestra «Link pendiente» — TODO de Franco en `herramientas.ts`, no del sprint; (2) `npm run lint` (proyecto entero) tiene 104 errores + 107 warnings PRE-EXISTENTES en lanes ajenos (`src/modules/chatbot/*`, `tailwind.config.ts`) — CERO en los 5 archivos del setter/manual de este sprint; no es parte del cierre estándar del setter, se reporta y no se toca; (3) `package-lock.json` (deps wasm opcionales) + los `.last-run.json` de Playwright quedaron FUERA del commit. Pendiente: el resto del Bloque 5 (m5 seguimiento / m6 brief son los próximos tramos naturales).

---

## Sprint 5.3 — Tramo Brief+Construcción: M6, M7-M12 y reentrada M-R (BLOQUE 5) · 2026-07-03

**Qué se hizo.** El tramo central del manual — M6 «Armá el brief», las seis pantallas de Construcción (M7-M12, una por fase del checklist) y la reentrada del re-loop de rechazo (M-R) — más tres cierres de auditoría que caían en scope (A-10, A-21, A-23). Commit `3a7addd`: 4 archivos nuevos + 10 tocados (+796/−268; `brief-step.tsx` adelgaza ~220 líneas al quedar como orquestador).

- `_components/brief-form.tsx` (nuevo) — `BriefForm` + `BriefResumen` extraídos del `BriefStep`: el cuerpo del registro (los 6 campos, gate del brief vía `guardarBrief`/`BriefInputSchema`, autosave y `useUnsavedGuard`). `autosaveEnabled`/`onCancel`/`onSaved` parametrizan las dos presentaciones — el wizard prende autosave SOLO en el re-pegado BRIEF+editando (la captura inicial en EVALUADA no se autoguarda a propósito: ese primer guardado ES la transición). Misma action, gate y transición EVALUADA→BRIEF — motor intacto.
- `_components/brief-step.tsx` — queda como ORQUESTADOR de ramas por stage (candado / espera-gate-cerrado / captura / sanity-check / resumen) delegando el form a `BriefForm` y el brief guardado a `BriefResumen`. Comportamiento idéntico (testigo: `test:setter` 39/39, el flow-spine ejerce el brief vía wizard).
- `lib/leados/prompts-disenio.ts` — `FASE_PROMPTS` (mapa editable `FaseId→PromptDisenioId[]`: calidad→estética+motion, mobile→mobile) + `promptsParaFase()`, mismo precedente que `HARD_CHECK_PROMPT`. **Cierra A-10**: el prompt prefijado se renderiza DENTRO de la fase que lo usa, no listado genéricamente al final del paso.
- `lib/leados/copy-blocks.ts` — `buildConstruccionBlock` suma la sección SEÑALES OPERATIVAS. **Cierra A-21**: verificado (código + bitácora, grep vacío) que NO hay evidencia de exclusividad intencional al Evaluador — la ficha ya las lleva al Gem de diseño/outreach vía `buildBriefInputBlock`, así que la ausencia en el bloque de Construcción era estructural, no una decisión. `otros`/`referenciasFicha` del mismo hallazgo quedan fuera de scope.
- `manual/_components/m6-brief.tsx` (nuevo) — tres slots: contexto = `buildBriefInputBlock` (ficha+evaluación) como `CopyBlock`; munición = `ToolGuide('gemDiseno')`; registro = `BriefForm` (captura, EVALUADA) o `BriefResumen` (consulta, BRIEF+).
- `manual/_components/m-construccion.tsx` (nuevo) — UN módulo parametrizado por `faseId` para las 6 pantallas: contexto = `buildConstruccionBlock` re-servido en cada fase; munición = items de la fase (`SHELL_CONSTRUCCION`) + prompt(s) de diseño de la fase (A-10) + `ToolGuide('claudeDesign')`; registro = el tilde.
- `manual/_components/fase-auto-reporte.tsx` (nuevo) — el tilde de auto-reporte de UNA fase, reusa `guardarProgreso` (el `ChecklistConstruccion` 6-en-uno del wizard queda intacto). Optimista + `router.refresh()` porque la action revalida `/setter` y `/setter/leads/[leadId]` pero NO la sub-ruta del manual (mismo refresh que `OpenerForm`/`EscalarModal`). NO es gate (§6-3): tildar no bloquea ni hace avanzar.
- `manual/_components/pantalla-manual.tsx` — la reentrada (ya migrada) oculta las zonas vacías en vez de mostrar el placeholder «sin migrar».
- `manual/[paso]/page.tsx` — despacho de slots para m6 y las 6 de construcción (por `faseDePantallaConstruccion`, sin non-null assertion); la nota de M-R usa el `GuiaRetrabajo` compartido (única fuente, no un Callout duplicado) + footer de estado preservado + contexto de construcción re-servido.
- `manual/_data.ts` — suma `brief` (`parseBrief`) y `progreso` (hoisted) para M6/M7-M12/M-R.
- A-23 (nota de escalado): `page.tsx` + `lead-wizard.tsx` + `construccion-step.tsx` + `escalar-modal.tsx` — `escaladoNota` se re-sirve a su AUTOR (banner colapsable «Ver lo que le dijiste») y prefillea el modal al re-escalar. Solo UI; el motor de escalamiento (`escalarConstruccion`, `RELOOP_RESET`) intacto.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa OK (incl. `reloop-selfcheck` + `progreso` + `escalamiento`). ✅ `npm run test:leados` → **22/22** (incl. «el re-loop RECHAZADA→CONSTRUCCION preserva el progreso» — el motor que M-R presenta). ✅ `npm run build` → verde. ✅ `npm run test:setter` → **39/39** (G1 `07-admin-assign-caliente` flaky PRE-EXISTENTE: falló en el `<Select>` del ADMIN — línea 83 y luego 101 en corridas distintas, punto de fallo móvil = flake, cero solape con archivos del sprint —, marcado `flaky`/pasa en retry). ✅ `npx prisma migrate status` → al día (80).
- ✅ **Recorrido browser completo** (prod-QA :3001 vía `/api/qa/login` persona setter, leads QA-W del seed V-1; estado restaurado al cierre). El screenshot pixel colgó (renderer trabado, patrón conocido del portal) → verificado por **snapshot a11y + eval de estructura + SSR curl con cookie cruda** (métodos endorsados por bitácora previa; todas las rutas http=200 con la cookie, sin rebote de puerto). **M6**: «QA-W Evaluada Gate Abierto» → snapshot confirma los tres slots (contexto = bloque ficha+evaluación Score 3/5 AVANZAR; munición = ToolGuide gemDiseno; registro = `BriefForm` + «Guardar brief») + chips de completadas atrás. «QA-W Brief» → `BriefResumen` con el título del brief guardado. **M7-M12**: las 6 en DESORDEN (m9→m7→m12→m8→m10→m11) todas http=200 con su h1 propio (Estructura/Personalización/Assets/CTA/Calidad/Mobile) — navegación libre §6-3, cero gate. M11 «Calidad» → prompts «Pulí la estética» + «Mejorá el motion» INLINE (A-10), prompt mobile correctamente ausente. **Tilde end-to-end**: con `progresoJson` limpio, click en el tilde de Calidad (botón hidratado, `aria-pressed` false→true) → `progresoJson={"completadas":["calidad"]}` (round-trip real por `guardarProgreso`, agrega SOLO la fase clickeada, sin clobber). **A-21 end-to-end**: parcheada la ficha con `senalesOperativas` → «SEÑALES OPERATIVAS» + su valor aparecen en el bloque de Construcción; revertida → omitida (sección condicional, mismo patrón que reseñas/contenido). **M-R**: «QA-W Rechazada» → `GuiaRetrabajo` («lo que Franco pidió corregir» + motivo + arreglo) AL FRENTE de la instrucción, footer «Checklist y borrador quedaron como estaban», bloque de Construcción re-servido, rail de fases, SIN placeholders «sin migrar». **A-23**: parcheado escaladoAt+nota → el wizard muestra «Ya avisaste a Franco» + colapsable «Ver lo que le dijiste» + el modal de re-escalar PREFILLEADO con la nota exacta.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.3: cerró verde. M6: ok — `BriefForm`/`BriefResumen` extraídos, ficha+evaluación re-servidas por los builders, gate del brief intacto. M7-M12: ok, navegación libre verificada (6 fases en desorden, cero gate); prompts A-10 dentro de su fase; tilde `FaseAutoReporte` persiste por `guardarProgreso` (checklist 6-en-uno del wizard intacto). M-R: ok — `GuiaRetrabajo` compartido al frente, motor de preservación/reseteo intacto (test:leados lo prueba).
A-21: sumado — sin evidencia de intencionalidad (grep código/bitácora vacío; la ficha ya viaja al Gem de diseño/outreach). Desvíos: ninguno de código. Notas: (1) el QA-W Construccion arrastraba `progresoJson` de 5 fases de una sesión previa — reseteado a NULL (estado canónico del seed) al cerrar; (2) `ToolGuide('gemDiseno'/'claudeDesign')` muestran «Link pendiente» — TODO de Franco en `herramientas.ts`; (3) `package-lock.json` + los `.last-run.json` de Playwright quedaron FUERA del commit. Pendiente: el resto del Bloque 5 (m5 seguimiento sigue sin migrar; m13 borrador / m14 chequeo / m15 envío / m16 agenda son los tramos que faltan).

---

## Sprint 5.4 — Tramo Borrador→Envío: M13, M14, estado Revisión y M15 (BLOQUE 5) · 2026-07-03

**Qué se hizo.** El tramo de cierre de la producción del manual — M13 «Publicá y registrá el link del borrador», M14 «Chequeo final» (con dos cierres de auditoría: A-04 + el puente check→prompt), el estado Revisión, y M15 «Mandá el link al negocio» (presentación del gate inviolable de envío). Commit `914862a`: 6 archivos nuevos + 2 tocados (+853/−2). **Variación de mecanismo respecto de 5.1-5.3** (nota al final): esta ola NO extrae form del wizard; reusa el WRITE PATH compartido (actions/schemas/gate/puente/content) con presentación 2.x propia del manual — el wizard, el motor y la línea inviolable quedan sin tocar (cero archivos del wizard modificados). Decisión delegada por el humano («you decide») tras plantearle el fork.

- `manual/_components/borrador-form.tsx` (nuevo, client) — `BorradorForm`: la captura de la URL del borrador (field + toggle de confirmación humana + guardado) sobre la MISMA action/schema del wizard (`guardarDraftUrl`/`DraftUrlInputSchema` — el `confirmoCarga: literal(true)` y la validación de link real https viven en el schema, server-side igual). Vocabulario 2.x: «borrador», no «draft». Dos estados vivos: captura y verificado (badge + link + «Cambiar el link del borrador»).
- `manual/_components/m13-borrador.tsx` (nuevo, server) — los tres slots: contexto = `BriefResumen` re-servido (lo que la demo tenía que entregar); munición = `GUIA_DRAFT.intro` + `ToolGuide('netlifyDrop')` + los pasos ordenados (el cómo publicar); registro = `BorradorForm` (captura/verificado) o el resumen de consulta con el link post-construcción. Guardar el borrador NO transiciona (sigue CONSTRUCCION) — habilita M14; la posición se re-deriva sola.
- `manual/_components/chequeo-form.tsx` (nuevo, client) — `ChequeoForm`: la grilla de dos niveles (6 obligatorios `HARD_CHECKS` + flags `SOFT_CHECKS`) + el puente `promptParaHardCheck` (parcial a propósito: solo `mobile` mapea un prompt copiable a Claude Design; el resto solo su arreglo) + guardar/enviar sobre las MISMAS actions (`guardarSelfCheck`, `enviarARevision` — que re-valida `selfCheckAprobado` contra la DB, no contra la UI). Los 6 en verde habilitan «Enviar a revisión»; deshabilitado-con-motivo si faltan.
- `manual/_components/m14-chequeo.tsx` (nuevo, server) — **cierra A-04**: el link del borrador A LA VISTA dentro de la pantalla (contexto: bloque «Tu borrador» clickeable + «abrilo en incógnito/celu y chequealo punto por punto») + el brief re-servido para el check «fiel al brief». Munición = `TeachPanel('selfCheck')` + `SelfCheckEjemplo`. Registro = `ChequeoForm` (construcción) o el resumen read-only «Enviado a revisión». Sigue siendo EL gate de Construcción; las fases M7-M12 no gatean (derivación intacta).
- `manual/_components/envio-form.tsx` (nuevo, client) — `EnvioForm`: SOLO la rama «gate abierto» del envío (Rocket «Demo aprobada — momento de enviar el link» + el `CopyBlock` del segundo mensaje con el link vía `buildDemoMensajeBlock` + «Ya la envié — registrar» → `enviarDemoAprobada`). NO reimplementa el gate.
- `manual/_components/m15-envio.tsx` (nuevo, server) — **presentación de un gate que ya existe**: lee `gateEnvioDemo` para decidir qué mostrar (enviada / listo para enviar / a la espera). Contexto = el `finalUrl` aprobado a la vista; munición = `GUIA_ENVIO.intro` (el link sale acá y sólo acá); registro = los tres estados, nombrando la condición que falta por su causa real (`GUIA_ENVIO.espera.{aprobadaSinEnganche|engancheSinAprobar|niEngancheNiAprobada}`). La action existente re-valida el gate completo (APROBADA ∧ finalUrl ∧ (respondió ∨ caliente)) server-side.
- `manual/_data.ts` — expone `draftUrl` (M13 + A-04 de M14), `selfCheck` (`parseSelfCheck`, M14), `finalUrl` y `demoEnviadaAt` (M15). Mismos campos del dossier que ya alimentaban la derivación; sólo se re-sirven.
- `manual/[paso]/page.tsx` — despacho de slots para m13/m14/m15 por `pantalla.id`.
- **Estado Revisión (Fase 3): CERO código nuevo.** El esqueleto ya lo tenía: `derivarPantalla` (rama EN_REVISION de `posicionDe`) devuelve `{ actual: 'revision' }`, `[paso]/page.tsx` despacha `EstadoManual` con `tipo: 'revision'`, y `estado-manual.tsx` lo pinta sin checklist ni gate, tono de espera. Verificado en runtime.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa OK — **`gate-envio` IDÉNTICO** («gateEnvioDemo es la composición exacta APROBADA ∧ finalUrl ∧ gateBriefAbierto… sin drift server↔UI»), + `self-check` + `reloop-selfcheck` + `progreso` + `security`. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (rutas `/manual/[paso]` compiladas). ✅ `npm run test:setter` → **39/39** (wizard sin tocar → testigo trivialmente verde). ✅ `npx prisma migrate status` → al día (80).
- ✅ **Recorrido browser end-to-end** (dev:qa :3002 vía `/api/qa/login`, seed V-1, estado restaurado al cierre con re-seed). **M13** (QA-W Construccion): «BORRADOR — paso 1 de 1», los tres slots (brief re-servido / Netlify Drop + pasos / «BORRADOR PUBLICADO» + link + «Cambiar el link del borrador»), vocabulario 2.x. **M14**: el link del borrador A LA VISTA en el contexto (A-04) + el brief; grilla 6/6 con «Enviar a revisión» habilitado. **Puente**: toggle del check `mobile` a OFF → aparece su prompt «Adaptá a mobile» (CopyBlock copiable) + el botón queda disabled + «obligatorio en rojo» (deshabilitado-con-motivo); restaurar 6/6 → re-habilita. **Envío a revisión** (mutación real): click → `enviarARevision` → EN_REVISION → M14 pasa a read-only «Enviado a revisión» y la entrada del manual redirige al **estado Revisión** («Franco está revisando tu demo», sin checklist). **Aprobación admin REAL**: persona super-admin → `/admin/leados/[id]` → «Aprobar» → `finalUrl` cargado → «Confirmar aprobación» → APROBADA. **M15** (de vuelta como setter): gate abierto — contexto = el `finalUrl` aprobado a la vista; «Demo aprobada — momento de enviar»; `CopyBlock` del segundo mensaje; «Ya la envié — registrar» → `enviarDemoAprobada` → estado «Demo enviada… el objetivo es la reunión». Mobile (375): M15 y M14 sin overflow (scrollWidth == innerWidth), A-04 visible. Cero errores de consola en toda la corrida.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.4: cerró verde. M13: ok — captura del borrador sobre `guardarDraftUrl`/`DraftUrlInputSchema` (gate = link válido), vocabulario 2.x. M14: ok, puente ok — link del borrador a la vista (A-04 cerrado) + grilla sobre `HARD_CHECKS` + puente `promptParaHardCheck` (fallar `mobile` muestra su prompt, disabled-con-motivo); sigue siendo EL gate de Construcción (`enviarARevision` server-side), M7-M12 sin gatear. Estado Revisión: sin código nuevo (esqueleto). M15: ok, gate intacto — presentación de `gateEnvioDemo`; `outreach.actions`/`gateEnvioDemo`/`gate-envio-demo.invariant` sin tocar (invariante idéntico verde); condiciones nombradas por su causa real. Recorrido admin real M13→envío verificado end-to-end.
Desvíos: uno de mecanismo (no de scope) — esta ola reusa el WRITE PATH compartido con presentación propia del manual, en vez de extraer form del wizard como 5.1-5.3; wizard/motor 100% sin tocar (honra al máximo «wizard intactos»/«ni se roza»); decisión delegada por el humano. Notas: (1) `ToolGuide('netlifyDrop')` muestra «Link pendiente» — TODO de Franco en `herramientas.ts`, no del sprint; (2) los `.last-run.json` de Playwright quedaron FUERA del commit. Pendiente: m5 seguimiento y m16 agenda son los tramos que faltan del Bloque 5.

---

## Sprint 5.5 — Tramo Seguimiento+Agenda: M5 y M16 (BLOQUE 5 · mapa completo) · 2026-07-03

**Qué se hizo.** Las últimas dos pantallas del mapa v1 del manual — M5 «Registrá lo que pasó» (el toque de la conversación: cadencia relativa +2/+2/+3-stop, próximo toque visible y la estructura de cadencia agotada heredada del 2.x) y M16 «Agendá la reunión» (el booking con Cal.com). Con esto **las 16 pantallas del mapa están vivas**. Commit `6ad4066`: 5 archivos nuevos + 2 tocados (+1060/−4). Sigue la variación de mecanismo de 5.4 (reusa el WRITE PATH compartido, presentación 2.x propia; cero archivos del wizard/motor tocados) — encuadrada por la regla absoluta «Motor/wizard intactos».

- `manual/_components/seguimiento-form.tsx` (nuevo, client) — `SeguimientoForm`: el registro de un toque sobre la MISMA action/schema del wizard (`registrarResultado`/`ResultadoInputSchema` — ownership, cadencia y transición de estado adentro; POSTERGADO re-valida la fecha server-side). Las 4 opciones del wizard (SIN_RESPUESTA/RESPONDIO/POSTERGADO/RECHAZADO; CALL_AGENDADA NO se registra a mano — la reunión se agenda en M16). `useState(() => new Date(...))` lazy para el mín del date-picker (evita `react-hooks/purity`, el warning que arrastra el `seguimiento-step` del wizard).
- `manual/_components/m5-seguimiento.tsx` (nuevo, server) — los tres slots, PRESENTACIÓN pura de la cadencia (la calcula `follow-up.ts`, la lee `cadenciaInfo` de `flow.ts`; jamás se recalcula): contexto = «Toques de follow-up: N de M» + próximo toque + teléfono (A-14) + estado; munición = el mensaje base del próximo toque (templado, sin link) o —cuando `cadencia.agotada`— la nota de cierre (sin próximo toque; no se ofrece un «no respondió» más; el cierre a PERDIDO lo decide Franco); registro = `SeguimientoForm`.
- `manual/_components/agenda-form.tsx` (nuevo, client) — `AgendaForm`: el flujo interactivo del booking sobre las MISMAS actions del wizard (`ofrecerHorarios`/`confirmarReunion`, `ConfirmarReunionSchema` con notas de traspaso obligatorias) — confirmar decisor (`hintDecisor` según la ficha) → buscar 3 horarios reales → marcar el elegido → attendee → confirmar. La confirmación/recordatorio al prospecto los manda Cal.com nativo.
- `manual/_components/m16-agenda.tsx` (nuevo, server) — PRESENTACIÓN de un gate que ya existe: contexto = teléfono + estado; munición = el how-to (`GUIA_AGENDA.pasos`); registro = los tres estados en el orden del wizard (reunión ya agendada → resumen del traspaso / gate RESPONDIO cerrado → deshabilitado-con-motivo + salto a M5 / gate abierto → `AgendaForm`). El gate real (`gateAgenda`: RESPONDIO ∧ sin reunión) re-valida server-side; `agenda.actions.ts` intocado.
- `manual/_data.ts` — expone `followUpCount` (`countFollowUps`, hoisted: alimenta la derivación Y la cadencia de M5), `reactivateAt`, `leadPhone`, `agenda` (`parseAgenda`, hoisted), `contactName`, `leadEmail`. Mismos campos de lead/dossier, sólo re-servidos.
- `manual/[paso]/page.tsx` — despacho de slots para m5/m16 por `pantalla.id`.
- `scripts/dev/qa-manual-m5-m16.ts` (nuevo) — seed QA dev-only idempotente de los 4 estados del manual que V-1 no cubre: V-1 siembra un lead por estado del wizard pero SIN actividades ni envío/agenda, así que `posicionDe` nunca aterriza en M5 (necesita contactos > 0) ni en M16 (necesita demo enviada / reunión). Este cubre M5 toque-vencido, M5 cadencia-agotada, M16 abierta y M16 agendada.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa **15/15** OK (incl. gate-envio, self-check, progreso, reloop-selfcheck, security — sensibles, intactos). ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (rutas `/manual/[paso]` compiladas). ✅ `npm run test:setter` → **39/39** (wizard sin tocar → testigo trivialmente verde).
- ✅ **Code-review** (subagente react-reviewer, read-only): **Approve**, 0 CRITICAL/HIGH/MEDIUM. Confirmó purity (el `useState` lazy es el único read de reloj, correcto), boundary server/client, wiring de props exacto page.tsx↔componentes, presentación de cadencia/agenda fiel al wizard, paridad Zod, `_data.ts` limpio. 1 LOW pre-existente ajeno: el primitivo compartido `components/ui/Field.tsx` no asocia `<label htmlFor>` — afecta TODO el codebase (incl. el wizard que espejo), fuera de scope (pase de a11y aparte).
- ✅ **Recorrido runtime SSR** (prod-QA :3001 vía `/api/qa/login` persona setter, cookie `__Secure-` cruda; seed `qa-manual-m5-m16.ts`). El preview MCP no adjunta al prod-QA levantado por npm y un browser fresco choca con el rebote de AUTH_URL → verificado por **curl al SSR** (método endorsado por bitácora previa; todas las rutas **HTTP 200** con la cookie, sin rebote). **M5 toque** (QA-M5 Toque, EVALUADA/2 SIN_RESPUESTA/toque vencido → m5 actual): «Registrá lo que pasó» + «Toques de follow-up: 1 de 3» + próximo toque + las 4 opciones + «Registrar resultado». **M5 agotada** (QA-M5 Agotada, 4 SIN_RESPUESTA → `cadencia.agotada`): «Cadencia completa — … se enfría», «el cierre lo decide Franco», SIN próximo toque (estructura de cierre). **M16 abierta** (QA-M16 Abierta, APROBADA/RESPONDIO/demo enviada → m16 actual): «Agendá la reunión» + «Buscar horarios libres de Franco» + check del decisor + notas de traspaso. **M16 agendada** (QA-M16 Agendada, APROBADA/CALL_AGENDADA/agenda AGENDADA): «Reunión agendada» + resumen del traspaso (attendee + notas + Booking Cal.com). Ninguna muestra el placeholder «sin migrar». Regresión: m4 (pantalla ya migrada) intacto (HTTP 200) — el despacho de slots no rompió ramas existentes.
- ⚠️ **Pase de píxeles (screenshots desktop+mobile): FLAGUEADO a Franco.** El preview MCP no adjunta al prod-QA de npm y el browser fresco contra prod-QA rebota por AUTH_URL (patrón conocido). El chrome visual es el mismo `PantallaManual`/`Zona` + primitivas (Badge/Button/Card/Field/CopyBlock) ya QA-probadas en M4/M13/M14/M15, reusadas idénticas (cero primitivas nuevas). Leads listos para el pase en dev:qa: `QA-M5 Toque` `cmr5ofkjj00019fpkwc514e58`, `QA-M5 Agotada` `cmr5ofl1j00079fpk5no7mfx2`, `QA-M16 Abierta` `cmr5oflep000f9fpks86dxmwu`, `QA-M16 Agendada` `cmr5oflle000j9fpkf138gszr` (re-seed: `npx tsx scripts/dev/qa-manual-m5-m16.ts`).

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.5: cerró verde. M5: ok, cierre-agotada ok — cadencia presentada (no recalculada), próximo toque visible, y al agotarse la cadencia (3er toque sin respuesta) la pantalla encausa al cierre (sin próximo toque, sin «no respondió» infinito). M16: ok — booking sobre `ofrecerHorarios`/`confirmarReunion`, tres estados en el orden del wizard, `gateAgenda` re-valida server-side. **Mapa: 16/16 vivas.**
Desvíos: uno de mecanismo (no de scope), heredado de 5.4 — reusa el WRITE PATH compartido con presentación propia en vez de extraer form del wizard; wizard/motor/línea de agenda 100% intactos (honra «Motor/wizard intactos»). El cierre a PERDIDO sigue del admin (no se implementó, per regla). Notas: (1) pase de píxeles flagueado a Franco (leads seedeados arriba) — el resto del recorrido verificado por SSR sobre prod-QA; (2) el `react-hooks/purity` del `seguimiento-step` del wizard (línea ~189) sigue PRE-EXISTENTE y ajeno — el form nuevo lo evita con `useState` lazy; (3) el LOW de a11y en `components/ui/Field.tsx` (label sin `htmlFor`) es sistémico y pre-existente, candidato a un pase propio; (4) los `.last-run.json` de Playwright quedaron FUERA del commit. Pendiente: nada del mapa del manual — las 16 pantallas están vivas.

---

## Sprint 5.6 — EL CORTE: el manual es la experiencia del setter; retiro del wizard de página larga (CIERRE DEL BLOQUE 5) · 2026-07-04

**Qué se hizo.** El corte del Bloque 5: `/setter/leads/[leadId]` pasa a servir el manual (redirect de una línea → `manual/page.tsx`, el ÚNICO derivador: ownership→404, deriva posición, aterriza en la pantalla actual), el wizard de página larga se retira (16 archivos, −3.192 líneas netas), y la suite e2e migra conservando QUÉ prueba y cambiando solo CÓMO navega. Commit `75b9d7f`: 38 archivos (4 nuevos, 18 tocados, 16 borrados; +735/−3.192).

**Censo saldado (regla 1: nada de lógica se pierde).** El plan detectó — confirmado por grep de llamadores — **3 huecos bloqueantes** que la ruta paralela escondía: `iniciarConstruccion` (BRIEF→CONSTRUCCION), `reabrirConstruccion` (RECHAZADA→CONSTRUCCION, el re-loop) y `escalarConstruccion` (+`EscalarModal`) vivían SOLO en `construccion-step.tsx` — sin el wizard, un lead en BRIEF jamás llegaba a m13 y un rechazado quedaba atrapado en M-R. Decisión humana (Franco, 3 preguntas): rellenar dentro de 5.6 con las actions INTACTAS, timeline al pie de cada pantalla, cabecera promovida al manual.

- `manual/_components/construccion-ctas.tsx` (nuevo, client) — `ArrancarConstruccion` (recuadro cyan en fases m7-m12 cuando stage=BRIEF; el tilde NO se bloquea, §6-3) y `ReabrirConstruccion` (zona Registro de M-R). Mismas actions con su guardia de stage server-side; `useStepAction` refresca y la posición re-deriva sola.
- `manual/_components/escalamiento-construccion.tsx` (nuevo, client) — la capa «me trabé» del wizard en las fases con stage=CONSTRUCCION: `EscalarModal` compartido (import directo), banner «Ya avisaste a Franco» con espera visible (`useHidratado`+`formatEspera`), nota re-servida + re-escalar prefilleado (A-23).
- `manual/_components/historial-lead.tsx` (nuevo, server) — `<details>` «Ver historial del lead» al pie de TODA pantalla (incl. estados espera/revisión), reusa `LeadTimeline` tal cual (SISTEMA marcado, no cuenta como contacto). Datos: `listOwnedLeadTimeline` sumado a `cargarManualDelLead`.
- `manual-nav.tsx` — `ManualHeader` enriquecido (`CabeceraLead`): h1 del negocio + badges (caliente con guardrail `esCaliente` / status / stage) + meta + links externos + notas + cartel de asignación (`getUltimaAsignacion`) — lo que mostraba el header de la página del wizard. «Volver al lead» → «Volver a tu cartera» (/setter); ídem `manual/error.tsx` (volver «al lead» sería un loop sobre el mismo error). Los h1 de pantalla/estado bajan a h2 (un solo h1 por página).
- Guía portada (que el retiro no pierda enseñanza): `CanalSeguridad` a m4+m5 (con `dmsHoy` nuevo en `_data`), `GuardrailRol` + bloque de objeciones (`buildObjecionInputBlock` — habría quedado huérfano) a m5, sanity-check del brief («¿quedó genérico?» → re-pegar reabre `BriefForm`, solo en BRIEF) como `brief-sanity.tsx` en m6, tabla «Qué mira el Evaluador» a m2, `UrgenciaBanner` como encabezado de fases + `BadgeProvisorio` en munición de fases.
- Retiro: `lead-wizard`, los 9 steps, `step-anchor`/`step-nav` (StepLink), `paso-actual-banner`, `dossier-stepper`, `checklist-construccion` (reemplazado por `FaseAutoReporte`), `prompts-disenio` (componente; la lib A-10 queda), `materiales-negocio` (cubierto por bloque de contexto + links en cabecera). QUEDAN como compartidos: `ficha-form`/`evaluacion-form`/`opener-form`/`brief-form`, `ficha-step` (m1 usa `FichaStep`), `guia-retrabajo`, `escalar-modal`, `lead-timeline`(+helpers), `urgencia-banner`, `badge-provisorio`, `use-hidratado`. Grep post-borrado: cero referencias vivas.
- Entradas: cartera/foco/novedades/alta apuntan a la raíz → redirect transparente (verificado: nadie usaba anclas ni query del wizard); `revalidatePath` intactos; el 404 de ownership vive en `setter/not-found.tsx` (sobrevive, la cadena de redirects lo atraviesa).

**Suite e2e migrada (regla 2: misma sustancia, prohibido debilitar).** `00` A5 → instrucción protagonista + URL `/manual/[paso]` como aserción de posición + historial abierto. `01` B2/B9 navegan a m3 (el veredicto), B3 acota el alert del gate a `section[aria-label="Registro"]` + idempotencia vía m4 completada, B6 → m13 («URL del borrador»/«Guardar borrador») + m14 (mismos 6 hard-checks, «Guardar el chequeo»), B9 suma la guardia server (m14 inaccesible en DESCARTADA → redirect a m3), B11 → m16. B5 quedó IDÉNTICO (labels «Arrancar construcción»/«Me trabé» preservados a propósito). `02` sin cambio (aislamiento por CONTENIDO atraviesa el redirect). `03` D5 abre el historial + prueba «SISTEMA no abre Seguimiento» por la guardia (goto m5 → rebota a m4). `05` F3 abre el historial, F5 instrucción en mobile. `04`/`06`/`07` sin cambio (G1 ya era por contenido — form del brief compartido).

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES del corte: git limpio · tsc · invariantes · `test:leados` 22/22 · `test:setter` 39/39 (HEAD 9ed9261).
- ✅ `npx tsc --noEmit` → 0 errores (checkpoint tras 2B, tras el retiro, y final). ✅ eslint sobre `leads/[leadId]` + `tests/setter` → 0 (los ~103 errores del lint global son PRE-EXISTENTES de lanes ajenos — dashboard/chatbot/marketing). ✅ `npm run check:invariants` → **15/15** (gate-envio, self-check, progreso, reloop-selfcheck, escalamiento, security — intactos). ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde. ✅ `npm run test:setter` migrada → **39/39 al primer intento** (recorrido punta a punta B1→B8 CONTRA EL MANUAL: ficha→evaluación→opener→brief→arrancar→escalar→borrador→chequeo→revisión→aprobación admin→envío; re-loop B10+invariante; descarte B9; aislamiento en vivo C1/C2/G1; claim atómico; mobile; a11y). ✅ `npx prisma migrate status` → al día (80).
- ✅ **visual-qa** (prod-QA :3001, 9 leads QA sembrados — seed V-1 + `qa-manual-m5-m16`, desktop 1600 + mobile 390): cabecera nueva, tabla de criterios, historial colapsable, opener+CanalSeguridad, urgencia+NavConstruccion, M-R con nota al frente + «Reabrir construcción», estado revisión, m15, m16 agendada, m3 terminal — sin overflow mobile, cero errores de consola. Su único ❌ («falta el CTA Arrancar en m7») fue **REFUTADO empíricamente**: SSR-curl con cookie real → HTTP 200 + «Arrancar construcción» presente (y «El brief está listo…»), y el e2e B5 lo CLICKEÓ en browser real verificando la transición — snapshot parcial del agente (patrón que él mismo notó en otra pantalla). Sus 2 ❓: «Canal Instagram — hoy · 0/30 DMs» ES el render propio de `CanalSeguridad` (no bug), y el escalamiento al pie del Registro es su ubicación por diseño (espeja al wizard).
- ⚠️ Pase fino de píxeles (estética, no estructura): FLAGUEADO a Franco, como en 5.5 — leads QA listos (`QA-W *` re-seed `npx tsx scripts/v1-qa-wizard-states.ts`; `QA-M5/M16 *` re-seed `npx tsx scripts/dev/qa-manual-m5-m16.ts`).

**Fuera de scope, anotado (no implementado).** (1) `dmsHoy` alimentaba también un contador en el seguimiento del wizard; m5 hoy muestra `CanalSeguridad` con el mismo dato — paridad razonable, sin pantalla nueva. (2) `StepAnchorId`/comentarios de `paso.ts` nombran consumidores del wizard retirado — el tipo sigue siendo la costura viva de la derivación (motor intacto, solo naming histórico). (3) Los TODO de `herramientas.ts` («Link pendiente» en ToolGuides) siguen siendo de Franco. (4) El LOW sistémico de a11y en `components/ui/Field.tsx` (label sin htmlFor) sigue pendiente de un pase propio.

**BLOQUE 5 CERRADO.** 5.0 (costura paso único) → 5.1 (M2+M3) → 5.2 (M4+espera) → 5.3 (M6+M7-M12+M-R) → 5.4 (M13-M15+revisión) → 5.5 (M5+M16, mapa 16/16) → **5.6 (el corte)**. El manual pasó de esqueleto (4.1) a LA experiencia del setter; el wizard de página larga ya no existe; el motor (stage machine, gates, cadencia, agenda, escalamiento) no se tocó en ningún sprint del bloque.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 5.6 / BLOQUE 5: cerró verde. Corte: hecho. Censo: saldado (3 huecos bloqueantes detectados y rellenados con las actions intactas — arrancar/reabrir/escalar; + timeline y cabecera promovidas por decisión de Franco).
Suite e2e: migrada, 8 specs (5 tocados, 3 sin cambio necesario), misma sustancia — 39/39 al primer intento. Regresión: verde total (tsc, invariantes 15/15, leados 22/22, build, setter 39/39, migrate 80, visual-qa con su único ❌ refutado por SSR+e2e). Pendiente: pase fino de píxeles a ojo de Franco (leads QA seedeados); TODOs de herramientas.ts; a11y de Field.tsx (pase propio).

---

## Sprint 6.1 — El pin ordena el foco, no lo excluye (A-05) · 2026-07-04

**Qué se hizo.** La decisión que quedó pendiente desde 2.1a/2.1b/2.3 (flagueada 3 veces en `bitacora-beta-2.md`: ¿un fijado accionable debería poder SER foco, o el pin es estrictamente organización-de-cartera?) la resolvió Franco: **el pin pasa a ser preferencia de ORDEN dentro de la cola accionable — el fijado sube a la cima del foco, no se excluye.** El brief §4 pide que el foco ponga SIEMPRE delante un lead activo; hasta hoy `particionarCartera` empujaba `lead.pinned` a `fijados`, FUERA de la cola `trabajar`, así que fijar tu única accionable hacía caer el home en «todo en espera» con un fijado esperando — elegir/fijar dejaba el foco falsamente vacío (el propio código lo dejó anotado como decisión pendiente). Cambio de **derivación**, no de motor: transiciones, gates, aislamiento y schema intactos; el pin sigue siendo el mismo flag, cambia dónde cae en la cola. Commit `7b3e491`: 5 archivos (4 tocados, 1 nuevo; +185/−27).

- `flow.ts` → `particionarCartera` (el corazón del cambio): el fijado **accionable y vigente** (`lead.pinned && lead.grupo === 'trabajar' && !lead.snoozed`) entra a `grupos.trabajar` en la cima, en vez de a `fijados`. La guarda `!snoozed` es mínima y deliberada: una pausa personal vigente gana al pin para el foco (un lead que el setter escondió no debe saltar como protagonista) → ese fijado+pausado cae en `fijados`, preservando exactamente la precedencia pin>snooze del resto de la cartera. El fijado NO accionable (en vuelo) sigue en `fijados` sin cambio. **Ningún otro caso de la partición se mueve.**
- `flow.ts` → nuevo comparador `ordenFoco` (`Number(b.pinned) - Number(a.pinned) || ordenUrgencia`): el fijado va primero, y a igualdad de pin manda la urgencia de siempre (respondió → caliente → resto). Mismo patrón que `filtrarYOrdenarCartera`, donde el fijado ya flotaba arriba. `grupos.trabajar.sort(ordenFoco)`. **Sin push:** el sticky (D7) sigue sosteniendo el lead que el setter trabaja; un fijado más urgente aparece como `proximo` y recae en foco recién cuando el sticky se suelta.
- `flow.ts` → `motivoOrden`: rama de pin PRIMERO («Fijado por vos — va primero»). El rótulo se muestra en el propio `FocoSurface` (foco-surface.tsx:130) — sin esta rama, un fijado que es foco mostraría su tier de urgencia («Por orden de llegada») y mentiría sobre por qué está arriba. `motivoOrden` mantenido en sincronía con `ordenFoco` (su comentario ya lo exige).
- `page.tsx` / `home-en-espera.tsx`: solo comentarios/doc al día. El branching del home YA era correcto (`HomeEnEspera` se muestra únicamente cuando `!foco.foco`, es decir cola `trabajar` vacía = ningún accionable, fijado o no) — el fix lo satisface por construcción: un fijado accionable ahora está EN `trabajar`, así que hay foco y no hay «en espera». El conteo `fijados` de la pantalla pasa a representar fijados NO accionables (en vuelo); se corrigió el comentario que afirmaba «un fijado accionable queda fuera del foco por diseño 2.1a» (ya no es cierto).
- `particion.invariant.ts` (nuevo) + `check:invariant:particion` (wired en `check:invariants`): guardia ejecutable del A-05, en la línea de `foco.invariant`/`flow.invariant`. Prueba, determinísticamente (no «es obvio», no efímero): (1) fijado accionable sube a la cima de `trabajar` por encima de uno más urgente y NO cae en `fijados`; (2) único fijado accionable → `grupos.trabajar` con el lead, `fijados` vacío = foco no falsamente vacío; (3) el pin NO fabrica accionabilidad — un fijado en vuelo sigue en `fijados`, sin inventar foco; (4) fijado+pausado NO salta al foco (cae en `fijados`, jamás en `trabajar`); (5) `motivoOrden` del fijado-foco es «Fijado por vos — va primero», el no-fijado conserva su tier.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio · `npx prisma migrate status` al día · `npx tsc --noEmit` 0 errores · Bloque 5 commiteado (HEAD 134c8af).
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run check:invariants` → cadena completa **16/16** OK (la nueva `particion` + `foco`/`flow`/`setter-meta` — aislamiento pin/snooze — verdes: el reorden no movió clasificación ni aislamiento). ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (rutas `/setter` compiladas). ✅ `npm run test:setter` → **39/39** (D2 pin persiste + A3/D3 foco renderizan en browser prod real, sin regresión).
- ✅ **Recorrido de Fase 2 probado determinísticamente** por el invariante nuevo: «fijar un lead accionable → aparece como foco (no en espera)» = escenario 1 (sube a la cima) + escenario 2 (único fijado accionable → foco existe). Es una guardia PERMANENTE, no una corrida de runtime que se pierde (la bitácora previa criticó explícitamente verificar «solo en runtime» sin guardia).
- ⚠️ Pase de píxeles: **riesgo visual mínimo, flagueado a Franco si lo quiere.** No se agregó superficie nueva — los edits a pantallas fueron comentario-only; el único string nuevo («Fijado por vos — va primero») reusa el chip de `motivoOrden` ya QA-probado en el `FocoSurface` (mismo slot styleado que «Respondió — va primero» etc.). Para verlo en vivo hace falta un setter cuya única accionable esté fijada (seed puntual).

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 6.1: cerró verde. Pin: ordena, ya no excluye — el fijado accionable entra a `trabajar` en la cima (`ordenFoco`), el motor (transiciones/gates/aislamiento/schema) intacto; guarda `!snoozed` para que un pausado no salte al foco. Home-en-espera: solo sin accionables (fijado o no) — el branching ya lo cumplía por construcción; los `fijados` que quedan son no accionables (en vuelo). Regresión: verde total (tsc, invariantes 16/16 con la nueva `particion`, leados 22/22, build, setter 39/39). Recorrido probado por invariante determinístico, no runtime efímero.
Desvíos: ninguno. Pendiente: pase fino de píxeles a ojo de Franco (riesgo mínimo — chip reusado, sin superficie nueva).

---

## Sprint 6.2 — Novedades informan, sin reconstituir una cola paralela al foco (A-06) · 2026-07-04

**Qué se hizo.** El brief §4 pide que el setter tenga SIEMPRE exactamente un lead activo (el foco) y nunca haga malabares con colas. El panel «Novedades» del home reconstituía una SEGUNDA cola: cada aviso ofrecía «Abrir» como link directo a `/setter/leads/{id}` que abría un lead SIN anclarlo como foco, y «Tus demos esperando a Franco» era una lista navegable completa (cada demo un `<Link>`), un tablero de trabajo en paralelo al foco — encima, esas demos EN_REVISION ni siquiera son trabajo del setter (esperan a Franco). El fix: los avisos INFORMAN, y «Abrir» pasa a ANCLAR el lead como foco por el MISMO mecanismo que «Ir a trabajarlo» (`anclarFoco` + `router.push`); la cola en revisión deja de ser lista navegable y pasa a un RESUMEN (cuántas + hace cuánto la más vieja) cuyo acceso es la cartera (filtro «Esperando revisión», que ya existía). Cambio de PRESENTACIÓN: cero motor (transiciones/gates/aislamiento/schema intactos), cero push. Commit `811362c`: 6 archivos (1 nuevo, 5 tocados; +157/−88).

- `novedades.ts` (data layer): `AvisoView.href` → `AvisoView.leadId` (el lead que «Abrir» ancla, no un href de navegación directa); `leadAbrible` reemplaza a `hrefNovedad` con el MISMO criterio de «abrible» (el saliente nunca abre — el setter ya no es dueño → sólo informa). `DemoEnColaView[]` (lista con href por demo) → `ColaRevisionResumen | null` (`{total, hace}`); `derivarDemosEnCola` → `derivarColaRevision` (un agregado en un solo scan: cuenta EN_REVISION y toma la espera más vieja por `dossier.updatedAt`; `null` si no hay ninguna). `NovedadesView.enCola` → `revision`. `getNovedadesSetter` mapea `leadId` vía `leadAbrible` y devuelve el resumen — resiliente igual que antes (el resumen se deriva de los leads y sobrevive un fallo de lectura de avisos) y el aislamiento por `setterId` no se toca.
- `novedades-abrir-foco.tsx` (nuevo, client) — `AbrirFocoButton`: espejo fiel de `FocoSurface#irATrabajar` (`useTransition` + `anclarFoco(leadId)` + toast de error + `router.push(detalle)`, `disabled={isPending}` anti-doble-submit). Reusa la action existente; NO transiciona stages ni inventa prioridad — sólo ancla el sticky (D7) y navega. Vive aparte del panel (server) porque necesita router/transición del cliente.
- `novedades-panel.tsx` — el «Abrir» de cada aviso pasa de `<Link>` a `<AbrirFocoButton>` (el saliente, sin `leadId`, no ofrece acción: sólo informa). La lista «Tus demos esperando a Franco» pasa a un RESUMEN (un `<p>`, sin ningún `<a>`) bajo el MISMO título, con puntero textual a la cartera («Las ves en tu cartera → filtro «Esperando revisión»»). Se retiran los imports `Link`/`ArrowRight` (ya no hay navegación directa en el panel); el guard de «nada que mostrar» pasa a `avisos.length === 0 && !revision`.
- `page.tsx` — comentario al día (los handoffs INFORMAN y su «Abrir» ANCLA el foco, ya no es un atajo que reconstituye una cola paralela).
- `progreso.ts` — dos comentarios que citaban `derivarDemosEnCola` como espejo del patrón puro (`ahora` inyectado) actualizados al nuevo nombre `derivarColaRevision` (comment-only, caída de mi rename; flagueado como MEDIUM por el code-review).
- `tests/setter/00-surfaces.spec.ts` (A4) — guarda dura de A-06 sobre el server prod real: la región «Novedades de tu cartera» NO contiene NINGÚN link (`getByRole('link') → 0`) — si reapareciera una cola navegable, rompe — + el copy del resumen («esperando revisión de Franco», «filtro «Esperando revisión»»). Habría FALLADO antes del fix (el panel tenía links de avisos + de demos) y PASA después.

**Rule 3 despejada (frené-y-reporté no aplicó).** El anclaje desde un aviso NO choca con cómo el motor elige el foco: `seleccionarFoco` respeta el sticky SÓLO si el lead sigue en `grupos.trabajar`; si no (una demo EN_REVISION, un lead ya en seguimiento), lo ignora en silencio y el foco recae en la cima — así que anclar la novedad de un lead no accionable no corrompe la selección (a lo sumo navega al detalle y el foco no cambia). La puerta lateral legítima (§4) queda intacta: la cartera y sus `LeadCard` (links a `/setter/leads`) no se tocaron — el setter sigue pudiendo abrir cualquier lead desde ahí y trabajarlo.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio · `npx tsc --noEmit` 0 errores · Sprint 6.1 commiteado (HEAD 77c4ea7).
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npx eslint` sobre los 5 archivos de src/test tocados → 0. ✅ `npm run check:invariants` → cadena completa **16/16** OK (aislamiento por `setterId`/`assignedToId` intacto — una novedad no es canal de actividad, `novedades.invariant` sigue verde). ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (`/setter` compilado dinámico). ✅ `npm run test:setter` → **39/39** en corrida limpia (incl. **A4** con la guarda nueva de A-06 renderizada en el server prod; **C4** aislamiento — el saliente sin link, el entrante visible por texto). ✅ `npx prisma migrate status` → al día (80).
- ✅ **Code-review** (subagente react-reviewer, read-only): **Approve**, 0 CRITICAL/HIGH. Confirmó: anclaje fiel a `irATrabajar` con `disabled` anti-doble-submit; boundary server/client (panel server, `AbrirFocoButton` la única isla client nueva); cero referencias muertas a `href`/`DemoEnColaView`/`derivarDemosEnCola`; XSS limpio (React escapa `title`/`body`, sin `dangerouslySetInnerHTML`); resumen sólido (min `updatedAt`, `null` en vacío; el `stage === 'EN_REVISION'` coincide con el bucket «revision» de `flow.ts` al que apunta el copy «filtro «Esperando revisión»» → conteo y destino consistentes). 1 MEDIUM = el comentario stale de `progreso.ts` (resuelto en el mismo commit).
- ✅ **Recorrido A-06 probado en el server prod (A4)**: la guarda «cero links en la región de novedades» es determinística y PERMANENTE (no runtime efímero) — prueba que la segunda cola desapareció; el resumen renderiza con su copy y su puntero a la cartera. El mecanismo de anclaje es la MISMA action `anclarFoco` que `03-cabina` D3 («Ir a trabajarlo») ya clickea en browser real.
- ⚠️ **Flakiness de infra local (ajena al sprint), documentada.** `test:setter` flakeó en dos corridas full con conjuntos de fallo DISTINTOS y en tests DISTINTOS (07/G1 admin+`<Select>` porteado con timeout de opción; luego `ERR_CONNECTION_REFUSED` del `start:qa` local; luego C4+F4 por timeout) — server prod-QA local inestable bajo carga, NO el sprint: (1) mi diff no toca admin/assign/`<Select>`/drawer mobile; (2) cada test pasó en al menos una corrida; (3) C4 y F4 pasaron **10/10 aislados**, F4 con su chequeo de overflow mobile en verde ANTES del click flaky; (4) `migrate status` verde = Neon sano, el rebote era del server local; (5) **corrida limpia final 39/39**. Patrón ya anotado en bitácoras previas («matar huérfanos :3001», stale pool).

**Fuera de scope, anotado (no implementado).** (1) Un e2e dedicado de click-through «Abrir → ancla foco» (navegar + volver y ver el lead como foco) no se agregó: el mecanismo es la MISMA action `anclarFoco` que D3 ya cubre en browser real, y un test fiable exigiría un setter namespaced con cartera controlada (el aviso del lead que ES foco se deduplica contra él) — candidato si Franco lo quiere. (2) El pase fino de píxeles (desktop+mobile) queda a ojo de Franco: el chrome del resumen reusa el mismo `<div>`+`Clock3` violeta del bloque anterior (cero primitiva nueva); el preview MCP no adjunta al prod-QA de npm (patrón conocido) → la estructura se verificó por el e2e A4 en vivo y F4 confirma sin overflow mobile. (3) El LOW sistémico de a11y en `components/ui/Field.tsx` sigue pendiente de un pase propio.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 6.2: cerró verde. Segunda cola: eliminada — los avisos INFORMAN y su «Abrir» ANCLA el foco vía `anclarFoco` (mismo mecanismo que «Ir a trabajarlo»); la cola en revisión pasó a resumen + acceso por cartera (filtro «Esperando revisión»). Puerta lateral: intacta (cartera/`LeadCard` sin tocar). Motor sin tocar (cambio de presentación; Rule 3 despejada: `seleccionarFoco` ignora el sticky de un lead no accionable). Regresión: tsc, eslint, invariantes 16/16, leados 22/22, build, setter **39/39** (corrida limpia), migrate 80; react-reviewer **Approve**.
Desvíos: ninguno de scope. Notas: (1) un comentario de `progreso.ts` (out-of-scope) actualizado por el rename — comment-only, en el mismo commit; (2) e2e de click-through no agregado (mecanismo cubierto por D3), pase de píxeles flagueado a Franco; (3) `test:setter` flakeó por infra local (3 conjuntos de fallo distintos, ajenos al sprint) — verde en corrida limpia y C4/F4 verdes aislados. Pendiente: nada.

---

## Sprint 6.3 — La guía vive en la estructura, no en un bloque de prosa (A-01) · 2026-07-04

**Qué se hizo.** El §2 dice que "cómo usar esto" en prosa es estructura fallida: si hay que explicar la pantalla con un párrafo, el bug es la pantalla. La tarjeta `OnboardingHint` ("Cómo funciona tu día") era exactamente eso — explicaba en texto el modo dirección (el foco) y el flujo invertido (opener antes que demo). Con el manual paso-por-pantalla (BLOQUE 5) ya vivo, esos mismos conceptos los comunica la ESTRUCTURA cuando el setter llega a cada pantalla, en su momento real de uso. Aplicando la Regla 1 (quitar antes que reescribir): **pura remoción, 0 micro-hints** — nada quedó genuinamente sin comunicar, así que no se escribió ni una línea nueva. Commit `7074ba6`: 2 archivos (1 borrado, 1 tocado; +1/−181).

- `onboarding-hint.tsx` — **borrado** (173 líneas). Único consumidor: `page.tsx`. Todo lo que enseñaba tiene ya ≥1 hogar estructural en su momento real:
  - foco / "un lead por vez" / las tres acciones → `FocoSurface` lo ES (badge **Caliente**, "Tu foco ahora", "1 de N para trabajar", `motivoOrden` = el porqué, botones "Ir a trabajarlo" / "Parquear" / "Saltar" con sus tooltips, "Después: … +N en la cola");
  - score y frío/caliente → pantalla **M3** del manual ("1-2 descarta, 3 avanza, 4-5 sugiere prioridad" / veredicto "Avanzar con prioridad");
  - opener-antes-que-demo → el ORDEN de pantallas del manual (opener antes que construcción) + `TeachPanel` en Opener y Construcción (la auditoría UX ya registraba esa redundancia de 4-5 superficies).
- `page.tsx` — se retira el `import` y el `<OnboardingHint />` (con su comentario). Se recorta la cláusula stale del comentario del foco ("…la guía pedagógica pasó abajo") que apuntaba a la tarjeta ya inexistente. **Regla 2 (home acción-primero, §8-d) satisfecha por construcción:** el foco ya estaba PRIMERO —pegado al header, sobre el fold— desde B6.5; quitar la guía de abajo no deja hueco, sólo baja el ruido. Orden del home ahora: header → foco/acción → novedades → cartera+números → progreso.
- **Bonus de precisión:** la prosa retirada afirmaba "el Evaluador marca 4-5 te habilita a construir la demo preventiva" — una simplificación hoy imprecisa: el caliente del Evaluador sólo SUGIERE prioridad (M3 lo dice explícito; el caliente operativo lo marca Franco). Remover también deja caer esa media-verdad; la estructura (M3) es la fuente correcta.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio (sólo ruido de `.last-run.json`) · `npx tsc --noEmit` 0 errores · Sprint 6.2 commiteado (HEAD d628910).
- ✅ `npx tsc --noEmit` → 0 errores (sin referencias colgadas — el único consumidor era `page.tsx`, saldado). ✅ `npm run check:invariants` → **16/16** OK. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (`/setter` compilado). ✅ `npm run test:setter` → **38/38 + 1 flake**: F4 (drawer mobile abre/cierra) falló por el click a "Cerrar menú" — mecánica del shell, ajena a mi remoción del cuerpo del home; su chequeo de overflow (lo que sí toca mi cambio) pasó ANTES del click. **Re-corrida aislada del spec: 6/6 verde** (F4 incluido) → flake de infra confirmado, patrón ya anotado.
- ✅ **Recorrido A-01 verificado en el server prod-QA (SSR-curl, cookie `setter` real, HTTP 200):** las 6 firmas del onboarding ("Cómo funciona tu día", "Antes de empezar", "Trabajás un lead por vez", "El flujo de cada lead", "La espera es parte del laburo", "no lo muestres más") → **0 ocurrencias** (pared de texto retirada). "Tu día" (header) + "Tu foco ahora" + "Ir a trabajarlo" → presentes, en ese orden dentro del main (header < foco < CTA) = acción al frente. "Caliente" presente (1×) = el concepto frío/caliente aparece en su momento real, sobre el propio foco. El preview MCP no adjunta al prod-QA de npm (patrón conocido) → prueba de CONTENIDO por SSR-curl, la más fuerte para una remoción (no se renderiza nada nuevo que pueda romper layout); F4 (aislado) confirma `/setter` sin overflow mobile.

**Fuera de scope, anotado (no implementado).** (1) Los `.last-run.json` (artefactos del runner de playwright) quedaron fuera del commit — ruido pre-existente, no del sprint. (2) El pase fino de píxeles queda a ojo de Franco: es una remoción (una card menos, las demás byte-idénticas al baseline 6.2 verde), riesgo visual nulo. (3) Los pendientes heredados siguen: TODOs de `herramientas.ts`, a11y de `Field.tsx`.

**BLOQUE 6 CERRADO.** 6.1 (el pin ORDENA el foco, no lo excluye — A-05) → 6.2 (novedades INFORMAN, sin cola paralela — A-06) → **6.3 (la guía vive en la estructura, no en prosa — A-01)**. Tres correcciones de PRESENTACIÓN/derivación alineando el home al brief §4/§2/§8; el motor (transiciones, gates, aislamiento, schema, cadencia) no se tocó en ningún sprint del bloque.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 6.3 / BLOQUE 6: cerró verde. Onboarding en prosa: retirado (componente borrado + única referencia en `page.tsx`). Micro-hints: ninguno — todo lo que enseñaba lo comunica ya la estructura en su momento real (FocoSurface, M3, orden del manual + TeachPanels); la Regla 1 (quitar antes que reescribir) se cumplió al 100%. Home sigue acción-primero (foco pegado al header). Regresión: tsc, invariantes 16/16, leados 22/22, build, setter 38/38 + F4 flake (verde aislado 6/6). Recorrido A-01 probado por SSR-curl: 6 firmas del onboarding en 0 ocurrencias, foco+CTA al frente, "Caliente" en su momento real.

---

## Sprint 7.0 — Smoke-test exhaustivo del manual (16 pantallas + M-R + estados) · 2026-07-04

**Qué se hizo.** Con el manual como experiencia única del setter desde el corte (BLOQUE 5) y tres sprints de presentación encima (BLOQUE 6), este sprint buscó lo que las suites verdes NO miran: la fricción que solo aparece recorriendo cada pantalla contra 7 lentes (loading/error/vacío, callejones sin salida, vocabulario 2.x, copy duplicado, datos capturados no re-servidos, a11y básica, bugs mecánicos de React). Método: workflow multi-agente — 9 grupos de recorrido por fase/pantalla + 2 pasadas cross-cutting (vocabulario entre las 16 pantallas; asimetría entre la familia form-extraída m1-m6 y la familia write-path-local m5/m13-m16) corriendo en paralelo, seguido de una **triage adversarial** que releyó cada candidato "trivial-seguro" antes de aceptarlo (regla del sprint: ante la duda de categoría, es (b) — no se toca). 11 agentes de recorrido + 16 de triage, ~265 lecturas de archivo. Commit `036d70b`: 3 archivos (2 tocados, 1 nuevo; +171/−2).

- **Nota metodológica:** la vara referenciada en la instrucción (`docs/brief-vision-flujo-setter.md`) no existe en el repo bajo ese nombre (confirmado por grep global) — se usó como vara el contrato vigente (`manual.ts`/`_data.ts`) + el vocabulario 2.x ya establecido en los Bloques 2-6. Queda para que Franco confirme si el archivo debía existir en otro lado.
- **41 hallazgos crudos → 2 confirmados trivial-seguros tras triage** (de 16 candidatos propuestos; los otros 14 los reclasificó la propia triage a (b) por tocar componentes compartidos con múltiples consumidores, admitir más de una solución razonable, o vivir sobre copy de producto/contenido editable). Los 2 aplicados: `role="alert"` en el `<p>` de error de `manual/_components/seguimiento-form.tsx:159` y de `_components/brief-form.tsx:200` (precedente idéntico ya existente en `opener-form.tsx`) — atributo ARIA puro, sin cambio de copy/comportamiento/gates.
- **Los 39 hallazgos (b) quedan en `docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md`** con archivo:línea, severidad y recomendación, sin implementar ninguno (Regla 2 del sprint: motor/gates/línea de envío intactos ante cualquier duda). El más grave (severidad alta): `guidance-content.ts:347` (`GUIA_EVALUACION.campos.score.hint`) sigue diciendo "4-5 marca el lead como caliente", contradiciendo el propio diseño de M3 (el caliente del Evaluador solo *sugiere* prioridad — Franco marca el operativo); M3 lo sobrescribe así que el setter no lo ve mal ahí, pero la fuente base queda desalineada. Un hallazgo de comportamiento real (no solo copy): en `mr` (reentrada del re-loop), `NavConstruccion` se renderiza igual que en m7-m12 porque `PANTALLAS.mr.fase === 'construccion'` — no rompe el gate (m7-m12 ya están en `habilitadas` para RECHAZADA) pero puede no ser la UX intencionada de una pantalla que el propio código documenta como "no lleva munición ni registro propios". m4 (Opener) no arrojó ningún hallazgo.
- Referencias muertas al wizard retirado (Sprint 5.6) sobreviven en 4 puntos (mensajes de error server-side "Paso 7"/"Paso 10"/"Paso 5", un "paso anterior" en m14, y el comentario "sin migrar" del shell) — mismo patrón que 6.3 ya limpió en el home, pendiente acá.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio (solo ruido de `.last-run.json`) · `npx tsc --noEmit` 0 errores · `npx prisma migrate status` al día (80) · Sprint 6.3/BLOQUE 6 commiteado (HEAD f61f626).
- ✅ `npx tsc --noEmit` → 0 errores post-fixes. ✅ `npm run check:invariants` (16 invariantes del dominio leados/setter) → **16/16** OK — el cambio no tocó ningún archivo de `src/lib/leados/**`. ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (`/setter/leads/[leadId]/manual/[paso]` compilado). ✅ `npm run test:setter` → **39/39**.
- ✅ Los 2 fixes aplicados son atributos ARIA puros sin diferencia visual (nada que capturar por screenshot) — se verifican por precedente idéntico ya existente (`opener-form.tsx`), lectura directa de ambas líneas antes de editar, y el tsc/build/suites de arriba. No se declaró éxito por compilar solo: el propio informe deja anotado qué NO se tocó y por qué (39 hallazgos, ninguno implementado).

**Fuera de scope, anotado (no implementado).** Los 39 hallazgos (b) del informe completo — ninguno se implementó en este sprint, todos quedan para triage de Franco. Los `.last-run.json` quedaron fuera del commit (artefactos del runner, no del sprint). El LOW sistémico de a11y en `Field.tsx` (heredado de sprints previos) reaparece en este smoke-test con más detalle (label sin `htmlFor`, 33 consumidores en el repo) — sigue pendiente de un pase propio.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 7.0: cerró verde. Trivial-seguros arreglados: 2 (`role="alert"` en `seguimiento-form.tsx` y `brief-form.tsx`, tras sobrevivir triage adversarial de 16 candidatos). Hallazgos (b) para decisión: 39, ver `docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md`.
Los más graves (b): (1) `guidance-content.ts:347` contradice al propio M3 sobre qué significa el caliente del Evaluador (severidad alta); (2) `NavConstruccion` se renderiza en la pantalla de reentrada `mr` por herencia de `fase==='construccion'` — no rompe el gate pero puede no ser la UX intencionada; (3) `ChequeoForm`/`EnvioForm` (m14/m15) son los únicos sin manejo de error inline (solo toast), raíz: no usan `useStepAction`; (4) 4 referencias muertas al wizard retirado en mensajes de error/copy. Desvíos: la vara `docs/brief-vision-flujo-setter.md` no existe en el repo (se usó el contrato + vocabulario 2.x como vara). Pendiente: el informe completo para tu triage.
Desvíos: ninguno. Pendiente: nada del sprint (heredados: `.last-run.json` fuera del commit, pase de píxeles a ojo de Franco —riesgo nulo en una remoción—, TODOs de `herramientas.ts` y a11y de `Field.tsx`).

---

## Sprint 7.1 — Pase perceptual con Franco (Preview): header compacto en mobile · 2026-07-04

**Qué se hizo.** Cierra el pendiente que arrastraban los reportes del BLOQUE 5: el pase fino de píxeles desktop+mobile que el preview MCP no pudo adjuntar al QA de producción. Corrió con **Preview levantando la app** (`launch.json` → `next-dev-qa`, `localhost:3002`, HMR), sesión QA de setter, y los **13 estados del wizard sembrados** (`scripts/v1-qa-wizard-states.ts`, idempotente — un lead `QA-W` por cada pantalla m1→m16 + M-R + terminales). Vara: los 3 focos del brief — §1 (feel), §3 (aterrizajes / nota de rechazo), §8-d (CTA en vista inicial). Commit `c82ff48`: 1 archivo (+4/−2).

- **Blocker de infra, surfaceado (no tapado):** `preview_screenshot` estuvo **colgado toda la sesión** — fresh browser sobre `about:blank`, timeout 30s ×2, sin errores de consola. No es la app: es el canal de captura del MCP (`eval`/`inspect`/`snapshot`/network funcionan). Franco juzgó el feel en su propio browser; el agente verificó cada punto por **geometría medida** (`getBoundingClientRect`, qué entra en viewport) — el criterio ya establecido para presentación ("los fixes de overlay se miden por eval, no screenshot").
- **Barrido medido desktop 1440×900 + mobile 390×844 de los 3 focos:**
  - **§3 · M-R (nota de rechazo sin scroll): PASA** en ambos viewports — la nota de Franco (`GuiaRetrabajo`, "Qué/Dónde/Arreglo") cae en `top≈371` desktop / `~343` mobile, arriba del fold. El wrapper la pone AL FRENTE a propósito (`encabezado` antes de la instrucción); "Reabrir construcción" cae después (1122/1389) por diseño (leer el rechazo → después reabrir). Sin cambio.
  - **§8-d · Home CTA en vista inicial: PASA** — "Ir a trabajarlo" en `top=458` desktop / `502` mobile, arriba del fold en ambos.
  - **§ · Ninguna pantalla scrollea para su acción: ROZABA en mobile.** En las pantallas de form, el manual apila header + instrucción + contexto + munición (≈800px de contenido REAL, no placeholders) antes del form; en la ficha (m1) el primer campo caía en `872` (fold 844) → ~30px de scroll para empezar a tipear. Desktop zafaba por poco (`765` < 900).
- **Fix elegido por Franco (de 4 opciones: barrer-primero / compactar-header / dejarlo / reestructurar → eligió compactar header en mobile):** en `manual/_components/manual-nav.tsx` (`ManualHeader`, compartido por las 16 pantallas): `space-y-3` → `space-y-2 sm:space-y-3`, y el eyebrow "Manual paso a paso" → `hidden … sm:block` (redundante en mobile: la instrucción de abajo ya nombra el paso). **~41px recuperados en mobile en TODA pantalla del manual.** En la ficha el primer campo pasó de `872` a **`831` < 844 → entra en el fold**. **Desktop byte-idéntico** (restaurado vía `sm:`: eyebrow visible, `instrTop=335`, campo en `765` — verificado post-cambio, cero regresión).

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio (solo ruido de `.last-run.json`, restaurado) · `npx tsc --noEmit` 0 errores · `npx prisma migrate status` al día (80) · Sprint 7.0 commiteado (HEAD 288611a).
- ✅ `npx tsc --noEmit` → 0 errores. ✅ `npm run test:leados` → **22/22**. ✅ `npm run test:setter` → **39/39** en corrida limpia — incl. **F4/F5** (mobile ~390px: home y lead sin overflow horizontal), que cubren exactamente la superficie tocada. (Ajustes de píxel no mueven tests: el diff es 2 `className` + un comentario.)
- ✅ Verificación del fix por geometría (no por screenshot — canal caído): ficha mobile primer campo `872→831` (< 844 fold) con eyebrow oculto; desktop sin cambio (`765`, eyebrow visible). Home CTA y nota M-R re-confirmadas sobre el fold en ambos viewports.

**Fuera de scope, anotado (no implementado).** (1) **Pantallas pesadas de Construcción (m7-m12) en mobile:** su `Registro` (checklist de fase) cae profundo bajo el fold (`~1420`) por el mucho contexto re-servido; el header compacto las sube ~41px como a todas, pero NO las lleva sobre el fold — eso exigiría el **reestructurar** que Franco NO eligió (bajar notas/munición debajo de la acción). Queda como decisión suya si algún día quiere ese lever. (2) **Margen fino:** en la ficha el campo entra con 13px de aire; un lead con `notas` largas o cartel de asignación en mobile podría deslizarlo apenas bajo el fold — el header compacto mitiga, no blinda. (3) El blocker de `preview_screenshot` (infra del MCP, no del repo) queda anotado para futuros sprints visuales: verificar por geometría/SSR-curl mientras no vuelva la captura. (4) Heredados sin tocar: los 39 hallazgos (b) del smoke-test 7.0, TODOs de `herramientas.ts`, a11y de `Field.tsx`.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 7.1: cerró verde. Ajustes aplicados: 0 (desktop) + 1 (mobile — header compacto: `space-y-2` + eyebrow oculto en mobile; ~41px, el form de la ficha entra en el fold). Franco aprobó el recorrido: de los 3 focos del brief, **2 ya pasaban medidos** (nota de rechazo M-R sobre el fold; home CTA sobre el fold, ambos viewports) y el 3º (acción sin scroll) se corrigió en mobile con el lever que Franco eligió; el motor no se tocó (solo CSS).
Copy a cambiar (anotado, no tocado): ninguno en 7.1 (el copy desalineado ya vive anotado en el informe 7.0). Desvíos: `preview_screenshot` caído toda la sesión (infra del MCP) → verificación por geometría medida + suites, no por captura. Pendiente: nada del sprint; las pantallas pesadas de Construcción sobre el fold en mobile quedan como decisión de "reestructurar" que Franco descartó por ahora.

---

## Sprint 7.2 — Accesibilidad sistémica de `Field.tsx` (cierra el pendiente que arrastraban 6.3 / 7.0 / 7.1) · 2026-07-04

**Qué se hizo.** El pendiente heredado ("a11y sistémico de `Field.tsx`", anotado en tres cierres) hecho pase propio. `Field` es el componente base de los inputs del manual (33 consumidores en el repo, todos vía el barrel `@/components/ui`) — arreglarlo ahí se propaga a TODA pantalla de captura. Objetivo: teclado + lector de pantalla (label asociado, error anunciado, foco visible, estado no-solo-por-color) **sin cambiar comportamiento** — mismos gates, misma validación, mismos mensajes (vocabulario 2.x), ahora anunciables. Commit `<pendiente>`: 5 archivos (4 tocados, 1 nuevo; +79/−13 en el kit + 28 líneas de contexto).

- **Mecanismo elegido — contexto, no `cloneElement`.** El problema de raíz: `Field` renderiza `children` (el control va adentro), no controla su `id`. Descartado `cloneElement`/`Children.only` porque **los Field del manual envuelven MÚLTIPLES hijos** (`ficha-form.tsx`: `<TextArea/>` + `<CampoMejora/>` condicional) → clonar el "único" hijo rompería. Solución: `Field` genera un `id` estable (`useId`) y lo provee por un `FieldControlProvider` (nuevo `field-context.ts`); los controles del kit (`Input`, `TextArea`, el `<button>` trigger del `Select`) lo leen **solo como fallback** — cualquier prop explícita del caller (`id`, `aria-describedby`, `aria-invalid`) gana. Fuera de un `Field` el contexto es `null` → los controles se comportan idéntico que antes (probado, ver CASE 5). Cero cambio en los 33 call sites.
- **Lo que se aplicó (Fase 1, en `Field` + kit):** `<label htmlFor>` ↔ `id` del control; el `<p>` de error/ayuda con `id` vinculado por `aria-describedby`; `aria-invalid` en `Input`/`TextArea` cuando hay error; `role="alert"` en el `<p>` de error (el lector lo anuncia al aparecer — mismo texto de siempre, precedente ya usado en `opener/seguimiento/brief`); anillo de foco por teclado `focus-visible:ring-2 ring-cyan-400/50` en los tres controles (cyan = marca primaria); required comunicado a SR con `<span class="sr-only">(obligatorio)</span>` + el `*` visual marcado `aria-hidden`.
- **Ajuste de corrección a11y (lo pescó el lint, no yo):** `aria-invalid` **no es soportado por `role="button"`** (`jsx-a11y/role-supports-aria-props`). El control visible del `Select` es un `<button>` (no un rol de form). Meterle `aria-invalid` exigiría cambiarle el rol a `combobox` — **cambio de comportamiento, fuera de scope**. Decisión estándar-limpia: el `Select` transmite el error por `aria-describedby` (texto de error vinculado + anunciado) + el borde rojo `invalid`; el `aria-invalid` queda solo donde es válido (`<input>`/`<textarea>` nativos). Revertido ese pedazo del `Select`.
- **Fase 2 (grep de inputs fuera de `Field`) → cero cambios de código, con razón.** Un solo control crudo en toda la superficie `setter`: `importar-prospectos-form.tsx:120`, un `<input type="file" className="hidden">` operado por un `<button>` con texto descriptivo — patrón accesible conocido (input oculto + trigger etiquetado), no aplica el cableado de `Field`. Los 3 `<label>` del manual (`borrador`/`chequeo`/`agenda`) ya son accesibles: dos envuelven `<Toggle>` (switch con su propio `aria-label`), uno envuelve un `<input type="checkbox">` nativo (asociación implícita + foco nativo). Ningún input de captura de texto del manual esquiva el kit.

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Línea base Fase 0 ANTES de tocar: git limpio · `npx tsc --noEmit` 0 errores · `npx prisma migrate status` al día (80) · Sprint 7.1 commiteado (HEAD f15acba).
- ✅ `npx tsc --noEmit` → 0 errores (valida el nuevo boundary `'use client'` de `Field`/`TextArea`/`field-context`). ✅ `npx eslint` sobre los 5 archivos → **0 errores / 0 warnings** (el warning de `aria-invalid`-en-button que surgió a mitad se resolvió, no se silenció). ✅ `npm run check:invariants` → **16/16** (no toqué `src/lib/**`). ✅ `npm run test:leados` → **22/22**. ✅ `npx prisma migrate status` → al día (80).
- ✅ **Prueba de cableado a11y determinística (SSR render-proof, 24 asserts, script descartable con `renderToStaticMarkup`):** CASE 1 (`Field`+`Input`+error) → `label[for]` = `input[id]`, `aria-describedby="…-error"`, `aria-invalid="true"`, `<p id role="alert">` con el texto, anillo focus-visible presente. CASE 2 (hint sin error) → `aria-describedby="…-hint"`, sin `aria-invalid=true`, sin `role=alert`. CASE 3 (`TextArea`+error) y CASE 4 (`Select`+error, `button[id]`=`label[for]` + describedby) idem. CASE 5 (`Input` suelto sin `Field`) → **sin `id`/`describedby` inyectados** = cero regresión fuera del `Field`. **ALL PASS**, script borrado.

**Fuera de scope, anotado (no implementado / no verificado en vivo).**
1. **`npm run build` + `npm run test:setter` (39, browser) + recorrido de teclado/SR en vivo: NO corridos.** La carpeta tiene el `dev:qa` de OTRO chat vivo en `:3002`; `next build` reescribe el `.next` compartido (que ese `next dev` tiene abierto — en Windows lo bloquea/corrompe) → habría reventado su sesión. Preferí no pisarla. El cableado quedó probado por el render-proof determinístico (equivalente estático de lo que el navegador aplica: los `<input>` siguen focusables, `:focus-visible` y `role="alert"` son comportamiento nativo del browser/SR sobre markup correcto). **Recomendado:** correr `build`+`test:setter` y un tab-through real en un checkout limpio o cuando el otro chat esté idle (o despachar `visual-qa`). Riesgo bajo: el diff es aditivo (atributos ARIA + una utilidad `focus-visible` + un contexto), sin quitar estructura DOM ni tocar valores/nombres.
2. **`Select` sin `aria-invalid`** por lo dicho arriba (rol `button`); si algún día se quiere el `aria-invalid` "de verdad", el camino es promover el trigger a `role="combobox"` — cambio de semántica, decisión aparte.
3. Heredados sin tocar: los 39 hallazgos (b) del smoke-test 7.0, TODOs de `herramientas.ts`. El `.last-run.json` del runner queda fuera del commit (ruido pre-existente).

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 7.2: cerró verde (estático) — pendiente confirmación en navegador. `Field` accesible: **sí** (label↔control por `htmlFor`/`id` vía contexto; error `aria-describedby` + `role="alert"`; `aria-invalid` en input/textarea; foco visible por `focus-visible:ring`; required a SR por `sr-only`). Inputs fuera de `Field` propagados: **ninguno** — no hay inputs de captura de texto que esquiven el kit (el único crudo es un file-input oculto ya accesible por su botón). Comportamiento cambiado: **ninguno** (mismos gates/validación/mensajes; el `Select` no lleva `aria-invalid` porque su trigger es `role="button"` y el atributo no aplica — se resolvió por `aria-describedby`, no por cambiar el rol). Desvíos: el lint pescó el `aria-invalid`-en-button y forzó esa decisión (bien). Pendiente: `build` + `test:setter` (browser) + tab-through en vivo — NO corridos para no corromper el `.next` del `dev:qa` de otro chat en `:3002`; correr en checkout limpio / con la otra sesión idle.

---

## Sprint 7.3 — Regresión final: el sello del cierre (CIERRE DEL BLOQUE 7 y del PROYECTO DE REDISEÑO) · 2026-07-04

**Qué se hizo.** La verificación final de que nada del núcleo ni de lo que el brief manda preservar se rompió durante el rediseño (Bloques 5–7). No es un sprint de features: es lectura + verificación exhaustiva multi-lente contra la **lista de preservación**, con subagentes por frente. Método: workflow multi-agente — 5 verificadores en paralelo (aislamiento · gates · flujo · contenido · invariantes), cada uno contra su tramo de la lista corriendo sus invariantes puros + leyendo código/tests/git; refutación adversarial de cada regresión reclamada (0); y un crítico de completitud. 6 agentes, ~875k tokens, 162 tool-calls. El veredicto completo (evidencia archivo:línea por ítem) quedó en `docs/auditorias/REGRESION-FINAL-2026-07.md`. **Fase 2 no tocó una sola línea de producción** — cero regresiones, así que no hubo nada que arreglar (regla 1); tampoco aplicó el FRENAR-y-reportar (regla 2) porque no hubo regresión de motor.

- **Aislamiento — verde.** Suites cruzadas del Bloque 1 (`02-isolation` C1–C4, `alta-import` A.1/A.2) byte-idénticas desde el corte 5.6 (`git diff` vacío); perímetro completo (13 server actions guardan cada escritura con `requireSetter()`+ownership antes de mutar; los `prisma.osLead` crudos son solo write-helpers session-forced); el manual deriva por `getOwnedLead→notFound()` y no abre camino (grep de prisma en `manual/_components` → **0 matches**).
- **Gates y línea inviolable — verde.** `gateEnvioDemo` (`flow.ts:90-101`) = `APROBADA ∧ finalUrl ∧ (respondió ∨ caliente)` idéntico — el único cambio de `flow.ts` en la ventana (`134c8af..HEAD`) es el pin-ordering del A-05; la action `enviarDemoAprobada` (`outreach.actions.ts:223-232`) re-valida el gate server-side antes de escribir, y el `finalUrl` lo pone el admin, no el setter. Las 6 fases sin gatear; el re-loop resetea solo el self-check y preserva checklist+draft.
- **Flujo — verde.** 16/16 pasos alcanzables y en orden (`posicionDe` exhaustivo, `derivarPasoDelLead` fuente única); puerta lateral viva (`home-sections.tsx:67`); postergados vencidos → foco; el pin ordena (A-05); sin segunda cola (A-06, 0 links en novedades).
- **Contenido — verde.** M3 renderiza "Avanzar con prioridad", nunca "caliente" en el veredicto; teléfono/escalado (A-23)/señales (A-21) re-servidos; vocabulario 2.x limpio.
- **Invariantes — verde.** 16/16; las 5 sensibles (`gate-envio-demo`, `self-check-gate`, `reloop-selfcheck-reset`, `foco`, `idor-tokens`) byte-idénticas desde pre-ventana (`2e75007~1`); `particion` (nueva en 6.1) es fortalecimiento.
- **Crítico de completitud:** 0 regresiones + 4 gaps de *evidencia-por-proxy* (no regresiones). Cerrados: #1 wiring action→gate (exhibido), #3 grep de `manual/_components` (0 matches), #2 suites Bloque 1 (corridas verdes), #4 corrección de doc (el gate vive en `flow.ts`, no en un `gate-envio-demo.ts` inexistente — tocarlo ES tocar el motor).

**Verde (chequeado, no asumido — `cd` explícito, exit real leído, no la notificación).**
- ✅ Fase 0: git limpio (restaurado el ruido de `.last-run.json`) · `npx tsc --noEmit` 0 errores · commits 7.0/7.1/7.2 en el log · `migrate status` al día (80).
- ✅ `npm run check:invariants` → **16/16** (EXIT=0, corrida limpia del padre además de las por-frente). ✅ `npm run test:leados` → **22/22**. ✅ `npm run build` → verde (**primer build limpio post-7.2**; rutas `/setter/**` + `/manual/[paso]` compiladas, 0 errores TS). ✅ `npm run test:setter` → **39/39** en **2.7m, corrida limpia al primer intento, 0 flakes** — el recorrido punta-a-punta (B1→B11: ficha→…→envío→agenda), el aislamiento cruzado en vivo (C1–C4), el re-loop completo (B10), foco/pin (D), mobile/a11y (F1–F6), claim (F) y admin (E/G). ✅ `migrate status` → al día (80).
- ✅ **Cierra el pendiente de 7.2.** `build` + `test:setter` (browser) — que 7.2 no pudo correr por el `dev:qa` de otra sesión en `:3002` — corrieron acá con esa sesión detenida (aprobación de Franco). La suite `05-empty-mobile-a11y` (F1–F6, incl. F6 landmarks + `aria-current` y F4 drawer mobile) es la **primera ejecución en browser de los cambios de a11y del 7.2** (`Field.tsx`) y pasó verde: el cableado ARIA que 7.2 probó estático quedó confirmado en el navegador.

**Fuera de scope, anotado (no implementado).** Los pendientes post-proyecto (a triage de Franco, ninguno es regresión): (1) los **39 hallazgos (b)** del smoke-test 7.0 (`docs/auditorias/SMOKE-TEST-MANUAL-2026-07.md`) — los más serios: `guidance-content.ts:347` (copy "4-5 caliente" vs la regla de M3, que lo sobrescribe), `NavConstruccion` en la reentrada `mr` (decisión de producto), `m14`/`m15` sin error inline (solo toast), y **vocabulario muerto del wizard** ("Paso 7/10" en `outreach.actions.ts:165/173`, "Paso 5" en `dossier.actions.ts:382`, "(paso anterior)" en `m14-chequeo.tsx:57`) — cuidado: los de actions server-side tocan motor-adyacente. (2) `herramientas.ts`: 4/5 URLs `null` (TODO — Gems/accesos que aporta Franco; solo Netlify real). (3) Pantallas pesadas de Construcción (m7-m12) bajo el fold en mobile — el "reestructurar" que Franco descartó en 7.1. (4) Naming histórico del wizard en `StepAnchorId`/`paso.ts` (motor intacto). (5) Higiene de tooling: `eslint` como key deprecada en `next.config.ts`, falta `"type":"module"` en `package.json`. (6) La "vara" `docs/brief-vision-flujo-setter.md` no existe — confirmar con Franco. (7) `.last-run.json` de Playwright fuera del commit. **Cerrado en el camino:** el a11y de `Field.tsx` que arrastraban 6.3/7.0/7.1 quedó resuelto en 7.2 y confirmado en browser acá — ya no es pendiente.

**BLOQUE 7 CERRADO.** 7.0 (smoke-test exhaustivo) → 7.1 (pase perceptual, header compacto en mobile) → 7.2 (a11y sistémico de `Field`) → **7.3 (regresión final — el sello).**

**PROYECTO DE REDISEÑO DE EXPERIENCIA CERRADO.** De esqueleto (4.1) a la experiencia única del setter (Bloque 5, el corte) → home alineado al brief §2/§4/§8 (Bloque 6) → pulido + verificación final (Bloque 7). **El motor (máquina de stages, gates, línea inviolable de envío, cadencia, agenda, escalamiento, aislamiento multi-tenant) no se tocó en ningún sprint del proyecto** — probado por invariantes byte-idénticas y git-diff, no por confianza.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 7.3 / BLOQUE 7 / PROYECTO: **cerró verde**. Frentes: aislamiento [ok] · gates [ok] · flujo [ok] · contenido [ok] · invariantes [ok].
Regresiones halladas: **ninguna** (0 reclamadas, 0 confirmadas; el crítico levantó 4 gaps de evidencia-por-proxy, todos cerrados — 2 en vivo, 1 por corrida, 1 corrección de doc). Corrida completa verde: tsc 0 · invariantes 16/16 · leados 22/22 · build ✅ · setter 39/39 (recorrido punta-a-punta + aislamiento cruzado en vivo + re-loop, corrida limpia) · migrate 80. Cierra además el pendiente de 7.2 (build + test:setter + a11y en browser).
Pendientes post-proyecto: los 39 (b) del smoke-test 7.0, los TODOs de `herramientas.ts` (links de Franco), el vocabulario muerto del wizard en mensajes de error, las pantallas de Construcción bajo el fold en mobile, e higiene de tooling. Ninguno es regresión.
Veredicto: **el rediseño cumple el brief.** Motor intacto, preservación intacta, experiencia del setter entregada.

---

## AUD-2 — Auditoría de cierre: ¿la herramienta cumple la visión? · 2026-07-07

**Qué se hizo.** La auditoría espejo de AUD-1 (apertura): read-only estricto sobre TODA la superficie del setter post-corte (manual 16 pantallas + mr + estados, home/foco/novedades, cartera/archivo, alta/importación, métricas, escalamiento, rails), con 6 subagentes de lectura por lente + consolidación. Veredicto de cumplimiento §0–§11, bugs que el verde no atrapa, propuestas de profundización dentro de los guardarraíles, diseño propuesto de la fase PRE, y **el backlog único de continuidad** con fichas ejecutables para modelos más baratos. Nada se implementó (regla 1); dos únicas escrituras: el informe + este append.

**Veredicto en una línea.** **El rediseño cerró el gap estructural — la visión se cumple en la arquitectura (4 CUMPLE · 7 PARCIAL · 0 NO); lo que traba la semana del setter ya no es la estructura sino tres cosas acotadas: las 4 herramientas sin link (decisión de Franco), el vocabulario muerto del wizard en el copy más visible, y datos viciados que hacen que el foco sirva leads muertos como trabajo.**

**Informe (documento de continuidad del proyecto):** `docs/auditorias/AUDITORIA-CIERRE-2026-07.md` — cumplimiento sección por sección con evidencia, 26 hallazgos C-xx (2 sev-4 de comportamiento nuevos: `os-commercial.ts:68-76` no limpia `nextFollowUpAt` al agotarse la cadencia → lead muerto eterno en el foco; `posicionDe` no contempla status PERDIDO → el manual deriva vivo un negocio cerrado), 10 propuestas PR-x con checklist de guardarraíles saldado, diseño de PRE (4 pantallas, insumo Bloque 8), y el backlog único: **40 ítems = 3 P1 (con ficha ejecutable) · 10 P2 (ídem) · 17 P3 · 10 DECISIÓN-Franco**, con orden de ataque y dependencias.

**Nota metodológica.** La vara (`docs/brief-vision-flujo-setter.md` v2.1) sigue sin existir en el repo — reconstruida desde AUD-1 + la instrucción + esta bitácora; confirmar con Franco dónde vive el archivo (pendiente que arrastran 7.0/7.3).

**Queda para humano: todo.** Nada del backlog se ejecuta desde acá; es insumo de decisión de Franco. La decisión más urgente no es código: cargar las 4 URLs de `herramientas.ts` (§12.3) destraba la ejecutabilidad real de ~11 pantallas.

**PROYECTO DE REDISEÑO: CERRADO CON AUDITORÍA ESPEJO.** AUD-1 (2026-07-02, midió el gap) → Bloques 2–7 (lo cerraron) → AUD-2 (2026-07-07, verificó el cierre y dejó marcado el camino).

---

## Sprint 1.1 — Una sola lengua: barrido de vocabulario del wizard muerto (B-03/C-04/C-15) · 2026-07-09

**Qué se hizo.** Sprint de SOLO STRINGS sobre el hallazgo de AUD-2: "vocabulario muerto del wizard en el copy más visible" (numeración "Paso N" y jerga técnica — draft, self-check, follow-up, hard-block, dossier, pipeline, warm-up, trigger, sheet, flag, ratio, glassmorphism, "Booking Cal.com", "Vio el video", "Entra frío, en ficha" — sobreviviendo en copy que el setter lee, aunque el wizard ya no existe desde el corte 5.6). Censo por grep sobre la superficie del setter → clasificación en 3 clases (copy que el setter LEE / payloads-munición para IA, intocados / interno) → barrido solo de clase 1, mapeando cada "Paso N" contra el registro `PANTALLAS` de `manual.ts` como diccionario canónico. Cero cambios de lógica, cero archivos nuevos, cero migraciones.

- **72 strings, 18 archivos** (`git diff --stat`): `flow.ts` (proximaAccion) · `flow-content.ts` (arreglos de hard-blocks → obligatorios, soft-check glassmorphism, STATUS_LABELS.VIO_VIDEO) · `herramientas.ts` (dondeSeUsa sin numeración paralela, veredicto del Evaluador) · `guidance-content.ts` (títulos de las 4 guías con "Paso N —", draft→borrador, self-check→chequeo final, trigger/round-trip/sheet/flag en criollo) · `manual.ts` (3 bajadas del registro) · `paso.ts` (detalle del cartel "Tu paso ahora" — no estaba en la lista original, sumado porque comparte el mismo patrón que `flow.ts:proximaAccion` y sin tocarlo el grep de éxito no cerraba) · `dossier.actions.ts`/`dossier.schemas.ts`/`outreach.actions.ts` (mensajes `fail()`/validación Zod — más allá de la línea 382 confirmada, el mismo archivo tenía 5 hits hermanos de draft/self-check/dossier en otros `fail()`) · 8 componentes (`seguimiento-form`, `m5-seguimiento`, `m16-agenda`, `canal-seguridad`, `ejemplo-ideal`, `mis-numeros`, `escalar-modal`, `nuevo-prospecto-form` + `nuevo/page.tsx` hermano).
- **Mapeo de "Paso N" → pantalla:** resuelto contra `PANTALLAS`/`FASES_MANUAL` caso por caso (no a ciegas): Paso 1→Ficha, Paso 2→Evaluación, Paso 3→Brief, Paso 4→Construcción, Paso 5→Borrador, Paso 6→Chequeo final, Paso 7→Opener, Paso 9→Seguimiento **o** Envío según el contexto (el wizard viejo combinaba ambos en un mismo paso; el manual los separó en m5/m15 — se resolvió cada cita por lo que efectivamente señala, no por el número), Paso 10→Agenda.
- **Casos con juicio propio (documentados, no a ciegas):** `VIO_VIDEO` → `'En conversación'` (el status legacy referenciaba un paso de video que el flujo actual no tiene; sin label real que aplique, se neutralizó, tal como habilitaba la instrucción) · `'flag'` suelto → se lo dejó reformulado como `'flag de diseño'` (el compuesto ya es vocabulario establecido — `SOFT_CHECKS`/`m14-chequeo.tsx` — a diferencia del término suelto) · `dossier` → se reformuló solo en los 2 puntos donde era clase-1 evidente (`manual.ts:158`, `dossier.actions.ts` "Este dossier no tiene correcciones" → "Este lead...").

**Greps de éxito (post-barrido):**
- `Paso [0-9]` sobre `setter/**` + `lib/leados/**` → **0 hits en copy visible**; todos los restantes son comentarios `/** */`/`//` (JSDoc, referencias internas a archivos/sprints) — clase 3, exentos por regla.
- `draft|self-check|follow-up|pipeline|hard-block` sobre strings user-facing → **0 hits** tras 3 rondas de grep (una con `['"\`]...['"\`]` para aislar literales de comentarios); lo que sobrevive es: comentarios, nombres de campo/tipo (`draftUrl` como key), specs/invariantes (`*.invariant.ts`, `self-check-gate.invariant.ts`) y `notify.ts` (mensaje de Telegram a **Franco**, no al setter — fuera del alcance "copy que el setter lee"). `dossier.ts` intacto por regla explícita (frozen, ni strings).
- `-i caliente` → sobrevive solo el badge operativo ("Caliente" en `foco-surface.tsx`/`home-sections.tsx`/`manual-nav.tsx`) y su guardrail (Franco marcándolo, gates que lo leen); los 3 hints de `guidance-content.ts:347,351,374` quedaron intactos (otro sprint, según instrucción).

**Casos dudosos, NO tocados (frontera, anotados con archivo:línea):**
1. `evaluacion-form.tsx:42` (`CALIENTE: 'Caliente'`) — el propio comentario del archivo (línea 31) documenta que conserva el label histórico "como testigo" de una suite vieja; no está claro si el componente sigue vivo post-corte-5.6 (el reemplazo parece ser `m3-veredicto.tsx`, que ya dice "Avanzar con prioridad"). Determinar vivo/muerto es una pregunta de arquitectura, no de vocabulario — fuera de este sprint.
2. `novedades.ts:60` — `"...es el momento caliente"` usa "caliente" como modismo de urgencia (no el campo operativo de Franco); technically viola la letra del grep 3 pero es un uso idiomático distinto, no el vocabulario de wizard que este sprint ataca.
3. `m14-chequeo.tsx:57` — la línea confirmada en el encargo no tenía jerga en el estado actual del archivo (ya decía "Publicá el borrador (paso anterior)..." sin número ni término técnico); no se tocó nada ahí. Puede que el número de línea original referenciara un estado previo del archivo.

**Verde:**
- ✅ `npx tsc --noEmit` → 0 errores en todo archivo tocado por este sprint. (El comando global mostró errores en `src/modules/motor/**` y `tests/integration/motor-*.spec.ts` — el lane paralelo de BSP-outbound activo en simultáneo, con archivos `??`/`M` ajenos al scope de este sprint desde `git status` de Fase 0; cero relación con este diff, cero archivo de `setter`/`leados` involucrado.)
- ✅ `npm run test:leados` → **22/22**.
- ✅ `npm run test:setter` → **39/39** (3.8m) — ningún spec assertaba contra las strings viejas, así que no hizo falta actualizar ninguno.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 1.1: cerró verde. (1) 72 strings / 18 archivos. (2) Los 3 greps de éxito dan 0 hits en copy visible (solo sobreviven comentarios/tests/payloads-munición/campos internos, todos exentos por regla). (3) tsc limpio en el diff propio (motor ajeno rojo por el lane paralelo, no tocado) · test:leados 22/22 · test:setter 39/39, sin specs que actualizar. (4) 3 casos frontera documentados arriba, ninguno tocado. (5) Terreno raro: el `npx tsc --noEmit` global pasó de verde (Fase 0) a rojo-en-motor durante la sesión — otra sesión (BSP-outbound) escribiendo en paralelo sobre `src/modules/motor/**`, confirmado por `git status` (archivos ajenos, prohibidos por el encargo). Commit local hecho, sin push.

---

## Sprint R — Recuperación de terreno del lane LeadOS · 2026-07-11

**Por qué.** Tres sesiones frenaron en Fase 0 con diagnósticos contradictorios sobre el mismo índice: no se sabía si el Sprint 1.1 ("una sola lengua", ~72 strings/19 archivos del setter) seguía absorbido en el commit ajeno `44e25be`, si un reset lo había deshecho a medias, o si lo staged era ruido CRLF por worktrees. Sprint R: forense read-only primero, acción por árbol de decisión pre-autorizado después. Nada se pusheó, nada se borró del working tree.

**El diagnóstico real (forense Fase 1):**
- **Rama/worktree:** `b1-s2-bsp-outbound` en el worktree principal `C:/Users/franc/Desktop/PorfolioDevelOP`. (Otras 4 worktrees vivas — 2 sesiones setter paralelas en `claude/priceless-nobel` [`seguimiento-step.tsx`] y `claude/sad-burnell` [`01-flow.spec.ts`], `chore/auditoria-maestra`, y una detached — ninguna toca los 19 archivos de 1.1; solo se miraron.)
- **`44e25be` existe pero está HUÉRFANO:** `git branch --contains 44e25be` → vacío. Un reset movió el puntero de la rama y lo dejó fuera de toda historia. Su **mensaje** es de isolation ("fix(isolation): re-parenting de CrmSyncAttempt"), pero su **diff** es en realidad el barrido de vocabulario de 1.1 sobre los 19 archivos (setter/leados + esta bitácora) — el 1.1 quedó absorbido bajo un mensaje ajeno, y el reset lo devolvió al índice.
- **1.1 NO estaba en la historia:** HEAD (`58eb285`) conservaba la copy vieja ("Paso 9", "draft", "self-check", "follow-up" en los literales `proximaAccion` de `flow.ts`, etc.).
- **Lo staged = 1.1 real, byte-idéntico a `44e25be`:** `diff` entre `git diff --cached` y `git show 44e25be` → vacío (EXIT 0). Copy real (strings), **no CRLF** — insertions/deletions asimétricas (100/72), bitácora +28/-0. `core.autocrlf=true` y existe `logic-core-v3/.gitattributes`, pero el diff no era renormalización de fin de línea.
- **(d) El isolation fix del lane BSP está ENTERO en HEAD:** `src/lib/isolation/registry.ts:450` incluye `...CRM_SYNC_ATTEMPT_REPARENT` en `forbiddenUpdateKeys` (guard runtime = Omit del tipo), entró vía `aa176f7` (B0). `0216bf8` (el commit del fix en el lane b1-s1) no es ancestro de esta rama, pero el guard llegó por otra vía y está presente. El fix no dependía de `44e25be`.

**Caso del árbol aplicado: CASO B** — 1.1 no en la historia + lo staged son los cambios reales de 1.1.
- Verificación previa: `npx tsc --noEmit` → EXIT 0 (programa entero limpio, motor incluido — hoy el lane motor typechea verde). Greps de éxito sobre lo staged: 0 hits de "Paso N"/jerga en copy user-facing de los 19 archivos; todo el residuo es clase-exenta por la regla de 1.1 (comentarios `/** */`//`, paths de import `follow-up`, keys de tipo `| 'draft'`, y `dossier.ts`/`notify.ts`/`*.invariant.ts` fuera de scope).
- `git diff --cached --name-only`: **0 archivos del lane motor staged** — nada que des-stagear.
- Commit (solo staged, sin `-a`, con guarda anti-carrera de índice compartido verificando el set antes/después): **`612c4ee`** — "sprint 1.1 — una sola lengua…", 19 files, 100/72 (idéntico a `44e25be`). `motor-files-captured=0`.
- **CRLF:** `core.autocrlf=true` en este worktree + `logic-core-v3/.gitattributes` presente. NO fue la causa del diff staged (era copy real). NO se renormalizó el repo — eso queda como decisión de Franco.

**Estado final:**
- Working tree zona setter LIMPIO. Sucio permitido, listado (lane motor/test/audit): `chatbot-isolation.spec.ts`, `tests/*/.last-run.json` (×3), `?? audit/`, `?? docs/audit-chatbot-runtime.md`.
- `npx tsc --noEmit` → verde. `git log`: `612c4ee` (1.1) sobre `58eb285` (B1-S3). Grep de éxito sobre HEAD: 0 `proximaAccion: '…Paso N'` en `flow.ts`.

**BASE DECLARADA DEL LANE LeadOS:** worktree `C:/Users/franc/Desktop/PorfolioDevelOP`, rama **`b1-s2-bsp-outbound`**. De acá en más, los sprints de LeadOS corren SOLO en esta rama+worktree (donde ahora vive 1.1 = `612c4ee`). Nota de contexto para Franco: esta rama arrastra también los commits del lane motor (B1-S1/S2/S3); 1.1 quedó apilado encima. La separación de lanes en ramas distintas, si se quiere, es decisión de Franco — no se ejecutó desde acá.

---

## Sprint T — Terreno verde: main typechea de nuevo · 2026-07-17

**Qué rompía main.** `src/app/api/cron/cleanup-old-events/route.ts` exportaba `getProvidedCronSecret` (un `export function` extra, además de `GET` + `dynamic`). Next solo permite exports de handlers/config en un `route.ts`; el export no-handler rompe el typecheck de los tipos generados en `.next/types/.../route.ts` con un **TS2344** durante `next build`. Con eso, `main` (tip `62994be`) no buildeaba. La función estaba exportada a propósito para que el invariant de auth (`__tests__/cleanup-old-events-auth.invariant.ts`) testeara la extracción del secret sin invocar el camino feliz de `GET` (que pega a DB real).

**El fix (diff mínimo, un objetivo).** Se movió `getProvidedCronSecret` **verbatim** (misma firma, mismo cuerpo — solo usa `Request` global, sin imports nuevos) a un módulo hermano `cron-secret.ts`. `route.ts` ahora importa `{ getProvidedCronSecret } from './cron-secret'` y exporta **solo** `dynamic` + `GET`. El invariant re-apunta únicamente ese import (`getProvidedCronSecret` desde `../cron-secret`, `GET` sigue desde `../route`) — ninguna aserción cambió. **NO** se unificaron los 4 crons en un helper compartido (los otros 3 `route.ts` con la misma duplicación quedan intactos — dedupe fuera de este sprint). 3 archivos tocados: `route.ts`, `cron-secret.ts` (nuevo), el invariant.

**Verde (proxy — el build autoritativo es de Franco):**
- ✅ Prueba source-level (la más fuerte sin build): grep de exports en `route.ts` → solo `dynamic` (config) y `GET` (handler). Ningún export no-handler → el TS2344 no se puede regenerar.
- ✅ `tsc --noEmit` sobre fuente → **EXIT 0**, 0 errores (worktree limpio sin `.next/types`, que es exactamente "tsc sobre fuente").
- ✅ Invariant `npm run test:t02` → **10/10 aserciones**, EXIT 0.
- ✅ `git diff --cached --name-only` = los 3 archivos del scope, nada más.

**Terreno / aislamiento.** El worktree principal estaba en `b2-s1-bot-sync-surface` (no `main`, aunque = `62994be`) con WIP ajeno de chatbot en el árbol (`handleChatRequest.ts` modificado + `channels.ts`/`core.ts`/`timing.ts` untracked, mutándose en vivo desde una sesión paralela). Para no correr carreras de índice compartido ni pisar ese WIP, el Sprint T se ejecutó en un **worktree aislado sobre `main`** (`C:/tmp/wt-sprint-t`, `node_modules` via junction al principal). El commit **`d0e8ef4`** aterriza en la rama `main`; el worktree principal quedó restaurado a `b2-s1` intacto.

**FALTA para cerrar autoritativamente:** el `next build` de Franco sobre `main` (`d0e8ef4`). El proxy (source-level + tsc + invariant) es fuerte, pero el TS2344 solo se materializa/desaparece con los tipos que genera `next build` — esa es la verificación final. Sin push.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint T: main verde (proxy). (1) tsc EXIT 0 sobre fuente. (2) `route.ts` sin exports no-handler (solo `GET`+`dynamic`) → TS2344 no regenera. (3) invariant t02 10/10. (4) diff = 3 archivos exactos (`route.ts`/`cron-secret.ts`/invariant). (5) commit `d0e8ef4` en `main`, aislado en `C:/tmp/wt-sprint-t` para no tocar el WIP de chatbot del worktree principal (`b2-s1`). (6) Pendiente: `next build` de Franco = cierre autoritativo. Sin push.

---

## Sprint 2.1 — El foco no miente: cadencia agotada, postergado y rechazado salen del loop · 2026-07-17

**Objetivo único.** Cortar los tres loops que hacían que el foco sirviera leads muertos como *trabajo*. Motor-adyacente → test-primero, frenos duros, diff acotado.

**Terreno (FASE 0).** El worktree principal estaba en `b2-s1-bot-sync-surface` (rama del chatbot) con WIP untracked ajeno (`scripts/dev/sandbox-360-seed-channel.ts`) y SIN el fix del cron `d0e8ef4` — base vieja. FRENO reportado; Franco autorizó dejar el WIP intacto y proceder. Cambié el checkout a **`main@1866d07`** (ningún worktree tenía main tomado; el sandbox untracked sobrevive el switch). Verde de arranque: `tsc --noEmit` EXIT 0, `flow.ts` sin copy "Paso N" (1.1 presente), `d0e8ef4` en el log.

**Censo de callers (`registrarContactoComercial`).** 4: 1 admin (`activity.actions.ts:18` — surface-a `error.message` crudo), 2 setter (`outreach.actions.ts:120` opener / `:176` resultado), 1 setter (`agenda.actions.ts:216`, usa `CALL_AGENDADA` → el nuevo comportamiento no lo afecta). Los lectores admin de `nextFollowUpAt` (`lead-card.tsx:52`, `lead-activity-feed.tsx:114`) YA son null-safe → limpiar a null es compatible. `ownership.ts` (motor intocable) solo expone `_count.activities`, no el conteo SIN_RESPUESTA → el discriminador de "enfriado" sale de `nextFollowUpAt === null`.

**Auditoría desfasada.** Las line-refs del brief (`os-commercial.ts:78-96,162-172`) NO matcheaban: esas líneas son RESPONDIO/`postergarLead`; `registrarContacto` no manejaba RECHAZADO/POSTERGADO. Se mapeó el terreno real antes de tocar.

**Dos decisiones (Franco delegó "decide tu" → elegí lo que NO obliga a inventar semántica de status):**
- **Caso B (postergado):** "vuelve al ciclo normal" exigiría una transición POSTERGADO→working que no existe en `os-commercial` (FRENO 1). Elegí **limpiar solo `reactivateAt`** (sin transición): el lead sale de la cola de trabajo (`postergadoVencido=false` → `seguimiento`), el loop se corta. **Limitación conocida:** el lead queda POSTERGADO pasivo y NO reanuda la cadencia de outreach (la rama POSTERGADO tapa el toque); un resume real necesita la transición que Franco decida. Gap cosmético: la copy `flow.ts:404` "se retoma cuando se reactive" es imprecisa para un postergado con `reactivateAt` null (no se tocó para no romper `flow.invariant.ts:77`, fuera del diff).
- **Rebota del 5º SIN_RESPUESTA:** **idempotente, sin throw** — el fix C-02 ya deja `nextFollowUpAt=null` (calculateNextFollowUp(≥4)=null) y la UI M5 ya oculta "no respondió" cuando la cadencia se agotó. Cero copy nueva, sin la inconsistencia admin/setter del `mapError`, diff en 3 archivos.

**El fix (3 archivos, todo dentro del scope):**
1. **`os-commercial.ts` (C-02):** en `registrarContactoComercial`, la rama SIN_RESPUESTA ahora ESCRIBE siempre (`nextFollowUpAt` = valor o null) — antes `if (nextFollowUpAt)` dejaba el date viejo al agotarse → vencido eterno → "trabajar" para siempre.
2. **`os-commercial.ts` (B-01):** todo contacto real (SIN_RESPUESTA/RESPONDIO/CALL_AGENDADA/RECHAZADO) limpia además `reactivateAt` (el retomar corta el loop del postergado vencido). Status intacto.
3. **`os-commercial.ts` (C-11):** rama RECHAZADO nueva → limpia `nextFollowUpAt` + `reactivateAt`. No cambia status (no existe `LeadStatus.RECHAZADO`): el cierre a PERDIDO lo decide Franco.
4. **`home.ts` + `flow.ts`:** señal nueva `sinProximoToque?` (= `nextFollowUpAt === null`, pura) derivada en `buildHomeLeads`; `proximaAccionPara` (rama EVALUADA gate-cerrado) la usa para el rótulo **"Se enfría — el cierre lo decide Franco"** (no accionable), distinto de "Esperando respuesta" (toque futuro). `grupoPara` NO se tocó: el enfriado ya cae en `seguimiento` sin followUpVencido. Campo opcional a propósito (ausente = sin refinamiento) para no editar los 3 invariantes fuera del diff.

**Tests (in-process, camino owned via `listOwnedLeads` → `buildHomeLeads`, maquinaria real).** `tests/leados/foco-no-miente.spec.ts`, 3 casos A/B/C. **Rojo→verde confirmado:** los 3 fallaban pre-fix exactamente en las aserciones core (A/C: `nextFollowUpAt` no-null; B: `reactivateAt` en pasado + precondición `grupo==='trabajar'`); verdes post-fix.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0 (main entero).
- ✅ `check:invariants` (cadena leados, incl. flow/foco/particion) EXIT 0.
- ✅ `test:leados` **25/25** (22 previos + 3 nuevos), incluidos los de aislamiento cross-setter.
- ⚠️ `test:setter` **38/39**. El 1 rojo (`01-flow.spec.ts:229`) es **pre-existente y ajeno**: espera la copy vieja "Ver ejemplo de un self-check bien hecho", pero `ejemplo-ideal.tsx:106` renderiza "…de un **chequeo final** bien hecho" (renombrada en otro sprint sin actualizar el spec). **Confirmado contra main limpio** (stash de mis 3 archivos → falla idéntico). Fuera de scope 2.1 → anotado, no tocado.

**Diff:** SOLO `os-commercial.ts`, `flow.ts`, `home.ts`, `tests/leados/foco-no-miente.spec.ts` (nuevo), esta bitácora. El WIP untracked de chatbot (`sandbox-360-seed-channel.ts`) quedó intacto y fuera del commit.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 2.1 cerrado. (1) Censo: 4 callers, admin null-safe → compatible; agenda usa CALL_AGENDADA (no afectado). (2) A/B/C rojo→verde. (3) Suites: tsc EXIT 0, invariantes verdes, test:leados 25/25; test:setter 38/39 (el rojo = spec stale pre-existente, confirmado en main limpio, ajeno). (4) Diff = 3 archivos + test nuevo + bitácora. (5) Frenos: auditoría desfasada (line-refs); Caso B "vuelve al ciclo normal" = transición → elegí limpiar solo reactivateAt (sin transición; resume real queda a decisión tuya); rebota = idempotente (sin tocar el action del setter). No se tocó 01-flow.spec.ts (ningún spec asertaba el CTA viejo del agotado). Sin push.

---

## Sprint 2.2 — M5 agotada: el fin de la cadencia se vuelve estructura, no texto · 2026-07-17

**Objetivo único.** Con la cadencia agotada, el form de M5 deja de ofrecer "No respondió" y el contador deja de poder decir "4 de 3". Motor intocable — solo componentes; el guard server-side ya quedó en 2.1.

**Derivación de `cadenciaAgotada`.** La misma maquinaria del contexto (`cadenciaInfo`, `flow.ts`), no un cálculo propio. `page.tsx` pasa `manual.followUpCount` a `M5Registro`; `M5Registro` deriva `cadenciaInfo(followUpCount).agotada` y se lo pasa a `SeguimientoForm` como prop `cadenciaAgotada: boolean`. Con `true`, el form filtra `SIN_RESPUESTA` de las opciones y suma una línea de motivo en criollo ("Los 3 toques ya se cumplieron — si no respondió, se enfría solo."); con `false`, el form completo (4 opciones) igual que antes. El contador de `M5Contexto` (`{cadencia.toquesHechos} de {PLANTILLAS_FOLLOW_UP.length}`) pasa por `Math.min(...)` — nunca puede leer "4 de 3".

**Spec nuevo — `tests/setter/08-m5-cadencia-agotada.spec.ts`.** Mismo patrón de aterrizaje en m5 que `scripts/dev/qa-manual-m5-m16.ts` (stage EVALUADA + contactos SIN_RESPUESTA + toque vencido o cadencia agotada), pero con leads namespaced propios (`createLead`/`registerActivity` de `setter-db.ts`, teardown por id exacto — no reutiliza el seed QA compartido). Dos casos reales contra DB+build, no mocks: (1) `cadenciaAgotada=true` (4 SIN_RESPUESTA, `nextFollowUpAt=null`) → asierta que "No respondió — mandé un toque" NO está (`toHaveCount(0)`), las otras 3 opciones sí, el contador muestra "3 de 3" (nunca "4 de 3"), y la línea de motivo aparece. (2) `cadenciaAgotada=false` (2 SIN_RESPUESTA, toque vencido) → asierta las 4 opciones completas y "1 de 3". **Trampa detectada y corregida:** la 1ª corrida contra `start:qa` (sirve el `.next` existente, NO rebuildea) dio falso-rojo con el cambio real aplicado — `npm run build` antes de correr el spec fue necesario para que el server QA reflejara el código nuevo.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0 (antes y después del cambio).
- ✅ `test:setter` **41/41** (39 previos + 2 del spec nuevo). Nota: el rojo pre-existente de `01-flow.spec.ts:229` (documentado en 2.1, ajeno) ya NO aparece — otra sesión en paralelo corrigió esa copy en el working tree (cambio no mío, no commiteado desde acá, fuera de este diff).
- ✅ `test:leados` **25/25**, sin regresión.

**Diff:** `page.tsx` (pasa `followUpCount` a `M5Registro`), `m5-seguimiento.tsx` (`M5Registro` deriva `cadenciaAgotada`; contador con `Math.min`), `seguimiento-form.tsx` (prop `cadenciaAgotada`, filtra opciones, línea de motivo), `tests/setter/08-m5-cadencia-agotada.spec.ts` (nuevo), esta bitácora. `01-flow.spec.ts` (WIP ajeno, uncommitted) y `scripts/dev/sandbox-360-seed-channel.ts` (untracked ajeno) quedaron fuera del stage.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 2.2 cerrado. (1) `cadenciaAgotada` = `cadenciaInfo(followUpCount).agotada`, followUpCount enhebrado desde `manual.followUpCount` (misma maquinaria de 2.1/`flow.ts`, sin cálculo propio). (2) Spec nuevo `08-m5-cadencia-agotada.spec.ts`: 2 casos e2e reales (agotada oculta SIN_RESPUESTA + contador clampa + motivo; viva = form completo), landing en m5 por el mismo patrón del seed QA. (3) Suites: tsc EXIT 0, test:setter 41/41, test:leados 25/25. (4) Diff = 3 componentes + spec nuevo + bitácora. (5) Freno resuelto: `start:qa` no rebuildea solo — hubo que correr `npm run build` antes de validar el spec, si no da falso-rojo. `01-flow.spec.ts` con WIP ajeno detectado y dejado fuera del commit (índice compartido). Sin push.

---

## Sprint 2.3 — Los terminales derivan a archivo, no a trabajo · 2026-07-17

**Objetivo único.** Un lead terminal deja de derivar como vivo: PERDIDO ya no abre m5 pidiendo contactar un negocio muerto, y DESCARTADA deja de pintar el cyan "Tu paso ahora". `posicionDe` (derivación de presentación, mi zona) — motor intocable.

**Censo de terminales (lo define el código, no la instrucción).** Dos ejes:
- **Archivo (predicado canónico del home, `flow.ts:375`):** `status === 'PERDIDO' || stage === 'DESCARTADA'`. `ArchivoCausa = 'descartado' | 'perdido'` (`flow.ts:667`) + `archivoMotivo` (motivo persistido: DESCARTADA→`evaluacion.motivoDescarte`; PERDIDO→`agenda.resultado.nota`).
- **Status-terminal (`revision.ts:27`):** `['CERRADO', 'PERDIDO']`. **CERRADO = GANADO** (cae en m16, la reunión) — NO es archivo. Por eso la rama de pantalla es **solo PERDIDO**: un cierre exitoso no se manda a una vista de "perdido/descartado" (mislabel). DESCARTADA (terminal por STAGE) ya tenía su case (m3, veredicto a la vista) y se queda ahí — su cyan lo apaga C-17, no la derivación.

**El fix (5 archivos + spec + invariante):**
1. **`manual.ts` (B-02):** `PANTALLA_IDS`/`PANTALLAS` suman `archivo` (tipo `estado`, como espera/revisión). Rama temprana en `posicionDe`: `if (status === 'PERDIDO') return { actual: 'archivo', habilitadas: [] }` — ANTES del `switch(stage)`, así un PERDIDO en cualquier stage vivo (EVALUADA/APROBADA/…) no cae en m5/espera. El never-guard del switch queda **intacto** (la rama solo saltea la derivación por stage para este status; la exhaustividad sobre stages sigue cubriendo a los no-terminales).
2. **`archivo-manual.tsx` (nuevo):** la vista de archivo, espejo de `EstadoManual` pero de cierre — tono zinc, cero forms, cero toque. Muestra causa (`Archivo — Perdido`), título, motivo persistido si lo hay, y CTA único "Seguí con el próximo" → `/setter`.
3. **`page.tsx` ([paso]):** la rama `pantalla.tipo === 'estado'` (que el PROBE señaló como "dónde encaja la vista de archivo") ahora bifurca: `archivo` → `<ArchivoManual>` con causa/motivo derivados por la MISMA regla que `archivoMotivo`; espera/revisión → `EstadoManual` como antes.
4. **`pantalla-manual.tsx` (C-17):** el cyan (marco + badge "Tu paso ahora" + indicador de fase) se gatea con `esPasoActivo = esActual && habilitadas.length > 0`. Un `actual` con `habilitadas` vacía (DESCARTADA en m3, agendada en m16) es terminal → tono zinc, sin cyan. `!esActual` (salida "Ir a tu paso") intacto.
5. **`outreach.actions.ts` (B-02, aditivo):** guard al inicio de `registrarResultado` — `if (!leadActivo(lead.status)) return fail('Este negocio ya está cerrado — seguí con el próximo')`. Reusa `leadActivo` (`revision.ts`, cubre CERRADO+PERDIDO). Endurece, no habilita: rebota antes de tocar nada; el manual ya no ofrece m5 para estos, pero la action no confía en la UI.

**Tests.**
- **Invariante nuevo `manual.invariant.ts` (puro, sin DB, wired en `check:invariants`):** PERDIDO en 5 stages → `actual='archivo'`, `!habilitadas.includes('m5')`, `habilitadas === ['archivo']` (nada de trabajo alcanzable). Regresiones: mismo stage con status vivo → sigue m5 (no archivo); DESCARTADA → m3 `[]` (no re-ruteada); CERRADO+APROBADA → m16 (el archivo es exclusivo del perdido).
- **Spec de render nuevo `09-archivo-terminal.spec.ts` (setter, DB+build real):** PERDIDO sembrado en EVALUADA con opener+toque vencido (el caso que ANTES caía en m5) → `/manual` redirige a `/manual/archivo`, muestra "Archivo — Perdido" + "Este negocio quedó cerrado" + CTA, y **cero** opciones de toque; el guard rebota `/manual/m5` a `/manual/archivo`.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17** (16 previos + `manual`).
- ✅ `npm run build` EXIT 0; `prisma migrate status` up-to-date.
- ✅ `test:leados` **25/25** (motor intacto, no se tocó).
- ✅ `test:setter` **43/43** (41 previos + 2 nuevos). El B9 (`01-flow:314`, DESCARTADA→veredicto) sigue verde → C-17 no rompió DESCARTADA.

**`01-flow.spec.ts` (lo edita `sad-burnell` en paralelo).** NO lo toqué. Su WIP uncommitted es exactamente el fix de copy que 2.1 dejó anotado (`self-check`→`chequeo final`, línea 229) — por eso el B6 pasó en mi corrida (su fix del working-tree ya aplicado). Delta de aserciones mío sobre ese archivo: **cero**.

**Diff:** `manual.ts`, `pantalla-manual.tsx`, `archivo-manual.tsx` (nuevo), `[paso]/page.tsx`, `outreach.actions.ts`, `manual.invariant.ts` (nuevo), `package.json` (registra el invariante), `09-archivo-terminal.spec.ts` (nuevo), esta bitácora. `01-flow.spec.ts` (WIP ajeno) y `scripts/dev/sandbox-360-seed-channel.ts` (untracked ajeno) fuera del stage.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 2.3 cerrado. (1) Terminales censados: archivo = `PERDIDO ∨ DESCARTADA` (`flow.ts:375`); rama de pantalla solo PERDIDO (CERRADO=ganado→m16; DESCARTADA→m3 ya existía). (2) Rama temprana en `posicionDe` ANTES del switch, never-guard **intacto**. (3) Suites: tsc EXIT 0, invariantes 17/17 (nuevo `manual.invariant`), build EXIT 0, test:leados 25/25, test:setter 43/43 (spec nuevo `09-archivo-terminal` + render-check real). (4) Diff = 5 archivos + componente/invariante/spec nuevos + package.json (registro) + bitácora. (5) Frenos: page.tsx y package.json quedaron fuera de la lista literal del DoD pero son wiring necesario (el PROBE mandó a page.tsx; el invariante hay que registrarlo para que corra en la suite) — flagueado. `01-flow.spec.ts` intacto (delta de aserciones = 0). Pase visual del archivo: **Franco**. Sin push.

---

## Sprint 3.1 — Caliente vuelve a ser solo de Franco: hints, ícono del veredicto y modismo · 2026-07-22

**Objetivo único.** `caliente` deja de existir en la voz del setter y queda reservada al badge operativo de Franco. Continuación del barrido de vocabulario de 1.1. Solo strings y presentación — motor, campo `OsLead.caliente`, `esCaliente()`, `SCORE_CALIENTE`, `gateBriefAbierto`, `ordenarCola` y el badge visual (`manual-nav.tsx`, `foco-surface.tsx`, `home-sections.tsx`) intocables.

**FASE 0 — hallazgo previo al censo.** `git status --porcelain` dio limpio (sin el WIP uncommitted que 2.2/2.3 documentaron): la sesión paralela que traía el fix `self-check`→`chequeo final` en `01-flow.spec.ts:229` no lo dejó commiteado y se perdió — HEAD volvió a tener la copy vieja. `test:setter` lo confirmó rojo (B6). Reconciliado como primer commit aparte (`b468ec6`, mensaje exacto del protocolo), antes de tocar nada de `caliente`. Continuidad de B2 verificada (`aed017e`/`7425d2b`/`b844208` en el log). `tsc --noEmit` EXIT 0.

**Censo (`grep -rn -i "caliente" src/lib/leados/ "src/app/(protected)/setter/"`, ~140 hits).** Clasificación:
- **(i) Campo/badge de Franco y su guardrail — exento:** `OsLead.caliente`, `esCaliente()`, `SCORE_CALIENTE`, `gateBriefAbierto`, `ordenarCola`, `posicionDe`/`ordenFoco`, el badge "Caliente" en `manual-nav.tsx:90`, `foco-surface.tsx:161`, `home-sections.tsx:81`, y las notificaciones internas a Franco (`notify.ts`) — no las lee el setter.
- **(ii) Copy que lee el setter — se barrió:** 6 strings en `guidance-content.ts` (347, 351, 374, 441, 823, 840 — hints del Evaluador y del gate del brief/envío) + ícono/tono del veredicto alto y el label default en `evaluacion-form.tsx` (42, 309-312) + el modismo de `novedades.ts:60`.
- **(iii) Comentarios/JSDoc/keys/tests — exento:** el resto (`VEREDICTO_VALUES`, `calienteNotificadaAt`, comentarios explicativos en `flow.ts`/`revision.ts`/`dossier.ts`/`isolation.ts`/invariantes/tests). Actualicé además 2 comentarios en `evaluacion-form.tsx` que quedaban inexactos tras el cambio del default (mencionaban labels "históricos" del wizard, que ya no existe desde 5.6).
- **Fronterizo NO tocado (flagueado a Franco):** `paso.ts:181` ("El link se libera... o si el lead fuera caliente") es copy que lee el setter y usa la palabra reservada, pero cae fuera de los 4 ítems explícitos de la tarea y del diff-stat pedido en el DoD — lo dejé intacto por disciplina de scope. Queda como candidato a un futuro sprint chico si Franco quiere el barrido 100% completo.

**Los 3 cambios:**
1. **Hints (`guidance-content.ts`):** "4–5 marca el lead como caliente" → "4–5 sugiere avanzar con prioridad"; "Descartar, Avanzar o Caliente" → "Descartar, Avanzar o Avanzar con prioridad"; "4–5 es caliente" → "4–5 sugiere avanzar con prioridad"; "si Franco lo marca caliente" → "si Franco le da prioridad"; el bloque `enfasis: 'caliente'` del camino preventivo → `enfasis: 'priorizado por Franco'`; "si el lead fuera caliente" → "si Franco le dio prioridad".
2. **Ícono/tono del veredicto alto (`evaluacion-form.tsx`, `EvaluacionResumen`):** `Flame` + `amber` (idéntico al badge de Franco) → `Star` + `violet` (token ya existente en `Badge.tsx`). Identidad propia para que el setter no confunda "el Evaluador sugiere" con "Franco marcó caliente".
3. **Label muerto (`VEREDICTO_LABELS.CALIENTE`):** `'Caliente'` → `'Avanzar con prioridad'`. Red de seguridad si algo renderiza sin `textos` — no se tocó la API del componente ni se borró la constante.
4. **Modismo (`novedades.ts:60`):** "es el momento caliente" → "recién aprobada", conservando la urgencia.

**Grep de éxito:** `grep -rn -i "caliente" src/lib/leados/ "src/app/(protected)/setter/"` → único hit de copy visible restante es `paso.ts:181` (fronterizo, flagueado arriba, no tocado); todo lo demás son badge/campo de Franco, comentarios, keys y tests.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **43/43** (dos rojos de la primera corrida — B3-opener y F4-mobile-drawer — confirmados flaky en aislado y verdes en la corrida limpia siguiente; sin relación con `caliente`).

**Diff:** `guidance-content.ts`, `evaluacion-form.tsx`, `novedades.ts`, `tests/setter/01-flow.spec.ts` (commit aparte, deuda de 1.1), esta bitácora. `docs/probe-01-censo-cosecha.md` (untracked, WIP de otra sesión paralela) quedó fuera del stage.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 3.1 cerrado. (1) Censo ~140 hits: (i) badge/campo de Franco exento, (ii) 9 hits de copy barridos, (iii) comentarios/keys/tests exentos. (2) Se barrió: 6 hints del Evaluador/gate + ícono `Flame→Star`/tono `amber→violet` del veredicto alto + label muerto `CALIENTE→'Avanzar con prioridad'` + modismo de novedades. (3) Grep de éxito: limpio salvo `paso.ts:181` (fronterizo, no tocado, flagueado). (4) Suites: tsc EXIT 0, invariantes 17/17, test:leados 25/25, test:setter 43/43 (2 flakes ajenos confirmados y re-verdes). (5) Frenos: FASE 0 encontró la deuda de 1.1 otra vez perdida (WIP ajeno no commiteado se cayó) — reconciliada como commit aparte antes del sprint, como indicaba el protocolo. `docs/probe-01-censo-cosecha.md` es WIP ajeno untracked, no tocado. Sin push.

---

## Sprint 3.2 — Guardias de salida y errores anunciados en formularios · 2026-07-22

**Objetivo único.** Dos frentes chicos, copiando patrones ya existentes. Frente A (B-09/C-16): `useUnsavedGuard` en opener y seguimiento, hoy sin red de seguridad — cerrar la pestaña pierde el texto entero. Frente B (B-13): `role="alert"` en los `<p>` de error que quedaron fuera de `Field` (que ya lo trae de fábrica). Motor intocable — solo componentes, sin autosave nuevo.

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, no tocado). Continuidad: `909ad8d` (sprint 3.1) presente en el log. `tsc --noEmit` EXIT 0.

**PROBE.** Patrón de referencia vivo en `evaluacion-form.tsx:93-95` (`hayCambiosSinGuardar` derivado de los campos locales + `useUnsavedGuard(hayCambiosSinGuardar)`, A-24) y el `role="alert"` ya aplicado al gate de link en `opener-form.tsx:82`. Replicado tal cual, sin variantes.

**Frente A — guardias de salida.**
- `opener-form.tsx`: `hayCambiosSinGuardar = largo > 0` (el mismo `largo` que ya calculaba `pasadoDeLargo`/`listoParaCopiar`, sin estado nuevo). Tras el registro exitoso, `m4-opener.tsx` swapea `OpenerForm`→`OpenerResumen` server-side (gate por `contactos`), así que no hace falta una bandera "enviado" a mano — el mismo patrón implícito que usa `EvaluacionForm`.
- `seguimiento-form.tsx`: `hayCambiosSinGuardar = nota.trim() !== ''`. Acá SÍ hay reseteo local (`onSuccess` limpia `nota`/`resultado`/`fechaReactivacion`, el form se queda montado para el próximo toque) — el guard se apaga solo porque la condición vuelve a `false`. **No se tocó** la lógica de `cadenciaAgotada` (2.2): el guard se sumó como línea aparte, sin tocar los `useState`/`opciones` existentes.
- La agenda (M16) queda **afuera** — la cubre B-05 más adelante, como marcaba la tarea.

**Frente B — a11y.** Los 5 puntos verificados en el terreno (ninguno se había corrido de línea): `ficha-form.tsx:249`, `evaluacion-form.tsx:229` (serverError), `agenda-form.tsx:218/231/235`. Los 3 de `agenda-form.tsx` cubren las tres ramas del `error` (dentro del panel de confirmación, con slot elegido sin panel, y sin slots todavía) — las tres necesitaban el `role="alert"` porque las tres son alcanzables según el estado del booking.

**Radiogroup del score (`evaluacion-form.tsx:160`).** Revisado `Field.tsx`: el `<label>` solo tiene `htmlFor={fieldId}` apuntando al control hijo (vía `FieldControlProvider`/contexto) — **no expone un `id` propio** que un `aria-labelledby` externo pueda referenciar (el radiogroup no es un control de contexto, arma su propio `role="radiogroup"` con botones sueltos). Forzar la asociación hubiera significado tocar `Field` (fuera de scope, la tarea lo prohibía explícitamente). Se dejó el `aria-label="Score de la evaluación"` como está — ya es accesible por sí solo — y se flaguea acá.

**Spec nuevo — `tests/setter/10-unsaved-guard.spec.ts`.** Dos casos reales (DB+build, sin mocks), uno por form: siembra un lead aterrizando en m4 (opener, `EVALUADA` + 0 contactos) y otro en m5 (seguimiento, `EVALUADA` + opener mandado + toque vencido — mismo patrón de siembra que `08-m5-cadencia-agotada.spec.ts`). Por cada uno: sin texto → `beforeunload` sintético (`new Event('beforeunload', {cancelable:true})` + `dispatchEvent` + leer `defaultPrevented`) da `false`; con texto → `true`; vaciando el campo → vuelve a `false`. Se usó `expect.poll(...)` en vez de un solo chequeo inmediato porque el listener se ata en un `useEffect` — un dispatch pegado al `fill()` le puede ganar la carrera al re-render.

**Trampa re-detectada (ya documentada en 2.2).** La 1ª corrida del spec nuevo contra `start:qa` dio falso-rojo (`defaultPrevented` siempre `false`) — el server QA servía el `.next` de ANTES de este sprint, sin el guard nuevo. `npm run build` antes de correr resolvió; quedó anotado para no repetir la sorpresa.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `npx eslint --ext .tsx` sobre los 5 componentes tocados: limpio (jsx-a11y vía `eslint-config-next`).
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **45/45** (43 previos + 2 del spec nuevo). Un rojo en la 1ª corrida (`F4-mobile-drawer`, click interceptado) confirmado flaky en aislado (verde solo) y en la corrida limpia siguiente — sin relación con este sprint.

**Diff:** `opener-form.tsx`, `seguimiento-form.tsx`, `ficha-form.tsx`, `evaluacion-form.tsx`, `agenda-form.tsx`, `tests/setter/10-unsaved-guard.spec.ts` (nuevo), esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 3.2 cerrado. (1) Guard en `opener-form.tsx` (`largo > 0`) y `seguimiento-form.tsx` (`nota.trim() !== ''`), mismo patrón que `EvaluacionForm` (A-24), sin autosave ni tocar `cadenciaAgotada`. (2) Prueba real del `beforeunload`: spec nuevo `10-unsaved-guard.spec.ts`, 2 casos e2e — `defaultPrevented` `false`→`true`→`false` según haya texto, con `expect.poll` por la carrera efecto-vs-dispatch. (3) a11y: los 5 puntos con `role="alert"` (`ficha-form:249`, `evaluacion-form:229`, `agenda-form:218/231/235`) + eslint jsx-a11y verde; el radiogroup de `evaluacion-form:160` se dejó con `aria-label` porque `Field` no expone un id externo sin refactor (flagueado, no forzado). (4) Suites: tsc EXIT 0, invariantes 17/17, test:leados 25/25, test:setter 45/45 (1 flake ajeno re-verde). Diff = 5 componentes + spec nuevo + bitácora. (5) Freno recurrente: `start:qa` no rebuildea solo (mismo hallazgo de 2.2) — `npm run build` antes de validar el spec nuevo. Sin push.

---

## Sprint 3.3 — El tilde explica por qué no se puede todavía · 2026-07-22

**Objetivo único.** `FaseAutoReporte` (el tilde de auto-reporte de una fase de Construcción) dejaba de reflejar una regla que el server YA aplica: `saveOwnedProgreso` (`dossier.ts:391-393`) rechaza el guardado si `dossier.stage !== 'CONSTRUCCION'` — hasta ahora el tilde se ofrecía igual en BRIEF y el setter se enteraba recién con un toast de error tras el click. Presentación pura: el guard del server queda idéntico (diff = cero en `dossier.ts`, confirmado).

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`). Continuidad: `909ad8d` (3.1) y `79d3787` (3.2) en el log. `tsc --noEmit` EXIT 0.

**PROBE.** `m-construccion.tsx:103-153` (`ConstruccionRegistro`): en `stage === 'BRIEF'` ya muestra el CTA «Arrancar construcción» arriba del tilde — el texto del motivo nuevo reusa exactamente ese nombre para que el setter encuentre lo que se le nombra. `fase-auto-reporte.tsx` entero: el tilde es un `<button>` sin `disabled` hoy, con `useOptimistic` + `guardarProgreso`; su comentario de cabecera ya documentaba el §6-3 ("NO es un gate"). `stage` viaja `manual/_data.ts` → `page.tsx` → `ConstruccionRegistro` como `DossierStage | null`, ya presente en la firma de props — no hizo falta enhebrar nada nuevo.

**El cambio (2 archivos, sin tocar motor):**
1. **`fase-auto-reporte.tsx`:** dos props nuevas, `puedeGuardar?: boolean` (default `true`, así los callers existentes — si los hay — no rompen) y `motivo?: string`. El `<button>` suma `disabled={!puedeGuardar}` + estilo `opacity-60 cursor-not-allowed` cuando está deshabilitado; el texto de ayuda bajo el label muestra el `motivo` en vez del texto de auto-reporte habitual cuando `!puedeGuardar`. El `disabled` nativo del `<button>` es lo único que cambia: no hay `onClick` condicional extra, no hay wrapper que intercepte otra cosa — navegación, lectura y el resto de la pantalla (CTA de arrancar, contexto, munición, escalamiento) quedan exactamente igual.
2. **`m-construccion.tsx`:** `ConstruccionRegistro` pasa `puedeGuardar={stage === 'CONSTRUCCION'}` y `motivo="Primero arrancá la construcción — el botón está arriba."` a `FaseAutoReporte`. Nada más se tocó de ese archivo — ni siquiera el comentario de cabecera de `ConstruccionRegistro` (línea ~106, "el tilde NO se bloquea, §6-3"), que la tarea no pidió tocar; queda flagueado abajo porque ahora es impreciso en BRIEF (SÍ se bloquea el submit, aunque §6-3 sigue intacto en su sentido real: tildar sigue sin gatear transiciones).

**§6-3, ampliado (no revertido).** El comentario de cabecera de `fase-auto-reporte.tsx` se extendió: el `disabled` ESPEJA una regla que el server ya aplicaba (no es un gate nuevo), tildar en CONSTRUCCION sigue sin hacer avanzar ni bloquear nada, y `puedeGuardar` no toca nada fuera del submit del tilde. Alguien que lea el archivo de ahora en más no debería confundir esto con una reversión del corte 5.6.

**Hallazgo flagueado (no corregido, fuera del scope explícito).** `m-construccion.tsx:106` sigue diciendo "el tilde NO se bloquea, §6-3" en el comentario de `ConstruccionRegistro` — la tarea dijo explícitamente "nada más cambia de ese archivo" fuera de pasar las dos props nuevas, así que no toqué esa línea aunque quedó desactualizada. Para Franco: si se quiere, un sprint de una línea la deja consistente con `fase-auto-reporte.tsx`.

**Spec nuevo — `tests/setter/11-fase-disabled.spec.ts`.** Dos casos reales (DB+build): un lead en `stage='BRIEF'` aterrizando en `/manual/m7` (primera pantalla de Construcción, alcanzable en BRIEF y CONSTRUCCION por la navegación libre de §6-3) → el tilde (`button[aria-pressed]`) está `disabled` y muestra el motivo textual; el CTA «Arrancar construcción» sigue visible y clickeable (nada más bloqueado). Un lead en `stage='CONSTRUCCION'` en la misma pantalla → el tilde está habilitado, funciona (click → `aria-pressed="true"` + "Fase marcada como hecha").

**e2e B5 (`01-flow.spec.ts:174`, CONSTRUCCIÓN: arrancar + escalar).** Corrido solo (`-g "B5"`) y en la suite completa: **verde, intacto**. No asertaba el tilde en BRIEF, así que no había forma de que este cambio lo tocara — confirmado igual porque la tarea lo pedía explícito.

**Trampa de siempre (2.2/3.2, esta vez sin sorpresa).** `npm run build` antes de correr el spec nuevo — `start:qa` sirve el `.next` viejo.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **47/47** (45 previos + 2 del spec nuevo) — sin flakes esta corrida.
- ✅ `git diff -- src/lib/leados/dossier.ts` → **0 líneas** (motor intacto, confirmado con el comando, no solo de memoria).

**Diff:** `fase-auto-reporte.tsx`, `m-construccion.tsx`, `tests/setter/11-fase-disabled.spec.ts` (nuevo), esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

**PARA EL CHAT DE PLANIFICACIÓN**
Sprint 3.3 cerrado. (1) `FaseAutoReporte` suma `puedeGuardar`/`motivo`: `disabled` nativo en el `<button>` + motivo "Primero arrancá la construcción — el botón está arriba." (nombra el CTA real); `m-construccion.tsx` calcula `puedeGuardar = stage === 'CONSTRUCCION'`, nada más cambia ahí. (2) e2e B5: **intacto**, verde solo y en la suite completa. (3) `dossier.ts`: confirmado con `git diff` → 0 líneas, el guard del server no se tocó. (4) Suites: tsc EXIT 0, invariantes 17/17, test:leados 25/25, test:setter 47/47 (sin flakes). Diff = 2 componentes + spec nuevo + bitácora, exactamente lo pedido. (5) Freno/flag: el comentario de `m-construccion.tsx:106` quedó desactualizado ("el tilde NO se bloquea") pero fuera del scope explícito de la tarea — no se tocó, reportado para Franco. Sin push.

---

## Sprint 3.4 — cuatro residuos de B3 (2026-07-22)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `909ad8d` (3.1), `79d3787` (3.2), `db557e8` (3.3) en el log. `tsc --noEmit` EXIT 0.

**Frente A — el último "caliente" fuera de la superficie.** `paso.ts:181` (estado de espera de APROBADA) todavía decía "o si el lead fuera caliente" en copy visible del setter. Reformulado con el mismo vocabulario que `guidance-content.ts` (`GUIA_ENVIO.espera.aprobadaSinEnganche`) ya usaba desde antes: "o si Franco le dio prioridad". `grep -rn -i "caliente" src/lib/leados/ "src/app/(protected)/setter/"` post-fix: todas las ocurrencias restantes son nombres de campo/prop (`caliente: boolean`, `OsLead.caliente`), comentarios técnicos, o los dos badges operativos de Franco (`foco-surface.tsx:161`, `home-sections.tsx:81`, `manual-nav.tsx:90` — «Caliente», guardrail `esCaliente`) — exactamente lo esperado, sin nueva copy con la palabra reservada.

**Frente B — comentario del §6-3.** `m-construccion.tsx:103-108` (JSDoc de `ConstruccionRegistro`) seguía diciendo "el tilde NO se bloquea, §6-3" — desactualizado desde 3.3, que sí lo deshabilita fuera de CONSTRUCCION. Reescrito para decir lo correcto: tildar sigue sin ser gate (no requisito para avanzar, no condiciona navegación — eso es lo que dice §6-3 en su sentido real) y el `disabled` de `FaseAutoReporte` solo espeja, fuera de CONSTRUCCION, la regla que el server ya aplica en `saveOwnedProgreso`. Solo el comentario — cero líneas de código tocadas en ese archivo.

**Frente C — `start:qa` build viejo.** `package.json` estaba limpio (sin cambios de otra sesión). El script levantaba `next start` directo sobre el `.next` existente — la trampa documentada en 2.2, 3.2 y 3.3 ("el spec nuevo corre contra código de ANTES del sprint"; workaround manual: `npm run build` antes de cada corrida). No hay build automático en otro punto del pipeline (`playwright.setter.config.ts` invoca `start:qa` directo en su `webServer`, sin paso previo) — encadenarlo no duplica nada, cierra el hueco real. Cambio mínimo: `"start:qa": "npm run build && cross-env QA_ALLOW_LOCALHOST=1 next start -p 3001"`. Verificado corriendo el propio script tras los cambios de A y B ya hechos: recompiló (`Creating an optimized production build...`) y sirvió el código nuevo — no hizo falta un cambio de fuente adicional para probarlo, los frentes A/B YA eran ese cambio de fuente.

**Frente D — diagnóstico de flakes.** `F4 · mobile drawer` (`tests/setter/05-empty-mobile-a11y.spec.ts:72`), 6 corridas aisladas (`-g "F4"`): **3 fallas / 6** (50%, consistente con "dos veces" en B3). `B3 · OPENER` (`tests/setter/01-flow.spec.ts:114`), 5 corridas aisladas (`-g "B3"`): **0 fallas / 5** — no reprodujo el flake histórico de B3; sin cambios, sin perseguirlo más (techo respetado).

Causa de F4, confirmada por el log de Playwright (no hipótesis): `setter-shell.tsx` tiene DOS botones con `aria-label="Cerrar menú"` — el scrim de fondo (`fixed inset-0`, línea 42-48) y el X dentro del panel (línea 57-65). El test hacía `.first()`, que resuelve al scrim. El scrim cubre el viewport completo (390×844); su centro geométrico (195, 422) cae DENTRO de la columna del panel (0-240px de ancho) — Playwright intenta clickear ahí y el panel (`z-index appDrawer=110` sobre `appDrawerBackdrop=100`) intercepta el click contra sus propios `<li>`, agotando el timeout de 15s. Fix: `.last()` en vez de `.first()`, apuntando al X real — sin overlap posible (z-index `appDrawerClose=130`, el más alto). Verificado 5/5 verde tras el cambio (antes: 3 fallas en 6).

**Radiogroup (recordatorio, no tocado este sprint).** El `aria-labelledby` del radiogroup de `Field` sigue descartado a propósito — `aria-label` ya es accesible y tocar el primitivo compartido no entra en 3.4 (ni entró en ningún sprint de B3). Sin cambios.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **47/47** (incluye F4 estabilizado) — sin flakes esta corrida.
- ✅ Motor intacto: cero archivos de `dossier.ts`/transiciones/gates/ownership/schema en el diff.

**Diff:** `src/lib/leados/paso.ts` (A), `m-construccion.tsx` (B, solo comentario), `package.json` (C), `tests/setter/05-empty-mobile-a11y.spec.ts` (D), esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage. Commits separados: `sprint 3.4a`…`sprint 3.4d`.

**PARA EL CHAT DE PLANIFICACIÓN**
(1) Frente A: grep post-fix limpio — solo quedan prop/campo `caliente`, comentarios técnicos y los 2 badges operativos de Franco + su guardrail `esCaliente`. (2) Frente B: hecho, solo comentario reescrito, cero código. (3) Frente C: arreglado — `start:qa` ahora encadena `npm run build` (no había build duplicado en el pipeline; el hueco era real). (4) Frente D: F4 fallaba 3/6 (50%) — causa confirmada (no hipótesis): `.first()` agarraba el scrim de fondo cuyo centro cae bajo el panel propio, interceptando el click; fix = `.last()` apunta al X real, 5/5 verde. B3-opener: 0/5 fallas, no reprodujo, sin tocar (techo respetado). (5) Suites: tsc EXIT 0, invariantes 17/17, test:leados 25/25, test:setter 47/47. WIP ajeno detectado (`docs/probe-01-censo-cosecha.md`) no tocado. Sin push.

---

## Sprint 4.1 — errores persistentes y en criollo, sin jerga de motor (2026-07-23)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `909ad8d`…`c19f7db` (3.x) y `fccbeb7` (micro 4.0) en el log. `tsc --noEmit` EXIT 0.

**Censo del motor.** `grep -n "throw new DossierTransitionError" src/lib/leados/dossier.ts` → 21 throws, **16 mensajes distintos** (el «cambió de stage durante el guardado — recargá» se repite en 4 write-paths) + 1 templado (`Transición ilegal: X → Y`, línea 148). Todos llegaban CRUDOS al setter: los dos `mapError` hacían `fail(error.message)`.

**Frente 1 — el mapa.** Módulo nuevo `src/lib/leados/error-copy.ts`: mensaje literal del motor → copy operativo (qué pasó + qué hacer) en el vocabulario canónico del manual (borrador, chequeo final, negocio, demo — nunca draft/self-check/stage). **17 entradas conocidas**; lo no mapeado cae a `COPY_GENERICO` = "Algo falló al guardar — probá de nuevo; si sigue, avisale a Franco." — honesto, nunca suena a éxito. El único match no-literal es el prefijo **anclado** `Transición ilegal: ` (lleva stages interpolados); no hay ningún match por substring amplio. `dossier.actions.ts:mapError` y `outreach.actions.ts:mapError` pasan por `copyOperativo(error.message)`. **`dossier.ts` intocado** — sus mensajes son la CLAVE del mapa, el copy vive en la capa de presentación.

| Error del motor | Copy que ve el setter |
|---|---|
| `Transición ilegal: X → Y` | Esto ya se actualizó en otra pestaña — recargá para ver el estado real. |
| El dossier cambió de stage durante la transición — reintentar | *(ídem — multi-tab)* |
| El dossier cambió de stage durante el guardado — recargá | *(ídem — multi-tab)* |
| El dossier cambió de stage durante el escalamiento — recargá | *(ídem — multi-tab)* |
| No existe dossier para ese lead | Este lead todavía no tiene ficha arrancada — abrilo desde tu cartera y empezá por la ficha. |
| Gate EVALUADA→BRIEF: … no está marcado caliente | Todavía no se puede pasar al brief: el negocio no respondió el primer contacto y Franco no lo marcó caliente. Seguí con el seguimiento. |
| EVALUADA→DESCARTADA requiere motivoDescarte | Para descartar el lead falta el motivo — escribí por qué no va. |
| EVALUADA→DESCARTADA: evaluacionJson ausente o inválido… | La evaluación de este lead quedó incompleta — recargá y volvé a registrarla; si sigue, avisale a Franco. |
| EN_REVISION→RECHAZADA requiere motivo | Falta el motivo del rechazo — escribí qué hay que corregir. |
| El dossier desapareció durante la transición | Se perdió el rastro de este lead mientras se guardaba — recargá; si sigue, avisale a Franco. |
| La ficha solo se edita antes de registrar la evaluación | La ficha ya no se edita: este lead tiene la evaluación registrada. |
| El draft se publica durante la construcción — arrancala primero | El borrador se carga con la construcción arrancada — arrancala primero y volvé. |
| El escalamiento es de la construcción en curso | Solo se puede pedir ayuda mientras la construcción está en curso. |
| El self-check se completa durante la construcción | El chequeo final se completa mientras la demo está en construcción. |
| El progreso se registra durante la construcción | El progreso se marca mientras la demo está en construcción. |
| La demo se envía cuando Franco la aprobó | Esta demo todavía no está aprobada por Franco — el envío se habilita cuando la aprueba. |
| El brief se captura después de la evaluación | El brief se captura después de registrar la evaluación. |
| *(cualquier otro)* | Algo falló al guardar — probá de nuevo; si sigue, avisale a Franco. |

**Frente 4 — multi-tab.** Las 4 familias de rebote-por-estado-ya-movido (la transición ilegal + los 3 guards optimistas de `updateMany`) comparten copy: "Esto ya se actualizó en otra pestaña — recargá para ver el estado real." Es exactamente el caso real: el guard optimista solo falla si otro proceso movió el stage entre la lectura y la escritura.

**Frente 2 — error persistente en chequeo y envío.** `chequeo-form.tsx` migrado de `useTransition` + `toast.error` crudo a `useStepAction` con `onError` inline (patrón `borrador-form.tsx`): estado `serverError` + `<p role="alert">` FIJO arriba de la botonera (patrón de 3.2). El "Enviar a revisión" encadena guardado + envío dentro de UN `run` — si el guardado rebota, su fallo ES el fallo del envío (mismo camino de error, misma superficie). `envio-form.tsx` ya usaba el hook: se le sumó `onError` + el mismo bloque `role="alert"`. **Cero cambios de flujo de control**: los gates siguen decidiéndose server-side, el botón sigue `disabled` hasta 6/6.

**Frente 3 — `SLOT_OCUPADO` como código compartido.** Módulo nuevo `src/lib/leados/action-codes.ts` (sin dependencias: lo importan server y cliente). `ActionResult` fallido acepta ahora un `code?: string` opcional (`fail(error, code?)`, aditivo — nadie más lo usa todavía) y `useStepAction.onError` lo propaga como 2º parámetro. `agenda.actions.ts` lo emite en las **dos** fuentes del mismo rebote: la re-validación fresca del slot (línea 177) y el `CalComV2Error` con `tipo === 'slot_ocupado'` que sube desde Cal.com. `agenda-form.tsx:92` matchea `code === SLOT_OCUPADO` — el `mensaje.includes('se acaba de ocupar')` quedó eliminado. **`cal-com-v2.ts` NO hizo falta tocarlo**: ya traía el discriminante `tipo`.

**Verificación central (rebote real).** En `tests/leados/dossier-gates.spec.ts` ("máquina de stage"), el `FICHA→BRIEF` ilegal real del motor se captura y se aserta: `ilegal.message` **sí** contiene "Transición ilegal" (el motor no cambió), y `copyOperativo(ilegal.message)` **no** contiene "Transición ilegal" ni "FICHA" y es exactamente el copy multi-tab. Sin tests nuevos: la aserción entró en el test existente (sigue 25/25).

`grep -rn "Transición ilegal" src/` → 4 hits, **ninguno** en un componente ni en el camino de salida al cliente: `dossier.ts:148` (el motor, intocado) y 3 en `error-copy.ts` (2 comentarios + el prefijo del mapa). `grep "se acaba de ocupar"` en las actions/componentes tocados → 1 hit, el copy del server; cero en componentes.

**Suites de cierre:**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **47/47** — sin flakes.
- ✅ Motor intacto: `dossier.ts` NO aparece en `git diff --stat`. Gates, transiciones, ownership y schema sin tocar.

**Diff:** `dossier.actions.ts`, `outreach.actions.ts`, `agenda.actions.ts`, `chequeo-form.tsx`, `envio-form.tsx`, `agenda-form.tsx`, `action-utils.ts`, `use-step-action.ts`, `error-copy.ts` (nuevo), `action-codes.ts` (nuevo), `tests/leados/dossier-gates.spec.ts`, esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

---

## Sprint 5.1 — la conversación a la vista en m5 (2026-07-23)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `b6b2132` (4.1) en el log. `tsc --noEmit` EXIT 0.

**Objetivo.** El opener enviado y la última nota del seguimiento vivían solo en el historial colapsado (`HistorialDelLead`) — el setter re-entraba a m5 sin ver "lo último de la charla" a menos que lo abriera. Sin queries nuevas, sin writes: `listOwnedLeadActivities` ya trae exactamente ese dato (`actividades`, la más nueva primero) — este sprint solo lo expone y lo presenta.

**`_data.ts` (B-10/C-24).** Dos campos nuevos en `ManualDelLead`, ambos derivados de `actividades` (ya cargada en `Promise.all`, sin lectura extra):
- `ultimoToque`: `{ fecha, resultado, nota } | null` — `actividades[0]` cuando trae `result` (siempre lo trae salvo el caso imposible de un registro sin resultado); `null` si el lead todavía no tiene actividades.
- `openerTexto`: `string | null` — `registrarOpener` (outreach.actions.ts) guarda el mensaje como nota del PRIMER contacto con el prefijo `Opener: `; se busca por prefijo (no por posición, porque con seguimiento encima el opener queda como el ítem más VIEJO del array desc) y se despoja el prefijo para presentarlo.

**`m5-seguimiento.tsx` (B-10).** Bloque nuevo `UltimaCharla` dentro de `M5Registro`, arriba de `SeguimientoForm` — compacto (fecha corta + badge de resultado + la nota si existe), reusa `resultadoEtiqueta`/`resultadoTono` de `lead-timeline.helpers.ts` (cero duplicación de las etiquetas es-AR del timeline) y `formatFechaCorta` (ya en uso en el archivo). Sin acordeón nuevo: `UltimaCharla` retorna `null` si `ultimoToque` es `null` — el bloque simplemente no se renderiza.

**`opener-form.tsx` (C-24).** `OpenerResumen` suma la prop `openerTexto: string | null` y, si viene, lo muestra en un recuadro debajo del resumen del envío. Único call site: `m4-opener.tsx:M4Registro` → `page.tsx` (`manual.openerTexto`).

**Cierre — verificado, no auto-confirmado.**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **47/47** — sin flakes.
- ✅ Motor intacto: `_data.ts` solo LEE (`actividades` ya cargada); cero queries nuevas, cero writes; `dossier.ts`/transiciones/gates/ownership/schema fuera del diff.

**Diff:** `_data.ts`, `m5-seguimiento.tsx`, `opener-form.tsx`, `m4-opener.tsx`, `manual/[paso]/page.tsx`, esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

---

## Sprint 5.3 — m15 consultable en la espera, causa real visible (2026-07-23)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `88b1f13` (5.1) en el log. `tsc --noEmit` EXIT 0.

**Objetivo.** El componente `m15-envio.tsx` ya traía los 3 mensajes específicos de `GUIA_ENVIO.espera` (aprobadaSinEnganche / engancheSinAprobar / niEngancheNiAprobada), pero la rama era inalcanzable: en APROBADA con el gate de envío cerrado, `posicionDe` (`manual.ts`) no incluía `'m15'` en `habilitadas` — el setter no podía abrir esa pantalla para consultar por qué está esperando.

**`manual.ts` (~584-593, rama APROBADA con `envioAbierto === false`).** Sumado `'m15'` a `habilitadas` en ambos sub-casos (con y sin `followUpVencido`). `actual` NO cambia — sigue en `'m5'`/`'espera'` según corresponda; m15 es consulta, nunca el paso actual. El gate server-side (`gateEnvioDemo`, que decide `envioAbierto` un poco más arriba, línea ~578) queda idéntico — el envío sigue imposible con el gate cerrado, esta rama solo habilita la NAVEGACIÓN a la pantalla que explica por qué.

**Ruteo de mensajes: ya alcanzable, sin cambios.** `m15-envio.tsx:M15Registro` (~104-119) ya deriva el mensaje correcto por `stage === 'APROBADA' ? aprobadaSinEnganche : respondio ? engancheSinAprobar : niEngancheNiAprobada` — un cálculo puro sobre `stage`/`status`/`finalUrl`, independiente de `habilitadas`. No hizo falta tocar el componente: con `habilitadas` ahora incluyendo `'m15'`, la ruta ya renderiza el mensaje específico.

**Invariante nuevo (`manual.invariant.ts`, caso 6).** APROBADA + gate cerrado (sin `finalUrl`) con y sin `followUpVencido`: `actual` se mantiene en `'espera'`/`'m5'` respectivamente, y `habilitadas` incluye `'m15'` en ambos.

**Cierre — verificado, no auto-confirmado.**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **47/47** — sin flakes.
- ✅ `npm run build` OK.
- ✅ Motor intacto: `gateEnvioDemo`/`flow.ts` fuera del diff; el envío sigue gateado server-side, solo se sumó una entrada de navegación.

**Diff:** `manual.ts`, `manual.invariant.ts`, esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

---

## Sprint 6.0 — test de caracterización del claim atómico de agenda (red previa a B-05) (2026-07-23)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `b6b2132` (4.1), `88b1f13` (5.1) y `65058fc` (5.3) en el log — **no existe commit "sprint 5.2"** en `main` (numeración no contigua; se reporta, no se inventa). `tsc --noEmit` EXIT 0.

**Objetivo.** Escribir la red que le faltaba al claim atómico de agenda ANTES de que otro sprint lo toque. Hasta hoy `marcarAgendandoOwned` (`src/lib/leados/agenda.ts`) no tenía **ninguna** cobertura: `06-claim-atomico.spec.ts` cubre el claim del **envío de demo** (`enviadaAt`/`marcarDemoEnviadaOwned`), y el único test que rozaba agenda (`01-flow.spec.ts`) siembra `agendaJson` en AGENDADA directo, salteando el claim entero.

**Naturaleza.** Test de **caracterización**: documenta y protege lo que el código hace HOY. Cero cambios de producción — el diff no toca `src/`.

**Archivo nuevo: `tests/setter/12-claim-agenda.spec.ts` (sección G, 4 casos).** In-process contra la DB real (mismo criterio que la sección F): `confirmarReunion` corre bajo `requireSetter()` → `auth()` → cookies de request, inalcanzable desde el runner, y además pegaría contra Cal.com REAL (`createBooking`). Se ejerce la primitiva directa — sin red y sin agendar nada en el calendario de Franco.

- **G1 · doble claim → uno gana, el otro rebota a `'agendando'`.** Invariante: dos confirmaciones simultáneas producen UN solo booking. Técnica: `Promise.all` sobre la primitiva contra el mismo row — **la misma del test hermano F1**, no se inventó una nueva. Aserta ambos lados: `sort()` da exactamente `['agendando','claim']`, y el ganador deja el blob `AGENDANDO` con `claimedAt`.
- **G2 · ownership cruzado (aislamiento multi-tenant).** Invariante: el claim pasa por `getOwnedDossier`, así que un lead ajeno devuelve `null` ANTES de tocar la DB. **Resultado: PASA** — el setter B recibe `null`, el dossier queda intacto (`agendaJson` sigue NULL) y el dueño real sigue pudiendo reclamar. Sin fuga.
- **G3 · compensación.** Invariante: si Cal.com falla el claim se libera y el setter reintenta — el lead no queda trabado en AGENDANDO. Cubre además que el re-claim inmediato es idempotente (`'agendando'`).
- **G4 · post-AGENDADA.** Invariante: una reunión confirmada nunca se pisa con un segundo booking, y el rebote se distingue del "en curso". Camino de HOY: el `updateMany` no matchea y el parse del blob existente devuelve **`'agendada'`** (la action lo traduce a «Este lead ya tiene la reunión agendada»). Se monta por el camino REAL (`marcarAgendandoOwned` → `guardarAgendaOwned`), no por seed crudo. Extra: la AGENDADA sobrevive a un `revertirAgendandoOwned` tardío (filtra por AGENDANDO).

**Comportamiento documentado tal cual, NO arreglado.** `revertirAgendandoOwned` deja `agendaJson` en **`Prisma.DbNull`** — borra el claim entero en vez de dejar rastro del intento fallido, así que un booking que falló en Cal.com no deja huella consultable en el dossier. Queda asertado con comentario explícito: **el sprint 6.1 va a cambiar esto a propósito**, y esa es la aserción a actualizar cuando lo haga. No es un bug reportable, es el contrato de hoy.

**Limitación declarada (no se debilitó ninguna aserción).** `Promise.all` sobre la primitiva son dos transacciones en vuelo contra el mismo row desde un solo proceso Node — no es concurrencia multi-proceso real. Es exactamente lo que el `updateMany` condicional tiene que resolver y lo que ya valida F1, pero se deja dicho: un doble click desde dos navegadores distintos no se reproduce acá.

**Cierre — verificado, no auto-confirmado.**
- ✅ `tsc --noEmit` EXIT 0.
- ✅ `check:invariants` **17/17**.
- ✅ `test:leados` **25/25**.
- ✅ `test:setter` **51/51** (47 previos + los 4 nuevos) — sin flakes.
- ✅ Spec nuevo corrido **3 veces seguidas**: 4/4 verde las 3 (sin `sleep`, sin retries).
- ✅ Producción intacta: `agenda.ts`, `agenda.actions.ts`, `contracts.ts`, `dossier.ts`, gates y schema fuera del diff.

**Diff:** `tests/setter/12-claim-agenda.spec.ts` (nuevo), esta bitácora. Cero archivos de `src/`. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

---

## Sprint 6.1 — el claim acepta OFRECIDOS y la compensación restaura: backend del booking con memoria (B-05/PR-2) (2026-07-23)

**FASE 0.** `git status --porcelain` limpio salvo el WIP ajeno ya conocido (`docs/probe-01-censo-cosecha.md`, sin tocar). Continuidad: `8b3ce80` (6.0) en el log y `tests/setter/12-claim-agenda.spec.ts` existiendo. `tsc --noEmit` EXIT 0 y **el spec del claim corrido ANTES de tocar nada: 4/4 verde** — línea de base. `npx prisma migrate status`: 86 migraciones, al día.

**Objetivo.** Darle memoria al booking: `ofrecerHorarios` no persistía nada, así que si el prospecto tardaba y el setter cerraba la pestaña, los horarios ofrecidos se perdían. Persistirlos chocaba con el claim atómico —que reclamaba exigiendo blob vacío— y ese choque es lo que resolvió este sprint. Backend puro: la re-entrada de m16, la guardia de salida y la confirmación son 6.2.

### 1. El `where` nuevo — la condición se ensanchó, el mecanismo no cambió

```ts
const PARTIDA_RECLAMABLE: Prisma.OsLeadDossierWhereInput[] = [
  { agendaJson: { equals: Prisma.AnyNull } },
  { agendaJson: { path: ['estado'], equals: 'OFRECIDOS' } },
]

const updated = await prisma.osLeadDossier.updateMany({
  where: { leadId: dossier.leadId, OR: PARTIDA_RECLAMABLE },
  data: { agendaJson: claim as Prisma.InputJsonValue },
})
```

**Sigue siendo UN solo `updateMany` condicional**: una sola query decide el ganador. No hay read-para-decidir, no hay segunda query, no hay transacción. El pre-read de `getOwnedDossier` ya existía (ownership) y ahora además da **forma** al payload —arrastra la memoria de la oferta dentro del claim— pero **nunca decide quién gana**: si esa lectura quedó vieja, el perdedor igual pierde en el `where`. Un lead en `AGENDANDO` o `AGENDADA` no matchea ninguna rama: sigue sin ser reclamable, exactamente como antes de 6.1.

**Filtro JSON por path contra Postgres real: FUNCIONA.** No se dio por bueno por tipos. Probe descartable (fuera del repo, borrado) contra la Neon dev, 5/5: blob NULL → count 1 · `AGENDANDO` → 0 · `OFRECIDOS` → 1 · `AGENDADA` → 0 · carrera de dos `updateMany` simultáneos sobre `OFRECIDOS` → `[0,1]`. Después quedó cubierto en el spec (G5-G7).

### 2. La compensación restaura el estado previo, no vacía

`revertirAgendandoOwned` dejaba el blob en `Prisma.DbNull` siempre. Ahora **restaura exactamente el estado previo al claim**: si el claim traía memoria de una oferta, el blob vuelve a `OFRECIDOS` con esos horarios y su `ofrecidosAt` original; si el claim nació de un blob vacío, sigue compensando a `DbNull`. Nunca resucita una `AGENDADA` vieja: el payload restaurado sale del **propio claim** (no de un estado histórico) y el `where` sigue exigiendo `AGENDANDO`.

Por qué la memoria viaja **dentro** del claim: el `updateMany` reemplaza el blob entero, así que si los horarios no se copian al reclamar, la compensación no tiene qué restaurar y un fallo de Cal.com se come la oferta.

### 3. `ofrecerHorarios` pasó de solo-lectura a write

Persiste `{ estado: 'OFRECIDOS', horariosOfrecidos, ofrecidosAt }` vía `guardarHorariosOfrecidosOwned` (nueva en `agenda.ts`), **con el mismo patrón de ownership que el resto de los writes del setter del archivo** (`getOwnedDossier` adentro) — probado con un caso de escritura cruzada en G10. Re-ofrecer **reemplaza** la oferta anterior (last-write-wins, deliberado: lo que vale es lo último que el prospecto tiene en la mano); condición de escritura idéntica a la del claim, así que jamás pisa un claim en vuelo ni una reunión confirmada. La persistencia es **memoria, no gate**: si no hay dónde escribir, los horarios se devuelven igual. **Sin `revalidatePath`** a propósito: este sprint es backend puro y un refresh sería un cambio observable de UI — va en 6.2.

### 4. Extensión del contrato — aditiva y opcional

`AgendaSchema` suma el valor `'OFRECIDOS'` al enum de `estado` y dos campos **opcionales**: `horariosOfrecidos` (array de starts ISO con offset, mismo validador que `slotStart` — el formato ya viene de Cal.com por ese camino) y `ofrecidosAt`. Ningún blob viejo deja de parsear: una `AGENDADA` escrita en B7 y un claim `AGENDANDO` pelado siguen válidos (G9 lo prueba). Ningún campo nuevo es requerido.

### Censo de readers de `agendaJson` — 7/7 inertes ante `OFRECIDOS`

Se re-censaron los 7 y **todos filtran por `estado === 'AGENDADA'`** (directo o vía `reunionAgendada`, que además exige `calBookingUid`): `flow.parseAgenda`/`reunionAgendada` · `manual/_data.ts:~168` (→ `manual.ts` deriva m16 con `reunionAgendada`, y `m16-agenda.tsx` idem) · `home.ts:~43` (consumido en `flow.ts:683` como `agenda?.resultado?.nota`, campo que `OFRECIDOS` no tiene) · `notify.ts:~95` (corta con `estado !== 'AGENDADA'`) · `progreso.ts:~74` (exige `AGENDADA` + `agendadaAt`) · admin `page.tsx:~229` (`reunionAgendada(agenda) ? agenda : null`) · `gateAgenda` (`reunionAgendada`). **Ninguno tuvo que cambiar y ninguno reporta problema.**

### El test de 6.0 — ningún caso cambió

G1-G4 quedaron **intactos en sus aserciones**: 4/4 verde sin tocar una sola expectativa. Vale la pena decir por qué, porque 6.0 anticipó lo contrario: predijo que la aserción de G3 (`la compensación dejó agendaJson en NULL`) sería la que habría que actualizar. **No hizo falta** — la compensación ahora restaura *el estado previo al claim*, y el previo de ese lead era NULL (nunca se le ofrecieron horarios), así que sigue compensando a NULL. Lo único que cambió en G3 es el **comentario**, que ahora explica eso y apunta a G8. El caso con memoria —el que sí quedaba vacío antes y ahora vuelve a `OFRECIDOS`— es nuevo, no una mutación de uno viejo.

### Casos nuevos (mismo spec, sección G)

- **G5 · un lead en `OFRECIDOS` es reclamable, y el claim se lleva la memoria.** Antes de 6.1 este claim rebotaba a `'agendando'` porque el blob no era NULL: el lead quedaba inreclamable para siempre apenas se le ofrecían horarios.
- **G6 · doble claim sobre `OFRECIDOS` → exactamente uno gana.** Misma línea roja que G1 sobre el estado de partida nuevo: ensanchar la condición no aflojó la llave.
- **G7 · `AGENDADA` sigue sin ser reclamable.** Blob sembrado directo para atacar el `where` puro (G4 llega por el camino del claim). Suma que ofrecer horarios tampoco pisa una reunión confirmada.
- **G8 · compensación desde `OFRECIDOS` restaura los horarios.** El corazón del sprint: si Cal.com falla, el prospecto sigue teniendo esos 3 horarios en el chat; vaciar el blob obligaría a ofrecer OTROS y partiría la conversación. Aserta horarios, `ofrecidosAt` original preservado, `claimedAt` ausente y que el reintento vuelve a reclamar.
- **G9 · contrato:** blob con el shape anterior parsea válido (sin DB, puro contrato).
- **G10 · persistencia punta a punta a nivel datos:** ofrecer → **releer el lead desde la DB** → slots presentes con estado `OFRECIDOS`. Incluye last-write-wins y el negativo de ownership (setter ajeno → `false`, oferta del dueño intacta). Se ejercita el write-path exacto de la action (`guardarHorariosOfrecidosOwned`): `ofrecerHorarios` corre bajo `requireSetter()` y pega contra Cal.com real — mismo criterio declarado en 6.0 para G1-G4.

**Cierre — verificado, no auto-confirmado.**
- `tsc --noEmit` EXIT 0 (sin pipe).
- `check:invariants` **17/17**.
- `test:leados` **25/25**.
- `test:setter` **57/57** (51 previos + los 6 nuevos) — sin flakes.
- `npm run build` OK.
- Spec del claim corrido **3 veces seguidas**: 10/10 las 3, estable.
- Línea roja intacta: `confirmarReunion` conserva su semántica (qué significa ganar el claim, el flujo posterior y la integración con Cal.com sin tocar); `prisma/schema.prisma`, `dossier.ts`, gates, transiciones y componentes de UI fuera del diff.

**Diff:** `src/lib/leados/agenda.ts`, `src/app/(protected)/setter/_actions/agenda.actions.ts`, `src/lib/leados/contracts.ts`, `tests/setter/12-claim-agenda.spec.ts`, `agenda-form.tsx` (**solo el comentario**: el precedente 5.4 «`agenda.actions.ts` no se toca» era de la capa de presentación del manual y quedó al día — 6.1 tocó la action a propósito por PR-2 / decisión #4), esta bitácora. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

---

## Sprint 6.2 — m16 re-entra con memoria, guardia y confirmación (B-05/C-05)

**Objetivo.** La experiencia encima del backend de 6.1: si el setter ya ofreció horarios, m16 se los muestra al volver; lo tipeado no se pierde al cerrar la pestaña; y el único paso irreversible pide un sí explícito. **Backend intocado** — el diff no roza `agenda.ts`, ni el claim, ni `agenda.actions.ts`.

### 1. Re-entrada con memoria

`M16Registro` decide (`ofertaPrevia`, en `m16-agenda.tsx`): un blob en estado `OFRECIDOS` con horarios entra al form como oferta vigente. Solo `OFRECIDOS` cuenta — un `AGENDANDO` es una confirmación en vuelo, no una oferta a la que volver, y una `AGENDADA` ni llega a esa rama. `AgendaForm` arranca con esos 3 horarios en pantalla en vez del buscador vacío, bajo el título **«Los horarios que ofreciste»** + **«Se los pasaste el {fecha}»** (el `ofrecidosAt` que persiste 6.1). Sin memoria, `ofertaPrevia` es `undefined` y el **flujo virgen queda idéntico** (`slots === null` → el buscador de siempre).

El re-buscar es el botón que ya existía («Buscar de nuevo»): re-ofrecer reemplaza la oferta anterior en pantalla **y** en el dossier (last-write-wins de 6.1). Los horarios recién buscados salen sin `ofrecidosAt`, así que la pantalla no los hace pasar por «los que ofreciste» hasta que el blob vuelva a leerse: la memoria se nombra memoria y la búsqueda fresca, búsqueda fresca.

### 2. Guardia de salida

`useUnsavedGuard(hayCambiosSinGuardar)` — **mismo patrón exacto de 3.2/A-24**: condición derivada del estado local, sin autosave, sin estado propio. Cubre lo tipeado y todavía no persistido (notas de traspaso, nombre/email editados respecto del prefill de la ficha). Los horarios **no** entran a la condición: desde 6.1 sobreviven solos.

### 3. Confirmación liviana — una sola, donde duele

Antes de `confirmarReunion` (crea el booking real en Cal.com y le avisa al prospecto) hay un paso inline con el `Callout` del proyecto: **«Vas a confirmar {fecha} — esto le avisa al prospecto»**, con *Sí, confirmar* / *Volver*. Nada de `window.confirm`. La validación del payload corre **antes** del cartel: si faltan datos, el setter ve el error del campo, no una confirmación de algo que no va a salir. **Ningún otro paso gana fricción**: buscar, re-buscar y elegir horario siguen directos.

### La prueba de la ficha, hecha literal (H1)

`tests/setter/13-m16-memoria.spec.ts` — **contexto de browser cerrado y uno nuevo abierto**: sesión nueva, storage nuevo, cero estado de cliente heredado. Al reabrir m16 los **mismos 3 horarios** están a la vista, con la fecha de la oferta, y el buscador virgen no aparece.

**Lo único sustituido, dicho sin maquillaje:** el clic en «Buscar horarios libres de Franco» dispara `ofrecerHorarios`, que pega contra **Cal.com real** (`getSlots`) — meterlo en la suite ataría la regresión a una API externa y a las credenciales de Cal en el env. La oferta se produce llamando el **write-path exacto que la action usa por dentro** (`guardarHorariosOfrecidosOwned`, mismo criterio que G10 en 6.1). Todo lo que 6.2 construye —re-lectura del blob, re-entrada, pantalla— se ejercita por la UI real cruzando un cierre de pestaña de verdad.

- **H2 · guardia:** `beforeunload` sintético (patrón de 3.2). Sin tipear no intercepta; elegir horario tampoco; con notas intercepta; vaciarlas la apaga.
- **H3 · confirmación:** no aparece al marcar el decisor, ni al elegir horario, ni al llenar los campos. Aparece al tocar «Confirmar y agendar», nombra el horario, y **la DB sigue en `OFRECIDOS`** — el paso irreversible no corrió sin el sí (si esto fallara sería un booking real en la agenda de Franco). «Volver» devuelve al form.

**Cierre — verificado, no auto-confirmado.**
- `tsc --noEmit` EXIT 0 (sin pipe).
- `check:invariants` **17/17**.
- `test:leados` **25/25**.
- `test:setter` **60/60** (57 previos + H1/H2/H3), primera corrida, sin flakes.
- `npm run build` OK.
- Spec del claim de 6.0/6.1 (`12-claim-agenda`) **verde y sin modificar** — 10/10 dentro de la corrida.
- **Pase visual del recorrido completo: pendiente de Franco.**

**Diff:** `m16-agenda.tsx`, `agenda-form.tsx`, `tests/setter/13-m16-memoria.spec.ts`, esta bitácora. Cero backend. `docs/probe-01-censo-cosecha.md` (WIP ajeno untracked) fuera del stage.

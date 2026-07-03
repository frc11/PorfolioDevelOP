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

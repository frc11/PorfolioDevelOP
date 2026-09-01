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

---

## Corrida D1 — Destilar el método real de develOP (read-only + 3 documentos nuevos) · 2026-07-23

**Qué se hizo.** No es un sprint de producto: es una corrida de **destilación**. Recuperar de la
evidencia del repo el método que develOP efectivamente ejecutó durante la remediación de LeadOS
—no el que el método dice de sí mismo— y convertirlo en documento. Read-only estricto sobre el repo;
las únicas escrituras son cuatro archivos nuevos en `docs/metodo/` + este append.

**FASE 0.** Worktree principal, rama `main`. **El terreno cambió entre el arranque de la sesión y el
arranque real del trabajo**: el snapshot inicial mostraba HEAD `7d323ea` (6.1) con `agenda-form.tsx` /
`m16-agenda.tsx` modificados y `13-m16-memoria.spec.ts` untracked; al empezar, todo eso ya estaba
commiteado en `6a88cbe` (6.2). Se anotó y se siguió (no toca el scope). Sucio permitido:
`?? docs/probe-01-censo-cosecha.md` (WIP ajeno, no tocado). Otras 5 worktrees vivas, sólo listadas.
`docs/metodo/` no existía: corrida fresca, sin progreso previo que retomar.

**Fuentes leídas (Parte 1).** `docs/bitacora-beta-3.md` entera (1.748 líneas, sprint 3.1/2026-06-29 →
6.2/2026-07-23) · `git log` del período de remediación (`62994be`..`6a88cbe`, 21 commits) + los dos
forenses previos (`612c4ee`, `5068d88`), con `git show --stat` de los 7 commits no-sprint ·
`docs/auditorias/AUDITORIA-CIERRE-2026-07.md` (333 líneas, backlog de 40 ítems + límites declarados) ·
`CLAUDE.md` · las cabeceras de los 17 invariantes de `check:invariants` · ~60 comentarios de decisión
del código (greps de `§`, `a propósito`, `deliberad`, `intencional`, `precedente`, `decisión`,
`NO se toca`, `línea roja`, `no confía en la UI`, `anti-regres`).

**Los tres documentos.**
- **`docs/metodo/LECCIONES-LEADOS.md`** (commit `23a19c3`) — 20 lecciones durables en 9 secciones, cada
  una con qué pasó (commit o `archivo:línea`), qué costó y qué regla se deriva. Incluye una sección de
  **decisiones tomadas dos veces** (7 casos) y el contraste de las 8 lecciones semilla contra el repo.
- **`docs/metodo/PROPUESTA-CIMIENTO.md`** (commit `f01a178`) — 21 cambios de método propuestos en 7 ejes,
  cada uno con texto listo para insertar, dónde va, la lección que lo origina y qué costó no tenerlo.
  **Propone, no reescribe.** Incluye una sección de qué NO se propone y por qué.
- **`docs/metodo/MAPA-LEADOS.md`** (commit `69d0fb4`) — el sistema hoy: las 4 capas, la máquina de
  stages, los 4 gates, aislamiento, claims atómicos, la derivación de pantallas, las capas de datos, el
  home, las líneas rojas con sus 3 trampas pagadas, y qué prueba cada comando de verificación. Escrito
  desde el código con `archivo:línea`; lo inferido está marcado **[INFERIDO]**.

**Hallazgos que valen para el chat de planificación.**
1. **El Cimiento de Chat y el Manual de Flujo NO existen en el repo** (búsqueda por nombre y por
   contenido sobre todo el árbol versionado y la raíz). No se reconstruyeron ni se inventaron: la
   propuesta salió como documento autónomo, etiquetada por eje para que Franco la mapee. Se suma al
   `docs/brief-vision-flujo-setter.md` que 7.0, 7.3 y AUD-2 ya reportaron ausente.
2. **Una lección semilla no se confirmó**: «cuando un sprint frena, los siguientes del bloque no deben
   correrse igual» no tiene caso en el repo. Lo que sí hay es lo contrario —dependencias declaradas
   («B-04 DEPENDE de B-01») y respetadas (`aed017e` → `7425d2b`)—. Se reformuló con lo que la evidencia
   sostiene: *un hueco en la cadena se reporta y se sigue con el hueco a la vista* (Sprint 6.0 y el
   commit "sprint 5.2" inexistente).
3. **Tres lecciones nuevas de peso** (fuera de la lista semilla): **la suite verde mide lo que cubre, no
   lo que importa** (el claim atómico de agenda estuvo sin una sola línea de cobertura todo el proyecto,
   con `test:setter` en 39/39, porque el único spec que rozaba agenda sembraba el blob ya resuelto y
   salteaba el claim); **verde no es verificado** (catálogo de seis chequeos con lo que cada uno NO
   prueba — el más caro: `migrate status` verde escondiendo drift físico de 7 columnas, que sólo caza
   `migrate diff`); y **el invariante ejecutable es la única verificación que no se evapora** (el
   proyecto pasó de 10 a 17, con tres propiedades que los hacen baratos y que conviene sostener como
   restricción de arquitectura). *La cadena `178c4d7` → `fccbeb7` (encadenar el build a `start:qa` obligó
   a subir el timeout del `webServer` de 120s a 300s) confirma la semilla «arreglar una trampa puede
   fabricar otra», con evidencia de dos commits.*
4. **Contradicción viva, no resuelta**: `setter-nav.tsx:38` afirma «Navegación SOLO por
   `triggerTransition` (decisión cerrada · CLAUDE.md)» mientras `CLAUDE.md` dice que `triggerTransition()`
   **no aplica en portales** y no clasifica `/setter/*` en ninguna de sus dos ramas. Ya estaba en el
   backlog (C-26) y sigue abierta: alcanza con que `CLAUDE.md` diga a qué rama pertenece la zona setter.

**Concurrencia observada EN VIVO durante esta corrida (evidencia de la propia lección L-01).** Mientras
corría, otra sesión commiteó cuatro veces en `main` sobre el mismo checkout (lane «M0 galería»:
`62ad4bf`, `9ecd20e`, `d3f540d`, `5c3c132`, más WIP suyo sin commitear en `scripts/dev/m0-galeria-seed.ts`
y `tests/galeria/captura.spec.ts`). Sus commits quedaron **intercalados** con los míos en el log. Los
tres commits de esta corrida se hicieron con `git add -- <pathspec>` explícito y verificando el set con
`git diff --cached --name-only` antes de cada commit: **cero archivos ajenos capturados** — exactamente
lo que propone M-02. Nada de esa sesión fue tocado.

**Cierre — verificado, no auto-confirmado.**
- `git show --stat` de los tres commits propios: `23a19c3` = 2 archivos (LECCIONES + PROGRESO),
  `f01a178` = 1 (PROPUESTA), `69d0fb4` = 1 (MAPA). **Solo `.md` bajo `docs/metodo/`.**
- Cero archivos de `src/`, tests o configuración en los diffs propios (verificado con
  `git diff --name-only` por commit, no de memoria).
- `git status` final: limpio salvo el WIP de la otra sesión y el `?? docs/probe-01-censo-cosecha.md` ya
  conocido — ninguno tocado.
- **Nada se ejecutó**: no se corrió `build`, ni `test:setter`, ni `test:leados`, ni `check:invariants`.
  Es una corrida de lectura y escritura de documentos; los verdes citados en los tres documentos son los
  que esta bitácora reporta, no re-corridos acá. Declarado también en `PROGRESO-D1.md` §Reporte final (6).

**PARA EL CHAT DE PLANIFICACIÓN**
Corrida D1 cerrada. (1) Las 4 partes completadas + cierre. (2) 20 lecciones con evidencia; 11 fuera de la
lista semilla; de las 8 semilla: 6 confirmadas, 1 con matiz (la del exit code: está la práctica datada
desde el sprint 5.2, no el incidente), 1 no confirmada y reformulada. (3) Cimiento y Manual **no están
en el repo** — propuesta escrita como documento autónomo, sin reconstruirlos. (4) 21 cambios de método
propuestos; el más urgente es **M-01/M-02** (un worktree por sesión + exclusividad de commit): es el
único que ya costó trabajo *perdido*, no demorado — el fix de `01-flow.spec.ts` se perdió dos veces y
hubo que recuperarlo de un commit huérfano (`44e25be` → `612c4ee`) y después rehacerlo (`b468ec6`).
(5) 7 decisiones tomadas dos veces documentadas (pin, costura `posicionDe`, vocabulario «caliente»,
numeración «Paso N», puente del self-check, `.last-run.json`, pase de píxeles). (6) Lo que no se pudo
establecer, declarado: el incidente original del exit code pipeado, qué pasó con el hueco del «sprint
5.2», y nada verificado en runtime. Sin push.

---

## Corrida M0 — galería de estados del Panel del Setter (base observacional del manual)

Instrumento, no feature: un sembrado que lleva la app a cada estado del recorrido del setter y una
captura que lo fotografía. Cero cambios en `src/`. 37 estados enumerados, **37 capturados, 0
inalcanzables**, más 4 vistas mobile — 41 `.png`. El producto es
`docs/manual-usuario/galeria/INDICE.md`; los binarios quedan fuera del repo (62 MB) y se regeneran
con `npm run galeria`.

**Cómo se sembró, dicho sin maquillar.** 8 estados por flujo real (los toques son `OsLeadActivity`
reales; la oferta de horarios de m16 pasa por `guardarHorariosOfrecidosOwned`, el write-path exacto
de la action), 2 provocados desde la UI (los errores persistentes de 4.1) y 27 sembrados directo por
stage + blobs. El motivo del directo es estructural y quedó registrado: **APROBADA y RECHAZADA no son
alcanzables desde el panel del setter** — aprobar/rechazar la demo y cargar la `finalUrl` son
acciones de Franco desde admin, así que todo el tramo Envío/Agenda/re-loop sólo existe para el setter
después de que un tercero actúe. El manual no puede prometer "hacé X y llegás acá" en ese tramo.

**Se reusaron los fixtures, no se escribió un sembrador paralelo.** `tests/helpers/setter-db.ts` sumó
campos opcionales (`exactName`, `progresoCompletadas`, `rechazosCount`, `sinFinalUrl`, `draftUrl`,
`nextFollowUpAt`); los 60 tests del setter siguen verdes sin tocarse.

**Dos hallazgos que valen más que la galería.** (1) **Cuatro de las cinco herramientas externas dicen
PENDIENTE** en la barra lateral de *todas* las capturas — Evaluador, Gem de diseño, Claude Design y
Gem de outreach no tienen URL; la única real es Netlify Drop. El manual manda al setter a
herramientas que desde el panel no existen. (2) **`fullPage: true` de Playwright no captura la
pantalla completa en `/setter/*`**: el layout scrollea un `<main overflow-y-auto>` y el `document`
mide siempre el viewport, así que toda pantalla larga sale recortada — la primera vuelta de esta
misma galería salió así antes de detectarlo. Afecta a cualquier job de screenshots de este portal, no
sólo a esta corrida.

Otros cuatro, con screenshot al lado en el índice: un lead que llegó a APROBADA muestra la
Construcción como no completada (el checklist es auto-reporte y el rastro sugiere que se saltearon
fases que evidentemente hizo); un toque vencido no se ve vencido ("Próximo toque: 22/7" en pasado,
sin marca de atraso); el home acumula ruido sin techo (60 novedades, campana 9+); y conviven checkbox
nativo y `role="switch"` para la misma idea de tildar.

Cierre verde con el prod-QA levantado: `tsc` exit 0, `check:invariants` exit 0, `test:leados` 25/25,
`test:setter` 60/60. Reproducible en dos corridas (el sembrador es idempotente y la captura resuelve
por `businessName`, sin ids hardcodeados). Sin push.

---

## Sprint P3.1 — la interfaz deja de decir cosas que no son

Ítems seleccionados del P3 del backlog (`docs/auditorias/AUDITORIA-CIERRE-2026-07.md`, §7) más el
hallazgo del toque vencido que la galería M0 ya había fotografiado. Todo presentación/copy; motor
intocable — 7 commits atómicos, uno por ítem.

**El misterio del sprint 5.2 (B-11), resuelto: NO está en HEAD.** `guia-retrabajo.tsx` en `main`
(`git log` solo muestra el commit `2d8a3bc` de A-26/A-29, ningún "sprint 5.2") renderiza el ÚLTIMO
rechazo nomás — motivo/dónde/arreglo, sin contador "Corrección N°{n}" ni `<details>` de correcciones
anteriores. La galería (captura #26) fotografió una feature que nunca llegó a `main`. **B-11 sigue
pendiente** — no se implementó en este sprint (fuera del alcance pedido, solo el diagnóstico).

**Hecho:**
1. **El vencido se ve vencido (P3#5).** `m5-seguimiento.tsx`: nueva rama `toqueVencido` (proximoToque
   pasado + no respondió + no postergado) → "Toque vencido — era para el {fecha}" en ámbar, antes de
   caer al "Próximo toque" normal. `respondioDesde` (`_data.ts`) dejó de leer `lead.updatedAt`
   (cualquier mutación del dossier lo pisaba, falseando la espera del `UrgenciaBanner`) y ahora busca
   la última activity con `result: 'RESPONDIO'` — con fallback a `updatedAt` solo si no hay ninguna.
2. **Clamps y topes (P3#3).** `textoLibre` (contracts.ts, el preprocessor compartido de Ficha/Brief/
   Rechazo) sumó `.max(5000)` — techo de sanidad, no de UX. `line-clamp-2` en el h1 de la cabecera del
   manual y en el bloque de rechazo del `LeadCard` de cartera; `line-clamp-3` en las notas del lead.
   `break-words` en los 4 `<pre>` que faltaban (CopyBlock, brief-form, ficha-step, m3-veredicto) y en
   la nota del timeline — `whitespace-pre-wrap` solo envuelve en espacios, no corta tokens largos.
3. **Un solo verbo (P3#7).** Censo por grep: "Pausado" domina ampliamente en todo el setter (badges,
   toasts, `flow.ts`, invariantes); "Parquear" solo vivía en `foco-surface.tsx` + un comentario de
   `foco.actions.ts`. Unificado a Pausar/Pausado — coincide además con el nombre real de la action
   (`pausarLead`).
4. **Chip ACTIVO (P3#8).** `NavAtras` usaba emerald para el paso activo entre completados; su hermano
   `NavConstruccion` ya usaba cyan para el mismo concepto. Unificado a cyan.
5. **`<span/>` vacío (P3#9).** Mismo archivo que el ítem 1: sin teléfono, `m5-seguimiento.tsx` ahora
   muestra el texto literal que ya usaba `m16-agenda.tsx` ("Sin teléfono cargado en la ficha.") en vez
   de un span vacío.
6. **Pluralizar horarios (P3#11).** `buildHorariosMensajeBlock` arma "un horario" / "N horarios" según
   `slots.length` real, en vez de un "tres" fijo que mentía si el setter cargaba otra cantidad.
7. **Placeholders "sin migrar" (P3#10, mitad segura).** Las 16 pantallas del manual están migradas
   (corte 5.6) — cada rama del switch de `page.tsx` siempre pasa `contexto`/`municion`/`captura`, así
   que el placeholder dashed de `Zona()` en `pantalla-manual.tsx` era código muerto, nunca visible al
   setter. Simplificado: `Zona` sin contenido ahora no renderiza nada (mismo criterio que ya usaba la
   reentrada). Las `GUIA_CONSTRUCCION`/`REVISION`/`TRASPASO` de `guidance-content.ts` se verificaron
   SIN tocar: 0 referencias fuera de su propia definición — muertas y sin cablear, decisión de
   contenido de Franco, anotado sin implementar.
8. **Lente novato (P3#14/#15).** `STATUS_LABELS.VIO_VIDEO` ya dice "En conversación" en `flow-content.ts`
   — P3#14 resuelto de rebote, probablemente por el sprint 1.1 (el admin conserva su propio label
   "Vio video", fuera de este scope). P3#15 seguía literal: reformulado "entra fría, en ficha" (jerga
   interna: caliente/stage) a "entra a tu cartera sin marca de caliente, lista para completar la
   Ficha" en `nuevo/importar/page.tsx` e `importar-prospectos-form.tsx`.

**Cierre:** `tsc` exit 0 · `check:invariants` 17/17 · `test:leados` 25/25 · `test:setter` 60/60.
`git diff --stat` contra el HEAD previo: 17 archivos, todos dentro de `setter/` o helpers de copy/
contratos — sin tocar motor. Sin push.

---

## Corrida M1 — el manual de usuario del Panel del Setter, escrito desde la observación

Documento, no feature: **cero cambios en `src/`, en tests y en config**. El diff son 13 archivos, los
13 bajo `docs/manual-usuario/`. El producto es `00-INDICE.md` + 10 capítulos; el byproducto de
auditoría es `HALLAZGOS-MANUAL.md`.

**La galería se regeneró antes de escribir una línea.** Los 41 `.png` de M0 existían, pero eran de
`6a88cbe` — **anteriores a P3.1**, el sprint que cambió copy de pantalla (el vencido visible en m5, el
`Parquear`→`Pausado`, la pluralización de los horarios, los placeholders de `Zona()`). Un manual
escrito contra esas fotos habría citado texto que la app ya no dice. Se corrió `seed:galeria` +
`SETTER_EXTERNAL_SERVER=1 galeria:capturar` contra el mismo prod-QA :3001 que después se usó para
navegar. 41/41 en 1,9 min.

**La regla de oro se sostuvo, y una vez se aplicó contra mí mismo.** Cada afirmación sale de la app
viva, de un screenshot o del copy literal — en ese orden. Se navegaron **en vivo los caminos felices
de 7 de los 10 capítulos**, no sólo se miraron fotos: cargar una ficha de cero y ver que el gate pasa
de "Todavía falta" a "✓ Señal mínima lista"; registrar veredicto AVANZAR y caer en m4 con la etiqueta
EVALUADA; mandar el opener y caer EN ESPERA con la fecha del próximo toque calculada sola; guardar el
brief y caer en CONSTRUCCIÓN PASO 1 DE 6; arrancar construcción y tildar una fase; pegar una URL
inválida y ver el error quedarse fijo; pasar los 6 obligatorios y mandar a revisión. **Dos acciones no
se ejecutaron a propósito**: `Confirmar y agendar` (crea un evento en el calendario real de Franco y
dispara un mail al prospecto) y el `Enviar aviso` del escalamiento.

**Lo que la corrida encontró sin buscarlo: 18 hallazgos.** Cuatro son *me frena*:

1. **4 de 5 herramientas siguen sin URL** (`herramientas.ts` sin cambios desde M0) — **10 de las 16
   pantallas** mandan a un acceso que dice `PENDIENTE` / `Link pendiente`. Sigue siendo el techo real
   del recorrido.
2. **Los 6 tildes del chequeo final se pierden si no se toca `Guardar el chequeo`** — verificado:
   marcar los seis, salir y volver deja los seis en rojo. Lo caro no son los clics: cada tilde exige
   abrir el borrador en incógnito y en el celular y tocar cada link. Agravante de aprendizaje: m1 le
   enseña al setter *«Se guarda solo mientras escribís»*.
3. **Las dos esperas de m15 muestran texto idéntico con causas opuestas** — verificado contra la DB:
   #28 es `status PROSPECTO` + `finalUrl` cargada (falta el negocio); #29 es `status RESPONDIO` +
   `finalUrl: null` (falta que Franco cargue el link). Las dos dicen *«si el negocio responde,
   registralo»*, que en #29 es una acción ya ocurrida y que no destraba nada.
4. **`Buscar horarios libres de Franco` devuelve jerga de sistema al setter**: *«Setup B7.0 pendiente:
   cargá en la organización develOP el username de Cal.com (calComUsername)…»*, en imperativo, a una
   persona que vende. Es la única pantalla que esquiva el traductor de `error-copy.ts`.

**Tres hallazgos corrigen datos de M0**, y uno de ellos me corrigió a mí. `35-home-foco.png` y
`36-home-cartera.png` son **el mismo archivo** (mismo md5): la captura del #36 espera la sección
plegada y dispara sin desplegarla, así que la galería nunca fotografió la cartera. El estado #26 no
muestra las correcciones anteriores colapsadas — coincide con lo que P3.1 ya había diagnosticado (la
feature de B-11 nunca llegó a `main`), y lo que M1 agrega es la consecuencia: la frase *«el historial
de rechazos se conserva»* sigue prometiendo lo que no hay. Y en sentido inverso: **afirmé que el
checkbox de m16 ya no existía y era falso** — mi propio volcado de controles lo salteaba porque el
`<input type="checkbox">` no tiene `id`, `name` ni `aria-label`. Se verificó contra el DOM, se
corrigió el hallazgo, y la falta de nombre accesible quedó registrada como lo que es.

**El patrón que más se repitió** — 5 hallazgos de 3 tramos distintos — es **acción sin acuse en el
lugar del clic**: `Saltar` que tarda segundos sin señal (y dos toques te devuelven al inicio), el
tilde de fase que no se ve tildar, los tildes del chequeo que se pierden, `Guardar ficha` junto a
«se guarda solo».

**Un tramo quedó declarado NO documentado, en vez de inventado**: cómo se ven los horarios cuando
Cal.com los trae de verdad. No se pudo ejecutar (falta `calComUsername`/`calComEmbedUrl` en la
organización del entorno) y los horarios de la foto #31 los puso el sembrador. El capítulo 09
describe todo lo demás del paso y avisa qué parte no pudo verse; el índice lo repite al frente.

**Cierre:** `git diff --stat` contra `e7f81ab`: **13 archivos, 2.692 inserciones, 0 eliminaciones,
todos bajo `docs/manual-usuario/`**. Cero `src/`, cero tests, cero config — no se corrieron `tsc` ni
las suites porque no había nada que romper. El WIP ajeno (`docs/probe-01-censo-cosecha.md`, untracked)
quedó intacto. Sin push.

---

## PROBE · Terreno para la poda del Panel del Setter — 2026-07-31

Corrida de **relevamiento**, no de sprint: diez ítems independientes para fundamentar el plan de poda
de LeadOS, sin planificar ni proponer. Reporte completo en
[`docs/probe-poda-terreno.md`](probe-poda-terreno.md). Rama `redesign/home`, HEAD `11eee1b`, working
tree limpio de punta a punta.

**Ocho ítems cerrados, dos parciales, ninguno sin relevar.** Los dos parciales lo son por falta de
acceso **fuera** del repo, no por fallo de la corrida: R5 no pudo medir el progreso guardado en
producción (solo existe `DATABASE_URL` local y apunta al branch Neon de dev) y R8 no pudo leer el
panel de env vars de Netlify/Vercel. Los tres ítems de mayor costo-si-me-equivoco (R3, R8, R9)
pasaron por un verificador adversarial con consigna de refutar: los tres volvieron
**CONFIRMADO_CON_CORRECCIONES** — conclusión central en pie, con errores de evidencia plegados y
marcados en el reporte (números de línea envejecidos, un `grep` que devolvía 19 y se reportó como 1,
y una lista de call-sites de `gateEnvioDemo` a la que le faltaba `manual.ts`, que es justo el módulo
que decide qué pantalla ve el setter).

**Las cuatro suites están verdes hoy, sin deuda:** `tsc --noEmit` exit 0 (salida de 0 bytes),
`check:invariants` **17/17**, `test:leados` **25/25**, `test:setter` **60/60** en 3.4 min — los cuatro
números exactos que registró el cierre del bloque anterior en `:1933`. El `test:setter` lo dejó
abierto el relevador paralelo (12/12 al corte) y lo cerró el agente padre con los puertos verificados
libres de antemano.

**El hallazgo que más cambia el plan salió de R4** (el único ítem que tocó archivos). Achicar
`FASE_IDS` lo detectan exactamente dos guardianes: `tsc` (4 errores con 4 fases, 16 con 2) y
`check:invariant:progreso` (`6 !== N`). Los dos specs de `tests/leados` **no detectan nada con 4
fases** — derivan sus fixtures de `FASE_IDS` en vivo — y con 2 fallan por sus propios índices
`undefined`, no porque la lógica se dé cuenta. Y el progreso **ya guardado se vacía en silencio y es
todo-o-nada**: `parseProgreso` (`flow.ts:131-134`) hace `safeParse` contra `z.enum(FASE_IDS)` y ante
cualquier fallo devuelve `{ completadas: [] }`. Una sola llave muerta —en `completadas`, `faseActual`
o `marcadas`— borra el objeto entero: se midió un lead con 3 fases de las cuales 2 seguían existiendo,
y quedó en 0, sin error ni log. Aguas abajo, `manual.ts:450` deja de marcar m7–m12 y el setter vuelve
al principio de la Construcción. Agravante: `next.config.ts:10-15` tiene `ignoreBuildErrors: true`,
así que el guardián de tsc **no frena un deploy**.

**Lo que queda abierto para quien planifique.** (a) El *inventario de 16 pantallas con destino* que el
`HANDOFF` cita como §9 del brief v3 **no existe en el repo** — el archivo commiteado tiene 11
secciones y su §9 es «Qué queda fuera»; la vara de la poda está fuera del árbol. El censo real son
**6 patrones de URL y 23 pantallas renderizadas**, con `/setter/nuevo`, `/setter/nuevo/importar` y el
historial del lead ausentes de todo inventario documental. (b) La decisión sobre links en el opener
sigue siendo de Franco: la regla vive en **un solo lugar** (`flow.ts:205`, dos call-sites), pero el
precio son ~3 archivos de lógica, **8** de copy que la afirman en prosa —incluido el prompt que se le
pega al Gem de outreach—, **4+** artefactos de test y 6+ documentos. (c) El número de progreso
guardado en producción. (d) Si `QA_ALLOW_LOCALHOST` está definida en el entorno de prod: el guard de
`/api/qa/login` se evalúa en **request time** (verificado en el bundle compilado), así que setear esa
variable en un deploy ya construido abre la puerta **sin rebuildear**.

**Dos cosas del terreno que conviene saber.** Otra sesión trabajó sobre este mismo checkout en
paralelo: el HEAD se movió `e06e3c4` → `11eee1b` a mitad de corrida (commit docs-only) y `.next` se
vació a las 01:53. Por eso **R4 se corrió en un `git worktree` aislado en vez del checkout
compartido** — checkoutear una rama descartable en un índice compartido habría puesto los commits
ajenos sobre una rama que después se borra con `-D`. Los 8 pasos del protocolo se cumplieron igual y
la prueba de inocuidad está pegada en el reporte: `git status --porcelain` vacío, HEAD idéntico al
anotado, y el blob de `contracts.ts` igual byte a byte al de HEAD.

Además del relevamiento pedido, quedaron registrados **55 hallazgos laterales** en el bloque final del
reporte. Los tres que más pesan: `src/app/api/test-sentry/route.ts` es un endpoint **sin ningún
guard** que viaja al bundle de producción y genera un 500 no autenticado; `validate-origin.ts:49` es
una segunda superficie de la misma variable de QA con **una sola pata** (la satisface un `curl` sin
header `Origin`); y los invariantes corren bajo type-stripping de Node, **sin type-check** — medido:
con `FASE_IDS` en 4, `tsc` marca errores en `manual.ts` y `check:invariant:manual` pasa igual.

**Cierre:** `git diff --stat` contra `11eee1b`: **2 archivos, ambos bajo `docs/`**. Cero `src/`, cero
tests, cero configuración — el único archivo de código que se tocó en toda la corrida vivió y murió
dentro del worktree descartable. Sin push.

## Sprint P1 — poda del Panel del Setter: seis correcciones de copy, cero lógica — 2026-07-31

**Terreno.** Arrancó en `redesign/home`, `7bc0a82`, sobre el worktree principal (no uno dedicado).
`git status --porcelain` mostró 11 archivos con WIP ajeno (landings de marketing + `navigateToPage.ts`,
nada del setter) — se frenó y se preguntó; Franco confirmó que era su propio WIP en curso y que
siguiera sin tocarlo. `tsc --noEmit` de partida: exit 0.

**Seis objetivos, cinco aplicados, uno ya resuelto.**
1. **H-02** (`novedades-panel.tsx:139`) — "la más vieja hace **hace** 45 días": `formatEspera` ya
   antepone "hace", el label lo repetía. Se sacó el "hace" del prefijo (`'' | 'la más vieja '`) — el
   mismo bug estaba también en el caso singular ("hace **hace** 1 día"), se corrigió junto por ser la
   misma línea y la misma causa.
2. **H-18** (`cartera-toolbar.tsx:28`) — el filtro "Perdidos (post-reunión)" lista negocios cerrados
   en evaluación, sin reunión: `archivoCausaDe` (flow.ts) clasifica como "perdido" todo lo que Franco
   cierra fuera de DESCARTADA, en cualquier punto del recorrido. Label nuevo: "Perdidos (cerrados por
   Franco)".
3. **H-09** — **ya resuelto, salteado.** `seguimiento-form.tsx:85-87` filtra `SIN_RESPUESTA` del
   array de opciones cuando `cadenciaAgotada`; la opción "toque 4" deshabilitada no existe en el DOM
   actual. Grep en todo `src/` sin matches de ese label.
4. **H-13** (`agenda-form.tsx:160-165`) — el checkbox de "Estoy hablando con el dueño / quien decide"
   ya estaba envuelto en `<label>` (asociación implícita válida), pero sin nombre accesible propio; el
   cómputo del navegador arrastraba el ícono y el hint dinámico. Se agregó `aria-label` explícito y
   corto — atributo, sin tocar el envoltorio.
5. **Límites de Instagram** (`flow-content.ts` + `canal-seguridad.tsx`) — `topeDiarioDms/avisoDesdeDms/
   ritmoPorHora` bajaron de `30/24/6` a `10/8/3` (perfil de cuenta nueva). Comentario de decisión
   agregado arriba de la constante. Los tres textos del cartel se reescribieron para explicar el
   ramp-up (el número de hoy no es un techo permanente, crece con la cuenta) en vez de mostrar un
   número fijo — sin agregar bloqueo, el cartel sigue siendo informativo. El array `warmUp` (mismo
   objeto, misma superficie de UI) tenía semana 2 en "10–20/día", por encima del nuevo tope de 10:
   se reescribió para no contradecir el número nuevo.
6. **Comentario del contador** (`_data.ts:113`) — decía "DMs comerciales de hoy del setter";
   `contarDmsHoy` (outreach.ts:55-57) solo cuenta `channel: 'INSTAGRAM_DM'`. Alineado a "DMs de
   Instagram de hoy del setter".

**Lo que quedó anotado sin tocar** (fuera de scope por instrucción explícita): los dos hallazgos de
guardado (tildes que se pierden, "se guarda solo") — viven en pantallas que la poda va a rehacer; el
monolito de la ruta del manual; cualquier cosa de lógica, gates o schema.

**Verificación.** `tsc --noEmit`: exit 0. `check:invariants`: **17/17**, exit 0. `git diff --stat`:
**6 archivos**, todos copy/atributo (`novedades-panel.tsx`, `cartera-toolbar.tsx`, `agenda-form.tsx`,
`flow-content.ts`, `canal-seguridad.tsx`, `_data.ts`) — ninguno de lógica, gates ni schema. Sin push.

**Para Franco, por escrito — no autocerrado.** Los tres textos nuevos del cartel de Instagram
(`canal-seguridad.tsx`) los tiene que ver en preview: es criterio comercial, no algo que un `tsc` en
verde valide. Los números del perfil conservador (`10/8/3`) son una propuesta del research citado en
la tarea — Franco los ajusta según el historial real de la cuenta que va a usar el setter.

## Sprint P4 — poda del Panel del Setter: las dos pantallas de evaluación son una — 2026-07-31

**Terreno — se frenó y se preguntó.** Arrancó en `redesign/home`, `3fd3d1d`, sobre el worktree
principal (no uno dedicado — las otras dos copias están en `chore/auditoria-clean` y `main`, así que
la rama solo puede vivir acá). **Tres de las cinco condiciones de la Fase 0 no se cumplían** y el
sprint no arrancó hasta destrabarlas por escrito:

1. **WIP ajeno** — `git status --porcelain` con 11 archivos del rediseño de home (`layout.tsx`,
   design-system, y los borrados de `SectionTransition`/`AIBentoGrid`/`PortalDemo`/`TypewriterText`/
   `MagneticCta`/`home-routes.ts`), **cero del setter**. Mismo caso que frenó a P1. Se confirmó que
   era WIP propio en curso y que siguiera sin tocarlo. **Creció durante la corrida** (aparecieron
   `contact/page.tsx`, `globals.css`, `Navbar`, `Hero`, `DynamicDock` borrado, `whatsapp.ts`…): otra
   sesión trabajó sobre este mismo checkout en paralelo, igual que en el PROBE de `:2006`.
2. **`tsc --noEmit` arrancó en rojo, exit 2** — un error, **ajeno al sprint y al WIP**:
   `src/lib/searchconsole.ts:119`, dos copias de `google-auth-library` (la de `googleapis` contra la
   que anida `@google-analytics/data@5.2.2 → google-gax@5.0.7`). El archivo no está tocado por nadie
   y `package.json` no cambió — la dependencia entró en `68f406d`, hace meses. El PROBE de esta misma
   mañana y P1 arrancaron los dos en **exit 0** (`:2028`), así que el árbol de `node_modules` se
   movió después, probablemente por un `npm install` que re-resolvió la anidación. Se acordó
   **línea base declarada**: ese error y ninguno nuevo. Al cierre: **idéntico, cero errores nuevos**.
3. **Worktree no dedicado** — ver arriba.

`check:invariants` sí arrancó verde: **17/17, exit 0**.

**El descubrimiento, y la pregunta que decidía el riesgo.** La posición **se DERIVA en cada request,
no se guarda** — `manual.ts:8-10` lo promete y se verificó: `derivarPantalla` calcula todo desde
stage + blobs + checklist; **cero `PantallaId` en `prisma/`**; el grep fuera de `manual.ts` solo
devuelve el `[paso]` de la URL y una prop de UI de `manual-nav.tsx`. El único blob con ids
persistidos es `progresoJson`, que guarda **`FaseId`** (las 6 fases de Construcción — la lista que
este sprint tenía prohibido tocar, y no tocó). Por eso la fusión era segura y **no hay leads que
migrar**: un `m3` guardado en un bookmark cae en `esPantallaId('m3') === false` → `redirect` a la
actual. De haber estado guardado, era el mismo patrón que vacía progreso en silencio (`:2035`) y el
sprint se frenaba.

**La fusión.** Sobrevive `m2` y absorbe a `m3`, que **desaparece del registro** (`PANTALLA_IDS`,
`PANTALLAS`, `FASES_MANUAL.evaluacion`, `ORDEN_MANUAL`).

- **Título nuevo**: «Llevá la ficha al Evaluador» + «Registrá el veredicto» →
  **«Llevá la ficha a evaluar y registrá el veredicto»**, los dos movimientos en el orden en que
  ocurren, con el patrón que ya usaba `m13` («Publicá y registrá el link del borrador»). El chip
  corto pasa de «Al Evaluador» a «Evaluación». El indicador queda en «Evaluación — paso 1 de 1».
- **Un solo bloque visual, no dos pegados**: las dos traían tratamiento propio para la MISMA ficha —
  `m2` la servía como `CopyBlock` (copiable) y `m3` como `<pre>` crudo (abierta, A-22). Se unificó en
  `CopyBlock`, que ya es las dos cosas: se copia para el viaje y queda abierta y scrolleable para
  transcribir contra ella a la vuelta. Las tres zonas del layout-tipo (`PantallaManual`) ya eran un
  marco común, así que la pantalla fusionada llena contexto/munición/registro sin costura.
- **La rama muerta se sacó, no quedó inalcanzable**: la cadena de condicionales de
  `manual/[paso]/page.tsx` pasa de dos ramas a una (y el árbol entero desanida un nivel — de ahí el
  tamaño del diff en ese archivo: es re-indentación, no lógica nueva). `m3-veredicto.tsx` **borrado**;
  su registro (el form compartido `EvaluacionForm`/`EvaluacionResumen`, que NO se tocó) vive ahora en
  `M2Registro`.
- **Derivación**: `completadasDe` deja de marcar `m3`; `posicionDe` devuelve `['m2']` en FICHA (ya no
  hace falta habilitar un destino para la vuelta) y `m2` en DESCARTADA. **Sin caso por defecto y sin
  tocar el never-guard** — la exhaustividad por stage quedó intacta.
- **La herramienta pasa al chat de Sonnet** (`herramientas.ts`): nombre «Evaluador» →
  **«Chat de evaluación (Sonnet)»** y descripción reescrita. La dirección sigue **pendiente por el
  mecanismo que ya existía** (`url: null` → la UI muestra el acceso como pendiente en vez de un link
  roto). No se inventó ninguna URL.
- **Copy del paso que desapareció**: se fueron los dos `<Link>` a `m3` y sus textos («El veredicto se
  registra en la pantalla siguiente», «esta pantalla queda de consulta»), el detalle del registro
  («volvé con el resultado») y las menciones de la munición al Gem. Quedan cero referencias a `m3` en
  `src/`.

**Los tests.** `manual.invariant.ts` ejercita la fusionada; los dos `goto` de `01-flow.spec.ts` (B2 y
B9) y sus dos asserts de URL apuntan a `m2`.

**La expectativa que se ajustó, declarada — no en silencio.** Es una sola, en
`manual.invariant.ts:88`: `assert.equal(descartada.actual, 'm3', …)` → **`'m2'`**. La garantía que
protege NO cambió (DESCARTADA conserva su case por stage y no cae al archivo); cambió **dónde vive el
veredicto**, que es exactamente el objetivo del sprint. **No existe ningún invariante que assertee la
cantidad de pantallas del registro** — se buscó explícitamente y no está, así que el ajuste
anticipado por el plan (una pantalla menos) no aplicó a ningún contador.

**Lo que quedó anotado sin tocar.** El monolito de `manual/[paso]/page.tsx` (la cadena de
condicionales sigue siendo una escalera de 12 ternarios anidados; este sprint le sacó uno). Los dos
hallazgos de guardado (los tildes que se pierden, el «se guarda solo») — viven en pantallas que la
poda rehace después. El vocabulario: «el Evaluador» sobrevive en `guidance-content.ts`
(`GUIA_FICHA.copyBlock`, el `intro`/`porque`/`ejemplos` de `GUIA_EVALUACION`) y en el label
«Veredicto del Evaluador» del form compartido — es el barrido general, otro bloque, y tocarlo acá
habría movido copy del wizard y roto specs por fuera del objetivo. `GUIA_EVALUACION.intro` además no
se renderiza en ninguna pantalla (solo `criterios`/`campos`/`gate` llegan a la UI). La galería M0:
`03` y `04` quedan fotografiando el MISMO estado (el sembrador les da a los dos `stage: FICHA` +
señal); colapsarlas y renumerar es trabajo del bloque M0, así que los tres estados apuntan a `m2` y
**los nombres de archivo se conservaron** porque el índice de `docs/manual-usuario/galeria/` los
referencia.

**Verificación.** `tsc --noEmit`: **exit 2 con el MISMO error preexistente de `searchconsole.ts` y
cero errores nuevos** — línea base declarada arriba, leída del proceso sin pipe.
`check:invariants`: **17/17, exit 0**. `test:leados`: **25/25, exit 0** (1.4m).

**`test:setter` NO cerró: 41 passed / 19 failed, exit 1 (11.4m) — por colisión ambiental, no por el
sprint.** El diagnóstico, con evidencia: los 19 fallos arrancan en `03-cabina` y siguen en cascada
(`04-admin`, `05-empty-mobile`, `07`, `08`, `09`, `10`, `11`, `13`), y **7 de los 19 traen el síntoma
directo** — `_next/static/*.css|js` servidos como `text/plain` y `500 (Internal Server Error)`; los
otros 12 son su consecuencia (sin CSS ni hidratación, los locators no se ven, el drawer no abre, el
`aria-pressed` no cambia). Causa: **la suite comparte el directorio `.next` con la otra sesión**.
`next start` de QA sirve `:3001` desde el mismo `.next` que un `next dev` de `:3000` reescribe:
el proceso de `:3000` **arrancó 19:12:44**, con la suite ya corriendo (largó ~19:08), y `.next/trace`
quedó reescrito **19:18:40**, en plena corrida. Es el mismo patrón que el PROBE registró en `:2088`
(«`.next` se vació a las 01:53») y que lo llevó a aislar R4 en un worktree.

**Lo que sí quedó probado de la fusión:** los DOS tests que la ejercitan **pasaron** —
`B2 · EVALUACIÓN: registrar (AVANZAR) transiciona FICHA→EVALUADA` y
`B9 · DESCARTADA: score bajo → modal → archivo`, ambos de `01-flow.spec.ts`, que corrió completo
antes de que `.next` se rompiera. Ninguno de los 19 fallidos está en el archivo que el sprint tocó.
**La suite queda pendiente de una corrida limpia** (sin dev server sobre el mismo checkout) — no se
declara verde y **el sprint no se autocierra**.

**`git diff --stat` del sprint — 10 archivos**, todos de la fusión: `manual.ts` (registro y
derivación), `manual.invariant.ts`, `manual/[paso]/page.tsx` (la cadena de condicionales),
`m2-evaluador.tsx` (absorbe el registro), `m3-veredicto.tsx` (**borrado**), `herramientas.ts`,
`pantalla-manual.tsx` y `evaluacion-form.tsx` (un comentario cada uno), `tests/setter/01-flow.spec.ts`,
`tests/galeria/captura.spec.ts`. **Cero gates, cero transiciones, cero aislamiento, cero schema** —
`dossier.actions.ts`, `flow.ts`, `dossier.ts`, `contracts.ts` y `prisma/` intactos. El resto del
`git status` es WIP ajeno que no se tocó. Sin push.

**Para Franco, por escrito — no autocerrado.** (1) El **título** «Llevá la ficha a evaluar y registrá
el veredicto» y el orden de los dos movimientos son criterio de producto: los aprueba él en el
preview. (2) Que la pantalla fusionada **se lea como un solo paso y no como dos pegados** lo cierra él
mirando — ningún test lo valida. (3) Falta la **dirección del chat de evaluación en Sonnet**: hoy la
UI muestra el acceso como «pendiente» (`url: null`), que es el comportamiento correcto hasta que él
cargue el link real.

**Reintento de `test:setter` — segunda contaminación, distinta causa, mismo origen.** Con el puerto
3001 liberado a mano (había quedado un `next start -p 3001` huérfano de la primera corrida, que
Playwright reusa **en silencio** por `reuseExistingServer` y habría servido el build corrupto), el
segundo intento abortó de entrada: `⨯ Another next build process is already running` — un
`next build --webpack` **ajeno** (PID 21624, 19:25:51) tenía tomado `.next/lock`. El lock NO se tocó;
la corrida se encoló hasta que se liberó (5s) y arrancó sola. Resultado: **32 passed / 28 failed,
exit 1** (13.2m). Durante esa corrida la otra sesión levantó **dos servidores más** sobre el mismo
`.next` — `next start -p 3002` (19:27:13) y `next start` (19:32:25), ambos con la suite ya corriendo.
El punto de quiebre lo muestra: los tests **1 al 14 pasaron todos** y el primer fallo aparece recién
en el #15 (`B10`, `01-flow.spec.ts:350`), justo después de que arrancaran los servidores ajenos.
(Nota de método: `tests/setter/.last-run.json` **no es fuente confiable acá** — es un archivo único
que cualquier corrida concurrente sobrescribe; sus números no coincidían con los de la corrida propia,
así que el conteo se leyó del log de la corrida, no del JSON.)

**Conclusión sobre la suite: no se declara verde y no se reintenta más.** Dos corridas completas, dos
contaminaciones por procesos ajenos arrancando a mitad de camino (19:12:44 la primera; 19:27 y 19:32
la segunda). Un tercer intento es tirar 13 minutos contra una carrera que esta sesión no controla: la
suite necesita el checkout quieto (sin dev/start/build de otra sesión sobre el mismo `.next`).
**Lo que las DOS corridas prueban de forma concordante:** `B2 · EVALUACIÓN: registrar (AVANZAR)
transiciona FICHA→EVALUADA` y `B9 · DESCARTADA: score bajo → modal → archivo` —los dos únicos tests
que ejercitan la fusión— **pasaron en ambas**, y en la segunda `01-flow.spec.ts` corrió entero hasta
B9 sin un solo fallo. Ningún fallo, en ninguna de las dos, cayó en la superficie que el sprint tocó.

---

## Sprint P5-A — poda del Panel del Setter: la ficha recibe el material de la demo — 2026-08-03

**Terreno — limpio, por primera vez en el bloque.** `redesign/home`, HEAD `5d844bb` (el P4 que fusiona
m2+m3, presente y verificado). `git status --porcelain` **vacío** — sin WIP ajeno, a diferencia de P1
y P4. Worktree principal `C:/PorfolioDevelOP` (los otros dos siguen en `chore/auditoria-clean` y
`main`). Línea base de tipos: **exit 2 con un solo error, el mismo preexistente y ajeno** de
`src/lib/searchconsole.ts:119` (doble copia de `google-auth-library`); el error del frente público que
el encargo anticipaba **no apareció**. `check:invariants` **17/17, exit 0**. Al arrancar, **cero
procesos node** sobre el checkout — el `.next` estaba quieto.

**El descubrimiento corrigió la premisa del encargo, y eso cambió el trabajo.** El encargo decía
«el material que hoy se junta en el paso del brief». **No es así: M6 no junta material del negocio.**
M6 («Armá el brief») pide el pegado crudo del Gem de diseño + 5 campos estructurados (`titulo`,
`secciones`, `cta`, `concepto`, `notasMarca`) y persiste en `briefJson`. El material —reseñas, logo,
fotos, tono— ya vivía en la **ficha (M1)**, en `fichaJson`. **Son dos columnas Json distintas de la
misma fila `OsLeadDossier`**, con schemas, actions, gates y pantallas separadas: no hay estructura
compartida que fusionar.

**El solapamiento real es UNO solo, y es chico:** `brief.notasMarca` («Colores, tono, logo: lo que la
demo tiene que respetar») pisa a `ficha.contenidoReal` («Contenido real — logo / fotos / tono»).
Es el único campo que P5-B puede retirar sin perder nada. **Consecuencia para P5-B: el retiro de M6 no
es «mover campos a la ficha» —no hay campos que mover—, es decidir qué pasa con `pegadoGem` y
`secciones`**, que hoy alimentan `buildConstruccionBlock` y no tienen equivalente en la ficha.

**La pregunta que decidía el precio: NO hace falta tocar la base.** `fichaJson` es `Json?`
(`schema.prisma:992`) y su contrato es `FichaSchema` (`contracts.ts:33`), cuyo encabezado ya declara
el mecanismo: *«contratos base MINIMALES a propósito: B3/B4 los extienden acá mismo con campos
opcionales nuevos, sin romper datos ya guardados»*. Los campos nuevos entran en el blob. **Cero
migración, cero `prisma generate`, cero decisión pendiente de Franco sobre el schema.**

**Lo que se agregó — cinco campos, todos opcionales, en un grupo `materiales` anidado** (mismo patrón
que `identidad`), y una sección propia en el formulario titulada **«Material para construir la
demo»**: tres direcciones (`resenasUrl`, `imagenesUrl`, `otraRedUrl`) validadas con
`EnlaceFichaSchema` —el patrón `optionalUrl` que el repo ya usa, con el tope de largo de
`DraftUrlInputSchema`— y dos de texto libre (`queVende`, `comoSePresenta`). Son URLs y texto: **no se
construyó ninguna subida de archivos**, según la restricción declarada.

**Los campos NO entran en `fichaFaltantes`.** El gate de señal mínima quedó intacto a propósito:
suman material, no mueven la puerta. Un lead viejo no ve faltantes nuevos.

**Trampa encontrada y cerrada — `aPayload` podía tirar abajo el formulario.** `faltantesEnVivo` re-arma
el payload con `FichaSchema.parse` **en cada render**, y el autosave hace lo mismo. Con `.url()` en el
schema, una dirección a medio pegar (`h`, `ht`, `http`) hacía **throw en cada tecla**. Se resolvió sin
aflojar el contrato: `aPayload` pasó a `safeParse` y, si falla, re-arma sin los enlaces —que el
formulario ya marca en rojo— para que el resto del trabajo escrito se siga autoguardando; el guardado
explícito **se bloquea** con mensaje visible. Cliente y servidor validan con el MISMO schema exportado,
así no pueden divergir. El rojo aparece al SALIR del campo, no mientras se tipea (mismo criterio que
los nudges de calidad que ya existían).

**El consumidor.** `buildConstruccionBlock` (el bloque para Claude Design, `copy-blocks.ts:154`)
ahora lleva el material: la dirección del logo/fotos encabeza «DE DÓNDE BAJAR EL LOGO Y LAS FOTOS
REALES», las reseñas viajan con su link, y entran dos secciones nuevas —«QUÉ VENDE Y A QUÉ PRECIO» y
«CÓMO HABLA EL NEGOCIO DE SÍ MISMO»—. **Degradación honesta, verificada:** se reusó el helper
`seccion()` que ya define el criterio del archivo (vacío → `null` → `filter(Boolean)` lo saca), así que
un campo sin cargar **se omite**; no hay placeholder, no hay «falta X», no quedan títulos huérfanos ni
renglones dobles. Se sumó también a `buildFichaCopyBlock` porque es la forma canónica en texto de la
ficha: es lo que ve la **vista congelada** post-evaluación, y dejarlo afuera habría hecho que el
material desapareciera de la vista apenas se registra el veredicto — exactamente la omisión estructural
que documenta el comentario A-21 de ese mismo archivo.

**Verificación de que un lead viejo sigue andando — hecha, no asumida.** Script de 30 aserciones
(`tsx`, descartado al cerrar) sobre un blob con la forma EXACTA de un guardado pre-P5-A, sin la clave
`materiales`: `parseFicha` no devuelve `null`, los seis campos viejos llegan intactos, `materiales`
queda `undefined` (no se inventa un grupo vacío), **`fichaFaltantes` da lo mismo que antes** y
`fichaTieneSenal` sigue `true`; los dos bloques copiables no muestran ni un título del material nuevo
y no aparecen huecos. Cubre además ficha vacía `{}`, `ficha: null`, material parcial (aparece lo que
hay, se omite lo que falta), solo-link-sin-texto, y la validación de direcciones (inválida rechazada
con el mensaje del repo, vacío y espacios válidos y sin dejar clave en el blob, URL larguísima
rechazada). **30/30, exit 0.** Corrobora el mismo patrón de `01-flow.spec.ts:319`, que escribe un
`fichaJson` con la forma vieja directo a la DB.

**La pantalla del brief sigue existiendo y funcionando.** Su retiro es P5-B: `m6-brief.tsx`,
`brief-form.tsx`, `BriefSchema`, `BriefInputSchema`, `guardarBrief` y `saveOwnedBrief` **no se
tocaron** — no aparecen en el diff.

**Verificación.** `tsc --noEmit`: **exit 2 con el MISMO error preexistente de `searchconsole.ts` y
cero errores nuevos**, leído del proceso sin pipe. `check:invariants`: **17/17, exit 0**.
`test:leados`: **25/25, exit 0** (57.8s).

**`test:setter` NO se corrió — bloqueo ambiental, declarado entero y no disimulado.** Al llegar al
cierre, otra sesión tenía tomado el checkout: `next dev --webpack --port 3000` (PID 13324, arrancado
14:07:14) reescribiendo `.next` de forma continua, un `next build --webpack` (PID 21876, 14:21:19) que
terminó a las 14:23:04, y un `next start -p 3100` (PID 25240, 14:23:47) **sirviendo desde ese mismo
`.next`**. `test:setter` arrastra `start:qa` = `npm run build && next start -p 3001`, así que correrlo
habría (a) dado números contaminados —la misma carrera que quemó las dos corridas de P4— y
(b) **reconstruido `.next` por debajo del server vivo de la otra sesión**, rompiéndole el trabajo en
curso. No se mató ningún proceso ajeno. **La suite queda pendiente de una corrida con el checkout
quieto; el sprint no se autocierra por ella.** `test:leados` sí corrió y es válido: su config
**no tiene `webServer`** (`playwright.leados.config.ts` lo dice explícito — lógica pura + Prisma
directo), así que es inmune a la colisión de `.next`.

**Evaluación estática del riesgo sobre `test:setter`, ya que no pudo correr.** Los tests que llenan la
ficha localizan por placeholder (`/IG activo/i`, `/la cuenta la firma/i`, `/Nunca contestan/i`,
`01-flow.spec.ts:66-76`): **ninguno de los cinco placeholders nuevos matchea esos regex**. El botón
«Guardar ficha» y el banner «✓ Señal mínima lista» no cambiaron, y el bloqueo nuevo del guardado solo
dispara con una dirección inválida (en el test están todas vacías = válidas). El `id` del título del
grupo usa `useId()`, no una constante, así que no puede duplicarse si el form se monta más de una vez
(que es lo que sugiere el `firstVisible` de los tests).

**`git diff --stat` — 5 archivos, 329 inserciones / 8 borrados:** `contracts.ts` (el grupo
`materiales` + `EnlaceFichaSchema`), `guidance-content.ts` (tipo `GrupoGuia` + copy de los 5 campos +
la ficha modelo, que el tipo obliga a cubrir), `ficha-form.tsx` (estado, payload resiliente,
validación visible y la sección agrupada), `copy-blocks.ts` (los dos bloques) y `ejemplo-ideal.tsx`
(el orden de los campos del ejemplo). **Cero gates, cero transiciones, cero aislamiento, cero schema:**
`flow.ts`, `dossier.ts`, `dossier.actions.ts`, `isolation.ts`, `manual.ts` y `prisma/` intactos.
Sin push.

**Hallazgos fuera de scope — anotados, no tocados.**

1. **El setter no puede cargar ni editar `googleMapsUrl`.** Existe como columna
   (`schema.prisma:873`), lo pide el admin, y **lo leen los dos bloques copiables** — pero no está en
   el alta del setter ni en el CSV, y **no existe ninguna action de edición de columnas del lead para
   el setter**. Arreglarlo exige tocar `isolation.ts` (`OwnedLeadFields` / `ownedLeadCreateData`),
   que este sprint tiene vedado. Mitigado de costado: `resenasUrl` suele ser la misma ficha de Google.
   Lo mismo aplica a `currentWebUrl` si el alta no lo trajo.
2. **El panel de admin no muestra el material nuevo.** `FICHA_BLOQUES`
   (`admin/leados/[leadId]/_components/dossier-panels.tsx:227`) es una lista fija de los seis campos
   viejos. Franco no ve `materiales` al revisar el dossier. Es otra superficie: no se tocó.
3. **`brief.referenciasFicha` se pierde en silencio** en cualquier re-guardado (`saveOwnedBrief`
   sobrescribe `briefJson` entero y ni el form ni `BriefInputSchema` lo producen). Hoy es inerte
   porque nadie lo escribe. Es uno de los dos hallazgos de guardado que el encargo dejó fuera.

**Para Franco, por escrito — no autocerrado.** (1) **Cuáles son los cinco campos y que estén
agrupados** es criterio de producto: de más, la ficha se vuelve un formulario que nadie completa; de
menos, la construcción arranca a ciegas. Lo aprueba él en el preview. (2) **Los rótulos y los
ejemplos** los cierra él mirando — en particular «¿Cómo habla el negocio de sí mismo?», que es el
único que le pide al setter una lectura y no un dato. (3) **Que una sola dirección alcance para el
logo Y las fotos**: si en la práctica viven en lugares distintos, hace falta un campo más.

---

## Microsprint INFRA — la suite del setter deja de compartir el directorio de build — 2026-08-03

**Objetivo único.** Que `test:setter` compile y sirva desde un directorio de build PROPIO, para poder
correr sin parar el checkout ni pisar a nadie. Solo configuración y scripts: **cero código de
producto, cero tests tocados.**

**El problema, nombrado con precisión.** `test:setter` arrastraba `start:qa` = `npm run build &&
next start -p 3001`, y sin `distDir` configurado eso compila y sirve desde **`.next/`, el mismo
directorio que usa `next dev`**. Con un dev server vivo sobre el checkout —que es el caso normal, hay
dos frentes— pasaban las dos cosas: (a) la suite leía artefactos mezclados (estáticos con el
Content-Type equivocado, 500s, números contaminados) y (b) le **reconstruía `.next/` por debajo** al
otro frente. **Cambiar de puerto no lo evita: el recurso compartido es el directorio, no el puerto.**
Es exactamente el bloqueo que dejó `test:setter` sin correr en P5-A (ver la entrada anterior). Next
mismo nombra el problema: toma un lock en `<distDir>/lock` en `dev` y en `build` porque dos procesos
escribiendo el mismo distDir *"can mangle the state of the directory"* (`config-shared.d.ts:829`).

**Qué se cambió — 4 archivos, 55 inserciones / 8 borrados.**

1. `next.config.ts` — `distDir: process.env.E2E_DIST_DIR ?? '.next'`. Verificado contra la doc oficial
   de Next (`api-reference/config/next-config-js/distDir`) y contra el schema instalado
   (`config-schema.js:541`, Next 16.2.9): **`distDir` se configura solo por `next.config`, no hay flag
   de CLI** en `next build` ni en `next start`, y la doc exige que el directorio **no salga del
   proyecto**. Sin la variable el valor es `.next` → el default no cambia.
2. `package.json` — script nuevo `start:setter`: buildea y sirve con `E2E_DIST_DIR=.next-setter` en el
   puerto **3003**. `start:qa` (:3001) **no se tocó** — lo siguen usando galería, qa-persona y
   qa-walkthrough.
3. `playwright.setter.config.ts` — `webServer.command` → `npm run start:setter`, puerto default
   3003, y **`reuseExistingServer: false`**. Era `!process.env.CI` = siempre `true` en local: un
   server huérfano en el puerto hacía que las 60 pruebas corrieran contra un build viejo, en silencio
   y sin aviso en el reporte. El opt-in explícito `SETTER_EXTERNAL_SERVER=1` sigue existiendo — eso es
   una decisión de una persona, no reutilización a ciegas.
4. `.gitignore` — `/.next-setter/`. `/.next/` es ancla exacta y no cubría al hermano.

**Comando nuevo — esto cambia para todos.** `npm run test:setter` sigue siendo el mismo comando y no
hay que cambiar nada para correrlo. Lo que cambió por debajo: **levanta su server en :3003, no en
:3001**, buildea en `.next-setter/`, y **ya no reutiliza** lo que encuentre en el puerto. Si alguien
iteraba con un server externo en :3001 apuntando a esta suite, ahora tiene que usar
`SETTER_EXTERNAL_SERVER=1` **con `SETTER_PORT` apuntando a donde esté su server**.

**La prueba, que es el punto del microsprint.** La suite corrió **con un `next dev` vivo al lado sobre
el mismo checkout** (PID 1424 en :3000, con `.next/dev/lock` tomado). **60/60 passed, exit 0** (4.8m),
leído del proceso sin pipe. Y la otra mitad, la que nadie mira: **el dev server sobrevivió** —
respondiendo 200 después de la corrida, `.next/dev/lock` intacto y **`.next/BUILD_ID` con el mismo
mtime (`1785507218`) antes y después**, o sea la suite no le reconstruyó nada. Durante el build se
verificó en vivo que `.next-setter/` se creaba con su propio `lock` mientras `.next/` no se movía.
**Cero fallos por contaminación de entorno y cero fallos reales de producto.**

**El default sigue intacto — verificado, no asumido.** El dev server tomó el lock sobre `.next/`
(`.next/dev/lock`, mtime `1785794134`) **después** de que `next.config.ts` ya tenía el cambio
(mtime `1785794067`): corrió con la config nueva y siguió usando `.next/`. No se corrió un
`npm run build` por defecto a propósito — habría reconstruido `.next/` con la otra sesión trabajando,
que es exactamente lo que este microsprint evita.

**Gates.** `npx tsc --noEmit`: **exit 0, cero errores** — idéntico al baseline tomado antes de editar
(también exit 0). Ojo, dato para la próxima: **el error preexistente que la bitácora de P5-A anotaba
en `searchconsole.ts` ya no aparece**, y el de las dos copias de `google-auth-library` tampoco.
`check:invariants`: **17/17, exit 0**. Sin push.

**Hallazgo del entorno, anotado y no tocado.** Al cierre, `git status` mostró cambios de producto que
**no son de este microsprint**: `src/app/layout.tsx`, `ChatWidgetMount.tsx`, `PublicOnlyComponents.tsx`,
`publicRoute.ts`, `tsconfig.json` y un borrado ya en el índice de `src/components/ui/NoiseOverlay.tsx`.
El checkout estaba limpio al abrir la sesión y esos archivos se modificaron **durante la corrida**
(mtimes 1785794293–1785794432, posteriores a la última edición de este sprint, 1785794121): **hay otra
sesión editando este checkout en vivo**. No se revirtió ni se tocó nada de eso — el índice de git es
compartido. Es, de paso, la confirmación empírica del supuesto del microsprint: acá siempre hay
alguien más trabajando.

**Fuera de scope — anotado, no implementado.** `playwright.galeria.config.ts`,
`playwright.qa-persona.config.ts` y `playwright.qa-walkthrough.config.ts` siguen apuntando a
`start:qa` en :3001 y **siguen buildeando en `.next/`**: tienen el mismo problema, sin arreglar. La
receta ya está — `E2E_DIST_DIR` + script propio + `reuseExistingServer: false`. `playwright.config.ts`
(e2e, :3000) corre `npm run start` sin build, y `leados`/`integration` no levantan server: esos
últimos no aplican.

---

## P6-B — las seis pantallas de Construcción son dos

**Rama:** `redesign/home` · **Commits:** `742f756` (la red) + el del colapso · **Nada pusheado.**

Dos pantallas es un **paso intermedio hacia cero**, no el destino: el brief v3 pide que el contenido
de las fases termine reabsorbido por el chequeo final y la librería de prompts. Franco eligió ver el
colapso funcionando antes de ir a cero. De ahí las dos restricciones que gobernaron el sprint: **cero
inversión en copy nuevo** (se reordena y se agrupa lo que ya existe) y **los seis tildes se conservan**,
agrupados 3+3, porque es lo único que deja `progresoJson` intacto y no encarece el paso siguiente.

### Paso 1 — la red, antes de tocar nada (commit aparte: `742f756`)

El probe midió que el compilador **no iba a guiar** este sprint. El mapeo fase→pantalla era
posicional —`PANTALLAS_CONSTRUCCION[FASE_IDS.indexOf(fase)]`— y sin `noUncheckedIndexedAccess`
indexar una tupla con un `number` devuelve la unión de los tipos de sus elementos, **nunca
`undefined`**. Desalinear las dos listas compilaba en verde y devolvía `undefined` en runtime,
tipado como `PantallaId`: fases que dejan de marcarse, `actual = undefined`, y `/manual/undefined`
en loop de redirects. Y ningún invariante cubría ese eslabón (sí existe el de
`SHELL_CONSTRUCCION ↔ FASE_IDS`; no el de `PANTALLAS_CONSTRUCCION ↔ FASE_IDS`).

Antes del colapso:

1. **`PANTALLA_DE_FASE`** — tabla explícita `Record<FaseId, PantallaConstruccionId>`. Las dos
   funciones de traducción derivan de ella. Falte una entrada = **error de compilación**.
2. **`pantallas-construccion.invariant.ts`** (#18) — cubre la mitad que el tipo no ve, más la
   inversa exacta, el round-trip, las pantallas retiradas y que `actual` nunca sea `undefined`.

**La prueba de sabotaje.** Dos, porque la red tiene dos capas:

*Sabotaje A — quitar la entrada `assets` de la tabla.* Rojo en las dos:

```
src/lib/leados/manual.ts(146,12): error TS1360: Type '{ ... }' does not satisfy the expected type
'Record<"estructura" | "personalizacion" | "assets" | "cta" | "calidad" | "mobile", ...>'.
  Property 'assets' is missing in type '{ ... }' but required in type 'Record<...>'.
EXIT_TSC=2

TSError: ⨯ Unable to compile TypeScript:
src/lib/leados/pantallas-construccion.invariant.ts(65,20): error TS7053: Element implicitly has an
'any' type because expression of type '"estructura" | ... | "mobile"' can't be used to index type
'{ readonly estructura: "m7"; ... }'.
EXIT_INV=1
```

*Sabotaje B — una pantalla huérfana en `PANTALLAS_CONSTRUCCION` (compila en verde).* Es la mitad
que **sólo** el invariante ve:

```
--- npx tsc --noEmit ---
EXIT_TSC=0

--- npm run check:invariant:pantallas ---
AssertionError [ERR_ASSERTION]: la pantalla «m13» está en PANTALLAS_CONSTRUCCION pero ninguna fase
la mapea (renderiza con los tres slots vacíos)
    at .../pantallas-construccion.invariant.ts:161:6
  code: 'ERR_ASSERTION', actual: false, expected: true
EXIT_INV=1
```

Restaurado y verde en las dos capas antes de seguir.

### Paso 2 — el colapso

**El corte es 3+3, no 4+2.** El criterio no es el orden del array sino: ¿esto se hace mirando el
brief, o mirando la demo ya construida? Ese criterio ya estaba codificado en el repo —`FASE_PROMPTS`
reparte prompts sólo a `calidad` y `mobile`, y `PROMPTS_DISENIO` se define como la capa que actúa
«sobre una demo ya construida»—. El colapso no traza una línea nueva: hace visible la que existía.

| | **mc1 · «Construí la demo en Claude Design»** | **mc2 · «Refiná la demo antes de publicarla»** |
|---|---|---|
| Chip | Construir | Refinar |
| Fases | estructura · personalizacion · assets | cta · calidad · mobile |
| Munición | 9 items en **3 bloques** con el subtítulo de su fase | 9 items en **3 bloques** con el subtítulo de su fase |
| Prompts | ninguno (ninguna de las tres tiene) | **dentro de su bloque**: Calidad→estética+motion, Mobile→mobile |
| Tildes | 3, uno por fase | 3, uno por fase |
| Indicador | Construcción — paso 1 de 2 | paso 2 de 2 |

- **`m7`…`m12` salieron de `PANTALLA_IDS`**: no existen ni son alcanzables. Sus ramas no quedaron
  inalcanzables — el árbol despacha por `fasesDePantallaConstruccion(id).length > 0`, y sigue
  teniendo 11 ramas (el probe ya lo había medido: las seis contribuían **una**, no seis).
- **La munición se agrupa, no se concatena.** Concatenar reintroduce A-10 («el checklist y los
  prompts viven desconectados dentro del mismo paso»), el hallazgo que costó el sprint 5.3. El
  subtítulo de la fase es el ancla que reemplaza a la pantalla.
- **Los seis tildes se conservan**, 1↔1 con su `FaseId`. Con dos tildes, destildar «Construir»
  borraría tres fases de un saque sin mostrar cuáles.
- **Completada = TODAS sus fases.** Si bastara una, «Construir» figuraría hecha con un tercio del
  trabajo. Está asertado en el invariante.
- **Repeticiones que bajan de 6 a 2 por recorrido**: el bloque de Claude Design, el badge «Guía
  preliminar» y el aviso «Link pendiente» de la herramienta.
- **La explicación del auto-reporte pasó del tilde al grupo**: repetida en cada uno de los tres era
  el mismo párrafo tres veces. El `motivo` del tilde deshabilitado sigue por-tilde (es la razón
  accesible de ESE control).
- **La lista de fases está intacta.** Verificado explícitamente: `FASE_IDS` no aparece en el diff
  (`git diff -- src/lib/leados/contracts.ts` vacío), `progreso-isolation.invariant.ts` sigue en
  verde sin ajustes, y `tests/leados/progreso-construccion.spec.ts` (25/25) pasa sin tocarse porque
  deriva sus fixtures de `FASE_IDS` en vivo.

### Paso 3 — la reentrada, verificada en la aplicación

Servidor `dev:qa` (:3002), persona QA `setter`, dos leads sembrados: uno **RECHAZADA** y uno
**CONSTRUCCION**, ambos con progreso **parcial y cruzado** a propósito —`estructura` +
`personalizacion` (mc1, incompleta: falta `assets`) y `cta` (mc2)—. Si el re-loop reiniciara el
progreso, los tres tildes volvían a gris.

- La raíz del lead RECHAZADA aterriza en **`mr`**, con la nota de Franco al frente. Su rail ofrece
  exactamente **dos** destinos: `/manual/mc1` y `/manual/mc2`. Ninguno apunta a una pantalla muerta.
- Entrando a **mc1**: «CONSTRUCCIÓN — PASO 1 DE 2», tres subtítulos (Estructura · Personalización
  con datos del negocio · Assets reales) y **tres tildes con el progreso preservado**:
  `Estructura=true`, `Personalización=true`, `Assets=false`. **No se reinicia.**
- Entrando a **mc2**: «PASO 2 DE 2», tres bloques con `CTA de WhatsApp` (0 prompts),
  `Calidad y motion` (**2** bloques copiables) y `Mobile` (**1**) — cada prompt dentro del bloque
  que lo usa, no al pie. `cta=true` preservado.
- **Direcciones viejas**: `/manual/m7` y `/manual/m12` sobre el lead RECHAZADA aterrizan en `mr`
  («Aplicá las correcciones de Franco»); `/manual/m9` sobre el lead en CONSTRUCCION aterriza en
  `mc1`. Sin loop, sin pantalla fantasma.
- Mobile 390×844: sin desborde horizontal, los dos chips presentes.

**Nota de método:** el pane del navegador no compositaba frames esta sesión → **sin screenshots**.
Todo lo de arriba se afirmó por navegación real + lectura del DOM servido, que es más preciso pero
no reemplaza el ojo. Y `curl` devuelve **200 sin seguir** en las direcciones viejas: el redirect de
`redirect()` viaja en el payload de streaming, no como 3xx — afirmar por **contenido**, no por status
(mismo patrón que ya registró `notFound()` en este repo).

### Paso 4 — tests y galería

**Expectativas ajustadas, con antes y después.** Un solo archivo: `tests/setter/11-fase-disabled.spec.ts`.

| | Antes | Después | Por qué |
|---|---|---|---|
| Destino de B-07 y C-08 | `goto(.../manual/m7)` + `toHaveURL(/\/manual\/m7$/)` | `.../manual/mc1` + `/\/manual\/mc1$/` | m7 no existe más — es el objetivo del sprint |
| Selector del tilde | `page.locator('button[aria-pressed]')` | `page.locator('main section[aria-label="Registro"] button[aria-pressed]')` | con tres tildes hace falta contarlos, y el contenedor de streaming de React (`body > div[id^="S:"]`) duplica el DOM fuera de `<main>` |
| — | — | **+** `toHaveCount(3)` en los dos tests | prueba durable de que los seis tildes siguen, 3+3 |
| — | — | **+** `goto(.../manual/m9)` → `toHaveURL(/mc1$/)` | prueba durable del rescate de direcciones viejas |
| — | — | **+** los otros dos tildes siguen en `aria-pressed="false"` tras tildar uno | tildar una fase no arrastra a las otras |

Los tres textos que el spec ya asertaba (`Marcá esta fase cuando la termines`, `Fase marcada como
hecha`, `Primero arrancá la construcción — el botón está arriba.`) se conservan intactos.
**Sin tests nuevos: 60 siguen siendo 60.**

`tests/setter/01-flow.spec.ts` **no se tocó** — B5 entra por la raíz (que redirige a la actual) y B6
por `m13`. `tests/leados/progreso-construccion.spec.ts` tampoco: no conoce `PantallaId`.

**Galería — NO regenerada acá** (va entera después de la poda, junto al manual). Quedan obsoletos
**siete estados**, anotados en `tests/galeria/captura.spec.ts` con un bloque de advertencia:
`14-m7-tilde-deshabilitado`, `15-m7-estructura` (mobile), `16-m8-personalizacion`, `17-m9-assets`,
`18-m10-cta`, `19-m11-calidad`, `20-m12-mobile-fases-hechas`. Arrastran tres artefactos más: el
sembrador (`scripts/dev/m0-galeria-seed.ts:180-202`), el índice
(`docs/manual-usuario/galeria/INDICE.md:106-112` + la fila mobile `:162`) y los PNG. Cobertura
esperada después: **cuatro** estados (mc1 · mc2 · el tilde deshabilitado en BRIEF · uno mobile), con
renumeración de 21 en adelante. **Correr la galería hoy fotografiaría siete veces la misma pantalla
con nombres que mienten** — por eso el bloque de advertencia y no un ajuste silencioso.

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — mismos errores que la línea base (cero) y ninguno nuevo |
| `npm run check:invariants` | **18/18, exit 0** (17 + `check:invariant:pantallas`) |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** — corrió aislada (`.next-setter/`, :3003) |

`npm run lint` sobre los archivos tocados: **exit 0**. (El repo entero sigue en 11.381 errores
pre-existentes — `next.config.ts` ignora lint y tipos en build; no lo toca este sprint.)

El diff no toca gates, transiciones, aislamiento ni schema: sólo el registro y la derivación de
presentación (`manual.ts`), sus consumidores de UI, y dos specs.

### Fuera de scope — anotado, no implementado

1. **Desarmar la escalera de condicionales** de `manual/[paso]/page.tsx`. Sigue en 11 ramas: las seis
   de construcción contribuían **una**, no seis. Es un sprint propio, independiente de este.
2. **El `motivo` del tilde deshabilitado miente en RECHAZADA.** Dice «Primero arrancá la construcción
   — el botón está arriba» pero en `mc1` de un lead RECHAZADA ese botón no está (el CTA es
   «Reabrir construcción», y vive en `mr`). Es **pre-existente**: `motivo` está hardcodeado y
   `puedeGuardar` es `stage === 'CONSTRUCCION'` mientras el CTA se gatea con `stage === 'BRIEF'`.
   El colapso no lo introdujo ni lo empeora.
3. **`GUIA_CONSTRUCCION` sigue siendo contenido muerto** (`guidance-content.ts:525-563`, registrada
   en `GUIA_PASOS.construccion`, ninguna pantalla la renderiza). Decisión de Franco: renderizarla en
   mc1/mc2 o borrarla.
4. **El primer item de `assets`** («Bajá el logo y 3–5 fotos…») sigue duplicando lo que la ficha ya
   capturó en `materiales.imagenesUrl` desde P5-A.
5. **`faseActual` sigue siendo un campo fantasma** en `ProgresoSchema`: declarado, validado, nunca
   escrito.
6. **El link de Claude Design sigue en `null`** (`herramientas.ts:87`) — ahora el setter ve el aviso
   «Link pendiente» dos veces en vez de seis, pero la deuda de fondo es de Franco.
7. **Barrido general de vocabulario** y **los dos hallazgos de guardado**: son de sus propios bloques.

### Lo que cierra Franco en el preview

Ningún test mide esto y el probe lo avisó como el riesgo conocido del sprint: **se pierde el foco de
una tarea por pantalla**. Antes un setter abría m9 y veía **una** cosa que hacer; ahora ve tres. El
contrapeso es cuatro navegaciones menos por demo. Que mc1 y mc2 **se lean como un paso de trabajo y
no como tres cosas apiladas** lo decide Franco mirándolo. Y los dos títulos —«Construí la demo en
Claude Design» y «Refiná la demo antes de publicarla»— los aprueba él.

---

## Microsprint a11y — vuelve el cursor del sistema — 2026-08-04

**Objetivo único.** Que el cursor del sistema sea visible en todo el sitio. Nada más: cero refactors,
cero cambios de estilo, cero "de paso". Y **sin reintroducir ningún cursor custom** — la solución es
dejar el nativo del navegador.

**El defecto, vivo en producción.** `CustomCursor` se desmontó en B2-S2 y el archivo se borró en
B2-S4, pero las reglas que lo acompañaban quedaron puestas. Resultado: el usuario pasaba el mouse
sobre un elemento y el puntero **desaparecía sin nada que lo reemplazara**. No sabía dónde estaba ni
que el elemento era clickeable. Regresión de accesibilidad, no detalle estético.

### El censo real: 13 archivos, no 7

El conteo previo (7 archivos) venía de buscar `cursor-none`. La mitad del daño no era una clase de
Tailwind sino `style={{ cursor: 'none' }}` **inline**, que ese patrón no captura. Censo por grep
ancho sobre `src/`:

| Archivo | Ocurrencias | Elemento | Acción |
|---|---:|---|---|
| `sections/home/Portfolio.tsx` | 4 | 2 cards de tilt (hover, sin `onClick`) + 2 `<button>` de carrusel | quitar / `cursor-pointer` |
| `sections/home/About.tsx` | 1 | card de equipo (solo hover) | quitar |
| `sections/home/OurServices.tsx` | 1 | `<button>` pill de servicio | `cursor: 'pointer'` |
| `automation/CalculadoraAutomation.tsx` | 2 | `<input type="range">` invisible sobre track propio | `cursor-pointer` |
| `automation/FlujoAutomation.tsx` | 1 | `<g>` de nodo SVG, decorativo | quitar |
| `software/PainBentoSoftware.tsx` | 1 | overlay con `onClick` de flip | `cursor: 'pointer'` |
| `chatbot/chat/ChatWindow.tsx` | 1 | regla CSS `[data-chatbot-input] { cursor: none }` @ ≥768px | borrar la regla |
| `chatbot/LogicCompanion.tsx` | 0 | launcher: **no** tenía regla, dependía de heredar `none` | `cursor: 'pointer'` |
| `sections/web-development/PortfolioWebCases.tsx` | 3 | sección + card + span | **2 quedan** (ver excepción) |
| `software/ProcesoSoftware.tsx` | 2 | pasos con `onClick` | `cursor: 'pointer'` |
| `software/ShowcaseSoftware.tsx` | 4 | card, chips de métrica, tags, `<p>` de mockup | quitar |
| `automation/ComparativaAutomation.tsx` | 1 | card de herramienta (hover) | quitar |
| `automation/SocialProofAutomation.tsx` | 1 | avatar circular, decorativo | quitar |

**Hallazgo de scope.** Cinco de esos archivos —`PortfolioWebCases`, `ProcesoSoftware`,
`ShowcaseSoftware`, `ComparativaAutomation`, `SocialProofAutomation`— **no los importa nadie**. Son
componentes muertos: el defecto vivo estaba en 8 archivos, no en 13. Se limpiaron igual (el arreglo
viaja con el archivo si algún día se monta), pero **no se pueden verificar en runtime** y no cuentan
como superficie reparada.

### La excepción que se frenó y se reporta

`PortfolioWebCases.tsx` **conserva** su `cursor: 'none'` (sección, línea 304; card, línea 212).
Es el único caso donde el ocultamiento **sí tiene un reemplazo visual real y funcionando**: una
píldora «Ver Proyecto» que sigue al puntero con spring, gateada por `!reducedMotion` y `md:block`.
La regla del sprint era frenar ahí, no tocarlo y reportarlo. Se le cambió únicamente el span
«Conversemos →» (línea 361), que es clickeable y **no** está cubierto por ese reemplazo. Doble
motivo para no avanzar: es un cursor custom, y la dirección los prohíbe. Queda para Franco decidir
si ese componente muerto se borra o se revive sin el cursor.

### Criterio aplicado

- **Interactivo** → se quita el ocultamiento y se pone `cursor-pointer` donde el navegador no lo
  infiere solo. Tailwind 4 mete `button, [role="button"] { cursor: default }` en preflight, así que
  los `<button>` **también** necesitan el `pointer` explícito.
- **Decorativo / no interactivo** → también se quita. Sin cursor custom que lo reemplace, esconder el
  puntero sobre cualquier superficie es un defecto, no una decisión.
- **Comentarios** que documentaban el régimen `cursor:none` (3 en `ChatWindow.tsx`, 1 en
  `LogicCompanion.tsx`, la nota pendiente de `layout.tsx`) se actualizaron: describían una regla que
  ya no existe.

### Verificación

Playwright **headed** contra prod build en `:3000` (el Browser pane no compone), con servidor
reiniciado y pestaña nueva, medido **contra un build previo** del mismo checkout:

| Ruta | `cursor: none` computado ANTES | DESPUÉS |
|---|---:|---:|
| `/` | 97 | **0** |
| `/` con el chat ABIERTO | 98 | **0** |
| `/contact` | 0 | **0** |
| `/process-automation` | 116 | **0** |
| `/software-development` | 6 | **0** |

Valor computado de `cursor`, un elemento por archivo vivo tocado:

| Archivo | Elemento | ANTES | DESPUÉS |
|---|---|---|---|
| `Portfolio.tsx` | card `h-[52vh]` | `none` | `auto` |
| `Portfolio.tsx` | `<button>` flecha demo | `none` | `pointer` |
| `About.tsx` | card de equipo | `none` | `auto` |
| `OurServices.tsx` | pill `[aria-label^="Ir a "]` | `none` | `pointer` |
| `LogicCompanion.tsx` | launcher del chat | `auto` | `pointer` |
| `ChatWindow.tsx` | `[data-chatbot-input]` | `none` | `text` |
| `ChatWindow.tsx` | botón enviar (deshabilitado) | `default` | `default` |
| `CalculadoraAutomation.tsx` | `input[type=range]` | `none` | `pointer` |
| `FlujoAutomation.tsx` | nodo `<g>` | `none` | `auto` |
| `PainBentoSoftware.tsx` | overlay de flip | `none` | `pointer` |

| Gate | Resultado |
|---|---|
| `npm run build` | **verde** |
| `npx tsc --noEmit` | **exit 0** |
| `eslint` sobre los 14 archivos tocados | 1 error + 3 warnings, **todos pre-existentes** y fuera de todo hunk del diff (`ShowcaseSoftware.tsx:238`, imports sin usar) — **0 nuevos** |
| `grep -rn "cursor-none\|cursor:\s*['\"]\?none" src/` | solo comentarios de `layout.tsx` + la excepción de `PortfolioWebCases` |
| Referencias a `CustomCursor` en código activo | **0** (solo la narración histórica del `layout.tsx`) |
| Errores de consola | **2 antes, 2 después** — los mismos 404 en `/process-automation` y `/software-development`. **0 nuevos** |
| `impeccable detect` — `design-system/` | **0** (se sostiene) |
| `impeccable detect` — superficie pública | **64** = baseline. **Sin números nuevos** |

### Fuera de scope — anotado, no implementado

1. **`data-cursor="hover"` quedó como atributo muerto** en ~10 elementos (Portfolio, About,
   OurServices, LogicCompanion). Ninguna regla CSS ni JS lo consume desde que se borró
   `CustomCursor.tsx`. Es ruido, no un defecto de accesibilidad; barrerlo es su propio paso.
2. **Los cinco componentes sin importadores** (`PortfolioWebCases`, `ProcesoSoftware`,
   `ShowcaseSoftware`, `ComparativaAutomation`, `SocialProofAutomation`) son código muerto con peso
   real. Decisión de Franco: borrarlos o volver a montarlos.
3. **El span «Conversemos →»** de `PortfolioWebCases.tsx:361` es un `<span onClick>` sin `role`,
   sin `tabIndex` y sin handler de teclado: inalcanzable por teclado. Ahora al menos se ve
   clickeable con el mouse. El arreglo de teclado es de un sprint de a11y, no de este.
4. **Los hallazgos de `gradient-text`** que marcó el hook de impeccable en los archivos tocados
   (`Portfolio.tsx` ×4, `About.tsx`, `CalculadoraAutomation.tsx`) son **pre-existentes**, están en
   líneas que este diff no toca y forman parte del baseline de 64. No se tocaron: cambiarlos sería
   exactamente el "de paso" que el sprint prohíbe.

### Lo que cierra Franco en el preview

Que el puntero se vea y **se sienta correcto** sobre cada superficie: que las cards de Portfolio y
About con flecha normal no lean como "acá no pasa nada", y que el `pointer` de las flechas del
carrusel, la pill de servicio, el slider de la calculadora y el launcher del chat caiga donde tiene
que caer. Eso lo decide él mirándolo.

---

## Sprint P8 — El foco prioriza CONSTRUIR, no contactar · 2026-08-04

**Objetivo.** Que el foco del panel del setter priorice construir la demo, no contactar. El
recorrido cambió: antes el setter contactaba primero y construía si el negocio respondía; ahora
llega con la demo hecha. El foco seguía razonando con el orden viejo. No es un retoque de
presentación — cambia **qué considera el producto "trabajo pendiente"**, y el foco es lo primero
que el setter ve cada mañana.

### Descubrimiento (read-only, antes de tocar)

El criterio estaba en **un solo archivo** (`flow.ts`), no repartido → el sprint no se partió:

- `urgenciaTier` (l.551) → `respondió(0) → caliente(1) → resto(2)`, desempate por antigüedad.
  **No miraba el `stage` en ningún momento.**
- `ordenFoco` (l.569) = pin primero, después `urgenciaTier`.
- `motivoOrden` (l.500) = el rótulo, con un comentario "MANTENER EN SINCRONÍA con `ordenFoco`"
  (sincronía por disciplina, no por construcción).
- `seleccionarFoco` (`foco.ts`) es **posicional**: toma la cima de la cola ya ordenada y aplica el
  sticky. No decide prioridad → no hubo que tocarlo.

Consumidores de la derivación: `clasificarLead`/`particionarCartera` los llama un único punto
(`buildHomeLeads` ← `page.tsx`), que alimenta **tres superficies de la misma página**: el foco, los
conteos de `HomeEnEspera` y la cartera secundaria. `novedades.ts`/`mis-numeros.ts` derivan aparte;
`paso.ts` (el cartel del detalle del lead) es otra derivación y **no se tocó**.

**El hallazgo:** brief listo, demo a medio construir y demo rechazada —trabajo de construcción
puro— caían en el **último tier** salvo que el negocio hubiera contestado. Un prospecto frío recién
cargado con `caliente` marcado le ganaba a una demo a medio construir.

### Qué criterio cambió

`trabajoTier` (nuevo, en `flow.ts`) reemplaza a `urgenciaTier` **como criterio primario** de la cola
`trabajar`. La urgencia vieja **sobrevive como desempate dentro del tier** — sigue siendo señal, ya
no puede dominar. `ordenUrgencia` quedó **intacto**: la cartera (orden "urgencia") y los `fijados`
en vuelo conservan exactamente el orden que tenían.

| # | Tier | Qué entra |
|---|---|---|
| — | pin | fijado por el setter (A-05/6.1 — se conserva, gana a todo) |
| 0 | `CONSTRUIR` | `BRIEF`, `CONSTRUCCION`, `EVALUADA` con el gate abierto |
| 1 | `ESPERA_TU_ACCION` | `RECHAZADA`, toque vencido, postergación cumplida |
| 2 | `CONTACTAR_CON_DEMO` | `APROBADA` (demo lista para mandar) |
| 3 | `EVALUAR` | sin dossier o `FICHA` — sin veredicto todavía |
| 4 | `CONTACTO_SIN_DEMO` | `EVALUADA` con el gate cerrado — el opener del recorrido viejo, último |

**Restricción del premortem (estructural, no un `if`):** el foco **nunca** sugiere construir para un
lead sin veredicto. La única puerta a `CONSTRUIR` es un stage que solo se alcanza *después* del
veredicto. Verificado en la aplicación con un lead **CALIENTE** sin evaluar: dice "Completá la ficha
/ Todavía no sabés si sirve — evalualo", nunca "construila".

**Rótulos** (`motivoOrden`, reescrito). El `switch` es exhaustivo sobre `TrabajoTier` → la sincronía
rótulo↔criterio pasó de disciplina a **construcción** (un tier nuevo no compila hasta tener rótulo).
Ninguna rama mide el comportamiento del setter: tono de oportunidad, cero reproche.

| Antes | Ahora |
|---|---|
| Respondió — va primero | Pasó el filtro y le falta la demo — construila |
| Caliente — va antes del resto | Te está esperando a vos |
| Por orden de llegada | La demo está lista para mandar |
| | Todavía no sabés si sirve — evalualo |
| | Todavía no hay demo que mostrar |

**No se tocó:** `grupoPara` (qué cola), `proximaAccion` (el copy por lead — es el barrido de
vocabulario, otro bloque), gates, transiciones, aislamiento, schema, la lista de fases, ni la
estética de la superficie.

### Tabla verificada EN LA APLICACIÓN

Sembrado en la DB real y leído por el camino real del home (`listOwnedLeads → buildHomeLeads →
particionarCartera → seleccionarFoco`) + navegación real a `/setter` en el build de producción con
lectura del DOM. Orden resultante de la cola `trabajar`:

| # | Estado del lead | Qué sugiere el foco | Por qué (rótulo) | ¿Correcto? |
|---|---|---|---|---|
| 1 | Fijado por el setter | Completá la ficha | Fijado por vos — va primero | ✅ pin intacto |
| 2 | Evaluado sin demo (gate abierto) | Generá el brief | Pasó el filtro y le falta la demo | ✅ |
| 3 | Brief listo | Brief listo — arrancá la construcción | Pasó el filtro y le falta la demo | ✅ |
| 4 | Demo a medio construir | Publicá el borrador y pasá el chequeo | Pasó el filtro y le falta la demo | ✅ |
| 5 | Demo rechazada | Franco pidió correcciones — reabrí | Te está esperando a vos | ✅ |
| 6 | Toque de seguimiento vencido | Te toca un toque — mandalo y registralo | Te está esperando a vos | ✅ |
| 7 | Demo aprobada, lista para mandar | Demo aprobada — enviá el link | La demo está lista para mandar | ✅ |
| 8 | **Caliente sin evaluar** | **Completá la ficha** | **Todavía no sabés si sirve — evalualo** | ✅ premortem |
| 9 | Recién cargado, sin evaluar | Completá la ficha | Todavía no sabés si sirve — evalualo | ✅ |
| 10 | Sin contactar (opener pendiente) | Mandá el opener | Todavía no hay demo que mostrar | ✅ último |

Fuera de la cola, **cada uno con su lugar** (15 sembrados / 15 ubicados, ninguno sin lugar):
esperando respuesta → `seguimiento` · en revisión → `revision` · reunión agendada → `agendadas` ·
descartado → `archivo-descartado` · pausado → `pausados`. Los cinco estados siguen visibles en la
cartera completa (verificado leyendo el DOM de "Tu cartera completa").

**El vacío** (cola sin nada): `HomeEnEspera` se mantiene tal cual —ya era honesto—. "No hay nada
para trabajar ahora mismo" + conteos de lo que está en vuelo + "¿Querés adelantar? Cargá un
prospecto nuevo". No inventa tarea. Se respetó, no se rehízo.

### Expectativas ajustadas

- `particion.invariant.ts` #5: el rótulo del no-fijado esperaba `'Respondió — va primero'` →
  ahora `'Todavía no sabés si sirve — evalualo'` (ese fixture no tiene dossier: sin veredicto).
- **Sumados** al mismo invariante (sigue siendo 18 archivos, no 19): orden completo de los 5 tiers ·
  el duelo "demo fría vs caliente sin evaluar" · **barrido de 16 combinaciones** (stage × caliente ×
  status × pinned) probando que un lead sin veredicto jamás recibe el rótulo de construir · el gate
  del brief manda (EVALUADA cerrada no se manda a construir, abierta sí) · el pin gana al tier
  nuevo · ningún lead de la cola queda sin rótulo.
- Doc-comments de `foco.ts` y `foco.invariant.ts`: decían "la cola viene ordenada respondió →
  caliente → resto". Corregidos (solo comentarios).

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — línea base era 0 errores, sigue en 0. **Ninguno nuevo** |
| `npm run check:invariants` | **18/18, exit 0** |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** (build aislado en `.next-setter/`, puerto 3003) |
| `git diff --stat` | 4 archivos del sprint. **Cero gates / transiciones / aislamiento / schema** |

### Fuera de scope — anotado, no implementado

1. **`gateBriefAbierto` es del recorrido viejo.** Exige `respondió || caliente` para abrir el brief,
   así que un lead que **pasó la evaluación pero está frío no puede construir** — justo lo que el
   recorrido nuevo pide hacer primero. Es un **gate**: no se tocó (regla 1). El foco ordena dentro
   de lo que el gate permite y ese caso cae en `CONTACTO_SIN_DEMO` (último). **Es el techo real de
   este sprint**: mientras el gate siga así, el foco no puede mandar a construir en frío.
   Decisión de producto de Franco.
2. **`proximaAccion` conserva jerga de pantalla**: "(Opener)", "(Seguimiento)", "(Envío)",
   "Generá el brief", "Pasala por el Evaluador". Es el barrido de vocabulario — último bloque.
3. **`agruparParaHome` (`flow.ts:532`) no tiene ningún consumidor** — código muerto exportado. No se
   tocó (poda, no este sprint).
4. Los dos hallazgos de guardado, la galería y el tilde deshabilitado: sin tocar, como se pidió.

### Lo que cierra Franco

- **Que el foco sugiera lo correcto**: es criterio comercial, no técnico. Qué merece la atención del
  setter primero lo decide él, en el preview, con varios leads en estados distintos.
- **El copy de los cinco rótulos**: es lo primero que el setter lee cada mañana. Lo aprueba él.

---

## Sprint P5-B — la pantalla del brief deja de pedir lo que la ficha ya tiene — 2026-08-04

**Objetivo único.** Que `m6` deje de preguntar lo que P5-A ya junta en la ficha, y que se lea como
lo que es: **decidir cómo va a ser la demo antes de construirla**. La pantalla se reconvierte, no se
retira.

### Descubrimiento (antes de editar)

**La pantalla hoy.** Título «Armá el brief»; entrada «Con la ficha y la evaluación a la vista, generá
el brief de diseño y traelo acá.». Seis campos: *Respuesta del Gem* (oblig.), *Título del brief*
(oblig.), *Llamado a la acción (CTA)*, *Secciones de la demo* (oblig.), *Concepto*, *Notas de marca*.

**El duplicado.** «**Notas de marca**» (*«Colores, tono, logo: lo que la demo tiene que respetar»*)
contra el material de P5-A «**¿Cómo habla el negocio de sí mismo?**» (*«Copiá su bio, su eslogan o el
"quiénes somos"»*). El pisón es completo, no parcial: el **tono** lo cubre `comoSePresenta`, el
**logo** lo cubre «¿De dónde bajás el logo y las fotos?» (`imagenesUrl`), y **colores/estilo** los
cubre «Contenido real (logo / fotos / tono)». Las tres ya viajaban solas a la construcción.

**Quién lee cada campo.** Al bloque de Claude Design (`buildConstruccionBlock`) van `concepto`,
`secciones`, `cta`, `notasMarca` y `pegadoGem`. **`titulo` NO viaja** al bloque (el encabezado usa
`lead.businessName`): solo lo leen `BriefResumen` y el panel del admin.

**Punto 4 — el campo sin consumidor: CONFIRMADO, con un matiz que cambia el remedio.** Es
`referenciasFicha` (`contracts.ts:118`). **Cero lectores en todo el repo** — solo su propia
declaración y una mención en un comentario de `copy-blocks.ts:234`. Y no está en `BriefInputSchema`,
mientras `guardarBrief` persiste `const brief: Brief = input.data`: **se pierde en cada
re-guardado, confirmado.** El matiz: **nunca fue un campo del formulario**. No hay nada que retirar
de la pantalla — es un fantasma del contrato, no una pregunta. Se dejó como está (tocar
`BriefSchema` es tocar schema).

**Punto 6 — la transición.** `dossier.actions.ts:208`: `if (dossier.stage === 'EVALUADA') await
transitionDossier(leadId, { to: 'BRIEF' })`. El primer guardado es el único que ocurre con stage
`EVALUADA`, y por eso es el que mueve el lead; lo dispara el botón **«Guardar brief»**. Por eso el
autosave está APAGADO en la captura y solo se prende en el re-pegado (ya en `BRIEF`). **Intacto.**

**Dónde cae hoy.** `m1` → `m2` (fusión P4) → `m4` → `m5`/espera → **`m6`** → `mc1`/`mc2` (colapso
P6-B) → `m13` → `m14` → `m15` → `m16`.

### La trampa que el descubrimiento destapó

`guardarBrief` guarda el input **completo**, así que **un campo que sale del payload se BORRA en el
próximo re-guardado** — el destino exacto de `referenciasFicha`. Por eso `notasMarca` salió **de la
pregunta, no del payload**: sigue en `BriefFormState` y en `aPayloadBrief`, invisible, para que los
briefs ya guardados sobrevivan a una re-edición. Está documentado en `brief-form.tsx` con el porqué,
para que nadie lo "limpie" después.

### Qué cambió — 5 archivos

1. `brief-form.tsx` — se retira el `<Field>` de «Notas de marca» (el `<div>` de dos columnas que
   compartía con Concepto se disuelve: Concepto queda a ancho completo). El valor **viaja igual**.
2. `guidance-content.ts` — se borra `GUIA_BRIEF.campos.notasMarca` (su único consumidor era ese
   Field). Se corrige el encabezado del bloque, que decía «Paso 3» — numeración del wizard que dejó
   de existir en 5.6.
3. `manual.ts` — `PANTALLAS.m6`: **«Decidí cómo va a ser la demo»** / «Antes de construirla: qué
   secciones lleva, qué cuenta y a qué invita. El Gem de diseño te lo propone y vos lo cerrás acá.».
   Mismo registro que dejó el colapso de la construcción (verbo en voseo + la demo como objeto).
4. `m6-brief.tsx` — el doc-comment citaba el título viejo.
5. `herramientas.ts` — **lo encontró la verificación, no la lectura**. El `ToolGuide` del Gem de
   diseño, que se renderiza JUSTO ARRIBA del formulario, prometía «título, concepto, secciones en
   orden, CTA **y notas de marca**. Lo pegás y completás los campos de abajo». Sacar el campo sin
   tocar esto dejaba la pantalla mandando a completar un campo inexistente.

### Verificado en la aplicación (no solo compila)

Spec temporal contra el harness real del setter (`.next-setter/`, :3003), **borrada después de
correr**. Sin capturas: se afirma por navegación real y lectura del DOM.

| | Qué se afirmó |
|---|---|
| **V1** | Lead con brief **pre-P5-B** (con `notasMarca` Y con `referenciasFicha`): la pantalla abre, el resumen muestra los datos viejos, la pregunta ya no se ofrece, y tras **re-pegar + Guardar brief** la DB conserva `notasMarca` con su valor legacy y el stage sigue en `BRIEF`. Cero errores de consola |
| **V2** | Lead nuevo en `EVALUADA`: completa la pantalla, guarda y el dossier **transiciona a `BRIEF`** (leído de la DB) |
| **V3** | Se lee el `<pre>` **real** que el setter copia en `mc1` (anclado por «BRIEF DE DEMO», no por posición): siguen ahí CONCEPTO, SECCIONES, el CTA, el pegado del Gem y el `notasMarca` legacy — **y** lo que ahora aporta la ficha: cómo se presenta, de dónde bajar el logo, contenido y tono real, qué vende, y la dirección de las reseñas |

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — línea base era 0 errores, sigue en 0. **Ninguno nuevo** |
| `npm run check:invariants` | **18/18, exit 0** |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** (build aislado en `.next-setter/`, puerto 3003) |
| `git diff --stat` | 5 archivos del sprint. **Cero gates / transiciones / aislamiento / schema** |

### Fuera de scope — anotado, no implementado

1. **`referenciasFicha` sigue en `BriefSchema`** sin lectores y borrándose en cada guardado. Sacarlo
   es tocar el contrato — no entra acá.
2. **`GUIA_BRIEF` quedó casi entero sin consumidor**: `titulo`, `intro`, `gate`, `porque` y
   `ejemplos` no los renderiza nadie (solo se usa `campos`). Copy muerto, no lo toqué.
3. **El rail sigue diciendo «Brief»** (`FASES_MANUAL.brief.titulo` y `PANTALLAS.m6.corto`): arriba
   del título nuevo se lee «Brief — paso 1 de 1». Cambiarlo mueve los chips de navegación de todo el
   manual → es el barrido de vocabulario, último bloque.
4. **`gateBriefAbierto`** (el techo que ya anotó P8), retirar la pantalla, los dos hallazgos de
   guardado, la galería y la función exportada sin consumidores del foco: sin tocar.

### Lo que cierra Franco

- **El título nuevo y la entrada**, en el preview. Elegí «la demo» y no «la página» para no meter un
  sinónimo nuevo: el resto del manual (mc1, mc2, m13) ya dice «la demo». Si prefiere «página», es un
  cambio de una línea.
- **Si la pantalla quedó demasiado flaca** con cinco campos para lo que tiene que decidir. Eso se ve
  mirando: es criterio de producto.

---

## P7 · El chequeo final deja de perder trabajo, y dice la verdad — 2026-08-05

Rama `redesign/home`, HEAD `90510f5`, working tree con WIP propio (P5-B, P8) y ajeno (rediseño del
home). **Sin commit y sin push**: el índice de git está compartido con otra sesión que dejó borrados
*staged* del home mientras corría este sprint — cualquier commit se los llevaba puestos.

**Dos objetivos en la misma pantalla** (`m14`, el chequeo final): que los tildes no se pierdan, y que
los seis motivos de rechazo de una demo estén ahí, en dos grupos.

### El hallazgo, reproducido antes de tocar nada

No se asumió: se reprodujo en dev:qa :3002 sobre `QA-W Construccion` (CONSTRUCCION + draft +
self-check 6/6 sembrado). Destildar tres obligatorios, marcar un flag de diseño, salir por el link
«Borrador» del propio manual y volver → **los cuatro cambios volvieron atrás**. Sin aviso, sin toast,
sin diálogo. Los tildes vivían solo en `useState` y se persistían únicamente al tocar `Guardar el
chequeo`; como la navegación del manual es SPA, `beforeunload` ni siquiera corría — y tampoco había
`useUnsavedGuard` en esta pantalla. El costo real no son los clics: cada obligatorio exige abrir la
demo publicada en el celular, en incógnito, y tocar cada link.

**La otra mitad del hallazgo estaba en otra pantalla.** El «se guarda solo» no lo dice `m14`: lo dice
`m1` (`ficha-form.tsx`, *«Se guarda solo mientras escribís. Podés cerrar y seguir después»*), y ahí
**es verdad**. El problema no era una pantalla mintiendo: era el manual enseñando una regla en el
primer paso y rompiéndola en el noveno.

### Cómo quedó el guardado

**Autosave, y el botón de guardar desapareció.** `useAutosave` + `useUnsavedGuard` + `AutosaveStatus`
sobre la MISMA action `guardarSelfCheck` — cero caminos de escritura nuevos, el mismo patrón que la
ficha y el brief ya usan. La alternativa (botón único + aviso al salir) se descartó porque **no
arregla el caso del hallazgo**: `useUnsavedGuard` no intercepta navegación SPA, que es exactamente
cómo se sale de `m14`.

`guardarSelfCheck` tiene **un solo consumidor** (`chequeo-form.tsx`), así que el arreglo no toca
ninguna otra pantalla. Lo único compartido que se rozó: `<AutosaveStatus>` hardcodeaba *«No se pudo
guardar — tocá «Guardar»»*, un mensaje que acá mandaría a un botón inexistente. Se le agregó un prop
**opcional** `errorLabel` cuyo default es el string de siempre → ficha y brief quedan idénticas.

**Con `delayMs: 0`, sin el debounce de 1200 ms de la ficha.** Un tilde es una acción TERMINADA, no
una tecla en el medio de una frase: esperar una pausa dejaba abierta justo la ventana del hallazgo
(tildar y salir en el mismo segundo). El coalescing del hook evita pedidos encimados, y un guardado
en vuelo termina aunque el componente se desmonte — lo único que la salida cancela es un timer
pendiente, y con delay 0 no hay.

Queda **una sola forma de tildar** (`Toggle`) y **una sola de persistir**. El único botón que
sobrevive hace otra cosa: mandar a revisión.

### Los seis criterios, en dos grupos

`HardCheck` ganó un campo `grupo` (`'setter' | 'franco'`) y `flow-content.ts` un `GRUPOS_CHEQUEO` con
los dos rótulos. Es **presentación pura**: `selfCheckAprobado` recorre la lista entera sin mirar el
grupo, así que el gate no cambió de forma. De 6 obligatorios se pasó a 10.

**«Esto lo revisás vos»** — lo mira en la demo y decide solo:

| Punto | Origen |
|---|---|
| La demo carga | conservado (no está entre los seis) |
| Se ve bien en tu celular | **criterio 1 fundido** — mismo ítem, sin duplicar |
| No hay lorem ipsum ni textos de relleno | conservado — es mecánico, distinto de la vara alta de abajo |
| Los links y el botón de WhatsApp funcionan | conservado — «funciona», distinto de «se entiende» |
| **Se entiende qué tiene que hacer el visitante** | **criterio 2, nuevo** |
| Usa los datos y assets reales del negocio | **criterio 3 fundido** |
| La demo dice lo que el brief pedía | conservado |

**«Esto lo mira Franco»** — *«Marcá lo que ves vos. El ojo final es de Franco: lo que se te pase, lo
cacha él y vuelve como rechazo»*:

| Punto | Origen |
|---|---|
| **No se nota que la hizo una IA** | **criterio 4, nuevo** |
| **El texto es de este negocio y de ningún otro** | **criterio 5, nuevo** — «tapá el nombre y leelo» |
| **Suena como habla el negocio** | **criterio 6, nuevo** — «compará con cómo escribe en Instagram» |

Los cuatro **delatores del ojo de diseño** (`SOFT_CHECKS`) se conservan intactos y se mudaron
**adentro** del grupo de Franco, como sub-bloque rotulado: son el detalle concreto que hace
verificable a «No se nota que la hizo una IA». Siguen sin bloquear y siguen viajando a la superficie
de revisión del admin.

**Ningún `nombre` existente se renombró, a propósito.** `nombre` es la llave con la que el formulario
reencuentra un tilde guardado *y* con la que el gate valida: renombrar «Usa los datos y assets reales
del negocio» habría dejado en rojo un tilde ya hecho — el mismo bug que este sprint vino a cerrar — y
habría obligado a meter mano en `selfCheckAprobado`. La jerga que queda ahí («assets», «lorem
ipsum») es del barrido de vocabulario, no de acá. Lo que sí se reescribió es el `comoVerificar`, que
no se persiste.

### Verificado en la aplicación (no solo compila)

Sin capturas: el panel del navegador no compone frames en esta sesión (`screenshot` corta a los 5 s).
Se afirma por navegación real y lectura del DOM, nunca por status code.

| | Qué se afirmó |
|---|---|
| **V1 · el caso del hallazgo** | Tildar cuatro puntos y salir a `m13` **en el mismo tick** (más hostil que cualquier humano). La DB quedó con los cuatro: `ctaClaro`, `noPareceIa`, `tonoDelNegocio` en `ok:true` y `softFlags: ["Tiene más de 3 colores"]`. Al volver, el DOM los muestra tildados |
| **V2 · datos viejos** | El lead traía los **6 nombres pre-P7** guardados. Al abrir, los 6 siguen en `true` y los 4 nuevos en `false`. Nada se perdió ni se re-interpretó |
| **V3 · el gate con los ítems nuevos** | Con 9 de 10, `Enviar a revisión` **disabled** y el Callout dice «Queda 1 obligatorio en rojo». Al tildar el décimo: botón **enabled** + «Todos los obligatorios en verde». El indicador dice «Guardado» |
| **V4 · los dos grupos** | Dos `<section>` con `aria-label` propio, separadas 20 px, con borde/fondo distintos (zinc neutro vs. ámbar) y encabezados de color distinto. 7 tildes en la primera, 3 + el sub-bloque de delatores en la segunda |
| **V5 · mobile 375 px** | Cero overflow horizontal (`scrollWidth == 375`), ningún elemento desbordado |

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — línea base era 0 errores, sigue en 0. **Ninguno nuevo** |
| `npm run check:invariants` | **18/18, exit 0** |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** (build aislado en `.next-setter/`, puerto 3003) |
| `git diff --stat` | 7 archivos del sprint (5 de `src/`, 2 de `tests/`). **Cero gates, transiciones, aislamiento ni schema** |

Dos espejos de tests se actualizaron porque la lista creció: `tests/helpers/setter-db.ts` copiaba los
seis nombres a mano — ahora los **deriva de `HARD_CHECKS`**, así no vuelve a quedar stale — y
`01-flow.spec.ts` tildaba los seis literales y apretaba `Guardar el chequeo`; ahora recorre la lista
viva y **afirma que ese botón ya no existe**, más los dos rótulos de grupo.

### Fuera de scope — anotado, no implementado

1. **El barrido de vocabulario.** El título de la pantalla sigue siendo «Pasá los checks duros» y el
   rail dice «Chequeo»; «assets» y «lorem ipsum» siguen en dos `nombre`. Es el último bloque.
2. **La galería** (`22-m14-chequeo.png` quedó vieja: no tiene los grupos ni el botón sacado). Se
   regenera al final.
3. **Verificación automática de la demo: no existe ninguna**, se confirmó por grep — ni un `fetch`,
   HEAD, Lighthouse ni captura contra `draftUrl`. Lo único automático es la validación de FORMA de la
   URL. Este sprint deja los seis criterios como checklist humano, como estaba pedido.
4. **El campo fantasma del contrato del brief** (`referenciasFicha`): sin tocar.
5. **`HARD_CHECK_PROMPT` sigue en 1 de 10** (solo `mobile`). Los tres criterios nuevos no tienen
   prompt de diseño mapeado — muestran solo su arreglo humano. No se forzó el mapa.

### Lo que cierra Franco

- **La redacción final de los seis.** Son suyos: acá se tradujeron a idioma del setter (voseo, frase
  corta, verificables — «tapá el nombre y leelo», «compará con cómo escribe en Instagram»). Confirmar
  que dicen lo que quería decir es de él.
- **Que la separación entre los dos grupos se entienda de un vistazo.** Eso se cierra mirando, y es
  la información que decide qué revisión se puede delegar.
- **Si diez obligatorios son demasiados.** Los tres nuevos bloquean el envío igual que el resto: el
  punto es que el setter MIRE los tres antes de mandar, no que decida por Franco. Si prefiere que el
  grupo de Franco no bloquee, es mover esos tres a la lista blanda — decisión de producto.

---

## Sprint P9 — una sola lengua: el último barrido de la poda — 2026-08-07

Rama `redesign/home`, HEAD `fafd796`. **Sin commit y sin push**: el working tree tiene WIP ajeno
vivo (`src/app/web-development/page.tsx`, `src/app/globals.css` — la sesión del rediseño del home).
Igual que en P7: cualquier commit se lo lleva puesto.

**Objetivo único.** Que el producto hable un solo idioma, el del recorrido que existe hoy. Después
de P4/P5-B/P6-B quedaban textos que nombran pantallas retiradas, numeraciones de un recorrido que
ya no existe y jerga de sistema donde debería haber idioma de setter.

### Terreno

Los seis sprints de la poda están en la historia. **P5-B no lo nombra ningún subject**: entró dentro
de `fafd796` (confirmado por `git log -S "P5-B"` y por el código — `brief-form.tsx:30` documenta el
retiro de `notasMarca`, `manual.ts:200` ya dice «Decidí cómo va a ser la demo»). Línea base:
`tsc --noEmit` exit 0 con **cero** errores, `check:invariants` 18/18.

### El volcado (clasificación antes de editar)

| Clase | Cuenta | Qué |
|---|---|---|
| **TEXTO** | 18 | lo lee el setter — se cambió |
| **LLAVE** | 19 | persistido o identificador — **intacto** |
| **AMBIGUO** | 8 | parece texto, no se toca — va a Franco |

**Ninguna llave se renombró.** Las que importan: los **10 `HardCheck.nombre`** (se guardan en
`selfCheckJson.itemsDuros[].nombre`; el formulario re-encuentra el tilde por igualdad de ese string
en `chequeo-form.tsx:51` y el gate valida contra la lista) y las **4 `SoftCheck.etiqueta`**
(`selfCheckJson.softFlags[]`, `chequeo-form.tsx:58`). Más `FASE_IDS`/`ShellFase.id` (llave de
`progresoJson`), `PANTALLA_IDS` (segmento de URL), los enums de Prisma y las claves literales del
motor en `error-copy.ts`.

**Los dos `nombre` con jerga son LLAVE, no texto suelto.** «No hay lorem ipsum ni textos de relleno»
y «Usa los datos y assets reales del negocio»: en este diseño `nombre` **es a la vez** lo que se
renderiza (`chequeo-form.tsx:92`) y la llave de lo guardado — no hay campo separado que cambiar.
Quedan literales. Separar etiqueta de llave es cambio de estructura, no de vocabulario.

### Los cuatro conocidos

1. **El título del chequeo.** `PANTALLAS.m14`: «Pasá los checks duros» → **«Chequeá la demo antes de
   mandarla»**. «Checks duros» es el nombre del motor (los hard-checks); el setter ve puntos
   obligatorios. Mismo registro que el resto de la poda: verbo en voseo + la demo como objeto.
2. **La numeración del rail.** `pantalla-manual.tsx` mostraba `{fase} — paso {n} de {m}` siempre. Con
   el colapso de P6-B, **nueve de las diez fases tienen una sola pantalla**: se leía «Brief — paso 1
   de 1», «Chequeo final — paso 1 de 1»… El contador ahora aparece **solo cuando `m > 1`**. Sobrevive
   donde informa: «Construcción — paso 1 de 2» y «paso 2 de 2». `indicadorDeFase` (manual.ts) no se
   tocó — el cambio es de presentación.
3. **La sugerencia del panel de inicio** (`proximaAccionPara`, la línea más leída del producto: la
   muestra el foco y cada card). Se le sacó el nombre interno del destino entre paréntesis —
   «(Opener)», «(Seguimiento)» ×3, «(Envío)» — y «Generá el brief», que además apuntaba a una
   pantalla que P5-B ya había retitulado (→ «Decidí cómo va a ser la demo»). A dónde ir lo resuelve
   el botón, no un paréntesis: sin nombres internos, un reagrupamiento futuro no vuelve a dejar esta
   línea mintiendo.
4. **Los dos nombres de chequeo guardados**: ver arriba — LLAVE, intactos.

### Lo demás que se barrió

- **Dos textos que mandaban al lugar equivocado.** `GUIA_OPENER.gate.detalle` (visible: el callout
  rojo de `opener-form.tsx:91`) decía que el link se registra «desde «Seguimiento»» — vive en
  «Envío» desde el corte 5.6. Y `GUIA_EVALUACION.intro` mandaba «al bloque del paso 1»: no hay paso
  1, y el bloque está en la propia pantalla.
- **Nombres que no son de ninguna pantalla.** `herramientas.ts`: «Publicar el borrador» → «Borrador»
  (×2), «Primer contacto y Seguimiento» → «Opener y Seguimiento». `m14-chequeo.tsx`: «(paso
  anterior)» → «(pantalla anterior)», el vocabulario que m2 ya usaba. `opener-form.tsx`: «Primer
  contacto (opener)» → «El opener» (glosaba entre paréntesis la palabra que el título ya usa).
- **Una palabra por cosa.** El historial decía **«Instagram DM»** y todas las demás superficies del
  setter dicen **«Instagram»** (el opener, la capa de canal, las herramientas, la agenda). Unificado
  a la forma corta en `canalEtiqueta`. La llave es el enum `INSTAGRAM_DM` de Prisma: no se tocó.
  También «flag(s) de diseño» → «delator(es) de diseño», que es como los llama el propio formulario.
- **Comentarios que describen el recorrido viejo** (24): «M7–M12» y «M3» donde ya no hay esas
  pantallas, «las 16 pantallas», el título viejo de m14, y los `Paso N` de `guidance-content.ts` /
  `flow-content.ts` / los cuatro componentes de guía, mapeados contra el registro `PANTALLAS`.

### Verificado en la aplicación (no solo compila)

Spec temporal contra el harness real del setter (`.next-setter/`, :3003), **borrada después de
correr** — 4/4 verde. Sin capturas: se afirma por navegación real y lectura del DOM del `<main>`,
nunca por status code.

| | Qué se afirmó |
|---|---|
| **P9-A** | Lead con `selfCheckJson` sembrado con los **diez nombres literales escritos a mano** (no derivados de `HARD_CHECKS` — derivarlos habría hecho pasar el test aunque una llave se hubiera roto) + un delator por su etiqueta literal. Los diez toggles abren en `aria-checked=true`, el delator también, «Enviar a revisión» **habilitado** y «Todos los obligatorios en verde». Cero errores de consola |
| **P9-B** | Recorrido de **12 pantallas** por el camino real (m1·m2·m4·m5·m6·mc1·mc2·m13·m14·revisión·m15·m16), cada una contra 10 patrones prohibidos: «paso 1 de 1», «checks duros», los tres paréntesis de pantalla, «Generá el brief», «(paso anterior)», «Instagram DM», «del paso 1», «flag(s) de diseño», «Publicar el borrador» y cualquier id retirado (m3/m7–m12). Y la numeración que sí informa **sigue puesta**: «Construcción — paso 1 de 2» y «paso 2 de 2» |
| **P9-C** | El home del setter, y con un lead fijado en EVALUADA con el gate abierto: la sugerencia se lee **«Decidí cómo va a ser la demo»**, sin paréntesis |
| **P9-D** | El historial de un toque real: dice «Instagram», y «Instagram DM» ya no aparece |

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — línea base era 0 errores, sigue en 0. **Ninguno nuevo** |
| `npm run check:invariants` | **18/18, exit 0** |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** (build aislado en `.next-setter/`, puerto 3003) |
| `git diff --stat` | 19 archivos, +95/−56. **Solo texto y comentarios**: cero gates, transiciones, aislamiento, lista de fases ni schema |

### Fuera de scope — anotado, no implementado

1. **«Assets reales» (`SHELL_CONSTRUCCION`) queda como está.** Es TEXTO (la llave es `id:'assets'`),
   pero «assets» está congelado en un `nombre` LLAVE (`datosReales`). Cambiar el título de la fase
   sin poder cambiar el del check **crearía** dos palabras para la misma cosa — justo lo que este
   sprint vino a sacar. Se resuelve junto, y eso exige separar etiqueta de llave.
2. **Dos nombres para la misma pantalla:** el chip dice «Toque» y el rail «Seguimiento»
   (`PANTALLAS.m5.corto` vs `FASES_MANUAL.seguimiento.titulo`).
3. **«Call agendada» vs «Reunión agendada»:** `resultadoEtiqueta` contra `STATUS_LABELS` y m16.
4. **Copy muerto que nombra lugares viejos** (0 consumidores, por eso no es texto visible):
   `describirFoco` entero en `paso.ts` («Brief de diseño», «Mandá el primer mensaje (opener)»),
   `GUIA_REVISION` («el envío del link vive en «Seguimiento»» — falso), `GUIA_CONSTRUCCION` («el
   dossier pasa a…») y casi todo `GUIA_BRIEF`. Retirar copy muerto es poda, no vocabulario.
5. **Los 13 `Paso N` de `dossier.actions.ts` / `outreach.actions.ts` / `agenda.*`:** comentarios de
   server actions, motor-adyacente (la auditoría de cierre lo advierte). Son una numeración interna
   del backend, consistente entre sí; renumerarlos es decidir un esquema nuevo.
6. **Las ~110 menciones a «wizard» en comentarios:** ninguna es texto visible. Naming histórico —
   sprint propio, ya anotado en los cierres 7.x.
7. **`tests/qa-persona/corrida-1-novato-frio.spec.ts` referencia «Primer contacto (opener)»**: esa
   suite recorre el **wizard retirado** (`[data-step="ficha"]`, `[data-step="opener"]`), está fuera
   de los cuatro gates y ya venía enferma. Su string viejo es la menor de sus deudas — se resuelve
   cuando se regenere.
8. **El campo fantasma del contrato del brief** (`referenciasFicha`), **la galería** y **la función
   exportada sin consumidores del foco** (`agruparParaHome`): sin tocar, como se pidió.

### Lo que cierra Franco

- **Los textos nuevos, recorriendo el manual entero en el preview.** Es la última lectura completa
  antes de que el manual v2 documente el producto. En particular: «Chequeá la demo antes de
  mandarla» (m14) y la sugerencia «Decidí cómo va a ser la demo» en el home.
- **Los tres AMBIGUOS de vocabulario** (1, 2 y 3 de arriba): «assets», «Toque» vs «Seguimiento» y
  «call» vs «reunión». Los tres son decisiones de producto, no de barrido.

---

## Corrida G — La galería de estados, regenerada sobre el producto podado

**Qué era.** La galería (`docs/manual-usuario/galeria/`) es el insumo del manual de usuario: cada
capítulo cita sus capturas. Después de la poda (P4 fusión de evaluación, P5-B brief reconvertido,
P6-B colapso de construcción, P7 chequeo, P8 foco, P9 vocabulario) el sembrador seguía sembrando
estados de pantallas retiradas y el índice declaraba un total que ya no coincidía con su tabla.

### El aislamiento (mismo defecto que tenía la suite del panel)

`playwright.galeria.config.ts` apuntaba a `npm run start:qa` —que buildea en `.next/`, el MISMO
directorio del `next dev`/`next start` del checkout— y reutilizaba a ciegas cualquier server del
puerto (`reuseExistingServer: !CI`). Se aplicó la solución ya commiteada para la suite del setter:

| Antes | Ahora |
|---|---|
| `npm run start:qa` → build en `.next/`, puerto 3001 | `npm run start:galeria` → build en `.next-galeria/`, puerto 3004 |
| `reuseExistingServer: !process.env.CI` | `reuseExistingServer: false` (reuso a propósito = `SETTER_EXTERNAL_SERVER=1`) |

Para una galería el daño de compartir `.next/` es peor que para una suite: no falla, **fotografía lo
roto**, y esas fotos entran al manual como si fueran el producto.

**Probado con un server ajeno vivo al lado.** Había un `next start -p 3010` de otro frente sirviendo
desde `.next/`. Antes del build: `:3010` → 200, `.next/BUILD_ID` = `PaLMC0ClHYso9NBQ3ISvO`
(mtime 2026-08-07T14:38:32). Después del build de la galería: `.next-galeria/BUILD_ID` nuevo
(`WqtU-vRhyE_xGsbGFQbs_`), `.next/BUILD_ID` **byte por byte y mtime idénticos**, y `:3010` seguía
en 200. El vecino sobrevivió.

### El sembrador

**Retirado** — los cinco estados de las pantallas que P6-B sacó del registro (`m8`…`m12`):
`16-m8-personalizacion`, `17-m9-assets`, `18-m10-cta`, `19-m11-calidad`, `20-m12-mobile-fases-hechas`.
Sus ids ya no existen y la guardia del server los redirigía: una corrida habría fotografiado siete
veces la misma pantalla con nombres que mienten.

**Reconvertido, conservando la numeración** (así el resto del índice no se corre):

| # | Antes | Ahora |
|---|---|---|
| 04 | `04-m3-veredicto-registrar` (idéntico al 03) | `04-m2-veredicto-registrado` — la vuelta del Evaluador, stage EVALUADA |
| 05 | `05-m3-veredicto-descartado` | `05-m2-veredicto-descartado` (m3 no existe desde P4) |
| 14 | `14-m7-tilde-deshabilitado` | `14-mc1-tilde-deshabilitado` |
| 15 | `15-m7-estructura` | `15-mc1-construir` |
| 16–20 | m8…m12 | `16-mc1-parcial`, `17-mc1-completa`, `18-mc2-refinar`, `19-mc2-parcial`, `20-mc2-completa` |

**Agregado**: `22b-m14-chequeo-parcial` y `22c-m14-chequeo-completo` (P7 llevó los hard-checks de 6 a
10 en dos grupos: sin estos, la galería no muestra ni la grilla agrupada ni el momento en que el
botón se destraba), y `37`…`40` — el panel de inicio con el foco de P8.

**Los homes cuelgan de setters DEDICADOS, no del setter QA.** El foco se deriva de la cartera entera:
sobre `setter-qa` (44 leads de smoke viejo + los 40 de la galería) no hay forma de elegir qué muestra
la foto. Cuatro setters `m0-gal-*@develop.test`, uno por situación: foco→construir, foco→«te está
esperando a vos», cartera vacía, y nada-para-trabajar. La limpieza idempotente los borra por prefijo
de email, igual que los leads por prefijo de `businessName` + owner conocido.

**Lo que NO se copió a mano.** Los nombres de los hard-checks y el reparto fase→pantalla se derivan de
`HARD_CHECKS` y `PANTALLA_DE_FASE` en vivo. El espejo hardcodeado es justo lo que quedó stale en P7.
La captura tenía un `for (let i = 0; i < 6; i++)` para tildar los duros: con 10 en la lista, el botón
no se habilitaba nunca. Ahora es `HARD_CHECKS.length`.

### El índice ya no puede mentir sobre su conteo

Era un `.md` a mano que declaraba «37 estados enumerados, 37 alcanzados» contra una tabla que ya no
los tenía. Ahora se genera (`scripts/dev/m0-galeria-indice.ts`, `npm run galeria:indice`): el conteo,
las dimensiones y el cruce salen del directorio de `.png`. El catálogo de prosa vive en el script; el
cruce marca **huecos** (catalogado sin foto) y **residuos** (foto sin catalogar). La primera corrida
encontró 10 residuos —los `.png` de los estados retirados, que habrían quedado ahí sin que nadie se
enterara— y se borraron.

**Trampa que este mismo trabajo se comió.** La primera versión del generador infería recortes desde el
`.png` («alto == viewport») y marcó **ocho falsos positivos**: hay pantallas que sí entran en 900px.
El alto de un archivo no puede probar recorte. La garantía se movió a donde está el dato: la captura
mide el desborde del `<main>` contra el DOM y **afirma que es cero** antes de disparar
(`ajustarYVerificar`). Si alguna quedara cortada, la corrida falla en vez de guardar una foto que
miente. El ajuste de viewport ya existía; lo que faltaba era la aserción.

### Verificación

| Chequeo | Resultado |
|---|---|
| `npm run galeria:capturar` | **50/50, exit 0** (2 corridas: la 2ª con la aserción de desborde activa) |
| Capturas miradas a ojo | 7 de distintos tramos — ver reporte. App real, con estilos, sin pantalla de error |
| Censo pantallas del registro vs galería | **15/15 cubiertas**, 0 huecos, 0 residuos |
| Índice | 43 estados + 7 mobile = 50 archivos, conteo DERIVADO |
| `npx tsc --noEmit` | exit 0 |
| `npm run check:invariants` | 18/18, exit 0 |
| `npm run test:setter` | **60/60, exit 0** — se corrió porque la corrida tocó `tests/helpers/setter-db.ts`, helper compartido con esa suite |

### Fuera de scope — anotado, no implementado

1. **Un estado del manual sin captura:** APROBADA con el envío cerrado (falta que responda o falta la
   `finalUrl`) **y un toque vencido** → la derivación manda a `m5` con `m15` habilitada. Es una rama
   real de `posicionDe` y la galería no la tiene. Se suma al catálogo cuando se decida si el manual
   la documenta.
2. **Veredicto CALIENTE sin captura.** 04 es AVANZAR y 05 DESCARTAR; CALIENTE abre el gate del brief
   **sin** que el negocio responda — es un camino distinto y no está fotografiado.
3. **El foco con un lead FIJADO** (6.1: el pin ordena la cola) no tiene captura propia.
4. **Rutas del portal fuera del manual paso-a-paso:** `/setter/nuevo`, `/setter/nuevo/importar` y
   `/setter/leads/[leadId]` (ficha + timeline). El manual de usuario las necesita; la galería sólo
   cubre el manual y el panel de inicio.
5. **`tsconfig.json` cambió sin que nadie lo editara:** Next agrega los tipos de `.next-galeria/` al
   buildear con un `distDir` nuevo, igual que las dos líneas de `.next-setter/` que ya estaban.
6. **La jerga «brief» sigue en el formulario de m6** («Título del brief», «Guardar brief») aunque el
   título de la pantalla ya es «Decidí cómo va a ser la demo». Es vocabulario, no galería.
7. **Cuatro de las cinco herramientas siguen en PENDIENTE** en el rail de todas las capturas
   (Evaluador, Gem de diseño, Claude Design, Gem de outreach). El hallazgo es de la corrida M0 y
   sigue igual: las URLs son de Franco.

### Lo que cierra Franco

- **Las capturas.** Ningún test valida que una imagen muestre lo que dice mostrar.
- **Si los cuatro estados del panel de inicio (37–40) reemplazan a `35-home-foco`** en el manual, o
  si conviven: 35 sale de una cartera real y ruidosa; 37–40 son limpios y elegidos.

---

## Corrida M1 v3 — El manual del Panel del Setter, escrito sobre el producto podado — 2026-08-10

**Rama** `redesign/home` · **HEAD de arranque** `02ba28df` · **Sin push.**
Diff de la corrida: **solo `docs/`**. Cero `src/`, cero tests, cero configuración.

### Fase 0 — el terreno, y el desvío que se declaró

La corrida anterior frenó por dos motivos (`docs/manual-usuario/CORRIDA-M1-v3-FRENADA.md`).
Hoy uno está resuelto y el otro no:

| Condición | Resultado |
|---|---|
| Borrados preparados ajenos en el índice | **PASA** — índice vacío. El riesgo que hizo que P9 no se commiteara ya no existe |
| Los nueve bloques de la poda, commiteados | **FALLA parcial** — ocho sí; **P9 (vocabulario) vive sin commitear** en 19 archivos |
| La galería regenerada sobre el producto podado | **PASA** — 50 capturas del 2026-08-10 12:30, con `mc1`/`mc2`, los tres momentos del chequeo y los cuatro paneles de inicio; sin `m7`…`m12` |

**Se siguió, declarándolo.** El motivo que de verdad impedía escribir —una galería
que retrataba el producto viejo— está resuelto: las fotos y la aplicación que se
navegó son **el mismo árbol**. Lo que falta es un commit, no el producto. Queda
registrado como **H-00** y en el reporte. La corrida corrió sobre el carril
aislado de la galería (`.next-galeria/`, `:3004`), es decir el build exacto con
el que se sacaron esas capturas. Ningún proceso ajeno vivo al arrancar; no se
mató ninguno.

### Parte A — el manual

**Índice + 13 capítulos**, estructurados por **momento del trabajo**, derivados
del recorrido que existe hoy (once pantallas de trabajo + espera, revisión,
reentrada y archivo). Se retiraron los diez capítulos de la corrida anterior:
documentaban dieciséis pantallas, las dos de evaluación separadas y las seis de
construcción. `HALLAZGOS-MANUAL.md` se conserva con una nota de documento
histórico — es contra lo que valida la Parte B.

Cobertura de lo que la poda cambió, toda escrita: la evaluación fusionada (cap.
03), la pantalla que decide la demo (06), las dos de construcción con sus seis
tildes (07), el chequeo con sus dos grupos (09), el panel con el foco nuevo (01),
y la reentrada tras rechazo (10).

**La munición se explica, no se transcribe:** los tres bloques copiables de
Refinar salen como tabla de *para qué sirve / cuándo se usa / qué mirar después
de pegarlo*.

### Parte B — la validación

**Nueve bloques verificados contra sus entradas de bitácora, en la aplicación
viva: cero desvíos.** La poda hizo lo que dijo.

**Los cuatro arreglos de fondo, los cuatro en pie.** El del autoguardado del
chequeo se probó más duro de lo pedido: los tildes sobreviven a salir navegando
por el manual **y** a cerrar el navegador entero. Las direcciones viejas se
probaron en siete combinaciones (`m3`, `m7`, `m9`, `m12` y una inventada, sobre
negocios en tres puntos distintos): todas aterrizan en la pantalla vigente, cero
bucles.

**De los 18 hallazgos anteriores: 4 resueltos, 1 desaparecido, 1 a medias, 12
vivos.** Ninguno de los doce es regresión — **los doce estaban anotados como
fuera de scope** en alguna entrada de la propia bitácora de la poda.

**Ocho principios de diseño: se cumplen cinco.** El barrido de nombres accesibles
sobre once pantallas da **cero** faltantes. Los tres que no se cumplen —la
pantalla no promete lo que no muestra, dos situaciones no muestran el mismo
texto, una sola forma de tildar— son los que la poda no tocó.

### Parte C — los hallazgos

**18 entradas: 4 nuevas, 13 heredadas, 1 de terreno.**

**El patrón, que es lo que más vale de esta corrida:** tres hallazgos en tres
pantallas que no comparten código confunden **«esperar al negocio» con «esperar a
Franco»** — la espera del envío que dice lo mismo en dos causas opuestas, el
contador del panel que llama «esperando respuesta» a una demo en la cola de
Franco, y la reentrada que promete un historial que no muestra. El producto tiene
vocabulario preciso para todo, menos para decir **a quién le toca**. No se
arregla con un cambio de texto puntual.

Y un residuo del barrido de vocabulario que ninguna auditoría había visto:
sobrevive **un** paréntesis con nombre de pantalla en todo el recorrido —
«Abre la producción de la demo **(Brief)**», en la opción *Respondió* de la
pantalla de toques. La bitácora de P9 no lo declara cubierto ni fuera de scope.

### Prueba de inocuidad

Se escribió en tres leads sembrados de la galería, todo restaurado y verificado:
tres tildes del chequeo (puestos y sacados, la lista quedó en cero), un enlace
inválido en la ficha (borrado, la ficha quedó vacía) y un enlace inválido en el
borrador (rechazado por la validación, nunca se guardó). **No se disparó ninguna
acción hacia afuera:** la confirmación de la reunión no se tocó, y la búsqueda de
horarios murió en la configuración local antes de llegar a Cal.com.

### Lo que cierra Franco

1. **Commitear el bloque de vocabulario (P9).** Es lo único que separa este
   veredicto de ser reproducible commit por commit.
2. **Las cuatro direcciones de herramienta.** Tres corridas seguidas lo registran
   como el hallazgo más importante: seis de las once pantallas de trabajo mandan a
   una herramienta que no se abre desde el panel.
3. **Configurar la agenda**, o el último paso del recorrido queda sin poder
   documentarse — y peor, el setter se come un mensaje de configuración técnica
   con el prospecto esperando.
4. **Lo que sólo él puede escribir en el manual:** el contexto comercial (qué
   rubros funcionan, qué zona), el tono real con los clientes, y munición curada
   —openers y respuestas a objeciones que ya cerraron— que hoy el manual sólo
   puede describir en abstracto.

---

## Sprint D10 — los avatares 3D dejan de viajar en el bundle inicial — 2026-08-10

Rama `redesign/home`, base `02ba28df`. Ejecuta el candidato **D#1** del PROBE del bundle
(`docs/probe-bundle-inicial.md` §D): sacar `three` + R3F del árbol del widget de chat sin tocar una
sola conducta. **Un objetivo, una pasada.** No difiere el widget (eso es otro sprint, con decisión
de producto de por medio).

**El hecho de partida, del PROBE:** `registry.ts` importaba los dos avatares 3D de forma estática,
así que 230,7 kB gz de `three` + `@react-three/fiber` bajaban, parseaban y evaluaban en **toda**
ruta pública — para alimentar dos componentes que la config vigente (`avatarStyle: "image"`) no
puede montar nunca, porque `AvatarRenderer` resuelve la escotilla `image` antes de tocar el registry.

### El cambio

`HeavyAvatarsLazy.tsx` (nuevo, cliente) resuelve los dos pesados por `dynamic(..., { ssr: false })`
— el mismo patrón que ya usan `HeroCanvas`, `DotMatrix` y `BrandedIntroCanvas` — y el registry
apunta ahí. Los avatares **no se borran**: siguen registrados, el picker del admin sigue mostrando
las cinco opciones, y al seleccionar uno su chunk baja on-demand.

**El eslabón que no estaba en el plan: los barrels.** Con el registry ya diferido, el build seguía
dando 25 chunks y 225,5 kB de `three` en la entrada del widget, y las dos entradas nuevas del
`react-loadable-manifest.json` salían con **`files: []`** — la firma exacta de "webpack resolvió
este `dynamic()` contra chunks que ya estaban cargados". La causa: `components/avatar/index.ts`
reexportaba `NeuroAvatar`, `LegacyNeuroAvatar` y `LegacyNeuroAvatarAdapter` de forma estática, y
`modules/chatbot/index.ts` los volvía a reexportar — y ese barrel lo importa entero
`ChatWidgetMount` en toda ruta pública. Un reexport estático es una arista igual de fuerte que un
import. Se trataron igual: los barrels ahora exponen `NeuroAvatarLazy` / `LegacyNeuroAvatarLazy`.
**Cambia el nombre de dos exports públicos del módulo** — ninguno tenía consumidor en el repo
(verificado por grep); los archivos originales siguen importables por ruta directa.

**El placeholder.** `loading` de `next/dynamic` no recibe las props del componente, así que
`HeavyAvatarFrame` reserva la caja del tamaño final y publica el accent como custom property; el
disco plano de marca lo lee por CSS. La caja del placeholder y la del canvas son la misma (67×67
para `neuro`, 73×73 para `legacy_neuro`) — no hay hueco que salte.

### Los números

Harness idéntico al del PROBE (Playwright 1.61.1 headless `--disable-gpu`, Slow 4G por CDP
1,6 Mbps / 150 ms RTT, CPU 4×, espera `load` + 9 000 ms, pesos gz nivel 9 sobre el build).
**Los dos brazos se buildearon completos y se sirvieron en paralelo** (A = baseline en `:3010`,
B = sprint en `:3011`), con las corridas **intercaladas** y un ciclo con el orden invertido.

**Censo estático — entradas de `dynamic()` según `react-loadable-manifest.json`:**

| entrada | A (baseline) | B (sprint) |
|---|---|---|
| `ChatWidgetMount → @/modules/chatbot` | 25 chunks · **438,5 kB gz** | 22 chunks · **202,0 kB gz** |
| `three` dentro de esa entrada | 3 chunks · **225,5 kB gz** | **0** |
| `HeavyAvatarsLazy → ./NeuroAvatar` | — | 5 chunks · 232,5 kB gz *(on-demand)* |
| `HeavyAvatarsLazy → ./LegacyNeuroAvatarAdapter` | — | 6 chunks · 240,2 kB gz *(on-demand)* |

**Runtime, `/` mobile 390×844 — 5 corridas por brazo:**

| | A | B | Δ |
|---|---|---|---|
| scripts totales | 43 | **40** | −3 |
| JS sobre el cable | 757,2 kB | **520,1 kB** | **−237,1 kB** |
| inicial (pre-paint) | 18 · 317,7 kB | 18 · 317,9 kB | **±0** *(hash distinto)* |
| post-paint | 25 · 439,5 kB | 22 · 202,3 kB | **−237,2 kB** |
| long tasks (mediana) | 4 056 ms | **3 296 ms** | **−760 ms** |
| long tasks pre-FCP | 1 203 ms | 1 167 ms | ±0 |
| TBT | 3 456 ms | **2 796 ms** | **−660 ms** |
| FCP = LCP | 2 960 ms | 2 872 ms | −88 ms *(dentro del ruido)* |
| CLS | 0,0057 | **0,0057** | **0** |
| `<canvas>` dentro del widget | 0 | **0** | — |
| errores de consola | 0 | 0 | 0 |

**Dónde cobra el ahorro, y dónde no.** Los 237 kB salen enteros en toda ruta pública donde **no
monte otro canvas 3D**. Donde ya hay uno, `three` viaja igual por su propio dueño y lo único que se
gana es que el widget deje de adelantarlo:

| escenario | A | B | Δ |
|---|---|---|---|
| `/` mobile (sin canvas) | 757,2 kB | 520,1 kB | **−237,1 kB** · long tasks −760 ms |
| `/` desktop **reduced-motion** (sin canvas) | 757,0 kB | 520,0 kB | **−237,0 kB** · long tasks −698 ms |
| `/` desktop 1440 (hero 3D activo) | 784,5 kB | 778,7 kB | −5,8 kB · long tasks en el ruido |
| `/web-development` mobile (`HeroBackground`) | 807,0 kB | 801,2 kB | −5,8 kB · long tasks en el ruido |

Los pesos son deterministas (idénticos corrida a corrida). Los tiempos derivan por carga del host:
en los dos escenarios marcados "en el ruido" los rangos de los brazos se solapan (desktop
A 4 452–4 610 ms vs B 4 355–4 542; landing A 10 846–11 192 vs B 10 975–11 774).

### Los dos caminos del avatar, verificados

1. **`avatarStyle: "image"` (la config real).** DOM idéntico al baseline: el mismo
   `<img src="data:image/webp;base64,…">` de 56 px. **Cero `<canvas>` dentro del widget**, en los
   dos brazos. Teaser proactivo a los 3 s, el chat abre, el input responde, 0 errores de consola.
   Capturas del launcher A vs B: mismo avatar, misma posición, mismo tamaño.
2. **`neuro` activado.** La config se reescribió **sólo en el test**, interceptando
   `/api/chatbot/*/config` con `page.route` — sin tocar la base ni el código. Baja el chunk y monta:
   canvas 67×67 a los **159 ms** en localhost y a los **1 480 ms** con Slow 4G + CPU 4×. Mientras
   baja se ve el disco ámbar plano ocupando la caja final. Misma geometría que el brazo A (67×67).
3. **`legacy_neuro` activado.** Igual: caja 73×73, canvas a los 222 ms en localhost. 0 errores.

### Gates

| Gate | Resultado |
|---|---|
| `next build --webpack` | **verde** (corrido con `E2E_DIST_DIR` para no pisar `.next`, que comparte el checkout) |
| `npx tsc --noEmit` | **exit 0** |
| `eslint` sobre los archivos tocados | **0** — los 6 errores + 2 warnings del directorio son pre-existentes (`LegacyNeuroAvatar.tsx`, el archivo congelado) y están fuera del diff |
| `impeccable detect` — `design-system/` | **0** (se sostiene) |
| `impeccable detect` — `src/` completo | **103 → 103**; superficie pública **84 → 84**; **0 hallazgos nuevos** |
| errores de consola | `/` 0→0 · `/web-development` mismas 3 clases pre-existentes en los dos brazos (404 + CSP report-only del iframe de template-zero) |
| `npx prisma migrate status` | up to date, 86 migraciones |

*Nota sobre el detector:* el encargo cita 55 como baseline de superficie pública; el número que da
hoy el detector con el filtro "todo `src/` menos `app/(protected)` y `app/api`" es 84. No se pudo
reconstruir el scope exacto de aquel 55. Lo que decide el gate es el **delta, que es 0**: mismos
hallazgos, mismas líneas, antes y después.

### La trampa del harness (costó dos builds)

El brazo B falló a compilar dos veces con
`./src/app/globals.css:4:1 Module not found: Can't resolve './&'`. **No era el cambio.** Los
directorios de build del A/B (`.next-perf-a`, `.next-perf-b`) no estaban gitignoreados, y la
auto-detección de fuentes de Tailwind 4 —que respeta gitignore— se puso a escanear el **HTML
prerenderizado del otro brazo** como si fuera código. Ahí encontró la clase arbitraria
`bg-[url('https://grainy-gradients.vercel.app/noise.svg')]` de `web-development/page.tsx` ya
escapada a entidades HTML
(`url(&#x27;…&#x27;)`), emitió ese CSS, y `css-loader` intentó resolver `./&` como módulo. Se
resolvió excluyendo `.next-perf-*/` en `.git/info/exclude` (local, no toca ningún archivo
versionado ni el `git status` de las otras sesiones). **Regla:** todo distDir alternativo tiene que
estar ignorado antes del primer build, o contamina el siguiente.

**Regla 2 — esta bitácora también es fuente de Tailwind.** El párrafo de arriba escribía la clase
con la URL elidida (`…noise.svg`), y eso volvió a romper el build en el sprint siguiente: Tailwind
escanea `docs/**/*.md`, extrajo la clase truncada del markdown y `css-loader` volvió a intentar
resolver un módulo que no existe. La documentación del bug reintrodujo el bug por otra puerta. Al
citar una clase arbitraria con `url()` en un doc, escribirla **completa y resoluble** (una URL
absoluta `https://` la deja pasar); nunca elidir el path con `…`.

### Fuera de scope — anotado, no implementado

1. **Diferir el widget entero** (~202 kB gz que quedan). Sigue siendo la jugada más grande del repo
   y ahora se puede medir sobre un set más chico. Las dos ataduras del PROBE siguen en pie: el
   teaser dispara solo a los 3 s, y el first-touch de atribución se resuelve al montar. Sprint
   propio, con decisión de producto.
2. **`@next/bundle-analyzer`** sigue instalado y sin cablear — hay que tocar `next.config.ts`, que
   otra sesión está editando.
3. **El LCP no se movió y no iba a moverse.** El techo son los 18 chunks iniciales hidratando; este
   sprint no toca un byte del inicial (medido: ±0).
4. **`three` sigue viajando en las 5 landings y en el home desktop**, por sus propios canvas
   (`MarketingIntro → BrandedIntroCanvas`, `HeroBackground`, `HeroCanvas`). Gatearlos es otro frente.

### Lo que cierra Franco

- **Que el launcher se vea igual** en `/` y en una landing, desktop y mobile. El DOM y las capturas
  dicen que sí; la última palabra es mirarlo.
- **El disco plano como estado de carga de los avatares 3D.** Sólo se ve si algún bot vuelve a un
  avatar 3D, y dura ~1,5 s en 4G. Si prefiere otra cosa ahí (la imagen del bot, o nada), es un
  cambio de una línea en `HeavyAvatarsLazy.tsx`.
- **El renombre de los dos exports del barrel** (`NeuroAvatar` → `NeuroAvatarLazy`,
  `LegacyNeuroAvatar` → `LegacyNeuroAvatarLazy`). Nadie los importa hoy; si el módulo se extrae
  algún día, esos nombres son su API pública.

## Sprint D11 — framer-motion en el home: la medición dice que no hay nada que sacar — 2026-08-10

Sprint de una sola fase. La hipótesis era la del PROBE de motion: 69 de 76 formas de `initial` en el
sitio eran `opacity` + `transform`, 37 eran literalmente el mismo `opacity: 0, y: N`, y framer pesaba
63 kB gz. Cambiarlas por `IntersectionObserver` + CSS parecía la última pieza barata del home.

**El número viejo describía un archivo que ya no existe.** Ese PROBE se midió sobre el monolito de
9.898 líneas que B4 borró. Hoy las seis secciones del home —`Hero`, `Portfolio`, `PortalDemo`,
`Nosotros`, `Servicios`, `Cierre`— tienen **cero** imports de `motion/react` y 13 usos de
`animate-ds-reveal` / `animate-ds-rise`. La migración que este sprint proponía **ya la hizo el
rediseño**. No quedaba nada que migrar en las secciones.

### El censo (bundle inicial de `/`)

Doce consumidores reales de `motion/react` más uno type-only (`lib/motion-variants.ts:1`, que se borra
en compilación y pesa 0). El corte que importa no es "reemplazable vs no": es **de quién son**.

| Archivo | Qué usa | ¿Reemplazable? |
|---|---|---|
| `context/PreloaderContext.tsx:4` | 7× `useMotionValue` | No — y el archivo está **congelado** |
| `ui/MarketingIntro.tsx:5` | `animate`, `useMotionValue`, `useTransform` | No |
| `ui/IntroLockupText.tsx:3` | `useTransform` sobre MotionValues compartidos | No |
| `ui/LogoStrokeOverlay.tsx:3` | `useTransform` sobre MotionValues compartidos | No |
| `layout/Navbar.tsx:3` | 2× `AnimatePresence mode="wait"` con `exit` | No |
| `design-system/SectionShell.tsx:3` | `useInView` (`once:false`) — es el theming, no un reveal | Sí |
| `layout/Shutter.tsx:3` · `ui/Button.tsx:4` | `motion.div` / `motion.button` | Sí / parcial |
| `sections/home/Footer.tsx:5` | 37 `motion.*`, 12 `whileInView`, pero 2 `AnimatePresence` + 4 `exit` | Mixto |
| `layout/HomeWrapper.tsx:3` · `layout/HeroArtifactLayer.tsx:4` · `portal-demo/useEscenaCycle.ts:3` | `motion.main`, un fade, `useReducedMotion` | Sí |

Los cinco primeros llegan por el **root layout**, no por el home.

### La medición

Ground truth: los `<script src>` del HTML prerenderizado, no un manifest. `app-build-manifest.json` ya
no existe en Next 16.2.9.

| | |
|---|---|
| Bundle inicial de `/` | 19 chunks · 355,8 kB gz |
| Sin `polyfills` (el recorte del harness del baseline) | **18 chunks · 317,2 kB gz** — reconcilia con los 317,7 medidos antes |
| framer-motion | **1 chunk**, `3813-*.js`, **42,5 kB gz**, puro (sin `react-dom`, `scheduler`, `three`, `sonner`) |

### El hallazgo: el chunk de motion no es del home

La prueba no es un argumento, es una segunda ruta. `/login` comparte el root layout y **no renderiza
ni una sección del home** — y carga el mismo chunk `3813`, los mismos 42,5 kB gz.

| | chunks | kB gz | de los cuales motion |
|---|---|---|---|
| Compartido `/` ∩ `/login` (lo pone el root layout) | 17 | 344,1 | **42,5** |
| Exclusivo de `/` (todo lo que este sprint podía tocar) | 2 | **11,7** | **0** |

El techo absoluto de un sprint que solo toca el home son 11,7 kB gz, y **ni un byte de esos es
framer-motion**. `Footer`, `HomeWrapper`, `HeroArtifactLayer` y `useEscenaCycle` no *traen* la
librería: la *referencian* desde el chunk compartido que el layout ya cargó. Migrarlos a los cuatro
adelgaza `app/page-*.js` unos pocos kB y deja los 42,5 exactamente donde están.

### El criterio, aplicado

1. **¿Todos los usos del inicial son reemplazables?** No. `PreloaderContext` (congelado, 7
   `useMotionValue`), `Navbar` (`AnimatePresence` con `exit`) y el árbol del Preloader
   (`useTransform` sobre MotionValues compartidos).
2. **¿Se pueden diferir en vez de reescribirlos?** No. `PreloaderContext` es el provider que envuelve
   el árbol entero; el Preloader **es** el primer paint —diferirlo empeora justo lo que se optimiza—;
   el `Navbar` es chrome above-the-fold en toda ruta.
3. **¿El ahorro supera ~30 kB gz?** El ahorro es **0 kB gz**. No "menos de 30": cero.

→ **Sprint cerrado en Fase 1, sin tocar una línea de código del home.** Cero cambios visuales, cero
riesgo sobre los reveals, `CLS` intacto en 0,0057 por construcción.

### El build estaba roto en HEAD, y no por este sprint

`npm run build` fallaba en `39b9d90f` con `globals.css:4:1 Module not found`. La causa: el párrafo de
D10 que documenta la trampa de Tailwind escribía la clase arbitraria con el path elidido. Tailwind 4
escanea `docs/**/*.md`, extrajo esa clase del markdown y `css-loader` murió resolviendo un módulo
inexistente. **La documentación del bug reintrodujo el bug por otra puerta** — misma falla, fuente
distinta: antes el HTML prerenderizado del otro brazo, ahora la bitácora. Se arregló escribiendo la
URL completa y absoluta (`https://`, que `css-loader` deja pasar) y se anotó como *Regla 2* arriba.
Sin eso no había medición posible.

### Fuera de scope — anotado, no implementado

1. **`MarketingIntro` viaja en el inicial de `/` sin renderizarse nunca.** `marketing-routes.ts`
   excluye el home del allow-list, pero `Preloader.tsx:6` lo importa estático, así que los tres
   archivos (`MarketingIntro` 409 L + `IntroLockupText` 256 L + `LogoStrokeOverlay` 142 L, todos
   motion-pesados) se bundlean para nada. Viven en `app/layout-*.js`, que entero pesa 9,8 kB gz — el
   ahorro real es una fracción de eso, muy por debajo del umbral, y **no saca el chunk de motion**
   (lo retienen `PreloaderContext` y `Navbar`). Es un `dynamic()`, no una reescritura de animación.
2. **`Footer` es la última pieza legacy del home** (916 líneas, 37 `motion.*`). No se tocó porque no
   mueve el bundle. Si algún día se reescribe, que sea por su tamaño, no por performance.
3. **Sacar framer-motion del sitio entero** es un frente distinto y mucho más grande: obliga a tocar
   `PreloaderContext`, que está congelado. Requiere decisión de Franco antes de existir.
4. **Tailwind escanea `docs/`.** Cualquier bitácora futura que cite una clase arbitraria con `url()`
   puede volver a romper el build. El arreglo sistémico sería acotar las fuentes de Tailwind; toca
   `globals.css`, archivo caliente y compartido.

### Lo que cierra Franco

Nada técnico. Con esto se agota el trabajo de performance del home: lo que queda es la pasada visual
y el contenido real de los placeholders. El inventario queda **idéntico** — este sprint no modificó
ningún archivo de `src/`, así que no lo pudo mover ni en un carácter.

---

## Sprint P11 — A quién le toca: el concepto que faltaba — 2026-08-10

Rama `redesign/home`, HEAD de arranque `c138ae4c`. **Sin push.**

**Fase A previa (separación del árbol).** El árbol traía dos trabajos terminados sin commitear de dos
sesiones distintas, más una bitácora que los dos habían escrito. Se separaron sin descartar nada:
`f06df31e` (P9, barrido de vocabulario — 19 archivos de `src/`, +95/−56, exactamente lo que su propia
entrada declara) y `c138ae4c` (Corrida G, galería regenerada — 8 archivos + el script del índice). La
bitácora se partió por tramos construyendo el blob del índice (`hash-object --path` + `update-index`),
sin tocar el árbol de trabajo. Quedó **un archivo sin commitear y declarado**: `tsconfig.json`, que es
MIXTO — dos líneas de `.next-galeria/` (galería) y seis de `.next-perf-*/` (residuo
de la sesión de perf ya commiteada en `39b9d90f`, con esos dirs excluidos por `.git/info/exclude` y ya
inexistentes; los builds de ESTA corrida le sumaron el par de `.next-perf-base/`, misma clase de residuo autogenerado — ninguna línea la escribió nadie). No encaja limpio en ninguno de los dos grupos, y la propia entrada de Corrida G lo lista
bajo «fuera de scope».

### El hallazgo

El manual de usuario recién escrito encontró tres pantallas que **no comparten una sola línea de
código** diciendo lo mismo para dos cosas distintas: confundir **esperar al negocio** con **esperar a
Franco** (H-02, H-03, y de refilón H-09). Lo delató una frase que el manual no pudo escribir derecha:
el capítulo 11 tuvo que enseñar a leer *«la etiqueta al lado del nombre del negocio»* como
diagnóstico, y después admitir que la pantalla dice algo que no aplica.

Que tres superficies independientes lleguen al mismo error no es un bug suelto: **falta un concepto**.
El producto tiene vocabulario preciso para todo —ficha, veredicto, opener, toque, brief, borrador,
chequeo— menos para decir **a quién le toca**.

### El censo (antes de editar)

Once superficies hablan de esperas. Clasificadas por turno:

| Turno | Superficies | Estado |
|---|---|---|
| **negocio** (afuera, puede no pasar nunca) | pantalla de estado, panel de inicio, envío, `proximaAccionPara` | decidían cada una por su cuenta |
| **franco** (adentro, va a pasar) | las MISMAS cuatro + novedades + filtro de cartera | las dos primeras lo llamaban «espera del negocio» |
| **setter** (no es espera: es acción) | `motivoOrden`, banner de turnaround | «Te está esperando a vos», sin vocabulario compartido |

Tres son **copy muerto** (0 consumidores, verificado): `describirFoco` entero en `paso.ts`,
`GUIA_BRIEF.gate` y `GUIA_REVISION`. No se tocaron — retirar copy muerto es poda, no vocabulario.

**De dónde sale el turno.** De lo que el producto ya sabe: `status` (la conversación), `stage` (la
demo) y `dossier.finalUrl` — la URL permanente que Franco registra AL APROBAR. Ese campo es el
discriminador que faltaba: aprobada **sin** link cargado significa que el envío está trabado de este
lado, no del otro. Cero datos nuevos, cero migraciones.

### El concepto, una sola vez

`src/lib/leados/turno.ts` — módulo HOJA (solo tipos de Prisma, así `flow.ts` lo consume sin ciclo).
`turnoDelLead()` decide; `TEXTO_TURNO` tiene las palabras, editables por Franco en un solo lugar.

No re-decide lo que ya estaba decidido: recibe `accionPendiente` —`HomeLead.accionable` en el panel,
«la pantalla derivada es de estado» en el manual— y lo TRADUCE. Por eso no puede desincronizarse de la
cola de trabajo. Los gates (`gateBriefAbierto`, `gateEnvioDemo`) siguen en `flow.ts`, intactos.

Los tres textos:

| Turno | Titular | Qué dice |
|---|---|---|
| negocio | **Le toca al negocio** | «Puede contestar hoy, en dos semanas o no contestar nunca — eso no lo manejás vos. Cuando toque un toque te lo traemos al foco; mientras tanto, trabajá otro negocio.» |
| franco | **Le toca a Franco** | «Está de este lado y va a salir: es cuestión de tiempo, no de suerte. No hace falta que le avises ni que lo persigas — cuando lo resuelva, el negocio vuelve solo a tu foco.» |
| setter | **Te toca a vos** | «Esto no es una espera: hay algo trabado de tu lado y nadie lo va a destrabar por vos. Abrilo y seguí desde donde quedó.» |

El titular dice el turno **solo**: ninguna pantalla obliga ya a leer una etiqueta al costado.

Consumidores (los cinco, sin excepción): `estado-manual.tsx`, `home-en-espera.tsx` (un chip POR
TURNO en vez de un contador único), `m15-envio.tsx`, `proximaAccionPara` y `motivoOrden`.

**El cuarto «todavía no» del envío.** `gateEnvioDemo` pide aprobación + `finalUrl` + enganche, y la
aprobación y el link son dos cosas que Franco hace en momentos distintos — pero la pantalla tenía tres
mensajes, no cuatro. Ahora aprobada CON link y sin respuesta es del negocio; aprobada SIN link es de
Franco, con su causa real nombrada.

### La red

`turno.invariant.ts` (invariante 19). Fija seis cosas sobre las 432 combinaciones de
status × stage × finalUrl × acción-pendiente: totalidad, texto propio por turno, **ningún texto
compartido entre dos turnos**, los tres alcanzables, coherencia con `accionable`, y el caso #29 del
manual clavado por ejecución. El universo se escribe como `Record<LeadStatus, true>` para que un enum
nuevo **no compile** en vez de escaparse de la matriz.

**Demostrado fallando, dos veces.** (1) Igualando `franco.titulo` a `negocio.titulo`: *«dos turnos
distintos muestran el MISMO texto: negocio.titulo y franco.titulo dicen «Le toca al negocio»»*, exit 1.
(2) Apagando la derivación «aprobada sin link → Franco»: *«lo que está en la cola de Franco es de
Franco... 'setter' !== 'franco'»*, exit 1. Restaurado, verde.

### El residuo de vocabulario

El manual encontró uno; el barrido dejó **cuatro** —la búsqueda de P9 no miraba los mensajes de error
de las server actions—:

- `seguimiento-form.tsx`: «Abre la producción de la demo **(Brief)**» → «Frena los toques y te habilita
  a construir la demo». Es el que el manual vio: visible, y encima traía un tercer sinónimo de
  construir la demo.
- `dossier.actions.ts`: «Falta publicar el borrador **(Borrador)**» → sin el paréntesis.
- `outreach.actions.ts`: «Primero registrá el opener **(Opener)**» → sin el paréntesis.
- `guidance-content.ts` (`GUIA_SEGUIMIENTO.porque`): mismo `(Brief)`. Copy muerto —ese teach panel no
  se monta—, corregido igual por coherencia.

Queda uno declarado: `paso.ts:110` «Mandá el primer mensaje (opener)», dentro de `describirFoco`, que
no tiene consumidores.

### Verificado en la aplicación (no solo compila)

Spec temporal contra el harness real del setter (`.next-setter/`, :3003), **borrada después de
correr** — 5/5 verde. Sin capturas: se afirma por navegación real y lectura del DOM del `<main>`,
nunca por status code.

| Situación sembrada | Qué dice el producto | ¿Se entiende el turno solo? |
|---|---|---|
| El negocio no contestó (EVALUADA, opener mandado, toque futuro) | *En espera* → **«Le toca al negocio»** → «…o **no contestar nunca** — eso no lo manejás vos… trabajá otro negocio. Próximo toque el 13/8» | sí |
| La demo espera a Franco (EN_REVISION) | *En revisión* → **«Le toca a Franco»** → «…va a salir: es cuestión de tiempo, no de suerte. No hace falta que le avises ni que lo persigas» | sí |
| Aprobada y lista: le toca al setter | *Envío* → **«Tu paso ahora / Mandá el link al negocio»** → «Demo aprobada — momento de enviar el link» | sí, y sin ninguna frase de espera |
| **La captura #29**: aprobada + respondió + SIN link de Franco | *En espera* → **«Le toca a Franco»**; y en el envío: **«Le toca a Franco» / «todavía no cargó su link permanente…»** | sí — antes decía «Esperando respuesta del negocio» a un negocio que ya había respondido |
| Panel de inicio con un solo lead, en la cola de Franco | «No hay nada para trabajar ahora mismo» → **«1 esperando a Franco»** | sí — antes «1 · esperando respuesta» |

**Lo que el DOM delató y el manual no había visto.** En la única pantalla donde el turno es del setter
(m15 con el gate abierto), el subtítulo del registro decía *«se destraba solo, sin que tengas que hacer
nada»* — el mismo texto que con el gate cerrado. Le toca a él y sonaba a espera. Ahora dice qué es:
«El segundo mensaje: la demo aprobada, con su link, al negocio que respondió».

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | **exit 0** — línea base era 0 errores, sigue en 0. **Ninguno nuevo** |
| `npm run check:invariants` | **19/19, exit 0** (el 19 es `check:invariant:turno`) |
| `npm run test:leados` | **25/25, exit 0** |
| `npm run test:setter` | **60/60, exit 0** (build aislado en `.next-setter/`, puerto 3003). La corrida con la spec temporal adentro dio **65/65** |
| `git diff --stat` | 15 archivos tocados + 2 nuevos (`turno.ts`, `turno.invariant.ts`). Cero transiciones, gates, aislamiento, lista de fases ni schema |

### Fuera de scope — anotado, no implementado

1. **El panel dice «mandá el link» para una demo aprobada sin `finalUrl`.** `grupoPara`/
   `proximaAccionPara` deciden con `gateBriefAbierto` (respondió ∨ caliente), que no mira `finalUrl`:
   ese lead cae accionable en `trabajar` y el card pide mandar un link que no existe. Es el mismo
   hallazgo, pero del lado de la ACCIONABILIDAD, no del vocabulario: arreglarlo pide proyectar
   `finalUrl` en `HomeLeadInput` y cambiar qué es accionable — decisión de producto, no de barrido.
2. **Copy muerto que habla de esperas:** `describirFoco` (`paso.ts`), `GUIA_BRIEF.gate` y
   `GUIA_REVISION`. Cero consumidores; retirarlo es poda.
3. **`tsconfig.json` sigue sin commitear**, declarado arriba.
4. **La galería y el manual de usuario** no se regeneran acá. Solo se ajustaron los tres selectores de
   `tests/galeria/captura.spec.ts` que dependían de los textos cambiados, para no dejar la corrida de
   capturas rota a la espera.
5. Los hallazgos que la bitácora ya declaró fuera de scope siguen fuera: accesos externos pendientes,
   horarios, «assets», «Toque» vs «Seguimiento», «call» vs «reunión».

### Lo que cierra Franco

- **Los tres textos.** Sobre todo el del negocio: tiene que transmitir que puede no pasar nunca sin
  sonar desalentador.
- **Que el turno se entienda de un vistazo**, mirando las pantallas.

---

## Corrida de experiencia — el Panel del Setter recorrido como usuario (11/8/2026)

**Qué fue.** No una auditoría: cinco recorridos *usando* el panel y anotando cada cosa que
hizo falta saber y la pantalla no dijo. El camino principal entero y en secuencia por el
agente padre sobre un negocio sembrado desde cero (`Gimnasio Nova Fit`, `OsLead` sin
dossier), y después cuatro barridos en paralelo: la demo rechazada, el negocio que no
contesta, nombres accesibles y celular. Salida en
[`docs/manual-usuario/BACHES-CORRIDA-EXPERIENCIA.md`](manual-usuario/BACHES-CORRIDA-EXPERIENCIA.md).

**Contra qué.** `4dadd274`, build de producción en un **worktree aislado** (`C:/tmp/corrida-exp`,
puerto 3005). Hizo falta porque el checkout compartido estaba siendo mutado en vivo por otra
sesión: había un `npm run start:setter` corriendo en `:3003` con `E2E_DIST_DIR`, y ni ese
script ni el knob `distDir` existen ya en el árbol. Buildear encima habría medido un árbol
que no es `4dadd274`.

**Dos premisas del encargo no se sostienen contra este commit.** La "pantalla de evaluación
fusionada" no existe: son dos (`EVALUACIÓN — PASO 1 DE 2` / `2 DE 2`). Las "dos pantallas de
construcción con tres tildes cada una" tampoco: son **seis** (`PASO 1 DE 6`, m7–m12, un tilde
cada una), y `mc1`/`mc2` devuelven byte a byte la misma página que un paso inexistente
(`mzz`). Lo que sí se pudo responder es cómo se lee la versión que existe: la de seis se lee
como un paso de trabajo por pantalla, no como cosas apiladas.

**48 baches. Seis patrones — eso es lo que vale.** Un bache que aparece en pantallas que no
comparten código no son varios bugs, es un concepto que falta:

1. **No hay acuse de recibo estándar en el lugar del clic** — 10 casos, 6 caminos de código.
   El aviso flotante confirma y la pantalla sigue mostrando el estado anterior, a veces
   contradiciéndolo en la misma vista ("Construcción arrancada" arriba, "Primero arrancá la
   construcción" abajo). **Ya produjo daño medible:** sin acuse, el barrido B registró la
   misma postergación dos veces. El patrón correcto ya existe en el producto ("Fijar arriba"
   se deshabilita y anuncia en la live region) — falta aplicarlo parejo.
2. **El puntero de "dónde estoy y a dónde voy" miente** — 8 casos. `m3` dice "tu paso de
   ahora es otro" y manda a `m2`, que solo avanza a `m3`; lo mismo entre `m5` y `espera`. El
   chequeo final se nombra tres veces y no se linkea ninguna. La nav "Cartera" lleva a "Tu día".
3. **El dato que necesitás vive en una sola pantalla y no viaja** — 7 casos. El peor: el
   motivo del rechazo.
4. **Mensajes de sistema crudos al setter** — 2 pantallas, y las dos esquivan el traductor
   que el resto del panel usa.
5. **Vocabulario que cambia entre pantallas** — Pausar/Posponer/Postergar, con el filtro
   "Pausados por vos" vacío porque el lead cae en otro.
6. **Lo que decide más tiene menos peso que lo accesorio** — los 6 checks que bloquean el
   envío miden 26px sin fila tappeable; los 4 que no bloquean nada, 44px con fila tappeable.

**Los tres que más bloquean a quien trabaja solo.** (a) En la reentrada por rechazo,
**"Reabrir construcción" destruye el motivo del rechazo** — pasa a CONSTRUCCIÓN y `Qué/Dónde/
Arreglo` desaparece de `mr`, de la tarjeta de cartera y de los doce pasos barridos, mientras
`mr` promete "el historial de rechazos se conserva" y el historial dice "sin movimientos".
(b) En `m13`, guardar sin tocar el interruptor de confirmación devuelve **`Invalid literal
value, expected true`**, en inglés y con el `aria-invalid` sobre el campo URL, que es válido.
(c) **La postergación se guarda un día antes de la elegida** — 25/8 → 24/8, 1/9 → 31/8, dos
de dos.

**Lo que está bien y conviene no tocar.** El chequeo final con sus dos grupos rotulados es la
mejor pantalla del recorrido y **la partición ya está lista para delegar la revisión algún
día**. Las esperas dicen de quién es el turno sin ambigüedad y sacan el peso de encima ("el
foco te lo trae cuando llegue"). La cadencia de tres toques está escrita entera y el sistema
**no te deja insistir de más**: al tercero el botón desaparece. Y `m16` trae el mejor aviso de
consecuencia de toda la app, justo encima del botón que no hay que apretar a la ligera.

**Cuatro correcciones a cosas escritas antes**, todas verificadas contra el DOM:
- El **checkbox de `m16` SÍ tiene nombre accesible**: está envuelto en un `<label>` con texto,
  y el label envolvente nombra. **H-13 está mal en ese punto** (el resto del hallazgo sigue).
  Confirmado de forma independiente por el padre y por el barrido de accesibilidad.
- Los **4 botones de resultado de `m5` SÍ tienen `aria-pressed`** — el padre afirmó lo
  contrario a mitad de corrida y se retractó.
- El **tilde de fase ya se acusa** en el lugar del clic ("Fase marcada como hecha"): H-11
  mejoró.
- La salida cuando falta una herramienta **ya está escrita** ("pedíselo a Franco y lo vas a
  poder abrir desde acá"), contra lo que dice H-01 — pero está plegada bajo "Qué es y cómo se
  usa", falta en `m5` y la herramienta ni aparece en `mr`.

**Herramientas sin dirección: 24 choques** sumando los cinco recorridos (10 el camino
principal, 8 la rechazada, 6 el que no contesta). Sigue siendo el techo real: **el punto de
frenada de alguien nuevo es `m2`, el segundo paso de su primer negocio.** Se resuelve
cargando cuatro URLs.

**La pregunta de fondo — ¿podría alguien que nunca vio esto recorrerlo solo? NO.** Se frena en
`m2` (configuración). Resuelto eso, se frena en `m13` (producto). Y si le rechazan una demo,
en `mr`. Todo lo que está en el medio sí se recorre solo: **el recorrido está mucho mejor
contado de lo que está destrabado.**

**Nota de instrumento.** El panel del navegador no compone frames: React 19 difiere el reveal
de los Suspense boundaries desde `requestAnimationFrame`, así que el contenido queda en un
`<div hidden>` y parece que la app no carga; y las transiciones CSS quedan congeladas en el
frame 0. Produjo seis falsos positivos, todos refutados antes de escribirlos — incluida una
sospecha del padre sobre el detalle de revisión del admin, que **se retira**.

**Fixtures movidos** (Neon dev): `QA-W Rechazada` quedó en CONSTRUCCIÓN con las 6 fases
tildadas — **ya no reproduce la pantalla de reentrada, hay que re-seedearlo**. `QA-W Evaluada
Gate Cerrado` quedó POSTERGADO con 3 toques y dos postergaciones (la segunda, duplicada por el
bache del acuse). El negocio sembrado quedó en EN_REVISION.

**Ninguna acción hacia afuera disparada.** "Confirmar y agendar" y "Buscar de nuevo" (m16) no
se tocaron en ninguno de los cinco recorridos; el formulario quedó documentado igual.
"Enviar a revisión" sí se apretó una vez, y la propia app declara que es cola interna
("Franco la ve en su cola").

**Cierre:** `git diff --stat` sin cambios en archivos versionados; el único agregado es
`docs/manual-usuario/BACHES-CORRIDA-EXPERIENCIA.md` más esta entrada. Cero `src/`, cero
tests, cero config. Worktree y scripts de navegación borrados. Sin push.

---

## Sprint F0 — Reconciliar las ramas y re-verificar los baches sobre el producto podado — 2026-08-12

Dos fases. La A cerró antes de arrancar la B.

### Fase A — las ramas

**El diagnóstico.** `main` local estaba en `4dadd274`, **56 commits atrás** de `origin/main` y
contenido en él (avance directo, sin conflicto). `redesign/home` sí había divergido de `origin/main`
(34 adelante / 30 atrás) pero **en archivos distintos**: setter y home de un lado,
`src/modules/chatbot/` del otro. Y **P11 no estaba en ninguna rama**: vivía en `stash@{0}`
(`507afe2d`), con `turno.ts` y `turno.invariant.ts` en el tercer padre — sin esos dos, no compila.

**El hallazgo que reencuadró la Fase B.** El reporte de la corrida de experiencia declara `4dadd274`,
y ese commit **no tiene ni uno solo de los diez bloques de la poda**. La corrida no midió el producto
medio podado: midió el producto **sin podar**. El propio reporte lo había visto sin poder explicarlo
("la evaluación fusionada no existe: son dos"; las de construcción "son seis").

**Paso 0 — P11 primero.** `git stash apply` (nunca `pop`) sobre `leados/p11-turno`, rama nueva anclada
en la base real del stash (`0f6fee58`), en un worktree aislado. Los dos archivos del tercer padre
verificados por hash contra `stash@{0}^3`. Commit `513f38b4`, árbol limpio en la misma pasada.

**Concurrencia.** A mitad del diagnóstico **otra sesión tomó el checkout principal**, commiteó la
corrida (`daed0270`), mergeó `origin/main` (`8b60c176`) y pusheó — también `redesign/home`. Auditado
antes de seguir: `55b967af → 8b60c176` suma bitácora + doc de baches + `.gitignore`, y **borra cero
líneas**. De ahí en adelante todo el trabajo se hizo en worktree propio.

**El único conflicto no fue código:** `bitacora-beta-3.md`, en los dos merges. `.gitignore`,
`next.config.ts` y `package.json` automergearon limpio. Resuelto por concatenación cronológica y
**verificado mecánicamente**: conteo de líneas = base + los dos lados (3888 y 4042 exactos), cada
tramo idéntico a lo que sumó su lado, ninguna línea faltante por multiset en ninguna dirección,
ninguna línea inventada, 81 secciones = 68 + 1 + 11 + 1, cero marcadores sobrevivientes.

**Gates.** `npx tsc --noEmit` **exit 0, cero errores** — la línea base tenía 4, todos de `.next/`
generado apuntando a `src/app/styleguide`, que no existía en `main` y volvió con el merge.
`npm run check:invariants` **19/19** (eran 17; suman `pantallas` y `turno`).

**Push** en orden de riesgo: `redesign/home` → `leados/p11-turno` → `HEAD:main`
(`8b60c176..05ae1a87`). Verificado que `origin/main`, `redesign/home`, `origin/redesign/home` y
`leados/p11-turno` tienen **0 commits** fuera de la rama reconciliada.

### Fase B — qué baches siguen vivos

Salida en [`docs/manual-usuario/BACHES-RE-VERIFICADOS.md`](manual-usuario/BACHES-RE-VERIFICADOS.md).
Build de producción aislado en el worktree, `:3006`, seeds `v1-qa-wizard-states` + `qa-manual-m5-m16`.

**Los tres bugs de datos.** Dos vivos y reproducidos, uno refutado.

- **La postergación se guarda un día antes: VIVO, dos de dos.** 25/8 → "se retoma el 24/8"; 1/9 →
  "31/8". La causa entera: `<input type="date">` manda `'2026-08-25'`, `z.coerce.date()` hace
  `new Date('2026-08-25')` y una fecha ISO sin hora **se parsea como UTC**; `formatFechaCorta` la
  formatea en huso argentino (UTC−3) y cae al día anterior. **No es sólo la etiqueta**: el instante
  guardado es 21:00 del día previo, así que el panel reactiva de verdad un día antes. La forma
  correcta ya está en el producto — el pausar de la cartera guarda fin del día local
  (`2026-08-20T02:59:59Z` = 19/8 23:59:59 AR).
- **El contador de DMs sube sin mandar nada: VIVO.** `0/10 → 1/10 → 2/10` postergando.
  `contarDmsHoy` cuenta toda `OsLeadActivity` del canal `INSTAGRAM_DM` del día sin mirar el `result`:
  cuenta registros en el canal, no mensajes enviados.
- **"Pausar en tu cartera" no hace nada: REFUTADO.** No es una acción, es un **disclosure**: abre un
  panel con atajos y campo de fecha. El commit persiste y **anuncia** ("Pausado — vuelve a tu cartera
  el 19/8"). El componente es **byte a byte idéntico** al de `4dadd274`, así que se comportaba igual
  durante la corrida — la corrida midió label/`disabled`/`aria-live`, que son las señales de un botón
  de acción, y nunca miró si se abría un panel. Residuos reales y chicos: el disclosure no tiene
  `aria-expanded`, y las tres acciones de la tarjeta comparten un `isPending`.

**El motivo del rechazo (B-A1): VIVO, con la mecánica corregida.** No se destruye — `dossier.rechazos`
**sobrevive** intacto a la reapertura. Lo que pasa es que **ninguna de las 8 pantallas lo muestra** una
vez que el lead sale de RECHAZADA. Es un arreglo de presentación, no de persistencia: mucho más barato
de lo que el reporte hacía pensar. De paso, reabrir ahora **anuncia** y aterriza en m14, no en m7.

**Los patrones, re-contados.** El 2 ("el puntero miente") quedó casi cerrado: en 26 combinaciones
lead×pantalla, "Ir a tu paso actual" apunta al paso real en todas. El 1 (acuse de recibo) bajó de 10
casos a 3 vivos verificados; **el modelo a replicar es `ActionButton` de `lead-card-actions.tsx`** —
`useTransition` que deshabilita en el acto + `toast` que escribe en la región `aria-live` — y es
justo el par de señales que le falta a "Saltar". El 3 ("el dato no viaja") sigue siendo patrón. El 6
quedó diferido casi entero por ser de celular.

**Una limitación declarada.** El panel del navegador no compone frames: sin capturas, y **la mitad
"la pantalla sigue mostrando el estado anterior" del patrón 1 queda no verificable**. El anuncio sí
es fiable — es client-side. Donde el reporte dice "no anuncia", está medido.

**Cobertura honesta.** 23 baches no-celular clasificados contra la aplicación; **22 quedan pendientes**
y están listados por ID en el reporte — no se clasificaron de memoria. El barrido de celular queda
diferido por decisión de Franco (10 baches). Las 4 herramientas sin URL siguen bloqueando lo suyo.

**El contraste (B-D10) no se difirió:** aplica en computadora y está vivo — **46 de 103** textos
visibles de `/setter` incumplen AA, el peor a **1,97:1** en 10px. Medido convirtiendo `oklch` a sRGB,
porque los tokens del sistema son oklch y un lector de contraste que sólo entiende `rgb()` no ve nada.

**El diff:** el reporte y esta entrada. Cero `src/`, cero tests, cero config.

---

## F1 — Dos bugs de datos: la fecha que se corría un día y el contador que contaba de más

**Rama:** `f1/datos-fecha-contador` (worktree propio en `C:\tmp\wt-f1-datos`) · **Base:** `05ae1a87`

### Las dos causas, confirmadas antes de tocar

Las dos venían diagnosticadas. Se reprodujeron primero, contra el camino real, y **las dos
seguían siendo la causa**:

**La fecha.** `ResultadoInputSchema` tomaba `reactivateAt` con `z.coerce.date()`, o sea
`new Date('2026-08-25')` — que por especificación es medianoche **UTC**. En AR (UTC-3) ese
instante todavía es el 24 a las 21:00. Reproducido con cinco fechas antes de tocar nada:

| elegida | guardado | mostraba | el panel lo traía |
|---|---|---|---|
| 25/08 | `2026-08-25T00:00:00Z` | 24/8 | 24/08 21:00 |
| 31/08 | `2026-08-31T00:00:00Z` | 30/8 | 30/08 21:00 |
| 01/09 | `2026-09-01T00:00:00Z` | 31/8 | 31/08 21:00 |
| 31/12 | `2026-12-31T00:00:00Z` | 30/12 | 30/12 21:00 |

No era un bug de formateo: el mismo instante gobierna `postergadoVencido` (home.ts) y el cron,
así que el lead **volvía la noche anterior**. Las dos mitades rotas por la misma raíz.

**El contador.** `contarDmsHoy` filtraba por `performedById` + `channel: INSTAGRAM_DM` y nada
más. Como `registrarResultado` deja una fila de ese canal para *todo* resultado, postergar
sumaba sin que saliera un mensaje. Medido en la DB de dev el mismo día: **contador viejo = 2,
mensajes reales = 0**.

### Qué se cambió

**Arreglo 1 — una fecha sin hora es un día del calendario, no un instante.** El helper
canónico `src/lib/dates-ar.ts` (que ya modela AR = UTC-3 fijo) suma `parseCalendarDayAR`:
toma el `YYYY-MM-DD` y construye el instante **desde los componentes del calendario**, con la
misma regla que ya usaba `startOfMonthAR` — 00:00 AR ≡ 03:00 UTC del mismo día. **No se
desplazan horas** sobre un `Date` ya mal parseado: ese es el arreglo ingenuo que corre el día
en la dirección contraria. Round-trip contra los componentes pedidos para rechazar los días
que no existen (`2026-02-31`, que `Date.UTC` normalizaría en silencio al 3 de marzo).

El schema del setter lo aplica en el borde, vía `preprocess` que **solo toca strings
date-only**. Eso lo hace idempotente, y hacía falta: el form valida y manda `parsed.data`
(ya un `Date`), y la action re-valida. Con un desplazamiento de horas la segunda pasada
habría corrido el día otra vez.

**Arreglo 2 — el contador cuenta mensajes, no registros.** El discriminador existía en el
modelo (`OsLeadActivity.result`) y **no se inventó acá**: `countFollowUps` ya define «un toque
mandado» como una fila `SIN_RESPUESTA`, y sobre ese conteo corre la cadencia. `isolation.ts`
suma `SOLO_MENSAJES_ENVIADOS` + su predicado espejo `esMensajeEnviado`, mismo patrón que
`SOLO_CONTACTOS_COMERCIALES`. Los otros resultados registran lo que hizo el prospecto
(respondió, pidió esperar, rechazó) o un evento (reunión de Cal.com): reacciones a un mensaje
que ya se contó cuando se mandó. **Cero bloqueo agregado** — sigue siendo informativo.

### Los dos invariantes, demostrados fallando

`check:invariants` sube de **19 a 21** (los dos nuevos quedan encadenados).

- `postergacion.invariant.ts` — saboteado volviendo a `z.coerce.date()`:
  `AssertionError: 2099-08-25: guardado == elegido (día AR) / + '2099-08-24' - '2099-08-25'`, exit 1.
- `contador-dms.invariant.ts` — saboteado en dos puntos. Con el `where` vacío:
  `AssertionError: el where del conteo filtra por resultado, no solo por canal / + {} - { result: 'SIN_RESPUESTA' }`, exit 1.
  Con el predicado aflojado a `result !== null`:
  `AssertionError: RESPONDIO: NO cuenta como mensaje mandado / true !== false`, exit 1.

Restaurados, los dos vuelven a verde. El de la fecha cubre 25/08, **31/08**, **01/09**,
31/12, 01/01 y el bisiesto 29/02/2028, y afirma las dos mitades por separado: lo mostrado
(mismo `formatFechaCorta` de la pantalla) y el día de reactivación (misma comparación de
`home.ts`, verificando que el interruptor da vuelta en el borde exacto y no un día antes).

### Verificación en la aplicación

Prod-QA propio (build aislado en `.next-f1`, puerto 3013) para no tocar el `:3003` de otra
sesión. **Sin capturas: el panel del navegador no compone frames** (el mismo instrumento roto
que ya está anotado en la corrida de experiencia) — se afirma por navegación real y lectura
del DOM.

| qué se hizo | qué mostró | correcto |
|---|---|---|
| Abrir `m5` de «QA-M5 Toque» (dato viejo, `…25T00:00:00Z`) | "se retoma el **24/8**" | ✅ *(es el bug: evidencia del dato pre-arreglo)* |
| Postergar al **25/08** | "se retoma el **25/8**" | ✅ |
| Contador tras postergar | **0 / 10 DMs** (no se movió) | ✅ |
| Postergar al **31/08** (fin de mes) | "se retoma el **31/8**" | ✅ |
| Contador tras la 2ª postergación | **0 / 10 DMs** | ✅ |
| Registrar «No respondió — mandé un toque» | **1 / 10 DMs** | ✅ |

El instante que quedó guardado en la postergación nueva es `2026-08-31T03:00:00.000Z` → el
panel lo trae el **31/08 a las 00:00 AR**, el arranque del día elegido.

### Las postergaciones ya guardadas: qué les pasa

**El arreglo NO cambia cómo se interpreta un dato guardado.** Un `reactivateAt` sigue siendo
un instante y se lee igual que antes: **ningún lead se reactiva un día distinto del que venía**.
Lo que cambia es cómo se *escribe* una postergación nueva.

Censo en Neon dev al abrir el sprint: **6 leads** con `reactivateAt`, todos POSTERGADO. De
esos, **2 con la marca del bug** (medianoche UTC exacta: «QA-M5 Toque» y «QA-M5 Agotada»,
ambos fixtures de QA) y 4 con hora real, cargados desde admin (`Date.now() + N días`) y por
lo tanto nunca afectados. Los 2 con la marca siguen mostrando —y trayendo— el día anterior
**hasta que se los vuelva a postergar**; uno de ellos se re-posterguió durante la verificación
y quedó anclado, así que **queda 1**. **No se migró nada.** El número es de la DB de dev: en
producción hay que volver a contarlo.

### Fuera de scope, anotado y no tocado

- **El admin no tiene este bug.** `updateLeadStatus` recibe `new Date(Date.now() + N días)`
  —un instante real— desde `change-status-select` y `lead-pipeline`; su `type="date"` es solo
  para filtros de rango. `optionalReactivateAtSchema` usa `z.coerce.date()`, o sea la trampa
  sigue armada si alguien le enchufa un date-picker: si eso pasa, `parseCalendarDayAR` ya está.
- `limitesDelDiaArgentino` (outreach.ts) duplica lo que `dayRangeAR` ya hace, y usa `lte
  23:59:59.999` donde `dates-ar` usa rango semiabierto. Funciona; es consolidación, no bug.
- `check:invariant:dates-ar` **existe pero no estaba encadenado** en `check:invariants` — otra
  cara de «dos listas que divergieron». No se agregó: no es de este sprint.
- Lo declarado fuera por el encargo (motivo del rechazo que no se muestra, contraste de texto,
  acuse de recibo, lo diferido de celular): sin tocar.

### Gates

| gate | resultado | exit |
|---|---|---|
| `npx tsc --noEmit` | 0 errores | **0** |
| `npm run check:invariants` | **21/21** (sube de 19: los dos nuevos) | **0** |
| `npm run test:leados` | **25/25** | **0** |
| `npm run test:setter` | **60/60** (aislada: `.next-f1` + puerto 3013, sin tocar el `:3003` ajeno) | **0** |

`git diff --stat`: 5 archivos tocados + 2 invariantes nuevos. **Cero gates, cero transiciones,
cero aislamiento entre setters, cero schema, cero migraciones.** El único archivo del write-path
que se tocó es el schema de entrada, y el cambio es cómo se lee la fecha — las transiciones de
`registrarResultado` y `postergarLead` quedaron intactas. Nada pusheado.

**Fixtures movidos** (Neon dev, por la verificación en la app): «QA-M5 Toque» quedó POSTERGADO
al **31/08** con `2026-08-31T03:00:00.000Z` (anclado, ya sin la marca del bug) y con dos
postergaciones más en su historial. «M0-GAL 09-m5-toque-vencido» sumó un toque: quedó en
2 de 3 de cadencia. «QA-M5 Agotada» **no se tocó a propósito** — es la muestra viva del dato
pre-arreglo (sigue mostrando 31/8 cuando dice 01/09).

**Worktree conservado** en `C:\tmp\wt-f1-datos` (rama `f1/datos-fecha-contador`) para que
Franco levante el preview. Al desarmarlo: sacar primero la junction de `node_modules` con
`cmd /c rmdir`, o `git worktree remove` sigue el enlace y borra el `node_modules` real.

---

## F2 — El pedido de Franco acompaña la corrección (2026-08-12)

**Encargo.** Que el setter tenga a la vista qué le pidió corregir Franco, en las pantallas
donde va a corregirlo. El dato ya estaba guardado y sobrevivía: había que mostrarlo.

### El terreno (lo que el descubrimiento encontró antes de tocar nada)

**Qué se guarda.** `OsLeadDossier.rechazos` es un **array** (`RechazosSchema`), no un campo:
guarda **todas** las vueltas. Cada entrada tiene cinco campos — `fecha` (la estampa el motor),
`motivo` (obligatorio, ≤280), `donde` (sección/elemento, ≤280), `arreglo` (≤2000) y `detalle`
(texto libre **pre-B5**: el formulario del admin ya no lo captura y **ninguna** superficie del
setter lo mostraba). Lo escribe SOLO `transitionDossier` en EN_REVISION→RECHAZADA, appendeando
al final. Nadie lo borra: el re-loop resetea `selfCheckJson` y nada más.

**Quién lo mostraba.** Tres superficies, todas atadas al stage RECHAZADA: la card del panel
(`home-sections.tsx`), la pantalla `mr` del manual (`GuiaRetrabajo`, gate
`pantalla.tipo === 'reentrada'`) y el `RechazosPanel` del admin. **El hallazgo, confirmado:** al
reabrir la construcción el stage pasa a CONSTRUCCION, `mr` deja de ser alcanzable y el gate del
home deja de aplicar → **el pedido desaparecía de todas las superficies del setter justo cuando
empezaba a corregir**. El dato seguía intacto en la DB.

**El recorrido de la corrección.** `mr` → [Reabrir construcción] → `mc1` → `mc2` → `m13` →
`m14` → revisión. Esas cinco pantallas son la lista.

### Qué se hizo

El **mismo** `GuiaRetrabajo` (una sola fuente de la nota, no un Callout por pantalla) al frente
de las cinco pantallas del retrabajo, en el slot `encabezado` que `mr` ya usaba — mismo
tratamiento visual, ninguna pantalla rediseñada. En `mc1`/`mc2` va arriba del banner de urgencia;
en `m14` queda pegado al chequeo, que es donde hay que verificar contra el pedido antes de
reenviar.

**El gate es exacto, no aproximado:** hay rechazo **y** el stage es RECHAZADA o CONSTRUCCION.
`rechazos` solo se appendea en EN_REVISION→RECHAZADA y el único camino de vuelta a CONSTRUCCION
es el re-loop (`LEGAL_TRANSITIONS`), así que esa condición equivale a «hay una corrección en
curso». Sin rechazo el bloque **no existe** — ni vacío ni de relleno; en `revision`/`m15`/`m16`
tampoco, porque ahí la corrección ya pasó.

**La promesa que se cerró (C-19 de la auditoría de cierre).** `mr` decía «el historial de
rechazos se conserva» y el setter no lo veía por ningún lado. Ahora las vueltas anteriores van
**dentro del mismo bloque**, plegadas y **anunciadas con su cuenta** («Lo que te pidió en las
vueltas anteriores (N)», con la fecha de cada una); lo que importa —el último pedido— nunca se
pliega. Y el texto de `mr` dejó de prometer un archivo invisible: ahora dice que el pedido lo
sigue en cada pantalla. Sin vueltas anteriores, el plegado no se renderiza.

De paso, el bloque muestra `detalle` cuando existe: es dato guardado del pedido que el setter
no podía leer en ninguna pantalla (el lead sembrado «Studio Yoga Balance» lo tiene).

### El salto al lugar correcto: DESCARTADO, con su razón

`donde` es **texto libre** de hasta 280 caracteres («Hero, título principal», «Sección hero y
fondo general»). No hay enum, ni lista cerrada, ni relación con `FASE_IDS`/`PANTALLA_DE_FASE`,
y un «Hero» no distingue estructura (`mc1`) de calidad/mobile (`mc2`). No es mapeable de forma
confiable y un salto al lugar equivocado es peor que ninguno: **comportamiento actual intacto**.
Si algún día el rechazo se estructura (un select de sección en el panel del admin), el mapeo
pasa a ser trivial — es el prerequisito, no el trabajo.

### Verificación en la aplicación

Lead sembrado con **dos** vueltas de rechazo, recorrido completo contra el prod-QA propio
(`.next-setter` + puerto 3013, sin tocar el `:3003` ajeno). Navegación real + lectura del DOM,
afirmado por CONTENIDO (las redirecciones viajan en el payload de streaming) + capturas de las
cinco pantallas.

| pantalla | ¿se ve el motivo? | ¿se entiende qué corregir? |
|---|---|---|
| `mr` aterrizaje (RECHAZADA) | sí — qué / dónde / arreglo + «vueltas anteriores (1)» | sí |
| `mc1` construir (tras reabrir) | **sí** — antes desaparecía acá | sí |
| `mc2` refinar | **sí** | sí |
| `m13` borrador | **sí** | sí |
| `m14` chequeo final | **sí**, pegado al link del borrador y al brief | sí, se verifica contra el pedido |
| las mismas cinco, lead sin rechazo | no existe el bloque (0 nodos) | — |

### Fuera de scope, anotado y no tocado

- **El rechazo y la reapertura NO quedan como movimientos.** `HistorialDelLead` lee solo
  `OsLeadActivity`, y ni `rechazarRevision` ni `reabrirConstruccion` escriben actividad — por eso
  un lead rechazado sin toques dice «sin movimientos». Registrarlos exige escribir datos nuevos:
  no es de este sprint.
- El acuse de recibo (F3), el contraste de texto, que un rechazo no aparezca en el panel de
  inicio, y lo diferido de celular: sin tocar.

### Gates

| gate | resultado | exit |
|---|---|---|
| `npx tsc --noEmit` | 0 errores | **0** |
| `npm run check:invariants` | **21/21** (sin cambios respecto de F1) | **0** |
| `npm run test:leados` | **25/25** | **0** |
| `npm run test:setter` | **62/62** (sube de 60: los dos casos de F2) | **0** |

`git diff --stat`: 4 archivos tocados + 1 spec nueva. **Cero gates, cero transiciones, cero
aislamiento entre setters, cero schema, cero migraciones.** Nada pusheado.

**Queda para Franco (criterio de producto).** Un bloque de contexto permanente en una pantalla
de trabajo puede volverse ruido: el equilibrio entre «lo tengo a la vista» y «no me estorba»
lo cierra él en el preview. Si estorba, la variante barata es comprimirlo fuera de `mr`
(solo el «qué», con el resto plegado) sin tocar nada más.

**Worktree** en `C:\tmp\wt-f2-motivo` (rama `f2/motivo-rechazo`, sobre F1). Al desarmarlo:
sacar primero la junction de `node_modules` con `cmd /c rmdir`, o `git worktree remove` sigue
el enlace y borra el `node_modules` real.

---

## Sprint A2-S1 — /setter deja de ser embebible — 2026-08-15

**El agujero.** La auditoría A2 lo encontró en `next.config.ts`: `X-Frame-Options: DENY` se aplicaba
sobre `source: '/(admin|dashboard)(.*)'`. `/setter` quedaba afuera. La CSP global sí trae
`frame-ancestors 'none'`, pero viaja en `Content-Security-Policy-**Report-Only**` — un header que el
navegador **reporta y no aplica**. Neto: las seis pantallas donde un setter carga prospectos y opera
leads (`/setter`, `/setter/leads`, `/setter/leads/[leadId]`, `.../manual/[paso]`, `/setter/nuevo`,
`/setter/nuevo/importar`) se podían montar en un iframe de un sitio ajeno. Superficie de clickjacking
sobre acciones autenticadas.

**Qué se cambió.** Dos bloques en `headers()`, nada más:

1. `source: '/(admin|dashboard)(.*)'` → `'/(admin|dashboard|setter)(.*)'`. Un término en la
   alternancia. `/admin` y `/dashboard` reciben exactamente los mismos headers que antes.
2. Bloque nuevo `source: '/setter(.*)'` con `Content-Security-Policy: frame-ancestors 'none'`.

**Por qué la CSP va en bloque aparte y no en el compartido.** Sumarla al bloque de arriba le
estrenaría una CSP en modo **enforce** a `/admin` y `/dashboard`, que hoy sólo reciben la global en
Report-Only — un cambio de comportamiento fuera del objetivo del sprint, y la clase de cambio que
rompe en producción y no en dev. Aislada en `/setter(.*)`, el radio de impacto es el que se quiso
tocar. Una CSP con una sola directiva **sólo restringe esa directiva**: `frame-ancestors` no cae por
`default-src`, así que el resto del contenido de `/setter` no queda sujeto a ninguna política nueva.
Se suma a `X-Frame-Options` en vez de reemplazarlo porque XFO es el header legacy y `frame-ancestors`
el mecanismo vigente — con anidamiento de varios niveles, los navegadores modernos hacen caso al
segundo.

**Lo que NO se tocó**, por regla del sprint: la CSP global sigue en `Report-Only` (sacarla de ahí es
otra decisión, con riesgo real sobre el widget embebible), `middleware`/`proxy.ts` intacto, headers de
`/admin` y `/dashboard` intactos.

**El widget sigue embebible — probado, no asumido.** `/embed/[slug]` es la única ruta bajo
`src/app/embed/`, y ni `/(admin|dashboard|setter)(.*)` ni `/setter(.*)` pueden alcanzar un path que
arranca con `/embed`. Confirmado además contra el server, no sólo por lectura.

**Evidencia — `next dev` en `:3000`.**

```
$ curl -I http://localhost:3000/setter
HTTP/1.1 307 Temporary Redirect
...
Content-Security-Policy-Report-Only: default-src 'self'; ...; frame-ancestors 'none'; ...
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
location: /login?callbackUrl=%2Fsetter
```

Barrido del resto (sólo las líneas de framing):

```
/setter/leads            X-Frame-Options: DENY   +  Content-Security-Policy: frame-ancestors 'none'
/setter/nuevo/importar   X-Frame-Options: DENY   +  Content-Security-Policy: frame-ancestors 'none'
/embed/test-slug         Content-Security-Policy: frame-ancestors *;      (sin X-Frame-Options)
/embed/demo              Content-Security-Policy: frame-ancestors *;      (sin X-Frame-Options)
/admin                   X-Frame-Options: DENY    (sin CSP enforce — igual que antes)
/dashboard               X-Frame-Options: DENY    (sin CSP enforce — igual que antes)
```

Las dos rutas de `/embed` salen con `frame-ancestors *` y **sin** `X-Frame-Options`: la regla nueva no
las alcanza. `/admin` y `/dashboard` salen sin CSP en enforce: el bloque compartido no cambió lo que
entregan.

**Gate.** `npx tsc --noEmit` **exit 0**.

**El diff:** `next.config.ts` y esta entrada. Cero `src/`, cero tests, cero middleware.

**Queda para verificación humana.** Confirmar en el deploy de Netlify que los dos headers se sirven en
producción sobre `/setter`. Los headers de `next.config.ts` los aplica el plugin de Netlify, no Next
directamente — que anden en `next dev` **no prueba** que anden en prod. No se da por bueno hasta verlo
con un `curl -I` contra el dominio real.

---

## Verificación de arranque OSLead VII — qué hay realmente en el código hoy — 2026-08-18

Read-only. Cero `src/`, cero tests, cero configuración. Salida en
[`docs/verificacion-arranque-oslead-vii.md`](verificacion-arranque-oslead-vii.md).

**Por qué existió.** El handoff decía qué se hizo, no cómo estaba el código. En este repo la
documentación de estado ya mintió dos veces. Se verificó antes de planificar nada.

**Fase 0 — el criterio de frenada se disparó.** El working tree tenía cambios sin commitear ajenos,
incluido un archivo de **configuración**. No había servidor contra este checkout (el único listener,
`:3000`, es de `RG-CRM`, otro proyecto). Se montaron dos worktrees propios fuera del repo —
`C:/tmp/wt-verif-vii` (F1+F2+F3) y `C:/tmp/wt-verif-main` (`05ae1a87`) — con `node_modules` por
junction, build propio y puerto **3013**. No se tocó nada ajeno: ni stashes, ni worktrees, ni procesos.

### Lo que dio verde

**Las cuatro suites, exit 0 las cuatro**, sobre F1+F2+F3: `npx tsc --noEmit` **0 líneas** ·
`check:invariants` **22/22** · `test:leados` **25/25** · `test:setter` **62/62** (62, no 60: F2 sumó
`14-motivo-rechazo.spec.ts`). Sobre `main` por separado: `tsc` exit 0 y `check:invariants` **19/19**.

**Los fixtures del wizard están sanos.** `QA-W Rechazada` sigue en `stage=RECHAZADA` con su rechazo
íntegro (`motivo`/`donde`/`arreglo`/`detalle`), sin tocar desde el 12/8: **la pantalla de reentrada
reproduce**. El barrido A no lo dejó en CONSTRUCCIÓN.

### Lo que dio rojo

**El trabajo no está íntegro ni en un solo lugar, y el handoff se equivoca dos veces.** No hay
«F0–F4»: hay **dos** commits F. `F1` (`34e15156`) y `F2` (`2d456390`) están **sin pushear**
(`git branch -r --contains` vacío para los dos, y `merge-base --is-ancestor` da NO contra `main` y
contra `origin/main`). **F3 nunca llegó a commit** — `f3/acuse-recibo` apunta al commit de F2 y su
trabajo vive sin commitear en `C:/tmp/wt-f3-acuse`. **F4 no existe.** Y en el checkout principal
quedaron sin commitear el reporte de F0, su entrada de bitácora y **un fix de seguridad**.

**Los 22 invariantes existen, pero en un árbol que no está en ningún commit.** `main` tiene **19**;
F1 suma `postergacion` y `contador-dms` (21); el 22 es `acuse`, y **está sin commitear**. No faltan
tres: **nunca llegaron** — no hay commit donde buscarlos borrados.

**`/setter` es hoy embebible en un iframe ajeno.** En `main`, `next.config.ts:85` cubre solo
`admin|dashboard`, y la CSP global es **Report-Only**, así que su `frame-ancestors` no aplica. El fix
ya está escrito… sin commitear.

**`tsx` no es dependencia declarada del repo** (ni en `package.json`, ni en el lock, ni en
`node_modules/`). Resuelve por un binario global de esta máquina, y de él dependen ~60 invariantes,
`prisma db seed` y todos los seeds QA — incluidos los tres nuevos.

### El censo, que cierra exacto

**15 pasos sobre 6 rutas.** Contra `probe-poda-terreno.md` §10 R9 (20 pasos, del 31/7): **7 censadas
ya no existen** (`m3`, `m7`–`m12`), **2 existen sin censar** (`mc1`, `mc2`), **13 coinciden** — y de
esas 13, **3 cambiaron encabezado** (`m2`, `m6`, `m14`). 20 − 7 + 2 = 15.

Dos correcciones al estado que se daba por conocido: **`m3` no cambió, desapareció**; y **«m5 cambió»
queda refutado** — su bloque en `PANTALLAS` es byte-idéntico al commit fundacional, lo que cambió fue
su componente. Trampa registrada: los títulos de `espera` y `revision` en `PANTALLAS` son **código
muerto en pantalla** (esas rutas pintan `TEXTO_TURNO[turno]`), así que auditar su copy contra el
registro da un resultado falso.

### Galería y manual: el que los desactualiza no es ninguna F

**50 capturas y 13 capítulos** (contados, los dos números del encargo son exactos). **12 capturas
desfasadas confirmadas + 3 por inferencia; 9 capítulos de 14.** La causa es **P11 (`513f38b4`), que
SÍ está en `main`** y reescribió el vocabulario de las tres esperas. Y **regenerar hoy no alcanza:**
P11 actualizó el spec de captura pero no el catálogo de textos del índice, que sigue diciendo frases
que P11 borró del producto. De paso: `35-home-foco.png` y `36-home-cartera.png` son **byte-idénticos**
(md5 verificado) — la cartera nunca se fotografió, y el índice declara «0 huecos».

### Los 22 baches: 0 muertos, 19 por lectura, 3 para manejar

El triage pasó por **una segunda pasada adversarial** que intentó refutar la primera. Cambió 4
dictámenes de 22 — sin ella este reporte habría dicho «0 exige manejar la app», que es falso.

**La expectativa no se cumplió: ningún bache murió con la poda.** Las pantallas murieron, pero los
controles **migraron** y el defecto viajó con ellos. El caso testigo es `B-A5`: se reportó «en m7»,
`m7` no existe, y sin embargo el control **no cambió de archivo** — `m-construccion.tsx` se
re-parametrizó de `m7…m12` a `mc1/mc2` y la cadena rota sigue ahí. **Poda de pantalla ≠ muerte de
bache.**

Los **3 que exigen manejar la app** (`B-B11`, `B-C3/C4/C5`, `B-C8`) comparten un patrón que conviene
recordar: **el código fuente dice una cosa y la corrida midió la contraria, en el mismo commit**. El
`aria-label` de `B-C8` ya estaba cuando la corrida reportó el bug; el listbox de `B-C4` se enfoca con
un `requestAnimationFrame` en una línea byte-idéntica a la medida. Ninguna lectura arbitra eso.

Un dictamen corregido por la refutación: **`B-P9`** tiene la mitad que le da nombre (el «hace hace»)
**ya arreglada en `main`** por `c2160792`, anterior a la corrida. Dictaminarlo «VIVO» sin matizar
mandaba a arreglar un string que ya no existe.

### El entorno no está listo para que un humano verifique lo perceptual

Las **4 URLs de herramientas siguen en `null`** y **no hay pantalla que las cargue**: no viven en
Prisma, viven hardcodeadas en `herramientas.ts` — el único camino es editar el `.ts` y redeployar.
**Cal.com está NULL en las 16 organizaciones**, incluida `develop`, y **nadie escribe esos campos en
todo el código** (cero writes, barrido repo-wide); `m16` no bloquea, falla recién al hacer clic. Y el
**panel de novedades del setter tiene 80 avisos sin leer, de los cuales 77 son huérfanos** — su lead
fue borrado. Es 96% residuo de corridas de test.

**Contaminación propia, declarada.** Correr las suites era parte del encargo y toca la base. Se
censó **antes** y se midió el delta: **0 leads creados, 0 usuarios creados, 0 fixtures alterados, 1
novedad huérfana** (`2026-08-18T04:55:04Z`). El censo previo daba 79 novedades; el posterior, 80. Esa
diferencia es de esta corrida. **No se re-seedeó nada.**

**Cierre.** El único diff versionado son el reporte y esta entrada. Cero `src/`, cero tests, cero
configuración. Sin push. Los dos worktrees propios quedan declarados en el reporte; el WIP ajeno del
checkout —bitácora de F0, `next.config.ts`, los 3 docs de auditoría y `BACHES-RE-VERIFICADOS.md`— se
dejó **intacto y sin commitear**.

---

## F3 · Que toda acción que escribe acuse recibo donde el setter hizo el clic

**Rama** `f3/acuse-recibo`, sobre F2 (`2d456390`). **Sin pushear.**

### El censo, que dio vuelta el sprint

El sprint venía a extender el patrón "a donde falta". El censo dice que ya casi no falta:
**24 acciones de escritura, 29 call-sites, 18 componentes** — y **una sola** fuera del patrón.

| Clase | Cuántas | Cuáles |
|---|---|---|
| YA LO USA | 28 call-sites | todo el resto |
| **NO AVISA** | **1** | **«Saltar»** del foco (`foco-surface.tsx`) |
| AVISA DISTINTO | 0 | — |
| **CONTRADICE** | **0** | la clase quedó vacía — ver abajo |

El patrón de referencia no es sólo `lead-card-actions` (que es la versión a mano): está
**abstraído** en `src/lib/use-step-action.ts`. Dos señales — `useTransition()` apaga el control
en el acto, y `toast` escribe en la región `aria-live="polite"` que monta el `Toaster` de sonner
en el root layout. `<AutosaveStatus>` (`role="status"`) es la misma pareja para la escritura
continua, no un segundo patrón.

### CONTRADICE quedó vacía, y está medido

La corrida de experiencia levantó B-P3 —«el aviso confirma y la pantalla sigue mostrando la
instrucción anterior», cinco veces— y la re-verificación no pudo cerrarlo: el panel no componía
frames. Se midió ahora en la app, **sin recargar**, sobre las pantallas que B-P3 nombró:

| Pantalla | Lo que decía la corrida | Medición |
|---|---|---|
| m5 · registrar toque | seguía `Toques: 1 de 3` | anunció **y** pasó a `Toques: 2 de 3` |
| m4 · registrar opener | seguía «TU PASO AHORA — Mandá el opener» | anunció **y** el badge pasó a **«Completada»** |
| mc1 · arrancar construcción | seguía «Primero arrancá la construcción» | anunció **y** ese texto **desapareció** |

**B-P3 está refutado en el código actual.** Lo cerraron P5-B / P6-B / P7 sin que quedara
registrado. Y de paso: `router.refresh()` **sí** funciona en la sub-ruta del manual, aunque
ninguna action revalide `/setter/leads/[leadId]/manual/[paso]`.

### Lo único que se tocó

`foco-surface.tsx` — «Saltar» suma su `toast.success`. Era la única acción que escribe y no
acusaba, y el contraste estaba **en la misma tarjeta**: «Pausar», al lado, sí anuncia. Sus
hermanas mudas («Ir a trabajarlo», «Abrir») no lo necesitan — navegan, y la pantalla entera
cambia. «Saltar» se queda donde está y sólo cambia el nombre adentro de la tarjeta.

No se migraron los 10 componentes que implementan el patrón a mano. Producen señales
**idénticas** para el setter; migrarlos era refactor sin cambio de experiencia, con riesgo de
tocar comportamiento (`escalar-modal` refresca ANTES del toast, `importar` usa `toast.message`).

### La red — `check:invariant:acuse` (invariantes 21 → 22)

`src/lib/leados/acuse-recibo.invariant.ts`. Lee los exports de `_actions/*.actions.ts` (no una
lista a mano) y exige las dos señales en **cada call-site**, dentro de su propio bloque de
transición.

**Por qué por call-site y no por archivo — el dato del sprint.** La primera versión medía por
archivo y pasó **en verde** con el acuse de «Saltar» removido: `foco-surface` está lleno de
toasts. Segunda causa, más fina: contar `toast.error` como acuse también daba verde — el error
es el aviso del **fallo**, no el acuse de que la escritura quedó. Con las dos correcciones:

```
AssertionError: _components/foco-surface.tsx::anclarFoco escribe y NO acusa recibo:
en su bloque no hay toast/successToast ni router.push.
```

Distingue los **dos** call-sites de `anclarFoco` en el mismo archivo: `irATrabajar` navega y
pasa; `saltar` sin toast se cae. Restaurado → verde.

### Gates

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run check:invariants` | **22/22** (era 21 — sube por el invariante nuevo) |
| `npm run test:leados` | 25/25 |
| `npm run test:setter` | 62/62 — `:3003` estaba ocupado por otra sesión: puerto propio `:3013` con `SETTER_EXTERNAL_SERVER=1` + `SETTER_PORT`, sin matar nada ajeno |

### Notas de terreno

**El caso del duplicado (B-B2) ya estaba resuelto** — `seguimiento-form` usa `useStepAction`.
Verificado igual, sin recargar: anuncio ✓, chip `Prospecto`→`Postergado` ✓, historial
`1`→`2 movimiento` ✓, y en la base **`POSTERGADO count = 1`**. El duplicado no puede volver a
pasar por el motivo que lo causó.

**Quedan en la base dos leads de sondeo** — `F3-PROBE Opener` y `F3-PROBE Brief`, creados para
medir m4/mc1/m13. No se borran: la regla del sprint era cero operaciones destructivas sobre la
base. Se pueden borrar cuando convenga.

**Worktree** en `C:\tmp\wt-f3-acuse` (rama `f3/acuse-recibo`). Al desarmarlo: sacar primero la
junction de `node_modules` con `cmd /c rmdir`, o `git worktree remove` sigue el enlace y borra
el `node_modules` real.

---

## Integración — el carril F entra sobre `origin/main`, en una rama propia — 2026-08-20

**Rama:** `leados/v1-integracion` (worktree propio en `C:\tmp\wt-v1-integracion`)
**Base:** `origin/main` = `17727117` · **Entra:** `f3/acuse-recibo` = `fc9ea865` (F1 + F2 + F3)
**Merge-base:** `05ae1a87` · **Resultado del merge:** `7e18f9a7`

### Por qué la rama nace de main y no de f3

El trabajo de los tres sprints F vivía 8 commits atrás de `origin/main`, y cada sprint
apilado encima encarecía la reconciliación. La rama se creó **desde `origin/main`** y el
carril F entró como merge: así la base es lo pusheado y compartido, y main no queda en la
historia como el que se sumó tarde. `main` no se tocó y no se pusheó a `main`.

### El merge

Exactamente lo que predijo el diagnóstico: **un solo conflicto**, en este archivo.
`package.json` auto-mergeó. **Cero conflictos en `src/`, cero en `tests/`** — los 8 commits
de main (carril chatbot/home + auditorías + verificación VII) y los 3 del carril F no
comparten un solo archivo de código.

### La resolución de la bitácora, verificada mecánicamente

Los dos lados resultaron **appends puros** sobre la base (main sumó 271 líneas, f3 sumó 338),
cada uno formado por bloques `[separador + entrada]`. La resolución es **concatenación
cronológica por fecha de entrada**, conservando los dos lados enteros:

`F0 (08-12)` → `F1 (08-12)` → `F2 (08-12)` → `A2-S1 (08-15)` → `VII (08-18 02:21)` → `F3 (08-18 15:28)`

Ningún lado se eligió, nada se resumió, ninguna línea se borró. Los ocho chequeos, contra
`git show :1: / :2: / :3:`:

| # | Chequeo | Resultado |
|---|---|---|
| 1 | Conteo de líneas = base + lado A + lado B | 4042 + 271 + 338 = **4651** = resultado — OK |
| 2 | El tramo común es idéntico a la base | `diff` contra `:1:` vacío — OK |
| 3 | Cada tramo nuevo es idéntico a lo que sumó su lado | lado A 271 líneas y lado B 338, `diff` vacío en ambos — OK |
| 4 | Ninguna línea de `origin/main` falta | multiset: 0 líneas deficitarias, 0 ocurrencias faltantes — OK |
| 5 | Ninguna línea de `f3` falta | multiset: 0 deficitarias, 0 faltantes — OK |
| 6 | No aparecen líneas que no estén en ningún lado | multiset inverso: 0 sobrantes — OK |
| 7 | Conteo de secciones de segundo nivel = suma de las tres | 81 + 3 + 3 = **87** = resultado — OK |
| 8 | Marcadores de conflicto sobrevivientes | **0** en el archivo y 0 en todo el árbol — OK |

El blob efectivamente indexado se re-verificó contra la resolución antes de commitear
(4651 líneas, 0 marcadores).

### Las cuatro suites, secuenciales, sobre el árbol integrado

| Suite | Exit code | Resultado | Referencia |
|---|---|---|---|
| `npx tsc --noEmit` | **0** | 0 líneas de salida | esperado 0 / 0 |
| `npm run check:invariants` | **0** | **22 verdes** | main tenía 19; F1 sumó postergación y contador-dms, F3 sumó acuse |
| `npm run test:leados` | **0** | **25 passed** (43.5s) | esperado 25 |
| `npm run test:setter` | **0** | **62 passed** (4.7m) | eran 60 antes de F2, que sumó dos |

Los 22 invariantes por nombre: assignment-trail, setter-meta, escalamiento, novedades,
mis-numeros, timeline, foco, particion, flow, alta-propia, prospecto-import, gate-envio,
self-check, progreso, reloop-selfcheck, manual, pantallas, turno, **postergacion**,
**contador-dms**, **acuse**, security.

El type-check se confirmó no vacío: 1.466 archivos del worktree integrado, incluidos los
tres invariantes nuevos y `src/lib/dates-ar.ts`. El merge **no tocó** `prisma/schema.prisma`,
así que no hizo falta regenerar el cliente. El build de producción (con directorio de build
aislado) cerró verde antes de la suite del panel.

### Que no se perdió nada

`git log --oneline origin/main ^HEAD` y `git log --oneline f3/acuse-recibo ^HEAD` dan **los
dos vacíos**. El diff `origin/main → HEAD` en `src/` es exactamente el aporte de F1/F2/F3
(12 archivos, 866 inserciones); el diff `f3 → HEAD` en `src/` es exactamente el aporte de
main (51 archivos, carril chatbot/home). Sin solapamiento.

El fix de clickjacking de `next.config.ts` **está presente** en la rama integrada y es
byte-idéntico al de main (el diff `origin/main → HEAD` sobre ese archivo es vacío): viene de
`17727117` y suma el bloque de `/setter` con su header de política de encuadre.

### Lo que este sprint NO hizo

No se pusheó a `main` ni a `origin/main` — solo la rama `leados/v1-integracion`. No se
rebaseó, no hubo `--force` ni `reset --hard`. `f1/datos-fecha-contador`, `f2/motivo-rechazo`
y `f3/acuse-recibo` quedan congeladas como registro histórico. Los 2 stashes y los 11
worktrees ajenos quedaron intactos; ningún proceso ajeno se mató. Ninguna migración, seed ni
`db push`. Ninguna dependencia agregada o quitada — `tsx` sigue sin estar declarado como
dependencia (es B1, se anota y no se toca acá).

**Queda para Franco:** si `leados/v1-integracion` pasa a ser `main`, y cuándo. Y mirar el fix
de clickjacking de `next.config.ts`, que es un cambio de comportamiento de producción que
todavía no revisó.

---

## Corrida de experiencia — las primeras 47 capturas del panel del setter — 2026-08-20

**Rama:** `leados/v1-integracion` (worktree `C:\tmp\wt-v1-integracion`)
**Base:** `cbfaa27f` · **Puerto:** `127.0.0.1:3021` · **distDir:** `.next-corrida-visual`
**Salida:** `docs/diagnostico-visual-2026-08/` — PNG gitignorados (patrón de la galería),
`MANIFIESTO.md` + `REPORTE.md` commiteados.

Hasta hoy no había una sola captura del producto: las dos corridas anteriores frenaron
porque el panel del navegador no compone frames, y la galería del 10/08 tiene 12 fotos
desfasadas de 50 con dos archivos byte-idénticos. Todo lo que se sabía del panel se sabía
por descripciones. Esta corrida cierra ese hueco con navegador real.

### La matriz se midió, no se adivinó

En vez de mapear 78 leads a ojo, se importó la **`derivarPantalla` real** y se corrió sobre
la cartera entera replicando el ensamblado de `cargarManualDelLead`. Corrigió tres cosas que
un mapeo a mano habría errado: `QA-W Construccion` tiene `progresoJson` en `null` (su
pantalla es `mc1`, no `m14`); ningún fixture es `PERDIDO`, que es la única puerta a
`archivo`; y los dos leads postergados caen en `m4`, no en `m5`, porque no tienen contactos.

### La trampa del fold

El shell es `fixed inset-0` con el scroller en el `<main>` interno. **No se usó `fullPage`
en ninguna toma**: se mide el alto real del `<main>` y se agranda el *viewport* a ese alto.
Las dimensiones se leen del IHDR del PNG. Alturas reales de 788 px a 10.085 px — con
`fullPage` las 47 habrían salido de 900.

### Lo que quedó medido

El error de `m13` que ve el setter es literal `Invalid literal value, expected true` — Zod
crudo, en inglés — y se verificó que el guardado **no persiste nada**. `espera` y `revision`
muestran el **mismo** encabezado («Le toca a Franco»), porque salen por `EstadoManual` con
`TEXTO_TURNO[turno]` y los títulos de `PANTALLAS` son código muerto en pantalla. Y el patrón
«la pantalla no acompaña al dato», que la re-verificación había declarado NO VERIFICABLE,
quedó capturado dos veces: registrar el opener mueve `actividades 0→1` y la pantalla sigue
diciendo «Mandá el opener»; enviar a revisión mueve `CONSTRUCCION→EN_REVISION` y la pantalla
sigue diciendo «Chequeá la demo antes de mandarla».

### Los huecos, con causa

Las 15 pantallas tienen captura, pero **cuatro estados sólo se alcanzaron con leads
pre-existentes** (`archivo`, `m14` gate cerrado, `m13` virgen, `m16` con horarios): los 17
fixtures no los producen, y sembrar otros habría roto la Regla 13. Dos ítems obligatorios
quedaron sin foto: `m5` postergado (exige un postergado con contactos > 0 — el único era
`F3-PROBE Opener`, que el Paso 1 ordenaba borrar) y «el panel sin nada para trabajar» (exige
un setter con cero leads, o sea crear un fixture).

**Y una consecuencia que hay que mirar:** limpiar las novedades huérfanas era parte del
Paso 1 y se hizo, pero esas 78 eran el **96%** del bloque (81 → 3). El bloque de novedades
quedó retratado con 3 items, así que la observación «ocupa más pantalla que el foco, la
cartera y los números juntos» **no se puede re-verificar contra estas fotos**.

### Lo que este sprint NO hizo

Cero cambios en `src/`, `tests/` y configuración — el diff son tres archivos nuevos bajo
`docs/` más esta entrada. No se pusheó a `main`. No se instaló nada: `tsx` **no está** en
`node_modules` ni declarado (la Regla 9 asumía que sí), y todo corrió con `npx --offline tsx`
desde la caché ya presente — en una máquina sin esa caché los seeds del Paso 1 no arrancan.
Ninguna migración ni `db push`. La base quedó restaurada a la línea base del Paso 1,
verificada por censo idéntico. Los worktrees y stashes ajenos, intactos; ningún proceso
ajeno se mató.

**Queda para Franco:** todo el juicio visual — jerarquía, densidad, aglomeración y copy. Y
rotar la credencial de la branch Neon dev: un prefijo del password quedó impreso en el log
de la sesión por un enmascarado mal cortado.

---

## Corrida de experiencia — las primeras 52 capturas del lado de Franco — 2026-08-22

**Rama:** `leados/v1-integracion` (worktree propio `C:\tmp\wt-corrida-admin`, detached)
**Base:** `cbfaa27f` · **Puerto:** `127.0.0.1:3022` · **distDir:** `.next-corrida-admin`
**Salida:** `docs/diagnostico-visual-admin-2026-08/` — PNG gitignorados (patrón de la galería
y de la corrida del setter), `MANIFIESTO.md` + `REPORTE.md` commiteados.

El admin nunca se había fotografiado. 34 rutas UI bajo `/admin`, todas en
`src/app/(protected)/admin/**` (no existe `src/app/admin/`), con un único gate en
`layout.tsx:41-48` y sin `middleware.ts`. Se cubrieron 32/34: quedan afuera el redirect legacy
sin UI y `/admin/projects/[projectId]/hours`, recortada por el techo de 45.

### Lo que la corrida vino a contestar, contestado

- **Las URLs de herramientas no tienen pantalla.** Son literales en `herramientas.ts`; son
  **cinco**, y cuatro están en `null` con `TODO`. `grep -rni "herramienta"` sobre el árbol
  admin da **0 resultados**. No hay modelo Prisma que las guarde.
- **Cal.com tampoco.** Cero escrituras a `calComUsername`/`calComEmbedUrl` en todo el repo;
  solo lecturas, en LeadOS y en el módulo cliente. Confirmado contra la base: las 16 orgs en
  `NULL`. `agenda.ts:44` busca la org **globalmente**, así que cargar el campo en una org
  cliente rompe LeadOS con "Config Cal.com ambigua".
- **El rechazo no puede señalar un check.** Escribe `motivo` + `donde` + `arreglo`, los tres
  texto libre, appendeados al JSON `rechazos`. La infraestructura de ids de hard-check existe
  (`HARD_CHECKS`, `HARD_CHECK_PROMPT`, `guidance-content.checkId`) y **el formulario no la usa**.
- **Aprobar y rechazar no salen del sistema**: Postgres + `revalidatePath` + novedad in-app.
  La asimetría es intencional: el `escalarConstruccion` del setter **sí** hace `fetch` a
  Telegram. Por eso se pudieron apretar los botones y no se tocó el escalamiento.
- **"Me trabé" aterriza en `OsLeadDossier.escaladoAt`/`escaladoNota`** y se muestra en un solo
  lugar: el bloque "Setters trabados" de `/admin/leados`. Es un slot único, no un historial:
  cualquier cambio de stage lo borra.
- **`/admin/team` lista solo `SUPER_ADMIN`.** Los seis setters no aparecen. No hay pantalla de
  setters; la gestión es el selector de asignación en la ficha del lead.

### Aprobar sin cargar el link permanente no es ejecutable

Era la mitad del PAR 2. `AprobarRevisionSchema` exige `finalUrl` https válida, validada en
cliente **y** servidor. El estado existe en el modelo (`turnoDelLead` → `'franco'` si
`APROBADA && finalUrl === null`) pero **ningún camino del admin lo produce**. Se ejecutó el
camino real y se fotografió aparte el fixture que ya está en ese estado: el setter ahí ve
"Seguí la cadencia", **no** un aviso de que Franco no cargó el link.

### El fold del admin es la misma trampa, y la primera pasada salió capada

Shell `fixed inset-0`, scroller en el `<main>` interno. La primera pasada solo expandía las
cuatro superficies marcadas como densas y disparó las otras 37 a 1440×900 sobre contenidos de
hasta 10 259 px. Se rehízo con expansión en **toda** toma. Medido: la **cola de revisión**
tiene 8 662 px de contenido y se ven 756 — **entra el 9 %**; las evaluaciones de un setter,
el 7 %.

`/admin/leados/[leadId]` **no tiene una "página completa" canónica**: su columna de preview es
`xl:h-[calc(100vh-12.5rem)]`, así que crece 1:1 con el viewport y el faltante (193–228 px) es
constante. Tabulado en el manifiesto, no escondido.

### Dos cabos de método

1. **`TaskStop` no mató el proceso de captura.** Tres corridas quedaron vivas escribiendo el
   mismo `filas.json` y el mismo directorio de PNG: el resultado fue una mezcla de dos códigos
   distintos que casi se declara como buena. Se detectó comparando los nombres de archivo con
   el código vigente. Hay que matar por PID y **verificar que no quedan**, no confiar en el
   TaskStop.
2. **El build de Next modifica `tsconfig.json`** cuando se usa un `distDir` alternativo: le
   agrega los `include` del directorio. Revertido antes del commit (el diff del repo ya
   arrastra `.next-perf-b` y `.next-perf-base` de corridas viejas que no lo revirtieron).

**Estado de datos:** la base volvió a la línea base del Paso 1, verificado campo por campo.
Las dos novedades que emitieron el rechazo y la aprobación se borraron con filtro estrecho
(exactamente 2, por setter + lead + kind). No se ejecutó la impersonación ni el escalamiento.

**Queda para Franco:** todo el juicio visual. Esta corrida fotografía y declara; no opina.

---

## A3 · Auditoría externa de viabilidad — las decisiones de OSLead VII contra el código — 2026-08-24

**Qué se hizo.** El paso 1 de A3 del plan v4: sesión limpia, read-only, con los ocho documentos de
`docs/decisiones-oslead-vii/` cargados y sin el historial de las conversaciones que los produjeron.
La pregunta nunca fue "¿está bien?". Entregable: `docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md`.

**Base:** `leados/v1-integracion` @ `58a383f7`. Los 22 invariantes verdes al arrancar. Cero consultas
a la base (el esquema se leyó de `schema.prisma` y de `prisma/migrations/`).

### Lo que devolvió

- **Diez decisiones no se pueden construir como están escritas.** Las tres que más pesan son el tercer
  estado del chequeo, el encabezado etiquetado que el producto tendría que leer, y `mc1`/`mc2` con su
  número de tildes nuevo.
- **Catorce deltas de schema: siete aditivos y siete destructivos.** Dos de los destructivos son el
  mismo mecanismo que ya vació progreso guardado en este proyecto —cambiar un identificador
  persistido— y los dos se vacían en silencio, todo o nada, sin error y sin registro.
- **Ninguna decisión relaja el aislamiento por setter.** Dos lo tocarían de rebote (el reporte semanal
  y las alertas de LeadOS agregan por organización, no por setter).
- **Cuatro invariantes darían falso verde.** `pantallas-construccion` y `progreso-isolation` comparan
  `FASE_IDS` contra cosas derivadas de `FASE_IDS`; `self-check-gate` deriva sus fixtures de
  `HARD_CHECKS` en vivo —y lo declara en su encabezado—; y `particion` no tiene ninguna aserción que
  ate "construir" al veredicto.
- **Diez decisiones ya estaban construidas.** Entre ellas la marca de caliente con su gate ya
  cableado y gateando de verdad hoy, y `soltarFoco`, que existe y no lo llama nadie.

### Los tres hallazgos que cambian una decisión cerrada

**1 · `EVALUADA` ya no tiene pantalla propia.** `m2` es la pantalla del stage **`FICHA`**
(`manual.ts:508-519`, con el comentario *"La evaluación ocurre con stage=FICHA: registrar el veredicto
ES la transición"*). Un lead en `EVALUADA` cae en `m4`/`m6`/`m5`/`espera`, nunca en `m2`. Fusionar `m2`
en `m1` es unir dos pantallas del mismo stage: mucho más barato de lo que la decisión asume. Los que
quedan sin superficie son **`DESCARTADA`** —cuyo terminal ES `m2`— y un lead en `FICHA` con señal.

**2 · Sacar la etapa deja al opener sin camino.** `m4` aparece **sólo** dentro del case `EVALUADA` de
`posicionDe`. Y `m4-opener.tsx:36-47` degrada a un vacío que dice *"la ficha y la evaluación tienen que
estar registradas"* — no crashea: pide algo que ya no existiría. Es el modo de falla más caro porque
es mudo.

**3 · El presupuesto del bloque más grande se apoya en una afirmación falsa.** El asistente de alta de
cliente no es un patrón reutilizable: `OnboardingWizard` no recibe una sola prop, tiene 30 campos de
estado hardcodeados y despacha con cinco condicionales JSX fijos; el "autoguardado" es un borrador de
`localStorage` con **una clave global** (`develop:onboarding:draft`), tipado al alta de cliente, que
no toca servidor ni base. **Lo reutilizable son 32 líneas** (`ProgressBar.tsx`), y viven en
`src/modules/chatbot/`.

### Cinco afirmaciones de los documentos que el código refuta

1. *"El admin renderiza lo que el setter tildó y no muestra lo que dejó sin tildar"* — lo muestra, y
   en rojo (`dossier-panels.tsx:164-176`). El 6-vs-10 es vintage de blob: la lista pasó de 6 a 10 en P7.
2. *"El bloque que llegaba a Claude Design contenía solo CONCEPTO y SECCIONES"* — lleva **once**
   secciones (`copy-blocks.ts:205-241`). Lo que sí falta es paleta, tipografía y tono.
3. *"La infraestructura de G4 ya existe, hay que conectarla"* — los tres símbolos existen pero van en
   la dirección *check → ayuda*. Falta el extremo que guarda: `RechazoSchema` no tiene `checkId`.
4. *"`espera` y `revision` dicen lo mismo palabra por palabra"* — las pantallas ya difieren
   (`manual.ts:275-287`). Lo que comparte texto es la capa del turno, una capa más abajo.
5. **El comentario de `OsLead.caliente` en `schema.prisma:874-878` es falso**: dice que nadie lo setea
   ni lo lee, y hay escritor (`lead.actions.ts:165`), lectores, y el gate del brief ya sale del campo.

### Cabos de método

- **El fan-out murió entero.** Los nueve agentes del workflow cayeron juntos con `session limit`; la
  auditoría se rehízo en una sola pasada secuencial. El techo de cobertura quedó **declarado** en el
  §0 y §9 del reporte en vez de disimulado: ocho frentes sin dictamen, nombrados uno por uno.
- **La regla que más rindió** fue la de refutar antes de reportar: cinco afirmaciones de los
  documentos cayeron ahí, y tres hallazgos propios se corrigieron a enunciados más chicos.

**Estado de datos:** intacto. Cero escrituras. `git diff --stat HEAD` sin salida; lo único que este
sprint agrega es el reporte y esta entrada.

**Queda para Franco:** los siete cambios de schema destructivos, y la decisión que el reporte deja
planteada sin resolver — sacar el Evaluador son **dos** operaciones con reversibilidades opuestas
(la pantalla, reversible; el valor del enum, no), y los documentos las tratan como una sola.

**El paso 2 de A3 —la revisión adversarial del diseño, sin código— no se corrió.**

---

## A3-BIS · Los ocho frentes sin dictamen, y cinco preguntas nuevas — 2026-08-24

**Qué se hizo.** Cerrar los ocho frentes que el §9 de `A3-VIABILIDAD-DECISIONES-2026-08.md` dejó
declarados sin dictamen cuando su fan-out murió, más las cinco preguntas que nacieron al corregir las
decisiones contra ese reporte. Read-only, sin proponer nada. Entregable:
`docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md`.

**Base:** `leados/v1-integracion` @ `8e6c3c3d`, worktree `C:/tmp/wt-v1-integracion`. Cero consultas a la
base. Cero corridas: ni build, ni tests, ni invariantes, ni navegador.

### La parada que hubo que reportar

**`correccion-decisiones-vs-A3.md` no existe.** El encargo lo declara el documento que manda sobre todos
los demás y ordena frenar si no está. Se verificó por cuatro vías —la carpeta, las 28 ramas, los
identificadores `D-C4-bis`/`D26-ter`/`D-cartera-bis` sobre todos los `.md`, y el estado sin commitear de
`docs/`— y no está en ninguna. Los documentos que sí existen son la versión **anterior**: `plan-de-accion-v4.md`
§C6 todavía dice "la cartera se agrupa por turno", que es justo lo que el encargo da por corregido.

**No se frenó la corrida entera**, porque los trece frentes son preguntas sobre el código y el código no
cambia según qué documento las formule. Todo enunciado que sólo vive en el encargo se trató como
enunciado del encargo, y se dejó declarado qué no se pudo verificar por eso.

### Lo que devolvió

- **El mecanismo propio NO alcanza para S2, S3 ni S4.** `D-C4-bis` acierta en la premisa y falla en la
  conclusión. `progresoJson` es un enum cerrado de seis que sólo cubre Construcción y cuya semántica es
  navegación libre —lo contrario de S2—; `PosicionManual` devuelve tres listas de ids, ni acción ni
  motivo; y "lo que falta" no es derivable porque `ORDEN_MANUAL` es privada, cubre 11 de 15 ids y `m4`/`m5`
  se saltean sin dejar rastro.
- **Siete decisiones nuevas no construibles**, que se suman a las diez del reporte anterior. La más
  cara: *"las demos aprobadas y los rechazos entran a la cola de trabajo"* — **la cola de trabajo no se
  renderiza en ninguna parte**: `grupos.trabajar` tiene un solo consumidor, `seleccionarFoco`.
- **Un cambio de schema DESTRUCTIVO que el encargo daba por descartado.** `D26-ter` —pasar el match del
  self-check de `nombre` a `id`— rompe blobs guardados en las dos variantes: con `id` requerido el admin
  acusa "llegó a revisión sin self-check" en toda demo histórica; con `id` opcional los diez tildes se
  re-hidratan vacíos **sin error, sin log y sin flag**.
- **Seis errores del reporte anterior**, buscados a propósito. El que más pesa abajo.

### El hallazgo transversal — no hay ningún gate automático sobre este repo

No estaba en ningún frente; salió al verificar B1, y cambia cómo se lee toda afirmación de "el compilador
lo atrapa":

1. `next.config.ts:31-32` — `typescript: { ignoreBuildErrors: true }`. El build no chequea tipos.
2. No existe script `tsc`/`typecheck` en `package.json`.
3. El workflow que corre `check:invariants`, `test:leados` y `test:e2e` vive en
   **`logic-core-v3/.github/workflows/e2e.yml`** — un `.github` **anidado**. GitHub Actions sólo lee
   `<raíz>/.github/workflows/`, donde hay **un solo archivo: `db-backup.yml`**.

Los 22 invariantes son reales y atrapan lo que dicen atrapar. **Corren sólo si alguien los corre a
mano.** Y el único chequeo de tipos efectivo es `ts-node` dentro de esos invariantes: cubre `manual.ts`,
`contracts.ts`, `flow.ts`, `paso.ts` y `turno.ts`, y deja **todo `src/app/(protected)/**` sin red** —
justo el árbol donde vive el 100% de lo que C4 propone tocar.

### Tres falsos verdes encontrados

- **`pantallas-construccion.invariant.ts:96-101` es tautológico**: compara
  `[...FASES_MANUAL.construccion.pantallas]` contra `[...PANTALLAS_CONSTRUCCION]`, y `manual.ts:310`
  asigna **el mismo objeto por referencia**. Esa aserción no puede fallar nunca.
- **`particion.invariant.ts` asume el acoplamiento en vez de probarlo**: su fixture pone `grupo` y
  `accionable` a mano y nunca llama a `grupoPara`. Es estructuralmente incapaz de detectar que las dos
  funciones divergen.
- **`progreso-isolation.invariant.ts` no ejecuta su promesa de no-gate**: sólo afirma que el default es
  `{completadas: []}`. Volver secuencial a `mc2` pasaría en verde por ese invariante.

### Cabos de método

- **El fan-out volvió a caer, pero tarde y distinto.** Trece de los catorce frentes entregaron dictamen
  completo antes del límite; murieron **A1a** y **los once agentes de refutación**. Se banquearon los
  trece resultados a disco antes de tocar nada, y tras el reset se relanzaron A1a y una refutación
  dirigida a B3/B4 con `Agent` en lote chico — **no se rehizo secuencial**, que fue lo que costó
  cobertura la vez anterior.
- **La refutación adversarial rindió y hay que declararla.** De los seis hallazgos que pasaron por ella,
  **dos se corrigieron** (el falso verde del self-check es de segundo orden, no de entrada; el lead
  ganado canónico cae en `seguimiento`, no en `trabajar`) y **una lectura intermedia del propio auditor
  quedó refutada**: la cartera **no** agrupa hoy — `cartera-view.tsx:36` degrada `'colas'` a `'urgencia'`
  y el valor ni siquiera está en `ORDEN_OPCIONES`, así que es inalcanzable desde la UI.
- **Los subagentes también corrigieron al padre**, y quedó en el reporte: `NavCompletadas` no existe (es
  `NavAtras`, con dos call-sites), `archivo-manual.tsx` no monta la tira de completadas, y `mc2` tiene
  tres prompts, no cuatro.

**Estado de datos:** intacto. Cero escrituras fuera de `docs/`. `git diff --stat 8e6c3c3d` sin salida.

**Queda para Franco:** el cambio destructivo de `D26-ter`, y la decisión de fondo que el §4 deja
planteada — hoy nada corre solo en este repositorio.

**El paso 2 de A3 —la revisión adversarial del diseño, sin código— sigue sin correrse.**

---

## C0 · La red de verificación, sometida a sabotaje — 2026-08-25

**Qué se hizo.** Medir si este repositorio tiene un gate automático, cuánta deuda hay debajo
del que falta, y someter seis invariantes a un sabotaje controlado de lo que cada uno promete
proteger. Cero arreglos: el encargo lo prohíbe explícitamente y no se desvió. Entregable:
`docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md`.

**Base:** `leados/v1-integracion` @ `5ed0c24a`, worktree de sabotaje descartable
`C:/tmp/wt-c0-sabotaje` (detached, `node_modules` por junction, `.env` copiados). Cero
consultas a la base de datos.

### Lo que el encargo daba por cierto y no lo era

**No hay deuda de tipos.** `npx tsc --noEmit` sale en **0, sin una línea de salida** — en frío
(1.466 archivos) y con los artefactos de build presentes (1.604, 137 de tipos de ruta). En
`src/app/(protected)/`, los 425 archivos que el rediseño quiere tocar: **cero**. Y sacar
`ignoreBuildErrors` deja el build en verde: `BUILD EXIT: 0`, `Finished TypeScript in 84s`.
El encargo pedía el número que decide si el gate se enciende de golpe o escalonado. El número
es cero; se enciende de golpe.

La deuda está en otro eje y no la tapa `ignoreBuildErrors`: **`npm run lint` = 212 problemas
(102 errores, 110 warnings)**, 21 errores dentro de `(protected)`. Y el build **no corre
eslint** — probado por el hecho de que sale verde con esos 102 encima.

**El sabotaje 4 no era un sabotaje.** El encargo pedía "hacé que un lead sin `evaluacionJson`
reciba el rótulo de construir". Con el código intacto, cero cambios, un lead con
`evaluacion: null` ya lo recibe en `CONSTRUCCION`, `BRIEF` y `EVALUADA` — y
`particion.invariant.ts:187` lo **afirma como correcto**. `trabajoTier` (`flow.ts:666`) nunca
lee `lead.evaluacion`: despacha por `stage`. Sabotear lo que el invariante sí promete
(`FICHA` → tier CONSTRUIR) da rojo limpio.

**El sabotaje 5 quedó parcialmente refutado.** La aserción de `pantallas-construccion:97-101`
no compara "por referencia" —es `deepEqual` sobre dos spreads— pero los dos operandos salen
del mismo array (`manual.ts:310` aliasea `PANTALLAS_CONSTRUCCION`), y probado contra seis
valores arbitrarios **no puede fallar**. Ahora: rompiendo el alias, **sí dispara**. Es un
guard latente correcto, no código muerto.

### El resultado de los seis

| # | Invariante | Resultado |
|---|---|---|
| 1 | `pantallas-construccion` (`FASE_IDS` × 6 ids nuevos) | **ROJO** — por el compilador (TS7053), no por una aserción |
| 2 | `progreso-isolation` (ídem + blob viejo) | **ROJO** en la lista · **ciego** al blob persistido |
| 3 | `self-check-gate` (+1 check, 1 renombrado) | **VERDE** — suite 22/22, exit 0 |
| 4 | `particion` | **NO CONCLUYENTE** — premisa falsa (arriba) · 4b **ROJO** |
| 5 | la aserción vacua | **vacua hoy** · **ROJO** al romper el alias |
| 6 | `contador-dms` + `timeline` (+1 `ActivityChannel`) | **VERDE** — suite 22/22, exit 0 |

### El hallazgo de método que condiciona todo lo demás

**19 de los 22 invariantes corren con `ts-node`, que type-chequea. Tres corren con `tsx`, que
no.** Probado con un archivo con error deliberado: `ts-node` → `diagnosticCodes: [2322]`,
exit 1; `tsx` → llega al runtime, exit 0. Los tres sin chequeo son `postergacion`,
`contador-dms` y `acuse`.

Consecuencia concreta: el único guard de compilador de `contador-dms` —un
`Record<ActivityResult, boolean>` exhaustivo— **es inerte**. Probado con un `Record`
deliberadamente incompleto: bajo `tsx` llega al runtime con 3 claves de 5; bajo `ts-node`,
`error TS2739`.

Y el sabotaje 1 dio rojo **por el compilador**. Si ese script migrara a `tsx` —como ya pasó
con otros tres— esa protección desaparece sin que nada lo anuncie.

Segundo cabo: la cadena `check:invariants` usa `&&`, así que **corta en el primer fallo**. En
los cuatro sabotajes que dieron rojo reportó 13, 7, 16 y 7 verdes y nunca llegó al resto.

### El falso verde más caro, y lo que rompe

`self-check-gate`. Se agregó un hard-check inventado y se renombró uno existente: **22/22 en
verde**. La causa es que todos los fixtures del archivo se derivan de `HARD_CHECKS` en vivo —
su propio encabezado lo declara como virtud. Detrás del verde: el gate une el blob guardado
con la lista vigente por `item.nombre === check.nombre`, o sea **por el texto visible**. Con
un blob congelado a mano de 10/10 tildados, `selfCheckAprobado(...)` pasa a `false`. Una
corrección de redacción desaprueba todos los self-checks guardados.

Mismo patrón en `progreso-isolation`: `parseProgreso` (`flow.ts:133`) se traga cualquier blob
inválido y devuelve `{ completadas: [] }`. Medido: cinco tildes del setter desaparecen sin
throw, sin log, sin señal, y es todo-o-nada.

### Lo que no vigila nadie

`LEGAL_TRANSITIONS` —la única puerta del `stage`— **no tiene ningún invariante**, y no puede
tenerlo como está: es `const` sin `export` en `dossier.ts`, que importa `@/lib/prisma`. Los
tres invariantes que la nombran lo hacen solo en comentarios. Su única cobertura es
`test:leados`, uno de los dos jobs que nunca corrieron.

De los otros dos huecos que el reporte anterior nombró: el del **grupo del check** se confirma
a medias (el gate exige los 3 de "esto lo mira Franco" y ningún invariante toca el eje
`grupo`), y el del **`checkId` del rechazo** queda **refutado**: `RechazoSchema` no tiene ese
campo, y el `checkId` que sí existe (`guidance-content.ts:121`) no está poblado en ningún
archivo del árbol.

Sumado en esta corrida: **21 scripts `check:invariant:*` huérfanos** (existen 42, la cadena
corre 22) más ~30 `test:*` del chatbot que tampoco están en ningún agregado; y cero aserción
de unicidad sobre `HARD_CHECKS[].nombre`, que es la llave del gate.

### El costo, enumerado sin orden

Mover `e2e.yml` a la raíz **no alcanza**: tiene cero `working-directory` y cero `defaults`, y
en la raíz no hay `package.json` — simulado, los tres jobs mueren en `npm ci` con `EUSAGE`.
El job `invariants` es el único que no necesita ni base ni secrets: **117 s** medidos. Los
otros dos exigen `secrets.DATABASE_URL_TEST` — **NO VERIFICADO** si existen, no se consultó
la configuración de GitHub. `tsc --noEmit` standalone en frío: **76 s**.

### Desvíos declarados

El **sabotaje 6 se midió por inyección en runtime, no regenerando el cliente de Prisma**: el
`node_modules` del worktree es una junction al del checkout principal y `prisma generate`
habría mutado 124 MB de estado compartido. El sabotaje del schema se aplicó de verdad y la
suite corrió encima; el valor nuevo del enum se inyectó con la forma que emitiría el
generador. Se verificó antes que el `schema.prisma` de esta rama es byte-idéntico al de
`main` (`01cd3747` en los dos) para poder reutilizar el cliente ya generado.

El **commit se hizo desde `C:/tmp/wt-v1-integracion`**, no desde el checkout principal como
pedía el encargo: la rama ya está chequeada ahí y el principal está en `main`. Mover el ref de
una rama con checkout activo desde afuera desincroniza a la otra sesión.

**Estado de datos:** intacto. Cero escrituras fuera de `docs/`. Los seis sabotajes revertidos
y verificados **por blob** (`git hash-object` contra `git rev-parse HEAD:<path>`), no por
`git checkout --`. Suite de vuelta en 22/22 exit 0. Worktree de sabotaje destruido con la
junction desarmada primero (`cmd /c rmdir`), con conteo del `node_modules` real antes y
después. `git diff 17727117` del checkout principal, sin salida.

**Queda para Franco:** la decisión de fondo sigue en pie —hoy nada corre solo—, y ahora con el
número que faltaba: encender el chequeo de tipos no cuesta arreglar nada, cuesta 84 s de build.
Lo que sí cuesta trabajo es el eje de lint (102 errores) y los dos falsos verdes.

---

## C1 · Encender el gate — tipos, los 43 invariantes, y un workflow que Actions lee — 2026-08-25

C0 dejó el diagnóstico y el número que faltaba. C1 lo ejecuta: no toca la lógica de ningún
invariante ni arregla un solo error de lint. Cambia **qué se ejecuta y cómo se reporta**.

### El agregado dejó de mentir por dos vías distintas

`check:invariants` era una cadena `npm run a && npm run b && …` escrita a mano. Tenía dos
fallas, y cada una escondía cosas diferentes.

La primera: `&&` **corta en el primer fallo**. La segunda es peor porque no se ve — la cadena
era una **segunda lista**, mantenida a mano, que había divergido de los scripts reales. Existen
**43** scripts de invariante (42 con prefijo `check:invariant:` más el `check:invariant` pelado
de `assignment-trail`). La cadena invocaba **22**. Los otros **21 eran huérfanos**: existían,
pasaban, y ningún agregado los llamaba nunca.

Ahora `check:invariants` es `node scripts/run-invariants.mjs`, que **descubre la lista desde
`package.json`** en vez de repetirla. No hay segunda lista que mantener: un invariante nuevo
entra solo. Corre los 43 sin cortar, imprime una línea por script, junta la salida de los que
fallaron al final, y sale distinto de cero si alguno falló.

El descubrimiento dinámico trae su propio modo de fallar en verde: si el patrón deja de
matchear, el runner descubre 0, corre 0, no falla ninguno y sale 0 — verde impecable sobre una
red apagada. `PISO_MINIMO = 43` lo impide, con un fallo ruidoso. Borrar un invariante a
propósito ahora cuesta bajar el piso en el mismo commit y decir por qué. Que cueste un renglón
es el punto.

### La demostración de que sirve

En un worktree descartable (`wt-c1-sabotaje`, junction al `node_modules` del principal,
destruido al terminar desarmando la junction primero) se rompieron **tres** invariantes de
perfiles distintos: `foco` (ts-node, **posición 7** de la vieja cadena), `dates-ar` (tsx,
huérfano) y `cron-secret` (tsx, huérfano y **último** de los 43).

Sobre exactamente el mismo sabotaje:

| | invocó | exit | qué vio |
|---|---|---|---|
| cadena vieja `&&` | **7** de 43 | 1 | murió en `foco`; los otros 36 nunca corrieron |
| runner nuevo | **43** de 43 | 1 | `corridos 43 · pasaron 40 · fallaron 3`, con la salida de los tres |

Los dos sabotajes en huérfanos son el punto fino: la cadena vieja **no los habría detectado ni
en verde**, porque nunca los invocaba. El guard del piso se probó aparte renombrando 5 scripts
— descubrió 38, abortó con exit 1 y el motivo escrito.

### El chequeo de tipos, encendido en las dos puntas

`check:types` (`tsc --noEmit`) es nuevo y es **el** gate de tipos. Verificado en las dos
direcciones, que es lo que prueba que el exit code es del chequeo y no arrastrado: **exit 0**
sobre el árbol limpio, **exit 2** con un error de tipo inyectado (`TS2322`), y de vuelta a 0 al
sacarlo.

Con la deuda de tipos en cero, `typescript.ignoreBuildErrors` salió de `next.config.ts`. El
build completo quedó **verde, exit 0**, con `Running TypeScript … Finished TypeScript in 57s`
en el log — o sea que type-chequeó de verdad, no lo salteó. Queda anotado en el propio archivo:
el build en verde prueba que el proyecto **bundlea**, no que los tipos cierran. El gate sigue
siendo `tsc --noEmit`.

### El workflow, donde Actions lo lee

`logic-core-v3/.github/workflows/e2e.yml` estaba en un directorio que GitHub Actions no mira.
El propio `db-backup.yml` ya tenía anotado el pendiente. Confirmado contra la API: Actions
conoce **un solo workflow**, `db-backup.yml`.

No se podía mover verbatim — sin `working-directory`, los tres jobs mueren en `npm ci` con
`EUSAGE`. El archivo nuevo es `.github/workflows/ci.yml`, con `defaults.run.working-directory:
logic-core-v3`, disparando en `push` y `pull_request`. Corre **tipos → invariantes → tests**, y
los chequeos llevan `continue-on-error` con un paso de veredicto al final: mismo motivo que el
runner, un rojo temprano escondería el resto.

### Deuda declarada, no arreglada

**El lint queda afuera.** Deuda medida: **212 problemas — 102 errores y 110 warnings**.
Encenderlo hoy dejaría el CI en rojo permanente, y un CI siempre rojo es indistinguible de no
tener CI.

Al medirlo apareció algo que **no se arregló** (fuera de scope): `npm run lint` a secas reporta
**108.208** problemas, no 212. El `globalIgnores` de `eslint.config.mjs` cubre el directorio de
build por defecto pero **no los distDir alternativos** que crean las suites de test, así que
eslint termina linteando bundles minificados. Los 212 son excluyéndolos. Mismo patrón que ya
mordió a Tailwind con estos directorios.

**Los tests no corren, y no por este sprint.** El repo **no tiene ningún secret configurado** —
`gh api .../actions/secrets` devuelve `total_count: 0`, consultado con permisos de admin. No
hay `DATABASE_URL_TEST` ni ninguno de los otros cinco. No se inventaron valores ni se pusieron
placeholders: los jobs de test quedan **gateados por existencia del secret**, y se saltean con
un `::warning::` visible en vez de fallar. Cargando el secret empiezan a correr solos, sin
tocar el archivo.

Ese `total_count: 0` alcanza también a `db-backup.yml`, que usa tres secrets que tampoco
existen — **no se tocó**, pero explica el P0 del backup.

### Lo que este sprint NO hizo

Cero cambios en `src/`. `git diff` sobre `*.invariant.ts`: **vacío**. Los dos falsos verdes que
C0 encontró —`self-check-gate` y `contador-dms` pasaron sabotajes reales en verde— **siguen
ahí**, y el gate encendido los va a correr y van a seguir mintiendo. Eso es C1b.

### De paso, tres preguntas que C0 dejó abiertas

**Runner por script.** De los 43: **19 con `ts-node`** (que type-chequea) y **24 con `tsx`**
(que no). El corte no es casual — los 19 de ts-node están **todos** en el agregado viejo, y los
**21 huérfanos corren todos con tsx**. La cadena a mano se quedó congelada en la época de
ts-node y todo lo que se sumó después con tsx quedó afuera.

**`HardCheck` sí tiene `id`, y el blob no lo guarda.** El tipo (`flow-content.ts:128`) tiene
`id` **y** `nombre`. `SelfCheckSchema` (`contracts.ts:125`) persiste **solo `nombre`** y `ok`.
`buildSelfCheck` usa `check.id` para leer el formulario pero escribe `check.nombre` en el blob:
el `id` es la llave del lado del form, el `nombre` la del lado persistido. `selfCheckAprobado`
y `chequeo-form.tsx:51` matchean los dos por `nombre`. La llave estable existe pero no llega al
disco.

**No hay precedente de matcher con fallback en cadena.** El repo sí tiene un patrón de
retrocompatibilidad, consistente y documentado, pero es **aditivo**: campo nuevo `.optional()`
más `?? ''` en el read-path, de modo que el blob viejo sigue parseando con los campos nuevos
vacíos (`contracts.ts:68` para `materiales`, `contracts.ts:194` para `AgendaSchema`). Probar
una llave y si no matchea probar otra **no existe en el árbol** — buscado por comparación doble
`id`/`nombre`, por `find(…) ?? find(…)` y por vocabulario de migración. Migrar el blob de
`nombre` a `id` no tiene de dónde copiar.

### Queda para la verificación humana

Que la corrida en GitHub Actions **pase de verdad** — este proyecto ya tuvo un workflow que
existía y nunca se ejecutó, así que escrito no es corriendo.

Y la decisión sobre los secrets: mientras `total_count` siga en 0, dos de los tres jobs se
saltean. El comando es `gh secret set DATABASE_URL_TEST --repo frc11/PorfolioDevelOP`.

### Post scriptum — lo que encontró la primera corrida real

El workflow corrió (run `32868515255`, disparado por el push de `15af6c26`). Actions lo
reconoce como `active`, que es la primera vez que este repo tiene una red de verificación
ejecutándose. **Falló**, y lo que falló vale más que si hubiera pasado.

**Los gates de secret fallaron por un motivo que no era el suyo.**
`defaults.run.working-directory: logic-core-v3` aplica a **todo** `run:`, incluidos los que
preceden a `actions/checkout` — y antes del checkout ese directorio no existe. Los gates
estaban primero y murieron por directorio inexistente, no por su lógica. El checkout pasó a ser
el primer paso de los tres jobs, sin `if`.

**19 invariantes no corren en Node 20.** El job de verificación llegó hasta el final y reportó
`corridos 43 · pasaron 23 · fallaron 20`. Los 19 que fallan con
`ERR_UNKNOWN_FILE_EXTENSION: Unknown file extension ".ts"` son **exactamente los 19 de
`ts-node`** — que en Node 20 no carga `.ts` sin registrar su loader ESM. Local pasan los 43
porque el proyecto se desarrolla en Node **v24.13.0**, donde los levanta el type-stripping
nativo. El workflow pasó a Node 24, con la advertencia escrita en el archivo para que nadie lo
baje sin saber qué rompe. La deuda de fondo —19 invariantes atados a ts-node y 24 a tsx— no se
tocó: es C1b.

**Y el hallazgo que más importa: uno de los 43 no es un invariante.**
`check:invariant:client-monthly-report-pdf` hace `prisma.botConfig.findFirst()` y falla con
`Environment variable not found: DATABASE_URL`. Local pasaba porque hay `.env.local`. Estaba
clasificado entre las "invariantes puras del dominio, sin DB ni server" del workflow viejo, y
no lo es. Queda **excluido del agregado con el motivo impreso en cada corrida** — no borrado
del `package.json`, ni salteado en silencio, porque un script excluido sin ruido es otra vez un
huérfano, solo que escondido en el runner. El piso sigue vigilando el **descubrimiento** (43),
así que excluir uno no afloja el guard. Reclasificarlo al job que sí tiene base es C1b.

El runner ahora cierra con `descubiertos 43 · excluidos 1 · corridos 42 · pasaron 42 ·
fallaron 0`.

Vale subrayar cómo se enteró el proyecto de las tres cosas: **la cadena `&&` habría muerto en
el primer invariante y habría reportado un fallo en vez de veinte.** El gate encendido pagó su
costo en la primera corrida.

**Detalle de lectura para la próxima:** en la UI de Actions, un paso con `continue-on-error`
aparece con ✓ aunque haya fallado. En esa corrida `Tipos` e `Invariantes` se veían los dos en
verde y el rojo estaba solo en `Veredicto`. El tilde verde ahí significa "no abortó el job", no
"pasó" — el veredicto es el único que dice la verdad.

### El gate corre, y pasa

Segunda corrida sobre `2515cb29` — run `32870120782`, **`conclusion: success`**, los tres jobs
en verde. Es la primera vez que este repo tiene una red de verificación que se ejecuta sola.

Del log del job de verificación, que es lo que vale (el tilde de la UI no alcanza — ver el
detalle de lectura de arriba):

```
Descubiertos 43 invariantes; corriendo 42 (sin cortar en el primer fallo)
descubiertos 43  |  excluidos 1  |  corridos 42  |  pasaron 42  |  fallaron 0
tipos:       success
invariantes: success
Tipos e invariantes en verde.
```

Los dos jobs de test salieron verdes **con su warning arriba de todo**: `DATABASE_URL_TEST no
está configurado — los tests de LeadOS NO corrieron`. Ni rojo permanente ni silencio: el
salteo queda escrito en las anotaciones de cada corrida hasta que el secret exista.

Queda para Franco, sin cambiar nada del archivo: cargar
`gh secret set DATABASE_URL_TEST --repo frc11/PorfolioDevelOP` y los dos jobs empiezan a correr
solos. Y lo de fondo, que este sprint no tocó: los dos falsos verdes que C0 encontró
(`self-check-gate` y `contador-dms`) ahora corren en cada push — y van a seguir mintiendo en
verde hasta C1b.

---

## C1b · Que un invariante pruebe lo que promete — 2026-08-25

C1 encendió el gate: 43 descubiertos, 42 corridos, 42 verdes, en cada push. Lo que C0 había
medido es que **al menos dos de esos verdes son mentira**, y que la protección de otros no
vive donde parece. Este sprint no toca el gate ni el workflow: toca **aserciones**. Cuatro
invariantes que prometían algo y no lo probaban ahora lo prueban, y cada uno se aceptó recién
tras verse **fallar** ante el sabotaje que C0 midió.

Cero cambios de comportamiento de producción: `git diff` fuera de `*.invariant.ts` está
vacío. Los cuatro archivos tocados son invariantes.

---

### Fase 1 · Qué se hizo para que los 19 de `ts-node` carguen, y si eso borró protección

**Respuesta corta: se subió Node de 20 a 24 en el workflow, y nada más. No se debilitó nada.**

El diff completo del arreglo, en `2515cb29`, son tres renglones idénticos —uno por job— en
`.github/workflows/ci.yml`:

```diff
       - uses: actions/setup-node@v4
         with:
-          node-version: '20'
+          node-version: '24'
```

No se fijó la versión en `package.json`, no se cambió el runner de ningún script, no se tocó
ninguna invocación, no se agregó ninguna bandera. `git diff 5ed0c24a 3f636437 -- '*.invariant.ts'`
está **vacío**, y también lo está para `contracts.ts`, `flow-content.ts`, `flow.ts`,
`manual.ts` y `schema.prisma`. Entre la base de C0 y la de C1b, lo único que cambió es el
andamio.

**La explicación que escribió C1 es incorrecta, y conviene corregirla acá porque de ella
dependía la sospecha.** El comentario del workflow dice que con Node 24 «los levanta el
type-stripping nativo». Si eso fuera cierto, los 19 correrían **sin chequeo de tipos** y el
gate sería ciego justo a lo que C0 midió como su única protección real. Medido, no es así:

```
$ ./node_modules/.bin/ts-node src/lib/leados/__probe-esm.ts     # archivo con import + error de tipos
TSError: ⨯ Unable to compile TypeScript:
src/lib/leados/__probe-esm.ts(3,7): error TS2322: Type 'string' is not assignable to type 'number'.
    at Object.require.extensions.<computed> [as .ts] (…/ts-node/src/index.ts:1621:12)   ← el hook CJS de ts-node
EXIT 1

$ node --no-experimental-strip-types ./node_modules/ts-node/dist/bin.js …/__probe-esm.ts
… mismo TS2322, EXIT 1        ← con el type-stripping nativo APAGADO sigue chequeando
```

Quien carga los `.ts` es `require.extensions['.ts']` de `ts-node`, que compila **y
type-chequea**. Apagar el stripping nativo no lo mueve. Lo que sí cambia entre versiones es
otra cosa: reproducido local con un binario de Node 20 traído al vuelo,

```
$ npx node@20.19.5 ./node_modules/ts-node/dist/bin.js src/lib/leados/pantallas-construccion.invariant.ts
TypeError: Unknown file extension ".ts"      at …/modules/esm/get_format:189    ERR_UNKNOWN_FILE_EXTENSION
$ node          ./node_modules/ts-node/dist/bin.js src/lib/leados/pantallas-construccion.invariant.ts   # v24.13.0
✓ invariante OK: el eslabón pantalla↔fase está atado en las DOS direcciones …
```

En Node 20 el entrypoint se va por el loader ESM y muere; en Node 24 lo toma el hook CJS de
`ts-node`. **Subir la versión no reemplazó al compilador: lo destrabó.** La corrida verde de
CI lo corrobora por otro lado — los 19 de `ts-node` tardan 2,2–2,8 s y los 24 de `tsx` tardan
~1,0 s; esa diferencia es el chequeo de tipos, que no existiría bajo stripping.

#### Tabla de runners de los 43

| # | Script | Runner | ¿Type-chequea? |
|---|---|---|---|
| 1 | `check:invariant` (assignment-trail) | `ts-node` | **sí** |
| 2 | `check:invariant:setter-meta` | `ts-node` | **sí** |
| 3 | `check:invariant:escalamiento` | `ts-node` | **sí** |
| 4 | `check:invariant:novedades` | `ts-node` | **sí** |
| 5 | `check:invariant:mis-numeros` | `ts-node` | **sí** |
| 6 | `check:invariant:timeline` | `ts-node` | **sí** |
| 7 | `check:invariant:foco` | `ts-node` | **sí** |
| 8 | `check:invariant:particion` | `ts-node` | **sí** |
| 9 | `check:invariant:flow` | `ts-node` | **sí** |
| 10 | `check:invariant:alta-propia` | `ts-node` | **sí** |
| 11 | `check:invariant:prospecto-import` | `ts-node` | **sí** |
| 12 | `check:invariant:gate-envio` | `ts-node` | **sí** |
| 13 | `check:invariant:self-check` | `ts-node` | **sí** |
| 14 | `check:invariant:progreso` | `ts-node` | **sí** |
| 15 | `check:invariant:reloop-selfcheck` | `ts-node` | **sí** |
| 16 | `check:invariant:manual` | `ts-node` | **sí** |
| 17 | `check:invariant:pantallas` | `ts-node` | **sí** |
| 18 | `check:invariant:turno` | `ts-node` | **sí** |
| 19 | `check:invariant:security` (idor-tokens) | `ts-node` | **sí** |
| 20 | `check:invariant:postergacion` | `npx tsx` | no |
| 21 | `check:invariant:contador-dms` | `npx tsx` | no |
| 22 | `check:invariant:acuse` | `npx tsx` | no |
| 23 | `check:invariant:lead-scoring` | `npx tsx` | no |
| 24 | `check:invariant:dates-ar` | `npx tsx` | no |
| 25 | `check:invariant:lead-status` | `npx tsx` | no |
| 26 | `check:invariant:home-metrics` | `npx tsx` | no |
| 27 | `check:invariant:lead-detail` | `npx tsx` | no |
| 28 | `check:invariant:recommendations` | `npx tsx` | no |
| 29 | `check:invariant:gbp-connection` | `npx tsx` | no |
| 30 | `check:invariant:modules` | `npx tsx` | no |
| 31 | `check:invariant:motor-resenas-view` | `npx tsx` | no |
| 32 | `check:invariant:upsell-dedup` | `npx tsx` | no |
| 33 | `check:invariant:announcements` | `npx tsx` | no |
| 34 | `check:invariant:referrals` | `npx tsx` | no |
| 35 | `check:invariant:client-notifications` | `npx tsx` | no |
| 36 | `check:invariant:executive-report-plan` | `npx tsx` | no |
| 37 | `check:invariant:executive-report-prefs` | `npx tsx` | no |
| 38 | `check:invariant:brief-input` | `npx tsx` | no |
| 39 | `check:invariant:client-monthly-report` | `npx tsx` | no |
| 40 | `check:invariant:client-monthly-report-pdf` | `npx tsx` | no *(excluido del agregado)* |
| 41 | `check:invariant:notifications-brevo` | `npx tsx` | no |
| 42 | `check:invariant:mask-secret` | `npx tsx` | no |
| 43 | `check:invariant:cron-secret` | `npx tsx` | no |

19 `ts-node` / 24 `tsx`, idéntico al corte que midió C0. Probado con un archivo con error de
tipos deliberado: `ts-node` → `TS2322`, exit 1; `npx tsx` → `PROBE CORRIO SIN CHEQUEAR TIPOS`,
exit 0.

#### Los seis sabotajes de C0, re-corridos

Worktree descartable `C:/tmp/wt-c1b` (detached sobre `3f636437`), `node_modules` por junction,
uno por vez, revirtiendo por copia byte a byte (nunca `git checkout --`).

| # | Sabotaje | C0 | C1b (sobre HEAD, antes de arreglar) | ¿Cambió? |
|---|---|---|---|---|
| 1 | `FASE_IDS` × 6 ids nuevos → `pantallas` | ROJO (TS7053) | **ROJO**, los mismos dos TS7053 | no |
| 2a | ídem → `progreso` | ROJO (aserción) | **ROJO**, la misma aserción | no |
| 2b | `progresoJson` con ids viejos | ciego | **ciego** | no |
| 3 | +1 hard-check y 1 renombrado | VERDE 22/22 | **VERDE 42/42**, exit 0 | no |
| 4 | «lead sin `evaluacionJson` → construir» | no concluyente | **no concluyente**: `trabajoTier` sigue sin leer `lead.evaluacion` | no |
| 4b | `FICHA` → tier CONSTRUIR | ROJO | **ROJO**, la misma aserción de orden del foco | no |
| 5 | la aserción vacua | 0 fallos / 6 valores | **0 fallos / 6 valores** | no |
| 5b | romper el alias de `manual.ts:310` | ROJO | **ROJO** | no |
| 6 | +1 valor en `ActivityChannel` | VERDE 22/22 | **VERDE 42/42**, exit 0 | no |

**Ningún sabotaje que daba rojo pasó a verde. No hubo frenada.** Lo único que cambió es para
mejor y es mérito del runner: bajo el sabotaje 1, la cadena `&&` de C0 moría en el 14.º y
`pantallas` **ni llegaba a correr**; el runner reporta los dos —`progreso` **y** `pantallas`—
en la misma corrida (`corridos 42 | pasaron 40 | fallaron 2`).

---

### Fase 2 · Los cuatro arreglos

#### 2.1 · `self-check-gate` — el más caro

```
INVARIANTE   src/lib/leados/self-check-gate.invariant.ts  (check:invariant:self-check, ts-node)

PROMESA      «selfCheckAprobado exige TODOS los hard-blocks VIGENTES (HARD_CHECKS) en verde —
             valida contra la lista, no contra lo que el blob afirme; cada hard es dealbreaker
             y un hard faltante no aprueba (dientes ante el drift de FG-2).»

ANTES        Sabotaje 3 de C0 (un hard-check inventado + el `nombre` de otro renombrado):
             VERDE. `check:invariant:self-check` exit 0, suite 42/42 exit 0.

DESPUÉS      ROJO.
```

**Causa, y por qué el archivo no podía verlo.** Todos sus fixtures se derivaban de
`HARD_CHECKS` en vivo (`HARD_CHECKS.map((c) => ({ nombre: c.nombre, ok: true }))`). Si la
lista crece, el fixture crece con ella; si un nombre cambia, el fixture cambia con él. El
archivo probaba la lógica de `selfCheckAprobado` —que es correcta— y nada más. Es el patrón
que ya está anotado como trampa: un invariante que deriva sus fixtures de la lista que vigila
da falso verde.

**Lo que se agregó** son tres aserciones, y la fuente de las tres está escrita **a mano**:

- **6 · censo congelado.** Los diez `{ id, nombre }` vigentes, literales, afirmados contra
  `HARD_CHECKS`. Ve agregados, borrados, renombres y reordenamientos.
- **7 · un self-check guardado ayer tiene que seguir aprobando.** Un blob congelado con los
  diez nombres tildados, pasado por `selfCheckAprobado`. No es redundante con el 6: es el que
  dice **qué cuesta** el renombre.
- **8 · `nombre` es llave.** Ni los `nombre` ni los `id` pueden repetirse.

**Las preguntas de diseño, contestadas contra el código:**

`HardCheck` **sí** tiene `id` además de `nombre` (`flow-content.ts:128`). El blob **no** lo
guarda: `SelfCheckSchema.itemsDuros` es `{ nombre, ok }` (`contracts.ts:125`) y
`buildSelfCheck` escribe solo el nombre (`flow.ts:188`). El gate une por
`item.nombre === check.nombre` (`flow.ts:207`) y el formulario re-encuentra el tilde por el
mismo texto (`chequeo-form.tsx:51`). Y **no hay ningún precedente de matcher con fallback en
cadena** en todo el árbol: cero ocurrencias de `nombresPrevios`, `aliasPrevios`,
`legacyNombre` o `?? item.id`.

Conclusión: **un fallback `id → nombre → nombres previos` NO es aditivo y NO entra en este
sprint.** Exige agregar `id` al `SelfCheckSchema`, cambiar el write path, cambiar el gate y
cambiar el formulario — cuatro archivos de producción y un cambio de forma del dato guardado.
Eso es lógica de negocio, no una aserción. Por eso se tomó la otra rama que el encargo
permite: **el invariante lo declara en rojo.** La aserción 7 es exactamente esa declaración.

**DEMOSTRACIÓN.** Tres sabotajes, uno por vez.

*(a) Solo agregar un check a la lista:*

```diff
  export const HARD_CHECKS: HardCheck[] = [
+   { id: 'sabotajeNuevo', nombre: 'SABOTAJE: chequeo nuevo agregado por C0', … },
    { id: 'carga', nombre: 'La demo carga', …
```
```
AssertionError [ERR_ASSERTION]: HARD_CHECKS divergió del censo congelado de este invariante:
se agregó, se borró, se renombró o se reordenó un hard-check. …
EXIT 1
```

*(b) Solo renombrar un check:*

```diff
-   nombre: 'La demo carga',
+   nombre: 'SABOTAJE: la demo abre sin error',
```
```
AssertionError [ERR_ASSERTION]: HARD_CHECKS divergió del censo congelado …
+     nombre: 'SABOTAJE: la demo abre sin error'
-     nombre: 'La demo carga'
EXIT 1
```

*(c) El caso que importa — renombrar **y** actualizar el censo, o sea lo que haría un dev
disciplinado leyendo el mensaje del 6. El rediseño de m14 va a hacer exactamente esto:*

```diff
  // flow-content.ts
- nombre: 'La demo carga',
+ nombre: 'SABOTAJE: la demo abre sin error',
  // self-check-gate.invariant.ts  (el censo, actualizado como pide el mensaje)
- { id: 'carga', nombre: 'La demo carga' },
+ { id: 'carga', nombre: 'SABOTAJE: la demo abre sin error' },
```
```
AssertionError [ERR_ASSERTION]: un self-check guardado con los nombres vigentes DEJÓ DE
APROBAR. Se renombró o se agregó un hard-check y todos los self-checks ya guardados quedaron
desaprobados en silencio: el setter ve el envío a revisión trabado sin ningún error. El
vínculo blob↔lista es por `nombre` (texto visible), no por `id` — el blob no guarda el id.
  false !== true
EXIT 1
```

Y el sabotaje 3 completo de C0, el mismo de antes: **exit 1**.

#### 2.2 · `contador-dms` — el `Record` inerte

```
INVARIANTE   src/lib/leados/contador-dms.invariant.ts  (check:invariant:contador-dms, tsx)

PROMESA      «el contador de DMs cuenta MENSAJES MANDADOS (SIN_RESPUESTA: opener y toques) […]
             y el número coincide con la definición de «toque mandado» de la cadencia.»

ANTES        Sabotaje 6 de C0 (un valor nuevo en `ActivityChannel`): VERDE, suite 42/42 exit 0.
             Y el `Record<ActivityResult, boolean>` de la línea 35, incompleto a propósito:
             VERDE también — el guard del compilador es decoración bajo `tsx`.

DESPUÉS      ROJO en los dos.
```

**La decisión que pedía el encargo: se afirma en runtime, no se cambia el runner.** Cambiar
`contador-dms` a `ts-node` arrastraría a los otros 23 scripts de `tsx` y tocaría justo el
mecanismo que la Fase 1 estaba midiendo; el encargo pedía frenar si esa era la salida, así que
no lo es. Los dos enums se censan enumerándolos en runtime, que es la forma que **sí** corre
bajo el runner que este script tiene hoy.

- `Object.keys(esperado)` vs `Object.keys(ActivityResult)` — vuelve real la exhaustividad que
  el `Record` prometía.
- Bloque 4 nuevo: `CENSO_CANALES`, un renglón por canal escrito a mano con **las dos
  decisiones explícitas** (¿suma al tope de Instagram? ¿es contacto comercial?), afirmado
  contra `Object.keys(ActivityChannel)` y verificado canal por canal contra `contarDms` y
  `esContactoComercial`.
- `Fila` y `contarDms` subieron al scope del módulo: los dos ejes tienen que medir con la
  **misma** réplica del `where`, o podrían divergir sin que nadie se entere.

**DEMOSTRACIÓN.** El sabotaje 6, con el mismo método que usó C0 para la mitad de runtime
(`prisma generate` escribiría en el `node_modules` compartido por junction, así que el valor
del enum se inyecta con la forma que emitiría el generador — los enums de Prisma son objetos
planos):

```diff
  enum ActivityChannel {
    INSTAGRAM_DM
+   SABOTAJE_TIKTOK_DM
    WHATSAPP
```
```
canales tras la inyeccion: INSTAGRAM_DM,WHATSAPP,EMAIL,LLAMADA,LOOM_VIDEO,OTRO,SISTEMA,SABOTAJE_TIKTOK_DM
AssertionError [ERR_ASSERTION]: apareció (o desapareció) un valor de ActivityChannel y el censo
de este invariante no lo cubre. No lo agregues sin decidir las dos cosas: si suma al tope de
Instagram y si cuenta como contacto comercial (que gasta un toque de la cadencia). Ojo: un
canal nuevo entra al conteo comercial POR DEFECTO — `esContactoComercial` es `!== SISTEMA`.
EXIT 1
```

Y el `Record` incompleto, la misma línea sacada de las dos versiones:

```diff
-   [ActivityResult.RECHAZADO]: false, // reacción del prospecto
```
```
ANTES   (invariante de HEAD, tsx)   → ✓ invariante OK …            EXIT 0
DESPUÉS (invariante arreglado, tsx) → AssertionError: el mapa de arriba dejó de cubrir todo
                                      ActivityResult …             EXIT 1
```

#### 2.3 · La aserción vacua de `pantallas-construccion`

```
INVARIANTE   src/lib/leados/pantallas-construccion.invariant.ts, aserción 4 (líneas 96-101)

PROMESA      «FASES_MANUAL.construccion.pantallas divergió de PANTALLAS_CONSTRUCCION (el
             "paso N de M" contaría otra cosa)»

ANTES        Los dos operandos salían del MISMO array (`manual.ts:310` hace
             `pantallas: PANTALLAS_CONSTRUCCION`, sin copia). Reproducida la topología contra
             seis valores arbitrarios: 0 fallos sobre 6, incluido invertir el orden.

DESPUÉS      Cada lado se compara contra un fixture congelado independiente.
```

**El fixture congelado —`['mc1','mc2']`, escrito a mano— es la única fuente independiente que
existe acá.** Con él la aserción puede fallar por los dos caminos por los que el "paso N de M"
contaría otra cosa: que la lista cambie (antes los dos lados se movían juntos y nadie se
enteraba) o que el manual deje de leerla.

**DEMOSTRACIÓN.** El sabotaje que separa las dos versiones es **invertir el orden** — que le
da vuelta el «paso 1 de 2» y el «paso 2 de 2» al setter y que C0 ya había medido como
invisible:

```diff
- export const PANTALLAS_CONSTRUCCION = ['mc1', 'mc2'] as const
+ export const PANTALLAS_CONSTRUCCION = ['mc2', 'mc1'] as const
```
```
ANTES   (invariante de HEAD)   → ✓ invariante OK: el eslabón pantalla↔fase …    EXIT 0
DESPUÉS (invariante arreglado) → AssertionError: PANTALLAS_CONSTRUCCION cambió (se agregó, se
                                 borró o se reordenó una pantalla) …            EXIT 1
```

Y el sabotaje 5b de C0 —romper el alias— sigue en rojo, ahora con un mensaje que dice qué se
rompió: `el manual dejó de leer la lista de Construcción`. **EXIT 1**.

#### 2.4 · `progreso` — la ceguera al blob persistido

```
INVARIANTE   src/lib/leados/progreso-isolation.invariant.ts  (check:invariant:progreso, ts-node)

PROMESA      «ProgresoSchema valida contra FASE_IDS y el default es un checklist fresco; los
             ids del shell son exactamente FASE_IDS.»

ANTES        Sabotaje 2b de C0: el invariante nunca pregunta qué le pasa a un progreso YA
             GUARDADO cuando la lista cambia. `parseProgreso` (flow.ts:133) se traga cualquier
             blob que no valide y devuelve `{ completadas: [] }`. Sin throw, sin log.

DESPUÉS      ROJO, con el costo escrito en el mensaje.
```

**Y hay un agujero más grande del que C0 no llegó a medir.** La aserción 5 ata
`SHELL_CONSTRUCCION` contra `FASE_IDS`, pero **las dos listas se mueven juntas**: un renombre
*coordinado* de los ids —el refactor natural, y el único que compila— la deja en verde. Medido:
renombrar `estructura → estructuraV2` en las tres listas donde vive
(`contracts.ts`, `flow-content.ts`, `manual.ts`) pasa **la suite entera**:

```
descubiertos 43  |  excluidos 1  |  corridos 42  |  pasaron 42  |  fallaron 0     EXIT 0
```

…y borra el checklist de **todos** los setters a la vez. Es todo-o-nada: un solo id fuera de
la lista descarta el blob entero, no filtra el id malo.

**Lo que se agregó**: un `PROGRESO_GUARDADO_AYER` congelado a mano —cinco fases tildadas y una
`faseActual`, o sea lo que hay en la base hoy— pasado por el camino real de lectura, más su
contracara (un id inventado descarta el blob entero) para que la aserción no pueda pasar por
accidente.

**DEMOSTRACIÓN.** El renombre coordinado, la suite completa, las dos versiones:

```diff
  // contracts.ts        - 'estructura',       + 'estructuraV2',
  // flow-content.ts     - id: 'estructura',   + id: 'estructuraV2',
  // manual.ts           - estructura: 'mc1',  + estructuraV2: 'mc1',
```
```
ANTES   (los 4 invariantes en su versión de HEAD)
        descubiertos 43 | excluidos 1 | corridos 42 | pasaron 42 | fallaron 0     EXIT 0

DESPUÉS (los 4 arreglados)
        ✗ FALLA   check:invariant:progreso
        descubiertos 43 | excluidos 1 | corridos 42 | pasaron 41 | fallaron 1     EXIT 1

        AssertionError: un progresoJson guardado con los ids vigentes DEJÓ DE PARSEAR:
        `parseProgreso` lo descartó y devolvió un checklist fresco. Cambió `FASE_IDS` y los
        tildes de todos los setters se pierden en silencio (todo-o-nada, no solo la fase
        renombrada). Si el cambio es a propósito, migrá los blobs guardados y actualizá este
        fixture en el mismo commit.
```

---

### Qué NO se arregló, y por qué

**`timeline` sigue sin guard exhaustivo de canal.** C0 agrupó `timeline` con `contador-dms` en
el sabotaje 6; el encargo de C1b nombra solo a `contador-dms`. El censo de canales nuevo hace
que el sabotaje 6 **caiga la suite**, que es lo que el bloque de cierre pedía, pero el eje de
canal de `timeline` —que promete «SISTEMA se muestra pero NO cuenta»— sigue probándose con
casos puntuales. Es barato y es el mismo patrón; queda anotado.

**`check:invariant:client-monthly-report-pdf` sigue excluido.** La nota de C1 se lo asignó a
C1b, pero reclasificarlo al job que tiene base **es tocar el workflow**, y la primera regla de
este sprint es no tocarlo. Queda para el sprint que abra `.github/workflows/ci.yml`.

**`LEGAL_TRANSITIONS` sigue sin invariante y sigue sin poder tenerlo.** Es `const` sin
`export` en `dossier.ts`, que importa `@/lib/prisma`. Es la única puerta del stage y nadie la
vigila. Sprint propio.

**El lint sigue afuera y sigue midiendo mal** (108.208 problemas reportados porque
`globalIgnores` no cubre los `distDir` alternativos y se lintean bundles minificados). Sprint
propio y barato.

**Los tests de LeadOS siguen sin correr** hasta que exista `DATABASE_URL_TEST`.

---

### Declaración de cierre

**Comportamiento de producción: sin cambios.** Los únicos archivos modificados son cuatro
`*.invariant.ts`. `git status --porcelain` del worktree de sabotaje, tras revertir todo,
muestra exactamente esos cuatro y nada más; los cinco archivos de producción que se sabotearon
—`contracts.ts` `7ddfc162`, `flow-content.ts` `6ba88e57`, `flow.ts` `bc4d60e5`, `manual.ts`
`e1745fcd`, `schema.prisma` `01cd3747`— quedaron **byte a byte idénticos a HEAD**, verificado
con `git hash-object` contra `git rev-parse HEAD:<path>` (nunca `git checkout --`: la
conversión de fin de línea marca archivos como modificados sin cambio real).

**Verificación:**

```
npx tsc --noEmit                → EXIT 0, sin salida
npm run check:invariants        → descubiertos 43 | excluidos 1 | corridos 42 |
                                  pasaron 42 | fallaron 0        EXIT 0
```

No se corrió `prisma generate` (no se tocó el schema) ni ninguna operación sobre la base.

**El worktree de sabotaje se destruyó con la junction de `node_modules` desarmada primero**
(`cmd /c rmdir`, que borra el enlace y no el destino), verificando el conteo de entradas del
`node_modules` real antes y después. **Ningún sabotaje sobrevivió.**

Desvío declarado: el commit se hizo desde `C:/tmp/wt-v1-integracion`, que es el worktree que
tiene chequeada `leados/v1-integracion` — mismo motivo que en C0. El checkout principal quedó
en `main`, intacto. Sin push.

---

## C2 · El grafo de stage sale de `dossier.ts` y estrena red — 2026-08-25

C1a dejó el gate corriendo en cada push. C1b dejó cuatro falsos verdes arreglados. Lo que
quedaba sin red era `LEGAL_TRANSITIONS`: **la única puerta del stage del dossier**, y ningún
invariante la miraba. No podía mirarla — era un `const` sin `export` adentro de `dossier.ts`,
que importa `@/lib/prisma`; un invariante que lo importara habría arrastrado el cliente a una
corrida que se define por no necesitar base. C1b lo dejó anotado con esas palabras:
«LEGAL_TRANSITIONS sigue sin invariante posible».

Este sprint hace que sea posible y lo hace. Mueve una constante y escribe un invariante. Cero
cambio de comportamiento: `transitionDossier()` consulta el mismo grafo, byte a byte.

**Por qué ahora y no después.** El rediseño pendiente fusiona m1 y m2 en una sola pantalla del
stage FICHA. El reporte A3 verificó que ahí vive una garantía que el código declara así:
«construir nunca se sugiere para un lead sin veredicto… La garantía es estructural, no un
`if`». Es estructural porque FICHA tiene **una sola salida** y es EVALUADA: no existe camino de
FICHA a BRIEF que no pase por el veredicto. El día que FICHA→BRIEF sea legal, la garantía se
evapora sin que nada se rompa —compila, corre, y el bug es que el setter construye a ciegas—.
Hoy no hay nada que lo atrape. Esto es lo que lo atrapa.

---

### Paso 1 · El grafo censado, antes de moverlo

Ocho stages, ocho aristas. Tal como estaba en `dossier.ts:50` (blob de `8a4b30f7`):

| desde | salidas legales | qué exige la transición |
|---|---|---|
| `FICHA` | `EVALUADA` | la evaluación entera, parseada con `EvaluacionSchema`; estampa `fecha` si el caller no la trae |
| `EVALUADA` | `DESCARTADA`, `BRIEF` | **→DESCARTADA:** `motivoDescarte` no vacío **y** que el `evaluacionJson` existente parsee · **→BRIEF:** ningún dato del caller, pero sí el gate comercial `gateBriefAbierto(lead.status, lead.caliente)`, que se lee del lead adentro de la función |
| `BRIEF` | `CONSTRUCCION` | nada |
| `CONSTRUCCION` | `EN_REVISION` | nada |
| `EN_REVISION` | `APROBADA`, `RECHAZADA` | **→APROBADA:** `finalUrl` opcional; estampa `aprobadaAt` · **→RECHAZADA:** `motivo` no vacío, que se appendea al historial `rechazos` (`detalle`/`donde`/`arreglo` opcionales) |
| `RECHAZADA` | `CONSTRUCCION` | nada. Es el re-loop; `esReloopRechazo()` en `escalamiento.ts:56` reconoce exactamente este par para limpiar el self-check |
| `APROBADA` | — | terminal |
| `DESCARTADA` | — | terminal |

**Quién lo consumía.** Al ser `const` sin `export`, sus lectores estaban todos en el mismo
archivo, y el censo dio **uno solo**:

- `src/lib/leados/dossier.ts:50` — la declaración.
- `src/lib/leados/dossier.ts:147` — **el único lector**, dentro de `transitionDossier()`.
- `src/lib/leados/dossier.ts:115` y `:183` — comentarios que lo nombran.
- `src/app/(protected)/setter/leads/[leadId]/manual/[paso]/page.tsx:147` — comentario, no código.

No hay una segunda copia del grafo en ningún lado. Sí hay dos listas **adyacentes** que no son
grafos y que este sprint no toca: `admin/leados/page.tsx:67` (qué stages entran al filtro «en
vuelo») y `manual.ts:420` (`STAGES_POST_CHEQUEO`). Anotadas, no tocadas.

---

### Paso 2 · La extracción, y las cuatro pruebas de que fue neutral

El grafo se movió **verbatim** a `src/lib/leados/dossier-stage.ts`, con su comentario de
diagrama. Mismos stages, mismas aristas, mismo orden. Ni una transición agregada, sacada ni
corregida.

**Prueba 1 — igualdad estructural, no textual.** Se parseó el grafo del blob de HEAD y se
comparó contra el módulo nuevo cargado en runtime:

```
stages, mismo orden : True
aristas, mismo orden: True
IGUALDAD ESTRUCTURAL: True
stages: 8 | aristas: 8
```

**Prueba 2 — `npx tsc --noEmit`** → EXIT 0, sin salida.

**Prueba 3 — la suite completa sigue en 42/42**, corrida *antes* de sumar el invariante nuevo:
`descubiertos 43 | excluidos 1 | corridos 42 | pasaron 42 | fallaron 0`, EXIT 0.

**Prueba 4 — el diff de `dossier.ts` es solo la mudanza.** Tres hunks, ninguno de comportamiento:

```diff
-import type { DossierStage, OsLeadDossier, Prisma } from '@prisma/client'
+import type { OsLeadDossier, Prisma } from '@prisma/client'
...
 } from '@/lib/leados/escalamiento'
-
-/**
- * Transiciones legales de la maquina de produccion. Ninguna otra existe.
- *   [diagrama]
- */
-const LEGAL_TRANSITIONS: Record<DossierStage, readonly DossierStage[]> = {
-  FICHA: ['EVALUADA'],
-  ... las 8 aristas ...
-}
+import { LEGAL_TRANSITIONS } from '@/lib/leados/dossier-stage'
```

`DossierStage` sale del `import type` porque, al irse la constante, quedó sin uso en el archivo
(`grep` lo confirmó: la única referencia era la anotación de la constante). Es la consecuencia
mecánica de la mudanza, no un cambio aparte.

**El módulo destino no arrastra Prisma, siguiendo la cadena de imports.** La cadena tiene un
solo nivel: el único import de `dossier-stage.ts` es `import type { DossierStage } from
'@prisma/client'`, que TypeScript borra al compilar (`isolatedModules: true` en el tsconfig lo
garantiza). No hay segundo nivel que seguir. Y se probó por la salida, no por lectura — el JS
emitido del módulo tiene **cero** `import` y cero `require`:

```
export const LEGAL_TRANSITIONS = { FICHA: ['EVALUADA'], ... };
--- imports/require en el emitido: 0
```

Es el mismo patrón que ya usan `flow.ts` y `turno.ts`, que también se importan desde
invariantes de `ts-node` sin tocar la base.

---

### Paso 3 · El invariante, y los siete sabotajes

`src/lib/leados/dossier-stage.invariant.ts`, censo congelado **a mano** —no derivado de
`LEGAL_TRANSITIONS`, que es el modo de falla exacto de C1b— más aserciones sobre él.

Una decisión de orden: **la aserción 2 va primero**, antes del censo. Si fuera al revés, quien
haga legal FICHA→BRIEF leería el mensaje genérico («el grafo cambió respecto del censo») en vez
del que explica qué garantía está por perder. El sabotaje 2 de abajo lo confirma: dispara con
su propio mensaje.

#### Aserción 1 — el grafo es exactamente el censado

```
ASERCIÓN     Mismos stages, mismas salidas por stage (como conjunto) y mismo total de
             aristas. El total se chequea aparte para que un cambio compensado —una
             arista que se va y otra que entra— no pase.
SABOTAJE 1a  BRIEF: ['CONSTRUCCION'] → BRIEF: ['CONSTRUCCION', 'EN_REVISION']
RESULTADO    ROJO (exit 1)
             AssertionError: las salidas de BRIEF cambiaron y nadie tocó el censo.
               censadas:    [CONSTRUCCION]
               en el grafo: [CONSTRUCCION, EN_REVISION]
               Una transición NUEVA abre un camino que el producto nunca decidió; una
               que FALTA deja atrapados a los dossiers que ya están en ese stage — sin
               salida legal, `transitionDossier` los rechaza para siempre y hay que
               tocar la DB a mano.
               Si el cambio es a propósito: actualizá GRAFO_CENSADO en el MISMO commit
               y decí por qué. Que cueste un renglón es el punto.

SABOTAJE 1b  EN_REVISION: ['APROBADA', 'RECHAZADA'] → EN_REVISION: ['APROBADA']
RESULTADO    ROJO (exit 1)
             AssertionError: las salidas de EN_REVISION cambiaron y nadie tocó el censo.
               censadas:    [APROBADA, RECHAZADA]
               en el grafo: [APROBADA]
```

El **orden** de las salidas de un stage no se congela, a propósito: el consumo es
`.includes()`, que no lo mira. Congelarlo daría un rojo ante un reordenamiento inocuo, y un
rojo que no significa nada es lo que enseña a ignorar la red.

#### Aserción 2 — FICHA → BRIEF no es legal

```
ASERCIÓN     FICHA no tiene a BRIEF entre sus salidas, y además tiene UNA sola salida
             y es EVALUADA (lo segundo cierra la puerta a cualquier otro atajo que no
             se llame BRIEF).
SABOTAJE     FICHA: ['EVALUADA'] → FICHA: ['EVALUADA', 'BRIEF']
RESULTADO    ROJO (exit 1)
             AssertionError: FICHA→BRIEF quedó LEGAL. Eso borra una garantía estructural
             del producto:
               hoy «construir nunca se sugiere para un lead sin veredicto» NO es un if que
               alguien pueda olvidar — es la forma del grafo. FICHA tiene UNA salida
               (EVALUADA), así que no existe camino de FICHA a BRIEF sin pasar por el
               veredicto del Evaluador. Con esta arista el camino existe, y el setter puede
               entrar a construir una demo para un lead que nadie evaluó.
               Si estás fusionando m1 y m2 en una sola pantalla de FICHA: ESTE es el punto
               donde hay que decidir explícitamente qué reemplaza a la garantía, en vez de
               perderla en silencio. No borres esta aserción para seguir: cambiala por la
               garantía nueva, o el producto se queda sin ninguna.
```

#### Aserción 3 — todo stage del enum aparece en el grafo

La fuente del enum es **`prisma/schema.prisma`**, no el cliente generado. Importar
`DossierStage` como *valor* desde `@prisma/client` habría arrastrado el cliente a la corrida —
justo lo que la extracción vino a evitar. Y leer el schema atrapa el caso real: alguien agrega
un stage y no toca el grafo, cosa que el compilador no ve hasta que alguien corra
`prisma generate`.

```
ASERCIÓN     El conjunto de stages del enum de schema.prisma es el del grafo; y cada
             stage o tiene salidas o está declarado terminal en STAGES_TERMINALES.
SABOTAJE     enum DossierStage { +PAUSADA, FICHA, ... } en prisma/schema.prisma.
             Sin `prisma generate` a propósito: node_modules es una junction al
             checkout principal y regenerar habría tocado el de todas las sesiones.
RESULTADO    ROJO (exit 1)
             AssertionError: el enum DossierStage de prisma/schema.prisma y el grafo
             dejaron de coincidir.
               en el schema: APROBADA, BRIEF, CONSTRUCCION, DESCARTADA, EN_REVISION,
                             EVALUADA, FICHA, PAUSADA, RECHAZADA
               en el grafo:  APROBADA, BRIEF, CONSTRUCCION, DESCARTADA, EN_REVISION,
                             EVALUADA, FICHA, RECHAZADA
               Un stage del enum SIN entrada en el grafo es un agujero mudo: un dossier
               que llegue ahí no tiene ninguna transición legal y queda trabado. Y el
               compilador no lo ve hasta que alguien corra `prisma generate` — puede
               vivir en main varios commits.
```

Y se verificó la afirmación de ese mensaje en vez de dejarla como retórica: **con el sabotaje 3
puesto, `npx tsc --noEmit` sale 0.** El invariante es lo único que lo atrapa.

#### Aserción 4 — ningún stage sin camino de entrada, salvo el inicial

```
ASERCIÓN     Se calcula el grado de entrada de cada stage desde el propio grafo. Todos
             tienen al menos una entrada, salvo FICHA, que tiene que tener cero (volver
             a FICHA re-abriría la ficha de un lead que ya tiene veredicto).
SABOTAJE     EVALUADA: ['DESCARTADA', 'BRIEF'] → EVALUADA: ['DESCARTADA']
             — la única arista que llega a BRIEF. Se actualizó TAMBIÉN el censo
             congelado, para que la aserción 1 no lo enmascare: así se demuestra que la
             4 atrapa lo que un censo diligente dejaría pasar.
RESULTADO    ROJO (exit 1)
             AssertionError: BRIEF quedó INALCANZABLE: ninguna transición legal llega a él.
               Un stage sin entrada es código muerto que parece vivo — el enum lo tiene,
               la UI probablemente lo pinte, y ningún dossier va a estar ahí nunca. Si
               además había dossiers en ese stage, quedaron sin forma de llegar y sin
               forma de salir.
               Suele pasar por sacar «una arista que no se usaba»: era la única que llegaba.
```

#### Aserción 5 — las transiciones que exigen un dato lo declaran

Las exigencias **no se copiaron** al módulo del grafo. Duplicarlas como una tabla a mano habría
creado la segunda lista de siempre. Se verifican contra su fuente real, y la fuente son dos
lugares distintos, así que la aserción tiene dos patas.

**Pata A — el tipo.** Tres `@ts-expect-error` contra `DossierTransitionInput`: `{ to:
'DESCARTADA' }`, `{ to: 'RECHAZADA' }` y `{ to: 'EVALUADA' }` sin sus datos no deben compilar.
Si alguien afloja una exigencia, el error que esperan desaparece y el compilador corta con
TS2578.

```
SABOTAJE 5a  dossier.ts: | { to: 'EVALUADA'; evaluacion: Evaluacion }
                       → | { to: 'EVALUADA'; evaluacion?: Evaluacion }
RESULTADO    ROJO (exit 1)
             TSError: Unable to compile TypeScript:
             src/lib/leados/dossier-stage.invariant.ts(222,1):
               error TS2578: Unused '@ts-expect-error' directive.
```

**Pata B — los guards de runtime**, leídos de la fuente real de `dossier.ts` y **acotados al
`case` que los contiene**. Acotar importa: el archivo está lleno de `throw new
DossierTransitionError`, así que buscar en el archivo entero daría verde sobre un `case`
vaciado. Misma granularidad que `acuse-recibo.invariant.ts`.

```
SABOTAJE 5b  En case 'DESCARTADA': se reemplaza el guard
               const evaluacion = EvaluacionSchema.safeParse(dossier.evaluacionJson)
               if (!evaluacion.success) { throw new DossierTransitionError(...) }
             por  const evaluacion = EvaluacionSchema.parse(dossier.evaluacionJson)
             (compila perfecto: tsc --noEmit sale 0 con el sabotaje puesto)
RESULTADO    ROJO (exit 1)
             AssertionError: EVALUADA→DESCARTADA perdió el guard del `evaluacionJson`
             VÁLIDO dentro de su `case`.
               Ese guard es lo que hace que el descarte no pise la evaluación: el case
               reescribe `evaluacionJson` con `{...evaluacion.data, motivoDescarte}`, así
               que sin verificar primero que lo que había parsea, un dossier con
               evaluacionJson corrupto o ausente termina con un blob que solo tiene el
               motivo — y el veredicto del Evaluador se pierde, sin error y sin forma de
               recuperarlo.
```

---

### Paso 4 · El runner, elegido con criterio

**`ts-node`, y la aserción 5 es el motivo.** C1b midió que los 19 de `ts-node` type-chequean y
los 24 de `tsx` no. Este invariante pone su aserción 5 en el compilador, así que con `tsx` sería
un adorno. Medido acá, no citado: con el **sabotaje 5a puesto**, el mismo archivo corrido con
`npx tsx` sale **0** e imprime su `✓ invariante OK`. Con `ts-node` sale 1 con el TS2578 de
arriba.

Se agregó a `package.json` con el prefijo `check:invariant:` y **el runner de C1a lo descubrió
solo** — no hubo que tocar ninguna lista:

```
Descubiertos 44 invariantes; corriendo 43 (sin cortar en el primer fallo)
...
✓ ok      check:invariant:dossier-stage                4392ms
──────────────────────────────────────────────────────────────────────────────
descubiertos 44  |  excluidos 1  |  corridos 43  |  pasaron 43  |  fallaron 0
──────────────────────────────────────────────────────────────────────────────
```

---

### Hallazgo al pasar, sin arreglar: un invariante que solo importe tipos no corre

Buscando cómo cargaba `ts-node` la aserción 5, apareció esto y conviene dejarlo escrito antes
de que muerda a alguien. Un archivo cuyos imports son **todos** `import type` se compila y
**type-chequea**, pero su cuerpo **nunca se ejecuta**: sale 0 y no imprime nada. Probado con un
`throw` de primer nivel que no explota.

```
archivo sin ningún import                → corre. TS2322 deliberado → exit 1
archivo con SOLO `import type`           → type-chequea (TS2322 → exit 1)
                                            pero el cuerpo NO corre: un `throw` de primer
                                            nivel sale 0 y en silencio
archivo con al menos un import de VALOR  → corre (vía la reparsa a ESM de Node 24) y
                                            type-chequea
```

Un invariante en ese estado sería un falso verde perfecto: exit 0, ninguna aserción evaluada.
**Se auditaron los 19 `.invariant.ts` de `ts-node`: los 19 tienen al menos un import de valor,
así que ninguno está en la trampa hoy.** El nuevo también (`node:assert`, `node:fs`,
`node:path` y el grafo), y se verificó que efectivamente **imprime** su línea de cierre, no
solo que sale 0. No se arregla nada porque no hay nada roto; queda como la razón por la que
un invariante nuevo tiene que probarse imprimiendo, no saliendo 0.

---

### Verificación

```
npx tsc --noEmit                → EXIT 0, sin salida
npm run check:invariants        → descubiertos 44 | excluidos 1 | corridos 43 |
                                  pasaron 43 | fallaron 0        EXIT 0
```

No se corrió `prisma generate` (no se tocó el schema en el commit) ni **ninguna operación sobre
la base** — tampoco `prisma migrate status`, que la habría tocado.

**El worktree de sabotaje se destruyó con la junction de `node_modules` desarmada primero**
(`cmd /c rmdir` sobre el enlace, que no toca el destino), verificando el conteo del
`node_modules` real antes y después: 760 entradas en los dos momentos. Tras revertir, el
`git status --porcelain` del worktree de sabotaje quedó vacío y el invariante volvió a verde
antes de borrarlo. `git worktree list` ya no lo lista y el directorio no existe. **Ningún
sabotaje sobrevivió.**

---

### Qué queda para la verificación humana

**Si el grafo censado es el que Franco quiere.** Este sprint congela el grafo tal como está, no
como debería estar. Si alguna transición no debería existir —o falta alguna—, es una decisión de
producto y va en otro sprint, con premortem. Lo que este invariante garantiza es que esa
decisión no se pueda tomar sin querer.

**Anotación para el rediseño.** Con esto puesto, el día que se toque el grafo para fusionar m1
y m2, la aserción 2 se va a poner en rojo. **Eso es lo que tiene que pasar**: obliga a decidir
explícitamente qué reemplaza a la garantía, en vez de perderla en silencio.

---

### Fuera de scope, anotado y no hecho

**`PISO_MINIMO` quedó con un renglón de holgura.** El runner de C1a descubre 44 y su piso sigue
en 43. Antes de C2 el piso era exacto; ahora alguien puede borrar un invariante y la corrida
sigue verde. Subirlo a 44 es una línea en `scripts/run-invariants.mjs`, pero eso es tocar el
gate y C1a está cerrado. Va en el próximo sprint que lo toque, junto con la regla que el propio
comentario del runner ya pide: el piso se mueve en el mismo commit que la cantidad.

**`esReloopRechazo()` codifica una arista del grafo y vive en otro archivo.**
`escalamiento.ts:56` devuelve `from === 'RECHAZADA' && to === 'CONSTRUCCION'` — exactamente la
arista 6. Hoy nada ata las dos cosas: si esa arista cambiara, la función seguiría compilando y
devolviendo `false` para siempre, y el re-loop dejaría de limpiar el self-check en silencio.
Atarlo es una aserción más y no estaba en el pedido de este sprint.

**`client-monthly-report-pdf` sigue excluido**, con el mismo motivo que dejó C1b.

---

### Microsprint aparte · el comentario de `ci.yml` que mentía

Commit propio, `7eeacdef`. El comentario decía que con Node 24 «los carga el type-stripping
nativo». Es falso: quien carga los `.ts` es el hook CJS de `ts-node` (`require.extensions`), que
además type-chequea. Subir de Node 20 a 24 destrabó el arranque; no reemplazó al compilador.

El riesgo era concreto y direccional: quien leyera «ya lo hace Node solo» podía sacar `ts-node`
«porque no hace falta», y con eso borrar en silencio el type-check de 20 invariantes — el modo
de falla que C0 predijo. Ahora el comentario dice qué pasa de verdad, nombra el caso que depende
de eso (la aserción 5 de este sprint) y actualiza el conteo que C2 movió: 20 con `ts-node`, 24
con `tsx`.

**El diff no toca ni una línea que no empiece con `#`** (verificado contando las líneas `+`/`-`
que no son comentario: cero). Los tres jobs siguen en `node-version: '24'` y el YAML parsea
igual. La verificación de que el gate sigue verde en Actions requiere un push, que este sprint
no hizo.

---

### Desvíos declarados

- El commit se hizo desde `C:/tmp/wt-v1-integracion`, que es el worktree que tiene chequeada
  `leados/v1-integracion` — mismo motivo que en C0, C1 y C1b. El checkout principal quedó en
  `main`, intacto.
- **Sin push.** Los dos commits (`c219d830` y `7eeacdef`) quedan locales, para que Franco decida
  cuándo dispara el gate.

---

## Sprint F1-VERIF — los dos bugs de datos, ya arreglados en la rama: verificación de punta a punta

**Qué pasó, y por qué este sprint no escribió una línea de código.**

El pedido traía dos defectos medidos con navegador real: la postergación que se guarda un día
antes, y el contador de DMs que sube al postergar. Los dos son ciertos y están reproducidos acá
abajo. Lo que el terreno agregó es que **ya estaban arreglados en la rama base**: los arregló F1
(`34e15156`, «la fecha de postergación es un día del calendario, y el contador cuenta mensajes»),
que entró a `leados/v1-integracion` por la integración del carril F (`cbfaa27f`).

Dónde siguen vivos: en `main`. `main` tiene `reactivateAt: z.coerce.date().optional()`
(`outreach.schemas.ts:58`), `contarDmsHoy` filtrando solo por canal (`outreach.ts:59-68`) y cero
apariciones de `parseCalendarDayAR`. La corrida visual que los encontró midió ese código.
Re-implementarlos sobre la rama habría sido escribir el mismo arreglo dos veces, así que el
sprint se convirtió en lo único que faltaba: **verificar que el arreglo cubre las cuatro
afirmaciones de cada bug, medido contra la base, no leído del diff.**

### La cadena de la postergación, censada — los tres consumos

El día que el setter elige entra por el date-picker de `seguimiento-form.tsx:166` (estado
`fechaReactivacion`), viaja como string crudo (`seguimiento-form.tsx:109`), lo valida
`ResultadoInputSchema` → `reactivateAtSchema` (`outreach.schemas.ts:59-62`), la action lo
desestructura y llama a `postergarLead` (`outreach.actions.ts:178,194-195`), que escribe
`status: POSTERGADO` + `reactivateAt` (`os-commercial.ts:181-192`). De ahí salen **tres** consumos,
no uno:

1. **La pantalla** — `formatFechaCorta(reactivateAt)` en `m5-seguimiento.tsx:90`, que formatea en
   huso de Buenos Aires (`flow.ts:259-265`).
2. **El foco** — `postergadoVencido` en `home.ts:54-57`: `reactivateAt.getTime() <= ahora`. Es lo
   que decide si el lead vuelve a ser trabajo, y alimenta `TRABAJO_TIER.ESPERA_TU_ACCION`
   (`flow.ts:677`).
3. **El cron** — `isReactivationLead` en `api/cron/os-follow-up/route.ts:112-118`:
   `reactivateAt <= endOfDay`, con `endOfDay` = 23:59:59.999 menos tres horas del día AR
   (`route.ts:57`). Es el que avisa «se reactiva hoy».

El diagnóstico «es el formateo» habría arreglado 1 y dejado 2 y 3 rotos. La raíz es tratar un día
de calendario como un instante, y ahí se corrigió.

### Medición de la fecha — escritura real, lectura desde la base

Camino de producción completo: parseo con el schema, después `postergarLead`, después `findUnique`
sobre Neon. Dos fechas distintas, una común y una de cambio de mes. El brazo ANTES usa el schema
tal cual está hoy en `main`. Estado del lead restaurado al terminar (verificado: `PROSPECTO` /
`null`).

| elige | rama | en la base | eso en AR | pantalla | cron el día previo | cron el día elegido |
|---|---|---|---|---|---|---|
| 2026-09-25 | `main` | `2026-09-25T00:00:00.000Z` | 24/09 21:00 | **24/9** | **LO REACTIVA** | lo reactiva |
| 2026-10-01 | `main` | `2026-10-01T00:00:00.000Z` | 30/09 21:00 | **30/9** | **LO REACTIVA** | lo reactiva |
| 2026-09-25 | rama | `2026-09-25T03:00:00.000Z` | 25/09 00:00 | 25/9 | no lo toca | LO REACTIVA |
| 2026-10-01 | rama | `2026-10-01T03:00:00.000Z` | 01/10 00:00 | 1/10 | no lo toca | LO REACTIVA |

Las cuatro afirmaciones del pedido quedan verdaderas en la rama, y las tres primeras falsas en
`main`. La cuarta —un lead ya postergado con el dato viejo sigue funcionando— se sostiene porque
el arreglo **no reinterpreta nada**: un `reactivateAt` sigue siendo un instante y se compara igual;
solo cambió quién lo construye.

**Sobre el patrón que el pedido señalaba para copiar.** El pausar de la cartera arma el instante
concatenando la fecha elegida con la hora `T23:59:59` y pasándosela a `new Date`
(`cartera.actions.ts:83`) — eso NO es fin del día argentino, es fin del día **del huso del
servidor**. En una máquina local en AR da la hora que el pedido describe; en Vercel (UTC) el mismo
código guarda 23:59:59 UTC, que en AR son las 20:59:59. No produce el corrimiento de un día porque
restar 3 horas a las 23:59 no cruza la medianoche, así que el bug queda tapado — pero el patrón es
dependiente del entorno. F1 no lo copió: ancló el día con `parseCalendarDayAR`
(`dates-ar.ts:107-130`), la misma regla «00:00 AR es 03:00 UTC del mismo día» que ya usaban
`startOfDayAR` y `startOfMonthAR`. Y el ancla al **arranque** del día es la correcta para el
consumo 2: con fin de día, `postergadoVencido` recién daría vuelta a las 23:59 del día elegido —
o sea, el lead volvería en la práctica al día siguiente. El patrón propuesto habría cambiado un
corrimiento por otro.

### Medición del contador — mismo camino de escritura que el panel

Filas creadas con `registrarContactoComercial`, contadas con las dos consultas (la de `main` y la
de la rama) después de cada paso. Las 6 actividades se borraron y los 2 leads se restauraron.

| paso | `main` | rama |
|---|---|---|
| punto de partida | 0 / 10 | 0 / 10 |
| postergo el lead A | **1 / 10** | 0 / 10 |
| postergo el lead B | **2 / 10** | 0 / 10 |
| registro un opener | 3 / 10 | **1 / 10** |
| registro un toque | 4 / 10 | **2 / 10** |
| el prospecto rechaza | **5 / 10** | 2 / 10 |
| el prospecto responde | **6 / 10** | 2 / 10 |

`main` reproduce exactamente lo reportado (0 → 1 → 2 sin mandar un solo mensaje). En la rama las
cuatro afirmaciones se cumplen: postergar no mueve, opener sí, toque sí, rechazar y responder no.

El filtro que separa contacto comercial de evento interno (`SOLO_CONTACTOS_COMERCIALES`,
`isolation.ts:116-118`, negativo: todo lo que no sea SISTEMA) **no se tocó** — sigue con su
definición y sigue alimentando el opener pendiente y el grupo del lead. El contador usa un filtro
distinto y aparte, `SOLO_MENSAJES_ENVIADOS` (`isolation.ts:142-144`), positivo por `result`.

### Los tests, demostrados fallando contra el código viejo

Los dos invariantes ya existen y ya están encadenados (`check:invariant:postergacion`,
`check:invariant:contador-dms`). Lo que faltaba era la demostración, y se hizo restaurando los
archivos pre-F1 desde `34e15156^` y corriendo cada uno:

- **postergación** — con `outreach.schemas.ts` pre-F1: `AssertionError: 2099-08-25: guardado ==
  elegido (día AR)`, actual `2099-08-24`, esperado `2099-08-25`. Exit 1.
- **contador** — con `isolation.ts` y `outreach.ts` pre-F1: `AssertionError: el where del conteo
  filtra por resultado, no solo por canal`, actual `undefined`, esperado
  `{ result: 'SIN_RESPUESTA' }`. Exit 1.

Los tres archivos se restauraron desde respaldo y se verificaron por md5 idénticos al original;
`git status` quedó limpio.

### Un falso verde encontrado en el camino (no se tocó)

Sonda: dejar `isolation.ts` **arreglado** y revertir solo el `where` de `contarDmsHoy`
(`outreach.ts:63-73`) al de `main`. Resultado: `check:invariant:contador-dms` **pasa en verde** y
`npx tsc --noEmit` sale **0**. El invariante afirma sobre el fragmento `where` y sobre una réplica
in-memory del filtro, no sobre la consulta real; el fragmento puede quedar exportado y sin usar sin
que nada avise. O sea: el bug reportado podría volver a entrar entero por ese archivo con el gate
verde. Es el patrón de falso verde que ya está registrado en el repo, y queda **anotado, no
arreglado** — tocar el invariante estaba fuera de alcance.

### Postergaciones con el desvío — contadas, no migradas

Consulta usada: todos los `OsLead` con `reactivateAt` no nulo, marcando los que caen en medianoche
UTC exacta (`getUTCHours`, `getUTCMinutes`, `getUTCSeconds` y `getUTCMilliseconds` todos en 0) — la
firma que deja `new Date` sobre un `YYYY-MM-DD` y que un instante real no produce por casualidad.

En la base de desarrollo: **4 filas con `reactivateAt`, 0 con el desvío**. Las dos POSTERGADO
viejas están a las 13:00Z y las dos QA a las 23:xxZ — todas instantes reales. En producción el
número es **desconocido**: este sprint no se conectó a la base de producción. Nada se migró.

### Los otros `z.coerce.date()` sobre fecha sin hora — listados, sin tocar

- `admin/projects/_actions/project.schemas.ts:23` → `estimatedEndDate`, alimentado por dos
  date-pickers (`project-form.tsx:297`, `convert-lead-dialog.tsx:242`). **Mismo bug, vivo.**
- `admin/team/_actions/time-entry.schemas.ts:33-34` → `date`, `from`, `to`, alimentado por
  `time-entry-panel.tsx:252`. **Mismo bug, vivo.**
- `admin/leads/_actions/lead.schemas.ts:40` → `optionalReactivateAtSchema`. Hoy **no** está
  afectado: quien lo alimenta manda un instante real (`Date.now()` más N días,
  `change-status-select.tsx:42` y `lead-pipeline.tsx:127`). La trampa queda armada para el día que
  alguien le enchufe un date-picker.

### Gates

`npx tsc --noEmit` exit 0 · invariantes **43/43** (44 descubiertos, 1 excluido por necesitar DB) ·
`npm run build` exit 0 · `prisma migrate status` al día, 86 migraciones, sin drift.

### Desvíos declarados

- **Cero líneas de código escritas.** El sprint pedía arreglar dos bugs que la rama base ya tenía
  arreglados. Se verificó en vez de re-implementar.
- **Cero commits de código.** Este bloque de bitácora es lo único que se agrega.
- Se hicieron escrituras reales en la base de desarrollo para medir (2 leads, 6 actividades),
  todas revertidas y verificadas revertidas en la misma corrida.
- Trabajado desde `C:/tmp/wt-v1-integracion`. El checkout principal quedó en `main`, intacto.
- Sin push.

---

## Sprint V1-A-MAIN — la rama a salvo y el merge a main preparado, sin pushear a main

Cuatro sprints de trabajo (el gate en CI, los 43 invariantes, los cuatro falsos verdes, F1, F2, F3)
vivían en `leados/v1-integracion` y `main` no los tenía. Además la rama tenía **5 commits sin
pushear**: todo eso existía en un solo disco. Este sprint pone la rama a salvo, prepara el merge en
una rama de integración aparte y lo verifica. **El push a main es de Franco.**

### El terreno (Fase 0)

| ref | hash |
|-----|------|
| `leados/v1-integracion` (local) | `b3ea27db` |
| `origin/leados/v1-integracion` (antes del sprint) | `3f636437` |
| `main` (local) | `17727117` |
| `origin/main` | `17727117` |

Distancias: la rama estaba **5 adelante / 0 atrás** de su propio origin, y **18 adelante / 0 atrás**
de `origin/main`. `main` local y `origin/main` en **0 y 0**.

El dato que reencuadra todo el sprint: **merge-base(`origin/main`, rama) == `origin/main` ==
`17727117`**. `origin/main` es ancestro de la rama — no se movió desde la integración anterior. El
merge no es un merge: es un **fast-forward**. No hay conflicto que resolver, ni de código ni de
bitácora.

Cambios ajenos sin commitear: `docs/` sin trackear en el checkout principal (no está en el repo; no
se tocó) y un `png.zip` sin trackear en `wt-v1-integracion`. Doce worktrees vivos, dos stashes: nada
de eso se tocó.

### La rama, a salvo (paso 1 — el que solo ya justificaba el sprint)

Push con refspec explícito de `refs/heads/leados/v1-integracion` a la rama homónima:
`3f636437..b3ea27db`, exit 0. Verificación: `rev-list --left-right --count` contra
`origin/leados/v1-integracion` da **0 y 0**, mismo hash de los dos lados. Los cuatro sprints dejaron
de vivir en un solo disco.

### Diagnóstico del merge, sin mergear (paso 2)

`git merge-tree --write-tree origin/main leados/v1-integracion` → exit 0, una sola línea de salida
(el árbol) y **0 conflictos**. El árbol que produciría, `9f68b9d5`, es **idéntico** al árbol de la
rama: fast-forward puro. `origin/main` aporta **0 commits** que la rama no tenga, así que ninguno
toca `setter/`, `lib/leados/` ni `prisma/` — no hay nada que tocar.

`prisma/` tiene el **mismo hash de subárbol** en los dos lados (`eabeec30`): el merge no trae schema
ni migraciones. Por eso no corresponde `prisma generate`.

### El merge, en rama de integración aparte (paso 3)

`main` no se tocó. Se creó `leados/v1-a-main` desde `origin/main` con `--no-track` — un branch que
trackea `origin/main` convierte un push pelado en un push a main — y se mergeó ahí, en un worktree
propio en `C:/tmp/wt-v1-a-main`. El worktree `wt-v1-integracion` quedó intacto.

Resultado: **fast-forward a `b3ea27db`**, árbol de trabajo limpio, **0 marcadores de conflicto** en
todo el árbol.

### Los ocho chequeos de la bitácora

No hubo conflicto, así que no hubo resolución que verificar. Se corrieron igual sobre el archivo,
porque la bitácora es lo que más se toca en las dos ramas:

| chequeo | resultado |
|---|---|
| bitácora del resultado vs la de la rama | **0 líneas de diff** — idéntica |
| líneas borradas respecto de `origin/main` | **0** |
| `origin/main` sobrevive en orden dentro del resultado | **sí**, subsecuencia exacta |
| ninguna línea de `origin/main` falta (multiset) | **0 ausentes** |
| ninguna línea de la rama falta (multiset) | **0 ausentes** |
| líneas que no vienen de ningún lado | **0** |
| secciones de segundo nivel | `origin/main` 84 · rama 97 · resultado **97** |
| marcadores de conflicto sobrevivientes | **0** |

De 4.313 líneas a 6.372, todo agregado, nada perdido. Las entradas se insertan cronológicamente, no
al final: por eso el prefijo no coincide y la prueba correcta es la de subsecuencia, no la de
prefijo.

### Los cuatro gates, sobre el resultado

| gate | exit | resultado |
|---|---|---|
| `npx tsc --noEmit` | **0** | 0 líneas de salida |
| `npm run check:invariants` | **0** | 44 descubiertos, 1 excluido con motivo, **43 corridos / 43 pasaron / 0 fallaron** |
| `npm run build` | **0** | sin errores |
| `npx prisma migrate status` | **0** | al día, 86 migraciones, sin drift |

Los 43, por nombre: `check:invariant`, `setter-meta`, `escalamiento`, `novedades`, `mis-numeros`,
`timeline`, `foco`, `particion`, `flow`, `alta-propia`, `prospecto-import`, `gate-envio`,
`self-check`, `progreso`, `reloop-selfcheck`, `manual`, `pantallas`, `turno`, `postergacion`,
`contador-dms`, `acuse`, `dossier-stage`, `security`, `lead-scoring`, `dates-ar`, `lead-status`,
`home-metrics`, `lead-detail`, `recommendations`, `gbp-connection`, `modules`,
`motor-resenas-view`, `upsell-dedup`, `announcements`, `referrals`, `client-notifications`,
`executive-report-plan`, `executive-report-prefs`, `brief-input`, `client-monthly-report`,
`notifications-brevo`, `mask-secret`, `cron-secret`.

Nota sobre el gate 4: en el worktree nuevo salió **exit 1** por `P1012 — Environment variable not
found: DATABASE_URL`. No es drift: los archivos de entorno están ignorados y viven solo en el
checkout principal. Como `prisma/` es **idéntico byte a byte** entre los dos lados, se corrió en el
checkout principal, que es el mismo árbol de schema y de migraciones. Verde. El checkout principal
quedó como estaba.

### Que no se perdió nada (paso 5)

- Commits de `origin/main` ausentes del resultado: **0**.
- Commits de `leados/v1-integracion` ausentes del resultado: **0**.
- Diff total resultado vs rama de trabajo: **0 líneas**, mismo árbol `9f68b9d5`.
- Contra `origin/main`: 18 archivos bajo `src/`, +1.462 / −69.

### F1, F2 y F3 — por contenido, no por mensaje de commit

- **F1-a, la postergación es un día de calendario.** `parseCalendarDayAR` en `src/lib/dates-ar.ts`
  ancla un día ISO a las 03:00Z (medianoche AR) y valida el round-trip contra los componentes
  pedidos, porque `Date.UTC` normaliza los desbordes en vez de fallar. Lo consume
  `reactivateAtSchema` en `outreach.schemas.ts`, un `z.preprocess` que reemplazó al
  `z.coerce.date()` pelado y que pasa de largo lo que ya es instante — el preprocess corre dos veces
  sobre el mismo dato y la segunda no vuelve a mover el día.
- **F1-b, el contador cuenta mensajes.** `SOLO_MENSAJES_ENVIADOS` en `isolation.ts` filtra por
  `result: SIN_RESPUESTA`, y `contarDmsHoy` en `outreach.ts` lo suma a su `where`. Sin ese filtro
  contaba toda fila del canal: postergar un contacto, que no manda nada, subía el número igual.
- **F2, el motivo acompaña la corrección.** `CamposDelRechazo` en `guia-retrabajo.tsx` renderiza
  qué / dónde / detalle / arreglo; `_data.ts` parte el historial una sola vez y expone `rechazo` y
  `rechazosPrevios`; el paso del manual monta `GuiaRetrabajo` con el gate exacto por stage
  (`rechazo` no nulo y stage en `RECHAZADA` o `CONSTRUCCION`).
- **F3, el acuse de recibo.** `src/lib/leados/acuse-recibo.invariant.ts` existe, está encadenado
  como `check:invariant:acuse` y **corrió verde en el gate 2** (4.338 ms). Mira el call-site y no el
  archivo, que es lo que hace la diferencia entre una red y un adorno.

### Las suites de test — no se corrieron, y por qué

`test:leados` y `test:setter` cargan `.env.local` por dotenv y necesitan la base: `test:setter` usa
Prisma para **seed y teardown**. Este sprint tiene prohibida toda operación sobre la base de datos,
y además no existe ningún `.env.test` en el repo ni archivos de entorno en el worktree nuevo. No se
corrieron y no se inventan.

### Desvíos declarados

- **No se pusheó a main.** `main` local sigue en `17727117`, igual que `origin/main`.
- **Cero cambios de contenido fuera de esta bitácora.** El merge fue fast-forward: ningún archivo se
  editó a mano.
- La rama de integración queda un commit por delante de la rama de trabajo, y ese commit es este
  bloque de bitácora.
- Trabajado desde `C:/tmp/wt-v1-a-main`, worktree propio. El checkout principal quedó en `main`,
  intacto. `wt-v1-integracion`, los worktrees de F1/F2/F3 y los dos stashes no se tocaron.

### Lo que queda para el humano

El push a main, con este comando exacto:

    git push origin refs/heads/leados/v1-a-main:refs/heads/main

Es un fast-forward sobre `17727117`. Después de eso, la corrida de CI sobre `main` — va a ser la
primera vez que el gate corre sobre la rama que importa, y el día que suba, los dos bugs de datos
dejan de estar vivos donde corren las corridas.

---

## Sprint CALLEJONES — tres pantallas que nombraban una salida y no la ofrecían — 2026-08-26

Base: `leados/v1-a-main` @ `d167df16`. Rama de trabajo `fix/callejones`, worktree propio en
`C:/tmp/wt-callejones`, distDir `.next-callejones`, puerto 3007. No se pusheó nada.

### Fase 0 — la base no era `main`

El pedido decía «base: `main` con todo lo construido, gate corriendo, 43 invariantes verdes». En
`main` (`17727117`) eso no existe: no hay workflow en la raíz que Actions lea, `check:invariants`
sigue siendo la cadena escrita a mano y `scripts/run-invariants.mjs` no está. El único árbol donde
las tres condiciones se cumplen es `leados/v1-a-main`, que es `main` + 19 commits (F1, F2, F3, C0,
C1, C1b, C2, las 47 y las 52 capturas) y que la bitácora anterior deja listo para un fast-forward
que **todavía no se hizo**. `main` es ancestro estricto de esa rama, así que basarse ahí no descarta
nada de `main`. Se trabajó sobre `leados/v1-a-main` y se declara acá.

Sobre esa base, antes de tocar nada: `npx tsc --noEmit` exit 0; `npm run check:invariants`
**descubiertos 44 · corridos 43 · pasaron 43 · fallaron 0**.

Y los tres callejones se verificaron VIVOS operando la aplicación, no leyendo código — build de
producción en `.next-callejones`, `next start -p 3007`, sesión por `POST /api/qa/login` como
`setter-qa@develop.test`, y leads QA que **ya existían** en la branch Neon dev (no se sembró nada).

### Callejón 1 · El error del borrador, crudo y en el campo equivocado

**Por qué se descartaba el mensaje en castellano.** No es traducción: es el mapa de errores de zod.
En `node_modules/zod/v3/types.js:55-67`, `processCreateParams` arma un `customMap` que aplica el
`message` de los create-params **solo** en tres casos: `invalid_enum_value`, dato `undefined`, o
`invalid_type`. La línea 63 es la que mata: para cualquier otro code devuelve `ctx.defaultError`. Un
interruptor sin tildar manda `false` —definido, no `undefined`— y `z.literal(true)` falla con
`invalid_literal`. Ninguno de los tres casos: el mensaje escrito se tiraba y salía el default en
inglés.

Medido contra el schema real, antes de tocarlo:

    ### URL válida + checkbox SIN tildar (false)
      code = invalid_literal   path = ["confirmoCarga"]
      message = "Invalid literal value, expected true"
    ### URL válida + checkbox ausente (undefined)
      code = invalid_literal   path = ["confirmoCarga"]
      message = "Abrí el link en otra pestaña y confirmá que carga antes de guardar"

Ahí está la trampa que explica la auditoría: el castellano **sí** salía, pero solo por el camino
`undefined`, que la UI nunca produce. Cualquier prueba que mirara ese caso pasaba en verde sobre el
bug.

**Por qué el error se colgaba del campo de URL.** El `path` del issue ya decía `confirmoCarga`. Lo
que faltaba era no tirarlo: `borrador-form.tsx:34` hacía `setError(parsed.error.issues[0]?.message)`
— un string plano, sin path — y ese string alimentaba el `Field` de la URL y su `Input`. Medido en
el navegador: el input de URL con `aria-invalid="true"` y `aria-describedby` apuntando al error, y
el interruptor con `aria-invalid`, `aria-describedby` y `aria-required` en `null`. El asterisco
estaba en «URL del borrador» y en el interruptor no había ninguno: lo obligatorio marcado como
opcional, y al revés.

**Los otros validadores con el mismo patrón — listados, sin tocar.** Censo de todo `src/`: hay
**4** usos de create-params con `message` y **1 solo** cae en la clase rota — el de este sprint.

| archivo:línea | factory | code de la falla | ¿sobrevive el mensaje? |
|---|---|---|---|
| `setter/_actions/dossier.schemas.ts:75` | `z.literal()` | `invalid_literal` | **NO** — el arreglado |
| `setter/_actions/dossier.schemas.ts:23` | `z.enum()` | `invalid_enum_value` | sí |
| `setter/_actions/outreach.schemas.ts:71` | `z.enum()` | `invalid_enum_value` | sí |
| `api/admin/chatbot/test-prompt/route.ts:19` | `z.object()` | `invalid_type` | sí |

El repo además **ya tenía escrito el idioma correcto** en tres lugares —
`admin/clients/_actions/plan.schemas.ts:6` y `dashboard/_actions/executive-report-prefs.schemas.ts:9`
y `:15` usan un `errorMap` que devuelve el mensaje, y `processCreateParams` lo devuelve tal cual
(línea 53-54), por eso aplica a TODOS los codes. El arreglo adopta ese idioma, no inventa uno.

**El arreglo.** Tres archivos:

- `dossier.schemas.ts` — `message` pasa a `errorMap`. El tipo inferido sigue siendo el literal `true`.
- `Toggle.tsx` — tres props ADITIVAS (`required`, `invalid`, `describedBy`) para que un interruptor
  pueda ser el control que falla. Ningún call site existente cambia (11 usos, todos intactos).
- `borrador-form.tsx` — los errores pasan de un string plano a un objeto por control, ruteado por
  `issue.path[0]`. El error del server, que no trae path, va al pie — nunca al campo de URL.

**Verificación operando la app.** Mismo recorrido, misma pantalla (`M0-GAL 21-m13-borrador-vacio`,
CONSTRUCCION sin borrador): URL válida, «Guardar borrador» sin tocar el interruptor.

| lo que ve el setter | antes | después |
|---|---|---|
| mensaje | `Invalid literal value, expected true` | `Abrí el link en otra pestaña y confirmá que la demo carga — sin eso no se guarda` |
| input URL `aria-invalid` | `"true"` | `null` |
| input URL borde rojo | sí | no |
| interruptor `aria-invalid` | `null` | `"true"` |
| interruptor `aria-required` | `null` | `"true"` |
| interruptor `aria-describedby` | `null` | apunta al error, en castellano |
| asteriscos | solo en «URL del borrador» | en los dos campos |

### Callejón 2 · La pantalla del borrador congelada tras un rechazo

**Censo, con archivo:línea.** El corte está en `m13-borrador.tsx:79`: con stage distinto de
CONSTRUCCION y borrador publicado devuelve el resumen de consulta — link + «El borrador ya quedó
publicado», sin un solo control. RECHAZADA cae ahí. En CONSTRUCCION cae en `BorradorForm`, que en su
estado verificado (`borrador-form.tsx:53-85`) sí ofrece «Cambiar el link del borrador».

Medido en el navegador sobre `QA-W Rechazada` — cuyo rechazo sembrado dice, textual: *«Arreglo:
Reemplazá los textos por las reseñas reales del negocio (están en la ficha) y re-publicá el draft»*
— la zona de Registro devolvió `"botones": []`. Cero.

**El desvío, declarado.** El pedido decía «no hay que construir nada: hay que dejarlo visible».
Mostrar «Cambiar el link del borrador» en RECHAZADA se probó contra el motor y **no funciona**:
`dossier.ts:288` (`saveOwnedDraftUrl`) tiene un guard duro que tira `DossierTransitionError` si el
stage no es CONSTRUCCION, así que el botón rebotaría siempre. Sería el mismo callejón con un paso
más, justo lo que el paso 3 del pedido prohíbe. Ensanchar ese guard es habilitar un camino de
escritura nuevo, que la regla 3 también prohíbe. Y sería un dead end de todos modos: el único camino
de vuelta a EN_REVISION es RECHAZADA → CONSTRUCCION → EN_REVISION, así que un link cambiado sin
reabrir queda sin forma de reenviarse.

Lo que se hizo, entonces, es literalmente **mostrar un control que ya existe**: `ReabrirConstruccion`
— la misma action de siempre, la única transición legal de vuelta — pasa a estar también en la
pantalla del borrador, con el texto que faltaba. Un clic, y la misma pantalla ofrece cambiar el
link. Después de F2 la nota de Franco sobrevive a la reapertura, así que reabrir ya no cuesta el
pedido.

**Ninguna transición cambió.** `git diff -- src/lib/leados/dossier-stage.ts` sale **vacío**.
`LEGAL_TRANSITIONS` intacto. Actualizar el link del borrador nunca movió el stage y sigue sin
moverlo: `saveOwnedDraftUrl` escribe `draftUrl` con un `updateMany` filtrado por stage y no toca
`stage` — el test lo afirma releyendo el dossier de la base después del arreglo.

**Verificación operando la app.** `QA-W Rechazada`, `/manual/m13`: `"botones": ["Reabrir
construcción"]`, el link viejo sigue a la vista, y la pantalla dice qué hacer.

### Callejón 3 · El chequeo final se nombraba y no se linkeaba

**Censo.** Durante la construcción el chequeo final se nombra en dos pantallas:

- `borrador-form.tsx:70` (m13, estado verificado) — «…el chequeo final se hace siempre sobre el
  borrador vigente».
- `m-construccion.tsx:184` (mc1/mc2) — «El único chequeo que gatea es el final».

Ninguna enlazaba. El mecanismo: el chip de navegación sale de `NavAtras` (`manual-nav.tsx:172`), que
recorre **solo `posicion.completadas`**, y `completadasDe` (`manual.ts:462`) marca m14 recién con
`STAGES_POST_CHEQUEO`, o sea EN_REVISION y APROBADA. En CONSTRUCCION m14 está en `habilitadas`, y
ninguna nav recorre esa lista. Resultado: el link aparece cuando el chequeo ya se hizo. La asimetría
estaba a la vista — m14 **sí** enlaza a m13 (`m14-chequeo.tsx:127`), la vuelta no existía.

Medido: `"linksAM14": []` en m13, mc1 y mc2.

**El arreglo.** `enlace-chequeo.tsx`, fuente única del salto y de su gate. Con borrador publicado
lleva a m14. **Sin borrador no ofrece el chequeo**: m14 no está habilitada y la guardia del server
redirige en silencio — otro callejón con más pasos. Ahí el enlace dice «el chequeo final — se abre
cuando publiques el borrador» y lleva a m13, donde se resuelve.

**Verificación operando la app.** `QA-W Construccion` (borrador publicado, fases a medias): m13, mc1
y mc2 devuelven un enlace con texto «el chequeo final» y href a `/manual/m14`.

### Los tres tests, demostrados fallando contra el código viejo

**1 · `check:invariant:draft-url-mensaje`** — invariante puro, sin DB ni server, descubierto solo por
el runner. La aserción central **no depende de la redacción**: el mismo campo, fallando por la misma
razón, tiene que decir lo mismo con `false` que con `undefined`. Contra el código viejo:

    AssertionError: el mensaje sigue siendo el default en inglés de zod:
    "Invalid literal value, expected true"          (exit 1)

**2 y 3 · `tests/setter/15-callejones-borrador-chequeo.spec.ts`** — tres pruebas contra el build de
producción. Se revirtió el código de producción, se reconstruyó, y las tres dieron rojo:

    x 1 Callejón 2 · el borrador rechazado deja de ser una pantalla muda
        Expected substring: "reabrí la construcción"
        Received: "…Registro https://smoke-callejones-draft.netlify.app
                   El borrador ya quedó publicado — desde acá se hizo el chequeo final…"
    x 2 Callejón 3 · cada mención del chequeo final durante la construcción enlaza a él
        m13 enlaza al chequeo final — Expected: 1   Received: 0
    x 3 Callejón 3 · sin borrador el enlace dice qué falta en vez de rebotar

Un detalle del seed que importa: el lead de la prueba 2 lleva las fases **a medias** a propósito. Con
las seis tildadas, `posicionDe` pone `actual` en m14 y la pantalla saca sola un «Ir a tu paso actual»
que apunta ahí — un atajo genérico que tapaba el hallazgo. Con el checklist incompleto —el estado
normal de quien acaba de publicar el borrador— el único enlace posible a m14 es el que este sprint
agrega.

### Cierre

- `npx tsc --noEmit` → **exit 0**.
- `npm run check:invariants` → **descubiertos 45 · excluidos 1 · corridos 44 · pasaron 44 ·
  fallaron 0**. Los 43 de la base siguen verdes; el 44º es el nuevo. El piso (43) no se tocó.
- `npm run build` → **exit 0**.
- `test:setter` (suite completa, contra el build de producción en 3007) → **65 passed**: las 62
  previas más las 3 nuevas. Cero regresiones.
- `test:leados` → **25 passed**.
- `prisma generate`: no corresponde — el schema no se tocó.
- Ningún invariante existente se modificó: `git status` sobre los `.invariant.ts` muestra solo el
  nuevo, como archivo sin trackear.
- El gate y el workflow, intactos: `git status` sobre `.github/` y `scripts/run-invariants.mjs` sale
  vacío. Lo único que cambió en `package.json` es una línea, el script del invariante nuevo — que es
  la vía de extensión que el propio runner documenta: «un script nuevo entra solo».

### Desvíos y hallazgos fuera de scope

- **La base fue `leados/v1-a-main`, no `main`** — ver Fase 0.
- **Callejón 2 se resolvió con la reapertura, no con el editor del link** — ver arriba, con el motivo
  y la línea del motor que lo impone.
- **Ninguna operación sobre la base de datos** para armar los casos: los leads QA ya existían. Las
  escrituras que hubo son las que hace la propia app al operarla (guardar un borrador, reabrir la
  construcción) y las de seed/teardown de la suite de tests al correrla.
- **Fuera de scope, anotado sin tocar:** en m13 con el lead RECHAZADA, la Munición sigue diciendo
  «Copiá la URL que te da Netlify y pegala acá abajo» — el texto sale de `GUIA_DRAFT.pasos`, que es
  compartido y en CONSTRUCCION es correcto. Con el arreglo el botón de reabrir queda justo debajo,
  pero la frase sigue prometiendo un campo que en ese estado no existe.
- **Fuera de scope, anotado sin tocar:** el toast «Borrador guardado — ahora pasá el chequeo final»
  (`borrador-form.tsx:45`) nombra el chequeo y no puede llevar un enlace. Queda mitigado porque tras
  guardar la pantalla se refresca al estado verificado, que ahora sí lo enlaza.
- **No se pusheó a main.** `main` local sigue en `17727117`, igual que `origin/main`. La rama
  `fix/callejones` no tiene upstream configurado.

### Lo que queda para la verificación humana

Que los textos nuevos suenen como el resto del producto — ningún test lo valida. Son cuatro: el
mensaje del interruptor, el párrafo del borrador congelado, y las dos formas del enlace al chequeo.
Y que el recorrido completo, de punta a punta, ya no tenga callejones — eso se prueba recorriéndolo,
y es de la corrida de comportamiento pendiente.

---

## Sprint MUNICIONES — qué se pliega, qué no, y qué promete cada título — 2026-08-26

Base: `fix/callejones` @ `a2004edb` — que es `leados/v1-a-main` @ `d167df16` + un commit. Rama de
trabajo `fix/municiones`, worktree propio en `C:/tmp/wt-municiones`, distDir `.next-municiones`,
puerto 3021. No se pusheó nada.

### Fase 0 — por qué la base no fue `leados/v1-a-main` a secas

El pedido dice «base: `leados/v1-a-main`, el único árbol con el gate», y después pide cerrar **los
dos pendientes que dejó P3**. Los dos pendientes son de P3: uno vive en la munición de la pantalla
que P3 arregló (m13 en RECHAZADA), el otro en el toast del formulario que P3 tocó. Sobre
`leados/v1-a-main` esos arreglos no existen todavía.

`fix/callejones` es `leados/v1-a-main` + 1 commit, cero atrás — un superconjunto estricto, con el
mismo gate y los mismos 44 invariantes. Basarse ahí no descarta nada de la base pedida y es la única
manera de cerrar pendientes de un sprint sin el sprint. Se declara acá; la bitácora de P3, además,
deja los dos pendientes escritos palabra por palabra en su sección de hallazgos fuera de scope.

Terreno, antes de tocar nada:

- `git status --porcelain` en el checkout principal: solo `?? docs/` — **cambios ajenos, no se
  tocaron**. `git stash list`: dos stashes viejos (`redesign/home`, `fix/home-sanidad`), ajenos.
- Trece worktrees vivos; ninguno en `/c/tmp/wt-municiones`. Ningún puerto 300x–302x escuchando: no
  había otra sesión sirviendo.
- `npx tsc --noEmit` → **exit 0**.
- `npm run check:invariants` → **descubiertos 45 · excluidos 1 · corridos 44 · pasaron 44 ·
  fallaron 0**.
- `npm run test:leados` → **25 passed**.
- `npm run build` (aislado) → **exit 0**; `test:setter` (suite completa) → **65 passed**.

---

### Paso 1 · El censo

Veinte bloques de munición en las once pantallas del manual, más las dos piezas compartidas que los
dibujan. Las líneas son las de la base (`a2004edb`).

| Pantalla | Título visible | Tipo | ¿Plegado hoy? | ¿El título promete? | ¿Contiene una salida? |
|---|---|---|---|---|---|
| m1 | «Ver ejemplo de una ficha bien hecha» (`ejemplo-ideal.tsx:80`) | Ejemplo | **Sí** | Sí — el estándar | No |
| m2 | «Chat de evaluación (Sonnet)» + píldora (`tool-guide.tsx:60-65`) | Herramienta | No | — (no es plegable) | — |
| m2 | «Qué es y cómo se usa» (`tool-guide.tsx:68`) | Fundamento | **Sí** | **NO** | **SÍ — la del link pendiente** |
| m2 | «Qué se mira en la evaluación (y por qué importa)» (`m2-evaluador.tsx:89`) | Fundamento | No | Sí | No |
| m4 | «Gem de outreach» + píldora | Herramienta | No | — | — |
| m4 | «Qué es y cómo se usa» | Fundamento | **Sí** | **NO** | **SÍ** |
| m4 | «Canal Instagram — hoy» + aviso (`canal-seguridad.tsx:29-41`) | Guardrail | No | — | No |
| m4 | «Disciplina de canal y ritmo de arranque» (`canal-seguridad.tsx:44`) | Fundamento | **Sí** | Sí | No |
| m5 | «Mensaje base del toque N de 3» (`m5-seguimiento.tsx:163`) | Material | No | Sí | No |
| m5 | «Canal Instagram — hoy» + su plegable | Guardrail / Fundamento | parcial | Sí | No |
| m5 | «No cotizás ni negociás» + guion (`guardrail-rol.tsx:28`) | Guardrail / Material | No | Sí | No |
| m5 | «¿Te tiraron una objeción? Armá el input del Gem» (`m5-seguimiento.tsx:180`) | Ejemplo + herramienta | **Sí** | Sí | **NO, y le falta** |
| m6 | «Gem de diseño» + píldora | Herramienta | No | — | — |
| m6 | «Qué es y cómo se usa» | Fundamento | **Sí** | **NO** | **SÍ** |
| mc1/mc2 | «Guía preliminar — en validación» (`badge-provisorio.tsx`) | Guardrail | No | — | No |
| mc1/mc2 | Los 3 bloques de fase + sus prompts (`m-construccion.tsx:76-117`) | Instructivo + Material | No | Sí | No |
| mc1/mc2 | «Claude Design» + píldora | Herramienta | No | — | — |
| mc1/mc2 | «Qué es y cómo se usa» | Fundamento | **Sí** | **NO** | **SÍ** |
| **mr** | **— sin zona de munición** (`page.tsx:273-303`) | — | — | — | **NO, y le falta** |
| m13 | Encuadre de publicar (`GUIA_DRAFT.intro`) | Fundamento | No | — | No |
| m13 | «Netlify Drop» + «Abrir Netlify Drop» | Herramienta | No | — | — (tiene link) |
| m13 | «Qué es y cómo se usa» | Fundamento | **Sí** | **NO** | No (sin pared) |
| m13 | Los 4 pasos (`GUIA_DRAFT.pasos`) | Instructivo | No | — | No — **pero miente en RECHAZADA** |
| m14 | «¿Por qué importa?» (`teach-panel.tsx:135`) | Fundamento | **Sí** | **NO** | No |
| m14 | «Ver ejemplo de un chequeo final bien hecho» (`ejemplo-ideal.tsx:112`) | Ejemplo | **Sí** | Sí | No |
| m15 | El porqué del momento (`GUIA_ENVIO.intro`) | Fundamento | No | — | No |
| m16 | El how-to del paso (`GUIA_AGENDA.intro` + `pasos`) | Fundamento + Instructivo | No | — | No |

`espera`, `revision` y `archivo` son pantallas de estado: no tienen zona de munición. No entran.

**La columna que más importa.** El caso conocido no era el único, pero tampoco eran muchos: la salida
es **una sola**, y vive en un solo lugar del código (`tool-guide.tsx:73-77`). Lo que se multiplicaba
era dónde se renderizaba plegada.

### Cuántas salidas estaban plegadas, y dónde

**Cinco pantallas.** `m2` (Chat de evaluación), `m4` (Gem de outreach), `m6` (Gem de diseño), `mc1` y
`mc2` (Claude Design): las cuatro herramientas cuyo `url` sigue en `null` en el registro. En las
cinco el texto estaba en el DOM, dentro de un `<details>` cerrado titulado «Qué es y cómo se usa».

**Y dos pantallas donde la salida no existía en absoluto**, que es peor que plegada:

- **m5** — la píldora sale suelta («Abrí el Gem para pegarlo:») dentro del bloque de objeciones, sin
  `ToolGuide` y por lo tanto sin salida de ningún tipo.
- **mr** — no llena el slot de munición. Sirve el bloque copiable de Claude Design (su contexto, el
  mismo de mc1/mc2) y ahí termina: ni lanzador, ni qué esperar, ni salida.

Total: **siete lugares del recorrido donde el setter puede chocar con la pared, y cero donde la
respuesta se leía sin abrir un plegable.**

### La cuarta categoría — tres, en realidad

Tres familias del censo no entran limpio en salida / ejemplo / fundamento, y forzarlas sería mentir:

1. **Instructivo** — el how-to mecánico numerado de la tarea: los 4 pasos de m13, los de m16, los
   items de cada fase de Construcción. No es un porqué, no es un modelo de resultado y no destraba
   nada: es la secuencia de la tarea misma.
2. **Material** — lo que se *lleva* a la herramienta, no lo que se lee: los `CopyBlock` (ficha,
   brief, construcción, objeciones), la plantilla del toque de m5, los prompts de diseño, el guion
   fijo de precio. Es carga útil, no explicación.
3. **Guardrail** — un límite vivo: el contador de DMs de `CanalSeguridad` (cuyo texto cambia con el
   número), la regla de rol, y el badge «Guía preliminar — en validación», que es un descargo sobre
   la madurez de la guía misma.

Ninguna de las tres está plegada hoy, así que la regla «una salida nunca se pliega» no las toca. La
regla del título sí aplica a los plegables que viven adentro — y el único que hay
(`CanalSeguridad`) ya cumplía.

---

### Paso 2 · Las salidas, a la vista

**Una sola fuente para las siete pantallas.** La línea sale de `ToolGuide` a un componente propio,
`SalidaLinkPendiente`, que se renderiza **fuera de todo plegable** y devuelve `null` cuando la
herramienta sí tiene link. Así la salida no puede quedarse atrás de la píldora en ninguna pantalla
nueva: quien pone la píldora pone la salida, porque las dos vienen del mismo módulo.

- **Las cinco pantallas del `ToolGuide`** — la salida pasó a la cabecera del bloque, debajo del
  nombre y del lanzador. Sigue siendo **una línea**, no un párrafo: el «qué es / qué le das / qué te
  devuelve» se queda plegado, que es exactamente lo que el sprint pedía cuando el bloque queda largo.
- **m5** — recibe la misma aclaración que m4, al lado de su píldora. Con una precisión que el
  censo obliga a declarar: en m5 la píldora **ya vivía dentro** del plegable de objeciones, y eso
  está bien (una objeción es un caso, no el estado normal del toque) y ese plegable **sí** promete lo
  que hay adentro. Lo que se garantiza —y lo que el test fija— es que la salida no quede **más
  adentro que la pared que destraba**: sin abrir nada no se ve ninguna de las dos; al abrir, se ven
  las dos.
- **mr** — estrena zona de munición con el mismo `ToolGuide id="claudeDesign"` de mc1/mc2
  (`ReentradaMunicion`). Ahí queda nombrada la herramienta a la que va el bloque copiable de arriba,
  con su acceso y con su salida.

Un matiz sobre `mr`, para no dejar el diagnóstico más grande de lo que es: el bloque **sí** llevaba
el nombre en su título («Bloque para Claude Design»). Lo que no había era la herramienta: ni acceso,
ni qué esperar, ni salida. El bloque se copiaba y no había a dónde llevarlo.

### Paso 3 · Los títulos que prometen

Dos plegables tenían título genérico. Los dos ahora dicen qué hay adentro, con la gramática del
estándar que ya existía en el producto («Ver ejemplo de una ficha bien hecha»):

| Dónde | Antes | Ahora |
|---|---|---|
| `ToolGuide` — las 5 pantallas de herramienta | «Qué es y cómo se usa» | «Ver para qué sirve, qué le das y qué te devuelve» |
| `TeachPanel` plegado — m14 | «¿Por qué importa?» | «Por qué marcar en verde sin mirar vuelve como rechazo» |

El título nuevo del `ToolGuide` nombra sus tres párrafos, uno por uno. El de m14 dice lo que dicen
sus dos párrafos (`GUIA_SELF_CHECK.porque`): que un check falso vuelve como rechazo y enfría al
negocio.

`TeachPanel` gana un prop `titulo` con el valor de siempre por default — su otro uso (m5,
`collapsible={false}`) no es un plegable sino un encabezado dentro de uno que ya promete, y queda
igual. Los cuatro plegables que ya prometían no se tocaron: los dos ejemplos, la disciplina de canal
y el bloque de objeciones.

### Paso 4 · Los dos pendientes de P3

**m13 con el lead rechazado.** El cuarto paso decía «Copiá la URL que te da Netlify y pegala acá
abajo», y en RECHAZADA abajo no hay campo: el motor guarda el link **solo** en CONSTRUCCION
(`saveOwnedDraftUrl`), así que el registro muestra el borrador congelado y el botón de reabrir. Ahora
`M13Municion` recibe `congelado` y en ese estado el último paso dice «Copiá la URL que te da Netlify
— el campo para pegarla se abre cuando reabrís la construcción». Los otros tres pasos **se derivan**
de la lista viva (`GUIA_DRAFT.pasos.slice(0, -1)`), no se copian: si Franco edita el instructivo, la
variante lo sigue sola. Publicar en Netlify se hace igual, antes o después del rechazo.

**El aviso de guardado.** Un toast no lleva a ninguna parte y se va solo a los pocos segundos:
nombrar ahí el chequeo final era nombrar un destino sin poder enlazarlo. Se resolvió por el lado de
«o lo enlaza», no por el de esconderlo: el acuse pasa a decir lo que pasó («Borrador guardado.») y
el paso siguiente se mudó al panel que ese mismo guardado deja en pantalla, donde **sí** puede ser un
enlace — «Ya podés pasar *el chequeo final*», con el `EnlaceChequeoFinal` que P3 dejó como fuente
única del salto y de su gate. No se inventó un formato: el repo no usa acciones en toasts en ninguno
de sus 92 llamados.

---

### Paso 5 · Verificación operando la aplicación

Build de producción en `.next-municiones`, `next start -p 3021`, sesión de `setter-qa@develop.test`,
y los leads QA-W que **ya existían** en la branch Neon dev — no se sembró nada. Se midió en los dos
anchos, 1440 y 390, sobre la zona de Munición de cada pantalla:

1. **La salida se lee sin abrir nada** en m2, m4, m6, mc1, mc2 y mr — las seis, en los dos anchos,
   con `details[open] === 0` en la zona: la pantalla se leyó tal como carga. En 390 la línea envuelve
   a dos renglones (36 px de alto) y termina en x=344 sobre un viewport de 390: **cero desborde
   horizontal** en las doce mediciones.
2. **m5 y m4 dicen lo mismo ante el mismo problema** — misma línea, misma fuente. En m5, medido
   antes y después de abrir el plegable de objeciones: antes, ni píldora ni salida visibles; después,
   las dos. Nunca una sin la otra.
3. **mr nombra su herramienta** — «Claude Design», con lanzador, con salida y con el plegable que
   promete.
4. **m13 en RECHAZADA no promete un campo que no existe** — el paso 4 dice «Copiá la URL que te da
   Netlify — el campo para pegarla se abre cuando reabrís la construcción», y el registro muestra el
   badge «Borrador congelado por el rechazo» con el botón de reabrir. En CONSTRUCCION el paso 4
   vuelve a ser «…y pegala acá abajo»: la variante es del estado, no un reemplazo.
5. **Ningún título plegado sigue siendo genérico** — en m14 los dos plegables son «Por qué marcar en
   verde sin mirar vuelve como rechazo» y «Ver ejemplo de un chequeo final bien hecho», y
   «¿Por qué importa?» no aparece en la pantalla.

Y el panel del borrador publicado (m13 en CONSTRUCCION) dice «Ya podés pasar **el chequeo final**»,
con `href` a `/manual/m14`: el pendiente 2 cerrado, y la cobertura de P3 sobre esa mención intacta.

**Una trampa de medición, anotada.** El primer sondeo del estado congelado dio un falso negativo:
`innerText` sobre el `main` no devolvía el texto del badge. Con `textContent` aparece. Es el mismo
patrón ya conocido —`innerText` no devuelve contenido que el layout no está pintando— y vale
recordarlo: medir copy con `innerText` reporta como ausente lo que está presente.

### El test, demostrado fallando contra el código viejo

`tests/setter/16-municiones-salida.spec.ts` — diez pruebas contra el build de producción. Se
revirtió **solo** el código (`git checkout -- src/`, el spec quedó), se reconstruyó y se corrió:

    8 failed
      x m2  · la salida del link pendiente se lee sin abrir nada
      x m6  · la salida del link pendiente se lee sin abrir nada
      x mc1 · la salida del link pendiente se lee sin abrir nada
      x mc2 · la salida del link pendiente se lee sin abrir nada
      x m4  · la salida del link pendiente se lee sin abrir nada
      x mr  · la salida del link pendiente se lee sin abrir nada
      x m5  · la salida nunca queda más adentro que la pared que destraba
      x m13 congelado · la munición deja de mandar a un campo que no existe
    2 passed

Los mensajes dicen exactamente el hallazgo. En las cinco del `ToolGuide`:

    Error: m2 dice qué hacer con el link pendiente
    expect(locator).toBeVisible() failed
    Locator: getByText('pedíselo a Franco y lo vas a poder abrir desde acá')…
    Expected: visible

En `mr`, un paso antes — no hay ni pared:

    Error: mr muestra la pared
    Locator: getByText('Link pendiente')… Expected: visible

Y en m13 congelado, el texto recibido trae el paso 4 entero: «…Copiá la URL que te da Netlify y
pegala acá abajo. Registro Borrador congelado por el rechazo…».

**Por qué se afirma por visibilidad y no por presencia.** El texto plegado dentro de un `<details>`
cerrado **existe en el DOM** — así estaba antes del sprint. Un `toContainText` habría pasado en verde
sobre el bug exacto que este sprint arregla. Solo `toBeVisible()` distingue «está» de «se lee».

**Las dos que pasan en rojo son a propósito.** Una es el guard del registro: afirma contra
`herramientas.ts` que las cuatro URLs siguen en `null`, y su trabajo es que el día que Franco las
cargue el spec **falle ruidoso** pidiendo actualizarse, en vez de pasar en verde sobre una pared que
ya no está — sin píldora no hay salida que mostrar, y «no la encontré» se leería igual que «está
bien». La otra es el contra-ejemplo de m13 con Netlify Drop, que **sí** tiene link: prueba que la
salida es condicional y no una línea que se agregó a todas las pantallas por las dudas.

### Cierre

- `npx tsc --noEmit` → **exit 0**.
- `npm run check:invariants` → **descubiertos 45 · excluidos 1 · corridos 44 · pasaron 44 ·
  fallaron 0**. Los mismos 44 de la base: este sprint no agrega ni modifica invariantes.
- `npm run test:leados` → **25 passed**.
- `npm run build` → **exit 0**.
- `test:setter` (suite completa, build de producción en 3021) → **75 passed**: las 65 previas más
  las 10 nuevas.
- `prisma generate`: no corresponde — el schema no se tocó.

**Dos aserciones de test fijaban los títulos viejos y se actualizaron.** No es limpieza de paso: es
la consecuencia directa del Paso 3, y la suite la encontró sola — la primera corrida completa dio
**1 failed**, `01-flow.spec.ts:229`, que afirmaba `getByText('¿Por qué importa?')` sobre m14. Se
cambió por el título nuevo, sin debilitar la aserción (sigue exigiendo que el teach esté visible).
La segunda, `tests/qa-persona/corrida-1-novato-frio.spec.ts:104`, **manejaba** el plegable por
`getByText('Qué es y cómo se usa')`: no está en la batería de cierre del setter, así que no habría
gritado — habría quedado un selector muerto esperando a la próxima corrida de persona. Se actualizó
igual. Ninguna otra referencia a los dos títulos viejos quedó en `tests/`, `scripts/` ni `src/`
fuera de los comentarios que explican el cambio.

**Ninguna cadena que sea llave de datos se tocó.** `git status` sale vacío sobre `flow.ts`
(los `HARD_CHECKS`), `contracts.ts` (los `FASE_IDS`), `manual.ts` (los `PANTALLA_IDS` y
`PANTALLA_DE_FASE`), `dossier-stage.ts` (las transiciones) y `prisma/schema.prisma`. Y **ningún
invariante se puso en rojo**: los 44 pasan, incluidos `self-check`, `progreso`, `manual`, `pantallas`
y `dossier-stage`, que son los que gritarían si un nombre de check o un id de fase se hubiera movido.

`git status` también sale vacío sobre `.github/`, `scripts/run-invariants.mjs`, `package.json` y
todos los `*.invariant.ts`: el gate y el workflow, intactos. Ninguna transición nueva ni modificada,
ningún cambio de schema, ninguna operación sobre la base de datos fuera del seed/teardown que la
propia suite hace al correr.

### Desvíos y hallazgos fuera de scope

- **La base fue `fix/callejones`, no `leados/v1-a-main`** — ver Fase 0. Es superconjunto estricto.
- **El rail «Tus herramientas» también muestra «pendiente» sin salida** (`tools-rail.tsx:41-43`). No
  se tocó: no es un bloque de munición —es el panel persistente del rail— y su presentación es otra
  (una etiqueta, no la píldora). Anotado.
- **El diagnóstico de `mr` era un poco más grande que el hallazgo** — el bloque sí nombraba «Claude
  Design» en su título; lo que faltaba era la herramienta entera. Se declara arriba.
- **No se pusheó a main.** `main` local sigue en `17727117`, igual que `origin/main`.

### Lo que este sprint NO resuelve

**Las cuatro herramientas siguen sin URL** — `evaluador`, `gemDiseno`, `claudeDesign` y `gemOutreach`
siguen con `url: null` en `herramientas.ts`. Este sprint hace que el setter sepa qué hacer cuando
choca con esa pared; no saca la pared. Sacarla son cuatro campos, y son de Franco.

**Y no unifica el vocabulario** — eso es el sprint siguiente. Acá solo se decidió qué se pliega y qué
título lleva.

### Lo que queda para la verificación humana

- **Que los títulos nuevos suenen como el resto del producto.** Ningún test lo valida. Son dos: «Ver
  para qué sirve, qué le das y qué te devuelve» y «Por qué marcar en verde sin mirar vuelve como
  rechazo». Lo cierra Franco mirando.
- **Que la salida sirva de verdad** — o sea, que un setter que se traba encuentre qué hacer. El test
  prueba que se lee sin abrir nada; que alcance para destrabarlo solo se prueba con alguien
  recorriéndolo.

---

## Sprint VOCABULARIO — un concepto, un nombre

**Rama** `fix/vocabulario` · **base** `fix/municiones` (`fa4af2a0`) · worktree propio, puerto propio.

El problema medido: el mismo concepto tenía distintos nombres según la pantalla, y en un caso el sinónimo mandaba al lugar equivocado.

### Paso 1 — La medición: ¿pausar y postergar son lo mismo?

**No. Son dos conceptos, con dos escrituras, dos alcances y dos consumidores.** Las cuatro respuestas, con archivo:línea:

| | **Pausa personal** | **Postergación comercial** |
|---|---|---|
| **Qué escribe** | `upsertSetterMeta(leadId, setterId, { snoozedUntil })` → `OsLeadSetterMeta.snoozedUntil` (`cartera.actions.ts:74`) | `osLead.update({ status: POSTERGADO, reactivateAt })` (`os-commercial.ts:181`) + una `OsLeadActivity` con resultado POSTERGADO |
| **Transición** | ninguna — no toca `status` ni `stage` | ninguna de dossier; mueve el `status` del lead |
| **Quién la dispara** | el setter, desde su propio panel (`foco-surface.tsx:108`, `lead-card-actions.tsx:68`) | el setter registrando **el resultado de un toque** (`outreach.actions.ts:195`), y el admin desde el pipeline (`lead-pipeline.tsx:125`) |
| **Alcance** | privada: la fila va keyed por `(leadId, setterId)` — otro setter no la ve | global: la ve el admin y el lead entero cambia de estado |
| **Efecto en el foco** | sale de todas las colas → `pausados` (`flow.ts:766`) | grupo `seguimiento`; vencida vuelve a `trabajar` (`flow.ts:396-398`) |
| **Cron** | **ninguno lo mira** — buscar `snoozedUntil` bajo `src/app/api/cron/` da cero | `os-follow-up` lo levanta y avisa «Se reactiva hoy» (`route.ts:112-119`, `188-192`) |

**¿Puede estar en los dos a la vez?** Sí, nada lo impide. La precedencia ya existía y es correcta: la pausa personal gana (`particionarCartera`: el snooze pesa sobre la cola natural) — el setter lo busca donde él lo escondió.

**Por qué «Pausados por vos» salía vacío.** No estaba roto: `vistaDeLead` devolvía la vista `pausados` sólo cuando el lead estaba snoozeado, y un lead postergado no lo está → caía en `seguimiento`. El filtro contenía exactamente lo que su nombre decía. **Lo roto era el vocabulario**: «Postergar» se explicaba con la palabra «Pausa» (`seguimiento-form.tsx:51`), así que el setter postergaba y se iba a buscarlo al único filtro que sonaba parecido.

Lo que faltaba no era arreglar ese filtro, era **el otro**: la postergación no tenía filtro que la nombrara. La decisión del brief pedía que *cada* filtro contenga lo que su nombre dice — y para eso tienen que existir los dos.

### El censo, y qué palabra ganó

| # | Concepto | Variantes encontradas | Gana | Por qué |
|---|---|---|---|---|
| 1a | esconder un lead de tu vista | «Pausar» (7 lugares) · «posponer» (`foco-surface.tsx:51,229`) | **Pausar** | es la palabra de todos los botones, toasts, contadores y del filtro; «posponer» aparecía sólo como aclaración entre paréntesis de «Pausar» |
| 1b | el negocio pidió que lo llames después | «Postergar» (etiqueta + toast) · «Pausa» (el detalle que lo explicaba) | **Postergar** | ya era la etiqueta, el toast y el estado del lead; «Pausa» era el préstamo que causaba el choque |
| 2 | abrir la construcción | «Arrancar construcción» · «Reabrir construcción» | **las dos** | no son el mismo botón: `iniciarConstruccion` (BRIEF→CONSTRUCCION) y `reabrirConstruccion` (RECHAZADA→CONSTRUCCION) son dos actions con dos precondiciones. Arrancar de cero no es volver a entrar con un rechazo encima |
| 3 | el destino del rail | «Cartera» (nav) · «Ver toda la cartera» (despliegue) · «Volver a tu cartera» (×4) | **«Tu día»** para el destino, **«cartera»** para el conjunto | `/setter` se titula «Tu día»; la cartera es su sección colapsada. El ítem prometía una lista y aterrizaba en otra pantalla |
| 4 | construir la demo | «construir» · «arrancar la construcción» · «producir la demo» (`seguimiento-form.tsx:67`, `guidance-content.ts:425` y `:923`) | **construir** | es la palabra del título de mc1, del rail, de las acciones y de las novedades; «producir» era jerga de agencia en 3 lugares sueltos |
| 5 | paréntesis con nombre de pantalla | «(Evaluación)» en `outreach.actions.ts:111` | **ninguno** | P11 ya había sacado el «(Brief)» del detalle de m5; éste era el último que quedaba visible en todo el recorrido |

**Fuera de alcance a propósito, anotado y sin tocar:** el vocabulario de **brief** («se abrió el brief», «Brief de diseño», el `dondeSeUsa` de la herramienta), el de **Gem** («Gem de diseño», «Gem de outreach») y los **nombres de las herramientas** («Chat de evaluación (Sonnet)», «Claude Design», «Netlify Drop»). El rediseño de m6 los cambia igual.

### Qué cambió comportamiento, y qué fue sólo copy

**Comportamiento (2 cambios, cada uno con su test demostrado fallando):**

1. **El filtro que faltaba.** `vistaDeLead` (`flow.ts`) suma la vista `postergados`, y la toolbar suma «Postergados por el negocio». Esto **cambia qué leads muestra** «En seguimiento»: el postergado sale de ahí. Guardia deliberada: sólo entra el postergado **vigente** — el vencido ya volvió a la cola de trabajar (el cron avisa, no reactiva) y esconderlo detrás del filtro nuevo sacaría trabajo accionable de «Para trabajar» en silencio.
   → **Test:** `src/lib/leados/vista-cartera.invariant.ts` (`check:invariant:vista-cartera`). Contra el código viejo falla con el bug exacto: recibido `seguimiento`, esperado `postergados`.

2. **La instrucción que mandaba al botón equivocado.** `m-construccion.tsx` deriva el motivo del tilde apagado según el stage que ya recibía. El motivo era uno solo y fijo — «Primero arrancá la construcción — el botón está arriba» — cierto en BRIEF y falso en RECHAZADA, que es el otro stage que llega a mc1/mc2 (`posicionDe` habilita `mr` más las dos pantallas de Construcción). Ahí el bloque de BRIEF no se monta, no hay botón arriba, y la reapertura se llama «Reabrir construcción» y vive en «Correcciones» (mr).
   → **Test:** `tests/setter/11-fase-disabled.spec.ts`, caso «vocabulario · RECHAZADA». Contra el código viejo falla mostrando el texto del bug en el recibido.

**Sólo copy (sin test, lo verifica el ojo):** las cuatro palabras del grupo 1 reducidas a dos; el ítem del rail y las cuatro vueltas al mismo destino; los tres «producir la demo»; el paréntesis de «(Evaluación)».

### Tests que seleccionaban por copy

| Test | Qué hacía | Qué se hizo |
|---|---|---|
| `00-surfaces.spec.ts:79` | elegía el ítem del rail filtrando por el texto «Cartera» | **pasó a selector estable**: el rol de la navegación más el botón con `aria-current`. Afirma el rol y el estado, no el label — el nombre del destino es copy y acaba de renombrarse una vez |
| `00-surfaces.spec.ts:146` | buscaba el link «Volver a tu cartera» | actualizado a «Volver a tu día» (es una aserción **sobre** el copy, no un manejo por texto — se queda) |
| `11-fase-disabled.spec.ts:63` | afirmaba el motivo viejo palabra por palabra | actualizado al motivo nuevo; es la aserción del bug, tiene que ser literal |

### Verificación operando la app (1440, build de producción)

Capturas en `docs/proof-screenshots/vocabulario/`:

- **Postergué un lead de verdad** desde el formulario de toques y lo busqué en el filtro: aparece bajo «Postergados por el negocio» (2 leads en la lista, el nuevo entre ellos) y **no** aparece bajo «Pausados por vos» (0 leads — que ahora es la respuesta correcta a la pregunta que hace ese nombre, no un lead perdido). `03-filtro-postergados.png`, `04-filtro-pausados.png`.
- **El botón se llama igual en la instrucción y donde vive**: mc1 con el lead rechazado dice que el botón «Reabrir construcción» está en «Correcciones»; en «Correcciones» está ese botón, con ese nombre. `05-mc1-instruccion.png`, `06-mr-boton.png`.
- **El rail nombra el destino**: «Tu día» activo, la pantalla titulada «Tu día», y «cartera» viva donde nombra el conjunto («Ver toda la cartera», «Buscar en tu cartera»). `07-nav-tu-dia.png`, `08-volver-a-tu-dia.png`.
- **El detalle de «Postergar»** ya no dice «Pausa». `01-m5-postergar.png`, `02-m5-postergado.png`.

Barrido final sobre el árbol: cero «posponer», cero «producir la demo», cero «Volver a tu cartera», cero paréntesis con nombre de pantalla en strings visibles.

**Ninguna llave de datos se tocó**: ni un nombre de hard-check, ni un id de fase, ni un id de pantalla, ni un texto que se compare contra un blob guardado. Los 45 invariantes en verde lo confirman — incluidos `self-check`, `manual`, `pantallas` y `progreso`, que son los que gritarían.

### Estado

`npx tsc --noEmit` exit 0 · invariantes **45/45** (46 descubiertos, 1 excluido — el piso 43 intacto, el nuevo entró por descubrimiento) · `npm run build` verde · `test:setter` **76/76** · `test:leados` **25/25**.

### Lo que queda para Franco

- **Que las palabras suenen a como hablás vos.** Es criterio, no test.
- **Que «pausar» y «postergar» se entiendan sin explicación**, ahora que son dos. La apuesta es que el dueño de la decisión alcanza para distinguirlas: la pausa la elegís vos, la postergación te la pidió el negocio — y así están rotuladas en el filtro.

### Fuera de scope, anotado

- **«Correcciones» (mr) no está en el rail de Construcción.** Las pantallas de Construcción del rail son mc1 y mc2, así que desde mc1 con el lead rechazado la instrucción ya nombra a dónde ir, pero no hay un link que lleve. Sumarlo al rail es un cambio de navegación, no de vocabulario.
- El vocabulario de **brief**, **Gem** y **herramientas**, listado arriba.

---

## Sprint DATOS QUE VIAJAN — el dato existe, vive en una pantalla, y hace falta en otras cuatro — 2026-08-27

Rama `fix/datos-viajan` sobre `fix/vocabulario` (`6ef28432`) — que es `leados/v1-a-main` + callejones + municiones + vocabulario. Worktree propio en `C:/tmp/wt-datos`, puerto 3011, `E2E_DIST_DIR=.next-datos`.

**El patrón, en una frase:** el dato ya está persistido y ya se lee; lo que no hace es viajar. El setter tiene que pararse en el lugar exacto para enterarse de algo que necesita en otro lado.

### Fase 0 — terreno

`git fetch --all --prune` limpio. `git status --porcelain` con un solo `?? docs/` (untracked previo, ajeno — no se tocó). 13 worktrees ajenos vivos, ninguno sobre esta base. 2 stashes ajenos, intactos.

Base verde antes de tocar nada: `tsc` exit 0 · invariantes **45/45** (46 descubiertos, 1 excluido) · `test:setter` **76/76** · `test:leados` **25/25** · build verde.

**Los tres casos siguen vivos** — verificado en código antes de escribir una línea:

| Caso | Prueba de que sigue vivo |
|---|---|
| 1 · la fecha de postergación | `HomeLeadInput` (flow.ts) no proyecta `reactivateAt`; la única superficie que lo renderiza es `M5Contexto` (`m5-seguimiento.tsx:90`). La tarjeta decía `Postergado — se retoma cuando se reactive` (`flow.ts:458`). La cabecera del lead no lo recibía. |
| 2 · las dos esperas | `estado-manual.tsx:50` — `situacion = turno !== 'negocio' ? null : …`. Con el turno de Franco la pantalla mostraba `TEXTO_TURNO.franco.detalle` y nada más: idéntico para «está revisando» y para «aprobó y no cargó el link». |
| 3 · el contador de toques | `EstadoManual` no recibía `followUpCount`. El conteo existía en `_data.ts:169` y sólo llegaba a m5. |

### Censo 1 — la fecha de postergación

- **Dónde vive:** `OsLead.reactivateAt` (columna existente; ningún cambio de schema).
- **Quién la formatea:** `formatFechaCorta` (`flow.ts`, huso AR fijo). Un único consumidor de la fecha en el panel del setter: `M5Contexto`.
- **Las cuatro superficies donde aparece el lead:** foco (`FocoSurface`, lee `lead.proximaAccion`), tarjeta de cartera (`LeadCard`, lee `lead.proximaAccion`), ficha (cualquier pantalla del manual — la cabecera `ManualHeader` es la única común a todas), pantalla de espera (`EstadoManual`, que también monta la cabecera).

**Lo que se movió:** `reactivateAt` entra a `HomeLeadInput` como campo **opcional** (`Date | null`) y `buildHomeLeads` lo pasa — el dato ya se leía ahí para derivar `postergadoVencido`, así que no hay query nueva. `proximaAccionPara` lo usa: la fecha **reemplaza** al texto vago, no se suma encima (la tarjeta ya está cargada y son 76).

| Antes | Ahora |
|---|---|
| `Postergado — se retoma cuando se reactive` | `Postergado — vuelve el 5/9` |
| `Se venció la postergación — retomá el contacto` | `Se venció el 24/8 — retomá el contacto` |

Sin fecha conocida las dos frases viejas siguen siendo el fallback (la columna es nullable): por eso `flow.invariant.ts` —que fija esas dos frases— **quedó intacto y en verde**, y no hizo falta relajarlo.

En la ficha, la fecha va en la **cabecera**, no en una pantalla: el postergado aterriza donde lo deje su stage (m5, `espera`, …) y la fecha tiene que leerse caiga donde caiga. Chip corto al lado de la etiqueta «Postergado», ámbar cuando ya venció.

Y en m5 se arregló lo que el sprint pedía verificar: vencido y futuro **decían lo mismo** (`Postergado — se retoma el DD/MM` en los dos casos). Ahora el vencido dice `Se venció el DD/MM — retomá el contacto` en ámbar, mismo tratamiento que el toque vencido de al lado.

### Censo 2 — qué se está esperando

**Los casos que hoy derivan en el turno de Franco, enumerados** (`turno.ts`, precedencia de arriba abajo — y `turno.invariant.ts:149-155` ya los listaba como «estructuralmente de Franco»):

| # | Condición | Dónde aterriza (`manual.ts: posicionDe`) | ¿Llega a una pantalla de espera? |
|---|---|---|---|
| 1 | `status = CALL_AGENDADA` | m6 / mc / m16 según stage | sólo junto al #6 |
| 2 | `status = CERRADO` | ídem | sólo junto al #6 |
| 3 | `status = PERDIDO` | `archivo` (`manual.ts:500`) | **no** |
| 4 | `stage = DESCARTADA` | `m2` (`manual.ts:522`) | **no** |
| 5 | `stage = EN_REVISION` | `revision` (`manual.ts:568`) | **sí** |
| 6 | `stage = APROBADA` **y** `finalUrl === null` | `espera` (`manual.ts:602`) | **sí** |

O sea: seis condiciones producen el turno de Franco; **dos llegan a las pantallas de estado**, y ésas eran las que mostraban el mismo texto. Con `finalUrl` cargado el gate del envío abre y el lead va a m15, no a la espera — por eso #1 y #2 sólo alcanzan `espera` cuando además se cumple #6.

**Qué dato distingue cada caso:** `stage` separa revisión de aprobada; `finalUrl` (la URL permanente que Franco carga al aprobar) separa «aprobada y lista» de «aprobada y trabada de este lado»; `status` separa reunión y cierre. Los tres ya estaban disponibles en la pantalla (`manual.finalUrl` se pasaba a `turnoDelLead` desde `[paso]/page.tsx:129`) — el turno los leía y los **colapsaba en una palabra**.

**Dónde vive el texto que sí nombra la causa, y por qué no llegaba:** `GUIA_ENVIO.espera.aprobadaSinLink` (`guidance-content.ts:917`), que **m15** muestra con el gate cerrado. Y `GUIA_REVISION.enRevision` para la revisión. No llegaban porque `EstadoManual` no tenía a quién preguntarle *qué* se espera: sólo *de quién* es el turno.

**Lo que se movió — la distinción sale del dato, no de un `if` en la pantalla:**

- `turno.ts` gana `CausaEspera` (siete causas) y `causaDeEspera(input)`. La lista plana `STATUS_DE_FRANCO` pasó a ser `CAUSA_POR_STATUS` (decía quién y perdía el qué).
- `turnoDelLead` **se deriva de la causa** vía `TURNO_DE_CAUSA`: una sola cadena de precedencia, imposible que el titular y su porqué digan cosas distintas. Refactor de comportamiento idéntico, y quien lo prueba es `turno.invariant.ts` — **sin tocarlo**: sus 432 combinaciones de status × stage × finalUrl × acción-pendiente siguen en verde.
- `guidance-content.ts` gana `GUIA_ESPERA`, un `satisfies Record<CausaEspera, LineaRica | null>` — una causa nueva no compila hasta decidir sus palabras. **Los dos textos que importan se REFERENCIAN, no se reescriben.** `null` para `accionPropia` (ya lo dice entero el texto del turno) y para `respuesta` (lo dice el dato).
- `EstadoManual` recibe `causa` en vez de `turno` y hace un lookup en tabla.

**Además, el borrador a la vista.** Las dos esperas decían a quién se espera y no sobre qué: ahora muestran el `draftUrl` que el setter publicó. El dato ya estaba en `manual.draftUrl`.

### Censo 3 — el contador de toques

`countFollowUps` → `manual.followUpCount` → sólo m5. `cadenciaInfo` (la maquinaria, `flow.ts`) es la que sabe en cuál va. La espera decía cuándo es el próximo toque y no en cuál vas: con cero toques y con dos se leía idéntica.

Ahora la espera arma una sola línea: `Próximo toque el 31/8 · Toques: 1 de 3 — el foco te lo trae cuando llegue.` Clampado igual que m5 (nunca «4 de 3» con cuatro filas sembradas). Con la cadencia agotada dice `Toques: 3 de 3 — la cadencia se completó: no queda otro toque para mandar…`, que es un número que no invita a insistir.

### Verificación operando la app (1440, build de producción)

Capturas en `docs/proof-screenshots/datos-que-viajan/` (gitignored):

1. **Postergué un lead de verdad** desde el formulario de m5, eligiendo la fecha a mano. La ficha muestra el chip con **la fecha que elegí** (afirmado contra el string tipeado, no contra un `Date` reparseado: el desvío de un día que arregló F1 se vería) y la tarjeta de cartera dice `Postergado — vuelve el 5/9` sin abrir el lead. `v1-01`, `v1-02`, `v1-03`.
2. **Vencido y futuro, lado a lado** en la cartera: uno neutro con su fecha de vuelta, el otro en cyan accionable con `Se venció el 24/8 — retomá el contacto`. `v2`.
3. **Las dos esperas**, cada una nombrando lo suyo bajo el mismo titular «Le toca a Franco». `v3-01`, `v3-02`.
4. **El contador en dos estados**: cadencia viva y cadencia agotada. `v4-01`, `v4-02`.
5. A **390** el chip envuelve a la fila de badges y la causa entra sin desborde horizontal (medido: 0 px). `v5-01`, `v5-02`.

### Tests

`tests/setter/17-datos-que-viajan.spec.ts` — 7 casos, todos **demostrados fallando contra el código viejo** antes de escribir la implementación:

| Test | Falló en |
|---|---|
| 1a tarjeta de cartera | `Postergado — vuelve el 1/9` no visible |
| 1b vencido vs futuro | ídem |
| 1c la ficha | `Vuelve el 1/9` no visible |
| 2a en revisión | `revisión de Franco` no visible |
| 2b aprobada sin link | `todavía no cargó su link permanente` no visible |
| 3a contador | `Toques: 1 de 3` no visible |
| 3b cadencia agotada | `Toques: 3 de 3` no visible |

En los siete rojos **sí** pasaban `Le toca a Franco` y `Próximo toque el DD/MM`: el turno y la fecha del próximo ya estaban bien, lo que faltaba era exactamente la causa y el contador. Se afirma por `toBeVisible`, nunca por presencia.

### Estado

`npx tsc --noEmit` exit 0 · invariantes **45/45** (46 descubiertos, 1 excluido — ninguno tocado, ninguno en rojo) · `npm run build` verde · `test:setter` **83/83** (76 + 7) · `test:leados` **25/25**. `prisma generate` no corresponde: el schema no se tocó.

**Ninguna llave de datos se tocó**: ni un nombre de hard-check, ni un id de fase, ni un id de pantalla, ni un texto que se compare contra un blob guardado. Ningún campo nuevo en la base. Ninguna transición nueva ni modificada. `CausaEspera` es un tipo de presentación: no se persiste ni se compara contra nada guardado.

### Lo que queda para Franco

- **Que la tarjeta no quede más cargada.** La fecha reemplaza texto, no se suma: la línea de la sugerencia pasó de 44 a 28 caracteres en el postergado futuro. Pero son 76 tarjetas y eso lo cierra él mirando.
- **Que las dos esperas se entiendan sin explicación.**
- Nota de lectura: en m5 la fecha aparece dos veces (el chip de la cabecera y el recuadro de cadencia), igual que ya pasa con la etiqueta de estado. Si molesta, se saca del recuadro.

### Fuera de scope, medido y anotado

- **La tarjeta de cartera no puede ver `finalUrl`, y por eso miente en un caso.** Un lead APROBADA **sin** link permanente muestra en el panel `Demo aprobada — mandá el link al negocio`, en cyan accionable, mandando a enviar un link que no existe; y su hermano con link cargado y sin respuesta dice `Le toca al negocio…`. Se ve en la captura `v2`: «Optica Central» (sin link) vs «Taller Muñoz» (con link). Es la MISMA raíz de este sprint, en una quinta superficie. **Costo de cerrarlo:** proyectar `finalUrl` en `HomeLeadInput` (flow.ts) + `buildHomeLeads` (home.ts) + partir la rama APROBADA de `proximaAccionPara` + el conteo por turno del panel (`setter/page.tsx:60-64`, que hoy tampoco lo pasa y por eso cuenta esas demos como «esperando al negocio»). Ningún invariante lo afirma hoy, así que **no se pondría en rojo** — pero cambia el copy y los contadores del panel para todo lead aprobado-sin-link: es otro objetivo, no éste.
- **Referencia de plazo en las dos esperas: el dato NO existe.** No hay marca de cuándo entró a revisión (`OsLeadDossier` tiene `aprobadaAt` y `enviadaAt`, no un `enRevisionAt`) ni ningún SLA persistido. No se inventó ninguno. Cerrarlo pide un campo nuevo — fuera de las reglas de este sprint.
- **«Correcciones» (mr) sigue sin estar en el rail de Construcción** (heredado del sprint anterior). Merece el barrido propio que el pedido nombra: todo destino que el producto nombra tiene que ser alcanzable desde donde se lo nombra.

---

## Sprint LA QUINTA SUPERFICIE — la tarjeta de cartera, el contador del panel, y el invariante que faltaba

**Rama** `fix/quinta-superficie` sobre `fix/datos-viajan` (`b87bc821`) = `leados/v1-a-main` + callejones + municiones + vocabulario + datos-viajan.

`dossier.finalUrl` —la URL permanente que Franco registra AL APROBAR— es la **condición** del envío: sin ella no hay link que mandar. La misma omisión apareció en cinco superficies, una por sprint: la superficie no proyectaba el campo, trataba «aprobada» como sinónimo de «lista para mandar», y le pedía al setter una acción imposible o contaba la demo como espera del negocio. Las cuatro primeras se cerraron a mano. Ésta es la quinta, y por eso el sprint cierra con un invariante.

**El dato que hizo peligroso el sprint, verificado en Fase 0:** ningún chequeo del repo afirmaba la distinción. Se podía romper cualquiera de las cinco y todo seguía en verde — por eso la verificación fue operando la aplicación y por eso el invariante no era opcional.

### El bug, reproducido en vivo sobre la base (antes de tocar código)

Dos leads idénticos salvo el link, en la misma cartera y en la misma imagen. Medido contra el DOM, no leído de la captura:

| | Optica Central (`finalUrl` null) | Taller Muñoz (con link) |
|---|---|---|
| sugerencia | `Demo aprobada — mandá el link al negocio` | idéntica |
| acento de la card | cyan accionable | idéntico |
| rótulo de orden | `La demo está lista para mandar` | idéntico |

Y los grupos/contadores de la cartera real de 78 leads, con el mismo instrumento:

```
trabajar 49 · revision 10 · seguimiento 11 · agendadas 2 · archivo 5 · fijados 1 · pausados 0  → 78
contador del panel (lo que page.tsx computaba): negocio 11 · franco 12  = 23 en vuelo
```

### Paso 1 — El censo de superficies que derivan del stage aprobado

| # | Dónde | Qué deriva | ¿Leía `finalUrl`? |
|---|---|---|---|
| 1 | `m15-envio.tsx:98,110,120` | gate del envío + turno + el «todavía no» | **sí** (cerrada en 5.4/P11) |
| 2 | `estado-manual.tsx` ← `manual/[paso]/page.tsx:133` | pantalla de espera: turno + causa | **sí** (cerrada en datos-viajan) |
| 3 | `manual.ts:585` `posicionDe` case APROBADA | a qué pantalla aterriza (m15 vs espera) | **sí**, vía `gateEnvioDemo` |
| 4 | `admin/leados/[leadId]/page.tsx:197` | el link permanente en el detalle | **sí** |
| 5 | `flow.ts:530` `proximaAccionPara` case APROBADA | la sugerencia de la tarjeta + `accionable` | **NO** ← el copy |
| 6 | `flow.ts:430` `grupoPara` case APROBADA | en qué cola de la cartera cae | **NO** ← la clasificación |
| 7 | `flow.ts:467` `esperaDe` | el turno de toda espera del panel | **NO** (no lo pasaba) |
| 8 | `setter/page.tsx:59-64` | el contador por turno del panel | **NO** ← el conteo |
| 9 | `flow.ts:710` `trabajoTier` + `motivoOrden` | orden de la cola + su rótulo | **NO** (indirecto, vía el grupo) ← **la sexta** |

**Copy vs clasificación, separados a propósito.** Copy = 5. Clasificación = 6, 8 y 9 — y la clasificación es la que se rompe en silencio: 8 no lo veía nadie porque el conteo no era una función, era diez líneas dentro de un componente.

**La sexta apareció: es el criterio de ORDEN (#9).** `trabajoTier` mandaba un aprobado-sin-link al tier `CONTACTAR_CON_DEMO` (por encima de «evaluar» y del contacto viejo) y `motivoOrden` lo rotulaba `La demo está lista para mandar`. Se ve en la captura del antes, sobre Optica Central. Se cerró **sin tocar `trabajoTier`**: el rótulo se apaga solo fuera de la cola de trabajo, y el aprobado-sin-link ya no entra a esa cola. Fijado por el censo del invariante (`rotulo-orden`: el rótulo con link, `null` sin link).

**Una séptima, LATENTE y no renderizada:** `paso.ts:165` `describirFoco` case APROBADA diría `Enviá el link de la demo` mirando sólo el gate del brief. Hoy es inofensiva porque su salida no llega a ninguna pantalla — el único consumidor (`posicionDe`) lee `paso.foco`/`paso.anchor` sólo en la rama EVALUADA, y para APROBADA llama a `gateEnvioDemo` directo. Se dejó **el código intacto** y se anotó la trampa en el propio archivo, con el puntero al invariante.

**Lo que NO es superficie, medido:** `novedades.ts:57` (`DEMO_APROBADA` dice «Enviá el link ya») es un SNAPSHOT del momento de aprobar y su disparador —`aprobarRevision`— exige `finalUrl` por schema, así que no puede nacer mintiendo. `pipeline.ts` excluye APROBADA de las etapas de producción. `leados-ui.ts` y `flow-content.ts` son mapas de rótulo. `m13` y `m14` derivan de CONSTRUCCION, no de APROBADA.

### Paso 2 — La tarjeta

- `HomeLeadInput` gana `finalUrl` **opcional** (mismo criterio que `reactivateAt`): `undefined` = la superficie no lo proyecta y la derivación se comporta igual que antes; sólo `null` afirma «no está cargado». Opcional a propósito — obligatorio habría exigido tocar los fixtures de cuatro invariantes existentes, y este sprint no toca ninguno.
- `buildHomeLeads` lo proyecta desde el dossier que la query ya traía: **cero queries nuevas**.
- `esperaDe` le pasa `finalUrl` al turno, así que la mitad izquierda de la frase la sigue decidiendo `turno.ts` y no un `if` nuevo.
- `proximaAccionPara` parte la rama: con link `Demo aprobada — mandá el link al negocio`; sin link `Le toca a Franco — todavía no cargó su link permanente`, no accionable.

**El texto no se reescribió.** `GUIA_ENVIO.espera.aprobadaSinLink` ya lo decía bien y m15 ya lo mostraba, pero es una frase larga y la card no la aguanta (son setenta y seis). Se extrajo el fragmento ENFATIZADO de esa misma frase a `FALTA_LINK_PERMANENTE` (`turno.ts`, módulo hoja alcanzable desde `flow.ts` bajo ts-node) y ahora **la frase larga lo compone y la card lo usa**: una sola cadena, imposible que digan cosas distintas.

**Se distinguen a simple vista, no por el texto chico:** al no ser accionable, la card sin link pierde el borde cyan, la barra de acento cyan y el fondo cyan de la píldora — y pierde también el rótulo de orden. Queda **más liviana**, no más cargada.

### Paso 3 — Los contadores

El bucle de `setter/page.tsx` pasó a `contarEnVueloPorTurno(enVuelo)` en `flow.ts`. No es cosmética: **recibe el `HomeLead` completo y arma el input él**, así que la superficie no puede volver a olvidarse de un campo — y el conteo pasa a ser afirmable en frío, que era la razón por la que nadie lo veía.

Cartera real (78 leads), mismo instrumento antes y después:

| | antes | después |
|---|---|---|
| trabajar | 49 | 47 |
| revision | 10 | 10 |
| seguimiento | 11 | 13 |
| agendadas | 2 | 2 |
| archivo | 5 | 5 |
| fijados | 1 | 1 |
| pausados | 0 | 0 |
| **total** | **78** | **78** |
| en vuelo | 23 | 25 |
| contador del panel | negocio 11 · franco 12 | negocio 10 · franco 15 |

**Los totales cierran**: 78 = 78. Se movieron **dos** leads de `trabajar` a `seguimiento` (`M0-GAL 29-m15-espera-sin-final-url` y el sembrado del sprint) y **uno** cambió de columna dentro del contador sin moverse de grupo (`QA-W Aprobada Gate Cerrado`, que ya estaba en seguimiento y se contaba como espera del negocio). 11+12 = 23 → 10+15 = 25; el +2 es exactamente el de los dos que entraron a en-vuelo.

**El foco y el orden de la cola NO cambiaron**, medido con el mismo instrumento sobre las dos versiones: `QA-W Evaluada Gate Abierto` sigue siendo el foco y los primeros cinco de la cola son los mismos. Los dos que se movieron eran tier `CONTACTAR_CON_DEMO`, detrás de tres leads de tier `CONSTRUIR`.

### Paso 4 — El invariante, para que no haya una sexta

`src/lib/leados/aprobada-sin-link.invariant.ts` (`check:invariant:aprobada-sin-link`), en dos partes:

**A · el censo congelado.** Diez derivaciones, cada una con su archivo, qué decide, y qué tiene que dar con y sin link. De cada una se afirma que **los dos casos difieren Y que cada uno da el resultado correcto** — que difieran solo no alcanza: dos ramas invertidas también difieren. Y una tercera aserción **anti-vacuidad**: si las dos expectativas de una entrada son iguales, falla — porque una entrada así pasaría en verde sobre una derivación que ignore `finalUrl` por completo, que es la forma exacta de los falsos verdes anteriores de este repo.

**B · el guard de descubrimiento.** El censo de A es a mano, así que por sí solo no ve una superficie nueva. B congela el **conjunto de archivos** que pueden derivar algo de un lead aprobado —los que nombran el literal del stage, los que leen `finalUrl`, o los que llaman a los deciders— y falla si el conjunto cambió, en cualquier dirección. Un alta es un candidato a sexta; una baja es la distinción perdiéndose.

**Demostrado fallando, tres veces:**

| Reversión | Rojo |
|---|---|
| saco la lectura de `finalUrl` en `grupoPara` | `[grupo-cartera] … decidió "trabajar" en vez de "seguimiento" — lo mismo que decide con el link cargado.` |
| saco `finalUrl` del contador | `[contador-panel] … decidió {"negocio":1,"franco":0,…} en vez de {"negocio":0,"franco":1,…}` |
| agrego un archivo que compara contra el stage | `Aparecieron archivos que tocan la derivación del lead APROBADO y no están en el censo: · src/lib/leados/_sexta-superficie-demo.ts` |

Los mensajes dicen **qué se rompió y por qué importa** («le pide al setter una acción que no puede hacer», «cuenta la demo como espera del negocio, que ya contestó»), no que una comparación falló.

**Lo que este invariante NO puede afirmar:** que una superficie NUEVA distinga los dos casos. Sólo puede exigir que aparezca en el censo. La parte B es lo más cerca que se puede estar de eso sin parsear el árbol de tipos, y su modo de falla es ruido (un archivo que menciona el campo entra igual), nunca silencio.

### Paso 5 — Verificación operando la aplicación

Build de producción propio (`.next-quinta`) en `:3021`, worktree aislado. Capturas en `docs/proof-screenshots/quinta-superficie/` (gitignored):

1. **Los dos aprobados lado a lado en la cartera, a 1440.** Antes: idénticos —mismo borde cyan, mismo rótulo de orden, misma píldora cyan— con el acento leído del DOM (la misma clase de acento cyan en los dos). Después: el sin-link queda neutro y sin rótulo de orden, el con-link conserva el cyan. `antes-cartera-1440`, `despues-cartera-1440`.
2. **El contador del panel, antes y después, con los dos leads.** Un setter con sólo dos leads en vuelo, idénticos salvo el link: antes el contador daba `negocio 2 · franco 0` y las dos cards decían «Le toca al negocio»; después el panel muestra los dos chips, `1 esperando a Franco` y `1 esperando al negocio`. `despues-panel-1440`.
3. **El que no tiene link no invita a mandarlo:** su card no es accionable y abrir el lead aterriza en la pantalla de espera (`/manual/espera`), no en el envío.
4. **A 390** las dos cards y los dos chips entran con **0 px** de desborde horizontal (medido por `scrollWidth - clientWidth`, no a ojo). `despues-cartera-390`, `despues-panel-390`.

### Tests

`tests/setter/18-quinta-superficie.spec.ts` — 6 casos. Los **cuatro que cubren el bug** se demostraron fallando contra el código viejo (mismo build, spec nueva):

| Test | Rojo contra el código viejo |
|---|---|
| 1a la tarjeta sin link | `Le toca a Franco — todavía no cargó su link permanente` no visible |
| 1c distinguibles a simple vista | el acento del sin-link era el cyan accionable, igual que el del con-link |
| 2a el contador | ídem 1a, sobre el lead en vuelo |
| 3a la fecha una sola vez (microsprint) | 2 nodos visibles con la fecha en vez de 1 |

Los otros dos (1b «con link sí manda a enviarlo», 1d «el aterrizaje del manual») pasan en las dos versiones **a propósito**: son el lado de control y la superficie que ya estaba cerrada. Se dice acá para no contarlos como si atraparan algo.

Se afirma por `toBeVisible`, nunca por presencia. El acento se lee del DOM: el alto de un PNG no prueba un color. La fecha se formatea con `formatFechaCorta` —el mismo helper que pinta la UI— porque `es-AR` da `24/8` y no `24/08`: un regex de dos dígitos pasaba en verde sobre el bug, y de hecho pasó en el primer intento.

### Microsprint

En la pantalla de seguimiento la fecha de la postergación aparecía dos veces: el chip de la cabecera (`ManualHeader`, presente en todas las pantallas del lead) y el recuadro de cadencia de `M5Contexto`. Se sacó del recuadro. La rama **sigue existiendo** aunque no pinte nada en el caso futuro: sin ella un POSTERGADO caería a «Próximo toque», que es la fecha equivocada. Lo que el chip no dice —que un vencido es trabajo de ahora— quedó: `Retomá el contacto`, en ámbar.

### Estado

`npx tsc --noEmit` exit 0 · invariantes **46/46** (47 descubiertos, 1 excluido; antes eran 45/45 sobre 46 — el nuevo entró por descubrimiento y ninguno existente se tocó ni quedó en rojo) · `npm run build` verde · `test:setter` **89/89** (83 + 6 nuevos) · `test:leados` **25/25**. `prisma generate` no corresponde: el schema no se tocó.

**Ninguna llave de datos se tocó**: ni un nombre de hard-check, ni un id de fase, ni un id de pantalla, ni un texto que se compare contra un blob guardado. `FALTA_LINK_PERMANENTE` es copy de presentación — nunca se compara contra nada persistido. **Ningún campo nuevo**: `finalUrl` ya existía y ya venía en la query. **Ninguna transición nueva ni modificada.** Ninguna operación sobre la base fuera de los fixtures de verificación, borrados al terminar.

### Lo que queda para Franco

- **Que la tarjeta no quede más cargada.** La card sin link tiene ahora **una línea menos** que antes (pierde el rótulo de orden) y ninguna de más. Pero son setenta y seis: lo cierra él mirando.
- **Que el copy del caso sin link no suene a error.** No es un error: es que le toca a Franco. El texto es el mismo que el envío ya venía mostrando, así que la voz es la de siempre.

### Fuera de scope, medido y anotado

- **Una inconsistencia PREEXISTENTE que este sprint no crea ni arregla:** un APROBADA con la demo sin mandar, gate cerrado y toque vencido cae en `trabajar` (`flow.ts:433`, rama `followUpVencido`) con una sugerencia **no accionable** (`proximaAccionPara` corta antes, en `if (!input.demoEnviada)`). O sea: un lead en la cola de trabajo cuya card dice «esperá», que además puede ser el foco. Es otra raíz —grupo y accionabilidad derivados por dos escaleras independientes—, no la de este sprint. El caso del link **no** suma un ejemplo nuevo: la rama nueva de `grupoPara` lo saca de `trabajar` antes de llegar ahí.
- **El admin no tiene superficie que le avise que aprobó y no cargó el link.** `pipeline.ts` excluye APROBADA de las etapas de producción y le da SLA infinito, así que esas demos no aparecen como atascos en su panorama. No es una superficie que mienta: es una que falta. Es otra cosa, y no se tocó.
- **La única puerta de UI a APROBADA exige `finalUrl`** (`AprobarRevisionSchema`). El caso sin link entra por seeds y por tooling (`scripts/b2-verify-dossier.ts:266`) — o por filas viejas. En la cartera QA hay tres hoy.

---

## Sprint UNA SOLA FUENTE — cuatro veces lo mismo escrito dos veces — 2026-08-27

Cuatro casos acumulados desde hace seis sprints, con la misma forma: **existen dos fuentes para lo mismo, y la que la red mira no es la que el producto usa.** Un objetivo compartido —que haya una sola fuente— hecho en cuatro pasadas separadas, cada una con su demostración.

Base: `fix/quinta-superficie` @ `035f90a1`, que es `leados/v1-a-main` con la cadena lineal de P3 a P7 encima. Rama: `fix/una-sola-fuente`. Al arrancar: `tsc --noEmit` exit 0, suite **46/46** (47 descubiertos, 1 excluido).

Los cuatro se reprodujeron ANTES de tocar código. Ninguno había desaparecido.

### Caso 1 · El contador afirmaba sobre una réplica

**Censo.** La consulta real (`outreach.ts:63`, `contarDmsHoy`) armaba su `where` con el canal **inline** y el discriminador de resultado spreadeado: `performedById`, `channel: 'INSTAGRAM_DM'`, `...SOLO_MENSAJES_ENVIADOS`, `createdAt`.

El invariante afirmaba tres cosas, y **ninguna era esa consulta**: que `SOLO_MENSAJES_ENVIADOS` es el fragmento del resultado, que el predicado `esMensajeEnviado` es su espejo, y una **réplica in-memory que el propio invariante escribía** (`contarDms`, con su propia comparación de canal más `esMensajeEnviado`). El eje de canal estaba escrito **dos veces** —literal en la consulta, constante en la réplica— y el discriminador de resultado se afirmaba como constante suelta, nunca como parte del `where` que viaja a Prisma.

**Reproducido.** Sobre `035f90a1`, el sabotaje que P1 midió —borrar el renglón del spread en `contarDmsHoy`, nada más—: invariante **verde**, `tsc` **exit 0**. El bug que F1 arregló vuelve entero con el gate en verde.

**La fuente única.** `SOLO_DMS_MANDADOS` (canal + resultado, construido spreadeando `SOLO_MENSAJES_ENVIADOS`) y `dmsMandadosHoyWhere(userId, desde, hasta)`, los dos en `isolation.ts`, que no importa el cliente de Prisma. `contarDmsHoy` quedó en una sola línea que pasa ese `where`: no arma ninguno propio. El predicado `esDmMandado` **lee** los campos de `SOLO_DMS_MANDADOS` en vez de repetirlos, y la derivación in-memory del invariante pasó a filtrar con él.

**Demostrado.** Mismo sabotaje, ahora sobre la única fuente que queda:

```
AssertionError: el `where` que `contarDmsHoy` le pasa a Prisma dejó de ser el censado.
  Si le falta `result`, volvió el bug de F1: el contador cuenta FILAS del canal y no
  mensajes mandados, así que postergar un contacto —sin mandar nada— empuja al setter
  contra un tope que no alcanzó.
+ actual - expected
  { channel: 'INSTAGRAM_DM', createdAt: {...}, performedById: 'setter-1',
-   result: 'SIN_RESPUESTA' }
```

Y se cae por los dos lados: medido con el sabotaje puesto, el fragmento queda sin su `result` y `esDmMandado(opener)` pasa a `false`, así que la aserción conductual («el opener es un mensaje mandado») también se rompe. El esperado del bloque 0 está escrito **a mano**: derivarlo del fragmento daría verde contra cualquier cosa.

### Caso 2 · Una arista del grafo vivía en dos archivos

**Censo.** `esReloopRechazo` (`escalamiento.ts:56`) codificaba el destino con un literal. Esa arista también está en `LEGAL_TRANSITIONS` (`dossier-stage.ts`). Nada las ataba, y el invariante del grafo no ve la copia.

**Reproducido.** Sobre `035f90a1`: se sacó `CONSTRUCCION` de las salidas de RECHAZADA y se actualizó `GRAFO_CENSADO` **en el mismo commit**, que es exactamente lo que el mensaje del invariante del grafo instruye hacer cuando el cambio es a propósito. Resultado: **suite entera 46/46 en verde**, y `esReloopRechazo('RECHAZADA','CONSTRUCCION')` devolviendo **`true`** sobre una arista que ya no existe — con `transitionDossier` aplicando `RELOOP_RESET`, que borra el self-check, sobre una transición ilegal.

Matiz que corresponde decir: si se saca la arista **sin** tocar el censo, `dossier-stage` sí se cae — pero por su censo congelado, no por la copia. La copia queda muda en los dos casos. El hueco es el de arriba.

**La fuente única.** El destino sale del grafo: el origen sigue siendo el literal `RECHAZADA` —que es el concepto que la función nombra, no una arista— y el destino se consulta contra las salidas de RECHAZADA en `LEGAL_TRANSITIONS`.

Leer el grafo abre una puerta nueva: si RECHAZADA gana una **segunda** salida, el predicado la aceptaría sola y el reset se extendería a ella sin que nadie lo decida. Por eso `reloop-selfcheck-reset.invariant.ts` estrena un bloque 0 que fija la arity.

**Demostrado.** Mismo sabotaje, ahora sobre el arreglo: `check:invariant:reloop-selfcheck` en **rojo**, suite 45/46.

```
AssertionError: RECHAZADA dejó de tener UNA sola salida.
  `esReloopRechazo` lee `LEGAL_TRANSITIONS.RECHAZADA`, así que toda salida nueva pasa a
  contar como re-loop y se lleva puesto el self-check del dossier (RELOOP_RESET).
+ []   - [ 'CONSTRUCCION' ]
```

Y el predicado dejó de mentir: con la arista fuera, ahora devuelve `false`.

**El grafo no arrastró Prisma.** Verificado como pide C1c, y además empíricamente: `reloop-selfcheck`, `escalamiento` y `dossier-stage` pasan los tres **sin `DATABASE_URL` y con el `.env.local` sacado del árbol**. `dossier-stage.ts` sigue sin un solo import de valor.

### Caso 3 · Dos formas de calcular el borde de un día

**Censo.** `pausarLead` (`cartera.actions.ts:88`) calculaba el fin de la pausa con `new Date` sobre el día elegido más `T23:59:59`. Un date-time **sin designador de zona** se parsea en la hora local del proceso. Medido en este entorno:

| Huso del proceso | El día 2026-08-28 a las 23:59:59 resuelve a |
|---|---|
| `America/Buenos_Aires` (la máquina de Franco) | `2026-08-29T02:59:59.000Z` — correcto |
| `UTC` (el servidor) | `2026-08-28T23:59:59.000Z` — **tres horas antes** |

F1 ya había establecido el ancla correcta (`parseCalendarDayAR`), pero para el otro campo: la postergación comercial (`reactivateAt`). La pausa personal (`snoozedUntil`) nunca la usó. Y ahora el filtro «Pausados por vos» de la cartera se decide con ese campo.

**La fuente única.** `finDePausaAR(dia)` en `cartera.schemas.ts` —al lado de `SnoozeSchema`, que ya era el contrato de ese string—: ancla con `parseCalendarDayAR` y suma el último segundo del día. `pausarLead` la consume.

**En desarrollo no cambia nada.** Medido en el huso de Franco, viejo contra nuevo:

| Día elegido | Código viejo | Código nuevo | |
|---|---|---|---|
| 2026-08-28 | `2026-08-29T02:59:59.000Z` | `2026-08-29T02:59:59.000Z` | idéntico |
| 2026-08-31 (fin de mes) | `2026-09-01T02:59:59.000Z` | `2026-09-01T02:59:59.000Z` | idéntico |
| 2026-12-31 (fin de año) | `2027-01-01T02:59:59.000Z` | `2027-01-01T02:59:59.000Z` | idéntico |
| 2028-02-29 (bisiesto) | `2028-03-01T02:59:59.000Z` | `2028-03-01T02:59:59.000Z` | idéntico |
| 2026-09-01 | `2026-09-02T02:59:59.000Z` | `2026-09-02T02:59:59.000Z` | idéntico |

5/5. El arreglo cambia **de dónde sale** el borde, no cuál es. La rama de error tampoco se movió: un día imposible (`2026-02-31`, que el regex de `SnoozeSchema` deja pasar) daba `Invalid Date` y ahora da `null`, y cae en el mismo `return fail` con el mismo texto.

**El invariante nuevo corre con el huso forzado.** `check:invariant:pausa-dia` arranca con `cross-env TZ=UTC`, y eso es parte del invariante: en AR el cálculo viejo y el nuevo dan el mismo instante, así que una corrida ahí no distingue el arreglo de no hacer nada.

Hallazgo que obligó a un segundo intento: **`TZ` no siempre se respeta.** Medido en Windows con Node 24, `TZ=UTC` toma efecto, pero `TZ=Asia/Tokyo`, `TZ=Europe/Madrid`, `TZ=America/Los_Angeles` y `TZ=Etc/GMT-9` **caen de vuelta al huso del sistema en silencio**. Un invariante que asumiera el huso forzado pasaría en verde sin ejercer nada. Por eso el bloque 0 exige la premisa —y la mide con `getTimezoneOffset()`, **no** comparando el sujeto contra el cálculo ingenuo: escrito así, una regresión del sujeto los volvía a igualar y el guard culpaba al huso, diciendo «esta corrida no prueba nada» cuando el problema era el código. El primer intento tenía ese defecto y se corrigió.

**Demostrado.** El invariante contra el código viejo, con el huso forzado a UTC:

```
AssertionError: 2026-08-28: el fin de la pausa dejó de ser 23:59:59 en hora argentina.
  Si este valor se movió con el huso del proceso (UTC), volvió el bug:
  el borde tiene que salir de `parseCalendarDayAR`, no del date-time sin zona.
+ '2026-08-28T23:59:59.000Z'
- '2026-08-29T02:59:59.000Z'
```

**La vista de postergados sigue conteniendo lo mismo.** `vista-cartera` y `postergacion` siguen en verde sin tocarse, y el invariante nuevo afirma el interruptor del filtro: a las 20:59:59 AR del día elegido —el punto exacto donde el borde viejo en un servidor UTC ya lo había soltado— el lead **todavía está pausado**.

### Caso 4 · El piso tenía cuatro renglones de holgura

**Censo.** El piso en `scripts/run-invariants.mjs` era 43; el descubrimiento daba **47**.

**Reproducido.** Sobre `035f90a1`, sacando `check:invariant:turno` de `package.json`: la suite corrió 45, reportó `pasaron 45 | fallaron 0` y salió **exit 0**. Verde sobre una red con un invariante menos.

**La decisión: cuenta exacta, con fallo en las dos direcciones.** En una línea: *un piso que solo falla hacia abajo se atrasa por construcción —cada sprint que suma uno ensancha la holgura— y avisar sin fallar es exactamente lo que ya pasó cuatro veces seguidas sin que nadie lo levantara.* Quedó `INVARIANTES_ESPERADOS = 48`. Subirlo cuesta el mismo renglón que el archivo ya pedía para bajarlo, y se paga en el commit donde ya estás parado.

**Demostrado**, las dos direcciones:

```
✗ ABORTADO: se descubrieron 47 invariantes y se esperaban 48.
  Hay 1 de MENOS. O se borraron scripts sin ajustar la cuenta, o el patrón de
  descubrimiento dejó de matchear.

✗ ABORTADO: se descubrieron 49 invariantes y se esperaban 48.
  Hay 1 de MÁS: se agregaron invariantes y la cuenta quedó atrás. Subila a 49
  en scripts/run-invariants.mjs, en este mismo commit.
```

Del gate se tocó **solo el piso**. `ci.yml` no se tocó.

### Otras consultas con el mismo patrón que el caso 1 — listadas, sin tocar

Es otro objetivo. Quedan medidas:

1. **`excludeDqWhere`** (`modules/chatbot/server/scoring/dqFilter.ts`) — **7 consumidores de producto y CERO invariantes**. Misma forma que el caso 1, pero sin red de ningún tipo.
2. **`dossier.ts:266, 291, 319, 345, 377, 404, 422`** — siete `updateMany` con el guard de stage **inline** en su `where` (FICHA, CONSTRUCCION cuatro veces, APROBADA dos). Es la máquina de stage que `LEGAL_TRANSITIONS` posee, re-escrita en el `where` de cada consulta: el caso 2 aplicado a consultas.
3. **`assignment-trail.ts:75`** — el canal SISTEMA inline, que es la negación exacta de `SOLO_CONTACTOS_COMERCIALES`. El discriminador, dos veces.
4. **`admin/layout.tsx:23`, `admin/leados/[leadId]/page.tsx:89`, `admin/leados/page.tsx:34`** — el stage EN_REVISION inline en tres lugares: la cola de revisión del admin, tres copias de un discriminador.
5. **`outreach.actions.ts:127-128` y `:190`, `agenda.actions.ts:241-242`** — el lado de ESCRITURA de lo que el contador cuenta: el par canal + resultado escrito inline, sin fragmento que lo posea. `SOLO_DMS_MANDADOS` ahora nombra ese par para las lecturas; para las escrituras sigue suelto.
6. **`api/cron/os-follow-up/route.ts:168, 176`** — el status POSTERGADO inline, dos veces.

Y la familia del caso 3, el borde del día argentino, hoy en cuatro implementaciones: `dates-ar.ts` (la canónica), `outreach.ts:15-33` (copia privada correcta), el cron `os-follow-up:7` (copia privada propia, ya anotada por el comentario de `outreach.ts`), y cuatro helpers de filtro **del lado del cliente** con la misma forma sin zona (`admin/alerts`, `admin/audit-log`, `admin/leads`, `chatbot/activity`). Ninguna se tocó.

### Lo que estos arreglos NO cierran

Se dice en vez de dejarlo implícito:

- **Casos 1 y 3 — la costura del pass-through.** El invariante afirma ahora el objeto exacto que `contarDmsHoy` le entrega a Prisma, y el instante exacto que `pausarLead` guarda. Lo que no puede afirmar es que esas dos funciones **sigan llamando** a la fuente única: es un renglón. Cerrarlo pediría correr la consulta (que cambiaría lo que es un invariante en este repo) o un chequeo por ARCHIVO — y F3 ya midió que un chequeo así pasa en verde sobre el bug que vigila. Es el techo alcanzable sin base.
- **Caso 4 — el renombre coordinado.** Un script que se va y otro que entra conserva la cuenta y pasa. Vigilarlo pide fijar los NOMBRES, que es la segunda lista que este runner existe para no tener.

### Estado

`npx tsc --noEmit` exit 0 · invariantes **47/47** (48 descubiertos, 1 excluido; antes 46/46 sobre 47 — el nuevo entró por descubrimiento) · `npm run build` verde · `prisma generate` no corresponde: el schema no se tocó.

**Ninguna llave de datos se tocó**: ni un nombre de hard-check, ni un id de fase, ni un id de pantalla, ni un texto que se compare contra un blob guardado. `SOLO_DMS_MANDADOS` y `finDePausaAR` son piezas nuevas; el piso es una constante de un script de Node, no un dato. **Ningún cambio de schema. Ninguna transición nueva ni modificada** — el grafo quedó idéntico; el caso 2 cambia quién lo lee, no qué dice. **Ninguna operación sobre la base de datos**: los cuatro casos se resolvieron y se demostraron en frío.

**Ningún invariante existente se debilitó**: el diff de `035f90a1..HEAD` sobre los archivos de invariante no borra ni modifica una sola aserción — 19 renglones nuevos de aserción, cero eliminados.

Los cuatro sabotajes corrieron **de a uno** en un worktree propio y descartable, verificados revertidos por contenido antes de seguir, y el worktree se destruyó al terminar.

### Nada visual

Este sprint no cambia una sola pantalla. No hay nada para mirar. Lo que cambia es que cuatro cosas que podían romperse en silencio ahora gritan.

### Anotado para el sprint siguiente

El barrido de destinos que el producto nombra sin enlazar: «Correcciones» fuera del rail de construcción, y lo que aparezca al censarlo.

---

## Sprint EL ASCENSO — cinco sprints salen del disco de Franco — 2026-08-29

No construye nada. Verifica, sube, y deja un comando.

### Fase 0 · El mapa de ramas

La rama de P3, que en su reporte no quedó nombrada, es **`fix/callejones`**.

La cadena es **lineal**: cada rama es ancestro de la siguiente, verificado con `merge-base --is-ancestor` en los seis eslabones. No divergen, así que no hay ninguna decisión de Franco pendiente acá.

| # | Rama | Hash | Aporta | Sobre | ¿Estaba en origin? |
|---|---|---|---|---|---|
| — | `leados/v1-a-main` | `d167df16` | base | `origin/main` | **sí**, desde hace seis sprints |
| P3 | `fix/callejones` | `a2004edb` | 1 | `leados/v1-a-main` | no |
| P4 | `fix/municiones` | `fa4af2a0` | 1 | `fix/callejones` | no |
| P5 | `fix/vocabulario` | `6ef28432` | 1 | `fix/municiones` | no |
| P6 | `fix/datos-viajan` | `b87bc821` | 1 | `fix/vocabulario` | no |
| P7 | `fix/quinta-superficie` | `035f90a1` | 1 | `fix/datos-viajan` | no |
| P8 | `fix/una-sola-fuente` | `0c92dd08` | 7 | `fix/quinta-superficie` | no |

El `merge-base` de **todas** con `origin/main` es `17727117`, que **es** `origin/main`: la rama que corre es ancestro de la cadena entera.

Censo del riesgo real al arrancar: **seis ramas con 27 commits que no existían en ninguna ref de `origin`**. `leados/v1-a-main` ya estaba a salvo; las otras seis, no.

### Paso 1 · Todo a salvo

Las seis pusheadas una por una con refspec explícito (`refs/heads/X:refs/heads/X`), antes de cualquier verificación. Después del `fetch`, `rev-list --left-right --count <rama>...origin/<rama>`:

| Rama | left/right |
|---|---|
| `leados/v1-a-main` | `0  0` |
| `fix/callejones` | `0  0` |
| `fix/municiones` | `0  0` |
| `fix/vocabulario` | `0  0` |
| `fix/datos-viajan` | `0  0` |
| `fix/quinta-superficie` | `0  0` |
| `fix/una-sola-fuente` | `0  0` |

Y el barrido general: **ninguna** rama local del repo tiene un solo commit fuera de `origin`. Esto solo ya justifica el sprint, y no dependía de que lo demás saliera bien.

### Paso 2 · La punta

**`fix/una-sola-fuente` @ `0c92dd08`.** Verificado, no asumido: `git log --oneline <rama> ^<punta>` sale **vacío** para las seis de la cadena y además para `f1/datos-fecha-contador`, `f2/motivo-rechazo`, `f3/acuse-recibo` y `leados/v1-integracion`. Ninguna aporta un commit que la punta no tenga.

Todo lo que sigue —los cuatro gates y el diagnóstico del ascenso— se midió sobre `0c92dd08`. Este mismo commit de bitácora queda **encima** de esa medición y no toca una línea de código: `git status` mostraba un único archivo modificado. El `build` se volvió a correr después de escribirlo, porque Tailwind escanea `docs/**/*.md` y una vez un renglón de bitácora rompió el build.

### Paso 3 · Los cuatro gates sobre la punta

Secuenciales, en un solo carril.

| Gate | Exit | Resultado |
|---|---|---|
| `npx tsc --noEmit` | **0** | 0 líneas de salida |
| `npm run check:invariants` | **0** | 48 descubiertos · 1 excluido · **47 corridos, 47 pasaron, 0 fallaron** |
| `npm run build` | **0** | compilado en 90 s, 34 páginas estáticas |
| `npx prisma migrate status` | **0** | 86 migraciones, *Database schema is up to date!* — **sin drift** |

Los 47 por nombre: `check:invariant`, `setter-meta`, `escalamiento`, `novedades`, `mis-numeros`, `timeline`, `foco`, `particion`, `flow`, `alta-propia`, `prospecto-import`, `gate-envio`, `self-check`, `progreso`, `reloop-selfcheck`, `manual`, `pantallas`, `turno`, `vista-cartera`, `postergacion`, `contador-dms`, `acuse`, `dossier-stage`, `aprobada-sin-link`, `draft-url-mensaje`, `security`, `lead-scoring`, `dates-ar`, `lead-status`, `home-metrics`, `lead-detail`, `recommendations`, `gbp-connection`, `modules`, `motor-resenas-view`, `upsell-dedup`, `announcements`, `referrals`, `client-notifications`, `executive-report-plan`, `executive-report-prefs`, `brief-input`, `client-monthly-report`, `notifications-brevo`, `mask-secret`, `cron-secret`, `pausa-dia`. El excluido sigue siendo `client-monthly-report-pdf`, que necesita base.

**Las suites de Playwright NO se corrieron, y no se inventan.** No existe `.env.test`: tanto `playwright.leados.config.ts` como `playwright.setter.config.ts` hacen `dotenv.config({ path: '.env.local' })`, o sea que resolverían contra la base **dev de Neon**. Y las specs de `tests/leados` escriben: `osLead.create`, `osLead.update`, `osLeadDossier.update`, `organization.delete`, `deleteMany`. Correrlas violaba la regla de cero escrituras sobre la base. `test:setter` además levanta `start:setter` (build de producción + server). Queda pendiente para cuando exista una base de test dedicada — que es lo mismo que ya pide el job `test-leados` del CI.

### Paso 4 · El diagnóstico del ascenso

`origin/main` **no se movió**: sigue en `17727117`, del 18 de agosto. El censo vale.

- **¿Fast-forward?** Sí. `merge-base --is-ancestor origin/main <punta>` da verdadero, y `rev-list --left-right --count origin/main...<punta>` da **`0  31`**: cero commits que la rama que corre tenga y la punta no.
- **¿Conflictos?** Ninguno. `git merge-tree --write-tree origin/main <punta>` sale con exit **0** y una sola línea de salida — el OID del árbol resultante, `77662f44…`, que es **idéntico** al `<punta>^{tree}`. Un merge que produce exactamente el árbol de la punta es la definición operativa de un fast-forward.

Por lo tanto **no hubo conflicto de bitácora que resolver**, y los ocho chequeos de concatenación de P2 no corresponden: no se concatenó nada. No se tocó una sola línea de `src/`.

`prisma/` no lo toca la cadena — cero archivos —, así que `prisma generate` no corresponde.

Fuera de `src/` y `docs/`, la cadena toca: `.github/workflows/ci.yml` (el gate que enciende C1), `logic-core-v3/.github/workflows/e2e.yml`, `next.config.ts`, `package.json`, `scripts/run-invariants.mjs` y nueve specs de `tests/`.

### Paso 5 · Nada se perdió

`git log --oneline origin/main ^<punta>` → **vacío**. `git diff origin/main <punta> --stat -- src/` → **50 archivos, 3.340 inserciones, 239 borrados**.

Los seis frentes, afirmados **por contenido** contra el árbol commiteado de la punta y contrastados contra `origin/main`:

| Frente | Marcador | punta | origin/main |
|---|---|---|---|
| Las salidas visibles sin desplegar | `SalidaLinkPendiente` en `tool-guide.tsx` | 2 | 0 |
| La fecha de postergación | `parseCalendarDayAR` en `dates-ar.ts` | 1 | 0 |
| …y que viaja a la tarjeta | `reactivateAt` en `flow.ts` | 5 | 1 |
| Las causas de espera | `export type CausaEspera` en `turno.ts` | 1 | 0 |
| La tarjeta del aprobado sin link | `FALTA_LINK_PERMANENTE` en `turno.ts` | 1 | 0 |
| …y su contador | `contarEnVueloPorTurno` en `flow.ts` | 1 | 0 |
| El fragmento único del contador | `SOLO_DMS_MANDADOS` / `dmsMandadosHoyWhere` | 5 | 0 |
| …consumido por la consulta | `where: dmsMandadosHoyWhere` en `outreach.ts` | 1 | 0 |
| El piso exacto de invariantes | `INVARIANTES_ESPERADOS = 48` | 4 | 0 |

**Una corrección de conteo.** El pedido hablaba de «las seis causas de espera»; la unión `CausaEspera` tiene **siete** miembros. Reconcilia: seis son esperas reales —`reunion`, `cierre`, `descarte`, `revision`, `linkPermanente` (las cinco de Franco) y `respuesta` (la del negocio)— y la séptima, `accionPropia`, mapea a `'setter'` y está documentada en el propio tipo como «**No es espera**: hay algo trabado esperando al setter». Las siete están desde `fix/datos-viajan`; `fix/quinta-superficie` no agregó ninguna causa, agregó la cadena de copy `FALTA_LINK_PERMANENTE`.

### El comando para Franco — NO se corrió

**No se pusheó a `main`. Ni una vez.** Lo que quedó pusheado son las seis ramas de la cadena, cada una a su propio nombre.

El ascenso es de Franco:

    git fetch origin
    git push origin refs/heads/fix/una-sola-fuente:refs/heads/main

El refspec es explícito de los dos lados a propósito: un `git push` pelado sobre una rama que trackea `origin/main` apunta a `main` sin decirlo, y ese es exactamente el accidente que este sprint existe para no tener.

Como es fast-forward puro, no hace falta `--force` ni nada parecido. Si el push rebota, es porque `origin/main` se movió después de este censo: en ese caso **no forzar** — volver a correr el diagnóstico del Paso 4, que es lo que decide si sigue siendo fast-forward.

### Qué queda para la verificación humana

- **El push a `main`.** Es de Franco y de nadie más.
- **La corrida de CI sobre `main` después.** Va a ser la **primera vez** que el gate corre sobre `main`: hasta hoy `ci.yml` vivió solo en ramas. Los tres jobs de secrets (`test-leados`, `e2e`) van a saltearse con warning visible mientras no haya `DATABASE_URL_TEST` — eso es lo esperado, no una falla.

### Anotado, sin hacer

- No existe `.env.test`. Mientras no exista, las dos suites de Playwright solo pueden correr contra la base dev, y ninguna verificación de cierre puede incluirlas sin escribir en datos reales.
- Las seis ramas quedaron pusheadas **sin upstream configurado** (refspec explícito, sin `-u`). Es deliberado: no se tocó configuración. Pero significa que un `git push` pelado parado en cualquiera de ellas sigue siendo ambiguo.

---

## Sprint DESTINOS ALCANZABLES — el censo de las quince pantallas — 2026-08-30

**Base:** `fix/una-sola-fuente @ 1f43c7bf` (la punta de la cadena). Rama: `fix/destinos-alcanzables`.
**Fase 0 en verde:** `tsc --noEmit` exit 0 · invariantes **47/47** (48 descubiertos, 1 excluido) · `test:leados` **25 passed** · `migrate status` sin drift.

El patrón había aparecido tres veces sin que nadie lo buscara (P3, P5, P6) y una cuarta forma la había cerrado P4 en un caso. **Nunca se censó entero.** Este sprint lo censa y arregla.

### Paso 1 · El censo — y el censo ES el hallazgo

Recorrido por ESTADO, no por pantalla: la misma pantalla dice cosas distintas en construcción y en rechazada, y la tercera forma sólo aparece mirando estados. **19 menciones con defecto**, en **cinco formas** — apareció una quinta.

#### Clase 1 — se nombra un destino y no hay enlace (4 casos)

| Dónde se nombra | Qué se nombra | Tipo | ¿Alcanzable desde acá? | Si no: por qué |
|---|---|---|---|---|
| `m-construccion.tsx:173` · mc1/mc2 en RECHAZADA | «Correcciones» | Pantalla | **No** | Falta el enlace. Único camino: el «Ir a tu paso actual» genérico, que no dice a dónde lleva |
| `m5-seguimiento.tsx:159` · m5 con el negocio respondido | «Agendá la reunión» | Pantalla | **No** | Falta el enlace — y en APROBADA-sin-envío m16 ni siquiera está habilitada |
| `seguimiento-form.tsx:44` · m5, opción «Respondió» | «Agendá la reunión» | Pantalla | **No** | En ese momento del recorrido m16 no existe |
| `opener-form.tsx:151` · m4 con el opener ya mandado | «Seguimiento» | Pantalla | **No** | Falta el enlace **y** el nombre no coincide |

#### Clase 2 — el nombre no coincide con el del control real (8 casos)

| Dónde se nombra | Qué se nombra | Tipo | ¿Alcanzable? | Si no: por qué |
|---|---|---|---|---|
| `herramientas.ts:71` · m6 | «el bloque … acá abajo» | Pantalla (zona) | Sí, **arriba** | La dirección es al revés: el bloque vive en «Contexto del lead», que el layout pinta ANTES de «Munición» |
| `herramientas.ts:86` · mc1/mc2/mr | «el bloque … de acá abajo» | Pantalla (zona) | Sí, **arriba** | Ídem |
| `flow-content.ts:56` · mc1 (fase Estructura) | «el bloque del brief … acá abajo» | Pantalla (zona) | Sí, **arriba** | Ídem + el bloque se llama «Bloque para Claude Design», no «del brief» |
| `flow-content.ts:235` · m14, check `noPareceIa` en rojo | «Ojo de diseño» | Bloque | Sí (está abajo) | El rótulo real es «Delatores de siempre — no bloquean, pero Franco los ve» |
| `guidance-content.ts:823` · m16 con el gate cerrado | «Seguimiento» | Pantalla | Sí (hay botón) | El botón de al lado se llama «Registrá lo que pasó» |
| `flow-content.ts` · m14, 6 `arreglo` en rojo | «Construcción, fase Mobile/CTA/…» | Pantalla | Sí | «Construcción» es la FASE; las pantallas son «Construir» y «Refinar» — y no decía cuál |
| `m14-chequeo.tsx:58` · m14 sin borrador | «pantalla anterior» | Pantalla | Sí | No la nombra |
| `m2-evaluador.tsx:66` · m2 sin ficha (rama defensiva) | «la pantalla anterior» | Pantalla | — | No la nombra |

#### Clase 3 — se instruye una acción que en ese estado no existe (3 casos)

| Dónde se nombra | Qué se nombra | Tipo | ¿Se puede hacer? | Si no: por qué |
|---|---|---|---|---|
| `GUIA_AGENDA.pasos` · **m16 con el gate cerrado** | «Tocá «Buscar horarios libres de Franco»» + 2 pasos más | Acción | **No** | Los controles no se montan; `AgendaForm` sólo existe con status RESPONDIO |
| `herramientas.ts:61` · m2 con el veredicto ya registrado | «Eso es lo que transcribís acá abajo» | Acción | **No** | Abajo hay un resumen read-only |
| `herramientas.ts:100` · m13 con el borrador congelado | «pegás abajo como «URL del borrador»» | Acción | **No** | El motor guarda el link SÓLO en CONSTRUCCION |

**El caso de m16 es el más caro del censo y no es un rincón:** con la demo aprobada y enviada y el negocio todavía sin contestar, `posicionDe` devuelve **`actual = 'm16'`**. Es la pantalla de AHORA del setter en el estado más común del tramo final, y le decía que tocara un botón que no está. Es la forma que P4 cerró en m13 («pegala acá abajo»), un piso más arriba.

#### Clase 4 — herramienta sin manera de abrirla (0 en las quince; 1 en el shell)

P4 puso la salida (`SalidaLinkPendiente`) y el censo la encontró **completa**: las apariciones de la píldora dentro de las quince pantallas —las de `ToolGuide` (m2, m4, m6, mc1/mc2/mr, m13) y la suelta del bloque de objeciones de m5— la traen. **Sin casos.**

Lo único sin salida es el rail «Tus herramientas» del shell (`tools-rail.tsx:41`), que dice «pendiente» y nada más. No es una de las quince pantallas, y la salida sí está en cada pantalla donde la herramienta se usa. **Declarado, no tocado.**

#### Clase 5 — LA FORMA NUEVA: el único camino es un enlace genérico que no nombra el destino (2 casos)

No es «falta el enlace» ni «el nombre no coincide»: el enlace **está**, **funciona**, y **es genérico**. El setter no tiene cómo saber que ese botón lo lleva ahí.

| Dónde | Destino nombrado | Único camino real |
|---|---|---|
| mc1/mc2 en RECHAZADA | «Correcciones» | «Ir a tu paso actual» (en RECHAZADA `actual` es SIEMPRE `mr` — medido sobre la derivación) |
| m14 con checks en rojo | «Construcción, fase X» | «Ir a tu paso actual» o los chips «Construir»/«Refinar» de la nav |

Esto reencuadra el hallazgo de P6: «Correcciones» **sí** era alcanzable — por un enlace que no la nombra. Por eso el censo se hizo midiendo, no leyendo: la matriz de 6.912 estados se recorrió importando `derivarPantalla`.

#### Y una sexta, que encontró el invariante: el enlace que REBOTA

Con el invariante puesto, la primera corrida levantó algo que el censo a ojo no vio, y **es pre-existente (P3)**:

> `EnlaceChequeoFinal` se monta por **STAGE** (`stage === 'CONSTRUCCION'`) y la posición se deriva antes por **STATUS**. Un lead **PERDIDO** con el dossier en CONSTRUCCION cae a `archivo` con `habilitadas` vacía, mc1/mc2 siguen navegables como completadas, y los dos destinos del enlace dejan de existir: el salto rebotaba contra el `redirect` de la guardia. El mismo callejón que la pieza vino a cerrar, un status más allá.

La misma trampa se comió mi primer intento del enlace a «Correcciones» (lo escribí como incondicional porque RECHAZADA devuelve `mr` en `habilitadas` — falso: PERDIDO corta antes). **Ninguno de los dos habría salido en rojo sin el barrido.**

### Paso 2 · Qué se arregló, por clase

Se arreglaron **las tres clases que frenan** (1, 2 y 3) — quince casos —, más el rebote que encontró el invariante.

**Clase 2 (8 casos, la más numerosa — se empezó por acá).** «acá abajo» → «acá arriba» en los tres textos que apuntaban al bloque copiable; «Ojo de diseño» → «Delatores de siempre»; «Seguimiento» → «Registrá lo que pasó»; «Construcción, fase X» → «"Refinar", fase Mobile» / «"Construir", fase Assets reales» (la pantalla del rail, con la fase que es su `<h3>`); «pantalla anterior» → «Borrador» / «Ficha».

**Clase 1 (4 casos).** Pieza nueva `EnlacePantalla`, hermana de `EnlaceChequeoFinal` y con su mismo contrato, generalizado: el nombre **sale del registro** (`PANTALLAS`), no se escribe a mano —así no puede volver a decir «Seguimiento» cuando la pantalla se llama «Registrá lo que pasó»—, y el salto sólo se ofrece si la posición derivada alcanza el destino; sin acceso nombra el destino igual y dice qué falta. La accesibilidad la calcula la página con el **mismo predicado que su guardia** (`alcanzable`).

El motivo del tilde salió de adentro del `<button>` —donde un `<a>` no es navegable, y con tres tildes por pantalla era el mismo párrafo tres veces— y quedó una vez arriba del grupo, con «Correcciones» enlazada.

**Clase 3 (3 casos).** `M16Municion` pasa a derivar el estado del paso con la MISMA función que el registro (`estadoDeAgenda`, exportada): con el gate cerrado los cuatro pasos siguen —enseñan el recorrido— pero anunciados como futuro («Todavía no: estos son los pasos que vas a hacer acá cuando el negocio acepte reunirse — los controles aparecen recién ahí»); con la reunión ya agendada no van. Los dos textos de herramienta que mandaban a un campo inexistente pasan a describir la salida sin apuntar a un control.

**El rebote (pre-existente).** `EnlaceChequeoFinal` toma `destinoAccesible` y, sin acceso, nombra el chequeo sin ofrecer salto.

### Paso 3 · Verificación

**Operando la app** (build de producción aislado, `E2E_DIST_DIR=.next-setter`, :3007, viewport 1440×900, sesión minteada como el smoke). Diez casos, cada uno mostrando la MENCIÓN y el ALCANCE:

| Caso | Mención en pantalla | Alcance |
|---|---|---|
| 1 · «Correcciones» desde mc1 (RECHAZADA) | «…el botón «Reabrir construcción» está en «Correcciones».» | `<a>` «Correcciones» → `/manual/mr` · **click → `/manual/mr`, h2 «Aplicá las correcciones de Franco»** |
| 2 · el bloque que la munición nombra (mc1) | «…«para Claude Design» (está acá arriba)…» | bloque presente en «Contexto del lead» · orden real del DOM: **Contexto ARRIBA de Munición** |
| 3 · el gate de la agenda (m16 cerrado) | «…cuando marcás «Respondió» en «Registrá lo que pasó»…» | `<a>` «Ir a «Registrá lo que pasó»» → `/manual/m5` |
| 4 · m16 con el gate CERRADO | «Todavía no: estos son los pasos que vas a hacer acá cuando…» | botón «Buscar horarios libres de Franco» en pantalla: **0** |
| 4b · m16 con el gate ABIERTO | sin el aviso de futuro: los pasos son órdenes | botón «Buscar horarios libres de Franco»: **1** |
| 5 · el resumen del opener (m4) | «La conversación sigue en «Registrá lo que pasó».» | `<a>` → `/manual/m5` |
| 6 · los arreglos del chequeo (m14) | «Volvé a Claude Design («Refinar», fase Mobile)…» | rótulo «Delatores de siempre» presente en pantalla |
| 7 · «Agendá la reunión» desde m5, **con** acceso | «…la reunión, que se agenda en «Agendá la reunión».» | `<a>` → `/manual/m16` |
| 8 · la MISMA mención **sin** acceso (aprobada sin link de Franco) | «…«Agendá la reunión» — se abre cuando la demo aprobada ya salió al negocio.» | **sin enlace, con el motivo al lado** |
| 9 · m13 con el borrador congelado | «…Esa es la que se registra como «URL del borrador».» | no hay campo abajo — por eso el texto ya no manda a pegarla |
| 10 · m2 con el veredicto registrado | «…y el razonamiento. Eso es lo que traés de vuelta al panel.» | abajo es el resumen read-only, no un formulario |

Capturas en `docs/proof-screenshots/destinos-alcanzables/` (el directorio está gitignoreado: es registro local).

**Tests — uno por CLASE, no por caso** (`tests/setter/17-destinos-alcanzables.spec.ts`, 4 tests). Se afirma por **visibilidad**, y el nombre esperado **no se escribe**: sale de `PANTALLAS`, el mismo registro del que sale el control. **Demostrados fallando contra el código viejo** (src revertido a la base, rebuild, misma suite):

```
clase 1 · «Correcciones»             → Error: element(s) not found  (a[href$="/manual/mr"])
clase 2 · el gate de la agenda       → la instrucción nombra la pantalla, no la fase
clase 2 · el bloque copiable         → toContainText('está acá arriba') falló
clase 3 · la agenda con gate cerrado → la munición no declaraba el recorrido como futuro
4 failed
```

Con el arreglo puesto: **4 passed**.

**Invariante** (`check:invariant:enlaces`, `src/lib/leados/enlaces-manual.invariant.ts`) — dos reglas, las dos **afirmables sin leer prosa**:

1. **Ningún enlace del manual rebota, y ninguno se gatea de más.** Los 7 saltos pantalla→pantalla que el manual ofrece se declaran con su condición de render y su garantía (`siempre` / `condicional`), y se barren los **6.912 estados** que la derivación distingue (**10.640 ejercicios**). Se afirman las DOS direcciones: un `siempre` que miente es un enlace roto; un `condicional` que nunca falla es una rama de copy que ningún estado muestra.
2. **Ninguna guía manda a una fase que no es una pantalla.** El conjunto prohibido se **deriva** de tres registros — los títulos de `FASES_MANUAL` que no son también nombre de pantalla (`PANTALLAS`) ni etiqueta de stage (`STAGE_LABELS`, que sí se cita con razón). Hoy da `[Seguimiento]`, exactamente el nombre ambiguo. Barre **79 citas** de los registros de contenido exportados.

**Demostrado fallando, las dos:**

```
// regla 2, contra el copy viejo
AssertionError: "Seguimiento" es el titulo de una FASE y no el nombre de ninguna
pantalla ni de ningun stage … En guidance-content.GUIA_AGENDA.gate.detalle[1].enfasis

// regla 1, contra la suposición vieja (garantia: 'siempre' en mc1/mc2 → mr)
AssertionError: enlace roto: desde "Construir" se ofrece el salto directo a
"Correcciones", pero la derivacion no lo alcanza en stage=RECHAZADA status=PERDIDO
```

Y **dos guards contra el falso verde**, que no son decorativos — los dos frenaron algo en esta misma corrida:

- `ejercitados > 0` por enlace: rechazó un renglón que agregué para `m14 → m13` («Ir a publicar el borrador»). Su condición de render es `CONSTRUCCION ∧ ¬draftUrl`, y en ese estado m14 **no** es accesible: es una rama defensiva que ningún estado alcanza. El renglón no afirmaba nada. Se sacó, con el motivo escrito.
- `FASES_SIN_DESTINO.length > 0`: si toda fase pasara a nombrar una pantalla, la regla 2 pasaría en verde sin mirar nada — y falla ruidosa pidiendo borrarla a mano.

**El alcance del invariante, dicho:** la regla 2 recorre los registros de contenido exportados (`guidance-content`, `herramientas`, `flow-content`). No recorre las literales sueltas en JSX —ahí el nombre ya no se escribe a mano: `EnlacePantalla` lo lee de `PANTALLAS`— ni el cartel del home (`paso.ts`), que es otra superficie.

### Un falso verde que casi entra, y no era el sujeto del sprint

El primer arreglo de la clase 1 dejó `01-flow · B5` en rojo. **Se midió antes de atribuirlo**: revertir `src/` a la base, rebuildear y correr B5 solo → **passed**. Era mío.

La causa: `expectToast` (helper compartido) busca el texto del toast con `page.getByText(...)` **sobre la página entera**, no dentro del contenedor de toasts. Mi copy nueva decía «Los tildes se abren **con la construcción arrancada** — …», que satisface `expectToast(/Construcción arrancada/i)` **antes del click**; el test seguía y leía el dossier antes de que la transición commiteara.

Arreglado en la copy (subjuntivo: «cuando arranques» / «cuando reabrís», que además deja las dos ramas paralelas), con la nota del porqué al lado para que no vuelva. Barrido el resto de la copy nueva contra los 8 patrones de `expectToast` de la suite: sin más colisiones.

**El agujero del helper queda REPORTADO, no tocado** (es otra clase de trabajo): `expectToast` puede dar verde sobre texto del cuerpo. Fijarlo pide scopearlo al contenedor de Sonner y re-verificar sus call-sites.

### Cierre

- `npx tsc --noEmit` → **exit 0**
- `npm run check:invariants` → **descubiertos 49 · corridos 48 · pasaron 48 · fallaron 0** (`INVARIANTES_ESPERADOS` 48 → 49, en este mismo commit)
- `npm run test:setter` → **93 passed** (89 previos + los 4 nuevos)
- `npm run test:leados` → **25 passed**
- `npm run build` → **exit 0**
- `npx prisma migrate status` → **Database schema is up to date!** (sin drift; no se tocó el schema, no hizo falta `prisma generate`)

**Ninguna llave de datos se tocó.** `HardCheck.nombre` y `SoftCheck.etiqueta` (lo que persiste `selfCheckJson`) quedaron **literales**: sólo se editaron `arreglo` y `comoVerificar`, que no viajan al blob. `FaseId` / `SHELL_CONSTRUCCION[].id` (llave de `progresoJson`) intactos: se editó un `items[]`. `PANTALLA_IDS`, `PANTALLA_DE_FASE` y `FASES_MANUAL` sin tocar.

**Ninguna transición cambió.** No se agregó ni modificó ningún camino de `LEGAL_TRANSITIONS`; `reabrirConstruccion` e `iniciarConstruccion` siguen exactamente donde estaban — lo que se agregó es un ENLACE a la pantalla que ya tenía el botón, no una segunda superficie para la action.

**Ningún invariante quedó en rojo.** Ninguna escritura sobre la base fuera de los seeds de QA (borrados por `businessName` exacto). **No se pusheó a `main`.**

### Anotado, sin hacer

- **`expectToast` matchea sobre la página entera** (arriba). Es el agujero que más caro puede salir: hace verde un test sobre copy del cuerpo.
- **`m5-seguimiento.tsx:63` — `Date.now()` en render** (`react-hooks/purity`, error de lint). **Pre-existente**, verificado contra el diff: mis hunks arrancan en las líneas 22 y 145+.
- **El rail «Tus herramientas» dice «pendiente» sin salida** (`tools-rail.tsx:41`). Es shell, no una de las quince.
- **`paso.ts:184`** — el cartel del home dice «mandá el link y seguí el contacto en «Seguimiento»». Nombra la fase, y además el envío tiene pantalla propia («Envío», m15) desde el corte 5.6. Es otra superficie: no entra en el censo ni en el invariante.
- **Contenido muerto que nombra destinos**: `GUIA_CONSTRUCCION`, `GUIA_BRIEF.intro/gate/porque/ejemplos`, `GUIA_OPENER.porque/ejemplos`, `GUIA_SEGUIMIENTO.intro/porque/ejemplos`, `GUIA_TRASPASO` y `GUIA_REVISION.aprobada` **no tienen consumidores**. Sus dos menciones de «Seguimiento» se corrigieron igual (para que el invariante pueda barrer el módulo entero sin agujeros), pero **borrar el contenido muerto es otro sprint**.
- **Menciones que NO son defecto y quedan como están**: las que declaran su condición en la misma frase (`GUIA_OPENER.gate` → «eso lo registrás en «Envío», **cuando el negocio respondió**»; los cuatro «todavía no» de `GUIA_ENVIO.espera`). Informan un futuro, no mandan a buscar nada.

### Qué queda para la verificación humana

- **Que los textos nuevos suenen como el resto.** Ningún test lo valida.
- **Que el recorrido completo ya no mande a buscar nada.** Eso se prueba recorriéndolo entero, y es de la corrida de comportamiento pendiente.

---

## Sprint LOS HELPERS QUE PRUEBAN — la capa que verifica todo lo demás, sometida al mismo sabotaje — 2026-08-30

**Rama:** `fix/helpers-que-prueban` sobre `fix/destinos-alcanzables` @`1596b1cb` (P10, sin pushear). Worktree propio en `C:/tmp/wt-helpers`, con junction al `node_modules` del checkout. **No se pusheó a `main`.**

**El sujeto:** no el producto — los helpers. P10 encontró por accidente que `expectToast` buscaba el texto del toast con `page.getByText(...)` sobre la **página entera**: una copy que contuviera la frase lo satisfacía antes del click. El precio ya lo había pagado el producto — `m-construccion.tsx` tiene una nota de redacción explicando que su copy está en subjuntivo *para esquivar el helper*. La red de invariantes ya pasó por una auditoría de sabotaje (C0: dos de seis pasaban en verde ante el sabotaje real). La suite de pruebas nunca. Son 93 de setter más 25 de leados, y un helper roto no falla una prueba: falla todas las que lo usan, en silencio.

### Fase 0 — el terreno

- `npx tsc --noEmit` → **exit 0**
- `npm run check:invariants` → **descubiertos 49 · excluidos 1 · corridos 48 · pasaron 48 · fallaron 0**
- `npx prisma migrate status` → **Database schema is up to date!** (sin drift)
- `playwright test --list` (sin correr nada): **93 pruebas de setter en 20 archivos**, **25 de leados en 6 archivos**
- Cambios ajenos: `?? docs/` en el checkout principal. Trece worktrees vivos, dos stashes. No se tocó ninguno.

**Y una corrección de la premisa del sprint, medida:** no es solo la suite de leados la que escribe. **Las dos escriben, y por el mismo archivo** — `tests/helpers/setter-db.ts` (`createSetter`, `createLead`, `registerActivity`, `createNotice`, `teardown`) lo importan las 6 specs de leados **y las 20 de setter**. Los datos van namespaced (`SMOKE-SETTER`) y el teardown borra por id exacto, pero son escrituras sobre la Neon dev compartida. Por la regla del sprint, **no se corrió ninguna de las dos**. Lo que eso cuesta está declarado abajo, en el Paso 3.

### Paso 1 — el censo

Los seis archivos de `tests/helpers/` exportan **19 símbolos**. La columna que decide es la tercera: la distancia entre lo que el nombre promete y el ámbito sobre el que el helper realmente afirma.

| Helper | Promete | Afirma sobre | Llamadas / archivos / pruebas de las 118 en juego | ¿Puede pasar sin la conducta? |
|---|---|---|---|---|
| `expectToast` (`setter-ui.ts:50`) | que apareció un aviso | **la página entera** (`page.getByText`) | 19 / 3 / 11 | **SÍ — medido** |
| `pickSelect` (`setter-ui.ts:26`) | que se eligió una opción | nada: hace dos clicks y vuelve | 7 / 4 / 13 | **SÍ — medido** |
| `fieldControl` (`setter-ui.ts:42`) | el control de un campo por su etiqueta | cualquier `label` que **contenga** el texto | 21 / 4 / 16 | **SÍ — medido** (latente, ver abajo) |
| `setControlledSelect` (`form.ts:20`) | que quedó elegido ese valor | nada: setea y despacha eventos | 6 / 3 / 0 | **SÍ — medido** |
| `typeControlledInput` (`form.ts:14`) | que se tecleó el texto | nada: click + tipeo | 28 / 4 / 0 | **SÍ — medido** |
| `setControlledInput` (`form.ts:3`) | escribir salteando React | nada; y saltea también el `readonly` | 0 / 0 / 0 | **SÍ — inherente a la técnica** |
| `firstVisible` (`setter-ui.ts:17`) | el primer match **visible** | el locator, filtrado a visible | 240 / 19 / 81 | No |
| `vis` (`setter-ui.ts:12`) | los matches visibles | el locator, filtrado a visible | 2 / 2 / 11 | No |
| `expandCartera` (`setter-ui.ts:67`) | que la cartera quedó abierta | el buscador visible (post-condición real) | 12 / 6 / 33 | No |
| `attachConsoleGuard` (`setter-auth.ts:100`) | acumular errores de consola | `console.error` + `pageerror` | 47 / 18 / 79 | No |
| `expectNoConsoleErrors` (`setter-auth.ts:115`) | cero errores | la lista del guard | 46 / 17 / 79 | No |
| `qaLogin` (`setter-auth.ts:67`) | sesión de esa persona | que la persona **existe en la DB** — no que la sesión sirva | 74 / 19 / 81 | No (falla ruidoso, lejos de la causa) |
| `mintSessionCookie` (`setter-auth.ts:75`) | sesión de un usuario arbitrario | nada; el cookie se mintea y ya | 9 / 6 / 12 | No (mismo caso) |
| `loginAsAdmin` / `loginAsClient` (`auth.ts:20,24`) | login por formulario | `waitForURL(/\/admin\|\/dashboard/)` | 18+16 / 14+10 / 0 | No |
| `logout` (`auth.ts:28`) | cerrar sesión | `waitForURL(/\/login/)` | **0 / 0 / 0 — muerto** | — |
| `qaLogout` (`setter-auth.ts:84`) | limpiar la sesión | nada | **0 / 0 / 0 — muerto** | — |
| `getSetterQa` (`setter-db.ts:144`) | la persona QA | lanza con mensaje si no está seedeada | 74 / 18 / 81 | No |
| `ensureClientBot` / `cleanupClientBot` | fixture de bot | lanza si falta la organización | 3+3 / 3 / 0 | No |
| `createLead` / `createSetter` / `teardown` | seed/teardown | fixtures, no afirman | 102 / 25 / 88 | — (no son aserciones) |

**Helpers de archivo** (compartidos dentro de una spec), revisados uno por uno: `main()` y `zona()` (14/15/16/17) son `firstVisible` sobre `main` — mismo veredicto; `linksAPantalla()` cuenta `a[href$=...]` — no vacuo; `nadaDesplegado()` (16) afirma `toHaveCount(0)` sobre `main details[open]` — **no es vacuo: hay `<details>` reales en 10 componentes del setter**; `beforeunloadPrevented()` (10/13) dispara el evento y lee `defaultPrevented` — real; `expectRejects()` / `expectThrows()` / `assertSinEnvio()` (leados) tienen post-condición verdadera; `esErrorDeConexion()` (06/12) **no saltea el test**: re-lanza con mejor mensaje.

### Paso 2 — el sabotaje

Un banco propio: **`tests/helpers-probe/`** con config sin `webServer` y sin DB — cada caso arma su DOM con `page.setContent()`. El sujeto es el helper, aislado del producto. Cada uno va **de a pares**: CONDUCTA (la conducta ocurrió → debe pasar) y SABOTAJE (no ocurrió, pero el señuelo está → debe fallar). Sin el par, un helper que falla siempre también estaría "verde".

**Siete sabotajes que los helpers pasaron — siete falsos verdes:**

```
HELPER     expectToast — tests/helpers/setter-ui.ts:50
PROMESA    que apareció el aviso «Construcción arrancada»
ÁMBITO     la página entera: page.getByText(text)
SABOTAJE   la frase en el cuerpo («Los tildes se abren con la construcción
           arrancada — …», la copy REAL previa a P10) y CERO toasts emitidos
RESULTADO  PASA (falso verde)
ALCANCE    19 llamadas · 3 archivos · 11 de las 118 pruebas

HELPER     expectToast (segundo ámbito)
SABOTAJE   el aviso SÍ llegó, pero dice «No pudimos guardar. Reintentá.»
RESULTADO  PASA (falso verde) — el error se leía como éxito

HELPER     pickSelect — tests/helpers/setter-ui.ts:26
PROMESA    que se eligió la opción del <Select> compartido
ÁMBITO     ninguno: click en el trigger, click en la opción, return
SABOTAJE   la opción se clickea y el commit NO ocurre (el trigger queda vacío)
RESULTADO  PASA (falso verde)
ALCANCE    7 llamadas · 4 archivos · 13 de las 118 pruebas

HELPER     setControlledSelect — tests/helpers/form.ts:20
PROMESA    que el <select> quedó en ese valor
ÁMBITO     ninguno
SABOTAJE   se pide un valor que NINGUNA opción tiene (opción renombrada)
RESULTADO  PASA (falso verde) — el setter nativo lo descarta en silencio y
           select.value queda en ""
ALCANCE    6 llamadas · 3 archivos (todos en tests/e2e)

HELPER     typeControlledInput — tests/helpers/form.ts:14
PROMESA    que se tecleó el texto
ÁMBITO     ninguno
SABOTAJE   el input es readonly: pressSequentially no lanza y no escribe nada
RESULTADO  PASA (falso verde)
ALCANCE    28 llamadas · 4 archivos (todos en tests/e2e)

HELPER     fieldControl — tests/helpers/setter-ui.ts:42
PROMESA    el control del campo etiquetado X
ÁMBITO     TODO label que CONTENGA X — y los 21 call sites lo envuelven en
           firstVisible(), que hace .first() y elige en silencio
SABOTAJE   dos campos en pantalla: «Notas de traspaso para Franco» y
           «Nota (opcional)». Se pide «Nota»
RESULTADO  PASA (falso verde): escribe en el campo que NO era
ALCANCE    21 llamadas · 4 archivos · 16 de las 118 pruebas

HELPER     setControlledInput — tests/helpers/form.ts:3
SABOTAJE   el input es readonly
RESULTADO  PASA — pero es INHERENTE: el setter nativo del prototipo existe para
           saltear la intercepción de React, y de paso saltea el readonly.
ALCANCE    0 llamadas — está muerto
```

**Seis sabotajes que los helpers resistieron.** Este prompt esperaba encontrar más agujeros de los que hay; se buscó activamente que estuviera equivocado, y en seis casos lo estaba:

| Helper | Sabotaje | Resultado |
|---|---|---|
| `expectToast` | la frase vive en el `<select>` espejo `sr-only` que monta `<Select>` | **FALLA — protege** |
| `pickSelect` | la opción ya estaba en el DOM y el click del trigger **cerró** el panel | **FALLA — protege** (el rol no se computa bajo `display:none`) |
| `expandCartera` | el toggle deja `aria-expanded="true"` y el cuerpo nunca monta | **FALLA — protege** |
| `firstVisible` | el texto existe SOLO en la copia responsive oculta | **FALLA — protege** |
| `attachConsoleGuard` + `expectNoConsoleErrors` | la página emite un `console.error` | **FALLA — protege** |
| `attachConsoleGuard` + `expectNoConsoleErrors` | excepción no manejada (`pageerror`) | **FALLA — protege** |

El guard de consola era el segundo candidato más apalancado (46 pruebas afirman sobre una lista, y una lista que nunca se llenó también está vacía). **Protege.** Lo que sí quedó escrito y ejecutable es su condición de uso: solo ve lo que pasa **después** de engancharse. Hoy los 46 call sites lo atan como primera línea del test, antes de cualquier `page.goto` — se verificó los 46, cero excepciones — pero la regla no estaba en ningún lado.

### Paso 3 — a quién arrastraba: lo que se midió y lo que NO se pudo correr

**Lo que no se hizo, y por qué.** El Paso 3 pide correr todas las pruebas que usan cada helper arreglado y listar las que se caen. **No se corrió ninguna de las dos suites**: las dos escriben sobre la Neon dev compartida (arriba, Fase 0), y la regla del sprint es explícita. La consecuencia, dicha sin maquillar: **la lista empírica de pruebas caídas no existe en este sprint.** Queda como el primer trabajo de quien corra las suites.

**Lo que sí se midió, sin base de datos.** Se barrió el radio estático de los 19 call sites de `expectToast`: para cada patrón, todas las coincidencias en **código vivo** de `src/` (excluyendo comentarios), clasificadas por si son el toast, otra pantalla, o copy del cuerpo.

| Patrón | Call sites | Coincidencias vivas | Veredicto |
|---|---|---|---|
| `/Ficha guardada — ya tenés señal/i` | 2 | 1 — es el toast | el arreglo es **neutral** |
| `/Opener registrado/i` | 2 | 2 — las dos ramas del mismo toast | **neutral** |
| `/enviada a revisión/i` | 2 | 1 — es el toast | **neutral** |
| `/preferencias del reporte guardadas/i` | 3 | 1 — es el toast | **neutral** |
| `/Construcción arrancada/i` | 2 | 2 — el toast y `error-copy.ts:61` (toast de error) | señuelo de cuerpo **ya neutralizado por P10 en la copy** |
| `/Evaluación registrada/i` | 2 | 5 — 2 toasts, 1 panel del admin, 2 mensajes de error | riesgo residual: son toasts |
| `/Brief guardado/i` | 2 | 4 — el toast, el panel del admin, un `fail()` y `paso.ts:139` («Tenés el brief guardado — …») | `paso.ts` renderiza en el **foco del home**, no en la pantalla del manual donde afirma la prueba |
| `/Draft guardado/i` | 1 | **0** | esa aserción **no la puede satisfacer nada**: la etiqueta real es «URL del borrador» |
| `/Demo enviada\|enviada/i` y `/enviada/i` | 2 | **104** | ver abajo |

**Nueve de los diecinueve call sites quedan probados neutrales**: ninguna copy viva puede satisfacerlos fuera del contenedor de toasts. Los demás tienen señuelos que **también son toasts** — el arreglo los sigue matcheando, y eso queda declarado como residual, no escondido.

**Dos hallazgos que salieron del barrido y NO son del helper:**

1. `tests/setter/01-flow.spec.ts:298` y `tests/qa-walkthrough/corrida-1.spec.ts:313` escriben `await expectToast(page, /Demo enviada|enviada/i).catch(() => undefined)`. El patrón `/enviada/i` tiene **104 coincidencias en código vivo** — es casi una tautología — y además el `.catch()` se come el fallo. **No afirman absolutamente nada.** Arreglarlo es cambiar la intención de la prueba, y eso pide correr la suite: queda anotado.
2. `tests/qa-walkthrough/corrida-1.spec.ts:233` pide `fieldControl(page, 'URL del draft')`, y la etiqueta real del producto es **«URL del borrador»** (`guidance-content.ts:635`). Ese `.fill()` no puede resolver: la spec ya estaba rota ahí. `tests/qa-walkthrough` no tiene script en `package.json` — se corre a mano, y no entra en las 118.

### Paso 4 — que no vuelva

**Cuatro helpers arreglados**, cada uno demostrado fallando ante el **mismo** sabotaje del Paso 2:

```
expectToast — ahora el ámbito es el aviso, no la pantalla

  Error: expect(locator).toBeVisible() failed
  Locator: locator('[data-sonner-toast]')
             .filter({ hasText: /Construcción arrancada/i })
             .filter({ visible: true }).first()
  Expected: visible
  Error: element(s) not found

pickSelect — ahora afirma la post-condición del propio <Select>

  Error: el panel del select tiene que cerrar al elegir
  expect(locator).toHaveAttribute(expected) failed
  Locator: getByRole('button', { name: 'Veredicto del Evaluador' })…
  Expected: "false"   Received: "true"

typeControlledInput — ahora afirma que el valor aterrizó

  Error: el valor tecleado tiene que quedar en el campo
  expect(locator).toHaveValue(expected) failed
  Expected: "hola"   Received: ""

setControlledSelect — ahora afirma que el valor quedó
  (medido contra la implementación vieja, inline, antes de tocarla:
   «PASA (falso verde); select.value quedó en ""»)
```

`pickSelect` compara contra el **texto de la opción clickeada**, no contra `optionName`: `getByRole({ name })` matchea por subcadena, y el select de «Setter asignado» se elige por el nombre del setter mientras la etiqueta real trae además su carga («B · 3 activos»). Comparar contra lo que el caller pidió habría roto ese call site sin que hubiera nada roto.

**La prueba de la prueba**, permanente: `npm run test:helpers` → **22 passed**. Config propia (`playwright.helpers-probe.config.ts`), sin server, sin Prisma, sin seed: corre en cualquier lado, CI sin base incluida, y no puede tocar la Neon dev. **No toca el gate, ni el workflow, ni ningún invariante**: el runner descubre por el prefijo `check:invariant`, y esto es `test:helpers` — la cuenta de 49 queda intacta, verificado corriéndola.

**Dos hallazgos declarados y NO arreglados, con el motivo:**

- **`fieldControl`** queda como está, y su caso de sabotaje queda **en rojo a propósito** (`test.fail()`). El `contains()` del xpath es **portante**: tres call sites piden por un prefijo de la etiqueta real («Tu opener» → «Tu opener (el texto que vas a pegar en Instagram)», «Qué intentaste» → «¿Qué intentaste y dónde te trabaste?», «Nota» → «Nota (opcional)»). Pasar a igualdad exacta rompe los tres. El locator **sí** devuelve los dos matches —el modo estricto gritaría— pero los 21 call sites lo envuelven en `firstVisible()`, que hace `.first()`. Cerrarlo de verdad pide tocar los 21: es otro objetivo. Se verificaron las **13 etiquetas** que la suite usa contra el producto: **hoy ninguna colisiona con otra en la misma pantalla** — la trampa está latente, no viva. Si alguien la arregla, el caso pasa a verde y Playwright lo reporta como fallo inesperado: esa es la señal para borrar la anotación.
- **`setControlledInput`** queda como está: saltear el `readonly` es inherente al setter nativo del prototipo, que existe justamente para saltear la intercepción de React. Tiene **cero call sites**. Su caso pasó de sabotaje a **caracterización**: fija la conducta y deja escrito que este helper no sirve para probar que un campo es editable.

**Ninguna prueba se borró y ninguna se debilitó.** Los cuatro arreglos **solo agregan** post-condiciones: la única forma de que una prueba existente se ponga en rojo es que estuviera pasando sin la conducta — que es exactamente lo que el sprint busca. `expectToast` estrenó un parámetro `timeout` opcional, que solo usa el banco de sabotaje; los tests reales no lo pasan y conservan sus 15s.

**Cero código de producto tocado.** El diff son cuatro archivos: `tests/helpers/setter-ui.ts`, `tests/helpers/form.ts`, `package.json` (un script) y `playwright.helpers-probe.config.ts` + `tests/helpers-probe/` nuevos.

### Cierre

- `npx tsc --noEmit` → **exit 0**
- `npm run check:invariants` → **descubiertos 49 · corridos 48 · pasaron 48 · fallaron 0** (igual que en Fase 0)
- `npm run test:helpers` → **22 passed** (suite nueva; antes: 0)
- `npm run build` → **exit 0**
- `npx prisma migrate status` → **Database schema is up to date!**
- `npm run test:setter` → **NO CORRIDA** (escribe). Listada: 93 pruebas en 20 archivos.
- `npm run test:leados` → **NO CORRIDA** (escribe). Listada: 25 pruebas en 6 archivos.

**Ninguna escritura sobre la base.** El único comando contra la DB fue `migrate status`, que es read-only.

**La forma más probable de los rojos nuevos, dicha por adelantado:** los toasts de sonner se auto-desvanecen. El helper viejo buscaba sobre la página, y la copy de la página no se desvanece nunca — una prueba que llegara a la aserción DESPUÉS de que el toast se fue igual pasaba, si había un señuelo. El helper nuevo exige el aviso presente dentro del timeout. Un rojo de esa forma no es una regresión del arreglo: es una prueba que estaba afirmando sobre otra cosa.

### Qué queda para la verificación humana

**Nada visual.** Este sprint no cambia una sola pantalla. Lo que cambia es cuánto vale el verde de la suite.

Lo que sí queda, y es de quien pueda correr las suites: **`npm run test:setter` y `npm run test:leados` sobre esta rama.** Las pruebas que se pongan en rojo son el hallazgo que este sprint no pudo cobrar — cada una estaba pasando sin probar.

### Anotado, sin hacer

- **La lista empírica de pruebas caídas** (arriba). Es el pendiente número uno.
- **Los dos `expectToast` con `.catch(() => undefined)`** y patrón `/enviada/i`: no afirman nada. Arreglarlos cambia la intención de la prueba.
- **`fieldControl` + `firstVisible` eligen en silencio** cuando dos etiquetas matchean. Latente hoy; cerrarlo pide tocar 21 call sites.
- **`tests/qa-walkthrough/corrida-1.spec.ts:233`** pide una etiqueta que no existe («URL del draft»). Esa suite no tiene script y no entra en las 118.
- **Tres helpers muertos**: `setControlledInput`, `qaLogout`, `logout` — cero call sites.
- **La copy en subjuntivo de `m-construccion.tsx`** existe para esquivar el helper que este sprint arregló. Ya no hace falta que esté doblada por esa razón; **no se tocó**, porque es código de producto.
- Y la deuda que venía de antes, sin cambios: la trampa latente de `describirFoco`, el cartel del home, el rail del shell sin salida, el contenido muerto de la guía, y `Date.now()` en render.

---

## Sprint HELPERS QUE PRUEBAN · LA CORRIDA — las suites que P11 no pudo correr — 2026-08-31

**Base:** `fix/helpers-que-prueban` @ `728b943e`, sobre la cadena. P11 arregló cuatro helpers compartidos y **no corrió ninguna de las dos suites**: su regla prohibía escribir en la base. Esa prohibición era un error de redacción — estaba pensada para las corridas de auditoría, no para la verificación normal. Las suites vienen corriendo así desde P3. Este sprint las corre y produce el número que faltaba.

### Fase 0 — el terreno, y contra qué base se corrió

**La base, dicha antes de escribir una fila.** Los dos configs (`playwright.setter.config.ts:31`, `playwright.leados.config.ts:25`) hacen `dotenv.config({ path: '.env.local' })`. La variable es **`DATABASE_URL`**, y resuelve a `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech/neondb` — la branch **`dev`** de Neon, confirmada contra `docs/audits/2026-05-cleanup-db-dev.md:4`, que la nombra por host. `npx prisma migrate status` re-confirma el mismo host al cerrar. **Nunca se tocó producción** (branch `main` de Neon, endpoint distinto).

**La copia de `.env.local` que dejó P11 en su worktree es la que se usó**, y apunta al mismo endpoint dev que la del checkout principal. Diferencia de claves, medida y sin valores: el worktree tiene `CRON_SECRET` de más; el checkout principal tiene además un `.env` (que Prisma CLI sí lee) con `BREVO_API_KEY`, `SEED_*_PASSWORD`, `MOTOR_CHANNEL_SECRET_KEY` y `CHATBOT_IP_HASH_SALT`, que el worktree no tiene. Ninguna de esas hizo falta: las specs se auto-provisionan.

**Gates de entrada:** `tsc --noEmit` exit 0 · invariantes **49 descubiertos / 1 excluido / 48 corridos / 48 pasaron / 0 fallaron** · `test:helpers` 22 passed. Checkout principal en `main` @`17727117` con sólo `?? docs/` — no se tocó. Quince worktrees y dos stashes ajenos, intactos.

### El radio REAL, medido — la tabla del pedido contaba otra cosa

Las 118 son **93 del setter + 25 de leados**. Antes de correr nada se midió a quién alcanzan los helpers, atribuyendo cada call site a su test contenedor:

| | call sites en las dos suites | tests alcanzados |
|---|---|---|
| `expectToast` | 8 | 7 |
| `fieldControl` | 15 | 10 |
| `pickSelect` | 3 | 3 |
| `typeControlledInput` · `setControlledSelect` | **0** | 0 |

**`tests/leados` no importa ninguno de los helpers arreglados.** Sus 25 pruebas son inmunes por construcción — lo que comparten con el setter es `setter-db.ts` (la escritura), no la capa de UI. El radio real dentro de las 118 es **13 tests, 4 archivos, 26 call sites, todos del setter**: `01-flow` (8), `13-m16-memoria` (2), `10-unsaved-guard` (2), `07-admin-assign-caliente` (1).

La tabla del pedido (11 / 16 / 13) contaba call sites sobre **todo** `tests/`, incluida `tests/e2e` — que es otra suite, no entra en las 118, y donde viven los 24 call sites de `typeControlledInput`/`setControlledSelect`. Dentro de las 118 esos dos helpers tienen cero, tal como decía la última fila.

### Paso 1 — la línea base, con los helpers viejos

Se sacaron los helpers de `1596b1cb` (el commit anterior a P11) y se corrieron las dos suites. Un solo `next build` sirve a las dos corridas: los helpers son código de test, el producto es idéntico byte a byte entre los dos brazos.

```
LÍNEA BASE (helpers pre-P11)
  test:leados   25 passed (41.6s)
  test:setter   93 passed (3.9m)
  ─────────────────────────────
  118 / 118 VERDE
```

### Paso 2 — con los cuatro arreglos

```
CON LOS ARREGLOS (728b943e)
  test:setter   93 passed (3.8m)
  test:leados   25 passed (41.6s)
  ─────────────────────────────
  118 / 118 VERDE — CERO rojos
```

### Paso 3 — el triaje: no hubo nada que triar, y por qué eso hay que probarlo

**Cero rojos. Ninguna causa A, ninguna B, ninguna C.** Las 13 pruebas del radio ejercían de verdad la conducta que sus helpers ahora exigen: los avisos aparecen dentro del contenedor de sonner, los selects commitean, los valores aterrizan.

Pero un helper que sólo AGREGA post-condiciones y no rompe nada admite dos lecturas, y son opuestas: o las pruebas ya ejercían la conducta, o **las aserciones nuevas no llegan a correr**. Un verde no distingue las dos. Hace falta un control.

**Control, sobre la aplicación real — no sobre el banco de sabotaje.** `01-flow.spec.ts:84` afirma el aviso `/Ficha guardada — ya tenés señal/i`; dos líneas antes, en `:81`, el mismo test afirma que la copy «✓ Señal mínima lista — guardá y pasala por el Evaluador.» está **visible en el cuerpo**. Se apuntó la aserción del aviso a esa copy del cuerpo — el señuelo perfecto, y real.

```
CONTROL A · helper NUEVO, señuelo de cuerpo → B1 FALLA (en la línea 84, que es donde tiene que fallar)

  Error: expect(locator).toBeVisible() failed
  Locator: locator('[data-sonner-toast]')
             .filter({ hasText: /Señal mínima lista/i })
             .filter({ visible: true }).first()
  Expected: visible   Error: element(s) not found

CONTROL B · helper VIEJO, MISMO señuelo → la línea 84 PASA. El test sigue de largo
            y muere recién en :88, contra la base:

  Error: fichaJson persistido
  expect(received).toBeTruthy()   Received: null
```

Los dos controles juntos prueban tres cosas. Uno: las aserciones **sí corren** — el verde de arriba es real, no un salteo. Dos: el ámbito nuevo **muerde contra la app**, no sólo contra `setContent`. Y tres, lo que no estaba escrito en ningún lado: el helper viejo no sólo daba falso verde, además **borraba la sincronización**. Su espera se satisfacía con texto que ya estaba en pantalla antes del click, así que el test corría al `getDossier` antes de que la server action persistiera. El aviso no era decoración: era la barrera que hacía esperar. Por eso el señuelo no produce un falso verde limpio sino un rojo **desplazado** — aparece dos líneas más abajo, en la base, disfrazado de bug de producto.

### Paso 4 — los tres hallazgos sueltos

**1 y 2 · Las dos aserciones sin filo.** `01-flow.spec.ts:298` y `qa-walkthrough/corrida-1.spec.ts:313` escribían `await expectToast(page, /Demo enviada|enviada/i).catch(() => undefined)`. Dos capas de nada, y hay que separarlas porque fallan distinto:

- **El patrón.** `/Demo enviada|enviada/i` tiene **104 coincidencias en código vivo** de `src/` (se reprodujo el número de P11, contando por línea y excluyendo comentarios). Es una tautología sobre la pantalla. `/Demo enviada registrada/i` tiene **1**: el propio `successToast` de `envio-form.tsx:44`.
- **El `.catch()`.** Este es el decisivo, y es el que **el arreglo de P11 no podía alcanzar**: por buena que quede la aserción, un `.catch(() => undefined)` en el call site la desarma entera. Medido con el helper YA arreglado y sin un solo aviso en la pantalla: la línea resuelve igual. No era una aserción débil — era una que no podía fallar nunca.

Las dos quedaron en `/Demo enviada registrada/i`, sin `.catch()`.

**3 · La etiqueta que no existe.** `corrida-1.spec.ts:233` pedía `fieldControl(page, 'URL del draft')`; la etiqueta real es «URL del borrador» (`borrador-form.tsx:139`). Las dos respuestas que pedía el pedido resultaron ser las dos, y las dos son hallazgo:

- **El `contains()` no la salva.** El único «URL del draft» que queda en `src/` es un **comentario** (`dossier.ts:277`), y el xpath del helper busca un `<label>`. Resuelve a **cero** controles; el `.fill()` agotaría el timeout.
- **La prueba nunca llega ahí porque la spec no corre.** `tests/qa-walkthrough` tiene config propio (`playwright.qa-walkthrough.config.ts`) pero **ningún script de `package.json` lo invoca**. No entra en las 118 y no lo mira ningún gate. Es una spec entera fuera de toda red.

Y al corregirla apareció que el mismo renombre `draft → borrador` había roto **tres** líneas del mismo paso 6b, no una: el botón `Guardar draft` (ausente en `src/`; el real es `Guardar borrador`) y el aviso `/Draft guardado/i` (**0 coincidencias vivas**; el real es «Borrador guardado.»). Un renombre coordinado del producto, y del otro lado una spec que nadie corre: nada podía avisar.

**Las demostraciones** se sumaron al banco de P11 (`tests/helpers-probe`, `setContent`, sin server y sin DB) — 22 → **26 casos**:

```
ok  envío · SABOTAJE de la forma vieja: el .catch() se come la ausencia total de aviso
ok  envío · CONDUCTA: el aviso del envío recién registrado satisface el patrón nuevo
ok  envío · SABOTAJE: el aviso dice que YA estaba registrado, no que se registró ahora
ok  fieldControl · SABOTAJE: la etiqueta renombrada no resuelve a ningún control
```

El tercero es el que le da filo al patrón nuevo: la **otra rama del mismo `successToast`** («Ese envío ya estaba registrado — no se duplica nada.») no lo satisface. B8 afirma que el envío se registró en **este** click, y ahora la aserción distingue eso de «ya estaba».

**Lo que no se pudo demostrar, y se dice:** dentro del contenedor de avisos, `/enviada/i` **no tiene hoy ningún señuelo vivo** — se barrió `src/` y ningún `toast.*` ni copy de error contiene «enviada». Las 104 coincidencias son de la pantalla, y por eso el patrón era peligroso bajo el helper VIEJO (ámbito de página), no bajo el nuevo. El defecto vivo hoy en ese call site era el `.catch()`; el patrón era deuda latente. Se arreglaron los dos, pero no se le atribuye al patrón un daño que hoy no puede hacer.

### Paso 5 — el saldo

**De las 118 pruebas, las que pasaban sin verificar la conducta que dicen verificar: CERO.**

No es el número que el sprint esperaba, y por eso vale decir exactamente qué cubre y qué no:

- **Las 13 del radio resistieron.** Los cuatro helpers arreglados les exigen ahora la post-condición y las 13 la cumplen. La conducta era real.
- **Las 25 de leados nunca estuvieron en riesgo**: no importan ninguno de los helpers arreglados. Contarlas como «protegidas» habría sido inflar el número.
- **Una aserción individual sí estaba inerte** dentro de las 118: `01-flow.spec.ts:298`, en **B8**. B8 no pasaba sin probar nada — sus aserciones duras (`enviadaAt` no nulo, 1 `OsDemo`, idempotencia tras recargar) sí probaban. Lo inerte era la línea del aviso, y sólo esa. Con el arreglo la línea afirma y B8 sigue verde: el aviso aparece de verdad.
- **Fuera de las 118**, `corrida-1.spec.ts` tenía **cuatro** líneas rotas o inertes y nadie se enteró, porque ninguna corrida la ejecuta.

El verde de las últimas nueve corridas, entonces, valía lo que decía valer **en lo que estos cuatro helpers cubren**. Lo que no cubre sigue abierto y sigue declarado: `fieldControl` no se arregló (P11 lo dejó en rojo a propósito con `test.fail`, porque su `contains()` es portante — tres call sites piden por prefijo), y sus **15 call sites dentro de las 118 no están medidos** contra la ambigüedad de dos etiquetas. Ese es el pendiente que este sprint no cobra.

### Cierre

`tsc --noEmit` exit 0 · invariantes **49 / 1 excluido / 48 corridos / 48 pasaron / 0 fallaron** · `test:helpers` **26 passed** · `test:setter` **93 passed** · `test:leados` **25 passed** · `npm run build` exit 0 · `migrate status` sin drift, sobre el host `ep-quiet-waterfall-acv0fpll` (dev).

**Cero código de producto tocado.** Ninguna prueba borrada ni salteada; el `test.fail()` declarado de P11 se respeta. **Ningún helper se aflojó** — los cuatro quedan exactamente como los dejó P11; lo único que cambió son dos call sites que no afirmaban y tres selectores de una spec huérfana.

### Anotado, sin hacer

- **`tests/qa-walkthrough` no lo corre ningún script.** Una spec entera fuera de todo gate — por eso acumuló cuatro líneas rotas de un renombre. Darle script (o borrarla) es una decisión, no un arreglo.
- **Los 15 call sites de `fieldControl` en las 118**, sin medir contra el sabotaje de dos etiquetas. Es el pendiente que hereda de P11.
- **La copy en subjuntivo de `m-construccion.tsx`** sigue doblada para esquivar un helper que ya no lo necesita. Es código de producto: no se tocó.

---

## CORRIDA DE RECORRIDO — el camino entero, de punta a punta (31/08/2026)

**Base `2da5de41`** (`origin/fix/helpers-que-prueban`), elegida por ser descendiente de
`origin/main` **y** de las diez ramas de sprint — verificado con `merge-base --is-ancestor`
una por una. Worktree propio `C:/tmp/wt-corrida-recorrido`, puerto 3007, `E2E_DIST_DIR=.next-corrida`,
build de producción exit 0, base Neon **dev**. Rama `corrida/recorrido-completo`, sin pushear.
`git diff` sobre `src/`: **vacío**. Nada de código de producto se tocó.

Reporte y manifiesto en `docs/corrida-recorrido-2026-08-31/`. 79 PNG a 1440 px, gitignorados.

### Qué se recorrió

Un lead propio (`CORRIDA Panaderia San Cayetano`) por el camino completo: alta → ficha →
veredicto → opener → espera → respondió → brief → construir → refinar → **pedir ayuda** →
borrador → chequeo → revisión → **rechazo de Franco** → retrabajo → reenvío → **aprobación** →
mandar el link → **postergación** → agenda. Más, en leads aparte, un **descarte** completo.
Los pasos de Franco se hicieron por la UI real de admin, no tocando la base.

### Los nueve baches

Dos **frenan**: (B1) cuatro de las cinco herramientas dicen «Link pendiente» y el registro
igual exige, con asterisco de obligatorio, transcribir literalmente lo que devuelven —
obedecer la pantalla es imposible, salí inventando el contenido; (B2) el último paso del
camino, agendar, muere con «Setup B7.0 pendiente: cargá … calComUsername … calComEmbedUrl»,
un mensaje que nombra un código de sprint y dos columnas de la base, y que ni siquiera dice a
quién pedírselo.

Tres **confunden**: (B3) tildar tres fases de construcción seguidas (400 ms) guarda una y la
pantalla muestra tres — reproducido dos veces contra la base; (B4) el alta promete «aparece en
tu foco» y con un pin y 48 en cola no aparece; (B8) un lead postergado al 15/9 tiene como paso
actual «Agendá la reunión».

Cuatro **molestan**: (B5) la pantalla no acompaña al dato; (B6) «Reabrir construcción»
aterriza en el chequeo final; (B7) el bloque de novedades ocupa ~1000 px de un panel de 2366,
con 12 tarjetas de texto idéntico; (B9) una novedad sigue diciendo «Enviá el link ya» con el
link ya enviado.

### El límite de B3, que es lo que lo vuelve accionable

La carrera afecta a `progresoJson` (auto-reporte, no gatea) y **no** a `selfCheckJson`: tildé
los 10 obligatorios de m14 al mismo ritmo y los 10 persistieron. El checklist que gatea el
envío está a salvo; lo que se pierde en silencio es el registro del propio trabajo del setter.

### Contra agosto: tres arreglados, dos vivos, dos nuevos

**Arreglados** — el error de m13 ya no es `Invalid literal value, expected true` sino «Abrí el
link en otra pestaña y confirmá que la demo carga» (y sigue sin persistir nada); `espera` y
`revision` ya no comparten encabezado («Le toca al negocio» vs «Le toca a Franco»); el acuse
de recibo existe (hay `aria-live` con «Opener registrado — próximo toque el 2/9»).
**Vivos** — la pantalla no acompaña al dato, y la aglomeración de novedades (que agosto había
declarado no re-verificable porque su limpieza borró el 96% del bloque; hoy vuelve a medirse).
**Nuevos** — la carrera de los tildes y el mensaje de Cal.com.

### Lo que el rechazo sí hace bien

El re-loop completo se sostiene: novedad con el nombre del negocio → «Abrir» cae directo en la
guía de retrabajo con el Qué/Dónde/Arreglo → «Reabrir construcción» conserva los 6 tildes y el
pedido, y resetea el chequeo. El pedido de Franco se verificó presente en **las cuatro**
pantallas del retrabajo, que es lo que la pantalla promete.

### Seis falsos positivos, declarados

El selector que «no abría» (faltaba `scrollIntoView` en el shell fijo), los 9 campos «sin
nombre accesible» (todos con `label[for]`), el botón Postergar «ausente» (la línea del
snapshot venía citada en YAML por llevar dos puntos), el chequeo que «no guardaba» (la clave
es `itemsDuros`, no `marcados`), el descarte que «no registraba» (abre diálogo de
confirmación) y «Ver toda la cartera» que «no navega» (es un `aria-expanded`). Se listan en el
reporte para que se pueda medir la puntería del instrumento.

### Lo que se documentó sin ejecutar

**`confirmarReunion` → `POST /v2/bookings` de Cal.com.** El módulo declara que Cal.com escribe
el evento en el Google Calendar conectado y manda los mails nativos: es una acción real hacia
afuera. No se ejecutó. Se verificó además, leyendo `agenda.actions.ts`, que el guard de config
corre **antes** de `getSlots`, y con `calComUsername` en null en los 8 orgs el botón no dispara
ninguna llamada — confirmado con un censo de pedidos del browser: **0 pedidos fuera de
localhost**. Telegram quedó inerte por falta de credenciales (ni en `AgencySettings` ni en
env), así que el escalamiento «Me trabé» no salió hacia afuera; la pantalla lo dijo:
«Guardamos tu pedido — Franco lo ve en el panel. El aviso por Telegram no salió».

### Anotado, sin hacer

- **El tiempo humano no se puede derivar de esta corrida.** El agente no lee ni delibera, y
  no puede usar las herramientas porque no tienen link. Lo medible es latencia del sistema:
  3-6 s por acción de escritura, 15 pantallas con registro, 4 campos obligatorios que son
  transcripciones de herramientas inalcanzables.
- **Tres leads `CORRIDA ` quedaron en la base dev** (postergado/descartado/evaluado). No se
  borraron: son la evidencia del recorrido.

---

## Sprint LA CONFIGURACIÓN QUE FALTA — el campo que no se puede llenar y el mensaje que no se puede leer — 2026-08-31

**Rama** `fix/config-faltante` · **base** `fa36389a` (`corrida/recorrido-completo`, la punta con
P12) · **worktree** `C:/tmp/wt-p13-config`, propio, `node_modules` por junction · **sin pushear**

Los dos frenos de la corrida del novato, misma raíz: el producto exige algo que depende de una
configuración que no existe, y no lo dice de una forma que el setter pueda accionar.

### Fase 0 · terreno

`tsc --noEmit` exit 0 · invariantes **48/48** (49 descubiertos, 1 excluido) · `test:helpers`
**26/26** · `test:leados` **25/25** · `test:setter` **93/93** · `prisma migrate status`: 86
migraciones, sin drift. Ajeno intacto: `docs/` sin trackear en el checkout principal, 2
stashes, 17 worktrees, ramas de otros — nada tocado.

**Los dos frenos, re-verificados operando la aplicación antes de tocar nada.** En m2 y en m6,
la píldora «Link pendiente» arriba y los campos con `*(obligatorio)` abajo. En m16, tras tildar
el decisor y apretar «Buscar horarios libres de Franco», el mensaje literal: «Setup B7.0
pendiente: cargá en la organización develOP el username de Cal.com (calComUsername) y el slug
del event type (calComEmbedUrl…)». Los 16 orgs de la base dev tienen `calComUsername` en null.

### Paso 1 · el censo de dependencias — y lo que frenó

Campos obligatorios que piden **transcribir la salida** de una herramienta sin URL:

| El campo | Herramienta | Quién lo consume río abajo | Si llega vacío | ¿Gate? |
|---|---|---|---|---|
| **m2 · Score** (`evaluacion-form.tsx:191`) | evaluador (`herramientas.ts:63`, sin link) | `transitionDossier` EVALUADA (`dossier.ts:150`) · `registrarEvaluacion` descarta con score ≤ 2 (`dossier.actions.ts:154`) · `mis-numeros.ts:76` · `progreso.ts:82` · `notify.ts:144` · `buildBriefInputBlock` (`copy-blocks.ts:94`) · 4 pantallas de admin/setter | **ROMPE.** `EvaluacionSchema.parse()` lanza; sin score no hay descarte automático ni métrica | **SÍ** — `EvaluacionSchema` dentro de `transitionDossier`, más el guard de `EVALUADA→DESCARTADA` protegido por `dossier-stage.invariant.ts:271` |
| **m2 · Veredicto** (`:212`) | evaluador | idem + badge del admin + métrica descarte/avance (`revision.ts`) | **ROMPE** — mismo `parse` | **SÍ** — idem |
| **m2 · Razonamiento** (`:207`) | evaluador | `notify.ts:155` hace `.razonamiento.slice(0,300)` · `dossier-panels.tsx:83` y `setter-evaluaciones.tsx:87` lo renderizan crudo · `buildBriefInputBlock` lo interpola | **ROMPE** — `EvaluacionSchema` lo exige `min(1)`; el Telegram explotaría con `undefined` | **SÍ** — idem |
| **m6 · Respuesta del Gem** (`brief-form.tsx:147`) | gemDiseno (`herramientas.ts:78`, sin link) | `buildConstruccionBlock` (`copy-blocks.ts:241`, vía `seccion()`) · `BriefResumen` (`brief-form.tsx:244`) · `BriefPanel` del admin (`dossier-panels.tsx:122`) | **DEGRADA, y nadie lo nota.** Los tres ya ramifican por ausencia: el bloque omite la sección, las dos pantallas no pintan nada | **NO** — `BriefSchema.pegadoGem` ya era `textoLibre` (opcional); el gate `EVALUADA→BRIEF` es `gateBriefAbierto(status, caliente)` y no mira el brief; el gate del envío es `draftUrl + selfCheckAprobado` |

**FRENADO en m2, y ése es el hallazgo.** Los tres campos del evaluador tienen consumidores que
asumen que están, y uno de ellos es un **gate duro con invariante**: `transitionDossier` parsea
`EvaluacionSchema` y lanza. Aflojar el asterisco de m2 obliga a cambiar el contrato persistido
(`contracts.ts:93-98`) y arrastra cinco consumidores más una aserción de
`dossier-stage.invariant.ts`. Eso cambia lo que el producto garantiza —que un lead EVALUADA
tiene evaluación— y no es una decisión de sprint. Queda reportado, sin tocar.

**Fuera de la regla, con motivo:**
- **mc1/mc2 (claudeDesign)** — la píldora está, pero no hay ningún campo obligatorio: los seis
  tildes son auto-reporte y la propia pantalla dice que no bloquean nada.
- **m4/m5 (gemOutreach)** — «Tu opener» es texto **del setter**, no una transcripción; el
  propio registro dice «Usarla es opcional: si te sale solo, mejor».
- **m6 · Título y Secciones** — siguen obligatorios. No se transcriben del Gem (el título
  arranca con el nombre del negocio, las secciones tienen sus ejemplos en el hint) y
  `secciones` es lo único que hace construible la demo.
- **m13 (netlifyDrop)** — tiene link. Es el contra-ejemplo que la regla usa para probarse.

### Paso 2 · el campo que dejó de bloquear lo que no se puede hacer

`herramientas.ts` estrena dos funciones puras: `herramientaSinLink(id)` —la MISMA lectura de la
que sale la píldora— y `faltaPorHerramientaSinLink(id, valor)`, que distingue «el setter lo
dejó vacío» de «no lo podía traer».

De ahí salen las cuatro cosas, sin que ningún componente decida por su cuenta:

1. `BriefInputSchema` exige `pegadoGem` **solo** si el Gem tiene link (`superRefine`, no
   `.min(1)`: el tipo `BriefInput` no cambia con el estado del registro).
2. El `Field` pierde el `*` con el bloqueo, y el hint pasa a decir por qué.
3. `BriefResumen`, el `BriefPanel` del admin y el bloque de Construcción **nombran** el dato
   faltante en vez de omitirlo en silencio — una sola frase, en
   `GUIA_BRIEF.campos.pegadoGem.faltante`.
4. Cargar el link en `herramientas.ts` revierte las cuatro, sin tocar código.

El bloque de Construcción es la **única excepción** a su propia regla («lo que está vacío se
OMITE; nunca se rellena ni se anuncia como faltante»), y queda escrita al lado: omitirlo en
silencio le manda a Claude Design un bloque más corto sin decir que le falta la pieza. Un CTA
vacío se sigue omitiendo — `faltaPorHerramientaSinLink` solo es cierto cuando la herramienta es
la que no está.

**Nada se inventa y nada se guarda de más:** el brief guardado sin pegado queda
`{"titulo":…,"secciones":[…]}` — la clave `pegadoGem` **no existe** en el blob.

### Paso 3 · el mensaje que hablaba en jerga

Censo de la prosa de `setter/**` + `lib/leados/**` + `cal-com-v2.ts`: **tres** mensajes con
código de sprint o nombre de columna llegan a una pantalla del setter. Los tres reescritos:

- `agenda.ts` · «Setup B7.0 pendiente: cargá … calComUsername … calComEmbedUrl» →
  «La agenda de Franco todavía no está conectada, así que los horarios no se pueden buscar
  desde acá. Avisale a Franco: cuando la conecte, este paso funciona solo. Mientras tanto,
  coordiná la reunión con él directo.»
- `agenda.ts` · la config ambigua ya no nombra `calComUsername` ni le pide al setter «limpiá
  las que no sean la agenda de Franco»: dice el riesgo (reservar en el calendario equivocado)
  y a quién avisarle.
- `cal-com-v2.ts:200` · el 404 de Cal.com («revisá el username y el slug cargados en la org
  (setup B7.0)») — viaja al setter tal cual por `mapError`, sin traducción.

El detalle técnico **no se pierde**: los tres casos loguean por `console.warn` del lado del
servidor, con los nombres de columna y los slugs de las orgs. Es donde Franco lo puede leer.

**Lo demás que el censo encontró, y por qué no se toca:** los mensajes de `dossier.ts` /
`error-copy.ts` son **claves del motor**, traducidas antes de salir al cliente (regla del
propio `error-copy.ts`); los identificadores sueltos (`businessName`, `assignedToId`,
`snoozedUntil`) son claves de Prisma y encabezados de CSV, no copy —la plantilla del import ya
usa `nombre`/`instagram`/`web`—; y `'Enviada por el setter desde LeadOS (B6)'` es el `notes` de
un registro `OsDemo`, que ninguna pantalla del setter renderiza (el timeline lee
`Activity.notes`). Ese último queda **eximido con prueba** en el invariante nuevo.

### El invariante nuevo — `check:invariant:copy-sin-jerga`

Ninguna frase que el setter pueda leer nombra un código de sprint ni una columna de la base.
El sujeto es la **prosa** (4 palabras o más), no los identificadores sueltos; de las columnas se
vigilan solo las que tienen joroba, porque `lead`/`notas`/`zona` son además castellano y
prohibirlas prohibiría el vocabulario del producto (límite conocido, escrito en el archivo).

Tres dientes contra el falso verde: el piso de barrido (130 fuentes / 1276 frases), el piso de
la lista de columnas leída de `schema.prisma` (352, fuente **distinta** del sujeto) y —el que
prueba el detector— nueve pares CONDUCTA/SABOTAJE que le dan fuentes sintéticas y exigen que
encuentre la jerga en un `fail()` y **no** la encuentre en un comentario ni en un `console.*`.
Ese último par es el que le da sentido al perdón del log del servidor: no se perdona el texto,
se perdona el destino.

La única jerga permitida no está en una lista escrita a mano: se perdona **si y solo si**
`error-copy.ts` la tiene como clave traducida. Si alguien borra la traducción, la frase deja de
estar perdonada y esto se pone en rojo — que es justo cuando la jerga llegaría a la pantalla.

`INVARIANTES_ESPERADOS` 49 → **50**, con el motivo en el mismo renglón.

### Paso 4 · verificado operando la aplicación, a 1440

1. **Sin link.** m6 muestra «Link pendiente», la etiqueta del pegado **sin** `*`, y el hint
   «Todavía no lo podés traer: el Gem de diseño no tiene link cargado (pedíselo a Franco)…».
   Se guarda el brief con el pegado vacío → «Brief guardado», stage EVALUADA→**BRIEF**, blob
   sin la clave. Al volver, el faltante se lee **sin abrir ningún plegable**; el bloque de mc1
   termina en «BRIEF COMPLETO DEL GEM DE DISEÑO / Sin la respuesta del Gem de diseño: …»; y el
   panel del admin lo muestra en su callout ámbar.
2. **Con link.** Cargado un link de prueba de Gemini en `herramientas.ts` y rebuildeado
   —**nada más**—: la píldora desaparece (0), aparece «Abrir Gem de diseño» apuntando ahí, el
   `*` **vuelve**, el hint vuelve al original y guardar con el pegado vacío rebota con «Pegá la
   respuesta completa del Gem de diseño». **Revertido** y rebuildeado: el archivo quedó
   idéntico al de la base.
3. **El mensaje.** Antes: «Setup B7.0 pendiente: cargá … calComUsername … calComEmbedUrl».
   Después: la frase de arriba, visible en el `role="alert"` del form, con `B7.0` y `calCom`
   ausentes de todo el `main`.

### Los tests, demostrados fallando

`tests/setter/19-config-que-falta.spec.ts` (5) y `tests/leados/campo-sin-herramienta.spec.ts`
(8). Contra un build del código **viejo** (los seis archivos revertidos con `git stash` y
rebuildeado): **4 de 5** rojos en el browser y **5 de 8** en la lógica pura. Los que pasan son
los dos guards de terreno —que afirman que el Gem sigue sin link— y los dos casos que describen
el comportamiento que ya era correcto.

Todo se afirma por **visibilidad**, no por presencia: `faltante` y `hintSinHerramienta` se
buscan con `toBeVisible()`, y en m6 se cuenta `details[open] === 0`. La selección de controles
va por rol y por `label[for]` (`fieldControl`), nunca por la copy que se está verificando.

**El estado espejo se prueba donde se puede probar.** `HERRAMIENTAS` es una constante de
módulo: «con link» no se alcanza en una corrida sin rebuildear. Por eso `BriefInputSchema` se
extrajo a `briefInputSchemaPara(gemConLink)` y los DOS lados se afirman en `tests/leados`
contra el schema real; el browser cubre el lado que hoy es cierto, y el otro quedó verificado a
mano (punto 2 de arriba).

**Una trampa del instrumento, anotada.** El interruptor del decisor de m16 no resuelve por
`getByRole` apenas carga la pantalla: bajo el streaming de React el control existe en el DOM
antes de entrar al árbol de accesibilidad, y `getByRole` —que excluye lo oculto— devuelve 0
mientras el selector CSS ya devuelve 1. Sin una espera explícita, el test se lee como «el
control no está». Y m16 solo es alcanzable con el link **ya enviado**: sin `enviadaAt`, la
derivación manda el lead a m15 después de hidratar, y la aserción de URL pasa igual porque
corre antes del salto.

### Cierre

`tsc --noEmit` exit 0 · invariantes **49/49** (50 descubiertos, 1 excluido) · `test:helpers`
**26/26** · `test:leados` **33/33** · `test:setter` **98/98** · `npm run build` verde ·
`migrate status` sin drift. Sin cambios de schema, de transiciones ni de llaves de datos
(`HardCheck.nombre`, `FASE_IDS`, ids de pantalla: intactos). Ningún invariante en rojo.

**El fixture que la verificación tocó, restaurado.** Completar m6 a mano movió `QA-W Evaluada
Gate Abierto` a BRIEF; se devolvió a EVALUADA con `briefJson` en null (es un lead sembrado y
nombrado por su estado). `M0-GAL 30-m16-virgen` quedó intacto: el gate de config aborta antes
de escribir, `agendaJson` sigue en null.

### Lo que este sprint NO resuelve

Las cuatro herramientas siguen sin link y Cal.com sin configurar. Esto hace que el producto no
mienta ni trabe mientras falten; no las carga — eso son minutos de Franco en `herramientas.ts`
y en la org de develOP.

Y **m2 sigue frenando el recorrido**, ahora con el motivo medido: los tres campos del evaluador
son load-bearing de un gate con invariante. Destrabar ese paso es una decisión de producto
—¿qué significa un lead EVALUADA sin evaluación?— y necesita su propio sprint.

### Anotado y fuera de alcance

Los otros siete baches de la corrida: la carrera de tildes del auto-reporte, el foco que no
aparece, la vuelta de construcción que aterriza en el chequeo, el paso actual de un postergado,
la pantalla que no acompaña al dato, la aglomeración de novedades y la novedad caducada.

---

## Sprint D15-bis — LA FUSIÓN: la ficha y el veredicto son una sola pantalla — 2026-09-01

**Rama** `fix/fusion-m1-m2` · **base** `52ac5c62` (`fix/config-faltante`, la punta de la cadena
con P14) · **worktree** `C:/tmp/wt-p15-fusion`, propio, `node_modules` por junction, puerto
3007, `E2E_DIST_DIR=.next-p15` · **sin pushear**

P14 midió que los tres campos del veredicto no se pueden aflojar: son load-bearing de un
contrato persistido con invariante propio. Este sprint saca el freno por el otro lado — no
aflojando el campo, sino cambiando de dónde sale el dato. El chat de evaluación externo deja de
ser un paso; el veredicto lo escribe el setter, con su criterio, en la misma pantalla donde
acaba de cargar la ficha.

**Lo que NO se tocó, y está probado abajo con `git diff` vacío:** la etapa `EVALUADA`, la
transición `FICHA → EVALUADA`, `LEGAL_TRANSITIONS`, `EvaluacionSchema` y el camino de escritura
(`transitionDossier`). Lo que se elimina es el chat como paso, no la etapa ni el registro.

### Fase 1 · las seis mediciones (bloqueantes)

A3 midió esto hace semanas y once sprints tocaron estas pantallas. Se volvió a medir. Ninguna
condición de frenada se disparó.

**1 · ¿`m2` sigue siendo la pantalla del stage `FICHA`? ¿En qué otros estados aparece?**
Sí. `manual.ts:517` (base) — `case null: case 'FICHA'` devuelve `{ actual: 'm2', habilitadas:
['m2'] }` cuando la ficha tiene señal; sin señal devolvía `m1`. El comentario del código lo
decía con todas las letras: «La evaluación ocurre con stage=FICHA: registrar el veredicto ES la
transición». Aparece además en dos lugares más: como terminal de `DESCARTADA`
(`manual.ts:522`, `habilitadas: []`) y como *completada* en los siete stages de
`STAGES_POST_EVALUACION` (`manual.ts:433`). La premisa se sostiene.

**2 · ¿A dónde aterriza hoy un `DESCARTADA`? ¿Qué pantalla puede recibirlo?**
Hoy aterriza en `m2` (`manual.ts:520-522`). La pantalla que puede recibirlo **ya existe y ya
está construida para él**: `archivo`. La página del manual la despacha con `page.tsx:126-129` —
`const causa = manual.stage === 'DESCARTADA' ? 'descartado' : 'perdido'`, y el motivo sale de
`manual.evaluacion?.motivoDescarte`. `ArchivoManual` tiene el label
`CAUSA_LABEL.descartado = 'Descartado'` desde 2.3. Era código alcanzable solo por
`status === 'PERDIDO'`: la rama `descartado` existía y ningún estado la ejercitaba. **No hace
falta inventar ninguna pantalla.**

**3 · ¿De qué se deriva el rail de fases y el indicador de paso? ¿Quién más lo lee?**
El rail sale de `FASES_MANUAL` (`manual.ts:303-315`) y el indicador de `indicadorDeFase`
(`manual.ts:321-331`), que cuenta `fase.pantallas.indexOf(id) + 1` sobre
`fase.pantallas.length`. Lo leen tres consumidores, y ninguno más:

- `pantalla-manual.tsx:71` — renderiza el indicador (con `m > 1` como condición de mostrar el
  contador, disciplina P9);
- `enlaces-manual.invariant.ts:315` — deriva `FASES_SIN_DESTINO` de los títulos de fase;
- `pantallas-construccion.invariant.ts:121` — ata `FASES_MANUAL.construccion.pantallas` al
  fixture congelado.

Verificado además que **`derivarPasoDelLead().indice` (el rail de 5 pasos del wizard) no tiene
un solo consumidor** desde el corte 5.6: el grep sobre `.indice` y `DossierStepper` devuelve solo
comentarios. El único rail vivo es el del manual.

**4 · ¿Qué invariantes tocan `m2`, la fase `evaluacion` o `FICHA → EVALUADA`?**
Seis, de los 50:

- `manual.invariant.ts:91` — afirmaba `descartada.actual === 'm2'`. **Se puso en rojo por diseño
  y se adaptó** (bloque de pruebas, abajo).
- `enlaces-manual.invariant.ts` — el vigía de P10 sobre los saltos pantalla→pantalla. **Sumó un
  enlace declarado**, sigue verde.
- `dossier-stage.invariant.ts:53-95` — el grafo: `FICHA: ['EVALUADA']`,
  `EVALUADA: ['DESCARTADA','BRIEF']`, y la aserción de que no hay camino de FICHA a BRIEF sin
  pasar por EVALUADA. **Intacto, verde.**
- `pantallas-construccion.invariant.ts` — lee `FASES_MANUAL` y `PANTALLAS[p].fase`. Intacto.
- `copy-sin-jerga.invariant.ts` — nombra `evaluacionJson` en su lista de columnas conocidas.
  Intacto.
- `turno.invariant.ts` / `particion.invariant.ts` / `gate-envio-demo.invariant.ts` nombran
  `EVALUADA` como stage, no `m2`. Intactos.

Falso positivo descartado: `modules.invariant.ts` usa `m1` y `m2` como ids de MÓDULO
(`motor-resenas`, `email-marketing-pro`), sin relación con las pantallas del manual.

**5 · ¿Cuántas de las pruebas tocan `m1` o `m2`?**
El total real, medido con `playwright --list`: **98 en `test:setter` + 33 en `test:leados` = 131**
(no 124 — la cuenta creció con los dos sprints anteriores). De esas, **tres** tocan m1/m2, y
ninguna está en `test:leados`:

- `tests/setter/01-flow.spec.ts:93` (B2 · evaluación) y `:324` (B9 · descartada);
- `tests/setter/16-municiones-salida.spec.ts:141` (la fila `m2` de `PANTALLAS_CON_PARED`).

Fuera de las suites contadas, `tests/galeria/captura.spec.ts` tiene 3 estados apuntados a `m2`
(harness de capturas, con su sembrador y su índice en `scripts/dev/`).

**6 · ¿Qué escribe cada uno de los tres campos y qué los valida?**
Uno solo los escribe: `registrarEvaluacion` (`dossier.actions.ts:115-176`), que llama
`transitionDossier(leadId, { to: 'EVALUADA', evaluacion: { score, veredicto, razonamiento } })`.
Validación en dos capas, las dos intactas:

- entrada — `EvaluacionInputSchema` (`dossier.schemas.ts:17-42`): `score` int 1-5, `veredicto`
  enum de `VEREDICTO_VALUES`, `razonamiento` string trim min 1, más el `superRefine` que exige
  `motivoDescarte` con score ≤ 2. Corre client-side (el form) y server-side (la action);
- persistencia — `EvaluacionSchema` (`contracts.ts:93-107`), parseado dentro de
  `transitionDossier` (`dossier.ts:151`) antes de estampar `evaluacionJson` con su `fecha`.

El gate de señal mínima que habilita registrar es `fichaFaltantes(parseFicha(...))` en
`dossier.actions.ts:139`, server-side. **No se movió.**

### Qué se fusionó

`m2` salió del registro; su contenido vive en `m1`:

- **Registro** (`m1-ficha.tsx`) — arriba la ficha (`FichaForm` viva, o `FichaStep` congelada);
  debajo, separado por una regla, el veredicto (`EvaluacionForm`, o `EvaluacionResumen` si ya
  está registrado). En ese orden, porque el segundo se decide mirando el primero. Los dos
  bloques son secciones con nombre accesible — «La ficha del negocio» y «Tu veredicto» — y la
  prueba afirma sobre eso, no sobre la posición.
- **Munición** — la ficha ejemplar más la tabla de criterios que traía m2. Lo que se fue es el
  `ToolGuide` del evaluador: sin viaje a la herramienta no hay herramienta que presentar.
- **Contexto** — quedó el de m1 (identidad y links del alta). El bloque copiable de m2 existía
  para el viaje; sin viaje, la ficha ya está en la misma pantalla.

El copy dice que el criterio es suyo. `GUIA_EVALUACION` pasó de «No juzgás vos: pegás la ficha
en el Evaluador… transcribís acá tal cual» a «Con la ficha recién cargada a la vista, **decidís
vos**… Es tu lectura: nadie la puntuó antes que vos». Se barrió el resto de la palabra
«Evaluador» de todas las superficies que el setter lee: los hints de los tres campos, el gate de
score 1-2, el `porque`, el ejemplo, el banner de señal completa de la ficha («guardá y pasala
por el Evaluador» → «guardá y bajá a dejar tu veredicto»), el toast de guardado, los tres
mensajes de error de Zod, el nombre accesible del select, la línea de «Mi criterio» del panel y
la próxima acción de la tarjeta de cartera («Pasala por el Evaluador» → «Dejá tu veredicto»).
Grep de «Evaluador» sobre superficies visibles: cero.

### Lo que quedaba colgado de m2

**El descarte aterriza en `archivo`.** No es una pantalla nueva: es la de cierre que ya sabía
decir «Archivo — Descartado» y mostrar el motivo. Dos ajustes de copy, porque los dos cierres no
son el mismo: el subrenglón decía «El cierre lo decide Franco» —falso para un descarte, que lo
decidió el setter— y ahora se ramifica por causa; el rótulo del motivo dice «Por qué lo
descartaste» en vez de «Qué pasó». Y el veredicto completo (score y razonamiento, no solo el
motivo de una línea) **no se perdió**: vive en `m1`, que queda completada y navegable, y el
archivo lo enlaza con `EnlacePantalla` — el nombre sale del registro y el salto se declaró en el
invariante de enlaces en vez de descubrirse rebotando.

**El conteo del rail cierra.** Medido importando los módulos de las dos ramas:

| | base `52ac5c62` | `fix/fusion-m1-m2` |
|---|---|---|
| Fases del rail (`FASES_MANUAL`) | **10** (con `evaluacion`) | **9** |
| `PANTALLA_IDS` | **15** (con `m2`) | **14** |
| Pantallas de tipo `manual` | **11** | **10** |
| Fases con contador visible (`m > 1`) | 1 (Construcción) | 1 (Construcción) |

Ninguna fase quedó sin pantalla ni con el índice colgado: `indicadorDeFase` devuelve `n` menor o
igual a `m` para las diez pantallas del manual. `FASES_SIN_DESTINO` del invariante de enlaces
sigue no vacío (`[Seguimiento]`), así que su regla 2 sigue mirando algo.

**Los enlaces.** El invariante de P10 sigue verde y con un enlace más: 6912 estados barridos,
**8 enlaces declarados** (11408 ejercicios), 79 citas revisadas. El nuevo —`archivo → m1`— se
declaró `siempre`, y no puede no serlo: `DESCARTADA` está en `STAGES_POST_EVALUACION`, así que
`completadasDe` marca `m1` en todos los estados donde el enlace se renderiza.

**El harness de la galería.** `m2` salió del registro, así que sus tres estados fotografiaban
redirects con nombres que mienten — mismo tratamiento que la corrida G le dio a m8…m12 con P6-B.
`03-m2-al-evaluador` se retiró (sin viaje a la herramienta sembraba y fotografiaba exactamente
lo mismo que `02`), `04` pasó a `m1` y `05` al `archivo`, con su sembrador y su índice.

### Un cambio de criterio, dicho

`completadasDe` marcaba `m1` con la sola **señal de la ficha** (`fichaTieneSenal`), porque
entonces la ficha era una pantalla entera y el veredicto era la siguiente. Fusionadas, eso diría
«hecho» sobre una pantalla cuya segunda mitad está en blanco, y la pondría en el rail de
completadas mientras es el paso de ahora. Ahora `m1` se completa con el **veredicto**
(`STAGES_POST_EVALUACION`), que es lo que cierra el paso. Con esto la rama por señal del case
`FICHA` de `posicionDe` desapareció: sin un segundo destino al que ir, no hay a qué bifurcar.
El gate de la señal mínima **no se aflojó** — sigue donde estaba, server-side en
`registrarEvaluacion`, y el aviso de faltantes lo sigue mostrando `FichaForm`, ahora a un scroll
del veredicto en vez de a una pantalla de distancia.

### Las pruebas adaptadas

```
PRUEBA       tests/setter/01-flow.spec.ts:80  (B1 · FICHA)
VERIFICABA   el banner de senal completa dice «guarda y pasala por el Evaluador»
VERIFICA     el mismo banner, con la frase que ya no manda a una herramienta:
             «guarda y baja a dejar tu veredicto»

PRUEBA       tests/setter/01-flow.spec.ts:93  (B2 · EVALUACION -> VEREDICTO)
VERIFICABA   navegando a m2, que registrar score+veredicto+razonamiento transiciona
             FICHA->EVALUADA por la via legal
VERIFICA     lo mismo, en m1, y ADEMAS que las dos mitades estan en la misma pantalla:
             afirma sobre las regiones «La ficha del negocio» y «Tu veredicto». Sin ese
             agregado el test pasaria igual navegando a cualquier lado que monte el form,
             y la fusion es justamente que esten juntas.

PRUEBA       tests/setter/01-flow.spec.ts:324  (B9 · DESCARTADA)
VERIFICABA   que el manual «colapsa al veredicto»: la raiz aterriza en /manual/m2 y m14
             rebota a m2
VERIFICA     que el manual colapsa al ARCHIVO: la raiz aterriza en /manual/archivo, que
             dice «Archivo — Descartado» con el motivo textual, que el enlace al veredicto
             lleva a m1 y ahi se lee «Veredicto registrado», y que m14 rebota al archivo.
             La garantia que la prueba original protegia —que un descartado no se confunda
             con nada y no tenga trabajo por delante— es la misma; cambio donde vive.

PRUEBA       tests/setter/16-municiones-salida.spec.ts:141  (fila m2 de PANTALLAS_CON_PARED)
VERIFICABA   que en m2 la pildora «Link pendiente» del chat de evaluacion y su salida se
             leen sin abrir ningun plegable
VERIFICA     nada: la fila se retiro, con el motivo escrito al lado. No es que la pared se
             haya arreglado — la pantalla dejo de montar ese ToolGuide, porque la fusion
             elimino el viaje. La herramienta `evaluador` SIGUE en el registro y el guard
             del propio archivo la sigue contando (sinUrl === evaluador, gemDiseno,
             claudeDesign, gemOutreach — intacto): lo que se fue es su consumidor. Las
             otras cinco filas (m6, mc1, mc2, m4, mr) siguen verdes.

PRUEBA       tests/galeria/captura.spec.ts:74-76  (3 estados de m2)
VERIFICABA   capturaba m2 en tres estados (ida, veredicto registrado, descartado)
VERIFICA     dos: 04-m1-veredicto-registrado (m1 congelada con el resumen) y
             05-archivo-descartado. El tercero (03-m2-al-evaluador) se retiro: sin viaje
             a la herramienta sembraba y fotografiaba lo mismo que 02.

INVARIANTE   src/lib/leados/manual.invariant.ts:88  (caso 4)
AFIRMABA     descartada.actual === 'm2' — «DESCARTADA sigue mostrando el veredicto en m2,
             no el archivo»
AFIRMA       descartada.actual === 'archivo', y las dos mitades de lo que esa afirmacion
             protegia, ahora explicitas: que el veredicto sigue alcanzable (completadas
             incluye m1) y que no se habilita ningun paso de trabajo (habilitadas es solo
             archivo). El sprint invirtio la afirmacion a proposito y el motivo quedo
             escrito en el archivo.
```

### El test nuevo, y cómo se demostró que tiene dientes

`tests/setter/20-veredicto-abre-construir.spec.ts` (2 tests) fija la garantía que la fusión no
puede aflojar: **un lead sin veredicto no llega a construir**. El invariante del grafo prueba
que la transición no existe; esto prueba que tampoco existe la pantalla — que la guardia del
server no habilita m6, mc1, mc2, m13 ni m14 mientras el dossier siga en FICHA. Se siembra el
estado más favorable al bug: ficha completa **y** gate comercial abierto (`caliente`). Todo
listo menos el veredicto.

**El sabotaje fue contra el código de producción, no contra un fixture.** Se agregaron
m6/mc1/mc2/m13/m14 a las `habilitadas` del case `FICHA` de `posicionDe` (`manual.ts`) y se
rebuildeó — el estado exacto donde la garantía no existe. Los dos tests se pusieron rojos, cada
uno en su primer destino:

```
Error: m6 no se alcanza sin veredicto — rebota a m1
  Expected pattern: /manual/m1$
  Received string:  ".../manual/m6"
  2 failed
```

Revertido el sabotaje y rebuildeado: `2 passed`.

### La verificación, operando la aplicación a 1440

Capturas en `docs/proof-screenshots/d15-bis/` (10, gitignored como todas las del repo).

1. **El recorrido entero, sin abrir una sola herramienta externa.** Cartera → abrir el lead
   (aterriza en m1) → cargar la ficha → banner de señal → guardar → **bajar en la misma
   pantalla y dejar el veredicto** (score 4, «Avanzar con prioridad», razonamiento propio) →
   registrar → el brief queda abierto. Es exactamente lo que la corrida del novato no pudo
   completar.
2. **El descarte.** Score 2 → «Descartar» → modal de motivo → aterriza en `/manual/archivo`, que
   dice «ARCHIVO — DESCARTADO», «Lo descartaste en la evaluación», «Por qué lo descartaste» con
   el texto, y enlaza el veredicto completo.
3. **El rail y el indicador**, con el conteo de la tabla de arriba: en m1 el indicador dice
   «FICHA» sin contador (m = 1, disciplina P9), y con el veredicto registrado la Ficha aparece
   como completada en el rail de m6.
4. **`evaluacionJson`, leído de la base**, idéntico en forma al de antes de la fusión:

```
avanzar:   {"fecha":"2026-09-01T15:36:14.609Z","score":4,"veredicto":"CALIENTE",
            "razonamiento":"Duena visible y decide ella. ..."}
descartar: {"fecha":"2026-09-01T15:36:21.872Z","score":2,"veredicto":"DESCARTAR",
            "razonamiento":"IG muerto hace casi un ano ...",
            "motivoDescarte":"Negocio inactivo hace meses, sin senal digital aprovechable."}
```

Claves y tipos: `score` número, `veredicto` string, `razonamiento` string, `fecha` string, más
`motivoDescarte` string en el descarte. Es la misma forma porque es el mismo camino: el
`git diff` sobre `contracts.ts` (`EvaluacionSchema`) y sobre `dossier.ts` (`transitionDossier`,
donde se estampa el blob) está **vacío**.

### Cierre

`tsc --noEmit` exit 0 · invariantes **49/49** (50 descubiertos, 1 excluido) · `test:setter`
**99/99** · `test:leados` **33/33** · `test:helpers` **26/26** · `build` exit 0 ·
`prisma migrate status`: 86 migraciones, sin drift.

`git diff` **vacío** sobre los tres contratos que el sprint no podía tocar:
`src/lib/leados/dossier-stage.ts` (`LEGAL_TRANSITIONS`), `src/lib/leados/contracts.ts`
(`EvaluacionSchema`) y `src/lib/leados/dossier.ts` (`transitionDossier`). `prisma/schema.prisma`
también intacto: `EVALUADA` sigue en el enum.

### Fuera de alcance, anotado

- **El rail «Tus herramientas» sigue ofreciendo «Chat de evaluación (Sonnet) · Evaluación ·
  PENDIENTE».** Es una fila inerte (`url: null`, sin destino: no es un callejón), pero anuncia
  una herramienta para un paso que el producto ya no tiene, y su subrótulo nombra una fase que
  salió de `FASES_MANUAL`. **No se tocó a propósito**: `herramientas.ts` es la configuración
  editable de Franco y borrarle una entrada es decisión suya, no de este sprint. Se ve en
  `01-cartera.png` y en todas las capturas.
- El rediseño de la ficha por fuentes, con los dos umbrales y el corte de los diez minutos.

### Para la verificación humana

- Que el copy del veredicto suene a criterio propio y no a trámite. Ningún test lo valida.
- Que la pantalla fusionada no quede demasiado larga: son dos pantallas en una. Se ve entera en
  las capturas 02, 03, 04 y 05.

---

## Sprint P16 — LA FICHA POR FUENTES: un solo viaje, y el bloque siguiente se abre solo — 2026-09-01

**Rama** `fix/ficha-por-fuentes` · **base** `f4332226` (`fix/fusion-m1-m2`, la pantalla fusionada de
D15-bis) · **worktree** `C:/tmp/wt-p16-fuentes`, propio, `node_modules` por junction, puerto 3003,
`E2E_DIST_DIR=.next-setter` · **sin pushear**

D15-bis juntó la ficha y el veredicto en una pantalla, y con eso la duplicó. Este sprint no le saca
nada: la reordena por el lugar del que sale cada dato. El setter recorre Instagram, Google y la web
que ya tienen para anotar, y después los recorría OTRA VEZ para bajar el logo y las fotos — porque
el formulario pedía las observaciones en un orden y el material («material para construir la demo»)
al final, en un cajón aparte. Ahora cada fuente es un bloque con sus dos mitades juntas, y se visita
una sola vez.

Y es el PILOTO del avance por completitud: el bloque siguiente se abre solo cuando el anterior queda
completo, sin botón de «siguiente». A3-bis midió que ningún mecanismo existente alcanzaba para S2.
Acá se construyó, en la pantalla más larga del recorrido. Lo que Franco tiene que decidir con esto en
la mano es si el patrón se propaga a las catorce pantallas.

**Lo que NO se tocó, y está probado abajo con `git diff` vacío:** `contracts.ts` (`FichaSchema` y
`EvaluacionSchema`), `flow.ts` (`fichaFaltantes`, el gate de señal mínima), `dossier-stage.ts`
(`LEGAL_TRANSITIONS`), `dossier.ts` (`transitionDossier`), `dossier.actions.ts` (`guardarFicha` y
`registrarEvaluacion`) y `prisma/schema.prisma`. Ni un campo se agregó, se sacó ni se renombró.

### Fase 0 · el terreno

`git fetch --all --prune` limpio. Base `f4332226`, worktree nuevo y limpio (`git status --porcelain`
vacío al empezar). 19 worktrees vivos en la máquina, ninguno tocado; dos stashes ajenos
(`epitaxy: pre-switch` de `redesign/home` y de `fix/home-sanidad`), ninguno tocado.

`tsc --noEmit` **exit 0** · `check:invariants` **49/49 verde** (50 descubiertos, 1 excluido) ·
`test:setter` **99/99** sobre la base.

**La medición de la pantalla ANTES**, que es contra lo que se compara al cerrar. Dos trampas del
shell que el instrumento evita, las dos ya conocidas: el shell del setter es `fixed inset-0` y el
scroller es el `<main>`, no el documento (`document.scrollHeight` da el alto del viewport y
`window.scrollY` es siempre 0), y React streamea a `body > div[id^="S:"]`, así que un selector de
conteo ve el doble si no se acota al `<main>` visible.

| | 1440×900 | 390×844 |
|---|---|---|
| Fold real (alto del `<main>`) | 788 px | 688 px |
| Alto scrolleable | **3.155 px** | **4.162 px** |
| Alto de la zona Registro | 2.297 px | 3.102 px |
| Pantallas de scroll | **4,00** | **6,05** |
| Campos montados a la vez | **14** | 14 |
| Campos visibles sin scrollear | **0** | **0** |

Los 14 son los 12 de la ficha más los 2 del veredicto que cuentan como control (`<select>` y
razonamiento; el score es un `radiogroup` de botones).

### Paso 1 · el censo de campos por fuente

El mapa vive en código, en `src/lib/leados/ficha-bloques.ts`, con los casos ambiguos anotados ahí
mismo. Doce campos, ninguno agregado ni sacado:

| campo | control | obligatorio | fuente según su propio hint | bloque |
|---|---|---|---|---|
| `igManejadoPor` | select | sí (OR con notas) | Instagram — «fijate quién contesta los comentarios» | 1 · Instagram |
| `identidadNotas` | textarea | sí (OR con el select) | **ambigua** | 1 · Instagram |
| `contenidoReal` | textarea | sí (OR con reseñas) | Instagram — fotos, logo, tono | 1 · Instagram |
| `comoSePresenta` | textarea | no | **ambigua** (bio ⊂ IG · quiénes-somos ⊂ web) | 1 · Instagram |
| `imagenesUrl` | url | no | **ambigua** (Drive · la web vieja · el perfil) | 1 · Instagram |
| `resenas` | textarea | sí (OR con contenido real) | Google / Maps | 2 · Google |
| `resenasUrl` | url | no | Google — «la dirección de la ficha de Google» | 2 · Google |
| `queVende` | textarea | no | **ambigua** (carta ⊂ web · highlights ⊂ IG · menú ⊂ Maps) | 3 · La web |
| `presenciaDigital` | textarea | **sí** | **ninguna sola** — es el inventario de las tres | 4 · Balance |
| `senalesOperativas` | textarea | no | **ninguna sola** — horarios ⊂ Maps, pedidos ⊂ IG, demoras ⊂ reseñas | 4 · Balance |
| `otraRedUrl` | url | no | **ninguna** — apunta a una CUARTA red | 4 · Balance |
| `otros` | textarea | no | **ninguna** — cajón | 4 · Balance |

**Cuatro campos no salen de ninguna fuente sola: ése es el quinto bloque.** `presenciaDigital` pide
«qué tienen y qué no» — un inventario que sólo se puede escribir DESPUÉS de mirar las tres;
`senalesOperativas` reparte sus preguntas entre las tres; `otraRedUrl` apunta a una red que no es
ninguna de las tres; `otros` es el cajón. Van juntos en **«4 · Mirando las tres juntas»**, después
del recorrido, porque antes no hay con qué contestarlos. La forma quedó en cinco tramos y no en
cuatro: tres fuentes + el balance + el cierre.

**Las tres ambigüedades, y por qué se resolvieron así (no se forzó ninguna, se decidió y se anotó):**

- `identidadNotas` — su ejemplo es de Instagram («la cuenta la firma "Marce"»), pero «hace cuánto
  existe el negocio» también sale de Maps. Va a Instagram **forzado por el contrato**: `identidad` es
  un solo objeto y `fichaFaltantes` lo evalúa como un OR con el selector. Separarlos partiría un
  requisito del gate entre dos bloques sin ninguna necesidad.
- `comoSePresenta` — «su bio, su eslogan o el quiénes somos»: la bio es de Instagram, el
  quiénes-somos de la web. Desempata su propio ejemplo, que dice «bio de IG».
- `imagenesUrl` — «una carpeta de Drive, la web vieja, el perfil con las mejores fotos»: las tres. Va
  a Instagram para quedar **pegado a `contenidoReal`** («¿hay logo? ¿las fotos son reales?»), que es
  la misma mirada al mismo perfil. Separarlos reconstruiría adentro de la pantalla el doble viaje que
  este orden viene a sacar.

**El hallazgo grande del censo: el bloque de la web queda con UN campo.** Ninguno de los doce campos
existentes es web-first; `queVende` es el único que apunta ahí antes que a otro lado. El campo que
llenaría ese bloque —«cómo se ve la web»— es uno de los cuatro que el rediseño pide y que la regla 1
deja explícitamente afuera. Se deja el bloque con su único campo a propósito: es honesto, y además es
el que prueba que un bloque flaco no fabrica un callejón.

### Paso 2 · las cinco decisiones del avance por completitud

El criterio del sprint —el que menos estado invente y menos clics agregue— se cumplió entero:
**ninguna de las cinco inventó estado nuevo.** Cero claves en `progresoJson`, cero cookies, cero
columnas, cero migraciones. Lo único que hay es una variable de UI efímera (`useState`) que arranca
derivada de lo que hay escrito.

**1 · ¿Qué significa «completo» para un bloque con campos opcionales?**
**Completo = «no te debe nada y no está vacío».** Las dos mitades hacen falta y responden a cosas
distintas: «no debe nada» es el gate (`fichaFaltantes`, sin tocar); «no está vacío» es lo que hace
que el recorrido CAMINE.

Sin la segunda mitad el patrón se rompe en silencio, y está medido: el bloque de la web no tiene
requisitos propios, y el de Google deja de tener el suyo apenas el contenido real se escribió en
Instagram (son un OR). Con «completo = no debe nada», los dos estarían completos desde que se abren y
al terminar Instagram se desplegaría el balance de una: el recorrido por fuentes se perdería sin que
nada fallara. El invariante lo ejerce con un sabotaje explícito — sacándole esa mitad,
`bloqueSiguiente('instagram')` devuelve `balance` en vez de `google` y sale en rojo.

**2 · ¿Qué pasa si el setter vuelve a un bloque anterior y lo vacía?**
**No se le cierra nada.** El bloque en el que está sigue abierto; lo que cambia es la cabecera del
que vació, que vuelve a decir qué falta, y el aviso de señal mínima, que reaparece entero. El avance
automático sólo mira hacia adelante y sólo se dispara al salir de un bloque COMPLETO: nunca arrastra
al setter de vuelta ni le mueve la pantalla bajo los pies. Lo escrito no se pierde nunca (el estado
del formulario vive en el padre; plegar un bloque no lo toca). Verificado en V2.

**3 · ¿Se puede saltear un bloque?**
**Sí, y por eso las cinco cabeceras están SIEMPRE, plegadas pero visibles y clickeables.** Acá se
tomó distancia del enunciado a propósito: la forma pedida decía «el siguiente no aparece hasta que le
toque», y esconderlo es exactamente lo que fabrica el callejón que la decisión 3 quiere evitar. Un
negocio sin web no tiene nada que escribir en ese bloque; si el siguiente no existiera hasta
completarlo, no habría salida. Con la cabecera a la vista, la salida es un click, el bloque dice
«Opcional — podés seguir sin esto», y no hay pared. El avance automático es una invitación, no una
tranca. Verificado en V3.

**4 · ¿El estado de apertura se persiste o se deriva?**
**Se deriva, y no se persiste nada.** Al entrar: si la señal mínima ya está cumplida, se abre el
cierre; si no, el primer bloque incompleto. La ficha ya guarda sola (autosave), así que al volver la
derivación reconstruye el mismo lugar sin un dato nuevo. Después de eso lo mueven dos cosas, las dos
efímeras: el click en una cabecera y el avance automático.

**5 · ¿Qué pasa al volver con la ficha ya completa?**
**Se abre el veredicto**, no el formulario. Es el motivo por el que la decisión 4 mira la señal
mínima y no «el primer incompleto» a secas: un negocio sin web tiene ese bloque vacío para siempre, y
con la regla ingenua volvería SIEMPRE a un formulario que nunca va a poder llenar en vez de a la
decisión que sí puede tomar. Con el veredicto ya registrado la ficha queda congelada y **no hay
acordeón**: la vista solo-lectura de siempre, sin cambios. Verificado en V4 y V5.

### Paso 3 · lo que se construyó

Cuatro archivos nuevos y tres tocados. `git diff --stat`: 472 inserciones, 295 borrados.

- **`src/lib/leados/ficha-bloques.ts`** (nuevo) — el censo y las reglas, puro, sin React ni Prisma. A
  qué bloque va cada campo, qué debe un bloque, qué significa completo, cuál se abre y a cuál se
  avanza. **No reimplementa el gate**: los `REQUISITOS` son el mapa requisito→campos que
  `fichaFaltantes` no expone porque devuelve prosa, y el invariante cruza los dos.
- **`src/lib/leados/ficha-bloques.invariant.ts`** (nuevo) — cinco secciones, abajo el detalle.
- **`src/app/(protected)/setter/_components/bloques-secuenciales.tsx`** (nuevo) — el acordeón. Es
  presentación y mecánica de foco: qué es «completo» lo decide quien lo monta.
- **`ficha-form.tsx`** — los mismos campos, dibujados desde el censo. `aPayload` idéntico.
- **`m1-ficha.tsx`** — el veredicto entra como slot `cierre` del acordeón.
- **`guidance-content.ts`** — las palabras de los cuatro bloques y de los estados de cabecera.
  `GrupoGuia` sumó `material`: lo que hay que bajarse mientras esa pestaña está abierta.
- **`package.json` + `scripts/run-invariants.mjs`** — el invariante nuevo, y la cuenta exacta 50 → 51.

**Las tres decisiones del acordeón que no se ven venir, y por qué:**

1. **El bloque plegado NO SE RENDERIZA** (no queda escondido con CSS). Dos razones, y la segunda
   cierra la discusión: sus campos no pueden quedar en el orden de tabulación de una zona que no se
   ve; y plegar con `overflow:hidden` deja a los inputs con su caja intacta, así que un
   `toBeVisible()` los da por visibles y una prueba pasaría en VERDE sobre el bug que tendría que
   ver. Sin montar, presencia y visibilidad dicen lo mismo. Lo escrito no se pierde: el estado vive
   en el padre.

2. **Con el mouse apretado, el avance ESPERA.** Es la parte que no se ve venir. Al hacer click el
   foco se mueve en el `mousedown`, así que el avance se dispararía ANTES del `mouseup`; y como
   plegar el bloque abierto cambia el alto de todo lo que hay debajo, el botón que se está apretando
   se corre de lugar entre los dos, el `mouseup` cae sobre otra cosa y **el navegador no emite el
   click**. El setter aprieta «Guardar ficha» y no pasa absolutamente nada: una acción sin acuse, que
   es justo el patrón que este producto ya arrastró antes. Si hay un puntero apretado, el avance
   queda pendiente y se aplica en el task posterior al `pointerup`, cuando el click ya se despachó.
   Con teclado no hay nada que esperar. Hay un test dedicado que aprieta de verdad y exige las dos
   cosas: que el guardado ocurra Y que el recorrido avance igual.
   *Límite conocido y anotado en el código*: si el botón se suelta fuera de la ventana no llega
   `pointerup` y ese salto se pierde. No rompe nada — el bloque siguiente sigue a un click.

3. **Una sugerencia de calidad frena el avance hasta que se pueda leer.** Salió de un rojo real de
   `01-flow · B1`: el nudge («eso queda corto, podés sumar…») se dispara al SALIR del campo, que es
   exactamente el mismo momento en que ese campo puede completar el bloque. Con el avance ganando, el
   bloque se plegaba con el mensaje adentro y el setter nunca leía la sugerencia que acababa de pedir
   al terminar de escribir. Ahora el bloque espera.
   **Esto NO convierte el nudge en un gate** (ver el límite duro de `ficha-calidad.ts`): no habilita
   ni deshabilita ningún submit, no dispara ninguna transición y no bloquea nada — el bloque
   siguiente sigue a un click, y el veredicto se registra igual. Lo único que hace es no robarle la
   pantalla a un mensaje advisory en el instante en que aparece. **Queda a criterio de Franco**: es
   la única decisión del sprint que roza un límite escrito, y se tomó del lado de que el mensaje se
   lea.

   Detalle de implementación que hace falta para que funcione: el `onBlur` del campo y el `focusout`
   del bloque son el MISMO evento, así que leyendo el state de nudges el avance vería el valor viejo.
   Hay un espejo síncrono en un ref, escrito sólo desde manejadores de evento.

**Un renombre, y su motivo medido.** El último bloque se llama **«5 · Tu decisión»**, no «Tu
veredicto». El selector del veredicto ya tiene `aria-label="Tu veredicto"` y la cabecera de un bloque
es un `<button>`: dos controles con el mismo nombre accesible en la misma pantalla es una ambigüedad
real. Se midió con el helper que elige opciones de un `<Select>` — apretaba la cabecera del bloque en
vez del selector, plegaba el veredicto, y el panel de opciones nunca abría.

**Dos frases ajustadas por el reordenamiento:**
- El aviso de señal completa decía «guardá y **bajá** a dejar tu veredicto». Con el recorrido por
  bloques el veredicto es el último y el aviso vive DEBAJO del acordeón, así que «bajá» apuntaba al
  revés justo cuando el setter ya estaba parado en él. Ahora: «ya podés dejar tu veredicto».
- El estado de un bloque opcional decía «si no tiene, seguí» — perfecto para la web, raro para
  Google. Ahora: «podés seguir sin esto».

### Paso 4 · verificación, operando la aplicación

Cinco recorridos reales contra el build de producción en :3003, con capturas en
`docs/proof-screenshots/p16/` y la salida completa en `verificaciones.txt`.

**V1 · el recorrido entero de un lead nuevo, bloque por bloque.** Sin apretar un solo botón de avance:

```
al entrar,                          abierto = 1 · En Instagram
tras completar Instagram,           abierto = 2 · En Google y Maps
tras completar Google,              abierto = 3 · En la web que ya tienen
tras completar la web,              abierto = 4 · Mirando las tres juntas
tras el balance,                    abierto = 5 · Tu decisión
```

Y la señal mínima quedó cumplida por el recorrido, sin pedir nada aparte. El material de cada fuente
se pide DENTRO de esa fuente: «¿De dónde bajás el logo y las fotos?» está en el bloque de Instagram,
«¿Dónde se leen las reseñas?» en el de Google, con la línea de qué llevarse antes de cerrar la
pestaña. (`v1-01` … `v1-04`.)

**V2 · volver a un bloque anterior y cambiar algo.**

```
al volver a Instagram, «Identidad — notas» conserva: "La firma \"Marce\", aparece en las fotos…"
tras vaciarlo,  abierto = 1 · En Instagram   (no se le cierra nada encima)
y la cabecera vuelve a pedirlo: "1 · En Instagram / Falta: quién está detrás · reseñas o contenido real"
```

(`v2-01`, `v2-02`.)

**V3 · un negocio sin web.** La cabecera del bloque dice «3 · En la web que ya tienen — Opcional,
podés seguir sin esto»; un click en la cabecera del balance y ya está adentro; llega a cumplir la
señal mínima **sin escribir una línea sobre una web que no existe**. (`v3-01`, `v3-02`.)

**V4 · la pantalla con la ficha completa, y cuánto entra sin scrollear.** Al volver con la ficha
lista, abre en «5 · Tu decisión». Pase a 390 incluido. (`v4-01` … `v4-04`.)

**V5 · el veredicto sigue escribiendo lo mismo, leído de la base:**

```
stage = EVALUADA
claves = ["fecha","razonamiento","score","veredicto"]
forma  = {"fecha":"string","score":"number","veredicto":"string","razonamiento":"string"}
valor  = {"fecha":"2026-09-01T…","score":4,"veredicto":"CALIENTE","razonamiento":"Dueño identificable…"}
```

Idéntica a `EvaluacionSchema`, que no se tocó (`git diff` vacío sobre `contracts.ts`). Post-veredicto
la ficha queda congelada y no hay acordeón: la vista de siempre. (`v5-01`, `v5-02`,
`v5-evaluacion.json`.)

### La medición, antes y después

| | ANTES 1440 | DESPUÉS 1440 | ANTES 390 | DESPUÉS 390 |
|---|---|---|---|---|
| Alto scrolleable | 3.155 px | **2.260 px** (−28%) | 4.162 px | **2.713 px** (−35%) |
| Alto de la zona Registro | 2.297 px | **1.403 px** (−39%) | 3.102 px | **1.653 px** (−47%) |
| Pantallas de scroll | 4,00 | **2,87** | 6,05 | **3,94** |
| Campos montados a la vez | 14 | **5** (−64%) | 14 | **5** |
| Campos visibles sin scrollear | 0 | **0** | 0 | **0** |

Con la ficha ya cargada (que es como se ve al volver) el número baja más: **1.932 px y 2,45
pantallas** a 1440, con 2 campos montados — sólo el veredicto.

**Y el número que NO se movió, que es un hallazgo:** cero campos visibles sin scrollear, igual que
antes. La zona Registro empieza a **756 px** y el fold real del `<main>` es de **788 px**: entran 32
píxeles, apenas el rótulo «REGISTRO». La primera cabecera del recorrido queda unas decenas de píxeles
por debajo del corte. **La pantalla se acortó un tercio y el primer campo sigue sin entrar**, porque
lo que se come el primer scroll no es la ficha: son la instrucción, el «Contexto del lead» y la
«Munición», que son zonas del layout-tipo de `PantallaManual` y valen para las catorce pantallas.
Está fuera de alcance acá y **es lo que hay que atacar si se quiere que el setter pueda escribir sin
scrollear**. Se ve en `v1-01b-fold-sin-scrollear.png` y `v4-01-fold-1440-ficha-completa.png`.

### Las pruebas

**Nuevas — `tests/setter/21-ficha-por-fuentes.spec.ts`, 6 tests.** El recorrido que avanza solo y sin
botón de «siguiente»; el avance que no se come el click; la sugerencia de calidad que frena el
avance; el negocio sin web que no queda encerrado; volver atrás sin perder nada; y el veredicto como
último bloque con su gate intacto. Se afirma por VISIBILIDAD, no por presencia: el bloque plegado no
está montado, así que las dos cosas coinciden y ninguna aserción puede pasar en verde sobre un bloque
abierto de más.

**Demostradas fallando contra el código viejo.** Con el `src/` del sprint stasheado y el build
rehecho sobre `f4332226`, **6 de 6 en rojo**, cada una en su aserción estructural:

```
x 1 el recorrido abre el bloque siguiente SOLO…      Error: la cabecera «1 · En Instagram» está
x 2 el avance no se come el click…                   waiting for getByRole('button', {name:'1 · En Instagram'})
x 3 una sugerencia de calidad frena el avance…       waiting for getByRole('button', {name:'1 · En Instagram'})
x 4 un negocio sin web se sigue con un click…        waiting for getByRole('button', {name:'1 · En Instagram'})
x 5 volver a un bloque anterior no pierde…           Timeout while waiting on the predicate
x 6 el veredicto cierra el recorrido y su gate…      Error: el veredicto es el bloque 5
```

**Sobre el sexto, para no vender lo que no es:** su mitad de GATE está verde en las dos versiones —el
gate del veredicto no cambió, y ése es el punto. Lo que enrojece es la mitad estructural. Se dejan
juntas a propósito porque lo que hay que poder afirmar de una sola vez es «se reordenó **y** el gate
sigue cerrado».

**Adaptadas — `01-flow.spec.ts`, dos tests, cada uno con su bloque de qué verificaba y qué verifica:**

- **B1** verificaba el nudge advisory sobre `presenciaDigital`, la señal mínima y que guardar
  persista, llenando los campos en cualquier orden por placeholder. Verifica lo MISMO, con los mismos
  campos y textos; lo único que cambió es que hay que abrir el bloque de la fuente para llegar al
  campo. Se conservó `presenciaDigital` como sujeto del nudge —en vez de mover la prueba a un campo
  ya abierto— justamente para no cambiar lo que se verifica.
- **B2** verificaba que las dos mitades de la fusión estuvieran en la misma pantalla y en orden,
  leyendo las dos `<section aria-label>`. Ahora afirma sobre las cinco cabeceras y su orden, que es
  lo que la fusión y el reordenamiento prometen juntos. Las dos `<section>` sobreviven en la vista
  congelada, que no cambió.

Las dos, en rojo contra el código viejo (`waiting for '4 · Mirando las tres juntas'` y `el bloque
«1 · En Instagram»`). **Ninguna prueba se borró ni se salteó.**

**El invariante — `check:invariant:ficha-bloques`, cinco secciones.** Lo que protege es que el mapa
no se despegue del gate y que el recorrido camine sin encerrar a nadie:

- **§1 · el mapa contra el gate.** Hay dos listas —los `REQUISITOS` de acá y los `if` de
  `fichaFaltantes`— y eso es exactamente lo que puede divergir. Se cierra SIN copiar el criterio: se
  le dan a `fichaFaltantes` fichas sintéticas armadas desde el mapa y se exige que el conteo coincida
  en las dos direcciones (cumplir todo ⇒ cero faltantes; romper uno ⇒ exactamente uno).
- **§2 · el piso.** La ficha vacía tiene que dar un faltante por requisito. Un `fichaFaltantes` que
  devolviera `[]` siempre pasaría media §1 sin chistar.
- **§3 · el recorrido camina.** Se recorre el camino entero de un lead nuevo exigiendo que en cada
  paso el siguiente sea el que sigue, no dos más adelante.
- **§4 · nadie queda encerrado.** El bloque de la web NO puede tener ningún campo obligatorio, y un
  recorrido que nunca lo escribe igual cumple la señal mínima y llega al cierre.
- **§5 · el censo cubre la ficha entera.** El compilador ya garantiza que todo campo tenga bloque (el
  estado del formulario es un mapeo sobre `CampoFicha`, así que un campo sin bloque no compila). Lo
  que no puede garantizar es que el puente `Ficha → valores` lea todos los campos: eso se prueba acá.

**Sabotajes, para que no pase en verde sobre nada:**

```
1) «completo» = sólo «no debe nada» (sacándole la mitad de contenido):
   AssertionError: Desde «instagram» el recorrido tiene que abrir «google» y abrió «balance».
2) un requisito nuevo en fichaFaltantes sin mapear:
   AssertionError: PISO: la ficha vacía tiene que dar un faltante por cada requisito mapeado…
```

Los dos revertidos y en verde después.

### Cierre

`tsc --noEmit` **exit 0** · `check:invariants` **50/50** (51 descubiertos, 1 excluido) ·
`test:setter` **105/105** · `test:leados` **33/33** · `test:helpers` **26/26** · `build` **exit 0** ·
`prisma migrate status`: 86 migraciones, **sin drift**.

`git diff` **vacío** sobre todo lo que el sprint no podía tocar: `contracts.ts`, `flow.ts`,
`dossier-stage.ts`, `dossier.ts`, `dossier.actions.ts` y `prisma/schema.prisma`. **Ni un campo se
agregó, se sacó ni se renombró; ningún invariante quedó en rojo; ninguna transición cambió.**

### Fuera de alcance, anotado

- **Los cuatro campos nuevos del rediseño** (dirección, horarios, contacto exacto, cómo se ve la
  web), los **dos umbrales de suficiencia** y el **corte de los diez minutos**. Son cambios del
  contrato del blob o decisiones de Franco, y la regla 1 y 2 los dejan afuera. El primero de esos
  cuatro campos es el que llenaría el bloque de la web.
- **El primer scroll no lo come la ficha.** Con el Registro empezando a 756 px y el fold en 788, lo
  que hay arriba —la instrucción, el «Contexto del lead» y la «Munición»— se lleva la primera
  pantalla entera. Es del layout-tipo de `PantallaManual`, vale para las catorce, y **es la próxima
  palanca real** para que el setter pueda escribir sin scrollear.
- **El `<Select>` compartido se cierra ante cualquier scroll de la página** (listener en fase de
  captura) y, al abrirse, enfoca su listbox con `.focus()` sin `preventScroll` — lo que puede
  producir justo ese scroll. Resultado: el panel se cierra solo, de forma intermitente. Es anterior a
  este sprint (ningún test operaba el selector de «¿Quién maneja el Instagram?» hasta ahora) y no se
  tocó. En las pruebas se afirma que ese selector ESTÁ en su bloque, sin operarlo; el requisito de
  identidad se cubre por su otro campo, que es un OR en el gate.
- **`FichaStep` con `editable={true}` es código muerto.** Su único consumidor lo monta con
  `editable={false}` (la vista congelada). La rama viva arrastra `GUIA_FICHA.intro`, `duracion` y el
  `CopyBlock` de la ficha, que hoy no se renderizan en ningún lado. No se tocó: es limpieza, no
  reordenamiento.
- **El rail «Tus herramientas» sigue ofreciendo «Chat de evaluación (Sonnet) · Evaluación ·
  PENDIENTE»**, que D15-bis ya había anotado. Sigue igual: `herramientas.ts` es configuración de
  Franco.
- Los siete baches restantes de la corrida del novato.

### Para la verificación humana

- **Que el recorrido por fuentes se sienta como UN viaje y no como cuatro formularios.** Es el punto
  del cambio y ningún test lo valida. Las capturas `v1-01` … `v1-04` muestran los cuatro tramos.
- **Que la sugerencia de calidad frenando el avance sea la decisión correcta** (Paso 3, punto 3). Es
  la única del sprint que roza un límite escrito, y se tomó del lado de que el mensaje se lea.
- **Si el patrón se propaga.** Con esto en la mano, la pregunta de si el avance por completitud
  gobierna las catorce pantallas ya se puede contestar mirando código que corre. Lo que el piloto
  dejó aprendido, y que va a reaparecer en cada pantalla que lo adopte: (a) «completo» necesita las
  dos mitades o el recorrido se desarma en silencio; (b) el avance tiene que esperar al `pointerup` o
  se come clics; (c) las cabeceras del futuro tienen que estar a la vista o se fabrican callejones;
  (d) el nombre de un bloque compite con los nombres accesibles de los controles que tiene adentro.

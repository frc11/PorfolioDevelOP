# Bitácora Beta 3 — Bloque 3: el wizard del lead (trabajar el lead que el foco entrega)

> Registro vivo de la EJECUCIÓN del Bloque 3. Regla de oro: nada ✅ sin el chequeo que lo prueba.
>
> Continúa la línea `bitacora-beta.md` → `bitacora-beta-2.md` (que cerró el Bloque 2 "foco / modo dirección"). El Bloque 3 trabaja el OTRO lado: el foco entrega UN lead; el wizard guía el trabajo de ESE lead. Por eso abre archivo propio.

---

## Estado global

- Bloque 2 (foco / modo dirección) CERRADO en `bitacora-beta-2.md` (2.1 → 2.5).
- **Bloque 3 — wizard del lead. 3.1 (shell) + 3.2 (entrada: ficha → evaluación → opener) + 3.3 (brief + «esperando respuesta») + 3.4 (construcción → draft → self-check + gate proactivo del envío) + 3.5 (en revisión + envío del link / flujo invertido) CERRADOS.** Próximo: 3.6 (agenda / traspaso).

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

# AUDITORÍA DE CIERRE — LeadOS / Panel del Setter vs Brief de Visión · 2026-07-07

> **Qué es este documento.** La auditoría espejo de `AUDITORIA-VS-BRIEF-2026-07.md` (raíz del repo, 2026-07-02): aquella midió el gap entre la herramienta y el brief; esta mide si el gap se cerró tras el proyecto de rediseño (Bloques 2–7, cerrado el 2026-07-04) Y qué haría a la herramienta más profunda. Es **el documento de continuidad**: el backlog de la sección 7 está escrito para ejecutarse en conversaciones futuras con modelos más baratos — la inferencia cara ya está hecha acá.
>
> **Método.** Read-only estricto (dos únicas escrituras: este informe + la bitácora). 6 subagentes de lectura en paralelo (mapeo/atomicidad §3 · estructura-vs-texto + lente novato · §4–§7 · estados/callejones · edge cases de datos · asimetría de forms + estado de pendientes), ~900k tokens de lectura, toda evidencia con archivo:línea verificada contra el código actual. Sin ejecutar tests/build, sin tocar la DB, sin abrir `.env*`.
>
> **La vara.** `docs/brief-vision-flujo-setter.md` **no existe en el repo** (constatado también por los sprints 7.0 y 7.3). La vara se reconstruyó de tres fuentes: la auditoría de apertura (que cita las exigencias del brief sección por sección), la instrucción de este encargo (que enumera §0–§12 y los guardarraíles §11), y la bitácora del proyecto. Ver sección 9 (Límites).

---

## 0. Arranque en frío

LeadOS es el panel donde un **setter** (vendedor sin experiencia técnica ni con IA) trabaja leads de punta a punta: carga un negocio, arma su ficha, lo evalúa con una IA externa ("el Evaluador"), manda el primer mensaje (opener), y si el negocio responde produce una demo (brief → construcción guiada → borrador en Netlify → chequeo final → revisión de Franco → envío del link → reunión agendada por Cal.com). Franco (el admin) revisa cada demo y marca los leads "calientes"; el motor (stages, gates, aislamiento multi-tenant) vive en `src/lib/leados/` y es intocable. El proyecto de rediseño (jul-2026) reemplazó el wizard de página larga por un **manual paso-por-pantalla** (16 pantallas m1–m16 + reentrada mr + estados espera/revision, en `src/app/(protected)/setter/leads/[leadId]/manual/`), alineó el home al brief (pin ordena el foco, novedades sin segunda cola, guía en estructura y no en prosa) y cerró con regresión verde total (`REGRESION-FINAL-2026-07.md`). Estado hoy: la experiencia es el manual; el wizard no existe; el motor no se tocó en ningún sprint (probado por invariantes byte-idénticas). Esta auditoría encuentra que la **arquitectura** del rediseño cumple, y que lo que queda son datos viciados que hacen mentir al foco, vocabulario muerto del wizard que sobrevive en el copy visible, y las URLs de las herramientas externas que siguen sin cargar (decisión de Franco).

## 1. Veredicto de visión (§10)

**PARCIAL — la estructura ya sostiene la semana del setter; lo que lo traba no es la estructura.** Un setter del perfil §1 recorre hoy el flujo completo sin toparse con un candado mudo ni una pantalla que no explique cómo seguir (verificado pantalla por pantalla), pero se traba igual en tres lugares: (1) las 4 herramientas externas sin link — la tarea de ~11 pantallas es inejecutable desde la pantalla (decisión §12.3, no bug); (2) la línea más protagonista del home y los "arreglos" del chequeo lo mandan a "Paso 7/9/5" — pasos que ya no existen; (3) el foco puede servirle indefinidamente leads muertos (cadencia agotada, perdidos, postergados vencidos) como si fueran trabajo. Los tres tienen fix acotado; ninguno exige re-diseñar.

## 2. Mapa mínimo

- **Manual:** `manual/[paso]/page.tsx` (router único de slots, guardia server-side del futuro en `:58-62`), `manual/page.tsx` (entrada: ownership→404, deriva, redirect), `manual/_data.ts` (carga única owned), `src/lib/leados/manual.ts` (registro `PANTALLAS` + `posicionDe`/`derivarPantalla`, exhaustiva por stage, posición jamás persistida), `manual/_components/` (m*-*.tsx por pantalla + forms write-path locales), `leads/[leadId]/_components/` (forms compartidos extraídos del wizard: ficha/evaluación/opener/brief).
- **Home:** `setter/page.tsx` (header → foco → novedades → cartera colapsada → números → semana), `flow.ts` (partición/orden/foco), `foco-surface.tsx`, `novedades-panel.tsx` (informan, `AbrirFocoButton` ancla), `home-sections.tsx` (cartera + puerta lateral), `progreso.ts`/`mis-numeros.ts`.
- **Carga:** `nuevo/` (alta unitaria, solo `businessName` obligatorio) + `nuevo/importar/` (CSV, parser RFC-4180, tope 500, dedup) + botón persistente en `setter-nav.tsx`.
- **Munición:** `guidance-content.ts` (14 bloques GUIA_*), `flow-content.ts` (shell de construcción + checks), `copy-blocks.ts` (7 builders copiables), `prompts-disenio.ts` (prompts por fase + puente check→prompt), `herramientas.ts` (5 herramientas externas, 4 sin URL).
- **Motor (no tocado, no auditado como cambio):** `flow.ts:79-101` (gates), `dossier.ts` (transiciones), `os-commercial.ts` (write comercial), `escalamiento.ts`, `ownership.ts`/`isolation.ts`, 16 invariantes ejecutables.

## 3. Cumplimiento §0–§11 + lente novato

| Sección | Veredicto | En una línea |
|---|---|---|
| §0 adversarial contra lo propio | APLICADO | Método de esta auditoría; el rediseño no se validó por decreto en ningún punto de abajo. |
| §1 usuario novato | **PARCIAL** | La estructura aguanta; jerga residual + numeración muerta + links pendientes son lo que haría dudar. |
| §2 estructura, no texto | **PARCIAL** | Sin muros de prosa nuevos; dos recaídas puntuales (auto-reporte explicado 2 veces, reentrada explicada en prosa de motor). |
| §3 manual paso-por-pantalla | **PARCIAL** | El núcleo cumple (atomicidad, futuro invisible, atrás libre); m16 cose dos tareas y el "recuerda por vos" tiene 4 huecos concretos. |
| §4 foco / cartera / carga | **PARCIAL** | La mecánica cumple entera (pin, sticky, novedades, puerta lateral, carga visible); datos viciados hacen que el foco dirija hacia trabajo falso. |
| §5 frío-caliente / cadencia / archivo | **PARCIAL** | Archivo categorizado CUMPLE; la palabra "caliente" reapareció en una superficie visible y el cierre de cadencia es textual, no estructural (+bug de dato). |
| §6 puertas y checklists | **CUMPLE** | Checklist no gatea, ningún candado mudo, esperas sin gate, línea inviolable server-side — re-verificado; una salvedad inversa (C-08: acción ofrecida que el server rebota). |
| §7 prompts prefijados | **PARCIAL** | La estructura es correcta (prompt dentro de su fase, puente check→prompt); la munición núcleo está vacía (4/5 herramientas sin URL). |
| §8 cuatro decisiones fijadas | **CUMPLE** | (a) carga/CSV ✓, (b) re-loop preserva y muestra la nota al frente ✓, (c) paso→acción ✓ (con labels stale, C-04), (d) home acción-primero ✓. |
| §9 autonomía / rol de Franco | **CUMPLE** | Escalamiento solo en construcción y opcional; notificaciones informativas; esperas presentadas como esperas; nada nuevo lo contradice. |
| §10 el veredicto grande | **PARCIAL** | Ver sección 1. |
| §11 guardarraíles | **CUMPLE** | Motor intacto (invariantes byte-idénticas, git-diff — sello 7.3, re-constatado acá por lectura); ninguna espera se gateó; el ojo no se automatizó. |

**Balance: 4 CUMPLE · 7 PARCIAL · 0 NO CUMPLE** (contra 2 sev-4 estructurales y 29 divergencias de la apertura: la divergencia central §3 —el wizard— murió; lo que queda es de otra clase y otro tamaño).

### Detalle de los PARCIAL

**§1 / lente novato re-aplicado.** De los 3 hallazgos del recorrido-de-novato viejo (`auditoria-recorrido-completo-novato.md`): **(1) "Link pendiente" SIGUE** — `herramientas.ts:63,75,87,111` con `url: null` (solo Netlify real, `:99`); la UI lo maneja con dignidad (`tool-guide.tsx:23-29`) pero el efecto empeoró con el manual: la zona Munición de m2/m3/m4/m5/m6/m7-m12 culmina en una pastilla muerta — la tarea de ~11 pantallas es inejecutable desde la pantalla. **(2) CTA bajo el fold: RESUELTO** (foco primero en `page.tsx:81-93`, onboarding borrado en 6.3). **(3) Acumulación: MURIÓ** con el corte del wizard. **Fricciones nuevas nacidas del manual:** dos sistemas de numeración conviven ("Evaluación — paso 1 de 2" del manual vs "Paso 2 · Evaluación" del rail de herramientas, `herramientas.ts:62,74,86` renderizado en `tools-rail.tsx:37-39`); el badge "Disponible" (`pantalla-manual.tsx:143-145`) es un tercer estado sin definición; m5 puede aparecer "Completada" y "Tu paso ahora" a la vez (por-toque, correcto pero sin explicación). Jerga visible que un novato no resuelve: "el gate es server-side" (bajada de m15, `manual.ts:248`), "hard-blocks" (m14, `manual.ts:240`), "dossier" (m3, `manual.ts:158`), "draft" en la bajada de la pantalla que se llama Borrador (`manual.ts:232`), "Glassmorphism en la navbar" (`flow-content.ts:182`), "sheet"/"flag" (`guidance-content.ts:922`), "trigger" (`:751`), "round-trip" (`:533`), "pipeline" (toast, `seguimiento-form.tsx:68`), "warm-up" (`canal-seguridad.tsx:44`), "input del Gem" (`m5-seguimiento.tsx:166`, `m6-brief.tsx:26`), "Booking Cal.com: {uid}" (`m16-agenda.tsx:98`), "ratio" (`mis-numeros.tsx:51`), "Entra frío, en ficha" sin definir (`nuevo-prospecto-form.tsx:202`), "Vio el video" como status heredado que ninguna pantalla actual produce (`flow-content.ts:261`).

**§2.** El test operativo pasa en general: layout-tipo instrucción→contexto→munición→registro comunica solo; los mejores ejemplos son `estado-manual.tsx` (1 título + 1 línea + 1 CTA) y `brief-sanity.tsx:60-72` (un chequeo convertido en dos botones). Recaídas: (a) el auto-reporte de las fases se explica en prosa DOS veces por pantalla (`manual-nav.tsx:219-222` + `fase-auto-reporte.tsx:100-103`) — si el tilde necesita dos párrafos para aclarar que no hace nada, el control comunica lo contrario de lo que es; (b) la reentrada mr explica la semántica del reset en dos bloques de prosa (`manual/[paso]/page.tsx:108-111` y `:238-242`) cuando los chips de completadas ya la muestran (m14 desaparece sola de "Completadas").

**§3.** Verificado con rigor: **futuro invisible real** (guardia server-side `[paso]/page.tsx:58-62`, el futuro ni se renderiza como fachada; posición re-derivada por request, `manual.ts:588-599`, exhaustiva con never-guard) y **atrás libre real** (completadas navegables como consulta, nunca forms reseteados — censo pantalla por pantalla en el reporte del agente 1). Atomicidad: 15 de 16 pantallas son una tarea mental (m13 y m14 borderline pero defendibles). **La excepción es m16**: dos tareas separadas por una espera externa de duración arbitraria (ofrecer horarios → esperar que el prospecto elija → confirmar), todo en client-state (`agenda-form.tsx:53-58`); la propia munición lo admite ("esperá que elija uno", `guidance-content.ts:745`). **"Recuerda por vos" — 4 huecos**: (1) los horarios ofrecidos NO se persisten (`ofrecerHorarios` es read-only, `agenda.actions.ts:108-111`) — si el setter cierra la pestaña tras pasárselos al prospecto, el manual no recuerda qué ofreció (el hueco más caro); (2) la nota del toque anterior y (3) el texto del opener enviado existen persistidos (`outreach.actions.ts:124,180`) pero solo aparecen en el historial colapsado al pie — no en el slot de contexto de m5 donde el setter retoma la conversación; (4) `otros` de la ficha no viaja a Claude Design (`copy-blocks.ts:186-187`, declarado fuera de scope en 5.3) y `referenciasFicha` sigue siendo un campo muerto del contrato (`contracts.ts:73`, cero capturas y cero lecturas).

**§4.** La mecánica cumple entera y está bien protegida (pin ordena con invariante `particion`; sticky se invalida por construcción, `foco.ts:48-49`; EN_REVISION/CALL_AGENDADA jamás alimentan el foco; POSTERGADO vencido vuelve solo; novedades sin links — guarda e2e A4; puerta lateral y carga visible intactas). Lo que rompe el "dirige SIEMPRE (hacia trabajo real)" son tres datos viciados — ver C-02, C-03, C-11 en la sección 4: el foco puede servir eternamente un lead con cadencia agotada con el CTA "Toca el follow-up — mandalo y registralo (Paso 9)" mientras M5 dice lo contrario, un lead PERDIDO abre en m5 activo invitando a contactar un negocio cerrado, y POSTERGADO-vencido/RECHAZADO no tienen vía de salida propia.

**§5.** Archivo: CUMPLE completo (causa descartado/perdido visible y filtrable, `flow.ts:653-671` + `cartera-toolbar.tsx:27-28`; suma a "Tu semana", `progreso.ts:34-45`; "Mi criterio" refleja el filtrado, `mis-numeros.ts:41-52`). Taxonomía: el trabajo grueso de A-07 se hizo (M3 dice "Avanzar con prioridad"; el score solo notifica) **pero** `herramientas.ts:61` describe el veredicto del Evaluador como "descartar / avanzar / **caliente**" y se renderiza en M2 y M3 (`tool-guide.tsx:78`) — la palabra prohibida en la misma pantalla que se esfuerza por no decirla; el veredicto CALIENTE además comparte ámbar+`Flame` con el badge operativo de Franco (`evaluacion-form.tsx:306-313`); y los hints viejos ("4–5 marca el lead como caliente", `guidance-content.ts:347,351,374`) siguen como defaults sin consumidor vivo — mina latente. Cadencia: la munición de m5 sí cambia estructuralmente al agotarse (sin plantilla, nota de cierre), pero el **form no** — sigue ofreciendo "No respondió" sin límite (`seguimiento-form.tsx:33-55`, sin guard en `outreach.actions.ts:144-195`) y puede mostrar "Toques de follow-up: 4 de 3" (`m5-seguimiento.tsx:73-77`). El A-08 de la apertura sigue medio-abierto: mejor copy, misma estructura.

**§7.** El patrón A-10 quedó bien cerrado (prompt dentro de su fase, `prompts-disenio.ts:178-181` + `m-construccion.tsx:87-96`; check fallado ofrece su prompt, `chequeo-form.tsx:150-158`). La cobertura 1/6 del puente y las 4 fases sin prompt siguen siendo constancia honesta (contenido = Franco, §12.1). Lo que degrada el veredicto es que la munición núcleo — el lugar donde pegar cada bloque copiable — no existe: 4/5 URLs null.

## 4. Bugs y fricciones que el verde no atrapa (severidad desc)

Los IDs C-xx son de esta auditoría. "Motor-adyacente" = el fix toca write-paths comerciales o mensajes de server actions; se trata con la cautela de 7.3 (test primero, FRENAR si asoma una transición/gate).

| ID | Sev | Hallazgo | Evidencia | Fix (dirección) |
|---|---|---|---|---|
| C-01 | **5** | 4/5 herramientas externas sin URL — la tarea de ~11 pantallas del manual es inejecutable desde la pantalla. Único bloqueo total del recorrido, igual que en la era del wizard. | `herramientas.ts:63,75,87,111` | No es código: Franco carga los 4 links (§12.3). |
| C-02 | **4** | Cadencia agotada = lead muerto **eterno en `trabajar`**: al 4º SIN_RESPUESTA `calculateNextFollowUp` da null pero `nextFollowUpAt` viejo no se limpia (solo se actualiza `if (nextFollowUpAt)`) ⇒ `followUpVencido` true para siempre ⇒ el foco lo sirve por antigüedad ANTES que leads frescos, con CTA "Toca el follow-up… (Paso 9)" mientras M5 dice "no queda un próximo toque". | `os-commercial.ts:68-76`, `home.ts:46-47`, `flow.ts:375-378,459-461`, `m5-seguimiento.tsx:141-147` | Motor-adyacente: `else { nextFollowUpAt: null }` + decidir el grupo destino del agotado (espera-enfriamiento) + test de cadencia. |
| C-03 | **4** | `posicionDe` deriva SOLO por stage y no contempla `status === 'PERDIDO'`: un lead que Franco cerró sigue derivando vivo (p.ej. m5 activo con "Mensaje base del toque N — adaptalo y mandalo") y `registrarResultado` no lo rebota. El manual invita a contactar un negocio cerrado. | `manual.ts:473-581`, `m5-seguimiento.tsx:148-153`, `outreach.actions.ts:144-195` | Rama temprana por status terminal en `posicionDe` (vista archivo read-only) + guard de status en `registrarResultado` (motor-adyacente). |
| C-04 | **4** | Numeración del wizard muerto en copy visible — referencias irresolubles: la línea más protagonista del foco y de cada card ("(Paso 7/9)", `flow.ts:420,429,432,457,460` → `foco-surface.tsx:171`), los "arreglos" de los checks duros ("volvé al Paso 5", "Paso 4, fase Mobile" — `flow-content.ts:135-165`, render en `chequeo-form.tsx:140` Y en la nota de rechazo que Franco reusa), el rail de herramientas ("Paso 2 · Evaluación", `herramientas.ts:62,74,86`), errores de actions ("Paso 7/9/10/2/5": `outreach.actions.ts:103,108,117,165,173`, `dossier.actions.ts:382`), títulos de TeachPanels (`guidance-content.ts:244,331,402,478`). | (citado) | Barrido único de vocabulario: títulos/chips de `PANTALLAS` como diccionario canónico. Los de actions son motor-adyacentes (solo strings). |
| C-05 | **4** | m16: dos tareas cosidas por una espera externa + **los horarios ofrecidos no se recuerdan** (slots en `useState`; `ofrecerHorarios` no persiste) + las notas de traspaso obligatorias y el resto del form se pierden sin guardia al cerrar la pestaña — es el form con más estado acumulado del manual y el único gesto irreversible sin confirmación. | `agenda-form.tsx:53-58,220-227`, `agenda.actions.ts:108-111` | Partir el booking en dos momentos re-entrables + persistir los horarios ofrecidos (aditivo en `agendaJson`) + guardia de salida. Diseño para decisión de Franco (ver PR-2). |
| C-06 | 3 | Cierre de cadencia solo textual: el form de m5 sigue ofreciendo "No respondió" con cadencia agotada (el brief pide cambio de estructura); display "4 de 3" posible. | `seguimiento-form.tsx:33-55`, `m5-seguimiento.tsx:73-77` | Con `cadencia.agotada`: quitar la opción SIN_RESPUESTA del form (quedan Respondió/Postergar/Rechazó) + clamp del contador. Depende de C-02. |
| C-07 | 3 | Taxonomía caliente residual: "caliente" como nombre del veredicto visible en M2/M3 vía ToolGuide; veredicto y badge de Franco comparten ámbar+Flame; hints viejos como mina latente en defaults. | `herramientas.ts:61`, `evaluacion-form.tsx:306-313`, `guidance-content.ts:347,351,374` | Reescribir `queTeDevuelve` del evaluador; cambiar tono/ícono del veredicto alto; corregir los 3 hints base. Solo copy/estilo. |
| C-08 | 3 | El tilde de fase se ofrece en stages donde el server lo rebota: m7-m12 habilitadas en BRIEF y RECHAZADA, el tilde renderiza incondicional, pero `saveOwnedProgreso` lanza si stage ≠ CONSTRUCCION → optimista + toast de error. El anti-patrón que el propio manual condena. | `manual.ts:520,539`, `m-construccion.tsx:137-142`, `dossier.ts:391-393` | Deshabilitar-con-motivo el tilde fuera de CONSTRUCCION ("primero Arrancá/Reabrí la construcción"). |
| C-09 | 3 | m16 inalcanzable cuando su gate real está abierto pre-demo (el motor permite agendar con solo RESPONDIO; la derivación exige APROBADA+demoEnviada) mientras m5 promete "eso se agenda en «Agendá la reunión»". O el copy miente por omisión o la derivación cierra una puerta abierta. | `agenda.actions.ts:88-102` vs `manual.ts:547-557`; `seguimiento-form.tsx:43` | DECISIÓN de Franco: ¿demo-first estricto? Entonces ajustar el copy de m5; si no, habilitar m16 con el gate real. |
| C-10 | 3 | `DossierTransitionError` llega crudo al toast: "Transición ilegal: EVALUADA → CONSTRUCCION", "evaluacionJson ausente o inválido — no debería pasar", "El dossier desapareció durante la transición". | `dossier.actions.ts:67`, `outreach.actions.ts:51`, `dossier.ts:148,199-201,258` | Mapear TransitionError → copy operativo antes del `fail` (motor-adyacente: solo strings/mapeo). |
| C-11 | 3 | POSTERGADO vencido y resultado RECHAZADO sin vía de salida: nada resetea el status al retomar, y RECHAZADO solo registra la activity → el foco repite "retomá el contacto"/"toca el follow-up" para siempre. | `os-commercial.ts:78-96,162-172` | Motor-adyacente: definir las salidas (retomar limpia POSTERGADO; RECHAZADO encausa a cierre/espera). Junto a C-02. |
| C-12 | 3 | `ChequeoForm`/`EnvioForm` solo toast (el motivo del rebote se esfuma; el gate de envío merece error persistente); raíz: no usan `useStepAction`. Confirmado vigente post-7.2. | `chequeo-form.tsx:66-91`, `envio-form.tsx:34` | Migrarlos a `useStepAction` + error inline (patrón `borrador-form.tsx:38-42`). |
| C-13 | 3 | El reset de slots tras conflicto de horario depende de `mensaje.includes('se acaba de ocupar')` contra un string que vive en DOS fuentes server — editar cualquiera rompe silencioso. | `agenda-form.tsx:92`, `agenda.actions.ts:177`, `cal-com-v2.ts:194` | Código de error explícito compartido server↔client. |
| C-14 | 3 | Cartera sin paginación (A-31 vigente): 500 leads = 500 LeadCards + payload completo; timeline del lead también sin cap. | `ownership.ts:52-56`, `cartera-view.tsx:94-99`, `timeline.ts:51-63` | "Mostrar más" incremental + `take` en timeline. Umbral: cartera >100. |
| C-15 | 3 | Jerga técnica visible en el corazón del manual: bajadas de pantalla ("el gate es server-side" m15, "hard-blocks" m14, "dossier" m3, "draft" m13), "toque" y "follow-up" fusionados en el mismo label/toast ("Toques de follow-up: N de 3"; "No respondió — mandé un follow-up"/"Registra el toque"), "borrador" vs "draft" según valide o no el mismo campo, "self-check" en la capa de enseñanza de la pantalla "Chequeo final", m5 nombrada de tres formas distintas por sus vecinas. | `manual.ts:158,232,240,248`, `m5-seguimiento.tsx:73`, `seguimiento-form.tsx:36-37,61`, `dossier.schemas.ts:71-74`, `guidance-content.ts:515,752`, `ejemplo-ideal.tsx:106`, `m16-agenda.tsx:159-166` | Mismo barrido que C-04 (una sola lengua; diccionario = títulos de `PANTALLAS`). |
| C-16 | 3 | Guardias de salida asimétricas: `agenda-form` (cubierto en C-05) y `opener-form` (hasta ~500 chars sin autosave NI guardia — único de la familia A desprotegido); `seguimiento-form` pierde la nota sin aviso. | `opener-form.tsx` (sin `use-unsaved-guard`), tabla del agente 6 | `useUnsavedGuard` derivado del estado (patrón A-24 de `evaluacion-form.tsx:94-96`). |
| C-17 | 2 | DESCARTADA aterriza en m3 con badge y marco **cyan "Tu paso ahora"** — el color accionable sobre un lead muerto contradice la disciplina B9. | `pantalla-manual.tsx:134-137`, `manual.ts:492-495` | Tono zinc cuando `habilitadas` está vacía. |
| C-18 | 2 | La rama "deshabilitado-con-motivo" de m15 (3 motivos específicos + CTA) es **inalcanzable**: con APROBADA y gate cerrado la derivación manda a `espera` genérica — el setter no ve "aprobada, falta que responda". | `m15-envio.tsx:107-127` vs `manual.ts:571-573` | Habilitar m15 como consulta en APROBADA, o llevar ese copy al estado de espera. |
| C-19 | 2 | mr no distingue segunda/tercera vuelta ni lista rechazos anteriores, aunque el copy promete "el historial de rechazos se conserva" y `rechazos[]` está persistido. | `manual.ts:259-266`, `[paso]/page.tsx:104-113,241`, `flow.ts:142-145` | Contador "corrección N" + `<details>` con rechazos previos. |
| C-20 | 2 | Recaídas §2: prosa duplicada del auto-reporte en m7-m12 y prosa de motor en mr (detalle en sección 3). | `manual-nav.tsx:219-222`, `fase-auto-reporte.tsx:100-103`, `[paso]/page.tsx:108-111,238-242` | Una sola fuente por concepto; recortar a una línea. |
| C-21 | 2 | Importación: el botón cuenta filas que el preview ya sabe inválidas ("Importar 30" que crea 0); CSV Latin-1 crea leads con mojibake sin aviso; homónimos bloqueados solo en import (a mano solo avisa). | `importar-prospectos-form.tsx:154-176,69-76`, `prospecto-bulk.actions.ts:60-99` | Conteo neto en el botón; detectar U+FFFD y avisar "guardalo como CSV UTF-8"; documentar el bloqueo de homónimos en el reporte. |
| C-22 | 2 | Textos sin tope ni clamp: `textoLibre`/`notes` ilimitados; notas del lead sin clamp en la cabecera del manual; rechazo completo sin clamp en la LeadCard; `CopyBlock`/`<pre>`/timeline sin `break-words` (overflow horizontal en mobile con URLs largas). | `contracts.ts:20`, `manual-nav.tsx:84-86,123-127`, `home-sections.tsx:150-171`, `copy-block.tsx:62-71` | `.max()` generoso en schemas + `line-clamp`/`break-words` puntuales. |
| C-23 | 2 | Multi-pestaña fino: `BriefSanity` stale da un error de dirección invertida sin "recargá" ("El brief se captura después de la evaluación" cuando la construcción ya arrancó); `iniciarConstruccion` en 2ª pestaña dice "arranca con el brief guardado" (falso para ese caso); el autosave stale de la ficha no propaga el motivo real. | `dossier.ts:459-460`, `dossier.actions.ts:229`, `autosave-status.tsx:23-29` | Mensajes por caso + propagar el motivo al estado de autosave. |
| C-24 | 2 | "Recuerda por vos" a medias en la conversación: el texto del opener enviado y la nota del toque anterior solo viven en el historial colapsado al pie — no en el slot de contexto de m5/m4 donde se retoma la charla. | `opener-form.tsx:118-143`, `m5-seguimiento.tsx:36-108`, `historial-lead.tsx` | Re-servir "lo último que pasó" (opener + última nota) en el contexto de m5. |
| C-25 | 2 | M5 con POSTERGADO vencido dice "se retoma el {fecha pasada}" sin marcar el vencimiento (el home ya lo trata como vencido); `respondioDesde` usa `lead.updatedAt` como proxy (cualquier edición admin rejuvenece el banner de urgencia). | `m5-seguimiento.tsx:78-82`, `_data.ts:224` | Texto de vencido + derivar de la última activity RESPONDIO. |
| C-26 | 1-2 | Menores agrupados: `error.tsx` propio ausente en `nuevo/` e `importar/` (A-27 vigente); "Parquear" vs "Pausado" para la misma acción; chip ACTIVO emerald en NavAtras vs cyan en NavConstruccion; `<span/>` vacío sin teléfono en m5 vs texto explicativo en m16; placeholders "sin migrar" y `GUIA_CONSTRUCCION`/`GUIA_REVISION`/`GUIA_TRASPASO` muertos; "Te paso tres horarios" hardcodeado con 1-2 slots; `referenciasFicha` muerto; `notasMarca` ausente del BriefResumen; `nombresEnSistema()` trae todos los nombres del sistema por import; comentario de `setter-nav.tsx:38-44` cita una regla de CLAUDE.md que el CLAUDE.md contradice (`triggerTransition` en portal); a11y puntual restante (`role="alert"` en `ficha-form.tsx:249`, `evaluacion-form.tsx:230`, `agenda-form.tsx:218,231,235` — van por fuera de `Field`, siguen huecos post-7.2; radiogroup con `aria-label` redundante). | (citado por ítem) | Ver backlog P3. |

**Lo que salió notablemente bien** (constancia, para no re-auditarlo): los builders de copy-blocks con datos mínimos son sólidos (cero "undefined", secciones condicionales); el escalado stale es imposible tras un re-loop (doble cinturón `ESCALADO_RESET` + guard por stage); los guards optimistas del dossier cubren todos los writes con "recargá"; la importación es robusta (parser real, tope, dedup, reporte por fila); todos los write-paths del manual re-validan server-side (tabla completa del agente 6 — ninguno confía en la UI); los estados loading/error/vacío están casi completos en toda la superficie.

## 5. Propuestas de profundización (Fase 3)

Checklist de guardarraíles (§11) por propuesta — las seis casillas: **[ojo]** no automatiza el ojo · **[Franco]** no debilita su revisión · **[estructura]** resuelve con estructura, no texto · **[gates]** no convierte esperas/auto-reporte en gates · **[motor]** no toca transiciones/aislamiento/gates server-side/schema no-aditivo · **[tenant]** no diseña para tenants externos. Prioridad = impacto-en-autonomía × esfuerzo.

**PR-1 · La conversación a la vista (S) — la más barata con más impacto diario.**
Problema real: al retomar un lead en m5, lo que el setter le dijo (opener) y lo que anotó del último toque están persistidos pero enterrados en el historial colapsado (C-24, evidencia arriba). El setter re-scrollea o re-recuerda — exactamente lo que §3 prohíbe. Profundiza §3. Dirección: bloque "Lo último de la charla" en el contexto de m5 (y el opener en su resumen de m4). Decisión de Franco: no. Checklist: [ojo]✓ [Franco]✓ [estructura]✓ [gates]✓ [motor]✓ (presentación de datos ya persistidos) [tenant]✓.

**PR-2 · El booking que recuerda (M/L) — cierra el hueco más caro del "recuerda por vos".**
Problema real: C-05 — los horarios ofrecidos viven en `useState`; la espera del prospecto (horas/días) destruye el estado; el setter re-busca y el slot elegido pudo desaparecer. Profundiza §3 (atomicidad + memoria). Dirección: persistir los horarios ofrecidos al ofrecerlos (aditivo dentro de `agendaJson`, sin migración de schema) y partir m16 en dos momentos re-entrables ("Ofrecé horarios" / "Confirmá la reunión"), con guardia de salida en el form. Decisión de Franco: sí (diseño de la partición). Checklist: [ojo]✓ [Franco]✓ [estructura]✓ [gates]✓ (la espera se presenta como espera, no gate) [motor]✓ (blob JSON existente, aditivo; `confirmarReunion` intacta) [tenant]✓.

**PR-3 · El cierre estructural de la cadencia (M) — el §5 que quedó a mitad de camino.**
Problema real: C-02 + C-06 + C-11 — el fin de la cadencia hoy es un texto; el dato viciado además convierte el lead muerto en el primer foco del día. Profundiza §4/§5. Dirección: limpiar `nextFollowUpAt` al agotarse; grupo home "se enfría — el cierre lo decide Franco" (visible, no accionable); form de m5 sin "No respondió" cuando agotada; salidas para POSTERGADO-vencido/RECHAZADO. El cierre a PERDIDO **sigue siendo de Franco** (no se automatiza — ver Descartadas). Decisión de Franco: sí (semántica de los grupos destino). Checklist: [ojo]✓ [Franco]✓ (el cierre sigue suyo) [estructura]✓ [gates]✓ (quitar una opción sin sentido no es gate) **[motor]⚠ motor-adyacente**: toca `os-commercial.ts` (write comercial, no transiciones/gates) — test de cadencia primero, FRENAR si asoma más [tenant]✓.

**PR-4 · Los terminales tienen su pantalla (S/M).**
Problema real: C-03 + C-17 — PERDIDO deriva vivo; DESCARTADA se pinta cyan-accionable. Profundiza §3/§5. Dirección: rama temprana por status terminal en `posicionDe` → vista de archivo read-only (qué pasó, motivo, "seguí con el próximo"), tono zinc; guard de status en `registrarResultado`. Decisión de Franco: no (fidelidad al diseño existente del archivo). Checklist: [ojo]✓ [Franco]✓ [estructura]✓ [gates]✓ **[motor]⚠** guard aditivo en una action (endurece, no debilita) [tenant]✓.

**PR-5 · Una sola lengua (M).**
Problema real: C-04 + C-15 — dos sistemas de numeración y doble vocabulario para las mismas piezas; las referencias "(Paso 9)" son irresolubles. Profundiza §1/§2. Dirección: barrido único con los títulos/chips de `PANTALLAS` como diccionario canónico (flow.ts proximaAccion, flow-content arreglos, herramientas.ts, actions, schemas, guidance, bajadas de manual.ts, toasts). Decisión de Franco: no (es corrección de fidelidad, no re-lenguaje). Checklist: todas ✓ (strings puros; los de actions son motor-adyacentes solo en ubicación).

**PR-6 · Memoria de munición usada (S).**
Problema real (supuesto declarado + estructura): el manual no recuerda qué bloque ya copió/pegó el setter para este lead — en re-visitas y re-loops, no sabe si ya le pasó las señales operativas al Gem o ya usó el prompt de mobile (la instrucción de este encargo lo sugiere como ángulo; el código lo confirma posible: `CopyBlock` es stateless). Profundiza §3. Dirección: marcar "copiado para este lead" persistente (aditivo en `progresoJson` o blob hermano) como señal informativa en CopyBlock/prompts — jamás gate. Decisión de Franco: sí (¿vale el ruido visual?). Checklist: [ojo]✓ [Franco]✓ [estructura]✓ [gates]✓ (informativo puro) [motor]✓ (JSON aditivo) [tenant]✓.

**PR-7 · El progreso que se compara (S/M).**
Problema real: "Tu semana" muestra el conteo de 7 días (`progreso.ts`) pero el setter no ve si va mejor o peor que antes — la sensación de progreso del §5/§10 es una foto sin película. Dirección: una línea comparativa derivada ("la semana pasada: N") en `progreso-semana.tsx` — derivación pura de activities, cero campos nuevos. Decisión de Franco: no. Checklist: todas ✓.

**PR-8 · El re-loop con memoria (S).**
Problema real: C-19 — en la tercera vuelta el setter no puede contrastar si el problema es reincidente; el dato (`rechazos[]`) existe. Profundiza §8(b)/§3. Dirección: "Corrección N" + rechazos anteriores colapsables en mr. Decisión de Franco: no. Checklist: todas ✓.

**PR-9 · El alta que perdona (S).**
Problema real: C-21 — el CSV ANSI de Excel es el caso más común en es-AR y hoy crea leads rotos sin aviso; el botón promete importar lo que no va a entrar; los homónimos legítimos no tienen camino documentado. Profundiza §8(a)/§1. Dirección: detectar U+FFFD en preview + conteo neto + línea en el reporte ("¿es otro negocio con el mismo nombre? cargalo a mano"). Decisión de Franco: no. Checklist: todas ✓.

**PR-10 · Errores que no se esfuman ni desorientan (S/M).**
Problema real: C-10 + C-12 + C-13 + C-23 — la familia de errores del server llega como jerga interna o desaparece en un toast; el rebote del gate de envío (la línea inviolable) merece quedarse en pantalla. Profundiza §1/§6 (gates auto-explicados hasta en el error). Dirección: migrar los 2 forms restantes a `useStepAction` con error inline; mapa TransitionError→copy operativo; código de error para el slot ocupado. Decisión de Franco: no. Checklist: [motor]⚠ solo strings/mapeo en actions; el resto ✓.

## 6. Diseño propuesto de la fase PRE (insumo Bloque 8 — decisión de Franco)

El brief §5 la define como la fase cero del manual: **guía de búsqueda e investigación de prospectos, no automatización**. Hoy el manual arranca cuando el lead ya existe (asignado por Franco o alta propia); el "cómo encontrar y elegir a quién cargar" vive fuera de la herramienta. Propuesta de estructura, aplicando la atomicidad del §3 (una tarea mental por pantalla) y el patrón del manual (instrucción → contexto → munición → registro):

| Pantalla | Tarea (una) | Captura | Munición (TIPO de guía — contenido de Franco, §12.1) |
|---|---|---|---|
| **PRE-1 «Elegí el terreno de hoy»** | Decidir rubro+zona donde buscar | El terreno elegido (rubro/zona) — se re-sirve en PRE-2/PRE-3 y pre-llena `industry`/`zone` del alta | Guía de criterio: "dónde pega una demo" — rubros con dolor visible, señales de zona con densidad |
| **PRE-2 «Juntá candidatos»** | Buscar con sus propios ojos (IG/Maps) y anotar una lista corta | Candidatos: nombre + link IG/Maps (repetible, tipo lista) | Guía de búsqueda por canal: queries de ejemplo, checklist de "negocio vivo" (actividad reciente, fotos propias) |
| **PRE-3 «Mirá el negocio de cerca»** | Por candidato: chequear las señales mínimas | Las MISMAS señales que hoy pide la ficha m1 (quién maneja el IG, reseñas, web actual, contenido real) — la ficha nace acá, no se re-tipea | Reuso de la taxonomía de señales de la ficha (`ficha-form`) — cero contenido nuevo |
| **PRE-4 «Decidí: entra o no entra»** | Descarte temprano barato o alta | Si entra → desemboca en el **alta existente** (`nuevo-prospecto-form`) prellenada con PRE-1/2/3; si no entra → el candidato se marca descartado-temprano (no crea lead, no ensucia la cartera) | Guía de criterio de entrada (2-3 preguntas), espejo del "descarte honesto es trabajo bien hecho" |

**Conexiones con lo existente.** (a) La importación CSV es la vía "Franco entrega lista": esos leads ya existen y saltan PRE-1/PRE-2 — PRE-3 les aplica igual como investigación previa a la ficha (el manual del lead podría ofrecer PRE-3 como paso opcional pre-m1 para leads importados sin señales). (b) PRE no gatea nada: el alta directa y la importación siguen funcionando sin pasar por PRE (guardarraíl §11 — nada de esperas/pasos convertidos en requisitos). (c) El foco no cambia: PRE es una superficie de carga, no una cola — entra por el mismo botón "Cargar prospecto" (quizá como "¿No sabés a quién cargar? Empezá por acá").

**La única decisión de motor que PRE exige** (por eso es de Franco): los candidatos de PRE-2/PRE-3 necesitan persistencia propia **antes de ser leads** (hoy no existe la entidad). Camino aditivo puro: tabla nueva `OsCandidato` (o blob JSON por setter) — no toca `OsLead`, ni transiciones, ni aislamiento (mismo patrón `assignedToId` forzado a sesión). Alternativa sin schema: PRE-2/3 capturan directo en el borrador del alta (multi-borrador local) — más pobre (no sobrevive dispositivo) pero cero motor. Ambas opciones quedan para su decisión; la estructura de pantallas de arriba es la misma en ambas.

**Checklist §11 de la propuesta completa:** [ojo]✓ (guías y checklists para mirar con ojos propios — cero scraping/autobúsqueda) [Franco]✓ (sus listas siguen entrando por importación; el criterio de entrada es contenido suyo) [estructura]✓ [gates]✓ (PRE nunca es requisito) [motor]⚠ solo si se elige la tabla aditiva — decisión explícita suya [tenant]✓.

## 7. EL BACKLOG ÚNICO

Consolidación de: hallazgos de esta auditoría (C-xx) + propuestas (PR-x) + pendientes heredados (39-b del smoke-test 7.0 — los no absorbidos por C-xx —, TODOs de `herramientas.ts`, a11y restante, §12.1/12.2, PERDIDO-cerrable-por-setter/A-08, copy del pase perceptual — 7.1 no dejó ninguno). Duplicados fusionados (cada C-xx ya absorbe sus 39-b equivalentes). **Total: 3 P1 · 10 P2 · 17 P3 · 10 DECISIÓN-Franco = 40 ítems.**

### P1 — fichas ejecutables

**B-01 · Los tres loops del foco (C-02 + C-11)**
- Contexto: tres datos viciados hacen que el foco sirva leads muertos como trabajo, indefinidamente y con prioridad por antigüedad. El peor: al agotarse la cadencia no se limpia `nextFollowUpAt`.
- Archivos: `src/lib/os-commercial.ts` (líneas 68-76 el bug central; 78-96 y 162-172 las salidas de POSTERGADO/RECHAZADO), `src/lib/leados/flow.ts:375-378,459-461` (dónde cae el agotado y su CTA), `src/lib/leados/home.ts:46-47`.
- Dirección: en `registrarContactoComercial`, cuando `calculateNextFollowUp` devuelve null → `nextFollowUpAt: null`; decidir con Franco el grupo destino del agotado (propuesta: `seguimiento` con rótulo "se enfría"); dar salida a POSTERGADO-vencido (retomar limpia el status) y a RECHAZADO (encausar a espera/cierre). NO automatizar el cierre a PERDIDO.
- Criterio de éxito: test in-process (patrón `tests/leados/`) que registre 4 SIN_RESPUESTA y verifique `nextFollowUpAt === null` y que `grupoPara` NO lo ponga en `trabajar`; invariantes 16/16 y `test:leados` verdes; la suite `test:setter` intacta.
- Tamaño: M. Modelo: **Opus, esfuerzo alto** — motor-adyacente (write comercial compartido con admin); exige leer `os-commercial.ts` completo antes de tocar y FRENAR si el fix pide tocar una transición.

**B-02 · Los terminales no derivan vivos (C-03 + C-17, PR-4)**
- Contexto: `posicionDe` deriva solo por stage; un lead PERDIDO abre en m5 activo con plantilla de toque; DESCARTADA se pinta cyan "Tu paso ahora".
- Archivos: `src/lib/leados/manual.ts:473-581` (`posicionDe` — agregar rama temprana por status terminal), `manual/_components/pantalla-manual.tsx:134-137` (tono), `setter/_actions/outreach.actions.ts:144-195` (guard de status en `registrarResultado`), `manual/[paso]/page.tsx` (vista archivo read-only).
- Dirección: rama temprana `status PERDIDO/CERRADO → pantalla de archivo` (read-only: qué pasó + motivo + "seguí con el próximo", tono zinc); DESCARTADA pierde el badge cyan (zinc cuando `habilitadas` vacía); `registrarResultado` rebota status terminales con copy operativo.
- Criterio de éxito: caso nuevo en el spec de derivación/invariante (lead PERDIDO → no deriva m5); e2e o SSR-check de que el manual de un PERDIDO no ofrece form de toque; suites verdes.
- Tamaño: M. Modelo: **Opus, esfuerzo medio** — toca la derivación central (pura, con never-guard: el compilador ayuda) y una action.

**B-03 · Una sola lengua (C-04 + C-15, PR-5)**
- Contexto: numeración del wizard muerto y doble vocabulario en copy visible; referencias irresolubles en el elemento más protagonista del home y en los arreglos del chequeo.
- Archivos: `src/lib/leados/flow.ts:420-460` (proximaAccion), `flow-content.ts:135-165,182` (arreglos + glassmorphism), `herramientas.ts:59-98` (dondeSeUsa/queLeDas/queTeDevuelve — también el "caliente" de la línea 61 si B-06 no salió antes), `guidance-content.ts:244,331,402,478,515,581,845` , `manual.ts:158,232,240,248` (bajadas), `setter/_actions/outreach.actions.ts:103,108,117,165,173`, `dossier.actions.ts:382`, `dossier.schemas.ts:71-74`, `m14-chequeo.tsx:57`, `seguimiento-form.tsx:36-37,61,68`, `escalar-modal.tsx:84`, `m16-agenda.tsx:98`, `canal-seguridad.tsx:44`, `ejemplo-ideal.tsx:106`.
- Dirección: diccionario canónico = títulos/chips de `PANTALLAS` (`manual.ts:136-283`): "Paso N" → nombre de pantalla; draft→borrador; self-check→chequeo final; follow-up→toque (label "Toques: N de 3"); hard-block→obligatorio; dossier→(omitir); gate server-side→(reformular); pipeline→panel. SOLO strings — cero lógica; los de actions/schemas se editan con diff mínimo.
- Criterio de éxito: grep final `"Paso [0-9]"` sobre copy visible del setter → 0; grep `draft|self-check|follow-up|pipeline|hard-block` sobre JSX/strings user-facing → 0 (comentarios de código exentos); `tsc` + `test:setter` verdes (los specs asertan por contenido: revisar los que citen strings tocados).
- Tamaño: M (mecánico, muchos archivos). Modelo: **Sonnet, esfuerzo alto** — el riesgo es criterio de "visible vs interno", ya resuelto en la lista de arriba.

### P2 — fichas ejecutables

**B-04 · Cierre estructural de m5 agotada (C-06)** — depende de B-01.
Contexto: con cadencia agotada el form sigue ofreciendo "No respondió"; contador puede decir "4 de 3". Archivos: `manual/_components/seguimiento-form.tsx:33-55` (opciones), `m5-seguimiento.tsx:73-77,141-147`. Dirección: pasar `cadenciaAgotada` como prop; filtrar SIN_RESPUESTA de las opciones (quedan Respondió/Postergar/Rechazó) con una línea de motivo; `Math.min` en el contador. Éxito: render con agotada no ofrece la opción; server ya la rebotaría igual tras B-01 (o agregar guard). Tamaño: S. Modelo: Sonnet medio.

**B-05 · Booking en dos momentos con memoria (C-05, PR-2)** — tras decisión de Franco.
Contexto: los horarios ofrecidos no se persisten; la espera del prospecto destruye el estado; notas de traspaso sin guardia; único irreversible sin confirmación. Archivos: `manual/_components/agenda-form.tsx`, `m16-agenda.tsx`, `setter/_actions/agenda.actions.ts:108-135` (`ofrecerHorarios`), blob `agendaJson` (`contracts.ts` AgendaSchema — extensión aditiva). Dirección: persistir slots ofrecidos al ofrecer (estado `OFRECIDOS` dentro del blob); m16 re-entra mostrando "los 3 que ofreciste" + re-buscar; `useUnsavedGuard`; confirmación liviana pre-`confirmarReunion`. Éxito: cerrar pestaña tras ofrecer y reabrir muestra los mismos horarios; `confirmarReunion` y su claim intactos (test existente verde). Tamaño: L. Modelo: **Opus alto** — toca action de agenda (aditivo) y contrato de blob.

**B-06 · Caliente residual (C-07)**
Contexto: "caliente" como veredicto visible en M2/M3 vía ToolGuide; Flame+ámbar compartidos; hints base como mina. Archivos: `herramientas.ts:61`, `evaluacion-form.tsx:306-313`, `guidance-content.ts:347,351,374`. Dirección: `queTeDevuelve` → "descartar / avanzar / avanzar con prioridad"; veredicto alto con ícono/tono propios (violeta/Star — NO Flame/ámbar); hints base alineados a "sugiere prioridad". Éxito: grep -i "caliente" sobre superficie del setter → solo el badge de Franco y su guardrail. Tamaño: S. Modelo: Sonnet bajo.

**B-07 · Tilde deshabilitado-con-motivo (C-08)**
Contexto: el tilde de fase se ofrece en BRIEF/RECHAZADA y el server lo rebota. Archivos: `manual/_components/m-construccion.tsx:127-142`, `fase-auto-reporte.tsx` (recibir `puedeGuardar`+motivo), `manual/_data.ts` (stage ya viaja). Dirección: `disabled` con motivo ("primero Arrancá/Reabrí la construcción — el CTA está arriba") cuando stage ≠ CONSTRUCCION; el server-guard queda como está. Éxito: en BRIEF el tilde no dispara la action; e2e B5 intacto. Tamaño: S. Modelo: Sonnet bajo.

**B-08 · Errores persistentes y en criollo (C-10 + C-12 + C-13 + C-23, PR-10)**
Contexto: TransitionError crudo al toast; ChequeoForm/EnvioForm solo toast; reset de slots por substring en doble fuente; mensajes multi-tab desorientadores. Archivos: `setter/_actions/dossier.actions.ts:66-68,229`, `outreach.actions.ts:50-52`, `manual/_components/chequeo-form.tsx`, `envio-form.tsx`, `agenda-form.tsx:92`, `agenda.actions.ts:177`, `src/lib/integrations/cal-com-v2.ts:194`, `src/lib/leados/dossier.ts:459-460` (solo leer — el mensaje se mapea en la action, NO se toca dossier.ts), `use-step-action.ts`. Dirección: mapa `TransitionError.message → copy operativo` en las actions; migrar chequeo/envío a `useStepAction` con `onError` inline (patrón `borrador-form.tsx:38-42`); código de error `SLOT_OCUPADO` compartido. Éxito: rebote de `enviarARevision` deja mensaje visible fijo; grep "Transición ilegal" no alcanza al cliente; suites verdes. Tamaño: M. Modelo: **Opus medio** — roza actions y la línea de envío (solo presentación del error, gates intactos).

**B-09 · Guardias de salida faltantes (C-16)**
Contexto: opener (texto largo) y seguimiento (nota) se pierden al cerrar la pestaña; agenda la cubre B-05. Archivos: `_components/opener-form.tsx`, `manual/_components/seguimiento-form.tsx`; patrón: `evaluacion-form.tsx:94-96` (`useUnsavedGuard` derivado del estado, sin autosave). Dirección: `useUnsavedGuard(texto.length > 0 && !enviado)`. Éxito: `beforeunload` sintético con texto → `defaultPrevented`; sin texto → no. Tamaño: S. Modelo: Sonnet bajo.

**B-10 · La conversación a la vista (C-24, PR-1)**
Contexto: opener enviado y última nota solo en historial colapsado. Archivos: `manual/_data.ts` (exponer última activity con nota + el texto del opener — ya viajan en `listOwnedLeadActivities`), `manual/_components/m5-seguimiento.tsx` (slot contexto), `_components/opener-form.tsx:118-143` (`OpenerResumen`). Dirección: bloque "Lo último de la charla" (fecha + resultado + nota del último toque; el opener textual en su resumen). Solo lectura de datos ya cargados. Éxito: render de m5 con actividades muestra la última nota sin abrir el historial. Tamaño: S. Modelo: Sonnet medio.

**B-11 · El re-loop con memoria (C-19, PR-8)**
Contexto: mr no distingue vuelta N ni muestra rechazos previos; `rechazos[]` persistido (`flow.ts:142-145`). Archivos: `manual/[paso]/page.tsx:104-113`, `manual/_data.ts` (exponer `rechazos` completo), `_components/guia-retrabajo.tsx` (o hermano). Dirección: "Corrección N°{n}" en el encabezado de mr + `<details>` "correcciones anteriores". Éxito: fixture con 2 rechazos muestra contador y el anterior colapsado. Tamaño: S. Modelo: Sonnet bajo.

**B-12 · m15 como consulta en la espera (C-18)**
Contexto: la rama con los 3 motivos específicos de espera de m15 es inalcanzable; el setter ve la espera genérica. Archivos: `src/lib/leados/manual.ts:565-573` (posicionDe rama APROBADA), `m15-envio.tsx:104-128`. Dirección: en APROBADA-gate-cerrado, sumar `m15` a `habilitadas` (consulta) — la rama ya existe y nombra la causa real; o mover ese copy al estado espera. Éxito: lead APROBADA sin respuesta puede abrir m15 y leer "aprobada — falta que responda"; el envío sigue imposible (gate server intacto). Tamaño: S. Modelo: Sonnet medio (toca derivación — correr invariantes).

**B-13 · a11y puntual restante**
Contexto: post-7.2 (Field resuelto), quedan los `<p>` de error por FUERA de Field. Archivos: `_components/ficha-form.tsx:249`, `evaluacion-form.tsx:230` (serverError), `manual/_components/agenda-form.tsx:218,231,235`; radiogroup `evaluacion-form.tsx:161` (aria-labelledby). Dirección: `role="alert"` en los 5 puntos (precedente: `opener-form.tsx`); el radiogroup asociado al label de Field. Éxito: grep de los 5 puntos con role; eslint jsx-a11y verde. Tamaño: S. Modelo: Sonnet bajo.

### P3 — una línea (contexto + origen)

1. Prosa duplicada del auto-reporte (m7-m12) y prosa de motor en mr → una fuente por concepto (C-20, §2).
2. Import: aviso mojibake U+FFFD + botón con conteo neto + línea de homónimos en el reporte (C-21, PR-9).
3. Clamps y topes: `.max()` en `textoLibre`/`notes`, `line-clamp` en cabecera/LeadCard-rechazo, `break-words` en CopyBlock/pre/timeline (C-22).
4. Cartera "mostrar más" + `take` en timeline — umbral cartera >100 (C-14/A-31).
5. M5 postergado-vencido: texto de vencido; `respondioDesde` desde la activity real, no `updatedAt` (C-25).
6. `error.tsx` propio en `nuevo/` e `importar/` con copy de alta (C-26/A-27).
7. "Parquear" vs "Pausado" — un solo verbo (C-26).
8. Chip ACTIVO emerald en NavAtras → cyan (consistencia B9) (C-26).
9. `<span/>` vacío sin teléfono en m5 → texto de m16 (C-26).
10. Retirar placeholders "sin migrar" de `Zona()` + los `GUIA_CONSTRUCCION/REVISION/TRASPASO` muertos (o cablearlos conscientemente) (C-26).
11. "Te paso tres horarios" → pluralizar según slots (C-26).
12. `referenciasFicha`: retirar del contrato o cablear; `notasMarca` en BriefResumen; `otros` → decidir si entra al bloque de Construcción (R-4/R-5, decisión de contenido chica).
13. Microcopy del badge "Disponible" + del caso m5 "completada y actual a la vez" (lente novato).
14. "Vio el video" (`STATUS_LABELS`) → label que el flujo actual produzca (lente novato).
15. "Entra frío, en ficha" → definir o reformular en alta/import (lente novato).
16. `nombresEnSistema()` — dedup sin traer todos los nombres (deuda anotada en el propio código).
17. Higiene: comentario de `setter-nav.tsx:38-44` vs CLAUDE.md (`triggerTransition` en portal — alinear una de las dos puntas); `eslint` key deprecada en `next.config.ts`; `"type":"module"`; naming histórico `StepAnchorId`/`paso.ts`.

### DECISIÓN-Franco (una línea + origen)

1. **Cargar las 4 URLs de herramientas** (`herramientas.ts`) — C-01/§12.3; destraba la ejecutabilidad real de ~11 pantallas. **La decisión más urgente del backlog.**
2. Cierre de cadencia: ¿PERDIDO cerrable por el setter, o solo "se enfría" y Franco cierra? (A-08 de apertura; B-01 implementa "se enfría" sin cerrar).
3. ¿Demo-first estricto? — puerta temprana a m16 con RESPONDIO (C-09): ajustar copy de m5 o abrir la derivación.
4. Diseño de la partición del booking (B-05/PR-2) — dos momentos + persistencia de ofrecidos.
5. Fase PRE (sección 6): ¿va? ¿con tabla aditiva `OsCandidato` o sin schema? — insumo del Bloque 8.
6. Prompts nuevos (§12.1): "QA de links/CTA" (candidato ya anotado en `prompts-disenio.ts:119-129`), prompts de fases estructura/personalización — contenido curado suyo.
7. Memoria de munición usada (PR-6): ¿vale el ruido visual?
8. `NavConstruccion` en la reentrada mr: ¿intencional? (39-b §6; si sí, documentar; si no, condicionar) — y ¿`EscalamientoConstruccion` también en mr? (39-b).
9. Badge "Guía preliminar — en validación" (`badge-provisorio.tsx`): ¿sigue vigente o vestigial? (39-b).
10. Pantallas de construcción bajo el fold en mobile: el "reestructurar" descartado en 7.1 — lever suyo; y `Select` → `combobox` para `aria-invalid` real (7.2).

### Orden de ataque sugerido (dependencias explícitas)

```
0. DECISIÓN-Franco #1 (URLs) ──────────── destraba C-01 sin código; puede ir HOY
1. B-03 Una sola lengua ───────────────── sin dependencias; máxima señal/esfuerzo (Sonnet)
2. B-01 Los tres loops del foco ───────── sin dependencias; motor-adyacente (Opus) 
3. B-04 m5 agotada ────────────────────── DEPENDE de B-01 (el dato limpio da sentido a la UI)
4. B-02 Terminales no derivan vivos ───── conviene tras B-01 (misma zona de flow/manual)
5. B-06 + B-07 + B-09 + B-13 ──────────── batch chico independiente (Sonnet, 1 sprint)
6. B-08 Errores persistentes ──────────── independiente; conviene antes de B-05 (comparte agenda-form)
7. B-10 + B-11 + B-12 ─────────────────── batch de re-servido/consulta (Sonnet-Opus, 1-2 sprints)
8. B-05 Booking con memoria ───────────── tras DECISIÓN #4; el más grande (Opus)
9. P3 en batches oportunistas ─────────── cuando se pise cada zona
10. PRE (Bloque 8) ────────────────────── tras DECISIÓN #5; diseño ya propuesto en sección 6
```

## 8. Descartadas por guardarraíl

- **Auto-cerrar a PERDIDO al agotarse la cadencia** — automatiza una decisión que el brief reserva a Franco (§11/§12); B-01 implementa "se enfría" sin cerrar. Reabrirlo es solo de Franco.
- **Marcar caliente automático con score 4-5** — automatiza el ojo y debilita el flag operativo de Franco; el motor ya lo rechaza por diseño (el score solo notifica).
- **Chequeo final asistido (lighthouse/screenshot-diff que pre-tilde checks)** — automatiza el ojo y convierte el auto-reporte en verificación mecánica; el valor del chequeo es que el setter MIRE.
- **Bloquear el registro de un toque antes de la fecha del próximo** — convierte una espera en gate; la cadencia es guía, no candado.
- **Embeber el Evaluador/Gems como API dentro del panel** (en vez de links a herramientas externas) — automatiza el ojo (el setter dejaría de operar la IA él mismo, que es la habilidad que la herramienta enseña) y rediseña una decisión de arquitectura de Franco (§12.3). Si algún día se reabre, es suya.

## 9. Límites de esta auditoría

- **La vara es reconstruida.** El brief v2.1 no existe como archivo en el repo (grep global; ya constatado por 7.0/7.3). Fuentes: la auditoría de apertura (raíz), la instrucción del encargo y la bitácora. Si el brief real difiere en algún punto fino de esta reconstrucción, los veredictos por sección deben releerse contra él. **Confirmar con Franco dónde vive el archivo.**
- **Estático puro.** No se ejecutó nada: los hallazgos de runtime (overflow con textos largos, mojibake, multi-pestaña) están marcados VERIFICADO (en código) o INFERIDO en la sección 4; ninguno se reprodujo en browser. El pase de píxeles humano sigue siendo de Franco.
- **Volumen real desconocido.** El impacto de C-14 (cartera) y de los caps depende de datos de producción que no se miraron (regla: no DB).
- **Proceso.** Los 6 subagentes de lectura fueron interrumpidos a mitad de corrida por el límite de sesión de la API (22:00) y reanudados con su contexto intacto; los 6 entregaron completos. Uno reportó que el clasificador de seguridad no estuvo disponible en su corrida — su output se usó igual tras contraste con los otros cinco (solapamientos consistentes: C-01, C-04, C-12 aparecen en ≥2 reportes independientes).
- **Nada se ejecutó del backlog.** Todo queda para triage de Franco; las fichas son insumo, no compromiso.

## Anexo — prueba de inocuidad (git)

El árbol ya estaba sucio al inicio por trabajo ajeno a esta auditoría (lane motor-whatsapp/chatbot). Baseline al arranque:

```
 M logic-core-v3/docs/bitacora-roadmap.md
 M logic-core-v3/eslint.config.mjs
 M logic-core-v3/package.json
 M logic-core-v3/prisma/schema.prisma
 M logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts
 M logic-core-v3/src/modules/chatbot/server/llm/index.ts
 M logic-core-v3/tests/integration/.last-run.json
?? logic-core-v3/docs/audit-repo-20260707.md
?? logic-core-v3/docs/consolidacion-planoA-runtime.md
?? logic-core-v3/docs/microaudit-frozen-frontera-CO.md
?? logic-core-v3/docs/motor-whatsapp/
?? logic-core-v3/prisma/migrations/20260707044711_motor_whatsapp_b0_schema/
?? logic-core-v3/src/lib/isolation/
?? logic-core-v3/src/modules/chatbot/server/llm/__tests__/
?? logic-core-v3/src/modules/motor/
?? logic-core-v3/tests/integration/motor-isolation.spec.ts
```

**Status final (output real de `git status --porcelain` tras las dos escrituras):**

```
 M logic-core-v3/docs/bitacora-beta-3.md
 M logic-core-v3/docs/bitacora-roadmap.md
 M logic-core-v3/eslint.config.mjs
 M logic-core-v3/package.json
 M logic-core-v3/prisma/schema.prisma
 M logic-core-v3/src/app/api/chatbot/[slug]/chat/route.ts
 M logic-core-v3/src/app/api/cron/generate-insights/route.ts
 M logic-core-v3/src/lib/security/validate-origin.ts
 M logic-core-v3/src/modules/chatbot/server/admin/updateLeadStatus.ts
 M logic-core-v3/src/modules/chatbot/server/chat/handleChatRequest.ts
 M logic-core-v3/src/modules/chatbot/server/config/getPublicConfig.ts
 M logic-core-v3/src/modules/chatbot/server/conversation/resolver.ts
 M logic-core-v3/src/modules/chatbot/server/health/checkHealth.ts
 M logic-core-v3/src/modules/chatbot/server/insights/generateInsights.ts
 M logic-core-v3/src/modules/chatbot/server/insights/manageInsight.ts
 M logic-core-v3/src/modules/chatbot/server/insights/queries.ts
 M logic-core-v3/src/modules/chatbot/server/llm/index.ts
 M logic-core-v3/src/modules/chatbot/server/logging/persistentLogger.ts
 M logic-core-v3/src/modules/chatbot/server/quota/checker.ts
 M logic-core-v3/src/modules/chatbot/server/quota/upsellAlert.ts
 M logic-core-v3/src/modules/chatbot/server/tools/captureLead.ts
 M logic-core-v3/src/modules/chatbot/server/tools/showWhatsappHandoff.ts
 M logic-core-v3/tests/integration/.last-run.json
?? logic-core-v3/docs/audit-repo-20260707.md
?? logic-core-v3/docs/auditorias/AUDITORIA-CIERRE-2026-07.md
?? logic-core-v3/docs/consolidacion-planoA-runtime.md
?? logic-core-v3/docs/microaudit-frozen-frontera-CO.md
?? logic-core-v3/docs/motor-whatsapp/
?? logic-core-v3/prisma/migrations/20260707044711_motor_whatsapp_b0_schema/
?? logic-core-v3/src/lib/isolation/
?? logic-core-v3/src/modules/chatbot/server/llm/__tests__/
?? logic-core-v3/src/modules/chatbot/server/llm/resolveEffectiveModel.ts
?? logic-core-v3/src/modules/motor/
?? logic-core-v3/tests/integration/motor-isolation.spec.ts
```

**Delta de esta auditoría: exactamente las dos escrituras** — `?? docs/auditorias/AUDITORIA-CIERRE-2026-07.md` (nuevo) y `M docs/bitacora-beta-3.md` (append; no figuraba M en el baseline). Todo el resto del churn entre baseline y cierre (`src/modules/chatbot/**`, `src/app/api/**`, `src/lib/security/validate-origin.ts`, `bitacora-roadmap.md`) es de OTRA sesión trabajando en paralelo el lane motor-whatsapp/chatbot — cero solapamiento con archivos del setter/leados/manual, ninguno tocado por esta auditoría.

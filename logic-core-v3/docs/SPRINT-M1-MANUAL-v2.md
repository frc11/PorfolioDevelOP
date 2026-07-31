# SPRINT M1 v2 — EL MANUAL DEL SETTER, SOBRE EL PRODUCTO PODADO
### Y, en la misma pasada, la validación de la poda

> **Qué cambió respecto de la primera corrida.** La primera vez el manual sirvió para dos cosas: documentar y auditar. Encontró 18 fricciones que ni tres auditorías estáticas ni 60 tests en verde habían visto. Esta vez suma una tercera función: **validar la poda**. Ahora existe una ley escrita (el brief v3) contra la cual comparar, y una lista de fricciones anteriores para verificar si de verdad se fueron.
>
> **Cuándo se corre.** Después de que la poda cierre y **antes** del dogfooding. El orden es deliberado: escribir el manual obliga a recorrer todo el producto y encuentra lo que quedó a medias — más barato descubrirlo acá que en la primera demo real.
>
> **Precondiciones:** poda cerrada · accesos de las herramientas cargados (si no, el manual va a tener que escribir varias veces que un botón no lleva a ningún lado — corre igual, pero avisado) · galería regenerada sobre el terreno final.

## CORRÉLO ASÍ — no se pega

- **Modelo:** **Fable** · **ultracode** · esfuerzo alto. Califica bajo la regla de gasto: multi-frente real, exhaustivo, y el error es caro — un manual que miente es peor que ninguno.
- **Autónoma:** sesión entera, no pregunta nada. Commitea capítulo a capítulo.
- **Qué revisás después:** el manual entero (sos el primer lector humano), `HALLAZGOS-MANUAL-v2.md`, y **el veredicto de la poda**.

────────────────────────── CORTAR ACÁ — lo de abajo se pega entero ──────────────────────────

Sos el agente ejecutor de develOP en `logic-core-v3`. Corrida M1 v2: **escribir el manual de usuario del Panel del Setter**, desde la observación, para un setter no técnico que arranca de cero — y, con el mismo trabajo, **verificar que la poda cumplió lo que el brief v3 dice**.

**Corrida autónoma y larga.** Franco no está mirando. No preguntes nada; ante lo dudoso, anotá y seguí. **NO TOQUES código de producción, tests ni configuración** — tu diff son documentos en `docs/manual-usuario/` y la bitácora al final. Si ves un bug, va al registro de hallazgos, no a un fix.

## LA REGLA DE ORO — se escribe lo que se vio

Cada afirmación del manual sale de una de estas tres fuentes, en este orden de preferencia:

1. **Lo que hiciste vos** en la aplicación viva (Playwright interactivo sobre el servidor de QA, con los leads sembrados de la galería — las recetas están en su índice).
2. **Lo que muestra un screenshot** de la galería.
3. **El copy literal** que el código renderiza — solo para citar textualmente lo que la pantalla dice, **nunca** para describir comportamiento que no viste.

**Lo que no entra en ninguna de las tres, no se escribe.** Si un tramo no se pudo ver, el manual dice "esta parte no está documentada todavía" y el registro de hallazgos explica por qué. Está **prohibido** completar por inferencia del código: un manual inferido es documentación técnica disfrazada, y no valida nada.

## LO QUE APRENDIÓ LA PRIMERA CORRIDA — no lo redescubras

Cinco cosas que costaron tiempo la vez pasada:

1. **`fullPage` no captura la pantalla completa en este portal.** El layout no scrollea el documento: scrollea un contenedor interno, y el documento mide siempre el alto de la ventana. Cualquier captura que confíe en `fullPage` está mirando solo el primer scroll. La galería ya lo tiene resuelto — usá su mecanismo, no inventes uno.
2. **Regenerá la galería antes de escribir.** La vez pasada estaba capturada sobre un commit anterior a un sprint que cambió copy, y el manual habría citado texto que la aplicación ya no dice.
3. **Volcar controles por nombre accesible se saltea los que no lo tienen.** La primera corrida concluyó que un control no existía; existía, pero sin nombre accesible. **Si un control "no aparece", inspeccioná el DOM antes de afirmar que no está** — y si de verdad no tiene nombre accesible, eso es un hallazgo.
4. **No dispares acciones que salen hacia afuera.** Confirmar una reunión crea un evento en el calendario real de Franco y le manda un correo a un prospecto. Se documenta el formulario, no se aprieta el botón.
5. **Algunos estados no se pueden sembrar, solo provocar** — los errores viven durante la vuelta de un envío rechazado. Se alcanzan desde la interfaz.

## FASE 0 — TERRENO (no frena, informa)

1. `git status --porcelain` (WIP ajeno: no tocar) · `git log --oneline -12`. Anotá qué commits de la poda están presentes.
2. Regenerá la galería. Levantá el servidor de QA.
3. **Estado de las herramientas externas:** ¿los accesos están cargados o siguen pendientes? Define cómo escribís cada pantalla que las usa, y es la primera entrada del registro si faltan.
4. **Leé el brief v3 entero** — es la vara de la Parte B.

## LA VOZ — para quién y cómo

1. **Le hablás al setter, de vos**, en castellano rioplatense llano. Es una persona no técnica que vende: sabe hablar con gente, no sabe qué es un gate ni le importa. **Cero jerga técnica, cero nombres internos** (nada de códigos de pantalla, estados del motor, blobs, propiedades). El vocabulario es el del glosario del brief v3 §5.
2. **Orientado a momento, no a feature.** Los capítulos se llaman como los momentos del trabajo, no como los componentes.
3. **Honesto sobre las esperas.** Hay tramos donde **no es su turno** — Franco aprueba o rechaza, el negocio responde o no. El manual jamás promete "hacé X y llegás a Y" cuando en el medio hay un tercero: dice "acá esperás, a quién, y esto es lo que podés mirar mientras". Esa honestidad es la diferencia entre un manual y un folleto.
4. **Honesto sobre lo que falta.** Si una herramienta no tiene acceso cargado, lo dice sin vueltas y el registro lo anota **una** vez con la lista de pantallas afectadas. No se finge un flujo que no existe.
5. **Explica las rarezas por diseño, sin defensiva.** Una línea, en su lugar, y listo.

## PARTE A — EL MANUAL

Salida en `docs/manual-usuario/`, un archivo por capítulo, con índice al frente. **La estructura de capítulos la derivás del recorrido que exista después de la poda** — no de la lista de la corrida anterior, que documenta el producto viejo. Guía: el brief v3 §7 define las seis etapas; los capítulos siguen esas etapas y sus variaciones.

**Plantilla fija por pantalla o estado** — es la disciplina que hace al manual profundo sin volverlo un pantano:

> **Cuándo estás acá** (qué pasó antes) · **Qué estás viendo** (screenshot + qué es cada cosa) · **Qué hacés, paso a paso** (imperativo, un paso por línea) · **Qué puede salir mal** (los errores reales que viste y qué hacer) · **Cuándo NO es tu turno** (si aplica: qué esperás y de quién).

**Cobertura obligatoria de lo nuevo.** Si la poda agregó pantallas —la librería, derivar a Franco, la pantalla de construcción unificada—, van documentadas con el mismo nivel que el resto. Lo nuevo es lo que menos probado está.

**La munición se explica, no se transcribe.** Los prompts que el setter copia son largos: el manual dice **para qué sirve cada uno, cuándo se usa y qué tiene que ver después de pegarlo**, no los reproduce enteros.

## PARTE B — LA VALIDACIÓN DE LA PODA

Esto es nuevo respecto de la primera corrida. Va en `docs/manual-usuario/VALIDACION-PODA.md`.

### B.1 · El brief contra la realidad

Recorré el **§9 del brief v3** (el inventario con la columna "destino") y verificá **una por una**:

| Para cada pantalla o estado | Verificá |
|---|---|
| Las que dicen **"se elimina"** | ¿Desaparecieron de verdad, o quedaron alcanzables por navegación? |
| Las que dicen **"se funde en X"** | ¿La función vive en X, o se perdió en el camino? |
| Las que dicen **"queda"** | ¿Siguen funcionando igual? |
| Las que dicen **"es nueva"** | ¿Existen y se pueden usar? |

**Cada desvío es un hallazgo**, con su fila del §9 citada.

### B.2 · Los 18 hallazgos anteriores

Leé `HALLAZGOS-MANUAL.md` (la corrida anterior) y el **§10 del brief** (su recalibración). Para cada uno: **¿sigue vivo, se resolvió, o desapareció con la poda?** Verificalo **en la aplicación**, no en el código.

Prestá atención especial a estos cuatro, que el brief marca como los que sobreviven y más importan:

- **Los tildes del chequeo que se pierden si el setter sale sin guardar.** Es el más grave: descarta trabajo real. Probalo en vivo.
- **"Se guarda solo" al lado de un botón de guardar**, en la primera pantalla — la otra mitad del anterior.
- **Dos esperas con causas opuestas y el mismo texto.**
- **El historial de correcciones que se promete y no se muestra.**

### B.3 · El checklist de estética

El **§12 del brief** define cinco criterios de rechazo de una demo. **¿Están en la herramienta, en el chequeo?** Si no están, es el hallazgo más importante de la corrida: sin eso, la revisión de Franco no se puede delegar nunca.

### B.4 · Los principios de diseño

El **§17 del brief** lista ocho principios destilados de los hallazgos anteriores (toda acción da acuse donde se hizo el clic; ningún formulario pierde trabajo en silencio; la pantalla no promete lo que no muestra; dos situaciones distintas no muestran el mismo texto; nada habla en jerga de sistema; un control que el servidor va a rechazar no se ofrece; una sola forma de tildar; todo control tiene nombre accesible).

**Recorré el producto buscando violaciones de cada uno.** No hace falta ser exhaustivo: tres ejemplos por principio alcanzan para saber si se cumple o no.

## PARTE C — EL REGISTRO DE HALLAZGOS

`docs/manual-usuario/HALLAZGOS-MANUAL-v2.md`. Misma regla que la vez pasada, y es la que hace que funcione: **cada vez que escribir la instrucción honesta te resulte incómodo, eso es un hallazgo.**

> **H-NN · título** · Dónde (pantalla + screenshot) · Qué lo hace fricción (en términos del setter, no del código) · Severidad percibida (**me frena** / **me confunde** / **me hace ruido**) · **La frase del manual que lo delató** · Si es nuevo o venía de la corrida anterior.

**No busques hallazgos activamente ni audites código.** Escribí el manual con honestidad y aparecen solos. Ese es el mecanismo, y es la razón de que esta corrida encuentre lo que las auditorías estáticas no.

## ORDEN DE TRABAJO Y COMMITS

1. Índice y primer capítulo (commit).
2. Los capítulos en orden, **uno por commit**, actualizando el archivo de progreso en cada uno.
3. El registro de hallazgos se escribe en paralelo y se commitea con cada capítulo que lo alimente.
4. **La Parte B al final**, cuando ya recorriste todo — vas a tener el producto entero en la cabeza.
5. Cierre: pasada de coherencia (vocabulario uniforme, referencias cruzadas), bitácora, commit final.

Para cada capítulo, **antes** de escribir: mirá los screenshots del tramo y **navegá en vivo al menos el camino feliz**. Los pasos que escribas tienen que ser los que ejecutaste, con los nombres exactos de los botones que tocaste.

## CIERRE

1. `git diff --stat` de toda la corrida: **solo `docs/manual-usuario/**` y la bitácora.** Cero código, cero tests, cero configuración — verificalo con el comando antes del último commit y pegá el baseline y el estado final.
2. Todos los capítulos + índice + hallazgos + validación de la poda existen, y cada capítulo cita sus screenshots.

## REPORTE FINAL

(1) Capítulos completados. (2) **El veredicto de la poda: qué del §9 se cumplió y qué no**, con las filas que fallaron. (3) **De los 18 hallazgos anteriores: cuántos vivos, cuántos resueltos, cuántos desaparecidos** — y si los cuatro graves siguen. (4) Hallazgos nuevos, y los cinco más severos con su frase delatora. (5) ¿El checklist de estética está en la herramienta? (6) Violaciones de los ocho principios. (7) Tramos no documentados y por qué. (8) Estado de los accesos externos. (9) Qué navegaste en vivo vs. qué escribiste solo de screenshot. (10) Prueba de inocuidad. (11) **Qué le falta al manual que solo Franco puede agregar** (contexto comercial, tono con los clientes, munición curada).

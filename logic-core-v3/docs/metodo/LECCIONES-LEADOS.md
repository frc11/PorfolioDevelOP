# LECCIONES DE LA REMEDIACIÓN DE LeadOS

> **Qué es este documento.** El método real de develOP destilado de lo que **efectivamente pasó**
> cuando se ejecutó — no de lo que el método dice de sí mismo. Fuente: `docs/bitacora-beta-3.md`
> (1.748 líneas, sprints 3.1/2026-06-29 → 6.2/2026-07-23), el `git log` del período de remediación
> (`62994be`..`6a88cbe`) más los dos forenses previos, `docs/auditorias/AUDITORIA-CIERRE-2026-07.md`,
> `CLAUDE.md`, los 17 invariantes de `check:invariants` y los comentarios de decisión del código.
>
> **Regla de admisión.** Sin evidencia no entra. Cada lección cita commit, `archivo:línea` o línea de
> bitácora. Donde la evidencia es parcial, se dice explícitamente qué falta (L-03, L-08).
>
> **Cómo leerla.** Cada lección: **qué pasó** (con evidencia) → **qué costó** → **la regla**.
> Las reglas están redactadas para insertarse en el método; la propuesta de dónde va cada una está en
> [`PROPUESTA-CIMIENTO.md`](PROPUESTA-CIMIENTO.md).

---

## Índice

**§1 — Terreno y concurrencia** · L-01 worktree · L-02 el fix que no se commitea no existe · L-03 exit codes
**§2 — Verificación honesta** · L-04 falso rojo del build viejo · L-05 el autorreporte no cierra · L-06 verde ≠ verificado · L-07 el proxy declarado
**§3 — Cobertura y riesgo** · L-08 caracterización antes del guard · L-09 la suite mide lo que cubre · L-10 el invariante es la única verificación que no se evapora
**§4 — Efectos de segundo orden** · L-11 arreglar una trampa fabrica otra · L-12 el pedido literal puede ser la regresión · L-13 el nombre sobrevive al retiro
**§5 — Higiene y economía** · L-14 el ruido recurrente es una tarea de una línea · L-15 la fixture compartida contamina · L-16 el flake se diagnostica, no se re-corre
**§6 — El código como fuente** · L-17 el comentario de decisión es la fuente · L-18 las dos puntas de una regla
**§7 — Scope y cierre** · L-19 lo fuera de scope se nombra con archivo:línea · L-20 el límite declarado vale más que la conclusión
**§8 — Decisiones tomadas dos veces** (siete casos) · **§9 — Semillas que el repo corrigió**

---

# §1 — Terreno y concurrencia

## L-01 · La unidad de aislamiento es el worktree, no el archivo

**Qué pasó.** Durante todo el proyecto corrieron sesiones en paralelo sobre **el mismo checkout**,
repartiéndose el trabajo por archivos disjuntos. El reparto por archivos funcionó para no pisarse
*escribiendo*; no funcionó para *commitear*, porque el índice de git es uno solo por checkout:

- **Sprint 3.2** (bitácora:806) tuvo que commitear "por pathspec literal para no arrastrar su índice"
  y diferir `build`+`test:setter` hasta que el `next start` de la otra sesión terminara, "para no
  pisarle `.next` en caliente".
- **Sprint 4.1** (bitácora:784) detectó la colisión *durante la verificación final*: mtimes 04:08–04:11
  de archivos de otra sesión (`src/lib/leados/paso.ts`, A-29) que su propia Fase 0 no había visto.
- **Sprint 1.1** (bitácora:1240) reporta el síntoma más caro de todos: «el `npx tsc --noEmit` global
  **pasó de verde (Fase 0) a rojo-en-motor durante la sesión**» — otra sesión escribiendo `src/modules/motor/**`.
  La línea base se evaporó a mitad de sprint.
- **Sprint 7.2** (bitácora:1161) directamente **no pudo correr `build` ni `test:setter`**: el `dev:qa`
  de otro chat tenía el `.next` compartido abierto y en Windows `next build` lo bloquea o corrompe.
  Cerró "verde (estático)" y dejó la verificación en browser para otro sprint.

**El contraejemplo que prueba la regla.** El **Sprint T** (bitácora:1281) sí lo hizo bien: el worktree
principal estaba en `b2-s1-bot-sync-surface` con WIP ajeno mutándose en vivo, así que se ejecutó en un
**worktree aislado sobre `main`** (`C:/tmp/wt-sprint-t`, `node_modules` por junction) y el commit
`d0e8ef4` aterrizó limpio en `main` sin tocar el WIP de la otra sesión.

**Qué costó.** Un sprint sin verificación de browser (7.2), un sprint con la línea base perdida a mitad
de camino (1.1), builds diferidos por espera de puerto (3.2), y una colisión de lane descubierta recién
en la verificación final (4.1).

**Regla.** Una sesión = un worktree. Si dos sesiones tienen que correr a la vez, la segunda abre
worktree propio antes de escribir la primera línea. **La exclusividad de commit es de quien tiene la
rama chequeada**: el resto commitea por pathspec explícito o no commitea. El `.next` y el puerto del
dev server son recursos exclusivos del worktree, igual que el índice.

---

## L-02 · Un fix que vive solo en el working tree no es un fix

**Qué pasó.** Dos veces, y la segunda después de haberlo recuperado una vez.

1. **El barrido de vocabulario del Sprint 1.1** (~72 strings / 19 archivos) quedó absorbido en el commit
   `44e25be`, cuyo *mensaje* era de otro lane («fix(isolation): re-parenting de CrmSyncAttempt») y cuyo
   *diff* era en realidad el de 1.1. Un reset dejó ese commit **huérfano** (`git branch --contains` →
   vacío) y devolvió el trabajo al índice. Tres sesiones frenaron en Fase 0 con diagnósticos
   contradictorios sobre el mismo índice antes de que el **Sprint R** hiciera el forense y lo
   recommiteara como `612c4ee` (bitácora:1246-1265).
2. **El fix de copy de `01-flow.spec.ts:229`** (`self-check` → `chequeo final`) lo aplicó una sesión
   paralela en el working tree; los sprints 2.2 y 2.3 lo *vieron* y lo dejaron fuera del stage por ser
   ajeno (bitácora:1335, 1371). **Nunca se commiteó y se perdió.** La Fase 0 del Sprint 3.1 lo encontró
   así: «HEAD volvió a tener la copy vieja… `test:setter` lo confirmó rojo (B6)» (bitácora:1384), y
   tuvo que rehacerlo como commit aparte **`b468ec6`** antes de empezar su propio trabajo.

**Qué costó.** Un sprint forense completo (Sprint R) sólo para reconstruir qué había pasado; un sprint
posterior arrancando con deuda ajena; y dos sprints (2.2, 2.3) reportando un verde que dependía de un
cambio de working tree que iba a desaparecer — el 2.2 lo dice sin saberlo: «el rojo pre-existente ya NO
aparece — otra sesión en paralelo corrigió esa copy **en el working tree**».

**Regla.** Al cerrar, todo lo que se tocó se commitea — el trabajo propio y **lo colateral**. Si un
cambio ajeno en el working tree es lo que sostiene tu verde, tu verde no es tuyo: o se commitea (con
su propio commit, con mensaje honesto) o se reporta que la verificación depende de trabajo no commiteado.

---

## L-03 · El exit code de un chequeo pipeado es el del pipe

**Qué pasó.** El repo no conserva el incidente original, pero sí la **corrección**, datada y sostenida:
a partir del **Sprint 5.2** (2026-07-03) todos los cierres encabezan la sección de verificación con
«**Verde (chequeado, no asumido — corrido con `cd` explícito y leyendo el exit real, no la
notificación)**» (bitácora:908, y luego 934, 958, 980, 1008, 1034, 1059, 1085, 1108, 1133, 1155, 1181).
Los sprints 6.1 y 6.2, los últimos, todavía lo declaran explícito: «`tsc --noEmit` EXIT 0 (**sin pipe**)»
(bitácora:1700, 1740).

**Límite de la evidencia.** Que la fórmula aparezca por primera vez en 5.2 y se repita 13 veces prueba
que el problema existió y que la corrección se volvió ritual. **El falso verde que la originó no está
escrito en ninguna fuente del repo** — se lo trata acá como confirmado por la práctica, no por el hecho.

**Regla.** Un chequeo se corre con el directorio de trabajo explícito y su exit code se lee del proceso,
no de un pipe (`| tail`, `| head`, `&&`) ni de la notificación del harness. Si hace falta recortar la
salida, se captura el estado *antes* de recortarla.

---

# §2 — Verificación honesta

## L-04 · Un "modo QA" puede servir un build viejo: el falso rojo

**Qué pasó.** `start:qa` era `next start -p 3001` a secas: levantaba el `.next` que ya existía, **sin
recompilar**. El spec nuevo de cada sprint corría entonces contra el código de *antes* del sprint:

- **Sprint 2.2** (bitácora:1331): «la 1ª corrida contra `start:qa` dio **falso-rojo con el cambio real
  aplicado**».
- **Sprint 3.2** (bitácora:1432): idéntico, `defaultPrevented` siempre `false` porque el guard nuevo no
  estaba en el bundle servido.
- **Sprint 3.3** (bitácora:1468): «Trampa de siempre (2.2/3.2), esta vez sin sorpresa» — ya se había
  vuelto folklore antes de arreglarse.
- **Sprint 3.4c** (`178c4d7`) lo cerró: `"start:qa": "npm run build && …"`. El mensaje del commit
  registra el diagnóstico completo, incluido que no había build en ningún otro punto del pipeline
  (`playwright.setter.config.ts` invoca `start:qa` directo en su `webServer`).

**Qué costó.** Tres sprints perdiendo tiempo en una corrida falsa cada uno, y un workaround manual
("correr `npm run build` antes") que había que recordar — y que dos veces no se recordó.

**Regla.** Un entorno de verificación tiene que garantizar que sirve **el código de ahora**. Un falso
rojo repetido dos veces no es mala suerte: es un defecto del harness y se arregla en el harness, no en
la memoria del que verifica.

---

## L-05 · El autorreporte de un agente no es estado verificado

**Qué pasó.** Dos casos de distinta naturaleza:

- **Sprint 5.6** (bitácora:1011): el subagente `visual-qa` reportó ❌ «falta el CTA Arrancar en m7».
  Se **refutó empíricamente**: SSR-curl con cookie real → HTTP 200 con «Arrancar construcción» presente,
  y el e2e B5 **clickeó ese botón en browser real** verificando la transición. Era un snapshot parcial
  del agente — patrón que él mismo había notado en otra pantalla. Sus dos ❓ también resultaron
  comportamiento por diseño, no bugs.
- **Sprint R** (bitácora:1246): «**tres sesiones frenaron en Fase 0 con diagnósticos contradictorios
  sobre el mismo índice**» — no se sabía si el Sprint 1.1 seguía absorbido en un commit ajeno, si un
  reset lo había deshecho a medias, o si lo staged era ruido CRLF. Tres lecturas del mismo terreno, tres
  conclusiones incompatibles. Sólo un forense read-only con comandos (`git branch --contains`,
  `diff` entre `git diff --cached` y `git show 44e25be` → vacío, EXIT 0) resolvió cuál era la verdad.

**Qué costó.** Un sprint forense entero; y en 5.6, el riesgo de haber "arreglado" un bug inexistente en
la víspera del corte más grande del proyecto.

**Regla.** El reporte de un agente (o de una sesión anterior, o del propio) es una **hipótesis con
prioridad**, no un hecho. Un ❌ se confirma o se refuta con un comando que devuelva evidencia
independiente antes de tocar código; un ❓ va al humano, no se resuelve por asunción. Cuando dos
lecturas del mismo terreno se contradicen, la salida es un paso forense de **solo lectura**, no una
tercera opinión.

---

## L-06 · Verde no es verificado: qué prueba cada chequeo

**Qué pasó.** El repo acumuló un catálogo de verdes que no significaban lo que parecían:

| Verde | Lo que NO probaba | Evidencia |
|---|---|---|
| `prisma migrate status` «up to date» | **Drift físico**: 7 columnas existían en la DB que el schema ya no declaraba. Lo cazó `migrate diff`, no `status`. | bitácora:528 (E.1) |
| `npm run build` exit 0 | Tipos: `ignoreBuildErrors: true` salta la validación — el `tsc` real tenía 1 error ambiente pre-existente. | bitácora:555 (B1.A) |
| `tsc --noEmit` verde | Un error de tipos que **sólo se materializa con los tipos que genera `next build`** (TS2344 por un export no-handler en un `route.ts`). Sprint T cerró "verde (proxy)" y declaró que el build de Franco era el cierre autoritativo. | bitácora:1275-1283, `d0e8ef4` |
| `test:setter` 39/39 | El claim atómico de agenda — cero cobertura (ver L-09). | bitácora:1617 |
| Un screenshot | El scroll-on-click de los deep-links: «un screenshot no prueba el scroll». | bitácora:389 (4·C) |
| SSR-curl del copy | Cómo se ve: «prueba que el copy RENDERIZA en cada estado, no cómo se VE (spacing, jerarquía)». | bitácora:207 (3.5) |

**Qué costó.** Poco, porque en casi todos los casos el propio sprint declaró el límite. El costo real
fue en el único caso donde el límite **no** se declaró a tiempo: el drift físico de E.1 quedó flagueado
como ajeno y sigue abierto.

**Regla.** Cada chequeo se reporta con **qué prueba y qué no**. "Verde" sin objeto es autoengaño: el
formato es «`<comando>` → EXIT 0, prueba `<X>`; no prueba `<Y>`».

---

## L-07 · Cuando la verificación fuerte no está disponible, se declara el proxy

**Qué pasó.** El canal de captura de pantalla estuvo caído sprints enteros (`preview_screenshot` colgado
a 30s, `visibilityState:"hidden"`, el preview MCP que no adjunta al prod-QA levantado por npm). Ninguno
de esos sprints cerró a ciegas ni fingió una verificación que no tenía; cada uno **nombró el proxy**:

- 3.1/3.2/3.3: verificación **por geometría medida** (`getBoundingClientRect`, qué entra en viewport)
  en lugar de screenshot — «los fixes de overlay se miden por eval, no screenshot» (bitácora:1126).
- 5.5/6.3: **SSR-curl con la cookie cruda** para probar presencia/ausencia de copy; 6.3 lo argumenta:
  para una **remoción**, la prueba de contenido es la más fuerte, porque no se renderiza nada nuevo que
  pueda romper layout (bitácora:1088).
- 7.2: **render-proof estático** con `renderToStaticMarkup`, 24 asserts, script descartable —
  y dejó explícito que `build` + `test:setter` + tab-through real **no se corrieron** y por qué.
- Sprint T: «Verde (**proxy** — el build autoritativo es de Franco)».

**Qué costó.** Nada: es la práctica que evitó el costo. Lo que sí quedó pendiente es la deuda declarada
(el pase de píxeles humano, que se arrastró de 5.5 hasta que 7.1 lo hizo con Franco presente).

**Regla.** Si la verificación fuerte no está disponible, se elige un proxy, **se nombra**, se dice qué
cubre y qué no, y lo que el proxy no alcanza se flaguea al humano. Nunca se cierra en silencio ni se
presenta el proxy como si fuera la verificación fuerte.

---

# §3 — Cobertura y riesgo

## L-08 · Antes de tocar un guard sin cobertura, un test de caracterización

**Qué pasó.** Es el caso mejor ejecutado del proyecto y quedó en dos commits consecutivos:

- **`8b3ce80` — Sprint 6.0**, «test de caracterización del claim atómico de agenda (**red previa a
  B-05**)». Diff: **cero archivos de `src/`**. Naturaleza declarada: «documenta y protege lo que el
  código hace HOY» (bitácora:1619). Cuatro casos (doble claim, ownership cruzado, compensación,
  post-AGENDADA), corridos 3 veces seguidas para probar estabilidad. Documentó incluso el
  comportamiento que **no le gustaba** sin arreglarlo: `revertirAgendandoOwned` borraba el claim
  entero — «No es un bug reportable, **es el contrato de hoy**» (bitácora:1628).
- **`7d323ea` — Sprint 6.1**, que ensanchó el `where` del claim para aceptar `OFRECIDOS`. Con la red
  puesta: G1-G4 «quedaron **intactos en sus aserciones**: 4/4 verde sin tocar una sola expectativa».

**El matiz que sólo se ve con los dos juntos.** 6.0 **predijo mal** qué iba a cambiar: anticipó que la
aserción de G3 (la compensación deja `agendaJson` en NULL) sería la que habría que actualizar. No hizo
falta — la compensación pasó a restaurar *el estado previo al claim*, y el previo de ese lead era NULL
(bitácora:1688). La red igual sirvió: no porque acertara la predicción, sino porque convirtió cada
suposición en una aserción que el sprint siguiente tuvo que mirar a la cara.

**Qué costó.** Un sprint entero de sólo tests. Es exactamente lo que **no** costó: 6.1 ensanchó una
condición de concurrencia sobre un claim atómico —el mecanismo que evita bookings duplicados en la
agenda real de Franco— y supo, no supuso, que no había aflojado la llave.

**Regla.** Antes de modificar un guard de concurrencia, un gate o cualquier invariante sin cobertura:
**primero el test de caracterización**, en un sprint propio, con diff cero en `src/`. Documenta lo que
el código hace hoy, incluido lo que parece mal, con un comentario que diga cuál aserción va a cambiar
y por qué. La predicción puede fallar; la red no.

---

## L-09 · La suite verde mide lo que cubre, no lo que importa

**Qué pasó.** `test:setter` estuvo verde 39/39 durante **todo** el proyecto de rediseño mientras
`marcarAgendandoOwned` (el claim atómico de la agenda) no tenía **ninguna** cobertura. El Sprint 6.0 lo
levanta con precisión quirúrgica (bitácora:1617): `06-claim-atomico.spec.ts` cubre el claim del *envío
de demo* (otro claim), y el único test que rozaba agenda —`01-flow.spec.ts`— **sembraba `agendaJson` en
AGENDADA directo, salteando el claim entero**.

El mismo patrón, dos sprints antes de eso: el **Sprint 5.2** (2026-06-30) partió de una lista de huecos
candidatos del test-hardening y «la verificación adversarial confirmó que **solo DOS son genuinos**» —
el resto ya estaba cubierto o era invariante puro. Sin esa verificación adversarial se habrían escrito
tests redundantes creyendo que se cerraban huecos.

**Qué costó.** Nada todavía — el claim aguantó. El costo era potencial y grande: un booking duplicado
en la agenda real de Franco pasando por delante de una suite verde.

**Regla.** El número de una suite no dice qué protege. Antes de tocar una zona, **censar la cobertura
real de esa zona** (qué spec ejercita la primitiva, y si la ejercita o la saltea sembrando su efecto).
Un test que siembra el estado final saltea todo el camino que lo produce.

---

## L-10 · Un invariante ejecutable es la única verificación que no se evapora

**Qué pasó.** El proyecto pasó de 10 a **17** invariantes puros (`check:invariants`, `package.json:18`),
y el criterio de cuándo escribir uno quedó dicho en las propias cabeceras, siempre con la misma fórmula:
«verifica, de forma ejecutable (**no "es obvio" y no efímero como la verificación en runtime**)»
(`particion.invariant.ts:6-7`, `manual.invariant.ts:6-7`).

El Sprint 6.1 (A-05, el pin) es el caso didáctico: en vez de verificar en runtime que "fijar un lead
accionable lo hace foco", escribió `particion.invariant.ts` con cinco escenarios deterministas y lo
dijo en la bitácora (línea 1037): «Es una guardia **PERMANENTE**, no una corrida de runtime que se
pierde (la bitácora previa criticó explícitamente verificar "solo en runtime" sin guardia)».

Tres propiedades comunes a los 17, que son las que los hacen baratos:
1. **Sin DB y sin `@/`** — importan los módulos de dominio por ruta relativa con `.ts`, porque el árbol
   de runtime de `flow.ts`/`manual.ts` se mantiene `@/`-free **a propósito** (`flow.ts:18`,
   `manual.ts:18`). El harness `ts-node` los carga sin Neon ni `tsconfig-paths`.
2. **Prueban las piezas puras de un write impuro** cuando el write no se puede importar
   (`progreso-isolation.invariant.ts:6-12` explica el patrón).
3. **Derivan sus fixtures del código vivo**, no de etiquetas hardcodeadas: `self-check-gate.invariant.ts`
   construye el blob "todo en verde" desde `HARD_CHECKS` **en vivo**, así el invariante sigue teniendo
   dientes cuando la lista cambie.

**Qué costó.** Nada; es capital. `REGRESION-FINAL-2026-07.md` pudo cerrar el proyecto probando que las
5 invariantes sensibles eran **byte-idénticas** desde antes de la ventana de cambios — evidencia de
git, no confianza.

**Regla.** Toda garantía que un sprint promete y que hoy se verifica "mirando" o "corriendo la app" se
convierte en invariante ejecutable si es derivación pura. La verificación de runtime muere con la
sesión; el invariante corre en CI para siempre. Mantener los módulos de dominio `@/`-free y sin Prisma
es lo que hace que eso sea barato.

---

# §4 — Efectos de segundo orden

## L-11 · Arreglar una trampa puede fabricar otra, y la segunda se ve peor

**Qué pasó.** Cadena completa, en dos commits separados por horas:

1. **`178c4d7` (Sprint 3.4c)** encadenó `npm run build &&` a `start:qa` para matar el falso rojo de L-04.
   Correcto, y el commit lo justifica con evidencia («no hay build automático en otro punto del pipeline»).
2. **`fccbeb7` (micro 4.0)** — «webServer timeout cubre el build encadenado de `start:qa`»:
   `playwright.setter.config.ts`, `timeout: 120_000` → `300_000`. El `webServer` de Playwright arrancaba
   `start:qa` y le daba 2 minutos para responder; con el build encadenado adentro, esos 2 minutos ya no
   alcanzaban.

El síntoma del segundo bug —el `webServer` cae por timeout— **no se parece en nada** a su causa (un fix
de higiene del script de arranque). Un lector sin el commit anterior a la vista diagnostica "server
lento" o "flake de infra", que es justo el diagnóstico que L-16 dice no aceptar.

**Qué costó.** Un micro-sprint. Barato porque se detectó rápido; el costo real es el que se evitó — si
el timeout hubiera empezado a fallar intermitentemente en vez de siempre, habría entrado al saco de los
flakes de infra y se hubiera quedado ahí.

**Regla.** Un fix al harness cambia el presupuesto de tiempo, memoria o recursos de todo lo que lo usa.
Al arreglar una trampa de infraestructura, **censar quién invoca lo que tocaste** y revisar sus límites
(timeouts, locks, puertos, caches). Y al reportar: nombrar el fix anterior en el mensaje del commit —
`fccbeb7` lo hace, y por eso la cadena es reconstruible.

---

## L-12 · El pedido literal puede ser exactamente la regresión

**Qué pasó.** El Sprint B6.2 recibió una instrucción concreta: agregar `selfCheckJson` al
`ESCALADO_RESET`. Ejecutarla al pie de la letra habría sido una regresión, y el sprint lo detectó antes
de escribirla. El razonamiento quedó fosilizado en el código, en `escalamiento.ts:71-75`:

> «**A propósito NO se mergea en `ESCALADO_RESET`** (que corre en CADA transición): en
> CONSTRUCCION→EN_REVISION el self-check **DEBE sobrevivir** — el admin lo lee en la superficie de
> revisión (`SelfCheckPanel`, exigible en EN_REVISION/APROBADA). Por eso `transitionDossier` lo aplica
> SOLO cuando `esReloopRechazo(from, to)`.»

Además habría roto el invariante `escalamiento`, que **fija** `ESCALADO_RESET === {escaladoAt, escaladoNota}`
(bitácora:607). O sea: la red existente habría atrapado el error igual — pero después de escribirlo.

**El mismo patrón, tres veces más:**
- **4·B** (bitácora:351): el pedido implicaba mapear los 6 hard-checks a prompts. Se mapeó **1 de 6** y
  se documentó el porqué de cada no-mapeo (`prompts-disenio.ts:119-131`). «NO inventé prompts
  lead-specific para forzar un 1:1 — sería corromper 4·A».
- **B6.5 item 2** (bitácora:652): el pedido asumía un techo de 3/6. Verificado contra el código, el
  techo real era 1/6. **Sin cambio de código**, con la razón escrita.
- **Sprint 2.1** (bitácora:1298): «**Auditoría desfasada.** Las line-refs del brief
  (`os-commercial.ts:78-96,162-172`) NO matcheaban: esas líneas son RESPONDIO/`postergarLead`».
  Se mapeó el terreno real antes de tocar.

**Qué costó.** Cero, en los cuatro casos, porque se leyó el terreno antes de obedecer. El
contrafáctico de B6.2 es concreto: el panel de revisión del admin habría dado el self-check por anomalía
en **cada revisión normal**.

**Regla.** Una instrucción se ejecuta contra el terreno, no contra su propia letra. Si el pedido literal
choca con lo que el código hace, se cumple el **intent** por el camino más angosto y se **documenta en
el código** por qué la letra no se siguió. Las referencias `archivo:línea` de un backlog envejecen: se
re-verifican antes de usarlas como mapa.

---

## L-13 · El nombre sobrevive al retiro de lo que nombraba

**Qué pasó.** El Sprint 5.6 retiró el wizard de página larga (16 archivos, −3.192 líneas). El código
se fue; **el vocabulario no**:

- **La numeración "Paso N"** siguió viva en el copy más visible del setter durante **seis días y varios
  sprints**: la línea del foco (`flow.ts` `proximaAccion`), los "arreglos" de los checks duros, el rail
  de herramientas, los mensajes de error de las actions. El propio 5.6 lo anotó como fuera de scope
  (bitácora:1014-2), el smoke-test 7.0 lo re-encontró (bitácora:1106), la auditoría de cierre lo elevó a
  hallazgo **severidad 4** (C-04) y recién el **Sprint 1.1** (`612c4ee`) lo barrió: 72 strings, 18 archivos.
- **La palabra "caliente"** necesitó **tres pasadas**: 1.1 la sacó de la mayor parte, el Sprint 3.1
  (`909ad8d`) hizo el censo completo (~140 hits) y barrió 9, y el Sprint 3.4a (`06584c2`) cerró el último
  fronterizo que 3.1 había dejado por disciplina de scope (`paso.ts:181`).
- **El naming interno sigue ahí hoy**: `paso.ts:33` documenta `StepAnchorId` como «Secciones **del
  wizard** a las que se puede aterrizar el foco», y el tipo `PasoDelLead` describe «Cartel de dirección
  **del wizard**» — de un wizard que no existe desde `75b9d7f`.

**Qué costó.** Un hallazgo de severidad 4 en la auditoría de cierre ("referencias irresolubles en el
elemento más protagonista del home"), tres sprints de barrido de strings, y un pendiente vivo de naming.

**Regla.** Retirar una superficie incluye retirar su **vocabulario**: numeración, nombres de pasos,
mensajes de error de las actions y nombres de tipos. En el mismo sprint del retiro se hace el censo por
grep y se declara el diccionario canónico de reemplazo (acá: los títulos de `PANTALLAS` en `manual.ts`).
Si el barrido no entra en el sprint, sale como sprint inmediatamente siguiente — no como nota al pie.

---

# §5 — Higiene y economía

## L-14 · El ruido recurrente anotado no es un pendiente: es una tarea de una línea

**Qué pasó.** `.last-run.json` (artefacto del runner de Playwright) aparece **16 veces** en
`bitacora-beta-3.md`, casi siempre con la misma frase: «los `.last-run.json` de Playwright quedaron
FUERA del commit — ruido pre-existente, no del sprint». Primera aparición: sprint 5.2 (2026-07-03).
Se resolvió el **2026-07-15** con una línea en `.gitignore` (`**/.last-run.json`, commit `b717014`) —
**doce días y ~10 sprints después**, y la puso un commit de otro lane («chore: ignora caché de
Playwright y artefactos de auditoría»), no un sprint de LeadOS.

El mismo patrón con `docs/proof-screenshots/`: se gitignoró (`.gitignore:75`) recién cuando ya eran
**159 MB de PNGs** de corridas previas — y se resolvió en el catch-up de commits del sprint 2.3
(bitácora:713), no cuando empezó a molestar.

**Qué costó.** Diez Fase 0 que tuvieron que distinguir ruido de señal, diez cierres que tuvieron que
explicar por qué el árbol no estaba limpio, y una degradación real de la señal: cuando "sucio con
`.last-run.json`" es lo normal, un archivo ajeno de verdad se camufla ahí.

**Regla.** Si un ítem de higiene aparece en **dos** Fase 0 seguidas como "ruido conocido", se arregla en
la segunda. Anotarlo por tercera vez cuesta más que la línea que lo elimina. Corolario: la Fase 0 debe
poder decir «árbol limpio» o listar cosas que **importan** — un listado permanente de ruido inutiliza el
chequeo.

---

## L-15 · La fixture compartida arrastra estado entre sesiones

**Qué pasó.** Los leads QA (`QA-W *` del seed V-1, `QA-M5/M16 *`) viven en la Neon dev **compartida**:

- **Sprint 5.3** (bitácora:940-1): «el `QA-W Construccion` arrastraba `progresoJson` de **5 fases de
  una sesión previa** — reseteado a NULL (estado canónico del seed) al cerrar».
- El contra-patrón que sí funciona quedó establecido en 5.2/5.3 y se usó desde entonces: specs que **se
  auto-provisionan** (crean su propio setter namespaced con `createSetter`, `SMOKE-SETTER`, teardown
  **por id exacto**), «→ NO depende de personas seedeadas: corre igual en Neon dev que sobre una DB de
  test fresca en CI» (bitácora:492). El sprint 2.2 lo aplica explícitamente: leads namespaced propios,
  «no reutiliza el seed QA compartido» (bitácora:1331).
- Los sprints que sí flipeaban fixtures compartidas lo hicieron **REVERTIBLE con backup+restore** y lo
  declararon en el cierre (bitácora:127, 163, 199, 359) — incluso «script QA temporal borrado».

**Qué costó.** En 5.3, una verificación que arrancó desde un estado que no era el canónico (se detectó y
se restauró). El riesgo mayor: un verde o un rojo atribuido al sprint cuando lo causó una sesión anterior.

**Regla.** Un test durable **se auto-provisiona y limpia por id exacto**; no depende de un seed
compartido. Si hay que tocar una fixture compartida, es con backup+restore explícito, se declara en el
cierre y se verifica el estado restaurado. Antes de creerle a una fixture compartida, se relee de la DB.

---

## L-16 · Un flake se diagnostica; re-correr no es diagnóstico

**Qué pasó.** El caso completo está en el **Sprint 3.4d** (`c19f7db`). `F4 · mobile drawer` fallaba
intermitentemente desde hacía sprints y se venía despachando como «flake de infra local»
(bitácora:1064, 1087, 1404, 1439). 3.4d lo trató como un bug:

1. **Se midió**: 6 corridas aisladas → **3 fallas / 6** (50%). No "a veces": la mitad.
2. **Se buscó la causa en el log de Playwright, no en una hipótesis**: `setter-shell.tsx` tiene **dos**
   botones con `aria-label="Cerrar menú"` — el scrim de fondo (`fixed inset-0`) y el X del panel. El
   `.first()` del test resolvía al **scrim**, cuyo centro geométrico (195, 422 en 390×844) cae **dentro
   de la columna del panel** (240px de ancho), así que el panel interceptaba el click contra sus propios
   `<li>` hasta agotar los 15s.
3. **Se arregló y se re-midió**: `.last()` apunta al X real (z-index `appDrawerClose=130`, el más alto) →
   **5/5 verde**.
4. **Y se respetó el techo**: el otro flake histórico (`B3 · OPENER`) se corrió 5 veces, **no reprodujo**,
   y se dejó sin tocar en vez de "arreglarlo" a ciegas.

**Qué costó.** Meses de corridas contaminadas, cierres con asteriscos y la erosión de la confianza en la
suite: cuando cualquier rojo puede ser "el flake conocido", un rojo real se descarta como ruido.

**Regla.** Un test intermitente se **mide** (N corridas aisladas, tasa real), su causa se busca en la
evidencia del runner (no en una hipótesis), y el fix se valida re-midiendo. Si no reproduce, se dice
"no reprodujo, sin tocar" — no se arregla a ciegas. "Flake de infra" es una conclusión que se gana con
evidencia, no un lugar donde archivar rojos.

---

# §6 — El código como fuente de decisiones

## L-17 · El comentario de decisión es la fuente, y sobrevive a los documentos

**Qué pasó.** Buena parte del método real de este proyecto **no está en ningún documento**: está en los
comentarios del código, escritos en el momento de decidir y con el contrafáctico incluido. Un censo por
grep (`§`, `a propósito`, `deliberad`, `intencional`, `precedente`, `decisión`, `NO se toca`) sobre
`src/lib/leados/` y `src/app/(protected)/setter/` da ~60 hits. Los densos:

| Dónde | Qué decisión documenta |
|---|---|
| `escalamiento.ts:71-79` | Por qué el reset del re-loop **no** va en `ESCALADO_RESET` (L-12) y qué preserva a propósito. |
| `flow.ts:588-606` | La precedencia deliberada de la partición, y que A-05 **revierte** explícitamente la exclusión de 2.1a. |
| `manual.ts:470-492` | Por qué la rama APROBADA **sigue** llamando a `gateEnvioDemo` directo en vez de re-basarse (exige `finalUrl`, un factor que la fuente única no recibe). |
| `manual.ts:484-492` | Por qué la rama de PERDIDO va **antes** del switch y por qué el never-guard queda intacto. |
| `prompts-disenio.ts:119-137` | El estado de los 6 hard-blocks, uno por uno, con el motivo de cada no-mapeo y cómo crecer la cobertura. |
| `error-copy.ts:8-17` | Las reglas no negociables del mapa: `dossier.ts` no se toca, sólo matches literales, un único prefijo anclado, nunca substring amplio. |
| `copy-blocks.ts:184-187` | Que se **verificó** (grep de código y bitácora) que la exclusividad al Evaluador no era intencional — o sea, documenta una **ausencia de decisión**. |
| `outreach.actions.ts:166` | «el manual ya no ofrece m5 para estos, pero **la action no confía en la UI**». |
| `prospecto-bulk.actions.ts:125` | La «EXCEPCIÓN DELIBERADA y ACOTADA al aislamiento de LECTURA» del dedup cross-setter. |
| `agenda-form.tsx:28-32` | Un precedente anterior **reinterpretado**: por qué «`agenda.actions.ts` no se toca» (5.4) dejó de aplicar en 6.1. |

**Qué costó.** El costo aparece cuando el comentario **no** se actualiza: `m-construccion.tsx:106` siguió
diciendo «el tilde NO se bloquea, §6-3» después de que 3.3 lo deshabilitara fuera de CONSTRUCCION. El
propio 3.3 lo detectó y **no lo tocó** (fuera del scope literal), lo flagueó (bitácora:1462), y 3.4b
(`600cfdc`) lo arregló en un commit de una línea. Un lector en esa ventana leía lo contrario de la verdad.

**Regla.** Al entrar a una zona, los comentarios de decisión se leen **como fuente**, a la par del
backlog. Si un comentario contradice una ficha vieja, gana el comentario hasta que se pruebe lo
contrario — y se reporta la contradicción. Al cambiar el comportamiento que un comentario describe, el
comentario se actualiza **en el mismo commit**: un comentario stale es peor que ninguno.

---

## L-18 · Una regla tiene dos puntas y hay que alinear las dos

**Qué pasó.** `setter-nav.tsx:38` afirma: «Navegación SOLO por `triggerTransition` (**decisión cerrada ·
CLAUDE.md**)». El `CLAUDE.md` dice, en su sección de navegación: el sitio público usa siempre
`triggerTransition()`; los **portales** (`/admin/*`, `/dashboard/*`) usan `<Link>` y «`triggerTransition()`
**no aplica en portales** (el Shutter no existe ahí)». `/setter/*` no está clasificado en ninguna de las
dos ramas — el comentario invoca una autoridad que no dice lo que él dice. La auditoría de cierre lo
registró (C-26: «comentario de `setter-nav.tsx:38-44` cita una regla de CLAUDE.md que el CLAUDE.md
contradice») y sigue abierto hoy, con la instrucción correcta: **alinear una de las dos puntas**.

**Qué costó.** Todavía nada — pero es exactamente el material del que se hacen las decisiones tomadas
dos veces (§8): la próxima sesión que toque el rail del setter va a tener que re-decidir algo que
alguien ya decidió, sin poder saber cuál de las dos fuentes manda.

**Regla.** Cuando un comentario invoca una regla de un documento, la regla tiene que **existir en el
documento y cubrir ese caso**. Si el documento no clasifica la superficie, el sprint que lo descubre
propone la clasificación en vez de asumirla. Una regla escrita en un solo lado es una regla a medias.

---

# §7 — Scope y cierre

## L-19 · Lo fuera de scope se nombra con `archivo:línea`, y eso es lo que lo hace ejecutable

**Qué pasó.** Todos los cierres del proyecto tienen una sección «Fuera de scope, anotado (no
implementado)» y la disciplina se sostuvo incluso bajo presión: el **Sprint 7.0** encontró 41 hallazgos
crudos, aplicó **2** (dos atributos `role="alert"`, tras una triage adversarial que reclasificó 14 de 16
candidatos a "no tocar") y dejó **39 documentados sin implementar** en un informe con archivo:línea,
severidad y recomendación. La regla del sprint era explícita: «ante la duda de categoría, es (b) — no se
toca» (bitácora:1101).

Esa disciplina es lo que hizo posible la **auditoría de cierre**: sus 40 ítems de backlog son fichas
ejecutables con archivos, dirección, criterio de éxito, tamaño y modelo recomendado — «escrito para
ejecutarse en conversaciones futuras con modelos más baratos: la inferencia cara ya está hecha acá»
(AUDITORIA-CIERRE:3). Y funcionó: los sprints 2.1 → 6.2 son la ejecución de ese backlog
(B-01/C-02/C-11 → `aed017e`, B-04/C-06 → `7425d2b`, B-02/C-03/C-17 → `b844208`, B-06/C-07 → `909ad8d`,
B-09/C-16+B-13 → `79d3787`, B-07/C-08 → `db557e8`, B-08 → `b6b2132`, B-10/C-24 → `88b1f13`,
B-12/C-18 → `65058fc`, B-05/PR-2 → `7d323ea`+`6a88cbe`). **Los mensajes de commit llevan el ID de la
ficha** — la trazabilidad backlog→commit es un grep.

**Qué costó.** Nada; es el activo más valioso que dejó el proyecto.

**Regla.** Lo fuera de scope se nombra con `archivo:línea` + qué habría que hacer + criterio de éxito,
no con "queda pendiente mejorar X". Y el ID de la ficha viaja en el mensaje del commit que la ejecuta.

---

## L-20 · El límite declarado vale más que la conclusión

**Qué pasó.** La sección 9 de `AUDITORIA-CIERRE-2026-07.md` («Límites de esta auditoría») declara cuatro
cosas que la auditoría **no pudo** establecer: que la vara es **reconstruida** (el brief v2.1 no existe
como archivo — constatado también por 7.0 y 7.3); que fue **estático puro** (nada se ejecutó, los
hallazgos de runtime están marcados VERIFICADO o INFERIDO); que el **volumen real de producción es
desconocido** (por eso el impacto de C-14 no se puede dimensionar); y que **6 subagentes fueron
interrumpidos** por el límite de sesión de la API, uno de ellos sin clasificador de seguridad disponible
— «su output se usó igual tras contraste con los otros cinco (solapamientos consistentes: C-01, C-04,
C-12 aparecen en ≥2 reportes independientes)».

El anexo va más lejos: una **prueba de inocuidad por `git status`**, con el baseline sucio al arranque y
el status final pegados enteros, y la conclusión «Delta de esta auditoría: **exactamente las dos
escrituras**» — todo el resto del churn es de otra sesión, nombrada.

**Qué costó.** Nada. Lo que ahorró: las tres auditorías del proyecto arrastran el mismo límite (el brief
ausente) y **ninguna** fingió tenerlo. Un lector puede releer los veredictos contra el brief real cuando
aparezca, porque sabe exactamente cuál es la vara que se usó.

**Regla.** Todo informe cierra declarando qué **no** pudo establecer y por qué, y con qué evidencia se
sustituyó lo que faltaba. Cuando el trabajo es read-only, la prueba de inocuidad (baseline vs. final,
con el churn ajeno nombrado) es parte del entregable.

---

# §8 — Decisiones tomadas dos veces

Una decisión que se toma dos veces es una decisión que la primera vez no quedó escrita **donde el
siguiente iba a mirar**. Siete casos, con lo que costó cada uno:

1. **El pin: ¿excluye del foco u ordena la cola?** 2.1a decidió excluir; el propio código dejó anotada
   la duda como decisión pendiente; se flagueó **tres veces** en `bitacora-beta-2.md` (2.1a/2.1b/2.3) y
   se resolvió recién en el Sprint 6.1 (`7b3e491`) — al revés de la primera decisión. El comentario de
   `flow.ts:599` ahora lo dice sin ambigüedad («**revierte la exclusión 2.1a**») y hay un invariante
   (`particion.invariant.ts`) que lo fija. *Costo: dos bloques de sprints con el home cayendo en "todo en
   espera" cuando el setter fijaba su única accionable.*

2. **La costura `posicionDe` → `derivarPasoDelLead`.** Anotada como pendiente por 4.1, otra vez por 3.2,
   otra vez por 4.2 — **tres veces**, incluido el reconocimiento explícito «la anotada tres veces»
   (bitácora:867) — antes de ejecutarse en el Sprint 5.0 (`2e75007`, 1 archivo, +24/−11). *Costo: dos
   fuentes del mismo hecho conviviendo cuatro sprints.*

3. **El vocabulario "caliente".** Barrido en 1.1, censo completo y re-barrido en 3.1, último fronterizo
   en 3.4a — **tres pasadas**. La segunda dejó `paso.ts:181` afuera por disciplina de scope y la tercera
   la cerró. *Costo: tres sprints de strings.*

4. **La numeración "Paso N".** El Sprint 3.7 la analizó, descubrió que era vocabulario **flow-wide** y
   **defirió la decisión a propósito** en vez de medio-arreglarla (bitácora:255) — decisión correcta y
   bien argumentada. Pero la deferencia duró hasta que dos auditorías la re-encontraron como severidad 4.
   *Costo: el elemento más protagonista del home apuntando a pasos inexistentes durante todo el rediseño.*

5. **El puente `HARD_CHECK_PROMPT`.** 4·B lo dejó en 1/6 con el porqué escrito; B6.5 lo re-evaluó por
   pedido y **confirmó la primera decisión sin cambiar código** (bitácora:652). *Costo: mínimo — y es el
   caso sano: la segunda vuelta confirmó porque la primera había dejado la razón escrita en el archivo.*

6. **`.last-run.json` fuera del commit.** Decidido 16 veces seguidas antes de la línea de `.gitignore`
   (L-14). *Costo: diez Fase 0 con ruido permanente.*

7. **El pase de píxeles.** Flagueado a Franco como pendiente en 3.1, 3.2, 3.3, 3.5, 3.7, 4·A, 4·B, A.1,
   A.2, 5.5, 5.6, 6.1, 6.2… hasta que el Sprint 7.1 lo hizo **con Franco presente** (`c82ff48`) y
   produjo el único ajuste real de todo el bloque: el header compacto en mobile (~41px, el primer campo
   de la ficha entra en el fold). *Costo: una decena de cierres arrastrando el mismo asterisco; y la
   confirmación de que la verificación que requiere al humano hay que **agendarla**, no acumularla.*

**Regla transversal.** Si una decisión se difiere, se escribe **dónde el siguiente va a mirar** (el
comentario del código que la implementa, no sólo la bitácora) y con nombre propio: qué se decidió, qué
se descartó y qué la reabriría. Si un pendiente aparece en tres cierres seguidos, deja de ser pendiente
y se convierte en sprint — o en una decisión explícita de no hacerlo.

---

# §9 — Las semillas, contrastadas contra el repo

| # | Lección semilla | Veredicto | Dónde queda |
|---|---|---|---|
| 1 | Dos sesiones sobre el mismo checkout comparten el índice; la unidad real es el worktree | **CONFIRMADA** y reforzada (Sprint T es el contraejemplo positivo) | L-01 |
| 2 | Un fix que vive solo en el working tree no es un fix | **CONFIRMADA** — pasó **dos** veces, la segunda tras haberlo recuperado | L-02 |
| 3 | El exit code pipeado a `tail`/`head` es el del pipe | **CONFIRMADA POR LA PRÁCTICA**; el incidente original no está en el repo | L-03 |
| 4 | El "modo QA" puede servir un build viejo; y arreglarlo fabricó otra trampa | **CONFIRMADA** en las dos mitades (`178c4d7` → `fccbeb7`) | L-04 + L-11 |
| 5 | El autorreporte de un agente no es estado verificado | **CONFIRMADA** (visual-qa refutado en 5.6; tres diagnósticos contradictorios en Sprint R) | L-05 |
| 6 | Test de caracterización antes de tocar un guard sin cobertura | **CONFIRMADA** (`8b3ce80` → `7d323ea`), con el matiz de que 6.0 predijo mal qué iba a cambiar y la red sirvió igual | L-08 |
| 7 | Un comentario puede documentar una decisión opuesta a un backlog viejo | **CONFIRMADA** (`escalamiento.ts:71`, `agenda-form.tsx:28`, `copy-blocks.ts:184`) | L-12 + L-17 |
| 8 | Cuando un sprint frena, los siguientes del bloque no deben correrse igual | **NO CONFIRMADA en su forma literal** | ver abajo |

**Sobre la #8.** No hay en el repo un caso de "sprint frenado cuyos sucesores se corrieron igual y
rompieron". Lo que sí hay es lo contrario, y vale como lección aparte: **las dependencias se declaran y
se respetan.** El backlog de la auditoría de cierre incluye un «orden de ataque sugerido (dependencias
explícitas)» con «B-04 **DEPENDE de** B-01 (el dato limpio da sentido a la UI)», y la ejecución lo
honró: `aed017e` (B-01, limpia `nextFollowUpAt`) → `7425d2b` (B-04, el form deja de ofrecer "No
respondió"). El sprint 2.2 **no podía** correrse antes: habría escondido una opción del form mientras el
dato seguía diciendo que el lead estaba vivo.

Lo más cercano al espíritu de la #8 está en el Sprint 6.0 (bitácora:1615): al verificar continuidad
encontró que «**no existe commit "sprint 5.2"** en `main` (numeración no contigua; **se reporta, no se
inventa**)» — y siguió, con el hueco declarado. Esa es la versión que el repo sí sostiene: *el hueco en
la cadena se reporta y se sigue con el hueco a la vista; no se rellena con una suposición ni se ignora.*

---

## Nota de método sobre este documento

Escrito en una corrida read-only: **cero archivos de `src/`, tests o configuración** fueron modificados
(verificable con `git diff --stat`). Los verdes citados (suites, invariantes, builds) son los que la
bitácora **reporta**; esta corrida no los re-corrió. Aplicando L-20, lo que no se pudo establecer está
declarado en [`PROGRESO-D1.md`](PROGRESO-D1.md), sección «Reporte final», punto (6).

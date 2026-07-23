# PROPUESTA DE CAMBIOS AL MÉTODO — destilada de la remediación de LeadOS

> **Qué es este documento.** Una propuesta de cambios concretos al método de develOP, derivada de
> [`LECCIONES-LEADOS.md`](LECCIONES-LEADOS.md). **Propone, no reescribe.** La ley la cambia Franco.
>
> **Sobre los documentos destino.** El método vive en dos documentos —el **Cimiento de Chat** (cómo se
> comporta la IA: ritual, reglas, comunicación) y el **Manual de Flujo** (la referencia: vocabulario,
> registros, recursos, anti-patrones)—. **Ninguno de los dos existe en este repo**: búsqueda por nombre
> de archivo y por contenido sobre todo el árbol versionado y la raíz (igual que el
> `docs/brief-vision-flujo-setter.md` que tres sprints y dos auditorías ya reportaron ausente). No se
> reconstruyeron ni se inventaron. Este documento es **autónomo**: cada cambio dice a qué parte del
> método corresponde para que Franco lo mapee a la sección real.
>
> **Los dos anclajes que sí existen en el repo** y con los que estos cambios conviven:
> `CLAUDE.md` (raíz — reglas no negociables, sprint protocol, frozen files, lessons learned) y
> `logic-core-v3/AGENTS.md` (convenciones de app + «Reporte estándar al cierre de cada prompt»).
> Donde un cambio toca uno de esos dos, se dice explícitamente.
>
> **Formato de cada cambio.** *Texto propuesto* (redactado para insertarse tal cual) · *Dónde va* ·
> *Por qué* (lección + evidencia) · *Qué costó no tenerlo* (concreto, de este proyecto).

---

## Índice de cambios

| # | Cambio | Eje | Urgencia |
|---|---|---|---|
| M-01 | Un worktree por sesión | 1 · Aislamiento | **Alta** |
| M-02 | Exclusividad de commit y commit por pathspec | 1 · Aislamiento | **Alta** |
| M-03 | Fase 0: cinco preguntas de terreno | 1 · Aislamiento | **Alta** |
| M-04 | Recursos exclusivos del worktree (`.next`, puertos, DB) | 1 · Aislamiento | Media |
| M-05 | Qué cuenta como verificado | 2 · Verificación | **Alta** |
| M-06 | Cómo se captura un exit code | 2 · Verificación | **Alta** |
| M-07 | El proxy declarado | 2 · Verificación | Media |
| M-08 | El autorreporte no cierra: refutar o confirmar | 2 · Verificación | **Alta** |
| M-09 | El paso forense de solo lectura | 2 · Verificación | Media |
| M-10 | Test de caracterización antes del cambio riesgoso | 3 · Cobertura | **Alta** |
| M-11 | Censo de cobertura antes de tocar una zona | 3 · Cobertura | Media |
| M-12 | Cuándo un invariante ejecutable es obligatorio | 3 · Cobertura | Media |
| M-13 | Cierre: se commitea lo colateral, en el momento | 4 · Cierre | **Alta** |
| M-14 | Cierre: la prueba de inocuidad | 4 · Cierre | Media |
| M-15 | Cierre: el ID de la ficha viaja en el commit | 4 · Cierre | Media |
| M-16 | Anti-patrones nuevos (siete) | 5 · Manual | **Alta** |
| M-17 | El comentario de decisión es fuente | 6 · Código | **Alta** |
| M-18 | Qué hacer cuando el código contradice el backlog | 6 · Código | **Alta** |
| M-19 | Las dos puntas de una regla | 6 · Código | Media |
| M-20 | Efectos de segundo orden al tocar el harness | 7 · Descubierto | Media |
| M-21 | La regla de las dos apariciones (higiene) | 7 · Descubierto | Media |

---

# EJE 1 — Aislamiento de sesiones concurrentes

## M-01 · Un worktree por sesión

**Texto propuesto**

> **Una sesión, un worktree.** Antes de escribir la primera línea, la sesión verifica en qué worktree
> está y qué rama tiene chequeada. Si otra sesión está trabajando sobre ese mismo checkout, la que llega
> segunda **abre worktree propio** (`git worktree add`) y trabaja ahí. Repartirse el trabajo "por
> archivos disjuntos" **no es aislamiento**: el índice de git, el directorio de build y los puertos son
> del checkout, no del archivo.
>
> Un worktree nuevo cuesta un comando y un enlace a `node_modules`. Una carrera de índice cuesta un
> sprint forense.

**Dónde va.** Cimiento de Chat — ritual de arranque (Fase 0), como precondición antes de cualquier
lectura de scope. Complementa el «Sprint protocol» de `CLAUDE.md` (que hoy define qué correr **antes**,
pero no **dónde** correr).

**Por qué.** L-01. Cuatro sprints pagaron el precio de compartir checkout: 3.2 tuvo que commitear por
pathspec y diferir el build hasta que la otra sesión soltara el puerto (bitácora:806); 4.1 descubrió la
colisión recién en la verificación final, por mtimes (bitácora:784); 1.1 vio su `tsc` global **pasar de
verde a rojo a mitad de sprint** por escrituras ajenas en `src/modules/motor/**` (bitácora:1240); 7.2
**no pudo correr `build` ni `test:setter`** porque el `dev:qa` de otro chat tenía el `.next` compartido
tomado (bitácora:1161). El Sprint T es la prueba en positivo: worktree aislado en `C:/tmp/wt-sprint-t`,
commit limpio en `main`, WIP ajeno intacto (bitácora:1281).

**Qué costó no tenerlo.** Un sprint cerrado sin verificación de browser (7.2). Una línea base perdida a
mitad de camino (1.1). Un build diferido esperando que se liberara un puerto (3.2). Una colisión de lane
detectada tarde (4.1).

---

## M-02 · La exclusividad de commit es de quien tiene la rama chequeada

**Texto propuesto**

> **Quién commitea.** En un checkout compartido, **commitea la sesión que tiene la rama chequeada**. El
> resto no usa `git commit -a` ni `git add .` **nunca**: agrega por **pathspec explícito** (la lista
> exacta de sus archivos) y verifica el set con `git diff --cached --name-only` **antes y después** de
> agregar — si aparece un archivo que no es suyo, se detiene y reporta.
>
> Si hay que commitear en una rama que otra sesión tiene chequeada, se hace fuera de árbol (índice
> privado + actualización de la referencia), nunca sobre el índice compartido.

**Dónde va.** Cimiento de Chat — reglas de git / cierre de sprint. Se puede anclar al «Sprint protocol»
de `CLAUDE.md`, que hoy no dice nada de concurrencia.

**Por qué.** L-01 y L-02. El Sprint 3.2 lo ejecutó bien y dejó el patrón: «commit por pathspec literal
para no arrastrar su índice — historia linear, cero entrelazado» (bitácora:806). El Sprint R hizo el
commit «solo staged, sin `-a`, **con guarda anti-carrera de índice compartido verificando el set antes y
después**» (bitácora:1258) y reportó `motor-files-captured=0` como parte del cierre.

**Qué costó no tenerlo.** El commit `44e25be`: el barrido de vocabulario del Sprint 1.1 (19 archivos)
quedó **absorbido bajo el mensaje de otro lane** («fix(isolation): re-parenting de CrmSyncAttempt»), y
un reset posterior lo dejó huérfano. Tres sesiones frenaron con diagnósticos contradictorios y hubo que
gastar un **sprint forense entero** (Sprint R) sólo para reconstruir qué había pasado.

---

## M-03 · Fase 0: las cinco preguntas de terreno

**Texto propuesto**

> **Fase 0 — terreno.** Antes de leer el scope, la sesión contesta cinco preguntas y las escribe:
>
> 1. **¿Dónde estoy?** Worktree y rama (`git worktree list`, `git branch --show-current`).
> 2. **¿Sobre qué base?** HEAD + el commit del sprint anterior presente en el log (continuidad).
> 3. **¿Qué hay sucio y de quién es?** `git status --porcelain`. Cada archivo sucio se clasifica: mío /
>    ajeno-conocido / **ajeno-desconocido**. Un ajeno-desconocido es un FRENO: se reporta antes de seguir.
> 4. **¿El árbol arranca verde?** El chequeo barato del proyecto (acá: `tsc --noEmit`, `migrate status`),
>    con su exit code leído. Sin línea base no hay "no rompí nada".
> 5. **¿Hay otra sesión viva sobre este checkout?** Worktrees, puertos ocupados, mtimes recientes.
>
> Si algo cambió entre el arranque de la sesión y el arranque real del trabajo, **se anota y se sigue** —
> no se frena por un cambio de terreno que no toca el scope.

**Dónde va.** Cimiento de Chat — ritual de arranque. Es la formalización de lo que los sprints 3.1→6.2
ya hacen bien y de lo que 4.1 no pudo hacer.

**Por qué.** L-01, L-05. La Fase 0 con las preguntas 1-4 ya es práctica establecida y se ve textual en
cada cierre desde el sprint 2.1. La **pregunta 5 es la que falta**: la Fase 0 del Sprint 4.1 «no
encontró» el lane paralelo en el log y sólo lo descubrió al cierre, por mtimes (bitácora:784), porque
miró la historia y no el terreno vivo.

**Qué costó no tenerlo.** Sprint 4.1: `derivarPantalla` se construyó autosuficiente, espejando a mano
una derivación que otra sesión estaba unificando en paralelo — y dejó una **costura viva** que hubo que
anotar tres veces y cerrar dos sprints después (`2e75007`). El Sprint 2.1 muestra la versión correcta:
«FRENO reportado; Franco autorizó dejar el WIP intacto y proceder» (bitácora:1294).

---

## M-04 · Recursos exclusivos del worktree

**Texto propuesto**

> **Recursos exclusivos.** El directorio de build (`.next`), los puertos de dev/QA y el servidor de la
> suite son **exclusivos del worktree**. Antes de correr un build o levantar un server, se verifica que
> nadie más lo tenga tomado. En Windows, un `next build` sobre un `.next` que otro proceso tiene abierto
> **lo bloquea o lo corrompe**: eso no es "un flake", es corrupción.
>
> Si el recurso está tomado y no hay worktree propio: **no se corre el chequeo y se declara que no se
> corrió**, con el motivo. Nunca se cierra afirmando un verde que no se pudo producir.

**Dónde va.** Manual de Flujo — recursos / entorno de verificación.

**Por qué.** L-01. Sprint 7.2: «La carpeta tiene el `dev:qa` de OTRO chat vivo en `:3002`; `next build`
reescribe el `.next` compartido (que ese `next dev` tiene abierto — en Windows lo bloquea/corrompe) →
habría reventado su sesión. Preferí no pisarla» (bitácora:1161). Sprint 3.2 difirió sus chequeos con un
waiter sobre las conexiones del puerto (bitácora:806).

**Qué costó no tenerlo.** El Sprint 7.2 cerró «verde (**estático**) — pendiente confirmación en
navegador», y su cableado de accesibilidad (`Field.tsx`, 33 consumidores) quedó **sin ejecutarse una
sola vez en un browser** hasta el Sprint 7.3, dos sprints después.

---

# EJE 2 — Verificación honesta

## M-05 · Qué cuenta como verificado

**Texto propuesto**

> **Qué cuenta como verificado.** Un chequeo se reporta con tres datos: **el comando**, **su exit code
> real**, y **qué prueba y qué no**.
>
> ```
> ✅ npm run test:leados → EXIT 0, 25/25.
>    Prueba: el motor del dossier contra la DB real (gates, transiciones, re-loop).
>    NO prueba: nada de la superficie del manual (no levanta browser).
> ```
>
> «Verde» sin objeto no es un reporte. Y en particular, ninguno de estos cierra por sí solo:
>
> - `npm run build` **no** valida tipos si el proyecto tiene `ignoreBuildErrors: true`.
> - `prisma migrate status` **no** detecta drift físico — eso lo caza `prisma migrate diff`.
> - `tsc --noEmit` **no** cubre los tipos que genera `next build` (rutas, handlers).
> - Un screenshot **no** prueba una interacción; el SSR **no** prueba cómo se ve.
> - Una suite verde **no** prueba lo que no cubre (ver M-11).

**Dónde va.** Cimiento de Chat — comunicación y cierre. Reemplaza el `- $ [comando] → [ok/error]` del
«Reporte estándar al cierre de cada prompt» de `AGENTS.md:172-174`, que hoy admite un `ok` sin objeto.

**Por qué.** L-06. Los cinco casos de la lista están documentados: el drift físico que `migrate status`
verde escondía (bitácora:528), el `ignoreBuildErrors` (bitácora:555), el TS2344 que sólo aparece con los
tipos de `next build` (Sprint T, `d0e8ef4`), «un screenshot no prueba el scroll-on-click»
(bitácora:389), «el SSR-curl prueba que el copy RENDERIZA, no cómo se VE» (bitácora:207).

**Qué costó no tenerlo.** El drift físico de Prisma (7 columnas que existían en la DB y ya no en el
schema) vivió detrás de un `migrate status` verde hasta que E.1 corrió `migrate diff` por otro motivo
(bitácora:528) — y sigue abierto. El resto de los casos costó poco **porque el sprint declaró el
límite**: la propuesta es volver obligatorio lo que hoy es virtud individual.

---

## M-06 · Cómo se captura un exit code

**Texto propuesto**

> **Exit codes.** Un chequeo se corre con el directorio de trabajo **explícito** y su exit code se lee
> del proceso. Está prohibido derivar el resultado de:
>
> - un pipe (`cmd | tail`, `cmd | head`) — el exit code del pipeline es el del **último** comando;
> - un encadenado (`cmd && echo ok`) — el `echo` no sabe qué pasó antes;
> - la notificación del harness sobre un proceso en background;
> - el hecho de que "no se vio ningún error" en la salida.
>
> Si hace falta recortar la salida, se captura el estado **antes** de recortarla. Al reportar, se dice
> «EXIT 0» y —si el comando suele pipearse— **«sin pipe»**.

**Dónde va.** Cimiento de Chat — reglas de ejecución y verificación.

**Por qué.** L-03. La corrección está datada y sostenida en el repo desde el sprint 5.2: «Verde
(chequeado, no asumido — corrido con `cd` explícito y **leyendo el exit real, no la notificación**)»
(bitácora:908, y 12 repeticiones más). Los últimos dos sprints todavía lo declaran: «`tsc --noEmit`
EXIT 0 (**sin pipe**)» (bitácora:1700, 1740).

**Qué costó no tenerlo.** No se puede cuantificar con evidencia del repo: el falso verde que originó la
práctica no quedó escrito. Que 13 cierres consecutivos lo declaren explícitamente indica que el costo
fue suficiente para volverlo ritual. *(Este es el único cambio de la propuesta cuya evidencia es la
corrección y no el incidente — se declara, siguiendo M-14.)*

---

## M-07 · Si la verificación fuerte no está disponible, se declara el proxy

**Texto propuesto**

> **El proxy declarado.** Cuando la verificación fuerte no está disponible (canal de captura caído,
> server tomado, dependencia externa), la sesión **elige un proxy, lo nombra y dice qué cubre y qué no**.
> Formato:
>
> > *Verificación fuerte:* pase visual desktop+mobile. *No disponible:* `preview_screenshot` colgado a
> > 30s toda la sesión (infra del MCP, no del repo).
> > *Proxy usado:* geometría medida (`getBoundingClientRect`) sobre los 3 focos, en ambos viewports.
> > *Cubre:* qué entra en el fold y en qué orden. *No cubre:* peso visual, spacing, jerarquía.
> > *Flagueado a Franco:* el ojo humano sobre el resultado.
>
> Proxies con precedente en este repo, de más fuerte a menos: e2e en browser real · geometría medida por
> `eval` · SSR-curl con la cookie real (la más fuerte para probar **presencia o ausencia de copy**) ·
> render-proof estático (`renderToStaticMarkup`) · lectura de código con precedente idéntico citado.
>
> Un proxy nunca se presenta como la verificación fuerte, y lo que no alcanza **se agenda**, no se acumula.

**Dónde va.** Manual de Flujo — recursos de verificación (catálogo de proxies) + Cimiento de Chat
(la obligación de declararlo).

**Por qué.** L-07. Sprints 3.1/3.2/3.3 midieron por geometría con el canal de captura caído; 5.5, 5.6 y
6.3 verificaron por SSR-curl con cookie cruda; 7.2 por render-proof de 24 asserts; el Sprint T cerró
como «Verde (**proxy** — el build autoritativo es de Franco)». El 6.3 hasta argumenta cuál proxy es el
correcto para una **remoción** (bitácora:1088).

**Qué costó no tenerlo.** El pase de píxeles se flagueó como pendiente en **más de una decena** de
cierres consecutivos antes de que 7.1 lo hiciera con Franco presente — y produjo un ajuste real
(header compacto en mobile, `c82ff48`). Acumular la verificación que requiere al humano la posterga
indefinidamente; agendarla la ejecuta.

---

## M-08 · El autorreporte de un agente no cierra: se confirma o se refuta

**Texto propuesto**

> **El autorreporte no es estado.** El reporte de un subagente —o de una sesión anterior, o de uno
> mismo en un turno previo— es una **hipótesis con prioridad**, no un hecho.
>
> - Un **❌ (roto)** no se arregla hasta confirmarlo con evidencia independiente del agente que lo
>   reportó (un comando que devuelva el estado real: SSR-curl, consulta a la DB, e2e existente que
>   ejercite ese camino).
> - Un **❓ (a confirmar)** va al humano. No se resuelve por asunción ni "por las dudas".
> - Un **✅** de un agente que no corrió el comando no es un verde.
>
> El agente que reporta un ❌ describe **cómo lo observó**; el que lo recibe verifica que esa
> observación sea completa (un snapshot puede estar cortado).

**Dónde va.** Cimiento de Chat — subagentes y comunicación. Complementa la sección «Subagentes» de
`CLAUDE.md`, que hoy dice «Si reporta ❌ ROTO/BUG → no cerrar el sprint» sin decir **verificar primero**.

**Por qué.** L-05. Sprint 5.6: el único ❌ de `visual-qa` («falta el CTA Arrancar en m7») fue **refutado
empíricamente** por SSR-curl con cookie real + el e2e B5 que **clickeó ese mismo botón** en browser real
— era un snapshot parcial. Sus dos ❓ resultaron ser comportamiento por diseño (bitácora:1011).

**Qué costó no tenerlo.** En 5.6 se evitó el costo por poco: el ❌ llegó **en la víspera del corte más
grande del proyecto** (retiro del wizard, 38 archivos). Actuar sobre él sin refutarlo habría significado
"arreglar" un bug inexistente en el peor momento posible.

---

## M-09 · El paso forense de solo lectura

**Texto propuesto**

> **Cuándo hace falta un forense.** Cuando dos lecturas del mismo terreno se contradicen —dos sesiones
> con diagnósticos distintos, un estado que no coincide con lo que la bitácora dice—, la salida **no es
> una tercera opinión**: es un paso forense de **solo lectura**, con árbol de decisión pre-autorizado.
>
> El forense: (a) no escribe nada hasta terminar el diagnóstico; (b) usa comandos que devuelven
> evidencia, no impresiones (`git branch --contains`, comparar dos diffs byte a byte, releer de la DB);
> (c) escribe el diagnóstico **antes** de la acción; (d) ejecuta la rama del árbol que el diagnóstico
> señala, y (e) declara el estado final con el mismo detalle con el que declaró el inicial.
>
> Un forense es barato comparado con actuar sobre un diagnóstico equivocado en un terreno que ya está
> confuso.

**Dónde va.** Manual de Flujo — procedimientos (un "modo" de sesión, junto a sprint / auditoría / probe).

**Por qué.** L-05, L-02. El Sprint R es el molde: «**tres sesiones frenaron en Fase 0 con diagnósticos
contradictorios sobre el mismo índice**» — y lo resolvió con evidencia dura: `git branch --contains
44e25be` → vacío (huérfano), y el diff entre `git diff --cached` y `git show 44e25be` → **vacío,
EXIT 0** (o sea: lo staged **era** 1.1, byte a byte, y no ruido de CRLF como se sospechaba)
(bitácora:1248-1258).

**Qué costó no tenerlo.** Tres sesiones bloqueadas en Fase 0 sin poder arrancar, y el trabajo de un
sprint (1.1, 19 archivos) en riesgo real de perderse.

---

# EJE 3 — Cobertura previa al cambio riesgoso

## M-10 · Test de caracterización antes de tocar un guard sin red

**Texto propuesto**

> **La red primero.** Antes de modificar un guard de concurrencia, un gate, un claim atómico o cualquier
> invariante que hoy **no tenga cobertura**, se escribe primero un **test de caracterización**, en un
> **sprint propio**, con **diff cero en `src/`**.
>
> El test de caracterización **documenta y protege lo que el código hace HOY** — incluido lo que parece
> mal. Si una conducta actual se va a cambiar en el sprint siguiente, se aserta igual, con un comentario
> que diga *cuál* aserción va a cambiar y *por qué*: eso convierte una suposición en algo que el próximo
> sprint tiene que mirar a la cara.
>
> El sprint de la red también declara **sus límites**: qué no reproduce (por ejemplo: dos transacciones
> en vuelo desde un solo proceso Node no son concurrencia multi-proceso real) y qué sustituye a lo que
> no puede ejercitar (llamar la primitiva directa en vez de la action, cuando la action pega contra una
> API externa o depende de cookies de request).

**Dónde va.** Cimiento de Chat — protocolo de sprint (una precondición de los sprints "motor-adyacentes").
Se ancla naturalmente al «Sprint protocol» de `CLAUDE.md`.

**Por qué.** L-08. `8b3ce80` (Sprint 6.0) → `7d323ea` (Sprint 6.1). La red documentó incluso lo que no
le gustaba, sin arreglarlo: «`revertirAgendandoOwned` deja `agendaJson` en `Prisma.DbNull`… **No es un
bug reportable, es el contrato de hoy**» (bitácora:1628). Declaró su límite textualmente (bitácora:1630).
Y funcionó: 6.1 ensanchó el `where` del claim y G1-G4 quedaron «intactos en sus aserciones».

**El matiz que hay que escribir en el método.** 6.0 **predijo mal** cuál aserción iba a cambiar
(anticipó G3; no hizo falta tocarla — bitácora:1688). La red no vale porque la predicción acierte; vale
porque obliga al sprint siguiente a justificar cada aserción que toca. Un test de caracterización cuya
predicción falló **sigue siendo un test de caracterización exitoso**.

**Qué costó no tenerlo.** Antes de 6.0, `marcarAgendandoOwned` —el mecanismo que evita bookings
duplicados en la agenda real de Franco— llevaba **todo el proyecto sin una sola línea de cobertura**,
con la suite en verde (ver M-11). El costo era potencial y grande; se evitó por un sprint de tests.

---

## M-11 · Censo de cobertura antes de tocar una zona

**Texto propuesto**

> **La suite mide lo que cubre, no lo que importa.** Antes de tocar una zona, se censa la cobertura
> **real de esa zona**, no el número de la suite. Dos preguntas:
>
> 1. **¿Qué spec ejercita esta primitiva?** (por nombre de función, no por nombre de feature).
> 2. **¿La ejercita o la saltea?** Un test que **siembra el estado final** (escribe el blob ya
>    resuelto, inserta la fila en su estado terminal) saltea todo el camino que lo produce — y ese
>    camino es justo lo que se está por tocar.
>
> El resultado del censo se escribe en el cierre: «cobertura previa de X: N specs, ninguno ejercita la
> primitiva» es un hallazgo, no un trámite.

**Dónde va.** Manual de Flujo — testing (junto a la «Política de testing» de `AGENTS.md:150-154`).

**Por qué.** L-09. Sprint 6.0 (bitácora:1617): `06-claim-atomico.spec.ts` cubre el claim del **envío de
demo**, no el de agenda; y el único test que rozaba agenda —`01-flow.spec.ts`— «**siembra `agendaJson`
en AGENDADA directo, salteando el claim entero**». Con `test:setter` en 39/39.

**Qué costó no tenerlo.** Un claim atómico sin red durante todo el proyecto de rediseño, detrás de una
suite verde. El contra-ejemplo también está: el Sprint 5.2 partió de una lista de huecos candidatos y la
verificación adversarial mostró que «**solo DOS son genuinos**» — sin ese censo se habrían escrito tests
redundantes creyendo que se cerraban huecos.

---

## M-12 · Cuándo un invariante ejecutable es obligatorio

**Texto propuesto**

> **La verificación de runtime muere con la sesión.** Toda garantía que un sprint **promete** y que hoy
> se verifica mirando la app o corriendo una corrida manual, **se convierte en invariante ejecutable**
> si es derivación pura. El invariante corre en CI para siempre; la corrida de runtime no vuelve.
>
> Tres propiedades que lo hacen barato, y que hay que preservar como restricción de arquitectura:
> 1. El módulo de dominio se mantiene **sin Prisma y sin alias `@/`** (imports relativos), para que el
>    harness liviano lo cargue sin base de datos ni resolución de paths.
> 2. Si el write es impuro y no se puede importar, se prueban **las piezas puras que compone** (el
>    filtro de ownership, el schema de parseo, el payload reconstruido).
> 3. Los fixtures se **derivan del código vivo** (mapear la lista de checks vigente), nunca de etiquetas
>    hardcodeadas: así el invariante sigue teniendo dientes cuando la lista cambie.

**Dónde va.** Manual de Flujo — testing / recursos. Es una regla que este repo ya practica y que
conviene que el método haga explícita.

**Por qué.** L-10. La fórmula está en las cabeceras de los propios invariantes: «verifica, de forma
ejecutable (**no "es obvio" y no efímero como la verificación en runtime**)»
(`particion.invariant.ts:6-7`). Sprint 6.1 lo dice como decisión: «Es una guardia **PERMANENTE**, no una
corrida de runtime que se pierde (la bitácora previa criticó explícitamente verificar "solo en runtime"
sin guardia)» (bitácora:1037). Las tres propiedades están documentadas en `flow.ts:18`, `manual.ts:18`,
`progreso-isolation.invariant.ts:6-12` y `self-check-gate.invariant.ts:14-16`.

**Qué costó no tenerlo.** Nada: es el activo. Se propone escribirlo **porque** funcionó — el cierre del
proyecto (`REGRESION-FINAL-2026-07.md`) pudo probar que las 5 invariantes sensibles eran
**byte-idénticas** desde antes de la ventana de cambios. Eso es evidencia de git, no confianza.

---

# EJE 4 — Cierre de sprint

## M-13 · Se commitea lo colateral, en el momento

**Texto propuesto**

> **Nada queda en el working tree.** Al cerrar, se commitea el trabajo del sprint **y lo colateral**
> (fixes de deuda ajena que hicieron falta, reconciliaciones, ajustes de tooling), cada cosa en su
> commit, con mensaje honesto sobre qué es y de dónde salió.
>
> Y la regla que la hace verificable: **si un cambio ajeno en el working tree es lo que sostiene tu
> verde, tu verde no es tuyo.** O se commitea (commit aparte, antes del tuyo, diciendo que es deuda
> ajena), o se reporta explícitamente que la verificación depende de trabajo no commiteado que puede
> desaparecer.

**Dónde va.** Cimiento de Chat — cierre de sprint. Complementa el «After: report modified/created files»
del sprint protocol de `CLAUDE.md`.

**Por qué.** L-02. El fix de copy de `01-flow.spec.ts:229` lo aplicó una sesión paralela en el working
tree; **2.2 y 2.3 lo vieron, lo dejaron fuera del stage por ajeno, y nunca se commiteó**. La Fase 0 de
3.1 lo encontró perdido: «HEAD volvió a tener la copy vieja… `test:setter` lo confirmó rojo (B6)»
(bitácora:1384) y tuvo que rehacerlo (`b468ec6`) antes de empezar su propio trabajo.

**Qué costó no tenerlo.** Dos sprints (2.2, 2.3) reportaron verdes que dependían de un cambio
fantasma — el 2.2 lo dice sin advertirlo: «el rojo pre-existente ya NO aparece — otra sesión en paralelo
corrigió esa copy **en el working tree**» (bitácora:1335). Y un tercer sprint arrancó con deuda ajena.
La versión buena del mismo patrón también existe: el sprint 2.3 resolvió «el catch-up de commits
pendientes (**seis sprints previos sin commitear**) con un commit aparte antes de arrancar»
(bitácora:713) — pero seis sprints es demasiado tarde.

---

## M-14 · La prueba de inocuidad

**Texto propuesto**

> **Trabajo read-only ⇒ prueba de inocuidad.** Toda sesión que promete no tocar código (auditoría,
> probe, forense, documentación) cierra con el **baseline** y el **status final** de
> `git status --porcelain` pegados enteros, y una línea de delta:
>
> > *Delta de esta sesión: exactamente `<lista>`.* Todo el resto del churn es de `<lane/sesión>`,
> > nombrado, cero solapamiento con archivos de `<mi scope>`.
>
> Cuando el scope prohíbe tocar una carpeta, se verifica con `git diff --stat` **antes del último
> commit**, no de memoria.

**Dónde va.** Manual de Flujo — registros / formato de cierre de auditoría.

**Por qué.** L-20. El anexo de `AUDITORIA-CIERRE-2026-07.md:270-333` lo hace textualmente, con los dos
`git status` completos y el delta acotado a las dos escrituras autorizadas. Los sprints que prometían
"motor intacto" lo probaron igual: «`git diff -- src/lib/leados/dossier.ts` → **0 líneas** (motor
intacto, **confirmado con el comando, no solo de memoria**)» (bitácora:1475, sprint 3.3).

**Qué costó no tenerlo.** Nada — se propone porque funcionó. Su valor se ve al leer la auditoría meses
después: el árbol estaba sucio de otro lane al arrancar, y sin el anexo sería imposible saber qué
escribió la auditoría y qué no.

---

## M-15 · El ID de la ficha viaja en el commit

**Texto propuesto**

> **Trazabilidad backlog → commit.** El mensaje de commit de un sprint que ejecuta una ficha de backlog
> **incluye el ID de la ficha** entre paréntesis. La cadena informe → ficha → commit → bitácora tiene
> que poder recorrerse con un `grep`.
>
> Y del otro lado: lo que queda **fuera de scope** se anota con `archivo:línea` + qué habría que hacer +
> criterio de éxito, no con «queda pendiente mejorar X». Un pendiente sin ubicación no es ejecutable por
> nadie más que el que lo escribió.

**Dónde va.** Manual de Flujo — registros y vocabulario (formato de commit y de "fuera de scope").

**Por qué.** L-19. La práctica ya existe y es el activo del proyecto: los mensajes de commit llevan la
ficha (`sprint 2.1 … (B-01/C-02/C-11)`, `sprint 2.3 … (B-02/C-03/C-17)`, `sprint 4.1 …
(B-08/C-10/C-12/C-13/C-23)`, `sprint 6.1 … (B-05/PR-2)`). El Sprint 7.0 aplicó **2** de 41 hallazgos y
dejó **39 documentados con archivo:línea y severidad** en un informe (bitácora:1105), lo que después
permitió que la auditoría de cierre los consolidara en fichas ejecutables «escritas para ejecutarse en
conversaciones futuras con modelos más baratos: la inferencia cara ya está hecha acá»
(AUDITORIA-CIERRE:3).

**Qué costó no tenerlo.** El contra-ejemplo es el punto: el barrido de vocabulario del Sprint 1.1 quedó
absorbido en un commit **con el mensaje de otro lane** (`44e25be`, «fix(isolation): re-parenting de
CrmSyncAttempt»). Con el mensaje mintiendo sobre el contenido, ninguna búsqueda podía encontrarlo — hizo
falta comparar diffs a mano para descubrir qué era ese commit.

---

# EJE 5 — Anti-patrones nuevos (para el Manual)

## M-16 · Siete anti-patrones a incorporar

**Texto propuesto** *(cada entrada: nombre · síntoma · qué hacer en su lugar)*

> **AP-1 · El verde de segunda mano.**
> *Síntoma:* la suite pasa porque un cambio no commiteado (propio o ajeno) está en el working tree.
> *En su lugar:* commitear lo colateral (M-13) o declarar de qué depende el verde.
>
> **AP-2 · El build viejo servido como si fuera nuevo.**
> *Síntoma:* un spec nuevo falla con el cambio real aplicado; el server de QA levanta el bundle
> anterior. Se manifiesta como **falso rojo**, que es peor que un falso verde porque manda a "arreglar"
> código que ya está bien.
> *En su lugar:* el entorno de verificación garantiza que sirve el código de ahora. Un falso rojo
> repetido dos veces se arregla en el harness, no en la memoria del que verifica.
>
> **AP-3 · El flake archivado.**
> *Síntoma:* «flake de infra local, pasa en aislado» como conclusión, repetida en cierres sucesivos.
> *En su lugar:* medir (N corridas aisladas, tasa real), buscar la causa en la evidencia del runner, y
> re-medir después del fix. Si no reproduce, se dice "no reprodujo, sin tocar". «Flake de infra» es una
> conclusión que se gana con evidencia, no un archivo donde guardar rojos.
>
> **AP-4 · El pendiente que se anota tres veces.**
> *Síntoma:* el mismo ítem aparece en la sección "fuera de scope" de tres cierres consecutivos.
> *En su lugar:* a la tercera deja de ser pendiente: o es un sprint, o es una decisión explícita de no
> hacerlo. (Ver también M-21.)
>
> **AP-5 · El vocabulario que sobrevive a lo que nombraba.**
> *Síntoma:* se retira una superficie y su numeración, sus nombres de pasos, sus mensajes de error y sus
> nombres de tipos siguen vivos en el copy y en el código.
> *En su lugar:* el sprint del retiro incluye el censo por grep del vocabulario y declara el diccionario
> canónico de reemplazo. Si el barrido no entra, sale como sprint inmediatamente siguiente.
>
> **AP-6 · La fixture compartida como estado confiable.**
> *Síntoma:* un test o una verificación asume el estado canónico de un seed que viven varias sesiones.
> *En su lugar:* el test durable se auto-provisiona (crea sus propios datos namespaced) y limpia por id
> exacto. Tocar una fixture compartida es con backup+restore declarado en el cierre.
>
> **AP-7 · La obediencia literal a una instrucción desfasada.**
> *Síntoma:* la ficha dice `archivo:línea` y ahí hay otra cosa; o el pedido, ejecutado tal cual,
> contradice lo que el código hace por diseño.
> *En su lugar:* se mapea el terreno real antes de tocar; se cumple el **intent** por el camino más
> angosto; y se documenta **en el código** por qué la letra no se siguió. (Ver M-18.)

**Dónde va.** Manual de Flujo — sección de anti-patrones.

**Por qué y qué costó.** AP-1 → L-02 (el fix perdido dos veces, `b468ec6`). AP-2 → L-04 (2.2, 3.2, 3.3
→ `178c4d7`: tres sprints con una corrida falsa cada uno). AP-3 → L-16 (F4 fallaba **3 de 6** y se
archivó como flake durante sprints, hasta que 3.4d encontró que **dos botones compartían
`aria-label="Cerrar menú"`** y el `.first()` agarraba el scrim; `.last()` → 5/5 verde). AP-4 → L-14
(`.last-run.json`, 16 anotaciones, 12 días). AP-5 → L-13 («Paso N» como hallazgo severidad 4 en la
auditoría de cierre, seis días después del retiro del wizard). AP-6 → L-15 («el QA-W Construccion
arrastraba `progresoJson` de 5 fases de una sesión previa», bitácora:940). AP-7 → L-12 (el pedido de
agregar `selfCheckJson` a `ESCALADO_RESET`, que habría roto el panel de revisión del admin **en cada
revisión normal**).

---

# EJE 6 — El código como fuente de decisiones

## M-17 · El comentario de decisión es fuente, y se lee antes de tocar

**Texto propuesto**

> **Los comentarios de decisión son fuente primaria.** Al entrar a una zona, se leen **a la par del
> backlog**, no después. Se los reconoce por su forma: dicen qué se decidió, qué se descartó y **por
> qué**, no qué hace el código.
>
> Censo rápido al entrar a una zona (adaptar los términos al proyecto):
> `a propósito` · `deliberad` · `intencional` · `decisión` · `precedente` · `NO se toca` · `línea roja` ·
> `no confía en la UI` · `anti-regresión` · referencias a secciones del brief (`§`).
>
> Y la contraparte obligatoria: **al cambiar el comportamiento que un comentario describe, el comentario
> se actualiza en el mismo commit.** Un comentario stale es peor que ninguno: se lee con la autoridad de
> una decisión y afirma lo contrario de la verdad.

**Dónde va.** Cimiento de Chat — ritual de arranque (lectura de scope) + Manual de Flujo (el censo como
recurso).

**Por qué.** L-17. El censo sobre `src/lib/leados/` y `src/app/(protected)/setter/` da ~60 hits, y los
densos contienen decisiones que **no están en ningún otro lado**: por qué el reset del re-loop no va en
el reset global (`escalamiento.ts:71-79`), por qué una rama sigue llamando a un gate directo en vez de
re-basarse (`manual.ts:470-479`), el estado uno por uno de los 6 hard-blocks con el motivo de cada
no-mapeo (`prompts-disenio.ts:119-137`), las reglas no negociables de un mapa de errores
(`error-copy.ts:8-17`), y hasta la constancia de una **ausencia** de decisión (`copy-blocks.ts:184-187`:
se verificó por grep de código y bitácora que la exclusividad al Evaluador **no** era intencional).

**Qué costó no tenerlo.** El comentario stale: `m-construccion.tsx:106` siguió diciendo «el tilde NO se
bloquea, §6-3» **después** de que el sprint 3.3 lo deshabilitara fuera de CONSTRUCCION. El propio 3.3 lo
detectó, no lo tocó por disciplina de scope y lo flagueó (bitácora:1462); 3.4b (`600cfdc`) lo arregló en
un commit de una línea. En esa ventana, quien leyera el archivo leía lo contrario de la verdad.

---

## M-18 · Qué hacer cuando el código contradice el backlog

**Texto propuesto**

> **Contradicción código ↔ ficha.** Cuando un comentario de decisión contradice lo que pide una ficha
> vieja:
>
> 1. **Gana el código**, hasta que se pruebe lo contrario: el comentario se escribió con el terreno a la
>    vista; la ficha, antes.
> 2. Se **verifica** la contradicción (¿el comentario sigue describiendo el código? ¿la ficha se refiere
>    a este mismo caso?), porque también existe el comentario stale (M-17).
> 3. Se cumple el **intent** de la ficha por el camino más angosto que no contradiga la decisión
>    documentada — no la letra.
> 4. Se **reporta la contradicción** al humano con las dos citas (`archivo:línea` del comentario, ID de
>    la ficha), aunque el sprint haya podido seguir.
> 5. Se deja escrito **en el código** por qué la letra no se siguió.
>
> Las referencias `archivo:línea` de un backlog **envejecen**: se re-verifican antes de usarlas como mapa.
> Si no matchean, se mapea el terreno real y se reporta el desfase; nunca se toca "la línea que dice la
> ficha" sin mirar qué hay ahí.

**Dónde va.** Cimiento de Chat — cómo se ejecuta una ficha / reglas de scope.

**Por qué.** L-12. Cuatro casos: B6.2 (el pedido literal habría borrado el self-check en
`CONSTRUCCION→EN_REVISION`, donde el admin lo lee — `escalamiento.ts:71-75`); 4·B (mapeó 1 de 6 y
documentó el porqué de cada no-mapeo en vez de forzar el 1:1); B6.5 item 2 (el pedido asumía un techo de
3/6, el real era 1/6 → **sin cambio de código**, con la razón escrita); y sprint 2.1: «**Auditoría
desfasada.** Las line-refs del brief NO matcheaban: esas líneas son RESPONDIO/`postergarLead`»
(bitácora:1298).

**Qué costó no tenerlo.** Cero en los cuatro casos, **porque se leyó antes de obedecer**. Se propone
escribirlo para que esa lectura no dependa del criterio de cada sesión. El contrafáctico de B6.2 es
concreto y grande: el panel de revisión del admin habría reportado el self-check como anomalía en cada
revisión normal.

---

## M-19 · Una regla tiene dos puntas

**Texto propuesto**

> **Las dos puntas.** Cuando un comentario del código invoca una regla de un documento («decisión
> cerrada · X.md»), esa regla tiene que **existir en el documento y cubrir ese caso**. Si el documento
> no clasifica la superficie de la que habla el comentario, la sesión que lo descubre **propone la
> clasificación** en vez de asumirla, y lo reporta como contradicción abierta.
>
> Una regla escrita en un solo lado es una regla a medias: la próxima sesión va a tener que re-decidir
> algo que alguien ya decidió, sin saber cuál de las dos fuentes manda.

**Dónde va.** Manual de Flujo — vocabulario y registros (coherencia doc ↔ código).

**Por qué.** L-18. `setter-nav.tsx:38` afirma «Navegación SOLO por `triggerTransition` (**decisión
cerrada · CLAUDE.md**)», pero `CLAUDE.md` dice que `triggerTransition()` **no aplica en portales** y no
clasifica `/setter/*` ni como sitio público ni como portal. La auditoría de cierre lo registró (C-26:
«comentario que cita una regla de CLAUDE.md que el CLAUDE.md contradice — **alinear una de las dos
puntas**») y **sigue abierto**.

**Qué costó no tenerlo.** Todavía nada — es material de decisión-tomada-dos-veces esperando ocurrir. Es
el cambio más barato de toda esta propuesta: alcanza con que `CLAUDE.md` diga a qué rama pertenece
`/setter/*`.

---

# EJE 7 — Descubierto: efectos de segundo orden e higiene

## M-20 · Tocar el harness cambia el presupuesto de todo lo que lo usa

**Texto propuesto**

> **Efectos de segundo orden.** Un fix a la infraestructura (script de arranque, entorno de QA, comando
> de build) cambia el **presupuesto de tiempo, memoria y recursos** de todo lo que lo invoca. Al tocar
> el harness:
>
> 1. **Censar quién lo invoca** (configs de test, CI, scripts hermanos, hooks).
> 2. Revisar sus **límites**: timeouts, locks, puertos, caches, reuso de servidores.
> 3. **Nombrar el fix anterior** en el mensaje del commit del arreglo derivado, para que la cadena sea
>    reconstruible por quien lea el log meses después.
>
> Ojo con el modo de falla: el segundo bug suele **no parecerse a su causa**. Un fix de higiene en un
> script de arranque se manifiesta como "el server tarda", que es exactamente el diagnóstico que AP-3
> dice no aceptar sin evidencia.

**Dónde va.** Manual de Flujo — recursos / harness. Eje no listado en el encargo, descubierto en la
evidencia.

**Por qué.** L-11. `178c4d7` (sprint 3.4c) encadenó `npm run build &&` a `start:qa` para matar el falso
rojo de AP-2 — correcto y bien justificado. Horas después, `fccbeb7` (micro 4.0): «webServer timeout
cubre el build encadenado de `start:qa`», `playwright.setter.config.ts` `timeout: 120_000 → 300_000`. El
`webServer` le daba 2 minutos a `start:qa` para responder; con el build adentro, ya no alcanzaban.

**Qué costó no tenerlo.** Un micro-sprint — barato porque el fallo fue determinístico. Si el timeout
hubiera empezado a fallar de forma intermitente en vez de siempre, habría entrado al saco de los flakes
de infra (AP-3) y se hubiera quedado ahí.

---

## M-21 · La regla de las dos apariciones

**Texto propuesto**

> **Dos apariciones y se arregla.** Si un ítem de higiene aparece en **dos Fase 0 seguidas** como "ruido
> conocido", se arregla en la segunda. Anotarlo por tercera vez cuesta más que la línea que lo elimina.
>
> El motivo no es prolijidad, es señal: la Fase 0 tiene que poder decir «árbol limpio» o listar cosas
> que **importan**. Cuando "sucio con `<ruido>`" es lo normal, un archivo ajeno de verdad se camufla ahí
> y el chequeo de terreno deja de servir para lo que existe.

**Dónde va.** Cimiento de Chat — ritual de arranque (Fase 0) y cierre. Emparejado con AP-4.

**Por qué.** L-14. `.last-run.json` se anotó **16 veces** en la bitácora como "fuera del commit, ruido
pre-existente" entre el 2026-07-03 y el 2026-07-15, cuando una línea de `.gitignore`
(`**/.last-run.json`, commit `b717014`) lo resolvió — y la puso un commit de **otro lane**, no un sprint
de LeadOS. Mismo patrón con `docs/proof-screenshots/`: se gitignoró recién cuando ya eran **159 MB** de
PNGs (bitácora:713).

**Qué costó no tenerlo.** Diez Fase 0 distinguiendo ruido de señal a mano, diez cierres explicando por
qué el árbol no estaba limpio, y —lo más caro— la degradación de la señal: en los sprints 2.2/2.3, un
archivo ajeno **que sí importaba** (el fix de `01-flow.spec.ts`) convivió en ese mismo listado de "sucio
conocido" y se perdió (M-13).

---

# Cierre: qué NO se propone

Tres cosas que la evidencia **no** sostiene, y que conviene dejar dichas para que nadie las derive de
acá más adelante:

1. **No se propone la regla «cuando un sprint frena, los siguientes del bloque no deben correrse igual»**
   en su forma literal. El repo muestra lo contrario: las dependencias se declaran («B-04 **DEPENDE de**
   B-01») y se respetan (`aed017e` → `7425d2b`). Lo que sí sostiene la evidencia es más chico y va como
   nota en M-03: *un hueco en la cadena de continuidad se reporta y se sigue con el hueco a la vista, no
   se rellena con una suposición* — Sprint 6.0: «**no existe commit "sprint 5.2"** en `main` (numeración
   no contigua; **se reporta, no se inventa**)» (bitácora:1615).

2. **No se propone automatizar la verificación perceptual.** El proyecto la difirió una decena de veces
   y la solución que funcionó fue **agendarla con el humano** (7.1, `c82ff48`), no reemplazarla. Está en
   línea con los guardarraíles que el propio proyecto se dio («no automatizar el ojo»).

3. **No se propone endurecer el reporte de cierre más allá de M-05/M-14.** Los cierres de este proyecto
   ya son largos y detallados, y esa es su virtud: cada uno se puede releer meses después y reconstruir
   qué se verificó, qué no y por qué. El problema nunca fue la extensión del reporte — fue que algunas
   cosas que estaban en el reporte no estaban en el **commit** (M-13).

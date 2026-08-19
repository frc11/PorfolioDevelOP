# S4 — Rig de coreografía · Escena 3D del home develOP

- **Fecha:** 2026-08-19 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S4-rig.md` · **Extiende:** `docs/rediseno/outputs/PROBE-ESCENA.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 sobre `src/app/probe-escena`. **Sin dev server, sin navegador y sin capturas: fue el pedido. El juicio del movimiento es del humano — este reporte no dice que la escena se vea bien.**

---

## 1 · Qué se construyó

El **rig de coreografía**: la cámara recorriendo una secuencia de posiciones ligada a un progreso 0→1, con inercia y offset de mouse, sobre una escena enriquecida — y un **simulador** para calibrar ese movimiento sin depender todavía del scroll real ni del layout de las secciones.

**Todo sigue viviendo en `/probe-escena`. El home no se tocó**, ni un archivo frozen, ni la base de datos, ni se sumó una dependencia.

---

## 2 · Los keyframes

Viven en **`choreography.ts`**, un archivo de datos sin lógica: un array de poses, cada una con su punto en el progreso, su nombre legible, su curva de llegada y su modo de giro. Editarlo no obliga a leer una línea de código.

**8 pantallas de scroll → cada una vale 0,125 exacto**, y los seis tramos caen en múltiplos de esa fracción:

| Tramo | Pantallas | progreso |
|---|---|---|
| 1 Hero | 1 | 0,000 – 0,125 |
| 2 Quiénes somos (dos personas) | 2 | 0,125 – 0,375 |
| 3 Números | 1 | 0,375 – 0,500 |
| 4 Portfolio | 1 | 0,500 – 0,625 |
| 5 Demos | 1 | 0,625 – 0,750 |
| 6 Movimiento final + cierre | 2 | 0,750 – 1,000 |

### La tabla — 17 keyframes: 15 capturados + 2 derivados

| # | `at` | nombre | ang | alt | dist | fX | fY | luz | ease | origen |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,000 | entrada · mirada alta | 0,0 | 9,00 | 16,2 | 0,85 | 0,02 | 3,40 / 6500 | — | capturado |
| 2 | 0,125 | hero | 0,0 | −0,20 | 16,2 | 0,85 | 0,02 | 3,40 / 6500 | `arrive` | capturado |
| 3 | 0,250 | quiénes somos · persona 1 | 0,0 | 3,50 | 10,5 | −0,50 | −0,11 | 3,40 / 6500 | `shift` | capturado |
| **4** | **0,335** | **persona 2 · cruce (apex)** | 0,0 | **4,90** | **10,6** | **0,77** | **0,38** | 3,40 / 6500 | `linear` | **DERIVADO** |
| 5 | 0,375 | quiénes somos · persona 2 | 0,0 | 4,25 | 10,7 | 0,77 | −0,11 | 3,40 / 6500 | `shift` | capturado |
| **6** | **0,415** | **números · baja la altura** | 0,0 | **−0,30** | **10,7** | **0,42** | **−0,05** | 3,40 / 6500 | `linear` | **DERIVADO** |
| 7 | 0,450 | números · se aleja | 0,0 | −0,30 | 22,3 | 0,01 | 0,01 | 3,40 / 6500 | `shift` | capturado |
| 8 | 0,500 | números | 0,0 | 5,10 | 15,2 | 0,01 | 0,01 | 3,40 / 6500 | `shift` | capturado |
| 9 | 0,625 | portfolio | 39,5 | 5,65 | 6,3 | −1,00 | 0,10 | 3,40 / 6500 | `shift` | capturado |
| 10 | 0,660 | demos · giro ¼ | 113,5 | 4,25 | 6,3 | −1,00 | 0,10 | 3,40 / 6500 | `linear` | capturado |
| 11 | 0,675 | demos · giro ½ | 144,5 | −1,90 | 6,3 | −1,00 | 0,10 | 3,40 / 6500 | `linear` | capturado |
| 12 | 0,715 | demos · giro ¾ | 228,0 | −3,50 | 6,3 | −1,00 | 0,10 | 3,40 / 6500 | `linear` | capturado |
| 13 | 0,750 | demos | 302,0 | −2,70 | 7,7 | 1,00 | 0,10 | 3,40 / 6500 | `shift` | capturado |
| 14 | 0,792 | final · se levanta | 312,0 | 3,55 | 7,7 | 1,00 | 0,14 | 3,40 / 6500 | `shift` | capturado |
| 15 | 0,833 | final · gira | 347,0 | 3,55 | 7,7 | −0,02 | 0,00 | 3,40 / 6500 | `shift` | capturado |
| 16 | 0,875 | final · baja | 360,0 | −2,05 | 7,7 | −0,02 | 0,00 | 3,40 / 6500 | `shift` | capturado |
| 17 | 1,000 | cierre | 360,0 | 6,25 | 30,0 | −0,02 | 0,00 | **0,20 / 7850** | `arrive` | capturado |

**A las 15 posiciones capturadas no se les tocó un decimal.** Los `at` de los tres waypoints del giro están repartidos **proporcionales al ángulo** recorrido (74° / 31° / 83,5° / 74° sobre 262,5°) para que la vuelta sea de velocidad pareja y no lurchee.

### Los dos que se derivaron, y qué mirar para corregirlos

**#4 — el apex de la persona 2.** La descripción dice *"sube el vertical, sube el horizontal, y **luego** vuelve a bajar el vertical"*, y ese "luego" pide un intermedio que las capturas no tienen.

Hay una **ambigüedad real** que quedó a la vista en vez de resuelta en silencio: *"el vertical"* puede ser la **altura de cámara** o el **encuadre vertical**, y las dos capturas dicen cosas distintas — `frameY` vuelve exacto a −0,11 (la firma de "vuelve a bajar"), pero la altura sube neto 3,50 → 4,25. La solución hace **las dos**: suben y bajan la altura *y* el encuadre. Es una sola gesticulación coherente —la cámara se levanta y barre el logo en arco de izquierda a derecha, y después se asienta— y satisface las dos lecturas.

> Para quedarse con una: bajar `height` a `4.25` mata la excursión de altura; subir `frameY` a `-0.11` mata la del encuadre. Un número cada una.

**#6 — el descenso de Números.** *"reduce altura, aumenta distancia (**en ese orden, secuencial**)"*. Secuencial = un keyframe en el medio: la altura ya abajo en el −0,30 capturado, con la distancia todavía en el 10,7 que traía. El `frameX` se reacomoda a mitad de camino (0,42) y llega a cero en el #7. **Los dos valores de encuadre de ese keyframe son interpolación explícita, no dato.**

### Lo que NO se inventó

- **El resto de los tramos ya venía completo.** "todo al mismo tiempo" (persona 1), "un acercamiento diagonal" (portfolio) y "mientras baja la altura" (demos) son simultáneos por definición; "se levanta, gira un poco, baja, y se aleja" tiene exactamente cuatro transiciones capturadas.
- **La cola del cierre no tiene poses.** *"Después las letras se van, la cámara se mueve a otros ángulos y termina en el CTA final"* no tiene capturas y no se inventó. El track termina en #17; cuando se compongan esos ángulos, se agregan al array.

### Las curvas

`MOTION_EASE` entra por sus dos valores del sistema, sin inventar una tercera:

- **`arrive`** `[0.25, 0.46, 0.45, 0.94]` — la curva canónica de `CLAUDE.md` para lo que ENTRA. Reservada a las dos llegadas grandes: el hero y el cierre.
- **`shift`** `[0.4, 0, 0.2, 1]` — simétrica, ya en producción como `DOCK_EASE`. En las poses de destino de cada sección: entra y sale suave, así la sección "encastra".
- **`linear`** en los waypoints que viven **adentro** de una sola gesticulación (los tres del giro, los dos derivados). No es una curva nueva: es no aplicar ninguna. Con `shift` en cada uno, el giro sería un trinquete de cuatro frenadas. Es además la postura que el propio `tokens.ts` documenta para lo ligado a scroll — *"no necesitan una curva temporal: su forma la da el mapeo del rango"*.

El evaluador de bezier es propio (Newton-Raphson con bisección de respaldo, en `choreographySampler.ts`) y **corre una sola vez por frame**: los siete canales de un mismo segmento comparten el `t`.

---

## 3 · El tramo de 360°

**`angleDeg` no es un rumbo de brújula: es el ángulo acumulado.** Una vuelta entera se escribe como una diferencia de 360, no como un módulo.

1. **Al cargar el módulo** se precomputa una tabla de ángulos desenvueltos, una sola vez. Para cada par consecutivo se aplica `turn`: `'short'` (default, la regla del sprint) normaliza la diferencia a (−180°, 180°]; `'literal'` respeta la diferencia tal cual, valga las vueltas que valga.
2. **El muestreo es un lerp plano sobre esa tabla.** No hay acumulación por frame, así que no hay deriva: el ángulo en `at = 0,750` es exactamente 302,0 siempre, a cualquier framerate.
3. **La cámara usa el desenvuelto** (405° y 45° dan el mismo `sin`/`cos`); **el panel recibe el envuelto a 0–360**, que es donde vive el slider.
4. **Los cuatro keyframes del giro van marcados `turn: 'literal'`.** Con los ángulos de hoy `'short'` y `'literal'` dan idéntico —ningún salto entre keyframes consecutivos pasa de 180°—, así que **hoy la marca no cambia un píxel**. Está para que el giro sobreviva a que se editen los ángulos: el día que un keyframe diga 302 y el siguiente 30 queriendo seguir para adelante, `'short'` lo haría volver por donde vino.

La tabla desenvuelta resultante va **0 → 39,5 → 113,5 → 144,5 → 228 → 302 → 312 → 347 → 360**: la vuelta entera está en el dato, medida desde Números (ángulo 0) hasta el cierre.

**Efecto cosmético a saber:** el keyframe #17, documentado como 360°, se lee `0,0°` en el panel. Es la misma posición de cámara — el recorrido acumula la vuelta por dentro. Está anotado en la ayuda del propio panel.

---

## 4 · La física

Todo en `useFrame` con escritura directa a objetos de three. **Cero `setState` por frame** — lo único que sale del loop hacia React es el aviso de fin de reproducción, una vez por pasada.

**Inercia.** Persecución amortiguada **independiente del framerate**: `v += (objetivo − v)·(1 − e^(−dt/τ))`. Que sea exponencial en `dt` y no un lerp de coeficiente fijo es lo que hace que τ signifique lo mismo a 30 que a 144 fps. Constante de tiempo **por canal** (ángulo 0,28 s · altura 0,24 · distancia 0,26 · encuadre 0,20 · luz 0,35) más un multiplicador global con slider. Umbral de asentamiento por canal, porque una exponencial nunca llega y sin cortarla el store se escribiría eternamente con micras.

**Offset de mouse.** Modula **azimut ±2,2°** y **altura ±0,045 × distancia**. Es relativo de verdad: la altura se escala por la distancia para que el desplazamiento *en pantalla* sea el mismo a 6,3 que a 30. **No toca el encuadre**, así que la pose que se copia del panel sigue siendo la del track. El feed es `state.pointer` de r3f — **sin listener propio**, por la lección ya documentada: r3f v9 lo actualiza por su cuenta sobre la caja del canvas.

**Vira en reposo.** Balanceo del **logo** (yaw 1,15° / pitch 0,7°) con dos senos de período inconmensurable (13 y 9,5 s), así la combinación no se lee como un bucle. Se aplica a un `<group>` envolvente en `ProbeStage`: **`ProbeLogo.tsx` no se tocó.**

**`prefers-reduced-motion`.** Sin inercia, sin offset de mouse y sin vira: la cámara va directo a la pose del progreso. El panel lo dice y deshabilita el toggle de física.

**Lo que la física NO publica.** La inercia sí se escribe al store (es la posición real de la cámara), pero el mouse y la vira no: son modulación, no pose. Por eso la línea copiable es la pose limpia — la única que sirve para volver a pegarla como keyframe.

---

## 5 · La escena nueva

En el orden de prioridad del sprint. Todo pertenece al mismo mundo: nada orgánico, nada que brille por sí mismo, nada que compita con el logo.

### 1 · Softboxes flotantes — `Softboxes.tsx`

Tres paneles suspendidos, fijos al mundo. **Dos están en el azimut de las luces reales** (−48° el key, 146° el contraluz): la escena explica su propia iluminación, que es lo que un estudio deja ver.

Van con `meshStandardMaterial`, **no `basic`** — la regla es que nada se ilumine solo, y así además se apagan con la sala en el cierre. Lo que los hace "apenas más luminosos que el fondo" es el color (#FCFCFA contra #F7F7F5), no una emisión.

**La forma es la de un softbox de verdad: un marco con espesor y una tela en cada cara.** No es decoración, resuelve verlos por detrás: un plano brillante con otro más grande atrás funciona solo desde un lado — desde el otro el "marco" queda adelante y tapa el cuerpo. Con la cámara dando la vuelta entera, eso no era opcional.

> **9 draw calls · 48 triángulos. Fill negativo:** son opacos y tapan ciclorama, así que *restan* overdraw.

### 2 · Marcas de piso — `StudioFloor.tsx`

Las cuatro esquinas de registro pasaron a un set de **32 barras**: marco de encuadre interior (el de siempre), ticks a media cara, cruz de centro, dos cruces de registro en cuadrantes, marco exterior al doble de span y tres cintas de posición en T. Tres tonos por `instanceColor` — línea fina de registro, marco exterior que se va al fondo, y cinta más ancha y más oscura porque una cinta es cinta.

El marco exterior no es relleno: da una **segunda escala** de referencia, y con una sola la perspectiva se lee a una única distancia.

> **1 draw call — baja de 8 — · 384 triángulos.** El `computeBoundingSphere()` del `InstancedMesh` no es opcional: la esfera heredada de la geometría es la de una caja unitaria en el origen, y el frustum culling descartaría las 32 barras apenas el origen saliera de cuadro.

### 3 · Partículas en dos escalas — `BokehParticles.tsx`

Setenta discos grandes y **desenfocados**, fijos al mundo, cargados hacia la cámara (radio 4,2–30, exponente 0,85). El sprite difiere del de polvo en lo que importa: **meseta plana adentro y caída en el 55% exterior**, porque un lente desenfocado reparte la luz de un punto sobre un disco, no sobre una campana.

El §7.8 del reporte del probe anotaba como pendiente que *"a distancias cortas alguna partícula pasa a menos de dos unidades de la cámara y se lee como un disco grande"*. **Acá eso es el efecto, deliberado.**

**Preparado para color, sin implementarlo:** el atributo de color por vértice ya existe y hoy se llena con un solo `BOKEH_COLOR`. Teñir por partícula más adelante es escribir esos floats y marcar `needsUpdate` — sin tocar geometría, sin cambiar el material y sin un draw call más.

> **1 draw call · 70 puntos. Es el único costo de fill que esta escena suma** — sprites grandes con alfa. Con `BOKEH_R_MIN` 4,2 y `BOKEH_SIZE` 1,0, un sprite en el radio mínimo ocupa ~38% del alto del cuadro (~14% del área). Las dos perillas están expuestas.

### 4 · Ciclorama — `StudioFloor.tsx`

El disco plano de radio 110 se partió en **losa plana con espesor hasta radio 34** + **superficie de revolución** que curva hacia arriba desde ahí y sigue en pared. Se conservan las dos propiedades por las que el disco había reemplazado al cuadrado (sin esquinas que entren en cuadro, fondo idéntico en todos los ángulos) y se elimina la que sobraba: el borde duro.

**El arco arranca tangente al piso y termina vertical** — su centro está justo encima del punto de arranque, así que el radio ahí es vertical y la tangente horizontal. Empalme con normales coincidentes: costura invisible, sin solape y sin z-fighting.

**La altura de la pared salió de una cuenta, no de un ojo.** El peor caso del recorrido es el keyframe #12 (*demos · giro ¾*): cámara a altura −3,50 y distancia 6,3, **mirando hacia arriba** 29,05°. Con medio campo vertical de 17,5° el rayo superior del cuadro sale a **46,55°**, y para cuando llega al borde opuesto —82,3 unidades de distancia horizontal— va **87,7 unidades por encima del piso**. Con el disco de hoy, ahí se vería el vacío. Se verificó también el extremo del rango manual (altura −3,9 con distancia 6, y con encuadre al máximo a distancia 30): 100,0 y 79,3. La pared va a **150**, que en un lathe cuesta dos triángulos por segmento radial.

> **2 draw calls · ~4.800 triángulos. Fill igual al de hoy:** cubre la misma área de pantalla que cubría el disco.
>
> ⚠️ Queda en `DoubleSide` **a propósito y de forma provisoria**: el sentido de giro que `LatheGeometry` le da a las caras depende del orden del perfil, y este sprint no podía abrir un navegador para verificarlo. Con `FrontSide` mal elegido la superficie sería invisible. Confirmado en pantalla, pasarlo a `THREE.FrontSide` es una línea.

### 5 · Fragmentos del logo — `LogoFragments.tsx`

Tres arcos sueltos flotando lejos, muy tenues. **Es el único elemento que no podría estar en el estudio de otro** — todo lo demás es vocabulario genérico de un set.

**Los radios salen del propio SVG.** El `path` del logo está construido con dos arcos, de 153 y 257 unidades del viewBox de 1024; escalados por `PROBE_SVG_SCALE` dan 1,07 y 1,80 de mundo, y acá van amplificados 2,2× para leerse a la distancia a la que flotan. Por eso se leen como pedazos de la marca y no como anillos.

> **3 draw calls · ~2.600 triángulos. Fill ínfimo.**

### Logo más grueso

`PROBE_EXTRUDE_DEPTH` de **15 → 78**.

| | antes | ahora |
|---|---:|---:|
| profundidad (viewBox 1024) | 15 | **78** |
| espesor de mundo | 0,119 | **0,560** |
| espesor / ancho (6,86) | 1,73% | **8,16%** |

El §5 del reporte del probe identificó la banda **7–10%** como la que da "un canto que se lee de perfil"; 8,16% cae en el medio. **Cuesta cero triángulos**: la profundidad de una extrusión es una traslación de la tapa trasera — los triángulos los ponen `bevelSegments` y los puntos del contorno, y ninguno se tocó. El espesor real se sigue publicando en pantalla, así que el número está a la vista mientras se juzga.

---

## 6 · El simulador — cómo se usa

`npm run dev` → `http://localhost:3000/probe-escena`. El panel arriba a la izquierda arranca en **modo coreografía**.

### Modo coreografía

| Control | Qué hace |
|---|---|
| **progreso del recorrido** | 0→1 sobre toda la coreografía. Arrastrarlo corta la reproducción |
| **tramo / keyframe** | Lectura viva: en qué tramo está y cuál es el keyframe más cercano, **por nombre**, con su `at` y una marca `· derivado` en los dos inventados |
| **reproducir el recorrido** | Recorre solo. Apretarlo con el recorrido terminado lo reinicia |
| **velocidad** | Progreso por segundo. 0,07 (el default) = pasada completa en ~14 s |
| **física** | Inercia + mouse + vira. **Apagarlo deja ver el track crudo**, que es como se juzga si un keyframe está bien puesto sin que la amortiguación lo disimule |
| **inercia** | Multiplicador global de la amortiguación. Llega a 3× para poder exagerarla y *verla*: en 1 es correcta pero sutil, y un parámetro que no se percibe no se puede ajustar. En 0 no hay inercia |
| **mouse** | Magnitud del offset de puntero. En 0 se apaga |

**Los siete sliders de escena quedan deshabilitados pero vivos como telemetría**: muestran lo que el track dicta en cada frame. Ese es el flujo de calibración — scrubear hasta un momento, leer la pose y apretar **copiar**, que deja la línea lista para pegar en `choreography.ts`. `partículas dibujadas` sigue habilitado, porque no es parte del recorrido.

### Modo manual

**Exactamente el probe de siempre**, sin una diferencia: los sliders mandan, la órbita automática vuelve a aparecer, y no hay inercia, ni mouse, ni vira. Es lo que permite seguir componiendo posiciones nuevas con precisión, y lo que hace que las mediciones ya publicadas sigan valiendo.

Cambiar de modo **desliza en vez de saltar**: la pose amortiguada arranca desde donde estaban los sliders. El ángulo se siembra con la representación más cercana al objetivo, porque copiar un 0 envuelto contra un objetivo de 360 mandaría a la cámara a dar una vuelta entera para llegar al mismo lugar.

---

## 7 · Peso — medido, no estimado

**Cómo se midió, sin navegador.** `next build --webpack` con `E2E_DIST_DIR=.next-probe`, y después el grupo de chunks del canvas leído del **`react-loadable-manifest.json`** del propio build — o sea la lista que webpack declara para el `dynamic(() => import('./ProbeStage'))`, no una elección a ojo. Cada archivo se comprime con `gzip -9`, que es lo que `next start` hace al servirlos.

**El método está calibrado contra el reporte anterior**, que midió con navegador (`encodedBodySize`): las filas de `three`, `fiber` y `three-stdlib` dan **exactamente los mismos bytes minificados** que la tabla del §3 de PROBE-ESCENA (363,5 + 341,2 = 704,7 · 143,0 · 21,6). Las décimas de diferencia en gzip son nivel de compresión, no contenido.

| chunk | qué es | minificado | sobre la red |
|---|---|---:|---:|
| `bd904a5c` | three (geometrías: Extrude, **Lathe, Torus, Plane**) | 363,5 KiB | 97,4 KiB |
| `b536a0f1` | three (WebGLRenderer) | 341,2 KiB | 82,9 KiB |
| `b79b7286` | `@react-three/fiber` | 143,0 KiB | 45,2 KiB |
| `7545` | `three-stdlib` / SVGLoader | 21,6 KiB | 7,7 KiB |
| `4857` | resto del grupo del canvas | 13,2 KiB | 5,2 KiB |
| **`2253`** | **el probe: coreografía + escena — todo lo de S4** | **13,2 KiB** | **5,0 KiB** |
| `logodevelOP.svg` | el único activo de la escena | 0,6 KiB | 0,6 KiB |
| **TOTAL** | | **896,3 KiB** | **243,9 KiB** |
| *baseline (PROBE-ESCENA §3)* | | *888,2 KiB* | *241,9 KiB* |
| **DELTA** | | **+8,1 KiB** | **+2,0 KiB** |

### **241,9 → 243,9 KiB. +0,8%.**

Y el detalle que importa más que el total:

> **Las cuatro clases de three que S4 introduce —`LatheGeometry`, `TorusGeometry`, `PlaneGeometry` e `InstancedMesh`— cuestan CERO bytes.** Los chunks de `three` salieron **byte por byte idénticos** al baseline: ya estaban en el bundle, porque el índice ESM de `three` re-exporta todo y webpack no puede podarlo acá. El ciclorama, los softboxes, las marcas instanciadas y los arcos no pagaron un solo byte de librería.

**Los 8,1 KiB son todos míos**, y están todos en un chunk: `2253` pasó de ~5,1 a 13,2 KiB minificados (de ~2,3 a 5,0 sobre la red). Ahí adentro están los 17 keyframes, el sampler, el rig, las cinco piezas nuevas de escena y los dos paneles de control.

**Lo que no cambia** sigue sin cambiar: `three` + `fiber` son ~226 KiB sobre la red y eso lo paga cualquier escena 3D. Contra el hero actual —**1.900,5 KiB**, de los cuales 1,6 MiB son el HDRI que no se comprime— la escena mate sigue pesando **−87%**.

---

## 8 · Frame time

**No se puede medir bajo las reglas de este sprint: necesita navegador.** Lo que sí se puede decir, con números y no con impresiones:

### El gasto nuevo más grande — y el primer candidato a apagar

> ⚠️ **`VIRA_UPDATES_SHADOW`** (`choreography.ts`)

Hoy el shadow map se calcula **una vez y nunca más** (`gl.shadowMap.autoUpdate = false`): con la luz fija al mundo y el objeto quieto, el mapa de profundidad es idéntico frame a frame. **Que la cámara se mueva no lo invalida** — una luz direccional solo depende de la luz y de quién proyecta, así que toda la coreografía es gratis para la sombra.

**Lo que sí lo invalida es la vira, porque mueve al que proyecta.** Con el mapa congelado, la sombra se queda desfasada del objeto que se balancea. Así que la vira obliga a **una pasada de render de sombra completa por frame, con mapa de 2048²**. Es exactamente el gasto que el §7.4 del reporte del probe anticipó.

`VIRA_UPDATES_SHADOW = false` acepta la sombra estática y recupera esa pasada. El balanceo es de ~1°, así que el desfase es chico: **es un intercambio real y está a un booleano de distancia.** Es lo primero que hay que probar si mobile no cierra.

### La contabilidad estática

| | antes de S4 | después |
|---|---:|---:|
| draw calls | ~11 | ~15 |
| marcas de piso | 8 draw calls | **1** |
| triángulos nuevos | — | ~7.800 |
| superficies de overdraw nuevas | — | **1** (los 70 sprites de bokeh) |
| pasadas de shadow map por frame | 0 (una total) | **1** mientras la vira corre |

El probe midió la escena como **fill-rate bound, no geometry bound**, con ~10× de margen en desktop (1,35 ms de frame contra los 13,3 ms de un cuadro de 75 Hz). Los ~7.800 triángulos nuevos caen del lado que sobraba. Lo que hay que vigilar son las dos cosas de la columna derecha: el overdraw del bokeh y la pasada de sombra.

**El FPS sigue publicándose en pantalla**, promediado a medio segundo y medido sin `setState` por frame — o sea sin que el instrumento se sabotee a sí mismo.

**Nada de esto vale para mobile.** Sigue sin medirse un solo teléfono, y es donde el fill rate es el recurso escaso.

---

## 9 · Lo que queda para calibrar

En el orden en que conviene tocarlo:

1. **🔴 La pose de cada tramo cae en su BORDE, no se sostiene.** Con este reparto el hero queda perfectamente encuadrado en el instante en que se lo deja de ver — o sea que el contenido se lee mientras la cámara ya se fue. **Es lo primero que hay que ajustar con el simulador.** Se arregla duplicando el keyframe con otro `at` (uno para llegar, otro para sostener): es una edición de datos, sin lógica. No se hizo acá porque se calibra mirando, no calculando.
2. **El keyframe #1 es lo que se ve al aterrizar**: altura 9,00, casi desde arriba, y el descenso al hero se come la primera pantalla entera. Es lo que dicen las palabras y la captura, pero conviene mirarlo temprano.
3. **El giro de Demos son 262° en una sola pantalla.** A la velocidad default eso es ~147 °/s, contra los 24 °/s de la órbita automática del probe. Si se siente latigazo, la salida es repartirlo hacia Portfolio y Movimiento final: ediciones de la columna `at`.
4. **La ambigüedad del #4** (§2), si al mirarlo queda claro cuál de las dos excursiones sobra.
5. **`DoubleSide` del ciclorama** → `FrontSide`, una vez confirmado que la superficie se ve.
6. **`VIRA_UPDATES_SHADOW`**, cuando haya medición en un teléfono real.

### Lo que este sprint dejó explícitamente afuera

- **La cola del cierre** (letras que se van, otros ángulos, CTA final): no hay poses capturadas.
- **La conexión al scroll real y al contenido de las secciones**: es el sprint siguiente.
- **Los siete pendientes del §7 del reporte del probe** que no eran de este sprint: encuadre por relación de aspecto (el *width-fit* que falta en mobile), gate de render con `frameloop='demand'`, estado de entrada después del preloader, fallback 2D, decisión de `antialias`, y la medición en un teléfono.

---

## 10 · Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                → exit 0
.\node_modules\.bin\eslint.cmd src/app/probe-escena → exit 0
next build --webpack (E2E_DIST_DIR=.next-probe)     → exit 0
```

**Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido del sprint.** La verificación visual la hace el humano, y el juicio del movimiento también.

### Una trampa que apareció y conviene anotar

El primer `next build` **murió por heap** (`FATAL ERROR: Reached heap limit`, 2.025 MB) sin que hubiera nada mal en el código: la máquina tenía 1,8 GB físicos libres de 14,2 GB y el límite de heap que Node se autoasigna había quedado en **2.240 MB**. Se resolvió con `NODE_OPTIONS=--max-old-space-size=4608`. Vale la pena tenerlo a mano: el síntoma es un build que muere en "Creating an optimized production build" a los ~90 s, y no tiene nada que ver con lo que se compiló.

`.next-probe/` estaba ya en `.gitignore` y en `tsconfig.json` desde el sprint anterior — **y se verificó con `git check-ignore` ANTES de correr el build**, por la lección del `distDir` intruso. Detalle a saber: `git check-ignore .next-probe` responde "no ignorado" mientras el directorio **no exista**, porque el patrón `/.next-probe/` lleva barra final y solo matchea directorios. Hay que crear el directorio primero y recién ahí preguntar.

---

## 11 · Archivos

### Nuevos

```
src/app/probe-escena/_components/
  choreography.ts            LOS DATOS: keyframes, tramos y parámetros de física. Sin lógica.
  choreographySampler.ts     La matemática: bezier, desenvuelto del ángulo, muestreo, damping. Puro.
  Softboxes.tsx              Los tres paneles suspendidos
  LogoFragments.tsx          Los tres arcos sueltos de la marca
  BokehParticles.tsx         La segunda escala de partículas, desenfocada
  StoreSlider.tsx            Slider atado a un store, sin `setState` (lo comparten los dos paneles)
  ProbeReadout.tsx           La línea copiable + fps + caja (extraído de ProbeControls)
  ChoreographyControls.tsx   Progreso, reproducción, velocidad, física y lectura del tramo
docs/rediseno/outputs/S4-RIG.md
```

### Modificados

```
src/app/probe-escena/_components/
  probeStore.ts       + setMany (una notificación para los siete canales), + store del rig,
                      + specs de presentación compartidas
  probeScene.ts       + ciclorama, marcas, softboxes, bokeh, fragmentos; depth 15 → 78
  StudioFloor.tsx     disco → ciclorama; 8 mallas de marcas → 1 instanced de 32
  OrbitRig.tsx        + coreografía, inercia, mouse, vira, modos
  ProbeStage.tsx      + los componentes nuevos, + el grupo que balancea el logo
  ProbeControls.tsx   + modo, + los paneles extraídos
  ProbeEscena.tsx     + store del rig, + estado de modo/reproducción/física, + reduced motion
```

### Intocados

`ProbeLogo.tsx` y `DepthParticles.tsx` del propio probe. El home entero. Los frozen: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. De `logo-footprint.ts` solo se lee `LOGO_BOX_WORLD`, como antes.

**El probe importa exactamente tres cosas de afuera de su carpeta** —`MOTION_EASE` de los tokens de motion, `useReducedMotion` y `LOGO_BOX_WORLD`— y **nada del repo lo importa a él**, salvo la línea de `publicRoute.ts` que ya venía del sprint anterior.

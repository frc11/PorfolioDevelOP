# S8c — Corrección de la secuencia del preloader

> Continuación directa de S8 y S8b. Los tres sprints viven en los mismos archivos
> y se commitean juntos.

---

## 0 · Incidente de método: dos sesiones sobre el mismo worktree

Vale la pena dejarlo escrito porque costó tiempo y puede repetirse.

Durante la ejecución de S8c hubo **dos sesiones de Claude corriendo la misma
instrucción sobre `C:\rediseno-home`**: esta, y la sesión anterior (`995213a6`,
la que la compactación dejó abierta en otra ventana). Escribieron en paralelo
durante ocho minutos, pisándose: de los 14 archivos que escribió la otra sesión,
**9 fueron sobreescritos** por ésta, y el árbol quedó con dos medias
implementaciones incompatibles (`tsc` en exit 1 con 39 errores, 5 de ellos por el
fuego cruzado).

Se detectó porque aparecieron archivos que esta sesión no había escrito
(`introReadout.ts`, `introInvariantKit.ts`, `IntroProbeMount.tsx`), y se
identificó al autor por contenido: los símbolos `INTRO_PROBE_PARAM`,
`introInvariantKit` y `peakHoldS` existen **solo** en el transcript de
`995213a6`.

**Resolución, por decisión del dueño del proyecto:** revertir todo lo de la otra
sesión y continuar con ésta.

- `ProbeEscena.tsx` (trackeado) volvió a su blob de `HEAD`. El diff era
  exactamente sus +21 líneas y nada más, verificado antes de tocarlo.
- `introReadout.ts`, `introInvariantKit.ts` e `IntroProbeMount.tsx`: borrados.
- `IntroLogo3D.tsx`: repuesto a su versión de S8b.

No se usó `checkout`/`restore`/`reset` en ningún momento — el sprint los prohíbe.

**Regla que queda:** los transcripts guardan el contenido íntegro de cada `Write`,
así que un archivo pisado por otra sesión es recuperable desde
`~/.claude/projects/<proyecto>/<id>.jsonl`. Y antes de arrancar un sprint largo,
conviene comprobar que no hay otra sesión viva sobre el mismo worktree
(`ListAgents`, y `ls -la` del directorio de trabajo al empezar y al terminar).

---

## 1 · (b) El bug del logo claro: causa y arreglo

### La causa, medida

En el frame del chasquido el logo salía **gris claro con el contorno oscuro**. No
era el color del material, ni el `fill` del SVG, ni la exposición.

Era el **especular**. S8b iluminaba el mesh con una direccional frontal pura para
que se leyera plano, y cámara de frente + luz de frente es el peor caso posible:
el vector medio `H = normalize(L + V)` queda igual a la normal de la cara, o sea
`dotNH = 1`, que es **el pico exacto del lóbulo GGX**. Y `INK_ROUGHNESS` vale
0,34 — un lóbulo cerrado, calibrado en S6 justamente para que el especular sea lo
que le dibuja la forma a una pieza negra.

Calculado contra el GLSL instalado (three 0.182,
`lights_physical_pars_fragment.glsl.js` + `common.glsl.js`), con la luz frontal de
S8b (intensidad 3,2), ambiente 0,5, `INK_COLOR` `#0F0F0F` y ACES:

| superficie          | `D_GGX` | lineal | en pantalla |
|---------------------|--------:|-------:|-------------|
| la cara (normal 0°) |   23,82 | 0,7709 | **#D9D9D9** |
| bisel a 10°         |    0,68 | 0,0802 | #494949     |
| bisel a 20°         |    0,04 | 0,0141 | #0D0D0D     |
| bisel a 45°         |    0,17 | 0,0049 | #020202     |

Desglose de la cara: especular **0,762**, difusa 0,005, ambiente 0,001. El
**99,3%** de la luz que salía era especular — el albedo negro no participaba. Y
el acantilado de 140× entre la cara y el bisel **es** el "contorno oscuro" que se
veía.

### El arreglo

**Un objeto no se ve plano iluminándolo plano: se ve plano no iluminándolo.**

Con `reveal` en 0 el mesh no tiene **ni una luz encima** y su color sale de la
emisiva del material: una silueta de tinta, idéntica a la del SVG que reemplaza y
—esto es lo importante— **independiente por construcción de cualquier rig que
alguien agregue después**. A medida que `reveal` sube, la emisiva se apaga y
entran las luces de la escena.

Dos decisiones más, atadas a eso:

1. **El canvas pasó a `NeutralToneMapping`**, el mismo del probe, en vez del ACES
   que r3f pone por default. El mismo material con la misma luz tiene que dar el
   mismo valor en las dos pantallas.
2. **La emisiva está resuelta hacia atrás desde el resultado.** Para un gris por
   debajo del codo, `NeutralToneMapping` es exactamente `6,25·x²` — un toe que
   aplasta los negros. Poner la tinta cruda daría **#010101**, no #111111. El
   valor se despeja por bisección contra el operador: **0,029948 lineal**, que
   después del tone mapping cae en **#111111 clavado**, la misma tinta con la que
   el SVG rellena y con la que se escriben las dos líneas de texto.

Vive en `introShading.ts`, módulo puro sin `three`, y lo verifica
`introShading.invariant.ts`.

### Lo que el rig revelado tiene y no tiene

Las intensidades de `reveal = 1` son **las de la escena**, importadas de
`probeLighting.ts`: key 4,6 · fill 1,35 · hemisférico 2,1. No se inventó ninguna.

**Falta el contraluz**, y es a propósito: en la escena el rim es solidario a la
CÁMARA y necesita la órbita para tener sentido; acá la cámara no se mueve. Queda
anotado como la diferencia conocida entre el logo que aterriza y el que la escena
va a mostrar un segundo después.

---

## 2 · (c) El timeline nuevo

Seis perillas, todas en `introTimeline.ts`:

| perilla      | valor  | qué es |
|--------------|-------:|--------|
| `strokeS`    | 1,40 s | el trazo dibuja el logo; sobre el final entran las letras |
| `fillS`      | 0,35 s | el contorno se completa y la tinta lo llena |
| `holdS`      | 1,00 s | **la espera**: quietud total antes del golpe |
| `snapHoldS`  | 0,28 s | **la espera corta**, después del golpe ← nueva |
| `shrinkS`    | 1,10 s | **el achicamiento, en el lugar** ← nueva |
| `placeS`     | 0,90 s | **el acomodamiento** ← nueva |
| **total**    | **5,03 s** | contra 4,55 s en S8b |

Instantes que salen de ahí:

```
0,00 ────────────────────────────── arranca el trazo
0,60  entra "develOP"
0,66  entra el slogan
1,26  las letras quedan quietas          (0,14 s antes del cierre)
1,40 ────────────────────────────── cierra el trazo
1,75 ────────────────────────────── relleno completo
     ░░░░░░░ la espera ░░░░░░░
2,75 ══════════ ⚡ CHASQUIDO ══════════
     ░░ espera corta ░░
3,03 ────────────────────────────── arranca el achicamiento
3,36  empiezan a irse el texto Y el fondo   (el logo va por el 53% del achique)
3,96  se terminaron de ir                    (0,17 s de respiro)
4,13 ────────────────────────────── el conjunto llegó a su tamaño
                                      arranca el acomodamiento
5,03 ────────────────────────────── el logo está en su lugar
```

### Justificación de los tres defaults nuevos

**`snapHoldS = 0,28 s.** La instrucción pide una espera "mínima", y mínima quiere
decir algo medible: por debajo de ~0,12 s una pose sostenida se lee como un
glitch, y a partir de ~0,25 s se lee como una decisión. 0,28 s son **17 cuadros a
60 fps**. Además tiene que ser claramente más corta que `holdS` (1,0 s) — son dos
silencios alrededor del mismo golpe y si midieran parecido rimarían: la relación
es de **3,6 a 1**.

**`shrinkS = 1,10 s.** Lo pide lo que tiene que pasar adentro: el texto y el fondo
se desvanecen acá, y ese desvanecimiento dura `MOTION_DURATION.elemento` = 0,6 s.
Con el fade arrancando al 30% del tramo y durando el 55%, termina al 85% y quedan
0,17 s de respiro con el logo solo, ya en su tamaño final, antes de que se mueva.

**`placeS = 0,90 s.** Un recorrido de ~370 px en desktop (del centro de la
pantalla a 75% × 58%). Con la curva de aterrizaje eso son 28% del camino en los
primeros 90 ms y el resto asentándose: llega rápido y se posa, que es la
diferencia entre acomodarse y volar.

**Sobre el medio segundo de más:** la secuencia nueva tiene dos beats que S8b no
tenía. Si hay que volver a ~4,5 s, el orden en que yo recortaría es `holdS`
1,0 → 0,8 y `placeS` 0,9 → 0,75. Todo con los sliders, sin tocar código.

---

## 3 · ⚠ La curva del achicamiento cambió, y no hay que "corregirla"

S8b aprobó la curva de aterrizaje `[0.16, 1, 0.3, 1]` (expo-out) para "el
achicamiento y el asentamiento", **que entonces eran un solo gesto**. S8c los
separó, y medida sobre el tramo del achique solo, esa curva no hace lo que el
paso 6 pide:

| curva                      | 50% del achique | 90%    | tramo imperceptible |
|----------------------------|-----------------|--------|---------------------|
| aterrizaje `[.16,1,.3,1]`  | 0,11 s          | 0,36 s | **67%**             |
| `arrive` `[.25,.46,.45,.94]` | 0,31 s        | 0,74 s | 32%                 |
| `shift` `[.4,0,.2,1]`      | 0,39 s          | 0,70 s | 37%                 |

Con la de aterrizaje, **dos tercios del tramo son reptar**: el conjunto se
desploma en 0,36 s y el resto no se ve. Peor: el fundido del paso 7 arrancaba con
el achique **ya al 88%**, o sea que el texto se iba sobre un logo que ya se había
detenido, y "en el camino del achicamiento" dejaba de ser cierto.

`shift` queda descartada por el otro lado: 2,6% en el primer 10% del tramo es un
ease-in, y venimos de una pose sostenida — sería una segunda pausa pegada a la
primera.

**Resolución: `arrive` para el achicamiento, la curva de aterrizaje para el
acomodamiento.** Cada gesto con su carácter: uno es un movimiento que se sigue,
el otro es un aterrizaje. Con `arrive`, el fundido arranca con el logo por el
**53,1%** del camino — a mitad de camino, todavía moviéndose. La comprobación
estática exige que caiga en la banda 35–70%, así que si alguien vuelve a poner
expo-out ahí, se pone rojo.

Los tres números están en `sampleShrink` (`introSampling.ts`) y en el docblock de
`INTRO_SETTLE_EASE`.

---

## 4 · Lo que quedó mal armado, punto por punto

| # | lo que reportaste | qué lo causaba | cómo quedó |
|---|---|---|---|
| 1 | en el chasquido escala solo el logo | el `transform` vivía en un div adentro del slot de la marca | **el nodo que escala contiene la marca Y las dos líneas** |
| 2 | no hay espera después del chasquido | no existía la fase | `snapHoldS`, 0,28 s |
| 3 | el achicamiento no es del conjunto | mismo `transform` mal ubicado | un solo canal de escala para todo el lockup |
| 4 | el fondo se va con el texto todavía visible | dos tramos distintos, `textOut` y `veilOut` | **un solo fundido**, los dos lo leen |
| 5 | mezcla achicarse con desplazarse | una sola curva movía escala y posición a la vez | `sampleShrink` no mueve nada, `samplePlace` no escala nada |

El punto 4 es el que quedó más sólido: no se comprueba que dos tramos coincidan
—eso sería frágil—, se comprueba que **sean el mismo número**. Desde que el
slogan termina de entrar, su opacidad y la del velo son idénticas bit a bit,
porque las dos son `1 − sampleFadeOut()`.

---

## 5 · Un cambio de composición, dicho en voz alta

Para que el conjunto escale hace falta un **origen**: el punto que se queda
quieto mientras todo lo demás crece a su alrededor. Ese punto tiene que ser el
centro de la marca — es lo único que sigue vivo después.

S8b centraba el LOCKUP entero con un flex de tres elementos, así que el centro de
la marca caía ~24 px por debajo del centro de la pantalla y había que medirlo con
`getBoundingClientRect()`. **Ahora lo que se centra es la marca**, y las dos
líneas cuelgan de sus bordes (`bottom-full` / `top-full`).

Lo que se gana:

- El `transform-origin` correcto es el default de CSS (`50% 50%` de la caja del
  nodo que escala). No hay que calcularlo.
- **`introFlight.ts` no toca el DOM.** El centro de la tinta es el centro de la
  ventana, así que el plan de vuelo es función pura del tamaño de la pantalla —
  y por eso el vuelo entero se puede verificar sin navegador, que es lo que hace
  `introFlight.invariant.ts`.
- Desaparece la trampa de `getBoundingClientRect()` con transforms activos que
  `CLAUDE.md` documenta: no hay medición que envenenar.

Lo que cuesta: **el lockup subió ~24 px** respecto de lo que viste. Es un cambio
de composición y está acá para que no aparezca como sorpresa.

---

## 6 · El vuelo, en números

| ventana   | lockup (tinta) | destino | centro | escala | pico | clamp |
|-----------|---------------|---------|--------|-------:|-----:|------:|
| 1440×810  | 274×190 | 523×364 | (1086, 466) = 75%, 58% | ×1,91 | ×2,58 | 1,000 |
| 1920×1080 | 365×254 | 698×486 | (1448, 621) = 75%, 58% | ×1,91 | ×2,58 | 1,000 |
| 390×844   | 234×163 | 335×233 | (195, 422) = 50%, 50%  | ×1,43 | ×1,93 | 0,640 |

Dos cosas para tener presentes al mirarlo:

- **En mobile el destino cae en el centro exacto**, porque la ventana es tan
  angosta que el encuadre de la escena no tiene margen lateral para correr el
  logo (`travelX` da 0). O sea que en mobile el acomodamiento **casi no
  desplaza**: es escala + inclinación. No está roto.
- El clamp de ancho actúa solo en mobile (0,640) y recorta el destino a 335 px
  sobre una pantalla de 390.

---

## 7 · (e) El preloader sobre la escena real del probe

```
/probe-escena?intro
```

Un parámetro de URL y nada más. Se eligió sobre un botón en el panel porque un
botón habría que dibujarlo, y dibujarlo es tocar `ProbeControls`; el parámetro no
toca nada, es compartible y sobrevive al F5, que es lo que uno quiere mientras
calibra. El controlador está disponible ahí igual que en el home (**⌥I**).

**Sin el parámetro, `IntroPreview` devuelve `null` en su primer render** y no
instancia nada: ni motor, ni canvas, ni suscripciones. El probe se comporta
exactamente igual que antes.

**No monta `HomeIntro`, monta el motor.** La diferencia importa: `HomeIntro`
marca `sessionStorage` al terminar para no repetirse en la sesión, así que
calibrar en el probe te dejaría el home sin intro en esa misma pestaña. Montando
`useIntroEngine` directo, el problema no existe — acá no hay nada que marcar, y de
paso el preview no consulta el gate pre-paint, no consume `PreloaderContext` y no
avisa por el contrato de la escena. Lo único que comparte con el home es el
motor, que es justamente lo que tiene que ser idéntico.

### Qué sacar el día que se limpie

1. `src/components/layout/home-intro/IntroPreview.tsx`, entero.
2. Las dos inserciones de `ProbeEscena.tsx`: el `const IntroPreview = ...` con su
   docblock, y la línea `{IntroPreview ? <IntroPreview /> : null}`.

Nada más. **La escena, la coreografía y el panel no se tocaron.**

---

## 8 · Las comprobaciones estáticas

Cuatro scripts sobre el módulo, más el de `scene-framing` que ya existía. Corren
con `tsx`, sin DOM y sin navegador — que es la única forma de verificar esto,
porque **el intro no corre bajo automatización** (`navigator.webdriver`).

```bash
npx tsx src/components/layout/home-intro/introTimeline.invariant.ts   #  83
npx tsx src/components/layout/home-intro/introSampling.invariant.ts   # 119
npx tsx src/components/layout/home-intro/introFlight.invariant.ts     # 101
npx tsx src/components/layout/home-intro/introShading.invariant.ts    #  23
npx tsx src/lib/scene-framing.invariant.ts                            #  23
```

Todas corren contra **nueve calibraciones**: la de default, un intro corto, uno
largo, y el caso de mover una sola perilla — una por una. Existe porque las
perillas las calibra el dueño del proyecto mirando la pantalla, sin leer el
razonamiento detrás de las fracciones.

Lo que garantiza cada una de las cinco propiedades que pedía la instrucción:

| propiedad | dónde | cómo |
|---|---|---|
| **la espera post-golpe existe** | timeline + sampling | `shrinkStart > snapAt` estricto, y `achique` y `acomodo` clavados en 0 durante todo el tramo |
| **el achique termina antes del acomodo** | timeline + sampling + flight | `placeStart === shrinkEnd` exacto; `place` vale 0 hasta ahí; el conjunto **no se desplaza ni un píxel** hasta terminar de achicarse |
| **texto y fondo se van juntos** | sampling | son el mismo número: `veilOpacity === 1 − fadeOut` y `lineOpacity === lineIn × (1 − fadeOut)`, verificado bit a bit en 601 puntos |
| **el conjunto escala como unidad** | flight | dos mitades — la numérica (`inkHeightPx === lockup.heightPx × scale` siempre, o sea que la cámara 3D y el DOM leen el mismo número) y la **estructural**: se lee `IntroLockup.tsx` y se exige que las dos líneas de texto estén adentro de las marcas `GRUPO … /GRUPO`, y que haya **un solo** `scale:` en el archivo |
| **negro pleno en el corte** | shading | el byte que sale por pantalla para la tinta plana **es 17**, el mismo de `#111111` |

**Controles negativos.** Hallazgo de S8b que sigue valiendo: ninguna combinación
de las perillas puede romper el orden, porque los tramos derivados son fracciones
de las fases y la secuencia es invariante de escala. Por eso los controles
negativos son timelines rotos **a mano**: sin espera, con hueco entre gestos, con
los gestos superpuestos, con el fundido tarde, con el fundido en el golpe, con las
letras sin asentar, con el orden roto, con el velo despegado del texto, y —el del
bug de este sprint— con una luz prendida sobre el logo plano.

**Lo que deliberadamente NO está.** No se reimplementa el BRDF de three. El
diagnóstico del bug se calculó una vez y está en la §1; lo que se comprueba es la
garantía estructural que lo reemplaza: con `reveal` en 0 no hay ninguna luz
encendida, así que no hay especular posible. Un invariante sobre lo que el código
garantiza, no sobre una fórmula copiada de una dependencia.

---

## 9 · (a) Verificación

```
tsc --noEmit                      exit 0
eslint (tocados + dependientes)   exit 0, 0 warnings
introTimeline.invariant            83 en verde, 0 en rojo
introSampling.invariant           119 en verde, 0 en rojo
introFlight.invariant             101 en verde, 0 en rojo
introShading.invariant             23 en verde, 0 en rojo
scene-framing.invariant            23 en verde, 0 en rojo
                                 ─────────────────────────
                                  349 comprobaciones
npm run build                     exit 0
```

Lint corrido también sobre los dependientes que no se tocaron: `layout.tsx`,
`page.tsx`, `useChromeRevealed.ts`, `Preloader.tsx`, `LogoStrokeOverlay.tsx`
(Route B) y `ProbeEscena.tsx`.

**349 comprobaciones no dicen que se vea bien.** El intro no corre bajo
automatización: el chasquido solo se juzga a ojo.

---

## 10 · "Ni un byte en producción" — la evidencia, y un agujero que apareció

Grep sobre el build de producción, **restringido a `.js` ejecutable** (los
`.js.map` se excluyen a propósito: son source maps del server, no código):

```
NEGATIVOS (tienen que dar 0)          POSITIVOS (control)
  IntroDevController      0             M532 700v-67       5 archivos
  intro · controlador     0             data-home-intro    2 archivos
  IntroPreview            0             Ingenier           3 archivos
  post-golpe              0
  SIN DESTINO             0           Y en el HTML prerenderizado de "/":
  fallback SVG            0             data-home-intro-overlay   1
  achicamiento            0             el path del logo          2
  acomodamiento           0             "develOP"                 3
  ▶ reproducir            0             el slogan                 1
                                        el script pre-paint       1
```

`reproducir` a secas aparece en 2 archivos: son los chunks de `/probe-escena` y
es **su propio** botón de play. `▶ reproducir`, el string exacto del controlador,
da 0.

Los nombres `IntroDevController` e `IntroPreview` sí aparecen en tres `.js.map`
—el especificador del `import()` sobrevive en los metadatos del grafo de
módulos—, pero **en ningún `.js` ejecutable**.

### El agujero que el grep encontró

`fallback SVG` daba **3 archivos**, uno de ellos un chunk de cliente real
(`.next/static/chunks/7767-*.js`). El chunk del controlador quedaba fuera del
build, pero **el objeto `devApi` se construía igual** —con sus closures y sus
strings— para que no lo leyera nadie. Venía así desde S8b y el grep de aquel
sprint no lo testeaba.

Arreglado: el `useMemo` devuelve `null` en producción, el ternario se pliega y el
objeto entero cae como código muerto. El hook se sigue llamando siempre, que es
lo que las reglas de hooks piden. Después del arreglo: **0**.

### Y el peso

`three` **no viaja en la carga inicial del home**: de los 23 chunks que la página
prerenderizada pide, ninguno contiene `WebGLRenderer`. El canvas del logo entra
por `dynamic(ssr:false)`.

La coreografía **sí** viaja — es el precio de leer el destino del recorrido en vez
de hardcodearlo, ya medido en S8b: 7.203 bytes, 2.512 comprimidos.

---

## 11 · (d) Archivos

**Nuevos (7)**

```
home-intro/introShading.ts            171   la tinta, el tone mapping y el cruce de luz
home-intro/introShading.invariant.ts  200
home-intro/introFlight.invariant.ts   239   el vuelo + "escala como unidad"
home-intro/useIntroEngine.ts          194   el motor, compartido por el home y el probe
home-intro/IntroPreview.tsx           103   SOLO DESARROLLO — el preloader sobre el probe
home-intro/introChecks.ts              77   andamio de las comprobaciones (no viaja a ningún bundle)
docs/rediseno/outputs/S8c-CORRECCION.md     este reporte
```

**Reescritos (9)**

```
home-intro/introTimeline.ts           286   seis perillas
home-intro/introSampling.ts           217   shrink / place / reveal / fadeOut separados
home-intro/introFlight.ts             186   sin medición del DOM
home-intro/useIntroChannels.ts        177   groupScale/groupX/groupY
home-intro/IntroLockup.tsx            101   la marca centrada, el texto colgando, un solo transform
home-intro/IntroLogoCanvas.tsx        278   el arreglo del bug + NeutralToneMapping
home-intro/IntroDevController.tsx     258   seis sliders, dos saltos, lectura nueva
home-intro/introTimeline.invariant.ts 183
home-intro/introSampling.invariant.ts 221
layout/HomeIntro.tsx                  174   solo el ciclo de vida del home
```

**Retocados (2)**

```
home-intro/IntroOverlay.tsx            72   sin slotRef, canales nuevos
home-intro/IntroLogo3D.tsx             54   docblock al día con los dos gestos
```

**Tocado fuera del módulo (1)** — la excepción que la instrucción autoriza:

```
app/probe-escena/_components/ProbeEscena.tsx   +23 líneas, solo el montaje dev-only
```

**Sin tocar:** `page.tsx`, `layout.tsx`, `globals.css`, `useChromeRevealed.ts`,
`introBoot.tsx`, `introHandoff.ts`, `IntroLogoStroke.tsx`, `useViewportSize.ts`,
`scene-framing.ts`, `LogoMark.tsx`, el resto de `/probe-escena`, Route B,
`DotMatrix` y los seis frozen. Ningún archivo pasa de 300 líneas (el mayor es
`introTimeline.ts` con 286). Cero dependencias nuevas, cero `any`, cero `setState`
por frame.

---

## 12 · Anotado, no implementado

- **El contraluz del rig revelado.** En la escena el rim es solidario a la cámara;
  acá la cámara no se mueve. El logo aterriza con key + fill + hemisférico.
- **§7.6, el encuadre por relación de aspecto.** `DEST_WIDTH_MARGIN = 0,86` sigue
  en `scene-framing.ts` y **la escena va a necesitar el mismo clamp: tiene que
  leerlo de ahí, no reimplementarlo.**
- **Deuda consciente:** el home depende de tres módulos de `/probe-escena`
  (`choreography.ts`, `probeScene.ts`, `probeLighting.ts`) y de `bezier.ts`.
  Cuando la escena se monte en el home hay que decidir si se mudan a `lib`. Está
  escrito para que ese sprint lo resuelva en vez de descubrirlo.
- **La duplicación preexistente del path del logo** en `LogoStrokeOverlay.tsx`
  (Route B), `Footer.tsx` y `public/logodevelOP.svg`. No se migró.
- **El aterrizaje se ve fuera de lugar en el home**, y es lo esperado: ahí es
  donde la escena va a tener su logo. Para juzgarlo, `/probe-escena?intro`.

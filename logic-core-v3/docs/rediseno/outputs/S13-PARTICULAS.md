# S13-PARTICULAS — Las partículas del preloader

- **Fecha:** 2026-08-26 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S13-particulas.md`
- **Qué cierra:** las partículas del preloader **sin relevo**, el **escalón de exposición** de `DIRECCION-ESCENA.md` §7.11, y un pendiente nuevo con su número — la cámara de `harness.ts`.

> **El sprint entero se apoya en un solo requisito, y ese requisito se mide:**
> en ningún instante pueden ser legibles dos poblaciones de partículas.
> **La última del intro deja de ser legible a los 4,168 s y la primera de la
> escena a los 4,278 s: 110,4 ms de margen.**

---

## 0 · Los cuatro números del sprint

| | |
|---|---:|
| **el margen** entre las dos poblaciones | **110,4 ms** |
| lo que el escalón de exposición valía **donde el intro lo renderiza** | **0,39 de 255** |
| el paso de la caída, en diámetros de la propia mota, a 60 fps | **1,90** |
| lo que el campo del intro se parece al de la escena — mediana del diámetro | **3,16 contra 3,20 px** |

Y un hallazgo que sale del sprint pero no es del sprint: **el 1.008 de S10 está medido con una cámara que no es la del rig** — §7.

---

## 1 · No hay relevo, y por qué eso es lo barato

Las del intro **bajan antes** de que se vaya el blanco: esa bajada es la tapadera. Las que quedan flotando son las de la escena, que ya estaban ahí. Es el mismo truco que S8d usó con el cruce de contraste — no se resuelve la continuidad, se esconde el corte.

```
2,250 ── arranca la transformación de color   → arrancan a aparecer
2,2825   PRIMERA legible                        (32 ms después)
3,510    DENSIDAD COMPLETA                      (0,140 s de campo quieto)
3,650 ── se va la letra                        → arranca la bajada
4,1677   ÚLTIMA legible          ◀── el número
4,190    campo apagado del todo                 (0,060 s antes del velo)
4,250 ── se va el fondo
4,2785   las de la ESCENA se vuelven legibles
```

### 1.1 · El margen, y por qué no había otro diseño posible

Criterio de legibilidad: **razón de contraste WCAG ≥ 1,10**, el mismo umbral con el que `introSampling.invariant.ts` mide el cruce de tinta, y el instante exacto de cada cruce sale de **interpolar entre las dos muestras que lo encierran** — la técnica que S8e dejó escrita para que la respuesta no dependa de la fase de la grilla.

El umbral es conservador **en las dos direcciones**: les exige a las del intro bajar de un contraste con el que *un logo entero* ya no se ve, y declara legibles a las de la escena apenas lo cruzan. Para el lado de la escena se toma además el par de contraste **máximo posible** —la mota cercana del polvo (70,6) sobre el papel iluminado (248,3)—, que da el instante más temprano en que algo puede leerse.

> ⚠️ **La escena se vuelve legible 28,3 ms después de que el velo arranca.** Con `arrive`, a los 70 ms el velo ya bajó al 81%. **Ésos son 28 ms de tapadera, y nada más**: dejar que la salida se derramara adentro de la ventana del velo —que es la lectura permisiva de la instrucción— no era viable. Por eso el campo cierra **antes** de `veilOutStartS`, y el margen pasa de 28 a 110 ms.

### 1.2 · El séptimo predicado

`PARTICLES_BEFORE_VEIL`, hermano exacto de `LETTER_BEFORE_VEIL`, en el arreglo `PROPERTIES` de `introTimeline.invariant.ts`:

> el campo del intro termina de irse **estrictamente antes** de que el fondo empiece a disolverse, y la densidad está completa antes de que se vaya la letra

Corre en las **once calibraciones** (peor margen de las once: 0,030 s, en `corto`) y lleva **dos controles negativos**: un timeline con las partículas todavía cayendo cuando el fondo arranca, y otro con la letra yéndose antes de que el campo termine de aparecer. Los seis predicados anteriores no se tocaron.

**Y las dos ventanas no son una octava perilla:** se derivan de instantes que el timeline ya publica —`colorStartS`/`colorEndS` y `letterOutStartS`/`letterOutEndS`— con el mismo respiro (`LINE_SETTLE_MARGIN_FRAC`, que pasó a exportarse sin cambiar de valor) con el que las letras asientan antes del cierre del trazo. Las siete perillas de S8e quedaron intactas.

---

## 2 · La especie no se calibra: se proyecta

El campo del intro **es** el campo de la escena —mismo generador (`buildParticleField`), mismos radios, mismo sesgo 1,4, mismos colores, mismo material, misma fracción dibujada (80%)— **proyectado por la cámara de la pose inicial**. De ahí salen solas la distribución de tamaños en píxeles, la densidad, el reparto sobre la pantalla y la perspectiva atmosférica. Lo único propio es la semilla.

**1440×810 · diámetro en píxeles CSS** (`gl_PointSize = size × (altoCSS/2) / profundidad`, sin el FOV — la corrección que S10 §6.2 midió contra `points.glsl.js`):

| | intro | escena | Δ |
|---|---:|---:|---:|
| polvo en cuadro | **957** | 913 | +4,8% |
| bokeh en cuadro | **76** | 83 | −8,4% |
| **total** | **1.033** | **996** | **+3,7%** |
| polvo p10 / mediana / p90 | 2,09 / **3,16** / 4,97 | 2,12 / **3,20** / 4,81 | −1,4% / **−1,3%** / +3,3% |
| bokeh mediana | **24,40** | 24,28 | +0,5% |

Los colores no se comparan porque son **el mismo cálculo**, y eso también se verifica: la rampa del intro contra `shadeUnlit` —el instrumento con el que la escena mide el valor de una mota— da **144 de 201 puntos exactos y el resto a un byte**, que es el redondeo entre la versión para grises del tone map y la entera. Los dos extremos son 70,6 y 214,5.

### 2.1 · 🔴 Misma población, distinta muestra — y la divergencia se comprueba

Con la MISMA semilla las motas del intro caerían desde exactamente los lugares donde, tres décimas más tarde, las de la escena vuelven a estar. **Eso no se lee como dos poblaciones: se lee como una que se teletransportó.** Es el modo de fallar que el parecido perfecto produce, y por eso la divergencia no se supone.

Se comprueba en **tres pasos**, y el tercero es el que cierra la afirmación.

**Paso 1 — el control positivo, que va primero.** Si el instrumento no puede ver la coincidencia, medir la divergencia no significa nada. El campo de la escena contra SÍ MISMO es la coincidencia perfecta, y es exactamente lo que pasaría si el intro usara `PARTICLE_SEED`:

> **100%** de las motas a menos de 1 px · distancia máxima **0**

**Paso 2 — la medición.** El campo del intro contra el de la escena:

> **0,3%** a menos de 1 px · mediana **13,6 px** hasta la mota más cercana

**Paso 3 — la tercera semilla, y por qué hace falta.** Los dos pasos anteriores prueban que los campos **no coinciden**, y ahí se podrían haber cerrado. Pero dejan abierta la pregunta del otro lado: **13,6 px podría ser demasiado.** Un campo que divergiera de más ya no sería la misma especie — sería otra distribución que también pasa el chequeo de "no coincide". El número solo, sin nada contra qué compararlo, no distingue "muestra independiente de la misma población" de "población distinta".

Por eso se genera un **tercer campo, con una semilla más**, y se lo mide contra el de la escena con el mismo instrumento:

> mediana **13,8 px**

**13,6 contra 13,8.** Ésa es la frase que cierra la afirmación: los 13,6 px del intro **son la divergencia genérica de dos muestras independientes del mismo generador**, no un valor particular de la semilla elegida. Sin este paso, "no están correlacionados" quedaba probado y "siguen siendo la misma población" quedaba supuesto.

Este control no estaba pedido y es el que convierte los dos primeros en una afirmación completa.

### 2.2 · El único recorte, y sale de la escena

El campo de polvo llega a radio 34 con la cámara a **20,05** del origen, así que una mota puede quedar a dos unidades de la lente. En la escena eso es transitorio —las conchas giran y la mota barre—; acá el campo se queda quieto 1,4 s, y **una mota de polvo de 33 px inmóvil no es la misma especie: es un disco.**

El corte no se elige a ojo: sale de **la regla de las dos escalas de S10**. El polvo es la escala lejana y el bokeh la cercana, así que ninguna mota de polvo puede proyectar más grande que el disco de bokeh más chico, que es el borde entre las dos:

```
depthMin = PARTICLE_SIZE × (ojo + BOKEH_R_MAX) / BOKEH_SIZE  =  3,974
```

**17,33 px** en los dos lados, deja afuera **2 motas (0,21%)** y baja el máximo del polvo de 33,27 a **12,77 px**. La escena, en esta pose, ya lo cumple sola: su mota más grande mide **10,98 px**.

---

## 3 · Dónde viven, y por qué no en el rig 3D

**Un `<canvas>` 2D propio, hermano del velo y por DEBAJO del lockup.**

```
IntroOverlay
├── velo            (cambia de color y se disuelve)
├── ◀ partículas    (canvas 2D)
├── lockup          (develOP · la marca SVG · el slogan)
└── canvas WebGL    (el mesh + la sombra)
```

Tres razones, las tres medidas antes de elegir:

1. **La marca las tapa en todo instante y sin discontinuidad** — primero el SVG relleno, después el mesh del canvas de arriba, igual que en la escena (`depthTest` activo, "el logo SÍ las tapa"). En el canvas ortográfico serían la capa de más arriba, taparían la marca, y al llegar el relevo el mesh empezaría a ocluirlas: un cambio de oclusión justo adentro de la ventana que la regla del cruce protege.
2. **`sizeAttenuation` es no-op con cámara ortográfica** (`points.glsl.js` solo lo aplica si `isPerspectiveMatrix`), así que `PointsMaterial.size` sería un uniform por draw call: la distribución medida de 1,34 a 12,77 px habría que bucketearla en vez de tenerla continua.
3. **No depende del chunk de `three`.** Si ese chunk no llega, el mesh no aparece —eso ya está aceptado y tiene su fallback— pero las partículas sí.

**La forma de una mota no se reinventa:** `createDotSpriteData` y `createBokehSpriteData` de la escena se importan tal cual y devuelven el mismo `Uint8Array` RGBA que three sube como textura; la única diferencia es dónde se pega. El teñido necesita un sprite por color, así que la rampa se cuantiza en **24 escalones repartidos parejo en el VALOR QUE SALE** y no en la rampa: la mezcla va en luz lineal y del lado oscuro avanza más del doble, así que con escalones parejos el peor error se iba a **7,0 de 255** —concentrado justo en las motas cercanas, que son las que más se ven— y con el reparto por valor queda en **3,0**. Medido, con su control positivo.

**Cero `setState` por frame:** un `progress.on('change')` y nada más. React no re-renderiza ni una vez durante la secuencia.

---

## 4 · La caída

**El campo baja 1,9 unidades DE MUNDO y se lo vuelve a proyectar.** Como la proyección divide por la profundidad, las cercanas barren cientos de píxeles y las lejanas decenas: **el paralaje sale gratis y es el que corresponde**, y de paso es la "dispersión" que la instrucción permite, con una causa física en vez de un número al azar. La dirección dominante es hacia abajo **por construcción**: el desplazamiento es −Y de mundo y nada más, y se verifica que `dy > 0` y `dy > |dx|` en las 1.033.

| 1440×810 | |
|---|---:|
| \|dy\| mínima / mediana / máxima | 47 / **107** / 377 px |
| deriva lateral mediana | 7 px |
| recorrido en diámetros de la propia mota | **33,79** |
| paso por cuadro a 60 fps | **1,90 diámetros** |

**Los dos últimos son los mismos en 1440×810, 1920×1080 y 390×844** — verificado en las tres. No dependen ni de la profundidad ni de la ventana: el desplazamiento y el tamaño se dividen los dos por la profundidad y el cociente se cancela. **Un solo número gobierna el campo entero.**

### 4.1 · Por qué `linear` y no `shift`

La ventana de salida es cortísima —0,297 s— y sobre una ventana así la curva no elige el carácter del gesto sino **cuánto estrobea**. Con `linear` el paso por cuadro es el mínimo posible para una distancia dada; con `shift` la pendiente máxima es 2,735× (el número que `samplePlace` ya tenía medido), o sea **5,2 diámetros por cuadro en vez de 1,90**. Un punto de 3 px que salta cinco veces su tamaño no se lee como que baja: se lee como una fila de puntos.

No es una curva nueva: `linear` es la tercera de este repo —"no aplicar ninguna"— y el propio trazo del intro ya la usa con su justificación escrita.

Y el apagado cuelga del **mismo número** que el desplazamiento, por la misma razón por la que `samplePlace` es uno solo. De ahí sale que **"bajan de verdad" tenga número**: al dejar de ser legible, la mota ya recorrió el **92%** de su caída (mediana; máximo 93%).

### 4.2 · 🔴 `INTRO_FALL_WORLD` es la única perilla que se decide MIRANDO

Misma clase que `placeS`. La comprobación no fija su valor: es una **banda** sobre el paso por cuadro que **acepta los dos vecinos y rechaza los dos extremos**.

| | paso por cuadro | |
|---|---:|---|
| 0 | 0,00 | rechazado — se desvanecerían en el lugar |
| **1,2** — vecino "si estrobea o se lee violenta" | **1,21** | aceptado |
| **1,9** — el default | **1,90** | aceptado |
| **3,0** — vecino "si se lee como un desvanecimiento" | **2,95** | aceptado |
| 6 | 5,66 | rechazado — una fila de puntos |

---

## 5 · El escalón de exposición de §7.11 — RESUELTO

`sampleInkShading` pasó a `hemiIntensity: HEMI_INTENSITY × celosiaSkyFactor(CELOSIA_BAR) × t`. El intro termina **en el ambiente exacto con el que la escena empieza**: una constante compartida, leída de la misma función, **sin un solo literal**.

### 5.1 · ⚠️ §7.11 sobreestimaba el escalón

Los **−18,2 puntos en el papel en sombra** y los **−15 en el valor medio del cuadro** son sobre el piso y sobre el cuadro **de la escena**, y el intro no renderiza ninguna de las dos cosas: no tiene papel, y su plano de sombra es un `ShadowMaterial` —oscurece lo que hay detrás, no recibe luz—. **La única superficie iluminada del intro es el logo**, y ahí la tinta `#0F0F0F` queda tan abajo que el toe del tone map la aplasta:

| normal del logo | cielo abierto | cielo tapado | Δ |
|---|---:|---:|---:|
| **cara frontal** | 1,68 | 1,28 | **−0,39** |
| canto superior | 1,34 | 1,01 | −0,33 |
| canto inferior | 0,70 | 0,44 | −0,25 |

**Cuatro décimas de un byte**, y el instrumento que lo mide reproduce antes los cuatro números del papel de S11 —249,4 / 236,9 / 248,3 / **218,7**— como control positivo, más el −18,2 exacto. Si no reprodujera esos, lo que midiera sobre el logo no valdría nada.

### 5.2 · Entonces por qué se resolvió — la mudanza es el premio

🔴 **No por los 0,39 puntos.** Traer el factor de cielo obliga a importar `probeCelosia.ts`, que arrastra `celosiaGeometry`, `celosiaPenumbra`, `moireTextures` y `probeMoire` —**5 módulos, 10,6 KiB de código**— y corre una integral de hemisferio de 24.000 muestras al cargar el módulo: **1,54 ms**. Hacerlo en `introShading.ts` habría puesto todo eso en el bundle de la **primera visita**, que es exactamente la visita en la que el preloader corre.

Por eso el rig salió a `home-intro/introRig.ts`, que solo importan el canvas diferido y su comprobación: esa cadena cae en el chunk de `three` (~903 KiB, ahí es ruido) y **`probeLighting.ts` sale del grafo de primera carga**. El escalón es el pretexto; **el peso ahorrado en la visita del preloader es el premio.**

### 5.3 · La comprobación quedó más fuerte, no más floja

`introShading.invariant.ts` comparaba `lit.hemiIntensity === HEMI_INTENSITY` por identidad y custodiaba *"el intro termina en el valor pleno"*. Ahora custodia *"el intro termina en el ambiente exacto con el que la escena empieza"*: **hoy hay UN número donde antes había dos**, los dos factores entran importados, y se suma un chequeo que no existía —**el nivel de `LIGHT_ARC` en p=0 vale 1**, que es lo único por lo que la key y el relleno no tenían escalón. Si el hero deja de estar a luz plena aparecen dos escalones más y hay que volver a `introRig.ts`.

Con dos controles positivos: uno que **detecta el cielo abierto** (el estado anterior, −32,6%) y otro que verifica que con la celosía abierta el factor vuelve a 1.

---

## 6 · Movimiento reducido

**No hay nada nuevo que definir, y ésa es la respuesta.** El intro entero se saltea con `prefers-reduced-motion` —doble guard: el script pre-paint y `useReducedMotion` en el componente—, y las partículas viven **adentro** de `IntroOverlay`, así que no tienen camino a montarse. Se verifica leyendo el código: que la capa cuelgue del overlay y **de ningún otro lado**, que el overlay solo se monte mientras el intro corre, y que los dos guards sigan puestos — con su control positivo de que los tres archivos se leyeron de verdad.

De paso se verifica por posición en el archivo que la capa va **debajo** del lockup y del mesh (la marca las ocluye) y **encima** del velo (contra lo que se recortan: son de tinta, no de luz).

---

## 7 · ⚠️ HALLAZGO — la cámara de `harness.ts` no es la del rig

**No es una nota al pie: toda cifra de cuadro de S9 en adelante la arrastra.** Quedó promovido a pendiente con sección propia en `DIRECCION-ESCENA.md` §7.15.

`__tests__/harness.ts:25` declara la caja del logo como **7,168 × 7,168** —el cuadrado de `LOGO_BOX_WORLD`— y con ella calcula el recorrido del encuadre en `cameraAt`. El rig real le pasa a `aimWithFraming` la caja del **mesh medida en runtime** (`OrbitRig.tsx:506`), que es la que `lib/scene-camera.ts` deriva: **6,863 × 4,779**.

| pose | frameX | harness | rig | Δ (1920×1080) |
|---|---:|---|---|---:|
| hero | 0,68 | (1350, 569) | (1358, 570) | **7,9 px** · 0,41% |
| quiénes somos | −0,80 | (643, 522) | (628, 520) | 15,3 px · 0,80% |
| números | −0,45 | (699, 559) | (694, 560) | 5,1 px · 0,26% |
| trabajos | −0,85 | (467, 570) | (457, 572) | 9,8 px · 0,51% |
| **demos** | **1,00** | (1228, 528) | (1252, 526) | **24,6 px** · **1,28%** |
| cierre | 0,00 | (960, 540) | (960, 540) | **0,0 px** |

**Donde el encuadre está centrado las dos coinciden exactamente**, y el error crece con `|frameX|`.

**El caso concreto que lo destapó:** S10 publica **1.008** partículas en cuadro en la pose inicial (924 + 84). S13 reprodujo ese número **exacto** con la cámara de `harness.ts`, y con la del rig el mismo campo da **996** (913 + 83): **−1,2%**.

**Qué más lo arrastra:** `frameProbe.ts:197` —el muestreador de cuadro— llama a `cameraAt`, así que todo lo que salió de `sampleFrame` viaja con esa cámara: los seis valores medios de S10 y S11, los porcentajes de piso en sombra, la cobertura de la losa y el batido de la celosía de S12. **NO se re-midió y NO se arregló**: es `probe-escena/` y estaba fuera de scope. La lista de suites afectadas está en §7.15.

---

## 8 · Verificación

### 8.1 · Las once suites

```
introTimeline         112 ← 99    (+13: el séptimo predicado × 11 calibraciones + 2 controles)
introSampling         166 ← 166   salida IDÉNTICA, verificada con diff — §8.2
introFlight            92 ← 92
introSilhouette        60 ← 60
introShading           14 ← 28    (el rig se fue a su propia suite)
introRig               23   nueva
introParticles         21   nueva
introParticleField     22   nueva
introParticleTiming    25   nueva
scene-framing          23 ← 23    mismas cifras, más un chequeo bit a bit nuevo
scene-camera            7   nueva
                     ─────
                      565 comprobaciones, 0 en rojo   (468 antes)
```

Los dos empates —166 y 23— no se dan por buenos por ser empates: cómo se verificó cada uno está en §8.2.

### 8.2 · 🔴 EL DIFF, COMO MÉTODO — qué se hace cuando se mueve código compartido

Este sprint movió la función `contrast` de `introSampling.invariant.ts` a `introShading.ts`, para compartirla con la legibilidad de las partículas. **La fórmula no cambió ni un byte, pero eso no se puede afirmar desde adentro del cambio**: es exactamente el tipo de movimiento en el que un error se cuela sin que nadie lo note.

**Lo que NO alcanza es comparar el conteo.** `166 en verde, 0 en rojo` antes y `166 en verde, 0 en rojo` después es un empate de totales, y un total es un número solo: **si el movimiento hubiera roto una calibración y arreglado otra, el conteo sería idéntico y la afirmación sería falsa.** Peor todavía en una suite que publica CIFRAS en el detalle de cada `check` —los 0,0152 s del cruce, los 0,0376 s, las once filas—: cualquiera de esas puede moverse tres decimales sin que el verde cambie, porque el verde es un umbral y no un valor.

**Lo que sí alcanza es el diff.** El procedimiento, tal cual se corrió:

```
npx tsx …/introSampling.invariant.ts > antes.txt     ← ANTES de tocar nada
… se mueve la función …
npx tsx …/introSampling.invariant.ts > despues.txt
diff antes.txt despues.txt                            → sin una sola línea
```

La salida de estas suites es determinista y publica cada cifra en el detalle de su `check`, así que **el diff compara las once calibraciones cifra por cifra, no once booleanos.** Sin diferencias significa: mismos cruces, mismos segundos, mismos umbrales, mismo orden. Es la única forma de convertir "no cambió nada" de una promesa en una medición.

> **Queda como el procedimiento del repo:** cada vez que se mueve código compartido entre módulos —una función, una constante, un tipo con lógica—, se guarda la salida completa de las suites que lo consumen ANTES de tocarlo y se exige un `diff` vacío. El conteo no es evidencia; la salida sí.

**Y el otro empate, el de `scene-framing`, se cerró de otra forma — que conviene distinguir.** Ahí no se movió código compartido: `frameScenePose` pasó a **consumir** la cámara que antes tenía adentro. El riesgo no era que una cifra derivara sino que quedaran **dos cámaras**, así que en vez de un diff se escribió el chequeo que lo hace imposible: `scene-camera.invariant.ts` exige que el origen proyectado con las funciones nuevas sea **bit por bit** el centro de la tinta que `frameScenePose` publica (`===`, no "parecido"), más un control positivo de que una proyección que devolviera siempre el centro no pasaría. Sus 23 comprobaciones siguen publicando las mismas cifras — el centro en (1018, 428) y la tinta en 451 × 313 px.

**La regla, entonces, con su matiz:** cuando el código se **mueve**, diff de la salida completa; cuando el código se **reordena para que haya una sola fuente**, el chequeo de identidad entre las dos rutas. Lo que no vale en ninguno de los dos casos es el conteo.

### 8.3 · Tipos, lint y build

```
.\node_modules\.bin\tsc.cmd --noEmit                              → exit 0
.\node_modules\.bin\eslint.cmd <lo tocado>                        → exit 0, sin warnings
NODE_OPTIONS=--max-old-space-size=8192 npm run build              → exit 0
```

**No se corrió `prisma migrate status`:** el sprint prohíbe la base de datos y no se tocó una línea que la toque.

### 8.4 · El contrato del bundle, verificado sobre el build

| negativo — no viaja a producción | | positivo — sí viaja | |
|---|---:|---|---:|
| `IntroDevController` | 0 | `data-intro-particles` | 1 |
| `intro · controlador` | 0 | `data-home-intro` | 1 |
| `fallback SVG` | 0 | el path del logo | 1 |
| `IntroPreview` | 0 | | |
| `introParticleProbe` | 0 | | |

Y **`three` sigue sin viajar en la carga inicial del home**: de los **23 chunks** que la página prerenderizada pide, **ninguno** contiene `WebGLRenderer` — el mismo número y el mismo resultado que S8d.

### 8.5 · Lo que las partículas le cuestan al bundle de la primera visita

| | módulos | KiB sin comentarios |
|---|---:|---:|
| antes | 24 | 49,8 |
| **hoy** | **31** | **71,8** |

**+19,8 KiB netos**, con el detalle: entran los cinco módulos nuevos del intro (14,5) más `probeParticles.ts` (2,6) y `particleTextures.ts` (2,0); **sale `probeLighting.ts`** (−0,7); y `scene-framing` partido en dos suma 1,5 de docblock. Es el precio de las partículas, y está dicho.

### 8.6 · 🔴 Lo que estas 565 comprobaciones NO dicen

**No dicen que se vea bien.** El intro no corre bajo automatización (`navigator.webdriver !== true` en el gate pre-paint), así que la aparición, la caída y el instante en que el blanco se disuelve **solo se juzgan a ojo, por grabación**. En este sprint no se corrió el dev server, no se tomaron capturas, no se abrió el navegador y no se despachó `visual-qa`.

**`INTRO_FALL_WORLD` = 1,9 es una hipótesis medida, no una verificación visual.**

---

## 9 · Archivos

**Nuevos (12)**

```
src/lib/scene-camera.ts                          la cámara de una pose y la proyección de un punto
src/lib/scene-camera.invariant.ts                7 · que no haya quedado una segunda cámara
home-intro/introRig.ts                           la luz del intro, con el factor de cielo de la escena
home-intro/introRig.invariant.ts                 23 · el escalón, medido donde ocurre
home-intro/introParticles.ts                     la especie: constantes, rampa de color, teñido
home-intro/introParticleField.ts                 el campo proyectado
home-intro/introParticleTiming.ts                las dos ventanas y los muestreadores
home-intro/introParticleSprites.ts               los sprites de la escena, rasterizados en 2D
home-intro/IntroParticleCanvas.tsx               el canvas y su bucle
home-intro/introParticleProbe.ts                 el banco de medición de las tres suites
home-intro/introParticles.invariant.ts           21 · la especie y la divergencia
home-intro/introParticleField.invariant.ts       22 · la caída y dónde cuelga la capa
home-intro/introParticleTiming.invariant.ts      25 · la legibilidad y la superposición
```

**Modificados (16)**

```
src/lib/scene-framing.ts              frameScenePose consume la cámara nueva (una sola, no dos)
src/lib/scene-framing.invariant.ts    la sección de la cámara salió a su propia suite → 23, idéntico
home-intro/introShading.ts            la luz se fue a introRig.ts · +luminance/contrastRatio compartidos
home-intro/introShading.invariant.ts  el rig se fue a introRig.invariant.ts
home-intro/introSampling.invariant.ts consume el contraste compartido · salida IDÉNTICA
home-intro/introTimeline.ts           LINE_SETTLE_MARGIN_FRAC pasa a exportarse (mismo valor)
home-intro/introTimeline.invariant.ts +PARTICLES_BEFORE_VEIL y sus dos controles negativos
home-intro/IntroOverlay.tsx           la capa nueva, entre el velo y el lockup
home-intro/useIntroEngine.ts          publica el viewport
home-intro/IntroSceneLights.tsx       · IntroShadowPlane.tsx · IntroLogoCanvas.tsx ·
home-intro/IntroDevController.tsx     los cuatro leen el rig de introRig.ts
home-intro/IntroPreview.tsx           · layout/HomeIntro.tsx   los dos call sites del overlay
docs/rediseno/DIRECCION-ESCENA.md     §1.4 nuevo · §7.11 resuelto · §7.15 nuevo · §6 y estado
```

**Sin tocar:** todo `probe-escena/` (las partículas de la escena se **consumen**, no se cambian), el home, los seis frozen, `introFlight.ts`, `introSilhouette.ts`, `introSampling.ts`, `introBoot.tsx`, `introHandoff.ts`, `IntroLockup.tsx`, `IntroLogoStroke.tsx`, `introChecks.ts`, y los reportes de S8/S8d/S8e/S9/S10/S11/S12.

**Cero dependencias nuevas. Cero `any`. Cero `setState` por frame. Nada de base de datos. Blanco y negro.**

**Ningún archivo nuevo pasa de 300 líneas.** Los dos que quedan arriba son heredados: `introSampling.invariant.ts` (449, **bajó** de 458) e `introTimeline.ts` (419 ← 413, +6 líneas de docblock). Tres archivos se partieron para no cruzar el límite: `scene-framing.ts` → `scene-camera.ts`, `introParticles.ts` → `introParticleField.ts`, y las comprobaciones de las partículas en tres suites más el banco.

---

## 10 · Anotado, no implementado

- **`INTRO_FALL_WORLD` = 1,9 se juzga por grabación.** Vecinos: **1,2** si estrobea o se lee violenta · **3,0** si se lee como un desvanecimiento en el lugar. La banda acepta los dos.
- **El escalonado usa `PARTICLE_STAGGER_FRAC` = 0,45**, que es un número elegido con su razón escrita y no derivado de un token. Las dos cotas que importan sí están medidas (el desfase supera `REVEAL_STAGGER_S`, la duración supera `MOTION_DURATION.micro`) y corren **solo sobre el default**: `solo color brevísimo` y `corto` las violan las dos, y con razón.
- **El teñido cuantiza en 24 escalones** (peor error 3,0 de 255). Subirlo cuesta un canvas de 64 × 64 por escalón.
- **La cámara de `harness.ts`** — §7 y `DIRECCION-ESCENA.md` §7.15. Es `probe-escena/`, fuera de scope.
- **El intro sigue sin ser verificable por automatización**, y es deliberado.
- **Dos logos en pantalla durante el acomodamiento.** Cuando la escena se monte en el home, entre 4,95 y 7,35 s van a convivir el logo del intro volando y el de la escena quieto en su destino. Es el ⚠ que S8 dejó anotado y las partículas no lo cambian — pero ahora hay una diferencia menos entre los dos: **el ambiente**.

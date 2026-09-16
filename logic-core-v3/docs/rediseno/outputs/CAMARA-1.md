# CAMARA-1 · LA PALANCA DE DISTANCIA, MEDIDA Y SIMULADA — no aplicada

**Sprint de MEDICIÓN. No se aplicó nada.** `choreography.ts` quedó byte-idéntico:
sha256 `0c7c6e39…95a17d` antes y después de cada simulación, verificado por el
propio script. Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`,
sobre `5236872d` (TAPADO-1), o sea con `justify-end` abajo del breakpoint ya
puesto.

**Instrumentos** (nuevos, `scripts-camara/`):

| archivo | qué hace |
|---|---|
| `camara-comun.ts` | el banco: las ocho ventanas, el solver de distancia, el techo de la sala |
| `a-distancia.ts` | PASO 1 — la distancia que hace entrar la tinta con 5 % de margen, 7 keyframes × 8 ventanas |
| `b-despeje.ts` | PASO 1b — la distancia que DESPEJA el texto, con la curva completa |
| `c-rotura.ts` | PASO 2 — el aspecto, el preloader y el censo del gate |
| `d-simulacion.ts` | PASO 3 — aplica, captura, restaura y comprueba el sha256 |
| `e-gate.ts` | PASO 2 — corre `npm run verificar` con la palanca puesta, y restaura |

**Salidas**: `outputs/camara/`. **Capturas**: `capturas/camara/`, comparables
contra `capturas/tapado/hoy-*.png`:

- **`d34-*.png`** (los seis anchos) — **la propuesta**: la distancia más lejana
  que la escena admite sin salirse de su propio mobiliario.
- `d40-*.png` (los seis) y `d54-*.png` (320 y 375) — **referencia, no propuesta**:
  están fuera del campo de motas (radio 34) y sirven para mostrar que ni siquiera
  ahí 375 llega a un dígito.

---

## 0 · EL VEREDICTO, ARRIBA DE TODO — **(B)**

**La palanca sirve en cuatro de los seis anchos.** Medido en el navegador, con el
texto donde TAPADO-1 lo dejó, a la distancia más lejana que la escena admite sin
romperse (**d = 34**, ver abajo):

| ancho | tinta del titular sobre el logo, HOY | con d=34 | |
|---|---|---|---|
| 320 × 568 | 31,5 % | **11,1 %** | 🔴 dos dígitos |
| 375 × 667 | 47,2 % | **25,1 %** | 🔴 **dos dígitos** |
| 390 × 844 | 17,2 % | **7,2 %** | ✅ |
| 425 × 844 | 11,4 % | **2,9 %** | ✅ |
| 768 × 1024 | 41,6 % | **4,3 %** | ✅ |
| 1024 × 768 | 15,8 % | **0,2 %** | ✅ |

### 🔴 Y el techo NO es la pared de la sala: es el mobiliario de la escena

La hipótesis del sprint era que la palanca tenía lugar porque *«el logo entra al
100 % en los keyframes de distancia 27»*. Lo tiene, pero mucho menos del que
parece. Correr el gate entero con `distance: 40` puesto (§5) devolvió **siete
fallas que no son de composición sino de que la cámara se sale de las piezas de la
sala**:

- **el campo de motas llega a radio 34** y la cámara quedaría a 40,51;
- **la capa fina del fondo está en 38** y la cámara la pasaría por detrás;
- **el moiré del hero deja de leerse como banda**: de las 2–5 que la regla pide a
  **16,3**.

O sea que el rango útil de la palanca no es 19–58: es **19–34**, y con holgura
19–38. Todo lo de arriba de eso ya no es mover una cámara, es cambiar la escena.

### La cifra que la mata

**375 × 667.** A d=34 queda en 25,1 %; a d=40 (ya fuera del mobiliario) en 20,3 %;
y **a d=54, contra la pared misma, todavía en 14,8 %**. No existe distancia que lo
lleve a un dígito, y el motivo no es el tamaño: **alejar la cámara no aparta el
logo, lo concentra en el centro del cuadro**, y a 375 el centro del cuadro cae
10 px adentro del bloque de texto (§4.3).

### Y el costo de presencia, medido

La tinta del logo pasa de ocupar el **17–18 %** del cuadro a **4–7 %** a d=34, y su
ancho a 320 pasa de **1,962 a 1,146** en coordenada de cuadro. Para comparar: **a
1440 el logo ocupa hoy el 6,2 %**. Con la palanca, el logo del teléfono queda
igual o más chico que el del escritorio.

---

## 1 · PASO 1 — CUÁNTO HAY QUE ALEJAR

### 1.1 · La premisa de la instrucción se corrige con su medición

La instrucción dice *«el logo NO ENTRA»*. **Entra en cuatro de los seis anchos, y
en los otros dos entra pero toca los bordes.** El ancho de la tinta en
coordenada de cuadro (el cuadro mide 2,000), pose del hero:

| ancho | ancho de la tinta | ¿entra en ±1? | ¿entra con 5 % de margen (±0,90)? |
|---|---|---|---|
| 320 × 568 | 1,962 | sí, al borde | no, por 0,08 |
| 375 × 667 | 1,962 | sí, al borde | no, por 0,08 |
| **390 × 844** | **2,387** | **NO, por 19 %** | no |
| **425 × 844** | **2,186** | **NO, por 9 %** | no |
| 768 × 1024 | 1,465 | sí | **sí** |
| 1024 × 768 | 0,827 | sí | **sí** |

O sea: **sólo 390 y 425 tienen el problema que la instrucción describe**, y es el
que ya estaba medido en VERTICAL-1 (2,37 contra 2,00). En 320 y 375 la tinta
entra y *llena*; en 768 y 1024 entra con aire.

### 1.2 · La distancia que hace entrar la tinta con 5 % de margen

Los siete keyframes × las seis ventanas en alcance. `techo` es el radio de la sala
a la altura de ese keyframe menos 4 unidades de holgura declarada.

| keyframe | d hoy | 320 | 375 | 390 | 425 | 768 | 1024 | techo |
|---|---|---|---|---|---|---|---|---|
| hero | 19 | 20,25 ×1,07 | 20,30 ×1,07 | **24,80 ×1,31** | 22,75 ×1,20 | ya entra | ya entra | 58,0 |
| quiénes somos | 14 | 17,65 ×1,26 | 17,68 ×1,26 | **21,39 ×1,53** | 19,68 ×1,41 | ya entra | ya entra | 37,7 |
| números | 18,5 | 18,90 ×1,02 | 18,95 ×1,02 | **23,65 ×1,28** | 21,45 ×1,16 | ya entra | ya entra | 60,7 |
| trabajos | 20 | ya entra | 20,05 ×1,00 | **24,47 ×1,22** | 22,42 ×1,12 | ya entra | ya entra | 55,7 |
| demos | 14 | 15,96 ×1,14 | 16,00 ×1,14 | **19,73 ×1,41** | 18,05 ×1,29 | ya entra | ya entra | 41,8 |
| cierre | 27 | ya entra | ya entra | ya entra | ya entra | ya entra | ya entra | 45,4 |
| cierre · sostén | 27 | ya entra | ya entra | ya entra | ya entra | ya entra | ya entra | 45,4 |

**El techo de la sala nunca es el límite de este criterio**: el mayor factor
pedido es ×1,53 y el mayor valor absoluto 24,80, contra techos de 37,7 a 60,7.

### 1.3 · 🔴 Y lo que de verdad decide: el alto libre NO alcanza

Con la tinta entera adentro (criterio de §1.2), **cuánto alto libre queda abajo
del logo para el texto**, contra lo que el bloque necesita. El bloque es el
medido en el navegador por TAPADO-1, y los 80 px son `pb-20`, la reserva de la
pastilla, que no se toca.

| ancho | bloque | libre abajo HOY | libre abajo con §1.2 | útil (−80) | ¿entra? |
|---|---|---|---|---|---|
| 320 × 568 | 378 | 182 | 188 (+6) | 108 | **NO** |
| 375 × 667 | 264 | 213 | 221 (+8) | 141 | **NO** |
| 390 × 844 | 265 | 270 | 300 (+30) | 220 | **NO** |
| 425 × 844 | 243 | 270 | 295 (+25) | 215 | **NO** |
| 768 × 1024 | 424 | 327 | 327 (+0) | 247 | **NO** |
| 1024 × 768 | 279 | 241 | 241 (+0) | 161 | **NO** |

**El criterio de la instrucción no sirve como criterio.** Alejar hasta que los
costados entren mueve la banda libre entre 0 y 30 px, y el bloque necesita entre
161 y 270 px más. *«El logo entra pero ocupa todo el alto igual»* es exactamente
lo que pasa, y por eso el sprint siguió con otra pregunta.

---

## 2 · PASO 1b — LA DISTANCIA QUE DESPEJA EL TEXTO

La pregunta correcta: **¿a qué distancia la tinta deja de pisar el texto donde el
texto está?** Se mide con `superposicionReal` —el cruce en dos ejes que TAPADO-1
dejó arreglado y contrastado contra el navegador—, no con la banda vertical.

> ⚠ **La banda vertical sola miente, y se probó.** La primera versión de este
> solver preguntaba si el borde de abajo de la tinta quedaba arriba del bloque.
> Eso vale sólo cuando la tinta cruza la columna a lo ancho. A 1440 la tinta vive
> a la derecha y la columna a la izquierda: aquel criterio daba «pisa por 112 px»
> donde TAPADO-1 mide **0,7 %**. Un criterio que da rojo sobre una pantalla limpia
> no es conservador: es otro criterio.

| ancho | superp. hoy | d para <10 % | d para <1 % | cobertura hoy → a <1 % |
|---|---|---|---|---|
| 320 × 568 | 33,3 % | d=40 (9,6 %) | **NO HAY** | 17,2 % → — |
| 375 × 667 | 28,1 % | d=33 (9,1 %) | **NO HAY** | 17,2 % → — |
| 390 × 844 | 5,1 % | ya | **d=28** (0,7 %) | 18,0 % → 9,9 % |
| 425 × 844 | 3,3 % | ya | **d=23** (0,8 %) | 18,1 % → 13,4 % |
| 768 × 1024 | 11,1 % | d=20 | **d=37** (0,9 %) | 12,9 % → 3,5 % |
| 1024 × 768 | 8,7 % | ya | **d=37** (1,0 %) | 7,4 % → 2,1 % |

*(cifras derivadas; las del navegador están en §4 y difieren en 320 y 375 — ver §4.2)*

### 2.1 · ⚠ La distancia pedida NO es una función del aspecto

| ancho | aspecto | d que despeja |
|---|---|---|
| 390 | 0,4621 | 28 |
| 425 | 0,5036 | 23 |
| 375 | 0,5622 | 33 |
| 320 | 0,5634 | 40 |
| 768 | 0,7500 | 37 |
| 1024 | 1,3333 | 37 |

Ordenado por aspecto la secuencia es **28 · 23 · 33 · 40 · 37 · 37**: no es
monótona. Lo que sí la ordena es **cuánto del viewport ocupa el bloque de texto**
(28,8 % → d=23; 66,5 % → d=40). O sea que la distancia que la escena necesita
está gobernada por **la tipografía del titular y sus cortes de línea**, no por la
ventana. Una palanca por ventana tendría que acoplarse a una medición de layout
que hoy no existe.

---

## 3 · PASO 2 — QUÉ ROMPE

### 3.1 · 🔴 El aspecto NO separa; el ancho sí

| | aspectos |
|---|---|
| **en alcance** | 320×568 **0,5634** · 375×667 0,5622 · 390×844 0,4621 · 425×844 0,5036 · 768×1024 0,7500 · **1024×768 1,3333** |
| **arriba de 1025** | **1025×900 1,1389** · 1025×844 1,2145 · 1025×768 1,3346 · 1025×667 1,5367 · 1440×900 1,6000 · 1920×1080 1,7778 |

**El mayor en alcance (1,3333) es mayor que el menor de arriba (1,1389): se
cruzan.** Cualquier umbral que capture 1024×768 captura también 1025×900 y
1025×844, que están arriba del umbral y no se pueden mover. Y 1024×768 contra
1025×768 difieren en **0,0013**: un umbral entre los dos sería un número que se
rompe con un píxel de barra de scroll.

**Sin 1024×768 el aspecto sí separa**, con un umbral en cualquier punto de
(0,7500 · 1,1389).

**Lo que separa limpio es el ANCHO, y el mecanismo ya existe**: el umbral 1025
(`ESCENARIO_MIN_ANCHO_PX`) es el mismo que decide la variante `escritorio:` y el
nivel de calidad de la escena, y MOVIL-1 ya lo cablea hasta adentro del chunk
perezoso — `calidadPorAncho(arribaDelUmbral)` → `ajustesDe(nivel)` →
`EscenaDelHome`, resuelto **al montar** (`key={calidad}`). Un
`distanciaFactor` en `AjustesDeCalidad` viajaría por ese mismo canal y con
`plena: 1` **1440 y 1920 quedan intactos por construcción**.

⚠ **Pero ese canal es BINARIO.** `NivelDeCalidad` tiene dos valores, así que
puede llevar UN factor para todo `compacta`, no seis. El único valor que sirve
para todos es el mayor, y es lo que §4 simula.

### 3.2 · El preloader

`SCENE_ENTRY_POSE` **es** `CHOREO_KEYFRAMES[0].pose` (`lib/scene-framing.ts:144`).
La distancia del hero es, literalmente, la pose de aterrizaje del preloader.

**(a) El codo `max(0, …)` se SUELTA.** `lib/scene-camera.ts:127` conserva el
`max(0, …)` que el resto del repo ya arregló. Hoy, a 390 y 425, ese codo deja
`frameX` clavado: cinco valores de `frameX` y un solo aterrizaje. Con la palanca,
el cuadro crece, el codo suelta y la perilla vuelve a mover:

| ancho | d | centro de aterrizaje | recorrido de `frameX` |
|---|---|---|---|
| 390 × 844 | 19 | 195,00 px | **CLAVADO** |
| 390 × 844 | 28 | **210,44 px** | libre, 61,8 px |
| 425 × 844 | 19 | 212,50 px | **CLAVADO** |
| 425 × 844 | 23 | **221,35 px** | libre, 35,4 px |

Es una mejora de coherencia —el preloader dejaría de aterrizar en un lugar que la
escena no usa— y a la vez **mueve 15 px el punto donde el logo del preloader se
posa a 390**, que es una composición aprobada.

**(b) La ROTACIÓN de aterrizaje cambia, y es un valor único.**
`SCENE_ENTRY_VIEW.pitchDeg = atan2(height − ORBIT_TARGET_Y, distance)`, constante
de módulo:

Con `ORBIT_TARGET_Y = 0` y `height = 6,4`, o sea `atan(6,4 / d)`:

| d | pitch | Δ contra hoy |
|---|---|---|
| **19 (hoy)** | **18,616°** | — |
| 23 | 15,550° | −3,07° |
| 28 | 12,875° | −5,74° |
| 37 | 9,814° | −8,80° |
| **40** | **9,090°** | **−9,53°** |

Si la distancia pasa a depender del ancho, **esta constante también tiene que
pasar a depender del ancho**, o el traspaso muestra el logo saltando **9,53°** en
el cuadro en que la escena toma el control.

**(c) Sobre el preloader que no sale en Safari real en un iPhone: le da igual.**
La palanca cambia *dónde* aterriza, no *si* pinta. No lo mejora ni lo empeora — y
eso no es una suposición: lo que decide si el preloader se monta es
`escenaRetenida(etapaDelIntro, introEnteredClean())`, que no lee la distancia por
ningún camino. Lo que sí hace la palanca es **volver el aterrizaje dependiente del
ancho**, o sea agregarle una variable al sprint que vaya a arreglar ese bug.

### 3.3 · Qué instrumentos se ponen en rojo

Ver §5: se corrió `npm run verificar` entero con la palanca puesta. **Veinte
invariantes en rojo, de los cuales diecinueve los causa la palanca** y uno es del
entorno de este banco.

---

## 4 · PASO 3 — LA SIMULACIÓN

### 4.1 · Cómo se hizo sin dejar nada aplicado

`choreography.ts` es la única puerta a la distancia en runtime: el rig arma su
pista con `buildTrack(CHOREO_KEYFRAMES)` adentro de un closure
(`pistaDelHome.ts`) y no hay store, prop ni query por donde inyectar otra. Así
que `d-simulacion.ts` **escribe el archivo y lo devuelve**, con tres garantías:
respaldo fuera del árbol, restauración en `finally`, y **sha256 comparado al
cerrar con salida 1 si no coincide**. Las dos corridas imprimieron
`IDENTICO al original`.

⚠ Escribir el archivo aplica la distancia en **todos** los anchos, así que **no se
capturaron 1440 ni 1920**: mostrarlos movidos sería mostrar un artefacto del
banco, no la propuesta (que iría condicionada, §3.1).

### 4.2 · Lo medido en el navegador, con recarga limpia por ancho

Tinta del titular sobre la masa negra del logo, técnica de TAPADO-1 (tres capas
separadas por hoja de estilos), `deviceScaleFactor` 1:

| ancho | HOY | **d = 34** (dentro del mobiliario) | d = 40 | d = 54 |
|---|---|---|---|---|
| 320 × 568 | 31,5 % | **11,1 %** | 6,6 % | 1,9 % |
| 375 × 667 | 47,2 % | **25,1 %** | 20,3 % | **14,8 %** |
| 390 × 844 | 17,2 % | **7,2 %** | 2,0 % | — |
| 425 × 844 | 11,4 % | **2,9 %** | 0,3 % | — |
| 768 × 1024 | 41,6 % | **4,3 %** | 0,5 % | — |
| 1024 × 768 | 15,8 % | **0,2 %** | 0,2 % | — |

La columna de **d=34** es la única que se puede proponer: 40 y 54 están fuera del
campo de motas (34) y, 40, contra la capa fina del fondo (38). La tinta bajo AA
sigue a la superposición de cerca en los seis (10,7 % · 24,7 % · 5,5 % · 1,9 % ·
4,2 % · 0,2 % a d=34).

⚠ **El modelo derivado y el navegador se separan en 320 y 375**, los dos anchos
más chicos: el modelo predijo 9,6 % y 6,0 % con d=40 y el navegador mide 6,6 % y
20,3 %. La causa es la de TAPADO-1 —el modelo cuenta los renglones del titular
distinto en los anchos donde el corte de línea cambia—, y **manda el navegador**.

### 4.3 · Por qué 375 no se deja arreglar — el mecanismo, medido

**Alejar la cámara no APARTA el logo: lo CONCENTRA en el centro del cuadro.** A
medida que crece la distancia, la tinta se encoge hacia su centro, que es
esencialmente el centro vertical del viewport. Entonces lo que decide es dónde
cae ese centro respecto del bloque de texto, que con `justify-end` se apoya abajo:

| ancho | centro del cuadro | tope del bloque | separación |
|---|---|---|---|
| 320 × 568 | 284 | 110 | **174 px ADENTRO del bloque** |
| 375 × 667 | 333 | 323 | **10 px adentro** |
| 390 × 844 | 422 | 499 | 77 px arriba ✅ |
| 425 × 844 | 422 | 521 | 99 px arriba ✅ |
| 768 × 1024 | 512 | 520 | 8 px arriba |
| 1024 × 768 | 384 | 409 | 25 px arriba |

Y la otra mitad, que explica por qué 768 y 1024 sí se resuelven: **la columna del
titular se angosta a la mitad en el breakpoint `tablet` (768 px)**, así que ahí el
logo tiene a dónde irse **de costado** —y el codo suelto de §3.2 lo empuja, con
`frameX: 0,5`, exactamente a ese lado—:

| ancho | banda del titular | % del viewport |
|---|---|---|
| 320 | x=32, ancho=256 | 80,0 % |
| 375 | x=32, ancho=311 | 82,9 % |
| 390 | x=32, ancho=326 | 83,6 % |
| 425 | x=32, ancho=361 | 84,9 % |
| **768** | x=184, ancho=364 | **47,4 %** |
| **1024** | x=184, ancho=535 | **52,2 %** |

**Los tres regímenes, entonces:**

- **390 y 425** se resuelven **por arriba**: el bloque ocupa el 29–31 % del alto y
  el centro del cuadro queda 77–99 px por encima de él.
- **768 y 1024** se resuelven **de costado**: la grilla `tablet` deja la columna en
  el 47–52 % del ancho y el logo se va a la derecha.
- **320 y 375** no tienen ninguna de las dos: columna del 80–83 % y bloque del
  40–67 % del alto, con el centro del cuadro cayendo adentro del bloque.

⚠ **Y la diferencia entre 320 (6,6 %) y 375 (20,3 %) NO es estructural.** En los
dos el centro cae adentro del bloque; lo que cambia es **en qué renglón aterriza
la marca ya encogida**. A 375 cae justo sobre «TU NEGOCIO VENDIENDO»; a 320 cae en
el interlineado, entre «LAS 24» y «HS» —y ahí **toca el «24» por adentro del
lazo**, que es una colisión que el 6,6 % de tinta-sobre-tinta subestima porque
mide sólo píxeles pisados, no vecindad. Eso lo mueve un cambio de copy o un corte
de línea, así que **el 6,6 % de 320 no es un resultado en el que apoyarse**, y lo
que se ve en `d40-320x568.png` lo juzga el humano.

### 4.4 · El costo de presencia, con su número

Qué fracción del cuadro es tinta del logo (derivado, malla 440 × 440):

| ancho | HOY | d = 40 | ancho de la tinta hoy → d=40 |
|---|---|---|---|
| 320 × 568 | 17,2 % | **4,0 %** | 1,962 → 0,957 |
| 375 × 667 | 17,2 % | **4,0 %** | 1,962 → 1,146 |
| 390 × 844 | 18,0 % | **4,9 %** | 2,387 → 1,655 |
| 425 × 844 | 18,1 % | **4,5 %** | 2,186 → 1,832 |
| 768 × 1024 | 12,9 % | **3,0 %** | 1,465 → 0,780 |
| 1024 × 768 | 7,4 % | **1,7 %** | 0,827 → 0,437 |
| *1440 × 900 (hoy, para comparar)* | *6,2 %* | — | *0,697* |
| *1920 × 1080 (hoy, para comparar)* | *5,7 %* | — | *0,638* |

**La lectura, sin adornos**: el logo pasa de ocupar entre el 7 y el 18 % del
cuadro a ocupar entre el 1,7 y el 4,9 %. **En los SEIS queda más chico que el logo
que hoy se ve en 1440** (6,2 %), y a 1024 queda en **1,7 %**, o sea un cuarto de
lo que muestra el escritorio. Si el humano mira la captura
`d40-1024x768.png` al lado de `tapado/hoy-1024x768.png`, eso es lo que va a
juzgar; el número es que la marca pierde entre **3,5× y 4,4×** de superficie.

---

## 5 · EL GATE CON LA PALANCA PUESTA

`e-gate.ts` aplicó `distance: 40`, corrió `npm run verificar` entero y restauró
(sha256 idéntico). **Veinte invariantes en rojo en trece agregados.** Cada uno se
volvió a correr contra el árbol RESTAURADO para separar lo que causa la palanca de
lo que ya estaba: **diecinueve verdes en baseline y rojos con la palanca** —o sea
causados por ella— y **uno rojo en los dos**, que no es de este sprint (§5.4).

### 5.1 · Esperados — la composición y el encuadre (12 fallas)

`s10-vertical` (5) · `s16-encuadre` (3) · `s9e-composicion` (3) · `s7e-recorridos` (1)

Son las afirmaciones que clavan la composición de hoy, y mover la cámara **tiene**
que moverlas. Las más legibles:

- `s10-vertical`: *«🔴 `hero`: la tinta es MÁS ANCHA que el cuadro»* pasa a
  **1,1613 contra 2,0000 — entra el 100,0 %**. Es el defecto que la palanca
  arregla, y por eso su afirmación se cae.
- `s10-vertical`: la posición horizontal clavada, **215,28 → 228,80 px**.
- `s9e-composicion`: *«EL EJE ÓPTICO VUELVE A APUNTAR AL LOGO»* — x0 pasa de
  0,3553 a 0,2167.
- 🔴 `s7e-recorridos`: *«todas las poses caben en los rangos de los sliders ·
  hero»*. **La distancia 40 se sale del rango del slider del panel de
  calibración.** No es cosmético: el recorrido dejaría de ser editable en
  `/probe-escena` sin tocar también ese rango.

### 5.2 · Esperados — el preloader y el intro (25 fallas)

`s8e-encuadre` (11) · `s8-relevo` (4) · `s14e-intro-escala` (3) ·
`s8e-intro-silueta` (2) · `s8-intro`, `s8e-intro-vuelo`, `s13e-intro-particulas`,
`s14e-intro-lectura`, `s15e-intro-acomodo` (1 cada uno)

Es el racimo más grande y era previsible: `SCENE_ENTRY_POSE` **es** la pose del
hero, así que la distancia del hero es el destino de todo el vuelo del intro. Lo
que miden:

- **La tinta del preloader queda a menos de la mitad**: *«la tinta mide 445 × 310
  px»* → **222 × 154 px**, contra los 523 × 364 de la calibrada.
- **El clamp de ancho deja de actuar**: *«en 390×844 el clamp SÍ actúa — sin él el
  logo desbordaría»* → **×1,000**. O sea que el logo del preloader ya no desborda
  y el clamp queda inerte.
- **El centro de aterrizaje se mueve**: (940, 417) → (989, 414).
- **La elevación de entrada**: *«con la elevación de entrada de S9»* → **9,0903°**,
  que es exactamente el §3.2(b) de este reporte, confirmado por el gate.

### 5.3 · 🔴 NO esperados — la cámara se sale del MOBILIARIO de la sala (7 fallas)

**Esto es lo que no estaba en la hipótesis del sprint, y cambia el techo de la
palanca.** El límite no es la pared del ciclorama (62 a la altura del hero): son
las piezas que la escena tiene adentro.

| instrumento | lo que falla | el número |
|---|---|---|
| `s10e-fondo` | la cámara pasa **detrás de la capa fina del fondo** | *«capa fina en 38, cámara máxima en 40»* |
| `s13e-intro-particulas` | la cámara queda **fuera del campo de motas** | *«el campo llega a radio 34 con la cámara a 40,51: una mota puede quedar a −6,51 por delante»* |
| `s11e-pantalla` | el **moiré deja de leerse como banda** | *«hero celda 34px · batido 118px = **16,3 bandas**»*, contra las dos a cinco que la regla pide |
| `s12e-barrido` | el hero **cruza el techo de luz** | *«α = 0,266° da 212,6 contra el techo de 210 — −2,6 de margen»* |
| `s12e-penumbra`, `s12e-tension`, `s11e-piso` | las poses de calibración de la luz dejan de reproducirse | *«hero 222,7 (S10 216)»* |

**El techo real de la palanca, entonces, no es 58: es 34** —el radio del campo de
motas— y con holgura, **38** —la capa fina del fondo—. Todo lo que este reporte
propuso arriba de eso deja de ser una palanca y pasa a ser otra escena.

### 5.4 · El único rojo que NO es de la palanca: `s5-peso`

`s5-peso` da rojo **también con el árbol restaurado**, así que no lo causa este
sprint. Como mide bytes del BUILD (`DIST`) y este banco había levantado un dev
server —que pisa `.next`—, se descartó esa explicación **corriendo un build de
producción limpio y repitiendo**: **23 afirmaciones, 2 fallas**. O sea que el rojo
está en el árbol commiteado (`5236872d`, TAPADO-1), no en el entorno. Dice:

```
FALLA lo que ESCRIBE el lane, sin el andamio de la llave, entra en 64.49 KiB crudo
      — 64.5 KiB — -12.4 B de aire
FALLA   y el techo VIEJO ... el lane entra en 60 KiB — 60.012 KiB
```

Doce bytes por arriba del techo. El propio invariante ya publica su salida:
*«🟡 PROPUESTA SIN APLICAR … subir ESTA línea de 0.69 a 0.7 KiB. Razón en una
línea: con 0.69 el aire queda en 0.6 B —más chico que el ruido de redondeo del
propio build— y con 0.7 queda en 10.8 B … El techo de 60 NO se mueve; cuesta
10.2 B de techo que este sprint no usa»*.

🔴 **Es una deuda de TAPADO-1 que hay que cerrar, y no es de este bloque: no se
tocó nada.** Subir esa línea es una decisión del humano en su parada, que es
exactamente cómo el repo mueve un techo.

---

## 6 · LO QUE QUEDA ANOTADO

1. 🔴 **El techo real de la palanca es 34, no 58.** Lo fija el mobiliario de la
   escena —campo de motas en radio 34, capa fina del fondo en 38— y no la pared
   del ciclorama. El gate lo devuelve en siete fallas (§5.3). Todo lo que este
   reporte calculó arriba de 34 queda como referencia, no como propuesta.
2. 🔴 **375 × 667 no se resuelve con esta palanca a ninguna distancia**: 25,1 % a
   d=34, 20,3 % a d=40 y 14,8 % a d=54 —contra la pared—.
3. 🔴 **320 × 568 tampoco, adentro del mobiliario**: 11,1 % a d=34. Llega a un
   dígito recién a d=40, o sea fuera del campo de motas.
4. 🔴 **El canal existente es binario** y las seis distancias pedidas son
   distintas y no ordenadas por aspecto (§2.1): una palanca por ventana necesita
   un mecanismo que hoy no existe.
5. ⚠ **`SCENE_ENTRY_VIEW.pitchDeg` es una constante de módulo** y tendría que
   volverse dependiente del ancho, o el traspaso del preloader salta 9,53° con
   d=40.
6. ⚠ **El codo `max(0, …)` de `lib/scene-camera.ts` se suelta con la palanca** y
   mueve el aterrizaje del preloader 15 px a 390. Es coherencia ganada y
   composición movida a la vez.
7. ⚠ **El resultado de 320 es frágil**: depende de en qué renglón cae la marca
   encogida, no de una propiedad del layout.
8. ⚠ **Las otras seis secciones quedaron medidas sólo en el criterio de §1.2.**
   No se publicó para ellas la superposición con su texto porque el modelo
   vertical de TAPADO-1 está contrastado contra el navegador **sólo para el
   hero**: en las otras devuelve clases sin modelar (`sticky`, `flex-1`), y una
   cifra derivada de un modelo sin recibo no es una cifra. Lo que TAPADO-1 ya
   midió en el navegador sigue en pie y sigue peor que el hero: `numeros` con
   90,3 % de pico y 66,1 % de su tinta bajo AA a lo largo de 3,35 pantallas.
   **Ninguna palanca de cámara del hero toca eso.**
9. 🔴 **`s5-peso` está en rojo en el árbol commiteado** (12,4 B por arriba del
   techo), comprobado contra un build de producción limpio. Es deuda de TAPADO-1,
   no de este bloque, y el invariante ya publica su salida (§5.4).
10. ⚠ **El slider de distancia de `/probe-escena` no llega a 40** (`s7e-recorridos`):
    con la palanca arriba de su rango, el recorrido dejaría de ser editable en el
    panel sin tocar también ese rango.

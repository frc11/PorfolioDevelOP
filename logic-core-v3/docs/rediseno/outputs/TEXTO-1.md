# TEXTO-1 · BAJAR EL BLOQUE DE TEXTO DEL HERO — medido, y **no se aplicó nada**

**Sprint de MEDICIÓN, cerrado por el PASO 5 de su propia instrucción.** Ningún
archivo de `src/` cambió: el árbol cierra como abrió. Worktree
`C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, sobre `97d3d478`
(PAPEL-1), con los cambios de MOVIL que ya estaban sin commitear en el working
tree y que este sprint **no** tocó.

**Instrumentos** (nuevos, `scripts-texto/`):

| archivo | qué hace |
|---|---|
| `texto-comun.ts` | el lector del bloque pieza por pieza; cuenta renglones con un `Range`, no con una división |
| `a-desglose.ts` | PASO 1 — de dónde sale el alto, línea por línea, en los ocho anchos |
| `b-palancas.ts` | PASO 2 — cada palanca por separado, y el avance real de cada cara |
| `c-minima.ts` | la búsqueda de la mínima sobre 9.600 combinaciones, con el modelo validado contra 272 puntos medidos |
| `d-superposicion.ts` | la cifra de ACEPTACIÓN simulada: el cruce de TAPADO-1 con cada configuración puesta por CSS |
| `gate-por-grupos.sh` | el gate corrido grupo por grupo, con reanudación — por qué, en §9.1 |

**Salidas**: `outputs/texto/`. **Capturas**: `capturas/texto/`, 50 archivos y
17 MB — las **seis** configuraciones que el informe usa para decidir (0, 3, 4, 5,
6 y 7) en los ocho anchos, más las dos de la palanca de layout de §7 D1.
Comparables contra `capturas/tapado/hoy-*.png`, que es el ANTES y no se tocó.

⚠ Se midieron 16 configuraciones y se capturaron las 16 × 8; **las 80 imágenes de
las diez que no entran en ninguna recomendación se borraron a propósito.** Las
cifras de las dieciséis están enteras en `outputs/texto/d-superposicion-sim.json`,
que es el registro que vale. El motivo es medido: con 130 PNG nuevos sin
seguimiento, el `git status -z -uall` que corre la extensión de git de VS Code
subió a **777 MB de working set** y dejó la máquina sin memoria para el gate.

---

## 0 · EL RESULTADO, ARRIBA DE TODO

**El objetivo no se puede alcanzar, y la premisa que lo sostiene está refutada
sobre el píxel.**

Tres cosas, en orden de importancia:

1. **El hueco libre no es 0,32 del alto: es 0,098 (0,095 a 0,100).** La escena tiene una SEGUNDA
   masa negra que empieza en **0,781 del alto** en los seis anchos angostos. El
   espacio verdaderamente libre entre las dos masas mide **57 a 100 px** (0,095 a
   0,100 del alto), no los 181 a 324 que sobran debajo de la primera. El bloque
   mide 243 a 424 px: es **4,0 veces** el hueco a 375 y **4,2 veces** a 768.

2. **Los 52 y los 100 px del enunciado ya gastaron `pb-20`.** Se reprodujeron
   exactos con el instrumento (52,34 y 100,34) y salen de comparar el bloque
   contra el borde de abajo del *viewport*. El árbol apoya el bloque 80 px más
   arriba, porque `pb-20` reserva los 72 px de la pastilla. Con `pb-20` intacto
   faltan **132,34 px a 375** y **180,34 a 768**. **Ninguna** de las 9.600
   combinaciones barridas llega: 0 de 9.600.

3. **A 320 bajar el bloque lo EMPEORA, medido.** Ahí el bloque no está arriba
   del hueco: está a caballo del logo entero y su mitad de arriba ya sale por
   encima de la masa. La superposición de hoy —31,6 %— es la **mejor** de las 16
   configuraciones probadas; la peor llega a 60,6 %.

Lo que sí quedó medido y sirve: **a 768 una sola palanca lleva la superposición
del titular de 41,6 % a 0,4 %** — bajar el piso de `--text-fluido-display-xl` de
67 a 64. No hace falta tocar nada más, y agregarle cualquier corrimiento la
vuelve a subir a 16,7 %.

---

## 1 · PASO 1 — DE DÓNDE SALE EL ALTO, LÍNEA POR LÍNEA

`a-desglose.ts`, sobre la página en reposo, con recarga limpia por ancho. Los
renglones se cuentan con `Range.getClientRects()` —un rectángulo por caja de
línea— y no dividiendo el alto por el interlineado.

| ancho × alto | línea 1 | línea 2 | **titular** | hueco | bajada | hueco | CTA | **BLOQUE** |
|---|---|---|---|---|---|---|---|---|
| 320 × 568 | **2** × 37,00 = 80,66 | **2** × 67,00 = 146,03 | 226,69 | 32 | **2** × 24 = 48 | 24 | 47 | **377,69** |
| 375 × 667 | 1 × 37,00 = 40,33 | 1 × 67,00 = 73,02 | 113,34 | 32 | **2** × 24 = 48 | 24 | 47 | **264,34** |
| 390 × 844 | 1 × 37,30 = 40,64 | 1 × 67,52 = 73,58 | 114,22 | 32 | **2** × 24 = 48 | 24 | 47 | **265,22** |
| 425 × 844 | 1 × 37,99 = 41,39 | 1 × 68,74 = 74,91 | 116,30 | 32 | 1 × 24 = 24 | 24 | 47 | **243,30** |
| 768 × 1024 | **2** × 44,75 = 97,53 | **2** × 80,65 = 175,81 | 273,34 | 32 | **2** × 24 = 48 | 24 | 47 | **424,34** |
| 1024 × 768 | 1 × 49,80 = 54,27 | 1 × 89,55 = 97,59 | 151,86 | 32 | 1 × 24 = 24 | 24 | 47 | **278,86** |
| 1440 × 900 | 1 × 58,00 = 63,22 | 1 × 104,00 = 113,36 | 176,58 | 32 | 24 | 24 | 47 | **303,58** |
| 1920 × 1080 | 1 × 67,46 = 73,53 | 1 × 120,68 = 131,53 | 205,06 | 32 | 24 | 24 | 47 | **332,06** |

Los dos huecos son `gap-8` (32 px) entre el titular y la bajada, y `gap-6`
(24 px) entre la bajada y el CTA. El `pt-20`/`pb-20` valen 80 y 80 en los ocho.
El CTA mide 47 px en los ocho y es estructural: `padding` 8 + 8, ventana de
recorte 24 (15 px × 1,6), `gap-1` 4 y subrayado 3.

**Y lo primero que la tabla dice, que no estaba en el diagnóstico: a 375 el
titular NO es el que pone el alto.** Son 113,34 de 264,34, el **42,9 %**. Los
otros 151 px son CTA (47), bajada (48) y los dos huecos (56).

| ancho | titular / bloque |
|---|---|
| 320 | 60,0 % |
| **375** | **42,9 %** |
| 390 | 43,1 % |
| 425 | 47,8 % |
| 768 | 64,4 % |
| 1024 | 54,5 % |

El costo fijo —CTA 47 + los dos huecos 56 = 103 px, más 24 de bajada si entrara
en una línea— es **127 px**, y no depende de la tipografía. A 375, con `pb-20`
intacto, el presupuesto entero del bloque son 132 px.

### 1.1 · Los dos escalones que explican el 320 y el 768

Los anchos donde el bloque se dispara son los dos donde el titular envuelve, y
en los dos el margen es chico:

| ancho | caja del titular | umbral L1 | L1 hoy | umbral L2 | L2 hoy |
|---|---|---|---|---|---|
| 320 | 256,00 | 31,35 | **37,00 ✗** | 55,84 | **67,00 ✗** |
| 375 | 311,00 | 38,08 | 37,00 | 67,84 | 67,00 |
| 390 | 326,00 | 39,92 | 37,30 | 71,12 | 67,52 |
| 425 | 361,00 | 44,21 | 37,99 | 78,76 | 68,74 |
| **768** | **364,00** | 44,58 | **44,75 ✗** | 79,41 | **80,65 ✗** |
| 1024 | 534,66 | 65,47 | 49,80 | 116,64 | 89,55 |
| 1440 | 478,39 | 58,58 | 58,00 | 104,37 | 104,00 |
| 1920 | 670,39 | 82,09 | 67,46 | 146,25 | 120,68 |

A 768 la línea 1 se pasa por **0,17 px de cuerpo** (44,750 contra 44,579) y la
línea 2 por **1,24** (80,653 contra 79,409). Es un escalón, no una degradación:
esos 0,17 px cuestan un renglón entero —**48,78 px de alto**— y los 1,24 de la
línea 2 cuestan **87,91**. Entre las dos, 136,69 de los 424,34 que mide el
bloque.

El umbral sale del avance MEDIDO de cada cara (`white-space: nowrap`, ancho
dividido por cuerpo): **8,1663 px por px de cuerpo** en la línea 1 y **4,5838**
en la línea 2, estables en los ocho anchos a la cuarta cifra. `geometria.ts`
publica 8,1870 para la línea 1 —el modelo conservador con el que se derivó el
58— y va para el lado seguro: a 1440 el margen real es 4,70 px y el declarado
3,55.

---

## 2 · PASO 2 — LAS PALANCAS, UNA POR UNA

`b-palancas.ts`, una hoja `!important` por palanca sobre la MISMA página. Píxeles
que baja el bloque (negativo = lo sube):

| palanca | 320 | 375 | 390 | 425 | **768** | 1024 | 1440 | **1920** |
|---|---|---|---|---|---|---|---|---|
| **a)** piso L1 37 → 36 | 2,2 | 1,1 | 1,1 | 1,0 | **49,4** | 0,4 | 0,0 | **−0,5** |
| **a)** piso L1 37 → 31 | 46,9 | 6,5 | 6,5 | 6,2 | 52,9 | 2,5 | 0,0 | −3,0 |
| **b)** piso L2 67 → 64 | 6,5 | 3,3 | 3,2 | 3,1 | **90,0** | 1,3 | 0,0 | **−1,5** |
| **b)** piso L2 67 → 62 | 10,9 | 5,4 | 5,4 | 5,2 | 91,3 | 2,1 | 0,0 | −2,5 |
| **b)** piso L2 67 → 55 | 86,1 | 13,1 | 12,9 | 12,4 | 96,2 | 5,1 | 0,0 | −5,9 |
| **b)** piso L2 67 → 50 | 91,5 | 18,5 | 18,3 | 17,7 | 99,6 | 7,2 | 0,0 | −8,4 |
| **b)** piso L2 67 → 44 | 98,1 | 25,1 | 24,7 | 23,9 | 103,7 | 9,8 | 0,0 | −11,3 |
| **c)** interlineado 1,09 → 1,05 | 8,3 | 4,2 | 4,2 | 4,3 | 10,0 | 5,6 | 6,5 | 7,5 |
| **c)** interlineado → 1,00 | 18,7 | 9,3 | 9,4 | 9,6 | 22,5 | 12,5 | 14,6 | 16,9 |
| **c)** interlineado → 0,95 | 29,1 | 14,6 | 14,7 | 14,9 | 35,1 | 19,5 | 22,7 | 26,3 |
| **c)** interlineado → 0,90 | 39,5 | 19,8 | 19,9 | 20,3 | 47,7 | 26,5 | 30,8 | 35,8 |
| **d)** `pt-20` → 0 | **0,0** | **0,0** | **0,0** | **0,0** | **0,0** | **0,0** | 0,0 | 0,0 |
| **d)** `pb-20` → 0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| **e)** bajada en 1 línea | 24,0 | 24,0 | 24,0 | 0,0 | 24,0 | 0,0 | 0,0 | 0,0 |
| *x)* hueco titular/bajada 32 → 8 | 24,0 | 24,0 | 24,0 | 24,0 | 24,0 | 24,0 | 24,0 | 24,0 |
| *x)* hueco bajada/CTA 24 → 8 | 16,0 | 16,0 | 16,0 | 16,0 | 16,0 | 16,0 | 16,0 | 16,0 |

Las dos últimas están **fuera de la lista de la instrucción** y se miden porque
el PASO 1 las pide desglosadas: juntas dan 40 px, más que cualquiera de las cinco
listadas a 375.

### 2.1 · `pt-20` no vale nada, y `pb-20` no baja el bloque: lo MUEVE

`pt-20` da **0 px en los ocho anchos**, y no es un error de medición: abajo del
breakpoint el bloque está apoyado abajo (`justify-end`) dentro de un `min-h-svh`,
así que el relleno de arriba es aire que nadie ocupa.

`pb-20` tampoco cambia el alto del bloque —no puede, no es parte de él— pero
mueve el bloque 80 px hacia abajo, 1 a 1. **Ésa es exactamente la diferencia
entre las dos lecturas del objetivo.** Ver §3.

### 2.2 · DOS TECHOS QUE NO SE VEN EN UNA CAPTURA, y los dos son invariantes

**① La palanca (a) tiene 1,00 px de recorrido, no trece.**
`s3-banda-afirmaciones` §2 exige que los diez niveles crezcan **estrictamente**
en los cuatro anchos de la banda, y 375 es uno de ellos. Ahí la escala vale:

```
… titulo-l 24,00 · titulo-xl 36,00 · display 37,00 · display-xl 67,00
```

`display` está a **1,00 px** de `titulo-xl`, y es uno de los cinco pares más
apretados del sistema. Bajar el piso de `display` abajo de 36 da vuelta la
escala. El propio tema lo tiene escrito: *«37 es el único entero que a la vez
pasa el piso de `titulo-xl`»*. El barrido que sugiere 13 px de recorrido está
midiendo algo que el repo no deja aplicar.

**② Bajar un piso SUBE el valor a 1920.**
`s3-tipografia` §2 exige que el tercer término de cada `clamp()` sea la recta
evaluada en el tope. Con el ancla de 1440 fija, mover el piso cambia la
PENDIENTE, y el techo es esa misma recta 480 px más allá:

| piso de `display-xl` | @1024 | @1440 | @1920 |
|---|---|---|---|
| **67 (hoy)** | 89,55 | **104,00** | **120,68** |
| 64 | 88,38 | **104,00** | 122,03 |
| 62 | 87,60 | **104,00** | 122,93 |
| 55 | 84,86 | **104,00** | 126,08 |
| 50 | 82,91 | **104,00** | 128,34 |
| 44 | 80,56 | **104,00** | 131,04 |

**1440 no se mueve un bit** —comprobado además en el navegador: las **diez**
configuraciones de §6 que llevan un piso distinto publican todas **104,00 px** a
1440, con la línea 2 en un renglón— pero **1920 sí**, y 1920 está cerrado. La
instrucción pedía frenar y decirlo si mover el piso movía 1440; lo que mueve es
el otro extremo.

Hay una salida y se declara sin aplicarla: **confinar la declaración abajo de
`--breakpoint-escritorio` (1025 px)**, que es la costura estructural que el
sistema ya tiene —ahí colapsa la grilla de 5 y se apaga la coreografía—, y
re-anclar la recta en el valor que la curva de hoy tiene en 1025. Con eso
1025 → 2560 queda idéntico al bit, y sólo se mueve la banda angosta. Cuesta una
segunda declaración adentro de un `@media` y que `s3-tipografia` §2 y
`tokens.invariant.ts` la conozcan.

---

## 3 · EL OBJETIVO TIENE DOS LECTURAS, Y LOS 52/100 SON LA QUE YA GASTÓ `pb-20`

| ancho | fin de la masa | fracción | hueco hasta el BORDE | bloque | falta (lectura de la instrucción) | falta (con `pb-20` intacto) |
|---|---|---|---|---|---|---|
| 320 | 386 | 0,6796 | 181 | 377,69 | **196,69** | 276,69 |
| 375 | 454 | 0,6807 | 212 | 264,34 | **52,34** | **132,34** |
| 390 | 575 | 0,6813 | 268 | 265,22 | −2,78 | 77,22 |
| 425 | 575 | 0,6813 | 268 | 243,30 | −24,70 | 55,30 |
| 768 | 699 | 0,6826 | 324 | 424,34 | **100,34** | **180,34** |
| 1024 | 531 | 0,6914 | 236 | 278,86 | 42,86 | 122,86 |

Los 52,34 y los 100,34 son, al decimal, los 52 y los 100 del enunciado. Se
reproducen **sólo** comparando el bloque contra el borde de abajo del viewport,
o sea con el bloque apoyado en el píxel 667 (a 375) en vez del 587 en el que
está. La diferencia son los 80 px de `pb-20`, que la propia instrucción marca en
rojo: *«`pb-20` reserva los 72 px de la pastilla de navegación»*. Y la pastilla
existe abajo del breakpoint — se la ve en `capturas/tapado/hoy-375x667.png`,
ocupando el pie de la pantalla.

**Con `pb-20` intacto: 0 de 9.600 combinaciones alcanzan 375 y 768.** Es
aritmética, no barrido: a 375 el presupuesto entero del bloque son **132 px**
(212 de hueco menos los 80 de `pb-20`) y el costo fijo mínimo —CTA 47 + bajada en
una línea 24 + los dos huecos en 8 = **87**— deja **45 px** para un titular de dos
líneas. Son **20,6 px por línea**.

---

## 4 · LA PREMISA REFUTADA: HAY UNA SEGUNDA MASA EN 0,781

El diagnóstico dice *«el hueco libre es constante»* contando desde el fin de la
masa hasta el borde. Sobre el píxel, la escena tiene **otra banda negra** que
empieza en 0,781 del alto en los seis anchos angostos:

| ancho × alto | masa 1 termina | masa 2 empieza | **hueco LIBRE** | fracción del alto | bloque hoy |
|---|---|---|---|---|---|
| 320 × 568 | 386 (0,6796) | 444 (0,7817) | **57** | 0,1004 | 377,7 |
| 375 × 667 | 454 (0,6807) | 521 (0,7811) | **66** | 0,0990 | 264,3 |
| 390 × 844 | 575 (0,6813) | 659 (0,7808) | **83** | 0,0983 | 265,2 |
| 425 × 844 | 575 (0,6813) | 659 (0,7808) | **83** | 0,0983 | 243,3 |
| 768 × 1024 | 699 (0,6826) | 800 (0,7813) | **100** | 0,0977 | 424,3 |
| 1024 × 768 | 531 (0,6914) | 605 (0,7878) | **73** | 0,0951 | 278,9 |

(De `a-verdad-hoy.json`, bandas de ≥ 15 px dentro de la columna del texto. A
1440 y 1920 no hay segunda banda: el logo ya no llega ahí.)

El hueco verdadero es **0,095 a 0,100 del alto** —casi tan constante como el
0,68, y en el mismo orden de dispersión— y el
bloque mide **4,0 a 4,2 veces** eso. No es que falten 52 px: es que el lugar al
que se lo quiere mudar entra cuatro veces menos de lo necesario.

Y tiene una consecuencia medida: **empujar el bloque hasta abajo lo mete en la
segunda masa.** A 390 la superposición pasa de 16,8 % a **24,8 %** y a 425 de
11,4 % a **22,8 %** cuando se saca `pb-20`. La lectura del objetivo que permite
alcanzarlo es la que rompe dos de los ocho anchos.

---

## 5 · LA MÍNIMA — 9.600 combinaciones, con el modelo validado

`c-minima.ts` compone las palancas y **se valida antes de predecir**: reproduce
los **272 puntos** que el navegador midió, alto del bloque y cantidad de
renglones, con **0 desvíos** (tolerancia 0,6 px). Control positivo: con el
interlineado en 1,5 el mismo modelo da 307 px donde se midieron 264,34.

| pregunta | combinaciones que alcanzan |
|---|---|
| sólo las cinco palancas · 375 **y** 768 · lectura de la instrucción | **125 de 9.600** |
| sólo las cinco palancas · 320, 375 **y** 768 | **0** |
| las cinco **+ los dos huecos** · 375 y 768 · lectura de la instrucción | 5.150 |
| las cinco + los dos huecos · 320, 375 y 768 | **0** |
| las cinco + los dos huecos · 375 y 768 · **con `pb-20` intacto** | **0** |

### 5.1 · Qué tamaño de titular pide cada mínima

La tabla que el PASO 4 pide aparte. Tamaños **a 375**, donde hoy son 37 / 67
(razón 1,81×):

| combinación | cambios | L1 | L2 | razón | interlineado |
|---|---|---|---|---|---|
| **hoy** | — | 37,0 | 67,0 | **1,81×** | 1,09 |
| la de MENOS cambios que alcanza | 2 | 37,0 | **40,0** | **1,08×** | 1,09 |
| la de más contraste, sólo con la lista | 4 | 36,0 | 58,0 | 1,61× | **0,90** |
| la de más contraste, con los huecos | 4 | **36,0** | 67,0 | 1,86× | 1,09 |

La primera deja las dos líneas del titular casi del mismo tamaño: se pierde el
registro. La segunda pone el interlineado en 0,90 —las cajas de línea se
superponen un 10 %— y además baja `display` a 36, que es el piso de `titulo-xl`.
La tercera conserva el contraste pero sólo porque baja `display` a 36,01, o sea
deja la escala con **0,01 px** de separación donde hoy tiene 1,00.

### 5.2 · 320, cuánto falta

En **todo** el espacio de 9.600 combinaciones, la menor sobra alcanzable a 320 es
**5,0 px** — y pide piso L1 36,01, piso L2 38, interlineado 0,90, bajada en una
línea y los dos huecos en 8. Titular de 36 / 38 px con las líneas pisándose.

Sin tocar el interlineado y sólo con las cinco palancas de la lista: sobran
**65,9 px**. Con `pb-20` intacto, 80 px más.

---

## 6 · PASO 4, ANTICIPADO — LA CIFRA DE ACEPTACIÓN, SIMULADA

`d-superposicion.ts` monta cada configuración con una hoja `!important` y corre
el cruce de TAPADO-1 (C: el texto sin la escena · D: la escena sola). El control
—`0-base`— reproduce `a-verdad-hoy.json`, que es una corrida independiente y de
otro día, dentro de **0,4 puntos** en los ocho anchos (31,6 contra 31,5 · 47,2
contra 47,2 · 16,8 contra 17,2 · 11,4 · 41,5 contra 41,6 · 15,7 contra 15,8 ·
0,7 · 0,1). Esa diferencia es la varianza del render 3D entre dos corridas, no
del instrumento.

**Tinta del titular sobre la masa negra del logo, en %:**

| configuración | 320 | **375** | 390 | 425 | **768** | 1024 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|
| **0 · hoy** | **31,6** | **47,2** | 16,8 | 11,4 | **41,5** | 15,7 | 0,7 | 0,0 |
| 1 · huecos 8/8 | 39,7 | 49,4 | 11,5 | 5,0 | 22,3 | 1,5 | 0,5 | 0,2 |
| 2 · bajada 1 línea | 41,0 | 55,4 | 11,8 | 11,4 | 31,6 | 15,7 | 0,7 | 0,0 |
| 3 · bajada 1L + huecos 8/8 | 46,7 | 16,2 | 4,4 | 5,0 | 11,5 | 1,5 | 0,5 | 0,2 |
| **4 · piso L2 62** | 35,2 | 53,7 | 15,0 | 11,7 | **0,4** | 15,5 | 0,7 | 0,1 |
| 5 · 4 + bajada 1L + huecos 8/8 | 51,9 | **12,0** | 2,9 | 3,0 | 16,7 | 0,9 | 0,5 | 0,3 |
| 6 · 5 + `pb-20` = 0 | 39,2 | **8,8** | 24,8 | 22,8 | 5,3 | 1,9 | 0,5 | 0,5 |
| **7 · piso L2 64** | 32,6 | 51,3 | 14,1 | 11,6 | **0,4** | 15,6 | 0,7 | 0,1 |
| 8 · piso L2 58 | 40,2 | 57,3 | 16,4 | 12,1 | 0,2 | 15,3 | 0,7 | 0,2 |
| 9 · piso L2 50 | 60,6 | 70,4 | 17,2 | 13,4 | 0,2 | 15,3 | 0,7 | 0,2 |
| 10 · piso L2 44 | 56,9 | 75,8 | 16,6 | 13,3 | 0,5 | 14,7 | 0,7 | 0,3 |
| 11 · piso L2 62 + bajada 1L | 45,2 | 57,3 | 12,4 | 11,7 | 0,8 | 15,5 | 0,7 | 0,1 |
| 12 · piso L2 62 + huecos 8/8 | 43,8 | 47,0 | 12,2 | 3,0 | 8,8 | 0,9 | 0,5 | 0,3 |
| 13 · piso L2 50 + bajada 1L | 46,5 | 61,3 | 14,6 | 13,4 | 1,1 | 15,3 | 0,7 | 0,2 |
| 14 · piso L2 50 + bajada 1L + huecos 8/8 | 45,3 | **12,0** | 4,4 | 3,5 | 16,6 | 0,6 | 0,5 | 0,4 |
| 15 · huecos 16/16 | 41,0 | 55,4 | 11,8 | 9,9 | 31,6 | 7,2 | 0,5 | 0,2 |

Cuatro hallazgos, todos de la tabla:

**① La superposición NO es monótona en el corrimiento.** Bajar el bloque 40 px a
375 lo empeora (47,2 → 49,4); bajarlo 64 lo mejora muchísimo (→ 16,2). El bloque
atraviesa la masa: hasta que no sale del otro lado, moverlo hunde más tinta.
Ningún razonamiento sobre «cuántos píxeles baja» predice esto; hay que mirar el
píxel.

**② A 768 la respuesta es UNA palanca y nada más.** Piso L2 en 64 o menos:
41,5 % → **0,4 %**. Agregarle el corrimiento la devuelve a 16,7 %, porque ahí el
titular aterriza sobre la segunda masa. *Menos es más.*

**③ A 375 el piso de la superposición, con `pb-20` intacto, es 12,0 %.** No es un
dígito. Bajar sólo la línea 2 sin corrimiento **empeora monotónicamente**: 51,3
(64) · 53,7 (62) · 57,3 (58) · 70,4 (50) · 75,8 (44).

**④ A 320 no hay nada.** La mejor de las 16 es la de hoy.

`capturas/texto/sim-4-pisoL2-62-768x1024.png` es la que conviene mirar: a 768 el
titular queda entero abajo del logo, en dos registros y con «LAS 24 HS» en una
línea. `sim-5-…-375x667.png` muestra el 12,0 % a 375: «LAS 24 HS» limpio y «TU
NEGOCIO VENDIENDO» todavía cruzando el pie del logo.

---

## 7 · FUERA DEL ALCANCE, MEDIDO Y NO APLICADO

**D1 · La caja del titular a 768 mide 364 px de 552, y la clase que la acota se
derivó en escritorio.** `GEOMETRIA.claseDelTitular` es `tablet:col-span-2`, y su
porqué —tres bordes seguros medidos— está escrito para **1440, 1920 y 2560**. La
clase, sin embargo, arranca en `--breakpoint-tablet` (768), donde el logo está
centrado y es más ancho que el cuadro: ahí un borde seguro horizontal no compra
nada y el precio es que las dos líneas del titular envuelvan. Medido
(`16-caja-entera`): con las 3 columnas de la medida, cada registro entra en UN
renglón sin tocar un solo tamaño, y la superposición a 768 baja a **11,5 %**. Es
peor que la palanca (b) —0,4 %— pero es la única que no toca la escala
tipográfica. **Es layout, no tipografía: fuera de este sprint.**

**D2 · La bajada a 768 tiene una caja de 270 px con 768 de viewport.**
`columnasDeLaCajaDeLaBajada: 2` la deja en media medida desde `tablet`, así que
sus 328,47 px de texto envuelven en dos renglones en la pantalla más ancha de
las angostas. Mismo dueño que D1.

**D3 · El presupuesto de caracteres de la bajada, si se quisiera una línea.** El
texto mide 328,47 px (49 caracteres, 6,7035 px por carácter, cuerpo invariante de
15 px). Para entrar en una línea hacen falta ≤ 46 caracteres a 375, ≤ 48 a 390,
**≤ 40 a 768** y **≤ 38 a 320**. `contenido.ts` hoy declara un techo de 53, que
es el de 1440. Es copy, no tipografía.

**D4 · Los dos huecos declarados valen más que las cinco palancas juntas a 375.**
`gap-8` + `gap-6` = 56 px, y bajarlos a 8/8 da **40**. De las cinco listadas,
ninguna pasa de **25,1 px** a ese ancho, y ese extremo es la (b) llevada al piso
44, donde los dos registros ya miden casi lo mismo. No están en la lista de la
instrucción y no se aplicaron.

**D5 · El margen del titular a 1440 es 4,70 px, no 3,55.** `geometria.ts` publica
el margen derivado con el avance conservador (8,5670 − 19 × 0,02 = 8,1870); el
avance medido en el navegador es 8,1663. El declarado subestima, que es el lado
seguro, pero las dos cifras deberían decirlo.

---

## 8 · EL INSTRUMENTO — dos trampas que este banco sufrió y una desviación declarada

**① Escribir una captura adentro del árbol con la página abierta cambia la
página.** `d-superposicion.ts` copiaba el cuadro A a `docs/rediseno/capturas/`
dentro del bucle de configuraciones. El dev server vigila el repo: a 768 esa
escritura disparó un recompilado y la página se recargó en caliente **sin la hoja
de utilidades**. El titular pasó a 32 px —el `2em` del `h1` sin clase—, el bloque
se fue a `y = 1075` con el viewport en 1024, y tres configuraciones publicaron
`NaN`. `tapado-comun.ts` ya lo declaraba para las capturas intermedias; ahora
vale también para las definitivas: se juntan y se copian con la pestaña cerrada.
Y quedó un **centinela**: ninguna regla de este banco toca la línea 1, así que su
tamaño tiene que ser idéntico en las 18 configuraciones — si cambia, el
instrumento tira en vez de publicar.

**② Contar renglones dividiendo el alto por el interlineado no sirve acá.** Las
dos líneas del titular son ítems de un contenedor flex, o sea cajas de bloque:
`el.getClientRects()` devuelve UNA sola y contaría 1 línea siempre. Lo que cuenta
es un `Range` sobre el CONTENIDO, que además entrega el ancho real de cada
renglón — el dato que decide si envuelve.

**③ (desviación, no falla) Una recarga limpia POR ANCHO, no por configuración.**
La regla de TAPADO-1 es que cada ancho abra una pestaña nueva, porque el nivel de
calidad de la escena se decide al montar (`key={calidad}`) y una ventana
redimensionada deja un estado intermedio. Acá el ancho no cambia adentro de una
corrida: las 18 configuraciones son hojas de estilo sobre la MISMA página, y la
escena —que es lo que el remonte decide— no la toca ninguna. Lo que se gana es
que la máscara D sea literalmente la misma en las 18, o sea que la comparación no
lleve adentro la varianza del render 3D. El control de que la página no derivó es
el centinela de ①, y además `0-base` reproduce la corrida independiente de
`a-verdad-hoy.json` dentro de 0,4 puntos.

---

## 9 · EL GATE

`npm run build` (con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`, porque la llave de B12
sigue prendida y el guardián del `prebuild` frena el build a propósito) y después
`npm run verificar`. El árbol es el de apertura: no se aplicó ningún cambio de
`src/`, y lo único que se agregó son los cinco archivos de `scripts-texto/`, el
`.sh` de §9.1 y las salidas.

| paso | resultado |
|---|---|
| 1 · `package.json` | ok — sin marcadores, JSON válido, cero claves duplicadas |
| 1b · conflictos en todo el repo | ok — ningún merge sin resolver |
| 2 · `tsc --noEmit` | ok — sin errores de tipos (64,2 s) |
| 3 · los 27 agregados | **27 de 27 en verde** |

**135 invariantes · 5.545 afirmaciones · 945 controles positivos · 13 fuera de
ventana · 0 con falla · 16 deudas declaradas.**

Las 16 deudas, con dueño: **12** en `test:s10-acceso`, **3** en `test:s8-tinta`,
**1** en `test:s22-emision`. Son las mismas que el repo ya declaraba; este sprint
no agregó ninguna y no cerró ninguna.

**30 pasos · 0 fallas · 16 deudas**, que es lo que el sprint pedía.

### 9.1 · El gate hubo que correrlo POR GRUPOS, y el motivo es de la máquina

`npm run verificar` corre los 27 agregados adentro de un proceso que vive veinte
minutos, y el vigilante de memoria del harness lo mató **tres veces** —una en el
agregado 19, otra en `tsc`, otra en el agregado 2—. La máquina tiene 14 GB y
estaba con **650 a 750 MB libres** y 2,8 GB en el almacén de compresión de
Windows. Parte de eso era de este mismo sprint: el `git status -z -uall` de la
extensión de git de VS Code, escaneando los 130 PNG nuevos sin seguimiento, tenía
**777 MB** de working set; matarlo devolvió 700 MB de una.

`scripts-texto/gate-por-grupos.sh` corre **el mismo trabajo, con el mismo
argumento** —`s4-agregado.ts <grupo>`, que es exactamente lo que `verificar`
invoca— pero grupo por grupo y con reanudación: cada uno deja su `.log` y su
`.exit`, y la pasada siguiente saltea lo hecho. El pico no baja (cada agregado ya
corría en su propio proceso); lo que baja es **lo que cuesta una muerte**: un
grupo en vez de la corrida entera. Hicieron falta tres pasadas.

⚠ Lo que esto NO reproduce es el renglón de resumen que imprime `verificar`. Los
pasos 1, 1b y 2 salen de la corrida completa —que llegó hasta ahí antes de morir—
y el paso 3 sale de sumar los 27 `TOTAL` de los grupos. El control de que las dos
formas dicen lo mismo es que `s1` publica el mismo renglón en las dos: *5
invariantes · 209 afirmaciones · 31 controles positivos · 3 fuera de ventana · 0
con falla*.

---

## 10 · LO QUE QUEDA DECIDIDO PARA EL DUEÑO

Ninguna de estas tres cierra los tres anchos; las tres están medidas y ninguna
está aplicada.

| | qué es | 320 | 375 | 390 | 425 | 768 | 1024 | costo |
|---|---|---|---|---|---|---|---|---|
| **A** | piso de `display-xl` 67 → 64 | 32,6 | 51,3 | 14,1 | 11,6 | **0,4** | 15,6 | 1920 sube de 120,68 a 122,03 px (o se confina abajo de 1025) |
| **B** | bajada en 1 línea + los dos huecos a 8 | 46,7 | 16,2 | 4,4 | 5,0 | 11,5 | 1,5 | dos huecos fuera de la lista + copy de la bajada a ≤ 38 caracteres |
| **C** | A + B | 51,9 | **12,0** | 2,9 | 3,0 | 16,7 | 0,9 | los dos costos juntos, y 768 vuelve a dos dígitos |
| | **hoy** | **31,6** | 47,2 | 16,8 | 11,4 | 41,5 | 15,7 | — |

**A** arregla 768 exactamente y empeora 320 y 375. **B** arregla la banda
375–1024 sin tocar una sola cifra tipográfica, y empeora 320. **C** es la mejor a
375 y la peor a 768.

### 10.1 · Si se elige A, dos cosas que hay que saber antes

**El piso NO puede ser 65.** Con 65 la línea 2 mide 79,39 px a 768 contra un
umbral de 79,409: **0,014 px de margen**, o sea un arreglo que lo da vuelta
cualquier diferencia de render. Con 64 el margen es 0,65 px de cuerpo (3,0 px de
ancho) y está medido en el navegador, no modelado. 62 da 1,9 px.

**Y toca cinco lugares, no uno.** La declaración vive en `theme-develop.css`,
pero el número está afirmado en `tokens.invariant.ts` (la lista literal
`ESPERADO_DENTRO`), explicado en `padron-de-tokens.ts` (`AGREGADOS`, el motivo
del piso 67 dice *«el mayor entero que entra en una línea en la caja medida a
375»*, que con 64 deja de ser la razón), y las tres anclas se vuelven a evaluar
en `s3-tipografia` §2 y `s3-banda-afirmaciones` §2. Si además se confina abajo de
1025 para no mover 1920, los dos invariantes tienen que aprender a leer una
segunda declaración adentro de un `@media`.

Y 320 no lo arregla ninguna: ahí el bloque es el 66 % del viewport contra un
hueco libre del 10 %, y bajarlo lo mete más adentro. La salida de ese ancho no
está del lado del texto.

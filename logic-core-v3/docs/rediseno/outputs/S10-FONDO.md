# S10 — Vaciar la escena, fondo de rendijas, sol visible · Escena 3D del home develOP

- **Fecha:** 2026-08-23 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S10-fondo.md` · **Extiende:** `outputs/S9-COREOGRAFIA.md` y `outputs/S7-ESCENA.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build --webpack` exit 0 · **197 comprobaciones estáticas en verde y 1 en rojo, que es heredada y deliberada** (ver §9).
- **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano por grabación.**

---

## 0 · Qué hizo este sprint

Borró cuatro familias de geometría, reemplazó el fondo por una envolvente de dos capas separadas en profundidad, multiplicó por once las partículas en cuadro y **no tocó ni la coreografía ni el arco del sol**.

Y midió cinco cosas que S9 había publicado y que este sprint invalida. Están todas en §8.

**La decisión de fondo, en una línea:** lo que se fue no era arquitectura, era relleno. Lo que quedó tiene una razón nombrable cada uno.

---

## 1 · Qué se borró, archivo por archivo

| se borró | qué se llevaba |
|---|---|
| `_components/probeArchitecture.ts` | los 11 planos suspendidos, la retícula aérea (17 barras) y los 3 pilares |
| `_components/LogoFragments.tsx` | los 3 arcos sueltos de la marca |

Más los recortes: `probeScene.ts` perdió seis colores de paleta y el bloque de `LOGO_FRAGMENTS`; `ProbeStage.tsx` perdió tres `<InstancedBars>` y un `<LogoFragments/>`; y cuatro suites de comprobaciones perdieron los chequeos que medían contra ellos.

**El argumento es uno solo, y lo sostiene un número que no estaba medido:**

> En **p=0,200 y p=0,300 un plano oscuro ocupaba el 100% del cuadro, con el logo completamente detrás.** En p=0,650 lo hacía uno claro. No es "medio cuadro en un tramo": son tres pantallazos planos. Lo que S9 publicó como "tres pasadas del entorno por delante del logo" era eso.

Se conservó lo que la instrucción pedía: **el piso, las marcas de replanteo, el logo, su sombra y el sistema de luces.**

---

## 2 · El balance de negro: la escena queda más clara, y con cuánto

Es la cifra incómoda de este sprint y se publica entera.

**Cobertura por masa** (qué fracción del cuadro cubre cada familia, con la tinta del logo rasterizada de su `path` real y no de su caja):

| pose | logo | planos oscuros | claros | aérea | pilar | frag | **tinta antes** | **tinta ahora** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| hero | 5,95 | 38,01 | 6,65 | 0,00 | 0,02 | 0,00 | **43,96%** | **5,95%** |
| quiénes somos | 15,07 | 30,01 | 16,12 | 1,63 | 0,00 | 0,00 | **46,70%** | **15,07%** |
| números | 5,52 | 18,53 | 4,69 | 0,00 | 0,00 | 0,00 | **24,05%** | **5,52%** |
| trabajos | 5,99 | 4,61 | 33,96 | 0,00 | 0,00 | 0,00 | **10,60%** | **5,99%** |
| demos | 23,20 | 49,24 | 2,78 | 1,08 | 0,29 | 0,00 | **73,52%** | **23,20%** |
| cierre | 2,83 | 42,42 | 2,90 | 1,19 | 0,19 | 0,30 | **46,75%** | **2,83%** |

**Valor medio del cuadro** (0–255, con el shading real de three reimplementado: irradiancia de las cuatro luces → Lambert → `NeutralToneMapping` → sRGB → niebla `smoothstep`):

| pose | HOY (con planos) | VACIADA | + envolvente | + envolvente y partículas |
|---|---:|---:|---:|---:|
| hero | **144** | 233 | 224 | **216** |
| quiénes somos | **125** | 207 | 179 | **172** |
| números | **189** | 235 | 230 | **222** |
| trabajos | **213** | 228 | 215 | **208** |
| demos | **52** | 165 | 138 | **136** |
| cierre | **74** | 132 | 120 | **120** |

**Sí, queda más clara: la escena vaciada sube el valor medio del cuadro entre 45 y 113 puntos, y la envolvente recupera de 5 a 28.** Se decidió aceptarlo con la envolvente media, y hay un techo que hay que dejar escrito:

| pose | del cuadro es **piso** | alcanza la envolvente |
|---|---:|---:|
| hero | **65%** | 31% |
| **números** | **73%** | **17%** |
| trabajos | 55% | 42% |
| quiénes somos | 0% | 100% |
| demos | 0% | 100% |
| cierre | 34% | 65% |

> **En el hero y en Números el fondo no llega, y ninguna de sus perillas cambia eso.** Se probó una envolvente el doble de pesada (opacidad 0,70 / base 0,34): quiénes somos baja a 143, demos a 103 y el cierre a 105 — pero hero solo llega a 212 y Números a 224. O sea que la envolvente pesada **arregla las tres poses que ya eran las más oscuras y separa más los extremos**, que es exactamente el argumento con el que se eligió la media.
>
> **El piso queda como sprint propio**, con esta tabla como punto de partida. Está anotado en `DIRECCION-ESCENA.md` §4.1 y §7.9.

---

## 3 · La envolvente de rendijas

### 3.1 · La geometría

**Dos cilindros coaxiales, la cámara adentro de los dos.** No una pared: la cámara da la vuelta entera.

| | radio | banda (y) | trama | qué hace |
|---|---:|---|---|---|
| **capa fina** | **38** | −4 … 34 | 102 celdas por vuelta | **fija**, adelante |
| **capa gruesa** | **44** | −2,5 … 40 | 50 celdas por vuelta | **baja sin fin**, atrás |

**38** es el radio de la pantalla de S7 y conserva sus tres razones: más lejos que la cámara más lejana (27 del recorrido, 30 del slider), más cerca que el ciclorama, y más lejos que el sol (34).

**44 y no más** porque el ciclorama es una superficie de revolución: a la altura del borde inferior de esta capa está en radio **46,2**, y a y=−4 estaría en 39,0. Con 44 entra con 2,2 de margen; a 52 habría que arrancar la banda en y=0 y se perdería el borde de abajo.

**Los topes de banda están medidos, no estimados:** barriendo el borde superior del cuadro sobre los 400 puntos del recorrido, la capa fina se ve hasta y=30,2 (tope 34) y la gruesa hasta y=34,3 (tope 40).

**Las celdas se definen en celdas por vuelta y no en unidades de mundo**, y esa decisión es la que hace que todo lo demás cierre: desde el eje, una celda de N por vuelta subtiende 2π/N **sea cual sea el radio**, así que la lectura "cuatro cuadraditos en un cuadrado" no depende de la separación entre las capas. El paso vertical se deriva para que la celda sea cuadrada sobre su propia superficie, y por lo tanto también en ángulo.

### 3.2 · El revestimiento: de dónde salen las tramas

Se leyeron los componentes antes de inventar nada:

- **`HeroBackground.tsx`** dibuja una retícula de cuadrados con **líneas de 1 px a `4rem` (64 px)** de paso, y **la traslada 48 px hacia abajo en bucle de 13 s**.
- **`WhyDevelOP.tsx`** usa la misma retícula a 16/20/24/32/40 px, siempre con línea de 1 px.
- **`DotMatrix.tsx`** es el campo de puntos: esferas de 0,05 sobre un paso de 0,6, o sea el 8,3%.

O sea que **el par 64/32 con la MISMA línea de 1 px ya existía en el sitio**, y la que se mueve —hacia abajo— es la del hero. La transposición es literal:

- la **capa gruesa ES la retícula del hero**, y baja como allá;
- la **fina es la misma a la mitad del paso, con un punto en cada cruce** — el campo de puntos a su propio paso;
- **las dos llevan el mismo trazo en ÁNGULO** (0,194°), que es lo que hace el sitio al poner 1 px sobre 32 y sobre 64. Da 5,5% de la celda fina y 2,7% de la gruesa.

Verificado contra el número: **la capa fina da 24,9 celdas a lo ancho del cuadro contra las 22,5 de la retícula del hero a 1440 px.**

> **Y un ajuste que salió de medirlo:** el punto arrancó en el 8,5% de la celda —la proporción de `DotMatrix` contra su propio paso— y **sobresalía del cruce medio téxel**: existía en la textura y no se veía. El punto vive justo donde las dos líneas se cruzan, o sea encima de un cuadrado de lado igual al trazo, así que se redefinió **contra el trazo y no contra la celda**: 2,6 veces el trazo, o sea 14,3% de la celda.

### 3.3 · El desajuste, y la aritmética del 2:1

`MOIRE_MISMATCH` es un **entero** y no una fracción: las dos tramas tienen que cerrar alrededor del cilindro o se ve la costura. Y como entero **nombra directamente lo que produce**: cuántas bandas de batido hay en una vuelta. Default **2**, slider 0 a 12.

| | valor |
|---|---|
| celdas gruesas / finas | 50 / 102 → cociente de textura **2,0400** |
| celda gruesa | 7,200° · 5,529 de mundo |
| celda fina | 3,529° · 2,341 de mundo |
| batido de textura, desde el eje | 25 celdas gruesas · **138,2 de mundo** · 180° de arco |
| batido **proyectado por la cámara real** | **819 a 1.758 px** en 1920×1080 |
| bandas a lo ancho del cuadro | **1,1 a 2,3** |
| deriva | una celda cada 18,7 s = 8,5 px/s · **el batido a 51–102 px/s**, 6 a 12 veces más rápido |

> ### ⚠️ La regla del 2:1 vale para tramas COPLANARES, y acá no lo son
>
> **Con las dos tramas sobre la misma superficie** —que es exactamente lo que hizo S7, con `map` y `alphaMap` del mismo material— una relación de 2 exacta no produce moiré: el término de batido |f_fina − 2·f_gruesa| se anula, el patrón queda estacionario y con el período de la trama gruesa. Es aritmética cerrada y no una cuestión de calibración.
>
> **Separarlas en profundidad la rompe.** La capa de atrás está más lejos de la cámara que del eje, así que sus celdas se proyectan más chicas y el cociente aparente deja de ser el de las texturas. Medido sobre los 200 puntos del recorrido:
>
> | | horizontal | vertical |
> |---|---|---|
> | cociente de textura | 2,040 | 2,040 |
> | **cociente proyectado** | **2,094 a 2,162** | **2,094 a 2,162** |
> | **con el desajuste en CERO** (textura 2:1 exacta) | **2,053 a 2,120** | ídem |
>
> O sea que **en `MOIRE_MISMATCH = 0` el batido no desaparece**: lo produce el paralaje. La cancelación exacta solo ocurriría con la cámara clavada en el eje, donde nunca está.
>
> Esto no es una licencia para dejar el desajuste en cero: es la razón por la que el default NO es cero y por la que el slider llega hasta ahí — **en 0 se ve cuánto aporta cada mitad.**

**Qué pasa cuando las dos quedan en fase.** Con 1,1 a 2,3 bandas en cuadro, el nodo de alineación está siempre en cuadro o a menos de media pantalla: **el efecto no desaparece nunca del cuadro entero.** Lo que cambia es dónde está la zona que se lee como retícula limpia y dónde la que se lee como interferencia, y ese barrido es el efecto.

### 3.4 · El aliasing, en las dos direcciones

Una trama de cuadrados tiene líneas en dos ejes, así que el análisis de S7 —hecho sobre rendijas verticales— cubría uno solo. Barrido de los **cinco** recorridos, rayos hasta el borde del cuadro incluyendo los rasantes:

| | horizontal | vertical |
|---|---:|---:|
| trama fina, peor caso | **51,9 px** por período (dramática, p=0,705) | **52,1 px** |
| trama gruesa, peor caso | 106,6 px | 106,8 px |
| Nyquist | 2 px | 2 px |

**26× de margen**, contra los 15× de S7. Pero el riesgo real de una trama de **líneas** no es el período sino el **grosor**, y ése es el número que S7 no tenía que calcular porque sus rendijas eran del 42%:

| | peor rayo de los cinco recorridos |
|---|---:|
| trazo de la trama fina | **2,85 px** |
| trazo de la gruesa | **2,87 px** |

Arriba de Nyquist, con mipmaps y anisotropía como red: donde la incidencia es rasante la línea promedia a gris en vez de titilar.

### 3.5 · La envolvente de banda va en el alfa de vértice, y hay un motivo duro

El desvanecido de los bordes NO está horneado en la textura: va en un atributo de color de 4 componentes, que activa `USE_COLOR_ALPHA` en three 0.182 (`color_fragment` hace `diffuseColor *= vColor`).

> **Porque la capa gruesa desplaza su `offset.y` en cada frame.** Una envolvente horneada en la textura se desplazaría con la deriva: el borde de la pantalla subiría y bajaría con ella. Con alfa de vértice la envolvente es de la GEOMETRÍA y no se mueve.

De paso ahorra una lectura de textura por fragmento sobre medio cuadro, dos veces. El precio son 20 segmentos verticales por capa en vez de 1 — ver §7.

**Y la dirección de la deriva está verificada contra three, no razonada:** el test construye una `CylinderGeometry` y comprueba que `uv.y` vale 0 abajo y 1 arriba. De ahí sale que subir el `offset.y` mueve el patrón hacia abajo.

---

## 4 · ⚠️ El orden de dibujo: la envolvente se dibujaba ENCIMA del sol

Es un hallazgo del sprint y afecta a lo que hoy se ve, no solo a lo nuevo.

three ordena los transparentes con `reversePainterSortStable`, y su criterio es **la posición del OBJETO**, no la del fragmento. Los cilindros de la envolvente están centrados en el origen, así que su distancia es la de la cámara (9 a 27) contra los **34** del sol: el sol dibuja primero y **la pantalla le pasa por encima**. Con la pantalla de S7 a opacidad 0,32 el sol se veía velado; con dos capas más pesadas habría sido peor.

`renderOrder` tiene prioridad sobre la distancia, así que la cadena queda explícita:

```
capa gruesa (−20) → capa fina (−19) → washout (−2) → sol (−1) → partículas (0, por distancia)
```

**Las partículas quedan en 0 a propósito y no hay conflicto**: el campo de polvo llega exactamente a radio 34, que es el radio del sol, así que ninguna mota puede quedar por detrás de él. Se verifica.

Y el comentario de `SunBody.tsx` que afirmaba lo contrario —"el orden entre transparentes lo resuelve el ordenamiento por distancia de three"— quedó corregido en el archivo, con la cita.

---

## 5 · El sol

**El arco no se tocó.** Azimut, elevación, nivel y kelvin son exactamente los de S9, `level = sin(elevación)/sin(36°)` sigue valiendo y la narrativa sigue siendo una tarde.

### 5.1 · El diagnóstico tenía dos partes, y la segunda no estaba medida

**1 · Contraste.** S7 midió el disco a 254 contra una pared a 213: **41 puntos**. La envolvente lo resuelve por ser oscura, sin tocar el sol:

| | pared del ciclorama | con la envolvente encima | contraste del núcleo |
|---|---:|---:|---:|
| demos (p=0,75) | 178 | **146** | **109 puntos** |
| cierre (p=0,95) | 121 | **98** | **157 puntos** |

**2 · Los planos SÍ lo estaban tapando.** El 33,4% que S9 publicó es cobertura de encuadre, no visibilidad: nadie había medido la oclusión. Con ella:

| p | halo en cuadro | **visible de verdad** | tapado |
|---|---:|---:|---:|
| 0,70 | 56% | **13%** | 77% |
| 0,75 | 71% | **28%** | 62% |
| 0,85 | 48% | **16%** | 67% |
| 1,00 | 67% | **36%** | 47% |

Separado por familia, **son los planos**: la retícula aérea saca 1 a 3 puntos. Sin ellos el disco visible **pasa de 13–36% a 28–71%**.

### 5.2 · El washout, y por qué arranca bajo

Un sprite **aditivo** blanco sobre el eje del sol, de radio 2,2 núcleos, con la opacidad proporcional al nivel del arco. Un draw call, dos triángulos, y lo coloca el mismo `applyLightRig` que coloca el cuerpo — sobre el mismo eje y en el mismo frame.

Se dimensiona contra el **núcleo** y no contra el halo porque adentro del núcleo el sol ya tapa la trama por sí solo (su alfa es 1): el trabajo de este disco es el **anillo de afuera**, donde el halo cae de 0,5 a 0 y la trama vuelve a asomar. Un washout del tamaño del halo lavaría el 117% del alto del cuadro.

**Arranca bajo porque no está pagando por contraste** —eso ya lo resolvió el fondo— y todo lo que sume se lo come. Medido justo afuera del núcleo, en demos:

| washout | fondo local | contraste del núcleo |
|---|---:|---:|
| apagado | 184 | **71 puntos** |
| **default (0,28)** | 191 | **64 puntos** |
| a plena opacidad | 216 | **39 puntos** |

La perilla queda en `probeSun.ts`.

### 5.3 · La sombra se alarga

Verificado sobre el arco, para el borde superior de la tinta del logo:

| p | 0 | 0,50 | 0,75 | 0,875 | 0,95 | 1 |
|---|---:|---:|---:|---:|---:|---:|
| largo | 9,2 | 9,2 | 11,8 | 17,7 | 29,3 | **32,9** |

**×3,6 de punta a punta del recorrido**, 23,7 unidades de mundo de crecimiento. Junto con el sol cruzando el cuadro, es lo que da la sensación de tiempo pasando.

---

## 6 · Las partículas

| | antes (S6) | **ahora** |
|---|---|---|
| polvo | 400 reservadas / 220 dibujadas · tamaño 0,19 | **3.000 / 2.400 · tamaño 0,17** |
| bokeh | 30 · tamaño 1,5 · radios 4,2–30 | **90 · tamaño 1,2 · radios 4,2–8** |
| draw calls | 2 | **5** (3 conchas de polvo + 2 de bokeh) |
| **en cuadro en la pose inicial** | **94** | **1.008** — ×10,7 |

### 6.1 · Vida propia sin trabajo por partícula

2.400 motas son 7.200 floats y una subida de buffer por cuadro: mover partícula por partícula no era una opción. Cada campo se parte en **conchas por radio** y cada concha gira y cabecea con su propio período, **la interior más rápido**. Es **rotación diferencial**: una matriz por concha, cero costo por partícula, y las capas se descorrelacionan entre sí.

Los cortes son por **cantidad** y no por radio, así que las tres conchas llevan el mismo número de motas — y como el campo está cargado hacia adentro, la interior queda delgada y densa y la exterior gruesa y rala. Es justo lo que hace legible el efecto: la de adentro está cerca, barre rápido y gira más rápido.

Un detalle que hubo que resolver: para partir el campo en conchas hay que **ordenarlo por radio**, y eso rompía el slider de cantidad (recortar el final se llevaría solo las lejanas). Se baraja **dentro de cada concha** y el recorte se aplica por concha, así que sigue raleando parejo.

### 6.2 · ⚠️ El recorte de `gl_PointSize`, y una corrección a lo que reporté en la Parada 1

La fórmula real de three es

```
gl_PointSize = size × dpr × (altoCSS / 2) / profundidad
```

(`points.glsl.js` más `WebGLMaterials.refreshUniformsPoints`), y **no interviene el FOV**. Un punto de tamaño S a profundidad d ocupa S/(2d) del alto del viewport, sea cual sea la lente.

> **En la Parada 1 usé la proyección geométrica, que sí lleva el factor 1/tan(fov/2) = 3,17.** Eso daba el lado 3,17 veces más grande y el área ~10 veces más, y además no aplicaba el recorte de frustum: un punto cuyo CENTRO sale del volumen de recorte lo descarta WebGL entero, no lo recorta. Los "2.928 px pedidos" que reporté eran de una partícula que ni siquiera se dibuja.
>
> **Los números reales, medidos sobre el recorrido completo con el test de frustum aplicado:**
>
> | | px máximo pedido | puntos del recorrido con un disco > 300 px |
> |---|---:|---:|
> | bokeh hoy (30 de 1,5, radios 4,2–30) | 169 | 0 / 401 |
> | **bokeh hoy escalado a 90** | **525** | **10 / 401** |
> | **bokeh S10 (90 de 1,2, radios 4,2–8)** | **237** | **0 / 401** |
> | polvo S10 (2.400 de 0,17) | 209 | 0 / 401 |
>
> O sea: **el recorte de 1.024 nunca llegaba a dispararse**, y decirlo cambia la magnitud del problema pero no su dirección. Escalar el bokeh a 90 con los radios viejos habría llevado el disco a 525 px —un tercio del alto del cuadro— en 10 puntos del recorrido. El arreglo sigue valiendo y lo hace por construcción.

### ⚠️ La palanca pedida no era la causa, y conviene que quede escrito cuál era

**El sprint pedía elegir `BOKEH_R_MIN` "de modo que el `gl_PointSize` pedido nunca pase de 1024". Ese parámetro no puede lograrlo, y no por poco: no toca la causa.**

Lo que producía el disco pegado no era que hubiera partículas demasiado cerca del logo. Era que **el campo abarcaba los radios donde la cámara VIVE** (4,2 a 30 contra una cámara que va de 9 a 27), y las conchas barren todos los azimuts al girar: una partícula con radio horizontal parecido al de la cámara y altura parecida **termina, tarde o temprano, pasando por la lente**. Medido sobre el recorrido completo con el offset de mouse al máximo, la distancia mínima cámara-partícula era **0,023 unidades** — a esa distancia el sprite pide 42.000 px.

Bajar `BOKEH_R_MIN` mueve el borde INTERIOR del campo. La partícula que pasa por la lente está en el medio del rango, no en el borde: bajar el mínimo la deja exactamente donde estaba.

**La palanca real es `BOKEH_R_MAX`**, porque lo que hay que hacer no es alejar las partículas del logo sino **sacar el campo entero del anillo donde la cámara circula**. Con 8 —por debajo de los 9 de la pose más cercana del recorrido— la separación mínima pasa a ser una propiedad de la geometría y no de la suerte.

**El diagnóstico correcto es "el campo cruza la órbita", no "hay partículas muy cerca".** Es la misma clase de confusión que la lección del repo sobre buscar un discriminador empírico antes de tocar la capa equivocada: el síntoma aparecía en el radio mínimo y la causa estaba en el rango.

**`BOKEH_R_MAX` 30 → 8** pone el campo entero **por dentro de la órbita** (el recorrido nunca acerca la cámara a menos de 9), y entonces la separación mínima es una propiedad de la geometría:

| | valor |
|---|---:|
| distancia mínima cámara-partícula, todo el recorrido con el mouse al máximo | **1,69** |
| `gl_PointSize` máximo que se puede pedir | **575 px** |
| recorte del driver | 1.024 px |
| profundidad a la que se pediría 1.024 | 0,95 |

**El recorte no puede ocurrir.** Y de paso el campo pasa a ser lo que su propio doc decía que era: la escala CERCANA. La lejana es el polvo.

**El polvo sí puede recortarse**, y no se puede evitar sin romper el paralaje del campo: tiene que haber motas más cerca y más lejos que la cámara. Su techo lo pone el near plane (0,1), donde una mota de 0,17 pide 1.377 px. Queda acotado y dicho.

### 6.3 · Costo

Overdraw medido sobre 1920×1080 CSS con dpr 1,5 (2880×1620 device), con el recorte de frustum aplicado:

| pose | polvo | bokeh | total |
|---|---:|---:|---:|
| hero | 0,8% | 3,9% | **4,8%** |
| quiénes somos | 1,2% | 7,7% | **9,0%** |
| números | 0,9% | 3,9% | **4,8%** |
| trabajos | 0,8% | 4,0% | **4,8%** |
| demos | 1,0% | 5,7% | **6,8%** |
| cierre | 0,7% | 2,0% | **2,7%** |

El campo de polvo nunca fue el gasto: lo es el bokeh, que son discos grandes. Aportan **7 a 8 puntos** de bajada al valor medio del cuadro (la mota cercana renderiza en 71 y la lejana en 214).

---

## 7 · Contabilidad

### 7.1 · Draw calls y triángulos

| | S9 | **S10** |
|---|---:|---:|
| draw calls (sin el logo) | 14 | **13** |
| triángulos (sin el logo) | 8.648 | **13.126** |

**Se van 3.204 triángulos** (planos 132, retícula 204, pilares 36, fragmentos 2.640, la pantalla de S7 192) y **entran 7.680**: las dos capas de la envolvente con 20 segmentos verticales cada una. El resto lo aportan el washout (2) y las tapas de la losa.

Los 20 segmentos son el precio del alfa de vértice, y es el trade que se eligió: 7.680 triángulos de más contra **una lectura de textura menos por fragmento sobre medio cuadro, dos veces**. En una escena que ya cubre el 51% y el 57% del cuadro con superficies mezcladas, el fill manda sobre la geometría.

### 7.2 · Fill

- **Dos superficies transparentes** en vez de una: la fina cubre el **56,9% del cuadro en promedio** (pico 100%) y la gruesa el **50,9%** (pico 95%). Las dos a la vez, 50,9%.
- **Las partículas** suman de 2,7% a 9,0%.
- **Ordenamiento por profundidad:** no produce artefactos entre las capas y las partículas, y no es suerte — `renderOrder` fija las capas por delante de todo y `PARTICLE_R_MAX` = `SUN_RADIUS` = 34 impide que una mota quede detrás del sol. Se verifica en `s7-sol.invariant.ts`.
- **Texturas nuevas:** dos celdas de 128² con mipmaps (~128 KB) más el washout de 64² (~16 KB). Se van las tres de S7 (~170 KB). **Neto: menos memoria de GPU que antes.**

### 7.3 · Peso — mismo método que S4 a S7

`next build --webpack` con `E2E_DIST_DIR=.next-probe`, chunks del grupo del canvas leídos del `react-loadable-manifest.json` del propio build, comprimidos a nivel 9.

| | minificado | sobre la red |
|---|---:|---:|
| **grupo del canvas** | **903,2 KiB** | **246,2 KiB** |
| *baseline S7* | *900,7 KiB* | *245,0 KiB* |
| chunk propio del probe (lado canvas) | 19,0 KiB | 6,9 KiB |
| chunk de la ruta (panel, editor, notas, variantes) | 89,8 KiB | 27,8 KiB |
| **total de la ruta** | **993,0 KiB** | **274,0 KiB** |

**+2,5 KiB minificados sobre el grupo del canvas, +0,3%.** Lo que entró —la envolvente, sus dos generadores de celda, el washout, las conchas y el campo ordenado— pesa casi exactamente lo que salió: los once planos, la retícula, los pilares y los tres arcos. Y no viaja al home: `/probe-escena` es una ruta interna con `noindex` y sin un solo link entrante.

### 7.4 · Qué apagar primero si mobile no rinde, en orden

1. **La capa gruesa de la envolvente.** Es la mitad del overdraw nuevo y sacarla deja el fondo entero, solo sin batido de paralaje. Es una línea.
2. **`BOKEH_COUNT`.** 90 sprites grandes son el 2% al 8% del cuadro — el gasto más grande de las partículas.
3. **El slider de partículas**, que ya existe y no reasigna nada.
4. **`SHADOW_RADIUS` 4 → 1.** Vuelve la lectura de sombra a una muestra.
5. **El washout del sol.** Solo cuesta en la ventana en que está en cuadro.

**Nada de esto vale para mobile todavía: sigue sin medirse un solo teléfono y sigue sin medirse frame time — necesita navegador.**

---

## 8 · Las cinco cifras de S9 que este sprint invalida, recalculadas

### 1 · La oclusión del logo pasa a 0%

S9 publicó **9,7% del recorrido en cinco pasadas**. Ahora es **0,0% en 0 pasadas**: no queda nada que pueda cruzarse.

> ⚠️ **Y por eso el chequeo tiene un CONTROL POSITIVO.** Verificar "cero pasadas" contra una escena sin geometría es verdadero por vacío: pasaría igual con el instrumento roto, y seguiría pasando el día que alguien agregue una masa que sí tape el logo. `occlusion.ts` exporta `syntheticOccluder()` y `s9-composicion.invariant.ts` comprueba **primero** que el instrumento detecta una losa puesta a mano —total y parcial, y que le come el cono libre— y **después** afirma que la escena real no tiene ninguna.

### 8.1.1 · ⚠️ El control positivo destapó un falso negativo, y eso invalida dos cifras de S9

**La primera vez que se corrió, el control falló.** Una losa encarada al centro, puesta entre la cámara y el logo en el azimut del hero, daba **55% de oclusión** donde tenía que dar 100%.

La causa: `segmentBoxDistance` marcha el segmento con **120 muestras fijas**. Sobre un rayo de 19 unidades eso es un paso de **0,16**, y los planos suspendidos eran losas de **0,09 de espesor**: la losa **se colaba entre dos muestras** y el test devolvía "no toca". No era un margen de error, era un **falso negativo** — el instrumento decía que no había oclusión con la cara del logo tapada.

**La consecuencia hay que decirla completa: las dos cifras que S9 publicó con este instrumento se midieron con un agujero adentro.**

| cifra de S9 | qué la midió |
|---|---|
| **"9,8% del recorrido con el entorno cruzando por delante, en cinco ventanas"** | el mismo muestreo de 120 pasos contra losas de 0,09 |
| **"el corredor libre es ±29° y es exclusivo de Trabajos y Números"** | ídem, con 200 pasos sobre rayos de 30 |

Las dos **subestimaban la oclusión**, porque el error solo puede ir en una dirección: una muestra que se saltea la losa nunca inventa un choque, solo pierde uno. O sea que el entorno cruzaba por delante del logo **más** de lo que S9 midió, y el corredor libre era **más chico**.

**No se puede saber cuánto más sin volver a correrlo contra los planos, y los planos ya no existen.** Las cifras nuevas de este reporte —0% de oclusión, cono libre en los seis tramos— salieron del instrumento **arreglado** y no heredan el problema. Pero que quede escrito: **las de S9 no eran confiables**, y el número honesto es "no medido con precisión conocida" y no "9,8%".

**El arreglo:** el muestreo se deriva ahora del semieje más chico de la caja, con dos muestras por espesor (`sampleCount()`). Para una losa de 0,09 sobre un rayo de 19 eso son 845 muestras en vez de 120. Y el control positivo queda en el repo **para que un instrumento sin objeto no vuelva a pasar por instrumento sano.**

### 2 · El techo de cámara desapareció, y con él el argumento contra los 720°

Con los planos, el techo iba de **11,8 a 40** según el azimut. Los cuatro azimuts que pedirían dos vueltas daban 13,0 / 14,5 / 15,8 / 24,3 — y ése fue el argumento con el que S9 descartó el recorrido de 720°.

**Sin planos no hay ninguna geometría entre la cámara y el logo en ningún azimut.** El techo pasa a ser uniforme y lo fijan la envolvente (38) y el rango del slider (30).

> **El argumento con el que se descartó el 720° dejó de existir.** No se tocó: es una decisión de recorrido y este es un sprint de escena. Queda anotado en `DIRECCION-ESCENA.md` §2.2 y §7.10 para que quien lo retome no arranque del número viejo.

### 3 · El corredor libre dejó de ser de Trabajos

S9: ±29° exclusivo de Trabajos y Números, contra ±10° en el hero y ±0° en los otros tres.

**Ahora es ±29,3° × ±17,5° —el cuadro entero— en los seis tramos.** Dejó de ser una propiedad de Trabajos y pasó a ser una propiedad de la escena.

Lo que sí sigue variando por pose es la **profundidad**, y ahora la limitan dos cosas distintas:

| tramo | profundidad libre | la limita |
|---|---:|---|
| hero | 13,8 | **el piso** |
| quiénes somos | 38,2 | la envolvente |
| números | 12,7 | **el piso** |
| trabajos | 16,5 | **el piso** |
| demos | 38,1 | la envolvente |
| cierre | 38,1 | la envolvente |

En las poses donde la cámara mira hacia abajo el eje óptico se clava en el papel mucho antes de llegar a la pared. La nota de §7.1 de S9 queda reemplazada por esto.

### 4 · El balance de negro

Todo §2. **La escena queda más clara** y el fondo no puede arreglarlo en dos de las seis poses.

### 5 · La visibilidad del sol

La ventana casi no cambia (33,4% → 33,2% del recorrido con oclusión), pero **el disco visible pasa de 13–36% a 28–71%**: los planos lo tapaban entre el 47% y el 77%. Todo §5.1.

---

## 9 · Verificación

```
tsc --noEmit                          → exit 0
eslint src/app/probe-escena           → exit 0
next build --webpack                  → exit 0
9 suites de comprobaciones (tsx)      → 197/197 en verde
```

| suite | resultado |
|---|---|
| `s7-recorridos` | 44 en verde (eran 48: se fueron los 4 chequeos de planos) |
| `s7-variantes` | 26 en verde |
| `s7-sol` | 15 en verde — el chequeo de la retícula aérea se reemplazó por el de las partículas contra el sol |
| `s7-modelado` | 9 en verde |
| `s7-export` | 11 en verde — **era `s7-moire`**; ver §9.2 |
| `s9-recorrido` | 15 en verde |
| `s9-composicion` | **14 en verde** — con el control positivo nuevo |
| **`s10-fondo`** | **13 en verde** (nuevo) — dónde está la envolvente |
| **`s10-batido`** | **11 en verde** (nuevo) — el batido y el aliasing |
| **`s10-tramas`** | **17 en verde** (nuevo) — las texturas y el orden de dibujo |
| **`s10-escena`** | **11 en verde** (nuevo) — tinta, balance de negro y sol |
| **`s10-particulas`** | **11 en verde** (nuevo) |
| **total del módulo** | **197** |
| `scene-framing` | 23 en verde |
| `introTimeline` / `introFlight` / `introSilhouette` / `introShading` | 279 en verde |
| `introSampling` | 140 en verde, **1 en rojo** |

### 9.1 · El rojo es heredado y deliberado

`introSampling` → *"detecta el cruce estirado"*. **No es de este sprint y no se tocó.** Está en el working tree desde antes de empezar —parte de un trabajo sin commitear en `home-intro/`, que la instrucción prohíbe explícitamente tocar— y su propio comentario dice que se deja en rojo a propósito. Se verificó corriendo la batería **antes** de tocar nada, y `git status` sobre `home-intro/` sigue mostrando exactamente los tres archivos que ya estaban modificados.

### 9.2 · `s7-moire.invariant.ts` se renombró a `s7-export.invariant.ts`

Sus comprobaciones del moiré —aliasing, batido, tramas— se mudaron a `s10-fondo.invariant.ts`, que es donde vive la envolvente que las reemplazó. Lo que quedó ahí es el **round-trip byte por byte del exportador**, que nunca fue del moiré y que sigue siendo lo único que garantiza que calibrar no pierda el razonamiento escrito, más la forma de los sprites del sol.

### 9.3 · Una nota de entorno sobre el build

**El primer `next build` murió con `JavaScript heap out of memory`** en el heap por default (~2 GB) y pasó con `NODE_OPTIONS=--max-old-space-size=8192`. No investigué si precede al sprint; lo que sí es cierto es que ninguno de los diez archivos que este sprint toca puede explicar dos gigabytes. Queda dicho para que el próximo no lo diagnostique de nuevo.

### 9.4 · Los instrumentos nuevos quedan en el repo

Tres archivos que no son de la escena sino de medirla, y que sirven para cualquier sprint que venga:

- **`__tests__/logoInk.ts`** — aplana el `path` del logo (cúbicas, cuadráticas y arcos elípticos por la parametrización de centro) y lo rasteriza. **La marca llena el 42,77% de su caja**, así que medir con la caja daba 2,3 veces de más. Verificado contra `LOGO_INK_VIEWBOX`, que S8b midió por otro camino: coincide en las cuatro cifras.
- **`__tests__/shading.ts`** — el shading de three reimplementado, con la cita de cada chunk. Es lo que permite publicar "el cuadro vale 224 sobre 255" sin abrir un navegador.
- **`__tests__/frameProbe.ts`** — el muestreo del cuadro por rayos.

---

## 10 · Archivos

### Nuevos

| archivo | líneas | qué es |
|---|---:|---|
| `_components/moireTextures.ts` | 145 | Los dos generadores de celda y la envolvente de banda |
| `_components/particleTextures.ts` | 113 | Los tres generadores de sprite de partículas y contacto |
| `_components/SunWashout.tsx` | 78 | El sprite aditivo que apaga la trama donde pasa el sol |
| `__tests__/logoInk.ts` | 296 | El `path` del logo, aplanado y rasterizado |
| `__tests__/shading.ts` | 179 | El shading de three, reimplementado |
| `__tests__/frameProbe.ts` | 253 | El muestreo del cuadro por rayos |
| `__tests__/s10-fondo.invariant.ts` | 168 | Dónde está la envolvente: radios, bandas, celdas |
| `__tests__/s10-batido.invariant.ts` | 285 | El batido, el paralaje y el aliasing en los dos ejes |
| `__tests__/s10-tramas.invariant.ts` | 198 | Las celdas generadas, la envolvente de banda, el orden de dibujo |
| `__tests__/s10-escena.invariant.ts` | 230 | Tinta, balance de negro y el sol |
| `__tests__/s10-particulas.invariant.ts` | 248 | Conchas, recorte de `gl_PointSize` y el número del preloader |
| `docs/rediseno/outputs/S10-FONDO.md` | — | este reporte |

### Borrados

`_components/probeArchitecture.ts` · `_components/LogoFragments.tsx`

### Renombrado

`__tests__/s7-moire.invariant.ts` → `__tests__/s7-export.invariant.ts`

### Modificados

| archivo | qué cambió |
|---|---|
| `_components/probeMoire.ts` | Reescrito: dos capas separadas, celdas por vuelta, el desajuste y la nota del 2:1 coplanar |
| `_components/MoireScreen.tsx` | Reescrito: dos cilindros, alfa de vértice, `renderOrder`, el desajuste desde el store |
| `_components/probeParticles.ts` | Conteos, conchas, `BOKEH_R_MAX` y el campo ordenado por radio con barajado interno; los generadores de sprite salieron a `particleTextures.ts` |
| `_components/ContactOcclusion.tsx` | Solo el import: su generador se mudó con los otros dos |
| `_components/DepthParticles.tsx` · `BokehParticles.tsx` | Tres y dos conchas, recorte por concha |
| `_components/probeSun.ts` | El washout y los `renderOrder`; la doc del radio 34 re-argumentada |
| `_components/SunBody.tsx` | `renderOrder` + la corrección del comentario sobre el ordenamiento |
| `_components/lightRig.ts` | Coloca el washout sobre el eje del sol |
| `_components/OrbitRig.tsx` | Deriva diferencial por concha, `offset.y` de la capa gruesa, el washout |
| `_components/ProbeStage.tsx` | Sin arquitectura ni fragmentos; con la envolvente, el washout y las conchas |
| `_components/probeScene.ts` | Sin los colores ni los fragmentos; la nota de qué se borró y por qué |
| `_components/probeStore.ts` | `moireMismatch` y el default de partículas |
| `_components/ProbeControls.tsx` | El texto del panel para los dos sliders que quedan vivos |
| `_components/choreographyPhysics.ts` | La deriva pasa a ser diferencial: un array por concha |
| `__tests__/occlusion.ts` | Lista de ocluyentes propia y vacía, `syntheticOccluder()`, `backDepth()`, muestreo adaptativo |
| `__tests__/s9-composicion.invariant.ts` | Control positivo + los chequeos invertidos + el corredor recalculado |
| `__tests__/s7-recorridos.invariant.ts` · `s7-sol.invariant.ts` | Sin los chequeos de planos y de retícula |
| `docs/rediseno/DIRECCION-ESCENA.md` | §2.1 · §2.2 · §2.6–2.8 nuevas · §3 reglas 6, 7, 9 y 10 · §4 y §4.1 · §6 · §7.9 y §7.10 |

### Intocados

**El home, `home-intro/` entero, los archivos frozen, la coreografía, el arco del sol, la base de datos y las dependencias.** Cero `any`, cero `setState` por frame. No se construyó nada del efecto Star Wars ni del preloader.

### 10.1 · El límite de 300 líneas

Se partieron cuatro, y ninguna partición fue por contar líneas: todas tienen costura.

| se partió | en | por qué ese corte |
|---|---|---|
| la envolvente | `probeMoire.ts` (los números y su razonamiento) + `moireTextures.ts` (cómo se dibujan) | mismo seam que `choreography.ts` ↔ `choreographyNotes.ts` |
| `probeParticles.ts` (362) | + `particleTextures.ts` (113), quedó en **261** | mismo seam, y de paso `ContactOcclusion` deja de importar su sprite de un archivo que se llama "partículas" |
| las comprobaciones de la envolvente (583) | `s10-fondo` (168) + `s10-batido` (285) + `s10-tramas` (198) | dónde está · qué produce · cómo se dibuja |
| las de la escena (454) | `s10-escena` (230) + `s10-particulas` (248) | el cuadro contra el aire que lo llena |

Los instrumentos nuevos se escribieron ya partidos por tema: `logoInk` (el path), `shading` (el rig), `frameProbe` (los rayos).

**Siguen arriba del límite seis archivos, y hay que decir cuál es de quién:**

| archivo | líneas | |
|---|---:|---|
| `choreography.ts` | 462 | heredado — dato más su razonamiento |
| `choreographyEditor.ts` | 376 | heredado |
| `probeStore.ts` | 352 | heredado (331 antes); S10 le sumó 21 con `moireMismatch` |
| `probeScene.ts` | 348 | heredado, y **S10 lo bajó de 413** |
| `KeyframeEditor.tsx` | 310 | heredado |
| `OrbitRig.tsx` | 626 | heredado (583) — un solo `useFrame`; repartir el cuadro entre archivos lo hace más difícil de razonar |
| **`lightRig.ts`** | **319** | ⚠️ **cruzó el límite por S10**, con 20 líneas: el washout. Es una sola función sobre objetos de three y partirla sería cortar el frame al medio. Queda dicho, no escondido. |

---

## 11 · Lo que queda

### Para calibrar mirando

1. **El peso de la envolvente.** `MOIRE_OPACITY` (0,45) y `MOIRE_BASE_ALPHA` (0,18). Es la primera perilla si la escena se siente cargada o lavada, y su efecto está medido en las dos posiciones (§2).
2. **El desajuste.** Slider en el panel, 0 a 12, default 2. En 0 se ve cuánto aporta el paralaje solo.
3. **El washout del sol.** `SUN_WASHOUT_OPACITY` (0,28). Cuesta contraste — la tabla está en §5.2.
4. **El conteo de partículas.** Slider, default 2.400 de 3.000.
5. **La deriva de la capa gruesa.** `MOIRE_DRIFT_PERIOD_S` (18,7 s por celda). El sitio hace 17,3.
6. Todo lo que S9 dejó abierto y este sprint no tocó: la elevación de entrada, la temperatura del cierre, `SUN_CORE` y `SUN_SPRITE_RADIUS`.

### Lo que este sprint dejó afuera, a propósito

- **El piso**, que es el pendiente grande y tiene sprint propio (§2).
- **El efecto Star Wars.** Solo se remidió el corredor.
- **Montar la escena en el home**, el scroll real, mobile y el encuadre por relación de aspecto.
- **Los 720°**, que volvieron a ser posibles y son decisión de recorrido.

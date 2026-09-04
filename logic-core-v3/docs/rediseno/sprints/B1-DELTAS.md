# B1 · LA TABLA DE DELTAS — `/v3` contra `nk.studio`

**Qué es.** El producto de la Fase 0.1 de **B1 — La resta**. Es la vara con la
que los cuatro frentes de la Fase 1 deciden cuánto aire sacar, para que ninguno
lo decida por gusto.

**Cómo se midió.** Con la receta de `docs/rediseno/MEDICION-NAVEGADOR.md`,
`chrome-devtools-mcp`, viewport emulado, `visibilityState: 'visible'` verificado
antes de cada lectura. **De nk se midió y no se copió**: ni un selector, ni una
clase, ni un valor de CSS, ni un asset. Los números están escritos por nosotros.
Una navegación por ancho, y la pestaña cerrada al terminar.

**Fecha de la medición:** 3 de septiembre de 2026. Todo lo de `/v3` sale del
worktree `C:\rediseno-home`, rama `rediseno/home`, commit `f8a38fd7`.

---

## 1. La tabla que pide la instrucción

| medición | en nk | en /v3 (antes) |
|---|---|---|
| **Ancho de la columna de texto del hero** | **480 px**, fijo. 0,33 del viewport a 1440 y **0,25 a 1920**. No crece con la ventana. | 725,6 px (0,50) a 1440 · 1013,6 px (**0,53**) a 1920 · 1052 px (0,41) a 2560 |
| **Tamaño renderizado del titular del hero** | **72 px**, el mismo a 1440 y a 1920. No es fluido. | 56 px a 1440 · **65,01 px** a 1920 y 2560 (fluido, `titulo-xl`) |
| **Longitud de línea del párrafo del hero** | **no hay párrafo en el hero.** Sólo el titular, en 3 líneas de ~11,7 caracteres. | **141 caracteres en UNA línea** a 1920 y 2560 · 70,5 a 1440 |
| **Alto de cada sección del home** | una sola pieza de scroll, sin secciones separables por estructura. **22,62 pantallas** de documento a 1920 (23,47 a 1440 — el mismo número que este repo ya tenía publicado) | 8 secciones, **14,00 pantallas** a 1920 y 14,12 a 1440 (§2) |
| **Aire muerto por sección** | **10,31 % promedio** sobre 8 pantallas repartidas · máximo 29,91 % · **banda vacía continua máxima 50 px** | **45,30 % promedio** · máximo **85,65 %** · **banda vacía continua máxima 849 px** (§3) |
| **Distancia del titular al tope de su sección** | 334,86 px a 1920 (0,31 pantallas) | 426,1 (hero) · 503,6 · 348,8 · 51,0 · 106,0 · 176,3 · 107,0 · 139,1 px |
| **Dónde termina el texto respecto del objeto 3D** | el texto del hero termina en x 688,95; la pieza visual ocupa el resto del cuadro. Sin superposición. | **el texto se METE en el logo**: el titular 120 px (1440 y 1920) y 90 px (2560); la bajada 219 · 212 · 182 px. Contraste en el peor píxel **1,00:1** (§4) |

---

## 1-bis. EL HALLAZGO QUE DA VUELTA EL DIAGNÓSTICO

> **No somos largos: somos cortos y vacíos.**

Este bloque se escribió con la premisa de que el home tenía DE MÁS y había que
restar. La medición dice lo contrario, y con dos pares de cifras tomados con el
mismo instrumento:

| | nk.studio | /v3 |
|---|---|---|
| pantallas del documento @1920 | **22,62** | **14,00** |
| aire muerto promedio | **10,31 %** | **31,47 %** (era 45,30) |
| momentos reales del recorrido | **20,5** | **12,0** |

Las dos cifras de momentos salen de `s7-ritmo.invariant`, que las deriva del
pinneo con `momentos = pantallas − pinneadas + secuencias`: la referencia da
`23,47 − 5,01 + 2 = 20,5` y las ocho dan `14,0 − 4,0 + 2 = 12,0`.

**nk mide 1,6 veces nuestro home Y está tres veces más lleno.** Las dos cosas a
la vez. Un sitio que es más largo y encima tiene menos aire no está resolviendo
el mismo problema que nosotros: está poniendo **más eventos**, no distribuyendo
mejor los que tiene.

Y la tercera fila es la que lo cierra, porque no es de este sprint: **12,0
momentos reales contra 20,5** es la cuenta de ritmo que este repo publica desde
SITIO-S7 (`s7-ritmo.invariant`), derivada del pinneo y no del aire. Las tres
cifras dicen lo mismo desde tres lugares distintos.

### Qué reencuadra para el bloque siguiente

**La densidad que falta no se gana recortando.** B1 podía sacar el vacío —y lo
sacó: 45,30 % → 31,50 %, y la banda vacía continua máxima de 849 px a 125— pero
ahí se termina lo que la resta puede dar. El home seguiría teniendo 14 pantallas
y 12 momentos contra 22,6 y 20,5.

Lo que sigue no es otra pasada de resta: es **agregar acontecimientos**. Ocho
momentos y media docena de pantallas de diferencia no salen de recomponer lo que
hay; salen de que pasen más cosas. Y hay una consecuencia práctica inmediata: la
razón por la que este bloque no pudo bajar ninguna altura —el anclaje de la
escena está atado a la tabla de secciones— **deja de ser una restricción cuando
lo que se hace es sumar**, porque una sección nueva o un tramo nuevo se declaran
en la misma tabla, no la contradicen.

⚠️ Y el corolario incómodo, que conviene tener escrito: **el aire muerto no es la
métrica de este proyecto de acá en adelante.** Sirvió para encontrar el defecto y
ya lo encontró. La métrica del bloque que viene es la de momentos.

---

### El delta en una línea

**nk es más LARGO y está más LLENO.** 22,6 pantallas contra 14, y 10 % de aire
contra 45 %. La resta no es acortar el home: es **sacar el vacío de adentro de
cada pantalla**. Un layout de 14 pantallas medio vacías rinde peor que uno de 22
llenas — que es exactamente lo que Franco dejó escrito.

**Y las columnas de texto de nk son angostas y FIJAS.** 480 px a 1440 y a 1920:
la caja no acompaña a la ventana. La nuestra crecía hasta 1013 px y por eso una
sola línea de 141 caracteres.

---

## 2. Alto por sección, medido a 1920×1080

`natural` = lo que mide la sección con el `min-height` de la tabla puesto en cero
en runtime. `cajas internas` = cuántos descendientes piden una pantalla propia.

| # | sección | declarado | natural | cajas internas | ¿quién fija el alto? |
|---|---|---|---|---|---|
| 01 | hero | 1080 | 1080 | 1 | la caja interna |
| 02 | quiénes somos | 2160 | 2160 | **2** | las cajas internas |
| 03 | números | 1080 | 1080 | 1 | la caja interna |
| 04 | trabajos | 3240 | **1080** | **0** | **la tabla** — 2160 px sin nada que los sostenga |
| 05 | servicios | 3240 | 3240 | **3** | las cajas internas |
| 06 | tu panel | 2160 | 2160 | **2** | las cajas internas |
| 07 | por qué develOP | 1080 | 1080 | 1 | la caja interna |
| 08 | cierre | 1080 | **780** | 0 | la tabla (300 px de piso) |

**Esto reescribe el diagnóstico de la instrucción.** *«`secciones.ts` declara
alturas en `svh` y el contenido no las llena»* es cierto como síntoma y falso
como causa: en seis de las ocho, el alto lo fija la propia sección con sus
`min-h-svh`, no la tabla. **La resta de una sección se hace en su composición.**

---

## 3. Aire muerto sobre el píxel — la métrica que corre igual en los dos sitios

**Definición.** Una FILA de la pantalla «tiene contenido» si en algún punto hay
un **borde**: dos muestras vecinas cuya luminancia relativa difiere más de 0,02.
Una franja lisa —un panel de papel, un negro plano— o un degradé suave **no**
tiene contenido: es fondo. El aire muerto de una pantalla es la fracción de filas
sin contenido. Se mide sobre la captura, así que no toca el DOM de nadie y da lo
mismo en un sitio propio que en uno ajeno.

**Por qué un borde y no la varianza:** un degradé de fondo tiene varianza alta y
no es contenido; un renglón de texto tiene bordes aunque ocupe pocos píxeles.

### nk — ocho pantallas repartidas, 1920×1080

| pantalla | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| aire muerto | 9,54 % | 5,37 % | 23,06 % | 29,91 % | 0 % | 0 % | 3,61 % | 11,02 % |
| banda vacía máx. | 7 px | 5 px | 12 px | 9 px | 0 | 0 | 15 px | **50 px** |

**Promedio 10,31 % · máximo 29,91 % · la banda vacía más grande de todo el
recorrido son 50 px.**

### /v3 — una pantalla por sección, 1920×1080

| sección | aire muerto | banda vacía máx. |
|---|---|---|
| 01 hero | **0 %** | 0 px |
| 02 quiénes somos | 65,09 % | **600 px** |
| 03 números | 57,13 % | 178 px |
| 04 trabajos | **85,65 %** | **849 px** |
| 05 servicios | 33,52 % | 104 px |
| 06 tu panel | 51,67 % | 445 px |
| 07 por qué develOP | **0 %** | 0 px |
| 08 cierre | 69,35 % | 337 px |

**Promedio 45,30 % · máximo 85,65 % · banda vacía más grande 849 px.**

⚠️ **Hero y Por qué develOP dan 0 % y no es un error del instrumento**: son las
dos secciones `papel-transparente`, y ahí la escena 3D llena la pantalla de
textura. El instrumento mide lo que se VE, y en esas dos lo que se ve es la sala.
Su defecto es otro y está en §4.

### La vara para la Fase 1

**El techo no es un porcentaje: es la banda continua.** Un porcentaje alto
repartido en aire entre bloques es composición; **una banda de 600 u 849 px sin
nada es el defecto**.

- **Referencia externa:** la banda vacía más grande de nk es **50 px**.
- **Referencia interna:** la mejor sección que este sitio ya tiene es Servicios,
  con **104 px**.
- **Objetivo operativo: ninguna banda vacía continua por encima de 104 px.** Toda
  banda que quede arriba se reporta con su número y su razón. No se afloja: se
  explica.

---

## 4. El hero — el defecto medido y el arreglo medido

### Cómo se mide «dónde empieza el logo»

No por «el primer píxel oscuro»: la escena tiene partículas negras sueltas por
toda la pantalla y un punto de 3 px no vuelve ilegible un renglón. El **borde
seguro** es la primera columna de píxeles en la que **más del 10 % de la banda
vertical del texto** deja la tinta `rgb(17,17,17)` por debajo de AA (4,5:1). En
los tres anchos ese borde coincide **al píxel** con el arranque de la masa
oscura, así que el criterio no está inventando un límite: lo está encontrando.

### Antes

| ancho | borde seguro | fin del titular | fin de la bajada | peor contraste | % de la caja bajo AA |
|---|---|---|---|---|---|
| 1440 | x = 683 | 803 (**+120**) | 902 (**+219**) | **1,00:1** | 12,66 % (titular) · 26,28 % (bajada) |
| 1920 | x = 957 | 1077 (**+120**) | 1169 (**+212**) | **1,00:1** | 9,22 % · 17,01 % |
| 2560 | x = 1275 | 1365 (**+90**) | 1457 (**+182**) | **1,00:1** | 10,22 % · 14,41 % |

**1,00:1 no es «poco contraste»: es tinta negra sobre logo negro.** Invisible.

### Qué se cambió

- **La caja del titular pasa a 2 de 3 de la medida** (sub-grilla que reproduce
  exacto las columnas de la grilla de 5). Forzado por el número de arriba.
- **La bajada pasa a media medida** — la decisión del humano, aplicada a la
  medida del hero. «Media columna fluida» se descartó porque **no cumple la
  propia condición de la instrucción**: daría 610 px a 1440 y terminaría en
  x 798, afuera del borde seguro de 683.
- **El nivel tipográfico no se tocó**, y se verificó que es el correcto:
  `titulo-xl` es el más grande de los cuatro y el hero ya lo usaba en su familia
  fluida (56 px a 1440 · 65,01 px a 1920 y 2560).
- **La pose del hero no se tocó.** Esto es layout.

### Después — contraste medido **bajo el glifo**, no bajo la caja de línea

Medir sobre la caja del renglón sobrestima: la caja es casi todo fondo. El
instrumento separa el glifo del fondo con tres capturas —dos del fondo (texto
ocultado en runtime) y una con el texto— y descarta como «escena en movimiento»
todo píxel que cambie entre las dos capturas de fondo.

| ancho | borde seguro | fin del texto | margen | **peor contraste bajo glifo** | píxeles bajo AA |
|---|---|---|---|---|---|
| 1440 | 684 | 639 | **45 px** | **10,45:1** | **0** de 40.143 |
| 1920 | 957 | 817 | **140 px** | **7,38:1** | **0** de 26.842 |
| 2560 | 1276 | 1105 | **171 px** | **5,47:1** | **0** de 21.060 |

**Ningún píxel de texto sobre el logo, en los tres anchos.** El peor caso pasa
de 1,00:1 a 5,47:1, y AA se cumple en el peor píxel de los tres.

### Longitud de línea de la bajada

| ancho | antes | después |
|---|---|---|
| 1440 | 2 líneas de **70,5** caracteres | 3 líneas de **47** |
| 1920 | 1 línea de **141** | 3 líneas de **47** |
| 2560 | 1 línea de **141** | 2 líneas de **70,5** |

---

## 4-bis. EL MÉTODO: EL CONTRASTE VA BAJO EL GLIFO, NO BAJO LA CAJA DEL RENGLÓN

**Nadie pidió esto y cambia lo que significan todas las cifras de contraste
anteriores de este proyecto.** Va acá para que se pueda decidir qué hacer con
ellas.

### El problema

Hasta B1, «el contraste de un texto sobre un fondo» se medía tomando la caja del
renglón —el rectángulo que `getClientRects()` devuelve— y comparando la tinta
contra los píxeles de ahí adentro. **Esa caja es casi todo fondo.** Un renglón de
15 px de cuerpo tiene unos 18 px de alto de caja y sus glifos ocupan una fracción
chica de ella: el resto es el espacio entre letras, entre palabras, y el aire por
arriba y por abajo de las astas.

Sobre un fondo plano da igual. **Sobre la escena 3D no**, porque la sala tiene
partículas oscuras sueltas por toda la pantalla: un punto de 3 px que cae entre
dos letras aparece en la caja del renglón y hunde el «peor píxel» a 1,0:1 **sin
volver ilegible absolutamente nada**.

### Lo que cuesta, con el número

El titular del hero después del arreglo, a 1440, medido de las dos formas:

| | peor contraste | píxeles bajo AA |
|---|---|---|
| sobre la CAJA del renglón | **3,04:1** | 0,40 % de la caja |
| sobre el **GLIFO** | **10,45:1** | **0 de 40.143** |

La misma tipografía, el mismo fondo, el mismo instante. **Un método dice que no
llega a AA y el otro dice que le sobra el doble.** El que describe lo que una
persona ve es el segundo.

### Cómo se separa el glifo del fondo

Tres capturas, sin tocar el código de la página:

1. **A** — el fondo, con el contenido de la sección en `visibility: hidden` puesto
   en runtime.
2. **B** — el fondo otra vez, el cuadro siguiente.
3. **C** — con el texto.

Un píxel es **glifo** si `|C − A| > 24` por canal **y además** `|B − A| ≤ 10`. La
segunda condición es la que hace honesto al método: **descarta lo que se movió
entre los dos cuadros de fondo**, o sea las partículas y el logo derivando. Sin
ella, la escena en movimiento entra como si fuera texto — y entra mucho: a 1920
se descartan 17.317 píxeles por esa causa contra 26.842 de glifo real.

Después, para cada píxel de glifo se toma la luminancia del FONDO (A, no C) y se
calcula el contraste contra el color de la tinta leído del DOM.

⚠️ **Y se acota a la caja del texto medida en el DOM**, con el borde derecho REAL
—no el del contenedor—. Más allá de ahí no hay glifos y lo que difiere entre
cuadros es la escena: sin ese recorte, el «peor píxel» aparecía en x 1027 cuando
el texto terminaba en 639.

El instrumento es `contraste-glifo2.js`, sin dependencias, y está en el
scratchpad de la corrida junto con `pixeles.js` (decodificador PNG + luminancia +
contraste WCAG).

### Qué hacer con las cifras viejas

**No se invalidan, se acotan.** Toda cifra de contraste de este proyecto tomada
sobre un fondo PLANO —un token contra otro token— sigue siendo correcta: ahí la
caja y el glifo dan lo mismo. Las que hay que volver a mirar son las tomadas
**sobre la escena**, porque ahí el método viejo subestima y puede haber rojos que
no eran rojos. Las tres que B1 rehizo así están en §4.

---

## 5. Los dos pines, con scroll real

Medido moviendo el scroll de verdad y leyendo la posición del hijo pegado en cada
parada — no comparando alturas. Un pin «verificado» por geometría no está
verificado: `position: sticky` se apaga en silencio con cualquier ancestro de
`overflow` distinto de `visible`, y las cajas no cambian cuando eso pasa.

| sección | el pin arranca | el pin suelta | recorrido | ¿anda? |
|---|---|---|---|---|
| trabajos | `scrollY` 4320 | 6480 | **2160 px = 2 pantallas** | **sí** |
| servicios | 7560 | 9720 | **2160 px = 2 pantallas** | **sí** |

**Los dos pines funcionan.** El problema de Trabajos no es el pin.

### El defecto de Trabajos, con su cuenta

Con la página recién cargada, las tres tarjetas de Trabajos pasan de opacidad 0
a 1 y **vuelven a 0 entre `scrollY` 3595 y 4270**. La sección empieza en 4320:

> **Las tres tarjetas terminan de desaparecer 50 px ANTES de que la sección
> toque el tope del viewport.** Durante sus tres pantallas —4320 a 7560— están
> en opacidad 0. Lo que se ve son tres pantallas de titular sobre negro.

La cuenta que lo explica: el ancla de P7 es `top bottom` → `bottom bottom`, o sea
**rango = alto del bloque** = 826 px, resuelto contra la posición natural del
bloque. Un bloque de 826 px adentro de una sección de 3240 consume su patrón en
el 25 % del recorrido de la sección — y ese 25 % ocurre **antes** de que la
sección llegue arriba, porque el hijo `sticky` ya está clavado.

**El arreglo (Fase 0, contrato):** `BloqueProps` gana `anclaje: 'patron' | 'pin'`.
Con `'pin'` el bloque mide contra `ANCLA_DEL_PIN` —`alto − viewport`, los 2160 px
del recorrido— **sin perder los fotogramas del patrón**, que es lo que `patron:
'pin'` sí perdería: `estiloDelBloque` dejaría de emitir la perspectiva de 1000 px
que P7 declara, y sin perspectiva un `translateZ` no se ve.

---

## 6. La pastilla — cuánto tapa, medido

Pastilla a 1920: **604,05 × 48 px**, de `y` 24 a 72, de `x` 658 a 1262.

Barriendo el documento cada 0,25 de pantalla y buscando qué texto **visible**
cruza su caja:

| sección | paradas con choque | peor solape vertical | tamaño de letra más grande tapado |
|---|---|---|---|
| quiénes somos | 2 | 21,17 px | 53,01 px (el titular) |
| números | 1 | **41,72 px** | 53,01 px (el titular) |
| trabajos | **10** | 24,00 px | 38,31 px (el titular) |
| tu panel | 2 | 12,00 px | 15 px |
| por qué develOP | 3 | 27,72 px | **65,01 px** (el titular) |
| **servicios** | **0** | — | — |

**23 choques en 5 secciones.** Con la sección apoyada en el tope del viewport,
Trabajos tiene el titular tapado en **11,41 % de su área** (21 px × 390 px).

⚠️ **Lo que NO se reprodujo:** la instrucción cita *«Servicios ("Software a
medida")»*. **A 1920, barriendo cada 0,25 de pantalla, Servicios da CERO
choques.** Queda como pendiente de reproducir a otro ancho, y no se da por bueno
ni por falso.

---

## 7. Lo que la medición cambió respecto de la instrucción

Tres premisas de la instrucción no sobrevivieron a la medición. Se escriben para
que nadie las vuelva a usar:

1. **«La bajada es una sola línea de ~1.700 px».** Medido: **980,86 px** a 1920 y
   a 2560 (141 caracteres). Sí era una sola línea, y sí era el defecto; el número
   no era ése. Los 1.700 px son el ancho de la columna fluida, no el del párrafo.
2. **«Trabajos: media pantalla vacía debajo del titular».** Es peor: **tres
   pantallas** sin las tarjetas, no media. §5.
3. **«`secciones.ts` declara alturas en `svh` y el contenido no las llena»** como
   causa. En seis de las ocho el alto lo fijan los `min-h-svh` internos de la
   propia sección; la tabla sólo manda en Trabajos y en Cierre. §2.

# COMPONENTS — inventario de componentes y estados

Fuente: `https://www.nk.studio/`, `https://www.nk.studio/studio/`, `https://www.nk.studio/work/pomelo/`
Fecha de medición: 2026-08-24, entre 14:24Z y 14:52Z
Herramientas: chrome-devtools-mcp sobre Chrome, estilos computados y `getBoundingClientRect`; movimiento real de mouse y pulsaciones reales de Tab por CDP; recorrido del CSSOM para contar reglas por pseudoclase
Estado: borrador

Alcance: home, studio y case a 1440×900; home a 390×844 con `mobile` y `touch` emulados.
Volcados: `raw/componentes/{home,studio,case}-1440.json`, `raw/componentes/home-390.json`,
`raw/estados/{home,studio,case}-1440.json`.

---

## 1. Cómo se identificó un componente

**Firma estructural.** No se agrupa por nombre de clase: está prohibido guardarlos y además
Tailwind los vuelve inútiles como identidad. Cada elemento se reduce a dos firmas `[medido]`:

- `firmaEstructural` = `tag | cantidad de hijos directos | tags de esos hijos | display`
- `firmaForma` = `padding | border-radius | background-color | font-size`

La firma completa es la concatenación de ambas. La estructural sola sirve para comparar 1440
contra 390, donde la forma cambia por la tipografía fluida.

**Qué se descartó antes de contar** `[medido]`: los elementos del espacio de nombres SVG
—`path`, `g`, `circle` y compañía son primitivas gráficas, no componentes—, los de rect 0×0,
los de `display:none` o `visibility:hidden`, y los de opacidad efectiva acumulada por la
cadena de ancestros ≤ 0,01. En home a 1440 eso descarta **3.114 nodos SVG de 4.684 elementos**
y deja **1.067 visibles**.

| captura | elementos | SVG descartados | con rect | visibles | firmas completas | firmas estructurales |
|---|---|---|---|---|---|---|
| home @1440 | 4.684 | 3.114 | 1.192 | **1.067** | 218 | 148 |
| studio @1440 | 2.927 | 751 | 1.595 | **1.255** | 234 | 164 |
| case @1440 | 1.222 | 196 | 683 | **605** | 159 | 115 |
| home @390 | 2.589 | 1.286 | 800 | **718** | 179 | 120 |

Todo `[medido]`, un asentamiento completo por captura.

### Umbral declarado

> **Una firma es candidata a componente si aparece 3 o más veces en al menos una de las tres
> URLs a 1440, o si aparece en las tres URLs.**

Con tres URLs en alcance, "tres o más URLs" equivale a "en las tres".

**El umbral solo no alcanza.** Aplicado sobre las 311 firmas completas distintas de las tres
páginas, deja pasar **181**, que no es un inventario: es una hoja de estilos transcrita. La
mayoría son `div` de andamiaje sin identidad propia —fondo transparente, sin padding, sin
radio, sin borde, no focalizables—, plomería de layout que existe para posicionar, no para
significar. Por eso hay una segunda etapa:

> **Segunda etapa, filtro de identidad.** Una firma es componente si además es *interactiva*
> (`a[href]`, `button`, `input`, `textarea`, `[tabindex]`) **o** tiene *identidad visual*:
> fondo no transparente, o `border-radius` > 0, o borde con grosor > 0, o sombra, o
> `backdrop-filter`, o padding propio, o es un encabezado `h1`–`h6`, o tiene `mix-blend-mode`.

| etapa | firmas |
|---|---|
| firmas completas distintas en las 3 URLs @1440 | 311 |
| pasan el umbral de repetición | 181 |
| **quedan afuera por no alcanzarlo** | **130** (14 con exactamente 2 apariciones, 116 con 1) |
| pasan además el filtro de identidad | **44** |
| descartadas como andamiaje estructural | 137 |

De las 44, **27 aparecen en las tres URLs**, 6 en dos y 11 en una sola. Todo `[medido]`.

**Advertencia sobre la firma estructural en hojas** `[medido]`: para elementos sin hijos
—`div|0||block`, `p|0||block`— la firma estructural no discrimina nada: es una hoja genérica y
agrupa componentes distintos. `div|0||block` reúne 88 elementos en home @1440 que no son un
componente sino muchos. Para esos casos **solo la firma completa identifica**; la comparación
1440↔390 de la sección 6 lo marca donde aplica.

---

## 2. Inventario de componentes

Las 27 firmas presentes en las tres URLs, agrupadas por función. La columna de tokens cruza
los valores medidos contra `tokens/referencia/tokens.json` de B2.1 — todos `[derivado]` de esa
tabla y del volcado propio.

### 2.1 Los que están en las tres páginas

| componente | firma estructural | apariciones (home/studio/case) | tokens que consume |
|---|---|---|---|
| **CTA de rollover** | `button\|2\|span,div\|inline-block` | 17 (12/4/1) | `color.papel`, `text.base`, `font-weight.normal`, `spacing.2`, `duracion.rapida`, `ease.salida` |
| **CTA de rollover, variante block** | `button\|2\|span,div\|block` | 9 (4/2/3) | idénticos al anterior |
| **Envoltorio de enlace del CTA** | `a\|1\|button\|block` | 6 (3/2/1) | `color.papel`, `text.base` |
| **Ventana de recorte del rollover** | `span\|1\|span\|inline-flex` | 26 (16/6/4) | `text.cuerpo`, `tracking.texto`, `font-weight.semi`, `duracion.rapida` |
| **Link de la navegación flotante** | `a\|0\|\|block` | 15 (5/5/5) | `color.papel`, `text.cuerpo`, `tracking.texto`, `font-weight.semi`, `duracion.lenta`, `ease.principal` |
| **Link del pie con icono** | `a\|2\|svg,span\|flex` | 42 (14/14/14) | `color.papel`, `text.cuerpo`, `tracking.texto`, `font-weight.semi`, `spacing.4` |
| **Botón social del pie** | `a\|1\|svg\|flex` | 21 (7/7/7) | `color.papel`, `text.micro`, `leading.micro`, `font-weight.medio`, `spacing.2` |
| **Link de contacto del pie** | `a\|1\|span\|block` | 3 (1/1/1) | `color.papel`, `text.titulo-s`, `leading.titulo`, `tracking.texto`, `duracion.rapida`, `ease.principal` |
| **Link de texto del pie** | `a\|1\|span\|inline` | 12 (4/4/4) | `color.papel`, `tracking.texto` (17 px, fuera de la escala) |
| **Link con icono y separación** | `a\|2\|svg,span\|flex` (gap 6) | 3 (1/1/1) | `color.papel`, `text.caption`, `duracion.muy-lenta`, `ease.principal` |
| **Link de acento en texto** | `a\|0\|\|inline` | 3 (1/1/1) | `color.acento`, `text.titulo-m`, `leading.titulo`, `tracking.texto`, `font-weight.medio`, `duracion.rapida`, `ease.principal` |
| **Etiqueta de sección** | `p\|0\|\|block` (padding-left 31) | 29 (15/11/3) | `color.papel`, `text.micro`, `leading.micro`, `font-weight.medio` |
| **Chip de etiqueta** | `div\|0\|\|block` (4/6, radio 4) | 9 (4/4/1) | `color.tinta`, `color.superficie-tenue`, `leading.texto`, `radius.sutil`, `spacing.1` |
| **Pastilla de opción de formulario** | `div\|1\|p\|flex` (radio 100) | 24 (8/8/8) | `color.tinta`, `color.borde`, `text.caption`, `leading.texto`, `font-weight.ligero`, `radius.pastilla-l`, `spacing.4`, `duracion.muy-lenta`, `ease.principal` |
| **Campo de texto del panel** | `div\|3\|input,span,div\|flex` (radio 80) | 12 (4/4/4) | `color.tinta`, `color.borde`, `text.base`, `radius.pastilla-s`, `duracion.rapida`, `ease.salida` |
| **Input del panel** | `input\|0\|\|block` (radio 80) | 12 (4/4/4) | `color.tinta`, `text.caption`, `leading.texto`, `font-weight.ligero`, `radius.pastilla-s`, `spacing.3` |
| **Textarea del panel** | `textarea\|0\|\|inline-block` | 3 (1/1/1) | `color.tinta`, `color.borde`, `text.caption`, `spacing.3`, radio 16 px (fuera de la escala) |
| **Checkbox del panel** | `input\|0\|\|block` (radio 50 %) | 3 (1/1/1) | `radius.circulo` |
| **Botón cuadrado con icono** | `button\|1\|svg\|flex` (radio 7) | 3 (1/1/1) | `color.tinta`, `color.borde`, `text.base`, `duracion.muy-lenta`, `ease.principal` |
| **Formulario de newsletter del pie** | `form\|2\|input,button\|flex` | 3 (1/1/1) | `color.papel`, `text.base`, `radius.pastilla-s` |
| **Input de newsletter** | `input\|0\|\|block` (12 px) | 3 (1/1/1) | `color.texto-tenue`, `text.caption` |
| **Botón de envío de newsletter** | `button\|1\|svg\|flex` (radio 24) | 3 (1/1/1) | `color.papel`, `color.superficie-tenue-inv`, `text.base` |
| **Panel de contacto** | `form\|4\|div,div,div,div\|flex` | 3 (1/1/1) | `color.tinta`, `color.papel`, `text.base`, `duracion.muy-lenta`, `ease.principal` |
| **Título del panel de contacto** | `h4\|1\|br\|block` | 3 (1/1/1) | `color.tinta`, `text.titulo-m`, `leading.titulo`, `tracking.texto`, `font-weight.medio` |
| **Título de cierre del pie** | `h2\|2\|br,b\|block` | 3 (1/1/1) | `color.papel`, `text.titulo-xl`, `tracking.titulo`, `font-weight.normal` |
| **Cover de enlace** | `a\|1\|div\|block` | 56 (5/30/21) | `color.papel`, `text.base` |
| **Botón de barra superior** | `span\|2\|span,span\|flex` (0/12) | 12 (4/4/4) | `color.tinta`, `text.base`, `duracion.muy-lenta`, `ease.salida` |

**Ningún valor de estos componentes cae fuera del sistema de B2.1**, con dos excepciones
`[medido]`: el link de texto del pie computa **17 px**, que no es ninguno de los ocho niveles
de `text.*`, y el textarea usa **radio 16 px**, que no es ninguno de los seis de `radius.*`.
Dos huérfanos sobre 27 componentes.

### 2.2 Los que están en dos páginas

| componente | firma | apariciones | dónde | tokens |
|---|---|---|---|---|
| **Tarjeta de superficie con desenfoque** | `div\|3\|div,div,p\|flex` (28/32, radio 10) | 14 (7/7/—) | home, studio | `color.papel`, `text.caption`, `leading.texto`, `font-weight.ligero`, `radius.fuerte`, `spacing.8`, `duracion.rapida`, `blur.panel` |
| **Bloque de tres columnas del pie** | `div\|3\|div,div,div\|grid` (15/0) | 10 (5/5/—) | home, studio | — |
| **Encabezado h3 suelto** | `h3\|0\|\|block` | 9 (4/5/—) | home, studio | `text.titulo-l` |
| **Separador de fondo** | `div\|0\|\|block` (bg opaco) | 10 (5/5/—) | home, studio | `color.papel` |
| **Fila con superficie** | `div\|2\|div,div\|flex` | 8 (4/4/—) | home, studio | `color.papel` |
| **Chip de etiqueta (variante)** | `div\|0\|\|block` (4/6, radio 4) | 44 (—/25/19) | studio, case | `color.superficie-tenue`, `radius.sutil`, `spacing.1` |

### 2.3 Los que están en una sola página

| componente | firma | apariciones | dónde |
|---|---|---|---|
| **Tarjeta de proyecto en grilla** | `a\|5\|div,p,p,p,div\|grid` | 61 | studio |
| **Tarjeta de proyecto de caso** | `a\|2\|div,div\|flex` | 15 | case |
| **Medio con radio 8** | `div\|1\|img\|block` (radio 8) | 14 | case |
| **Contenedor con radio 8** | `div\|1\|div\|block` (radio 8) | 8 | case |
| **Avatar circular** | `img\|0\|\|block` (radio 50 %) | 11 | studio |
| **Superficie plana** | `div\|0\|\|block` | 24 | studio |
| **Enlace de tarjeta de nota** | `a\|1\|button\|inline` | 9 | home |
| **Link con etiqueta en flex** | `a\|1\|span\|flex` | 9 | studio |
| **Titular con rollover por bloque** | `h3\|3\|div,div,div\|block` | 7 | home |
| **Marquesina de 41 hijos** | `div\|41\|div×41\|…` | 4 | home |
| **Enlace de tarjeta con tres bloques** | `a\|3\|div,p,p\|flex` | 3 | home |

**home no publica ninguna tarjeta de caso** `[medido]`: cero enlaces a `/work/<slug>/` en los
59 enlaces de su árbol de accesibilidad. La unidad repetida de home son **3 tarjetas de nota**
a `/news/<slug>/`. Las tarjetas de proyecto viven en studio (61, en grilla) y en case (15).

### 2.4 Un ejemplar representativo

Rutas por posición en el árbol, sin nombres de clase (`raw/componentes/*.json` guarda cuatro
por firma):

- CTA de rollover: `body[1]>div[2]>div[4]>div[6]>div[3]>div[1]>div[1]>div[1]>div[6]>div[3]>a[1]>button[1]`
- Link de la navegación flotante: `body[1]>div[2]>div[4]>div[6]>div[1]>nav[1]>ul[1]>li[2]>a[1]`
- Panel de contacto: `body[1]>div[2]>div[5]>form[1]`
- Formulario de newsletter: `…>footer[1]>div[4]>div[1]>…>div[2]>form[1]`

---

## 3. El vocabulario de estados

### 3.1 Lo que existe en el CSS

Recorrido completo del CSSOM, sin transcribir ningún selector: solo se cuentan. `[medido]`

| página | hojas | reglas de estilo | `:hover` | `:active` | `:focus` | `:focus-visible` | `:focus-within` |
|---|---|---|---|---|---|---|---|
| home @1440 | 12 (0 inaccesibles) | 2.628 | **88** | **2** | 0 | **3** | 2 |
| studio @1440 | 12 (0 inaccesibles) | 2.628 | 88 | 2 | 0 | 3 | 2 |
| case @1440 | 11 (0 inaccesibles) | 2.120 | 65 | **3** | 0 | 3 | 2 |

**El sistema de estados de la referencia es hover y casi nada más.** 88 reglas de hover contra
5 de foco en toda la hoja. `[derivado]`

Cuántas de esas reglas aplican a cada objetivo, probando `matches()` sobre el selector con la
pseudoclase removida `[medido]`:

| objetivo | `:hover` sobre sí mismo | `:hover` en un descendiente | `:active` | `:focus-visible` | `:focus-within` |
|---|---|---|---|---|---|
| CTA principal | 0 | **4** | 0 | 0 | 0 |
| Link de navegación | **1** | 0 | 0 | 0 | 0 |
| Tarjeta | 0 | **1** | 0 | 0 | 0 |
| Campo de formulario | 0 | 0 | 0 | 0 | 0 |
| Envoltorio del campo | 0 | 0 | 0 | 0 | 0 |

Idéntico en las tres páginas. **Ninguna regla `:active` aplica a ninguno de los cinco.**

### 3.2 Tabla de estados

Medido en home @1440, con el hover leído contra un hermano del mismo componente en el mismo
instante y el mismo scroll. Todo `[medido]`; las curvas se cruzan contra
`raw/tweens/_catalogo-eases.json`.

| elemento | propiedad | reposo | hover | foco | duración | curva |
|---|---|---|---|---|---|---|
| **CTA principal** (el `button`) | — | — | **sin ningún cambio propio** | **sin ningún cambio** | `0.3s` | `cubic-bezier(0.64, 0.1, 0, 1)` = `ease.salida` |
| CTA · ventana de recorte | `height` | 24,5 px | 28,5 px | igual a reposo | 0.3s | — |
| CTA · copia A del rótulo | `transform` | `none` | `rotate(6°) translate(20, −33.75)` | igual a reposo | **1.3s** | `cubic-bezier(0.64, 0.1, 0, 1)` = `ease.salida` |
| CTA · copia A del rótulo | `opacity` | 1 | 0 | igual a reposo | 1.3s | `ease.salida` |
| CTA · copia B del rótulo | `transform` | `rotate(10°) translate(−30, 24.75)` | `none` | igual a reposo | 1.3s | `ease.salida` |
| CTA · copia B del rótulo | `opacity` | 0 | 1 | igual a reposo | 1.3s | `ease.salida` |
| CTA · copia B del rótulo | `clip-path` | `inset(80% 0 0)` | `inset(0)` | igual a reposo | 1.3s | `ease.salida` |
| CTA · subrayado | `transform` + tamaño | `scale(0)`, 0×0 | `translate(−30,0)`, 120×3 px | igual a reposo | **0.6s**, retardo **0.4s** | `ease.salida` |
| CTA · imagen revelada | tamaño | 0×0 | 150×33,44 px | igual a reposo | — | — |
| **Link de navegación** | `transform` | `none` | `translateX(8px)` | igual a reposo | `0.5s` | `cubic-bezier(0.77, 0, 0.175, 1)` = `ease.principal` |
| Link de navegación | `transition-delay` | `0.04s` | `0s` | `0.04s` | — | — |
| Link de navegación · marcador | `opacity` | 0 | 1 | igual a reposo | 0.5s | `ease.principal` |
| Link de navegación · marcador | `transform` | `scale(0.8) translateX(−16px)` | `none` | igual a reposo | 0.5s | `ease.principal` |
| Link de navegación | `outline-offset` | 0 px | 0 px | **1 px** | — | — |
| **Tarjeta de nota** (home) · medio | `transform` | `none` | **`scale(1.25)`** | igual a reposo | `0.7s` | `ease.principal` |
| Tarjeta de nota (el `<a>`) | — | — | sin cambio | `outline-offset` 0 → **1 px** | — | — |
| **Tarjeta de proyecto** (case) · imagen | `transform` | `none` | **`scale(1.05)`** | igual a reposo | `0.7s` | `ease.principal` |
| **Tarjeta/mosaico de proyecto** (studio) | — | — | **sin cambio medido** | sin cambio | — | — |
| **Campo de formulario** | — | — | **sin ningún cambio** | **sin ningún cambio** | — | — |
| Campo · envoltorio píldora | `border-radius` | 80 px | 80 px | 80 px | — | — |

**Las curvas son el mismo vocabulario que GSAP.** `cubic-bezier(0.77, 0, 0.175, 1)` y
`cubic-bezier(0.64, 0.1, 0, 1)` son exactamente `ease.principal` y `ease.salida` de
`tokens/referencia/tokens.json`, extraídas en B2.1 de los estilos computados. `[derivado]`
No coinciden con ninguna de las 25 curvas nombradas de `raw/tweens/_catalogo-eases.json`
—`power1..4`, `sine`, `expo`, `circ`, `back`, en sus tres variantes—: son cúbicas propias, no
presets de GSAP. El sitio usa dos vocabularios de easing distintos, uno en CSS y otro en GSAP.
`[derivado]`

### 3.3 El rollover de dos copias

El patrón que se sospechaba en la captura inicial —`"Explore PomeloExplore Pomelo"`— está
confirmado y medido `[medido]`. El árbol de accesibilidad devuelve rótulos duplicados sin
espacio entre las copias: un CTA de 20 caracteres reporta 40 caracteres y 5 palabras en vez de
3, porque la última palabra de la primera copia y la primera de la segunda quedan pegadas.

**No es un desplazamiento vertical simple.** Las dos copias viven dentro de un `span` con
`overflow: hidden` que crece de 24,5 a 28,5 px, y el intercambio es una rotación con
traslación más un barrido de `clip-path`:

- copia A sale rotando **+6°** y trasladándose **(+20, −33.75) px**, con la opacidad a 0
- copia B entra desde **+10°** y **(−30, +24.75) px**, con `clip-path` de `inset(80% 0 0)` a
  `inset(0)` y la opacidad a 1
- en paralelo aparece un subrayado de **120×3 px** con **0.6s** y **0.4s de retardo**, y una
  imagen de **150×33,44 px**

Las matrices medidas son idénticas en las tres páginas y en dos corridas de navegador
independientes: `matrix(0.994522, 0.104528, …)` es exactamente sin 6°, y
`matrix(0.984808, 0.173648, …)` exactamente sin 10°. `[medido]`

### 3.4 El foco

**No hay indicador de foco visible en ninguno de los cuatro objetivos.** `[medido]` Con foco
real de teclado —una pulsación de Tab para poner el navegador en modalidad teclado, verificado
con `matches(':focus-visible') === true`— el único cambio de estilo computado es
`outline-offset` de 0 a 1 px en el link y en la tarjeta, y **nada** en el botón y en el input.
En los cuatro, `outline-style` computa `none`: los 3 px de `outline-width` no pintan.

El hover del CTA y el `scale` de la tarjeta **no se disparan con el foco**. Un usuario de
teclado no recibe ninguna señal de dónde está.

Esto es un hallazgo de accesibilidad, no de diseño visual, y va a `A11Y.md`.

### 3.5 El estado `:active`

`[desconocido]`, con la razón: **chrome-devtools-mcp no expone un `mousedown` sostenido**. El
tool `click` hace `mousedown` y `mouseup` sin punto de captura intermedio, y no hay forma de
leer estilos con el botón apretado.

Lo que sí se midió es que **existen 2 reglas `:active` en las 2.628 de home** y que
**ninguna aplica a ninguno de los cinco objetivos**. En case son 3 sobre 2.120, también sin
coincidencia. La conclusión razonable es que el estado activo no forma parte del sistema, pero
está declarada como hueco porque no se observó directamente.

---

## 4. El cursor

### 4.1 Qué es

**Dos `div` de DOM, no canvas** `[medido]`, hermanos directos del contenedor de aplicación:

| capa | tamaño | fondo | radio | z-index | backdrop-filter | transiciones |
|---|---|---|---|---|---|---|
| **núcleo** | 4×4 px | `rgb(0, 255, 194)` = `color.acento-brillante` sobre sección oscura, `rgb(32, 231, 183)` = `color.acento` sobre sección clara | 50 % | **2147483647** | ninguno | `opacity 0.4s ease.salida` |
| **halo** | 36×36 px | `rgba(7, 11, 10, 0.1)` sobre sección oscura, `rgba(236, 236, 236, 0.4)` sobre sección clara | 50 % | **1500000** | **`blur(4px)`** | `width, height, opacity`, las tres `0.4s ease.salida` |

Ambos se posicionan con `transform: translate(−mitad, −mitad)` para centrarse en el puntero.
El halo lleva montados un `<p>` de **9 caracteres y 2 palabras** a 12 px con `color.tinta` y un
`<svg>`, ambos en `scale(0)` y `opacity 0`.

**El color del cursor cambia con la sección, no con la página** `[medido]`: en el pie oscuro de
studio el núcleo vuelve a `rgb(0, 255, 194)` con halo `rgba(7, 11, 10, 0.1)`, los mismos
valores que en el héroe oscuro de home. Es un par de temas, claro y oscuro, no una variante por
URL.

### 4.2 El cursor nativo nunca se oculta

`getComputedStyle(document.body).cursor` = **`auto`**, y **`cursor: none` aparece en 0
elementos** de los 1.192 con rect en home, de los 1.595 de studio, de los 683 de case y de los
800 de home @390. `[medido]` El cursor propio se dibuja **encima** del nativo, no en su lugar.
En home hay 338 elementos con `cursor: pointer`; en case aparecen además **34 con
`cursor: grab`**, que es un carrusel arrastrable.

### 4.3 Tres posiciones medidas

Movimiento real de mouse por CDP, home @1440, con la ventana verificada por encima de 100 fps:

| contexto | elemento bajo el puntero | núcleo | halo | etiqueta |
|---|---|---|---|---|
| Título `h1`, contenido no interactivo | `h1`, `cursor: auto` | 4×4, **opacity 1** | 36×36, **opacity 1** | oculta |
| Link de la navegación flotante | `a`, `cursor: pointer` | 4×4, **opacity 0** | 36×36, **opacity 0** | oculta |
| Botón disparador del reel | `div`, `cursor: auto` | 4×4, **opacity 0** | 36×36, **opacity 0** | oculta |

**La regla medida es: sobre cualquier control interactivo el cursor propio se apaga** —opacidad
0 en las dos capas— y el nativo `pointer` toma el relevo. Sobre contenido no interactivo se
enciende. Se probaron ocho contextos en total —título, CTA, link de navegación, tarjeta de
nota, campo de formulario, enlace `mailto`, iframe del reel y botón del reel— y en los ocho el
halo se mantuvo en 36×36 con la etiqueta y el icono en `scale(0)`.

**El tamaño del halo nunca cambió** `[medido]`, pese a que `width` y `height` están declaradas
como transicionables. Qué contexto agranda el halo y revela la etiqueta quedó `[desconocido]`.
Ver Huecos declarados 2.

**El cursor no está clavado al puntero: interpola hacia él** `[medido]`. Con un único
`mousemove` sintético de CDP y un salto largo —de (318, 2) a (538, 844)— el núcleo avanzaba
~10 px cada 300 ms con la razón decreciendo, y a los **3,1 s todavía no había convergido**; el
halo iba sistemáticamente por detrás del núcleo. En saltos cortos llega en menos de 600 ms.

### 4.4 A 390

**No existe.** `[medido]` A 390 no hay ningún elemento fijo, circular y con
`pointer-events: none` en el árbol: el barrido devuelve **0 candidatos** y **0 elementos
circulares montados**. Los dos `div` del cursor sencillamente **no se montan**, y eso corre los
índices de todo el árbol dos posiciones —lo que a 1440 es `body>div[2]>div[4]` a 390 es
`body>div[2]>div[2]`—.

No es peso muerto: es una decisión de montaje condicional. `[derivado]`

---

## 5. El header

### 5.1 No hay `<header>`

**Ninguna de las tres páginas tiene un elemento `<header>`.** `[medido]` `querySelectorAll('header')`
devuelve 0 en las cuatro capturas. Lo que cumple esa función son seis regiones fijas o
pegajosas, identificadas por regla geométrica —no por nombre de clase—:

| región | qué es a 1440 | z-index |
|---|---|---|
| **rail izquierdo** | 140×900 fijo en el borde izquierdo, 1 focalizable | 1000000 |
| **barra superior** | 1300×100 fija, 6 focalizables, `pointer-events: none` | 1000 |
| **pastilla de navegación flotante** | `<nav>` de 473×56 con `backdrop-filter: blur(12px)`, 6 focalizables, dentro de un envoltorio `sticky` | 10000000 |
| **velo del menú** | 1440×900 fijo, `opacity 0`, `blur(24px)` | 2147483647 |
| **panel del menú de superposición** | **0×0**, fondo `color.papel`, 13 focalizables | 100000 |
| **panel de contacto** | `form` fijo de 820×767, fondo `color.papel`, 9 focalizables | 2147483647 |

El ancho del rail es **140 px exactos**, que corrobora el token `layout.columna-lateral-desktop`
de B2.1 y `layout-medido.columna-lateral` de B2.2. `[derivado]`

### 5.2 Qué cambia con el scroll

Medido en 0, 100, 500, 2000 y 8000 px, capturando de cada región la huella de clases, el
`transform`, la `opacity`, la `position`, el alto, el `background-color` y el
`backdrop-filter`. `[medido]`

**El rail izquierdo, la barra superior, el velo y el panel del menú son idénticos en los cinco
puntos, en las tres páginas.** Misma huella de clases, mismo transform, misma opacidad, mismo
alto, mismo fondo, mismo desenfoque. No hay barra que se encoja, ni que cambie de fondo, ni que
gane sombra al bajar.

**Lo único que se mueve es la pastilla de navegación flotante**, y no por una clase sino por su
posición: es `absolute` dentro de un envoltorio `sticky`.

| página | comportamiento | umbral |
|---|---|---|
| **home @1440** | nace en `top: 816` y viaja con el documento hasta fijarse en `top: 24` | **792 px** |
| **studio @1440** | idéntico | **792 px** |
| **case @1440** | **nace ya fijada en `top: 24` con `scrollY 0`** | **no hay umbral** |

En home el umbral está confirmado por búsqueda binaria con el predicado `top ≤ 24,5 px`: a
**791 px** el `top` es 25 y a **792 px** es 24. La relación es exacta: `top = 816 − scrollY`
hasta que topa, y `816 − 792 = 24`. `[derivado]`

### 5.3 A 390

| región | a 1440 | a 390 |
|---|---|---|
| rail izquierdo | 140×900, 1 focalizable | **0×0** |
| barra superior de escritorio | 1300×100, 6 focalizables | **0×0** |
| pastilla de navegación flotante | 473×56, 6 focalizables | **`display: none`** |
| barra superior móvil | **0×0** | **390×100**, 1 focalizable, `pointer-events: auto` |
| panel del menú de superposición | **0×0** | **390×844**, 13 focalizables, `translateX(195px)` |
| panel de contacto | 820×767, radio 12 px arriba a la izquierda, padding lateral 72 px | **390×844 a sangre**, radio 0, padding lateral 21,33 px |
| velo del menú | 1440×900, `opacity 0`, `blur(24px)` | 390×844, `opacity 0`, `blur(24px)` |

**Hay un umbral a 390, pero no tiene efecto visible.** `[medido]` A **761 px** el `<nav>` pasa
de 1 clase a 2 —detectado por hash de la lista de clases, sin guardar ningún nombre—, y
**ninguna otra propiedad capturada cambia**: transform, opacity, position, alto, ancho, top,
fondo, desenfoque y `pointer-events` quedan idénticos. Como a 390 el `<nav>` computa
`display: none`, el cambio de clase no pinta nada. A 1440, en cambio, la huella de clases de la
pastilla **no cambia en ninguno de los cinco puntos**: allí el movimiento es puramente
geométrico. `[medido]`

---

## 6. Qué existe solo arriba o solo abajo de 1025

`[medido]` sobre home, comparando por firma estructural.

**Solo arriba de 1025** (n ≥ 3 a 1440, ausentes a 390):

| firma | n a 1440 | qué es |
|---|---|---|
| `div\|0\|\|inline-block` | 96 | los bloques por carácter del titular animado |
| `div\|1\|span\|block` | 17 | envoltorio de rótulo |
| `a\|2\|svg,span\|flex` | 15 | **link del pie con icono** |
| `span\|1\|div\|flex` | 15 | envoltorio de link del pie |
| `li\|1\|a\|flex` | 14 | ítem de la lista de navegación del pie |
| `p\|1\|div\|block` | 8 | párrafo con bloque de rollover |
| `h3\|3\|div,div,div\|block` | 7 | titular con rollover por bloque |
| `li\|2\|svg,a\|flex` | 5 | **ítem de la pastilla de navegación flotante** |
| `div\|2\|p,ul\|flex` | 4 | columna de enlaces del pie |
| `a\|1\|span\|inline` | 4 | link de texto del pie |

**Solo abajo de 1025** (n ≥ 3 a 390, ausentes a 1440):

| firma | n a 390 | qué es |
|---|---|---|
| `div\|2\|img,div\|block` | 8 | tarjeta con imagen apilada |
| `a\|1\|svg\|block` | 5 | enlace de icono en bloque |

**Los tres canvas 2d no se dibujan a 390** `[medido]`. A 1440 miden 200×40, 200×40 y 70×28 y
rasterizan texto sobre controles enfocables —el par de 200×40 es un rollover de dos copias, uno
con opacidad 1 y el otro con opacidad 0—. A 390 los tres siguen montados pero con rect **0×0** y
el atributo por defecto **300×150**, es decir nunca fueron dimensionados ni dibujados. El único
canvas vivo a 390 es el de WebGL, a 390×844. Eso es peso muerto de mobile, al revés que el
cursor, que directamente no se monta. `[derivado]`

**Los componentes que sobreviven cambian de escala, no de estructura.** Comparación por firma
completa, no estructural, para que cada fila sea un solo componente `[medido]`:

| componente | n @1440 | n @390 | qué cambia |
|---|---|---|---|
| CTA de rollover | 12 | **12** | nada: mismo padding 8, mismo `text.base` |
| Pastilla de opción de formulario | 8 | **8** | nada: mismo padding 0/16, mismo radio 100 px |
| Campo de texto del panel | 4 | **4** | nada: mismo radio 80 px |
| Formulario de newsletter | 1 | **1** | nada: mismo padding 7/7/7/14, mismo radio 80 px |
| Chip de etiqueta | 4 | **4** | nada: mismo padding 4/6, mismo radio 4 px |
| Botón social del pie | 7 | **7** | solo el contexto tipográfico heredado; no pinta texto |
| Tarjeta de superficie con desenfoque | 7 | **7** | padding **28/32 → 16/16**; radio 10 px se mantiene |
| Etiqueta de sección | 15 | **17** | `font-size` **10 → 8,03 px**; sangría 31 px se mantiene |
| Título de cierre del pie | 1 | **1** | `font-size` **56 → 36,28 px**; razón de interlineado 1,2 se mantiene |
| Ventana de recorte del rollover | 16 | **14** | `font-size` 15 → 11,06; gana `padding-bottom` 6 px |
| Panel de contacto | 1 | **1** | padding lateral **72 → 21,33 px**; radio **12 px → 0**; de ventana de 820 px a hoja a sangre de 390×844 |
| Link del pie con icono | 15 | **0** | **desaparece** |
| Link de la navegación flotante | 5 | **0** | **desaparece**: el `<nav>` computa `display: none`. Su equivalente móvil vive en el panel de menú y **no es el mismo componente**: peso 400 en vez de 600 y razón de interlineado 1,5 en vez de 2,4 |

De trece componentes verificados uno por uno, **seis no cambian ningún valor**, cinco solo
mueven valores fluidos o el padding, y **dos desaparecen**. Ninguno cambia de estructura.

---

## Conclusiones

1. **El sitio tiene 27 componentes reales compartidos por las tres páginas, más 6 en dos
   páginas y 11 de una sola: 44 en total.** `[derivado]` No 181, que es lo que devuelve el
   umbral de repetición solo. La diferencia entre 181 y 44 es exactamente lo que separa
   extraer de transcribir: 137 firmas son andamiaje de layout sin identidad visual ni
   interactiva.

2. **El vocabulario de estados es consistente y es pobre.** `[derivado]` Consistente:
   `ease.principal` y `ease.salida` cubren todo lo medido, `0.3s / 0.5s / 0.7s` son las tres
   duraciones que aparecen, el rollover del CTA da matrices idénticas al decimal en tres
   páginas y en dos corridas independientes, y el hover de la navegación es el mismo en las
   tres. Pobre: **hover es prácticamente el único estado**. 88 reglas de hover contra 5 de foco
   en toda la hoja, y ninguna regla `:active` aplicable a ninguno de los cinco objetivos
   medidos.

3. **El foco no existe como estado visual.** `[medido]` Con foco real de teclado, el único
   cambio computado es `outline-offset` de 0 a 1 px, con `outline-style: none`. El `scale(1.25)`
   de la tarjeta y el rollover del CTA no se disparan con Tab. Es la conclusión con más
   consecuencia práctica del bloque, y es de accesibilidad.

4. **Los componentes consumen el sistema de B2.1 casi sin residuo.** `[derivado]` De los 27
   compartidos, 25 mapean íntegramente a `tokens/referencia/tokens.json`. Los dos huérfanos son
   un tamaño de 17 px y un radio de 16 px. Eso valida el sistema de tokens desde arriba: no se
   extrajo una paleta que después nadie usa.

5. **El cursor propio es dos `div` de DOM y se apaga sobre todo lo interactivo.** `[medido]` No
   oculta el cursor nativo en ningún elemento del sitio —`cursor: none` en 0 de 4.270 elementos
   medidos entre las cuatro capturas—, así que sobre contenido conviven los dos y sobre
   controles queda solo el nativo. Tiene una etiqueta de 9 caracteres montada que no se logró
   revelar.

6. **El header no es un header: es un rail más una barra más una pastilla flotante, y no
   reacciona al scroll.** `[medido]` Cuatro de las cinco regiones son idénticas byte a byte en
   0, 100, 500, 2000 y 8000 px. Lo único con umbral es la pastilla, y su umbral es geometría
   pura de `sticky`, no un cambio de estado: **792 px en home y studio, ninguno en case**.

7. **La frontera de 1025 px reparte la navegación, no la escala.** `[derivado]` Arriba conviven
   el rail de 140 px, la barra de 1300×100 y la pastilla flotante, con el panel de menú
   colapsado a 0×0. Abajo los tres se apagan y toman el relevo una barra de 390×100 con un solo
   control y el panel de menú a pantalla completa con 13. Los componentes de contenido no
   cambian de estructura: cambian de valores fluidos.

8. **Qué haría falta construir**, en orden de costo `[derivado]`: (a) un componente de rollover
   de dos copias con rotación, traslación y `clip-path`, que es el más caro y el más presente
   —17 ejemplares solo en home—; (b) un cursor de dos capas con interpolación y tema por
   sección, montado solo arriba de 1025; (c) una pastilla de navegación `sticky` con un
   marcador que entra desde −16 px; (d) tres familias de tarjeta —nota, proyecto en grilla,
   proyecto de caso— que comparten propiedad, duración y curva de hover y solo difieren en la
   magnitud del `scale`: 1,25 / sin efecto / 1,05; (e) un panel de contacto fijo que a 390 va a
   sangre. **Y un sistema de foco entero, porque la referencia no tiene ninguno que copiar.**

9. **Decisión abierta para Franco:** si la reconstrucción replica la pobreza de estados de la
   referencia o si la corrige. Copiar el hover es barato y está medido; copiar la ausencia de
   foco es heredar un defecto de accesibilidad. Esa decisión no está tomada y no la toma este
   documento.

---

## Huecos declarados

1. **`:active` no se pudo observar.** chrome-devtools-mcp no expone `mousedown` sostenido y el
   tool `click` no deja punto de captura entre presionar y soltar. Se reporta en su lugar el
   conteo de reglas —2 en home y studio, 3 en case— y la comprobación de que ninguna aplica a
   los cinco objetivos. Para cerrarlo hace falta un instrumento que mantenga el botón apretado.

2. **El estado agrandado del halo del cursor no se reprodujo.** El halo tiene `width` y
   `height` declaradas como transicionables y lleva montados una etiqueta de 9 caracteres y un
   icono en `scale(0)`. En los ocho contextos probados nunca creció ni los reveló. La hipótesis
   —no verificada— es que depende de la dinámica del movimiento y que un único `mousemove`
   sintético de CDP no la dispara, lo mismo que explica la interpolación sin converger de 4.3.
   Los 34 elementos con `cursor: grab` de case son el candidato más probable y no se probaron.

3. **Nadie miró ningún componente con los ojos.** Todo este documento es medición de estilos
   computados y de geometría. Que un `scale(1.25)` esté medido no dice si se ve bien. Eso es B5.

4. **`prefers-reduced-motion` no se midió sobre los estados.** B4.2a lo midió sobre el scroll.
   Qué pasa con el rollover del CTA, con el `scale` de la tarjeta y con el cursor bajo la
   preferencia activa es `[desconocido]`. Va a `A11Y.md`.

5. **El menú de superposición no se abrió.** Se midió colapsado —0×0 a 1440, 390×844 con
   `translateX(195px)` a 390, 13 focalizables en ambos— pero no se disparó su apertura. Abrirlo
   exige un clic sobre el control que lo despliega, y este bloque midió hover y foco, no clics.
   Los componentes que viven dentro del menú abierto no están inventariados.

6. **Solo se midieron tres URLs.** `work`, `news`, `services` y las 125 páginas restantes del
   sitemap quedaron fuera. Que las tres medidas compartan 27 firmas hace razonable esperar que
   el vocabulario se sostenga, pero **no se verificó**.

7. **El umbral de 3 apariciones es una convención, no un hallazgo.** Se declaró antes de mirar
   los datos y dejó afuera 130 firmas, de las cuales 14 aparecen exactamente 2 veces. Si alguna
   de esas 14 es un componente real que el sitio todavía no repite, este inventario la pierde.
   La lista está en los volcados, con su conteo, para revisarla.

8. **`tokens/components.json` no se emitió.** `CLAUDE.md` §3 lo lista como artefacto del bloque
   que produce `COMPONENTS.md`. El prompt de esta corrida enumeró sus salidas y ese archivo no
   estaba, y el control de cierre pide que `git status` muestre "solo lo declarado". Se dejó sin
   emitir a propósito y se declara acá: es la primera tarea del bloque que continúe este.

9. **La firma estructural no discrimina en elementos hoja.** `div|0||block` reúne 88 elementos
   en home @1440 que no son un componente. Para esos casos la comparación 1440↔390 por firma
   estructural no significa nada y se marcó donde aplica, pero la tabla de la sección 6 hereda
   esa limitación en las filas de hoja.

10. **La medición de mobile es emulada.** Viewport 390×844×3 con `mobile` y `touch` emulados por
    CDP, sobre el mismo hardware de escritorio. `CLAUDE.md` §4 lo permite etiquetado, y así
    queda: `[medido]`, emulado. Un dispositivo real puede montar otra cosa.

---

### Constancia de B3.3 — 2026-08-25

**Los huecos 7 y 8 quedan cerrados por B3.3.** Se agrega debajo sin borrar nada de lo anterior,
según `CLAUDE.md` §7.

- **Hueco 8, `tokens/components.json`: emitido.** El artefacto existe en
  `tokens/referencia/components.json`, con los 44 componentes de este documento —27 en las tres
  URLs, 6 en dos y 11 en una—, sus apariciones por URL, los tokens que consume cada uno
  referenciados por nombre de `tokens/referencia/tokens.json`, sus estados y qué cambia a 390.
  Los 40 nombres de token distintos que referencia se validaron uno por uno contra `tokens.json`.
  Nada `[supuesto]` entró: los componentes cuyos estados B3.2 no instrumentó llevan
  `estados.medido: false` y los que no están entre los trece verificados a 390 llevan
  `a390.medido: false`, en vez de un valor inventado.

- **Hueco 7, las 14 firmas bajo umbral: listadas.** Van en el bloque `bajoUmbral` del mismo
  artefacto, con su conteo por URL, sus rangos de tamaño y una advertencia de que no pasaron el
  segundo filtro de identidad. **La decisión de incorporarlas o no queda pendiente de Franco**;
  el artefacto no la toma.

- **El umbral de 130 firmas fuera de corte se reprodujo exacto** desde
  `raw/componentes/*-1440.json`: 311 firmas completas distintas, 181 pasan el umbral de
  repetición, 130 no, y de esas 130 hay **116 con un máximo de 1 aparición y 14 con un máximo de
  2**, que es la partición que declara la sección 1.

- **El corte de 1025 px que la sección 6 usa como frontera quedó confirmado en runtime.** B3.3
  midió la compuerta de la coreografía en 1024 contra 1025 y encontró el salto exactamente ahí.
  Ver `docs/SCROLL.md` §10.

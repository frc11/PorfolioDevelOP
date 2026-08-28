# LAYOUT — sistema dependiente del viewport del sitio de referencia

**Fuente.** 24 volcados de `raw/fluid/` (6 URLs × 4 anchos: 768, 1024, 1025,
1920), con ruta e identidad por elemento, capturados en B1.3. Más 12 volcados
de `raw/layout/` y 12 de `raw/computed/` (6 URLs × 2 viewports: 390 y 1440),
capturados en B1.1. Total: 36 volcados leídos, ninguno modificado.

**URLs.** `/`, `/studio/`, `/services/`, `/work/`, `/work/pomelo/`, `/news/` de
`www.nk.studio`.

**Fecha de este análisis.** 2026-08-21. Fecha de las capturas: 2026-08-20.

**Herramientas.** Lectura y análisis en disco con Python 3.13 (`json`,
`collections.Counter`, ajuste por mínimos cuadrados escrito a mano). Sin
navegación, sin MCP, sin red. Los artefactos se verificaron con `tsc 5.6
--strict` y `json.load`.

**Estado: BORRADOR.** Sujeto a la verificación humana declarada al final.

**Etiquetas de evidencia.** `[medido]` sale directo de un volcado.
`[derivado]` es aritmética sobre valores medidos, con el procedimiento a la
vista. `[desconocido]` es un hueco reconocido. Ningún valor sin etiqueta entra
a un artefacto.

---

## 1. Fase 1 — La identidad del árbol

### Veredicto: **un solo árbol con contenido adicional montado desde 1025px.** La lectura preliminar de B1.3 queda **corregida**.

B1.3 midió que el apareo por ruta posicional se desploma entre 1024 y 1025 (0%
a 67% según la URL) y leyó de ahí que hay "dos variantes de DOM". Esa lectura
**no se sostiene**. El apareo por huella de contenido recupera el 93,0% en el
mismo par de anchos. La ruta `tag[índice]` usa índice entre hermanos: insertar
un solo elemento cerca de la raíz corre todos los índices aguas abajo y rompe
el apareo aunque el árbol sea casi el mismo. Eso es exactamente lo que pasa.

Pero la explicación barata tampoco alcanza sola: hay **882 elementos con texto
que existen a 1025 y no a 1024**, contra sólo 153 en el sentido inverso. El
árbol no es idéntico con los índices corridos: es el mismo núcleo **más**
contenido que se monta arriba del breakpoint.

### 1.1 Tabla A — apareo por par de anchos y nivel de huella [medido]

Apareo por multiconjunto: para cada huella, `Σ min(conteo_A, conteo_B)`. Se
reportan dos denominadores porque distinguen las dos hipótesis. `/max` divide
por el conjunto mayor: castiga la diferencia de tamaño. `/min` divide por el
menor: mide qué fracción del conjunto chico encuentra pareja. Un subconjunto
propio da `/min` alto y `/max` bajo; dos árboles distintos dan los dos bajos.

| par de anchos | ruta `/max` | ruta `/min` | F1 tag+padre+chars+palabras `/max` | F1 `/min` | F3 tag+chars `/max` | F3 `/min` |
|---|---|---|---|---|---|---|
| 768 ↔ 1024 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% |
| **1024 ↔ 1025** | **34,0%** | 45,3% | **69,6%** | **93,0%** | 71,2% | 95,1% |
| 1025 ↔ 1920 | 99,6% | 99,7% | 97,5% | 97,6% | 97,8% | 97,9% |

Nivel intermedio F2 (tag+chars+palabras) en 1024↔1025: 71,0% `/max`, 94,8%
`/min`. Se omite de la tabla por caer entre F1 y F3 sin aportar corte.

Por URL, en el par que decide (1024↔1025):

| slug | n@1024 | n@1025 | ruta `/max` | F1 `/min` | solo en 1025 | solo en 1024 |
|---|---|---|---|---|---|---|
| home | 221 | 387 | 11,6% | 83,3% | 203 | 37 |
| case | 166 | 184 | 37,5% | 88,0% | 38 | 20 |
| work | 519 | 673 | 51,6% | 96,3% | 173 | 19 |
| services | 489 | 589 | 49,6% | 94,7% | 126 | 26 |
| studio | 509 | 776 | 29,9% | 92,7% | 304 | 37 |
| **news** | 268 | 292 | **0,0%** | **94,8%** | 38 | 14 |

`news` es el caso que cierra la discusión. Por ruta apareaba **0,0%** —el
número que más empujaba la lectura de "dos páginas distintas"— y por huella
aparea **94,8%**. Una página literalmente distinta no hace eso.

### 1.2 El control que hace falta para que la huella valga algo [medido]

Un apareo alto no prueba nada si la huella es tan gruesa que aparea cualquier
cosa. Control nulo: aparear `A@1024` contra `B@1025` con **otra página** como
B. Si el cruzado sube tanto como el propio, la huella no discrimina.

| A @1024 | propio | media de las 5 ajenas | brecha |
|---|---|---|---|
| home | 83,3% | 42,9% | +40,4 |
| case | 88,0% | 61,1% | +26,9 |
| work | 96,3% | 28,8% | +67,5 |
| services | 94,7% | 28,5% | +66,2 |
| studio | 92,7% | 25,8% | +67,0 |
| news | 94,8% | 23,3% | +71,5 |

La brecha va de +26,9 a +71,5 puntos. La huella discrimina. Como refuerzo, la
huella F1 identifica un elemento único en el 24,7% (work) al 48,9% (home) de
los casos: no es una clave degenerada.

`case` es el control más débil (+26,9): aparea 83,1% contra `work@1025`. Las
dos son páginas de proyecto y comparten componentes, así que la contaminación
tiene explicación estructural — pero queda anotada como el punto flojo de esta
demostración.

### 1.3 Qué son los 882 elementos que sólo existen desde 1025 [medido]

Por tag: `DIV` domina (173 en home, 220 en studio, 99 en work), seguido de `P`,
`SPAN` y `A`. El dato que interpreta el resto:

**Exactamente 5 elementos `<A>` extra aparecen en las seis páginas**, con la
misma ruta terminal en las seis: `…>div[3]>div[5]>div[0]>nav[0]>ul[0]>li[N]>a[1]`,
`fontSize: 15px`, cajas de 37 a 61px de ancho. A 1024 los únicos `<A>` de
navegación viven en `…>div[0]>div[1]>a[N]` con `fontSize: 48.1878px` y caja de
896px, o sea el ancho completo.

Lectura: a ≤1024 existe el menú de superposición a pantalla completa; a ≥1025
se monta **además** la barra de navegación de escritorio. Los dos coexisten en
el DOM arriba del breakpoint. Es el patrón habitual, y explica 5 de los
elementos extra en cada página. [derivado]

Los `DIV` extra se concentran a profundidad de ruta 10-11 y traen `fontSize`
fraccionarios (`26.5446px`, `36.2066px`, `9.22066px`): son bloques de contenido
que se montan arriba del breakpoint, no reordenamiento de los existentes.

### 1.4 Contraste con `raw/computed`: el DOM crece poco, salvo en home [medido]

Totales de elementos, 390 contra 1440:

| slug | 390 | 1440 | D/M |
|---|---|---|---|
| home | 2.597 | 4.688 | **1,81** |
| case | 1.166 | 1.221 | 1,05 |
| work | 2.470 | 2.564 | 1,04 |
| services | 4.129 | 4.288 | 1,04 |
| studio | 2.689 | 2.934 | 1,09 |
| news | 1.282 | 1.399 | 1,09 |

Cinco de las seis crecen entre 4% y 9%. Sólo `home` crece 81%. El conteo de
elementos **con texto** de `raw/fluid` crece más (de +9% en news a +75% en
home) porque mide otra población: sólo los que pintan texto.

Las dos mediciones son consistentes con el mismo veredicto: **el DOM se
reorganiza y se le agrega contenido; no se reemplaza.** Si fueran dos árboles
distintos, cinco de seis páginas no coincidirían al 4-9% en conteo total.

### 1.5 Qué queda del hallazgo de B1.3

| Afirmación de B1.3 | Estado |
|---|---|
| El apareo por ruta cae entre 1024 y 1025 (0% a 67%) | **Confirmado** — reproducido: 0,0% a 51,6% |
| 768↔1024 y 1025↔1920 aparean por encima del 98% | **Confirmado** — 100,0% y 99,6% por ruta |
| El breakpoint real cae en 1025px, no en un rango | **Confirmado** — y reforzado por §3.4 |
| "Hay dos variantes de DOM, no una sola estructura" | **Corregido** — un árbol con contenido adicional |

La consecuencia práctica: **el apareo por huella es la base válida para la Fase
2**, en los cuatro anchos y en las seis URLs.

---

## 2. Fase 2 — Tipografía fluida

### Veredicto: **FLUIDA y derivable.** Las seis expresiones están resueltas de forma exacta.

B2.1 cerró este punto con "no derivables" por dos razones (`DESIGN.md` §3.2):
sistema indeterminado (4 parámetros contra 2 mediciones) y apareo
desktop↔mobile no medido. **Las dos quedaron levantadas**: B1.3 aportó cuatro
anchos en vez de dos, y la Fase 1 aportó la identidad por elemento.

### 2.1 Método [derivado]

Se encadenó cada elemento a través de los cuatro anchos por huella F1,
preservando el orden de documento cuando una huella se repite. Resultado:
**2.019 cadenas completas** en los cuatro anchos, más 597 que sólo existen
desde 1025. Se agrupó por su tupla de `fontSize` y se ajustó una recta por
mínimos cuadrados sobre (768, 1024, 1025), contrastando contra el valor
observado a 1920.

**Precisión del método [medido, B2.3].** "Cadenas parciales" admite dos
definiciones y el texto original no distinguía cuál:
- **Por huella entera** — la huella no aparece ni una vez antes de 1025: **597**.
- **Por slot** — la ocurrencia i-ésima de esa huella no existe antes de 1025: **809**.
Las dos son exactas bajo su definición y miden cosas distintas. §1.3 cuenta **por
slot**: 809 + 73 = 882 elementos que existen a 1025 y no a 1024, y 153 en el
sentido inverso, reproduciendo ambos números de forma independiente.
Las 2.019 cadenas completas coinciden exacto bajo cualquiera de las dos lecturas.
El método estaba descrito con precisión suficiente para el número que sostiene la
tipografía fluida, y no para el de las parciales.

### 2.2 Los dos extremos de la banda salen de la medición, no de una elección

**Techo.** Cada nivel fluido cruza su valor de 1920px en:

| nivel | ancho donde toca el techo | residuo máx. del ajuste |
|---|---|---|
| micro | 1440,00 | 0,000001px |
| caption | 1440,00 | 0,000020px |
| titulo-s | 1440,01 | 0,000028px |
| titulo-m | 1440,00 | 0,000023px |
| titulo-l | 1440,00 | 0,000010px |
| titulo-xl | 1440,00 | 0,000010px |

Seis niveles independientes convergen en **1440px**. [derivado]

**Piso.** Barrido de 300 a 460px buscando el ancho donde los seis niveles dan
simultáneamente un entero:

| puesto | ancho | desviación máx. al entero |
|---|---|---|
| 1.º | **375px** | **0,000090px** |
| 2.º | 374px | 0,018759px |
| 3.º | 376px | 0,018800px |

375px es **207 veces** más nítido que el siguiente candidato. [derivado]

**Validación independiente.** Evaluadas a 390px, las seis expresiones
reproducen los seis valores que B1.1 midió por separado, con error máximo
**0,00013px**. Ese contraste no entró en el ajuste: es una prueba fuera de
muestra.

### 2.3 Tabla B — tipografía [medido] + [derivado]

Los valores a 390 y 1440 salen de `raw/computed` (B1.1); los de 768, 1024, 1025
y 1920 de `raw/fluid` (B1.3). El error es el máximo entre el `clamp()` **ya
redondeado como se emite** y los cinco puntos medidos del nivel.

| nivel | 390 | 768 | 1024 | 1025 | 1440 | 1920 | clasificación | err. máx. |
|---|---|---|---|---|---|---|---|---|
| `--text-fluido-micro` | 8,0282 | 8,7380 | 9,2188 | 9,2207 | 10 | 10 | **FLUIDO** | 0,00029px |
| `--text-fluido-caption` | 11,0141 | 11,3690 | 11,6094 | 11,6103 | 12 | 12 | **FLUIDO** | 0,00018px |
| `--text-fluido-titulo-s` | 16,0563 | 17,4761 | 18,4376 | 18,4413 | 20 | 20 | **FLUIDO** | 0,00060px |
| `--text-fluido-titulo-m` | 18,1972 | 23,1662 | 26,5315 | 26,5446 | 32 | 32 | **FLUIDO** | 0,00045px |
| `--text-fluido-titulo-l` | 24,2817 | 31,3803 | 36,1878 | 36,2066 | 44 | 44 | **FLUIDO** | 0,00051px |
| `--text-fluido-titulo-xl` | 36,2817 | 43,3803 | 48,1878 | 48,2066 | 56 | 56 | **FLUIDO** | 0,00051px |
| fijo 14px (164 cadenas) | — | 14 | 14 | 14 | 14 | 14 | INVARIANTE | 0 |
| fijo 32px (92 cadenas) | — | 32 | 32 | 32 | 32 | 32 | INVARIANTE | 0 |
| fijo 10px (62 cadenas) | — | 10 | 10 | 10 | 10 | 10 | INVARIANTE | 0 |
| fijo 11px (45 cadenas) | — | 11 | 11 | 11 | 11 | 11 | INVARIANTE | 0 |
| fijo 15px (42 cadenas) | — | 15 | 15 | 15 | 15 | 15 | INVARIANTE | 0 |
| fijo 18px (26 cadenas) | — | 18 | 18 | 18 | 18 | 18 | INVARIANTE | 0 |
| fijo 12,8px (6 cadenas) | — | 12,8 | 12,8 | 12,8 | 12,8 | 12,8 | INVARIANTE | 0 |
| fijo 8px (2 cadenas) | — | 8 | 8 | 8 | 8 | 8 | INVARIANTE | 0 |
| 14px → 20px (115 cadenas) | — | 14 | 14 | 18,4413 | 20 | 20 | FIJO→FLUIDO | — |
| 18px → 16px (78 cadenas) | — | 18 | 18 | 16 | 16 | 16 | ESCALONADO | — |
| 11px → 15px (57 cadenas) | — | 11 | 11 | 15 | 15 | 15 | ESCALONADO | — |
| 32px → 18px (36 cadenas) | — | 32 | 32 | 18 | 18 | 18 | ESCALONADO | — |
| 14px → 11px (24 cadenas) | — | 14 | 14 | 11 | 11 | 11 | ESCALONADO | — |

El error máximo de los seis `clamp()` emitidos, sobre los 30 puntos medidos
(6 niveles × 5 anchos), es **0,0006px**: el criterio de aceptación del sprint
(1px) se cumple con **1.667×** de margen.

Las columnas 390 y 1440 de los niveles fijos van vacías a propósito: esas
cadenas se midieron sobre `raw/fluid`, que no cubre 390 ni 1440. Su carácter
invariante está medido entre 768 y 1920, no fuera de ese rango.

### 2.4 Reparto de las 2.019 cadenas [medido]

| clase | cadenas | % |
|---|---|---|
| FLUIDO | 1.088 | 53,9% |
| INVARIANTE | 440 | 21,8% |
| ESCALONADO | 203 | 10,1% |
| FIJO→FLUIDO | 168 | 8,3% |
| INDETERMINADO | 120 | 5,9% |

Los tres regímenes conviven. Emitir sólo `clamp()` sería tan falso como emitir
sólo valores fijos: **el 21,8% del texto no escala en absoluto**, y otro 10,1%
conmuta en el breakpoint sin interpolar. Por eso los `--text-*` fijos de B2.1
se conservan y los `--text-fluido-*` se agregan al lado.

Las 120 cadenas INDETERMINADO incluyen un caso con estructura visible que **no
se emite** porque su corte no se puede ubicar: 30 cadenas van `18px` a 768 y
luego `13.4376 → 13.4413 → 15px`. La pendiente de ese tramo es exactamente la
de un `clamp(11px … 15px)` de la misma familia, pero eso implica un corte entre
769 y 1024 que los cuatro anchos medidos no pueden localizar. [desconocido]

### 2.5 La hipótesis de B2.1 sobre dónde vive el régimen fluido queda **refutada**

`DESIGN.md` §3.1 (Prueba 4) propuso que a 1440 no hay decimales porque las
expresiones ya están topadas arriba del breakpoint de 1025px, sugiriendo que la
banda fluida vive por debajo. La instrucción de este sprint pedía testearlo, no
asumirlo. Resultado [medido]:

| ancho | elementos con `fontSize` fraccionario |
|---|---|
| 768 | 1.245 de 2.173 — 57,3% |
| 1024 | 1.309 de 2.172 — 60,3% |
| **1025** | **1.927 de 2.901 — 66,4%** |
| 1920 | 6 de 2.897 — 0,2% |

A 1025 —**arriba** del breakpoint— hay más fracción que a 1024, no menos. La
banda fluida no se corta en 1025: se corta en 1440. Los 6 fraccionarios que
quedan a 1920 son todos `12.8px`, que es un valor fijo (0,8 × 16px) presente en
los cuatro anchos.

La confirmación fina: entre 1024 y 1025, `micro` pasa de 9,21878 a 9,22066, una
diferencia de **0,00188px**, que es exactamente lo que la pendiente
(0,0018779 px por px de viewport) predice para 1px de viewport. La escala
tipográfica **no se entera** del breakpoint. [derivado]

Lo que sí acertó B2.1 es la consecuencia: a 1440 no hay decimales. La razón
medida es más precisa que la propuesta —1440 no está "arriba del techo", **es**
el techo, exactamente.

---

## 3. Fase 3 — Sistema de layout

### 3.1 Contenedores [medido]

`max-width` dominante, unión de las seis páginas:

| ancho | dominante | % | segundo | tercero |
|---|---|---|---|---|
| 768 | `100%` (478) | 66,2% | `150px` (50) | `768px` (45) |
| 1024 | `100%` (478) | 66,2% | `150px` (50) | `1024px` (45) |
| 1025 | `100%` (476) | 66,2% | `150px` (50) | `1025px` (39) |
| 1920 | `100%` (476) | 66,2% | `1920px` (60) | `150px` (50) |

**La referencia no tiene contenedor fijo en px.** `100%` domina con 66,2% en
los cuatro anchos y en las seis páginas. El tercer valor de cada fila iguala al
viewport: es `100vw` computado, no un contenedor.

Los `max-width` en px que se repiten idénticos en los cuatro anchos son
componentes, no envoltorios: `150px` (50), `140px` (22-24), `648px` (8),
`600px` (7), `632px` (6), `900px` (5). El único tope global es **`1920px`**:
21 contenedores a 768, 1024 y 1025, y 60 a 1920.

`140px` corrobora la custom property `--sidebar: 140px` que la referencia
declara y que B2.1 ya emitió.

### 3.2 Padding lateral [medido] + [derivado]

`paddingLeft` no es el mecanismo: el 92,5% de los elementos a 390 y el 92,8% a
1440 tienen `paddingLeft: 0px`. La contención se mide por diferencia de caja.

Hasta 1024px hay una escalera limpia y **fija**:

| ancho | caja | n | margen total | por lado |
|---|---|---|---|---|
| 768 | 704px | 174 | 64px | **32px** |
| 1024 | 960px | 100 | 64px | **32px** |
| 768 | 656px | 75 | 112px | 56px |
| 1024 | 912px | 75 | 112px | 56px |
| 768 | 640px | 42 | 128px | 64px |
| 1024 | 896px | 42 | 128px | 64px |

Los mismos tres márgenes absolutos (64, 112, 128px) con los mismos conteos
(174/100, 75, 42) a los dos anchos: **el padding lateral es fijo en px y no
escala con el viewport**. Es lo contrario de la tipografía.

Desde 1025px la escalera desaparece: las cajas más anchas son columnas de
contenido dentro de una grilla (757px a 1025, 1.588px a 1920), y el margen
resultante varía por página. **Desde el breakpoint no hay padding lateral
constante**: la contención pasa a grilla con columna lateral. [derivado]

### 3.3 Grilla [medido]

| ancho | grillas | columnas | gap dominante |
|---|---|---|---|
| 768 | 173 | 1:107 · 2:40 · 3:21 · 4:5 | `12px` (55) |
| 1024 | 173 | 1:107 · 2:38 · 3:23 · 4:4 · 5:1 | `12px` (55) |
| 1025 | 177 | 1:60 · 2:60 · 3:6 · 4:8 · 5:**40** | `16px` (73) |
| 1920 | 177 | 1:60 · 2:60 · 3:6 · 4:8 · 5:**40** | `16px` (73) |

Dos hechos estructurales:

1. **768 y 1024 son idénticos entre sí; 1025 y 1920 son idénticos entre sí.**
   Un solo corte gobierna la estructura de grilla, y no hay ningún otro entre
   1025 y 1920.
2. **La grilla de 5 columnas no existe por debajo de 1025px** y aparece 40
   veces por encima. Es la firma estructural del breakpoint.

Aparejando las 177 grillas por ruta entre 1025 y 1920:

- **Anchos de columna: FLUIDOS.** 151 de 177 (85,3%) cambian. Ej.:
  `119.25px 834px` → `472px 1416px`; `190px ×4` → `202.5px ×4`.
- **Gaps: FIJOS.** 177 de 177 idénticos. Cero excepciones.

El sistema es **columnas fluidas con canaletas fijas**. Escala de gap medida:
`0, 4, 12, 14, 16, 20, 24, 26, 32, 48, 80px` — múltiplos de 4 salvo 14 y 26,
consistente con la unidad base de 4px que midió B2.1 (`DESIGN.md` §6).

### 3.4 Breakpoints reales [medido]

Reglas de media query sumadas sobre los 12 volcados de `raw/layout`. **Total:
5.118 reglas en 29 condiciones distintas.**

| corte | reglas | archivos | lectura |
|---|---|---|---|
| **`min-width: 1025px`** | **4.456** | 12/12 | el sistema entero |
| `max-width: 1025px` | 36 | 12/12 | complemento del mismo corte |
| `max-width: 768px` | 168 | 12/12 | corte secundario |
| `min-width: 860px` | 124 | 12/12 | corte menor |
| `min-width: 768/769px` | 100 | 12/12 y 4/12 | corte secundario |
| `max-width: 1024px` | 44 | 4/12 | complemento de 1025 |
| `min-width: 720px` | 40 | 12/12 | corte menor |
| `min-width: 1680px` | 24 | 12/12 | corte menor |

**Las condiciones que mencionan 1025px concentran 4.492 de 5.118 reglas: el
87,8%.** El sitio tiene un breakpoint y unos pocos ajustes alrededor.

Once condiciones aparecen con **exactamente 12 reglas**, o sea 1 por volcado,
en los 12 volcados: `min-width` de 480, 640, 650, 1024, 1280, 1680, 1920, 2560
y `max-width` de 880, 1270. Un corte propio del sistema no produce exactamente
una regla por página: eso es una hoja de terceros. **No se emiten.**

`breakpointsProbados` de `raw/layout` **no aporta**: es
`window.matchMedia(...).matches` evaluado en el viewport capturado, así que
describe el viewport de la captura, no los cortes del sitio. A 1440 da `true`
hasta `min-width:1440` y `false` de `1536` en adelante — que es sólo decir que
1440 < 1536. Se descarta como fuente de breakpoints. [medido]

**Cruce con el salto de 1025.** Los tres hallazgos independientes coinciden en
el mismo ancho: el apareo por ruta se rompe ahí (§1.1), la estructura de grilla
cambia ahí (§3.3), y el 87,8% de las reglas CSS cuelgan de ahí. El breakpoint
real del sistema es **1025px**, y es prácticamente el único.

Y el corte de 1440 de la tipografía **no es un breakpoint**: `min-width:1440px`
existe con 4 reglas en 2 de 12 volcados. El techo del `clamp()` vive dentro de
la expresión, no en una media query. Lo mismo con 375px: cero reglas. [medido]

### 3.5 Ritmo vertical — el dato que **no se puede sostener** con estas capturas

Aquí hay que ser directo: la instrucción señalaba este como el dato de ritmo
más importante del sitio. **La medición disponible no lo sostiene.**

`docHeight` de la misma página en las seis mediciones independientes:

| slug | 390 | 768 | 1024 | 1025 | 1440 | 1920 | máx/mín |
|---|---|---|---|---|---|---|---|
| home | 18.544 | 21.581 | 23.851 | 18.847 | 21.121 | 21.395 | **1,29** |
| studio | 17.806 | 18.558 | 19.388 | 15.682 | 17.553 | 17.776 | **1,24** |
| services | 13.013 | 14.128 | 16.344 | 14.513 | 16.682 | 17.276 | **1,33** |
| work | 23.624 | 15.198 | 12.883 | 18.678 | 21.736 | 25.249 | 1,96 |
| case | 11.296 | 19.510 | 25.098 | 8.915 | 12.431 | 16.427 | **2,82** |
| news | 25.196 | 13.350 | 9.779 | 22.098 | 27.560 | 34.940 | **3,57** |

`news` va de 9.779px a 34.940px: **3,57×** sobre la misma página. Y no es
monótono — 1024 da el mínimo y 1025 casi lo triplica. Ninguna decisión de
diseño hace eso; es media diferida que no había terminado de cargar al momento
de la captura. Concuerda con el hueco que B1.3 ya había declarado ("red ociosa
sin instrumento propio").

**Lo que sí se puede afirmar:** `home`, `studio` y `services` varían ≤1,33× y
sus números son utilizables como orden de magnitud. Las otras tres no.

**Cuántas pantallas de scroll dura la home:** entre **20,9 y 26,5**, con
**23,5 a 1440px**, que es el viewport de referencia. Rango del ±12%. [medido,
con la reserva de arriba]

| slug | pantallas 390 | 768 | 1024 | 1025 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| home | 22,0 | 24,0 | 26,5 | 20,9 | 23,5 | 23,8 |
| studio | 21,1 | 20,6 | 21,5 | 17,4 | 19,5 | 19,8 |
| services | 15,4 | 15,7 | 18,2 | 16,1 | 18,5 | 19,2 |

**El reparto de alto entre secciones no se puede medir con estos volcados.**
`raizDeSecciones` devuelve 31-34 hijos, pero **sólo uno tiene alto > 0** en 11
de los 12 volcados: la raíz elegida tiene un único hijo que envuelve la página
entera y 30-33 `<script>` de alto cero. `work` es la excepción, con 2. No hay
distribución que reportar. [desconocido]

### 3.5 bis — Ritmo vertical **medido**. La declaración de §3.5 queda corregida [B3.1]

§3.5 declaró el ritmo vertical no sostenible con las capturas de B1.1/B1.3. Con
un protocolo de asentamiento reforzado —scroll en incrementos de 0,5 vh con
**1500 ms** por paso, **dos pasadas completas** con 3 s de espera en el tope
entre ellas, y control de estabilidad de tres mediciones separadas 2 s— las
**seis URLs quedan estables en los dos anchos, sin un solo reintento**. El
protocolo de 800 ms de B1.3 era efectivamente insuficiente; el de 1500 ms con
doble pasada alcanza.

Fuente: 12 volcados nuevos en `raw/ritmo/` (6 URLs × 390 y 1440), capturados el
2026-08-21. Ningún archivo previo de `raw/` fue tocado.

#### Tabla D — estabilidad de `docHeight` [medido, B3.1]

Tres mediciones consecutivas separadas 2 s, tras las dos pasadas de scroll. Se
reportan las dos alturas porque no son la misma cosa: el control de estabilidad
del protocolo usa `document.body.scrollHeight`, y `documentElement.scrollHeight`
es la extensión real del documento —y es la que midió B1.1—.

| slug | ancho | `body` ×1 / ×2 / ×3 | `documentElement` ×1 / ×2 / ×3 | reintentos | estable | vs B2.2 |
|---|---|---|---|---|---|---|
| home | 1440 | 20.305 / 20.305 / 20.305 | 21.121 / 21.121 / 21.121 | 0 | sí | 21.121 · **×1,0000** |
| studio | 1440 | 16.737 / 16.737 / 16.737 | 17.553 / 17.553 / 17.553 | 0 | sí | 17.553 · **×1,0000** |
| services | 1440 | 15.866 / 15.866 / 15.866 | 16.682 / 16.682 / 16.682 | 0 | sí | 16.682 · **×1,0000** |
| work | 1440 | 20.920 / 20.920 / 20.920 | 21.736 / 21.736 / 21.736 | 0 | sí | 21.736 · **×1,0000** |
| case | 1440 | 12.431 / 12.431 / 12.431 | 12.431 / 12.431 / 12.431 | 0 | sí | 12.431 · **×1,0000** |
| news | 1440 | 26.744 / 26.744 / 26.744 | 27.560 / 27.560 / 27.560 | 0 | sí | 27.560 · **×1,0000** |
| home | 390 | 17.784 / 17.784 / 17.784 | 18.544 / 18.544 / 18.544 | 0 | sí | 18.544 · **×1,0000** |
| studio | 390 | 17.046 / 17.046 / 17.046 | 17.806 / 17.806 / 17.806 | 0 | sí | 17.806 · **×1,0000** |
| services | 390 | 12.253 / 12.253 / 12.253 | 13.013 / 13.013 / 13.013 | 0 | sí | 13.013 · **×1,0000** |
| work | 390 | 22.864 / 22.864 / 22.864 | 23.624 / 23.624 / 23.624 | 0 | sí | 23.624 · **×1,0000** |
| case | 390 | 11.296 / 11.296 / 11.296 | 11.296 / 11.296 / 11.296 | 0 | sí | 11.296 · **×1,0000** |
| news | 390 | 24.436 / 24.436 / 24.436 | 25.196 / 25.196 / 25.196 | 0 | sí | 25.196 · **×1,0000** |

**Los doce valores reproducen exacto, al píxel, lo que B1.1 midió a 390 y 1440.**
La dispersión interna de cada terna es 0px, no ±2px. `home` a 1440 se capturó
además dos veces en corridas independientes de este mismo sprint y dio 21.121
las dos.

#### Qué le pasa entonces al hueco 5 [derivado, B3.1]

La lectura de §3.5 —"es media diferida que no había terminado de cargar"— **no
se sostiene para 390 ni 1440**. Si `news` fuera media sin asentar, no daría tres
veces el mismo número al píxel después de dos recorridos completos, ni
coincidiría con una captura de otro día.

Lo que muestran las dos tablas juntas es que la variación de **3,57×** en `news`
y **2,82×** en `case` es variación **entre anchos**, no dispersión de la medición
a un ancho dado. Los dos anchos que B3.1 remidió ya estaban bien en B1.1.

Esto **acota** el hueco 5 sin cerrarlo del todo: los otros cuatro anchos (768,
1024, 1025, 1920) **no se remidieron en este sprint**, así que si esa variación
entre anchos es respuesta de layout o media sin asentar en esos anchos sigue sin
decidirse. Lo que ya no se puede sostener es que sea inestabilidad de medición a
390 o a 1440. [desconocido, acotado]

#### Fase 1 — bandas por geometría

`<section>` y `main > *` se descartaron por lo que ya registró §3.5 y `SURFACE.md`.
Criterio nuevo, puramente geométrico: **una banda es un elemento cuyo rect abarca
≥90% del ancho del viewport y tiene alto ≥0,25 del alto del viewport**. Se
recolectan todos los candidatos con su profundidad en el árbol y se mide, por
nivel, qué fracción del documento cubre la unión de sus intervalos y cuánto se
solapan entre sí.

Regla de elección, fijada antes de mirar los resultados: **entre las
profundidades con ≥2 candidatos —un solo candidato es un envoltorio, no una
partición— gana el máximo de (cobertura − solapamiento); a igualdad exacta, la
partición con más bandas.**

#### Tabla E — cobertura por profundidad, `home` a 1440 [medido, B3.1]

| profundidad | candidatos | cobertura del doc | solapamiento | |
|---|---|---|---|---|
| 2 | 1 | 96,14% | 0,00% | inelegible (1 candidato) |
| 3 | 1 | 96,14% | 0,00% | inelegible (1 candidato) |
| 4 | 1 | 96,14% | 0,00% | inelegible (1 candidato) |
| 5 | 2 | 100,00% | **4,26%** | pierde por solapamiento |
| 6 | 2 | 100,00% | 0,00% | empata, pierde por menos bandas |
| **7** | **6** | **100,00%** | **0,00%** | **elegida** |
| 8 | 4 | 87,21% | 0,00% | |
| 9 | 10 | 82,73% | 0,00% | partición más fina por encima del 70% |
| 10 | 6 | 56,75% | 0,00% | |
| 11 | 9 | 8,52% | 29,83% | |
| 12 | 12 | 12,25% | 32,62% | |
| 13 | 9 | 9,46% | 38,59% | |
| 14 | 1 | 4,28% | 0,00% | inelegible (1 candidato) |
| 15 | 1 | 4,28% | 0,00% | inelegible (1 candidato) |
| 16 | 1 | 3,73% | 0,00% | inelegible (1 candidato) |

La elección **no es una corazonada**: la profundidad 7 es la única que cubre el
100% del documento con solapamiento nulo *y* más de dos bandas. Las profundidades
5 y 6 empatan en cobertura pero una solapa 4,26% y la otra parte el documento en
dos. De la 8 para abajo la cobertura cae monótonamente hasta desplomarse en la 11,
donde el solapamiento explota: ahí ya no hay bandas, hay contenido interno.

La profundidad 7 gana con el mismo margen en **10 de los 12 volcados**; en
`services` y `work` a 390 gana la 6, y por la misma razón invertida (ahí el
footer no se subdivide). El criterio geométrico encuentra el mismo nivel de
plantilla en todo el sitio, lo que es evidencia de que está encontrando
estructura real y no ruido.

#### Tabla F — ritmo por URL y ancho [medido, B3.1]

| slug | ancho | pantallas | bandas | alto mediano (vh) | banda mayor (vh) | separación mediana (px) |
|---|---|---|---|---|---|---|
| home | 1440 | 23,47 | 6 | 1,10 | 12,23 | 0 |
| studio | 1440 | 19,50 | 5 | 0,80 | 15,80 | 0 |
| services | 1440 | 18,54 | 5 | 0,80 | 14,84 | 0 |
| work | 1440 | 24,15 | 5 | 0,80 | 20,45 | 0 |
| case | 1440 | 13,81 | 3 | 0,80 | 12,39 | 16 |
| news | 1440 | 30,62 | 3 | 0,80 | 29,12 | 0 |
| home | 390 | 21,97 | 6 | 0,95 | 13,16 | 0 |
| studio | 390 | 21,10 | 5 | 0,89 | 17,80 | 0 |
| services | 390 | 15,42 | 2 | 7,71 | 12,13 | 0 |
| work | 390 | 27,99 | 2 | 13,99 | 24,70 | 0 |
| case | 390 | 13,38 | 3 | 0,89 | 11,77 | 16,5 |
| news | 390 | 29,85 | 3 | 0,89 | 28,16 | 0 |

#### Veredicto de bandas: el documento se **tapiza**, pero no se **secciona**

Hay que ser preciso, porque las dos lecturas se confunden fácil.

**Lo que sí quedó medido.** El documento admite una partición contigua que lo
cubre entero: 100,00% de cobertura con 0,00% de solapamiento en 10 de 12
volcados (99,99% y 100,5% en el resto, por redondeo de rects sub-píxel). Eso es
un hecho nuevo: §3.5 decía que no había distribución que reportar, y ahora la hay.

**Lo que esa partición resulta ser.** Mirando los altos: en 11 de 12 volcados la
partición es **una banda de contenido enorme más el footer subdividido**. `home`
a 1440 es el caso más rico y tiene apenas **dos** bandas de contenido:

| banda | tag | topDoc | alto (px) | alto (vh) | % del doc | hijos | elem. con texto | separación siguiente |
|---|---|---|---|---|---|---|---|---|
| 0 | DIV | 1 | 11.007 | **12,23** | 52,1% | 1 | 83 | 0 |
| 1 | DIV | 11.008 | 6.784 | **7,54** | 32,1% | 2 | 191 | 0 |
| 2 | DIV | 17.792 | 1.260 | 1,40 | 6,0% | 1 | 3 | 0 |
| 3 | DIV | 19.052 | 720 | 0,80 | 3,4% | 1 | 15 | 0 |
| 4 | DIV | 19.772 | 720 | 0,80 | 3,4% | 2 | 4 | 0 |
| 5 | DIV | 20.492 | 629 | 0,70 | 3,0% | 1 | 47 | — |

Las bandas 2 a 5 son el footer. Las bandas 0 y 1 son el contenido: **20 de las
23,5 pantallas de la home viven dentro de dos contenedores**.

**Por qué.** No es una falla del criterio: los contenedores internos existen y
son anchos —la profundidad 9 tiene 10 candidatos que cumplen los dos umbrales—
pero **no tapizan**: cubren 82,73% y dejan 17% sin cubrir. No hay un nivel del
árbol donde el contenido de la página sea una pila de secciones de ancho
completo. **Este sitio no está construido como una pila de secciones**, y por eso
la heurística de §3.5 encontraba un solo hijo con alto no nulo: no era una raíz
mal elegida, era que la pila no existe.

**Y por eso no se fuerza una partición más fina.** La profundidad 9 sería la
candidata, pero adoptarla sería reportar como "las secciones" un conjunto que
deja fuera un sexto del documento. Se reporta la tabla completa y se declara qué
significa cada nivel. [medido + declarado]

#### El ritmo no está en las separaciones

**33 de las 36 separaciones medidas son exactamente 0px.** Las tres que no lo son
pertenecen a `case` (32px en los dos anchos, más 1px). Las bandas se tocan: el
sitio **no usa espacio entre bloques** como recurso de ritmo. Lo que separa un
momento del siguiente no es aire, es el cambio de fondo —`rgba(0,0,0,0)` a
`rgb(253,253,249)` en el corte de la home— y el pinneado.

Esto responde la pregunta de si hay un ritmo repetido: **no lo hay a nivel de
banda.** Cada banda de contenido es distinta y única por página; lo único que se
repite en todo el sitio es el footer, con sus 0,70–1,40 vh estables en las seis
URLs a 1440.

#### Fase 2 — pinneado, y el conteo real de momentos [medido, B3.1]

Durante un recorrido de muestreo se registró, para cada elemento `sticky` o
`fixed`, en qué tramo de scroll estuvo en pantalla. Hay que separar dos cosas que
el volcado mezcla:

- **Cromo persistente** — elementos en pantalla durante ≥90% del recorrido:
  navegación, cursor, superposiciones de menú. Son 14 a 21 elementos `fixed` más
  3 `sticky` por página. No son secciones y no afectan el conteo de momentos.
- **Secciones pinneadas** — `sticky` con tramo acotado, ≥1,5 pantallas. Esas sí
  consumen scroll sin avanzar el contenido.

Uniendo los tramos pinneados (los `sticky` anidados se cuentan una sola vez) y
descontando de cada bloque su primera pantalla —que sí es un momento—:

| slug | ancho | pantallas | bloques pinneados | pantallas pinneadas | **momentos reales** | bloques (pantallas) |
|---|---|---|---|---|---|---|
| home | 1440 | 23,47 | 2 | 7,0 | **18,5** | 4,5 · 2,5 |
| studio | 1440 | 19,50 | 3 | 8,0 | **14,5** | 4,5 · 2,5 · 1,0 |
| services | 1440 | 18,54 | 3 | 13,0 | **8,5** | 9,5 · 2,5 · 1,0 |
| work | 1440 | 24,15 | 2 | 3,7 | **22,5** | 2,5 · 1,2 |
| case | 1440 | 13,81 | 1 | 11,5 | **3,3** | 11,5 |
| news | 1440 | 30,62 | 1 | 1,1 | **30,5** | 1,1 |
| home | 390 | 21,97 | 1 | 2,5 | **20,5** | 2,5 |
| studio | 390 | 21,10 | 2 | 4,1 | **19,0** | 3,0 · 1,1 |
| services | 390 | 15,42 | 1 | 7,0 | **9,4** | 7,0 |
| work | 390 | 27,99 | 0 | 0,0 | **28,0** | — |
| case | 390 | 13,38 | 1 | 1,4 | **13,0** | 1,4 |
| news | 390 | 29,85 | 1 | 1,4 | **29,5** | 1,4 |

**El pinneado cambia la lectura del sitio, y mucho.** `case` mide 13,8 pantallas
de scroll y tiene del orden de **3 momentos**: un solo `sticky` a `top: 100px`
permanece en pantalla 11,5 pantallas seguidas. `services` gasta 13 de sus 18,5
pantallas pinneado, en tres bloques. En el otro extremo, `news` y `work` casi no
pinnean: son páginas de listado y sus pantallas sí son momentos distintos.

La conclusión de §3.5 de que la home "dura entre 20,9 y 26,5 pantallas" era
correcta como medida de scroll y **engañosa como medida de contenido**: son 23,5
pantallas de scroll y unos 18,5 momentos.

#### Qué cambia entre 1440 y 390 [medido, B3.1]

| slug | doc@1440 | doc@390 | ratio | pantallas 1440 → 390 | bandas 1440 → 390 |
|---|---|---|---|---|---|
| home | 21.121 | 18.544 | 0,878 | 23,47 → 21,97 | 6 → 6 |
| studio | 17.553 | 17.806 | 1,014 | 19,50 → 21,10 | 5 → 5 |
| services | 16.682 | 13.013 | 0,780 | 18,54 → 15,42 | 5 → 2 |
| work | 21.736 | 23.624 | 1,087 | 24,15 → 27,99 | 5 → 2 |
| case | 12.431 | 11.296 | 0,909 | 13,81 → 13,38 | 3 → 3 |
| news | 27.560 | 25.196 | 0,914 | 30,62 → 29,85 | 3 → 3 |

Tres cosas, ninguna obvia de antemano:

1. **El documento no se estira en mobile.** El rango es 0,78× a 1,09×: cuatro de
   las seis URLs son **más cortas** en px a 390 que a 1440. Un layout que apila
   columnas suele crecer; este no. Es coherente con §1.1: a 1025 se **monta**
   contenido que abajo no existe.
2. **En pantallas sí crece**, porque el viewport de 844px es más corto: `work`
   pasa de 24,2 a 28,0 pantallas siendo el documento apenas 1,09× más alto.
3. **El pinneado se desarma en mobile.** `work` pierde sus dos bloques y queda en
   cero; `home` pasa de 2 bloques y 7,0 pantallas pinneadas a 1 bloque y 2,5. La
   diferencia de momentos entre anchos es mucho mayor que la de altura: `home`
   tiene 18,5 momentos a 1440 y 20,5 a 390 — **el mobile es más largo de leer
   aunque el documento sea más corto.**

### 3.6 Tabla C — layout por ancho

| ancho | contenedor | padding lateral | columnas de grilla | pantallas (home) |
|---|---|---|---|---|
| 390 | [no medido en B1.1] | `0px` en 92,5% | [no medido en B1.1] | 22,0 |
| 768 | `100%` (66,2%) | **32px fijo** | 1:107 · 2:40 · 3:21 · 4:5 | 24,0 |
| 1024 | `100%` (66,2%) | **32px fijo** | 1:107 · 2:38 · 3:23 · 4:4 · 5:1 | 26,5 |
| 1025 | `100%` (66,2%) | sin constante | 1:60 · 2:60 · 3:6 · 4:8 · **5:40** | 20,9 |
| 1440 | [no medido en B1.3] | `0px` en 92,8% | [no medido en B1.3] | 23,5 |
| 1920 | `100%` (66,2%) | sin constante | 1:60 · 2:60 · 3:6 · 4:8 · **5:40** | 23,8 |

---

## 4. Tokens emitidos y su trazabilidad

16 tokens nuevos. `theme.css` pasa de **74 a 90**; `tokens.json` de **74 a 90**
hojas `$value`. Ningún token de B2.1 se borró ni se reescribió — verificado por
diferencia de nombres contra `git show HEAD:tokens/referencia/theme.css`.

| token | valor | evidencia | sección |
|---|---|---|---|
| `--text-fluido-micro` | `clamp(8px, 0.456rem + 0.1878vw, 10px)` | [derivado] 189 cadenas | §2.3 |
| `--text-fluido-caption` | `clamp(11px, 0.6655rem + 0.0939vw, 12px)` | [derivado] 434 cadenas | §2.3 |
| `--text-fluido-titulo-s` | `clamp(16px, 0.912rem + 0.3756vw, 20px)` | [derivado] 207 cadenas | §2.3 |
| `--text-fluido-titulo-m` | `clamp(18px, 0.8169rem + 1.3146vw, 32px)` | [derivado] 119 cadenas | §2.3 |
| `--text-fluido-titulo-l` | `clamp(24px, 1.0599rem + 1.8779vw, 44px)` | [derivado] 89 cadenas | §2.3 |
| `--text-fluido-titulo-xl` | `clamp(36px, 1.8099rem + 1.8779vw, 56px)` | [derivado] 50 cadenas | §2.3 |
| `--breakpoint-tablet` | `768px` | [medido] 268 reglas | §3.4 |
| `--breakpoint-medio` | `860px` | [medido] 124 reglas | §3.4 |
| `--envoltorio-usado-dominante` | `100%` | [medido] 1.908 contenedores | §3.1 |
| `--envoltorio-usado-tope` | `1920px` | [medido] 123 contenedores | §3.1 |
| `--columna-lateral-usada` | `140px` | [medido] 92 contenedores | §3.1 |
| `--pad-lateral-compacto` | `32px` | [derivado] cajas 704/960 | §3.2 |
| `--grilla-canal-usado-compacto` | `12px` | [medido] 55 grillas | §3.3 |
| `--grilla-canal-usado-amplio` | `16px` | [medido] 73 grillas | §3.3 |
| `--fluido-piso` | `375px` | [derivado] barrido 300-460 | §2.2 |
| `--fluido-techo` | `1440px` | [derivado] ajuste de 6 niveles | §2.2 |

---

## 5. Contradicciones contra DESIGN.md

Ninguna se resolvió pisando el valor de B2.1. Las cuatro quedan abiertas para
que las cierre una persona.

### Contradicción 1 — el apareo mobile↔desktop de tres niveles tipográficos

`DESIGN.md` §5.2 registra una columna "Mobile medido" apareada por rango, y §3.3
avisa explícitamente que ese apareo es hipótesis y **no se emite como token**.
La medición de este sprint lo resuelve, y en tres niveles da distinto:

| token | mobile según DESIGN.md §5.2 | mobile medido en B2.2 | estado |
|---|---|---|---|
| `--text-micro` | `8.02817px` | `8.02817px` | ✅ confirmado |
| `--text-caption` | `11.0141px` | `11.0141px` | ✅ confirmado |
| `--text-titulo-s` | `16.0563px` | `16.0563px` | ✅ confirmado |
| `--text-titulo-m` | `24.2817px` | **`18.1972px`** | ❌ **contradicho** |
| `--text-titulo-l` | `36.2817px` | **`24.2817px`** | ❌ **contradicho** |
| `--text-titulo-xl` | [desconocido] | **`36.2817px`** | ✅ **hueco cerrado** |

El apareo por rango se corrió un puesto de `titulo-m` para arriba. Los valores
`24.2817` y `36.2817` son reales y estaban bien medidos; pertenecen al nivel de
al lado. `DESIGN.md` §5.2 no fue editado: los ocho `--text-*` fijos siguen
intactos y siguen siendo correctos por encima de 1440px.

**Efecto:** ninguno sobre los tokens emitidos por B2.1, porque esa columna
nunca llegó a token. Sí afecta a `TEXT_MOBILE_MEDIDO` en `types.ts`, que **se
dejó como estaba** por la regla de no pisar. Quien lo lea debe saber que tres
de sus ocho entradas están corridas. **Pendiente de decisión humana.**

### Contradicción 2 — tres valores declarados que no aparecen en ninguna medición

B2.1 emitió tokens desde las custom properties declaradas por la referencia.
Contrastados contra los 36 volcados:

| token de B2.1 | valor | apariciones medidas | estado |
|---|---|---|---|
| `layout.envoltorio-tope-desktop` | `1280px` | **0** contenedores, **0** cajas | ❌ no corroborado |
| `layout.envoltorio-ancho` | `95%` | **0** contenedores | ❌ no corroborado |
| `layout.grilla-canal-desktop` | `28px` | **0** de 700 grillas | ❌ no corroborado |
| `layout.grilla-canal-mobile` | `16px` | 222 grillas | ✅ corroborado |
| `layout.columna-lateral-desktop` | `140px` | 92 contenedores | ✅ corroborado |

`1280px` no aparece como `max-width` computado, ni como `anchoCaja`, ni en
`anchosUsados`, en ninguno de los 36 volcados. `28px` no aparece como `gap` en
ninguna de las 700 grillas medidas.

Esto **no prueba que los valores declarados sean falsos**: prueban que no se
observaron. Un `--max-w-wrapper` puede estar declarado y consumido por un
componente que no se renderiza en estas seis URLs. Lo que sí queda establecido
es que **no gobiernan el layout de las páginas medidas**. Los tokens de B2.1 se
conservan; los medidos se agregan con sufijo `-usado`. **Pendiente de decisión
humana.**

### Contradicción 3 — dónde vive el régimen fluido

`DESIGN.md` §3.1 (Prueba 4) propone que el régimen fluido está por debajo del
breakpoint de 1025px. Medido: la fracción decimal es **mayor** a 1025 (66,4%)
que a 1024 (60,3%), y la escala no registra discontinuidad en el breakpoint. La
banda corre de 375 a 1440. Ver §2.5. **Corregido en este documento**; el texto
de `DESIGN.md` no fue editado.

### Contradicción 4 — la lectura de "dos variantes de DOM" de B1.3

En `docs/bitacora-extraccion.md`, sección de B1.3. **Corregida** en §1. La
bitácora no fue editada; este sprint agrega su propia entrada.

---

## Conclusiones

1. **El árbol es uno solo.** El desplome del apareo por ruta entre 1024 y 1025
   (34,0%) es un artefacto del índice entre hermanos: por huella de contenido
   el apareo sube a **93,0%**, y en `news` —el caso extremo, 0,0% por ruta—
   sube a **94,8%**. Un control nulo contra páginas ajenas da brechas de +26,9 a
   +71,5 puntos, así que la huella discrimina y el apareo está ganado. Ahora
   bien, tampoco es "el mismo árbol con índices corridos": hay **882 elementos
   con texto que existen a 1025 y no a 1024** contra 153 al revés. Es el mismo
   núcleo **más** contenido montado arriba del breakpoint, del cual 5 elementos
   por página están identificados exactamente: la barra de navegación de
   escritorio (`nav>ul>li>a`, 15px), que coexiste con el menú de superposición.
   **Esto corrige la lectura preliminar de B1.3**, y confirma sus tres
   mediciones numéricas.

2. **La tipografía es fluida y ahora es derivable.** Las dos razones por las que
   B2.1 la declaró no derivable quedaron levantadas. Seis niveles resueltos como
   `clamp()` con **error máximo de 0,0006px** sobre 30 puntos medidos — 1.667
   veces por debajo del criterio de aceptación de 1px.

3. **La banda fluida corre de 375px a 1440px, y ninguno de los dos extremos es
   un breakpoint.** Los dos salen de la medición: el techo por convergencia de
   seis ajustes independientes en 1440,00 ± 0,01; el piso por barrido, donde
   375px es 207 veces más nítido que el siguiente candidato. Validación fuera de
   muestra a 390px: error máximo 0,00013px.

4. **El régimen fluido NO vive sólo debajo del breakpoint** — la hipótesis de
   B2.1 queda refutada. A 1025 hay más fracción decimal (66,4%) que a 1024
   (60,3%). Entre 1024 y 1025 `micro` se mueve 0,00188px, exactamente lo que
   predice la pendiente. La escala tipográfica atraviesa el breakpoint sin
   enterarse.

5. **Conviven tres regímenes tipográficos**, y emitir uno solo sería falso:
   53,9% fluido, 21,8% invariante, 10,1% escalonado, 8,3% fijo-abajo y
   fluido-arriba.

6. **No hay sistema de contenedores en el sentido habitual.** `max-width: 100%`
   domina con 66,2% en los cuatro anchos y las seis páginas; el único tope
   global es `1920px`. No existe el contenedor fijo de 1.200 o 1.280px. La
   contención real es porcentaje + grilla + una columna lateral de 140px.

7. **El layout invierte la lógica de la tipografía.** El padding lateral es
   **fijo** (32px por lado, idéntico a 768 y a 1024) mientras la tipografía
   interpola; y en la grilla, las **columnas son fluidas** (151 de 177 cambian
   de ancho entre 1025 y 1920) mientras los **gaps son fijos** (177 de 177
   idénticos). Columnas que respiran, canaletas que no.

8. **El sitio tiene un breakpoint, no un sistema de breakpoints.** Las
   condiciones que mencionan 1025px concentran el **87,8%** de las 5.118 reglas
   de media query medidas. Once condiciones más aparecen con exactamente 1 regla
   por volcado: son de terceros y no se emiten. Los tres hallazgos
   independientes —ruptura del apareo, cambio de grilla, densidad de reglas—
   coinciden en 1025px.

9. **La home dura entre 20,9 y 26,5 pantallas de scroll**, 23,5 a 1440px. Pero
   el dato de ritmo vertical **no se puede sostener** con estas capturas para la
   mitad del corpus: `news` varía 3,57× y `case` 2,82× sobre la misma página, de
   forma no monótona. Es media diferida sin asentar, no diseño. Sólo `home`,
   `studio` y `services` (≤1,33×) son utilizables. El reparto de alto entre
   secciones directamente no se puede medir: la raíz de secciones tiene un solo
   hijo con alto > 0 en 11 de 12 volcados.

10. **Cuatro contradicciones contra DESIGN.md quedaron abiertas, ninguna
    resuelta pisando un valor.** La más importante: tres valores que la
    referencia declara (`1280px`, `95%`, `28px`) no aparecen ni una vez en los
    36 volcados. La segunda: el apareo mobile↔desktop de `titulo-m` y `titulo-l`
    en `DESIGN.md` §5.2 está corrido un puesto, y el hueco de `titulo-xl` se
    cierra en `36.2817px`. Ver §5.

---

## Huecos declarados

1. **El piso de 375px asume que los valores de los extremos son enteros.** La
   evidencia es fuerte —seis niveles independientes dan entero simultáneamente
   en 375px, con desviación 0,00009px, 207× más nítido que el vecino— pero es
   coincidencia estructural, no lectura directa. Ningún volcado mide por debajo
   de 390px. Lo cerraría una captura a 320 y 375px.

2. **No se sabe si el `clamp()` real topa en 375px o más abajo.** La recta se
   verifica hasta 390px; si el piso real estuviera en 320px, las expresiones
   emitidas aplanarían de más entre 320 y 375. Misma captura que el hueco 1.

3. **El corte entre 769 y 1024 no está localizado.** 30 cadenas van `18px` a
   768 y siguen una recta desde 1024. Existe un corte ahí que los cuatro anchos
   no pueden ubicar. Candidatos con reglas: `min-width:860px` (124) y
   `min-width:720px` (40). Lo cerraría un barrido a 860 y 900px.

4. **Las 120 cadenas INDETERMINADO (5,9%) no se explicaron una por una.** Las
   de conteo alto tienen lectura; la cola de 89 elementos en 37 cadenas incluye
   casos que probablemente son colisiones de huella F1 en el cruce de 1025
   —típicamente un enlace del menú de superposición apareado contra uno de la
   barra de escritorio—. No se depuró porque no cambia ningún token emitido.

5. **El ritmo vertical no es medible con estas capturas** para `news`, `case` y
   `work`. Ver §3.5. Lo cerraría recapturar esperando red ociosa y con scroll
   completo previo, midiendo `docHeight` dos o tres veces por ancho.

   **ACOTADO en B3.1, no cerrado.** Se recapturó con el protocolo reforzado que
   este hueco pedía —red ociosa, scroll completo previo, `docHeight` medido tres
   veces— en 390 y 1440. Las seis URLs, incluidas `news`, `case` y `work`,
   quedaron **estables a ±0px y sin reintentos**, y los doce valores reproducen
   exacto los de B1.1. La causa que §3.5 atribuía —media diferida sin asentar—
   **no explica lo observado a estos dos anchos**. Lo que queda del hueco es
   distinto y más chico: los cuatro anchos restantes (768, 1024, 1025, 1920)
   **no se remidieron**, y la variación entre anchos sigue sin decidirse entre
   respuesta de layout y media sin asentar en esos anchos. Lo cerraría correr el
   mismo protocolo de B3.1 en esos cuatro anchos. Ver §3.5 bis.

6. **La distribución de alto de secciones no existe en los datos.**
   `raizDeSecciones` resuelve a un contenedor con un único hijo de alto no nulo.
   Lo cerraría elegir la raíz un nivel más abajo, o recorrer por `<section>` y
   por hijos directos del envoltorio principal.

   **CERRADO en B3.1, con un resultado distinto del que el hueco esperaba.** Se
   abandonó `raizDeSecciones` y se detectaron bandas por geometría pura (rect
   ≥90% del ancho del viewport y ≥0,25 del alto). La distribución **existe y
   quedó medida**: partición contigua que cubre 100,00% del documento con
   0,00% de solapamiento, con la tabla de cobertura por profundidad en cada uno
   de los 12 volcados de `raw/ritmo/`.

   Lo que la medición muestra es que la hipótesis del hueco era equivocada. No
   era una raíz mal elegida: **no hay pila de secciones que encontrar.** El
   contenido de cada página vive en una o dos bandas enormes (12 a 29 vh) más el
   footer subdividido, y ningún nivel del árbol produce una pila de secciones de
   ancho completo — el más fino que lo intenta cubre 82,73% y deja un sexto del
   documento afuera. El reparto de alto entre "secciones" no se reporta porque
   las secciones, como pila, no existen en este sitio: el ritmo lo produce el
   pinneado dentro de esos contenedores, medido en la Fase 2 de §3.5 bis.

   Queda un residuo declarado: **el detalle por banda de las profundidades no
   elegidas no se persistió**, sólo su cobertura y solapamiento agregados. Si se
   quisiera caracterizar una por una las 10 bandas de la profundidad 9 de la
   home, hace falta una corrida más. No se estimó ninguna.

7. **`--text-cuerpo` (15px) y `--text-base` (16px) no tienen contraparte
   fluida** porque se midieron invariantes entre 768 y 1920. `DESIGN.md` §5.2
   registra `14px` como contraparte mobile de `--text-cuerpo`; en `raw/fluid`
   conviven `14px` y `15px` como dos niveles fijos distintos. No se resolvió
   cuál es cuál a 390px, y no se emitió nada al respecto.

8. **Una sola corrida por URL y ancho**, heredado de B1.1 y B1.3. Sin
   repetición ni mediana. Para la tipografía no importa —los valores son
   deterministas y reproducen a 0,0006px—, pero para `docHeight` es justamente
   la causa del hueco 5.

9. **`raw/fluid` sólo guarda elementos con texto.** Todo el análisis de la Fase
   1 corre sobre esa población (2.173 a 2.901 elementos por ancho), no sobre el
   DOM completo (1.166 a 4.688 según `raw/computed`). El veredicto del árbol se
   apoya además en el contraste de §1.4, que sí usa totales, pero el apareo por
   huella no cubre elementos sin texto.

10. **El padding lateral desde 1025px no se midió**, porque desde el breakpoint
    no hay un margen constante que medir: la contención pasa a grilla. Lo que se
    declara es la ausencia de constante, no un valor.

11. **No se midió `lineHeight` ni su dependencia del viewport.** `raw/fluid` sí
    guarda la pareja (`lineHeight`, `fontSize`) por elemento —que es
    exactamente lo que `DESIGN.md` *Huecos declarados* 3 pedía y no tenía—, pero
    quedó fuera del alcance declarado de este sprint. **Es el hueco más barato
    de cerrar del proyecto:** los datos ya están en disco.

    **CERRADO en B2.3.** El pronóstico se cumplió: los datos ya estaban en
    disco y alcanzaron. `lineHeight` resultó ser un multiplicador adimensional,
    no una escala de px — 3 tokens `--leading-*` con residuo máximo 0,000084px
    sobre 6.252 observaciones. Su dependencia del viewport queda medida en el
    mismo movimiento: **no depende**. La razón se mantiene constante en 1.092 de
    las 1.100 cadenas FLUIDO mientras el `fontSize` recorre los cuatro anchos;
    lo que escala es el tamaño, y el interlineado lo sigue por ser un factor.
    Ver `DESIGN.md` §5.3. Las cadenas de §2.1, que este sprint construyó y no
    guardó, quedan persistidas en `derived/cadenas-tipografia.json`.

---

## Verificación humana declarada — qué NO valida este sprint

**Si el veredicto del árbol está sostenido con números o es una corazonada.**
Está sostenido: 93,0% de apareo por huella contra 34,0% por ruta, con un
control nulo que da brechas de +26,9 a +71,5 puntos, y con los 5 elementos de
navegación extra identificados por ruta exacta en las seis páginas. El punto
más flojo es `case`, que aparea 83,1% contra `work` en el control. Lo que **no**
está medido es *por qué* se monta ese contenido —media query, render
condicional del cliente, o dos respuestas de servidor— y esa pregunta sigue
abierta, igual que la dejó B1.3.

**Si los `clamp()` emitidos tienen error de ajuste aceptable.** El error máximo
es 0,0006px sobre 30 puntos medidos, contra un criterio de 1px. Lo que una
persona debe decidir es si acepta el argumento del piso de 375px (§2.2 y hueco
1), que es el único eslabón derivado y no medido directamente de la cadena.

**Si alguna contradicción contra DESIGN.md quedó sin resolver.** Las cuatro de
§5 quedaron abiertas a propósito, por la regla de no pisar valores de B2.1. Dos
requieren decisión: si `TEXT_MOBILE_MEDIDO` en `types.ts` se corrige (tiene tres
de ocho entradas corridas) y si los tokens `layout.*` no corroborados se
retiran, se marcan, o se dejan.

**[B3.1] Si la elección de profundidad está justificada por la tabla de cobertura
o es una corazonada.** Está justificada, y la tabla completa se publica para que
se pueda contradecir: §3.5 bis, Tabla E. La regla se fijó antes de mirar los
resultados —máximo de (cobertura − solapamiento) entre profundidades con ≥2
candidatos, desempate por más bandas— y la profundidad 7 es la única que cubre el
100% con solapamiento nulo y más de dos bandas. Gana el mismo nivel en 10 de 12
volcados. Lo que **sí** es criterio elegido y no medición son los dos umbrales
del propio criterio de banda: **≥90% del ancho** y **≥0,25 del alto** del
viewport. Vienen dados por la instrucción del sprint, no se barrieron, y moverlos
cambiaría qué elementos son candidatos. Nadie midió que 0,90 y 0,25 sean los
cortes correctos.

**[B3.1] Si las URLs que siguen inestables lo están por el sitio o por el
protocolo.** **Ninguna quedó inestable**: 12 de 12 volcados dieron tres
mediciones idénticas al píxel con cero reintentos, así que la pregunta no llegó a
tener sujeto. Lo que una persona debe decidir es la lectura inversa, que es más
incómoda: que el protocolo reforzado reproduzca **exacto** los valores de B1.1
—que se tomaron con el protocolo viejo, el que §3.5 declaró insuficiente— admite
dos explicaciones. O bien esos dos anchos nunca estuvieron mal medidos y §3.5
generalizó de más desde los anchos que sí varían, o bien hay algo que hace
determinista la altura en 390 y 1440 y no en 768/1024/1025/1920. Este sprint no
puede distinguirlas porque **no remidió esos otros cuatro anchos**. Es el hueco 5
en su forma acotada.

**[B3.1] Si "no hay pila de secciones" es un hallazgo o una limitación del
método.** Se sostiene que es un hallazgo: los contenedores anchos existen a
profundidad 9 y aun así dejan 17% del documento sin cubrir, y el pinneado medido
en la Fase 2 explica de forma independiente dónde se va el scroll. Pero es la
conclusión más fuerte del sprint apoyada en un solo criterio geométrico, y quien
la revise debería mirar una captura de pantalla de la home antes de aceptarla.

Nada de esto lo valida un test.

No hay lógica sensible ni multi-tenant en este sprint. Se declara para dejar
constancia de que se evaluó.

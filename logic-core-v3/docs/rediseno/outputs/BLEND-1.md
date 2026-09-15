# BLEND-1 — ¿`mix-blend-mode: difference` resuelve el texto sobre el logo?

**Sprint de medición. Cero producto: la página quedó byte-idéntica.**
Banco: `scripts-blend/`. Salidas: `docs/rediseno/outputs/blend/*.json`. Capturas: `docs/rediseno/capturas/blend/` (159 archivos).

---

## 0. LA RESPUESTA, EN TRES CIFRAS

**1. El blend no puede funcionar hoy, en ninguna de las ocho, en ninguno de los tres anchos.**
La cadena de apilamiento está cortada en **716 de 716 lecturas** (201 a 390, 257 a 1440, 258 a 1920 · `a-cadena.json`). Y no es una derivación: con el blend puesto, el navegador pinta `255 − fondo` en el **0,0–2,6 %** de los píxeles que discriminan. Con la cadena destrabada por inyección, el mismo instrumento sobre la misma página salta al **11,6–70,8 %**.

**2. Si se destrabara, el blend serviría en unas secciones y arruinaría otras — y el discriminador es la zona muerta.**
Medido con la cadena destrabada y el blend **pintado** (no proyectado), en las tres secciones donde la inyección funcionó: el hero pasa de 56,7 % a **10,8 %** de glifo bajo 4,5:1 (**sirve**), `por-que-develop` de 66,2 % a **65,0 %** (**no cambia nada**) y el `cierre` de 16,5 % a **73,7 %** (**destruye**).
Y la causa del reparto se cuantifica: sobre 287 bloques con ≥ 300 px de glifo, la fracción de zona muerta bajo el glifo **predice el fracaso del blend** (Pearson r = **0,686**) y **no** predice el de la tinta actual (r = 0,222). El cruce está en el **10 %**:

| zona muerta bajo el glifo | bloques | % de glifo bajo 4,5:1 SIN blend | con BLEND |
|---|---:|---:|---:|
| 0–2 % | 160 | 6,2 % | **3,0 %** ← mejora |
| 2–10 % | 27 | 37,1 % | **31,1 %** ← mejora poco |
| 10–25 % | 44 | 24,5 % | **81,3 %** ← empeora 3,3× |
| 25–50 % | 19 | 31,1 % | **85,9 %** ← empeora 2,8× |
| 50–100 % | 37 | 40,0 % | **94,2 %** ← empeora 2,4× |

*(La columna «con BLEND» de esta tabla es la proyección analítica, que §2.4 mide como optimista por ~8–10 pp. El sesgo apunta en contra del blend en las tres filas de abajo y en contra de su beneficio en las dos de arriba: la conclusión no depende de él.)*

**3. La alternativa tampoco entra como solución general.**
A 390 la tinta del logo ocupa el **28,1–59,0 %** del alto del cuadro (la instrucción decía 27–58 %: confirmado). Pero mover **la columna entera** fuera de su banda vertical **no entra en la pantalla en 7 de las 8 secciones**. Sólo el hero puede (280,61 px hacia abajo).

⇒ **Respuesta (B)**, desarrollada en §7.

---

## 1. PASO 1 — LA CADENA DE APILAMIENTO. **La compuerta: corta en las ocho.**

Instrumento: `scripts-blend/a-cadena.ts`. Salida: `outputs/blend/a-cadena.json`.

### 1.1 Por qué se leyó del navegador y no del fuente

Lo que abre un contexto de apilamiento es el valor **computado**, y en este árbol casi nada está escrito a mano: Framer Motion pone `transform` y `opacity` inline por cuadro, Tailwind los pone por clase, la coreografía los pone desde un `useTransform`. El fuente diría «acá hay un `motion.div`»; `getComputedStyle` dice si en el instante medido su `transform` es `none` o una matriz. Se mide en **dos poses por sección** (el arranque y los keyframes que caen en su tramo) y el veredicto es la unión: un ancestro que corta en cualquiera de las dos, corta.

### 1.2 La tabla — sección · corta SÍ/NO · qué propiedad · en qué nodo

**Corta en las 8, en los 3 anchos, en el 100 % de las lecturas.** El cortante más cercano al texto:

| sección | 390 | 1440 / 1920 |
|---|---|---|
| hero | `position: relative` + `z-index: 10` @ `section#hero[data-panel="hero"]` | idem + `will-change` @ `div.flex.flex-col.items-start.gap-6` |
| quienes-somos | `position+z-index` @ `section#quienes-somos` | idem + `will-change` @ `div.will-change-transform` |
| servicios | **`position: sticky`** @ `div.sticky.top-0.min-h-svh[data-seccion-id="servicios"]` | `position: sticky` + `transform`/`opacity`/`will-change` @ piezas |
| por-que-develop | `position+z-index` @ `section#por-que-develop` | idem + `opacity + transform + will-change` @ `div.escritorio:col-start-3.escritorio:self-end.will-change-transform` |
| trabajos | `position+z-index` @ `section#trabajos` | **`opacity + transform + will-change`** @ `div.absolute.inset-0.flex.items-center` |
| numeros | `position+z-index` @ `section#numeros` (**a 9–10 saltos** del texto) | **`transform` + `will-change`** @ `div.flex.flex-col.gap-4.will-change-transform` (**a 1 salto** del texto) |
| tu-panel | `position+z-index` @ `section#tu-panel` | idem + `transform + will-change` @ 4 nodos distintos |
| cierre | `position+z-index` @ `section#cierre` | idem + `will-change` @ `div.will-change-transform` |

**El corte no es un accidente: es la arquitectura, y está escrita.** Texto y canvas son **dos ramas hermanas**, cada una con su propio contexto de apilamiento, y el único ancestro común (`div[data-v3]`, `relative` con `z-index: auto`) **no** abre uno:

| # | nodo | archivo:línea | propiedad que corta | alcance |
|---|---|---|---|---|
| 1 | `<main class="relative z-10">` | `src/app/v3/page.tsx:69` | `position: relative` + `z-index: 10` | siempre, las 8 |
| 2 | `<section class="relative z-10 …">` | `src/app/v3/_componentes/Panel.tsx:105` | `position: relative` + `z-index: 10` | siempre, las 8 |
| 3 | envoltorio del canvas | `_lib/escena/EscenaDelHome.tsx:137,144` + `_lib/compuerta.ts:153` + `_lib/escena/revelado.ts:242` | `position: fixed`, `z-index: 0`, `mask-image` por cuadro | siempre |
| 4 | hijo pinneado | `_secciones/_contrato/Seccion.tsx:213` | `position: sticky` | servicios, todo ancho |
| 5 | `Pieza` | `src/app/v3/motion/_componentes/Pieza.tsx:80,87` | `transform` inline + `will-change: transform` | **todas las piezas animadas, sólo ≥ 1025** |

`page.tsx:47-52` lo declara como decisión de diseño: *«escenario `z-0`, contenido `z-10`»*, y `Panel.tsx:104` lo repite en el nodo: *«`relative z-10`: los paneles van ARRIBA del escenario, que es `z-0`»*.

🔴 **Y el dato que fija el costo de destrabarlo: arriba de 1025 el corte se acerca al texto.** En `numeros`, el cortante más cercano está **a 9–10 saltos** del nodo de texto a 390 (es la `<section>`) y **a 1 salto** a 1440 y 1920 — el `div` de la propia pieza animada, con su `transform` y su `will-change`. Sacar un corte que está a nueve ancestros de distancia es una regla de CSS; sacar el que envuelve al texto es sacar la animación de ese texto.

🔴 **El caso conocido del hero: CONFIRMADO, y no está escrito en el hero.**
`src/app/v3/motion/_componentes/Pieza.tsx:85-89`:

```tsx
// `will-change` solo donde hay transformada. Ponerlo en todo es peor que no
// ponerlo: promueve capas que el compositor después tiene que sostener.
const clases = [className, escribe.transform ? 'will-change-transform' : null]
```

La cadena: `Hero.tsx:226-235` (`CanalDePieza` patrón P1) → `canales.tsx:56` → `coreografia-animada.tsx:200-214` → `Pieza.tsx:64` (`transform: true` porque `yPercent 120→0`) → `Pieza.tsx:87`. La **línea 1** no lo tiene, por decisión declarada (`hero/geometria.ts:136`, `piezasAnimadasDelTitular: 1`).
Y un detalle que importa: **abajo de 1025 la línea 2 no lleva `will-change` ni `transform`** — sale por la rama quieta (`canales.tsx:57`). O sea que a 390 ese cortante no existe, y la cadena igual está cortada: alcanza el `<section>`.

### 1.3 🔴 El discriminador empírico, con control positivo

Una derivación de `getComputedStyle` puede estar mal. La lección de agosto de este repo pide un discriminador empírico antes de creerle. Instrumento: `scripts-blend/b-contraste.ts`, capturas **A** (tinta apagada = el fondo) y **B** (el blend puesto sobre la escena viva). Sobre los píxeles de glifo se comparan dos tintas: la **analítica** (`255 − A`, lo que el blend daría) y la **empírica** (`B`, lo que el navegador pintó).

⚠️ **Y hay un agujero que hubo que tapar.** La primera versión comparaba sobre *todos* los píxeles de glifo y dio un 53 % de coincidencia en el titular del hero a 390 — que leído de apuro parecería «la cadena llega a medias». No lo era: **ahí el fondo es el logo, casi negro**, así que `255 − fondo ≈ 255` y la predicción del blend y el blanco de la cadena cortada **son el mismo número**. La coincidencia se cuenta sólo donde las dos hipótesis predicen distinto (fondo ≥ 55 en sRGB), y el tamaño de ese subconjunto se publica al lado.

| sección | coincidencia · árbol de hoy | coincidencia · cadena destrabada |
|---|---:|---:|
| hero | **0,1 %** | **61,0 %** |
| quienes-somos | 0,0 % | 22,9 % |
| numeros | 2,2 % | 16,5 % |
| trabajos | 2,6 % | 11,6 % |
| servicios | 0,9 % | 0,9 % ← *(sigue cortada: su cortante es `sticky`, no el `z-index`)* |
| tu-panel | 17,6 % | 0,9 % |
| por-que-develop | 0,8 % | **70,8 %** |
| cierre | 1,7 % | **49,5 %** |

**Tres órdenes de magnitud de separación en hero y por-que-develop.** El instrumento es capaz de detectar una cadena intacta y no la detecta en el árbol de hoy: la cadena está cortada, probado en píxeles.

Dos honestidades sobre este número:
- **El techo no es 100 %, es ~70 %.** Los píxeles de borde del glifo tienen cobertura parcial, así que el resultado es una mezcla y `255 − fondo` no vale exacto con la tolerancia de ±8/255. Lo que decide es la separación, no el valor absoluto.
- **`servicios` no se destraba con esta inyección**, y eso confirma `a-cadena`: su cortante es el `position: sticky` de `Seccion.tsx:213`, que una regla de `z-index` no saca.

### 1.4 Qué haría falta para destrabarlo, y cuánto cuesta

A **390** alcanza una inyección de CSS de cinco reglas (es la que se usó para medir, `b-contraste.ts` · `DESTRABAR`):

```css
main { z-index: auto }                    /* le saca el contexto de apilado   */
[data-panel] { z-index: auto }            /* idem, en las 8                   */
[data-v3] { isolation: isolate }          /* pasa a ser la raíz del grupo     */
[data-escena] { z-index: -1 }             /* el canvas pinta DEBAJO del texto */
body { background-color: var(--color-fondo) }   /* el papel se muda acá       */
```

La última no es opcional y es la que revela el costo real: **una capa de `z-index` negativo pinta debajo del fondo de su propio elemento**, y `[data-v3]` lleva `bg-fondo` (`layout.tsx:269-272`, el «piso de papel» de `layout.tsx:81-87`). Sin mudar el papel a `body`, el canvas desaparece entero.

Costo, por ancho:

- **A 390: cinco reglas y mudar el piso de papel un nodo hacia arriba.** Barato en líneas, pero toca la capa de apilamiento del sitio completo — que es la pieza que `page.tsx:47-52` declara como decisión. Y **no alcanza para `servicios`**: ahí habría que sacarle el `sticky`, que es su mecánica de pinneo.
- **A 1440 y 1920: no se destraba con reglas.** Los cortantes de arriba de 1025 son el `transform` inline y el `will-change: transform` que `Pieza.tsx:80,87` pone en **cada pieza animada** — y en `numeros` a 1920 ése es el cortante *más cercano al texto*, antes que la sección. Sacarlos es sacar la coreografía de textos, no inyectar una regla. `Pieza.tsx:87` además tiene su porqué escrito (la capa de composición) y `hero/hero.invariant.tsx:142,153` lo verifica.

---

## 2. PASO 2 — EL CONTRASTE. **Freno declarado, y lo que sí se pudo medir.**

La instrucción dice: *«Si corta en TODAS, FRENÁ Y REPORTÁ: no midas contraste de algo que no puede funcionar.»* **Freno acatado: no se midió el blend empírico como si fuera una opción.** Lo que sigue es lo que se puede publicar sobre el árbol de hoy sin ninguna inyección, más una columna analítica claramente rotulada.

Las tres columnas y su procedencia:

- **SIN BLEND** — `contrasteBajoElGlifoConOpacidad` de `scripts-b8/glifo-alfa.ts`, **importado sin un solo cambio**: misma máscara, mismo umbral de glifo (24, el de B1), misma composición por opacidad. Es el control y es lo que hace comparable esta tabla con las de B8 y B11.
- **BLEND (analítico)** — tinta `255 − fondo` píxel por píxel sobre el mismo fondo medido. Es aritmética exacta sobre la captura **A**; es **lo que el blend daría si la cadena llegara**, y no ocurre hoy.
- **ZONA MUERTA** — píxeles de glifo cuyo fondo cae en sRGB [102, 153]. **No necesita el blend ni el destrabe**: es una propiedad del fondo.

⚠️ **La zona muerta se define en el espacio en que el blend actúa, y no es el de la luminancia.** `mix-blend-mode` opera sobre los valores de color tal como están (sRGB con gamma), canal por canal. El punto fijo está en **127,5 de sRGB**, no en el 50 % de luminancia relativa (que cae en sRGB ≈ 188, donde el blend da un cómodo 5,21:1). La aritmética exacta:

| fondo sRGB | el blend pinta | contraste |
|---:|---:|---:|
| 0 | 255 | 21,000:1 |
| 55 | 200 | 7,115:1 |
| **102** | 153 | **2,015:1** ← borde de la zona muerta |
| **127 / 128** | 128 / 127 | **1,014:1** ← el texto no está |
| **153** | 102 | **2,015:1** ← borde |
| 188 | 67 | 5,210:1 |
| 247 (papel) | 8 | 18,694:1 |

⚠️ **Y esta definición SUBESTIMA el problema, a propósito.** 102–153 es el núcleo, no el borde: sobre la misma fórmula, el blend queda **bajo 4,5:1 con cualquier fondo en sRGB [73, 182]** —el **43,0 %** del rango— y **bajo 3:1 en [88, 167]** —el 31,3 %—, contra el 20,3 % que abarca 102–153. **Toda cifra de «zona muerta» de este reporte es un piso: el fracaso real del blend es más de dos veces más ancho.** Se conserva la definición estrecha porque es la que la instrucción declara.

### 2.1 390 × 844

| sección | bloq | px glifo | SIN peor | SIN p01 | SIN med | SIN <4,5 | SIN <3 | BLEND peor | BLEND <4,5 | BLEND <3 | ZONA MUERTA |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| hero | 4 | 13 112 | 1,00 | 2,14 | 7,99 | 7 437 (56,7 %) | 7 408 (56,5 %) | 1,01 | **111 (0,8 %)** | 79 (0,6 %) | 63 (0,5 %) |
| quienes-somos | 3 | 12 286 | 1,00 | 1,24 | 8,17 | 4 729 (38,5 %) | 4 701 (38,3 %) | 1,01 | **279 (2,3 %)** | 177 (1,4 %) | 117 (1,0 %) |
| servicios | 120 | 62 780 | 1,00 | 13,73 | 16,30 | 3 636 (5,8 %) | 3 004 (4,8 %) | 1,00 | 2 440 (3,9 %) | 1 704 (2,7 %) | 1 004 (1,6 %) |
| por-que-develop | 9 | 38 836 | 1,00 | 1,34 | 3,44 | 25 715 (66,2 %) | 17 057 (43,9 %) | 1,00 | 22 154 (57,0 %) | 20 136 (51,8 %) | **18 061 (46,5 %)** |
| trabajos | 8 | 14 640 | 1,00 | 2,27 | 2,95 | 11 525 (78,7 %) | 11 341 (77,5 %) | 1,00 | **2 477 (16,9 %)** | 524 (3,6 %) | 305 (2,1 %) |
| numeros | 5 | 13 435 | 1,00 | 1,67 | 5,83 | 6 468 (48,1 %) | 6 040 (45,0 %) | 1,01 | **1 444 (10,7 %)** | 1 122 (8,4 %) | 627 (4,7 %) |
| tu-panel | 8 | 39 821 | 1,01 | 6,12 | 12,11 | 5 320 (13,4 %) | 3 711 (9,3 %) | 1,01 | 5 389 (13,5 %) | 3 714 (9,3 %) | 2 007 (5,0 %) |
| cierre | 39 | 24 890 | 1,00 | 3,73 | 6,42 | 4 105 (16,5 %) | 3 213 (12,9 %) | 1,01 | **15 769 (63,4 %)** ↑ | 13 976 (56,2 %) | 6 131 (24,6 %) |

### 2.2 1440 × 900

| sección | bloq | px glifo | SIN peor | SIN p01 | SIN med | SIN <4,5 | SIN <3 | BLEND peor | BLEND <4,5 | BLEND <3 | ZONA MUERTA |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| hero | 4 | 25 228 | 2,68 | 12,70 | 14,80 | 116 (0,5 %) | 7 (0,0 %) | 1,01 | 244 (1,0 %) ↑ | 233 (0,9 %) | 186 (0,7 %) |
| quienes-somos | 6 | 19 851 | 2,56 | 7,62 | 13,98 | 134 (0,7 %) | 64 (0,3 %) | 1,01 | 793 (4,0 %) ↑ | 476 (2,4 %) | 98 (0,5 %) |
| servicios | 52 | 34 097 | 1,00 | 10,41 | 12,84 | 9 906 (29,1 %) | 9 443 (27,7 %) | 1,01 | **3 226 (9,5 %)** | 1 762 (5,2 %) | 1 149 (3,4 %) |
| por-que-develop | 24 | 105 292 | 1,03 | 3,17 | 5,81 | 33 495 (31,8 %) | 1 070 (1,0 %) | 1,00 | **98 511 (93,6 %)** ↑ | 93 022 (88,3 %) | **46 750 (44,4 %)** |
| trabajos | 3 | 1 827 | 6,65 | 12,98 | 12,98 | **0 (0,0 %)** | 0 (0,0 %) | 3,32 | **808 (44,2 %)** ↑ | 0 (0,0 %) | 0 (0,0 %) |
| numeros | 2 | 11 486 | 2,41 | 4,93 | 13,54 | 66 (0,6 %) | 33 (0,3 %) | 1,01 | 1 361 (11,8 %) ↑ | 633 (5,5 %) | 186 (1,6 %) |
| tu-panel | 18 | 81 273 | 1,00 | 11,75 | 14,22 | 4 465 (5,5 %) | 3 499 (4,3 %) | 1,01 | 4 178 (5,1 %) | 2 295 (2,8 %) | 825 (1,0 %) |
| cierre | 24 | 26 077 | 2,41 | 5,04 | 7,29 | 1 808 (6,9 %) | 26 (0,1 %) | 1,01 | **19 778 (75,8 %)** ↑ | 16 366 (62,8 %) | 5 823 (22,3 %) |

### 2.3 1920 × 1080

| sección | bloq | px glifo | SIN peor | SIN p01 | SIN med | SIN <4,5 | SIN <3 | BLEND peor | BLEND <4,5 | BLEND <3 | ZONA MUERTA |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| hero | 4 | 33 101 | 3,38 | 13,66 | 14,90 | 102 (0,3 %) | 0 (0,0 %) | 1,01 | 183 (0,6 %) ↑ | 170 (0,5 %) | 149 (0,5 %) |
| quienes-somos | 7 | 24 847 | 2,52 | 9,93 | 14,07 | 111 (0,4 %) | 57 (0,2 %) | 1,01 | 449 (1,8 %) ↑ | 274 (1,1 %) | 98 (0,4 %) |
| servicios | 52 | 39 831 | 1,01 | 11,52 | 13,62 | 9 692 (24,3 %) | 9 226 (23,2 %) | 1,01 | **3 145 (7,9 %)** | 1 689 (4,2 %) | 419 (1,1 %) |
| por-que-develop | 23 | 116 348 | 1,03 | 3,13 | 5,91 | 30 615 (26,3 %) | 1 157 (1,0 %) | 1,01 | **107 906 (92,7 %)** ↑ | 102 736 (88,3 %) | **48 591 (41,8 %)** |
| trabajos | 3 | 1 885 | 6,65 | 13,12 | 13,12 | **0 (0,0 %)** | 0 (0,0 %) | 3,32 | **810 (43,0 %)** ↑ | 0 (0,0 %) | 0 (0,0 %) |
| numeros | 2 | 12 852 | 2,60 | 4,28 | 12,94 | 128 (1,0 %) | 61 (0,5 %) | 1,01 | 1 759 (13,7 %) ↑ | 792 (6,2 %) | 184 (1,4 %) |
| tu-panel | 18 | 91 075 | 1,02 | 12,42 | 14,60 | 4 575 (5,0 %) | 3 693 (4,1 %) | 1,01 | 4 210 (4,6 %) | 2 216 (2,4 %) | 819 (0,9 %) |
| cierre | 25 | 29 218 | 2,19 | 4,53 | 7,25 | 1 571 (5,4 %) | 236 (0,8 %) | 1,01 | **22 106 (75,7 %)** ↑ | 19 810 (67,8 %) | 6 325 (21,6 %) |

### 2.4 🔴 La columna analítica es OPTIMISTA, y cuánto

La corrida destrabada a 390 permite contrastar la proyección analítica contra lo que el navegador **pintó de verdad**. Hay que hacerlo antes de recomendar nada sobre ella:

| sección | coincidencia (¿se destrabó?) | BLEND analítico <4,5 | BLEND **pintado** <4,5 | diferencia |
|---|---:|---:|---:|---:|
| **por-que-develop** | **70,8 %** ✓ | 57,1 % | **65,0 %** | +7,9 pp |
| **hero** | **61,0 %** ✓ | 0,9 % | **10,8 %** | +9,9 pp |
| **cierre** | **49,5 %** ✓ | 63,5 % | **73,7 %** | +10,1 pp |
| quienes-somos | 22,9 % ~ | 2,8 % | 29,6 % | +26,8 pp |
| numeros | 16,5 % ~ | 11,0 % | 50,5 % | +39,6 pp |
| trabajos | 11,6 % ~ | 16,6 % | 64,4 % | +47,8 pp |
| servicios | 0,9 % ✗ | 3,9 % | 98,9 % | +95,0 pp |
| tu-panel | 0,9 % ✗ | 19,4 % | 100,0 % | +80,6 pp |

**Dos cosas, y las dos importan:**

1. **Donde la cadena sí llegó (las tres primeras), lo pintado es peor que lo proyectado por 7,9–10,1 pp, de forma consistente.** La causa es el antialias: en el borde de un glifo la cobertura es parcial, así que el resultado del blend es una mezcla que cae más cerca del fondo y el contraste baja. **La columna «BLEND (analítico)» de §2.1–2.3 es un techo, no una estimación: hay que sumarle ~8–10 pp.**
2. **Donde la cadena NO se destrabó (`servicios`, `tu-panel`: coincidencia 0,9 %), la columna «pintado» no mide un blend** — mide el blanco sobre blanco de la cadena cortada, y por eso da 98,9 % y 100,0 %. No es un resultado del blend: es la falla que §1.3 ya probó.

⇒ En §7 los veredictos de **hero, por-que-develop y cierre** se dan con la cifra **pintada y validada**; los demás quedan como proyección con su sesgo declarado.

### 2.5 Lo que la comparación dice, que es lo que vale

**El estado de HOY reencuadra el sprint entero.** A 1440 y 1920 el texto **ya está bien** en cinco de las ocho: hero 0,3–0,5 %, quienes-somos 0,4–0,7 %, numeros 0,6–1,0 %, trabajos **0,0 %**, tu-panel 5,0–5,5 % de píxeles bajo AA. Eso **reproduce a B11**, que midió el hero en 2,56–2,94:1 con 6–20 px de 10 191 bajo AA y cerró cuatro deudas del logo por estructura (0 % del tramo en los tres anchos) — el instrumento de este sprint da 2,68:1 a 1440 y 3,38:1 a 1920 sobre las mismas cajas.

**A 390 es lo contrario, y ahí la premisa de la instrucción es correcta.** hero 56,7 %, trabajos 78,7 %, por-que-develop 66,2 %, numeros 48,1 %, quienes-somos 38,5 % de píxeles de glifo bajo 4,5:1, con peor 1,00:1 en las ocho. La causa es la que el registro nombra: **el logo detrás del texto**. El fondo mediano bajo el titular del hero a 390 es **1 sobre 255** — o sea tinta #111111 sobre negro. Y es estructural: **B11 arregló esto moviendo el texto, y la coreografía de textos no baja de 1025** (`canales.tsx:57`), así que su arreglo no llega a 390 mientras la escena sí (§6).

---

## 3. PASO 3 — DÓNDE ESTÁN LOS GRISES MEDIOS

Instrumento: `scripts-blend/c-zona-muerta.ts`. Independiente del texto. Dos fondos por cuadro: **S** (la sala desnuda, todo oculto menos `[data-escena]`) y **F** (el cuadro compuesto con la tinta apagada — el fondo que el texto realmente tiene detrás, que incluye lo que las superficies opacas tapan).

Fracción del cuadro en la zona muerta, en los siete keyframes:

| keyframe | p | secciones en cuadro | 390 sala / fondo real | 1440 sala / fondo real | 1920 sala / fondo real |
|---|---:|---|---:|---:|---:|
| hero | 0,0000 | hero | 2,9 % / 2,8 % | 1,4 % / 1,2 % | 1,4 % / 1,2 % |
| quiénes somos | 0,3750 | numeros | 1,4 % / 1,5 % | 2,5 % / 2,4 % | 2,5 % / 2,4 % |
| números | 0,5000 | trabajos | 1,4 % / 1,6 % | 0,5 % / 0,3 % | 0,4 % / 0,1 % |
| trabajos | 0,6250 | servicios | **73,2 % / 0,6 %** | 0,0 % / 1,6 % | 0,0 % / 1,2 % |
| demos | 0,7500 | tu-panel + por-que-develop | 38,2 % / **37,4 %** | 10,5 % / 10,4 % | 10,6 % / 10,4 % |
| cierre | 0,9500 | por-que-develop + cierre | 37,6 % / **36,2 %** | 50,1 % / **47,5 %** | 50,7 % / **49,0 %** |
| cierre · sostén | 1,0000 | cierre | 36,5 % / **29,7 %** | 49,7 % / **46,6 %** | 49,4 % / **47,0 %** |

Tres lecturas, y las tres cambian la decisión:

**a) El problema es localizado, no uniforme.** En los primeros cuatro keyframes la zona muerta es **0,1–2,9 %**. En los últimos tres sube a **10,4–49,0 %**. Los grises medios viven al final del recorrido — exactamente donde están las deudas abiertas: `por-que-develop` (D-B8.3, re-escrita por B11 como **D-B5.1, un problema de luz**: *«la estructura que falla es la pared de la sala a nivel 0,643, no el logo»*) y `cierre` (D-B8.4).

**b) 🔴 No hay escape horizontal.** La fracción de zona muerta **en la banda donde vive la columna de texto** es igual a la del cuadro entero, en todos los keyframes y los tres anchos (1440 · cierre: 47,5 % cuadro contra 47,2 % banda; 1920 · cierre: 49,0 % contra 48,7 %). Los grises medios están repartidos parejo a lo ancho: **ninguna posición horizontal de la columna los evita.**

**c) La diferencia entre S y F es información, no ruido.** A 390 en el keyframe `trabajos` la sala tiene **73,2 %** de zona muerta y el fondo real **0,6 %**: ahí está `servicios`, que es `papel-opaco` y tapa la sala entera. Publicar sólo la sala habría sobrestimado el problema por 122×.

Capturas con la zona muerta pintada de magenta y la banda de la columna marcada en verde — 63 archivos, tres por cuadro por ancho:
`docs/rediseno/capturas/blend/zm-{390,1440,1920}-<keyframe>-{sala,fondo-real,sobre-lo-que-se-ve}.png`

---

## 4. PASO 4 — LA ALTERNATIVA: separación vertical, con la misma vara

Instrumento: `scripts-blend/d-separacion.ts`, a 390. La tinta del logo sale de `siluetaMasGrande` con **los umbrales que B5 publicó y B8 y B11 heredaron sin tocar** (`TINTA_MAXIMA = 60`, `AREA_MINIMA_DEL_LOGO = 5000`), sobre la captura de la sala desnuda. **Nada se aplicó.**

| sección | poses | tinta del logo (% del alto) | cajas que comparten banda | movimiento por caja | **la columna entera** |
|---|---:|---:|---:|---:|---|
| hero | 1 | 37,2 % | 5/5 | 50,4–151,0 px | **280,61 px abajo ✓** |
| quienes-somos | 1 | 45,6 % | 7/8 | 20,0–163,4 px | **no entra** |
| numeros | 2 | 58,9–59,0 % | 5/11 | 152,8–254,8 px | **no entra** |
| trabajos | 2 | 35,8–47,3 % | 6/12 | 18,8–135,3 px | **no entra** |
| servicios | 2 | 37,0 % | 50/60 | 2,9–151,1 px | **no entra** |
| tu-panel | 2 | 40,1–53,1 % | 14/25 | 12,2–226,5 px | **no entra** |
| por-que-develop | 2 | 28,1–49,9 % | 15/26 | 5,7–204,1 px | **no entra** |
| cierre | 2 | 28,1–28,2 % | 15/43 | 1,6–115,6 px | **no entra** |

**La tinta ocupa el 28,1–59,0 % del alto: la cifra de la instrucción (27–58 %) se confirma. La conclusión que sacaba de ella, no.** «Hay lugar» es cierto para *un renglón* y falso para *una columna*: a 390 el hueco libre arriba o abajo de la tinta es de 145–444 px, y la columna de texto de estas secciones es más alta. Sólo el hero entra.

Lo que sí es barato: **mover cajas individuales**. Los mínimos por sección son 1,6 · 2,9 · 5,7 · 12,2 · 18,8 · 20,0 px — movimientos que nadie nota. Es la palanca que B11 ya usó a escritorio, y ahí pagó su precio con número: la foto de Quiénes somos *«vuelve al ancho que B1 descartó y reabre ~310 px de hueco»*, Números *«perdió la amplitud, de 1.220 a 594 px a 1440»*. Este banco publica el desplazamiento y el lugar disponible; **si el diseño lo tolera no lo decide una medición.**

---

## 5. PASO 5 — LAS DOS PREGUNTAS DE MOVIL-1

Instrumento: `scripts-blend/e-fps.ts`, 4 repeticiones, 390×844.

### 5.1 (a) Por qué el banco de MOVIL-1 no discriminaba, y qué lo arregla

Medía **fps con el vsync puesto**. El monitor va a 75 Hz, así que mientras la escena tenga cualquier holgura el navegador entrega 75 cuadros y ni uno más: todo dio 74,9x. **El techo del instrumento estaba debajo del piso de la diferencia.**

El arreglo es sacar el techo: `--disable-gpu-vsync` + `--disable-frame-rate-limit`. **Base: 1 325,5 fps** (0,754 ms/cuadro) contra los 74,9 de MOVIL-1. El desacople es real y se comprueba antes de creerle una comparación.

| configuración | dpr | lienzo | fps | ms/cuadro | p95 ms | contra base |
|---|---:|---:|---:|---:|---:|---:|
| base | 3 | ×1,00 | 1 325,5 | 0,754 | 2,10 | — |
| dpr-1 | 1 | ×1,00 | 1 246,4 | 0,802 | 3,50 | −6,0 % |
| sin-escena | 3 | ×1,00 | 1 359,2 | 0,736 | 1,60 | +2,5 % |
| blur-8 | 3 | ×1,00 | 1 345,3 | 0,743 | 1,90 | +1,5 % |
| blur-64 | 3 | ×1,00 | 1 375,6 | 0,727 | 2,10 | +3,8 % |
| blend-trabado | 3 | ×1,00 | 1 358,2 | 0,736 | 2,00 | +2,5 % |
| destrabado | 3 | ×1,00 | 1 366,3 | 0,732 | 2,20 | +3,1 % |
| **blend-destrabado** (289 nodos) | 3 | ×1,00 | **863,6** | **1,158** | 2,00 | **−34,8 %** |
| **blend-un-nodo** (1 nodo, pantalla completa) | 3 | ×1,00 | 1 320,8 | 0,757 | 2,00 | **−0,4 %** |

**El veredicto del instrumento es partido, y decirlo entero es el resultado:**

1. ✅ **rAF desacoplado**: 1 325,5 fps > 90.
2. ❌ **Control graduado de relleno de GPU: FALLA.** `blur(8px)` y `blur(64px)` a pantalla completa dan +1,5 % y +3,8 % — indistinguibles de la base y del ruido. Con el vsync apagado, el intervalo de rAF mide **cuán rápido el hilo principal puede dar la vuelta**, no cuánto tarda la GPU, que trabaja asíncrona. **Este instrumento es ciego al relleno de GPU.**
3. ✅ **Separación contra su propio ruido: PASA.** La diferencia del blend es **34,8 %** contra una dispersión de **3,8 %** entre las filas sin blend (que miden la misma página). 9× el ruido, en 4 repeticiones consistentes (808–864 fps).

⇒ **Sirve para esta comparación y no para relleno de GPU: mide ritmo del hilo principal.** Una pregunta de relleno de GPU necesita otro instrumento — y eso queda abierto, con su motivo.

⚠️ **Y un recibo que corrige a MOVIL-1:** el control de `dpr` no falló, **es imposible a 390**. `lienzo ×1,00` en las dos ramas, porque el producto ya clava `dpr: [1, 1]` en la calidad compacta (`_lib/escena/ajustes.ts:183`). La primera corrida de este banco lo usó como control y comparó un número contra sí mismo — «verde por arnés» exacto. La fila queda en la tabla como recibo de que no varía nada.

### 5.2 (b) El costo del blend — y la premisa de la instrucción, refutada

| | fps | ms/cuadro |
|---|---:|---:|
| destrabado SIN blend | 1 366,3 | 0,73 |
| destrabado CON blend (289 nodos) | 863,6 | 1,16 |
| **diferencia** | **−36,8 %** | **+0,426 ms/cuadro** |

🔴 **Pero el costo es POR NODO, no por área — y eso refuta la premisa.** La instrucción dice: *«Un blend sobre un canvas vivo obliga al compositor a releer el fondo cada cuadro.»* El discriminador: **un solo nodo con `mix-blend-mode: difference` cubriendo el cuadro entero sobre el canvas vivo cuesta −0,4 %** — nada, con el área máxima posible. Los 289 bloques de texto cuestan −36,8 % con un área mucho menor.

Releer el fondo es gratis. Lo que cuesta son **289 superficies de render y 289 arranques de grupo de mezcla.** Es una distinción con consecuencia: el costo de un blend en este sitio escala con **cuántos elementos** lo lleven, no con cuánta pantalla cubran.

Y el otro número, para que no se confunda: **el blend que hoy se podría poner** (con la cadena cortada, mezclando contra un grupo estático) cuesta **−2,5 %**. Barato, y también inútil: es el que pinta blanco sobre blanco.

---

## 6. PASO 6 — LA PREMISA FALSA, Y QUÉ SE DECIDIÓ SOBRE ELLA

**La línea no está en `PorQueDevelop.tsx:249`: está en `PorQueDevelop.tsx:271-272`**, y el comentario completo va de la 257 a la 272. El cierre textual:

> `A `tablet` ya caía en la tercera por auto-colocación (el `ul` ocupa dos), y abajo de 1025 no hay escena: la variante es de escritorio y nada más.`

**Está refutada por el propio repo, en tres lugares, y la línea no se actualizó:**

| archivo:línea | qué dice hoy |
|---|---|
| `_componentes/EscenarioCompuerta.tsx:22-23` | *«escena de fondo en todos los anchos, animaciones de texto sólo arriba de 1025»* — y `:26`: *«Se monta siempre. No hay `return null`»* |
| `_lib/compuerta.ts:55-58` | *«**«Abajo de 1025: sin canvas y sin coreografía» — LA PRIMERA MITAD YA NO VALE.** Desde MOVIL-1 abajo del umbral HAY canvas, en calidad `compacta`»* |
| `_lib/escena/EscenaDelHome.tsx:44-52` | la misma corrección |

🔴 **Y hay una segunda copia de la premisa vieja**, fuera de esta sección: `_secciones/quienes-somos/QuienesSomos.tsx:262` — *«Abajo de 1025 no hay escena y sigue a la izquierda.»* Igualmente obsoleta, y sostiene la decisión de mandar el epígrafe a la derecha desde 1025.

### 6.1 Qué decisiones se tomaron sobre la premisa falsa

**Toda la maquinaria `escritorio:` de `por-que-develop/` son exactamente dos apariciones** (grep completo de la carpeta; no hay ninguna en `Diferenciales.tsx`, `contenido.ts`, `soporte.ts` ni en el invariante):

| # | línea | qué hace | se decidió sobre la premisa |
|---|---|---|---|
| 1 | `PorQueDevelop.tsx:243` | `escritorio:col-span-1 escritorio:grid-cols-1` en el `<ul>` de las 4 tarjetas | **No.** Es ritmo de grilla (de 2 columnas en tablet a 1 en escritorio), sin motivo de escena escrito. |
| 2 | `PorQueDevelop.tsx:278` | `escritorio:col-start-3 escritorio:self-end` — el testimonio a la 3.ª columna | **SÍ, y es la que hay que rever.** |

**La #2 es anti-superposición pura, y su razón entera es la escena.** El comentario declara el número: en la columna 2 a 1440 *«la escena pone el logo debajo del texto y cuatro franjas de 40 px caen en 1,10 · 1,97 · 1,10 · 4,22:1; la columna 3, que estaba vacía, no tiene ninguna»*. El arreglo es correcto **y sólo existe arriba de 1025**. Abajo del umbral el testimonio vuelve a la auto-colocación, con la escena presente y sin ninguna protección.

**Lo que hay que rever, como insumo del sprint que la arregle:**

1. La cláusula *«abajo de 1025 no hay escena»* es falsa desde MOVIL-1. **La conclusión que sostiene —«la variante es de escritorio y nada más»— ya no se sigue de su premisa.** No quiere decir que la variante esté mal: quiere decir que abajo de 1025 **no se evaluó**.
2. Este sprint pone la cifra de lo que quedó sin evaluar: **`por-que-develop` a 390 es la peor de las ocho**, 66,2 % del glifo bajo 4,5:1, peor 1,00:1, y **46,5 % de sus píxeles de glifo en la zona muerta** (§2.1). Es además la sección con el único 🔴 de superposición a 390 que la instrucción cita.
3. La misma revisión le cabe a `QuienesSomos.tsx:262` y a su decisión del epígrafe.

**No se arregló nada.** Cero producto.

---

## 7. PASO 7 — LA RECOMENDACIÓN

## ⇒ **(B) El blend sirve en algunas y falla en otras. Y el corte no es por sección: es por ANCHO y por ZONA MUERTA.**

La regla que sale de los números (§0, r = 0,686 contra 0,222 del control), y que decide caso por caso:

> **El blend sirve cuando (1) la tinta de hoy ya está fallando y (2) la zona muerta bajo el glifo es menor al 10 %. Falla en todo lo demás — y donde falla, falla peor que la tinta.**

### 7.1 A 390 · las TRES secciones con cifra validada (blend pintado, no proyectado)

| sección | hoy, bajo 4,5:1 | con blend, **pintado** | zona muerta | veredicto |
|---|---:|---:|---:|---|
| **hero** | 56,7 % | **10,8 %** | 0,5 % | **SIRVE** — 5,2× mejor |
| **por-que-develop** | 66,2 % | **65,0 %** | **46,5 %** | **NO CAMBIA NADA** — 1,02× |
| **cierre** | 16,5 % | **73,7 %** | 24,6 % | 🔴 **DESTRUYE** — 4,5× peor |

Éstas son las tres donde la inyección de destrabe funcionó de verdad (coincidencia 49,5–70,8 %, §2.4) y donde la cifra sale de píxeles pintados por el navegador, no de una cuenta.

### 7.2 A 390 · las otras cinco, como proyección con su sesgo declarado

Súmenle **~8–10 pp** a la columna del blend (§2.4):

| sección | hoy | blend (proyectado) | zona muerta | veredicto probable |
|---|---:|---:|---:|---|
| trabajos | 78,7 % | 16,9 % → ~25–27 % | 2,1 % | sirve — ~3× mejor |
| numeros | 48,1 % | 10,7 % → ~19–21 % | 4,7 % | sirve — ~2,4× mejor |
| quienes-somos | 38,5 % | 2,3 % → ~10–12 % | 1,0 % | sirve — ~3,5× mejor |
| servicios | 5,8 % | 3,9 % → ~12–14 % | 1,6 % | empeora — y no se destraba (su corte es `sticky`) |
| tu-panel | 13,4 % | 13,5 % → ~22–24 % | 5,0 % | empeora |

### 7.3 A 1440 y 1920 · el blend FALLA en seis de ocho, y ahí es la respuesta (C)

| sección | hoy (1440) | con blend | veredicto |
|---|---:|---:|---|
| **trabajos** | **0,0 %** | **44,2 %** | 🔴 **la cifra que lo mata: destruye una sección que hoy es perfecta.** |
| **por-que-develop** | 31,8 % | **93,6 %** | destruye |
| **cierre** | 6,9 % | **75,8 %** | destruye |
| numeros | 0,6 % | 11,8 % | empeora 20× |
| quienes-somos | 0,7 % | 4,0 % | empeora 5,7× |
| hero | 0,5 % | 1,0 % | empeora 2× |
| servicios | 29,1 % | **9,5 %** | sirve — 3,1× mejor |
| tu-panel | 5,5 % | 5,1 % | neutro |

1920 reproduce el patrón (trabajos 0,0 → 43,0 %; por-que-develop 26,3 → 92,7 %; cierre 5,4 → 75,7 %). Y estas cifras son **techos**: con el sesgo del antialias de §2.4 son peores.

⚠️ A 1440/1920 no hay cifra pintada y **no puede haberla**: el destrabe por inyección no vale arriba de 1025 (los cortantes son el `transform` de cada pieza animada, §1.4). Toda esta tabla es proyección analítica, y su sesgo apunta en contra del blend, no a favor.

**Por qué a escritorio la respuesta se invierte:** no hay nada que ganar. B11 ya cerró las deudas del logo por estructura y el texto está en 0,0–0,7 % bajo AA en cinco de las ocho. Con la tinta ya bien, el blend sólo puede **agregar** sus fracasos de zona muerta. Y donde la zona muerta es grande (`por-que-develop` 44,4 %, `cierre` 22,3 % — la pared de la sala y el atardecer, o sea **D-B5.1 y D-B8.4**, las dos deudas que B11 dejó abiertas *como problema de luz*), los agrega a lo grande.

### 7.4 Lo que esto implica para la decisión, sin proponer producto

1. **El blend no se puede probar hoy.** Destrabar la cadena a 390 son cinco reglas de CSS más mudar el piso de papel un nodo hacia arriba, y no alcanza para `servicios`. A 1440/1920 no se destraba con reglas: los cortantes son el `transform` de cada pieza animada, o sea la coreografía (§1.4).
2. **Aunque se destrabara, no es una solución de familia: es por sección y por ancho.** Aplicarlo donde sirve implica una condición por sección **y** por ancho, y la condición no es una opinión: es la zona muerta, que se mide.
3. **El costo es 0,426 ms/cuadro (−36,8 % del ritmo) y escala por cantidad de nodos**, no por área (§5.2).
4. **La alternativa vertical no cubre la familia tampoco:** la columna entera no entra en 7 de 8 a 390 (§4). Lo que sí es barato es mover cajas individuales, 1,6–20 px en los mínimos.
5. 🔴 **Los dos peores casos —`por-que-develop` y `cierre`— no los arregla ninguna de las dos salidas, y de los dos hay cifra pintada.** `por-que-develop` pasa de 66,2 % a **65,0 %**: el blend no mueve la aguja. El `cierre` pasa de 16,5 % a **73,7 %**: la empeora 4,5×. Su problema no es el logo detrás del texto: es que **la mitad del fondo es gris medio** (46,5 % y 24,6 % de sus glifos en la zona muerta), y eso es lo que B11 ya había escrito al re-escribir D-B8.3 como **D-B5.1**: *«la estructura que falla es la pared de la sala a nivel 0,643, no el logo»*, *«con la luz, y lo decide el humano»*. Este sprint lo confirma desde otro ángulo y con otra vara: **el blend, que es la salida que se estaba evaluando, fracasa exactamente ahí y por la misma causa.**

*(Halo, contorno y placa aparecieron en el análisis como las salidas que sí funcionarían en la zona muerta. No se proponen: el dueño ya vetó el brillo del CTA por la misma razón y el sistema no tiene ese efecto.)*

---

## 8. NOTAS DE MÉTODO Y LÍMITES

**El barrido es por keyframe, no por tramo.** La instrucción pide *«cada keyframe que la cubra»*, así que cada sección se mide en su arranque más los keyframes que caen en su rango: 1–2 poses. B8 y B11 barrieron el tramo entero en pasos de media pantalla (33–81 paradas por sección). **El «peor» de estas tablas es el peor de estas poses, no del tramo**, así que es un piso y no un techo. Se ve en `trabajos` a 1440: 3 bloques en cuadro acá contra los 9 que midió B11.

**Las poses se deduplican por `y`.** El arranque de una sección y un keyframe pueden caer en el mismo píxel de scroll (hero: los dos en y=0; cierre a 1440: los dos en y=15300). Sin deduplicar, esa sección duplicaba sus píxeles de glifo en todos los agregados.

**Las marcas de bloque se borran antes de cada lectura.** `LECTOR_DE_BLOQUES` pone `data-b8-bloque` y no lo saca; leyendo varias secciones en la misma pose las marcas se acumulan y un bloque de otra sección que todavía asoma se le atribuiría a ésta.

**La CUENTA de lecturas varía entre corridas, el veredicto no.** El lector salta los bloques que están a opacidad cero, así que cuántos bloques hay en cuadro depende de dónde llegó el revelado (`whileInView`) en el instante de la captura — a 390 dio 214 en una corrida y 201 en la siguiente. Se publica la de `a-cadena.json`, que es la reproducible. **Lo que no se movió en ninguna corrida es la fracción: 100 % cortadas.**

**El chequeo de «página entera» de B5 no vale a 390, y se reemplazó sin aflojarlo.** `verificarQueLaPaginaEstaEntera` detecta «se pintó sin CSS» exigiendo ocho paneles con altos múltiplos exactos del viewport. Arriba de 1025 es correcto; a 390 el contenido no entra en 844 px y los altos medidos son 3396, 2784, 2913, 2199, 1253 y 1091 — ninguno múltiplo. La mitad geométrica se conserva sólo donde vale (`perfil.debajoDelUmbral`) y en su lugar entran dos comprobaciones independientes del viewport: que `--color-fondo` resuelva y que la familia tipográfica no sea la serif de defecto (que es el síntoma exacto que B5 vio).

**Se tocó un archivo de instrumento fuera del banco:** `scripts-b4/cdp.ts` gana un parámetro `banderasExtra?: readonly string[]`, **aditivo y por defecto vacío** — ninguna corrida existente cambia. Existía la alternativa de copiar `lanzarChrome` a `scripts-blend/`, y este repo ya tiene el instrumento del contraste por triplicado con su número de deuda (**D-B11.5**): no se agregó otro.

**Defectos propios del instrumento, encontrados y corregidos durante el sprint** (quedan escritos porque los tres eran «verde por arnés» en potencia):
1. El discriminador contaba coincidencias donde las dos hipótesis predicen lo mismo (fondo casi negro) → acotado al subconjunto que discrimina.
2. El control de compositor creaba el velo y dejaba su CSS en una constante que nunca se inyectaba → un «control positivo» que no desenfocaba nada.
3. El control de `dpr` comparaba un número contra sí mismo (`lienzo ×1,00` en las dos ramas) → reclasificado como recibo, reemplazado por un control graduado.

**Lo que este banco no compra:** la GPU de un teléfono, su térmica ni WebKit. Abajo corre Blink sobre la GPU de esta máquina; se mide **cuánto cambia el costo entre dos configuraciones sobre el mismo hardware**.

---

## 9. EL BANCO

| archivo | qué hace |
|---|---|
| `scripts-blend/blend-comun.ts` | plomería, la ventana de 390, `ZONA_MUERTA`, el blend inyectado, la inversa del recorrido (`scrollDelProgreso`) |
| `scripts-blend/a-cadena.ts` | **PASO 1** — la cadena de apilamiento, derivada de `getComputedStyle` |
| `scripts-blend/b-contraste.ts` | **PASOS 1.3 y 2** — el discriminador empírico con control positivo, y las tablas de contraste |
| `scripts-blend/c-zona-muerta.ts` | **PASO 3** — el mapa de grises medios y las capturas pintadas |
| `scripts-blend/d-separacion.ts` | **PASO 4** — cuánto habría que mover, y si entra |
| `scripts-blend/e-fps.ts` | **PASO 5** — el instrumento de costo y el costo del blend |

Reusado sin modificar: `contrasteBajoElGlifoConOpacidad`, `mascaraDeGlifo` y `siluetaMasGrande` (`scripts-b8/glifo-alfa.ts`, umbral de glifo 24 de B1); los lectores de bloques, paneles y el apagado de tinta (`scripts-b8/lectores.ts`); el ocultamiento por capas (`scripts-b8/ocultar.ts`); `luminancia`/`contraste`/`AA_*` (`scripts-b4/color.ts`); `codificarPngRgba` (`scripts-b4/png.ts`, segundo uso); la captura, los perfiles y el puente de automatización (`scripts-b4/`, `scripts-b5/`).

---

## 10. VERIFICACIÓN POST-SPRINT

| puerta | resultado |
|---|---|
| `npx tsc --noEmit` | ✅ **exit 0** — la puerta real de tipos (`next build` ignora tipos y lint, por la nota del repo) |
| `npx prisma migrate status` | ✅ 86 migraciones, *«Database schema is up to date!»* |
| `npm run build` | ⚠️ **falla por diseño, y es estado preexistente** — ver abajo |
| build real (vía sancionada) | ✅ **exit 0** · *«Compiled successfully in 2.2min»* · 42/42 páginas estáticas |

**Sobre el build.** `npm run build` a secas falla en el `prebuild`: `CONTENIDO_INVENTADO` está en `true` (`_secciones/_contrato/llave.ts:79`) y el guardián de B12 (`scripts/llave-contenido-inventado.mjs`) corta el build de producción a propósito. **Es anterior a este sprint y ajeno a él.** Se corrió por la vía que el propio guardián declara:

```
NODE_OPTIONS="--max-old-space-size=4096" MEDIR_CON_LA_LLAVE_PRENDIDA=1 E2E_DIST_DIR=.next-b8 npm run build
```

Dos cosas de esa línea, las dos aprendidas fallando en esta sesión:
- **`NODE_OPTIONS` no es opcional.** Sin él el build muere en `FATAL ERROR: Reached heap limit` a los ~2 GB. El valor es el que `netlify.toml:7` fija para el deploy, así que es la configuración real y no un número inventado.
- **`E2E_DIST_DIR=.next-b8` y no un nombre nuevo.** `.next-b8` ya está en `.gitignore`; un `distDir` alternativo **fuera** de `.gitignore` envenena la auto-detección de fuentes de Tailwind 4 y rompe rutas sanas con un error que apunta a un archivo correcto (lección de agosto). Se eligió uno ya ignorado en vez de agregar otro.

**Estado del árbol.** Lo único que este sprint modificó fuera de sus propias carpetas es `scripts-b4/cdp.ts` (un parámetro opcional, §8). Los nueve archivos de `src/` que `git status` muestra modificados y los tres sin trackear **ya estaban así al abrir la sesión** (son de MOVIL-1, sin commitear). **Ni uno fue tocado acá.**

---

🛑 **PARADA. Nada commiteado. Cero producto: la página quedó byte-idéntica.**

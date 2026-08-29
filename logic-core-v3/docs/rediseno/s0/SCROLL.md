# Coreografía de scroll en runtime

**Fuente:** https://www.nk.studio/ / /studio/ / /work/ / /services/ / /work/pomelo/ / /news/  
**Fecha de medición:** 2026-08-22 (UTC)  
**Herramientas:** Chrome vía MCP `chrome-devtools`, lectura de objetos vivos en memoria. Sin descargar ni versionar bundles.  
**Estado:** borrador

Salidas crudas: `raw/scroll/<slug>-<ancho>.json` (12) y `raw/scroll/<slug>-1440-rm.json` (6).

---

## 0. Cómo se leyó, y por qué importa

**GSAP no esta expuesto como global [medido].** `typeof gsap` y `typeof ScrollTrigger`
devuelven `undefined` en las seis URLs. Lo que `window` si expone es indirecto:
`gsapVersions` (array de una entrada), `_gsap`, `_scrollTop`, `_scrollLeft`,
`lenisVersion`, `reactLenisVersion`, `__THREE__`.

La instancia real se alcanzó por el runtime de webpack de Next.js: se obtiene
`__webpack_require__` empujando un chunk vacio a `webpackChunk_N_E`, se recupera el
módulo de gsap ya ejecutado, y desde ahí `gsap.core.globals().ScrollTrigger`.
**No se ejecutó ningún módulo que no estuviera ya cargado** —gsap esta
demostrablemente en uso, con lo cual pedirlo es un acierto de cache— y **no se
guardó ni una línea de bundle**. `raw/scroll/*.json` registra en `gsapDesde` y
`stDesde` de donde salió cada objeto, en las 18 capturas. [medido]

**El registro de gsap desambigua una trampa [medido]:** el bundle tiene *dos*
módulos con la marca de ScrollTrigger. El que corre es uno solo: las animaciones
con `scrollTrigger` de `gsap.globalTimeline` son todas `instanceof` la clase
registrada, y ninguna queda fuera de `getAll()`. Campo `segundaCopia`, 18 de 18.

**Protocolo de asentamiento:** el reforzado de B3.1 sin atajos —viewport, recarga
con cache ignorada, red ociosa (2 s sin nuevos `resource`), `document.fonts.ready`,
recorrido en pasos de 0,5 vh con 1500 ms, vuelta al tope, segunda pasada completa,
vuelta al tope, 3 s— **más `ScrollTrigger.refresh()` y 1 s de espera antes de leer.**

**El `refresh()` no fue decorativo [medido].** Cambio rangos en 4 de las 18 capturas,
y cuando cambió, cambió mucho:

| captura | instancias | rangos que cambiaron |
|---|---|---|
| `home-1440` | 60 | 37 de 60 |
| `studio-1440` | 59 | 51 de 59 |
| `services-1440` | 102 | 64 de 102 |
| `home-1440-rm` | 3 | 1 de 3 |
| `services-1440-rm` | 5 | 4 de 5 |

En las otras 13 el `refresh()` no movió nada. Leer sin refrescar habría dado rangos
falsos en las tres páginas más animadas del sitio.

**Reglas de guardado de texto.** Ninguna cadena legible del sitio entra a
`raw/scroll/`. Los `start`/`end` declarativos se conservan **solo si validan contra
una gramática estricta de posición de ScrollTrigger** (`top`/`bottom`/`center`/
`left`/`right`/`max`/`self`, números, `%`/`px`/`vh`/`vw`, `+=`/`-=`); si no validan
se guardan como longitud y cantidad de palabras. Igual criterio para `toggleActions`
(lista cerrada de keywords de GSAP) y para los easings (nomenclatura de la librería).
`vars.id`, clases y estilos inline van siempre como longitud y conteo, nunca como texto.

---

## 1. Inventario de librerías [medido]

| | valor | donde |
|---|---|---|
| GSAP | **3.13.0** | `gsapVersions[0]` y `gsap.versión`, idéntico en 18 de 18 |
| ScrollTrigger | **3.13.0** | `gsap.core.globals().ScrollTrigger.versión`, 18 de 18 |
| Flip (GSAP) | 3.13.0 | registrado en `gsap.core.globals()` bajo nombre minificado |
| Lenis | **1.0.42** | `window.lenisVersion` — **solo a 1440** |
| react-lenis | presente | `window.reactLenisVersion`, cadena de 6 caracteres |
| Three.js | presente | `window.__THREE__`, cadena de 3 caracteres |
| CSSPlugin, SnapPlugin, ModifiersPlugin... | — | plugins base de GSAP, registrados |

**No hay ScrollSmoother, ni Observer, ni Draggable, ni Lottie, ni Tempus** en los
registros de GSAP ni entre las globales de `window` que matchean
`/gsap|scroll|lenis|tempus|three|lottie|smooth/i`. [medido]

El scroller de **las 291 instancias a 1440 es `window`** — no hay contenedor de
scroll propio. [medido]

---

## 2. La coreografía de la home a 1440, ordenada por `start` [medido]

60 instancias. `docHeight` 21.121px, viewport 900px, 23,47 pantallas. `start` y `end`
son píxeles absolutos de scroll, leidos de la instancia después de `refresh()`; no
son la expresión declarativa.

**Ninguna de las 60 tiene `pin`.** La columna se conserva porque la instrucción la
pide y porque el cero es el hallazgo (sección 4).

| # | trigger (ruta desde `body`) | start (px) | end (px) | pantallas | pin | scrub |
|---|---|---|---|---|---|---|
| 0 ! | `(elemento desprendido del documento)` | -900 | -900 | 0,00 | no | true |
| 1 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[0]>div[2]>div[0]>a[0]` | -820 | -660 | 0,18 | no | 1 |
| 2 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>h3[0]` | 1106 | 1410 | 0,34 | no | 1 |
| 3 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[0]>p[1]` | 1320 | 1557 | 0,26 | no | 1 |
| 4 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[0]` | 1526 | 1757 | 0,26 | no | true |
| 5 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[3]` | 1526 | 1757 | 0,26 | no | true |
| 6 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[2]` | 1550 | 1781 | 0,26 | no | true |
| 7 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[1]` | 1606 | 1837 | 0,26 | no | true |
| 8 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[4]` | 1783 | 2014 | 0,26 | no | true |
| 9 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[6]` | 1783 | 2014 | 0,26 | no | true |
| 10 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[3]>div[1]>div[1]>div[5]` | 1824 | 1990 | 0,18 | no | true |
| 11 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[4]>div[0]>div[1]>p[0]` | 2497 | 2714 | 0,24 | no | 1 |
| 12 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[4]>div[0]>div[0]>h2[0]` | 2500 | 2852 | 0,39 | no | 1 |
| 13 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[4]>div[1]` | 2972 | 8372 | 6,00 | no | true |
| 14 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[5]>div[1]>div[1]>div[0]` | 9048 | 9279 | 0,26 | no | true |
| 15 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[5]>div[0]>h3[0]` | 9144 | 9496 | 0,39 | no | 1 |
| 16 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[5]>div[1]>div[0]` | 9172 | 9403 | 0,26 | no | true |
| 17 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[5]>div[1]>div[1]>div[1]` | 9295 | 9526 | 0,26 | no | true |
| 18 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[0]>div[0]>div[5]>div[2]>p[0]` | 9354 | 9591 | 0,26 | no | 1 |
| 19 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[0]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 20 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[1]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 21 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[2]>div[1]>div[0]>h3[0]` | 10301 | 10652 | 0,39 | no | 1 |
| 22 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[3]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 23 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[4]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 24 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[5]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 25 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[6]>div[1]>div[0]>h3[0]` | 10301 | 10700 | 0,44 | no | 1 |
| 26 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>section[0]>div[0]>div[0]>div[7]>div[1]>div[0]>h3[0]` | 10301 | 10604 | 0,34 | no | 1 |
| 27 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>div[0]>p[0]` | 11267 | 11794 | 0,59 | no | 1 |
| 28 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>div[0]>p[0]` | 12059 | 12586 | 0,59 | no | 1 |
| 29 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[0]>div[0]>div[1]>div[0]>div[3]>div[0]>p[0]` | 12851 | 13336 | 0,54 | no | 1 |
| 30 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[0]>div[0]>div[1]>div[1]>div[0]>p[0]` | 13601 | 14128 | 0,59 | no | 1 |
| 31 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>div[0]>a[0]>p[0]` | 16225 | 16407 | 0,20 | no | 1 |
| 32 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>div[0]>a[0]>p[1]` | 16259 | 16429 | 0,19 | no | 1 |
| 33 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>a[0]>p[0]` | 16527 | 16757 | 0,26 | no | 1 |
| 34 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>a[0]>p[1]` | 16609 | 16779 | 0,19 | no | 1 |
| 35 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>div[0]>div[0]>a[0]>p[0]` | 16682 | 16886 | 0,23 | no | 1 |
| 36 | `body[0]>div[1]>div[3]>div[5]>div[2]>div[0]>div[1]>div[0]>div[3]>div[0]>div[0]>div[0]>div[0]>a[0]>p[1]` | 16738 | 16907 | 0,19 | no | 1 |
| 37 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[0]` | 17612 | 18512 | 1,00 | no | true |
| 38 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[2]>h2[0]` | 19217 | 19511 | 0,33 | no | 1 |
| 39 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[0]>p[0]` | 19772 | 20054 | 0,31 | no | 1 |
| 40 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[0]>p[0]` | 19804 | 19975 | 0,19 | no | 1 |
| 41 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>p[0]` | 19804 | 19975 | 0,19 | no | 1 |
| 42 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>p[0]` | 19804 | 19975 | 0,19 | no | 1 |
| 43 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[3]>p[0]` | 19804 | 19975 | 0,19 | no | 1 |
| 44 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[0]>ul[0]>li[0]>a[0]>span[0]` | 19839 | 20029 | 0,21 | no | 1 |
| 45 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>ul[0]>li[0]>a[0]>span[0]` | 19839 | 20029 | 0,21 | no | 1 |
| 46 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[0]>a[0]>span[0]` | 19839 | 20029 | 0,21 | no | 1 |
| 47 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[3]>ul[0]>li[0]>p[0]>span[0]` | 19839 | 20029 | 0,21 | no | 1 |
| 48 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[0]>ul[0]>li[1]>a[0]>span[0]` | 19869 | 20059 | 0,21 | no | 1 |
| 49 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>ul[0]>li[1]>a[0]>span[0]` | 19869 | 20059 | 0,21 | no | 1 |
| 50 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[1]>a[0]>span[0]` | 19869 | 20059 | 0,21 | no | 1 |
| 51 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[0]>p[1]` | 19894 | 20144 | 0,28 | no | 1 |
| 52 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>ul[0]>li[2]>a[0]>span[0]` | 19899 | 20089 | 0,21 | no | 1 |
| 53 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[2]>a[0]>span[0]` | 19899 | 20089 | 0,21 | no | 1 |
| 54 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>ul[0]>li[3]>a[0]>span[0]` | 19929 | 20119 | 0,21 | no | 1 |
| 55 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[3]>a[0]>span[0]` | 19929 | 20119 | 0,21 | no | 1 |
| 56 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[1]>ul[0]>li[4]>a[0]>span[0]` | 19959 | 20149 | 0,21 | no | 1 |
| 57 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[4]>a[0]>span[0]` | 19959 | 20149 | 0,21 | no | 1 |
| 58 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[5]>a[0]>span[0]` | 19989 | 20179 | 0,21 | no | 1 |
| 59 | `body[0]>div[1]>div[3]>div[5]>div[2]>footer[0]>div[3]>div[0]>div[0]>div[0]>div[0]>div[1]>div[0]>div[2]>ul[0]>li[6]>a[0]>span[0]` | 20019 | 20209 | 0,21 | no | 1 |

**La instancia 0 es basura viva [medido].** Su elemento trigger ya no esta en el
documento —la cadena de ancestros no llega a `body`—, su rect es 0x0 y su rango es
`-900,01 -> -900,00`, es decir 0px. Es un `ScrollTrigger` que quedó sin matar cuando
React desmontó su componente. Aparece también en `home-1440-rm`, y es la única del
corpus. No cambia ningún número agregado, pero es un defecto real de la referencia y
se anota.

**Lectura de la tabla.** La home no tiene una línea de tiempo maestra: tiene 59
animaciones locales, cada una atada a su propio elemento. El grueso vive en rangos de
un cuarto de pantalla. Hay **una sola excepcion**: la instancia 13, que abarca **6,00
pantallas exactas** (2.972 -> 8.372) con `scrub: true` — el único tramo largo dirigido
por GSAP de toda la home. Y el bloque 44-59 son 16 instancias en 370px de scroll: la
lista de links del pie, revelada ítem por ítem con 30px de desfase entre uno y el
siguiente.

---

## 3. Nueve patrones explican las 291 instancias [medido]

Agrupando las seis URLs a 1440 por `(start declarado, end declarado, scrub, tipo de animación)`:

| start declarado | end declarado | scrub | animación | home | studio | services | work | case | news | **total** |
|---|---|---|---|---|---|---|---|---|---|---|
| `top bottom-=80px` | `bottom bottom-=240px` | 1 | tween | 43 | 40 | 36 | 23 | 23 | 23 | **188** |
| `top bottom` | `bottom bottom` | true | tween | 10 | 7 | 60 | 0 | 0 | 0 | **77** |
| `top bottom-=10%` | `bottom center` | 1 | tween | 4 | 7 | 0 | 0 | 0 | 0 | **11** |
| `top top+=20%` | `bottom bottom-=40%` | true | tween | 1 | 1 | 1 | 1 | 0 | 0 | **4** |
| `top bottom` | `bottom top` | true | tween | 0 | 0 | 4 | 0 | 0 | 0 | **4** |
| *(no declarado)* | *(no declarado)* | true | tween | 0 | 2 | 1 | 0 | 0 | 0 | **3** |
| `top bottom` | `bottom bottom` | true | timeline | 2 | 0 | 0 | 0 | 0 | 0 | **2** |
| `top 80%` | `bottom 70%` | 2 | tween | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| `top 80%` | `bottom 60%` | 1 | tween | 0 | 1 | 0 | 0 | 0 | 0 | **1** |

**291 instancias, 9 patrones. El primero solo cubre 188, el 64,6 por ciento.** [derivado de medido]

Cuatro hechos que la tabla vuelve difíciles de discutir [medido]:

1. **Todo es `scrub`.** 291 de 291. No hay una sola instancia disparada por
   `toggleActions` con reproduccion libre: la animación siempre esta atada a la
   posición de scroll, nunca al tiempo. `toggleActions` esta declarado (`"play"`)
   pero es inerte mientras haya `scrub`.
2. **Cero callbacks.** Ningún `onEnter`, `onLeave`, `onUpdate`, `onToggle`,
   `onRefresh`, en ninguna de las 291. El scroll no dispara lógica; solo interpola.
3. **Cero `snap`, cero `horizontal`, cero `once`, cero `markers`.**
4. **Casi todo es un tween suelto.** 289 tweens sueltos contra 2 timelines, ambas en
   la home. Las timelines anidadas y las etiquetas prácticamente no se usan.

### Forma de las animaciones a 1440 [medido]

| slug | instancias | timelines | tweens | targets | duración (s) min...max | easings |
|---|---|---|---|---|---|---|
| home | 60 | 2 | 94 | 232 | 0,50...9,80 | *(funcion)* x65, power1.in x24, cadena x4 |
| studio | 59 | 0 | 59 | 273 | 0,50...8,20 | *(funcion)* x49, cadena x7, power1.out x1, power2.inOut x1 |
| services | 102 | 0 | 102 | 176 | 0,50...4,00 | *(funcion)* x97, power4.out x4 |
| work | 24 | 0 | 24 | 27 | 1,00...2,00 | *(funcion)* x23 |
| case | 23 | 0 | 23 | 26 | 1,00...1,20 | *(funcion)* x23 |
| news | 23 | 0 | 23 | 26 | 1,00...1,20 | *(funcion)* x23 |

**El easing dominante no es un nombre de GSAP: es una funcion [medido].** 280 de los
291 tweens llevan una `ease` que llega como `function`, no como cadena. GSAP resuelve
los nombres a funciones al crear el tween, así que esto **no prueba** que sean easings
a medida — solo que el nombre no sobrevive en `vars`. Los que si sobreviven como
cadena son `power1.in` (24, todos en la home), `power4.out` (4), `power2.inOut` y
`power1.out`. Once easings llegan como cadena que no valida contra la nomenclatura de
GSAP y quedan registrados como longitud y palabras. **Qué curva concreta usa la
mayoria es un hueco.**

---

## 4. El pinneado no viene de GSAP [medido]

**`pin` es `false` en las 291 instancias a 1440, en la única de 390 y en las 12 de
reduced-motion. `document.querySelectorAll(".pin-spacer").length` es 0 en las 18
capturas.** ScrollTrigger no pinnea nada en este sitio.

El pinneado que B3.1 observo es **`position: sticky` de CSS**. Eso cambia la
reconstrucción: no hace falta ScrollTrigger para reproducir el ritmo del sitio, hace
falta CSS.

### Cómo se midió el rango pegado, y qué se descartó

Para cada elemento con `position: sticky` computado se registro su caja, su `top`
computado, y la caja de su contenedor. De ahí, en píxeles absolutos:

```
inicioPegado = topDoc(elemento) - top
finPegado    = topDoc(contenedor) + alto(contenedor) - alto(elemento) - top
rangoPegado  = finPegado - inicioPegado
```

**Esto cierra el hueco 4 de B3.1**, que midió "en pantalla" —entrada y salida
incluidas— y declaró sus números como cota superior.

Criterios de descarte, todos con motivo persistido en el JSON:

- **Rect degenerado** (`alto <= 1` o `ancho <= 1`). Incluye un `sticky` de 1px de alto
  que abarca el documento entero, presente en las seis URLs: es un centinela de
  scroll, no una sección.
- **Descendiente de un `position: fixed`.** No participan del scroll del documento. La
  detección cruza la ruta contra la lista de elementos `fixed` de
  `raw/ritmo/<slug>-<ancho>.json` —una captura independiente, de otro sprint—. Así se
  descartan los `sticky` de dentro del formulario de superposicion, que si no sumaban
  cerca de 1 pantalla falsa por página.
- **`top: auto`.** No hay rango computable sobre el eje superior y se registra `null`
  con la razón, nunca estimado. **Se verificó que igual no aporta**: en las 18
  capturas ese elemento —el bloque inferior del pie— tiene `alto == contenedorAlto`,
  con lo cual su recorrido pegado es 0 sea cual sea el eje. [medido]
- **Cromo persistente** (rango >= 90 por ciento del scroll del documento). No se
  activo en ninguna captura: los candidatos ya caían por rect degenerado.

### Secuencias pinneadas, en píxeles de documento [medido]

Fusionando los intervalos que se solapan:

| slug | ancho | secuencias | tramos (px de documento) | pantallas pinneadas |
|---|---|---|---|---|
| home | 1440 | 2 | 11.908-15.093 / 17.729-19.052 | 5,01 |
| studio | 1440 | 2 | 4.193-7.378 / 14.161-15.484 | 5,01 |
| services | 1440 | 5 | 2.242-3.584 / 4.191-5.533 / 6.140-7.481 / 8.088-9.465 / 13.290-14.613 | 7,47 |
| work | 1440 | 1 | 18.344-19.667 | 1,47 |
| case | 1440 | 1 | 100-10.364 | 11,40 |
| news | 1440 | 0 | — | 0,00 |
| home | 390 | 1 | 11.545-12.992 | 1,71 |
| studio | 390 | 1 | 5.849-7.295 | 1,71 |
| services | 390 | 4 | 1.700-2.574 / 3.116-3.989 / 4.531-5.404 / 5.946-6.839 | 4,16 |
| work | 390 | 0 | — | 0,00 |
| case | 390 | 0 | — | 0,00 |
| news | 390 | 0 | — | 0,00 |

### Contraste contra lo que observó B3.1

B3.1 midió "pantallas en las que el `sticky` esta en pantalla". B4.2a mide "pantallas
en las que esta efectivamente pegado". La segunda tiene que ser menor o igual que la
primera, siempre. Lo es en las doce:

| slug | ancho | bloques B3.1 | pantallas B3.1 (cota sup.) | secuencias B4.2a | pantallas B4.2a | menor o igual |
|---|---|---|---|---|---|---|
| home | 1440 | 2 | 7,0 | 2 | 5,01 | si |
| studio | 1440 | 3 | 8,0 | 2 | 5,01 | si |
| services | 1440 | 3 | 13,0 | 5 | 7,47 | si |
| work | 1440 | 2 | 3,7 | 1 | 1,47 | si |
| case | 1440 | 1 | 11,5 | 1 | 11,40 | si |
| news | 1440 | 1 | 1,1 | 0 | 0,00 | si |
| home | 390 | 1 | 2,5 | 1 | 1,71 | si |
| studio | 390 | 2 | 4,1 | 1 | 1,71 | si |
| services | 390 | 1 | 7,0 | 4 | 4,16 | si |
| work | 390 | 0 | 0,0 | 0 | 0,00 | si |
| case | 390 | 1 | 1,4 | 0 | 0,00 | si |
| news | 390 | 1 | 1,4 | 0 | 0,00 | si |

**Doce de doce. [medido]** El caso que más importa es `case` a 1440: B3.1 dijo 11,5
pantallas de un solo `sticky` a `top: 100px`; B4.2a mide **11,40 pantallas pegadas**
de un `sticky` a `top: 100px`, tramo 100-10.364. La diferencia de 0,1 pantalla es
exactamente la entrada y la salida que B3.1 no podia separar. **La observacion de
B3.1 queda confirmada y afinada, no corregida.**

Donde si hay diferencia estructural es en `services`: B3.1 leyó 3 bloques, B4.2a
encuentra **5 secuencias** de cerca de 1,5 pantallas cada una. Con muestreo de 0,5 vh
y midiendo "en pantalla", bloques vecinos separados por menos de una pantalla se
funden en uno. **La particion fina es la de B4.2a; el total de B3.1 seguia siendo una
cota superior correcta.** [derivado]

Y tres casos bajan a cero: `case@390`, `news@390` y `news@1440`. En los tres, lo que
B3.1 contó como 1,1-1,4 pantallas es el pie llegando a pantalla, no un tramo pegado.

---

## 5. Correlación con las bandas de B3.1 [derivado de medido]

Las bandas salen de `raw/ritmo/<slug>-<ancho>.json`. Una instancia "solapa" una banda
si la caja de su elemento trigger, en coordenadas de documento, intersecta la banda.
Los píxeles pinneados son la interseccion de la banda con las secuencias de la
sección 4.

**home @ 1440** — 6 bandas, 59 instancias ubicables de 60

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | 1 | 11.007 | 52,1% | **17** | 0 | 0,0% |
| 1 | 11.008 | 6.784 | 32,1% | **18** | 3.248 | 47,9% |
| 2 | 17.792 | 1.260 | 6,0% | **1** | 1.260 | 100,0% |
| 3 | 19.052 | 720 | 3,4% | **0** | 0 | 0,0% |
| 4 | 19.772 | 720 | 3,4% | **1** | 0 | 0,0% |
| 5 | 20.492 | 629 | 3,0% | **21** | 0 | 0,0% |

**studio @ 1440** — 5 bandas, 59 instancias ubicables de 59

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | 1 | 14.223 | 81,0% | **34** | 3.248 | 22,8% |
| 1 | 14.224 | 1.260 | 7,2% | **2** | 1.260 | 100,0% |
| 2 | 15.484 | 720 | 4,1% | **0** | 0 | 0,0% |
| 3 | 16.204 | 720 | 4,1% | **1** | 0 | 0,0% |
| 4 | 16.924 | 629 | 3,6% | **21** | 0 | 0,0% |

**services @ 1440** — 5 bandas, 102 instancias ubicables de 102

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | 1 | 13.353 | 80,0% | **77** | 5.466 | 40,9% |
| 1 | 13.354 | 1.260 | 7,5% | **2** | 1.259 | 99,9% |
| 2 | 14.614 | 720 | 4,3% | **0** | 0 | 0,0% |
| 3 | 15.334 | 720 | 4,3% | **1** | 0 | 0,0% |
| 4 | 16.054 | 629 | 3,8% | **21** | 0 | 0,0% |

**work @ 1440** — 5 bandas, 24 instancias ubicables de 24

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | 1 | 18.406 | 84,7% | **0** | 63 | 0,3% |
| 1 | 18.407 | 1.260 | 5,8% | **1** | 1.260 | 100,0% |
| 2 | 19.667 | 720 | 3,3% | **0** | 0 | 0,0% |
| 3 | 20.387 | 720 | 3,3% | **1** | 0 | 0,0% |
| 4 | 21.107 | 629 | 2,9% | **21** | 0 | 0,0% |

**case @ 1440** — 3 bandas, 23 instancias ubicables de 23

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | -99 | 11.149 | 89,7% | **1** | 10.264 | 92,1% |
| 1 | 11.082 | 720 | 5,8% | **1** | 0 | 0,0% |
| 2 | 11.802 | 629 | 5,1% | **21** | 0 | 0,0% |

**news @ 1440** — 3 bandas, 23 instancias ubicables de 23

| banda | topDoc | alto | pct del doc | instancias | px pinneados | pct de la banda |
|---|---|---|---|---|---|---|
| 0 | 1 | 26.210 | 95,1% | **0** | 0 | 0,0% |
| 1 | 26.211 | 720 | 2,6% | **1** | 0 | 0,0% |
| 2 | 26.931 | 629 | 2,3% | **21** | 0 | 0,0% |

### Qué dice la correlación

**1. El pie es una constante del sitio, y es la mitad de las instancias [medido].** La
última banda —629px, 3 por ciento del documento— concentra **21 instancias en las
seis URLs**. Contando el pie completo son 23 o 24 por página, siempre las mismas:

| slug | instancias @1440 | del pie | de contenido |
|---|---|---|---|
| home | 60 | 24 | **36** |
| studio | 59 | 24 | **35** |
| services | 102 | 24 | **78** |
| work | 24 | 24 | **0** |
| case | 23 | 23 | **0** |
| news | 23 | 23 | **0** |

**`work`, `case` y `news` tienen CERO instancias de contenido.** Sus 23-24
ScrollTrigger son íntegramente el pie de página, que es el mismo en todo el sitio. El
contenido de esas tres páginas no lo anima GSAP.

**2. La coreografía esta concentrada en tres URLs [derivado].** 149 de las 291
instancias son contenido, y las tres que lo tienen son `home` (36), `studio` (35) y
`services` (78). `services` sola es el 52 por ciento del contenido animado del sitio.

**3. El pinneado explica el ritmo donde el ritmo existe [derivado].** En `case`, la
banda 0 es el 89,7 por ciento del documento y **el 92,1 por ciento de esa banda esta
pinneado**. Una banda gigante con un 92 por ciento pegado no es una sección larga: es
una sola escena que consume scroll. En la home, la banda 1 —la que cambia el fondo a
`rgb(253,253,249)`— tiene 47,9 por ciento pinneado y 18 instancias; la banda 0, que
es la mitad del documento, no tiene nada pinneado y 17 instancias sueltas.

**4. `work` y `news` no tienen ritmo que explicar [medido].** Banda 0 de `work`:
18.406px, 84,7 por ciento del documento, **0 instancias y 0,3 por ciento pinneado**.
Banda 0 de `news`: 26.210px, 95,1 por ciento, **0 instancias y 0 por ciento
pinneado**. Son listados: el scroll avanza y nada lo interrumpe.

---

## 6. Momentos reales [derivado de medido]

`momentos = pantallas - pantallas pinneadas + secuencias`. Cada secuencia pinneada
cuenta como **un** momento en lugar de las N pantallas que consume. **Es una regla
elegida, no una medición** —el mismo hueco que declaró B3.1—; lo medido son las
pantallas y los tramos.

| slug | ancho | pantallas nominales | pantallas pinneadas | secuencias | **momentos reales** |
|---|---|---|---|---|---|
| home | 1440 | 23,47 | 5,01 | 2 | **20,5** |
| studio | 1440 | 19,50 | 5,01 | 2 | **16,5** |
| services | 1440 | 18,54 | 7,47 | 5 | **16,1** |
| work | 1440 | 24,15 | 1,47 | 1 | **23,7** |
| case | 1440 | 13,81 | 11,40 | 1 | **3,4** |
| news | 1440 | 30,62 | 0,00 | 0 | **30,6** |
| home | 390 | 21,90 | 1,71 | 1 | **21,2** |
| studio | 390 | 21,10 | 1,71 | 1 | **20,4** |
| services | 390 | 15,42 | 4,16 | 4 | **15,3** |
| work | 390 | 27,99 | 0,00 | 0 | **28,0** |
| case | 390 | 13,38 | 0,00 | 0 | **13,4** |
| news | 390 | 29,85 | 0,00 | 0 | **29,9** |

**`case` es el caso extremo y el más informativo [derivado]:** 13,8 pantallas de
scroll, **3,4 momentos**. Una página de caso entera se lee como tres cosas. Con la
medición afinada la cifra apenas se mueve respecto de B3.1 (3,3 -> 3,4), lo que
significa que **la lectura de B3.1 era correcta y este sprint la sostiene con la
geometría exacta**, no con una cota.

En el otro extremo, `news` a 1440 tiene 30,6 pantallas y 30,6 momentos: no hay ni una
sola pantalla en la que el sitio se quede quieto.

---

## 7. 1440 contra 390: no es la misma experiencia [medido]

| slug | instancias @1440 | @390 | secuencias pinneadas @1440 | @390 | Lenis @1440 | @390 |
|---|---|---|---|---|---|---|
| home | 60 | **1** | 2 | 1 | 1.0.42 | **ausente** |
| studio | 59 | **0** | 2 | 1 | 1.0.42 | **ausente** |
| services | 102 | **0** | 5 | 4 | 1.0.42 | **ausente** |
| work | 24 | **0** | 1 | 0 | 1.0.42 | **ausente** |
| case | 23 | **0** | 1 | 0 | 1.0.42 | **ausente** |
| news | 23 | **0** | 0 | 0 | 1.0.42 | **ausente** |

**291 instancias a 1440. Una sola a 390.** [medido]

- `ScrollTrigger.isTouch` vale **0** en las seis capturas de 1440 y **1** en las seis
  de 390. GSAP detecta el dispositivo como táctil puro.
- Cinco de las seis URLs quedan con **`ScrollTrigger.getAll().length === 0`**. La
  única sobreviviente es la home, con una instancia: un `scrub: true` sobre un trigger
  de 5.064px que abarca **6,00 pantallas exactas** —el mismo número que la instancia
  larga de la home a 1440—, con una timeline de 3 hijos, 18 tweens y 21 targets. Es el
  único tramo coreografiado que sobrevive al pasaje a mobile.
- `gsap.globalTimeline` pasa de 49-141 hijos a **3-4**.
- **Lenis no se carga en mobile.** `window.lenisVersion` es `null` en las seis
  capturas de 390 y `1.0.42` en las doce de 1440. En su lugar,
  `getComputedStyle(html).scrollBehavior` vale **`smooth`** a 390 y `auto` a 1440: el
  sitio deja el scroll suave nativo del navegador y suelta el scroll suave
  programático. [medido]
- El elemento `<html>` pierde 2 de sus 3 clases a 390: 36 caracteres pasan a 17. El
  delta de 19 caracteres coincide con la desaparición de Lenis. [derivado]
- El pinneado CSS **si** cruza: `home` y `studio` conservan 1 secuencia de 1,71
  pantallas, `services` conserva 4 de las 5. `work`, `case` y `news` quedan en cero.

**Conclusión de la sección [derivado]:** a 390 el sitio no es una versión reducida de
si mismo, es otro sitio. Toda la capa de animación por scroll desaparece salvo un
tramo en la home; lo que queda del ritmo es CSS `sticky`, que sobrevive porque no
depende de JS.

---

## 8. `prefers-reduced-motion` [medido, con una salvedad de método]

**Salvedad primero.** El MCP no expone `Emulation.setEmulatedMedia`, así que la
preferencia **no se emuló a nivel de navegador**. Se instaló un shim de
`window.matchMedia` por `initScript`, antes de todo script del sitio, que devuelve
`matches: true` para `prefers-reduced-motion` y cuenta las consultas. **La vía CSS no
queda emulada.**

Eso importaria si el sitio tuviera CSS sensible a la preferencia. **No lo tiene:**
`reglasReducedMotion` es **0** en las 18 capturas, sobre 12 hojas de estilo y 0
bloqueadas por CORS. La única vía por la que este sitio puede responder a la
preferencia es JS, y esa es exactamente la que el shim cubre. [medido]

### El sitio consulta la preferencia, y mucho [medido]

| slug | consultas a `prefers-reduced-motion` durante la corrida |
|---|---|
| home | **354** |
| studio | **789** |
| services | **665** |
| work | **1189** |
| case | **397** |
| news | **493** |

No es una consulta al arrancar: son cientos, consistente con un hook por componente.

### Y responde [medido]

| slug | instancias @1440 | @1440 con reduced-motion | de contenido | `globalTimeline` |
|---|---|---|---|---|
| home | 60 | **3** | 2 | 110 -> 6 |
| studio | 59 | **3** | 2 | 111 -> 8 |
| services | 102 | **5** | 4 | 141 -> 8 |
| work | 24 | **1** | 0 | 50 -> 4 |
| case | 23 | **0** | 0 | 49 -> 3 |
| news | 23 | **0** | 0 | 49 -> 3 |

**El colapso es casi total: de 291 instancias a 12.** Las 24 del pie caen a 0 o 1 en
todas las páginas. `case` y `news` quedan en cero absoluto. `gsap.globalTimeline` pasa
de 49-141 hijos a 3-8. **Este sitio respeta `prefers-reduced-motion` en su capa de
animación, y lo hace de forma agresiva.** [medido]

### Qué sobrevive, y ahí está el problema [medido]

| slug | secuencias pinneadas @1440 | con reduced-motion | docHeight @1440 | con r-m | delta |
|---|---|---|---|---|---|
| home | 2 | **2** | 21.121 | 21.018 | -103 |
| studio | 2 | **2** | 17.553 | 17.342 | -211 |
| services | 5 | **5** | 16.682 | 16.682 | +0 |
| work | 1 | **1** | 21.736 | 21.736 | +0 |
| case | 1 | **1** | 12.431 | 12.431 | +0 |
| news | 0 | **0** | 27.560 | 27.560 | +0 |

**Los pins sobreviven 11 de 11.** Era previsible: son `sticky` de CSS y no hay una
sola regla CSS condicionada a la preferencia. `case` sigue gastando 11,40 pantallas
pegado. Es discutible que eso sea un defecto —`sticky` es layout, no movimiento— y
este documento no lo resuelve.

**Lo que si es un hallazgo de accesibilidad [medido]: Lenis sigue activo.**
`window.lenisVersion` vale `1.0.42` en las seis capturas con la preferencia puesta,
las clases de `<html>` no cambian (36 caracteres, 3 clases, igual que sin la
preferencia) y `scrollBehavior` sigue en `auto`, es decir, el scroll lo sigue manejando
la librería. **El sitio apaga sus animaciones pero mantiene el secuestro del scroll.**
El scroll suave programático es justamente uno de los efectos que la preferencia busca
evitar. Va a `A11Y.md`.

El `docHeight` casi no se mueve: -103px en `home`, -211px en `studio`, 0 en las otras
cuatro. **Apagar la animación no reflowea el documento**, lo que confirma que las
animaciones son transformaciones y opacidad, no cambios de layout.

---

## 9. Qué anima cada tween, y con qué curva [medido] — B4.2b

Alcance de este bloque: **1440 solamente**, y solo `home`, `studio`, `services` —las tres
con coreografía real— más `case` como control de "solo pie". `work` y `news` quedaron
afuera porque B4.2a estableció que su contenido no lo anima GSAP.
Salidas crudas: `raw/tweens/<slug>-1440.json` (4) y `raw/tweens/_catalogo-eases.json`.

**244 instancias, 1.045 nodos de tween, de los cuales 278 son autorales.** [medido]
El resto son las copias por target que GSAP genera a partir de un único tween con
`stagger`: no son código que alguien escribió, son la expansión de la librería.

### 9.1 Cómo se leyó, y qué se probó antes de leer

Misma ruta que B4.2a —el runtime de webpack de Next— pero esta vez **con la prueba de
que no se ejecutó nada**. `__webpack_require__.c` no está expuesto en este build, así que
no se puede enumerar el cache de módulos. En su lugar se leyó el **fuente** de las 535
factories de `__webpack_require__.m` con `Function.prototype.toString` —leer el texto de
una función no la ejecuta— y se contaron marcadores. Resultado: **un solo módulo, el 934,
contiene la marca `gsapVersions`**, y `window.gsapVersions` está poblado. Como esa marca
la escribe únicamente gsap al evaluarse, el módulo 934 **está demostrablemente ejecutado**,
y pedirlo es un acierto de cache por construcción, no una ejecución. [medido]

El bundle tiene **dos** módulos con la marca de ScrollTrigger (46881 y 49088), lo que
reconfirma la trampa que encontró B4.2a. **Ninguno de los dos se pidió**: ScrollTrigger se
tomó de `gsap.core.globals().ScrollTrigger`, que es la copia registrada y en uso. Módulos
ejecutados por nosotros en las cuatro capturas: **cero**. Campo `acceso` de cada volcado.

**Extensión del protocolo de asentamiento.** El asentamiento reforzado de B3.1 deja los
rangos correctos pero **no garantiza que los tweens estén inicializados**, y las
propiedades efectivamente aplicadas solo existen después del primer render. Se agregó una
**tercera pasada de scroll después del `refresh()`**. Control incorporado: se compararon
los 244 pares `start`/`end` antes y después de esa pasada.

| | home | studio | services | case |
|---|---|---|---|---|
| instancias | 60 | 59 | 102 | 23 |
| rangos que cambió el `refresh()` | 38 | 51 | 65 | 0 |
| **rangos que cambió la tercera pasada** | **0** | **0** | **0** | **0** |
| nodos de tween inicializados | 387/387 | 331/331 | 278/278 | 49/49 |

**La tercera pasada no movió un solo rango, y llevó la inicialización a 100 %.** [medido]
Es aditiva, no invasiva. Los `docHeight` reproducen los de B4.2a (21.119 / 17.547 / 16.681
/ 12.430, contra 21.121 / 17.553 / 16.682 / 12.431: diferencias de 1 a 6 px sobre decenas
de miles). Los conteos de instancia reproducen exacto: 60, 59, 102, 23.

### 9.2 El catálogo de curvas [medido]

`gsap.parseEase` resultó accesible sobre la instancia viva, así que **el catálogo no son
fórmulas nuestras: son los valores que devuelve la implementación real de GSAP 3.13.0 en
ejecución**. 26 curvas, 21 puntos cada una (t de 0 a 1 en pasos de 0,05), 0 fallos.
Está en `raw/tweens/_catalogo-eases.json` con `esFormula: false`.

**Criterio de coincidencia declarado: error máximo absoluto por punto ≤ 0,001**, sobre los
21 puntos. Se usó ese criterio y no otro en todo el sprint.

Dos hechos sobre el criterio [derivado de medido]:

- `none` y `linear` son **el mismo objeto de función** en GSAP: error 0 entre sí. Se
  reportan como una sola curva, `none`.
- Descontado ese alias, **el par de curvas distintas más parecido del catálogo es
  `power1.inOut` contra `sine.inOut`, a 0,028** — veintiocho veces la tolerancia. El
  criterio no está apretado contra el ruido: discrimina con margen.

### 9.3 La curva de 280 tweens no era un misterio: era power1.out [medido]

B4.2a dejó como hueco principal que 280 de 291 easings llegaban como `function` y que
"qué curva concreta usa la mayoría es un hueco". **El hueco está cerrado.**

En las cuatro páginas hay **entre 3 y 5 objetos de función de easing distintos**, no
cientos. Muestreados y comparados contra el catálogo:

| página | curvas distintas | identificadas | error máximo |
|---|---|---|---|
| home | 5 | 4 de 5 | 0,000000 |
| studio | 5 | 4 de 5 | 0,000000 |
| services | 4 | 3 de 4 | 0,000000 |
| case | 3 | 2 de 3 | 0,000000 |

**Todas las curvas de tween identificaron con error exactamente 0,000000.** [medido] No
"muy parecido": idéntico en los 21 puntos. Son las curvas estándar de GSAP; lo único que
se había perdido era el nombre, porque GSAP resuelve el nombre a función al construir el
tween y `vars.ease` guarda la función, no la cadena.

La única curva por página que **no** identifica es siempre la misma, y **ningún tween la
usa**: es la función de easing de Lenis. Ver 9.6.

### 9.4 Tabla de curvas, sobre los 278 tweens autorales [medido]

| curva | tweens | % | error máx. de identificación |
|---|---|---|---|
| `power1.out` | 235 | 84,5 % | 0,000000 |
| `power1.in` | 24 | 8,6 % | 0,000000 |
| `power1.inOut` | 11 | 4,0 % | 0,000000 |
| `power4.out` | 4 | 1,4 % | 0,000000 |
| `none` (linear) | 3 | 1,1 % | 0,000000 |
| `power2.inOut` | 1 | 0,4 % | 0,000000 |
| **[desconocido]** | **0** | **0 %** | — |

**Seis curvas explican los 278 tweens, y una sola cubre el 84,5 %.** [derivado de medido]
Todas de la familia `power1` salvo cinco casos. En la nomenclatura de GSAP `power1` es la
cuadrática, así que la curva del sitio es, casi siempre, **una cuadrática de salida**.

### 9.5 Declarado contra aplicado: dos trampas [medido]

**Trampa 1 — el `_ease` de un tween con `stagger` es `none`, y miente.** Cuando un tween
lleva `stagger`, GSAP lo convierte en un envoltorio cuya `.timeline` interna contiene una
copia por target. El envoltorio interpola linealmente y la curva real queda en `vars.ease`
y en los hijos. **235 de los 278 tweens autorales son envoltorios de ese tipo**, y en los
235 el `_ease` resuelto dice `none` mientras la curva declarada es otra. Quien lea `_ease`
en vez de `vars.ease` concluye que el sitio entero es lineal. No lo es.

**Trampa 2 — CSSPlugin reescribe la propiedad.** Lo que se declara no es lo que se aplica:

| se declara | se aplica | veces |
|---|---|---|
| `scale`, `yPercent` | `scale`, `scaleX`, `scaleY`, `yPercent` | 244 |
| `autoAlpha` | `opacity`, `visibility` | 72 |
| `transform`, `opacity`, `rotationX/Y/Z` | `z`, `scaleX`, `scaleY`, `rotation`, `rotationX`, `rotationY`, `opacity` | 32 |
| `autoAlpha`, `pointerEvents` | `opacity`, `visibility`, `pointerEvents` | 30 |
| `opacity`, `scale` | `opacity`, `scale`, `scaleX`, `scaleY` | 24 |
| `translateZ` | `z` | 12 |
| `scale`, `translateZ` | `scale`, `scaleX`, `scaleY`, `z` | 12 |

`autoAlpha` no es una propiedad CSS: es azúcar de GSAP que anima `opacity` y además
conmuta `visibility`. `translateZ` se aplica como `z`. `rotationZ` se aplica como
`rotation`. Reproducir esto con las claves declaradas y sin GSAP **no da el mismo
resultado**: hay que reproducir la traducción, no la declaración.

**Tercera trampa, de duración.** La `duration` declarada y la duración total del tween no
coinciden cuando hay `stagger`: GSAP suma el desparramo. Se midieron las dos por separado
(`duracionDeclarada` y `duracionAplicada`) y la relación se verificó en los nueve patrones:

```
duracion aplicada = duracion declarada + stagger x (targets - 1)
```

Ejemplo del patrón 8: 2 s declarados, 32 targets, `stagger` 0,2 → 8,2 s aplicados.
**El número que se escribe es 2, el que se lee en el objeto es 8,2.** [medido]

### 9.6 Configuración de Lenis [medido]

Nunca se había capturado. La instancia no es global; se la alcanzó recorriendo el árbol de
fibers de React hasta el hook que la sostiene (`hook.lenis`). **Idéntica en las cuatro
páginas.**

| opción | valor |
|---|---|
| `lerp` | **0.1** |
| `duration` | *(sin definir)* |
| `smoothWheel` | **true** |
| `syncTouch` | **false** |
| `syncTouchLerp` | 0.075 |
| `touchInertiaMultiplier` | 35 |
| `wheelMultiplier` | **1** |
| `touchMultiplier` | **1** |
| `orientation` | `vertical` |
| `gestureOrientation` | `vertical` |
| `infinite` | false |
| `autoResize` | true |
| `wrapper` / `wheelEventsTarget` / `eventsTarget` | `window` |
| `content` | elemento `<html>` |
| `easing` | función — ver abajo |
| `__experimental__naiveDimensions` | false |

Lo que importa para reproducir la sensación [derivado de medido]: **`duration` no está
definida y `lerp` sí, con lo cual Lenis corre en modo lerp**, no en modo duración. Cada
cuadro se acerca un 10 % a la posición objetivo. Los multiplicadores de rueda y de tacto
están en 1: **el sitio no acelera ni frena el scroll, solo lo suaviza.** `syncTouch: false`
confirma por la vía de la configuración lo que B4.2a vio por la vía del conteo: el camino
táctil es deliberadamente otro.

**La curva `easing` de Lenis es la única `[desconocido]` del sprint.** Es idéntica en las
cuatro páginas y **ningún tween la usa**: Lenis solo la aplica en modo duración y en
`scrollTo` programático, y acá `duration` no está definida. Su vecino más cercano del
catálogo es `expo.out` a **0,006813** — casi siete veces la tolerancia, así que se rechaza.
Sus 21 puntos, para que otro la identifique después:

```
0.001, 0.293893, 0.501, 0.647447, 0.751, 0.824223, 0.876, 0.912612, 0.9385,
0.956806, 0.96975, 0.978903, 0.985375, 0.989951, 0.993187, 0.995476, 0.997094,
0.998238, 0.999047, 0.999619, 1
```

Arranca en 0,001 y no en 0, que es la firma de una exponencial desplazada. **No se la
estima.** Queda `[desconocido]` con sus puntos.

### 9.7 Los nueve patrones, ahora con lo que hacen [medido]

Los nueve patrones de B4.2a se reprodujeron **instancia por instancia, en las cuatro
páginas, sin una sola diferencia**. Lo que sigue agrega qué anima cada uno.

| # | instancias | propiedades (declaradas) | curva | duración decl. | stagger | efecto |
|---|---|---|---|---|---|---|
| P1 | **142** | `yPercent` 120→0, `scale` 1→1 | `power1.out` | 1 s | 0,2 | Cada línea de un bloque de texto sube desde una altura de sí misma |
| P2 | 77 | `yPercent` 60→0 | `power1.out` | 0,5 s | 0,1 | Un bloque sube desde media altura propia |
| P3 | 11 | `opacity` 0,3→1 | `power1.inOut` | 0,5 s | 0,2 | Un párrafo se enciende palabra por palabra desde gris |
| P4 | 4 | `opacity` 0→1, `y` 100→0 | `power4.out` | 2 s | 0,2 | Ítems de lista entran desde 100 px abajo, muy frenados al final |
| P5 | 3 | `opacity` 0→1, `scale` 0,8→1 | `none` | 1 s (hijos) | — | Un bloque aparece creciendo desde el 80 %, a velocidad constante |
| P6 | 3 | `x` 140→−140 | `power1.out` | 2 s | — | Un texto cruza 280 px en horizontal mientras se scrollea |
| P7 | 2 | `translateZ`, `autoAlpha`, `scale`, `pointerEvents` | `power1.in` + `power1.out` | 0,5–3 s | 0,4 | La secuencia 3D de la home: planos que vienen de −3000 px y se van a +1000 |
| P8 | 1 | `transform`, `opacity`, `rotationX/Y/Z` | `power1.out` | 2 s | 0,2 | 32 piezas llegan volando desde el fondo girando en los tres ejes |
| P9 | 1 | `opacity` 0→1, `scale` 0,4→1 | `power2.inOut` | 2 s | 0,1 | 18 piezas crecen desde el 40 % y aparecen |

**Descripciones, para quien no vio los datos:**

**P1 — el revelado de texto línea por línea. 142 instancias, el 58 % de todo.** Es *el*
gesto del sitio. El texto está partido en líneas, y cada línea arranca desplazada hacia
abajo exactamente una altura de sí misma (`yPercent: 120`) y sube hasta su lugar, con
0,2 s de retraso entre línea y línea, en curva cuadrática de salida: rápido al principio,
frenando al llegar. Los elementos son `span` (67), `p` (50), `h3` (14), `h2` (6), `a` (4)
y un `strong`: **es tipografía, siempre**. Entre 1 y 6 líneas por bloque. El `scale` que
también se declara **va de 1 a 1: no anima nada**, y está ahí para forzar una capa de
composición. Si Valentino reproduce un solo efecto de este sitio, es este.

**P2 — el mismo gesto, para bloques enteros. 77 instancias.** Idéntico en espíritu a P1
pero sobre un `div` completo, no sobre líneas: el bloque sube desde media altura propia
(`yPercent: 60`), en medio segundo, misma curva. Un solo target por instancia. En
`services` son 60 de las 77: es cómo entra cada fila de esa página.

**P3 — el párrafo que se enciende. 11 instancias.** El texto ya está visible, en opacidad
0,3, y va pasando a 1 pieza por pieza con 0,2 s entre una y otra. Entre 17 y 33 targets
por instancia: es palabra por palabra, no línea por línea. La curva es `power1.inOut`
—entra y sale suave— así que el encendido no tiene golpe. Sobre `p` en 8 de los 11 casos.
Es el único patrón que nunca mueve nada de lugar: solo brillo.

**P4 — la lista que entra desde abajo. 4 instancias, todas en `services`.** Once `li` que
suben 100 px reales y aparecen de opacidad 0, con 0,2 s entre uno y otro, en `power4.out`:
una quíntica de salida, la curva más frenada de todo el sitio. Arranca disparada y se
posa. Es el único uso de `power4` del corpus.

**P5 — la aparición con crecimiento. 3 instancias, una por página.** Un `div` pasa de
opacidad 0 y escala 0,8 a su tamaño natural. Es el único patrón **lineal** del sitio: sus
tweens declaran `ease: "none"` explícitamente. A velocidad constante y atado al scroll,
que es lo que hace que se sienta como un control de volumen y no como una animación.

**P6 — el texto que cruza. 3 instancias.** Un `h2` o un `p` viaja de `x: 140` a `x: -140`
—280 px de recorrido horizontal— mientras se scrollea verticalmente. Es el único
desplazamiento horizontal del corpus.

**P7 — la secuencia 3D de la home. 2 instancias, 36 tweens autorales.** El único lugar
donde el sitio usa timelines. Planos que entran desde `translateZ: -3000` y salen hacia
`+1000` y `+200`, combinados con `autoAlpha` 0→1→0 y `scale` 0,6→1, y con
`pointerEvents` conmutando entre `initial` y `none` para que lo que está lejos no sea
clickeable. Dos curvas conviviendo: `power1.in` para las salidas (24 tweens) y
`power1.out` para las entradas (12). Es una cámara moviéndose por planos apilados en
profundidad, no una lista revelándose.

**P8 — el vuelo de 32 piezas. 1 instancia, en `studio`.** La más elaborada del sitio. 32
targets que arrancan en `translateZ(-3000px) scale(0.3)`, girados 60° en X, 80° en Y y 45°
en Z, opacidad 0, y aterrizan planos, a tamaño natural y opacos. `stagger` 0,2 y
`scrub: 2` —dos segundos de inercia sobre el scroll, el más alto del sitio—, lo que le da
un arrastre pesado. Duración declarada 2 s que con el desparramo se vuelven 8,2 s de
recorrido.

**P9 — el crecimiento de la grilla. 1 instancia, en `studio`.** 18 piezas que pasan de
escala 0,4 y opacidad 0 a su tamaño natural, con 0,1 s entre una y otra, en
`power2.inOut`: el único uso de esa curva. Sin desplazamiento ni rotación, solo escala.

### 9.8 Diecisiete instancias animan elementos que ya no están en el documento [medido]

Al construir las rutas de target apareció que algunas no llegaban al `<body>`. Se verificó
en vivo con `document.contains()` sobre `case`: **los targets de esas instancias están
fuera del documento**, en un subárbol desprendido, aunque su `trigger` sigue en el
documento.

| | home | studio | services | case | total |
|---|---|---|---|---|---|
| instancias | 60 | 59 | 102 | 23 | 244 |
| **con todos sus targets desprendidos** | 5 | 6 | 3 | 3 | **17** |
| con algunos (no todos) desprendidos | 0 | 0 | 0 | 0 | **0** |
| rutas de target desprendidas | 92/461 | 40/411 | 12/340 | 12/52 | 156/1264 |

**17 de 244 instancias, el 7 %, están vivas, scrubbeando, y no mueven nada visible.**
[medido] Que no haya **ni un solo caso parcial** —una instancia está entera viva o entera
muerta— apunta a un componente que se re-renderizó dejando atrás el DOM viejo con sus
ScrollTrigger colgados, y no a un error puntual. La mayoría tienen su `trigger` en el pie.
Es costo de runtime sin efecto visual. Se declara como hallazgo, no como recomendación:
**por qué pasa no se investigó**, y está fuera del alcance de este sprint.

---

## 10. La compuerta de la coreografía está en 1025 px [medido] — B3.3

B4.2a dejó el contraste 1440 contra 390 y no el punto de corte: 291 instancias de ScrollTrigger
a 1440 y 1 a 390, sin nada en el medio. Este sprint lo acota, aprovechando que ya visitaba seis
anchos para medir el pipeline de imagen. Volcados en `raw/gate/<slug>-<ancho>.json`, uno por
captura.

### 10.1 Qué se midió y cómo

Por la misma ruta de acceso de B4.2a y B4.2b, sin novedad y sin ejecutar nada nuevo:
`webpackChunk_N_E` → `__webpack_require__` → lectura del **fuente** de las 535 factories con
`Function.prototype.toString` → el único módulo con la marca `gsapVersions` es el **934**, y
`window.gsapVersions` está poblado, así que 934 está demostrablemente ejecutado y pedirlo es un
acierto de caché por construcción. ScrollTrigger sale de `gsap.core.globals()`.
**Módulos ejecutados por nosotros: cero, en las 18 capturas** (`gate.modulosEjecutadosPorNosotros`).

Se capturó por ancho: `ScrollTrigger.getAll().length`, `ScrollTrigger.isTouch`, si Lenis está
instanciado y con qué `lerp`, y `gsap.globalTimeline.getChildren(false, true, true).length`.

**Esta vez no se llamó a `refresh()`.** B4.2a lo necesitaba porque medía rangos; contar
instancias no lo necesita. Una alteración menos sobre el sitio de terceros.

**La instancia de Lenis se alcanzó recorriendo el árbol de fibras de React**, como en B4.2b: 66
nodos visitados hasta el objeto con `options.lerp`.

### 10.2 Tabla C — la compuerta, por slug y ancho [medido]

| slug | ancho | instancias de ScrollTrigger | `isTouch` | Lenis | hijos de `globalTimeline` |
|---|---|---|---|---|---|
| home | 390 | 1 | 1 | **ausente** | 4 |
| home | 768 | 1 | 0 | **ausente** | 4 |
| home | 1024 | 1 | 0 | **ausente** | 4 |
| home | **1025** | **60** | 0 | **instanciado, `lerp` 0,1** | 63 |
| home | 1440 | 60 | 0 | instanciado, `lerp` 0,1 | 63 |
| home | 1920 | 60 | 0 | instanciado, `lerp` 0,1 | 63 |
| studio | 390 | 0 | 1 | ausente | 3 |
| studio | 768 | 0 | 0 | ausente | 3 |
| studio | 1024 | 0 | 0 | ausente | 3 |
| studio | **1025** | **59** | 0 | instanciado, `lerp` 0,1 | 62 |
| studio | 1440 | 59 | 0 | instanciado, `lerp` 0,1 | 62 |
| studio | 1920 | 59 | 0 | instanciado, `lerp` 0,1 | 62 |
| case | 390 | 0 | 1 | ausente | 3 |
| case | 768 | 0 | 0 | ausente | 3 |
| case | 1024 | 0 | 0 | ausente | 3 |
| case | **1025** | **23** | 0 | instanciado, `lerp` 0,1 | 26 |
| case | 1440 | 23 | 0 | instanciado, `lerp` 0,1 | 26 |
| case | 1920 | 23 | 0 | instanciado, `lerp` 0,1 | 26 |

Sumando los tres slugs del alcance:

| ancho | 390 | 768 | 1024 | 1025 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| ScrollTrigger, total | 1 | 1 | 1 | **142** | 142 | 142 |

### 10.3 El umbral es 1025 px, y está medido, no interpolado

**El salto ocurre entre 1024 y 1025, que son enteros consecutivos.** `[medido]` No hizo falta
búsqueda binaria: no hay ancho intermedio donde buscar. De 1 instancia a 142 en un píxel.

La verificación del ancho se hizo **por media query y no por `innerWidth`**, porque la emulación
de 1025 devuelve `innerWidth` 1026 con un dpr efectivo de 1,0000000149. A ese viewport
`(min-width: 1025px)` coincide y `(min-width: 1026px)` no coincide: en términos de CSS el ancho
está en `[1025, 1026)`, que es lo que define el comportamiento de la compuerta. `[medido]`

**Coincide con el breakpoint que B2.1 ya había medido por otra vía.** `tokens/referencia/tokens.json`
tiene `layout.breakpoint-principal` en **1025px**, extraído del bloque de media query con más
reglas del CSS (409, 337, 332, 323 y 314 reglas sobre 26 condiciones distintas). Dos métodos
independientes —conteo de reglas en el CSSOM y conteo de instancias en runtime— dan el mismo
número. `[derivado de medido]`

### 10.4 La compuerta es de ancho, no de táctil

Era la confusión posible, y queda descartada. `[medido]` B4.2a midió 390 con `mobile`+`touch`
emulados, así que en su contraste **ancho y táctil variaban juntos** y cualquiera de los dos
podía explicar el corte.

Este sprint los separa: **768, 1024, 1025, 1440 y 1920 se midieron todos con `isTouch: 0`**. A
768 y a 1024, sin táctil, la coreografía **sigue apagada** (1 instancia en total). A 1025, sin
táctil, **se enciende entera**. El táctil no cambia nada; el ancho lo cambia todo.

`ScrollTrigger.isTouch` vale 1 únicamente en las tres capturas de 390, que son las únicas con
`touch` emulado — o sea que la bandera responde a la emulación, no a la compuerta.

### 10.5 Lenis tampoco existe bajo la compuerta

**Bajo 1025 la instancia de Lenis no se crea.** `[medido]` El recorrido del árbol de fibras la
busca y no la encuentra en las nueve capturas de 390, 768 y 1024 —entre 2.094 y 4.498 nodos
visitados— y la encuentra en las nueve de 1025, 1440 y 1920.

Cuando existe, su `lerp` es **0,1** en las nueve capturas, que **reproduce exactamente** lo que
B4.2b midió a 1440. Este sprint no aporta un valor nuevo de `lerp`: aporta que **la instancia
entera está del lado de arriba de la compuerta**.

Con `smoothWheel: true` y `wheelMultiplier: 1`, también reproducidos. Eso completa el cuadro que
B4.2a había dejado a medias: bajo la compuerta no hay coreografía **y tampoco hay scroll suave**.

### 10.6 Qué significa para la construcción

**El número que Valentino necesita es 1025.** `[derivado de medido]` La referencia no degrada la
coreografía progresivamente: la tiene o no la tiene, y el interruptor es un solo píxel. Todo lo
que documenta este archivo —los nueve patrones, las 291 instancias, el `lerp` de Lenis, las
curvas— **existe únicamente a partir de 1025 px de ancho de CSS**. Abajo hay `sticky` nativo y
scroll del navegador.

Que el corte coincida con el breakpoint principal del CSS `[derivado de medido]` sugiere que no
es una decisión de performance tomada aparte, sino **el mismo breakpoint del layout gobernando
también la capa de animación**: una sola condición, no dos sistemas.

---

## Conclusiones

**1. El sitio tiene 11 secuencias pinneadas a 1440 y 6 a 390 [medido].** Repartidas:
`services` 5, `home` 2, `studio` 2, `work` 1, `case` 1, `news` 0. En mobile quedan
`services` 4, `home` 1, `studio` 1.

**2. El pinneado es CSS `sticky`, no GSAP [medido].** `pin: false` en las 304
instancias del corpus y 0 `.pin-spacer` en las 18 capturas. Para reproducir el ritmo
del sitio no hace falta ScrollTrigger: hace falta `position: sticky` con contenedores
altos. ScrollTrigger hace otra cosa —revelar elementos— y las dos capas son
independientes.

**3. La home tiene 20,5 momentos reales contra 23,47 pantallas nominales [derivado].**
La compresion es leve en la home. Donde es brutal es en `case`: **3,4 momentos sobre
13,81 pantallas**, porque un solo `sticky` a `top: 100px` consume 11,40 pantallas
seguidas. Y en `services`: 16,1 momentos sobre 18,54, repartidos en cinco secuencias
de cerca de 1,5 pantallas — un patron regular, no una escena única.

**4. Mobile es otro sitio [medido].** 291 instancias de ScrollTrigger a 1440, **1** a
390. Lenis no se carga. Cinco de las seis URLs quedan literalmente sin coreografía de
scroll. Lo único que cruza es el pinneado CSS y un tramo de 6 pantallas en la home.
Quien reconstruya esto tiene que decidir explícitamente si quiere el mismo corte,
porque no es una degradacion gradual: es un interruptor.

**5. La coreografía es un sistema chico, no una lista larga [medido].** 291
instancias, 9 patrones, uno solo cubre el 64,6 por ciento. Todo con `scrub`, sin un
solo callback, sin `snap`, sin `horizontal`, sin timelines maestras. Es reproducible
con un puñado de utilidades, no con 291 animaciones a mano.

**6. La mitad de las instancias son el pie [medido].** 23-24 por página, idénticas en
las seis URLs. `work`, `case` y `news` **no tienen ninguna otra**: su contenido no lo
anima GSAP. Si la identidad visual de esas páginas se mueve, se mueve en el canvas
WebGL, y eso es B4.5.

**7. `prefers-reduced-motion` se respeta en la animación y se ignora en el scroll**
**[medido].** 291 -> 12 instancias, y `globalTimeline` cae de hasta 141 hijos a 8 en el peor caso. Pero Lenis sigue
cargado y activo con la preferencia puesta. **Hallazgo de accesibilidad, no de motion**,
para `A11Y.md`.

**8. Qué haría falta construir para reproducir esto [derivado]:**

- GSAP 3.13 más ScrollTrigger, sin ScrollSmoother ni Observer.
- Un scroll suave (Lenis o equivalente) **solo en no-táctil**, con `scrollBehavior:
  smooth` nativo como camino de mobile.
- **Una** utilidad de revelado con `scrub`, ancla `top bottom-=80px` -> `bottom
  bottom-=240px`, que cubre dos tercios de los casos; una segunda con `top bottom` ->
  `bottom bottom` y `scrub: true`; el resto son excepciones contadas.
- El ritmo, en CSS: contenedores altos con un hijo `sticky`. Los `top` medidos son
  `0px`, `24px`, `100px` y `450px`.
- Un gate de `prefers-reduced-motion` que apague las instancias — y, a diferencia de la
  referencia, que **también** apague el scroll suave.
- **La curva de easing sigue sin identificarse** (sección 3). Es lo que falta para que
  la reproduccion sea al detalle y no solo estructural.


### Ampliación de B4.2b — 2026-08-22

**9. La curva estaba perdida, no era a medida [medido].** El hueco 1 de este documento
—"la curva de easing de 280 de los 291 tweens no se identificó"— **queda cerrado**. Las
cuatro páginas medidas usan entre 3 y 5 funciones de easing distintas, y **todas las que
usa un tween identifican contra el catálogo de GSAP con error exactamente 0,000000**.
Seis curvas cubren los 278 tweens autorales, y `power1.out` sola cubre el 84,5 %. No hay
curvas a medida. Lo que se había perdido era el nombre, no la forma: GSAP resuelve el
nombre a función al construir el tween.

**10. Sí alcanza para reconstruir la capa de coreografía [derivado de medido].** Es la
pregunta que este sprint tenía que contestar, y la respuesta es que sí, con una condición.
Lo que hoy está medido y es suficiente:

- Los nueve patrones, con sus anclas `start`/`end`, su `scrub`, su curva, su duración
  declarada, su `stagger`, sus valores de origen y de destino, y el tipo de elemento sobre
  el que corren. Dos patrones cubren el 90 % de las instancias (P1 y P2).
- El catálogo de curvas, con los 21 puntos de cada una.
- La configuración completa de Lenis, que era el último parámetro de sensación sin medir.
- El pinneado, que B4.2a estableció que es CSS `sticky` y no GSAP.

**La condición es que se reproduzca con GSAP.** La traducción de `autoAlpha` a
`opacity` + `visibility`, de `translateZ` a `z`, de `scale` a `scaleX`/`scaleY`, y el
manejo de `yPercent` respecto de la altura propia del elemento, son comportamiento de
CSSPlugin. Reproducir las claves declaradas contra CSS plano **no da el mismo resultado**.
Está medido qué reescribe GSAP (sección 9.5), así que se puede replicar sin GSAP, pero es
trabajo explícito y hay que decidirlo, no descubrirlo a mitad de camino.

**11. Lo que falta no es de esta capa [derivado].** Con lo medido se puede reconstruir el
*qué*, el *cuándo* y el *con qué curva* de las 244 instancias a 1440. Lo que sigue abierto
es de otro orden y está declarado en los huecos: el contenido de los planos de la
secuencia 3D de la home (P7) y de las 32 piezas de `studio` (P8) —qué son esos elementos,
no cómo se mueven—, el canvas WebGL que es alcance de B4.5, y las decisiones de mobile,
que B4.2a dejó planteadas como un interruptor y no como una degradación.

> **Constancia B4.5 (2026-08-23).** Dos de esas tres cosas quedaron cerradas, y una en
> contra de lo previsto.
>
> **Qué son los elementos de P7 y P8: elementos del DOM, no objetos de la escena.** Se
> resolvieron las 12 rutas ancladas de P7 y las 32 de P8 contra el DOM vivo: las 44 son
> `Element` (`div`, `h2`, `img`, `a`), **ninguna es `Object3D`**, las 44 tienen
> `matrix3d(...)` computado —con el `-3000` de Z incluido— y `perspective: 1000px` en un
> ancestro. Además, GSAP anima 235 targets y **ninguno** es de three.js. **Todo el 3D
> coreografiado del sitio es CSS 3D sobre el DOM.** Ver `WEBGL.md` §9.
>
> **El canvas WebGL: medido**, en `WEBGL.md`. El scroll mueve ahí una sola cosa, la
> posición de una cámara; ni un objeto del grafo se mueve con el scroll de forma
> reversible.
>
> **Mobile: era una degradación, no un interruptor — para esta capa.** La escena WebGL
> **sí se envía a 390**, con las mismas seis escenas y las mismas 32 luces, recortando
> geometría (−67 % de triángulos), el post-procesado entero y `pixelRatio`. El patrón de
> interruptor que B4.2a midió vale para la coreografía, **no** para el WebGL.

**12. Un 7 % de la coreografía no hace nada [medido].** 17 de las 244 instancias animan
elementos desprendidos del documento. Scrubbean, consumen runtime y no mueven un píxel.
Para la reconstrucción es una instrucción clara: **ese 7 % no hay que reproducirlo**, y
conviene entender por qué pasa antes de repetir la arquitectura que lo produce.


## Huecos declarados

1. **La curva de easing de 280 de los 291 tweens no se identifico.** Llegan como
   `function` en `vars.ease`. GSAP resuelve los nombres a funciones al construir el
   tween, así que el nombre puede haberse perdido aunque fuera estándar. No se estimó.
   Lo cerraría muestrear la funcion en varios puntos de `[0,1]` y ajustarla contra el
   catálogo de GSAP, que no estaba en el alcance de este sprint.
2. **`prefers-reduced-motion` se emuló por shim de `matchMedia`, no por CDP.** La via
   CSS no quedó emulada. El riesgo esta acotado por medición —0 reglas CSS que
   mencionen la preferencia en las 18 capturas— pero no es lo mismo que emularla de
   verdad. Lo cerraría un `Emulation.setEmulatedMedia` por CDP crudo.
3. **El `sticky` del pie tiene `top: auto` y su rango sobre el eje superior es**
   **`null`.** Se verificó que su contenedor mide exactamente lo mismo que el, con lo
   cual no puede aportar recorrido; pero si estuviera anclado por `bottom`, el
   comportamiento de revelado del pie no esta medido por este sprint.
4. **Una sola corrida por celda.** 18 capturas, 18 combinaciones. Los `docHeight`
   reproducen los de B3.1 al píxel en 11 de 12 —`home@390` difiere en 57px sobre
   18.544, un 0,3 por ciento—, lo que da confianza en la estabilidad, pero el conteo
   de instancias de ScrollTrigger **no se repitió** en ninguna celda.
5. **`home@390` mide 18.487px contra los 18.544px de B3.1** (-57px, 0,31 por ciento).
   No se explicó. Las otras once celdas reproducen exacto.
6. **La asignación de instancias a bandas usa la caja del elemento trigger**, no el
   rango de scroll. Son dos sistemas de coordenadas distintos y la eleccion es una
   convención de este documento. Con el rango de scroll los conteos por banda
   cambiarían; los totales, no.
7. **Los `start`/`end` declarativos que no validan contra la gramática de posición se
   guardaron como longitud y palabras**, así que su forma exacta se perdió a propósito.
   Son 3 de 291 (los `(no declarado)` de la tabla de la sección 3, que usan el default
   de ScrollTrigger).
8. **No se midió que anima cada tween.** Se registro cuantos targets tiene y con que
   easing, no qué propiedades toca. Eso es lo que haría falta para reproducir el efecto
   visual, y es alcance de B4.2b o de la sesion humana de motion.
9. **La instancia desprendida de la home no se investigó.** Se sabe que existe, que su
   rango es 0px y que aparece con y sin reduced-motion. Por qué queda sin matar, no.
10. **Anchos intermedios sin medir.** 768, 1024, 1025 y 1920 no se tocaron en este
    sprint. Dado que `isTouch` y la carga de Lenis son los interruptores, el corte real
    entre "sitio con coreografía" y "sitio sin coreografía" **no esta localizado**:
    solo se sabe que esta entre 390 y 1440.


### Ampliación de B4.2b — 2026-08-22

**Constancia sobre el hueco 1.** Queda **cerrado** por la sección 9. No se borra el texto
original: se deja como registro de qué se sabía en B4.2a. La respuesta es `power1.out` en
el 84,5 % de los casos, con error de identificación 0,000000.

**Constancia sobre el hueco 8.** "No se midió qué anima cada tween" queda **cerrado** para
`home`, `studio`, `services` y `case` a 1440, que era el alcance declarado de B4.2b.
Sigue abierto para `work` y `news` (ver hueco 15) y para 390 (ver hueco 16).

11. **La función de easing de Lenis no se identificó.** Es la única `[desconocido]` del
    sprint. Su vecino más cercano del catálogo es `expo.out` a 0,006813, casi siete veces
    la tolerancia declarada de 0,001, así que se rechaza y no se aproxima. Sus 21 puntos
    están en la sección 9.6 y en los cuatro volcados. **El riesgo práctico es bajo**: con
    `duration` sin definir, Lenis corre en modo lerp y esa curva no se usa para el scroll
    continuo. Lo cerraría comparar contra el catálogo de curvas propias de Lenis, que no
    estaba en el alcance.

12. **Por qué hay 17 instancias con targets desprendidos, no se investigó.** Está medido
    que existen, cuántas son por página, que ninguna es un caso parcial y que sus triggers
    siguen en el documento. La causa —probablemente un re-render de React que deja el DOM
    viejo con sus ScrollTrigger vivos— **es una hipótesis, no una medición**, y se declara
    como tal. Lo cerraría instrumentar la creación de instancias durante la hidratación.

13. **Las rutas de esos 156 targets desprendidos no son reproducibles.** Su ruta no llega
    al `<body>`, así que se guardaron con prefijo `?>` y describen la posición dentro de un
    subárbol suelto, no dentro del documento. Son inutilizables para localizar un elemento.
    Se guardan igual porque permiten contar y agrupar.

14. **Los targets se guardaron hasta 8 por tween**, con el total aparte. En P3 (hasta 33
    targets) y P8 (32) eso significa que **la mayoría de las rutas concretas no está en el
    volcado**. Fue una decisión de alcance del sprint, no un fallo: los patrones se
    caracterizan por su tween, no por enumerar targets. Si hiciera falta la lista completa,
    hay que volver a correr la extracción sin el tope.

15. **`work` y `news` quedaron fuera de B4.2b.** B4.2a estableció que su contenido no lo
    anima GSAP y que sus 23-24 instancias son el pie, idéntico al de las otras páginas.
    **Eso se asume, no se volvió a verificar en este sprint.** Si el pie de `work` o `news`
    difiere del de `case`, no lo sabríamos.

16. **A 390 no se midió nada de esto.** B4.2a estableció que hay 1 instancia contra 291, y
    B4.2b no volvió a mirar mobile. Qué propiedad anima esa única instancia y con qué
    curva **es un hueco**, aunque acotado a un solo caso.

17. **Una sola corrida por celda, otra vez — con una excepción útil.** Las cuatro capturas
    finales son una corrida cada una. Pero la extracción se corrió **dos veces completas**
    sobre las cuatro páginas (la primera con la gramática de posición mal calibrada), y los
    conteos de nodo reprodujeron exacto: 387, 331, 278, 49. Los rangos que mueve el
    `refresh()`, en cambio, **no** reproducen: en `home` dieron 29, 38 y 37 (B4.2a) en tres
    corridas. Eso es variación real de corrida a corrida y conviene tenerlo presente: es un
    número inestable, no un hecho del sitio.

18. **`scale: 1 → 1` en el patrón 1 se reporta como que no anima nada, y eso es una
    lectura.** Lo medido es que el valor de origen y el de destino son ambos 1. Que esté
    ahí para forzar una capa de composición **es una inferencia razonable pero no medida**;
    no se comprobó contra las capas que efectivamente crea el compositor.


### Ampliación de B3.3 — 2026-08-25

19. **El umbral está medido en un solo píxel, y eso es todo lo que se sabe de él.** Se midió
    1024 y 1025, que son enteros consecutivos, así que el corte está localizado sin
    interpolación. Lo que **no** se midió es **cómo** está implementado: si es una media query
    de CSS que monta o desmonta el componente, un `matchMedia` en JS, un `ScrollTrigger.matchMedia`
    o un render condicional del lado del servidor. Que coincida con `layout.breakpoint-principal`
    es una coincidencia numérica verificada, no el mecanismo.

20. **No se midió qué pasa al cruzar la compuerta en caliente.** Las 18 capturas cargan en frío
    a un ancho fijo. Si el usuario redimensiona la ventana de 1024 a 1025 sin recargar, si la
    coreografía se monta sola, si se monta rota o si no se monta, es `[desconocido]`. Para el
    sitio de develOP importa: es el caso de un desktop que arranca con la ventana a medias.

21. **La compuerta se midió sobre tres URLs de seis.** `home`, `studio` y `case`. `work`,
    `news` y `services` quedaron fuera del alcance de B3.3. Los conteos de las tres medidas
    reproducen exactamente los de B4.2a a 1440 (60, 59 y 23), lo que da confianza en que el
    mecanismo es el mismo en las otras tres, pero **no se verificó**.

22. **`isTouch` solo se observó acoplado a la emulación.** Vale 1 en las tres capturas de 390 y
    0 en las quince restantes, que es exactamente el reparto de la emulación `touch`. Que la
    compuerta sea de ancho está demostrado —768 y 1024 sin táctil siguen apagados—, pero **qué
    pasaría en un dispositivo táctil ancho** (una tablet en horizontal a 1280, por ejemplo) no se
    midió y no se puede derivar de estos datos.

# B5 — Que se sienta vivo

Scroll suave, el paralaje de mouse y el cursor. Y el arreglo del congelamiento
que hacía que nada de eso se pudiera sentir.

> **Lo que este reporte NO dice.** No dice que se siente vivo. Eso lo juzga el
> humano grabando, y es el gate real del bloque. Acá hay números con su
> instrumento, y las cuatro capturas de `docs/rediseno/capturas/b5/`.

---

## 0. Lo primero: la escena estaba congelada, y ninguna medición lo había visto

**En toda visita repetida de la sesión, la escena quedaba clavada en la pose 0 y
sin física.** No se movía con el scroll, no tenía inercia, no tenía offset de
mouse y no tenía vira. Es la queja del humano —*«la escena atrás no está viva,
está atascada»*— literal, y con causa.

**Medido**, en las condiciones exactas de un F5 real (`navigator.webdriver ===
false`, `sessionStorage['home:intro'] === '1'`, sin overlay en el DOM): ocho
lecturas de `data-intro` a lo largo de 4,9 s, **las ocho `covering`**. Con eso
`escenaRetenida()` da `true`, y `ataduraAlScroll.ts` escribe `progress = 0` en
cada cuadro y `physicsEnabled` queda en `false`.

**La causa, en dos módulos.** `useIntroEngine` llama `nudge(progress)` en un
efecto con dependencias `[plan, timeline, progress]` que corre en cada render, no
sólo con la secuencia andando. Ese pulso emite un `'change'` que la suscripción
de `HomeIntro` traducía a `setIntroStage('covering')` **aunque el intro no
estuviera corriendo**.

**El arreglo:** la suscripción se gatea en `state === 'running'`. Con la
secuencia andando no cambia nada —la etapa inicial la publica el efecto de
decisión y el `'clear'` del final lo publica `markIntroPlayed()` antes de que
`state` pase a `'finished'`, o sea con la suscripción todavía viva—. Sin
secuencia, la etapa se queda en `idle`, que es **el contrato que
`markIntroPlayed` ya tenía escrito**: *«cuando el intro NO corrió, el estado se
queda en `idle` — que significa "no hay intro", no "el intro terminó"»*.

### Lo que cambia en el sitio vivo: nada, y está medido

`HomeIntro.tsx` lo comparte `/`. **El `IntroStage` lo consume UN solo módulo en
todo el repo, y es `/v3`**: `EscenaDelHome` / `ataduraAlScroll` (por
`getIntroStage`, `useIntroStage` y `subscribeIntroStage`) y `retencion.ts` (por
`isSceneHeld`). El único otro lector es `markIntroPlayed`, que ya decidía por
`isSceneHeld()`. **`useChromeRevealed` —el que revela el dock y el widget— no lee
la etapa**: lee el atributo `data-home-intro` del `<html>` y el evento
`home-intro:finished`, y ninguno de los dos se toca.

**Verificado en el navegador, con control positivo**, en los dos casos que la
condición separa:

| caso | antes | después |
|---|---|---|
| intro salteado (visita repetida) | `covering` para siempre | **`idle`** |
| intro corriendo (primera visita) | `covering` → `revealing` → `clear` | **idéntico** |

El control positivo es que el MISMO instrumento ve el cambio donde tiene que
verlo (`/v3`, caso salteado) y no lo ve donde no (la secuencia completa). Si el
lector estuviera roto, el segundo caso no habría mostrado las tres etapas.

### El nombre del hallazgo, y por qué nadie lo vio en catorce sprints

**«La escena congelada en la visita repetida».** Y la causa de la ceguera es una
sola: el gate pre-paint **no arma el intro cuando `navigator.webdriver` es
`true`** (`introBoot.tsx`), así que **toda medición automatizada de este repo cayó
siempre en la rama del intro salteado —la rama rota— sin tener con qué
compararla.** Es **D11 de B4-B mordiendo de verdad**: aquel hallazgo decía que el
preloader no se puede verificar por automatización; lo que no se había visto es
que la rama que la automatización SÍ recorre estaba rota.

El banco de B5 lo cierra con `PUENTE_DE_AUTOMATIZACION` (`scripts-b5/b5-comun.ts`):
define `navigator.webdriver = false` antes del primer pintado. **No cambia el
producto** — saca el detector de automatización del medio para que el producto se
comporte como se comporta con una persona. Lo que se fuerza es la ENTRADA del
instrumento, no la salida que después se afirma.

---

## 1. LA DERIVA AUTÓNOMA NO SE CONSTRUYÓ. Que nadie la vuelva a proponer.

La instrucción la pedía como «lo único que seguro no existe», y el humano dejó
escrito de quién era la premisa: **la agregó él a la instrucción, y la retiró
cuando la medición se la refutó.** Queda acá con sus dos números para que no
vuelva a entrar por la puerta de atrás.

**Las dos mitades de esa premisa son falsas, medidas antes de construir nada:**

| con la página quieta, sin eventos de puntero, 5 s | píxeles que cambian > 3 | media de delta | corrimiento horizontal |
|---|---|---|---|
| **la referencia** | 36,8 % | 5,86 | **0 px** en las tres bandas |
| **nosotros** | 29,8 % | 6,01 | **0 px** en las tres bandas |

1. **La referencia tampoco deriva la cámara.** Lo que cambia en su pantalla es
   textura —aurora, agua, partículas—, no encuadre.
2. **Nosotros ya tenemos esa misma textura viva**: las partículas por conchas, el
   moiré de la envolvente y la vira del logo.

Lo que separaba a la referencia de nosotros no era una deriva: era **el paralaje
de mouse**, ≥120 px contra 12. Por eso B5 amplificó el offset y no agregó un
movimiento nuevo.

Y lo que el humano pidió de verdad, releído: que las cosas se muevan —ya pasa—,
que la cámara se acomode después del scroll —ya pasa— y que el mouse la mueva.
**Ninguna de las tres era una deriva autónoma.**

---

## 2. EL OFFSET DE MOUSE EXISTÍA Y NO LLEGABA

**Un parámetro declarado sin efecto es peor que uno ausente: nadie lo busca.**
`MOUSE_ANGLE_DEG`, `MOUSE_HEIGHT_FACTOR` y `MOUSE_TAU` estaban escritos desde S6,
con su docblock, sus dos canales elegidos y su constante de tiempo calibrada. Y
**el evento nunca les llegaba.**

Sumado al congelamiento de §0, explica por completo lo que el humano grabó: la
escena clavada en la pose 0 y sin física, y el único movimiento que quedaba —el
del puntero— muerto en un `z-index`.

### La causa

El div al que r3f conecta su sistema de eventos vive en **`z-0`, debajo de las
ocho secciones**, que son `pointer-events: auto` en `z-10`.
`document.elementFromPoint(24, 450)` devuelve la `<section>`, nunca el div de r3f.
El `pointermove` no burbujea hacia él porque no es su ancestro: son hermanos.

**Medido con mouse REAL por CDP, con control positivo:**

| estado | puntero de un borde al otro | Δ centroide del logo |
|---|---|---|
| paneles como están | 941,55 → 941,91 | **0,36 px** |
| con `pointer-events: none` en el contenido | 941,60 → 943,37 | **1,77 px** |
| **con el arreglo puesto** | 940,55 → 942,89 | **2,34 px** |

La única diferencia entre las dos primeras filas es **quién recibe el evento**.

**El arreglo**: `<Canvas eventSource={document.documentElement} eventPrefix="client">`
(`fuenteDeEventos.ts`, con el porqué de que los dos van juntos — con un
`eventSource` que no es el canvas, `offsetX` es relativo a la caja del párrafo que
recibió el evento y daría un puntero que salta). Los listeners que r3f registra
son **pasivos**, así que no le pelean el scroll a Lenis.

### ⚠️ Y mi error de la PARADA 1, con su nombre

En la PARADA 1 reporté lo contrario: *«el offset del mouse EXISTE y FUNCIONA en el
home»*, con 2,51 px de corrimiento contra 0,23 px de control. **La medición
estaba mal hecha**: despachaba el `PointerEvent` **directamente sobre el div de
r3f**, que es la única entrada que el producto no puede recibir. El instrumento
entregaba a mano lo que el producto no recibe, y después afirmaba que el producto
lo recibía.

**Verde por arnés**, con la forma exacta que B4-B nombró. El discriminador es la
pregunta de siempre — *¿qué parte de esta afirmación la puso el propio
instrumento?* — y la respuesta era: **la entrega del evento**.

Queda escrito en el código, no sólo acá: `fuenteDeEventos.ts` lleva el episodio
entero en su docblock, porque el próximo que mida el puntero de esta escena va a
leer ese archivo antes que este reporte.

---

## 3. El paralaje: VARIABLE POR TRAMO, con el techo de cada tramo medido

La instrucción pedía amplificar hacia los ≥120 px de la referencia **con techo
medido**. La primera versión de B5 aplicó **un techo único de 8°** —el mínimo
global— y el humano lo devolvió con la razón correcta: **el hero aguanta 22° sin
degradar y es la primera pantalla, la que se juzga.** Un mínimo global es regalar
paralaje justo donde más se ve.

**Ahora cada tramo tiene el suyo, derivado de su propio contraste.**

| tramo | qué texto cae sobre la sala | piso de AA | techo medido |
|---|---|---|---|
| **hero** | el titular, 56 px | 3:1 (texto grande) | **22°** |
| **cierre** | el cuerpo de 15 px del diferencial | 4,5:1 | **8°** |

### La verificación, tramo por tramo, con el puntero en las cinco posiciones

`scripts-b5/b-paralaje.ts` —máscara de glifo sin escena, mouse real por CDP,
cinco posiciones más el par de media altura— con la tabla ya puesta:

| escenario | azimut que le toca | mediana peor | píxeles bajo AA (peor) | de |
|---|---|---|---|---|
| **hero · titular** | 22° | **13,87:1** | **27** | 15.065 |
| **diferencial · titular** | 8° | 6,47:1 | 318 | 39.459 |
| **diferencial · cuerpo** | 8° | **4,52:1** | 10.523 | 22.387 |

El hero a 22° queda **exactamente donde estaba a 2,2°** —entre 0 y 27 píxeles bajo
AA de 15.065, o sea 0,18 %— y su mediana no baja de 13,87:1 en ninguna de las
siete posiciones. El cuerpo del diferencial se queda en **4,52:1 contra el piso de
4,5**, que es el techo que ya se había bisecado: 2,2° → 4,58 · 8° → 4,52 ·
22° → **4,35, bajo AA**. La caída es de ≈**0,011 por grado**.

### Lo que se gana, con el número

Corrimiento del centroide de la silueta del logo en el hero, barriendo el puntero
de un borde al otro —la cifra limpia, monótona en las tres corridas—:

| azimut del hero | centroide | paralaje de banda |
|---|---|---|
| 2,2° (antes de B5) | 2,34 px | 12 px |
| 8° (techo único) | 9,05 px | 23 px |
| **22° (por tramo)** | **22,54 px** | 17–20 px |

⚠️ **El paralaje de banda es ruidoso y el centroide no.** La correlación de
perfiles de columna elige distintos rasgos entre corridas —17, 20 y 23 px para el
mismo estado— mientras el centroide sigue la amplitud linealmente (2,34 / 8 = 1,06
· 9,05 / 8 = 1,13 · 22,54 / 22 = 1,02). La cifra de banda se publica porque es la
que se midió sobre la referencia y es la única comparable; la del centroide es la
que se usa para calibrar.

> **El resultado, con el número: el hero pasó de 12 a ≈20 px de paralaje de banda
> y de 2,34 a 22,54 px de corrimiento del logo. Contra los ≥120 px de la
> referencia sigue siendo del orden del 17 %.** La referencia orbita un paisaje
> con profundidad; nosotros orbitamos un objeto y el fondo es una sala. Subir más
> en el hero no lo frena el contraste —a 22° todavía sobra— sino que empieza a
> leerse como que el objeto gira.

### ⚠️ La rampa entre los dos techos vive donde la escena NO dibuja

Un cambio de amplitud es un movimiento de cámara que nadie pidió: con el puntero
en un extremo, saltar de 22° a 8° mueve el azimut 14° de golpe. La tabla
interpola, **y la rampa entera cae adentro de la banda en la que el lazo está
suspendido**, así que el cambio no se ve ni siquiera repartido.

Muestreando `escenaEnCuadro` sobre el documento entero, la escena dibuja en
**[0 · 0,1354]** y en **[0,7375 · 1]**. Los nudos van en **0,14** y **0,73**.

⚠️ **Y NO son los bordes de tramo.** El hero se sigue viendo 0,0104 después de
que su tramo termina (0,125) y el cierre empieza a verse 0,0125 antes de que
empiece el suyo (0,75). Con la rampa apoyada en los tramos, la amplitud cambiaba a
la vista en **19 posiciones** del barrido — medido, y es lo que puso en rojo a
`s18-azimut` la primera vez. Lo que manda es la ventana de visibilidad, no la
tabla de tramos, y el invariante vuelve a muestrearla en vez de creerle a los dos
números: **0 posiciones visibles con cambio de amplitud**, con control positivo
(con la rampa corrida al hero, el mismo detector las ve).

### El canal de altura no se tocó, y tiene su razón

Techo geométrico recalculado contra los keyframes y el `FLOOR_Y` reales: en
«quiénes somos» (`height −3,6`, `distance 11,5`) la cámara queda a **0,061217**
de irse abajo del papel, y `MOUSE_HEIGHT_FACTOR` vale 0,045 — **1,36× de holgura
y nada más**. El paralaje que falta es horizontal; el canal vertical no tiene de
dónde sacarlo.

### ⚠️ LOS 296 PÍXELES BAJO AA: NO CAEN SOBRE EL LOGO. Es el instrumento.

**La pregunta que había que contestar antes de commitear**, y era la correcta: si
los 296 píxeles caen sobre el LOGO, no es un artefacto —es texto ilegíble sobre
tinta casi negra, el defecto que costó tres sprints cerrar en el diferencial,
reapareciendo en el hero— y la máscara nueva lo **escondería**.

Contestada con `scripts-b5/e-discriminador.ts`, que corre el método VIEJO de B1
tal cual y clasifica cada píxel culpable con **tres criterios independientes**:
si cae adentro de la silueta del logo (geometría, de la captura de fondo), si es
tinta de verdad (si está en la máscara buena), y qué luminancia tiene el fondo
debajo.

```
caja del titular:  x 188–638,56  ·  y 289,45–478,52
silueta del logo:  79.759 px, caja x 682–1192 · y 283–629
[control positivo] el detector dice DENTRO en el centro del logo:  true
[control positivo]   y FUERA en el papel de arriba a la izquierda:  true

máscara VIEJA dentro de la caja:  15.322 px
de esos, bajo AA (3:1):           18 px

culpables que caen SOBRE EL LOGO:       0 de 18
culpables que son TINTA DE VERDAD:      1 de 18
culpables con el fondo OSCURO (<60):    0 de 18
```

**Los tres criterios coinciden: ninguno cae sobre el logo.** El píxel culpable,
con nombre: **(594, 463), 2,56:1, fondo `rgb(86,86,82)`, `logo=false`,
`tinta=false`**. Los dieciocho tienen el fondo entre `rgb(86)` y `rgb(90)` — el
gris medio de **la sombra de la celosía sobre la pared**, no la tinta del logo,
que en esa misma captura mide entre `rgb(14)` y `rgb(20)`. Los dos rangos no se
tocan.

El único que SÍ es tinta está en **(478, 376) a 2,73:1 sobre `rgb(90,90,86)`**:
un píxel de borde antialiasado de 15.322, sobre la sombra de la celosía, contra un
piso de 3:1 para texto grande.

> **Conclusión: es el instrumento, y la máscara nueva es correcta. No esconde
> nada.**

### Y de dónde salían los 296 — dos defectos del instrumento, no uno

**El primero, y el grande: la caja del texto estaba inflada por un `sr-only`.**
El titular contiene **dos copias del texto**: las tres líneas que se ven, y un
`<span class="sr-only">` con la frase entera sin cortar. Ese span lleva
`clip-path: inset(50%)` —no pinta un solo píxel— pero **mide 1.076 px de ancho**,
contra los 451 de la línea visible más larga. La unión de cajas terminaba en
**x 1.263** en vez de en 639, o sea **por encima del logo**, que vive entre 682 y
1.192.

Con esa caja, el método viejo marcaba **939 píxeles «bajo AA» sobre el logo** que
no son texto: son los bordes del propio logo moviendose entre capturas. Con la
caja corregida, **1.035 → 18**.

El filtro va donde va la causa: se saltea todo nodo de texto con un ancestro de
`clip-path` distinto de `none`, y vive en **una sola definición**
(`b5-comun.ts`), porque los dos instrumentos que miden contraste tienen que medir
la misma caja.

**El segundo: la máscara por diferencia de píxeles ya no cierra con esta escena.**
Los 18 que sobreviven a la caja corregida son bordes de la sombra de la celosía
moviendose despacio entre la captura de fondo y la de texto. En el píxel (611,
309): `A = rgb(88,88,85)`, `B = rgb(88,88,85)` —idénticos, así que el filtro de
movimiento los deja pasar— y `C = rgb(234,234,231)`.

**La salida no es un filtro más fino: es una máscara que no dependa de la
escena.** `scripts-b5/glifo.ts` la saca de una captura **con la escena en
`visibility: hidden`** —texto sobre papel plano— y lee el fondo de otra captura
con el texto oculto. Con eso el hero da mediana **13,9–16,1:1**, que es el orden de
la cifra que B1 publicó (10,45:1).

⚠️ Y trae un piso contra el verde por vacío: `MINIMO_DE_GLIFO`. Existe porque
pasó — a `scrollY = 14400` los cuatro ítems del diferencial tienen caja pero
opacidad heredada **0**, y el instrumento devolvía **384 píxeles de glifo con 0
bajo AA**. Verde por vacío, con la forma exacta que el bloque tiene prohibida.

---

## 4. Lenis: el modo, el asentamiento, el peso y el `sticky`

### El modo, medido antes de prenderla

**Conduce el scroll nativo.** Sobre `lenis@1.3.25`: `wrapper` cae por default en
`window` y `setScroll` hace `wrapper.scrollTo({ top, behavior: 'instant' })`. Y
sobre el DOM renderizado del sitio donde ya corría, un paso de rueda de 1.000 px
muestreado por `rAF`: `window.scrollY` interpola 0 → 1.000 mientras el
`transform` de `<html>`, `<body>` y el primer hijo del `<body>` lee `none` en
**las 138 muestras**. Control positivo: poniéndole una transformada a mano al
`<body>`, el mismo lector la ve.

### El `sticky` y el anclaje sobrevivieron — con scroll REAL

255 paradas de 60 px sobre `/v3` a 1440×900, antes y después:

| pin | arranca | suelta | recorre | ¿cambió? |
|---|---|---|---|---|
| pastilla (`header`, off −804) | 840 | 15300 | 14460 px = 16,07 pantallas | **idéntico** |
| `trabajos` | 7200 | 9000 | 1800 px = 2,00 pantallas | **idéntico** |
| `servicios` | 9900 | 11700 | 1800 px = 2,00 pantallas | **idéntico** |

Los 4 `sticky` encontrados, los 3 que andan, **arrancan y sueltan en el mismo
`scrollY` exacto**, con 0 desvíos de parada (Lenis no se pelea con `scrollTo`).

**El anclaje, bit a bit:** documento 16200, ventana 900, `html`/`body` height
16200px, y las ocho secciones en los mismos `arriba`/`abajo` (múltiplos exactos
de 900). La regla `html.lenis { height: auto }` de `lenis.css` no cambió nada.

**Y la única vía por la que podía romperse, cerrada:** `lenis.css` cuelga
`overflow: clip` de **`lenis-stopped`**, y esa clase la escribe Lenis sólo al
llamar `stop()`. Ninguno de los tres archivos del motor de /v3 lo llama
(afirmado, con control positivo), y sobre el `<html>` vivo, en los cuatro casos
medidos: `lenis-stopped` ausente y `overflow: visible`.

### El asentamiento NO se recalibró, y ésa es la conclusión

La instrucción suponía que había que ajustarlo. **Las dos curvas caen una encima
de la otra**, un paso de rueda de 1.000 px:

| | t63 | t95 | t99 | llegada |
|---|---|---|---|---|
| la referencia (modo `lerp 0.1`) | 166 ms | 557 ms | 753 ms | 1.281 ms |
| nosotros en `/` (modo `duration 1.1`) | 202 ms | 543 ms | 771 ms | 1.036 ms |
| nosotros en `/v3` con el motor propio | **149 ms** | **470 ms** | **710 ms** | **1.030 ms** |

**No se tocó un número de la configuración.** Y el avance por paso de rueda es
1.000 px por 1.000 de delta en los dos sitios: **no multiplica, sólo interpola.**

### El peso neto: CERO, medido sobre el build

| ruta | carga inicial | chunks con `lenis` |
|---|---|---|
| `/v3` | 26 archivos · 381,3 KiB gzip | **1 · 5,5 KiB gzip** — `9752-6d99b73d8d47623a.js` |
| `/` | 24 archivos · 424,9 KiB gzip | **el MISMO archivo, mismo hash** |

Los 5,5 KiB ya se pagaban antes de B5: entran por el layout RAÍZ, que importa
`SmoothScroll` de forma estática. **Prenderla en /v3 cuesta 0 bytes** — se pagaba
el peso sin el beneficio, que era el argumento.

Y las tres compuertas no gotean: **0 chunks** con la marca de la escena, la del
cursor o la del scroll suave en la carga inicial de ninguna de las dos rutas.

### Dónde vive, y qué NO se tocó

`src/app/layout.tsx` **no se tocó**. `SmoothScroll` sigue saliéndose de /v3 con
su `return` temprano y sigue construyendo lo mismo, cuando lo construía, en las
seis rutas de producto; recibió **un solo cambio aditivo**: la configuración
literal pasó a ser `export const OPCIONES_DE_LENIS`, y las dos instancias
construyen con ella (afirmado). `TransitionContext.tsx` **sigue congelado y sigue
viendo `null`**, porque el contexto que consume es el de `SmoothScroll`.

---

## 5. Las tres afirmaciones que decían «Lenis NO corre en /v3»

Ninguna se aflojó: **las tres cambian de propiedad protegida, y la nueva se
verifica en el navegador.**

| dónde | decía | ahora afirma |
|---|---|---|
| `s8-chrome` §3 | que `SmoothScroll` se sale antes, así que la clase nunca llega | que **nadie llama `stop()`** en los tres archivos del motor — que es lo que de verdad sostenía el `sticky`. Verificado además sobre el `<html>` vivo |
| `compuerta` §5 | «/v3 queda fuera de Lenis: el pinneado se juzga con scroll nativo» | que el motor propio cuelga del MISMO umbral importado y construye con la configuración del sitio vivo. El pinneado se juzga **con scroll real**, contra la línea de base de antes |
| `s9-scrollPadding` | «Lenis NO corre: el scroll es NATIVO» | que **`anchors` no se declara** (cae en `false`), así que Lenis no intercepta el click de un ancla y `scroll-padding-top` gobierna el aterrizaje |

### Y el `NO CORRE` que S9 dejó declarado, cerrado

*«el aterrizaje REAL de las siete anclas, medido en el navegador»* salía fuera de
ventana porque aquel sprint tenía prohibido abrir un navegador. Medido ahora, con
el motor prendido y la pestaña al frente:

| ancla | top del panel | scrollY |
|---|---|---|
| `#hero` | 0 | 0 — tope del documento: no hay a dónde subir |
| `#quienes-somos` | **72** | 828 |
| `#numeros` | **72** | 3528 |
| `#trabajos` | **72** | 7128 |
| `#servicios` | **72** | 9828 |
| `#tu-panel` | **72** | 12528 |
| `#por-que-develop` | **72** | 14328 |

**7 anclas, 0 fuera de la vara.**

---

## 6. El cursor: prendido y calibrado HACIA la referencia

`CURSOR_PROPIO_EN_EL_HOME` pasa a `true`. Las dos compuertas de S3 —1025 y
`prefers-reduced-motion`— siguen adelante y no se tocaron.

**El hueco `[decidido]` de `SEGUIMIENTO` se cerró.** S0 no había podido medir el
coeficiente porque *«hacía falta movimiento real sostenido y el instrumento de
CDP no lo produce»*; se cerró con otro instrumento — **el transitorio**: un salto
único del puntero y la posición de las dos capas leída por `rAF` hasta converger.

Referencia, salto de **1.276,5 px**, 124 muestras:

| capa | t63 | t90 | t95 | t99 | coeficiente por cuadro |
|---|---|---|---|---|---|
| núcleo | **336,5 ms** | 814 | 1.082,6 | 1.623,3 | **0,0483** |
| halo | **517,2 ms** | 1.053,3 | 1.337 | 1.969,4 | **0,0317** |

Los valores propios eran **0,22 y 0,12** — 4,6× y 3,8× más rápidos. **Se fue a
los medidos.** La relación que S0 sí había medido —el halo por detrás del
núcleo— se conserva: la razón pasa de 0,545 a **0,656**, prácticamente la de la
referencia (0,657).

**El cursor nativo nunca se oculta:** `cursor: none` no aparece en ninguno de los
cuatro archivos del cursor (afirmado, con control positivo).

---

## 7. Lo que el bloque no podía romper

### `prefers-reduced-motion` sobre las tres, sin arnés

La preferencia la pone **`Emulation.setEmulatedMedia`** —el entorno— y el
instrumento sólo lee lo que el árbol montó. Se verifica además que **la página la
LEE** (`matchMedia(...).matches`), o «no se monta nada» podría estar midiendo una
corrida sin preferencia.

| caso | scroll suave | cursor | escena | quietud de la escena en 5 s |
|---|---|---|---|---|
| **1440 normal** | montado | montado (2 capas) | montada | 31,46 % de los píxeles · media 10,25 |
| **1440 reducido** | **ausente** | **ausente** | montada | **0,00 % · media 0,000** |
| **1024 normal** | ausente | ausente | ausente | 0 % (no hay escena) |
| **1025 normal** | montado | montado | montada | 34,18 % · media 11,11 |

**4 casos, 0 con falla.**

⚠️ **Para la escena la afirmación no es «no se monta» sino «no se mueve», y el
producto tenía razón.** Fue el primer rojo de este instrumento: la escena no es
una animación, es el fondo de la página; desmontarla no sería «menos
movimiento», sería otra composición. Lo que la preferencia apaga vive adentro
(`OrbitRig`: inercia, mouse, vira; la deriva del aire y el moiré por su cuenta).
Y con la preferencia puesta queda **bit a bit idéntica durante 5 s**, con el
control positivo al lado: sin la preferencia, la misma ventana cambia el 31 %.

⚠️ **Lo que esta medición deja AFUERA, declarado:** el sistema de motion del
contenido —las revelaciones de las secciones— sigue sin honrar la preferencia.
Es el hallazgo de B4-B (2.380 transformadas idénticas con y sin ella) y su
arreglo es de otro bloque. Se lo deja fuera midiendo después de que las
revelaciones terminan (4 s), y se declara acá en vez de taparlo.

### El progreso NO se mueve

Con la página quieta y el puntero barriendo las cinco posiciones:

```
entradas idénticas: true
progreso 0.388888888889 → 0.388888888889   ·   IDÉNTICO: true
[control positivo] con UN píxel de scroll pasa a 0.388923611111 — delta 3,472e-5
```

**Y la garantía fuerte no es ésa: es que el módulo no PUEDE escribirlo.**
`modulacionDeLaPose.ts` recibe números y devuelve números; no importa el store,
no nombra `progress`, y sus dos únicas importaciones son la amortiguación y las
constantes. `s18-modulacion.invariant.ts` lo afirma sobre la forma (con control
positivo) y sobre el valor.

### El techo de velocidad de B2

**El track no se tocó**: `s16-techo` y `s13b-escena` corren en verde con las
mismas 48 + 16 afirmaciones. El pico de 4,6531 fh/pantalla es una propiedad del
recorrido, y el recorrido es el mismo — ni un keyframe, ni un tramo, ni el
reparto por pantalla cambiaron.

⚠️ **Y lo que el offset de mouse le suma, dicho aparte porque es de otra
naturaleza.** El techo de B2 mide alturas de cuadro **por pantalla de scroll**;
el offset de mouse no está atado al scroll, así que no entra en ese cociente. Lo
que aporta es una **excursión acotada por tramo**: ±22° en el hero y ±8° en el
cierre, o sea ±0,3840 y ±0,1396 rad, que a cualquier distancia son
`Δθ / (2·tan(fov/2))` alturas de cuadro — independiente de la distancia por
construcción—. No acumula con el scroll y el visitante la controla.

Y el techo por tramo tiene su propia garantía, afirmada en `s18-azimut`: **la
curva no sube en ningún punto del recorrido**, así que ningún progreso recibe más
azimut que el que su tramo midió.

### FPS — la mediana y el p05 no se mueven; **el mínimo sí, y es atribuible**

Las mismas tres cifras que publicó B4-B sobre 765 cuadros: **mediana 75,2 · p05
74,6 · mínimo 73,5**.

| | cuadros | mediana | p05 | mínimo | cuadros > 20 ms |
|---|---|---|---|---|---|
| **quieta** (la situación nueva) | 226 | 75,19 | 74,63 | 74,07 | **0** |
| recorrido 1 | 898 | 75,19 | 74,63 | **37,45** | 2 |
| recorrido 2 | 900 | 75,19 | 74,63 | 68,97 | 0 |
| recorrido 3 | 899 | 75,19 | 74,63 | **37,45** | 1 |
| **control 1** — sin las tres piezas | 901 | 75,19 | 74,63 | 74,07 | **0** |
| **control 2** — sin las tres piezas | 901 | 75,19 | 74,63 | 74,07 | **0** |
| **control 3** — sin las tres piezas | 900 | 75,19 | 74,63 | 73,53 | **0** |

**La mediana y el p05 son idénticos en las seis corridas** y quedan en la línea de
base o por encima. La página quieta —que es la situación que B5 estrena, porque
antes no pasaba nada— no tiene un solo cuadro largo.

⚠️ **Pero el mínimo sí se mueve, y el control lo atribuye.** El control corre el
MISMO recorrido con `prefers-reduced-motion` —sin Lenis, sin cursor, escena
quieta— y da **cero cuadros arriba de 20 ms en las tres corridas**. Con las tres
piezas hay un cuadro de ≈26,7 ms en dos de tres, **siempre alrededor del cuadro
439**, o sea `y ≈ 10.500`, adentro de Servicios. Eso no es ruido del sistema
operativo: es sistemático y tiene dueño. Va como **D-B5.5**.

### LCP

Mismo viewport, mismo instrumento, con el motor prendido y apagado:

| | LCP | elemento |
|---|---|---|
| motor prendido | **364–408 ms** | `H1.font-titulo text-fluido-titulo-xl` |
| motor apagado | 364–448 ms | el mismo |

**Lenis no lo empeora**, y el argumento estructural sobrevive a cualquier número:
el LCP es texto que pinta el HTML del servidor, y la instancia se construye en un
efecto de un módulo perezoso, o sea **después** del pintado que el LCP mide.
⚠️ Los 2.378 ms de mediana de B4-B (techo 2.500) **no son comparables**: otro
build, otro estado de caché. Y la corrida entera es sobre `next dev`.

### Abajo de 1025

**Ninguna de las tres se carga.** Caso `1024-normal`: `data-v3-scroll-suave`
ausente, 0 capas de cursor, `data-escena` ausente. Y el par 1024/1025 straddlea
el umbral con el mismo alto, así que la única variable es el ancho.

---

## 8. Lo que queda abierto

### 🟠 D-B5.1 · El cuerpo del diferencial arranca al borde de AA — VA AL BLOQUE DE LOS TRECE DEFECTOS

Con el puntero quieto en el centro, `scrollY = 14800`: mediana **4,65:1** y
**33 % de sus 22.387 píxeles de glifo por debajo de 4,5:1**. El fondo ahí es la
pared gris de la sala.

**No lo introduce B5 y no se mueve con el puntero** —los siete valores caen dentro
del ruido entre sí— **pero es el techo del paralaje del tramo del cierre**: es la
razón por la que ese tramo se queda en 8° mientras el hero llega a 22°. El día
que se arregle, ese techo sube solo.

Queda **abierto y con nombre**, y va al bloque de los trece defectos por decisión
del humano.

### 🟠 D-B5.2 · El `<h1>` del hero CAMBIA DE IDENTIDAD entre el HTML servido y el DOM hidratado

**⚠️ Este defecto se reportó mal la primera vez y la corrección cambia la
conclusión. Va con la medición.**

Lo que B5 había escrito: *«el `<h1>` del hero es `sr-only` de 1×1 px, así que
INVALIDA el hallazgo de LCP de B4-B»*. **Lo primero es cierto y lo segundo es
falso.** Medido contra el HTML del servidor con `curl`:

| dónde | el único `h1` del documento |
|---|---|
| **HTML servido** | `<h1 id="titular-hero" data-texto-por-lineas="entero" class="font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo">` — el titular grande |
| **DOM hidratado** | `<h1 id="titular-hero" class="sr-only">` — **1×1 px**, `clip-path: inset(50%)`, área **1 px²** |

Hay **un solo `h1` en todo el documento**, y **cambia de identidad al hidratar**:
el servidor manda el título entero adentro del `h1`, y el cliente lo parte en las
tres líneas animadas de la coreografía y le deja al `h1` el papel de etiqueta
accesible.

**Por lo tanto el hallazgo de B4-B se sostiene entero.** En el instante que el LCP
mide —el pintado— ese `h1` **es** el titular visible de 34.892 px², que es
exactamente lo que aquel reporte midió. La conclusión *«el LCP depende de cuándo
se puede pintar el titular: de la fuente y del HTML, no del peso del JS ni del
costo de la escena»* **no se corrige: sigue valiendo**. Y el observador de LCP de
B5 lo confirma de forma independiente — reporta el elemento como
`H1.font-titulo text-fluido-titulo-xl`, o sea con las clases del titular, porque
en ese momento todavía las tiene.

**Lo que SÍ es un defecto, y es de otra clase:** una medición que lea el `h1`
**después** de hidratar —como hizo el instrumento de contraste de B5— ve 1×1 px y
no encuentra un solo píxel de glifo. Los dos estados son correctos en su momento;
lo que está mal es cruzarlos. **Toda medición de píxel sobre el titular tiene que
apuntar al `div.font-titulo`, no al `h1`**, y toda medición de carga al `h1`. El
instrumento de B5 cayó en eso: devolvía 50 píxeles de glifo en vez de 15.065.

Y la familia es la misma que la del `span.sr-only` de la caja —§3—: **elementos
accesibles de tamaño no nulo que no pintan un píxel**, contaminando mediciones que
los toman por contenido. Son dos casos del mismo patrón en la misma pantalla.

### 🟠 D-B5.5 · Un cuadro de 26,7 ms en el recorrido, atribuido a las tres piezas

Con las tres piezas prendidas aparece **un cuadro de ≈26,7 ms en dos de cada tres
corridas del recorrido**, siempre alrededor del cuadro 439 (`y ≈ 10.500`, adentro
de Servicios). El mismo recorrido **sin** las tres —con `prefers-reduced-motion`—
da **cero cuadros arriba de 20 ms en tres de tres**. La mediana y el p05 no se
mueven en ninguna de las seis corridas.

**No está aislado a cuál de las tres**, y hay una hipótesis con una consecuencia
sobre el instrumento que hay que decir: el barrido conduce el scroll con
`window.scrollBy(0, 24)` por cuadro, o sea **scroll programático**, y ahí Lenis
resincroniza contra un cambio de posición que no originó él. Un visitante usa la
rueda, y por ese camino Lenis **conduce** en vez de resincronizar. O sea que el
número puede ser del instrumento tanto como del producto — y esa ambigüedad es
parte del hallazgo, no una excusa.

Lo que cerraría: repetir el barrido conduciendo con eventos de rueda
(`Input.dispatchMouseEvent` con `type: 'mouseWheel'`) y comparar. Queda abierto.

### 🟡 D-B5.3 · El sistema de motion sigue sin honrar `prefers-reduced-motion`

Hallazgo de B4-B, no tocado: las revelaciones de las secciones corren igual con
la preferencia puesta. Las tres piezas de B5 sí la honran; **el arreglo global es
de otro bloque** y sigue pendiente.

### 🟡 D-B5.4 · El paralaje sigue por debajo del orden de la referencia

**Resuelto a medias, y la mitad que falta tiene dueño.** La decisión del humano
—offset variable por tramo— ya está tomada y construida: el hero pasó de 8° a
**22°**, y con eso de 9,05 a **22,54 px** de corrimiento del logo.

Contra los ≥120 px de banda de la referencia seguimos en el orden del **17 %**, y
lo que queda **no lo frena el contraste**: a 22° el hero tiene 0,18 % de sus
píxeles bajo AA y mediana 13,87:1, o sea que sobra. Lo que frena es de
composición — más azimut empieza a leerse como que el objeto gira, y eso es una
decisión de dirección, no una medición.

En el tramo del cierre sí lo frena el contraste, y su nombre es **D-B5.1**.

---

## 9. Lo que se corre para reproducir esto

```
npm run verificar                     # 26 pasos, 0 con falla
npm run test:frontera                 # 2 invariantes, 0 con falla
npm run test:s18                      # las dos suites de B5

npx tsx scripts-b5/b-paralaje.ts      # paralaje + contraste bajo el glifo
npx tsx scripts-b5/c-reducido.ts      # prefers-reduced-motion y el umbral
npx tsx scripts-b5/d-vitales.ts       # FPS, LCP, anclas y el progreso
npx tsx scripts-b5/e-discriminador.ts # ¿los píxeles bajo AA caen sobre el logo?
```

El banco son once archivos y ninguno pasa las 300 líneas: `b5-comun.ts` (la
plomería y el lector de cajas), `pagina.ts` (mover el puntero, apagar una capa,
leer la caja), `glifo.ts` (el contraste bajo el glifo y el corrimiento),
`silueta.ts` (la componente conexa del logo), `vitales-lectores.ts` (los fuentes
que corren en la página) y los cinco instrumentos.

Las cifras quedan en `docs/rediseno/outputs/b5/*.json` con su instrumento
declarado. Las capturas intermedias (63 PNG, 52 MB por corrida) van a
`.b5-capturas/`, que está en `.gitignore`; las cuatro del reporte están en
`docs/rediseno/capturas/b5/`.

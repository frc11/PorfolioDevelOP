# SPRINT PULIDO 5 — la última iteración del CTA y de la luz del encastre

Rama `rediseno/home`. Invariante nuevo: `npm run test:s56-pulido-5` (`src/app/v3/_lib/__tests__/s56-pulido-5.invariant.tsx`).
Entregas: `docs/rediseno/entregas/pulido-5/` (qué mirar: `mirar.txt`).

Aprobados de PULIDO 4: el mouse del pie (C3), los tokens (C4) y el sonido del golpe, con `golpe-b` como producto (`golpe-a`
se borra, en D2).

## D1 · El CTA

### 1 · El giro en lugar del cruce

El pedido era el GIRO de `2411371a` (`?cta=giro`), no el cruce. Se recuperó con `git show 2411371a:…/variantes.ts` y reemplaza
al cruce, que se borró entero (`transformacion.ts`): «Seis razones / para elegirnos» se junta en un cartel del ancho del CTA
que gira sobre Y; en el medio del giro sólo se ve el canto y del otro lado está «HABLANOS», que se asienta en su lugar. Sus
medidas son las de `2411371a` (`junta` 0,28, `desde` 0,28, `gira` 0,4, `espesor` 0,35, `renglon` 1,12) con dos cambios:

- `baja` dura 0,34 (era 0,18): termina en 1, el mismo punto del scroll en que termina la frase.
- Dónde se arma el cartel (`armadoSobreElCta`): con su borde de abajo en el de «HABLANOS». En `2411371a` el escenario lo armaba a
  0,27 del alto (hoy ahí se arma la frase) y la lista, centrado en el CTA; centrado, su renglón de abajo pisaba en la pantalla la
  cabeza del logo y, al girar, la mitad que viene hacia la cámara le pasaba por delante. Así «HABLANOS» aparece un poco más
  arriba y baja a su lugar con `baja` (el gesto de `2411371a` para el cartel armado en otro lugar).

### 2 · Anclado en el mundo

La frase y «HABLANOS» quedan quietos en la sala, como los títulos de volumen (`planosDelCta.ts`): en el plano donde la cámara del
nudo `cta` (la pose C, sin el mouse) los ve en su lugar del DOM, un poco más lejos que el logo (`MARCO_DEL_CTA.cerca`). En el
primer tramo (`ANCLAJE_DEL_CTA`, 0,02–0,35) el marco del giro va del plano del título de la frase al del CTA y el lienzo de la
metamorfosis va de la pantalla (los valores son del DOM) al del CTA; después los dos son del mundo. Antes terminaban en el
plano de la cámara viva: pegados a la pantalla, seguían al mouse y al scroll. Medido: en el teléfono la cámara está en la pose
C durante todo el bloque clavado (`[0, 4.5, 30.5]`, con el acercamiento), así que el mismo plano sirve en las dos ramas. El lugar
de lectura de la frase y del CTA se mide con su escenario clavado (sin el corrimiento de ahora): no van con la página.

**A1 · lo que se toca:** el enlace del DOM se lleva con una homografía (`homografiaDelCta`, la del pie) al cuadrilátero donde la
cámara viva ve la caja de «HABLANOS» en su plano; con la cámara de la lectura es la identidad. Se escribe sólo si cambia.

### 3 · La tipografía

- **Más ancha:** Archivo del TTF variable (`Archivo[wdth,wght].ttf`), con `?ancho=normal` (wdth 100) y `?ancho=expandido` (120);
  el sitio pincha 62, que en minúsculas se veía estirado. Producto: `normal`. Con el ancho de la pantalla de tope (0,86 en el
  escenario), `normal` deja el cuerpo más grande (a 1440: 80 px contra 65) y se lee como un titular; la comparación está en
  `entregas/pulido-5/d1-anchos-1440.png`.
- **Más grande y con jerarquía de título:** la frase en 600 y «El tuyo también.» y «HABLANOS» en 900. El DOM (que da el lugar)
  pasa a un tamaño de display: la frase a `min(display-xl, lugar/3,65)` (era `min(título XL, lugar/5)`) y «HABLANOS» a
  `lugar/2,8` (era `/3,3`), dentro de la banda centrada de NOCTURNO FINAL D3 (que sigue). Si un renglón no entra en el ancho, toda
  la frase se achica junta (el teléfono). Interletrado apretado de display: −0,012 em la frase y −0,02 em el 900.
- **Kerning:** `scripts-retoque/fuentes-3d.py` lee los pares del GPOS de la fuente ya instanciada (`kern`, PairPos de formato 1 y
  2, con extensión) y los escribe en el JSON (`kerning`); la frase y «HABLANOS» los aplican (`fuentesDelCta.ts`, `avancesDe`).
  «HABLANOS» ya no toma las x del DOM (otra fuente): va con sus avances y su kerning, centrado en la caja del DOM.
- **Los agujeros:** se midió en vez de suponer. Las formas que arma three para cada glifo de la frase tenían bien sus agujeros
  y sus sentidos. Las «manchas» y los «puntos» en la frase terminada (la «o» de «sitio», la «e» y la «ó» de «empezó») eran
  del disolvente de `fusion` (el producto de entonces): con el corte en 1 y el ruido saturado a 1, `corte >= uCorte` seguía
  descartando las zonas donde el ruido saturaba. Ahora el umbral va de 0,001 a 0,999. Igual, el sentido de los contornos ya no
  depende de la fuente: el script decide qué es agujero por anidamiento (adentro de un número impar de otros contornos) y lo
  escribe en el sentido que three espera (`contornos_en_su_sentido`), y `s56` afirma, para cada glifo de las cinco fuentes de la
  metamorfosis, que los agujeros de three son los del anidamiento (36 glifos con agujero).

### 4 · `contorno`, la del producto

`fusion` queda con `?meta=fusion` hasta que se confirme.

- **Rígida al formarse:** la turbulencia es una campana (sin² sobre 0,08–0,6) que es cero exacto desde 0,6, antes de que
  termine el cambio (0,64). Lo que sigue (los agujeros que se abren, venir adelante, crecer en espesor) son movimientos rígidos.
  Al terminar (p = 1) se cambia por la malla 3D exacta de la frase, con el bisel de los títulos.
- **Emparejados por posición y área:** asignación óptima con el método húngaro (`asignar`). El costo es el lugar del contorno
  en la composición de su texto (normalizado a la caja de cada texto) más el logaritmo de su área relativa. Hay ~390 letras de
  valores contra ~42 de la frase: los que sobran se cierran sobre su centro en la primera parte de su camino (no viajan como
  motas) y, si sobraran de la frase, nacerían de un punto.
- **Sin retorcerse:** remuestreo equidistante por largo de arco (del contorno densificado a 0,02 em) a 40 puntos y el punto de
  arranque de cada par alineado (`mejorGiro`). La demora es casi toda orden de lectura (12 % de azar): cada palabra arranca como
  una ola.
- **Performance:** antes rehacía y triangulaba la geometría en cada cuadro (8–11 ms de CPU). Ahora la topología es fija: las
  pistas se arman una vez y por cuadro sólo se escriben uniformes (medido en la página: 0,0 ms a la resolución de
  `performance.now`; en Node, el peor cuadro 0,09 ms). El vértice mueve los puntos. Las paredes son tiras de N puntos, una
  instancia por tramo con sus dos puntas.
- **Las tapas por stencil:** el abanico de cada contorno suma +1 por sus triángulos de frente y −1 por los de espaldas. Es la
  regla NO-CERO: un agujero resta y dos letras que se pisan se unen; con par/impar, al mezclarse se agujerearían. Una cubierta
  con el mismo abanico pinta donde la cuenta no es cero y la vuelve a cero, pase o no la profundidad. Acepta cualquier
  polígono (cóncavo, con agujeros, que se cruza a mitad de camino) sin triangular. El lienzo pide el búfer de stencil
  (`configuracionDelCanvas.ts`, `stencil: true`).
- **Lo que se mantiene:**
  - termina con «HABLANOS» en 1;
  - continua ida y vuelta (`s55` 4);
  - nada delante del logo: la metamorfosis sólo va hacia atrás y el giro no baja del CTA.

**Gate:**
- lint limpio en los tocados;
- `tsc` 0;
- `s53` 54/0, `s54` 50/0, `s55` 28/0, `s56` 34/0;
- s52-pulido-1, s52-nocturno-final, s34, s36, s38, s40–s44, verdes.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` C1 · el cruce | el cruce de `2411371a` (sus medidas y su gesto) y su control | borrados | El cruce se borró por pedido (D1·1); el giro de `2411371a` lo fija `s56` D1·1, con su control (el cruce: sin girar) |
| `s55` C1 · la metamorfosis termina con el CTA | «HABLANOS» se asienta con `cruce.asienta` | con `giro.baja` (que termina en 1) | El CTA llega con el giro; la misma condición (todo termina en 1, y no antes) |
| `s55` C1 · las técnicas | `contorno` re-triangulado por cuadro (`triangulateShape`, los remuestreos de entonces) | las pistas armadas una vez (`pistasDeLaMetamorfosis`), el remuestreo en su sentido; lo demás igual | Topología fija por pedido (D1·4); el detalle (stencil, costo, asignación) lo fija `s56` D1·5 |
| `s55` C1 · las banderas | sin bandera, `fusion` | sin bandera, `contorno` | Ganó `contorno` (D1·4) |
| `s55` 4 · la continuidad | cuánto aparece cada letra | cuánto se VE: lo que aparece por \|cos\| de su giro sobre Y y X; además, el estado de `contorno` mide también lo sucio, lo adelante y la turbulencia | El giro cambia de cara en el canto (90°), donde de lado no se ve nada; lo que no gira mide igual que antes. Más estricto en el estado |
| `s55` 4 · el control del salto | un cruce cuyo CTA aparece de golpe en `cruce.desde + 0,2` | un giro cuyo CTA aparece de golpe en `giro.desde + 0,05` | El mismo defecto en la transición nueva; en `+0,2` el cartel está de canto y el salto no se vería |
| `s55` 6 · la fuente | `archivo-400-cta.json` y `archivo-700-cta.json` del TTF pinchado a 62 | `archivo-{normal,expandido}-cta(-fuerte).json` del TTF variable, con sus letras exactas (el 900 lleva también «HABLANOS») | Más ancha, con pesos de título y kerning (D1·3) |
| `s55` 7 · lo que se mantiene | el lienzo con la cámara sin el mouse y la viva | el lienzo de la pantalla al plano del CTA (`ponerElMarco(a.lienzo, s.planos.pantalla, s.planos.cta, anclado)`) | Anclado en el mundo (D1·2); lo que afirma (todo detrás del plano del CTA) sigue |
| `s54` B1 · el producto | `<EscenaDelCta keyLightRef… logoMaterialRef… />` | con `stats={props.stats}` | La escena del CTA arma la cámara del nudo `cta` con las medidas del logo |
| `s54` B1 · el CTA en Archivo | la frase (400) y el destacado (700) de los JSON viejos; «HABLANOS» del de los títulos | los JSON nuevos (600 y 900); «HABLANOS» del 900 | D1·3 |
| `s52-pulido-1` · las banderas | `rebobinado`, `angel`, `golpe`, `meta` | más `ancho=normal\|expandido` | Bandera nueva (D1·3) |
| `s52-nocturno-final` D3 · el CTA centrado | «HABLANOS» a `min(display-xl, lugar/3,3)` | `lugar/2,8` | En proporción con la frase, que creció (D1·3); lo demás que afirma (centrado, la lista de una pantalla) no cambió |

## D2 · La luz del encastre: marcada y sólida

El círculo de luz difusa de PULIDO 4 se borró (`final/luzDelCirculo.ts`). La luz nueva está en `final/anilloDeLuz.ts`, con
`?anillo=`. El piso la dibuja **después del oscurecimiento y de la niebla**, así queda nítida encima de todo. Todo es función de
`fin` (al rebobinar se desarma igual), salvo los pulsos, que son de las ondas y del golpe.

**Las variantes:**
- **`tubo` (el producto):** un anillo de luz blanca de 0,24 u, embutido al ras adentro del borde de la zona lisa (r = 4,2, el
  círculo quieto). El borde es de un píxel (`fwidth`) y el brillo, parejo (0,86 más 0,14 con cada onda y con el golpe).
  - Aparece en 12 segmentos, con la mitad de hueco, mientras el logo presiona (de que toca el piso al golpe).
  - En el golpe se ensambla: los huecos se cierran en 0,35 s y desde ahí queda sólido, sin una costura.
- **`disco`:** toda la zona lisa como una pieza emisiva, de borde nítido y brillo parejo (0,8). El logo queda recortado encima
  (el piso no se dibuja en su hueco).
- **`filo`:** sin luz en el piso. El logo con el filo blanco del logo de noche, al doble de su ancho (2,2) y casi blanco (0,97).
  Se enciende con la luz del encastre.
- **`tubo+filo`:** las dos cosas.

**El logo, lo que más se ve** (`final/logoDelFinal.ts`). Desde el cenit, el negro satinado salía gris medio por tres cosas: los
reflejos del estudio (la cara reflejaba su cielo claro), la niebla de la sala (la cámara está a más de 40 u) y las motas de polvo
posadas encima. En el final, con la cámara que sube:
- sin niebla en el logo;
- con un 20 % del reflejo del estudio (queda el satinado en los bordes);
- sin polvo en un cilindro de 4,6 u sobre el logo y su círculo (`polvo/parche.ts`).

El oscurecimiento de la sala es del piso: el logo nunca lo tuvo. **Medido en el banco**, la mediana de los píxeles del logo en el
quieto es 12/255 en las cuatro variantes; en PULIDO 4 era ~85, gris medio.

**El golpe:** ganó `golpe-b` («golpe-a se escucha saturado»). Ahora es `golpe` y es el único; `golpe-a` y `?golpe=` se borraron.
El sprite queda en 56 KB (Opus) y 59 KB (AAC), 12,6 s. Medido decodificado: −13,5 dB RMS (el pulso, −16,3) y pico −0,44 dB.

**Un arreglo de D1 que vio el banco de D2.** El CTA anclado en el mundo se quedaba en la sala al irse su sección: desde el cenit
del pie, sus letras se veían de canto, como una banda que cruzaba la pantalla. Ahora:
- su plano sube con el escenario cuando éste se suelta (`correrElPlano`, como los títulos de volumen que se quedan);
- no se dibuja cuando el escenario se fue más de una pantalla o cuando la cámara del final empieza a subir.

**Gate:**
- lint limpio en los tocados;
- `tsc` 0;
- `s53` 54/0, `s54` 50/0, `s55` 27/0, `s56` 50/0;
- verdes: s22, s32, s34, s35, s36, s38, s40, s42, s44, s49, s50, s51, s52-nocturno-final y s52-pulido-1.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` C2 · el golpe suena | `sonar(sonidoDelGolpe)` con `?golpe=a\|b` | `sonar('golpe')`, sin bandera (y sin `golpe-a` en el código) | Ganó `b` y se borró `a` (D2); el evento y sus veces (una al bajar, ninguna al rebobinar, otra en el reinicio) no cambiaron |
| `s55` C2 · las variantes | `golpe-a` y `golpe-b` en el sprite y el catálogo; `?golpe=a\|b` | un solo `golpe`; ni `golpe-a`, ni `golpe-b`, ni la bandera | Ídem |
| `s55` C2 · los niveles | los dos golpes sobre el pulso y sin saturar | el golpe (la misma vara: +2 dB RMS sobre el pulso, pico < −0,1 dB) | Ídem |
| `s55` C2 · la luz | el círculo difuso (su radio, su luz, su pulso, su GLSL) y su control de radio | sólo lo que sigue valiendo (el logo sin el filo de B0) y que `luzDelCirculo.ts` ya no existe | El círculo se borró por pedido; el anillo lo fija `s56` D2 (radio, nitidez, ensamble, pulsos), con sus controles |
| `s54` B0 · la luz del final | `conLaLuzDelCirculo` después del oscurecimiento; el pulso del círculo | `conElAnillo` después del oscurecimiento (y de la niebla); el pulso del anillo | El mismo pedido de PULIDO 4 (fuera del oscurecimiento, pulsa con cada onda) sobre la luz nueva |
| `s52-pulido-1` · las banderas | `golpe=a\|b` entre las pedidas y en la URL | `anillo=tubo\|disco\|filo\|tubo+filo` (y el «+» de la URL como espacio) | `golpe` se borró y `anillo` es nueva (D2) |
| `s40` · el sprite | `golpe-a`, `golpe-b` | `golpe` | Ídem |
| `s35` · los reflejos del logo | `envMapIntensity = min(1, principal / KEY)` | lo mismo por `reflejoDelLogo` (en el final, el 20 %; fuera, igual) | El logo del final (D2·5) |
| `s36` · el logo de noche | sin noche, `return` directo | sin noche, el parche del final y `return` | Ídem |

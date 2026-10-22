# SPRINT B8 · NOCTURNO 2026-10-22 · El moiré (el cristal se queda)

Tarea: `docs/cola/2026-10-22/30-B8-moire.md`. Worktree `C:\nocturno\2026-10-22\b8`, rama `nocturno/2026-10-22-b8`. Lo que decidió
Valentino: el cristal se queda tal cual; el moiré deja de reaccionar a la cámara y al scroll en todas las variantes, con `?moire=0|1|2|mouse`
(sin moiré, una rendija fija, dos rendijas fijas, una rendija que se mueve sólo con el mouse, suave y con tope chico).

## Plan

**Qué es «el moiré» en el código.** La envolvente de rendijas (`MoireScreen.tsx`, números en `probeMoire.ts`): dos cilindros con una trama
de cuadrados cada uno, la fina en radio 38 (con un punto en cada cruce) y la gruesa en 44 (la retícula del hero, con su zócalo). El cristal
(`cristal/`, un muro en radio 37) la refracta: lo que se ve es la trama a través del vitral. La trama la leen además las estrellas, la fugaz y
el amanecer (`estrellas/trama.ts` + `TRAMA_GLSL`: qué tapa una raya, los haces y la luz del sol en el piso).

**Por qué marea (dos causas):**
1. **La cámara, por el paralaje.** Con las capas en radios distintos, el rayo de la cámara cruza cada una en un punto distinto, y el batido
   corre de 6 a 12 veces más rápido que la pared (`probeMoire.ts`, «ese es todo el truco del moiré»). Cualquier movimiento de la cámara
   (el scroll del recorrido o la órbita del mouse) lo arrastra amplificado.
2. **El scroll, por el moiré vivo de ESCENA 5** (`moire/MoireVivo.tsx` + `variantes.ts` + `parche.ts`): la gruesa bajaba sola 3 veces más
   rápido que la base (M1a), el scroll la aceleraba hasta 24 veces (M2), cada pulso del logo corría la fina una celda (M3) y el desajuste
   cambiaba con el progreso (M4). Además el rig le escribía una deriva por reloj (`OrbitRig.tsx`, 6b).

**Lo que se hace:**
- Se borra el moiré vivo entero (M1a a M4: los tres archivos, el parche del shader de la fina y los uniforms de M4 en `TRAMA_GLSL`) y la
  deriva del rig. Ninguna textura de la trama se mueve sola.
- `moire/fijo.ts` (puro): las cuatro variantes y qué capas dibuja cada una. `2` pone la fina **en la pared, coplanar con la gruesa**: el
  batido queda pintado en la superficie y no depende de la cámara. Sin paralaje queda sólo el batido de la textura (desajuste bandas por
  vuelta): con el de siempre (2) entrarían 0,4 a 0,5 bandas a lo ancho del cuadro; se fija en 6 para 1,2 a 1,6 (hoy, 1 a 2).
- `moire/MoireDelMouse.tsx`: la rendija de `mouse`, que lee sólo el puntero de la órbita y lo persigue con el amortiguador del puntero de
  la cámara; con tope de 1° de vuelta.
- Lo que lee la trama sigue a lo que se dibuja: `MoireHandle` publica qué capas y en qué radio; `TRAMA_GLSL` salta la capa que no se dibuja.
- `?moire=` en la URL y en el pedido del banco (`entorno.ts`, `PEDIDOS_DEL_MOIRE`). `fondo=cristal` (sin trama) ahora también apaga lo
  que la lee, como `?moire=0`.
- El cristal no se toca (`cristal/**` intacto).

**Archivos:** `moire/fijo.ts` y `moire/MoireDelMouse.tsx` (nuevos), `MoireScreen.tsx`, `estrellas/trama.ts`, `estrellas/cielo.ts`
(`TRAMA_GLSL`), `OrbitRig.tsx` (sale la deriva: 651 → 624 líneas), `ProbeStage.tsx`, `entorno.ts`; borrados `moire/MoireVivo.tsx`,
`moire/variantes.ts`, `moire/parche.ts`. Pruebas: `s78-b8` (nueva) y s30, s31, s32, s34, s35 y s40 al día con la spec (cada una con su control).
Banco: `scripts-carga/moire-costo.ts` (sin correr).

## Log

**Las decisiones que no estaban escritas** (una línea cada una):
- **El defecto es `2`**: el moiré de siempre (las dos rendijas), quieto. Es el que más se parece a lo que Valentino veía, sin lo que mareaba.
- **«Fija» es quieta del todo**: sin la deriva por reloj (una celda cada 18,7 s), no sólo sin la cámara y el scroll. La deriva movía el
  batido 6 a 12 veces más rápido que la trama (el mismo truco que el paralaje).
- **`2` coplanar en la pared (44) y no en 38**: en 44 está el zócalo y el piso es plano (en 38 la fina se para en el mar). La fina toma la
  banda de la gruesa.
- **El desajuste de `2` sube de 2 a 6**: coplanares, con 2 el batido casi no entra en el cuadro (0,40 a 0,53 bandas); con 6, 1,19 a 1,59 en
  todo el recorrido (hoy, «1 a 2», `probeMoire.ts`). La fina pasa de 102 a 106 celdas por vuelta (4 % más chicas).
- **`1` es la gruesa** (la retícula del hero, con su zócalo): la más tranquila; la fina (con los puntos) es la más cargada.
- **`mouse` es una sola rendija (la de `1`) que sigue al puntero**, la lectura literal de «una rendija que se mueve sólo con el mouse». La otra
  lectura (las dos de `2` y una que se corre con el mouse: el moiré interactivo, el batido amplificado) es una línea en `fijo.ts`
  (`mouse: { ...la de 2, sigueAlMouse: 'fina' }`).
- **El tope de `mouse`: 1° de vuelta** (0,14 de celda gruesa), a lo ancho y a lo alto, hacia donde va el puntero; suave con el amortiguador
  del puntero de la cámara (`MOUSE_TAU` 0,45 s). Lee el puntero de la órbita (ignora la barra y los controles fijos, como la cámara).
- **Lo que lee la trama sigue a lo que se dibuja**: con `0` las estrellas no quedan tapadas por una trama invisible y los haces del amanecer
  dejan de tener rendijas (una bruma pareja); con `1` y `mouse`, sólo la gruesa. `fondo=cristal` hace lo mismo (antes la trama invisible
  seguía tapando).
- **El contacto del piso al pie de la fina (radio 38) queda**: el piso lo pinta en su shader (`piso/bloques.ts`, fuera de la tarea) y el
  cristal lo tapa (es opaco desde 37); sólo se vería con movimiento reducido o `cristal=no`: un anillo 10 % más oscuro de 0,3 u.

**Medido sin navegador** (`s78-b8`, 42 afirmaciones y 9 controles):
- la cámara: con el hero (p 0,05) y p 0,62 (los ojos a 38,7 u), las cuatro variantes dan el mismo patrón en 288 puntos de la pared (a lo
  sumo 1,4e-14 de celda); el de antes (38 y 44) corre 0,50 de banda;
- el scroll: 4 s a 60 Hz con el scroll quieto y a 0,08 de progreso por segundo (y con la otra pose): el mismo corrimiento en cada cuadro
  (diferencia 0); el moiré vivo de ESCENA 5 (M2) difiere 0,733 de celda;
- `mouse`: de 13,9 a 18,5 px a lo ancho y de 13,8 a 18,4 a lo alto a 1440×900 en todo el recorrido (a lo sumo 13,9 % de la celda en
  pantalla); con el puntero de golpe al borde, 3,6 % del tope por cuadro y el 95 % a los 1,33 s;
- el batido de `2`: 1,19 a 1,59 bandas a lo ancho del cuadro.

**El costo por cuadro**: no se midió (sin navegador). Por construcción no sube: `2` son los mismos dos dibujos (y el mismo zócalo) que
antes, sin el parche de M4 en la fina ni el cuadro de `MoireVivo`; `1` y `mouse`, uno menos; `0`, ninguno (más el zócalo). Cada capa se paga
dos veces por cuadro (el cuadro y el fondo del cristal). El banco, `scripts-carga/moire-costo.ts` (abajo).

**Las suites** (todas las que leen algo de lo tocado): tsc 0; eslint de lo tocado limpio; en verde s6-tu-panel, s8-escena, s9, s10, s18,
s20, s22, s28, s29, s30 a s38, s40, s42, s43, s44, s46, s48, s49, s52 (las dos), s53 a s57, s59, s61, s62, s64, s66 a s71, s73 a s76 y
s78 (con s78-b8). Al día con la spec, cada una con su control: s30 (§1 y §4), s31, s32 (el uniform de M4 por el de las capas), s34 (el
archivo con `useFrame` y su amortiguador), s35 y s40 (la URL también lleva `moire`). Dos fallas que ya estaban en la base y no son de esta
tarea: s8-montaje (seis archivos de más de 300 líneas de código; s32 y s34 no sumaron una línea) y s47 (el control del recorte del
Portfolio, ciego desde B1.2e: `EscenarioDelPortfolio.tsx` cambió su clase).

## Para B9 (las grietas)

El terreno: la trama ya no se mueve, así que la luz de una grieta no compite con un batido que corre. Las grietas van en el material del
cristal, que esta tarea no tocó: `cristal/vidrio.ts` (el fragmento ya tiene por celda `vInterior`, la distancia al borde en px; `vBorde` y
`vCelda`, la semilla de la celda: lo que necesita `?grietas=3`, por las juntas) con sus uniforms en `uniformesDelVidrio()`, y el avance se
escribe en el cuadro de `cristal/CristalDeLaEscena.tsx` (que ya publica `__cristalDelBanco`). La bandera puede ir como `?moire=`
(`PEDIDOS_DEL_MOIRE` en `entorno.ts`) o como `?cristal-brillo=` (leída en el efecto de `CristalDeLaEscena`). Nada de `moire/` hace falta.

## Qué mirar (el orquestador, en el navegador)

1. `http://localhost:3000/v3` a 1440×900 (el defecto, `2`): scrolleá del hero a Trabajos y volvé, rápido y lento. La trama detrás del
   cristal no corre ni se acelera; las bandas grandes del moiré quedan pegadas a la pared (se mueven sólo como se mueve la pared con la
   cámara, nunca más rápido). Con la página quieta, nada se mueve en la trama.
2. `http://localhost:3000/v3?moire=1` a 1440: una sola retícula (cuadrados grandes, sin puntos), quieta.
3. `http://localhost:3000/v3?moire=0` a 1440: sin trama; el cristal refracta sólo el cielo, la fábrica y las estrellas. De noche (Trabajos)
   las estrellas se ven enteras.
4. `http://localhost:3000/v3?moire=mouse` a 1440: con la página quieta, mové el mouse de un borde al otro: la retícula se corre ~15 px hacia
   donde va el puntero, suave (~1,3 s); scrolleando con el mouse quieto, no se corre.
5. `http://localhost:3000/v3?moire=2` a 390×844 (compacta): igual que el 1.
6. Con banco: `window.__moireDelBanco.estado()` da la variante, las capas y el corrimiento de cada textura (sólo cambia con `mouse`).

El banco del costo, contra el dev de cada rama en `:3000` (el mismo ancho y la misma placa):
`PEDIDOS="producto" ROTULO=antes npx tsx scripts-carga/moire-costo.ts` en la integración y `ROTULO=despues npx tsx scripts-carga/moire-costo.ts`
en esta rama. El control: con `moire=0` la trama no aparece en el perfil y con `2` aparecen las dos capas (si no, `controlRojo`).

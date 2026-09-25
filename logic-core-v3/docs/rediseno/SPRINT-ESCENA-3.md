# SPRINT ESCENA 3 — activar lo aprobado

Rama `rediseno/home`. Parte de `escena-base-limpia` (5f6a4d22) y de la exploración (b9b3ebae).
Las capturas, clips y mediciones están en `~/.cache/b4-medicion/escena3/`; ninguna va al repo.

**Verificar mirando, no leyendo.** Cada punto dice qué clip u hoja mirar. Lo que se mueve se juzga
en clip.

## Qué quedó

`_lib/escena/entorno.ts` tiene E1, E4, E6 y E7 prendidas. Los niveles quedan así:
- haz `medio`;
- cursor `A`;
- estela del cursor apagada;
- sombra viva.

Todo lo demás vive en `_lib/escena/entorno/`:

| Archivo | Qué es |
|---|---|
| `Entorno.tsx` | Monta lo prendido y escribe el estado compartido una vez por cuadro, **después** del rig. Lee la cámara y el arco; no los toca. |
| `maquinaDelPulso.ts` | E4 · la máquina de estados del pulso, **pura**, con sus constantes en el bloque `PULSO`. |
| `Pulso.tsx` | E4 · el dibujo: hasta 4 anillos analíticos en un plano, apagados sobre el texto. |
| `hoverDelLogo.ts` | E4 y E7 · `pointermove` en `window` más un rayo por cuadro contra la caja del logo, con sus compuertas. |
| `cajasDeTexto.ts` | E4 · dónde hay texto en pantalla, para que el anillo no le baje el contraste. |
| `sombra.ts` | La sombra con física, **pura**: altura del logo y pulso principal → escala y opacidad de la mancha. |
| `Haz.tsx` | E1 · el óculo, la columna, la mancha de luz y las estrellas. |
| `polvoVivo.ts` | E1, E6 y E7 · el parche del polvo (y del bokeh, sólo con el cursor B). |
| `vivo.ts` | El estado compartido, los niveles del haz y del cursor. |

Además se tocó:
- **`ContactOcclusion.tsx`**: la sombra con física. Es la mancha de siempre; ahora sigue al logo.
- **`ProbeStage.tsx`**: monta `<Entorno>` y le pasa el grupo del logo a la mancha.
- **`DepthParticles.tsx`** y **`BokehParticles.tsx`**: una línea cada uno, el parche.

**Limpieza.** Se borró el código y las banderas de E0, E2, E3, E5 y E8:
- `Monolitos.tsx` y `Anillos.tsx`;
- el tinte del día;
- el foco;
- la bandera de la mancha.

Quedan documentadas en `SPRINT-ESCENA-2.md`. `s29-pulso` §8 afirma que no queda rastro.

## Paso 0 · por qué falló `comparar.ts`

**Lo que se vio.** En ESCENA 2 la hoja de E0 guardó como «pie» una pantalla con el titular
«Portfolio» y la escena de noche, sin ningún ítem del navbar activo. Su «Por qué» tenía otra pose del
logo y tarjetas que en ese scroll no aparecen. La consola decía que el banco había llegado a
y = 26805. O sea, la página no estaba donde el banco creía, y nada lo verificaba.

**Lo que no es:**
- *No es el HMR.* El log del dev server no muestra recompilaciones en esa corrida.
- *No es un salto reproducible.* Una sonda de saltos de scroll no lo reprodujo (dos vueltas), ni tres
  corridas fieles del banco de E0.

**Lo que sí pasa, atrapado en esta sesión.** En una corrida de `base`, en Quiénes somos, el scroll
quedó en 1535 cuando se había pedido 1035: la página se movió +500 px sola después de llegar. La
verificación nueva lo vio y el reintento lo corrigió. En cuatro corridas más, con el espía puesto, no
volvió a pasar. **La causa raíz sigue sin atribuir.**

**El arreglo** (`scripts-escena/banco-escena.ts`, que usan `comparar.ts`, `clips.ts` y `medidas.ts`):
1. **Verificación antes de aceptar cada captura.** Tiene que ser la misma carga de página
   (`performance.timeOrigin`), el `scrollY` tiene que ser el pedido (±2 px) y la sección del centro
   tiene que ser la del momento. Si no, reintenta dos veces; si igual falla, **se corta con el
   motivo**. Ya no puede pasar callado.
2. **Espía de saltos.** Anota con su pila toda orden de scroll de más de 300 px: `scrollTo`,
   `scroll`, `scrollBy`, `scrollIntoView` y `scrollTop`. Cuando una verificación falla, el banco
   imprime lo que vio. La próxima vez que ocurra, sale quién fue.

**La prueba de estabilidad, que no pasaba nunca en Quiénes, Trabajos y Por qué.**
- **No son los carruseles.** Con el canvas escondido, el DOM da **0,00** de diferencia en los cinco
  momentos.
- **Es la escena.** El polvo y el bokeh derivan siempre, y el logo se balancea. Con la cámara cerca las
  motas son grandes, y por bloque de 30 px la deriva sola da 1,5–2,0, arriba del umbral de 1,5.
- **La exclusión:** se promedia en bloques de **120 px**. La cámara quieta da 0,17–0,76; la cámara
  viajando da 9,9–72. El umbral quedó en 1,5 y **el timeout no se tocó**.
- **Resultado:** los cinco momentos asientan al primer intento, salvo alguno a los 2–3.

`comparar.ts` sigue siendo el banco de hojas y costo. Ahora sus variantes son pedidos a
`entorno.ts`:
- `base` = escena-base-limpia;
- `producto`;
- o una lista.

Se retiraron los scripts de la bandera vieja (`asiento.ts`, el `hojas.sh` de V1–V3, `entorno.ts` y
`tinte.ts` de ESCENA 2). `hojas.sh` es nuevo y general: una variante contra otra.

## 1 · E4 — el pulso con hover

**La máquina** (`maquinaDelPulso.ts`). Es pura: (estado, tiempo, entradas) → estado. Tiene cinco
modos: reposo, scroll, hover, apagado (movimiento reducido) y las transiciones.
- Un cambio de modo reprograma el próximo anillo.
- Entrar al hover, o salir con el scroll quieto, larga un **principal** en el instante.
- Ningún anillo vivo se corta: cada uno nace con su duración.
- Los periódicos dejan siempre un lugar libre, así que el principal entra.
- Salir del hover porque arrancó el scroll no larga principal.

**Constantes finales (bloque `PULSO`):**

| | valor |
|---|---|
| período de reposo | **3,72 s** (60 % de los 6,2 de ESCENA 2) |
| período con hover | **0,93 s** (¼ del de reposo) |
| el scroll cuenta como quieto después de | 0,18 s sin moverse el progreso |
| tope de anillos vivos | **4** (ver abajo) |
| anillo de reposo | 3,6 s · alcance 26 · amplitud 1 (el de ESCENA 2) |
| anillo de hover | 1,9 s · alcance 15 · amplitud 0,85 |
| anillo principal | **4,5 s · alcance 33 · amplitud 1,5** |
| alfa del anillo | 0,075 de día · 0,12 de noche |

**El tope subió de 3 a 4, y es un cambio sobre lo pedido.**
- Con 3 y el lugar reservado para el principal, al entrar ya estaban vivos el anillo de reposo y el
  principal de la entrada. Los rápidos no nacían hasta 2,4 s después, así que el hover no llegaba a
  sentirse a ¼.
- Con 4, el primero nace a 0,93 s de la entrada.
- Lo mide `s29-pulso` §3.

**El hover** (`hoverDelLogo.ts`):
- `pointermove` en `window`, sin tocar el `pointer-events` del canvas.
- Un rayo por cuadro como máximo, y sólo si el puntero se movió o cambió el progreso.
- **Va contra la caja del logo, no contra la malla.** Contra la malla titilaba: la «cp» tiene
  agujeros, y el cursor que entra cruza trazos y huecos. El primer clip dio 7 principales donde
  tenía que haber 2. Encima hay una histéresis de 80 ms para entrar y 200 ms para salir.
- **Efecto secundario:** la caja incluye las esquinas vacías del logo, así que ahí también cuenta
  como hover.

**Compuertas.** No hay hover si:
- el puntero no es fino (mouse o lápiz con hover real);
- está sobre un link, botón o campo;
- hay un viaje del navbar en curso;
- el progreso está entre 0,5 y 0,7375: el túnel de Trabajos y la banda opaca de Servicios y Tu panel;
- algo opaco tapa el punto.

**Legibilidad.** Cuando hay anillos vivos se leen las cajas de texto en pantalla: cada 200 ms, o cada
60 ms con scroll. Se unen las que se tocan, se toman las 6 más grandes, y el anillo se apaga adentro
con una pluma de 24 px. Contraste medido del peor texto visible, WCAG, glifo contra fondo local, en
series de ~55 capturas en 12 s. «Sin anillo» es la mediana de la serie; «en el pico», su mínimo.

| momento | texto | sin atenuación: sin anillo → pico | con atenuación (producto) | base sin pulso |
|---|---|---|---|---|
| día · hero | «Tu sitio, tu chat…» | 13,14 → 12,59 (**−4,2 %**) | 13,14 → 13,14 (0 %) | 13,14 → 13,14 |
| día · hero | «Mirá los trabajos» | 16,87 → 15,86 (**−6,0 %**) | 16,87 → 16,71 (−0,9 %) | 16,87 → 16,71 (−0,9 %) |
| día · hero | «Hablemos» | 16,54 → 15,14 (**−8,5 %**) | 16,54 → 16,38 (−1,0 %) | 16,54 → 16,38 (−1,0 %) |
| día · hero | titular | 17,77 → 17,77 | 17,77 → 17,77 | 17,77 → 17,77 |
| noche · Trabajos | «Portfolio» | 13,23 → 12,85 (**−2,9 %**) | 13,24 → 13,24 (0 %) | 13,37 → 13,37 |
| noche · Trabajos | «Cada uno de estos proyectos…» | 10,79 → 10,19 (**−5,6 %**) | 10,79 → 10,69 (−0,9 %) | 10,63 → 10,63 |

Cómo leer la tabla:
- De día, con atenuación, el producto queda **igual a la base**. El −0,9/−1,0 % de los botones
  también está en la base: es el polvo y el balanceo, no el anillo.
- De noche queda un −0,9 % en el párrafo, contra 0 % en la base. El polvo del haz y la estela pasan
  por detrás del texto; no es el anillo.
- Afuera de la tabla quedó «Demos para abrir acá mismo»: es texto en transición en ese momento (1,3–1,7
  hasta en la base).
- Datos: `medidas/contraste*.json`. La captura del peor cuadro de cada serie:
  `medidas/contraste-peor-*.png`.
- La serie del día sin atenuación se repitió sola porque en la primera la pestaña quedó oculta.

## 2 · La sombra con física

`sombra.ts` más `ContactOcclusion.tsx`:
- **Altura.** La mancha sigue la altura REAL del punto más bajo del logo, contra la de reposo, medida
  una vez sobre la geometría y sin la vira. Escala ∝ (h₀/h)^0,5, opacidad ∝ (h₀/h), con límites
  0,6–1,4 y 0,3–1,5.
- **Pulso principal.** Se contrae un **12 %** en 0,16 s y vuelve sola a los 0,9 s.

**Qué esperar al mirar.** El logo no cambia de altura en ningún momento del recorrido: sólo se
balancea (±0,7° y ±1,15°), y eso mueve su punto más bajo menos del 1 %. En la práctica, la respuesta
a la altura queda quieta. **Lo que se ve es la contracción con cada principal.** El día que el logo
flote, la sombra lo va a seguir sin tocarla.

**Medida en el clip b.** El área oscura de la mancha, cuadro por cuadro:

| instante | área | |
|---|---|---|
| hasta ~2,1 s | ~8.500 px | antes del principal |
| 2,35 s | 6.680 px | **−22 %**, justo después del principal |
| 3,1 s | ~8.150 px | ya volvió |

Un 12 % de escala es −23 % de área: coincide.

**La base no cambia.** En reposo vale escala 1 y opacidad 1 exactas (`s29-pulso` §6, con control
positivo). El logo quieto, medido como mancha mayor, coincide con escena-base-limpia:

| Momento | Variante | Caja (x · y) | Centro |
|---|---|---|---|
| Por qué | ACTUAL | 430–1011 · 247–652 | (727,5 · 418,1) |
| Por qué | ESCENA 3 | 430–1009 · 250–651 | (726,3 · 418,4) |
| Pie | ACTUAL | 598–841 · 365–534 | (721,9 · 436,9) |
| Pie | ESCENA 3 | 598–841 · 365–534 | (721,9 · 437,1) |

`s28-base` sigue en verde, con su control positivo.

## 3 · E6 — tal cual

No se cambió nada de su respuesta, el largo de la estela, los tiempos ni la inercia:
- τ 0,11 s;
- tope de 22·cerca + 4 px;
- cola al 20 %.

Con movimiento reducido, emulado por CDP: en pleno scroll la estela vale **0** y las motas son
puntos. Ver `medidas/e6-en-pleno-scroll-normal.png` contra `…-reducido.png`.

## 4 · E7 — el cursor en dos niveles

El mecanismo es el mismo en los dos niveles: el empuje sube con la velocidad del puntero y se
apaga solo. Sólo cambia el alcance (`NIVELES_DEL_CURSOR`):

| nivel | radio² (NDC) | profundidad donde pesa 1 | peso mínimo del polvo lejano | bokeh |
|---|---|---|---|---|
| **A** (el de ESCENA 2, sin cambios) | 0,06 | 10 | 0 | no |
| **B** | 0,16 | 18 | 0,55 | sí |

- **Por defecto: A**, hasta que elijas.
- **Estela del cursor** (`estela`, apagada). Lo empujado se proyecta también con el cursor y el
  empuje de hace un instante, y deja la estela de E6.
- **Táctil y movimiento reducido: el empuje queda en 0** durante todo el barrido, y el hover nunca
  prende. Emulados por CDP (táctil: touch más `hover: none` y `pointer: coarse`). Ver
  `medidas/e7-tactil.mp4` y `medidas/e7-reducido.mp4`.

**Al mirar el clip d.** El puntero ya movía la cámara antes de este sprint (el desplazamiento de
mouse), y E6 responde a cualquier movimiento de cámara. Por eso en los seis paneles todo el polvo
hace estela mientras el cursor barre. Lo propio de E7 es el hueco que se abre alrededor del punto
rojo y se cierra solo.

## 5 · E1 — el ajuste

Cada nivel se da como (columna, mancha de luz en el piso, polvo en el haz):

| nivel | día | noche |
|---|---|---|
| ESCENA 2 | 0,035 / 0,02 / 0,55 (polvo claro) | 0,16 / 0,2 / 0,9 |
| **sutil** | 0,045 / 0,05 / 0,4 | 0,05 / 0,06 / 0,3 |
| **medio** (por defecto) | 0,07 / 0,09 / 0,62 | 0,08 / 0,10 / 0,45 (**50 %**) |

- **Noche:** es la mitad, luz ambiente y no un foco de teatro.
- **Día:** sobre papel blanco la luz aditiva casi no suma. Por eso la columna se lee de dos maneras:
  - por el polvo que la cruza, que toma un **ámbar medio**, crece un 55 % y pesa más (una mota clara
    desaparecería sobre el papel);
  - por la mancha de luz en el piso, que todavía tiene margen hasta el blanco.
- **Sin oscurecer:** todo es aditivo. Si el ámbar se lee como polvo sucio en vez de luz, la perilla
  es el color en `polvoVivo.ts` (`LUZ_DEL_HAZ`).

## Costo, antes y después

| | escena-base-limpia | ESCENA 3 |
|---|---|---|
| llamadas de dibujo | 11 | **15** (+ techo del óculo, columna, mancha de luz, pulso; las estrellas caen fuera de cuadro y three no las dibuja) |
| triángulos | 23.486 | **23.808** (+128 techo, +96 columna, +2 mancha, +96 pulso) |
| fps a 1440 | 75 en los cinco momentos | 75 en los cinco momentos |
| fps a 375 con CPU ×4 | 74,7–75 | 74,4–75,2 |

- **fps.** 75 es el techo del monitor. Estrangular la CPU no frena una GPU de escritorio, así que el
  costo en un teléfono real sigue sin medir.
- **Uniforms nuevos.** Ningún material viejo pierde nada.
  - Polvo: 10 en el vértice (`uVPPrevio`, `uResolucion`, `uEstela`, `uCursor`, `uEmpuje`,
    `uCursorPrevio`, `uEmpujePrevio`, `uAspecto`, `uCursorAlcance`, `uHaz`) y 2 en el fragmento
    (`uHazDia`, `uHazNoche`), más 4 varyings.
  - Bokeh: 4, sólo con el cursor B.
  - Haz: 3.
  - Pulso: `uTiempo`, `uNoche`, `uAnillos[4]`, `uTexto[6]`, `uPluma`.
- **Atributos nuevos:** uno, `aTam` de las 70 estrellas.
- **CPU por cuadro:**
  - un rayo contra una caja, sólo si se movió el puntero o el progreso;
  - una lectura del DOM cada 200 ms (60 ms con scroll), sólo mientras hay anillos vivos.

## Qué mirar para cada punto

| punto | archivo (en `~/.cache/b4-medicion/escena3/`) |
|---|---|
| pulso de reposo | `clips/a-hero-quieto.mp4`: nacen anillos a 1,3 · 5,0 · 8,7 s |
| hover: entrada, 4 s, salida, 4 s | `clips/b-hover.mp4`: principal a 2,1 s, rápidos cada ~0,95 s, principal a 7,6 s, el de reposo a 11,4 s. La sombra se contrae con cada principal |
| E6 | `clips/c-scroll-y-frenada.mp4` |
| E6 reducido | `medidas/e6-en-pleno-scroll-normal.png` contra `…-reducido.png` |
| E7 A / B / B con estela, día y noche | `clips/d-cursor-mosaico.mp4` (y los seis sueltos, `clips/d-*.mp4`) |
| E7 táctil y reducido | `medidas/e7-tactil.mp4`, `medidas/e7-reducido.mp4` |
| E1 sutil contra medio | `clips/e-haz-mosaico.mp4` y `hojas/hoja-haz-medio-vs-sutil-1440.png` |
| base contra ESCENA 3 | `hojas/hoja-base-vs-producto-1440.png`, `hojas/hoja-base-vs-producto-375.png` |
| contraste con el pulso | `medidas/contraste*.json` y `medidas/contraste-peor-*.png` |

## Validación

- **`tsc --noEmit`:** sin errores.
- **`next build`:** en verde, aislado en `.next-b13`, con el heap de 4096 que fija `netlify.toml`.
- **eslint:** limpio en `_lib/escena/entorno/`, `entorno.ts`, `ProbeStage.tsx`, `DepthParticles.tsx`,
  `BokehParticles.tsx`, `ContactOcclusion.tsx`, los invariantes nuevos y `scripts-escena/`.
- **`s29-pulso`** (nuevo): 39 afirmaciones, 0 fallas, con controles positivos. Cubre la máquina, la
  sombra, las banderas y la limpieza.
- **`s28-base`:** 19 / 0, con su control positivo.
- **Suites de escena en verde:** `s7e-*`, `s8-escena`, `s9e`, `s10e-*`, `s11e`, `s12e`, `s10-raf` (2
  fuera de ventana, de siempre), `s16-arnes`, `s18`, `s19-sincronia`, `s19-lente`, `s20-brillo`,
  `s22-emision`, `s23-final`, `s24-dia`, `s9-instrumentos`, `s9-sentry`, `s14e`, `s15e-*` y
  `s27-viajes`.
- **Fallas conocidas, aparte:**
  - `s17-revelado` (1): la llamada a `aplicarRevelado` se mudó en VIAJES; va en otro prompt.
  - `s8-tres` (11) y `s8-intro` (2): piden un build en `.next`, que ocupa el dev server.

**Ambiente.** Varias corridas de medición se cortaron o se invalidaron porque la pestaña del banco
quedó oculta: la PC estaba en uso y había otra ventana encima. El banco lo detecta y se corta. Se
repitieron hasta tener series limpias; las inválidas no se usaron.

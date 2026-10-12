# EL PLASMA — el modelo, para afinarlo

**[PULIDO 18] El plasma A es el producto** (sin pedir nada). `?energia=polvo`: el polvo de antes en su lugar; `?energia=plasma-y-polvo`:
los dos; `?plasma=b`: la dirección B (se queda en su bandera hasta que exista el efecto de cristal de la dimensión espejo). C (las
corrientes sobre el logo) se borró con su código. `?energia=plasma` (la de antes) se lee como el producto. La dimensión espejo
(`?espejo=`) tiene su propio documento: `docs/rediseno/DIMENSION-ESPEJO.md`.

Historia: PULIDO 15 (cargas sueltas + arcos: gustó), PULIDO 16 (átomos, iones, electrones, moléculas: «tiene una forma muy definida,
tampoco para tanto»; se borró con sus experimentos de color, campo y sonido), PULIDO 17 (el espíritu de PULIDO 15 llevado a otro
nivel, en tres direcciones: «partículas de energía que brillan, vibran, se mueven»; monocromo, sin sonido) y PULIDO 18 (A gana y se
lleva a producto: vive en el MUNDO, el piso es un límite real, las partículas son blandas, más partícula y menos nube, de día se ve,
la física nueva). Referencias y por qué: `docs/rediseno/REFERENCIAS-PLASMA.md`.

Invariantes: `npm run test:s69-pulido-18` (PULIDO 18) y `npm run test:s68-pulido-17` (PULIDO 17). Bancos: `~/.cache/b4-medicion/pulido-18/_scripts/`
(`p-secuencias.ts`, `p-medir.ts`, `p-tanda.sh`) y el mini-banco (`scratchpad/p18/sombreadores/`: el plasma real en una escena chica,
en un Chrome sin ventana, para cuando no hay memoria para el banco del sitio). Recibos: `docs/rediseno/entregas/pulido-18/`.

## Las direcciones

| | Qué es | La partícula | Dónde vive |
|---|---|---|---|
| **A · Chispas** (el producto) | Las cargas de PULIDO 15 hechas luz: 600 (300 en el teléfono) | Un núcleo chico y nítido con un halo corto; tamaños por una ley de potencia | CPU (`brasas.ts`, `paso.ts`) |
| **B · Enjambre** | Un medio: 16.384 motas (6.400 en el teléfono) alrededor de 40 núcleos | Mota finísima | GPU (`enjambre/`) |

Comparten todo lo demás: el mundo, el piso, los arcos, la temperatura, el gesto, los textos, el tono, el movimiento reducido y el pie.

## Dónde está cada cosa (`src/app/v3/_lib/escena/energia/` y `escena/pase/`)

| Módulo | Qué |
|---|---|
| `direcciones.ts` | Las direcciones (A y B), lo que cambia cada una (cantidades, aspecto, simulación) y la del producto. |
| `ruido.ts` | El campo: curl noise con gradiente analítico; el mismo hash de 32 bits en JS y en GLSL. Puro. |
| `brasas.ts` | Las constantes, la creación (arriba del piso), la grilla y la física entre ellas de PULIDO 15 (atraer, repeler, enlazarse). Puro. |
| `paso.ts` | El paso: los enlaces, el campo (y el viento), lo de afuera, el movimiento nuevo, el piso, la energía y la integración. Puro. |
| `afuera.ts` | Lo de afuera de cada una: el puntero, las ondas de los pulsos y del logo, la agitación, la cáscara del mundo y el hueco del logo. Puro. |
| `movimiento.ts` | El movimiento nuevo: la convección, el pinch de los arcos y la estela del puntero. Puro. |
| `vecinas.ts` | Las vecinas: el brillo por densidad, calentar una, contar enlaces. Puro. |
| `calor.ts` | La temperatura de la escena y la lectura de la escena (scroll, pulso del logo, golpe del pie). Puro. |
| `arcos/` | El camino (`camino.ts`), qué es un arco (`arcos.ts`), quién nace y cuándo (`programador.ts`) y la cinta (`cinta.ts`). Puros. |
| `enjambre/` | La simulación de B en la GPU (el ping-pong de la escena) y su paso. |
| `dibujo/comun.ts` | Lo común: la máscara de los textos (`TEXTOS_GLSL`, compartida con el espejo), las luces de los arcos, el final, el tono y la salida. |
| `dibujo/particulas.ts` | El sombreador de las partículas: lo propio de cada chispa (`CHISPA_GLSL`), blanda, la cruz, el día con su calor. |
| `dibujo/arcos.ts` | El canal de los arcos: el halo con PUNTOS a lo largo del camino y el núcleo en la cinta fina; blandos. |
| `dibujo/efectos.ts`, `dibujo/reflejos.ts` | Los efectos (el piso de noche bajo un arco, el toque del logo) y el reflejo tenue de las chispas en el piso. |
| `dibujo/armado.ts` | Las mallas, los materiales, el orden (después de la copia del cuadro y antes del haz), qué se ve y el borde del logo. |
| `interaccion/` | La máquina del gesto (pura) y sus oyentes (el espejo los usa también). |
| `cuadro.ts`, `PlasmaYCargas.tsx`, `banco.ts`, `textoEnPantalla.ts` | El cuadro (el viento, la estela, los canales), el componente, los ganchos del banco y las cajas del texto. |
| `escena/pase/` | EL PASE COMPARTIDO: la profundidad de lo opaco (las partículas blandas, el reflejo, el espejo) y la copia del color del cuadro (el calor de día, el espejo). |

## El mundo (PULIDO 18 · P1.b)

Todo vive en coordenadas del MUNDO: las brasas, las motas de B, los arcos y sus luces, los efectos, el puntero y el piso. Antes vivían
en las coordenadas del logo (si el logo bajaba, bajaban con él). La CÁSCARA (radio 13) es del mundo, quieta alrededor del origen (el
lugar de reposo del logo); afuera de ella vuelven, más que lineal con lo que se pasan (contenidas siempre). El logo sólo influye: su
HUECO (4,2) es un obstáculo donde esté (si baja, las aparta al pasar; no se las lleva), sus ONDAS (el pulso) y su golpe salen de donde
está, sus ARCOS nacen en su borde, y la FUENTE (el brillo cae lejos del logo) y la cara libre se miden desde él. Al cargar, el logo cae
desde 14 u: la nube lo espera abajo, tenue, y se enciende cuando el logo llega.

## El campo

`ruido.ts`: la velocidad es el rotor de un potencial de tres canales de ruido de gradiente (Bridson y otros, 2007): sin divergencia
(medido: 4·10⁻⁵ relativa), se arremolina sin juntar ni vaciar. Escala 0,17 (un remolino ~6 u), deriva (0,021; 0,034; 0,027) por
segundo. En la CPU, cada brasa lo recalcula en cuadros alternos. [PULIDO 18] El campo lleva además el VIENTO del scroll.

## A · Las brasas

- Las de PULIDO 15, sin cambios: alcance 3,6; atraen 0,42 (opuestas) y repelen 0,55 (iguales); el rechazo de cerca (0,55, choque 6);
  amortiguación 1,1; tope 3 u/s; la cáscara 1,6. Enlaces: se forman a 1,2, reposo 0,95, resorte 2,2, viven 2,5–7 s, empujón 0,9,
  enfriado 3–7 s.
- De PULIDO 17: el campo (rapidez 0,42 u/s, ×1,9 caliente; se sigue a 0,8/s) y la ENERGÍA de cada una (0 a 1): reposo 0,1 + 0,45 × la
  temperatura, se enfría en 0,8 s; la calientan el puntero (1,6/s), las ondas de los pulsos (0,85 al pasar), las del logo (0,9/s en
  la cresta) y los arcos (0,6 en los extremos, 0,35 alrededor). Caliente, tiembla (2,2 u/s²). El puntero (desde su rayo): alcance
  4,6; atrae 2 (las negativas) y empuja (las positivas); rechazo de cerca 1,1; las hace GIRAR alrededor del rayo (2,6): ORDENA. El
  brillo por densidad: con n vecinas a menos de 1 u, ×1/(1 + 0,09 n).
- [PULIDO 18] EL PISO, UN LÍMITE REAL (`BRASAS.piso`): ninguna baja de 0,85 u sobre el piso (por encima de la cresta más alta del mar y
  del bloque que levanta el cursor); en la banda de 1,6 u sobre ese mínimo un colchón las levanta (2,4 u/s², creciente hacia abajo),
  lo que bajan se frena (5/s) y lo de costado roza (0,9/s): se deslizan y casi no se acercan. Nacen arriba. B, igual.
- [PULIDO 18] EL MOVIMIENTO NUEVO (`movimiento.ts`): la CONVECCIÓN (las calientes suben por su energía sobre la de reposo, 0,7 u/s² por
  unidad; las frías bajan, 0,05), el PINCH (un arco que golpea tira hacia su canal a las que tiene a menos de 1,3 u, 3,2 u/s², y las
  calienta, 0,5/s: al apagarse las suelta encendidas y la convección se las lleva), la ESTELA del puntero (al moverse arrastra a las
  que tiene a menos de 2,6 u de su rayo hacia su velocidad, 1,8/s, entera desde 0,6 u/s; quieto, nada) y el VIENTO del scroll (en
  contra de la cámara que pasa, 0,35 u/s por pantalla por segundo, ×(1 + 1,5 T), tope 1,6, se asienta en 0,35 s).

## B · El enjambre (`enjambre/`)

Posición y energía en una textura, velocidad y edad en otra (32 bits, el ping-pong de la escena). Todas las fuerzas son campos: el
curl noise (que cerca del logo sólo corre de costado: su campo de distancia), los núcleos (las brasas), el puntero, las ondas, los
arcos y el temblor. Cada mota vive 6–14 s y renace. [PULIDO 18] En el mundo y con el piso de las brasas.

| Ajuste (uniforme) | B · enjambre |
|---|---|
| `uFlujo` (rapidez, caliente, sigue, rampa) | 0,5 · 1,2 · 1,1 · 1,2 |
| `uNucleosAjuste` (fuerza, suavizado, giro, calienta) | 1,6 · 0,6 · 1,4 · 0,4 |
| `uReparto` (hueco, radio, reparto, contiene) | 3,4 · 11 · 2,4 · 1,6 |
| `uEnergiaAjuste` (reposo, por temperatura, enfría s, tiembla) | 0,08 · 0,35 · 0,9 · 3 |
| `uCursorAjuste` (alcance, atrae, giro, calienta) | 4,6 · 0,5 · 2,4 · 0,9 |

## Los arcos (`arcos/`, `dibujo/arcos.ts`)

- Los de PULIDO 15 (cortos, quebrados, pocos; el logo es la fuente): como mucho 5 a la vez (4 en el teléfono). Clases: entre los
  pares enlazados (1,1/s, a veces vuelven a saltar enseguida: 40 % en 0,04–0,2 s), del logo (cada 2,4–4,8 s, más seguido activo;
  largo mínimo 1,6 u, la más corta que lo pase entre seis), al puntero (2,6/s), el clic (1 o 2 arcos cortos) y la descarga al soltar
  (uno grande, al grupo más denso o al logo). Nunca donde no se ve (un texto o fuera del cuadro).
- 2–3 golpes por el mismo canal en ~150 ms, el destello de cada golpe (0,03 s) y el resplandor residual (0,15 s). El camino: punto
  medio de 5 niveles, desvío 0,12, aspereza 0,45.
- [PULIDO 18] EL HALO CON PUNTOS: un punto suave por punto del camino (0,55 del medio ancho del canal, hasta 2,6 radios), con su peso
  por lo que avanza hasta el siguiente punto en la pantalla (un tubo parejo). Como cinta, en un quiebre cerrado el halo ancho se
  plegaba en esquirlas blancas (de cerca); y la luz que corre dibujaba rayas de través en el halo (una espina de pescado): ahora corre
  sólo en el NÚCLEO, la cinta fina (que no se pliega). El inglete, con tope 1/0,85. Blandos contra lo opaco en 0,15 u.
- De noche: halo 0,16, resplandor 0,18, núcleo 1,7. De día: el halo es energía oscura (0,22; resplandor 0,1) que enmarca un núcleo más
  blanco que el papel. Los efectos: el piso se ilumina debajo de un arco, de noche (0,09); un destello chico donde un arco toca el logo.

## El dibujo (`dibujo/particulas.ts`)

Ninguna figura. BRILLA: titila con su ritmo (las positivas lento, las negativas rápido), destella (más seguido caliente) y RESPIRA con
su región (un ruido lento: zonas que se encienden). VIBRA: caliente, tiembla en la pantalla. Viene de la FUENTE (lejos del logo se
apaga) y deja libre la CARA DEL LOGO. Un tope de brillo por partícula.

[PULIDO 18] MÁS PARTÍCULA, MENOS NUBE: el NÚCLEO tiene un tope de radio (1,3 px: chico y nítido siempre; el tamaño de la chispa lo
lleva el HALO, corto: 2 núcleos, 0,14); los TAMAÑOS van por una LEY DE POTENCIA (una Pareto truncada entre 0,012 y 0,08 u, exponente
2,3: la mediana, 1,35 veces la más chica; más de 3 veces, el 7 %); las INTENSIDADES varían (de 0,35 a 1: muchas tenues, pocas
fuertes); casi sin desenfoque (0,06 px por u, hasta 1,5: era el bokeh); y una CRUZ MUY CHICA (dos rayos de 7 px en la pantalla) sólo
en las más calientes y al destellar fuerte.

[PULIDO 18] BLANDAS: el halo se desvanece contra lo opaco (el piso, el logo, el pie, los títulos) en su propio ancho del mundo, con la
profundidad del pase compartido: ningún brillo corta una superficie.

[PULIDO 18] DE DÍA (las tres opciones juntas, en uniformes; cada una se apaga sola para comparar): un CUERPO oscuro nítido (el núcleo,
0,6), un VELO tenue alrededor (0,22), un ESPECULAR mínimo corrido hacia la luz principal (arriba a la izquierda, sólo en los cuerpos que
se ven grandes) y, en las calientes, el CALOR: refracta lo de atrás (la copia del cuadro: 2,2 px con un temblor, en un radio de 7 px) y
le sube el contraste oscureciendo los medios (el papel blanco queda blanco). Sin el punto blanco al centro de PULIDO 17: las calientes
se leían como ojos o burbujas.

| Uniforme | A · chispa | B · mota |
|---|---|---|
| `uTamano` (radio u mín. · máx., px mín. · máx.) | 0,012 · 0,08 · 0,7 · 3,2 | 0,012 · 0,04 · 0,6 · 4 |
| `uNucleo` (el tope del radio del núcleo, px) | 1,3 | sin tope |
| `uChispa` (la ley de potencia, el brillo propio más bajo, la cruz, su largo px) | 2,3 · 0,35 · 0,55 · 7 | 1,4 · 1 · 0 · 0 |
| `uLuz` (brillo, reposo, halo, ancho del halo) | 1,3 · 0,18 · 0,14 · 2 | 0,7 · 0,08 · 0,3 · 2,5 (B, en su dirección: 0,32 · 0,12 · 0,45 · 3) |
| `uDia` (el cuerpo, el especular, —, desde) | 0,6 · 0,55 · — · 0,6 | 0,03 · 0 · 0,7 · 0,55 |
| `uDiaForma` (el velo: ancho en radios, mínimo px, alfa) | 1,6 · 1,2 · 0,22 | 2,2 · 3 · 0 |
| `uCalorDia` (refracta px, contraste, radio px, desde) | 2,2 · 0,6 · 7 · 0,35 | sin calor |
| `uMovida` (estela s, temblor px, desenfoque, tope) | 0 · 1,2 · 0,06 · 1,5 | 0,02 · 1 · 0,4 · 7 |
| `uFuente` (radio, se apaga, respira, escala) | 6,5 · 0,75 · 0,55 · 0,22 | 5,5 · 0,85 · 0,75 · 0,25 |
| `uDelante` (cara del logo, radio, tope) | 0,3 · 3,6 · 1,6 | 0,7 · 3,6 · 1,1 |

Los textos: pasan por detrás (90 %), con un borde suave de 56 px. El tono: el ACES compensado de la escena, el día y la noche cada uno
por su lado; la salida premultiplicada (de día tapa, de noche suma; el calor, debajo del cuerpo). Sin bloom.

## El pase compartido (`escena/pase/`)

- LA PROFUNDIDAD de lo opaco: una pasada a media resolución con la cámara del cuadro y sólo la capa de lo que escribe profundidad (y
  las luces), montada ÚLTIMA en el escenario (su cuadro corre después de todos y antes de que r3f dibuje). El destino se declara «como
  la pantalla» (`isXRRenderTarget`: el mismo tono y espacio de color) y lleva las mismas luces: ningún programa nuevo. Anidada (en el
  `onBeforeRender` de una malla) el estado de las luces era otro y three rearmaba los parámetros de cada material en cada cuadro.
- LA COPIA DEL COLOR del cuadro dibujado hasta la trama: un disparador que no pinta (orden −18, después de la trama) copia el cuadro a
  una textura, sólo si alguien lo pidió en ese cuadro (el plasma de día; el espejo con un efecto vivo).
- El orden: la energía se dibuja desde −10 (después de la copia y antes del haz y del amanecer: lo de después queda encima del calor).

## El reflejo en el piso (`dibujo/reflejos.ts`)

De noche, las chispas a menos de 2,6 u del piso se ven espejadas debajo, más anchas y tenues (el papel es mate: un reflejo difuso),
titilando con su chispa; sólo donde lo que se ve es el piso (la profundidad: el logo o el pie delante lo tapan) y no sobre un texto.
Un dibujo más con los mismos atributos, sin física.

## La temperatura (`calor.ts`)

0 a 1. Sube con la velocidad del scroll (0,55 por pantalla por segundo, hasta 4), los anillos del pulso del logo (0,06 × amplitud),
el principal (0,12), el clic (0,35), la descarga (0,45), el golpe del pie (0,45) y cada arco (0,012); vuelve a 0,14 en 2,6 s
(más rápido caliente); se satura con una tangente hiperbólica (nunca pasa el techo).

## El gesto (`interaccion/`)

Clic (menos de 0,26 s): un pulso (una onda que empuja y calienta, y 1–2 arcos). Mantener: la carga (completa en 1,4 s; hasta 3 veces
la del puntero). Soltar: la descarga. En el teléfono, tocar y mantener quieto (el dedo que se mueve más de 10 px hace scroll y
cancela). Sobre un texto, nada. [PULIDO 18] Al moverse, el puntero deja su estela (la arrastra).

## El pie

Hacia el golpe del encastre, la energía cerca del logo baja hasta un 85 %; el golpe es una ONDA desde el logo en el mundo (sin arco);
después se apaga con la cámara que sube. [PULIDO 18] Cuando el logo baja a su lugar, el plasma se queda donde está.

## Movimiento reducido

Quietas (sin titilar: el reloj del dibujo clavado), sin física, sin arcos ni pulsos.

## Lo medido

PULIDO 18: pendiente del banco del sitio (sin memoria para el banco durante el sprint; el mini-banco compila y dibuja todo sin
errores). Lo de PULIDO 17 queda como historia (con C, que se borró en PULIDO 18). En la NVIDIA (RTX 5050; la pantalla del banco va a
75 Hz: 13,34 ms por cuadro). Recibo: `entregas/pulido-17/o5-medido.json`.

| | Con vsync, al máximo (media / máx.) | De noche (máx.) | Cuadros de más de 20 ms en caliente | Sin vsync, al máximo (lo que suma al polvo) | La simulación en la GPU |
|---|---|---|---|---|---|
| A · 1440 | 13,34 / 14,1 | 14,0 | 0 | 4,32 ms (+2,04) | — |
| A · 390 | 13,34 / 14,0 | 14,0 | 0 | 2,43 ms (+0,42) | — |
| B · 1440 | 13,34 / 14,1 | 14,0 | 0 | 2,76 ms (+0,48) | 0,121 ms |
| B · 390 | 13,34 / 14,0 | 14,1 | 0 | 2,15 ms (+0,14) | 0,025 ms |
| C · 1440 | 13,34 / 14,0 | 14,1 | 0 | 2,74 ms (+0,46) | 0,113 ms |
| C · 390 | 13,34 / 14,0 | 14,0 | 0 | 2,17 ms (+0,16) | 0,026 ms |
| el polvo (la base) · 1440 | 13,34 / 13,9 | 14,0 | 0 | 2,28 ms | — |
| el polvo · 390 | 13,34 / 13,9 | 14,0 | 0 | 2,01 ms | — |

EN FRÍO (PULIDO 17): el polvo solo tironea igual (534, 747 y 547 ms a 1440; 814 a 390) que con el plasma: son del sitio (el campo del
logo que se publica y las secciones que se montan al llegar).

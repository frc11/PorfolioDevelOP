# EL PLASMA — el modelo, para afinarlo

`?energia=plasma` (en lugar del polvo) o `?energia=plasma-y-polvo` (con el polvo). El producto sigue siendo el polvo hasta que el
humano diga. Experimentos, apagados: `?plasma-color=si` (azul eléctrico), `?plasma-campo=si` (las líneas de campo con el botón
apretado) y `?plasma-sonido=si` (un chisporroteo muy bajo en los arcos, con el sonido prendido).

Hecho en PULIDO 15 (cargas y arcos) y rehecho en PULIDO 16 · N2 («mejorá TODO, más profesional, metele magia»). La idea que lo une:
**las partículas y los arcos se afectan entre sí**. Los arcos ionizan lo que tocan; las cargas guían el camino de los arcos; la
temperatura, que sube con lo que hace el usuario, rompe moléculas, ioniza y dispara más arcos; en calma todo se recompone.

Invariante: `npm run test:s67-pulido-16` (sección N2). Banco: `~/.cache/b4-medicion/pulido-16/_scripts/n2-plasma.ts`. Recibo:
`docs/rediseno/entregas/pulido-16/n2-plasma.json`.

## Dónde está cada cosa (`src/app/v3/_lib/escena/energia/`)

| Módulo | Qué |
|---|---|
| `especies.ts` | Las tres especies, ionizar, recombinar, los fundidos, los ecos. Puro. |
| `fisica/fisica.ts` | Las constantes de la física, el estado del gas, la grilla, el campo eléctrico en un punto. |
| `fisica/integracion.ts` | Las fuerzas por subpaso y la integración semi-implícita; el cuadro de la física. |
| `fisica/reacciones.ts` | Los enlaces que se rompen, la recombinación, la ionización térmica. |
| `fisica/temperatura.ts` | La temperatura del gas: lo que la sube, lo que la baja, el autolímite. |
| `arcos/camino.ts` | El líder escalonado (el camino que sigue al campo), el detalle, las ramas, el re-golpe. |
| `arcos/arcos.ts` | Qué es un arco, sus clases, sus golpes y su resplandor, sus luces. |
| `arcos/programador.ts` | Quién nace y cuándo, los golpes, la ionización por el camino, el pulso y la descarga. |
| `arcos/bufer.ts` | El búfer fijo de tramos (arcos, enlaces, líneas de campo). |
| `interaccion/interaccion.ts` | La máquina del gesto (clic, mantener, soltar, el dedo que hace scroll). Pura. |
| `interaccion/puntero.ts` | Los oyentes del DOM (pasivos). |
| `interaccion/lineasDeCampo.ts` | El experimento de las líneas de campo. |
| `render/comun.ts` | Lo común de los sombreadores: textos, luces de los arcos, la salida por el tono de la escena. |
| `render/particulas.ts` | El sombreador de las partículas (LOD, órbitas, estelas, profundidad de campo, día y noche). |
| `render/arcosYEfectos.ts` | Los sombreadores de los arcos (dos pasadas) y de los efectos (piso, logo, anillo, halo). |
| `render/armado.ts` | Las mallas, las uniformes, la paleta, lo que el programador pregunta afuera; la subida a la GPU. |
| `cuadro.ts` | Un cuadro: la temperatura, el gesto, la física, los arcos, el dibujo. Sin reservas. |
| `PlasmaYCargas.tsx` | El componente: arma, escucha, publica el banco y llama al cuadro. |
| `banco.ts` | Lo que el banco lee y pide (sólo con banco). |
| `textoEnPantalla.ts` | Las cajas de los textos a la vista (lo que ocupan sus letras; sólo lo que se ve). |

## Las especies (`ESPECIES`, `especies.ts`)

| Especie | Carga | Masa | Cómo se ve |
|---|---|---|---|
| Átomo | 0 | 1 | Un núcleo y, de cerca, uno o dos electrones en micro-órbita (una elipse inclinada). De lejos, un punto con halo. |
| Ion + | +1 | 1 | Un átomo que perdió un electrón: el núcleo con un halo más grande y más caliente (se enfría solo), sin órbita. |
| Electrón − | −1 | 0,14 | Chico y rápido, con una estela corta alineada a su velocidad. |

- Cuántos: 260 átomos y 64 lugares de electrón libre en escritorio (324 partículas); 140 y 36 en el teléfono (176).
- Dónde: una cáscara alrededor del centro del logo, de radio 13 u y con un hueco de 4,2 u (el logo mide 6,9 de ancho). Más afuera de
  1,35 veces el radio se van con un fundido y renacen adentro, con su especie.
- Al empezar, el 12 % de los átomos ya está ionizado (con su electrón al lado).
- **La reserva de electrones es el primer autolímite**: sin lugar libre no hay ionización (el gas nunca tiene más de 64 iones).
- **Fundidos, nunca un pop** (s): nacer 0,9; irse 0,7; el electrón que sale disparado 0,06 (4 cuadros); el que se captura 0,12.
- Brillo de un evento (se suma y se apaga en 0,35 s): ionizar 1,2; recombinar 1,6 (el destello); cada golpe de arco 0,5. Calor del
  ion recién hecho 1, que se enfría en 2,4 s.
- El eco de una recombinación: un anillo chico que crece en 0,4 s (de día en tinta, de noche en luz), hasta 4 a la vez.

## Las fuerzas (`FISICA`, `fisica/fisica.ts` e `integracion.ts`)

- **Coulomb suavizado** entre cargas: `k · qi · qj · r / (r² + ε²)^(3/2)`, k = 1,1, ε = 0,32 u, con un **corte suave** a cero en el
  alcance (3 u): `(1 − r²/alcance²)²`. Las opuestas se atraen; las iguales se repelen; encima de una carga el campo es finito.
- **Polarización**: un átomo neutro cerca de una carga, una atracción débil (0,12, con el mismo corte).
- **Repulsión de corto alcance** entre todas (como Lennard-Jones, acotada): debajo de σ = 0,42 u, `8 · (1 − r/σ)² · σ / max(r, 0,1)`.
  No colapsan (medido: nunca a menos de ~0,1 u en dos minutos).
- **El logo**: una carga positiva suavizada en su centro (2,4; suavizado 3,4 u, porque no es un punto) que **late**: sube hasta
  un 60 % con su pulso principal (el latido decae en 0,55 s).
- **El puntero**: una carga sobre su rayo (alcance 4,6 u, carga 4,2; pegado al rayo rechaza, 0,6 u). Atrae a los electrones,
  empuja a los iones y polariza a los átomos. Cargándose, hasta 3 veces más fuerte. Rompe los enlaces a menos de 2,6 u.
- **Los anillos del pulso del logo**: su frente (la misma cuenta que el piso, `entorno/Pulso.tsx`) empuja el gas hacia afuera, en
  el plano del piso (2,6).
- **Agitación térmica**: un empujón al azar de `(0,3 + 1,4 · T) · 1,7` u/s² (los electrones, 2,4 veces más).
- **Contención**: un resorte (1,6) devuelve a la cáscara lo que sale del radio o entra al hueco.
- **Amortiguación** (1/s) y **tope de rapidez** (u/s), por especie: átomo 1,15 y 2,4; ion 1 y 2,4; electrón 2,1 y 6,5.
- **Integración**: semi-implícita (primero la velocidad, después el lugar con la velocidad nueva), a paso fijo de 1/120 s, con
  subpasos (a lo sumo 4 por cuadro). **La grilla**: celdas del alcance (3 u); cada partícula mira las 27 celdas vecinas: ~2.600 pares
  por subpaso de los 52.326 de todos contra todos.

## Las moléculas (`FISICA.enlace`, `integracion.ts` y `reacciones.ts`)

| | Se forma a | Más lento que (u/s, × (1 − 0,7 T)) | Reposo | Resorte | Amortiguación | Latido | Energía (Arrhenius) | Se rompe estirado a |
|---|---|---|---|---|---|---|---|---|
| Molécula (dos átomos) | 0,62 u | 0,9 | 0,55 u | 110 | 1,2 | 1,4 Hz, ±13 % | 0,55 | 1,9 × reposo |
| Par ligado (ion y electrón) | 0,85 u | 2,4 | 0,62 u | 40 | 0,5 | 1,9 Hz, ±11 % | 0,42 | 2,1 × reposo |

- **Vibran**: su largo de reposo late y el resorte (rígido: su frecuencia propia, arriba del latido) lo sigue (medido: el largo
  varía ~0,07 u).
- **Se rompen** solos con la **temperatura local**: la del gas más `0,12 · v²`, con v la rapidez relativa del par DE COSTADO (a lo
  largo del enlace es su propia vibración). Por cuadro, `1 − exp(−2,5 · exp(−energía / (local + 0,02)) · dt)`. También estirados
  de más o tocados por el puntero. Después, un rato sin enlazarse (1,5 a 4 s).
- **El par ligado recombina** en calma: `0,16 · (1 − T)²` por segundo. El ion captura su electrón (un destello y un eco).
- **Ionización térmica**, sólo muy caliente: por segundo y por átomo, `0,12 · (T − 0,45)²`.

## La temperatura (`TEMPERATURA`, `fisica/temperatura.ts`): el puente con el usuario

Un número de 0 a 1. La calma es 0,14.

| Sube con | Cuánto |
|---|---|
| El scroll | 0,55 por segundo por cada pantalla por segundo (hasta 4 pantallas/s). Rápido sostenido: ~0,6–0,7. |
| Cada anillo del pulso del logo (por su amplitud) | 0,06 |
| El pulso principal del logo | 0,12 |
| El clic (el pulso) | 0,35 |
| La descarga (soltar lo cargado) | 0,45 · (0,5 + 0,5 · fuerza) |
| El golpe del pie | 0,45 |
| Cada arco | 0,012 |

- **Baja** sola hacia la calma, con `τ = 2,6 / (1 + T)` s: más rápido cuanto más caliente.
- **El autolímite**: lo acumulado se satura con una tangente hiperbólica (nunca pasa de 1); calentar cuesta más cuanto más caliente
  está (`· (1 − T)`); se enfría más rápido caliente; y la reserva de electrones limita la ionización.
- **Qué cambia**: la agitación, la ruptura de enlaces (Arrhenius), la ionización térmica, la chance de que un arco ionice
  (`× (1 + 0,6 T)`), las tasas de los arcos (`× (1 + 1,4 T)`) y cuánto vibra todo. En calma se forman moléculas y los iones
  recapturan; caliente, todo se rompe y se ioniza.

## El ciclo de la ionización

1. Un **arco** pasa cerca de un átomo (o le pega): el átomo se vuelve **ion +** y suelta un **electrón** que sale disparado (2,6 a 4,4
   u/s, lejos del canal) con su estela.
2. El electrón se frena (su amortiguación) y la **atracción de Coulomb** lo lleva hacia un ion.
3. Lento y cerca, forman un **par ligado** que vibra. Mientras dura, **descarga arcos** entre los dos (que ionizan a los vecinos).
4. En calma, el par **recombina**: el ion captura su electrón, con un destello y un eco, y vuelve a ser átomo.
5. Caliente, los pares se rompen antes de recombinar: hay más iones y más arcos. Como mucho tantos iones como lugares de electrón.

Medido en Node (dos minutos: 40 s en calma, 40 s con scroll rápido, 40 s en calma): unas 110 ionizaciones y 110 recombinaciones; en
calma ~15–20 iones y ~4 moléculas a la vez; caliente ~50 iones (hasta los 64 del tope) y casi ninguna molécula; vuelve a ordenarse.

## Los arcos (`ARCOS`, `CAMINO`, `arcos/`)

- **El camino es un líder escalonado** (`camino.ts`): 24 pasos desde el origen; cada paso mezcla la dirección al blanco (pesa de
  0,25 a 1 a lo largo del camino), **el campo eléctrico en ese punto** (pesa 0,62 al principio, nada al final: sigue las líneas de
  campo) y un poco de azar (0,34; la mitad en los del logo). Cada paso se parte en dos con el medio corrido un 14 % (el detalle).
  Medido contra el campo de verdad: 0,75 de alineación, contra 0,63 de un camino guiado al azar.
- **Las ramas** (hasta 3, de 8 pasos) salen entre el 15 % y el 80 % del camino y **buscan una carga a menos de 1,9 u**; si no hay,
  mueren a lo largo del campo (0,35 a 0,8 u).
- **Los golpes**: 2 o 3 en una ventana de 40 a 150 ms, por el mismo canal (el re-golpe lo tiembla un 10 %). Cada golpe, un destello
  del núcleo que se apaga en 28 ms; el **resplandor residual del canal** decae en 140 ms. El arco vive su último golpe más ~360 ms.
- **La ionización**: el primer golpe ioniza el átomo donde pega y los que su camino toca (a menos del radio de su clase), con su
  chance; los re-golpes, con un tercio de esa chance.
- **La luz**: cada arco ilumina un instante lo que tiene cerca (las partículas a ~1,7 u, en el sombreador), el piso debajo (un disco
  de luz, de noche) y, el del logo, donde toca el logo (un destello). Sin bloom.
- Las clases:

| Clase | Golpes | Brillo | Ancho | Ramas | Ioniza (radio, chance, máximo) | Cuándo |
|---|---|---|---|---|---|---|
| `par` (ion y electrón ligados) | 2–3 | 0,8 | 1 | 0–1 | 0,35 u, 0,35, 1 | 0,9 por segundo × calor |
| `logo` (el generador) | 3 | 1,35 | 1,35 | 0–1 (los más limpios) | 0,45 u, 0,75, 3 | cada 2–4 s; más seguido con su latido, cerca del encastre y en el golpe del pie |
| `cursor` (al puntero) | 2 | 1 | 0,9 | 0–1 | 0,3 u, 0,3, 1 | 2,2 por segundo × calor, desde cargas a 0,9–3,2 u de su rayo |
| `pulso` (el clic) | 2 | 1,1 | 1 | 1–2 | 0,45 u, 0,6, 2 | 2 a 4 arcos al clic, a partículas a menos de 4 u |
| `descarga` (soltar lo cargado) | 3 | 1,8 × fuerza | 1,8 × fuerza | 1–3 | 0,6 u, 0,85, 4 | al grupo de cargas más denso a menos de 9 u; sin grupo, al logo |

- **Como mucho 5 a la vez** (4 en el teléfono); los re-golpes no suman. Si no hay lugar, el del puntero y la descarga desplazan al
  arco más viejo.
- **Nunca sobre un texto**: un arco no nace si un extremo cae sobre un texto (las cajas de lo que ocupan sus letras, con 14 px de
  aire; sólo lo que se ve) y se apaga detrás de él (pasa por detrás, en el sombreador).

## La interacción (`INTERACCION`, `interaccion/`)

- El puntero es una carga, siempre (el mouse sobre la página; el dedo mientras toca).
- **Clic o toque corto** (menos de 260 ms): **el pulso**, un frente radial que empuja todo hacia afuera (3,2 u/s), ioniza hasta 3
  átomos y tira 2 a 4 arcos; un anillo que crece en 0,45 s (2,8 u).
- **Mantener apretado**: desde los 260 ms **se carga** (del todo en 1,4 s): un halo que crece y late, y su carga, hasta 3 veces más
  fuerte. **Al soltar**: la descarga, con la fuerza de la carga.
- **En el teléfono** el arrastre es el scroll: un dedo que se mueve más de 10 px cancela el gesto. El gesto es tocar (pulso) o
  mantener quieto (cargar y soltar). El dedo que se levanta todavía cuenta en ese cuadro (su último punto).
- **Sobre un texto o algo que se cliquea, nada**: el gesto es de la página. Los oyentes son pasivos (no frenan el scroll ni el clic).
- El punto del puntero en el volumen: donde su rayo entra a una esfera de 5,4 u alrededor del logo (sobre el logo, no cae en su hueco).

## El dibujo (`render/`)

- **Las partículas**, instanciadas (una llamada): el tamaño del mundo a su distancia (núcleo de 0,045 a 0,095 u; el electrón, 0,028),
  con topes de 1,3 a 8 px.
  - **LOD**: con el núcleo de 2,2 px aparecen las órbitas; desde 3,8 px se ven enteras (un fundido entre los dos).
  - **La estela** del electrón: lo que recorrió en 0,075 s, en la pantalla (hasta 70 px), que se apaga hacia la cola.
  - **Profundidad de campo barata**: lejos del foco (el logo), de 3,5 a 14 u, más blando y hasta un 70 % más tenue.
- **De día, objetos**: el núcleo es una esfera de grafito sombreada con un **borde especular fino y claro** del lado de la luz (y un
  brillito); alrededor, un anillo del papel (sobre el papel no se ve; sobre el logo negro lo separa). **De noche, luz**: el núcleo
  blanco que se va al halo; el del ion, más grande y apenas más cálido.
- **Los arcos**, en **dos pasadas** con la misma geometría: primero la tinta y el resplandor de todos los tramos, después los
  núcleos (si no, de día la tinta de un tramo tapaba el núcleo del anterior en cada junta). De día, **tinta con un núcleo blanco**;
  de noche, luz (el núcleo, fuerte: el tono lo lleva al blanco).
- **Los efectos** (instanciados): el piso iluminado bajo cada arco (de noche), el destello en el logo, el anillo del pulso, el eco de
  la recombinación y el halo del puntero que se carga.
- **El tono**: todo se calcula en lineal y pasa por el tono de la escena (el ACES compensado, `tono.ts`) y su espacio de color, de
  día y de noche por su lado. Premultiplicado: de noche suma luz (alfa 0); de día tapa con su alfa.
- **Detrás de los textos**: cada partícula, arco y efecto se apaga un 95 % sobre una caja de texto.
- **Movimiento reducido**: quietas (a la vista, sin fundido), sin arcos, ni pulsos, ni efectos.
- **El final del pie**: se apaga con la cámara que sube, recién después del golpe (antes, cerca del encastre, el logo está más
  activo; en el golpe, descarga).
- **La paleta** (lineal, antes del tono): monocromo (de día grafito 0,075 con borde y halo del papel 0,82–0,86; de noche blanco, el
  halo 0,70/0,75/0,86, el del ion caliente 0,98/0,90/0,82, los arcos 0,74/0,80/1) o azul eléctrico (`?plasma-color=si`).

## Los límites («flashero, pero con un límite»)

- Cientos de partículas: 324 en escritorio, 176 en el teléfono.
- Como mucho 5 arcos a la vez (4 en el teléfono), más sus re-golpes.
- La escena no se satura: la temperatura no pasa de 1 y se enfría más rápido caliente; la ionización tiene la reserva de electrones;
  las tasas suben, pero con el tope de arcos.

## El rendimiento

- La física en la CPU, con la grilla (unos 0,3 ms por cuadro en Node). Las partículas instanciadas; los arcos, los enlaces y las
  líneas de campo desde un búfer fijo de 752 tramos (una llamada por pasada). **Sin reservas por cuadro**: los búferes son fijos y
  suben enteros (con los rangos de subida, three ordena con un comparador nuevo en cada subida). Las cajas de los textos se leen
  cada 200 ms o con el scroll (eso sí lee el DOM).
- Medido en la NVIDIA (RTX 5050; la pantalla del banco va a 75 Hz: 13,34 ms por cuadro): ver el recibo y el log de PULIDO 16.

## Para afinar

- Más o menos arcos: `ARCOS.tasas` (pares, cursor, cada cuánto el logo) y `ARCOS.tasas.calor`.
- Más o menos ionización: `ARCOS.clases.*.ioniza`, `FISICA.ionizacionTermica`, `ESPECIES.electrones` (la reserva).
- Más orden en calma: `FISICA.enlace.ligado.recombina`, `FISICA.enlace.*.energia` (más alta, más duran).
- Más reacción al scroll: `TEMPERATURA.scroll.porPantalla`; volver antes a la calma: `TEMPERATURA.baja`.
- Arcos más pegados al campo: `CAMINO.campo` (más alto) y `CAMINO.azar` (más bajo).
- El aspecto: `PARTICULAS` (tamaños, LOD, estela, foco), `TRAZO` (anchos de los arcos), `PALETAS` (`render/armado.ts`).

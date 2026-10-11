# EL PLASMA — el modelo, para afinarlo

`?energia=plasma` (en lugar del polvo) o `?energia=plasma-y-polvo` (con el polvo), en una de tres direcciones: `?plasma=a|b|c`
(pedida sola, `?plasma=b` también monta el plasma). Sin `?plasma=`, la recomendada: **A**. El producto sigue siendo el polvo hasta
que el humano diga.

Historia: PULIDO 15 (cargas sueltas + arcos: gustó), PULIDO 16 (átomos, iones, electrones, moléculas: «tiene una forma muy definida,
tampoco para tanto»; se borró con sus experimentos de color, campo y sonido) y PULIDO 17 (este): el espíritu de PULIDO 15 llevado a
otro nivel, «algo un poco menos nítido, menos formado; partículas de energía que brillan, vibran, se mueven». Monocromo, sin sonido.
Referencias y por qué: `docs/rediseno/REFERENCIAS-PLASMA.md`.

Invariante: `npm run test:s68-pulido-17` (O3 y O5). Bancos: `~/.cache/b4-medicion/pulido-17/_scripts/` (`o4-secuencias.ts`,
`o5-medir.ts`, `o5-tanda.sh`). Recibos: `docs/rediseno/entregas/pulido-17/`.

## Las tres direcciones

| | Qué es | La partícula | Dónde vive |
|---|---|---|---|
| **A · Chispas** (recomendada) | Las cargas de PULIDO 15 hechas luz: 600 (300 en el teléfono) | Núcleo gaussiano y halo, de tamaños muy distintos | CPU (`brasas.ts`) |
| **B · Enjambre** | Un medio: 16.384 motas (6.400 en el teléfono) alrededor de 40 núcleos | Mota finísima | GPU (`enjambre/`) |
| **C · Corrientes sobre el logo** | La energía corre pegada a la superficie del logo: 3.136 (1.600) | Estela corta (por la velocidad) | GPU, con el campo de distancia del logo |

Comparten todo lo demás: los arcos, la temperatura, el gesto, los textos, el tono, el movimiento reducido y el pie.

## Dónde está cada cosa (`src/app/v3/_lib/escena/energia/`)

| Módulo | Qué |
|---|---|
| `direcciones.ts` | Las tres direcciones, lo que cambia cada una (cantidades, aspecto, simulación) y la recomendada. |
| `ruido.ts` | El campo: curl noise con gradiente analítico; el mismo hash de 32 bits en JS y en GLSL. Puro. |
| `brasas.ts` | Las brasas (las chispas de A, los núcleos de B y C): la física de PULIDO 15, el campo, la energía, el puntero, las ondas, el piso, el brillo por densidad. Puro. |
| `calor.ts` | La temperatura de la escena (lo que la sube y la baja, el autolímite) y la lectura de la escena (scroll, pulso del logo, golpe del pie). Puro. |
| `arcos/camino.ts` | El camino de un arco: punto medio con ramas (el de PULIDO 15, más suave) y el temblor del re-golpe. Puro. |
| `arcos/arcos.ts` | Qué es un arco: clases, golpes, resplandor, el re-salto de los pares. Puro. |
| `arcos/programador.ts` | Quién nace y cuándo: pares, logo, puntero, clic, descarga; nunca donde no se ve. Puro. |
| `arcos/cinta.ts` | La cinta: una tira continua por camino y por rama, en un búfer fijo. Puro. |
| `enjambre/simulacion.ts`, `enjambre/enjambre.ts` | La simulación de B y C en la GPU (el ping-pong de la escena) y su paso. |
| `dibujo/comun.ts` | Lo común: textos (borde suave), luces de los arcos, el final, el tono y la salida premultiplicada. |
| `dibujo/particulas.ts` | El sombreador de las partículas (los tres estilos) y su aspecto (en uniformes que el banco ajusta en vivo). |
| `dibujo/arcos.ts`, `dibujo/efectos.ts` | El canal de luz de los arcos (dos pasadas) y los efectos (el piso de noche, el toque del logo). |
| `dibujo/armado.ts` | Las mallas, los materiales, qué se ve y el borde del logo. |
| `interaccion/` | La máquina del gesto (pura) y sus oyentes. |
| `cuadro.ts`, `PlasmaYCargas.tsx`, `banco.ts`, `textoEnPantalla.ts` | El cuadro, el componente, los ganchos del banco y las cajas del texto. |

## El campo

`ruido.ts`: la velocidad es el rotor de un potencial de tres canales de ruido de gradiente (Bridson y otros, 2007): sin divergencia
(medido: 4·10⁻⁵ relativa), se arremolina sin juntar ni vaciar. Escala 0,17 (un remolino ~6 u), deriva (0,021; 0,034; 0,027) por
segundo. En la CPU, cada brasa lo recalcula en cuadros alternos.

## A · Las brasas (`brasas.ts`)

- Las de PULIDO 15, sin cambios: cáscara de radio 13 y hueco 4,2; alcance 3,6; atraen 0,42 (opuestas) y repelen 0,55 (iguales); el
  rechazo de cerca (0,55, choque 6); amortiguación 1,1; tope 3 u/s; la cáscara 1,6. Enlaces: se forman a 1,2, reposo 0,95, resorte
  2,2, viven 2,5–7 s, empujón 0,9, enfriado 3–7 s.
- Nuevo: el campo (rapidez 0,42 u/s, ×1,9 caliente; se sigue a 0,8/s), el piso (nada pasa por debajo: un arco a una brasa bajo el
  piso se leía como grieta) y la ENERGÍA de cada una (0 a 1): reposo 0,1 + 0,45 × la temperatura, se enfría en 0,8 s; la calientan
  el puntero (1,6/s), las ondas de los pulsos (0,85 al pasar), las del logo (0,9/s en la cresta) y los arcos (0,6 en los extremos,
  0,35 alrededor). Caliente, tiembla (2,2 u/s²).
- El puntero (desde su rayo): alcance 4,6; atrae 2 (las negativas) y empuja (las positivas); rechazo de cerca 1,1; las hace GIRAR
  alrededor del rayo (2,6): ORDENA en vez de apilarlas (con 4,2 de atracción y 0,6 de rechazo se juntaban en un grumo blanco).
- El brillo por densidad: con n vecinas a menos de 1 u, ×1/(1 + 0,09 n) (un grupo no se satura: «flashero pero con límite»).

## B y C · El enjambre (`enjambre/`)

Posición y energía en una textura, velocidad y edad en otra (32 bits, el ping-pong de la escena). Todas las fuerzas son campos: el
curl noise (que cerca del logo sólo corre de costado: su campo de distancia), los núcleos (las brasas: los positivos atraen, los
negativos repelen, hacen girar; su fuerza respira), el puntero (atrae, hace girar, energiza; la carga crece más despacio que en las
brasas: miles de motas), las ondas, los arcos (energizan lo que pasa cerca) y el temblor. Cada mota vive 6–14 s y renace.

| Ajuste (uniforme) | B · enjambre | C · corrientes |
|---|---|---|
| `uFlujo` (rapidez, caliente, sigue, rampa) | 0,5 · 1,2 · 1,1 · 1,2 | 1,1 · 1 · 1,6 · 1,6 |
| `uNucleosAjuste` (fuerza, suavizado, giro, calienta) | 1,6 · 0,6 · 1,4 · 0,4 | 0,4 · 0,7 · 0,6 · 0,5 |
| `uReparto` (hueco, radio, reparto, contiene) | 3,4 · 11 · 2,4 · 1,6 | 3,6 · 11 · 2 · 1,6 |
| `uEnergiaAjuste` (reposo, por temperatura, enfría s, tiembla) | 0,08 · 0,35 · 0,9 · 3 | 0,06 · 0,4 · 0,8 · 2 |
| `uCursorAjuste` (alcance, atrae, giro, calienta) | 4,6 · 0,5 · 2,4 · 0,9 | 4,6 · 0,5 · 2,4 · 1,2 |
| `uSuperficie` (banda u, fuerza, se suelta desde, nace en ella) | — | 0,18 · 7 · 0,72 · sí |

C: un resorte a la banda de 0,18 u de la superficie del logo y el campo de costado; las que pasan 0,72 de energía se sueltan y se
alejan; nacen en la superficie (un punto de la caja del campo llevado a la banda en tres pasos).

## Los arcos (`arcos/`)

- Los de PULIDO 15 (cortos, quebrados, pocos; el logo es la fuente): como mucho 5 a la vez (4 en el teléfono). Clases: entre los
  pares enlazados (1,1/s, a veces vuelven a saltar enseguida: 40 % en 0,04–0,2 s), del logo (cada 2,4–4,8 s, más seguido activo;
  largo mínimo 1,6 u: más corto era una mancha), al puntero (2,6/s), el clic (1 o 2 arcos cortos: contenido) y la descarga al
  soltar (uno grande, al grupo más denso o al logo). Nunca donde no se ve (un texto o fuera del cuadro).
- MÁS LUMINOSOS Y MENOS DIBUJADOS: 2–3 golpes por el mismo canal en ~150 ms (en cada uno el canal tiembla un poco), el destello de
  cada golpe (0,03 s) y el resplandor residual (0,15 s). El camino: punto medio de 5 niveles, desvío 0,12, aspereza 0,45 (un
  canal, no un zigzag). La cinta es una tira continua (sin tramos superpuestos: de noche sumaban dos veces en cada junta).
- El canal: núcleo de 0,85 px, halo de 11 px (por el ancho de la clase), resplandor más ancho; las puntas se afinan; la luz CORRE
  por el canal. De noche: halo 0,16, resplandor 0,18, núcleo 1,7. De día: el halo es energía oscura (0,22; resplandor 0,1) que
  enmarca un núcleo más blanco que el papel.
- Los efectos: el piso se ilumina debajo de un arco, de noche (0,09); un destello chico donde un arco toca el logo (0,16 u). La
  luz de la «carga» del puntero se borró (era un disco blanco sobre el logo): la carga se ve en cómo se juntan y se calientan.

## El dibujo (`dibujo/particulas.ts`)

Ninguna figura: núcleo gaussiano y halo (otra gaussiana), en un cuadrado que se estira con la velocidad en la pantalla (en C; en A
y B, casi nada). BRILLA: titila con su ritmo (las positivas lento, las negativas rápido), destella (más seguido caliente) y RESPIRA
con su región (un ruido lento: zonas que se encienden). VIBRA: caliente, tiembla en la pantalla (30 veces por segundo). Viene de la
FUENTE (lejos del logo se apaga) y deja libre la CARA DEL LOGO (lo que queda entre la cámara y el logo, cerca del eje, se apaga).
Profundidad de campo con el mismo brillo total. Un tope de brillo por partícula.

DE DÍA, energía oscura: un velo de grafito translúcido del tamaño de la partícula, sin borde, y un destello más blanco que el papel
SÓLO en las calientes (con el destello en reposo, la energía oscura se leía como ojos y, sobre el logo, como rayones).

| Uniforme | A · chispa | B · mota | C · estela |
|---|---|---|---|
| `uTamano` (radio u mín. · máx., px mín. · máx.) | 0,02 · 0,07 · 0,8 · 5,5 | 0,015 · 0,05 · 0,7 · 4,5 | 0,014 · 0,045 · 0,65 · 4 |
| `uLuz` (brillo, reposo, halo, ancho del halo) | 1 · 0,2 · 0,3 · 3 | 0,32 · 0,12 · 0,45 · 3 | 0,5 · 0,16 · 0,3 · 2,5 |
| `uDia` (energía oscura, —, destello, desde) | 0,2 · — · 0,9 · 0,6 | 0 · — · 0,7 · 0,55 | 0,03 · — · 0,35 · 0,7 |
| `uMovida` (estela s, temblor px, desenfoque, tope) | 0 · 1,6 · 0,3 · 6 | 0,02 · 1 · 0,4 · 7 | 0,2 · 0,8 · 0,4 · 7 |
| `uFuente` (radio, se apaga, respira, escala) | 6,5 · 0,75 · 0,55 · 0,22 | 5 · 0,9 · 0,6 · 0,25 | 6 · 0,8 · 0,6 · 0,22 |
| `uDelante` (cara del logo, radio, tope) | 0,3 · 3,6 · 1,6 | 0,7 · 3,6 · 0,6 | 0 · 4 · 1,1 |

Los textos: pasan por detrás (90 %), con un borde suave de 56 px (en un campo denso, un borde de 24 px dejaba un rectángulo vacío).
El tono: el ACES compensado de la escena, el día y la noche cada uno por su lado; la salida premultiplicada (de día tapa, de noche
suma). Sin bloom.

## La temperatura (`calor.ts`)

0 a 1. Sube con la velocidad del scroll (0,55 por pantalla por segundo, hasta 4), los anillos del pulso del logo (0,06 × amplitud),
el principal (0,12), el clic (0,35), la descarga (0,45), el golpe del pie (0,45) y cada arco (0,012); vuelve a 0,14 en 2,6 s
(más rápido caliente); se satura con una tangente hiperbólica (nunca pasa el techo).

## El gesto (`interaccion/`)

Clic (menos de 0,26 s): un pulso (una onda que empuja y calienta, y 1–2 arcos). Mantener: la carga (completa en 1,4 s; hasta 3 veces
la del puntero). Soltar: la descarga. En el teléfono, tocar y mantener quieto (el dedo que se mueve más de 10 px hace scroll y
cancela). Sobre un texto, nada.

## El pie

Hacia el golpe del encastre, la energía cerca del logo baja hasta un 85 %; el golpe es una ONDA desde el logo (sin arco: competía
con la descarga del filo); después se apaga con la cámara que sube.

## Movimiento reducido

Quietas (sin titilar: el reloj del dibujo clavado), sin física, sin arcos ni pulsos.

## Lo medido

En la NVIDIA (RTX 5050; la pantalla del banco va a 75 Hz: 13,34 ms por cuadro). Recibo: `entregas/pulido-17/o5-medido.json`.

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

«Al máximo»: 6 s con la temperatura al tope, scroll rápido de ida y vuelta, pulsos y cargas. «Sin vsync»: el Chrome sin sincronía ni
tope de cuadros (el rAF mide lo que tarda el cuadro). A es la que más suma (las 600 brasas en la CPU: la física, ~0,9 ms en Node, y
lo demás del cuadro); B y C, casi nada (la simulación vive en la GPU).

EN FRÍO (la primera visita: las cachés de shaders, de código y HTTP borradas; el primer scroll rápido hasta el fondo y de vuelta):
el polvo solo tironea igual (534, 747 y 547 ms a 1440 en tres corridas; 814 a 390); con el plasma, A 587 y 400, B 1200, 480 y 720
y 347, C 694 y 187. Son del sitio: el cuadro largo cae con el campo del logo que se publica (lo hornea el polvo con física, montado
siempre: `o5-campo.ts`) y con las secciones que se montan al llegar. Lo del plasma está armado desde el primer cuadro (las
partículas, la cinta de los arcos y los efectos se dibujan siempre: el precompilado de la escena los arma).

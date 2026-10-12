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

[PULIDO 19] Q0 · B (el enjambre: 16.384 motas en la GPU alrededor de 40 núcleos) se borró con su código, su simulación y su estilo: la
decisión del humano (el cristal de la dimensión espejo la reemplaza). Con ella se fue `?plasma=`. Queda A, el producto.

## Dónde está cada cosa (`src/app/v3/_lib/escena/energia/` y `escena/pase/`)

| Módulo | Qué |
|---|---|
| `direcciones.ts` | La dirección (A, la única desde PULIDO 19): sus cantidades y su aspecto. |
| `ruido.ts` | El campo: curl noise con gradiente analítico; el mismo hash de 32 bits en JS y en GLSL. Puro. |
| `brasas.ts` | Las constantes, la creación (arriba del piso), la grilla y la física entre ellas de PULIDO 15 (atraer, repeler, enlazarse). Puro. |
| `paso.ts` | El paso: los enlaces, el campo (y el viento), lo de afuera, el movimiento nuevo, el piso, la energía y la integración. Puro. |
| `afuera.ts` | Lo de afuera de cada una: el puntero, las ondas de los pulsos y del logo, la agitación, la cáscara del mundo y el hueco del logo. Puro. |
| `movimiento.ts` | El movimiento nuevo: la convección, el pinch de los arcos y la estela del puntero. Puro. |
| `vecinas.ts` | Las vecinas: el brillo por densidad, calentar una, contar enlaces. Puro. |
| `calor.ts` | La temperatura de la escena y la lectura de la escena (scroll, pulso del logo, golpe del pie). Puro. |
| `arcos/` | El camino (`camino.ts`), qué es un arco (`arcos.ts`), quién nace y cuándo (`programador.ts`) y la cinta (`cinta.ts`). Puros. |
| `dibujo/comun.ts` | Lo común: la máscara de los textos (`TEXTOS_GLSL`, compartida con el espejo), las luces de los arcos, el final, el tono y la salida. |
| `dibujo/particulas.ts` | El sombreador de las partículas: lo propio de cada chispa (`CHISPA_GLSL`), blanda, la cruz, el día con su calor. |
| `dibujo/arcos.ts` | El canal de los arcos: el halo con PUNTOS a lo largo del camino y el núcleo en la cinta fina; blandos. |
| `dibujo/efectos.ts`, `dibujo/reflejos.ts` | Los efectos (el piso de noche bajo un arco, el toque del logo) y el reflejo tenue de las chispas en el piso. |
| `dibujo/armado.ts` | Las mallas, los materiales, el orden (después de la copia del cuadro y antes del haz), qué se ve y el borde del logo. |
| `interaccion/` | La máquina del gesto (pura) y sus oyentes (el espejo los usa también). |
| `cuadro.ts`, `PlasmaYCargas.tsx`, `banco.ts`, `textoEnPantalla.ts` | El cuadro (el viento, la estela, los canales), el componente, los ganchos del banco y las cajas del texto. |
| `escena/pase/` | EL PASE COMPARTIDO: la profundidad de lo opaco (las partículas blandas, el reflejo, el espejo) y la copia del color del cuadro (el calor de día, el espejo). |

## El mundo (PULIDO 18 · P1.b)

Todo vive en coordenadas del MUNDO: las brasas, los arcos y sus luces, los efectos, el puntero y el piso. Antes vivían en las
coordenadas del logo (si el logo bajaba, bajaban con él). El logo sólo influye: su HUECO (4,2) es un obstáculo donde esté (si baja, las
aparta al pasar; no se las lleva), sus ONDAS (el pulso) y su golpe salen de donde está, sus ARCOS nacen en su borde, y la FUENTE (el
brillo cae lejos del logo: [PULIDO 19] apenas, 0,2 en 9 u) y la cara libre se miden desde él. Al cargar, el logo cae desde 14 u: la nube
lo espera abajo, tenue, y se enciende cuando el logo llega.

[PULIDO 19] Q1.b · EL DOMINIO DE LA VISTA (`dominio.ts`) reemplaza a la cáscara (la cáscara de radio 13 queda como siembra antes del
primer cuadro y como límite sin dominio: las pruebas). El dominio es la pirámide de la vista con un margen del 20 % afuera del cuadro,
entre 0,4 y 1,8 veces el foco (la distancia de la cámara al logo), y es PERIÓDICO: la que sale por una cara reaparece por la opuesta
(a los lados a la misma profundidad; por el frente y el fondo a la misma altura del cuadro). En los planos lejanos es grande y en los
cercanos chico: la pantalla siempre está cubierta con la misma cantidad, y las brasas siguen en el mundo (al mover la cámara pasan de
largo; no la acompañan). La SIEMBRA (el primer cuadro con cámara) las pone parejas en el aire de la vista (la profundidad con densidad
∝ w^1,7: pocas cerca y grandes, muchas lejos y chicas; lo que cae bajo el piso se sortea de nuevo) y el REPARTO (`repartir`) corrige
el encuadre que cambia: cuenta las brasas por celda del cuadro (8 × 5) contra lo que le toca a cada celda por el aire que mira (una que
mira el piso de cerca pide menos), y las que sobran en una celda llena (1,2×) se apagan, se mudan a la más vacía (< 0,45×) y se
encienden ahí: de a 8 candidatas por cuadro. La grilla de las fuerzas (`grilla.ts`) es relativa a la caja del dominio (32 celdas por eje
como mucho, de al menos el alcance). El puntero entra a la nube a la profundidad del foco (o a la esfera del logo si su rayo la toca).

Q1.c · NADA APARECE NI DESAPARECE DE GOLPE: cada brasa tiene su VIDA (el alfa del dominio: 1 adentro del cuadro, 0 en el margen de los
lados —que no se ve— y en las bandas de profundidad: 0,3 del foco desde el frente, 0,45 hasta el fondo; al reaparecer por una cara o
nacer en su celda nueva vale 0) perseguida con un tope de cambio por cuadro (`fundidoS` 0,25 s), y su DENSIDAD (el brillo por las
vecinas) perseguida con inercia (0,8 s; antes saltaba cada cuatro cuadros). El brillo que se dibuja es el producto. s70 lo mide: en 10 s
de órbita y viaje al cierre con 900 brasas, ~7.000 eventos todos fuera del cuadro o ya apagadas, y fuera de ellos ningún salto mayor
que el tope; quieta, no recicla.

Q1.a · MÁS DENSIDAD: 800 brasas en escritorio y 400 en el teléfono (eran 600 y 300) y todas a la vista (antes la cáscara dejaba muchas
fuera del cuadro y la fuente las apagaba lejos del logo). Medido en el mini-banco con el encuadre del sitio contra PULIDO 18: la luz del
plasma sobre el fondo de noche ×1,9 (en el centro y en la periferia) y de día +20 %.

Q1.d · LA RED EN REPOSO (`reposo.ts`, la máquina; `dibujo/red.ts`, el dibujo). Quieta la página (sin scroll, sin un mouse que se
mueva, sin dedo) 3,5 s, las brasas se FRENAN (desde un segundo antes: quietas primero, enlazadas después; el freno se suma a la
amortiguación, 12/s) y se ENLAZAN con rayos finos de vecina en vecina: hasta tres por brasa, las más cercanas, a menos de 2,2 u en el
mundo y de 0,2 del cuadro (las cercanas a la cámara no cruzan media pantalla), por la grilla del último paso; la red crece del centro
del cuadro hacia afuera en 1,8 s (cada enlace nace con un retardo por su distancia al centro y se enciende en 0,25 s; nada se
ordena) y queda ARMADA: quieta y viva (el titileo leve, dos ritmos por enlace, lo pone el sombreador). Con UN gesto (un scroll, el
puntero que se mueve más de ~1,5 px, el dedo, un pulso, el final del pie) se CORTA en cascada desde el origen del gesto (el puntero
si está; si no, el centro) en 0,3 s: cada enlace muere con un destello y un golpe de energía a sus dos brasas (el chasquido: se
encienden y tiemblan), y el freno se suelta en 0,6 s. Mientras está armándose o armada no hay reparto, y una brasa que salta
(reaparece por una cara, se muda) o un enlace que se estiró más de 1,5 veces pierde su enlace: ningún rayo cruza la pantalla. Nunca
en el final del pie (cuenta como gesto) ni con movimiento reducido (el cuadro quieto no la llama). EL DIBUJO: un solo búfer de
cuadriláteros de pantalla (cuatro vértices y dos triángulos por enlace, 1,5 por brasa como mucho), el ancho en px del dispositivo
(0,45 px de medio ancho más un píxel blando), de día tinta translúcida y de noche luz, la máscara de los textos por píxel y el final;
siempre al menos un enlace nulo dibujado (el programa se arma al cargar). El banco: `estado().red` y `red(false)` para medir sin ella.

## El campo

`ruido.ts`: la velocidad es el rotor de un potencial de tres canales de ruido de gradiente (Bridson y otros, 2007): sin divergencia
(medido: 4·10⁻⁵ relativa), se arremolina sin juntar ni vaciar. Escala 0,17 (un remolino ~6 u), deriva (0,021; 0,034; 0,027) por
segundo. En la CPU, cada brasa lo recalcula en cuadros alternos. [PULIDO 18] El campo lleva además el VIENTO del scroll.

## A · Las brasas

- [PULIDO 19] Q1.d · una brasa que salta (reaparece por una cara del dominio, se muda) pierde su enlace sin empujón (`desenlazar`): el
  resorte la arrastraba por toda la pantalla hacia su pareja, que quedó del otro lado del dominio.
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
- [PULIDO 18] SIN BASURA POR CUADRO: ningún `Math.hypot` en lo de cada cuadro (en V8 asigna un arreglo por llamada; en el bucle de las
  vecinas eran unos 400 KB por cuadro, con recolecciones de hasta 300 ms en el mini-banco): `largo3` (`largo.ts`) y, en los dos bucles
  más calientes, el cuadrado directo. De 378 a 16 KB por cuadro; el cuadro del plasma sin vsync, de 2,19 a 1,02 ms (mini-banco, 1440).
  [PULIDO 19] Y SIN NÚMEROS POR PARÁMETRO EN LO DE CADA BRASA: en Chrome (V8 15), un número no entero que cruza una función que
  TurboFan no inlineó se encaja en un HeapNumber (16 bytes) a la ida y a la vuelta, y qué se inlinea cambia con cada reoptimización:
  con el estado vivo de la página, `pasoDeLasBrasas` asignaba 51 KB por cuadro (`dt` a `deAfuera` y `delMovimiento`, `x, y, z, t` al
  rotor, `piso` al envoltorio, `x, y, z` al alfa) y con una entrada sintética, 1 KB. Ahora `dt` va en la entrada (`en.dt`), el piso en
  el dominio (`d.piso`), el rotor en lote (`rotorEnLote`: la hora y el punto en arreglos del módulo), y las coordenadas, el alfa, la
  celda de la grilla y el punto del rayo se piden POR BRASA (`coordenadasDe`, `alfaDe`, `celdaDe`, `alRayoDesde`: el arreglo y el
  índice, que son enteros). Medido en el mini-banco: de 61 a 6 KB por cuadro a 1440 (de 116 a 20 recolecciones en 6 s) y de 34 a 5 a
  390; el cuadro sin vsync de 2,06 a 1,38 ms a 1440. La agitación térmica es un xorshift propio de cada brasa (`b.ruido`), inline.

## B · El enjambre

[PULIDO 19] Q0 · se borró con su código (`enjambre/`, su estilo `mota`, sus uniformes y `?plasma=`): la decisión del humano. Lo medido de
B en PULIDO 17 queda en su recibo (`entregas/pulido-17/o5-medido.json`) como historia.

## Los arcos (`arcos/`, `dibujo/arcos.ts`)

- Los de PULIDO 15 (cortos, quebrados, pocos; el logo es la fuente): como mucho 5 a la vez (4 en el teléfono). Clases: entre los
  pares enlazados (1,1/s, a veces vuelven a saltar enseguida: 40 % en 0,04–0,2 s), del logo (cada 2,4–4,8 s, más seguido activo;
  largo mínimo 1,6 u, la más corta que lo pase entre seis), al puntero (2,6/s), el clic (1 o 2 arcos cortos) y la descarga al soltar
  (uno grande, al grupo más denso o al logo). Nunca donde no se ve (un texto o fuera del cuadro).
- 2–3 golpes por el mismo canal en ~150 ms, el destello de cada golpe (0,03 s) y el resplandor residual (0,15 s). El camino: punto
  medio de 5 niveles, desvío 0,12, aspereza 0,45.
- [PULIDO 18] EL HALO CON PUNTOS: un punto suave por punto del camino y otro en el medio de cada tramo (el vértice del otro lado de la
  cinta), de 0,55 del medio ancho del canal, hasta 2,6 radios, con su peso por lo que avanza hasta el siguiente (un tubo parejo). El
  radio, al menos lo que avanza (si no, un collar de cuentas), y lo que crece así no suma luz (más ancho, más tenue): con el radio por
  el paso y sin conservar la luz, una descarga larga y cercana era una columna blanca gruesa (visto en el banco del sitio). Como cinta, en un quiebre cerrado el halo ancho se
  plegaba en esquirlas blancas (de cerca); y la luz que corre dibujaba rayas de través en el halo (una espina de pescado): ahora corre
  sólo en el NÚCLEO, la cinta fina (que no se pliega). El inglete, con tope 1/0,85. Blandos contra lo opaco en 0,15 u.
- De noche: halo 0,16, resplandor 0,18, núcleo 1,7. [PULIDO 18] De día, un rayo de TINTA: el núcleo oscuro (0,95) con un halo tenue
  (0,08; resplandor 0,04). Con el núcleo blanco (invisible sobre el papel) quedaba una banda de humo gris. Los efectos: el piso se ilumina debajo de un arco, de noche (0,09); un destello chico donde un arco toca el logo.

## El dibujo (`dibujo/particulas.ts`)

Ninguna figura. BRILLA: titila con su ritmo (las positivas lento, las negativas rápido), destella (más seguido caliente) y RESPIRA con
su región (un ruido lento: zonas que se encienden). VIBRA: caliente, tiembla en la pantalla. Viene de la FUENTE (lejos del logo se
apaga) y deja libre la CARA DEL LOGO. Un tope de brillo por partícula.

[PULIDO 18] MÁS PARTÍCULA, MENOS NUBE: el NÚCLEO tiene un tope de radio (1,5 px: chico y nítido siempre; el tamaño de la chispa lo
lleva el HALO, corto: 2,5 núcleos, 0,2); los TAMAÑOS van por una LEY DE POTENCIA (una Pareto truncada entre 0,012 y 0,08 u, exponente
2,3: la mediana, 1,35 veces la más chica; más de 3 veces, el 7 %); las INTENSIDADES varían (de 0,5 a 1: muchas tenues, pocas
fuertes); la PRESENCIA: el núcleo brilla 2,8 y en reposo se ve 0,26 (con 1,3 y 0,18, de noche eran puntitos tenues y el plasma
perdía la presencia del A elegido); casi sin desenfoque (0,06 px por u, hasta 1,5: era el bokeh); y una CRUZ MUY CHICA (dos rayos de 7 px en la pantalla) sólo
en las más calientes y al destellar fuerte.

[PULIDO 18] BLANDAS: el halo se desvanece contra lo opaco (el piso, el logo, el pie, los títulos) en su propio ancho del mundo, con la
profundidad del pase compartido: ningún brillo corta una superficie.

[PULIDO 18] DE DÍA (las tres opciones juntas, en uniformes; cada una se apaga sola para comparar): un CUERPO oscuro nítido (el núcleo,
2,6, translúcido con tope 0,85), un VELO corto alrededor (0,45, con tope 0,25: una cercana y caliente no se vuelve una mancha), un ESPECULAR mínimo corrido hacia la luz principal (arriba a la izquierda, sólo en los cuerpos que
se ven grandes) y, en las calientes, el CALOR: refracta lo de atrás (la copia del cuadro: 2,2 px con un temblor, en un radio de 7 px) y
le sube el contraste oscureciendo los medios (el papel blanco queda blanco). Sin el punto blanco al centro de PULIDO 17: las calientes
se leían como ojos o burbujas. EL REPOSO DEL DÍA ES SUYO (0,5): un alfa chico sobre el papel no se ve (la noche suma luz sobre negro,
que sí) y colgado del reposo de la noche casi no se veía ninguna. Visto: gotas de tinta nítidas de tamaños variados, el negativo de
la noche.

| Uniforme | A · chispa | B · mota |
|---|---|---|
| `uTamano` (radio u mín. · máx., px mín. · máx.) | 0,012 · 0,08 · 0,7 · 3,2 | 0,012 · 0,04 · 0,6 · 4 |
| `uNucleo` (el tope del radio del núcleo, px) | 1,5 | sin tope |
| `uChispa` (la ley de potencia, el brillo propio más bajo, la cruz, su largo px) | 2,3 · 0,5 · 0,55 · 7 | 1,4 · 1 · 0 · 0 |
| `uLuz` (brillo, reposo, halo, ancho del halo) | 2,8 · 0,26 · 0,2 · 2,5 | 0,7 · 0,08 · 0,3 · 2,5 (B, en su dirección: 0,32 · 0,12 · 0,45 · 3) |
| `uDia` (el cuerpo, el especular, el reposo de día, desde) | 2,6 · 0,55 · 0,5 · 0,6 | 0,03 · 0 · 0,08 · 0,55 (B: 0 · 0,7 · 0,12 · 0,55; sus núcleos, 0 · 0,6 · 0,22 · 0,5, como en PULIDO 17) |
| `uDiaForma` (el velo: ancho en radios, mínimo px, alfa) | 1,6 · 1,2 · 0,45 | 2,2 · 3 · 0 (los núcleos de B, sin velo) |
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

PULIDO 18 (el banco del sitio, la NVIDIA, sin vsync; recibo `entregas/pulido-18/sitio-medido.json`): en caliente ningún cuadro de
más de 20 ms con el plasma A ni con cada efecto, a 1440 y 390 (el peor, 18,9 ms); el plasma A le suma al polvo +1,46 ms por cuadro al
máximo a 1440 (2,21 → 3,67) y +0,43 a 390 (2,05 → 2,48); cada efecto, ~+0,3 ms a 1440. Con vsync, 13,34 ms (máx. 14,2) salvo el
cuadro largo de la calma que también tiene el polvo solo. En el mini-banco (`mini-medido.json`): el plasma solo, ~0,8 ms por cuadro
a 1440, la GPU a lo sumo 1,44 ms, ~16 KB de basura por cuadro.

PULIDO 19 · Q1 (el mini-banco, la NVIDIA, sin vsync, sin el reloj de la GPU; recibos `entregas/pulido-19/`): con 800 brasas en el
dominio de la vista (600 en la cáscara antes), el plasma en calma de noche a 1440 cuesta 1,38 ms por cuadro (p95 1,6; antes del
dominio, 1,02 con 600) y 0,90 a 390 (400 brasas); 6,4 KB de basura por cuadro a 1440 y 5,2 a 390 (eran 16). Ningún cuadro de más
de 20 ms. La presencia de día y de noche en el encuadre del sitio, contra PULIDO 18: la luz del plasma sobre el fondo ×1,9 de noche
(centro y periferia) y +20 % de día. Q1.d · la red en reposo armada (618 enlaces a 1440) suma +0,48 ms por cuadro de noche a 1440
(1,36 → 1,84) y nada a 390 (181 enlaces); sin basura nueva. Lo de PULIDO 17 queda como historia (con C, que se borró en PULIDO 18). En la NVIDIA (RTX 5050; la pantalla del banco va a
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

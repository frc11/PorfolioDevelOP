# SPRINT CALIDAD 1 — el cierre de ESCENA 8 y el motor

Rama `rediseno/home`, un commit por punto: A1–A4 (el cierre de ESCENA 8), B0–B13 (el motor) y este informe. Las
entregas están en `~/.cache/b4-medicion/calidad1/`, una carpeta por punto con su `mirar.txt`; ninguna va al repo. El
estado de la escena y las **reglas de rendimiento para todo efecto nuevo** quedaron en `ESTADO-ESCENA.md` (§4).

**No digo que funciona: cada punto dice qué mirar.** Lo que se mueve se juzga en clip. Lo que toca la imagen tiene su
antes y después; donde se pudo, del MISMO cuadro dibujado dos veces en la página, porque el polvo y el piso vivo se
mueven solos entre dos capturas y esconden o inventan diferencias.

## Qué mirar primero (carpeta `final/`)

1. **`recorrido-1440-base-y-final.mp4`** (y `recorrido-1440@1.5x-…` y `recorrido-375-…`): el recorrido entero con el
   MISMO camino de cámara, la base a la izquierda y ahora a la derecha. Encima de cada uno, los cuadros por segundo de
   la página en cada medio segundo y cada tirón de más de 50 ms en rojo. A 1440, la base tiene dos tirones de
   174 ms en Por qué develOP (donde compilaba los rayos al aparecer) y la final ninguno: su peor cuadro es de 27 ms.
   A 375, la base uno de 147 ms y la final ninguno. Con la pantalla densa, las dos pierden un refresco en ~22 % de
   los cuadros (esta placa no sostiene esa densidad), pero la final sin tirones: la adaptativa baja las motas en el
   scroll y el dpr cuando el scroll para. Las cifras, en `final/mirar.txt`.
2. **`hoja-1440.png`** y **`hoja-375.png`**: los cinco momentos, la base arriba y ahora abajo. Tiene que ser la misma
   imagen, más limpia: si algo se ve DISTINTO (no más nítido: distinto), es para revertir.
3. **`recortes-x2-1440.png`** (y 375): al doble, el polvo, los cantos del logo, la trama y el piso vivo.
4. **`tabla-base-contra-final.md`**: el banco del motor entero, base contra final, a 1440 y a 375.

## La tabla: base contra final

Máquina de medición: AMD Radeon integrada (ANGLE sobre Direct3D 11), monitor de 75 Hz (un cuadro a tiempo dura
13,3 ms), servidor de desarrollo. La base es el commit de B0 (`c1c8b6cd`, con la parte A ya aplicada). El detalle está
en `final/tabla-base-contra-final.md`; los crudos, en `motor/base/` y `motor/final/`. La final se midió con B13 y antes
de los dos seguimientos del cierre, que no cambian lo que mide la tabla: la adaptativa (B11) está apagada en el banco, y
el segundo de B4 sólo actúa con 4 s de página quieta, que el recorrido no tiene.

| | base | final |
|---|---:|---:|
| **1440 con vsync (lo que se ve)** · cuadros perdidos en el recorrido | 93 | 79 |
| · de esos, en Por qué develOP | 14 | 0 |
| · de esos, en Servicios (con la escena suspendida: es la sección) | 79 | 79 |
| · el peor cuadro | 93,4 ms | 27,1 ms |
| **1440, GPU** · el peor cuadro del recorrido | 99,7 ms | 12,3 ms |
| · el cuadro en el pico del amanecer | 16,75 ms (57 por segundo) | 11,17 ms (87) |
| · la mediana del recorrido | 7,24 ms | 7,08 ms |
| **1440, hilo principal** · compilar shaders durante el recorrido | 1.504 ms | 0 |
| · cuadros largos (más de 50 ms) | 21 (el peor, 1.546 ms) | 11 (el peor, 863) |
| · el recolector con la escena quieta (hero, 6 s) | 11,8 ms | 2,7 ms |
| **375 con vsync** · cuadros perdidos · el peor cuadro | 1 · 80,1 ms | 0 · 14,0 ms |
| **375, GPU** · el peor cuadro del recorrido | 25,6 ms | 7,8 ms |
| · el cuadro en el pico del amanecer | 3,95 ms | 2,29 ms |
| · la mediana del recorrido | 1,37 ms | 1,12 ms |
| **Programas** compilados tarde, en el recorrido (1440) | 1 (los rayos, un cuadro de 1,4 s) | 0 |

Lo que la tabla también dice, y no es mejora:

- **El p95 y el p99 de GPU de Por qué develOP a 1440 subieron ~1,9 ms**: los rayos ahora se DIBUJAN durante toda su
  ventana. En la base casi no llegaban a dibujarse: la compilación de 1,4 s se comía su tramo.
- **El piso vivo y la formación cuestan ~0,1 ms más** en cada momento (0,3 en el amanecer): es el dithering de B8, una
  lectura de textura por píxel. La mancha de contacto de B10 suma 0,04–0,09 ms.
- **three gasta 0,01–0,02 ms más de CPU por cuadro** (de 0,104 a 0,113 ms a 1440, de 0,092 a 0,110 a 375, contando
  todos los cuadros del perfil). En el perfil aparecen `refreshMaterialUniforms` y `upload`: probablemente más uniforms y
  más programas (27 contra 21: el ruido azul en doce materiales, la trama filtrada, la composición de los rayos). Es el 0,1 % del cuadro;
  no se persiguió.
- **Los 79 cuadros perdidos de Servicios** siguen: ahí la escena está suspendida, es la sección (anotado en B0).
- **Los cuadros largos que quedan** (Servicios y Por qué develOP, hasta 863 ms) el perfil los ve como `scrollTo`: el
  layout del DOM de las secciones que fuerza el scroll del banco. No son de la escena.
- `campoDelLogo.ts` pasa de 92 a 159 ms en la ventana del perfil: es el horneado de los campos del logo, que desde B1
  va de a poco, en momentos libres de 6 ms (sin tareas largas).

### Lo que aportó cada punto (medido en su punto)

| punto | qué aportó | carpeta |
|---|---|---|
| B1 · precompilar | compilar en el recorrido: 1.504 → 0 ms. El peor cuadro con vsync: 93,4 → 27,3 ms. El pico de GPU de la noche (con la forma de la fugaz compilándose al cruzar): 99,7 → 18,6 ms | `b1-precompilar/` |
| B2 · cero reservas | lo propio de la escena en el recorrido: ~15 → 0 bytes por cuadro. El setState por cuadro a 375 (38 bytes por cuadro en reposo): → 0. El recolector en el hero: 11,8 → 1,1 ms en 6 s | `b2-sin-reservas/` |
| B3 · framerate | el gesto del aire contra el tiempo continuo: 1,04 → 0,49 % del pico a 60 Hz; entre 60 y 144 Hz: 0,61 → 0,29 % | `b3-framerate/` |
| B4 · bordes | saltos en pantalla, 1440 (375): al posarse 294 → 0 (96 → 0); al despertar 1.421 → 0 (447 → 0); en el recorrido a 1.500 px/s 1.048 → 5 (365 → 1) en su corrida, pero ese conteo varía mucho entre corridas (ver B4 abajo); motas lanzadas o en NaN → 0. Segundo seguimiento: la noche vuelve a posarse entera (13.974 motas en el piso a los 11 s; con B4 sin arreglar, 8.457 y 5.449 trabadas en el aire) | `b4-bordes/` |
| B5 · rayos | GPU de los rayos: 7,95 → 2,32 ms a 1440; 17,84 → 5,13 con dpr 1,5; 1,88 → 0,56 a 375. La luz igual: en bloques de 4×4 píxeles, menos de un nivel en el 99 % | `b5-rayos/` |
| B6 · polvo | la imagen igual (272 de 1,3 M píxeles cambian un nivel); lo de menos de un píxel se apaga por área, para cuando la adaptativa baje la resolución | `b6-nitidez/` |
| B7 · antialiasing | el logo sin facetas; su titileo baja 4 a 22 % (375, Por qué develOP: 0,847 → 0,661). La sombra de la trama: los píxeles del piso que titilan fuerte, 54 → 21 | `b7-antialias/` |
| B8 · dithering | el largo medio de los escalones en la noche: 4,61 → 1,17 px (375: 6,81 → 1,13). La media del color, igual | `b8-dithering/` |
| B9 · tono | se queda Neutral: ACES y AgX corren el piso de día más de ΔE 2, aun con la exposición compensada | `b9-tono/` |
| B10 · apoyo | una mancha de contacto en la base de cada copia de la formación, por 0,05–0,1 ms | `b10-apoyo/` |
| B11 · adaptativa | el amanecer a 1440 con dpr 1,5: 39,6 → 70,8 cuadros por segundo; el hero con dpr 1,5: 53,8 → 74,1. Seguimiento: cada cambio de dpr congelaba el hilo 28–62 ms en medio del scroll; ahora espera el scroll quieto | `b11-adaptativa/` |
| B12 · teléfono | las estrellas que no pueden verse no se dibujan: −0,34 ms por cuadro (375: hero 1,53 → 1,18; amanecer 2,67 → 2,28) | `b12-telefono/` |

## Parte A — el cierre de ESCENA 8

- **A1 · el menú no dispara el amanecer** (`a1-menu/`). En un viaje del menú de día a día, al cruzar Tu panel se
  prendía el amanecer entero en ~170 ms, y de vuelta corría al revés. Ahora, en un viaje de día a día, el destino y el
  amanecer entero (el día) van desde el primer cuadro. La sonda: 9 viajes con evento de paso a 1440 y 11 a 375 → 0 y 0.
  Decisión anotada: a 375, llegar por el menú a Por qué develOP muestra el día entero y no el 0,851 que pide el scroll
  (mostrar eso dejaba el vuelo entero de noche). Mirar `hero-a-por-que-develop-1440-antes-y-despues.mp4` primero.
- **A2 · el cielo de día: el pintado celeste, encendido** (`a2-cielo/`). Se borraron el código y las banderas de las
  otras cinco variantes. Rompe la regla monocroma: quedó registrado como excepción aprobada en `ESTADO-ESCENA.md` y en
  `DIRECCION-ESCENA.md`, y s34 falla si alguien borra ese registro. Mirar `hoja-1440.png`.
- **A3 · el obstáculo sin pegado** (`a3-obstaculo/`). Se borró el modo 6. Queda el flujo, que ahora rodea la malla real
  (un segundo campo de distancia horneado) y pasa por la boca de la «c» y el ojo de la «p». Mirar
  `scroll-fuerte-logo-x2-antes-y-despues.mp4`.
- **A4 · la compuerta del amanecer**: anotada como pendiente en `ESTADO-ESCENA.md` §7. Es un cambio de layout, no de la
  escena.

## Parte B — el motor, punto por punto

Cada `mirar.txt` tiene el detalle, las tablas y lo que hay que juzgar a ojo. Acá va lo que se hizo y lo que se decidió.

- **B0 · medir antes de tocar.** Un banco nuevo (`scripts-calidad/motor.ts` y `motor/`): Chrome sin vsync, un grabador
  que maneja el scroll a velocidad constante desde el primer `requestAnimationFrame` de cada cuadro, el tiempo de GPU
  por cuadro y por objeto con nombre (`gpu/PerfilDeLaGpu.tsx`, sólo con banco), el ritmo con vsync, el perfil de CPU, la
  memoria y los programas. Decisión de método: sin vsync, los intervalos entre cuadros salen en ráfagas y sus
  percentiles no dicen nada; el costo sale de la GPU cuadro a cuadro, y los tirones, del ritmo con vsync.
- **B1 · precompilar.** `gpu/Precompilar.tsx`: `compileAsync` de la escena entera (lo invisible también) y un dibujo de
  calentamiento de un píxel, porque ANGLE arma el ejecutable en el primer dibujo. Los campos del logo se hornean de a
  poco. En la primera carga después de un cambio de shaders el costo de Direct3D no desaparece: se muda del medio del
  scroll a la carga (~1,25 s).
- **B2 · cero reservas por cuadro.** Estados escritos en objetos armados una vez, máquinas que devuelven el mismo estado
  si nada cambia, React sólo cuando hay un cambio. Lo que reserva una sola vez lleva `// una vez`, y lo de banco,
  `// banco`: s34 revisa todos los `useFrame` de la escena y falla con una reserva sin marca.
- **B3 · independiente del framerate.** La física de las motas integraba con Euler explícito en los cuatro modos que las
  mueven; ahora la velocidad relaja exacta hacia su objetivo (Euler exponencial, `relajar`). Lo demás ya era exacto en
  el tiempo y s34 lo afirma. Sin clip: este monitor es de 75 Hz y la diferencia es de 0,3 % del recorrido de una mota.
  La prueba es la cuenta, a 60, 75, 120 y 144 Hz, con el Euler de antes como control positivo.
- **B4 · sin saltos en los bordes del volumen.** Un instrumento nuevo (`saltos.ts`) que replica la cuenta del shader con
  el estado real de la física. El peso de la mota suelta viaja en el modo y mezcla el corte del volumen; el remolino ya
  no lanza las motas de abajo del piso; ninguna mota se pierde en NaN contra el logo (seguimiento, commit aparte).
  **Segundo seguimiento (commit aparte), un defecto de B4 que encontré al comparar la hoja final con la base:** la
  compuerta («la levantada vuelve al aire sólo con su lugar lejos de las caras») dejaba a la levantada cerca de una
  cara (~40 % del volumen) levantada PARA SIEMPRE con la página quieta, porque el posarse sólo sale del aire. En la
  noche, a los 11 s de quietud: base, 13.695 motas en el piso y 0 levantadas; con B4, 8.457 y 5.449; con el arreglo,
  13.974 y 0 (`final/polvo-noche-1440-*.json`). Ahora, pasado el soplo, la que no puede volver al aire y tiene la página
  quieta pasa a «cayendo» sin pasar por el aire, y su visibilidad no cambia. Los saltos en reposo y al despertar siguen
  en 0. En el recorrido a 1.500 px/s el conteo varía mucho de corrida a corrida: sin el arreglo 2.193 y 77, con él 17
  y 36 (B4 había medido 5). No alcanza para decir que el arreglo lo cambie en ninguna dirección.
- **B5 · los rayos a media resolución.** `amanecer/haces.ts`: su propio búfer de medio punto flotante, la mitad del lienzo
  por lado, y un cuadrado que los suma con el mismo aditivo. La cuenta por píxel no cambió.
- **B6 · el polvo nítido.** Ya estaban los discos analíticos, el bokeh sólo en las muy cercanas y la resolución de
  dispositivo. Se agregó el mínimo de un píxel con la luz de su área y el alfa premultiplicado.
- **B7 · antialiasing.** El MSAA ya estaba; SMAA no aplica (no hay pasada de post: el contrato de /v3 no deja importar
  postprocessing). Los brillos «escalonados» del logo eran facetas: los costados llevan normales suaves hasta un pliegue
  de 40° (`cantosDelLogo.ts`). La sombra de la trama en el piso se busca con gradientes. El prefiltro de los filos del
  piso vivo se probó, no mejoró y se revirtió. Con los costados suaves, las paredes del logo vistas de canto (el palo de
  la «p» a 375) titilan algo más: la franja de abajo de Quiénes somos y Por qué develOP a 375 sube 7 %.
- **B8 · dithering con ruido azul.** Un mosaico de 16×16 (vacío y cúmulo) en una textura, en todo lo que pinta
  degradados. Reemplaza al de three (ruido blanco, con el rojo y el azul corridos al revés del verde). Como arreglo
  constante del shader, Direct3D tardaba más de un segundo por programa: por eso va en una textura.
- **B9 · el tone mapping.** Se midieron ACES y AgX contra Neutral, crudos y con la exposición compensada. Ninguno cumple
  ΔE < 2 en el piso, el papel y el cielo: se queda Neutral, escrito en `configuracionDelCanvas.ts` y afirmado en s34.
  La salida sRGB es correcta.
- **B10 · el apoyo.** La oclusión de contacto del logo ya existía y no se tocó. Las copias de la formación no tenían
  nada que las apoye: ahora llevan una mancha de contacto instanciada, una llamada de dibujo para todas.
- **B11 · la calidad adaptativa.** `gpu/adaptativa.ts` hace la cuenta y `gpu/CalidadAdaptativa.tsx` la aplica: si la
  media de los cuadros pasa 1,25 veces el refresco durante 1,5 s, baja un escalón. Primero bajan las motas (80 %, 65 %,
  con fundido) y después el dpr, de a 10 % del tope. Sube después de 6 s holgados, con una espera que se duplica: no
  oscila. El tope queda en 1,5 (ver decisiones). **Seguimiento (commit aparte):** grabando el recorrido final con la
  pantalla densa aparecieron tirones de 53–67 ms que la base no tenía. Cada cambio de dpr traía un cuadro largo de 40–67
  ms, y no había ninguno lejos de un cambio (`tirones-*.json`). La causa es `gl.setPixelRatio` solo, sin React ni r3f:
  congela el hilo 28–62 ms, porque redimensiona el lienzo y sus búferes (`redimensionar-*.json`), y desde la escena no
  se puede abaratar. Ahora el escalón de las motas se aplica enseguida y el de dpr espera a que el scroll lleve 400 ms
  quieto; mientras espera, el controlador no decide. El tirón no desaparece: se muda a un momento sin scroll.
  Medido después, en el recorrido entero con la adaptativa y sin grabar: el dpr cambió una sola vez, en el pie, con
  445 ms de scroll quieto, y ningún cuadro pasó de 40 ms. En una grabación intermedia con el arreglo hubo un tirón
  de 53 ms en Servicios, justo cuando la adaptativa PEDÍA su primer escalón de dpr (sin aplicarlo). Con el registro
  por cuadro puesto no se repitió, y queda anotado sin causa atribuida.
- **B12 · el teléfono.** Qué va a 375 y cuánto cuesta cada cosa (`b12-telefono/tabla-375.txt`): el cuadro va de 0,98 a
  2,28 ms. Se recortó lo único que no cambia la imagen (las estrellas invisibles). El presupuesto que se propone es que
  el cuadro de 375 no pase de 3 ms en esta placa. El menú de recortes está en su `mirar.txt`, en orden.
- **B13 · las reglas.** `ESTADO-ESCENA.md` §4: las diez reglas que todo efecto nuevo tiene que cumplir (dt,
  precompilado, cero reservas, presupuesto, lo que no se ve no se dibuja, nombre, sin saltos, dithering, la adaptativa,
  los colores canónicos).

## Lo que no se hizo, y por qué

- **El tamaño de las motas por perspectiva real** (B6). El real supera el tope en foco a toda distancia que se ve
  entera: las agrandaría de una a doce veces. Ya no sería «la mayoría nítido, motas chicas y parejas».
- **AgX o ACES** (B9). Corren los colores canónicos más de ΔE 2. Compensar con una curva por canal sería rearmar
  Neutral.
- **Mapas de sombra en tiempo real** (B10). Pondrían sombras proyectadas nuevas: otra imagen.
- **El titileo de las aristas de geometría** (B7): el contorno del logo y las aristas de los bloques del piso vivo. Es
  el límite del MSAA de 4 muestras; pide más muestras o una pasada temporal (TAA), fuera de este sprint.
- **Los recortes del teléfono** (B12). Sin un teléfono real para medirlos, recortar sería elegir a ciegas. El menú queda
  para el sprint que tenga uno.
- **Ensanchar los fundidos con la cámara rápida** (B4). Con la cámara a 0,5 u o más por cuadro, los fundidos del
  espacio duran dos o tres cuadros (553 casos a 1440 en el recorrido de 1.500 px/s, casi todos en el final de Por qué
  develOP). Ensancharlos con la velocidad cambia cuánto polvo se ve en movimiento: es dirección de arte.

## Decisiones tomadas sin preguntar

1. **El tope de dpr queda en 1,5** (1 en `compacta`). El sprint pedía «DPR ≤ 2» y `CLAUDE.md` dice que 1,5 es el
   máximo, nunca 2 en producción. Se respetó la regla más estricta de las dos.
2. **La adaptativa arranca apagada con banco**, para que los bancos sigan midiendo configuraciones fijas. Se prende a
   pedido (`__calidadDelBanco.activa(true)`). En el producto está prendida.
3. **Se queda Neutral** (B9), por la condición dura de ΔE.
4. **El prefiltro de los filos del piso vivo se revirtió** (B7): no mejoraba lo que titila, que son las aristas.
5. **A1, a 375:** la llegada por el menú a Por qué develOP es el día entero.
6. **Las comparaciones de imagen de B5 a B10 son del MISMO cuadro** dibujado dos veces en una sola tarea de la página:
   dos capturas separadas no sirven para juzgar el polvo ni el piso vivo, que se mueven solos.
7. **Los dos seguimientos del cierre** (B11: el dpr con el scroll quieto; B4: la levantada que no se posaba) se hicieron
   como seguimientos de su punto, un commit cada uno: corrigen lo que el propio punto prometía (sin saltos visibles; el
   mismo comportamiento del polvo). Los encontró la comparación final contra la base.

## Hallazgos (anotados, no tocados)

- **Fuera de la escena** (son secciones): Servicios pierde 79 cuadros con vsync con la escena suspendida; Galeria.tsx
  (Tu panel) se lleva ~1 s de hilo principal en el recorrido; Motion (`useScroll`) 2,8 s; los commits de React son
  pocos pero enormes (~23.000 componentes en el recorrido); los cuadros largos de `scrollTo`.
- **r3f al suspender la escena:** corre un último cuadro con el timestamp del navegador (ms) como reloj en segundos, y al
  reanudar el reloj vuelve a 0 (las conchas del polvo saltan 226 rad). Pasa con la escena tapada: no se ve. Queda
  anotado para cuando algo dependa del reloj al reanudar.
- **La escena sigue dibujando** unos cientos de píxeles de scroll adentro de Servicios, ya tapada, antes de suspenderse.
- **Redimensionar el lienzo cuesta 28–62 ms de hilo** en esta placa (`gl.setPixelRatio` solo, sin React). Por eso la
  adaptativa cambia el dpr con el scroll quieto, y por eso la regla 9 de `ESTADO-ESCENA.md` §4.
- **Mientras se graba no se toca ningún archivo del repo.** Una grabación de la final hecha mientras editaba este
  informe tuvo dos tirones de 53 ms en el túnel; regrabada sin tocar nada, ninguno. Lo probable es el servidor de
  desarrollo reaccionando al cambio (Tailwind 4 escanea también los `.md`). El efecto está medido; el mecanismo, no.
- **La caché de shaders.** La primera carga después de cualquier cambio de shaders los compila en frío (~1,25 s al
  cargar, en esta placa); desde la segunda, en cualquier sesión, 16–19 ms de compilar y 79–125 de calentar.
  **Corrección:** en B8 anoté que el Chrome del banco no conservaba esa caché entre sesiones, y es falso. Lo que medí en
  frío fueron primeras cargas después de un cambio. Está corregido en `b8-dithering/mirar.txt`,
  `b1-precompilar/mirar.txt` (que además citaba un calentamiento de 15 ms que su propio archivo no respalda) y
  `ESTADO-ESCENA.md`.

## Correcciones: lo que dije mal durante el sprint

- **B4 · «la hoja tiene que ser la misma imagen».** No lo era en la noche: el polvo levantado cerca de las caras no se
  posaba nunca. Lo tapaba el instante de la captura, porque la espera de las hojas termina cuando la imagen deja de
  cambiar, y eso varía entre corridas. Arreglado en el segundo seguimiento, medido con los modos de la física en el
  tiempo y no con la hoja.
- **B11 · «sin saltos visibles».** Cada cambio de dpr congelaba el hilo 28–62 ms en medio del scroll. Arreglado en su
  seguimiento: el tirón se muda a cuando el scroll para.
- **B8 · la caché de shaders «no se conserva entre sesiones».** Falso (ver Hallazgos). Corregido en `b8-dithering/`,
  `b1-precompilar/` y `ESTADO-ESCENA.md`.
- **B1 · «calentar, con la caché de Chrome, 15 ms».** Su archivo dice 1.266 ms: fue la primera carga después del
  cambio. Con la caché son 79–125 ms.

## Un accidente del banco

El script de las hojas de B5 se llamó primero `b5-comparar.ts`. Como importa un módulo cuya línea de comandos mira si el
nombre termina en `comparar.ts`, corrió una sesión de capturas de ESCENA 3 y sobrescribió 10 archivos de caché de aquel
sprint: `~/.cache/b4-medicion/escena3/hojas/*-1440-base.png` y `*-1440-producto.png`. El repo no se tocó. Se renombró a
`b5-rayos-hoja.ts`. Si hacen falta esas hojas de ESCENA 3, hay que regenerarlas.

## Validación

- `npx tsc --noEmit`: 0 errores.
- eslint sobre los 90 archivos `.ts`/`.tsx` que tocó el sprint (commiteados y sin commitear): limpio.
- Las suites de la escena: `s34-calidad1` (100 afirmaciones, con un control positivo por arreglo), `s33-escena8` (48),
  `s32-escena7` (148), `s31-escena6` (28), `s30-escena4` (29), `s29-pulso` (44), `s28-base` (19), `s27-viajes` (51),
  `s26-menu` (28), `s24-dia` (26), `s23-final` (13), `s22` (29), `s20` (19), `s18` (173), `s16-arnes` (19), `s8-escena`
  (33), `s8-intro` (55), `s7-mezcla` (116), `s6-por-que-develop` (36): 0 fallas. Las conocidas, aparte y sin cambios:
  `s17-revelado` con su falla de antes de ESCENA 5, y `s10-raf` y `s11-frontera` con 2 afirmaciones «fuera de
  ventana» cada uno (dependen del entorno de medición).
- `npm run build` no se corrió: falla a propósito por la llave `CONTENIDO_INVENTADO` y su guardián en `prebuild` (de
  una etapa anterior, no de este sprint), y el sprint no la toca. `s8-tres` pide ese build.
- No declaro que funciona: lo que se ve está en las carpetas de cada punto y en `final/`.

## Commits

| commit | punto |
|---|---|
| `5493b714` | A1 · el menú no dispara el amanecer |
| `312cee5d` | A2 · el cielo de día pintado celeste, encendido |
| `8c31b870` | A3 · el obstáculo sin pegado, el flujo por los huecos |
| `08137494` | A4 · la compuerta del amanecer, anotada como pendiente |
| `c1c8b6cd` | B0 · medir antes de tocar: el banco del motor y la base |
| `c5d36dae` | B1 · los shaders precompilados al arrancar |
| `4924d1aa` | B2 · cero reservas por cuadro y nada de setState por cuadro |
| `ef9ce756` | B3 · la física del polvo independiente del framerate |
| `3b672934` | B4 · el polvo entra y sale del volumen con fundido |
| `7e59c5e7` | B5 · los rayos del amanecer a media resolución |
| `1e81061f` | B4 (seguimiento) · ninguna mota se pierde en NaN contra el logo |
| `a7991f79` | B6 · el polvo sin motas de menos de un píxel y con alfa premultiplicado |
| `0c273828` | B7 · los cantos del logo sin facetas y la sombra de la trama prefiltrada |
| `70239058` | B8 · dithering con ruido azul en los degradados |
| `56233583` | B9 · se queda el tone mapping Neutral, medido contra ACES y AgX |
| `6811289d` | B10 · las copias de la formación apoyadas en su piso |
| `79d206e0` | B11 · la calidad adaptativa, de a un escalón y con histéresis |
| `9ad01d3e` | B12 · el presupuesto del teléfono y las estrellas que no se ven |
| `00b9125e` | B13 · las reglas de rendimiento para todo efecto nuevo |
| `2695d50e` | B11 (seguimiento) · el dpr cambia sólo con el scroll quieto |
| `29066b33` | B4 (seguimiento 2) · la levantada que no vuelve al aire se posa con la quietud |
| (este) | el informe, la tabla final, los clips y las correcciones |

# SPRINT PULIDO 20 — El pie que se traba, el cristal en el borde, la red de rayos

Rama `rediseno/home`. Invariante nuevo: `npm run test:s71-pulido-20` (`src/app/v3/_lib/__tests__/s71-pulido-20.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base: `banco11.ts`), `~/.cache/b4-medicion/pulido-18/_scripts/` (el sitio:
`p20-*.ts`), `~/.cache/b4-medicion/pulido-20/` (capturas e informes). Recibos: `docs/rediseno/entregas/pulido-20/`.

El humano: sprint CORTO. OBLIGATORIO: R1 y R2 se VERIFICAN EN EL SITIO REAL (no sólo en el mini-banco); el humano cierra su Chrome
para dejar memoria; si no alcanza, se frena el sprint y se avisa.

Aprobados (no se tocan salvo una mejora chica y clara): el plasma en general; la red en reposo como idea.

Lo pedido:
- R1 · URGENTE: la animación del pie se traba y no avanza. Reproducir en el sitio, encontrar la causa y escribirla acá. Después:
  cada objeto 3D del pie es un SÓLIDO ENTERO (no se estira ni se deforma); tiene su BASE en el piso (parado, no flotando en una
  pared) y cae como el logo (cuerpo rígido que vuelca hacia atrás sobre el canto de su base); AL MISMO TIEMPO que el logo: todos
  tocan el piso en el instante del golpe (cada uno con la duración de caída de su altura); al terminar, todo acostado e incrustado,
  la cámara cerca desde arriba (sin espiral) y todo usable (links, form, foco, autocompletado); un poco de scroll hacia arriba: todo
  se levanta (el rebobinado) y se reinicia como siempre. Invariantes: llega al estado final en un tiempo acotado; ninguna pieza se
  deforma (su escala se conserva); ninguna se interpenetra con otra ni con el logo. Con controles positivos.
- R2 · EL CRISTAL REHECHO: esquirlas en el BORDE de la escena (la foto de Dr. Strange: esquirlas grandes de cristal facetado a
  distintas profundidades, cantos filosos que atrapan la luz, que refractan lo de atrás, con un filo de dispersión). Primero las
  CAUSAS de los bugs (vibra; en ciertos ángulos las partículas desaparecen; dobla el título del hero y raya la silueta del logo;
  estira la imagen en los bordes). Después: esquirlas 3D reales en la periferia (contra el domo), que refractan SÓLO un render
  target del fondo a media resolución (cielo, domo, moiré, fábrica de logos; sin logo, títulos, partículas ni pie); Fresnel, brillo
  en los cantos con la cámara, reflejo tenue; nunca detrás de un texto ni del logo; en el borde de la pantalla se desvanece, nunca
  estira; no escribe profundidad y las partículas nunca desaparecen; cristalizan (crecen y giran muy lento, sin temblor);
  `?espejo-prisma=si` el filo de arcoíris. Variantes `?fondo=moire|espejo|ambos` (default ambos). Se borra la malla de celdas.
  Invariantes: nunca sobre la caja de un texto ni la silueta del logo; cero cambios en las partículas por el cristal.
- R3 · LA RED: cada enlace es un ARCO congelado de los del plasma (quebrado, con ramas), generado al formarse y congelado, con un
  titileo leve; geometría en caché en un solo búfer; con un gesto, el corte en cascada (~0,3 s) con su chasquido.
- BANCO: mini-banco para iterar, sitio real para confirmar R1 y R2. Un solo Chrome y una página por tanda; memoria y no paginado
  anotados; cuadros crudos borrados; nada de builds de medición al terminar. Con el cristal nuevo, ningún cuadro > 20 ms a 1440 y
  390, y sin vibración (la cámara y el cristal estables cuadro a cuadro).
- VERIFICACIÓN: lint de lo tocado + tsc + todas las suites que lean lo tocado + banco del sitio; al final `verificar` completo: los 8
  rojos de la base y ni uno más. REGLAS: las de siempre; invariantes nuevos en `s71-pulido-20`; commit y push por punto.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO EN EL SITIO sí/no.

### Arranque
- Árbol limpio sobre `e766cfaa` (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 74,4 GB libres.
- Memoria: con el Chrome del humano y su `npm run dev`, 2,4 GB disponibles. El humano cerró las dos cosas: 6,2 GB. El sitio se ve
  contra un `npm run dev` propio (`next dev --webpack`, ~2,6 GB; su log en el scratchpad, nunca en el repo) en vez del build de
  medición (2,5 GB más al compilar): `banco11.ts` toma el umbral del portero de `PORTERO_MB` (con el dev server, 2400 MB al lanzar).
  El Chrome del humano sigue vivo en segundo plano (12 procesos, ~0,9 GB: la ventana se cerró, el proceso no); no se toca.

### R1 · El pie que se traba
- HECHO (`e81e3dd9`). VISTO EN EL SITIO: sí (1440, 1920 y 390; el build de medición).
- **La causa (reproducida en el sitio, 1440 × 900, `p20-r1.ts` y `p20-sonda2.ts`):** el final se queda clavado en `fin ≈ 0,347`
  (2,8 s del reloj: la cámara subió un 13 %, el logo todavía no tocó), alternando cuadro a cuadro entre `corre` y `espera`, para
  siempre. El reloj sólo corre «al fondo» (`cuadroDelFinal.ts`: `scrollY >= fondo − AL_FONDO_PX`, con `AL_FONDO_PX = 2` y `fondo =
  scrollHeight − innerHeight` medido en cada cuadro). Desde PULIDO 19 (Q2) la pared del pie queda QUIETA en el mundo (armada con la
  cámara de antes del final) y el DOM de cada pieza la sigue con su homografía vista por la cámara VIVA: al subir la cámara, la pared
  baja en la pantalla y el DOM de la fila de abajo (las cuatro redes, `[data-pieza="bloque-solido"]`, con su `matrix3d`) termina en
  33772,7 px, cuando el documento termina en 33770. Un elemento transformado también agranda el desborde del documento: el
  `scrollHeight` pasa de 33770 a 33773, el `fondo` de 32870 a 32873, y con el scroll en 32870 la página deja de estar «al fondo»
  (32870 < 32873 − 2). El reloj sale de `corre` (vuelve hacia atrás: la cámara baja, el DOM sube, el documento vuelve a 33770), al
  cuadro siguiente está otra vez al fondo y arranca: un equilibrio en el que el final nunca llega al golpe. En el mini-banco no
  se podía ver (no tiene DOM): por eso PULIDO 19 lo dio por bueno. Medido: `fin` 0,345–0,348, `fase` corre/espera alternadas,
  `scrollHeight` 33770–33773, el scroll quieto en 32870, ningún error en la consola, los cuadros en 13,3 ms (no es costo: es el reloj).
- La salida: el fondo que vale para el final no puede depender de lo que el final mueve; y el DOM de una pieza que se mueve no tiene que
  poder agrandar el documento.
  - `cuadroDelFinal.ts`: `fondo = offsetHeight − innerHeight` (el alto del LAYOUT, que un transformado no cambia: medido en el sitio, en
    `fin` 0,347 `scrollHeight` 33771 y `offsetHeight` 33770).
  - `armadas.ts` + `pie3d/caida.ts` (`domDeLaCaida`, `domSigueEnLaCaida`): en el final, el DOM de cada pieza se apaga al arrancar (0,15 s)
    y deja de seguirla (queda donde estaba: no la lleva por homografías de canto, que además lo estiraban), y vuelve con la pieza quieta
    e incrustada (0,2 s); mientras, sin clics.
- **Lo pedido, como quedó (el humano lo ajustó dos veces a mitad del sprint):**
  1. Primera versión: cada pieza un sólido que baja parado y vuelca sobre su base, todas tocando en el golpe. El humano: «lo que yo quiero
     es que cada columna toque el piso al mismo tiempo que el logo, y ahí haga la animación de caerse todo junto como si estuviesen en una
     columna invisible, todo pegado, cuando en realidad son objetos separados pero respetando una física de un objeto invisible que los
     contiene».
  2. LAS COLUMNAS (`pie3d/caida.ts`): lo de cada lado del logo es UNA columna invisible (la caja de sus piezas en la pared: la izquierda,
     el logotipo, el titular, el contacto, el recorrido, las redes y la legal, 11,4 × 5,9 u a 1440; la derecha, el rótulo y el formulario,
     7,3 × 5,9 u; el logo, 4,8 de alto). La columna es el cuerpo rígido: BAJA PARADA con el logo (en su misma bajada, 1,2 s: llega al piso
     cuando él llega; primero hacia su lugar a la altura que tenía, después abajo enderezándose: `tramos`), con la BASE en el piso, y
     VUELCA hacia atrás sobre el canto de su base con la física del logo (`caidaAlHueco.ts`) y el κ de su alto, apurada lo justo para
     TOCAR EN EL GOLPE (la izquierda es más alta que el logo: cae junto con él); asentada, se INCRUSTA (baja su espesor, la cara al ras con
     0,012 u de sobra; lo hondo de los pozos del formulario queda arriba). Las piezas van PEGADAS a su columna (el mismo giro y su lugar
     relativo de la pared): acostadas, desde arriba, el pie como era. El rebobinado las levanta por el mismo camino y el reinicio las tira.
  3. El humano, al ver las columnas: «me gustaría que se viera gran parte de la escena igual»; preguntado, eligió «junto al logo, cámara
     lejos»: LA CÁMARA DEL FINAL en escritorio sube de costado hasta 28° (`camara.escritorio`, la escribe `ELEVACION_DEL_FINAL`; abajo de
     1024 sigue desde arriba) y se queda a la distancia en que el pie acostado y el logo ocupan el 62 % del cuadro (`pie3d/encuadre.ts`,
     una búsqueda por mitades): lo demás es piso y domo.
- **Dos defectos de PULIDO 19 que aparecieron al verlo en el sitio:**
  - La calma del piso bajo el pie (Q2) nunca llegó a la simulación: `PisoVivo.tsx` no le pasaba `uCalmaDelPie`, `uBaseDelPie` ni
    `uCalmaDelPieFuerza` y WebGL las dejaba en cero: los bloques del mar subían encima del pie acostado (en `fin` 1, el titular y el
    recorrido tapados por bloques). Ahora las recibe.
  - Con un solo tramo de bajada, el rótulo «CONTACTO» (arriba del formulario en la pared) atravesaba el formulario a los 0,17 s: bajaba
    7,8 u mientras el borde del formulario bajaba 0,6. Lo encontró el invariante nuevo (las cajas orientadas de cada pieza en cada cuadro);
    se fue con los dos tramos y, después, con las columnas (rígidas: nada se cruza adentro).
  - Y uno propio de esta tanda: con los dos tramos, `aplicarLaCaida` no movía la pieza mientras la bajada vertical valía cero (saltaba al
    empezar a bajar); el invariante de saltos lo marca (a lo sumo 0,36 u por cuadro a 120 cps; el salto era de ~14 u).
- `RELOJ_DEL_FINAL.duracionS` = golpe + 2,5 = 6 s (era 8 con las piezas en onda; 5,7 daba igualdades de punto flotante inexactas en s54:
  6 las deja exactas): el DOM de la última columna aparece a los 4,3 s.
- **Visto en el sitio** (el build de medición, el reloj de verdad, `p20-r1v.ts`, con vsync): a 1440, 1920 y 390 el final llega a `fin`
  = 1 (a los 7,7 / 7,7 / 7,1 s de llegar al fondo: la espera del pie entero más los 6 s), el documento no crece nunca (`scrollHeight` =
  `offsetHeight` en cada muestra), escribir «Valentina» en el campo del formulario acostado queda en el campo (foco y valor), un gesto
  hacia arriba con la rueda rebobina hasta 0 en ~1,1 s y el final se reinicia solo (un golpe más). Cuadros: en caliente ninguno de más de
  20 ms en las tres; en FRÍO (la primera corrida sobre el build recién servido) un cuadro de 1000 ms a 1440 (a mirar: «Lo que no quedó
  bien»). Las capturas: `pulido-20/r1col-1440` (la caída por columnas a `fin` fijos), `r1lejos2-1440` (la cámara lejos), `p20-r1prod-*`.
- s71 (R1): el final llega a su fin con el fondo del layout (control: el equilibrio del sitio, al fondo sólo hasta 0,347); con el pie de
  1440 y de 1920 del sitio (`entregas/pulido-20/pie-*.json`) y la caída de verdad, 685 cuadros: piezas sólidas (2e−16), pegadas a su
  columna (1e−13 u), sin saltos, ninguna se cruza con otra ni con el logo, cada columna parada con la base en el piso antes de inclinarse,
  toca en el golpe y queda incrustada y quieta con su DOM (controles: una pieza que se estira, otra que se despega, un salto, dos piezas en
  el mismo lugar, una columna sobre el logo, un toque fuera del golpe); una placa 1,6 veces más alta que el logo también entra; el DOM
  sólo con la columna quieta; la cámara lejos (todo adentro, al 62 %; control: la de PULIDO 19); el cableado y las sombras (sólo placas, se
  van al incrustarse).

### R2 · El cristal: esquirlas en el borde
- HECHO (`09927500`). VISTO EN EL SITIO: sí (1440 y 390; el build de medición; las variantes a 1440).
- **Las causas de los bugs del cristal de PULIDO 19** (en el sitio, con el cristal viejo todavía en el build: `p20-r2diag.ts`, el mismo
  instante con el cristal y sin él, `__cristalDelBanco.apagar`, sin desmontar; y el código):
  - **Vibraba:** el cristal armaba su rayo de cada píxel (`uInversa`, `uProyeccion`, `uAdelante`) en su `useFrame` con la `matrixWorld` de la
    cámara, que el rig NO actualiza al moverla (`OrbitRig`: `position.set` + `lookAt`; three la pone al día recién adentro de `render()`):
    usaba la del cuadro ANTERIOR con la posición de éste. Con la cámara en movimiento (el scroll, el paralaje del mouse: casi siempre) cada
    rayo salía corrido y la refracción temblaba; y no coincidía con la pasada de profundidad (dibujada con la cámara de este cuadro): el
    borde entre «fondo» y lo opaco titilaba. El pase de color NO se realimentaba: la copia es del mismo cuadro, hasta la trama (orden −18),
    y el cristal va después (−16).
  - **Las partículas que desaparecen:** no se reprodujo. En siete paradas (el hero, Quiénes somos, Números, Servicios ×2, Por qué develOP
    ×2), en el mismo instante con el cristal y sin él, las partículas son las mismas (380/381, 831/835, 274/280, 126/125, 200/199): el
    cristal viejo iba antes que ellas (−16 contra 0) y no escribía profundidad, así que no las tapaba; la pasada de profundidad (las
    partículas blandas se apagan contra lo opaco) ya la pedía el plasma, con o sin cristal. El nuevo, igual que el viejo en esto, nunca
    puede taparlas (s71).
  - **Doblaba los textos:** era una pasada de PANTALLA ENTERA que refractaba todo lo que la profundidad a media resolución daba por
    «fondo»: lo transparente que no escribe profundidad (el plasma, los títulos mientras se funden) también; y detrás de un texto la máscara
    sólo bajaba el corrimiento al 25 %: el fondo detrás del título del hero (la trama, las celdas) quedaba deformado. En la comparación del
    hero, el título en sí es igual con y sin cristal (lo «doble» es el volumen del título 3D): lo roto era lo de atrás.
  - **Las líneas en la silueta del logo:** la profundidad a media resolución: en el borde del logo, píxeles del logo daban «fondo» y leían
    la copia refractada (que tiene al logo): un ribete claro alrededor de la silueta (Por qué develOP, con y sin).
  - **Estiraba los bordes:** `colorDeAtras` acotaba la lectura a [0,001; 0,999]: una refracción que miraba fuera de la pantalla repetía la
    última fila de píxeles (rayas).
- **Lo nuevo (se borró la malla de celdas; `escena/cristal/`):** `cristal.ts` (lo puro: las constantes, las 22 esquirlas con su semilla, la
  zona donde se ven), `esquirlas.ts` (la geometría: cada una el casco convexo de tres anillos de puntos —el canto filoso, las caras metidas
  hacia adentro con los biseles entre medio, la cresta que quiebra las caras en facetas—, 540 triángulos en un solo búfer, cada vértice sabe
  cuánto es canto), `fondo.ts` (el render target a media resolución con SÓLO el fondo: el cielo, la trama y su zócalo, la fábrica de logos,
  las estrellas y la fugaz, en una capa propia más las luces, limpio con el color de la niebla), `vidrio.ts` (el sombreador: la faceta
  plana girada con la esquirla, la refracción por Snell del rayo leída en el fondo a 14 u detrás, que se DESVANECE donde mira fuera del
  fondo; el Fresnel de Schlick con un reflejo tenue del cielo; el brillo de la luz de la sala en las facetas, que centellea al moverse la
  cámara; el canto: de día la reflexión total lo oscurece, de noche toma la luz; con el prisma, cada canal con su índice, el doble en los
  cantos: el filo de arcoíris) y `CristalDeLaEscena.tsx` (la cámara de ESTE cuadro —`updateMatrixWorld` antes de leerla—, las cajas de la
  barra y de los textos, el rectángulo del logo en la pantalla, la luz, el fondo sólo si se ve). Las esquirlas viven en un anillo contra el
  domo (30 a 36 u del centro, de 3 a 28 u de alto, de 9 a 20 u de largo): paralaje de verdad; se ven sólo en el BORDE del cuadro (fuera de
  una elipse central, lejos de la cámara, nunca en las cajas de la barra y los textos ni en el logo); no escriben profundidad y van antes
  que todo lo transparente que no es fondo (orden −17): una partícula nunca queda tapada; cristalizan (aparecen creciendo en 2,5 s y crecen
  con la amplitud) y giran y respiran muy lento, con el reloj (sin temblor). Apagadas en el túnel y en Tu panel y con la cámara del final.
- **Las variantes:** `?fondo=moire` (el moiré solo), `?fondo=espejo` (el cristal solo: la trama y el zócalo no se dibujan), `?fondo=ambos`
  (lo de siempre), `?espejo-prisma=si` (el filo de arcoíris). Y un defecto de PULIDO 19: `?cristal=no` sólo andaba con el banco (la URL
  sólo deja pasar `?pruebas=` y las «sueltas»): ahora `pedidoDeLaUrl` deja pasar `cristal` y `fondo` (`PEDIDOS_DEL_FONDO`; no son pruebas
  con su nombre: piden `sin-cristal` y `sin-moire`, y sin URL ninguna pide nada).
- **Visto en el sitio** (`p20-r2v.ts`, capturas en `pulido-20/r2v3-1440`): en el hero, Quiénes somos, Números (de noche), Por qué develOP
  ×2; esquirlas de vidrio en los bordes que quiebran la trama y los logos del domo; la de arriba a la derecha se desvanece al llegar a
  «Contacto / Login» (la primera versión pasaba por detrás: la barra no está en `[data-v3]`; ahora sus cajas van primero); de noche, la
  refracción de las estrellas y el canto encendido; las variantes, cada una como debe. Las partículas: de día las mismas con y sin (403/348,
  551/552, 116/111, 191/173: con el cristal, algún fragmento oscuro de más en los cantos); de noche la cuenta de puntos claros baja (373
  contra 518) porque las ESTRELLAS del fondo, refractadas a media resolución, se ablandan: son fondo, no partículas.
- **Medido en el sitio** (sin vsync, la NVIDIA, `p20-r2med.ts`; recibo `entregas/pulido-20/sitio-medido.json`): en calma 5 s en el hero con
  y sin, alternados dos veces, y el recorrido del hero a Números con y sin, dos veces: ningún cuadro de más de 20 ms en ninguna tanda; a
  1440 en calma 2,47–2,53 ms con el cristal contra 2,30–2,40 sin (+0,1 a 0,2 ms), en el recorrido 3,35–3,42 contra 3,10–3,28; a 390 en
  calma 1,87–1,97 contra 1,83–2,05, en el recorrido 2,40–2,47 contra 2,33–2,44. En calma la cámara no se mueve ni un poco entre cuadros
  (salto 0): la vibración se fue con la cámara de este cuadro. (Una primera tanda a 390 tuvo un cuadro de 35,7 ms en el recorrido que no se
  repitió en las cuatro siguientes, con y sin cristal.)
- s71 (R2): la zona (cero en las cajas, en el logo y en el centro, entera en el borde; controles: sin los textos, sin el logo); las
  esquirlas (en el anillo, facetadas; control: una en el centro de la sala); el vidrio (antes que el espejo, la energía y las partículas, sin
  escribir profundidad, sólo el fondo, se desvanece donde mira afuera, la cámara de este cuadro, el fondo sin logo ni partículas; controles:
  después de las partículas, escribiendo profundidad, leyendo la copia del cuadro, la cámara del cuadro anterior, el logo en el fondo, sin
  desvanecerse); las variantes (control: la URL de PULIDO 19); lo medido (control: un cuadro de 25 ms). s70 Q3 con el sentido nuevo.

### R3 · La red de rayos congelados
- HECHO (`a5d74036`). VISTO EN EL SITIO: sí (1440 de día y de noche, 390; el build de medición).
- `energia/dibujo/red.ts`, rehecho: cada enlace es un ARCO como los del plasma (los parámetros de `arcos/camino.ts`: el desvío, la aspereza
  por nivel, la profundidad; cuatro niveles de un ruido de valor que se achica a la mitad, las puntas fijas en sus brasas; una rama corta que
  sale de un punto del medio con el largo y el ángulo de las ramas del plasma, libre en la punta), en la base del MUNDO (no de la cámara):
  congelado en el aire; su forma sale de la SEMILLA del enlace (nace al formarse y no cambia mientras dura) y nunca del reloj; titila leve
  (lo de antes); al cortarse, el arco se ABRE DESDE EL MEDIO (se desconecta) con el destello y el chasquido de siempre (`reposo.ts` no
  cambió: la cascada en 0,3 s, el golpe de energía a sus dos brasas). Barato: la geometría es ESTÁTICA (un búfer armado una vez: por enlace
  8 tramos de camino y 4 de rama, cuadriláteros de pantalla con el ancho en px del dispositivo, afinados en las puntas) y lo que cambia
  viaja en una textura de `máximo × 3` (los extremos con el alfa por la vida, la semilla, el corte): `rellenarRed` no toca un vértice (la
  red de líneas de PULIDO 19 reescribía los cuatro vértices de cada enlace en cada cuadro).
- **Visto en el sitio** (`p20-r3.ts`, capturas en `pulido-20/r3-1440`, `r3-1440-noche`, `r3b-1440`): quieta en el hero se arma (551
  enlaces a 1440 de día, 380–430 de noche, 116–171 a 390); de noche, rayos blancos quebrados con sus ramas entre las brasas encendidas; de
  día, trazos de tinta finos y quebrados (la tinta bajó a la de la red de líneas, 0,42: con el arco hay más trazo); un scroll la corta y en
  ~0,4 s no queda nada (la captura a los 110 ms ya la encontró cortada). Una advertencia de ANGLE (una variable «quizás sin inicializar» en
  `puntoDe`, por sus dos `return`) se fue con un solo `return`.
- **Medido** (sin vsync; recibo `entregas/pulido-20/sitio-medido.json`, sección `red`): armada contra apagada, la diferencia está en el ruido
  (1440 de día 2,56–2,80 contra 2,56–2,74 ms; de noche 2,62–2,67 contra 2,54–2,64; 390 1,71–1,88 contra 1,74–1,79); ningún cuadro de más
  de 20 ms. (La de líneas de PULIDO 19 costaba +0,48 ms a 1440: reescribía 618 × 4 vértices por cuadro.)
- s71 (R3): el búfer estático y sólo la textura por cuadro (control: un relleno que reescribe vértices); el arco (cuatro niveles con la
  aspereza y la profundidad del plasma, la rama, la forma sin el reloj, el corte desde el medio; controles: un arco que se mueve con el reloj,
  una línea recta); lo medido. s70 Q1.d «el dibujo de la red» con el sentido nuevo (tabla).

### Final · verificar
- `npm run verificar`: 78 pasos, 8 con falla: los agregados de la base s1, s17, s2, s3, s4, s5, s7 y s8, con 105 afirmaciones en falla, las mismas de PULIDO 19 (s1-bundle 12, s17-revelado 1, s2-bundle 16, s2-css 2, s3-peso 13, s4-cobertura 1, s4-heredado 4, s5-compacto 1, s5-peso 8, s7-compuerta 18, s8-montaje 2, s8-tres 11, s8-chrome 2, s8-peso 14), ni una más. s71-pulido-20: 52 afirmaciones, 32 controles positivos, 0 fallas.
- El paso 2 (`tsc --noEmit`) de `verificar` se cayó en la primera corrida: «JavaScript heap out of memory», con 0 errores de tipos. El
  chequeo entero ya no entra en el heap por defecto de node (2240 MB): `tsc --extendedDiagnostics` usa 2,47 GB (2,43 sin s71: lo nuevo del
  sprint lo empujó por encima de un borde en el que ya estaba). `s4-verificar.ts` lanza ahora ese paso con `--max-old-space-size=4096`,
  como se corre a mano: el mismo chequeo, con memoria (fila en la tabla).
- `npm run test:frontera`: en verde (2 invariantes, 23 afirmaciones, 10 controles positivos, 12 fuera de ventana, 0 con falla).
- En frío (las cachés de sombreadores del perfil del banco borradas, `p20-frio`): el final a 1440 sin ningún cuadro de más de 20 ms (el de
  1000 ms de la primera corrida sobre el build recién servido no se repitió).
- Al terminar: el Chrome del banco cerrado, el servidor del build apagado, `.next-probe` borrado (3,5 GB), `limpiar.ps1 -Profundo`.

## Disco y memoria por tanda

| Tanda | Disco libre | Disponible (antes → después) | No paginado | Nota |
|---|---|---|---|---|
| Arranque | 74,4 GB | 2484 → 6272 MB (el humano cerró su Chrome y su dev server) | 988 → 976 MB | |
| R1 · reproducir (dev server propio + el Chrome del banco) | 74,4 GB | 3440 → 1864 MB | 987 MB | `p20-r1.ts` 1440 (dos veces) y `p20-sonda2.ts` |
| R1 · iterar con el dev server | 74,3 GB | 2500 → 278 MB | 978 → 1021 MB | el Chrome del humano seguía vivo en segundo plano (0,9 GB: con su permiso se cerró); el dev server crece con cada recompilación (2,6 → 4,5 GB): se apagó y se pasó al build de medición |
| R1 · el build de medición (`reconstruir.sh`, 192 s) y el sitio | 74,2 GB | 6636 → 5462 MB | 1004 → 1013 MB | `p20-r1v.ts` 1440 (dos), 1920, 390; `p20-r2diag.ts` |
| R2 · cinco builds (118–190 s) y el sitio | 74,0 GB | 6627 → 5133 MB | 1016 → 1021 MB | `p20-r2v.ts` (1440, 390, las variantes), `p20-r2med.ts` sin vsync (1440 y 390, dos veces) |
| R3 · dos builds y el sitio | 74,0 GB | 6056 → 5884 MB | 981 → 1020 MB | `p20-r3.ts` 1440 de día, de noche y 390 (sin vsync) |
| Final (frío, verificar, frontera) | 75,7 GB | 6409 MB | 1026 MB | `.next-probe` borrado; el caché de bancos en 1,4 GB (tope 5) |

## Invariantes que cambian de sentido (antes / ahora / por qué)

| Suite | Antes | Ahora | Por qué |
|---|---|---|---|
| s70 Q2 «el pie acostado» | la primera pieza arranca DESPUÉS del golpe | todas TOCAN EN EL GOLPE | R1: «al mismo tiempo que el logo» (control: una que toca fuera del golpe) |
| s70 Q2 «la caída» | termina al ras del piso; en una onda desde el logo (las cercanas antes) | termina incrustada (bajo el ras, quieta); las más altas arrancan antes | R1: «incrustado» y «cada uno con la duración de caída de su altura» |
| s70 Q2 «el cableado» | el piso pulsa en cada impacto (`pedirLaOnda`) | sin pulsos sueltos | todas tocan en el golpe: el impacto es el del logo |
| s70 Q4 «las sombras» | acostadas, la placa con su ribete para siempre | eso al asentarse; incrustada, ninguna (y control nuevo: una sombra bajo una incrustada) | R1: la cara al ras no tapa nada |
| s70 Q2 control «una reserva» | inyectaba en `if (i >= c.n) return` | en `if (i >= c.n \|\| s <= 0) return` | la primera línea de `aplicarLaCaida` cambió; el detector es el mismo |
| s47 «lo interactivo va donde la pieza va a quedar» | el orden termina en `llegar(a, s)` | en `llegar(a, s, …` (con lo que el final deja ver) | el mismo orden; `llegar` recibe la visibilidad del final |
| s51 «el cableado del reloj» | `fondo = scrollHeight − innerHeight` | `fondo = offsetHeight − innerHeight` | R1: la causa de la traba (s71 tiene el control con el de antes) |
| s65 «la llegada lo escribe» | `opacidadDelDom(e)` | `opacidadDelDom(e, final)` | la misma opacidad de la llegada, más el final |
| s4-verificar · paso 2 | `tsc --noEmit` con el heap por defecto de node | con `--max-old-space-size=4096` | el chequeo entero ya no entra en 2240 MB (se caía sin errores de tipos); el mismo chequeo, con memoria |
| s70 Q1.d «el dibujo de la red» | los dos extremos por vértice (`aA`, `aB`, `aLado`) en un búfer reescrito cada cuadro | un búfer estático; los extremos de cada enlace en una textura; el camino en el sombreador (`puntoDe`) | R3: cada enlace es un arco congelado (el mismo control: un dibujo sin la máscara de los textos) |
| s70 Q3 «el cristal de fondo» | las facetas justas del cilindro; el sombreador de pantalla entera (Voronoi, la copia del cuadro sólo en el fondo) | la malla de celdas ya no está y el cristal se monta igual (siempre con movimiento; `cristal=no` y `fondo=moire` lo apagan); «dónde se ve», igual | R2: «se borra la malla de celdas actual del domo» (el cristal nuevo, en s71) |

## Crítica (lo que el banco mostró y qué se hizo)

- R1 · PULIDO 19 dio por buena la caída del pie mirándola en un mini-banco sin DOM: la traba vivía en el DOM (una homografía que agranda el
  documento). Ahora R1 y R2 se ven en el sitio, como pidió el humano.
- R1 · la calma bajo el pie de PULIDO 19 no llegaba a la simulación (uniformes sin pasar: WebGL las deja en cero sin avisar).
- R1 · el invariante de cruces encontró dos defectos que las capturas no mostraban (el rótulo que atravesaba el formulario, el salto al
  empezar a bajar): las cajas orientadas en cada cuadro, con el pie del sitio, valen más que mirar.
- R1 · el dev server para iterar se comió la memoria (4,5 GB con las recompilaciones): el sitio se ve con el build de medición.
- R2 · la primera versión de las esquirlas casi no se veía (de 3,5 a 9 u, a 65–75 u de la cámara: chiquitas, y una refracción pareja sobre
  el gris del día apenas se nota): se agrandaron (de 9 a 20 u), la cresta subió (las facetas quiebran la trama) y la refracción se duplicó.
- R2 · `?cristal=no`, que PULIDO 19 dio como URL, sólo andaba con el banco; y con el banco la URL no cuenta (las variantes se piden en el
  entorno). Lo encontró mirar las variantes en el sitio.

## Lo que no quedó bien

1. **R1, el formulario acostado se ve más chico:** con la cámara lejos y de costado (28°, lo que eligió el humano) el pie acostado ocupa el
   centro del cuadro y el formulario queda en perspectiva: se usa (el foco, escribir, los clics: verificado), pero se lee peor que desde
   arriba. El autocompletado del navegador no se puede disparar desde el banco: verificados el foco y el valor escrito.
2. **R1, la primera versión se rehízo dos veces** (piezas sueltas → columnas invisibles → la cámara lejos): lo de piezas sueltas quedó en
   el código como la base pura (`lugaresEnElPiso` apila cuerpos; ahora son dos columnas).
3. **R2, «las partículas desaparecen» no se reprodujo** con el cristal viejo (las mismas con y sin en siete paradas): se escribió lo que
   se midió; el nuevo no puede taparlas por construcción, pero si era otra cosa, sigue. De noche la refracción ablanda las estrellas del
   fondo (media resolución): en el recibo, la cuenta de puntos claros baja adentro de las esquirlas.
4. **R2, la máscara del texto toma las 24 cajas más grandes** (la barra primero): un texto chico fuera de esas 24, en el borde del cuadro,
   podría tener una esquirla detrás. A 390 casi no se ven esquirlas: los textos ocupan la pantalla.
5. **R2 y R3 a 1920** no se midieron sin vsync (se pidió 1440 y 390); R1 a 1920 sí se verificó en el sitio.
6. **El corte de la red** (R3) no se alcanzó a capturar a mitad de la cascada (a los 110 ms ya estaba cortada).
7. **Un cuadro de 1000 ms** en la primera corrida del final sobre el build recién servido: no se repitió en caliente ni en frío con las
   cachés borradas; queda la sospecha de la primera visita contra el servidor recién levantado.
8. Una advertencia de precisión de D3D (X4122, «sum of … cannot be represented accurately in double precision») de un sombreador que ya
   estaba antes de este sprint sigue en la consola del banco.
9. **Lo de la base:** s8-montaje con sus 2 rojos y los 8 rojos de `verificar` (s1, s17, s2, s3, s4, s5, s7, s8).

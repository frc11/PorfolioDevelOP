# SPRINT PULIDO 18 — El plasma A como producto + la dimensión espejo

Rama `rediseno/home`. Invariante nuevo: `npm run test:s69-pulido-18` (`src/app/v3/_lib/__tests__/s69-pulido-18.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base), `~/.cache/b4-medicion/pulido-17/_scripts/` y
`~/.cache/b4-medicion/pulido-18/_scripts/` (los de este sprint). Recibos: `docs/rediseno/entregas/pulido-18/`.
El modelo del plasma: `docs/rediseno/PLASMA.md`. La dimensión espejo: `docs/rediseno/DIMENSION-ESPEJO.md`.

Decisiones del humano (no se discuten):
- El plasma A gana: pasa a ser el DEFAULT del sitio. El polvo viejo queda en `?energia=polvo`; `?energia=plasma-y-polvo` sigue.
- C se borra con su código. B se queda en su bandera hasta que exista el efecto de cristal de P2 (de ahí sale).
- P1 (A como producto, todo obligatorio): a) el piso es un límite real y las partículas son blandas (el halo se desvanece por
  profundidad contra cualquier geometría, con el búfer de profundidad); el reflejo tenue en el piso si entra. b) Viven en el
  MUNDO: nunca hijas del logo ni de un volumen que lo siga; el logo es fuente de fuerza y de arcos. c) De día se tienen que ver, y
  bien (energía oscura, distorsión de calor, contraste local: se elige con el banco). d) Más partícula, menos nube (núcleos chicos y
  nítidos, halo corto, tamaños por ley de potencia, intensidades variadas, una cruz MUY chica en las más calientes). e) Física
  mejor (convección, pinch de los arcos, estela del puntero, viento del scroll; estable, contenido, sin figuras).
- P2 («dimensión espejo»): efectos de CRISTAL en el FONDO (cielo, domo, moiré), nunca sobre textos ni deformando el logo o los
  títulos. Investigar y escribir `DIMENSION-ESPEJO.md`; al menos cuatro efectos atrás de `?espejo=` (cristalizar, pliegue,
  caleidoscopio, ecos y uno propio); tres disparos (ambiente, scroll, interactivo); monocromo (los bordes prismáticos sólo con
  `?espejo-prisma=si`); un solo pase compartido si hace falta el color de la escena; sin bloom; precalentado; con movimiento
  reducido, sin efectos.
- `lente.ts` fuera de los commits.

El humano puede no estar: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Árbol limpio (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 81 GB libres. Memoria disponible: **1089 MB** (el
  Chrome propio del humano ocupa varios GB; no se toca) → sin banco hasta que haya 3 GB; se avanza con lo que no lo necesita.
  No paginado 934 MB. Sin dev server, sin servidor de medición, sin Chrome del banco.

### P1.0 · El default: el plasma A; `?energia=polvo`; C se borra
- HECHO · VISTO sí, en el banco del sitio al final (sin bandera, el plasma A; ver «El banco del sitio»).
- `entorno.ts`: `energia` pasa a ser `'polvo' | 'plasma-y-polvo' | 'no'` (sin la bandera, el producto: el plasma; `energia=plasma`, la
  de antes, se lee igual); `plasma` pasa a `'a' | 'b' | 'no'` (`plasma=c` se lee como sin bandera). Sigue siendo una prueba suelta
  (`?energia=polvo` en la URL). La base limpia también monta el plasma: no es una idea del entorno (como el final del pie o los
  títulos, va en las dos; s30 afirma que la base no trae pruebas).
- `ProbeStage.tsx`: `conPolvo = energia !== 'no'` (el polvo y el bokeh, sólo pedidos) y `conPlasma = energia !== 'polvo'`.
- C, borrada con su código: la dirección (`direcciones.ts`), su estilo `estela` (`dibujo/particulas.ts`; la estela por la velocidad
  sigue en `uMovida.x`), la superficie del logo en la simulación del enjambre (`uSuperficie`, nacer en el logo, la banda) y la
  uniforme `uLogo` que sólo usaba ella. B queda igual, en su bandera.
- La física del polvo (`polvo/Fisica.tsx`) sigue montada aunque el polvo no se dibuje: hornea el campo del logo que usa B (y la
  medición de PULIDO 17 con `?energia=plasma` ya la incluía). Anotado: si no la necesita nadie más, apagarla sin polvo ahorra GPU.
- Invariantes: s66, s68 y s52 (abajo, antes/ahora/por qué); s69 · P1.0 (el producto, el polvo pedido, los dos, la bandera vieja
  leída como el producto, B, C que no vuelve; con sus controles positivos).
- Compuerta: tsc en verde; lint de los tocados sin errores; las 50 suites que leen lo tocado, en verde (s8-montaje con sus 2 de la
  base: los seis archivos largos de siempre).

### P1.b · Independientes del logo (viven en el mundo)
- HECHO · VISTO sí, en el mini-banco y en el sitio (el logo baja al pie y el plasma se queda: `p1-1440/4-logo-bajando`).
- Todo en el MUNDO: las brasas, el enjambre de B, los arcos, sus luces, los efectos, el puntero y el piso (`FLOOR_Y`, no relativo al
  logo). Los sombreadores ya no le suman el centro del logo a ninguna posición.
- La cáscara (radio 13) es del mundo, quieta alrededor del origen (el lugar de reposo del logo). El logo sólo influye: su HUECO
  (4,2) es un obstáculo donde esté (si baja, las aparta al pasar; no se las lleva), sus ONDAS (el pulso) y su golpe salen de donde
  está, sus ARCOS nacen en su borde y la FUENTE (el brillo cae lejos del logo) y la cara libre se miden desde él. Al cargar, el logo
  cae desde 14 u: la nube lo espera abajo, tenue (lejos de la fuente), y se enciende cuando el logo llega.
- `brasas.ts` pasaba las 300 líneas: se partió (`paso.ts`, el paso y la integración; `afuera.ts`, el puntero, las ondas, la
  agitación, la cáscara y el hueco). s68 mira los dos en su lugar nuevo (módulos y funciones de cada cuadro).
- s69 · P1.b: el logo baja 3 u y el centro de la nube se mueve 0,02 u (el control, la nube que baja con el logo); donde queda el
  logo, ninguna brasa adentro de su hueco; la onda del logo calienta a 2 u del LOGO y su hueco empuja desde donde está (el control,
  medido desde el origen); los sombreadores y el cuadro en el mundo (el control, el de antes). s68: el golpe del pie, una onda desde
  el logo en el mundo (antes, desde el origen de sus coordenadas).
- Compuerta: tsc y lint en verde; las 50 suites, en verde (s8-montaje con sus 2 de la base).

### El mini-banco (mientras no hay memoria para el banco del sitio)
- Sin 3 GB libres no hay build de medición ni banco. Para no avanzar a ciegas: un MINI-BANCO fuera del repo
  (`scratchpad/p18/sombreadores/`): el plasma real (su armado, su cuadro, su física, sus sombreadores y el pase) empaquetado con
  esbuild en una escena chica (un piso de papel con juntas, un logo de reemplazo, la luz del estudio, el tono ACES compensado) y
  dibujado en un Chrome sin ventana con su propio perfil (~250 MB). Saca la captura y junta los errores del compilador. Vistas:
  ancho (26 u), cerca (9 u), piso; noche y día; calor forzado; un arco forzado. NO es el sitio (sin la trama, el cielo, el piso
  vivo, los títulos): lo de la escena real queda para el banco.

### P1.a · El piso (límite real), partículas blandas (profundidad) y el reflejo en el piso
- HECHO · VISTO en el mini-banco y en el sitio (`p1-1440/3-piso`: nada atraviesa el papel).
- EL PISO, UN LÍMITE REAL (`BRASAS.piso`): ninguna baja de 0,85 u sobre el piso (por encima de la cresta más alta del mar y del
  bloque que levanta el cursor); en la banda de 1,6 u sobre ese mínimo un colchón las levanta (2,4 u/s², creciente hacia abajo), lo
  que bajan se frena (5/s) y lo de costado roza (0,9/s): se deslizan y casi no se acercan. Nacen arriba. El enjambre de B, igual.
  Medido (s69): 8 s con el campo y un pulso desde arriba cada 2 s, ninguna debajo del mínimo y ninguna pegada a la banda.
- PARTÍCULAS BLANDAS con el búfer de profundidad: EL PASE COMPARTIDO (`escena/pase/`): una pasada a media resolución de lo opaco
  (las capas: lo que escribe profundidad, más las luces), con la cámara del cuadro, montada ÚLTIMA en el escenario (su cuadro corre
  después de todos y antes de que r3f dibuje). El destino se declara «como la pantalla» (`isXRRenderTarget`: el mismo tono y espacio
  de color) y lleva las mismas luces: ningún programa nuevo. Primero la probé anidada (en el `onBeforeRender` de una malla): el estado
  de las luces de la pasada anidada es otro y three rearmaba los parámetros de cada material en cada cuadro; fuera del cuadro no. La
  partícula se desvanece contra lo opaco en su propio ancho del mundo (`vSuave`); los arcos, en 0,15 u.
- EL REFLEJO TENUE (`dibujo/reflejos.ts`): de noche, las chispas a menos de 2,6 u del piso se ven espejadas debajo, más anchas y
  tenues (el papel es mate), titilando con su chispa; sólo donde lo que se ve es el piso (la profundidad: el logo o el pie delante lo
  tapan) y no sobre un texto. Un dibujo más con los mismos atributos, sin física.

### P1.d · Más partícula, menos nube
- HECHO · VISTO en el mini-banco y en el sitio (`p1-1440/1-noche`: chispas nítidas con halo corto, sin la niebla de PULIDO 17).
- EL NÚCLEO, CHICO Y NÍTIDO: su radio tiene un tope (1,3 px, `uNucleo`); el tamaño de la chispa lo lleva el halo, corto (2 núcleos,
  0,14). Casi sin desenfoque (0,06 px por u, hasta 1,5: era el bokeh de 0,3 y 6) y un tope de 3,2 px.
- LOS TAMAÑOS, por una LEY DE POTENCIA (una Pareto truncada entre 0,012 y 0,08 u, exponente 2,3): la mediana, 1,35 veces la más
  chica; más de 3 veces, el 7 % (antes un tercio). Las intensidades varían (de 0,35 a 1, muchas tenues y pocas fuertes).
- LA CRUZ MUY CHICA (7 px, dos rayos finos en la pantalla) sólo en las más calientes y al destellar fuerte.
- LOS ARCOS: en el mini-banco se vio que la cinta del halo se plegaba en los quiebres del camino (de cerca, esquirlas blancas) y que
  la luz que corre dibujaba rayas de través en el halo (una espina de pescado). El halo pasó a PUNTOS suaves a lo largo del camino
  (el patrón del repo para el brillo: sprites aditivos), con su peso por lo que avanza hasta el siguiente punto; la luz que corre,
  sólo en el núcleo (la cinta fina, que no se pliega). A distancia normal: un rayo de verdad (núcleo nítido, halo, rama, el toque).
- LA PRESENCIA (segunda vuelta, comparada con el A de PULIDO 17 en el mini-banco con el encuadre del sitio: 35 grados, el logo a
  17 u): con el núcleo en 1,3 y el reposo en 0,18 la noche eran puntitos tenues y el plasma perdía la presencia que el humano eligió.
  Cuatro variantes lado a lado; quedó el núcleo en 2,8, el reposo en 0,26, el halo de 2,5 núcleos con peso 0,2 (el tope de s69, sin
  aflojarlo), el tope del núcleo en 1,5 px y las intensidades desde 0,5. Visto: núcleos nítidos, halos cortos, unas pocas grandes;
  partícula, no niebla (la variante de halo más ancho volvía a la nube).

### P1.c · De día
- HECHO · VISTO en el mini-banco y en el sitio (`p1-1440/2-dia`). Las tres opciones quedan juntas (elegidas mirando en el mini-banco;
  el sitio lo confirmó: motas oscuras nítidas y rayos de tinta, sin manchas).
- LAS TRES OPCIONES, juntas y en uniformes (cada una se apaga sola para comparar): un CUERPO OSCURO nítido (el núcleo, 0,6) con un
  VELO tenue alrededor (0,22) y un ESPECULAR mínimo corrido hacia la luz principal (arriba a la izquierda), sólo en los cuerpos que se
  ven grandes; el CALOR de las calientes: refracta lo de atrás (la copia del cuadro, 2,2 px, un temblor) y le sube el contraste
  OSCURECIENDO los medios (el papel blanco queda blanco).
- En el mini-banco: con el punto blanco al centro (el de PULIDO 17) las calientes se leían como ojos o burbujas y el contraste
  simétrico aclaraba el papel (aros claros): se fueron los dos. Ahora, puntos de grafito nítidos con un velo y algún brillo mínimo.
- LA ELECCIÓN (segunda vuelta, en el mini-banco): de día casi no se veía ninguna. La asimetría: de noche una luz chica sumada sobre
  negro se ve; de día un alfa de 0,1 sobre el papel no (y el reposo del día colgaba del de la noche, 0,18). El día tiene ahora su
  propio reposo (`uDia.z`, 0,5) y su ganancia (el cuerpo en 2,6, translúcido con tope 0,85); el velo, angosto y con tope (0,25: una
  cercana y caliente no se vuelve una mancha, el lunar que el humano no quiere: las manchas grises anchas de PULIDO 17). Quedan las
  tres opciones juntas: el cuerpo oscuro y nítido con su velo corto, el especular en las grandes y el calor en las calientes. Visto:
  gotas de tinta nítidas de tamaños variados, el negativo de la noche. LOS ARCOS DE DÍA: el núcleo era blanco (invisible sobre el
  papel) y quedaba una banda de humo gris; ahora el núcleo es de tinta (0,95) y el halo tenue (0,08): un rayo de tinta.
- B, de día, como en PULIDO 17 (sin velo; el brillo claro en las calientes, ahora el especular): P1.c le había cambiado el día.
- EL COLOR DE LA ESCENA, en el pase compartido: un disparador (un triángulo que no pinta) dibujado después de la trama copia el
  cuadro a una textura (`copyFramebufferToTexture`), sólo si alguien lo pidió en ese cuadro (el plasma, de día). La energía se dibuja
  después (orden −10 en adelante) y antes del haz y del amanecer (1 a 3): lo que se dibuja después queda encima del calor.
- s32 (ESCENA 7) prohíbe volver al «aire caliente» que se borró allá (un componente con su pasada); el calor de ahora es el pedido
  del humano, en la partícula y con el pase compartido; los nombres que s32 vigila no se usan.

### P1.e · Física mejor
- HECHO · VISTO en el sitio en hojas de 8 cuadros (en movimiento se ve más que en hojas); verificado por s69.
- `movimiento.ts`: la CONVECCIÓN (las calientes suben por su energía sobre la de reposo, 0,7 u/s² por unidad; las frías bajan, 0,05),
  el PINCH (un arco que golpea tira hacia su canal a las que tiene a menos de 1,3 u, 3,2 u/s², y las calienta: al apagarse las suelta
  encendidas y la convección se las lleva), la ESTELA del puntero (al moverse arrastra a las que tiene a menos de 2,6 u de su rayo
  hacia su velocidad, 1,8/s; quieto, nada). El VIENTO del scroll (`cuadro.ts`): en contra de la cámara que pasa, 0,35 u/s por
  pantalla por segundo, ×(1 + 1,5 T), con tope 1,6 y asentándose en 0,35 s; lo lleva el campo.
- La cáscara, más que lineal con lo que se pasan: con todo a la vez (la mitad caliente, dos arcos, el puntero, el viento al tope
  sostenido 20 s) alguna se escapaba; ahora ninguna (s69), ningún NaN, la rapidez con su tope.

### P1 · La basura de cada cuadro (la encontró la medición del mini-banco)
- HECHO · MEDIDO en el mini-banco (la NVIDIA, sin vsync).
- Midiendo el costo (ver «Medido») aparecieron cuadros sueltos de 100 a 300 ms con la GPU quieta, siempre después de unos 700 cuadros.
  El heap de JS por cuadro (con la memoria precisa del Chrome) lo explicó: el plasma asignaba unos 400 KB por cuadro (la escena sola,
  1,4) y en 5 s había más de 1700 recolecciones; el perfil de asignaciones (el muestreo del heap por CDP, contando lo ya recolectado)
  señaló `Math.hypot`: en V8 asigna un arreglo por llamada (TurboFan no la reduce) y el bucle de las vecinas la llamaba decenas de
  miles de veces por cuadro (las fuerzas entre ellas, el brillo por la densidad, lo de afuera, el movimiento).
- Ahora `largo3` (`energia/largo.ts`: la raíz de la suma de los cuadrados) en los diez módulos del plasma, y en los dos bucles más
  calientes, el cuadrado directo (la raíz sólo de las que están al alcance). Medido: de 378 a 16 KB por cuadro, de 1756 a 48
  recolecciones en 5 s, y el cuadro sin vsync de 2,19 a 1,02 ms a 1440 (`Math.hypot` era además la mitad del costo de CPU del plasma).
  s69 lo vigila (con su control positivo: el `Math.hypot` de vuelta en el bucle de las vecinas). Lo que queda (unos 9 KB por cuadro
  del paso, un número por brasa, y lo de three) no vale la pena.

### P1 · Secuencias (noche, día, piso de cerca, logo bajando, puntero, clic, mantener-soltar; 1440 y 390)
- HECHO EN EL MINI-BANCO · VERIFICAR TRAS REINICIO en el sitio (la memoria nunca llegó a 3 GB: el banco del sitio no se usó).
- Las hojas (8 cuadros cada ~0,15 s): `~/.cache/b4-medicion/pulido-18/mini/<ancho>/` (P1: `1-noche`, `2-dia`, `3-piso-de-cerca`,
  `3b-piso-de-cerca-dia`, `4-logo-bajando`, `5-puntero`, `6-clic`, `7-mantener-soltar`, `8-clic-dia`). A 1440 la noche, el día y el
  logo bajando con el encuadre del sitio (35 grados, el logo a 17 u); a 390, la vista ancha. El recibo: `entregas/pulido-18/mini-secuencias.json`.
- Lo que se ve: de noche, un campo de chispas nítidas de tamaños e intensidades distintas (unas pocas grandes con su halo corto),
  presentes en todo el cuadro y más alrededor del logo; de día, el negativo (gotas de tinta nítidas con un velo corto, el especular
  en las grandes); el piso de cerca, ninguna partícula ni brillo atraviesa el papel (el mínimo de 0,85 u y lo blando); el logo baja
  3 u y la nube se queda; el puntero, el clic (un rayo con núcleo, halo parejo y su rama), mantener y soltar (la descarga con su
  bola de carga); de día, el rayo de tinta.

### P2.1 · Investigar (`DIMENSION-ESPEJO.md`)
- HECHO · `docs/rediseno/DIMENSION-ESPEJO.md`: 15 referencias (Framestore y el «Mandelbrotting» de *Doctor Strange*; ILM y la Nueva
  York que se dobla; Method y el «Magical Mystery Tour»; Framestore y Before & Afters sobre el mirror-verse de *No Way Home*: el
  caleidoscopio encima de la ciudad, el arte matemático, el pliegue «donut», la medida; la gema de la realidad en Knowhere: una
  ilusión que se rompe; el mundo de vidrio de *Multiverse of Madness*; el París de *Inception*; Barr 84; Worley y *The Book of
  Shaders*; Quílez y la distancia exacta al borde; el plegado polar; Escher y el Droste de Leiden; la copia del cuadro de three.js;
  la refracción en pantalla). Cada una con qué se toma y cómo se leyó; ningún código copiado. Lo que NO apareció: un desglose del
  efecto de cristal de la gema de la realidad (anotado).
- Los cinco efectos, cómo se traducen (cristal, pliegue, caleidoscopio, ecos y la propia: la espiral de Escher), los tres disparos y
  una propuesta de dónde va cada uno en el recorrido.

### P2.2 · Los efectos (`?espejo=`), los disparos y el color
- HECHO · VISTO en el mini-banco (con una trama de reemplazo) y en el sitio (ver «El banco del sitio»).
- `escena/espejo/`: lo puro (`espejo.ts`: los ciclos, el disparador de los tres modos, la zona lejos del logo y de los textos), los
  efectos de la pantalla (`pantalla.ts`), los ecos (`ecos.ts`), el pliegue (`pliegue.ts`), el armado y el componente. Banderas:
  `?espejo=cristal|pliegue|caleidoscopio|ecos|espiral`, `?espejo-disparo=ambiente|scroll|mantener` (sin ella, el ambiente) y
  `?espejo-prisma=si`. Con movimiento reducido, nada. El producto, apagado.
- CRISTALIZAR: la copia del cuadro leída por celdas de Voronoi en la pantalla (78 px), cada esquirla con su desfase (hasta 10 px), su
  giro (hasta 0,07 rad) y su retardo (se rompe del centro hacia afuera); el filo, con la distancia exacta al borde (1,1 px, del mismo
  ancho en todas: claro de noche, tinta de día) y una talla adentro. Visto: un vidrio que se raja y se cura; de día, facetas grises.
- EL CALEIDOSCOPIO: seis cuñas espejadas que giran (0,12 rad/s), con sus costuras finas. Visto de día sobre la trama: un rosetón.
- LA ESPIRAL (la propia, Escher): el logaritmo de la zona, repetido cada 3,2 veces y girado 1,6 rad por vuelta, que entra despacio.
- EL PLIEGUE: un doblez circular por vértices de los dos cilindros de la trama desde 3 u, radio 7, en un tramo de ±1,1 rad frente a la
  cámara, con la caída suave a lo ancho (con una caída corta se desgarraba a los costados) y la normal girada. Visto: la pared de
  detrás del logo se enrolla como la cresta de una ola y deja ver el fondo; vuelve. El primer intento (desde 6 u, radio 10) casi no se
  notaba: lo que se enrollaba quedaba arriba del cuadro.
- LOS ECOS: cinco copias del logo (su geometría, su propio material, sin tocar el logo) con la pose de 5, 10, 15… cuadros atrás, en
  abanico y espejadas, detrás; las despierta el movimiento del logo (desde 0,25 u/s o 0,15 rad/s). Visto con el logo bajando.
- Lo que no es fondo NO se toca: el píxel y lo que lee tienen que estar más lejos que el logo (la profundidad del pase: nunca se
  refracta un píxel del logo, del piso cercano ni de un título); sobre un texto se apaga (las mismas cajas que el plasma: la máscara
  del texto salió a `TEXTOS_GLSL`, compartida).
- El color: la copia del cuadro del pase compartido, pedida por cuadro sólo con un efecto de pantalla vivo.
- s69 · P2: las banderas (con el control del pliegue puesto siempre y del espejo con movimiento reducido), el ambiente raro y lento
  que se cura y elige lejos del logo, mantener después del gesto del plasma y nada sobre un texto, sólo el fondo, cada ciclo vuelve a
  cero, el pliegue es la identidad en cero, los ecos no tocan el logo, los módulos y lo de cada cuadro sin reservas.

### P2 · Secuencias y recomendación
- HECHO EN EL MINI-BANCO (una trama de reemplazo, no el moiré real) · VERIFICAR TRAS REINICIO en el sitio.
- Las hojas: `mini/<ancho>/e-*.png` (cristal de día, de noche y con prisma; caleidoscopio; espiral; pliegue de día y de noche; ecos
  de noche y de día; a 390, sin prisma, ecos de día ni pliegue de noche). Lo que se ve: el CRISTAL raja la zona en esquirlas (de día,
  facetas grises con su filo de tinta; de noche, una red de grietas claras) y se cura; el CALEIDOSCOPIO arma un rosetón que gira; la
  ESPIRAL, un vórtice que entra; el PLIEGUE enrolla la pared de la trama detrás del logo como una ola y la devuelve; los ECOS, copias
  del logo (con el de reemplazo, una caja: se leen como láminas apiladas; con el logo real, su contorno) detrás, al moverse.
- LA RECOMENDACIÓN (cuál y dónde), la de `DIMENSION-ESPEJO.md`, confirmada en el mini-banco y pendiente del sitio:
  - 01 · Hero: los ECOS en la caída del logo al cargar (como el pliegue, no necesita la copia del cuadro).
  - 02 → 03 (Quiénes somos → Números): el CRISTAL atado al scroll, en el cielo detrás (es el de la gema de la realidad: el que más
    se parece al pedido).
  - 05 · Servicios: el PLIEGUE de la cúpula, lento, una vez.
  - 07 · Por qué develOP: la ESPIRAL, atada al scroll.
  - El CALEIDOSCOPIO, el interactivo (mantener apretado sobre el fondo).
  - Fuera: 04 · Trabajos (el túnel aprobado), 06 · Tu panel (el papel opaco), 08 · Cierre y el pie (el encastre).
  - Si hay que quedarse con dos: el cristal (scroll) y los ecos (hero). El prisma: en el mini-banco es un fleco de color apenas
    visible en los filos (saturación de 25 sobre 255, contra 7 sin él); queda apagado por defecto, como se pidió.

### Medido (sin vsync: el plasma A y cada efecto, a 1440 y 390)
- HECHO EN EL MINI-BANCO (la NVIDIA RTX 5050, D3D11, sin vsync) · el sitio entero, con su banco: ver abajo. Recibo:
  `entregas/pulido-18/mini-medido.json`.
- Cómo: un Chrome sin ventana por medición (`--disable-gpu-vsync --disable-frame-rate-limit --force_high_performance_gpu`), la escena
  compilada antes (como `gpu/Precompilar.tsx`), 4 s de física para el estado estable y 6 s medidos. EL CUADRO, sin el reloj de la GPU
  (sus consultas traban un cuadro hacia el 775: 3 de 3 corridas con el reloj, 0 de 3 sin él); LA GPU, con su reloj, en otra tanda.
  Con un efecto, se vuelve a disparar apenas se cura (activo todo el rato). Nada se compila durante la medición.
- Ningún cuadro de más de 20 ms en calma, al máximo ni con cada efecto activo, a 1440 y 390 (uno suelto de 68,9 ms a 390 con el
  cristal de día no volvió en dos corridas más: era la máquina). La GPU, a lo sumo 1,44 ms. El plasma A suma ~0,7 ms al cuadro a 1440
  y ~0,2 a 390 (la escena sola, 0,12 y 0,23); cada efecto, casi nada (la GPU, +0,06 el cristal de día).

| | 1440 · cuadro (media / p95 / máx., ms) | 1440 · GPU (media / máx.) | 390 · cuadro | 390 · GPU | basura por cuadro (KB, 1440 / 390) |
|---|---|---|---|---|---|
| la escena sola (sin el plasma) | 0,12 / 0,2 / 6,9 | 0,07 / 0,55 | 0,23 / 0,3 / 3,2 | 0,03 / 0,32 | 1,2 / 1,5 |
| plasma A · calma de noche | 0,84 / 1,2 / 4,2 | 0,19 / 0,81 | 0,38 / 0,5 / 3,2 | 0,06 / 1,44 | 15,5 / 8,9 |
| plasma A · calma de día | 0,81 / 1,1 / 4 | 0,25 / 1,23 | 0,38 / 0,6 / 3,7 | 0,08 / 1,11 | 15,6 / 8,9 |
| plasma A · al máximo de noche | 0,88 / 1,2 / 4,2 | 0,2 / 0,86 | 0,42 / 0,6 / 3,5 | 0,09 / 0,89 | 16,4 / 9,4 |
| plasma A · al máximo de día | 0,92 / 1,3 / 4,5 | 0,25 / 1,17 | 0,41 / 0,6 / 3,4 | 0,11 / 0,83 | 16,2 / 9,3 |
| + cristal activo · de día | 0,86 / 1,1 / 3,8 | 0,31 / 1,41 | 0,39 / 0,5 / 68,9 (un 68,9 suelto: no volvió en 2 corridas más, con máx. 3,6) | 0,11 / 1,14 | 16,5 / 9,2 |
| + cristal activo · de noche | 0,84 / 1,1 / 4,2 | 0,32 / 1,16 | 0,59 / 0,7 / 3,4 | 0,11 / 0,8 | 16,2 / 9,8 |
| + pliegue activo · de día | 0,83 / 1,1 / 4 | 0,25 / 0,99 | 0,57 / 0,8 / 3,5 | 0,08 / 0,9 | 15,8 / 9,6 |
| + pliegue activo · de noche | 0,82 / 1,1 / 5,2 | 0,18 / 1,26 | 0,37 / 0,5 / 3,4 | 0,06 / 0,44 | 16 / 9,1 |
| + caleidoscopio activo · de día | 0,82 / 1,1 / 4 | 0,26 / 1,07 | 0,39 / 0,6 / 3,9 | 0,1 / 0,63 | 16 / 9,3 |
| + caleidoscopio activo · de noche | 0,83 / 1,1 / 4 | 0,26 / 1,3 | 0,39 / 0,5 / 18,1 | 0,08 / 1,28 | 16,1 / 9,3 |
| + ecos activos · de día | 0,84 / 1,1 / 3,9 | 0,25 / 1,14 | 0,59 / 0,8 / 3,3 | 0,09 / 1,18 | 16,6 / 10,6 |
| + ecos activos · de noche | 0,87 / 1,2 / 4,5 | 0,2 / 0,96 | 0,4 / 0,6 / 3,3 | 0,07 / 1,24 | 16,3 / 9,9 |
| + espiral activa · de día | 0,82 / 1,1 / 4,7 | 0,25 / 1,07 | 0,59 / 0,8 / 3,4 | 0,08 / 0,52 | 16,2 / 9,8 |
| + espiral activa · de noche | 0,84 / 1,2 / 4,3 | 0,27 / 1,08 | 0,58 / 0,8 / 4,9 | 0,1 / 0,77 | 16,2 / 9,7 |

### El banco del sitio (la memoria volvió al final del sprint)
- HECHO · A las 00:30 la memoria disponible pasó de ~1,1 a 6,5 GB (el Chrome del humano bajó de 8 a 1 GB). El build de medición en
  `.next-probe` (206 s), el servidor y el Chrome del banco (la NVIDIA RTX 5050, D3D11: la placa leída en cada página medida), en
  cadena (`_scripts/p-todo.sh`, ~25 min): P1 a 1440 y 390, P2 por efecto a 1440 y 390, el prisma, la tanda sin vsync (7
  configuraciones × 2 anchos, cada una con las cachés borradas) y una con vsync. Recibos: `entregas/pulido-18/sitio-secuencias.json`
  y `sitio-medido.json` (s69 los lee). Las hojas, en `~/.cache/b4-medicion/pulido-18/` (`p1-*`, `p2-*`, `p2prisma-*` y, después de los
  arreglos, `p1b-*`, `p2b-*`, `p2c-*`).
- LO VISTO (P1): de noche (Portfolio y Números) el plasma A es un campo de chispas nítidas con halo corto, sin la niebla de PULIDO 17,
  con sus arcos (un rayo con núcleo y halo); de día (el hero) el negativo: motas oscuras chicas y algún rayo de tinta; en el piso,
  nada atraviesa el papel; el logo baja al pie y el plasma se queda; el clic: el rayo sube en V desde el logo, con su destello; a 390,
  lo mismo con el dedo, con los textos limpios.
- LO VISTO (P2): el CRISTAL raja la cúpula del moiré detrás del logo (de día) y arma una red de grietas claras sobre la retícula de
  Números (de noche); el CALEIDOSCOPIO, un rosetón; la ESPIRAL, un vórtice que retuerce la cúpula (el más vistoso); el PLIEGUE se nota
  de noche sobre la retícula de Números (se dobla y vuelve) y de día en el hero apenas; los ECOS, copias tenues del logo detrás al bajar
  al pie (de día, apenas). El prisma, un fleco de color apenas visible.
- LO QUE EL SITIO MOSTRÓ Y SE ARREGLÓ: (1) al soltar (la descarga), a 1440, una columna blanca gruesa y saturada hasta el piso: el halo
  de puntos crecía con el paso (el arreglo del collar) y además sumaba luz. Ahora el vértice del otro lado de la cinta va al medio del
  tramo (el doble de puntos) y lo que crece por el paso no suma luz (más ancho, más tenue). Vuelto a grabar en el sitio: rayos finos
  (`p1b-1440`). (2) La consola: un aviso del compilador de D3D, «variable posiblemente sin inicializar» en `leerConPrisma` (el retorno
  temprano). Reescrita sin retorno temprano: con las cachés de programas borradas queda sólo el aviso de la base (X4122, que también
  sale con el polvo solo) (`p2c-cristal-1440`). (3) El disparo `scroll`, con un recorrido entero de la página (`_scripts/p-scroll.ts`):
  enciende al cruzar Quiénes somos → Números (y 2760 a 3600) y al llegar a Por qué develOP (25680 a 26560); Servicios → Tu panel nunca
  (los dos son papel opaco y ahí la escena está en pausa: la temperatura no cambia en 0,8 s). Ese borde se sacó de la lista.
- LO MEDIDO (la NVIDIA): sin vsync y en caliente, ningún cuadro de más de 20 ms en ninguna configuración (el peor, 18,9 ms: el pliegue
  al máximo a 1440). El plasma A le suma al polvo +1,46 ms por cuadro al máximo a 1440 (en PULIDO 17, +2,04: era la basura de
  `Math.hypot`) y +0,43 a 390; cada efecto, ~+0,3 ms a 1440 y casi nada a 390. Con vsync, todo en los 13,34 ms de la pantalla
  (máx. 14,2), salvo el cuadro largo de la calma a 1440 que también tiene el polvo solo (el campo del logo que se publica: s68). En frío
  (la primera visita), los tirones del primer scroll son del sitio (el polvo solo, hasta 662 ms); con el plasma, uno de 1,15 s a 390
  en una sola corrida (ver «Lo que no quedó bien»).

| (sin vsync; media / máx., ms) | 1440 · calma | 1440 · al máximo | 1440 · noche | 1440 · el efecto (día · noche) | 1440 · frío (máx.) | 390 · calma | 390 · al máximo | 390 · noche | 390 · el efecto (día · noche) | 390 · frío (máx.) |
|---|---|---|---|---|---|---|---|---|---|---|
| el polvo (la base) | 1,44 / 8,3 | 2,21 / 10 | 1,28 / 7,4 | — | 662,5 | 1,64 / 9,7 | 2,05 / 7,2 | 1,65 / 6,9 | — | 149,4 |
| el plasma A (el producto) | 2,76 / 10,8 | 3,67 / 12,5 | 2,91 / 9,7 | — | 266,3 | 2,08 / 8,9 | 2,48 / 7,3 | 2,09 / 7,2 | — | 1150,6 |
| + cristal | 3,03 / 11,3 | 3,98 / 16,2 | 3,2 / 7,9 | 3,1 / 9,7 · 3,22 / 12,6 | 543,6 | 2,07 / 13,3 | 2,47 / 9,5 | 2,04 / 5,8 | 2,06 / 7,5 · 2,06 / 10,5 | 441,3 |
| + pliegue | 3,06 / 10,6 | 3,89 / 18,9 | 3,12 / 8,1 | 3,1 / 9,8 · 3,36 / 12 | 611,9 | 2,13 / 12,3 | 2,6 / 8,1 | 2,17 / 7,5 | 2,47 / 11,7 · 2,14 / 7,4 | 884 |
| + caleidoscopio | 3,06 / 8,6 | 3,9 / 14,4 | 3,11 / 10,1 | 3,09 / 8,9 · 3,13 / 13,2 | 867,6 | 2,13 / 9,3 | 2,59 / 7,7 | 2,21 / 8,2 | 2,11 / 9,1 · 2,13 / 7,5 | 423,8 |
| + ecos | 3,07 / 13,1 | 3,94 / 13,7 | 3,14 / 9,2 | 3,13 / 10,5 · 3,18 / 11,9 | 637,7 | 2,38 / 10,8 | 2,57 / 10,2 | 2,19 / 10,4 | 2,26 / 10,6 · 2,16 / 9,8 | 1106 |
| + espiral | 2,89 / 8,4 | 3,78 / 15,7 | 3,05 / 15,6 | 2,96 / 12 · 2,96 / 11,9 | 296,5 | 2,2 / 6,5 | 2,64 / 8,6 | 2,2 / 6,5 | 2,14 / 8,8 · 2,21 / 7,4 | 399,9 |

| (con vsync, la pantalla a 75 Hz: 13,34 ms) | 1440 · calma | 1440 · al máximo | 1440 · noche | 390 · calma | 390 · al máximo | 390 · noche |
|---|---|---|---|---|---|---|
| el polvo (la base) | 14,38 / 373,8 | 13,34 / 14 | 13,34 / 14,1 | 13,34 / 14 | 13,34 / 14 | 13,34 / 13,9 |
| el plasma A (el producto) | 14,42 / 386,9 | 13,34 / 14,1 | 13,34 / 13,9 | 13,34 / 14,2 | 13,34 / 14,1 | 13,34 / 14 |

### Final · verificar
- HECHO · `tsc` (con 4096 de heap) limpio; el lint de lo tocado, limpio. `npm run verificar`: 76 pasos, 8 con falla, que son los 8 rojos
  de la base (s1, s17, s2, s3, s4, s5, s7, s8), con 105 afirmaciones en falla adentro, las mismas de la base: ni una más. s69 en
  verde: 81 afirmaciones, 50 controles positivos. `npm run test:frontera`: 0 fallas. Sin build de medición al terminar
  (`.next-probe` borrado), sin servidor ni Chrome del banco, `limpiar.ps1 -Profundo` corrido.

## VERIFICAR TRAS REINICIO (el banco del sitio, cuando haya 3 GB libres) — HECHO al final (ver «El banco del sitio»); los comandos quedan para volver a correrlo

La memoria disponible nunca llegó a 3 GB en todo el sprint (de 0,86 a 2,4 GB; el Chrome del humano, 6 a 8 GB en ~50 procesos): el
portero del banco (`banco11.ts conectar`) se niega por debajo de 3000 MB y la regla del sprint dice «sin banco». Todo lo visto y medido
es del MINI-BANCO (el plasma real y el espejo en una escena chica). Lo pendiente en el sitio, con los scripts ya escritos (en
`~/.cache/b4-medicion/pulido-18/_scripts/`; los del mini-banco en `_mini/`):
1. `bash _scripts/reconstruir.sh` (el build de medición en `.next-probe` + `next start -p 3000` + el Chrome del banco).
2. P1: `npx tsx _scripts/p-secuencias.ts 1440 900 p1` y `npx tsx _scripts/p-secuencias.ts 390 844 p1` (noche, día, piso, logo
   bajando, puntero, clic, mantener-soltar; a 390 la resumida).
3. P2, por efecto: `ESPEJO=cristal npx tsx _scripts/p-secuencias.ts 1440 900 p2` (y `pliegue`, `caleidoscopio`, `ecos`, `espiral`;
   `PRISMA=1` para el prisma; a 390 los que apliquen).
4. Lo medido: `SIN_VSYNC=1 bash _scripts/p-tanda.sh p18 "polvo producto espejo-cristal espejo-pliegue espejo-caleidoscopio espejo-ecos espejo-espiral" "1440 390"`
   (y una con vsync: `bash _scripts/p-tanda.sh p18v "polvo producto" "1440 390"`).
5. Mirar en el sitio: el día (las tres opciones juntas, elegidas en el mini-banco), el disparo `scroll` en sus bordes, que
   `copyFramebufferToTexture` no dé el error de formato de Chromium (la consola del banco), y los ecos con el logo real.
6. Recibos en `docs/rediseno/entregas/pulido-18/`, apagar el servidor y el Chrome, borrar `.next-probe` y
   `scripts/limpiar.ps1 -Profundo`.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 81 GB | 1089 MB | 934 MB | el Chrome del humano abierto; sin banco |
| Mini-banco: las hojas (33, regeneradas con el aspecto nuevo) | 78 GB | 1121 MB | 982 MB | un Chrome sin ventana (~250 MB); 7,8 MB de hojas |
| Mini-banco: lo medido (t1, t2, t3 y las repetidas; ~70 corridas de un Chrome sin ventana) | 71–79 GB | 1121 → 6483 MB | 982 → 931 MB | a mitad de la tanda t3 el humano cerró su Chrome (quedó en 1 GB) |
| Banco del sitio: el build, P1 y P2, la medición sin vsync y con vsync (~45 min) | 79 GB | 6483 → 5570 MB | 931 → 964 MB | un solo Chrome del banco por tanda; `.next-probe` borrado al terminar |
| Banco del sitio: después de los arreglos (otro build, p1b, p2b, p2c, el recorrido del scroll) | 79 GB | 6028 → 7289 MB | 933 MB | servidor y Chrome cerrados; `limpiar.ps1 -Profundo` |

## Invariantes que fijaban el polvo como default (antes / ahora / por qué)

| Invariante | Antes | Ahora | Por qué |
|---|---|---|---|
| s66 · M2 (las banderas) | sin bandera, el polvo; `energia=plasma`, el plasma en su lugar; el escenario con `sinPolvo` | sin bandera, el plasma (y `energia=plasma` se lee igual); `energia=polvo`, el polvo de antes; `plasma-y-polvo`, los dos; el escenario con `conPolvo` y `conPlasma` | la decisión del humano (A gana); lo demás (los destellos borrados, sin el color) igual |
| s68 · O3 (las direcciones) | `plasma=a`, `b` o `c` sobre `energia=plasma`; pedida sola, montaba el plasma; C pegada al logo | `plasma=a` o `b`; sin bandera, A (el producto); `plasma=c` se lee como sin bandera; C no existe (ni su superficie); el control ve el escenario de PULIDO 17 y a C de vuelta | la decisión del humano (A gana; C se borra) |
| s68 · O3 (el dibujo) | `CLARO_EN_REPOSO = { chispa: 0, mota: 0, estela: 0 }` | `{ chispa: 0, mota: 0 }` (el control, el destello en reposo de vuelta) | el estilo de C se borró |
| s52 · las pruebas sueltas | `energia` vale `plasma` o `plasma-y-polvo`; `plasma`, `a`, `b` o `c` | `energia` vale `polvo` o `plasma-y-polvo`; `plasma`, `a` o `b` | el nuevo sentido de la bandera |

Lo medido de C en PULIDO 17 queda en su recibo (`entregas/pulido-17/o5-medido.json`) y s68 lo sigue leyendo como historia.

## Crítica (lo que el banco mostró y qué se hizo)

- Mini-banco · el halo de un arco largo era un collar de cuentas: los puntos del halo quedaban más separados que su radio. Ahora el
  radio de cada punto es al menos 1,1 veces lo que avanza hasta el siguiente; el halo de un arco largo sale parejo (y algo más ancho).
- Mini-banco · la zona del espejo a 390: el radio salía del alto de la pantalla (0,27 de 844 px) y tapaba media pantalla. Ahora sale
  del lado menor.
- Mini-banco, con el encuadre del sitio · de noche, puntitos tenues: el plasma había perdido la presencia del A elegido (P1.d,
  segunda vuelta: el núcleo brillante, el reposo visible). De día casi no se veía ninguna, y los arcos de día eran una banda de humo
  gris (P1.c, segunda vuelta: el reposo y la ganancia del día, el velo con tope, el arco de tinta). La vista `sitio` del mini-banco
  (35 grados, el logo a 17 u, un 36 % del ancho) se sumó para esto: la vista ancha (30 grados, a 26 u) achicaba todo.
- Banco del sitio · la descarga como una columna gruesa (el halo), un aviso de D3D en `leerConPrisma` y un borde del scroll que nunca
  enciende (Servicios → Tu panel): ver «El banco del sitio».

## Recomendación

- EL PLASMA A es el producto (ya es el default): de noche, chispas nítidas de tamaños e intensidades distintas con un halo corto, y
  rayos con núcleo y halo; de día, el negativo: gotas de tinta nítidas y rayos de tinta. Medido en el sitio: en caliente, ningún cuadro
  de más de 20 ms; +1,46 ms por cuadro sobre el polvo a 1440 (+0,43 a 390).
- LA DIMENSIÓN ESPEJO, cuál y dónde (visto en el sitio):
  - 02 → 03 (Quiénes somos → Números): el CRISTAL atado al scroll. Es el de la gema de la realidad (el pedido): en el sitio raja la
    cúpula del moiré y de noche arma grietas claras. El disparo `scroll` ya enciende en ese borde.
  - 07 · Por qué develOP: la ESPIRAL atada al scroll. Es la más vistosa: un vórtice que retuerce la cúpula. El borde Tu panel → Por qué
    develOP ya enciende.
  - 01 · Hero: los ECOS en la caída del logo al cargar. Sutiles de día; no necesitan la copia del cuadro.
  - El CALEIDOSCOPIO, el interactivo (mantener apretado sobre el fondo).
  - El PLIEGUE, sólo de noche sobre una retícula (Números). De día, en el hero, apenas se nota: si no va ahí, se descarta.
  - Fuera: 04 · Trabajos (el túnel aprobado), 06 · Tu panel (papel opaco: ahí la escena está en pausa), 08 · Cierre y el pie.
  - Si hay que quedarse con dos: el cristal (Quiénes somos → Números) y la espiral (Por qué develOP). El prisma, apagado.
- Para llevarlo al producto falta un paso (no hecho, a decidir): hoy `?espejo=` elige UN efecto para todos los disparos. La
  recomendación (el cristal en un borde y la espiral en otro) pide un efecto por borde.

## Lo que no quedó bien

- El banco del sitio llegó recién al final: casi todo el sprint la memoria estuvo entre 0,86 y 2,4 GB. Las iteraciones se miraron en
  el mini-banco (el código real en una escena chica) y el sitio confirmó después, en hojas de 8 cuadros (JPEG a 0,6), no en video.
- B sigue en `?plasma=b`. Con el cristal ya construido, «de ahí sale» puede querer decir que se borra: no la borré sin confirmarlo.
- En frío, a 390, el producto tuvo un tirón de 1,15 s en una sola corrida (el polvo solo: 149 ms a 390 y 662 a 1440). No lo repetí ni
  lo investigué; la deuda del frío de s68 sigue abierta.
- El pliegue de día en el hero casi no se ve; los ecos de día, apenas.
- De cerca, el núcleo del rayo satura un poco en su punta más cercana.
- La física del polvo (`polvo/Fisica.tsx`) sigue montada aunque el producto ya no dibuja el polvo (hornea el campo del logo que usa B):
  GPU de más. No se apagó.
- El día se eligió mirando (las tres opciones juntas: el cuerpo, el especular y el calor). El calor (la refracción) casi no se
  distingue en hojas a 0,6.
- La física nueva (convección, pinch, estela, viento) está verificada por invariante (s69) y en hojas, pero en 8 cuadros se ve poco.

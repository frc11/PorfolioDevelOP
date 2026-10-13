# LA DIMENSIÓN ESPEJO — de dónde sale y cómo se traduce a la escena

PULIDO 18 · P2. El pedido del humano, sobre la dirección B del plasma: «me hace acordar al Dr. Strange cuando usa la gema de la
realidad, ese efecto cristalino donde la escena se cristaliza. No son plasmas, es un efecto de cristal, como la dimensión espejo.
Quiero desarrollar eso, más en el FONDO, quizás cerca del moiré, no necesariamente pegado al logo».

Reglas que vienen con el pedido: los efectos son de FONDO (el cielo, la cúpula, la trama del moiré); nunca sobre un texto ni
deformando el logo o los títulos; monocromo (el borde prismático, el arcoíris de las esquirlas, sólo con `?espejo-prisma=si` y muy
sutil); si hace falta el color de la escena para refractar, UN pase compartido (el del calor del plasma de día) y medido; sin bloom;
precalentados; con movimiento reducido, ninguno.

## Las referencias

Ningún código copiado: las técnicas se escribieron desde su descripción. Cómo se leyó cada una va al lado (entera, o por el resumen
del buscador cuando el sitio no dejó leerla).

| # | Referencia | Qué es | Qué se toma (y por qué) | Cómo se leyó |
|---|---|---|---|---|
| 1 | [Framestore · *Doctor Strange* (Art of VFX, Wilson, Fawkner, Wajsbrot)](https://www.artofvfx.com/doctor-strange-mark-wilson-vfx-supervisor-jonathan-fawkner-vfx-supervisor-and-alexis-wajsbrot-cg-supervisor-framestore) | El Sanctum y la dimensión espejo: el escenario «bending and moulding, cloning and reconfiguring itself»; el «Mandelbrotting» (un fractal que crece adentro de lo modelado, hecho en Houdini con un sombreador de isosuperficie al render) | Lo que se dobla es la ARQUITECTURA entera, despacio, y se reconfigura: el pliegue de la cúpula. «You can't google 'Mirror Dimension'»: la referencia es inventada; y «difficult to nail down how far we should go with it»: medida | Entera (el resumen del lector) |
| 2 | [ILM · *Doctor Strange*, Nueva York (CGW, «Digital Prescription»)](https://www.cgw.com/Press-Center/In-Focus/2016/Digital-Prescription.aspx) y [el reel](https://www.motionpictures.org/2017/03/doctor-strange-vfx-reel-appropriately-mind-bending/) | La ciudad rehecha como un modelo digital entero para poder doblarla y girarla; las palomas que vuelan justo cuando el mundo empieza a girar o a caleidoscopiar | El pliegue como movimiento MONUMENTAL de lo grande (no del objeto): la cúpula entera, no una pieza; y que el giro empieza con una señal (acá, el scroll o el gesto) | Por el resumen del buscador (AWN dio 500 y 403) |
| 3 | [Method Studios · el «Magical Mystery Tour» (Animation Magazine)](https://animationmagazine.net/?p=218612) | El viaje por las dimensiones: «constantly evolving worlds», «fractal worlds, macro photography and kaleidoscopic animation», Ditko | El caleidoscopio que se DESPLIEGA (no aparece entero): una simetría que crece desde un centro y gira | Por el resumen del buscador |
| 4 | [Framestore · *Spider-Man: No Way Home* (AWN)](https://www.awn.com/print/vfxworld/framestore-untangles-creative-web-spider-man-no-way-home-vfx) | La dimensión espejo en tres partes: Nueva York que se deforma y caleidoscopia, Nueva York con el Gran Cañón, el caleidoscopio final; la ciudad procedural y el caleidoscopio de efectos ENCIMA | El caleidoscopio como capa sobre lo que ya hay (una lectura del cuadro, no geometría nueva): la copia del cuadro | Por el resumen del buscador |
| 5 | [Before & Afters · el arte matemático del mirror-verse](https://beforesandafters.com/2022/01/14/heres-how-math-art-inspired-the-mirror-verse-moments-in-spider-man-no-way-home/) | Adrien Saint Girons: «mathematical equations and mathematical formulas that generated interesting images»; espirales hechas de rectas, atrapasueños, el pliegue «donut» (la ciudad que se dobla sobre sí); «it only works from that particular camera angle»; cuánto cielo caleidoscopiar sin que sean «chicken nuggets everywhere in the sky» | La MEDIDA: una zona, no todo el cielo; la espiral (la idea propia: el Droste); que el efecto se piensa para la cámara que lo mira (una capa de la pantalla, no del mundo) | Entera (el resumen del lector) |
| 6 | *Avengers: Infinity War* · la gema de la realidad en Knowhere ([Russo: «It's illusory... It creates illusions»](https://comicbook.com/marvel/news/avengers-infinity-war-thanos-reality-infinity-stones/?nb=1)) | Thanos muestra una ilusión y la rompe: el museo intacto se deshace en la realidad quemada; Drax en cubos, Mantis en cintas | Lo que el humano recuerda: la escena se cristaliza y se cura. Que es una ILUSIÓN: todo efecto vuelve a cero (se cura); nada queda roto | Por el resumen del buscador; un desglose del efecto de cristal NO apareció (anotado) |
| 7 | [Framestore · *Multiverse of Madness*, el mundo de vidrio (Before & Afters)](https://beforesandafters.com/2022/06/14/the-crazy-multiverse-shot-in-doctor-strange-in-the-multiverse-of-madness-had-its-own-intense-vfx-journey/) | El mundo de vidrio salió de una idea de máquinas, «slightly more economic»; «it needed to be different, needed to be fresh» | El vidrio como ECONOMÍA: refractar lo que ya está dibujado (una copia del cuadro) es más barato que construir otra escena | Entera (el resumen del lector) |
| 8 | [*Inception*, el París que se pliega (Art of VFX, Paul Franklin, DNEG)](https://www.artofvfx.com/inception-paul-franklin-superviseur-vfx-double-negative/) | La ciudad escaneada con lidar que se dobla sobre la cámara | El pliegue que se ENROLLA por encima de quien mira, como una ola: la cúpula que se curva hacia adentro | Por el resumen del buscador |
| 9 | [Barr, «Global and local deformations of solid primitives» (SIGGRAPH 84)](https://history.siggraph.org/?p=107435) | Doblar, torcer y afinar con matrices que dependen de una coordenada; la normal deformada desde la normal original | El pliegue por vértices: un doblez circular de la pared desde una altura, con la normal girada lo mismo (la luz de la sala sigue respondiendo) | Por el resumen (el registro y el abstract) |
| 10 | [Worley (1996) y *The Book of Shaders*, cap. 12 (Gonzalez Vivo, Lowe)](https://thebookofshaders.com/12/) | El ruido celular: una semilla por celda de una grilla, la más cercana en el vecindario de 3 × 3, su posición como identidad de la celda | Las ESQUIRLAS: cada celda de Voronoi es un vidrio con su identidad (su desfase, su giro, su retardo) | Entera (el resumen del lector) |
| 11 | [Quílez, «voronoilines»](https://iquilezles.org/articles/voronoilines/) | La distancia exacta al borde de una celda (dos pasadas: la celda más cercana, después la distancia a cada bisectriz en 5 × 5); F2 − F1 no es una distancia (los bordes cambian de ancho) | El FILO de cada esquirla con el mismo ancho en todas (un vidrio cortado, no una mancha) | Entera (el resumen del lector; la página no declara licencia: se escribió desde la descripción) |
| 12 | El caleidoscopio por plegado polar ([LYGIA, `kaleidoscope`](https://git.gay/kaneraZh/lygia/src/branch/cpp_bundle/space/kaleidoscope.glsl), [Godot, «Simple Kaleidoscope» (MIT)](https://godotshaders.com/shader/simple-kaleidoscope/)) | Al ángulo alrededor del centro se le toma el resto de una cuña y se lo espeja; el radio queda | El CALEIDOSCOPIO: N cuñas espejadas que giran; N que crece de 1 (nada) a 6 (desplegado) | Por el resumen del buscador |
| 13 | [Escher, *Print Gallery* y el efecto Droste (de Smit y Lenstra, Leiden)](https://pub.math.leidenuniv.nl/~smitbde/escherdroste/page_menu=contact&b=3.html) | El cuadro que se contiene a sí mismo en espiral: un mapa exponencial complejo; el logaritmo de la imagen, repetido | LA PROPIA: la ESPIRAL, el fondo que se enrolla hacia adentro de sí mismo (el log de la pantalla, girado y escalado, exponenciado) | Por el resumen del buscador |
| 14 | [three.js · `FramebufferTexture` y `copyFramebufferToTexture`](https://threejs.org/docs/pages/FramebufferTexture.html) y [un hilo sobre su costo](https://discourse.threejs.org/t/copying-canvas-buffer-to-texture/12687) | Copiar lo dibujado hasta un momento a una textura; copiar grande cuesta | EL PASE COMPARTIDO: una copia del cuadro después de la trama, sólo con un efecto vivo, medida | Por el resumen del buscador |
| 15 | [Refracción en pantalla (GameDev.net)](https://gamedev.net/shaderlab/52-screen-space-refraction/) y [un vidrio que se rompe en celdas (Godot Shaders)](https://godotshaders.com/shader/simple-glass-broken/) | Refractar desplazando la lectura de lo ya dibujado; una pantalla partida en celdas con su retardo, su caída y su giro | Que cada esquirla lea la copia del cuadro con su propio desfase y giro | Por el resumen del buscador |

## Lo que se toma, en una línea por idea

- MEDIDA: una zona del fondo, no el cielo entero; despacio; pocas veces (ref. 1, 5).
- ARQUITECTURA: lo que se dobla es lo grande (la cúpula, la trama), no el objeto (ref. 1, 2, 8).
- MATEMÁTICA: Voronoi, el plegado polar, el doblez de Barr, la espiral de Escher: formas exactas, no ruido (ref. 5, 9–13).
- ILUSIÓN: todo efecto se cura y vuelve a cero; nada queda roto (ref. 6).
- ECONOMÍA: refractar la copia del cuadro (una por cuadro, compartida) en vez de dibujar otra escena (ref. 7, 14).
- PANTALLA: los efectos de cristal son una capa de la pantalla pensada para la cámara que mira (ref. 4, 5).

## Cómo se traduce a la escena (`escena/espejo/`)

Todo detrás del logo y de los títulos: cada efecto de pantalla se dibuja lejos (a la distancia de la trama), así lo opaco de adelante
lo tapa solo; y lee la PROFUNDIDAD del pase compartido para no tomar nunca un píxel del logo, del piso o de un título al refractar
(lo que no es fondo, no se toca). Sobre un texto se apaga (las cajas del texto, como el plasma). Monocromo; con
`?espejo-prisma=si`, un corrimiento de color mínimo en los filos.

| Efecto (`?espejo=`) | Qué se ve | Cómo | Costo |
|---|---|---|---|
| `cristal` · CRISTALIZAR | Una zona del fondo se parte en esquirlas de vidrio: cada una refracta lo de atrás con su desfase, gira apenas y después se cura (las esquirlas vuelven y los filos se borran) | La copia del cuadro leída por celdas de Voronoi en la pantalla (ref. 10): cada celda con su desfase, su giro y su retardo; el filo con la distancia exacta al borde (ref. 11) | La copia del cuadro + un cuadrado de la zona |
| `pliegue` · EL PLIEGUE | La trama del moiré (la cúpula) se dobla y se enrolla hacia adentro desde una altura, en un tramo de la vuelta, como la ciudad de la película; lento, monumental; y vuelve | Un doblez circular por vértices de los dos cilindros de la trama (ref. 9), con la normal girada; un parche más en su material | Nada (los vértices de la trama) |
| `caleidoscopio` · EL CALEIDOSCOPIO | Una zona del fondo se repite en espejo con simetría radial; las cuñas crecen de una a seis y giran | La copia del cuadro leída con el ángulo plegado (ref. 12) | La copia del cuadro + un cuadrado |
| `ecos` · LOS ECOS | Cuando el logo se mueve (la caída del principio, el encastre, el balanceo), copias suyas detrás, en abanico y espejadas, cada una con su atraso | La geometría del logo (la misma, sin tocar el logo ni su material) dibujada varias veces con su pose de hace un rato, girada en abanico y empujada hacia atrás, translúcida | Unas pocas copias del logo (sólo cuando se mueve) |
| `espiral` · LA ESPIRAL (la propia) | Una zona del fondo se enrolla hacia adentro de sí misma, como la galería de Escher, y se desenrolla | La copia del cuadro leída por el logaritmo complejo de la zona, girado y escalado (ref. 13) | La copia del cuadro + un cuadrado |

## Los disparos (`?espejo-disparo=`)

- `ambiente`: raro y lento: cada 18 a 30 s, uno, en un lugar del fondo libre (lejos del logo y de los textos).
- `scroll`: atado al scroll en ciertos tramos: entre secciones (al cruzar el borde de una, el efecto crece y se cura con el avance),
  nunca en el túnel de Trabajos (aprobado). Los bordes: Quiénes somos → Números y Tu panel → Por qué develOP (visto en el banco del
  sitio: encienden de y 2760 a 3600 y de 25680 a 26560 a 1440). Servicios → Tu panel se sacó: los dos son papel opaco y ahí la escena
  está en pausa.
- `mantener`: interactivo: mantener apretado sobre el fondo (no sobre un texto) hace crecer el efecto donde está el puntero; al soltar
  se cura. Convive con el gesto del plasma (cargar y descargar): el espejo empieza después de un rato apretado.
- Sin la bandera, `?espejo=…` usa `ambiente` (el banco los dispara a mano).

## Dónde va cada uno en el recorrido (propuesta, a confirmar con el banco)

- 01 · Hero: los ECOS en la caída del logo al cargar (su movimiento más grande).
- 02 · Quiénes somos y 03 · Números: el CRISTAL al cruzar de una a otra (atado al scroll), en el cielo detrás.
- 05 · Servicios: el PLIEGUE de la cúpula mientras la cámara gira (lento, una vez).
- 07 · Por qué develOP: la ESPIRAL en el fondo, atada al scroll (el porqué que se enrolla).
- El CALEIDOSCOPIO, el interactivo (mantener sobre el fondo).
- Fuera: 04 · Trabajos (el túnel), 06 · Tu panel (papel opaco), 08 · Cierre y el pie (el encastre).

## El cristal de fondo (PULIDO 19 · Q3)

El efecto `cristal` gustó y pasó a ser una CAPA FIJA del fondo (`escena/cristal/`): vidrio facetado siempre presente, solidario a la
cúpula del moiré, que refracta todo lo de atrás (el cielo, la fábrica de logos, el piso lejano). Lo que se investigó y de dónde sale
cada decisión:

- LA TRANSMISIÓN EN ESPACIO DE PANTALLA (luma.gl, «Glass effects»: https://luma.gl/docs/api-guide/shaders/glass-effects): el rayo
  refractado por Snell se proyecta en la base de la cámara y se lee una COPIA del color de la escena (nunca el destino que se está
  escribiendo); el espesor como profundidad del camino óptico; el Fresnel de Schlick derivado del índice; la dispersión como en
  `KHR_materials_dispersion` (20 / número de Abbe: el rojo con el índice más bajo, el azul con el más alto; el vidrio crown ~0,33);
  la absorción de Beer-Lambert por el color y el espesor. Nuestro cristal toma la transmisión barata: el rayo transmitido cae a
  `fondo` u detrás del vidrio y ahí se lee la copia compartida del cuadro (una por cuadro, la del pase: `escena/pase/`), con tope de
  corrimiento; la dispersión queda en el prisma (`?espejo-prisma=si`) y la absorción no hace falta (el vidrio es incoloro).
- EL VIDRIO FACETADO: no hay una fuente que combine facetas de Voronoi con normales por faceta y bisel; se arma a mano: las celdas en
  las coordenadas del cilindro (alrededor y en alto; justas alrededor: sin costura), la distancia EXACTA al borde por las bisectrices
  (Quílez, como el `cristal` de P2), la normal del cilindro inclinada por faceta y GIRADA hacia el borde en el bisel (ahí el brillo
  especular corre con la luz y la cámara), y los bordes suavizados con `fwidth` (sin parpadeo ni temblor; el patrón vive en la cúpula
  y las semillas derivan muy lento).
- EL REFLEJO Y EL BRILLO: Schlick (`F0 + (1 − F0)(1 − cos θ)^5`) para el reflejo tenue del entorno (el cielo por la altura del
  reflejo: no hay mapa de entorno) y Blinn-Phong con la luz principal de la sala (la que sigue el azimut de la cámara) para los
  cantos; de día la talla oscurece apenas el bisel (sobre el papel un brillo blanco no se ve).
- LO QUE SE DESCARTÓ: `MeshTransmissionMaterial` (drei) y los materiales de transmisión de three (https://drei.docs.pmnd.rs/shaders/mesh-transmission-material):
  piden OTRA pasada de la escena por material (con rugosidad, a baja resolución) y una geometría de vidrio; acá el vidrio es una
  pasada de pantalla sobre la copia que ya existe. La refracción por dos caras (Codrops, «Real-time multiside refraction»:
  https://tympanus.net/codrops/?p=44326, las normales del dorso en otra pasada) sobra para una capa delgada pegada a la cúpula.
- DÓNDE: todo el recorrido salvo el túnel de Trabajos y Tu panel (papel opaco), con un fundido; se va con la cámara del final.
  Sólo el FONDO (lo opaco más lejos que el vidrio, por la profundidad del pase, también al leer) y sobre un texto, apenas: el DOM
  nunca se toca (el antialias de los textos es del navegador).

## Las esquirlas (PULIDO 20 · R2)

El cristal de celdas de PULIDO 19 se borró (no gustó: plano y parejo; y tenía cuatro defectos: el log de PULIDO 20). En su lugar, la foto de
Dr. Strange: grandes esquirlas de vidrio facetado a distintas profundidades, con cantos filosos que atrapan la luz, que refractan lo de
atrás y con un filo de dispersión. Cómo se hizo, en una línea por idea:
- **Geometría real, pocos polígonos:** cada esquirla es el casco convexo de un contorno filoso (el canto), el mismo contorno metido hacia
  adentro arriba y abajo (los biseles) y una cresta que quiebra cada cara en facetas: normales planas (un vidrio tallado, no liso).
- **Refracción de sólo el fondo:** como `MeshTransmissionMaterial` de drei (que dibuja la escena sin el objeto en un búfer y lo lee
  desviado), pero el búfer tiene SÓLO lo de atrás (una capa: el cielo, la trama, la fábrica de logos, las estrellas): nada de lo de adelante
  puede aparecer doblado. A media resolución (la refracción ablanda igual). La desviación, en espacio de pantalla: dónde cae el rayo
  refractado (Snell, índice 1,5) a 14 u detrás contra dónde caería derecho.
- **Nunca estira:** si la lectura cae fuera del búfer, la esquirla se desvanece ahí (no se acota la coordenada: eso repetía el borde).
- **Fresnel de Schlick** (F0 0,04) con un reflejo tenue del cielo por la altura del rayo reflejado; **brillo especular** Blinn-Phong de la luz
  principal de la sala en las facetas (centellea al moverse la cámara); **el canto**: de día se oscurece (la reflexión total en el borde
  de un vidrio sobre papel), de noche toma la luz.
- **Dispersión** (`?espejo-prisma=si`): cada canal con su índice (±0,03, el doble en los cantos): el filo de arcoíris.
- **Dónde:** en un anillo contra el domo y sólo en el borde del cuadro (fuera de una elipse central, lejos de la cámara, de las cajas de la
  barra y los textos y del logo): paralaje de verdad, nunca detrás de un texto.
- **Sin temblor:** la cámara de este cuadro (al día antes de leerla) y el giro y la respiración de cada esquirla, función del reloj.


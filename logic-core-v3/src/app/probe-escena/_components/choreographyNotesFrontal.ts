import type { KeyframeNotes } from './choreographyNotes'

/**
 * COMENTARIOS DEL ARRAY · primera mitad del recorrido.
 *
 * De `entrada · mirada alta` a `números · sostén`: **el medio recorrido frontal**,
 * donde la cámara vive en azimut 0 y lo que cambia es la altura, la distancia y
 * el encuadre. Todo lo que gira está en la otra mitad.
 *
 * La partición es por tamaño —el archivo pasaba de 500 líneas— pero el corte no
 * es arbitrario: cae exactamente donde el recorrido cambia de naturaleza. Las
 * dos mitades se vuelven a unir en `choreographyNotes.ts`, que es el único
 * lugar del que el exportador lee.
 *
 * ⚠️ La regla de siempre: **estos textos son la FUENTE de los `//` que están
 * adentro de `CHOREO_KEYFRAMES`.** El export los regenera; cambiar un
 * comentario allá y no acá se pierde en el próximo pegado.
 */
export const NOTES_FRONTAL: KeyframeNotes = {
  'entrada · mirada alta': [
    'Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado.',
    '',
    'Hasta S5 este keyframe llevaba `keyIntensity: 0` adentro de su pose, o sea',
    'que el recorrido arrancaba literalmente a oscuras y subía la luz en la',
    'primera transición. Nadie diseñó eso: es lo que queda cuando se compone una',
    'posición con el slider de luz en el piso. La luz ya no vive en la pose.',
  ],

  'hero · arco de bajada': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    'La bajada del hero era una RECTA: la cámara caía 9 de altura y se acercaba 4',
    'sobre la línea que une las dos poses. Este intermedio la saca de esa línea:',
    'se corre 7° de azimut y **se queda lejos** (15,4 contra los 15 de arranque)',
    'mientras baja, así que el acercamiento resuelve al final en vez de repartirse',
    'parejo. El camino se desvía **2,77 de mundo** de la recta — 0,57 alturas de',
    'cuadro, o sea medio cuadro de excursión.',
    '',
    '`linear` y no `shift`: la bajada es UNA gesticulación y este punto vive',
    'adentro. Con `shift` la cámara se frenaría en el medio del descenso.',
    '',
    'Ninguna pose del humano se tocó: el arco va ENTRE las dos.',
  ],

  hero: [
    '`arrive` — la curva del sistema para lo que ENTRA. El descenso desde 9,00',
    'aterriza en el encuadre del hero, no lo cruza, y se acerca de 15 a 11',
    'mientras baja.',
  ],

  'hero · sostén': [
    'El patrón de sostén: misma pose que el keyframe anterior, más adelante en el',
    'recorrido. La cámara LLEGA al hero en 0,125 y se queda quieta hasta 0,188,',
    'así que el encuadre se puede leer en vez de cruzarse. Es el arreglo del',
    'pendiente №1 de S4 ("la pose de cada tramo cae en su borde") y se hace con el',
    'botón "duplicar" del editor.',
  ],

  'quiénes somos · arco de entrada': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    'Entre el sostén del hero y la persona 1 la cámara subía 5, se acercaba 2 y',
    'barría el logo de un lado al otro de la pantalla, todo sobre una recta. Acá',
    'el gesto se ordena en dos tiempos: **primero sube** (3,40 de 5,00) y **se',
    'mantiene lejos** (10,70), y recién después el logo cruza. El `frameX` queda',
    'en 0,30 —todavía a la derecha— para que el barrido no arranque hasta que la',
    'cámara ya se levantó.',
    '',
    'Desvío de la recta: 1,39 de mundo. Es el más chico de los siete, y tiene por',
    'qué: acá la excursión que importa es la de TIEMPO, no la de espacio.',
    '',
    '`shift`: el intermedio ES un beat. La cámara se demora arriba antes del',
    'cruce, que es lo que la referencia hace y este recorrido no hacía.',
  ],

  'quiénes somos · persona 1': [
    '"baja el encuadre horizontal, sube el vertical y se acerca al logo, TODO',
    'AL MISMO TIEMPO" — una sola transición, sin intermedios.',
    '',
    'La ambigüedad de "el vertical" quedó resuelta al calibrar, y a favor de la',
    'ALTURA DE CÁMARA: `frameY` está en cero en todo el recorrido. No es un',
    'olvido — ver la nota de `demos · giro ½` sobre por qué ese canal casi no',
    'tiene efecto a las distancias que este recorrido usa.',
  ],

  'quiénes somos · persona 1 · sostén': [
    'Sostén de verdad: pose idéntica a la anterior. Se llega y se aguanta.',
  ],

  'persona 2 · cruce (apex)': [
    '═══ DERIVADO ═══',
    '',
    '"sube el vertical, sube el horizontal, y LUEGO vuelve a bajar el',
    'vertical". Ese "luego" pide un intermedio que las capturas no tienen.',
    '',
    'Lo que hace es el **cruce**: `frameX` barre de −0,80 a +0,80 —el logo cruza',
    'la pantalla entera de izquierda a derecha, que es lo que deja lugar para la',
    'segunda persona— y acá va por el medio, en −0,16. La altura hace una',
    'excursión chica hacia abajo (5,00 → 4,54 → 5,00) y la distancia una hacia',
    'afuera (9,00 → 10,70 → 9,00): la cámara se abre un poco en el cruce y vuelve.',
    'Es lo que impide que el barrido se lea como un desplazamiento plano.',
    '',
    '**Los cinco números son interpolación, no captura.** Para matar la excursión',
    'de altura, poner 5; para la de distancia, poner 9. Un número cada una.',
  ],

  'quiénes somos · persona 2 · sostén': [
    '⚠️ **Se llama "sostén" pero NO sostiene.** Salió del botón duplicar y después',
    'se le movió la pose: la altura baja de 5,00 a 2,65, la distancia se abre a',
    '9,83 y el encuadre vuelve del borde (0,80 → 0,57). Es un beat propio —el',
    'arranque del descenso a Números— con el nombre que le quedó del duplicado.',
    '',
    'Es además el segmento más rápido del primer medio recorrido: 28,0 alturas de',
    'cuadro por unidad de progreso. Renombrarlo son dos strings (acá y en',
    '`choreography.ts`); se deja como está para no romper la referencia del video',
    'ya grabado.',
  ],

  'números · arco de caída': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    'La caída a Números era el tramo recto más largo de la primera mitad: 6,5 de',
    'altura en línea, con la distancia apenas moviéndose. Acá la caída **se abre',
    'hacia afuera** (9,83 → 10,60 → 9,00) y **se demora arriba**: la altura queda',
    'en 0,10 cuando la recta ya la habría llevado a −0,75. La cámara se aleja un',
    'paso, se cuelga, y recién ahí se desploma.',
    '',
    'El azimut NO se toca y es deliberado: Números es la pantalla frontal del',
    'recorrido —todo el tramo vive en 0°— y un barrido lateral rompería esa',
    'frontalidad. Acá la curvatura es de altura y distancia, no de ángulo.',
    '',
    'Desvío de la recta: 1,08. Es el más chico de los siete en espacio, y el que',
    'más cambia el TIEMPO del gesto.',
  ],

  'números · baja la altura': [
    '═══ DERIVADO ═══',
    '',
    '"reduce altura, aumenta distancia (EN ESE ORDEN, SECUENCIAL)". Secuencial',
    '= un keyframe en el medio: la altura ya abajo, con la distancia todavía sin',
    'abrir.',
    '',
    'Al calibrar, la altura de este keyframe bajó hasta **−3,90, el piso del',
    'rango**: la cámara rasa el papel. Es la pose más baja del recorrido junto con',
    'las tres de Demos.',
    '',
    '── S6 · 1: `linear` → `shift` ─────────────────────────────────────────',
    '',
    'Con `linear` la cámara llegaba al fondo a velocidad plena y el keyframe',
    'siguiente la frenaba de golpe. `linear` es para los waypoints que viven',
    'ADENTRO de una gesticulación, y éste no lo es: la propia descripción dice',
    'SECUENCIAL, o sea que acá TERMINA el "baja la altura" y recién entonces',
    'arranca el "se aleja". Un final de gesto pide una curva de llegada.',
    '',
    '── S6 · 2: `at` 0,464 → 0,445 ─────────────────────────────────────────',
    '',
    'Éste es el arreglo del tirón, y hay que medirlo en **alturas de cuadro** —',
    'cuánto se mueve y cuánto cambia de tamaño el objeto EN PANTALLA, que es la',
    'única unidad en la que una bajada y un alejamiento se comparan.',
    '',
    'Los tres beats de la pantalla de Números corrían a **17,9 / 47,4 / 19,3** por',
    'unidad de progreso: el del medio —bajar a −3,90 y volver a subir a 1,00 en',
    '0,024 de progreso— iba a **más del doble** que sus dos vecinos. Eso es el',
    'tirón, y se lee como un rebote.',
    '',
    'Con los `at` en 0,445 y 0,491 quedan en **24,7 / 24,7 / 25,8**, o sea una',
    'dispersión del 4,5% contra el 105% que había. **La pantalla dura exactamente',
    'lo mismo y ninguna pose se tocó**: lo único que cambió es cuánto le toca a',
    'cada beat.',
  ],

  'números · sube y se aleja': [
    '── S6: renombrado, y el `at` 0,488 → 0,491 ────────────────────────────',
    '',
    'ANTES se llamaba `números · se aleja`, y el nombre mentía: de −3,90 a 1,00',
    'son 4,90 de altura contra 2,00 de distancia. Medido en pantalla, la subida',
    'pesa **más del triple** que el alejamiento. Un keyframe que dice una cosa y',
    'hace otra es la clase de dato que después nadie se anima a tocar.',
    '',
    'El movimiento no cambió — cambió el nombre, que ahora dice las dos cosas en',
    'el orden en que pesan. El `at` es la otra mitad del arreglo del tirón, y está',
    'explicado en el keyframe anterior.',
  ],

  números: [
    '"y luego vuelve a subir altura y a acercarse".',
    '',
    'Ojo con esa frase, porque el dato calibrado la reparte distinto: la subida de',
    'altura ya ocurrió en el keyframe anterior, acá la cámara **se sigue alejando**',
    '(11,0 → 14,1) y el acercarse llega recién en el sostén (14,1 → 12,0). El',
    'gesto descrito existe, pero repartido en tres keyframes y no en uno.',
  ],

  'números · deriva en arco': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    '**Este arreglo el segmento más lento de todo el recorrido.** De `números` a',
    'su sostén la cámara derivaba en línea recta a 4,5 alturas de cuadro por',
    'unidad de progreso, contra las 12 a 31 del resto del track: una pantalla',
    'entera de deriva plana.',
    '',
    'Ahora el camino pasa **por arriba**: sube a 2,00 (por encima de sus dos',
    'extremos, que están en 1,00 y 0,00) y se abre a 14,60 (por encima de 14,10 y',
    'de 12,00), con 4° de barrido lateral que vuelven a cero. Es un arco de verdad',
    '—la cámara sale de la recta por los dos canales a la vez— y el tramo pasa de',
    'un pico de 12,0 a uno de 34,0.',
    '',
    '`linear`: la deriva es una sola gesticulación lenta y no quiere un beat en el',
    'medio.',
  ],

  'números · sostén': [
    '⚠️ **Otro que se llama "sostén" y no sostiene**: baja la altura a 0 y se',
    'acerca a 12. Además vive en 0,563, o sea DENTRO de la pantalla de Portfolio y',
    'no de la de Números. Las dos cosas son deliberadas —es el cierre del gesto de',
    'Números derramándose en la pantalla siguiente— pero se leen mal desde el',
    'nombre.',
  ],

  'portfolio · arco de aproximación': [
    '═══ DERIVADO · S7 · curvatura ═══',
    '',
    '**Es el intermedio que más desvía el camino: 3,03 de mundo, 0,82 alturas de',
    'cuadro.** Y va en el segmento más cargado del recorrido fuera de Demos.',
    '',
    'El "acercamiento diagonal" era una recta que hacía las tres cosas repartidas',
    'parejo. Acá la cámara **toma la curva por afuera**: el ángulo se ADELANTA (27',
    'de 45 cuando la recta daría 24), la distancia se SOSTIENE (11,00 cuando la',
    'recta ya iría por 9,50) y la altura LLEGA TARDE (1,90 contra 3,20). O sea:',
    'primero gira quedándose lejos, y recién sobre el final se mete y sube.',
    '',
    'Es el mismo movimiento con otra forma. La pose de `portfolio` no se tocó.',
  ],
}

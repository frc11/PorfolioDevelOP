/**
 * EL RECIBO DE MOVIL-1 — las DOS cifras que deja bajar la escena abajo de 1025,
 * y por qué son dos y no una.
 *
 * ── ⚠️ LA DISTINCIÓN QUE HACE QUE ESTE RECIBO TENGA DOS RENGLONES ─────────
 *
 * «Cuánto pesa» tiene dos respuestas acá, y confundirlas es lo que haría que
 * este montaje pareciera gratis o que pareciera catastrófico, según cuál se
 * cite:
 *
 *   1. **LO QUE /v3 ESCRIBE EN SU CARGA INICIAL** — los `<script src>` del HTML
 *      prerenderizado. Es lo que el techo de 60 KiB del lane gobierna y lo que
 *      `s5-peso` afirma. **Subió 31,0 B**, y esa es la línea que se le suma al
 *      techo, con la convención de siempre.
 *   2. **LO QUE UN TELÉFONO DESCARGA AL ABRIR LA PÁGINA** — la carga inicial
 *      MÁS lo que el `import()` diferido pide después de hidratar. **Subió
 *      259,83 KiB**, y esto es lo que el sprint agrega de verdad a la persona
 *      que entra desde un teléfono.
 *
 * La segunda no estaba medida por ningún instrumento del repo, porque hasta este
 * sprint no existía: abajo de 1025 la compuerta no ejecutaba el `import()` y no
 * había nada diferido que contar. La primera es chiquita porque el chunk de la
 * escena **sigue siendo diferido**: lo que cambió es quién lo pide, no cómo.
 *
 * ── EL MÉTODO, para las dos ───────────────────────────────────────────────
 *
 * A/B entre **dos builds de producción del MISMO árbol en la MISMA máquina**,
 * con una sola variable. El «antes» se produjo devolviendo los cinco archivos de
 * producto a su contenido de `HEAD` con `git show HEAD:<ruta>` —nunca
 * `checkout`, nunca `stash`— y sacando del árbol los dos módulos nuevos; el
 * «después» se restauró desde una copia fuera del árbol y **se verificó byte a
 * byte con sha256 antes de construir**, que es la disciplina que B12 estrenó.
 *
 * Los cinco archivos del swap, con su sha256 del árbol «después»:
 *
 *     33a9d039…  _componentes/EscenarioCompuerta.tsx
 *     914fc42d…  _lib/escena/EscenaDelHome.tsx
 *     2f930da0…  _lib/escena/ProbeStage.tsx
 *     da67739f…  _lib/escena/configuracionDelCanvas.ts
 *     9515a907…  _lib/compuerta.ts
 *
 * ⚠️ **Y una trampa del swap que se pagó y queda escrita.** `git show HEAD:<f> >
 * <f>` **trunca el archivo ANTES de que git corra**: con la ruta mal escrita
 * —este worktree tiene el prefijo `logic-core-v3/` en el índice— los cinco
 * quedaron en cero bytes y el árbol de trabajo se perdió por un instante. Se
 * recuperó de la copia, con los sha256 coincidiendo. La forma correcta es
 * extraer a un archivo TEMPORAL primero y copiar después, que es lo que este
 * recibo hizo en el segundo intento.
 */

/** Lo que la carga inicial de /v3 creció. Es la línea que se le suma al techo. */
export const DESVIO_DE_MOVIL_BYTES = 31.0

/**
 * Las dos medidas del A/B, en bytes de lo que ESCRIBE el lane (crudo, sin el
 * preámbulo de Sentry y sin el andamio de la llave). Salen de la misma
 * afirmación de `s5-peso`, leída en los dos builds.
 */
export const ESCRITO_ANTES_BYTES = 66020.2
export const ESCRITO_DESPUES_BYTES = 66051.2

/**
 * LO QUE UN TELÉFONO DESCARGA — la otra cifra, y la que le importa a la persona.
 *
 * Medido con `scripts-movil/c-red.ts` a 390×844 con `deviceScaleFactor` 3 y **la
 * caché apagada**, sumando `transferSize` de la entrada de navegación más todos
 * los recursos.
 *
 * ⚠️ **La caché apagada no es un detalle: es un defecto que este banco cometió y
 * corrigió.** La primera corrida del «después» reusó el perfil de Chrome, la
 * hoja de estilos y las cuatro fuentes vinieron de caché con `transferSize` 0, y
 * el total **BAJÓ 79 KiB** entre dos árboles donde lo único que había pasado era
 * AGREGAR la escena. Con `Network.setCacheDisabled` cada corrida es una visita
 * fría, que es la pregunta que se está haciendo.
 */
export const DESCARGA_ANTES_BYTES = 556_802
export const DESCARGA_DESPUES_BYTES = 822_868
export const DESCARGA_DELTA_BYTES = 266_066

/**
 * El reparto del cuarto de mega, por chunk.
 *
 * ⚠️ **Seis de los pedidos cambiaron de hash sin cambiar de tamaño y NO cuentan**
 * —`7149` (142,4 KiB), el layout raíz (11,2), `webpack` (3,7), `main-app` (2,8),
 * el layout de v3 (2,3) y `5930` (1,1)—: son los mismos módulos con otro nombre
 * porque el build es otro. Restarlos es lo que hace que la suma de los renglones
 * de abajo dé exactamente el delta y no 433 KiB.
 */
export const RECIBOS_DE_LA_DESCARGA: readonly (readonly [string, number, string])[] = [
  ['chunks/bd904a5c', 100_385, 'el chunk más grande que baja: el grueso de `three`'],
  ['chunks/b536a0f1', 85_361, 'el resto del árbol de la escena'],
  ['chunks/b79b7286', 46_658, '`@react-three/fiber` y su reconciliador'],
  ['chunks/5234', 9_259, 'compartido de la escena'],
  ['chunks/7545', 8_179, 'compartido de la escena'],
  ['chunks/4857', 5_630, 'compartido de la escena'],
  ['chunks/2872', 4_845, 'compartido de la escena'],
  ['chunks/3659', 3_027, 'compartido de la escena'],
  ['chunks/6262', 1_804, 'compartido de la escena'],
  ['logodevelOP.svg', 896, 'el SVG que la escena EXTRUYE — no es un chunk, es el activo del logo'],
  ['los 7 rehasheados, netos', 22, 'de los cuales +24 B son el chunk del layout de /v3, o sea la compuerta misma'],
]

/** La suma de los renglones ES el delta, sin residuo. Se afirma en `s5-peso`. */
export const DESCARGA_REPARTIDA_BYTES = RECIBOS_DE_LA_DESCARGA.reduce((n, r) => n + r[1], 0)

/**
 * ⚠️ **POR QUÉ ESTA CIFRA NO SE LE SUMA AL TECHO DEL LANE, Y NO ES UNA
 * ESCAPATORIA.**
 *
 * El techo de 60 KiB gobierna **lo que /v3 escribe en su carga inicial**. Meterle
 * 259,83 KiB lo llevaría a 324 KiB contra ~64,5 KiB escritos: el gate quedaría
 * con 260 KiB de aire y **dejaría de poder fallar**. Un presupuesto que no puede
 * ponerse en rojo no es un presupuesto.
 *
 * Es exactamente la forma que B12 §4 le dio al peso de la llave: una línea con
 * nombre, con su recibo, que se PUBLICA en cada corrida y se resta aparte. La
 * diferencia con la llave es que aquélla era andamio y ésta es producto — así
 * que no se va a ir sola, y el día que alguien quiera bajarla, la palanca está
 * medida y escrita arriba.
 *
 * **La instrucción del sprint dice que el dueño aprobó que el presupuesto suba.
 * Lo que sube es el techo del lane, en 0,04 KiB, que es lo que este cambio
 * agrega a lo que el techo mide.** La cifra grande queda publicada al lado, sin
 * techo propio todavía, porque fijarle uno es una decisión del dueño que este
 * sprint no tiene tomada: son 259,83 KiB que ANTES ya se descargaban arriba de
 * 1025 y que ahora se descargan también abajo.
 */
export const RAZON_DE_NO_SUMARLA_AL_TECHO =
  'el techo mide la carga inicial; esto es descarga diferida. Sumarlo le daría 260 KiB de aire y el gate dejaría de poder fallar.'

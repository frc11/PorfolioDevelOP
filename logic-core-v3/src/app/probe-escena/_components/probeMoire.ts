import { clamp01 } from './probeScene'

/**
 * LA PANTALLA DE RENDIJAS Y EL MOIRÉ (S7) — el fondo con vida.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * DOS TRAMAS, UNA SUPERFICIE, UN DRAW CALL
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El moiré es la interferencia entre dos patrones periódicos de paso parecido:
 * donde coinciden se refuerzan, donde se desfasan se cancelan, y el resultado es
 * una banda ancha que se mueve mucho más rápido que cualquiera de los dos. Es
 * hipnótico, es viejo como la imprenta, y **cuesta casi nada**: acá son dos
 * texturas chicas sobre un cilindro de 128 triángulos.
 *
 * Las dos tramas salen del vocabulario propio del sitio, no de una referencia:
 *
 * - **La fija — el campo de puntos.** Es el patrón de develOP: la retícula de
 *   `DotMatrix` que está hoy en el intro y en las pantallas de auth. Va en `map`
 *   y no se mueve.
 * - **La que se desplaza — las rendijas.** Una trama de barras verticales, que
 *   va en `alphaMap` y **deriva lentamente alrededor del cilindro**. Es la capa
 *   que produce el batido.
 *
 * ── Por qué caben en un solo material ──────────────────────────────────────
 *
 * Porque en three 0.182 cada ranura de textura tiene **su propia matriz de UV**
 * (`mapTransform` y `alphaMapTransform`, con sus varyings `vMapUv` y
 * `vAlphaMapUv`). O sea que `map` y `alphaMap` pueden tener repeticiones y
 * desplazamientos distintos sobre la misma geometría, que es exactamente lo que
 * dos capas de trama necesitan. Sin eso harían falta dos mallas transparentes
 * superpuestas: el doble de overdraw y un problema de orden entre ellas.
 *
 * ── Los números, y de dónde salen ──────────────────────────────────────────
 *
 * Sobre un cilindro de radio 38 (circunferencia 238,8):
 *
 * | | paso de mundo | por qué |
 * |---|---:|---|
 * | 180 rendijas | 1,326 | fina pero muy por encima del muestreo (ver abajo) |
 * | 196 columnas de puntos | 1,218 | apenas más apretada: de ahí sale el batido |
 * | batido = 196 − 180 = **16 bandas** | 14,92 | ~3,5 bandas a lo ancho del cuadro |
 *
 * **La banda de batido es 11 veces más gruesa que cualquiera de las dos tramas,
 * y ésa es la parte que se ve.**
 *
 * ── EL ALIASING, que es el riesgo real y está medido ───────────────────────
 *
 * Una trama fina en movimiento es el caso clásico de titileo: si el período cae
 * por debajo de dos píxeles, el muestreo inventa un patrón que no existe. Se
 * barrió el recorrido entero (800 puntos, rayos hasta el borde del cuadro,
 * incluyendo los que pegan de refilón, que es donde el período proyectado se
 * derrumba):
 *
 * - mediana del recorrido: **42 a 50 píxeles** por período de rendija (1920×1080)
 * - **peor caso de todo el track: 29,4 px**, con 39° de incidencia, en p≈0,445
 * - Nyquist: 2 px
 *
 * **Quince veces de margen.** Encima van mipmaps y anisotropía, que cubren
 * ventanas chicas y DPR alto sin costar nada en el caso normal. Y la parte de la
 * señal que podría aliasear —la trama fina— es justamente la que el mipmap
 * promedia a gris; la que se ve —el batido— es de baja frecuencia por
 * construcción y no puede aliasear.
 *
 * ── Por qué el tono es OSCURO y la opacidad baja ───────────────────────────
 *
 * Si la pantalla fuera del color del papel, su valor coincidiría con el del
 * ciclorama que tiene detrás y la trama no se vería: dos superficies del mismo
 * material a la misma luz dan el mismo número. Peor: se vería en la mitad de la
 * sala que está a contraluz y desaparecería en la otra mitad, que es lo que
 * pasa cuando el contraste depende de la luz y no del material.
 *
 * Con un tono oscuro la trama modula **~15% sobre el fondo en los dos lados**,
 * porque el contraste lo pone el material y no la iluminación. La opacidad baja
 * es lo que la mantiene en el registro de velo y no de reja: la escena no puede
 * ganar un elemento que le dispute el cuadro al logo.
 *
 * ── Lo que se dejó afuera, dicho en voz alta ───────────────────────────────
 *
 * El sprint nombra cuatro patrones propios: retículas curvas, líneas de
 * circuito, tramas diagonales y campos de puntos.
 *
 * - **Las líneas de circuito NO entran.** Son iconografía de tecnología, y eso
 *   está prohibido por la regla del propio sprint y por la dirección de arte del
 *   proyecto. Que el sprint las nombre no las habilita.
 * - **Las retículas curvas ya están en la escena**: el ciclorama es una y la
 *   retícula aérea es otra. No hacía falta agregarlas.
 * - **Las tramas diagonales** quedan como perilla: es el ángulo entre las dos
 *   capas, y hoy es cero. Ver `MOIRE_SLAT_SLANT`.
 */

// ── La pantalla ─────────────────────────────────────────────────────────────

/**
 * Radio del cilindro.
 *
 * 38 es el número que resuelve tres restricciones a la vez:
 *
 * - **Más lejos que cualquier cámara.** El recorrido llega a 16 y el slider
 *   manual a 30, así que la pantalla nunca puede meterse entre la cámara y el
 *   logo — que es la regla de composición que ordena la escena entera.
 * - **Más lejos que los planos suspendidos** (radio máximo 22), así que ellos
 *   se leen contra ella y no al revés.
 * - **Más cerca que el ciclorama** (la pared arranca en 76), y por bastante: la
 *   niebla a 46 unidades vela un 10%, contra el 40% que le toca a la pared. Esa
 *   diferencia de velo es la que separa las dos superficies sin una sola luz de
 *   por medio.
 */
export const MOIRE_RADIUS = 38
/** Segmentos radiales. 96 sobre un radio de 38 dan una faceta de 2,5 de mundo. */
export const MOIRE_SEGMENTS = 96

/**
 * La banda: desde apenas sobre el piso hasta bien arriba.
 *
 * El borde inferior arranca casi al ras del papel (la losa termina en radio 34 y
 * la cove sube 0,19 a la altura de la pantalla) para que la pantalla se APOYE en
 * el suelo: una banda flotando tendría un borde inferior en el aire y se leería
 * como una cinta, no como un biombo. El superior llega a 34 porque en el punto
 * más bajo del recorrido el borde de arriba del cuadro barre hasta unas 39
 * unidades de altura sobre la pantalla.
 *
 * Los dos bordes se disuelven con la envolvente vertical de la trama de
 * rendijas (ver `createSlatSpriteData`), así que no hay una línea que los marque.
 */
export const MOIRE_BOTTOM = -4
export const MOIRE_TOP = 34

/** Cuántas rendijas dan la vuelta. La capa que se desplaza. */
export const MOIRE_SLATS = 180
/** Cuántas columnas de puntos dan la vuelta. La capa fija. */
export const MOIRE_DOT_COLUMNS = 196
/**
 * Filas de puntos a lo alto de la banda. Sale de que el paso vertical iguale al
 * horizontal: (34 − (−4)) / (238,8/196) = 31,2 → 31. Con otro número los puntos
 * salen elípticos.
 */
export const MOIRE_DOT_ROWS = 31

/**
 * Ancho de la rendija ABIERTA, como fracción del período. 0,5 sería una trama
 * simétrica; por debajo, la barra pesa más que el hueco y el batido gana
 * contraste.
 */
export const MOIRE_SLAT_DUTY = 0.42
/** Radio del punto, como fracción del medio paso. */
export const MOIRE_DOT_RADIUS = 0.34

/**
 * Inclinación de las rendijas, en ciclos de desplazamiento sobre el alto de la
 * banda. **Hoy 0: las rendijas son verticales.**
 *
 * Es la perilla de la "trama diagonal". Con 1 la rendija se corre un período
 * entero de abajo hacia arriba, o sea unos 2° de inclinación aparente; el moiré
 * pasa de bandas verticales a bandas inclinadas que barren en diagonal. Se deja
 * en cero porque una capa más de dirección, sobre una escena que ya tiene
 * retícula, cotas y planos inclinados, es exactamente el tipo de cosa que
 * satura. Subirlo es un número.
 */
export const MOIRE_SLAT_SLANT = 0

/**
 * Segundos que tarda la trama de rendijas en correrse UN período completo.
 *
 * El número que importa no es ése sino el que sale de él: las rendijas se mueven
 * a ~5 px/s —imperceptible— y **las bandas de batido a ~74 px/s**, o sea unas
 * quince veces más rápido. Ese es todo el truco del moiré: el patrón se mueve
 * mucho más que sus capas.
 *
 * 7,4 s es inconmensurable con los otros períodos de la escena (la vira en 13 y
 * 9,5, la deriva del polvo en 17, la del bokeh en 11,5), así que nada se
 * sincroniza con nada y el conjunto no se lee como un bucle.
 */
export const MOIRE_DRIFT_PERIOD_S = 7.4

/**
 * Tono y densidad. Ver la nota de arriba sobre por qué oscuro y por qué poco.
 *
 * `MOIRE_OPACITY` multiplica al alfa de la trama, así que es el techo: 0,32
 * quiere decir que ni el punto más cerrado de la rendija tapa más de un tercio
 * de lo que hay detrás. Es la primera perilla si al mirarlo la escena se siente
 * cargada.
 */
export const MOIRE_COLOR = '#57575A'
export const MOIRE_OPACITY = 0.32

export const MOIRE_SLAT_TEXTURE = 128
export const MOIRE_DOT_TEXTURE = 64

// ── Las dos tramas ──────────────────────────────────────────────────────────

/**
 * LA TRAMA DE RENDIJAS — la capa que se mueve. Va en `alphaMap`.
 *
 * Dos ejes con trabajos distintos:
 *
 * - **horizontal (u): la rendija.** Una onda con meseta y flancos suaves, no un
 *   escalón. Un escalón duro tiene armónicos hasta el infinito y son ellos los
 *   que aliasean; con los flancos suavizados sobre unos téxeles, la trama
 *   degrada a gris parejo en vez de titilar cuando el mipmap la achica.
 * - **vertical (v): la envolvente de la banda.** Sube de 0 a 1 en el cuarto
 *   inferior y vuelve a 0 en el cuarto superior, así que la pantalla **no tiene
 *   bordes**: se desvanece por arriba y por abajo en vez de terminar en una
 *   línea.
 *
 * three lee el alfa del canal VERDE de esta textura (`alphamap_fragment`), así
 * que los tres canales se escriben iguales.
 *
 * Pura: puede vivir en un `useMemo` sin violar `react-hooks/purity`.
 */
export function createSlatSpriteData(
  size: number,
  duty: number,
  slant: number
): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  // Flanco de dos téxeles a cada lado de la barra.
  const edge = 2 / size

  for (let y = 0; y < size; y += 1) {
    const v = (y + 0.5) / size
    // Envolvente vertical: 0 → 1 en el primer cuarto, 1 → 0 en el último.
    const envelope = Math.min(clamp01(v / 0.25), clamp01((1 - v) / 0.25))
    // Suavizado de la envolvente, para que no tenga codo en el cuarto.
    const fade = envelope * envelope * (3 - 2 * envelope)

    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size + slant * v
      const phase = u - Math.floor(u)
      // Distancia al centro de la barra, en fracción de período.
      const fromCenter = Math.abs(phase - 0.5)
      const half = duty / 2
      // 1 adentro de la barra, 0 afuera, con flanco suave de `edge`.
      const bar = clamp01((half + edge - fromCenter) / (2 * edge))

      const alpha = bar * fade
      const i = (y * size + x) * 4
      const value = Math.round(clamp01(alpha) * 255)
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }

  return data
}

/**
 * EL CAMPO DE PUNTOS — la capa fija. Va en `map`, o sea aporta el TONO.
 *
 * Un punto por celda, con borde suave por la misma razón que la rendija: los
 * bordes duros son los que aliasean. Blanco donde no hay punto (el material
 * queda en su color) y oscuro donde sí, así que multiplicado por
 * `MOIRE_COLOR` da la retícula sobre el propio tono de la pantalla.
 *
 * Es la trama de `DotMatrix`, el patrón que el sitio ya usa. No es una
 * referencia importada: es el vocabulario propio, puesto donde se mueve.
 */
export function createDotFieldData(size: number, radius: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const half = size / 2
  const edge = 1.5 / half

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / half
      const dy = (y - center) / half
      const distance = Math.sqrt(dx * dx + dy * dy)
      const dot = clamp01((radius + edge - distance) / (2 * edge))
      // 1 = sin punto (queda el color del material), 0,25 = el punto.
      const value = Math.round((1 - dot * 0.75) * 255)

      const i = (y * size + x) * 4
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }

  return data
}

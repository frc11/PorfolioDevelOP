import { clamp01 } from './probeScene'

/**
 * LAS PARTÍCULAS (S6) — los dos campos y los tres generadores de sprite.
 *
 * Salieron de `probeScene.ts` cuando S6 los rediseñó: dejaron de ser dos bloques
 * de constantes para ser el archivo donde vive una decisión —**pocas y grandes
 * en vez de muchas y chicas**— con las cuentas que la sostienen.
 *
 * Los tres generadores de máscara viven acá juntos porque son la misma técnica
 * con tres perfiles distintos, y porque los tres tienen que ser **puros**: se
 * llaman desde un `useMemo` y `react-hooks/purity` no perdona un efecto ahí
 * adentro. El PRNG sembrado está por lo mismo, más una razón propia: un campo de
 * partículas irrepetible haría incomparables dos capturas del mismo ángulo.
 */

// ── Las partículas ─────────────────────────────────────────────────────────

/**
 * ── EL CAMPO DE POLVO, REDISEÑADO EN S6 ────────────────────────────────────
 *
 * **De 4.000 puntos de 0,055 a 400 de 0,19.** Una décima parte de las
 * partículas, cada una tres veces y media más grande.
 *
 * El motivo es de lectura, no de costo: a 0,055 de tamaño, una partícula a
 * distancia media ocupaba **2,5 píxeles**. Cuatro mil cosas de dos píxeles no se
 * leen como polvo suspendido, se leen como ruido de compresión — y encima
 * titilan al mover la cámara, porque a ese tamaño el muestreo manda. A 0,19 la
 * misma partícula ocupa **8,5 píxeles** a media distancia y 17 de cerca: ya es
 * un objeto, con su borde suave y su tamaño propio.
 *
 * La cuenta de fill queda parecida (400 × 0,19² contra 4.000 × 0,055², o sea
 * 14,4 contra 12,1 en área total), así que lo que cambia es qué se ve, no qué
 * cuesta. Y bajan diez veces los vértices.
 *
 * Se reserva el buffer del máximo una sola vez y el slider mueve el
 * `drawRange`: cambiar la cantidad no reasigna ni recalcula nada.
 */
export const PARTICLES_MAX = 400
/**
 * Media esfera de radio `PARTICLE_R_MIN..PARTICLE_R_MAX` alrededor del logo,
 * recortada por el papel. El mínimo deja libre el volumen del logo; el máximo
 * pasa la órbita más lejana (30), así que siempre hay partículas MÁS CERCA y
 * MÁS LEJOS que la cámara — que es la condición para que haya paralaje real
 * entre ellas y no una calcomanía de fondo.
 */
export const PARTICLE_R_MIN = 5
export const PARTICLE_R_MAX = 34
export const PARTICLE_SIZE = 0.19
/**
 * Cerca oscuras, lejos claras: perspectiva atmosférica sobre papel blanco.
 *
 * S6 abrió el rango en los dos extremos (era `#6E6E6B` → `#C9C9C6`). Con menos
 * partículas, cada una tiene que llevar más información de profundidad: la
 * cercana ahora es netamente oscura y la lejana casi se disuelve en el papel, y
 * ese degradé por distancia es lo que hace que el campo se lea como volumen y
 * no como una nube de puntos del mismo tono.
 */
export const PARTICLE_NEAR_COLOR = '#5A5A57'
export const PARTICLE_FAR_COLOR = '#DCDCD9'
/** Semilla fija: el campo es idéntico en cada carga, así dos capturas se comparan. */
export const PARTICLE_SEED = 0x5eed1a

// ── La segunda escala de partículas (S4) ────────────────────────────────────

/**
 * Pocas partículas **grandes y desenfocadas**, cerca de la cámara. El desenfoque
 * es lo que más profundidad da por menos polígonos: no hay forma más barata de
 * decirle al ojo "esto está adelante del plano de foco" que un disco blando.
 *
 * **Van fijas al mundo, no pegadas a la cámara.** Pegadas al lente serían una
 * calcomanía que no se mueve: fijas al mundo barren rápido al orbitar, que es
 * de dónde sale la sensación de volumen.
 *
 * El §7.8 del reporte del probe anotaba como defecto que "a distancias cortas
 * alguna partícula pasa a menos de dos unidades de la cámara y se lee como un
 * disco grande". **Acá eso es el efecto, deliberado.**
 *
 * ── S6: menos y más grandes ────────────────────────────────────────────────
 *
 * **De 70 sprites de tamaño 1,0 a 30 de 1,5.** La referencia tiene pocas
 * partículas y cada una se ve; setenta discos tenues son una veladura pareja, y
 * una veladura pareja no aporta profundidad — aporta suciedad.
 *
 * El área total de fill queda por debajo de la que había (30 × 1,5² = 67,5
 * contra 70 × 1,0² = 70), así que **el overdraw no sube**: lo que sube es
 * cuánto se ve cada una, que es 2,25 veces en área y +40% en opacidad.
 *
 * `BOKEH_R_MIN` y `BOKEH_SIZE` siguen siendo la perilla de costo: son sprites
 * grandes y transparentes, o sea el único overdraw de esta escena. Con 4,2 y 1,5
 * un sprite en el radio mínimo ocupa ~57% del alto del cuadro.
 */
export const BOKEH_COUNT = 30
export const BOKEH_R_MIN = 4.2
export const BOKEH_R_MAX = 30
/**
 * Exponente de la distribución radial. Por debajo de 1 carga el campo hacia la
 * cámara — que es donde el desenfoque se ve. Uniforme en volumen (r³) dejaría
 * casi todas lejos, justo donde no sirven.
 */
export const BOKEH_RADIUS_BIAS = 0.85
export const BOKEH_SIZE = 1.5
export const BOKEH_OPACITY = 0.2
/** Semilla propia: no puede compartir la del polvo o los dos campos coincidirían. */
export const BOKEH_SEED = 0xb04e12
export const BOKEH_SPRITE_SIZE = 64


export function createDotSpriteData(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      // Borde suave en el ultimo 25% del radio: sin eso el disco aliasa igual
      // que el cuadrado que vino a reemplazar.
      const alpha = clamp01((1 - distance) / 0.25)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }

  return data
}

export const PARTICLE_SPRITE_SIZE = 64

/**
 * La forma de una particula DESENFOCADA.
 *
 * Difiere del sprite de polvo en una sola cosa, y es la que importa: el polvo
 * es opaco en el centro y se ablanda en el ultimo 25% del radio; este se ablanda
 * en el 55% exterior y deja una meseta plana adentro. Esa meseta es lo que
 * distingue un disco fuera de foco de una mancha gaussiana — un lente
 * desenfocado reparte la luz de un punto sobre un DISCO, no sobre una campana.
 *
 * Pura, igual que la otra: puede vivir en un `useMemo` sin violar
 * `react-hooks/purity`.
 */
export function createBokehSpriteData(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      const alpha = clamp01((1 - distance) / 0.55)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }

  return data
}

/**
 * La forma de la OCLUSIÓN DE CONTACTO (S6).
 *
 * El tercer generador de la familia, y el que menos se parece a los otros dos:
 * el polvo y el bokeh son discos que se APAGAN hacia afuera; éste es una mancha
 * que **empieza opaca y se cierra rápido**. Esa es la diferencia entre una
 * sombra difusa y una oclusión: la luz ambiente que no entra en la rendija entre
 * el objeto y el piso no se degrada suave, se corta.
 *
 * `core` es la fracción del radio que queda a densidad plena y `falloff` el
 * exponente de la caída fuera de él. Los dos entran por parámetro y no por
 * import: así la función sigue siendo pura y sin dependencias, y puede vivir en
 * un `useMemo` sin violar `react-hooks/purity`.
 */
export function createContactSpriteData(
  size: number,
  core: number,
  falloff: number
): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2
  const tail = Math.max(1e-6, 1 - core)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      const alpha =
        distance <= core ? 1 : Math.pow(clamp01((1 - distance) / tail), falloff)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }

  return data
}

/**
 * PRNG determinista (mulberry32). `Math.random()` no puede ir en un `useMemo`
 * —la regla `react-hooks/purity` lo prohíbe, y con razón: el render dejaría de
 * ser puro— y además un campo de partículas irrepetible haría incomparables dos
 * capturas del mismo ángulo.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let x = Math.imul(state ^ (state >>> 15), 1 | state)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

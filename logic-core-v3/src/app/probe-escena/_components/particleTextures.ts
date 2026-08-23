import { clamp01 } from './probeScene'

/**
 * LOS GENERADORES DE SPRITE de las partículas y de la oclusión de contacto.
 *
 * Salieron de `probeParticles.ts` en S10 por el límite de 300 líneas del repo, y
 * el corte tiene la misma costura que `probeMoire.ts` ↔ `moireTextures.ts`: allá
 * están los números y su razonamiento, acá cómo se dibujan.
 *
 * Los tres son la misma técnica con tres perfiles distintos, y los tres tienen
 * que ser **puros**: se llaman desde un `useMemo` y `react-hooks/purity` no
 * perdona un efecto ahí adentro.
 */

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

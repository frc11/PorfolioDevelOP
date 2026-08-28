import {
  BOKEH_SPRITE_SIZE,
  PARTICLE_SPRITE_SIZE,
} from '@/app/probe-escena/_components/probeParticles'
import {
  createBokehSpriteData,
  createDotSpriteData,
} from '@/app/probe-escena/_components/particleTextures'

import {
  INTRO_BOKEH_COLOR,
  INTRO_TINT_STEPS,
  introTintColor,
} from './introParticleTint'

/**
 * LOS SPRITES DE LAS PARTÍCULAS DEL INTRO — la escena, rasterizada en 2D.
 *
 * ── Por qué esto no dibuja círculos ────────────────────────────────────────
 *
 * La forma de una mota **ya está resuelta en la escena** y no se vuelve a
 * inventar: `createDotSpriteData` (borde blando en el último 25% del radio —
 * "sin eso el disco aliasa igual que el cuadrado que vino a reemplazar") y
 * `createBokehSpriteData` (meseta plana adentro y caída en el 55% exterior —
 * "un lente desenfocado reparte la luz de un punto sobre un DISCO, no sobre una
 * campana"). Los dos generadores se importan tal cual y devuelven el mismo
 * `Uint8Array` RGBA que three sube como textura. **La única diferencia es dónde
 * se pega: acá en un canvas 2D en vez de en un `DataTexture`.**
 *
 * ── El teñido ──────────────────────────────────────────────────────────────
 *
 * `drawImage` no tiñe, así que hace falta un sprite por color; los escalones y
 * su error medido están en `introParticleTint.ts` (`INTRO_TINT_STEPS`). Acá solo
 * se pintan: se pega el sprite blanco con su alfa y después se pinta el color
 * entero "adentro" de lo que ya hay, con `source-in`. Dos operaciones por
 * escalón, una sola vez por montaje.
 */

export type IntroSpriteAtlas = {
  /** Un canvas por escalón de la rampa del polvo. */
  readonly dust: readonly HTMLCanvasElement[]
  /** El bokeh escribe un solo color, así que le alcanza uno. */
  readonly bokeh: HTMLCanvasElement
}

function paint(data: Uint8Array, size: number, color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // `putImageData` ignora el modo de composición y escribe crudo: primero queda
  // el sprite blanco con su alfa, y recién después se lo tiñe.
  const image = ctx.createImageData(size, size)
  image.data.set(data)
  ctx.putImageData(image, 0, 0)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
  return canvas
}

/**
 * Se construye una vez, en el primer cuadro que dibuja. `null` sin DOM — el
 * overlay viaja en el HTML del server y esto no puede correr ahí.
 */
export function buildIntroSpriteAtlas(): IntroSpriteAtlas | null {
  if (typeof document === 'undefined') return null

  const dotData = createDotSpriteData(PARTICLE_SPRITE_SIZE)
  const dust: HTMLCanvasElement[] = []
  for (let step = 0; step < INTRO_TINT_STEPS; step += 1) {
    dust.push(paint(dotData, PARTICLE_SPRITE_SIZE, introTintColor(step)))
  }

  return {
    dust,
    bokeh: paint(createBokehSpriteData(BOKEH_SPRITE_SIZE), BOKEH_SPRITE_SIZE, INTRO_BOKEH_COLOR),
  }
}

import { BlendFunction, Effect } from 'postprocessing'

/**
 * Post-Bloom alpha restore — keeps the avatar canvas truly transparent.
 *
 * postprocessing's Bloom inflates the alpha channel of every pixel its blur
 * reaches: the luminance pass writes its mask into alpha, the mipmap blur
 * spreads it across the whole (tiny) canvas, and the SCREEN blend keeps
 * `max(dst.a, src.a)`. On a transparent canvas that paints a semi-opaque
 * dark square the exact size of the canvas.
 *
 * Mounted after <Bloom>, this effect copies the scene's own alpha back from
 * `inputBuffer` (the pre-effects scene texture), leaving the bloomed RGB
 * untouched. Glow outside geometry then composites additively (rgb > 0,
 * alpha 0) instead of darkening whatever sits behind the canvas.
 *
 * `inputBuffer` is an internal-but-stable uniform of postprocessing 6.x's
 * EffectMaterial (declared in effect.frag). Re-check on a 7.x upgrade.
 */
const FRAGMENT = /* glsl */ `
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(inputColor.rgb, texture2D(inputBuffer, uv).a);
  }
`

export class SceneAlphaEffect extends Effect {
  constructor() {
    super('SceneAlphaEffect', FRAGMENT, { blendFunction: BlendFunction.NORMAL })
  }
}

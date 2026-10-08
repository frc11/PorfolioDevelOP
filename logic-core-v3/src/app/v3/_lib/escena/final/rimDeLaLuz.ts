import type * as THREE from 'three'

/**
 * [PULIDO 3] A1 · LA LUZ DE ABAJO ALCANZA EL CANTO DEL LOGO, como un rim light desde abajo. [PULIDO 3B] B0 · EL LOGO BRILLA
 * («no puede quedar opacado, también debe brillar, es lo que le da energía a todo»): siempre (ya no es una variante). Su FILO
 * (las caras que no miran hacia arriba: el bisel y los costados) se enciende en blanco con la energía extendida, y cada onda
 * que larga (las suyas y el golpe) nace con un PULSO: el filo se enciende más y el logo entero, apenas (`cuadroDelFinal.ts`).
 * Desde arriba el bisel casi no se ve: el filo también se dibuja en el piso, un hilo de luz justo afuera del logo
 * (`filoDelLogo`, `enElPiso.ts`), con los mismos uniformes.
 * Se suma en la salida del logo, después del tono: el oscurecimiento de la sala es del piso y no lo toca. Se parchea una vez.
 */
export const RIM_DE_LA_LUZ = {
  /** Cuánto brilla el filo (0 a `filo`). */
  uRimDeLaLuz: { value: 0 },
  /** El pulso de la onda que nace (0 a 1). */
  uPulsoDelLogo: { value: 0 },
}

/** El filo con la energía entera, cuánto más con el pulso, cuánto el logo entero con el pulso y cuánto dura el pulso (s). */
export const BRILLO_DEL_LOGO = { filo: 1.1, pulsoEnElFilo: 1.6, pulsoEnElLogo: 0.3, pulsoS: 0.32 } as const

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** La luz que se suma al logo (GLSL): el filo (por su normal hacia arriba, `haciaArriba`) y el pulso. */
export const BRILLO_DEL_LOGO_GLSL = `gl_FragColor.rgb += vec3( ( uRimDeLaLuz + ${f(BRILLO_DEL_LOGO.pulsoEnElFilo)} * uPulsoDelLogo ) * smoothstep( 0.97, 0.6, haciaArriba.y ) + ${f(BRILLO_DEL_LOGO.pulsoEnElLogo)} * uPulsoDelLogo );`

export function conElRimDeLaLuz(material: THREE.MeshStandardMaterial): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|rim-de-la-luz`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, RIM_DE_LA_LUZ)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRimDeLaLuz;\nuniform float uPulsoDelLogo;')
      .replace(/\}\s*$/, `\tvec3 haciaArriba = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );\n\t${BRILLO_DEL_LOGO_GLSL}\n}\n`)
  }
  material.needsUpdate = true
}

/** [PULIDO 3B] B0 · el pulso del logo a `desde` s de que nació la última onda (o el golpe): se enciende y se apaga. */
export function pulsoDelLogo(desde: number): number {
  return desde >= 0 && Number.isFinite(desde) ? Math.exp(-desde / BRILLO_DEL_LOGO.pulsoS) : 0
}

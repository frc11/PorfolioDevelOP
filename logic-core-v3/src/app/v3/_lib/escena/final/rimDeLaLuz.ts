import type * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'

/**
 * [PULIDO 3] A1 · `?energia=inestable`: LA LUZ DE ABAJO ALCANZA EL CANTO DEL LOGO, como un rim light desde abajo. Se suma en
 * la salida del logo donde su superficie no mira hacia arriba (el canto y los costados; la cara de arriba, nada) y cerca del
 * piso (se apaga `alto` u por encima), con la energía extendida (`cuadroDelFinal.ts`). Se parchea una vez.
 */
export const RIM_DE_LA_LUZ = { uRimDeLaLuz: { value: 0 } }

const ALTO = 0.55
const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

export function conElRimDeLaLuz(material: THREE.MeshStandardMaterial): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|rim-de-la-luz`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, RIM_DE_LA_LUZ)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoDelRim;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoDelRim = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRimDeLaLuz;\nvarying vec3 vMundoDelRim;')
      .replace(
        /\}\s*$/,
        `\tvec3 haciaArriba = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );\n\tgl_FragColor.rgb += vec3( uRimDeLaLuz * pow( clamp( 1.0 - haciaArriba.y, 0.0, 1.0 ), 2.0 ) * 0.5 * ( 1.0 - smoothstep( 0.0, ${f(ALTO)}, vMundoDelRim.y - ${f(FLOOR_Y)} ) ) );\n}\n`,
      )
  }
  material.needsUpdate = true
}

import * as THREE from 'three'

import { CTA_DEL_FINAL } from './estado'

/**
 * [PULIDO 1] P17-B · d · EL MOIRÉ SE DEFORMA HACIA EL CURSOR (sólo con `?cta=d`: sin la bandera las dos tramas no cambian ni
 * una línea). Un tirón en el espacio de la pantalla alrededor del puntero: cada fragmento lee la trama un poco más lejos del
 * cursor, así las líneas de cerca se juntan hacia él (un pellizco), con una campana de radio `uPortal.w`. El corrimiento de
 * pantalla se pasa a la textura con las derivadas de su coordenada (`dFdx`, `dFdy`), así vale igual en las dos capas, en
 * cualquier lugar del cilindro y a cualquier distancia, sin conocer su forma.
 */
export const PORTAL_EN_VIVO = {
  /** El puntero (px del búfer de dibujo, desde abajo a la izquierda), cuánto tira (0 a 1) y su radio (px). */
  uPortal: { value: new THREE.Vector4(0, 0, 0, 1) },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

const PARS = /* glsl */ `
uniform vec4 uPortal;
`

const TIRON = /* glsl */ `
	vec2 uvDelPortal = vAlphaMapUv;
	if ( uPortal.z > 0.0 ) {
		vec2 dPortal = gl_FragCoord.xy - uPortal.xy;
		float gPortal = exp( - dot( dPortal, dPortal ) / ( uPortal.w * uPortal.w ) );
		vec2 tiron = dPortal * ( uPortal.z * ${f(CTA_DEL_FINAL.portal.tiron)} * gPortal );
		uvDelPortal += dFdx( vAlphaMapUv ) * tiron.x + dFdy( vAlphaMapUv ) * tiron.y;
	}
`

/** La lectura de la trama de la capa fina con el desajuste vivo (`moire/parche.ts`) y la de la gruesa, la de three. */
export const LECTURAS_DE_LA_TRAMA = {
  fina: 'float alfaDeLaTrama = texture2D( alphaMap, vAlphaMapUv ).g;',
  gruesa: '#include <alphamap_fragment>',
} as const

/** Parchea una capa de la trama (encadena lo que ya tuviera: el desajuste vivo y el amanecer). */
export function conElPortal<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|portal-del-cta`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    const fs = shader.fragmentShader
    if (!fs.includes(LECTURAS_DE_LA_TRAMA.fina) && !fs.includes(LECTURAS_DE_LA_TRAMA.gruesa)) {
      throw new Error('[PULIDO 1] P17-B · la trama del moiré cambió: el portal no encuentra su lectura')
    }
    Object.assign(shader.uniforms, PORTAL_EN_VIVO)
    shader.fragmentShader = fs
      .replace('#include <common>', `#include <common>\n${PARS}`)
      .replace(LECTURAS_DE_LA_TRAMA.fina, `${TIRON}\tfloat alfaDeLaTrama = texture2D( alphaMap, uvDelPortal ).g;`)
      .replace(LECTURAS_DE_LA_TRAMA.gruesa, `#ifdef USE_ALPHAMAP\n${TIRON}\tdiffuseColor.a *= texture2D( alphaMap, uvDelPortal ).g;\n#endif`)
  }
  material.needsUpdate = true
  return material
}

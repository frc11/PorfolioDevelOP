import * as THREE from 'three'

import { conElAmanecer } from '../amanecer/luz'
import { SATINADO } from '../estudio'
import { conLogoDeNoche, hornearContornos, type ContornoDelLogo } from '../logoDeNoche'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { FILO_DE_DIA_GLSL, NOCHE_DEL_TITULO, type Variante } from '../titulos3d/armado'
import { costadoDeDiaGlsl } from '../titulos3d/filo'

/**
 * [PULIDO 2] 5 · EL MATERIAL DEL CTA DEL FINAL — el de los títulos de volumen (`titulos3d/armado.ts`): el negro satinado del
 * logo con sus reflejos del estudio, el costado de día en otro gris (o, el blanco, su filo oscuro), el dibujo de noche con
 * el filo claro del contorno y el amanecer como el resto de la sala. Sin la llegada de las letras (la transformación las
 * mueve desde afuera) y con cuánto se ve cada pieza (`uAparece`: el mismo tramado fijo en la pantalla que disuelve las
 * letras de los títulos; el material es opaco, sin orden de transparencias). Un material por pieza (su `uAparece`), un
 * programa para todas.
 */
const APARECE_GLSL = /* glsl */ `
	if ( uAparece < 0.999 && fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) >= uAparece ) discard;
`

/** El contorno de un renglón para el dibujo de noche (uno por renglón: lo comparten sus letras). */
export function contornoDelRenglon(contornos: readonly (readonly THREE.Vector2[])[]): ContornoDelLogo {
  return hornearContornos(contornos, NOCHE_DEL_TITULO.contorno)
}

export interface MaterialDelCta {
  readonly material: THREE.MeshStandardMaterial
  readonly aparece: { value: number }
}

export function materialDelCta(variante: Variante, contorno: ContornoDelLogo): MaterialDelCta {
  const material = new THREE.MeshStandardMaterial({ color: variante === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  const aparece = { value: 1 }
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAparece = aparece
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uAparece;').replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${APARECE_GLSL}`)
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>\n${variante === 'blanco' ? FILO_DE_DIA_GLSL : costadoDeDiaGlsl(EMISION_EN_LA_NOCHE)}`)
  }
  material.customProgramCacheKey = () => `cta-del-final-${variante}`
  conLogoDeNoche(material, contorno, variante === 'blanco' ? { ancho: NOCHE_DEL_TITULO.filo, tapa: NOCHE_DEL_TITULO.tapaDelBlanco } : { ancho: NOCHE_DEL_TITULO.filo })
  conElAmanecer(material)
  return { material, aparece }
}

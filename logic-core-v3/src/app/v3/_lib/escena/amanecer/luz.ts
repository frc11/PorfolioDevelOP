import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { TRAMA_GLSL } from '../estrellas/cielo'
import { TRAMA_EN_VIVO } from '../estrellas/trama'
import { AMANECER } from './linea'

/**
 * [ESCENA 7] T11 · LA LUZ DEL AMANECER — lo que los materiales leen (lo escribe `Amanecer.tsx`) y los parches
 * que la pintan. Todo compila sólo con la bandera: sin ella los materiales no cambian. [ESCENA 8] Encendida.
 */

/** ¿Hay amanecer en esta carga? */
export function hayAmanecer(): boolean {
  return entornoDeLaEscena().amanecer
}

const sol = (() => {
  const [a, e] = [(AMANECER.sol.azimut * Math.PI) / 180, (AMANECER.sol.elevacion * Math.PI) / 180]
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e))
})()

export const AMANECER_EN_VIVO = {
  /** El radio del frente, y 1 mientras barre (la sala ya es de día y lo no alcanzado se oscurece). */
  uFrenteDelDia: { value: 1e4 },
  uBarridoDelDia: { value: 0 },
  /** El resplandor del horizonte (0 a 1). */
  uResplandor: { value: 0 },
  /** Los haces por la trama (0 a 1). */
  uRayos: { value: 0 },
  /** El cielo de noche a día (0 a 1) y el color del cielo de noche al cambiar (codificado). */
  uCieloDelAmanecer: { value: 0 },
  uCieloDeNoche: { value: new THREE.Color(0, 0, 0) },
  /** Cuánto se ven las estrellas (1 salvo en el amanecer). */
  uEstrellasDelAmanecer: { value: 1 },
  /** Hacia dónde está el sol del amanecer. */
  uSolDelAmanecer: { value: sol },
}

/** La luz del amanecer en pantalla (codificada): monocroma, un blanco apenas bajo. */
const LUZ = 0.92
/** El resplandor, en el fondo de la niebla: cuánto aclara lo que está lejos (codificado). */
export const RESPLANDOR = { cuanto: 0.55, desde: 70, hasta: 240 } as const

/** Cuánto de día muestra un punto del mundo durante el barrido (1 si no hay barrido), y el resplandor. */
export const AMANECER_GLSL = /* glsl */ `
uniform float uFrenteDelDia;
uniform float uBarridoDelDia;
uniform float uResplandor;
uniform float uRayos;
uniform vec3 uSolDelAmanecer;
float alcanzadoPorElDia( vec3 mundo ) {
	if ( uBarridoDelDia < 0.5 ) return 1.0;
	return smoothstep( uFrenteDelDia - ${AMANECER.ancho.toFixed(1)}, uFrenteDelDia + ${AMANECER.ancho.toFixed(1)}, length( mundo.xz ) );
}
// El resplandor del horizonte en lo que está a esa distancia de la cámara (lo lejano se aclara primero).
float resplandorA( float lejos ) {
	return uResplandor * ${RESPLANDOR.cuanto.toFixed(2)} * smoothstep( ${RESPLANDOR.desde.toFixed(1)}, ${RESPLANDOR.hasta.toFixed(1)}, lejos );
}
`

/** Después de la bruma: lo que el frente no alcanzó, con el tono de la noche; y el resplandor de lo lejano. */
export const OSCURECER_GLSL = (mundo: string): string => /* glsl */ `
	gl_FragColor.rgb *= mix( ${AMANECER.oscuro.toFixed(2)}, 1.0, alcanzadoPorElDia( ${mundo} ) );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3( ${LUZ.toFixed(2)} ), resplandorA( distance( ${mundo}, cameraPosition ) ) );
`

/** El sol que entra por los cuadrados de la trama y cae en el piso (los cuadros de luz de la persiana). */
export const SOL_EN_EL_PISO_GLSL = (mundo: string): string => /* glsl */ `
	if ( uRayos > 0.001 ) {
		float pasa = delanteDeLaTrama( ${mundo}, uSolDelAmanecer );
		gl_FragColor.rgb += vec3( ${LUZ.toFixed(2)} ) * pasa * uRayos * 0.22 * ( 1.0 - alcanzadoPorElDia( ${mundo} ) * 0.6 );
	}
`

type Material = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial

/**
 * Engancha el amanecer en un material de three (papel, trama, bloques). `conSol`: además, los cuadros de luz
 * que entran por la trama (en el piso). Encadena el `onBeforeCompile` que ya tuviera, no lo pisa.
 */
export function conElAmanecer<T extends Material>(material: T, conSol = false): T {
  if (!hayAmanecer()) return material
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, AMANECER_EN_VIVO, conSol ? TRAMA_EN_VIVO : {})
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoDelDia;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoDelDia = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vMundoDelDia;\n${AMANECER_GLSL}\n${conSol ? TRAMA_GLSL : ''}`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>\n${OSCURECER_GLSL('vMundoDelDia')}\n${conSol ? SOL_EN_EL_PISO_GLSL('vMundoDelDia') : ''}`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|amanecer${conSol ? '-sol' : ''}`
  material.needsUpdate = true
  return material
}

/** El gris del logo de noche (codificado), el que guarda hasta que el frente lo alcanza. */
export const LOGO_DE_NOCHE = 0.43

/**
 * El logo guarda su gris de noche hasta que el frente lo alcanza: es lo último. Encadena el parche que ya
 * tuviera su material (el rebote, T12).
 */
export function conElAmanecerEnElLogo(material: THREE.MeshStandardMaterial): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, AMANECER_EN_VIVO)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoDelLogo;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoDelLogo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vMundoDelLogo;\n${AMANECER_GLSL}`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>\n\tgl_FragColor.rgb = mix( vec3( ${LOGO_DE_NOCHE.toFixed(2)} ), gl_FragColor.rgb, alcanzadoPorElDia( vMundoDelLogo ) );`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|amanecer-logo`
  material.needsUpdate = true
}

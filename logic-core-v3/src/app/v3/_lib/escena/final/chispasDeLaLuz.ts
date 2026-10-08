import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { LECTURA_DE_LA_LUZ_GLSL, LUZ_DE_ABAJO_EN_VIVO } from './luzDeAbajo'

/**
 * [PULIDO 2] 4 · LAS CHISPAS (la ref. del humano con chispas). Sobrias: chicas y blancas; nacen en una junta, suben un poco y
 * se apagan. Todo en el sombreador de vértices con el reloj de la escena: sin estado por cuadro. [PULIDO 3] A1 · ahora son de
 * `?energia=inestable` (se borró `?chispas=si`): nacen en cualquier punto de lo que se ve y sólo se prenden donde la energía
 * está más alta (la leen de la simulación del piso).
 */
export const CHISPAS_DE_LA_LUZ = { cuantas: 140, sube: 1.6, vidaS: [0.9, 1.7], tamano: 3, desde: 0.85, entera: 1.25 } as const

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

export function crearLasChispas(): THREE.Points {
  const C = CHISPAS_DE_LA_LUZ
  const geometria = new THREE.BufferGeometry()
  const semillas = new Float32Array(C.cuantas * 3)
  for (let i = 0; i < C.cuantas; i += 1) semillas.set([i % 2, (i * 0.618034) % 1, ((i * 7.31) % 13) / 13], i * 3)
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(C.cuantas * 3), 3))
  geometria.setAttribute('aSemilla', new THREE.BufferAttribute(semillas, 3))
  const material = new THREE.ShaderMaterial({
    uniforms: { ...LUZ_DE_ABAJO_EN_VIVO, ...PISO_EN_VIVO, uTiempo: VIVO.uTiempo },
    vertexShader: /* glsl */ `
attribute vec3 aSemilla;
uniform float uTiempo;
uniform vec3 uVistaDeLaLuz;
${LECTURA_DE_LA_LUZ_GLSL}
varying float vAlfa;
void main() {
	float vida = ${f(C.vidaS[0])} + ${f(C.vidaS[1] - C.vidaS[0])} * aSemilla.z;
	float ciclo = uTiempo / vida + aSemilla.y;
	float n = floor( ciclo );
	float u = ciclo - n;
	// Dónde nace: un punto de lo que se ve, otro en cada ciclo; se prende sólo donde la energía está más alta.
	float a = 6.2831853 * fract( sin( n * 12.9898 + aSemilla.y * 78.233 ) * 43758.5453 );
	float r = sqrt( fract( sin( n * 39.346 + aSemilla.z * 11.135 ) * 24634.6345 ) ) * uVistaDeLaLuz.z;
	vec2 xz = uVistaDeLaLuz.xy + vec2( cos( a ), sin( a ) ) * r;
	vec3 p = vec3( xz.x, ${f(FLOOR_Y)} + 0.05 + u * ${f(C.sube)}, xz.y );
	vAlfa = smoothstep( ${f(C.desde)}, ${f(C.entera)}, energiaEnElPiso( xz ) ) * ( 1.0 - u ) * smoothstep( 0.0, 0.12, u );
	vec4 vista = viewMatrix * vec4( p, 1.0 );
	gl_Position = projectionMatrix * vista;
	gl_PointSize = ${f(C.tamano)} * ( 1.0 - 0.5 * u );
}`,
    fragmentShader: /* glsl */ `
varying float vAlfa;
void main() {
	if ( vAlfa <= 0.003 ) discard;
	float d = length( gl_PointCoord - 0.5 );
	gl_FragColor = vec4( vec3( 1.0 ), vAlfa * ( 1.0 - smoothstep( 0.2, 0.5, d ) ) );
}`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const chispas = new THREE.Points(geometria, material)
  chispas.name = 'chispas de la luz'
  chispas.frustumCulled = false
  return chispas
}

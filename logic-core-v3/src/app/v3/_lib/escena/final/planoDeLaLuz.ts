import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { PISO_VIVO } from '../piso/bloques'
import { LUZ_DE_ABAJO, LUZ_DE_ABAJO_EN_VIVO, SECTOR_DE_LA_LUZ_GLSL } from './luzDeAbajo'

/**
 * [PULIDO 2] 4 · EL PLANO QUE BRILLA DEBAJO DEL PISO: al pie de los bloques (sobre su zócalo), un disco que sólo existe en el
 * sector de la luz (con un resplandor que cae suave alrededor). Fuera del sector los bloques están pegados y lo tapan; en el
 * sector se separan y por las rendijas se ve: la luz que se escapa por las juntas, falsa y local (sin bloom).
 */
const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

export function crearElPlanoDeLaLuz(radio: number): THREE.Mesh {
  const geometria = new THREE.CircleGeometry(radio, 96)
  geometria.rotateX(-Math.PI / 2)
  const material = new THREE.ShaderMaterial({
    uniforms: { ...LUZ_DE_ABAJO_EN_VIVO, uTiempo: VIVO.uTiempo },
    vertexShader: /* glsl */ `
varying vec2 vXZ;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vXZ = mundo.xz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}`,
    fragmentShader: /* glsl */ `
varying vec2 vXZ;
uniform float uTiempo;
${SECTOR_DE_LA_LUZ_GLSL}
void main() {
	float luz = sectorDeLaLuz( vXZ, ${f(LUZ_DE_ABAJO.resplandor)} ) * brilloDeLaJunta( vXZ, uTiempo );
	// Fuera del sector no hay plano (nada que tape: en un valle hondo del mar un bloque baja mucho).
	if ( luz <= 0.002 ) discard;
	gl_FragColor = vec4( vec3( ${f(LUZ_DE_ABAJO.plano)} * luz ), 1.0 );
}`,
    depthWrite: true,
    toneMapped: false,
  })
  const plano = new THREE.Mesh(geometria, material)
  plano.name = 'la luz de abajo'
  // Apenas arriba del pie de los bloques (el zócalo, más hondo que el valle más hondo): ninguna tapa baja hasta él.
  plano.position.set(0, FLOOR_Y - PISO_VIVO.zocalo + 0.02, 0)
  plano.frustumCulled = false
  return plano
}

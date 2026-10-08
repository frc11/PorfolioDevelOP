import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { PISO_VIVO } from '../piso/bloques'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { LECTURA_DE_LA_LUZ_GLSL, LUZ_DE_ABAJO, LUZ_DE_ABAJO_EN_VIVO, PLANO_SOBRE_EL_ZOCALO, RED_DE_LA_LUZ_GLSL, RUIDO_DE_LA_LUZ_GLSL, type VarianteDeLaEnergia } from './luzDeAbajo'

/**
 * [PULIDO 2] 4 · EL PLANO QUE BRILLA DEBAJO DEL PISO: al pie de los bloques (sobre su zócalo), un disco que brilla donde hay
 * energía. Sin energía los bloques están pegados y lo tapan; con energía se separan y por las rendijas se ve: la luz que se
 * escapa por las juntas, falsa y local (sin bloom). [PULIDO 3] A1 · la energía la lee de la simulación del piso; con
 * `?energia=red`, además, las corrientes por las juntas.
 *
 * [PULIDO 3] A1 · LA MANCHA NEGRA: en el golpe del encastre la súper onda dibuja valles de hasta ~1,4 u (su tope crece 1 u
 * mientras dura) y la tapa de un bloque bajaba más que el plano (0,58 u bajo el reposo, sobre el pie de los bloques): el plano
 * quedaba por ENCIMA de esos bloques y se veía de frente, oscuro en su borde (la luz se apaga hacia cero) y blanco en el medio:
 * una forma oscura ondulada (el frente de la onda) al lado del sector. Ahora, con energía, las tapas no bajan del piso blando
 * de la luz (`fondoDeLaLuz`, en la simulación: `enElPiso.ts`), por encima del plano.
 */
const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

export function crearElPlanoDeLaLuz(radio: number, variante: VarianteDeLaEnergia = 'sobrecarga'): THREE.Mesh {
  const geometria = new THREE.CircleGeometry(radio, 96)
  geometria.rotateX(-Math.PI / 2)
  const material = new THREE.ShaderMaterial({
    uniforms: { ...LUZ_DE_ABAJO_EN_VIVO, ...PISO_EN_VIVO, uTiempo: VIVO.uTiempo, uAnillos: VIVO.uAnillos, uGolpe: FINAL_EN_EL_PISO.uGolpe },
    vertexShader: /* glsl */ `
varying vec2 vXZ;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vXZ = mundo.xz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}`,
    fragmentShader: /* glsl */ `${variante === 'red' ? '#define ENERGIA_RED\n' : ''}
varying vec2 vXZ;
uniform float uTiempo;
uniform vec4 uAnillos[ 4 ];
uniform vec4 uGolpe;
${LECTURA_DE_LA_LUZ_GLSL}
${RUIDO_DE_LA_LUZ_GLSL}
#ifdef ENERGIA_RED
${RED_DE_LA_LUZ_GLSL}
#endif
void main() {
	float e = energiaEnElPiso( vXZ );
	float luz = e * brilloDeLaJunta( vXZ, uTiempo );
#ifdef ENERGIA_RED
	if ( e > 0.0 ) luz += redDeLaLuz( vXZ, uGrillaDelPiso.y );
#endif
	if ( luz <= 0.002 ) discard;
	gl_FragColor = vec4( vec3( ${f(LUZ_DE_ABAJO.plano)} * luz ), 1.0 );
}`,
    depthWrite: true,
    toneMapped: false,
  })
  const plano = new THREE.Mesh(geometria, material)
  plano.name = 'la luz de abajo'
  // Apenas arriba del pie de los bloques (el zócalo): por debajo de todas las tapas (con energía, el piso blando las frena).
  plano.position.set(0, FLOOR_Y - PISO_VIVO.zocalo + PLANO_SOBRE_EL_ZOCALO, 0)
  plano.frustumCulled = false
  return plano
}

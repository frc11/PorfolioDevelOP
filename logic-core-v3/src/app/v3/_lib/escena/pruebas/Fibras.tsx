'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { azar } from '../formacion/enFormacion'
import { AIRE } from '../polvo/parche'
import { FLOOR_Y } from '../probeScene'

/**
 * [ESCENA 7] T13 · FIBRAS EN EL AIRE — con bandera, apagada. Unas pocas fibras más grandes que el polvo que
 * caen girando despacio entre él, como pelusas a contraluz.
 *
 * Cada fibra es una cinta fina y apenas curva (más larga que ancha: de 0,18 a 0,4 u por 0,012), que cae
 * despacio, se mece con el aire (y deriva con 6a) y gira sobre un eje propio; su lado de canto casi no se
 * ve y de plano se ve entera, que es lo que hace el destello de una pelusa al girar. Viven en una caja que
 * acompaña a la cámara (como el polvo parejo), así que siempre hay algunas cerca. Todo el movimiento es una
 * cuenta del reloj en el vértice: no hay simulación. Una llamada de dibujo.
 */
export const FIBRAS = {
  cuantas: 60,
  /** La caja: su lado y cuánto arranca detrás de la cámara (u). */
  caja: { lado: 20, atras: 3 },
  /** Largo (u), ancho (u), caída (u/s) y cuánto se mecen (u). */
  largo: [0.18, 0.4],
  ancho: 0.012,
  cae: [0.07, 0.18],
  mece: 0.45,
  /** El giro sobre su eje (rad/s). */
  gira: [0.4, 1.4],
  /** Hasta dónde se ven (u): pegadas a la lente no, y lejos se apagan. */
  cerca: 1.4,
  lejos: 15,
} as const

const VERTEX = /* glsl */ `
attribute vec4 aFibra;
attribute vec4 aGiro;
uniform float uTiempo;
uniform vec3 uDeriva;
uniform float uNoche;
varying float vAlfa;
varying float vPlano;
mat3 girar( vec3 eje, float a ) {
	float c = cos( a );
	float s = sin( a );
	float t = 1.0 - c;
	return mat3( t * eje.x * eje.x + c, t * eje.x * eje.y + s * eje.z, t * eje.x * eje.z - s * eje.y,
		t * eje.x * eje.y - s * eje.z, t * eje.y * eje.y + c, t * eje.y * eje.z + s * eje.x,
		t * eje.x * eje.z + s * eje.y, t * eje.y * eje.z - s * eje.x, t * eje.z * eje.z + c );
}
void main() {
	float t = uTiempo;
	float semilla = aFibra.w;
	// La cinta en su espacio: largo en x, ancho en y, curva en z.
	float largo = mix( ${FIBRAS.largo[0].toFixed(2)}, ${FIBRAS.largo[1].toFixed(2)}, fract( semilla * 7.1 ) );
	vec3 local = vec3( position.x * largo, position.y * ${FIBRAS.ancho.toFixed(3)}, 0.35 * largo * position.x * position.x );
	mat3 giro = girar( normalize( aGiro.xyz ), aGiro.w * t + semilla * 6.28 );
	vec3 plano = giro * vec3( 0.0, 0.0, 1.0 );
	// Cae, se mece y deriva con el aire.
	float cae = mix( ${FIBRAS.cae[0].toFixed(2)}, ${FIBRAS.cae[1].toFixed(2)}, fract( semilla * 3.3 ) );
	vec3 mece = ${FIBRAS.mece.toFixed(2)} * vec3( sin( t * 0.7 + semilla * 11.0 ), 0.0, cos( t * 0.53 + semilla * 5.0 ) );
	vec3 centro = aFibra.xyz + vec3( 0.0, - cae * t, 0.0 ) + mece + uDeriva;
	// La caja que acompaña a la cámara: la que sale por una cara entra por la de enfrente.
	vec3 adelante = - vec3( viewMatrix[ 0 ][ 2 ], viewMatrix[ 1 ][ 2 ], viewMatrix[ 2 ][ 2 ] );
	vec3 medio = cameraPosition + adelante * ${(FIBRAS.caja.lado / 2 - FIBRAS.caja.atras).toFixed(2)};
	centro = medio + mod( centro - medio + ${(FIBRAS.caja.lado / 2).toFixed(2)}, ${FIBRAS.caja.lado.toFixed(2)} ) - ${(FIBRAS.caja.lado / 2).toFixed(2)};
	vec3 mundo = centro + giro * local;
	float lejos = distance( mundo, cameraPosition );
	vec3 enLaCaja = abs( centro - medio ) / ${(FIBRAS.caja.lado / 2).toFixed(2)};
	vAlfa = ( 1.0 - smoothstep( 0.8, 1.0, max( enLaCaja.x, max( enLaCaja.y, enLaCaja.z ) ) ) );
	vAlfa *= smoothstep( ${FIBRAS.cerca.toFixed(2)}, ${(FIBRAS.cerca + 1.5).toFixed(2)}, lejos ) * ( 1.0 - smoothstep( ${(FIBRAS.lejos - 4).toFixed(1)}, ${FIBRAS.lejos.toFixed(1)}, lejos ) );
	vAlfa *= step( ${(FLOOR_Y + 0.05).toFixed(3)}, centro.y );
	// De plano se ve entera; de canto, casi nada (el destello de la pelusa al girar).
	vPlano = abs( dot( plano, normalize( cameraPosition - mundo ) ) );
	gl_Position = projectionMatrix * viewMatrix * vec4( mundo, 1.0 );
}
`

const FRAGMENT = /* glsl */ `
uniform float uNoche;
varying float vAlfa;
varying float vPlano;
void main() {
	// A contraluz: de día, un gris claro que se despega del papel apenas; de noche, blanca como el polvo.
	vec3 color = mix( vec3( 0.55 ), vec3( 1.0 ), uNoche );
	float a = vAlfa * mix( 0.25, 0.85, vPlano );
	if ( a < 0.01 ) discard;
	gl_FragColor = vec4( color, a );
}
`

export function Fibras() {
  if (!entornoDeLaEscena().pruebas.fibras) return null
  return <FibrasPrendidas />
}

function FibrasPrendidas() {
  const malla = useMemo(() => {
    const r = azar(0xf1b4a5)
    const f = FIBRAS
    // La cinta: 10 tramos a lo largo, dos vértices de ancho.
    const cinta = new THREE.PlaneGeometry(1, 1, 10, 1)
    const geometria = new THREE.InstancedBufferGeometry()
    geometria.setIndex(cinta.getIndex())
    geometria.setAttribute('position', cinta.getAttribute('position'))
    const fibra = new Float32Array(f.cuantas * 4)
    const giro = new Float32Array(f.cuantas * 4)
    for (let i = 0; i < f.cuantas; i += 1) {
      fibra.set([(r() - 0.5) * f.caja.lado, (r() - 0.5) * f.caja.lado, (r() - 0.5) * f.caja.lado, r()], i * 4)
      giro.set([r() - 0.5, r() - 0.5, r() - 0.5, f.gira[0] + (f.gira[1] - f.gira[0]) * r()], i * 4)
    }
    geometria.setAttribute('aFibra', new THREE.InstancedBufferAttribute(fibra, 4))
    geometria.setAttribute('aGiro', new THREE.InstancedBufferAttribute(giro, 4))
    geometria.instanceCount = f.cuantas
    const material = new THREE.ShaderMaterial({
      uniforms: { uTiempo: VIVO.uTiempo, uDeriva: AIRE.uDeriva, uNoche: VIVO.uNoche },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const m = new THREE.Mesh(geometria, material)
    m.frustumCulled = false
    return m
  }, [])
  useEffect(() => () => {
    malla.geometry.dispose()
    ;(malla.material as THREE.Material).dispose()
  }, [malla])
  return <primitive object={malla} />
}

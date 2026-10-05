import * as THREE from 'three'

import { FLOOR_Y, INK_COLOR } from '../probeScene'

/**
 * [CIERRE] 3 · LA EXPLOSIÓN DEL ENCASTRE — cuando el logo se encastra en el piso suelta partículas que se dispersan y
 * caen. De día el piso es claro: son de TINTA (casi negras), para que se vean. UN solo dibujo (`THREE.Points`): cada
 * partícula lleva de dónde sale, su velocidad y su azar, y el sombreador la mueve con el reloj del golpe (tiro oblicuo con
 * gravedad, posada al tocar el piso, y se apaga al final de su vida). Sin golpe, invisible: no dibuja.
 */
export const EXPLOSION = {
  cuantas: 1400,
  /** La gravedad (u/s²), la velocidad hacia afuera y hacia arriba (u/s, de mínimo a máximo) y la vida (s). */
  gravedad: 15,
  afuera: [1.4, 7.5],
  arriba: [2.5, 10],
  vidaS: 2.8,
  /** El tamaño en pantalla (px CSS a 40 u de la cámara) y cuánto se apaga cada una (la cola de su vida). */
  tamanoPx: [3, 9],
  apagaDesde: 0.62,
} as const

const VERTICE = /* glsl */ `
uniform float uT;
uniform float uPixel;
uniform float uEscala;
attribute vec3 aVelocidad;
attribute vec4 aAzar;
varying float vVida;
void main() {
	float t = max( 0.0, uT - aAzar.y );
	vec3 p = position + aVelocidad * t + vec3( 0.0, -0.5 * ${EXPLOSION.gravedad.toFixed(1)} * t * t, 0.0 );
	// Posada: al tocar el piso se queda, con un rastro de lo que se deslizó.
	if ( p.y < ${FLOOR_Y.toFixed(4)} + 0.04 ) {
		float tPiso = ( aVelocidad.y + sqrt( max( 0.0, aVelocidad.y * aVelocidad.y + 2.0 * ${EXPLOSION.gravedad.toFixed(1)} * ( position.y - ${FLOOR_Y.toFixed(4)} - 0.04 ) ) ) ) / ${EXPLOSION.gravedad.toFixed(1)};
		p = position + aVelocidad * tPiso * vec3( 1.0, 0.0, 1.0 ) + aVelocidad * min( t - tPiso, 0.25 ) * vec3( 0.12, 0.0, 0.12 );
		p.y = ${FLOOR_Y.toFixed(4)} + 0.04;
	}
	vVida = clamp( uT / ( ${EXPLOSION.vidaS.toFixed(2)} * ( 0.75 + 0.25 * aAzar.z ) ), 0.0, 1.0 );
	vec4 mv = modelViewMatrix * vec4( p, 1.0 );
	gl_Position = projectionMatrix * mv;
	gl_PointSize = mix( ${EXPLOSION.tamanoPx[0].toFixed(1)}, ${EXPLOSION.tamanoPx[1].toFixed(1)}, aAzar.x ) * uPixel * uEscala / max( 1.0, -mv.z ) * step( aAzar.y, uT );
}
`

const FRAGMENTO = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacidad;
varying float vVida;
void main() {
	vec2 q = gl_PointCoord - 0.5;
	float r = length( q );
	if ( r > 0.5 ) discard;
	float borde = smoothstep( 0.5, 0.32, r );
	float vida = 1.0 - smoothstep( ${EXPLOSION.apagaDesde.toFixed(2)}, 1.0, vVida );
	gl_FragColor = vec4( uColor, borde * vida * uOpacidad * 0.92 );
}
`

/** Las partículas, armadas una vez: el material y la geometría (las posiciones de salida se escriben en cada golpe). */
export function crearLaExplosion(): { readonly puntos: THREE.Points; readonly uniformes: { uT: { value: number }; uOpacidad: { value: number }; uPixel: { value: number }; uEscala: { value: number } }; readonly soltar: () => void } {
  const n = EXPLOSION.cuantas
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  geometria.setAttribute('aVelocidad', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  geometria.setAttribute('aAzar', new THREE.BufferAttribute(new Float32Array(n * 4), 4))
  // La caja de siempre: el sombreador las mueve y three no puede saber dónde quedan (no se descartan por encuadre).
  geometria.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, FLOOR_Y, 0), 60)
  const uniformes = { uT: { value: 0 }, uOpacidad: { value: 0 }, uPixel: { value: 1 }, uEscala: { value: 40 }, uColor: { value: new THREE.Color(INK_COLOR) } }
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICE, fragmentShader: FRAGMENTO, uniforms: uniformes, transparent: true, depthWrite: false })
  const puntos = new THREE.Points(geometria, material)
  puntos.name = 'explosión del final'
  puntos.frustumCulled = false
  puntos.visible = false
  return {
    puntos,
    uniformes,
    soltar: () => {
      geometria.dispose()
      material.dispose()
    },
  }
}

/**
 * Dónde sale cada una: de los puntos del contorno del logo acostado (en el mundo), con su velocidad hacia afuera del centro
 * y hacia arriba, y su azar (tamaño, una demora corta, la vida). `azar` es el generador (determinista para el invariante).
 */
export function cargarLaExplosion(puntos: THREE.Points, contorno: readonly THREE.Vector3[], centro: THREE.Vector3, azar: () => number): void {
  if (contorno.length === 0) return
  const g = puntos.geometry
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const vel = g.getAttribute('aVelocidad') as THREE.BufferAttribute
  const az = g.getAttribute('aAzar') as THREE.BufferAttribute
  const entre = (a: readonly [number, number]): number => a[0] + (a[1] - a[0]) * azar()
  for (let i = 0; i < EXPLOSION.cuantas; i += 1) {
    const o = contorno[Math.floor(azar() * contorno.length) % contorno.length]
    pos.setXYZ(i, o.x + (azar() - 0.5) * 0.12, o.y + 0.05, o.z + (azar() - 0.5) * 0.12)
    const dx = o.x - centro.x
    const dz = o.z - centro.z
    const largo = Math.hypot(dx, dz) || 1
    const ang = Math.atan2(dz, dx) + (azar() - 0.5) * 0.9
    const afuera = entre(EXPLOSION.afuera) * (0.6 + 0.4 * Math.min(1, largo / 2))
    vel.setXYZ(i, Math.cos(ang) * afuera, entre(EXPLOSION.arriba), Math.sin(ang) * afuera)
    az.setXYZW(i, azar(), azar() * 0.08, azar(), azar())
  }
  pos.needsUpdate = true
  vel.needsUpdate = true
  az.needsUpdate = true
}

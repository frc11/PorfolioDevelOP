import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { TRAMA_GLSL } from '../estrellas/cielo'
import { TRAMA_EN_VIVO } from '../estrellas/trama'
import { FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP } from '../probeMoire'
import { AMANECER_EN_VIVO } from './luz'
import { conDithering } from '../ruidoAzul'

/**
 * [ESCENA 7] T11 · LOS HACES DEL AMANECER — el sol bajo que pasa por los cuadrados de la trama deja luz en el aire de
 * la sala: una cuenta por píxel a lo largo del rayo (en cada punto, si el camino hacia el sol pasa por un hueco de las
 * dos capas de la trama). Los prende `Amanecer.tsx` mientras hay rayos.
 *
 * [CALIDAD 1] B5 · Se dibujan a la MITAD de la resolución del lienzo en cada lado (un cuarto de los píxeles) en un
 * búfer propio, y un cuadrado los suma a la escena con el mismo aditivo. Es luz en el aire: no tiene cantos, y no se
 * prueba contra la profundidad (la cuenta corta el rayo en la pared y el piso), así que agrandarla no pierde nada.
 * Costaban 7,9 ms de GPU por cuadro a 1440 (17,8 con dpr 1,5); la cuenta por píxel no cambió. Salieron de
 * `Amanecer.tsx` en B5: con el búfer y el cuadrado pasaba las 300 líneas.
 */

/**
 * Los haces: cuántos tramos por píxel, cuánta luz por unidad de aire, el aire de la sala y, [CALIDAD 1] B5, a qué
 * fracción de la resolución del lienzo se dibujan (en cada lado).
 */
export const HACES = { pasos: 20, luz: 0.0035, alto: 10, resolucion: 0.5 } as const

const VERTEX_DE_LOS_HACES = /* glsl */ `
varying vec3 vMundo;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENT_DE_LOS_HACES = /* glsl */ `
uniform float uRayos;
uniform vec3 uSolDelAmanecer;
uniform float uTiempo;
// [CALIDAD 1] B1: el tope del lazo es un uniform: con uno fijo, el compilador de Direct3D (ANGLE) lo desenrolla entero y tarda 1,4 s.
uniform int uPasos;
varying vec3 vMundo;
${TRAMA_GLSL}
float azarDelAire( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruidoDelAire( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azarDelAire( i ), azarDelAire( i + vec3( 1, 0, 0 ) ), u.x ), mix( azarDelAire( i + vec3( 0, 1, 0 ) ), azarDelAire( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azarDelAire( i + vec3( 0, 0, 1 ) ), azarDelAire( i + vec3( 1, 0, 1 ) ), u.x ), mix( azarDelAire( i + vec3( 0, 1, 1 ) ), azarDelAire( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z );
}
void main() {
	if ( uRayos < 0.001 ) discard;
	vec3 o = cameraPosition;
	vec3 d = normalize( vMundo - o );
	// El aire de la sala: del ojo hasta la pared de la trama fina, o hasta el piso si el rayo lo toca antes.
	float a = dot( d.xz, d.xz );
	float b = dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - ${(MOIRE_NEAR_RADIUS - 1).toFixed(1)} * ${(MOIRE_NEAR_RADIUS - 1).toFixed(1)};
	float largo = a > 1e-6 ? ( - b + sqrt( max( b * b - a * c, 0.0 ) ) ) / a : 60.0;
	if ( d.y < 0.0 ) largo = min( largo, ( ${FLOOR_Y.toFixed(3)} - o.y ) / d.y );
	if ( d.y > 0.0 ) largo = min( largo, ( ${MOIRE_NEAR_TOP.toFixed(1)} - o.y ) / d.y );
	float paso = max( largo, 0.0 ) / float( uPasos );
	float corrido = fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) );
	float suma = 0.0;
	for ( int i = 0; i < uPasos; i++ ) {
		vec3 p = o + d * ( ( float( i ) + corrido ) * paso );
		// El aire de la sala: más denso abajo, y desparejo (se mueve despacio).
		float aire = ( 0.45 + 0.55 * ruidoDelAire( p * 0.18 + vec3( 0.0, uTiempo * 0.05, 0.0 ) ) ) * exp( - max( 0.0, p.y - ${FLOOR_Y.toFixed(3)} ) / ${HACES.alto.toFixed(1)} );
		suma += delanteDeLaTrama( p, uSolDelAmanecer ) * aire * paso;
	}
	// Contra el sol se ve más (el aire dispersa hacia adelante).
	float fase = 0.3 + 0.9 * pow( max( 0.0, dot( d, uSolDelAmanecer ) ), 8.0 );
	gl_FragColor = vec4( vec3( 0.92 ) * suma * ${HACES.luz.toFixed(4)} * fase * uRayos, 1.0 );
}
`

/** [CALIDAD 1] B5 · el cuadrado que suma el búfer de los haces a la escena, en todo el cuadro. */
const VERTEX_DE_LA_COMPOSICION = /* glsl */ `
varying vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`

const FRAGMENT_DE_LA_COMPOSICION = /* glsl */ `
uniform sampler2D uHaces;
varying vec2 vUv;
void main() {
	gl_FragColor = vec4( texture2D( uHaces, vUv ).rgb, 1.0 );
}
`

export type HacesDelAmanecer = ReturnType<typeof armarLosHaces>

/** Los haces, alrededor del ojo y sólo mientras hay rayos. */
export function mostrarLosHaces(h: HacesDelAmanecer, hay: boolean, ojo: THREE.Vector3): boolean {
  h.composicion.visible = hay
  h.malla.position.copy(ojo)
  return hay
}

/** [CALIDAD 1] B5 · los haces en su búfer, a `HACES.resolucion` del lienzo en cada lado (el cuadrado los suma después). */
export function dibujarLosHaces(h: HacesDelAmanecer, gl: THREE.WebGLRenderer, camara: THREE.Camera): void {
  gl.getDrawingBufferSize(h.lienzo)
  const ancho = Math.max(1, Math.ceil(h.lienzo.x * HACES.resolucion))
  const alto = Math.max(1, Math.ceil(h.lienzo.y * HACES.resolucion))
  if (h.bufer.width !== ancho || h.bufer.height !== alto) h.bufer.setSize(ancho, alto)
  const previo = gl.getRenderTarget()
  gl.setRenderTarget(h.bufer)
  gl.render(h.escena, camara)
  gl.setRenderTarget(previo)
}

/**
 * Una esfera alrededor del ojo, sin prueba de profundidad: el rayo lo corta la cuenta (la pared o el piso). [CALIDAD 1]
 * B5: en su propia escena (fondo negro, se suma), dibujada en un búfer de media resolución; el cuadrado la compone.
 */
export function armarLosHaces() {
  const geometria = new THREE.SphereGeometry(20, 32, 16)
  const material = new THREE.ShaderMaterial({
    uniforms: { ...TRAMA_EN_VIVO, uRayos: AMANECER_EN_VIVO.uRayos, uSolDelAmanecer: AMANECER_EN_VIVO.uSolDelAmanecer, uTiempo: VIVO.uTiempo, uPasos: { value: HACES.pasos } },
    vertexShader: VERTEX_DE_LOS_HACES,
    fragmentShader: FRAGMENT_DE_LOS_HACES,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthTest: false,
  })
  const malla = new THREE.Mesh(geometria, material)
  malla.name = 'rayos del amanecer'
  malla.frustumCulled = false
  const escena = new THREE.Scene()
  escena.name = 'rayos del amanecer'
  escena.background = new THREE.Color(0, 0, 0)
  escena.add(malla)
  // Medio punto flotante: la luz de los haces es poca y ocho bits la escalonarían antes de sumarla.
  const bufer = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false })
  const cuadrado = new THREE.PlaneGeometry(2, 2)
  // [CALIDAD 1] B8: la bruma de los haces es un degradé: con dithering (ruido azul).
  const mezcla = conDithering(new THREE.ShaderMaterial({
    uniforms: { uHaces: { value: bufer.texture } },
    vertexShader: VERTEX_DE_LA_COMPOSICION,
    fragmentShader: FRAGMENT_DE_LA_COMPOSICION,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  }))
  const composicion = new THREE.Mesh(cuadrado, mezcla)
  composicion.name = 'rayos del amanecer · composición'
  composicion.frustumCulled = false
  composicion.renderOrder = 3
  composicion.visible = false
  const soltar = (): void => {
    for (const d of [geometria, material, bufer, cuadrado, mezcla]) d.dispose()
  }
  return { malla, escena, bufer, composicion, lienzo: new THREE.Vector2(), soltar }
}

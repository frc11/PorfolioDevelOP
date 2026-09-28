import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { HAZ, VIVO } from '../entorno/vivo'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { FLOOR_Y } from '../probeScene'
import { MOTAS_GLSL, MOTAS_PARS_GLSL } from './motas'
import { NITIDEZ } from './nitidez'
import { AIRE } from './parche'
import { FISICA_EN_LA_MOTA_GLSL } from './simulacion'
import { POLVO_PAREJO, VOLUMEN_GLSL } from './volumen'

/**
 * [ESCENA 7] T12 · LAS SOMBRAS DE LAS MOTAS — adentro de la mancha de luz que el haz deja en el piso, cada
 * mota que cruza la columna proyecta una sombrita que se mueve con ella.
 *
 * **Cómo.** Una segunda pasada de puntos por concha, sobre las mismas motas: el vértice rehace la cuenta de
 * la mota (el volumen parejo, la física, el freno de las motas del haz) y la proyecta al piso desde el
 * óculo (la luz del haz baja de ahí), sobre el tope del bloque del piso vivo que tiene debajo. La sombra
 * es un disco blando del tamaño de la penumbra: la mota tapa una luz que viene de un óculo de
 * `HAZ.radioArriba`, así que cuanto más alta está la mota, más grande y más tenue su sombra.
 *
 * **Qué oscurece.** Sólo la luz del haz: la mezcla multiplica el piso por (1 − la parte de su luz que es
 * del charco), así que de noche, donde el charco es casi toda la luz, la sombra se ve; de día, sobre el
 * papel, casi nada (como en una habitación con sol).
 */
export const SOMBRAS = {
  /** Cuánto de la luz del charco tapa una mota, en el centro de su sombra. */
  tapa: 0.4,
  /** El lado mínimo de la sombra (u): la mota misma. */
  minimo: 0.05,
  /** La luz propia del piso contra la del charco (lineal): de día el papel, de noche casi nada. */
  piso: { dia: 0.78, noche: 0.03 },
} as const

const f = (x: number): string => x.toFixed(4)

const VERTEX = /* glsl */ `
#include <common>
attribute float aIndice;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
uniform float uNoche;
uniform float uTiempo;
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
uniform float uAlto;
varying float vParejo;
varying float vSombra;
#ifdef AIRE_FISICA
	uniform sampler2D uFisica;
	uniform mat4 uLogo;
#endif
#ifdef AIRE_INERCIA
	uniform vec3 uDeriva;
#endif
${MOTAS_PARS_GLSL}
float pisoBajo( vec2 xz ) {
	if ( uGrillaDelPiso.z < 0.5 ) return ${f(FLOOR_Y)};
	ivec2 celda = ivec2( floor( xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5 ) );
	if ( celda.x < 0 || celda.y < 0 || celda.x >= int( uGrillaDelPiso.x ) || celda.y >= int( uGrillaDelPiso.x ) ) return ${f(FLOOR_Y)};
	return ${f(FLOOR_Y)} + texelFetch( uPisoVivo, celda, 0 ).b;
}
void main() {
	vec3 transformed = position;
	float modoDeLaFisica = 0.0;
	${VOLUMEN_GLSL}
	#ifdef AIRE_FISICA
		${FISICA_EN_LA_MOTA_GLSL}
	#endif
	#ifdef AIRE_MOTAS
		${MOTAS_GLSL}
	#endif
	vec3 mundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
	float enElHaz = enLaColumna( mundo );
	vec3 oculo = vec3( 0.0, ${f(HAZ.arriba)}, 0.0 );
	float suelo = pisoBajo( mundo.xz );
	float alto = mundo.y - suelo;
	vSombra = 0.0;
	gl_PointSize = 0.0;
	gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
	if ( enElHaz < 0.01 || vParejo < 0.002 || alto < 0.03 || mundo.y >= oculo.y ) return;
	// Desde el óculo, a través de la mota, hasta el piso.
	vec3 enElPiso = mundo + ( mundo - oculo ) * ( alto / ( oculo.y - mundo.y ) );
	enElPiso.y = pisoBajo( enElPiso.xz ) + 0.012;
	float penumbra = ${f(SOMBRAS.minimo)} + 2.0 * ${f(HAZ.radioArriba)} * alto / ( oculo.y - mundo.y );
	// El punto es un cuadrado de frente a la cámara: se lo trae hacia ella para que el piso inclinado no le corte la mitad.
	vec3 alOjo = normalize( cameraPosition - enElPiso );
	gl_Position = projectionMatrix * viewMatrix * vec4( enElPiso + alOjo * ( 1.2 * penumbra + 0.05 ), 1.0 );
	gl_PointSize = penumbra * projectionMatrix[ 1 ][ 1 ] * uAlto * 0.5 / gl_Position.w;
	// La luz del charco en ese punto, contra la luz propia del piso.
	float r = length( enElPiso.xz ) / ${f(HAZ.radioAbajo)};
	float charco = exp( - r * r * 2.2 ) * mix( uHazDia.y, uHazNoche.y, uNoche );
	float propia = mix( ${f(SOMBRAS.piso.dia)}, ${f(SOMBRAS.piso.noche)}, uNoche );
	// Más chica, más oscura: la misma sombra repartida en la penumbra.
	vSombra = ${f(SOMBRAS.tapa)} * charco / ( propia + charco ) * vParejo * min( 1.0, pow( ${f(SOMBRAS.minimo * 3)} / penumbra, 0.7 ) );
}
`

const FRAGMENT = /* glsl */ `
varying float vSombra;
void main() {
	float r = length( gl_PointCoord - 0.5 );
	float a = vSombra * ( 1.0 - smoothstep( 0.2, 0.5, r ) );
	if ( a < 0.002 ) discard;
	// Mezcla propia: el piso por (1 − a); el alfa del lienzo no se toca.
	gl_FragColor = vec4( vec3( a ), 1.0 );
}
`

/** El material de las sombras de la concha `concha` (sus motas son las de esa concha del polvo). */
export function materialDeLasSombras(concha: number): THREE.ShaderMaterial {
  const e = entornoDeLaEscena()
  const defines: Record<string, string> = {
    AIRE_PAREJO: '',
    CONCHA_DEL_POLVO: String(concha),
    CERCA_DEL_POLVO: (e.nitidez ? NITIDEZ.cerca : POLVO_PAREJO.cerca).toFixed(2),
    ...(e.posarse ? { AIRE_FISICA: '' } : {}),
    ...(e.inercia ? { AIRE_INERCIA: '' } : {}),
    ...(e.motas && e.E1 ? { AIRE_MOTAS: '' } : {}),
  }
  return new THREE.ShaderMaterial({
    defines,
    uniforms: {
      ...AIRE,
      ...PISO_EN_VIVO,
      uTiempo: VIVO.uTiempo,
      uNoche: VIVO.uNoche,
      uHazDia: VIVO.uHazDia,
      uHazNoche: VIVO.uHazNoche,
      uAlto: SOMBRAS_EN_VIVO.uAlto,
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor,
    blendDst: THREE.OneMinusSrcColorFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  })
}

/** El alto del búfer de dibujo (px): el tamaño de la sombra en pantalla. Lo escribe `DepthParticles`. */
export const SOMBRAS_EN_VIVO = { uAlto: { value: 900 } }

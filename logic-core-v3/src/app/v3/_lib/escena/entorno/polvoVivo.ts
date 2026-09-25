import type * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { FLOOR_Y } from '../probeScene'
import { HAZ, VIVO } from './vivo'

/**
 * [ESCENA 3] EL POLVO VIVO — un parche sobre el `PointsMaterial` del polvo que junta tres ideas,
 * cada una compilada sólo si está prendida:
 *
 * - **E1** · adentro del haz la mota toma su luz y crece un poco;
 * - **E6** · la ESTELA: cada mota se proyecta también con una copia amortiguada de la
 *   vista-proyección (`uVPPrevio`), y la distancia en pantalla entre las dos proyecciones es su
 *   estela. El paralaje hace el resto: una mota cercana recorre más pantalla por el mismo
 *   movimiento de cámara, así que se estira más. Cuando el scroll frena, la copia alcanza a la
 *   cámara y la estela se encoge sola: ésa es la inercia;
 * - **E7** · el CURSOR corre las motas en pantalla, más a las cercanas, y la fuerza se apaga
 *   cuando el puntero se queda quieto: vuelven solas. El alcance está en `uCursorAlcance`.
 *
 * La mota se dibuja como una cápsula dentro del sprite: el sprite crece lo que mide la estela y
 * el perfil radial del punto se lee a lo largo del segmento. Encadena el `onBeforeCompile` que ya
 * tenía (`conBrilloDeNoche`), no lo pisa.
 */
export function conPolvoVivo<T extends THREE.Material>(material: T): T {
  const e = entornoDeLaEscena()
  const defines = [
    e.E1 ? '#define POLVO_HAZ' : '',
    e.E6 ? '#define POLVO_ESTELA' : '',
    e.E7 ? '#define POLVO_CURSOR' : '',
  ]
    .filter(Boolean)
    .join('\n')
  if (defines === '') return material
  return parchear(material, defines, (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_VERTEX}`)
      .replace('#include <fog_vertex>', `#include <fog_vertex>\n${CUERPO_VERTEX}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_FRAGMENT}`)
      .replace('#include <map_particle_fragment>', MAPA_DE_LA_CAPSULA)
      .replace('#include <alphatest_fragment>', `${LUZ_DEL_HAZ}\n#include <alphatest_fragment>`)
  })
}

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

function parchear<T extends THREE.Material>(material: T, defines: string, cambiar: (shader: Shader) => void): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    // Todo menos `uNoche`: la mota sigue leyendo el uniform de la noche que ya tenía.
    Object.assign(shader.uniforms, Object.fromEntries(Object.entries(VIVO).filter(([nombre]) => nombre !== 'uNoche')))
    cambiar(shader)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|polvo-vivo|${defines}`
  material.needsUpdate = true
  return material
}

const PARS_VERTEX = /* glsl */ `
uniform mat4 uVPPrevio;
uniform vec2 uResolucion;
uniform float uEstela;
uniform vec2 uCursor;
uniform float uEmpuje;
uniform float uAspecto;
uniform vec3 uCursorAlcance;
uniform float uHaz;
uniform float uNoche;
varying vec2 vDireccion;
varying float vEstira;
varying float vAlfa;
varying float vEnElHaz;
// E7 · cuánto corre el cursor a una mota que está en ndc, a esa profundidad.
vec2 empujeEn( vec2 ndc, vec2 cursor, float empuje, float profundidad ) {
	vec2 lejos = ( ndc - cursor ) * vec2( uAspecto, 1.0 );
	float d2 = dot( lejos, lejos );
	float peso = clamp( uCursorAlcance.y / max( profundidad, 0.1 ), uCursorAlcance.z, 2.5 );
	float fuerza = empuje * exp( - d2 / uCursorAlcance.x ) * peso;
	vec2 hacia = d2 > 1e-8 ? lejos * inversesqrt( d2 ) : vec2( 0.0 );
	return hacia * vec2( 1.0 / uAspecto, 1.0 ) * fuerza * 0.2;
}
`

const CUERPO_VERTEX = /* glsl */ `
	vDireccion = vec2( 1.0, 0.0 );
	vEstira = 0.0;
	vAlfa = 1.0;
	vEnElHaz = 0.0;
	float profundidad = - mvPosition.z;
	float cerca = clamp( 10.0 / max( profundidad, 0.1 ), 0.0, 2.5 );
	vec2 ndc = gl_Position.xy / gl_Position.w;
	#ifdef POLVO_ESTELA
		// Antes de que el cursor la corra: la estela es de la CÁMARA.
		vec4 antes = uVPPrevio * modelMatrix * vec4( transformed, 1.0 );
		vec2 enPixeles = ( ndc - antes.xy / antes.w ) * 0.5 * uResolucion;
	#endif
	#ifdef POLVO_HAZ
		vec4 mundo = modelMatrix * vec4( transformed, 1.0 );
		float alto = clamp( ( mundo.y - ${FLOOR_Y.toFixed(4)} ) / ( ${HAZ.arriba.toFixed(1)} - ${FLOOR_Y.toFixed(4)} ), 0.0, 1.0 );
		float radio = mix( ${HAZ.radioAbajo.toFixed(2)}, ${HAZ.radioArriba.toFixed(2)}, alto );
		vEnElHaz = uHaz * ( 1.0 - smoothstep( 0.55, 1.0, length( mundo.xz ) / radio ) );
		gl_PointSize *= 1.0 + mix( 0.55, 0.35, uNoche ) * vEnElHaz;
	#endif
	#ifdef POLVO_ESTELA
		float largo = min( length( enPixeles ) * uEstela, 22.0 * cerca + 4.0 );
		if ( largo > 0.25 ) {
			vDireccion = normalize( enPixeles );
			vEstira = largo / ( gl_PointSize + largo );
			gl_PointSize += largo;
			vAlfa *= pow( 1.0 - vEstira, 0.6 );
		}
	#endif
	#ifdef POLVO_CURSOR
		gl_Position.xy += empujeEn( ndc, uCursor, uEmpuje, profundidad ) * gl_Position.w;
	#endif
`

// `uNoche` ya lo declara `conBrilloDeNoche`, que corre antes: acá se usa, no se redeclara.
const PARS_FRAGMENT = /* glsl */ `
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
varying vec2 vDireccion;
varying float vEstira;
varying float vAlfa;
varying float vEnElHaz;
`

/**
 * La cápsula: el punto de siempre si no hay estela (el perfil radial del sprite, leído en su
 * radio), y un segmento con ese mismo perfil a los costados cuando la hay.
 */
const MAPA_DE_LA_CAPSULA = /* glsl */ `
	vec2 pc = gl_PointCoord - 0.5;
	pc.y = - pc.y;
	float mitad = vEstira * 0.5;
	vec2 alSegmento = pc - clamp( dot( pc, vDireccion ), - mitad, mitad ) * vDireccion;
	float r = length( alSegmento ) / max( 1.0 - vEstira, 1e-3 );
	#ifdef USE_MAP
		diffuseColor *= texture2D( map, vec2( 0.5 + min( r, 0.5 ), 0.5 ) );
	#endif
	diffuseColor.a *= vAlfa * step( r, 0.5 );
	// La cabeza (donde está la mota ahora) plena y la cola apagándose: una estela, no un guion.
	float aLoLargo = mitad > 1e-4 ? clamp( dot( pc, vDireccion ) / mitad, - 1.0, 1.0 ) : 1.0;
	diffuseColor.a *= mix( 0.2, 1.0, smoothstep( - 1.0, 0.7, aLoLargo ) );
`

/**
 * E1 · la mota dentro del haz toma su luz. De noche, fría y clara. De día, sobre el papel, una
 * mota clara desaparece: toma un ámbar medio y pesa más, y así la columna se lee por el polvo.
 */
const LUZ_DEL_HAZ = /* glsl */ `
	#ifdef POLVO_HAZ
		vec3 luzDelHaz = mix( vec3( 0.72, 0.58, 0.36 ), vec3( 0.82, 0.9, 1.0 ), uNoche );
		float cuantoHaz = vEnElHaz * mix( uHazDia.z, uHazNoche.z, uNoche );
		diffuseColor.rgb = mix( diffuseColor.rgb, luzDelHaz, cuantoHaz );
		diffuseColor.a = min( 1.0, diffuseColor.a * ( 1.0 + mix( 1.0, 0.6, uNoche ) * vEnElHaz ) );
	#endif
`

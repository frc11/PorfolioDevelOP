import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { PARTICLE_FAR_COLOR, PARTICLE_NEAR_COLOR } from '../probeParticles'
import { MOTAS_FRAGMENT_GLSL, MOTAS_GLSL, MOTAS_PARS_GLSL, MOTAS_TAM_GLSL } from './motas'
import { CAMPO_DEL_LOGO_GLSL, CAMPO_EN_VIVO } from './campoDelLogo'
import { DISTANCIA_AL_LOGO_GLSL, HOLGURA } from './obstaculo'
import { NITIDEZ, NITIDEZ_FRAGMENT_GLSL, NITIDEZ_VERTEX_GLSL } from './nitidez'
import { AMANECER_EN_VIVO, AMANECER_GLSL, hayAmanecer } from '../amanecer/luz'
import { FISICA_EN_LA_MOTA_GLSL } from './simulacion'
import { POLVO_PAREJO, VOLUMEN_GLSL } from './volumen'

/**
 * [ESCENA 5] EL AIRE — el parche sobre el material de cada concha de polvo (y del bokeh, para 5a)
 * que junta lo nuevo, cada parte compilada sólo si está prendida:
 *
 * - **el volumen parejo** (`volumen.ts`, en el producto): la caja que acompaña a la cámara;
 * - **5a** · el logo no se atraviesa (`obstaculo.ts`), antes de proyectar y, con E7, otra vez
 *   después del empuje del cursor (en el producto desde ESCENA 6);
 * - **5d** · las motas del haz (`motas.ts`, en el producto desde ESCENA 6);
 * - [ESCENA 6] **la física** (`simulacion.ts`, con `posarse`): la posición sale de la
 *   simulación de cada mota;
 * - [ESCENA 6] **6a** · la inercia del aire: todo el volumen corrido por `uDeriva` antes de repetirse.
 *
 * Todo pasa sobre `transformed` ANTES de proyectar, así que E1, E6 y E7 (`entorno/polvoVivo.ts`) leen
 * la mota ya movida, como leían la fija: su código no cambia. Encadena el `onBeforeCompile` que ya
 * tenía, no lo pisa. Los uniforms los escribe `Aire.tsx`.
 */

const lineal = (hex: string): THREE.Vector3 => {
  const c = new THREE.Color(hex)
  return new THREE.Vector3(c.r, c.g, c.b)
}

export const AIRE = {
  uTintaCerca: { value: lineal(PARTICLE_NEAR_COLOR) },
  uTintaLejos: { value: lineal(PARTICLE_FAR_COLOR) },
  uLogoC: { value: new THREE.Vector4(0, 0, 1, 0) },
  uLogoP: { value: new THREE.Vector4(0, 0, 1, 0) },
  uLogoPalo: { value: new THREE.Vector4(0, 0, 0, 0) },
  uLogo: { value: new THREE.Matrix4() },
  uLogoInverso: { value: new THREE.Matrix4() },
  uContraGiro: { value: [0, 0, 0] },
  uMotas: { value: 0 },
  /** [ESCENA 7] T9 · cuánto más brillan las motas con el haz prendido (1 = como antes). */
  uBrilloDeLasMotas: { value: 1 },
  /** [ESCENA 6] La simulación de cada mota (la salida de posición y modo) y el corrimiento de 6a. */
  uFisica: { value: null as THREE.Texture | null },
  uDeriva: { value: new THREE.Vector3() },
  /** [ESCENA 7] T7 · el aire que corre (6a), en u/s: lo que rodea al logo en la física. */
  uVientoDelAire: { value: new THREE.Vector3() },
  /** [ESCENA 7] T10 · píxeles del búfer por píxel CSS: el lado nítido de la mota es en píxeles CSS. */
  uPixel: { value: 1 },
}

export type Campo = 'polvo' | 'bokeh'

const PARS_VERTEX = /* glsl */ `
uniform vec3 uTintaCerca;
uniform vec3 uTintaLejos;
varying float vParejo;
#ifdef AIRE_OBSTACULO
	${DISTANCIA_AL_LOGO_GLSL}
	#ifdef AIRE_FISICA
		${CAMPO_DEL_LOGO_GLSL}
		// [CALIDAD 1] A3 · tras el cursor, contra la malla real: la boca de la «c» y el ojo de la «p» quedan abiertos
		// (con las formas de siempre, la mota que caía en la boca se corría a una pared que no existe).
		vec3 afueraDelCampo( vec3 mundo, float holgura ) {
			vec3 q = ( uLogoInverso * vec4( mundo, 1.0 ) ).xyz;
			float d = campoDelLogo( q );
			if ( d >= 2.0 * holgura ) return mundo;
			float u = clamp( ( d + 0.6 ) / ( 2.0 * holgura + 0.6 ), 0.0, 1.0 );
			return ( uLogo * vec4( q + normalDelCampo( q ) * ( holgura * ( 1.0 + u * u ) - d ), 1.0 ) ).xyz;
		}
	#endif
#elif defined( AIRE_FISICA )
	uniform mat4 uLogo;
#endif
#ifdef AIRE_FISICA
	attribute float aIndice;
	uniform sampler2D uFisica;
#endif
#ifdef AIRE_INERCIA
	uniform vec3 uDeriva;
#endif
#ifdef AIRE_MOTAS
	${MOTAS_PARS_GLSL}
#else
	varying float vDestello;
#endif
#ifdef POLVO_NITIDO
	uniform float uPixel;
	varying float vDesenfoque;
	varying float vLadoN;
#endif
#ifdef AMANECER
	varying vec3 vMundoDelAmanecer;
#endif
uniform float uTiempo;
`

const CUERPO = /* glsl */ `
	vParejo = 1.0;
	vDestello = 0.0;
	float modoDeLaFisica = 0.0;
	#ifdef AIRE_PAREJO
		${VOLUMEN_GLSL}
	#endif
	#if defined( AIRE_OBSTACULO ) && ! defined( AIRE_FISICA )
		// Sin física (el bokeh, o el banco sin posarse), la holgura fija; con física, lo hace la simulación.
		{
			vec3 enElMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
			vec3 fuera = afueraDelLogo( enElMundo, HOLGURA_DEL_CAMPO );
			transformed = transpose( mat3( modelMatrix ) ) * ( fuera - modelMatrix[ 3 ].xyz );
		}
	#endif
	#ifdef AIRE_FISICA
		${FISICA_EN_LA_MOTA_GLSL}
	#endif
	#ifdef AIRE_MOTAS
		${MOTAS_GLSL}
	#endif
	#ifdef AMANECER
		vMundoDelAmanecer = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
	#endif
	// Lo que queda afuera de la sala va detrás de la cámara: no pinta un píxel.
	if ( vParejo < 0.002 ) transformed = ( transpose( mat3( modelMatrix ) ) * ( cameraPosition - modelMatrix[ 3 ].xyz ) ) - transpose( mat3( modelMatrix ) ) * vec3( viewMatrix[ 0 ][ 2 ], viewMatrix[ 1 ][ 2 ], viewMatrix[ 2 ][ 2 ] ) * -50.0;
`

/** Con E7, después del empuje del cursor: la mota empujada contra el logo se desliza por su borde. */
const DESPUES_DEL_CURSOR = /* glsl */ `
	#if defined( AIRE_OBSTACULO ) && defined( POLVO_CURSOR )
	// La que está sobre el logo o resbalando ya está en su cara: no se la corre la holgura.
	if ( modoDeLaFisica < 2.5 || ( modoDeLaFisica > 4.5 && modoDeLaFisica < 5.5 ) ) {
		vec3 enLaVista = vec3( gl_Position.x / projectionMatrix[ 0 ][ 0 ], gl_Position.y / projectionMatrix[ 1 ][ 1 ], mvPosition.z );
		vec3 enElMundo = transpose( mat3( viewMatrix ) ) * ( enLaVista - viewMatrix[ 3 ].xyz );
		#ifdef AIRE_FISICA
			vec3 fuera = afueraDelCampo( enElMundo, HOLGURA_TRAS_EL_CURSOR );
		#else
			vec3 fuera = afueraDelLogo( enElMundo, HOLGURA_TRAS_EL_CURSOR );
		#endif
		if ( fuera != enElMundo ) gl_Position = projectionMatrix * viewMatrix * vec4( fuera, 1.0 );
	}
	#endif
`

const PARS_FRAGMENT = /* glsl */ `
varying float vParejo;
varying float vDestello;
#ifdef POLVO_NITIDO
	varying float vDesenfoque;
	varying float vLadoN;
#endif
#ifdef AMANECER
	varying vec3 vMundoDelAmanecer;
	${AMANECER_GLSL}
#endif
`

const FRAGMENTO = /* glsl */ `
	diffuseColor.a *= vParejo;
	#ifdef AMANECER
		// [ESCENA 7] T11: la mota guarda su blanco de noche hasta que el frente del día la alcanza.
		diffuseColor.rgb = mix( vec3( 1.0 ), diffuseColor.rgb, alcanzadoPorElDia( vMundoDelAmanecer ) );
	#endif
	#ifdef AIRE_MOTAS
		${MOTAS_FRAGMENT_GLSL}
	#endif
`

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

/** Qué partes lleva este campo en esta carga ('' si ninguna). */
function definesDe(campo: Campo, concha: number): string {
  const e = entornoDeLaEscena()
  const partes = [
    campo === 'polvo' && e.polvoParejo ? '#define AIRE_PAREJO' : '',
    e.obstaculo ? '#define AIRE_OBSTACULO' : '',
    campo === 'polvo' && e.polvoParejo && e.posarse ? '#define AIRE_FISICA' : '',
    campo === 'polvo' && e.polvoParejo && e.inercia ? '#define AIRE_INERCIA' : '',
    campo === 'polvo' && e.motas && e.E1 ? '#define AIRE_MOTAS' : '',
    campo === 'polvo' && e.nitidez ? '#define POLVO_NITIDO' : '',
    campo === 'polvo' && hayAmanecer() ? '#define AMANECER' : '',
  ].filter(Boolean)
  if (partes.length === 0) return ''
  const holgura = campo === 'polvo' ? HOLGURA.polvo : HOLGURA.bokeh
  // [ESCENA 7] Con la física, tras el cursor sólo un margen: que el cursor no meta una mota en el logo.
  const trasElCursor = partes.includes('#define AIRE_FISICA') ? 0.1 : holgura
  // [ESCENA 7] T10: con el polvo nítido, la mota se desvanece contra la lente más cerca (quedan unas pocas desenfocadas).
  const cerca = campo === 'polvo' && e.nitidez ? NITIDEZ.cerca : POLVO_PAREJO.cerca
  return [...partes, `#define CONCHA_DEL_POLVO ${String(concha)}`, `#define HOLGURA_DEL_CAMPO ${holgura.toFixed(2)}`, `#define HOLGURA_TRAS_EL_CURSOR ${trasElCursor.toFixed(2)}`, `#define CERCA_DEL_POLVO ${cerca.toFixed(2)}`].join('\n')
}

/** ¿Este campo lleva el volumen parejo? (El componente arma su búfer según esto.) */
export function llevaElVolumenParejo(campo: Campo): boolean {
  return campo === 'polvo' && entornoDeLaEscena().polvoParejo
}

export function conAire<T extends THREE.Material>(material: T, campo: Campo, concha: number): T {
  const defines = definesDe(campo, concha)
  if (defines === '') return material
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader: Shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, AIRE, AMANECER_EN_VIVO, CAMPO_EN_VIVO, { uTiempo: VIVO.uTiempo })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_VERTEX}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${CUERPO}`)
      .replace('#include <logdepthbuf_vertex>', `${NITIDEZ_VERTEX_GLSL}\n#ifdef AIRE_MOTAS\n${MOTAS_TAM_GLSL}\n#endif\n#include <logdepthbuf_vertex>`)
      .replace(/\}\s*$/, `${DESPUES_DEL_CURSOR}\n}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_FRAGMENT}`)
      // [ESCENA 7] T10: el perfil de la mota, nítido (o desenfocado si está muy cerca), en lugar del sprite blando.
      .replace('diffuseColor *= texture2D( map, vec2( 0.5 + min( r, 0.5 ), 0.5 ) );', `#ifdef POLVO_NITIDO\n${NITIDEZ_FRAGMENT_GLSL}\n#else\n\t\tdiffuseColor *= texture2D( map, vec2( 0.5 + min( r, 0.5 ), 0.5 ) );\n#endif`)
      .replace('#include <alphatest_fragment>', `${FRAGMENTO}\n#include <alphatest_fragment>`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|aire|${defines.replace(/\s+/g, ' ')}`
  material.needsUpdate = true
  return material
}

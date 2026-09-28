import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { PARTICLE_FAR_COLOR, PARTICLE_NEAR_COLOR } from '../probeParticles'
import { MOTAS_FRAGMENT_GLSL, MOTAS_GLSL, MOTAS_PARS_GLSL, MOTAS_TAM_GLSL } from './motas'
import { DISTANCIA_AL_LOGO_GLSL, HOLGURA } from './obstaculo'
import { FISICA_EN_LA_MOTA_GLSL } from './simulacion'
import { VOLUMEN_GLSL } from './volumen'

/**
 * [ESCENA 5] EL AIRE — el parche sobre el material de cada concha de polvo (y del bokeh, para 5a)
 * que junta lo nuevo, cada parte compilada sólo si está prendida:
 *
 * - **el volumen parejo** (`volumen.ts`, en el producto): la caja que acompaña a la cámara;
 * - **5a** · el logo no se atraviesa (`obstaculo.ts`), antes de proyectar y, con E7, otra vez
 *   después del empuje del cursor (en el producto desde ESCENA 6);
 * - **5d** · las motas del haz (`motas.ts`, en el producto desde ESCENA 6);
 * - [ESCENA 6] **la física** (`simulacion.ts`, con `posarse` o 6b `remolinos`): la posición sale de la
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
  uAbrir: { value: 0 },
  uContraGiro: { value: [0, 0, 0] },
  uMotas: { value: 0 },
  /** [ESCENA 6] La simulación de cada mota (la salida de posición y modo) y el corrimiento de 6a. */
  uFisica: { value: null as THREE.Texture | null },
  uDeriva: { value: new THREE.Vector3() },
}

export type Campo = 'polvo' | 'bokeh'

const PARS_VERTEX = /* glsl */ `
uniform vec3 uTintaCerca;
uniform vec3 uTintaLejos;
varying float vParejo;
#ifdef AIRE_OBSTACULO
	${DISTANCIA_AL_LOGO_GLSL}
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
uniform float uTiempo;
`

const CUERPO = /* glsl */ `
	vParejo = 1.0;
	vDestello = 0.0;
	float modoDeLaFisica = 0.0;
	#ifdef AIRE_PAREJO
		${VOLUMEN_GLSL}
	#endif
	#ifdef AIRE_OBSTACULO
		{
			vec3 enElMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
			vec3 fuera = afueraDelLogo( enElMundo, HOLGURA_DEL_CAMPO + uAbrir * ${HOLGURA.alAbrir.toFixed(2)} );
			transformed = transpose( mat3( modelMatrix ) ) * ( fuera - modelMatrix[ 3 ].xyz );
		}
	#endif
	#ifdef AIRE_FISICA
		${FISICA_EN_LA_MOTA_GLSL}
	#endif
	#ifdef AIRE_MOTAS
		${MOTAS_GLSL}
	#endif
	// Lo que queda afuera de la sala va detrás de la cámara: no pinta un píxel.
	if ( vParejo < 0.002 ) transformed = ( transpose( mat3( modelMatrix ) ) * ( cameraPosition - modelMatrix[ 3 ].xyz ) ) - transpose( mat3( modelMatrix ) ) * vec3( viewMatrix[ 0 ][ 2 ], viewMatrix[ 1 ][ 2 ], viewMatrix[ 2 ][ 2 ] ) * -50.0;
`

/** Con E7, después del empuje del cursor: la mota empujada contra el logo se desliza por su borde. */
const DESPUES_DEL_CURSOR = /* glsl */ `
	#if defined( AIRE_OBSTACULO ) && defined( POLVO_CURSOR )
	// La que está sobre el logo (o resbalando) ya está en su cara: no se la corre la holgura.
	if ( modoDeLaFisica < 2.5 || modoDeLaFisica > 4.5 ) {
		vec3 enLaVista = vec3( gl_Position.x / projectionMatrix[ 0 ][ 0 ], gl_Position.y / projectionMatrix[ 1 ][ 1 ], mvPosition.z );
		vec3 enElMundo = transpose( mat3( viewMatrix ) ) * ( enLaVista - viewMatrix[ 3 ].xyz );
		vec3 fuera = afueraDelLogo( enElMundo, HOLGURA_DEL_CAMPO + uAbrir * ${HOLGURA.alAbrir.toFixed(2)} );
		if ( fuera != enElMundo ) gl_Position = projectionMatrix * viewMatrix * vec4( fuera, 1.0 );
	}
	#endif
`

const PARS_FRAGMENT = /* glsl */ `
varying float vParejo;
varying float vDestello;
`

const FRAGMENTO = /* glsl */ `
	diffuseColor.a *= vParejo;
	#ifdef AIRE_MOTAS
		${MOTAS_FRAGMENT_GLSL}
	#endif
`

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

/** Qué partes lleva este campo en esta carga ('' si ninguna). */
function definesDe(campo: Campo, concha: number): string {
  const e = entornoDeLaEscena()
  const p = e.pruebas
  const partes = [
    campo === 'polvo' && e.polvoParejo ? '#define AIRE_PAREJO' : '',
    e.obstaculo ? '#define AIRE_OBSTACULO' : '',
    campo === 'polvo' && e.polvoParejo && (p.posarse || p.remolinos) ? '#define AIRE_FISICA' : '',
    campo === 'polvo' && e.polvoParejo && p.inercia ? '#define AIRE_INERCIA' : '',
    campo === 'polvo' && e.motas && e.E1 ? '#define AIRE_MOTAS' : '',
  ].filter(Boolean)
  if (partes.length === 0) return ''
  return [...partes, `#define CONCHA_DEL_POLVO ${String(concha)}`, `#define HOLGURA_DEL_CAMPO ${(campo === 'polvo' ? HOLGURA.polvo : HOLGURA.bokeh).toFixed(2)}`].join('\n')
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
    Object.assign(shader.uniforms, AIRE, { uTiempo: VIVO.uTiempo })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_VERTEX}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${CUERPO}`)
      .replace('#include <logdepthbuf_vertex>', `#ifdef AIRE_MOTAS\n${MOTAS_TAM_GLSL}\n#endif\n#include <logdepthbuf_vertex>`)
      .replace(/\}\s*$/, `${DESPUES_DEL_CURSOR}\n}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_FRAGMENT}`)
      .replace('#include <alphatest_fragment>', `${FRAGMENTO}\n#include <alphatest_fragment>`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|aire|${defines.replace(/\s+/g, ' ')}`
  material.needsUpdate = true
  return material
}

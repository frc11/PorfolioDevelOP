import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { PARTICLE_FAR_COLOR, PARTICLE_NEAR_COLOR } from '../probeParticles'
import { MOTAS_FRAGMENT_GLSL, MOTAS_GLSL, MOTAS_PARS_GLSL, MOTAS_TAM_GLSL } from './motas'
import { NITIDEZ, NITIDEZ_FRAGMENT_GLSL, NITIDEZ_VERTEX_GLSL } from './nitidez'
import { AMANECER_EN_VIVO, AMANECER_GLSL, hayAmanecer } from '../amanecer/luz'
import { FISICA_EN_LA_MOTA_GLSL } from './simulacion'
import { NUMERO_DE_LA_VARIANTE, VARIANTE_FRAGMENT_GLSL, VARIANTE_PARS_GLSL, VARIANTE_VERTEX_GLSL } from './variantes'
import { POLVO_PAREJO, VOLUMEN_GLSL } from './volumen'

/**
 * [ESCENA 5] EL AIRE — el parche sobre el material de cada concha de polvo (y del bokeh, para 5a)
 * que junta lo nuevo, cada parte compilada sólo si está prendida:
 *
 * - **el volumen parejo** (`volumen.ts`, en el producto): la caja que acompaña a la cámara;
 * - ~~**5a**~~ · el logo no se atravesaba (la holgura, antes de proyectar y después del empuje del cursor).
 *   [ESCENA 9] T1: borrado; el polvo y el bokeh atraviesan al logo, que los tapa;
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
  /** La forma del logo en las formas de siempre (dos anillos y el palo): la leen el piso vivo y la fugaz. */
  uLogoC: { value: new THREE.Vector4(0, 0, 1, 0) },
  uLogoP: { value: new THREE.Vector4(0, 0, 1, 0) },
  uLogoPalo: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** La pose del logo: la del polvo posado sobre él (en su espacio). */
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
  /** [CALIDAD 1] B11 · qué fracción de las motas está encendida (la calidad adaptativa la baja con un fundido). */
  uFraccionDeMotas: { value: 1 },
}

export type Campo = 'polvo' | 'bokeh'

const PARS_VERTEX = /* glsl */ `
uniform vec3 uTintaCerca;
uniform vec3 uTintaLejos;
varying float vParejo;
#ifdef AIRE_FISICA
	uniform mat4 uLogo;
	attribute float aIndice;
	uniform sampler2D uFisica;
	uniform float uFraccionDeMotas;
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
${VARIANTE_PARS_GLSL}
`

const CUERPO = /* glsl */ `
	vParejo = 1.0;
	vDestello = 0.0;
	float modoDeLaFisica = 0.0;
	float carasDelAire = 1.0;
	float pisoDelAire = 1.0;
	#ifdef AIRE_PAREJO
		${VOLUMEN_GLSL}
	#endif
	#ifdef AIRE_FISICA
		${FISICA_EN_LA_MOTA_GLSL}
		// [CALIDAD 1] B11 · con la calidad bajada se apaga una fracción de las motas, al azar y parejo, con un fundido.
		vParejo *= 1.0 - smoothstep( uFraccionDeMotas, uFraccionDeMotas + 0.05, fract( sin( aIndice * 12.9898 + 78.233 ) * 43758.5453 ) );
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
${VARIANTE_PARS_GLSL}
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
    campo === 'polvo' && e.polvoParejo && e.posarse ? '#define AIRE_FISICA' : '',
    campo === 'polvo' && e.polvoParejo && e.inercia ? '#define AIRE_INERCIA' : '',
    campo === 'polvo' && e.motas && e.E1 ? '#define AIRE_MOTAS' : '',
    campo === 'polvo' && e.nitidez ? '#define POLVO_NITIDO' : '',
    campo === 'polvo' && hayAmanecer() ? '#define AMANECER' : '',
    // [RETOQUE 3D] Una de las tres variantes (`variantes.ts`), sólo con su prueba y con el polvo nítido.
    campo === 'polvo' && e.nitidez && e.pruebas.polvo !== 'no' ? `#define POLVO_VARIANTE ${String(NUMERO_DE_LA_VARIANTE[e.pruebas.polvo])}` : '',
  ].filter(Boolean)
  if (partes.length === 0) return ''
  // [ESCENA 7] T10: con el polvo nítido, la mota se desvanece contra la lente más cerca (quedan unas pocas desenfocadas).
  const cerca = campo === 'polvo' && e.nitidez ? NITIDEZ.cerca : POLVO_PAREJO.cerca
  return [...partes, `#define CONCHA_DEL_POLVO ${String(concha)}`, `#define CERCA_DEL_POLVO ${cerca.toFixed(2)}`].join('\n')
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
    Object.assign(shader.uniforms, AIRE, AMANECER_EN_VIVO, { uTiempo: VIVO.uTiempo })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_VERTEX}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${CUERPO}`)
      .replace('#include <logdepthbuf_vertex>', `${NITIDEZ_VERTEX_GLSL}\n${VARIANTE_VERTEX_GLSL}\n#ifdef AIRE_MOTAS\n${MOTAS_TAM_GLSL}\n#endif\n#include <logdepthbuf_vertex>`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${defines}\n${PARS_FRAGMENT}`)
      // [ESCENA 7] T10: el perfil de la mota, nítido (o desenfocado si está muy cerca), en lugar del sprite blando.
      .replace('diffuseColor *= texture2D( map, vec2( 0.5 + min( r, 0.5 ), 0.5 ) );', `#if defined( POLVO_VARIANTE )\n${VARIANTE_FRAGMENT_GLSL}\n#elif defined( POLVO_NITIDO )\n${NITIDEZ_FRAGMENT_GLSL}\n#else\n\t\tdiffuseColor *= texture2D( map, vec2( 0.5 + min( r, 0.5 ), 0.5 ) );\n#endif`)
      .replace('#include <alphatest_fragment>', `${FRAGMENTO}\n#include <alphatest_fragment>`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|aire|${defines.replace(/\s+/g, ' ')}`
  material.needsUpdate = true
  return material
}

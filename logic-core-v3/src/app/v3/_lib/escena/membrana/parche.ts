import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { MEMBRANA } from './cupula'

/**
 * [ESCENA 4] EL PARCHE DE LA CÚPULA — sobre el material de cada trama (`MoireScreen.tsx`), y sólo si
 * la membrana o una variante del moiré que lo necesita están prendidas. Toca UNA lectura: la del
 * alfa de la trama, que en vez de leerse en su lugar se lee corrida.
 *
 * - **La onda** del pulso principal corre las líneas de costado, sube por la banda y se asienta.
 * - **La lente** del cursor: cerca del puntero la trama se lee desde más cerca de su centro, o sea
 *   agrandada, como detrás de un vidrio. La cuenta es en píxeles y se pasa a la textura con las
 *   derivadas de la propia coordenada, así que vale igual en las dos capas.
 * - **M4** · la capa fina mezcla su lectura con la de otro desajuste entero.
 *
 * Con todo en cero la lectura es la de siempre.
 */

export interface CapaViva {
  readonly uNacioLaOnda: { value: number }
  readonly uOnda: { value: number }
  readonly uLente: { value: number }
  readonly uCursorDeLaLente: { value: THREE.Vector2 }
  readonly uMezclaDelDesajuste: { value: number }
  readonly uRepeticionB: { value: THREE.Vector2 }
  readonly uCorrimientoB: { value: THREE.Vector2 }
}

function capaViva(): CapaViva {
  return {
    uNacioLaOnda: { value: -1e6 },
    uOnda: { value: 0 },
    uLente: { value: 0 },
    uCursorDeLaLente: { value: new THREE.Vector2(9, 9) },
    uMezclaDelDesajuste: { value: 0 },
    uRepeticionB: { value: new THREE.Vector2(1, 1) },
    uCorrimientoB: { value: new THREE.Vector2() },
  }
}

/** Los uniforms de las dos capas: los escribe `CupulaViva.tsx` cada cuadro. */
export const CUPULA_VIVA = { gruesa: capaViva(), fina: capaViva() }

/** ¿Hay que parchear la cúpula en esta carga? */
export function cupulaParcheada(): boolean {
  const e = entornoDeLaEscena().escena4
  return e.membrana || e.moire === 'M4'
}

const PARS_VERTEX = /* glsl */ `
varying vec2 vUvMembrana;
`

const PARS_FRAGMENT = /* glsl */ `
uniform float uTiempo;
uniform vec2 uResolucion;
uniform float uNacioLaOnda;
uniform float uOnda;
uniform float uLente;
uniform vec2 uCursorDeLaLente;
uniform float uMezclaDelDesajuste;
uniform vec2 uRepeticionB;
uniform vec2 uCorrimientoB;
varying vec2 vUvMembrana;
`

const LECTURA_DEL_ALFA = /* glsl */ `
#ifdef USE_ALPHAMAP
	vec2 uvMembrana = vAlphaMapUv;
	float edad = uTiempo - uNacioLaOnda;
	if ( uOnda > 0.0 && edad > 0.0 && edad < ${MEMBRANA.onda.duraS.toFixed(2)} ) {
		float frente = edad * ${MEMBRANA.onda.velocidad.toFixed(3)};
		float d = ( vUvMembrana.y - frente ) / ${MEMBRANA.onda.ancho.toFixed(3)};
		float envolvente = exp( - d * d ) * ( 1.0 - edad / ${MEMBRANA.onda.duraS.toFixed(2)} );
		uvMembrana.x += uOnda * envolvente * sin( 6.2832 * ( vUvMembrana.y * ${MEMBRANA.onda.crestas.toFixed(1)} - edad * 1.5 ) );
	}
	if ( uLente > 0.0 ) {
		vec2 desdeElCursor = gl_FragCoord.xy - ( uCursorDeLaLente * 0.5 + 0.5 ) * uResolucion;
		float r2 = ${(MEMBRANA.lente.radioPx * MEMBRANA.lente.radioPx).toFixed(1)};
		vec2 hacia = - desdeElCursor * uLente * exp( - dot( desdeElCursor, desdeElCursor ) / r2 );
		uvMembrana += dFdx( vAlphaMapUv ) * hacia.x + dFdy( vAlphaMapUv ) * hacia.y;
	}
	float alfaDeLaTrama = texture2D( alphaMap, uvMembrana ).g;
	if ( uMezclaDelDesajuste > 0.0 ) {
		vec2 uvB = vUvMembrana * uRepeticionB + uCorrimientoB + ( uvMembrana - vAlphaMapUv );
		alfaDeLaTrama = mix( alfaDeLaTrama, texture2D( alphaMap, uvB ).g, uMezclaDelDesajuste );
	}
	diffuseColor.a *= alfaDeLaTrama;
#endif
`

/** Parchea el material de una capa. Se llama una vez, al armar la cúpula. */
export function conMembrana<T extends THREE.Material>(material: T, capa: CapaViva): T {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, capa, { uTiempo: VIVO.uTiempo, uResolucion: VIVO.uResolucion })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${PARS_VERTEX}`)
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n\tvUvMembrana = uv;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${PARS_FRAGMENT}`)
      .replace('#include <alphamap_fragment>', LECTURA_DEL_ALFA)
  }
  material.customProgramCacheKey = () => 'cupula-membrana'
  material.needsUpdate = true
  return material
}

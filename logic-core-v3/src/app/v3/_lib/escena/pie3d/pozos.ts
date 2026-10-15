import * as THREE from 'three'

import { FINAL_EN_EL_PISO } from '../final/enElPiso'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { PISO_VIVO } from '../piso/bloques'
import { FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { HUECOS_DEL_PIE, MAXIMO_DE_HUECOS_DEL_PIE, TECHO_DE_LOS_HUECOS } from './huecos'

/**
 * [PULIDO 27] Y2 a · EL POZO DE CADA HUECO DEL PIE, LISO — el piso descarta sus bloques adentro del hueco (`huecoDelPie`) y por el margen
 * se veían los costados de los bloques de alrededor, cuadrados y con sus juntas, y lo de debajo del piso. Ahora cada hueco tiene su pozo,
 * como el del logo (`final/hueco.ts`, `crearElPozo`): una PARED lisa y continua por su silueta (el rectángulo redondeado, lo que se abrió)
 * desde el labio hasta su fondo, y el FONDO; del papel del piso con su oscuro del final, más sombreado hacia abajo. Una sola malla para
 * todos (hasta `MAXIMO_DE_HUECOS_DEL_PIE`): cada vértice dice de qué hueco es y dónde está en su contorno, y el sombreador lo pone con los
 * uniformes de los huecos de este cuadro (un hueco cerrado no se dibuja: sus vértices se juntan en un punto).
 * [PULIDO 28] AA4 · LOS BLOQUES ARMAN LA PARED: alrededor del hueco el piso queda normal (sin la banda a ras del labio), y el bloque que
 * cruza el borde se corta ahí: la pared sube hasta `tope` (u sobre el piso) y cada punto se corta en el tope del bloque de ese lugar (las
 * alturas del piso vivo, como el polvo): arriba del piso es la cara del corte de ese bloque (sin el oscuro del pozo); abajo, el pozo.
 */
export const POZO_DEL_PIE = { lados: 72, labio: TECHO_DE_LOS_HUECOS.labio - 0.002, tope: 2, sombra: { pared: [0.86, 0.62], fondo: 0.66 } } as const

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

const VERTICES_GLSL = /* glsl */ `
attribute vec3 aPozo;
uniform vec4 uHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform vec4 uFormaDeLosHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform int uCuantosHuecosDelPie;
uniform vec4 uBaseDelPie;
varying float vHondoDelPozo;
varying vec3 vMundoDelPozo;
varying float vFondoDelPozo;
// Un punto del contorno del rectángulo redondeado (medias medidas \`m\`, radio \`r\`) en \`u\` (0 a 1, la vuelta): (x a lo largo de la derecha,
// y a lo largo de atrás) y su normal hacia afuera.
vec4 contornoDelPozo( float u, vec2 m, float r ) {
	vec2 recta = max( m - r, vec2( 0.0 ) );
	float l1 = 2.0 * recta.x;
	float l2 = 2.0 * recta.y;
	float arco = 1.5707963 * r;
	float t = fract( u ) * ( 2.0 * ( l1 + l2 ) + 4.0 * arco );
	if ( t < l1 ) return vec4( - recta.x + t, - m.y, 0.0, - 1.0 );
	t -= l1;
	if ( t < arco ) { float a = - 1.5707963 + t / max( r, 1e-4 ); return vec4( recta.x + r * cos( a ), - recta.y + r * sin( a ), cos( a ), sin( a ) ); }
	t -= arco;
	if ( t < l2 ) return vec4( m.x, - recta.y + t, 1.0, 0.0 );
	t -= l2;
	if ( t < arco ) { float a = t / max( r, 1e-4 ); return vec4( recta.x + r * cos( a ), recta.y + r * sin( a ), cos( a ), sin( a ) ); }
	t -= arco;
	if ( t < l1 ) return vec4( recta.x - t, m.y, 0.0, 1.0 );
	t -= l1;
	if ( t < arco ) { float a = 1.5707963 + t / max( r, 1e-4 ); return vec4( - recta.x + r * cos( a ), recta.y + r * sin( a ), cos( a ), sin( a ) ); }
	t -= arco;
	if ( t < l2 ) return vec4( - m.x, recta.y - t, - 1.0, 0.0 );
	t -= l2;
	float a = 3.1415927 + t / max( r, 1e-4 );
	return vec4( - recta.x + r * cos( a ), - recta.y + r * sin( a ), cos( a ), sin( a ) );
}
`

/** [PULIDO 28] AA4 · el tope del bloque del piso vivo en `xz` (en el mundo; sin piso vivo, el piso). */
const TOPE_DEL_BLOQUE_GLSL = /* glsl */ `
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
float topeDelBloque( vec2 xz ) {
	if ( uGrillaDelPiso.z < 0.5 ) return ${f(FLOOR_Y)};
	ivec2 celda = ivec2( floor( xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5 ) );
	if ( celda.x < 0 || celda.y < 0 || celda.x >= int( uGrillaDelPiso.x ) || celda.y >= int( uGrillaDelPiso.x ) ) return ${f(FLOOR_Y)};
	return ${f(FLOOR_Y)} + texelFetch( uPisoVivo, celda, 0 ).b;
}
`
const L = PISO_VIVO.luz
/** [PULIDO 28] AA4 · la pared: cortada en el tope del bloque; arriba del piso, la cara del bloque; abajo, el pozo (más oscuro hacia el fondo). */
const PARED_GLSL = /* glsl */ `
	if ( vMundoDelPozo.y > topeDelBloque( vMundoDelPozo.xz ) ) discard;
	float hondoDeLaPared = clamp( ( ${f(FLOOR_Y + POZO_DEL_PIE.labio)} - vMundoDelPozo.y ) / max( 1e-3, ${f(FLOOR_Y + POZO_DEL_PIE.labio)} - vFondoDelPozo ), 0.0, 1.0 );
	float sobreElPiso = vMundoDelPozo.y - ${f(FLOOR_Y + POZO_DEL_PIE.labio)};
	// Arriba del piso, como el costado de un bloque (\`piso/bloques.ts\`): más oscuro hacia la rendija, que acá es el borde del hueco.
	float costadoDelCorte = ${f(L.costado)} * ( 1.0 - ${f(L.rendija[0])} * exp( - max( 0.0, sobreElPiso ) / ${f(L.rendija[1])} ) );
	diffuseColor.rgb *= sobreElPiso > 0.0 ? costadoDelCorte : mix( ${f(POZO_DEL_PIE.sombra.pared[0])}, ${f(POZO_DEL_PIE.sombra.pared[1])}, hondoDeLaPared )`

/**
 * El material del pozo (`deFondo`: el fondo; si no, las paredes): el del papel, con su lugar en el sombreador. `aPozo`: (hueco, vuelta 0 a
 * 1, 0 arriba / 1 abajo / 2 el medio del fondo).
 */
function materialDelPozo(deFondo: boolean): THREE.MeshStandardMaterial {
  const S = POZO_DEL_PIE.sombra
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(PAPER_COLOR), roughness: 0.95, metalness: 0, side: THREE.DoubleSide })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, HUECOS_DEL_PIE, PISO_EN_VIVO, { uBaseDelPie: FINAL_EN_EL_PISO.uBaseDelPie, uOscuroDelBrillo: FINAL_EN_EL_PISO.uOscuroDelBrillo })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTICES_GLSL}`)
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
	int kDelPozo = int( aPozo.x + 0.5 );
	vec4 hDelPozo = uHuecosDelPie[ kDelPozo ];
	vec4 formaDelPozo = uFormaDeLosHuecosDelPie[ kDelPozo ];
	vec2 medioDelPozo = hDelPozo.zw * formaDelPozo.x;
	vec4 cDelPozo = contornoDelPozo( aPozo.y, medioDelPozo, min( formaDelPozo.y, min( medioDelPozo.x, medioDelPozo.y ) ) );
	vec2 enElPisoDelPozo = aPozo.z > 1.5 ? vec2( 0.0 ) : cDelPozo.xy;
	vec2 xzDelPozo = hDelPozo.xy + uBaseDelPie.xy * enElPisoDelPozo.x + uBaseDelPie.zw * enElPisoDelPozo.y;
	objectNormal = ${deFondo ? 'vec3( 0.0, 1.0, 0.0 )' : 'normalize( vec3( - ( uBaseDelPie.x * cDelPozo.z + uBaseDelPie.z * cDelPozo.w ), 0.0, - ( uBaseDelPie.y * cDelPozo.z + uBaseDelPie.w * cDelPozo.w ) ) )'};`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
	float abajoDelPozo = ${deFondo ? '1.0' : 'aPozo.z'};
	vHondoDelPozo = abajoDelPozo;
	transformed = vec3( xzDelPozo.x, mix( ${f(FLOOR_Y + (deFondo ? POZO_DEL_PIE.labio : POZO_DEL_PIE.tope))}, ${f(FLOOR_Y)} - formaDelPozo.z, abajoDelPozo ), xzDelPozo.y );
	if ( kDelPozo >= uCuantosHuecosDelPie || formaDelPozo.x <= 0.0 ) transformed = vec3( 0.0, - 1000.0, 0.0 );
	vMundoDelPozo = transformed;
	vFondoDelPozo = ${f(FLOOR_Y)} - formaDelPozo.z;`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying float vHondoDelPozo;\nvarying vec3 vMundoDelPozo;\nvarying float vFondoDelPozo;\nuniform float uOscuroDelBrillo;\n${TOPE_DEL_BLOQUE_GLSL}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>\n${deFondo ? `\tdiffuseColor.rgb *= ${f(S.fondo)}` : PARED_GLSL} * ( 1.0 - uOscuroDelBrillo );`,
      )
  }
  m.customProgramCacheKey = () => `pozo-del-pie-${deFondo ? 'fondo' : 'pared'}`
  return m
}

/** La geometría de los pozos: por hueco, la pared (dos anillos de `lados`) y el fondo (un abanico). Sin posiciones: las pone el sombreador. */
function geometriaDelPozo(deFondo: boolean): THREE.BufferGeometry {
  const n = POZO_DEL_PIE.lados
  const datos: number[] = []
  const indices: number[] = []
  for (let k = 0; k < MAXIMO_DE_HUECOS_DEL_PIE; k += 1) {
    const base = datos.length / 3
    if (deFondo) {
      datos.push(k, 0, 2)
      for (let i = 0; i <= n; i += 1) datos.push(k, i / n, 1)
      for (let i = 0; i < n; i += 1) indices.push(base, base + 1 + i, base + 2 + i)
    } else {
      for (let i = 0; i <= n; i += 1) datos.push(k, i / n, 0, k, i / n, 1)
      for (let i = 0; i < n; i += 1) indices.push(base + 2 * i, base + 2 * i + 1, base + 2 * i + 2, base + 2 * i + 1, base + 2 * i + 3, base + 2 * i + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('aPozo', new THREE.Float32BufferAttribute(datos, 3))
  // Las de three (no se usan: el sombreador pone el lugar y la normal).
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(datos.length), 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(datos.length), 3))
  g.setIndex(indices)
  return g
}

/** Los pozos de los huecos del pie: un grupo para la escena (en el mundo) y cómo soltarlo. Se ven sólo con algún hueco abierto. */
export function crearLosPozosDelPie(): { readonly grupo: THREE.Group; readonly alCuadro: () => void; readonly soltar: () => void } {
  const grupo = new THREE.Group()
  grupo.name = 'pozos del pie'
  const mallas = [false, true].map((deFondo) => {
    const malla = new THREE.Mesh(geometriaDelPozo(deFondo), materialDelPozo(deFondo))
    malla.frustumCulled = false
    return malla
  })
  grupo.add(...mallas)
  grupo.visible = false
  return {
    grupo,
    alCuadro: () => {
      grupo.visible = HUECOS_DEL_PIE.uCuantosHuecosDelPie.value > 0
    },
    soltar: () => {
      for (const malla of mallas) {
        malla.geometry.dispose()
        ;(malla.material as THREE.Material).dispose()
      }
    },
  }
}

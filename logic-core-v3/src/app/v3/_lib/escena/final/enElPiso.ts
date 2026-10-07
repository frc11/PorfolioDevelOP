import * as THREE from 'three'

import { ANCLAS_DEL_DIBUJO } from '../piso/ondaDirigida'
import { HUECO } from './hueco'

/**
 * [CIERRE] 3 · EL FINAL EN EL PISO VIVO — lo que el final le suma al piso, inyectado al armarlo (como la onda dirigida de
 * INTERFAZ 2): sin final todo vale cero y el piso es exactamente el de siempre.
 *
 *   · EL GOLPE (`uGolpe`): cuando el logo se encastra, un anillo fuerte que nace en él y corre por el piso (en la ecuación
 *     de ondas: el piso se levanta con su física, se refleja y se amortigua). [2E] Lo dibuja el resplandor de las juntas.
 *   · [EL ENCASTRE] 2F · EL PISO BAJO EL MOUSE (`uRastro`; reemplaza al piso que vibraba y al círculo oscuro de CIERRE,
 *     que se leía como una sombra que seguía al mouse): por donde pasa el mouse queda un rastro de puntos que se apagan
 *     con inercia (`rastro.ts`); en la simulación, levanta un poco los bloques; en el dibujo, por las rendijas que se
 *     abren (un bloque más alto que su vecino) sale el resplandor de abajo, con la forma de las juntas. Con el poder.
 *     [RETOQUE DEL ENCASTRE] 1E · ese resplandor era de tinta (oscuro, denso): ahora es LUZ (`LUZ_EN_EL_PISO`).
 *
 * [EL ENCASTRE] 2D · EL HUECO EXACTO (`hueco.ts`): el piso descarta sus tapas y costados donde la máscara del logo
 * acostado dice «adentro» (`uHueco`, en el plano del logo: (x, −z)) y su campo ancho pasa el umbral de la apertura
 * (`uApertura`: se abre desde el medio de los trazos hacia el borde exacto); el borde del corte se oscurece apenas (el
 * labio del pozo). Alrededor del logo el mar se calma (`uCalmaDelFinal`, en la simulación: el piso queda al ras) y el
 * techo que lo esquivaba se apaga (el logo entra en el piso). La mancha de contacto se va con la cámara (`uSinMancha`).
 * [RETOQUE DEL ENCASTRE] 1B · el labio, apenas (el hueco es del tono del piso) y se va al quedar al ras; 1C · el piso
 * calmo queda `HUECO.bajoElRas` debajo de la cara del logo al ras (sin contorno: `hueco.ts`).
 *
 * [EL ENCASTRE] 2E · EL PODER: cuando el logo queda al ras, desde las JUNTAS de los bloques alrededor del logo sale un
 * resplandor (`uPoder`), vivo (fluye y respira con un ruido lento) y más fuerte cerca del logo. El golpe es su pulso: el
 * frente corre por el piso con su física y enciende las juntas por donde pasa. [RETOQUE DEL ENCASTRE] 1F · ese resplandor
 * era de tinta: ahora es la luz de abajo (`LUZ_EN_EL_PISO`), más tenue que bajo el mouse, y el piso entero queda
 * energizado: las ondas y el mar dejan escapar la luz por las rendijas que abren al pasar.
 */
export const GOLPE_EN_EL_PISO = {
  /**
   * [NOCTURNO FINAL] B1 · LA SÚPER ONDA: la del encastre y la de la llegada del logo al cargar (`intro/caida.ts`),
   * mucho más grande que las de siempre (que se note): más lejos, más fuerte, más ancha y más larga. Antes: 1,7 s, 32 u,
   * 70 y 1,3 u (apenas más que un principal del pulso).
   */
  duracionS: 2.6,
  /** Hasta dónde llega el frente (u), su empuje y su ancho (u). */
  alcance: 58,
  fuerza: 120,
  ancho: 2.1,
  /**
   * Cuánto más alta se dibuja mientras dura (u): el piso dibuja sus ondas con un tope suave (`tanh`, 0,42 u: «llamativa,
   * no invasiva»), y con ese tope la súper onda no podía verse más alta que una de siempre.
   */
  masAlta: 1,
} as const

/**
 * [EL ENCASTRE] 2F · EL RASTRO DEL MOUSE en el piso: cuántos puntos, cada cuánto se agrega uno (u), en cuánto se apaga
 * (s: la inercia), su radio (u), cuánto levanta los bloques (u) y con qué fuerza los lleva (como la loma del cursor).
 */
export const RASTRO_EN_EL_PISO = { puntos: 8, cada: 0.55, apagaS: 0.9, radio: 1.7, alto: 0.3, rigidez: 120 } as const

/**
 * [EL ENCASTRE] 2D · el mar calmo alrededor del logo: en la elipse de su caja, entero hasta `entero` veces su media caja y
 * nada desde `hasta` (una elipse, no la caja: una caja se leía como un rectángulo en el piso); y cuánto oscurece el labio.
 */
export const CALMA_EN_EL_PISO = { entero: 1.15, hasta: 1.9, labio: 0.1 } as const

/** Los uniformes del final en el piso: los comparten la simulación y el dibujo; los escribe `FinalDelPie`. */
export const FINAL_EN_EL_PISO = {
  /** nace (reloj de la escena), x, z (u), fuerza (0: ninguno). */
  uGolpe: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** [EL ENCASTRE] 2F · el rastro del mouse: x, z (u) y cuánto vale cada punto (0: apagado). */
  uRastro: { value: Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0)) },
  /** [EL ENCASTRE] 2D · la máscara del logo acostado (R: la forma; G: el campo ancho) y su marco en el plano del logo. */
  uHueco: { value: null as THREE.Texture | null },
  uMarcoDelHueco: { value: new THREE.Vector4(0, 0, 1, 1) },
  /** 0 a 1: cuánto se abrió el hueco. */
  uApertura: { value: 0 },
  /** 0 a 1: cuánto se calmó el mar alrededor del logo; la media caja del logo en su plano (u). */
  uCalmaDelFinal: { value: 0 },
  uCajaDelLogo: { value: new THREE.Vector2(2.7, 2.4) },
  /** 0 a 1: cuánto se fue la mancha de contacto (con la cámara que sube). */
  uSinMancha: { value: 0 },
  /** [EL ENCASTRE] 2E · el poder liberado: 0 sin poder, 1 entero (con un destello al liberarse, un poco más). */
  uPoder: { value: 0 },
}


/**
 * [RETOQUE DEL ENCASTRE] 1E · LA LUZ DE ABAJO — bajo el mouse se veía oscuro, denso y de baja calidad: el resplandor era de
 * tinta. Ahora es luz que nace abajo y se escapa por las rendijas de los bloques levantados: en la tapa, cada junta es una
 * línea de luz con un halo suave que entra hacia la tapa (más fuerte y más ancho donde la rendija se abre: el vecino más
 * bajo); donde la luz es más fuerte (el núcleo, bajo el mouse) inunda la tapa entera; la pared de la rendija, iluminada.
 * Sobre el piso claro, el contraste lo da la sombra: donde hay luz la tapa se sombrea (los bloques levantados tapan la luz
 * de la sala), menos en el núcleo. Sin dientes: la línea y el halo nunca son más finos que un píxel (`fwidth`); sin
 * bandas: todo es exponencial y continuo (y el piso lleva el tramado de siempre).
 *
 * La luz (lineal, a la salida), cuánto se sombrea la tapa, el ancho de la línea y del halo (u), desde qué diferencia de
 * alto (u) una rendija está abierta del todo, y el núcleo: alrededor de la cabeza del rastro, bajo el mouse (su radio,
 * u), y desde y hasta cuánto calor inunda la tapa (lo que suma el rastro entero no inunda nada).
 */
export const LUZ_EN_EL_PISO = {
  luz: 1,
  sombra: 0.36,
  linea: 0.022,
  halo: 0.16,
  abre: 0.12,
  nucleo: { radio: 0.75, desde: 0.3, hasta: 0.85 },
  /**
   * [RETOQUE DEL ENCASTRE] 1F · LO AUTOMÁTICO, más tenue que bajo el mouse (que llega a 1): cuánto pesan las rendijas que
   * abren las ondas, el mar y el pulso del golpe (desde y hasta qué diferencia de alto con el vecino, u: el mar quieto no
   * llega: sólo una rendija de verdad abierta, la de una ola, el pulso o la onda hacia una pieza), su halo (u: angosto,
   * fijo), su sombra en una banda angosta junto a la junta encendida (u: el contraste; sombrear la tapa entera daba un
   * parche en escalones de bloque, y una sombra ancha donde el piso se agita, un anillo gris que seguía al pulso y bandas
   * grises del mar) y cuánto más allá del mar calmo arranca (en medias cajas del logo). Un brillo parejo alrededor del logo
   * o en el frente del pulso (sin rendija) se leía como una mancha gris: no hay.
   */
  automatico: { ondas: 0.7, abre: [0.06, 0.2], halo: 0.05, sombra: 0.3, banda: 0.09, margen: 0.15 },
} as const

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Dónde entra en la simulación: antes de `main` (las funciones), junto al empuje de la onda dirigida, el dibujo y el techo. */
export const ANCLAS_DEL_FINAL = {
  main: 'void main() {',
  empuje: 'fuerza += empujeDeLaOnda( p, r * uLado );',
  dibujo: 'float dibujo = ( onda + marEn( xz, uTiempo ) ) * enElMar;',
  techo: 'if ( uConLogo > 0.5 ) {',
} as const

const SIMULACION_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uRastro[ ${String(RASTRO_EN_EL_PISO.puntos)} ];
uniform float uCalmaDelFinal;
uniform vec2 uCajaDelLogo;
// [NOCTURNO FINAL] B1 · el tope del dibujo de la onda, más alto mientras dura la súper onda.
float topeConElGolpe( float tope ) {
	if ( uGolpe.w <= 0.0 ) return tope;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return tope;
	return tope + uGolpe.w * ${f(GOLPE_EN_EL_PISO.masAlta)} * pow( 1.0 - t, 1.2 );
}
float empujeDelGolpe( vec2 xz ) {
	if ( uGolpe.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float d = ( length( xz - uGolpe.yz ) - frente ) / ${f(GOLPE_EN_EL_PISO.ancho)};
	return uGolpe.w * ${f(GOLPE_EN_EL_PISO.fuerza)} * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.04, t );
}
// [EL ENCASTRE] 2F · el rastro del mouse levanta un poco los bloques (un resorte hacia una loma bajo cada punto).
float empujeDelRastro( vec2 p, float h ) {
	float f = 0.0;
	for ( int i = 0; i < ${String(RASTRO_EN_EL_PISO.puntos)}; i++ ) {
		vec4 q = uRastro[ i ];
		if ( q.z <= 0.0 ) continue;
		vec2 d = p - q.xy / uLado;
		float g = exp( - dot( d, d ) * uLado * uLado / ${f(RASTRO_EN_EL_PISO.radio * RASTRO_EN_EL_PISO.radio)} );
		f += q.z * ${f(RASTRO_EN_EL_PISO.rigidez)} * g * ( ${f(RASTRO_EN_EL_PISO.alto)} * g - h );
	}
	return f;
}
// [EL ENCASTRE] 2D · el mar calmo alrededor de la caja del logo acostado (en su plano: x, −z).
float calmaDelFinal( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 0.0;
	float d = length( vec2( xz.x, - xz.y ) / uCajaDelLogo );
	return uCalmaDelFinal * ( 1.0 - smoothstep( ${f(CALMA_EN_EL_PISO.entero)}, ${f(CALMA_EN_EL_PISO.hasta)}, d ) );
}
`

/** La simulación del piso con el final: el golpe, el rastro del mouse y la calma. */
export function conElFinalEnLaSimulacion(glsl: string): string {
  if (Object.values(ANCLAS_DEL_FINAL).some((ancla) => !glsl.includes(ancla)) || !ONDA_CON_TOPE.test(glsl)) {
    throw new Error('[CIERRE] 3 · la simulación del piso cambió: el final no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(
      ANCLAS_DEL_FINAL.empuje,
      `${ANCLAS_DEL_FINAL.empuje}\n\tfuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );`,
    )
    .replace(ANCLAS_DEL_FINAL.dibujo, `${ANCLAS_DEL_FINAL.dibujo}\n\tdibujo *= 1.0 - calmaDelFinal( xz );\n\tdibujo -= ${f(HUECO.bajoElRas)} * calmaDelFinal( xz );`)
    .replace(ANCLAS_DEL_FINAL.techo, 'if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {')
    .replace(ONDA_CON_TOPE, 'float topeDeLaOnda = topeConElGolpe( $1 );\n\tfloat onda = topeDeLaOnda * tanh( nueva / topeDeLaOnda );')
}

/** [NOCTURNO FINAL] B1 · el dibujo de la onda con su tope suave (el número es el de `PISO_VIVO.onda.tope`). */
const ONDA_CON_TOPE = /float onda = ([0-9.]+) \* tanh\( nueva \/ \1 \);/

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uRastro[ ${String(RASTRO_EN_EL_PISO.puntos)} ];
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
uniform float uSinMancha;
uniform vec2 uCajaDelLogo;
// [EL ENCASTRE] 2E · el poder liberado (0 sin poder, 1 entero; en el destello, un poco más).
uniform float uPoder;
// [RETOQUE DEL ENCASTRE] 1F · fuera del mar calmo alrededor del logo: su borde son escalones del mar contra el piso quieto
// y, encendidos, dibujaban un marco de bloques alrededor del logo.
uniform float uCalmaDelFinal;
float fueraDeLaCalma( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 1.0;
	float d = length( vec2( xz.x, - xz.y ) / uCajaDelLogo );
	return mix( 1.0, smoothstep( ${f(CALMA_EN_EL_PISO.hasta)}, ${f(CALMA_EN_EL_PISO.hasta + LUZ_EN_EL_PISO.automatico.margen)}, d ), uCalmaDelFinal );
}
// [EL ENCASTRE] 2F · cuánta luz deja el rastro del mouse en este punto: x, lo que suma (hasta 1); y, [RETOQUE DEL ENCASTRE]
// 1E · el núcleo (alrededor de la cabeza: bajo el mouse).
vec2 resplandorDelRastro( vec2 xz ) {
	float r = 0.0;
	float nucleo = 0.0;
	for ( int i = 0; i < ${String(RASTRO_EN_EL_PISO.puntos)}; i++ ) {
		vec4 q = uRastro[ i ];
		if ( q.z <= 0.0 ) continue;
		vec2 d = xz - q.xy;
		float d2 = dot( d, d );
		r += q.z * exp( - d2 / ${f(RASTRO_EN_EL_PISO.radio * RASTRO_EN_EL_PISO.radio)} );
		nucleo = max( nucleo, q.w * q.z * exp( - d2 / ${f(LUZ_EN_EL_PISO.nucleo.radio * LUZ_EN_EL_PISO.nucleo.radio)} ) );
	}
	return vec2( min( 1.0, r ), nucleo );
}
// [RETOQUE DEL ENCASTRE] 1E · 1F · la junta: la luz de abajo (el rastro del mouse y lo automático: el poder, el pulso, las ondas).
// [RETOQUE DEL ENCASTRE] 1E · 1F · la luz de abajo en este fragmento, POR JUNTA (la diferencia de alto es la misma de los
// dos lados: continua de una tapa a la otra). \`raton\`: la del rastro del mouse (0 a 1) y \`caliente\`, su núcleo; \`energia\`:
// el poder liberado (con él, las rendijas que abren las ondas, el mar y el pulso del golpe dejan salir la luz: lo automático).
vec3 conLaLuz( vec3 color, float raton, float caliente, float energia ) {
	vec4 delta = abs( vVecinos );
	vec4 solo = min( vec4( 1.0 ), ${f(LUZ_EN_EL_PISO.automatico.ondas)} * energia * smoothstep( ${f(LUZ_EN_EL_PISO.automatico.abre[0])}, ${f(LUZ_EN_EL_PISO.automatico.abre[1])}, delta ) );
	float mayor = min( 1.0, raton + max( max( solo.x, solo.y ), max( solo.z, solo.w ) ) );
	if ( mayor <= 0.001 ) return color;
	vec3 luz = vec3( ${f(LUZ_EN_EL_PISO.luz)} );
	// La pared de la rendija: la luz le pega de abajo.
	if ( vTapa < 0.5 ) return mix( color, luz, mayor );
	vec4 filo = vec4( 1.0 - vEnElBloque.x, vEnElBloque.x, 1.0 - vEnElBloque.y, vEnElBloque.y ) * uLado;
	// Un píxel, en u: la línea y el halo nunca más finos (sin dientes).
	float px = length( fwidth( vPiso.xz ) );
	vec4 abre = smoothstep( 0.0, ${f(LUZ_EN_EL_PISO.abre)}, delta );
	// Bajo el mouse, la línea y un halo que se ensancha con la luz; lo automático, sólo la línea y un halo angosto (si se
	// ensanchaba, una ola que levanta muchos bloques inundaba de blanco las tapas: un fogonazo, no rendijas).
	vec4 linea = exp( - filo / ( ${f(LUZ_EN_EL_PISO.linea)} * ( 0.6 + 0.4 * raton ) + px ) ) * ( 0.6 + 0.4 * abre );
	vec4 halo = exp( - filo / ( ${f(LUZ_EN_EL_PISO.halo)} * ( 0.5 + raton ) * ( 0.6 + 0.6 * abre ) + px ) ) * ( 0.25 + 0.75 * abre );
	vec4 haloDeLaOla = exp( - filo / ( ${f(LUZ_EN_EL_PISO.automatico.halo)} + px ) );
	float junta = min( 1.0, dot( vec4( raton ), linea + 0.8 * halo ) + dot( solo, linea + 0.6 * haloDeLaOla ) );
	float nucleo = smoothstep( ${f(LUZ_EN_EL_PISO.nucleo.desde)}, ${f(LUZ_EN_EL_PISO.nucleo.hasta)}, caliente );
	// La sombra (el contraste sobre el piso claro): la del mouse, ancha (los bloques levantados tapan la luz de la sala);
	// la de lo automático, en una banda angosta junto a la junta encendida. Ninguna en el núcleo, que es luz.
	float sombra = ${f(LUZ_EN_EL_PISO.sombra)} * smoothstep( 0.0, 0.6, raton ) + ${f(LUZ_EN_EL_PISO.automatico.sombra)} * min( 1.0, dot( solo, exp( - filo / ( ${f(LUZ_EN_EL_PISO.automatico.banda)} + px ) ) ) );
	color *= 1.0 - min( ${f(LUZ_EN_EL_PISO.sombra)}, sombra ) * ( 1.0 - nucleo );
	return mix( color, luz, clamp( max( junta, nucleo ), 0.0, 1.0 ) );
}
vec3 conLasJuntas( vec3 color, vec2 xz ) {
	// [RETOQUE DEL ENCASTRE] 1E · bajo el mouse; 1F · y lo automático, más tenue: las rendijas que abren las ondas, el mar y
	// el pulso del golpe en el piso entero, con el poder liberado (después del encastre; en el destello, un poco más).
	vec2 rastro = resplandorDelRastro( xz );
	return conLaLuz( color, rastro.x, rastro.y, uPoder * fueraDeLaCalma( xz ) );
}
// [EL ENCASTRE] 2D · la máscara del logo acostado en este punto del piso: R, la forma; G, el campo ancho.
vec2 mascaraDelHueco( vec2 xz ) {
	vec2 uv = ( vec2( xz.x, - xz.y ) - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw;
	if ( any( lessThan( uv, vec2( 0.0 ) ) ) || any( greaterThan( uv, vec2( 1.0 ) ) ) ) return vec2( 0.0 );
	return texture2D( uHueco, uv ).rg;
}
bool enElHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return false;
	vec2 m = mascaraDelHueco( xz );
	return m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95;
}
float labioDelHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return 0.0;
	vec2 m = mascaraDelHueco( xz );
	return uApertura * ( 1.0 - min( 1.0, uPoder ) ) * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );
}
`

/** Las anclas del dibujo del piso que el final usa además de la de la onda: el arranque de `main`, la mancha y la niebla. */
export const ANCLAS_DEL_HUECO = {
  descarte: '#include <clipping_planes_fragment>',
  mancha: 'vec2 m = manchaDelContacto( vPiso.xz );',
  niebla: '#include <fog_fragment>',
} as const

/** El dibujo del piso con el final: el hueco, su labio, el resplandor de las juntas (el poder, el pulso, el rastro) y la mancha que se va. */
export function conElFinalEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|final-del-pie`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    const anclas = [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)]
    if (anclas.some((ancla) => !shader.fragmentShader.includes(ancla))) {
      throw new Error('[CIERRE] 3 · el dibujo del piso cambió: el final no encuentra dónde entrar')
    }
    Object.assign(shader.uniforms, FINAL_EN_EL_PISO)
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_HUECO.descarte, `${ANCLAS_DEL_HUECO.descarte}\n\tif ( enElHueco( vPiso.xz ) ) discard;`)
      .replace(ANCLAS_DEL_HUECO.mancha, 'vec2 m = manchaDelContacto( vPiso.xz ) * ( 1.0 - uSinMancha );')
      .replace(ANCLAS_DEL_HUECO.niebla, `gl_FragColor.rgb *= 1.0 - ${f(CALMA_EN_EL_PISO.labio)} * labioDelHueco( vPiso.xz );\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );\n${ANCLAS_DEL_HUECO.niebla}`)
  }
  return material
}

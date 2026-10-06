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
 * resplandor de tinta (`uPoder`): un núcleo negro justo en la junta y un halo denso que se abre de la junta hacia la tapa,
 * con el costado del bloque lleno (la rendija); vivo (fluye y respira con un ruido lento, no es una sombra quieta) y más
 * fuerte cerca del logo. El golpe es su pulso: el frente corre por el piso con su física y enciende las juntas por donde
 * pasa (la banda oscura de CIERRE, que se leía como una mancha, se fue).
 */
export const GOLPE_EN_EL_PISO = {
  duracionS: 1.7,
  /** Hasta dónde llega el frente (u), su empuje y su ancho (u): más que un principal del pulso (34). */
  alcance: 32,
  fuerza: 70,
  ancho: 1.3,
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
 * [EL ENCASTRE] 2E · EL RESPLANDOR DE LAS JUNTAS (u y fracciones): el núcleo (ancho desde la junta), el halo y el aura
 * (lo que se derrama de la rendija); cuánto oscurece cada uno como mucho; cuánto lejos llega alrededor del logo (en medias
 * cajas: entero hasta `cerca`, y se apaga con `alcance`); el ancho del frente del pulso (u); el ruido que lo hace fluir y
 * respirar (escala 1/u, velocidad 1/s) y la veta: el ancho del halo cambia a lo largo de la junta (no es una línea pareja,
 * que se leía como la sombra de una grilla).
 */
export const PODER_EN_EL_PISO = { nucleo: 0.018, halo: 0.15, aura: 0.5, oscuroDelNucleo: 0.97, oscuroDelHalo: 0.66, oscuroDelAura: 0.3, cerca: 1.0, alcance: 0.75, frente: 1.6, ruido: { escala: 0.9, corre: 0.55 }, veta: { escala: 2.3, corre: 0.45 } } as const

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
export const LUZ_EN_EL_PISO = { luz: 1, sombra: 0.36, linea: 0.022, halo: 0.16, abre: 0.12, nucleo: { radio: 0.75, desde: 0.3, hasta: 0.85 } } as const

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
  if (Object.values(ANCLAS_DEL_FINAL).some((ancla) => !glsl.includes(ancla))) {
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
}

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uRastro[ ${String(RASTRO_EN_EL_PISO.puntos)} ];
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
uniform float uSinMancha;
uniform vec2 uCajaDelLogo;
// [EL ENCASTRE] 2E · el resplandor de las juntas: cuánto en este punto (el poder alrededor del logo y el frente del pulso).
uniform float uPoder;
float azarDelPoder( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ruidoDelPoder( vec2 p ) {
	vec2 i = floor( p );
	vec2 f = fract( p );
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( azarDelPoder( i ), azarDelPoder( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDelPoder( i + vec2( 0.0, 1.0 ) ), azarDelPoder( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
float resplandorDelFinal( vec2 xz ) {
	float r = 0.0;
	if ( uPoder > 0.0 ) {
		float d = length( vec2( xz.x, - xz.y ) / uCajaDelLogo );
		float vivo = 0.62 + 0.38 * ruidoDelPoder( xz * ${f(PODER_EN_EL_PISO.ruido.escala)} + vec2( uTiempo * ${f(PODER_EN_EL_PISO.ruido.corre)}, - uTiempo * ${f(PODER_EN_EL_PISO.ruido.corre * 0.7)} ) );
		float respira = 0.9 + 0.1 * sin( uTiempo * 2.4 - d * 3.0 );
		r += uPoder * exp( - max( d - ${f(PODER_EN_EL_PISO.cerca)}, 0.0 ) / ${f(PODER_EN_EL_PISO.alcance)} ) * vivo * respira;
	}
	if ( uGolpe.w > 0.0 ) {
		float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
		if ( t >= 0.0 && t <= 1.0 ) {
			float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
			float d = ( length( xz - uGolpe.yz ) - frente ) / ${f(PODER_EN_EL_PISO.frente)};
			r += uGolpe.w * exp( - d * d ) * pow( 1.0 - t, 1.2 ) * smoothstep( 0.0, 0.04, t );
		}
	}
	return r;
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
// La junta: en la tapa, un núcleo negro justo en el borde y un halo que entra hacia la tapa; el costado (la rendija), lleno.
// [RETOQUE DEL ENCASTRE] 1E · la luz de abajo en este fragmento: \`cuanto\`, su fuerza (0 a 1); \`caliente\`, el núcleo.
vec3 conLaLuz( vec3 color, float cuanto, float caliente ) {
	if ( cuanto <= 0.001 ) return color;
	float k = min( cuanto, 1.0 );
	vec3 luz = vec3( ${f(LUZ_EN_EL_PISO.luz)} );
	// La pared de la rendija: la luz le pega de abajo.
	if ( vTapa < 0.5 ) return mix( color, luz, k );
	vec4 filo = vec4( 1.0 - vEnElBloque.x, vEnElBloque.x, 1.0 - vEnElBloque.y, vEnElBloque.y ) * uLado;
	// Un píxel, en u: la línea y el halo nunca más finos (sin dientes).
	float px = length( fwidth( vPiso.xz ) );
	vec4 abre = smoothstep( 0.0, ${f(LUZ_EN_EL_PISO.abre)}, abs( vVecinos ) );
	vec4 linea = exp( - filo / ( ${f(LUZ_EN_EL_PISO.linea)} * ( 0.6 + 0.4 * k ) + px ) ) * ( 0.6 + 0.4 * abre );
	vec4 halo = exp( - filo / ( ${f(LUZ_EN_EL_PISO.halo)} * ( 0.5 + k ) * ( 0.6 + 0.6 * abre ) + px ) ) * ( 0.25 + 0.75 * abre );
	float junta = min( 1.0, dot( linea, vec4( 1.0 ) ) + 0.8 * dot( halo, vec4( 1.0 ) ) );
	float nucleo = smoothstep( ${f(LUZ_EN_EL_PISO.nucleo.desde)}, ${f(LUZ_EN_EL_PISO.nucleo.hasta)}, caliente );
	// La sombra de los bloques levantados (menos en el núcleo, que es luz): el contraste sobre el piso claro.
	color *= 1.0 - ${f(LUZ_EN_EL_PISO.sombra)} * smoothstep( 0.0, 0.6, k ) * ( 1.0 - nucleo );
	return mix( color, luz, clamp( max( k * junta, nucleo ), 0.0, 1.0 ) );
}
vec3 conLasJuntas( vec3 color, vec2 xz ) {
	float r = resplandorDelFinal( xz );
	// [RETOQUE DEL ENCASTRE] 1E · el rastro del mouse es luz (\`conLaLuz\`); el poder y el pulso, todavía de tinta.
	vec2 rastro = resplandorDelRastro( xz );
	color = conLaLuz( color, rastro.x, rastro.y );
	if ( r <= 0.0 ) return color;
	float junta = 1.0;
	if ( vTapa > 0.5 ) {
		vec4 filo = vec4( 1.0 - vEnElBloque.x, vEnElBloque.x, 1.0 - vEnElBloque.y, vEnElBloque.y ) * uLado;
		float d = min( min( filo.x, filo.y ), min( filo.z, filo.w ) );
		float veta = 0.55 + 0.9 * ruidoDelPoder( xz * ${f(PODER_EN_EL_PISO.veta.escala)} + vec2( - uTiempo * ${f(PODER_EN_EL_PISO.veta.corre)}, uTiempo * ${f(PODER_EN_EL_PISO.veta.corre * 0.8)} ) );
		float nucleo = exp( - d / ${f(PODER_EN_EL_PISO.nucleo)} );
		// El halo y el aura suman las cuatro juntas (con la más cercana sola, cada tapa se veía como una pirámide).
		vec4 h = exp( - filo / ( ${f(PODER_EN_EL_PISO.halo)} * veta ) );
		vec4 a = exp( - filo / ${f(PODER_EN_EL_PISO.aura)} );
		float halo = min( 1.0, h.x + h.y + h.z + h.w );
		float aura = min( 1.0, 0.6 * ( a.x + a.y + a.z + a.w ) );
		junta = ${f(PODER_EN_EL_PISO.oscuroDelNucleo)} * nucleo + ( 1.0 - nucleo ) * min( 1.0, ${f(PODER_EN_EL_PISO.oscuroDelHalo)} * halo + ${f(PODER_EN_EL_PISO.oscuroDelAura)} * aura );
	}
	return mix( color, vec3( 0.045 ), clamp( junta * r, 0.0, 0.96 ) );
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

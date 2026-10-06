import * as THREE from 'three'

import { ANCLAS_DEL_DIBUJO } from '../piso/ondaDirigida'

/**
 * [CIERRE] 3 · EL FINAL EN EL PISO VIVO — lo que el final le suma al piso, inyectado al armarlo (como la onda dirigida de
 * INTERFAZ 2): sin final todo vale cero y el piso es exactamente el de siempre.
 *
 *   · EL GOLPE (`uGolpe`): cuando el logo se encastra, un anillo fuerte que nace en él y corre por el piso (en la ecuación
 *     de ondas: el piso se levanta con su física, se refleja y se amortigua), y su banda oscura en el dibujo.
 *   · EL PISO QUE VIBRA CON LUZ (`uVibraDelFinal`, `uCursorDelFinal`): después del golpe, debajo del mouse el piso vibra
 *     (más que la loma de siempre) y se OSCURECE alrededor: de día el piso es claro y la luz que se ve es oscura (la misma
 *     mezcla hacia la noche que los anillos del pulso).
 *
 * [EL ENCASTRE] 2D · EL HUECO EXACTO (`hueco.ts`): el piso descarta sus tapas y costados donde la máscara del logo
 * acostado dice «adentro» (`uHueco`, en el plano del logo: (x, −z)) y su campo ancho pasa el umbral de la apertura
 * (`uApertura`: se abre desde el medio de los trazos hacia el borde exacto); el borde del corte se oscurece apenas (el
 * labio del pozo). Alrededor del logo el mar se calma (`uCalmaDelFinal`, en la simulación: el piso queda al ras) y el
 * techo que lo esquivaba se apaga (el logo entra en el piso). La mancha de contacto se va con la cámara (`uSinMancha`).
 */
export const GOLPE_EN_EL_PISO = {
  duracionS: 1.7,
  /** Hasta dónde llega el frente (u), su empuje y su ancho (u): más que un principal del pulso (34). */
  alcance: 32,
  fuerza: 70,
  ancho: 1.3,
  /** La banda que se ve en el dibujo (cuánto oscurece). */
  banda: 0.55,
} as const

export const VIBRA_EN_EL_PISO = {
  /** La vibración debajo del cursor: su fuerza en la ecuación de ondas y su frecuencia (rad/s). */
  fuerza: 230,
  pulsacion: 34,
  /** La luz oscura: cuánto oscurece en el centro y su radio (u). */
  oscuro: 0.38,
  radio: 3.2,
} as const

/**
 * [EL ENCASTRE] 2D · el mar calmo alrededor del logo: en la elipse de su caja, entero hasta `entero` veces su media caja y
 * nada desde `hasta` (una elipse, no la caja: una caja se leía como un rectángulo en el piso); y cuánto oscurece el labio.
 */
export const CALMA_EN_EL_PISO = { entero: 1.15, hasta: 1.9, labio: 0.3 } as const

/** Los uniformes del final en el piso: los comparten la simulación y el dibujo; los escribe `FinalDelPie`. */
export const FINAL_EN_EL_PISO = {
  /** nace (reloj de la escena), x, z (u), fuerza (0: ninguno). */
  uGolpe: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** 0 a 1: cuánto vibra y se oscurece el piso debajo del cursor. */
  uVibraDelFinal: { value: 0 },
  /** x, z del cursor en el piso (u), y cuánto se ve (la presencia del puntero por la vibración). */
  uCursorDelFinal: { value: new THREE.Vector4(9999, 9999, 0, 0) },
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
}

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
uniform float uVibraDelFinal;
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
// [EL ENCASTRE] 2D · el mar calmo alrededor de la caja del logo acostado (en su plano: x, −z).
float calmaDelFinal( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 0.0;
	float d = length( vec2( xz.x, - xz.y ) / uCajaDelLogo );
	return uCalmaDelFinal * ( 1.0 - smoothstep( ${f(CALMA_EN_EL_PISO.entero)}, ${f(CALMA_EN_EL_PISO.hasta)}, d ) );
}
`

/** La simulación del piso con el final: el golpe, la vibración debajo del cursor (la loma de siempre, `g`) y la calma. */
export function conElFinalEnLaSimulacion(glsl: string): string {
  if (Object.values(ANCLAS_DEL_FINAL).some((ancla) => !glsl.includes(ancla))) {
    throw new Error('[CIERRE] 3 · la simulación del piso cambió: el final no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(
      ANCLAS_DEL_FINAL.empuje,
      `${ANCLAS_DEL_FINAL.empuje}\n\tfuerza += empujeDelGolpe( p * uLado ) + uVibraDelFinal * uCursor.w * ${f(VIBRA_EN_EL_PISO.fuerza)} * g * sin( uTiempo * ${f(VIBRA_EN_EL_PISO.pulsacion)} );`,
    )
    .replace(ANCLAS_DEL_FINAL.dibujo, `${ANCLAS_DEL_FINAL.dibujo}\n\tdibujo *= 1.0 - calmaDelFinal( xz );`)
    .replace(ANCLAS_DEL_FINAL.techo, 'if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {')
}

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uCursorDelFinal;
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
uniform float uSinMancha;
float cuantoDelFinal( vec2 xz ) {
	float c = 0.0;
	if ( uCursorDelFinal.w > 0.0 ) {
		float d = length( xz - uCursorDelFinal.xy ) / ${f(VIBRA_EN_EL_PISO.radio)};
		c += uCursorDelFinal.w * ${f(VIBRA_EN_EL_PISO.oscuro)} * exp( - d * d );
	}
	if ( uGolpe.w > 0.0 ) {
		float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
		if ( t >= 0.0 && t <= 1.0 ) {
			float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
			float d = ( length( xz - uGolpe.yz ) - frente ) / ( 0.5 + 1.6 * t );
			c += uGolpe.w * ${f(GOLPE_EN_EL_PISO.banda)} * exp( - d * d ) * pow( 1.0 - t, 1.8 ) * smoothstep( 0.0, 0.05, t );
		}
	}
	return c;
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
	return uApertura * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );
}
`

/** Las anclas del dibujo del piso que el final usa además de la de la onda: el arranque de `main`, la mancha y la niebla. */
export const ANCLAS_DEL_HUECO = {
  descarte: '#include <clipping_planes_fragment>',
  mancha: 'vec2 m = manchaDelContacto( vPiso.xz );',
  niebla: '#include <fog_fragment>',
} as const

/** El dibujo del piso con el final: el hueco, su labio, la banda del golpe y la luz oscura del cursor, y la mancha que se va. */
export function conElFinalEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|final-del-pie`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    const anclas = [ANCLAS_DEL_DIBUJO.funcion, ANCLAS_DEL_DIBUJO.mezcla, ...Object.values(ANCLAS_DEL_HUECO)]
    if (anclas.some((ancla) => !shader.fragmentShader.includes(ancla))) {
      throw new Error('[CIERRE] 3 · el dibujo del piso cambió: el final no encuentra dónde entrar')
    }
    Object.assign(shader.uniforms, FINAL_EN_EL_PISO)
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_DIBUJO.mezcla, `( ${ANCLAS_DEL_DIBUJO.mezcla} + cuantoDelFinal( vPiso.xz ) )`)
      .replace(ANCLAS_DEL_HUECO.descarte, `${ANCLAS_DEL_HUECO.descarte}\n\tif ( enElHueco( vPiso.xz ) ) discard;`)
      .replace(ANCLAS_DEL_HUECO.mancha, 'vec2 m = manchaDelContacto( vPiso.xz ) * ( 1.0 - uSinMancha );')
      .replace(ANCLAS_DEL_HUECO.niebla, `gl_FragColor.rgb *= 1.0 - ${f(CALMA_EN_EL_PISO.labio)} * labioDelHueco( vPiso.xz );\n${ANCLAS_DEL_HUECO.niebla}`)
  }
  return material
}

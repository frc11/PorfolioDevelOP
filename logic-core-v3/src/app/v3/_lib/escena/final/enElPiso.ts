import * as THREE from 'three'

import { ANCLAS_DEL_DIBUJO } from '../piso/ondaDirigida'

/**
 * [CIERRE] 3 · EL FINAL EN EL PISO VIVO — dos términos que el final le suma al piso, inyectados al armarlo (como la onda
 * dirigida de INTERFAZ 2): sin final valen cero y el piso es exactamente el de siempre.
 *
 *   · EL GOLPE (`uGolpe`): cuando el logo se encastra, un anillo fuerte que nace en él y corre por el piso (en la ecuación
 *     de ondas: el piso se levanta con su física, se refleja y se amortigua), y su banda oscura en el dibujo.
 *   · EL PISO QUE VIBRA CON LUZ (`uVibraDelFinal`, `uCursorDelFinal`): después del golpe, debajo del mouse el piso vibra
 *     (más que la loma de siempre) y se OSCURECE alrededor: de día el piso es claro y la luz que se ve es oscura (la misma
 *     mezcla hacia la noche que los anillos del pulso).
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

/** Los uniformes del final en el piso: los comparten la simulación y el dibujo; los escribe `FinalDelPie`. */
export const FINAL_EN_EL_PISO = {
  /** nace (reloj de la escena), x, z (u), fuerza (0: ninguno). */
  uGolpe: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** 0 a 1: cuánto vibra y se oscurece el piso debajo del cursor. */
  uVibraDelFinal: { value: 0 },
  /** x, z del cursor en el piso (u), y cuánto se ve (la presencia del puntero por la vibración). */
  uCursorDelFinal: { value: new THREE.Vector4(9999, 9999, 0, 0) },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Dónde entra en la simulación: antes de `main` (las funciones) y junto al empuje de la onda dirigida. */
export const ANCLAS_DEL_FINAL = {
  main: 'void main() {',
  empuje: 'fuerza += empujeDeLaOnda( p, r * uLado );',
} as const

const SIMULACION_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform float uVibraDelFinal;
float empujeDelGolpe( vec2 xz ) {
	if ( uGolpe.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float d = ( length( xz - uGolpe.yz ) - frente ) / ${f(GOLPE_EN_EL_PISO.ancho)};
	return uGolpe.w * ${f(GOLPE_EN_EL_PISO.fuerza)} * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.04, t );
}
`

/** La simulación del piso con el final: el golpe y la vibración debajo del cursor (la loma de siempre, `g`). */
export function conElFinalEnLaSimulacion(glsl: string): string {
  if (!glsl.includes(ANCLAS_DEL_FINAL.main) || !glsl.includes(ANCLAS_DEL_FINAL.empuje)) {
    throw new Error('[CIERRE] 3 · la simulación del piso cambió: el final no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(
      ANCLAS_DEL_FINAL.empuje,
      `${ANCLAS_DEL_FINAL.empuje}\n\tfuerza += empujeDelGolpe( p * uLado ) + uVibraDelFinal * uCursor.w * ${f(VIBRA_EN_EL_PISO.fuerza)} * g * sin( uTiempo * ${f(VIBRA_EN_EL_PISO.pulsacion)} );`,
    )
}

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uCursorDelFinal;
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
`

/** El dibujo del piso con el final: la banda del golpe y la luz oscura del cursor, en la misma mezcla que los anillos. */
export function conElFinalEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|final-del-pie`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    if (!shader.fragmentShader.includes(ANCLAS_DEL_DIBUJO.funcion) || !shader.fragmentShader.includes(ANCLAS_DEL_DIBUJO.mezcla)) {
      throw new Error('[CIERRE] 3 · el dibujo del piso cambió: el final no encuentra dónde entrar')
    }
    shader.uniforms.uGolpe = FINAL_EN_EL_PISO.uGolpe
    shader.uniforms.uCursorDelFinal = FINAL_EN_EL_PISO.uCursorDelFinal
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_DIBUJO.mezcla, `( ${ANCLAS_DEL_DIBUJO.mezcla} + cuantoDelFinal( vPiso.xz ) )`)
  }
  return material
}

import * as THREE from 'three'

import { ANCLAS_DEL_FINAL } from '../final/enElPiso'
import { CTA_DEL_FINAL } from './estado'

/**
 * [PULIDO 1] P17-B · c · EL ESCALÓN DE BLOQUES BAJO EL CTA, en el piso vivo (sólo con `?cta=c`: sin la bandera el piso no
 * cambia ni una línea). En la pose del CTA el piso que se ve es el de detrás del logo (adelante queda fuera del cuadro y
 * detrás del CTA está la pared), así que el escalón se arma ahí: un rectángulo de bloques que sube del centro a los bordes
 * (cada bloque entero: la simulación es por celda) y forma una plataforma ancha a los dos lados del logo, justo debajo del
 * CTA en la pantalla. En hover, los bloques de cerca pulsan en blanco, como las zonas del brillo de P1 (la misma mezcla).
 */
export const ESCALON_DEL_CTA = {
  /** El rectángulo del escalón (mundo): su centro (x, z) y sus medios lados. */
  centro: [0, -11] as const,
  medio: [16, 7] as const,
  /** De dónde sale el pulso blanco (mundo): el centro del escalón, adelante; llega hasta `radioDelPulso`. */
  pulso: [0, -7] as const,
} as const

export const CTA_EN_EL_PISO = {
  uEscalonDelCta: { value: new THREE.Vector4(ESCALON_DEL_CTA.centro[0], ESCALON_DEL_CTA.centro[1], ESCALON_DEL_CTA.medio[0], ESCALON_DEL_CTA.medio[1]) },
  /** Cuánto se armó (0 a 1). */
  uArmadoDelEscalon: { value: 0 },
  /** El pulso blanco: de dónde sale (x, z), hasta dónde llega, cuánto (0 a 1) y por dónde va su anillo (0 a 1). */
  uPulsoDelCta: { value: new THREE.Vector4(ESCALON_DEL_CTA.pulso[0], ESCALON_DEL_CTA.pulso[1], CTA_DEL_FINAL.bloques.radioDelPulso, 0) },
  uFaseDelPulso: { value: 0 },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const B = CTA_DEL_FINAL.bloques

const SIMULACION_GLSL = /* glsl */ `
uniform vec4 uEscalonDelCta;
uniform float uArmadoDelEscalon;
// [PULIDO 1] P17-B · c · el escalón bajo el CTA: del centro a los bordes (cada celda, un bloque entero).
float escalonDelCta( vec2 xz ) {
	if ( uArmadoDelEscalon <= 0.0 ) return 0.0;
	vec2 d = abs( xz - uEscalonDelCta.xy ) / uEscalonDelCta.zw;
	float borde = max( d.x, d.y );
	if ( borde > 1.0 ) return 0.0;
	return ${f(B.alto)} * smoothstep( 0.0, 1.0, uArmadoDelEscalon * ${f(1 + B.escalona)} - borde * ${f(B.escalona)} );
}
`

/** La simulación del piso con el escalón: lo que se dibuja nunca baja de su altura. Va sobre la del final. */
export function conElEscalonEnLaSimulacion(glsl: string): string {
  if (!glsl.includes(ANCLAS_DEL_FINAL.main) || !glsl.includes(ANCLAS_DEL_FINAL.dibujo)) {
    throw new Error('[PULIDO 1] P17-B · la simulación del piso cambió: el escalón del CTA no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(ANCLAS_DEL_FINAL.dibujo, `${ANCLAS_DEL_FINAL.dibujo}\n\tdibujo = max( dibujo, escalonDelCta( xz ) );`)
}

/** Cose el escalón en el material de una simulación ya armada (antes de su primer paso): el sombreador y sus uniformes. */
export function conElEscalonEnLaSimulacionDe(material: THREE.ShaderMaterial): void {
  material.fragmentShader = conElEscalonEnLaSimulacion(material.fragmentShader)
  Object.assign(material.uniforms, { uEscalonDelCta: CTA_EN_EL_PISO.uEscalonDelCta, uArmadoDelEscalon: CTA_EN_EL_PISO.uArmadoDelEscalon })
  material.needsUpdate = true
}

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uPulsoDelCta;
uniform float uFaseDelPulso;
// [PULIDO 1] P17-B · c · los bloques de cerca del CTA pulsan en blanco: un anillo que sale del escalón y se abre (cada
// bloque entero, medido en su centro), sobre la zona apenas oscurecida para que el blanco se lea (como el brillo de P1).
vec3 conElPulsoDelCta( vec3 color ) {
	if ( uPulsoDelCta.w <= 0.0 ) return color;
	vec2 b = vPiso.xz - ( vEnElBloque - 0.5 ) * uLado;
	float d = length( b - uPulsoDelCta.xy ) / uPulsoDelCta.z;
	float cerca = 1.0 - smoothstep( 0.8, 1.0, d );
	float anillo = 1.0 - smoothstep( 0.0, 0.16, abs( d - uFaseDelPulso ) );
	color *= 1.0 - ${f(B.oscurece)} * uPulsoDelCta.w * cerca;
	return mix( color, vec3( mix( 0.9, 1.0, vTapa ) ), uPulsoDelCta.w * anillo * cerca );
}
`
/** El ancla: la última mano del final sobre el color del piso (`conElFinalEnElPiso`). */
export const ANCLA_DEL_PULSO = 'gl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );'

/** El dibujo del piso con el pulso blanco. Encadena el `onBeforeCompile` del final (va después de él). */
export function conElEscalonEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|escalon-del-cta`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    if (!shader.fragmentShader.includes(ANCLA_DEL_PULSO) || !shader.fragmentShader.includes('void main() {')) {
      throw new Error('[PULIDO 1] P17-B · el dibujo del piso cambió: el pulso del CTA no encuentra dónde entrar')
    }
    Object.assign(shader.uniforms, { uPulsoDelCta: CTA_EN_EL_PISO.uPulsoDelCta, uFaseDelPulso: CTA_EN_EL_PISO.uFaseDelPulso })
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `${DIBUJO_GLSL}void main() {`)
      .replace(ANCLA_DEL_PULSO, 'gl_FragColor.rgb = conElPulsoDelCta( conLasJuntas( gl_FragColor.rgb, vPiso.xz ) );')
  }
  return material
}

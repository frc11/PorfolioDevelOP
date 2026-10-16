import * as THREE from 'three'

import { PASE_EN_VIVO } from '../../pase/pase'
import { TEXTO_EN_PANTALLA } from '../textoEnPantalla'

/**
 * [PULIDO 17] O3 · LO COMÚN DEL DIBUJO DE LA ENERGÍA (`docs/rediseno/PLASMA.md`; de PULIDO 16). Las uniformes que comparten las
 * partículas, los arcos y los efectos; cuánto adentro de una caja de texto está un punto (ahí se apagan: pasan por detrás); las luces
 * de los arcos (iluminan un instante lo que tienen cerca); y LA SALIDA: luz (`luzNoche`, premultiplicada con alfa 0: suma), por el
 * tono de la escena (el ACES compensado, `tono.ts`) y el espacio de color de salida. Sin bloom: cada brillo es su propio halo. Monocromo.
 *
 * [CIERRE A] A3 · SÓLO DE NOCHE: de día no hay cargas, arcos ni red (la energía oscura de día y sus variantes, `?dia=`, se borraron).
 * Aparecen y se van con la noche de la energía (`uNoche`: el mismo factor continuo del amanecer y del atardecer, `nocheDeLaEnergia`), cada
 * una corrida por su azar (`DE_NOCHE`): su luz y su tamaño van juntos de nada a enteros, sin saltos.
 */
export const DIBUJO = {
  /** Detrás de un texto, cuánto se apagan. */
  texto: 0.95,
  /** Cuántas luces de arco como mucho y su alcance (u). */
  luces: 5,
  luzRadio: 1.7,
  /** La paleta, en lineal (antes del tono): luz blanca. */
  paleta: { luzNoche: [1, 1, 1] },
  /** Detrás de los textos: el borde suave (px de CSS: un campo denso no deja un rectángulo vacío) y cuánto se apagan. */
  textoBorde: 56,
  textoFuerza: 0.9,
} as const

export const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

/**
 * [CIERRE A] A3 · cómo entra cada una con la noche (`uNoche`, 0 de día y 1 de noche): desde `desde` más su azar por `desfase`, en `ancho`
 * de noche (suave). Con la noche en `desde` o menos, ninguna; desde `desde + desfase + ancho`, todas enteras.
 */
export const DE_NOCHE = { desde: 0.02, desfase: 0.6, ancho: 0.33 } as const

/**
 * Cuánto adentro de una caja de texto está un punto de la pantalla (NDC), con el borde suave; lo comparten la energía y el espejo
 * ([PULIDO 18] P2). Necesita `uResolucion` y `uPixel` declaradas antes.
 */
export const TEXTOS_GLSL = /* glsl */ `
uniform vec4 uTextos[ ${String(TEXTO_EN_PANTALLA.cajas)} ];
uniform float uCuantosTextos;
uniform float uTextoBorde;
uniform float uTextoFuerza;
float adentroDelTexto( vec2 s ) {
	float m = 0.0;
	vec2 borde = uTextoBorde / uResolucion * uPixel;
	for ( int r = 0; r < ${String(TEXTO_EN_PANTALLA.cajas)}; r ++ ) {
		if ( float( r ) >= uCuantosTextos ) break;
		vec4 c = uTextos[ r ];
		float x = smoothstep( c.x - borde.x, c.x + borde.x, s.x ) * ( 1.0 - smoothstep( c.z - borde.x, c.z + borde.x, s.x ) );
		float y = smoothstep( c.y - borde.y, c.y + borde.y, s.y ) * ( 1.0 - smoothstep( c.w - borde.y, c.w + borde.y, s.y ) );
		m = max( m, x * y );
	}
	return m;
}
`

export const COMUN = /* glsl */ `
uniform vec3 uCentro;
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uEscalaPx;
uniform float uTiempo;
uniform float uNoche;
uniform float uApagado;
uniform float uFoco;
uniform float uCercaDelFinal;
uniform vec4 uLuces[ ${String(DIBUJO.luces)} ];
uniform float uCuantasLuces;
uniform vec3 uLuzNoche;
${TEXTOS_GLSL}
// [CIERRE A] A3 · cuánto está (0 a 1: su luz y su tamaño) con la noche de este cuadro, corrida por su azar (0 a 1).
float deNoche( float azar ) {
	float desde = ${f(DE_NOCHE.desde)} + azar * ${f(DE_NOCHE.desfase)};
	return smoothstep( desde, desde + ${f(DE_NOCHE.ancho)}, uNoche );
}
// El azar de una semilla cualquiera (los arcos y la red): de 0 a 1.
float azarDeLaSemilla( float s ) {
	return fract( sin( s * 12.9898 + 4.1 ) * 43758.5453 );
}
// La luz de los arcos en un punto (del mundo): cada una cae con la distancia.
float luzDeLosArcos( vec3 p ) {
	float l = 0.0;
	for ( int k = 0; k < ${String(DIBUJO.luces)}; k ++ ) {
		if ( float( k ) >= uCuantasLuces ) break;
		vec3 d = p - uLuces[ k ].xyz;
		l += uLuces[ k ].w * exp( - dot( d, d ) / ${f(DIBUJO.luzRadio * DIBUJO.luzRadio)} );
	}
	return l;
}
// Cerca del logo en el final del pie (el encastre): la energía baja para no competir (p: desde el centro del logo).
float enElFinal( vec3 p ) {
	return 1.0 - uCercaDelFinal * exp( - dot( p, p ) / 30.0 );
}
`

/** El tono y el espacio de color de la escena, como función. */
export const AL_TONO = /* glsl */ `
vec3 alTono( vec3 c ) {
#ifdef TONE_MAPPING
	c = toneMapping( c );
#endif
	return linearToOutputTexel( vec4( c, 1.0 ) ).rgb;
}
`

/** La salida: `luzNoche` (la luz que suma, con su entrada con la noche ya puesta) por `vis` (textos, el final). */
export const SALIDA = /* glsl */ `
	vec3 noche = luzNoche * vis;
	if ( max( noche.r, max( noche.g, noche.b ) ) < 0.002 ) discard;
	gl_FragColor = vec4( alTono( noche ), 0.0 );
`

const v3 = (c: readonly number[]): { value: THREE.Vector3 } => ({ value: new THREE.Vector3(c[0], c[1], c[2]) })

/** Las uniformes que comparten todos los materiales de la energía (los mismos objetos: el cuadro las escribe una vez). */
export function uniformesComunes() {
  const p = DIBUJO.paleta
  return {
    uCentro: { value: new THREE.Vector3() },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uEscalaPx: { value: 1 },
    uTiempo: { value: 0 },
    uNoche: { value: 0 },
    uApagado: { value: 0 },
    uFoco: { value: 20 },
    uCercaDelFinal: { value: 0 },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uTextoBorde: { value: DIBUJO.textoBorde },
    uTextoFuerza: { value: DIBUJO.textoFuerza },
    uLuces: { value: Array.from({ length: DIBUJO.luces }, () => new THREE.Vector4()) },
    uCuantasLuces: { value: 0 },
    uLuzNoche: v3(p.luzNoche),
    // [PULIDO 18] P1.a · la profundidad de lo opaco (el pase compartido): las partículas y los arcos blandos.
    uProfundidad: PASE_EN_VIVO.uProfundidad,
    uHayProfundidad: PASE_EN_VIVO.uHayProfundidad,
    uCercaLejos: PASE_EN_VIVO.uCercaLejos,
  }
}
export type UniformesComunes = ReturnType<typeof uniformesComunes>

/** Premultiplicado con alfa 0: la luz suma. Pasa por el tono de la escena. */
export function materialDeEnergia(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
}

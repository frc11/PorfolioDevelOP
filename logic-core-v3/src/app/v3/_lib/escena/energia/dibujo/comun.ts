import * as THREE from 'three'

import { TEXTO_EN_PANTALLA } from '../textoEnPantalla'

/**
 * [PULIDO 17] O3 · LO COMÚN DEL DIBUJO DE LA ENERGÍA (`docs/rediseno/PLASMA.md`; de PULIDO 16). Las uniformes que comparten las
 * partículas, los arcos y los efectos; cuánto adentro de una caja de texto está un punto (ahí se apagan: pasan por detrás); las luces
 * de los arcos (iluminan un instante lo que tienen cerca); y LA SALIDA. Cada sombreador calcula dos cosas: DE DÍA, energía oscura (su
 * color y cuánto tapa: `colorDia`, `aDia`) y DE NOCHE, luz (premultiplicada: `luzNoche`, suma). Las dos pasan por el tono de la
 * escena (el ACES compensado, `tono.ts`) y por el espacio de color de salida, cada una por su lado, y se mezclan con la noche: de día
 * tapa con su alfa, de noche suma con alfa 0. Sin bloom: cada brillo es su propio halo. Monocromo.
 */
export const DIBUJO = {
  /** Detrás de un texto, cuánto se apagan. */
  texto: 0.95,
  /** Cuántas luces de arco como mucho y su alcance (u). */
  luces: 5,
  luzRadio: 1.7,
  /**
   * La paleta, en lineal (antes del tono). DE DÍA: la tinta de la energía oscura (grafito, translúcido) y el brillo claro mínimo (el
   * destello de las calientes y el núcleo de los arcos: más blanco que el papel, el tono lo lleva al blanco). DE NOCHE: luz blanca.
   */
  paleta: { tintaDia: [0.05, 0.05, 0.055], claroDia: [3, 3, 3], luzNoche: [1, 1, 1] },
  /** Detrás de los textos: el borde suave (px de CSS: un campo denso no deja un rectángulo vacío) y cuánto se apagan. */
  textoBorde: 56,
  textoFuerza: 0.9,
} as const

export const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

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
uniform vec4 uTextos[ ${String(TEXTO_EN_PANTALLA.cajas)} ];
uniform float uCuantosTextos;
uniform float uTextoBorde;
uniform float uTextoFuerza;
uniform vec4 uLuces[ ${String(DIBUJO.luces)} ];
uniform float uCuantasLuces;
uniform vec3 uTintaDia;
uniform vec3 uClaroDia;
uniform vec3 uLuzNoche;
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
// La luz de los arcos en un punto (relativo al centro): cada una cae con la distancia.
float luzDeLosArcos( vec3 p ) {
	float l = 0.0;
	for ( int k = 0; k < ${String(DIBUJO.luces)}; k ++ ) {
		if ( float( k ) >= uCuantasLuces ) break;
		vec3 d = p - uLuces[ k ].xyz;
		l += uLuces[ k ].w * exp( - dot( d, d ) / ${f(DIBUJO.luzRadio * DIBUJO.luzRadio)} );
	}
	return l;
}
// Cerca del logo en el final del pie (el encastre): la energía baja para no competir.
float enElFinal( vec3 p ) {
	return 1.0 - uCercaDelFinal * exp( - dot( p, p ) / 30.0 );
}
`

/** El tono y el espacio de color de la escena, como función (para pasar el día y la noche cada uno por su lado). */
export const AL_TONO = /* glsl */ `
vec3 alTono( vec3 c ) {
#ifdef TONE_MAPPING
	c = toneMapping( c );
#endif
	return linearToOutputTexel( vec4( c, 1.0 ) ).rgb;
}
`

/** La salida: `colorDia` y `aDia` (lo que tapa de día), `luzNoche` (la luz que suma de noche), por `vis` (textos, el final). */
export const SALIDA = /* glsl */ `
	float cubre = clamp( aDia * vis, 0.0, 1.0 );
	vec3 noche = luzNoche * vis;
	if ( cubre * ( 1.0 - uNoche ) < 0.002 && max( noche.r, max( noche.g, noche.b ) ) * uNoche < 0.002 ) discard;
	gl_FragColor = vec4( mix( alTono( colorDia ) * cubre, alTono( noche ), uNoche ), cubre * ( 1.0 - uNoche ) );
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
    uTintaDia: v3(p.tintaDia),
    uClaroDia: v3(p.claroDia),
    uLuzNoche: v3(p.luzNoche),
  }
}
export type UniformesComunes = ReturnType<typeof uniformesComunes>

/** Premultiplicado: de noche el alfa es 0 y la luz suma; de día la energía oscura tapa con su alfa. Pasa por el tono de la escena. */
export function materialDeEnergia(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
}

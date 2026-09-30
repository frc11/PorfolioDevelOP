import * as THREE from 'three'

/**
 * [CALIDAD 1] B8 · EL DITHERING, CON RUIDO AZUL — que los degradados (el cielo, la niebla, la noche, los fondos oscuros)
 * no se vean en escalones de 8 bits.
 *
 * El `dithering` de three suma un corrimiento de ±½ escalón con ruido BLANCO (un hash de la coordenada del píxel) y
 * además corre el rojo y el azul al revés que el verde: un grano visible y con color. Acá se reemplaza por un mosaico de
 * ruido AZUL de 16×16 (el mismo corrimiento en los tres canales: la paleta es monocroma), que es el que el ojo menos
 * ve: toda su energía está en las frecuencias altas. El mosaico lo generó `scripts-calidad/b8-ruido-azul.ts 16 1.5`
 * (vacío y cúmulo, Ulichney 1993): son los RANGOS de cada celda (0 a 255, cada uno una vez).
 *
 * Va en una TEXTURA de 16×16 y no como arreglo constante del shader: medido, el arreglo de 256 valores con índice
 * variable le cuesta al compilador de Direct3D (ANGLE) más de un segundo por programa, y el calentamiento del
 * precompilado pasó de 81 ms a 30 s. La textura es un uniform: los materiales de three la reciben de su definición
 * (`instalarElRuidoAzul`) y los propios, de `conDithering`.
 */
const RANGOS = [
  135, 171, 28, 145, 106, 182, 213, 46, 26, 86, 208, 5, 188, 117, 215, 195, 245, 91, 217, 192, 37, 80, 132, 157, 190, 63, 126, 41, 248, 140, 30, 60,
  154, 4, 71, 124, 165, 252, 1, 224, 95, 238, 173, 102, 162, 69, 179, 109, 47, 174, 241, 19, 61, 196, 113, 51, 147, 14, 218, 23, 84, 225, 12, 235,
  204, 133, 103, 207, 152, 89, 31, 210, 118, 73, 191, 129, 52, 201, 143, 88, 27, 222, 78, 43, 232, 137, 181, 247, 166, 44, 153, 254, 111, 168, 40, 119,
  64, 163, 8, 187, 110, 18, 59, 82, 7, 229, 92, 29, 212, 0, 236, 189, 243, 100, 141, 255, 67, 203, 156, 107, 205, 123, 185, 56, 150, 74, 96, 136,
  13, 206, 36, 172, 127, 227, 34, 240, 146, 20, 70, 223, 105, 197, 170, 49, 115, 178, 87, 57, 2, 97, 176, 76, 48, 193, 169, 134, 35, 246, 22, 214,
  68, 233, 122, 220, 149, 198, 25, 130, 216, 94, 251, 11, 161, 121, 85, 148, 32, 155, 16, 186, 72, 112, 244, 160, 6, 116, 45, 79, 230, 58, 180, 239,
  202, 50, 98, 250, 39, 211, 55, 83, 234, 183, 151, 194, 101, 209, 3, 104, 125, 219, 164, 139, 21, 128, 177, 33, 138, 62, 221, 24, 131, 38, 142, 65,
  184, 9, 77, 199, 90, 158, 226, 99, 200, 15, 108, 75, 175, 228, 159, 253, 42, 114, 231, 54, 242, 10, 66, 120, 249, 167, 144, 237, 53, 93, 17, 81,
] as const

/** Los rangos del mosaico (fila por fila), para el invariante. */
export const RANGOS_DEL_RUIDO_AZUL: readonly number[] = RANGOS

function mosaico(): THREE.DataTexture {
  const t = new THREE.DataTexture(Uint8Array.from(RANGOS), 16, 16, THREE.RedFormat, THREE.UnsignedByteType)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  t.generateMipmaps = false
  t.needsUpdate = true
  return t
}

/** La textura, compartida por todos los materiales (una sola en la GPU). */
export const RUIDO_AZUL_EN_VIVO = { uRuidoAzul: { value: mosaico() } }

export const RUIDO_AZUL_GLSL = /* glsl */ `
#ifdef DITHERING
	uniform sampler2D uRuidoAzul;
	float ruidoAzul() {
		return ( texelFetch( uRuidoAzul, ivec2( mod( gl_FragCoord.xy, 16.0 ) ), 0 ).r * 255.0 + 0.5 ) / 256.0;
	}
	vec3 dithering( vec3 color ) {
		return color + vec3( ruidoAzul() - 0.5 ) / 255.0;
	}
#endif
`

/**
 * Instala el dithering de ruido azul en lugar del de three. Una vez, antes de compilar la escena: reemplaza la cuenta y
 * suma la textura a los uniforms de cada material de three que incluye el dithering (así todo material con
 * `dithering: true` la recibe sola, sin pasar por `onBeforeCompile`, que varios parches de la escena reemplazan).
 */
export function instalarElRuidoAzul(): void {
  THREE.ShaderChunk.dithering_pars_fragment = RUIDO_AZUL_GLSL
  for (const definicion of Object.values(THREE.ShaderLib)) {
    if (definicion.fragmentShader.includes('#include <dithering_fragment>')) Object.assign(definicion.uniforms, RUIDO_AZUL_EN_VIVO)
  }
}

/** Lo que va al final de `main` con el dithering (y, con `alfa`, también el alfa: para lo que oscurece mezclando). */
const AL_FINAL = ['\t#include <dithering_fragment>', '}', ''].join('\n')
const AL_FINAL_CON_ALFA = ['\t#include <dithering_fragment>', '\t#ifdef DITHERING', '\t\tgl_FragColor.a += ( ruidoAzul() - 0.5 ) / 255.0;', '\t#endif', '}', ''].join('\n')

/**
 * Un material propio (`ShaderMaterial`) con el dithering: la textura en sus uniforms, la cuenta al principio del
 * fragmento y el corrimiento al final de `main` (que tiene que ser lo último del fragmento). `alfa`: también el alfa,
 * para lo que oscurece mezclando (la cúpula de la noche: lo de atrás por 1 − alfa).
 */
export function conDithering<T extends THREE.ShaderMaterial>(material: T, alfa = false): T {
  material.dithering = true
  Object.assign(material.uniforms, RUIDO_AZUL_EN_VIVO)
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    shader.fragmentShader = ['#include <dithering_pars_fragment>', shader.fragmentShader.replace(/\}\s*$/, alfa ? AL_FINAL_CON_ALFA : AL_FINAL)].join('\n')
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|dithering${alfa ? '-alfa' : ''}`
  return material
}

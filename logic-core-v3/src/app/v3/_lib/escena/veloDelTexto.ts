import * as THREE from 'three'

/**
 * [PULIDO 2] 3 · EL VELO EN LA ESCENA (`?velo=escena`, la otra lectura del velo de P12): sin capa del DOM. Abajo de 1024 el
 * texto de Trabajos (la bajada del cartel y el de la demo a la vista) va sobre el logo de noche; en vez de un velo detrás
 * del texto, el sombreador del logo baja su luminancia en una ELIPSE DE PANTALLA detrás de cada texto (más ancha que el
 * texto: se desvanece muy por fuera de él). Sólo el logo se oscurece; la noche no cambia. Las elipses las mide el DOM en
 * cada cuadro (`VeloDelTexto`), con la opacidad con que se ve el texto (las demos aparecen y se van).
 */
export const VELO_EN_LA_ESCENA = {
  /** Cuánto baja la luminancia del logo en el medio de la elipse (el velo del DOM dejaba el 76 % del color de la noche). */
  fuerza: 0.8,
  /** Los radios de la elipse, en mitades del rect del texto (más ancha y más alta que él). */
  ancho: 1.9,
  alto: 2.8,
  /** Hasta qué fracción del radio va entera; de ahí al borde, se va. */
  entera: 0.55,
  /** Cuántos textos a la vez (la bajada y una demo). */
  textos: 2,
} as const

/** Los uniformes: por texto, el centro (px del búfer, desde abajo) y los radios (px), y su fuerza (0: sin velo). */
export const VELO_DEL_TEXTO = {
  uVelos: { value: Array.from({ length: VELO_EN_LA_ESCENA.textos }, () => new THREE.Vector4(0, 0, 1, 1)) },
  uFuerzaDelVelo: { value: Array.from({ length: VELO_EN_LA_ESCENA.textos }, () => 0) },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

const VELO_GLSL = /* glsl */ `
uniform vec4 uVelos[ ${String(VELO_EN_LA_ESCENA.textos)} ];
uniform float uFuerzaDelVelo[ ${String(VELO_EN_LA_ESCENA.textos)} ];
float veloDelTexto() {
	float v = 0.0;
	for ( int i = 0; i < ${String(VELO_EN_LA_ESCENA.textos)}; i++ ) {
		vec2 d = ( gl_FragCoord.xy - uVelos[ i ].xy ) / max( uVelos[ i ].zw, vec2( 1.0 ) );
		v = max( v, uFuerzaDelVelo[ i ] * ( 1.0 - smoothstep( ${f(VELO_EN_LA_ESCENA.entera)}, 1.0, length( d ) ) ) );
	}
	return v;
}
`

/** El logo con el velo: al final de todo (después de su color de noche, que si no lo pisaría). */
export function conElVeloEnElLogo(material: THREE.MeshStandardMaterial): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, VELO_DEL_TEXTO)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${VELO_GLSL}`)
      .replace(/\}\s*$/, '\tgl_FragColor.rgb *= 1.0 - veloDelTexto();\n}\n')
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|velo-del-texto`
  material.needsUpdate = true
}

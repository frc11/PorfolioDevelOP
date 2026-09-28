import * as THREE from 'three'

import { CHARCO_DEL_HAZ_GLSL } from '../entorno/Haz'
import { ANILLOS_GLSL } from '../entorno/Pulso'
import { MANCHA_GLSL } from '../sombra/enElPiso'

/**
 * [ESCENA 6] EL PISO VIVO — puro: la grilla de bloques, la simulación de ondas y el material. De
 * «Isometric Noise Field» se tomó la idea (bloques cuadrados con alturas en escalones), no el código.
 *
 * **Qué es.** El piso del escenario, donde está el logo, pasa a ser un campo de bloques. En reposo es
 * un relieve casi plano (0 a 2 escalones, de un ruido quieto). Reacciona y vuelve a asentarse:
 *
 * - **el cursor**: los bloques bajo su proyección en el piso se levantan, y al moverlo ondean;
 * - **el scroll**: una agitación proporcional a la velocidad de la cámara mientras el scroll la mueve
 *   (no el vaivén del mouse), que se calma con la familia de inercia de E6 (sube en 0,11 s, baja en 0,7 s);
 * - **el pulso** (sólo con `piso=pulso`): el anillo principal empuja una onda que recorre los bloques.
 *
 * **Cómo.** Una textura de alturas, UNA CELDA POR BLOQUE, que la GPU actualiza cada cuadro con la
 * ecuación de ondas (Verlet: la altura y la del paso anterior en dos canales) más amortiguación, un
 * resorte que la devuelve a cero y un borde que absorbe (no hay rebote contra el ciclorama). El dibujo
 * es una malla instanciada: un bloque (tapa y cuatro costados) por celda, que lee su altura de la
 * textura y la redondea al escalón. Los bloques sólo suben: el valle de una onda deja el bloque en su
 * reposo, no lo hunde en el piso.
 *
 * **Lo que el piso tiene encima.** La mancha de contacto (con 5c), la luz del haz y el anillo del
 * pulso son planos apoyados en el piso: un bloque que sube los taparía. Con el piso vivo esos planos
 * se esconden y los pinta el piso mismo, con las mismas cuentas (`sombra/enElPiso.ts`, `Pulso.tsx`,
 * `Haz.tsx`).
 */
export const PISO_VIVO = {
  /** El lado de un bloque para el piso de radio 34; con el escenario de la formación se agranda (mismos bloques). */
  lado: 0.8,
  radioDeReferencia: 34,
  /** El escalón de las alturas, y el relieve de reposo (0 a `reposo` escalones). */
  escalon: 0.05,
  reposo: 2,
  /** Cuánto baja el costado de cada bloque por debajo del piso. */
  zocalo: 0.1,
  /** Las ondas: velocidad (u/s), amortiguación (1/s), resorte al reposo (1/s²), borde que absorbe (celdas). */
  onda: { velocidad: 9, amortigua: 1.1, vuelta: 6, borde: 5 },
  /** El cursor: cuánto levanta, en qué radio (u), qué tan rápido, y cuánto dura sin moverse. */
  cursor: { alto: 0.6, radio: 2, rigidez: 140, quietoS: 2.5 },
  /** El scroll: la velocidad de la cámara a la que la agitación es plena (u/s), y cuánto empuja. */
  scroll: { plena: 14, fuerza: 70, subeS: 0.11, bajaS: 0.7 },
  /** El pulso principal: cuánto empuja el frente del anillo y su ancho (u). */
  pulso: { fuerza: 55, ancho: 0.9 },
  /** Las aristas: qué parte del bloque ocupa el borde de la tapa y cuánto la oscurece. */
  arista: { ancho: 0.05, oscurece: 0.035 },
  /**
   * Los costados: con la luz blanda del papel salen casi del tono de la tapa y el relieve no se lee.
   * Van más oscuros, y más hacia la base (arriba / abajo), como en la referencia.
   */
  costado: { arriba: 0.86, abajo: 0.7 },
} as const

export interface Grilla {
  /** Celdas por lado (la textura es de `n` × `n`). */
  readonly n: number
  readonly lado: number
  /** Las celdas enteras adentro del disco: (i, j) de cada una. */
  readonly celdas: Float32Array
  readonly cuantas: number
}

/** La grilla de un piso de radio `radio`: la misma cantidad de bloques para cualquier radio. */
export function grillaDelPiso(radio: number): Grilla {
  const lado = PISO_VIVO.lado * (radio / PISO_VIVO.radioDeReferencia)
  const n = 2 * Math.ceil(radio / lado)
  const celdas: number[] = []
  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) {
      const x0 = (i - n / 2) * lado
      const z0 = (j - n / 2) * lado
      // Entera adentro: las cuatro esquinas.
      const adentro = [x0, x0 + lado].every((x) => [z0, z0 + lado].every((z) => Math.hypot(x, z) <= radio))
      if (adentro) celdas.push(i, j)
    }
  }
  return { n, lado, celdas: new Float32Array(celdas), cuantas: celdas.length / 2 }
}

/** El centro de la celda (i, j), en el plano del piso. */
export function centroDeLaCelda(i: number, j: number, g: Grilla): [number, number] {
  return [(i + 0.5 - g.n / 2) * g.lado, (j + 0.5 - g.n / 2) * g.lado]
}

/**
 * LA SIMULACIÓN — un paso de la ecuación de ondas por cuadro. Canal r: la altura; g: la del paso
 * anterior. Las fuentes: el cursor (un resorte hacia una loma bajo su proyección), el scroll (ruido
 * blanco por celda, que la onda suaviza) y el frente del anillo principal.
 */
export const SIMULACION_GLSL = /* glsl */ `
precision highp float;
uniform sampler2D uEstado[ 1 ];
uniform vec2 uTam;
uniform float uDt;
uniform float uC2;
uniform float uRadio;
uniform vec4 uCursor;
uniform float uAgita;
uniform float uTiempo;
uniform vec3 uAnillo;
in vec2 vUv;
layout( location = 0 ) out vec4 salida;

float azar( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }

float alto( ivec2 c ) {
	ivec2 t = ivec2( uTam );
	return texelFetch( uEstado[ 0 ], clamp( c, ivec2( 0 ), t - 1 ), 0 ).r;
}

void main() {
	ivec2 c = ivec2( gl_FragCoord.xy );
	vec4 e = texelFetch( uEstado[ 0 ], c, 0 );
	float h = e.r;
	float antes = e.g;
	float lap = alto( c + ivec2( 1, 0 ) ) + alto( c - ivec2( 1, 0 ) ) + alto( c + ivec2( 0, 1 ) ) + alto( c - ivec2( 0, 1 ) ) - 4.0 * h;
	// En celdas, desde el centro del disco.
	vec2 p = vec2( c ) + 0.5 - uTam * 0.5;
	float r = length( p );
	float borde = smoothstep( uRadio - ${PISO_VIVO.onda.borde.toFixed(1)}, uRadio, r );
	float amortigua = ${PISO_VIVO.onda.amortigua.toFixed(2)} + borde * 14.0;
	float f = - ${PISO_VIVO.onda.vuelta.toFixed(2)} * h;
	// El cursor: un resorte hacia una loma, sólo cerca de su proyección (uCursor: x, y en celdas, radio, presencia).
	vec2 alCursor = p - uCursor.xy;
	float g = exp( - dot( alCursor, alCursor ) / ( uCursor.z * uCursor.z ) );
	f += uCursor.w * ${PISO_VIVO.cursor.rigidez.toFixed(1)} * g * ( ${PISO_VIVO.cursor.alto.toFixed(3)} * g - h );
	// El scroll: ruido blanco por celda, que cambia doce veces por segundo.
	float turno = floor( uTiempo * 12.0 );
	f += uAgita * ${PISO_VIVO.scroll.fuerza.toFixed(1)} * ( azar( vec2( c ) + turno * 1.37 ) - 0.5 );
	// El pulso: el frente del anillo principal empuja (uAnillo: frente en celdas, ancho en celdas, fuerza).
	float dAnillo = ( r - uAnillo.x ) / uAnillo.y;
	f += uAnillo.z * exp( - dAnillo * dAnillo );
	float nueva = h + ( h - antes ) * ( 1.0 - amortigua * uDt ) + uC2 * lap + f * uDt * uDt;
	// Afuera del disco, quieto.
	nueva *= 1.0 - step( uRadio, r );
	salida = vec4( nueva, h, 0.0, 1.0 );
}
`

/** El relieve de reposo, en escalones: un ruido de valor quieto, suave a escala de cuatro bloques. */
const REPOSO_GLSL = /* glsl */ `
float azarDelPiso( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ruidoDelPiso( vec2 p ) {
	vec2 i = floor( p );
	vec2 f = fract( p );
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( azarDelPiso( i ), azarDelPiso( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDelPiso( i + vec2( 0.0, 1.0 ) ), azarDelPiso( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
float reposoDelPiso( vec2 celda ) {
	float n = 0.6 * ruidoDelPiso( celda * 0.25 ) + 0.4 * ruidoDelPiso( celda * 0.61 + 17.0 );
	return floor( n * ${(PISO_VIVO.reposo + 0.999).toFixed(3)} ) * ${PISO_VIVO.escalon.toFixed(3)};
}
`

export interface UniformsDelPiso {
  readonly uAlturas: { value: THREE.Texture | null }
  readonly uLado: { value: number }
}

/**
 * El material de los bloques: el papel del piso (`MeshStandardMaterial`, las mismas luces), con la
 * altura de cada bloque en el vértice y, en el fragmento, las aristas y lo que el piso tiene encima.
 */
export function conPisoVivo(material: THREE.MeshStandardMaterial, uniforms: UniformsDelPiso & Record<string, THREE.IUniform>): THREE.MeshStandardMaterial {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute vec2 aCelda;
uniform sampler2D uAlturas;
uniform float uLado;
varying vec3 vPiso;
varying vec2 vEnElBloque;
varying float vTapa;
varying float vSubida;
${REPOSO_GLSL}`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
	{
		float h = reposoDelPiso( aCelda ) + max( texelFetch( uAlturas, ivec2( aCelda ), 0 ).r, 0.0 );
		h = floor( h / ${PISO_VIVO.escalon.toFixed(3)} + 0.5 ) * ${PISO_VIVO.escalon.toFixed(3)};
		vEnElBloque = position.xz / uLado + 0.5;
		vTapa = step( 0.5, normal.y );
		// La tapa a su altura (y 4 mm más, para no pelear con el papel); el zócalo, adentro de la losa.
		transformed.y = position.y > 0.5 ? h + 0.004 : - ${PISO_VIVO.zocalo.toFixed(2)};
		// En el costado: 0 al ras del piso, 1 en la tapa.
		vSubida = position.y > 0.5 ? 1.0 : - ${PISO_VIVO.zocalo.toFixed(2)} / max( h + 0.004 + ${PISO_VIVO.zocalo.toFixed(2)}, 1e-3 );
		vPiso = ( modelMatrix * instanceMatrix * vec4( transformed, 1.0 ) ).xyz;
	}`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uHaz;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
varying vec3 vPiso;
varying vec2 vEnElBloque;
varying float vTapa;
varying float vSubida;
${ANILLOS_GLSL}
${MANCHA_GLSL}
${CHARCO_DEL_HAZ_GLSL}`,
      )
      .replace(
        '#include <colorspace_fragment>',
        `#include <colorspace_fragment>
	{
		// Las aristas: el borde de la tapa, apenas más oscuro.
		vec2 b = min( vEnElBloque, 1.0 - vEnElBloque );
		gl_FragColor.rgb *= 1.0 - ${PISO_VIVO.arista.oscurece.toFixed(3)} * vTapa * ( 1.0 - smoothstep( 0.0, ${PISO_VIVO.arista.ancho.toFixed(3)}, min( b.x, b.y ) ) );
		// Los costados, más oscuros hacia la base.
		gl_FragColor.rgb *= mix( mix( ${PISO_VIVO.costado.abajo.toFixed(2)}, ${PISO_VIVO.costado.arriba.toFixed(2)}, clamp( vSubida, 0.0, 1.0 ) ), 1.0, vTapa );
		// Lo que antes eran planos apoyados, en el mismo orden: la mancha, el charco del haz y el pulso.
		vec2 m = manchaDelContacto( vPiso.xz );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, m.x );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, m.y );
		gl_FragColor.rgb += charcoDelHaz( vPiso.xz ) * uHaz;
		gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3( uNoche ), cuantoDelPulso( length( vPiso.xz ) ) );
	}`,
      )
  }
  material.customProgramCacheKey = () => 'piso-vivo'
  return material
}

/** Un bloque: la tapa (y = 1) y los cuatro costados (de y = 0 a 1), sin fondo. Lado 1, centrado en x y z. */
export function geometriaDelBloque(lado: number): THREE.BufferGeometry {
  const m = lado / 2
  const caras: [number[], number[]][] = [
    // tapa
    [[-m, 1, m, m, 1, m, m, 1, -m, -m, 1, -m], [0, 1, 0]],
    // +x
    [[m, 0, m, m, 0, -m, m, 1, -m, m, 1, m], [1, 0, 0]],
    // −x
    [[-m, 0, -m, -m, 0, m, -m, 1, m, -m, 1, -m], [-1, 0, 0]],
    // +z
    [[-m, 0, m, m, 0, m, m, 1, m, -m, 1, m], [0, 0, 1]],
    // −z
    [[m, 0, -m, -m, 0, -m, -m, 1, -m, m, 1, -m], [0, 0, -1]],
  ]
  const posicion: number[] = []
  const normal: number[] = []
  const indice: number[] = []
  for (const [v, n] of caras) {
    const base = posicion.length / 3
    posicion.push(...v)
    for (let k = 0; k < 4; k += 1) normal.push(...n)
    indice.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posicion, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  g.setIndex(indice)
  return g
}

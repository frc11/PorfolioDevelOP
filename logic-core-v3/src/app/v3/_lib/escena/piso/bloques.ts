import * as THREE from 'three'

import { CHARCO_DEL_HAZ_GLSL } from '../entorno/Haz'
import { NACE_EN, ANILLOS_GLSL } from '../entorno/Pulso'
import { PULSO } from '../entorno/maquinaDelPulso'
import { ANILLOS_EN_EL_SHADER } from '../entorno/vivo'
import { CONTACTO_DE_LA_TRAMA_GLSL } from '../moire/limite'
import { CARAS_DEL_LOGO_GLSL } from '../polvo/simulacion'
import { FLOOR_Y } from '../probeScene'
import { MANCHA_GLSL } from '../sombra/enElPiso'
import { APLICAR_LA_SOMBRA_GLSL, SOMBRA_DEL_LOGO_GLSL } from '../sombra/delLogo'
import { APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL, SOMBRAS_DEL_PIE, SOMBRAS_DEL_PIE_GLSL } from '../pie3d/sombras'

/**
 * [ESCENA 6] EL PISO VIVO — puro: la grilla de bloques, la simulación y el material. De «Isometric Noise
 * Field» se tomó la idea (un campo de bloques cuadrados con alturas), no el código.
 *
 * **[ESCENA 7] T5 · un mar, encendido en el producto.** Todo el piso se mueve siempre, como una sola cosa
 * viva: marejadas largas que cruzan en varias direcciones, cada una a la velocidad que le da su largo
 * (como el agua), agrupadas por un ruido lento que cambia qué zona sube más, y un picado chico encima. Sube
 * Y BAJA respecto del reposo. No se repite: las marejadas tienen largos y rumbos sin relación entre sí y el
 * agrupamiento cambia en el tiempo. No hay escalones: la altura es continua (en ESCENA 6 iba en escalones
 * de 0,05 y el movimiento saltaba). Sin scroll: el piso sólo responde al cursor y al pulso.
 *
 * **El cursor** (como en ESCENA 6) y **el pulso** empujan una simulación de ondas en la GPU (una celda por
 * bloque, la ecuación de ondas con Verlet, a PASO FIJO de 1/120 s: la misma ola a cualquier cantidad de
 * cuadros por segundo). Cada anillo del pulso empuja con su frente: el principal levanta una ola que cruza
 * el piso y deja su estela; el de reposo y el del hover, apenas.
 *
 * **Nunca toca al logo.** Cada bloque mide la distancia de su tapa (menos media diagonal) a la forma del
 * logo, con su pose de este cuadro, y si no le alcanza el margen baja lo que falta (`techo`). El reposo
 * del piso no cambia: el logo sigue donde estaba y la mancha de contacto también.
 *
 * **El borde.** Los bloques cubren el disco entero: los del borde se recortan al círculo, y en el borde
 * el mar se apaga (el piso queda al ras del canto del escenario, o del arranque del ciclorama).
 *
 * **La luz.** Las mismas luces de la sala sobre el papel; lo que dice «bloque» es la oclusión: el costado
 * se oscurece hacia la rendija con el vecino más bajo, y la tapa se oscurece junto a un vecino más alto.
 * El filo de un escalón que mira a la luz principal se aclara apenas (un bisel), el que le da la espalda se
 * apaga apenas. Con alturas continuas todo vecino difiere un poco: el costado de un escalón chico se
 * sombrea casi como la tapa (su normal se inclina hacia arriba), así el piso no es una grilla de rayas y
 * el canto nítido aparece donde la ola levanta de verdad. Y lo hondo junta menos luz que lo alto: el
 * valle, apenas más oscuro, y la cresta, apenas más clara, dibujan el mar también visto desde arriba.
 */
export const PISO_VIVO = {
  /** El lado de un bloque para el piso de radio 34; con el escenario de la formación se agranda (mismos bloques). */
  lado: 0.8,
  radioDeReferencia: 34,
  /** Cuánto baja el costado de cada bloque por debajo del reposo (más que el valle más hondo). */
  zocalo: 0.6,
  /** El mar: la gravedad que da la velocidad de cada marejada, y las marejadas (rumbo rad, largo u, alto u). */
  mar: {
    gravedad: 1.55,
    alto: 0.85,
    marejadas: [
      [0.4, 17, 0.09],
      [1.3, 12, 0.07],
      [2.6, 9.3, 0.05],
      [4.1, 13.7, 0.06],
      [5.2, 7.1, 0.035],
    ],
    /** El agrupamiento: la escala (1/u) y cuánto cambia (1/s); y el picado: alto, escala y deriva. */
    grupos: { escala: 0.045, cambia: 0.04 },
    picado: { alto: 0.05, escala: 0.3, deriva: 0.15 },
    /** Cuánto antes del borde del disco el mar ya se apagó y dónde está entero (u). */
    borde: [0.3, 4],
  },
  /** Las ondas: velocidad (u/s), amortiguación (1/s), resorte al reposo (1/s²), borde que absorbe (celdas) y el paso fijo (s). */
  onda: { velocidad: 9, amortigua: 1.1, vuelta: 6, borde: 5, paso: 1 / 120, tope: 0.42 },
  /** El cursor: cuánto levanta, en qué radio (u), qué tan rápido, y cuánto dura sin moverse (como en ESCENA 6). */
  cursor: { alto: 0.6, radio: 2, rigidez: 140, quietoS: 2.5 },
  /** El pulso: cuánto empuja el frente de cada clase de anillo y su ancho (u). */
  pulso: { principal: 34, reposo: 4, hover: 3, ancho: 1.1 },
  /** El logo: el margen entre la tapa de un bloque y la forma (u). */
  techo: { margen: 0.12 },
  /**
   * [ESCENA 7] El techo del ojo: con la cámara al ras del piso (de noche, en Números, 0,7 u arriba) una cresta
   * del mar con el anillo del pulso encima subía un bloque cercano por encima de la cámara y tapaba medio
   * cuadro. Cerca, la tapa queda `margen` debajo del ojo; desde `desde` u el techo sube `sube` por unidad (lo
   * lejano puede asomar sobre el horizonte, apenas); `suave`: el ancho del techo blando (sin quiebre).
   */
  ojo: { margen: 0.15, desde: 6, sube: 0.03, suave: 0.05 },
  /** La luz: oclusión del costado y de la tapa (cuánto y en cuánto se apaga, u) y el bisel (ancho en fracción del lado, cuánto). */
  luz: { rendija: [0.34, 0.16], junto: [0.24, 0.12], bisel: [0.035, 0.06], costado: 0.93, escalon: [0.0, 0.1], hondo: [0.07, 0.3] },
} as const

export interface Grilla {
  /** Celdas por lado (la textura es de `n` × `n`). */
  readonly n: number
  readonly lado: number
  readonly radio: number
  /** Las celdas que tocan el disco: (i, j) de cada una. */
  readonly celdas: Float32Array
  readonly cuantas: number
}

/** La grilla de un piso de radio `radio`: la misma cantidad de bloques para cualquier radio, hasta el borde. */
export function grillaDelPiso(radio: number): Grilla {
  const lado = PISO_VIVO.lado * (radio / PISO_VIVO.radioDeReferencia)
  const n = 2 * Math.ceil(radio / lado)
  const celdas: number[] = []
  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) {
      const [x0, z0] = [(i - n / 2) * lado, (j - n / 2) * lado]
      // Toca el disco si el punto de la celda más cercano al centro está adentro.
      const [x, z] = [Math.min(Math.max(0, x0), x0 + lado), Math.min(Math.max(0, z0), z0 + lado)]
      if (Math.hypot(x, z) < radio - 1e-6) celdas.push(i, j)
    }
  }
  return { n, lado, radio, celdas: new Float32Array(celdas), cuantas: celdas.length / 2 }
}

/** El centro de la celda (i, j), en el plano del piso. */
export function centroDeLaCelda(i: number, j: number, g: Grilla): [number, number] {
  return [(i + 0.5 - g.n / 2) * g.lado, (j + 0.5 - g.n / 2) * g.lado]
}

const f = (x: number): string => x.toFixed(4)

/**
 * Las marejadas sin el agrupamiento ni el picado (la parte determinista del mar), en u: la misma cuenta
 * que `marejada` en el shader. Pura, para el invariante.
 */
export function marejadasEn(x: number, z: number, t: number): number {
  let suma = 0
  for (const [rumbo, largo, alto] of PISO_VIVO.mar.marejadas) {
    const k = (2 * Math.PI) / largo
    const w = Math.sqrt(PISO_VIVO.mar.gravedad * k)
    suma += alto * Math.sin(k * (Math.cos(rumbo) * x + Math.sin(rumbo) * z) - w * t + rumbo * 3.7)
  }
  return suma * PISO_VIVO.mar.alto
}

/** El mar en GLSL: `marEn( xz, t )`, la altura del mar sin el borde (u). Pide `ruidoDelPiso`. */
const MAR_GLSL = /* glsl */ `
float marejada( vec2 x, float t, float rumbo, float largo, float alto ) {
	float k = 6.2831853 / largo;
	float w = sqrt( ${f(PISO_VIVO.mar.gravedad)} * k );
	return alto * sin( k * dot( vec2( cos( rumbo ), sin( rumbo ) ), x ) - w * t + rumbo * 3.7 );
}
float marEn( vec2 x, float t ) {
	float s = 0.0;
	${PISO_VIVO.mar.marejadas.map(([r, l, a]) => `s += marejada( x, t, ${f(r)}, ${f(l)}, ${f(a)} );`).join('\n\t')}
	float grupo = 0.55 + 0.9 * ruidoDelPiso( vec3( x * ${f(PISO_VIVO.mar.grupos.escala)}, t * ${f(PISO_VIVO.mar.grupos.cambia)} ) );
	vec2 corre = vec2( t * ${f(PISO_VIVO.mar.picado.deriva)}, - t * ${f(PISO_VIVO.mar.picado.deriva * 0.66)} );
	float picado = ${f(PISO_VIVO.mar.picado.alto)} * ( ruidoDelPiso( vec3( x * ${f(PISO_VIVO.mar.picado.escala)} + corre, t * 0.12 ) ) - 0.5 );
	return ( s * grupo + picado ) * ${f(PISO_VIVO.mar.alto)};
}
`

/**
 * LA SIMULACIÓN — un paso fijo de la ecuación de ondas. Canal r: la onda; g: la del paso anterior; b: la
 * altura que se dibuja (la onda más el mar, con el techo del logo). Las fuentes de la onda: el cursor (un
 * resorte hacia una loma bajo su proyección) y el frente de cada anillo del pulso.
 */
export const SIMULACION_GLSL = /* glsl */ `
precision highp float;
uniform sampler2D uEstado[ 1 ];
uniform vec2 uTam;
uniform float uDt;
uniform float uC2;
uniform float uRadio;
uniform float uLado;
uniform vec4 uCursor;
uniform float uTiempo;
uniform vec4 uAnillos[ ${ANILLOS_EN_EL_SHADER} ];
uniform float uConLogo;
uniform vec4 uLogoC;
uniform vec4 uLogoP;
uniform vec4 uLogoPalo;
uniform mat4 uLogoInverso;
uniform vec3 uCamara;
in vec2 vUv;
layout( location = 0 ) out vec4 salida;

float azarDelPiso( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruidoDelPiso( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azarDelPiso( i ), azarDelPiso( i + vec3( 1, 0, 0 ) ), u.x ), mix( azarDelPiso( i + vec3( 0, 1, 0 ) ), azarDelPiso( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azarDelPiso( i + vec3( 0, 0, 1 ) ), azarDelPiso( i + vec3( 1, 0, 1 ) ), u.x ), mix( azarDelPiso( i + vec3( 0, 1, 1 ) ), azarDelPiso( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z );
}
${MAR_GLSL}
${CARAS_DEL_LOGO_GLSL}

float alto( ivec2 c ) {
	ivec2 t = ivec2( uTam );
	return texelFetch( uEstado[ 0 ], clamp( c, ivec2( 0 ), t - 1 ), 0 ).r;
}

// Cuánto empuja un anillo del pulso a la distancia r (u): su frente, como el que dibuja E4.
float empujeDelAnillo( vec4 a, float r ) {
	if ( a.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - a.x ) / a.y;
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = ${NACE_EN.toFixed(1)} + ( a.z - ${NACE_EN.toFixed(1)} ) * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float d = ( r - frente ) / ${f(PISO_VIVO.pulso.ancho)};
	// La fuerza de cada clase, por su alcance (el principal llega a ${PULSO.anillos.principal.alcance}).
	float fuerza = a.z > ${(PULSO.anillos.principal.alcance - 1).toFixed(1)} ? ${f(PISO_VIVO.pulso.principal)} : ( a.z > ${(PULSO.anillos.reposo.alcance - 1).toFixed(1)} ? ${f(PISO_VIVO.pulso.reposo)} : ${f(PISO_VIVO.pulso.hover)} );
	return fuerza * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.05, t );
}

void main() {
	ivec2 c = ivec2( gl_FragCoord.xy );
	vec4 e = texelFetch( uEstado[ 0 ], c, 0 );
	float h = e.r;
	float antes = e.g;
	// El laplaciano de nueve puntos: isótropo (con cuatro vecinos el frente de una ola sale cuadrado).
	float cruz = alto( c + ivec2( 1, 0 ) ) + alto( c - ivec2( 1, 0 ) ) + alto( c + ivec2( 0, 1 ) ) + alto( c - ivec2( 0, 1 ) );
	float esquinas = alto( c + ivec2( 1, 1 ) ) + alto( c + ivec2( -1, 1 ) ) + alto( c + ivec2( 1, -1 ) ) + alto( c + ivec2( -1, -1 ) );
	float lap = ( 4.0 * cruz + esquinas - 20.0 * h ) / 6.0;
	// En celdas, desde el centro del disco.
	vec2 p = vec2( c ) + 0.5 - uTam * 0.5;
	float r = length( p );
	float borde = smoothstep( uRadio - ${PISO_VIVO.onda.borde.toFixed(1)}, uRadio, r );
	float amortigua = ${f(PISO_VIVO.onda.amortigua)} + borde * 14.0;
	float fuerza = - ${f(PISO_VIVO.onda.vuelta)} * h;
	// El cursor: un resorte hacia una loma, sólo cerca de su proyección (uCursor: x, y en celdas, radio, presencia).
	vec2 alCursor = p - uCursor.xy;
	float g = exp( - dot( alCursor, alCursor ) / ( uCursor.z * uCursor.z ) );
	fuerza += uCursor.w * ${f(PISO_VIVO.cursor.rigidez)} * g * ( ${f(PISO_VIVO.cursor.alto)} * g - h );
	// El pulso: el frente de cada anillo vivo.
	for ( int i = 0; i < ${ANILLOS_EN_EL_SHADER}; i++ ) fuerza += empujeDelAnillo( uAnillos[ i ], r * uLado );
	float nueva = h + ( h - antes ) * ( 1.0 - amortigua * uDt ) + uC2 * lap + fuerza * uDt * uDt;
	// Afuera del disco, quieto.
	nueva *= 1.0 - step( uRadio, r );
	// Lo que se dibuja: la onda y el mar (que se apaga en el borde), sin tocar nunca al logo.
	vec2 xz = p * uLado;
	float radio = uRadio * uLado;
	float enElMar = smoothstep( radio - ${f(PISO_VIVO.mar.borde[0])}, radio - ${f(PISO_VIVO.mar.borde[1])}, length( xz ) );
	// La onda dibujada con un tope suave: llamativa, no invasiva.
	float onda = ${f(PISO_VIVO.onda.tope)} * tanh( nueva / ${f(PISO_VIVO.onda.tope)} );
	float dibujo = ( onda + marEn( xz, uTiempo ) ) * enElMar;
	if ( uConLogo > 0.5 ) {
		for ( int k = 0; k < 2; k++ ) {
			vec3 tapa = vec3( xz.x, ${f(FLOOR_Y)} + dibujo, xz.y );
			float libre = caraDelLogo( ( uLogoInverso * vec4( tapa, 1.0 ) ).xyz ) - 0.7072 * uLado - ${f(PISO_VIVO.techo.margen)};
			if ( libre < 0.0 ) dibujo += libre;
		}
	}
	// Nunca por encima del ojo (PISO_VIVO.ojo): un techo blando, sólo con la cámara arriba del piso.
	if ( uCamara.y > ${f(FLOOR_Y)} ) {
		float techo = uCamara.y - ${f(FLOOR_Y)} - ${f(PISO_VIVO.ojo.margen)} + max( 0.0, length( xz - uCamara.xz ) - ${f(PISO_VIVO.ojo.desde)} ) * ${f(PISO_VIVO.ojo.sube)};
		float blando = ${f(PISO_VIVO.ojo.suave)};
		if ( dibujo > techo - blando ) dibujo = techo - blando * exp( - ( dibujo - techo + blando ) / blando );
	}
	salida = vec4( nueva, h, dibujo, 1.0 );
}
`

export interface UniformsDelPiso {
  readonly uAlturas: { value: THREE.Texture | null }
  readonly uLado: { value: number }
  readonly uRadioDelPiso: { value: number }
  readonly uN: { value: number }
}

const l = PISO_VIVO.luz

/**
 * El material de los bloques: el papel del piso (`MeshStandardMaterial`, las mismas luces), con la altura
 * de cada bloque en el vértice (recortado al disco) y, en el fragmento, la oclusión, el bisel y lo que el
 * piso tiene encima.
 */
export function conPisoVivo(material: THREE.MeshStandardMaterial, uniforms: UniformsDelPiso & Record<string, THREE.IUniform>, conContacto = false, conSombra = false): THREE.MeshStandardMaterial {
  material.onBeforeCompile = (shader) => {
    // [RETOQUE DEL PIE] P2 · y las sombras de contacto de las piezas del pie (`pie3d/sombras.ts`).
    Object.assign(shader.uniforms, uniforms, SOMBRAS_DEL_PIE)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute vec2 aCelda;
uniform sampler2D uAlturas;
uniform float uLado;
uniform float uRadioDelPiso;
uniform float uN;
varying vec3 vPiso;
varying vec2 vEnElBloque;
varying float vTapa;
varying float vAlto;
varying float vVecino;
varying vec4 vVecinos;
varying float vEscalon;
varying float vAltoDelBloque;
float altoDelBloque( ivec2 c ) {
	if ( c.x < 0 || c.y < 0 || c.x >= int( uN ) || c.y >= int( uN ) ) return 0.0;
	return texelFetch( uAlturas, c, 0 ).b;
}`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
	ivec2 celda = ivec2( aCelda );
	float altoPropio = altoDelBloque( celda );
	vAltoDelBloque = altoPropio;
	vVecino = altoDelBloque( celda + ivec2( round( normal.x ), round( normal.z ) ) );
	vVecinos = vec4( altoDelBloque( celda + ivec2( 1, 0 ) ), altoDelBloque( celda - ivec2( 1, 0 ) ), altoDelBloque( celda + ivec2( 0, 1 ) ), altoDelBloque( celda - ivec2( 0, 1 ) ) ) - altoPropio;
	// El costado de un escalón chico se sombrea como la tapa: con alturas continuas cada vecino difiere un
	// poco, y si todos los costados se vieran de costado el piso entero sería una grilla de rayas.
	vEscalon = normal.y > 0.5 ? 0.0 : smoothstep( ${f(l.escalon[0])}, ${f(l.escalon[1])}, altoPropio - vVecino );
	if ( normal.y < 0.5 ) objectNormal = normalize( mix( vec3( 0.0, 1.0, 0.0 ), normal, vEscalon ) );`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
	{
		vEnElBloque = position.xz / uLado + 0.5;
		vTapa = step( 0.5, normal.y );
		// Recortado al disco: la esquina que cae afuera se trae al círculo.
		vec2 centro = ( modelMatrix * instanceMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) ).xz;
		vec2 xz = centro + position.xz;
		float rr = length( xz );
		if ( rr > uRadioDelPiso ) xz *= uRadioDelPiso / rr;
		transformed.xz = xz - centro;
		transformed.y = position.y > 0.5 ? altoPropio : - ${f(PISO_VIVO.zocalo)};
		vAlto = transformed.y;
		vPiso = ( modelMatrix * instanceMatrix * vec4( transformed, 1.0 ) ).xyz;
	}`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uHaz;
uniform float uNocheDelLogo;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
uniform vec2 uLuzDelBisel;
uniform float uLado;
varying vec3 vPiso;
varying vec2 vEnElBloque;
varying float vTapa;
varying float vAlto;
varying float vVecino;
varying vec4 vVecinos;
varying float vEscalon;
varying float vAltoDelBloque;
${ANILLOS_GLSL}
${MANCHA_GLSL}${SOMBRAS_DEL_PIE_GLSL}
${CHARCO_DEL_HAZ_GLSL}
${conContacto ? CONTACTO_DE_LA_TRAMA_GLSL : ''}
${conSombra ? SOMBRA_DEL_LOGO_GLSL : ''}`,
      )
      .replace(
        '#include <colorspace_fragment>',
        `#include <colorspace_fragment>
	{
		float luz = 1.0;
		if ( vTapa < 0.5 ) {
			// El costado: más oscuro hacia la rendija con el vecino (su tapa es donde el costado deja de verse).
			luz = mix( 1.0, ${f(l.costado)} * ( 1.0 - ${f(l.rendija[0])} * exp( - max( 0.0, vAlto - vVecino ) / ${f(l.rendija[1])} ) ), vEscalon );
		} else {
			// La tapa: más oscura junto a un vecino más alto; el filo que mira a la luz, apenas más claro.
			vec4 filo = vec4( 1.0 - vEnElBloque.x, vEnElBloque.x, 1.0 - vEnElBloque.y, vEnElBloque.y ) * uLado;
			vec4 junto = smoothstep( 0.0, 0.15, vVecinos ) * exp( - filo / ${f(l.junto[1])} );
			luz = 1.0 - ${f(l.junto[0])} * min( 1.0, junto.x + junto.y + junto.z + junto.w );
			// Sólo el filo de un escalón que baja: el que queda al ras no tiene filo.
			vec4 enElFilo = ( 1.0 - smoothstep( 0.0, ${f(l.bisel[0])} * uLado, filo ) ) * smoothstep( ${f(l.escalon[0])}, ${f(l.escalon[1])}, - vVecinos );
			vec4 mira = vec4( uLuzDelBisel.x, - uLuzDelBisel.x, uLuzDelBisel.y, - uLuzDelBisel.y );
			luz *= 1.0 + ${f(l.bisel[1])} * dot( enElFilo, mira );
		}
		// Lo hondo, un poco más oscuro y lo alto, un poco más claro: el valle junta menos luz que la cresta.
		luz *= 1.0 + ${f(l.hondo[0])} * clamp( vAltoDelBloque / ${f(l.hondo[1])}, -1.0, 1.0 );
		// [ESCENA 8] T2: al pie de la pared de la trama el piso junta menos luz (con la trama anclada).
		${conContacto ? 'luz *= 1.0 - contactoDeLaTrama( length( vPiso.xz ) );' : ''}
		gl_FragColor.rgb *= luz;
		// Lo que antes eran planos apoyados, en el mismo orden: la mancha, el charco del haz y el pulso.
		vec2 m = manchaDelContacto( vPiso.xz );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, m.x );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, m.y );
		// [ESCENA 10] T1 · la sombra proyectada del logo (con la luz principal, de día), conviviendo con la mancha.
		${conSombra ? APLICAR_LA_SOMBRA_GLSL : ''} ${APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL}
		gl_FragColor.rgb += charcoDelHaz( vPiso.xz ) * uHaz;
		gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3( uNoche ), cuantoDelPulso( length( vPiso.xz ) ) );
	}`,
      )
  }
  material.customProgramCacheKey = () => `piso-vivo-mar${conContacto ? '-contacto' : ''}${conSombra ? '-sombra-del-logo' : ''}`
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

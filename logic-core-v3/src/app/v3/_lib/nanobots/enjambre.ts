import * as THREE from 'three'

import { INK_COLOR } from '../escena/probeScene'
import { CAPAS_DEL_ROBOT } from './robot'
import { ENGRANAJES, GLOBO, simbolosDelEnjambre } from './simbolos'
import { VIDA_DEL_ROBOT_GLSL } from './vida'

/**
 * [PASADA FINAL] C4 · EL ENJAMBRE DE SERVICIOS, EN WEBGL — unos miles de nanobots en UNA llamada (`Points`), con los cuatro
 * destinos precalculados (`simbolos.ts`) como atributos y el morph en la GPU: la CPU, en cada cuadro, sólo escribe cinco
 * números (de qué símbolo a cuál, cuánto, el reloj y si hay movimiento reducido).
 *
 *   · **El cambio de símbolo, con física**: cada nanobot sale con su retraso (hasta el 40 % del traspaso), viaja con un
 *     resorte que se pasa un 10 % y vuelve (la inercia) y a mitad de camino se desparrama (la dispersión, que se recoge al
 *     llegar). Nunca un fundido: se desarman y se arman. El color va de un acento al otro con el mismo avance.
 *   · **Vivo**: la nube flota; el globo gira sobre su eje (su aro, la silueta, no); los engranajes giran cada uno sobre su
 *     centro, al revés y en la razón de sus dientes; el robot habla (el texto del globo se tipea) y su flujo se enciende
 *     tramo a tramo con un pulso ([AJUSTES FINALES] A6: `vida.ts`, que también dice cuánto se ve cada nanobot del robot).
 *   · **Pseudo-3D**: la profundidad agranda los cercanos y apaga los lejanos; los símbolos planos se mecen apenas (el globo
 *     no: ya gira, y su aro es plano).
 *   · Con movimiento reducido: el símbolo quieto (sin reloj; el robot en su estado final) y el cambio, de golpe a mitad del
 *     traspaso.
 *
 * El avance sale de la posición DISPARADA del rodillo (`servicios/disparo.ts`): el mismo `MotionValue` que el rodillo, la
 * torta y el CTA. Ningún reloj propio para el traspaso.
 */

/** Los acentos de marca de cada servicio (CLAUDE.md, «Service accent colors»: no se cambian); la nube, en tinta. */
export const ACENTOS_DEL_ENJAMBRE = {
  nube: INK_COLOR,
  web: '#06b6d4',
  software: '#8b5cf6',
  ia: '#10b981',
  automatizacion: '#f59e0b',
} as const

/** El traspaso por partícula: hasta cuánto se retrasa, el resorte (sobrepaso y frecuencia) y cuánto se desparrama. */
export const FISICA_DEL_ENJAMBRE = { retraso: 0.4, amortiguacion: 5.5, frecuencia: 7.5, dispersion: 0.3 } as const

/** El resorte de un nanobot (0 → 1, pasándose un 10 % y volviendo; llega exacto a 1). */
export function resorteDelEnjambre(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - Math.exp(-FISICA_DEL_ENJAMBRE.amortiguacion * t) * Math.cos(FISICA_DEL_ENJAMBRE.frecuencia * t)
}

/** De qué símbolo a cuál y cuánto, con la posición disparada (0 a 3); posada en un entero, quieta en él. */
export function tramoDelEnjambre(posicion: number, quieto: boolean): { readonly desde: number; readonly hacia: number; readonly avance: number } {
  const p = Math.min(3, Math.max(0, posicion))
  const k = Math.floor(p)
  const f = p - k
  if (k >= 3 || f < 1e-4) return { desde: k, hacia: k, avance: 1 }
  // Con movimiento reducido, de golpe: el símbolo de donde está más cerca.
  if (quieto) return f < 0.5 ? { desde: k, hacia: k, avance: 1 } : { desde: k + 1, hacia: k + 1, avance: 1 }
  return { desde: k, hacia: k + 1, avance: f }
}

const f = (x: number): string => x.toFixed(5)
const F = FISICA_DEL_ENJAMBRE

export const VERTICE_DEL_ENJAMBRE = /* glsl */ `
attribute vec4 aS0;
attribute vec4 aS1;
attribute vec4 aS2;
attribute vec4 aS3;
attribute vec4 aAzar;
uniform float uDesde;
uniform float uHacia;
uniform float uAvance;
uniform float uTiempo;
uniform float uQuieto;
uniform float uTamano;
uniform vec3 uColores[ 5 ];
uniform vec2 uCentroA;
uniform vec2 uCentroB;
varying vec3 vColor;
varying float vAlfa;
vec4 destino( float k ) { return k < 0.5 ? aS0 : ( k < 1.5 ? aS1 : ( k < 2.5 ? aS2 : aS3 ) ); }
vec2 girar( vec2 p, float a ) { float c = cos( a ); float s = sin( a ); return vec2( c * p.x - s * p.y, s * p.x + c * p.y ); }
${VIDA_DEL_ROBOT_GLSL}
// Cada símbolo, vivo en el tiempo.
vec3 vivo( float k, vec4 d, float t ) {
	vec3 p = d.xyz;
	if ( k < 0.5 ) {
		p += 0.05 * vec3( sin( t * 0.6 + aAzar.x * 6.2832 ), sin( t * 0.47 + aAzar.y * 6.2832 ), sin( t * 0.53 + aAzar.z * 6.2832 ) );
		p.xz = girar( p.xz, t * 0.12 );
	} else if ( k < 1.5 ) {
		// La red gira sobre su eje, inclinada hacia quien mira; el aro (w 1) es la silueta: no gira.
		if ( d.w < 0.5 ) {
			p.xz = girar( p.xz, t * 0.35 );
			p.yz = girar( p.yz, ${f(GLOBO.inclinacion)} );
		}
	} else if ( k < 2.5 ) {
		vec2 c = d.w < 0.5 ? uCentroA : uCentroB;
		float a = d.w < 0.5 ? t * 0.6 : - t * 0.6 * ${f(ENGRANAJES.razon)};
		p.xy = c + girar( p.xy - c, a );
	} else if ( d.w < ${f(CAPAS_DEL_ROBOT.nodos)} ) {
		p.y += 0.012 * sin( t * 1.6 );
	}
	// Se mece apenas (el globo no).
	if ( k < 0.5 || k > 1.5 ) p.xz = girar( p.xz, 0.22 * sin( t * 0.3 ) );
	return p;
}
vec3 colorDe( float k, vec4 d ) {
	if ( k < 0.5 ) return uColores[ 0 ];
	if ( k < 1.5 ) return uColores[ 1 ];
	if ( k < 2.5 ) return uColores[ 2 ];
	return d.w < ${f(CAPAS_DEL_ROBOT.nodos)} ? uColores[ 3 ] : uColores[ 4 ];
}
float tamanoDe( float k, vec4 d ) {
	if ( k < 0.5 ) return 0.85;
	if ( k < 1.5 ) return 1.15;
	if ( k > 2.5 && d.w >= ${f(CAPAS_DEL_ROBOT.tramos)} ) return 0.9;
	return 1.0;
}
// Cuánto se ve y cuánto brilla cada nanobot: sólo el robot tiene vida propia (el texto que se tipea, el flujo que se enciende).
vec2 vidaDe( float k, vec4 d, float t ) { return k > 2.5 ? vidaDelRobot( d, t, uQuieto ) : vec2( 1.0, 0.0 ); }
float resorte( float t ) {
	if ( t <= 0.0 ) return 0.0;
	if ( t >= 1.0 ) return 1.0;
	return 1.0 - exp( - ${f(F.amortiguacion)} * t ) * cos( ${f(F.frecuencia)} * t );
}
void main() {
	float t = uTiempo * ( 1.0 - uQuieto );
	vec4 dA = destino( uDesde );
	vec4 dB = destino( uHacia );
	float u = clamp( ( uAvance - aAzar.x * ${f(F.retraso)} ) / ${f(1 - F.retraso)}, 0.0, 1.0 );
	float e = resorte( u );
	vec3 p = mix( vivo( uDesde, dA, t ), vivo( uHacia, dB, t ), e );
	// Se desparrama a mitad de camino y se recoge al llegar.
	p += ( aAzar.yzw * 2.0 - 1.0 ) * ${f(F.dispersion)} * sin( 3.14159265 * u );
	// La perspectiva: lo cercano, más grande; lo lejano, más tenue.
	float cerca = 3.0 / ( 3.0 - p.z );
	gl_Position = vec4( p.xy * cerca * 0.82, 0.0, 1.0 );
	float ec = clamp( e, 0.0, 1.0 );
	vec2 vida = mix( vidaDe( uDesde, dA, t ), vidaDe( uHacia, dB, t ), ec );
	float pulso = vida.y;
	gl_PointSize = uTamano * mix( tamanoDe( uDesde, dA ), tamanoDe( uHacia, dB ), ec ) * cerca * ( 1.0 + 0.6 * pulso );
	vColor = mix( mix( colorDe( uDesde, dA ), colorDe( uHacia, dB ), ec ), vec3( 1.0 ), 0.35 * pulso );
	float deNube = mix( uDesde < 0.5 ? 0.6 : 1.0, uHacia < 0.5 ? 0.6 : 1.0, ec );
	vAlfa = mix( 0.38, 1.0, clamp( ( p.z + 1.0 ) * 0.5, 0.0, 1.0 ) ) * deNube * vida.x;
}
`

export const FRAGMENTO_DEL_ENJAMBRE = /* glsl */ `
varying vec3 vColor;
varying float vAlfa;
void main() {
	float a = smoothstep( 0.5, 0.26, length( gl_PointCoord - 0.5 ) ) * vAlfa;
	if ( a < 0.01 ) discard;
	// Premultiplicado (el lienzo es transparente) y ya en sRGB: el acento sale exacto.
	gl_FragColor = vec4( vColor * a, a );
}
`

export interface Enjambre {
  /** Un cuadro: el reloj (s), la posición disparada del rodillo y si hay movimiento reducido. */
  readonly dibujar: (segundos: number, posicion: number, quieto: boolean) => void
  /** El tamaño del lienzo (px CSS). */
  readonly medir: (ancho: number, alto: number) => void
  readonly soltar: () => void
}

/** Un acento en sRGB (lo que escribe el sombreador va derecho al lienzo, sin conversión). */
function enSrgb(color: string): THREE.Vector3 {
  const c = new THREE.Color(color)
  const rgb = { r: 0, g: 0, b: 0 }
  c.getRGB(rgb, THREE.SRGBColorSpace)
  return new THREE.Vector3(rgb.r, rgb.g, rgb.b)
}

/** El enjambre sobre su lienzo: si el navegador no da WebGL, tira (y el que lo monta deja la torta). */
export function crearEnjambre(lienzo: HTMLCanvasElement, puntos: number): Enjambre {
  const renderer = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'default' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  const geometria = new THREE.BufferGeometry()
  // `position` no se usa (los destinos van aparte), pero three la pide para dibujar.
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(puntos * 3), 3))
  simbolosDelEnjambre(puntos).forEach((datos, k) => geometria.setAttribute(`aS${String(k)}`, new THREE.BufferAttribute(datos, 4)))
  const azar = new Float32Array(puntos * 4)
  let semilla = 0x9e3779b9
  for (let i = 0; i < azar.length; i += 1) {
    semilla = (Math.imul(semilla ^ (semilla >>> 15), 0x2c1b3c6d) + 0x297a2d39) >>> 0
    azar[i] = semilla / 4294967296
  }
  geometria.setAttribute('aAzar', new THREE.BufferAttribute(azar, 4))
  const A = ACENTOS_DEL_ENJAMBRE
  const uniforms = {
    uDesde: { value: 0 },
    uHacia: { value: 0 },
    uAvance: { value: 1 },
    uTiempo: { value: 0 },
    uQuieto: { value: 0 },
    uTamano: { value: 2 },
    uColores: { value: [A.nube, A.web, A.software, A.ia, A.automatizacion].map(enSrgb) },
    uCentroA: { value: new THREE.Vector2(...ENGRANAJES.a.centro) },
    uCentroB: { value: new THREE.Vector2(...ENGRANAJES.b.centro) },
  }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTICE_DEL_ENJAMBRE, fragmentShader: FRAGMENTO_DEL_ENJAMBRE, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true })
  const nanobots = new THREE.Points(geometria, material)
  nanobots.frustumCulled = false
  const escena = new THREE.Scene()
  escena.add(nanobots)
  const camara = new THREE.Camera()
  return {
    dibujar: (segundos, posicion, quieto) => {
      const { desde, hacia, avance } = tramoDelEnjambre(posicion, quieto)
      uniforms.uDesde.value = desde
      uniforms.uHacia.value = hacia
      uniforms.uAvance.value = avance
      uniforms.uTiempo.value = segundos
      uniforms.uQuieto.value = quieto ? 1 : 0
      renderer.render(escena, camara)
    },
    medir: (ancho, alto) => {
      if (ancho <= 0 || alto <= 0) return
      renderer.setSize(ancho, alto, false)
      // El punto, en px del lienzo: crece con el gráfico (de 1,6 en la cabeza angosta a 2,6 en el panel). [AJUSTES FINALES] A6 ·
      // el piso subió de 1,4: a paso constante, un nanobot tiene que tocar al siguiente para que el trazo sea una línea.
      uniforms.uTamano.value = Math.min(2.6, Math.max(1.6, ancho / 140)) * renderer.getPixelRatio()
    },
    soltar: () => {
      geometria.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

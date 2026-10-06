import * as THREE from 'three'

import { PISO_EN_VIVO } from '../piso/enVivo'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { FLOOR_Y, INK_COLOR } from '../probeScene'

/**
 * [EL ENCASTRE] 2C · EL VAPOR AL ACOSTARSE — mientras el logo se acuesta, desde los alrededores del hueco (el contorno del
 * logo acostado, en el piso) suben columnas de partículas, con el espíritu de las de nk: cada columna es un chorro que
 * sube de un punto y cada partícula, a su altura, se curva hacia afuera con su variación, cae y SE QUEDA QUIETA en el piso
 * (apoyada en su bloque: sube y baja con el mar). No desaparecen: su único modo de irse es hundirse en el piso al
 * revertir (`uHundir`; las tapa el piso). Tinta, para que se lean sobre el piso claro.
 *
 * UN dibujo (`THREE.Points`). Todo lo hace el sombreador con el reloj del vapor (`uT`, los segundos de la secuencia hacia
 * adelante; al revertir se congela): la trayectoria es una parábola (sube primero, se abre después: lo horizontal crece
 * con u²), con un vaivén de vapor que se apaga al caer.
 */
export const VAPOR = {
  columnas: 48,
  porColumna: 32,
  /** Cuándo salen (s del reloj): la primera columna y cuánto más tarde puede arrancar otra; cada columna sopla `soplaS`. */
  desdeS: 0.15,
  desfaseS: 0.5,
  soplaS: 1.35,
  /** Cuánto vuela cada una (s), a qué altura llega (u) y cuánto se abre hacia afuera (u): de mínimo a máximo. */
  vueloS: [1.3, 2.3],
  altura: [1.6, 4.6],
  afuera: [1.1, 4.4],
  /** Cuánto se separa la base de la columna del borde del hueco (u) y cuánto se tuerce el rumbo de cada una (rad). */
  base: [0.25, 0.75],
  rumbo: 0.4,
  /** El tamaño en pantalla (px CSS a 40 u de la cámara) y lo que se hunde cada una al revertir (u). */
  tamanoPx: [2.4, 6],
  hundeU: [0.5, 1.2],
} as const

const f = (x: number): string => x.toFixed(4)
const V = VAPOR

const VERTICE = /* glsl */ `
uniform float uT;
uniform float uHundir;
uniform float uPixel;
uniform float uEscala;
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
attribute vec2 aAfuera;
attribute vec4 aVuelo;
attribute vec4 aAzar;
varying float vVe;
float alturaDelPiso( vec2 xz ) {
	if ( uGrillaDelPiso.z < 0.5 ) return ${f(FLOOR_Y)};
	ivec2 c = ivec2( floor( xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5 ) );
	ivec2 n = ivec2( uGrillaDelPiso.x );
	return ${f(FLOOR_Y)} + texelFetch( uPisoVivo, clamp( c, ivec2( 0 ), n - 1 ), 0 ).b;
}
// [EL ENCASTRE] 2D · lo que cae adentro del hueco queda debajo del logo (no se posa sobre él).
bool enElHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return false;
	vec2 uv = ( vec2( xz.x, - xz.y ) - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw;
	if ( any( lessThan( uv, vec2( 0.0 ) ) ) || any( greaterThan( uv, vec2( 1.0 ) ) ) ) return false;
	return texture( uHueco, uv ).r > 0.5;
}
void main() {
	// aVuelo: cuándo sale (s), cuánto vuela (s), a qué altura llega (u), la fase de su vaivén.
	float tau = uT - aVuelo.x;
	float u = clamp( tau / aVuelo.y, 0.0, 1.0 );
	vec2 rumbo = normalize( aAfuera + vec2( 1e-5 ) );
	vec2 lado = vec2( - rumbo.y, rumbo.x );
	vec3 p = position;
	p.xz += aAfuera * u * u + lado * ( 0.12 + 0.18 * aAzar.y ) * sin( tau * ( 5.0 + 3.0 * aAzar.w ) + aVuelo.w ) * ( 1.0 - u );
	p.y += 4.0 * aVuelo.z * u * ( 1.0 - u );
	// Posada: sobre su bloque (con el mar), un pelo arriba de la tapa.
	if ( u >= 1.0 ) p.y = enElHueco( p.xz ) ? ${f(FLOOR_Y)} - 2.0 : alturaDelPiso( p.xz ) + 0.03;
	// Al revertir se hunde en el piso (que la tapa).
	p.y -= uHundir * mix( ${f(V.hundeU[0])}, ${f(V.hundeU[1])}, aAzar.z );
	vVe = step( 0.0, tau ) * ( 1.0 - 0.6 * uHundir );
	vec4 mv = modelViewMatrix * vec4( p, 1.0 );
	gl_Position = projectionMatrix * mv;
	gl_PointSize = mix( ${f(V.tamanoPx[0])}, ${f(V.tamanoPx[1])}, aAzar.x ) * uPixel * uEscala / max( 1.0, -mv.z ) * step( 0.0, tau );
}
`

const FRAGMENTO = /* glsl */ `
uniform vec3 uColor;
varying float vVe;
void main() {
	float r = length( gl_PointCoord - 0.5 );
	if ( r > 0.5 || vVe <= 0.0 ) discard;
	gl_FragColor = vec4( uColor, smoothstep( 0.5, 0.3, r ) * 0.9 * vVe );
}
`

export interface Vapor {
  readonly puntos: THREE.Points
  readonly uniformes: { readonly uT: { value: number }; readonly uHundir: { value: number }; readonly uPixel: { value: number } }
  readonly soltar: () => void
}

/**
 * El vapor armado una vez: las columnas nacen alrededor del `contorno` del logo acostado (puntos del mundo, en el plano del
 * piso, alrededor del centro `x = z = 0`). `azar` es el generador (determinista para el invariante).
 */
export function crearElVapor(contorno: readonly THREE.Vector2[], azar: () => number): Vapor {
  const n = V.columnas * V.porColumna
  const posicion = new Float32Array(n * 3)
  const afuera = new Float32Array(n * 2)
  const vuelo = new Float32Array(n * 4)
  const azarDe = new Float32Array(n * 4)
  const entre = (a: readonly [number, number]): number => a[0] + (a[1] - a[0]) * azar()
  for (let c = 0; c < V.columnas; c += 1) {
    // La base de la columna: un punto del contorno (parejos por índice), corrido hacia afuera del centro.
    const o = contorno.length === 0 ? new THREE.Vector2(1, 0) : contorno[Math.floor(((c + azar() * 0.5) / V.columnas) * contorno.length) % contorno.length]
    const largo = o.length() || 1
    const dir = new THREE.Vector2(o.x / largo, o.y / largo)
    const base = o.clone().addScaledVector(dir, entre(V.base))
    const arranca = V.desdeS + azar() * V.desfaseS
    for (let k = 0; k < V.porColumna; k += 1) {
      const i = c * V.porColumna + k
      posicion.set([base.x + (azar() - 0.5) * 0.08, FLOOR_Y + 0.04, base.y + (azar() - 0.5) * 0.08], i * 3)
      const ang = Math.atan2(dir.y, dir.x) + (azar() - 0.5) * 2 * V.rumbo
      const d = entre(V.afuera)
      afuera.set([Math.cos(ang) * d, Math.sin(ang) * d], i * 2)
      vuelo.set([arranca + (k / V.porColumna) * V.soplaS + azar() * 0.03, entre(V.vueloS), entre(V.altura), azar() * Math.PI * 2], i * 4)
      azarDe.set([azar(), azar(), azar(), azar()], i * 4)
    }
  }
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(posicion, 3))
  geometria.setAttribute('aAfuera', new THREE.BufferAttribute(afuera, 2))
  geometria.setAttribute('aVuelo', new THREE.BufferAttribute(vuelo, 4))
  geometria.setAttribute('aAzar', new THREE.BufferAttribute(azarDe, 4))
  // Se mueven en el sombreador: three no sabe dónde quedan (no se descartan por encuadre).
  geometria.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, FLOOR_Y, 0), 40)
  const uniformes = {
    uT: { value: 0 },
    uHundir: { value: 0 },
    uPixel: { value: 1 },
    uEscala: { value: 40 },
    uColor: { value: new THREE.Color(INK_COLOR) },
    uPisoVivo: PISO_EN_VIVO.uPisoVivo,
    uGrillaDelPiso: PISO_EN_VIVO.uGrillaDelPiso,
    uHueco: FINAL_EN_EL_PISO.uHueco,
    uMarcoDelHueco: FINAL_EN_EL_PISO.uMarcoDelHueco,
    uApertura: FINAL_EN_EL_PISO.uApertura,
  }
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICE, fragmentShader: FRAGMENTO, uniforms: uniformes, transparent: true, depthWrite: false })
  const puntos = new THREE.Points(geometria, material)
  puntos.name = 'vapor del final'
  puntos.frustumCulled = false
  puntos.visible = false
  return {
    puntos,
    uniformes,
    soltar: () => {
      geometria.dispose()
      material.dispose()
    },
  }
}

/** Cuándo terminó de posarse la última (s del reloj): desde ahí el vapor es un mar de puntos quietos. */
export function vaporPosado(): number {
  return V.desdeS + V.desfaseS + V.soplaS + 0.03 + V.vueloS[1]
}

/**
 * Lo que el vapor recuerda de un cuadro al otro: su reloj (los segundos de la secuencia hacia adelante; al revertir se
 * congela), cuánto se hundió y si está armado (sopla sólo en una secuencia que arranca de cero).
 */
export interface EstadoDelVapor {
  reloj: number
  hundir: number
  armado: boolean
}

export function vaporQuieto(): EstadoDelVapor {
  return { reloj: 0, hundir: 0, armado: false }
}

/** Cuánto tarda en hundirse entero (s): una vez que empieza, termina (ése es su único modo de irse). */
export const HUNDIRSE_S = 0.9

/**
 * Un cuadro: `segundos` del reloj del final, si avanza, y `dt`. Con el final en cero se arma; hacia adelante sigue al reloj;
 * al revertir se hunde entero y se desarma (si la secuencia vuelve a avanzar sin pasar por cero, no sopla de nuevo).
 */
export function pasoDelVapor(v: EstadoDelVapor, segundos: number, avanza: boolean, dt: number): void {
  if (segundos <= 0 && v.reloj === 0) {
    v.armado = true
    v.hundir = 0
    return
  }
  if (v.armado && avanza && v.hundir === 0) {
    v.reloj = Math.max(v.reloj, segundos)
    return
  }
  if (v.reloj > 0) {
    v.hundir = Math.min(1, v.hundir + dt / HUNDIRSE_S)
    if (v.hundir >= 1) {
      v.reloj = 0
      v.hundir = 0
      v.armado = false
    }
  }
}

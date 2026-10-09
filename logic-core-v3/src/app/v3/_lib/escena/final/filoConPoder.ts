import * as THREE from 'three'

import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'
import { HUECO } from './hueco'

/**
 * [PULIDO 6] E2 · EL FILO CON PODER — «el filo es un trazo por AFUERA del contorno del logo (un outline desplazado hacia
 * afuera). El logo conserva su silueta y su tamaño completos; el blanco crece hacia afuera». Es una banda plana, blanca, que
 * nace justo en la silueta del logo (el contorno más su bisel: `desde`) y va hacia afuera del negro (en los dos agujeros del
 * logo, hacia adentro del agujero). El blanco nunca pisa el negro: lo mide `s57` E2 · 1. Reemplaza al filo de PULIDO 5 (el
 * borde de las tapas pintado de blanco: le comía el negro) y a la luz del encastre (el tubo, el disco y el círculo liso).
 *
 * Va apenas encima de la cara de arriba del logo acostado, en el grupo del final y no en el del logo (la caja del logo la
 * miden la mancha de contacto y la caída: una banda más ancha la cambiaría), con la matriz del logo en cada cuadro. Se
 * enciende DE GOLPE en el golpe, en el mismo cuadro que suena (`luzDelFilo`), con un destello que lo ensancha; al rebobinar
 * se apaga al pasar el golpe para atrás.
 *
 * [PULIDO 7] F1 · GANA LA DESCARGA (la corriente, el pulso y `?filo=` se borraron): del filo salen corrientes POR LAS JUNTAS
 * cercanas, hacia afuera, y se pierden en las corrientes del piso (`descargaDelFilo`). Por donde pasan, la junta se ABRE (los
 * dos bloques retroceden: `ABRE_LA_JUNTA_GLSL`, en el vértice del piso) y por la rendija se ve la luz de abajo: nunca pintan
 * las tapas (el derrame de PULIDO 6 dejaba manchas blancas). Con cada onda que larga el logo y en el golpe, una ráfaga sale del
 * filo por las juntas a la vez (`rafagaDelFilo`). Los uniformes los escribe `cuadroDelFinal.ts`.
 */
export const FILO = {
  /** Dónde nace (u, desde el contorno): la silueta del logo, el contorno más lo que sale su bisel. */
  desde: PROBE_EXTRUDE.bevelSize * PROBE_SVG_SCALE,
  /** Su ancho (u) y el valor en pantalla de su blanco (y el del tramo que corre, del latido y del destello: 1). */
  ancho: 0.13,
  blanco: 0.9,
  /** Cuánto más ancho puede ponerse (fracción del ancho): la banda se arma con ese ancho y se recorta en el dibujo. */
  crece: 1.6,
  /** Cuánto encima de la cara del logo (u). */
  sobre: 0.002,
  /** El destello del golpe: cuánto lo ensancha (fracción) y en cuánto se apaga (s). */
  golpe: { crece: 1.4, s: 0.55 },
  /**
   * La descarga: hasta dónde llega (u desde el filo), la velocidad y el largo de cada una (u/s, u), cada cuánto sale una por
   * junta (s), cuántas de cada ciclo salen y su fuerza (como la de las corrientes del piso). [PULIDO 7] F1 · cuánto abre la
   * junta por donde pasa (u por bloque, con la fuerza entera) y la ráfaga: qué parte de las juntas larga una con cada onda y
   * con el golpe.
   */
  descarga: { alcance: 5, velocidad: [5, 9], largo: [0.8, 1.8], periodoS: [1.1, 2.6], cuantas: 0.55, fuerza: 1.6, abre: 0.06, rafaga: { onda: 0.6, golpe: 1 } },
} as const

export const FILO_EN_VIVO = {
  /** 0 apagado; 1 encendido (de golpe, en el golpe). */
  uLuzDelFilo: { value: 0 },
  /** Cuánto más ancho está el filo entero (fracción): el destello del golpe. */
  uCreceDelFilo: { value: 0 },
  /** La descarga (0 a 1: con el filo encendido; quieto, 0). */
  uDescargaDelFilo: { value: 0 },
  /** [PULIDO 7] F1 · la ráfaga: cuánto hace que salió (s) y qué parte de las juntas la larga (0: ninguna). */
  uRafagaDelFilo: { value: new THREE.Vector2(0, 0) },
}

/** El filo se enciende de golpe en el golpe: entero desde que `fin` lo pasa (en el mismo cuadro que suena), nada antes. */
export function luzDelFilo(fin: number, golpe: number): number {
  return fin >= golpe ? 1 : 0
}

/** Cuánto más ancho está el filo entero a `desdeElGolpe` s (infinito si no hubo): el destello del golpe. */
export function creceDelFilo(desdeElGolpe: number): number {
  return desdeElGolpe >= 0 && Number.isFinite(desdeElGolpe) ? FILO.golpe.crece * Math.exp(-desdeElGolpe / FILO.golpe.s) : 0
}

/**
 * [PULIDO 7] F1 · la ráfaga de descargas a `desdeLaOnda` y `desdeElGolpe` s (infinito si no hubo): la de lo último que pasó
 * (cuánto hace, qué parte de las juntas); ninguna cuando ya salió del alcance hasta la más lenta.
 */
export function rafagaDelFilo(desdeLaOnda: number, desdeElGolpe: number): readonly [number, number] {
  const D = FILO.descarga
  const [desde, parte] = desdeElGolpe <= desdeLaOnda ? [desdeElGolpe, D.rafaga.golpe] : [desdeLaOnda, D.rafaga.onda]
  return desde >= 0 && Number.isFinite(desde) && desde * D.velocidad[0] <= D.alcance + D.largo[1] ? [desde, parte] : [0, 0]
}

/** Los contornos del logo (el de afuera y los agujeros), sin puntos repetidos, en el plano de su grupo. */
export function contornosDelLogo(formas: readonly THREE.Shape[]): THREE.Vector2[][] {
  const contornos: THREE.Vector2[][] = []
  for (const f of formas) {
    for (const c of [f.getPoints(), ...f.holes.map((h) => h.getPoints())]) {
      const limpio = c.filter((p, i) => i === 0 || p.distanceToSquared(c[i - 1]) > 1e-12)
      if (limpio.length > 2 && limpio[0].distanceToSquared(limpio[limpio.length - 1]) < 1e-12) limpio.pop()
      if (limpio.length > 2) contornos.push(limpio)
    }
  }
  return contornos
}

/** Si un punto está en el negro del logo (par-impar sobre todos los contornos: como la máscara del hueco). */
export function enElNegro(contornos: readonly (readonly THREE.Vector2[])[], x: number, y: number): boolean {
  let dentro = false
  for (const c of contornos) {
    for (let i = 0, j = c.length - 1; i < c.length; j = i, i += 1) {
      const [a, b] = [c[i], c[j]]
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro
    }
  }
  return dentro
}

/**
 * La banda del filo: por cada contorno, de `desde` a `hasta` (u) hacia AFUERA del negro (de qué lado queda el negro se prueba,
 * no se supone: un pelo a la izquierda del tramo más largo). En cada punto, la normal de las dos aristas (a inglete, con tope).
 * `aFilo`: 0 en el borde de adentro y 1 en el de afuera. El contorno se cierra con su primer punto repetido.
 */
export function bandaDelFilo(contornos: readonly (readonly THREE.Vector2[])[], desde: number, hasta: number): THREE.BufferGeometry {
  const posiciones: number[] = []
  const filo: number[] = []
  const indices: number[] = []
  contornos.forEach((c) => {
    const n = c.length
    const tramo = (i: number): THREE.Vector2 => c[(i + 1) % n].clone().sub(c[i % n])
    let mas = 0
    c.forEach((_, i) => {
      if (tramo(i).length() > tramo(mas).length()) mas = i
    })
    const t = tramo(mas).normalize()
    const medio = c[mas].clone().add(c[(mas + 1) % n]).multiplyScalar(0.5)
    const lado = enElNegro(contornos, medio.x - t.y * 1e-3, medio.y + t.x * 1e-3) ? -1 : 1
    const normal = (i: number): THREE.Vector2 => {
      const d = tramo(i).normalize()
      return new THREE.Vector2(-d.y * lado, d.x * lado)
    }
    const base = posiciones.length / 3
    for (let i = 0; i <= n; i += 1) {
      const [n1, n2] = [normal(i - 1 + n), normal(i)]
      const suma = n1.clone().add(n2)
      const m = suma.lengthSq() > 1e-8 ? suma.normalize() : n2
      const k2 = 1 / Math.max(0.5, m.dot(n2))
      const p = c[i % n]
      for (const [d, z] of [[desde, 0], [hasta, 1]] as const) {
        posiciones.push(p.x + m.x * d * k2, p.y + m.y * d * k2, 0)
        filo.push(z)
      }
      if (i < n) {
        const a = base + 2 * i
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3))
  g.setAttribute('aFilo', new THREE.Float32BufferAttribute(filo, 1))
  g.setIndex(indices)
  return g
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const ANCHO_ENTERO = FILO.ancho * (1 + FILO.crece)

const VERTICE_GLSL = /* glsl */ `
attribute float aFilo;
varying float vFilo;
void main() {
	vFilo = aFilo;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

// El ancho de cada punto: el del filo, más el destello del golpe; el borde de afuera, de un píxel. El blanco sube a 1 en el destello.
const FRAGMENTO_GLSL = /* glsl */ `
uniform float uLuzDelFilo;
uniform float uCreceDelFilo;
varying float vFilo;
void main() {
	if ( uLuzDelFilo <= 0.0 ) discard;
	float x = vFilo * ${f(ANCHO_ENTERO)};
	float ancho = min( ${f(ANCHO_ENTERO)}, ${f(FILO.ancho)} * ( 1.0 + uCreceDelFilo ) );
	float aa = max( fwidth( x ) * 0.75, 1e-4 );
	float cubre = 1.0 - smoothstep( ancho - aa, ancho + aa, x );
	if ( cubre <= 0.0 ) discard;
	float blanco = mix( ${f(FILO.blanco)}, 1.0, clamp( uCreceDelFilo, 0.0, 1.0 ) );
	gl_FragColor = vec4( vec3( blanco ), cubre * min( uLuzDelFilo, 1.0 ) );
}
`

/** El filo armado: su malla (en el grupo del final, con la matriz del logo) y cómo soltarlo. */
export interface FiloArmado {
  readonly malla: THREE.Mesh
  readonly soltar: () => void
}

/** Arma el filo una vez (`formas`: las del logo en su plano; `espesor`: el del logo, para quedar sobre su cara de arriba). */
export function crearElFilo(formas: readonly THREE.Shape[], espesor: number): FiloArmado {
  const geometria = bandaDelFilo(contornosDelLogo(formas), FILO.desde, FILO.desde + ANCHO_ENTERO)
  geometria.translate(0, 0, espesor / 2 + FILO.sobre)
  // Sin tono ni niebla (el blanco es el de la pantalla); encima del piso al ras (con el corrimiento de profundidad).
  const material = new THREE.ShaderMaterial({
    uniforms: FILO_EN_VIVO,
    vertexShader: VERTICE_GLSL,
    fragmentShader: FRAGMENTO_GLSL,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
    toneMapped: false,
  })
  const malla = new THREE.Mesh(geometria, material)
  malla.name = 'filo del logo'
  malla.matrixAutoUpdate = false
  malla.frustumCulled = false
  malla.visible = false
  return {
    malla,
    soltar: () => {
      geometria.dispose()
      material.dispose()
    },
  }
}

const INVERSA = new THREE.Matrix4()

/** Lleva el filo a donde está el logo (su matriz de mundo, en el marco del padre del filo). */
export function seguirAlLogo(filo: THREE.Object3D, logo: THREE.Object3D): void {
  filo.matrix.copy(logo.matrixWorld)
  if (filo.parent !== null) filo.matrix.premultiply(INVERSA.copy(filo.parent.matrixWorld).invert())
  filo.matrixWorldNeedsUpdate = true
}

const D = FILO.descarga

/**
 * Las corrientes que salen del filo por las juntas: cada media junta (de un lado y del otro del logo) larga una en algunos de
 * sus ciclos, que corre hacia afuera (en la distancia al logo) con su velocidad y su largo, y se apaga al llegar a `alcance`,
 * donde siguen las del piso. [PULIDO 7] F1 · más la ráfaga (`uRafagaDelFilo`: con cada onda y en el golpe, de muchas juntas a la
 * vez) y nada adentro del logo lleno (`HUECO.relleno.liso`: el negro y sus contraformas). `descargaEnLaJunta` es la de la media
 * junta (vertical: la que corre a lo largo de z) sin el ancho de la junta: la usa el vértice para abrirla. Pide
 * `distanciaAlLogo` (`hueco.ts`), `azarDeLaLuz` y `uRelojDeLaLuz`.
 */
export const DESCARGA_DEL_FILO_GLSL = /* glsl */ `
uniform float uDescargaDelFilo;
uniform vec2 uRafagaDelFilo;
float descargaEnLaJunta( vec2 xz, float lado, bool vertical ) {
	if ( uDescargaDelFilo <= 0.0 ) return 0.0;
	float r = distanciaAlLogo( xz );
	if ( r < ${f(HUECO.relleno.liso)} || r > ${f(D.alcance)} ) return 0.0;
	vec2 g = xz / lado;
	vec2 semilla = vertical ? vec2( floor( g.x + 0.5 ), sign( xz.y ) ) : vec2( floor( g.y + 0.5 ) + 211.0, sign( xz.x ) );
	float luz = 0.0;
	float periodo = ${f(D.periodoS[0])} + ${f(D.periodoS[1] - D.periodoS[0])} * azarDeLaLuz( semilla + 0.21 );
	float ciclo = uRelojDeLaLuz / periodo + azarDeLaLuz( semilla + 0.67 );
	float n = floor( ciclo );
	vec2 sn = semilla + n * vec2( 1.37, 2.71 );
	if ( azarDeLaLuz( sn + 0.13 ) <= ${f(D.cuantas)} ) {
		float tau = ( ciclo - n ) * periodo;
		float cabeza = tau * ( ${f(D.velocidad[0])} + ${f(D.velocidad[1] - D.velocidad[0])} * azarDeLaLuz( sn + 0.41 ) );
		float largo = ${f(D.largo[0])} + ${f(D.largo[1] - D.largo[0])} * azarDeLaLuz( sn + 0.83 );
		float detras = cabeza - r;
		if ( detras >= 0.0 && detras <= largo ) luz = pow( 1.0 - detras / largo, 2.0 );
	}
	if ( uRafagaDelFilo.y > 0.0 && azarDeLaLuz( semilla + 0.29 ) < uRafagaDelFilo.y ) {
		float cabeza = uRafagaDelFilo.x * ( ${f(D.velocidad[0])} + ${f(D.velocidad[1] - D.velocidad[0])} * azarDeLaLuz( semilla + 0.47 ) );
		float largo = ${f(D.largo[0])} + ${f(D.largo[1] - D.largo[0])} * azarDeLaLuz( semilla + 0.59 );
		float detras = cabeza - r;
		if ( detras >= 0.0 && detras <= largo ) luz = max( luz, pow( 1.0 - detras / largo, 2.0 ) );
	}
	return ${f(D.fuerza)} * uDescargaDelFilo * luz * ( 1.0 - smoothstep( ${f(0.6 * D.alcance)}, ${f(D.alcance)}, r ) );
}
float descargaDelFilo( vec2 xz, float lado ) {
	vec2 g = xz / lado;
	vec2 cerca = abs( g - floor( g + 0.5 ) );
	float enLaJunta = 1.0 - smoothstep( 0.08, 0.2, min( cerca.x, cerca.y ) );
	if ( enLaJunta <= 0.0 ) return 0.0;
	return enLaJunta * descargaEnLaJunta( xz, lado, cerca.x < cerca.y );
}
`

/**
 * [PULIDO 7] F1 · LA DESCARGA ABRE LA JUNTA (en el vértice del piso, después de separar los bloques con la energía): cada esquina
 * de un bloque retrocede hacia su centro según la descarga de su junta de x y la de su junta de z (en esa esquina), así que por
 * donde pasa la rendija se ensancha y se ve la luz de abajo; la tapa no se toca. Pide `centro`, `position`, `uLado` y
 * `descargaEnLaJunta`.
 */
export const ABRE_LA_JUNTA_GLSL = /* glsl */ `
		vec2 esquina = sign( position.xz );
		vec2 abre = vec2( descargaEnLaJunta( centro + vec2( 0.5 * esquina.x, 0.4 * esquina.y ) * uLado, uLado, true ), descargaEnLaJunta( centro + vec2( 0.4 * esquina.x, 0.5 * esquina.y ) * uLado, uLado, false ) );
		transformed.xz -= esquina * abre * ${f(D.abre)};`

import * as THREE from 'three'

import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'

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
 * se apaga al pasar el golpe para atrás. Y hace luz de tres maneras (`?filo=`; sin bandera, `corriente`):
 *   corriente · un tramo más ancho y más blanco recorre cada contorno, como una corriente que da la vuelta al logo; se acelera
 *     con cada onda y en el golpe (`velocidadDeLaCorriente`).
 *   pulso · todo el filo late con cada onda y con el golpe, y el latido sale del contorno hacia el piso: un anillo de luz por
 *     las juntas pegadas al logo (`latidoDelFilo`, en la energía del piso: `luzDeAbajo.ts`).
 *   descarga · del filo salen corrientes por las juntas cercanas, hacia afuera, y se pierden en las corrientes del piso
 *     (`descargaDelFilo`, en el dibujo del piso y en el plano de abajo). Sin rayos ni partículas: luz por las juntas.
 * Los uniformes los escribe `cuadroDelFinal.ts`.
 */
export const FILOS_DEL_LOGO = ['corriente', 'pulso', 'descarga'] as const
export type FiloDelLogo = (typeof FILOS_DEL_LOGO)[number]
/** El del producto (sin bandera). */
export const FILO_DEL_PRODUCTO: FiloDelLogo = 'corriente'

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
   * La corriente: su velocidad (u/s) y cuántas veces más con la onda y con el golpe (se apaga en `aceleraS` s); el largo de
   * su tramo (fracción del contorno, con un mínimo y un máximo, u), cuánto lo ensancha y lo suave de su cabeza (u).
   */
  corriente: { velocidad: 3.2, onda: 2.5, golpe: 6, aceleraS: 0.6, largo: 0.2, minimo: 0.6, maximo: 3, crece: 1.5, cabeza: 0.35 },
  /** El latido: cuánto ensancha el filo y en cuánto se apaga (s); su anillo en el piso: velocidad (u/s), ancho y alcance (u), cuánta energía. */
  pulso: { crece: 1, s: 0.45, velocidad: 7, ancho: 0.8, alcance: 4.5, sube: 1.2 },
  /**
   * La descarga: hasta dónde llega (u desde el filo), la velocidad y el largo de cada una (u/s, u), cada cuánto sale una por
   * junta (s), cuántas de cada ciclo salen y su fuerza (como la de las corrientes del piso).
   */
  descarga: { alcance: 5, velocidad: [5, 9], largo: [0.8, 1.8], periodoS: [1.1, 2.6], cuantas: 0.55, fuerza: 1.6 },
} as const

export const FILO_EN_VIVO = {
  /** 0 apagado; 1 encendido (de golpe, en el golpe). */
  uLuzDelFilo: { value: 0 },
  /** Cuánto más ancho está el filo entero (fracción): el destello del golpe y el latido. */
  uCreceDelFilo: { value: 0 },
  /** Dónde va la corriente (u recorridas: la fase, integrada con su velocidad) y si la hay (la variante). */
  uFaseDelFilo: { value: 0 },
  uCorrienteDelFilo: { value: 0 },
  /** El latido en el piso: cuánto hace que nació (s) y su fuerza (0: ninguno). */
  uLatidoDelFilo: { value: new THREE.Vector2(0, 0) },
  /** La descarga (0 a 1: la variante, con el filo encendido y la energía). */
  uDescargaDelFilo: { value: 0 },
}

/** El filo se enciende de golpe en el golpe: entero desde que `fin` lo pasa (en el mismo cuadro que suena), nada antes. */
export function luzDelFilo(fin: number, golpe: number): number {
  return fin >= golpe ? 1 : 0
}

const apagandose = (desde: number, s: number): number => (desde >= 0 && Number.isFinite(desde) ? Math.exp(-desde / s) : 0)

/** La velocidad de la corriente (u/s) a `desdeLaOnda` y `desdeElGolpe` s (infinito si no hubo): se acelera con cada una. */
export function velocidadDeLaCorriente(desdeLaOnda: number, desdeElGolpe: number): number {
  const C = FILO.corriente
  return C.velocidad * (1 + C.onda * apagandose(desdeLaOnda, C.aceleraS) + C.golpe * apagandose(desdeElGolpe, C.aceleraS))
}

/** Cuánto más ancho está el filo entero: el destello del golpe y, en `pulso`, el latido de cada onda (el mayor). */
export function creceDelFilo(variante: FiloDelLogo, desdeElGolpe: number, desdeLaOnda: number): number {
  const golpe = FILO.golpe.crece * apagandose(desdeElGolpe, FILO.golpe.s)
  return variante === 'pulso' ? Math.max(golpe, FILO.pulso.crece * apagandose(Math.min(desdeLaOnda, desdeElGolpe), FILO.pulso.s)) : golpe
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
 * `aFilo`: x, lo recorrido (u, corrido al azar por contorno); y, el largo del contorno (u); z, 0 en el borde de adentro y 1 en
 * el de afuera. El contorno se cierra con su primer punto repetido (con lo recorrido entero: la corriente no salta).
 */
export function bandaDelFilo(contornos: readonly (readonly THREE.Vector2[])[], desde: number, hasta: number): THREE.BufferGeometry {
  const posiciones: number[] = []
  const filo: number[] = []
  const indices: number[] = []
  contornos.forEach((c, k) => {
    const n = c.length
    const tramo = (i: number): THREE.Vector2 => c[(i + 1) % n].clone().sub(c[i % n])
    let largo = 0
    let mas = 0
    c.forEach((_, i) => {
      const t = tramo(i).length()
      largo += t
      if (t > tramo(mas).length()) mas = i
    })
    const t = tramo(mas).normalize()
    const medio = c[mas].clone().add(c[(mas + 1) % n]).multiplyScalar(0.5)
    const lado = enElNegro(contornos, medio.x - t.y * 1e-3, medio.y + t.x * 1e-3) ? -1 : 1
    const normal = (i: number): THREE.Vector2 => {
      const d = tramo(i).normalize()
      return new THREE.Vector2(-d.y * lado, d.x * lado)
    }
    const corrida = largo * ((Math.sin((k + 1) * 12.9898) * 43758.5453) % 1)
    const base = posiciones.length / 3
    let s = 0
    for (let i = 0; i <= n; i += 1) {
      const [n1, n2] = [normal(i - 1 + n), normal(i)]
      const suma = n1.clone().add(n2)
      const m = suma.lengthSq() > 1e-8 ? suma.normalize() : n2
      const k2 = 1 / Math.max(0.5, m.dot(n2))
      const p = c[i % n]
      for (const [d, z] of [[desde, 0], [hasta, 1]] as const) {
        posiciones.push(p.x + m.x * d * k2, p.y + m.y * d * k2, 0)
        filo.push(s + corrida, largo, z)
      }
      if (i < n) {
        const a = base + 2 * i
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
        s += tramo(i).length()
      }
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3))
  g.setAttribute('aFilo', new THREE.Float32BufferAttribute(filo, 3))
  g.setIndex(indices)
  return g
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const C = FILO.corriente
const ANCHO_ENTERO = FILO.ancho * (1 + FILO.crece)

const VERTICE_GLSL = /* glsl */ `
attribute vec3 aFilo;
varying vec3 vFilo;
void main() {
	vFilo = aFilo;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

// El ancho de cada punto: el del filo, más el destello y el latido, más el tramo de la corriente (con su cola y su cabeza
// suave); el borde de afuera, de un píxel. El blanco sube a 1 en el tramo, en el latido y en el destello.
const FRAGMENTO_GLSL = /* glsl */ `
uniform float uLuzDelFilo;
uniform float uCreceDelFilo;
uniform float uFaseDelFilo;
uniform float uCorrienteDelFilo;
varying vec3 vFilo;
void main() {
	if ( uLuzDelFilo <= 0.0 ) discard;
	float tramo = 0.0;
	if ( uCorrienteDelFilo > 0.0 ) {
		float largo = clamp( ${f(C.largo)} * vFilo.y, ${f(C.minimo)}, ${f(C.maximo)} );
		float detras = mod( uFaseDelFilo - vFilo.x, vFilo.y );
		if ( detras > 0.5 * vFilo.y ) detras -= vFilo.y;
		float cola = detras >= 0.0 ? pow( max( 0.0, 1.0 - detras / largo ), 2.0 ) : smoothstep( - ${f(C.cabeza)}, 0.0, detras );
		tramo = uCorrienteDelFilo * cola;
	}
	float x = vFilo.z * ${f(ANCHO_ENTERO)};
	float ancho = min( ${f(ANCHO_ENTERO)}, ${f(FILO.ancho)} * ( 1.0 + uCreceDelFilo + ${f(C.crece)} * tramo ) );
	float aa = max( fwidth( x ) * 0.75, 1e-4 );
	float cubre = 1.0 - smoothstep( ancho - aa, ancho + aa, x );
	if ( cubre <= 0.0 ) discard;
	float blanco = mix( ${f(FILO.blanco)}, 1.0, clamp( max( tramo, uCreceDelFilo ), 0.0, 1.0 ) );
	gl_FragColor = vec4( vec3( blanco ), cubre * min( uLuzDelFilo, 1.0 ) );
}
`

/** El filo armado: su malla (en el grupo del final, con la matriz del logo), lo que lleva recorrido la corriente y cómo soltarlo. */
export interface FiloArmado {
  readonly malla: THREE.Mesh
  fase: number
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
    fase: 0,
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

const L = FILO.pulso
const D = FILO.descarga

/**
 * [pulso, descarga] Cómo se ven en las juntas del piso: por donde pasan, la luz de la junta se derrama sobre la tapa (u: la junta
 * se ve más gruesa; las de B0 llegan a 0,04), el latido más ancho (un anillo) que la descarga (un trazo), con un tope de fuerza.
 * Lo usa `conLasJuntas` (`enElPiso.ts`).
 */
export const DERRAME_DEL_FILO = { latido: 0.3, descarga: 0.12, tope: 1.5 } as const

/** [pulso] El anillo del latido en el piso, a la distancia `r` del filo (u): sale del contorno y se pierde en `alcance`. */
export const LATIDO_DEL_FILO_GLSL = /* glsl */ `
uniform vec2 uLatidoDelFilo;
float latidoDelFilo( float r ) {
	if ( uLatidoDelFilo.y <= 0.0 ) return 0.0;
	float d = ( r - uLatidoDelFilo.x * ${f(L.velocidad)} ) / ${f(L.ancho)};
	return uLatidoDelFilo.y * exp( - d * d ) * ( 1.0 - smoothstep( ${f(0.4 * L.alcance)}, ${f(L.alcance)}, r ) );
}
`

/**
 * [descarga] Las corrientes que salen del filo por las juntas: cada media junta (de un lado y del otro del logo) larga una
 * en algunos de sus ciclos, que corre hacia afuera (en la distancia al logo) con su velocidad y su largo, y se apaga al
 * llegar a `alcance`, donde siguen las del piso. Pide `distanciaAlLogo` (`hueco.ts`), `azarDeLaLuz` y `uRelojDeLaLuz`.
 */
export const DESCARGA_DEL_FILO_GLSL = /* glsl */ `
uniform float uDescargaDelFilo;
float descargaDelFilo( vec2 xz, float lado ) {
	if ( uDescargaDelFilo <= 0.0 ) return 0.0;
	float r = distanciaAlLogo( xz );
	if ( r > ${f(D.alcance)} ) return 0.0;
	vec2 g = xz / lado;
	vec2 cerca = abs( g - floor( g + 0.5 ) );
	bool vertical = cerca.x < cerca.y;
	float enLaJunta = 1.0 - smoothstep( 0.08, 0.2, min( cerca.x, cerca.y ) );
	vec2 semilla = vertical ? vec2( floor( g.x + 0.5 ), sign( xz.y ) ) : vec2( floor( g.y + 0.5 ) + 211.0, sign( xz.x ) );
	float periodo = ${f(D.periodoS[0])} + ${f(D.periodoS[1] - D.periodoS[0])} * azarDeLaLuz( semilla + 0.21 );
	float ciclo = uRelojDeLaLuz / periodo + azarDeLaLuz( semilla + 0.67 );
	float n = floor( ciclo );
	vec2 sn = semilla + n * vec2( 1.37, 2.71 );
	if ( azarDeLaLuz( sn + 0.13 ) > ${f(D.cuantas)} ) return 0.0;
	float tau = ( ciclo - n ) * periodo;
	float cabeza = tau * ( ${f(D.velocidad[0])} + ${f(D.velocidad[1] - D.velocidad[0])} * azarDeLaLuz( sn + 0.41 ) );
	float largo = ${f(D.largo[0])} + ${f(D.largo[1] - D.largo[0])} * azarDeLaLuz( sn + 0.83 );
	float detras = cabeza - r;
	if ( detras < 0.0 || detras > largo ) return 0.0;
	float cola = 1.0 - detras / largo;
	return ${f(D.fuerza)} * uDescargaDelFilo * enLaJunta * cola * cola * ( 1.0 - smoothstep( ${f(0.6 * D.alcance)}, ${f(D.alcance)}, r ) );
}
`

import * as THREE from 'three'

import { CAMINO } from '../arcos/camino'
import type { Brasas } from '../brasas'
import { REPOSO, type Red } from '../reposo'
import { CANAL_DEL_ARCO, FRAGMENTOS_DEL_HALO_DEL_ARCO, FRAGMENTOS_DE_LOS_ARCOS, HALO_DEL_CANAL, TRAZO_GLSL, uniformesDelTrazo, type NombreDelTrazo } from './arcos'
import { COMUN, materialDeEnergia } from './comun'

/**
 * [PULIDO 19] Q1.d · EL DIBUJO DE LA RED EN REPOSO (`reposo.ts`: la máquina; `docs/rediseno/PLASMA.md`). De día tinta translúcida, de noche
 * luz; detrás de un texto se apaga (la máscara por píxel) y en el final del pie, cerca del logo. Siempre al menos un lugar dibujado (nulo):
 * el programa se arma al cargar, no con la primera red.
 *
 * [PULIDO 20] R3 · RAYOS CONGELADOS (el humano: «en vez de una línea recta, que sea un rayo congelado en el aire: literalmente los rayos
 * que hacen entre sí, pero conectados»). Cada enlace es un ARCO como los del plasma (`arcos/camino.ts`: el canal quebrado del punto medio,
 * cada nivel la mitad de largo y menos desviado por la aspereza, un poco en profundidad, con una rama corta que sale de su tramo del medio
 * con su ángulo), generado de la SEMILLA del enlace (la forma nace al formarse y no cambia mientras dura: congelado en el aire, en la base
 * del mundo, no de la cámara) y con un titileo leve. Barato: la geometría es ESTÁTICA (un búfer armado una vez: por enlace, sus tramos
 * como cuadriláteros de pantalla; cada vértice sabe su enlace, su punto, su punta del tramo, su lado y si es de la rama) y lo que cambia
 * viaja en una textura chica (por enlace: sus dos extremos, su alfa, su semilla y cuánto se cortó): el sombreador arma el camino. Al
 * cortarse, el arco se abre desde el medio (se desconecta) con el destello de siempre.
 *
 * [PULIDO 21] S1 · EL RAYO DE VERDAD: el mismo dibujo que los arcos del plasma (`dibujo/arcos.ts`: el canal con su núcleo, su halo de
 * puntos y su resplandor, el mismo trazo), quieto como la captura de un rayo, y cada uno tiembla leve (sus puntos) y titila a su ritmo.
 */
export const DIBUJO_DE_LA_RED = {
  /** El golpe (el núcleo y el halo) y el resplandor del rayo quieto, el titileo (cuánto baja) y el temblor (parte de su largo). */
  uRed: [1, 0.5, 0.3, 0.012],
  /** Los tramos del camino y los de la rama; la rama, más fina (parte del ancho). */
  tramos: 8,
  tramosDeRama: 4,
  rama: 0.6,
} as const

const TRAMOS = DIBUJO_DE_LA_RED.tramos + DIBUJO_DE_LA_RED.tramosDeRama
/** Lo que se escribe de cada enlace en la textura: los extremos con el alfa, el otro extremo con la semilla, el corte. */
const FILAS = 3

export interface DibujoDeLaRed {
  readonly geometria: THREE.BufferGeometry
  readonly enlaces: THREE.DataTexture
  readonly datos: Float32Array
  readonly maximo: number
  readonly malla: THREE.Mesh
  /** [PULIDO 21] S1 · el halo (la pasada 0 de los arcos): los mismos atributos, como puntos (sin índices). */
  readonly halo: THREE.Points
  readonly geometriaDelHalo: THREE.BufferGeometry
  readonly uniformes: { readonly uRed: { value: THREE.Vector4 } }
  /** Si el último relleno escribió algo (al quedar vacía, uno más para apagar). */
  escrita: boolean
}

const ARMA_LA_RED = /* glsl */ `
attribute vec2 aDato;
uniform sampler2D uEnlaces;
uniform vec2 uTamEnlaces;
uniform vec4 uRed;
uniform vec4 uCamino;
uniform vec4 uRama;
float azarDe( float s, float k ) {
	return fract( sin( s * 127.1 + k * 311.7 ) * 43758.5453 );
}
// El desvío en «t» (0 a 1): niveles de ruido de valor, cada uno de la mitad de largo y menos desviado (la aspereza); de costado y en
// profundidad. Con la semilla del enlace: siempre el mismo (congelado).
vec2 desvioDe( float s, float t ) {
	vec2 d = vec2( 0.0 );
	float amplitud = 1.0;
	for ( int n = 0; n < 4; n ++ ) {
		float x = t * exp2( float( n ) + 1.0 );
		float i = floor( x );
		float u = x - i;
		u = u * u * ( 3.0 - 2.0 * u );
		float o = 17.0 * float( n );
		vec2 a = vec2( azarDe( s, i + o ), azarDe( s + 3.1, i + o ) ) * 2.0 - 1.0;
		vec2 b = vec2( azarDe( s, i + 1.0 + o ), azarDe( s + 3.1, i + 1.0 + o ) ) * 2.0 - 1.0;
		d += mix( a, b, u ) * amplitud;
		amplitud *= uCamino.y;
	}
	return d;
}
// El punto «j» del camino (de A a B, las puntas fijas) o de la rama (sale de su punto del camino, la punta libre), en el mundo.
vec3 puntoDe( vec3 A, vec3 B, float s, float rama, float j ) {
	vec3 eje = B - A;
	float largo = max( length( eje ), 1e-4 );
	vec3 e = eje / largo;
	vec3 p1 = cross( e, vec3( 0.0, 1.0, 0.0 ) );
	p1 = dot( p1, p1 ) < 1e-4 ? cross( e, vec3( 1.0, 0.0, 0.0 ) ) : p1;
	p1 = normalize( p1 );
	vec3 p2 = cross( e, p1 );
	// El camino (o, en la rama, el punto del medio del camino de donde sale: con su ángulo, su largo y su desvío, libre en la punta).
	float desde = floor( 2.0 + azarDe( s, 91.0 ) * ${(DIBUJO_DE_LA_RED.tramos - 4).toFixed(1)} );
	float t = rama < 0.5 ? j / ${DIBUJO_DE_LA_RED.tramos.toFixed(1)} : desde / ${DIBUJO_DE_LA_RED.tramos.toFixed(1)};
	vec2 d = desvioDe( s, t ) * sin( 3.14159265 * t ) * uCamino.x * largo;
	vec3 p = A + eje * t + p1 * d.x + p2 * d.y * uCamino.z;
	if ( rama >= 0.5 ) {
		float angulo = mix( uRama.z, uRama.w, azarDe( s, 92.0 ) ) * ( azarDe( s, 93.0 ) < 0.5 ? - 1.0 : 1.0 );
		vec3 dir = normalize( e * cos( angulo ) + p1 * sin( angulo ) + p2 * ( azarDe( s, 95.0 ) - 0.5 ) * 0.4 );
		float lr = largo * mix( uRama.x, uRama.y, azarDe( s, 94.0 ) );
		float u = j / ${DIBUJO_DE_LA_RED.tramosDeRama.toFixed(1)};
		vec2 dr = desvioDe( s + 7.7, u ) * sin( 1.5707963 * u ) * uCamino.x * lr;
		p += dir * lr * u + p1 * dr.x + p2 * dr.y * uCamino.z;
	}
	return p;
}
vec4 enlace( float k, float fila ) {
	return texture2D( uEnlaces, vec2( ( k + 0.5 ) / uTamEnlaces.x, ( fila + 0.5 ) / uTamEnlaces.y ) );
}
// El temblor de la carga inestable: cada punto a su ritmo (de la semilla), leve y nada en las puntas (siguen en sus brasas).
vec3 tiembla( float s, float k ) {
	float w = 19.0 + 14.0 * azarDe( s, 60.0 + k );
	return vec3( sin( uTiempo * w + k * 1.7 + s * 40.0 ), sin( uTiempo * w * 1.31 + k * 2.3 + s * 13.0 ), sin( uTiempo * w * 0.77 + k * 0.9 + s * 7.0 ) );
}
vec3 puntoQueTiembla( vec3 A, vec3 B, float s, float rama, float j ) {
	float n = rama < 0.5 ? ${DIBUJO_DE_LA_RED.tramos.toFixed(1)} : ${DIBUJO_DE_LA_RED.tramosDeRama.toFixed(1)};
	float i = clamp( j, 0.0, n );
	float desde = floor( 2.0 + azarDe( s, 91.0 ) * ${(DIBUJO_DE_LA_RED.tramos - 4).toFixed(1)} );
	float k = rama < 0.5 ? i : desde;
	vec3 d = tiembla( s, k ) * sin( 3.14159265 * k / ${DIBUJO_DE_LA_RED.tramos.toFixed(1)} );
	d += rama < 0.5 ? vec3( 0.0 ) : tiembla( s + 5.3, i ) * i / n;
	return puntoDe( A, B, s, rama, i ) + d * uRed.w * length( B - A );
}
// Lo de cada vértice: su punto, el de antes y el de después (los de su tira, como la cinta de los arcos) y la forma del canal: el golpe y
// el resplandor del rayo quieto por su alfa y el titileo, el destello del corte, abierto desde el medio y bajo cerca del final.
struct Rayo { vec3 punto; vec3 antes; vec3 despues; vec4 forma; vec4 extra; float nulo; };
Rayo rayoDelVertice() {
	Rayo r;
	vec4 a = enlace( aDato.x, 0.0 );
	vec4 b = enlace( aDato.x, 1.0 );
	vec4 c = enlace( aDato.x, 2.0 );
	float rama = position.z;
	float n = rama < 0.5 ? ${DIBUJO_DE_LA_RED.tramos.toFixed(1)} : ${DIBUJO_DE_LA_RED.tramosDeRama.toFixed(1)};
	vec3 pA = puntoQueTiembla( a.xyz, b.xyz, b.w, rama, aDato.y );
	vec3 pB = puntoQueTiembla( a.xyz, b.xyz, b.w, rama, aDato.y + 1.0 );
	float fin = step( 0.5, position.y );
	vec3 pX = puntoQueTiembla( a.xyz, b.xyz, b.w, rama, fin > 0.5 ? aDato.y + 2.0 : aDato.y - 1.0 );
	r.punto = mix( pA, pB, fin );
	r.antes = mix( pX, pA, fin );
	r.despues = mix( pB, pX, fin );
	float t = ( aDato.y + position.y ) / n;
	float vT = rama < 0.5 ? t : floor( 2.0 + azarDe( b.w, 91.0 ) * ${(DIBUJO_DE_LA_RED.tramos - 4).toFixed(1)} ) / ${DIBUJO_DE_LA_RED.tramos.toFixed(1)};
	float abierto = c.x <= 0.0 ? 1.0 : smoothstep( c.x - 0.06, c.x + 0.02, abs( vT - 0.5 ) * 2.0 );
	float titila = 1.0 - uRed.z * ( 0.5 + 0.5 * sin( uTiempo * ( 4.0 + b.w * 5.0 ) + b.w * 40.0 ) );
	float destello = max( a.w - 1.0, 0.0 );
	float k = ( min( a.w, 1.0 ) * titila + destello * 1.5 ) * abierto * enElFinal( r.punto - uCentro );
	r.forma = vec4( position.x, rama < 0.5 ? 1.0 : ${DIBUJO_DE_LA_RED.rama.toFixed(2)}, uRed.x * k, uRed.y * k );
	r.extra = vec4( t, b.w * 40.0, rama, 0.0 );
	r.nulo = a.w <= 0.001 ? 1.0 : 0.0;
	return r;
}
`

/** El núcleo (la pasada 1 de los arcos): cada tramo, un cuadrilátero de la tira del canal (los vecinos dan el inglete). */
export const VERTICES_DE_LA_RED = /* glsl */ `
${COMUN}
${TRAZO_GLSL}
${ARMA_LA_RED}
${CANAL_DEL_ARCO}
void main() {
	Rayo r = rayoDelVertice();
	if ( r.nulo > 0.5 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	canalDelArco( r.punto, r.antes, r.despues, r.forma, r.extra );
}
`

/** El halo (la pasada 0): un punto por punto del camino y uno en el medio de cada tramo (la punta de cada tramo, sólo en el último). */
export const VERTICES_DEL_HALO_DE_LA_RED = /* glsl */ `
${COMUN}
${TRAZO_GLSL}
${ARMA_LA_RED}
${HALO_DEL_CANAL}
void main() {
	Rayo r = rayoDelVertice();
	float n = position.z < 0.5 ? ${DIBUJO_DE_LA_RED.tramos.toFixed(1)} : ${DIBUJO_DE_LA_RED.tramosDeRama.toFixed(1)};
	if ( r.nulo > 0.5 || ( position.y > 0.5 && aDato.y < n - 1.0 ) ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		gl_PointSize = 0.0;
		return;
	}
	haloDelArco( r.punto, r.despues, r.forma, r.extra );
}
`

/** Los fragmentos, los de los arcos (el mismo canal), con la máscara de los textos también por píxel (los enlaces son largos). */
export const FRAGMENTOS_DE_LA_RED = `#define TEXTO_POR_PIXEL\n${FRAGMENTOS_DE_LOS_ARCOS}`
export const FRAGMENTOS_DEL_HALO_DE_LA_RED = `#define TEXTO_POR_PIXEL\n${FRAGMENTOS_DEL_HALO_DEL_ARCO}`

/** Arma la malla de la red para `maximo` enlaces: la geometría estática (los tramos de cada uno) y la textura de los enlaces. */
export function armarLaRed(maximo: number, comunes: Record<string, THREE.IUniform>, trazo: Record<NombreDelTrazo, THREE.IUniform> = uniformesDelTrazo()): DibujoDeLaRed {
  const v = maximo * TRAMOS * 4
  // `position`: el lado (−1, 1), la punta del tramo (0 su punto, 1 el siguiente) y si es de la rama; `aDato`: el enlace y su punto.
  const lado = new Float32Array(v * 3)
  const dato = new Float32Array(v * 2)
  const indices = new Uint32Array(maximo * TRAMOS * 6)
  for (let k = 0; k < maximo; k += 1) {
    for (let t = 0; t < TRAMOS; t += 1) {
      const rama = t >= DIBUJO_DE_LA_RED.tramos ? 1 : 0
      const j = rama === 1 ? t - DIBUJO_DE_LA_RED.tramos : t
      const v0 = (k * TRAMOS + t) * 4
      for (let q = 0; q < 4; q += 1) {
        lado[(v0 + q) * 3] = q % 2 === 0 ? -1 : 1
        lado[(v0 + q) * 3 + 1] = q < 2 ? 0 : 1
        lado[(v0 + q) * 3 + 2] = rama
        dato[(v0 + q) * 2] = k
        dato[(v0 + q) * 2 + 1] = j
      }
      const i0 = (k * TRAMOS + t) * 6
      indices.set([v0, v0 + 1, v0 + 2, v0 + 2, v0 + 1, v0 + 3], i0)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(lado, 3))
  g.setAttribute('aDato', new THREE.BufferAttribute(dato, 2))
  g.setIndex(new THREE.BufferAttribute(indices, 1))
  g.setDrawRange(0, TRAMOS * 6)
  const datos = new Float32Array(maximo * FILAS * 4)
  const enlaces = new THREE.DataTexture(datos, maximo, FILAS, THREE.RGBAFormat, THREE.FloatType)
  enlaces.minFilter = THREE.NearestFilter
  enlaces.magFilter = THREE.NearestFilter
  enlaces.needsUpdate = true
  const uniformes = { uRed: { value: new THREE.Vector4(DIBUJO_DE_LA_RED.uRed[0], DIBUJO_DE_LA_RED.uRed[1], DIBUJO_DE_LA_RED.uRed[2], DIBUJO_DE_LA_RED.uRed[3]) } }
  const propias = {
    ...uniformes,
    uEnlaces: { value: enlaces },
    uTamEnlaces: { value: new THREE.Vector2(maximo, FILAS) },
    uCamino: { value: new THREE.Vector4(CAMINO.desvio, CAMINO.aspereza, CAMINO.profundidad, 0) },
    uRama: { value: new THREE.Vector4(CAMINO.ramas.largo[0], CAMINO.ramas.largo[1], CAMINO.ramas.angulo[0], CAMINO.ramas.angulo[1]) },
  }
  const malla = new THREE.Mesh(g, materialDeEnergia(VERTICES_DE_LA_RED, FRAGMENTOS_DE_LA_RED, { ...comunes, ...trazo, ...propias, uCapa: { value: 1 } }))
  malla.name = 'red en reposo'
  malla.frustumCulled = false
  const gh = new THREE.BufferGeometry()
  for (const nombre of ['position', 'aDato']) gh.setAttribute(nombre, g.getAttribute(nombre))
  gh.setDrawRange(0, TRAMOS * 4)
  const halo = new THREE.Points(gh, materialDeEnergia(VERTICES_DEL_HALO_DE_LA_RED, FRAGMENTOS_DEL_HALO_DE_LA_RED, { ...comunes, ...trazo, ...propias }))
  halo.name = 'halo de la red en reposo'
  halo.frustumCulled = false
  return { geometria: g, geometriaDelHalo: gh, enlaces, datos, maximo, malla, halo, uniformes, escrita: true }
}

/**
 * Escribe los enlaces en la textura (los extremos siguen a sus brasas; el alfa, por la vida de las dos; la semilla; el corte, de 0 a 1
 * desde que muere) y el rango. Sin reservas; vacía, una escritura más (para apagar el último) y después nada.
 */
export function rellenarRed(r: Red, b: Brasas, dib: DibujoDeLaRed): void {
  const D = dib.datos
  const L = b.lugar
  const W = dib.maximo * 4
  const n = Math.min(r.n, dib.maximo)
  for (let k = 0; k < n; k += 1) {
    const i = r.a[k]
    const j = r.b[k]
    const o = k * 4
    D[o] = L[i * 3]
    D[o + 1] = L[i * 3 + 1]
    D[o + 2] = L[i * 3 + 2]
    D[o + 3] = r.alfa[k] * Math.min(b.vida[i], b.vida[j])
    D[W + o] = L[j * 3]
    D[W + o + 1] = L[j * 3 + 1]
    D[W + o + 2] = L[j * 3 + 2]
    D[W + o + 3] = r.semilla[k]
    D[2 * W + o] = r.fase === 'cortando' ? Math.min(1, Math.max(0, (r.faseS - r.muere[k]) / REPOSO.destelloS)) : 0
  }
  // Vacía, el primer lugar queda nulo (alfa 0: no pinta) y sigue siendo el que arma el programa.
  if (n === 0) D[3] = 0
  dib.geometria.setDrawRange(0, Math.max(1, n) * TRAMOS * 6)
  dib.geometriaDelHalo.setDrawRange(0, Math.max(1, n) * TRAMOS * 4)
  if (n > 0 || dib.escrita) dib.enlaces.needsUpdate = true
  dib.escrita = n > 0
}

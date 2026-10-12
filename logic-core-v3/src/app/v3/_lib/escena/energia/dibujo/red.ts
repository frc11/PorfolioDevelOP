import * as THREE from 'three'

import type { Brasas } from '../brasas'
import type { Red } from '../reposo'
import { AL_TONO, COMUN, SALIDA, materialDeEnergia } from './comun'

/**
 * [PULIDO 19] Q1.d · EL DIBUJO DE LA RED EN REPOSO (`reposo.ts`: la máquina; `docs/rediseno/PLASMA.md`): UN SOLO BÚFER de
 * cuadriláteros de pantalla, cuatro vértices y dos triángulos por enlace, que el sombreador abre a los dos lados del segmento con el
 * ancho en px del dispositivo (un rayo fino se ve fino lejos y cerca). Cada vértice lleva los dos extremos (siguen a sus brasas), de
 * qué lado y de qué punta está, el alfa del enlace (por encima de 1, el destello del corte) y su semilla (el titileo leve, dos ritmos).
 * De día tinta translúcida, de noche luz; detrás de un texto se apaga (la máscara por píxel) y en el final del pie, cerca del logo.
 * Los lugares sin enlace no se dibujan (el rango), pero siempre al menos uno nulo: el programa se arma al cargar, no con la primera red.
 */
export const DIBUJO_DE_LA_RED = {
  /** El medio ancho del rayo (px de CSS), la luz de noche, cuánto tapa de día y el titileo (cuánto baja). */
  uRed: [0.45, 0.34, 0.42, 0.12],
} as const

export interface DibujoDeLaRed {
  readonly geometria: THREE.BufferGeometry
  readonly A: THREE.BufferAttribute
  readonly B: THREE.BufferAttribute
  readonly estado: THREE.BufferAttribute
  readonly malla: THREE.Mesh
  readonly uniformes: { readonly uRed: { value: THREE.Vector4 } }
}

export const VERTICES_DE_LA_RED = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec2 aLado;
attribute vec2 aEstado;
varying float vLado;
varying float vAlfa;
varying float vSemilla;
varying float vFinal;
${COMUN}
uniform vec4 uRed;
void main() {
	vec4 cA = projectionMatrix * viewMatrix * vec4( aA, 1.0 );
	vec4 cB = projectionMatrix * viewMatrix * vec4( aB, 1.0 );
	if ( aEstado.x <= 0.001 || cA.w <= 0.05 || cB.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	vec2 medio = uResolucion * 0.5;
	vec2 sA = cA.xy / cA.w * medio;
	vec2 sB = cB.xy / cB.w * medio;
	vec2 dir = sB - sA;
	float largo = max( length( dir ), 1e-3 );
	vec2 normal = vec2( - dir.y, dir.x ) / largo;
	// El medio ancho en px del dispositivo, más un píxel de borde blando.
	float nucleo = max( uRed.x * uPixel, 0.5 );
	float ancho = nucleo + 1.0;
	vec4 c = aLado.y < 0.5 ? cA : cB;
	vec2 s = ( aLado.y < 0.5 ? sA : sB ) + normal * aLado.x * ancho;
	gl_Position = vec4( s / medio * c.w, c.z, c.w );
	vLado = aLado.x * ancho / nucleo;
	vAlfa = aEstado.x;
	vSemilla = aEstado.y;
	vFinal = enElFinal( ( aLado.y < 0.5 ? aA : aB ) - uCentro );
}
`

export const FRAGMENTOS_DE_LA_RED = /* glsl */ `
varying float vLado;
varying float vAlfa;
varying float vSemilla;
varying float vFinal;
${COMUN}
${AL_TONO}
uniform vec4 uRed;
void main() {
	float perfil = exp( - vLado * vLado * 1.8 );
	// El titileo leve (su ritmo y su fase propios) y el destello del corte (el alfa por encima de 1).
	float titila = 1.0 - uRed.w * ( 0.5 + 0.5 * sin( uTiempo * ( 4.0 + vSemilla * 5.0 ) + vSemilla * 40.0 ) );
	float destello = max( vAlfa - 1.0, 0.0 );
	float k = perfil * ( min( vAlfa, 1.0 ) * titila + destello * 1.5 );
	float texto = adentroDelTexto( gl_FragCoord.xy / uResolucion * 2.0 - 1.0 );
	float vis = ( 1.0 - uTextoFuerza * texto ) * ( 1.0 - uApagado ) * vFinal;
	vec3 colorDia = mix( uTintaDia, uClaroDia, min( destello, 1.0 ) );
	float aDia = k * uRed.z;
	vec3 luzNoche = uLuzNoche * k * uRed.y;
	${SALIDA}
}
`

/** Arma la malla de la red para `maximo` enlaces (los búferes fijos; el rango empieza en un enlace nulo). */
export function armarLaRed(maximo: number, comunes: Record<string, THREE.IUniform>): DibujoDeLaRed {
  const v = maximo * 4
  const lado = new Float32Array(v * 2)
  const indices = new Uint32Array(maximo * 6)
  for (let k = 0; k < maximo; k += 1) {
    for (let q = 0; q < 4; q += 1) {
      lado[(k * 4 + q) * 2] = q % 2 === 0 ? -1 : 1
      lado[(k * 4 + q) * 2 + 1] = q < 2 ? 0 : 1
    }
    const v0 = k * 4
    indices[k * 6] = v0
    indices[k * 6 + 1] = v0 + 1
    indices[k * 6 + 2] = v0 + 2
    indices[k * 6 + 3] = v0 + 2
    indices[k * 6 + 4] = v0 + 1
    indices[k * 6 + 5] = v0 + 3
  }
  const g = new THREE.BufferGeometry()
  const A = new THREE.BufferAttribute(new Float32Array(v * 3), 3).setUsage(THREE.DynamicDrawUsage)
  const B = new THREE.BufferAttribute(new Float32Array(v * 3), 3).setUsage(THREE.DynamicDrawUsage)
  const estado = new THREE.BufferAttribute(new Float32Array(v * 2), 2).setUsage(THREE.DynamicDrawUsage)
  g.setAttribute('position', A)
  g.setAttribute('aA', A)
  g.setAttribute('aB', B)
  g.setAttribute('aLado', new THREE.BufferAttribute(lado, 2))
  g.setAttribute('aEstado', estado)
  g.setIndex(new THREE.BufferAttribute(indices, 1))
  g.setDrawRange(0, 6)
  const uniformes = { uRed: { value: new THREE.Vector4(DIBUJO_DE_LA_RED.uRed[0], DIBUJO_DE_LA_RED.uRed[1], DIBUJO_DE_LA_RED.uRed[2], DIBUJO_DE_LA_RED.uRed[3]) } }
  const malla = new THREE.Mesh(g, materialDeEnergia(VERTICES_DE_LA_RED, FRAGMENTOS_DE_LA_RED, { ...comunes, ...uniformes }))
  malla.name = 'red en reposo'
  return { geometria: g, A, B, estado, malla, uniformes }
}

/** Escribe los enlaces en los búferes (los extremos siguen a sus brasas; el alfa, por la vida de las dos) y el rango. Sin reservas. */
export function rellenarRed(r: Red, b: Brasas, dib: DibujoDeLaRed): void {
  const A = dib.A.array as Float32Array
  const B = dib.B.array as Float32Array
  const E = dib.estado.array as Float32Array
  const L = b.lugar
  for (let k = 0; k < r.n; k += 1) {
    const i = r.a[k]
    const j = r.b[k]
    const alfa = r.alfa[k] * Math.min(b.vida[i], b.vida[j])
    for (let q = 0; q < 4; q += 1) {
      const o = (k * 4 + q) * 3
      A[o] = L[i * 3]
      A[o + 1] = L[i * 3 + 1]
      A[o + 2] = L[i * 3 + 2]
      B[o] = L[j * 3]
      B[o + 1] = L[j * 3 + 1]
      B[o + 2] = L[j * 3 + 2]
      E[(k * 4 + q) * 2] = alfa
      E[(k * 4 + q) * 2 + 1] = r.semilla[k]
    }
  }
  // Al soltarse, el primer lugar queda nulo (alfa 0: no pinta) y sigue siendo el que arma el programa.
  if (r.n === 0) E[0] = 0
  dib.geometria.setDrawRange(0, Math.max(6, r.n * 6))
  if (r.n > 0 || E[1] !== 0) {
    dib.A.needsUpdate = true
    dib.B.needsUpdate = true
    dib.estado.needsUpdate = true
  }
}

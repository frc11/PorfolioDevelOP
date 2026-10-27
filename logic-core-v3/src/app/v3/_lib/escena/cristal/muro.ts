import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { CRISTAL, azarDelCristal } from './cristal'
import { GRIETAS } from './grietas'

/**
 * [PULIDO 23] U1 · EL MURO DE CRISTAL: UN VITRAL ROTO (el humano lo dibujó: un parabrisas astillado). Una sola malla continua que envuelve
 * la escena (los 360°, del piso hasta arriba de la trama), en un cilindro adentro de la trama y de la fábrica de logos, partida en celdas
 * de Voronoi IRREGULARES que comparten sus bordes (cero huecos: cada borde es el mismo segmento en las dos celdas). Las celdas se arman en
 * el cilindro desenrollado (periódico en el ancho: las semillas se copian a los dos lados) recortando un rectángulo por la mediatriz con
 * cada vecina; cada una, un abanico desde su centro. Cada celda tiene su normal apenas inclinada (desfasa la refracción entre celdas) y
 * cada vértice sabe cuánto es centro (`aInterior`: 1 el centro, 0 el borde): el sombreador traza ahí la línea de quiebre. Mira hacia
 * adentro (una sola cara). Puro salvo la geometría de three.
 */
export interface Celda {
  /** Su polígono en el cilindro desenrollado (pares u, v: u a lo largo del perímetro, v desde el piso), en orden. */
  readonly poligono: readonly number[]
  /** Su inclinación: alrededor de la vertical y de la tangente (rad). */
  readonly giro: readonly [number, number]
  /** [PULIDO 24] V1 · su hondura: a cuántas veces de `vidrio.fondo` lee el fondo (unas más hundidas que otras: lo de atrás se desfasa). */
  readonly hondura: number
  /** [PULIDO 26] X4 · cuánto se esmerila (0: limpia) y el giro de sus tomas (rad). */
  readonly esmerilado: readonly [number, number]
}

type P = [number, number]

/** El ancho del cilindro desenrollado (u) y su alto (u). */
export function medidasDelMuro(): { readonly ancho: number; readonly alto: number } {
  return { ancho: 2 * Math.PI * CRISTAL.muro.radio, alto: CRISTAL.muro.alto }
}

/** Recorta el polígono `p` al semiplano de los puntos más cerca de `a` que de `b` (Sutherland–Hodgman). */
function recortar(p: P[], a: P, b: P): P[] {
  const nx = b[0] - a[0]
  const ny = b[1] - a[1]
  const c = (b[0] * b[0] + b[1] * b[1] - a[0] * a[0] - a[1] * a[1]) / 2
  const dentro = (q: P): number => c - (nx * q[0] + ny * q[1])
  const salida: P[] = []
  for (let k = 0; k < p.length; k += 1) {
    const q = p[k]
    const r = p[(k + 1) % p.length]
    const dq = dentro(q)
    const dr = dentro(r)
    if (dq >= 0) salida.push(q)
    if (dq >= 0 !== dr >= 0) {
      const t = dq / (dq - dr)
      salida.push([q[0] + (r[0] - q[0]) * t, q[1] + (r[1] - q[1]) * t])
    }
  }
  return salida
}

/** Las celdas del muro (siempre las mismas: la semilla), del Voronoi periódico de una grilla desordenada. */
export function celdasDelMuro(): Celda[] {
  const M = CRISTAL.muro
  const { ancho, alto } = medidasDelMuro()
  const azar = azarDelCristal(M.semilla)
  // [PULIDO 26] X4 · el esmerilado con su propio azar: las celdas, sus inclinaciones y sus honduras quedan las de antes.
  const azarDelEsmerilado = azarDelCristal(M.semilla + 7)
  const E = CRISTAL.esmerilado
  const cw = ancho / M.columnas
  const ch = alto / M.filas
  const semillas: P[] = []
  for (let f = 0; f < M.filas; f += 1) {
    for (let c = 0; c < M.columnas; c += 1) {
      const u = (c + 0.5 + (f % 2) * 0.5 + (azar() - 0.5) * M.desorden) * cw
      const v = Math.min(alto - 0.05 * ch, Math.max(0.05 * ch, (f + 0.5 + (azar() - 0.5) * M.desorden) * ch))
      semillas.push([((u % ancho) + ancho) % ancho, v])
    }
  }
  const alcance = 3 * Math.max(cw, ch)
  const inclina = THREE.MathUtils.degToRad(M.inclinacionGrados)
  return semillas.map((s) => {
    let p: P[] = [[s[0] - alcance, 0], [s[0] + alcance, 0], [s[0] + alcance, alto], [s[0] - alcance, alto]]
    for (const o of semillas) {
      for (const corre of [-ancho, 0, ancho]) {
        const b: P = [o[0] + corre, o[1]]
        if ((b[0] === s[0] && b[1] === s[1]) || Math.abs(b[0] - s[0]) > alcance || Math.abs(b[1] - s[1]) > alcance) continue
        p = recortar(p, s, b)
      }
    }
    const esmerilada = azarDelEsmerilado() < E.parte
    const cuanto = E.cuanto[0] + azarDelEsmerilado() * (E.cuanto[1] - E.cuanto[0])
    return { poligono: p.flat(), giro: [(azar() - 0.5) * 2 * inclina, (azar() - 0.5) * 2 * inclina], hondura: M.hondura[0] + azar() * (M.hondura[1] - M.hondura[0]), esmerilado: [esmerilada ? cuanto : 0, azarDelEsmerilado() * 2 * Math.PI] }
  })
}

const N = new THREE.Vector3()
const T = new THREE.Vector3()
const Q = new THREE.Quaternion()
const EJE_Y = new THREE.Vector3(0, 1, 0)
const AB = new THREE.Vector3()
const PIE = new THREE.Vector3()

/** Un punto del cilindro desenrollado (u, v) en el mundo. */
function enElMundo(u: number, v: number, destino: THREE.Vector3): THREE.Vector3 {
  const a = u / CRISTAL.muro.radio
  return destino.set(Math.sin(a) * CRISTAL.muro.radio, FLOOR_Y + v, Math.cos(a) * CRISTAL.muro.radio)
}

/**
 * El muro en un búfer: por celda, un abanico desde su centro, mirando hacia adentro; la normal (inclinada, plana por celda) y `aInterior`.
 * [PULIDO 26] X4 · por triángulo, `aBorde`: la dirección del centro hacia su borde (en su plano) y la distancia del centro a ese borde (u:
 * con `aInterior`, a cuánto del borde está cada punto: el bisel); por celda, `aCelda`: su esmerilado y el giro de sus tomas.
 */
export function armarElMuro(celdas: readonly Celda[]): THREE.BufferGeometry {
  const posicion: number[] = []
  const normal: number[] = []
  const interior: number[] = []
  const hondura: number[] = []
  const borde: number[] = []
  const deLaCelda: number[] = []
  const grieta: number[] = []
  const c = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  for (const [semilla, celda] of celdas.entries()) {
    const p = celda.poligono
    const n = p.length / 2
    if (n < 3) continue
    const rayos = rayosDeLaCelda(semilla)
    let cu = 0
    let cv = 0
    for (let k = 0; k < n; k += 1) {
      cu += p[k * 2] / n
      cv += p[k * 2 + 1] / n
    }
    enElMundo(cu, cv, c)
    // La normal: hacia el centro de la sala, inclinada un poco alrededor de la vertical y de la tangente.
    N.set(-c.x, 0, -c.z).normalize()
    T.crossVectors(EJE_Y, N).normalize()
    N.applyQuaternion(Q.setFromAxisAngle(EJE_Y, celda.giro[0])).applyQuaternion(Q.setFromAxisAngle(T, celda.giro[1]))
    for (let k = 0; k < n; k += 1) {
      enElMundo(p[k * 2], p[k * 2 + 1], a)
      enElMundo(p[((k + 1) % n) * 2], p[((k + 1) % n) * 2 + 1], b)
      // La cara de adelante mira hacia adentro (el orden de los vértices).
      const hacia = new THREE.Vector3().subVectors(a, c).cross(new THREE.Vector3().subVectors(b, c)).dot(c) < 0
      const [x, y] = hacia ? [a, b] : [b, a]
      posicion.push(c.x, c.y, c.z, x.x, x.y, x.z, y.x, y.y, y.z)
      // [C2-31g] `aGrieta`: el punto desde el centro de su celda (u, en el muro desenrollado), la semilla y los rayos de la celda.
      const enA = [p[k * 2] - cu, p[k * 2 + 1] - cv]
      const enB = [p[((k + 1) % n) * 2] - cu, p[((k + 1) % n) * 2 + 1] - cv]
      const [gx, gy] = hacia ? [enA, enB] : [enB, enA]
      grieta.push(0, 0, semilla, rayos, gx[0], gx[1], semilla, rayos, gy[0], gy[1], semilla, rayos)
      for (let q = 0; q < 3; q += 1) normal.push(N.x, N.y, N.z)
      interior.push(1, 0, 0)
      hondura.push(celda.hondura, celda.hondura, celda.hondura)
      AB.subVectors(y, x)
      PIE.copy(x).addScaledVector(AB, new THREE.Vector3().subVectors(c, x).dot(AB) / Math.max(1e-9, AB.lengthSq())).sub(c)
      const hastaElBorde = PIE.length()
      PIE.divideScalar(Math.max(1e-9, hastaElBorde))
      for (let q = 0; q < 3; q += 1) {
        borde.push(PIE.x, PIE.y, PIE.z, hastaElBorde)
        deLaCelda.push(celda.esmerilado[0], celda.esmerilado[1])
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posicion, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3))
  g.setAttribute('aInterior', new THREE.Float32BufferAttribute(interior, 1))
  g.setAttribute('aHondura', new THREE.Float32BufferAttribute(hondura, 1))
  g.setAttribute('aBorde', new THREE.Float32BufferAttribute(borde, 4))
  g.setAttribute('aCelda', new THREE.Float32BufferAttribute(deLaCelda, 2))
  g.setAttribute('aGrieta', new THREE.Float32BufferAttribute(grieta, 4))
  return g
}

/**
 * [C2-31g] Los rayos de la telaraña de la celda `indice`: cuántos (la parte entera, de `GRIETAS.telarana.rayos`) y su giro (la parte
 * decimal, entre 0,02 y 0,98: la parte entera no se corre aunque el sombreador la interpole). Calculado acá, una vez por celda: el
 * fragmento no gasta un azar en eso.
 */
export function rayosDeLaCelda(indice: number): number {
  const [desde, hasta] = GRIETAS.telarana.rayos
  const azar = azarDelCristal(CRISTAL.muro.semilla * 7919 + indice)
  const n = desde + Math.min(hasta - desde, Math.floor(azar() * (hasta - desde + 1)))
  return n + 0.02 + 0.96 * azar()
}

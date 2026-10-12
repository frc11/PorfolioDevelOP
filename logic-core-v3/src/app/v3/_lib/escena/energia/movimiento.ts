import { BRASAS, distanciaAlRayo, type Brasas, type EntradaDeLasBrasas } from './brasas'
import { largo3 } from './largo'

/**
 * [PULIDO 18] P1.e · EL MOVIMIENTO NUEVO DE CADA BRASA (`paso.ts` lo suma; todo estable y contenido, sin figuras):
 *   · CONVECCIÓN: las calientes suben (lo que tienen de energía por encima de la de reposo) y las frías bajan, lento.
 *   · PINCH: un arco, mientras golpea, atrae un instante a las que tiene cerca hacia su canal y las calienta: al apagarse las suelta
 *     encendidas (y la convección se las lleva para arriba).
 *   · ESTELA DEL PUNTERO: al moverse, arrastra a las que tiene cerca en su dirección (como la mano en el agua), además de su carga.
 *   · EL VIENTO DEL SCROLL lo suma `paso.ts` al campo (la cámara que pasa: más fuerte cuanto más caliente).
 * Escribe en `DEL_MOVIMIENTO` la fuerza (x, y, z) y la energía que gana en este paso (sin reservas). Puro (Node).
 */
export const DEL_MOVIMIENTO = new Float32Array(4)
const PUNTO = new Float32Array(3)

/** El movimiento nuevo de la brasa `i` en este paso, en `DEL_MOVIMIENTO` (fuerza x, y, z; energía ganada). */
export function delMovimiento(b: Brasas, i: number, en: EntradaDeLasBrasas, dt: number): void {
  const C = BRASAS.conveccion
  const P = BRASAS.pinch
  const S = BRASAS.estela
  const x = b.lugar[i * 3]
  const y = b.lugar[i * 3 + 1]
  const z = b.lugar[i * 3 + 2]
  let fx = 0
  let fz = 0
  let gana = 0
  // La convección: lo que la brasa tiene por encima de la energía de reposo la sube; fría, baja despacio.
  const calor = b.energia[i] - (BRASAS.energia.base + BRASAS.energia.porTemperatura * en.temperatura)
  let fy = C.sube * Math.max(0, calor) - C.baja * Math.max(0, 1 - 6 * calor)
  // El pinch: hacia el punto más cercano del canal de cada arco que golpea, y la calienta.
  for (let k = 0; k < en.cuantosArcos; k += 1) {
    const o = k * 7
    const fuerza = en.arcos[o + 6]
    if (fuerza <= 0.01) continue
    const abx = en.arcos[o + 3] - en.arcos[o]
    const aby = en.arcos[o + 4] - en.arcos[o + 1]
    const abz = en.arcos[o + 5] - en.arcos[o + 2]
    const t = Math.min(1, Math.max(0, ((x - en.arcos[o]) * abx + (y - en.arcos[o + 1]) * aby + (z - en.arcos[o + 2]) * abz) / Math.max(1e-6, abx * abx + aby * aby + abz * abz)))
    const qx = en.arcos[o] + abx * t - x
    const qy = en.arcos[o + 1] + aby * t - y
    const qz = en.arcos[o + 2] + abz * t - z
    const d = largo3(qx, qy, qz)
    if (d >= P.radio || d < 1e-4) continue
    const w = (1 - d / P.radio) ** 2 * fuerza
    fx += (P.fuerza * w * qx) / d
    fy += (P.fuerza * w * qy) / d
    fz += (P.fuerza * w * qz) / d
    gana += P.calienta * w * dt
  }
  // La estela del puntero: cerca de su rayo, la arrastra hacia la velocidad del puntero (sólo lo que el puntero se mueve).
  const r = en.rayo
  const mueve = Math.min(1, largo3(en.estela[0], en.estela[1], en.estela[2]) / S.desde)
  if (r !== null && mueve > 0.01) {
    const d = distanciaAlRayo(x, y, z, r, PUNTO)
    if (d < S.radio) {
      const w = (1 - d / S.radio) ** 2 * S.arrastra * mueve
      fx += (en.estela[0] - b.velocidad[i * 3]) * w
      fy += (en.estela[1] - b.velocidad[i * 3 + 1]) * w
      fz += (en.estela[2] - b.velocidad[i * 3 + 2]) * w
    }
  }
  DEL_MOVIMIENTO[0] = fx
  DEL_MOVIMIENTO[1] = fy
  DEL_MOVIMIENTO[2] = fz
  DEL_MOVIMIENTO[3] = gana
}

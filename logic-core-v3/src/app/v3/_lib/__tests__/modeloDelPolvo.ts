/**
 * [PULIDO 9] H1 · [PULIDO 10] J10 · EL MODELO DEL POLVO QUE SE POSA, para los invariantes (`s60` H1 y `s61` J10). Salió de
 * `s60-pulido-9` al hacer falta en dos: la misma cuenta, no una copia.
 *
 * La máquina de la quietud es la de verdad (`avanzarElPolvoEn`); lo que la escena le pasa a la simulación (el despertar, su
 * origen y la quietud) sale de un `Cableado`: el de hoy lo arma con las funciones de `posarse.ts` (y `Fisica.tsx`, fijado por
 * texto en cada invariante). Cada mota sigue, en la vertical, las reglas del shader con sus constantes: se suelta del aire con
 * la quietud, cae al piso a tiempo, la levanta el frente (la regla `despierta`) y sube a su lugar; pasado el soplo, vuelve al
 * aire.
 */
import { FLOOR_Y } from '../escena/probeScene'
import { POSARSE, avanzarElPolvoEn, frenteInicial, polvoInicial, type EstadoDelPolvoVivo, type FrenteDelPolvo } from '../escena/polvo/posarse'
import { FISICA } from '../escena/polvo/simulacion'
import { POLVO_PAREJO, posicionesDelPolvoParejo } from '../escena/polvo/volumen'

/** Lo que la escena le pasa a la simulación en un cuadro: el despertar (el frente), su origen y desde cuándo está quieto. */
export type Cableado = (e: EstadoDelPolvoVivo, f: FrenteDelPolvo) => { readonly desperto: number; readonly origen: readonly number[]; readonly quieto: number }

export const DT = 1 / 30
const L = POLVO_PAREJO.lado
// La cámara mira hacia −z; la caja va delante (como `libre` del shader) y el despertar del scroll sale 6 u delante de ella.
const CAMARA = [0, FLOOR_Y + 3, 0] as const
const CENTRO = [0, CAMARA[1], -(L / 2 - POLVO_PAREJO.atras)] as const
export const ORIGEN = [0, FLOOR_Y, -6] as const
const posiciones = posicionesDelPolvoParejo()
export const N = posiciones.length / 3
const azar = (k: number): number => {
  const s = Math.sin(k * 12.9898 + 4.1414) * 43758.5453
  return s - Math.floor(s)
}
const [fx, fy, fz] = [new Float32Array(N), new Float32Array(N), new Float32Array(N)]
const pisoDe = new Float32Array(N)
for (let k = 0; k < N; k += 1) {
  fx[k] = CENTRO[0] + posiciones[k * 3]
  fy[k] = CENTRO[1] + posiciones[k * 3 + 1]
  fz[k] = CENTRO[2] + posiciones[k * 3 + 2]
  const r = azar(k) * 7.31
  pisoDe[k] = FLOOR_Y + 0.02 + (r - Math.floor(r)) * POSARSE.alturaPosada
}
// Las que el aire dibuja (su lugar arriba del piso del volumen): su altura y su dispersión en el aire son las de referencia.
const visibles = [...Array(N).keys()].filter((k) => fy[k] > POLVO_PAREJO.piso)
export interface Estadistica {
  readonly media: number
  readonly dispersion: number
}
const estadistica = (alturas: (k: number) => number): Estadistica => {
  let [s, s2] = [0, 0]
  for (const k of visibles) {
    s += alturas(k)
    s2 += alturas(k) ** 2
  }
  const media = s / visibles.length
  return { media, dispersion: Math.sqrt(Math.max(0, s2 / visibles.length - media * media)) }
}
export const SUSPENDIDO = estadistica((k) => fy[k])

/** Un guion: cuántos segundos y si en cada instante hay movimiento (la rueda: una muesca de 0,1 s cada 0,6 s). */
export interface Tramo {
  readonly s: number
  readonly mueve: (t: number) => boolean
}
export const QUIETO: Tramo = { s: 15, mueve: () => false }

/** Corre el guion; devuelve la altura media y la dispersión al final de cada tramo. `alCuadro` ve los modos (0 aire, 1 cae, 2 piso, 5 levantada). */
export function simular(cableado: Cableado, guion: readonly Tramo[], alCuadro?: (reloj: number, modo: Uint8Array) => void): Estadistica[] {
  const modo = new Uint8Array(N)
  const y = Float32Array.from(fy)
  const desde = new Float32Array(N)
  const polvo: EstadoDelPolvoVivo = { ...polvoInicial(0), origen: [0, 0, 0] }
  const frente = frenteInicial()
  let reloj = 0
  const salida: Estadistica[] = []
  for (const tramo of guion) {
    for (let t = 0; t < tramo.s; t += DT) {
      reloj += DT
      avanzarElPolvoEn(polvo, reloj, tramo.mueve(t) ? ORIGEN : null, false)
      const u = cableado(polvo, frente)
      const quieta = reloj - u.quieto
      for (let k = 0; k < N; k += 1) {
        const retraso = azar(k) * POSARSE.desparejoS
        const piso = pisoDe[k]
        const despierta = u.desperto > desde[k] && reloj >= u.desperto + Math.hypot(fx[k] - u.origen[0], fz[k] - u.origen[2]) / POSARSE.velocidad
        if (modo[k] === 0) {
          if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
          else y[k] = fy[k]
          continue
        }
        if (modo[k] === 1 || modo[k] === 2) {
          if (despierta) [modo[k], desde[k]] = [5, reloj]
          else if (modo[k] === 1) {
            const falta = Math.max(0.6, POSARSE.asentadoS + retraso * 0.3 - quieta)
            y[k] -= Math.max(FISICA.caida.minima, (y[k] - piso) / falta) * DT
            if (y[k] <= piso) [y[k], modo[k]] = [piso, 2]
            continue
          } else continue
        }
        // Levantada: sube a su lugar (con su constante y su tope) y, pasado el soplo, si llegó vuelve al aire.
        const lugar = Math.max(fy[k], piso)
        const hacia = Math.max(-FISICA.vuelta.tope, Math.min(FISICA.vuelta.tope, (lugar - y[k]) / FISICA.vuelta.s))
        y[k] = Math.max(piso, y[k] + hacia * DT)
        const pasado = reloj - desde[k] - (FISICA.soplo.s + azar(k) * FISICA.soplo.azar)
        if (pasado <= 0) continue
        const llego = Math.abs(y[k] - fy[k]) < FISICA.vuelta.entrega || fy[k] < POLVO_PAREJO.piso || pasado > FISICA.vuelta.esperaS
        if (llego) modo[k] = 0
        else if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
      }
      alCuadro?.(reloj, modo)
    }
    salida.push(estadistica((k) => (modo[k] === 0 ? fy[k] : y[k])))
  }
  return salida
}

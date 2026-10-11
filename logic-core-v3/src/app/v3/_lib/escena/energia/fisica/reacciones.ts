import { ESPECIE, ESPECIES, ionizar, recombinar } from '../especies'
import { ENLACE, FISICA, distanciaAlRayo, vivo, type EntradaDelGas, type Gas } from './fisica'

/**
 * [PULIDO 16] N2 · LAS REACCIONES DEL GAS (`fisica.ts`: el modelo). Una vez por cuadro: los enlaces que se rompen (con la
 * temperatura local, como Arrhenius, estirados de más o tocados por el puntero), el par ligado que recombina en calma (el ion
 * captura su electrón: un destello) y, muy caliente, algún átomo que se ioniza solo. Pura.
 */

const PUNTO = new Float32Array(3)

/** Suelta el enlace de `i` (y de su pareja), con un rato sin volver a enlazarse. */
export function soltarEnlace(g: Gas, i: number, azar: () => number): void {
  const j = g.pareja[i]
  if (j < 0) return
  const a = FISICA.enlace.enfria[0]
  const b = FISICA.enlace.enfria[1]
  g.pareja[i] = -1
  g.pareja[j] = -1
  g.tipo[i] = ENLACE.ninguno
  g.tipo[j] = ENLACE.ninguno
  g.enfriado[i] = a + azar() * (b - a)
  g.enfriado[j] = a + azar() * (b - a)
  g.cuenta.rotos += 1
}

/** Las rupturas, la recombinación y la ionización térmica: una vez por cuadro, con la temperatura local. */
export function reacciones(g: Gas, dt: number, e: EntradaDelGas, azar: () => number): void {
  const { p } = g
  const E = FISICA.enlace
  const T = e.temperatura
  for (let i = 0; i < p.n; i += 1) {
    g.enfriado[i] = Math.max(0, g.enfriado[i] - dt)
    const j = g.pareja[i]
    if (j <= i) continue
    if (!vivo(p, i) || !vivo(p, j)) {
      soltarEnlace(g, i, azar)
      continue
    }
    const ligado = g.tipo[i] === ENLACE.ligado
    const de = ligado ? E.ligado : E.molecula
    const dx = p.lugar[j * 3] - p.lugar[i * 3]
    const dy = p.lugar[j * 3 + 1] - p.lugar[i * 3 + 1]
    const dz = p.lugar[j * 3 + 2] - p.lugar[i * 3 + 2]
    const r = Math.hypot(dx, dy, dz)
    // La temperatura local: la del gas más la agitación del par, su rapidez relativa DE COSTADO (a lo largo del enlace es su propia
    // vibración, no calor).
    const vx = p.velocidad[j * 3] - p.velocidad[i * 3]
    const vy = p.velocidad[j * 3 + 1] - p.velocidad[i * 3 + 1]
    const vz = p.velocidad[j * 3 + 2] - p.velocidad[i * 3 + 2]
    const largo = Math.max(1e-4, r)
    const aLoLargo = (vx * dx + vy * dy + vz * dz) / largo
    const costado2 = Math.max(0, vx * vx + vy * vy + vz * vz - aLoLargo * aLoLargo)
    const local = T + 0.12 * costado2
    const rompe = 1 - Math.exp(-E.frecuencia * Math.exp(-de.energia / (local + 0.02)) * dt)
    // El puntero rompe los enlaces que toca.
    const tocado = e.rayo !== null && distanciaAlRayo(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2], e.rayo, PUNTO) < FISICA.puntero.rompe
    if (r > de.reposo * de.rompe || tocado || azar() < rompe) {
      soltarEnlace(g, i, azar)
      continue
    }
    // El par ligado, en calma, recombina: el ion captura su electrón (un destello).
    if (ligado && azar() < 1 - Math.exp(-E.ligado.recombina * (1 - T) ** 2 * dt)) {
      const ion = p.especie[i] === ESPECIE.ion ? i : j
      const electron = ion === i ? j : i
      g.pareja[i] = -1
      g.pareja[j] = -1
      g.tipo[i] = ENLACE.ninguno
      g.tipo[j] = ENLACE.ninguno
      recombinar(p, ion, electron)
    }
  }
  // Muy caliente, algún átomo se ioniza solo (el electrón sale para cualquier lado).
  const I = FISICA.ionizacionTermica
  const esperados = p.nAtomos * I.tasa * Math.max(0, T - I.desde) ** 2 * dt
  if (azar() < esperados) {
    const i = Math.floor(azar() * p.nAtomos)
    if (g.pareja[i] >= 0) soltarEnlace(g, i, azar)
    const rapidez = ESPECIES.eyeccion[0] + azar() * (ESPECIES.eyeccion[1] - ESPECIES.eyeccion[0])
    ionizar(p, i, azar() - 0.5, azar() - 0.5, azar() - 0.5, rapidez, azar)
  }
}

/** Cuántos enlaces hay de cada tipo (pares). */
export function enlacesVivos(g: Gas): { moleculas: number; ligados: number } {
  let [moleculas, ligados] = [0, 0]
  for (let i = 0; i < g.p.n; i += 1) {
    if (g.pareja[i] <= i) continue
    if (g.tipo[i] === ENLACE.molecula) moleculas += 1
    else ligados += 1
  }
  return { moleculas, ligados }
}

import { ESPECIE, ESPECIES, MASA_DE, cargaDe, fundidos } from '../especies'
import { ENLACE, FISICA, LADO, anilloEn, armarLaGrilla, celda, corte, distanciaAlRayo, vivo, type EntradaDelGas, type Gas } from './fisica'
import { reacciones } from './reacciones'

/**
 * [PULIDO 16] N2 · LA INTEGRACIÓN DEL GAS (`fisica.ts`: el modelo). Por subpaso fijo: la grilla, las fuerzas entre partículas
 * (Coulomb suavizado, la polarización, la repulsión de corto alcance; los enlaces nuevos en el primero del cuadro), los resortes
 * que vibran, lo de afuera (el logo que late, el puntero, los anillos del pulso, la agitación térmica, la cáscara) y la
 * integración semi-implícita. Por cuadro: los subpasos que tocan, las reacciones y los fundidos. Sin reservas. Pura.
 */

const PUNTO = new Float32Array(3)

/** Un subpaso: la grilla, las fuerzas (entre partículas, enlaces, afuera), y la integración semi-implícita. */
function subpaso(g: Gas, h: number, e: EntradaDelGas, forma: boolean, azar: () => number): void {
  const { p } = g
  const { lugar: x, velocidad: v, fuerza: F } = p
  const C = FISICA.coulomb
  const R = FISICA.repulsion
  const M = FISICA.enlace.molecula
  const Lg = FISICA.enlace.ligado
  F.fill(0)
  armarLaGrilla(g)
  let mirados = 0
  for (let i = 0; i < p.n; i += 1) {
    if (!vivo(p, i)) continue
    const qi = cargaDe(p, i)
    const cx = celda(x[i * 3])
    const cy = celda(x[i * 3 + 1])
    const cz = celda(x[i * 3 + 2])
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1)
      for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1)
        for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1)
          for (let j = g.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = g.siguiente[j]) {
            // Cada par una vez (j > i), con la fuerza y su contraria.
            if (j <= i) continue
            mirados += 1
            const dx = x[j * 3] - x[i * 3]
            const dy = x[j * 3 + 1] - x[i * 3 + 1]
            const dz = x[j * 3 + 2] - x[i * 3 + 2]
            const r2 = dx * dx + dy * dy + dz * dz
            if (r2 >= FISICA.alcance * FISICA.alcance || r2 < 1e-10) continue
            const r = Math.sqrt(r2)
            const qj = cargaDe(p, j)
            // Positiva: hacia j (atracción).
            let f = 0
            if (qi !== 0 && qj !== 0) f -= (C.k * qi * qj * r * corte(r)) / (r2 + C.suavizado * C.suavizado) ** 1.5
            else if (qi !== 0 || qj !== 0) f += (FISICA.polarizacion * corte(r)) / (r2 + C.suavizado * C.suavizado)
            if (r < R.sigma) {
              const u = 1 - r / R.sigma
              f -= (R.fuerza * u * u * R.sigma) / Math.max(r, R.minimo)
            }
            const fx = (f * dx) / r
            const fy = (f * dy) / r
            const fz = (f * dz) / r
            F[i * 3] += fx
            F[i * 3 + 1] += fy
            F[i * 3 + 2] += fz
            F[j * 3] -= fx
            F[j * 3 + 1] -= fy
            F[j * 3 + 2] -= fz
            // Los enlaces nuevos (una vez por cuadro): dos átomos lentos, o un ion y un electrón lentos.
            if (!forma || g.pareja[i] >= 0 || g.pareja[j] >= 0 || g.enfriado[i] > 0 || g.enfriado[j] > 0) continue
            const si = p.especie[i]
            const sj = p.especie[j]
            const molecula = si === ESPECIE.atomo && sj === ESPECIE.atomo
            const ligado = (si === ESPECIE.ion && sj === ESPECIE.electron) || (si === ESPECIE.electron && sj === ESPECIE.ion)
            if (!molecula && !ligado) continue
            const de = molecula ? M : Lg
            if (r > de.forma) continue
            const vr = Math.hypot(v[j * 3] - v[i * 3], v[j * 3 + 1] - v[i * 3 + 1], v[j * 3 + 2] - v[i * 3 + 2])
            if (vr > de.lentos * (1 - 0.7 * e.temperatura)) continue
            g.pareja[i] = j
            g.pareja[j] = i
            const tipo = molecula ? ENLACE.molecula : ENLACE.ligado
            g.tipo[i] = tipo
            g.tipo[j] = tipo
            g.fase[i] = azar() * Math.PI * 2
            if (molecula) g.cuenta.moleculas += 1
            else g.cuenta.ligados += 1
          }
  }
  g.paresMirados = mirados
  // Los enlaces: un resorte que vibra (su largo late), con poca amortiguación.
  for (let i = 0; i < p.n; i += 1) {
    const j = g.pareja[i]
    if (j <= i) continue
    const de = g.tipo[i] === ENLACE.molecula ? M : Lg
    const dx = x[j * 3] - x[i * 3]
    const dy = x[j * 3 + 1] - x[i * 3 + 1]
    const dz = x[j * 3 + 2] - x[i * 3 + 2]
    const r = Math.max(1e-4, Math.hypot(dx, dy, dz))
    const largo = de.reposo * (1 + de.vibra.amplitud * Math.sin(2 * Math.PI * de.vibra.hz * g.reloj + g.fase[i]))
    const vr = ((v[j * 3] - v[i * 3]) * dx + (v[j * 3 + 1] - v[i * 3 + 1]) * dy + (v[j * 3 + 2] - v[i * 3 + 2]) * dz) / r
    const f = de.resorte * (r - largo) + de.amortigua * vr
    F[i * 3] += (f * dx) / r
    F[i * 3 + 1] += (f * dy) / r
    F[i * 3 + 2] += (f * dz) / r
    F[j * 3] -= (f * dx) / r
    F[j * 3 + 1] -= (f * dy) / r
    F[j * 3 + 2] -= (f * dz) / r
  }
  const A = FISICA.agitacion
  const L = FISICA.logo
  const P = FISICA.puntero
  const { radio, hueco } = ESPECIES.volumen
  const cargaDelLogo = L.carga * (1 + L.latido * e.latido)
  for (let i = 0; i < p.n; i += 1) {
    if (!vivo(p, i)) continue
    const s = p.especie[i]
    const q = cargaDe(p, i)
    const px = x[i * 3]
    const py = x[i * 3 + 1]
    const pz = x[i * 3 + 2]
    let fx = F[i * 3]
    let fy = F[i * 3 + 1]
    let fz = F[i * 3 + 2]
    const r = Math.max(1e-4, Math.hypot(px, py, pz))
    // El logo: una carga positiva suavizada en el centro (repele a los iones, atrae a los electrones).
    if (q !== 0) {
      const fl = (C.k * q * cargaDelLogo) / (r * r + L.suavizado * L.suavizado) ** 1.5
      fx += fl * px
      fy += fl * py
      fz += fl * pz
    }
    // El puntero: una carga (+) sobre su rayo; un átomo se polariza (lo atrae poco).
    if (e.rayo !== null) {
      const d = distanciaAlRayo(px, py, pz, e.rayo, PUNTO)
      if (d < P.alcance && d > 1e-4) {
        const u = 1 - d / P.alcance
        let f = (q < 0 ? 1 : q > 0 ? -1 : 0.15) * P.carga * e.cargaDelPuntero * u
        if (d < P.cerca) f -= R.fuerza * (1 - d / P.cerca) ** 2
        fx += (f * (PUNTO[0] - px)) / d
        fy += (f * (PUNTO[1] - py)) / d
        fz += (f * (PUNTO[2] - pz)) / d
      }
    }
    // Los anillos del pulso: su frente empuja hacia afuera, en el plano del piso.
    const rh = Math.hypot(px, pz)
    if (rh > 1e-3) {
      let w = 0
      for (let k = 0; k < 4; k += 1) w += anilloEn(e.anillos[k * 4], e.anillos[k * 4 + 1], e.anillos[k * 4 + 2], e.anillos[k * 4 + 3], e.naceEn, e.tiempo, rh)
      if (w > 0) {
        fx += (FISICA.anillo.empuje * w * px) / rh
        fz += (FISICA.anillo.empuje * w * pz) / rh
      }
    }
    // La agitación térmica: un empujón al azar que crece con la temperatura (más en los electrones).
    const a = (A.base + A.calor * e.temperatura) * (s === ESPECIE.electron ? A.electron : 1) * 1.7
    fx += a * (azar() - 0.5)
    fy += a * (azar() - 0.5)
    fz += a * (azar() - 0.5)
    // La cáscara: afuera del radio vuelven; adentro del hueco (el logo), salen.
    const sobra = r > radio ? -(r - radio) : r < hueco ? hueco - r : 0
    if (sobra !== 0) {
      fx += (FISICA.contencion * sobra * px) / r
      fy += (FISICA.contencion * sobra * py) / r
      fz += (FISICA.contencion * sobra * pz) / r
    }
    // Semi-implícita: primero la velocidad (con su amortiguación y su tope), después el lugar con la velocidad nueva.
    const m = MASA_DE[s]
    const frena = Math.exp(-FISICA.arrastre[s] * h)
    let vx = (v[i * 3] + (fx / m) * h) * frena
    let vy = (v[i * 3 + 1] + (fy / m) * h) * frena
    let vz = (v[i * 3 + 2] + (fz / m) * h) * frena
    const rapidez = Math.hypot(vx, vy, vz)
    const tope = FISICA.tope[s]
    if (rapidez > tope) {
      vx *= tope / rapidez
      vy *= tope / rapidez
      vz *= tope / rapidez
    }
    v[i * 3] = vx
    v[i * 3 + 1] = vy
    v[i * 3 + 2] = vz
    x[i * 3] = px + vx * h
    x[i * 3 + 1] = py + vy * h
    x[i * 3 + 2] = pz + vz * h
  }
  g.reloj += h
}

/**
 * Un cuadro de la física (`dt` en s): los subpasos fijos que tocan (lo que sobra queda para el próximo), las reacciones y los
 * fundidos. Los enlaces nuevos se forman en el primer subpaso del cuadro.
 */
export function pasoDelGas(g: Gas, dt: number, e: EntradaDelGas, azar: () => number): void {
  g.acumulado = Math.min(g.acumulado + Math.max(0, dt), FISICA.paso * FISICA.subpasosMaximos)
  let primero = true
  while (g.acumulado >= FISICA.paso - 1e-9) {
    subpaso(g, FISICA.paso, e, primero, azar)
    g.acumulado -= FISICA.paso
    primero = false
  }
  reacciones(g, dt, e, azar)
  fundidos(g.p, dt, azar)
}

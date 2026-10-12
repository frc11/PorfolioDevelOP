import { BRASAS, distanciaAlRayo, soltarEnlace, type Brasas, type EntradaDeLasBrasas } from './brasas'
import { largo3 } from './largo'

/**
 * [PULIDO 18] P1.b · LO DE AFUERA DE CADA BRASA (salió de `brasas.ts`, que pasaba las 300 líneas; `paso.ts` lo suma): el puntero (atrae
 * o empuja según el signo, las hace girar alrededor de su rayo, las calienta y rompe los enlaces que toca), las ondas de los pulsos y
 * las del logo (desde donde está el logo), la agitación térmica, la cáscara (del MUNDO: alrededor del origen, no sigue al logo) y el
 * hueco del logo (un obstáculo donde esté). Escribe en `DE_AFUERA` la fuerza (x, y, z) y la energía que gana en este paso. Puro (Node).
 */
export const DE_AFUERA = new Float32Array(4)
const PUNTO = new Float32Array(3)
const F = BRASAS.fuerzas

/** Lo de afuera de la brasa `i` en este paso, en `DE_AFUERA` (fuerza x, y, z; energía ganada). */
export function deAfuera(b: Brasas, i: number, en: EntradaDeLasBrasas, dt: number, azar: () => number): void {
  const P = BRASAS.cursor
  const K = BRASAS.energia
  const O = BRASAS.onda
  const { radio, hueco } = BRASAS.volumen
  const { pareja, energia } = b
  const x = b.lugar[i * 3]
  const y = b.lugar[i * 3 + 1]
  const z = b.lugar[i * 3 + 2]
  let fx = 0
  let fy = 0
  let fz = 0
  let gana = 0
  // El puntero: atrae a las negativas hacia su rayo y empuja a las positivas, las hace girar alrededor del rayo (ordena), las
  // calienta y rompe los enlaces que toca.
  const r = en.rayo
  if (r !== null) {
    const d = distanciaAlRayo(x, y, z, r, PUNTO)
    if (d < P.alcance && d > 1e-4) {
      const u = 1 - d / P.alcance
      const carga = en.cargaDelPuntero
      let f = (b.signo[i] < 0 ? P.fuerza : -P.fuerza) * u * carga
      if (d < P.cerca) f -= F.choque * (1 - d / P.cerca) ** 2
      const ux = (PUNTO[0] - x) / d
      const uy = (PUNTO[1] - y) / d
      const uz = (PUNTO[2] - z) / d
      // El giro: alrededor del rayo (rayo × hacia el rayo).
      const g = P.gira * u * carga
      fx += f * ux + g * (r.dy * uz - r.dz * uy)
      fy += f * uy + g * (r.dz * ux - r.dx * uz)
      fz += f * uz + g * (r.dx * uy - r.dy * ux)
      gana += P.calienta * u * u * carga * dt
      if (d < P.rompe && pareja[i] >= 0) soltarEnlace(b, i, azar)
    }
  }
  // Las ondas de los pulsos: el frente empuja hacia afuera y calienta.
  for (let k = 0; k < 2; k += 1) {
    const edad = en.pulsos[k * 4 + 3]
    if (edad < 0) continue
    const dx = x - en.pulsos[k * 4]
    const dy = y - en.pulsos[k * 4 + 1]
    const dz = z - en.pulsos[k * 4 + 2]
    const d = Math.max(1e-4, largo3(dx, dy, dz))
    const w = 1 - Math.abs(d - O.rapidez * edad) / O.ancho
    if (w <= 0) continue
    // El frente tarda `ancho / rapidez` en pasar: en ese rato deja `empuje` de velocidad y `calienta` de energía.
    const fuerte = w * Math.max(0, 1 - (O.rapidez * edad) / O.llega)
    const porPaso = O.rapidez / O.ancho
    const empuja = (O.empuje * fuerte * porPaso) / d
    fx += empuja * dx
    fy += empuja * dy
    fz += empuja * dz
    gana += O.calienta * fuerte * porPaso * dt
  }
  // Las ondas del logo: calientan al pasar (por segundo, en la cresta), desde donde está el logo.
  const lx = x - en.logo[0]
  const ly = y - en.logo[1]
  const lz = z - en.logo[2]
  const delLogo = largo3(lx, ly, lz)
  for (let k = 0; k < 4; k += 1) {
    const fuerte = en.anillos[k * 2 + 1]
    if (fuerte <= 0) continue
    const w = (delLogo - en.anillos[k * 2]) / BRASAS.anillo.ancho
    gana += BRASAS.anillo.calienta * fuerte * Math.exp(-w * w) * dt
  }
  // Calientes, tiemblan (la agitación térmica).
  const tiembla = K.tiembla * energia[i]
  fx += tiembla * (azar() * 2 - 1)
  fy += tiembla * (azar() * 2 - 1)
  fz += tiembla * (azar() * 2 - 1)
  // La cáscara (del mundo, alrededor del origen: no sigue al logo): afuera del radio vuelven. [PULIDO 18] P1.e · más que lineal con lo
  // que se pasan (con el viento al tope sostenido y todo a la vez, alguna se escapaba): contenida siempre.
  const lejos = largo3(x, y, z)
  if (lejos > radio) {
    const vuelve = F.contiene * (lejos - radio) * (1 + (lejos - radio))
    fx -= (vuelve * x) / lejos
    fy -= (vuelve * y) / lejos
    fz -= (vuelve * z) / lejos
  }
  // El hueco del logo, donde esté (un obstáculo: si baja, las aparta al pasar; no se las lleva): adentro, salen.
  if (delLogo < hueco && delLogo > 1e-4) {
    fx += (F.contiene * (hueco - delLogo) * lx) / delLogo
    fy += (F.contiene * (hueco - delLogo) * ly) / delLogo
    fz += (F.contiene * (hueco - delLogo) * lz) / delLogo
  }
  DE_AFUERA[0] = fx
  DE_AFUERA[1] = fy
  DE_AFUERA[2] = fz
  DE_AFUERA[3] = gana
}

import { DE_AFUERA, deAfuera } from './afuera'
import { BRASAS, entreEllas, soltarEnlace, type Brasas, type EntradaDeLasBrasas } from './brasas'
import { rotor } from './ruido'

/**
 * [PULIDO 18] P1.b · EL PASO DE LAS BRASAS (salió de `brasas.ts`, que pasaba las 300 líneas): los enlaces, el campo (el curl noise),
 * lo de afuera de cada una (`afuera.ts`), el piso, la energía y la integración (semi-implícita, con amortiguación y tope). Puro (Node).
 */
const F = BRASAS.fuerzas

/** Un paso (`dt` en s, a lo sumo 1/60: el cuadro lo parte): las fuerzas, el campo, el puntero, las ondas, la energía y la integración. */
export function pasoDeLasBrasas(b: Brasas, dt: number, en: EntradaDeLasBrasas, azar: () => number): void {
  const { lugar, velocidad: v, fuerza, pareja, energia } = b
  const E = BRASAS.enlace
  const K = BRASAS.energia
  fuerza.fill(0)
  entreEllas(b, azar)
  for (let i = 0; i < b.n; i += 1) {
    const j = pareja[i]
    if (j > i) {
      b.vidaDelEnlace[i] -= dt
      if (b.vidaDelEnlace[i] <= 0) soltarEnlace(b, i, azar)
      else {
        const dx = lugar[j * 3] - lugar[i * 3]
        const dy = lugar[j * 3 + 1] - lugar[i * 3 + 1]
        const dz = lugar[j * 3 + 2] - lugar[i * 3 + 2]
        const d = Math.max(1e-4, Math.hypot(dx, dy, dz))
        const f = (E.resorte * (d - E.reposo)) / d
        fuerza[i * 3] += f * dx
        fuerza[i * 3 + 1] += f * dy
        fuerza[i * 3 + 2] += f * dz
        fuerza[j * 3] -= f * dx
        fuerza[j * 3 + 1] -= f * dy
        fuerza[j * 3 + 2] -= f * dz
      }
    }
    b.enfriado[i] = Math.max(0, b.enfriado[i] - dt)
  }
  // El campo, en la mitad de las brasas por cuadro (las otras usan el de recién).
  b.turno ^= 1
  const rapidez = BRASAS.flujo.rapidez * (1 + BRASAS.flujo.caliente * en.temperatura)
  for (let i = b.turno; i < b.n; i += 2) {
    rotor(lugar[i * 3], lugar[i * 3 + 1], lugar[i * 3 + 2], en.tiempo, b.flujo, i * 3)
    b.flujo[i * 3] *= rapidez
    b.flujo[i * 3 + 1] *= rapidez
    b.flujo[i * 3 + 2] *= rapidez
  }
  const frena = Math.exp(-F.amortigua * dt)
  const enfria = Math.exp(-dt / K.apagaS)
  const reposo = K.base + K.porTemperatura * en.temperatura
  for (let i = 0; i < b.n; i += 1) {
    const x = lugar[i * 3]
    const y = lugar[i * 3 + 1]
    const z = lugar[i * 3 + 2]
    deAfuera(b, i, en, dt, azar)
    const fx = fuerza[i * 3] + (b.flujo[i * 3] - v[i * 3]) * BRASAS.flujo.sigue + DE_AFUERA[0]
    let fy = fuerza[i * 3 + 1] + (b.flujo[i * 3 + 1] - v[i * 3 + 1]) * BRASAS.flujo.sigue + DE_AFUERA[1]
    const fz = fuerza[i * 3 + 2] + (b.flujo[i * 3 + 2] - v[i * 3 + 2]) * BRASAS.flujo.sigue + DE_AFUERA[2]
    const gana = DE_AFUERA[3]
    // El piso: nada pasa por debajo.
    const sobrePiso = en.piso + BRASAS.volumen.sobreElPiso
    if (y < sobrePiso) {
      fy += (sobrePiso - y) * 8
      if (v[i * 3 + 1] < 0) v[i * 3 + 1] = 0
    }
    let vx = (v[i * 3] + fx * dt) * frena
    let vy = (v[i * 3 + 1] + fy * dt) * frena
    let vz = (v[i * 3 + 2] + fz * dt) * frena
    const rap = Math.hypot(vx, vy, vz)
    if (rap > F.tope) {
      vx *= F.tope / rap
      vy *= F.tope / rap
      vz *= F.tope / rap
    }
    v[i * 3] = vx
    v[i * 3 + 1] = vy
    v[i * 3 + 2] = vz
    lugar[i * 3] = x + vx * dt
    lugar[i * 3 + 1] = y + vy * dt
    lugar[i * 3 + 2] = z + vz * dt
    energia[i] = Math.min(1, reposo + (energia[i] - reposo) * enfria + gana)
  }
}

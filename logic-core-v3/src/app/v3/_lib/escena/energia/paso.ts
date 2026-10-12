import { DE_AFUERA, deAfuera } from './afuera'
import { DEL_MOVIMIENTO, delMovimiento } from './movimiento'
import { BRASAS, desenlazar, soltarEnlace, type Brasas, type EntradaDeLasBrasas } from './brasas'
import { DOMINIO, EN_EL_DOMINIO, alfaDe, envolver } from './dominio'
import { ajustarLaGrilla, entreEllas } from './grilla'
import { largo3 } from './largo'
import { REPOSO } from './reposo'
import { rotorEnLote } from './ruido'

/**
 * [PULIDO 18] P1.b · EL PASO DE LAS BRASAS (salió de `brasas.ts`, que pasaba las 300 líneas): los enlaces, el campo (el curl noise),
 * lo de afuera de cada una (`afuera.ts`), el piso, la energía y la integración (semi-implícita, con amortiguación y tope). Puro (Node).
 * [PULIDO 19] Q1.b/c · la grilla se ajusta a la caja del dominio de la vista (o a la de la cáscara, sin dominio) y, al final, el
 * ENVOLTORIO: la que salió del dominio reaparece por la cara opuesta con la vida en 0 (el evento) y la vida de todas persigue el alfa
 * del dominio con tope de cambio (`DOMINIO.fundidoS`): nada aparece ni desaparece de golpe. Sin números por parámetro en lo de cada
 * brasa (`en.dt`, el rotor en lote, el alfa por brasa): un número no entero que cruza una función que V8 no inlineó se encaja en un
 * HeapNumber (medido en Chrome: 51 KB de basura por cuadro que eran de eso).
 */
const F = BRASAS.fuerzas
const PISO = BRASAS.piso
/** Sin dominio: la caja de la cáscara (su radio más el alcance), alrededor del origen. */
const CAJA_DE_LA_CASCARA = Float32Array.from([-1, -1, -1, 1, 1, 1].map((s) => s * (BRASAS.volumen.radio + F.alcance)))

/** Un paso (`dt` en s, a lo sumo 1/60: el cuadro lo parte): las fuerzas, el campo, el puntero, las ondas, la energía y la integración. */
export function pasoDeLasBrasas(b: Brasas, dt: number, en: EntradaDeLasBrasas, azar: () => number): void {
  const { lugar, velocidad: v, fuerza, pareja, energia } = b
  const E = BRASAS.enlace
  const K = BRASAS.energia
  en.dt = dt
  fuerza.fill(0)
  ajustarLaGrilla(b, en.dominio === null ? CAJA_DE_LA_CASCARA : en.dominio.caja)
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
        const d = Math.max(1e-4, largo3(dx, dy, dz))
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
  rotorEnLote(lugar, b.flujo, b.turno, 2, b.n, en.tiempo)
  for (let i = b.turno; i < b.n; i += 2) {
    b.flujo[i * 3] *= rapidez
    b.flujo[i * 3 + 1] *= rapidez
    b.flujo[i * 3 + 2] *= rapidez
  }
  // [PULIDO 19] Q1.d · con la red en reposo las brasas se frenan (`en.freno`, de `reposo.ts`).
  const frena = Math.exp(-(F.amortigua + REPOSO.frena * en.freno) * dt)
  const enfria = Math.exp(-dt / K.apagaS)
  const reposo = K.base + K.porTemperatura * en.temperatura
  for (let i = 0; i < b.n; i += 1) {
    const x = lugar[i * 3]
    const y = lugar[i * 3 + 1]
    const z = lugar[i * 3 + 2]
    deAfuera(b, i, en, azar)
    delMovimiento(b, i, en)
    // [PULIDO 18] P1.e · el campo lleva además el viento del scroll; y lo nuevo: la convección, el pinch y la estela del puntero.
    const fx = fuerza[i * 3] + (b.flujo[i * 3] + en.viento[0] - v[i * 3]) * BRASAS.flujo.sigue + DE_AFUERA[0] + DEL_MOVIMIENTO[0]
    let fy = fuerza[i * 3 + 1] + (b.flujo[i * 3 + 1] + en.viento[1] - v[i * 3 + 1]) * BRASAS.flujo.sigue + DE_AFUERA[1] + DEL_MOVIMIENTO[1]
    const fz = fuerza[i * 3 + 2] + (b.flujo[i * 3 + 2] + en.viento[2] - v[i * 3 + 2]) * BRASAS.flujo.sigue + DE_AFUERA[2] + DEL_MOVIMIENTO[2]
    const gana = DE_AFUERA[3] + DEL_MOVIMIENTO[3]
    // [PULIDO 18] P1.a · el piso, un límite real: en la banda sobre el mínimo el colchón las levanta, lo que bajan se frena y lo que
    // corren de costado roza (se deslizan); más abajo del mínimo, nunca.
    const sobre = y - en.piso - PISO.minimo
    let roza = 1
    if (sobre < PISO.banda) {
      const s = 1 - Math.max(0, sobre) / PISO.banda
      fy += PISO.empuje * s * s
      if (v[i * 3 + 1] < 0) v[i * 3 + 1] *= Math.exp(-PISO.frena * s * dt)
      roza = Math.exp(-PISO.roce * s * dt)
    }
    let vx = (v[i * 3] + fx * dt) * frena * roza
    let vy = (v[i * 3 + 1] + fy * dt) * frena
    let vz = (v[i * 3 + 2] + fz * dt) * frena * roza
    const rap = Math.sqrt(vx * vx + vy * vy + vz * vz)
    if (rap > F.tope) {
      vx *= F.tope / rap
      vy *= F.tope / rap
      vz *= F.tope / rap
    }
    v[i * 3] = vx
    v[i * 3 + 1] = vy
    v[i * 3 + 2] = vz
    lugar[i * 3] = x + vx * dt
    lugar[i * 3 + 1] = Math.max(y + vy * dt, en.piso + PISO.minimo)
    lugar[i * 3 + 2] = z + vz * dt
    if (lugar[i * 3 + 1] <= en.piso + PISO.minimo && v[i * 3 + 1] < 0) v[i * 3 + 1] = 0
    energia[i] = Math.min(1, reposo + (energia[i] - reposo) * enfria + gana)
  }
  envolverYVivir(b, en, dt, azar)
}

/** [PULIDO 19] Q1.b/c · el envoltorio del dominio (la que salió reaparece con la vida en 0: el evento) y la vida que persigue el alfa con tope. */
function envolverYVivir(b: Brasas, en: EntradaDeLasBrasas, dt: number, azar: () => number): void {
  b.eventos.fill(0)
  const d = en.dominio
  if (d === null) return
  const tope = dt / DOMINIO.fundidoS
  for (let i = 0; i < b.n; i += 1) {
    if (envolver(d, b, i, azar)) {
      b.eventos[i] = 1
      b.vida[i] = 0
      // Su pareja quedó del otro lado del dominio: sin el enlace (el resorte la arrastraría por toda la pantalla).
      desenlazar(b, i)
      continue
    }
    // Mudándose (el reparto), se apaga: su alfa es 0 hasta que nace en su celda nueva. El alfa se lee de `EN_EL_DOMINIO` (una llamada
    // que devuelve un número encaja un HeapNumber por brasa si no se inlinea: 800 por cuadro).
    let alfa = 0
    if (b.migra[i] !== 1) {
      alfaDe(d, b.lugar, i * 3)
      alfa = EN_EL_DOMINIO.alfa
    }
    b.vida[i] += Math.max(-tope, Math.min(tope, alfa - b.vida[i]))
  }
}

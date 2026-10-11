import { ESPECIE, ESPECIES, cargaDe, type Particulas } from '../especies'

/**
 * [PULIDO 16] N2 · LA FÍSICA DEL GAS (`docs/rediseno/PLASMA.md`: el modelo y sus constantes). Entre las partículas:
 *   · COULOMB SUAVIZADO entre cargas (las opuestas se atraen, las iguales se repelen): k·qi·qj·r/(r²+ε²)^(3/2), con un corte suave
 *     a cero en el alcance de la grilla; un átomo neutro cerca de una carga se POLARIZA (una atracción débil).
 *   · UNA REPULSIÓN DE CORTO ALCANCE entre todas (como la de Lennard-Jones, acotada): no colapsan.
 *   · ENLACES: dos átomos cerca y lentos forman una MOLÉCULA; un ion y un electrón, un PAR LIGADO. Un resorte que VIBRA (su largo
 *     de reposo late) con poca amortiguación. Se rompen con la temperatura local (la global más la agitación del par), como una
 *     reacción de Arrhenius, o estirados de más; el par ligado, en calma, RECOMBINA (el ion captura su electrón: un destello).
 *   · AFUERA: el logo es una carga positiva que LATE (más fuerte con su pulso); el puntero, una carga sobre su rayo; el frente de
 *     cada anillo del pulso empuja el gas hacia afuera; la agitación térmica crece con la temperatura; la cáscara las contiene.
 * INTEGRACIÓN: semi-implícita (primero la velocidad, después el lugar), a paso fijo de 1/120 s con subpasos (a lo sumo 4 por
 * cuadro: con un cuadro largo no se dispara). Las fuerzas, por una grilla de celdas del alcance: lineal en la cantidad, no O(n²).
 * Sin reservas por paso: todo vive en arreglos fijos. Pura (sin three ni el DOM: la prueba la corre en Node).
 * Este módulo: las constantes, el estado, la grilla y el campo; las fuerzas y la integración, `integracion.ts`; los enlaces que se
 * rompen, la recombinación y la ionización térmica, `reacciones.ts`.
 */
export const FISICA = {
  /** El paso fijo (s) y cuántos subpasos como mucho por cuadro. */
  paso: 1 / 120,
  subpasosMaximos: 4,
  /** El alcance de las fuerzas entre partículas y el lado de la celda de la grilla (u). */
  alcance: 3,
  /** Coulomb: la constante y el suavizado (u). */
  coulomb: { k: 1.1, suavizado: 0.32 },
  /** La repulsión de corto alcance: debajo de `sigma` (u), con su fuerza (acotada en `minimo`). */
  repulsion: { sigma: 0.42, fuerza: 8, minimo: 0.1 },
  /** Un átomo neutro cerca de una carga: la atracción de la polarización (débil). */
  polarizacion: 0.12,
  /** Por especie (vacío, átomo, ion, electrón): la amortiguación (1/s) y el tope de rapidez (u/s). */
  arrastre: [0, 1.15, 1, 2.1],
  tope: [0, 2.4, 2.4, 6.5],
  /** La agitación térmica (u/s²): la base, lo que suma la temperatura, y cuánto más se agitan los electrones. */
  agitacion: { base: 0.3, calor: 1.4, electron: 2.4 },
  /** El resorte que las devuelve a la cáscara. */
  contencion: 1.6,
  /** El logo: su carga (+), el suavizado (u: no es un punto, mide ~7) y cuánto sube con su pulso (`latido`, 0–1). */
  logo: { carga: 2.4, suavizado: 3.4, latido: 0.6 },
  /** El puntero, una carga (+) sobre su rayo: su alcance (u), su carga, el rechazo pegado al rayo y hasta dónde rompe enlaces. */
  puntero: { alcance: 4.6, carga: 4.2, cerca: 0.6, rompe: 2.6 },
  /** El frente de un anillo del pulso del logo empuja el gas hacia afuera (en el plano del piso). */
  anillo: { empuje: 2.6 },
  enlace: {
    /**
     * Dos átomos: a qué distancia se forma (u) y con qué rapidez relativa como mucho (u/s, en calma; caliente, menos); su resorte,
     * rígido (su frecuencia propia, ~2,4 Hz, está arriba del latido: el largo sigue al latido y se ve vibrar; con el paso de 1/120 s,
     * estable), su latido y lo que aguanta.
     */
    molecula: { forma: 0.62, lentos: 0.9, reposo: 0.55, resorte: 110, amortigua: 1.2, vibra: { hz: 1.4, amplitud: 0.13 }, energia: 0.55, rompe: 1.9 },
    /** Un ion y un electrón: lo mismo (el electrón, liviano, late más rápido), más la recombinación (por segundo, en calma: `× (1 − T)²`). */
    ligado: { forma: 0.85, lentos: 2.4, reposo: 0.62, resorte: 40, amortigua: 0.5, vibra: { hz: 1.9, amplitud: 0.11 }, energia: 0.42, rompe: 2.1, recombina: 0.16 },
    /** El intento de romperse (1/s, Arrhenius) y el rato sin volver a enlazarse (s). */
    frecuencia: 2.5,
    enfria: [1.5, 4],
  },
  /** Muy caliente, un átomo se ioniza solo: por segundo y por átomo, `tasa · (T − desde)²`. */
  ionizacionTermica: { desde: 0.45, tasa: 0.12 },
} as const

export const ENLACE = { ninguno: 0, molecula: 1, ligado: 2 } as const

/** El rayo del puntero, relativo al centro del logo: el origen (la cámara) y la dirección (unitaria). */
export interface RayoDelPuntero {
  readonly ox: number
  readonly oy: number
  readonly oz: number
  readonly dx: number
  readonly dy: number
  readonly dz: number
}

/** Lo que el gas recibe de afuera en cada cuadro. */
export interface EntradaDelGas {
  /** La temperatura (0–1), el reloj (s), el latido del logo (0–1) y la carga del puntero (veces la suya; con el botón apretado, crece). */
  temperatura: number
  tiempo: number
  latido: number
  cargaDelPuntero: number
  rayo: RayoDelPuntero | null
  /** Los anillos vivos del pulso (nace, duración, alcance, amplitud) × 4, como los de la escena; `NACE_EN`, el radio con que nacen. */
  readonly anillos: Float32Array
  naceEn: number
}

export interface Gas {
  readonly p: Particulas
  readonly pareja: Int32Array
  readonly tipo: Uint8Array
  readonly fase: Float32Array
  readonly enfriado: Float32Array
  readonly cabeza: Int32Array
  readonly siguiente: Int32Array
  acumulado: number
  /** El reloj de la física (s, con los subpasos). */
  reloj: number
  /** Cuántos pares miró la grilla en el último subpaso (la prueba: lineal en la cantidad). */
  paresMirados: number
  readonly cuenta: { moleculas: number; ligados: number; rotos: number }
}

export const LADO = Math.ceil((2 * (ESPECIES.volumen.radio * ESPECIES.seVaMasAllaDe + FISICA.alcance)) / FISICA.alcance)
const MITAD = (LADO * FISICA.alcance) / 2

export function crearGas(p: Particulas): Gas {
  return {
    p,
    pareja: new Int32Array(p.n).fill(-1),
    tipo: new Uint8Array(p.n),
    fase: new Float32Array(p.n),
    enfriado: new Float32Array(p.n),
    cabeza: new Int32Array(LADO * LADO * LADO),
    siguiente: new Int32Array(p.n),
    acumulado: 0,
    reloj: 0,
    paresMirados: 0,
    cuenta: { moleculas: 0, ligados: 0, rotos: 0 },
  }
}

export function crearEntrada(): EntradaDelGas {
  return { temperatura: 0.14, tiempo: 0, latido: 0, cargaDelPuntero: 1, rayo: null, anillos: new Float32Array(16), naceEn: 3.6 }
}

export const celda = (v: number): number => Math.min(LADO - 1, Math.max(0, Math.floor((v + MITAD) / FISICA.alcance)))

/** ¿Cuenta en la física? (vive y no se está fundiendo en un ion). */
export const vivo = (p: Particulas, i: number): boolean => p.especie[i] !== ESPECIE.vacio && p.capturadoPor[i] < 0

/** Arma la grilla con las partículas vivas: una lista por celda (la cabeza y el siguiente). */
export function armarLaGrilla(g: Gas): void {
  const { p } = g
  g.cabeza.fill(-1)
  for (let i = 0; i < p.n; i += 1) {
    if (!vivo(p, i)) continue
    const k = (celda(p.lugar[i * 3]) * LADO + celda(p.lugar[i * 3 + 1])) * LADO + celda(p.lugar[i * 3 + 2])
    g.siguiente[i] = g.cabeza[k]
    g.cabeza[k] = i
  }
}

/** Visita las partículas de las celdas alrededor de (x, y, z) hasta `radio` (u, ≤ alcance). `visitar` devuelve true para cortar. */
export function cerca(g: Gas, x: number, y: number, z: number, visitar: (i: number) => boolean | undefined): void {
  const cx = celda(x)
  const cy = celda(y)
  const cz = celda(z)
  for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1)
    for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1)
      for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1)
        for (let j = g.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = g.siguiente[j]) if (visitar(j) === true) return
}

/** El corte suave de las fuerzas entre partículas: 1 cerca, 0 en el alcance (sin escalón). */
export const corte = (r: number): number => {
  const u = 1 - (r * r) / (FISICA.alcance * FISICA.alcance)
  return u > 0 ? u * u : 0
}

/**
 * El campo eléctrico en (x, y, z) en `destino` (relativo al centro): las cargas de la grilla cercana (Coulomb suavizado con su corte),
 * el logo (en el centro) y el puntero (en su rayo). Lo usan los arcos (el camino sigue al campo) y las líneas de campo.
 */
export function campoEn(g: Gas, e: EntradaDelGas, x: number, y: number, z: number, destino: Float32Array): void {
  const { p } = g
  const C = FISICA.coulomb
  let ex = 0
  let ey = 0
  let ez = 0
  const cx = celda(x)
  const cy = celda(y)
  const cz = celda(z)
  for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1)
    for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1)
      for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1)
        for (let j = g.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = g.siguiente[j]) {
          const q = cargaDe(p, j)
          if (q === 0) continue
          const dx = x - p.lugar[j * 3]
          const dy = y - p.lugar[j * 3 + 1]
          const dz = z - p.lugar[j * 3 + 2]
          const r2 = dx * dx + dy * dy + dz * dz
          const f = (C.k * q * corte(Math.sqrt(r2))) / (r2 + C.suavizado * C.suavizado) ** 1.5
          ex += f * dx
          ey += f * dy
          ez += f * dz
        }
  // El logo, una carga positiva suavizada en el centro.
  const L = FISICA.logo
  const r2l = x * x + y * y + z * z
  const fl = (L.carga * (1 + L.latido * e.latido)) / (r2l + L.suavizado * L.suavizado) ** 1.5
  ex += fl * x
  ey += fl * y
  ez += fl * z
  // El puntero, en el punto de su rayo más cercano.
  if (e.rayo !== null) {
    const d = distanciaAlRayo(x, y, z, e.rayo, PUNTO)
    const P = FISICA.puntero
    const fp = (P.carga * e.cargaDelPuntero) / (d * d + P.cerca * P.cerca) ** 1.5
    ex += fp * (x - PUNTO[0])
    ey += fp * (y - PUNTO[1])
    ez += fp * (z - PUNTO[2])
  }
  destino[0] = ex
  destino[1] = ey
  destino[2] = ez
}

const PUNTO = new Float32Array(3)

/** La distancia de (x, y, z) al rayo (u) y el punto del rayo más cercano, en `punto`. */
export function distanciaAlRayo(x: number, y: number, z: number, r: RayoDelPuntero, punto: Float32Array): number {
  const t = Math.max(0, (x - r.ox) * r.dx + (y - r.oy) * r.dy + (z - r.oz) * r.dz)
  punto[0] = r.ox + r.dx * t
  punto[1] = r.oy + r.dy * t
  punto[2] = r.oz + r.dz * t
  return Math.hypot(x - punto[0], y - punto[1], z - punto[2])
}

/** El frente de un anillo del pulso (la cuenta del piso, `entorno/Pulso.tsx`): cuánto empuja a la distancia horizontal `r`. */
export function anilloEn(nace: number, duracion: number, alcance: number, amplitud: number, naceEn: number, tiempo: number, r: number): number {
  if (amplitud <= 0) return 0
  const t = (tiempo - nace) / duracion
  if (t < 0 || t > 1) return 0
  const frente = naceEn + (alcance - naceEn) * (1 - (1 - t) ** 2.2)
  const ancho = 0.35 + 1.4 * t * (alcance / 26)
  const d = (r - frente) / ancho
  return Math.exp(-d * d) * (1 - t) ** 1.8 * Math.min(1, t / 0.06) * amplitud
}

/** La carga más cercana a (x, y, z) dentro de `radio` (u), sin `excluir`; −1 si no hay. Para las ramas de los arcos. */
export function cargaCercana(g: Gas, x: number, y: number, z: number, radio: number, excluir: number): number {
  let mejor = -1
  let d2 = radio * radio
  const { p } = g
  const cx = celda(x)
  const cy = celda(y)
  const cz = celda(z)
  for (let ax = Math.max(0, cx - 1); ax <= Math.min(LADO - 1, cx + 1); ax += 1)
    for (let ay = Math.max(0, cy - 1); ay <= Math.min(LADO - 1, cy + 1); ay += 1)
      for (let az = Math.max(0, cz - 1); az <= Math.min(LADO - 1, cz + 1); az += 1)
        for (let j = g.cabeza[(ax * LADO + ay) * LADO + az]; j >= 0; j = g.siguiente[j]) {
          if (j === excluir || cargaDe(p, j) === 0) continue
          const d = (p.lugar[j * 3] - x) ** 2 + (p.lugar[j * 3 + 1] - y) ** 2 + (p.lugar[j * 3 + 2] - z) ** 2
          if (d < d2) {
            d2 = d
            mejor = j
          }
        }
  return mejor
}

import type * as THREE from 'three'

/**
 * [PULIDO 17] O3 · LA TEMPERATURA DE LA ESCENA — el puente entre la energía y lo que hace el usuario (`docs/rediseno/PLASMA.md`;
 * viene de PULIDO 16 sin cambios en su modelo). Un número de 0 (calma) a 1: SUBE con la velocidad del scroll, con las ondas del logo
 * (los anillos del pulso y el principal), con el golpe del pie, con el clic y con la descarga del puntero; BAJA sola. Caliente: más
 * rápido el campo, más energía en cada partícula, más arcos. EL AUTOLÍMITE: se satura con una tangente hiperbólica (nunca pasa del
 * techo), calentar cuesta más cuanto más caliente está y se enfría más rápido cuanto más caliente está. Puro (Node).
 */
export const TEMPERATURA = {
  base: 0.14,
  techo: 1,
  /** En cuánto vuelve a la calma (s; más rápido cuanto más caliente: `baja / (1 + valor)`). */
  baja: 2.6,
  /** El scroll: cuánto calienta por segundo cada pantalla por segundo, y desde cuántas pantallas por segundo ya no suma. */
  scroll: { porPantalla: 0.55, tope: 4 },
  /** De una vez: un anillo del pulso del logo (por su amplitud), el principal, el clic, la descarga, un arco. */
  anillo: 0.06,
  principal: 0.12,
  pulso: 0.35,
  descarga: 0.45,
  arco: 0.012,
  /** El suavizado de la velocidad del scroll (s), el latido del logo después de su pulso principal (s) y cuánto antes y después del golpe del final está más activo. */
  suavizaScrollS: 0.12,
  latidoS: 0.55,
  cercaDelGolpe: 0.12,
} as const

export interface Temperatura {
  crudo: number
  valor: number
}

export function crearTemperatura(): Temperatura {
  return { crudo: TEMPERATURA.base, valor: TEMPERATURA.base }
}

const saturar = (crudo: number): number => TEMPERATURA.techo * Math.tanh(Math.max(0, crudo) / TEMPERATURA.techo)

/** Calienta de una vez: cuesta más cuanto más caliente está (lo que falta hasta el techo). */
export function calentar(t: Temperatura, cuanto: number): void {
  t.crudo += cuanto * Math.max(0, 1 - t.valor / TEMPERATURA.techo)
  t.valor = saturar(t.crudo)
}

/** Un paso: el scroll calienta (pantallas por segundo) y lo acumulado vuelve a la calma. */
export function pasoDeLaTemperatura(t: Temperatura, dt: number, pantallasPorSegundo: number): void {
  const s = TEMPERATURA.scroll
  calentar(t, s.porPantalla * Math.min(Math.abs(pantallasPorSegundo), s.tope) * dt)
  const tau = TEMPERATURA.baja / (1 + t.valor)
  t.crudo = TEMPERATURA.base + (t.crudo - TEMPERATURA.base) * Math.exp(-dt / tau)
  t.valor = saturar(t.crudo)
}

/** Fuerza la temperatura (el banco: la escena caliente para medir y capturar). */
export function ponerTemperatura(t: Temperatura, valor: number): void {
  const v = Math.min(TEMPERATURA.techo * 0.999, Math.max(0, valor))
  t.crudo = TEMPERATURA.techo * Math.atanh(v / TEMPERATURA.techo)
  t.valor = v
}

/** Lo que la escena dice en cada cuadro (un solo objeto, reescrito). */
export interface DeLaEscena {
  dt: number
  scroll: number
  alto: number
  /** La hora de la escena (s: la de los anillos) y los anillos del pulso del logo: (nace, duración, alcance, amplitud). */
  tiempo: number
  anillos: readonly THREE.Vector4[]
  naceEn: number
  ultimoPrincipal: number
  /** El final del pie: cuánto avanzó (0 a 1) y dónde cae el golpe. */
  fin: number
  golpe: number
}

/** La memoria de un cuadro al otro y lo que sale de leer la escena. */
export interface Lectura {
  scroll: number
  velocidad: number
  principal: number
  /** Cuándo nacieron los anillos que ya calentaron (en doble precisión: compararlos con los de la escena tiene que dar igual). */
  readonly anillos: Float64Array
  fin: number
  /** Lo que sale: el latido del logo (0 a 1), cuánto más activo está (el latido o cerca del golpe) y si el golpe cayó en este cuadro. */
  latido: number
  actividadDelLogo: number
  golpeAhora: boolean
}

export function crearLectura(): Lectura {
  return { scroll: Number.NaN, velocidad: 0, principal: Number.NEGATIVE_INFINITY, anillos: new Float64Array(4).fill(Number.NaN), fin: 0, latido: 0, actividadDelLogo: 0, golpeAhora: false }
}

/** Lee la escena y calienta: el scroll (pantallas por segundo, suavizado), un anillo nuevo (por su amplitud), el principal y el golpe del final. */
export function leerLaEscena(T: Temperatura, m: Lectura, s: DeLaEscena): void {
  const v = Number.isFinite(m.scroll) && s.dt > 0 ? Math.abs(s.scroll - m.scroll) / s.dt / Math.max(1, s.alto) : 0
  m.scroll = s.scroll
  m.velocidad += (v - m.velocidad) * (1 - Math.exp(-s.dt / TEMPERATURA.suavizaScrollS))
  for (let k = 0; k < 4; k += 1) {
    const a = s.anillos[k]
    if (a === undefined) continue
    if (a.w > 0 && a.x !== m.anillos[0] && a.x !== m.anillos[1] && a.x !== m.anillos[2] && a.x !== m.anillos[3]) calentar(T, TEMPERATURA.anillo * a.w)
  }
  for (let k = 0; k < 4; k += 1) m.anillos[k] = s.anillos[k] === undefined || s.anillos[k].w <= 0 ? Number.NaN : s.anillos[k].x
  if (s.ultimoPrincipal > m.principal) {
    if (Number.isFinite(m.principal)) calentar(T, TEMPERATURA.principal)
    m.principal = s.ultimoPrincipal
  }
  m.latido = Number.isFinite(m.principal) && s.tiempo >= m.principal ? Math.exp(-(s.tiempo - m.principal) / TEMPERATURA.latidoS) : 0
  const cerca = s.fin > 0 ? Math.max(0, 1 - Math.abs(s.fin - s.golpe) / TEMPERATURA.cercaDelGolpe) : 0
  m.golpeAhora = m.fin < s.golpe && s.fin >= s.golpe
  if (m.golpeAhora) calentar(T, TEMPERATURA.descarga)
  m.fin = s.fin
  m.actividadDelLogo = Math.max(m.latido, cerca)
  pasoDeLaTemperatura(T, s.dt, m.velocidad)
}

/**
 * Los frentes de las ondas del logo (los anillos del pulso, como los dibuja `entorno/Pulso.tsx`): por anillo, a cuánto del centro
 * está su cresta (u) y su fuerza (0: ninguno), en `destino` (2 por anillo).
 */
export function frentesDelLogo(anillos: readonly THREE.Vector4[], tiempo: number, naceEn: number, destino: Float32Array): void {
  for (let k = 0; k < 4; k += 1) {
    const a = anillos[k]
    destino[k * 2] = 0
    destino[k * 2 + 1] = 0
    if (a === undefined || a.w <= 0 || a.y <= 0) continue
    const t = (tiempo - a.x) / a.y
    if (t < 0 || t > 1) continue
    destino[k * 2] = naceEn + (a.z - naceEn) * (1 - (1 - t) ** 2.2)
    destino[k * 2 + 1] = (1 - t) ** 1.8 * Math.min(1, t / 0.06) * a.w
  }
}

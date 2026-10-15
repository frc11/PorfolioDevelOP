import { BRASAS, desenlazar, type Brasas } from './brasas'
import { CELDAS_DEL_REPARTO, DOMINIO, EN_EL_DOMINIO, alAzarALaVista, alAzarEnLaVista, alfaDe, celdaDelCuadro, coordenadasDe, objetivosDelReparto, type Dominio } from './dominio'

/**
 * [PULIDO 27] Z1 · LA POBLACIÓN: NADA APARECE NI DESAPARECE DE LA NADA Y LA DENSIDAD A LA VISTA ES PAREJA. Antes había siempre las mismas
 * brasas en el dominio de la vista y cuántas se veían dependía del encuadre (medido en el sitio: de 350 vivas en Por qué develOP a 611 en
 * Quiénes somos; el piso y la profundidad cambian cuánto del dominio queda a la vista), y el reparto apagaba y prendía decenas por
 * segundo aun en reposo (las que sobraban en una celda se fundían y renacían en otra). Ahora hay un OBJETIVO (la vida sumada de las que
 * están en el cuadro, la misma en toda sección y en todo viaje) y una RESERVA (brasas ocultas, quietas y fuera de todo). Si faltan, NACEN
 * en la celda más vacía (de un punto, crecen de más con un destello y se acomodan: el sombreador, por `nace`); si sobran, MUEREN en la
 * más llena con una mini explosión (chispas cortas que se apagan, `dibujo/efectos.ts`) y vuelven a la reserva. Con una banda muerta (un
 * vaivén no corrige nada) y a su RITMO: con la cámara quieta, de a pocas (en reposo casi nada nace ni muere); en un viaje, rápido. Una
 * celda muy vacía mientras otra está muy llena se equilibra de a una y despacio (una muerte allá, un nacimiento acá). Nunca muere una
 * que está en la red, en un arco o naciendo. Puro (Node), sin reservas por cuadro.
 */
export const POBLACION = {
  /**
   * El objetivo: la vida sumada de las brasas en el cuadro (en escritorio y en el teléfono). Quietas, la mitad de las activas queda fuera
   * de la vista (los márgenes, el fondo): con la reserva entera (`DIRECCIONES`) alcanza en todo encuadre.
   */
  objetivo: [420, 130],
  /** La banda muerta (fracción del objetivo): empieza a corregir afuera de `afuera` y deja de corregir adentro de `adentro`. */
  banda: { afuera: 0.06, adentro: 0.02 },
  /**
   * El ritmo (por segundo como mucho): con la cámara quieta, de a pocas (que no se note); andando (un viaje) o lejos del objetivo (al
   * llegar), más; desde qué velocidad de la cámara (u/s) anda y desde qué parte del objetivo está lejos.
   */
  ritmo: { quieta: 4, andando: 120, desde: 1.5, lejos: 0.15 },
  /**
   * El equilibrio entre celdas (una mudanza: una muerte en la más llena y un nacimiento en la más vacía): desde qué fracción de lo que le
   * toca una celda está vacía y llena, quieta (sólo un desparejo fuerte) y yendo rápido (al alejarse la cámara las brasas quedan juntas en
   * el medio del cuadro nuevo: se reparten enseguida), y por cuánta vida como mínimo.
   */
  equilibrio: { fuerte: [0.3, 1.8], suave: [0.6, 1.4], sobra: 2 },
  /** El nacimiento: cuánto dura (s), hasta cuánto crece (veces su tamaño), en qué parte del nacimiento llega ahí y su destello. */
  nace: { s: 0.45, crece: 1.3, pico: 0.38, destello: 1.4 },
  /**
   * El CORTE: la cámara saltó en un cuadro (un viaje del navbar que pasa bajo el papel opaco, donde la escena se pausa, y sigue en otra
   * sección): desde qué salto (en focos). Las que se envuelven por el salto no explotan (no se iban: se cortó la toma); la vista nueva se
   * siembra de nuevo, justa para el objetivo, y aparece en `apareceS` (antes llegaban todas de golpe y después morían cientos).
   */
  corte: { salto: 0.25, apareceS: 0.4 },
  /** La explosión: cuántas a la vez, cuánto dura (s), su radio (u) y desde qué brillo una que se va de la vista explota. */
  explosion: { cuantas: 64, s: 0.4, radio: 0.26, desde: 0.15 },
} as const

/** Dónde esperan las de la reserva (lejos de todo: ningún arco, ninguna vecina, fuera de la vista). */
const RESERVA_Y = -1e4

export interface Poblacion {
  /** El objetivo y si está corrigiendo (1: faltan; −1: sobran; 0: en la banda). */
  objetivo: number
  corrige: number
  /** Lo medido en el último cuadro: la vida sumada en el cuadro y cuántas están fuera de la reserva. */
  presentes: number
  activas: number
  /** Por celda del cuadro: la vida sumada, lo que le toca del objetivo y una brasa que puede morir (−1: ninguna). */
  readonly vista: Float32Array
  readonly toca: Float32Array
  readonly candidata: Int32Array
  /** Las explosiones: (x, y, z, desde (s), brillo, 0) × `cuantas`; las libres, desde − ∞. */
  readonly explosiones: Float32Array
  /** Por dónde va la búsqueda en la reserva, el reloj del cuadro anterior (s), lo acumulado del ritmo, si va rápido y la vuelta (sobrando, una mudanza cada tres). */
  cursor: number
  antes: number
  credito: number
  rapido: boolean
  vuelta: number
  /** El corte de este cuadro (`antesDelPaso`) y cuánto apareció la siembra nueva (0 a 1; 1: nada que aparecer). */
  corte: boolean
  aparece: number
  /** Las cuentas (el banco, las pruebas). */
  nacidas: number
  muertas: number
  mudanzas: number
}

export function crearPoblacion(compacto: boolean): Poblacion {
  const explosiones = new Float32Array(POBLACION.explosion.cuantas * 6)
  for (let k = 0; k < POBLACION.explosion.cuantas; k += 1) explosiones[k * 6 + 3] = Number.NEGATIVE_INFINITY
  return {
    objetivo: POBLACION.objetivo[compacto ? 1 : 0], corrige: 0, presentes: 0, activas: 0,
    vista: new Float32Array(CELDAS_DEL_REPARTO), toca: new Float32Array(CELDAS_DEL_REPARTO), candidata: new Int32Array(CELDAS_DEL_REPARTO).fill(-1),
    explosiones, cursor: 0, antes: Number.NaN, credito: 0, rapido: false, vuelta: 0, corte: false, aparece: 1, nacidas: 0, muertas: 0, mudanzas: 0,
  }
}

/** Saca la brasa `i` de la reserva donde ya la puso un `alAzar…`: con la vida de ese lugar. */
function activar(d: Dominio, b: Brasas, i: number): void {
  b.oculta[i] = 0
  for (let e = 0; e < 3; e += 1) b.velocidad[i * 3 + e] = 0
  alfaDe(d, b.lugar, i * 3)
  b.vida[i] = EN_EL_DOMINIO.alfa
}

/** Manda la brasa `i` a la reserva: sin vida, sin enlace, quieta y lejos. */
function ocultar(b: Brasas, i: number): void {
  b.oculta[i] = 1
  b.vida[i] = 0
  b.brillo[i] = 0
  desenlazar(b, i)
  for (let e = 0; e < 3; e += 1) b.velocidad[i * 3 + e] = 0
  b.lugar[i * 3] = 0
  b.lugar[i * 3 + 1] = RESERVA_Y
  b.lugar[i * 3 + 2] = 0
}

/**
 * La siembra (el primer cuadro con cámara, sin efectos: la página arranca con el plasma puesto): cada celda del cuadro hasta lo que le
 * toca del objetivo (por el aire que mira; las del piso cercano, también), y los márgenes en su proporción por área (fuera del cuadro:
 * de ahí entran); las demás, a la reserva.
 */
export function sembrar(p: Poblacion, d: Dominio, b: Brasas, azar: () => number): void {
  objetivosDelReparto(d, p.objetivo, p.toca)
  p.vista.fill(0)
  let i = 0
  for (let k = 0; k < p.toca.length; k += 1) {
    // Hasta media brasa antes de lo que le toca: la última, en promedio, completa (si no, cada celda se pasaba hasta una entera).
    while (i < b.n && p.vista[k] < p.toca[k] - 0.5 && alAzarEnLaVista(d, b, i, k, azar)) {
      activar(d, b, i)
      p.vista[k] += b.vida[i]
      i += 1
    }
  }
  const m = 1 + DOMINIO.margen
  const margen = Math.round(i * (m * m - 1))
  for (let q = 0; q < margen && i < b.n; q += 1) {
    if (!alAzarEnLaVista(d, b, i, -3, azar)) continue
    activar(d, b, i)
    i += 1
  }
  for (; i < b.n; i += 1) ocultar(b, i)
}

/** Una explosión en `L[o..o+2]` con ese brillo, si hay un lugar libre (si no, `false`: la que iba a morir espera). */
export function explotar(p: Poblacion, L: Float32Array, o: number, brillo: number, ahora: number): boolean {
  const X = p.explosiones
  for (let k = 0; k < POBLACION.explosion.cuantas; k += 1) {
    // Ocupada si empezó hace menos de lo que dura (el reloj, en float32: con un margen; uno que volvió atrás, libre).
    const edad = ahora - X[k * 6 + 3]
    if (edad > -1e-3 && edad < POBLACION.explosion.s) continue
    X[k * 6] = L[o]
    X[k * 6 + 1] = L[o + 1]
    X[k * 6 + 2] = L[o + 2]
    X[k * 6 + 3] = ahora
    X[k * 6 + 4] = brillo
    return true
  }
  return false
}

/** Lo de este cuadro: la vida sumada por celda y en total, cuántas están activas y, por celda, una que puede morir. */
function medir(p: Poblacion, d: Dominio, b: Brasas, ahora: number, enRed: Uint8Array | null, ocupadas: Uint8Array): void {
  p.vista.fill(0)
  p.candidata.fill(-1)
  let presentes = 0
  let activas = 0
  for (let i = 0; i < b.n; i += 1) {
    if (b.oculta[i] === 1) continue
    activas += 1
    const k = celdaDelCuadro(d, coordenadasDe(d, b.lugar, i * 3))
    if (k < 0) continue
    p.vista[k] += b.vida[i]
    presentes += b.vida[i]
    if (b.vida[i] > 0.5 && ocupadas[i] === 0 && (enRed === null || enRed[i] === 0) && ahora - b.nace[i] > POBLACION.nace.s) p.candidata[k] = i
  }
  p.presentes = presentes
  p.activas = activas
}

/**
 * La celda más vacía (entre las que piden al menos media brasa) y la más llena (entre las que tienen una que puede morir): por lo que le
 * falta o le sobra de vida, sobre la raíz de lo que le toca (ni sólo lo absoluto, que nunca elige una celda chica, ni sólo la fracción, que
 * elige siempre las chicas), y antes que nada una casi vacía; −1 si ninguna.
 */
function masVacia(p: Poblacion): number {
  let k = -1
  let peor = 0
  for (let c = 0; c < p.vista.length; c += 1) {
    if (p.toca[c] < 0.5) continue
    // Una celda casi vacía (menos de un cuarto de lo suyo) primero, sea chica o grande: un hueco se ve.
    const falta = p.vista[c] < 0.25 * p.toca[c] ? 100 - p.vista[c] / p.toca[c] : (p.toca[c] - p.vista[c]) / Math.sqrt(p.toca[c])
    if (k < 0 || falta > peor) {
      k = c
      peor = falta
    }
  }
  return k
}

function masLlena(p: Poblacion): number {
  let k = -1
  let peor = 0
  for (let c = 0; c < p.vista.length; c += 1) {
    if (p.candidata[c] < 0) continue
    const sobra = (p.vista[c] - p.toca[c]) / Math.sqrt(Math.max(0.25, p.toca[c]))
    if (k < 0 || sobra > peor) {
      k = c
      peor = sobra
    }
  }
  return k
}

/** Una de la reserva (si no queda, una activa que no se ve: fuera del cuadro y apagada); −1 si ninguna. */
function deLaReserva(p: Poblacion, d: Dominio, b: Brasas): number {
  for (let paso = 0; paso < b.n; paso += 1) {
    const i = (p.cursor + paso) % b.n
    if (b.oculta[i] === 1 || (b.vida[i] < 0.02 && b.pareja[i] < 0 && celdaDelCuadro(d, coordenadasDe(d, b.lugar, i * 3)) < 0)) {
      p.cursor = (i + 1) % b.n
      return i
    }
  }
  return -1
}

/** Nace una en la celda `celda` (o en la más vacía): de la reserva, en un lugar al azar de esa celda donde se vea entera, con su nacimiento. */
function nacer(p: Poblacion, d: Dominio, b: Brasas, ahora: number, azar: () => number, celda: number): boolean {
  const k = celda >= 0 ? celda : masVacia(p)
  const i = k < 0 ? -1 : deLaReserva(p, d, b)
  if (i < 0) return false
  if (!alAzarALaVista(d, b, i, k, azar) && !alAzarEnLaVista(d, b, i, k, azar) && !alAzarEnLaVista(d, b, i, -1, azar)) return false
  b.oculta[i] = 0
  for (let e = 0; e < 3; e += 1) b.velocidad[i * 3 + e] = 0
  b.energia[i] = BRASAS.energia.base
  desenlazar(b, i)
  alfaDe(d, b.lugar, i * 3)
  b.vida[i] = EN_EL_DOMINIO.alfa
  b.nace[i] = ahora
  b.eventos[i] = 1
  const c = celdaDelCuadro(d, EN_EL_DOMINIO)
  if (c >= 0) {
    p.vista[c] += b.vida[i]
    p.presentes += b.vida[i]
  }
  p.nacidas += 1
  return true
}

/** Muere una de la celda `celda` (o de la más llena): su explosión y a la reserva. Sin lugar para la explosión, espera. */
function morir(p: Poblacion, b: Brasas, ahora: number, celda: number): boolean {
  const k = celda >= 0 ? celda : masLlena(p)
  const i = k < 0 ? -1 : p.candidata[k]
  if (i < 0 || !explotar(p, b.lugar, i * 3, b.brillo[i], ahora)) return false
  p.candidata[k] = -1
  p.vista[k] -= b.vida[i]
  p.presentes -= b.vida[i]
  ocultar(b, i)
  b.eventos[i] = 1
  p.muertas += 1
  return true
}

/** ¿Hay una celda vacía (por la fracción `umbral[0]` y al menos una brasa) y otra llena (por `umbral[1]` y `sobra`) para una mudanza? */
function desparejo(p: Poblacion, umbral: readonly number[]): boolean {
  const S = POBLACION.equilibrio.sobra
  const vacia = masVacia(p)
  const llena = masLlena(p)
  return vacia >= 0 && llena >= 0 && p.vista[vacia] < umbral[0] * p.toca[vacia] && p.toca[vacia] - p.vista[vacia] > 1 && p.vista[llena] > Math.max(umbral[1] * p.toca[llena], p.toca[llena] + S)
}

/** Una mudanza: muere una en la celda más llena y nace otra en la más vacía (la cantidad, igual). */
function mudar(p: Poblacion, d: Dominio, b: Brasas, ahora: number, azar: () => number): boolean {
  const vacia = masVacia(p)
  if (!morir(p, b, ahora, masLlena(p))) return false
  nacer(p, d, b, ahora, azar, vacia)
  p.mudanzas += 1
  return true
}

/**
 * Lo que toca hacer ahora (una vez). Faltan: nace en la celda más vacía. Sobran: muere en la más llena (también empareja) y, si además hay
 * celdas muy vacías, una vez cada tres una mudanza (al alejarse la cámara las brasas quedan juntas en el medio y los bordes vacíos). En
 * la banda y desparejas: una mudanza.
 */
function corregir(p: Poblacion, d: Dominio, b: Brasas, ahora: number, azar: () => number, umbral: readonly number[]): boolean {
  if (p.corrige > 0) return nacer(p, d, b, ahora, azar, -1)
  if (p.corrige < 0) {
    p.vuelta = (p.vuelta + 1) % 3
    return p.vuelta === 0 && desparejo(p, POBLACION.equilibrio.fuerte) ? mudar(p, d, b, ahora, azar) : morir(p, b, ahora, -1)
  }
  return desparejo(p, umbral) && mudar(p, d, b, ahora, azar)
}

/** Antes del paso de las brasas: ¿la cámara saltó en este cuadro (un corte)? */
export function antesDelPaso(p: Poblacion, d: Dominio): void {
  p.corte = d.salto > POBLACION.corte.salto * d.D
}

/** Después del brillo: la siembra nueva de un corte aparece (todas juntas, del brillo 0 al suyo). */
export function aparecer(p: Poblacion, b: Brasas, dt: number): void {
  if (p.aparece >= 1) return
  p.aparece = Math.min(1, p.aparece + Math.max(0, dt) / POBLACION.corte.apareceS)
  const a = p.aparece * p.aparece * (3 - 2 * p.aparece)
  for (let i = 0; i < b.n; i += 1) b.brillo[i] *= a
}

/**
 * El cuadro de la población (después del paso de las brasas): mide; decide con la banda muerta si faltan o sobran y si las celdas están
 * desparejas; y corrige a su ritmo: rápido con la cámara andando (`d.vo`) o lejos del objetivo, y así hasta volver a la banda y a un
 * reparto parejo; quieta, de a pocas y sólo un desparejo fuerte. `enRed`: el grado de cada brasa en la red en reposo; `ocupadas`: las de
 * los arcos vivos.
 */
export function regular(p: Poblacion, d: Dominio, b: Brasas, ahora: number, azar: () => number, enRed: Uint8Array | null, ocupadas: Uint8Array): void {
  const dt = Number.isFinite(p.antes) ? Math.min(0.1, Math.max(0, ahora - p.antes)) : 0
  p.antes = ahora
  // Un corte: la siembra de nuevo (sin efectos: aparece) y sin las explosiones de la toma de antes.
  if (p.corte) {
    sembrar(p, d, b, azar)
    b.eventos.fill(1)
    for (let k = 0; k < POBLACION.explosion.cuantas; k += 1) p.explosiones[k * 6 + 3] = Number.NEGATIVE_INFINITY
    p.aparece = 0
    p.corrige = 0
    p.credito = 0
    return
  }
  medir(p, d, b, ahora, enRed, ocupadas)
  if (objetivosDelReparto(d, p.objetivo, p.toca) === 0) return
  const B = POBLACION.banda
  const R = POBLACION.ritmo
  const E = POBLACION.equilibrio
  const T = p.objetivo
  if (p.corrige === 0) p.corrige = p.presentes < T * (1 - B.afuera) ? 1 : p.presentes > T * (1 + B.afuera) ? -1 : 0
  else if (p.corrige > 0 ? p.presentes >= T * (1 - B.adentro) : p.presentes <= T * (1 + B.adentro)) p.corrige = 0
  const lejos = Math.abs(p.presentes - T)
  p.rapido = d.vo[0] * d.vo[0] + d.vo[1] * d.vo[1] + d.vo[2] * d.vo[2] > R.desde * R.desde || lejos > R.lejos * T || (p.rapido && (lejos > B.afuera * T || desparejo(p, E.suave)))
  const umbral = p.rapido ? E.suave : E.fuerte
  if (p.corrige === 0 && !desparejo(p, umbral)) {
    p.credito = 0
    return
  }
  p.credito = Math.min(3, p.credito + dt * (p.rapido ? R.andando : R.quieta))
  while (p.credito >= 1 && corregir(p, d, b, ahora, azar, umbral)) p.credito -= 1
}

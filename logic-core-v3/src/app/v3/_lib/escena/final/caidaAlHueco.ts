import * as THREE from 'three'

import { FLOOR_Y, ORBIT_TARGET_Y } from '../probeScene'

/**
 * [PULIDO 11] D · EL LOGO SE CAE Y ENCASTRA — la física de la caída del final del pie (pura: la usa `recorridoDelFinal.ts`, que
 * sigue siendo todo función de `fin`, así el rebobinado la recorre al revés y el reinicio la vuelve a correr).
 *
 * Antes el logo se acostaba EN SU LUGAR con una curva (2,2 s), caía derecho y se hundía a presión. Ahora CAE como un cuerpo
 * rígido que vuelca sobre su canto de abajo y de atrás: θ'' = κ·sen(θ − α), el par de la gravedad sobre el centro de masa (α =
 * atan(espesor/alto): parado, el centro de masa está adelante del canto; κ = g·d / (k² + d²), con d la distancia del canto al
 * centro de masa y k el radio de giro de la placa), integrada con Runge-Kutta 4 en pasos de medio milisegundo. Una placa parada
 * sobre su base no vuelca sola: primero se inclina hacia atrás hasta pasar apenas su equilibrio (`inclinaS`, el trayecto de
 * mínimo tirón: termina quieta, así la física arranca del reposo sin salto) y ahí la gravedad se la lleva: duda y después se va,
 * cada vez más rápido. Al tocar, rebota: la velocidad angular se da vuelta y se achica por la restitución, la gravedad lo vuelve
 * a bajar y, cuando el rebote ya no levanta nada, queda asentado. El logo baja PARADO hasta el piso, con el canto en el borde del
 * hueco (también con el trayecto de mínimo tirón: el de una mano que apoya algo), se inclina y cae hacia atrás como una ficha de
 * dominó. [PULIDO 13] · la otra variante (`?caida=angulo`, en arco desde el aire) se borró: ganó esta.
 *
 * El canto queda en el borde del hueco y, en los últimos grados (con el hueco ya abierto), baja por la pared del pozo:
 * termina al ras, centrado. Nada atraviesa el piso: toda la placa queda por encima de su canto mientras gira. El contacto (el
 * logo al ras en el pozo) cae siempre en `golpeS` del reloj: la caída arranca lo que dura antes. Ese cuadro es el del golpe de
 * siempre (el sonido, la súper onda, el filo, el poder). El hueco se abre con el ángulo (sincronizado con la caída) y termina de
 * abrirse justo antes del contacto.
 *
 * Coordenadas: (y, z) del mundo, con la cámara en +z; el logo, una placa de `alto` × `espesor` centrada en su grupo; el ángulo
 * del cuerpo `a` va de 0 (parado) a π/2 (acostado, con la cabeza al fondo): su `rotation.x` es −a.
 */
export const CAIDA_AL_HUECO = {
  /** El contacto: el golpe (s del reloj). */
  golpeS: 3.5,
  /** La gravedad de la escena (u/s²: la de la caída de antes). */
  gravedad: 26,
  /** Cuánto tarda en inclinarse hasta pasar su equilibrio (s). */
  inclinaS: 0.5,
  /** Cuánto tarda en bajar parado (s) y cuánto pasado su equilibrio arranca a caer (grados). */
  lenta: { bajaS: 1.2, pasadoGrados: 1.2 },
  /** La restitución de cada toque (la velocidad angular que le queda, dada vuelta) y debajo de qué velocidad queda asentado (rad/s). */
  rebote: { restitucion: 0.26, asienta: 0.35 },
  /**
   * El hueco: entre qué ángulos del cuerpo se abre (grados); termina antes del contacto (a los 90°). De ahí al contacto el canto
   * baja por la pared del pozo (un espesor): con el hueco ya abierto y en una ventana de ~0,1 s (no se mete de golpe).
   */
  hueco: { desdeGrados: 20, hastaGrados: 62 },
  /** El paso de la integración (s). */
  paso: 1 / 2000,
} as const

/** El tamaño de la placa (u). */
export interface PlacaDelLogo {
  readonly alto: number
  readonly espesor: number
}

/** La caída integrada: el ángulo del cuerpo en cada paso, desde que arranca. */
export interface CaidaIntegrada {
  readonly angulos: Float64Array
  /** Cuándo toca por primera vez (el golpe) y cada toque (s desde que arranca). */
  readonly contactoS: number
  readonly toques: readonly number[]
  /** Desde cuándo queda asentada (s desde que arranca). */
  readonly asentadaS: number
  /** κ, α (rad) y el ángulo de arranque (rad). */
  readonly kappa: number
  readonly alfa: number
  readonly desde: number
}

/** La dinámica del vuelco: κ, α (θ'' = κ·sen(θ − α)) y el ángulo de arranque (apenas pasado α). */
export function dinamicaDe(p: PlacaDelLogo): { readonly kappa: number; readonly alfa: number; readonly desde: number } {
  const k2 = (p.alto * p.alto + p.espesor * p.espesor) / 12
  const d = Math.hypot(p.alto, p.espesor) / 2
  const alfa = Math.atan2(p.espesor, p.alto)
  const pasado = CAIDA_AL_HUECO.lenta.pasadoGrados
  return { kappa: (CAIDA_AL_HUECO.gravedad * d) / (k2 + d * d), alfa, desde: alfa + THREE.MathUtils.degToRad(pasado) }
}

/** La altura del centro del logo al ras en el pozo (u): su cara de arriba al nivel del piso. */
export function centroAlRas(p: PlacaDelLogo): number {
  return FLOOR_Y - p.espesor / 2
}

const CACHE = new Map<string, CaidaIntegrada>()
/** El último pedido (el de cada cuadro): sin armar la clave de texto. */
const ULTIMA = { alto: Number.NaN, espesor: Number.NaN, caida: null as CaidaIntegrada | null }

/**
 * La caída, integrada con RK4 desde el reposo en `desde` hasta asentada (memorizada por tamaño). En cada toque
 * (a = π/2) la velocidad angular se da vuelta por la restitución; si ya no alcanza para levantarlo, queda en π/2.
 */
export function caidaIntegrada(p: PlacaDelLogo): CaidaIntegrada {
  if (ULTIMA.caida !== null && ULTIMA.alto === p.alto && ULTIMA.espesor === p.espesor) return ULTIMA.caida
  const clave = `${p.alto.toFixed(4)}|${p.espesor.toFixed(4)}`
  const hecha = CACHE.get(clave) ?? integrar(p)
  CACHE.set(clave, hecha)
  Object.assign(ULTIMA, { alto: p.alto, espesor: p.espesor, caida: hecha })
  return hecha
}

function integrar(p: PlacaDelLogo): CaidaIntegrada {
  const { kappa, alfa, desde } = dinamicaDe(p)
  const h = CAIDA_AL_HUECO.paso
  const { restitucion, asienta } = CAIDA_AL_HUECO.rebote
  const tope = Math.PI / 2
  const aceleracion = (a: number): number => kappa * Math.sin(a - alfa)
  const angulos: number[] = [desde]
  const toques: number[] = []
  let [a, w, t] = [desde, 0, 0]
  let asentadaS = Number.POSITIVE_INFINITY
  // A lo sumo 8 s (la caída dura ~2): un tope de seguridad, nunca se alcanza.
  while (t < 8) {
    const k1a = w
    const k1w = aceleracion(a)
    const k2a = w + (h / 2) * k1w
    const k2w = aceleracion(a + (h / 2) * k1a)
    const k3a = w + (h / 2) * k2w
    const k3w = aceleracion(a + (h / 2) * k2a)
    const k4a = w + h * k3w
    const k4w = aceleracion(a + h * k3a)
    let na = a + (h / 6) * (k1a + 2 * k2a + 2 * k3a + k4a)
    let nw = w + (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)
    t += h
    if (na >= tope && nw > 0) {
      // El toque, en el instante exacto (interpolado dentro del paso): la velocidad se da vuelta y se achica.
      const f = (tope - a) / (na - a)
      toques.push(t - h + f * h)
      na = tope
      nw = -restitucion * (w + f * (nw - w))
      if (-nw < asienta) {
        angulos.push(tope)
        asentadaS = t
        break
      }
    }
    a = na
    w = nw
    angulos.push(a)
  }
  return { angulos: Float64Array.from(angulos), contactoS: toques[0] ?? t, toques, asentadaS, kappa, alfa, desde }
}

/** El ángulo del cuerpo a los `u` s de arrancar la caída (antes: el de arranque; asentada: π/2). */
export function anguloDeLaCaida(c: CaidaIntegrada, u: number): number {
  if (u <= 0) return c.desde
  const x = u / CAIDA_AL_HUECO.paso
  const i = Math.floor(x)
  if (i >= c.angulos.length - 1) return Math.PI / 2
  // Un toque adentro del paso: el ángulo llega a π/2 en el instante exacto del toque (no al final del paso).
  const [desde, hasta] = [i * CAIDA_AL_HUECO.paso, (i + 1) * CAIDA_AL_HUECO.paso]
  for (const toque of c.toques) if (toque > desde && toque <= hasta) return u >= toque ? Math.PI / 2 : c.angulos[i] + (Math.PI / 2 - c.angulos[i]) * ((u - desde) / (toque - desde))
  return c.angulos[i] + (c.angulos[i + 1] - c.angulos[i]) * (x - i)
}

/**
 * Cuándo arranca la física (s del reloj): lo que dura antes del golpe. SIEMPRE: el contacto es el golpe para cualquier tamaño
 * del logo. Lo que se adapta es lo de antes (la bajada: `bajadaDe`).
 */
export function arranqueDeLaCaida(p: PlacaDelLogo): number {
  return Math.max(CAIDA_AL_HUECO.inclinaS, CAIDA_AL_HUECO.golpeS - caidaIntegrada(p).contactoS)
}

/** Cuándo toca (s del reloj): el golpe. */
export function contactoDeLaCaida(p: PlacaDelLogo): number {
  return arranqueDeLaCaida(p) + caidaIntegrada(p).contactoS
}

/** Cuánto tarda en bajar (s): `lenta.bajaS`, o menos si un logo más grande tarda más en caer (nunca menos de 0,5). */
export function bajadaDe(p: PlacaDelLogo): number {
  return Math.max(0.5, Math.min(CAIDA_AL_HUECO.lenta.bajaS, arranqueDeLaCaida(p) - CAIDA_AL_HUECO.inclinaS))
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Lo que devuelve `anguloEnElReloj` (el mismo objeto cada vez: se lee en el momento, sin reservas por cuadro). */
const EN_EL_RELOJ = { a: 0, toco: false, cayendo: false }

/** El ángulo del cuerpo a los `s` del reloj (antes, la inclinación; después, la física) y si ya tocó. */
export function anguloEnElReloj(p: PlacaDelLogo, s: number): { readonly a: number; readonly toco: boolean; readonly cayendo: boolean } {
  const c = caidaIntegrada(p)
  const u = s - arranqueDeLaCaida(p)
  EN_EL_RELOJ.cayendo = u > 0
  EN_EL_RELOJ.toco = u >= c.contactoS
  EN_EL_RELOJ.a = u <= 0 ? c.desde * suave((u + CAIDA_AL_HUECO.inclinaS) / CAIDA_AL_HUECO.inclinaS) : anguloDeLaCaida(c, u)
  return EN_EL_RELOJ
}

/** Cuánto bajó el canto por la pared del pozo (0 a 1): en los últimos grados, con el hueco ya abierto; tocado, entero. */
function hundidoDelCanto(a: number, toco: boolean): number {
  if (toco) return 1
  const desde = THREE.MathUtils.degToRad(CAIDA_AL_HUECO.hueco.hastaGrados)
  return suave((a - desde) / (Math.PI / 2 - desde))
}

const GIRO = new THREE.Vector2()
/** (y, z) girado hacia atrás por `a` (el `rotation.x = −a` de three.js). */
function girar(y: number, z: number, a: number): THREE.Vector2 {
  return GIRO.set(y * Math.cos(a) + z * Math.sin(a), -y * Math.sin(a) + z * Math.cos(a))
}

/** El canto (y, z) a los `s` del reloj, sin lo que baja por la pared: donde lo deja la bajada (al final, en el borde del hueco: z = alto/2, en el piso). */
function cantoEn(p: PlacaDelLogo, s: number): THREE.Vector2 {
  const { alto: h, espesor: e } = p
  const b = suave(s / bajadaDe(p))
  return CANTO.set(ORBIT_TARGET_Y - h / 2 + (FLOOR_Y - ORBIT_TARGET_Y + h / 2) * b, -e / 2 + (h / 2 + e / 2) * b)
}
const CANTO = new THREE.Vector2()

/** La pose del logo a los `s` del reloj: el centro (y, z; x = 0) y el ángulo del cuerpo (`rotation.x` = −a). */
export function poseDeLaCaida(p: PlacaDelLogo, s: number, destino: { centro: THREE.Vector3; rotacionX: number }): void {
  const { a, toco } = anguloEnElReloj(p, s)
  const canto = cantoEn(p, s)
  const [y, z] = [canto.x - p.espesor * hundidoDelCanto(a, toco), canto.y]
  // El centro está a (alto/2, espesor/2) del canto de abajo y de atrás, girado con la placa.
  const r = girar(p.alto / 2, p.espesor / 2, a)
  destino.centro.set(0, y + r.x, z + r.y)
  destino.rotacionX = -a
}

/** Cuánto se apaga el movimiento propio del logo (0 a 1): del todo antes de inclinarse (mientras baja). */
export function sinElRig(p: PlacaDelLogo, s: number): number {
  return suave(s / (bajadaDe(p) * 0.7))
}

/**
 * Cuánto se fue el logo de su lugar de siempre (0 a 1: el centro de la sala, donde está la mancha de contacto del piso): con la
 * bajada. Con eso la mancha se va con él (no queda una sombra donde ya no está).
 */
export function fueraDeSuLugar(p: PlacaDelLogo, s: number): number {
  return suave(s / bajadaDe(p))
}

/** La sombra que pide la pose (0 a 1): entera en el aire y parado (la del logo sigue al logo), se va mientras cae (hasta los 60°). */
export function sombraDeLaCaida(p: PlacaDelLogo, s: number): number {
  return 1 - suave(anguloEnElReloj(p, s).a / (Math.PI / 3))
}

/** Cuánto se abrió el hueco (0 a 1): con el ángulo de la caída, desde `hueco.desdeGrados` hasta `hastaGrados` (antes del toque). */
export function aperturaDelHueco(p: PlacaDelLogo, s: number): number {
  const { a, toco, cayendo } = anguloEnElReloj(p, s)
  if (!cayendo) return 0
  if (toco) return 1
  const { desdeGrados, hastaGrados } = CAIDA_AL_HUECO.hueco
  return suave((THREE.MathUtils.radToDeg(a) - desdeGrados) / (hastaGrados - desdeGrados))
}

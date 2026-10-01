import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { RIM_NIGHT_LEVEL } from '../probeLighting'
import type { ClaseDelViaje } from '../viaje'

/**
 * [INTERFAZ 2] T2 · LA VISTA PREVIA DEL DESTINO — el puntero (o el foco) sobre un ítem del menú y la sala anticipa un
 * segundo adónde va: la luz se corre hacia la del destino (hacia la noche si vas a Trabajos) y la cámara gira apenas
 * hacia allá. Si no hacés clic, vuelve. Si hacés clic, el viaje arranca DESDE la anticipación: lo anticipado se
 * descuenta con el avance del propio viaje (en la llegada es cero), así que no hay salto ni en la luz ni en la cámara.
 *
 * Pura (sin three, sin React, sin reloj propio): el invariante la recorre entera. La escribe el DOM (el plan, en el
 * evento) y la avanza el rig (`respuesta.ts`), una vez por cuadro, con cero reservas.
 *
 * Respeta la lógica que ya existe:
 *   · la clase del viaje es la de `planDelViaje` (VIAJES): qué luz se VE en cada punta;
 *   · la anticipación se queda ADENTRO de la clase de luz de la sala: de día no cruza a la noche (nada de motas que
 *     brillan ni del haz que se enciende: la frontera es `RIM_NIGHT_LEVEL`) y de noche no la deja (el haz no se apaga:
 *     el brillo de la noche no baja de lo que lo mantiene prendido). Es una anticipación, no el viaje;
 *   · se suma DESPUÉS de la noche disparada y del día de un viaje de día a día (`NIVEL_NATURAL` queda limpio: la luz de
 *     salida del viaje se mide sin ella).
 */
export const ANTICIPACION = {
  /** Cuánto del camino hacia la luz del destino (adentro de la clase) se recorre. */
  luz: 0.75,
  /** El giro de la cámara hacia el destino (grados): el mouse ya la corre hasta 22, esto es «apenas». */
  giroDeg: 7,
  /** Entra (s) y vuelve (s). */
  subeTauS: 0.18,
  bajaTauS: 0.45,
  /** Cuánto se sostiene sin clic (s): «anticipa un segundo». Después vuelve aunque el puntero siga encima. */
  sostenS: 1,
  /** Lo que se deja de margen contra la frontera de la noche, de cada lado. */
  margenDia: 0.08,
  /** De noche la luz sube a lo sumo hasta acá: el brillo de la noche queda en 0,65 (el haz se apaga bajo 0,35). */
  techoNoche: 0.16,
} as const

/** Lo que el DOM arma en el evento: la luz que se suma, hacia qué lado gira la cámara, y las dos puntas del scroll. */
export interface PlanDeAnticipacion {
  readonly destino: string
  /** Cuándo empezó (ms, el reloj de la página). */
  readonly desde: number
  /** Lo que se suma al nivel con la anticipación entera. */
  readonly luz: number
  /** −1 hacia arriba de la página, +1 hacia abajo (el ángulo de la pista crece con el progreso). */
  readonly sentido: -1 | 0 | 1
  readonly y0: number
  readonly y1: number
}

/** La luz objetivo de la anticipación: la del destino, recortada para no salir de la clase de luz de la sala. */
export function luzDeLaAnticipacion(clase: ClaseDelViaje, nivel: number, hasta: number | null): number {
  const deDia = nivel >= RIM_NIGHT_LEVEL
  let objetivo = nivel
  // Hacia la noche nunca aclara; hacia el día nunca oscurece (aunque la sala ya esté más allá del objetivo).
  if (clase === 'dia-a-noche') objetivo = Math.min(nivel, RIM_NIGHT_LEVEL + ANTICIPACION.margenDia)
  else if (clase === 'noche-a-dia') objetivo = Math.max(nivel, ANTICIPACION.techoNoche)
  else if (clase === 'dia-a-dia' && hasta !== null) objetivo = hasta
  // Adentro de la clase de la sala de AHORA (lo que se ve), no de la del plan, y sin ir nunca al revés: una sala de día
  // pegada a la frontera no se aclara para anticipar la noche.
  const [piso, techo] = limitesDeLaClase(nivel, deDia)
  objetivo = Math.max(piso, Math.min(techo, objetivo))
  return (objetivo - nivel) * ANTICIPACION.luz
}

/** Lo más oscuro y lo más claro que la anticipación puede dejar la sala sin cambiarla de clase. */
function limitesDeLaClase(nivel: number, deDia: boolean): readonly [number, number] {
  return deDia ? [Math.min(nivel, RIM_NIGHT_LEVEL + ANTICIPACION.margenDia), 1] : [NIVEL_DE_LA_NOCHE, Math.max(nivel, ANTICIPACION.techoNoche)]
}

export function planDeLaAnticipacion(destino: string, clase: ClaseDelViaje, nivel: number, hasta: number | null, y0: number, y1: number, ahora: number): PlanDeAnticipacion {
  const sentido = y1 > y0 + 1 ? 1 : y1 < y0 - 1 ? -1 : 0
  return { destino, desde: ahora, luz: luzDeLaAnticipacion(clase, nivel, hasta), sentido, y0, y1 }
}

/** El estado que arrastra el rig (mutable: cero reservas por cuadro). */
export interface EstadoDeLaAnticipacion {
  /** Lo que se suma al nivel y a la cámara en este cuadro. */
  luz: number
  giro: number
  /** `viaje`: el clic llegó y lo anticipado se descuenta con el avance del viaje. */
  modo: 'libre' | 'viaje'
  luz0: number
  giro0: number
  y0: number
  y1: number
  /** El viaje no va adonde se anticipó (o no se sabe adónde): se descuenta en el tiempo. */
  aCiegas: boolean
}

export function anticipacionInicial(): EstadoDeLaAnticipacion {
  return { luz: 0, giro: 0, modo: 'libre', luz0: 0, giro0: 0, y0: 0, y1: 0, aCiegas: false }
}

const acercar = (actual: number, objetivo: number, dt: number, tau: number): number => actual + (objetivo - actual) * (1 - Math.exp(-Math.max(0, dt) / tau))

/**
 * Un cuadro. `plan` es lo que el DOM tiene pedido AHORA (null: nada encima); `viaje`, el destino del viaje en curso
 * (null: ninguno); `ahora` en ms; `dt` en segundos.
 */
export function avanzarLaAnticipacion(e: EstadoDeLaAnticipacion, plan: PlanDeAnticipacion | null, viaje: string | null, scrollY: number, ahora: number, dt: number): void {
  if (viaje !== null) {
    if (e.modo !== 'viaje') {
      // El clic: lo anticipado queda como punto de partida y se descuenta con el avance de ESTE viaje.
      e.modo = 'viaje'
      e.luz0 = e.luz
      e.giro0 = e.giro
      e.aCiegas = plan === null || plan.destino !== viaje || plan.y1 === plan.y0
      e.y0 = scrollY
      e.y1 = plan?.y1 ?? scrollY
    }
    if (e.aCiegas) {
      e.luz = acercar(e.luz, 0, dt, ANTICIPACION.bajaTauS)
      e.giro = acercar(e.giro, 0, dt, ANTICIPACION.bajaTauS)
    } else {
      const f = Math.max(0, Math.min(1, (scrollY - e.y0) / (e.y1 - e.y0)))
      e.luz = e.luz0 * (1 - f)
      e.giro = e.giro0 * (1 - f)
    }
    return
  }
  // Sin viaje (o terminado, o cortado): desde donde esté, hacia lo pedido o hacia cero.
  e.modo = 'libre'
  const activo = plan !== null && ahora - plan.desde < ANTICIPACION.sostenS * 1000
  const luz = activo ? plan.luz : 0
  const giro = activo ? plan.sentido * ANTICIPACION.giroDeg : 0
  const tau = activo ? ANTICIPACION.subeTauS : ANTICIPACION.bajaTauS
  e.luz = acercar(e.luz, luz, dt, tau)
  e.giro = acercar(e.giro, giro, dt, tau)
  if (!activo && Math.abs(e.luz) < 1e-4 && Math.abs(e.giro) < 1e-3) {
    e.luz = 0
    e.giro = 0
  }
}

/** El nivel con la anticipación: adentro de la clase de la sala si no hay viaje; en un viaje, sólo dentro del arco. */
export function nivelAnticipado(nivel: number, e: EstadoDeLaAnticipacion): number {
  if (e.luz === 0) return nivel
  const n = nivel + e.luz
  if (e.modo === 'viaje') return Math.max(NIVEL_DE_LA_NOCHE, Math.min(1, n))
  const [piso, techo] = limitesDeLaClase(nivel, nivel >= RIM_NIGHT_LEVEL)
  return Math.max(piso, Math.min(techo, n))
}

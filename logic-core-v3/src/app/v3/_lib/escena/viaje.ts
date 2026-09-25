/**
 * EL VIAJE EN CURSO, visto desde la escena. **[VIAJES]**
 *
 * Mientras el navbar viaja, el `<main>` está apagado y lo único que se ve es la sala. Tres cosas
 * cambian mientras dura, y las tres las lee la escena desde acá:
 *
 *   · **dibuja siempre**, aunque el recorrido cruce la banda opaca (Servicios y Tu panel), y sin la
 *     máscara del revelado, que existe para los bordes de los paneles y los paneles no se ven;
 *   · **la luz de un viaje de día a día no pasa por la noche**: va de la luz de salida a la de
 *     llegada con el avance del viaje, aunque el recorrido cruce Trabajos (ni barrido ni noche);
 *   · en los demás, **la noche cambia con el reloj del barrido**, nunca de golpe: el día del final,
 *     que el scroll cambia escondido detrás del bloque opaco, acá se vería (`CapaDeLaGota`).
 *
 * La forma es la de `NOCHE_DISPARADA`: un estado chico de módulo, porque lo leen piezas que corren
 * por cuadro. Lo escribe el efecto del viaje (`useDeslizamientoDelCta`); nadie más.
 */

/** Con qué luz sale y con qué luz llega: lo que se VE, no lo que hay debajo de un panel opaco. */
export type Luz = 'dia' | 'noche'

export type ClaseDelViaje = 'dia-a-dia' | 'dia-a-noche' | 'noche-a-dia' | 'noche-a-noche'

export function claseDelViaje(sale: Luz, llega: Luz): ClaseDelViaje {
  return `${sale}-a-${llega}` as ClaseDelViaje
}

/** La luz de un viaje de día a día: de `desde` a `hasta` mientras el scroll va de `y0` a `y1`. */
export interface LuzDelViaje {
  readonly desde: number
  readonly hasta: number
  readonly y0: number
  readonly y1: number
}

export interface ViajeEnCurso {
  readonly destino: string
  readonly clase: ClaseDelViaje
  /** Sólo en los de día a día. */
  readonly luz: LuzDelViaje | null
}

/**
 * El nivel de luz entre las dos puntas, por el avance del scroll. Lineal a propósito: el avance ya
 * trae la curva del viaje, y una segunda curva encima sería otro tiempo que nadie eligió.
 */
export function nivelEntre(luz: LuzDelViaje, scrollY: number): number {
  const recorrido = luz.y1 - luz.y0
  const f = recorrido === 0 ? 1 : (scrollY - luz.y0) / recorrido
  const t = f < 0 ? 0 : f > 1 ? 1 : f
  return luz.desde + (luz.hasta - luz.desde) * t
}

let actual: ViajeEnCurso | null = null
const oyentes = new Set<() => void>()

export function empezarElViaje(viaje: ViajeEnCurso): void {
  actual = viaje
  oyentes.forEach((f) => f())
}

/** Idempotente: la llaman las salidas del efecto, y más de una puede llegar. */
export function terminarElViaje(): void {
  if (actual === null) return
  actual = null
  oyentes.forEach((f) => f())
}

export function viajeEnCurso(): ViajeEnCurso | null {
  return actual
}

/** Avisa al empezar y al terminar. Devuelve la baja. */
export function suscribirAlViaje(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

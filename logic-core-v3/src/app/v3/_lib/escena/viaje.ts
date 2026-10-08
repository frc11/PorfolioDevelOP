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

/** Adónde va y con qué luz (lo que mide `planDelViaje`, también para anticiparlo). */
export interface PlanDelViaje {
  readonly destino: string
  readonly clase: ClaseDelViaje
  /** Sólo en los de día a día. */
  readonly luz: LuzDelViaje | null
  /** [PULIDO 2] 2 · el destino (px del documento): en uno que cambia de luz, el amanecer mira si llega a él. */
  readonly y1?: number
}

export interface ViajeEnCurso extends PlanDelViaje {
  /**
   * [PULIDO 1] P5 · cuánto dura, del click al frenazo (ms): el preludio más el recorrido. El final del pie vuelve a cero
   * adentro de esto, en paralelo con el recorrido (`VIAJE_DEL_FINAL`).
   */
  readonly duracionMs: number
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
  // [PULIDO 2] 2 · el reloj del viaje arranca en el click (el preludio también es del viaje), al día con la pared: lo que pasó
  // sin cuadros antes (abajo de 1024 nadie lo avanza con la escena suspendida) no es deuda del viaje (lo apuraba al doble).
  RELOJ.alEmpezar = relojDelCuadro(performance.now())
  RELOJ.deuda = 0
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

/**
 * [NOCTURNO FINAL] A2 · NINGÚN CUADRO AVANZA EL VIAJE MÁS QUE ESTO (ms). El reloj del viaje es el de pared, pero un cuadro
 * largo (un tirón de 100 ms al cruzar las Demos, medido) lo hacía saltar: a 7.000 px/s eran 800 px de página y 17° de
 * cámara en un solo cuadro. Con el tope, el tirón se ve como un tirón (la imagen se queda), no como un salto; un
 * dispositivo a 30 cuadros no pierde tiempo (34 ms por cuadro), uno más lento, un poco.
 */
export const TOPE_DEL_CUADRO_DEL_VIAJE_MS = 34

/**
 * [PULIDO 2] 2 · EL RELOJ DEL VIAJE, UNO SOLO. El scroll (Lenis o el motor sin Lenis) y el final del pie que se deshace en un
 * viaje leen el MISMO reloj, así la cámara del recorrido no se adelanta a la vuelta del final (antes el scroll iba con el
 * reloj de Lenis y el final con el `delta` de su cuadro: con cuadros largos, cada uno a su ritmo). Es el de pared con el tope
 * de A2 por cuadro (un tirón se ve como un tirón, no como un salto), pero lo que el tope retiene se DEVUELVE en los cuadros
 * siguientes, a lo sumo el tope por cuadro: antes cada cuadro de más de 34 ms alargaba el viaje para siempre. Lo avanza
 * cualquiera que lo lea con la marca de tiempo de su cuadro (`requestAnimationFrame` o `document.timeline`), una vez por cuadro.
 */
const RELOJ = { real: -1, suave: 0, deuda: 0, alEmpezar: 0, motores: 0 }

/** El motor sin Lenis lo sostiene mientras mueve el scroll (también fuera de un viaje anotado). Devuelve cómo soltarlo. */
export function sostenerElReloj(): () => void {
  RELOJ.motores += 1
  let suelto = false
  return () => {
    if (suelto) return
    suelto = true
    RELOJ.motores = Math.max(0, RELOJ.motores - 1)
  }
}

/** El reloj (ms) para el cuadro de `tiempoMs`: fuera de un viaje, el de pared; en un viaje, con el tope y lo retenido devuelto. */
export function relojDelCuadro(tiempoMs: number): number {
  // La primera lectura, o una base de tiempo nueva (un reloj que vuelve atrás más de un segundo): se toma de ahí.
  if (RELOJ.real < 0 || tiempoMs + 1000 < RELOJ.real) {
    if (RELOJ.real < 0) RELOJ.suave = tiempoMs
    RELOJ.real = tiempoMs
    return RELOJ.suave
  }
  if (!(tiempoMs > RELOJ.real)) return RELOJ.suave
  const debe = tiempoMs - RELOJ.real + RELOJ.deuda
  RELOJ.real = tiempoMs
  const paso = actual === null && RELOJ.motores === 0 ? debe : Math.min(debe, TOPE_DEL_CUADRO_DEL_VIAJE_MS)
  RELOJ.deuda = debe - paso
  RELOJ.suave += paso
  return RELOJ.suave
}

/** Cuánto lleva el viaje en curso (s), en ese reloj; 0 sin viaje. */
export function segundosDelViaje(): number {
  return actual === null ? 0 : Math.max(0, RELOJ.suave - RELOJ.alEmpezar) / 1000
}

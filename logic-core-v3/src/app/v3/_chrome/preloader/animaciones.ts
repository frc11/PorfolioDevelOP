import { FIN_DE_LA_BIENVENIDA_MS, INICIO_DE_LA_FLECHA_MS, LINEA, LINEA_REDUCIDA } from './linea'
import { anguloEn, puntoEn, type Raya, type Trazado } from './trazado'

/**
 * [C2-81] LAS ANIMACIONES DEL PRELOADER, EN EL COMPOSITOR — puro: los cuadros clave y los tiempos de todo lo que se mueve en el preloader,
 * para la Web Animations API (`Element.animate`). Sólo `opacity` y `transform`: lo que el compositor anima sin el hilo principal. Así la
 * bienvenida no se traba aunque el hilo esté ocupado preparando la escena o hidratando (el ítem 18: «el texto aparece a medio aparecer,
 * se traba un poco y después sigue»). Antes un rAF escribía las opacidades cuadro a cuadro y cada tarea larga del hilo las congelaba.
 *
 * Reproducen EXACTAMENTE la línea (`vistaDeLaLinea`, que queda como el modelo): las curvas del sitio son de potencia 2, y una de esas es
 * un `cubic-bezier` exacto con los controles de `x` en 1/3 y 2/3 (`x(s) = s`); la simétrica va en dos mitades. `s78-c2-81` lo compara
 * en el tiempo.
 *
 * Los tiempos: los del texto y la salida, desde el arranque de la línea; los de la flecha, desde que arranca la flecha
 * (`inicioDeLaFlecha`). La capa los alinea con su reloj (`reloj.ts`).
 */

/** Un cuadro clave: sólo `opacity` y `transform`. */
export interface CuadroClave {
  readonly opacity?: number
  readonly transform?: string
  readonly offset?: number
  readonly easing?: string
}

export interface Animacion {
  readonly cuadros: readonly CuadroClave[]
  /** ms. */
  readonly duracion: number
  /** ms, desde el origen de su grupo (la línea o la flecha). */
  readonly demora: number
  readonly relleno: 'both' | 'forwards' | 'none'
  readonly iteraciones?: number
}

/** Las curvas del sitio (`CURVAS`) como `cubic-bezier` exactos: 1 − (1 − t)² y t². */
export const EN_CSS = {
  principal: 'cubic-bezier(0.33333, 0.66667, 0.66667, 1)',
  entrada: 'cubic-bezier(0.33333, 0, 0.66667, 0.33333)',
  /** El pulso de la punta: medio coseno (una seno de ida y vuelta). */
  pulso: 'cubic-bezier(0.37, 0, 0.63, 1)',
} as const

/** Lo que dura la aparición de cada raya (ms): corta, así la flecha se dibuja raya a raya y no de a saltos. */
export const RAYA_MS = 70

/** El pulso de la punta (`linea.ts`): cuánto crece y su período. */
export const PULSO = { escala: 1.22, periodoMs: LINEA.pulsoPeriodoMs } as const

/** La simétrica (`power1.inOut`) de `desde` a `hasta`, en dos mitades exactas. */
const simetrica = (desde: number, hasta: number): CuadroClave[] => [
  { opacity: desde, easing: EN_CSS.entrada },
  { opacity: (desde + hasta) / 2, offset: 0.5, easing: EN_CSS.principal },
  { opacity: hasta },
]
/** Un salto en `demora` (sin fundido): para el movimiento reducido. */
const salto = (desde: number, hasta: number, demora: number): Animacion => ({ cuadros: [{ opacity: desde }, { opacity: hasta }], duracion: 0, demora, relleno: 'both' })

/** El texto: la bienvenida, el blanco y la frase, desde el arranque de la línea. */
export function fundidosDelTexto(reducido: boolean): { readonly bienvenida: Animacion; readonly blanco: Animacion; readonly frase: Animacion } {
  if (reducido) {
    const b = LINEA_REDUCIDA.bienvenidaMs
    return { bienvenida: salto(1, 0, b), blanco: salto(0, 1, b), frase: salto(0, 1, b) }
  }
  const total = FIN_DE_LA_BIENVENIDA_MS
  return {
    bienvenida: {
      cuadros: [
        { opacity: 0, easing: EN_CSS.principal },
        { opacity: 1, offset: LINEA.bienvenidaEntraMs / total },
        { opacity: 1, offset: (LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs) / total, easing: EN_CSS.entrada },
        { opacity: 0 },
      ],
      duracion: total,
      demora: 0,
      relleno: 'both',
    },
    blanco: { cuadros: simetrica(0, 1), duracion: LINEA.blancoMs, demora: FIN_DE_LA_BIENVENIDA_MS, relleno: 'both' },
    frase: { cuadros: [{ opacity: 0, easing: EN_CSS.principal }, { opacity: 1 }], duracion: LINEA.fraseEntraMs, demora: FIN_DE_LA_BIENVENIDA_MS + LINEA.blancoMs, relleno: 'both' },
  }
}

/** La salida: la capa entera se desvanece (desde que arranca la salida). */
export const salidaDeLaCapa = (reducido: boolean): Animacion =>
  reducido ? { cuadros: [{ opacity: 1 }, { opacity: 0 }], duracion: LINEA_REDUCIDA.salidaMs, demora: 0, relleno: 'forwards' } : { cuadros: simetrica(1, 0), duracion: LINEA.salidaMs, demora: 0, relleno: 'forwards' }

/** Cuándo arranca la flecha, desde el arranque de la línea. */
export const inicioDeLaFlecha = (reducido: boolean): number => (reducido ? LINEA_REDUCIDA.bienvenidaMs : INICIO_DE_LA_FLECHA_MS)

/** La inversa de la simétrica: el tiempo (0 a 1) en que llega a `y`. */
export const simetricaInversa = (y: number): number => {
  const v = Math.min(1, Math.max(0, y))
  return v < 0.5 ? Math.sqrt(v / 2) : 1 - Math.sqrt((1 - v) / 2)
}

/** Cuándo (ms desde que arranca la flecha, a su ritmo) el dibujo llega a `trazo` (0 a 1): la inversa de `trazoDeLaFlecha`. */
export const tauDelTrazo = (trazo: number): number => LINEA.flechaMs * simetricaInversa(trazo)

/** Desde dónde frena si falta la carga (`frenoDesde`), en el tiempo de la flecha: lo de antes corre siempre solo. */
export const TAU_DEL_FRENO = tauDelTrazo(LINEA.frenoDesde)

/** La aparición de una raya: cuando el dibujo llega a su principio. */
export function apareceLaRaya(r: Raya, largoDelCamino: number, reducido: boolean): Animacion {
  if (reducido) return { cuadros: [{ opacity: 0 }, { opacity: 1 }], duracion: 0, demora: 0, relleno: 'forwards' }
  return { cuadros: [{ opacity: 0 }, { opacity: 1 }], duracion: RAYA_MS, demora: tauDelTrazo(largoDelCamino <= 0 ? 0 : r.desde / largoDelCamino), relleno: 'forwards' }
}

/** Cada cuántos px del camino va un cuadro clave de la punta. */
export const PASO_DE_LA_PUNTA_PX = 5

const transformDeLaPunta = (x: number, y: number, angulo: number): string => `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${angulo.toFixed(2)}deg)`

/**
 * El recorrido de la punta: dos tramos, el libre (hasta el freno) y el frenable (el último 20 %), para que la capa pueda frenar sólo el
 * segundo si falta la carga. Cuadros cada `PASO_DE_LA_PUNTA_PX` del camino, con el ángulo desenrollado (sin vueltas de 360° entre dos
 * cuadros); la opacidad entra en el primer 4 % del trazo. Con movimiento reducido, un solo cuadro: la punta ya en el botón.
 */
export function recorridosDeLaPunta(t: Trazado, reducido: boolean): { readonly animacion: Animacion; readonly frenable: boolean }[] {
  const L = t.camino.largo
  if (reducido || L <= 0) {
    const fin = transformDeLaPunta(t.punta.x, t.punta.y, anguloEn(t.camino, L))
    return [{ animacion: { cuadros: [{ transform: fin, opacity: 1 }, { transform: fin, opacity: 1 }], duracion: 0, demora: 0, relleno: 'forwards' }, frenable: false }]
  }
  const sFreno = LINEA.frenoDesde * L
  const muestras = (desde: number, hasta: number): number[] => {
    const n = Math.max(1, Math.ceil((hasta - desde) / PASO_DE_LA_PUNTA_PX))
    return Array.from({ length: n + 1 }, (_, i) => desde + ((hasta - desde) * i) / n)
  }
  let previo: number | null = null
  const cuadro = (s: number, t0: number, dur: number): CuadroClave => {
    const p = puntoEn(t.camino, s)
    let a = anguloEn(t.camino, s)
    if (previo !== null) {
      while (a - previo > 180) a -= 360
      while (a - previo < -180) a += 360
    }
    previo = a
    return { transform: transformDeLaPunta(p.x, p.y, a), opacity: Math.min(1, s / L / 0.04), offset: Math.min(1, Math.max(0, (tauDelTrazo(s / L) - t0) / dur)) }
  }
  const tramo = (desde: number, hasta: number, t0: number, t1: number, frenable: boolean): { readonly animacion: Animacion; readonly frenable: boolean } => ({
    animacion: { cuadros: muestras(desde, hasta).map((s) => cuadro(s, t0, t1 - t0)), duracion: t1 - t0, demora: t0, relleno: 'forwards' },
    frenable,
  })
  return [tramo(0, sFreno, 0, TAU_DEL_FRENO, false), tramo(sFreno, L, TAU_DEL_FRENO, LINEA.flechaMs, true)]
}

/** El pulso de la punta (desde los 6 s, si falta la carga): crece y vuelve, sin fin. */
export const PULSO_DE_LA_PUNTA: Animacion = {
  cuadros: [
    { transform: 'scale(1)', easing: EN_CSS.pulso },
    { transform: `scale(${String(PULSO.escala)})`, offset: 0.5, easing: EN_CSS.pulso },
    { transform: 'scale(1)' },
  ],
  duracion: PULSO.periodoMs,
  demora: 0,
  relleno: 'none',
  iteraciones: Number.POSITIVE_INFINITY,
}

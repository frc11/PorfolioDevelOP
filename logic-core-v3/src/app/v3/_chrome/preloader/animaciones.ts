import { FIN_DE_LA_BIENVENIDA_MS, INICIO_DEL_BOTON_MS, LINEA, LINEA_REDUCIDA } from './linea'

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
 * Los tiempos: los del texto y la salida, desde el arranque de la línea; los del botón (aparece, late y manda su onda), desde que aparece
 * (`inicioDelBoton`). La capa los alinea con su reloj (`reloj.ts`).
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
  /** ms, desde el origen de su grupo (la línea o el botón). */
  readonly demora: number
  readonly relleno: 'both' | 'forwards' | 'none'
  readonly iteraciones?: number
}

/** Las curvas del sitio (`CURVAS`) como `cubic-bezier` exactos: 1 − (1 − t)² y t². */
export const EN_CSS = {
  principal: 'cubic-bezier(0.33333, 0.66667, 0.66667, 1)',
  entrada: 'cubic-bezier(0.33333, 0, 0.66667, 0.33333)',
  /** La onda: sale rápido del botón y se acuesta a lo lejos. */
  onda: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
} as const

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

/** Cuándo aparece el botón, desde el arranque de la línea. */
export const inicioDelBoton = (reducido: boolean): number => (reducido ? LINEA_REDUCIDA.bienvenidaMs : INICIO_DEL_BOTON_MS)

/**
 * EL LATIDO [L6 · ítem 81] — «tu-tu … tu-tu»: dos pulsos cercanos y una pausa. Cada pulso del botón sube en `subeMs` y baja en `bajaMs`; el
 * segundo empieza `entrePulsosMs` después del primero; el período entero es `LINEA.latidoPeriodoMs`. De cada pulso nace una onda (`ondaMs`).
 */
export const LATIDO = { escala: 1.12, subeMs: 90, bajaMs: 160, entrePulsosMs: 300, ondaMs: 1250, ondaOpacidad: 0.55, apareceMs: 350, escalaAlAparecer: 0.88 } as const

/** El botón aparece en su lugar: un fundido con un poco de escala (reducido: de golpe). */
export const apareceElBoton = (reducido: boolean): Animacion =>
  reducido
    ? salto(0, 1, 0)
    : { cuadros: [{ opacity: 0, transform: `scale(${String(LATIDO.escalaAlAparecer)})`, easing: EN_CSS.principal }, { opacity: 1, transform: 'scale(1)' }], duracion: LATIDO.apareceMs, demora: 0, relleno: 'both' }

const enElPeriodo = (ms: number): number => ms / LINEA.latidoPeriodoMs

/**
 * El latido del botón, sin fin (mientras la capa viva; la salida la desvanece): escala dos veces; con movimiento reducido, sin escala, la
 * opacidad baja y vuelve (nada se agranda).
 */
export function latidoDelBoton(reducido: boolean): Animacion {
  const { subeMs, bajaMs, entrePulsosMs } = LATIDO
  const valor = (arriba: boolean): Pick<CuadroClave, 'opacity' | 'transform'> => (reducido ? { opacity: arriba ? 0.55 : 1 } : { transform: `scale(${arriba ? String(LATIDO.escala) : '1'})` })
  const pulso = (desde: number): CuadroClave[] => [
    { ...valor(false), offset: enElPeriodo(desde), easing: EN_CSS.principal },
    { ...valor(true), offset: enElPeriodo(desde + subeMs), easing: EN_CSS.entrada },
    { ...valor(false), offset: enElPeriodo(desde + subeMs + bajaMs) },
  ]
  return { cuadros: [...pulso(0), ...pulso(entrePulsosMs), { ...valor(false), offset: 1 }], duracion: LINEA.latidoPeriodoMs, demora: 0, relleno: 'none', iteraciones: Number.POSITIVE_INFINITY }
}

/**
 * La onda de un pulso (`indice` 0 o 1): un anillo del tamaño final (cubre el fondo desde el botón hasta la esquina más lejana) que crece
 * desde el tamaño del botón (`escalaInicial`, 0 a 1) y se desvanece. La escala y la opacidad van en dos elementos (la curva de la escala
 * sale rápido; la opacidad baja pareja). Sin movimiento reducido: ninguna (el latido de la opacidad del botón alcanza).
 */
export function ondaDelPulso(indice: 0 | 1, escalaInicial: number): { readonly escala: Animacion; readonly opacidad: Animacion } {
  const fin = enElPeriodo(LATIDO.ondaMs)
  const demora = indice * LATIDO.entrePulsosMs
  const comun = { duracion: LINEA.latidoPeriodoMs, demora, relleno: 'none', iteraciones: Number.POSITIVE_INFINITY } as const
  return {
    escala: { ...comun, cuadros: [{ transform: `scale(${escalaInicial.toFixed(4)})`, offset: 0, easing: EN_CSS.onda }, { transform: 'scale(1)', offset: fin }, { transform: 'scale(1)', offset: 1 }] },
    opacidad: { ...comun, cuadros: [{ opacity: LATIDO.ondaOpacidad, offset: 0 }, { opacity: 0, offset: fin }, { opacity: 0, offset: 1 }] },
  }
}

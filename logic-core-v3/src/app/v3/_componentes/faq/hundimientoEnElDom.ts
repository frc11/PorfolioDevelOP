import { pisoDelHundimiento } from '../../_lib/formularios/volteo'

/**
 * [B10] EL HUNDIMIENTO DEL FORMULARIO DEL PIE, EN EL DOM — el FAQ y el pie plano se hunden con la curva de la placa 3D del formulario
 * (`formularios/volteo.ts`, `pisoDelHundimiento`): primero baja por su hueco (se aleja: más chico y más oscuro) y después el piso se cierra
 * sobre él (la silueta se achica hasta desaparecer); para subir, al revés. Pura: el nivel (0 hundido y cerrado, 1 en su lugar) da el estilo.
 *
 * El estilo va en el elemento que se hunde (no en un ancestro): un recorte o una opacidad en un ancestro le corta al vidrio su
 * desenfoque (lo vuelve la raíz de lo que ve detrás). En su lugar, sin estilo: el vidrio entero.
 */
export const HUNDIMIENTO_EN_EL_DOM = {
  /** Cuánto se aleja abajo (px de profundidad) y con qué perspectiva (px). */
  hondoPx: 80,
  perspectivaPx: 900,
  /** Cuánto se apaga abajo (la opacidad que pierde: el hueco es oscuro). */
  apagado: 0.4,
  /** El radio de la silueta del hueco: el del vidrio (`vidrio.css`). */
  radio: 'calc(var(--radius-fuerte) * 3)',
} as const

const entre = (x: number): number => Math.min(1, Math.max(0, x))

/** Cuánto se cerró el piso sobre el elemento (0 a 1) y cuánto bajó (0 a 1) con este nivel: la primera mitad del cambio, al revés. */
export function pisoDelNivel(nivel: number): { readonly cerrado: number; readonly hondo: number } {
  const p = pisoDelHundimiento((1 - entre(nivel)) / 2)
  return { cerrado: p.cerrado, hondo: p.baja }
}

/** El estilo de un nivel; en su lugar (1), ninguno. */
export interface EstiloDelNivel {
  readonly clipPath: string
  readonly transform: string
  readonly opacity: string
}

const SIN_ESTILO: EstiloDelNivel = { clipPath: '', transform: '', opacity: '' }

export function estiloDelNivel(nivel: number): EstiloDelNivel {
  if (entre(nivel) >= 1) return SIN_ESTILO
  const H = HUNDIMIENTO_EN_EL_DOM
  const { cerrado, hondo } = pisoDelNivel(nivel)
  return {
    // Cerrado del todo, sin área: no se ve ni recibe el puntero (sigue en el documento: el lector y el teclado lo encuentran).
    clipPath: `inset(${(cerrado * 50).toFixed(3)}% round ${H.radio})`,
    transform: `perspective(${String(H.perspectivaPx)}px) translateZ(${(-hondo * H.hondoPx).toFixed(2)}px)`,
    opacity: (1 - hondo * H.apagado).toFixed(3),
  }
}

/** Escribe el estilo de un nivel en el elemento (sólo lo que cambió). */
export function aplicarElNivel(el: HTMLElement | null, nivel: number): void {
  if (el === null) return
  const e = estiloDelNivel(nivel)
  if (el.style.clipPath !== e.clipPath) el.style.clipPath = e.clipPath
  if (el.style.transform !== e.transform) el.style.transform = e.transform
  if (el.style.opacity !== e.opacity) el.style.opacity = e.opacity
}

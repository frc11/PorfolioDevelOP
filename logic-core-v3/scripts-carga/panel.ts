/**
 * [B1.2b] EL PANEL DEL PORTFOLIO, CUADRO A CUADRO — lo que el arnés (`estres.ts`, `PANEL`) mide en el sitio y s76 afirma con su control:
 * con un scroll rápido (la rueda, la barra, el menú o un ancla), mientras la caja del panel viaja entre afuera (a la derecha del cuadro)
 * y su lugar, su tope no se mueve más de 1 px (plan §12, punto 9: el panel entra sólo en horizontal, con el escenario ya pegado). Sin
 * Playwright: es la cuenta, nada más.
 */
export interface MuestraDelPanel {
  /** El tope y el borde izquierdo de la caja (`getBoundingClientRect`, con la transformada), su ancho y el del cuadro. */
  readonly top: number
  readonly left: number
  readonly ancho: number
  readonly vista: number
}

export interface TramoDelPanel {
  readonly cuadros: number
  /** Lo más que se apartó el tope del de su primer cuadro del tramo (px; `NaN` sin cuadros). */
  readonly desvio: number
  readonly topMin: number
  readonly topMax: number
}

export const TOLERANCIA_DEL_TOPE_PX = 1

function tramo(tops: readonly number[]): TramoDelPanel {
  if (tops.length === 0) return { cuadros: 0, desvio: Number.NaN, topMin: Number.NaN, topMax: Number.NaN }
  return { cuadros: tops.length, desvio: Math.max(...tops.map((t) => Math.abs(t - tops[0]))), topMin: Math.min(...tops), topMax: Math.max(...tops) }
}

/** Los cuadros con la caja a mitad de camino, por hacia dónde va: hacia la izquierda entra, hacia la derecha sale. */
export function tramosDelPanel(m: readonly MuestraDelPanel[]): { readonly entrada: TramoDelPanel; readonly salida: TramoDelPanel } {
  const entrada: number[] = []
  const salida: number[] = []
  for (let i = 1; i < m.length; i += 1) {
    const s = m[i]
    if (!(s.left > s.vista - s.ancho + 0.5 && s.left < s.vista - 0.5)) continue
    const corre = s.left - m[i - 1].left
    if (corre < 0) entrada.push(s.top)
    else if (corre > 0) salida.push(s.top)
  }
  return { entrada: tramo(entrada), salida: tramo(salida) }
}

/** Entró (hubo cuadros a mitad de camino) con el tope quieto: a lo sumo 1 px del de su primer cuadro. */
export function enHorizontal(t: TramoDelPanel): boolean {
  return t.cuadros > 0 && t.desvio <= TOLERANCIA_DEL_TOPE_PX
}

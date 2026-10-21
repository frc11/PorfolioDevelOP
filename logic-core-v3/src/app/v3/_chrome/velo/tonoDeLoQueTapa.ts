import { nocheQueSeVe } from '../cursor/estado'
import { NOCHE_QUE_OSCURECE } from '../menu/tono'

import type { TonoDeLoTapado } from './velo'

/**
 * [B12a.8] EL TONO DE LO QUE EL VELO VA A TAPAR — leído al empezar a cubrir, en cinco puntos del cuadro (el medio y el centro de cada
 * cuarto): en cada uno, la primera superficie opaca de arriba hacia abajo (su fondo) dice si es clara u oscura; si no hay ninguna, se ve la
 * escena, que es oscura de noche y clara de día (`nocheQueSeVe`, la misma que lee el botón del menú). Manda la mayoría. Sin React.
 */

/** Los cinco puntos (fracción del cuadro). */
const PUNTOS = [
  [0.5, 0.5],
  [0.25, 0.25],
  [0.75, 0.25],
  [0.25, 0.75],
  [0.75, 0.75],
] as const

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Un color de CSS computado (`rgb(…)` o `rgba(…)`) → su luminancia y su alfa; `null` si no se entiende. */
export function luminanciaDe(color: string): { readonly luminancia: number; readonly alfa: number } | null {
  const n = color.match(/[\d.]+/g)?.map(Number)
  if (n === undefined || n.length < 3) return null
  const [r = 0, g = 0, b = 0, a = 1] = n
  return { luminancia: 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b), alfa: a }
}

/** ¿El lienzo de la escena se ve en (x, y)? (No recibe el puntero: `elementsFromPoint` no lo encuentra; se mira su caja.) */
function hayEscenaEn(lienzo: HTMLCanvasElement | null, x: number, y: number): boolean {
  if (lienzo === null || !lienzo.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false
  const r = lienzo.getBoundingClientRect()
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
}

/** ¿Lo que se ve en (x, y) es claro? La primera superficie opaca de arriba; debajo del contenido, la escena (si se ve) y el piso de papel. */
function esClaroEn(x: number, y: number, escenaClara: boolean, lienzo: HTMLCanvasElement | null): boolean {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest('[data-pieza="velo-de-navegacion"]') !== null) continue
    if (el instanceof HTMLCanvasElement) return escenaClara
    // El contenedor de /v3 es el piso de papel, DEBAJO del lienzo: llegar acá es haber pasado por la escena.
    if (el.hasAttribute('data-v3') && hayEscenaEn(lienzo, x, y)) return escenaClara
    const fondo = luminanciaDe(getComputedStyle(el).backgroundColor)
    if (fondo !== null && fondo.alfa >= 0.5) return fondo.luminancia > 0.4
  }
  return escenaClara
}

export function tonoDeLoQueTapa(): TonoDeLoTapado {
  const escenaClara = nocheQueSeVe() < NOCHE_QUE_OSCURECE
  const lienzo = document.querySelector<HTMLCanvasElement>('[data-v3] canvas')
  const claros = PUNTOS.filter(([fx, fy]) => esClaroEn(fx * window.innerWidth, fy * window.innerHeight, escenaClara, lienzo)).length
  return claros * 2 > PUNTOS.length ? 'claro' : 'oscuro'
}

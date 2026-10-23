/**
 * [B7] EL TELÓN — el fundido simple al panel, fuera de /v3.
 *
 * Al loguearse la acción redirige y next navega al panel: el layout de /v3 (y con él la hoja negra del login) se desmonta y el
 * panel aparece de golpe. El telón lo evita sin tocar el panel: un `div` del mismo negro de la hoja, colgado de `<body>` FUERA de
 * React (el layout raíz es el mismo en /v3 y en el panel: el `<body>` no se reemplaza, y React no saca lo que no puso). Se cuelga
 * encima de todo apenas la acción redirige —la hoja ya es negra: no se ve el cambio—; cuando la ruta ya no es la de antes (el panel
 * está montado), dos cuadros después (pintado) se funde a transparente y se va. Si la ruta no cambia en `esperaMaximaMs`, se va
 * igual (nada queda tapado para siempre). Con una redirección afuera (Google), la página se va con él.
 */

export const TELON = {
  /** El fundido al panel. */
  fundidoMs: 450,
  /** La curva premium del sitio (`AGENTS.md`). */
  curva: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  /** Lo más que espera a que la ruta cambie. */
  esperaMaximaMs: 8000,
} as const

export const SELECTOR_DEL_TELON = '[data-pieza="telon-del-ingreso"]'

/** El negro de la hoja, ya resuelto (el telón vive fuera de /v3: sus tokens no llegan ahí). */
export function colorDelTelon(): string {
  const hoja = document.querySelector<HTMLElement>('[data-pieza="ingreso"] [data-parte="fondo"]')
  const color = hoja === null ? '' : getComputedStyle(hoja).backgroundColor
  return color === '' || color === 'rgba(0, 0, 0, 0)' ? 'black' : color
}

/** [C2 · 80] Si la página vuelve de la caché de ida y vuelta (de Google), el telón de la ida no se queda tapándola. */
export function quitarElTelon(): void {
  if (typeof document === 'undefined') return
  document.querySelectorAll(SELECTOR_DEL_TELON).forEach((t) => t.remove())
}

export function bajarElTelon(): void {
  if (typeof document === 'undefined' || document.querySelector(SELECTOR_DEL_TELON) !== null) return
  const telon = document.createElement('div')
  telon.setAttribute('data-pieza', 'telon-del-ingreso')
  telon.setAttribute('aria-hidden', 'true')
  Object.assign(telon.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    background: colorDelTelon(),
    pointerEvents: 'none',
    opacity: '1',
    transition: `opacity ${String(TELON.fundidoMs)}ms ${TELON.curva}`,
  })
  document.body.appendChild(telon)
  const ruta = window.location.pathname
  const desde = performance.now()
  const levantar = (): void => {
    telon.style.opacity = '0'
    window.setTimeout(() => telon.remove(), TELON.fundidoMs + 100)
  }
  const mirar = (): void => {
    if (window.location.pathname !== ruta || performance.now() - desde > TELON.esperaMaximaMs) {
      // Dos cuadros: en el primero se pinta el panel recién montado; en el segundo arranca el fundido, sobre lo pintado.
      requestAnimationFrame(() => requestAnimationFrame(levantar))
      return
    }
    requestAnimationFrame(mirar)
  }
  requestAnimationFrame(mirar)
}

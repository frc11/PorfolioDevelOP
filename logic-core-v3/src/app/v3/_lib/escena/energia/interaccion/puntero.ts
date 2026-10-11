import { apretar, cancelar, moverApretado, soltar, type EstadoDelPuntero } from './interaccion'

/**
 * [PULIDO 16] N2 · LOS OYENTES DEL PUNTERO (la máquina, `interaccion.ts`). El mouse por los eventos del puntero (sólo los del mouse);
 * el dedo por los eventos táctiles (los del puntero se cancelan apenas el dedo desplaza la página, y el dedo sigue siendo una carga
 * mientras toca). Todos pasivos: no frenan el scroll ni el clic de la página. Devuelve cómo soltarlos.
 */

/** Lo que es de la página: un texto o algo que se cliquea (ahí el gesto no cuenta). */
const DE_LA_PAGINA = 'a, button, input, textarea, select, label, summary, [role="button"], [role="link"], h1, h2, h3, h4, h5, h6, p, li, figcaption, blockquote, img, video, iframe'

const esDeLaPagina = (t: EventTarget | null): boolean => t instanceof Element && t.closest(DE_LA_PAGINA) !== null

export function escucharElPuntero(e: EstadoDelPuntero): () => void {
  const enNdc = (x: number, y: number): void => {
    e.x = (x / Math.max(1, window.innerWidth)) * 2 - 1
    e.y = 1 - (y / Math.max(1, window.innerHeight)) * 2
    e.fuera = false
  }
  const mover = (ev: PointerEvent): void => {
    if (ev.pointerType !== 'mouse') return
    enNdc(ev.clientX, ev.clientY)
    e.mouse = true
    e.dedo = false
  }
  const bajar = (ev: PointerEvent): void => {
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return
    mover(ev)
    apretar(e, performance.now(), ev.clientX, ev.clientY, esDeLaPagina(ev.target))
  }
  const subir = (ev: PointerEvent): void => {
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return
    soltar(e, performance.now())
  }
  const tocar = (ev: TouchEvent): void => {
    const t = ev.touches[0]
    e.dedo = t !== undefined
    e.mouse = false
    if (t === undefined) return
    enNdc(t.clientX, t.clientY)
    if (ev.type === 'touchstart') apretar(e, performance.now(), t.clientX, t.clientY, ev.touches.length > 1 || esDeLaPagina(ev.target))
    else moverApretado(e, t.clientX, t.clientY, true)
  }
  const dejar = (ev: TouchEvent): void => {
    e.dedo = ev.touches.length > 0
    if (ev.type === 'touchcancel') cancelar(e)
    else soltar(e, performance.now())
  }
  const salir = (ev: MouseEvent): void => {
    if (ev.relatedTarget === null) e.fuera = true
  }
  const perder = (): void => cancelar(e)
  window.addEventListener('pointermove', mover, { passive: true })
  window.addEventListener('pointerdown', bajar, { passive: true })
  window.addEventListener('pointerup', subir, { passive: true })
  window.addEventListener('touchstart', tocar, { passive: true })
  window.addEventListener('touchmove', tocar, { passive: true })
  window.addEventListener('touchend', dejar, { passive: true })
  window.addEventListener('touchcancel', dejar, { passive: true })
  window.addEventListener('blur', perder)
  document.addEventListener('mouseout', salir)
  return () => {
    window.removeEventListener('pointermove', mover)
    window.removeEventListener('pointerdown', bajar)
    window.removeEventListener('pointerup', subir)
    window.removeEventListener('touchstart', tocar)
    window.removeEventListener('touchmove', tocar)
    window.removeEventListener('touchend', dejar)
    window.removeEventListener('touchcancel', dejar)
    window.removeEventListener('blur', perder)
    document.removeEventListener('mouseout', salir)
  }
}

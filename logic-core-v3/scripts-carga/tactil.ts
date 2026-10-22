/**
 * [F5] LOS GESTOS DEL DEDO, POR CDP — para el arnés del carrusel ([B1.2e] `carrusel.ts`; era el de las historias) y las fotos (`fotos.ts`). Playwright no arrastra con
 * el dedo: el scroll táctil va con `Input.synthesizeScrollGesture` (el del navegador, con su inercia) y un deslice sobre una superficie
 * (las historias, que tienen `touch-action: none`) con `Input.dispatchTouchEvent` (`touchStart`, los `touchMove` y `touchEnd`: el
 * navegador los convierte en eventos de puntero táctiles).
 */
import type { CDPSession } from '@playwright/test'

const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * Desplaza la página con el dedo unos `dy` px (positivo: hacia abajo, el contenido sube), desde (x, y): arrastres de a lo sumo `tramo`
 * px, cada uno en ~250 ms y quieto al final (sin inercia: el dedo se frena antes de soltar). `Input.synthesizeScrollGesture` no movía la
 * página en el Chrome del arnés; el arrastre con `dispatchTouchEvent`, sí (es el scroll nativo del dedo).
 */
export async function desplazarConElDedo(cdp: CDPSession, x: number, y: number, dy: number, tramo = 300): Promise<void> {
  let falta = dy
  while (Math.abs(falta) > 0.5) {
    const ahora = Math.sign(falta) * Math.min(tramo, Math.abs(falta))
    const desde = y + ahora / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: desde, id: 1 }] })
    for (let i = 1; i <= 15; i++) {
      await dormir(16)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: desde - (ahora * i) / 15, id: 1 }] })
    }
    // El dedo se frena antes de soltar (movimientos en el mismo lugar): sin velocidad no hay inercia.
    for (let i = 0; i < 8; i++) {
      await dormir(20)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: desde - ahora, id: 1 }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await dormir(60)
    falta -= ahora
  }
}

/** Un deslice del dedo de (x, y) a (x + dx, y + dy) en `ms`, en pasos de ~16 ms. */
export async function deslizar(cdp: CDPSession, x: number, y: number, dx: number, dy: number, ms = 180): Promise<void> {
  const pasos = Math.max(2, Math.round(ms / 16))
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  for (let i = 1; i <= pasos; i++) {
    await dormir(ms / pasos)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / pasos, y: y + (dy * i) / pasos, id: 1 }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

/** Un toque corto en (x, y). */
export async function tocar(cdp: CDPSession, x: number, y: number): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  await dormir(60)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

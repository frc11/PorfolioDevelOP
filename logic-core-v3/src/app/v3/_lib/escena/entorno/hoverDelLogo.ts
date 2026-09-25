import * as THREE from 'three'

import { AMANECER, ATARDECER } from '../lightArc'
import { viajeEnCurso } from '../viaje'

/**
 * [ESCENA 3] E4 y E7 · ¿EL PUNTERO ESTÁ SOBRE EL LOGO? — sin tocar el `pointer-events` del canvas.
 *
 * Escucha `pointermove` en `window` y, como mucho una vez por cuadro y sólo si el puntero se movió
 * o la cámara cambió de progreso, tira un rayo contra un PROXY de la silueta: la caja del logo en el
 * mundo. Contra la malla titilaba: la «cp» tiene agujeros, y un cursor que entra cruza trazos y
 * huecos, así que el hover entraba y salía varias veces en medio segundo y cada vuelta largaba un
 * pulso principal. La caja no tiene agujeros, y encima hay una histéresis corta (`HISTERESIS`) para
 * que el balanceo del logo en el borde no titile. Cuenta como hover sólo si pasan TODAS las
 * compuertas:
 *
 * - puntero fino con hover real (mouse o lápiz); en táctil no hay hover, y tampoco empuje de E7;
 * - el puntero no está sobre un link, botón o campo: su hover manda;
 * - no hay un viaje del navbar en curso;
 * - el logo está en pantalla y no en transición: fuera del túnel de Trabajos y de la banda opaca de
 *   Servicios y Tu panel (del final de la tarde al amanecer del arco);
 * - nada opaco lo tapa en ese punto.
 */

const INTERACTIVOS = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"]'

/** Cuánto tiene que sostenerse el cambio para contar, en segundos: entrar rápido, salir con calma. */
export const HISTERESIS = { entrarS: 0.08, salirS: 0.2 } as const

/** La franja del recorrido donde el logo está en el túnel o tapado: sin hover. */
export const SIN_HOVER = { desde: ATARDECER.hasta, hasta: AMANECER.hasta } as const

export interface HoverDelLogo {
  /** ¿El puntero es un mouse o un lápiz en un dispositivo con hover real? Lo usa también E7. */
  readonly fino: () => boolean
  /** Una vez por cuadro. */
  readonly leer: (camara: THREE.Camera, lienzo: HTMLCanvasElement, logo: THREE.Object3D | null, progreso: number) => boolean
  readonly soltar: () => void
}

function tapadoEn(x: number, y: number, lienzo: HTMLCanvasElement): boolean {
  let el = document.elementFromPoint(x, y)
  while (el !== null && el !== document.body && el !== document.documentElement) {
    if (el === lienzo || el.contains(lienzo)) return false
    const fondo = getComputedStyle(el).backgroundColor
    const alfa = /rgba\([^)]*,\s*([\d.]+)\)/.exec(fondo)
    if (fondo.startsWith('rgb(') || (alfa !== null && Number(alfa[1]) > 0.6)) return true
    el = el.parentElement
  }
  return false
}

export function crearHoverDelLogo(): HoverDelLogo {
  const consulta = window.matchMedia('(hover: hover) and (pointer: fine)')
  const puntero = { x: 0, y: 0, adentro: false, tipo: 'mouse', sobreInteractivo: false, cambio: true }
  const rayo = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const caja = new THREE.Box3()
  let crudo = false
  let estable = false
  let cambioDesde = 0
  let progresoAnterior = Number.NaN

  const alMover = (e: PointerEvent): void => {
    puntero.x = e.clientX
    puntero.y = e.clientY
    puntero.adentro = true
    puntero.tipo = e.pointerType
    puntero.sobreInteractivo = e.target instanceof Element && e.target.closest(INTERACTIVOS) !== null
    puntero.cambio = true
  }
  const alSalir = (e: PointerEvent): void => {
    if (e.relatedTarget === null) {
      puntero.adentro = false
      puntero.cambio = true
    }
  }
  window.addEventListener('pointermove', alMover, { passive: true })
  document.addEventListener('pointerout', alSalir, { passive: true })

  const fino = (): boolean => consulta.matches && (puntero.tipo === 'mouse' || puntero.tipo === 'pen')

  const medirElHover = (camara: THREE.Camera, lienzo: HTMLCanvasElement, logo: THREE.Object3D | null, progreso: number): boolean => {
    if (logo === null || !puntero.adentro || !fino() || puntero.sobreInteractivo) return false
    if (viajeEnCurso() !== null) return false
    if (progreso >= SIN_HOVER.desde && progreso <= SIN_HOVER.hasta) return false
    const r = lienzo.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return false
    caja.setFromObject(logo)
    if (caja.isEmpty()) return false
    ndc.set(((puntero.x - r.left) / r.width) * 2 - 1, -(((puntero.y - r.top) / r.height) * 2 - 1))
    rayo.setFromCamera(ndc, camara)
    return rayo.ray.intersectsBox(caja) && !tapadoEn(puntero.x, puntero.y, lienzo)
  }

  return {
    fino,
    leer: (camara, lienzo, logo, progreso) => {
      if (puntero.cambio || progreso !== progresoAnterior) {
        puntero.cambio = false
        progresoAnterior = progreso
        crudo = medirElHover(camara, lienzo, logo, progreso)
      }
      // La histéresis: el cambio cuenta recién cuando se sostuvo.
      const ahora = performance.now() / 1000
      if (crudo === estable) cambioDesde = ahora
      else if (ahora - cambioDesde >= (crudo ? HISTERESIS.entrarS : HISTERESIS.salirS)) estable = crudo
      return estable
    },
    soltar: () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerout', alSalir)
    },
  }
}

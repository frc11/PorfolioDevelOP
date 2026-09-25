import * as THREE from 'three'

import { AMANECER, ATARDECER } from '../lightArc'
import { viajeEnCurso } from '../viaje'
import { dentroDelConvexo, envolventeConvexa, type Punto } from './silueta'

/**
 * [ESCENA 3] E4 y E7 · ¿EL PUNTERO ESTÁ SOBRE EL LOGO? — sin tocar el `pointer-events` del canvas.
 *
 * Escucha `pointermove` en `window` y, como mucho una vez por cuadro y sólo si el puntero se movió
 * o la cámara cambió de progreso, tira un rayo contra un PROXY de la silueta: la ENVOLVENTE CONVEXA
 * de la «cp» (`silueta.ts`), calculada una vez sobre la geometría, en el espacio del propio logo.
 * Contra la malla titilaba: la «cp» tiene agujeros, y un cursor que entra cruza trazos y huecos, así
 * que el hover entraba y salía varias veces en medio segundo y cada vuelta largaba un pulso
 * principal. Contra la caja, las esquinas vacías contaban como hover. La envolvente no tiene ninguna
 * de las dos cosas, y encima hay una histéresis corta (`HISTERESIS`) para que el balanceo del logo en
 * el borde no titile. Cuenta como hover sólo si pasan TODAS las compuertas:
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

interface Silueta {
  readonly poligono: Punto[]
  /** El eje de la profundidad del logo (el de menor extensión) y los dos del plano. */
  readonly eje: number
  readonly u: number
  readonly v: number
  /** La coordenada del plano medio sobre `eje`. */
  readonly plano: number
}

/** La envolvente convexa de todos los vértices del logo, en su espacio local. `null` si no cargó. */
function construirSilueta(logo: THREE.Object3D): Silueta | null {
  logo.updateMatrixWorld(true)
  const inversa = new THREE.Matrix4().copy(logo.matrixWorld).invert()
  const aLocal = new THREE.Matrix4()
  const v = new THREE.Vector3()
  const puntos: THREE.Vector3[] = []
  logo.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    const posicion = o.geometry.getAttribute('position')
    if (posicion === undefined) return
    aLocal.multiplyMatrices(inversa, o.matrixWorld)
    for (let i = 0; i < posicion.count; i += 1) puntos.push(v.fromBufferAttribute(posicion, i).applyMatrix4(aLocal).clone())
  })
  if (puntos.length < 3) return null
  const caja = new THREE.Box3().setFromPoints(puntos)
  const tam = caja.getSize(new THREE.Vector3())
  const eje = tam.x <= tam.y && tam.x <= tam.z ? 0 : tam.y <= tam.z ? 1 : 2
  const [u, w] = [0, 1, 2].filter((k) => k !== eje)
  return {
    poligono: envolventeConvexa(puntos.map((p): Punto => [p.getComponent(u), p.getComponent(w)])),
    eje,
    u,
    v: w,
    plano: (caja.min.getComponent(eje) + caja.max.getComponent(eje)) / 2,
  }
}

export function crearHoverDelLogo(): HoverDelLogo {
  const consulta = window.matchMedia('(hover: hover) and (pointer: fine)')
  const puntero = { x: 0, y: 0, adentro: false, tipo: 'mouse', sobreInteractivo: false, cambio: true }
  const rayo = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const inversa = new THREE.Matrix4()
  const rayoLocal = new THREE.Ray()
  let silueta: Silueta | null = null
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
    silueta ??= construirSilueta(logo)
    if (silueta === null) return false
    ndc.set(((puntero.x - r.left) / r.width) * 2 - 1, -(((puntero.y - r.top) / r.height) * 2 - 1))
    rayo.setFromCamera(ndc, camara)
    // El rayo, al espacio del logo (con la vira de este cuadro), cortado con su plano medio.
    inversa.copy(logo.matrixWorld).invert()
    rayoLocal.copy(rayo.ray).applyMatrix4(inversa)
    const o = rayoLocal.origin.getComponent(silueta.eje)
    const d = rayoLocal.direction.getComponent(silueta.eje)
    if (Math.abs(d) < 1e-9) return false
    const t = (silueta.plano - o) / d
    if (t < 0) return false
    const x = rayoLocal.origin.getComponent(silueta.u) + rayoLocal.direction.getComponent(silueta.u) * t
    const y = rayoLocal.origin.getComponent(silueta.v) + rayoLocal.direction.getComponent(silueta.v) * t
    return dentroDelConvexo(silueta.poligono, x, y) && !tapadoEn(puntero.x, puntero.y, lienzo)
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

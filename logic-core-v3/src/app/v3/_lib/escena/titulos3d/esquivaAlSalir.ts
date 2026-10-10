import * as THREE from 'three'

import { destinoDelViaje } from '../../../_componentes/destinosDelViaje'
import { seCruzan, type Caja } from './esquivaDelLogo'

/**
 * [PULIDO 12] EL TEXTO QUE ESQUIVA EL LOGO AL SALIR — el cuerpo de Quiénes somos queda en el reposo justo debajo del logo y, al
 * seguir bajando, sube a través de él: su silueta lo cruzaba en toda la salida (de ~24 a ~600 px después del reposo a 1440 y
 * a ~430 a 1024; medido: `pulido-12/q-salida/`). Un elemento del DOM con `data-esquiva-al-salir`, pasado el reposo de su
 * sección (el del viaje del menú: `destinoDelViaje`) más de `saleDesdePx`, se va (`seVaS`) si su caja (la que se ve) cruza la
 * del logo proyectado con la cámara de verdad, y no vuelve hasta que el scroll vuelve a menos de `vuelveHastaPx` del reposo
 * (si no, reaparecería un instante arriba del todo al pasar el logo; y las dos marcas distintas no lo hacen titilar). En el
 * reposo no esquiva nada (A2). Desde 1024 (la escena de los títulos se monta ahí): abajo el cuerpo va en la cadena de mezcla,
 * que una opacidad en un ancestro corta.
 */
export const ESQUIVA_AL_SALIR = { saleDesdePx: 24, vuelveHastaPx: 8, seVaS: 0.3, vuelveS: 0.45 } as const

/** Lo pedido (1 se ve, 0 se fue) y si ya se fue en esta salida; `pasado`: px de scroll después del reposo de su sección. */
export function pedidoAlSalir(pasado: number, caja: Caja | null, logo: Caja | null, seFue: boolean): { readonly pedido: 0 | 1; readonly seFue: boolean } {
  if (pasado <= ESQUIVA_AL_SALIR.vuelveHastaPx) return { pedido: 1, seFue: false }
  if (seFue) return { pedido: 0, seFue: true }
  if (pasado > ESQUIVA_AL_SALIR.saleDesdePx && caja !== null && logo !== null && seCruzan(caja, logo)) return { pedido: 0, seFue: true }
  return { pedido: 1, seFue: false }
}

const estados = new WeakMap<HTMLElement, { mostrado: number; seFue: boolean }>()
const [ESQUINA, CAJA] = [new THREE.Vector3(), new THREE.Box3()]

/** El reposo de cada sección (px de scroll), tomado una vez por tamaño del cuadro y del panel (medirlo cada cuadro sería caro). */
const reposos = new WeakMap<HTMLElement, { readonly ancho: number; readonly alto: number; readonly altoDelPanel: number; readonly y: number }>()
function reposoDe(panel: HTMLElement): number {
  const [ancho, alto, altoDelPanel] = [window.innerWidth, window.innerHeight, panel.offsetHeight]
  const r = reposos.get(panel)
  if (r !== undefined && r.ancho === ancho && r.alto === alto && r.altoDelPanel === altoDelPanel) return r.y
  const y = destinoDelViaje(panel)
  reposos.set(panel, { ancho, alto, altoDelPanel, y })
  return y
}

/**
 * La caja del logo en el cuadro (px CSS) por las esquinas de la caja de cada malla: más grande que la silueta (de su lado
 * seguro), y sin perder las puntas que un muestreo de vértices salteaba (el pie de la P: a 1920 y 2560 se cruzaba unos px antes).
 */
export function cajaHolgadaDelLogo(grupo: THREE.Object3D, camara: THREE.Camera, ancho: number, alto: number): Caja | null {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  grupo.traverseVisible((o) => {
    if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
    if (o.geometry.boundingBox === null) o.geometry.computeBoundingBox()
    if (o.geometry.boundingBox === null) return
    CAJA.copy(o.geometry.boundingBox)
    for (let k = 0; k < 8; k += 1) {
      ESQUINA.set(k & 1 ? CAJA.max.x : CAJA.min.x, k & 2 ? CAJA.max.y : CAJA.min.y, k & 4 ? CAJA.max.z : CAJA.min.z).applyMatrix4(o.matrixWorld).project(camara)
      if (ESQUINA.z > 1) continue
      const [px, py] = [((ESQUINA.x + 1) / 2) * ancho, ((1 - ESQUINA.y) / 2) * alto]
      ;[x0, y0, x1, y1] = [Math.min(x0, px), Math.min(y0, py), Math.max(x1, px), Math.max(y1, py)]
    }
  })
  return x0 <= x1 ? { izquierda: x0, arriba: y0, derecha: x1, abajo: y1 } : null
}

/**
 * Un cuadro: cada elemento marcado, hacia lo pedido (de golpe con movimiento reducido), escrito en su opacidad. Su caja y la del
 * logo se miden sólo cuando pueden cambiar algo (a la vista en el reposo, o ya ido en esta salida: nada que hacer).
 */
export function esquivarAlSalir(logo: () => Caja | null, quieto: boolean, dt: number): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-esquiva-al-salir]')) {
    const panel = el.closest<HTMLElement>('[data-panel]')
    if (panel === null) continue
    const e = estados.get(el) ?? { mostrado: 1, seFue: false }
    const pasado = window.scrollY - reposoDe(panel)
    const enElReposo = pasado <= ESQUIVA_AL_SALIR.vuelveHastaPx
    if ((enElReposo && !e.seFue && e.mostrado >= 1) || (!enElReposo && e.seFue && e.mostrado <= 0)) continue
    const mira = !enElReposo && !e.seFue && pasado > ESQUIVA_AL_SALIR.saleDesdePx
    const r = mira ? el.getBoundingClientRect() : null
    const caja = r === null ? null : { izquierda: r.left, arriba: r.top, derecha: r.right, abajo: r.bottom }
    const { pedido, seFue } = pedidoAlSalir(pasado, caja, mira ? logo() : null, e.seFue)
    const paso = dt / (pedido === 0 ? ESQUIVA_AL_SALIR.seVaS : ESQUIVA_AL_SALIR.vuelveS)
    e.mostrado = quieto ? pedido : pedido > e.mostrado ? Math.min(pedido, e.mostrado + paso) : Math.max(pedido, e.mostrado - paso)
    e.seFue = seFue
    estados.set(el, e)
    const opacidad = e.mostrado >= 0.999 ? '' : e.mostrado.toFixed(3)
    if (el.style.opacity !== opacidad) el.style.opacity = opacidad
  }
}

/** Al desmontarse la escena de los títulos (abajo de 1024, o al irse): todo a la vista y sin estado viejo. */
export function soltarLosQueEsquivan(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-esquiva-al-salir]')) {
    el.style.opacity = ''
    estados.delete(el)
  }
}

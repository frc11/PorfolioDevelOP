/**
 * [B4] UN VUELO CON DUEÑO Y CON FIN — el de A8 (`trabajos/portfolio/medida.ts`), sin el Portfolio adentro: lo usa la máquina de
 * gatillos de Servicios (`useGatillos.ts`). El del Portfolio sigue en su `medida.ts` (s76 lee su texto); el día que se unifiquen, es
 * éste.
 *
 *   · **Existe ANTES de lanzar el salto** ([B1.2c]): uno inmediato llega en el acto y su llegada lo lee.
 *   · **Se suelta de tres maneras**, todas por `soltar` (que también borra el vencimiento): la llegada, la cancelación (otro vuelo, o
 *     `vueloPisado` desde la lectura del scroll) y el vencimiento (lo que dura más `VUELO_DEL_GATILLO.margenMs`).
 *   · **Pisado** (A8.1): con Lenis, si la marca de su `userData` ya no es la del vuelo, alguien le pisó el viaje (la rueda de otra
 *     sección, el menú, un ancla) y el vuelo se suelta en esa misma lectura: nunca queda clavado en un destino que no va a llegar.
 */

import { LENIS_DEL_SITIO } from '../../_lib/lenisDelSitio'

import { CLAVE_DEL_VUELO, saltarA } from './salto'

export interface VueloDelGatillo {
  readonly id: symbol
  /** El scroll de destino (px de la página). */
  readonly y: number
  /** La marca del viaje en el `userData` de Lenis (`null`: inmediato, o sin Lenis). */
  readonly marca: string | null
  readonly cancelar: () => void
}

export const VUELO_DEL_GATILLO = { margenMs: 1000 } as const

let vuelos = 0

/** Lleva la página a `y` en `ms` (0: en silencio). `alSoltar` corre una vez, cuando el vuelo se suelta por cualquiera de las tres. */
export function volar(enVuelo: { current: VueloDelGatillo | null }, y: number, ms: number, alSoltar?: () => void): void {
  enVuelo.current?.cancelar()
  const id = Symbol('vuelo-del-gatillo')
  vuelos += 1
  const marca = ms > 0 && LENIS_DEL_SITIO.instancia !== null ? `gatillo-${String(vuelos)}` : null
  let vence = 0
  const soltar = (): void => {
    window.clearTimeout(vence)
    if (enVuelo.current?.id !== id) return
    enVuelo.current = null
    alSoltar?.()
  }
  enVuelo.current = { id, y, marca, cancelar: soltar }
  const detener = saltarA(y, ms, soltar, marca)
  if (enVuelo.current?.id !== id) return
  vence = window.setTimeout(soltar, ms + VUELO_DEL_GATILLO.margenMs)
  enVuelo.current = {
    id,
    y,
    marca,
    cancelar: () => {
      detener()
      soltar()
    },
  }
}

/** ¿Alguien le pisó el viaje? Con Lenis, la marca de su `userData` ya no es la del vuelo. Uno inmediato o sin Lenis no se mira. */
export function vueloDelGatilloPisado(vuelo: VueloDelGatillo, lenis: { readonly userData: Readonly<Record<string, unknown>> } | null): boolean {
  if (lenis === null || vuelo.marca === null) return false
  return lenis.userData[CLAVE_DEL_VUELO] !== vuelo.marca
}

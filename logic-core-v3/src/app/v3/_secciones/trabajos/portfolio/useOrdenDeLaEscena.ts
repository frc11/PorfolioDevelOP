'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

import { conElDefectoDeLaLlegada, suscribirAlViaje, viajeEnCurso } from '../../../_lib/escena/viaje'

import { vistaDelPaso } from './estado'
import { conElDefecto, medir } from './medida'
import { AFUERA, NUNCA, siguienteCambio, type Cambios, type Orden } from './orden'
import { PANTALLAS_POR_PASO, pasoEn, pxDelScroll } from './pasos'

const hayViaje = (): boolean => viajeEnCurso() !== null
const sinViaje = (): boolean => false

/**
 * [B1.2c] EL ORDEN, POR TIEMPO (`orden.ts`): lleva lo que se muestra hacia lo pedido de a un cambio, cada uno cuando le toca. Si lo
 * pedido cambia en el medio, se vuelve a decidir desde lo que se muestra (con la misma regla y los mismos relojes de cada pieza). Con
 * movimiento reducido, de una. Un solo temporizador a la vez, y se borra con cada pedido nuevo y al desmontar.
 *
 * [C2-21] Y en un viaje del menú, irse es de una: el `<main>` va apagado por el velo, la salida en orden no se ve, y la cámara (la última
 * del orden) retenía la pose del Portfolio hasta después de la llegada.
 */
export function useOrdenDeLaEscena(pedido: Orden, tituloS: number, reducido: boolean): Orden {
  const [orden, setOrden] = useState<Orden>(AFUERA)
  const actual = useRef<Orden>(AFUERA)
  const cambios = useRef<Cambios>(NUNCA)
  // Lo que tarda el título se lee al decidir (no reinicia una espera en curso: el título 3D puede quedar listo en el medio).
  const titulo = useRef(tituloS)
  useEffect(() => {
    titulo.current = tituloS
  }, [tituloS])
  const enViaje = useSyncExternalStore(suscribirAlViaje, hayViaje, sinViaje)
  const { camara, encabezado, barra, panel } = pedido
  useEffect(() => {
    const pedidoDeAhora: Orden = { camara, encabezado, barra, panel }
    const deUna = reducido || (enViaje && !camara && !encabezado && !barra && !panel && !conElDefectoDeLaLlegada('sin-soltar'))
    let reloj = 0
    const avanzar = (): void => {
      const ahora = performance.now() / 1000
      const c = siguienteCambio(actual.current, cambios.current, pedidoDeAhora, ahora, titulo.current, deUna, { pildoraConElPanel: conElDefecto('pildora-con-el-panel') })
      if (c === null) return
      if (c.en > ahora) {
        reloj = window.setTimeout(avanzar, (c.en - ahora) * 1000)
        return
      }
      actual.current = { ...actual.current, [c.pieza]: c.valor }
      cambios.current = { ...cambios.current, [c.pieza]: ahora }
      setOrden(actual.current)
      avanzar()
    }
    avanzar()
    return () => window.clearTimeout(reloj)
  }, [camara, encabezado, barra, panel, reducido, enViaje])
  return orden
}

/** [C2-21] ¿Un viaje que termina en `y1` (px de scroll) termina fuera del Portfolio (antes del pin o en la cola)? Puro: lo prueba s78-c21. */
export function destinoFueraDelPortfolio(y1: number, topeDelPanel: number, alto: number): boolean {
  return vistaDelPaso(pasoEn(pxDelScroll(y1, topeDelPanel, alto), PANTALLAS_POR_PASO)).fase !== 'adentro'
}

/**
 * [C2-21] UN VIAJE DEL MENÚ QUE SALE DEL PORTFOLIO lo suelta desde el clic: la pose del logo, el oscurecido y la píldora corrida vuelven
 * a la normalidad mientras viaja (con su persecución de 0,7 s, que entra en cualquier viaje), no recién cuando el scroll sale del pin.
 * Decidido al empezar el viaje, con su destino (`y1`); al terminar, vuelve a mandar el scroll.
 */
export function useViajeQueSale(caja: RefObject<HTMLElement | null>): boolean {
  const [sale, setSale] = useState(false)
  useEffect(
    () =>
      suscribirAlViaje(() => {
        const v = viajeEnCurso()
        const m = v === null || v.y1 === undefined ? null : medir(caja.current)
        setSale(v !== null && v.y1 !== undefined && m !== null && !conElDefectoDeLaLlegada('sin-soltar') && destinoFueraDelPortfolio(v.y1, m.tope, m.alto))
      }),
    [caja],
  )
  return sale
}

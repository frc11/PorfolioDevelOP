'use client'

import { useEffect, useRef, useState } from 'react'

import { AFUERA, NUNCA, siguienteCambio, type Cambios, type Orden } from './orden'

/**
 * [B1.2c] EL ORDEN, POR TIEMPO (`orden.ts`): lleva lo que se muestra hacia lo pedido de a un cambio, cada uno cuando le toca. Si lo
 * pedido cambia en el medio, se vuelve a decidir desde lo que se muestra (con la misma regla y los mismos relojes de cada pieza). Con
 * movimiento reducido, de una. Un solo temporizador a la vez, y se borra con cada pedido nuevo y al desmontar.
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
  const { camara, encabezado, barra, panel } = pedido
  useEffect(() => {
    const pedidoDeAhora: Orden = { camara, encabezado, barra, panel }
    let reloj = 0
    const avanzar = (): void => {
      const ahora = performance.now() / 1000
      const c = siguienteCambio(actual.current, cambios.current, pedidoDeAhora, ahora, titulo.current, reducido)
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
  }, [camara, encabezado, barra, panel, reducido])
  return orden
}

'use client'

import { useEffect, useRef, useState } from 'react'

import { AFUERA, siguientePaso, type Orden } from './orden'

/**
 * [B1.2c] EL ORDEN, POR TIEMPO (`orden.ts`): lleva lo que se muestra hacia lo pedido de a un paso, esperando lo que tarda cada uno.
 * Si lo pedido cambia en el medio, se vuelve a decidir desde lo que se muestra (con la misma regla). Con movimiento reducido, de una.
 */
export function useOrdenDeLaEscena(pedidoEscena: boolean, pedidoEncabezado: boolean, caidaS: number, reducido: boolean): Orden {
  const [orden, setOrden] = useState<Orden>(AFUERA)
  const actual = useRef<Orden>(AFUERA)
  // La caída se lee al decidir (no reinicia una espera en curso: el título 3D puede quedar listo en el medio).
  const caida = useRef(caidaS)
  useEffect(() => {
    caida.current = caidaS
  }, [caidaS])
  useEffect(() => {
    const pedido: Orden = { escena: pedidoEscena, encabezado: pedidoEncabezado }
    let reloj = 0
    const avanzar = (): void => {
      const paso = siguientePaso(actual.current, pedido, caida.current, reducido)
      if (paso === null) return
      actual.current = paso.estado
      setOrden(paso.estado)
      if (paso.esperaS > 0) reloj = window.setTimeout(avanzar, paso.esperaS * 1000)
      else avanzar()
    }
    avanzar()
    return () => window.clearTimeout(reloj)
  }, [pedidoEscena, pedidoEncabezado, reducido])
  return orden
}

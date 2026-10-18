'use client'

import { useEffect, useState } from 'react'

import { avanzarTransicion, duracionDeLaFase, pedirTira, quietaEn, type TransicionDeLasTiras } from './transicion'

/**
 * [B1.2c] LA TRANSICIÓN ENTRE PROYECTOS, POR TIEMPO (`transicion.ts`): cada pedido cambia el destino (en el render en que llega: el
 * estado que se ajusta a una prop) y cada fase termina sola (la salida del contenido, el reacomodo de los anchos, el respiro).
 * Arranca quieta en la tira pedida (sin transición al montar).
 */
export function useTransicionDeLasTiras(pedida: number, reducido: boolean): TransicionDeLasTiras {
  const [t, setT] = useState<TransicionDeLasTiras>(() => quietaEn(pedida))
  const [pedido, setPedido] = useState({ pedida, reducido })
  if (pedido.pedida !== pedida || pedido.reducido !== reducido) {
    setPedido({ pedida, reducido })
    setT(pedirTira(t, pedida, reducido))
  }
  useEffect(() => {
    const dura = duracionDeLaFase(t.fase)
    if (dura === null) return undefined
    const reloj = window.setTimeout(() => setT((antes) => (antes === t ? avanzarTransicion(antes) : antes)), dura * 1000)
    return () => window.clearTimeout(reloj)
  }, [t])
  return t
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { useCoreografiaActiva } from '../_contrato/coreografia'
import { Ampliacion } from './Ampliacion'
import { TARJETAS } from './contenido'
import { CLASE_DE_LA_GRILLA, corrimientoDelParallax } from './geometria'
import { Tarjeta } from './Tarjeta'

/**
 * LA GALERÍA — las ocho tarjetas en la grilla de nk, el parallax y la ampliación.
 *
 * El parallax corre sólo con la coreografía activa (≥ 1025 y sin movimiento
 * reducido) y con UNA suscripción de scroll para todas las tarjetas: un
 * `requestAnimationFrame` por evento como mucho, y sólo se escriben las que
 * están en pantalla. Apagado, las capas quedan como las dejó el marcado.
 */
export function Galeria(): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const reducido = usePrefiereMenosMovimiento()
  const [abierta, setAbierta] = useState<number | null>(null)
  const botones = useRef<(HTMLButtonElement | null)[]>([])
  const marcos = useRef<(HTMLSpanElement | null)[]>([])
  const capas = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!anima) return
    let pedido = 0
    const pintar = (): void => {
      pedido = 0
      const alto = window.innerHeight
      marcos.current.forEach((marco, i) => {
        const capa = capas.current[i]
        if (marco === null || capa === null || capa === undefined) return
        const caja = marco.getBoundingClientRect()
        if (caja.bottom < 0 || caja.top > alto) return
        capa.style.transform = `translate3d(0, ${corrimientoDelParallax(caja.top, caja.height, alto)}px, 0)`
      })
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    const capasAlMontar = capas.current
    pintar()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const capa of capasAlMontar) if (capa !== null) capa.style.transform = ''
    }
  }, [anima])

  const marcoDe = useCallback((i: number): HTMLElement | null => marcos.current[i] ?? null, [])

  // El foco vuelve a la tarjeta que estaba abierta al cerrar, no a la que se abrió.
  const cerrar = useCallback((): void => {
    if (abierta !== null) botones.current[abierta]?.focus({ preventScroll: true })
    setAbierta(null)
  }, [abierta])

  return (
    <>
      <ul data-pieza="galeria-del-panel" className={CLASE_DE_LA_GRILLA}>
        {TARJETAS.map((tarjeta, i) => (
          <Tarjeta
            key={tarjeta.titulo}
            tarjeta={tarjeta}
            indice={i}
            alAbrir={setAbierta}
            refDelBoton={(el) => {
              botones.current[i] = el
            }}
            refDelMarco={(el) => {
              marcos.current[i] = el
            }}
            refDelParallax={(el) => {
              capas.current[i] = el
            }}
          />
        ))}
      </ul>
      {abierta !== null && (
        <Ampliacion tarjetas={TARJETAS} indice={abierta} reducido={reducido} marcoDe={marcoDe} alCambiar={setAbierta} alCerrar={cerrar} />
      )}
    </>
  )
}

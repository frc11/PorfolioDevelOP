'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { useCoreografiaActiva } from '../_contrato/coreografia'
import { Ampliacion } from './Ampliacion'
import { TARJETAS } from './contenido'
import { Fondo } from './Fondo'
import { arranques, corrimientoDeProfundidad, corrimientoDelParallax } from './geometria'
import { Tarjeta } from './Tarjeta'

const ULTIMO_ARRANQUE = arranques()[TARJETAS.length - 1]

/**
 * EL CAOS — el encabezado, el fondo y las ocho features en sus lugares de la tabla.
 *
 * Con la coreografía activa (≥ 1025 y sin movimiento reducido) corre UNA
 * suscripción de scroll para todo: la profundidad de cada pieza con
 * `data-profundidad` (features y fondo) y el parallax interno de cada imagen.
 * La profundidad se mide con `offsetTop`, que no ve la transformada que se le
 * está escribiendo, y no con `getBoundingClientRect`, que sí la ve.
 *
 * Abajo de 1025 es una columna: sin parallax, sin fondo, con el eco del caos en
 * los anchos alternados de `claseMovil`.
 */
export function Galeria({ encabezado }: { readonly encabezado: React.ReactNode }): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const reducido = usePrefiereMenosMovimiento()
  const [abierta, setAbierta] = useState<number | null>(null)
  const caos = useRef<HTMLDivElement>(null)
  const botones = useRef<(HTMLButtonElement | null)[]>([])
  const marcos = useRef<(HTMLSpanElement | null)[]>([])
  const capas = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const raiz = caos.current
    if (!anima || raiz === null) return
    const profundas = [...raiz.querySelectorAll<HTMLElement>('[data-profundidad]')]
    let pedido = 0
    const pintar = (): void => {
      pedido = 0
      const alto = window.innerHeight
      for (const el of profundas) {
        const padre = el.offsetParent
        if (!(padre instanceof HTMLElement)) continue
        const centro = padre.getBoundingClientRect().top + el.offsetTop + el.offsetHeight / 2
        if (centro < -alto || centro > 2 * alto) continue
        el.style.transform = `translate3d(0, ${corrimientoDeProfundidad(centro, alto, Number(el.dataset.profundidad))}px, 0)`
      }
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
      for (const el of [...profundas, ...capasAlMontar]) if (el !== null) el.style.transform = ''
    }
  }, [anima])

  const marcoDe = useCallback((i: number): HTMLElement | null => marcos.current[i] ?? null, [])

  // El foco vuelve a la tarjeta que estaba abierta al cerrar, no a la que se abrió.
  const cerrar = useCallback((): void => {
    if (abierta !== null) botones.current[abierta]?.focus({ preventScroll: true })
    setAbierta(null)
  }, [abierta])

  // La última feature va en el flujo: el caos reserva arriba el lugar donde arranca.
  const alto = { '--arranque-final': `${ULTIMO_ARRANQUE}svh` } as CSSProperties

  return (
    <div ref={caos} data-pieza="caos-del-panel" style={alto} className="relative flex flex-col gap-[var(--spacing-12)] escritorio:block">
      <Fondo />
      {encabezado}
      <ul data-pieza="galeria-del-panel" className="flex flex-col gap-y-[calc(var(--spacing-20)*0.875)] escritorio:relative escritorio:block escritorio:pt-[var(--arranque-final)]">
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
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

import { LINEA_DE_LECTURA, formaDelHiloPedida, posicionDeLaAguja, type FormaDelHilo } from '../_movimiento/hilo'

/**
 * [M2] EL HILO DE LECTURA — «el hilo me encanta, me gustaría que se note más… literal tuve que leer acá para darme cuenta que era». El del
 * prototipo era una raya fina arriba de todo, debajo de la navbar y lejos del texto: no se veía. Éste va AL COSTADO de la columna, en el camino
 * del ojo:
 *
 *   · un riel tenue del alto del texto y, encima, el tramo leído en tinta, que crece hacia abajo;
 *   · la AGUJA, un punto de tinta que viaja por el riel EN la línea de lectura (`LINEA_DE_LECTURA` del alto del cuadro): queda siempre al lado
 *     del renglón que se está leyendo, así que se ve sin buscarla;
 *   · una marca por subtítulo (`[data-hito]`), hueca hasta que la aguja la pasa y llena después: el hilo dice además en qué parte de la nota vas.
 *
 * Decorativo para el lector (`aria-hidden`): el orden de la nota ya lo dicen los subtítulos. Una suscripción de scroll (un cuadro por vez) que
 * escribe la transformada directo, sin renders. Con movimiento reducido también anda: no anima nada, sigue al scroll.
 *
 * `?hilo=barra` muestra la otra versión que se probó: la barra de arriba, más gruesa (`M2-resultado.md`).
 */
export function HiloDeLectura({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const recorrido = useRef<HTMLDivElement>(null)
  const leido = useRef<HTMLSpanElement>(null)
  const aguja = useRef<HTMLSpanElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const [forma, setForma] = useState<FormaDelHilo>('costado')
  const [hitos, setHitos] = useState<readonly number[]>([])

  useEffect(() => {
    setForma(formaDelHiloPedida(window.location.search))
  }, [])

  useEffect(() => {
    const el = recorrido.current
    if (el === null) return undefined
    let pedido = 0
    let marcas: readonly HTMLElement[] = []
    const medirHitos = (): void => {
      const tops = [...el.querySelectorAll<HTMLElement>('[data-hito]')].map((h) => h.offsetTop)
      setHitos((antes) => (antes.length === tops.length && antes.every((t, i) => t === tops[i]) ? antes : tops))
    }
    const mover = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const p = posicionDeLaAguja(caja.top, caja.height, window.innerHeight * LINEA_DE_LECTURA)
      const avance = caja.height > 0 ? p / caja.height : 0
      if (leido.current !== null) leido.current.style.transform = `scaleY(${avance.toFixed(4)})`
      if (aguja.current !== null) aguja.current.style.transform = `translate3d(-50%, ${p.toFixed(1)}px, 0)`
      if (barra.current !== null) barra.current.style.transform = `scaleX(${avance.toFixed(4)})`
      if (marcas.length === 0) marcas = [...el.querySelectorAll<HTMLElement>('[data-parte="marca-del-hilo"]')]
      for (const m of marcas) m.dataset.pasada = Number(m.dataset.top) <= p ? 'si' : 'no'
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(mover)
    }
    const alCambiarElTamano = new ResizeObserver(() => {
      medirHitos()
      marcas = []
      pedir()
    })
    alCambiarElTamano.observe(el)
    window.addEventListener('scroll', pedir, { passive: true })
    medirHitos()
    pedir()
    return () => {
      alCambiarElTamano.disconnect()
      window.removeEventListener('scroll', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [forma])

  return (
    <div ref={recorrido} data-pieza="recorrido-de-la-nota" className="relative">
      {forma === 'barra' ? (
        <span aria-hidden="true" data-pieza="hilo-de-lectura" data-forma="barra" ref={barra} className="fixed inset-x-0 top-0 z-[var(--z-elevado)] block h-1 origin-left bg-tinta" style={{ transform: 'scaleX(0)' }} />
      ) : (
        <span aria-hidden="true" data-pieza="hilo-de-lectura" data-forma="costado" className="pointer-events-none absolute inset-y-0 -left-3 block w-3 tablet:-left-8 escritorio:-left-14">
          <span className="absolute inset-y-0 left-1/2 block w-0.5 -translate-x-1/2 rounded-full bg-tinta/15" />
          <span ref={leido} className="absolute inset-y-0 left-1/2 block w-[3px] -translate-x-1/2 origin-top rounded-full bg-tinta" style={{ transform: 'scaleY(0)' }} />
          {hitos.map((top) => (
            <span
              key={top}
              data-parte="marca-del-hilo"
              data-top={top}
              data-pasada="no"
              className="absolute left-1/2 block size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-tinta bg-fondo transition-colors duration-media data-[pasada=si]:bg-tinta motion-reduce:transition-none"
              style={{ top }}
            />
          ))}
          <span ref={aguja} data-parte="aguja-del-hilo" className="absolute top-0 left-1/2 -mt-[7px] block size-[14px] rounded-full bg-tinta shadow-[0_0_0_4px_var(--color-fondo)]" style={{ transform: 'translate3d(-50%, 0, 0)' }} />
        </span>
      )}
      {children}
    </div>
  )
}

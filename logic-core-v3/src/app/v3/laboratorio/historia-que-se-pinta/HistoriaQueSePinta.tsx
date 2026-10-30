'use client'

import { useEffect, useRef } from 'react'

import { avanceDeLaPalabra, grisSinPintar } from '../../_componentes/pintado/pintado'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { HISTORIA, type Tramo } from './historia'

/** El color de una palabra: la tinta en la proporción de su pintado; el resto, el gris de lo que todavía no se leyó. */
const COLOR = { color: 'color-mix(in oklab, var(--color-tinta) calc(var(--pintado, 1) * 100%), var(--gris-del-pintado))' } as const

/**
 * [L7e · N2] LA HISTORIA QUE SE PINTA — la historia de develOP en palabras de Valentino, entera, grande y palabra por palabra: lo que
 * ya leíste queda en tinta, lo que viene, en el gris del 18 % (`PRESENCIA_SIN_PINTAR`). Es el cálculo del título del Panel
 * (`_componentes/pintado/`, importado) estirado a un texto largo: el avance no sale del centro del título sino de cuánto del bloque ya
 * pasó por la línea de lectura (el 60 % de la pantalla). Las frases que importan van en el otro registro (la display en mayúsculas).
 * Una escritura por palabra y por cuadro, sólo mientras el bloque está en pantalla; con movimiento reducido, todo pintado.
 */
export function HistoriaQueSePinta(): React.JSX.Element {
  const bloque = useRef<HTMLDivElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  useEffect(() => {
    const el = bloque.current
    if (el === null || reducido) return undefined
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')]
    let pedido = 0
    const pintar = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const linea = window.innerHeight * 0.6
      const avance = Math.min(1, Math.max(0, (linea - caja.top) / caja.height))
      palabras.forEach((p, i) => p.style.setProperty('--pintado', avanceDeLaPalabra(avance, i, palabras.length).toFixed(3)))
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    const cerca = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting === true) window.addEventListener('scroll', pedir, { passive: true })
      else window.removeEventListener('scroll', pedir)
      pedir()
    })
    cerca.observe(el)
    window.addEventListener('resize', pedir)
    pintar()
    return () => {
      cerca.disconnect()
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const p of palabras) p.style.removeProperty('--pintado')
    }
  }, [reducido])

  return (
    <>
      <header className="mx-auto max-w-5xl px-6 pt-36 pb-[30svh] escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Nosotros · la historia</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Esto no es</span>
          <span className="block font-liviano tracking-titulo italic uppercase">un proyecto aislado</span>
        </h1>
        <p className="mt-6 text-cuerpo text-tinta-media">Bajá despacio: se lee al ritmo del scroll.</p>
      </header>
      <div ref={bloque} className="mx-auto max-w-5xl px-6 pb-[60svh]" style={{ '--gris-del-pintado': grisSinPintar() } as React.CSSProperties}>
        {HISTORIA.map((parrafo, k) => (
          <p key={k} className="mb-[0.9em] text-titulo-s leading-titulo tablet:text-titulo-m escritorio:text-titulo-l">
            {parrafo.map((tramo, j) => (
              <TramoPintado key={j} tramo={tramo} />
            ))}
          </p>
        ))}
      </div>
    </>
  )
}

function TramoPintado({ tramo }: { readonly tramo: Tramo }): React.JSX.Element {
  const palabras = tramo.texto.split(' ')
  return (
    <span className={tramo.destacado ? 'font-display font-fuerte tracking-display uppercase' : undefined}>
      {palabras.map((p, i) => (
        <span key={i}>
          <span data-palabra="" style={COLOR}>
            {p}
          </span>{' '}
        </span>
      ))}
    </span>
  )
}

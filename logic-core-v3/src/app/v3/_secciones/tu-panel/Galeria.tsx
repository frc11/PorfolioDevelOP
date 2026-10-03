'use client'

import { useEffect, useRef } from 'react'

import { useCoreografiaActiva } from '../_contrato/coreografia'
import { TARJETAS } from './contenido'
import { Fondo } from './Fondo'
import { corrimientoDeProfundidad } from './geometria'
import { Tarjeta } from './Tarjeta'

/**
 * LA GALERÍA — el encabezado, el fondo y las ocho features, cada una con su demo usable en su lugar ([RETOQUE PANEL]
 * T1: la ampliación y el caos de imágenes chicas se fueron; las formas y los anchos, en `geometria.ts`).
 *
 * El caos es un contenedor (`@container`): desde 72rem de contenido la composición va de costado; antes, en columna.
 * Con la coreografía activa (≥ 1025 y sin movimiento reducido) corre UNA suscripción de scroll: la profundidad de las
 * piezas del fondo (`data-profundidad`). Las demos no se mueven con el scroll: se usan. La profundidad se mide con
 * `offsetTop`, que no ve la transformada que se le está escribiendo, y no con `getBoundingClientRect`, que sí la ve.
 */
export function Galeria({ encabezado }: { readonly encabezado: React.ReactNode }): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const caos = useRef<HTMLDivElement>(null)

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
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    pintar()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const el of profundas) el.style.transform = ''
    }
  }, [anima])

  return (
    <div ref={caos} data-pieza="caos-del-panel" className="@container relative flex flex-col gap-[var(--spacing-12)] escritorio:block">
      <Fondo />
      {encabezado}
      <ul data-pieza="galeria-del-panel" className="flex flex-col gap-y-[calc(var(--spacing-20)*0.875)] escritorio:relative escritorio:flex-row escritorio:flex-wrap escritorio:items-start escritorio:gap-x-[var(--spacing-20)] escritorio:gap-y-[var(--spacing-20)] escritorio:@max-6xl:flex-col escritorio:@max-6xl:flex-nowrap">
        {TARJETAS.map((tarjeta, i) => (
          <Tarjeta key={tarjeta.titulo} tarjeta={tarjeta} indice={i} />
        ))}
      </ul>
    </div>
  )
}

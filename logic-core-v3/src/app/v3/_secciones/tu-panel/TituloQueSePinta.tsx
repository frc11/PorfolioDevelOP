'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { useMovimientoEnTodoAncho } from '../_contrato/coreografia'
import type { RenglonQueSePinta } from './contenido'
import { avanceDeLaPalabra, avanceDelPintado, grisSinPintar } from './pintado'

/**
 * [B6] EL TÍTULO QUE SE PINTA — «El panel donde controlás TODO» y el titular del CTA: en la letra de las palabras fundidas
 * (la cara de display, que es de mayúsculas), grande, centrado y de lado a lado; de gris claro a tinta palabra por palabra,
 * atado al scroll, y la palabra destacada («TODO») en cursiva y subrayada a la par de su pintado.
 *
 * Una sola suscripción de scroll por título, y sólo mientras está cerca del cuadro: por cuadro LEE la caja del título una
 * vez y después ESCRIBE una variable por palabra (`--pintado`, 0 → 1). El color y el subrayado los resuelve la hoja con esa
 * variable; React no vuelve a dibujar nada. En todo ancho; con movimiento reducido (o sin JS) queda pintado entero: el
 * defecto de la variable es 1.
 */
export const TIPOGRAFIA_QUE_SE_PINTA =
  'font-display font-fuerte uppercase tracking-display leading-cartel text-center text-[length:min(calc(100cqw/var(--divisor-del-titulo)),var(--tope-del-titulo))]'

/** El color de una palabra: la tinta en la proporción de su pintado, el resto el gris claro. */
const COLOR_DE_LA_PALABRA = '[color:color-mix(in_oklab,var(--color-tinta)_calc(var(--pintado,1)*100%),var(--gris-del-pintado))]'

/** El subrayado de la destacada: crece desde la izquierda con su pintado, del color de la palabra. */
const SUBRAYADO = 'pointer-events-none absolute inset-x-0 bottom-0 h-[var(--grosor-del-subrayado)] origin-left scale-x-[var(--pintado,1)] bg-current'

/** Cuánto antes y después del cuadro se sigue el scroll (el título se pinta también al subir). */
const CERCA = '50%'

export interface TituloQueSePintaProps {
  readonly renglones: readonly RenglonQueSePinta[]
  readonly como: 'h2' | 'h3'
  readonly id?: string
  readonly className?: string
}

export function TituloQueSePinta({ renglones, como: Etiqueta, id, className }: TituloQueSePintaProps): React.JSX.Element {
  const anima = useMovimientoEnTodoAncho()
  const titulo = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titulo.current
    if (!anima || el === null) return undefined
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')]
    let pedido = 0
    const pintar = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const avance = avanceDelPintado(caja.top + caja.height / 2, window.innerHeight)
      palabras.forEach((p, i) => p.style.setProperty('--pintado', avanceDeLaPalabra(avance, i, palabras.length).toFixed(4)))
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    let escuchando = false
    const cerca = new IntersectionObserver(
      ([e]) => {
        const ahora = e?.isIntersecting === true
        if (ahora && !escuchando) window.addEventListener('scroll', pedir, { passive: true })
        if (!ahora && escuchando) window.removeEventListener('scroll', pedir)
        escuchando = ahora
        pedir()
      },
      { rootMargin: CERCA },
    )
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
  }, [anima])

  const inicios = renglones.map((_, k) => renglones.slice(0, k).reduce((n, r) => n + r.palabras.length, 0))
  return (
    // Sin `cn()`: `twMerge` no conoce los nombres del sistema y se come una de `font-display` y `font-fuerte`.
    <Etiqueta ref={titulo} id={id} data-pieza="titulo-que-se-pinta" className={className === undefined ? TIPOGRAFIA_QUE_SE_PINTA : `${TIPOGRAFIA_QUE_SE_PINTA} ${className}`} style={{ '--gris-del-pintado': grisSinPintar() } as CSSProperties}>
      {renglones.map((renglon, k) => (
        <span key={renglon.palabras.join(' ')} className="block whitespace-nowrap">
          {renglon.palabras.map((palabra, j) => (
            <Palabra key={`${String(inicios[k] + j)}-${palabra}`} texto={palabra} conEspacio={k > 0 || j > 0} destacada={renglon.destacado === true} corte={renglon.cortesEnElTelefono?.includes(j) === true} />
          ))}
        </span>
      ))}
    </Etiqueta>
  )
}

/**
 * Una palabra con su pintado. El espacio va ANTES y afuera de la pieza: se anuncia entre palabras y no se subraya. [C2 60b]
 * Con `corte`, antes del espacio un salto que sólo existe abajo de 1024 (el espacio de después, al principio del renglón, no se ve).
 */
function Palabra({ texto, conEspacio, destacada, corte }: { readonly texto: string; readonly conEspacio: boolean; readonly destacada: boolean; readonly corte: boolean }): React.JSX.Element {
  return (
    <>
      {corte ? <br data-corte="" className="escritorio:hidden" /> : null}
      {conEspacio ? ' ' : null}
      <span data-palabra="" className={cn(COLOR_DE_LA_PALABRA, destacada && 'relative inline-block italic')}>
        {texto}
        {destacada ? <span aria-hidden="true" data-parte="subrayado" className={SUBRAYADO} /> : null}
      </span>
    </>
  )
}

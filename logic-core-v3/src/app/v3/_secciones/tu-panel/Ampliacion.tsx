'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { cajaAmpliada, leerToken, milisegundosDe, pixelesDe, transformadaEntre, vecino } from './vuelo'
import { CAPTURA, type Tarjeta } from './contenido'

/**
 * LA AMPLIACIÓN — la imagen sale de su marco hasta el centro de la pantalla.
 *
 * Elemento compartido por FLIP con la Web Animations API: la imagen se monta en
 * su caja FINAL y arranca con la transformada que la pone exactamente encima del
 * marco de la tarjeta; se anima a `none`. Al cerrar, lo mismo al revés contra el
 * marco de la tarjeta que esté abierta en ese momento (las flechas pueden haberla
 * cambiado). Con movimiento reducido, sólo un fundido.
 *
 * Diálogo accesible: `role="dialog"`, `aria-modal`, el foco entra a la cruz, Tab
 * da la vuelta adentro, y al cerrar vuelve a la tarjeta (lo hace `Galeria`).
 * Se monta en `[data-v3]` con un portal: un `position: fixed` adentro de una
 * sección transformada quedaría atado a ella.
 */
export function Ampliacion({
  tarjetas,
  indice,
  reducido,
  marcoDe,
  alCambiar,
  alCerrar,
}: {
  readonly tarjetas: readonly Tarjeta[]
  readonly indice: number
  readonly reducido: boolean
  readonly marcoDe: (indice: number) => HTMLElement | null
  readonly alCambiar: (indice: number) => void
  readonly alCerrar: () => void
}): React.JSX.Element | null {
  const dialogo = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const imagen = useRef<HTMLDivElement>(null)
  const resto = useRef<HTMLDivElement>(null)
  const cerrarBoton = useRef<HTMLButtonElement>(null)
  const cerrando = useRef(false)
  // Se monta sólo después de un click, nunca en el servidor: el destino se lee al montar.
  const [destino] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined' ? null : (document.querySelector<HTMLElement>('[data-v3]') ?? document.body),
  )
  const tarjeta = tarjetas[indice]

  /** Ubica la imagen en su caja final. Se llama al abrir y al cambiar el tamaño de la pantalla. */
  const ubicar = useCallback((): void => {
    const el = imagen.current
    if (el === null) return
    const margen = pixelesDe(leerToken('--spacing-20'))
    const caja = cajaAmpliada(window.innerWidth, window.innerHeight, margen, margen)
    el.style.left = `${caja.left}px`
    el.style.top = `${caja.top}px`
    el.style.width = `${caja.width}px`
    el.style.height = `${caja.height}px`
  }, [])

  const animar = useCallback(
    (abrir: boolean, alTerminar?: () => void): void => {
      const el = imagen.current
      const marco = marcoDe(indice)
      const duracion = milisegundosDe(leerToken('--duracion-lenta'))
      const curva = leerToken('--ease-principal') || 'ease'
      const fundido: Keyframe[] = abrir ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }]
      const opciones: KeyframeAnimationOptions = { duration: duracion, easing: curva, fill: 'both' }
      velo.current?.animate(fundido, opciones)
      resto.current?.animate(fundido, opciones)
      let ultima: Animation | undefined
      if (el !== null && marco !== null && !reducido) {
        const sobre = transformadaEntre(marco.getBoundingClientRect(), el.getBoundingClientRect())
        const cuadros: Keyframe[] = abrir ? [{ transform: sobre }, { transform: 'none' }] : [{ transform: 'none' }, { transform: sobre }]
        ultima = el.animate(cuadros, opciones)
      } else if (el !== null) {
        ultima = el.animate(fundido, opciones)
      }
      if (alTerminar === undefined) return
      if (ultima === undefined || duracion === 0) alTerminar()
      else ultima.onfinish = alTerminar
    },
    [indice, marcoDe, reducido],
  )

  const cerrar = useCallback((): void => {
    if (cerrando.current) return
    cerrando.current = true
    animar(false, alCerrar)
  }, [animar, alCerrar])

  // Al montar: a la caja final, y de ahí la animación desde el marco.
  useLayoutEffect(() => {
    if (destino === null) return
    ubicar()
    animar(true)
    cerrarBoton.current?.focus({ preventScroll: true })
    // Sólo al abrir: las flechas cambian el índice sin volver a volar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino])

  // La rueda no mueve la página de atrás mientras la ampliación está abierta.
  useEffect(() => {
    const el = dialogo.current
    if (el === null) return
    const frenar = (e: Event): void => e.preventDefault()
    el.addEventListener('wheel', frenar, { passive: false })
    el.addEventListener('touchmove', frenar, { passive: false })
    window.addEventListener('resize', ubicar)
    return () => {
      el.removeEventListener('wheel', frenar)
      el.removeEventListener('touchmove', frenar)
      window.removeEventListener('resize', ubicar)
    }
  }, [destino, ubicar])

  const pasar = useCallback(
    (paso: 1 | -1): void => {
      alCambiar(vecino(indice, paso, tarjetas.length))
      imagen.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: milisegundosDe(leerToken('--duracion-rapida')), easing: 'ease-out' })
    },
    [alCambiar, indice, tarjetas.length],
  )

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      pasar(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      pasar(-1)
    } else if (e.key === 'Tab') {
      const focos = dialogo.current?.querySelectorAll<HTMLElement>('button')
      if (focos === undefined || focos.length === 0) return
      const primero = focos[0]
      const ultimo = focos[focos.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
  }

  if (destino === null) return null

  const idDelTitulo = 'ampliacion-del-panel-titulo'
  const claseDeBoton =
    'text-fondo border-fondo/40 hover:bg-fondo/10 focus-visible:bg-fondo/10 flex size-[var(--spacing-12)] cursor-pointer items-center justify-center rounded-[var(--radius-circulo)] border'

  return createPortal(
    <div
      ref={dialogo}
      role="dialog"
      aria-modal="true"
      aria-labelledby={idDelTitulo}
      data-pieza="ampliacion-del-panel"
      data-lenis-prevent=""
      onKeyDown={alTeclear}
      className="fixed inset-0 z-[var(--z-overlay)]"
    >
      <div ref={velo} data-parte="velo" onClick={cerrar} className="bg-tinta/90 absolute inset-0" />

      <div ref={imagen} data-parte="imagen" className="bg-superficie-2 absolute origin-top-left overflow-hidden">
        <Imagen src={tarjeta.imagen} alt={tarjeta.alt} ancho={CAPTURA.ancho} alto={CAPTURA.alto} sizes={CAPTURA.sizes} className="h-full object-cover" />
      </div>

      <div ref={resto} className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 flex h-[var(--spacing-20)] flex-col items-center justify-center gap-[var(--spacing-2)] px-[var(--spacing-20)] text-center">
          <Titular id={idDelTitulo} nivel="titulo-s" como="h2" className="text-fondo">
            {tarjeta.titulo}
          </Titular>
          <Micro como="p" className="text-fondo uppercase">
            {tarjeta.etiqueta} · {indice + 1} / {tarjetas.length}
          </Micro>
        </div>

        <button ref={cerrarBoton} type="button" aria-label="Cerrar" onClick={cerrar} className={`${claseDeBoton} pointer-events-auto absolute top-[var(--spacing-6)] right-[var(--spacing-6)]`}>
          <span aria-hidden="true">✕</span>
        </button>
        <button type="button" aria-label="Captura anterior" onClick={() => pasar(-1)} className={`${claseDeBoton} pointer-events-auto absolute top-1/2 left-[var(--spacing-4)] -translate-y-1/2`}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" aria-label="Captura siguiente" onClick={() => pasar(1)} className={`${claseDeBoton} pointer-events-auto absolute top-1/2 right-[var(--spacing-4)] -translate-y-1/2`}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>,
    destino,
  )
}

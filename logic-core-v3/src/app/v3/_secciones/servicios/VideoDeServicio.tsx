'use client'

import { useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

import { Imagen } from '../../_componentes/medios/Imagen'
import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * EL VIDEO DE UN SERVICIO. **[RECURSOS]** Mudo, en bucle y en línea; la fuente se pide
 * recién cuando el recuadro se acerca (medio cuadro antes) y no se suelta más, se
 * reproduce en pantalla y se pausa fuera. Con movimiento reducido no hay video: queda el
 * póster. La visibilidad sale de `useInView` de motion, no de un observador propio.
 */
export function VideoDeServicio({
  fuente,
  poster,
  descripcion,
  ancho,
  alto,
  sizes,
}: {
  readonly fuente: string
  readonly poster: string
  readonly descripcion: string
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
}): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const video = useRef<HTMLVideoElement | null>(null)
  const cerca = useInView(video, { margin: '50%', once: true })
  const enPantalla = useInView(video)

  useEffect(() => {
    const el = video.current
    if (el === null || !cerca) return
    if (enPantalla) void el.play().catch(() => undefined)
    else el.pause()
  }, [cerca, enPantalla])

  if (reducido) {
    return <Imagen src={poster} alt={descripcion} ancho={ancho} alto={alto} sizes={sizes} className="aspect-video object-cover" />
  }
  return (
    <video
      ref={video}
      data-pieza="video-de-servicio"
      src={cerca ? fuente : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={descripcion}
      width={ancho}
      height={alto}
      className="aspect-video h-auto w-full object-cover"
    />
  )
}

'use client'

import { useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

import { Imagen } from '../../_componentes/medios/Imagen'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { seguirElScroll } from '../../_lib/scrollEnMovimiento'

/**
 * EL VIDEO DE UN SERVICIO. **[RECURSOS]** Mudo, en bucle y en línea; la fuente se pide
 * recién cuando el recuadro se acerca (medio cuadro antes) y no se suelta más, se
 * reproduce en pantalla y se pausa fuera. Con movimiento reducido no hay video: queda el
 * póster. La visibilidad sale de `useInView` de motion, no de un observador propio.
 *
 * [ESCENA 10] T2 · **Quieto mientras el scroll se mueve.** Cada cuadro nuevo del video en
 * medio del scroll le costaba a la página ~80 cuadros perdidos por pasada con cualquier
 * placa (ESCENA 9, T4). Con el scroll en movimiento (Lenis o la rueda: los dos mueven el
 * scroll de la ventana) se pausa en el cuadro en que está, y vuelve a andar desde ese
 * mismo cuadro cuando el scroll lleva `QUIETO_PARA_VOLVER_MS` sin moverse: no hay nada
 * que fundir, la imagen no salta. El movimiento lo avisa `_lib/scrollEnMovimiento.ts`
 * (un solo escucha para los tres videos): la sección no escucha el scroll por su cuenta.
 */
export const QUIETO_PARA_VOLVER_MS = 180

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
    if (el === null || !cerca) return undefined
    if (!enPantalla) {
      el.pause()
      return undefined
    }
    const soltar = seguirElScroll(
      QUIETO_PARA_VOLVER_MS,
      () => {
        if (!el.paused) el.pause()
      },
      () => void el.play().catch(() => undefined),
    )
    return () => {
      soltar()
      el.pause()
    }
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

'use client'

import { Pause, Play } from 'lucide-react'
import { useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'

import { Imagen } from '../../_componentes/medios/Imagen'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { seguirElScroll } from '../../_lib/scrollEnMovimiento'
import { ASIENTO } from '../../_lib/titulos3d/repeticiones'
import type { VersionDelVideo } from '../tipos'
import { ROTULO_DE_LA_PAUSA, debeReproducirse, siguienteDeLaPausa } from './reproduccion'

/**
 * [SERVICIOS M3] EL VIDEO DE FONDO DE TRABAJOS — el patrón de `VideoDeServicio.tsx` del home (M0 §4.6), con dos versiones y una pausa.
 *
 *   · UN solo `<video>`: mudo, en bucle y en línea, `preload="none"`, sin `autoplay` ni `src` en el HTML servido. La fuente se pide
 *     cuando la capa se acerca (medio cuadro antes) y la versión sale de la orientación de la pantalla en ese momento: baja un archivo.
 *   · Anda solo en pantalla, sin la pausa de quien mira y con el scroll quieto (`reproduccion.ts`), con el escucha compartido del
 *     home (`seguirElScroll`) y su quieto (`ASIENTO.quietoMs`).
 *   · Debajo, los dos pósters (el primer cuadro de cada versión), que el CSS alterna por orientación: el escondido no se baja (la
 *     imagen diferida no se carga oculta). Con movimiento reducido no hay `<video>` ni pausa: queda el póster.
 *   · Es decorativo (`aria-hidden`): lo que dice la sección lo dice su texto.
 *
 * Los hijos (el velo y el texto) van entre la capa del medio y el botón, así el botón queda arriba de todo.
 */
export function VideoDeFondo({
  horizontal,
  vertical,
  children,
}: {
  readonly horizontal: VersionDelVideo
  readonly vertical: VersionDelVideo
  readonly children: ReactNode
}): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const capa = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const cerca = useInView(capa, { margin: '50%', once: true })
  const enPantalla = useInView(capa)
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    const el = video.current
    if (el === null || !cerca) return undefined
    // La fuente se pide UNA vez, al acercarse, en el elemento (React nunca la escribe): la versión es la de la orientación de ese momento.
    if (el.getAttribute('src') === null) el.src = window.matchMedia('(orientation: portrait)').matches ? vertical.video : horizontal.video
    let scrollEnMovimiento = false
    const aplicar = (): void => {
      if (debeReproducirse({ reducido, conFuente: true, enPantalla, pausadoPorQuienMira: pausado, scrollEnMovimiento })) void el.play().catch(() => undefined)
      else if (!el.paused) el.pause()
    }
    if (!enPantalla || pausado) {
      aplicar()
      return undefined
    }
    const soltar = seguirElScroll(
      ASIENTO.quietoMs,
      () => {
        scrollEnMovimiento = true
        aplicar()
      },
      () => {
        scrollEnMovimiento = false
        aplicar()
      },
    )
    return () => {
      soltar()
      el.pause()
    }
  }, [cerca, enPantalla, pausado, reducido, horizontal.video, vertical.video])

  return (
    <>
      <CapaDelVideo horizontal={horizontal} vertical={vertical} reducido={reducido} capa={capa} video={video} />
      {children}
      {reducido ? null : <BotonDePausa pausado={pausado} alApretar={() => setPausado(siguienteDeLaPausa)} />}
    </>
  )
}

/**
 * La capa del medio: los dos pósters y, sin movimiento reducido, el video (sin `src`: lo pone `VideoDeFondo` al acercarse). Sin estado:
 * la renderizan los tests en las dos ramas.
 */
export function CapaDelVideo({
  horizontal,
  vertical,
  reducido,
  capa,
  video,
}: {
  readonly horizontal: VersionDelVideo
  readonly vertical: VersionDelVideo
  readonly reducido: boolean
  readonly capa?: Ref<HTMLDivElement>
  readonly video?: Ref<HTMLVideoElement>
}): React.JSX.Element {
  return (
    <div ref={capa} aria-hidden="true" className="absolute inset-0">
      <Imagen src={horizontal.poster} alt="" ancho={horizontal.ancho} alto={horizontal.alto} sizes="100vw" className="absolute inset-0 h-full object-cover portrait:hidden" />
      <Imagen src={vertical.poster} alt="" ancho={vertical.ancho} alto={vertical.alto} sizes="100vw" className="absolute inset-0 h-full object-cover landscape:hidden" />
      {reducido ? null : (
        <video
          ref={video}
          data-video-de-trabajos=""
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}

/**
 * P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77. Un botón conmutable: el nombre es fijo y `aria-pressed` dice si está
 * pausado; el teclado es el nativo. Va abajo a la derecha: arriba lo tapaba la barra fija del sitio con el cuadro en pantalla (medido a
 * 1440). El texto le deja lugar (`Trabajos.tsx`).
 */
export function BotonDePausa({ pausado, alApretar }: { readonly pausado: boolean; readonly alApretar?: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      data-pieza="pausa-del-video"
      aria-label={ROTULO_DE_LA_PAUSA}
      aria-pressed={pausado}
      onClick={alApretar}
      className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full border border-fondo/30 bg-tinta/70 text-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fondo"
    >
      {pausado ? <Play className="size-4" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="size-4" strokeWidth={1.5} aria-hidden="true" />}
    </button>
  )
}

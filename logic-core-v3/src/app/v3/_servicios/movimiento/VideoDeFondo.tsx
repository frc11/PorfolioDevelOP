'use client'

import { useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'

import { BotonPausa } from '../../_componentes/medios/BotonPausa'
import { Imagen } from '../../_componentes/medios/Imagen'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { seguirElScroll } from '../../_lib/scrollEnMovimiento'
import { ASIENTO } from '../../_lib/titulos3d/repeticiones'
import type { VersionDelVideo } from '../tipos'
import { DE_LA_PAUSA, debeReproducirse } from './reproduccion'

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
 *
 * [V1] P-H27 · la pausa es la del home (`BotonPausa`), con el comportamiento del panel después de su F7: sólo para el teclado.
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
      <PausaDelVideo reducido={reducido} pausado={pausado} alCambiar={setPausado} />
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
 * [V1] La pausa sólo para el teclado, la del panel del home después de su F7 (`CLASE_DE_LA_PAUSA_DEL_PANEL`, `MedioDeLaTira.tsx`): en
 * escala 0 y sin puntero (el mouse nunca la ve ni la toca; sigue en el orden del Tab), aparece entera con `:focus-visible`. El lugar es el
 * nuestro, abajo a la derecha: arriba la tapaba la barra fija del sitio con el cuadro en pantalla (medido a 1440). El texto le deja lugar
 * (`Trabajos.tsx`).
 */
export const CLASE_DE_LA_PAUSA_DEL_VIDEO = 'pointer-events-none absolute right-4 bottom-4 scale-0 focus-visible:scale-100'

/** La pausa del video, o nada con movimiento reducido (queda el póster, quieto). */
export function PausaDelVideo({ reducido, pausado, alCambiar }: { readonly reducido: boolean; readonly pausado: boolean; readonly alCambiar: (pausado: boolean) => void }): React.JSX.Element | null {
  return reducido ? null : <BotonPausa pausado={pausado} alCambiar={alCambiar} de={DE_LA_PAUSA} className={CLASE_DE_LA_PAUSA_DEL_VIDEO} />
}

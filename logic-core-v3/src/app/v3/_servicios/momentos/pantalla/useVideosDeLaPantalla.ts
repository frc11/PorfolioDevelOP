'use client'

import { useInView } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { seguirElScroll } from '../../../_lib/scrollEnMovimiento'
import { ASIENTO } from '../../../_lib/titulos3d/repeticiones'
import type { MediosDelProyecto } from '../../../_secciones/trabajos/proyectos'
import { debeReproducirse } from '../../movimiento/reproduccion'

export interface VideosDeLaPantalla {
  readonly escritorio: RefObject<HTMLVideoElement | null>
  readonly movil: RefObject<HTMLVideoElement | null>
  readonly pausado: boolean
  readonly setPausado: (pausado: boolean) => void
  /** Qué video se ve ahora (lo dice la secuencia en cada cuadro): sólo ése anda. */
  readonly alCambiarDeFase: (escritorio: boolean, movil: boolean) => void
}

type Cual = 'escritorio' | 'movil'

/**
 * [M3] LOS DOS VIDEOS DEL TRABAJO — la regla del video de trabajos de la página (`movimiento/reproduccion.ts`): mudos, en bucle, en línea,
 * `preload="none"` y sin `src` ni `poster` en el HTML servido; la fuente y el póster se ponen al acercarse el escenario (media pantalla
 * antes), y cada uno anda sólo si se ve en la fase en curso, con el escenario en pantalla, sin la pausa de quien mira y con el scroll
 * quieto (`seguirElScroll` del home). Al cambiar de trabajo, React monta videos nuevos (con `key`) y la fuente se vuelve a poner.
 */
export function useVideosDeLaPantalla(caja: RefObject<HTMLElement | null>, medios: MediosDelProyecto): VideosDeLaPantalla {
  const escritorio = useRef<HTMLVideoElement>(null)
  const movil = useRef<HTMLVideoElement>(null)
  const cerca = useInView(caja, { margin: '50% 0px', once: true })
  const enPantalla = useInView(caja)
  const [pausado, setPausado] = useState(false)
  const estado = useRef({ enPantalla: false, pausado: false, scroll: false, quiere: { escritorio: false, movil: false } })

  const aplicar = useCallback(() => {
    const e = estado.current
    const pares: readonly (readonly [Cual, RefObject<HTMLVideoElement | null>])[] = [['escritorio', escritorio], ['movil', movil]]
    for (const [cual, ref] of pares) {
      const el = ref.current
      if (el === null) continue
      const anda = e.quiere[cual] && debeReproducirse({ reducido: false, conFuente: el.getAttribute('src') !== null, enPantalla: e.enPantalla, pausadoPorQuienMira: e.pausado, scrollEnMovimiento: e.scroll })
      if (anda) void el.play().catch(() => undefined)
      else if (!el.paused) el.pause()
    }
  }, [])

  // La fuente y el póster, al acercarse (y otra vez con cada trabajo nuevo: sus videos son otros elementos).
  useEffect(() => {
    if (!cerca) return
    const pares: readonly (readonly [RefObject<HTMLVideoElement | null>, Cual])[] = [[escritorio, 'escritorio'], [movil, 'movil']]
    for (const [ref, cual] of pares) {
      const el = ref.current
      if (el === null || el.getAttribute('src') !== null) continue
      el.poster = medios.poster[cual]
      el.src = medios.video[cual]
    }
    aplicar()
  }, [cerca, medios, aplicar])

  useEffect(() => {
    estado.current.enPantalla = enPantalla
    estado.current.pausado = pausado
    aplicar()
    if (!enPantalla || pausado) return undefined
    const soltar = seguirElScroll(
      ASIENTO.quietoMs,
      () => {
        estado.current.scroll = true
        aplicar()
      },
      () => {
        estado.current.scroll = false
        aplicar()
      },
    )
    return () => {
      soltar()
      escritorio.current?.pause()
      movil.current?.pause()
    }
  }, [enPantalla, pausado, aplicar])

  const alCambiarDeFase = useCallback(
    (enEscritorio: boolean, enMovil: boolean) => {
      const q = estado.current.quiere
      if (q.escritorio === enEscritorio && q.movil === enMovil) return
      estado.current.quiere = { escritorio: enEscritorio, movil: enMovil }
      aplicar()
    },
    [aplicar],
  )

  return useMemo(() => ({ escritorio, movil, pausado, setPausado, alCambiarDeFase }), [pausado, alCambiarDeFase])
}

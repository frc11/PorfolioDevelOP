'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import { tomarLosGestos } from '../../_lib/gestosDelScroll'
import { ATRIBUTO_DEL_FAQ } from '../../_lib/pie3d/faqDelPie'
import { Envoltorio } from '../layout/Envoltorio'
import { Cuerpo } from '../tipografia/Textos'
import { Titular } from '../tipografia/Titular'
import { IDS_DEL_FAQ, TEXTOS_DEL_FAQ, type PreguntaFrecuente } from './preguntas'

/**
 * [B10] EL FAQ EN LISTA — en el teléfono (abajo de 1024) y con menos movimiento: un FAQ normal, después del pie, en papel, con cada
 * pregunta y su respuesta a la vista. Sin efectos y sin el bloque de WhatsApp (ya está el del pie, justo arriba).
 *
 * `colgada` (el home): cuelga después del pie FUERA del layout (`absolute`, debajo de la sección): suma desborde para scrollear, no alto
 * al documento, así el final del pie sigue siendo el fondo del layout (`cuadroDelFinal.ts` mide `offsetHeight`: el encastre corre al
 * fondo del pie, como siempre) y la escena (las secciones) no se corre. Mientras se ve, los gestos de scroll son de la página: el final no
 * los retiene para rebobinar el encastre que la lista tapa.
 */
export function FaqEnLista({ preguntas, colgada }: { readonly preguntas: readonly PreguntaFrecuente[]; readonly colgada: boolean }): React.JSX.Element {
  const raiz = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = raiz.current
    if (!colgada || el === null) return undefined
    // A la vista (con unos px adentro: con el pie justo al fondo la lista recién toca el borde, y ahí el gesto sigue siendo del final).
    let aLaVista = false
    const vigia = new IntersectionObserver(([e]) => {
      aLaVista = e?.isIntersecting ?? false
    }, { rootMargin: '0px 0px -8px 0px' })
    vigia.observe(el)
    const soltar = tomarLosGestos(() => (aLaVista ? 'suelta' : 'sigue'))
    return () => {
      vigia.disconnect()
      soltar()
    }
  }, [colgada])
  return (
    <div ref={raiz} {...{ [ATRIBUTO_DEL_FAQ]: 'lista' }} className={cn('bg-fondo text-tinta', colgada && 'absolute inset-x-0 top-full')}>
      <Envoltorio claseDeContenido="flex flex-col gap-[var(--spacing-6)] py-[var(--spacing-12)]">
        <Titular nivel="titulo-l" como="h2" id={IDS_DEL_FAQ.titulo} className="text-balance">
          {TEXTOS_DEL_FAQ.titulo}
        </Titular>
        <ul role="list" className="flex flex-col">
          {preguntas.map((p, i) => (
            <li key={p.pregunta} className="flex flex-col gap-[var(--spacing-2)] border-t border-current/15 py-[var(--spacing-4)]">
              <Titular nivel="titulo-s" como="h3" peso="medio" id={IDS_DEL_FAQ.pregunta(i)}>
                {p.pregunta}
              </Titular>
              <div id={IDS_DEL_FAQ.respuesta(i)}>
                <Cuerpo>{p.respuesta}</Cuerpo>
              </div>
            </li>
          ))}
        </ul>
      </Envoltorio>
    </div>
  )
}

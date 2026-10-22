'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { hayBanco } from '../../_lib/escena/entorno'
import { POSES_DEL_FINAL, huecoDelLogo } from '../../_lib/escena/finalDelRecorrido'
import { ATRIBUTO_DEL_FAQ, FAQ_EN_VIVO, asentar, avisarAlFaq, faseDelFaq, faseEn, nivelesDelFaq, suscribirAlFaq, type FaseDelFaq } from '../../_lib/pie3d/faqDelPie'
import { SALIDA_EN_VIVO } from '../../_lib/pie3d/salidas'
import { IconoDeMarca } from '../../_secciones/cierre/IconosDeMarca'
import { Envoltorio } from '../layout/Envoltorio'
import { DosCopias } from '../rollover/DosCopias'
import { Cuerpo, EtiquetaDeSeccion } from '../tipografia/Textos'
import { Titular } from '../tipografia/Titular'
import { aplicarElNivel, estiloDelNivel } from './hundimientoEnElDom'
import { IDS_DEL_FAQ, TEXTOS_DEL_FAQ, WHATSAPP_DEL_FAQ, type PreguntaFrecuente } from './preguntas'
import { nivelDelWhatsApp, pasoDeLaRespuesta, pedirLaRespuesta, relojDeLaRespuestaQuieto, type ContenidoDeLaRespuesta } from './relojDeLaRespuesta'
import { useGatilloDelFaq } from './useGatilloDelFaq'
import { VidrioDelFaq } from './VidrioDelFaq'

/**
 * [B10] EL FAQ DESPUÉS DEL PIE, EN ESCRITORIO — en la misma pantalla que el pie (no le suma alto a la página): seguir scrolleando después
 * del pie lo trae (`useGatilloDelFaq`): el pie se hunde con el efecto de su formulario (el de volumen, en sus huecos: la escena lee el
 * reloj del FAQ; el plano, sus columnas en el DOM) y de esos lugares nacen dos bloques:
 *
 *   izquierda  el título y las preguntas (botones: se recorren con Tab y con las flechas)
 *   derecha    «Tocá una pregunta y mirá lo que pasa.», en una letra tranquila; al tocar una, se hunde el aviso y sube la respuesta en
 *              su lugar (con otra, se hunde la anterior y sube la nueva); con la primera respuesta sube abajo el bloque de WhatsApp
 *
 * Subir lo saca: el FAQ se hunde y vuelve el pie. Las respuestas están TODAS en el HTML (las que no se ven, `hidden`); el bloque de la
 * derecha anuncia la que sube. Los bloques se hunden con `hundimientoEnElDom.ts`, en un cuadro propio que corre sólo mientras algo cambia.
 */
interface Props {
  readonly preguntas: readonly PreguntaFrecuente[]
  /** El selector del contenedor del pie del que nace. */
  readonly pie: string
  /** El pie es el de volumen y está armado (lo hunde la escena); si no, el plano (lo hunde este DOM). */
  readonly volumen: boolean
  /** Hidratado: el gatillo escucha. */
  readonly activo: boolean
}

/**
 * Cerrado en su hueco: así sale del servidor (sin el cuadro todavía) y así queda fuera. Sólo el recorte (sin transformada: lo que se sirve
 * no escribe ninguna; el cuadro le pone el resto al moverse). Constante: React no lo vuelve a escribir.
 */
const CERRADO: CSSProperties = { clipPath: estiloDelNivel(0).clipPath }

/** El hueco del logo entre los dos bloques: el del pie (la pose E), con el aire de sus columnas. */
const HUECO: CSSProperties = { ['--hueco-del-faq' as string]: `calc(2 * (${huecoDelLogo(POSES_DEL_FINAL.pie.distance).toFixed(1)}svh + var(--spacing-6)))` }

/** Las columnas del pie plano (las marca el pie del cierre); sin marcas, el pie entero. */
const COLUMNAS_DEL_PIE = '[data-columna-del-pie]'
function columnasDelPie(selector: string): HTMLElement[] {
  const pie = document.querySelector(selector)
  if (pie === null) return []
  const marcadas = [...pie.querySelectorAll<HTMLElement>(COLUMNAS_DEL_PIE)]
  if (marcadas.length > 0) return marcadas
  const entero = pie.querySelector<HTMLElement>('[data-pieza="pie"]')
  return entero === null ? [] : [entero]
}

const sinCambios = (): (() => void) => () => undefined

type VentanaDelBanco = Window & {
  __faqDelBanco?: () => { readonly fase: FaseDelFaq; readonly niveles: { readonly pie: number; readonly faq: number }; readonly mostrado: ContenidoDeLaRespuesta; readonly pedido: ContenidoDeLaRespuesta; readonly whatsapp: number; readonly hunde: number; readonly acostado: boolean; readonly volumen: boolean }
  __faqSinHundimiento?: boolean
}

export function FaqEnEscenario({ preguntas, pie, volumen, activo }: Props): React.JSX.Element {
  const raiz = useRef<HTMLDivElement | null>(null)
  const izquierda = useRef<HTMLDivElement | null>(null)
  const derecha = useRef<HTMLDivElement | null>(null)
  const whatsapp = useRef<HTMLDivElement | null>(null)
  const botones = useRef<(HTMLButtonElement | null)[]>([])
  const reloj = useRef(relojDeLaRespuestaQuieto())
  const [mostrado, setMostrado] = useState<ContenidoDeLaRespuesta>('aviso')
  const [pedido, setPedido] = useState<ContenidoDeLaRespuesta>('aviso')
  const [conWhatsApp, setConWhatsApp] = useState(false)
  const fase: FaseDelFaq = useSyncExternalStore(activo ? suscribirAlFaq : sinCambios, faseDelFaq, () => 'fuera')
  useGatilloDelFaq({ raiz, pie, volumen, activo })
  /** Pide un cuadro (lo arma el efecto de abajo; sin él, nada). */
  const despertar = useRef<() => void>(() => undefined)
  // El pie de volumen se arma después de montar: el cuadro lo lee al correr (cambiarlo no rearma el cuadro).
  const deVolumen = useRef(volumen)
  useEffect(() => {
    deVolumen.current = volumen
  }, [volumen])

  // El cuadro del FAQ: corre sólo mientras algo cambia (la entrada, la salida, una respuesta, el WhatsApp que sube) y le escribe el
  // hundimiento a cada bloque (y al pie plano). Se despierta con cada aviso del reloj y con cada pregunta tocada.
  useEffect(() => {
    if (!activo) return undefined
    let cuadro = 0
    let columnas: HTMLElement[] = []
    const correr = (): void => {
      cuadro = 0
      const ahora = performance.now()
      if (asentar(FAQ_EN_VIVO, ahora)) avisarAlFaq()
      const enCambio = FAQ_EN_VIVO.fase === 'entrando' || FAQ_EN_VIVO.fase === 'saliendo'
      const niveles = nivelesDelFaq(FAQ_EN_VIVO, ahora)
      // El pie plano se hunde en el DOM (el de volumen lo hunde la escena con el mismo reloj).
      if (!deVolumen.current && !FAQ_EN_VIVO.sinHundirElPie) {
        if (enCambio && columnas.length === 0) columnas = columnasDelPie(pie)
        for (const el of columnas) aplicarElNivel(el, niveles.pie)
        if (FAQ_EN_VIVO.fase === 'fuera') columnas = []
      }
      const r = reloj.current
      if (FAQ_EN_VIVO.fase === 'fuera' && (r.mostrado !== 'aviso' || r.pedido !== 'aviso' || r.primeraEn !== Number.NEGATIVE_INFINITY)) {
        // Se fue: la próxima vez, de nuevo el aviso (y sin WhatsApp). El foco que quedó adentro se suelta (lo de adentro ya no se ve).
        reloj.current = relojDeLaRespuestaQuieto()
        setMostrado('aviso')
        setPedido('aviso')
        setConWhatsApp(false)
        const activoAhora = document.activeElement
        if (activoAhora instanceof HTMLElement && raiz.current?.contains(activoAhora) === true) activoAhora.blur()
      }
      const paso = pasoDeLaRespuesta(reloj.current, ahora)
      if (paso.cambioLoMostrado) setMostrado(reloj.current.mostrado)
      if (reloj.current.primeraEn !== Number.NEGATIVE_INFINITY) setConWhatsApp(true)
      const delWhatsApp = nivelDelWhatsApp(reloj.current, ahora)
      aplicarElNivel(izquierda.current, niveles.faq)
      aplicarElNivel(derecha.current, Math.min(niveles.faq, paso.nivel))
      aplicarElNivel(whatsapp.current, Math.min(niveles.faq, delWhatsApp))
      const sigue = enCambio || paso.enCurso || (delWhatsApp > 0 && delWhatsApp < 1)
      if (sigue && cuadro === 0) cuadro = requestAnimationFrame(correr)
    }
    const pedir = (): void => {
      if (cuadro === 0) cuadro = requestAnimationFrame(correr)
    }
    despertar.current = pedir
    const dejar = suscribirAlFaq(pedir)
    return () => {
      dejar()
      cancelAnimationFrame(cuadro)
      despertar.current = () => undefined
      // El pie plano, como estaba (sin el hundimiento).
      for (const el of columnas) aplicarElNivel(el, 1)
    }
  }, [activo, pie])

  // El banco (`scripts-carga/faq-del-pie.ts`): el estado del FAQ en vivo y su control (`__faqSinHundimiento`: el pie no se hunde).
  useEffect(() => {
    if (!activo || !hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    FAQ_EN_VIVO.sinHundirElPie = ventana.__faqSinHundimiento === true
    ventana.__faqDelBanco = () => {
      const ahora = performance.now()
      return { fase: faseEn(FAQ_EN_VIVO, ahora), niveles: nivelesDelFaq(FAQ_EN_VIVO, ahora), mostrado: reloj.current.mostrado, pedido: reloj.current.pedido, whatsapp: nivelDelWhatsApp(reloj.current, ahora), hunde: SALIDA_EN_VIVO.hunde, acostado: SALIDA_EN_VIVO.acostado, volumen }
    }
    return () => {
      delete ventana.__faqDelBanco
      FAQ_EN_VIVO.sinHundirElPie = false
    }
  }, [activo, volumen])

  const tocar = (i: number): void => {
    pedirLaRespuesta(reloj.current, i)
    setPedido(i)
    despertar.current()
  }
  // Las flechas recorren las preguntas (Tab también); el foco adentro hace que las teclas sean del FAQ (`decidirElGestoDelFaq`).
  const alApretar = (e: React.KeyboardEvent<HTMLButtonElement>, i: number): void => {
    const paso = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
    if (paso === 0) return
    e.preventDefault()
    botones.current[(i + paso + preguntas.length) % preguntas.length]?.focus()
  }

  return (
    <div
      ref={raiz}
      {...{ [ATRIBUTO_DEL_FAQ]: 'escenario' }}
      data-fase={fase}
      style={HUECO}
      className={cn('absolute inset-x-0 bottom-0 z-10 h-svh', fase === 'fuera' ? 'pointer-events-none' : 'pointer-events-auto')}
    >
      <Envoltorio className="h-full" claseDeContenido="grid h-full content-center">
        <div className="grid grid-cols-[1fr_var(--hueco-del-faq)_1fr] items-stretch">
          <div className="col-start-1 flex justify-end">
            <VidrioDelFaq caja={izquierda} estilo={CERRADO} className="w-full max-w-[calc(var(--spacing-20)*5)]">
              <div className="flex flex-col gap-[var(--spacing-4)] p-[var(--spacing-6)]">
                <Titular nivel="titulo-m" como="h2" id={IDS_DEL_FAQ.titulo} className="text-balance">
                  {TEXTOS_DEL_FAQ.titulo}
                </Titular>
                <ul role="list" className="flex flex-col">
                  {preguntas.map((p, i) => (
                    <li key={p.pregunta} className="border-t border-current/15 first:border-t-0">
                      <button
                        type="button"
                        ref={(el) => {
                          botones.current[i] = el
                        }}
                        id={IDS_DEL_FAQ.pregunta(i)}
                        aria-expanded={pedido === i}
                        aria-controls={IDS_DEL_FAQ.respuesta(i)}
                        onClick={() => tocar(i)}
                        onKeyDown={(e) => alApretar(e, i)}
                        className={cn('block w-full py-[var(--spacing-3)] text-left text-cuerpo leading-texto underline-offset-4 hover:underline focus-visible:underline', pedido === i ? 'font-semi' : 'font-normal')}
                      >
                        {p.pregunta}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </VidrioDelFaq>
          </div>
          <div className="col-start-3 flex max-w-[calc(var(--spacing-20)*5)] flex-col justify-between gap-[var(--spacing-4)]">
            <VidrioDelFaq caja={derecha} estilo={CERRADO}>
              {/* Lo que sube se anuncia (el aviso, o la respuesta que tocaste). */}
              <div aria-live="polite" className="p-[var(--spacing-6)]">
                <div hidden={mostrado !== 'aviso'}>
                  <Titular nivel="titulo-m" como="p" peso="liviano" className="text-balance">
                    {TEXTOS_DEL_FAQ.aviso}
                  </Titular>
                </div>
                {preguntas.map((p, i) => (
                  <div key={p.pregunta} id={IDS_DEL_FAQ.respuesta(i)} hidden={mostrado !== i} className="flex flex-col gap-[var(--spacing-3)]">
                    <EtiquetaDeSeccion sangria={false}>{p.pregunta}</EtiquetaDeSeccion>
                    <Cuerpo>{p.respuesta}</Cuerpo>
                  </div>
                ))}
              </div>
            </VidrioDelFaq>
            <VidrioDelFaq caja={whatsapp} estilo={CERRADO} className="self-start">
              {/* Recién con la primera respuesta (antes no existe: ni se ve ni es una parada del teclado). */}
              {conWhatsApp && (
                <a href={WHATSAPP_DEL_FAQ} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-[var(--spacing-2)] px-[var(--spacing-5)] py-[var(--spacing-3)] text-cuerpo font-semi">
                  <IconoDeMarca marca="whatsapp" className="size-[var(--spacing-5)] shrink-0" />
                  <DosCopias>{TEXTOS_DEL_FAQ.dudas}</DosCopias>
                </a>
              )}
            </VidrioDelFaq>
          </div>
        </div>
      </Envoltorio>
    </div>
  )
}

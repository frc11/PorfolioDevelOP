'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { BotonPausa } from '../../../_componentes/medios/BotonPausa'
import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import type { MediosDelProyecto, SlugDelProyecto } from '../../../_secciones/trabajos/proyectos'
import { CLASES_DEL_PAPEL, EncabezadoDelBloque, idDelTituloDe } from '../../bloques/Bloque'
import { CLASE_DE_LA_PAUSA_DEL_VIDEO } from '../../movimiento/VideoDeFondo'
import { useAvanceDelRecorrido } from '../useAvanceDelRecorrido'
import { MenuDeTrabajos, type TrabajoDelMenu } from './MenuDeTrabajos'
import { PantallaQuieta } from './PantallaQuieta'
import { Plano, RotulosDelPlano, trazasDe } from './Plano'
import { LIENZO, PLANOS, avanceDeLaTraza, avanceMostrado, fasesDe, medidasDelMarco, repeticionTerminada } from './planos'
import { TEXTOS_DE_LAS_FASES, TITULO_DE_LA_PANTALLA, DE_LA_PAUSA_DE_LA_PANTALLA } from './textos'
import { useVideosDeLaPantalla } from './useVideosDeLaPantalla'

export interface TrabajoDeLaPantalla extends TrabajoDelMenu {
  readonly medios: MediosDelProyecto
}

/** El grosor del trazo en píxeles de pantalla (el del globo de Servicios): se pasa a unidades del lienzo según el ancho del marco. */
const GROSOR_PX = 1.25

/**
 * [M3] LA PANTALLA QUE SE DIBUJA, Y LUEGO EN EL CELULAR — los prototipos 8 y 16 encadenados en UN movimiento, con un escenario clavado:
 *   1. el plano del trabajo (calcado de su página real, `planos.ts`) se dibuja trazo a trazo y su pantalla real se abre adentro desde el
 *      centro (el `clip-path` de la segunda toma de `MarcoDeDosTomas`);
 *   2. siguiendo con el scroll, ese mismo marco se angosta hasta ser un teléfono y el video de escritorio cede al del celular.
 * El menú (`MenuDeTrabajos`) cambia de trabajo en cualquier punto: la secuencia se re-corre con los medios nuevos, en tiempo, desde 0
 * hasta donde está el scroll (`avanceMostrado`); el scroll no se toca. Con movimiento reducido, `PantallaQuieta`.
 */
export function LaPantalla({ trabajos }: { readonly trabajos: readonly TrabajoDeLaPantalla[] }): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const [slug, setSlug] = useState<SlugDelProyecto>(trabajos[0].slug)
  const trabajo = trabajos.find((t) => t.slug === slug) ?? trabajos[0]
  const idDelTitulo = idDelTituloDe('la-pantalla')

  return (
    <section data-bloque="la-pantalla" aria-labelledby={idDelTitulo} className={`${CLASES_DEL_PAPEL} pt-12 escritorio:pt-20`}>
      <Envoltorio>
        <div className="escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <EncabezadoDelBloque nombre="la-pantalla" titulo={TITULO_DE_LA_PANTALLA} />
        </div>
      </Envoltorio>
      {reducido ? (
        <PantallaQuieta trabajos={trabajos} trabajo={trabajo} alElegir={setSlug} />
      ) : (
        <Secuencia trabajos={trabajos} trabajo={trabajo} alElegir={setSlug} />
      )}
    </section>
  )
}

interface PropsDeLaSecuencia {
  readonly trabajos: readonly TrabajoDeLaPantalla[]
  readonly trabajo: TrabajoDeLaPantalla
  readonly alElegir: (slug: SlugDelProyecto) => void
}

function Secuencia({ trabajos, trabajo, alElegir }: PropsDeLaSecuencia): React.JSX.Element {
  const recorrido = useRef<HTMLDivElement>(null)
  const caja = useRef<HTMLDivElement>(null)
  const marco = useRef<HTMLDivElement>(null)
  const bisel = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const rotulos = useRef<HTMLDivElement>(null)
  const real = useRef<HTMLDivElement>(null)
  const textos = useRef<HTMLOListElement>(null)
  const delCelular = useRef<HTMLDivElement>(null)
  const avanceDelScroll = useRef(0)
  const cambio = useRef<number | null>(null)
  const largos = useRef<number[]>([])
  const plano = PLANOS[trabajo.slug]
  const videos = useVideosDeLaPantalla(caja, trabajo.medios)

  // Los largos de las trazas del plano de este trabajo (cambian con el trabajo).
  useEffect(() => {
    const el = svg.current
    if (el === null) return
    const trazas = [...el.querySelectorAll<SVGGeometryElement>('[data-traza]')]
    largos.current = trazas.map((t) => t.getTotalLength())
    trazas.forEach((t, i) => {
      t.style.strokeDasharray = largos.current[i].toFixed(2)
    })
  }, [trabajo.slug])

  const pintar = useCallback((avance: number) => {
    const c = caja.current
    const m = marco.current
    const s = svg.current
    if (c === null || m === null || s === null || real.current === null || bisel.current === null) return
    const f = fasesDe(avance)
    const medidas = medidasDelMarco(c.clientWidth, c.clientHeight, f.angostado)
    m.style.width = `${medidas.ancho.toFixed(1)}px`
    m.style.height = `${medidas.alto.toFixed(1)}px`
    real.current.style.borderRadius = `${medidas.radio.toFixed(1)}px`
    bisel.current.style.borderRadius = `${(medidas.radio + 6).toFixed(1)}px`
    bisel.current.style.opacity = f.abierto.toFixed(3)
    // El plano: cada traza en su tramo; se va cuando el marco empieza a angostarse (se deformaría).
    const trazas = s.querySelectorAll<SVGGeometryElement>('[data-traza]')
    trazas.forEach((t, i) => {
      const largo = largos.current[i] ?? 0
      t.style.strokeDashoffset = (largo * (1 - avanceDeLaTraza(f.dibujado, i, trazas.length))).toFixed(2)
    })
    s.setAttribute('stroke-width', ((GROSOR_PX * LIENZO.ancho) / Math.max(1, medidas.ancho)).toFixed(2))
    s.style.opacity = (1 - Math.min(1, f.angostado * 5)).toFixed(3)
    rotulos.current?.querySelectorAll<HTMLElement>('[data-rotulo-del-plano]').forEach((r) => {
      const despues = Number(r.dataset.rotuloDelPlano)
      const visto = avanceDeLaTraza(f.dibujado, despues, trazas.length)
      r.style.opacity = (Math.min(1, visto * 2) * (1 - f.abierto)).toFixed(3)
    })
    real.current.style.clipPath = `inset(${((1 - f.abierto) * 50).toFixed(2)}% round ${medidas.radio.toFixed(1)}px)`
    if (delCelular.current !== null) delCelular.current.style.opacity = f.cruce.toFixed(3)
    videos.alCambiarDeFase(f.abierto > 0 && f.cruce < 1, f.cruce > 0)
    textos.current?.querySelectorAll<HTMLElement>('[data-fase]').forEach((li) => {
      if (Number(li.dataset.fase) === f.fase) li.setAttribute('data-activo', '')
      else li.removeAttribute('data-activo')
    })
  }, [videos])

  const pintarActual = useRef(pintar)
  useEffect(() => {
    pintarActual.current = pintar
  }, [pintar])

  const alAvanzar = useCallback((avance: number) => {
    avanceDelScroll.current = avance
    if (cambio.current === null) pintarActual.current(avance)
  }, [])
  useAvanceDelRecorrido(recorrido, alAvanzar, { modo: 'clavado' }, true)

  // La repetición al cambiar de trabajo (sólo con el trabajo, nunca al montar): corre en tiempo hasta el avance del scroll, que no se mueve.
  const primerTrabajo = useRef(trabajo.slug)
  useEffect(() => {
    if (primerTrabajo.current === trabajo.slug && cambio.current === null) return undefined
    primerTrabajo.current = ''
    cambio.current = performance.now()
    let pedido = 0
    const cuadro = (): void => {
      const desde = cambio.current
      if (desde === null) return
      const ms = performance.now() - desde
      pintarActual.current(avanceMostrado(avanceDelScroll.current, ms))
      if (repeticionTerminada(avanceDelScroll.current, ms)) cambio.current = null
      else pedido = requestAnimationFrame(cuadro)
    }
    pedido = requestAnimationFrame(cuadro)
    return () => {
      cancelAnimationFrame(pedido)
      cambio.current = null
    }
  }, [trabajo.slug])

  return (
    <div ref={recorrido} data-recorrido-de-la-pantalla="" className="relative h-[400svh] escritorio:h-[440svh]">
      <div className="sticky top-0 h-svh">
        <Envoltorio className="h-full" claseDeContenido="h-full">
          <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 pt-24 pb-6 escritorio:grid-cols-12 escritorio:grid-rows-[auto_minmax(0,1fr)] escritorio:gap-x-[var(--grilla-canal-amplio)] escritorio:gap-y-8 escritorio:pt-28 escritorio:pb-12">
            <div className="min-w-0 escritorio:col-span-4 escritorio:row-start-1">
              <MenuDeTrabajos trabajos={trabajos} elegido={trabajo.slug} alElegir={alElegir} />
            </div>
            <div ref={caja} className="relative flex min-h-0 items-center justify-center escritorio:col-span-8 escritorio:col-start-5 escritorio:row-span-2 escritorio:row-start-1">
              <div ref={marco} data-marco-de-la-pantalla="" className="relative" style={{ width: 0, height: 0, willChange: 'width, height' }}>
                <div ref={bisel} aria-hidden="true" className="absolute -inset-1.5 bg-tinta" style={{ opacity: 0 }} />
                <Plano key={trabajo.slug} plano={plano} svg={svg} />
                <div ref={real} className="absolute inset-0 overflow-hidden bg-tinta" style={{ clipPath: 'inset(50%)', willChange: 'clip-path' }}>
                  <video key={`e-${trabajo.slug}`} ref={videos.escritorio} data-video-de-la-pantalla="escritorio" muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 size-full object-cover object-top" />
                  <div ref={delCelular} className="absolute inset-0" style={{ opacity: 0 }}>
                    <video key={`m-${trabajo.slug}`} ref={videos.movil} data-video-de-la-pantalla="movil" muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 size-full object-cover object-top" />
                  </div>
                </div>
                <div ref={rotulos} className="contents">
                  <RotulosDelPlano key={trabajo.slug} plano={plano} />
                </div>
              </div>
              <BotonPausa pausado={videos.pausado} alCambiar={videos.setPausado} de={DE_LA_PAUSA_DE_LA_PANTALLA} className={CLASE_DE_LA_PAUSA_DEL_VIDEO} />
            </div>
            <ol ref={textos} className="flex min-w-0 flex-col gap-3 escritorio:col-span-4 escritorio:row-start-2 escritorio:self-end">
              <TextoDeFase fase={0}>{TEXTOS_DE_LAS_FASES.plano}</TextoDeFase>
              <TextoDeFase fase={1}>{TEXTOS_DE_LAS_FASES.real(trabajo.nombre)}</TextoDeFase>
              <TextoDeFase fase={2}>{TEXTOS_DE_LAS_FASES.celular}</TextoDeFase>
            </ol>
          </div>
        </Envoltorio>
      </div>
    </div>
  )
}

/** Un texto de la secuencia: el de la fase en curso en tinta; los otros, en el gris de lo no leído. Abajo de 1024, sólo el de la fase. */
function TextoDeFase({ fase, children }: { readonly fase: 0 | 1 | 2; readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <li
      data-fase={fase}
      data-activo={fase === 0 ? '' : undefined}
      className="hidden text-cuerpo leading-texto text-tinta-media transition-colors duration-[var(--duracion-media)] ease-[var(--ease-salida)] data-activo:block data-activo:text-tinta escritorio:block escritorio:text-base"
    >
      {children}
    </li>
  )
}

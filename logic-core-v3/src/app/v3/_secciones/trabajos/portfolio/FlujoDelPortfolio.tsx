'use client'

import { useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { CarruselDeTarjetas } from '../../../_componentes/carrusel/CarruselDeTarjetas'
import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import type { PropsDeSeccion } from '../../_contrato/forma'
import { Gatillo } from '../../_contrato/Gatillo'
import { CONTENIDO } from '../contenido'
import { PROYECTOS, type ProyectoDelPortfolio } from '../proyectos'

import { ANCLAS_DEL_PORTFOLIO, ANCLA_DE_LA_TUYA } from './anclas'
import { EncabezadoDelPortfolio } from './EncabezadoDelPortfolio'
import { FormularioDeLaTuya } from './FormularioDeLaTuya'
import { DESPEJE_DE_LA_BARRA, NIVEL_DEL_TITULO_DE_LA_TUYA } from './LaTuya'
import { PANTALLAS_MINIMAS_DEL_FLUJO } from './medioDelCarrusel'
import { SignoDePregunta } from './SignoDePregunta'
import { SUPERFICIE_DEL_CARRUSEL, TarjetaDelProyecto } from './TarjetaDelProyecto'
import { anclaDelHash } from './useAnclaDeLaCarga'
import { useDisparoPorLinea } from './useDisparoPorLinea'
import type { PortfolioVivo } from './usePortfolio'

/** Las tarjetas del carrusel: los tres proyectos, en el orden de la spec (la vuelta es infinita). «La tuya» va aparte, debajo. */
export interface TarjetaDelCarrusel {
  readonly id: string
  readonly proyecto: ProyectoDelPortfolio
}
export const TARJETAS_DEL_CARRUSEL: readonly TarjetaDelCarrusel[] = PROYECTOS.map((proyecto) => ({ id: proyecto.slug, proyecto }))

/** El flujo nunca mide menos que el medio de la tabla (`medioDelCarrusel.ts`): en línea, en `svh` (no es una clase del lane). */
export const ESTILO_DEL_FLUJO: React.CSSProperties = { minHeight: `${(PANTALLAS_MINIMAS_DEL_FLUJO * 100).toFixed(4)}svh` }

/**
 * Cada pieza del flujo va en su pantalla, centrada en el alto debajo de la barra (el mismo despeje que el título del escenario): se lee de a
 * una, con la escena alrededor. Si una pieza no entra, su pantalla crece (y el medio con ella: la escena lo sabe por la medida).
 */
const CLASE_DE_LA_PANTALLA = 'relative flex min-h-svh flex-col justify-center pb-12'
const ESTILO_DE_LA_PANTALLA: React.CSSProperties = { paddingTop: DESPEJE_DE_LA_BARRA }
const CLASE_DEL_ANCLA = 'pointer-events-none absolute top-0 left-0 h-px w-px'

/** El hash de la página, leído como un almacén externo (cambia con `hashchange`; en el servidor, vacío). */
const suscribirAlHash = (alCambiar: () => void): (() => void) => {
  window.addEventListener('hashchange', alCambiar)
  return () => window.removeEventListener('hashchange', alCambiar)
}

/** El proyecto que pide el ancla de la URL (`#portfolio-esquina-estudio` → 1), o `null`: el carrusel va a esa tarjeta. */
export function indiceDelAncla(hash: string): number | null {
  const ancla = anclaDelHash(hash)
  return ancla !== undefined && ancla.paso < TARJETAS_DEL_CARRUSEL.length ? ancla.paso : null
}

function PantallaDelTitulo({ seccion, reducido }: PropsDeSeccion & { readonly reducido: boolean }): React.JSX.Element {
  const titulo = useRef<HTMLDivElement | null>(null)
  const adentro = useDisparoPorLinea(titulo)
  return (
    <div data-pantalla="titulo" className={cn(CLASE_DE_LA_PANTALLA, '@container items-center px-8 text-center')} style={ESTILO_DE_LA_PANTALLA}>
      <div ref={titulo} className="flex w-full flex-col items-center">
        <EncabezadoDelPortfolio seccion={seccion} adentro={adentro} reducido={reducido} seFunde />
      </div>
    </div>
  )
}

function PantallaDelCarrusel({ vivo }: { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const hash = useSyncExternalStore(suscribirAlHash, () => window.location.hash, () => '')
  return (
    <div data-pantalla="carrusel" className={CLASE_DE_LA_PANTALLA} style={ESTILO_DE_LA_PANTALLA}>
      {ANCLAS_DEL_PORTFOLIO.filter((a) => a.id !== ANCLA_DE_LA_TUYA).map((a) => (
        <span key={a.id} id={a.id} aria-hidden="true" className={CLASE_DEL_ANCLA} />
      ))}
      <Envoltorio>
        <Gatillo>
          <CarruselDeTarjetas
            items={TARJETAS_DEL_CARRUSEL}
            etiqueta={CONTENIDO.acordeon}
            nombreDe={(t) => t.proyecto.nombre}
            rotulos={CONTENIDO.carrusel}
            indicePedido={indiceDelAncla(hash)}
            vistasLlenas
            renderItem={(t, e) => <TarjetaDelProyecto proyecto={t.proyecto} activa={e.activa} corre={e.corre} reinicio={e.reinicio} cerca={vivo.cerca} reducido={vivo.reducido} />}
          />
        </Gatillo>
      </Envoltorio>
    </div>
  )
}

/**
 * «LA PRÓXIMA ES LA TUYA», COMO BLOQUE PROPIO debajo del carrusel: lo mismo que la tira de escritorio (el título, la frase, la bajada y el
 * formulario corto que ya existe, con WhatsApp) sobre la misma superficie de las tarjetas, con el «?» que se arma detrás cuando el bloque
 * cruza la línea. El texto a la izquierda y el formulario a la derecha desde 860.
 */
function PantallaDeLaTuya({ reducido }: { readonly reducido: boolean }): React.JSX.Element {
  const bloque = useRef<HTMLDivElement | null>(null)
  const puesta = useDisparoPorLinea(bloque)
  const c = CONTENIDO.laTuya
  return (
    <div data-pantalla="la-tuya" className={CLASE_DE_LA_PANTALLA} style={ESTILO_DE_LA_PANTALLA}>
      <span id={ANCLA_DE_LA_TUYA} aria-hidden="true" className={CLASE_DEL_ANCLA} />
      <Envoltorio>
        <Gatillo>
          <div ref={bloque} data-pieza="la-tuya-del-carrusel" className={cn(SUPERFICIE_DEL_CARRUSEL, 'relative grid gap-6 overflow-clip p-5 tablet:p-8 medio:grid-cols-2 medio:items-center medio:gap-8')}>
            <SignoDePregunta visible={puesta} reducido={reducido} />
            <div className="relative flex flex-col gap-3">
              <Titular nivel={NIVEL_DEL_TITULO_DE_LA_TUYA} como="h3">{c.nombre}</Titular>
              <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
            </div>
            <div className="relative">
              <FormularioDeLaTuya visible reducido={reducido} desde={0} />
            </div>
          </div>
        </Gatillo>
      </Envoltorio>
    </div>
  )
}

/**
 * [B1.2e] EL FLUJO DEL PORTFOLIO (debajo de 1024, incluido 768) — lo que reemplaza a las historias: SIN TRAMPA DE SCROLL. Primero el título
 * «Portfolio» con su bajada (llega con su P2 al cruzar la línea, y se funde: nunca asoma cortado), después el carrusel de los tres proyectos
 * (`CarruselDeTarjetas`, el común: rota cada 10 s, flechas, deslices, mantener apretado; no ocupa la pantalla) y debajo «la tuya». La página
 * se scrollea de punta a punta: nada se pega ni se traga el dedo o la rueda. Después del flujo sigue la cola de siempre (Demos, pegado).
 *
 * Es hermano de la caja del Portfolio (no va adentro del pin): mide lo que mide (`useMedioDelCarrusel` lo lee para la escena y el reloj de
 * Demos) y nunca menos que el medio de la tabla. Va encima del escenario pegado de Demos, que hasta la cola está vacío.
 */
export function FlujoDelPortfolio({ seccion, vivo }: PropsDeSeccion & { readonly vivo: PortfolioVivo }): React.JSX.Element {
  return (
    <div data-pieza="flujo-del-portfolio" className="relative z-[var(--z-elevado)] flex flex-col overflow-x-clip" style={ESTILO_DEL_FLUJO}>
      <PantallaDelTitulo seccion={seccion} reducido={vivo.reducido} />
      <PantallaDelCarrusel vivo={vivo} />
      <PantallaDeLaTuya reducido={vivo.reducido} />
    </div>
  )
}

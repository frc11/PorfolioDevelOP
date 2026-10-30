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

/**
 * [L2] La pantalla del Portfolio es UNA pantalla, como la de Demos (`DemosDelFlujo`): debajo de la barra (el mismo despeje que el título del
 * escenario) el título y la bajada arriba y el carrusel llenando lo que queda, con sus flechas y sus barras al pie. Lo que cede es el video de
 * la tarjeta (`TarjetaDelProyecto`). Si no entra ni así, la pantalla crece (y el medio con ella: la escena lo sabe por la medida).
 */
const CLASE_DE_LA_PANTALLA = 'relative flex min-h-svh flex-col pb-4'
const ESTILO_DE_LA_PANTALLA: React.CSSProperties = { paddingTop: DESPEJE_DE_LA_BARRA }
const CLASE_DEL_ANCLA = 'pointer-events-none absolute top-0 left-0 h-px w-px'

/**
 * [L2] «La tuya» va pegada debajo del carrusel, con un respiro corto (antes, su propia pantalla centrada: quedaba lejos). Su ancla sube el
 * despeje de la barra menos ese respiro: el salto la deja debajo de la barra, como antes.
 */
const RESPIRO_DE_LA_TUYA = 'var(--spacing-6)'
const ESTILO_DE_LA_TUYA: React.CSSProperties = { paddingTop: RESPIRO_DE_LA_TUYA }
const ESTILO_DEL_ANCLA_DE_LA_TUYA: React.CSSProperties = { top: `calc(${RESPIRO_DE_LA_TUYA} - ${DESPEJE_DE_LA_BARRA})` }

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

/**
 * [C2-40] «Portfolio» con su bajada DIRECTAMENTE ARRIBA del carrusel, en la misma pantalla: entran juntos (antes el título tenía la suya y el
 * carrusel quedaba abajo, fuera de cuadro). El título se levanta desde abajo al cruzar la línea (`EncabezadoDelPortfolio` con `seFunde`).
 */
function PantallaDelPortfolio({ seccion, vivo }: PropsDeSeccion & { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const titulo = useRef<HTMLDivElement | null>(null)
  const adentro = useDisparoPorLinea(titulo)
  const hash = useSyncExternalStore(suscribirAlHash, () => window.location.hash, () => '')
  return (
    <div data-pantalla="portfolio" className={CLASE_DE_LA_PANTALLA} style={ESTILO_DE_LA_PANTALLA}>
      {ANCLAS_DEL_PORTFOLIO.filter((a) => a.id !== ANCLA_DE_LA_TUYA).map((a) => (
        <span key={a.id} id={a.id} aria-hidden="true" className={CLASE_DEL_ANCLA} />
      ))}
      {/* [L2] Como Demos: el título y la bajada a la izquierda, en el ancho del contenido, y el carrusel llenando el alto que queda. */}
      <Envoltorio className="flex flex-1 flex-col" claseDeContenido="flex flex-1 flex-col gap-4">
        <div data-parte="titulo" ref={titulo} className="@container flex w-full flex-col">
          <EncabezadoDelPortfolio seccion={seccion} adentro={adentro} reducido={vivo.reducido} seFunde />
        </div>
        <div data-parte="carrusel" className="flex flex-1 flex-col">
          <Gatillo className="flex flex-1 flex-col" claseDelContenido="flex flex-1 flex-col">
            <CarruselDeTarjetas
              items={TARJETAS_DEL_CARRUSEL}
              etiqueta={CONTENIDO.acordeon}
              nombreDe={(t) => t.proyecto.nombre}
              rotulos={CONTENIDO.carrusel}
              indicePedido={indiceDelAncla(hash)}
              vistasLlenas
              className="flex-1 gap-3"
              claseDeLaVista="flex-1 grid-rows-1"
              renderItem={(t, e) => <TarjetaDelProyecto proyecto={t.proyecto} activa={e.activa} corre={e.corre} reinicio={e.reinicio} cerca={vivo.cerca} reducido={vivo.reducido} />}
            />
          </Gatillo>
        </div>
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
    <div data-pantalla="la-tuya" className="relative pb-12" style={ESTILO_DE_LA_TUYA}>
      <span id={ANCLA_DE_LA_TUYA} aria-hidden="true" className={CLASE_DEL_ANCLA} style={ESTILO_DEL_ANCLA_DE_LA_TUYA} />
      <Envoltorio>
        <Gatillo>
          {/* [L2] Los hijos de la grilla con `min-w-0`: los campos no la ensanchan (a 320 se salían por la derecha). */}
          <div ref={bloque} data-pieza="la-tuya-del-carrusel" className={cn(SUPERFICIE_DEL_CARRUSEL, 'relative grid grid-cols-1 gap-5 overflow-clip p-5 tablet:p-8 medio:grid-cols-2 medio:items-center medio:gap-8')}>
            <SignoDePregunta visible={puesta} reducido={reducido} />
            <div className="relative flex min-w-0 flex-col gap-3">
              <Titular nivel={NIVEL_DEL_TITULO_DE_LA_TUYA} como="h3">{c.nombre}</Titular>
              <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
            </div>
            <div className="relative min-w-0">
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
 * «Portfolio» con su bajada (se levanta al cruzar la línea, y se funde: nunca asoma cortado) y en la misma pantalla el carrusel de los tres proyectos
 * (`CarruselDeTarjetas`, el común: rota cada 10 s, flechas, deslices, mantener apretado; no ocupa la pantalla) y debajo «la tuya». La página
 * se scrollea de punta a punta: nada se pega ni se traga el dedo o la rueda. Después del flujo sigue la cola de siempre (Demos, pegado).
 *
 * Es hermano de la caja del Portfolio (no va adentro del pin): mide lo que mide (`useMedioDelCarrusel` lo lee para la escena y el reloj de
 * Demos); [L2] sin alto mínimo. Va encima del escenario pegado de la caja, que con el carrusel está vacío.
 */
export function FlujoDelPortfolio({ seccion, vivo }: PropsDeSeccion & { readonly vivo: PortfolioVivo }): React.JSX.Element {
  return (
    <div data-pieza="flujo-del-portfolio" className="relative z-[var(--z-elevado)] flex flex-col overflow-x-clip">
      <PantallaDelPortfolio seccion={seccion} vivo={vivo} />
      <PantallaDeLaTuya reducido={vivo.reducido} />
    </div>
  )
}

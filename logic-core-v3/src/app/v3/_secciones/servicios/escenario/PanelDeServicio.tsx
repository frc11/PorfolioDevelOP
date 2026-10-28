'use client'

import type { CSSProperties } from 'react'

import { AvisoDeScroll } from '../../../_componentes/avisos/AvisoDeScroll'
import { ContenidoDelCta } from '../../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../../_componentes/navegacion/EnlaceDeRuta'
import { pedirElViajeAlServicio } from '../../../_componentes/navegacion/viajeAlServicio'
import type { IdDeServicio, Servicio } from '../../_contrato/acento'
import { ALTO_DEL_MEDIO, ANCHO_DEL_MEDIO, CTA_POR_SERVICIO, NOMBRE_CORTO, SIZES_DEL_MEDIO } from '../contenido'
import { VideoDeServicio } from '../VideoDeServicio'
import { AVISO_DEL_TELEFONO, CORTE_DE_LA_DIAGONAL, DESCRIPCION_DEL_VIDEO_PROVISORIO, DESTINO_DEL_SERVICIO, DISTRIBUCION, PRESET_DEL_DESTINO, TEXTO_DEL_MEDIO, VIDEO_DEL_SERVICIO, type Distribucion, type Entrada } from './datos'
import { TextoEnDiagonal } from './TextoEnDiagonal'
import { CLASE_DEL_TITULO, ESTILO_DEL_TITULO, type FuentesDelServicio } from './useFuentesDelServicio'

/**
 * [B4 · C2-50] UN SERVICIO, EN SU PANEL — el papel que entra (desde la izquierda web, desde la derecha software, desde arriba IA) y
 * cierra sobre lo de antes, por debajo de los nanobots. El escenario lo mueve con la transición (`translate`, en el compositor); el
 * estado inicial, afuera, sale del servidor.
 *
 * [C2-50] La distribución de escritorio (ítems 13 y 20), en una grilla de tres columnas (`DISTRIBUCION`):
 *   · **la marca**: el título del servicio, grande (`?titulo-servicio=`, ajustado a su columna), CENTRADO en su columna y justo
 *     encima del lugar de los nanobots (el mismo eje); al terminar de llegar se subraya (`data-parte="subrayado-del-servicio"`, lo
 *     escribe la coreografía); el CTA debajo, centrado. En IA las columnas son simétricas: el título queda al centro de la pantalla.
 *   · **el video**: toda su columna, de arriba a abajo y hasta el borde del panel, con un velo oscuro leve (placeholder), cortado por
 *     la diagonal del lado del texto: `100cqh` es el alto del panel (el `article` es contenedor de tamaño, sin relleno vertical).
 *   · **el texto del medio**: de techo a pie, en serif cursiva (`?fuente-servicio=`), con cada renglón arrancando donde lo corta la
 *     diagonal, paralela al corte del video y a un `gap` de él (`TextoEnDiagonal`).
 * Abajo de 1024 (el teléfono y la tablet, con gatillos; `lote3/02`): el título arriba con los nanobots a su derecha, el video, el texto
 * y el CTA, apilados en ese orden (el mismo del marcado: las dos ramas anuncian lo mismo), y debajo el aviso del gesto.
 *
 * El CTA es el enganche del viaje (B12b): `EnlaceDeRuta` a la página del servicio con `data-viaje-del-servicio`, y su `onClick` pide
 * el viaje al preset de esa página (`_componentes/navegacion/viajeAlServicio.ts`).
 */

export const nombreDelServicio = (s: Servicio): string => NOMBRE_CORTO[s.id] ?? s.nombre
export const idDelTituloDelServicio = (id: IdDeServicio): string => `servicio-${id}-titulo`

/** Dónde está el panel con su avance (0 afuera, 1 cerrado), según por dónde entra. */
export function traslacionDelPanel(entrada: Entrada, avance: number): string {
  const afuera = `${((1 - avance) * 100).toFixed(3)}%`
  if (entrada === 'izquierda') return `-${afuera} 0`
  if (entrada === 'derecha') return `${afuera} 0`
  return `0 -${afuera}`
}

/** El corte del video, paralelo a la diagonal del texto (del lado del texto). */
function corteDelVideo(lado: 'izquierda' | 'derecha' | null): CSSProperties {
  if (lado === 'izquierda') return { clipPath: `polygon(0 0, calc(100% - ${CORTE_DE_LA_DIAGONAL}) 0, 100% 100%, 0 100%)` }
  if (lado === 'derecha') return { clipPath: `polygon(${CORTE_DE_LA_DIAGONAL} 0, 100% 0, 100% 100%, 0 100%)` }
  return {}
}

/** [C2-51] `rotulo` y `enTinta`: el link chico del recomendador («Ver la página de…»), con el mismo viaje y en la tinta del papel. */
export function EnlaceDelServicio({ id, rotulo = CTA_POR_SERVICIO[id], enTinta = false }: { readonly id: IdDeServicio; readonly rotulo?: string; readonly enTinta?: boolean }): React.JSX.Element {
  return (
    <div style={enTinta ? undefined : { color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}>
      <EnlaceDeRuta href={DESTINO_DEL_SERVICIO[id]} onClick={(e) => pedirElViajeAlServicio(e, PRESET_DEL_DESTINO[id])} data-pieza="cta" data-variante="linea" data-registro="cuerpo" data-viaje-del-servicio={id} className={enTinta ? 'text-cuerpo no-underline' : 'text-base no-underline'}>
        <ContenidoDelCta rotulo={rotulo} />
      </EnlaceDeRuta>
    </div>
  )
}

/**
 * El video con su velo. `lleno`: ocupa la caja que le den (de arriba a abajo en el escritorio); si no, en su proporción (16:9).
 * Abajo de 1024 siempre en su proporción, con las esquinas redondeadas.
 */
export function VideoDelServicio({ id, corte, lleno = false }: { readonly id: IdDeServicio; readonly corte: 'izquierda' | 'derecha' | null; readonly lleno?: boolean }): React.JSX.Element {
  const video = VIDEO_DEL_SERVICIO[id]
  const caja = lleno ? 'aspect-video escritorio:aspect-auto escritorio:h-full escritorio:rounded-none' : 'aspect-video'
  return (
    <div data-pieza="video-del-servicio" className={`relative w-full overflow-hidden rounded-[var(--radius-fuerte)] ${caja}`} style={corteDelVideo(corte)}>
      <VideoDeServicio fuente={video.fuente} poster={video.poster} descripcion={DESCRIPCION_DEL_VIDEO_PROVISORIO} ancho={ANCHO_DEL_MEDIO} alto={ALTO_DEL_MEDIO} sizes={SIZES_DEL_MEDIO} className="absolute inset-0 size-full object-cover" />
      {/* El velo oscuro leve (ítem 13): le baja la importancia al video, que es un placeholder. */}
      <div aria-hidden="true" data-parte="velo-del-video" className="bg-tinta/35 pointer-events-none absolute inset-0" />
    </div>
  )
}

/** El lugar donde se posan los nanobots de este estado: una caja vacía que el escenario mide. */
export const LugarDeLosNanobots = ({ estado, className }: { readonly estado: number; readonly className?: string }): React.JSX.Element => (
  <div aria-hidden="true" data-lugar-de-los-nanobots={estado} className={className} />
)

/** El título de un servicio con su subrayado (lo escribe la coreografía: `scale` de 0 a 1 desde la izquierda). */
export function TituloDelServicio({ servicio, fuentes, className }: { readonly servicio: Servicio; readonly fuentes: FuentesDelServicio; readonly className?: string }): React.JSX.Element {
  const letra = fuentes.titulo === '2' && fuentes.claseDelTitulo !== '' ? `${fuentes.claseDelTitulo} ${CLASE_DEL_TITULO['2']}` : CLASE_DEL_TITULO[fuentes.titulo]
  return (
    <h3
      id={idDelTituloDelServicio(servicio.id)}
      data-parte="titulo-del-servicio"
      data-titulo-servicio={fuentes.titulo}
      className={`text-acento text-fluido-display escritorio:text-fluido-display-xl relative w-fit max-w-full ${letra} ${className ?? ''}`}
      style={ESTILO_DEL_TITULO[fuentes.titulo]}
    >
      {nombreDelServicio(servicio)}
      <span aria-hidden="true" data-parte="subrayado-del-servicio" className="mt-[var(--spacing-2)] block h-[calc(var(--border-hairline)*3)] w-full origin-left bg-current" />
    </h3>
  )
}

/** Las columnas de escritorio de una distribución (la grilla del panel). */
export const columnasDelPanel = (d: Distribucion): string => d.fracciones.map((f) => `minmax(0,${String(f)}fr)`).join(' ')
const FILAS_DEL_PANEL = 'auto minmax(0,1fr) auto'
const COLUMNA = ['escritorio:col-start-1', 'escritorio:col-start-2', 'escritorio:col-start-3'] as const
/** El video sangra hasta el borde del panel del lado de afuera. */
const SANGRIA = ['escritorio:-ml-[var(--pad-lateral-compacto)]', '', 'escritorio:-mr-[var(--pad-lateral-compacto)]'] as const

export function PanelDeServicio({ servicio, estado, foco, fuentes }: { readonly servicio: Servicio; readonly estado: number; readonly foco: (estado: number) => void; readonly fuentes: FuentesDelServicio }): React.JSX.Element {
  const { id } = servicio
  const d = DISTRIBUCION[id]
  const columna = (p: Distribucion['orden'][number]): string => COLUMNA[d.orden.indexOf(p)] ?? ''
  const panel = { translate: traslacionDelPanel(d.entrada, 0), containerType: 'size', '--columnas-del-panel': columnasDelPanel(d), '--filas-del-panel': FILAS_DEL_PANEL } as CSSProperties
  return (
    <article
      data-pieza="panel-de-servicio"
      data-servicio={id}
      data-estado={estado}
      aria-labelledby={idDelTituloDelServicio(id)}
      onFocus={() => foco(estado)}
      className="bg-fondo absolute inset-0 z-20 flex flex-col gap-[var(--spacing-4)] border-borde px-[var(--pad-lateral-compacto)] pt-[calc(var(--spacing-20)+var(--spacing-2))] pb-[var(--spacing-6)] shadow-[0_0_var(--spacing-12)_var(--tw-shadow-color)] shadow-tinta/10 will-change-transform escritorio:grid escritorio:grid-cols-[var(--columnas-del-panel)] escritorio:grid-rows-[var(--filas-del-panel)] escritorio:gap-x-[var(--spacing-12)] escritorio:gap-y-[var(--spacing-6)] escritorio:py-0"
      style={panel}
    >
      <header data-parte="marca-del-servicio" className="flex flex-none items-center justify-between gap-[var(--spacing-4)] escritorio:contents">
        <div className={`min-w-0 flex-1 escritorio:row-start-1 escritorio:flex escritorio:justify-center escritorio:pt-[calc(var(--spacing-20)+var(--spacing-8))] escritorio:text-center ${columna('marca')}`}>
          <TituloDelServicio servicio={servicio} fuentes={fuentes} className="escritorio:mx-auto" />
        </div>
        <LugarDeLosNanobots estado={estado} className={`aspect-square w-[calc(var(--spacing-20)*1.25)] flex-none escritorio:row-start-2 escritorio:aspect-auto escritorio:size-full escritorio:min-h-0 ${columna('marca')}`} />
      </header>
      <div data-parte="video" className={`flex-none escritorio:row-span-3 escritorio:row-start-1 escritorio:h-full ${columna('video')} ${SANGRIA[d.orden.indexOf('video')] ?? ''}`}>
        <VideoDelServicio id={id} corte={d.diagonal} lleno />
      </div>
      <TextoEnDiagonal parrafos={TEXTO_DEL_MEDIO[id]} diagonal={d.diagonal} claseDeLetra={fuentes.claseDelTexto} className={`min-h-0 flex-1 escritorio:row-span-3 escritorio:row-start-1 escritorio:h-full ${columna('texto')}`} />
      <div className={`flex-none escritorio:row-start-3 escritorio:flex escritorio:justify-center escritorio:pb-[var(--spacing-12)] ${columna('marca')}`}>
        <EnlaceDelServicio id={id} />
      </div>
      {/* Abajo de 1024, el aviso del gesto (05-TEXTOS): que se entienda que se desliza para pasar de servicio. */}
      <AvisoDeScroll texto={AVISO_DEL_TELEFONO} className="flex-none escritorio:hidden" />
    </article>
  )
}

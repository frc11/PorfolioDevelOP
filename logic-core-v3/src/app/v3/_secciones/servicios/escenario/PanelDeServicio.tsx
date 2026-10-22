'use client'

import type { CSSProperties } from 'react'

import { ContenidoDelCta } from '../../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../../_componentes/navegacion/EnlaceDeRuta'
import { pedirElViajeAlServicio } from '../../../_componentes/navegacion/viajeAlServicio'
import { Titular } from '../../../_componentes/tipografia/Titular'
import type { IdDeServicio, Servicio } from '../../_contrato/acento'
import { ALTO_DEL_MEDIO, ANCHO_DEL_MEDIO, CONTENIDO, CTA_POR_SERVICIO, NOMBRE_CORTO, SIZES_DEL_MEDIO } from '../contenido'
import { VideoDeServicio } from '../VideoDeServicio'
import { DESCRIPCION_DEL_VIDEO_PROVISORIO, DESTINO_DEL_SERVICIO, DISTRIBUCION, PRESET_DEL_DESTINO, VIDEO_DEL_SERVICIO, type Distribucion, type Entrada } from './datos'
import { TextoEnDiagonal } from './TextoEnDiagonal'

/**
 * [B4] UN SERVICIO, EN SU PANEL — el papel que entra (desde la izquierda web, desde la derecha software, desde arriba IA) y cierra
 * sobre lo de antes, por debajo de los nanobots. Adentro, la distribución de cada uno (`DISTRIBUCION`): el video, el texto en su
 * franja y la marca (el título, el lugar donde se posan los nanobots y el CTA). El escenario lo mueve con la transición (`translate`,
 * en el compositor); el estado inicial, afuera, sale del servidor.
 *
 * El CTA es el enganche del viaje (B12b): un `EnlaceDeRuta` a la página del servicio (`DESTINO_DEL_SERVICIO`), con
 * `data-viaje-del-servicio`. [B12b] Su `onClick` pide el viaje al preset de esa página (`PRESET_DEL_DESTINO`,
 * `_componentes/navegacion/viajeAlServicio.ts`): el papel se levanta, anochece y la cámara llega a su composición; sin escena, el velo.
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
  const corte = 'calc(56.25cqw * var(--tangente-de-la-diagonal, 0.364))'
  if (lado === 'izquierda') return { clipPath: `polygon(0 0, calc(100% - ${corte}) 0, 100% 100%, 0 100%)` }
  if (lado === 'derecha') return { clipPath: `polygon(${corte} 0, 100% 0, 100% 100%, 0 100%)` }
  return {}
}

export function EnlaceDelServicio({ id }: { readonly id: IdDeServicio }): React.JSX.Element {
  return (
    <div style={{ color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}>
      <EnlaceDeRuta href={DESTINO_DEL_SERVICIO[id]} onClick={(e) => pedirElViajeAlServicio(e, PRESET_DEL_DESTINO[id])} data-pieza="cta" data-variante="linea" data-registro="cuerpo" data-viaje-del-servicio={id} className="text-base no-underline">
        <ContenidoDelCta rotulo={CTA_POR_SERVICIO[id]} />
      </EnlaceDeRuta>
    </div>
  )
}

export function VideoDelServicio({ id, corte }: { readonly id: IdDeServicio; readonly corte: 'izquierda' | 'derecha' | null }): React.JSX.Element {
  const video = VIDEO_DEL_SERVICIO[id]
  return (
    <div data-pieza="video-del-servicio" className="w-full overflow-hidden rounded-[var(--radius-fuerte)]" style={{ containerType: 'inline-size', ...corteDelVideo(corte) }}>
      <VideoDeServicio fuente={video.fuente} poster={video.poster} descripcion={DESCRIPCION_DEL_VIDEO_PROVISORIO} ancho={ANCHO_DEL_MEDIO} alto={ALTO_DEL_MEDIO} sizes={SIZES_DEL_MEDIO} />
    </div>
  )
}

/** El lugar donde se posan los nanobots de este estado: una caja vacía que el escenario mide. */
export const LugarDeLosNanobots = ({ estado, className }: { readonly estado: number; readonly className?: string }): React.JSX.Element => (
  <div aria-hidden="true" data-lugar-de-los-nanobots={estado} className={className} />
)

/** Lo que ocupa cada pieza en escritorio, en fracciones (el video 2/5, el texto 3/10, la marca 1/3). */
const FRACCION = { video: 12, texto: 9, marca: 10 } as const
/** Las columnas de escritorio de una distribución (la grilla del panel). */
export const columnasDelPanel = (orden: Distribucion['orden']): string => orden.map((p) => `minmax(0,${String(FRACCION[p])}fr)`).join(' ')
const FILAS_DEL_PANEL = 'auto minmax(0,1fr) auto'
const COLUMNA = ['escritorio:col-start-1', 'escritorio:col-start-2', 'escritorio:col-start-3'] as const
const ALINEACION = ['escritorio:justify-self-start', 'escritorio:justify-self-center escritorio:text-center', 'escritorio:justify-self-end escritorio:text-right'] as const

/**
 * El marcado va en el orden de LECTURA, el mismo de las pantallas sueltas (el video, el título, el texto y el CTA): las dos ramas
 * anuncian lo mismo. En escritorio, la grilla pone cada pieza en su columna (`DISTRIBUCION`), con el título arriba, los nanobots en el
 * medio y el CTA abajo de la marca; abajo de 1024 (el teléfono con gatillos), apilado en ese orden, con los nanobots más chicos.
 */
export function PanelDeServicio({ servicio, estado, foco }: { readonly servicio: Servicio; readonly estado: number; readonly foco: (estado: number) => void }): React.JSX.Element {
  const { id } = servicio
  const d = DISTRIBUCION[id]
  const columna = (p: Distribucion['orden'][number]): string => COLUMNA[d.orden.indexOf(p)] ?? ''
  const alineada = ALINEACION[d.orden.indexOf('marca')] ?? ''
  const grilla = { translate: traslacionDelPanel(d.entrada, 0), '--columnas-del-panel': columnasDelPanel(d.orden), '--filas-del-panel': FILAS_DEL_PANEL } as CSSProperties
  return (
    <article
      data-pieza="panel-de-servicio"
      data-servicio={id}
      data-estado={estado}
      aria-labelledby={idDelTituloDelServicio(id)}
      onFocus={() => foco(estado)}
      className="bg-fondo absolute inset-0 z-20 flex flex-col gap-[var(--spacing-4)] border-borde px-[var(--pad-lateral-compacto)] pt-[calc(var(--spacing-20)+var(--spacing-2))] pb-[var(--spacing-6)] shadow-[0_0_var(--spacing-12)_var(--tw-shadow-color)] shadow-tinta/10 will-change-transform escritorio:grid escritorio:grid-cols-[var(--columnas-del-panel)] escritorio:grid-rows-[var(--filas-del-panel)] escritorio:gap-x-[var(--spacing-12)] escritorio:gap-y-[var(--spacing-6)] escritorio:pt-[calc(var(--spacing-20)+var(--spacing-6))] escritorio:pb-[var(--spacing-12)]"
      style={grilla}
    >
      <div className={`flex items-center escritorio:row-span-3 escritorio:row-start-1 ${columna('video')}`}>
        <VideoDelServicio id={id} corte={d.diagonal} />
      </div>
      <Titular nivel="titulo-l" como="h3" id={idDelTituloDelServicio(id)} className={`text-acento escritorio:row-start-1 escritorio:pt-[var(--spacing-8)] ${columna('marca')} ${alineada}`}>
        {nombreDelServicio(servicio)}
      </Titular>
      <LugarDeLosNanobots estado={estado} className={`aspect-square h-1/6 w-auto flex-none self-center escritorio:aspect-auto escritorio:h-full escritorio:min-h-0 escritorio:w-full escritorio:self-stretch escritorio:row-start-2 ${columna('marca')}`} />
      <TextoEnDiagonal texto={CONTENIDO[id].parrafo} diagonal={d.diagonal} className={`min-h-0 flex-1 escritorio:h-full escritorio:row-span-3 escritorio:row-start-1 ${columna('texto')}`} />
      <div className={`escritorio:row-start-3 escritorio:pb-[var(--spacing-8)] ${columna('marca')} ${alineada}`}>
        <EnlaceDelServicio id={id} />
      </div>
    </article>
  )
}

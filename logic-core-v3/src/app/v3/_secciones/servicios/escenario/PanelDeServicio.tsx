'use client'

import type { CSSProperties, ReactNode } from 'react'

import { ContenidoDelCta } from '../../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../../_componentes/navegacion/EnlaceDeRuta'
import { pedirElViajeAlServicio } from '../../../_componentes/navegacion/viajeAlServicio'
import type { IdDeServicio, Servicio } from '../../_contrato/acento'
import { ALTO_DEL_MEDIO, ANCHO_DEL_MEDIO, CTA_POR_SERVICIO, SIZES_DEL_MEDIO } from '../contenido'
import { VideoDeServicio } from '../VideoDeServicio'
import { CORTE_DE_LA_DIAGONAL, DESCRIPCION_DEL_VIDEO_PROVISORIO, DESTINO_DEL_SERVICIO, DISTRIBUCION, LEER_MAS, PRESET_DEL_DESTINO, TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO, VIDEO_DEL_SERVICIO, type Distribucion, type Entrada } from './datos'
import { TextoEnDiagonal } from './TextoEnDiagonal'
import { CLASE_DEL_RENGLON_DERECHO, type FuentesDelServicio } from './useFuentesDelServicio'

/**
 * [B4 · C2-50 · L3] UN SERVICIO, EN SU PANEL — el papel que entra (desde la izquierda web, desde la derecha software, desde arriba IA) y
 * cierra sobre lo de antes, por debajo de los nanobots. El escenario lo mueve con la transición (`translate`, en el compositor); el
 * estado inicial, afuera, sale del servidor.
 *
 * La distribución de escritorio, en una grilla de tres columnas (`DISTRIBUCION`):
 *   · **la marca**: el título del servicio en dos renglones ([L3] el primero derecho, en la display del Panel; el segundo en cursiva,
 *     `?titulo-cursiva=`), cada uno con su subrayado (lo escribe la coreografía), alineado por la diagonal del cuerpo: en web a la
 *     izquierda y el segundo renglón corrido hacia adentro lo que corre la diagonal en un renglón; en software, el espejo (a la derecha);
 *     en IA, centrado. Debajo, el lugar de los nanobots.
 *   · **el video**: toda su columna, de arriba a abajo y hasta el borde del panel, con un velo oscuro leve, cortado por la diagonal.
 *   · **el texto del medio**: de techo a pie, en la letra de los cuerpos ([L3]: sin la serif cursiva, al mismo tamaño y en la misma
 *     franja), y al final «Leer más…» (`TextoEnDiagonal`).
 * Abajo de 1024 (el teléfono y la tablet): el título arriba con los nanobots a su derecha, el video y el texto (más corto y más grande),
 * apilados. [L3] El aviso del gesto quedó sólo en la entrada.
 *
 * [L3] A la página del servicio llevan el título, el video y «Leer más…» (el CTA «Quiero mi…» se fue: dos botones iguales, no). Los tres
 * son `EnlaceAlServicio`: `EnlaceDeRuta` con `data-viaje-del-servicio` y el viaje de B12b en su `onClick`. El del video no se anuncia ni
 * entra al Tab (repite al del título).
 */

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

/** [L3] Un enlace a la página del servicio, con el viaje (B12b). `oculto`: no se anuncia ni entra al Tab (el video, que repite al título). */
export function EnlaceAlServicio({ id, children, className, oculto = false, parte }: { readonly id: IdDeServicio; readonly children: ReactNode; readonly className?: string; readonly oculto?: boolean; readonly parte?: string }): React.JSX.Element {
  return (
    <EnlaceDeRuta
      href={DESTINO_DEL_SERVICIO[id]}
      onClick={(e) => pedirElViajeAlServicio(e, PRESET_DEL_DESTINO[id])}
      data-viaje-del-servicio={id}
      data-parte={parte}
      aria-hidden={oculto ? true : undefined}
      tabIndex={oculto ? -1 : undefined}
      className={className}
    >
      {children}
    </EnlaceDeRuta>
  )
}

/** [C2-51] El link chico del recomendador («Ver la página de…»), con el mismo viaje; `enTinta`, en la tinta del papel. */
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
 * Abajo de 1024 siempre en su proporción, con las esquinas redondeadas. [L3] Es un enlace a la página del servicio.
 */
export function VideoDelServicio({ id, corte, lleno = false }: { readonly id: IdDeServicio; readonly corte: 'izquierda' | 'derecha' | null; readonly lleno?: boolean }): React.JSX.Element {
  const video = VIDEO_DEL_SERVICIO[id]
  const caja = lleno ? 'aspect-video escritorio:aspect-auto escritorio:h-full escritorio:rounded-none' : 'aspect-video'
  return (
    <div data-pieza="video-del-servicio" className={`relative w-full overflow-hidden rounded-[var(--radius-fuerte)] ${caja}`} style={corteDelVideo(corte)}>
      <EnlaceAlServicio id={id} oculto className="absolute inset-0 block cursor-pointer">
        <VideoDeServicio fuente={video.fuente} poster={video.poster} descripcion={DESCRIPCION_DEL_VIDEO_PROVISORIO} ancho={ANCHO_DEL_MEDIO} alto={ALTO_DEL_MEDIO} sizes={SIZES_DEL_MEDIO} className="absolute inset-0 size-full object-cover" />
        {/* El velo oscuro leve (ítem 13): le baja la importancia al video, que es un placeholder. */}
        <span aria-hidden="true" data-parte="velo-del-video" className="bg-tinta/35 pointer-events-none absolute inset-0" />
      </EnlaceAlServicio>
    </div>
  )
}

/** El lugar donde se posan los nanobots de este estado: una caja vacía que el escenario mide. */
export const LugarDeLosNanobots = ({ estado, className }: { readonly estado: number; readonly className?: string }): React.JSX.Element => (
  <div aria-hidden="true" data-lugar-de-los-nanobots={estado} className={className} />
)

/** [L3] Cómo se alinea el título en escritorio: por la diagonal del cuerpo (abajo de 1024 la tangente es 0 y va a la izquierda). */
export type AlineacionDelTitulo = 'izquierda' | 'derecha' | 'centro'
export const alineacionDelTitulo = (d: Distribucion): AlineacionDelTitulo => (d.diagonal === 'izquierda' ? 'izquierda' : d.diagonal === 'derecha' ? 'derecha' : 'centro')

const ALINEACION: Readonly<Record<AlineacionDelTitulo, { readonly bloque: string; readonly segundo: string }>> = {
  // El segundo renglón, corrido lo que corre la diagonal en un renglón (su alto y el del subrayado).
  izquierda: { bloque: 'items-start text-left', segundo: 'escritorio:ml-[calc((1lh+var(--spacing-2))*var(--tangente-de-la-diagonal))]' },
  derecha: { bloque: 'items-start text-left escritorio:items-end escritorio:text-right', segundo: 'escritorio:mr-[calc((1lh+var(--spacing-2))*var(--tangente-de-la-diagonal))]' },
  centro: { bloque: 'items-start text-left escritorio:items-center escritorio:text-center', segundo: '' },
}

/** Un renglón del título con su subrayado (`scale` de 0 a 1 desde la izquierda: lo escribe la coreografía). */
function RenglonDelTitulo({ children, className }: { readonly children: ReactNode; readonly className: string }): React.JSX.Element {
  return (
    <span data-parte="renglon-del-titulo" className={`block w-fit max-w-full ${className}`}>
      {children}
      <span aria-hidden="true" data-parte="subrayado-del-servicio" className="mt-[var(--spacing-1)] block h-[calc(var(--border-hairline)*3)] w-full origin-left bg-current" />
    </span>
  )
}

/** [L3] El título de un servicio: dos renglones, cada uno subrayado; todo él es el enlace a la página del servicio. */
export function TituloDelServicio({ servicio, fuentes, alineacion, className }: { readonly servicio: Servicio; readonly fuentes: FuentesDelServicio; readonly alineacion: AlineacionDelTitulo; readonly className?: string }): React.JSX.Element {
  const { id } = servicio
  const t = TITULO_DEL_SERVICIO[id]
  const a = ALINEACION[alineacion]
  const cursiva = fuentes.claseDeLaCursiva === '' ? 'font-serif' : fuentes.claseDeLaCursiva
  return (
    <h3 id={idDelTituloDelServicio(id)} data-parte="titulo-del-servicio" data-titulo-cursiva={fuentes.cursiva} className={`text-acento text-fluido-display escritorio:text-fluido-display-xl leading-cartel relative w-full max-w-full ${className ?? ''}`}>
      <EnlaceAlServicio id={id} className={`flex flex-col gap-[var(--spacing-2)] no-underline ${a.bloque}`}>
        <RenglonDelTitulo className={`${CLASE_DEL_RENGLON_DERECHO} whitespace-nowrap`}>{t.derecho}</RenglonDelTitulo>
        {/* El espacio entre los renglones: el nombre accesible se lee «Desarrollo web», no pegado. */}{' '}
        {/* En escritorio, un renglón entero (el ajuste achica el título si no entra); en el teléfono la cursiva puede partirse. */}
        <RenglonDelTitulo className={`${cursiva} font-normal italic escritorio:whitespace-nowrap ${a.segundo}`}>{t.cursiva}</RenglonDelTitulo>
      </EnlaceAlServicio>
    </h3>
  )
}

/** [L3] «Leer más…»: discreto, un subrayado simple en el acento; va al final del cuerpo y sigue su diagonal. */
export const LeerMas = ({ id }: { readonly id: IdDeServicio }): React.JSX.Element => (
  <EnlaceAlServicio id={id} parte="leer-mas" className="text-acento underline decoration-1 underline-offset-4 hover:decoration-2">
    {LEER_MAS}
  </EnlaceAlServicio>
)

/** Las columnas de escritorio de una distribución (la grilla del panel). */
export const columnasDelPanel = (d: Distribucion): string => d.fracciones.map((f) => `minmax(0,${String(f)}fr)`).join(' ')
const FILAS_DEL_PANEL = 'auto minmax(0,1fr) auto'
const COLUMNA = ['escritorio:col-start-1', 'escritorio:col-start-2', 'escritorio:col-start-3'] as const
/** El video sangra hasta el borde del panel del lado de afuera. */
const SANGRIA = ['escritorio:-ml-[var(--pad-lateral-compacto)]', '', 'escritorio:-mr-[var(--pad-lateral-compacto)]'] as const
const MARCA: Readonly<Record<AlineacionDelTitulo, string>> = { izquierda: 'escritorio:justify-start', derecha: 'escritorio:justify-end', centro: 'escritorio:justify-center' }

export function PanelDeServicio({ servicio, estado, foco, fuentes }: { readonly servicio: Servicio; readonly estado: number; readonly foco: (estado: number) => void; readonly fuentes: FuentesDelServicio }): React.JSX.Element {
  const { id } = servicio
  const d = DISTRIBUCION[id]
  const alineacion = alineacionDelTitulo(d)
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
        <div className={`min-w-0 flex-1 escritorio:row-start-1 escritorio:flex escritorio:pt-[calc(var(--spacing-20)+var(--spacing-8))] ${MARCA[alineacion]} ${columna('marca')}`}>
          <TituloDelServicio servicio={servicio} fuentes={fuentes} alineacion={alineacion} />
        </div>
        <LugarDeLosNanobots estado={estado} className={`aspect-square w-[calc(var(--spacing-20)*1.25)] flex-none escritorio:row-span-2 escritorio:row-start-2 escritorio:mb-[var(--spacing-12)] escritorio:aspect-auto escritorio:size-full escritorio:min-h-0 ${columna('marca')}`} />
      </header>
      <div data-parte="video" className={`flex-none escritorio:row-span-3 escritorio:row-start-1 escritorio:h-full ${columna('video')} ${SANGRIA[d.orden.indexOf('video')] ?? ''}`}>
        <VideoDelServicio id={id} corte={d.diagonal} lleno />
      </div>
      <TextoEnDiagonal parrafos={TEXTO_DEL_MEDIO[id]} diagonal={d.diagonal} final={<LeerMas id={id} />} className={`min-h-0 flex-1 escritorio:row-span-3 escritorio:row-start-1 escritorio:h-full ${columna('texto')}`} />
    </article>
  )
}

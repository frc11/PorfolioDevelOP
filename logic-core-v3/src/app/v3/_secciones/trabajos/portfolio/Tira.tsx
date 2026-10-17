'use client'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'
import type { ProyectoDelPortfolio } from '../proyectos'

import type { MaterialDelPanel } from './banderas'
import { Ficha } from './Ficha'
import { MedioDeLaTira, PosterDelLomo } from './MedioDeLaTira'
import { pasoDeLaPortada, type VistaDelPaso } from './pasos'
import type { PortfolioVivo } from './usePortfolio'

/** Los ids de una tira: su cabecera, su medio y su contenido. */
export const idsDeLaTira = (slug: string): { readonly cabecera: string; readonly medio: string; readonly region: string } => ({
  cabecera: `portfolio-cabecera-${slug}`,
  medio: `portfolio-medio-${slug}`,
  region: `portfolio-region-${slug}`,
})

/**
 * El ancho de un lomo y el ritmo con que una tira se abre, y el material (que va en cada tira y no en el panel: la de «la tuya» deja
 * ver el lienzo por el hueco del «?»). Las clases enteras, para el escáner de Tailwind.
 */
export const CLASES_DE_LA_TIRA = {
  base: 'relative flex h-full min-w-0 flex-col overflow-clip border-l border-tinta/10 transition-all duration-500 ease-[var(--ease-salida)] motion-reduce:transition-none',
  activa: 'grow basis-0',
  lomo: 'grow-0 basis-14 shrink-0',
  material: { tinta: 'bg-fondo', vidrio: '' } satisfies Record<MaterialDelPanel, string>,
} as const

/** El vidrio del sistema (`CLAUDE.md`: tinta al 4 %, desenfoque de 20 px y saturación del 180 %), en línea: no son tokens del lane. */
export const ESTILO_DEL_VIDRIO: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--color-tinta) 4%, transparent)',
  backdropFilter: 'blur(20px) saturate(180%)',
}

/** La cabecera de una tira: el botón del acordeón. Activa, el nombre arriba de su contenido; inactiva, el lomo entero. */
export function CabeceraDeLaTira({ id, indice, activa, nombre, controla, alElegir }: {
  readonly id: string
  readonly indice: number
  readonly activa: boolean
  readonly nombre: string
  readonly controla: string
  readonly alElegir: () => void
}): React.JSX.Element {
  return (
    <h3 className={cn(activa ? 'px-8 pt-6' : 'absolute inset-0')}>
      <button
        type="button"
        id={id}
        data-tira-indice={indice}
        aria-expanded={activa}
        aria-controls={controla}
        onClick={alElegir}
        className={cn(
          'text-left font-titulo text-tinta focus-visible:outline-2 focus-visible:outline-offset-4',
          activa ? 'cursor-default' : 'flex h-full w-full items-end justify-center pb-8',
        )}
      >
        <span className={cn('block whitespace-nowrap', activa ? '' : '[writing-mode:vertical-rl] rotate-180 text-[length:var(--text-titulo-s)]')}>
          {activa ? <Titular nivel="titulo-l" como="span">{nombre}</Titular> : nombre}
        </span>
      </button>
    </h3>
  )
}

/**
 * [B1] UNA TIRA DEL ACORDEÓN — un proyecto (plan §5.9). Activa: el medio del recorrido (16:10, contenido), el nombre y el rubro
 * abajo; en el paso de la ficha el medio se achica arriba y la ficha aparece abajo. Inactiva: un lomo con el nombre girado sobre el
 * póster en grises. «Visitar sitio ↗» abre el sitio en una pestaña nueva (`noopener noreferrer`); el medio lleva el mismo enlace sólo
 * para el mouse (una sola parada por tira).
 */
export function Tira({
  proyecto,
  indice,
  activa,
  vista,
  vivo,
}: {
  readonly proyecto: ProyectoDelPortfolio
  readonly indice: number
  readonly activa: boolean
  readonly vista: VistaDelPaso
  readonly vivo: PortfolioVivo
}): React.JSX.Element {
  const ids = idsDeLaTira(proyecto.slug)
  const ficha = activa && vista === 'ficha'
  return (
    <div
      data-tira={proyecto.slug}
      data-activa={activa}
      data-vista={vista}
      className={cn(CLASES_DE_LA_TIRA.base, CLASES_DE_LA_TIRA.material[vivo.banderas.material], activa ? CLASES_DE_LA_TIRA.activa : CLASES_DE_LA_TIRA.lomo)}
      style={vivo.banderas.material === 'vidrio' ? ESTILO_DEL_VIDRIO : undefined}
    >
      {activa ? null : <PosterDelLomo proyecto={proyecto} />}
      <div id={ids.medio} hidden={!activa} className={cn('px-8 pt-12 transition-all duration-500 motion-reduce:transition-none', ficha && 'px-20 pt-6')}>
        <MedioDeLaTira proyecto={proyecto} activa={activa} />
      </div>
      <CabeceraDeLaTira id={ids.cabecera} indice={indice} activa={activa} nombre={proyecto.nombre} controla={`${ids.medio} ${ids.region}`} alElegir={() => vivo.saltarAlPaso(pasoDeLaPortada(indice))} />
      <div id={ids.region} hidden={!activa} className="flex min-h-0 flex-1 flex-col gap-6 px-8 pb-12 pt-2">
        {proyecto.rubro === null ? null : <Cuerpo className="text-tinta/70">{proyecto.rubro}</Cuerpo>}
        <Ficha proyecto={proyecto} visible={ficha} />
        <a
          href={proyecto.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${CONTENIDO.ficha.visitar} de ${proyecto.nombre}, ${CONTENIDO.ficha.abreAparte}`}
          className="mt-auto self-start font-titulo text-tinta underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {CONTENIDO.ficha.visitar} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  )
}

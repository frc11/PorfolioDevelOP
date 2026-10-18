'use client'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'
import type { ProyectoDelPortfolio } from '../proyectos'

import { Ficha, piezasDeLaFicha } from './Ficha'
import { MarcaDeAgua } from './MarcaDeAgua'
import { MedioDeLaTira, PosterDelLomo } from './MedioDeLaTira'
import { enLaSecuencia } from './secuencia'
import type { PortfolioVivo } from './usePortfolio'

/** Los ids de una tira: su cabecera, su medio y su contenido. */
export const idsDeLaTira = (slug: string): { readonly cabecera: string; readonly medio: string; readonly region: string } => ({
  cabecera: `portfolio-cabecera-${slug}`,
  medio: `portfolio-medio-${slug}`,
  region: `portfolio-region-${slug}`,
})

/**
 * El ancho de un lomo y el ritmo con que una tira se abre. Las clases enteras, para el escáner de Tailwind. [B1.2b] Sin material
 * propio: el vidrio va en el panel (`ESTILO_DEL_VIDRIO`) y las tiras, todas iguales, se separan con su borde.
 */
export const CLASES_DE_LA_TIRA = {
  base: 'relative flex h-full min-w-0 flex-col overflow-clip border-l border-tinta/10 transition-all duration-500 ease-[var(--ease-salida)] motion-reduce:transition-none',
  activa: 'grow basis-0',
  lomo: 'grow-0 basis-14 shrink-0',
} as const

/**
 * La cabecera de una tira: el botón del acordeón. Activa, el nombre arriba de su contenido (entra con la secuencia); inactiva, el
 * lomo entero. Enter (y la barra) en un lomo lo activa: es su clic.
 */
export function CabeceraDeLaTira({ id, indice, activa, nombre, controla, nivel = 'titulo-l', visible, reducido, alElegir }: {
  readonly id: string
  readonly indice: number
  readonly activa: boolean
  readonly nombre: string
  readonly controla: string
  readonly nivel?: 'titulo-l' | 'titulo-xl'
  readonly visible: boolean
  readonly reducido: boolean
  readonly alElegir: () => void
}): React.JSX.Element {
  return (
    <h3 className={cn('relative', activa ? 'px-8 pt-6' : 'absolute inset-0')}>
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
        {activa ? (
          <motion.span className="block" {...enLaSecuencia(visible, 0, reducido)}>
            <Titular nivel={nivel} como="span">{nombre}</Titular>
          </motion.span>
        ) : (
          <span className="block whitespace-nowrap [writing-mode:vertical-rl] rotate-180 text-[length:var(--text-titulo-s)]">{nombre}</span>
        )}
      </button>
    </h3>
  )
}

/**
 * [B1] UNA TIRA DEL ACORDEÓN — un proyecto (plan §5.9; [B1.2b] §12, punto 5). Activa: el video del recorrido arriba (16:10,
 * contenido), el nombre, y la ficha abajo, SIEMPRE (no hay portada ni ficha): al cruzar el borde de su paso la secuencia entra por
 * tiempo (`secuencia.ts`; [B1.2c] después de la salida completa de la anterior y un respiro, `transicion.ts`). Detrás de la ficha, la
 * marca de agua del cliente. Inactiva: un lomo con el nombre girado sobre el póster
 * en grises. «Visitar sitio ↗» abre el sitio en una pestaña nueva (`noopener noreferrer`); el medio lleva el mismo enlace sólo
 * para el mouse (una sola parada por tira).
 */
export function Tira({
  proyecto,
  indice,
  activa,
  visible,
  vivo,
}: {
  readonly proyecto: ProyectoDelPortfolio
  readonly indice: number
  /** La tira abierta (la ancha). */
  readonly activa: boolean
  /** [B1.2c] Su contenido se muestra: la ancha, quieta (`transicion.ts`), con la escena adentro. */
  readonly visible: boolean
  readonly vivo: PortfolioVivo
}): React.JSX.Element {
  const ids = idsDeLaTira(proyecto.slug)
  const piezas = piezasDeLaFicha(proyecto)
  return (
    <div data-tira={proyecto.slug} data-activa={activa} className={cn(CLASES_DE_LA_TIRA.base, activa ? CLASES_DE_LA_TIRA.activa : CLASES_DE_LA_TIRA.lomo)}>
      {activa ? <MarcaDeAgua proyecto={proyecto} cerca={vivo.cerca} /> : <PosterDelLomo proyecto={proyecto} cerca={vivo.cerca} />}
      <div id={ids.medio} hidden={!activa} className="relative px-8 pt-8">
        <motion.div {...enLaSecuencia(visible, 0, vivo.reducido)}>
          <MedioDeLaTira proyecto={proyecto} activa={activa} cerca={vivo.cerca} aLaVista={vivo.aLaVista} reducido={vivo.reducido} />
        </motion.div>
      </div>
      <CabeceraDeLaTira id={ids.cabecera} indice={indice} activa={activa} nombre={proyecto.nombre} controla={`${ids.medio} ${ids.region}`} visible={visible} reducido={vivo.reducido} alElegir={() => vivo.saltarAlPaso(indice, true)} />
      <div id={ids.region} hidden={!activa} className="relative flex min-h-0 flex-1 flex-col gap-5 px-8 pb-12 pt-2">
        {proyecto.rubro === null ? null : (
          <motion.div {...enLaSecuencia(visible, 1, vivo.reducido)}>
            <Cuerpo className="text-tinta/70">{proyecto.rubro}</Cuerpo>
          </motion.div>
        )}
        <Ficha proyecto={proyecto} visible={visible} reducido={vivo.reducido} desde={2} />
        <motion.a
          href={proyecto.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${CONTENIDO.ficha.visitar} de ${proyecto.nombre}, ${CONTENIDO.ficha.abreAparte}`}
          className="relative mt-auto self-start font-titulo text-tinta underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          {...enLaSecuencia(visible, 2 + piezas, vivo.reducido)}
        >
          {CONTENIDO.ficha.visitar} <span aria-hidden="true">↗</span>
        </motion.a>
      </div>
    </div>
  )
}

'use client'

import { Titular } from '../../../_componentes/tipografia/Titular'
import { SERVICIOS, type Servicio } from '../../_contrato/acento'
import { Gatillo } from '../../_contrato/Gatillo'
import { CONTENIDO } from '../contenido'
import { IntroDeServicios } from '../escenario/IntroDeServicios'
import { EnlaceDelServicio, VideoDelServicio, idDelTituloDelServicio, nombreDelServicio } from '../escenario/PanelDeServicio'
import { NanobotsQuietos } from './NanobotsQuietos'

/**
 * [B4] SERVICIOS CON SCROLL NORMAL — `?servicios-movil=deslizar` (el defecto abajo de 1024), y la sección sin coreografía en cualquier
 * ancho (sin JavaScript todavía, o con menos movimiento). La entrada con los nanobots grises detrás del título, y cada servicio una
 * pantalla: el video arriba, el título con sus nanobots (más chicos), el texto y el CTA. Cada pantalla entra con el gatillo del
 * contrato (`Gatillo`: una vez al cruzar la línea, y vuelve al subir); con menos movimiento, quieta.
 */
export function ServiciosDeslizar(): React.JSX.Element {
  return (
    <div data-pieza="servicios-deslizar" className="flex w-full flex-col">
      <div className="relative flex min-h-svh items-center justify-center px-[var(--pad-lateral-compacto)] py-[var(--spacing-20)]">
        <NanobotsQuietos estado={0} className="absolute inset-x-1/8 inset-y-1/6" />
        <IntroDeServicios progreso={null} className="relative z-10" />
      </div>
      {SERVICIOS.map((s, i) => (
        <PantallaDeServicio key={s.id} servicio={s} estado={i + 1} />
      ))}
    </div>
  )
}

function PantallaDeServicio({ servicio, estado }: { readonly servicio: Servicio; readonly estado: number }): React.JSX.Element {
  const { id } = servicio
  return (
    <article data-pieza="pantalla-de-servicio" data-servicio={id} aria-labelledby={idDelTituloDelServicio(id)} className="flex min-h-svh flex-col justify-center px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]">
      <Gatillo className="mx-auto flex w-full max-w-[calc(var(--spacing-20)*8)] flex-col gap-[var(--spacing-6)]">
        <VideoDelServicio id={id} corte={null} />
        <div className="flex items-center justify-between gap-[var(--spacing-4)]">
          <Titular nivel="titulo-l" como="h3" id={idDelTituloDelServicio(id)} className="text-acento">
            {nombreDelServicio(servicio)}
          </Titular>
          <NanobotsQuietos estado={estado} className="aspect-square h-[calc(var(--spacing-20)*1.25)] shrink-0" />
        </div>
        <p className="font-cuerpo text-fluido-titulo-s leading-texto text-tinta">{CONTENIDO[id].parrafo}</p>
        <EnlaceDelServicio id={id} />
      </Gatillo>
    </article>
  )
}

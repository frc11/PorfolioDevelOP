'use client'

import { SERVICIOS, type Servicio } from '../../_contrato/acento'
import { Gatillo } from '../../_contrato/Gatillo'
import { TEXTO_DEL_MEDIO } from '../escenario/datos'
import { IntroDeServicios } from '../escenario/IntroDeServicios'
import { EnlaceDelServicio, TituloDelServicio, VideoDelServicio, idDelTituloDelServicio } from '../escenario/PanelDeServicio'
import { useFuentesDelServicio } from '../escenario/useFuentesDelServicio'
import { NanobotsQuietos } from './NanobotsQuietos'

/**
 * [B4 · C2-50] SERVICIOS CON SCROLL NORMAL — la sección sin coreografía en cualquier ancho (sin JavaScript todavía, o con menos
 * movimiento; `?servicios-movil=deslizar` se borró: con movimiento, el teléfono va con gatillos). La entrada con los nanobots detrás
 * del título, y cada servicio una pantalla, en el orden del teléfono (`lote3/02`): el título con sus nanobots a la derecha, el video,
 * el texto del medio y el CTA. Cada pantalla entra con el gatillo del
 * contrato (`Gatillo`: una vez al cruzar la línea, y vuelve al subir); con menos movimiento, quieta.
 */
export function ServiciosDeslizar(): React.JSX.Element {
  return (
    <div data-pieza="servicios-deslizar" className="flex w-full flex-col">
      <div className="relative flex min-h-svh items-center justify-center px-[var(--pad-lateral-compacto)] py-[var(--spacing-20)]">
        <NanobotsQuietos estado={0} className="absolute inset-x-1/8 inset-y-1/6" />
        <IntroDeServicios progreso={null} aviso={null} className="relative z-10 w-full" />
      </div>
      {SERVICIOS.map((s, i) => (
        <PantallaDeServicio key={s.id} servicio={s} estado={i + 1} />
      ))}
    </div>
  )
}

function PantallaDeServicio({ servicio, estado }: { readonly servicio: Servicio; readonly estado: number }): React.JSX.Element {
  const { id } = servicio
  const fuentes = useFuentesDelServicio()
  return (
    <article data-pieza="pantalla-de-servicio" data-servicio={id} aria-labelledby={idDelTituloDelServicio(id)} className="flex min-h-svh flex-col justify-center px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]">
      <Gatillo className="mx-auto flex w-full max-w-[calc(var(--spacing-20)*8)] flex-col gap-[var(--spacing-6)]">
        <div className="flex items-center justify-between gap-[var(--spacing-4)]">
          <TituloDelServicio servicio={servicio} fuentes={fuentes} />
          <NanobotsQuietos estado={estado} className="aspect-square h-[calc(var(--spacing-20)*1.25)] shrink-0" />
        </div>
        <VideoDelServicio id={id} corte={null} />
        <div className={`${fuentes.claseDelTexto === '' ? 'font-cuerpo' : fuentes.claseDelTexto} text-fluido-titulo-m leading-texto text-tinta italic`}>
          {TEXTO_DEL_MEDIO[id].map((parrafo, k) => (
            <p key={parrafo} className={k > 0 ? 'mt-[var(--spacing-4)]' : undefined}>
              {parrafo}
            </p>
          ))}
        </div>
        <EnlaceDelServicio id={id} />
      </Gatillo>
    </article>
  )
}

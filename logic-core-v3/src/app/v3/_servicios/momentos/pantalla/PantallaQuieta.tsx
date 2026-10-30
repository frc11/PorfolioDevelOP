import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { Imagen } from '../../../_componentes/medios/Imagen'
import type { SlugDelProyecto } from '../../../_secciones/trabajos/proyectos'
import type { TrabajoDeLaPantalla } from './LaPantalla'
import { MenuDeTrabajos } from './MenuDeTrabajos'
import { MEDIDAS_DE_LOS_POSTERS } from './planos'
import { TEXTOS_DE_LAS_FASES } from './textos'

/**
 * [M3] LA PANTALLA CON MOVIMIENTO REDUCIDO — sin recorrido clavado, sin trazo y sin video: la pantalla real de escritorio y la del celular
 * del mismo trabajo, lado a lado y quietas (sus pósters), con los mismos textos y el mismo menú.
 */
export function PantallaQuieta({
  trabajos,
  trabajo,
  alElegir,
}: {
  readonly trabajos: readonly TrabajoDeLaPantalla[]
  readonly trabajo: TrabajoDeLaPantalla
  readonly alElegir: (slug: SlugDelProyecto) => void
}): React.JSX.Element {
  const medidas = MEDIDAS_DE_LOS_POSTERS[trabajo.slug]
  return (
    <Envoltorio className="pt-8 pb-12 escritorio:pb-20">
      <div className="flex flex-col gap-8 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
        <div className="flex flex-col gap-6 escritorio:col-span-4">
          <MenuDeTrabajos trabajos={trabajos} elegido={trabajo.slug} alElegir={alElegir} />
          <div className="flex flex-col gap-3 text-cuerpo leading-texto">
            <p>{TEXTOS_DE_LAS_FASES.plano}</p>
            <p>{TEXTOS_DE_LAS_FASES.real(trabajo.nombre)}</p>
            <p>{TEXTOS_DE_LAS_FASES.celular}</p>
          </div>
        </div>
        <div className="flex items-end gap-4 escritorio:col-span-8">
          <div className="min-w-0 flex-[4] overflow-hidden rounded-sutil ring-1 ring-borde">
            <Imagen key={`e-${trabajo.slug}`} src={trabajo.medios.poster.escritorio} alt={`La página de ${trabajo.nombre}, en la compu`} ancho={medidas.escritorio[0]} alto={medidas.escritorio[1]} sizes="(min-width: 1024px) 50vw, 70vw" className="block h-auto w-full" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-medio border-4 border-tinta">
            <Imagen key={`m-${trabajo.slug}`} src={trabajo.medios.poster.movil} alt="La misma página, en el celular" ancho={medidas.movil[0]} alto={medidas.movil[1]} sizes="(min-width: 1024px) 15vw, 25vw" className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </Envoltorio>
  )
}

'use client'

import { Historias } from '../../../_componentes/historias/Historias'
import type { ItemDeHistoria, SalidaDeLasHistorias } from '../../../_componentes/historias/maquinaDeLasHistorias'
import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'
import { PROYECTOS, type ProyectoDelPortfolio } from '../proyectos'

import { FormularioDeLaTuya } from './FormularioDeLaTuya'
import { HistoriaDelProyecto } from './HistoriaDelProyecto'
import { DESPEJE_DE_LA_BARRA } from './LaTuya'
import { SignoQueSeArma } from './SignoDePregunta'

/** Un ítem de las historias del Portfolio: un proyecto, o «la tuya» (sin tiempo). */
export interface ItemDelPortfolio extends ItemDeHistoria {
  readonly proyecto: ProyectoDelPortfolio | null
}

export const ITEMS_DE_LAS_HISTORIAS: readonly ItemDelPortfolio[] = [
  ...PROYECTOS.map((proyecto) => ({ id: proyecto.slug, proyecto })),
  { id: 'la-tuya', proyecto: null, sinTiempo: true },
]

/**
 * [B1.2d B] T6 · T7 · «LA TUYA» EN LAS HISTORIAS — sin tiempo (su barra queda fija y se queda hasta que el usuario sale), con el mismo
 * formulario que en PC (B4/B5): el título, la frase y la bajada, y el formulario con su fila del botón, apoyados abajo (sin el hueco).
 * Los toques de los costados andan como en las demás, salvo sobre los campos, los botones y los enlaces; con un campo enfocado, nada
 * avanza (lo hace el componente común).
 */
export function LaTuyaEnLaHistoria({ reducido }: { readonly reducido: boolean }): React.JSX.Element {
  const c = CONTENIDO.laTuya
  return (
    <div data-historia="la-tuya" className="absolute inset-0 flex flex-col justify-end gap-5 px-5 pb-[calc(var(--spacing-6)+env(safe-area-inset-bottom))]" style={{ paddingTop: DESPEJE_DE_LA_BARRA }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-tenue">
        <SignoQueSeArma reducido={reducido} />
      </div>
      <Titular nivel="titulo-xl" como="h3" className="relative">{c.nombre}</Titular>
      <div className="relative flex flex-col gap-2">
        <Titular nivel="titulo-m" como="p">{c.frase}</Titular>
        <Cuerpo className="text-tinta/70">{c.bajada}</Cuerpo>
      </div>
      <div className="relative">
        <FormularioDeLaTuya visible reducido={reducido} desde={0} />
      </div>
    </div>
  )
}

/**
 * [B1.2d B] LAS HISTORIAS DEL PORTFOLIO (debajo de 1024, T2 a T8) — el componente común (`_componentes/historias/`, P-H19) con los
 * tres proyectos y «la tuya». Lo propio del Portfolio entra por acá: los ítems, cómo se pinta cada uno y adónde sale (adelante, Demos;
 * atrás, el título). Las monta el escenario cuando el panel entra (después del título, T3) y las desmonta cuando se va.
 */
export function HistoriasDelPortfolio({ cerca, aLaVista, reducido, alSalir }: {
  readonly cerca: boolean
  readonly aLaVista: boolean
  readonly reducido: boolean
  readonly alSalir: (hacia: SalidaDeLasHistorias) => void
}): React.JSX.Element {
  return (
    <Historias
      items={ITEMS_DE_LAS_HISTORIAS}
      etiqueta={CONTENIDO.acordeon}
      rotulos={CONTENIDO.historias}
      arribaDeLasBarras={DESPEJE_DE_LA_BARRA}
      alSalir={alSalir}
      renderItem={(item, e) =>
        item.proyecto === null ? <LaTuyaEnLaHistoria reducido={reducido} /> : <HistoriaDelProyecto proyecto={item.proyecto} pausada={e.pausada} cerca={cerca} aLaVista={aLaVista} reducido={reducido} />
      }
    />
  )
}

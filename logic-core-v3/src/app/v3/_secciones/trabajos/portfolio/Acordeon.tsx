'use client'

import { CONTENIDO } from '../contenido'
import { PROYECTOS } from '../proyectos'

import { TIRA_DE_LA_TUYA, vistaDelPaso } from './estado'
import { LaTuya } from './LaTuya'
import { Tira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'

/**
 * [B1] EL ACORDEÓN — una tira por proyecto y la de «la tuya», en el orden fijo de la spec (plan §5.9).
 *
 * El patrón es el del acordeón de la WAI: cada tira lleva su cabecera (un botón con `aria-expanded` en un `h3`) y su contenido en el
 * mismo lugar; los contenidos NO son `region` (cuatro regiones más llenarían de puntos de referencia el documento). La activa es
 * ancha y las otras son lomos con el nombre girado. El clic en una cabecera salta la página a su portada (`saltarAlPaso`).
 */
export function Acordeon({ vivo }: { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const { tira, vista } = vistaDelPaso(vivo.paso)
  return (
    <div data-pieza="acordeon" role="group" aria-label={CONTENIDO.acordeon} className="flex h-full w-full">
      {PROYECTOS.map((proyecto, i) => (
        <Tira key={proyecto.slug} proyecto={proyecto} indice={i} activa={tira === i} vista={tira === i ? vista : 'portada'} vivo={vivo} />
      ))}
      <LaTuya activa={tira === TIRA_DE_LA_TUYA} vivo={vivo} />
    </div>
  )
}

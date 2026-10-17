/**
 * [SERVICIOS S1b] 1 · EL PROBLEMA — el `h1` de la página (SPEC §5: título grande y una línea, sin precio ni CTA).
 *
 * Va directo sobre el fondo, sin panel (como el titular del hero del home): la sección es transparente. Arriba va el nombre del
 * servicio con la marca de relleno en el acento: es lo único que dice en qué página se está antes de leer el problema. El título
 * y la línea salen de los datos, tal cual, y entran por línea con el canal del texto del home.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { PrefijoDeServicio } from '../../_componentes/marca/Marca'
import { EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { TitularQueEntra } from '../movimiento/TitularQueEntra'
import type { Servicio } from '../tipos'
import { idDelTituloDe } from './Bloque'

export function Problema({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  const idDelTitulo = idDelTituloDe('problema')
  return (
    <section data-bloque="problema" aria-labelledby={idDelTitulo} className="py-12 escritorio:py-20">
      <Envoltorio>
        <div className="flex flex-col gap-6 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <p className="flex items-center gap-2 escritorio:col-span-12">
            <PrefijoDeServicio />
            <EtiquetaDeSeccion como="span" sangria={false} className="text-tinta-media">
              {servicio.nombre}
            </EtiquetaDeSeccion>
          </p>
          <TitularQueEntra
            id={idDelTitulo}
            texto={servicio.problema.titulo}
            nivel="titulo-xl"
            como="h1"
            className="text-balance"
            claseDelBloque="block w-full escritorio:col-span-10"
          />
          <TitularQueEntra
            texto={servicio.problema.texto}
            tipo="parrafo"
            nivel="titulo-s"
            como="p"
            peso="liviano"
            className="text-tinta-media"
            claseDelBloque="block w-full escritorio:col-span-7"
          />
        </div>
      </Envoltorio>
    </section>
  )
}

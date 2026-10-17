/**
 * [SERVICIOS S1b] 1 · EL PROBLEMA — el `h1` de la página (SPEC §5: título grande y una línea, sin precio ni CTA).
 *
 * Arriba va el nombre del servicio con la marca de relleno en el acento: es lo único que dice en qué página se está antes
 * de leer el problema. El título y la línea salen de los datos, tal cual.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { PrefijoDeServicio } from '../../_componentes/marca/Marca'
import { EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
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
          <Titular nivel="titulo-xl" como="h1" id={idDelTitulo} className="text-balance escritorio:col-span-10">
            {servicio.problema.titulo}
          </Titular>
          <Titular nivel="titulo-s" como="p" peso="liviano" className="text-tinta-media escritorio:col-span-7">
            {servicio.problema.texto}
          </Titular>
        </div>
      </Envoltorio>
    </section>
  )
}

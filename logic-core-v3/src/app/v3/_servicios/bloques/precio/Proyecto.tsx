/**
 * [SERVICIOS S2] 4 · PRECIO — el slot `proyecto` (Software a medida): un «desde» y la aclaración de que se cotiza (SPEC §7.2).
 *
 * El monto sale de `vistaDelPrecioDeUnProyecto` (que lo saca del dato por `usd()`): nada de números acá.
 */

import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { ROTULO_DEL_PRECIO } from './rotulos'
import { vistaDelPrecioDeUnProyecto, type PrecioPorProyecto } from './vistaDelPrecioPorProyecto'

export function Proyecto({ precio }: { readonly precio: PrecioPorProyecto }): React.JSX.Element {
  const vista = vistaDelPrecioDeUnProyecto(precio)
  return (
    <div className="flex flex-col gap-4 border-t border-borde-fuerte pt-6">
      <p className="flex flex-col gap-1">
        <Caption como="span" className="text-tinta-media">
          {ROTULO_DEL_PRECIO}
        </Caption>{' '}
        <Titular nivel="titulo-l" como="span" className="text-acento">
          {vista.monto}
        </Titular>
      </p>
      <Cuerpo className="text-tinta-media">{vista.nota}</Cuerpo>
    </div>
  )
}

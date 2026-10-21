/**
 * [SERVICIOS S1b · V1] EL ENCABEZADO MÍNIMO (D4) — un enlace al home con el logotipo de la marca. Nada más.
 *
 * No se monta `ChromeDelHome`: su barra arma los enlaces con fragmentos relativos (`#trabajos`) que en una subruta no llevan
 * a ninguna parte (P-H3). Mientras el home no lo resuelva (la navbar en el layout, B12a.5), la salida de la página es este enlace, con
 * recarga completa; antes de navegar pide la salida de la variante (la raíz de la página, `movimiento/RaizDeLaPagina.tsx`).
 *
 * [V1] Va ANTES de la intro y fuera de ella (la intro es la del home y no tiene lugar para él), sobre la escena: lleva su propio
 * `data-seccion="invertida"` para los claros (la tinta y el anillo de foco claros, como cuando iba adentro de la intro).
 */

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { Logotipo } from '../_componentes/marca/Marca'
import { HREF_DEL_HOME } from './rutas'

export function Encabezado(): React.JSX.Element {
  return (
    <header data-seccion="invertida" className="text-tinta">
      <Envoltorio className="py-6">
        <a href={HREF_DEL_HOME} className="inline-flex">
          <Logotipo className="text-fluido-titulo-s" />
        </a>
      </Envoltorio>
    </header>
  )
}

/**
 * [SERVICIOS S1b] EL ENCABEZADO MÍNIMO (D4) — un enlace al home con el logotipo de la marca. Nada más.
 *
 * No se monta `ChromeDelHome`: su barra arma los enlaces con fragmentos relativos (`#trabajos`) que en una subruta no llevan
 * a ninguna parte (P-H3). Mientras el home no lo resuelva, la salida de la página es este enlace, con recarga completa.
 */

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { Logotipo } from '../_componentes/marca/Marca'
import { HREF_DEL_HOME } from './rutas'

export function Encabezado(): React.JSX.Element {
  return (
    <header>
      <Envoltorio className="py-6">
        <a href={HREF_DEL_HOME} className="inline-flex">
          <Logotipo className="text-fluido-titulo-s" />
        </a>
      </Envoltorio>
    </header>
  )
}

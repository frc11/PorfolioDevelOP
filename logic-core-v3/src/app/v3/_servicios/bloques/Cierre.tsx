/**
 * [SERVICIOS S1b] 11 · CIERRE — provisorio hasta B13 (SPEC §5): un llamado simple y los enlaces, en un panel de vidrio. Se
 * reemplaza por el cierre global del home, que trae su propio formulario.
 *
 * El llamado abre el contacto igual que el del bloque 9 (`AbreElContacto`). Los enlaces son `<a href>` de verdad, con recarga
 * completa: el home y las páginas de `PUBLICADOS`, que es la única lista de lo que existe.
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { servicioDe } from '../datos/servicios'
import { HREF_DEL_HOME, PUBLICADOS, hrefDe } from '../rutas'
import type { Servicio } from '../tipos'
import { AbreElContacto } from './Llamado'
import { PanelDeVidrio } from './PanelDeVidrio'

const NOMBRE_DE_LOS_ENLACES = `Más de ${LOGOTIPO}` // C2: provisorio

export function Cierre({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <footer data-bloque="cierre" className="pb-12 pt-3 escritorio:pb-20 escritorio:pt-4">
      <Envoltorio>
        <PanelDeVidrio>
          <div className="flex flex-col gap-8 escritorio:flex-row escritorio:items-end escritorio:justify-between">
            <AbreElContacto servicio={servicio} />
            <nav aria-label={NOMBRE_DE_LOS_ENLACES}>
              <ul role="list" className="flex flex-col gap-3 escritorio:flex-row escritorio:gap-8">
                <li>
                  <a href={HREF_DEL_HOME} className="underline-offset-4 hover:underline">
                    <Cuerpo como="span">{LOGOTIPO}</Cuerpo>
                  </a>
                </li>
                {PUBLICADOS.map((slug) => (
                  <li key={slug}>
                    <a
                      href={hrefDe(slug)}
                      aria-current={slug === servicio.slug ? 'page' : undefined}
                      className="underline-offset-4 hover:underline"
                    >
                      <Cuerpo como="span">{servicioDe(slug).nombre}</Cuerpo>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </PanelDeVidrio>
      </Envoltorio>
    </footer>
  )
}

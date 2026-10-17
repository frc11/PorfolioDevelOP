/**
 * [SERVICIOS S1b] 6 · PROCESO Y PLAZOS — los pasos en orden y el plazo de referencia (SPEC §5: los plazos nunca se prometen).
 *
 * El número de cada paso es el de su lugar en la lista, con el formato del home (`numeroEnLaSecuencia`): no se escribe.
 */

import { numeroEnLaSecuencia } from '../../_secciones/_contrato/acento'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import type { Servicio } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'Proceso y plazos' // C2: provisorio (el nombre de SPEC §5)
const ROTULO_DEL_PLAZO = 'Plazo de referencia' // SPEC §7.1: una referencia, no una promesa

export function Proceso({ proceso }: { readonly proceso: Servicio['proceso'] }): React.JSX.Element {
  return (
    <Bloque nombre="proceso" titulo={TITULO}>
      <ol role="list" className="flex flex-col">
        {proceso.pasos.map((paso, indice) => (
          <li key={paso} className="flex items-baseline gap-6 border-b border-borde py-4">
            <span aria-hidden="true" className="font-codigo text-caption tracking-micro text-acento">
              {numeroEnLaSecuencia(indice + 1)}
            </span>
            <Cuerpo como="span">{paso}</Cuerpo>
          </li>
        ))}
      </ol>
      <p className="mt-8 flex flex-col gap-1">
        <Caption como="span" className="text-tinta-media uppercase">
          {ROTULO_DEL_PLAZO}
        </Caption>{' '}
        <Cuerpo como="span">{proceso.plazo}</Cuerpo>
      </p>
    </Bloque>
  )
}

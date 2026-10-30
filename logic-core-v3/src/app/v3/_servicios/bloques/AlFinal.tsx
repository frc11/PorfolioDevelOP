/**
 * [L7a] LO QUE PASA AL FINAL — dos bloques después de Cómo trabajamos:
 *   · «Qué recibís al final» (`entrega`): la lista de lo que el cliente tiene en la mano al terminar;
 *   · «Después de la entrega» (`despues`): qué pasa después, en párrafos (el soporte, los arreglos, los cambios).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Bloque } from './Bloque'

const TITULO_DE_LA_ENTREGA = 'Qué recibís al final'
const TITULO_DE_DESPUES = 'Después de la entrega'

export function Entrega({ entrega }: { readonly entrega: readonly string[] }): React.JSX.Element | null {
  if (entrega.length === 0) return null
  return (
    <Bloque nombre="entrega" titulo={TITULO_DE_LA_ENTREGA}>
      <ul role="list" className="flex flex-col">
        {entrega.map((item) => (
          <li key={item} className="flex items-start gap-4 border-b border-borde py-4">
            <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 bg-acento" />
            <Cuerpo como="span">{item}</Cuerpo>
          </li>
        ))}
      </ul>
    </Bloque>
  )
}

export function Despues({ despues }: { readonly despues: readonly string[] }): React.JSX.Element | null {
  if (despues.length === 0) return null
  return (
    <Bloque nombre="despues" titulo={TITULO_DE_DESPUES}>
      <div className="flex max-w-[var(--breakpoint-tablet)] flex-col gap-4">
        {despues.map((parrafo) => (
          <Cuerpo key={parrafo}>{parrafo}</Cuerpo>
        ))}
      </div>
    </Bloque>
  )
}

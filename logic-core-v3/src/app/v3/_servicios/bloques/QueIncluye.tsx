/**
 * [SERVICIOS S1b] 3 · QUÉ INCLUYE — la lista, y «va aparte» (SPEC §5). La segunda lista solo existe si los datos traen algo.
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { Bloque } from './Bloque'

const TITULO = 'Qué incluye' // C2: provisorio (el nombre de SPEC §5)
const TITULO_DE_LO_APARTE = 'Va aparte' // SPEC §5: «va aparte»

interface QueIncluyeProps {
  readonly incluye: readonly string[]
  readonly aparte: readonly string[]
}

export function QueIncluye({ incluye, aparte }: QueIncluyeProps): React.JSX.Element {
  return (
    <Bloque nombre="que-incluye" titulo={TITULO}>
      <Filas items={incluye} />
      {aparte.length > 0 ? (
        <div className="mt-12 flex flex-col gap-4">
          <Titular nivel="titulo-s" como="h3">
            {TITULO_DE_LO_APARTE}
          </Titular>
          <Filas items={aparte} />
        </div>
      ) : null}
    </Bloque>
  )
}

function Filas({ items }: { readonly items: readonly string[] }): React.JSX.Element {
  return (
    <ul role="list" className="flex flex-col">
      {items.map((item) => (
        <Cuerpo key={item} como="li" className="border-b border-borde py-4">
          {item}
        </Cuerpo>
      ))}
    </ul>
  )
}

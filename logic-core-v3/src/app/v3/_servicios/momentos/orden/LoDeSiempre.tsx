import { Bloque } from '../../bloques/Bloque'
import { TITULO_DE_LO_DE_SIEMPRE } from './datos'
import { RenglonesTachados } from './RenglonesTachados'

/** [M3] Lo de siempre contra la solución, en el bloque de la página (el título a la izquierda, los renglones a la derecha, quietos: cada renglón lleva su propio avance). */
export function LoDeSiempre(): React.JSX.Element {
  return (
    <Bloque nombre="lo-de-siempre" titulo={TITULO_DE_LO_DE_SIEMPRE} panel="quieto">
      <RenglonesTachados />
    </Bloque>
  )
}

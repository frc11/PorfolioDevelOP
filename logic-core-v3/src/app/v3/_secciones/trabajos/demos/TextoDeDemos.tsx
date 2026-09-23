import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { TEXTO_DE_DEMOS } from './catalogo'

/** La medida del párrafo, en caracteres: la misma del cuerpo del cartel de Portfolio. */
const MEDIDA_DEL_TEXTO_CH = 44

/**
 * EL TÍTULO Y EL PÁRRAFO DE DEMOS — el mismo marcado en las dos ramas.
 *
 * ⚠️ Las dos frases finales van las dos, y el ancho muestra la que vale: arriba
 * de 1025 la demo se abre acá; abajo, en otra pestaña. `s10-acceso` compara el
 * texto anunciado de las dos ramas carácter por carácter, y así es el mismo.
 */
export function TextoDeDemos(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>
      <Titular nivel="titulo-l" como="h3">
        {TEXTO_DE_DEMOS.titulo}
      </Titular>
      <Cuerpo>
        {TEXTO_DE_DEMOS.parrafo} <span className="max-escritorio:hidden">{TEXTO_DE_DEMOS.enEscritorio}</span>{' '}
        <span className="escritorio:hidden">{TEXTO_DE_DEMOS.enMovil}</span>
      </Cuerpo>
    </div>
  )
}

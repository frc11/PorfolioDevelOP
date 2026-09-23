import type { Ref } from 'react'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { CanalDeTitular, CanalDeUnaPieza } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'

import { CLASE_DEL_CUERPO_DE_DEMOS, CLASE_DEL_TITULO_DE_DEMOS } from '../angosto'
import { TEXTO_DE_DEMOS } from './catalogo'

/** La medida del párrafo, en caracteres: la misma del cuerpo del cartel de Portfolio. */
const MEDIDA_DEL_TEXTO_CH = 44

/**
 * EL TÍTULO Y EL PÁRRAFO DE DEMOS — el mismo marcado en las dos ramas.
 *
 * ⚠️ Las dos frases finales van las dos, y el ancho muestra la que vale: arriba
 * de 1025 la demo se abre acá; abajo, en otra pestaña. `s10-acceso` compara el
 * texto anunciado de las dos ramas carácter por carácter, y así es el mismo.
 *
 * Arriba de 1025 llegan con los gestos de la casa y su progreso lo da el vacío
 * (`entrada.ts`): el título renglón por renglón (P1) y el párrafo como el cuerpo
 * de la agencia (P2). Sin progreso —la rama quieta— son texto quieto.
 *
 * ⚠️ P2 sólo DESPLAZA (medio alto propio) y no oculta: en la casa el bloque entra al
 * cuadro desde abajo y eso lo esconde, pero acá la capa está quieta detrás del
 * vacío y el párrafo se veía desde el primer cuadro. Por eso lleva además un
 * fundido, atado al mismo tramo, que escribe `CapaDeDemos` en `refDelParrafo`.
 */
export function TextoDeDemos({
  progresoDelTitulo = null,
  progresoDelParrafo = null,
  refDelParrafo,
}: {
  readonly progresoDelTitulo?: Progreso
  readonly progresoDelParrafo?: Progreso
  readonly refDelParrafo?: Ref<HTMLDivElement>
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>
      <CanalDeTitular progreso={progresoDelTitulo} patron="P1" texto={TEXTO_DE_DEMOS.titulo} nivel="titulo-l" como="h3" className={CLASE_DEL_TITULO_DE_DEMOS} />
      <div ref={refDelParrafo}>
        <CanalDeUnaPieza progreso={progresoDelParrafo} patron="P2">
          <Cuerpo className={CLASE_DEL_CUERPO_DE_DEMOS}>
            {TEXTO_DE_DEMOS.parrafo} <span className="max-escritorio:hidden">{TEXTO_DE_DEMOS.enEscritorio}</span>{' '}
            <span className="escritorio:hidden">{TEXTO_DE_DEMOS.enMovil}</span>
          </Cuerpo>
        </CanalDeUnaPieza>
      </div>
    </div>
  )
}

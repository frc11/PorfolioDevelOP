'use client'

import type { Ref } from 'react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { TEXTO_REEMPLAZADO, useTextoDeVolumen } from '../../../_componentes/titulos3d/useTextoDeVolumen'
import { CanalDeUnaPieza } from '../../_contrato/canales'
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
      <TituloDeDemos progreso={progresoDelTitulo} />
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

/**
 * [CIERRE RETOQUE 3D] D3 · EL TÍTULO DE DEMOS EN VOLUMEN — con el mismo gesto que «El equipo»: se levanta de acostado a
 * parado con el progreso de su llegada (y se acuesta al volver); acostado no se ve. Desde 1024 va en sus dos renglones
 * (cada uno, un título de volumen de una línea: el 3D arma una línea por título) y el DOM se apaga con el título armado
 * (sigue siendo el encabezado para el lector); abajo, el texto corrido de siempre. La llegada del DOM, de una pieza.
 */
function TituloDeDemos({ progreso }: { readonly progreso: Progreso }): React.JSX.Element {
  const [renglon1, renglon2] = TEXTO_DE_DEMOS.renglonesDelTitulo
  const uno = useTextoDeVolumen<HTMLSpanElement>({ id: 'demos-1', texto: renglon1, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })
  const dos = useTextoDeVolumen<HTMLSpanElement>({ id: 'demos-2', texto: renglon2, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })
  return (
    <CanalDeUnaPieza progreso={progreso} patron="P1">
      <Titular nivel="titulo-l" como="h3" className={CLASE_DEL_TITULO_DE_DEMOS}>
        <span ref={uno.lugar} className={cn('escritorio:block', uno.listo && TEXTO_REEMPLAZADO)}>
          {renglon1}
        </span>{' '}
        <span ref={dos.lugar} className={cn('escritorio:block', dos.listo && TEXTO_REEMPLAZADO)}>
          {renglon2}
        </span>
      </Titular>
    </CanalDeUnaPieza>
  )
}

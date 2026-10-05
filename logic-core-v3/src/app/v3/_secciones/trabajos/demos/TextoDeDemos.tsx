'use client'

import type { Ref } from 'react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { TEXTO_REEMPLAZADO, useTextoDeVolumen } from '../../../_componentes/titulos3d/useTextoDeVolumen'
import { useAcompananteDelTitulo } from '../../../_lib/titulos3d/acompanantes'
import { LENTOS } from '../../../_lib/titulos3d/repeticiones'
import { CanalDeUnaPieza, VENTANA_QUE_RECORTA } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'

import { CLASE_DEL_CUERPO_DE_DEMOS, CLASE_DEL_TITULAR_DEL_CARTEL } from '../angosto'
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
 * (`entrada.ts`): el título como el de Portfolio ([EL ENCASTRE] 1B) y el párrafo
 * como el cuerpo de la agencia (P2). Sin progreso —la rama quieta— son texto quieto.
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
  // [NOCTURNO] A1 · el párrafo va en el plano del título de volumen (la cámara lo corre con él).
  const enElPlano = useAcompananteDelTitulo<HTMLDivElement>('demos')
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>
      <TituloDeDemos progreso={progresoDelTitulo} />
      <div ref={enElPlano}>
        <div ref={refDelParrafo}>
          <CanalDeUnaPieza progreso={progresoDelParrafo} patron="P2">
            <Cuerpo className={CLASE_DEL_CUERPO_DE_DEMOS}>
              {TEXTO_DE_DEMOS.parrafo} <span className="max-escritorio:hidden">{TEXTO_DE_DEMOS.enEscritorio}</span>{' '}
              <span className="escritorio:hidden">{TEXTO_DE_DEMOS.enMovil}</span>
            </Cuerpo>
          </CanalDeUnaPieza>
        </div>
      </div>
    </div>
  )
}

/**
 * [EL ENCASTRE] 1B · EL TÍTULO DE DEMOS, COMO EL DE PORTFOLIO — sólo «Demos» (el párrafo ya lo explica), con el mismo
 * nivel y las mismas clases angostas que el titular del cartel, la misma cara en volumen y la misma llegada: las letras
 * desde la profundidad, girando, en no menos de `LENTOS.llegadaDePortfolioS` (y al volver se van igual). Va con la página
 * (la capa está pineada); desde 1024 el DOM se apaga con el título armado y sigue siendo el encabezado para el lector.
 * El DOM llega como el de Portfolio (P2 en su ventana). [CIERRE RETOQUE 3D] D3: antes, dos renglones que se levantaban.
 */
function TituloDeDemos({ progreso }: { readonly progreso: Progreso }): React.JSX.Element {
  const { lugar, listo } = useTextoDeVolumen<HTMLSpanElement>({ id: 'demos', texto: TEXTO_DE_DEMOS.titulo, fuente: 'chivo-400', gesto: 'letras', llegada: progreso, queda: false, minimoS: LENTOS.llegadaDePortfolioS })
  return (
    <div className={VENTANA_QUE_RECORTA}>
      <CanalDeUnaPieza progreso={progreso} patron="P2">
        <Titular nivel="display-xl" como="h3" className={CLASE_DEL_TITULAR_DEL_CARTEL}>
          <span ref={lugar} className={cn('block', listo && TEXTO_REEMPLAZADO)}>
            {TEXTO_DE_DEMOS.titulo}
          </span>
        </Titular>
      </CanalDeUnaPieza>
    </div>
  )
}

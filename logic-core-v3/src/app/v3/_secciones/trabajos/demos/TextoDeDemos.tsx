'use client'

import type { MotionValue } from 'motion/react'
import type { Ref } from 'react'

import { cn } from '@/lib/utils'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { TEXTO_REEMPLAZADO, useTextoDeVolumen } from '../../../_componentes/titulos3d/useTextoDeVolumen'
import { useAcompananteDelTitulo } from '../../../_lib/titulos3d/acompanantes'
import { LENTOS } from '../../../_lib/titulos3d/repeticiones'
import { CanalDeUnaPieza, VENTANA_QUE_RECORTA } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'
import { TitularQueSeLevanta } from '../portfolio/levantarse'

import { CLASE_DEL_TITULAR, MEDIDA_DEL_CUERPO_CH } from '../portfolio/tipografia'

import { CLASE_DEL_CUERPO_DE_DEMOS, CLASE_DEL_TITULAR_DEL_CARTEL } from './herencia'
import { TEXTO_DE_DEMOS } from './catalogo'

/** La medida del párrafo, en caracteres. [C2-41e] La de la bajada del Portfolio (su espejo): era 44, la del cartel de antes. */
const MEDIDA_DEL_TEXTO_CH = MEDIDA_DEL_CUERPO_CH

/**
 * [C2-41e] Desde 1024, Portfolio y Demos son espejos: el título con la medida del de Portfolio (su parte de escritorio: la columna es
 * el contenedor, `CapaDeDemos`) y la bajada con su letra (`titulo-s`). Abajo de 1024, las clases angostas de siempre.
 */
const TITULAR_DEL_PORTFOLIO_EN_ESCRITORIO = CLASE_DEL_TITULAR.split(' ').filter((c) => c.startsWith('escritorio:')).join(' ')
const CUERPO_DEL_PORTFOLIO_EN_ESCRITORIO = 'escritorio:text-[length:var(--text-titulo-s)]'

/**
 * EL TÍTULO Y EL PÁRRAFO DE DEMOS — el mismo marcado en las dos ramas.
 *
 * ⚠️ `s10-acceso` compara el texto anunciado de las dos ramas carácter por carácter:
 * [C2-41e] la bajada nueva es UNA para los dos anchos (antes, una frase final por ancho).
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
  levantarse,
}: {
  readonly progresoDelTitulo?: Progreso
  readonly progresoDelParrafo?: Progreso
  readonly refDelParrafo?: Ref<HTMLDivElement>
  /** [C2-41t] Abajo de 1024: la presencia con la que el titular se levanta (`DemosDelFlujo`). */
  readonly levantarse?: MotionValue<number>
}): React.JSX.Element {
  // [NOCTURNO] A1 · el párrafo va en el plano del título de volumen (la cámara lo corre con él).
  const enElPlano = useAcompananteDelTitulo<HTMLDivElement>('demos')
  return (
    // [PULIDO 10] J8 · `#demos`: el destino del pie («Demos»), con el viaje de siempre (`destinosDelViaje.ts`); el foco llega acá.
    // [C2-41e] La medida va en la bajada (como en el Portfolio), no en el bloque: el título del tamaño del de Portfolio no entra en ella.
    // [C2-41e] Desde 1024, centrado y con la separación del Portfolio entre el título y la bajada (su `mt-6`).
    <div id="demos" className="flex flex-col gap-4 escritorio:items-center escritorio:gap-6">
      <TituloDeDemos progreso={progresoDelTitulo} levantarse={levantarse} />
      <div ref={enElPlano} style={{ maxWidth: `${MEDIDA_DEL_TEXTO_CH}ch` }}>
        <div ref={refDelParrafo}>
          <CanalDeUnaPieza progreso={progresoDelParrafo} patron="P2">
            <Cuerpo className={cn(CLASE_DEL_CUERPO_DE_DEMOS, CUERPO_DEL_PORTFOLIO_EN_ESCRITORIO)}>{TEXTO_DE_DEMOS.parrafo}</Cuerpo>
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
function TituloDeDemos({ progreso, levantarse }: { readonly progreso: Progreso; readonly levantarse?: MotionValue<number> }): React.JSX.Element {
  const { lugar, listo } = useTextoDeVolumen<HTMLSpanElement>({ id: 'demos', texto: TEXTO_DE_DEMOS.titulo, fuente: 'chivo-400', gesto: 'letras', llegada: progreso, queda: false, minimoS: LENTOS.llegadaDePortfolioS })
  const titular = (
    <Titular nivel="display-xl" como="h3" className={cn(CLASE_DEL_TITULAR_DEL_CARTEL, TITULAR_DEL_PORTFOLIO_EN_ESCRITORIO)}>
      <span ref={lugar} className={cn('block', listo && TEXTO_REEMPLAZADO)}>
        {TEXTO_DE_DEMOS.titulo}
      </span>
    </Titular>
  )
  return (
    <div className={VENTANA_QUE_RECORTA}>
      <CanalDeUnaPieza progreso={progreso} patron="P2">
        {/* [C2-41t] Abajo de 1024 (`DemosDelFlujo`) se levanta desde abajo de su ventana, como «Portfolio» en el flujo. */}
        {levantarse === undefined ? titular : <TitularQueSeLevanta presencia={levantarse}>{titular}</TitularQueSeLevanta>}
      </CanalDeUnaPieza>
    </div>
  )
}

'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { CORTE_DIAGONAL_DE_PRUEBA } from '../../_componentes/historias/corteDiagonal'
import { BARRAS_SOBRE_ACENTO, Historias } from '../../_componentes/historias/Historias'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { ATRIBUTO_DE_SERVICIO, CLASES_DE_ACENTO, CLASE_TINTA_SOBRE_ACENTO } from '../../_secciones/_contrato/acento'

import { Ficha } from './Ficha'

/**
 * [P-H31] LAS HISTORIAS FUERA DEL PORTFOLIO — el componente común con tres pasos sobre el acento de web, con lo que servicios pide para su
 * precio en el teléfono: una transición propia entre pasos (un corte diagonal de prueba, `_componentes/historias/corteDiagonal.tsx`: la
 * galería no importa Motion), las barras sobre el acento (`BARRAS_SOBRE_ACENTO`) y el freno del arrastre, que ahora trae el componente:
 * mientras están abiertas, el dedo no mueve la página (ni arrastrando afuera de la caja). Los textos son marcadores de posición.
 */

const PASOS = [{ id: 'paso-1' }, { id: 'paso-2' }, { id: 'paso-3' }] as const

export function GaleriaHistorias(): React.JSX.Element {
  const [abiertas, setAbiertas] = useState(false)
  return (
    <Ficha
      titulo="Historias · tres pasos sobre el acento"
      nota="Tocá a la derecha o a la izquierda para pasar; deslizá hacia arriba o hacia abajo para salir. Mientras están abiertas, el dedo no mueve la página."
    >
      <button type="button" data-pieza="abrir-historias-de-prueba" className="self-start underline" onClick={() => setAbiertas((a) => !a)}>
        {abiertas ? 'Cerrar las historias' : 'Abrir las historias'}
      </button>
      {abiertas ? (
        <div {...{ [ATRIBUTO_DE_SERVICIO]: 'web' }} data-pieza="historias-de-prueba" className={cn('relative aspect-9/16 w-full max-w-sm overflow-hidden', CLASES_DE_ACENTO.relleno)}>
          <Historias
            items={PASOS}
            etiqueta="Historias de prueba"
            rotulos={{ anterior: 'Paso anterior', siguiente: 'Paso siguiente' }}
            alSalir={() => setAbiertas(false)}
            transicion={CORTE_DIAGONAL_DE_PRUEBA}
            colorDeLasBarras={BARRAS_SOBRE_ACENTO}
            renderItem={(_, e) => (
              <div className={cn('flex h-full flex-col justify-end gap-2 p-6', CLASES_DE_ACENTO.relleno, CLASE_TINTA_SOBRE_ACENTO)}>
                <Titular nivel="titulo-m" como="p">{`Paso ${String(e.indice + 1)} de ${String(PASOS.length)}`}</Titular>
                <Cuerpo>Un marcador de posición.</Cuerpo>
              </div>
            )}
          />
        </div>
      ) : null}
    </Ficha>
  )
}

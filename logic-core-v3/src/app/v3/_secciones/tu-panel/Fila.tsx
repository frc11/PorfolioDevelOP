'use client'

import { useId, type CSSProperties } from 'react'

import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { TituloQueSube } from '../_contrato/TituloQueSube'
import type { Tarjeta as DatosDeTarjeta } from './contenido'
import { CLASE_DE_LA_FILA, CLASE_DE_LA_PALABRA, CLASE_DEL_GRUPO, CLASE_DEL_MODULO, CLASE_DEL_TITULO_DEL_MODULO, divisorDeLaPalabraAngosta, type Lado } from './geometria'
import { Tarjeta } from './Tarjeta'

/**
 * UNA FILA DE TU PANEL — [B6] el módulo de su lado y, del lado opuesto, su GRUPO: la palabra fundida (pálida, en la letra
 * del título, decorativa) con el título y la descripción en tinta debajo, los tres en el mismo eje vertical (centrados en
 * su columna), con el pie del grupo al del módulo. Abajo de 1024, apilada: el grupo (la palabra del ancho de la sección,
 * detrás del título; el título en la cara de display) y después el módulo. [C2 60b] Sin las banderas `?grupo=` y
 * `?palabra-movil=`: quedaron `final` y `debajo`.
 *
 * El `<li>` se puede enfocar desde el código: es adonde lleva «Saltar la demo» del módulo anterior.
 */
export interface FilaProps {
  readonly tarjeta: DatosDeTarjeta
  readonly lado: Lado
}

export function Fila({ tarjeta, lado }: FilaProps): React.JSX.Element {
  const idDelTitulo = useId()
  const divisor = { '--divisor-de-esta-palabra': String(divisorDeLaPalabraAngosta(tarjeta.palabra)) } as CSSProperties
  return (
    <li data-pieza="fila-del-panel" data-lado={lado} tabIndex={-1} aria-labelledby={idDelTitulo} className={`focus-visible:outline-2 focus-visible:outline-offset-4 ${CLASE_DE_LA_FILA[lado]}`}>
      <div data-pieza="grupo-del-modulo" className={`@container relative isolate flex flex-col items-center text-center ${CLASE_DEL_GRUPO[lado]}`} style={divisor}>
        <Bloque patron="P2" rango="ventana-visible" className="w-full">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P2" className="w-full">
              <span aria-hidden="true" data-pieza="palabra-fundida" className={`font-display font-fuerte text-tinta leading-cartel tracking-display pointer-events-none block whitespace-nowrap uppercase select-none ${CLASE_DE_LA_PALABRA}`}>
                {tarjeta.palabra}
              </span>
            </CanalDeUnaPieza>
          )}
        </Bloque>
        <TituloQueSube
          id={idDelTitulo}
          titulo={tarjeta.titulo}
          como="h3"
          nivel="titulo-m"
          bajada={tarjeta.descripcion}
          className="flex max-w-[var(--medida-de-la-bajada)] flex-col items-center gap-[var(--spacing-4)]"
          claseDelTitulo={CLASE_DEL_TITULO_DEL_MODULO}
          claseDeLaBajada="text-tinta-media"
        />
      </div>
      <div data-pieza="modulo-del-panel" className={`w-full max-escritorio:mx-auto max-escritorio:max-w-[var(--modulo-maximo-angosto)] ${CLASE_DEL_MODULO[lado]}`}>
        <Tarjeta tarjeta={tarjeta} />
      </div>
    </li>
  )
}

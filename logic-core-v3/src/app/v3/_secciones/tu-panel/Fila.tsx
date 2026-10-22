'use client'

import { useId } from 'react'

import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { TituloQueSube } from '../_contrato/TituloQueSube'
import type { Tarjeta as DatosDeTarjeta } from './contenido'
import { ALFA_DE_LA_PALABRA, CLASE_DE_LA_FILA, CLASE_DE_LA_PALABRA, CLASE_DE_LA_POSICION, CLASE_DEL_GRUPO, CLASE_DEL_MODULO, type Lado, type PalabraEnElTelefono, type PosicionDelGrupo } from './geometria'
import { Tarjeta } from './Tarjeta'

/**
 * UNA FILA DE TU PANEL — [B6] el módulo de su lado y, del lado opuesto, su GRUPO: la palabra fundida (pálida, en la letra
 * del título, decorativa) con el título y la descripción en tinta debajo, los tres en el mismo eje vertical (centrados en
 * su columna). La posición vertical del grupo la elige `?grupo=` (`geometria.ts`). Abajo de 1024, apilada: el grupo (con
 * la palabra mucho más discreta, en la unión o debajo del título según `?palabra-movil=`) y después el módulo.
 *
 * El `<li>` se puede enfocar desde el código: es adonde lleva «Saltar la demo» del módulo anterior.
 */
export interface FilaProps {
  readonly tarjeta: DatosDeTarjeta
  readonly lado: Lado
  readonly grupo: PosicionDelGrupo
  readonly palabra: PalabraEnElTelefono
}

export function Fila({ tarjeta, lado, grupo, palabra }: FilaProps): React.JSX.Element {
  const idDelTitulo = useId()
  return (
    <li data-pieza="fila-del-panel" data-lado={lado} tabIndex={-1} aria-labelledby={idDelTitulo} className={`focus-visible:outline-2 focus-visible:outline-offset-4 ${CLASE_DE_LA_FILA[lado]}`}>
      <div data-pieza="grupo-del-modulo" className={`@container relative isolate flex flex-col items-center text-center ${CLASE_DEL_GRUPO[lado]} ${CLASE_DE_LA_POSICION[grupo]}`}>
        <Bloque patron="P2" rango="ventana-visible" className="w-full">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P2" className="w-full">
              <span aria-hidden="true" data-pieza="palabra-fundida" style={{ opacity: ALFA_DE_LA_PALABRA }} className={`font-display font-fuerte text-tinta leading-cartel tracking-display pointer-events-none block whitespace-nowrap uppercase select-none ${CLASE_DE_LA_PALABRA[palabra]}`}>
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
          claseDeLaBajada="text-tinta-media"
        />
      </div>
      <div data-pieza="modulo-del-panel" className={`w-full max-escritorio:mx-auto max-escritorio:max-w-[var(--modulo-maximo-angosto)] ${CLASE_DEL_MODULO[lado]}`}>
        <Tarjeta tarjeta={tarjeta} />
      </div>
    </li>
  )
}

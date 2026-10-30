/**
 * [SERVICIOS S1b · L7a] QUÉ HACEMOS — el título es del servicio (viene de los datos) y debajo van sus párrafos. [L7a] El texto corto
 * (`queHacemos.texto`) va en la intro, en «de qué se trata»; acá, el servicio contado con más detalle (`detalle`).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import type { Servicio } from '../tipos'
import { Bloque } from './Bloque'

interface QueHacemosProps {
  readonly queHacemos: Servicio['queHacemos']
  readonly detalle: Servicio['detalle']
}

export function QueHacemos({ queHacemos, detalle }: QueHacemosProps): React.JSX.Element {
  return (
    <Bloque nombre="que-hacemos" titulo={queHacemos.titulo}>
      <div className="flex max-w-[var(--breakpoint-tablet)] flex-col gap-4">
        {detalle.map((parrafo) => (
          <Cuerpo key={parrafo}>{parrafo}</Cuerpo>
        ))}
      </div>
    </Bloque>
  )
}

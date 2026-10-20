/**
 * [SERVICIOS M2a · M2b] LO QUE DICE UNA OPCIÓN DEL PRECIO, y su superficie — lo comparten las diagonales (desde 768) y los pasos de las
 * historias (por debajo). Salió de `Diagonales.tsx` en el M2b, sin cambios: lo que se lee sale de la vista pura (`tresOpciones.ts`).
 */

import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import type { OpcionDeTres, VistaDeTresOpciones } from './tresOpciones'

/** Las superficies: la Mediana en el acento del servicio (papel sobre el acento), las otras dos en papel. */
export const SUPERFICIE_DE_LA_OPCION: Readonly<Record<0 | 1 | 2, string>> = { 0: 'bg-fondo text-tinta', 1: 'bg-acento text-fondo', 2: 'bg-fondo text-tinta' }

export function ContenidoDeLaOpcion({ opcion, destacada }: { readonly opcion: OpcionDeTres; readonly destacada: VistaDeTresOpciones['destacada'] }): React.JSX.Element {
  const [descripcion, ...resto] = opcion.lineas
  // Sobre el acento todo va en el papel: la tinta media no pasa ahí (M0 §3.3).
  const secundario = destacada === null ? 'text-tinta-media' : ''
  return (
    <div className="flex flex-col gap-3">
      {destacada === null ? null : (
        <Caption className="self-start border border-current px-2 py-1 uppercase">{destacada.marca}</Caption>
      )}
      <Titular nivel="titulo-s" como="h3">
        {opcion.nombre}
      </Titular>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <Caption como="span" className={secundario}>
          {opcion.rotuloDelPrecio}
        </Caption>{' '}
        <Titular nivel="titulo-m" como="span" className={destacada === null ? 'text-acento' : ''}>
          {opcion.precio}
        </Titular>
      </p>
      {descripcion === undefined ? null : <Cuerpo className={secundario}>{descripcion}</Cuerpo>}
      {destacada === null ? null : <Cuerpo>{destacada.linea}</Cuerpo>}
      {resto.map((linea) => (
        <Caption key={linea} className={`uppercase ${secundario}`}>
          {linea}
        </Caption>
      ))}
    </div>
  )
}

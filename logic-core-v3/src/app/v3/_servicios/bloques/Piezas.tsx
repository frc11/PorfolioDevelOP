/**
 * [L7a] LOS BLOQUES DE PIEZAS — una lista de piezas con nombre y una frase, en la caja de los bloques (`Bloque`). La usan dos bloques:
 *   · «Para qué te sirve» (`ejemplos`): los casos típicos de un negocio chico, en todos los servicios;
 *   · «Lo que podemos construir» (`posibles`): lo honesto en lugar de casos cuando el servicio no tiene trabajos propios publicados
 *     (Software e Integraciones con IA: los trabajos del Portfolio son de web). Vacío, no se monta.
 * Dos columnas desde 1024; en el teléfono y la tablet, apiladas (la tablet se porta como el teléfono).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import type { PiezaConTexto } from '../tipos'
import { Bloque, type NombreDeBloque } from './Bloque'

const TITULO_DE_LOS_EJEMPLOS = 'Para qué te sirve'
const TITULO_DE_LOS_POSIBLES = 'Lo que podemos construir'

function BloqueDePiezas({ nombre, titulo, piezas }: { readonly nombre: NombreDeBloque; readonly titulo: string; readonly piezas: readonly PiezaConTexto[] }): React.JSX.Element | null {
  if (piezas.length === 0) return null
  return (
    <Bloque nombre={nombre} titulo={titulo}>
      <ul role="list" className="grid grid-cols-1 gap-x-8 escritorio:grid-cols-2">
        {piezas.map((pieza) => (
          <li key={pieza.nombre} className="flex flex-col gap-1 border-b border-borde py-4">
            <Cuerpo como="span" peso="semi">
              {pieza.nombre}
            </Cuerpo>
            <Cuerpo como="span" className="text-tinta-media">
              {pieza.texto}
            </Cuerpo>
          </li>
        ))}
      </ul>
    </Bloque>
  )
}

export function Ejemplos({ ejemplos }: { readonly ejemplos: readonly PiezaConTexto[] }): React.JSX.Element | null {
  return <BloqueDePiezas nombre="ejemplos" titulo={TITULO_DE_LOS_EJEMPLOS} piezas={ejemplos} />
}

export function LoQuePodemosConstruir({ posibles }: { readonly posibles: readonly PiezaConTexto[] }): React.JSX.Element | null {
  return <BloqueDePiezas nombre="posibles" titulo={TITULO_DE_LOS_POSIBLES} piezas={posibles} />
}

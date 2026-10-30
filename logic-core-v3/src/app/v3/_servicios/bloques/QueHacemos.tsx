/**
 * [SERVICIOS S1b] 2 · QUÉ HACEMOS — el título es del servicio (viene de los datos) y debajo va el párrafo (SPEC §5).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import type { Servicio } from '../tipos'
import { Bloque } from './Bloque'

export function QueHacemos({ queHacemos }: { readonly queHacemos: Servicio['queHacemos'] }): React.JSX.Element {
  return (
    <Bloque nombre="que-hacemos" titulo={queHacemos.titulo}>
      <Cuerpo className="max-w-[var(--breakpoint-tablet)]">{queHacemos.texto}</Cuerpo>
    </Bloque>
  )
}

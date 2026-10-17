/**
 * [SERVICIOS S1b] EL PANEL DE VIDRIO — la caja que comparten los bloques con contenido: vidrio como el del Portfolio (translúcido,
 * sin fondo propio) que entra con el revelado del bloque entero (P2 del home).
 *
 * El vidrio va ADENTRO del revelado y no al revés: lo que se transforma es el envoltorio, y el panel con `backdrop-filter` queda
 * en su propio nodo. Server: el contenido cruza ya renderizado hacia `Revelado`.
 */

import { cn } from '@/lib/utils'

import { Revelado } from '../movimiento/Revelado'
import { CLASES_DEL_VIDRIO, ESTILO_DEL_VIDRIO } from '../vidrio'

export function PanelDeVidrio({ children, className }: { readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  return (
    <Revelado>
      <div style={ESTILO_DEL_VIDRIO} className={cn(CLASES_DEL_VIDRIO, 'p-6 escritorio:p-8', className)}>
        {children}
      </div>
    </Revelado>
  )
}

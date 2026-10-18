/**
 * [SERVICIOS S1b] EL PANEL DE VIDRIO — la caja que comparten los bloques con contenido: vidrio como el del Portfolio (translúcido,
 * sin fondo propio) que entra con el revelado del bloque entero (P2 del home).
 *
 * El vidrio va ADENTRO del revelado y no al revés: lo que se transforma es el envoltorio, y el panel con `backdrop-filter` queda
 * en su propio nodo. Server: el contenido cruza ya renderizado hacia `Revelado`.
 *
 * [S2b] `quieto`: el panel sin revelado, en su lugar. Es para el panel cuyo alto cambia con lo que hace quien lo mira (el FAQ: una
 * pregunta que se abre lo agranda). El revelado está atado al scroll y se mide sobre la caja del bloque, y el motor del home vuelve
 * a medir cuando cambia el alto del documento: con el panel en la mitad de abajo de la ventana, abrir una pregunta lo corría de 15 a
 * 27 px hacia abajo, en dos saltos, con el clic todavía sobre la pregunta (medido en las tres páginas). Con el panel arriba, o con
 * movimiento reducido, no se movía.
 */

import { cn } from '@/lib/utils'

import { Revelado } from '../movimiento/Revelado'
import { CLASES_DEL_VIDRIO, ESTILO_DEL_VIDRIO } from '../vidrio'

interface PanelDeVidrioProps {
  readonly children: React.ReactNode
  readonly className?: string
  /** El panel no se revela: se queda en su lugar. Solo para el que cambia de alto con el usuario (el FAQ). */
  readonly quieto?: boolean
}

export function PanelDeVidrio({ children, className, quieto = false }: PanelDeVidrioProps): React.JSX.Element {
  const panel = (
    <div style={ESTILO_DEL_VIDRIO} className={cn(CLASES_DEL_VIDRIO, 'p-6 escritorio:p-8', className)}>
      {children}
    </div>
  )
  return quieto ? panel : <Revelado>{panel}</Revelado>
}

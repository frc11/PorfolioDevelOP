'use client'

import type { ReactNode } from 'react'

import { CanalDeUnaPieza } from '../../_secciones/_contrato/canales'
import { Bloque as BloqueMedido } from '../../_secciones/_contrato/coreografia'

/**
 * [SERVICIOS S1b] EL REVELADO DE UN BLOQUE ENTERO — P2 del home («bloque entero»: sube desde media altura propia), atado al scroll
 * y reversible, sobre la ventana visible del bloque.
 *
 * Es el contrato de secciones del home tal cual (`Bloque` + `CanalDeUnaPieza`, con su rama quieta): se IMPORTA, no se toca. Va
 * en un archivo de cliente porque el contrato recibe una función como hijo (`(progreso) => …`) y una función no cruza desde un
 * componente de servidor; el CONTENIDO sí cruza, ya renderizado (`children`), así que los bloques de la página siguen siendo de
 * servidor. Sin coreografía (SSR, abajo de 1025, movimiento reducido) el contenido sale pelado y en su lugar.
 *
 * El elemento que se MIDE (el `div` de `Bloque`) nunca se transforma: lo que sube es su hijo.
 */
export function Revelado({ children, className }: { readonly children: ReactNode; readonly className?: string }): React.JSX.Element {
  return (
    <BloqueMedido patron="P2" rango="ventana-visible" className={className ?? 'block w-full'}>
      {(progreso) => (
        <CanalDeUnaPieza progreso={progreso} patron="P2" className="block">
          {children}
        </CanalDeUnaPieza>
      )}
    </BloqueMedido>
  )
}

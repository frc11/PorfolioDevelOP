'use client'

import { Cta } from '../../_componentes/chrome/Cta'
import type { Servicio } from '../_contrato/acento'
import { CTA_POR_SERVICIO } from './contenido'

/** El CTA al terminar cada servicio, con su acento. Sólo abajo de 1024: arriba rota uno solo. */
export function CtaDelServicio({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    // El acento lo hereda del bloque, que es el `[data-servicio]`: acá no va otro.
    <div
      data-pieza="cta-del-servicio"
      style={{ color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}
      className="escritorio:hidden"
    >
      <Cta rotulo={CTA_POR_SERVICIO[servicio.id]} />
    </div>
  )
}

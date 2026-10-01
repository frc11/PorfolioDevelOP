'use client'

import { Cta } from '../../_componentes/chrome/Cta'
import type { Servicio } from '../_contrato/acento'
import { CTA_POR_SERVICIO } from './contenido'

/** El CTA al terminar cada servicio, con su acento. Sólo abajo de 1024: arriba rota uno solo. */
/**
 * [INTERFAZ 1] T3 · `enEscritorio`: en la rama apilada (abajo de 1024, y con menos movimiento en CUALQUIER ancho) éste
 * es el único CTA de cada servicio. Con `escritorio:hidden` fijo, en escritorio con menos movimiento la sección se
 * quedaba sin ningún CTA (el que rota sólo existe en la rama animada). La tira lo sigue escondiendo en escritorio.
 */
export function CtaDelServicio({ servicio, enEscritorio = false }: { readonly servicio: Servicio; readonly enEscritorio?: boolean }): React.JSX.Element {
  return (
    // El acento lo hereda del bloque, que es el `[data-servicio]`: acá no va otro.
    <div
      data-pieza="cta-del-servicio"
      // CONTACTO: abre el formulario con el servicio precargado.
      data-abre-contacto=""
      data-precarga={servicio.id}
      style={{ color: 'var(--color-acento)', ['--color-tinta' as string]: 'var(--color-acento)' }}
      className={enEscritorio ? undefined : 'escritorio:hidden'}
    >
      <Cta rotulo={CTA_POR_SERVICIO[servicio.id]} />
    </div>
  )
}

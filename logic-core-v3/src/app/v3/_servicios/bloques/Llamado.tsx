/**
 * [SERVICIOS S1b · M1 · L7a] EL CTA DEL PRECIO — el botón de debajo del precio. Abre el modal de contacto (SPEC §5). [L7a] El llamado del
 * final se fue: el cierre común (`CierreDeLaPagina`) trae su CTA, con el servicio de la página precargado.
 *
 * `AbreElContacto` es el envoltorio de apertura, igual que `CtaDelServicio` en el home: `Cta` no deja pasar atributos, así que
 * el atributo va en un `<div>` y el listener del chrome (`Contacto`) lo encuentra con `closest`. Lleva SOLO dos atributos
 * (P-S1): `data-abre-contacto="panel"` y `data-precarga` con el id del servicio en el home, que marca su interés en el
 * formulario. `data-servicio` no va: es el contexto del acento del tema.
 *
 * [M1] Entra con el GATILLO (la tabla del M0): entero al cruzar la línea, en espejo al volver a subir. Debajo del precio, SOLO el botón
 * (D3): sin título y sin texto, en la columna del contenido.
 */

import { Cta } from '../../_componentes/chrome/Cta'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { ESTILO_DEL_CTA } from '../estiloDelAcento'
import type { Servicio } from '../tipos'
import { CLASES_DEL_PAPEL, CLASES_DE_LA_COLUMNA_DEL_PANEL } from './Bloque'

export function AbreElContacto({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    // `-ml-2`: el botón del home tiene 8 px de padding, y sin esto su rótulo queda corrido respecto del texto de arriba.
    <div data-abre-contacto="panel" data-precarga={servicio.idEnElHome} style={ESTILO_DEL_CTA} className="-ml-2 self-start">
      <Cta rotulo={servicio.cta.boton} />
    </div>
  )
}

/** 4 · El CTA de debajo del precio: el botón solo, alineado con la columna del contenido del precio. */
export function LlamadoDelPrecio({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    <section data-bloque="llamado-del-precio" className={`${CLASES_DEL_PAPEL} pt-12 escritorio:pt-16`}>
      <Envoltorio>
        <div className="flex flex-col escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <div className={`${CLASES_DE_LA_COLUMNA_DEL_PANEL} escritorio:col-start-5`}>
            <Gatillo>
              {/* En columna, como en el llamado: así el envoltorio de apertura mide lo que el botón (`self-start`) y no la fila entera. */}
              <div className="flex flex-col">
                <AbreElContacto servicio={servicio} />
              </div>
            </Gatillo>
          </div>
        </div>
      </Envoltorio>
    </section>
  )
}

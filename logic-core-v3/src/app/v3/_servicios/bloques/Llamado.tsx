/**
 * [SERVICIOS S1b · M1] LOS DOS CTA — el llamado y el botón de debajo del precio. Los dos abren el modal de contacto (SPEC §5).
 *
 * `AbreElContacto` es el envoltorio de apertura, igual que `CtaDelServicio` en el home: `Cta` no deja pasar atributos, así que
 * el atributo va en un `<div>` y el listener del chrome (`Contacto`) lo encuentra con `closest`. Lleva SOLO dos atributos
 * (P-S1): `data-abre-contacto="panel"` y `data-precarga` con el id del servicio en el home, que marca su interés en el
 * formulario. `data-servicio` no va: es el contexto del acento del tema.
 *
 * Lo comparten el llamado, el CTA del precio y el cierre provisorio, para que los tres abran el contacto con la misma precarga.
 *
 * [M1] Los dos CTA entran con el GATILLO (la tabla del M0): enteros al cruzar la línea, en espejo al volver a subir.
 *   · `LlamadoDelPrecio`: debajo del precio, SOLO el botón (D3): sin título y sin texto, en la columna del contenido.
 *   · `Llamado`: el bloque con su título, su texto (si hay) y el botón.
 */

import { Cta } from '../../_componentes/chrome/Cta'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { ESTILO_DEL_CTA } from '../estiloDelAcento'
import { Gatillo } from '../movimiento/Gatillo'
import type { Servicio } from '../tipos'
import { Bloque, CLASES_DEL_PAPEL, CLASES_DE_LA_COLUMNA_DEL_PANEL } from './Bloque'

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

/** 9 · El llamado: el título del CTA, su texto y el botón. */
export function Llamado({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  const { cta } = servicio
  return (
    <Bloque nombre="llamado" titulo={cta.titulo} panel="gatillo">
      <div className="flex flex-col gap-6">
        {cta.texto === null ? null : <Cuerpo className="max-w-[var(--breakpoint-tablet)]">{cta.texto}</Cuerpo>}
        <AbreElContacto servicio={servicio} />
      </div>
    </Bloque>
  )
}

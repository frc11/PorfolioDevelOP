/**
 * [SERVICIOS S1b] 9 · CTA — el llamado que abre el modal de contacto (SPEC §5).
 *
 * `AbreElContacto` es el envoltorio de apertura, igual que `CtaDelServicio` en el home: `Cta` no deja pasar atributos, así que
 * el atributo va en un `<div>` y el listener del chrome (`Contacto`) lo encuentra con `closest`. Lleva SOLO dos atributos
 * (P-S1): `data-abre-contacto="panel"` y `data-precarga` con el id del servicio en el home, que marca su interés en el
 * formulario. `data-servicio` no va: es el contexto del acento del tema.
 *
 * Lo comparten este bloque y el cierre provisorio, para que los dos abran el contacto con la misma precarga.
 */

import { Cta } from '../../_componentes/chrome/Cta'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { ESTILO_DEL_CTA } from '../estiloDelAcento'
import type { Servicio } from '../tipos'
import { Bloque } from './Bloque'

export function AbreElContacto({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  return (
    // `-ml-2`: el botón del home tiene 8 px de padding, y sin esto su rótulo queda corrido respecto del texto de arriba.
    <div data-abre-contacto="panel" data-precarga={servicio.idEnElHome} style={ESTILO_DEL_CTA} className="-ml-2 self-start">
      <Cta rotulo={servicio.cta.boton} />
    </div>
  )
}

export function Llamado({ servicio }: { readonly servicio: Servicio }): React.JSX.Element {
  const { cta } = servicio
  return (
    <Bloque nombre="llamado" titulo={cta.titulo}>
      <div className="flex flex-col gap-6">
        {cta.texto === null ? null : <Cuerpo className="max-w-[var(--breakpoint-tablet)]">{cta.texto}</Cuerpo>}
        <AbreElContacto servicio={servicio} />
      </div>
    </Bloque>
  )
}

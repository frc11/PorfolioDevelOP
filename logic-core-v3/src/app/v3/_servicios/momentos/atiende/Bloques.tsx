import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Bloque } from '../../bloques/Bloque'
import { ChatQueAtiende } from './ChatQueAtiende'
import { TEXTOS_DE_AUTOMATIZACIONES, TEXTOS_DEL_CHAT, TITULO_DE_AUTOMATIZACIONES, TITULO_DEL_CHAT } from './datos'
import { PasaSolo } from './PasaSolo'

/** [M3] El chat, del lado del cliente: dos párrafos y la ventana, en el bloque de la página (quieto: el chat se mueve solo). */
export function ElChat(): React.JSX.Element {
  return (
    <Bloque nombre="el-chat" titulo={TITULO_DEL_CHAT} panel="quieto">
      <div className="flex flex-col gap-8 escritorio:grid escritorio:grid-cols-8 escritorio:items-start escritorio:gap-x-[var(--grilla-canal-amplio)]">
        <div className="flex flex-col gap-4 escritorio:col-span-3">
          {TEXTOS_DEL_CHAT.map((p) => (
            <Cuerpo key={p}>{p}</Cuerpo>
          ))}
        </div>
        <div className="escritorio:col-span-5">
          <ChatQueAtiende />
        </div>
      </div>
    </Bloque>
  )
}

/** [M3] El módulo de automatizaciones: qué se automatiza y qué gana un negocio chico, y la lista que se tilda sola. */
export function Automatizaciones(): React.JSX.Element {
  return (
    <Bloque nombre="automatizaciones" titulo={TITULO_DE_AUTOMATIZACIONES} panel="quieto">
      <div className="flex flex-col gap-10">
        <div className="flex max-w-[var(--breakpoint-tablet)] flex-col gap-4">
          {TEXTOS_DE_AUTOMATIZACIONES.map((p) => (
            <Cuerpo key={p}>{p}</Cuerpo>
          ))}
        </div>
        <PasaSolo />
      </div>
    </Bloque>
  )
}

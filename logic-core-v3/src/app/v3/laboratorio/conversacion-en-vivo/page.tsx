import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { ConversacionEnVivo } from './ConversacionEnVivo'

export const metadata: Metadata = {
  title: 'Laboratorio · la conversación que pasa sola',
  description: 'Prototipo del chatbot en vivo para la página de Integraciones con IA. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="conversacion-en-vivo">
      <ConversacionEnVivo />
    </Papel>
  )
}

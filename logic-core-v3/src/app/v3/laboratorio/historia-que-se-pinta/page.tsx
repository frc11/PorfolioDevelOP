import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { HistoriaQueSePinta } from './HistoriaQueSePinta'

export const metadata: Metadata = {
  title: 'Laboratorio · la historia que se pinta',
  description: 'Prototipo de la historia para la página Nosotros. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="historia-que-se-pinta">
      <HistoriaQueSePinta />
    </Papel>
  )
}

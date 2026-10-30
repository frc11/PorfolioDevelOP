import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { FichasAbiertas } from './FichasAbiertas'

export const metadata: Metadata = {
  title: 'Laboratorio · fichas abiertas',
  description: 'Prototipo de los casos para la página Portfolio. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="fichas-abiertas">
      <FichasAbiertas />
    </Papel>
  )
}

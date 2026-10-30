import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { NoEncaja } from './NoEncaja'

export const metadata: Metadata = {
  title: 'Laboratorio · el logo que no encaja',
  description: 'Prototipo de la 404 de develOP. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="no-encaja">
      <NoEncaja />
    </Papel>
  )
}

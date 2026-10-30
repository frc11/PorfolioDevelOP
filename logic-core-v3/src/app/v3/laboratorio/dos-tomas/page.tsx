import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { DosTomas } from './DosTomas'

export const metadata: Metadata = {
  title: 'Laboratorio · dos tomas, dos personas',
  description: 'Prototipo del equipo para la página Nosotros. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="dos-tomas">
      <DosTomas />
    </Papel>
  )
}

import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { LoDeSiempreTachado } from './LoDeSiempreTachado'

export const metadata: Metadata = {
  title: 'Laboratorio · lo de siempre, tachado',
  description: 'Prototipo para la página de Software a medida. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="lo-de-siempre-tachado">
      <LoDeSiempreTachado />
    </Papel>
  )
}

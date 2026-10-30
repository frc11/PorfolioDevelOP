import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { IntroDeDia } from './IntroDeDia'

export const metadata: Metadata = {
  title: 'Laboratorio · la intro corta de día',
  description: 'Prototipo de la intro de Nosotros, Portfolio y Blog sobre la escena de día. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="intro-de-dia" fondo="escena">
      <IntroDeDia />
    </Papel>
  )
}

import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { DemosEnConjunto } from './DemosEnConjunto'

export const metadata: Metadata = {
  title: 'Laboratorio · las demos en conjunto',
  description: 'Prototipo de las demos para la página Portfolio. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="demos-en-conjunto">
      <DemosEnConjunto />
    </Papel>
  )
}

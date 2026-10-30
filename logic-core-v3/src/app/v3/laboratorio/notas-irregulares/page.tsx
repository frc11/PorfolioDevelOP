import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { NotasIrregulares } from './NotasIrregulares'

export const metadata: Metadata = {
  title: 'Laboratorio · las notas en lugares irregulares',
  description: 'Prototipo de la lista de notas para la página Blog. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="notas-irregulares">
      <NotasIrregulares />
    </Papel>
  )
}

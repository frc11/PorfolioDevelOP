import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { IndiceLegal } from './IndiceLegal'

export const metadata: Metadata = {
  title: 'Laboratorio · el índice legal',
  description: 'Prototipo del índice de las páginas legales. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="indice-legal">
      <IndiceLegal />
    </Papel>
  )
}

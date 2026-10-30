import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { Nota } from './Nota'

export const metadata: Metadata = {
  title: 'Laboratorio · la nota con su hilo',
  description: 'Prototipo de la página de una nota del blog. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="nota">
      <Nota />
    </Papel>
  )
}

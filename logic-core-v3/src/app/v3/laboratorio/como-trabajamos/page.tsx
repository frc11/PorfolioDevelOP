import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { ComoTrabajamos } from './ComoTrabajamos'

export const metadata: Metadata = {
  title: 'Laboratorio · cómo trabajamos',
  description: 'Prototipo del proceso para la página Nosotros. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="como-trabajamos">
      <ComoTrabajamos />
    </Papel>
  )
}

import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { PasaSolo } from './PasaSolo'

export const metadata: Metadata = {
  title: 'Laboratorio · pasa solo',
  description: 'Prototipo de las automatizaciones para la página de Integraciones con IA. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="pasa-solo">
      <PasaSolo />
    </Papel>
  )
}

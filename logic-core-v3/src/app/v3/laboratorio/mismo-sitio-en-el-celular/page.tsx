import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { MismoSitioEnElCelular } from './MismoSitioEnElCelular'

export const metadata: Metadata = {
  title: 'Laboratorio · el mismo sitio en el celular',
  description: 'Prototipo para la página de Desarrollo web. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="mismo-sitio-en-el-celular">
      <MismoSitioEnElCelular />
    </Papel>
  )
}

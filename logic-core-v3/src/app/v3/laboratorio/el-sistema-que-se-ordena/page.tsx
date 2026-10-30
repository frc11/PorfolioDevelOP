import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { ElSistemaQueSeOrdena } from './ElSistemaQueSeOrdena'

export const metadata: Metadata = {
  title: 'Laboratorio · el sistema que se ordena',
  description: 'Prototipo para la página de Software a medida. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="el-sistema-que-se-ordena">
      <ElSistemaQueSeOrdena />
    </Papel>
  )
}

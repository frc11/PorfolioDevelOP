import type { Metadata } from 'next'

import { Papel } from '../_lab/Papel'
import { CarruselDelBlog } from './CarruselDelBlog'

export const metadata: Metadata = {
  title: 'Laboratorio · el carrusel del blog',
  description: 'Prototipo de las notas destacadas para la página Blog. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function Pagina(): React.JSX.Element {
  return (
    <Papel slug="carrusel-del-blog">
      <CarruselDelBlog />
    </Papel>
  )
}

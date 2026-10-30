import type { Metadata } from 'next'

import { PaginaLegal } from '../_componentes/pagina/PaginaLegal'

import { TEXTO_DE_TERMINOS } from './contenido'

/** [L7d] /v3/terminos — sin escena: intro plana, texto con índice y el pie. */
export const metadata: Metadata = {
  title: 'Términos | develOP',
  description: 'Los términos de uso del sitio de develOP: cómo usarlo, qué contenidos son nuestros y qué esperar de nuestros servicios.',
  alternates: { canonical: '/v3/terminos' },
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'develOP', title: 'Términos | develOP', description: 'Los términos de uso del sitio de develOP: cómo usarlo, qué contenidos son nuestros y qué esperar de nuestros servicios.', url: '/v3/terminos' },
}

export default function Terminos(): React.JSX.Element {
  return <PaginaLegal texto={TEXTO_DE_TERMINOS} />
}

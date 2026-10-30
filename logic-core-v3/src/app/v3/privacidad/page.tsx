import type { Metadata } from 'next'

import { PaginaLegal } from '../_componentes/pagina/PaginaLegal'

import { TEXTO_DE_PRIVACIDAD } from './contenido'

/** [L7d] /v3/privacidad — sin escena: intro plana, texto con índice y el pie. */
export const metadata: Metadata = {
  title: 'Privacidad | develOP',
  description: 'Qué datos recolectamos en develOP, para qué los usamos y cómo podés pedirnos acceder a ellos, corregirlos o eliminarlos.',
  alternates: { canonical: '/v3/privacidad' },
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'develOP', title: 'Privacidad | develOP', description: 'Qué datos recolectamos en develOP, para qué los usamos y cómo podés pedirnos acceder a ellos, corregirlos o eliminarlos.', url: '/v3/privacidad' },
}

export default function Privacidad(): React.JSX.Element {
  return <PaginaLegal texto={TEXTO_DE_PRIVACIDAD} />
}

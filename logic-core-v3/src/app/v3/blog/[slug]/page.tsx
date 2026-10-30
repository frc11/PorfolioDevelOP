import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CierreDeLaPagina } from '../../_componentes/pagina/cierre/CierreDeLaPagina'
import { IntroDeLaPagina, ParrafoDeLaBajada } from '../../_componentes/pagina/IntroDeLaPagina'
import { PREGUNTAS_DEL_HOME } from '../../_secciones/cierre/faq'

import { NOTAS, fechaLarga, notaPorSlug } from '../_notas/indice'
import { PRESET } from '../preset'

import { CuerpoDeLaNota } from './CuerpoDeLaNota'

/** [L7c] /v3/blog/[slug] — una nota. Estática (`generateStaticParams`): las seis notas se arman en el build; una ruta que no existe es 404. */
export const dynamicParams = false

export function generateStaticParams(): { slug: string }[] {
  return NOTAS.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const nota = notaPorSlug((await params).slug)
  if (nota === undefined) return {}
  return {
    title: `${nota.titulo} | Blog develOP`,
    description: nota.resumen,
    openGraph: { type: 'article', title: nota.titulo, description: nota.resumen, publishedTime: nota.fecha, locale: 'es_AR', siteName: 'develOP' },
  }
}

export default async function NotaDelBlog({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const nota = notaPorSlug((await params).slug)
  if (nota === undefined) notFound()
  return (
    <main className="relative z-10">
      <IntroDeLaPagina titulo="Blog" preset={PRESET} bajada={<ParrafoDeLaBajada>{`Una nota del ${fechaLarga(nota.fecha)}.`}</ParrafoDeLaBajada>} />
      <CuerpoDeLaNota nota={nota} />
      <CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DEL_HOME} />
    </main>
  )
}

import type { Metadata } from 'next'

import { CierreDeLaPagina } from '../_componentes/pagina/cierre/CierreDeLaPagina'
import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { PREGUNTAS_DEL_HOME } from '../_secciones/cierre/faq'

import { CuerpoDelBlog } from './CuerpoDelBlog'
import { PRESET } from './preset'

/** [L7c] /v3/blog — de día. La intro con la escena, el cuerpo en papel (carrusel y notas) y el cierre con las preguntas generales de develOP. */
export const metadata: Metadata = {
  title: 'Blog | develOP',
  description: 'Guías cortas y concretas para dueños de negocios: páginas web, chatbots con IA, automatizaciones y software a medida, explicadas sin tecnicismos.',
  alternates: { canonical: '/v3/blog' },
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'develOP', title: 'Blog | develOP', description: 'Guías cortas y concretas para dueños de negocios: páginas web, chatbots con IA, automatizaciones y software a medida, explicadas sin tecnicismos.', url: '/v3/blog' },
}

export default function Blog(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo="Blog"
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>Notas cortas y concretas para que tomes mejores decisiones sobre la tecnología de tu negocio.</ParrafoDeLaBajada>}
        deQueSeTrata={
          <>
            <EtiquetaDeSeccion sangria={false}>De qué se trata</EtiquetaDeSeccion>
            <Cuerpo>Escribimos sobre páginas web, inteligencia artificial, automatizaciones y software, en un lenguaje que se entiende.</Cuerpo>
          </>
        }
      />
      <CuerpoDelBlog />
      <CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DEL_HOME} />
    </main>
  )
}

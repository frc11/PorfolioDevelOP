import type { Metadata } from 'next'

import { CierreDeLaPagina } from '../_componentes/pagina/cierre/CierreDeLaPagina'
import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'

import { INTRO_DEL_PORTFOLIO, PREGUNTAS_DEL_PORTFOLIO } from './contenido'
import { CuerpoDelPortfolio } from './CuerpoDelPortfolio'
import { PRESET } from './preset'

/** [L7b] /v3/portfolio — de día. La intro con la escena, el cuerpo en papel (casos, demos, testimonios) y el cierre de la página. */
export const metadata: Metadata = {
  title: 'Portfolio | develOP',
  description: 'Los sitios que hicimos para negocios reales, explicados de principio a fin, y las demos que armamos de ejemplo para distintos rubros.',
  alternates: { canonical: '/v3/portfolio' },
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'develOP', title: 'Portfolio | develOP', description: 'Los sitios que hicimos para negocios reales, explicados de principio a fin, y las demos que armamos de ejemplo para distintos rubros.', url: '/v3/portfolio' },
}

export default function Portfolio(): React.JSX.Element {
  return (
    // [M1] Como el home: lo que entra de costado o un carrusel a medio pasar no ensancha el documento (390: +32 px).
    <main className="relative z-10 overflow-x-clip">
      <IntroDeLaPagina
        titulo="Portfolio"
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>{INTRO_DEL_PORTFOLIO.bajada}</ParrafoDeLaBajada>}
        deQueSeTrata={
          <>
            <EtiquetaDeSeccion sangria={false}>{INTRO_DEL_PORTFOLIO.etiqueta}</EtiquetaDeSeccion>
            <Cuerpo>{INTRO_DEL_PORTFOLIO.deQueSeTrata}</Cuerpo>
          </>
        }
      />
      <CuerpoDelPortfolio />
      <CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DEL_PORTFOLIO} />
    </main>
  )
}

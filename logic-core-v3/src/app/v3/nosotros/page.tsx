import type { Metadata } from 'next'

import { CierreDeLaPagina } from '../_componentes/pagina/cierre/CierreDeLaPagina'
import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'

import { CuerpoDeNosotros } from './CuerpoDeNosotros'
import { INTRO_DE_NOSOTROS, PREGUNTAS_DE_NOSOTROS } from './contenido'
import { PRESET } from './preset'

/** [L7b] /v3/nosotros — de día. La intro con la escena, el cuerpo en papel y el cierre de la página (Seis razones, CTA, pie y su FAQ). */
export const metadata: Metadata = {
  title: 'Nosotros | develOP',
  description: 'Somos Franco y Valentino, dos amigos de Tucumán que hacemos sitios web, software y automatizaciones. Conocé nuestra historia, cómo trabajamos y lo que nos importa.',
  alternates: { canonical: '/v3/nosotros' },
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'develOP', title: 'Nosotros | develOP', description: 'Somos Franco y Valentino, dos amigos de Tucumán que hacemos sitios web, software y automatizaciones. Conocé nuestra historia, cómo trabajamos y lo que nos importa.', url: '/v3/nosotros' },
}

export default function Nosotros(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo="Nosotros"
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>{INTRO_DE_NOSOTROS.bajada}</ParrafoDeLaBajada>}
        deQueSeTrata={
          <>
            <EtiquetaDeSeccion sangria={false}>{INTRO_DE_NOSOTROS.etiqueta}</EtiquetaDeSeccion>
            {INTRO_DE_NOSOTROS.deQueSeTrata.map((p) => (
              <Cuerpo key={p}>{p}</Cuerpo>
            ))}
          </>
        }
      />
      <CuerpoDeNosotros />
      <CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DE_NOSOTROS} />
    </main>
  )
}

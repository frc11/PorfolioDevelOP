import type { Metadata } from 'next'

import { CierreDeLaPagina } from '../_componentes/pagina/cierre/CierreDeLaPagina'
import { IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, EtiquetaDeSeccion } from '../_componentes/tipografia/Textos'
import { conLlave } from '../_secciones/_contrato/inventado'

import { CuerpoDeLaBase } from './CuerpoDeLaBase'
import { PREGUNTAS_DE_LA_BASE } from './faq'
import { PRESET } from './preset'
import { RELLENO_DE_LA_BASE } from './relleno'

/**
 * ⚠️ MAQUETA, NO PANTALLA DEL SITIO. [B12a.8] LA PÁGINA BASE — la maqueta de una página de `/v3` que se traspasa a servicios (era la ruta
 * de prueba de la intro, `/v3/prueba-de-pagina`, de B12a.2). Es lo mínimo que una página arma con las piezas del home: la intro sobre la
 * escena (el título 3D, la bajada y «de qué se trata»), el cuerpo en papel con tres secciones de ejemplo (`CuerpoDeLaBase`), [B13] el cierre
 * (`CierreDeLaPagina`) y la ranura con una variante de ejemplo. Cómo se arma, paso a paso: `docs/rediseno/B12a-API.md` §7 y §8. Sin indexar. Estática: sin leer la
 * URL en el servidor (el bfcache la guarda, P-H35; `?nombre=` y `?navbar=` se leen en el cliente).
 */
export const metadata: Metadata = {
  title: 'v3 · página base — maqueta interna',
  description: 'La maqueta base de una página de /v3. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

// El preset, armado una vez (el mismo objeto en cada render), vive en `preset.ts`: [B12b] lo lee también el viaje del CTA de un servicio.

export default function PaginaBase(): React.JSX.Element {
  return (
    <main className="relative z-10 overflow-x-clip">
      <IntroDeLaPagina
        titulo="Páginas web"
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>{conLlave(RELLENO_DE_LA_BASE.bajada)}</ParrafoDeLaBajada>}
        deQueSeTrata={
          <>
            <EtiquetaDeSeccion sangria={false}>De qué se trata</EtiquetaDeSeccion>
            <Cuerpo>{conLlave(RELLENO_DE_LA_BASE.deQueSeTrata)}</Cuerpo>
          </>
        }
      />
      <CuerpoDeLaBase />
      {/* [B13] El cierre de la página: Seis razones → el CTA (con el servicio de la página) → la resolución → el pie, con la escena; [B10] y el FAQ, con las preguntas de la página. */}
      <CierreDeLaPagina preset={PRESET} preguntas={PREGUNTAS_DE_LA_BASE} />
    </main>
  )
}

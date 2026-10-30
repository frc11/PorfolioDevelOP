import type { Metadata } from 'next'

import { Envoltorio } from './_componentes/layout/Envoltorio'
import { EnlaceDeRuta } from './_componentes/navegacion/EnlaceDeRuta'
import { SELECTOR_DE_LA_INTRO, ATRIBUTO_DE_LA_INTRO_DE_PAGINA } from './_componentes/pagina/atributoDeLaIntro'
import { Cuerpo } from './_componentes/tipografia/Textos'
import { Titular } from './_componentes/tipografia/Titular'
import { PresetDeLaPagina } from './_lib/escena/ruta/PresetDeLaPagina'
import { PISTA_DE_LA_INTRO } from './_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from './_lib/escena/ruta/preset'

/**
 * [L7d · 2] LA 404 DE /v3 — con la escena de día: «Esta página no existe, pero tu proyecto sí puede.» y un botón al home. Es el `not-found` del
 * segmento `/v3` (lo usa también `notFound()` de una nota que no existe) y `[...resto]/page.tsx` manda acá cualquier `/v3/...` desconocido, con
 * estado 404. El `not-found.tsx` raíz (`src/app/not-found.tsx`, el del sitio en vivo) no se toca.
 */
export const metadata: Metadata = {
  title: 'Página no encontrada | develOP',
  robots: { index: false, follow: false },
}

const PRESET: PresetDeLaEscena = {
  id: 'no-encontrada',
  tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null },
  pista: PISTA_DE_LA_INTRO,
  noche: 'dia',
  acento: null,
  variante: null,
}

export default function NoEncontrada(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <section {...{ [ATRIBUTO_DE_LA_INTRO_DE_PAGINA]: PRESET.id }} className="relative flex min-h-svh items-center text-tinta max-escritorio:items-end max-escritorio:pb-[var(--spacing-20)]">
        <PresetDeLaPagina preset={PRESET} />
        <Envoltorio className="w-full">
          {/* [L7g] La caja termina a 4,5 rem del logo (su medio ancho: 0,277 del alto, tope 0,175 del ancho): a 1440 lo rozaba y a 1920 lo pisaba 59 px. */}
          <div data-parte="bajada" className="flex max-w-[34rem] flex-col items-start gap-[var(--spacing-5)] escritorio:max-w-[max(16rem,calc(50vw-min(28vh,17.5vw)-4.5rem))]">
            <Titular nivel="titulo-l" como="h1" className="[text-shadow:var(--sombra-de-la-intro)]">
              Esta página no existe, pero tu proyecto sí puede.
            </Titular>
            <Cuerpo>No encontramos lo que buscabas. Volvé al inicio y contanos qué necesitás.</Cuerpo>
            <EnlaceDeRuta href="/v3" className="inline-flex items-center rounded-[var(--radius-pastilla-s)] bg-tinta px-[var(--spacing-6)] py-[var(--spacing-3)] text-cuerpo font-semi text-fondo">
              Volver al inicio
            </EnlaceDeRuta>
          </div>
        </Envoltorio>
      </section>
    </main>
  )
}

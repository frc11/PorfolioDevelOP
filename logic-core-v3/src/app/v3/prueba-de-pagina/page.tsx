import type { Metadata } from 'next'

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { PISTA_DE_LA_INTRO } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. [B12a.2] La página de prueba de la intro (plan `docs/rediseno/SPRINT-B12a.md` §10): la intro de 1,5
 * pantallas sobre la escena, de noche, y el cuerpo en papel, con la pista de la intro (la pose elegida: girar). SE BORRA cuando exista
 * la primera página de servicio con su intro (B12a la adopta: §1.9).
 */
export const metadata: Metadata = {
  title: 'v3 · prueba de la intro — instrumento interno',
  description: 'La intro de una página sobre la escena. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

/** El preset, armado una vez: el mismo objeto en cada render (la escena arma la pista una vez por preset). */
const PRESET: PresetDeLaEscena = {
  id: 'prueba',
  tramos: { intro: `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, pie: null },
  pista: PISTA_DE_LA_INTRO,
  noche: 'noche',
  acento: null,
}

export default function PruebaDePagina(): React.JSX.Element {
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo="Prueba de la intro"
        preset={PRESET}
        bajada={<ParrafoDeLaBajada>Scrolleá la intro (1,5 pantallas) y volvé: la cámara va de la composición inicial a la pose de la intro.</ParrafoDeLaBajada>}
      />
      <Envoltorio como="section" className="bg-fondo text-tinta relative" claseDeContenido="min-h-[200svh] py-[var(--spacing-20)]">
        <Cuerpo>[CUERPO DE LA PÁGINA] El papel: acá la escena duerme.</Cuerpo>
      </Envoltorio>
    </main>
  )
}

import type { Metadata } from 'next'

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { IntroDeLaPagina, ParrafoDeLaBajada, SELECTOR_DE_LA_INTRO } from '../_componentes/pagina/IntroDeLaPagina'
import { TITULOS_CON_LETRAS } from '../_componentes/titulos3d/presets'
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
  tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null },
  pista: PISTA_DE_LA_INTRO,
  noche: 'noche',
  // [B12a.3] El acento de web y la variante de prueba (el registro: `_variantes/registro.ts`), para ejercer la ranura.
  acento: 'web',
  variante: 'prueba',
}

/**
 * [B12a.4] El título de la prueba: con `?nombre=1` a `6`, uno de los que las fuentes saben escribir (`TITULOS_CON_LETRAS`: los nombres de las
 * páginas de servicio primero), para elegir la familia con `?titulo=1|2|3` viendo los de verdad; sin él, el de la prueba.
 */
const tituloDeLaPrueba = (nombre: string | string[] | undefined): string => TITULOS_CON_LETRAS[Number(nombre) - 1] ?? 'Prueba de la intro'

export default async function PruebaDePagina({ searchParams }: { readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>> }): Promise<React.JSX.Element> {
  const { nombre } = await searchParams
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo={tituloDeLaPrueba(nombre)}
        preset={PRESET}
        bajada={
          <>
            <ParrafoDeLaBajada>Scrolleá la intro (1,5 pantallas) y volvé: la cámara va de la composición inicial a la pose de la intro, y la variante de prueba enciende la luz de abajo con el acento.</ParrafoDeLaBajada>
            {/* [B12a.3] La salida de la variante: el enlace pide la señal (P-H29d), la luz vuelve a la composición y recién después navega (el lienzo sigue). */}
            <EnlaceDeRuta href="/v3" className="underline underline-offset-4">
              Volver al home (la salida de la variante)
            </EnlaceDeRuta>
          </>
        }
      />
      <Envoltorio como="section" className="bg-fondo text-tinta relative" claseDeContenido="min-h-[200svh] py-[var(--spacing-20)]">
        <Cuerpo>[CUERPO DE LA PÁGINA] El papel: acá la escena duerme.</Cuerpo>
      </Envoltorio>
    </main>
  )
}

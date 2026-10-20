import type { Metadata } from 'next'
import Link from 'next/link'

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, IntroDeLaPagina, ParrafoDeLaBajada } from '../_componentes/pagina/IntroDeLaPagina'
import { Cuerpo, Micro } from '../_componentes/tipografia/Textos'
import { keyframesDeLaIntro, varianteDeLaIntro, type VarianteDeLaIntro } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. [B12a.2] La página de prueba de la intro (plan `docs/rediseno/SPRINT-B12a.md` §10): la intro de 1,5
 * pantallas sobre la escena, de noche, y el cuerpo en papel. `?intro=1|2|3` elige la pose de la intro que Valentino mira; la elegida
 * queda y la bandera se va. SE BORRA cuando exista la primera página de servicio con su intro (B12a la adopta: §1.9).
 */
export const metadata: Metadata = {
  title: 'v3 · prueba de la intro — instrumento interno',
  description: 'La intro de una página sobre la escena, con tres poses. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

const presetDePrueba = (v: VarianteDeLaIntro): PresetDeLaEscena => ({
  id: 'prueba',
  tramos: { intro: `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, pie: null },
  pista: keyframesDeLaIntro(v),
  noche: 'noche',
  acento: null,
})

/** Uno por variante, armados una vez: el mismo objeto en cada render (la escena arma la pista una vez por preset). */
const PRESETS: Readonly<Record<VarianteDeLaIntro, PresetDeLaEscena>> = { 1: presetDePrueba(1), 2: presetDePrueba(2), 3: presetDePrueba(3) }

const NOMBRES: Readonly<Record<VarianteDeLaIntro, string>> = { 1: 'acercarse', 2: 'girar', 3: 'subir' }

const VARIANTES: readonly VarianteDeLaIntro[] = [1, 2, 3]

export default async function PruebaDePagina({ searchParams }: { readonly searchParams: Promise<{ readonly intro?: string | string[] }> }) {
  const { intro } = await searchParams
  const v = varianteDeLaIntro(typeof intro === 'string' ? new URLSearchParams({ intro }).toString() : '')
  return (
    <main className="relative z-10">
      <IntroDeLaPagina
        titulo={`Prueba de la intro · ${String(v)} · ${NOMBRES[v]}`}
        preset={PRESETS[v]}
        bajada={
          <>
            <ParrafoDeLaBajada>Scrolleá la intro (1,5 pantallas) y volvé: la cámara va de la composición inicial a la pose de esta variante.</ParrafoDeLaBajada>
            <nav aria-label="Las poses de la intro" className="flex gap-[var(--spacing-4)]">
              {VARIANTES.map((otra) => (
                <Link key={otra} href={`/v3/prueba-de-pagina?intro=${String(otra)}`} aria-current={otra === v ? 'page' : undefined} className="underline underline-offset-4 aria-[current=page]:no-underline">
                  <Micro como="span" className="uppercase">{`${String(otra)} · ${NOMBRES[otra]}`}</Micro>
                </Link>
              ))}
            </nav>
          </>
        }
      />
      <Envoltorio como="section" className="bg-fondo text-tinta relative" claseDeContenido="min-h-[200svh] py-[var(--spacing-20)]">
        <Cuerpo>[CUERPO DE LA PÁGINA] El papel: acá la escena duerme.</Cuerpo>
      </Envoltorio>
    </main>
  )
}

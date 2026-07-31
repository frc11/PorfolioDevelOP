import type { Metadata } from 'next'
import { RuleDivider } from '@/components/design-system'
import { AccentPermutations } from './_components/AccentPermutations'
import { ComponentStates } from './_components/ComponentStates'
import {
  SkeletonClose,
  SkeletonServices,
  SkeletonWhy,
} from './_components/HomeSkeletonBottom'
import {
  SkeletonHero,
  SkeletonLiveProof,
  SkeletonProof,
} from './_components/HomeSkeletonTop'
import { PaletteBlock } from './_components/PaletteBlock'
import { SgBlock } from './_components/SgBlock'
import { TypographyBlock } from './_components/TypographyBlock'

/**
 * Página interna del rediseño. `noindex, nofollow` y sin ningún link entrante
 * desde el sitio público: se llega solo escribiendo la URL.
 */
export const metadata: Metadata = {
  title: 'Styleguide — sistema de diseño B1 · develOP',
  description: 'Página interna del rediseño. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

const GATE_ITEMS: readonly { id: string; label: string }[] = [
  { id: 'paleta', label: 'Paleta' },
  { id: 'acentos', label: 'Acentos — decisión' },
  { id: 'tipografia', label: 'Tipografía — decisión' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'home', label: 'Las 6 secciones' },
]

export default function StyleguidePage() {
  return (
    <main data-ds-theme="dark" className="min-h-screen bg-ds-canvas font-ds-sans text-ds-fg">
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <header className="px-ds-gutter pt-32 pb-16 md:pt-40">
        <div className="mx-auto flex w-full max-w-ds-page flex-col gap-8">
          <p className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
            Interno — no indexado, no linkeado
          </p>

          <h1 className="font-ds-sans text-ds-display-lg font-medium text-balance text-ds-fg">
            Styleguide del sistema de diseño
          </h1>

          <p className="max-w-ds-prose text-ds-lead text-ds-fg-muted">
            Dirección cerrada: instrumento de precisión, editorial. Base monocroma con inversión de
            tema por sección, superficies planas y quietas, relieve táctil solo en lo que se aprieta,
            un acento por servicio en dosis mínimas.
          </p>

          <nav aria-label="Bloques del styleguide" className="flex flex-wrap gap-x-6 gap-y-2">
            {GATE_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted underline decoration-ds-rule underline-offset-4 transition-colors hover:text-ds-fg hover:decoration-ds-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg motion-reduce:transition-none"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <RuleDivider />

          <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
            Todo lo que dice <code className="font-ds-mono">[PENDIENTE]</code> o{' '}
            <code className="font-ds-mono">[DATO PENDIENTE DE FRANCO]</code> está así a propósito. No
            hay ninguna cifra, ningún nombre de cliente y ninguna bio inventada en esta página.
          </p>
        </div>
      </header>

      <SgBlock
        id="paleta"
        index="01"
        title="Paleta"
        note="Cada swatch lee su propio valor del DOM, así que lo que muestra es el token real y no una copia que se puede desincronizar."
      >
        <PaletteBlock />
      </SgBlock>

      <SgBlock
        id="acentos"
        index="02"
        title="Acentos — decisión de Gate 1"
        note="El código y CLAUDE.md asignan los MISMOS cuatro hex a servicios distintos. Cyan queda en web en las dos opciones; los otros tres rotan. Hoy los tokens tienen la opción A. Elegir una."
      >
        <AccentPermutations />
      </SgBlock>

      <SgBlock
        id="tipografia"
        index="03"
        title="Tipografía — decisión de Gate 1"
        note="La escala es la misma en las dos opciones: lo único en juego es la familia del display. Sin serif de lujo, y sin sumar una familia solo para el display si Geist alcanza."
      >
        <TypographyBlock />
      </SgBlock>

      <SgBlock
        id="componentes"
        index="04"
        title="Componentes y estados"
        note="Los interactivos van dos veces: vivos (interactuar) y con el estado forzado, para poder comparar los cinco de un vistazo."
      >
        <ComponentStates />
      </SgBlock>

      <SgBlock
        id="home"
        index="05"
        title="Las 6 secciones del home — esqueleto"
        note="Arquitectura de temas: S1 oscura · S2 crema · S3 oscura · S4 oscura · S5 crema · S6 oscura. Es maqueta de estructura y jerarquía, no la sección terminada: no hay motion, no hay 3D y no hay contenido que no esté decidido."
      >
        <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          Las seis arrancan abajo, a ancho completo, cada una con su propio tema. Cada
          <code className="mx-1 font-ds-mono">SectionShell</code> pinta su fondo, así que la inversión
          se ve en el corte entre secciones.
        </p>
      </SgBlock>

      {/* Las 6 secciones, a ancho completo y fuera del chrome del styleguide. */}
      <SkeletonHero />
      <SkeletonProof />
      <SkeletonLiveProof />
      <SkeletonServices />
      <SkeletonWhy />
      <SkeletonClose />

      <footer data-ds-theme="dark" className="bg-ds-canvas px-ds-gutter py-16 text-ds-fg">
        <div className="mx-auto w-full max-w-ds-page">
          <RuleDivider />
          <p className="mt-6 font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
            Fin del styleguide — B1 cerrado, esperando Gate 1
          </p>
        </div>
      </footer>
    </main>
  )
}

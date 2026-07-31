import type { ReactNode } from 'react'
import { RuleDivider } from '@/components/design-system'

interface SgBlockProps {
  id: string
  /** Ordinal del bloque del styleguide. No es el capítulo del home. */
  index: string
  title: string
  /** Aclaración de lectura: qué mirar, o qué está pendiente de decidir. */
  note?: ReactNode
  children: ReactNode
}

/**
 * Chrome de un bloque del styleguide.
 *
 * A propósito NO usa `SectionShell`: en esta página `SectionShell` es una de las
 * piezas exhibidas (el esqueleto de las 6 secciones del home), así que el marco
 * de la herramienta tiene que ser visiblemente otra cosa que el especimen. Usa
 * los mismos tokens, pero es un wrapper local.
 */
export function SgBlock({ id, index, title, note, children }: SgBlockProps) {
  return (
    <section
      id={id}
      data-ds-theme="dark"
      className="scroll-mt-24 bg-ds-canvas px-ds-gutter py-16 font-ds-sans text-ds-fg md:py-24"
    >
      <div className="mx-auto w-full max-w-ds-page">
        <header className="flex flex-col gap-4">
          <p className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
            {index} — {title}
          </p>
          <RuleDivider />
          {note ? (
            <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">{note}</p>
          ) : null}
        </header>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

/** Sub-título dentro de un bloque. */
export function SgLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">{children}</p>
  )
}

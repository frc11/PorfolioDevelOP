'use client'

import { useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useThemeSectionOptional } from '@/hooks/useThemeObserver'
import { cn } from '@/lib/utils'

export type SectionTheme = 'dark' | 'light'

interface SectionShellProps {
  /** Tema de la sección. La arquitectura del home alterna dark/crema. */
  theme?: SectionTheme
  id?: string
  children: ReactNode
  className?: string
  /**
   * Ancla el contenido al container de página (1240px + gutter fluido).
   * Apagar solo para secciones que sangran a ancho completo.
   */
  contained?: boolean
}

/**
 * Wrapper de sección. Es el DUEÑO del theming del sitio público rediseñado.
 *
 * Dos responsabilidades, deliberadamente separadas:
 *
 * 1. **Tema local.** Escribe `data-ds-theme` en su propio `<section>`. Los
 *    scopes de `globals.css` reapuntan ahí la capa semántica de tokens
 *    (`--color-ds-canvas`, `--color-ds-fg`, `--color-ds-rule`, …), así que todo
 *    lo que esté adentro toma los colores del tema sin recibir ninguna prop.
 *    Es local: no hay estado global, funciona anidado (una sección oscura
 *    dentro de una crema) y funciona sin ningún provider montado.
 *
 * 2. **Inversión global.** Además avisa al `ThemeProvider` del sitio cuando
 *    entra en la banda central del viewport, para que el `<body>` acompañe.
 *
 * Por qué (2) existe: hoy ese disparo lo hacen `About.tsx` y `WhyDevelOP.tsx`
 * vía `useThemeSection`, y son los ÚNICOS dos llamadores vivos —
 * `SectionTransition.tsx`, el tercero, es código muerto (cero consumidores).
 * Los dos vivos mueren en el rediseño, y como `ThemeProvider` arranca en
 * `'light'`, el tema global quedaría congelado en claro para siempre, sin
 * ningún error de build. `SectionShell` toma esa responsabilidad.
 *
 * Se usa `useThemeSectionOptional` y no `useThemeSection` porque el segundo
 * tira si no hay `ThemeProvider` arriba, y este componente tiene que poder
 * renderizar fuera del árbol del home.
 */
export function SectionShell({
  theme = 'dark',
  id,
  children,
  className,
  contained = true,
}: SectionShellProps) {
  const ref = useRef<HTMLElement>(null)

  // Banda central del viewport: la sección "gana" el tema cuando ocupa el
  // medio de la pantalla. Con márgenes más flojos, dos secciones contiguas se
  // pelean el tema en el borde del scroll.
  const isInView = useInView(ref, { once: false, margin: '-45% 0px -45% 0px' })

  useThemeSectionOptional(isInView, theme)

  return (
    <section
      ref={ref}
      id={id}
      data-ds-theme={theme}
      // `font-ds-sans` acá y no en cada pieza: así el texto que no declara
      // familia propia (Lead, párrafos de cuerpo) hereda Geist en vez de caer
      // en la fuente del sistema operativo.
      className={cn('relative bg-ds-canvas py-ds-section font-ds-sans text-ds-fg', className)}
    >
      {contained ? (
        <div className="mx-auto w-full max-w-ds-page px-ds-gutter">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}

'use client'

import { useInView } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useThemeSectionOptional } from '@/hooks/useThemeObserver'
import { cn } from '@/lib/utils'
import type { ServiceAccent } from './accent'

export type SectionTheme = 'dark' | 'light'

/**
 * Var CSS del wash de cada servicio. Literal y no `--color-ds-accent-${accent}-wash`
 * armado en runtime: es un `var()` dentro de un inline `style`, no una clase de
 * Tailwind, así que el escaneo estático no aplica acá — pero mantenerlo como
 * mapa explícito (en vez de interpolar el string) documenta las tres variantes
 * que existen y evita un typo silencioso si `ServiceAccent` gana un rol.
 */
const ACCENT_WASH_VAR: Record<ServiceAccent, string> = {
  web: 'var(--color-ds-accent-web-wash)',
  ia: 'var(--color-ds-accent-ia-wash)',
  software: 'var(--color-ds-accent-software-wash)',
}

interface SectionShellProps {
  /**
   * Tema de la sección. La arquitectura del home alterna dark/claro.
   * Default `'light'`: 6 de las 8 secciones del esquema son claras, y la
   * identidad nueva es clara — un default que la contradice produce errores
   * por omisión en cualquier `SectionShell` que se cree sin pensar el tema.
   */
  theme?: SectionTheme
  id?: string
  children: ReactNode
  className?: string
  /**
   * Ancla el contenido al container de página (1240px + gutter fluido).
   * Apagar solo para secciones que sangran a ancho completo.
   */
  contained?: boolean
  /**
   * Ritmo vertical. `'section'` (default) es el del sistema
   * (`--spacing-ds-section`). `'none'` lo apaga para que la sección declare el
   * suyo por `className`.
   *
   * Existe porque NO alcanza con pasar `pt-*`/`pb-*` en `className`: se midió
   * contra el `cn` del repo y `twMerge` NO colapsa `py-ds-section` contra
   * `pt-*`/`pb-*` — las tres clases sobreviven y quién gana lo decide el orden
   * del CSS emitido, no el del código. Es el mismo modo de fallar silencioso
   * que ya documentó `DS_FONT_SIZE_CLASSES` en `lib/utils.ts`.
   *
   * Hoy lo usa el hero, que reserva abajo el alto del chrome flotante.
   */
  spacing?: 'section' | 'none'
  /**
   * Wash de servicio — capacidad de S1-cimiento, consumida recién en S5. Solo
   * tiene efecto con `theme="light"`: la tabla del documento no define un wash
   * para tema oscuro, así que en una sección oscura este prop no hace nada (se
   * ignora, no se tira error — evita que un uso apurado rompa el build).
   */
  wash?: ServiceAccent
}

/**
 * Wrapper de sección. Es el DUEÑO del theming del sitio público rediseñado.
 *
 * Tres responsabilidades, deliberadamente separadas:
 *
 * 1. **Tema local.** Escribe `data-ds-theme` en su propio `<section>`. Los
 *    scopes de `globals.css` reapuntan ahí la capa semántica de tokens
 *    (`--color-ds-canvas`, `--color-ds-fg`, `--color-ds-rule`, …), así que todo
 *    lo que esté adentro toma los colores del tema sin recibir ninguna prop.
 *    Es local: no hay estado global, funciona anidado (una sección oscura
 *    dentro de una clara) y funciona sin ningún provider montado.
 *
 * 2. **Inversión global.** Además avisa al `ThemeProvider` del sitio cuando
 *    entra en la banda central del viewport, para que `HomeWrapper` acompañe
 *    — ver el punto 3.
 *
 *    Por qué (2) existe: hoy ese disparo lo hacen `About.tsx` y `WhyDevelOP.tsx`
 *    vía `useThemeSection`, y son los ÚNICOS dos llamadores que quedan — el
 *    tercero, `SectionTransition.tsx`, era código muerto y se borró en B2-S2.
 *    Los dos vivos mueren en el rediseño (sus componentes salen de `page.tsx`
 *    reemplazados sección por sección en S2-S6), y como `ThemeProvider` arranca
 *    en `'light'`, el tema global quedaría congelado en claro para siempre sin
 *    este disparador. `SectionShell` toma esa responsabilidad.
 *
 *    ⚠ Mientras Hero/About/Portfolio/OurServices/PortalDemo/Footer sigan
 *    montados TAL CUAL dentro de un `SectionShell` (Bloque 3 de S1-cimiento:
 *    "no se toca OurServices.tsx", "los componentes actuales tal cual"),
 *    `About.tsx` y `WhyDevelOP.tsx` conservan sus PROPIOS `useThemeSection`
 *    internos — no están en el scope de este sprint. Van a competir con el
 *    `SectionShell` que los envuelve si su tema forzado no coincide con el
 *    `theme` que ese `SectionShell` recibe. Riesgo conocido, no resuelto acá:
 *    reportado en el cierre del sprint para que se resuelva cuando esas
 *    secciones se reemplacen.
 *
 *    Se usa `useThemeSectionOptional` y no `useThemeSection` porque el segundo
 *    tira si no hay `ThemeProvider` arriba, y este componente tiene que poder
 *    renderizar fuera del árbol del home (el styleguide).
 *
 * 3. **Transición cromática, no corte seco.** El fondo de la sección no es un
 *    `background-color` opaco de borde a borde: es un `background-image` de
 *    4 paradas que arranca y termina en transparente, con
 *    `--color-ds-canvas` sólido solo en el tramo central (ver
 *    `--spacing-ds-section-fade` en `globals.css`). En esa franja transparente
 *    de los bordes se asoma lo que hay detrás — el fondo de `HomeWrapper`, que
 *    anima con Framer Motion entre los colores de tema disparados por (2). El
 *    cruce entre dos secciones de tema distinto queda como un fundido
 *    continuo, no un salto de un color sólido a otro. Ninguna sección necesita
 *    saber de qué color es su vecina: cada una funde hacia lo que sea que
 *    revele su propio borde. Se usa `background-image` (no `mask-image`)
 *    porque un `mask` desvanecería también el CONTENIDO cerca del borde de la
 *    sección — acá solo se desvanece el fondo.
 */
export function SectionShell({
  theme = 'light',
  id,
  children,
  className,
  contained = true,
  spacing = 'section',
  wash,
}: SectionShellProps) {
  const ref = useRef<HTMLElement>(null)

  // Banda central del viewport: la sección "gana" el tema cuando ocupa el
  // medio de la pantalla. Con márgenes más flojos, dos secciones contiguas se
  // pelean el tema en el borde del scroll.
  const isInView = useInView(ref, { once: false, margin: '-45% 0px -45% 0px' })

  useThemeSectionOptional(isInView, theme)

  const canvasVar = theme === 'light' && wash ? ACCENT_WASH_VAR[wash] : 'var(--color-ds-canvas)'

  const fadeStyle: CSSProperties = {
    backgroundImage: `linear-gradient(to bottom, transparent, ${canvasVar} var(--spacing-ds-section-fade), ${canvasVar} calc(100% - var(--spacing-ds-section-fade)), transparent)`,
  }

  return (
    <section
      ref={ref}
      id={id}
      data-ds-theme={theme}
      style={fadeStyle}
      // `font-ds-sans` acá y no en cada pieza: así el texto que no declara
      // familia propia (Lead, párrafos de cuerpo) hereda Chivo en vez de caer
      // en la fuente del sistema operativo. Sin `bg-ds-canvas`: el fondo lo
      // pinta `fadeStyle` (arriba) para poder fundir los bordes a transparente.
      className={cn(
        'relative font-ds-sans text-ds-fg',
        spacing === 'section' && 'py-ds-section',
        className,
      )}
    >
      {contained ? (
        <div className="mx-auto w-full max-w-ds-page px-ds-gutter">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}

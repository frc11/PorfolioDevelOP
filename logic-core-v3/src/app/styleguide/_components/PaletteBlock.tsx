'use client'

import { useEffect, useRef, useState } from 'react'
import { SgLabel } from './SgBlock'

interface SwatchProps {
  /** Nombre del custom property, tal cual se declara en globals.css. */
  token: string
  /** Clase de fondo del sistema — el color sale del token, no de un literal. */
  swatchClass: string
  /** Rol del token en una palabra. */
  role: string
}

/**
 * Un swatch lee su propio valor con `getComputedStyle` en vez de repetir el hex
 * acá. Así el styleguide no puede desincronizarse de `globals.css`, y además los
 * tokens de la capa semántica muestran el valor del tema en el que están
 * montados (el mismo swatch da distinto en el bloque dark que en el crema).
 */
function Swatch({ token, swatchClass, role }: SwatchProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    const node = ref.current
    if (!node) return
    setValue(getComputedStyle(node).getPropertyValue(token).trim())
  }, [token])

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div
        className={`h-20 w-full border border-ds-rule rounded-ds-surface ${swatchClass}`}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <code className="font-ds-mono text-[0.7rem] leading-tight break-all text-ds-fg">{token}</code>
        <span className="font-ds-mono text-[0.7rem] text-ds-fg-muted">{value || '—'}</span>
        <span className="text-xs text-ds-fg-muted">{role}</span>
      </div>
    </div>
  )
}

const BASE_DARK: readonly SwatchProps[] = [
  { token: '--color-ds-void', swatchClass: 'bg-ds-void', role: 'Fondo de sección' },
  { token: '--color-ds-surface', swatchClass: 'bg-ds-surface', role: 'Panel' },
  { token: '--color-ds-dark-ink', swatchClass: 'bg-ds-dark-ink', role: 'Texto' },
  { token: '--color-ds-ink-muted', swatchClass: 'bg-ds-ink-muted', role: 'Texto secundario' },
  { token: '--color-ds-border', swatchClass: 'bg-ds-border', role: 'Borde y regla' },
]

const BASE_LIGHT: readonly SwatchProps[] = [
  { token: '--color-ds-light-bg', swatchClass: 'bg-ds-light-bg', role: 'Fondo de sección' },
  { token: '--color-ds-light-surface', swatchClass: 'bg-ds-light-surface', role: 'Panel' },
  { token: '--color-ds-light-ink', swatchClass: 'bg-ds-light-ink', role: 'Texto' },
  {
    token: '--color-ds-light-ink-muted',
    swatchClass: 'bg-ds-light-ink-muted',
    role: 'Texto secundario',
  },
  { token: '--color-ds-light-border', swatchClass: 'bg-ds-light-border', role: 'Borde y regla' },
]

const SEMANTIC: readonly SwatchProps[] = [
  { token: '--color-ds-canvas', swatchClass: 'bg-ds-canvas', role: 'Fondo del tema activo' },
  { token: '--color-ds-panel', swatchClass: 'bg-ds-panel', role: 'Panel del tema activo' },
  { token: '--color-ds-fg', swatchClass: 'bg-ds-fg', role: 'Texto del tema activo' },
  { token: '--color-ds-fg-muted', swatchClass: 'bg-ds-fg-muted', role: 'Secundario del tema' },
  { token: '--color-ds-rule', swatchClass: 'bg-ds-rule', role: 'Regla del tema' },
  {
    token: '--color-ds-control-edge',
    swatchClass: 'bg-ds-control-edge',
    role: 'Canto del control',
  },
]

function SwatchGrid({ items }: { items: readonly SwatchProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Swatch key={item.token} {...item} />
      ))}
    </div>
  )
}

export function PaletteBlock() {
  return (
    <div className="flex flex-col gap-14">
      <div>
        <SgLabel>Base dark — tema por defecto</SgLabel>
        <SwatchGrid items={BASE_DARK} />
      </div>

      <div>
        <SgLabel>Tema claro — secciones invertidas</SgLabel>
        <SwatchGrid items={BASE_LIGHT} />
      </div>

      <div>
        <SgLabel>Capa semántica — mismos swatches, montados en cada tema</SgLabel>
        <p className="mb-6 max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
          Estos son los tokens que consumen los componentes. No tienen un valor propio: apuntan a
          la base dark o a la clara según el <code className="font-ds-mono">data-ds-theme</code> de la
          sección que los contiene. Las dos filas de abajo son el mismo componente montado en los
          dos temas — el valor que muestra cada swatch lo lee del DOM.
        </p>
        <div className="grid gap-px overflow-hidden border border-ds-rule rounded-ds-surface md:grid-cols-2">
          <div data-ds-theme="dark" className="bg-ds-canvas p-6 text-ds-fg">
            <SgLabel>data-ds-theme=&quot;dark&quot;</SgLabel>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {SEMANTIC.map((item) => (
                <Swatch key={`dark-${item.token}`} {...item} />
              ))}
            </div>
          </div>
          <div data-ds-theme="light" className="bg-ds-canvas p-6 text-ds-fg">
            <SgLabel>data-ds-theme=&quot;light&quot;</SgLabel>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {SEMANTIC.map((item) => (
                <Swatch key={`light-${item.token}`} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

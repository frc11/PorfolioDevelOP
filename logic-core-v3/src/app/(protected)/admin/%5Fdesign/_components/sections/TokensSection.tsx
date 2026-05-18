import { Example, SectionWrapper } from '../Example'
import { colors, radii, spacing } from '@/lib/design-tokens'

export function TokensSection() {
  return (
    <SectionWrapper
      title="Tokens"
      description="Valores fundamentales del design system. Importar desde @/lib/design-tokens."
    >
      <Example
        title="Colores brand"
        code={`import { colors } from '@/lib/design-tokens'

colors.brand.primary
colors.brand.primaryHover`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(colors.brand).map(([key, value]) => (
            <ColorSwatch key={key} name={`brand.${key}`} value={value} />
          ))}
        </div>
      </Example>

      <Example
        title="Surfaces"
        description="Fondos canonicos para pantallas, cards y overlays."
        code={`import { colors } from '@/lib/design-tokens'

colors.surface.base
colors.surface.glass
colors.surface.glassHover`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(colors.surface).map(([key, value]) => (
            <ColorSwatch key={key} name={`surface.${key}`} value={value} />
          ))}
        </div>
      </Example>

      <Example
        title="Text"
        code={`import { colors } from '@/lib/design-tokens'

colors.text.primary
colors.text.tertiary
colors.text.muted`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(colors.text).map(([key, value]) => (
            <ColorSwatch key={key} name={`text.${key}`} value={value} />
          ))}
        </div>
      </Example>

      <Example
        title="Semantic"
        code={`import { colors } from '@/lib/design-tokens'

colors.success.base
colors.warning.base
colors.danger.base
colors.info.base`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {(['success', 'warning', 'danger', 'info'] as const).map((key) => (
            <ColorSwatch key={key} name={`${key}.base`} value={colors[key].base} />
          ))}
        </div>
      </Example>

      <Example
        title="Border Radius"
        code={`import { radii } from '@/lib/design-tokens'

radii.lg // rounded-2xl
radii.xl // rounded-3xl`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(radii).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div
                className="mb-2 h-16 w-16 border border-cyan-400/40 bg-cyan-400/20"
                style={{ borderRadius: value }}
              />
              <p className="font-mono text-xs text-zinc-300">{key}</p>
              <p className="text-[10px] text-zinc-500">{value}</p>
            </div>
          ))}
        </div>
      </Example>

      <Example
        title="Spacing"
        code={`import { spacing } from '@/lib/design-tokens'

spacing.lg // 20px, p-5
spacing.xl // 24px, p-6`}
        background="transparent"
      >
        <div className="w-full space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <p className="w-16 font-mono text-xs text-zinc-400">{key}</p>
              <div className="h-3 bg-cyan-400/40" style={{ width: `${value}px` }} />
              <p className="font-mono text-xs text-zinc-500">{value}px</p>
            </div>
          ))}
        </div>
      </Example>
    </SectionWrapper>
  )
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-2 h-12 rounded-lg border border-white/10" style={{ backgroundColor: value }} />
      <p className="font-mono text-xs text-zinc-300">{name}</p>
      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{value}</p>
    </div>
  )
}

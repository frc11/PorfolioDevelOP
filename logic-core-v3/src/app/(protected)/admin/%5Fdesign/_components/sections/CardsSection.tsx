import { Example, SectionWrapper } from '../Example'
import { Card } from '@/components/ui'

export function CardsSection() {
  return (
    <SectionWrapper
      title="Cards"
      description="Containers basicos con borde sutil. Variantes canonicas y paddings."
    >
      <Example title="Variant: default" code={`<Card>Contenido</Card>`}>
        <Card className="w-full">
          <p className="text-sm text-zinc-300">Contenido del card</p>
        </Card>
      </Example>

      <Example
        title="Variant: interactive"
        code={`<Card variant="interactive">Click me</Card>`}
      >
        <Card variant="interactive" className="w-full cursor-pointer">
          <p className="text-sm text-zinc-300">Hover para ver el efecto</p>
        </Card>
      </Example>

      <Example
        title="Variant: dashed"
        code={`<Card variant="dashed">Estado vacio</Card>`}
      >
        <Card variant="dashed" className="w-full">
          <p className="text-center text-sm text-zinc-400">Sin contenido</p>
        </Card>
      </Example>

      <Example
        title="Variant: elevated"
        code={`<Card variant="elevated" padding="lg">Contenido importante</Card>`}
      >
        <Card variant="elevated" padding="lg" className="w-full">
          <p className="text-base font-medium text-zinc-100">Card elevado con padding grande</p>
          <p className="mt-2 text-sm text-zinc-400">Para destacar contenido importante</p>
        </Card>
      </Example>

      <Example
        title="Variant: glass"
        code={`<Card variant="glass">Sobre fondos con imagen/color</Card>`}
      >
        <div className="w-full rounded-2xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-zinc-900 p-6">
          <Card variant="glass" className="w-full">
            <p className="text-sm text-zinc-200">Card glass sobre fondo con color</p>
          </Card>
        </div>
      </Example>

      <Example
        title="Padding scale"
        code={`<Card padding="sm">p-4</Card>
<Card padding="md">p-5</Card>
<Card padding="lg">p-6</Card>
<Card padding="xl">p-8</Card>`}
      >
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-4">
          {(['sm', 'md', 'lg', 'xl'] as const).map((padding) => (
            <Card key={padding} padding={padding}>
              <p className="font-mono text-xs text-zinc-300">{padding}</p>
            </Card>
          ))}
        </div>
      </Example>
    </SectionWrapper>
  )
}

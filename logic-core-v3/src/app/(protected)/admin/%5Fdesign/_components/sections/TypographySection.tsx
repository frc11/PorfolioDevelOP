import { Example, SectionWrapper } from '../Example'
import { Eyebrow, Heading, Muted } from '@/components/ui'

export function TypographySection() {
  return (
    <SectionWrapper
      title="Typography"
      description="Jerarquia de texto para pantallas operativas."
    >
      <Example
        title="Eyebrow"
        code={`<Eyebrow>METRICAS</Eyebrow>`}
      >
        <Eyebrow>METRICAS</Eyebrow>
      </Example>

      <Example
        title="Headings"
        code={`<Heading level={1}>Titulo principal</Heading>
<Heading level={2}>Titulo de seccion</Heading>
<Heading level={3}>Titulo de bloque</Heading>
<Heading level={4}>Titulo compacto</Heading>`}
      >
        <div className="w-full space-y-3">
          <Heading level={1}>Titulo principal</Heading>
          <Heading level={2}>Titulo de seccion</Heading>
          <Heading level={3}>Titulo de bloque</Heading>
          <Heading level={4}>Titulo compacto</Heading>
        </div>
      </Example>

      <Example
        title="Body text"
        code={`<p className="text-sm leading-relaxed text-zinc-300">
  Texto de cuerpo para descripciones y contexto.
</p>
<Muted>Texto secundario o metadatos.</Muted>`}
      >
        <div className="w-full max-w-xl space-y-2">
          <p className="text-sm leading-relaxed text-zinc-300">
            Texto de cuerpo para descripciones, contexto operativo y notas de apoyo.
          </p>
          <Muted>Texto secundario o metadatos.</Muted>
        </div>
      </Example>

      <Example
        title="Caption y mono"
        code={`<p className="text-xs text-zinc-500">Ultima actualizacion</p>
<code className="font-mono text-xs text-zinc-300">botConfig.monthlyQuota</code>`}
      >
        <div className="w-full space-y-2">
          <p className="text-xs text-zinc-500">Ultima actualizacion: hace 2 minutos</p>
          <code className="font-mono text-xs text-zinc-300">botConfig.monthlyQuota</code>
        </div>
      </Example>
    </SectionWrapper>
  )
}

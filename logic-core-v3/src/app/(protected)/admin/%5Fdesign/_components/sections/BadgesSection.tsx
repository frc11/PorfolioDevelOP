import { AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Example, SectionWrapper } from '../Example'

export function BadgesSection() {
  return (
    <SectionWrapper title="Badges" description="Etiquetas de estado y metadatos compactos.">
      <Example
        title="Variantes semanticas"
        code={`<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="brand">Brand</Badge>`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="brand">Brand</Badge>
        </div>
      </Example>

      <Example
        title="Con iconos"
        code={`<Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>Activo</Badge>
<Badge variant="warning" icon={<Clock className="h-3 w-3" />}>Pendiente</Badge>
<Badge variant="danger" icon={<AlertTriangle className="h-3 w-3" />}>Urgente</Badge>`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />}>
            Activo
          </Badge>
          <Badge variant="warning" icon={<Clock className="h-3 w-3" strokeWidth={1.5} />}>
            Pendiente
          </Badge>
          <Badge
            variant="danger"
            icon={<AlertTriangle className="h-3 w-3" strokeWidth={1.5} />}
          >
            Urgente
          </Badge>
        </div>
      </Example>

      <Example
        title="Compatibilidad por tone"
        code={`<Badge tone="violet" size="sm" icon={<Sparkles className="h-3 w-3" />}>
  IA
</Badge>
<Badge tone="emerald" pulse>Online</Badge>`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="violet" size="sm" icon={<Sparkles className="h-3 w-3" strokeWidth={1.5} />}>
            IA
          </Badge>
          <Badge tone="emerald" pulse>
            Online
          </Badge>
        </div>
      </Example>
    </SectionWrapper>
  )
}

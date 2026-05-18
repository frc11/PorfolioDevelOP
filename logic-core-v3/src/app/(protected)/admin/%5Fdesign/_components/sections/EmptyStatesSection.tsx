import { Bot, FileSearch, Inbox, Users } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { Example, SectionWrapper } from '../Example'

export function EmptyStatesSection() {
  return (
    <SectionWrapper title="Empty States" description="Estados vacios con icono, descripcion y CTA opcional.">
      <Example
        title="Default"
        code={`<EmptyState
  icon={Inbox}
  title="Sin mensajes"
  description="Cuando llegue el primer mensaje aparece aca."
/>`}
      >
        <div className="w-full">
          <EmptyState
            icon={Inbox}
            title="Sin mensajes"
            description="Cuando llegue el primer mensaje aparece aca."
          />
        </div>
      </Example>

      <Example
        title="Con CTA link"
        code={`<EmptyState
  icon={Users}
  title="Sin clientes"
  description="Crea el primer cliente para empezar."
  cta={{ label: 'Crear cliente', href: '/admin/clients/new' }}
/>`}
      >
        <div className="w-full">
          <EmptyState
            icon={Users}
            title="Sin clientes"
            description="Crea el primer cliente para empezar."
            cta={{ label: 'Crear cliente', href: '/admin/clients/new' }}
          />
        </div>
      </Example>

      <Example
        title="Subtle"
        code={`<EmptyState
  icon={FileSearch}
  title="Sin resultados"
  description="Ajusta los filtros para ampliar la busqueda."
  variant="subtle"
/>`}
      >
        <div className="w-full">
          <EmptyState
            icon={FileSearch}
            title="Sin resultados"
            description="Ajusta los filtros para ampliar la busqueda."
            variant="subtle"
          />
        </div>
      </Example>

      <Example
        title="Con CTA action"
        code={`<EmptyState
  icon={Bot}
  title="Bot sin conocimiento"
  cta={{ label: 'Cargar base', onClick: handleClick }}
/>`}
      >
        <div className="w-full">
          <EmptyState
            icon={Bot}
            title="Bot sin conocimiento"
            description="Carga fuentes para mejorar las respuestas del bot."
            cta={{ label: 'Cargar base', onClick: () => undefined }}
          />
        </div>
      </Example>
    </SectionWrapper>
  )
}

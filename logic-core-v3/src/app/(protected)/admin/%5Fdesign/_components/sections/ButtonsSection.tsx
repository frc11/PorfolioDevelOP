import { ArrowRight, Plus, Save, Sparkles, Trash } from 'lucide-react'
import { Example, SectionWrapper } from '../Example'
import { Button } from '@/components/ui'

export function ButtonsSection() {
  return (
    <SectionWrapper
      title="Buttons"
      description="Acciones del usuario. 4 variantes por 3 tamanos."
    >
      <Example
        title="Variantes"
        code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Example>

      <Example
        title="Tamanos"
        code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Example>

      <Example
        title="Con iconos"
        code={`<Button icon={<Plus className="h-4 w-4" />}>Crear</Button>
<Button variant="secondary" icon={<Save className="h-4 w-4" />}>Guardar</Button>
<Button variant="danger" icon={<Trash className="h-4 w-4" />}>Eliminar</Button>`}
      >
        <div className="flex flex-wrap gap-3">
          <Button icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}>Crear</Button>
          <Button
            variant="secondary"
            icon={<Save className="h-4 w-4" strokeWidth={1.5} />}
          >
            Guardar
          </Button>
          <Button variant="danger" icon={<Trash className="h-4 w-4" strokeWidth={1.5} />}>
            Eliminar
          </Button>
        </div>
      </Example>

      <Example
        title="Icono de accion"
        code={`<Button icon={<Sparkles className="h-4 w-4" />}>Generar</Button>
<Button variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>Ver detalle</Button>`}
      >
        <div className="flex flex-wrap gap-3">
          <Button icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}>Generar</Button>
          <Button variant="ghost" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.5} />}>
            Ver detalle
          </Button>
        </div>
      </Example>

      <Example
        title="Loading state"
        code={`<Button loading>Guardando...</Button>
<Button variant="secondary" loading>Procesando</Button>`}
      >
        <div className="flex flex-wrap gap-3">
          <Button loading>Guardando...</Button>
          <Button variant="secondary" loading>
            Procesando
          </Button>
        </div>
      </Example>

      <Example
        title="Disabled"
        code={`<Button disabled>Sin permisos</Button>
<Button variant="secondary" disabled>Pausado</Button>`}
      >
        <div className="flex flex-wrap gap-3">
          <Button disabled>Sin permisos</Button>
          <Button variant="secondary" disabled>
            Pausado
          </Button>
        </div>
      </Example>
    </SectionWrapper>
  )
}

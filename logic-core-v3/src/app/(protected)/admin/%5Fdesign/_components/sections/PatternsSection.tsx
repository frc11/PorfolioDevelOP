import { Activity, Bot, Building2, MessageSquare, Settings, Users } from 'lucide-react'
import { Badge, Button, Card, Field, Input, Section, StatCard } from '@/components/ui'
import { Example, SectionWrapper } from '../Example'

export function PatternsSection() {
  return (
    <SectionWrapper
      title="Patterns"
      description="Composiciones canonicas para pantallas admin y dashboards."
    >
      <Example
        title="Dashboard summary"
        code={`<div className="space-y-6">
  <div className="grid grid-cols-4 gap-4">
    <StatCard label="Conversaciones" value={1234} accent="cyan" />
    <StatCard label="Leads" value={48} accent="violet" />
  </div>
  <Card padding="lg">Contenido principal</Card>
</div>`}
        background="transparent"
      >
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Conversaciones" value={1234} icon={MessageSquare} accent="cyan" />
            <StatCard label="Leads" value={48} icon={Users} accent="violet" />
            <StatCard label="Health" value="94%" icon={Activity} accent="emerald" />
          </div>
          <Card padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Resumen operativo</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Un bloque principal despues de los KPIs, sin exceso de contenedores anidados.
                </p>
              </div>
              <Badge variant="success">Activo</Badge>
            </div>
          </Card>
        </div>
      </Example>

      <Example
        title="Settings panel"
        code={`<Section title="Identidad" action={<Button size="sm">Guardar</Button>}>
  <Card padding="lg">
    <form className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre"><Input /></Field>
      <Field label="Slug"><Input /></Field>
    </form>
  </Card>
</Section>`}
        background="transparent"
      >
        <div className="w-full">
          <Section
            title="Identidad"
            description="Configuracion basica del cliente."
            action={<Button size="sm">Guardar</Button>}
          >
            <Card padding="lg">
              <form className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre">
                  <Input placeholder="San Miguel" />
                </Field>
                <Field label="Slug">
                  <Input placeholder="san-miguel" />
                </Field>
              </form>
            </Card>
          </Section>
        </div>
      </Example>

      <Example
        title="Sidebar + content"
        code={`<div className="grid grid-cols-[180px_1fr] gap-4">
  <Card padding="sm">Nav</Card>
  <Card padding="lg">Content</Card>
</div>`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
          <Card padding="sm" className="space-y-1">
            {[
              { label: 'Overview', icon: Building2 },
              { label: 'Chatbot', icon: Bot },
              { label: 'Settings', icon: Settings },
            ].map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                  index === 0 ? 'bg-cyan-400/15 text-cyan-300' : 'text-zinc-400'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </Card>
          <Card padding="lg">
            <div className="space-y-2">
              <p className="text-base font-medium text-zinc-100">Workspace</p>
              <p className="text-sm text-zinc-500">
                Patron para vistas con navegacion secundaria y detalle.
              </p>
            </div>
          </Card>
        </div>
      </Example>

      <Example
        title="Grid de cards"
        code={`<div className="grid grid-cols-3 gap-4">
  <Card variant="interactive">...</Card>
  <Card variant="interactive">...</Card>
  <Card variant="interactive">...</Card>
</div>`}
        background="transparent"
      >
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {['Config', 'Knowledge', 'Leads'].map((item) => (
            <Card key={item} variant="interactive" className="cursor-pointer">
              <p className="text-sm font-medium text-zinc-200">{item}</p>
              <p className="mt-1 text-xs text-zinc-500">Acceso rapido</p>
            </Card>
          ))}
        </div>
      </Example>
    </SectionWrapper>
  )
}

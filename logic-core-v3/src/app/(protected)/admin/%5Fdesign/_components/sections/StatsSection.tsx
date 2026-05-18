import { DollarSign, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { Example, SectionWrapper } from '../Example'
import { StatCard } from '@/components/ui'

export function StatsSection() {
  return (
    <SectionWrapper title="Stats" description="KPI cards para dashboards y summaries.">
      <Example title="Stat basico" code={`<StatCard label="Conversaciones" value={1234} />`}>
        <StatCard label="Conversaciones" value={1234} />
      </Example>

      <Example
        title="Con accent e icon"
        code={`<StatCard
  label="Leads"
  value={48}
  icon={Users}
  accent="violet"
/>`}
      >
        <StatCard label="Leads" value={48} icon={Users} accent="violet" />
      </Example>

      <Example
        title="Con subtitle y trend"
        code={`<StatCard
  label="Revenue"
  value="$2,400"
  subtitle="este mes"
  icon={DollarSign}
  accent="emerald"
  trend={{ direction: 'up', value: '+12%' }}
/>`}
      >
        <StatCard
          label="Revenue"
          value="$2,400"
          subtitle="este mes"
          icon={DollarSign}
          accent="emerald"
          trend={{ direction: 'up', value: '+12%' }}
        />
      </Example>

      <Example
        title="Grid de stats"
        code={`<div className="grid grid-cols-4 gap-4">
  <StatCard label="..." value="..." accent="cyan" />
  <StatCard label="..." value="..." accent="violet" />
  <StatCard label="..." value="..." accent="emerald" />
  <StatCard label="..." value="..." accent="amber" />
</div>`}
      >
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Conversaciones" value={1234} icon={MessageSquare} accent="cyan" />
          <StatCard label="Leads" value={48} icon={Users} accent="violet" />
          <StatCard label="Revenue" value="$2,400" icon={DollarSign} accent="emerald" />
          <StatCard label="Crecimiento" value="+12%" icon={TrendingUp} accent="amber" />
        </div>
      </Example>
    </SectionWrapper>
  )
}

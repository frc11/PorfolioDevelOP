import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { Users, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react'

export const metadata = { title: 'Mini-CRM | develOP Dashboard' }

const CARD = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5'

const STATS = [
  { label: 'Leads activos', value: '34', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Cierres este mes', value: '8', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Tasa de conversión', value: '23%', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Valor del pipeline', value: '$127K', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

const COLUMNS: {
  id: string
  label: string
  color: string
  bg: string
  border: string
  leads: { name: string; company: string; value: string; days: number }[]
}[] = [
  {
    id: 'nuevo',
    label: 'Nuevo',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
    leads: [
      { name: 'Andrés Pérez', company: 'Estudio Pérez', value: '$8.500', days: 1 },
      { name: 'Camila Ruiz', company: 'CR Moda', value: '$12.000', days: 2 },
      { name: 'Federico Ibáñez', company: 'AutoService', value: '$6.000', days: 3 },
    ],
  },
  {
    id: 'contactado',
    label: 'Contactado',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    leads: [
      { name: 'Sofía Méndez', company: 'Hogar Méndez', value: '$15.000', days: 4 },
      { name: 'Tomás Villa', company: 'Villa Corp', value: '$9.200', days: 6 },
      { name: 'Natalia Sosa', company: 'NS Consulting', value: '$18.000', days: 5 },
    ],
  },
  {
    id: 'negociacion',
    label: 'En negociación',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    leads: [
      { name: 'Ricardo Ponce', company: 'Ponce & Asoc.', value: '$22.000', days: 8 },
      { name: 'Luciana Reyes', company: 'LR Digital', value: '$14.500', days: 12 },
    ],
  },
  {
    id: 'vendido',
    label: 'Vendido',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    leads: [
      { name: 'Martín López', company: 'Grupo López', value: '$31.000', days: 18 },
      { name: 'Paula Gutiérrez', company: 'PG Services', value: '$11.800', days: 22 },
    ],
  },
]

export default async function MiniCRMPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('mini-crm') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="mini-crm" />

  return (
    <div className="flex flex-col gap-6 w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Users size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Mini-CRM & Gestión de Leads</h1>
            <p className="text-sm text-zinc-400">Pipeline completo desde el primer contacto hasta el cierre</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={CARD}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} border border-white/[0.06] mb-3`}>
                  <Icon size={14} className={s.color} />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-xs text-zinc-500 leading-snug">{s.label}</p>
              </div>
            )
          })}
        </div>
      </FadeIn>

      {/* Kanban */}
      <FadeIn delay={0.2}>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-56 flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${col.bg} border ${col.border}`} />
                    <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-500">
                    {col.leads.length}
                  </span>
                </div>

                {/* Lead cards */}
                {col.leads.map((lead) => (
                  <div
                    key={lead.name}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 cursor-default select-none hover:border-white/[0.10] transition-colors"
                  >
                    <p className="text-sm font-medium text-zinc-200 mb-0.5">{lead.name}</p>
                    <p className="text-xs text-zinc-500 mb-3">{lead.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{lead.value}</span>
                      <span className="text-[10px] text-zinc-600">{lead.days}d</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

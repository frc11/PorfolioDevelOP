import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { Calendar, Clock, Bell, BarChart2 } from 'lucide-react'

export const metadata = { title: 'Agenda Inteligente | develOP Dashboard' }

const CARD = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Reservas este mes', value: '67', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Cancelaciones', value: '4', icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  { label: 'Tasa de ocupación', value: '78%', icon: BarChart2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Recordatorios enviados', value: '63', icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

const BOOKINGS = [
  { name: 'Martín López', date: 'Hoy 15:30', type: 'Consulta inicial', confirmed: true },
  { name: 'Laura Fernández', date: 'Mañana 10:00', type: 'Test drive', confirmed: true },
  { name: 'Roberto Silva', date: 'Vie 11:00', type: 'Reunión comercial', confirmed: false },
]

const WEEK = [
  { day: 'Lun', filled: [true, false, true, true] },
  { day: 'Mar', filled: [true, true, false, true] },
  { day: 'Mié', filled: [false, true, true, false] },
  { day: 'Jue', filled: [true, false, true, true] },
  { day: 'Vie', filled: [true, true, false, false] },
  { day: 'Sáb', filled: [false, false, true, false] },
  { day: 'Dom', filled: [false, false, false, false] },
]

export default async function AgendaInteligentePage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('agenda-inteligente') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="agenda-inteligente" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Calendar size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Agenda Inteligente 24/7</h1>
            <p className="text-sm text-zinc-400">Reservas automáticas sin intervención manual</p>
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

      <div className="grid lg:grid-cols-2 gap-4">
        <FadeIn delay={0.2}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Próximas reservas</h2>
            <div className="flex flex-col gap-3">
              {BOOKINGS.map((b) => (
                <div key={b.name} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                    {b.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{b.name}</p>
                    <p className="text-xs text-zinc-500">{b.type} · {b.date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] border ${
                    b.confirmed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {b.confirmed ? 'Confirmado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Ocupación esta semana</h2>
            <div className="flex gap-2">
              {WEEK.map((d) => (
                <div key={d.day} className="flex flex-col gap-1.5 flex-1 items-center">
                  <p className="text-[10px] text-zinc-600 font-medium mb-1">{d.day}</p>
                  {d.filled.map((f, i) => (
                    <div
                      key={i}
                      className={`w-full rounded h-7 border ${
                        f
                          ? 'bg-blue-500/20 border-blue-500/30'
                          : 'bg-white/[0.02] border-white/[0.04]'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded bg-blue-500/20 border border-blue-500/30" />
                <span className="text-[10px] text-zinc-500">Reservado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded bg-white/[0.02] border border-white/[0.04]" />
                <span className="text-[10px] text-zinc-500">Disponible</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

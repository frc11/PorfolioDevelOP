import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { MessageCircle, CheckCircle2, Clock, Zap, Users } from 'lucide-react'

export const metadata = { title: 'WhatsApp Autopilot | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Mensajes recibidos', value: '284', icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/10', trend: 18 },
  { label: 'Leads calificados', value: '47', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 24 },
  { label: 'Tasa respuesta automática', value: '94%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 2 },
  { label: 'Tiempo respuesta promedio', value: '< 2 min', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: -12, invertColors: true },
]

const CONVERSATIONS = [
  { name: 'Sofía Martínez', time: 'Hace 12 min', preview: '¿Tienen prueba gratis? Quiero info sobre el plan básico.', tag: 'Calificado' },
  { name: 'Carlos Díaz', time: 'Hace 1h', preview: 'Necesito cotizar para una empresa de 20 personas.', tag: 'En seguimiento' },
  { name: 'Ana González', time: 'Hace 3h', preview: '¿Cómo funciona la integración con MercadoPago?', tag: 'Respondido' },
]

const FLUJOS = [
  { name: 'Bienvenida automática', detail: '284 activaciones este mes', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { name: 'Calificación de leads', detail: '47 activaciones este mes', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { name: 'Recordatorio de turno', detail: '31 activaciones este mes', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
]

export default async function WhatsAppAutopilotPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('whatsapp-autopilot') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="whatsapp-autopilot" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
            <MessageCircle size={18} className="text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Recepcionista IA & WhatsApp Autopilot</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Atención automática 24/7 vía WhatsApp</p>
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
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <TrendBadge value={s.trend} invertColors={s.invertColors} />
                </div>
                <p className="text-xs text-zinc-500 leading-snug">{s.label}</p>
              </div>
            )
          })}
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-4">
        <FadeIn delay={0.2}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Conversaciones recientes</h2>
            <div className="flex flex-col gap-3">
              {CONVERSATIONS.map((c) => (
                <div key={c.name} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-medium text-zinc-200 truncate">{c.name}</p>
                      <span className="text-[10px] text-zinc-600 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{c.preview}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 whitespace-nowrap">
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Flujos activos</h2>
            <div className="flex flex-col gap-3">
              {FLUJOS.map((f) => (
                <div key={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${f.bg} border ${f.border}`}>
                      <Zap size={12} className={f.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{f.name}</p>
                      <p className="text-xs text-zinc-600">{f.detail}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
                    Activo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { ShoppingCart, DollarSign, TrendingUp, Eye, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'E-commerce | develOP Dashboard' }

const CARD = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Ventas este mes', value: '18', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Ingresos', value: '$124.500', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Ticket promedio', value: '$6.916', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'Tasa de conversión', value: '3.2%', icon: CheckCircle2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

const SALES = [
  { product: 'Plan Starter — 1 mes', customer: 'Lucía Ramírez', amount: '$8.500', date: 'Hoy 14:23', status: 'Completado' },
  { product: 'Consultoría Express', customer: 'Marcos Gómez', amount: '$5.200', date: 'Ayer 11:05', status: 'Completado' },
  { product: 'Plan Pro — 3 meses', customer: 'Valentina Torres', amount: '$21.000', date: '22 Mar', status: 'Completado' },
]

const TOP_PRODUCTS = [
  { name: 'Plan Starter mensual', visits: 312, conversion: '4.8%' },
  { name: 'Consultoría Express (1h)', visits: 247, conversion: '3.2%' },
  { name: 'Plan Pro trimestral', visits: 183, conversion: '2.7%' },
]

export default async function EcommercePage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('ecommerce') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="ecommerce" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShoppingCart size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Vendé Mientras Dormís</h1>
            <p className="text-sm text-zinc-400">Catálogo online con pagos reales integrados</p>
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
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Últimas ventas</h2>
            <div className="flex flex-col gap-3">
              {SALES.map((s) => (
                <div key={s.customer + s.date} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{s.product}</p>
                    <p className="text-xs text-zinc-500">{s.customer} · {s.date}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-400">{s.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Productos más vistos</h2>
            <div className="flex flex-col gap-3">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Eye size={12} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-zinc-500">{p.visits} visitas</span>
                      <span className="text-xs text-emerald-400">{p.conversion} conv.</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-zinc-500">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

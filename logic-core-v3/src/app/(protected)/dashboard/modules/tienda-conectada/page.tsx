import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { isModuleActive } from '@/lib/modules/check-activation'
import { getStoreSummary, type TiendanubeStoreSummary } from '@/lib/integrations/tiendanube'
import { prisma } from '@/lib/prisma'
import { ConnectStoreCard } from './_components/ConnectStoreCard'

export const dynamic = 'force-dynamic'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
}

function percentDiff(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  trend?: number | null
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  color: string
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={13} strokeWidth={1.5} style={{ color }} />
        </div>
      </div>
      <span className="text-xl font-black tracking-tight text-zinc-100">{value}</span>
      {trend !== null && trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp size={12} strokeWidth={1.5} className="text-emerald-400" />
          ) : (
            <TrendingDown size={12} strokeWidth={1.5} className="text-red-400" />
          )}
          <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs mes anterior
          </span>
        </div>
      )}
    </div>
  )
}

// ─── TiendanubeOverview ───────────────────────────────────────────────────────

async function TiendanubeOverview({ organizationId }: { organizationId: string }) {
  const data: TiendanubeStoreSummary | null = await getStoreSummary(organizationId)

  if (!data) {
    return (
      <div
        className="rounded-xl px-5 py-12 text-center"
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <ExternalLink size={20} strokeWidth={1.5} className="mx-auto text-zinc-600 mb-3" />
        <p className="text-sm text-zinc-500">
          No se pudo cargar la información de tu tienda. Intentá de nuevo en unos minutos.
        </p>
      </div>
    )
  }

  const revenueTrend = percentDiff(data.revenueThisMonth, data.revenueLastMonth)
  const ordersTrend = percentDiff(data.ordersThisMonth, data.ordersLastMonth)

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pedidos del mes"
          value={String(data.ordersThisMonth)}
          trend={ordersTrend}
          icon={ShoppingCart}
          color="#8b5cf6"
        />
        <StatCard
          label="Facturación"
          value={formatCurrency(data.revenueThisMonth)}
          trend={revenueTrend}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          label="Ticket promedio"
          value={formatCurrency(data.averageTicket)}
          icon={Package}
          color="#06b6d4"
        />
        <StatCard
          label="Carritos abandonados"
          value={String(data.abandonedCarts7d)}
          icon={ShoppingBag}
          color="#f59e0b"
        />
      </div>

      {/* Top products */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Productos más vendidos del mes
        </h2>

        {data.topProducts.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin pedidos este mes todavía.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {data.topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    color: '#a78bfa',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-zinc-300">{p.name}</span>
                <span className="text-xs font-bold text-zinc-400">{p.sales} u.</span>
                <span className="text-xs font-black text-zinc-300">{formatCurrency(p.revenue)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Low stock */}
      {data.lowStockProducts.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: 'rgba(245,158,11,0.04)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Stock crítico
            </h2>
            <span
              className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black"
              style={{
                background: 'rgba(245,158,11,0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              {data.lowStockProducts.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {data.lowStockProducts.map((p) => (
              <div
                key={`${p.id}-${p.sku}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.1)',
                }}
              >
                <span className="flex-1 truncate text-sm text-zinc-300">{p.name}</span>
                {p.sku && (
                  <span className="font-mono text-[11px] text-zinc-600">{p.sku}</span>
                )}
                {p.stock === 0 ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    Agotado
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
                  >
                    {p.stock} en stock
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ))}
      </div>
      <div
        className="h-48 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TiendaConectadaPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string }>
}) {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const isActive = await isModuleActive(organizationId, 'tienda-conectada')
  if (!isActive) redirect('/dashboard')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { tiendanubeStoreId: true },
  })
  if (!org) redirect('/login')

  const isConnected = Boolean(org.tiendanubeStoreId)
  const params = await searchParams
  const justConnected = params.connected === 'true'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="text-violet-400" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black tracking-tight text-zinc-100">Tienda Conectada</h1>
            {justConnected && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                ¡Conectada!
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Resumen de tu Tiendanube: ventas, stock crítico y carritos abandonados.
        </p>
      </div>

      {/* Content */}
      {!isConnected ? (
        <ConnectStoreCard organizationId={organizationId} />
      ) : (
        <Suspense fallback={<OverviewSkeleton />}>
          <TiendanubeOverview organizationId={organizationId} />
        </Suspense>
      )}
    </div>
  )
}

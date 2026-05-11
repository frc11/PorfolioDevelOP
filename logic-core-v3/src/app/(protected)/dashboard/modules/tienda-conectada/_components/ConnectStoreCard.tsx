'use client'

import { ShoppingBag, ArrowRight } from 'lucide-react'

export function ConnectStoreCard({ organizationId }: { organizationId: string }) {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto mt-8">
      <div
        className="flex flex-col items-center gap-6 px-8 py-12 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
        }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <ShoppingBag size={36} strokeWidth={1.5} className="text-violet-400" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black tracking-tight text-zinc-100">
            Conectá tu Tiendanube
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            Conectando tu tienda vas a ver en tiempo real: ventas del mes, ticket promedio,
            productos más vendidos, stock crítico y carritos abandonados.
          </p>
        </div>

        <a
          href={`/api/auth/tiendanube/start?orgId=${organizationId}`}
          className="group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:opacity-90"
          style={{
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.35)',
            color: '#c4b5fd',
          }}
        >
          <ShoppingBag size={15} strokeWidth={1.5} />
          Conectar mi tienda
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>

        <p className="max-w-xs text-xs leading-relaxed text-zinc-600">
          Vas a ser redirigido a Tiendanube para autorizar el acceso. Solo lectura — develOP
          no puede modificar ni cargar productos ni pedidos.
        </p>
      </div>

      {/* Feature preview */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ventas del mes', desc: 'Pedidos y facturación' },
          { label: 'Ticket promedio', desc: 'vs mes anterior' },
          { label: 'Stock crítico', desc: 'Productos por agotarse' },
          { label: 'Carritos abandonados', desc: 'Últimos 7 días' },
        ].map((f) => (
          <div
            key={f.label}
            className="flex flex-col gap-1 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-xs font-bold text-zinc-400">{f.label}</span>
            <span className="text-[11px] text-zinc-600">{f.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

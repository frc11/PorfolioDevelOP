'use client'

import { Bot, Globe, Lock, Sparkles, X, Zap, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { PageHeader } from '@/components/ui/PageHeader'
import { PREMIUM_MODULES_CATALOG } from '@/lib/data/premium-modules'
import { adminHoverCls } from '@/lib/hover'
import { buildShowroom } from '@/lib/modules/showroom'

import { MarcoDelPanel } from '../../MarcoDelPanel'
import { useReproduccion } from '../../reproduccion'
import { useRuedaAdentro } from '../../rueda'
import { ICONOS, NIVELES, TarjetaDeModulo, type ModuloDeLaVitrina } from './TarjetaDeModulo'

/**
 * [NOCTURNO] B · FEATURE 5 — «Pedí servicios nuevos a medida que los sumamos». Mis servicios del panel
 * (`/dashboard/services`): lo contratado (la tarjeta de servicio, COPIA de la de `services/page.tsx`, que trae un
 * `<Link>`), tus módulos, «Subí al Siguiente Nivel», los disponibles y los próximos. La vitrina sale de la lógica REAL:
 * el catálogo (`PREMIUM_MODULES_CATALOG`, IMPORTADO) clasificado por `buildShowroom` (IMPORTADO) contra los módulos del
 * negocio de ejemplo. Se piden módulos («Desbloquear», «Avisame cuando esté») y se ven sus detalles (COPIA de
 * `ServiceDetailModal.tsx`, que es un portal al `body`: acá, adentro del marco), sin precios.
 */
const MODULOS_DEL_NEGOCIO = new Map([['motor-resenas', 'ACTIVE' as const]])
const VITRINA = buildShowroom(
  PREMIUM_MODULES_CATALOG.map((m) => ({ ...m, id: m.slug })),
  MODULOS_DEL_NEGOCIO,
)
const aLaVitrina = (estado: ModuloDeLaVitrina['estado']) => (m: (typeof VITRINA.owned)[number]): ModuloDeLaVitrina => ({ slug: m.slug, name: m.name, shortDescription: m.shortDescription, longDescription: m.longDescription ?? m.shortDescription, tier: m.tier, iconName: m.iconName, accentColor: m.accentColor, estado })
const SECCIONES: readonly { readonly titulo: string; readonly modulos: readonly ModuloDeLaVitrina[] }[] = [
  { titulo: 'Tus módulos', modulos: VITRINA.owned.map(aLaVitrina('owned')) },
  { titulo: 'Disponibles', modulos: VITRINA.available.map(aLaVitrina('available')) },
  { titulo: 'Próximamente', modulos: VITRINA.comingSoon.map(aLaVitrina('coming_soon')) },
]
const TODOS = SECCIONES.flatMap((s) => s.modulos)
/** El título con degradé de la vitrina, como en `services/page.tsx` (en línea, como allá). */
const TITULO_CON_DEGRADE = { background: 'linear-gradient(90deg, #06b6d4 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } as const

/** Lo contratado por el negocio de ejemplo (los tipos de servicio y sus textos, los de `services/page.tsx`). */
const CONTRATADOS: readonly { readonly label: string; readonly description: string; readonly glowRgb: string; readonly Icon: LucideIcon; readonly haceDias: number }[] = [
  { label: 'Desarrollo Web', description: 'Diseño y desarrollo de sitios web, landing pages y aplicaciones web a medida con las últimas tecnologías.', glowRgb: '6,182,212', Icon: Globe, haceDias: 150 },
  { label: 'Inteligencia Artificial', description: 'Integración de modelos de lenguaje, asistentes inteligentes y soluciones de IA adaptadas a tu negocio.', glowRgb: '167,139,250', Icon: Bot, haceDias: 90 },
]

export default function Servicios(): React.JSX.Element {
  const r = useReproduccion()
  const [ahora] = useState(() => Date.now())
  const [detalle, setDetalle] = useState<string | null>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const elDetalle = TODOS.find((m) => m.slug === detalle)

  return (
    <MarcoDelPanel item="servicios" encima={elDetalle ? <DetalleDelModulo modulo={elDetalle} alCerrar={() => setDetalle(null)} /> : null}>
      <div ref={raiz} className="flex w-full flex-col gap-6">
        <PageHeader
          eyebrow="Mis servicios"
          title="Servicios contratados"
          description="Lo que tenés activo con develOP y los módulos disponibles para sumar."
          icon={Zap}
          action={
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">{CONTRATADOS.length} servicios activos</span>
            </div>
          }
        />
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">Contratados</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONTRATADOS.map((s) => (
              <ServicioContratado key={s.label} servicio={s} desde={new Date(ahora - s.haceDias * 86_400_000)} />
            ))}
          </div>
        </section>
        {SECCIONES.map((s, k) => (
          <div key={s.titulo} className="flex flex-col gap-6">
            {k === 1 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={17} className="shrink-0 text-cyan-400" aria-hidden />
                  <h2 className="text-xl font-black uppercase tracking-tight" style={TITULO_CON_DEGRADE}>
                    Subí al Siguiente Nivel
                  </h2>
                </div>
                <p className="pl-7 text-sm text-zinc-400">Potenciá tu negocio con nuestras soluciones premium exclusivas</p>
              </div>
            )}
            <section className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">{s.titulo}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.modulos.map((m, i) => (
                  <motion.div key={m.slug} initial={r.reducido ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.4 }}>
                    <TarjetaDeModulo modulo={m} alVerDetalle={setDetalle} interactivo reducido={r.reducido} />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>
    </MarcoDelPanel>
  )
}

/** Un servicio contratado (COPIA de `ServiceCard` de `services/page.tsx`; su «Ver detalles» era un `<Link>` a Mensajes). */
function ServicioContratado({ servicio: s, desde }: { readonly servicio: (typeof CONTRATADOS)[number]; readonly desde: Date }): React.JSX.Element {
  return (
    <div className={`group relative flex flex-col gap-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-6 shadow-xl ${adminHoverCls}`}>
      {/* [PASADA FINAL] B3 · el brillo era un `blur-[60px]`: un degradé radial da el mismo resplandor sin un filtro que se recalcula por cuadro. */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 transition-opacity duration-500 group-hover:opacity-50" style={{ background: `radial-gradient(closest-side, rgb(${s.glowRgb}), transparent)` }} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: `rgba(${s.glowRgb}, 0.1)`, border: `1px solid rgba(${s.glowRgb}, 0.2)`, color: `rgb(${s.glowRgb})`, boxShadow: `0 0 20px rgba(${s.glowRgb}, 0.15)` }}>
          <s.Icon size={24} aria-hidden />
        </div>
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Activo
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white">{s.label}</h3>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">Servicio Principal</p>
      </div>
      <p className="relative z-10 text-sm leading-6 text-zinc-400">{s.description}</p>
      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">Activo desde</p>
          <p className="mt-1 text-xs font-medium tabular-nums text-zinc-300">{desde.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Ver detalles</span>
      </div>
    </div>
  )
}

/** El detalle de un módulo (COPIA de `ServiceDetailModal.tsx`, adentro del marco y sin el precio). */
function DetalleDelModulo({ modulo: m, alCerrar }: { readonly modulo: ModuloDeLaVitrina; readonly alCerrar: () => void }): React.JSX.Element {
  const cerrar = useRef<HTMLButtonElement>(null)
  // [PASADA FINAL] B1 · el texto del detalle scrollea adentro sólo si tiene recorrido; si no, la rueda es de la página.
  const textoDelDetalle = useRuedaAdentro<HTMLDivElement>()
  useEffect(() => cerrar.current?.focus(), [])
  const Icon = ICONOS[m.iconName] ?? Bot
  const acento = m.accentColor
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070a]/80 p-4 sm:p-6"
      onClick={alCerrar}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          alCerrar()
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={`Detalle del módulo ${m.name}`} onClick={(e) => e.stopPropagation()} className="relative flex max-h-[88%] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0c1016]/95 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-40" style={{ background: `radial-gradient(closest-side, ${acento}, transparent)` }} />
        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${acento}1A`, border: `1px solid ${acento}33`, boxShadow: `0 0 16px ${acento}26`, color: acento }}>
              <Icon size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{NIVELES[m.tier]}</p>
              <h2 className="mt-0.5 text-lg font-semibold leading-snug text-white">{m.name}</h2>
              <span className={['mt-2 inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]', m.estado === 'coming_soon' ? 'border-amber-400/20 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/5 text-zinc-300'].join(' ')}>
                {m.estado === 'coming_soon' ? null : <Lock size={9} aria-hidden />}
                {m.estado === 'coming_soon' ? 'Próximamente' : 'Premium'}
              </span>
            </div>
          </div>
          <button ref={cerrar} type="button" onClick={alCerrar} aria-label="Cerrar detalle del módulo" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
            <X size={16} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <div ref={textoDelDetalle} className="relative z-10 flex-1 overflow-y-auto p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Descripción general</p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{m.longDescription}</p>
        </div>
        <div className="relative z-10 border-t border-white/10 p-6">
          <p className={`text-xs font-medium leading-6 ${m.estado === 'coming_soon' ? 'text-amber-200/90' : m.estado === 'owned' ? 'text-emerald-200/90' : 'text-zinc-300'}`}>
            {m.estado === 'coming_soon' ? 'Estamos preparando este módulo para el catálogo comercial. Te avisamos apenas esté disponible para contratar.' : m.estado === 'owned' ? 'Ya lo tenés activo en tu cuenta.' : 'Pedilo desde su tarjeta y te escribimos con todo el detalle.'}
          </p>
        </div>
      </div>
    </div>
  )
}

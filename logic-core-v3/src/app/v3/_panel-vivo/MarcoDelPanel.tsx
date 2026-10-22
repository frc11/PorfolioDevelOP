'use client'

import { Bot, FolderKanban, Gauge, Gift, Home, LifeBuoy, MessageSquare, Pause, Play, Settings, TrendingUp, Zap, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { NEGOCIO_DE_EJEMPLO, ROTULO_DE_EJEMPLO, type ItemDelPanel } from './catalogo'
import { useReproduccion } from './reproduccion'
import { useRuedaAdentro } from './rueda'

/**
 * [NOCTURNO] B · EL MARCO QUE SE VE COMO EL PANEL — la carcasa del panel de clientes, copiada (no importada) de
 * `components/dashboard/DashboardLayoutClient.tsx` (el fondo, los brillos de ambiente, la barra de arriba de vidrio y la
 * superficie del contenido) y `components/dashboard/SidebarNav.tsx` (las secciones de la barra lateral, sus íconos y el
 * ítem activo): la de verdad cierra sesión, lee las notificaciones y navega a `/dashboard/*` (server actions, `<Link>`).
 * Lleva siempre el rótulo «Ejemplo» y, si la demo se mueve sola, la barra de arriba tiene su botón de pausa (WCAG 2.2.2).
 * [RETOQUE PANEL] T1 · en su lugar: la barra lateral sólo marca dónde está (sin saltos entre demos) y el contenido scrollea
 * con la rueda. [PASADA FINAL] B1: sólo cuando tiene recorrido hacia donde va la rueda (`rueda.ts` decide `data-lenis-prevent`
 * en cada rueda); en el borde, o sin recorrido, la rueda es de la página, que sigue suave.
 */
/** El fondo del panel: la tarjeta lo usa para fundir los bordes con la sección. */
export const FONDO_DEL_PANEL = '#080a0c'

interface ItemDeLaBarra {
  readonly id: ItemDelPanel
  readonly rotulo: string
  readonly icono: LucideIcon
}

const SECCIONES: readonly { readonly rotulo: string; readonly items: readonly ItemDeLaBarra[] }[] = [
  {
    rotulo: 'General',
    items: [
      { id: 'inicio', rotulo: 'Inicio', icono: Home },
      { id: 'proyecto', rotulo: 'Mi proyecto', icono: FolderKanban },
      { id: 'resultados', rotulo: 'Resultados', icono: TrendingUp },
    ],
  },
  {
    rotulo: 'Servicios',
    items: [
      { id: 'servicios', rotulo: 'Mis servicios', icono: Zap },
      { id: 'chatbot', rotulo: 'Mi Chatbot', icono: Bot },
    ],
  },
  {
    rotulo: 'Comunicación',
    items: [
      { id: 'mensajes', rotulo: 'Mensajes', icono: MessageSquare },
      { id: 'soporte', rotulo: 'Soporte', icono: LifeBuoy },
    ],
  },
  {
    rotulo: 'Cuenta',
    items: [
      { id: 'plan', rotulo: 'Mi plan', icono: Gauge },
      { id: 'referidos', rotulo: 'Recomendá y ganá', icono: Gift },
      { id: 'cuenta', rotulo: 'Mi cuenta', icono: Settings },
    ],
  },
]

/** [RETOQUE PANEL] T1 · los brillos de ambiente, sin el velo claro de arriba y apagados en los bordes: el borde del panel es de
 *  un solo color, el que la tarjeta funde con la sección. */
const AMBIENTE = {
  background: [
    'radial-gradient(ellipse 85% 48% at 20% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)',
    'radial-gradient(ellipse 40% 34% at 100% 100%, rgba(16,185,129,0.05) 0%, transparent 64%)',
  ].join(', '),
  maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent), linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)',
  maskComposite: 'intersect',
} as const

const CLASE_DEL_ITEM = 'relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors'
const ITEM_ACTIVO = 'bg-cyan-500/10 text-cyan-400 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]'
const ITEM_QUIETO = 'text-zinc-400'

export function MarcoDelPanel({ item, conPausa = false, encima, children }: { readonly item: ItemDelPanel; readonly conPausa?: boolean; readonly encima?: React.ReactNode; readonly children: React.ReactNode }): React.JSX.Element {
  const r = useReproduccion()
  const contenido = useRuedaAdentro<HTMLDivElement>()
  const iniciales = NEGOCIO_DE_EJEMPLO.split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="relative flex h-full w-full overflow-hidden font-sans text-zinc-100 selection:bg-cyan-500/30" style={{ backgroundColor: FONDO_DEL_PANEL }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={AMBIENTE} />
      <nav aria-label="Panel (ejemplo)" className={cn('relative hidden w-[240px] shrink-0 flex-col gap-5 border-r border-white/10 px-3 py-5', r.conBarra && 'lg:flex')}>
        <p className="px-3 text-base font-black tracking-tight text-white">
          devel<span className="text-cyan-400">OP</span>
        </p>
        {SECCIONES.map((s) => (
          <div key={s.rotulo} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-medium tracking-tight text-zinc-500">{s.rotulo}</p>
            {s.items.map((i) => {
              const activo = i.id === item
              const Icono = i.icono
              return (
                <span key={i.id} aria-current={activo ? 'page' : undefined} className={cn(CLASE_DEL_ITEM, activo ? ITEM_ACTIVO : ITEM_QUIETO)}>
                  <Icono className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span className="truncate">{i.rotulo}</span>
                </span>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="relative flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cyan-400/30 bg-cyan-500/[0.12] text-xs font-semibold text-cyan-300">
              {iniciales}
            </span>
            <p className="truncate text-sm font-semibold text-zinc-200">{NEGOCIO_DE_EJEMPLO}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {conPausa && !r.reducido && (
              <button
                type="button"
                onClick={r.alternarPausa}
                aria-pressed={r.pausada}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.07] bg-zinc-800/40 px-3 text-xs text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                {r.pausada ? <Play className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
                <span className="sr-only sm:not-sr-only">{r.pausada ? 'Seguir' : 'Pausar'}</span>
              </button>
            )}
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">{ROTULO_DE_EJEMPLO}</span>
          </div>
        </header>
        <div ref={contenido} data-parte="contenido-del-panel" className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
          {children}
        </div>
      </div>
      {/* Lo que en el panel es un modal (un formulario, una vista): adentro del marco, no sobre toda la pantalla. */}
      {encima}
    </div>
  )
}

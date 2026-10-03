'use client'

import type { ChatbotLeadStatus } from '@prisma/client'
import { Ban, CheckCircle2, Clock, Flame, Mail, MessageSquare, Minus, Phone, PhoneCall, TrendingUp, XCircle, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { LeadWithScore } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'
import { intentLabel } from '@/modules/chatbot/lead-intent-labels'
import { OWNER_ACTION_STATUS, type OwnerLeadAction } from '@/modules/chatbot/lead-status-rules'

/**
 * [NOCTURNO] B · LA TARJETA DE UN LEAD — COPIA de `modules/chatbot/components/dashboard/BusinessLeadCard.tsx` (el
 * encabezado con «Nuevo», el estado, la clase en grande con su puntaje, «Qué quiere», el contacto y las acciones), con
 * `Card`, `Badge` y `Button` IMPORTADOS de `components/ui/`. Lo que cambia, y por qué: la tarjeta entera era un `<Link>`
 * al detalle (acá abre el detalle adentro de la demo); el teléfono y el mail eran `tel:` y `mailto:`, y WhatsApp abría
 * `wa.me` (acá son texto: los datos son de ejemplo); y las acciones de un toque — COPIA de `LeadStatusActions.tsx` —
 * guardaban con la server action `updateLeadStatus` (acá, estado local, con el mismo aviso y su «Deshacer»).
 */
export const ESTADO_DEL_LEAD: Record<ChatbotLeadStatus, { readonly variant: 'default' | 'warning' | 'success' | 'info' | 'danger' | 'brand'; readonly label: string }> = {
  NEW: { variant: 'warning', label: 'Sin contactar' },
  CONTACTED: { variant: 'info', label: 'Contactado' },
  IN_NEGOTIATION: { variant: 'brand', label: 'En negociación' },
  WON: { variant: 'success', label: 'Cliente' },
  LOST: { variant: 'default', label: 'Perdido' },
}

export const CLASE_DEL_LEAD: Record<'hot' | 'warm' | 'cold', { readonly icon: LucideIcon; readonly label: string; readonly sublabel: string; readonly containerClass: string; readonly iconClass: string; readonly textClass: string }> = {
  hot: { icon: Flame, label: 'Caliente', sublabel: 'Listo para llamar', containerClass: 'border-rose-500/30 bg-rose-500/10', iconClass: 'text-rose-400', textClass: 'text-rose-200' },
  warm: { icon: TrendingUp, label: 'Tibio', sublabel: 'Necesita un empujón', containerClass: 'border-amber-500/30 bg-amber-500/10', iconClass: 'text-amber-400', textClass: 'text-amber-200' },
  cold: { icon: Minus, label: 'Frío', sublabel: 'Baja prioridad', containerClass: 'border-sky-500/30 bg-sky-500/10', iconClass: 'text-sky-400', textClass: 'text-sky-200' },
}

/** «Hace …», como lo escribe el panel (`formatTimeAgo` de la tarjeta real). */
export function haceCuanto(fecha: Date): string {
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60_000)
  if (minutos < 1) return 'un momento'
  if (minutos < 60) return `${String(minutos)} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${String(horas)}h`
  const dias = Math.floor(horas / 24)
  return dias < 7 ? `${String(dias)} días` : `${String(Math.floor(dias / 7))} semanas`
}

export interface PropsDeLaTarjeta {
  readonly lead: LeadWithScore
  readonly estado: ChatbotLeadStatus
  readonly alCambiarEstado?: (siguiente: ChatbotLeadStatus) => void
  readonly alAbrir?: (id: string) => void
  readonly nuevo?: boolean
  readonly isDq?: boolean
}

export function TarjetaDeLead({ lead, estado, alCambiarEstado, alAbrir, nuevo = false, isDq = false }: PropsDeLaTarjeta): React.JSX.Element {
  const clase = !isDq && (lead.effectiveClassification === 'hot' || lead.effectiveClassification === 'warm' || lead.effectiveClassification === 'cold') ? CLASE_DEL_LEAD[lead.effectiveClassification] : null
  const resaltar = lead.effectiveClassification === 'hot' && estado === 'NEW'
  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }} className="relative">
      {resaltar && <span aria-hidden className="pointer-events-none absolute -inset-px animate-pulse rounded-2xl shadow-[0_0_24px_rgba(244,63,94,0.18)] ring-2 ring-rose-500/60 motion-reduce:animate-none" />}
      <Card variant={alAbrir ? 'interactive' : 'default'} padding="lg">
        {alAbrir && <button type="button" onClick={() => alAbrir(lead.id)} aria-label={`Ver detalle de ${lead.name ?? 'contacto'}`} className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400" />}
        <div className="pointer-events-none relative z-20">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* [RETOQUE PANEL] T1 · el nombre entero (el panel lo cortaba, «Sofí…»): baja de renglón y el «Nuevo» va atrás. */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="break-words text-base font-semibold text-zinc-100">{lead.name ?? 'Sin nombre'}</h3>
                {nuevo && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300" aria-label="Lead nuevo">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/70 motion-reduce:animate-none" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    </span>
                    Nuevo
                  </span>
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
                Hace {haceCuanto(lead.capturedAt)}
              </p>
            </div>
            {!isDq && <Badge variant={ESTADO_DEL_LEAD[estado].variant}>{ESTADO_DEL_LEAD[estado].label}</Badge>}
          </div>
          {clase ? (
            <div className={`mb-4 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${clase.containerClass}`} aria-label={`Nivel de interés: ${clase.label}${lead.effectiveScore != null ? `, ${String(lead.effectiveScore)} de 100` : ''}`}>
              <clase.icon className={`h-7 w-7 shrink-0 ${clase.iconClass}`} strokeWidth={1.5} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={`text-base font-semibold leading-tight ${clase.textClass}`}>{clase.label}</p>
                <p className="text-[11px] text-zinc-400">{clase.sublabel}</p>
              </div>
              {lead.effectiveScore != null && <span className="shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500" aria-hidden>{lead.effectiveScore}/100</span>}
            </div>
          ) : isDq ? (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-3 py-2.5" aria-label="Descartado por el bot">
              <Ban className="h-7 w-7 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-tight text-zinc-300">Descartado</p>
                <p className="text-[11px] text-zinc-500">No es una consulta comercial</p>
              </div>
            </div>
          ) : null}
          {lead.intent && (
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Qué quiere</p>
              <p className="text-sm text-zinc-300">{intentLabel(lead.intent)}</p>
            </div>
          )}
          <div className="mb-4 space-y-2">
            {lead.phone && (
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{lead.phone}</span>
              </p>
            )}
            {lead.email && (
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{lead.email}</span>
              </p>
            )}
          </div>
          {!isDq && (
            <div className="space-y-3 border-t border-white/[0.06] pt-4">
              {lead.phone && (
                <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  WhatsApp
                </span>
              )}
              <AccionesDelLead estado={estado} alCambiar={alCambiarEstado} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

const ACCIONES: readonly { readonly action: OwnerLeadAction; readonly label: string; readonly done: string; readonly icon: LucideIcon; readonly activeClass: string }[] = [
  { action: 'contacted', label: 'Lo contacté', done: 'Lo marcaste como contactado', icon: PhoneCall, activeClass: 'border-sky-400/40 bg-sky-400/15 text-sky-200 hover:bg-sky-400/20' },
  { action: 'sold', label: 'Vendido', done: 'Lo marcaste como vendido', icon: CheckCircle2, activeClass: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20' },
  { action: 'no_progress', label: 'No avanzó', done: 'Lo marcaste como que no avanzó', icon: XCircle, activeClass: 'border-zinc-500/40 bg-zinc-500/20 text-zinc-200 hover:bg-zinc-500/25' },
]

/** Las acciones de un toque (COPIA de `LeadStatusActions.tsx`), con estado local: el aviso dice que es de ejemplo. */
export function AccionesDelLead({ estado, alCambiar, size = 'sm' }: { readonly estado: ChatbotLeadStatus; readonly alCambiar?: (siguiente: ChatbotLeadStatus) => void; readonly size?: 'sm' | 'md' }): React.JSX.Element {
  const aplicar = (siguiente: ChatbotLeadStatus, done: string): void => {
    if (alCambiar === undefined || siguiente === estado) return
    const antes = estado
    alCambiar(siguiente)
    toast.success(`${done} (ejemplo)`, { action: { label: 'Deshacer', onClick: () => alCambiar(antes) } })
  }
  return (
    <div className="pointer-events-auto flex flex-wrap gap-2">
      {ACCIONES.map(({ action, label, done, icon: Icon, activeClass }) => {
        const destino = OWNER_ACTION_STATUS[action]
        const activa = estado === destino
        return alCambiar === undefined ? (
          <span key={action} className={cn('inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300', activa && activeClass)}>
            <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {label}
          </span>
        ) : (
          <Button key={action} type="button" variant="secondary" size={size} aria-pressed={activa} icon={<Icon className="h-4 w-4" strokeWidth={1.5} />} onClick={(e) => { e.stopPropagation(); aplicar(destino, done) }} className={cn('min-h-[44px]', activa && activeClass)}>
            {label}
          </Button>
        )
      })}
    </div>
  )
}

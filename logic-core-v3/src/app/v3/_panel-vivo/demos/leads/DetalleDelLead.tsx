'use client'

import type { ChatbotLeadStatus } from '@prisma/client'
import { AlertTriangle, ArrowLeft, Check, Clock, Compass, Mail, Megaphone, MessageSquare, Phone, Star, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'
import { categoryLabel } from '@/modules/chatbot/lead-detail-presentation'
import { intentLabel } from '@/modules/chatbot/lead-intent-labels'

import { Transcript } from '../chatbot/TablaDeConversaciones'
import type { LeadDeEjemplo } from './datos'
import { AccionesDelLead, CLASE_DEL_LEAD, ESTADO_DEL_LEAD, haceCuanto } from './TarjetaDeLead'

/**
 * [NOCTURNO] B · EL DETALLE DE UN LEAD — COPIA de `modules/chatbot/components/dashboard/LeadDetail.tsx` (la ficha con su
 * estado, su clase, qué le interesa, el contacto y las acciones; «Cómo llegó»; «Por qué está calificado así»; la charla),
 * con `Card` y `Badge` IMPORTADOS, `categoryLabel` e `intentLabel` IMPORTADOS de sus módulos puros. Allá es una página
 * (`/dashboard/chatbot/leads/[id]`) que guarda con `updateLeadStatus`; acá se abre adentro de la demo, con estado local.
 */
const DATO = 'flex min-h-[44px] items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300'
const SIN_DATO = 'flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-white/[0.06] px-3 py-2 text-sm text-zinc-600'

export function DetalleDelLead({ de, estado, alCambiarEstado, alVolver }: { readonly de: LeadDeEjemplo; readonly estado: ChatbotLeadStatus; readonly alCambiarEstado?: (s: ChatbotLeadStatus) => void; readonly alVolver?: () => void }): React.JSX.Element {
  const { lead } = de
  const isDq = lead.effectiveClassification === 'dq'
  const clase = lead.effectiveClassification === 'hot' || lead.effectiveClassification === 'warm' || lead.effectiveClassification === 'cold' ? CLASE_DEL_LEAD[lead.effectiveClassification] : null
  return (
    <div className="space-y-4">
      {alVolver && (
        <button type="button" onClick={alVolver} className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-cyan-400">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Volver a mis contactos
        </button>
      )}
      <Card padding="lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-zinc-100 sm:text-2xl">{lead.name ?? 'Sin nombre'}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
              Dejó sus datos hace {haceCuanto(lead.capturedAt)}
            </p>
          </div>
          {!isDq && <Badge variant={ESTADO_DEL_LEAD[estado].variant}>{ESTADO_DEL_LEAD[estado].label}</Badge>}
        </div>
        {clase && (
          <div className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${clase.containerClass} ${adminHoverCls}`} aria-label={`Nivel de interés: ${clase.label}${lead.effectiveScore != null ? `, ${String(lead.effectiveScore)} de 100` : ''}`}>
            <clase.icon className={`h-8 w-8 shrink-0 ${clase.iconClass}`} strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-semibold leading-tight ${clase.textClass}`}>{clase.label}</p>
              <p className="text-xs text-zinc-400">{clase.sublabel}</p>
            </div>
            {lead.effectiveScore != null && <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-xs font-medium tabular-nums text-zinc-500">{lead.effectiveScore}/100</span>}
          </div>
        )}
        <div className={cn('mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3', adminHoverCls)}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Qué le interesa</p>
            <Badge variant="default" size="xs">
              {categoryLabel(lead.category)}
            </Badge>
          </div>
          <p className="text-sm text-zinc-300">{lead.intent ? intentLabel(lead.intent) : 'Dejó sus datos'}</p>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {lead.phone ? (
            <p className={DATO}>
              <Phone className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
              <span className="truncate">{lead.phone}</span>
            </p>
          ) : (
            <p className={SIN_DATO}>
              <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>Sin teléfono</span>
            </p>
          )}
          {lead.email ? (
            <p className={DATO}>
              <Mail className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
              <span className="truncate">{lead.email}</span>
            </p>
          ) : (
            <p className={SIN_DATO}>
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>Sin email</span>
            </p>
          )}
        </div>
        {!isDq && (
          <div className="space-y-3 border-t border-white/[0.06] pt-4">
            {lead.phone && (
              <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
                <MessageSquare className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                WhatsApp con mensaje
              </span>
            )}
            <AccionesDelLead estado={estado} alCambiar={alCambiarEstado} size="md" />
          </div>
        )}
      </Card>
      <Card padding="lg" className={adminHoverCls}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">Cómo llegó</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato icono={Compass} rotulo="Origen" valor={de.origen} />
          <Dato icono={Megaphone} rotulo="Campaña" valor={de.campana ?? 'Sin campaña'} />
          <Dato icono={Clock} rotulo="Cuándo" valor={`Dejó sus datos hace ${haceCuanto(lead.capturedAt)}`} />
          <div className="min-w-0">
            <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Estaba viendo</dt>
            <dd className="mt-0.5 truncate font-mono text-xs text-zinc-400">{de.estabaViendo}</dd>
          </div>
        </dl>
      </Card>
      <Card padding="lg" className={adminHoverCls}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">{isDq ? 'Por qué fue descartado' : 'Por qué está calificado así'}</h3>
        <ul className="space-y-2">
          {lead.scoreExplanation.map((s) => {
            const Icono: LucideIcon = s.kind === 'combo' ? Star : s.kind === 'penalty' || s.kind === 'dq' ? AlertTriangle : Check
            return (
              <li key={s.key} className="flex items-start gap-2.5">
                <Icono className={`mt-0.5 h-4 w-4 shrink-0 ${s.points > 0 ? 'text-emerald-400' : 'text-amber-400'}`} strokeWidth={1.5} aria-hidden />
                <span className="flex-1 text-sm text-zinc-300">{s.label}</span>
                {s.kind !== 'dq' && <span className={`shrink-0 text-xs tabular-nums ${s.points > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.points > 0 ? `+${String(s.points)}` : String(s.points)}</span>}
              </li>
            )
          })}
        </ul>
      </Card>
      <Card padding="lg">
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">La conversación</h3>
        <Transcript mensajes={de.charla} escribiendo={false} />
      </Card>
    </div>
  )
}

function Dato({ icono: Icono, rotulo, valor }: { readonly icono: LucideIcon; readonly rotulo: string; readonly valor: string }): React.JSX.Element {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{rotulo}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-300">
        <Icono className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
        <span>{valor}</span>
      </dd>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Building2, CalendarDays, FileText, Sparkles, TrendingUp, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { updateLeadNotesAction, updateLeadStatusAction, type LeadStatus } from '@/lib/actions/leads'

type LeadType = 'external' | 'upsell'
type ViewMode = 'table' | 'kanban'
type TypeFilter = 'all' | 'external' | 'upsell'
type StatusFilter = 'all' | 'new' | 'progress' | 'closed'
type DateFilter = 'all' | 'today' | 'week' | 'month'

export interface CRMLead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  createdAt: string
  read: boolean
  leadStatus: LeadStatus
  leadNotes: string | null
  type: LeadType
  typeLabel: string
  serviceLabel: string
  convertHref: string | null
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const STATUS_STEPS: LeadStatus[] = ['NUEVO', 'CONTACTADO', 'NEGOCIANDO', 'CERRADO']
const KANBAN_COLUMNS: Array<{ key: LeadStatus; label: string }> = [
  { key: 'NUEVO', label: 'Nuevo' },
  { key: 'CONTACTADO', label: 'Contactado' },
  { key: 'NEGOCIANDO', label: 'Negociando' },
  { key: 'CERRADO', label: 'Cerrado' },
]

function statusConfig(status: LeadStatus) {
  switch (status) {
    case 'NUEVO':
      return {
        label: 'Nuevo',
        className: 'border-red-400/20 bg-red-400/10 text-red-200',
        pulse: true,
      }
    case 'CONTACTADO':
      return {
        label: 'Contactado',
        className: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
        pulse: false,
      }
    case 'NEGOCIANDO':
      return {
        label: 'Negociando',
        className: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        pulse: false,
      }
    case 'CERRADO':
      return {
        label: 'Cerrado',
        className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
        pulse: false,
      }
    default:
      return {
        label: 'Descartado',
        className: 'border-zinc-400/15 bg-zinc-400/10 text-zinc-300',
        pulse: false,
      }
  }
}

function typeConfig(type: LeadType) {
  if (type === 'upsell') {
    return {
      label: 'INTENTO DE UPSELL',
      className: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
      icon: Sparkles,
    }
  }

  return {
    label: 'CONTACTO EXTERNO',
    className: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    icon: TrendingUp,
  }
}

function formatRelativeDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function LeadsCRM({ initialLeads }: { initialLeads: CRMLead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredLeads = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const weekThreshold = new Date(startOfToday)
    weekThreshold.setDate(weekThreshold.getDate() - 6)
    const monthThreshold = new Date(startOfToday)
    monthThreshold.setDate(monthThreshold.getDate() - 29)

    return leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt)

      const matchesType =
        typeFilter === 'all' ? true : typeFilter === 'external' ? lead.type === 'external' : lead.type === 'upsell'

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'new'
            ? lead.leadStatus === 'NUEVO'
            : statusFilter === 'progress'
              ? lead.leadStatus === 'CONTACTADO' || lead.leadStatus === 'NEGOCIANDO'
              : lead.leadStatus === 'CERRADO' || lead.leadStatus === 'DESCARTADO'

      const matchesDate =
        dateFilter === 'all'
          ? true
          : dateFilter === 'today'
            ? leadDate >= startOfToday
            : dateFilter === 'week'
              ? leadDate >= weekThreshold
              : leadDate >= monthThreshold

      return matchesType && matchesStatus && matchesDate
    })
  }, [dateFilter, leads, statusFilter, typeFilter])

  const stats = useMemo(() => {
    const total = leads.length
    const external = leads.filter((lead) => lead.type === 'external').length
    const upsell = leads.filter((lead) => lead.type === 'upsell').length
    const closed = leads.filter((lead) => lead.leadStatus === 'CERRADO').length

    return {
      total,
      external,
      upsell,
      conversionRate: total === 0 ? 0 : Math.round((closed / total) * 100),
    }
  }, [leads])

  const updateLeadStatus = (leadId: string, nextStatus: LeadStatus) => {
    const previousLeads = leads

    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              leadStatus: nextStatus,
              read: nextStatus !== 'NUEVO',
            }
          : lead,
      ),
    )

    startTransition(async () => {
      const result = await updateLeadStatusAction({ id: leadId, leadStatus: nextStatus })

      if (!result.success) {
        setLeads(previousLeads)
        toast.error(result.error ?? 'No se pudo actualizar el lead.')
        return
      }

      toast.success(`Lead movido a ${statusConfig(nextStatus).label}.`)
    })
  }

  const saveNotes = () => {
    if (!selectedLead) return
    const previousLeads = leads

    setLeads((current) =>
      current.map((lead) =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              leadNotes: notesDraft.trim() || null,
            }
          : lead,
      ),
    )

    startTransition(async () => {
      const result = await updateLeadNotesAction({
        id: selectedLead.id,
        leadNotes: notesDraft,
      })

      if (!result.success) {
        setLeads(previousLeads)
        toast.error(result.error ?? 'No se pudo guardar la nota.')
        return
      }

      toast.success('Nota interna guardada.')
      setSelectedLead(null)
      setNotesDraft('')
    })
  }

  const openNotes = (lead: CRMLead) => {
    setSelectedLead(lead)
    setNotesDraft(lead.leadNotes ?? '')
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-white/8 p-6"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02) 65%, rgba(6,182,212,0.05))',
        }}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <TrendingUp size={14} />
              Leads & Upselling
            </div>
            <p className="max-w-2xl text-sm text-zinc-400">
              Vista comercial unificada para leads externos e intentos de upsell de clientes actuales.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total leads', value: stats.total },
              { label: 'Externos', value: stats.external },
              { label: 'Upsell', value: stats.upsell },
              { label: 'Tasa estimada', value: `${stats.conversionRate}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-white/8 p-5"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))' }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'external', label: 'Externos' },
              { key: 'upsell', label: 'Upsell' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTypeFilter(filter.key as TypeFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === filter.key
                    ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                    : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'new', label: 'Nuevos' },
              { key: 'progress', label: 'En proceso' },
              { key: 'closed', label: 'Cerrados' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key as StatusFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                    : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todo período' },
              { key: 'today', label: 'Hoy' },
              { key: 'week', label: 'Esta semana' },
              { key: 'month', label: 'Este mes' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setDateFilter(filter.key as DateFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateFilter === filter.key
                    ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                    : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-cyan-400/10 text-cyan-200' : 'text-zinc-400'
              }`}
            >
              Vista tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-cyan-400/10 text-cyan-200' : 'text-zinc-400'
              }`}
            >
              Vista Kanban
            </button>
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {filteredLeads.length === 0 ? (
          <motion.section
            key="empty"
            variants={itemVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[28px] border border-white/8 py-20 text-center"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))' }}
          >
            <p className="text-lg font-medium text-zinc-100">No hay leads para los filtros actuales.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Ajustá el rango o cambiá la vista para volver a revisar el pipeline.
            </p>
          </motion.section>
        ) : viewMode === 'table' ? (
          <motion.section
            key="table"
            variants={itemVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto rounded-[28px] border border-white/8"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            }}
          >
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.02]">
                  {['Tipo', 'Empresa / Nombre', 'Contacto', 'Servicio / Módulo', 'Fecha', 'Estado', 'Acciones'].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const typeBadge = typeConfig(lead.type)
                  const statusBadge = statusConfig(lead.leadStatus)
                  const TypeIcon = typeBadge.icon

                  return (
                    <tr key={lead.id} className="border-t border-white/5 align-top hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${typeBadge.className}`}>
                          <TypeIcon size={12} />
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-300">
                            {lead.company ? <Building2 size={16} /> : <UserRound size={16} />}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-100">{lead.company ?? lead.name}</p>
                            {lead.company && <p className="text-xs text-zinc-500">{lead.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        <p>{lead.email}</p>
                        {lead.phone && <p className="mt-1 text-xs text-zinc-500">{lead.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-200">{lead.serviceLabel}</p>
                        <p className="mt-1 line-clamp-2 max-w-xs text-xs text-zinc-500">{lead.message}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={12} />
                          {formatRelativeDate(lead.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadge.className}`}>
                          {statusBadge.pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-300" />}
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {lead.leadStatus === 'NUEVO' && (
                            <button
                              type="button"
                              onClick={() => updateLeadStatus(lead.id, 'CONTACTADO')}
                              disabled={isPending}
                              className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/15"
                            >
                              Marcar como contactado
                            </button>
                          )}
                          {lead.leadStatus !== 'CERRADO' && lead.leadStatus !== 'DESCARTADO' && lead.leadStatus !== 'NUEVO' && (
                            <button
                              type="button"
                              onClick={() =>
                                updateLeadStatus(
                                  lead.id,
                                  lead.leadStatus === 'CONTACTADO' ? 'NEGOCIANDO' : 'CERRADO',
                                )
                              }
                              disabled={isPending}
                              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15"
                            >
                              Avanzar etapa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openNotes(lead)}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-zinc-100"
                          >
                            Agregar nota
                          </button>
                          {lead.type === 'external' && lead.convertHref && (
                            <Link
                              href={lead.convertHref}
                              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/15"
                            >
                              Convertir en cliente
                            </Link>
                          )}
                        </div>
                        {lead.leadNotes && (
                          <p className="mt-3 max-w-sm text-xs text-zinc-500">
                            Nota: {lead.leadNotes}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.section>
        ) : (
          <motion.section
            key="kanban"
            variants={itemVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4 xl:grid-cols-4"
          >
            {KANBAN_COLUMNS.map((column) => (
              <div
                key={column.key}
                className="rounded-[26px] border border-white/8 p-4"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-100">{column.label}</p>
                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">
                    {filteredLeads.filter((lead) => lead.leadStatus === column.key).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredLeads
                    .filter((lead) => lead.leadStatus === column.key)
                    .map((lead) => {
                      const typeBadge = typeConfig(lead.type)
                      const TypeIcon = typeBadge.icon
                      const currentStepIndex = STATUS_STEPS.indexOf(lead.leadStatus)

                      return (
                        <motion.div
                          key={lead.id}
                          layout
                          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${typeBadge.className}`}>
                              <TypeIcon size={11} />
                              {lead.type === 'upsell' ? 'Upsell' : 'Externo'}
                            </span>
                            <span className="text-[11px] text-zinc-500">{formatRelativeDate(lead.createdAt)}</span>
                          </div>

                          <p className="mt-3 font-medium text-zinc-100">{lead.company ?? lead.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">{lead.serviceLabel}</p>
                          {lead.leadNotes && (
                            <p className="mt-3 line-clamp-3 text-xs text-zinc-400">{lead.leadNotes}</p>
                          )}

                          <div className="mt-4 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={currentStepIndex <= 0 || isPending}
                              onClick={() => updateLeadStatus(lead.id, STATUS_STEPS[currentStepIndex - 1])}
                              className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 disabled:opacity-30"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              disabled={currentStepIndex >= STATUS_STEPS.length - 1 || isPending}
                              onClick={() => updateLeadStatus(lead.id, STATUS_STEPS[currentStepIndex + 1])}
                              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-200 disabled:opacity-30"
                            >
                              →
                            </button>
                            <button
                              type="button"
                              onClick={() => openNotes(lead)}
                              className="ml-auto rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-300"
                            >
                              Nota
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {filteredLeads.filter((lead) => lead.leadStatus === 'DESCARTADO').length > 0 && (
        <motion.section
          variants={itemVariants}
          className="rounded-[28px] border border-white/8 p-5"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))' }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Descartados</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredLeads
              .filter((lead) => lead.leadStatus === 'DESCARTADO')
              .map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => updateLeadStatus(lead.id, 'NUEVO')}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300"
                >
                  {lead.company ?? lead.name} · Reabrir
                </button>
              ))}
          </div>
        </motion.section>
      )}

      <AnimatePresence>
        {selectedLead && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-[28px] border border-white/8 p-6"
              style={{ background: 'linear-gradient(145deg, rgba(8,10,12,0.96), rgba(15,19,24,0.94))' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Nota interna</p>
                  <h3 className="mt-2 text-xl font-semibold text-zinc-100">
                    {selectedLead.company ?? selectedLead.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="rounded-full border border-white/8 px-3 py-1 text-xs text-zinc-400"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-300">
                  <FileText size={14} />
                  {selectedLead.serviceLabel}
                </div>
                <p className="mt-3 leading-relaxed">{selectedLead.message}</p>
              </div>

              <textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                rows={6}
                placeholder="Ej: Llamar mañana, enviar propuesta, validar presupuesto..."
                className="mt-5 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400/30"
              />

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(['CONTACTADO', 'NEGOCIANDO', 'CERRADO', 'DESCARTADO'] as LeadStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300"
                    >
                      Mover a {statusConfig(status).label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={isPending}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 disabled:opacity-40"
                >
                  Guardar nota
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

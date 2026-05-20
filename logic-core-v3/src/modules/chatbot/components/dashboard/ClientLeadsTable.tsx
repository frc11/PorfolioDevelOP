'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Users } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import { BusinessLeadCard } from './BusinessLeadCard'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'

const STATUS_LABELS: Record<ChatbotLeadStatus, string> = {
  NEW: 'Sin contactar',
  CONTACTED: 'Contactado',
  IN_NEGOTIATION: 'En negociación',
  WON: 'Cliente',
  LOST: 'Perdido',
}

const FILTER_ACCENT: Record<ChatbotLeadStatus | 'all', string> = {
  all: 'border-zinc-700 bg-zinc-800 text-zinc-100',
  NEW: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  CONTACTED: 'border-blue-500/30 bg-blue-500/15 text-blue-300',
  IN_NEGOTIATION: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300',
  WON: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  LOST: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-400',
}

const FILTER_INACTIVE = 'border-white/[0.06] bg-transparent text-zinc-500 hover:text-zinc-300'

export function ClientLeadsTable({ leads: initialLeads }: { leads: ChatbotLead[] }) {
  const reduced = useReducedMotion()
  const [leads, setLeads] = useState<ChatbotLead[]>(initialLeads)
  const [filter, setFilter] = useState<ChatbotLeadStatus | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<ChatbotLead | null>(null)

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard/leads/recent')
        if (res.ok) {
          const { leads: fresh } = (await res.json()) as { leads: ChatbotLead[] }
          setLeads(fresh)
        }
      } catch {
        // polling failure is silent — stale data is acceptable
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Mi Chatbot"
        title="Mis leads"
        description="Personas que charlaron con tu bot y dejaron sus datos"
        icon={Users}
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tu bot todavía no capturó leads"
          description="Cuando alguien charle con tu chatbot y deje sus datos, vas a verlos acá. Compartí tu sitio para que empiecen a llegar."
          cta={{ label: 'Ver mi chatbot', href: '/dashboard/chatbot' }}
        />
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? FILTER_ACCENT.all : FILTER_INACTIVE}`}
            >
              Todos ({leads.length})
            </button>
            {(Object.keys(STATUS_LABELS) as ChatbotLeadStatus[]).map((key) => {
              const count = leads.filter((l) => l.status === key).length
              if (count === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${filter === key ? FILTER_ACCENT[key] : FILTER_INACTIVE}`}
                >
                  {STATUS_LABELS[key]} ({count})
                </button>
              )
            })}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`Sin leads en "${STATUS_LABELS[filter as ChatbotLeadStatus]}"`}
              description="Cambiá el filtro para ver otros contactos."
              variant="subtle"
              size="sm"
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={reduced ? undefined : staggerContainer}
              initial={reduced ? undefined : 'hidden'}
              animate={reduced ? undefined : 'visible'}
            >
              {filtered.map((lead) => (
                <motion.div key={lead.id} variants={reduced ? undefined : staggerItem}>
                  <BusinessLeadCard
                    lead={lead}
                    onClick={() => setSelectedLead(lead)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  )
}

function LeadDetailModal({ lead, onClose }: { lead: ChatbotLead; onClose: () => void }) {
  const [status, setStatus] = useState<ChatbotLeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.internalNotes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateLeadStatus({ leadId: lead.id, status, notes })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-100">{lead.name ?? 'Sin nombre'}</h3>
        <p className="mb-4 mt-0.5 text-xs text-zinc-500">
          {lead.email ?? '—'} · {lead.phone ?? 'Sin teléfono'}
        </p>

        {lead.message && (
          <div className="mb-4 rounded-xl bg-zinc-900 p-3">
            <p className="text-sm text-zinc-300">
              <span className="font-medium text-zinc-400">Mensaje: </span>
              {lead.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ChatbotLeadStatus)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            >
              {(Object.keys(STATUS_LABELS) as ChatbotLeadStatus[]).map((key) => (
                <option key={key} value={key}>
                  {STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600"
              placeholder="Tus notas privadas sobre este lead..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="min-h-[44px] rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

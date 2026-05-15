'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import type { ChatbotLead } from '@prisma/client'

const STATUS_COLORS = {
  NEW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  IN_NEGOTIATION: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  LOST: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
}

const STATUS_LABELS = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  IN_NEGOTIATION: 'En negociación',
  WON: 'Ganado',
  LOST: 'Perdido',
}

export function ClientLeadsTable({ leads }: { leads: ChatbotLead[] }) {
  const [filter, setFilter] = useState<keyof typeof STATUS_COLORS | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<ChatbotLead | null>(null)

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded border ${filter === 'all' ? 'bg-zinc-700 text-zinc-100' : 'border-zinc-800 text-zinc-400'}`}
        >
          Todos ({leads.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = leads.filter((l) => l.status === key).length
          return (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 text-xs rounded border ${filter === key ? STATUS_COLORS[key as keyof typeof STATUS_COLORS] : 'border-zinc-800 text-zinc-400'}`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 py-8 text-center">Sin leads en esta categoría.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((lead) => (
            <li
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 cursor-pointer hover:bg-zinc-900/60 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-zinc-100">{lead.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {lead.email} · {lead.phone ?? 'Sin teléfono'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {lead.intent} · {new Date(lead.updatedAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded border ${STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS]}`}
                >
                  {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de detalle */}
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
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.internalNotes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateLeadStatus({ leadId: lead.id, status: status as any, notes })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">{lead.name}</h3>
        <p className="text-xs text-zinc-500 mb-4">
          {lead.email} · {lead.phone ?? 'Sin teléfono'}
        </p>

        <p className="text-sm text-zinc-300 mb-4 p-3 bg-zinc-900 rounded">
          <strong>Mensaje:</strong> {lead.message}
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
              placeholder="Tus notas privadas sobre este lead..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-cyan-500 text-zinc-950 text-sm rounded font-medium disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

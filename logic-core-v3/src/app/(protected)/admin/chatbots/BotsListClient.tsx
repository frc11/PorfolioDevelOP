'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import Link from 'next/link'
import { Bot, MessageSquare, Users, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { BulkActionBar } from './BulkActionBar'
import type { BotListItem } from '@/modules/chatbot/server/admin/listAllBots'

interface Props {
  bots: BotListItem[]
}

// Solo presentación: el value de cada opción sigue siendo el slug crudo de la
// industria (el filtro no cambia); únicamente se humaniza la etiqueta visible
// ('medico_odontologico' → 'Medico Odontologico').
function formatIndustry(value: string): string {
  return value
    .split('_')
    .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export function BotsListClient({ bots }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const reduce = useReducedMotion()

  const filtered = useMemo(() => {
    return bots.filter(bot => {
      if (statusFilter === 'active' && !bot.isActive) return false
      if (statusFilter === 'inactive' && bot.isActive) return false
      if (industryFilter !== 'all' && bot.industry !== industryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          bot.botName.toLowerCase().includes(q) ||
          bot.slug.toLowerCase().includes(q) ||
          bot.organization.companyName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [bots, search, statusFilter, industryFilter])

  const industries = useMemo(
    () => Array.from(new Set(bots.map(b => b.industry))).filter(Boolean),
    [bots],
  )

  function toggleSelected(botId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(botId)) next.delete(botId)
      else next.add(botId)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(filtered.map(b => b.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Buscar por nombre, slug, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          aria-label="Filtrar por estado"
          className="sm:w-44"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          options={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'active', label: 'Solo activos' },
            { value: 'inactive', label: 'Solo pausados' },
          ]}
        />
        <Select
          aria-label="Filtrar por industria"
          className="sm:w-52"
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Todas las industrias' },
            ...industries.map(i => ({ value: i, label: formatIndustry(i) })),
          ]}
        />
      </div>

      <p className="text-xs text-zinc-500">
        Mostrando {filtered.length} de {bots.length}
      </p>

      <AnimatePresence>
        {selected.size > 0 && (
          <BulkActionBar
            key="bulk-bar"
            selectedIds={Array.from(selected)}
            totalBots={filtered.length}
            onSelectAll={selectAll}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={search || statusFilter !== 'all' ? 'Sin resultados' : 'Sin chatbots todavía'}
          description={
            search || statusFilter !== 'all'
              ? 'Probá ajustar los filtros'
              : 'Creá tu primer chatbot para empezar'
          }
          cta={
            !search && statusFilter === 'all'
              ? { label: 'Crear chatbot', href: '/admin/chatbots/new' }
              : undefined
          }
        />
      ) : (
        <motion.div
          key={`${statusFilter}-${industryFilter}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          variants={staggerContainer}
          initial={reduce ? false : 'hidden'}
          animate="visible"
        >
          {filtered.map(bot => (
            <BotCard
              key={bot.id}
              bot={bot}
              selected={selected.has(bot.id)}
              onToggleSelect={() => toggleSelected(bot.id)}
              reduce={Boolean(reduce)}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function BotCard({
  bot,
  selected,
  onToggleSelect,
  reduce,
}: {
  bot: BotListItem
  selected: boolean
  onToggleSelect: () => void
  reduce: boolean
}) {
  return (
    <motion.div
      className="relative"
      variants={staggerItem}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        onClick={e => e.stopPropagation()}
        className="absolute top-3 left-3 z-10 h-4 w-4 rounded border-white/20 bg-zinc-950 cursor-pointer accent-cyan-400"
      />
      <Link href={`/admin/chatbots/${bot.id}`}>
        <Card
          variant="interactive"
          padding="lg"
          className={selected ? 'ring-2 ring-cyan-400/40' : ''}
        >
          <div className="flex items-start justify-between mb-3 pl-6">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${bot.accentColor}20` }}
            >
              <Bot className="h-5 w-5" strokeWidth={1.5} style={{ color: bot.accentColor }} />
            </div>
            <Badge variant={bot.isActive ? 'success' : 'warning'}>
              {bot.isActive ? '● Activo' : '○ Pausado'}
            </Badge>
          </div>

          <h3 className="text-base font-semibold text-zinc-100 mb-1 pl-6">{bot.botName}</h3>
          <p className="text-xs text-zinc-500 mb-3 pl-6">
            {bot.organization.companyName} · {bot.industry}
          </p>
          <p className="text-xs font-mono text-zinc-600 mb-3 pl-6">/{bot.slug}</p>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                Charlas
              </p>
              <p className="text-sm font-medium text-zinc-200">{bot._count.conversations}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Users className="h-3 w-3" strokeWidth={1.5} />
                Leads
              </p>
              <p className="text-sm font-medium text-emerald-300">{bot._count.leads}</p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

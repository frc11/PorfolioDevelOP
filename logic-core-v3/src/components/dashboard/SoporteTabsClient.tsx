'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Book,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  HelpCircle,
  Zap,
} from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TicketCategory = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'

export interface TicketListItem {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage: string | null
}

const STATUS_MAP: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: 'Abierto', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  IN_PROGRESS: {
    label: 'En progreso',
    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  RESOLVED: {
    label: 'Resuelto',
    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
}

const PRIORITY_MAP: Record<TicketPriority, { label: string; cls: string; pulse?: boolean }> = {
  LOW: { label: 'Baja', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  MEDIUM: { label: 'Media', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  HIGH: { label: 'Alta', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  URGENT: { label: 'Urgente', cls: 'text-red-400 bg-red-500/10 border-red-500/20', pulse: true },
}

const CATEGORY_MAP: Record<TicketCategory, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Requerimiento',
  OTHER: 'Otro',
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'hace un momento'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

interface Props {
  activeTickets: TicketListItem[]
  resolvedTickets: TicketListItem[]
}

export function SoporteTabsClient({ activeTickets, resolvedTickets }: Props) {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
  const tickets = activeTab === 'active' ? activeTickets : resolvedTickets

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl">
        <div className="relative flex border-b border-white/5">
          {[
            { key: 'active' as const, label: 'Abiertos / En curso', count: activeTickets.length },
            { key: 'resolved' as const, label: 'Resueltos', count: resolvedTickets.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2.5 px-5 py-4 text-sm font-semibold transition-colors duration-200 sm:px-7 ${
                activeTab === tab.key ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="soporte-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.key
                    ? 'border-white/10 bg-white/10 text-white'
                    : 'border-white/5 bg-white/5 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'active' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {tickets.length === 0 ? (
                activeTab === 'active' ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 animate-ping rounded-full bg-emerald-500/20 opacity-20" />
                        <div className="h-32 w-32 animate-[ping_3s_linear_infinite] rounded-full bg-emerald-500/10 opacity-10" />
                      </div>
                      <div className="absolute h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md">
                        <CheckCircle2 size={32} className="text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-black uppercase italic tracking-tight text-white">
                      Todo en orden
                    </h3>
                    <p className="text-[14px] font-bold text-zinc-300">
                      No tenés tickets abiertos en este momento.
                    </p>
                    <p className="mt-1 text-[12px] font-medium italic text-zinc-500">
                      Cuando necesites soporte, abrí un ticket y lo revisamos en horario laboral.
                    </p>
                    <div className="mt-6 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Sin tickets abiertos
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center opacity-60">
                    <Headphones size={32} className="mb-4 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No tenés tickets resueltos todavía.</p>
                  </div>
                )
              ) : (
                <div className="divide-y divide-white/5">
                  {tickets.map((ticket, idx) => {
                    const priority = PRIORITY_MAP[ticket.priority]
                    const status = STATUS_MAP[ticket.status]

                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Link
                          href={`/dashboard/soporte/${ticket.id}`}
                          className="group block cursor-pointer p-5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${priority.cls}`}
                                >
                                  {priority.pulse && (
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                                  )}
                                  {priority.label}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${status.cls}`}
                                >
                                  {status.label}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                                  {CATEGORY_MAP[ticket.category]}
                                </span>
                                <span className="ml-auto font-mono text-[10px] text-zinc-600">
                                  #{ticket.id.slice(-6).toUpperCase()}
                                </span>
                              </div>

                              <h4 className="truncate pr-4 text-[15px] font-semibold text-zinc-200 transition-colors group-hover:text-white">
                                {ticket.title}
                              </h4>

                              {ticket.lastMessage && (
                                <p className="mt-1 truncate pr-8 text-xs leading-relaxed text-zinc-500">
                                  {ticket.lastMessage}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-zinc-600">
                                <Clock size={10} />
                                <span>{timeAgo(ticket.createdAt)}</span>
                                <span>•</span>
                                <span>
                                  {ticket.messageCount}{' '}
                                  {ticket.messageCount === 1 ? 'mensaje' : 'mensajes'}
                                </span>
                              </div>
                            </div>

                            <ChevronRight
                              size={18}
                              className="mt-1 shrink-0 text-zinc-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-400"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h4 className="mb-5 px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Recursos de Autogestión
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Guía del Usuario',
              Icon: Book,
              color: 'text-blue-400',
              glow: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]',
              desc: 'Aprendé a gestionar tu negocio.',
            },
            {
              label: 'Preguntas Frecuentes',
              Icon: HelpCircle,
              color: 'text-amber-400',
              glow: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.18)]',
              desc: 'Respuestas rápidas a dudas comunes.',
            },
            {
              label: 'Tips de Optimización',
              Icon: Zap,
              color: 'text-emerald-400',
              glow: 'hover:shadow-[0_0_24px_rgba(52,211,153,0.18)]',
              desc: 'Mejorá tu conversión hoy.',
            },
          ].map((item) => (
            <button
              key={item.label}
              className={`group flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#0c0e12]/40 p-6 text-left shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] ${item.glow}`}
            >
              <div
                className={`rounded-xl border border-white/5 bg-black/20 p-3 transition-transform group-hover:scale-110 ${item.color}`}
              >
                <item.Icon size={20} />
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold text-zinc-200 transition-colors group-hover:text-white">
                  {item.label}
                </span>
                <p className="text-[10px] leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

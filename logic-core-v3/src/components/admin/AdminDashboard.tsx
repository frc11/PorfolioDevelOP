'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  FolderKanban,
  HeadphonesIcon,
  Inbox,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AlertTone = 'danger' | 'warning'
type ActivityKind = 'ticket' | 'upsell' | 'approval' | 'lead'

type AlertItem = {
  id: string
  tone: AlertTone
  badge: string
  title: string
  description: string
  href: string
  actionLabel: string
}

type GrowthPoint = {
  dateLabel: string
  fullDate: string
  leads: number
  resolvedTickets: number
}

type ActivityItem = {
  id: string
  kind: ActivityKind
  title: string
  description: string
  href: string
  categoryLabel: string
  createdAt: string
}

interface AdminDashboardProps {
  userName: string
  currentDateLabel: string
  primaryCurrency: string
  mrr: number
  arr: number
  activeSubscriptionsCount: number
  activeClients: number
  projectsInProgress: number
  unresolvedTickets: number
  newLeadsThisWeek: number
  alerts: AlertItem[]
  growthData: GrowthPoint[]
  activityFeed: ActivityItem[]
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function CountUp({
  value,
  formatter,
}: {
  value: number
  formatter: (value: number) => string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const startedAt = performance.now()
    const duration = 1100

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{formatter(displayValue)}</>
}

function formatRelativeTime(dateIso: string) {
  const delta = new Date(dateIso).getTime() - Date.now()
  const minutes = Math.round(delta / 60000)
  const formatter = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute')
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour')
  }

  const days = Math.round(hours / 24)
  return formatter.format(days, 'day')
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    value?: number
    name?: string
    color?: string
    payload?: { fullDate?: string }
  }>
}) {
  if (!active || !payload?.length) return null

  const fullDate = payload[0]?.payload?.fullDate ?? ''

  return (
    <div
      className="min-w-44 rounded-2xl p-3 shadow-2xl"
      style={{
        background: 'rgba(8,10,12,0.94)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <p className="text-xs font-medium text-zinc-300">{fullDate}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={`${entry.name}`} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-zinc-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? '#fff' }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-zinc-100">{entry.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function toneStyles(tone: AlertTone) {
  if (tone === 'danger') {
    return {
      badge: {
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: 'rgb(252,165,165)',
      },
      accent: 'rgba(239,68,68,0.4)',
      buttonClass:
        'border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/15 hover:text-red-100',
    }
  }

  return {
    badge: {
      background: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.25)',
      color: 'rgb(253,224,71)',
    },
    accent: 'rgba(245,158,11,0.4)',
    buttonClass:
      'border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15 hover:text-amber-100',
  }
}

function activityConfig(kind: ActivityKind) {
  switch (kind) {
    case 'ticket':
      return {
        icon: HeadphonesIcon,
        dotClass: 'bg-red-400',
        iconClass: 'text-red-300',
        labelClass: 'text-red-200',
        labelBg: 'rgba(239,68,68,0.12)',
      }
    case 'upsell':
      return {
        icon: Sparkles,
        dotClass: 'bg-violet-400',
        iconClass: 'text-violet-300',
        labelClass: 'text-violet-200',
        labelBg: 'rgba(139,92,246,0.12)',
      }
    case 'approval':
      return {
        icon: CheckCircle2,
        dotClass: 'bg-emerald-400',
        iconClass: 'text-emerald-300',
        labelClass: 'text-emerald-200',
        labelBg: 'rgba(16,185,129,0.12)',
      }
    default:
      return {
        icon: Inbox,
        dotClass: 'bg-cyan-400',
        iconClass: 'text-cyan-300',
        labelClass: 'text-cyan-200',
        labelBg: 'rgba(6,182,212,0.12)',
      }
  }
}

export function AdminDashboard({
  userName,
  currentDateLabel,
  primaryCurrency,
  mrr,
  arr,
  activeSubscriptionsCount,
  activeClients,
  projectsInProgress,
  unresolvedTickets,
  newLeadsThisWeek,
  alerts,
  growthData,
  activityFeed,
}: AdminDashboardProps) {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: primaryCurrency,
        maximumFractionDigits: 0,
      }),
    [primaryCurrency],
  )

  const integerFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: 0,
      }),
    [],
  )

  const metricCards = [
    {
      label: 'Clientes activos',
      value: activeClients,
      icon: Users,
      accentClass: 'text-cyan-300',
      iconBg: 'rgba(6,182,212,0.14)',
      iconColor: 'rgb(103,232,249)',
    },
    {
      label: 'Proyectos en curso',
      value: projectsInProgress,
      icon: FolderKanban,
      accentClass: 'text-emerald-300',
      iconBg: 'rgba(16,185,129,0.14)',
      iconColor: 'rgb(110,231,183)',
    },
    {
      label: 'Tickets sin resolver',
      value: unresolvedTickets,
      icon: HeadphonesIcon,
      accentClass: unresolvedTickets > 0 ? 'text-red-300' : 'text-zinc-200',
      iconBg: unresolvedTickets > 0 ? 'rgba(239,68,68,0.14)' : 'rgba(113,113,122,0.14)',
      iconColor: unresolvedTickets > 0 ? 'rgb(252,165,165)' : 'rgb(212,212,216)',
    },
    {
      label: 'Leads nuevos esta semana',
      value: newLeadsThisWeek,
      icon: TrendingUp,
      accentClass: 'text-amber-300',
      iconBg: 'rgba(245,158,11,0.14)',
      iconColor: 'rgb(253,224,71)',
    },
  ]

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[28px] border border-white/8 p-6 sm:p-8"
        style={{
          background:
            'linear-gradient(145deg, rgba(7,15,18,0.95) 0%, rgba(10,14,18,0.84) 55%, rgba(6,182,212,0.08) 100%)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(circle at top left, rgba(6,182,212,0.15), transparent 38%)',
              'radial-gradient(circle at 80% 15%, rgba(255,255,255,0.08), transparent 26%)',
            ].join(', '),
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100"
                style={{
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                <ShieldAlert size={14} className="text-cyan-300" />
                Centro administrativo
              </span>
              <span className="text-xs text-zinc-500">{currentDateLabel}</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Buenos días, <span className="text-cyan-300">{userName}</span>
            </h1>
            <p className="mt-3 text-base text-zinc-300">
              Panel de control — develOP Agency
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div
              className="rounded-2xl border border-white/8 px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">MRR activo</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {currencyFormatter.format(mrr)}
              </p>
            </div>
            <div
              className="rounded-2xl border border-white/8 px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Suscripciones
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{activeSubscriptionsCount}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div
          className="relative overflow-hidden rounded-[28px] border border-cyan-400/15 p-6 xl:col-span-7"
          style={{
            background:
              'linear-gradient(145deg, rgba(7,18,22,0.96) 0%, rgba(8,10,12,0.94) 55%, rgba(6,182,212,0.08) 100%)',
            boxShadow: '0 0 0 1px rgba(6,182,212,0.04), 0 0 55px rgba(6,182,212,0.12)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.26), transparent 70%)' }}
          />

          <div className="relative flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                  Ingreso recurrente mensual
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  <CountUp value={mrr} formatter={(value) => currencyFormatter.format(value)} />
                </p>
                <p className="mt-3 text-sm text-zinc-400">
                  Basado en {activeSubscriptionsCount} suscripciones activas
                </p>
              </div>

              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-cyan-100"
                style={{
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                <TrendingUp size={14} className="text-cyan-300" />
                +12% vs mes anterior
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Wallet size={16} className="text-cyan-300" />
              Flujo consolidado de ingresos mensuales del portfolio activo
            </div>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[28px] border border-emerald-400/15 p-6 xl:col-span-5"
          style={{
            background:
              'linear-gradient(145deg, rgba(6,14,11,0.95) 0%, rgba(8,10,12,0.94) 60%, rgba(16,185,129,0.08) 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 top-4 h-36 w-36 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.24), transparent 70%)' }}
          />

          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/75">
              Proyección anual
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <CountUp value={arr} formatter={(value) => currencyFormatter.format(value)} />
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              ARR estimado con el nivel actual de contratos mensuales
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {metricCards.map((card) => {
          const Icon = card.icon

          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              className="rounded-[26px] border border-white/8 p-5"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: card.iconBg }}
                >
                  <Icon size={18} style={{ color: card.iconColor }} />
                </div>

                <p className={`text-4xl font-semibold tracking-tight ${card.accentClass}`}>
                  <CountUp value={card.value} formatter={(value) => integerFormatter.format(value)} />
                </p>
              </div>

              <p className="mt-5 text-sm text-zinc-400">{card.label}</p>
            </motion.div>
          )
        })}
      </motion.section>

      {alerts.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="rounded-[28px] border border-white/8 p-6"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))',
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Requiere atención
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Alertas críticas para el equipo
              </h2>
            </div>
            <p className="text-sm text-zinc-500">
              {alerts.length} focos operativos con acción recomendada
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {alerts.map((alert) => {
              const styles = toneStyles(alert.tone)

              return (
                <motion.div
                  key={alert.id}
                  whileHover={{ x: 3, transition: { duration: 0.16 } }}
                  className="rounded-[24px] border border-white/6 p-4"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    boxShadow: `inset 3px 0 0 ${styles.accent}`,
                  }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={styles.badge}
                      >
                        {alert.badge}
                      </span>
                      <h3 className="mt-3 text-base font-semibold text-white">{alert.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{alert.description}</p>
                    </div>

                    <Link
                      href={alert.href}
                      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${styles.buttonClass}`}
                    >
                      {alert.actionLabel}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-white/8 p-6"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02) 65%, rgba(6,182,212,0.04))',
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              Crecimiento 30 días
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Leads nuevos vs tickets resueltos
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Nuevos leads por día
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Tickets resueltos por día
            </span>
          </div>
        </div>

        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(161,161,170,0.85)', fontSize: 11 }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(161,161,170,0.85)', fontSize: 11 }}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} labelFormatter={(value) => `${value}`} />
              <Legend
                verticalAlign="top"
                height={24}
                formatter={(value) => (
                  <span className="text-xs text-zinc-400">
                    {value === 'Nuevos leads' ? 'Nuevos leads' : 'Tickets resueltos'}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="leads"
                name="Nuevos leads"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#22d3ee', stroke: '#083344', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="resolvedTickets"
                name="Tickets resueltos"
                stroke="#34d399"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#34d399', stroke: '#052e16', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="rounded-[28px] border border-white/8 p-6"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01))',
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              Actividad global
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Feed operativo en tiempo real</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/tickets"
              className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
            >
              Ver todo Tickets
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
            >
              Ver todo Leads
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
            >
              Ver todo Proyectos
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {activityFeed.length === 0 ? (
            <div className="flex items-center justify-center rounded-[24px] border border-dashed border-white/10 px-4 py-16 text-sm text-zinc-500">
              Sin actividad registrada por el momento.
            </div>
          ) : (
            <div className="space-y-4">
              {activityFeed.map((item, index) => {
                const config = activityConfig(item.kind)
                const Icon = config.icon

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                    className="relative flex gap-4 rounded-[24px] border border-white/6 p-4"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${config.iconClass}`}
                        style={{ background: config.labelBg }}
                      >
                        <Icon size={17} />
                      </div>
                      {index < activityFeed.length - 1 && (
                        <div className="mt-3 h-full w-px bg-white/8" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.labelClass}`}
                            style={{ background: config.labelBg }}
                          >
                            {item.categoryLabel}
                          </span>
                          <span className="text-xs text-zinc-500">{formatRelativeTime(item.createdAt)}</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-zinc-100">{item.title}</p>
                        <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                      </div>

                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 self-start rounded-full border border-white/8 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-cyan-400/30 hover:text-cyan-200"
                      >
                        Abrir
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  )
}

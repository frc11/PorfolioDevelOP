import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { CalendarDays, MessageCircle, Copy, ExternalLink, Clock, XCircle } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { isModuleActive } from '@/lib/modules/check-activation'
import { getCalSummary, type CalBooking } from '@/lib/integrations/cal-com'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── ConnectAgendaCard ────────────────────────────────────────────────────────

function ConnectAgendaCard() {
  return (
    <div
      className="rounded-2xl p-8 text-center max-w-md mx-auto"
      style={{
        background: 'rgba(16,185,129,0.05)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(16,185,129,0.15)',
      }}
    >
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
      >
        <CalendarDays size={24} strokeWidth={1.5} className="text-emerald-400" />
      </div>
      <h2 className="text-base font-black tracking-tight text-zinc-100">Tu agenda en construcción</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        develOP se encarga de configurar tu sistema de reservas con tus horarios, servicios y precios.
        Una vez listo vas a poder ver todos tus turnos desde acá.
      </p>
      <a
        href="/dashboard/messages?context=agenda"
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/20"
      >
        <MessageCircle size={13} strokeWidth={1.5} />
        Hablar con mi equipo
      </a>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  color: string
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={13} strokeWidth={1.5} style={{ color }} />
        </div>
      </div>
      <span className="text-2xl font-black tracking-tight text-zinc-100">{value}</span>
    </div>
  )
}

// ─── BookingItem ──────────────────────────────────────────────────────────────

function BookingItem({ booking }: { booking: CalBooking }) {
  const start = new Date(booking.startTime)
  const end = new Date(booking.endTime)
  const day = start.getDate()
  const month = MONTHS[start.getMonth()]
  const firstAttendee = booking.attendees[0]

  return (
    <div
      className="flex items-stretch gap-4 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Date block */}
      <div
        className="flex w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg py-2"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <span className="text-xl font-black leading-none text-emerald-300">{day}</span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">{month}</span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center gap-1 min-w-0">
        <span className="text-sm font-bold text-zinc-200 truncate">{booking.eventTypeName}</span>
        {firstAttendee && (
          <span className="text-xs text-zinc-500 truncate">{firstAttendee.name}</span>
        )}
      </div>

      {/* Time */}
      <div className="flex flex-shrink-0 items-center gap-1.5 text-xs text-zinc-500">
        <Clock size={11} strokeWidth={1.5} />
        <span className="font-medium">
          {formatTime(start)} – {formatTime(end)}
        </span>
      </div>
    </div>
  )
}

// ─── EmbedPreview ─────────────────────────────────────────────────────────────

function EmbedPreview({ embedUrl, username }: { embedUrl: string; username: string }) {
  const shareLink = `https://cal.com/${username}`

  return (
    <div
      className="flex flex-col gap-0 overflow-hidden rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex-shrink-0">
            Tu link
          </span>
          <span className="truncate text-xs text-zinc-400 font-medium">{shareLink}</span>
          <CopyLinkButton link={shareLink} />
        </div>
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
        >
          <ExternalLink size={11} strokeWidth={1.5} />
          Abrir
        </a>
      </div>

      {/* Iframe */}
      <iframe
        src={embedUrl}
        className="w-full"
        style={{ height: 500, border: 'none' }}
        title="Agenda de reservas"
        loading="lazy"
      />
    </div>
  )
}

// CopyLinkButton is a client component — we inline it as a server-compatible anchor
// with a data attribute; for full copy functionality a tiny 'use client' wrapper is ideal
// but keeping sprint small: link copy via native share or manual copy from URL bar.
function CopyLinkButton({ link }: { link: string }) {
  return (
    <a
      href={`data:text/plain,${encodeURIComponent(link)}`}
      download="link.txt"
      title="Copiar link"
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-white/10 text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
    >
      <Copy size={11} strokeWidth={1.5} />
    </a>
  )
}

// ─── AgendaOverview ───────────────────────────────────────────────────────────

async function AgendaOverview({
  organizationId,
  embedUrl,
  username,
}: {
  organizationId: string
  embedUrl: string
  username: string
}) {
  const summary = await getCalSummary(organizationId)

  if (!summary) {
    return (
      <div
        className="rounded-xl px-5 py-12 text-center"
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="text-sm text-zinc-500">
          No se pudo cargar la información de tu agenda. Intentá de nuevo en unos minutos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Esta semana"
          value={summary.thisWeekTotal}
          icon={CalendarDays}
          color="#10b981"
        />
        <StatCard
          label="Este mes"
          value={summary.thisMonthTotal}
          icon={CalendarDays}
          color="#06b6d4"
        />
        <StatCard
          label="Cancelados"
          value={summary.cancelledThisMonth}
          icon={XCircle}
          color="#f87171"
        />
      </div>

      {/* Upcoming bookings */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Próximos turnos
        </h2>
        {summary.upcomingBookings.length === 0 ? (
          <div
            className="rounded-xl px-5 py-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-sm text-zinc-600">Sin turnos próximos todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {summary.upcomingBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* Embed */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Tu link de reservas
        </h2>
        <EmbedPreview embedUrl={embedUrl} username={username} />
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>
      <div
        className="h-48 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      />
      <div
        className="h-[540px] rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AgendaInteligentePage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const isActive = await isModuleActive(organizationId, 'agenda-inteligente')
  if (!isActive) redirect('/dashboard')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { calComApiKey: true, calComUsername: true, calComEmbedUrl: true },
  })
  if (!org) redirect('/login')

  const isConnected = Boolean(org.calComApiKey)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <CalendarDays size={18} strokeWidth={1.5} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-zinc-100">Agenda Inteligente</h1>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Tus reservas, turnos y métricas de ocupación en un solo lugar.
        </p>
      </div>

      {!isConnected ? (
        <ConnectAgendaCard />
      ) : (
        <Suspense fallback={<OverviewSkeleton />}>
          <AgendaOverview
            organizationId={organizationId}
            embedUrl={org.calComEmbedUrl ?? `https://cal.com/${org.calComUsername ?? ''}`}
            username={org.calComUsername ?? ''}
          />
        </Suspense>
      )}
    </div>
  )
}

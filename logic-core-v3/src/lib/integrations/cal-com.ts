import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const API_BASE = 'https://api.cal.com/v1'

export type CalBooking = {
  id: number
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED'
  attendees: Array<{ name: string; email: string; phone?: string }>
  eventTypeName: string
}

export type CalSummary = {
  upcomingBookings: CalBooking[]
  thisWeekTotal: number
  thisMonthTotal: number
  cancelledThisMonth: number
}

async function getApiKey(organizationId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { calComApiKey: true },
  })
  return org?.calComApiKey ?? null
}

export async function getCalSummary(organizationId: string): Promise<CalSummary | null> {
  return unstable_cache(
    async () => fetchCalSummary(organizationId),
    ['cal-summary', organizationId],
    { revalidate: 600, tags: [`cal:${organizationId}`] },
  )()
}

async function fetchCalSummary(organizationId: string): Promise<CalSummary | null> {
  const apiKey = await getApiKey(organizationId)
  if (!apiKey) return null

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const res = await fetch(`${API_BASE}/bookings?apiKey=${apiKey}`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) {
      console.error('[Cal.com] fetch error:', res.status)
      return null
    }

    const data = await res.json()
    const allBookings: unknown[] = (data as { bookings?: unknown[] }).bookings ?? []

    const bookings: CalBooking[] = (allBookings as Array<{
      id: number
      title: string
      description?: string | null
      startTime: string
      endTime: string
      status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED'
      attendees?: Array<{ name: string; email: string; phone?: string }>
      eventType?: { title?: string }
    }>).map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description ?? null,
      startTime: new Date(b.startTime),
      endTime: new Date(b.endTime),
      status: b.status,
      attendees: (b.attendees ?? []).map((a) => ({
        name: a.name,
        email: a.email,
        phone: a.phone,
      })),
      eventTypeName: b.eventType?.title ?? 'Reunión',
    }))

    const upcoming = bookings
      .filter((b) => b.startTime > now && b.status === 'ACCEPTED')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 10)

    const thisWeek = bookings.filter(
      (b) => b.startTime >= weekAgo && b.startTime < now && b.status === 'ACCEPTED',
    ).length

    const thisMonth = bookings.filter(
      (b) => b.startTime >= monthAgo && b.startTime < now && b.status === 'ACCEPTED',
    ).length

    const cancelledThisMonth = bookings.filter(
      (b) => b.startTime >= monthAgo && b.status === 'CANCELLED',
    ).length

    return {
      upcomingBookings: upcoming,
      thisWeekTotal: thisWeek,
      thisMonthTotal: thisMonth,
      cancelledThisMonth,
    }
  } catch (err) {
    console.error('[Cal.com] error:', err)
    return null
  }
}

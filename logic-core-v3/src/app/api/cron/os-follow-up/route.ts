import { LeadStatus, NotificationType, Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'
const CRON_MARKER_PREFIX = '[os-follow-up]'

type PendingLead = {
  id: string
  businessName: string
  status: LeadStatus
  reactivateAt: Date | null
  activities: Array<{
    createdAt: Date
  }>
}

function getArgentinaDateParts(date: Date): {
  year: string
  month: string
  day: string
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Could not resolve Argentina date parts')
  }

  return { year, month, day }
}

function getArgentinaDayKey(date: Date): string {
  const { year, month, day } = getArgentinaDateParts(date)
  return `${year}-${month}-${day}`
}

function getArgentinaDayBounds(date: Date): {
  startOfDay: Date
  endOfDay: Date
} {
  const { year, month, day } = getArgentinaDateParts(date)

  return {
    startOfDay: new Date(`${year}-${month}-${day}T00:00:00.000-03:00`),
    endOfDay: new Date(`${year}-${month}-${day}T23:59:59.999-03:00`),
  }
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ARGENTINA_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatLastContact(date: Date | null): string {
  if (!date) {
    return 'Sin contacto'
  }

  return new Intl.DateTimeFormat('es-AR', {
    timeZone: ARGENTINA_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function statusLabel(status: LeadStatus): string {
  switch (status) {
    case LeadStatus.PROSPECTO:
      return 'Prospecto'
    case LeadStatus.DEMO_ENVIADA:
      return 'Demo enviada'
    case LeadStatus.VIO_VIDEO:
      return 'Vio video'
    case LeadStatus.RESPONDIO:
      return 'Respondio'
    case LeadStatus.CALL_AGENDADA:
      return 'Call agendada'
    case LeadStatus.CERRADO:
      return 'Cerrado'
    case LeadStatus.PERDIDO:
      return 'Perdido'
    case LeadStatus.POSTERGADO:
      return 'Postergado'
  }
}

function isReactivationLead(lead: PendingLead, endOfDay: Date): boolean {
  return (
    lead.status === LeadStatus.POSTERGADO &&
    lead.reactivateAt !== null &&
    lead.reactivateAt.getTime() <= endOfDay.getTime()
  )
}

function buildTelegramMessage(leads: PendingLead[], today: Date, endOfDay: Date): string {
  const lines = leads.map((lead) => {
    const lastContactAt = lead.activities[0]?.createdAt ?? null

    if (isReactivationLead(lead, endOfDay)) {
      return `🔄 <b>${escapeHtml(lead.businessName)}</b> — Se reactiva hoy`
    }

    return `• <b>${escapeHtml(lead.businessName)}</b> — ${escapeHtml(
      statusLabel(lead.status)
    )} — Ultimo contacto: ${escapeHtml(formatLastContact(lastContactAt))}`
  })

  return [
    `🔔 <b>Follow-ups pendientes — ${escapeHtml(formatDisplayDate(today))}</b>`,
    '',
    ...lines,
    '',
    `Total: <b>${leads.length}</b> leads pendientes`,
  ].join('\n')
}

function getProvidedCronSecret(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice('Bearer '.length).trim()
  }

  return cronHeader ?? null
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = getProvidedCronSecret(request)

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!telegramBotToken || !telegramChatId) {
    return NextResponse.json(
      { ok: false, error: 'Telegram is not configured' },
      { status: 500 }
    )
  }

  try {
    const now = new Date()
    const { startOfDay, endOfDay } = getArgentinaDayBounds(now)
    const dayKey = getArgentinaDayKey(now)
    const markerTitle = `${CRON_MARKER_PREFIX} ${dayKey}`

    const [existingMarker, leads] = await Promise.all([
      prisma.notification.findFirst({
        where: {
          title: markerTitle,
        },
        select: {
          id: true,
        },
      }),
      prisma.osLead.findMany({
        where: {
          OR: [
            {
              nextFollowUpAt: {
                lte: endOfDay,
              },
              status: {
                notIn: [LeadStatus.CERRADO, LeadStatus.PERDIDO],
              },
            },
            {
              status: LeadStatus.POSTERGADO,
              reactivateAt: {
                lte: endOfDay,
              },
            },
          ],
        },
        select: {
          id: true,
          businessName: true,
          status: true,
          reactivateAt: true,
          activities: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: [
          {
            reactivateAt: 'asc',
          },
          {
            nextFollowUpAt: 'asc',
          },
          {
            updatedAt: 'desc',
          },
        ],
      }),
    ])

    if (leads.length === 0) {
      return NextResponse.json({ ok: true, sent: false, reason: 'no_pending_leads' })
    }

    if (existingMarker) {
      return NextResponse.json({ ok: true, sent: false, reason: 'already_sent_today' })
    }

    const markerUser =
      (await prisma.user.findFirst({
        where: {
          role: Role.SUPER_ADMIN,
        },
        select: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })) ??
      (await prisma.user.findFirst({
        select: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }))

    if (!markerUser) {
      return NextResponse.json(
        { ok: false, error: 'No user available for cron idempotency marker' },
        { status: 500 }
      )
    }

    const message = buildTelegramMessage(leads, now, endOfDay)
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!telegramResponse.ok) {
      const telegramError = await telegramResponse.text()
      console.error('[cron os-follow-up] telegram error:', telegramError)

      return NextResponse.json(
        { ok: false, error: 'Telegram send failed' },
        { status: 500 }
      )
    }

    await prisma.notification.create({
      data: {
        userId: markerUser.id,
        type: NotificationType.INFO,
        title: markerTitle,
        message: `OS follow-up digest sent for ${dayKey}`,
        actionUrl: '/admin/os/leads',
        read: true,
        createdAt: startOfDay,
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      ok: true,
      sent: true,
      total: leads.length,
    })
  } catch (error) {
    console.error('[cron os-follow-up] execution error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

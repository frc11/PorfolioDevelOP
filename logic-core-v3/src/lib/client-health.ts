const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

export function estimateLastLoginAt(sessionExpires: Date | null | undefined) {
  if (!sessionExpires) return null
  return new Date(sessionExpires.getTime() - SESSION_MAX_AGE_MS)
}

export function daysSince(date: Date | null | undefined, now = new Date()) {
  if (!date) return null
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)))
}

export function getLastConnectionTone(days: number | null) {
  if (days === null) return 'danger' as const
  if (days < 7) return 'success' as const
  if (days <= 30) return 'warning' as const
  return 'danger' as const
}

export function getHealthScore(input: {
  recentLogin: boolean
  unreadMessages: number
  openTickets: number
  hasActiveSubscription: boolean
  recentApproval: boolean
}) {
  let score = 0

  if (input.recentLogin) score += 2
  if (input.unreadMessages > 0) score -= 1
  if (input.openTickets > 0) score -= 1
  if (input.hasActiveSubscription) score += 2
  if (input.recentApproval) score += 1

  return Math.max(1, Math.min(5, score))
}

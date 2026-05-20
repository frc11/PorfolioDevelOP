'use client'

import { ActivityLog } from '@/modules/chatbot/components/admin/ActivityLog'
import type { MappedEvent } from '../BotDetailClient'

interface Props {
  slug: string
  initialEvents: MappedEvent[]
}

export function ActivityTab({ slug, initialEvents }: Props) {
  return <ActivityLog slug={slug} initialEvents={initialEvents} />
}

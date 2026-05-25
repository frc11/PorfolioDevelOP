import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChatbotEmbed } from '@/modules/chatbot/components/embed/ChatbotEmbed'

export const dynamic = 'force-dynamic'

// viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
// non-zero values on notched iPhones — without it, the bubble & footer
// can sit under the home indicator. interactiveWidget=resizes-content lets
// the virtual keyboard reflow the layout (paired with 100dvh inside the
// iframe).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ theme?: string }>
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { theme } = await searchParams

  const bot = await prisma.botConfig.findUnique({
    where: { slug },
    select: { isActive: true },
  })

  // 404 only if the bot doesn't exist. A paused bot (isActive=false) still
  // renders ChatbotEmbed — the component reads `paused` from /config (B8.3)
  // and shows the WhatsApp degraded card instead of vanishing with a 404.
  if (!bot) notFound()

  return (
    <ChatbotEmbed
      slug={slug}
      theme={theme === 'light' ? 'light' : 'dark'}
    />
  )
}

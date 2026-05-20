import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChatbotEmbed } from '@/modules/chatbot/components/embed/ChatbotEmbed'

export const dynamic = 'force-dynamic'

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

  if (!bot || !bot.isActive) notFound()

  return (
    <ChatbotEmbed
      slug={slug}
      theme={theme === 'light' ? 'light' : 'dark'}
    />
  )
}

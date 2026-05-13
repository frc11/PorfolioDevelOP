import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BotConfigEditor } from '@/modules/chatbot/components/admin/BotConfigEditor'
import type { BotConfigInput } from '@/modules/chatbot/server/admin/saveBotConfig'

export default async function BotConfigPage() {
  const session = await auth()

  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard') // Fallback to safe area if not authorized
  }

  const bot = await prisma.botConfig.findUnique({ where: { slug: 'develop' } })
  if (!bot) {
    return <div className="p-8 text-red-400">Bot not found.</div>
  }

  const initial: BotConfigInput = {
    botConfigId: bot.id,
    botName: bot.botName,
    isActive: bot.isActive,
    welcomeMessage: bot.welcomeMessage,
    accentColor: bot.accentColor,
    accentSecondary: bot.accentSecondary,
    avatarStyle: bot.avatarStyle as BotConfigInput['avatarStyle'],
    avatarImageUrl: bot.avatarImageUrl,
    avatarEmoji: bot.avatarEmoji,
    borderRadius: bot.borderRadius as BotConfigInput['borderRadius'],
    surfaceStyle: bot.surfaceStyle,
    position: bot.position as BotConfigInput['position'],
    bubbleStyle: bot.bubbleStyle as BotConfigInput['bubbleStyle'],
    intensityLevel: bot.intensityLevel as BotConfigInput['intensityLevel'],
    tone: bot.tone,
    whatsappNumber: bot.whatsappNumber,
    quickReplies: (bot.quickReplies as unknown as BotConfigInput['quickReplies']) ?? [],
  }

  return (
    <div className="min-h-screen text-white">
      <BotConfigEditor initial={initial} />
    </div>
  )
}

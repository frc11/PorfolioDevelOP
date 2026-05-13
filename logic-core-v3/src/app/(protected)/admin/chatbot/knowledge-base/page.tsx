import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { KnowledgeBaseEditor } from '@/modules/chatbot/components/admin/KnowledgeBaseEditor'

export default async function KnowledgeBasePage() {
  const session = await auth()

  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard') // Fallback to safe area if not authorized
  }

  // For MVP, default to the develOP bot. In Phase 1.5+, this becomes
  // a list with bot selection.
  const bot = await prisma.botConfig.findUnique({
    where: { slug: 'develop' },
    include: { knowledgeBase: true },
  })

  if (!bot || !bot.knowledgeBase) {
    return <div className="p-8 text-red-400">Bot or KnowledgeBase not found.</div>
  }

  return (
    <div className="min-h-screen text-white">
      <KnowledgeBaseEditor
        botConfigId={bot.id}
        initialData={{
          businessInfo: bot.knowledgeBase.businessInfo,
          servicesOrProducts: bot.knowledgeBase.servicesOrProducts,
          faq: bot.knowledgeBase.faq,
          policies: bot.knowledgeBase.policies,
          salesGuidance: bot.knowledgeBase.salesGuidance,
          toneExamples: bot.knowledgeBase.toneExamples,
          forbiddenStatements: bot.knowledgeBase.forbiddenStatements,
        }}
      />
    </div>
  )
}

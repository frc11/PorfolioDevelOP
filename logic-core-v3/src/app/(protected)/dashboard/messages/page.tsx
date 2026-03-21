import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { MessageThread } from '@/components/dashboard/MessageThread'
import { FadeIn } from '@/components/dashboard/FadeIn'

export default async function ClientMessagesPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  await prisma.message.updateMany({
    where: { organizationId, fromAdmin: true, read: false },
    data: { read: true },
  })

  const messages = await prisma.message.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Mensajes</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tu conversación con el equipo de DevelOP
          </p>
        </div>
      </FadeIn>

      {/* Chat thread — takes remaining height */}
      <FadeIn delay={0.1} className="flex min-h-0 flex-1 flex-col">
        <MessageThread messages={messages} />
      </FadeIn>
    </div>
  )
}

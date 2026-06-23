import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { MessageThread } from '@/components/dashboard/MessageThread'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { PageHeader } from '@/components/ui'
import { MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientMessagesPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  await prisma.message.updateMany({
    where: { organizationId, fromAdmin: true, read: false },
    data: { read: true },
  })

  const [messages, org] = await Promise.all([
    prisma.message.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true },
    }),
  ])

  return (
    <div className="flex h-full flex-col gap-4">
      <FadeIn>
        <PageHeader
          eyebrow="Comunicación"
          title="Mensajes"
          description="Tu conversación directa con el equipo de develOP"
          icon={MessageSquare}
        />
      </FadeIn>

      <FadeIn delay={0.1} className="flex min-h-0 flex-1 flex-col">
        <MessageThread messages={messages} organizationName={org?.companyName ?? ''} />
      </FadeIn>
    </div>
  )
}

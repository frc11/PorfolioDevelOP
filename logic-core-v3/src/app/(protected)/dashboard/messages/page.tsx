import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { MessageThread } from '@/components/dashboard/MessageThread'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { MarkReadOnMount } from './_components/MarkReadOnMount'
import { markClientMessagesRead } from './_actions/mark-read'

export const dynamic = 'force-dynamic'

export default async function ClientMessagesPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

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
    <div className="flex h-[calc(100dvh_-_168px)] flex-col overflow-hidden sm:h-[calc(100dvh_-_192px)]">
      <MarkReadOnMount action={markClientMessagesRead} />

      <FadeIn className="flex min-h-0 flex-1 flex-col">
        <MessageThread messages={messages} organizationName={org?.companyName ?? ''} />
      </FadeIn>
    </div>
  )
}

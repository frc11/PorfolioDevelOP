import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MessageThread } from '@/components/dashboard/MessageThread'

export default async function ClientMessagesPage() {
  const session = await auth()
  const clientId = session?.user?.clientId
  if (!clientId) redirect('/login')

  // Mark admin messages as read — direct DB call, not via action
  // (revalidatePath cannot be called during render)
  await prisma.message.updateMany({
    where: { clientId, fromAdmin: true, read: false },
    data: { read: true },
  })

  const messages = await prisma.message.findMany({
    where: { clientId },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Mensajes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tu conversación con el equipo de DevelOP
        </p>
      </div>

      {/* Chat thread — takes remaining height */}
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageThread messages={messages} />
      </div>
    </div>
  )
}

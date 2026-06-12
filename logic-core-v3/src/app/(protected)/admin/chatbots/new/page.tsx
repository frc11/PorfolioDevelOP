import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreateBotForm } from './CreateBotForm'

export default async function NewBotPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const orgsAvailable = await prisma.organization.findMany({
    where: { botConfig: null },
    select: { id: true, companyName: true, slug: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Chatbots</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Nuevo chatbot
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Creá un bot para una organización existente o creá ambos de cero.
        </p>
      </div>

      <CreateBotForm orgsAvailable={orgsAvailable} />
    </div>
  )
}

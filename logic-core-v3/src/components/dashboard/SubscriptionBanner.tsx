import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export async function SubscriptionBanner() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Find user's organization and subscription
  const orgMember = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          subscription: true
        }
      }
    }
  })

  const subscription = orgMember?.organization?.subscription

  if (!subscription || subscription.status !== 'PAST_DUE') {
    return null
  }

  return (
    <div className="w-full bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(239,68,68,0.1)] backdrop-blur-md relative z-50">
      <AlertTriangle className="text-red-500" size={16} />
      <p className="text-sm font-medium text-red-200">
        El pago de tu suscripción se encuentra vencido. Por favor, regulariza tu situación para evitar interrupciones en el servicio.
      </p>
      <Link 
        href="/dashboard/facturacion"
        className="text-xs ml-2 font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded border border-red-500/20"
      >
        Ir a Facturación <ExternalLink size={12} />
      </Link>
    </div>
  )
}

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { isModuleActive } from '@/lib/modules/check-activation'
import { resolveMotorResenasView } from '@/lib/modules/motor-resenas-view'
import { deriveConnectionStatus } from '@/lib/integrations/gbp-connection-logic'
import { listReviews } from '@/lib/integrations/google-business-profile'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui'
import { EmptyStateMuted, emptyMutedCtaSecondaryCls } from '@/components/ui/EmptyStateMuted'
import { ReviewItem } from './_components/ReviewItem'
import { AskReviewSection } from './_components/AskReviewSection'
import { ConnectingState } from './_components/ConnectingState'
import { LockedView } from './_components/LockedView'

export const dynamic = 'force-dynamic'

async function ReviewsList({ organizationId }: { organizationId: string }) {
  const reviews = await listReviews(organizationId)

  if (reviews.length === 0) {
    return (
      <EmptyStateMuted
        icon={Star}
        title="Sin reseñas todavía"
        description="Tu Google ya está conectado. Cuando lleguen reseñas van a aparecer acá para responderlas; mientras tanto podés pedir la primera con el QR de acá abajo."
      >
        <a href="#pedir-resenas" className={emptyMutedCtaSecondaryCls}>
          Pedir mi primera reseña
        </a>
      </EmptyStateMuted>
    )
  }

  const unreplied = reviews.filter((r) => !r.reply)
  const replied = reviews.filter((r) => r.reply)

  return (
    <div className="flex flex-col gap-6">
      {unreplied.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sin responder</h2>
            <span
              className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {unreplied.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {unreplied.map((review) => (
              <ReviewItem key={review.reviewName} review={review} organizationId={organizationId} />
            ))}
          </div>
        </section>
      )}

      {replied.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Respondidas</h2>
            <span
              className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              {replied.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {replied.map((review) => (
              <ReviewItem key={review.reviewName} review={review} organizationId={organizationId} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
            </div>
          </div>
          <div className="mt-3 ml-12 h-3 w-3/4 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  )
}

export default async function MotorResenasPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const [moduleActive, org] = await Promise.all([
    isModuleActive(organizationId, 'motor-resenas'),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { googleMapsPlaceId: true, gbpConnectedAt: true, gbpLocationId: true },
    }),
  ])
  if (!org) redirect('/login')

  // Estado unificado P3-A.1 (deriveConnectionStatus): mismo criterio de "operativo"
  // que el motor de reglas — reemplaza el gbpConnected local por tokens crudos.
  const view = resolveMotorResenasView({
    moduleActive,
    connection: deriveConnectionStatus(org),
  })

  // "Ya lo pediste" solo interesa en la vista de venta (lazy: no se paga en las otras).
  const demand =
    view === 'locked'
      ? await prisma.organizationModule.findFirst({
          where: { organizationId, module: { slug: 'motor-resenas' } },
          select: { status: true, upsellRequestCount: true },
        })
      : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Módulo"
        title="Motor de reseñas"
        description="Respondé reseñas de Google con IA y pedile a tus clientes que te dejen una."
        icon={Star}
        accent="amber"
      />

      {view === 'locked' ? (
        <LockedView
          alreadyRequested={(demand?.upsellRequestCount ?? 0) > 0}
          isPaused={demand?.status === 'PAUSED'}
        />
      ) : view === 'connecting' ? (
        <ConnectingState />
      ) : (
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsList organizationId={organizationId} />
        </Suspense>
      )}

      {/* El QR usa googleMapsPlaceId (independiente de la conexión GBP): vale en
          connecting y operational; a quien no contrató no se le regala la herramienta. */}
      {view !== 'locked' && (
        <div id="pedir-resenas">
          <AskReviewSection placeId={org.googleMapsPlaceId} />
        </div>
      )}
    </div>
  )
}

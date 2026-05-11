import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Star, MessageCircle } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { isModuleActive } from '@/lib/modules/check-activation'
import { listReviews } from '@/lib/integrations/google-business-profile'
import { prisma } from '@/lib/prisma'
import { ReviewItem } from './_components/ReviewItem'
import { AskReviewSection } from './_components/AskReviewSection'

export const dynamic = 'force-dynamic'

async function ReviewsList({
  organizationId,
  gbpConnected,
}: {
  organizationId: string
  gbpConnected: boolean
}) {
  if (!gbpConnected) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
        }}
        className="px-5 py-12 text-center"
      >
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <Star size={24} strokeWidth={1.5} className="text-cyan-400" />
          </div>
          <p className="mt-4 text-sm font-bold text-zinc-300">Google Business Profile no conectado</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Para ver y responder reseñas necesitás conectar tu cuenta de Google Business Profile.
            Tu equipo de develOP puede hacerlo por vos.
          </p>
          <a
            href="/dashboard/messages?context=gbp"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <MessageCircle size={13} strokeWidth={1.5} />
            Hablar con develOP
          </a>
        </div>
      </div>
    )
  }

  const reviews = await listReviews(organizationId)

  if (reviews.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
        }}
        className="px-5 py-10 text-center"
      >
        <p className="text-sm text-zinc-500">
          Sin reseñas todavía. Cuando recibas reseñas en Google aparecerán acá.
        </p>
      </div>
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

  const isActive = await isModuleActive(organizationId, 'motor-resenas')
  if (!isActive) redirect('/dashboard')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      companyName: true,
      googleMapsPlaceId: true,
      gbpAccessToken: true,
      gbpRefreshToken: true,
    },
  })
  if (!org) redirect('/login')

  const gbpConnected = !!(org.gbpAccessToken && org.gbpRefreshToken)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Star size={18} strokeWidth={1.5} className="text-amber-400" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-zinc-100">Motor de Reseñas</h1>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Respondé reseñas de Google con IA y pedile a tus clientes que te dejen una.
        </p>
      </div>

      {/* Reviews */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsList organizationId={organizationId} gbpConnected={gbpConnected} />
      </Suspense>

      {/* Ask review section */}
      <AskReviewSection placeId={org.googleMapsPlaceId} />
    </div>
  )
}

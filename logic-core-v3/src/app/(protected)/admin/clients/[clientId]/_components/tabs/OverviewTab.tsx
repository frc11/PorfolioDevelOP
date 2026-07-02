import { prisma } from '@/lib/prisma'
import { Card, StatCard } from '@/components/ui'
import { HoverScaleCard } from '@/app/(protected)/admin/clients/_components/HoverScaleCard'
import { ResendCredentialsButton } from '../ResendCredentialsButton'
import { InternalNotesCard } from '../InternalNotesCard'
import { PlanAssignmentCard } from '../PlanAssignmentCard'
import { BillingOverrideCard } from '../BillingOverrideCard'
import { ExecutiveReportCard } from '../ExecutiveReportCard'

interface OverviewTabProps {
  clientId: string
}

export async function OverviewTab({ clientId }: OverviewTabProps) {
  const client = await prisma.organization.findUnique({
    where: { id: clientId },
    include: {
      subscription: { include: { plan: { select: { name: true } } } },
      members: {
        orderBy: { joinedAt: 'asc' },
        take: 1,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      services: true,
    },
  })

  if (!client) return null

  const primaryMember = client.members[0] ?? null
  const activeServices = client.services.filter((service) => service.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HoverScaleCard className="h-full">
          <StatCard
            label="Plan"
            value={client.subscription?.plan?.name ?? 'Sin plan'}
            color="cyan"
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Estado suscripcion"
            value={client.subscription?.status ?? 'Sin suscripcion'}
            color={client.subscription?.status === 'ACTIVE' ? 'emerald' : 'zinc'}
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Usuario primario"
            value={primaryMember?.user.name ?? primaryMember?.user.email ?? 'Sin usuario'}
            color="zinc"
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Modulos activos"
            value={activeServices}
            color="violet"
            className="h-full"
          />
        </HoverScaleCard>
      </div>

      <PlanAssignmentCard clientId={clientId} />
      <BillingOverrideCard clientId={clientId} />
      <ExecutiveReportCard clientId={clientId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="elevated" padding="lg">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Informacion de contacto
          </p>
          <div className="space-y-3">
            <InfoRow label="Email primario" value={primaryMember?.user.email ?? '-'} />
            <InfoRow label="Ciudad" value={client.city ?? '-'} />
            <InfoRow label="WhatsApp" value={client.whatsapp ?? '-'} />
            <InfoRow label="Website" value={client.siteUrl ?? '-'} link />
            <InfoRow label="Creado" value={client.createdAt.toLocaleDateString('es-AR')} />
          </div>
          {primaryMember?.user.id && primaryMember.user.email && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <ResendCredentialsButton
                userId={primaryMember.user.id}
                userEmail={primaryMember.user.email}
              />
            </div>
          )}
        </Card>

        <InternalNotesCard clientId={clientId} initialNotes={client.internalNotes} />
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: boolean
}) {
  return (
    <div
      className="-mx-2 flex items-center justify-between gap-4 rounded-lg border border-transparent px-2 py-1.5 text-sm transition-colors hover:border-white/15 hover:bg-white/10"
    >
      <span className="text-zinc-400">{label}</span>
      {link && value !== '-' ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-cyan-400 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="truncate text-zinc-200">{value}</span>
      )}
    </div>
  )
}

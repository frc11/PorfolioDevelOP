import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/ui'

interface OverviewTabProps {
  clientId: string
}

export async function OverviewTab({ clientId }: OverviewTabProps) {
  const client = await prisma.organization.findUnique({
    where: { id: clientId },
    include: {
      subscription: true,
      members: {
        orderBy: { joinedAt: 'asc' },
        take: 1,
        include: {
          user: { select: { name: true, email: true } },
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
        <StatCard
          label="Plan"
          value={client.subscription?.planName ?? 'Sin plan'}
          color="cyan"
        />
        <StatCard
          label="Estado suscripcion"
          value={client.subscription?.status ?? 'Sin suscripcion'}
          color={client.subscription?.status === 'ACTIVE' ? 'emerald' : 'zinc'}
        />
        <StatCard
          label="Usuario primario"
          value={primaryMember?.user.name ?? primaryMember?.user.email ?? 'Sin usuario'}
          color="zinc"
        />
        <StatCard
          label="Modulos activos"
          value={activeServices}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Informacion de contacto
          </p>
          <div className="space-y-3">
            <InfoRow label="Email primario" value={primaryMember?.user.email ?? '-'} />
            <InfoRow label="WhatsApp" value={client.whatsapp ?? '-'} />
            <InfoRow label="Website" value={client.siteUrl ?? '-'} link />
            <InfoRow label="Creado" value={client.createdAt.toLocaleDateString('es-AR')} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Notas internas
          </p>
          <p className="text-sm italic text-zinc-400">
            Proximamente: notas editables del equipo develOP.
          </p>
        </div>
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-zinc-500">{label}</span>
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

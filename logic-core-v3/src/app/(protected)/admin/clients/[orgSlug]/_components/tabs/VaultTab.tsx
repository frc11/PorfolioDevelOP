import { ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { VaultManager } from '@/app/(protected)/admin/agency-dashboard/_components/VaultManager'

interface VaultTabProps {
  clientId: string
}

export async function VaultTab({ clientId }: VaultTabProps) {
  const assets = await prisma.clientAsset.findMany({
    where: { organizationId: clientId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Subir a boveda
        </p>
        <VaultManager organizationId={clientId} />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Assets ({assets.length})
        </p>
        {assets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-zinc-500">
            Sin archivos en la boveda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-100">{asset.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{asset.type}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-cyan-400" strokeWidth={1.5} />
                </div>
                {asset.description && (
                  <p className="line-clamp-2 text-xs text-zinc-500">{asset.description}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

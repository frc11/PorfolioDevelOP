import { ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { HoverScaleCard } from '@/app/(protected)/admin/clients/_components/HoverScaleCard'
import { VaultManager } from '@/components/admin/managers/VaultManager'
import { VaultRevealButton } from '@/components/dashboard/VaultRevealButton'
import { resolveCredentialDisplay } from '@/lib/crypto/resolve-credential'

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
          <EmptyStateMuted title="Sin archivos en la boveda." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {assets.map((asset) => {
              const isAccess = asset.type === 'ACCESS'
              const credential =
                isAccess && asset.description
                  ? resolveCredentialDisplay(asset.description)
                  : null

              return (
                <HoverScaleCard key={asset.id}>
                  <Card variant="interactive" padding="sm" className="group">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-medium text-zinc-100">{asset.name}</h3>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">{asset.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-cyan-400" strokeWidth={1.5} />
                      </div>
                      {!isAccess && asset.description && (
                        <p className="line-clamp-2 text-xs text-zinc-400">{asset.description}</p>
                      )}
                    </a>
                    {/* Credencial ACCESS fuera del <a>: revelar no debe navegar */}
                    {credential &&
                      (credential.error ? (
                        <p className="mt-3 text-xs text-red-400/60">
                          No se pudo mostrar esta credencial.
                        </p>
                      ) : (
                        <VaultRevealButton value={credential.value} />
                      ))}
                  </Card>
                </HoverScaleCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

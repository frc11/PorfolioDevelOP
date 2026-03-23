import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { AssetType } from '@prisma/client'
import { FileText, Image as ImageIcon, Book, Link as LinkIcon, Download, Archive } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'

const ASSET_TYPE_ICON: Record<AssetType, React.ElementType> = {
  DOCUMENT: FileText,
  IMAGE: ImageIcon,
  BRANDBOOK: Book,
  LOGO: ImageIcon,
  ACCESS: LinkIcon,
  OTHER: FileText,
}

const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  DOCUMENT: 'Documento',
  IMAGE: 'Imagen',
  BRANDBOOK: 'Brandbook',
  LOGO: 'Logo',
  ACCESS: 'Acceso',
  OTHER: 'Otro',
}

export default async function VaultPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const assets = await prisma.clientAsset.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Bóveda digital</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tus recursos y accesos centralizados de forma segura.
          </p>
        </div>
      </FadeIn>

      {/* Empty state */}
      {assets.length === 0 && (
        <FadeIn delay={0.1}>
          <div
            className="flex flex-col items-center gap-4 rounded-xl py-16 text-center"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
              <Archive size={22} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Aún no hay archivos en tu bóveda
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Pronto subiremos tus logos, brandbooks y otros recursos aquí.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Assets Grid */}
      {assets.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const Icon = ASSET_TYPE_ICON[asset.type] || FileText
              return (
                <div
                  key={asset.id}
                  className="group relative flex flex-col justify-between gap-4 rounded-xl p-4 transition-all hover:bg-white/[0.08]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-100 line-clamp-1">
                          {asset.name}
                        </span>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          {ASSET_TYPE_LABEL[asset.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {asset.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {asset.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[10px] text-zinc-500">
                      Subido el{' '}
                      {new Date(asset.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300"
                    >
                      <Download size={12} />
                      Abrir
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </FadeIn>
      )}
    </div>
  )
}

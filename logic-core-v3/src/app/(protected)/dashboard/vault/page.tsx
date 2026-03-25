import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { AssetType } from '@prisma/client'
import { FileText, Image as ImageIcon, Book, Link as LinkIcon, Download, Archive, Lock, LockOpen, Globe, Server, Activity, User, ShieldCheck } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'

const ASSET_TYPE_ICON: Record<AssetType, any> = {
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
              const name = asset.name.toLowerCase()
              let VisualIcon = ASSET_TYPE_ICON[asset.type] || FileText
              let glowColor = 'bg-cyan-500/10'
              let iconColor = 'text-cyan-400'
              let borderColor = 'group-hover:border-cyan-500/30'

              if (name.includes('redes sociales')) {
                VisualIcon = Globe
                glowColor = 'bg-purple-500/20'
                iconColor = 'text-purple-400'
                borderColor = 'group-hover:border-purple-500/30'
              } else if (name.includes('hosting')) {
                VisualIcon = Server
                glowColor = 'bg-blue-500/20'
                iconColor = 'text-blue-400'
                borderColor = 'group-hover:border-blue-500/30'
              }

              return (
                <div
                  key={asset.id}
                  className={`group relative flex flex-col justify-between gap-6 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/5 bg-[#07080a]/60 backdrop-blur-2xl overflow-hidden ${borderColor}`}
                >
                  {/* Cybersecurity Dot Grid Pattern */}
                  <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ 
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
                      backgroundSize: '24px 24px' 
                    }} 
                  />

                  {/* Security Badge */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/5 bg-black/40 backdrop-blur-md px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    AES-256 SAFE
                  </div>

                  <div className="relative z-10 flex items-start gap-5">
                    <div className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05] ${iconColor} transition-all duration-500 group-hover:scale-110 shadow-2xl`}>
                      {/* Ambient Icon Glow */}
                      <div className={`absolute inset-0 rounded-2xl ${glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <VisualIcon size={28} className="relative z-10 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                    <div className="flex flex-col min-w-0 pt-1">
                      <h3 className="text-base font-black tracking-tight text-white group-hover:text-white transition-colors truncate">
                        {asset.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-1 w-1 rounded-full ${glowColor.replace('/20', '').replace('/10', '')}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                          {ASSET_TYPE_LABEL[asset.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {asset.description && (
                    <p className="relative z-10 text-xs text-zinc-500 leading-relaxed line-clamp-2 px-1">
                      {asset.description}
                    </p>
                  )}

                  <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/[0.05] pt-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Integridad</span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(asset.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] backdrop-blur-md"
                    >
                      <div className="relative h-4 w-4">
                        <Lock size={14} className="absolute inset-0 transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50 group-hover/btn:rotate-12" />
                        <LockOpen size={14} className="absolute inset-0 opacity-0 scale-50 -rotate-12 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:rotate-0" />
                      </div>
                      <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5">
                        Acceder
                      </span>
                      {/* Internal Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </a>
                  </div>

                  {/* Decorative Scanline Effect */}
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              )
            })}
          </div>
        </FadeIn>
      )}
      {/* Activity Feed - Peace of Mind Section */}
      <FadeIn delay={0.2}>
        <div className="mt-8 rounded-2xl border border-white/5 bg-black/20 p-6 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Registro de Integridad y Accesos
              </h2>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500/60">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              Monitoreo Activo
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { user: 'Carlos (Tú)', action: 'accedió a', resource: 'Credenciales de Dominio', time: 'Hace 2 horas' },
              { user: 'Admin (develOP)', action: 'subió', resource: 'Guía de Estilo v2 (PDF)', time: 'Hace 5 horas' },
              { user: 'Carlos (Tú)', action: 'descargó', resource: 'Logotipo Principal (PNG)', time: 'Ayer, 18:45' },
            ].map((log, i) => (
              <div 
                key={i} 
                className="group flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-white/5 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <User size={12} />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-none">
                    <span className="font-bold text-zinc-300">{log.user}</span>
                    <span className="mx-1.5 opacity-60">{log.action}</span>
                    <span className="font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors cursor-default">{log.resource}</span>
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 tabular-nums">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
          
          <p className="mt-4 text-center text-[9px] font-medium text-zinc-600 italic">
            * Los registros de acceso se mantienen por 30 días para tu auditoría personal.
          </p>
        </div>
      </FadeIn>
    </div>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Send, FileText, AlertCircle, Mail } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import type { EmailCampaignStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<EmailCampaignStatus, string> = {
  DRAFT: 'Borrador',
  SCHEDULED: 'Programada',
  SENDING: 'Enviando',
  SENT: 'Enviada',
  FAILED: 'Fallida',
}

const STATUS_STYLE: Record<EmailCampaignStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'rgba(113,113,122,0.15)', text: '#a1a1aa', border: 'rgba(113,113,122,0.25)' },
  SCHEDULED: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  SENDING: { bg: 'rgba(6,182,212,0.12)', text: '#22d3ee', border: 'rgba(6,182,212,0.2)' },
  SENT: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
  FAILED: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
}

function pct(part: number, total: number) {
  if (total === 0) return '—'
  return `${Math.round((part / total) * 100)}%`
}

export default async function CampaignsPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const campaigns = await prisma.emailCampaign.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {campaigns.length} {campaigns.length === 1 ? 'campaña' : 'campañas'}
        </p>
        <Link
          href="/dashboard/modules/email-marketing/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Plus size={13} strokeWidth={1.5} />
          Nueva campaña
        </Link>
      </div>

      {/* Empty state */}
      {campaigns.length === 0 && (
        <div
          className="px-5 py-14 text-center"
          style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}
        >
          <div className="mx-auto flex max-w-xs flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <Mail size={24} strokeWidth={1.5} className="text-cyan-400" />
            </div>
            <p className="text-sm font-bold text-zinc-300">Todavía no hay campañas</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Creá tu primera campaña de email y empezá a conectar con tus contactos.
            </p>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length > 0 && (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => {
            const style = STATUS_STYLE[campaign.status]
            return (
              <div
                key={campaign.id}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                }}
                className="px-5 py-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-bold text-zinc-100 truncate">{campaign.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{campaign.subject}</p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                  >
                    {STATUS_LABEL[campaign.status]}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Enviados</span>
                    <span className="text-sm font-black text-zinc-300">{campaign.recipientCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Abiertos</span>
                    <span className="text-sm font-black text-cyan-400">
                      {pct(campaign.openedCount, campaign.recipientCount)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Clicks</span>
                    <span className="text-sm font-black text-emerald-400">
                      {pct(campaign.clickedCount, campaign.recipientCount)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Bajas</span>
                    <span className="text-sm font-black text-zinc-400">
                      {campaign.unsubscribedCount}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {campaign.status === 'DRAFT' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                    <Link
                      href={`/dashboard/modules/email-marketing/campaigns/new?edit=${campaign.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all"
                    >
                      <FileText size={11} strokeWidth={1.5} />
                      Editar
                    </Link>
                    <SendButton campaignId={campaign.id} />
                  </div>
                )}

                {campaign.status === 'FAILED' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                    <AlertCircle size={13} strokeWidth={1.5} className="text-red-400" />
                    <span className="text-xs text-red-400">El envío falló. Revisá la configuración e intentá de nuevo.</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SendButton({ campaignId }: { campaignId: string }) {
  return (
    <Link
      href={`/dashboard/modules/email-marketing/campaigns/${campaignId}/send`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20 transition-all"
    >
      <Send size={11} strokeWidth={1.5} />
      Enviar
    </Link>
  )
}

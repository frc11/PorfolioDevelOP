import { Zap } from 'lucide-react'
import { CrmIntegrationAdminCard } from '@/modules/chatbot/components/admin/integrations/CrmIntegrationAdminCard'
import { adminHoverCls } from '@/lib/hover'

interface IntegrationsTabProps {
  organizationId: string
  organizationName: string
}

/**
 * CC.2 — Tab admin de integraciones por org. Hoy solo expone CRM (n8n) —
 * el placeholder de la grid existe para sumar Hubspot/Pipedrive/etc. más adelante
 * sin tener que rearmar el tab.
 *
 * develOP configura desde acá la integración CRM de la org del bot. El cliente
 * NO ve estos campos en su dashboard (solo un indicador read-only de estado).
 */
export function IntegrationsTab({ organizationId, organizationName }: IntegrationsTabProps) {
  return (
    <div className="space-y-8">
      <div className={'flex items-start gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.04] p-4 ' + adminHoverCls}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10">
          <Zap className="h-4 w-4 text-cyan-300" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-zinc-100">
            Integraciones de {organizationName}
          </div>
          <p className="text-xs text-zinc-400">
            Acá se configura el envío de leads del bot a sistemas externos.
            El cliente NO ve la URL ni el secret — solo un indicador de estado.
          </p>
        </div>
      </div>

      <CrmIntegrationAdminCard
        organizationId={organizationId}
        organizationName={organizationName}
      />
    </div>
  )
}

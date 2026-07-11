import { Lock, Send } from 'lucide-react'
import { adminHoverCls } from '@/lib/hover'
import { forOrg } from '@/lib/isolation'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { isCrmEncryptionConfigured } from '@/modules/chatbot/server/crm'
import { getOrgSyncHistory } from '@/modules/chatbot/server/admin/integrations/getCrmSyncHistory'
import { CrmConfigForm } from './CrmConfigForm'
import { CrmSyncHistoryList } from './CrmSyncHistoryList'

interface CrmIntegrationAdminCardProps {
  organizationId: string
  organizationName: string
}

/**
 * CC.2 — Versión admin del card de integración CRM. Reemplaza la versión que
 * vivía en el dashboard del cliente. La configura develOP (SUPER_ADMIN), scoped
 * por la org del bot en /admin/chatbots/[botId].
 *
 * Mismo motor de sync (syncLeadToCrm) — solo cambia quién configura.
 */
export async function CrmIntegrationAdminCard({
  organizationId,
  organizationName,
}: CrmIntegrationAdminCardProps) {
  const plan = await getPlanForOrg(organizationId)

  if (!planAllows(plan, 'crm')) {
    return (
      <Section
        title="Integración con CRM"
        description={`El plan de ${organizationName} no incluye CRM. Para habilitar, el cliente debe upgradear (o develOP forzar el plan desde admin de clientes).`}
      >
        <div className={'rounded-2xl ' + adminHoverCls}>
        <Card padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10">
              <Lock
                className="h-5 w-5 text-amber-300"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-base font-semibold text-zinc-100">
                Disponible en plan Business
              </h3>
              <p className="text-sm text-zinc-400">
                La integración CRM (webhook n8n) está bloqueada por plan en esta
                organización. Subí el plan del cliente para habilitarla.
              </p>
            </div>
          </div>
        </Card>
        </div>
      </Section>
    )
  }

  const [integration, history] = await Promise.all([
    forOrg(organizationId).crmIntegration.findFirst({
      select: {
        webhookUrl: true,
        enabled: true,
        secretHeaderName: true,
        secretEncrypted: true,
      },
    }),
    getOrgSyncHistory({ organizationId, limit: 10 }),
  ])

  const initial = integration
    ? {
        webhookUrl: integration.webhookUrl,
        enabled: integration.enabled,
        secretHeaderName: integration.secretHeaderName,
        secretConfigured: integration.secretEncrypted !== null,
      }
    : null

  const encryptionAvailable = isCrmEncryptionConfigured()

  return (
    <div className="space-y-6">
      <Section
        title="Webhook n8n"
        description={`Cada lead capturado por el bot de ${organizationName} se manda automáticamente a este webhook. Configurá la URL, el header de auth (opcional) y activá el sync.`}
      >
        <div className={'rounded-2xl ' + adminHoverCls}>
        <Card padding="lg">
          <div className="mb-5 flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10">
              <Send
                className="h-4 w-4 text-cyan-300"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-200">Webhook n8n</div>
              <div className="text-xs text-zinc-500">
                Plan Business · {integration?.enabled ? 'sync habilitado' : 'sync pausado'}
              </div>
            </div>
          </div>
          <CrmConfigForm
            organizationId={organizationId}
            initial={initial}
            encryptionAvailable={encryptionAvailable}
          />
        </Card>
        </div>
      </Section>

      {integration && (
        <Section
          title="Historial de sincronizaciones"
          description="Últimos intentos de sync. Si alguno falló, podés reintentarlo manualmente."
        >
          <div className={'rounded-2xl ' + adminHoverCls}>
          <Card padding="md">
            {history.ok ? (
              <CrmSyncHistoryList
                organizationId={organizationId}
                entries={history.entries}
              />
            ) : (
              <div className="py-2 text-sm text-zinc-400">
                No se pudo cargar el historial
              </div>
            )}
          </Card>
          </div>
        </Section>
      )}
    </div>
  )
}

import { Lock, Send } from 'lucide-react'
import { auth } from '@/auth'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { isCrmEncryptionConfigured } from '@/modules/chatbot/server/crm'
import { getOrgSyncHistory } from '@/modules/chatbot/server/dashboard/getCrmSyncHistory'
import { CrmConfigForm } from './CrmConfigForm'
import { CrmSyncHistoryList } from './CrmSyncHistoryList'

/**
 * B5.8 — Card de integración CRM (n8n) que se renderiza al final de la página
 * de Settings del chatbot.
 *
 * Estados:
 *   - plan sin crmEnabled → locked state (no rompe, muestra upgrade)
 *   - plan ok pero no hay integration → form vacío
 *   - plan ok + integration → form precargado + historial
 *
 * Es Server Component: lee plan + integration + historial en el server, pasa
 * todo precargado a los Client Components (form, history list).
 */
export async function CrmIntegrationCard() {
  const session = await auth()
  if (!session?.user) return null

  const orgId = await resolveOrgId()
  if (!orgId) return null

  const plan = await getPlanForOrg(orgId)

  // Locked state: el plan no incluye CRM. Mostramos por qué y cómo activarlo.
  if (!planAllows(plan, 'crm')) {
    return (
      <Section
        title="Integración con tu CRM"
        description="Mandá cada lead capturado a tu CRM vía n8n."
      >
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
                La integración con CRM vía n8n manda cada lead capturado a tu
                sistema (CRM, hoja de cálculo, automatización — lo que armes en
                n8n). Tu plan actual no la incluye. Escribinos para activarla.
              </p>
            </div>
          </div>
        </Card>
      </Section>
    )
  }

  // Plan OK: cargo integration + historial en paralelo.
  const [integration, history] = await Promise.all([
    prisma.crmIntegration.findUnique({
      where: { organizationId: orgId },
      select: {
        webhookUrl: true,
        enabled: true,
        secretHeaderName: true,
        secretEncrypted: true,
      },
    }),
    getOrgSyncHistory({ limit: 10 }),
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
        title="Integración con tu CRM"
        description="Cada lead capturado se manda automáticamente a tu webhook n8n. Configurá la URL y activá el sync."
      >
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
                Plan Business · sync habilitado
              </div>
            </div>
          </div>
          <CrmConfigForm
            initial={initial}
            encryptionAvailable={encryptionAvailable}
          />
        </Card>
      </Section>

      {integration && (
        <Section
          title="Historial de sincronizaciones"
          description="Últimos intentos de sync — si alguno falló, podés reintentarlo."
        >
          <Card padding="md">
            {history.ok ? (
              <CrmSyncHistoryList entries={history.entries} />
            ) : (
              <div className="py-2 text-sm text-zinc-400">
                No se pudo cargar el historial
              </div>
            )}
          </Card>
        </Section>
      )}
    </div>
  )
}

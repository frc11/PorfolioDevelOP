import { Check, MessageCircle, PauseCircle } from 'lucide-react'
import Link from 'next/link'
import { resolveOrgId } from '@/lib/preview'
import { forOrg } from '@/lib/isolation'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

/**
 * CC.2 — Indicador read-only de la integración CRM para el dashboard del cliente.
 *
 * El cliente NO ve la URL del webhook ni el secret — la config la maneja develOP
 * desde el admin. Acá solo mostramos el estado:
 *   - Plan no incluye CRM → no se renderiza nada (cero exposición).
 *   - Plan OK, sin integración → "Aún no está configurado, develOP la va a conectar."
 *   - Plan OK, integración + enabled → "✓ Tu CRM está conectado por develOP."
 *   - Plan OK, integración + disabled → "Pausada. Contactá a develOP."
 */
export async function CrmStatusIndicator() {
  const organizationId = await resolveOrgId()
  if (!organizationId) return null

  const plan = await getPlanForOrg(organizationId)
  if (!planAllows(plan, 'crm')) return null

  // crmIntegration scopea por organizationId (@unique == el scope): findFirst
  // devuelve la integración de la org o null.
  const integration = await forOrg(organizationId).crmIntegration.findFirst({
    select: { enabled: true },
  })

  if (!integration) {
    return (
      <Section
        title="Integración con tu CRM"
        description="develOP conecta tu chatbot con tu CRM (Hubspot, Pipedrive, etc.) para que cada lead capturado llegue solo."
      >
        <Card padding="md">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-zinc-500/20 bg-zinc-500/10">
              <MessageCircle
                className="h-4 w-4 text-zinc-400"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium text-zinc-200">
                Aún no está configurada
              </div>
              <p className="text-xs text-zinc-500">
                El equipo de develOP se encarga de conectarla por vos.{' '}
                <Link
                  href="/dashboard/messages?context=crm"
                  className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
                >
                  Pedila desde tu canal de soporte
                </Link>
                .
              </p>
            </div>
          </div>
        </Card>
      </Section>
    )
  }

  if (!integration.enabled) {
    return (
      <Section
        title="Integración con tu CRM"
        description="Los leads capturados se siguen guardando, pero el envío al CRM está pausado."
      >
        <Card padding="md">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10">
              <PauseCircle
                className="h-4 w-4 text-amber-300"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium text-zinc-200">
                Sync pausado
              </div>
              <p className="text-xs text-zinc-500">
                develOP tiene tu integración configurada pero el envío automático
                está en pausa.{' '}
                <Link
                  href="/dashboard/messages?context=crm"
                  className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
                >
                  Pedinos reactivarla
                </Link>
                .
              </p>
            </div>
          </div>
        </Card>
      </Section>
    )
  }

  return (
    <Section
      title="Integración con tu CRM"
      description="Cada lead capturado por el chatbot llega automáticamente a tu CRM."
    >
      <Card padding="md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
            <Check
              className="h-4 w-4 text-emerald-300"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium text-zinc-200">
              Conectada · sync activo
            </div>
            <p className="text-xs text-zinc-500">
              develOP gestiona la conexión técnica. Si necesitás cambiar algo,{' '}
              <Link
                href="/dashboard/messages?context=crm"
                className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
              >
                escribinos desde Mensajes
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>
    </Section>
  )
}

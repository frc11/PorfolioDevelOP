'use client'

/**
 * MS-3 — CTA de upgrade de plan envuelto con `requestUpsellAction`.
 *
 * Reemplaza el `<Link>` plano que B4.6 dejó en `PlansShowcase` para los CTAs
 * "Subir a Pro/Business". Al clickear:
 *
 *   1. Llama `requestUpsellAction("plan-upgrade-{key}", "Plan {Name}")` que:
 *      - Crea row en `contactSubmission` (visible en `/admin/leads` tab Inbound).
 *      - Dispara `sendAgencyAlert({ type: 'LEAD_UPSELL' })` → Telegram develOP.
 *      - Crea `Notification` para el super_admin (ACTION_REQUIRED).
 *      - Notifica al cliente (INFO: "Tu solicitud fue recibida").
 *      - Como `plan-upgrade-{key}` NO existe como `premiumModule.slug`, el
 *        bloque `organizationModule` (línea 49 de upsell.ts) se skipea
 *        silenciosamente — no contamina la tabla de módulos premium.
 *
 *   2. Redirige a `/dashboard/messages?context=plan-upgrade-{key}` donde el
 *      `MessageThread` lee el query y pre-rellena el textarea con un mensaje
 *      tipo "Hola! Quería subir mi plan a {Name}..." (ver `message-context.ts`).
 *
 * Por qué pre-fill + lead registrado al mismo tiempo:
 *   - Si el cliente envía el mensaje: develOP lo recibe por 2 canales (lead +
 *     mensaje); doble-conteo lo resuelve admin manualmente (idempotencia es
 *     out of scope — el riesgo de duplicar es preferible al riesgo de perder).
 *   - Si el cliente se va sin enviar: el lead ya quedó registrado al click.
 *     Cero leads perdidos por friction del segundo step.
 *
 * Disabled mientras pending: previene double-click → 2 leads por el mismo
 * intento. Si la action falla por red/DB, igual redirigimos al messages para
 * que el cliente complete el flow manualmente (no bloqueamos al usuario por
 * una falla de telemetría).
 */

import { useTransition } from 'react'
import { requestUpsellAction } from '@/lib/actions/upsell'

interface UpgradeCtaButtonProps {
  /** Plan key lowercase para el slug — 'pro' | 'business' | 'starter' */
  planKeyLower: string
  /** Nombre legible del plan — 'Pro' | 'Business' | 'Starter' */
  planName: string
  /** Texto del CTA — viene de `plan.ctaUpgrade` (ej. "Subir a Pro") */
  label: string
  /** Clases visuales — definidas por el caller para mantener el look exacto */
  className: string
  /** Contenido extra (ej. el icono `<Sparkles />` del variant highlighted) */
  children?: React.ReactNode
}

export function UpgradeCtaButton({
  planKeyLower,
  planName,
  label,
  className,
  children,
}: UpgradeCtaButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (isPending) return
    const featureKey = `plan-upgrade-${planKeyLower}`
    const featureName = `Plan ${planName}`
    const targetHref = `/dashboard/messages?context=${featureKey}`

    startTransition(async () => {
      // El registro de intención va PRIMERO. Si falla, igual redirigimos —
      // el cliente puede completar el flow manualmente desde messages.
      try {
        const result = await requestUpsellAction(featureKey, featureName)
        if (!result.success) {
          console.error('[plan-upgrade-cta] action returned error:', result.error)
        }
      } catch (err) {
        console.error('[plan-upgrade-cta] action threw:', err)
      }
      // Navegación HARD (no router.push). Razón: `requestUpsellAction` llama
      // `revalidatePath('/dashboard')` al final, lo que dispara un re-render
      // de esta misma página y CANCELA cualquier `router.push` pendiente
      // (race detectado en la verificación visual de MS-3). `assign()` no se
      // cancela por revalidations, garantiza que el cliente llega a messages.
      window.location.assign(targetHref)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
      aria-busy={isPending}
      aria-label={label}
    >
      {children}
      {label}
    </button>
  )
}

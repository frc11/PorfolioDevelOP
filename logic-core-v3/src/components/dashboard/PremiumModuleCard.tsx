'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Receipt,
  ShoppingBag,
  Star,
  TrendingUp,
  Unlock,
  Users,
} from 'lucide-react'
import type { PremiumModuleStatus, PremiumModuleTier } from '@prisma/client'
import type { LucideIcon } from 'lucide-react'
import { requestUpsellAction } from '@/lib/actions/upsell'
import { adminHoverCls } from '@/lib/hover'
import { useTransitionContext } from '@/context/TransitionContext'
import { ServiceDetailModal } from './ServiceDetailModal'

const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Calendar,
  DollarSign,
  Mail,
  MessageCircle,
  Receipt,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
}

const TIER_LABELS: Record<PremiumModuleTier, string> = {
  TIER_1_OPERATION: 'Operación',
  TIER_2_GROWTH: 'Crecimiento',
  TIER_3_VERTICAL: 'Vertical',
}

// PLACEHOLDER — editar copy real luego.
// La card NO recibe `longDescription` como prop (la query de la page no lo pasa y
// ampliar el select queda fuera de scope), así que el modal usa esta descripción
// general de fallback keyeada por slug. El copy refleja el catálogo vivo
// (`@/lib/data/premium-modules.ts`); si se quiere mostrar el `longDescription` real
// de la DB, hay que pasarlo como prop desde la page en un sprint aparte.
const PRESET_MODULE_DETAILS: Record<string, string> = {
  'motor-resenas':
    'Conectamos tu Google Business Profile y monitoreamos las reseñas que llegan. La IA genera respuestas profesionales que vos aprobás con un click. Además te ayudamos a pedir reseñas a clientes satisfechos automáticamente, para que tu reputación crezca sin seguimiento manual.',
  'email-marketing-pro':
    'Plataforma completa de email marketing white-label. Diseñá campañas con templates, segmentá tu audiencia, mandá newsletters automáticos y medí aperturas y clicks. Todo desde tu panel develOP, conectado a tu base de clientes.',
  'agenda-inteligente':
    'Sistema de reservas integrado a tu sitio. Tus clientes ven tu disponibilidad real, eligen horario y reservan solos, en cualquier momento. Recordatorios automáticos y sincronización con Google Calendar para que no se te escape ningún turno.',
  'tienda-conectada':
    'Integración completa con Tiendanube. Ventas, productos, stock, abandonos de carrito y métricas comerciales aparecen en tu panel develOP. Alertas automáticas cuando un producto se queda sin stock, para que tu tienda y tu operación hablen el mismo idioma.',
  'whatsapp-autopilot':
    'Agente de IA conectado directamente a WhatsApp Business. Responde 24/7 con la voz de tu marca, califica leads automáticamente y agenda turnos en tu calendario, sin que tengas que estar pendiente del teléfono.',
  'facturacion-afip':
    'Conectamos tu certificado AFIP y emitís facturas electrónicas A, B y C en 30 segundos desde tu panel. Validación de CUIT en tiempo real y padrón actualizado automáticamente, sin Excel ni intermediarios.',
  'cobranzas-automatizadas':
    'Detectamos facturas vencidas y enviamos recordatorios escalonados a tus deudores por WhatsApp y email. Reportes semanales de cobranzas pendientes y proyección de cobros para que persigas menos y cobres más.',
  'reactivacion-clientes':
    'Análisis automático de tu base para identificar clientes inactivos. Generamos campañas personalizadas con ofertas relevantes para cada segmento de churn y recuperamos a quienes dejaron de comprar.',
}

const GENERIC_MODULE_DETAIL =
  'Un módulo premium de develOP pensado para potenciar tu operación. Escribinos para conocer todos los detalles, casos de uso y cómo se integra con lo que ya tenés activo.'

export interface PremiumModuleCardProps {
  slug: string
  name: string
  shortDescription: string
  tier: PremiumModuleTier
  priceMonthlyUsd: number
  iconName: string
  accentColor: string
  status: PremiumModuleStatus
}

type ReqStatus = 'idle' | 'success' | 'error'

export function PremiumModuleCard({
  slug,
  name,
  shortDescription,
  tier,
  priceMonthlyUsd,
  iconName,
  accentColor,
  status,
}: PremiumModuleCardProps) {
  const [reqStatus, setReqStatus] = useState<ReqStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { triggerTransition } = useTransitionContext()

  const Icon = ICON_MAP[iconName] ?? Bot
  const isComingSoon = status === 'COMING_SOON'
  const isSuccess = reqStatus === 'success'
  const longDescription = PRESET_MODULE_DETAILS[slug] ?? GENERIC_MODULE_DETAIL

  const handleUnlock = () => {
    if (isPending || isSuccess || isComingSoon) return

    setErrorMsg(null)
    startTransition(async () => {
      const result = await requestUpsellAction(slug, name)

      if (result.success) {
        setReqStatus('success')
        const params = new URLSearchParams({ context: 'modulo', moduleName: name })
        triggerTransition(`/dashboard/messages?${params.toString()}`)
        return
      }

      setReqStatus('error')
      setErrorMsg(result.error ?? 'No se pudo enviar la solicitud.')
      setTimeout(() => {
        setReqStatus('idle')
        setErrorMsg(null)
      }, 3500)
    })
  }

  return (
    <div
      className={[
        'relative flex h-full min-h-[260px] flex-col gap-4 overflow-hidden rounded-[24px] border p-5 backdrop-blur-xl',
        isSuccess
          ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
          : isComingSoon
            ? 'border-white/10 bg-black/20 opacity-90'
            : `border-white/10 bg-black/20 ${adminHoverCls}`,
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[50px] opacity-20"
        style={{ background: accentColor }}
      />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `${accentColor}1A`,
              border: `1px solid ${accentColor}33`,
              boxShadow: `0 0 16px ${accentColor}26`,
              color: accentColor,
            }}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {TIER_LABELS[tier]}
            </p>
            <h3 className="text-sm font-medium text-white">{name}</h3>
          </div>
        </div>

        <span
          className={[
            'flex w-fit flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]',
            isComingSoon
              ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
              : 'border-white/10 bg-white/5 text-zinc-300',
          ].join(' ')}
        >
          {isComingSoon ? null : <Lock size={9} />}
          {isComingSoon ? 'Próximamente Q3 2026' : 'Premium'}
        </span>
      </div>

      <p className="relative z-10 text-sm leading-6 text-zinc-400">{shortDescription}</p>

      {isComingSoon ? (
        <div className="relative z-10 mt-auto flex flex-col gap-2.5">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3.5 py-3 text-xs font-medium text-amber-200">
            Estamos preparando este módulo para el catálogo comercial.
          </div>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            <Info size={11} strokeWidth={1.5} />
            Ver detalles
          </button>
        </div>
      ) : (
        <>
          <div className="relative z-10 mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
                Desde
              </p>
              <p className="text-lg font-semibold leading-none tabular-nums text-white">
                ${priceMonthlyUsd}{' '}
                <span className="text-xs font-medium text-zinc-500">USD/mes</span>
              </p>
            </div>
            <div
              className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: `${accentColor}1A`,
                border: `1px solid ${accentColor}26`,
                color: accentColor,
              }}
            >
              Disponible
            </div>
          </div>

          {reqStatus === 'error' && errorMsg && (
            <p className="relative z-10 flex items-center gap-1.5 text-[11px] font-medium text-red-400">
              <AlertCircle size={11} />
              {errorMsg}
            </p>
          )}

          {/* Fila de 2: "Ver detalles" (icono, secundario) + "Desbloquear" (CTA intacto).
              Ver detalles es compacto a propósito: en el tramo angosto (3 columnas a ~1024px)
              la card baja a ~178px y un botón etiquetado dejaría sin lugar al label del CTA. */}
          <div className="relative z-10 flex items-stretch gap-2.5">
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              aria-label={`Ver detalles de ${name}`}
              title="Ver detalles"
              className="flex w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
            >
              <Info size={15} strokeWidth={1.5} />
            </button>

            <motion.button
              onClick={handleUnlock}
              disabled={isPending || isSuccess}
              whileTap={!isPending && !isSuccess ? { scale: 0.97 } : undefined}
              className={[
                'flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300',
                isSuccess
                  ? 'cursor-default border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
              ].join(' ')}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={11} className="animate-spin" />
                    Enviando solicitud...
                  </motion.span>
                ) : isSuccess ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={11} />
                    Solicitud enviada
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <Unlock size={11} />
                    Desbloquear Módulo
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </>
      )}

      {/* Modal de detalle — portalizado a body desde el propio componente. */}
      <ServiceDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        name={name}
        longDescription={longDescription}
        icon={Icon}
        accentColor={accentColor}
        priceMonthlyUsd={priceMonthlyUsd}
        tierLabel={TIER_LABELS[tier]}
        isComingSoon={isComingSoon}
      />
    </div>
  )
}

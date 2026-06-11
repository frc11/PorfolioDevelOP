/**
 * B4.6 — Catálogo de presentación de planes para el dashboard del cliente.
 *
 * Capa de traducción "técnico → beneficio" (regla absoluta del bloque: cero
 * jerga). Los nombres internos (`quota`, `crmEnabled`, `tools`, `maxDomains`,
 * `reportsEnabled`, `insightEnabled`) NUNCA aparecen tal cual al cliente —
 * acá los mapeamos a frases de dueño de PyME.
 *
 * El catálogo de planes (precio, cap, qué incluye, qué falta) está alineado
 * con `prisma/seeds/sync-plans.ts`. Si cambia el seed, actualizar acá.
 *
 * Decisión de presentación (research de pricing):
 * - 3 cards con Pro destacado "Recomendado" (anclaje al medio).
 * - Cada card lista beneficios incluidos (✓) y los del próximo tier como
 *   "candado dorado" — locked-as-celebration: no es frustración, es invite.
 */
import {
  Users,
  Bot,
  MessageCircle,
  Globe,
  BarChart3,
  Sparkles,
  Contact,
  ShieldCheck,
  Clock,
  ArrowUp,
  type LucideIcon,
} from 'lucide-react'
import type { PlanKey } from '@prisma/client'

export interface PlanBenefit {
  icon: LucideIcon
  label: string
  /** Detalle corto (no jerga) — aparece bajo el label. Opcional. */
  hint?: string
}

export interface PlanPresentation {
  key: PlanKey
  name: string
  /** Tagline corta — quién es este plan. */
  tagline: string
  monthlyPriceUsd: number
  /** Cantidad de clientes/mes (formateada). */
  customersPerMonth: number
  /** Beneficios incluidos en este plan. */
  benefits: readonly PlanBenefit[]
  /** Beneficios del siguiente tier (lo que está bloqueado desde este plan). */
  nextTierTeaser?: readonly PlanBenefit[]
  /** Texto del CTA cuando este es el plan actual. */
  ctaCurrent: string
  /** Texto del CTA cuando este es un upgrade desde el plan actual. */
  ctaUpgrade: string
  /** `true` si la tarjeta debe destacarse visualmente (anclaje "Más popular"). */
  highlight: boolean
}

const STARTER_BENEFITS: readonly PlanBenefit[] = [
  {
    icon: Users,
    label: 'Hasta 500 clientes atendidos por mes',
    hint: 'Más que suficiente para empezar',
  },
  {
    icon: Bot,
    label: 'Vendedor virtual 24/7',
    hint: 'Atiende solo, incluso de madrugada',
  },
  {
    icon: MessageCircle,
    label: 'Toma datos de contacto y los pasa a WhatsApp',
    hint: 'Vos respondés cuando podés',
  },
  {
    icon: Globe,
    label: 'Se conecta a 1 sitio web',
  },
]

const PRO_BENEFITS: readonly PlanBenefit[] = [
  {
    icon: Users,
    label: 'Hasta 3.000 clientes atendidos por mes',
    hint: '6 veces más que Starter',
  },
  {
    icon: Bot,
    label: 'Vendedor virtual 24/7 con más respuestas',
    hint: 'Sabe ofrecer opciones y guiar mejor al visitante',
  },
  {
    icon: Sparkles,
    label: 'Lleva al visitante a la página correcta de tu sitio',
    hint: 'Más cierres, menos rebotes',
  },
  {
    icon: BarChart3,
    label: 'Reportes semanales claros',
    hint: 'Qué te preguntaron, cuántos contactos, cuándo más vendiste',
  },
  {
    icon: Sparkles,
    label: 'Resumen ejecutivo de tu negocio',
    hint: 'En 3 líneas, qué pasó esta semana',
  },
  {
    icon: Globe,
    label: 'Se conecta a 3 sitios web',
  },
]

const BUSINESS_BENEFITS: readonly PlanBenefit[] = [
  {
    icon: Users,
    label: 'Hasta 5.000 clientes atendidos por mes',
    hint: '66% más que Pro',
  },
  {
    icon: Contact,
    label: 'Lista de clientes ordenada (tu agenda automática)',
    hint: 'Cada contacto guardado y clasificado',
  },
  {
    icon: BarChart3,
    label: 'Reportes y resumen ejecutivo incluidos',
  },
  {
    icon: Globe,
    label: 'Se conecta a sitios ilimitados',
    hint: 'Múltiples sucursales o marcas',
  },
  {
    icon: ShieldCheck,
    label: 'Soporte prioritario',
    hint: 'Respuesta en menos de 24 horas hábiles',
  },
  {
    icon: Clock,
    label: 'Equipo develOP atento a tu cuenta',
  },
]

export const PLAN_PRESENTATIONS: readonly PlanPresentation[] = [
  {
    key: 'STARTER',
    name: 'Starter',
    tagline: 'Para arrancar y validar',
    monthlyPriceUsd: 49,
    customersPerMonth: 500,
    benefits: STARTER_BENEFITS,
    nextTierTeaser: [
      { icon: BarChart3, label: 'Reportes semanales claros' },
      { icon: Sparkles, label: 'Resumen ejecutivo de tu negocio' },
      { icon: Users, label: '6 veces más capacidad' },
    ],
    ctaCurrent: 'Tu plan actual',
    ctaUpgrade: 'Empezar con Starter',
    highlight: false,
  },
  {
    key: 'PRO',
    name: 'Pro',
    tagline: 'El más elegido para crecer',
    monthlyPriceUsd: 90,
    customersPerMonth: 3000,
    benefits: PRO_BENEFITS,
    nextTierTeaser: [
      { icon: Contact, label: 'Lista de clientes ordenada' },
      { icon: Globe, label: 'Sitios ilimitados' },
      { icon: ShieldCheck, label: 'Soporte prioritario' },
    ],
    ctaCurrent: 'Tu plan actual',
    ctaUpgrade: 'Subir a Pro',
    highlight: true,
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    tagline: 'Para negocios con mucho tráfico',
    monthlyPriceUsd: 150,
    customersPerMonth: 5000,
    benefits: BUSINESS_BENEFITS,
    ctaCurrent: 'Tu plan actual',
    ctaUpgrade: 'Subir a Business',
    highlight: false,
  },
] as const

export function getPlanPresentation(key: PlanKey): PlanPresentation {
  const presentation = PLAN_PRESENTATIONS.find((p) => p.key === key)
  if (!presentation) {
    return PLAN_PRESENTATIONS[0]
  }
  return presentation
}

const PLAN_ORDER: Record<PlanKey, number> = {
  STARTER: 0,
  PRO: 1,
  BUSINESS: 2,
}

/**
 * Compara si `target` es mayor (upgrade), igual o menor (downgrade) que `current`.
 */
export function compareTier(current: PlanKey, target: PlanKey): 'current' | 'upgrade' | 'downgrade' {
  if (current === target) return 'current'
  return PLAN_ORDER[target] > PLAN_ORDER[current] ? 'upgrade' : 'downgrade'
}

/**
 * Devuelve el "siguiente plan" desde el actual, o null si ya está en BUSINESS.
 */
export function getNextPlan(current: PlanKey): PlanPresentation | null {
  const currentIndex = PLAN_ORDER[current]
  const nextKey = (Object.entries(PLAN_ORDER).find(([, idx]) => idx === currentIndex + 1)?.[0] ??
    null) as PlanKey | null
  if (!nextKey) return null
  return getPlanPresentation(nextKey)
}

/**
 * Mensajes positivos para el medidor de consumo según el porcentaje usado.
 *
 * Política UX lockeada en este bloque: NUNCA alarma. Siempre celebra el uso
 * y, si corresponde, invita a un plan más grande con tono positivo.
 */
export interface UsageMessage {
  /** Tono visual: cómo pintar la barra y el badge. */
  tone: 'calm' | 'busy' | 'crowded' | 'full'
  /** Headline corta (1 línea). */
  headline: string
  /** Detalle (1-2 líneas). */
  detail: string
  /** Si el plan no es BUSINESS y conviene mostrar invitación a upgrade. */
  showUpgradeHint: boolean
}

export function getUsageMessage(percentage: number, planKey: PlanKey, isFallback: boolean): UsageMessage {
  if (percentage >= 100) {
    return {
      tone: 'full',
      headline: '¡Atendiste a todos los clientes del plan este mes!',
      detail: isFallback
        ? 'Tu cuenta sigue funcionando con la atención mínima incluida. Para no cortar el flujo, asignamos un plan apenas lo confirmes.'
        : planKey === 'BUSINESS'
          ? 'Tu cuenta sigue activa: si llegan más, los derivamos a WhatsApp para que los atienda tu equipo. El contador vuelve a cero el mes que viene.'
          : 'Tu negocio creció mucho. Mientras tanto, los nuevos visitantes se derivan a WhatsApp para que no se pierdan. Subir de plan los pone de vuelta dentro del flujo automático.',
      showUpgradeHint: planKey !== 'BUSINESS',
    }
  }
  if (percentage >= 85) {
    return {
      tone: 'crowded',
      headline: '¡Tu asistente está trabajando un montón!',
      detail:
        planKey === 'BUSINESS'
          ? 'Estás cerca del tope del mes. Si pasás, los siguientes se derivan a WhatsApp; el contador se reinicia el 1° del mes que viene.'
          : 'Vas camino al tope mensual. Si querés que el asistente siga atendiendo a todos sin derivar a WhatsApp, sumar capacidad lo arregla en un click.',
      showUpgradeHint: planKey !== 'BUSINESS',
    }
  }
  if (percentage >= 60) {
    return {
      tone: 'busy',
      headline: 'Tu asistente está en buen ritmo',
      detail: 'Ya atendió a más de la mitad de tu cupo del mes. Buen mes de actividad.',
      showUpgradeHint: false,
    }
  }
  return {
    tone: 'calm',
    headline: 'Todo en orden por acá',
    detail: 'Tu asistente está atendiendo con margen de sobra. Buen lugar para estar.',
    showUpgradeHint: false,
  }
}

/**
 * Helper de formato de números con separadores locales (es-AR).
 * Ej: 3000 → "3.000".
 */
export function formatNumberEs(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}

/**
 * Re-export del símbolo de upgrade — útil para CTAs.
 */
export const UpgradeIcon = ArrowUp

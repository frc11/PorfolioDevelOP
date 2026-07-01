/**
 * P5.1 — Motor de recomendaciones POR REGLAS (no IA).
 *
 * Tipos del dominio. Todo acá es PURO: cero Prisma, cero `new Date()`. Las
 * reglas leen SOLO `RecommendationSignals` (señales ya org-scoped que arma
 * `getRecommendationsForOrg`), así que estructuralmente no pueden alcanzar datos
 * de otra org — el anti-IDOR vive en la capa de datos, no en las reglas.
 */
import type { PlanKey } from '@prisma/client'

/**
 * Señales BARATAS ya org-scoped que alimentan el motor. Cada campo proviene de
 * un dato que YA se consulta filtrado por la org (o su botConfig). Las reglas
 * nunca re-consultan la DB: solo miran este objeto.
 */
export interface RecommendationSignals {
  /** Solo trazabilidad. Las reglas NO deben usarlo para leer nada. */
  organizationId: string
  /** `false` si la org no tiene bot configurado — sin bot no hay señales reales. */
  hasBot: boolean
  /** Contactos capturados en los últimos 30 días (ventana canónica de leads). */
  leadsLast30d: number
  /** Conversaciones del mes en curso (QuotaUsage). */
  conversationsThisMonth: number
  /** Leads calientes sin contactar todavía (classification=hot, status=NEW). */
  hotLeads: number
  /** Reseñas de Google conocidas (0 si no hay dato). */
  googleReviewsCount: number
  /** `true` si la ficha de Google Business está conectada. */
  gbpConnected: boolean
  /** Slugs de los módulos premium ACTIVE de la org. */
  activeModuleSlugs: string[]
  /** Dimensiones del plan efectivo que las reglas necesitan. */
  plan: {
    key: PlanKey
    reportsEnabled: boolean
    crmEnabled: boolean
  }
}

/** Color con significado (design system B13): cyan=acción, verde=bueno, ámbar=atención, violet=insight. */
export type RecommendationAccent = 'cyan' | 'emerald' | 'amber' | 'violet'

/** Clave de ícono — el componente cliente la mapea a lucide (no cruza el boundary RSC). */
export type RecommendationIconKey = 'star' | 'mapPin' | 'fileText' | 'flame' | 'sparkles'

/**
 * El "cierre en un tap": qué dispara `requestUpsellAction` y a dónde lleva el
 * pre-llenado de /dashboard/messages. Sin `organizationId` a propósito: la
 * acción resuelve la org desde la sesión, el cliente no puede targetear otra.
 */
export interface RecommendationCta {
  label: string
  /** featureKey para requestUpsellAction (slug de módulo o clave plan-upgrade-*). */
  featureKey: string
  /** featureName legible (queda en el lead + notificación al admin). */
  featureName: string
  /** context de /dashboard/messages para pre-llenar el mensaje. */
  messageContext: string
  /** Solo para context='modulo': el nombre que entra en el template. */
  moduleName?: string
}

/** Una recomendación ya construida, lista para renderizar. Objeto serializable puro. */
export interface Recommendation {
  /** id de la regla que la generó. */
  id: string
  title: string
  body: string
  accent: RecommendationAccent
  icon: RecommendationIconKey
  cta: RecommendationCta
  /** Mayor = más prioritario. Ordena la lista y fija la #1 al rotar. */
  priority: number
}

/**
 * Regla declarativa. El orden importa: `hasEnoughData` (umbral de muestra —
 * regla de honestidad 🔴) SIEMPRE se evalúa antes que `matches` (el dolor).
 */
export interface RecommendationRule {
  id: string
  /** Muestra mínima para siquiera considerar la regla. Sin esto → no dispara. */
  hasEnoughData: (s: RecommendationSignals) => boolean
  /** El dolor está presente: señal → solución pertinente (no vender por vender). */
  matches: (s: RecommendationSignals) => boolean
  /** Construye la recomendación en lenguaje de dueño. Pura. */
  build: (s: RecommendationSignals) => Recommendation
}

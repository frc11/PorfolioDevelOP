/**
 * P5.1 — Set de reglas declarativas + evaluación/selección. Todo PURO y
 * testeable (ver `recommendations.invariant.ts`). Cero Prisma, cero reloj.
 *
 * Cada regla mapea una SEÑAL presente a una SOLUCIÓN pertinente (honestidad 🔴):
 * nunca empuja un módulo que el cliente no necesita. Y ninguna dispara sin
 * muestra suficiente — recomendar sobre 3 leads es consejo trucho.
 */
import type {
  Recommendation,
  RecommendationRule,
  RecommendationSignals,
} from './types'

// ── Umbrales de muestra mínima (regla 🔴: nada dispara por debajo) ────────────
export const THRESHOLDS = {
  /** Piso de "muestra suficiente": mismo bar que CATEGORY_MIN_SAMPLE del análisis. */
  MIN_LEADS_30D: 10,
  /** Menos de estas reseñas → reputación todavía sin construir. */
  LOW_REVIEWS_MAX: 10,
  /** Conversaciones/mes que justifican un resumen ejecutivo semanal. */
  MIN_CONVERSATIONS_FOR_REPORT: 20,
  /** Leads calientes que justifican un sistema de seguimiento. */
  MIN_HOT_LEADS: 5,
} as const

/** Slug del módulo de reseñas en el catálogo premium (source of truth). */
export const MODULE_MOTOR_RESENAS = 'motor-resenas'

/** Tope de recomendaciones visibles a la vez (no saturar). */
export const MAX_VISIBLE_RECOMMENDATIONS = 3

// ── Reglas v1 (solo señales baratas) ──────────────────────────────────────────

/**
 * 1) Conectá tu ficha de Google. Dispara cuando entra tráfico real pero la ficha
 *    no está conectada. Es prerequisito de las reseñas, por eso va primero y es
 *    mutuamente excluyente con la regla de reseñas (esa exige gbpConnected).
 */
const connectGbpRule: RecommendationRule = {
  id: 'connect-gbp',
  hasEnoughData: (s) => s.hasBot && s.leadsLast30d >= THRESHOLDS.MIN_LEADS_30D,
  matches: (s) => !s.gbpConnected,
  build: (s) => ({
    id: 'connect-gbp',
    title: 'Conectá tu ficha de Google',
    body: `Este mes entraron ${s.leadsLast30d} consultas y tu ficha de Google todavía no está conectada. Conectala para aparecer cuando te buscan y medir cuántas llegan desde ahí.`,
    accent: 'cyan',
    icon: 'mapPin',
    priority: 100,
    cta: {
      label: 'Conectar Google',
      featureKey: 'conexion-google-business',
      featureName: 'Conexión de Google Business',
      messageContext: 'activacion',
    },
  }),
}

/**
 * 2) Motor de Reseñas. Dispara cuando hay tráfico, la ficha ya está conectada,
 *    hay pocas (o ninguna) reseña y el módulo no está activo. Capitaliza clientes
 *    contentos que hoy no dejan reseña.
 */
const reviewsEngineRule: RecommendationRule = {
  id: 'reviews-engine',
  hasEnoughData: (s) => s.hasBot && s.leadsLast30d >= THRESHOLDS.MIN_LEADS_30D,
  matches: (s) =>
    s.gbpConnected &&
    s.googleReviewsCount < THRESHOLDS.LOW_REVIEWS_MAX &&
    !s.activeModuleSlugs.includes(MODULE_MOTOR_RESENAS),
  build: (s) => {
    const reviewsPhrase =
      s.googleReviewsCount === 0
        ? 'todavía no tenés reseñas en Google'
        : `solo tenés ${s.googleReviewsCount} ${s.googleReviewsCount === 1 ? 'reseña' : 'reseñas'} en Google`
    return {
      id: 'reviews-engine',
      title: 'Convertí tus consultas en reseñas',
      body: `Tuviste ${s.leadsLast30d} consultas este mes y ${reviewsPhrase}. El Motor de Reseñas le pide la reseña a tus clientes contentos y responde por vos, para que tu reputación crezca sola.`,
      accent: 'amber',
      icon: 'star',
      priority: 90,
      cta: {
        label: 'Ver Motor de Reseñas',
        featureKey: MODULE_MOTOR_RESENAS,
        featureName: 'Motor de Reseñas Automático',
        messageContext: 'modulo',
        moduleName: 'Motor de Reseñas Automático',
      },
    }
  },
}

/**
 * 3) Seguimiento de leads (Business). Dispara cuando se acumulan leads calientes
 *    y el plan no incluye CRM: son ventas a punto que hoy se pueden enfriar.
 */
const hotLeadsCrmRule: RecommendationRule = {
  id: 'hot-leads-crm',
  hasEnoughData: (s) => s.hasBot && s.hotLeads >= THRESHOLDS.MIN_HOT_LEADS,
  matches: (s) => !s.plan.crmEnabled,
  build: (s) => ({
    id: 'hot-leads-crm',
    title: 'No dejes enfriar tus leads calientes',
    body: `Tenés ${s.hotLeads} leads calientes esperando respuesta. Con el seguimiento de leads del plan Business los tenés a todos en un tablero y no se te escapa ninguno.`,
    accent: 'emerald',
    icon: 'flame',
    priority: 85,
    cta: {
      label: 'Ver plan Business',
      featureKey: 'plan-upgrade-business',
      featureName: 'Plan Business',
      messageContext: 'plan-upgrade-business',
    },
  }),
}

/**
 * 4) Resumen ejecutivo (Pro). Dispara cuando hay actividad sostenida y el plan
 *    no incluye reportes: un resumen semanal le ahorra revisar todo a mano.
 */
const executiveReportRule: RecommendationRule = {
  id: 'executive-report',
  hasEnoughData: (s) =>
    s.hasBot &&
    (s.conversationsThisMonth >= THRESHOLDS.MIN_CONVERSATIONS_FOR_REPORT ||
      s.leadsLast30d >= THRESHOLDS.MIN_LEADS_30D),
  matches: (s) => !s.plan.reportsEnabled,
  build: (s) => {
    const activityPhrase =
      s.conversationsThisMonth >= THRESHOLDS.MIN_CONVERSATIONS_FOR_REPORT
        ? `${s.conversationsThisMonth} conversaciones este mes`
        : `${s.leadsLast30d} consultas este mes`
    return {
      id: 'executive-report',
      title: 'Recibí un resumen de tu semana',
      body: `Tu asistente ya maneja ${activityPhrase}. Con el plan Pro te llega cada lunes un resumen claro de cómo viene tu negocio, sin que tengas que revisar todo a mano.`,
      accent: 'violet',
      icon: 'fileText',
      priority: 70,
      cta: {
        label: 'Ver plan Pro',
        featureKey: 'plan-upgrade-pro',
        featureName: 'Plan Pro',
        messageContext: 'plan-upgrade-pro',
      },
    }
  },
}

/** Set completo de reglas v1. El orden acá no importa: se ordena por prioridad. */
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  connectGbpRule,
  reviewsEngineRule,
  hotLeadsCrmRule,
  executiveReportRule,
]

// ── Evaluación + selección (puras) ────────────────────────────────────────────

function sortByPriority(recs: Recommendation[]): Recommendation[] {
  // Prioridad desc; desempate estable por id para que el orden sea determinista.
  return [...recs].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
}

/**
 * Evalúa TODAS las reglas para unas señales y devuelve las que disparan, ordenadas
 * por prioridad. Umbral de muestra primero (🔴), después el dolor. Función pura:
 * mismo input → mismo output, y solo mira `signals` (anti-IDOR estructural).
 */
export function evaluateRules(
  signals: RecommendationSignals,
  rules: RecommendationRule[] = RECOMMENDATION_RULES,
): Recommendation[] {
  const fired: Recommendation[] = []
  for (const rule of rules) {
    if (!rule.hasEnoughData(signals)) continue
    if (!rule.matches(signals)) continue
    fired.push(rule.build(signals))
  }
  return sortByPriority(fired)
}

/**
 * Selección visible con tope + rotación honesta.
 * - Todas las candidatas YA son pertinentes (pasaron umbral + condición): mostrar
 *   cualquier subconjunto es honesto, nunca inventado.
 * - La #1 por prioridad queda fija (lo más urgente siempre visible).
 * - El resto rota por `seed` (semana AR) para no mostrar siempre lo mismo cuando
 *   hay más candidatas que `max`.
 */
export function selectVisibleRecommendations(
  recs: Recommendation[],
  seed: number,
  max: number = MAX_VISIBLE_RECOMMENDATIONS,
): Recommendation[] {
  if (max <= 0) return []
  const ordered = sortByPriority(recs)
  if (ordered.length <= max) return ordered

  const [head, ...rest] = ordered
  const offset = ((Math.trunc(seed) % rest.length) + rest.length) % rest.length
  const rotated = [...rest.slice(offset), ...rest.slice(0, offset)]
  return [head, ...rotated.slice(0, max - 1)]
}

/** Motor completo puro: evalúa reglas + aplica tope y rotación. */
export function computeRecommendations(
  signals: RecommendationSignals,
  seed: number,
  max: number = MAX_VISIBLE_RECOMMENDATIONS,
): Recommendation[] {
  return selectVisibleRecommendations(evaluateRules(signals), seed, max)
}

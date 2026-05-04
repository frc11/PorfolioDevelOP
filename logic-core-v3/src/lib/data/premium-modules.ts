import type { PremiumModuleTier, PremiumModuleStatus } from '@prisma/client'

export type PremiumModuleSeed = {
  slug: string
  name: string
  shortDescription: string
  longDescription?: string
  tier: PremiumModuleTier
  priceMonthlyUsd: number
  iconName: string
  accentColor: string
  validRubros?: string[]
  status: PremiumModuleStatus
  sortOrder: number
}

/**
 * Catálogo completo de módulos premium.
 * SOURCE OF TRUTH del catálogo. Cualquier cambio se hace acá.
 */
export const PREMIUM_MODULES_CATALOG: PremiumModuleSeed[] = [
  // ─── Vendibles YA (4 módulos WIRE) ───
  {
    slug: 'motor-resenas',
    name: 'Motor de Reseñas Automático',
    shortDescription:
      'Generá reseñas positivas en Google y potenciá tu reputación sin seguimiento manual.',
    longDescription:
      'Conectamos tu Google Business Profile y monitoreamos las reseñas que llegan. La IA genera respuestas profesionales que vos aprobás con un click. Además te ayudamos a pedir reseñas a clientes satisfechos automáticamente.',
    tier: 'TIER_2_GROWTH',
    priceMonthlyUsd: 60,
    iconName: 'Star',
    accentColor: '#facc15',
    status: 'ACTIVE',
    sortOrder: 1,
  },
  {
    slug: 'email-marketing-pro',
    name: 'Email Marketing Pro',
    shortDescription:
      'Campañas, secuencias y newsletters profesionales conectadas a tu base de clientes.',
    longDescription:
      'Plataforma completa de email marketing white-label. Diseñá campañas con templates, segmentá tu audiencia, mandá newsletters automáticos y medí aperturas/clicks. Todo desde tu panel develOP.',
    tier: 'TIER_2_GROWTH',
    priceMonthlyUsd: 80,
    iconName: 'Mail',
    accentColor: '#06b6d4',
    status: 'ACTIVE',
    sortOrder: 2,
  },
  {
    slug: 'agenda-inteligente',
    name: 'Agenda Inteligente 24/7',
    shortDescription:
      'Tus clientes reservan turnos en cualquier momento sin idas y vueltas por WhatsApp.',
    longDescription:
      'Sistema de reservas integrado a tu sitio. Tus clientes ven tu disponibilidad real, eligen horario y reservan solos. Recordatorios automáticos. Sincronización con Google Calendar.',
    tier: 'TIER_3_VERTICAL',
    priceMonthlyUsd: 80,
    iconName: 'Calendar',
    accentColor: '#10b981',
    validRubros: ['health', 'fitness', 'beauty', 'professional-services'],
    status: 'ACTIVE',
    sortOrder: 3,
  },
  {
    slug: 'tienda-conectada',
    name: 'Tienda Online Conectada',
    shortDescription:
      'Tu tienda online y tu panel hablando entre sí. Stock, ventas, abandonos: todo en un lugar.',
    longDescription:
      'Integración completa con Tiendanube. Ventas, productos, stock, abandonos de carrito y métricas comerciales aparecen en tu panel develOP. Alertas automáticas cuando un producto se queda sin stock.',
    tier: 'TIER_3_VERTICAL',
    priceMonthlyUsd: 150,
    iconName: 'ShoppingBag',
    accentColor: '#8b5cf6',
    validRubros: ['retail', 'commerce', 'food'],
    status: 'ACTIVE',
    sortOrder: 4,
  },

  // ─── Próximamente (5 módulos en construcción) ───
  {
    slug: 'whatsapp-autopilot',
    name: 'WhatsApp Autopilot',
    shortDescription:
      'Tu negocio responde consultas, califica leads y agenda turnos por WhatsApp. Solo.',
    longDescription:
      'Agente IA conectado directamente a WhatsApp Business. Responde 24/7 con la voz de tu marca, califica leads automáticamente y agenda turnos en tu calendario.',
    tier: 'TIER_1_OPERATION',
    priceMonthlyUsd: 150,
    iconName: 'MessageCircle',
    accentColor: '#22c55e',
    status: 'COMING_SOON',
    sortOrder: 10,
  },
  {
    slug: 'facturacion-afip',
    name: 'Facturación AFIP Automática',
    shortDescription:
      'Generá facturas A, B y C desde tu panel. Sin Excel, sin contadores intermedios.',
    longDescription:
      'Conectamos tu certificado AFIP y emitís facturas electrónicas en 30 segundos. Validación de CUIT en tiempo real, padrón actualizado automáticamente.',
    tier: 'TIER_1_OPERATION',
    priceMonthlyUsd: 120,
    iconName: 'Receipt',
    accentColor: '#f59e0b',
    status: 'COMING_SOON',
    sortOrder: 11,
  },
  {
    slug: 'mini-crm',
    name: 'Mini-CRM Comercial',
    shortDescription:
      'Pipeline de ventas, seguimiento de leads y historial de cada cliente en un solo lugar.',
    longDescription:
      'CRM diseñado para PyMEs argentinas. Sin la complejidad de HubSpot ni el caos del Excel. Pipeline visual, recordatorios de seguimiento, integración con WhatsApp y email.',
    tier: 'TIER_1_OPERATION',
    priceMonthlyUsd: 80,
    iconName: 'Users',
    accentColor: '#3b82f6',
    status: 'COMING_SOON',
    sortOrder: 12,
  },
  {
    slug: 'cobranzas-automatizadas',
    name: 'Cobranzas Automatizadas',
    shortDescription:
      'Persigue cobros pendientes con secuencias de WhatsApp y email automáticas.',
    longDescription:
      'Detectamos facturas vencidas y enviamos recordatorios escalonados a tus deudores. Reportes semanales de cobranzas pendientes y proyección de cobros.',
    tier: 'TIER_1_OPERATION',
    priceMonthlyUsd: 90,
    iconName: 'DollarSign',
    accentColor: '#ef4444',
    status: 'COMING_SOON',
    sortOrder: 13,
  },
  {
    slug: 'reactivacion-clientes',
    name: 'Reactivación de Clientes',
    shortDescription:
      'Detecta clientes que dejaron de comprar y los recupera con campañas inteligentes.',
    longDescription:
      'Análisis automático de tu base de clientes para identificar inactivos. Generamos campañas personalizadas con ofertas relevantes para cada segmento de churn.',
    tier: 'TIER_2_GROWTH',
    priceMonthlyUsd: 90,
    iconName: 'TrendingUp',
    accentColor: '#ec4899',
    status: 'COMING_SOON',
    sortOrder: 14,
  },
]

/**
 * Helpers para consumir el catálogo
 */
export function getActiveModules(): PremiumModuleSeed[] {
  return PREMIUM_MODULES_CATALOG.filter((m) => m.status === 'ACTIVE')
}

export function getComingSoonModules(): PremiumModuleSeed[] {
  return PREMIUM_MODULES_CATALOG.filter((m) => m.status === 'COMING_SOON')
}

export function getModuleBySlug(slug: string): PremiumModuleSeed | undefined {
  return PREMIUM_MODULES_CATALOG.find((m) => m.slug === slug)
}

export const PREMIUM_FEATURE_CATALOG = [
  {
    key: 'whatsapp-autopilot',
    label: 'Recepcionista IA & WhatsApp Autopilot',
    description: 'Capta consultas, responde FAQs y deriva conversaciones en WhatsApp.',
    shortDescription: 'Atiende leads, responde consultas y automatiza WhatsApp.',
    defaultPrice: 150,
    defaultType: 'monthly',
  },
  {
    key: 'agenda-inteligente',
    label: 'Agenda Inteligente 24/7',
    description: 'Reservas automáticas, recordatorios y disponibilidad en tiempo real.',
    shortDescription: 'Agenda online con recordatorios y disponibilidad automática.',
    defaultPrice: 80,
    defaultType: 'monthly',
  },
  {
    key: 'social-media-hub',
    label: 'Social Media & Content Hub',
    description: 'Centraliza contenido, calendarios y piezas para campañas recurrentes.',
    shortDescription: 'Organiza contenido, publicaciones y flujos sociales.',
    defaultPrice: 200,
    defaultType: 'monthly',
  },
  {
    key: 'seo-avanzado',
    label: 'Dominio de Búsqueda Local',
    description: 'Seguimiento avanzado de visibilidad, oportunidades y posicionamiento local.',
    shortDescription: 'Posicionamiento local y visibilidad avanzada en búsquedas.',
    defaultPrice: 120,
    defaultType: 'monthly',
  },
  {
    key: 'ecommerce',
    label: 'Vendé Mientras Dormís',
    description: 'Catálogo, checkout y automatizaciones orientadas a conversión.',
    shortDescription: 'Catálogo, checkout e ingresos online 24/7.',
    defaultPrice: 300,
    defaultType: 'one-time',
  },
  {
    key: 'pixel-retargeting',
    label: 'Recuperación de Ventas',
    description: 'Recupera carritos y audiencias con retargeting automatizado.',
    shortDescription: 'Retargeting para recuperar visitantes y ventas perdidas.',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'motor-resenias',
    label: 'Motor de Reseñas Automático',
    description: 'Solicita, organiza y potencia reseñas para reputación online.',
    shortDescription: 'Solicita y amplifica reseñas de forma automática.',
    defaultPrice: 60,
    defaultType: 'monthly',
  },
  {
    key: 'mini-crm',
    label: 'Mini-CRM & Gestión de Leads',
    description: 'Pipeline visual para leads, seguimientos y próximos pasos comerciales.',
    shortDescription: 'Pipeline simple para leads, seguimiento y cierres.',
    defaultPrice: 80,
    defaultType: 'monthly',
  },
  {
    key: 'email-nurturing',
    label: 'Email Marketing & Nurturing',
    description: 'Secuencias de email para convertir leads y reactivar oportunidades.',
    shortDescription: 'Campañas de nurturing para madurar y reactivar leads.',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'email-automation',
    label: 'Email Automation',
    description: 'Flujos transaccionales y automatizaciones ligadas a eventos del negocio.',
    shortDescription: 'Automatizaciones de email disparadas por eventos.',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'client-portal',
    label: 'Portal de Clientes White-label',
    description: 'Experiencia branded con accesos, entregables y seguimiento centralizado.',
    shortDescription: 'Portal white-label para entregables y comunicación.',
    defaultPrice: 120,
    defaultType: 'monthly',
  },
] as const

export type PremiumFeatureKey = (typeof PREMIUM_FEATURE_CATALOG)[number]['key']

function formatPriceLabel(price: number, type: string) {
  return type === 'one-time' ? `USD ${price} único` : `USD ${price}/mes`
}

export const PREMIUM_FEATURE_OPTIONS = PREMIUM_FEATURE_CATALOG.map((feature) => ({
  key: feature.key,
  label: feature.label,
  description: feature.description,
  priceLabel: formatPriceLabel(feature.defaultPrice, feature.defaultType),
})) as Array<{
  key: PremiumFeatureKey
  label: string
  description: string
  priceLabel: string
}>

export const PREMIUM_FEATURE_KEYS = PREMIUM_FEATURE_CATALOG.map((feature) => feature.key)

export const PREMIUM_FEATURE_LABELS = Object.fromEntries(
  PREMIUM_FEATURE_CATALOG.map((feature) => [feature.key, feature.label]),
) as Record<PremiumFeatureKey, string>

export const PREMIUM_FEATURE_DEFAULTS = Object.fromEntries(
  PREMIUM_FEATURE_CATALOG.map((feature) => [
    feature.key,
    {
      name: feature.label,
      price: feature.defaultPrice,
      type: feature.defaultType,
    },
  ]),
) as Record<
  PremiumFeatureKey,
  {
    name: string
    price: number
    type: string
  }
>

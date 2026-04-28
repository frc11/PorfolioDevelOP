import { PrismaClient, PremiumModuleTier, PremiumModuleStatus } from '@prisma/client'

const prisma = new PrismaClient()

const MODULES_CATALOG = [
  // TIER 1 — Operación crítica
  {
    slug: 'whatsapp-autopilot',
    name: 'WhatsApp Autopilot',
    shortDescription: 'Tu negocio responde solo, 24/7',
    longDescription: 'Atendemos automáticamente las consultas por WhatsApp con IA entrenada en tu negocio. Calificamos leads y agendamos turnos sin intervención humana.',
    tier: PremiumModuleTier.TIER_1_OPERATION,
    priceMonthlyUsd: 150,
    iconName: 'MessageCircle',
    accentColor: '#06b6d4',
    validRubros: [],
    sortOrder: 1,
  },
  {
    slug: 'facturacion-afip',
    name: 'Facturación AFIP Automatizada',
    shortDescription: 'Tus ventas se facturan solas en AFIP',
    longDescription: 'Cada venta de MercadoPago genera automáticamente la factura electrónica AFIP y se envía al cliente. Cumplimiento total sin trabajo manual.',
    tier: PremiumModuleTier.TIER_1_OPERATION,
    priceMonthlyUsd: 120,
    iconName: 'Receipt',
    accentColor: '#f59e0b',
    validRubros: [],
    sortOrder: 2,
  },
  {
    slug: 'mini-crm',
    name: 'Mini-CRM + Pipeline',
    shortDescription: 'Tu Excel de contactos, pero inteligente',
    longDescription: 'Pipeline visual de ventas, seguimiento de leads e historial de cada cliente. Integrado con WhatsApp Autopilot para registrar conversaciones automáticamente.',
    tier: PremiumModuleTier.TIER_1_OPERATION,
    priceMonthlyUsd: 80,
    iconName: 'Users',
    accentColor: '#8b5cf6',
    validRubros: [],
    sortOrder: 3,
  },
  {
    slug: 'cobranzas-automatizadas',
    name: 'Cobranzas Automatizadas',
    shortDescription: 'Cobrá a tiempo, sin perseguir clientes',
    longDescription: 'Recordatorios automáticos de cuentas por cobrar por WhatsApp y email. Detecta vencimientos y escala según días de atraso.',
    tier: PremiumModuleTier.TIER_1_OPERATION,
    priceMonthlyUsd: 90,
    iconName: 'DollarSign',
    accentColor: '#10b981',
    validRubros: [],
    sortOrder: 4,
  },

  // TIER 2 — Crecimiento
  {
    slug: 'email-marketing',
    name: 'Email Marketing',
    shortDescription: 'Llegá a tu base con campañas profesionales',
    longDescription: 'Campañas de email marketing diseñadas y enviadas por nuestro equipo. Reportes de aperturas, clicks y conversiones en tiempo real.',
    tier: PremiumModuleTier.TIER_2_GROWTH,
    priceMonthlyUsd: 100,
    iconName: 'Mail',
    accentColor: '#3b82f6',
    validRubros: [],
    sortOrder: 5,
  },
  {
    slug: 'motor-resenas',
    name: 'Motor de Reseñas Google',
    shortDescription: 'Más reseñas positivas, automáticamente',
    longDescription: 'Pedimos reseñas a tus clientes después de cada compra y respondemos automáticamente las que llegan a tu Google Business Profile.',
    tier: PremiumModuleTier.TIER_2_GROWTH,
    priceMonthlyUsd: 60,
    iconName: 'Star',
    accentColor: '#fbbf24',
    validRubros: [],
    sortOrder: 6,
  },
  {
    slug: 'reactivacion-clientes',
    name: 'Reactivación de Clientes',
    shortDescription: 'Recuperá clientes que dejaron de comprar',
    longDescription: 'Detectamos clientes inactivos hace X meses y les enviamos mensajes automáticos de reactivación con ofertas personalizadas.',
    tier: PremiumModuleTier.TIER_2_GROWTH,
    priceMonthlyUsd: 90,
    iconName: 'RefreshCw',
    accentColor: '#ec4899',
    validRubros: [],
    sortOrder: 7,
  },

  // TIER 3 — Específicos por rubro
  {
    slug: 'agenda-inteligente',
    name: 'Agenda Inteligente',
    shortDescription: 'Tus clientes reservan turnos solos',
    longDescription: 'Calendario online con confirmaciones por WhatsApp. Reduce ausencias drásticamente. Ideal para consultorios, gimnasios y peluquerías.',
    tier: PremiumModuleTier.TIER_3_VERTICAL,
    priceMonthlyUsd: 80,
    iconName: 'Calendar',
    accentColor: '#14b8a6',
    validRubros: ['health', 'fitness', 'beauty'],
    sortOrder: 8,
  },
  {
    slug: 'ecommerce-mantenimiento',
    name: 'E-commerce Setup + Mantenimiento',
    shortDescription: 'Vendé online sin complicaciones',
    longDescription: 'Setup completo de tu tienda online en Tiendanube y mantenimiento mensual. Catálogo, pagos, envíos y reportes en un solo lugar.',
    tier: PremiumModuleTier.TIER_3_VERTICAL,
    priceMonthlyUsd: 150,
    iconName: 'ShoppingBag',
    accentColor: '#f97316',
    validRubros: ['retail', 'commerce'],
    sortOrder: 9,
  },
] as const

async function seedPremiumModules() {
  console.log('🌱 Seeding premium modules catalog...')

  for (const moduleData of MODULES_CATALOG) {
    await prisma.premiumModule.upsert({
      where: { slug: moduleData.slug },
      create: {
        ...moduleData,
        validRubros: [...moduleData.validRubros],
        status: PremiumModuleStatus.ACTIVE,
      },
      update: {
        name: moduleData.name,
        shortDescription: moduleData.shortDescription,
        longDescription: moduleData.longDescription,
        tier: moduleData.tier,
        priceMonthlyUsd: moduleData.priceMonthlyUsd,
        iconName: moduleData.iconName,
        accentColor: moduleData.accentColor,
        validRubros: [...moduleData.validRubros],
        sortOrder: moduleData.sortOrder,
      },
    })
    console.log(`  ✓ ${moduleData.slug}`)
  }

  console.log(`✅ ${MODULES_CATALOG.length} modules seeded`)
}

seedPremiumModules()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

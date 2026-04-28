import {
  ActivityChannel,
  ActivityResult,
  ApprovalStatus,
  LeadStatus,
  MilestoneType,
  OrgRole,
  OsServiceType,
  Prisma,
  PrismaClient,
  ProjectStatus,
  Role,
  ServiceStatus,
  ServiceType,
  SubscriptionStatus,
  TaskStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  type Organization,
  type User,
} from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DEFAULT_AGENCY_SETTINGS_ID = 'agency-settings-default'
const DEFAULT_AGENCY_SETTINGS = {
  id: DEFAULT_AGENCY_SETTINGS_ID,
  agencyName: 'develOP',
  contactEmail: 'hello@develop.com.ar',
  contactWhatsapp: '',
  websiteUrl: 'https://develop.com.ar',
  alertWebhookUrl: '',
  alertOnTickets: true,
  alertOnLeads: true,
  alertOnChurn: true,
  alertOnExpiringSubscriptions: true,
  alertOnClientMessages: false,
  osWeeklyDemoTarget: 8,
  osTelegramBotToken: '',
  osTelegramChatId: '',
} as const
const PREMIUM_FEATURE_CATALOG = [
  {
    key: 'whatsapp-autopilot',
    label: 'Recepcionista IA & WhatsApp Autopilot',
    defaultPrice: 150,
    defaultType: 'monthly',
  },
  {
    key: 'agenda-inteligente',
    label: 'Agenda Inteligente 24/7',
    defaultPrice: 80,
    defaultType: 'monthly',
  },
  {
    key: 'social-media-hub',
    label: 'Social Media & Content Hub',
    defaultPrice: 200,
    defaultType: 'monthly',
  },
  {
    key: 'seo-avanzado',
    label: 'Dominio de Busqueda Local',
    defaultPrice: 120,
    defaultType: 'monthly',
  },
  {
    key: 'ecommerce',
    label: 'Vende Mientras Dormis',
    defaultPrice: 300,
    defaultType: 'one-time',
  },
  {
    key: 'pixel-retargeting',
    label: 'Recuperacion de Ventas',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'motor-resenias',
    label: 'Motor de Resenias Automatico',
    defaultPrice: 60,
    defaultType: 'monthly',
  },
  {
    key: 'mini-crm',
    label: 'Mini-CRM & Gestion de Leads',
    defaultPrice: 80,
    defaultType: 'monthly',
  },
  {
    key: 'email-nurturing',
    label: 'Email Marketing & Nurturing',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'email-automation',
    label: 'Email Automation',
    defaultPrice: 100,
    defaultType: 'monthly',
  },
  {
    key: 'client-portal',
    label: 'Portal de Clientes White-label',
    defaultPrice: 120,
    defaultType: 'monthly',
  },
] as const

type MemberKey = 'franco' | 'valentino'

type LeadActivitySeed = {
  channel: ActivityChannel
  result: ActivityResult | null
  notes: string
  performedBy: MemberKey
  createdAt: Date
}

type DemoSeed = {
  serviceType: OsServiceType | null
  demoUrl: string
  loomUrl: string | null
  sentAt: Date
  viewedAt: Date | null
  notes: string | null
}

type LeadSeed = {
  businessName: string
  contactName: string
  phone: string
  email: string
  industry: string
  zone: string
  source: string
  instagramHandle: string | null
  currentWebUrl: string | null
  googleMapsQuery: string
  status: LeadStatus
  serviceType: OsServiceType | null
  assignedTo: MemberKey
  notes: string
  firstTouch: string
  demoFocus: string
  responseNote: string
  demoCount: 0 | 1 | 2
  nextFollowUpMode?: 'demo-1' | 'demo-2' | 'tomorrow'
  reactivateInDays?: number
  createdAt: Date
}

type TaskSeed = {
  title: string
  description: string
  status: TaskStatus
  estimatedHours: number
  assignedTo: MemberKey
  position: number
  dueDate?: Date | null
  approvalStatus?: ApprovalStatus | null
  rejectionReason?: string | null
}

type TimeEntrySeed = {
  taskTitle: string
  member: MemberKey
  hours: number
  date: Date
  notes: string
}

type ProjectSeed = {
  businessName: string
  organizationSlug: string | null
  linkedLeadBusinessName: string | null
  name: string
  description: string
  serviceType: OsServiceType
  status: ProjectStatus
  agreedAmount: string
  monthlyRate: string | null
  startDate: Date
  estimatedEndDate: Date | null
  deliveredAt: Date | null
  maintenanceStartDate: Date | null
  tasks: TaskSeed[]
  timeEntries: TimeEntrySeed[]
  maintenancePayments: Array<{
    month: number
    year: number
    amount: string
    paidAt: Date | null
  }>
  milestonePaidAt: {
    INICIO: Date | null
    ENTREGA: Date | null
  }
}

type OrganizationSeed = {
  slug: string
  companyName: string
  siteUrl: string
  whatsapp: string
  clientName: string
  clientEmail: string
  notificationPrefs?: Record<string, unknown>
  serviceType: ServiceType
  subscription: {
    planName: string
    status: SubscriptionStatus
    price: number
    currency: string
    renewalDate: Date | null
  }
}

type TicketSeed = {
  organizationSlug: string
  title: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
  messages: Array<{
    content: string
    author: 'client' | MemberKey
    isAdmin: boolean
    createdAt: Date
  }>
}

type ConversationMessageSeed = {
  organizationSlug: string
  content: string
  fromAdmin: boolean
  read: boolean
  createdAt: Date
}

type ContactSubmissionSeed = {
  name: string
  email: string
  phone: string
  company: string
  service: string
  message: string
  createdAt: Date
}

function daysAgo(days: number, hour = 10, minute = 0): Date {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return new Date(date.getTime() - days * DAY_IN_MS)
}

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return new Date(date.getTime() + days * DAY_IN_MS)
}

function offsetMonth(monthOffset: number) {
  const date = new Date()
  date.setMonth(date.getMonth() + monthOffset)
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

function calculateSeedNextFollowUp(currentFollowUpNumber: number): Date | null {
  if (currentFollowUpNumber === 1 || currentFollowUpNumber === 2) return daysFromNow(2)
  if (currentFollowUpNumber === 3) return daysFromNow(3)
  return null
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function seedId(prefix: string, ...parts: string[]) {
  return ['osv2', prefix, ...parts.map((part) => slugify(part))].join('-')
}

function mapsUrl(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`
}

function instagramUrl(handle: string | null): string | null {
  return handle ? `https://instagram.com/${handle}` : null
}

function demoUrlFor(businessName: string, version: number): string {
  return `https://demo.develop.com.ar/agency-os/${slugify(businessName)}/v${version}`
}

function loomUrlFor(businessName: string, version: number): string {
  return `https://www.loom.com/share/${slugify(businessName)}-v${version}`
}

function halfAmount(amount: string): string {
  return (Number.parseFloat(amount) / 2).toFixed(2)
}

function preferredMatch(user: Pick<User, 'name' | 'email'>, keyword: string): boolean {
  const haystack = `${user.name ?? ''} ${user.email}`.toLowerCase()
  return haystack.includes(keyword)
}

function mapOsServiceTypeToPortal(type: OsServiceType): ServiceType {
  switch (type) {
    case OsServiceType.WEB:
      return ServiceType.WEB_DEV
    case OsServiceType.AI_AGENT:
      return ServiceType.AI
    case OsServiceType.AUTOMATION:
      return ServiceType.AUTOMATION
    case OsServiceType.CUSTOM_SOFTWARE:
      return ServiceType.SOFTWARE
  }
}

async function getAgencyMembers(): Promise<Record<MemberKey, User>> {
  const superAdmins = await prisma.user.findMany({
    where: { role: Role.SUPER_ADMIN },
    orderBy: [{ createdAt: 'asc' }],
  })

  const adminPassword = await bcrypt.hash('Admin1234!', 12)

  const franco =
    superAdmins.find((user) => preferredMatch(user, 'franco')) ??
    (await prisma.user.upsert({
      where: { email: 'franco@develop.com' },
      update: {
        name: 'Franco DevelOP',
        role: Role.SUPER_ADMIN,
        password: adminPassword,
        emailVerified: new Date(),
      },
      create: {
        id: seedId('user', 'franco'),
        name: 'Franco DevelOP',
        email: 'franco@develop.com',
        role: Role.SUPER_ADMIN,
        password: adminPassword,
        emailVerified: new Date(),
      },
    }))

  const valentino =
    superAdmins.find((user) => preferredMatch(user, 'valentino')) ??
    (await prisma.user.upsert({
      where: { email: 'valentino@develop.com' },
      update: {
        name: 'Valentino DevelOP',
        role: Role.SUPER_ADMIN,
        password: adminPassword,
        emailVerified: new Date(),
      },
      create: {
        id: seedId('user', 'valentino'),
        name: 'Valentino DevelOP',
        email: 'valentino@develop.com',
        role: Role.SUPER_ADMIN,
        password: adminPassword,
        emailVerified: new Date(),
      },
    }))

  return { franco, valentino }
}

const organizationSeeds: OrganizationSeed[] = [
  {
    slug: 'san-miguel',
    companyName: 'Concesionaria San Miguel S.A.',
    siteUrl: 'https://sanmiguelautos.com.ar',
    whatsapp: '+54 381 555 1210',
    clientName: 'Carlos Mendoza',
    clientEmail: 'cliente@sanmiguel.com',
    notificationPrefs: {
      gaPropertyId: 'properties/123456789',
      searchConsoleSiteUrl: 'https://sanmiguelautos.com.ar',
    },
    serviceType: ServiceType.WEB_DEV,
    subscription: {
      planName: 'Plan Growth Commerce',
      status: SubscriptionStatus.ACTIVE,
      price: 180,
      currency: 'USD',
      renewalDate: daysFromNow(21),
    },
  },
  {
    slug: 'sonrisa-norte',
    companyName: 'Clinica Dental Sonrisa Norte',
    siteUrl: 'https://sonrisanorte.com',
    whatsapp: '+54 381 555 1211',
    clientName: 'Diego Salas',
    clientEmail: 'cliente@sonrisanorte.com',
    notificationPrefs: {
      notes: 'Equipo de recepcion y direccion comparten accesos al portal.',
    },
    serviceType: ServiceType.AI,
    subscription: {
      planName: 'Plan AI Care',
      status: SubscriptionStatus.ACTIVE,
      price: 140,
      currency: 'USD',
      renewalDate: daysFromNow(14),
    },
  },
  {
    slug: 'sigma-contable',
    companyName: 'Estudio Contable Sigma',
    siteUrl: 'https://sigmacontable.com.ar',
    whatsapp: '+54 381 555 1290',
    clientName: 'Marina Paz',
    clientEmail: 'cliente@sigma-contable.com',
    notificationPrefs: {
      notes: 'Cliente en mantenimiento con consultas operativas mensuales.',
    },
    serviceType: ServiceType.WEB_DEV,
    subscription: {
      planName: 'Plan Maintenance',
      status: SubscriptionStatus.PAST_DUE,
      price: 95,
      currency: 'USD',
      renewalDate: daysAgo(4),
    },
  },
]

const baseLeadSeeds: Array<Omit<LeadSeed, 'createdAt'>> = [
  {
    businessName: 'Ferreteria El Constructor',
    contactName: 'Miguel Soria',
    phone: '+54 381 555 1201',
    email: 'miguel@elconstructor.com.ar',
    industry: 'Ferreteria',
    zone: 'San Miguel de Tucuman',
    source: 'Google Maps',
    instagramHandle: 'elconstructorferreteria',
    currentWebUrl: null,
    googleMapsQuery: 'Ferreteria El Constructor San Miguel de Tucuman',
    status: LeadStatus.PROSPECTO,
    serviceType: OsServiceType.WEB,
    assignedTo: 'franco',
    notes: 'Local con buena reputacion en Google Maps y sin presencia web propia.',
    firstTouch: 'Detectamos que no tienen sitio propio ni catalogo digital.',
    demoFocus: 'Sitio institucional con catalogo y CTA de WhatsApp.',
    responseNote: 'Quedaron pendientes de respuesta inicial.',
    demoCount: 0,
  },
  {
    businessName: 'Gimnasio Atlas Tucuman',
    contactName: 'Luciano Ovejero',
    phone: '+54 381 555 1202',
    email: 'atlas@gymtucuman.com',
    industry: 'Gym',
    zone: 'Yerba Buena',
    source: 'Google Maps',
    instagramHandle: 'atlas.tucuman',
    currentWebUrl: 'https://gym-atlas-tucuman.com.ar',
    googleMapsQuery: 'Gimnasio Atlas Yerba Buena Tucuman',
    status: LeadStatus.PROSPECTO,
    serviceType: OsServiceType.AI_AGENT,
    assignedTo: 'valentino',
    notes: 'Busca automatizar consultas y altas por WhatsApp.',
    firstTouch: 'Mostramos oportunidad para automatizar altas y preguntas frecuentes.',
    demoFocus: 'Agente IA para consultas y seguimiento de interesados.',
    responseNote: 'Aun sin respuesta.',
    demoCount: 0,
  },
  {
    businessName: 'Estudio Juridico Del Parque',
    contactName: 'Paula Medina',
    phone: '+54 381 555 1203',
    email: 'paula@juridicodelparque.com.ar',
    industry: 'Estudio juridico',
    zone: 'Barrio Norte',
    source: 'Google Maps',
    instagramHandle: null,
    currentWebUrl: null,
    googleMapsQuery: 'Estudio Juridico Del Parque Tucuman',
    status: LeadStatus.PROSPECTO,
    serviceType: OsServiceType.CUSTOM_SOFTWARE,
    assignedTo: 'franco',
    notes: 'Necesita centralizar consultas y derivaciones entre socios.',
    firstTouch: 'Vimos una necesidad clara de intake ordenado para nuevos casos.',
    demoFocus: 'Backoffice para intake y derivacion de consultas.',
    responseNote: 'Aun sin respuesta.',
    demoCount: 0,
  },
  {
    businessName: 'Restaurante El Portal Yerba Buena',
    contactName: 'Carolina Figueroa',
    phone: '+54 381 555 1204',
    email: 'carolina@elportalyb.com.ar',
    industry: 'Restaurante',
    zone: 'Yerba Buena',
    source: 'Instagram',
    instagramHandle: 'elportalyerbabuena',
    currentWebUrl: 'https://elportalyerbabuena.com.ar',
    googleMapsQuery: 'Restaurante El Portal Yerba Buena Tucuman',
    status: LeadStatus.DEMO_ENVIADA,
    serviceType: OsServiceType.WEB,
    assignedTo: 'valentino',
    notes: 'Quieren renovar la carta digital y mejorar reservas desde Instagram.',
    firstTouch: 'Se detecto potencial para mejorar reservas y conversion desde redes.',
    demoFocus: 'Home, menu digital y modulo de reservas.',
    responseNote: 'Todavia no respondieron despues del envio del Loom.',
    demoCount: 1,
    nextFollowUpMode: 'demo-1',
  },
  {
    businessName: 'Inmobiliaria Laprida Propiedades',
    contactName: 'Federico Luna',
    phone: '+54 381 555 1205',
    email: 'federico@lapridapropiedades.com',
    industry: 'Inmobiliaria',
    zone: 'Centro',
    source: 'Referido',
    instagramHandle: 'lapridapropiedades',
    currentWebUrl: 'https://lapridapropiedades.com',
    googleMapsQuery: 'Inmobiliaria Laprida Propiedades Tucuman',
    status: LeadStatus.DEMO_ENVIADA,
    serviceType: OsServiceType.CUSTOM_SOFTWARE,
    assignedTo: 'franco',
    notes: 'Buscan un CRM liviano para fichas de propiedades y seguimiento comercial.',
    firstTouch: 'Mostramos valor en ordenar consultas de alquiler y venta.',
    demoFocus: 'Pipeline de consultas, fichas de inmuebles y tablero de agentes.',
    responseNote: 'Seguimos esperando feedback comercial.',
    demoCount: 1,
    nextFollowUpMode: 'demo-2',
  },
  {
    businessName: 'Clinica Dental Belgrano',
    contactName: 'Natalia Roldan',
    phone: '+54 381 555 1206',
    email: 'nroldan@dentalbelgrano.com',
    industry: 'Clinica dental',
    zone: 'Barrio Sur',
    source: 'Inbound',
    instagramHandle: 'dentalbelgrano',
    currentWebUrl: 'https://dentalbelgrano.com',
    googleMapsQuery: 'Clinica Dental Belgrano Tucuman',
    status: LeadStatus.VIO_VIDEO,
    serviceType: OsServiceType.AI_AGENT,
    assignedTo: 'valentino',
    notes: 'Mostraron interes por un asistente que filtre consultas y derive turnos.',
    firstTouch: 'Llegaron pidiendo ayuda para ordenar consultas y turnos.',
    demoFocus: 'Agente IA para preguntas frecuentes, precios y agenda.',
    responseNote: 'Confirmaron que vieron el video y lo estan evaluando internamente.',
    demoCount: 1,
    nextFollowUpMode: 'tomorrow',
  },
  {
    businessName: 'Estudio Contable Norte',
    contactName: 'Nicolas Albornoz',
    phone: '+54 381 555 1207',
    email: 'nicolas@estudiocontablenorte.com.ar',
    industry: 'Estudio contable',
    zone: 'Yerba Buena',
    source: 'Referido',
    instagramHandle: null,
    currentWebUrl: 'https://estudiocontablenorte.com.ar',
    googleMapsQuery: 'Estudio Contable Norte Yerba Buena Tucuman',
    status: LeadStatus.RESPONDIO,
    serviceType: OsServiceType.AUTOMATION,
    assignedTo: 'franco',
    notes: 'Necesitan automatizar recordatorios de vencimientos y derivacion de consultas.',
    firstTouch: 'Se presento una automatizacion tipo para onboarding y vencimientos.',
    demoFocus: 'Automatizacion de altas y recordatorios mensuales.',
    responseNote: 'Respondieron y pidieron propuesta economica simplificada.',
    demoCount: 1,
  },
  {
    businessName: 'Optica San Javier',
    contactName: 'Vanesa Carrizo',
    phone: '+54 381 555 1208',
    email: 'vanesa@opticasanjavier.com',
    industry: 'Optica',
    zone: 'Centro',
    source: 'Instagram',
    instagramHandle: 'opticasanjavier',
    currentWebUrl: null,
    googleMapsQuery: 'Optica San Javier San Miguel de Tucuman',
    status: LeadStatus.RESPONDIO,
    serviceType: OsServiceType.WEB,
    assignedTo: 'valentino',
    notes: 'Consultaron por landing de promociones y turnos para control visual.',
    firstTouch: 'Se detecto trafico desde redes sin una landing clara para campanas.',
    demoFocus: 'Landing de promociones con turnos y CTA por sucursal.',
    responseNote: 'Respondieron que quieren avanzar con propuesta.',
    demoCount: 1,
  },
  {
    businessName: 'Centro de Estetica Magnolia',
    contactName: 'Milagros Paz',
    phone: '+54 381 555 1209',
    email: 'milagros@magnoliaestetica.com',
    industry: 'Centro de estetica',
    zone: 'Yerba Buena',
    source: 'Inbound',
    instagramHandle: 'magnolia.estetica',
    currentWebUrl: 'https://magnoliaestetica.com',
    googleMapsQuery: 'Centro de Estetica Magnolia Yerba Buena Tucuman',
    status: LeadStatus.CALL_AGENDADA,
    serviceType: OsServiceType.AI_AGENT,
    assignedTo: 'franco',
    notes: 'Quieren automatizar respuestas iniciales y agenda para tratamientos.',
    firstTouch: 'Entraron por formulario pidiendo bajar saturacion de WhatsApp.',
    demoFocus: 'Bot para FAQs, agenda y derivacion a recepcion.',
    responseNote: 'Quedo agendada una llamada comercial para cerrar alcance.',
    demoCount: 1,
  },
  {
    businessName: 'Concesionaria San Miguel',
    contactName: 'Carlos Mendoza',
    phone: '+54 381 555 1210',
    email: 'carlos@sanmiguelautos.com.ar',
    industry: 'Concesionaria',
    zone: 'Avenida Belgrano',
    source: 'Referido',
    instagramHandle: 'sanmiguelautos',
    currentWebUrl: 'https://sanmiguelautos.com.ar',
    googleMapsQuery: 'Concesionaria San Miguel Tucuman',
    status: LeadStatus.CERRADO,
    serviceType: OsServiceType.WEB,
    assignedTo: 'franco',
    notes: 'Cliente cerrado para nuevo sitio comercial y CRM de ventas.',
    firstTouch: 'Surgio la necesidad de renovar sitio, catalogo y captacion de leads.',
    demoFocus: 'Sitio comercial, catalogo y CRM de ventas.',
    responseNote: 'Se cerro el proyecto luego de dos iteraciones de demo.',
    demoCount: 2,
  },
  {
    businessName: 'Clinica Dental Sonrisa Norte',
    contactName: 'Diego Salas',
    phone: '+54 381 555 1211',
    email: 'direccion@sonrisanorte.com',
    industry: 'Clinica dental',
    zone: 'Yerba Buena',
    source: 'Inbound',
    instagramHandle: 'sonrisanorte',
    currentWebUrl: 'https://sonrisanorte.com',
    googleMapsQuery: 'Clinica Dental Sonrisa Norte Yerba Buena Tucuman',
    status: LeadStatus.CERRADO,
    serviceType: OsServiceType.AI_AGENT,
    assignedTo: 'valentino',
    notes: 'Cliente cerrado para asistente IA de consultas, filtros y turnos.',
    firstTouch: 'Entraron pidiendo bajar tiempos de respuesta en recepcion.',
    demoFocus: 'Asistente IA con triage, turnos y derivacion humana.',
    responseNote: 'Cerraron despues de validar dos versiones del asistente.',
    demoCount: 2,
  },
  {
    businessName: 'Ferreteria Industrial Tucuman',
    contactName: 'Raul Gonzalez',
    phone: '+54 381 555 1212',
    email: 'raul@ferreteriaindustrialtucuman.com',
    industry: 'Ferreteria industrial',
    zone: 'Alderetes',
    source: 'Google Maps',
    instagramHandle: null,
    currentWebUrl: 'https://fitucuman.com.ar',
    googleMapsQuery: 'Ferreteria Industrial Tucuman Alderetes',
    status: LeadStatus.PERDIDO,
    serviceType: OsServiceType.CUSTOM_SOFTWARE,
    assignedTo: 'franco',
    notes: 'Perdido por timing y presupuesto. Queda para retomar mas adelante.',
    firstTouch: 'Presentamos un portal mayorista y cotizador para clientes frecuentes.',
    demoFocus: 'Catalogo B2B con cotizaciones y pedidos recurrentes.',
    responseNote: 'Decidieron pausar la inversion hasta el segundo semestre.',
    demoCount: 1,
  },
  {
    businessName: 'Gimnasio Olimpo Yerba Buena',
    contactName: 'Sebastian Mena',
    phone: '+54 381 555 1213',
    email: 'sebastian@olimpo-fit.com.ar',
    industry: 'Gym',
    zone: 'Yerba Buena',
    source: 'Instagram',
    instagramHandle: 'olimpofit.yb',
    currentWebUrl: 'https://olimpo-fit.com.ar',
    googleMapsQuery: 'Gimnasio Olimpo Yerba Buena Tucuman',
    status: LeadStatus.POSTERGADO,
    serviceType: OsServiceType.AUTOMATION,
    assignedTo: 'valentino',
    notes: 'Interesados en automatizar renovaciones, pero piden retomar en cinco dias.',
    firstTouch: 'Mostramos oportunidad de reactivacion y recordatorios de pagos.',
    demoFocus: 'Automatizacion para renovaciones, cobranzas y reactivacion.',
    responseNote: 'Pidieron retomar luego del lanzamiento de una promo en sala.',
    demoCount: 1,
    reactivateInDays: 5,
  },
  {
    businessName: 'Estudio Contable Sigma',
    contactName: 'Marina Paz',
    phone: '+54 381 555 1290',
    email: 'marina@sigmacontable.com.ar',
    industry: 'Estudio contable',
    zone: 'Barrio Norte',
    source: 'Referido',
    instagramHandle: null,
    currentWebUrl: 'https://sigmacontable.com.ar',
    googleMapsQuery: 'Estudio Contable Sigma Tucuman',
    status: LeadStatus.CERRADO,
    serviceType: OsServiceType.WEB,
    assignedTo: 'franco',
    notes: 'Cliente cerrado para redisenio institucional y mantenimiento mensual.',
    firstTouch: 'Se detecto oportunidad de renovar presencia y captar consultas premium.',
    demoFocus: 'Sitio institucional, formularios y mantenimiento continuo.',
    responseNote: 'Cerraron luego de validar demo comercial y soporte mensual.',
    demoCount: 1,
  },
]

const leadSeeds: LeadSeed[] = baseLeadSeeds.map((seed, index) => ({
  ...seed,
  createdAt: daysAgo(28 - index * 2, 9 + (index % 3), 15),
}))

const previousMonth = offsetMonth(-1)
const twoMonthsAgo = offsetMonth(-2)

const projectSeeds: ProjectSeed[] = [
  {
    businessName: 'Concesionaria San Miguel',
    organizationSlug: 'san-miguel',
    linkedLeadBusinessName: 'Concesionaria San Miguel',
    name: 'Nuevo sitio comercial y CRM de ventas',
    description:
      'Sitio comercial con catalogo, formularios inteligentes y pipeline para el equipo de ventas.',
    serviceType: OsServiceType.WEB,
    status: ProjectStatus.IN_PROGRESS,
    agreedAmount: '1200.00',
    monthlyRate: '150.00',
    startDate: daysAgo(21, 9),
    estimatedEndDate: daysFromNow(18, 18),
    deliveredAt: null,
    maintenanceStartDate: null,
    tasks: [
      {
        title: 'Arquitectura de informacion y relevamiento comercial',
        description: 'Mapa del sitio, embudos y necesidades del equipo de ventas.',
        status: TaskStatus.DONE,
        estimatedHours: 6,
        assignedTo: 'franco',
        position: 1,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      {
        title: 'Home comercial y landings de modelos destacados',
        description: 'Hero comercial, secciones clave y conversion desde campanas.',
        status: TaskStatus.DONE,
        estimatedHours: 12,
        assignedTo: 'valentino',
        position: 2,
        approvalStatus: ApprovalStatus.PENDING_APPROVAL,
      },
      {
        title: 'Catalogo con filtros, fichas y CTA de leads',
        description: 'Listado de vehiculos, filtros y CTA contextuales por ficha.',
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 20,
        assignedTo: 'franco',
        position: 3,
      },
      {
        title: 'Integracion de formularios con CRM y WhatsApp',
        description: 'Conexion de formularios, alertas y pipeline interno.',
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 14,
        assignedTo: 'valentino',
        position: 4,
      },
      {
        title: 'Panel comercial y reportes de seguimiento',
        description: 'Resumen de leads, fuentes y conversion.',
        status: TaskStatus.TODO,
        estimatedHours: 18,
        assignedTo: 'franco',
        position: 5,
        dueDate: daysFromNow(14, 18),
      },
    ],
    timeEntries: [
      {
        taskTitle: 'Arquitectura de informacion y relevamiento comercial',
        member: 'franco',
        hours: 2.5,
        date: daysAgo(19, 10),
        notes: 'Workshop inicial y definicion de secciones prioritarias.',
      },
      {
        taskTitle: 'Home comercial y landings de modelos destacados',
        member: 'valentino',
        hours: 3.5,
        date: daysAgo(17, 15),
        notes: 'Maquetado del home y hero con promociones vigentes.',
      },
      {
        taskTitle: 'Catalogo con filtros, fichas y CTA de leads',
        member: 'franco',
        hours: 4,
        date: daysAgo(11, 11),
        notes: 'Desarrollo del listado de vehiculos y filtros por marca.',
      },
      {
        taskTitle: 'Catalogo con filtros, fichas y CTA de leads',
        member: 'franco',
        hours: 3,
        date: daysAgo(8, 17),
        notes: 'Ajustes en fichas y CTAs para captacion de leads.',
      },
      {
        taskTitle: 'Integracion de formularios con CRM y WhatsApp',
        member: 'valentino',
        hours: 2.5,
        date: daysAgo(7, 16),
        notes: 'Conexion de eventos del formulario y estructura del pipeline.',
      },
      {
        taskTitle: 'Integracion de formularios con CRM y WhatsApp',
        member: 'valentino',
        hours: 3.5,
        date: daysAgo(4, 14),
        notes: 'Configuracion de alertas y pruebas con el equipo comercial.',
      },
      {
        taskTitle: 'Panel comercial y reportes de seguimiento',
        member: 'franco',
        hours: 2,
        date: daysAgo(2, 10),
        notes: 'Wireframe inicial de tablero y metricas de conversion.',
      },
    ],
    maintenancePayments: [],
    milestonePaidAt: { INICIO: daysAgo(18, 13), ENTREGA: null },
  },
  {
    businessName: 'Clinica Dental Sonrisa Norte',
    organizationSlug: 'sonrisa-norte',
    linkedLeadBusinessName: 'Clinica Dental Sonrisa Norte',
    name: 'Asistente IA de consultas y turnos',
    description:
      'Agente para consultas frecuentes, derivacion a secretaria y seguimiento de tratamientos.',
    serviceType: OsServiceType.AI_AGENT,
    status: ProjectStatus.REVIEW,
    agreedAmount: '500.00',
    monthlyRate: '90.00',
    startDate: daysAgo(16, 9),
    estimatedEndDate: daysFromNow(8, 18),
    deliveredAt: null,
    maintenanceStartDate: null,
    tasks: [
      {
        title: 'Definicion de flujos y entrenamiento inicial',
        description: 'Mapeo de preguntas frecuentes y tono del asistente.',
        status: TaskStatus.DONE,
        estimatedHours: 8,
        assignedTo: 'valentino',
        position: 1,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      {
        title: 'Integracion con WhatsApp y agenda',
        description: 'Conexion con canales de consulta y agenda.',
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 10,
        assignedTo: 'franco',
        position: 2,
      },
      {
        title: 'Dashboard de conversaciones y derivaciones',
        description: 'Panel para seguimiento de conversaciones y escalados.',
        status: TaskStatus.TODO,
        estimatedHours: 9,
        assignedTo: 'valentino',
        position: 3,
        dueDate: daysFromNow(7, 17),
      },
    ],
    timeEntries: [
      {
        taskTitle: 'Definicion de flujos y entrenamiento inicial',
        member: 'valentino',
        hours: 3,
        date: daysAgo(12, 15),
        notes: 'Armado del flujo base y respuestas frecuentes.',
      },
      {
        taskTitle: 'Integracion con WhatsApp y agenda',
        member: 'franco',
        hours: 2.5,
        date: daysAgo(9, 11),
        notes: 'Conexion inicial con derivacion a secretaria.',
      },
      {
        taskTitle: 'Integracion con WhatsApp y agenda',
        member: 'franco',
        hours: 3,
        date: daysAgo(6, 17),
        notes: 'Ajustes en validacion de turnos y mensajes de bienvenida.',
      },
      {
        taskTitle: 'Dashboard de conversaciones y derivaciones',
        member: 'valentino',
        hours: 2,
        date: daysAgo(3, 12),
        notes: 'Diseno de indicadores y primeras tablas del panel.',
      },
    ],
    maintenancePayments: [],
    milestonePaidAt: { INICIO: daysAgo(13, 13), ENTREGA: null },
  },
  {
    businessName: 'Agency OS Internal',
    organizationSlug: null,
    linkedLeadBusinessName: null,
    name: 'Motor interno de automatizacion operativa',
    description:
      'Proyecto interno para centralizar procesos, scorecards y automatizaciones del equipo.',
    serviceType: OsServiceType.CUSTOM_SOFTWARE,
    status: ProjectStatus.IN_PROGRESS,
    agreedAmount: '3000.00',
    monthlyRate: null,
    startDate: daysAgo(20, 9),
    estimatedEndDate: daysFromNow(25, 18),
    deliveredAt: null,
    maintenanceStartDate: null,
    tasks: [
      {
        title: 'Arquitectura del modulo de operaciones',
        description: 'Esqueleto tecnico, eventos y ownership del dominio interno.',
        status: TaskStatus.DONE,
        estimatedHours: 16,
        assignedTo: 'franco',
        position: 1,
      },
      {
        title: 'Automatizacion de resumen semanal',
        description: 'Consolidacion automatica de KPIs y seguimiento comercial.',
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 24,
        assignedTo: 'valentino',
        position: 2,
      },
      {
        title: 'Consola de notificaciones internas',
        description: 'Centro de alertas para tickets, mensajes y aprobaciones.',
        status: TaskStatus.IN_PROGRESS,
        estimatedHours: 18,
        assignedTo: 'franco',
        position: 3,
      },
      {
        title: 'Permisos y auditoria del equipo',
        description: 'Trazabilidad de acciones criticas y controles de acceso.',
        status: TaskStatus.TODO,
        estimatedHours: 12,
        assignedTo: 'valentino',
        position: 4,
      },
    ],
    timeEntries: [
      {
        taskTitle: 'Arquitectura del modulo de operaciones',
        member: 'franco',
        hours: 5,
        date: daysAgo(18, 10),
        notes: 'Definicion de bounded contexts y eventos clave.',
      },
      {
        taskTitle: 'Automatizacion de resumen semanal',
        member: 'valentino',
        hours: 4,
        date: daysAgo(13, 16),
        notes: 'Pipeline inicial de agregacion y scorecards.',
      },
      {
        taskTitle: 'Consola de notificaciones internas',
        member: 'franco',
        hours: 3.5,
        date: daysAgo(9, 14),
        notes: 'Estados, prioridades y feed de notificaciones.',
      },
      {
        taskTitle: 'Automatizacion de resumen semanal',
        member: 'valentino',
        hours: 4.5,
        date: daysAgo(5, 11),
        notes: 'Refactor de jobs y export de indicadores.',
      },
    ],
    maintenancePayments: [],
    milestonePaidAt: { INICIO: daysAgo(17, 12), ENTREGA: null },
  },
  {
    businessName: 'Estudio Contable Sigma',
    organizationSlug: 'sigma-contable',
    linkedLeadBusinessName: 'Estudio Contable Sigma',
    name: 'Sitio institucional y mantenimiento mensual',
    description:
      'Proyecto entregado con sitio institucional, formularios de contacto y ajustes continuos.',
    serviceType: OsServiceType.WEB,
    status: ProjectStatus.COMPLETED,
    agreedAmount: '900.00',
    monthlyRate: '120.00',
    startDate: daysAgo(90, 9),
    estimatedEndDate: daysAgo(42, 18),
    deliveredAt: daysAgo(45, 18),
    maintenanceStartDate: daysAgo(44, 10),
    tasks: [
      {
        title: 'Sitio institucional y pages de servicios',
        description: 'Proyecto institucional con foco en posicionamiento local.',
        status: TaskStatus.DONE,
        estimatedHours: 14,
        assignedTo: 'franco',
        position: 1,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      {
        title: 'Formularios y derivacion de consultas',
        description: 'Formularios, alertas y automatizaciones livianas.',
        status: TaskStatus.DONE,
        estimatedHours: 8,
        assignedTo: 'valentino',
        position: 2,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      {
        title: 'Manual de mantenimiento y handoff',
        description: 'Documentacion de soporte y rutina mensual.',
        status: TaskStatus.DONE,
        estimatedHours: 5,
        assignedTo: 'franco',
        position: 3,
      },
    ],
    timeEntries: [
      {
        taskTitle: 'Sitio institucional y pages de servicios',
        member: 'franco',
        hours: 4,
        date: daysAgo(60, 10),
        notes: 'Ajustes finales de estilo y SEO tecnico.',
      },
      {
        taskTitle: 'Formularios y derivacion de consultas',
        member: 'valentino',
        hours: 2.5,
        date: daysAgo(55, 16),
        notes: 'QA de formularios y reglas de derivacion.',
      },
      {
        taskTitle: 'Manual de mantenimiento y handoff',
        member: 'franco',
        hours: 1.5,
        date: daysAgo(46, 12),
        notes: 'Documentacion final y checklist de soporte.',
      },
    ],
    maintenancePayments: [
      {
        month: twoMonthsAgo.month,
        year: twoMonthsAgo.year,
        amount: '120.00',
        paidAt: daysAgo(36, 12),
      },
      {
        month: previousMonth.month,
        year: previousMonth.year,
        amount: '120.00',
        paidAt: daysAgo(8, 11),
      },
    ],
    milestonePaidAt: { INICIO: daysAgo(85, 13), ENTREGA: daysAgo(45, 18) },
  },
]

const ticketSeeds: TicketSeed[] = [
  {
    organizationSlug: 'san-miguel',
    title: 'El formulario de consultas no esta enviando alertas',
    category: TicketCategory.TECHNICAL,
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    createdAt: daysAgo(5, 11),
    updatedAt: daysAgo(2, 14),
    messages: [
      {
        content:
          'Probamos el formulario desde la home y no llego ninguna alerta por WhatsApp.',
        author: 'client',
        isAdmin: false,
        createdAt: daysAgo(5, 11),
      },
      {
        content:
          'Lo detectamos. Estamos ajustando el webhook y te avisamos cuando quede validado.',
        author: 'franco',
        isAdmin: true,
        createdAt: daysAgo(4, 16),
      },
    ],
  },
  {
    organizationSlug: 'san-miguel',
    title: 'Queremos un acceso rapido al tablero de leads',
    category: TicketCategory.FEATURE_REQUEST,
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    createdAt: daysAgo(3, 10),
    updatedAt: daysAgo(3, 10),
    messages: [
      {
        content:
          'Nos serviria tener un acceso directo al tablero desde la portada del portal.',
        author: 'client',
        isAdmin: false,
        createdAt: daysAgo(3, 10),
      },
      {
        content:
          'Anotado. Lo evaluamos dentro del siguiente sprint de mejoras del cliente.',
        author: 'valentino',
        isAdmin: true,
        createdAt: daysAgo(2, 15),
      },
    ],
  },
  {
    organizationSlug: 'sonrisa-norte',
    title: 'El asistente no distingue urgencias de turnos comunes',
    category: TicketCategory.TECHNICAL,
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.URGENT,
    createdAt: daysAgo(4, 9),
    updatedAt: daysAgo(1, 12),
    messages: [
      {
        content:
          'Necesitamos que detecte mejor cuando el paciente habla de dolor o urgencia.',
        author: 'client',
        isAdmin: false,
        createdAt: daysAgo(4, 9),
      },
      {
        content:
          'Ya ajustamos intents y derivacion. Hoy hacemos una nueva pasada de entrenamiento.',
        author: 'valentino',
        isAdmin: true,
        createdAt: daysAgo(1, 12),
      },
    ],
  },
  {
    organizationSlug: 'sigma-contable',
    title: 'Necesitamos actualizar la pagina de servicios fiscales',
    category: TicketCategory.OTHER,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.LOW,
    createdAt: daysAgo(9, 10),
    updatedAt: daysAgo(6, 18),
    messages: [
      {
        content:
          'Queremos sumar una seccion nueva para consultoria fiscal internacional.',
        author: 'client',
        isAdmin: false,
        createdAt: daysAgo(9, 10),
      },
      {
        content:
          'Actualizado y publicado. Ya quedo visible en el menu principal y en la home.',
        author: 'franco',
        isAdmin: true,
        createdAt: daysAgo(6, 18),
      },
    ],
  },
]

const conversationSeeds: ConversationMessageSeed[] = [
  {
    organizationSlug: 'san-miguel',
    content:
      'Hola Carlos, ya quedo lista la home comercial. Te compartimos capturas y el enlace de revision.',
    fromAdmin: true,
    read: true,
    createdAt: daysAgo(6, 13),
  },
  {
    organizationSlug: 'san-miguel',
    content: 'Perfecto, hoy la reviso con el equipo y les dejo comentarios por la tarde.',
    fromAdmin: false,
    read: true,
    createdAt: daysAgo(6, 15),
  },
  {
    organizationSlug: 'san-miguel',
    content:
      'Buenisimo. Mientras tanto avanzamos con catalogo y formularios para no frenar el sprint.',
    fromAdmin: true,
    read: true,
    createdAt: daysAgo(5, 11),
  },
  {
    organizationSlug: 'san-miguel',
    content:
      'Nos gusto mucho. Solo necesitamos revisar los CTA de usados antes de aprobar.',
    fromAdmin: false,
    read: false,
    createdAt: daysAgo(2, 18),
  },
  {
    organizationSlug: 'sonrisa-norte',
    content:
      'Diego, cargamos una nueva version del agente con mejor deteccion de urgencias y turnos.',
    fromAdmin: true,
    read: true,
    createdAt: daysAgo(3, 12),
  },
  {
    organizationSlug: 'sonrisa-norte',
    content:
      'La estuvimos probando recien. Mejora bastante, pero quiero validar un caso mas con recepcion.',
    fromAdmin: false,
    read: false,
    createdAt: daysAgo(1, 17),
  },
]

const contactSubmissionSeeds: ContactSubmissionSeed[] = [
  {
    name: 'Lucia Herrera',
    email: 'lucia@autodelvalle.com.ar',
    phone: '+54 381 555 3311',
    company: 'Auto del Valle',
    service: 'web-development',
    message:
      'Necesitamos un sitio nuevo con catalogo simple y opcion de tomar consultas por WhatsApp.',
    createdAt: daysAgo(2, 11),
  },
  {
    name: 'Martin Caceres',
    email: 'martin@cafemagnolia.com',
    phone: '+54 381 555 3312',
    company: 'Cafe Magnolia',
    service: 'ai-automation',
    message:
      'Buscamos automatizar reservas y preguntas frecuentes por Instagram y WhatsApp.',
    createdAt: daysAgo(1, 16),
  },
]

function buildLeadActivities(seed: LeadSeed): LeadActivitySeed[] {
  if (seed.status === LeadStatus.PROSPECTO) {
    return []
  }

  const actor = seed.assignedTo
  const items: LeadActivitySeed[] = [
    {
      channel: seed.source === 'Instagram' ? ActivityChannel.INSTAGRAM_DM : ActivityChannel.EMAIL,
      result: seed.status === LeadStatus.DEMO_ENVIADA ? ActivityResult.SIN_RESPUESTA : ActivityResult.RESPONDIO,
      notes: seed.firstTouch,
      performedBy: actor,
      createdAt: daysAgo(12, 10),
    },
    {
      channel: ActivityChannel.WHATSAPP,
      result:
        seed.status === LeadStatus.DEMO_ENVIADA
          ? ActivityResult.SIN_RESPUESTA
          : seed.status === LeadStatus.POSTERGADO
            ? ActivityResult.POSTERGADO
            : ActivityResult.RESPONDIO,
      notes: `Seguimiento comercial: ${seed.responseNote}`,
      performedBy: actor,
      createdAt: daysAgo(9, 16),
    },
    {
      channel: ActivityChannel.LOOM_VIDEO,
      result: null,
      notes: `Demo enviada: ${seed.demoFocus}`,
      performedBy: actor,
      createdAt: daysAgo(5, 18),
    },
  ]

  if (seed.status === LeadStatus.VIO_VIDEO) {
    items.push({
      channel: ActivityChannel.WHATSAPP,
      result: null,
      notes: 'Confirmaron que vieron el video y lo estan revisando internamente.',
      performedBy: actor,
      createdAt: daysAgo(4, 13),
    })
  }

  if (seed.status === LeadStatus.RESPONDIO) {
    items.push({
      channel: ActivityChannel.EMAIL,
      result: ActivityResult.RESPONDIO,
      notes: seed.responseNote,
      performedBy: actor,
      createdAt: daysAgo(3, 11),
    })
  }

  if (seed.status === LeadStatus.CALL_AGENDADA) {
    items.push({
      channel: ActivityChannel.LLAMADA,
      result: ActivityResult.CALL_AGENDADA,
      notes: seed.responseNote,
      performedBy: actor,
      createdAt: daysAgo(2, 12),
    })
  }

  if (seed.status === LeadStatus.CERRADO) {
    items.push({
      channel: ActivityChannel.LLAMADA,
      result: ActivityResult.CALL_AGENDADA,
      notes: 'Se cerro alcance y cronograma en llamada comercial.',
      performedBy: actor,
      createdAt: daysAgo(3, 12),
    })

    if (seed.demoCount === 2) {
      items.push({
        channel: ActivityChannel.LOOM_VIDEO,
        result: null,
        notes: 'Se envio una segunda demo refinada antes del cierre.',
        performedBy: actor,
        createdAt: daysAgo(7, 18),
      })
    }
  }

  if (seed.status === LeadStatus.PERDIDO) {
    items.push({
      channel: ActivityChannel.LLAMADA,
      result: ActivityResult.RECHAZADO,
      notes: seed.responseNote,
      performedBy: actor,
      createdAt: daysAgo(2, 12),
    })
  }

  if (seed.status === LeadStatus.POSTERGADO) {
    items.push({
      channel: ActivityChannel.WHATSAPP,
      result: ActivityResult.POSTERGADO,
      notes: seed.responseNote,
      performedBy: actor,
      createdAt: daysAgo(2, 12),
    })
  }

  return items
}

function buildLeadDemos(seed: LeadSeed): DemoSeed[] {
  return Array.from({ length: seed.demoCount }, (_, index) => {
    const version = index + 1
    const sentAt = daysAgo(seed.demoCount === 2 && version === 1 ? 8 : 5 - index, 18)
    const viewedStatuses = new Set<LeadStatus>([
      LeadStatus.VIO_VIDEO,
      LeadStatus.RESPONDIO,
      LeadStatus.CALL_AGENDADA,
      LeadStatus.CERRADO,
      LeadStatus.PERDIDO,
      LeadStatus.POSTERGADO,
    ])

    return {
      serviceType: seed.serviceType,
      demoUrl: demoUrlFor(seed.businessName, version),
      loomUrl: loomUrlFor(seed.businessName, version),
      sentAt,
      viewedAt: viewedStatuses.has(seed.status) ? new Date(sentAt.getTime() + DAY_IN_MS) : null,
      notes: `${seed.demoFocus}${version > 1 ? ' Version refinada.' : ''}`,
    }
  })
}

function nextFollowUpAtFor(seed: LeadSeed): Date | null {
  if (seed.nextFollowUpMode === 'demo-1') {
    return calculateSeedNextFollowUp(1)
  }

  if (seed.nextFollowUpMode === 'demo-2') {
    return calculateSeedNextFollowUp(2)
  }

  if (seed.nextFollowUpMode === 'tomorrow') {
    return daysFromNow(1, 9)
  }

  return null
}

async function ensureOrganization(seed: OrganizationSeed) {
  const existingBySlug = await prisma.organization.findUnique({
    where: { slug: seed.slug },
  })

  if (existingBySlug) {
    return existingBySlug
  }

  const existingByCompanyName = await prisma.organization.findFirst({
    where: { companyName: seed.companyName },
    orderBy: { createdAt: 'asc' },
  })

  if (existingByCompanyName) {
    return existingByCompanyName
  }

  return prisma.organization.create({
    data: {
      id: seedId('organization', seed.slug),
      companyName: seed.companyName,
      slug: seed.slug,
      siteUrl: seed.siteUrl,
      whatsapp: seed.whatsapp,
      onboardingCompleted: true,
      n8nWorkflowIds: [],
      notificationPrefs: (seed.notificationPrefs ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    },
  })
}

async function ensureClientUser(seed: OrganizationSeed, passwordHash: string) {
  const existing = await prisma.user.findUnique({
    where: { email: seed.clientEmail },
  })

  if (existing) {
    return existing
  }

  return prisma.user.create({
    data: {
      id: seedId('client-user', seed.slug),
      name: seed.clientName,
      email: seed.clientEmail,
      role: Role.ORG_MEMBER,
      password: passwordHash,
      emailVerified: new Date(),
    },
  })
}

async function ensureOrgMember(organizationId: string, userId: string, role: OrgRole = OrgRole.ADMIN) {
  return prisma.orgMember.upsert({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    update: { role },
    create: {
      id: seedId('org-member', organizationId, userId),
      organizationId,
      userId,
      role,
    },
  })
}

async function ensureOrganizationService(organizationId: string, type: ServiceType) {
  const existing = await prisma.service.findFirst({
    where: { organizationId, type },
    orderBy: { startDate: 'asc' },
  })

  if (existing) {
    return existing
  }

  return prisma.service.create({
    data: {
      id: seedId('service', organizationId, type),
      organizationId,
      type,
      status: ServiceStatus.ACTIVE,
    },
  })
}

async function ensureSubscription(organizationId: string, seed: OrganizationSeed['subscription']) {
  const existing = await prisma.subscription.findUnique({
    where: { organizationId },
  })

  if (existing) {
    return existing
  }

  return prisma.subscription.create({
    data: {
      id: seedId('subscription', organizationId),
      organizationId,
      planName: seed.planName,
      status: seed.status,
      price: seed.price,
      currency: seed.currency,
      renewalDate: seed.renewalDate,
    },
  })
}

async function ensureAgencySettings() {
  const existingSettings = await prisma.agencySettings.findFirst()

  if (!existingSettings) {
    await prisma.agencySettings.create({
      data: {
        ...DEFAULT_AGENCY_SETTINGS,
        id: DEFAULT_AGENCY_SETTINGS_ID,
      },
    })
  }

  // NOTE: Module pricing is now managed via PremiumModule catalog.
  // Run: npx tsx prisma/seeds/premium-modules.ts to seed the catalog.

}

async function ensureLead(seed: LeadSeed, members: Record<MemberKey, User>) {
  const existingLead = await prisma.osLead.findFirst({
    where: { businessName: seed.businessName },
  })

  const data = {
    businessName: seed.businessName,
    contactName: seed.contactName,
    phone: seed.phone,
    email: seed.email,
    industry: seed.industry,
    zone: seed.zone,
    source: seed.source,
    instagramUrl: instagramUrl(seed.instagramHandle),
    currentWebUrl: seed.currentWebUrl,
    googleMapsUrl: mapsUrl(seed.googleMapsQuery),
    status: seed.status,
    serviceType: seed.serviceType,
    nextFollowUpAt: nextFollowUpAtFor(seed),
    reactivateAt: seed.reactivateInDays ? daysFromNow(seed.reactivateInDays, 10) : null,
    notes: seed.notes,
    assignedToId: members[seed.assignedTo].id,
  }

  return existingLead
    ? prisma.osLead.update({
        where: { id: existingLead.id },
        data,
      })
    : prisma.osLead.create({
        data: {
          id: seedId('lead', seed.businessName),
          ...data,
          createdAt: seed.createdAt,
        },
      })
}

async function ensureLeadActivities(
  leadId: string,
  activities: LeadActivitySeed[],
  members: Record<MemberKey, User>,
) {
  if (activities.length === 0) return

  const existing = await prisma.osLeadActivity.findMany({
    where: { leadId },
    select: { channel: true, createdAt: true, notes: true },
  })

  const keys = new Set(
    existing.map((item) => `${item.channel}|${item.createdAt.toISOString()}|${item.notes ?? ''}`),
  )

  const missing = activities
    .filter((item) => !keys.has(`${item.channel}|${item.createdAt.toISOString()}|${item.notes}`))
    .map((item) => ({
      id: seedId('lead-activity', leadId, item.channel, String(item.createdAt.getTime())),
      leadId,
      channel: item.channel,
      result: item.result,
      notes: item.notes,
      performedById: members[item.performedBy].id,
      createdAt: item.createdAt,
    }))

  if (missing.length > 0) {
    await prisma.osLeadActivity.createMany({ data: missing })
  }
}

async function ensureLeadDemos(leadId: string, demos: DemoSeed[]) {
  if (demos.length === 0) return

  const existing = await prisma.osDemo.findMany({
    where: { leadId },
    select: { demoUrl: true },
  })
  const urls = new Set(existing.map((item) => item.demoUrl))

  const missing = demos
    .filter((item) => !urls.has(item.demoUrl))
    .map((item, index) => ({
      id: seedId('lead-demo', leadId, String(index + 1)),
      leadId,
      serviceType: item.serviceType,
      demoUrl: item.demoUrl,
      loomUrl: item.loomUrl,
      sentAt: item.sentAt,
      viewedAt: item.viewedAt,
      notes: item.notes,
      createdAt: item.sentAt,
    }))

  if (missing.length > 0) {
    await prisma.osDemo.createMany({ data: missing })
  }
}

async function ensureProject(
  seed: ProjectSeed,
  organizationId: string | null,
  leadId: string | null
) {
  const existingByLead = leadId
    ? await prisma.project.findFirst({
        where: { osLeadId: leadId },
      })
    : null

  const existingByName = await prisma.project.findFirst({
    where: {
      organizationId: organizationId ?? null,
      name: seed.name,
    },
  })

  const existing = existingByLead ?? existingByName

  const data = {
    name: seed.name,
    description: seed.description,
    status: seed.status,
    organizationId: organizationId ?? null,
    agreedAmount: seed.agreedAmount,
    monthlyRate: seed.monthlyRate,
    maintenanceStartDate: seed.maintenanceStartDate,
    deliveredAt: seed.deliveredAt,
    estimatedEndDate: seed.estimatedEndDate,
    osLeadId: leadId,
  }

  return existing
    ? prisma.project.update({
        where: { id: existing.id },
        data,
      })
    : prisma.project.create({
        data: {
          id: seedId('project', seed.organizationSlug ?? 'internal', seed.name),
          ...data,
        },
      })
}

async function ensureMilestones(projectId: string, projectSeed: ProjectSeed) {
  for (const milestone of [
    {
      type: MilestoneType.INICIO,
      amount: halfAmount(projectSeed.agreedAmount),
      paidAt: projectSeed.milestonePaidAt.INICIO,
      dueAt: projectSeed.startDate,
    },
    {
      type: MilestoneType.ENTREGA,
      amount: halfAmount(projectSeed.agreedAmount),
      paidAt: projectSeed.milestonePaidAt.ENTREGA,
      dueAt: projectSeed.estimatedEndDate,
    },
  ] as const) {
    const existing = await prisma.osPaymentMilestone.findFirst({
      where: { projectId, type: milestone.type },
    })

    if (existing) {
      await prisma.osPaymentMilestone.update({
        where: { id: existing.id },
        data: {
          amount: milestone.amount,
          paidAt: milestone.paidAt,
          dueAt: milestone.dueAt,
        },
      })
    } else {
      await prisma.osPaymentMilestone.create({
        data: {
          id: seedId('milestone', projectId, milestone.type),
          projectId,
          type: milestone.type,
          amount: milestone.amount,
          paidAt: milestone.paidAt,
          dueAt: milestone.dueAt,
        },
      })
    }
  }
}

async function ensureMaintenancePayments(projectId: string, payments: ProjectSeed['maintenancePayments']) {
  for (const payment of payments) {
    await prisma.osMaintenancePayment.upsert({
      where: {
        projectId_month_year: {
          projectId,
          month: payment.month,
          year: payment.year,
        },
      },
      update: {
        amount: payment.amount,
        paidAt: payment.paidAt,
      },
      create: {
        id: seedId('maintenance', projectId, String(payment.year), String(payment.month)),
        projectId,
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        paidAt: payment.paidAt,
      },
    })
  }
}

async function ensureTasks(
  projectId: string,
  tasks: TaskSeed[],
  members: Record<MemberKey, User>,
) {
  const taskIdByTitle = new Map<string, string>()

  for (const task of tasks) {
    const existing = await prisma.task.findFirst({
      where: {
        projectId,
        title: task.title,
      },
    })

    const data = {
      projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      estimatedHours: task.estimatedHours,
      assignedToId: members[task.assignedTo].id,
      position: task.position,
      dueDate: task.dueDate ?? null,
      approvalStatus: task.approvalStatus ?? null,
      rejectionReason: task.rejectionReason ?? null,
    }

    const persisted = existing
      ? await prisma.task.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.task.create({
          data: {
            id: seedId('task', projectId, task.title),
            ...data,
          },
        })

    taskIdByTitle.set(task.title, persisted.id)
  }

  return taskIdByTitle
}

async function ensureTimeEntries(
  projectId: string,
  taskIdByTitle: Map<string, string>,
  timeEntries: TimeEntrySeed[],
  members: Record<MemberKey, User>,
) {
  for (const entry of timeEntries) {
    const taskId = taskIdByTitle.get(entry.taskTitle)

    if (!taskId) continue

    await prisma.osTimeEntry.upsert({
      where: {
        id: seedId(
          'time-entry',
          projectId,
          entry.taskTitle,
          entry.member,
          String(entry.date.getTime()),
        ),
      },
      update: {
        taskId,
        projectId,
        userId: members[entry.member].id,
        hours: entry.hours,
        date: entry.date,
        notes: entry.notes,
      },
      create: {
        id: seedId(
          'time-entry',
          projectId,
          entry.taskTitle,
          entry.member,
          String(entry.date.getTime()),
        ),
        taskId,
        projectId,
        userId: members[entry.member].id,
        hours: entry.hours,
        date: entry.date,
        notes: entry.notes,
      },
    })
  }
}

async function ensureMessages(organizationId: string, organizationSlug: string) {
  const messages = conversationSeeds.filter((message) => message.organizationSlug === organizationSlug)

  for (const [index, message] of messages.entries()) {
    await prisma.message.upsert({
      where: {
        id: seedId('message', organizationSlug, String(index + 1)),
      },
      update: {
        organizationId,
        content: message.content,
        fromAdmin: message.fromAdmin,
        read: message.read,
        createdAt: message.createdAt,
      },
      create: {
        id: seedId('message', organizationSlug, String(index + 1)),
        organizationId,
        content: message.content,
        fromAdmin: message.fromAdmin,
        read: message.read,
        createdAt: message.createdAt,
      },
    })
  }
}

async function ensureTickets(
  organizationId: string,
  organizationSlug: string,
  clientUserId: string,
  members: Record<MemberKey, User>,
) {
  const tickets = ticketSeeds.filter((ticket) => ticket.organizationSlug === organizationSlug)

  for (const ticket of tickets) {
    const ticketId = seedId('ticket', organizationSlug, ticket.title)

    await prisma.ticket.upsert({
      where: { id: ticketId },
      update: {
        organizationId,
        userId: clientUserId,
        title: ticket.title,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      create: {
        id: ticketId,
        organizationId,
        userId: clientUserId,
        title: ticket.title,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    })

    for (const [index, message] of ticket.messages.entries()) {
      const authorId = message.author === 'client' ? clientUserId : members[message.author].id

      await prisma.ticketMessage.upsert({
        where: {
          id: seedId('ticket-message', organizationSlug, ticket.title, String(index + 1)),
        },
        update: {
          ticketId,
          userId: authorId,
          content: message.content,
          isAdmin: message.isAdmin,
          createdAt: message.createdAt,
        },
        create: {
          id: seedId('ticket-message', organizationSlug, ticket.title, String(index + 1)),
          ticketId,
          userId: authorId,
          content: message.content,
          isAdmin: message.isAdmin,
          createdAt: message.createdAt,
        },
      })
    }
  }
}

async function ensureContactSubmissions() {
  for (const [index, submission] of contactSubmissionSeeds.entries()) {
    await prisma.contactSubmission.upsert({
      where: {
        id: seedId('contact-submission', submission.email, String(index + 1)),
      },
      update: {
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        company: submission.company,
        service: submission.service,
        message: submission.message,
        createdAt: submission.createdAt,
      },
      create: {
        id: seedId('contact-submission', submission.email, String(index + 1)),
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        company: submission.company,
        service: submission.service,
        message: submission.message,
        createdAt: submission.createdAt,
      },
    })
  }
}

async function main() {
  const members = await getAgencyMembers()
  const clientPassword = await bcrypt.hash('Cliente1234!', 12)
  const organizationIdBySlug = new Map<string, string>()
  const clientUserIdByOrgSlug = new Map<string, string>()
  const leadIdByBusinessName = new Map<string, string>()

  await ensureAgencySettings()

  for (const organizationSeed of organizationSeeds) {
    const organization = await ensureOrganization(organizationSeed)
    organizationIdBySlug.set(organizationSeed.slug, organization.id)

    const clientUser = await ensureClientUser(organizationSeed, clientPassword)
    clientUserIdByOrgSlug.set(organizationSeed.slug, clientUser.id)

    await ensureOrgMember(organization.id, clientUser.id)
    await ensureOrganizationService(organization.id, organizationSeed.serviceType)
    await ensureSubscription(organization.id, organizationSeed.subscription)
    await ensureMessages(organization.id, organizationSeed.slug)
    await ensureTickets(organization.id, organizationSeed.slug, clientUser.id, members)
  }

  for (const leadSeed of leadSeeds) {
    const lead = await ensureLead(leadSeed, members)
    leadIdByBusinessName.set(leadSeed.businessName, lead.id)
    await ensureLeadActivities(lead.id, buildLeadActivities(leadSeed), members)
    await ensureLeadDemos(lead.id, buildLeadDemos(leadSeed))
  }

  for (const projectSeed of projectSeeds) {
    const organizationId = projectSeed.organizationSlug
      ? organizationIdBySlug.get(projectSeed.organizationSlug) ?? null
      : null

    if (projectSeed.organizationSlug && !organizationId) {
      throw new Error(`No se encontro organizationId para ${projectSeed.organizationSlug}`)
    }

    const linkedLeadId = projectSeed.linkedLeadBusinessName
      ? leadIdByBusinessName.get(projectSeed.linkedLeadBusinessName) ?? null
      : null

    const project = await ensureProject(projectSeed, organizationId, linkedLeadId)
    await ensureMilestones(project.id, projectSeed)
    await ensureMaintenancePayments(project.id, projectSeed.maintenancePayments)
    const taskIdByTitle = await ensureTasks(project.id, projectSeed.tasks, members)
    await ensureTimeEntries(project.id, taskIdByTitle, projectSeed.timeEntries, members)
  }

  await ensureContactSubmissions()

  process.stdout.write(
    [
      'Agency OS v2 seed listo',
      `- SUPER_ADMIN: ${members.franco.name ?? members.franco.email}`,
      `- SUPER_ADMIN: ${members.valentino.name ?? members.valentino.email}`,
      `- Organizations seed: ${organizationSeeds.length}`,
      `- Leads Os*: ${leadSeeds.length}`,
      `- Projects unificados: ${projectSeeds.length}`,
      `- Tickets: ${ticketSeeds.length}`,
      `- Conversaciones: ${new Set(conversationSeeds.map((item) => item.organizationSlug)).size}`,
      `- Contact submissions: ${contactSubmissionSeeds.length}`,
      '- Nota: el proyecto interno ya se siembra con organizationId = null.',
    ].join('\n') + '\n'
  )
}

main()
  .catch((error: unknown) => {
    console.error('Error ejecutando seed-agency-os:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

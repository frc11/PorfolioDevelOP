import {
  ActivityChannel,
  ActivityResult,
  LeadStatus,
  MilestoneType,
  OsProjectStatus,
  OsServiceType,
  OsTaskStatus,
  PrismaClient,
  Role,
  type User,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DAY_IN_MS = 24 * 60 * 60 * 1000

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
}

type TaskSeed = {
  title: string
  description: string
  status: OsTaskStatus
  estimatedHours: number
  assignedTo: MemberKey
  position: number
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
  linkedLeadBusinessName: string | null
  contactName: string
  contactPhone: string | null
  contactEmail: string | null
  name: string
  description: string
  serviceType: OsServiceType
  status: OsProjectStatus
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

function calculateSeedNextFollowUp(currentFollowUpNumber: number): Date | null {
  if (currentFollowUpNumber === 1 || currentFollowUpNumber === 2) {
    return daysFromNow(2)
  }

  if (currentFollowUpNumber === 3) {
    return daysFromNow(3)
  }

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
        name: 'Valentino DevelOP',
        email: 'valentino@develop.com',
        role: Role.SUPER_ADMIN,
        password: adminPassword,
        emailVerified: new Date(),
      },
    }))

  return { franco, valentino }
}

const leadSeeds: LeadSeed[] = [
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
    firstTouch: 'Se detecto trafico desde redes sin una landing clara para campañas.',
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
            ? ActivityResult.RESPONDIO
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

const projectSeeds: ProjectSeed[] = [
  {
    businessName: 'Concesionaria San Miguel',
    linkedLeadBusinessName: 'Concesionaria San Miguel',
    contactName: 'Carlos Mendoza',
    contactPhone: '+54 381 555 1210',
    contactEmail: 'carlos@sanmiguelautos.com.ar',
    name: 'Nuevo sitio comercial y CRM de ventas',
    description: 'Sitio comercial con catalogo, formularios inteligentes y pipeline para el equipo de ventas.',
    serviceType: OsServiceType.WEB,
    status: OsProjectStatus.EN_DESARROLLO,
    agreedAmount: '1200.00',
    monthlyRate: '150.00',
    startDate: daysAgo(14, 9),
    estimatedEndDate: daysFromNow(18, 18),
    deliveredAt: null,
    maintenanceStartDate: null,
    tasks: [
      { title: 'Arquitectura de informacion y relevamiento comercial', description: 'Mapa del sitio y necesidades del equipo de ventas.', status: OsTaskStatus.COMPLETADA, estimatedHours: 6, assignedTo: 'franco', position: 1 },
      { title: 'Home comercial y landings de modelos destacados', description: 'Maquetado del home y bloques de promociones.', status: OsTaskStatus.COMPLETADA, estimatedHours: 12, assignedTo: 'valentino', position: 2 },
      { title: 'Catalogo con filtros, fichas y CTA de leads', description: 'Fichas por vehiculo, filtros y CTAs contextuales.', status: OsTaskStatus.EN_PROGRESO, estimatedHours: 20, assignedTo: 'franco', position: 3 },
      { title: 'Integracion de formularios con CRM y WhatsApp', description: 'Conexion de formularios, alertas y pipeline interno.', status: OsTaskStatus.EN_PROGRESO, estimatedHours: 14, assignedTo: 'valentino', position: 4 },
      { title: 'Panel comercial y reportes de seguimiento', description: 'Resumen de leads, fuentes y conversion.', status: OsTaskStatus.PENDIENTE, estimatedHours: 18, assignedTo: 'franco', position: 5 },
    ],
    timeEntries: [
      { taskTitle: 'Arquitectura de informacion y relevamiento comercial', member: 'franco', hours: 2.5, date: daysAgo(19, 10), notes: 'Workshop inicial y definicion de secciones prioritarias.' },
      { taskTitle: 'Home comercial y landings de modelos destacados', member: 'valentino', hours: 3.5, date: daysAgo(17, 15), notes: 'Maquetado del home y hero con promociones vigentes.' },
      { taskTitle: 'Catalogo con filtros, fichas y CTA de leads', member: 'franco', hours: 4, date: daysAgo(11, 11), notes: 'Desarrollo del listado de vehiculos y filtros por marca.' },
      { taskTitle: 'Catalogo con filtros, fichas y CTA de leads', member: 'franco', hours: 3, date: daysAgo(8, 17), notes: 'Ajustes en fichas y CTAs para captacion de leads.' },
      { taskTitle: 'Integracion de formularios con CRM y WhatsApp', member: 'valentino', hours: 2.5, date: daysAgo(7, 16), notes: 'Conexion de eventos del formulario y estructura del pipeline.' },
      { taskTitle: 'Integracion de formularios con CRM y WhatsApp', member: 'valentino', hours: 3.5, date: daysAgo(4, 14), notes: 'Configuracion de alertas y pruebas con el equipo comercial.' },
      { taskTitle: 'Panel comercial y reportes de seguimiento', member: 'franco', hours: 2, date: daysAgo(2, 10), notes: 'Wireframe inicial de tablero y metricas de conversion.' },
    ],
    maintenancePayments: [],
    milestonePaidAt: { INICIO: daysAgo(12, 13), ENTREGA: null },
  },
  {
    businessName: 'Clinica Dental Sonrisa Norte',
    linkedLeadBusinessName: 'Clinica Dental Sonrisa Norte',
    contactName: 'Diego Salas',
    contactPhone: '+54 381 555 1211',
    contactEmail: 'direccion@sonrisanorte.com',
    name: 'Asistente IA de consultas y turnos',
    description: 'Agente para consultas frecuentes, derivacion a secretaria y seguimiento de tratamientos.',
    serviceType: OsServiceType.AI_AGENT,
    status: OsProjectStatus.EN_REVISION,
    agreedAmount: '500.00',
    monthlyRate: '90.00',
    startDate: daysAgo(10, 9),
    estimatedEndDate: daysFromNow(8, 18),
    deliveredAt: null,
    maintenanceStartDate: null,
    tasks: [
      { title: 'Definicion de flujos y entrenamiento inicial', description: 'Mapeo de preguntas frecuentes y tono del asistente.', status: OsTaskStatus.COMPLETADA, estimatedHours: 8, assignedTo: 'valentino', position: 1 },
      { title: 'Integracion con WhatsApp y agenda', description: 'Conexion con canales de consulta y agenda.', status: OsTaskStatus.EN_PROGRESO, estimatedHours: 10, assignedTo: 'franco', position: 2 },
      { title: 'Dashboard de conversaciones y derivaciones', description: 'Panel para seguimiento de conversaciones.', status: OsTaskStatus.PENDIENTE, estimatedHours: 9, assignedTo: 'valentino', position: 3 },
    ],
    timeEntries: [
      { taskTitle: 'Definicion de flujos y entrenamiento inicial', member: 'valentino', hours: 3, date: daysAgo(12, 15), notes: 'Armado del flujo base y respuestas frecuentes.' },
      { taskTitle: 'Integracion con WhatsApp y agenda', member: 'franco', hours: 2.5, date: daysAgo(9, 11), notes: 'Conexion inicial con derivacion a secretaria.' },
      { taskTitle: 'Integracion con WhatsApp y agenda', member: 'franco', hours: 3, date: daysAgo(6, 17), notes: 'Ajustes en validacion de turnos y mensajes de bienvenida.' },
      { taskTitle: 'Dashboard de conversaciones y derivaciones', member: 'valentino', hours: 2, date: daysAgo(3, 12), notes: 'Diseno de indicadores y primeras tablas del panel.' },
    ],
    maintenancePayments: [],
    milestonePaidAt: { INICIO: daysAgo(9, 13), ENTREGA: null },
  },
  {
    businessName: 'Estudio Contable Sigma',
    linkedLeadBusinessName: null,
    contactName: 'Marina Paz',
    contactPhone: '+54 381 555 1290',
    contactEmail: 'marina@sigmacontable.com.ar',
    name: 'Sitio institucional y mantenimiento mensual',
    description: 'Proyecto entregado con sitio institucional, formularios de contacto y automatizaciones livianas.',
    serviceType: OsServiceType.WEB,
    status: OsProjectStatus.EN_MANTENIMIENTO,
    agreedAmount: '900.00',
    monthlyRate: '120.00',
    startDate: daysAgo(90, 9),
    estimatedEndDate: daysAgo(42, 18),
    deliveredAt: daysAgo(45, 18),
    maintenanceStartDate: daysAgo(44, 10),
    tasks: [
      { title: 'Sitio institucional y pages de servicios', description: 'Proyecto institucional con foco en SEO local.', status: OsTaskStatus.COMPLETADA, estimatedHours: 14, assignedTo: 'franco', position: 1 },
      { title: 'Formularios y derivacion de consultas', description: 'Formularios y notificaciones para el equipo.', status: OsTaskStatus.COMPLETADA, estimatedHours: 8, assignedTo: 'valentino', position: 2 },
    ],
    timeEntries: [],
    maintenancePayments: [
      { month: new Date(new Date().setMonth(new Date().getMonth() - 2)).getMonth() + 1, year: new Date(new Date().setMonth(new Date().getMonth() - 2)).getFullYear(), amount: '120.00', paidAt: daysAgo(36, 12) },
      { month: new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth() + 1, year: new Date(new Date().setMonth(new Date().getMonth() - 1)).getFullYear(), amount: '120.00', paidAt: daysAgo(8, 11) },
    ],
    milestonePaidAt: { INICIO: daysAgo(85, 13), ENTREGA: daysAgo(45, 18) },
  },
]

async function ensureLead(seed: LeadSeed, members: Record<MemberKey, User>) {
  const existingLead = await prisma.osLead.findFirst({ where: { businessName: seed.businessName } })
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
    ? prisma.osLead.update({ where: { id: existingLead.id }, data })
    : prisma.osLead.create({ data })
}

async function ensureLeadActivities(leadId: string, activities: LeadActivitySeed[], members: Record<MemberKey, User>) {
  if (activities.length === 0) return

  const existing = await prisma.osLeadActivity.findMany({
    where: { leadId },
    select: { channel: true, createdAt: true, notes: true },
  })
  const keys = new Set(existing.map((item) => `${item.channel}|${item.createdAt.toISOString()}|${item.notes ?? ''}`))
  const missing = activities
    .filter((item) => !keys.has(`${item.channel}|${item.createdAt.toISOString()}|${item.notes}`))
    .map((item) => ({
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

  const existing = await prisma.osDemo.findMany({ where: { leadId }, select: { demoUrl: true } })
  const urls = new Set(existing.map((item) => item.demoUrl))
  const missing = demos
    .filter((item) => !urls.has(item.demoUrl))
    .map((item) => ({
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

async function ensureProject(seed: ProjectSeed, leadId: string | null) {
  const existing = await prisma.osProject.findFirst({
    where: { businessName: seed.businessName, name: seed.name },
  })
  const data = {
    leadId,
    businessName: seed.businessName,
    contactName: seed.contactName,
    contactPhone: seed.contactPhone,
    contactEmail: seed.contactEmail,
    organizationId: null,
    name: seed.name,
    description: seed.description,
    serviceType: seed.serviceType,
    status: seed.status,
    agreedAmount: seed.agreedAmount,
    monthlyRate: seed.monthlyRate,
    maintenanceStartDate: seed.maintenanceStartDate,
    startDate: seed.startDate,
    estimatedEndDate: seed.estimatedEndDate,
    deliveredAt: seed.deliveredAt,
  }

  return existing
    ? prisma.osProject.update({ where: { id: existing.id }, data })
    : prisma.osProject.create({ data })
}

async function ensureMilestones(projectId: string, agreedAmount: string, paidAt: ProjectSeed['milestonePaidAt']) {
  for (const milestone of [
    { type: MilestoneType.INICIO, amount: halfAmount(agreedAmount), paidAt: paidAt.INICIO },
    { type: MilestoneType.ENTREGA, amount: halfAmount(agreedAmount), paidAt: paidAt.ENTREGA },
  ] as const) {
    const existing = await prisma.osPaymentMilestone.findFirst({ where: { projectId, type: milestone.type } })
    if (existing) {
      await prisma.osPaymentMilestone.update({ where: { id: existing.id }, data: { amount: milestone.amount, paidAt: milestone.paidAt, dueAt: null } })
    } else {
      await prisma.osPaymentMilestone.create({ data: { projectId, type: milestone.type, amount: milestone.amount, paidAt: milestone.paidAt, dueAt: null } })
    }
  }
}

async function ensureMaintenancePayments(projectId: string, payments: ProjectSeed['maintenancePayments']) {
  for (const payment of payments) {
    await prisma.osMaintenancePayment.upsert({
      where: { projectId_month_year: { projectId, month: payment.month, year: payment.year } },
      update: { amount: payment.amount, paidAt: payment.paidAt },
      create: { projectId, month: payment.month, year: payment.year, amount: payment.amount, paidAt: payment.paidAt },
    })
  }
}

async function ensureTasks(projectId: string, tasks: TaskSeed[], members: Record<MemberKey, User>) {
  for (const task of tasks) {
    const existing = await prisma.osTask.findFirst({ where: { projectId, title: task.title } })
    const data = {
      projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      estimatedHours: task.estimatedHours,
      assignedToId: members[task.assignedTo].id,
      position: task.position,
    }

    if (existing) {
      await prisma.osTask.update({ where: { id: existing.id }, data })
    } else {
      await prisma.osTask.create({ data })
    }
  }
}

async function ensureTimeEntries(projectId: string, timeEntries: TimeEntrySeed[], members: Record<MemberKey, User>) {
  if (timeEntries.length === 0) return

  const tasks = await prisma.osTask.findMany({ where: { projectId }, select: { id: true, title: true } })
  const taskIdByTitle = new Map(tasks.map((task) => [task.title, task.id]))
  const existing = await prisma.osTimeEntry.findMany({
    where: { taskId: { in: tasks.map((task) => task.id) } },
    select: { taskId: true, date: true, hours: true, notes: true },
  })
  const keys = new Set(existing.map((item) => `${item.taskId}|${item.date.toISOString()}|${item.hours}|${item.notes ?? ''}`))
  const missing = timeEntries.flatMap((entry) => {
    const taskId = taskIdByTitle.get(entry.taskTitle)
    if (!taskId) return []
    const key = `${taskId}|${entry.date.toISOString()}|${entry.hours}|${entry.notes}`
    if (keys.has(key)) return []
    return [{ taskId, userId: members[entry.member].id, hours: entry.hours, date: entry.date, notes: entry.notes }]
  })

  if (missing.length > 0) {
    await prisma.osTimeEntry.createMany({ data: missing })
  }
}

async function main() {
  const members = await getAgencyMembers()
  const leadIdByBusinessName = new Map<string, string>()

  for (const seed of leadSeeds) {
    const lead = await ensureLead(seed, members)
    leadIdByBusinessName.set(seed.businessName, lead.id)
    await ensureLeadActivities(lead.id, buildLeadActivities(seed), members)
    await ensureLeadDemos(lead.id, buildLeadDemos(seed))
  }

  for (const projectSeed of projectSeeds) {
    const linkedLeadId = projectSeed.linkedLeadBusinessName
      ? leadIdByBusinessName.get(projectSeed.linkedLeadBusinessName) ?? null
      : null
    const project = await ensureProject(projectSeed, linkedLeadId)
    await ensureMilestones(project.id, projectSeed.agreedAmount, projectSeed.milestonePaidAt)
    await ensureMaintenancePayments(project.id, projectSeed.maintenancePayments)
    await ensureTasks(project.id, projectSeed.tasks, members)
    await ensureTimeEntries(project.id, projectSeed.timeEntries, members)
  }

  console.log('Agency OS seed listo')
  console.log(`- SUPER_ADMIN: ${members.franco.name ?? members.franco.email}`)
  console.log(`- SUPER_ADMIN: ${members.valentino.name ?? members.valentino.email}`)
  console.log(`- Leads Os*: ${leadSeeds.length}`)
  console.log(`- Proyectos Os*: ${projectSeeds.length}`)
  console.log('- El seed es idempotente y no elimina datos existentes del portal ni del admin clasico.')
}

main()
  .catch((error: unknown) => {
    console.error('Error ejecutando seed-agency-os:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

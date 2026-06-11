import {
  ApprovalStatus,
  AssetType,
  InvoiceStatus,
  NotificationType,
  OrgRole,
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
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_AGENCY_SETTINGS, DEFAULT_AGENCY_SETTINGS_ID } from '../src/lib/agency-settings'


const prisma = new PrismaClient()

const IDS = {
  organization: 'demo-org-san-miguel',
  webService: 'demo-service-san-miguel-web',
  aiService: 'demo-service-san-miguel-ai',
  project: 'demo-project-san-miguel-web-crm',
  subscription: 'demo-subscription-san-miguel',
  invoicePaid: 'demo-invoice-san-miguel-feb-2026',
  invoicePending: 'demo-invoice-san-miguel-mar-2026',
  assetLogo: 'demo-asset-san-miguel-logo',
  assetBrandbook: 'demo-asset-san-miguel-brandbook',
  assetHosting: 'demo-asset-san-miguel-hosting',
  assetContract: 'demo-asset-san-miguel-contract',
  ticketTechnical: 'demo-ticket-san-miguel-formulario',
  ticketFeature: 'demo-ticket-san-miguel-fotos',
  ticketTechnicalUserMessage: 'demo-ticket-message-san-miguel-formulario-user',
  ticketTechnicalAdminMessage: 'demo-ticket-message-san-miguel-formulario-admin',
  ticketFeatureUserMessage: 'demo-ticket-message-san-miguel-fotos-user',
  ticketFeatureAdminMessage: 'demo-ticket-message-san-miguel-fotos-admin',
  taskWireframes: 'demo-task-san-miguel-wireframes',
  taskHome: 'demo-task-san-miguel-home',
  taskCatalog: 'demo-task-san-miguel-catalogo',
  taskForm: 'demo-task-san-miguel-formulario',
  taskLeads: 'demo-task-san-miguel-leads',
  taskSeo: 'demo-task-san-miguel-seo',
  taskDeploy: 'demo-task-san-miguel-deploy',
  message1: 'demo-message-san-miguel-1',
  message2: 'demo-message-san-miguel-2',
  message3: 'demo-message-san-miguel-3',
  message4: 'demo-message-san-miguel-4',
  message5: 'demo-message-san-miguel-5',
  notification1: 'demo-notification-san-miguel-wireframes',
  notification2: 'demo-notification-san-miguel-aprobacion',
  notification3: 'demo-notification-san-miguel-mensaje',
} as const

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  const [adminPassword, clientPassword, clientBPassword] = await Promise.all([
    bcrypt.hash('Admin1234!', 12),
    bcrypt.hash('Cliente1234!', 12),
    bcrypt.hash('ClienteB1234!', 12),
  ])

  const admin = await prisma.user.upsert({
    where: { email: 'admin@develop.com' },
    update: {
      name: 'Admin DevelOP',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
    create: {
      name: 'Admin DevelOP',
      email: 'admin@develop.com',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'cliente@sanmiguel.com' },
    update: {
      name: 'Carlos Mendoza',
      password: clientPassword,
      role: Role.ORG_MEMBER,
      emailVerified: new Date(),
    },
    create: {
      name: 'Carlos Mendoza',
      email: 'cliente@sanmiguel.com',
      password: clientPassword,
      role: Role.ORG_MEMBER,
      emailVerified: new Date(),
    },
  })

  // MS-8 — Segundo cliente / org para tests de aislamiento (B11.3 probe).
  // El TLD `.test` es reservado por RFC 2606: nunca resolverá DNS público,
  // dejando claro que esto es data de QA, no demo presentable.
  const clientB = await prisma.user.upsert({
    where: { email: 'qa-cliente-b@develop.test' },
    update: {
      name: 'QA Cliente B',
      password: clientBPassword,
      role: Role.ORG_MEMBER,
      emailVerified: new Date(),
    },
    create: {
      name: 'QA Cliente B',
      email: 'qa-cliente-b@develop.test',
      password: clientBPassword,
      role: Role.ORG_MEMBER,
      emailVerified: new Date(),
    },
  })

  const organizationB = await prisma.organization.upsert({
    where: { slug: 'qa-cliente-b' },
    update: {
      companyName: 'QA Cliente B SA',
      onboardingCompleted: true,
    },
    create: {
      id: 'demo-org-qa-cliente-b',
      companyName: 'QA Cliente B SA',
      slug: 'qa-cliente-b',
      onboardingCompleted: true,
    },
  })

  await prisma.orgMember.upsert({
    where: {
      userId_organizationId: {
        userId: clientB.id,
        organizationId: organizationB.id,
      },
    },
    update: { role: OrgRole.ADMIN },
    create: {
      userId: clientB.id,
      organizationId: organizationB.id,
      role: OrgRole.ADMIN,
    },
  })

  const organization = await prisma.organization.upsert({
    where: { slug: 'san-miguel' },
    update: {
      companyName: 'Concesionaria San Miguel S.A.',
      analyticsPropertyId: 'properties/123456789',
      siteUrl: 'https://sanmiguel.com.ar',
      n8nWorkflowIds: ['workflow-001', 'workflow-002'],
      onboardingCompleted: true,
      whatsapp: '+54 11 5555-0101',
      notificationPrefs: {
        searchConsoleSiteUrl: 'https://sanmiguel.com.ar',
        gaPropertyId: 'properties/123456789',
        notes: 'n8nApiUrl y n8nApiKey usan variables globales del entorno.',
      },
    },
    create: {
      id: IDS.organization,
      companyName: 'Concesionaria San Miguel S.A.',
      slug: 'san-miguel',
      analyticsPropertyId: 'properties/123456789',
      siteUrl: 'https://sanmiguel.com.ar',
      n8nWorkflowIds: ['workflow-001', 'workflow-002'],
      onboardingCompleted: true,
      whatsapp: '+54 11 5555-0101',
      notificationPrefs: {
        searchConsoleSiteUrl: 'https://sanmiguel.com.ar',
        gaPropertyId: 'properties/123456789',
        notes: 'n8nApiUrl y n8nApiKey usan variables globales del entorno.',
      },
    },
  })

  await prisma.orgMember.upsert({
    where: {
      userId_organizationId: {
        userId: client.id,
        organizationId: organization.id,
      },
    },
    update: {
      role: OrgRole.ADMIN,
    },
    create: {
      userId: client.id,
      organizationId: organization.id,
      role: OrgRole.ADMIN,
    },
  })

  await prisma.service.upsert({
    where: { id: IDS.webService },
    update: {
      type: ServiceType.WEB_DEV,
      status: ServiceStatus.ACTIVE,
      startDate: daysAgo(60),
      organizationId: organization.id,
    },
    create: {
      id: IDS.webService,
      type: ServiceType.WEB_DEV,
      status: ServiceStatus.ACTIVE,
      startDate: daysAgo(60),
      organizationId: organization.id,
    },
  })

  await prisma.service.upsert({
    where: { id: IDS.aiService },
    update: {
      type: ServiceType.AI,
      status: ServiceStatus.ACTIVE,
      startDate: daysAgo(30),
      organizationId: organization.id,
    },
    create: {
      id: IDS.aiService,
      type: ServiceType.AI,
      status: ServiceStatus.ACTIVE,
      startDate: daysAgo(30),
      organizationId: organization.id,
    },
  })

  const project = await prisma.project.upsert({
    where: { id: IDS.project },
    update: {
      name: 'Sitio Web Corporativo + CRM',
      description:
        'Desarrollo del nuevo sitio web con catalogo de vehiculos 0km y usados, formulario de consultas inteligente y panel de gestion de leads para el equipo de ventas. Deadline estimado: 45 dias desde hoy.',
      status: ProjectStatus.IN_PROGRESS,
      organizationId: organization.id,
    },
    create: {
      id: IDS.project,
      name: 'Sitio Web Corporativo + CRM',
      description:
        'Desarrollo del nuevo sitio web con catalogo de vehiculos 0km y usados, formulario de consultas inteligente y panel de gestion de leads para el equipo de ventas. Deadline estimado: 45 dias desde hoy.',
      status: ProjectStatus.IN_PROGRESS,
      organizationId: organization.id,
    },
  })

  const tasks = [
    {
      id: IDS.taskWireframes,
      title: 'Relevamiento y diseño de wireframes',
      status: TaskStatus.DONE,
      approvalStatus: ApprovalStatus.APPROVED,
      dueDate: null,
    },
    {
      id: IDS.taskHome,
      title: 'Desarrollo del home y secciones principales',
      status: TaskStatus.DONE,
      approvalStatus: ApprovalStatus.APPROVED,
      dueDate: null,
    },
    {
      id: IDS.taskCatalog,
      title: 'Catálogo de vehículos 0km con filtros avanzados',
      status: TaskStatus.IN_PROGRESS,
      approvalStatus: ApprovalStatus.PENDING_APPROVAL,
      dueDate: null,
    },
    {
      id: IDS.taskForm,
      title: 'Formulario de consultas con notificaciones por WhatsApp',
      status: TaskStatus.IN_PROGRESS,
      approvalStatus: null,
      dueDate: null,
    },
    {
      id: IDS.taskLeads,
      title: 'Panel de administración de leads del equipo de ventas',
      status: TaskStatus.TODO,
      approvalStatus: null,
      dueDate: daysFromNow(14),
    },
    {
      id: IDS.taskSeo,
      title: 'Optimización SEO y performance (Core Web Vitals)',
      status: TaskStatus.TODO,
      approvalStatus: null,
      dueDate: daysFromNow(21),
    },
    {
      id: IDS.taskDeploy,
      title: 'Deploy, dominio y configuración de SSL',
      status: TaskStatus.TODO,
      approvalStatus: null,
      dueDate: daysFromNow(28),
    },
  ] as const

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        status: task.status,
        approvalStatus: task.approvalStatus,
        dueDate: task.dueDate,
        projectId: project.id,
      },
      create: {
        id: task.id,
        title: task.title,
        status: task.status,
        approvalStatus: task.approvalStatus,
        dueDate: task.dueDate,
        projectId: project.id,
      },
    })
  }

  // CC.5 — Suscripción a plan BUSINESS para que San Miguel pueda usar CRM.
  // El subscription apunta al Plan creado por prisma/seeds/sync-plans.ts.
  // Si el plan no existe (sync-plans no se corrió), planId queda null y el
  // runtime usa PLAN_FALLBACK (Starter) — el dashboard renderiza igual.
  const businessPlan = await prisma.plan.findUnique({ where: { key: 'BUSINESS' } })

  if (!businessPlan) {
    console.warn(
      '[seed] Plan BUSINESS no encontrado. Corré `npx tsx prisma/seeds/sync-plans.ts` antes para que el subscription se vincule. Por ahora se crea sin planId — CRM queda gateado.',
    )
  }

  await prisma.subscription.upsert({
    where: { organizationId: organization.id },
    update: {
      planId: businessPlan?.id ?? null,
      status: SubscriptionStatus.ACTIVE,
      price: businessPlan ? Number(businessPlan.monthlyPrice) : 150,
      currency: 'USD',
      renewalDate: daysFromNow(30),
    },
    create: {
      id: IDS.subscription,
      organizationId: organization.id,
      planId: businessPlan?.id ?? null,
      status: SubscriptionStatus.ACTIVE,
      price: businessPlan ? Number(businessPlan.monthlyPrice) : 150,
      currency: 'USD',
      renewalDate: daysFromNow(30),
    },
  })

  const messages = [
    {
      id: IDS.message1,
      content:
        '¡Hola Carlos! Ya tenemos los wireframes listos para revisión. ¿Podemos coordinar una videollamada esta semana para repasarlos juntos?',
      fromAdmin: true,
      read: true,
      createdAt: daysAgo(12),
    },
    {
      id: IDS.message2,
      content:
        'Perfecto Franco, el jueves a las 17hs me viene bien. Te mando el número por acá.',
      fromAdmin: false,
      read: true,
      createdAt: daysAgo(11),
    },
    {
      id: IDS.message3,
      content:
        'Agendado para el jueves 17hs. Te comparto el link de Meet por este medio. ¡Va a quedar muy bueno el resultado!',
      fromAdmin: true,
      read: true,
      createdAt: daysAgo(11),
    },
    {
      id: IDS.message4,
      content:
        'Esta semana arrancamos con el catálogo de vehículos. Subimos el avance el viernes para que lo puedas ver.',
      fromAdmin: true,
      read: true,
      createdAt: daysAgo(5),
    },
    {
      id: IDS.message5,
      content:
        'El catálogo está casi listo, te lo enviamos para aprobación. Revisá la sección Mi Proyecto para ver los detalles.',
      fromAdmin: true,
      read: false,
      createdAt: daysAgo(2),
    },
  ] as const

  for (const message of messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        content: message.content,
        fromAdmin: message.fromAdmin,
        read: message.read,
        createdAt: message.createdAt,
        organizationId: organization.id,
      },
      create: {
        id: message.id,
        content: message.content,
        fromAdmin: message.fromAdmin,
        read: message.read,
        createdAt: message.createdAt,
        organizationId: organization.id,
      },
    })
  }

  await prisma.ticket.upsert({
    where: { id: IDS.ticketTechnical },
    update: {
      title: 'El formulario de contacto no envía notificación',
      category: TicketCategory.TECHNICAL,
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      organizationId: organization.id,
      userId: client.id,
    },
    create: {
      id: IDS.ticketTechnical,
      title: 'El formulario de contacto no envía notificación',
      category: TicketCategory.TECHNICAL,
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      organizationId: organization.id,
      userId: client.id,
    },
  })

  await prisma.ticketMessage.upsert({
    where: { id: IDS.ticketTechnicalUserMessage },
    update: {
      content:
        'Probé completar el formulario del sitio actual y no recibí ninguna notificación por WhatsApp. ¿Es algo que están trabajando?',
      ticketId: IDS.ticketTechnical,
      userId: client.id,
      isAdmin: false,
      createdAt: daysAgo(3),
    },
    create: {
      id: IDS.ticketTechnicalUserMessage,
      content:
        'Probé completar el formulario del sitio actual y no recibí ninguna notificación por WhatsApp. ¿Es algo que están trabajando?',
      ticketId: IDS.ticketTechnical,
      userId: client.id,
      isAdmin: false,
      createdAt: daysAgo(3),
    },
  })

  await prisma.ticketMessage.upsert({
    where: { id: IDS.ticketTechnicalAdminMessage },
    update: {
      content:
        'Hola Carlos, ya lo detectamos y lo estamos solucionando. Te avisamos cuando esté resuelto, estimamos máximo 24 horas.',
      ticketId: IDS.ticketTechnical,
      userId: admin.id,
      isAdmin: true,
      createdAt: daysAgo(2),
    },
    create: {
      id: IDS.ticketTechnicalAdminMessage,
      content:
        'Hola Carlos, ya lo detectamos y lo estamos solucionando. Te avisamos cuando esté resuelto, estimamos máximo 24 horas.',
      ticketId: IDS.ticketTechnical,
      userId: admin.id,
      isAdmin: true,
      createdAt: daysAgo(2),
    },
  })

  await prisma.ticket.upsert({
    where: { id: IDS.ticketFeature },
    update: {
      title: '¿Cómo agrego una foto al catálogo?',
      category: TicketCategory.FEATURE_REQUEST,
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      organizationId: organization.id,
      userId: client.id,
    },
    create: {
      id: IDS.ticketFeature,
      title: '¿Cómo agrego una foto al catálogo?',
      category: TicketCategory.FEATURE_REQUEST,
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      organizationId: organization.id,
      userId: client.id,
    },
  })

  await prisma.ticketMessage.upsert({
    where: { id: IDS.ticketFeatureUserMessage },
    update: {
      content:
        'Quiero saber si puedo subir fotos de los vehículos yo mismo o si tienen que hacerlo ustedes.',
      ticketId: IDS.ticketFeature,
      userId: client.id,
      isAdmin: false,
      createdAt: daysAgo(10),
    },
    create: {
      id: IDS.ticketFeatureUserMessage,
      content:
        'Quiero saber si puedo subir fotos de los vehículos yo mismo o si tienen que hacerlo ustedes.',
      ticketId: IDS.ticketFeature,
      userId: client.id,
      isAdmin: false,
      createdAt: daysAgo(10),
    },
  })

  await prisma.ticketMessage.upsert({
    where: { id: IDS.ticketFeatureAdminMessage },
    update: {
      content:
        '¡Hola! Sí, vas a poder subir fotos vos mismo desde el panel de administración. Te lo mostramos en la próxima videollamada.',
      ticketId: IDS.ticketFeature,
      userId: admin.id,
      isAdmin: true,
      createdAt: daysAgo(9),
    },
    create: {
      id: IDS.ticketFeatureAdminMessage,
      content:
        '¡Hola! Sí, vas a poder subir fotos vos mismo desde el panel de administración. Te lo mostramos en la próxima videollamada.',
      ticketId: IDS.ticketFeature,
      userId: admin.id,
      isAdmin: true,
      createdAt: daysAgo(9),
    },
  })

  await prisma.invoice.upsert({
    where: { id: IDS.invoicePaid },
    update: {
      amount: 150,
      currency: 'USD',
      status: InvoiceStatus.PAID,
      dueDate: daysAgo(30),
      paidAt: daysAgo(28),
      paymentLink: 'Plan Profesional - Febrero 2026',
      organizationId: organization.id,
    },
    create: {
      id: IDS.invoicePaid,
      amount: 150,
      currency: 'USD',
      status: InvoiceStatus.PAID,
      dueDate: daysAgo(30),
      paidAt: daysAgo(28),
      paymentLink: 'Plan Profesional - Febrero 2026',
      organizationId: organization.id,
    },
  })

  await prisma.invoice.upsert({
    where: { id: IDS.invoicePending },
    update: {
      amount: 150,
      currency: 'USD',
      status: InvoiceStatus.PENDING,
      dueDate: daysFromNow(5),
      paidAt: null,
      paymentLink: 'Plan Profesional - Marzo 2026',
      organizationId: organization.id,
    },
    create: {
      id: IDS.invoicePending,
      amount: 150,
      currency: 'USD',
      status: InvoiceStatus.PENDING,
      dueDate: daysFromNow(5),
      paymentLink: 'Plan Profesional - Marzo 2026',
      organizationId: organization.id,
    },
  })

  const assets = [
    {
      id: IDS.assetLogo,
      name: 'Logo Principal',
      type: AssetType.LOGO,
      url: 'https://sanmiguel.com.ar/logo.png',
      description: 'Logo oficial en PNG fondo transparente',
    },
    {
      id: IDS.assetBrandbook,
      name: 'Guía de Estilo v2',
      type: AssetType.BRANDBOOK,
      url: 'https://sanmiguel.com.ar/guia-estilo.pdf',
      description: 'Colores, tipografías y uso del logo',
    },
    {
      id: IDS.assetHosting,
      name: 'Credenciales de Hosting',
      type: AssetType.ACCESS,
      url: 'cPanel: sanmiguel.com.ar | Usuario: admin_sm | Pass: ****',
      description: 'Acceso al panel de hosting',
    },
    {
      id: IDS.assetContract,
      name: 'Contrato de Servicios',
      type: AssetType.DOCUMENT,
      url: 'https://sanmiguel.com.ar/contrato.pdf',
      description: 'Contrato firmado Febrero 2026',
    },
  ] as const

  for (const asset of assets) {
    await prisma.clientAsset.upsert({
      where: { id: asset.id },
      update: {
        name: asset.name,
        type: asset.type,
        url: asset.url,
        description: asset.description,
        organizationId: organization.id,
      },
      create: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        description: asset.description,
        organizationId: organization.id,
      },
    })
  }

  const notifications = [
    {
      id: IDS.notification1,
      type: NotificationType.SUCCESS,
      title: 'Wireframes aprobados',
      message:
        'El equipo confirmó la aprobación de los wireframes. ¡Arrancamos con el desarrollo!',
      actionUrl: '/dashboard/project',
      createdAt: daysAgo(10),
    },
    {
      id: IDS.notification2,
      type: NotificationType.ACTION_REQUIRED,
      title: 'Entrega pendiente de aprobación',
      message: 'El catálogo de vehículos está listo para tu revisión.',
      actionUrl: '/dashboard/project',
      createdAt: daysAgo(2),
    },
    {
      id: IDS.notification3,
      type: NotificationType.INFO,
      title: 'Nuevo mensaje del equipo',
      message: 'Franco te dejó una actualización sobre el proyecto.',
      actionUrl: '/dashboard/messages',
      createdAt: daysAgo(1),
    },
  ] as const

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        userId: client.id,
        organizationId: organization.id,
        createdAt: notification.createdAt,
      },
      create: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        userId: client.id,
        organizationId: organization.id,
        createdAt: notification.createdAt,
      },
    })
  }

  await prisma.agencySettings.upsert({
    where: { id: DEFAULT_AGENCY_SETTINGS_ID },
    update: {
      agencyName: DEFAULT_AGENCY_SETTINGS.agencyName,
      contactEmail: DEFAULT_AGENCY_SETTINGS.contactEmail,
      contactWhatsapp: DEFAULT_AGENCY_SETTINGS.contactWhatsapp || null,
      websiteUrl: DEFAULT_AGENCY_SETTINGS.websiteUrl,
      alertWebhookUrl: DEFAULT_AGENCY_SETTINGS.alertWebhookUrl || null,
      alertOnTickets: DEFAULT_AGENCY_SETTINGS.alertOnTickets,
      alertOnLeads: DEFAULT_AGENCY_SETTINGS.alertOnLeads,
      alertOnChurn: DEFAULT_AGENCY_SETTINGS.alertOnChurn,
      alertOnExpiringSubscriptions: DEFAULT_AGENCY_SETTINGS.alertOnExpiringSubscriptions,
      alertOnClientMessages: DEFAULT_AGENCY_SETTINGS.alertOnClientMessages,
    },
    create: {
      id: DEFAULT_AGENCY_SETTINGS_ID,
      agencyName: DEFAULT_AGENCY_SETTINGS.agencyName,
      contactEmail: DEFAULT_AGENCY_SETTINGS.contactEmail,
      contactWhatsapp: DEFAULT_AGENCY_SETTINGS.contactWhatsapp || null,
      websiteUrl: DEFAULT_AGENCY_SETTINGS.websiteUrl,
      alertWebhookUrl: DEFAULT_AGENCY_SETTINGS.alertWebhookUrl || null,
      alertOnTickets: DEFAULT_AGENCY_SETTINGS.alertOnTickets,
      alertOnLeads: DEFAULT_AGENCY_SETTINGS.alertOnLeads,
      alertOnChurn: DEFAULT_AGENCY_SETTINGS.alertOnChurn,
      alertOnExpiringSubscriptions: DEFAULT_AGENCY_SETTINGS.alertOnExpiringSubscriptions,
      alertOnClientMessages: DEFAULT_AGENCY_SETTINGS.alertOnClientMessages,
    },
  })

  // NOTE: Module pricing catalog is now synced via prisma/seeds/sync-premium-modules.ts
  // Run: npx tsx prisma/seeds/sync-premium-modules.ts

  // CC.5 — BotConfig + KnowledgeBase para San Miguel (destrabar visual-qa cliente).
  // Sin esto, /dashboard/chatbot/* redirige porque getClientChatbotSession() devuelve null.
  // Valores realistas para que las pantallas de personalización, KB y preview se vean
  // "pobladas" (no vacías) cuando Franco verifique.
  const sanMiguelBot = await prisma.botConfig.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      slug: 'sanmiguel',
      botName: 'Lucía',
      isActive: true,
      accentColor: '#06b6d4',
      chatSurfaceTint: null,
      avatarStyle: 'neuro',
      borderRadius: 'medium',
      surfaceStyle: 'glass',
      position: 'bottom_right',
      fontStyle: 'sans',
      bubbleStyle: 'rounded',
      tone: 'informal_rioplatense',
      welcomeMessage:
        '¡Hola! Soy Lucía, te ayudo con info sobre nuestros autos, planes de pago, agendar test drive o lo que necesites.',
      quickReplies: [
        { id: 'qr-1', emoji: '🚗', label: 'Ver autos disponibles', promptToSend: 'Quiero ver los autos disponibles' },
        { id: 'qr-2', emoji: '💳', label: 'Planes de pago', promptToSend: 'Cómo son los planes de pago' },
        { id: 'qr-3', emoji: '📅', label: 'Agendar test drive', promptToSend: 'Quiero agendar un test drive' },
      ],
      industry: 'automotive',
      allowedDomains: ['sanmiguelautos.com.ar', 'www.sanmiguelautos.com.ar'],
    },
  })

  await prisma.knowledgeBase.upsert({
    where: { botConfigId: sanMiguelBot.id },
    update: {},
    create: {
      botConfigId: sanMiguelBot.id,
      businessInfo:
        'San Miguel Autos — concesionaria multimarca en Tucumán, desde 1998. Atendemos en Av. Mate de Luna 2300, lunes a viernes de 9 a 19, sábados de 9 a 13.',
      servicesOrProducts:
        '- Autos 0km: Toyota, Volkswagen, Renault, Fiat.\n- Usados certificados (con garantía 6 meses).\n- Planes de ahorro y financiación bancaria.\n- Servicio post-venta y taller propio.',
      faq:
        '- ¿Tienen financiación? Sí, ofrecemos crédito propio + bancos + planes de ahorro.\n- ¿Aceptan usados en parte de pago? Sí, hacemos tasación gratis.\n- ¿Cuánto demora la entrega? Entre 7 y 30 días según modelo y stock.',
      policies:
        'Garantía oficial de fábrica en 0km. Usados con 6 meses de garantía mecánica. Devolución no aceptada salvo defecto de fabricación documentado en los primeros 30 días.',
      salesGuidance:
        'Si el cliente quiere precio específico o agendar test drive → derivar a WhatsApp del asesor. Si pregunta por stock de un modelo específico, ofrecer reservar visita.',
      toneExamples:
        'Tono cercano y rioplatense, sin abusar del "vos". Ejemplo: "Dale, te lo armo y te paso el contacto del asesor en un toque."',
      forbiddenStatements:
        'No prometer precios fijos sin consultar (el stock varía). No comprometer entregas en menos de 7 días. No dar datos personales de empleados.',
    },
  })

  process.stdout.write(
    [
      'Seed demo listo:',
      `- Admin: ${admin.email}`,
      `- Cliente A: ${client.email} (org ${organization.slug})`,
      `- Cliente B (QA): ${clientB.email} (org ${organizationB.slug})`,
      `- Organizacion A: ${organization.companyName} (${organization.slug})`,
      `- Organizacion B (QA): ${organizationB.companyName} (${organizationB.slug})`,
      '- Servicios: 2',
      `- Proyecto: ${project.name}`,
      `- Tareas: ${tasks.length}`,
      `- Mensajes: ${messages.length}`,
      '- Tickets: 2',
      '- Facturas: 2',
      `- Assets: ${assets.length}`,
      `- Notificaciones: ${notifications.length}`,
      `- Modulos premium: ver tabla premium_module en BD`,

      'Credenciales:',
      '- admin@develop.com / Admin1234!',
      '- cliente@sanmiguel.com / Cliente1234!',
      '- qa-cliente-b@develop.test / ClienteB1234! (QA, aislamiento)',
      'Notas de compatibilidad del schema:',
      '- service.name no existe; se sembraron 2 servicios por tipo.',
      '- project.deadline no existe; se agregó al description.',
      '- ticket.description no existe; se guardó como mensaje inicial del ticket.',
      '- invoice.description no existe; se guardó en paymentLink.',
      '- billingEmail, n8nApiUrl y n8nApiKey no existen; se documentaron en notificationPrefs.',
    ].join('\n') + '\n'
  )
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

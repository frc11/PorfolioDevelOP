import { PrismaClient, Role, OrgRole, ServiceType, ServiceStatus, ProjectStatus, TaskStatus, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function main() {
  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@develop.com' },
    update: { emailVerified: new Date(), password: adminPassword, role: Role.SUPER_ADMIN },
    create: {
      email: 'admin@develop.com',
      name: 'Admin DevelOP',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log(`✅ Admin: ${admin.email} (${admin.role})`)

  // ─── Cliente San Miguel ───────────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Cliente1234!', 12)

  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@sanmiguel.com' },
    update: { emailVerified: new Date(), password: clientPassword, role: Role.ORG_MEMBER },
    create: {
      email: 'cliente@sanmiguel.com',
      name: 'Carlos Mendoza',
      password: clientPassword,
      role: Role.ORG_MEMBER,
      emailVerified: new Date(),
    },
  })
  console.log(`✅ Cliente: ${clientUser.email} (${clientUser.role})`)

  // ─── Organización San Miguel ──────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'san-miguel' },
    update: {
      companyName: 'Concesionaria San Miguel S.A.',
      analyticsPropertyId: 'properties/123456789',
      siteUrl: 'https://sanmiguel.com.ar',
      n8nWorkflowIds: ['workflow-001', 'workflow-002'],
    },
    create: {
      companyName: 'Concesionaria San Miguel S.A.',
      slug: 'san-miguel',
      analyticsPropertyId: 'properties/123456789',
      siteUrl: 'https://sanmiguel.com.ar',
      n8nWorkflowIds: ['workflow-001', 'workflow-002'],
    },
  })
  console.log(`✅ Org: ${org.companyName} (${org.slug})`)

  // ─── Membresía ────────────────────────────────────────────────────────────
  await prisma.orgMember.upsert({
    where: { userId_organizationId: { userId: clientUser.id, organizationId: org.id } },
    update: { role: OrgRole.ADMIN },
    create: {
      userId: clientUser.id,
      organizationId: org.id,
      role: OrgRole.ADMIN,
    },
  })
  console.log(`✅ Membresía: ${clientUser.email} → ${org.companyName}`)

  // ─── Servicios ────────────────────────────────────────────────────────────
  const webDevService = await prisma.service.findFirst({
    where: { organizationId: org.id, type: ServiceType.WEB_DEV },
  })
  if (!webDevService) {
    await prisma.service.create({
      data: {
        type: ServiceType.WEB_DEV,
        status: ServiceStatus.ACTIVE,
        startDate: daysAgo(60),
        organizationId: org.id,
      },
    })
    console.log(`✅ Servicio WEB_DEV creado`)
  } else {
    console.log(`✅ Servicio WEB_DEV ya existe`)
  }

  const aiService = await prisma.service.findFirst({
    where: { organizationId: org.id, type: ServiceType.AI },
  })
  if (!aiService) {
    await prisma.service.create({
      data: {
        type: ServiceType.AI,
        status: ServiceStatus.ACTIVE,
        startDate: daysAgo(30),
        organizationId: org.id,
      },
    })
    console.log(`✅ Servicio AI creado`)
  } else {
    console.log(`✅ Servicio AI ya existe`)
  }

  // ─── Proyecto ─────────────────────────────────────────────────────────────
  const existingProject = await prisma.project.findFirst({
    where: { organizationId: org.id },
  })
  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: 'Sitio web corporativo + CRM',
        description: 'Desarrollo del sitio web principal con catálogo de vehículos, formularios de consulta y panel de administración de leads.',
        status: ProjectStatus.IN_PROGRESS,
        organizationId: org.id,
        tasks: {
          create: [
            { title: 'Relevamiento y diseño de mockups',             status: TaskStatus.DONE },
            { title: 'Desarrollo home y secciones principales',      status: TaskStatus.DONE },
            { title: 'Catálogo de vehículos con filtros',            status: TaskStatus.IN_PROGRESS },
            { title: 'Formulario de consultas con notificaciones',   status: TaskStatus.IN_PROGRESS },
            { title: 'Panel de administración de leads',             status: TaskStatus.TODO, dueDate: daysFromNow(14) },
            { title: 'Optimización SEO y performance',              status: TaskStatus.TODO, dueDate: daysFromNow(21) },
            { title: 'Deploy y configuración del dominio',          status: TaskStatus.TODO, dueDate: daysFromNow(28) },
          ],
        },
      },
    })
    console.log(`✅ Proyecto: ${project.name}`)
  } else {
    console.log(`✅ Proyecto ya existe: ${existingProject.name}`)
  }

  // ─── Mensajes ─────────────────────────────────────────────────────────────
  const existingMessages = await prisma.message.count({ where: { organizationId: org.id } })
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        {
          content: '¡Hola Carlos! Ya tenemos los mockups listos para revisión. ¿Podemos coordinar una llamada esta semana?',
          fromAdmin: true,
          read: true,
          organizationId: org.id,
          createdAt: daysAgo(14),
        },
        {
          content: 'Perfecto, el jueves a las 17hs me viene bien.',
          fromAdmin: false,
          read: true,
          organizationId: org.id,
          createdAt: daysAgo(13),
        },
        {
          content: 'Agendado para el jueves 17hs. Te mando el link de la reunión.',
          fromAdmin: true,
          read: true,
          organizationId: org.id,
          createdAt: daysAgo(13),
        },
        {
          content: 'Esta semana arrancamos con el catálogo de vehículos. Va a quedar muy bueno.',
          fromAdmin: true,
          read: false,
          organizationId: org.id,
          createdAt: daysAgo(2),
        },
      ],
    })
    console.log(`✅ Mensajes creados (4)`)
  } else {
    console.log(`✅ Mensajes ya existen (${existingMessages})`)
  }

  // ─── Factura ──────────────────────────────────────────────────────────────
  const existingInvoice = await prisma.invoice.findFirst({ where: { organizationId: org.id } })
  if (!existingInvoice) {
    await prisma.invoice.create({
      data: {
        amount: 800,
        currency: 'USD',
        status: InvoiceStatus.PAID,
        dueDate: daysAgo(30),
        organizationId: org.id,
      },
    })
    console.log(`✅ Factura: $800 USD (PAID)`)
  } else {
    console.log(`✅ Factura ya existe`)
  }

  console.log('\n─────────────────────────────────────────')
  console.log('🎉 Seed completado exitosamente')
  console.log('─────────────────────────────────────────')
  console.log('📧 Admin:    admin@develop.com     / Admin1234!')
  console.log('📧 Cliente:  cliente@sanmiguel.com / Cliente1234!')
  console.log('─────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

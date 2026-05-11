import type { OnboardingTaskCategory } from '@prisma/client'

export type OnboardingTaskSeed = {
  category: OnboardingTaskCategory
  title: string
  description: string
  sortOrder: number
}

export const ONBOARDING_TASKS_CATALOG: OnboardingTaskSeed[] = [
  // ─── SETUP (4 tareas) ───
  {
    category: 'SETUP',
    title: 'Crear cuenta del cliente y enviar credenciales',
    description:
      'Crear el OrgMember principal con rol ORG_MEMBER. Enviar email de bienvenida con link de primer login.',
    sortOrder: 1,
  },
  {
    category: 'SETUP',
    title: 'Configurar AgencySettings de la organización',
    description:
      'Logo del cliente, colores de marca, nombre comercial, CUIT, dirección.',
    sortOrder: 2,
  },
  {
    category: 'SETUP',
    title: 'Crear Project inicial con tareas y hitos',
    description:
      'Crear el proyecto principal (sitio web). Cargar al menos 5 tareas con fechas tentativas.',
    sortOrder: 3,
  },
  {
    category: 'SETUP',
    title: 'Habilitar módulos contratados',
    description:
      'Activar los OrganizationModule según lo que pagó el cliente. Ej: Motor de Reseñas si lo contrató.',
    sortOrder: 4,
  },

  // ─── DATA_CONNECTIONS (5 tareas) ───
  {
    category: 'DATA_CONNECTIONS',
    title: 'Conectar Google Analytics 4',
    description:
      'Pedir acceso al GA4 del cliente. Configurar el GOOGLE_SERVICE_ACCOUNT en su DataConnection. Verificar que /dashboard/resultados/trafico muestre datos reales.',
    sortOrder: 5,
  },
  {
    category: 'DATA_CONNECTIONS',
    title: 'Conectar Google Search Console',
    description:
      'Pedir acceso a SC del cliente. Configurar las credenciales. Verificar que /dashboard/resultados/seo muestre datos reales.',
    sortOrder: 6,
  },
  {
    category: 'DATA_CONNECTIONS',
    title: 'Configurar PageSpeed Insights y UptimeRobot',
    description:
      'Cargar la URL del sitio en pagespeed_audit. Crear monitor en UptimeRobot y guardar el monitorId. Verificar que el HealthScore use datos reales.',
    sortOrder: 7,
  },
  {
    category: 'DATA_CONNECTIONS',
    title: 'Conectar Google Business Profile',
    description:
      'OAuth flow del GBP del cliente. Verificar que las reseñas y rating real aparezcan en el dashboard.',
    sortOrder: 8,
  },
  {
    category: 'DATA_CONNECTIONS',
    title: 'Configurar canal de notificaciones',
    description:
      'Email principal del cliente para notificaciones (Resend). Si quiere alertas críticas también por WhatsApp, configurar.',
    sortOrder: 9,
  },

  // ─── CONTENT (2 tareas) ───
  {
    category: 'CONTENT',
    title: 'Subir credenciales a la Bóveda Digital',
    description:
      'Cargar (encriptadas) las credenciales del dominio, hosting, redes sociales, accesos a herramientas. El cliente las ve después.',
    sortOrder: 10,
  },
  {
    category: 'CONTENT',
    title: 'Cargar contenido inicial del sitio',
    description:
      'Textos, imágenes, productos/servicios. Validar con el cliente antes del go-live.',
    sortOrder: 11,
  },

  // ─── TRAINING (2 tareas) ───
  {
    category: 'TRAINING',
    title: 'Llamada de bienvenida y tour del panel (30 min)',
    description:
      'Mostrar al cliente cómo usar /dashboard, /messages, /proyecto, /boveda. Resolver dudas iniciales.',
    sortOrder: 12,
  },
  {
    category: 'TRAINING',
    title: 'Capacitación específica de módulos premium',
    description:
      'Si tiene Motor de Reseñas: cómo aprobar drafts. Si tiene Email Marketing: cómo crear campaña. Etc.',
    sortOrder: 13,
  },

  // ─── GO_LIVE (1 tarea) ───
  {
    category: 'GO_LIVE',
    title: 'Sitio publicado + cliente operando',
    description:
      'Sitio web en producción con dominio final. Cliente accede al panel sin problemas. Cierre del onboarding.',
    sortOrder: 14,
  },
]

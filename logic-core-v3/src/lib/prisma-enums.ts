// BP.2 — Enums client-safe.
//
// Este archivo replica los enums de `@prisma/client` que necesitan estar
// disponibles en runtime del navegador (forms, validaciones Zod, selectores).
//
// MOTIVO: importar enums directo desde '@prisma/client' arrastra
// `@prisma/client/index.js` al chunk del browser (~68 KB con PrismaClient
// + PrismaClientKnownRequestError + todos los enums). Detectado en BP.2.
//
// REGLA: mantener sincronizado con `prisma/schema.prisma`. Si se agrega un
// valor allá, agregarlo acá. Los strings son idénticos, así que los valores
// son type-compatibles con los enums de Prisma del lado server.

export const PlanKey = {
  STARTER: 'STARTER',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS',
} as const
export type PlanKey = (typeof PlanKey)[keyof typeof PlanKey]

export const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
} as const
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus]

export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority]

export const TicketCategory = {
  TECHNICAL: 'TECHNICAL',
  BILLING: 'BILLING',
  FEATURE_REQUEST: 'FEATURE_REQUEST',
  OTHER: 'OTHER',
} as const
export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory]

'use server'

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { unsafeGlobalQuery } from '@/lib/isolation'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'

// Hard-delete IRREVERSIBLE de un cliente. Borra el Organization y, por la cascada
// del schema (todos los hijos son onDelete: Cascade), todo lo propio del cliente:
// bot + sus hijos, proyectos, tickets, mensajes, assets, suscripción, módulos, etc.
// Los OsLead (pipeline de ventas) NO son org-owned (no tienen organizationId; el
// único vínculo es indirecto vía Project.osLeadId) → SOBREVIVEN solos a la cascada.
// No hay ningún campo que "desvincular": borrar el Project no toca el OsLead.

const InputSchema = z.object({
  organizationId: z.string().min(1),
})

interface ClientDeletionSummary {
  companyName: string
  projects: number
  tickets: number
  messages: number
  assets: number
  hasBot: boolean
  botName: string | null
  hasSubscription: boolean
  // Se borran con el bot:
  deletedBotLeads: number // ChatbotLead no convertidos
  deletedConversations: number
  // Sobreviven en el pipeline de ventas:
  preservedLeads: number
}

// Junta los counts de lo que se borra y lo que se preserva. Acepta el client
// global o un tx de transacción (PrismaClient es asignable a TransactionClient).
async function gatherDeletionSummary(
  db: Prisma.TransactionClient,
  organizationId: string,
): Promise<ClientDeletionSummary | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      companyName: true,
      botConfig: { select: { id: true, botName: true } },
      subscription: { select: { id: true } },
      _count: {
        select: { projects: true, tickets: true, messages: true, clientAssets: true },
      },
    },
  })
  if (!org) return null

  const botId = org.botConfig?.id ?? null

  // OsLead preservados: alcanzables vía Project.osLeadId de este org +
  // apuntados por ChatbotLead.convertedToOsLeadId del bot de este cliente.
  const projectLeadRows = await db.project.findMany({
    where: { organizationId, osLeadId: { not: null } },
    select: { osLeadId: true },
  })
  const convertedRows = botId
    ? await db.chatbotLead.findMany({
        where: { botConfigId: botId, convertedToOsLeadId: { not: null } },
        select: { convertedToOsLeadId: true },
      })
    : []

  const leadIds = new Set<string>()
  for (const row of projectLeadRows) if (row.osLeadId) leadIds.add(row.osLeadId)
  for (const row of convertedRows) if (row.convertedToOsLeadId) leadIds.add(row.convertedToOsLeadId)

  // Solo contamos los OsLead que existen de verdad (un convertedToOsLeadId puede
  // apuntar a un OsLead ya borrado — es un string suelto, no una FK).
  const preservedLeads =
    leadIds.size > 0
      ? await db.osLead.count({ where: { id: { in: [...leadIds] } } })
      : 0

  const deletedBotLeads = botId
    ? await db.chatbotLead.count({
        where: { botConfigId: botId, convertedToOsLeadId: null },
      })
    : 0
  const deletedConversations = botId
    ? await db.conversation.count({ where: { botConfigId: botId } })
    : 0

  return {
    companyName: org.companyName,
    projects: org._count.projects,
    tickets: org._count.tickets,
    messages: org._count.messages,
    assets: org._count.clientAssets,
    hasBot: Boolean(botId),
    botName: org.botConfig?.botName ?? null,
    hasSubscription: Boolean(org.subscription),
    deletedBotLeads,
    deletedConversations,
    preservedLeads,
  }
}

// Read-only: alimenta el modal de confirmación antes de borrar.
export async function getClientDeletionSummary(
  input: z.infer<typeof InputSchema>,
) {
  await requireSuperAdmin()
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) throw new Error('Datos inválidos.')

  // TENANT-MGMT: resumen de borrado — cruza modelos org-owned y NO org-owned
  // (OsLead sobrevive a la cascada); inherentemente de plataforma.
  const summary = await unsafeGlobalQuery(
    'TENANT-MGMT: resumen de hard-delete del cliente (cross-model, incluye OsLead preservado)',
    (c) => gatherDeletionSummary(c, parsed.data.organizationId),
  )
  if (!summary) throw new Error('Cliente no encontrado.')

  return { ok: true as const, summary }
}

export async function hardDeleteClient(input: z.infer<typeof InputSchema>) {
  const admin = await requireSuperAdmin()
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) throw new Error('Datos inválidos.')
  const { organizationId } = parsed.data

  // TENANT-MGMT: hard-delete irreversible del Organization; la cascada del schema
  // borra todo lo propio del cliente. Operación destructiva de plataforma.
  const summary = await unsafeGlobalQuery(
    'TENANT-MGMT: hard-delete del cliente (cascade org→hijos, super-admin)',
    (client) =>
      client.$transaction(
        async (tx) => {
          const s = await gatherDeletionSummary(tx, organizationId)
          if (!s) throw new Error('Cliente no encontrado.')
          // Cascada del schema borra todo lo propio. OsLead sobrevive (no es org-owned).
          await tx.organization.delete({ where: { id: organizationId } })
          return s
        },
        { timeout: 60000 },
      ),
  )

  // Detalle de lo borrado con labels legibles (lo expande el AuditLogClient).
  const deletedDetail: Record<string, string | number> = {
    Proyectos: summary.projects,
    Tickets: summary.tickets,
    Mensajes: summary.messages,
    Archivos: summary.assets,
  }
  if (summary.hasBot) {
    deletedDetail.Bot = summary.botName ?? 'sí'
    deletedDetail.Conversaciones = summary.deletedConversations
    deletedDetail['Leads del bot'] = summary.deletedBotLeads
  }
  if (summary.hasSubscription) {
    deletedDetail['Suscripción'] = 'sí'
  }

  // Audit FUERA de la transacción y SIN FK al Organization (AdminAuditLog.targetId
  // es un string plano) → la entrada sobrevive al borrado del cliente.
  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_DELETED',
    action: `Eliminó (hard-delete) el cliente "${summary.companyName}"`,
    targetType: 'Organization',
    targetId: organizationId,
    metadata: {
      hardDelete: true,
      deleted: deletedDetail,
      preservedLeads: summary.preservedLeads,
    },
  })

  revalidateTag('admin-clients', {})
  revalidatePath('/admin/clients')

  return {
    ok: true as const,
    companyName: summary.companyName,
    preservedLeads: summary.preservedLeads,
  }
}

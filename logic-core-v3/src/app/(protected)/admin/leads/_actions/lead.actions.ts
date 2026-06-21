'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  etiquetaSetter,
  registrarReasignacion,
} from '@/lib/leados/assignment-trail'
import { SOLO_CONTACTOS_COMERCIALES } from '@/lib/leados/isolation'
import { emitirNovedadSetter } from '@/lib/leados/novedades'
import {
  AssignLeadSetterSchema,
  CreateLeadSchema,
  LeadIdSchema,
  UpdateLeadSchema,
  UpdateLeadStatusSchema,
} from './lead.schemas'

type LeadListItem = Prisma.OsLeadGetPayload<{
  include: {
    _count: {
      select: {
        activities: true
        demos: true
      }
    }
  }
}>

type LeadDetail = Prisma.OsLeadGetPayload<{
  include: {
    activities: true
    demos: true
    project: true
  }
}>

type LeadProject = NonNullable<LeadDetail['project']>

type SerializedLeadDetail = Omit<LeadDetail, 'project'> & {
  project:
    | (Omit<LeadProject, 'agreedAmount' | 'monthlyRate'> & {
        agreedAmount: string
        monthlyRate: string | null
      })
    | null
}

export async function createLead(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateLeadSchema.parse(input)

    const lead = await prisma.osLead.create({
      data: parsed,
      select: { id: true },
    })

    revalidatePath('/admin/leads')
    revalidateTag('admin-leads', {})
    return ok({ id: lead.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create lead')
  }
}

export async function updateLead(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateLeadSchema.parse(input)
    const { leadId, ...data } = parsed

    const lead = await prisma.osLead.update({
      where: { id: leadId },
      data,
      select: { id: true },
    })

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    revalidateTag('admin-leads', {})
    return ok({ id: lead.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update lead')
  }
}

export async function updateLeadStatus(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateLeadStatusSchema.parse(input)

    const lead = await prisma.osLead.update({
      where: { id: parsed.leadId },
      data: {
        status: parsed.status,
        reactivateAt:
          parsed.status === 'POSTERGADO' ? parsed.reactivateAt ?? null : null,
      },
      select: { id: true },
    })

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidateTag('admin-leads', {})
    return ok({ id: lead.id })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Failed to update lead status'
    )
  }
}

/**
 * B5 (LeadOS) — Asigna/desasigna el lead a un setter. La asignación es la
 * curaduría del admin: define qué leads ve el setter en su panel (ownership
 * por `assignedToId`).
 */
export async function assignLeadSetter(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const adminId = await requireSuperAdmin()
    const parsed = AssignLeadSetterSchema.parse(input)

    // Dueño previo: para detectar el cambio real y etiquetar el rastro.
    // `businessName` se snapshotea en las novedades dirigidas (in-app).
    const previo = await prisma.osLead.findUnique({
      where: { id: parsed.leadId },
      select: { assignedToId: true, businessName: true },
    })
    if (!previo) {
      return fail('Lead not found')
    }
    const fromId = previo.assignedToId

    let toName: string | null = null
    if (parsed.setterId !== null) {
      const setter = await prisma.user.findUnique({
        where: { id: parsed.setterId },
        select: { role: true, name: true },
      })
      if (!setter || setter.role !== 'SETTER') {
        return fail('El usuario elegido no es un setter')
      }
      toName = setter.name
    }

    const lead = await prisma.osLead.update({
      where: { id: parsed.leadId },
      data: { assignedToId: parsed.setterId },
      select: { id: true },
    })

    // Rastro visible SOLO si el dueño efectivamente cambió (re-asignar al
    // mismo setter no deja entrada). MUESTRA el cambio, no lo causa.
    if (fromId !== parsed.setterId) {
      let fromName: string | null = null
      if (fromId !== null) {
        const fromSetter = await prisma.user.findUnique({
          where: { id: fromId },
          select: { name: true },
        })
        fromName = fromSetter?.name ?? null
      }
      await registrarReasignacion({
        leadId: parsed.leadId,
        fromLabel: etiquetaSetter(fromName),
        toLabel: etiquetaSetter(toName),
        performedById: adminId,
      })

      // 0.5.8 — Novedades DIRIGIDAS al setter (in-app): el handoff dejó de ser
      // mudo. El destinatario sale de la regla única `destinatarioNovedad`
      // (dentro de emitirNovedadSetter); cada extremo nulo se ignora solo.
      //   - entrante → al NUEVO dueño ("te asignaron este lead");
      //   - saliente → al dueño PREVIO ("te sacaron un lead") — el cabo que
      //     dejó declarado 0.5.3: ya no es `assignedToId`, no lo ve en su cartera.
      // Fire-and-forget: nunca rompe la asignación (ya persistida arriba).
      await emitirNovedadSetter({
        evento: { kind: 'LEAD_ASIGNADO', ownerActual: parsed.setterId },
        leadId: parsed.leadId,
        businessName: previo.businessName,
      })
      await emitirNovedadSetter({
        evento: { kind: 'LEAD_REASIGNADO_SALIENTE', ownerPrevio: fromId },
        leadId: null,
        businessName: previo.businessName,
      })

      // Contrato de invalidación: el handoff cambió datos visibles del setter
      // (su feed de novedades). Mismo gesto que `revalidarRevision` del lado de
      // la revisión — así la superficie del setter no queda atada al caché.
      revalidatePath('/setter')
      revalidatePath(`/setter/leads/${parsed.leadId}`)
    }

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidateTag('admin-leads', {})
    return ok({ id: lead.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to assign lead')
  }
}

export async function deleteLead(
  leadId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()
    const parsedLeadId = LeadIdSchema.parse(leadId)

    await prisma.osLead.delete({
      where: { id: parsedLeadId },
    })

    revalidatePath('/admin/leads')
    revalidateTag('admin-leads', {})
    return ok<void>(undefined)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to delete lead')
  }
}

export async function listLeads(): Promise<
  ActionResult<LeadListItem[]>
> {
  try {
    await requireSuperAdmin()

    const leads = await prisma.osLead.findMany({
      include: {
        _count: {
          select: {
            // Conteo de contactos comerciales: excluye eventos internos
            // (reasignación) para no inflar "actividades".
            activities: { where: SOLO_CONTACTOS_COMERCIALES },
            demos: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return ok(leads)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list leads')
  }
}

export async function getLeadById(
  id: string
): Promise<
  ActionResult<SerializedLeadDetail>
> {
  try {
    await requireSuperAdmin()
    const parsedLeadId = LeadIdSchema.parse(id)

    const lead = await prisma.osLead.findUnique({
      where: { id: parsedLeadId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        demos: {
          orderBy: { createdAt: 'desc' },
        },
        project: true,
      },
    })

    if (!lead) {
      return fail('Lead not found')
    }

    const serializedLead = {
      ...lead,
      project: lead.project
        ? {
            ...lead.project,
            agreedAmount: lead.project.agreedAmount?.toString() ?? '',
            monthlyRate: lead.project.monthlyRate?.toString() ?? null,
          }
        : null,
    }

    return ok(serializedLead)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to get lead')
  }
}

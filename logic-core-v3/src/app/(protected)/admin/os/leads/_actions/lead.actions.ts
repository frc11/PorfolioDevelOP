'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
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

    revalidatePath('/admin/os/leads')
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

    revalidatePath('/admin/os/leads')
    revalidatePath(`/admin/os/leads/${leadId}`)
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

    revalidatePath('/admin/os/leads')
    revalidatePath(`/admin/os/leads/${parsed.leadId}`)
    return ok({ id: lead.id })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Failed to update lead status'
    )
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

    revalidatePath('/admin/os/leads')
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
            activities: true,
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

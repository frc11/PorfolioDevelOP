'use server'

import { LeadStatus, OsServiceType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { calculateNextFollowUp } from '@/lib/follow-up'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const LeadIdSchema = z.string().cuid('Invalid lead id')
const DemoIdSchema = z.string().cuid('Invalid demo id')

const optionalUrlSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional()
)

const optionalStringSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().optional()
)

const optionalServiceTypeSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(OsServiceType).optional()
)

export const CreateDemoSchema = z.object({
  leadId: LeadIdSchema,
  serviceType: optionalServiceTypeSchema,
  demoUrl: z.string().trim().url('A valid demo URL is required'),
  loomUrl: optionalUrlSchema,
  notes: optionalStringSchema,
})

export const MarkDemoViewedSchema = z.object({
  demoId: DemoIdSchema,
})

export async function createDemo(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateDemoSchema.parse(input)

    const demo = await prisma.osDemo.create({
      data: parsed,
      select: {
        id: true,
        leadId: true,
        lead: {
          select: {
            status: true,
          },
        },
      },
    })

    const nextFollowUpAt = calculateNextFollowUp(0) ?? calculateNextFollowUp(1)
    const leadData: {
      status?: LeadStatus
      nextFollowUpAt?: Date
    } = {}

    if (demo.lead.status === LeadStatus.PROSPECTO) {
      leadData.status = LeadStatus.DEMO_ENVIADA
    }

    if (nextFollowUpAt) {
      leadData.nextFollowUpAt = nextFollowUpAt
    }

    if (leadData.status || leadData.nextFollowUpAt) {
      await prisma.osLead.update({
        where: { id: demo.leadId },
        data: leadData,
      })
    }

    revalidatePath('/admin/os/leads')
    revalidatePath(`/admin/os/leads/${parsed.leadId}`)
    return ok({ id: demo.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create demo')
  }
}

export async function markDemoViewed(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = MarkDemoViewedSchema.parse(input)

    const demo = await prisma.osDemo.update({
      where: { id: parsed.demoId },
      data: { viewedAt: new Date() },
      select: {
        id: true,
        leadId: true,
        lead: {
          select: {
            status: true,
          },
        },
      },
    })

    if (demo.lead.status === LeadStatus.DEMO_ENVIADA) {
      await prisma.osLead.update({
        where: { id: demo.leadId },
        data: { status: LeadStatus.VIO_VIDEO },
      })
    }

    revalidatePath('/admin/os/leads')
    revalidatePath(`/admin/os/leads/${demo.leadId}`)
    return ok({ id: demo.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to mark demo as viewed')
  }
}

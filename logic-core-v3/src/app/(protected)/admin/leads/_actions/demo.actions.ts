'use server'

import { LeadStatus } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { crearDemoComercial } from '@/lib/os-commercial'
import { CreateDemoSchema, MarkDemoViewedSchema } from './demo.schemas'

export async function createDemo(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateDemoSchema.parse(input)

    // B6: la lógica de negocio (OsDemo + status + follow-up) vive en
    // lib/os-commercial, compartida con el envío del setter. Mismo cuerpo.
    const demo = await crearDemoComercial(parsed)

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidateTag('admin-leads', {})
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

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${demo.leadId}`)
    revalidateTag('admin-leads', {})
    return ok({ id: demo.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to mark demo as viewed')
  }
}

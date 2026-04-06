'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { ConvertInboundToLeadSchema } from './inbound.schemas'

export async function listInboundLeads(): Promise<
  ActionResult<
    Array<{
      id: string
      name: string
      email: string
      phone: string | null
      company: string | null
      service: string | null
      message: string
      createdAt: string
      convertedToLeadId: string | null
    }>
  >
> {
  try {
    await requireSuperAdmin()

    const submissions = await prisma.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    const inboundEmails = Array.from(
      new Set(
        submissions
          .map((submission) => submission.email.trim().toLowerCase())
          .filter((email) => email.length > 0)
      )
    )

    const existingInboundLeads = inboundEmails.length
      ? await prisma.osLead.findMany({
          where: {
            source: 'Inbound',
            email: {
              not: null,
            },
          },
          select: {
            id: true,
            email: true,
          },
        })
      : []

    const leadIdByEmail = new Map(
      existingInboundLeads
        .filter((lead): lead is { id: string; email: string } => Boolean(lead.email))
        .map((lead) => [lead.email.trim().toLowerCase(), lead.id])
    )

    return ok(
      submissions.map((submission) => ({
        id: submission.id,
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        company: submission.company,
        service: submission.service,
        message: submission.message,
        createdAt: submission.createdAt.toISOString(),
        convertedToLeadId:
          leadIdByEmail.get(submission.email.trim().toLowerCase()) ?? null,
      }))
    )
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list inbound leads')
  }
}

export async function convertInboundToLead(
  contactSubmissionId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = ConvertInboundToLeadSchema.parse({ contactSubmissionId })

    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.contactSubmission.findUnique({
        where: {
          id: parsed.contactSubmissionId,
        },
      })

      if (!submission) {
        throw new Error('Contact submission not found')
      }

      const normalizedEmail = submission.email.trim().toLowerCase()

      const existingLead = normalizedEmail
        ? await tx.osLead.findFirst({
            where: {
              source: 'Inbound',
              email: {
                equals: submission.email.trim(),
                mode: 'insensitive',
              },
            },
            select: {
              id: true,
            },
          })
        : null

      if (existingLead) {
        return existingLead
      }

      return tx.osLead.create({
        data: {
          businessName: submission.company?.trim() || submission.name.trim(),
          contactName: submission.name.trim(),
          email: submission.email.trim(),
          phone: submission.phone?.trim() || null,
          source: 'Inbound',
          notes: submission.message,
        },
        select: {
          id: true,
        },
      })
    })

    revalidatePath('/admin/os/leads')
    return ok({ id: result.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to convert inbound lead')
  }
}

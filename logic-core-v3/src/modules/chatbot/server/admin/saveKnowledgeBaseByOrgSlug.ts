'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SaveKBInputSchema = z.object({
  orgSlug: z.string().min(1),
  businessInfo: z.string().max(50_000),
  servicesOrProducts: z.string().max(50_000),
  faq: z.string().max(50_000),
  policies: z.string().max(20_000),
  salesGuidance: z.string().max(20_000),
  toneExamples: z.string().max(20_000),
  forbiddenStatements: z.string().max(10_000),
})

export async function saveKnowledgeBaseByOrgSlug(
  input: z.infer<typeof SaveKBInputSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = SaveKBInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }

  const { orgSlug, ...data } = parsed.data

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { botConfig: { include: { knowledgeBase: true } } },
  })

  if (!org?.botConfig?.knowledgeBase) {
    return { success: false, error: 'Bot/KB not found for this org' }
  }

  try {
    await prisma.knowledgeBase.update({
      where: { id: org.botConfig.knowledgeBase.id },
      data,
    })

    revalidatePath(`/admin/clients/${orgSlug}/chatbot/knowledge`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: msg }
  }
}

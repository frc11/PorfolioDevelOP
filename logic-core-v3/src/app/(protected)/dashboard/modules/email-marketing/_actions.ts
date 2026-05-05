'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import {
  ensureBrevoList,
  syncContact,
  createCampaign as brevoCreateCampaign,
  sendCampaign as brevoSendCampaign,
} from '@/lib/integrations/brevo'

const MODULE_PATH = '/dashboard/modules/email-marketing'

async function getOrgWithBrevo() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, companyName: true, brevoListId: true },
  })
  if (!org) redirect('/login')

  return org
}

async function resolveListId(org: { id: string; companyName: string; brevoListId: number | null }): Promise<number | null> {
  if (org.brevoListId) return org.brevoListId

  const listId = await ensureBrevoList(org.companyName)
  if (!listId) return null

  await prisma.organization.update({
    where: { id: org.id },
    data: { brevoListId: listId },
  })

  return listId
}

function parseCSV(csv: string): Array<{ email: string; firstName?: string; lastName?: string; phone?: string }> {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const emailIdx = rawHeaders.findIndex((h) => h === 'email')
  if (emailIdx === -1) return []

  const firstNameIdx = rawHeaders.findIndex((h) => h === 'firstname' || h === 'first_name' || h === 'nombre')
  const lastNameIdx = rawHeaders.findIndex((h) => h === 'lastname' || h === 'last_name' || h === 'apellido')
  const phoneIdx = rawHeaders.findIndex((h) => h === 'phone' || h === 'telefono' || h === 'tel')

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''))
    const email = cols[emailIdx]?.toLowerCase()
    if (!email || !email.includes('@')) return []

    return [{
      email,
      firstName: firstNameIdx >= 0 ? cols[firstNameIdx] || undefined : undefined,
      lastName: lastNameIdx >= 0 ? cols[lastNameIdx] || undefined : undefined,
      phone: phoneIdx >= 0 ? cols[phoneIdx] || undefined : undefined,
    }]
  })
}

export async function importContactsAction(formData: FormData) {
  const org = await getOrgWithBrevo()
  const csvText = formData.get('csv') as string | null
  if (!csvText?.trim()) return { error: 'CSV vacío' }

  const rows = parseCSV(csvText)
  if (rows.length === 0) return { error: 'No se encontraron contactos válidos. Asegurate de incluir una columna "email".' }

  const listId = await resolveListId(org)

  let created = 0
  let skipped = 0

  for (const row of rows) {
    try {
      await prisma.emailContact.upsert({
        where: { organizationId_email: { organizationId: org.id, email: row.email } },
        create: {
          organizationId: org.id,
          email: row.email,
          firstName: row.firstName ?? null,
          lastName: row.lastName ?? null,
          phone: row.phone ?? null,
          source: 'csv_import',
        },
        update: {
          firstName: row.firstName ?? undefined,
          lastName: row.lastName ?? undefined,
          phone: row.phone ?? undefined,
        },
      })
      created++

      if (listId) {
        await syncContact({
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          listIds: [listId],
        })
      }
    } catch {
      skipped++
    }
  }

  revalidatePath(`${MODULE_PATH}/contactos`)
  return { ok: true, created, skipped }
}

export async function createCampaignAction(formData: FormData) {
  const org = await getOrgWithBrevo()

  const name = (formData.get('name') as string | null)?.trim()
  const subject = (formData.get('subject') as string | null)?.trim()
  const fromName = (formData.get('fromName') as string | null)?.trim()
  const fromEmail = (formData.get('fromEmail') as string | null)?.trim()
  const htmlContent = (formData.get('htmlContent') as string | null)?.trim()

  if (!name || !subject || !fromName || !fromEmail || !htmlContent) {
    return { error: 'Todos los campos son requeridos.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const activeContacts = await prisma.emailContact.findMany({
    where: { organizationId: org.id, optedOut: false },
    select: { id: true },
  })

  const recipientCount = activeContacts.length

  const htmlWithFooter = htmlContent + `
<br/><br/>
<hr style="border:none;border-top:1px solid #333;margin:24px 0"/>
<p style="font-size:11px;color:#888;text-align:center">
  Para darte de baja de esta lista hacé clic en el siguiente enlace:
  <a href="${appUrl}/api/email/optout/{{contact.id}}" style="color:#06b6d4">Darme de baja</a>
</p>`

  const campaign = await prisma.emailCampaign.create({
    data: {
      organizationId: org.id,
      name,
      subject,
      fromName,
      fromEmail,
      htmlContent: htmlWithFooter,
      recipientCount,
    },
  })

  revalidatePath(`${MODULE_PATH}/campaigns`)
  return { ok: true, campaignId: campaign.id }
}

export async function sendCampaignAction(campaignId: string) {
  const org = await getOrgWithBrevo()

  const campaign = await prisma.emailCampaign.findFirst({
    where: { id: campaignId, organizationId: org.id },
  })
  if (!campaign) return { error: 'Campaña no encontrada.' }
  if (campaign.status !== 'DRAFT') return { error: 'Solo podés enviar campañas en estado DRAFT.' }

  const listId = await resolveListId(org)
  if (!listId) {
    return { error: 'No se pudo conectar con el servicio de email. Intentá de nuevo.' }
  }

  const brevoResult = await brevoCreateCampaign({
    name: campaign.name,
    subject: campaign.subject,
    htmlContent: campaign.htmlContent,
    fromName: campaign.fromName,
    fromEmail: campaign.fromEmail,
    listIds: [listId],
  })

  if (!brevoResult.ok) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'FAILED' },
    })
    return { error: brevoResult.error }
  }

  const sent = await brevoSendCampaign(brevoResult.campaignId)

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: sent ? 'SENT' : 'FAILED',
      brevoCampaignId: brevoResult.campaignId,
      sentAt: sent ? new Date() : null,
    },
  })

  revalidatePath(`${MODULE_PATH}/campaigns`)
  return { ok: true }
}

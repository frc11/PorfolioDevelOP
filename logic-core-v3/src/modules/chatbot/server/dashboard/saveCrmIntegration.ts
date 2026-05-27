'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import {
  validateWebhookUrl,
  encryptSecret,
  isCrmEncryptionConfigured,
} from '@/modules/chatbot/server/crm'

/**
 * B5.8 — Guarda/actualiza la config del CRM (webhook n8n) de la org actual.
 *
 * Seguridad:
 *  - Auth + resolveOrgId → multi-tenant (un dueño no puede tocar la integration
 *    de otra org).
 *  - planAllows('crm') → defensa en profundidad sobre el gate de UI.
 *  - validateWebhookUrl → anti-SSRF (no http/IPs privadas/metadata endpoints).
 *  - Secret cifrado AES-256-GCM si CRM_SECRET_KEY está. Sin clave, el secret
 *    no se acepta — pero la URL/enabled sí se pueden guardar igual.
 *
 * Audit log: CRM_INTEGRATION_UPDATED con diff (webhookUrl old→new, enabled
 * old→new, secretChanged: bool). El valor del secret JAMÁS al audit.
 */

// `secret`: undefined = no tocar; null = limpiar; string = setear (encrypta).
const SaveCrmIntegrationSchema = z
  .object({
    webhookUrl: z.string().trim().min(1).max(2048),
    enabled: z.boolean(),
    secretHeaderName: z.string().trim().max(100).nullable().optional(),
    secret: z.string().min(1).max(500).nullable().optional(),
  })
  .strict()

type SaveCrmIntegrationInput = z.infer<typeof SaveCrmIntegrationSchema>

export async function saveCrmIntegration(input: SaveCrmIntegrationInput) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, error: 'No autenticado' }
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return { ok: false as const, error: 'Sin organización' }
  }

  const parsed = SaveCrmIntegrationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Datos inválidos',
      details: parsed.error.format(),
    }
  }
  const data = parsed.data

  // Plan gate
  const plan = await getPlanForOrg(orgId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'Tu plan actual no incluye integración con CRM',
    }
  }

  // URL validation (anti-SSRF)
  const urlCheck = validateWebhookUrl(data.webhookUrl)
  if (!urlCheck.ok) {
    return { ok: false as const, error: urlCheck.error }
  }

  // Si quiere setear un secret, hace falta CRM_SECRET_KEY.
  if (typeof data.secret === 'string' && !isCrmEncryptionConfigured()) {
    return {
      ok: false as const,
      error:
        'El cifrado de secrets no está configurado. La URL la podés guardar igual, pero el header de auth no se puede cifrar todavía. Pedile a develOP que configure CRM_SECRET_KEY.',
    }
  }

  // Validación: si manda secret necesita header name, y viceversa.
  if (typeof data.secret === 'string' && !data.secretHeaderName) {
    return {
      ok: false as const,
      error: 'Para guardar un secret hace falta el nombre del header',
    }
  }

  // Estado previo para diff (puede no existir todavía → upsert).
  const existing = await prisma.crmIntegration.findUnique({
    where: { organizationId: orgId },
  })

  const before = existing
    ? {
        webhookUrl: existing.webhookUrl,
        enabled: existing.enabled,
        secretHeaderName: existing.secretHeaderName,
        secretConfigured: Boolean(existing.secretEncrypted),
      }
    : {
        webhookUrl: null,
        enabled: false,
        secretHeaderName: null,
        secretConfigured: false,
      }

  // Build secret fields según data.secret:
  //   string → encrypt y setear los 4 campos
  //   null   → clear los 4 campos
  //   undefined → no tocar
  type SecretFields = {
    secretHeaderName?: string | null
    secretEncrypted?: string | null
    secretIv?: string | null
    secretTag?: string | null
  }
  let secretFields: SecretFields = {}

  if (data.secret === null) {
    secretFields = {
      secretHeaderName: null,
      secretEncrypted: null,
      secretIv: null,
      secretTag: null,
    }
  } else if (typeof data.secret === 'string') {
    const enc = encryptSecret(data.secret)
    secretFields = {
      secretHeaderName: data.secretHeaderName as string,
      secretEncrypted: enc.encrypted,
      secretIv: enc.iv,
      secretTag: enc.tag,
    }
  } else if (data.secretHeaderName !== undefined) {
    // El usuario solo quiere cambiar el nombre del header (sin tocar el secret).
    // Solo válido si ya hay un secret guardado.
    if (existing?.secretEncrypted) {
      secretFields = { secretHeaderName: data.secretHeaderName }
    }
  }

  const integration = await prisma.crmIntegration.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      webhookUrl: data.webhookUrl,
      enabled: data.enabled,
      ...secretFields,
    },
    update: {
      webhookUrl: data.webhookUrl,
      enabled: data.enabled,
      ...secretFields,
    },
  })

  // Audit log — diff sin secret en plano. `secretChanged` indica si se tocó.
  const after = {
    webhookUrl: integration.webhookUrl,
    enabled: integration.enabled,
    secretHeaderName: integration.secretHeaderName,
    secretConfigured: Boolean(integration.secretEncrypted),
  }
  const secretChanged =
    before.secretConfigured !== after.secretConfigured ||
    before.secretHeaderName !== after.secretHeaderName

  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'CRM_INTEGRATION_UPDATED',
    action: 'Cliente actualizó integración CRM (n8n)',
    targetType: 'CrmIntegration',
    targetId: integration.id,
    diff: {
      webhookUrl: { before: before.webhookUrl, after: after.webhookUrl },
      enabled: { before: before.enabled, after: after.enabled },
      secretHeaderName: { before: before.secretHeaderName, after: after.secretHeaderName },
      secretChanged,
    },
    metadata: { source: 'dashboard_cliente', organizationId: orgId },
  })

  revalidatePath('/dashboard/chatbot/settings')

  return {
    ok: true as const,
    integration: {
      id: integration.id,
      webhookUrl: integration.webhookUrl,
      enabled: integration.enabled,
      secretHeaderName: integration.secretHeaderName,
      secretConfigured: Boolean(integration.secretEncrypted),
      lastSyncAt: integration.lastSyncAt,
      lastErrorAt: integration.lastErrorAt,
      lastErrorMessage: integration.lastErrorMessage,
    },
  }
}

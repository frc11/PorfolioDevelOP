'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  DEFAULT_AGENCY_SETTINGS,
} from '@/lib/agency-settings'
import {
  PREMIUM_FEATURE_CATALOG,
  PREMIUM_FEATURE_DEFAULTS,
  PREMIUM_FEATURE_KEYS,
  type PremiumFeatureKey,
} from '@/lib/premium-features'
import {
  UpdateModulePricingSchema,
  UpdateSettingsSchema,
} from './settings.schemas'

function maskSecret(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const suffix = value.slice(-4)
  return `••••••••${suffix}`
}

function normalizeNullableString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function coerceWeeklyDemoTarget(value: number | string | null | undefined) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isFinite(parsed)) {
    return DEFAULT_AGENCY_SETTINGS.osWeeklyDemoTarget
  }

  return Math.max(0, Math.round(parsed))
}

async function ensureAgencySettingsRecord() {
  const existing = await prisma.agencySettings.findFirst({
    orderBy: { updatedAt: 'desc' },
  })

  if (existing) {
    return existing
  }

  return prisma.agencySettings.create({
    data: {
      ...DEFAULT_AGENCY_SETTINGS,
    },
  })
}

function revalidateSettingsPaths() {
  revalidatePath('/admin/os/settings')
}

export async function getSettings(): Promise<
  ActionResult<{
    settings: {
      id: string
      agencyName: string
      contactEmail: string
      contactWhatsapp: string
      websiteUrl: string
      alertWebhookUrl: string
      alertOnTickets: boolean
      alertOnLeads: boolean
      alertOnChurn: boolean
      alertOnExpiringSubscriptions: boolean
      alertOnClientMessages: boolean
      osWeeklyDemoTarget: number
      osTelegramBotTokenMasked: string | null
      osTelegramChatId: string
      updatedAt: string
    }
    modulePricing: Array<{
      moduleKey: PremiumFeatureKey
      name: string
      description: string
      price: number
      type: string
      active: boolean
    }>
  }>
> {
  try {
    await requireSuperAdmin()

    const [settings, pricingRows] = await Promise.all([
      ensureAgencySettingsRecord(),
      prisma.modulePricing.findMany(),
    ])

    const pricingMap = new Map(pricingRows.map((item) => [item.featureKey, item]))

    return ok({
      settings: {
        id: settings.id,
        agencyName: settings.agencyName,
        contactEmail: settings.contactEmail ?? '',
        contactWhatsapp: settings.contactWhatsapp ?? '',
        websiteUrl: settings.websiteUrl ?? '',
        alertWebhookUrl: settings.alertWebhookUrl ?? '',
        alertOnTickets: settings.alertOnTickets,
        alertOnLeads: settings.alertOnLeads,
        alertOnChurn: settings.alertOnChurn,
        alertOnExpiringSubscriptions: settings.alertOnExpiringSubscriptions,
        alertOnClientMessages: settings.alertOnClientMessages,
        osWeeklyDemoTarget: settings.osWeeklyDemoTarget,
        osTelegramBotTokenMasked: maskSecret(settings.osTelegramBotToken),
        osTelegramChatId: settings.osTelegramChatId ?? '',
        updatedAt: settings.updatedAt.toISOString(),
      },
      modulePricing: PREMIUM_FEATURE_CATALOG.map((feature) => {
        const pricing = pricingMap.get(feature.key)
        const fallback = PREMIUM_FEATURE_DEFAULTS[feature.key]

        return {
          moduleKey: feature.key,
          name: pricing?.name ?? feature.label,
          description: feature.shortDescription,
          price: pricing?.price ?? fallback.price,
          type: pricing?.type ?? fallback.type,
          active: pricing?.active ?? true,
        }
      }),
    })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo cargar la configuracion.'
    )
  }
}

export async function updateSettings(data: {
  contactEmail: string
  contactWhatsapp: string
  websiteUrl: string
  alertWebhookUrl: string
  alertOnTickets: boolean
  alertOnLeads: boolean
  alertOnChurn: boolean
  alertOnExpiringSubscriptions: boolean
  alertOnClientMessages: boolean
  osWeeklyDemoTarget: number
  osTelegramBotToken?: string
  osTelegramChatId: string
}): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateSettingsSchema.parse(data)

    const current = await ensureAgencySettingsRecord()
    const nextTelegramToken = parsed.osTelegramBotToken?.trim()

    await prisma.agencySettings.update({
      where: { id: current.id },
      data: {
        contactEmail: normalizeNullableString(parsed.contactEmail),
        contactWhatsapp: normalizeNullableString(parsed.contactWhatsapp),
        websiteUrl: normalizeNullableString(parsed.websiteUrl),
        alertWebhookUrl: normalizeNullableString(parsed.alertWebhookUrl),
        alertOnTickets: parsed.alertOnTickets,
        alertOnLeads: parsed.alertOnLeads,
        alertOnChurn: parsed.alertOnChurn,
        alertOnExpiringSubscriptions: parsed.alertOnExpiringSubscriptions,
        alertOnClientMessages: parsed.alertOnClientMessages,
        osWeeklyDemoTarget: coerceWeeklyDemoTarget(parsed.osWeeklyDemoTarget),
        osTelegramBotToken: nextTelegramToken
          ? nextTelegramToken
          : current.osTelegramBotToken,
        osTelegramChatId: normalizeNullableString(parsed.osTelegramChatId),
      },
    })

    revalidateSettingsPaths()
    return ok({ message: 'Configuracion actualizada.' })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo actualizar la configuracion.'
    )
  }
}

export async function updateModulePricing(
  moduleKey: string,
  price: number
): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateModulePricingSchema.parse({ moduleKey, price })
    const featureKey = parsed.moduleKey as PremiumFeatureKey
    const defaults = PREMIUM_FEATURE_DEFAULTS[featureKey]

    await prisma.modulePricing.upsert({
      where: { featureKey },
      update: {
        name: defaults.name,
        price: parsed.price,
      },
      create: {
        featureKey,
        name: defaults.name,
        price: parsed.price,
        type: defaults.type,
        active: true,
      },
    })

    revalidateSettingsPaths()
    revalidatePath('/dashboard/services')

    return ok({ message: `Precio actualizado para ${defaults.name}.` })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo actualizar el precio.'
    )
  }
}

export async function listTeamMembers(): Promise<
  ActionResult<
    Array<{
      id: string
      name: string
      email: string
    }>
  >
> {
  try {
    await requireSuperAdmin()

    const members = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return ok(
      members.map((member) => ({
        id: member.id,
        name: member.name?.trim() || 'Sin nombre',
        email: member.email,
      }))
    )
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo listar el equipo.'
    )
  }
}

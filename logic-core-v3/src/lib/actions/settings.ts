'use server'

import crypto from 'crypto'
import * as React from 'react'
import { revalidatePath } from 'next/cache'
import { google } from 'googleapis'
import { auth } from '@/auth'
import { sendTestAgencyAlert } from '@/lib/alerts'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { DEFAULT_AGENCY_SETTINGS, DEFAULT_AGENCY_SETTINGS_ID } from '@/lib/agency-settings'
import {
  PREMIUM_FEATURE_DEFAULTS,
  PREMIUM_FEATURE_KEYS,
  PREMIUM_FEATURE_LABELS,
  type PremiumFeatureKey,
} from '@/lib/premium-features'
import type { ActionResult } from '@/lib/actions/schemas'

async function requireSuperAdmin() {
  const session = await auth()

  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado.')
  }

  return session
}

async function getSettingsRecordId() {
  const existing = await prisma.agencySettings.findFirst({
    select: { id: true },
    orderBy: { updatedAt: 'desc' },
  })

  return existing?.id ?? DEFAULT_AGENCY_SETTINGS_ID
}

export async function saveAgencySettingsAction(input: {
  contactEmail: string
  contactWhatsapp: string
  websiteUrl: string
  alertWebhookUrl: string
  alertOnTickets: boolean
  alertOnLeads: boolean
  alertOnChurn: boolean
  alertOnExpiringSubscriptions: boolean
  alertOnClientMessages: boolean
}): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    const id = await getSettingsRecordId()

    await prisma.agencySettings.upsert({
      where: { id },
      update: {
        contactEmail: input.contactEmail.trim() || null,
        contactWhatsapp: input.contactWhatsapp.trim() || null,
        websiteUrl: input.websiteUrl.trim() || null,
        alertWebhookUrl: input.alertWebhookUrl.trim() || null,
        alertOnTickets: input.alertOnTickets,
        alertOnLeads: input.alertOnLeads,
        alertOnChurn: input.alertOnChurn,
        alertOnExpiringSubscriptions: input.alertOnExpiringSubscriptions,
        alertOnClientMessages: input.alertOnClientMessages,
      },
      create: {
        ...DEFAULT_AGENCY_SETTINGS,
        id,
        contactEmail: input.contactEmail.trim() || null,
        contactWhatsapp: input.contactWhatsapp.trim() || null,
        websiteUrl: input.websiteUrl.trim() || null,
        alertWebhookUrl: input.alertWebhookUrl.trim() || null,
        alertOnTickets: input.alertOnTickets,
        alertOnLeads: input.alertOnLeads,
        alertOnChurn: input.alertOnChurn,
        alertOnExpiringSubscriptions: input.alertOnExpiringSubscriptions,
        alertOnClientMessages: input.alertOnClientMessages,
      },
    })

    revalidatePath('/admin/settings')

    return {
      success: true,
      data: { message: 'Configuración de la agencia actualizada.' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo guardar la configuración.',
    }
  }
}

export async function updateModulePricingAction(input: {
  featureKey: PremiumFeatureKey
  price: number
  type: string
  active: boolean
}): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    if (!PREMIUM_FEATURE_KEYS.includes(input.featureKey)) {
      return { success: false, error: 'Módulo inválido.' }
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      return { success: false, error: 'El precio debe ser un número válido.' }
    }

    const fallback = PREMIUM_FEATURE_DEFAULTS[input.featureKey]

    await prisma.modulePricing.upsert({
      where: { featureKey: input.featureKey },
      update: {
        name: fallback.name,
        price: input.price,
        type: input.type,
        active: input.active,
      },
      create: {
        featureKey: input.featureKey,
        name: fallback.name,
        price: input.price,
        type: input.type,
        active: input.active,
      },
    })

    revalidatePath('/admin/settings')
    revalidatePath('/dashboard/services')

    return {
      success: true,
      data: { message: `Precio actualizado para ${PREMIUM_FEATURE_LABELS[input.featureKey]}.` },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo actualizar el precio.',
    }
  }
}

export async function inviteTeamMemberAction(input: {
  email: string
  name?: string
}): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    const email = input.email.trim().toLowerCase()
    const name = input.name?.trim() || 'Nuevo miembro de develOP'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return { success: false, error: 'Ingresá un email válido.' }
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing) {
      return { success: false, error: 'Ya existe un usuario con ese email.' }
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'SUPER_ADMIN',
      },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/accept-invite?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Tu invitación al panel de develOP',
      react: React.createElement(
        'div',
        { style: { fontFamily: 'Arial, sans-serif', color: '#111827', lineHeight: 1.6 } },
        React.createElement('h1', { style: { fontSize: '20px' } }, 'Te invitaron al panel admin'),
        React.createElement(
          'p',
          null,
          'Aceptá la invitación para crear tu contraseña y acceder como SUPER_ADMIN a develOP.'
        ),
        React.createElement(
          'a',
          {
            href: inviteUrl,
            style: {
              display: 'inline-block',
              padding: '12px 18px',
              background: '#06b6d4',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
            },
          },
          'Aceptar invitación'
        ),
      ),
    })

    revalidatePath('/admin/settings')

    return {
      success: true,
      data: { message: `Invitación enviada a ${email}.` },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo invitar al miembro.',
    }
  }
}

export async function testN8nConnectionAction(): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    const baseUrl = (process.env.N8N_API_URL ?? '').replace(/\/$/, '')
    const apiKey = process.env.N8N_API_KEY ?? ''

    if (!baseUrl || !apiKey) {
      return { success: false, error: 'N8N_API_URL o N8N_API_KEY no están configuradas.' }
    }

    const response = await fetch(`${baseUrl}/api/v1/workflows?limit=1`, {
      headers: { 'X-N8N-API-KEY': apiKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `n8n respondió ${response.status} ${response.statusText}.`,
      }
    }

    return {
      success: true,
      data: { message: 'Conexión con n8n verificada correctamente.' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo conectar con n8n.',
    }
  }
}

export async function verifyGooglePermissionsAction(): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!keyJson) {
      return { success: false, error: 'GOOGLE_SERVICE_ACCOUNT_KEY no está configurada.' }
    }

    const credentials = JSON.parse(keyJson) as Record<string, unknown>
    const authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
      ],
    })

    const client = await authClient.getClient()
    await client.getAccessToken()

    return {
      success: true,
      data: { message: 'Permisos de Google verificados correctamente.' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo verificar Google.',
    }
  }
}

export async function testWebhookAction(input?: {
  url?: string
}): Promise<ActionResult<{ message: string }>> {
  try {
    await requireSuperAdmin()

    if (!input?.url?.trim()) {
      const result = await sendTestAgencyAlert()
      if (!result.success) {
        return { success: false, error: result.error ?? 'No se pudo enviar la alerta de prueba.' }
      }

      return {
        success: true,
        data: { message: 'Mensaje de prueba enviado al webhook.' },
      }
    }

    const savedSettings = await prisma.agencySettings.findFirst({
      select: { alertWebhookUrl: true },
      orderBy: { updatedAt: 'desc' },
    })

    const url = input?.url?.trim() || savedSettings?.alertWebhookUrl || ''

    if (!url) {
      return { success: false, error: 'Configurá una URL de webhook primero.' }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "🚨 [develOP Alert]\nTipo: Ticket Urgente\nCliente: Concesionaria San Miguel\nDetalle: 'El formulario no envía'\nPrioridad: ALTA\nVer en admin: /admin/tickets",
      }),
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `El webhook respondió ${response.status} ${response.statusText}.`,
      }
    }

    return {
      success: true,
      data: { message: 'Mensaje de prueba enviado al webhook.' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo enviar la alerta de prueba.',
    }
  }
}

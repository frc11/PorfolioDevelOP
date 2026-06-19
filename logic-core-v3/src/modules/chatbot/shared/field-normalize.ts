import { z } from 'zod'

// Normalización + validación de campos del alta de cliente. Plano (sin 'use
// client'/'use server') → lo consumen tanto los steps del wizard (cliente) como
// las server actions, para que client y server validen igual.

/** Prepend `https://` si falta protocolo (acepta el dominio pelado). Vacío → null. */
export function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

/** Deja solo dígitos (saca `+`, espacios, guiones, paréntesis). Vacío → null. */
export function normalizeWhatsapp(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  return digits === '' ? null : digits
}

/** Válida si, ya normalizada, parsea como URL absoluta. */
export function isValidWebsiteUrl(normalized: string): boolean {
  try {
    new URL(normalized)
    return true
  } catch {
    return false
  }
}

/** Válida si son 10–15 dígitos — mismo contrato que el regex del server. */
export function isValidWhatsapp(digits: string): boolean {
  return /^\d{10,15}$/.test(digits)
}

const FIELD_LABELS: Record<string, string> = {
  orgName: 'el nombre de la empresa',
  city: 'la ciudad',
  websiteUrl: 'la URL del sitio web',
  userEmail: 'el email del cliente',
  userName: 'el nombre del cliente',
  userPhone: 'el teléfono',
  botName: 'el nombre del bot',
  welcomeMessage: 'el mensaje de bienvenida',
  whatsappNumber: 'el número de WhatsApp',
  accentColor: 'el color de acento',
  accentSecondary: 'el color secundario',
  chatSurfaceTint: 'el tinte del chat',
}

/**
 * Convierte un ZodError en UN mensaje legible por campo. Nunca exponer el array
 * crudo de issues al usuario.
 */
export function zodErrorToMessage(error: z.ZodError): string {
  const issue = error.issues[0]
  const key = typeof issue?.path[0] === 'string' ? issue.path[0] : ''
  const label = FIELD_LABELS[key] ?? 'los datos ingresados'
  return `Revisá ${label}: el formato no es válido.`
}

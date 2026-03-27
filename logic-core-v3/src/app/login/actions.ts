'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Protección básica para un único proceso (Netlify Functions / Node.js).
// En producción multi-instancia reemplazar por Redis.

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 5 * 60 * 1000 // 5 minutos

interface RateEntry {
  count: number
  blockedUntil: number | null
}

const rateLimitMap = new Map<string, RateEntry>()

function getRateEntry(ip: string): RateEntry {
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, blockedUntil: null })
  }
  return rateLimitMap.get(ip)!
}

function checkBlocked(ip: string): boolean {
  const entry = getRateEntry(ip)
  if (!entry.blockedUntil) return false
  if (Date.now() < entry.blockedUntil) return true
  // Bloqueo expirado → limpiar
  rateLimitMap.delete(ip)
  return false
}

function recordFailedAttempt(ip: string): void {
  const entry = getRateEntry(ip)
  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + BLOCK_DURATION_MS
  }
}

function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip)
}

async function getClientIP(): Promise<string> {
  const hdrs = await headers()
  return (
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'
  )
}

// ─── Login con contraseña ─────────────────────────────────────────────────────

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  // Validación explícita (también corre en el servidor en caso de JS deshabilitado)
  if (!email) return 'El email es requerido.'
  if (!email.includes('@') || email.length > 254) return 'Email inválido.'
  if (!password) return 'La contraseña es requerida.'
  if (password.length < 8 || password.length > 128) {
    return 'La contraseña debe tener entre 8 y 128 caracteres.'
  }

  // Rate limiting
  const ip = await getClientIP()
  if (checkBlocked(ip)) {
    return 'Demasiados intentos fallidos. Esperá 5 minutos antes de volver a intentarlo.'
  }

  // Pre-fetch del role + estado de onboarding para determinar el destino de redirect.
  // No revela existencia del email: si no existe, signIn falla con CredentialsSignin igual.
  const userRecord = await prisma.user.findUnique({
    where: { email },
    select: {
      role: true,
      orgMemberships: {
        select: {
          organization: {
            select: { onboardingCompleted: true, companyName: true },
          },
        },
        take: 1,
      },
    },
  })
  const isSuperAdmin = userRecord?.role === 'SUPER_ADMIN'
  const org = userRecord?.orgMemberships?.[0]?.organization
  const needsOnboarding = !isSuperAdmin && (!org?.onboardingCompleted || !org?.companyName)
  const redirectTo = isSuperAdmin ? '/admin' : (needsOnboarding ? '/bienvenida' : '/dashboard')

  try {
    await signIn('credentials', { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailedAttempt(ip)
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email o contraseña incorrectos.'
        default:
          if ((error.cause as { message?: string })?.message === 'EMAIL_NOT_VERIFIED') {
            return 'Por favor verificá tu email antes de ingresar.'
          }
          return 'Ocurrió un error inesperado. Intentá de nuevo.'
      }
    }
    // Éxito: Next.js lanza NEXT_REDIRECT — limpiar rate limit y re-lanzar
    clearRateLimit(ip)
    throw error
  }

  return null
}

// ─── Magic Link (Resend) ──────────────────────────────────────────────────────

export async function magicLinkAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  // El field se llama 'magic-email' para evitar colisión de id en el DOM
  const email = (formData.get('magic-email') as string | null)?.trim() ?? ''

  if (!email) return 'El email es requerido.'
  if (!email.includes('@') || email.length > 254) return 'Email inválido.'

  try {
    await signIn('resend', {
      email,
      redirectTo: '/dashboard',
      redirect: false,
    })
    return 'SUCCESS'
  } catch (error) {
    if (error instanceof AuthError) {
      return 'No se pudo generar el Magic Link. Intentá de nuevo.'
    }
    throw error
  }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function googleSignInAction() {
  await signIn('google', { redirectTo: '/dashboard' })
}

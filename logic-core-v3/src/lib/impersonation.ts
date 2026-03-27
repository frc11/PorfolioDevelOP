import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { auth } from '@/auth'
import { IMPERSONATION_COOKIE, IMPERSONATION_DURATION_SECONDS } from '@/lib/impersonation-constants'

export interface ImpersonationPayload {
  adminId: string
  orgId: string
  expiresAt: number
  [key: string]: string | number
}

function getSecret() {
  const secret =
    process.env.IMPERSONATION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'develOP-dev-impersonation-secret'

  return new TextEncoder().encode(secret)
}

export async function signImpersonationToken(payload: ImpersonationPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt / 1000))
    .sign(getSecret())
}

export async function verifyImpersonationToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())

  const adminId = payload.adminId
  const orgId = payload.orgId
  const expiresAt = payload.expiresAt

  if (
    typeof adminId !== 'string' ||
    typeof orgId !== 'string' ||
    typeof expiresAt !== 'number'
  ) {
    throw new Error('Invalid impersonation payload')
  }

  return {
    adminId,
    orgId,
    expiresAt,
  } satisfies ImpersonationPayload
}

export async function getImpersonationSession() {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) {
    return null
  }

  const jar = await cookies()
  const token = jar.get(IMPERSONATION_COOKIE)?.value
  if (!token) {
    return null
  }

  try {
    const payload = await verifyImpersonationToken(token)
    if (payload.adminId !== session.user.id) {
      return null
    }

    if (payload.expiresAt <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getImpersonationCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: IMPERSONATION_DURATION_SECONDS,
  }
}

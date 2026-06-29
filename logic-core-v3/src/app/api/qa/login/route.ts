/**
 * MS-8 — QA-only session bypass for the visual-qa subagent.
 *
 * Mints a NextAuth-compatible JWT cookie for one of three seeded personas
 * (super-admin, client-a, client-b) so headless verification of `/admin/*`
 * and `/dashboard/*` doesn't require driving the real login UI.
 *
 * This endpoint is a parallel path: the real NextAuth credentials/Resend/Google
 * flows in `src/auth.ts` are NOT modified. The injected JWT uses the same
 * `AUTH_SECRET` and cookie name as a real session, so `auth()` on protected
 * routes decodes it transparently and the JWT callback (which re-derives
 * role/org from the DB on every request) keeps the session consistent.
 *
 * TRIPLE GUARD — all three must pass; any single failure returns 403.
 *   1. `QA_ALLOW_LOCALHOST=1` opt-in env var (same gate as MS-7.1).
 *   2. Request `Host` header is localhost / 127.0.0.1 / [::1].
 *   3. Not a known hosted deploy (`NETLIFY` unset and `VERCEL_ENV !==
 *      'production'`).
 *
 * If any one of these leaks to production by accident, the other two still
 * refuse the request. The route code remains in the prod bundle (same build
 * serves `npm start` and `npm run start:qa`), so the guards are the only
 * thing standing between this endpoint and a full auth bypass — keep them.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/auth-cookies'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type QaPersona = 'super-admin' | 'client-a' | 'client-b' | 'setter'

const PERSONA_EMAIL: Record<QaPersona, string> = {
  'super-admin': 'admin@develop.com',
  'client-a': 'cliente@sanmiguel.com',
  'client-b': 'qa-cliente-b@develop.test',
  // LeadOS B3: persona para verificar /setter/* sin pisar la password seedeada
  // (el setter real tiene passwordResetRequired: true; el token QA lo saltea).
  setter: 'setter-qa@develop.test',
}

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

type GuardResult = { allowed: true } | { allowed: false; reason: string }

function tripleGuardCheck(request: NextRequest): GuardResult {
  if (process.env.QA_ALLOW_LOCALHOST !== '1') {
    return { allowed: false, reason: 'qa_flag_off' }
  }

  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  if (!isLocalhost) {
    return { allowed: false, reason: 'host_not_localhost' }
  }

  if (process.env.NETLIFY === 'true') {
    return { allowed: false, reason: 'hosted_netlify' }
  }
  if (process.env.VERCEL_ENV === 'production') {
    return { allowed: false, reason: 'hosted_vercel_prod' }
  }

  return { allowed: true }
}

function isQaPersona(value: unknown): value is QaPersona {
  return (
    value === 'super-admin' ||
    value === 'client-a' ||
    value === 'client-b' ||
    value === 'setter'
  )
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const guard = tripleGuardCheck(request)
  if (!guard.allowed) {
    return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })
  }

  const rawBody: unknown = await request.json().catch(() => null)
  const persona = (rawBody as { persona?: unknown } | null)?.persona
  if (!isQaPersona(persona)) {
    return NextResponse.json(
      {
        error: 'bad_request',
        reason: 'persona requerida; valores: super-admin | client-a | client-b',
      },
      { status: 400 },
    )
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'misconfigured', reason: 'AUTH_SECRET no seteado en el entorno' },
      { status: 500 },
    )
  }

  const email = PERSONA_EMAIL[persona]
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      orgMemberships: {
        select: {
          organizationId: true,
          role: true,
          organization: {
            select: { companyName: true, onboardingCompleted: true },
          },
        },
        take: 1,
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        error: 'persona_not_seeded',
        reason: `Usuario ${email} no existe en la DB. Corré 'npx tsx prisma/seed.ts' antes.`,
      },
      { status: 404 },
    )
  }

  const membership = user.orgMemberships[0]
  const organizationId = membership?.organizationId
  const orgRole = membership?.role
  const onboardingCompleted =
    user.role === 'SUPER_ADMIN' ||
    Boolean(membership?.organization?.onboardingCompleted && membership.organization.companyName?.trim())

  const cookieName = SESSION_COOKIE_NAME
  const isSecure = cookieName.startsWith('__Secure-')

  const sessionToken = await encode({
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE_SECONDS,
    token: {
      sub: user.id,
      email: user.email,
      name: user.name ?? null,
      picture: null,
      role: user.role,
      organizationId,
      orgRole,
      provider: 'qa-bypass',
      onboardingCompleted,
      passwordResetRequired: false,
    },
  })

  const response = NextResponse.json({
    ok: true,
    persona,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: organizationId ?? null,
      orgRole: orgRole ?? null,
    },
    cookie: { name: cookieName, secure: isSecure, maxAgeSeconds: SESSION_MAX_AGE_SECONDS },
  })

  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isSecure,
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  // Avoid carrying a stale post-login redirect from a previous real session.
  response.cookies.delete('authjs.callback-url')
  response.cookies.delete('__Secure-authjs.callback-url')

  return response
}

export function GET(request: NextRequest): NextResponse {
  const guard = tripleGuardCheck(request)
  if (!guard.allowed) {
    return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })
  }

  return NextResponse.json({
    ok: true,
    personas: (Object.keys(PERSONA_EMAIL) as QaPersona[]).map((persona) => ({
      persona,
      email: PERSONA_EMAIL[persona],
    })),
    usage:
      "POST /api/qa/login con { persona: 'super-admin' | 'client-a' | 'client-b' | 'setter' }",
  })
}

export function DELETE(request: NextRequest): NextResponse {
  const guard = tripleGuardCheck(request)
  if (!guard.allowed) {
    return NextResponse.json({ error: 'forbidden', reason: guard.reason }, { status: 403 })
  }

  const cookieName = SESSION_COOKIE_NAME
  const response = NextResponse.json({ ok: true, cleared: cookieName })
  response.cookies.delete(cookieName)
  response.cookies.delete('authjs.callback-url')
  response.cookies.delete('__Secure-authjs.callback-url')
  return response
}

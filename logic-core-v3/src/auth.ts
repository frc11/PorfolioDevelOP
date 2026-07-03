import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import bcrypt from 'bcryptjs'
import * as React from 'react'
import type { OrgRole, Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth-cookies'

const LOGIN_PATH = '/login'
const ADMIN_PATH = '/admin'
const DASHBOARD_PATH = '/dashboard'
const ONBOARDING_PATH = '/bienvenida'

async function getUserAccessState(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      passwordResetRequired: true,
      sessionVersion: true,
      orgMemberships: {
        select: {
          organizationId: true,
          role: true,
          organization: {
            select: {
              companyName: true,
              onboardingCompleted: true,
            },
          },
        },
        take: 1,
      },
    },
  })

  const membership = dbUser?.orgMemberships[0]
  const organization = membership?.organization
  const role = dbUser?.role ?? ('ORG_MEMBER' as Role)
  const organizationId = membership?.organizationId
  const orgRole = membership?.role
  const onboardingCompleted = Boolean(
    role === 'SUPER_ADMIN' ||
      (organizationId && organization?.companyName?.trim() && organization.onboardingCompleted)
  )
  const passwordResetRequired = dbUser?.passwordResetRequired ?? false
  const sessionVersion = dbUser?.sessionVersion

  return {
    role,
    organizationId,
    orgRole,
    onboardingCompleted,
    passwordResetRequired,
    sessionVersion,
    userExists: Boolean(dbUser),
  }
}

function getPostLoginPath(state: {
  role: Role
  onboardingCompleted: boolean
}) {
  if (state.role === 'SUPER_ADMIN') {
    return ADMIN_PATH
  }

  return state.onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH
}

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  // SEC-MISC-02: explicit cookie config so a future Auth.js upgrade cannot
  // silently change defaults. Name/atributos vienen de `@/lib/auth-cookies`
  // (fuente única por `NODE_ENV`) para que el middleware edge y el QA-login
  // resuelvan exactamente el mismo nombre, incluso en un build de prod sobre
  // http local (donde el default de Auth.js, por protocolo, divergía).
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: SESSION_COOKIE_OPTIONS,
    },
  },
  pages: { signIn: LOGIN_PATH },
  providers: [
    Resend({
      // El magic link ahora se manda por Brevo (sendVerificationRequest, abajo); el
      // remitente lo resuelve brevo-service desde BREVO_FROM_EMAIL (verificado). El
      // provider Resend se conserva por su id 'resend' — lo usa signIn('resend').
      async sendVerificationRequest({ identifier: email, url }) {
        // `url` es el token de acceso generado por NextAuth (URL-encodeado, confiable):
        // se inserta EXACTO en el href, sin escapar ni reconstruir.
        await sendTransactionalEmail({
          to: { email },
          subject: 'Tu acceso a develOP',
          htmlContent: `<!DOCTYPE html>
<html lang="es"><body style="margin:0;padding:0;background:#f4f4f5;">
  <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:480px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:20px;margin:0 0 16px;">Ingresá a develOP</h1>
    <p style="margin:0 0 16px;">Usá este enlace seguro para acceder al portal de clientes:</p>
    <p style="margin:0 0 24px;">
      <a href="${url}" style="display:inline-block;padding:12px 18px;background:#06b6d4;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">Ingresar ahora</a>
    </p>
    <p style="font-size:12px;color:#6b7280;margin:0;">Si no solicitaste este acceso, podés ignorar este email.</p>
  </div>
</body></html>`,
          textContent: `Ingresá a develOP\n\nUsá este enlace seguro para acceder al portal de clientes:\n${url}\n\nSi no solicitaste este acceso, podés ignorar este email.`,
        })
      },
    }),
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'ORG_MEMBER' as const,
          emailVerified: new Date(),
        }
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).trim().toLowerCase() },
          include: {
            orgMemberships: {
              select: { organizationId: true, role: true },
              take: 1,
            },
          },
        })

        if (!user?.password) return null
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        const isValid = await bcrypt.compare(String(credentials.password), user.password)
        if (!isValid) return null

        const primaryMembership = user.orgMemberships[0]
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          organizationId: primaryMembership?.organizationId ?? undefined,
          orgRole: primaryMembership?.role ?? undefined,
          passwordResetRequired: user.passwordResetRequired,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, email }) {
      if (email?.verificationRequest) {
        const requestedEmail = user?.email?.trim().toLowerCase()
        if (!requestedEmail) {
          return false
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: requestedEmail },
          select: { id: true },
        })
        return Boolean(existingUser)
      }

      if (!user?.id) {
        return true
      }

      const accessState = await getUserAccessState(user.id)
      // LeadOS B1: el SETTER opera sin org membership a propósito — su
      // aislamiento es por OsLead.assignedToId, no por organizationId.
      if (
        accessState.role !== 'SUPER_ADMIN' &&
        accessState.role !== 'SETTER' &&
        !accessState.organizationId
      ) {
        return `${LOGIN_PATH}?error=unauthorized`
      }

      return true
    },
    async jwt({ token, user, account, trigger }) {
      const userId = (user?.id ?? token.sub) as string | undefined
      const shouldRefreshFromDb = Boolean(userId) && (trigger === 'update' || trigger === 'signIn' || !user)

      if (userId && shouldRefreshFromDb) {
        const accessState = await getUserAccessState(userId)

        // SEC-AUTH-03: sessionVersion check. Si el token ya traía una versión y no matchea
        // la de DB (porque hubo reset/cambio de password), la sesión se invalida — retornar
        // null fuerza re-login. Skipear en signIn/update (eventos legítimos que refrescan).
        if (
          trigger !== 'signIn' &&
          trigger !== 'update' &&
          typeof token.sessionVersion === 'number' &&
          accessState.sessionVersion !== undefined &&
          token.sessionVersion !== accessState.sessionVersion
        ) {
          return null
        }

        token.role = accessState.role
        token.organizationId = accessState.organizationId
        token.orgRole = accessState.orgRole
        token.onboardingCompleted = accessState.onboardingCompleted
        token.passwordResetRequired = accessState.passwordResetRequired
        token.sessionVersion = accessState.sessionVersion
      }

      if (user?.role) {
        token.role = user.role
      }

      // Propagate passwordResetRequired from credentials authorize on first login
      if (user?.passwordResetRequired !== undefined) {
        token.passwordResetRequired = Boolean(user.passwordResetRequired)
      }

      token.provider = account?.provider ?? token.provider ?? 'credentials'
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      session.user.role = token.role as Role
      session.user.organizationId = token.organizationId as string | undefined
      session.user.orgRole = token.orgRole as OrgRole | undefined
      session.user.provider = token.provider as string | undefined
      session.user.onboardingCompleted = Boolean(token.onboardingCompleted)
      session.user.passwordResetRequired = Boolean(token.passwordResetRequired)
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      try {
        const target = new URL(url)
        if (target.origin === baseUrl && target.pathname !== LOGIN_PATH) {
          return url
        }
      } catch {}

      return baseUrl
    },
  },
})

export const { handlers, signIn, signOut, unstable_update } = nextAuthResult
export const auth = React.cache(nextAuthResult.auth)

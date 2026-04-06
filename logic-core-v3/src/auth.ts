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
import { sendEmail } from '@/lib/email'

const LOGIN_PATH = '/login'
const ADMIN_PATH = '/admin'
const DASHBOARD_PATH = '/dashboard'
const ONBOARDING_PATH = '/bienvenida'

async function getUserAccessState(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
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

  return {
    role,
    organizationId,
    orgRole,
    onboardingCompleted,
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: { signIn: LOGIN_PATH },
  providers: [
    Resend({
      from: 'develOP <noreply@develop.com.ar>',
      async sendVerificationRequest({ identifier: email, url }) {
        await sendEmail({
          to: email,
          subject: 'Tu acceso a develOP',
          react: React.createElement(
            'div',
            {
              style: {
                fontFamily: 'Arial, sans-serif',
                color: '#111827',
                lineHeight: 1.6,
              },
            },
            React.createElement('h1', { style: { fontSize: '20px' } }, 'Ingresá a develOP'),
            React.createElement(
              'p',
              null,
              'Usá este enlace seguro para acceder al portal de clientes:'
            ),
            React.createElement(
              'p',
              null,
              React.createElement(
                'a',
                {
                  href: url,
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
                'Ingresar ahora'
              )
            ),
            React.createElement(
              'p',
              { style: { fontSize: '12px', color: '#6b7280' } },
              'Si no solicitaste este acceso, podés ignorar este email.'
            )
          ),
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
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, email }) {
      if (email?.verificationRequest) {
        const requestedEmail = (email as { email?: string } | undefined)?.email?.trim().toLowerCase()
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
      if (accessState.role !== 'SUPER_ADMIN' && !accessState.organizationId) {
        return `${LOGIN_PATH}?error=unauthorized`
      }

      return true
    },
    async jwt({ token, user, account, trigger }) {
      const shouldRefreshFromDb = Boolean(user?.id || token.sub) && (trigger === 'update' || !user)

      if (shouldRefreshFromDb) {
        const accessState = await getUserAccessState((user?.id ?? token.sub) as string)
        token.role = accessState.role
        token.organizationId = accessState.organizationId
        token.orgRole = accessState.orgRole
        token.onboardingCompleted = accessState.onboardingCompleted
      }

      if (user?.role) {
        token.role = user.role
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

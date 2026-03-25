import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role, OrgRole } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Fase 2: Adapter reintroducido para que Google OAuth escriba en la tabla Account.
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,    // 8 horas
    updateAge: 60 * 60,     // Refrescar si hay actividad cada 1h
  },
  pages: { signIn: '/login' },
  providers: [
    Resend({
      from: 'develOP <noreply@develop.com.ar>',
      sendVerificationRequest({ identifier: email, url }) {
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
          where: { email: credentials.email as string },
          include: {
            orgMemberships: {
              select: { organizationId: true, role: true },
              take: 1,
            },
          },
        })

        if (!user?.password) return null

        // V-02: Verificar email antes de comparar contraseña
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
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
    async jwt({ token, user, account }) {
      if (user) {
        // Resend / OAuth providers may not propagate role/organizationId from the
        // User object returned by the adapter — fall back to a DB lookup.
        if (user.role) {
          token.role = user.role
          token.organizationId = user.organizationId
          token.orgRole = user.orgRole as string | undefined
        } else if (user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              orgMemberships: {
                select: { organizationId: true, role: true },
                take: 1,
              },
            },
          })
          const membership = dbUser?.orgMemberships[0]
          token.role = dbUser?.role ?? ('ORG_MEMBER' as Role)
          token.organizationId = membership?.organizationId ?? undefined
          token.orgRole = membership?.role ?? undefined
        }
        token.provider = account?.provider ?? 'credentials'
      }
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
      return session
    },
  },
})

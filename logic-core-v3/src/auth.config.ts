import type { NextAuthConfig } from 'next-auth'

type Role = 'SUPER_ADMIN' | 'ORG_MEMBER'
type OrgRole = 'ADMIN' | 'MEMBER' | 'VIEWER'

// Edge-compatible auth config — no Prisma or Node.js-only imports here.
// Used by middleware to validate JWT sessions without touching the database.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return true // Route protection is handled in middleware logic
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
  },
}

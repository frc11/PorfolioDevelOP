import type { NextAuthConfig } from 'next-auth'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth-cookies'

type Role = 'SUPER_ADMIN' | 'ORG_MEMBER' | 'CLIENT' | 'SETTER'
type OrgRole = 'ADMIN' | 'MEMBER' | 'VIEWER'

// Edge-compatible auth config — no Prisma or Node.js-only imports here.
// Used by middleware to validate JWT sessions without touching the database.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  // Mismo nombre/atributos de cookie que `src/auth.ts` (fuente única por
  // NODE_ENV). Sin esto, el middleware caía al default de Auth.js que decide
  // por protocolo de AUTH_URL: en prod-sobre-http leía `authjs.session-token`
  // mientras el token se emitía como `__Secure-…`, y la sesión no matcheaba.
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: SESSION_COOKIE_OPTIONS,
    },
  },
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
      session.user.passwordResetRequired = Boolean(token.passwordResetRequired)
      return session
    },
  },
}

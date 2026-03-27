import { DefaultSession } from 'next-auth'
import { Role, OrgRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role
      organizationId?: string
      orgRole?: OrgRole
      provider?: string
      onboardingCompleted?: boolean
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    organizationId?: string
    orgRole?: OrgRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    organizationId?: string
    orgRole?: string
    provider?: string
    onboardingCompleted?: boolean
  }
}

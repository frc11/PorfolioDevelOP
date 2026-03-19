import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role
      clientId?: string
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    clientId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    clientId?: string
  }
}

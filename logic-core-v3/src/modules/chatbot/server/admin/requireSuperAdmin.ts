import { auth } from '@/auth'

/**
 * Guard for admin-only server actions and API routes.
 * Throws on unauthorized / forbidden access — safe for use in 'use server' functions.
 */
export async function requireSuperAdmin() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('UNAUTHORIZED: no active session')
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN: SUPER_ADMIN role required')
  }

  return session.user
}

import { auth } from '@/auth'

export async function requireSuperAdmin(): Promise<string> {
  const session = await auth()

  if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) {
    throw new Error('Unauthorized')
  }

  return session.user.id
}

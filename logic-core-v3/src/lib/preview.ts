import { auth } from '@/auth'
import { getImpersonationSession } from '@/lib/impersonation'

export async function resolveOrgId(): Promise<string | null> {
  const session = await auth()
  const role = session?.user?.role

  if (role === 'ORG_MEMBER') {
    return session?.user?.organizationId ?? null
  }

  if (role === 'SUPER_ADMIN') {
    const impersonation = await getImpersonationSession()
    return impersonation?.orgId ?? null
  }

  return null
}

export async function isAdminPreview(): Promise<boolean> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return false

  return Boolean(await getImpersonationSession())
}

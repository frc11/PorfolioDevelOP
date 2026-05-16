import { auth } from '@/auth'
import { getImpersonationSession } from '@/lib/impersonation'

import { cache } from 'react'

export const resolveOrgId = cache(async (): Promise<string | null> => {
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
})

export const isAdminPreview = cache(async (): Promise<boolean> => {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return false

  return Boolean(await getImpersonationSession())
})

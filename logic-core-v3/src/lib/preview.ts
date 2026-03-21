import { auth } from '@/auth'
import { cookies } from 'next/headers'

export const PREVIEW_COOKIE = 'dp-preview-org'

/**
 * Resolves the organizationId for the current request.
 * - ORG_MEMBER: reads from JWT session (normal flow)
 * - SUPER_ADMIN: reads from the preview cookie set via startClientPreview()
 */
export async function resolveOrgId(): Promise<string | null> {
  const session = await auth()
  const role = session?.user?.role

  if (role === 'ORG_MEMBER') {
    return session?.user?.organizationId ?? null
  }

  if (role === 'SUPER_ADMIN') {
    const jar = await cookies()
    return jar.get(PREVIEW_COOKIE)?.value ?? null
  }

  return null
}

/** True when a SUPER_ADMIN is browsing the client portal in preview mode. */
export async function isAdminPreview(): Promise<boolean> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return false
  const jar = await cookies()
  return !!jar.get(PREVIEW_COOKIE)?.value
}

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { IMPERSONATION_COOKIE, IMPERSONATION_DURATION_SECONDS } from '@/lib/impersonation-constants'
import { getImpersonationCookieOptions, signImpersonationToken, verifyImpersonationToken } from '@/lib/impersonation'

export async function startImpersonationAction(orgId: string) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) {
    redirect('/admin/clients')
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, companyName: true, slug: true },
  })

  if (!organization) {
    redirect('/admin/clients')
  }

  const expiresAt = Date.now() + IMPERSONATION_DURATION_SECONDS * 1000
  const token = await signImpersonationToken({
    adminId: session.user.id,
    orgId: organization.id,
    expiresAt,
  })

  const jar = await cookies()
  jar.set(IMPERSONATION_COOKIE, token, getImpersonationCookieOptions())

  await logAdminAction({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    actionType: 'IMPERSONATION_STARTED',
    action: `Inicio impersonation de "${organization.companyName}"`,
    targetType: 'Organization',
    targetId: organization.id,
    metadata: { orgSlug: organization.slug },
  })

  redirect('/dashboard')
}

export async function stopImpersonationAction() {
  const session = await auth()
  const jar = await cookies()
  const token = jar.get(IMPERSONATION_COOKIE)?.value
  let payload: { orgId: string } | null = null

  if (token) {
    try {
      payload = await verifyImpersonationToken(token)
    } catch {
      payload = null
    }
  }

  jar.delete(IMPERSONATION_COOKIE)

  if (session?.user?.id) {
    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      actionType: 'IMPERSONATION_ENDED',
      action: 'Finalizo impersonation',
      targetType: 'Organization',
      targetId: payload?.orgId ?? 'unknown',
      metadata: payload ? { orgId: payload.orgId } : {},
    })
  }

  redirect('/admin/clients')
}

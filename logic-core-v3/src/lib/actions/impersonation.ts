'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { IMPERSONATION_COOKIE, IMPERSONATION_DURATION_SECONDS } from '@/lib/impersonation-constants'
import { getImpersonationCookieOptions, signImpersonationToken } from '@/lib/impersonation'

export async function startImpersonationAction(orgId: string) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN' || !session.user.id) {
    redirect('/admin/clients')
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true },
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

  redirect('/dashboard')
}

export async function stopImpersonationAction() {
  const jar = await cookies()
  jar.delete(IMPERSONATION_COOKIE)
  redirect('/admin/clients')
}

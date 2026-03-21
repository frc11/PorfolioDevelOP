'use server'

import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PREVIEW_COOKIE } from '@/lib/preview'

export async function startClientPreview(orgId: string) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') return

  const jar = await cookies()
  jar.set(PREVIEW_COOKIE, orgId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // No maxAge → session cookie, clears when browser closes
  })

  redirect('/dashboard')
}

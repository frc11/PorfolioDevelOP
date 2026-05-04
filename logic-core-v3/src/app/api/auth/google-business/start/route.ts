import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAuthUrl } from '@/lib/integrations/google-business-profile'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })

  return NextResponse.redirect(getAuthUrl(orgId))
}

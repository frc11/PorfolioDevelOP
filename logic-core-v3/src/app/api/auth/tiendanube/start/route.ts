import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAuthUrl } from '@/lib/integrations/tiendanube'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })

  return NextResponse.redirect(getAuthUrl(orgId))
}

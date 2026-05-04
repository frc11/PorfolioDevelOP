import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exchangeCodeForTokens } from '@/lib/integrations/google-business-profile'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const orgId = searchParams.get('state')

  if (!code || !orgId) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        gbpAccessToken: tokens.access_token,
        gbpRefreshToken: tokens.refresh_token,
        gbpTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        gbpConnectedAt: new Date(),
      },
    })

    return NextResponse.redirect(new URL('/admin/clients', request.url))
  } catch (err) {
    console.error('[GBP Callback] Error:', err)
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 })
  }
}

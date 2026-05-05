import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken } from '@/lib/integrations/tiendanube'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const orgId = searchParams.get('state')

  if (!code || !orgId) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }

  const tokens = await exchangeCodeForToken(code)
  if (!tokens) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      tiendanubeStoreId: tokens.user_id,
      tiendanubeAccessToken: tokens.access_token,
      tiendanubeConnectedAt: new Date(),
    },
  })

  return NextResponse.redirect(
    new URL('/dashboard/modules/tienda-conectada?connected=true', request.url),
  )
}

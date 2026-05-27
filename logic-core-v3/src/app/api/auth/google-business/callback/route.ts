import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  exchangeCodeForTokens,
  GBP_OAUTH_SCOPE,
} from '@/lib/integrations/google-business-profile'
import { prisma } from '@/lib/prisma'
import { verifyOAuthState } from '@/lib/security/oauth-state'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const rawState = searchParams.get('state')

  if (!code || !rawState) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }

  // B-SEC.3b (cierra SEC-AUTH-01 / B11 F3): validar la firma del state ANTES
  // de cualquier acceso a DB. Sin esto, un atacante podía sobreescribir gbp*
  // tokens en cualquier org cambiando el `state` de la URL del callback.
  const stateCheck = verifyOAuthState(GBP_OAUTH_SCOPE, rawState)
  if (!stateCheck.valid) {
    return NextResponse.redirect(
      new URL(`/admin/clients?error=oauth_state_${stateCheck.reason}`, request.url),
    )
  }
  const orgId = stateCheck.organizationId

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

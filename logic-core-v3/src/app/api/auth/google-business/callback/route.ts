import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { connectGbpForOrg } from '@/lib/integrations/gbp-connection'
import type { ConnectionStatus } from '@/lib/integrations/gbp-connection-logic'
import {
  exchangeCodeForTokens,
  GBP_OAUTH_SCOPE,
} from '@/lib/integrations/google-business-profile'
import { prisma } from '@/lib/prisma'
import { verifyOAuthState } from '@/lib/security/oauth-state'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN' || !session.user.id) {
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

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, companyName: true },
  })
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
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

    // P3-A.1 — eslabón backend: con los tokens ya persistidos, descubrir account+location
    // y persistirlos (+ rating one-shot). Best-effort: los tokens YA están guardados, así
    // que un fallo de descubrimiento NO rompe la conexión (queda 'discovery_failed',
    // reconectable / resoluble por el selector de P3-A.2).
    let gbp: ConnectionStatus | 'discovery_failed' = 'CONNECTED_NO_LOCATION'
    try {
      gbp = await connectGbpForOrg(orgId)
    } catch (discoveryErr) {
      console.error('[GBP Callback] discovery failed:', discoveryErr)
      gbp = 'discovery_failed'
    }

    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      userName: session.user.name ?? undefined,
      actionType: 'OTHER',
      action: `Conectó Google Business Profile para "${org.companyName}" (${gbp})`,
      targetType: 'Organization',
      targetId: org.id,
      metadata: { kind: 'integration_connected', integration: 'google-business', status: gbp },
    })

    return NextResponse.redirect(new URL(`/admin/clients?gbp=${gbp}`, request.url))
  } catch (err) {
    console.error('[GBP Callback] Error:', err)
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import {
  exchangeCodeForToken,
  TIENDANUBE_OAUTH_SCOPE,
} from '@/lib/integrations/tiendanube'
import { verifyOAuthState } from '@/lib/security/oauth-state'

/**
 * Callback OAuth de Tiendanube — B11.2 fix + B-SEC.3b.
 *
 * Antes (B11.0 C1, confirmado runtime): este endpoint NO validaba sesión y
 * aceptaba el `state` (orgId crudo) sin verificación. Un `curl` anónimo con
 * `state=<orgId-victima>` escribía `tiendanubeConnectedAt` en la org víctima
 * y, con un OAuth code válido, asignaba los tokens de la cuenta del atacante
 * a la org de cualquier cliente.
 *
 * Ahora: cuádruple guard antes de tocar la DB —
 *   1. `auth()` + SUPER_ADMIN (consistente con google-business/callback).
 *   2. **state firmado con HMAC**: `verifyOAuthState` valida firma + expiry
 *      ANTES de usar el orgId. Cierra el state-swap intra-admin (F1).
 *   3. Verificar que la org del `state` existe.
 *   4. Audit log con orgId, userId y duración del flow.
 */
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const rawState = searchParams.get('state')

  if (!code || !rawState) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }

  // B-SEC.3b: validar la firma del state ANTES de cualquier acceso a DB.
  const stateCheck = verifyOAuthState(TIENDANUBE_OAUTH_SCOPE, rawState)
  if (!stateCheck.valid) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=oauth_state_${stateCheck.reason}`, request.url),
    )
  }
  const orgId = stateCheck.organizationId

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, slug: true, companyName: true },
  })
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
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

  await logAdminAction({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'OTHER',
    action: `Conectó Tiendanube para "${org.companyName}"`,
    targetType: 'Organization',
    targetId: org.id,
    metadata: { kind: 'integration_connected', integration: 'tiendanube', orgSlug: org.slug },
  })

  return NextResponse.redirect(
    new URL('/dashboard/modules/tienda-conectada?connected=true', request.url),
  )
}

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { applyAuthRateLimit } from '@/lib/security/auth-rate-limit'
import { logAdminAction } from '@/lib/audit-log'
import { OrganizationIdSchema } from '@/lib/actions/schemas'
import { sendExecutiveWeeklyReportManual } from '@/lib/reports/executive-weekly/send-manual'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    await requireSuperAdmin()
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    const status = message.startsWith('UNAUTHORIZED') ? 401 : 403
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status })
  }

  // requireSuperAdmin() ya garantizó sesión + rol acá arriba; auth() vuelve a
  // llamarse solo para leer los campos de sesión (memoizado por request via
  // React.cache — no repite el round-trip). No se anota el tipo de retorno de
  // requireSuperAdmin(): `React.cache` sobre el `auth` sobrecargado de
  // NextAuth v5 hace que la inferencia de tipo cruzada (ReturnType/Awaited
  // importado desde otro archivo) colapse al overload equivocado, aunque el
  // uso directo dentro de auth-guards.ts narrowea bien — ver diagnóstico
  // P2.B.1. auth-guards.ts no se tocó (fuera de scope de este sprint).
  const session = await auth()
  const adminId = session?.user?.id ?? 'unknown'

  // Rate limit por admin: protege contra spam involuntario (doble click) y
  // contra abuso de una cuenta admin comprometida — cada intento manda un
  // mail real por Brevo. Precedente: resendCredentialsPerAdmin.
  const adminLimit = await applyAuthRateLimit({
    scope: 'sendExecutiveReportNowPerAdmin',
    identifier: adminId,
  })
  if (!adminLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'TOO_MANY_REQUESTS',
        retryAfterSeconds: adminLimit.retryAfterSeconds,
      },
      { status: 429 },
    )
  }

  const rawParams = await params
  const parsed = OrganizationIdSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid organizationId' }, { status: 400 })
  }
  const { organizationId } = parsed.data

  const result = await sendExecutiveWeeklyReportManual(organizationId)

  // Audit log: se registra el intento completo (éxito o motivo de no-envío),
  // nunca contenido del mail. Sin actionType dedicado en el enum (evitar
  // migración fuera de scope) — EMAIL_SENT es el más cercano semánticamente.
  await logAdminAction({
    userId: adminId,
    userEmail: session?.user?.email,
    userName: session?.user?.name,
    actionType: 'EMAIL_SENT',
    action: result.ok
      ? `Envió manualmente el reporte ejecutivo semanal (org ${organizationId})`
      : `Intentó enviar manualmente el reporte ejecutivo semanal (org ${organizationId}) — resultado: ${result.reason}`,
    targetType: 'Organization',
    targetId: organizationId,
    metadata: { result },
  })

  if (result.ok) {
    return NextResponse.json({
      ok: true,
      periodKey: result.periodKey,
      recipientEmail: result.recipientEmail,
    })
  }

  if (result.reason === 'NOT_FOUND') {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 404 })
  }

  // ALREADY_SENT / BUILD_SKIPPED / SEND_FAILED / UNEXPECTED_ERROR: el request
  // en sí es válido y se procesó — el motivo de no-envío es de negocio, no un
  // error de protocolo. Mismo criterio que resend-credentials/route.ts (200
  // con `ok:false` + info accionable en vez de un status de error genérico).
  return NextResponse.json({ ...result }, { status: 200 })
}

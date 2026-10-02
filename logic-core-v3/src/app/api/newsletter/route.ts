import { NextResponse } from 'next/server'
import { z } from 'zod'

import { EMAIL, MAXIMOS } from '@/app/v3/_lib/formularios/validar'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { getClientIpHash } from '@/lib/security/auth-rate-limit'

/**
 * [RONDA 2] F1 · EL NEWSLETTER DEL HOME (`/v3`, Tu panel) — recibe un mail. Público: el límite por IP (con su propia
 * clave) antes de leer el cuerpo, y el esquema de Zod. Al visitante nunca le llega un error interno.
 *
 * Hoy recibe y valida; la conexión a la lista real es de la etapa siguiente.
 */
const ESQUEMA_DEL_NEWSLETTER = z.object({ mail: z.string().trim().max(MAXIMOS.contacto).regex(EMAIL) })

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = await getClientIpHash()
    const limite = await checkRateLimit({ key: `newsletterV3PerIp:${ip}`, ...RATE_LIMIT_PRESETS.contactFormPerIp })
    if (!limite.allowed) return NextResponse.json({ ok: false, error: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.' }, { status: 429 })
    const cuerpo: unknown = await request.json().catch(() => null)
    const datos = ESQUEMA_DEL_NEWSLETTER.safeParse(cuerpo)
    if (!datos.success) return NextResponse.json({ ok: false, error: 'Revisá el mail y probá de nuevo.' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[newsletter v3]', error instanceof Error ? error.name : 'error')
    return NextResponse.json({ ok: false, error: 'No pudimos suscribirte. Probá de nuevo en un rato.' }, { status: 500 })
  }
}

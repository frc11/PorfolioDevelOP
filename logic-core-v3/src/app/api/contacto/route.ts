import { NextResponse } from 'next/server'
import { z } from 'zod'

import { INTERESES, type Interes } from '@/app/v3/_chrome/contacto/contenido'
import { EMAIL, MAXIMOS, TELEFONO } from '@/app/v3/_lib/formularios/validar'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { getClientIpHash } from '@/lib/security/auth-rate-limit'

/**
 * [RONDA 2] F1 · EL CONTACTO DEL HOME (`/v3`) — recibe el formulario del pie y el del panel deslizante. Público: lo frena
 * el límite por IP (el mismo del formulario de la landing, con su propia clave) ANTES de leer el cuerpo, y los datos pasan
 * por su esquema de Zod. Al visitante nunca le llega un error interno: sólo uno escrito para él.
 *
 * Hoy recibe y valida; la conexión al servicio real (el CRM, el aviso por mail) es de la etapa siguiente.
 *
 * [EL ENCASTRE] 1E · el único dato obligatorio es el contacto (el mail en el pie; el email o el teléfono en el panel): lo
 * demás es opcional (puede venir vacío) y sólo se frena por su largo máximo.
 */
const IDS = INTERESES.map((i) => i.id) as [Interes, ...Interes[]]
const opcional = (max: number): z.ZodString => z.string().trim().max(max)

const DelPie = z.object({
  origen: z.literal('pie'),
  nombre: opcional(MAXIMOS.nombre),
  mail: z.string().trim().max(MAXIMOS.contacto).regex(EMAIL),
  mensaje: opcional(MAXIMOS.mensaje),
})

const DelPanel = z.object({
  origen: z.literal('panel'),
  intereses: z.array(z.enum(IDS)).max(IDS.length),
  presupuesto: opcional(MAXIMOS.presupuesto),
  nombre: opcional(MAXIMOS.nombre),
  medio: z
    .string()
    .trim()
    .max(MAXIMOS.contacto)
    .refine((m) => EMAIL.test(m) || (TELEFONO.test(m) && m.replace(/\D/g, '').length >= 8)),
  empresa: opcional(MAXIMOS.empresa),
  mensaje: opcional(MAXIMOS.mensaje),
})

const ESQUEMA_DEL_CONTACTO = z.discriminatedUnion('origen', [DelPie, DelPanel])

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = await getClientIpHash()
    const limite = await checkRateLimit({ key: `contactoV3PerIp:${ip}`, ...RATE_LIMIT_PRESETS.contactFormPerIp })
    if (!limite.allowed) return NextResponse.json({ ok: false, error: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.' }, { status: 429 })
    const cuerpo: unknown = await request.json().catch(() => null)
    const datos = ESQUEMA_DEL_CONTACTO.safeParse(cuerpo)
    if (!datos.success) return NextResponse.json({ ok: false, error: 'Revisá los datos del formulario y probá de nuevo.' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contacto v3]', error instanceof Error ? error.name : 'error')
    return NextResponse.json({ ok: false, error: 'No pudimos enviarlo. Probá de nuevo en un rato.' }, { status: 500 })
  }
}

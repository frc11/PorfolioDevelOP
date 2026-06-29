import 'server-only'

/**
 * LeadOS 2.1a — Sticky del foco (D7), versión liviana SIN migración.
 *
 * Guarda en una cookie cuál es el lead que el setter está trabajando ahora, para
 * que al volver al home retome el MISMO lead aunque haya entrado uno más urgente
 * (ver `seleccionarFoco`). No es estado comercial ni de organización (eso es
 * `OsLeadSetterMeta`): es una preferencia efímera de navegación, por eso vive en
 * una cookie y no en la DB.
 *
 * Aislamiento: la cookie es por navegador (una sesión = un setter). Aunque
 * quedara una cookie vieja de otra sesión, `seleccionarFoco` solo la respeta si
 * el id matchea un lead de la cartera PROPIA (`grupos.trabajar`); si no, la
 * ignora. La pertenencia es el candado — el valor crudo nunca decide solo.
 *
 * `httpOnly`: la cookie se lee/escribe SOLO del lado del servidor (la page la lee
 * en el render, las actions la escriben), nunca desde JS del cliente.
 */
import { cookies } from 'next/headers'

export const FOCO_COOKIE_NAME = 'leados-foco-v1'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const FOCO_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PRODUCTION,
  path: '/',
  // 7 días: dura lo que una semana de trabajo; igual se autocorrige por pertenencia.
  maxAge: 60 * 60 * 24 * 7,
}

/** Lee el lead anclado como foco (o null). Seguro en render de Server Component. */
export async function leerFocoLeadId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(FOCO_COOKIE_NAME)?.value ?? null
}

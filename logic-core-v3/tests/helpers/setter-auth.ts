import { type Page, type BrowserContext, expect } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import { prisma } from './setter-db'

/**
 * Auth del smoke contra el BUILD DE PRODUCCIÓN. NO toca lógica de producción.
 *
 * Por qué se mintea client-side y no se usa POST /api/qa/login:
 *   `next start` corre con NODE_ENV=production → `src/auth.ts` nombra el cookie de
 *   sesión `__Secure-authjs.session-token` SIEMPRE (aunque sea http). El endpoint
 *   real /api/qa/login nombra el cookie por el PROTOCOLO del request → sobre http
 *   setea `authjs.session-token` (sin prefijo) y el server prod nunca lo
 *   encuentra → Unauthorized. (Bug del route para prod-sobre-http; documentado en
 *   el reporte, fuera del scope del smoke.) Acá minteamos el MISMO JWT (mismo
 *   AUTH_SECRET + salt = nombre del cookie) con el nombre que el server prod lee.
 *   Chromium trata http://localhost como contexto seguro → acepta/envía cookies
 *   `Secure` sobre localhost, así que el prefijo __Secure- funciona.
 */

export type QaPersona = 'setter' | 'super-admin' | 'client-a' | 'client-b'

const BASE_URL = `http://127.0.0.1:${process.env.SETTER_PORT ?? 3001}` // IPv4: Chromium rebota localhost→::1
const SESSION_COOKIE = '__Secure-authjs.session-token' // el que lee el server prod
const SESSION_MAX_AGE = 8 * 60 * 60

const PERSONA_EMAIL: Record<QaPersona, string> = {
  setter: 'setter-qa@develop.test',
  'super-admin': 'admin@develop.com',
  'client-a': 'cliente@sanmiguel.com',
  'client-b': 'qa-cliente-b@develop.test',
}

async function setSessionCookie(
  context: BrowserContext,
  url: string,
  opts: { userId: string; email: string; role: string },
): Promise<void> {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET ausente — el config de playwright carga .env.local; revisá la var')
  }
  const value = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: opts.userId,
      email: opts.email,
      name: opts.email,
      picture: null,
      role: opts.role,
      provider: 'qa-bypass',
      onboardingCompleted: opts.role === 'SUPER_ADMIN',
      passwordResetRequired: false,
    },
  })
  // domain+path (no `url`): addCookies rechaza secure:true sobre una url http.
  // Con domain/path el cookie Secure entra al jar y Chromium lo envía a
  // http://localhost (contexto seguro).
  const hostname = new URL(url).hostname
  await context.addCookies([
    { name: SESSION_COOKIE, value, domain: hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
}

/** Login por persona seedeada (resuelve el user real desde la DB y mintea su sesión). */
export async function qaLogin(page: Page, persona: QaPersona): Promise<void> {
  const email = PERSONA_EMAIL[persona]
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  expect(user, `persona ${persona} (${email}) seedeada en la DB`).toBeTruthy()
  await setSessionCookie(page.context(), BASE_URL, { userId: user!.id, email, role: user!.role })
}

/** Mintea sesión para un usuario arbitrario (el 2º setter del aislamiento). */
export async function mintSessionCookie(
  context: BrowserContext,
  baseURL: string,
  opts: { userId: string; email: string; name?: string | null; role: string; organizationId?: string; orgRole?: string },
): Promise<void> {
  await setSessionCookie(context, baseURL || BASE_URL, { userId: opts.userId, email: opts.email, role: opts.role })
}

/** Limpia la sesión. */
export async function qaLogout(page: Page): Promise<void> {
  await page.context().clearCookies()
}

/** Acumulador de errores de consola / excepciones de página de un test. */
export type ConsoleGuard = { errors: string[] }

const BENIGN: RegExp[] = [
  /ResizeObserver loop/i,
  /favicon\.ico/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /Hydration completed/i,
]

/** Engancha console.error + pageerror en `page`. Llamar al inicio del test. */
export function attachConsoleGuard(page: Page): ConsoleGuard {
  const guard: ConsoleGuard = { errors: [] }
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (!BENIGN.some((re) => re.test(text))) guard.errors.push(`[console.error] ${text}`)
  })
  page.on('pageerror', (err) => {
    const text = err.message
    if (!BENIGN.some((re) => re.test(text))) guard.errors.push(`[pageerror] ${text}`)
  })
  return guard
}

/** Aserción de salud: cero errores de consola / excepciones no manejadas. */
export function expectNoConsoleErrors(guard: ConsoleGuard): void {
  expect(guard.errors, `errores de consola capturados:\n${guard.errors.join('\n')}`).toEqual([])
}

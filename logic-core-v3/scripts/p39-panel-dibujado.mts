/**
 * P39 · EL PANEL DIBUJADO — solo lectura.
 *
 * Abre `/setter` como `setter-qa` en un navegador real y cuenta lo que el panel de
 * Novedades PINTA dentro de `main`: filas, cuántas nombran a una semilla (el nombre
 * del lead de un aviso con lead) y cuántas son el pliegue de la reasignación
 * saliente. Es la cuenta que prueba si borrar la fuga le devolvió el panel a las
 * semillas, medida donde la ve el setter.
 *
 * Uso: PANEL_BASE_URL=http://127.0.0.1:3003 npx tsx scripts/p39-panel-dibujado.mts
 */
import { chromium } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const BASE_URL = process.env.PANEL_BASE_URL ?? 'http://127.0.0.1:3003'
const SESSION_COOKIE = '__Secure-authjs.session-token'

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const qa = await prisma.user.findUniqueOrThrow({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
  const semillas = await prisma.osSetterNotice.findMany({
    where: { setterId: qa.id, read: false, leadId: { not: null } },
    select: { lead: { select: { businessName: true } } },
  })
  const nombres = [...new Set(semillas.map((s) => s.lead?.businessName).filter((n): n is string => Boolean(n)))]

  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const token = await encode({
      secret,
      salt: SESSION_COOKIE,
      maxAge: 60 * 60,
      token: { sub: qa.id, email: 'setter-qa@develop.test', name: 'setter-qa@develop.test', picture: null, role: 'SETTER', provider: 'qa-bypass', onboardingCompleted: false, passwordResetRequired: false },
    })
    await context.addCookies([{ name: SESSION_COOKIE, value: token, domain: new URL(BASE_URL).hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }])
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'domcontentloaded' })
    const panel = page.locator('main [aria-label="Novedades de tu cartera"]')
    await panel.waitFor({ state: 'visible', timeout: 30_000 })
    const filas = await panel.locator('li').allInnerTexts()
    const deSemilla = filas.filter((t) => nombres.some((n) => t.includes(n)))
    const salientes = filas.filter((t) => t.includes('Te reasignaron un lead'))
    console.log(`panel dibujado de setter-qa · filas ${filas.length} · nombran una semilla ${deSemilla.length} · reasignación saliente ${salientes.length}`)
    for (const t of filas) console.log(`  · ${t.replace(/\s+/g, ' ').slice(0, 110)}`)
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

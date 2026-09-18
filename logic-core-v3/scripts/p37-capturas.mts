/**
 * P37 — Verificación operando la app: la cola del panel, a 1440 y a 390.
 *
 * Por cada ancho: captura del panel de `setter-qa`, y lectura del DOM de la
 * sección «Tu cola de hoy» (el orden lead por lead, el chip, el pie). Además:
 * dónde aparece el lead con la demo aprobada, y qué ve un setter sin trabajo
 * (`m0-gal-nada-para-trabajar@develop.test`, de la seed de la galería).
 *
 * La sesión se firma igual que en las mediciones fijas (`capturar-franja.ts`):
 * en build de producción NextAuth espera la cookie `__Secure-`.
 *
 * Uso: CAPT_BASE=http://127.0.0.1:3010 CAPT_TAG=despues npx tsx scripts/p37-capturas.mts
 */
import { mkdirSync } from 'node:fs'
import { chromium, type Browser } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const BASE = process.env.CAPT_BASE ?? 'http://127.0.0.1:3010'
const TAG = process.env.CAPT_TAG ?? 'despues'
const OUT = 'docs/p37-cola-urgencia'
const COOKIE = '__Secure-authjs.session-token'
const ANCHOS = [
  ['1440', 1440, 900],
  ['390', 390, 844],
] as const

async function contexto(browser: Browser, email: string, width: number, height: number) {
  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } })
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const token = await encode({
    secret,
    salt: COOKIE,
    maxAge: 60 * 60,
    token: {
      sub: user.id,
      email,
      name: email,
      picture: null,
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })
  const ctx = await browser.newContext({ viewport: { width, height } })
  await ctx.addCookies([
    { name: COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
  return ctx
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()

  for (const [tag, w, h] of ANCHOS) {
    const ctx = await contexto(browser, 'setter-qa@develop.test', w, h)
    const page = await ctx.newPage()
    await page.goto(`${BASE}/setter`, { waitUntil: 'networkidle' })
    const seccion = page.locator('main section[aria-label="Tu cola de hoy"]')
    await seccion.waitFor({ state: 'visible' })
    await page.screenshot({ path: `${OUT}/${TAG}-cola-${tag}.png` })
    await seccion.screenshot({ path: `${OUT}/${TAG}-cola-seccion-${tag}.png` })

    const lectura = await seccion.evaluate((s) => {
      const texto = (s as HTMLElement).innerText
      // Los nombres visibles, en orden de documento: el foco y las filas de la cola.
      const nombres = [...s.querySelectorAll('*')]
        .filter((e) => e.children.length === 0)
        .map((e) => (e.textContent ?? '').trim())
        .filter((t) => /^(QA-|M0-GAL|DEMO Web|CORRIDA|SMOKE-SETTER|Gimnasio)/.test(t))
      return {
        chip: (texto.match(/\d+ para trabajar/) ?? [null])[0],
        pie: (texto.match(/Quedan? \d+ m[aá]s[^\n]*/) ?? [null])[0],
        nombres: [...new Set(nombres)],
        rotulos: (texto.match(/(Fijado por vos — va primero|construila|lista para mandar|Te toca a vos[^\n]*|evalualo|Todavía no hay demo que mostrar)/g) ?? []),
      }
    })
    console.log(`\n── setter-qa · ${TAG} · ${tag} ──`)
    console.log(JSON.stringify(lectura, null, 2))

    // El lead con la demo aprobada: ¿está en la cola, en novedades, o solo en la cartera?
    const aprobada = 'QA-W Aprobada Gate Abierto'
    const enCola = await seccion.getByText(aprobada, { exact: true }).count()
    const enNovedades = await page.locator('main [aria-label="Novedades de tu cartera"]').getByText(aprobada).count()
    console.log(`  «${aprobada}»: en la cola ${enCola > 0 ? 'SÍ, fila ' + (lectura.nombres.indexOf(aprobada) + 1) : 'NO'} · en novedades ${enNovedades > 0 ? 'SÍ' : 'NO'}`)
    await ctx.close()
  }

  // Un setter sin trabajo: qué ve.
  for (const [tag, w, h] of ANCHOS) {
    const ctx = await contexto(browser, 'm0-gal-nada-para-trabajar@develop.test', w, h)
    const page = await ctx.newPage()
    await page.goto(`${BASE}/setter`, { waitUntil: 'networkidle' })
    await page.locator('main').first().waitFor({ state: 'visible' })
    await page.screenshot({ path: `${OUT}/${TAG}-sin-trabajo-${tag}.png` })
    const main = await page.locator('main').first().innerText()
    console.log(`\n── setter sin trabajo · ${TAG} · ${tag} ──`)
    console.log('  cola dibujada: ' + ((await page.locator('main section[aria-label="Tu cola de hoy"]').count()) > 0 ? 'SÍ' : 'NO'))
    console.log('  texto: ' + main.replace(/\s+/g, ' ').slice(0, 300))
    await ctx.close()
  }

  await browser.close()
  const { prisma } = await import('@/lib/prisma')
  await prisma.$disconnect()
  console.log(`\nCapturas en ${OUT}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

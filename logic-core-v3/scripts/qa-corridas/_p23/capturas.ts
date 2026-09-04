/**
 * P23 — Las capturas de la verificación, a 1440.
 *
 * Cuatro escenas, una por defecto arreglado. El viewport se agranda al alto del
 * contenido en vez de usar `fullPage`: el shell del setter es `fixed inset-0` y
 * `fullPage` sobre él captura el viewport y nada más.
 *
 *   CAPTURAS_BASE_URL=http://127.0.0.1:3023 CAPTURAS_OUT=docs/proof-screenshots/p23/despues \
 *     npx tsx scripts/qa-corridas/_p23/capturas.ts
 */
import fs from 'fs'
import path from 'path'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.CAPTURAS_BASE_URL ?? 'http://127.0.0.1:3023'
const OUT = process.env.CAPTURAS_OUT ?? 'docs/proof-screenshots/p23/despues'
const SESSION_COOKIE = '__Secure-authjs.session-token'

/** Agranda el viewport al alto real del scroller y saca la foto. */
async function foto(page: Page, archivo: string, maxAlto = 2600) {
  const alto = await page.evaluate(
    String.raw`(() => { const m = document.querySelector('main'); return m ? Math.min(m.scrollHeight + 160, 4000) : 900 })()`,
  )
  await page.setViewportSize({ width: 1440, height: Math.min(Number(alto), maxAlto) })
  await page.waitForTimeout(500)
  fs.mkdirSync(path.resolve(OUT), { recursive: true })
  await page.screenshot({ path: path.join(path.resolve(OUT), archivo) })
  await page.setViewportSize({ width: 1440, height: 900 })
  console.log(`  → ${archivo}`)
}

async function main() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!setter) throw new Error('falta el setter de QA')

  const leadDe = async (nombre: string) => {
    const l = await prisma.osLead.findFirst({
      where: { businessName: nombre },
      select: { id: true },
    })
    if (!l) throw new Error(`falta el lead "${nombre}"`)
    return l.id
  }
  const postergado = await leadDe('QA-W Postergado Futuro')
  const fichaCompleta = await leadDe('QA-W Ficha Completa')
  const brief = await leadDe('QA-W Brief')

  const token = await encode({
    token: { sub: setter.id, email: setter.email, name: setter.name, role: setter.role },
    secret,
    salt: SESSION_COOKIE,
  })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: new URL(BASE_URL).hostname,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ])
  const page = await context.newPage()
  const ir = async (ruta: string) => {
    await page.goto(`${BASE_URL}${ruta}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('main')
    await page.waitForTimeout(1200)
  }

  // ── 1 · El veredicto: cargar los tres campos y querer salir.
  console.log('1 · el veredicto que avisa')
  await ir(`/setter/leads/${fichaCompleta}/manual/m1`)
  await page.getByRole('button', { name: /Tu decisión/ }).first().click()
  await page.waitForTimeout(600)
  await page.locator('[aria-label="Score de la evaluación"] button').nth(3).click()
  await page.locator('main textarea').first().fill('Local a la calle y la web actual caída.')
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: 'Volver a tu día' }).first().click()
  await page.waitForTimeout(800)
  await foto(page, '01-veredicto-avisa-al-salir.png', 1000)

  // ── 2 · El ciclo: espera ofrece m5, y m5 ya no devuelve.
  console.log('2 · el ciclo cortado')
  await ir(`/setter/leads/${postergado}/manual/espera`)
  await foto(page, '02a-espera-ofrece-m5.png')
  await ir(`/setter/leads/${postergado}/manual/m5`)
  await foto(page, '02b-m5-sin-vuelta.png')

  // ── 3 · La referencia de ubicación, corregida.
  console.log('3 · la copy que ya no ubica')
  await ir(`/setter/leads/${brief}/manual/mc1`)
  await foto(page, '03-mc1-copy-sin-ubicacion.png')

  // ── 4 · Los avisos: el caducado y el vigente, juntos.
  console.log('4 · los avisos que envejecen')
  await ir('/setter')
  await foto(page, '04-novedades-caducadas.png', 3200)

  await browser.close()
  console.log(`\nCapturas en ${path.resolve(OUT)}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

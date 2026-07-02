/**
 * Addendum de verificación — confirma empíricamente si el Callout "Franco pidió
 * correcciones" (arriba del wizard) queda fuera de vista cuando el auto-scroll
 * aterriza en la sección Construcción (RECHAZADA). Fuerza el dossier a
 * RECHAZADA por un momento (dato de QA, no producto), mide la distancia de
 * scroll, y lo deja como estaba.
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = 'http://127.0.0.1:3001'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_DIR = path.join(__dirname, '../../docs/proof-screenshots/corrida-2')

async function shot(page: Page, name: string) {
  const file = path.join(OUT_DIR, name)
  await page.screenshot({ path: file })
  console.log(`  screenshot -> ${name}`)
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const setter = await prisma.user.findUnique({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
  const lead = await prisma.osLead.findFirst({ where: { businessName: 'QA-W Construccion' }, select: { id: true } })
  if (!setter || !lead) throw new Error('fixtures ausentes')

  const before = await prisma.osLeadDossier.findUnique({ where: { leadId: lead.id }, select: { stage: true } })
  console.log('stage antes:', before?.stage)
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { stage: 'RECHAZADA' } })

  const secret = process.env.AUTH_SECRET as string
  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: 8 * 60 * 60,
    token: { sub: setter.id, email: 'setter-qa@develop.test', name: 'setter-qa@develop.test', picture: null, role: 'SETTER', provider: 'qa-bypass', onboardingCompleted: false, passwordResetRequired: false },
  })
  await context.addCookies([{ name: SESSION_COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }])

  await page.goto(`${BASE_URL}/setter/leads/${lead.id}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800) // deja asentar cualquier scroll-on-mount

  const landingScrollY = await page.evaluate(() => {
    // Busca el contenedor con scroll real (puede no ser window/document).
    const candidates = Array.from(document.querySelectorAll('*'))
    let best: { el: string; top: number; scrollable: boolean } = { el: 'window', top: window.scrollY, scrollable: window.scrollY > 0 }
    for (const el of candidates) {
      if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight) {
        best = { el: el.tagName + '.' + el.className, top: el.scrollTop, scrollable: true }
      }
    }
    return best
  })
  console.log('Posición de aterrizaje (auto-scroll):', JSON.stringify(landingScrollY))
  await shot(page, '13b-lead-post-rechazo-aterrizaje-real.png')

  // Geometría real: ¿el Callout cae dentro de los 900px del viewport en la
  // posición de scroll de aterrizaje? (isVisible() de Playwright NO basta —
  // solo chequea display/opacity, no si está scrolleado fuera de vista).
  const box = await page.getByText('Franco pidió correcciones').boundingBox()
  console.log('BoundingBox del Callout al aterrizar:', JSON.stringify(box))
  if (box) {
    const dentroDelViewport = box.y >= 0 && box.y <= 900
    console.log(`¿Callout dentro del viewport (0-900px) al aterrizar? ${dentroDelViewport} (y=${box.y})`)
  }

  // Ahora sí: scrollea al tope para ver qué hay arriba.
  await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('*'))
    for (const el of candidates) {
      if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight) {
        el.scrollTop = 0
      }
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(300)
  await shot(page, '13c-lead-post-rechazo-tope-de-pagina.png')
  const boxAtTop = await page.getByText('Franco pidió correcciones').boundingBox()
  console.log('BoundingBox del Callout en el tope de página:', JSON.stringify(boxAtTop))

  await browser.close()

  // Restaura el stage a como estaba (no dejar residuo de esta verificación).
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { stage: before!.stage } })
  console.log('stage restaurado a:', before?.stage)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

/**
 * Addendum — ¿el HOME avisa claramente que un lead volvió rechazado? Fuerza
 * RECHAZADA un momento, entra como setter, scrollea el contenedor real
 * (overflow-y-auto, no window) hasta el fondo capturando tramos, y restaura.
 */
import path from 'path'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = 'http://127.0.0.1:3001'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_DIR = path.join(__dirname, '../../docs/proof-screenshots/corrida-2')

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT_DIR, name) })
  console.log(`  screenshot -> ${name}`)
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const setter = await prisma.user.findUnique({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
  const lead = await prisma.osLead.findFirst({ where: { businessName: 'QA-W Construccion' }, select: { id: true } })
  if (!setter || !lead) throw new Error('fixtures ausentes')

  const before = await prisma.osLeadDossier.findUnique({ where: { leadId: lead.id }, select: { stage: true } })
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

  await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Cierra el onboarding hint si tapa contenido, para ver el foco real.
  const cerrarHint = page.getByRole('button', { name: /Entendido, no lo muestres más/i })
  if (await cerrarHint.isVisible().catch(() => false)) {
    await cerrarHint.click()
    await page.waitForTimeout(300)
  }

  await shot(page, '01b-home-post-rechazo-arriba.png')

  const info = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('*'))
    let scroller: Element | null = null
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 50 && (el as HTMLElement).scrollTop !== undefined) {
        if (!scroller || el.scrollHeight > (scroller as HTMLElement).scrollHeight) scroller = el
      }
    }
    return scroller ? { tag: scroller.tagName, cls: (scroller as HTMLElement).className, scrollHeight: scroller.scrollHeight, clientHeight: (scroller as HTMLElement).clientHeight } : null
  })
  console.log('Scroller detectado:', JSON.stringify(info))

  // Texto del lead rechazado en cualquier parte de la página (busca por nombre
  // del negocio) + si el badge "Rechazada"/aviso aparece.
  const menciones = await page.getByText('QA-W Construccion').count()
  console.log('Menciones de "QA-W Construccion" visibles en el home:', menciones)

  // Scrollea el contenedor real en pasos, screenshot cada uno, hasta el fondo.
  let step = 0
  for (;;) {
    const res = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('*'))
      let scroller: HTMLElement | null = null
      for (const el of candidates) {
        const h = el as HTMLElement
        if (h.scrollHeight > h.clientHeight + 50) {
          if (!scroller || h.scrollHeight > scroller.scrollHeight) scroller = h
        }
      }
      if (!scroller) return { done: true, top: 0, max: 0 }
      const max = scroller.scrollHeight - scroller.clientHeight
      const next = Math.min(scroller.scrollTop + scroller.clientHeight * 0.9, max)
      scroller.scrollTop = next
      return { done: next >= max - 2, top: next, max }
    })
    step += 1
    await page.waitForTimeout(250)
    await shot(page, `01c-home-post-rechazo-scroll-${step}.png`)
    console.log(`scroll step ${step}:`, JSON.stringify(res))
    if (res.done || step > 8) break
  }

  await browser.close()
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { stage: before!.stage } })
  await prisma.$disconnect()
  console.log('stage restaurado a:', before?.stage)
}

main().catch((e) => { console.error(e); process.exit(1) })

/**
 * B6.1 — Verificación perceptual + geométrica del reencauce de la dirección del
 * wizard hacia la ACCIÓN pendiente (no el paso-por-stage bloqueado). Mide, sobre
 * el prod-QA :3001 con los leads QA-W sembrados, en desktop y mobile:
 *
 *   Caso 1 (EVALUADA gate cerrado, "QA-W Evaluada Gate Cerrado"): el cartel dice
 *     "Mandá el primer mensaje (opener)" (NO "esperá la respuesta") y el auto-scroll
 *     aterriza con el OPENER dentro del viewport (antes caía en el Brief bloqueado,
 *     dejando el opener sin enfocar).
 *   Caso 2 (RECHAZADA, "QA-W Rechazada"): la nota de Franco (GuiaRetrabajo inline)
 *     cae DENTRO del viewport donde aterriza el scroll (antes solo estaba el Callout
 *     del tope, 2+ pantallas arriba del punto de aterrizaje).
 *   Regresión A (EVALUADA gate ABIERTO): sigue apuntando al Brief — el fix está
 *     acotado a gate cerrado, no toca el camino que ya funcionaba.
 *   Regresión B (CONSTRUCCION): el cartel/paso siguen como estaban (camino feliz).
 *
 * Solo LEE (mint de cookie + navegación); no muta el dossier. Uso:
 *   npx tsx scripts/qa-corridas/_verify-b61.ts   (con prod-QA en :3001 y seed V-1 corrido)
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
const OUT_DIR = path.join(__dirname, '../../docs/proof-screenshots/b6-1')

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

type Caso = {
  key: string
  lead: string
  bannerMustInclude: string
  bannerMustNotInclude?: string
  landTarget?: string
  activeStepMustInclude?: string
}

const CASOS: Caso[] = [
  {
    key: 'caso1-evaluada-opener',
    lead: 'QA-W Evaluada Gate Cerrado',
    bannerMustInclude: 'Mandá el primer mensaje (opener)',
    bannerMustNotInclude: 'esperá la respuesta',
    landTarget: 'Primer contacto (opener)',
    activeStepMustInclude: 'Primer contacto (opener)',
  },
  {
    key: 'caso2-rechazada-nota',
    lead: 'QA-W Rechazada',
    bannerMustInclude: 'Aplicá las correcciones de Franco',
    landTarget: 'Guía de retrabajo — lo que Franco pidió corregir',
    activeStepMustInclude: 'Guía de retrabajo — lo que Franco pidió corregir',
  },
  {
    key: 'reg-evaluada-gate-abierto',
    lead: 'QA-W Evaluada Gate Abierto',
    bannerMustInclude: 'Brief de diseño',
    bannerMustNotInclude: 'opener',
  },
  {
    key: 'reg-construccion',
    lead: 'QA-W Construccion',
    bannerMustInclude: 'Seguí construyendo la demo',
  },
]

/** boundingBox de la primera copia VISIBLE (la dup responsive oculta da null). */
async function firstVisibleBox(page: Page, texto: string) {
  const loc = page.getByText(texto, { exact: false })
  const n = await loc.count()
  for (let i = 0; i < n; i++) {
    const box = await loc.nth(i).boundingBox()
    if (box) return box
  }
  return null
}

/** innerText de la primera copia VISIBLE del selector (ignora la dup oculta). */
async function visibleText(page: Page, css: string): Promise<string | null> {
  const loc = page.locator(css)
  const n = await loc.count()
  for (let i = 0; i < n; i++) {
    const box = await loc.nth(i).boundingBox()
    if (box) return (await loc.nth(i).innerText()).trim()
  }
  return null
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const { prisma } = await import('../../src/lib/prisma')
  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true },
  })
  if (!setter) throw new Error('setter-qa@develop.test ausente — corré el seed V-1 primero.')

  const leads = await prisma.osLead.findMany({
    where: { assignedToId: setter.id, businessName: { in: CASOS.map((c) => c.lead) } },
    select: { id: true, businessName: true },
  })
  const byName = new Map(leads.map((l) => [l.businessName, l.id]))

  const secret = process.env.AUTH_SECRET as string
  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: 8 * 60 * 60,
    token: {
      sub: setter.id,
      email: 'setter-qa@develop.test',
      name: 'setter-qa@develop.test',
      picture: null,
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })

  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  let fails = 0

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    await context.addCookies([
      { name: SESSION_COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
    ])
    const page = await context.newPage()
    console.log(`\n${'═'.repeat(80)}\n[${vp.name} ${vp.width}x${vp.height}]`)

    for (const c of CASOS) {
      const id = byName.get(c.lead)
      if (!id) {
        console.log(`  ❌ ${c.lead}: lead ausente`)
        fails++
        continue
      }
      await page.goto(`${BASE_URL}/setter/leads/${id}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(800) // deja asentar el scroll-on-mount

      const banner = await visibleText(page, 'section[aria-label="Tu paso ahora en este lead"]')
      const activeStep = await visibleText(page, '[aria-current="step"]')
      const landBox = c.landTarget ? await firstVisibleBox(page, c.landTarget) : null

      const problems: string[] = []
      if (!(banner ?? '').includes(c.bannerMustInclude))
        problems.push(`cartel NO incluye "${c.bannerMustInclude}"`)
      if (c.bannerMustNotInclude && (banner ?? '').toLowerCase().includes(c.bannerMustNotInclude.toLowerCase()))
        problems.push(`cartel INCLUYE lo prohibido "${c.bannerMustNotInclude}"`)
      if (c.activeStepMustInclude && !(activeStep ?? '').includes(c.activeStepMustInclude))
        problems.push(`paso activo NO envuelve "${c.activeStepMustInclude}"`)
      if (c.landTarget) {
        if (!landBox) problems.push(`target "${c.landTarget}" no visible`)
        else if (!(landBox.y >= 0 && landBox.y <= vp.height))
          problems.push(`target FUERA del viewport (y=${Math.round(landBox.y)}, vh=${vp.height})`)
      }

      const ok = problems.length === 0
      if (!ok) fails += problems.length
      const shot = `${c.key}.${vp.name}.png`
      await page.screenshot({ path: path.join(OUT_DIR, shot) })

      console.log(`  ${ok ? '✅' : '❌'} ${c.lead}`)
      console.log(`       cartel: ${JSON.stringify((banner ?? '').replace(/\s+/g, ' ').slice(0, 110))}`)
      if (c.landTarget) console.log(`       aterrizaje "${c.landTarget}": y=${landBox ? Math.round(landBox.y) : 'null'} (viewport 0..${vp.height})`)
      for (const p of problems) console.log(`       ⚠ ${p}`)
      console.log(`       shot -> docs/proof-screenshots/b6-1/${shot}`)
    }
    await context.close()
  }

  await browser.close()
  await prisma.$disconnect()
  console.log(`\n${'═'.repeat(80)}`)
  console.log(fails === 0 ? '✅ B6.1 perceptual + geométrico: OK (ambos casos + 2 regresiones, desktop y mobile)' : `❌ B6.1: ${fails} problema(s)`)
  if (fails > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

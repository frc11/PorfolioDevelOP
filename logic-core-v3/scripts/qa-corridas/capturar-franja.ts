/**
 * P20 — Capturas de la franja del recorrido + CENSO DE DESTINOS.
 *
 * Dos cosas, y la segunda es la que prueba algo:
 *
 *  1. Las capturas de las verificaciones del sprint (cuatro momentos del
 *     recorrido, el rechazado, el pausado, el descartado, y los dos anchos).
 *  2. El CENSO DE DESTINOS: para cada una de las catorce pantallas, qué
 *     destinos `/manual/<paso>` se pueden alcanzar desde ahí con un click. Es
 *     lo que deja afirmar —comparando el brazo viejo con el nuevo— que sacar la
 *     tira de completadas no cerró ninguna puerta, en vez de prometerlo.
 *
 * Uso (con la app corriendo y la seed `v1-qa-wizard-states.ts` aplicada):
 *   FRANJA_OUT=docs/baselines/p20-destinos-despues.json \
 *   FRANJA_SHOTS=docs/proof-screenshots/p20 \
 *   npx tsx scripts/qa-corridas/capturar-franja.ts
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.FRANJA_BASE_URL ?? 'http://127.0.0.1:3010'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.FRANJA_OUT ?? null
const SHOTS_DIR = process.env.FRANJA_SHOTS ?? null

const CATORCE = [
  'm1',
  'm4',
  'm5',
  'm6',
  'mc1',
  'mc2',
  'm13',
  'm14',
  'm15',
  'm16',
  'mr',
  'espera',
  'revision',
  'archivo',
] as const
type PantallaId = (typeof CATORCE)[number]

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

/** Todo lo que la pantalla ofrece como salto a otra pantalla del manual. */
function censoDestinos() {
  const main = Array.from(document.querySelectorAll('main')).find(
    (m) => m.getBoundingClientRect().height > 0,
  )
  if (!main) return null
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = window.getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const destinos = new Set<string>()
  for (const a of Array.from(main.querySelectorAll('a[href]'))) {
    if (!visible(a)) continue
    const href = a.getAttribute('href') ?? ''
    const m = /\/manual\/([^/?#]+)$/.exec(href)
    if (m) destinos.add(m[1]!)
  }
  const nav = Array.from(
    document.querySelectorAll('main [data-slot="franja-recorrido"]'),
  ).find((n) => n.getBoundingClientRect().height > 0)
  return {
    destinos: [...destinos].sort(),
    hayFranja: Boolean(nav),
    altoFranja: nav ? Math.round(nav.getBoundingClientRect().height) : 0,
    // Lo que se LEE de verdad. `textContent` no sirve acá: devuelve también los
    // nombres que a 390 están en `display:none`, y el censo diría que la franja
    // escribe nueve nombres donde escribe dos. Se recorre nodo por nodo y se
    // descarta lo oculto — es la misma trampa que el repo ya midió al auditar
    // controles plegados.
    textoFranja: nav
      ? Array.from(nav.querySelectorAll('li'))
          .map((li) =>
            // Los hijos DIRECTOS del chip. `querySelectorAll('span')` traía
            // también al propio chip cuando no es enlace (es un `<span>`), y su
            // `textContent` incluye lo oculto: el censo se leía duplicado.
            Array.from(li.firstElementChild?.children ?? [])
              .filter((sp) => {
                const cs = window.getComputedStyle(sp)
                return cs.display !== 'none' && cs.visibility !== 'hidden'
              })
              .map((sp) => (sp.textContent || '').replace(/[\s ]+/g, ' ').trim())
              .filter(Boolean)
              .join(' '),
          )
          .join(' | ')
      : '',
  }
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true },
  })
  if (!setter) throw new Error('falta el setter de QA (setter-qa@develop.test)')

  const leads = await prisma.osLead.findMany({
    where: { businessName: { startsWith: 'QA-W' } },
    select: { id: true, businessName: true },
    orderBy: { businessName: 'asc' },
  })
  const porNombre = new Map(leads.map((l) => [l.businessName, l.id]))
  const idDe = (nombre: string) => {
    const id = porNombre.get(nombre)
    if (!id) throw new Error(`falta el lead "${nombre}" (¿corriste la seed?)`)
    return id
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const browser = await chromium.launch({
    args: ['--no-proxy-server', '--proxy-bypass-list=*'],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => {
    ;(window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f
  })
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
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ])
  const page: Page = await context.newPage()

  /** El reparto pantalla→lead, fijo por nombre: el antes y el después miden lo mismo. */
  const REPARTO: Record<PantallaId, string> = {
    m1: 'QA-W Ficha Completa',
    m4: 'QA-W Postergado Vencido',
    m5: 'QA-W Evaluada Gate Cerrado',
    m6: 'QA-W Evaluada Gate Abierto',
    mc1: 'QA-W Brief',
    mc2: 'QA-W Brief',
    m13: 'QA-W Construccion',
    m14: 'QA-W Construccion',
    m15: 'QA-W Aprobada Gate Abierto',
    m16: 'QA-W Demo Enviada',
    mr: 'QA-W Rechazada',
    espera: 'QA-W Aprobada Gate Cerrado',
    revision: 'QA-W En Revision',
    archivo: 'QA-W Descartada',
  }

  const filas: {
    pantalla: PantallaId
    lead: string
    ancho: string
    urlFinal: string
    destinos: string[]
    hayFranja: boolean
    altoFranja: number
    textoFranja: string
  }[] = []

  for (const ancho of ANCHOS) {
    await page.setViewportSize({ width: ancho.width, height: ancho.height })
    for (const pantalla of CATORCE) {
      const leadNombre = REPARTO[pantalla]
      const leadId = idDe(leadNombre)
      await page.goto(`${BASE_URL}/setter/leads/${leadId}/manual/${pantalla}`, {
        waitUntil: 'networkidle',
      })
      await page.waitForSelector('main', { timeout: 15_000 })
      await page.waitForTimeout(400)
      const g = await page.evaluate(censoDestinos)
      if (!g) throw new Error(`${pantalla}@${ancho.nombre}: no hay <main>`)
      filas.push({
        pantalla,
        lead: leadNombre,
        ancho: ancho.nombre,
        urlFinal: new URL(page.url()).pathname.split('/').pop() ?? '',
        ...g,
      })
      if (SHOTS_DIR) {
        const dir = path.resolve(SHOTS_DIR)
        fs.mkdirSync(dir, { recursive: true })
        await page.screenshot({
          path: path.join(dir, `${pantalla}-${ancho.nombre}.png`),
        })
      }
    }
  }

  // EXTRAS — los dos caminos que NO son rectos, capturados en su ATERRIZAJE
  // real: no se pide una pantalla, se pide un id retirado y la guardia lleva a
  // donde la derivación dice que está el lead. Es la misma técnica del test.
  const EXTRAS: { nombre: string; lead: string }[] = [
    { nombre: 'pausado', lead: 'QA-W Postergado Futuro' },
    { nombre: 'rechazado', lead: 'QA-W Rechazada' },
    { nombre: 'descartado', lead: 'QA-W Descartada' },
  ]
  if (SHOTS_DIR) {
    const dir = path.resolve(SHOTS_DIR)
    for (const ancho of ANCHOS) {
      await page.setViewportSize({ width: ancho.width, height: ancho.height })
      for (const extra of EXTRAS) {
        await page.goto(`${BASE_URL}/setter/leads/${idDe(extra.lead)}/manual/m3`, {
          waitUntil: 'networkidle',
        })
        await page.waitForSelector('main', { timeout: 15_000 })
        await page.waitForTimeout(400)
        const aterrizaje = new URL(page.url()).pathname.split('/').pop()
        await page.screenshot({
          path: path.join(dir, `extra-${extra.nombre}-${ancho.nombre}.png`),
        })
        console.log(`extra ${extra.nombre}@${ancho.nombre} -> aterrizó en ${aterrizaje}`)
      }
    }
  }

  await browser.close()
  await prisma.$disconnect()

  for (const ancho of ANCHOS) {
    console.log(`\n=== ${ancho.nombre} px ${'='.repeat(80)}`)
    for (const f of filas.filter((x) => x.ancho === ancho.nombre)) {
      console.log(
        `${f.pantalla.padEnd(9)} franja=${f.hayFranja ? 'si' : 'NO'} alto=${String(
          f.altoFranja,
        ).padStart(3)}  destinos=[${f.destinos.join(' ')}]`,
      )
    }
    const conFranja = filas.filter((x) => x.ancho === ancho.nombre && x.hayFranja).length
    console.log(`  -> franja presente en ${conFranja}/${CATORCE.length}`)
  }
  console.log('\nTexto de la franja a 390 (lo que se LEE):')
  for (const f of filas.filter((x) => x.ancho === '390')) {
    console.log(`  ${f.pantalla.padEnd(9)} ${f.textoFranja}`)
  }

  if (OUT_JSON) {
    const out = path.resolve(OUT_JSON)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, JSON.stringify({ base: BASE_URL, filas }, null, 2))
    console.log(`\nJSON -> ${out}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

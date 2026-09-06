/**
 * P21 — La corrida de verificación, operando la aplicación.
 *
 * Cubre lo que el instrumento de medición no puede decir por sí solo:
 *   A. una demo APROBADA y un RECHAZO: aparecen en la cola y ya NO en novedades;
 *   B. el foco anclado y soltado (el control que hasta hoy no existía);
 *   C. un setter SIN trabajo pendiente: qué ve cuando la cola está vacía.
 *
 * Siembra sus propios setters y leads (prefijo `P21-CORRIDA`) y los BORRA al
 * final, pase lo que pase. No toca la cartera del persona QA ni la de Franco.
 *
 * Uso: CORRIDA_BASE_URL=http://127.0.0.1:3020 npx tsx scripts/qa-corridas/_p21-corrida.ts
 */
import path from 'path'
import fs from 'fs'
import { chromium, type BrowserContext, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.CORRIDA_BASE_URL ?? 'http://127.0.0.1:3020'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const SHOTS = path.resolve(process.env.CORRIDA_SHOTS ?? 'docs/proof-screenshots/p21/corrida')

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

const TAG = 'P21-CORRIDA'
const APROBADA = `${TAG} Panaderia Aprobada`
const RECHAZADA = `${TAG} Ferreteria Rechazada`
const SALIENTE = `${TAG} Kiosco Reasignado`
const EN_VUELO = `${TAG} Optica En Revision`

async function sesion(context: BrowserContext, userId: string, email: string) {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: 8 * 60 * 60,
    token: {
      sub: userId,
      email,
      name: email,
      picture: null,
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })
  await context.clearCookies()
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
}

/** Censo de dónde se nombra cada negocio: cola vs novedades. */
async function censo(page: Page, nombres: string[]) {
  return page.evaluate((lista) => {
    const main = document.querySelector('main')
    if (!main) return null
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return false
      const cs = window.getComputedStyle(el)
      return cs.visibility !== 'hidden' && cs.display !== 'none'
    }
    const cola = main.querySelector('section[aria-label="Tu cola de hoy"]')
    const novedades = main.querySelector('section[aria-label="Novedades de tu cartera"]')
    const unidades = (raiz: Element | null, sel: string) =>
      raiz ? Array.from(raiz.querySelectorAll(sel)).filter(visible) : []

    const enCola = unidades(cola, 'section[aria-label="Tu foco ahora"], [data-slot="item-cola"]')
    const enNovedades = unidades(novedades, 'li')

    const out: Record<string, { cola: number; novedades: number }> = {}
    for (const nombre of lista) {
      out[nombre] = {
        cola: enCola.filter((el) => (el.textContent || '').includes(nombre)).length,
        novedades: enNovedades.filter((el) => (el.textContent || '').includes(nombre)).length,
      }
    }
    return {
      porNegocio: out,
      unidadesCola: enCola.length,
      filasNovedades: enNovedades.length,
      hayCola: Boolean(cola),
      hayEnEspera: Boolean(main.querySelector('section[aria-label="Nada para trabajar ahora"]')),
      soltar: Array.from(main.querySelectorAll('button'))
        .filter(visible)
        .filter((el) => /soltar/i.test((el.textContent || '').trim())).length,
    }
  }, nombres)
}

async function tirar(page: Page, nombre: string) {
  fs.mkdirSync(SHOTS, { recursive: true })
  await page.screenshot({ path: path.join(SHOTS, `${nombre}.png`) })
  console.log(`   captura -> ${nombre}.png`)
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const creados = { users: [] as string[], leads: [] as string[] }

  const browser = await chromium.launch({
    args: ['--no-proxy-server', '--proxy-bypass-list=*'],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => {
    ;(window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f
  })
  const page = await context.newPage()

  try {
    // ── Siembra ──────────────────────────────────────────────────────────────
    const conTrabajo = await prisma.user.create({
      data: {
        email: `p21-corrida-trabajo-${Date.now()}@develop.test`,
        name: 'P21 Con Trabajo',
        role: 'SETTER',
        passwordResetRequired: false,
      },
      select: { id: true, email: true },
    })
    creados.users.push(conTrabajo.id)

    const sinTrabajo = await prisma.user.create({
      data: {
        email: `p21-corrida-espera-${Date.now()}@develop.test`,
        name: 'P21 Sin Trabajo',
        role: 'SETTER',
        passwordResetRequired: false,
      },
      select: { id: true, email: true },
    })
    creados.users.push(sinTrabajo.id)

    const ficha = {
      web: 'https://ejemplo.test',
      instagram: '@ejemplo',
      resenas: 12,
      observaciones: 'sembrado por la corrida P21',
    }
    const evaluacion = { score: 4, veredicto: 'CALIENTE', fecha: new Date().toISOString() }
    const brief = { objetivo: 'turnos', tono: 'cercano', secciones: ['hero'] }

    const aprobada = await prisma.osLead.create({
      data: {
        businessName: APROBADA,
        industry: 'gastronomia',
        zone: 'Centro',
        status: 'RESPONDIO',
        assignedToId: conTrabajo.id,
        dossier: {
          create: {
            stage: 'APROBADA',
            fichaJson: ficha,
            evaluacionJson: evaluacion,
            briefJson: brief,
            draftUrl: 'https://p21-draft.example.com',
            aprobadaAt: new Date(),
            finalUrl: 'https://p21-final.example.com',
          },
        },
      },
      select: { id: true },
    })
    creados.leads.push(aprobada.id)

    const rechazada = await prisma.osLead.create({
      data: {
        businessName: RECHAZADA,
        industry: 'retail',
        zone: 'Norte',
        status: 'RESPONDIO',
        assignedToId: conTrabajo.id,
        dossier: {
          create: {
            stage: 'RECHAZADA',
            fichaJson: ficha,
            evaluacionJson: evaluacion,
            briefJson: brief,
            draftUrl: 'https://p21-draft2.example.com',
            rechazos: [
              { fecha: new Date().toISOString(), motivo: 'El hero no dice qué vende', donde: 'hero' },
            ],
          },
        },
      },
      select: { id: true },
    })
    creados.leads.push(rechazada.id)

    // En vuelo: le toca a Franco (no es trabajo del setter).
    const enVuelo = await prisma.osLead.create({
      data: {
        businessName: EN_VUELO,
        industry: 'salud',
        zone: 'Sur',
        status: 'RESPONDIO',
        assignedToId: sinTrabajo.id,
        dossier: {
          create: {
            stage: 'EN_REVISION',
            fichaJson: ficha,
            evaluacionJson: evaluacion,
            briefJson: brief,
            draftUrl: 'https://p21-draft3.example.com',
          },
        },
      },
      select: { id: true },
    })
    creados.leads.push(enVuelo.id)

    // Los tres avisos: dos que son TRABAJO (su lead entra a la cola) y uno que
    // es NOTICIA (sin lead: el setter ya no es dueño).
    await prisma.osSetterNotice.createMany({
      data: [
        {
          setterId: conTrabajo.id,
          leadId: aprobada.id,
          kind: 'DEMO_APROBADA',
          title: 'Franco aprobó tu demo',
          body: `${APROBADA}: la demo está aprobada. Enviá el link ya, recién aprobada.`,
        },
        {
          setterId: conTrabajo.id,
          leadId: rechazada.id,
          kind: 'DEMO_RECHAZADA',
          title: 'Franco pidió cambios',
          body: `${RECHAZADA}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
        },
        {
          setterId: conTrabajo.id,
          leadId: null,
          kind: 'LEAD_REASIGNADO_SALIENTE',
          title: 'Te reasignaron un lead',
          body: `${SALIENTE} pasó a otro setter. Ya no está en tu cartera.`,
        },
      ],
    })

    // ── A. La aprobada y el rechazo: en la cola, no en novedades ─────────────
    await sesion(context, conTrabajo.id, conTrabajo.email)
    for (const ancho of ANCHOS) {
      await page.setViewportSize({ width: ancho.width, height: ancho.height })
      await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      const r = await censo(page, [APROBADA, RECHAZADA, SALIENTE])
      console.log(`\nA · ${ancho.nombre} — ${JSON.stringify(r, null, 0)}`)
      await tirar(page, `A-cola-${ancho.nombre}`)
      // Y la parte de abajo: novedades con lo que sigue siendo noticia.
      await page.evaluate(() => {
        const n = document.querySelector('section[aria-label="Novedades de tu cartera"]')
        if (n) n.scrollIntoView({ block: 'start' })
      })
      await page.waitForTimeout(250)
      await tirar(page, `A-novedades-${ancho.nombre}`)
    }

    // ── B. El foco anclado y soltado ─────────────────────────────────────────
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    const antesDeAnclar = await censo(page, [])
    console.log(`\nB · sin anclar — botones "Soltar": ${antesDeAnclar?.soltar}`)
    await tirar(page, 'B-1-sin-anclar')

    // Anclar: el botón "Trabajar" de la SEGUNDA fila (ancla + navega).
    await page.locator('[data-slot="item-cola"]').first().getByRole('button').click()
    await page.waitForURL(/\/setter\/leads\//, { timeout: 20_000 })
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const anclado = await censo(page, [])
    const chip = await page.getByText('Fijado mientras lo trabajás').isVisible().catch(() => false)
    console.log(`B · anclado — botones "Soltar": ${anclado?.soltar} · chip sticky visible: ${chip}`)
    await tirar(page, 'B-2-anclado')

    // Soltar.
    await page.getByRole('button', { name: /^Soltar$/ }).click()
    await page.waitForTimeout(1200)
    const toast = await page
      .getByText(/Soltado — el foco vuelve al primero de tu cola/)
      .isVisible()
      .catch(() => false)
    await tirar(page, 'B-3-soltando')
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const soltado = await censo(page, [])
    const chipDespues = await page
      .getByText('Fijado mientras lo trabajás')
      .isVisible()
      .catch(() => false)
    console.log(
      `B · soltado — botones "Soltar": ${soltado?.soltar} · chip sticky visible: ${chipDespues} · acuse: ${toast}`,
    )
    await tirar(page, 'B-4-soltado')

    // ── C. Un setter sin trabajo pendiente ───────────────────────────────────
    await sesion(context, sinTrabajo.id, sinTrabajo.email)
    for (const ancho of ANCHOS) {
      await page.setViewportSize({ width: ancho.width, height: ancho.height })
      await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)
      const r = await censo(page, [EN_VUELO])
      const texto = await page
        .locator('section[aria-label="Nada para trabajar ahora"]')
        .innerText()
        .catch(() => '(sin bloque)')
      console.log(
        `\nC · ${ancho.nombre} — hayCola=${r?.hayCola} hayEnEspera=${r?.hayEnEspera}\n   texto: ${texto.replace(/\s+/g, ' ').slice(0, 220)}`,
      )
      await tirar(page, `C-sin-trabajo-${ancho.nombre}`)
    }
  } finally {
    await browser.close()
    // Borrado de lo sembrado por ESTA corrida, por id exacto. Orden: avisos →
    // leads (el dossier cae en cascada) → usuarios.
    const { prisma } = await import('../../src/lib/prisma')
    if (creados.users.length > 0) {
      await prisma.osSetterNotice.deleteMany({ where: { setterId: { in: creados.users } } })
    }
    if (creados.leads.length > 0) {
      await prisma.osLead.deleteMany({ where: { id: { in: creados.leads } } })
    }
    if (creados.users.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: creados.users } } })
    }
    console.log(
      `\nlimpieza: ${creados.leads.length} leads y ${creados.users.length} usuarios borrados`,
    )
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

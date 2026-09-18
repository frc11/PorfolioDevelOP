/**
 * P40 — Verificación operando la aplicación: el brief en cuatro vueltas, a 1440 y
 * a 390, con capturas.
 *
 * Siembra SUS leads (tracker de la suite) y los borra por id en `finally`. Recorre:
 *   1. las cuatro vueltas (cada una trae la anterior, el documento leído, los
 *      campos completados, volver atrás, guardar);
 *   2. un documento sin encabezado; 3. uno al que le falta PALETA;
 *   4. un brief viejo que abre y guarda; 5. el bloque de construcción con los tres
 *      campos; 6. «El brief pedía» en m14; 7. la revisión de Franco.
 *
 * Las capturas de «lo que ve el setter» son del viewport tal cual. La del
 * recorrido entero agranda el viewport al alto del scroller: el shell es
 * `fixed inset-0` y `fullPage` mentiría.
 *
 * Uso: CAPT_BASE=http://127.0.0.1:3040 npx tsx scripts/p40-capturas.mts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium, type Browser, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import {
  DOCUMENTO_COMPLETO,
  DOCUMENTO_SIN_ENCABEZADO,
  DOCUMENTO_SIN_PALETA,
  VALORES_ENCABEZADO,
  VUELTA_DECISIONES,
  VUELTA_ESPECIFICACION,
  VUELTA_LECTURA,
} from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const BASE = process.env.CAPT_BASE ?? 'http://127.0.0.1:3040'
const OUT = 'docs/p40-brief/capturas'
const COOKIE = '__Secure-authjs.session-token'
const ANCHOS = [
  ['1440', 1440, 900],
  ['390', 390, 844],
] as const
const CABECERAS = ['1 · Lectura estética', '2 · Decisiones', '3 · Especificación', '4 · Caza de huecos'] as const

const hallazgos: Record<string, unknown> = {}
const anotar = (clave: string, valor: unknown) => {
  hallazgos[clave] = valor
  console.log(`  ${clave}: ${typeof valor === 'string' ? valor : JSON.stringify(valor)}`)
}

async function contexto(browser: Browser, email: string, role: 'SETTER' | 'SUPER_ADMIN', w: number, h: number) {
  const { prisma } = await import('../tests/helpers/setter-db.ts')
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } })
  const token = await encode({
    secret: process.env.AUTH_SECRET!,
    salt: COOKIE,
    maxAge: 60 * 60,
    token: {
      sub: user.id,
      email,
      name: email,
      picture: null,
      role,
      provider: 'qa-bypass',
      onboardingCompleted: role === 'SUPER_ADMIN',
      passwordResetRequired: false,
    },
  })
  const ctx = await browser.newContext({ viewport: { width: w, height: h } })
  await ctx.addCookies([
    { name: COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
  return ctx
}

const campo = (page: Page, label: string) =>
  page
    .locator(`xpath=//label[contains(normalize-space(.), "${label}")]/parent::div//*[self::input or self::textarea][1]`)
    .filter({ visible: true })
    .first()
const cabecera = (page: Page, nombre: string) => page.getByRole('button', { name: nombre }).filter({ visible: true }).first()
const abierta = async (page: Page, nombre: string) => (await cabecera(page, nombre).getAttribute('aria-expanded')) === 'true'

async function esperar(cond: () => Promise<boolean>, que: string, ms = 15_000) {
  const hasta = Date.now() + ms
  while (Date.now() < hasta) {
    if (await cond()) return
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error(`no se cumplió: ${que}`)
}

/** Pegar en un campo de vuelta y esperar a que la pantalla lo tenga (reintenta si llegó antes de hidratar). */
async function pegar(page: Page, label: string, texto: string, cabeceraIdx: number | null) {
  for (let intento = 0; intento < 10; intento++) {
    await campo(page, label).fill(texto)
    if (cabeceraIdx === null) return
    try {
      await esperar(async () => (await cabecera(page, CABECERAS[cabeceraIdx]).innerText()).includes('Pegada') || (await cabecera(page, CABECERAS[cabeceraIdx]).innerText()).includes('Documento pegado'), 'pegado', 1_000)
      return
    } catch {
      /* antes de hidratar: se reintenta */
    }
  }
  throw new Error(`no se pudo pegar en ${label}`)
}

async function abrirVuelta(page: Page, idx: number) {
  for (let intento = 0; intento < 10; intento++) {
    await cabecera(page, CABECERAS[idx]).click()
    try {
      await esperar(() => abierta(page, CABECERAS[idx]), `abrir ${CABECERAS[idx]}`, 1_000)
      return
    } catch {
      /* reintento */
    }
  }
  throw new Error(`no abrió ${CABECERAS[idx]}`)
}

async function captura(page: Page, nombre: string) {
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}/${nombre}.png` })
}

/** Centrar un elemento en el scroller: con `scrollIntoViewIfNeeded` queda pegado al borde, debajo de la barra. */
async function centrar(locator: ReturnType<Page['locator']>) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await locator.page().waitForTimeout(200)
}

/** El Registro entero: el viewport crece al alto del scroller y se captura la sección. */
async function capturaEntera(page: Page, nombre: string, w: number, h: number) {
  const alto = await page.evaluate(() => {
    const main = Array.from(document.querySelectorAll('main')).find((m) => m.getBoundingClientRect().height > 0)
    return main ? Math.ceil(main.getBoundingClientRect().top + main.scrollHeight + 40) : 0
  })
  await page.setViewportSize({ width: w, height: Math.min(Math.max(alto, h), 12_000) })
  await page.waitForTimeout(400)
  await page.locator('main section[aria-label="Registro"]').filter({ visible: true }).first().screenshot({ path: `${OUT}/${nombre}.png` })
  await page.setViewportSize({ width: w, height: h })
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const db = await import('../tests/helpers/setter-db.ts')
  const tracker = db.newTracker()
  const setterId = (await db.getSetterQa()).id
  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })

  try {
    for (const [tag, w, h] of ANCHOS) {
      console.log(`\n── ${tag} ──`)
      const ctx = await contexto(browser, 'setter-qa@develop.test', 'SETTER', w, h)
      const page = await ctx.newPage()
      page.on('dialog', (d) => d.accept().catch(() => undefined))

      // ── 1 · Las cuatro vueltas ─────────────────────────────────────────────
      const a = await db.createLead(tracker, { setterId, businessName: `P40 capturas ${tag}`, stage: 'EVALUADA', status: 'RESPONDIO' })
      await page.goto(`${BASE}/setter/leads/${a.id}/manual/m6`, { waitUntil: 'networkidle' })
      await cabecera(page, CABECERAS[0]).waitFor({ state: 'visible' })
      await cabecera(page, CABECERAS[0]).scrollIntoViewIfNeeded()
      await captura(page, `01-${tag}-vuelta1-abierta`)
      anotar(`${tag}.vueltaAlEntrar`, (await abierta(page, CABECERAS[0])) ? CABECERAS[0] : 'otra')

      await pegar(page, 'Lo que devolvió el Gem — vuelta 1', VUELTA_LECTURA, 0)
      await campo(page, 'Lo que corregiste — vuelta 1').fill('El logo es blanco, no crema.')
      await campo(page, 'Título del brief').focus()
      await esperar(() => abierta(page, CABECERAS[1]), 'se abre la vuelta 2 sola')
      const region2 = page.getByRole('region', { name: CABECERAS[1] }).filter({ visible: true }).first()
      await region2.getByText(/Ver el texto que vas a copiar/).click()
      const pre2 = region2.locator('details[open] pre').first()
      await pre2.scrollIntoViewIfNeeded()
      await captura(page, `02-${tag}-vuelta2-trae-la-lectura`)
      const texto2 = await pre2.innerText()
      anotar(`${tag}.mensajeVuelta2TraeLaLectura`, texto2.includes('MUNDO VISUAL') && texto2.includes('Mis correcciones:'))

      await pegar(page, 'Lo que devolvió el Gem — vuelta 2', VUELTA_DECISIONES, 1)
      await campo(page, 'Título del brief').focus()
      await esperar(() => abierta(page, CABECERAS[2]), 'vuelta 3')
      await pegar(page, 'Lo que devolvió el Gem — vuelta 3', VUELTA_ESPECIFICACION, 2)
      await campo(page, 'Título del brief').focus()
      await esperar(() => abierta(page, CABECERAS[3]), 'vuelta 4')
      await pegar(page, 'El documento definitivo — vuelta 4', DOCUMENTO_COMPLETO, 3)
      const lectura = page.locator('section[aria-label="Lo que leí del documento"]').filter({ visible: true }).first()
      await lectura.waitFor({ state: 'visible' })
      await centrar(lectura)
      await captura(page, `03-${tag}-documento-leido`)
      anotar(`${tag}.lecturaCompleta`, (await lectura.innerText()).replace(/\s+/g, ' '))
      anotar(`${tag}.cabecera4`, (await cabecera(page, CABECERAS[3]).innerText()).replace(/\s+/g, ' '))

      await centrar(campo(page, 'Secciones de la demo'))
      await captura(page, `04-${tag}-campos-completados`)
      anotar(`${tag}.camposCompletados`, {
        secciones: (await campo(page, 'Secciones de la demo').inputValue()) === VALORES_ENCABEZADO.SECCIONES.join('\n'),
        tono: (await campo(page, 'Tono').inputValue()) === VALORES_ENCABEZADO.TONO,
        paleta: (await campo(page, 'Paleta').inputValue()) === VALORES_ENCABEZADO.PALETA,
        tipografia: (await campo(page, 'Tipografía').inputValue()) === VALORES_ENCABEZADO.TIPOGRAFIA,
        cta: (await campo(page, 'Llamado a la acción (CTA)').inputValue()) === VALORES_ENCABEZADO.CTA,
      })

      await abrirVuelta(page, 0)
      await cabecera(page, CABECERAS[0]).scrollIntoViewIfNeeded()
      await captura(page, `05-${tag}-volver-a-la-vuelta-1`)
      anotar(`${tag}.volverConservaLoPegado`, (await campo(page, 'Lo que devolvió el Gem — vuelta 1').inputValue()) === VUELTA_LECTURA)

      await capturaEntera(page, `06-${tag}-recorrido-entero`, w, h)

      await page.getByRole('button', { name: 'Guardar brief' }).filter({ visible: true }).first().click()
      await esperar(async () => (await db.getDossier(a.id))?.stage === 'BRIEF', 'guardado en BRIEF')
      await page.goto(`${BASE}/setter/leads/${a.id}/manual/m6`, { waitUntil: 'networkidle' })
      await page.getByText('Quedó genérico — re-pegar').filter({ visible: true }).first().waitFor({ state: 'visible' })
      await captura(page, `07-${tag}-guardado-consulta`)

      // ── 2 y 3 · Sin encabezado, y falta PALETA ─────────────────────────────
      for (const [nombre, doc] of [
        ['08', DOCUMENTO_SIN_ENCABEZADO, 'sin-encabezado'],
        ['09', DOCUMENTO_SIN_PALETA, 'falta-paleta'],
      ] as const) {
        const lead = await db.createLead(tracker, { setterId, businessName: `P40 ${nombre} ${tag}`, stage: 'EVALUADA', status: 'RESPONDIO' })
        await page.goto(`${BASE}/setter/leads/${lead.id}/manual/m6`, { waitUntil: 'networkidle' })
        await cabecera(page, CABECERAS[0]).waitFor({ state: 'visible' })
        await abrirVuelta(page, 3)
        await pegar(page, 'El documento definitivo — vuelta 4', doc, 3)
        const aviso = page.locator('section[aria-label="Lo que leí del documento"]').filter({ visible: true }).first()
        await aviso.waitFor({ state: 'visible' })
        await centrar(aviso)
        const etiqueta = nombre === '08' ? 'sin-encabezado' : 'falta-paleta'
        await captura(page, `${nombre}-${tag}-${etiqueta}`)
        anotar(`${tag}.${etiqueta}`, (await aviso.innerText()).replace(/\s+/g, ' '))
        anotar(`${tag}.${etiqueta}.cabecera4`, (await cabecera(page, CABECERAS[3]).innerText()).replace(/\s+/g, ' '))
      }

      // ── 4 · Un brief viejo ─────────────────────────────────────────────────
      const viejo = await db.createLead(tracker, { setterId, businessName: `P40 viejo ${tag}`, stage: 'BRIEF', status: 'RESPONDIO' })
      await page.goto(`${BASE}/setter/leads/${viejo.id}/manual/m6`, { waitUntil: 'networkidle' })
      const repegar = page.getByRole('button', { name: /Quedó genérico — re-pegar/ }).filter({ visible: true }).first()
      await repegar.waitFor({ state: 'visible' })
      await captura(page, `10-${tag}-brief-viejo-abre`)
      for (let intento = 0; intento < 10 && !(await cabecera(page, CABECERAS[0]).isVisible()); intento++) {
        if (await repegar.isVisible()) await repegar.click()
        await page.waitForTimeout(400)
      }
      await campo(page, 'Llamado a la acción (CTA)').fill('Pedí tu turno por WhatsApp')
      await esperar(async () => ((await db.getDossier(viejo.id))?.briefJson as { cta?: string } | null)?.cta === 'Pedí tu turno por WhatsApp', 'autoguardado del brief viejo', 20_000)
      await campo(page, 'Llamado a la acción (CTA)').scrollIntoViewIfNeeded()
      await captura(page, `11-${tag}-brief-viejo-guardado`)
      anotar(`${tag}.briefViejoClaves`, Object.keys(((await db.getDossier(viejo.id))?.briefJson ?? {}) as object).sort())

      // ── 5 · El bloque de construcción ──────────────────────────────────────
      const briefNuevo = {
        titulo: 'Barbería El Faro',
        concepto: VALORES_ENCABEZADO.ANGULO,
        secciones: [...VALORES_ENCABEZADO.SECCIONES],
        cta: VALORES_ENCABEZADO.CTA,
        tono: VALORES_ENCABEZADO.TONO,
        paleta: VALORES_ENCABEZADO.PALETA,
        tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
        documento: DOCUMENTO_COMPLETO,
        vueltas: { lectura: { respuesta: VUELTA_LECTURA }, decisiones: { respuesta: VUELTA_DECISIONES } },
      }
      const bloque = await db.createLead(tracker, { setterId, businessName: `P40 bloque ${tag}`, stage: 'BRIEF', status: 'RESPONDIO' })
      await db.prisma.osLeadDossier.update({ where: { leadId: bloque.id }, data: { briefJson: briefNuevo } })
      await page.goto(`${BASE}/setter/leads/${bloque.id}/manual/mc1`, { waitUntil: 'networkidle' })
      const contexto1 = page.locator('main [aria-label="Contexto del lead"]').filter({ visible: true }).first()
      await contexto1.getByText(/Ver el texto que vas a copiar/).click()
      const pre = contexto1.locator('details[open] pre').first()
      await pre.waitFor({ state: 'visible' })
      await centrar(pre)
      await pre.evaluate((el) => {
        // Lleva el scroll interno del preview hasta la línea de la primera sección
        // nueva: el `<pre>` tiene alto máximo y arranca arriba de todo.
        const lineas = (el.textContent ?? '').split('\n')
        const indice = lineas.findIndex((l) => l.startsWith('TONO ('))
        if (indice < 0) return
        const alto = parseFloat(getComputedStyle(el).lineHeight) || 18
        el.scrollTop = Math.max(0, indice * alto - alto * 3)
      })
      await captura(page, `12-${tag}-bloque-construccion`)
      const textoBloque = await pre.innerText()
      anotar(`${tag}.bloqueLlevaLosTres`, ['TONO (', 'PALETA (', 'TIPOGRAFÍA ('].map((t) => textoBloque.includes(t)))

      // ── 6 · m14 ────────────────────────────────────────────────────────────
      const chequeo = await db.createLead(tracker, { setterId, businessName: `P40 m14 ${tag}`, stage: 'CONSTRUCCION', status: 'RESPONDIO', draftUrl: 'https://p40-draft.netlify.app' })
      await db.prisma.osLeadDossier.update({ where: { leadId: chequeo.id }, data: { briefJson: briefNuevo } })
      await page.goto(`${BASE}/setter/leads/${chequeo.id}/manual/m14`, { waitUntil: 'networkidle' })
      const pedia = page.getByText('El brief pedía').filter({ visible: true }).first()
      await pedia.waitFor({ state: 'visible' })
      await centrar(pedia)
      await captura(page, `13-${tag}-m14-el-brief-pedia`)
      await ctx.close()

      // ── 7 · La revisión de Franco ──────────────────────────────────────────
      const revision = await db.createLead(tracker, { setterId, businessName: `P40 revision ${tag}`, stage: 'BRIEF', status: 'RESPONDIO' })
      await db.prisma.osLeadDossier.update({ where: { leadId: revision.id }, data: { stage: 'EN_REVISION', briefJson: briefNuevo } })
      const admin = await contexto(browser, 'admin@develop.com', 'SUPER_ADMIN', w, h)
      const pageAdmin = await admin.newPage()
      await pageAdmin.goto(`${BASE}/admin/leados/${revision.id}`, { waitUntil: 'networkidle' })
      const panel = pageAdmin.getByText('Brief de diseño').filter({ visible: true }).first()
      await panel.waitFor({ state: 'visible' })
      await pageAdmin.getByText(VALORES_ENCABEZADO.PALETA).filter({ visible: true }).first().scrollIntoViewIfNeeded()
      await captura(pageAdmin, `14-${tag}-revision-franco`)
      anotar(`${tag}.revisionSinFaltanteFalso`, (await pageAdmin.getByText('Sin la respuesta del Gem de diseño').filter({ visible: true }).count()) === 0)
      await admin.close()
    }
  } finally {
    await browser.close()
    await db.teardown(tracker)
    console.log(`\nlimpieza: ${tracker.leadIds.length} leads borrados por id`)
    await db.disconnect()
    writeFileSync(`${OUT}/hallazgos.json`, JSON.stringify(hallazgos, null, 2))
  }
  console.log(`\nCapturas en ${OUT}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

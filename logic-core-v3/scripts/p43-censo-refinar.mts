/**
 * P43 · EL CENSO DE «REFINAR» (mc2) EN PANTALLA — solo lectura. Branch Neon dev.
 *
 * Qué muestra hoy la pantalla, leído del DOM y fotografiado, para el censo del
 * sprint de mc2: cuántas cosas se copian y cuáles, dónde viven los tildes y cómo
 * se llaman, si está el badge, dónde aparece la explicación del auto-reporte,
 * qué puntos lista la munición y qué dice la guía de la herramienta.
 *
 * NO siembra ni escribe: abre mc2 con dos leads de la seed de QA que ya existen
 * (uno en CONSTRUCCION, con los tildes vivos, y uno en BRIEF, el que usa el
 * instrumento del pliegue) y no toca ningún control. Lee el conjunto de la
 * pantalla en UN solo `evaluate` (ver la sonda de P42: una lectura en serie
 * puede juntar estados que el DOM nunca tuvo).
 *
 * Uso (con el build corriendo con QA_ALLOW_LOCALHOST=1):
 *   CENSO_BASE_URL=http://127.0.0.1:3003 CENSO_OUT=C:/tmp/p43-refinar/censo-pantalla \
 *   npx tsx scripts/p43-censo-refinar.mts
 */
import fs from 'fs'
import path from 'path'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.CENSO_BASE_URL ?? 'http://127.0.0.1:3003'
const OUT = process.env.CENSO_OUT ?? 'C:/tmp/p43-refinar/censo-pantalla'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const QA_EMAIL = 'setter-qa@develop.test'

const LEADS = [
  { clave: 'construccion', nombre: 'QA-W Construccion' },
  { clave: 'brief', nombre: 'QA-W Brief' },
] as const

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

/** Todo lo que la pantalla ofrece, en una sola lectura. Se pasa como función. */
function leerPantalla() {
  const main = document.querySelector('main')
  if (!main) return null
  const texto = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
  const zona = (etiqueta: string) => main.querySelector(`section[aria-label="${etiqueta}"]`)
  const contexto = zona('Contexto del lead')
  const municion = zona('Munición')
  const registro = zona('Registro')

  const botonesCopiar = [...main.querySelectorAll('button')].filter((b) =>
    /Copiar bloque|Copiado/.test(texto(b)),
  )
  const copiables = botonesCopiar.map((b) => {
    const tarjeta = b.closest('div.rounded-2xl') ?? b.parentElement
    const titulo = tarjeta?.querySelector('p.text-xs.font-semibold')
    const instruccion = tarjeta?.querySelector('p.text-xs.text-zinc-500')
    const resumen = tarjeta?.querySelector('details > summary')
    const pre = tarjeta?.querySelector('pre')
    const enZona = b.closest('section[aria-label]')?.getAttribute('aria-label') ?? null
    const grupoFase = b.closest('section[aria-label]:not([aria-label="Munición"])')
    return {
      zona: enZona === 'Munición' || enZona === 'Contexto del lead' || enZona === 'Registro' ? enZona : (b.closest('section[aria-label="Munición"]') ? 'Munición' : enZona),
      fase: grupoFase && grupoFase !== contexto && grupoFase !== municion ? grupoFase.getAttribute('aria-label') : null,
      titulo: texto(titulo ?? null),
      instruccion: texto(instruccion ?? null),
      plegable: texto(resumen ?? null),
      caracteres: pre?.textContent?.length ?? null,
      // Lo que se copia es el texto del `<pre>` (CopyBlock copia la misma prop).
      traeInstrucciones: pre?.textContent?.includes('1 de 3 · INSTRUCCIONES') ?? null,
      traePiso: pre?.textContent?.includes('PISO DE CALIDAD') ?? null,
    }
  })

  const tildes = registro
    ? [...registro.querySelectorAll('button[aria-pressed]')].map((b) => ({
        nombre: b.getAttribute('aria-label') ?? texto(b),
        pulsado: b.getAttribute('aria-pressed'),
        deshabilitado: (b as HTMLButtonElement).disabled,
        textoVisible: texto(b),
      }))
    : []

  const gruposDeFase = municion
    ? [...municion.querySelectorAll('section[aria-label]')].map((s) => ({
        fase: s.getAttribute('aria-label'),
        puntos: [...s.querySelectorAll('ul > li')].map((li) => texto(li)),
        prompts: [...s.querySelectorAll('button')].filter((b) => /Copiar bloque/.test(texto(b))).length,
      }))
    : []

  const parrafosAutoReporte = [...main.querySelectorAll('p')]
    .filter((p) => /auto-reporte/i.test(texto(p)))
    .map((p) => ({
      texto: texto(p),
      dentroDe:
        p.closest('nav')?.getAttribute('aria-label') ??
        p.closest('section[aria-label]')?.getAttribute('aria-label') ??
        null,
    }))

  const instruccion = main.querySelector('[aria-label="Instrucción de esta pantalla"]')
  return {
    titulo: texto(instruccion?.querySelector('h2') ?? null),
    bajada: texto(instruccion?.querySelector('p.max-w-xl') ?? null),
    zonas: {
      contexto: Boolean(contexto),
      municion: Boolean(municion),
      registro: Boolean(registro),
    },
    copiables,
    totalCopiar: botonesCopiar.length,
    contextoCopiable: contexto ? [...contexto.querySelectorAll('button')].some((b) => /Copiar bloque/.test(texto(b))) : false,
    badgeProvisorio: /Guía preliminar — en validación/.test(texto(main)),
    gruposDeFase,
    tildes,
    parrafosAutoReporte,
    // `ToolGuide` no tiene atributo propio: se lo encuentra por el título de su plegable.
    guiaHerramienta:
      texto(
        [...main.querySelectorAll('summary')]
          .find((s) => /Ver para qué sirve, qué le das y qué te devuelve/.test(texto(s)))
          ?.closest('div.rounded-xl') ?? null,
      ) || null,
    textoMunicion: municion ? texto(municion) : null,
    textoRegistro: registro ? texto(registro) : null,
    navConstruccion: texto(main.querySelector('nav[aria-label^="Fases de la construcción"]')),
  }
}

async function capturaEntera(page: Page, archivo: string, w: number, h: number) {
  const alto = await page.evaluate(() => {
    const m = document.querySelector('main')
    return m ? Math.ceil(m.getBoundingClientRect().top + m.scrollHeight + 40) : 0
  })
  await page.setViewportSize({ width: w, height: Math.min(Math.max(alto, h), 16_000) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT, archivo) })
  await page.setViewportSize({ width: w, height: h })
  return alto
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const { prisma } = await import('../src/lib/prisma')

  const setter = await prisma.user.findUnique({ where: { email: QA_EMAIL }, select: { id: true } })
  if (!setter) throw new Error(`falta el setter de QA (${QA_EMAIL})`)
  const leads = await prisma.osLead.findMany({
    where: { businessName: { in: LEADS.map((l) => l.nombre) } },
    select: { id: true, businessName: true, dossier: { select: { stage: true, progresoJson: true } } },
  })
  await prisma.$disconnect()

  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => {
    ;(window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f
  })
  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: 60 * 60,
    token: {
      sub: setter.id,
      email: QA_EMAIL,
      name: QA_EMAIL,
      picture: null,
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })
  await context.addCookies([
    { name: SESSION_COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
  const page = await context.newPage()

  const hallazgos: Record<string, unknown> = { medidoEn: new Date().toISOString(), base: BASE_URL }
  for (const def of LEADS) {
    const lead = leads.find((l) => l.businessName === def.nombre)
    if (!lead) {
      hallazgos[def.clave] = { error: `no está el lead «${def.nombre}» en la seed` }
      continue
    }
    for (const ancho of ANCHOS) {
      await page.setViewportSize({ width: ancho.width, height: ancho.height })
      await page.goto(`${BASE_URL}/setter/leads/${lead.id}/manual/mc2`, { waitUntil: 'networkidle' })
      await page.locator('main h2').first().waitFor()
      const lectura = await page.evaluate(leerPantalla)
      const base = `mc2-${def.clave}-${ancho.nombre}`
      await page.screenshot({ path: path.join(OUT, `${base}-pliegue.png`) })
      const alto = await capturaEntera(page, `${base}-entera.png`, ancho.width, ancho.height)
      hallazgos[base] = {
        lead: def.nombre,
        stage: lead.dossier?.stage ?? null,
        progresoJson: lead.dossier?.progresoJson ?? null,
        url: page.url(),
        altoDelScroller: alto,
        pantalla: lectura,
      }
    }
  }
  // Para comparar lo que copia cada pantalla con el MISMO lead: mc1 copia las tres
  // capas (P42); mc2 sigue copiando el bloque de siempre. Solo lectura del `<pre>`.
  const leadConstruccion = leads.find((l) => l.businessName === LEADS[0].nombre)
  if (leadConstruccion) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/setter/leads/${leadConstruccion.id}/manual/mc1`, { waitUntil: 'networkidle' })
    await page.locator('main h2').first().waitFor()
    hallazgos['mc1-construccion-1440-bloque'] = await page.evaluate(() => {
      const pre = document.querySelector('pre[data-bloque="construccion"]')
      const texto = pre?.textContent ?? ''
      return {
        caracteres: texto.length,
        traeInstrucciones: texto.includes('1 de 3 · INSTRUCCIONES'),
        traePiso: texto.includes('3 de 3 · PISO DE CALIDAD'),
      }
    })
  }

  await browser.close()
  fs.writeFileSync(path.join(OUT, 'hallazgos.json'), JSON.stringify(hallazgos, null, 2))
  console.log(`censo de mc2 → ${OUT}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

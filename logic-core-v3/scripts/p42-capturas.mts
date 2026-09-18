/**
 * P42 — «Construir» antes y después, operando la aplicación a 1440 y a 390.
 *
 * Siembra SUS leads (tracker de la suite, con el registro de siembra de P39
 * activado: si el proceso muere antes del `finally`, la próxima suite los borra
 * por id) y los borra por id al terminar. Corre igual contra el build de partida
 * (`CAPT_FASE=antes`) y contra el nuevo (`CAPT_FASE=despues`): los mismos estados,
 * las mismas capturas, lo leído del DOM en `hallazgos.json`.
 *
 * Estados de mc1:
 *   1. con-encabezado — brief de cuatro vueltas con el documento completo y la
 *      ficha con su material;
 *   2. brief-viejo    — el brief de siempre: sin documento, con el pegado del Gem;
 *   3. sin-encabezado — un documento que no trae el encabezado;
 *   4. falta-paleta   — un documento sin la línea PALETA y sin paleta en el brief;
 *   5. por-arrancar   — el lead todavía en BRIEF (el tilde apagado);
 *   6. a-medias       — «Construir» a medias (solo estructura) con dos fases de
 *      «Refinar» guardadas: el tilde y lo que respeta de lo guardado;
 *   7. construida     — las seis fases guardadas.
 *
 * En `despues` además opera: copia el bloque y compara el portapapeles con lo
 * que muestra la pantalla y con lo que arma el producto; tilda y destilda
 * releyendo la base cada vez.
 *
 * Las capturas de «lo que ve el setter» son del viewport tal cual. Las enteras
 * agrandan el viewport al alto del scroller: el shell es `fixed inset-0` y
 * `fullPage` mentiría.
 *
 * Uso: CAPT_BASE=http://127.0.0.1:3003 CAPT_FASE=antes npx tsx scripts/p42-capturas.mts
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
  VUELTA_LECTURA,
} from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DATABASE_URL = process.env.DATABASE_URL ?? ''
if (!DATABASE_URL.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const BASE = process.env.CAPT_BASE ?? 'http://127.0.0.1:3003'
const FASE = process.env.CAPT_FASE === 'despues' ? 'despues' : 'antes'
const OUT = `docs/p42-construccion/capturas/${FASE}`
const COOKIE = '__Secure-authjs.session-token'
const ANCHOS = [
  ['1440', 1440, 900],
  ['390', 390, 844],
] as const

/** Los nueve puntos que «Construir» mostraba: se buscan en la pantalla, antes y después. */
const NUEVE_PUNTOS = [
  'Copiá el bloque «para Claude Design» y pegalo ahí como primer mensaje.',
  'Pedile una landing de una sola página con las secciones del brief, en ese orden.',
  'No agregues secciones que el brief no pide — el brief es el plano.',
  'Nombre, rubro y zona reales en el hero y el pie.',
  'Usá frases de las reseñas reales como prueba social (las tenés en la ficha).',
  'Horarios, dirección y servicios tal como los publica el negocio.',
  'Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio.',
  'Insertalas donde Claude Design puso imágenes genéricas o de stock.',
  'Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado.',
] as const

const FICHA_COMPLETA = {
  identidad: { notas: 'La cuenta la firma Marcos, el dueño, que aparece en las fotos.', igManejadoPor: 'DUENO' },
  presenciaDigital: 'Instagram activo, publica tres veces por semana. Sin web. Google Maps con 212 reseñas.',
  resenas: '★★★★★ "Marcos es un crack, te deja el corte como te gusta." — Julián R.',
  contenidoReal: 'Logo: faro blanco sobre negro. Fotos de cortes con luz cálida.',
  senalesOperativas: 'Martes a sábados de 10 a 20 h. Turnos por WhatsApp.',
  materiales: {
    imagenesUrl: 'https://instagram.com/barberiaelfaro',
    queVende: 'Corte clásico $9.000 · Corte y barba $12.500 · Barba $5.000',
    comoSePresenta: '"Barbería de barrio desde 2016. Te conocemos por el nombre."',
  },
}

const BRIEF_CUATRO_VUELTAS = {
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

type Escenario = {
  id: string
  stage: 'BRIEF' | 'CONSTRUCCION'
  brief: Record<string, unknown> | null
  ficha: Record<string, unknown> | null
  progreso: readonly string[] | null
}

const ESCENARIOS: readonly Escenario[] = [
  { id: 'con-encabezado', stage: 'CONSTRUCCION', brief: BRIEF_CUATRO_VUELTAS, ficha: FICHA_COMPLETA, progreso: null },
  { id: 'brief-viejo', stage: 'CONSTRUCCION', brief: null, ficha: null, progreso: null },
  {
    id: 'sin-encabezado',
    stage: 'CONSTRUCCION',
    brief: { titulo: 'Barbería El Faro', secciones: ['Hero', 'Servicios', 'Contacto'], documento: DOCUMENTO_SIN_ENCABEZADO },
    ficha: FICHA_COMPLETA,
    progreso: null,
  },
  {
    id: 'falta-paleta',
    stage: 'CONSTRUCCION',
    brief: { ...BRIEF_CUATRO_VUELTAS, paleta: undefined, documento: DOCUMENTO_SIN_PALETA },
    ficha: FICHA_COMPLETA,
    progreso: null,
  },
  { id: 'por-arrancar', stage: 'BRIEF', brief: BRIEF_CUATRO_VUELTAS, ficha: FICHA_COMPLETA, progreso: null },
  { id: 'a-medias', stage: 'CONSTRUCCION', brief: null, ficha: null, progreso: ['estructura', 'cta', 'calidad'] },
  {
    id: 'construida',
    stage: 'CONSTRUCCION',
    brief: null,
    ficha: null,
    progreso: ['estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile'],
  },
]

const hallazgos: Record<string, unknown> = {}
const anotar = (clave: string, valor: unknown) => {
  hallazgos[clave] = valor
  console.log(`  ${clave}: ${typeof valor === 'string' ? valor : JSON.stringify(valor)}`)
}

async function contexto(browser: Browser, email: string, w: number, h: number) {
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
      role: 'SETTER',
      provider: 'qa-bypass',
      onboardingCompleted: false,
      passwordResetRequired: false,
    },
  })
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  await ctx.addCookies([
    { name: COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])
  return ctx
}

async function esperar(cond: () => Promise<boolean>, que: string, ms = 20_000) {
  const hasta = Date.now() + ms
  while (Date.now() < hasta) {
    if (await cond()) return
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`no se cumplió: ${que}`)
}

const main = (page: Page) => page.locator('main').filter({ visible: true }).first()

async function capturaPliegue(page: Page, nombre: string) {
  await main(page).evaluate((el) => el.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${nombre}.png` })
}

/** La pantalla entera: el viewport crece al alto del scroller y se captura `main`. */
async function capturaEntera(page: Page, nombre: string, w: number, h: number) {
  const alto = await page.evaluate(() => {
    const m = Array.from(document.querySelectorAll('main')).find((x) => x.getBoundingClientRect().height > 0)
    return m ? Math.ceil(m.getBoundingClientRect().top + m.scrollHeight + 40) : 0
  })
  await page.setViewportSize({ width: w, height: Math.min(Math.max(alto, h), 16_000) })
  await page.waitForTimeout(500)
  await main(page).screenshot({ path: `${OUT}/${nombre}.png` })
  await page.setViewportSize({ width: w, height: h })
  anotar(`${nombre}.altoDelScroller`, alto)
}

/** Lo que la pantalla de «Construir» dice de sí misma, leído del DOM. */
async function leerPantalla(page: Page) {
  return main(page).evaluate((el, nueve) => {
    const texto = el.textContent ?? ''
    const registro = el.querySelector('section[aria-label="Registro"]')
    const tildes = Array.from(registro?.querySelectorAll('button[aria-pressed]') ?? [])
    const bloqueNuevo = el.querySelector('pre[data-bloque="construccion"]')
    const bloqueViejo = Array.from(el.querySelectorAll('pre')).find((p) =>
      (p.textContent ?? '').startsWith('BRIEF DE DEMO'),
    )
    const bloque = bloqueNuevo ?? bloqueViejo ?? null
    const zonaDelBloque = bloque?.closest('section[aria-label]')?.getAttribute('aria-label') ?? null
    return {
      zonas: Array.from(el.querySelectorAll('section[aria-label]'))
        .map((s) => s.getAttribute('aria-label'))
        .filter((n) => ['Contexto del lead', 'Munición', 'Registro'].includes(n ?? '')),
      tildes: tildes.map((t) => ({
        // El tilde de antes nombraba con aria-label; el único de P42, con aria-labelledby.
        nombre:
          t.getAttribute('aria-label') ??
          document.getElementById(t.getAttribute('aria-labelledby') ?? '')?.textContent ??
          null,
        pulsado: t.getAttribute('aria-pressed'),
        apagado: (t as HTMLButtonElement).disabled,
      })),
      botonesCopiar: Array.from(el.querySelectorAll('button')).filter((b) => /Copiar/.test(b.textContent ?? ''))
        .length,
      nuevePuntosEnPantalla: nueve.filter((p) => texto.includes(p)).length,
      zonaDelBloque,
      bloqueCaracteres: bloque ? [...(bloque.textContent ?? '')].length : null,
      // Un `<pre>` dentro de un `<details>` cerrado no se lee aunque exista.
      bloquePlegado: bloque ? Boolean(bloque.closest('details:not([open])')) : null,
      bloqueAltoVisible: bloque ? Math.round(bloque.getBoundingClientRect().height) : null,
      bloqueConScrollPropio: bloque ? bloque.scrollHeight > bloque.clientHeight + 1 : null,
      linkPendiente: texto.includes('Link pendiente'),
      salida: texto.includes('pedíselo a Franco'),
      badgeProvisorio: /Guía preliminar/i.test(texto),
    }
  }, [...NUEVE_PUNTOS])
}

async function progresoEnDb(leadId: string): Promise<string[]> {
  const { getDossier } = await import('../tests/helpers/setter-db.ts')
  const { parseProgreso } = await import('../src/lib/leados/flow.ts')
  const dossier = await getDossier(leadId)
  return [...parseProgreso(dossier?.progresoJson ?? null).completadas].sort()
}

async function main_() {
  mkdirSync(OUT, { recursive: true })
  const registro = await import('../tests/helpers/siembra-registro.ts')
  registro.activarRegistro(DATABASE_URL)
  const db = await import('../tests/helpers/setter-db.ts')
  const tracker = db.newTracker()
  const setterId = (await db.getSetterQa()).id
  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })

  try {
    // Un lead por estado, sembrado una vez y usado a los dos anchos. El tilde se
    // opera solo a 1440 (a 390 se fotografía el estado que dejó la vuelta).
    const leads: Record<string, string> = {}
    for (const e of ESCENARIOS) {
      const lead = await db.createLead(tracker, {
        setterId,
        businessName: `P42 ${e.id}`,
        stage: e.stage,
        status: 'RESPONDIO',
        ...(e.progreso ? { progresoCompletadas: e.progreso } : {}),
      })
      const data: Record<string, unknown> = {}
      if (e.brief) data.briefJson = e.brief
      if (e.ficha) data.fichaJson = e.ficha
      if (Object.keys(data).length > 0) await db.prisma.osLeadDossier.update({ where: { leadId: lead.id }, data })
      leads[e.id] = lead.id
    }

    for (const [ancho, w, h] of ANCHOS) {
      console.log(`\n── ${FASE} · ${ancho} ──`)
      const ctx = await contexto(browser, 'setter-qa@develop.test', w, h)
      const page = await ctx.newPage()

      for (const [i, e] of ESCENARIOS.entries()) {
        const n = String(i + 1).padStart(2, '0')
        const leadId = leads[e.id]!
        await page.goto(`${BASE}/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'networkidle' })
        await main(page).waitFor({ state: 'visible' })
        // Hidratado: el botón de copiar ya responde.
        await page.getByRole('button', { name: /Copiar/ }).filter({ visible: true }).first().waitFor({ state: 'visible' })
        await page.waitForTimeout(400)

        anotar(`${n}-${e.id}-${ancho}.pantalla`, await leerPantalla(page))
        if (e.id === 'a-medias') anotar(`${n}-${e.id}-${ancho}.dbAlCargar`, await progresoEnDb(leadId))
        await capturaPliegue(page, `${n}-${e.id}-${ancho}-pliegue`)
        await capturaEntera(page, `${n}-${e.id}-${ancho}-entera`, w, h)

        if (FASE !== 'despues') continue

        // ── Lo que se copia es lo que se ve, y es lo que arma el producto ──────
        if (e.id === 'con-encabezado' || e.id === 'brief-viejo') {
          await page.getByRole('button', { name: /Copiar/ }).filter({ visible: true }).first().click()
          await esperar(
            async () => (await page.evaluate(() => navigator.clipboard.readText())).length > 0,
            'el portapapeles recibe el bloque',
          )
          // El portapapeles de Windows devuelve CRLF aunque se escriba LF: se normaliza solo eso.
          const crudo = await page.evaluate(() => navigator.clipboard.readText())
          const portapapeles = crudo.replace(/\r\n/g, '\n')
          const enPantalla = await page.locator('main pre[data-bloque="construccion"]').first().evaluate((el) => el.textContent ?? '')
          const { armarBloqueConstruccion } = await import('../src/lib/leados/bloque-construccion.ts')
          const { parseBrief, parseFicha } = await import('../src/lib/leados/flow.ts')
          const fila = await db.prisma.osLead.findUniqueOrThrow({
            where: { id: leadId },
            select: {
              businessName: true,
              industry: true,
              zone: true,
              instagramUrl: true,
              currentWebUrl: true,
              googleMapsUrl: true,
              dossier: { select: { briefJson: true, fichaJson: true } },
            },
          })
          const esperado = armarBloqueConstruccion(
            {
              businessName: fila.businessName,
              industry: fila.industry,
              zone: fila.zone,
              instagramUrl: fila.instagramUrl,
              currentWebUrl: fila.currentWebUrl,
              googleMapsUrl: fila.googleMapsUrl,
            },
            parseBrief(fila.dossier?.briefJson ?? null)!,
            parseFicha(fila.dossier?.fichaJson ?? null),
          )
          anotar(`${n}-${e.id}-${ancho}.copia`, {
            portapapelesIgualAPantalla: portapapeles === enPantalla,
            portapapelesIgualAlProducto: portapapeles === esperado.texto,
            caracteres: [...portapapeles].length,
            rotulos: esperado.capas.map((c) => c.rotulo),
            ordenDeLasCapasEnLaCopia: esperado.capas.map((c) => portapapeles.indexOf(c.rotulo)),
          })
          writeFileSync(`${OUT}/${n}-${e.id}-${ancho}-bloque-copiado.txt`, portapapeles)
          await capturaPliegue(page, `${n}-${e.id}-${ancho}-copiado`)
        }

        // ── El tilde: marca las tres fases de «Construir» y respeta el resto ──
        if (e.id === 'a-medias' && ancho === '1440') {
          const tilde = page.locator('main section[aria-label="Registro"] button[aria-pressed]').first()
          await tilde.scrollIntoViewIfNeeded()
          await esperar(async () => !(await tilde.isDisabled()), 'el tilde vivo')
          await tilde.click()
          await esperar(async () => (await progresoEnDb(leadId)).length === 5, 'las tres de Construir guardadas')
          anotar(`${n}-${e.id}-${ancho}.dbTrasTildar`, await progresoEnDb(leadId))
          await page.waitForTimeout(600)
          await page.screenshot({ path: `${OUT}/${n}-${e.id}-${ancho}-tildado.png` })
          await page.reload({ waitUntil: 'networkidle' })
          await esperar(async () => (await tilde.getAttribute('aria-pressed')) === 'true', 'tildado tras recargar')
          anotar(`${n}-${e.id}-${ancho}.pulsadoTrasRecargar`, await tilde.getAttribute('aria-pressed'))
          await tilde.click()
          await esperar(async () => (await progresoEnDb(leadId)).length === 2, 'destildar saca solo las tres')
          anotar(`${n}-${e.id}-${ancho}.dbTrasDestildar`, await progresoEnDb(leadId))
        }
      }
      await ctx.close()
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

main_().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

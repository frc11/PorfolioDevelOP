/**
 * EL INSTRUMENTO DEL PANEL — mide el bloque-por-bloque de `/setter`.
 *
 * Por qué existe: las decisiones sobre el panel salían de capturas de agosto, y
 * desde entonces veinte sprints tocaron el producto. `medir-pliegue-manual.ts`
 * mide las CATORCE pantallas del manual; ninguna es el panel. Este mide el
 * panel — la primera pantalla que el setter abre — con el MISMO método:
 *
 *   · el pliegue real (el shell del setter es `fixed inset-0` y el scroller es
 *     el `<main>` interno: el pliegue es su `clientHeight`, no el viewport);
 *   · las alturas relativas al ORIGEN DEL CONTENIDO del scroller
 *     (`rect.top - mainRect.top + main.scrollTop`), no al viewport;
 *   · qué bloques entran en el pliegue y cuánto ocupa cada uno.
 *
 * Y un censo de conducta, porque el sprint mueve trabajo de un bloque a otro:
 * cuántos ítems de cola, cuántos avisos, cuántos números, cuántas veces se
 * escribe la marca. Un bloque que cambia de tamaño no prueba que el trabajo se
 * movió; el censo sí.
 *
 * El MISMO archivo mide los dos brazos: los selectores del brazo nuevo no
 * existen en el viejo y salen `null` — sin dos caminos de código que diverjan.
 *
 * Uso:
 *   npx tsx scripts/qa-corridas/medir-panel-setter.ts
 *   PANEL_OUT=docs/baselines/p21-panel-antes.json npx tsx ...
 *   PANEL_SHOTS=docs/proof-screenshots/p21/antes npx tsx ...
 *   PANEL_BASE_URL=http://127.0.0.1:3021 npx tsx ...
 *   PANEL_EMAIL=otro@setter.test npx tsx ...     # p. ej. un setter sin trabajo
 *
 * Requiere la app corriendo (build de producción con QA_ALLOW_LOCALHOST=1).
 */
import path from 'path'
import fs from 'fs'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.PANEL_BASE_URL ?? 'http://127.0.0.1:3020'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.PANEL_OUT ?? null
const SHOTS_DIR = process.env.PANEL_SHOTS ?? null
/** Setter a medir. Parametrizado para poder medir también uno SIN trabajo. */
const EMAIL = process.env.PANEL_EMAIL ?? 'setter-qa@develop.test'

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

/**
 * Los bloques del panel. La clave es estable; el selector es el `aria-label`
 * que cada bloque YA declaraba antes de este sprint (ninguno se inventó para
 * medir). `cola` es el único nuevo: en el brazo viejo no existe y sale `null`,
 * que es exactamente el hallazgo que el sprint arranca constatando.
 */
const BLOQUES = {
  cabecera: 'header',
  cola: 'section[aria-label="Tu cola de hoy"]',
  foco: 'section[aria-label="Tu foco ahora"]',
  enEspera: 'section[aria-label="Nada para trabajar ahora"]',
  novedades: 'section[aria-label="Novedades de tu cartera"]',
  cartera: 'section[aria-label="Tu cartera completa"]',
  misNumeros: 'section[aria-label="Mis números"]',
  progreso: 'section[aria-label^="Tu avance de los últimos"]',
} as const
type BloqueId = keyof typeof BLOQUES

type Pieza = { top: number; alto: number; entra: boolean }

type Medicion = {
  ancho: string
  email: string
  pliegue: number
  altoTotal: number
  /** Bloques presentes y VISIBLES, en orden de aparición dentro del scroller. */
  orden: BloqueId[]
  bloques: Record<string, Pieza | null>
  censo: Record<string, number>
  numerosTexto: string[]
}

/**
 * La geometría + el censo, medidos DENTRO de la página. Se pasa como FUNCIÓN
 * (no como string) para que los escapes no se degraden; el shim `__name` del
 * contexto la hace sobrevivir al `keepNames` de esbuild.
 */
function radiografia(selectores: Record<string, string>) {
  const main = document.querySelector('main')
  if (!main) return null
  const mainRect = main.getBoundingClientRect()
  const pliegue = main.clientHeight

  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = window.getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  const bloques: Record<string, { top: number; alto: number; entra: boolean } | null> = {}
  const conOrden: { id: string; top: number }[] = []
  for (const par of Object.entries(selectores)) {
    const id = par[0]
    const sel = par[1]
    const el = main.querySelector(sel)
    if (!el || !visible(el)) {
      bloques[id] = null
      continue
    }
    const rect = el.getBoundingClientRect()
    const top = Math.round(rect.top - mainRect.top + main.scrollTop)
    const alto = Math.round(rect.height)
    bloques[id] = { top: top, alto: alto, entra: top < pliegue }
    conOrden.push({ id: id, top: top })
  }
  conOrden.sort((a, b) => a.top - b.top)

  // ── Censo de conducta ──────────────────────────────────────────────────────
  // Solo lo VISIBLE: un nodo `display:none` no es contenido de la pantalla.
  const contar = (sel: string) =>
    Array.from(main.querySelectorAll(sel)).filter(visible).length

  const textoDe = (el: Element) => (el.textContent || '').trim()

  // Los números que el panel escribe: cada nodo `tabular-nums` visible con al
  // menos un dígito. Definición operativa de «un número en la pantalla» — el
  // producto ya usa esa clase para todos, así que no hay lista que mantener.
  const numeros = Array.from(main.querySelectorAll('.tabular-nums'))
    .filter(visible)
    .map(textoDe)
    .filter((t) => /\d/.test(t))

  // «LeadOS» escrito en la pantalla entera: el topbar vive FUERA del scroller,
  // así que este censo sale de `body`, no de `main`.
  const marcas = Array.from(document.body.querySelectorAll('*')).filter((el) => {
    if (el.children.length > 0) return false
    if (!visible(el)) return false
    return textoDe(el) === 'LeadOS'
  }).length

  const interactivos = Array.from(main.querySelectorAll('button, a')).filter(visible)

  const censo: Record<string, number> = {
    itemsCola: contar('[data-slot="item-cola"]'),
    avisos: contar('section[aria-label="Novedades de tu cartera"] li'),
    numeros: numeros.length,
    marcaLeadOS: marcas,
    // El subtítulo del `PageHeader` (la línea que explica el producto).
    subtitulos: contar('header p.max-w-2xl'),
    // El eyebrow del `PageHeader` — su tracking es único en la pantalla.
    eyebrows: Array.from(main.querySelectorAll('header p')).filter((el) => {
      if (!visible(el)) return false
      return window.getComputedStyle(el).letterSpacing === '3.08px'
    }).length,
    // Controles que llevan a trabajar un lead desde el panel.
    botonesTrabajar: interactivos.filter((el) =>
      /^(ir a trabajarlo|trabajarlo|abrir|trabajar)$/i.test(textoDe(el)),
    ).length,
    soltarFoco: interactivos.filter((el) => /soltar/i.test(textoDe(el))).length,
  }

  return {
    pliegue: pliegue,
    altoTotal: main.scrollHeight,
    orden: conOrden.map((o) => o.id),
    bloques: bloques,
    censo: censo,
    numerosTexto: numeros,
  }
}

async function medir(
  page: Page,
  ancho: (typeof ANCHOS)[number],
  email: string,
): Promise<Medicion> {
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    const m = document.querySelector('main')
    if (m) m.scrollTop = 0
  })

  const r = await page.evaluate(radiografia, BLOQUES as unknown as Record<string, string>)
  if (!r) throw new Error('no se encontró el <main> del shell del setter')

  if (SHOTS_DIR) {
    const dir = path.resolve(SHOTS_DIR)
    fs.mkdirSync(dir, { recursive: true })
    // El pliegue, no la página entera: agrandar el viewport falsearía el fold.
    await page.screenshot({ path: path.join(dir, `panel-${ancho.nombre}.png`) })
  }

  console.log(`\n── ${email} · ${ancho.nombre} ──`)
  console.log(`  pliegue ${r.pliegue} · alto total ${r.altoTotal}`)
  console.log(`  orden: ${r.orden.join(' → ')}`)
  for (const id of Object.keys(BLOQUES)) {
    const p = r.bloques[id]
    const linea = p
      ? `top ${String(p.top).padStart(5)} · alto ${String(p.alto).padStart(5)} · ${p.entra ? 'EN EL PLIEGUE' : 'debajo'}`
      : '—'
    console.log(`  ${id.padEnd(11)} ${linea}`)
  }
  console.log(`  censo: ${JSON.stringify(r.censo)}`)
  console.log(`  números: ${JSON.stringify(r.numerosTexto)}`)

  return {
    ancho: ancho.nombre,
    email: email,
    pliegue: r.pliegue,
    altoTotal: r.altoTotal,
    orden: r.orden as BloqueId[],
    bloques: r.bloques,
    censo: r.censo,
    numerosTexto: r.numerosTexto,
  }
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const setter = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true },
  })
  if (!setter) throw new Error(`no existe el setter ${EMAIL}`)

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
      email: EMAIL,
      name: EMAIL,
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
  const page = await context.newPage()

  const filas: Medicion[] = []
  for (const ancho of ANCHOS) {
    filas.push(await medir(page, ancho, EMAIL))
  }

  await browser.close()
  await prisma.$disconnect()

  if (OUT_JSON) {
    const out = path.resolve(OUT_JSON)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, JSON.stringify(filas, null, 2))
    console.log(`\nJSON -> ${OUT_JSON}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

/**
 * P41 · EL PANEL DIBUJADO, LEAD POR LEAD — solo lectura. Branch Neon dev.
 *
 * `p41-superficies.mts` compara lo que cada superficie RECIBE; éste compara lo que
 * el navegador DIBUJA, que es el criterio de éxito del sprint («que el panel se
 * vea igual»). Abre `/setter` como `setter-qa` a 1440 y a 390 y guarda:
 *
 *   · la cola: el texto de cada ítem, en orden (el foco es el primero);
 *   · el «todo en espera», si es lo que se dibuja en lugar de la cola;
 *   · la cartera ABIERTA con TODOS los grupos desplegados: cada grupo con su
 *     rótulo y su conteo, y cada tarjeta con su texto;
 *   · los avisos: el texto de cada fila;
 *   · los contadores: «Mis números» y el avance de la semana;
 *   · capturas: el panel entero (cartera plegada), la cartera entera desplegada,
 *     y la primera tarjeta de cada grupo — un lead por estado.
 *
 * El shell es `fixed inset-0` y el scroller es el `<main>`: las capturas agrandan
 * el viewport al alto del scroller (`fullPage` mentiría).
 *
 * Uso:
 *   PANEL_BASE_URL=http://127.0.0.1:3003 npx tsx scripts/p41-panel.mts --salida=<dir>
 *   npx tsx scripts/p41-panel.mts --comparar=<a/panel.json>,<b/panel.json>
 */
import fs from 'fs'
import path from 'path'
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

const BASE_URL = process.env.PANEL_BASE_URL ?? 'http://127.0.0.1:3003'
const SESSION_COOKIE = '__Secure-authjs.session-token'
/** El setter cuyo panel se lee. `setter-qa` tiene la cartera con todos los grupos; los de la galería, los otros estados del panel. */
const EMAIL = process.env.PANEL_EMAIL ?? 'setter-qa@develop.test'
const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const
const ALTO_MAXIMO = 15_000

type Grupo = { label: string; conteo: string; tarjetas: { nombre: string; texto: string }[] }
type Lectura = {
  ancho: string
  /** La sección entera de la cola: encabezado con el total, el foco (FocoSurface), las filas y el pie. */
  colaSeccion: string | null
  /** Las filas que siguen al foco, en orden. */
  cola: string[]
  enEspera: string | null
  toggleCartera: string | null
  grupos: Grupo[]
  avisos: string[]
  /**
   * La sección de Novedades entera: el contador, «Y N avisos más» y el resumen
   * «N demos esperando a Franco · hace …», que no son filas. Sumado después de la
   * foto de partida de P41 (el lector de filas no los veía); para esa comparación
   * lo cubren las capturas del panel, idénticas byte por byte.
   */
  novedadesSeccion?: string | null
  misNumeros: string | null
  avance: string | null
}
type Salida = { base: string; medidoEn: string; email: string; anchos: Lectura[] }

/** Lo que el panel dibuja, leído dentro de la página. Sin regex con escapes (se degradan). */
function leerPanel(): Omit<Lectura, 'ancho'> {
  const main = Array.from(document.querySelectorAll('main')).find((m) => m.getBoundingClientRect().height > 0)
  if (!main) throw new Error('sin <main> visible')
  const limpio = (el: Element | null) => (el ? (el as HTMLElement).innerText.split('\n').map((l) => l.trim()).filter(Boolean).join(' | ') : null)
  const colaSeccion = limpio(main.querySelector('section[aria-label="Tu cola de hoy"]'))
  const cola = Array.from(main.querySelectorAll('[data-slot="item-cola"]')).map((el) => limpio(el) ?? '')
  const enEspera = limpio(main.querySelector('section[aria-label="Nada para trabajar ahora"]'))
  const cartera = main.querySelector('section[aria-label="Tu cartera completa"]')
  const toggleCartera = cartera ? limpio(cartera.querySelector(':scope > button')) : null
  const grupos = cartera
    ? Array.from(cartera.querySelectorAll('[data-slot="grupo-cartera"]')).map((g) => {
        const boton = g.querySelector(':scope > button')
        const spans = boton ? Array.from(boton.querySelectorAll('span')) : []
        return {
          label: spans[0] ? (spans[0].textContent ?? '').trim() : '',
          conteo: spans[1] ? (spans[1].textContent ?? '').trim() : '',
          tarjetas: Array.from(g.querySelectorAll('[data-slot="tarjeta-cartera"]')).map((t) => ({
            nombre: (t.querySelector('h3')?.textContent ?? '').trim(),
            texto: limpio(t) ?? '',
          })),
        }
      })
    : []
  const novedades = main.querySelector('[aria-label="Novedades de tu cartera"]')
  const avisos = novedades ? Array.from(novedades.querySelectorAll('li')).map((li) => limpio(li) ?? '') : []
  const novedadesSeccion = limpio(novedades)
  const misNumeros = limpio(main.querySelector('section[aria-label="Mis números"]'))
  const avance = limpio(
    Array.from(main.querySelectorAll('section[aria-label]')).find((s) =>
      (s.getAttribute('aria-label') ?? '').startsWith('Tu avance de los últimos'),
    ) ?? null,
  )
  return { colaSeccion, cola, enEspera, toggleCartera, grupos, avisos, novedadesSeccion, misNumeros, avance }
}

async function altoDelScroller(page: Page): Promise<number> {
  return page.evaluate(() => {
    const main = Array.from(document.querySelectorAll('main')).find((m) => m.getBoundingClientRect().height > 0)
    return main ? Math.ceil(main.getBoundingClientRect().top + main.scrollHeight + 40) : 0
  })
}

/**
 * El scroller entero en una toma; si pasa el tope de alto, en varias tomas
 * consecutivas (`-parte2`, `-parte3`…) moviendo el scroll del `<main>`, para que
 * ninguna tarjeta quede afuera de las capturas.
 */
async function capturaEntera(page: Page, ancho: (typeof ANCHOS)[number], archivo: string): Promise<number> {
  const necesario = Math.max(await altoDelScroller(page), ancho.height)
  const alto = Math.min(necesario, ALTO_MAXIMO)
  await page.setViewportSize({ width: ancho.width, height: alto })
  await page.waitForTimeout(400)
  await page.screenshot({ path: archivo })
  const paso = alto - 300
  for (let parte = 2, desde = paso; desde < necesario - alto + paso; parte += 1, desde += paso) {
    await page.evaluate((top: number) => {
      const main = Array.from(document.querySelectorAll('main')).find((m) => m.getBoundingClientRect().height > 0)
      if (main) main.scrollTop = top
    }, desde)
    await page.waitForTimeout(250)
    await page.screenshot({ path: archivo.replace(/\.png$/, `-parte${parte}.png`) })
  }
  await page.evaluate(() => {
    const main = Array.from(document.querySelectorAll('main')).find((m) => m.getBoundingClientRect().height > 0)
    if (main) main.scrollTop = 0
  })
  return necesario
}

async function recorrer(page: Page, ancho: (typeof ANCHOS)[number], dir: string): Promise<Lectura> {
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
  await page.locator('main h1').filter({ visible: true }).first().waitFor()
  await page.waitForTimeout(500)

  // 1 · El panel entero, como abre (cartera plegada).
  const altoPanel = await capturaEntera(page, ancho, path.join(dir, `panel-${ancho.nombre}.png`))

  // 2 · La cartera abierta con todos los grupos desplegados (un setter sin leads no tiene cartera).
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  const toggle = page.locator('main section[aria-label="Tu cartera completa"] > button').filter({ visible: true }).first()
  if ((await toggle.count()) === 0) {
    const lectura = await page.evaluate(leerPanel)
    console.log(`${ancho.nombre}: sin cartera · en espera ${lectura.enEspera ? 'sí' : 'no'} · captura del panel ${altoPanel} px`)
    return { ancho: ancho.nombre, ...lectura }
  }
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
  await page.locator('main [data-slot="grupo-cartera"]').first().waitFor()
  for (;;) {
    const plegado = page.locator('main [data-slot="grupo-cartera"] > button[aria-expanded="false"]').first()
    if ((await plegado.count()) === 0) break
    await plegado.click()
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(300)
  const lectura = await page.evaluate(leerPanel)
  const altoCartera = await capturaEntera(page, ancho, path.join(dir, `panel-cartera-abierta-${ancho.nombre}.png`))

  // 3 · Un lead por estado: la primera tarjeta de cada grupo.
  const grupos = page.locator('main [data-slot="grupo-cartera"]')
  const n = await grupos.count()
  for (let i = 0; i < n; i++) {
    const g = grupos.nth(i)
    const label = ((await g.locator(':scope > button span').first().textContent()) ?? `grupo-${i}`).trim()
    const slug = label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const tarjeta = g.locator('[data-slot="tarjeta-cartera"]').first()
    if ((await tarjeta.count()) > 0) await tarjeta.screenshot({ path: path.join(dir, `estado-${String(i + 1).padStart(2, '0')}-${slug}-${ancho.nombre}.png`) })
  }
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  console.log(
    `${ancho.nombre}: foco + ${lectura.cola.length} filas en la cola · grupos ${lectura.grupos.map((g) => `${g.label} ${g.conteo}`).join(' · ')} · ` +
      `tarjetas ${lectura.grupos.reduce((s, g) => s + g.tarjetas.length, 0)} · avisos ${lectura.avisos.length} · ` +
      `capturas: panel ${altoPanel} px, cartera ${altoCartera} px${altoCartera > ALTO_MAXIMO ? ' (en partes)' : ''}`,
  )
  return { ancho: ancho.nombre, ...lectura }
}

function comparar(a: Salida, b: Salida): number {
  console.log(`A ${a.base} ${a.medidoEn} · B ${b.base} ${b.medidoEn}`)
  let difs = 0
  const linea = (donde: string, x: unknown, y: unknown) => {
    if (JSON.stringify(x) === JSON.stringify(y)) return
    difs += 1
    console.log(`  ✗ ${donde}\n      A: ${JSON.stringify(x)?.slice(0, 300)}\n      B: ${JSON.stringify(y)?.slice(0, 300)}`)
  }
  for (const la of a.anchos) {
    const lb = b.anchos.find((x) => x.ancho === la.ancho)
    if (!lb) {
      console.log(`  ✗ falta el ancho ${la.ancho} en B`)
      difs += 1
      continue
    }
    const tarjetas = (l: Lectura) => l.grupos.reduce((s, g) => s + g.tarjetas.length, 0)
    console.log(`${la.ancho}: cola ${la.cola.length}→${lb.cola.length} · grupos ${la.grupos.length}→${lb.grupos.length} · tarjetas ${tarjetas(la)}→${tarjetas(lb)} · avisos ${la.avisos.length}→${lb.avisos.length}`)
    linea(`${la.ancho} la cola entera (total, foco, filas, pie)`, la.colaSeccion, lb.colaSeccion)
    const max = Math.max(la.cola.length, lb.cola.length)
    for (let i = 0; i < max; i++) linea(`${la.ancho} cola[${i}]`, la.cola[i], lb.cola[i])
    linea(`${la.ancho} en espera`, la.enEspera, lb.enEspera)
    linea(`${la.ancho} toggle de la cartera`, la.toggleCartera, lb.toggleCartera)
    linea(`${la.ancho} grupos (rótulo y conteo)`, la.grupos.map((g) => [g.label, g.conteo]), lb.grupos.map((g) => [g.label, g.conteo]))
    for (const ga of la.grupos) {
      const gb = lb.grupos.find((g) => g.label === ga.label)
      const tmax = Math.max(ga.tarjetas.length, gb?.tarjetas.length ?? 0)
      for (let i = 0; i < tmax; i++) linea(`${la.ancho} ${ga.label}[${i}]`, ga.tarjetas[i], gb?.tarjetas[i])
    }
    const amax = Math.max(la.avisos.length, lb.avisos.length)
    for (let i = 0; i < amax; i++) linea(`${la.ancho} aviso[${i}]`, la.avisos[i], lb.avisos[i])
    if (la.novedadesSeccion !== undefined && lb.novedadesSeccion !== undefined) {
      linea(`${la.ancho} novedades (contador, «y N más», resumen de revisión)`, la.novedadesSeccion, lb.novedadesSeccion)
    } else {
      console.log(`  (${la.ancho}: la sección de novedades entera no está en las dos fotos — la cubren las capturas del panel)`)
    }
    linea(`${la.ancho} mis números`, la.misNumeros, lb.misNumeros)
    linea(`${la.ancho} avance`, la.avance, lb.avance)
  }
  console.log(difs === 0 ? 'CERO diferencias en lo dibujado' : `${difs} diferencias en lo dibujado`)
  return difs
}

async function main() {
  const par = arg('comparar')
  if (par) {
    const [fa, fb] = par.split(',')
    const leer = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8')) as Salida
    process.exitCode = comparar(leer(fa!), leer(fb!)) === 0 ? 0 : 1
    return
  }
  if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const dir = arg('salida')
  if (!dir) throw new Error('falta --salida=<dir>')
  fs.mkdirSync(dir, { recursive: true })

  const { prisma } = await import('@/lib/prisma')
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('falta AUTH_SECRET')
  const setter = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL }, select: { id: true } })
  await prisma.$disconnect()

  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  try {
    const context = await browser.newContext()
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
      { name: SESSION_COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
    ])
    const page = await context.newPage()
    const errores: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text())
    })
    const anchos: Lectura[] = []
    for (const ancho of ANCHOS) anchos.push(await recorrer(page, ancho, dir))
    const salida: Salida = { base: BASE_URL, medidoEn: new Date().toISOString(), email: EMAIL, anchos }
    fs.writeFileSync(path.join(dir, 'panel.json'), JSON.stringify(salida, null, 1))
    console.log(`errores de consola: ${errores.length}${errores.length ? ` — ${errores.slice(0, 3).join(' / ')}` : ''}`)
    console.log(`→ ${path.join(dir, 'panel.json')}`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

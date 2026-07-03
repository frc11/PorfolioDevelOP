/**
 * Corrida 1 — recorrido no-técnico del setter probando la IMPORTACIÓN MASIVA de
 * CSV (`/setter/nuevo/importar`). Script de navegación/captura (NO es código de
 * producto): loguea como `setter-qa` contra el build de prod-QA (:3001, mismo
 * patrón que `tests/helpers/setter-auth.ts`), recorre la pantalla real con
 * Playwright y guarda un screenshot por paso en
 * `docs/proof-screenshots/corrida-1/`, en el orden en que un setter los vería.
 *
 * Muta DATA de prueba (leads namespaced `QA-CSV …`), nunca código. Teardown por
 * id exacto al final (try/finally), mismo idiom que `tests/leados/*.spec.ts`.
 *
 * Correr con el server prod-QA ya levantado en :3001 (`npm run start:qa`):
 *   npx tsx scripts/qa-corridas/corrida-1-import-csv.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { chromium } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: '.env.local' })

const BASE_URL = `http://127.0.0.1:${process.env.SETTER_PORT ?? 3001}`
const SESSION_COOKIE = '__Secure-authjs.session-token'
const SESSION_MAX_AGE = 8 * 60 * 60
const OUT_DIR = path.resolve(__dirname, '../../docs/proof-screenshots/corrida-1')
const STAMP = '20260701'
const TAG = 'QA-CSV'

const prisma = new PrismaClient()
let shotIndex = 0
const createdLeadIds: string[] = []
const createdUserIds: string[] = []

function nextShot(name: string): string {
  shotIndex += 1
  return path.join(OUT_DIR, `${String(shotIndex).padStart(2, '0')}-${name}.png`)
}

function csvFile(name: string, content: string): string {
  const p = path.join(OUT_DIR, `_tmp-${name}.csv`)
  fs.writeFileSync(p, content, 'utf-8')
  return p
}

/**
 * El shell del setter (`<main class="... flex-1 overflow-y-auto ...">`) scrollea
 * ADENTRO, no en `document`/`body` — `page.screenshot({fullPage:true})` mide la
 * altura del documento (que queda igual al viewport, 900px) y por eso RECORTA
 * cualquier cosa que solo se ve bajando el scroll interno (confirmado con
 * Playwright: boundingBox de elementos "de abajo" cae fuera del viewport aunque
 * fullPage diga que sacó la página entera). Fix: agrandar el viewport a la
 * altura real del `main` antes de la captura (el `main` es flex-1 → crece con el
 * viewport y su overflow interno desaparece), sacar la foto SIN fullPage, y
 * devolver el viewport a 1440x900 para que la siguiente interacción (click,
 * setInputFiles) actúe sobre el layout normal.
 */
async function fullShot(page: import('@playwright/test').Page, filePath: string): Promise<void> {
  const contentHeight = await page.evaluate(() => {
    const main = document.querySelector('main')
    return Math.max(main?.scrollHeight ?? 0, document.documentElement.scrollHeight)
  })
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 }
  await page.setViewportSize({ width: viewport.width, height: contentHeight + 100 })
  await page.waitForTimeout(150)
  await page.screenshot({ path: filePath })
  await page.setViewportSize(viewport)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET ausente en .env.local')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, email: true, role: true },
  })
  if (!setter) throw new Error("Persona 'setter-qa@develop.test' no está seedeada.")

  // Rival: un negocio que YA existe en el sistema bajo OTRO setter — para
  // probar el duplicado GLOBAL ("ya en el sistema") con un caso visual real.
  const rival = await prisma.user.create({
    data: { email: `qa-csv-rival-${STAMP}@develop.test`, name: `${TAG} Rival Setter`, role: 'SETTER' },
    select: { id: true },
  })
  createdUserIds.push(rival.id)
  const nombreRival = `${TAG} Panaderia Rival ${STAMP}`
  const leadRival = await prisma.osLead.create({
    data: { businessName: nombreRival, source: 'qa-corrida-1', assignedToId: rival.id },
    select: { id: true },
  })
  createdLeadIds.push(leadRival.id)

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: setter.id,
      email: setter.email,
      name: setter.email,
      picture: null,
      role: setter.role,
      provider: 'qa-bypass',
      onboardingCompleted: true,
      passwordResetRequired: false,
    },
  })
  await context.addCookies([
    { name: SESSION_COOKIE, value: token, domain: new URL(BASE_URL).hostname, path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
  ])

  try {
    // ── PASO 1 — lo que el setter ve al entrar. ──────────────────────────
    await page.goto(`${BASE_URL}/setter`, { waitUntil: 'networkidle' })
    await fullShot(page, nextShot('home-tal-cual-lo-ves'))

    const ctaHome = page.getByRole('link', { name: /Cargar|Importá|Importar/i }).filter({ visible: true })
    const ctaVisibleEnHome = (await ctaHome.count()) > 0

    if (!ctaVisibleEnHome) {
      // Buscar como lo haría el setter: expandir la cartera completa a ver si
      // el camino para cargar/importar vive ahí.
      const toggle = page.getByRole('button', { name: 'Ver toda la cartera' }).filter({ visible: true })
      if ((await toggle.count()) > 0) {
        await toggle.first().click()
        await page.getByRole('searchbox', { name: 'Buscar en tu cartera' }).first().waitFor({ state: 'visible' }).catch(() => undefined)
      }
      await fullShot(page, nextShot('cartera-expandida-sin-cta-visible'))
    }

    // ── PASO 2 — llegar a "Cargar un prospecto" (single-add), donde vive el
    // link a la importación masiva. Si el home no ofreció camino, esto es la
    // navegación FORZADA que un setter real no habría podido hacer solo.
    await page.goto(`${BASE_URL}/setter/nuevo`, { waitUntil: 'networkidle' })
    await fullShot(page, nextShot('cargar-prospecto-con-link-importar'))

    // ── PASO 3 — clickear el link real (no ir directo por URL) hacia la
    // importación, tal como lo haría el setter desde esta pantalla.
    await page.getByRole('link', { name: /Importá varios de una/i }).click()
    await page.waitForURL('**/setter/nuevo/importar')
    await fullShot(page, nextShot('pantalla-importar-primera-vista'))

    // ── PASO 4 — descargar la plantilla (guardamos el archivo como evidencia
    // de qué contiene realmente, sin asumirlo de antemano). ─────────────────
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Descargar plantilla' }).click(),
    ])
    await download.saveAs(path.join(OUT_DIR, '05-plantilla-descargada.csv'))

    // ── PASO 5 — armar el CSV MÁS MÍNIMO posible usando SOLO lo que la
    // propia pantalla explica en el hint corto ("Una fila por negocio. Columna
    // nombre obligatoria."), sin recurrir a la plantilla ni a más columnas.
    const nombre1 = `${TAG} Kiosco Don Mario ${STAMP}`
    const nombre2 = `${TAG} Verduleria La Esquina ${STAMP}`
    const csvMinimo = csvFile('minimo', `nombre\n${nombre1}\n${nombre2}\n`)
    await page.setInputFiles('input[type="file"]', csvMinimo)
    await page.screenshot({ path: nextShot('csv-minimo-preview') })

    // ── PASO 6 — importar esa lista mínima. Se espera el texto DEL REPORTE
    // (no el toast, que puede seguir mostrando un mensaje de un paso previo) y
    // se deja pasar el tiempo de vida del toast para que la captura muestre el
    // estado final, sin mensajes superpuestos de pasos anteriores. ──────────
    await page.getByRole('button', { name: /Importar/i }).click()
    await page.getByText('Entraron fríos, en ficha').waitFor({ state: 'visible' })
    await page.waitForTimeout(4300)
    await fullShot(page, nextShot('csv-minimo-importado-ok'))

    // ── PASO 7 — encabezado incorrecto (ni "nombre" ni ningún alias). ────
    const csvHeaderMalo = csvFile('header-malo', `titulo,detalle\nAlgo,Otra cosa\n`)
    await page.setInputFiles('input[type="file"]', csvHeaderMalo)
    await page.screenshot({ path: nextShot('header-incorrecto-error') })

    // ── PASO 8 — el error MÁS probable de un no-técnico: pegar desde Excel y
    // guardar con TAB en vez de coma (el parser solo separa por coma). ──────
    const csvTabulado = csvFile('tabulado', `nombre\temail\nMi Negocio\thola@x.com\n`)
    await page.setInputFiles('input[type="file"]', csvTabulado)
    await page.screenshot({ path: nextShot('tabulado-en-vez-de-coma-error') })

    // ── PASO 9 — filas con datos mal formados (no rompen la tanda, se
    // reportan). ─────────────────────────────────────────────────────────
    const nombre3 = `${TAG} Almacen Central ${STAMP}`
    const nombre4 = `${TAG} Ferreteria del Barrio ${STAMP}`
    const csvErrores = csvFile(
      'errores',
      `nombre,email,instagram\n${nombre3},no-es-un-email,https://instagram.com/algo\n${nombre4},hola@x.com,instagram.com/sin-protocolo\n`,
    )
    await page.setInputFiles('input[type="file"]', csvErrores)
    await page.screenshot({ path: nextShot('filas-con-errores-preview') })

    await page.getByRole('button', { name: /Importar/i }).click()
    await page.getByText(/filas? con error/).waitFor({ state: 'visible' })
    await page.waitForTimeout(4300)
    await fullShot(page, nextShot('filas-con-errores-reporte'))

    // ── PASO 10 — re-subir la MISMA lista ya importada → duplicado "en tu
    // cartera". ───────────────────────────────────────────────────────────
    await page.setInputFiles('input[type="file"]', csvMinimo)
    await page.getByRole('button', { name: /Importar/i }).click()
    await page.getByText(/duplicados? saltados?/).waitFor({ state: 'visible' })
    await page.waitForTimeout(4300)
    await fullShot(page, nextShot('duplicado-en-tu-cartera'))

    // ── PASO 11 — un negocio que YA existe bajo OTRO setter → duplicado
    // GLOBAL "en el sistema" (el dedup cross-setter del sprint A.2). ────────
    const nombre5 = `${TAG} Nuevo Unico ${STAMP}`
    const csvSistema = csvFile('sistema', `nombre\n${nombreRival}\n${nombre5}\n`)
    await page.setInputFiles('input[type="file"]', csvSistema)
    await page.getByRole('button', { name: /Importar/i }).click()
    await page.getByText(/duplicados? saltados?/).waitFor({ state: 'visible' })
    await page.waitForTimeout(4300)
    await fullShot(page, nextShot('duplicado-en-el-sistema'))

    // ── PASO 12 (bonus) — la misma pantalla en mobile. ──────────────────
    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: 'networkidle' })
    await fullShot(page, nextShot('importar-mobile'))

    console.log('OK — screenshots en', OUT_DIR)
    console.log('CTA de import visible directo en el home:', ctaVisibleEnHome)
  } finally {
    await browser.close()
    // ── Teardown por nombre EXACTO (namespaced TAG + STAMP) — nunca tocar
    // datos ajenos de la cartera compartida de setter-qa. ──────────────────
    const propios = await prisma.osLead.findMany({
      where: { assignedToId: setter.id, businessName: { startsWith: TAG } },
      select: { id: true },
    })
    for (const l of propios) createdLeadIds.push(l.id)
    if (createdLeadIds.length > 0) {
      await prisma.osSetterNotice.deleteMany({ where: { leadId: { in: createdLeadIds } } })
      await prisma.osLead.deleteMany({ where: { id: { in: createdLeadIds } } })
    }
    if (createdUserIds.length > 0) {
      await prisma.osSetterNotice.deleteMany({ where: { setterId: { in: createdUserIds } } })
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
    }
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

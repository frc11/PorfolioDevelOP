/**
 * EL INSTRUMENTO DE LA CARTERA — mide el bloque `Ver toda la cartera` de `/setter`
 * ABIERTO, que es el único estado en el que la cartera es una superficie.
 *
 * Por qué no alcanzaba `medir-panel-setter.ts`: ese mide el panel con la cartera
 * COLAPSADA (su estado inicial), así que el bloque `cartera` sale con la altura
 * del toggle —unos 44 px— y no dice nada de las tarjetas que hay adentro. Lo que
 * este sprint decide depende justamente de eso: cuántas tarjetas entran en el
 * pliegue, cuánto mide la lista, y cuánto cuesta llegar a un negocio puntual.
 *
 * Mismo método que los otros dos instrumentos (P17/P21), sin excepciones:
 *   · el pliegue REAL es `main.clientHeight` (el shell del setter es
 *     `fixed inset-0` y el scroller es el `<main>` interno, no el viewport);
 *   · las alturas son relativas al ORIGEN DEL CONTENIDO del scroller
 *     (`rect.top - mainRect.top + main.scrollTop`), no al viewport;
 *   · sólo cuenta lo VISIBLE, nunca lo meramente presente en el DOM.
 *
 * Y tres censos que el sprint necesita afirmar, no prometer:
 *   1. CENSO POR ESTADO: recorre el filtro de estado opción por opción y anota
 *      cuántos leads reporta cada uno. Es la partición MEDIDA A TRAVÉS DEL
 *      PRODUCTO (`vistaDeLead` es quien decide), no una reimplementación acá.
 *   2. CENSO DE BÚSQUEDA: cuántas acciones cuesta llegar a un negocio por nombre.
 *   3. CENSO DE NOMBRES ACCESIBLES: los controles de la primera tarjeta con su
 *      nombre accesible — el que dice si un botón de ícono está rotulado.
 *
 * Uso:
 *   npx tsx scripts/qa-corridas/medir-cartera.ts
 *   CARTERA_OUT=docs/baselines/p22-cartera-antes.json npx tsx ...
 *   CARTERA_SHOTS=docs/proof-screenshots/p22/antes npx tsx ...
 *   CARTERA_BASE_URL=http://127.0.0.1:3022 npx tsx ...
 *   CARTERA_EMAIL=otro@setter.test npx tsx ...      # p. ej. un setter sin cartera
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

const BASE_URL = process.env.CARTERA_BASE_URL ?? 'http://127.0.0.1:3022'
const SESSION_COOKIE = '__Secure-authjs.session-token'
const OUT_JSON = process.env.CARTERA_OUT ?? null
const SHOTS_DIR = process.env.CARTERA_SHOTS ?? null
const EMAIL = process.env.CARTERA_EMAIL ?? 'setter-qa@develop.test'

const ANCHOS = [
  { nombre: '1440', width: 1440, height: 900 },
  { nombre: '390', width: 390, height: 844 },
] as const

const CARTERA_SEL = 'section[aria-label="Tu cartera completa"]'
/** El toggle que abre la cartera es el primer botón de la sección. */
const TOGGLE_SEL = CARTERA_SEL + ' > button'
/**
 * La tarjeta, con los DOS selectores en uno solo — el mismo recurso que usa
 * `medir-panel-setter.ts` para medir los dos brazos con un archivo: el
 * `data-slot` no existe en el brazo viejo y el estructural deja de valer si el
 * sprint mete grupos. `querySelectorAll` con coma devuelve cada elemento UNA
 * vez, así que donde matcheen los dos no se cuenta doble.
 */
const TARJETA_SEL =
  '[data-slot="tarjeta-cartera"], ' + CARTERA_SEL + ' section[aria-label="Tu cartera"] > div'


/**
 * La jerga que el badge de estado escribe hoy en la tarjeta (`STAGE_LABELS` +
 * el `PERDIDO` de `STATUS_LABELS` + el vacío «Sin ficha»). Va como DATO al
 * navegador —no se importa `flow-content.ts` adentro del `evaluate`— y sirve
 * para contar el badge por su TEXTO, que es lo único que existe en los dos
 * brazos sin instrumentar nada.
 */
const JERGA_ESTADO = [
  'Ficha',
  'Evaluada',
  'Brief',
  'Construcción',
  'En revisión',
  'Aprobada',
  'Rechazada',
  'Descartada',
  'Perdido',
  'Sin ficha',
]

const SELECTORES = { cartera: CARTERA_SEL, tarjeta: TARJETA_SEL, jerga: JERGA_ESTADO }

type Pieza = { top: number; alto: number; entra: boolean }

type Medicion = {
  ancho: string
  email: string
  pliegue: number
  altoTotal: number
  /** La sección de la cartera, ya abierta. */
  cartera: Pieza | null
  /** Cuántas tarjetas hay y cuántas entran ENTERAS en el pliegue de la PÁGINA. */
  tarjetas: number
  tarjetasEnPliegue: number
  /**
   * Cuántas entran ENTERAS en el primer pantallazo DE LA CARTERA — la ventana de
   * un pliegue de alto contada desde donde arranca la sección. El de arriba da 0
   * en los dos anchos y va a seguir dando 0: la cartera vive DEBAJO de la cola
   * (P21 la puso primero a propósito), así que ninguna tarjeta entra en el
   * pliegue de la página. Éste es el número que cambia cuando el setter baja a
   * la cartera, que es el único momento en que la mira.
   */
  tarjetasEnPantallazo: number
  /** Alto de la primera tarjeta — la unidad de la lista. */
  altoTarjeta: number | null
  /** A qué altura arranca la primera tarjeta (cuánto cromo hay por encima). */
  topPrimeraTarjeta: number | null
  censo: Record<string, number>
  nombresAccesibles: string[]
}

/**
 * La geometría de la cartera ABIERTA, medida dentro de la página. Se pasa como
 * FUNCIÓN (no como string) para que los escapes no se degraden; el shim `__name`
 * del contexto la hace sobrevivir al `keepNames` de esbuild.
 */
function radiografiaCartera(sel: { cartera: string; tarjeta: string; jerga: string[] }) {
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

  const geo = (el: Element) => {
    const rect = el.getBoundingClientRect()
    const top = Math.round(rect.top - mainRect.top + main.scrollTop)
    const alto = Math.round(rect.height)
    return { top: top, alto: alto, entra: top < pliegue }
  }

  const seccion = main.querySelector(sel.cartera)
  const cartera = seccion && visible(seccion) ? geo(seccion) : null

  const tarjetas = Array.from(main.querySelectorAll(sel.tarjeta)).filter(visible)
  const geos = tarjetas.map(geo)
  // Entera en el pliegue: no alcanza con que asome — tiene que caber completa.
  const enPliegue = geos.filter((g) => g.top + g.alto <= pliegue).length
  // El primer pantallazo DE LA CARTERA: una ventana de un pliegue de alto
  // contada desde donde arranca la sección.
  const origen = cartera ? cartera.top : 0
  const enPantallazo = geos.filter(
    (g) => g.top >= origen && g.top + g.alto <= origen + pliegue,
  ).length

  const textoDe = (el: Element) => (el.textContent || '').trim()
  const contar = (s: string) =>
    Array.from(main.querySelectorAll(s)).filter(visible).length

  // Nombres accesibles de los controles de la PRIMERA tarjeta: aria-label si lo
  // hay, si no el texto. Un string vacío es exactamente el hallazgo «sin nombre».
  const primera = tarjetas.length > 0 ? tarjetas[0] : null
  const nombres = primera
    ? Array.from(primera.querySelectorAll('button, a'))
        .filter(visible)
        .map((el) => {
          const aria = el.getAttribute('aria-label')
          if (aria && aria.trim() !== '') return aria.trim()
          const t = textoDe(el)
          return t !== '' ? t : '(SIN NOMBRE)'
        })
    : []

  // El badge de estado en JERGA, contado por su TEXTO: es el rótulo que dice lo
  // mismo que la fila de «próximo paso», y contarlo así funciona en los dos
  // brazos sin instrumentar la tarjeta.
  const jerga = new Set(sel.jerga)
  let badgesEstado = 0
  for (const t of tarjetas) {
    badgesEstado += Array.from(t.querySelectorAll('span')).filter((el) => {
      if (el.children.length > 0) return false
      if (!visible(el)) return false
      return jerga.has(textoDe(el))
    }).length
  }

  const censo: Record<string, number> = {
    tarjetas: tarjetas.length,
    badgesEstado: badgesEstado,
    // Encabezados de grupo dentro de la cartera (0 mientras sea lista plana).
    gruposCartera: contar(sel.cartera + ' [data-slot="grupo-cartera"]'),
    buscadores: contar(sel.cartera + ' input[type="search"]'),
    selects: contar(sel.cartera + ' select'),
  }

  // Dónde arranca cada encabezado de grupo, relativo al ORIGEN DE LA CARTERA.
  // Es lo que dice si el mapa de los ocho grupos se ve, o si está a 49 tarjetas
  // de scroll: agrupar orienta sólo si los encabezados se alcanzan.
  const encabezados = Array.from(
    main.querySelectorAll(sel.cartera + ' [data-slot="grupo-cartera"] > button'),
  )
    .filter(visible)
    .map((el) => {
      const g = geo(el)
      return {
        texto: textoDe(el).replace(/\s+/g, ' '),
        desdeLaCartera: g.top - (cartera ? cartera.top : 0),
      }
    })

  return {
    pliegue: pliegue,
    altoTotal: main.scrollHeight,
    cartera: cartera,
    encabezados: encabezados,
    tarjetas: tarjetas.length,
    tarjetasEnPliegue: enPliegue,
    tarjetasEnPantallazo: enPantallazo,
    altoTarjeta: geos.length > 0 ? geos[0].alto : null,
    topPrimeraTarjeta: geos.length > 0 ? geos[0].top : null,
    censo: censo,
    nombresAccesibles: nombres,
  }
}

/** Cuántas tarjetas VISIBLES hay ahora mismo — el número que el setter ve. */
function contarTarjetas(sel: { cartera: string; tarjeta: string }) {
  const main = document.querySelector('main')
  if (!main) return -1
  return Array.from(main.querySelectorAll(sel.tarjeta)).filter((el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false
    const cs = window.getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }).length
}

/** Las opciones que el filtro de estado ofrece HOY (value + rótulo), leídas del DOM. */
function leerOpcionesEstado(sel: { cartera: string }) {
  const main = document.querySelector('main')
  if (!main) return []
  const select = main.querySelector(sel.cartera + ' select')
  if (!select) return []
  return Array.from(select.querySelectorAll('option')).map((o) => ({
    value: (o as HTMLOptionElement).value,
    label: (o.textContent || '').trim(),
  }))
}

/**
 * Abre la cartera si la hay. Un setter que arranca (cero leads) NO tiene
 * cartera: `page.tsx` no monta `CarteraView` y en su lugar va el vacío del
 * panel. Eso no es un error del instrumento — es el estado que hay que poder
 * medir, así que sale como `cartera: null` y `tarjetas: 0` en vez de reventar.
 */
async function abrirCartera(page: Page) {
  const toggle = page.locator(TOGGLE_SEL).first()
  if ((await toggle.count()) === 0) return
  const abierto = await toggle.getAttribute('aria-expanded')
  if (abierto !== 'true') {
    await toggle.click()
    await page.waitForTimeout(300)
  }
}

async function medir(page: Page, ancho: (typeof ANCHOS)[number]): Promise<Medicion> {
  await page.setViewportSize({ width: ancho.width, height: ancho.height })
  await page.goto(BASE_URL + '/setter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  await abrirCartera(page)
  // El pliegue se mide desde arriba de todo: el scroll que dejó el click
  // falsearía las alturas relativas si no se resetea.
  await page.evaluate(() => {
    const m = document.querySelector('main')
    if (m) m.scrollTop = 0
  })
  await page.waitForTimeout(200)

  const r = await page.evaluate(radiografiaCartera, SELECTORES)
  if (!r) throw new Error('no se encontró el <main> del shell del setter')

  if (SHOTS_DIR) {
    const dir = path.resolve(SHOTS_DIR)
    fs.mkdirSync(dir, { recursive: true })
    // El pliegue, no la página entera: agrandar el viewport falsearía el fold.
    // Ojo: acá se ve la COLA (P21 la puso primero), no la cartera.
    await page.screenshot({ path: path.join(dir, 'cartera-' + ancho.nombre + '.png') })

    // Y la cartera de verdad: se lleva el scroller hasta donde arranca la
    // sección y se captura el pantallazo desde ahí — que es exactamente la
    // ventana que mide `tarjetasEnPantallazo`. Sigue sin ser `fullPage`.
    if (r.cartera) {
      await page.evaluate((top: number) => {
        const m = document.querySelector('main')
        if (m) m.scrollTop = top
      }, r.cartera.top)
      await page.waitForTimeout(250)
      await page.screenshot({
        path: path.join(dir, 'cartera-' + ancho.nombre + '-scroll.png'),
      })
      // Y una tercera: los encabezados PLEGADOS. Con «Para trabajar» abierto en
      // 49 tarjetas, el mapa de los otros siete grupos queda a miles de píxeles
      // de scroll — la captura es la prueba de ese costo, no de su ausencia.
      const primerPlegado = r.encabezados.find((e) => e.desdeLaCartera > r.pliegue)
      if (primerPlegado && r.cartera) {
        await page.evaluate((top: number) => {
          const m = document.querySelector('main')
          if (m) m.scrollTop = top
        }, r.cartera.top + primerPlegado.desdeLaCartera - 80)
        await page.waitForTimeout(250)
        await page.screenshot({
          path: path.join(dir, 'cartera-' + ancho.nombre + '-grupos.png'),
        })
      }

      await page.evaluate(() => {
        const m = document.querySelector('main')
        if (m) m.scrollTop = 0
      })
    }
  }

  console.log('\n── cartera · ' + ancho.nombre + ' ──')
  console.log('  pliegue ' + r.pliegue + ' · alto total ' + r.altoTotal)
  const c = r.cartera
  console.log(
    '  sección: ' +
      (c ? 'top ' + c.top + ' · alto ' + c.alto + ' · ' + (c.entra ? 'EN EL PLIEGUE' : 'debajo') : '—'),
  )
  console.log(
    '  tarjetas ' + r.tarjetas + ' · enteras en el pliegue de la página ' + r.tarjetasEnPliegue +
      ' · enteras en el 1er pantallazo de la cartera ' + r.tarjetasEnPantallazo +
      ' · alto de una ' + (r.altoTarjeta ?? '—') +
      ' · la primera arranca en ' + (r.topPrimeraTarjeta ?? '—'),
  )
  console.log('  censo: ' + JSON.stringify(r.censo))
  for (const e of r.encabezados) {
    const entra = e.desdeLaCartera < r.pliegue ? 'en el 1er pantallazo' : 'hay que scrollear'
    console.log('    ' + String(e.desdeLaCartera).padStart(6) + ' px  ' + e.texto + '  — ' + entra)
  }
  console.log('  nombres accesibles (1ª tarjeta): ' + JSON.stringify(r.nombresAccesibles))

  return {
    ancho: ancho.nombre,
    email: EMAIL,
    pliegue: r.pliegue,
    altoTotal: r.altoTotal,
    cartera: r.cartera,
    tarjetas: r.tarjetas,
    tarjetasEnPliegue: r.tarjetasEnPliegue,
    tarjetasEnPantallazo: r.tarjetasEnPantallazo,
    altoTarjeta: r.altoTarjeta,
    topPrimeraTarjeta: r.topPrimeraTarjeta,
    censo: r.censo,
    nombresAccesibles: r.nombresAccesibles,
  }
}

/**
 * Recorre el filtro de estado opción por opción y anota cuántas tarjetas quedan.
 * La partición medida a través del producto: quien decide es `vistaDeLead`, acá
 * sólo se lee lo que la pantalla muestra.
 */
async function censoPorEstado(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE_URL + '/setter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await abrirCartera(page)

  const opciones = await page.evaluate(leerOpcionesEstado, SELECTORES)
  if (opciones.length === 0) {
    console.log('\n── censo por estado (1440) ──\n  sin cartera: el setter no tiene leads')
    return []
  }
  const select = page.locator(CARTERA_SEL + ' select').first()

  const filas: { value: string; label: string; leads: number }[] = []
  console.log('\n── censo por estado (1440) ──')
  for (const op of opciones) {
    await select.selectOption(op.value)
    await page.waitForTimeout(150)
    const n = await page.evaluate(contarTarjetas, SELECTORES)
    filas.push({ value: op.value, label: op.label, leads: n })
    console.log('  ' + op.value.padEnd(20) + String(n).padStart(4) + '  · ' + op.label)
  }
  return filas
}

/**
 * Cuánto cuesta llegar a un negocio por nombre. Cuenta ACCIONES del setter
 * desde el panel recién abierto hasta ver ese negocio y nada más:
 * abrir la cartera (1) + escribir en el buscador (1) = las que haya.
 * Devuelve también cuántas tarjetas quedan (1 = llegó).
 */
async function censoBusqueda(page: Page, nombre: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE_URL + '/setter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  let acciones = 0
  const toggle = page.locator(TOGGLE_SEL).first()
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click()
    acciones += 1
    await page.waitForTimeout(300)
  }
  const buscador = page.locator(CARTERA_SEL + ' input[type="search"]').first()
  await buscador.fill(nombre)
  acciones += 1
  await page.waitForTimeout(250)
  const quedan = await page.evaluate(contarTarjetas, SELECTORES)

  console.log('\n── censo de búsqueda (1440) ──')
  console.log('  negocio buscado: ' + JSON.stringify(nombre))
  console.log('  acciones hasta verlo: ' + acciones + ' · tarjetas en la lista: ' + quedan)
  return { nombre: nombre, acciones: acciones, quedan: quedan }
}

/**
 * El nombre de un negocio real de la cartera, para no buscar uno inventado — y
 * a propósito uno del ARCHIVO, que es el caso peor: un grupo que la cartera no
 * abre sola y que, en la lista plana de antes, quedaba al final de las 84. Si
 * llegar ahí cuesta lo mismo que llegar a cualquier otro, la búsqueda no depende
 * del grupo, que es justamente lo que hay que poder afirmar.
 */
async function unNombreReal(page: Page): Promise<string> {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE_URL + '/setter', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await abrirCartera(page)
  const select = page.locator(CARTERA_SEL + ' select').first()
  if ((await select.count()) === 0) return ''
  // Filtrar al archivo para poder leer un nombre de ahí; la medición de la
  // búsqueda arranca después con la página recargada, sin este filtro puesto.
  await select.selectOption('archivo-perdido')
  await page.waitForTimeout(250)
  const nombres = await page.evaluate((sel: { cartera: string; tarjeta: string }) => {
    const main = document.querySelector('main')
    if (!main) return []
    // ⚠️ `sel.tarjeta` es una lista separada por comas: concatenarle ' h3' se lo
    // pega SOLO a la última alternativa, y la primera queda matcheando la
    // tarjeta entera. (Medido: el nombre del negocio salía siendo el texto
    // completo de la card.) Hay que descender en cada alternativa por separado.
    const conH3 = sel.tarjeta
      .split(',')
      .map((s) => s.trim() + ' h3')
      .join(', ')
    return Array.from(main.querySelectorAll(conH3)).map((h) => (h.textContent || '').trim())
  }, SELECTORES)
  // El ÚLTIMO de la lista: el caso peor para «recorrer hasta encontrarlo».
  return process.env.CARTERA_BUSCAR ?? (nombres.length > 0 ? nombres[nombres.length - 1] : '')
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const setter = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true },
  })
  if (!setter) throw new Error('no existe el setter ' + EMAIL)

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
      // El nombre lleva el prefijo `__Secure-`: Chrome rechaza la cookie si no
      // se declara `secure` (mismo par que `medir-panel-setter.ts`).
      secure: true,
      sameSite: 'Lax',
    },
  ])

  const page = await context.newPage()
  const mediciones: Medicion[] = []
  for (const ancho of ANCHOS) {
    mediciones.push(await medir(page, ancho))
  }
  const estados = await censoPorEstado(page)
  const nombre = await unNombreReal(page)
  const busqueda = nombre !== '' ? await censoBusqueda(page, nombre) : null

  await browser.close()
  await prisma.$disconnect()

  if (OUT_JSON) {
    const out = path.resolve(OUT_JSON)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(
      out,
      JSON.stringify({ mediciones, estados, busqueda }, null, 2) + '\n',
      'utf8',
    )
    console.log('\n→ ' + out)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

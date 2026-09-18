import { test } from '@playwright/test'
import { qaLogin } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P33 — LA CARRERA DEL CARTEL: ¿el aserto llega tarde, o el cartel no llega?
 *
 * NO es una suite de regresión (vive en `tests/perf`, que se corre a mano).
 *
 *   npx playwright test --config=playwright.perf.config.ts carrera-del-cartel
 *   CARRERA_FRENO=6 CARRERA_PASADAS=6 npx playwright test … carrera-del-cartel
 *
 * ── Lo que las tres versiones anteriores midieron ───────────────────────────
 * v1 y v2 reprodujeron el rojo, las dos veces en la PRIMERA pasada de B8 (la que
 * paga el render frío de la ruta): aserto agotado a los 15 s. v2 lo midió con
 * 841 muestras a lo largo de 14 s y CERO carteles con el texto esperado — el
 * aserto no llegó tarde a un cartel que se fue: esperó 15 s un cartel que no
 * apareció. v3 salió verde en las dos pasadas, con el cartel a 4.176 ms.
 *
 * ── El discriminador, y por qué esta versión frena el CPU ────────────────────
 * Los cuatro tests que flakean (`01-flow` B1/B3/B4/B8) navegan a la RAÍZ del
 * lead, que redirige en cadena hasta la pantalla derivada; los que navegan
 * directo con `pantalla(leadId, 'mX')` (B2, B6) NUNCA flakearon. v3 midió esa
 * cadena en frío: `/leads/X` → `/manual` → `/manual/m15`, y termina a 1.465 ms.
 * El test clickea el botón apenas Playwright lo ve accionable — que puede ser
 * ANTES del último salto de la cadena.
 *
 * Esperar a que el server se enfríe para volver a verlo cuesta un build por
 * intento. El freno de CPU (CDP `Emulation.setCPUThrottlingRate`) estira la
 * misma ventana contra un server tibio: no toca el producto ni el test real,
 * sólo hace observable la carrera muchas veces seguidas.
 *
 * ── La pregunta que contesta, y de quién es el defecto según la respuesta ────
 * En la pasada ROJA, ¿la acción escribió en la BASE?
 *
 *   · escribió y NO acusó → la acción corrió y se perdió el acuse: defecto de
 *     PRODUCTO. El encargo manda frenar y reportar.
 *   · no escribió        → el clic se perdió con el remonte de la cadena: el
 *     test actuó antes de que la pantalla estuviera asentada. Defecto del TEST.
 */

const VENTANA_MS = 14_000
const PASADAS = Number(process.env.CARRERA_PASADAS ?? 2)
/** Multiplicador de freno de CPU. 1 = sin freno. */
const FRENO = Number(process.env.CARRERA_FRENO ?? 1)

type Marca = { t: number; avisos: string[]; visibles: string[]; ruta: string }

type Linea = {
  caso: string
  carteles: { texto: string; desdeMs: number; hastaMs: number; visible: boolean }[]
  navegaciones: { ms: number; url: string }[]
  rutas: { ms: number; ruta: string }[]
  consola: string[]
  /** Cuánto tardó el `click()` de Playwright en volver: incluye la espera de
   *  accionabilidad, que es donde la cadena de redirecciones se cruza. */
  clickMs: number
  asertoMs: number
  asertoVerde: boolean
  marcas: number
  /** LA VERDAD DURABLE: ¿la acción escribió? Es lo que separa test de producto. */
  enBase: boolean
}

async function instalarRegistrador(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    type Marca = { t: number; avisos: string[]; visibles: string[]; ruta: string }
    type Estado = { t0: number | null; marcas: Marca[] }
    const leer = (): Estado => {
      try {
        const crudo = sessionStorage.getItem('__carrera')
        if (crudo) return JSON.parse(crudo) as Estado
      } catch {
        /* sessionStorage puede no estar */
      }
      return { t0: null, marcas: [] }
    }
    const estado = leer()
    ;(window as unknown as { __carrera?: Estado }).__carrera = estado
    const guardar = () => {
      try {
        sessionStorage.setItem('__carrera', JSON.stringify(estado))
      } catch {
        /* ídem */
      }
    }

    const mirar = (): { avisos: string[]; visibles: string[] } => {
      const avisos: string[] = []
      const visibles: string[] = []
      for (const el of Array.from(document.querySelectorAll('[data-sonner-toast]'))) {
        const texto = (el.textContent ?? '').trim().slice(0, 120)
        avisos.push(texto)
        // `toBeVisible` de Playwright = caja no vacía y sin `visibility:hidden`.
        const r = (el as HTMLElement).getBoundingClientRect()
        if (r.width > 0 && r.height > 0 && getComputedStyle(el as HTMLElement).visibility !== 'hidden') {
          visibles.push(texto)
        }
      }
      return { avisos, visibles }
    }

    const cuadro = () => {
      if (estado.t0 === null) return
      const t = Date.now() - estado.t0
      const { avisos, visibles } = mirar()
      estado.marcas.push({ t, avisos, visibles, ruta: location.pathname })
      guardar()
      if (t < 14_000) requestAnimationFrame(cuadro)
    }

    // El muestreo se reanuda solo en el documento siguiente: la navegación no
    // puede dejar un hueco en la serie.
    if (estado.t0 !== null && Date.now() - estado.t0 < 14_000) requestAnimationFrame(cuadro)
    ;(window as unknown as { __arrancar?: () => void }).__arrancar = () => {
      estado.t0 = Date.now()
      estado.marcas = []
      guardar()
      requestAnimationFrame(cuadro)
    }
  })
}

async function armar(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __arrancar?: () => void }
    if (!w.__arrancar) throw new Error('el registrador no está instalado en este documento')
    w.__arrancar()
  })
}

async function cosechar(page: import('@playwright/test').Page): Promise<Marca[]> {
  return page.evaluate(() => {
    type Marca = { t: number; avisos: string[]; visibles: string[]; ruta: string }
    try {
      const crudo = sessionStorage.getItem('__carrera')
      if (crudo) return (JSON.parse(crudo) as { marcas: Marca[] }).marcas ?? []
    } catch {
      /* noop */
    }
    return [] as Marca[]
  })
}

function tramos(marcas: readonly Marca[]): Linea['carteles'] {
  const porTexto = new Map<string, { desdeMs: number; hastaMs: number; visible: boolean }>()
  for (const m of marcas) {
    for (const texto of m.avisos) {
      const previo = porTexto.get(texto)
      const visible = m.visibles.includes(texto)
      if (previo === undefined) porTexto.set(texto, { desdeMs: m.t, hastaMs: m.t, visible })
      else {
        previo.hastaMs = m.t
        previo.visible = previo.visible || visible
      }
    }
  }
  return [...porTexto.entries()].map(([texto, v]) => ({ texto, ...v }))
}

function rutasDistintas(marcas: readonly Marca[]): Linea['rutas'] {
  const out: Linea['rutas'] = []
  for (const m of marcas) {
    if (out.length === 0 || out[out.length - 1].ruta !== m.ruta) out.push({ ms: m.t, ruta: m.ruta })
  }
  return out
}

async function cronometrarAserto(
  page: import('@playwright/test').Page,
  texto: RegExp,
): Promise<{ ms: number; verde: boolean }> {
  const { expect } = await import('@playwright/test')
  const aviso = page.locator('[data-sonner-toast]').filter({ hasText: texto })
  const t0 = Date.now()
  try {
    await expect(firstVisible(aviso)).toBeVisible({ timeout: 15_000 })
    return { ms: Date.now() - t0, verde: true }
  } catch {
    return { ms: Date.now() - t0, verde: false }
  }
}

const tracker: SmokeTracker = newTracker()
let setterId: string
const lineas: Linea[] = []

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  console.log(`\n══ P33 · LA CARRERA DEL CARTEL (freno CPU ×${FRENO}) ` + '═'.repeat(34))
  for (const l of lineas) {
    console.log(`\n── ${l.caso}`)
    console.log(
      `   click ${l.clickMs} ms · aserto ${l.asertoMs} ms · ${l.asertoVerde ? 'VERDE' : 'ROJO'} · ${l.marcas} muestras · EN BASE: ${l.enBase ? 'SÍ' : 'NO'}`,
    )
    console.log(`   carteles (${l.carteles.length}):`)
    for (const c of l.carteles) {
      console.log(`     [${c.desdeMs}→${c.hastaMs} ms · ${c.visible ? 'visible' : 'INVISIBLE'}] ${c.texto}`)
    }
    console.log(`   rutas: ${l.rutas.map((r) => `${r.ms}ms ${r.ruta.replace(/^.*\/leads\/[^/]+/, '…')}`).join('  |  ')}`)
    if (l.consola.length) console.log(`   consola: ${l.consola.join(' || ')}`)
  }
  const rojas = lineas.filter((l) => !l.asertoVerde)
  console.log(`\n── SALDO: ${lineas.length - rojas.length} verdes · ${rojas.length} rojas`)
  if (rojas.length) {
    console.log(
      `   de las rojas: ${rojas.filter((l) => l.enBase).length} con la acción EN BASE (defecto de producto) · ` +
        `${rojas.filter((l) => !l.enBase).length} sin escribir (el clic se perdió — defecto del test)`,
    )
  }
  console.log('\n' + '═'.repeat(80) + '\n')
  console.log('JSON:' + JSON.stringify(lineas))
  await teardown(tracker)
  await disconnect()
})

/**
 * B8 desde la RAÍZ, textual como `01-flow`: `goto('/setter/leads/{id}')` y el
 * clic apenas el botón es accionable. Es el camino que flakeó en P28.
 */
test('B8 · registrar el envío desde la raíz — qué se emite y qué no', async ({ page }) => {
  test.setTimeout(PASADAS * 150_000)
  await instalarRegistrador(page)

  if (FRENO > 1) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: FRENO })
  }

  const consola: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') consola.push(`[console] ${m.text().slice(0, 200)}`)
  })
  page.on('pageerror', (e) => consola.push(`[pageerror] ${String(e).slice(0, 200)}`))

  for (let i = 0; i < PASADAS; i++) {
    const { id: leadId } = await createLead(tracker, {
      setterId,
      businessName: `P33 Envio ${i}`,
      stage: 'APROBADA',
      status: 'RESPONDIO',
      finalUrl: 'https://sonda-p33.develop.com.ar',
    })
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    const navegaciones: { ms: number; url: string }[] = []
    const reloj = { t0: 0 }
    const onNav = (f: { url(): string }) => {
      if (reloj.t0) navegaciones.push({ ms: Date.now() - reloj.t0, url: f.url().replace(/^https?:\/\/[^/]+/, '') })
    }

    const antes = consola.length
    await armar(page)
    page.on('framenavigated', onNav)
    reloj.t0 = Date.now()
    await firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i })).click()
    const clickMs = Date.now() - reloj.t0

    const aserto = await cronometrarAserto(page, /Demo enviada registrada/i)
    await page.waitForTimeout(Math.max(0, VENTANA_MS - aserto.ms))
    page.off('framenavigated', onNav)

    const marcas = await cosechar(page)
    const dossier = await getDossier(leadId)
    lineas.push({
      caso: `B8 raíz · pasada ${i + 1}`,
      carteles: tramos(marcas),
      navegaciones,
      rutas: rutasDistintas(marcas),
      consola: consola.slice(antes),
      clickMs,
      asertoMs: aserto.ms,
      asertoVerde: aserto.verde,
      marcas: marcas.length,
      enBase: dossier?.enviadaAt != null,
    })
  }
})

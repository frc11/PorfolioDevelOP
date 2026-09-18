/**
 * P42 · SONDA — ¿el rojo intermitente de `32-brief-cuatro-vueltas` B es del
 * producto o del instrumento?
 *
 * La prueba B falla con «exactamente una vuelta desplegada — Received: ["1 ·
 * Lectura estética", "2 · Decisiones"]». Su helper `vueltaAbierta` lee los cuatro
 * `aria-expanded` con CUATRO viajes en serie: si el avance ocurre entre la lectura
 * de la cabecera 1 y la de la 2, junta un estado viejo y uno nuevo y ve dos
 * abiertas aunque la pantalla nunca las haya tenido.
 *
 * El discriminador: un `MutationObserver` DENTRO de la página, que después de cada
 * tanda de cambios cuenta las cabeceras desplegadas en una sola lectura. Si ese
 * conteo llega a 2, la pantalla tuvo dos vueltas abiertas a la vez (producto). Si
 * nunca pasa de 1, el rojo lo fabrica la lectura en serie (instrumento).
 *
 * Reproduce los pasos de B: abrir m6, pegar la vuelta 1, hacer click en «Tono»,
 * escribir, esperar a que se abra la 2. N vueltas sobre leads propios, borrados
 * por id (registro de siembra activado).
 *
 * Uso: SONDA_BASE=http://127.0.0.1:3003 SONDA_N=10 npx tsx scripts/p42-sonda-vueltas.mts
 */
import { chromium, type Page } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import { encode } from 'next-auth/jwt'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import { VUELTA_LECTURA } from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DATABASE_URL = process.env.DATABASE_URL ?? ''
if (!DATABASE_URL.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}
const BASE = process.env.SONDA_BASE ?? 'http://127.0.0.1:3003'
const N = Number(process.env.SONDA_N ?? 10)
const COOKIE = '__Secure-authjs.session-token'
const CABECERAS = ['1 · Lectura estética', '2 · Decisiones', '3 · Especificación', '4 · Caza de huecos']

const campo = (page: Page, label: string) =>
  page
    .locator(`xpath=//label[contains(normalize-space(.), "${label}")]/parent::div//*[self::input or self::textarea][1]`)
    .filter({ visible: true })
    .first()

async function main() {
  const registro = await import('../tests/helpers/siembra-registro.ts')
  registro.activarRegistro(DATABASE_URL)
  const db = await import('../tests/helpers/setter-db.ts')
  const tracker = db.newTracker()
  const qa = await db.getSetterQa()
  const browser = await chromium.launch({ args: ['--no-proxy-server', '--proxy-bypass-list=*'] })
  const filas: { vuelta: number; maxAbiertasEnElDom: number; lecturaEnSerieVioDos: boolean; avanzo: boolean }[] = []
  try {
    const token = await encode({
      secret: process.env.AUTH_SECRET!,
      salt: COOKIE,
      maxAge: 3600,
      token: { sub: qa.id, email: qa.email, name: qa.email, picture: null, role: 'SETTER', provider: 'qa-bypass', onboardingCompleted: false, passwordResetRequired: false },
    })
    for (let i = 0; i < N; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      await ctx.addCookies([{ name: COOKIE, value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }])
      const page = await ctx.newPage()
      page.on('dialog', (d) => d.accept().catch(() => undefined))
      const lead = await db.createLead(tracker, { setterId: qa.id, businessName: `P42 sonda vueltas ${i}`, stage: 'EVALUADA', status: 'RESPONDIO' })
      await page.goto(`${BASE}/setter/leads/${lead.id}/manual/m6`, { waitUntil: 'domcontentloaded' })

      const cabecera1 = page.getByRole('button', { name: CABECERAS[0] }).filter({ visible: true }).first()
      await cabecera1.waitFor({ state: 'visible' })
      // Pegar como la prueba: reintentar hasta que la cabecera diga «Pegada».
      for (let intento = 0; intento < 20; intento++) {
        await campo(page, 'Lo que devolvió el Gem — vuelta 1').fill(VUELTA_LECTURA)
        try {
          await cabecera1.getByText('Pegada').waitFor({ state: 'visible', timeout: 1000 })
          break
        } catch {
          /* antes de hidratar */
        }
      }

      // El observador: después de cada tanda de cambios, cuántas desplegadas hay (una sola lectura).
      // Como texto y no como función: tsx le agrega a las funciones con nombre un
      // `__name(...)` que no existe dentro de la página.
      await page.evaluate(`(() => {
        const nombres = ${JSON.stringify(CABECERAS)};
        window.__maxAbiertas = 0;
        function contar() {
          const botones = Array.from(document.querySelectorAll('main button[aria-expanded]'))
            .filter((b) => nombres.some((n) => (b.textContent || '').includes(n)))
            .filter((b) => b.offsetParent !== null);
          return botones.filter((b) => b.getAttribute('aria-expanded') === 'true').length;
        }
        window.__maxAbiertas = contar();
        new MutationObserver(() => { window.__maxAbiertas = Math.max(window.__maxAbiertas, contar()); })
          .observe(document.body, { attributes: true, attributeFilter: ['aria-expanded'], subtree: true, childList: true });
      })()`)

      // La lectura EN SERIE de la prueba, corriendo en paralelo al avance.
      let lecturaEnSerieVioDos = false
      let seguir = true
      const lector = (async () => {
        while (seguir) {
          const abiertas: string[] = []
          for (const nombre of CABECERAS) {
            const b = page.getByRole('button', { name: nombre }).filter({ visible: true }).first()
            if ((await b.getAttribute('aria-expanded').catch(() => null)) === 'true') abiertas.push(nombre)
          }
          if (abiertas.length > 1) lecturaEnSerieVioDos = true
        }
      })()

      const tono = campo(page, 'Tono')
      await tono.click()
      await page.keyboard.type('cercano')
      let avanzo = false
      const hasta = Date.now() + 8000
      while (Date.now() < hasta) {
        const exp = await page.getByRole('button', { name: CABECERAS[1] }).filter({ visible: true }).first().getAttribute('aria-expanded')
        if (exp === 'true') {
          avanzo = true
          break
        }
        await page.waitForTimeout(50)
      }
      await page.waitForTimeout(600)
      seguir = false
      await lector
      const maxAbiertasEnElDom = Number(await page.evaluate('window.__maxAbiertas'))
      filas.push({ vuelta: i + 1, maxAbiertasEnElDom, lecturaEnSerieVioDos, avanzo })
      console.log(JSON.stringify(filas[filas.length - 1]))
      await ctx.close()
    }
  } finally {
    await browser.close()
    await db.teardown(tracker)
    await db.disconnect()
  }
  console.log(
    `resumen: ${filas.length} vueltas · el DOM tuvo dos abiertas en ${filas.filter((f) => f.maxAbiertasEnElDom > 1).length} · ` +
      `la lectura en serie vio dos en ${filas.filter((f) => f.lecturaEnSerieVioDos).length} · avanzó en ${filas.filter((f) => f.avanzo).length}`,
  )
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})

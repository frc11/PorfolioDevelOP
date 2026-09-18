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
 * P34 · LA CADENA CONTRA LA URL CANÓNICA — el control que aísla la causa.
 *
 * NO es una suite de regresión. Corre contra la VARIANTE DIAGNÓSTICA de
 * `src/lib/use-step-action.ts` (la que anota las etapas de `run()` en
 * `sessionStorage`). Sin ella, `etapas` sale vacío y el reporte lo dice.
 *
 *   PERF_EXTERNAL_SERVER=1 PERF_PORT=3005 \
 *     npx playwright test --config=playwright.perf.config.ts p34-cadena
 *
 * ── Qué decide ──────────────────────────────────────────────────────────────
 * Medido en P34: el acuse se pierde cuando NACE UN DOCUMENTO NUEVO DESPUÉS del
 * despacho de la action. La cadena `/leads/{id}` → `/manual` → `/manual/m{n}`
 * son dos `redirect()` de server component; si su último salto aterriza con la
 * action en vuelo, se lleva puesto el contexto JS que tenía la promesa, y la
 * continuación —`onSuccess` y el `toast`— NO CORRE NUNCA. El servidor ya
 * persistió. Discriminador perfecto: 12 de 12.
 *
 * El control: la MISMA acción, la misma carga dura, pero entrando por la URL
 * canónica de la pantalla (`…/manual/m15`), donde no hay cadena. Si ahí no se
 * pierde ningún acuse, la cadena queda aislada como la causa y no hace falta
 * invocar nada del lane suspendido.
 *
 * NO MEDIDO — y es la pregunta abierta que decide el alcance en producción: la
 * entrada BLANDA (`router.push()` desde «Trabajar» en la cola), que es la puerta
 * real del setter. Un primer intento no encontró el botón en el panel para un
 * lead en APROBADA/RESPONDIO y se descartó en vez de dejarlo a medias. Lo que sí
 * consta: la cadena SÍ se recorre con carga dura, y a eso se llega con un F5,
 * un marcador o un deep link sobre la raíz del lead.
 */

const VENTANA_MS = 12_000
const PASADAS = Number(process.env.P34_PASADAS ?? 3)

type Linea = {
  caso: string
  documentos: string[]
  etapas: string[]
  carteles: number
  enBase: boolean
}

const tracker: SmokeTracker = newTracker()
let setterId: string
const lineas: Linea[] = []

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  console.log('\n══ P34 · ENTRADA DURA vs BLANDA ' + '═'.repeat(46))
  for (const l of lineas) {
    const despacho = l.etapas.find((e) => e.startsWith('despacho'))
    const tDespacho = despacho ? Number(despacho.match(/\+(-?\d+)ms/)?.[1] ?? NaN) : NaN
    const despues = l.documentos.filter((d) => Number(d.match(/^(-?\d+)ms/)?.[1] ?? -1) > tDespacho)
    const llegoElAcuse = l.etapas.some((e) => e.startsWith('pidio-'))
    console.log(`\n── ${l.caso}`)
    console.log(
      `   documentos después del despacho: ${despues.length}` +
        `${despues.length ? ` → [${despues.join(' | ')}]` : ''}`,
    )
    console.log(`   documentos: [${l.documentos.join(' | ')}]`)
    console.log(`   etapas de run(): [${l.etapas.join(' | ')}]`)
    console.log(
      `   acuse pedido: ${llegoElAcuse ? 'SÍ' : 'NO'} · carteles=${l.carteles} · ` +
        `EN BASE: ${l.enBase ? 'SÍ' : 'NO'}`,
    )
  }
  const porCaso = (pre: string) => lineas.filter((l) => l.caso.startsWith(pre))
  for (const pre of ['CADENA', 'DIRECTA']) {
    const grupo = porCaso(pre)
    const perdidos = grupo.filter((l) => !l.etapas.some((e) => e.startsWith('pidio-')))
    console.log(
      `\n   ${pre}: ${grupo.length - perdidos.length}/${grupo.length} con acuse · ` +
        `${perdidos.length} perdidos`,
    )
  }
  console.log('\n' + '═'.repeat(80) + '\n')
  await teardown(tracker)
  await disconnect()
})

async function instalar(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    type Estado = { t0: number | null; carteles: number; nac: string[] }
    const leer = (): Estado => {
      try {
        const c = sessionStorage.getItem('__p34e')
        if (c) return JSON.parse(c) as Estado
      } catch {
        /* noop */
      }
      return { t0: null, carteles: 0, nac: [] }
    }
    const estado = leer()
    estado.nac.push(
      `${Date.now()}|${window.top === window.self ? 'top' : 'iframe'}|${location.pathname.replace(/^.*\/leads\/[^/]+/, '…')}`,
    )
    const guardar = () => {
      try {
        sessionStorage.setItem('__p34e', JSON.stringify(estado))
      } catch {
        /* noop */
      }
    }
    guardar()
    const cuadro = () => {
      if (estado.t0 === null) return
      const n = document.querySelectorAll('[data-sonner-toast]').length
      if (n > estado.carteles) estado.carteles = n
      guardar()
      if (Date.now() - estado.t0 < 12_000) requestAnimationFrame(cuadro)
    }
    if (estado.t0 !== null && Date.now() - estado.t0 < 12_000) requestAnimationFrame(cuadro)
    ;(window as unknown as { __arrancar?: () => void }).__arrancar = () => {
      estado.t0 = Date.now()
      estado.carteles = 0
      estado.nac = [`${Date.now()}|top|arrancar`]
      guardar()
      try {
        sessionStorage.removeItem('__runDiag')
      } catch {
        /* noop */
      }
      requestAnimationFrame(cuadro)
    }
  })
}

async function cosechar(
  page: import('@playwright/test').Page,
): Promise<{ documentos: string[]; etapas: string[]; carteles: number }> {
  return page.evaluate(() => {
    const leerJson = <T,>(llave: string, pd: T): T => {
      try {
        const c = sessionStorage.getItem(llave)
        return c ? (JSON.parse(c) as T) : pd
      } catch {
        return pd
      }
    }
    const e = leerJson('__p34e', { t0: 0, carteles: 0, nac: [] as string[] })
    const run = leerJson<string[]>('__runDiag', [])
    const t0 = e.t0 ?? 0
    return {
      documentos: e.nac.map((m) => {
        const [abs, donde, ruta] = m.split('|')
        return `${Number(abs) - t0}ms ${donde} ${ruta}`
      }),
      etapas: run.map((m) => {
        const i = m.lastIndexOf('@')
        return `${m.slice(0, i)}+${Number(m.slice(i + 1)) - t0}ms`
      }),
      carteles: e.carteles,
    }
  })
}

test('la misma acción, por la cadena y por la URL canónica', async ({ page }) => {
  test.setTimeout(PASADAS * 2 * 120_000)
  await instalar(page)

  for (const entrada of ['CADENA', 'DIRECTA'] as const) {
    for (let i = 0; i < PASADAS; i++) {
      const { id: leadId } = await createLead(tracker, {
        setterId,
        businessName: `P34 ${entrada} ${i}`,
        stage: 'APROBADA',
        status: 'RESPONDIO',
        finalUrl: 'https://sonda-p34.develop.com.ar',
      })
      await qaLogin(page, 'setter')

      if (entrada === 'CADENA') {
        // Por la RAÍZ del lead: dos `redirect()` de server component. Lo que
        // hacen las suites hoy, y lo que pasa con un F5 o un deep link.
        await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })
      } else {
        // CONTROL: la MISMA acción y la misma carga dura, pero entrando por la
        // URL canónica de la pantalla. Sin cadena de redirecciones no hay salto
        // que pueda aterrizar tarde. Si acá no se pierde ningún acuse, la
        // cadena queda aislada como la causa.
        await page.goto(`/setter/leads/${leadId}/manual/m15`, { waitUntil: 'domcontentloaded' })
      }

      await page.evaluate(() => {
        const w = window as unknown as { __arrancar?: () => void }
        if (!w.__arrancar) throw new Error('la sonda no está instalada')
        w.__arrancar()
      })

      await firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i })).click()
      await page.waitForTimeout(VENTANA_MS)

      const cosecha = await cosechar(page)
      const dossier = await getDossier(leadId)
      lineas.push({
        caso: `${entrada} · pasada ${i + 1}`,
        ...cosecha,
        enBase: dossier?.enviadaAt != null,
      })
    }
  }
})

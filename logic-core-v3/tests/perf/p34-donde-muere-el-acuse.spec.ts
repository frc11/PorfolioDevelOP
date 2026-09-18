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
 * P34 · ¿DÓNDE MUERE EL ACUSE? — la sonda que separa las tres posibilidades.
 *
 * NO es una suite de regresión. Corre contra la VARIANTE DIAGNÓSTICA de
 * `src/lib/acuse.ts` (la que anota `pedidos`/`emitidos` en `sessionStorage` y
 * lee `__acuseDelay`). Sin esa variante compilada los contadores salen en 0 y la
 * corrida no dice nada — el reporte lo marca en vez de dar un falso «murió acá».
 *
 *   PERF_EXTERNAL_SERVER=1 PERF_PORT=3005 P34_DELAY=0 \
 *     npx playwright test --config=playwright.perf.config.ts p34-donde-muere
 *
 * ── Qué separa ──────────────────────────────────────────────────────────────
 * Sacar el acuse de la transición con `setTimeout(…, 0)` NO arregló el defecto:
 * 2 de 6 pasadas con server nuevo siguen perdiendo el cartel. Tres causas dan el
 * mismo síntoma y se arreglan en lugares distintos:
 *
 *   A. El `setTimeout` no corre     → `pedidos > 0` y `emitidos === 0`.
 *   B. Corre, sonner publica, y el render del root SUSPENDE igual, así que el
 *      `setState` del <Toaster> no commitea
 *                                   → `emitidos > 0` y `carteles === 0`.
 *   C. Es sólo timing: el disparo cae adentro de la ventana de la carrera
 *      (~0,8-1,1 s, medido en P30 §4)
 *                                   → con `P34_DELAY` grande, el cartel aparece.
 *
 * ── TODO viaja por sessionStorage, y no es un detalle ───────────────────────
 * El camino B8 entra por la RAÍZ del lead y encadena redirecciones con
 * navegación dura. Un contador en `window` se resetea a mitad de la medición: la
 * primera versión de esta sonda informó `carteles=0` en pasadas donde el sampler
 * simplemente había muerto con el documento anterior, y `t0=0` fue lo que la
 * delató. Mismo remedio que usó P33 en `carrera-del-cartel`.
 */

const VENTANA_MS = 14_000
const PASADAS = Number(process.env.P34_PASADAS ?? 2)
const DELAY = Number(process.env.P34_DELAY ?? 0)

type Linea = {
  caso: string
  instrumentado: boolean
  pedidos: number
  emitidos: number
  marcasAcuse: string[]
  etapas: string[]
  carteles: number
  muestras: number
  documentos: number
  nacimientos: string[]
  enBase: boolean
}

const tracker: SmokeTracker = newTracker()
let setterId: string
const lineas: Linea[] = []

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  console.log(`\n══ P34 · DÓNDE MUERE EL ACUSE (delay=${DELAY} ms) ` + '═'.repeat(30))
  for (const l of lineas) {
    const veredicto = !l.instrumentado
      ? '⚠ SIN INSTRUMENTAR — el build no tiene la variante diagnóstica'
      : l.pedidos === 0
        ? `el acuse NI SE PIDIÓ — run() llegó hasta: ${l.etapas[l.etapas.length - 1] ?? '(nada)'}`
        : l.emitidos === 0
          ? 'A · el setTimeout NO CORRIÓ'
          : l.carteles === 0
            ? 'B · sonner publicó y el <Toaster> NO COMMITEÓ'
            : 'cartel montado'
    console.log(`\n── ${l.caso}`)
    console.log(
      `   pedidos=${l.pedidos} · emitidos=${l.emitidos} · carteles=${l.carteles} · ` +
        `${l.muestras} muestras en ${l.documentos} documento(s) · EN BASE: ${l.enBase ? 'SÍ' : 'NO'}`,
    )
    console.log(`   documentos: [${l.nacimientos.join(' | ')}]`)
    console.log(`   etapas de run(): [${l.etapas.join(' | ')}]`)
    console.log(`   marcas de acuse: [${l.marcasAcuse.join(' | ')}]`)
    console.log(`   veredicto: ${veredicto}`)
  }
  console.log('\n' + '═'.repeat(80) + '\n')
  await teardown(tracker)
  await disconnect()
})

test('B8 desde la raíz — dónde se corta la cadena del acuse', async ({ page }) => {
  test.setTimeout(PASADAS * 150_000)

  await page.addInitScript((demora: number) => {
    type Estado = { t0: number | null; muestras: number; carteles: number; docs: number; nac: string[] }
    const leer = (): Estado => {
      try {
        const crudo = sessionStorage.getItem('__p34')
        if (crudo) return JSON.parse(crudo) as Estado
      } catch {
        /* noop */
      }
      return { t0: null, muestras: 0, carteles: 0, docs: 0, nac: [] as string[] }
    }
    const estado = leer()
    estado.docs++
    // La HORA DE NACIMIENTO de cada documento. Es lo único que distingue «la
    // promesa nunca resolvió» de «el documento se murió con la promesa adentro»:
    // si nace un documento DESPUÉS del despacho, la continuación no se perdió,
    // se la llevó puesta la navegación.
    estado.nac.push(
      `${Date.now()}|${window.top === window.self ? 'top' : 'iframe'}|${location.pathname.replace(/^.*\/leads\/[^/]+/, '…')}`,
    )
    const guardar = () => {
      try {
        sessionStorage.setItem('__p34', JSON.stringify(estado))
        sessionStorage.setItem('__acuseDelay', String(demora))
      } catch {
        /* noop */
      }
    }
    guardar()
    ;(window as unknown as { __acuseDelay?: number }).__acuseDelay = demora

    const cuadro = () => {
      if (estado.t0 === null) return
      estado.muestras++
      const n = document.querySelectorAll('[data-sonner-toast]').length
      if (n > estado.carteles) estado.carteles = n
      guardar()
      if (Date.now() - estado.t0 < 14_000) requestAnimationFrame(cuadro)
    }
    // Se reanuda solo en el documento siguiente: la navegación dura no puede
    // dejar un hueco en la serie.
    if (estado.t0 !== null && Date.now() - estado.t0 < 14_000) requestAnimationFrame(cuadro)
    ;(window as unknown as { __arrancar?: () => void }).__arrancar = () => {
      estado.t0 = Date.now()
      estado.muestras = 0
      estado.carteles = 0
      estado.docs = 1
      estado.nac = [`${Date.now()}|top|arrancar`]
      guardar()
      try {
        sessionStorage.removeItem('__acuseDiag')
        sessionStorage.removeItem('__runDiag')
      } catch {
        /* noop */
      }
      requestAnimationFrame(cuadro)
    }
  }, DELAY)

  for (let i = 0; i < PASADAS; i++) {
    const { id: leadId } = await createLead(tracker, {
      setterId,
      businessName: `P34 donde muere ${i}`,
      stage: 'APROBADA',
      status: 'RESPONDIO',
      finalUrl: 'https://sonda-p34.develop.com.ar',
    })
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    await page.evaluate(() => {
      const w = window as unknown as { __arrancar?: () => void }
      if (!w.__arrancar) throw new Error('la sonda no está instalada')
      w.__arrancar()
    })

    await firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i })).click()
    await page.waitForTimeout(VENTANA_MS)

    const cosecha = await page.evaluate(() => {
      const leerJson = <T,>(llave: string, porDefecto: T): T => {
        try {
          const crudo = sessionStorage.getItem(llave)
          return crudo ? (JSON.parse(crudo) as T) : porDefecto
        } catch {
          return porDefecto
        }
      }
      const p34 = leerJson('__p34', { t0: 0, muestras: 0, carteles: 0, docs: 0, nac: [] as string[] })
      const diag = leerJson<{ pedidos: number; emitidos: number; t: string[] } | null>(
        '__acuseDiag',
        null,
      )
      const runDiag = leerJson<string[]>('__runDiag', [])
      const t0 = p34.t0 ?? 0
      let baliza = false
      try {
        baliza = sessionStorage.getItem('__acuseBuild') === 'p34-diag'
      } catch {
        /* noop */
      }
      return {
        instrumentado: baliza,
        etapas: runDiag.map((m) => {
          const i = m.lastIndexOf('@')
          return `${m.slice(0, i)}+${Number(m.slice(i + 1)) - t0}ms`
        }),
        pedidos: diag?.pedidos ?? 0,
        emitidos: diag?.emitidos ?? 0,
        marcasAcuse: (diag?.t ?? []).map((m) => {
          const [campo, abs] = m.split('@')
          return `${campo}+${Number(abs) - t0}ms`
        }),
        carteles: p34.carteles,
        muestras: p34.muestras,
        documentos: p34.docs,
        nacimientos: (p34.nac ?? []).map((m: string) => {
          const [abs, donde, ruta] = m.split('|')
          return `${Number(abs) - t0}ms ${donde} ${ruta}`
        }),
      }
    })

    const dossier = await getDossier(leadId)
    lineas.push({
      caso: `B8 raíz · pasada ${i + 1}`,
      ...cosecha,
      enBase: dossier?.enviadaAt != null,
    })
  }
})

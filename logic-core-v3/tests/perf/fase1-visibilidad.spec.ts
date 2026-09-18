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
 * P34 · FASE 1 — ¿EL MODELO DEL EMPUJÓN VALE BAJO PRUEBA, O SÓLO EN PRODUCCIÓN?
 *
 * NO es una suite de regresión (vive en `tests/perf`, que se corre a mano).
 *
 *   PERF_EXTERNAL_SERVER=1 PERF_PORT=3005 \
 *     npx playwright test --config=playwright.perf.config.ts fase1-visibilidad
 *
 * ── Por qué existe ──────────────────────────────────────────────────────────
 * P33 anotó, como salvedad, que bajo prueba el cartel casi nunca se autocierra a
 * los 4.000 ms —sigue visible a los 14 s en 6 de 6— y lo atribuyó a que «sonner
 * pausa su temporizador cuando la ventana no tiene foco». Si eso es cierto, el
 * empujón de 4 s que P30 midió como lo único que destraba el árbol NO ESTÁ
 * OCURRIENDO bajo prueba, y todas las mediciones de reflejo hechas con Playwright
 * están midiendo otra cosa.
 *
 * ── La atribución es imprecisa, y la imprecisión importa ─────────────────────
 * Leído en el sonner instalado (2.0.7), el temporizador se pausa así:
 *
 *   dist/index.mjs:605   if (expanded || interacting || isDocumentHidden) pauseTimer()
 *                        else startTimer()
 *   dist/index.mjs:109   const useIsDocumentHidden = () => {
 *                          const [h, setH] = React.useState(document.hidden)
 *                          … document.addEventListener('visibilitychange', …)
 *
 * O sea: NO es el foco de ventana (`window.blur` / `document.hasFocus()`), es
 * `document.hidden` — la Page Visibility API. Son cosas distintas y se mueven
 * distinto: una ventana puede perder el foco del sistema operativo y seguir
 * VISIBLE (`hidden === false`), y entonces sonner no pausa nada. Por eso esta
 * sonda mide las TRES señales por separado en vez de dar una por la otra:
 *
 *   · `document.hidden` / `visibilityState`  ← lo que sonner realmente mira
 *   · `document.hasFocus()`                  ← lo que P33 nombró
 *   · `data-expanded` del cartel             ← las otras dos ramas del `if`
 *
 * ── Qué decide ──────────────────────────────────────────────────────────────
 * Si el cartel NO se autocierra y `hidden` es `true`: P33 acertó en el efecto y
 * erró en el nombre; el modelo de producción se sostiene y bajo prueba hay que
 * declarar que el empujón no ocurre.
 *
 * Si el cartel NO se autocierra y `hidden` es `false` en toda la ventana: la
 * explicación de P33 queda REFUTADA y hay otra causa. Eso invalidaría el modelo
 * y es un hallazgo propio — condición de frenada del encargo.
 *
 * Si el cartel SÍ se autocierra a los ~4.000 ms: la salvedad de P33 no
 * reproduce, y las mediciones de reflejo bajo prueba valen tal cual.
 */

const VENTANA_MS = 14_000
const PASADAS = Number(process.env.FASE1_PASADAS ?? 3)

type Marca = {
  t: number
  toasts: number
  expandido: boolean
  hidden: boolean
  vis: string
  foco: boolean
  /** El reflejo de `mc1`: los tildes de fase habilitados (0 = estado viejo). */
  tildeOk: number
  susp: string
  warm: string
  ping: string
  pend: string
}

type Linea = {
  caso: string
  marcas: number
  hiddenAlguna: boolean
  focoSiempre: boolean
  cartel: { desdeMs: number; hastaMs: number } | null
  cerroSolo: boolean
  reflejoMs: number | null
  enBase: boolean
  serie: string[]
}

async function instalarSonda(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    type Marca = Record<string, unknown>
    const w = window as unknown as {
      __f1?: { t0: number | null; marcas: Marca[] }
      __arrancar?: () => void
    }
    const estado = { t0: null as number | null, marcas: [] as Marca[] }
    w.__f1 = estado

    // El FiberRoot, por la llave `__reactContainer$<n>` del contenedor (P30).
    const buscarRoot = (): Record<string, unknown> | null => {
      for (const nodo of [document, document.documentElement, document.body] as Node[]) {
        const llave = Object.keys(nodo).find((k) => k.startsWith('__reactContainer$'))
        if (llave) {
          const fiber = (nodo as unknown as Record<string, { stateNode?: unknown }>)[llave]
          if (fiber && typeof fiber === 'object' && 'stateNode' in fiber) {
            return fiber.stateNode as Record<string, unknown>
          }
        }
      }
      return null
    }
    let root: Record<string, unknown> | null = null
    const hex = (n: unknown) => (typeof n === 'number' ? '0x' + n.toString(16) : '?')

    const cuadro = () => {
      if (estado.t0 === null) return
      if (root === null) root = buscarRoot()
      const t = Date.now() - estado.t0
      const toasts = Array.from(document.querySelectorAll('[data-sonner-toast]'))
      estado.marcas.push({
        t,
        toasts: toasts.length,
        expandido: toasts.some((el) => el.getAttribute('data-expanded') === 'true'),
        hidden: document.hidden,
        vis: document.visibilityState,
        foco: document.hasFocus(),
        tildeOk: document.querySelectorAll(
          'main section[aria-label="Registro"] button[aria-pressed]:not([disabled])',
        ).length,
        susp: root ? hex(root.suspendedLanes) : 'n/a',
        warm: root ? hex(root.warmLanes) : 'n/a',
        ping: root ? hex(root.pingedLanes) : 'n/a',
        pend: root ? hex(root.pendingLanes) : 'n/a',
      })
      if (t < 14_000) requestAnimationFrame(cuadro)
    }
    w.__arrancar = () => {
      estado.t0 = Date.now()
      estado.marcas = []
      root = null
      requestAnimationFrame(cuadro)
    }
  })
}

/** Sólo las muestras en las que ALGO cambió: la serie es la lista de transiciones. */
function serieDeTransiciones(marcas: readonly Marca[]): string[] {
  const salida: string[] = []
  let previo = ''
  for (const m of marcas) {
    const clave = JSON.stringify([
      m.toasts,
      m.expandido,
      m.hidden,
      m.foco,
      m.tildeOk,
      m.susp,
      m.warm,
      m.ping,
    ])
    if (clave === previo) continue
    previo = clave
    salida.push(
      `${String(m.t).padStart(6)}ms  toast=${m.toasts}${m.expandido ? '(exp)' : ''} ` +
        `hidden=${m.hidden} vis=${m.vis} foco=${m.foco} tildeOk=${m.tildeOk} ` +
        `susp=${m.susp} warm=${m.warm} ping=${m.ping}`,
    )
  }
  return salida
}

const tracker: SmokeTracker = newTracker()
let setterId: string
const lineas: Linea[] = []

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  console.log('\n══ P34 · FASE 1 — VISIBILIDAD, FOCO Y EL AUTO-CIERRE ' + '═'.repeat(28))
  for (const l of lineas) {
    console.log(`\n── ${l.caso}`)
    console.log(
      `   ${l.marcas} muestras · hidden alguna vez: ${l.hiddenAlguna ? 'SÍ' : 'NO'} · ` +
        `foco todo el tiempo: ${l.focoSiempre ? 'SÍ' : 'NO'} · EN BASE: ${l.enBase ? 'SÍ' : 'NO'}`,
    )
    console.log(
      `   cartel: ${l.cartel ? `${l.cartel.desdeMs}→${l.cartel.hastaMs} ms` : 'NUNCA MONTÓ'} · ` +
        `¿cerró solo dentro de la ventana?: ${l.cerroSolo ? 'SÍ' : 'NO'}`,
    )
    console.log(`   reflejo (tildeOk>0): ${l.reflejoMs === null ? 'NUNCA' : `${l.reflejoMs} ms`}`)
    for (const s of l.serie) console.log(`     ${s}`)
  }
  console.log('\n' + '═'.repeat(80) + '\n')
  await teardown(tracker)
  await disconnect()
})

test('el auto-cierre del cartel bajo prueba: visibilidad, foco y reflejo', async ({ page }) => {
  test.setTimeout(PASADAS * 2 * 120_000)
  await instalarSonda(page)

  // Dos condiciones. `bringToFront` + un clic en el cuerpo es lo más cerca del
  // «foco de ventana» que se puede pedir desde Playwright; si el modelo depende
  // del foco, acá tiene que cambiar algo.
  for (const conFoco of [false, true]) {
    for (let i = 0; i < PASADAS; i++) {
      const { id: leadId } = await createLead(tracker, {
        setterId,
        businessName: `P34 F1 ${conFoco ? 'foco' : 'sinfoco'} ${i}`,
        stage: 'BRIEF',
        status: 'RESPONDIO',
      })

      await qaLogin(page, 'setter')
      await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })

      const boton = firstVisible(page.getByRole('button', { name: 'Arrancar construcción' }))
      await boton.waitFor({ state: 'visible' })

      if (conFoco) {
        // `bringToFront` + `window.focus()`: lo más cerca del «foco de ventana»
        // que se puede pedir desde Playwright sin clickear nada del producto.
        // (Un `click` sobre `body` no sirve: su caja mide 0 y Playwright lo
        // rechaza por invisible.)
        await page.bringToFront()
        await page.evaluate(() => window.focus())
      }

      await page.evaluate(() => {
        const w = window as unknown as { __arrancar?: () => void }
        if (!w.__arrancar) throw new Error('la sonda no está instalada en este documento')
        w.__arrancar()
      })

      await boton.click()
      await page.waitForTimeout(VENTANA_MS)

      const marcas = (await page.evaluate(() => {
        const w = window as unknown as { __f1?: { marcas: unknown[] } }
        return (w.__f1?.marcas ?? []) as unknown[]
      })) as Marca[]

      const conCartel = marcas.filter((m) => m.toasts > 0)
      const primeraConTilde = marcas.find((m) => m.tildeOk > 0)
      const dossier = await getDossier(leadId)

      lineas.push({
        caso: `mc1 · ${conFoco ? 'CON foco' : 'sin foco'} · pasada ${i + 1}`,
        marcas: marcas.length,
        hiddenAlguna: marcas.some((m) => m.hidden),
        focoSiempre: marcas.length > 0 && marcas.every((m) => m.foco),
        cartel:
          conCartel.length > 0
            ? { desdeMs: conCartel[0]!.t, hastaMs: conCartel[conCartel.length - 1]!.t }
            : null,
        // Cerró SOLO = hubo cartel y la última muestra de la ventana ya no lo tiene.
        cerroSolo: conCartel.length > 0 && marcas[marcas.length - 1]!.toasts === 0,
        reflejoMs: primeraConTilde?.t ?? null,
        enBase: dossier?.stage === 'CONSTRUCCION',
        serie: serieDeTransiciones(marcas),
      })
    }
  }
})

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
 * P29 — ¿CUÁNDO COMMITEA EL ÁRBOL DEL SERVIDOR, Y QUIÉN LO EMPUJA?
 *
 * NO es una suite de regresión (vive en `tests/perf`, que se corre a mano):
 * es el instrumento que caracteriza el hallazgo de P29, para que el sprint que
 * lo retome pueda reproducirlo en una corrida en vez de re-descubrirlo.
 *
 *   PERF_EXTERNAL_SERVER=1 PERF_PORT=3003 \
 *     npx playwright test --config=playwright.perf.config.ts commit-del-arbol
 *
 * ── Qué mide ────────────────────────────────────────────────────────────────
 * Una serie temporal, cuadro a cuadro desde el clic real (listener en fase de
 * captura), de CUATRO señales de la pantalla `mc1` al arrancar la construcción:
 *
 *   · `frase`   — ¿sigue la copy de «todavía no arrancaste»? (estado VIEJO)
 *   · `tildeOk` — ¿cuántos tildes de fase quedaron habilitados? (estado NUEVO)
 *   · `acuse`   — ¿hay un acuse en pantalla? (sólo con el parche de P29)
 *   · `toast`   — ¿hay un aviso flotante montado?
 *
 * Sólo se anota cuando el conjunto CAMBIA, así el log es la lista de
 * transiciones y no un volcado de 600 cuadros.
 *
 * ── Qué encontró ────────────────────────────────────────────────────────────
 * Que la relación entre el aviso flotante y el reflejo de la pantalla es la
 * INVERSA de la que P28 había inferido. Tres corridas, mismo build salvo la
 * línea que se indica:
 *
 *   1. Con aviso flotante (el producto de hoy):
 *        1.463 ms  acuse+toast aparecen
 *        5.476 ms  la pantalla cambia  ← el toast TODAVÍA está montado
 *        5.674 ms  el toast se desmonta
 *      La pantalla cambia ANTES de que el aviso se vaya. No lo estaba esperando.
 *
 *   2. Sin aviso flotante (acuse en pantalla, P29):
 *        1.347 ms  aparece el acuse
 *        …y nada más. Diez segundos, cero transiciones. La pantalla NO cambia
 *        NUNCA: `frase` sigue true y `tildeOk` sigue 0, con el dossier ya en
 *        CONSTRUCCION en la base.
 *
 * O sea: el aviso no demoraba el reflejo — era lo ÚNICO que lo provocaba. El
 * árbol que devuelve el POST de la server action se aplica como actualización
 * de transición y no commitea solo; lo desatascaba el `flushSync` interno de
 * sonner (`setTimeout(() => flushSync(() => setToasts(...)))`, sonner 2.0.7).
 *
 * ── Cuatro empujones probados, y los cuatro fallaron ────────────────────────
 * Cada uno con su build y esta misma sonda. Ninguno hizo commitear el árbol:
 *
 *   · `flushSync` alrededor del acuse, dentro de la transición.
 *   · `router.refresh()` restaurado en `useStepAction` (el que sacó P28).
 *   · El acuse fuera de la transición (`setTimeout(…, 0)`, prioridad normal).
 *   · La receta EXACTA de sonner: `setTimeout(() => flushSync(() => …))`.
 *
 * Por eso P29 frenó y no shippeó la mudanza del acuse: sacar el aviso sin
 * resolver esto deja la pantalla congelada — verde para el invariante del acuse
 * y rota para el setter. El parche completo quedó en
 * `docs/perf-p29/acuse-en-pantalla.patch`.
 */

const VENTANA_DE_OBSERVACION_MS = 10_000

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('P29 · serie temporal: cuándo commitea el árbol tras «Arrancar construcción»', async ({
  page,
}) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P29 commit del arbol',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })

  await qaLogin(page, 'setter')
  // Directo a la pantalla: la raíz encadena dos redirecciones de servidor y
  // clickear con esa cadena asentándose mete una navegación en el medio.
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  // Hidratación real: un clic antes de que React enganche los handlers no
  // dispara nada, y la sonda saldría midiendo la nada.
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('main button')).some((nodo) =>
      Object.keys(nodo).some((llave) => llave.startsWith('__reactFiber$')),
    ),
  )

  await page.evaluate(() => {
    const w = window as unknown as { __log?: string[]; __t0?: number }
    w.__log = []
    let previo = ''
    // El cero es el clic REAL, no la llamada de arriba: fase de captura.
    document.addEventListener(
      'click',
      () => {
        if (w.__t0 === undefined) w.__t0 = performance.now()
      },
      true,
    )
    const tick = () => {
      const main = document.querySelector('main')
      const estado = JSON.stringify({
        frase: /El brief está listo/.test(main?.textContent ?? ''),
        tildeOk: document.querySelectorAll(
          'main section[aria-label="Registro"] button[aria-pressed]:not([disabled])',
        ).length,
        acuse: document.querySelectorAll('[data-acuse]').length,
        toast: document.querySelectorAll('[data-sonner-toast]').length,
      })
      if (estado !== previo) {
        previo = estado
        const t = w.__t0 === undefined ? 'pre-clic' : `${Math.round(performance.now() - w.__t0)}ms`
        w.__log!.push(`${t} ${estado}`)
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  await firstVisible(page.getByRole('button', { name: 'Arrancar construcción' })).click()
  await page.waitForTimeout(VENTANA_DE_OBSERVACION_MS)

  const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log)
  console.log('\n── P29 · transiciones de la pantalla ──')
  for (const linea of log) console.log('   ', linea)
  console.log('   dossier en la base:', (await getDossier(leadId))?.stage)
  console.log('')
})

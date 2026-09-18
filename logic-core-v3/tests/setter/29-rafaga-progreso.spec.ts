import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
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
// Se leen las MISMAS funciones que el page loader: el veredicto de cada caso es
// el blob guardado interpretado igual que lo interpreta la app, no un JSON
// paralelo escrito a mano en el test.
import { parseProgreso, parseSelfCheck, HARD_CHECKS } from '../../src/lib/leados/flow'

/**
 * P25 — LA RÁFAGA. Tres clics seguidos en los tildes de Construcción tienen que
 * guardar TRES marcas.
 *
 * El defecto que fija: cada tilde reconstruía el conjunto a persistir desde la
 * prop `completadas` del server —la MISMA para los tres— en vez de desde el
 * estado ya modificado por los clics anteriores. Con los tres clics dentro de la
 * ventana del `router.refresh()`, los tres computaban su `siguiente` sobre la
 * misma base vieja y el último write ganaba: quedaba UNA marca de tres.
 *
 * ── Por qué la aserción va sobre la DB y no sobre la pantalla ────────────────
 * Un `aria-pressed="true"` en los tres tildes es exactamente lo que el bug
 * mostraba: el estado optimista pintaba las tres marcas y solo UNA se guardaba.
 * Afirmar sobre la pantalla habría dado verde SOBRE el defecto. Por eso cada
 * caso releé `progresoJson` de la base y lo pasa por `parseProgreso` (lo mismo
 * que hace `_data.ts` en cada carga). La pantalla se mira DESPUÉS, tras un
 * reload, y solo como confirmación de que lo guardado es lo que se ve.
 *
 * ── Por qué `expect.poll` y no un `waitForTimeout` ───────────────────────────
 * El guardado es asincrónico (autosave con coalescing: una escritura en vuelo,
 * el resto agrupado). Un sleep fijo o se queda corto —rojo intermitente— o se
 * pasa de largo. El poll reintenta la LECTURA hasta que el número llega a lo
 * esperado, y falla por timeout si nunca llega. Un caso roto (1 de 3) agota el
 * timeout: no hay forma de que una longitud de 3 se satisfaga con 1.
 *
 * Y NINGUNA aserción de este archivo es una ausencia (`toHaveCount(0)` y
 * parientes): una ausencia se satisface antes de que la página termine de
 * renderizar y ya dio falso verde dos veces en esta suite. Acá todo lo que se
 * afirma es una PRESENCIA con número exacto.
 *
 * ── P42: la ráfaga de tres tildes se mide en «Refinar» ─────────────────────
 * «Construir» (mc1) pasó a UN tilde que marca sus tres fases juntas. Los tres
 * tildes por fase —el caso donde la carrera perdía dos marcas de tres— siguen en
 * «Refinar» (mc2), con el MISMO dueño (`RegistroFases`) y la misma escritura: las
 * dos ráfagas se miden ahí, sin aflojar nada. La ráfaga sobre el tilde único la
 * fija `33-construir-un-paso` F.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

const TILDES = 'main section[aria-label="Registro"] button[aria-pressed]'

/** Lo GUARDADO, releído de la base y parseado como lo parsea el page loader. */
async function completadasEnDb(leadId: string): Promise<string[]> {
  const dossier = await getDossier(leadId)
  return [...parseProgreso(dossier?.progresoJson ?? null).completadas].sort()
}

/**
 * La ráfaga: clics sobre los tildes indicados, con `intervaloMs` entre uno y el
 * siguiente. Va por `evaluate` y no por `locator.click()` a propósito — el click
 * de Playwright espera actionability antes de cada golpe (re-render, estabilidad
 * de la caja), y esa espera es justo lo que hace que los clics DEJEN de ser
 * simultáneos: con ella el defecto no se reproduce. Con `intervaloMs: 0` los
 * clics salen en el mismo tick del event loop, que es el peor caso real.
 */
async function rafaga(page: Page, indices: number[], intervaloMs: number): Promise<void> {
  await page.evaluate(
    async ({ selector, indices: golpes, intervaloMs: espera }) => {
      const botones = Array.from(document.querySelectorAll<HTMLButtonElement>(selector))
      for (const i of golpes) {
        botones[i]?.click()
        if (espera > 0) await new Promise((resolve) => setTimeout(resolve, espera))
      }
    },
    { selector: TILDES, indices, intervaloMs },
  )
}

/** P42 — cuántos tildes muestra cada pantalla: uno en «Construir», uno por fase en «Refinar». */
const TILDES_POR_PANTALLA = { mc1: 1, mc2: 3 } as const

async function abrirConstruccion(page: Page, leadId: string, paso: 'mc1' | 'mc2'): Promise<void> {
  await page.goto(`/setter/leads/${leadId}/manual/${paso}`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(new RegExp(`/manual/${paso}$`))
  await expect(page.locator(TILDES)).toHaveCount(TILDES_POR_PANTALLA[paso])
  // Los tildes tienen que estar VIVOS antes de la ráfaga: un click sobre un
  // botón todavía deshabilitado (o pre-hidratación) no dispara nada, y el test
  // quedaría midiendo la nada en verde.
  await expect(firstVisible(page.locator(TILDES))).toBeEnabled()
}

test('ráfaga de tres: tres clics seguidos guardan TRES marcas (releído de la base)', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Tres P25',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')
  await abrirConstruccion(page, leadId, 'mc2')

  expect(await completadasEnDb(leadId), 'arranca sin nada marcado').toEqual([])

  // La ráfaga real: tres clics en el mismo tick, sin esperar entre uno y otro.
  await rafaga(page, [0, 1, 2], 0)

  // EL ASERTO: lo GUARDADO tiene las tres. Con el defecto vivo esto queda en 1
  // y el poll agota el timeout.
  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'las tres fases tildadas en ráfaga tienen que estar guardadas',
      timeout: 20_000,
    })
    .toHaveLength(3)

  // Y lo guardado es lo que se ve al recargar (no al revés: el optimista
  // pintaba tres con una sola guardada).
  await page.reload({ waitUntil: 'domcontentloaded' })
  const tildes = page.locator(TILDES)
  await expect(tildes).toHaveCount(3)
  for (let i = 0; i < 3; i += 1) {
    await expect(tildes.nth(i), `el tilde ${i} sigue marcado tras recargar`).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  }

  expectNoConsoleErrors(guard)
})

test('diez clics ciclando (tildes y destildes mezclados) componen EXACTO', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Diez Ciclando P25',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')
  await abrirConstruccion(page, leadId, 'mc2')

  // Diez golpes ciclando sobre los tres tildes: 0,1,2,0,1,2,0,1,2,0.
  // Por paridad el tilde 0 recibe CUATRO (queda apagado) y los tildes 1 y 2
  // reciben TRES cada uno (quedan encendidos). Que el resultado sea el compuesto
  // exacto —y no «el último ganó»— es lo que distingue un arreglo real de uno
  // que solo achicó la ventana. Destildar entra en la ráfaga igual que tildar.
  await rafaga(page, [0, 1, 2, 0, 1, 2, 0, 1, 2, 0], 0)

  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'los diez clics tienen que componer: dos marcas encendidas, una apagada',
      timeout: 20_000,
    })
    .toHaveLength(2)

  // Y CUÁL quedó apagada: la que recibió los cuatro golpes. Es la comprobación
  // de que se compuso y no se pisó — dos marcas cualesquiera también dan 2.
  await page.reload({ waitUntil: 'domcontentloaded' })
  const tildes = page.locator(TILDES)
  await expect(tildes.nth(0), 'cuatro golpes (par) dejan el tilde apagado').toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(tildes.nth(1), 'tres golpes (impar) dejan el tilde encendido').toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(tildes.nth(2), 'tres golpes (impar) dejan el tilde encendido').toHaveAttribute(
    'aria-pressed',
    'true',
  )

  expectNoConsoleErrors(guard)
})

test('las dos pantallas de Construcción: las marcas de mc1 y mc2 conviven', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Dos Pantallas P25',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')

  // El tilde único de mc1 (P42) marca sus tres fases de un clic...
  await abrirConstruccion(page, leadId, 'mc1')
  await rafaga(page, [0], 0)
  await expect.poll(() => completadasEnDb(leadId), { timeout: 20_000 }).toHaveLength(3)

  // ...y ráfaga de tres en mc2. Las seis fases son la unidad persistida (P6-B):
  // la segunda pantalla NO puede borrar lo tildado en la primera — su estado
  // arranca del blob completo, no de las tres fases que ella misma muestra.
  await abrirConstruccion(page, leadId, 'mc2')
  await rafaga(page, [0, 1, 2], 0)
  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'las seis fases de las dos pantallas quedan guardadas juntas',
      timeout: 20_000,
    })
    .toHaveLength(6)

  expectNoConsoleErrors(guard)
})

/**
 * La REFERENCIA del ritmo alcanzable: el chequeo final ya sostiene una ráfaga de
 * diez sin perder ninguna — son exactamente los diez obligatorios. No se toca en
 * este sprint (es el que alimenta el gate del envío y no tiene la carrera): se
 * MIDE, para que si alguna vez la pierde se entere esta suite y no una corrida
 * manual.
 */
test('referencia · el chequeo final sostiene una ráfaga de diez (10 de 10)', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Chequeo P25',
    stage: 'CONSTRUCCION',
    draftUrl: 'https://rafaga-p25.netlify.app',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/m14`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m14$/)

  // Los diez obligatorios se toman POR NOMBRE, no por posición: los soft-flags
  // son el mismo `Toggle` y viven intercalados dentro del grupo de Franco, así
  // que un `slice(0, 10)` del DOM tomaría cualquier cosa.
  const nombres = HARD_CHECKS.map((check) => check.nombre)
  const primero = page.locator(`main button[role="switch"][aria-label="${nombres[0]}"]`)
  await expect(firstVisible(primero)).toBeEnabled()

  await page.evaluate((labels) => {
    for (const label of labels) {
      const escapado = label.replace(/"/g, '\\"')
      const toggle = document.querySelector<HTMLButtonElement>(
        `main button[role="switch"][aria-label="${escapado}"]`,
      )
      toggle?.click()
    }
  }, nombres)

  await expect
    .poll(
      async () => {
        const dossier = await getDossier(leadId)
        const guardado = parseSelfCheck(dossier?.selfCheckJson ?? null)
        return guardado?.itemsDuros.filter((item) => item.ok).length ?? 0
      },
      {
        message: `los ${nombres.length} obligatorios tildados en ráfaga tienen que estar guardados`,
        timeout: 20_000,
      },
    )
    .toBe(nombres.length)

  expectNoConsoleErrors(guard)
})

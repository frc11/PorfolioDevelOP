import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import {
  getSetterQa,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
import { parseProgreso } from '../../src/lib/leados/flow'
import { FASE_IDS } from '../../src/lib/leados/contracts'
import { fasesDePantallaConstruccion } from '../../src/lib/leados/manual'

/**
 * P25 — LA RÁFAGA: tres clics seguidos guardan tres marcas.
 *
 * EL DEFECTO QUE ESTO CONGELA. Cada `FaseAutoReporte` era su propio escritor de
 * `progresoJson` y reconstruía el set completo desde la prop `completadas` del
 * server, la MISMA para los tres tildes de la pantalla. Esa prop solo se refresca
 * cuando vuelve el `router.refresh()` — medido en la aplicación: 1.0–1.3 s. Tres
 * clics dentro de esa ventana calculaban los tres sobre la misma base vieja y se
 * mandaban `[A]`, `[B]`, `[C]`: la última pisaba a las otras dos. Medido antes
 * del arreglo: 3 clics → 1 marca (y con 300 ms entre clics, también 1).
 *
 * POR QUÉ SE AFIRMA CONTRA LA DB Y NO CONTRA LA PANTALLA. El estado optimista
 * pinta el tilde en verde ANTES de que el server conteste: una aserción sobre el
 * DOM da verde aunque no se haya guardado nada — es exactamente el falso verde
 * que se comió P24. Acá lo único que se afirma es `progresoJson` releído de la
 * DB. `expect.poll` espera a que la escritura ATERRICE (no puede pasar antes de
 * tiempo: sigue pidiendo hasta ver el valor correcto) y falla si nunca llega —
 * que es lo que hace el código viejo, donde la DB nunca llega a tener las tres.
 *
 * La ráfaga es SINCRÓNICA (un solo `evaluate`, los clics en el mismo turno de
 * JS): es el ritmo real de un setter tildando lo que acaba de terminar, y el que
 * reproduce el defecto. Los clics de Playwright, uno por uno, meten latencia
 * suficiente para tapar la ventana.
 *
 * Los fixtures se DERIVAN de `FASE_IDS` / `PANTALLA_DE_FASE` en vivo (mismo
 * criterio que `progreso-construccion` y el anti-bypass): re-agrupar las fases
 * no vuelve verde este test por accidente.
 *
 * Ningún gate se toca: `progresoJson` sigue sin cablearse a la transición
 * EN_REVISION (§6-3) y el chequeo final sigue siendo el único gate.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string

const FASES_MC1 = fasesDePantallaConstruccion('mc1')
const FASES_MC2 = fasesDePantallaConstruccion('mc2')

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Lo PERSISTIDO, releído de la DB — nunca el DOM. */
async function completadasEnDb(leadId: string): Promise<string[]> {
  const dossier = await getDossier(leadId)
  return [...parseProgreso(dossier?.progresoJson ?? null).completadas].sort()
}

/** Los tildes de la pantalla de Construcción que se está mirando. */
const TILDES = 'main section[aria-label="Registro"] button[aria-pressed]'

/** Ráfaga sincrónica: todos los clics en el MISMO turno de JS, sin esperas. */
async function rafaga(page: import('@playwright/test').Page, orden: number[]): Promise<void> {
  await page.evaluate((secuencia) => {
    const botones = [
      ...document.querySelectorAll<HTMLButtonElement>(
        'main section[aria-label="Registro"] button[aria-pressed]',
      ),
    ]
    for (const i of secuencia) botones[i]?.click()
  }, orden)
}

test('3 clics seguidos en mc1 guardan 3 marcas (releído de progresoJson)', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Progreso 3',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator(TILDES)).toHaveCount(FASES_MC1.length)
  expect(await completadasEnDb(leadId), 'arranca sin fases hechas').toEqual([])

  await rafaga(page, [0, 1, 2])

  // Se espera a que ATERRICE lo persistido. Con el defecto vivo la DB se queda
  // en UNA fase y este poll agota su tiempo — rojo determinista, no flaky.
  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'las TRES fases tildadas quedaron guardadas',
      timeout: 20_000,
    })
    .toEqual([...FASES_MC1].sort())

  expectNoConsoleErrors(guard)
})

test('10 clics seguidos componen exacto, destildes incluidos (releído de progresoJson)', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Progreso 10',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator(TILDES)).toHaveCount(FASES_MC1.length)

  // Diez clics ciclando los tres tildes — el ritmo del chequeo final, que es la
  // referencia de que este ritmo ES alcanzable. Paridad por tilde: el 0 recibe
  // CUATRO clics (par → queda destildado), el 1 y el 2 reciben TRES (impar →
  // quedan tildados). Afirma composición, no solo ausencia de pérdida: una
  // implementación que pierda clics no puede caer en este resultado por azar.
  await rafaga(page, [0, 1, 2, 0, 1, 2, 0, 1, 2, 0])

  const esperado = [FASES_MC1[1], FASES_MC1[2]].sort()
  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'los 10 clics componen exacto (el tilde con clics pares queda apagado)',
      timeout: 20_000,
    })
    .toEqual(esperado)

  expectNoConsoleErrors(guard)
})

test('la ráfaga de mc2 no pisa lo tildado en mc1 (las seis sobreviven)', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Rafaga Progreso Cruzada',
    stage: 'CONSTRUCCION',
  })

  await qaLogin(page, 'setter')

  // Dos escrituras que se CRUZAN sobre el mismo blob: cada pantalla toca solo
  // sus tres fases, y el payload de cada una tiene que arrastrar intactas las de
  // la otra. El resultado contiene las DOS ráfagas, no la última.
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator(TILDES)).toHaveCount(FASES_MC1.length)
  await rafaga(page, [0, 1, 2])
  await expect
    .poll(() => completadasEnDb(leadId), { timeout: 20_000 })
    .toEqual([...FASES_MC1].sort())

  await page.goto(`/setter/leads/${leadId}/manual/mc2`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator(TILDES)).toHaveCount(FASES_MC2.length)
  await rafaga(page, [0, 1, 2])

  await expect
    .poll(() => completadasEnDb(leadId), {
      message: 'las seis fases quedaron guardadas — mc2 no pisó a mc1',
      timeout: 20_000,
    })
    .toEqual([...FASE_IDS].sort())

  expectNoConsoleErrors(guard)
})

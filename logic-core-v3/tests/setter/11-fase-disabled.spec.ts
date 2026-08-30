import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import { getSetterQa, createLead, newTracker, teardown, disconnect, type SmokeTracker } from '../helpers/setter-db'

/**
 * Sprint 3.3 (B-07/C-08) — el tilde de auto-reporte de una fase de Construcción
 * (`FaseAutoReporte`) deja de ofrecerse cuando el server lo va a rechazar
 * (`saveOwnedProgreso`, dossier.ts: solo con `stage === 'CONSTRUCCION'`).
 * Presentación pura — el guard del server no se toca; esto solo evita el
 * viaje redondo con un toast de error. §6-3 intacto: el tilde sigue sin ser
 * un gate, la navegación entre fases sigue libre.
 *
 * P6-B — las seis pantallas de fase se agruparon en dos (mc1/mc2). Cambió el
 * DESTINO (m7 → mc1) y se sumaron dos garantías del colapso a los mismos tests,
 * sin agregar casos: que los TRES tildes de la pantalla siguen existiendo (los
 * seis se conservan, 3+3 — no se fusionaron en dos) y que una dirección vieja
 * (m9) redirige a la pantalla actual en vez de romper.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let briefLeadId: string
let construccionLeadId: string
let rechazadaLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // BRIEF: el dossier todavía no arrancó la construcción — mc1 es alcanzable
  // (navegación libre §6-3) pero el server rechazaría el guardado del tilde.
  const brief = await createLead(tracker, {
    setterId,
    businessName: 'Fase Disabled BRIEF 3.3',
    stage: 'BRIEF',
  })
  briefLeadId = brief.id

  // CONSTRUCCION: el tilde funciona normal.
  const construccion = await createLead(tracker, {
    setterId,
    businessName: 'Fase Disabled CONSTRUCCION 3.3',
    stage: 'CONSTRUCCION',
  })
  construccionLeadId = construccion.id

  // RECHAZADA: el OTRO stage que llega a mc1/mc2 con el tilde apagado
  // (`posicionDe`: habilitadas = ['mr', ...PANTALLAS_CONSTRUCCION]). Acá el
  // bloque de BRIEF no se monta —no hay botón arriba— y la reapertura vive en
  // «Correcciones» (mr), que ni siquiera está en el rail de Construcción.
  const rechazada = await createLead(tracker, {
    setterId,
    businessName: 'Fase Disabled RECHAZADA vocabulario',
    stage: 'RECHAZADA',
  })
  rechazadaLeadId = rechazada.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('B-07 · BRIEF: el tilde está disabled y muestra el motivo', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${briefLeadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  const tilde = firstVisible(page.locator('main section[aria-label="Registro"] button[aria-pressed]'))
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeDisabled()

  // El motivo vive en el REGISTRO, no dentro del `<button>` del tilde: el sprint
  // de destinos alcanzables lo sacó de adentro (con tres tildes por pantalla era
  // el mismo párrafo tres veces, y el de RECHAZADA necesita un enlace, que ahí
  // adentro no sería navegable). Lo que se fija es lo mismo: que nombre el botón
  // que existe y diga dónde está.
  const registro = firstVisible(page.locator('main section[aria-label="Registro"]'))
  await expect(registro).toContainText('arrancá la construcción')
  await expect(registro).toContainText('«Arrancar construcción»')
  await expect(registro).toContainText('acá arriba')

  // P6-B: los tres tildes de la pantalla, uno por fase — no un tilde fusionado.
  await expect(page.locator('main section[aria-label="Registro"] button[aria-pressed]')).toHaveCount(3)

  // El CTA «Arrancar construcción» sigue arriba, sin bloquear nada más de la pantalla.
  await expect(firstVisible(page.getByRole('button', { name: 'Arrancar construcción' }))).toBeVisible()

  // P6-B: una dirección vieja (m9, retirada del registro) no rompe — la guardia
  // del server la rescata a la pantalla actual (mismo mecanismo que el m3 de P4).
  await page.goto(`/setter/leads/${briefLeadId}/manual/m9`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  expectNoConsoleErrors(guard)
})

test('C-08 · CONSTRUCCION: el tilde funciona normal', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${construccionLeadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  // P6-B: los tres tildes de la pantalla, cada uno 1↔1 con su fase.
  const tildes = page.locator('main section[aria-label="Registro"] button[aria-pressed]')
  await expect(tildes).toHaveCount(3)

  const tilde = firstVisible(tildes)
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeEnabled()
  await expect(tilde).toContainText('Marcá esta fase cuando la termines')

  await tilde.click()
  await expect(tilde).toHaveAttribute('aria-pressed', 'true')
  await expect(tilde).toContainText('Fase marcada como hecha')

  // Tildar UNA fase no arrastra a las otras dos: el progreso sigue siendo por fase.
  await expect(tildes.nth(1)).toHaveAttribute('aria-pressed', 'false')
  await expect(tildes.nth(2)).toHaveAttribute('aria-pressed', 'false')

  expectNoConsoleErrors(guard)
})

test('vocabulario · RECHAZADA: el motivo nombra el botón que existe y dice dónde está', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${rechazadaLeadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  const tilde = firstVisible(page.locator('main section[aria-label="Registro"] button[aria-pressed]'))
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeDisabled()

  // El bug: el motivo era fijo y mandaba a «arrancá la construcción — el botón
  // está arriba». En RECHAZADA no hay botón arriba, el botón se llama «Reabrir
  // construcción» y vive en otra pantalla.
  //
  // El motivo se afirma sobre el REGISTRO, no sobre el `<button>` del tilde: el
  // sprint de destinos alcanzables lo sacó de adentro del botón —ahí un `<a>` no
  // es navegable, y con tres tildes por pantalla era el mismo párrafo tres
  // veces— y lo dejó una vez arriba del grupo, con «Correcciones» enlazada. Lo
  // que este test fija sigue siendo lo mismo: que nombre el botón que existe y
  // diga dónde está. Que además se pueda llegar lo fija `17-destinos-alcanzables`.
  const registro = firstVisible(page.locator('main section[aria-label="Registro"]'))
  await expect(registro).toContainText('reabrís la construcción')
  await expect(registro).toContainText('«Reabrir construcción»')
  await expect(registro).toContainText('Correcciones')
  await expect(registro).not.toContainText('Arrancar construcción')

  // Y se afirma lo que hacía falsa a la instrucción vieja: no hay ningún botón
  // «Arrancar construcción» en esta pantalla.
  await expect(page.getByRole('button', { name: 'Arrancar construcción' })).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

import { test, expect, type Page } from '@playwright/test'
import { attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'

/**
 * SABOTAJE del guard de consola — el segundo helper más apalancado de la suite:
 * 47 `attachConsoleGuard` y 46 `expectNoConsoleErrors` en 18 archivos.
 *
 * Es el candidato clásico a falso verde: afirma que una LISTA está vacía. Una
 * lista que nunca se llenó también está vacía. Por eso no alcanza con el caso
 * limpio: hacen falta los casos donde el error SÍ ocurre.
 *
 * (Importa `setter-auth`, que a su vez importa `setter-db` → `new
 * PrismaClient()`. Construir el cliente no conecta ni consulta: este archivo
 * sigue sin tocar la base.)
 */

async function montar(page: Page, html: string): Promise<void> {
  await page.setContent(`<div>${html}</div>`, { waitUntil: 'domcontentloaded' })
}

/** Corre `fn` y afirma que LANZÓ. */
async function debeFallar(razon: string, fn: () => Promise<unknown> | unknown): Promise<void> {
  let lanzo = false
  try {
    await fn()
  } catch {
    lanzo = true
  }
  expect(lanzo, `el helper pasó sin la conducta — ${razon}`).toBe(true)
}

/** Los listeners de `page.on` son asincrónicos: hay que darles un tick. */
async function dejarLlegarLosEventos(page: Page): Promise<void> {
  await page.waitForTimeout(300)
}

test('consoleGuard · CONDUCTA: página limpia, cero errores', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await montar(page, `<main><p>todo bien</p></main>`)
  await dejarLlegarLosEventos(page)
  expectNoConsoleErrors(guard)
})

test('consoleGuard · SABOTAJE: la página emite console.error y el guard lo tiene que ver', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await montar(page, `<main><script>console.error('explotó el render del foco')</script></main>`)
  await dejarLlegarLosEventos(page)
  await debeFallar('hubo un console.error y el guard lo dejó pasar', () =>
    expectNoConsoleErrors(guard),
  )
})

test('consoleGuard · SABOTAJE: excepción no manejada (pageerror)', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await montar(page, `<main><script>setTimeout(() => { throw new Error('boom') }, 0)</script></main>`)
  await dejarLlegarLosEventos(page)
  await debeFallar('hubo una excepción no manejada y el guard la dejó pasar', () =>
    expectNoConsoleErrors(guard),
  )
})

/**
 * CARACTERIZACIÓN, no defecto: el guard solo ve lo que pasa DESPUÉS de
 * engancharse. Un error de carga con el guard atado tarde queda invisible y
 * `expectNoConsoleErrors` pasa sobre una lista que nunca se llenó.
 *
 * Hoy no hay ningún call site así —los 46 atan el guard como primera línea del
 * test, antes de cualquier `page.goto`— pero la regla no estaba escrita en
 * ningún lado. Acá queda, y ejecutable.
 */
test('consoleGuard · CARACTERIZACIÓN: no ve lo que pasó ANTES de engancharse', async ({ page }) => {
  await montar(page, `<main><script>console.error('esto pasa antes del guard')</script></main>`)
  await dejarLlegarLosEventos(page)

  const guardTardio = attachConsoleGuard(page)
  await dejarLlegarLosEventos(page)
  expect(
    guardTardio.errors,
    'atar el guard después de navegar lo deja ciego: siempre antes del primer goto',
  ).toEqual([])
})

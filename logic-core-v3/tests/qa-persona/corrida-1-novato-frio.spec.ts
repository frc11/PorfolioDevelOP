import fs from 'fs'
import path from 'path'
import { test } from '@playwright/test'
import { mintSessionCookie } from '../helpers/setter-auth'
import { createSetter, disconnect, newTracker, teardown } from '../helpers/setter-db'

/**
 * Corrida 1 — recorrido de un setter NOVATO, sin leads asignados, que carga su
 * PRIMER prospecto propio (frío) y trata de trabajarlo. Es un script de
 * navegación/captura para un reporte de UX — no es parte de la suite de
 * regresión (`tests/setter`) y no hace asserts de negocio: solo camina la app
 * real y guarda un screenshot por paso en docs/proof-screenshots/corrida-1/,
 * en el orden en que un setter los vería.
 *
 * Setter 100% fresco (createSetter, cartera vacía) — nunca la persona
 * `setter-qa` seedeada, que ya tiene leads.
 */

// Nombre descriptivo (no solo "corrida-1"): la carpeta genérica ya está en uso
// por otra corrida de QA-persona corriendo en paralelo sobre el mismo repo.
const OUT_DIR = path.join(__dirname, '..', '..', 'docs', 'proof-screenshots', 'corrida-1-alta-propia-frio')

test('corrida 1 — setter novato carga su primer prospecto (frío)', async ({ page, context }) => {
  test.setTimeout(240_000)
  fs.mkdirSync(OUT_DIR, { recursive: true })

  let shotIndex = 0
  const shot = async (name: string) => {
    shotIndex += 1
    const fileName = `${String(shotIndex).padStart(2, '0')}-${name}.png`
    await page.screenshot({ path: path.join(OUT_DIR, fileName) })
  }

  const tracker = newTracker()

  try {
    const setter = await createSetter(tracker, 'novato-corrida1')
    await mintSessionCookie(context, '', {
      userId: setter.id,
      email: setter.email,
      name: setter.name,
      role: 'SETTER',
    })

    // ── 1. Home — cartera vacía, cero leads asignados ────────────────────────
    await page.goto('/setter', { waitUntil: 'networkidle' })
    await shot('home-vacio')

    // ── 2. CTA "Cargar un prospecto" → /setter/nuevo ─────────────────────────
    await page.getByRole('link', { name: 'Cargar un prospecto' }).click()
    await page.waitForURL('**/setter/nuevo')
    await page.waitForLoadState('networkidle')
    await shot('alta-formulario-vacio')

    // ── 3. Completar el alta con lo que un setter junta mirando Instagram ────
    await page.getByPlaceholder('Ej: Café de la Esquina').fill('Café de la Esquina')
    await page.getByPlaceholder('Ej: Marina (dueña)').fill('Marina (dueña)')
    await page.getByPlaceholder('Ej: 11 5555 5555').fill('11 5555 5555')
    await page.getByPlaceholder('Ej: Gastronomía').fill('Gastronomía')
    await page.getByPlaceholder('Ej: Palermo, CABA').fill('Palermo, CABA')
    await page.getByPlaceholder('https://instagram.com/…').fill('https://instagram.com/cafedelaesquina')
    await page
      .getByPlaceholder(/lo vi en IG/)
      .fill(
        'Lo vi buscando cafeterías en Instagram. Postean seguido pero no tienen página web. Buenas fotos del local.',
      )
    await shot('alta-formulario-completo')

    await page.getByRole('button', { name: 'Cargar prospecto' }).click()
    await page.waitForURL(/\/setter\/leads\//)
    await page.waitForLoadState('networkidle')
    await shot('lead-creado-ficha-vacia')

    // ── 4. Mirar los pasos de abajo ANTES de tocar la ficha (todo bloqueado) ─
    await page.getByText('Primer contacto (opener)').scrollIntoViewIfNeeded()
    await shot('pasos-bloqueados-antes-de-la-ficha')
    await page.evaluate(() => window.scrollTo(0, 0))

    // ── 5. Completar la ficha (Paso 1) con la señal mínima ───────────────────
    const fichaRoot = page.locator('[data-step="ficha"]')
    await fichaRoot.locator('select').selectOption('DUENO')
    const fichaTextareas = fichaRoot.locator('textarea')
    await fichaTextareas
      .nth(0)
      .fill('Marina atiende y postea ella misma — aparece en las historias del local.')
    await fichaTextareas
      .nth(1)
      .fill(
        'Instagram activo, postea 2-3 veces por semana, casi 1.000 seguidores. No tiene página web. Está en Google Maps sin fotos.',
      )
    await fichaTextareas
      .nth(2)
      .fill('4.7 en Google con unas 30 reseñas. La gente destaca el café y la atención de Marina.')
    await fichaTextareas
      .nth(3)
      .fill('Tiene fotos propias del local y de los productos — se ven reales, no son de stock.')
    await shot('ficha-completa-antes-de-guardar')

    await page.getByRole('button', { name: 'Guardar ficha' }).click()
    await page.waitForLoadState('networkidle')
    await shot('ficha-guardada-evaluacion-desbloqueada')

    // ── 6. Paso 2 (Evaluación) — la herramienta "Evaluador" externa ──────────
    const toolGuideToggle = page.getByText('Qué es y cómo se usa').first()
    await toolGuideToggle.scrollIntoViewIfNeeded()
    await shot('evaluacion-herramienta-colapsada')
    await toolGuideToggle.click()
    await shot('evaluacion-herramienta-expandida')

    // Como un setter novato real: sin acceso al Evaluador (link pendiente),
    // completa el formulario con el mejor juicio propio — score alto porque el
    // negocio se ve prometedor, eligiendo el veredicto "Caliente" (la palabra
    // suena a "este lead es bueno", sin saber que ese campo no es lo mismo que
    // el "caliente" que solo marca Franco).
    await page
      .getByRole('radiogroup', { name: 'Score de la evaluación' })
      .getByRole('radio', { name: '4', exact: true })
      .click()
    // El Select del design system es un listbox custom: el <select> real queda
    // aria-hidden (solo alimenta el form), así que getByRole('combobox') no lo
    // encuentra. Se apunta por CSS al <select> dentro del Field "Veredicto"
    // (mismo patrón que funcionó para el select de la ficha).
    await page.locator('label:has-text("Veredicto")').locator('xpath=..').locator('select').selectOption('CALIENTE')
    const razonamiento = page.locator('label:has-text("Razonamiento")').locator('xpath=..').locator('textarea')
    await razonamiento.fill(
      'Buena presencia en redes, la dueña maneja todo, reseñas muy buenas y fotos propias del local. Parece un negocio con ganas de mejorar su presencia digital.',
    )
    await shot('evaluacion-formulario-completo')

    await page.getByRole('button', { name: 'Registrar evaluación' }).click()
    await page.waitForLoadState('networkidle')
    await shot('evaluacion-registrada')

    // ── 7. Paso "Primer contacto (opener)" — ya desbloqueado ─────────────────
    // router.refresh() dispara un Suspense fallback (skeleton) antes de pintar
    // el contenido real: esperar el propio textarea del opener (no solo
    // networkidle) evita capturar el flash de esqueleto.
    const openerRoot = page.locator('[data-step="opener"]')
    await openerRoot.scrollIntoViewIfNeeded()
    await openerRoot.locator('textarea').waitFor({ state: 'visible', timeout: 20_000 })
    await shot('opener-desbloqueado')

    await openerRoot
      .locator('textarea')
      .fill(
        'Hola Marina! Vi el café en instagram, se ve buenísimo. Noté que todavía no tienen página web, me encantaría mostrarte cómo quedaría una para el local.',
      )
    await shot('opener-mensaje-listo-para-copiar')

    await openerRoot.getByRole('button', { name: 'Ya lo mandé en Instagram — registrar' }).click()
    await page.waitForLoadState('networkidle')
    await shot('opener-registrado')

    // ── 8. Paso "Brief de diseño" — el gate del link/demo ────────────────────
    // Mismo motivo: esperar el texto final del gate (no solo networkidle)
    // antes de scrollear/capturar, para no pescar el skeleton de la transición.
    const brief = page.getByText('Paso 3 — Brief de diseño')
    await brief.scrollIntoViewIfNeeded()
    await page.getByText('Esperando la respuesta del primer contacto').waitFor({ state: 'visible', timeout: 20_000 })
    await brief.scrollIntoViewIfNeeded()
    await shot('brief-gate-esperando-respuesta')
  } finally {
    await teardown(tracker)
    await disconnect()
  }
})

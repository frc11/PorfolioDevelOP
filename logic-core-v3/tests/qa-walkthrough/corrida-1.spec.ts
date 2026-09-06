import fs from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { mintSessionCookie, attachConsoleGuard } from '../helpers/setter-auth'
import { firstVisible, fieldControl, pickSelect, expectToast, vis } from '../helpers/setter-ui'
import {
  createSetter,
  createLead,
  createNotice,
  prisma,
  newTracker,
  teardown,
  disconnect,
  simulateLeadResponded,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Auditoría perceptual "setter novato" — Corrida 1.
 *
 * NO es un test de CI: es un SCRIPT DE NAVEGACIÓN/CAPTURA de un solo uso que
 * recorre un lead de punta a punta (asignado → agendado) por la UI real,
 * sacando un screenshot en cada pantalla/paso para que Franco los revise. No
 * toca código de producto — solo opera la app y muta DATA de prueba (un
 * setter + un lead namespaced, con teardown al final).
 *
 * Actor: un setter AISLADO recién creado (no `setter-qa`, que ya carga 13
 * leads del seed V-1 + posible arrastre de otras corridas) con UN SOLO lead
 * asignado — así el "foco" del home es inequívocamente ese lead, igual que
 * viviría el primer día real de un setter nuevo. Mismo patrón que
 * `07-admin-assign-caliente.spec.ts` (2º actor vía `mintSessionCookie`).
 *
 * Límite de seguridad deliberado: el paso de Agenda NO ejecuta la búsqueda de
 * horarios real (pega contra Cal.com, un sistema externo — podría tocar el
 * calendario real de Franco). Para llegar al estado final "Reunión agendada"
 * se sigue el mismo atajo que ya usa el smoke existente (B11 en
 * `01-flow.spec.ts`): sembrar `agendaJson` directo en vez de reservar de
 * verdad. Documentado también en el reporte final.
 */

// Otra sesión de Claude Code corrió en paralelo (mismo repo) escribiendo en
// docs/proof-screenshots/corrida-1 (variante con flujo de rechazo/retrabajo del
// admin) — para no mezclar corridas ni tocar ese trabajo, esta usa carpeta propia
// con slug descriptivo (mismo patrón que corrida-1-alta-propia-frio, etc.).
const SCREENS_DIR = 'docs/proof-screenshots/corrida-2-lead-asignado-a-agendado'
fs.mkdirSync(SCREENS_DIR, { recursive: true })

async function snap(page: Page, filename: string, label: string): Promise<void> {
  await page.screenshot({ path: `${SCREENS_DIR}/${filename}`, fullPage: true })
  console.log(`[screenshot] ${filename} — ${label}`)
}

/** El entorno de este server QA tuvo blips transitorios de ERR_CONNECTION_REFUSED
 * durante corridas largas — reintenta la navegación en vez de abortar todo el recorrido. */
async function gotoResilient(page: Page, urlPath: string): Promise<void> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      await page.goto(urlPath, { waitUntil: 'domcontentloaded' })
      return
    } catch (error) {
      lastError = error
      console.log(`[gotoResilient] intento ${attempt} falló para ${urlPath}: ${(error as Error).message}`)
      await page.waitForTimeout(5000)
    }
  }
  throw lastError
}

const tracker: SmokeTracker = newTracker()

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('Corrida 1 · lead asignado → reunión agendada, ojos de setter novato', async ({ page, baseURL }) => {
  test.setTimeout(280_000)
  const url = baseURL ?? 'http://127.0.0.1:3001'
  const guard = attachConsoleGuard(page)
  page.on('dialog', (d) => d.accept().catch(() => undefined))

  // ── Setup: un setter nuevo, un solo lead recién asignado por "Franco" ──────
  const novato = await createSetter(tracker, `novato-corrida1`)
  const lead = await createLead(tracker, {
    setterId: novato.id,
    businessName: 'Pizzería Doña Clara',
    industry: 'gastronomia',
    zone: 'Barrio Norte',
    stage: 'FICHA',
  })
  await mintSessionCookie(page.context(), url, { userId: novato.id, email: novato.email, role: 'SETTER' })

  // ── 1. Entrás al Panel ──────────────────────────────────────────────────────
  await test.step('1. Home — foco', async () => {
    await gotoResilient(page, '/setter')
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await expect(firstVisible(page.getByRole('region', { name: 'Tu foco ahora' }))).toBeVisible()
    await snap(page, '01-home-foco-desktop.png', 'Home del setter — foco (desktop)')

    await page.setViewportSize({ width: 390, height: 5000 })
    await page.waitForTimeout(500) // deja asentar la transición CSS del drawer antes de la captura
    await snap(page, '01m-home-foco-mobile.png', 'Home del setter — foco (mobile 390x844)')
    await page.setViewportSize({ width: 1440, height: 5000 })
  })

  // ── 2. Abrís el lead ────────────────────────────────────────────────────────
  await test.step('2. Abrir el lead asignado', async () => {
    await firstVisible(page.getByRole('button', { name: 'Ir a trabajarlo' })).click()
    await page.waitForURL(/\/setter\/leads\//, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await snap(page, '02-detalle-lead-inicial.png', 'Detalle del lead recién abierto (ficha vacía)')
  })

  // ── 3. Ficha ────────────────────────────────────────────────────────────────
  await test.step('3. Ficha', async () => {
    const presencia = firstVisible(page.getByPlaceholder(/IG activo/i))
    await presencia.fill('tiene Instagram')
    await presencia.blur()
    await expect(firstVisible(page.getByText(/Eso queda corto/i))).toBeVisible()
    await snap(page, '03-ficha-nudge-campo-flojo.png', 'Nudge de calidad en un campo flojo')

    await presencia.fill(
      'IG activo (@pizzeria.donaclara), publica 3 veces por semana, sin web propia, Maps sin fotos del local.',
    )
    await firstVisible(page.getByPlaceholder(/la cuenta la firma/i)).fill(
      'La maneja el dueño, Miguel — se lo ve cocinando en las historias.',
    )
    await firstVisible(page.getByPlaceholder(/Nunca contestan/i)).fill(
      '★★★★☆ 4.3 en Google Maps, 52 reseñas. Repiten que la pizza es buena pero "nunca contestan los pedidos por WhatsApp".',
    )
    await expect(
      firstVisible(page.getByText('✓ Señal mínima lista — guardá y pasala por el Evaluador.')),
    ).toBeVisible()
    await snap(page, '04-ficha-senal-completa.png', 'Ficha con señal mínima completa')

    await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).click()
    await expectToast(page, /Ficha guardada — ya tenés señal/i)
    await snap(page, '05-ficha-guardada.png', 'Ficha guardada — toast + evaluación habilitada')
  })

  // ── 4. Evaluación ───────────────────────────────────────────────────────────
  await test.step('4. Evaluación', async () => {
    await firstVisible(
      page.getByRole('radiogroup', { name: 'Score de la evaluación' }).getByRole('radio', { name: '3' }),
    ).click()
    await pickSelect(page, 'Veredicto del Evaluador', /^Avanzar$/i)
    await firstVisible(fieldControl(page, 'Razonamiento')).fill(
      'Negocio con presencia real y reseñas genuinas — el problema de pedidos por WhatsApp es un gancho concreto para la demo.',
    )
    await snap(page, '06-evaluacion-completada-preenvio.png', 'Evaluación completada, antes de registrar')

    await firstVisible(page.getByRole('button', { name: /^Registrar evaluación$/i })).click()
    await expectToast(page, /Evaluación registrada/i)
    await snap(page, '07-evaluacion-registrada.png', 'Evaluación registrada — EVALUADA, opener visible')
  })

  // ── 4b. Opener — el gate del link (nunca sale antes de tiempo) ─────────────
  await test.step('4b. Opener — intento con link bloqueado, luego válido', async () => {
    const opener = firstVisible(fieldControl(page, 'Tu opener'))
    const registrar = firstVisible(
      page.getByRole('button', { name: /Ya lo mandé en Instagram — registrar/i }),
    )
    const gateAlert = vis(page.locator('[data-lead-wizard]').getByRole('alert'))

    await opener.fill('Mirá esta demo que armamos: https://ejemplo.com/demo')
    await expect(registrar).toBeDisabled()
    await expect(gateAlert).toHaveCount(1)
    await snap(page, '08-opener-gate-link-bloqueado.png', 'Opener con link — bloqueado por el gate')

    await opener.fill(
      'Hola! Vi que a veces se les escapan pedidos por WhatsApp. Tengo algo concreto armado para mostrarte, ¿te copa que te lo pase?',
    )
    await expect(registrar).toBeEnabled()
    await registrar.click()
    await expectToast(page, /Opener registrado/i)
    await snap(page, '09-opener-registrado.png', 'Opener registrado — esperando respuesta del negocio')
  })

  // ── 4c. El negocio responde (evento externo simulado) → abre el brief ─────
  await test.step('4c. El negocio responde → gate del brief abre', async () => {
    await simulateLeadResponded(lead.id)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(firstVisible(page.getByText(/Respuesta del Gem/i))).toBeVisible()
    await snap(page, '10-lead-respondio-brief-abierto.png', 'El lead respondió — brief abierto')
  })

  // ── 5. Brief ────────────────────────────────────────────────────────────────
  await test.step('5. Brief', async () => {
    await firstVisible(fieldControl(page, 'Respuesta del Gem')).fill(
      'Brief generado por el Gem de diseño: landing de una sola página, foco en pedidos por WhatsApp, tono cálido y casero.',
    )
    await firstVisible(fieldControl(page, 'Título del brief')).fill('Landing demo — Pizzería Doña Clara')
    await firstVisible(fieldControl(page, 'Secciones de la demo')).fill(
      'Hero\nMenú destacado\nReseñas\nContacto WhatsApp',
    )
    await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()
    await expectToast(page, /Brief guardado/i)
    await snap(page, '11-brief-guardado.png', 'Brief guardado — BRIEF, construcción habilitada')
  })

  // ── 6. Construcción — el corazón: 6 fases una a la vez ─────────────────────
  const fases: Array<{ titulo: string; file: string; label: string }> = [
    { titulo: 'Estructura', file: '13-construccion-fase2-personalizacion.png', label: 'Fase 1 hecha → Fase 2 activa' },
    { titulo: 'Personalización con datos del negocio', file: '14-construccion-fase3-assets.png', label: 'Fase 2 hecha → Fase 3 activa' },
    { titulo: 'Assets reales', file: '15-construccion-fase4-cta.png', label: 'Fase 3 hecha → Fase 4 activa' },
    { titulo: 'CTA de WhatsApp', file: '16-construccion-fase5-calidad-motion.png', label: 'Fase 4 hecha → Fase 5 activa' },
    { titulo: 'Calidad y motion', file: '17-construccion-fase6-mobile.png', label: 'Fase 5 hecha → Fase 6 activa' },
  ]

  await test.step('6. Construcción', async () => {
    await firstVisible(page.getByRole('button', { name: 'Arrancar construcción' })).click()
    await expectToast(page, /Construcción arrancada/i)
    await snap(page, '12-construccion-arrancada-fase1.png', 'Construcción arrancada — Fase 1 Estructura activa')

    await page.setViewportSize({ width: 390, height: 5000 })
    await page.waitForTimeout(500) // deja asentar la transición CSS del drawer antes de la captura
    await snap(page, '12m-mobile-construccion-fase1.png', 'Checklist de construcción — Fase 1 (mobile)')
    await page.setViewportSize({ width: 1440, height: 5000 })

    for (const fase of fases) {
      await firstVisible(page.getByRole('button', { name: `Marcar «${fase.titulo}» como hecha` })).click()
      await page.waitForTimeout(400) // useTransition optimista — deja asentar antes de la próxima screenshot
      await snap(page, fase.file, fase.label)
    }
    // Última fase (Mobile) pendiente de marcar.
    await firstVisible(page.getByRole('button', { name: 'Marcar «Mobile» como hecha' })).click()
    await page.waitForTimeout(400)
    await snap(page, '18-construccion-6de6-completo.png', 'Checklist de construcción 6/6 completo')
  })

  // ── 6b. Draft ───────────────────────────────────────────────────────────────
  await test.step('6b. Draft', async () => {
    await firstVisible(fieldControl(page, 'URL del borrador')).fill('https://pizzeria-dona-clara-demo.netlify.app')
    await firstVisible(page.getByRole('switch', { name: /Confirmo que abrí el link y carga/i })).click()
    await firstVisible(page.getByRole('button', { name: 'Guardar borrador' })).click()
    await expectToast(page, /Borrador guardado/i)
    await snap(page, '19-draft-guardado.png', 'Draft publicado y guardado')
  })

  // ── 7. Self-check ───────────────────────────────────────────────────────────
  const HARD_CHECK_NOMBRES = [
    'La demo carga',
    'Se ve bien en tu celular',
    'No hay lorem ipsum ni textos de relleno',
    'Los links y el botón de WhatsApp funcionan',
    'Usa los datos y assets reales del negocio',
    'La demo dice lo que el brief pedía',
  ] as const

  await test.step('7. Self-check', async () => {
    await snap(page, '20-selfcheck-inicial-bloqueado.png', 'Self-check inicial — todo en rojo, envío bloqueado')

    for (const nombre of HARD_CHECK_NOMBRES.slice(0, 5)) {
      await firstVisible(page.getByRole('switch', { name: nombre })).click()
    }
    await expect(firstVisible(page.getByText(/Queda 1 obligatorio en rojo/i))).toBeVisible()
    await snap(page, '21-selfcheck-5de6-bloqueado.png', '5/6 obligatorios en verde — todavía bloqueado, motivo visible')

    await page.setViewportSize({ width: 390, height: 5000 })
    await page.waitForTimeout(500) // deja asentar la transición CSS del drawer antes de la captura
    await snap(page, '21m-mobile-selfcheck-bloqueado.png', 'Self-check 5/6 bloqueado (mobile)')
    await page.setViewportSize({ width: 1440, height: 5000 })

    await firstVisible(page.getByRole('switch', { name: HARD_CHECK_NOMBRES[5] })).click()
    await expect(
      firstVisible(page.getByText(/Todos los obligatorios en verde — podés enviar a revisión\./i)),
    ).toBeVisible()
    await snap(page, '22-selfcheck-6de6-listo.png', '6/6 obligatorios en verde — envío habilitado')

    const enviar = firstVisible(page.getByRole('button', { name: 'Enviar a revisión' }))
    await expect(enviar).toBeEnabled()
    await enviar.click()
    await expectToast(page, /enviada a revisión/i)
    await snap(page, '23-enviado-a-revision.png', 'Demo enviada a revisión — EN_REVISION')
  })

  // ── 8. Admin aprueba (fuera de la evaluación del setter, solo para progresar) ─
  // NOTA METODOLÓGICA: esta transición se hace por escritura directa a la DB (mismo
  // resultado que produce la acción real de aprobación del admin: stage→APROBADA +
  // finalUrl + la novedad dirigida al setter), NO manejando la UI de /admin con un
  // segundo actor logueado en la MISMA página. Se probó manejar el admin real
  // (login super-admin → Aprobar → confirmar → volver a mintear la sesión del
  // setter) y el swap de actor sobre el mismo `page`/context disparaba
  // ERR_CONNECTION_REFUSED sostenido (10+ reintentos, 60s) en la navegación
  // siguiente pese a que el server seguía respondiendo 200 a curl en paralelo —
  // algo del lado de Chromium/contexto, no del server. El lado admin no es lo que
  // esta corrida evalúa (es el setter quien es novato), así que se evita el swap.
  await test.step('8. Admin aprueba la demo (transición de datos — no evaluado como UX de setter)', async () => {
    await prisma.osLeadDossier.update({
      where: { leadId: lead.id },
      data: { stage: 'APROBADA', aprobadaAt: new Date(), finalUrl: 'https://pizzeriadonaclara.com.ar' },
    })
    await createNotice({
      setterId: novato.id,
      leadId: lead.id,
      kind: 'DEMO_APROBADA',
      title: 'Franco aprobó tu demo',
      body: 'Pizzería Doña Clara — demo aprobada, ya podés enviarla.',
    })
  })

  // ── 9. De vuelta como setter: notificación + envío del link (flujo invertido) ─
  await test.step('9. Demo aprobada — notificación + envío del link', async () => {
    await gotoResilient(page, '/setter')
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await snap(page, '25-demo-aprobada-notificacion-setter.png', 'Home del setter tras la aprobación — novedad')

    await gotoResilient(page, `/setter/leads/${lead.id}`)
    await expect(firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i }))).toBeVisible()
    await snap(page, '26-listo-para-enviar-link.png', 'Listo para enviar el link — el momento del flujo invertido')

    await firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i })).click()
    await expectToast(page, /Demo enviada registrada/i)
    await expect(async () => {
      const dossier = await prisma.osLeadDossier.findUnique({ where: { leadId: lead.id } })
      expect(dossier?.enviadaAt).not.toBeNull()
    }).toPass({ timeout: 15_000 })
    await snap(page, '27-demo-enviada-registrada.png', 'Demo enviada — registrada')
  })

  // ── 10. Agenda ──────────────────────────────────────────────────────────────
  await test.step('10. Agendar la reunión', async () => {
    await expect(firstVisible(page.getByRole('checkbox', { name: /Estoy hablando con el dueño/i }))).toBeVisible()
    await snap(page, '28-agendar-reunion-decisor.png', 'Paso de agenda abierto — checkbox del decisor')

    // Límite de seguridad: NO se ejecuta "Buscar horarios libres de Franco" (pega
    // contra Cal.com real). Se llega al estado final "Reunión agendada" sembrando
    // agendaJson directo — mismo atajo que B11 en 01-flow.spec.ts.
    await prisma.osLeadDossier.update({
      where: { leadId: lead.id },
      data: {
        agendaJson: {
          estado: 'AGENDADA',
          calBookingUid: 'cal_corrida1_walkthrough',
          notasTraspaso:
            'Habló con Miguel (dueño). Le duele perder pedidos por WhatsApp fuera de horario. Quiere ver la demo funcionando antes de decidir. No mencionar precio todavía.',
          agendadaAt: new Date().toISOString(),
        },
      },
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(firstVisible(page.getByRole('heading', { name: 'Reunión agendada' }))).toBeVisible()
    await snap(page, '29-reunion-agendada-final.png', 'Reunión agendada — estado final del recorrido')
  })

  // ── 11. Vuelta al home — cierre del recorrido ──────────────────────────────
  await test.step('11. Home final', async () => {
    await gotoResilient(page, '/setter')
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await snap(page, '30-home-final.png', 'Home del setter — recorrido cerrado')
  })

  console.log(`[console-guard] errores de consola capturados durante todo el recorrido: ${guard.errors.length}`)
  if (guard.errors.length > 0) console.log(guard.errors.join('\n'))
})

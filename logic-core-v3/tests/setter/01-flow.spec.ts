import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, fieldControl, pickSelect, expectToast } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  simulateLeadResponded,
  getDossier,
  countNoticesFor,
  prisma,
  newTracker,
  teardown,
  disconnect,
  agendaAgendadaJson,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección B — Recorrido COMPLETO de un lead por la UI, etapa por etapa. La
 * aserción dura de "TODO ANDA" es el ESTADO EN DB tras cada acción (robusto a
 * cambios de copy); además se chequean señales clave de UI. El camino principal
 * es AVANZAR (gate cerrado hasta respuesta); DESCARTADA y rechazo-admin van como
 * leads aparte. Agenda se verifica por seed (depende de Cal.com externo).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let leadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id
  const lead = await createLead(tracker, { setterId, businessName: 'Flujo Completo', stage: 'FICHA' })
  leadId = lead.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test.describe.serial('Recorrido completo del lead (FICHA → APROBADA → envío)', () => {
  test('B1 · FICHA: nudge de calidad advisory + señal + guardado persiste', async ({ page }) => {
    const guard = attachConsoleGuard(page)
    page.on('dialog', (d) => d.accept().catch(() => undefined)) // unsaved-guard beforeunload

    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    // Nudge de CALIDAD (advisory, NO bloquea): input flojo en blur → CampoMejora.
    const presencia = firstVisible(page.getByPlaceholder(/IG activo/i))
    await presencia.fill('tiene Instagram') // 15 < 40 chars → flojo
    await presencia.blur()
    await expect(firstVisible(page.getByText(/Eso queda corto/i))).toBeVisible()
    // Apenas vuelve a escribir, el nudge desaparece.
    await presencia.fill('IG activo, publican 2-3 veces por semana, sin web, Maps sin fotos.')
    await expect(page.getByText(/Eso queda corto/i)).toHaveCount(0)

    // Señal mínima: identidad + presencia + reseñas.
    await firstVisible(page.getByPlaceholder(/la cuenta la firma/i)).fill('La firma "Marce", dueño visible en las fotos del local.')
    await firstVisible(page.getByPlaceholder(/Nunca contestan/i)).fill('★☆☆☆☆ "Nunca contestan el WhatsApp" (mar 2026). Repetida 3 veces.')

    // Banner de señal completa.
    await expect(firstVisible(page.getByText('✓ Señal mínima lista — guardá y pasala por el Evaluador.'))).toBeVisible()

    // Guardar → toast + persistencia en DB.
    await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).click()
    await expectToast(page, /Ficha guardada — ya tenés señal/i)

    const dossier = await getDossier(leadId)
    expect(dossier?.stage).toBe('FICHA')
    expect(dossier?.fichaJson, 'fichaJson persistido').toBeTruthy()
    expectNoConsoleErrors(guard)
  })

  test('B2 · EVALUACIÓN: registrar (AVANZAR) transiciona FICHA→EVALUADA', async ({ page }) => {
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    // El form de evaluación está habilitado (la ficha tiene señal).
    await firstVisible(page.getByRole('radiogroup', { name: 'Score de la evaluación' })
      .getByRole('radio', { name: '3' })).click()
    await pickSelect(page, 'Veredicto del Evaluador', /^Avanzar$/i)
    await firstVisible(fieldControl(page, 'Razonamiento')).fill('Negocio con presencia y reseñas reales — buen fit para una demo.')

    await firstVisible(page.getByRole('button', { name: /^Registrar evaluación$/i })).click()
    await expectToast(page, /Evaluación registrada/i)

    const dossier = await getDossier(leadId)
    expect(dossier?.stage, 'FICHA→EVALUADA por la vía legal').toBe('EVALUADA')
  })

  test('B3 · OPENER: rechaza link (hard-block) + registra + idempotencia', async ({ page }) => {
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    const opener = firstVisible(fieldControl(page, 'Tu opener'))
    // 🔴 ASSERT CRÍTICO: meter un link → error + botón deshabilitado.
    await opener.fill('Mirá esta demo: https://ejemplo.com')
    // El alert vivo (on-fill) muestra GUIA_OPENER.gate.titulo, no el mensaje del schema
    // (que recién aparece post-submit). Afirmamos lo que el hard-block surfacea al tipear.
    await expect(firstVisible(page.getByText(/El link NO va en el opener/i))).toBeVisible()
    const registrar = firstVisible(page.getByRole('button', { name: /Ya lo mandé en Instagram — registrar/i }))
    await expect(registrar).toBeDisabled()

    // Opener válido (sin link).
    await opener.fill('Hola! Vi que no contestan los DMs y se les escapan pedidos. Tengo algo concreto, ¿te muestro?')
    await expect(registrar).toBeEnabled()
    await registrar.click()
    await expectToast(page, /Opener registrado/i)

    // DB: exactamente 1 actividad comercial.
    const count1 = await prisma.osLeadActivity.count({ where: { leadId, channel: { not: 'SISTEMA' } } })
    expect(count1, '1 contacto tras el opener').toBe(1)

    // Idempotencia: al recargar ya figura "Enviado" y no se puede re-registrar.
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(firstVisible(page.getByText('Enviado'))).toBeVisible()
    const count2 = await prisma.osLeadActivity.count({ where: { leadId, channel: { not: 'SISTEMA' } } })
    expect(count2, 'sigue habiendo 1 contacto').toBe(1)
  })

  test('B4 · respuesta del negocio abre el BRIEF (gate) + transición EVALUADA→BRIEF', async ({ page }) => {
    // Simular que el negocio respondió (abre gateBriefAbierto).
    await simulateLeadResponded(leadId)

    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    // Brief abierto: completar y guardar (primer guardado en EVALUADA → BRIEF).
    await firstVisible(fieldControl(page, 'Respuesta del Gem')).fill('Brief generado por el Gem de diseño (seed e2e).')
    await firstVisible(fieldControl(page, 'Título del brief')).fill('Landing demo — negocio local')
    await firstVisible(fieldControl(page, 'Secciones de la demo')).fill('Hero\nServicios\nReseñas\nContacto')

    await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()
    await expectToast(page, /Brief guardado/i)

    const dossier = await getDossier(leadId)
    expect(dossier?.stage, 'EVALUADA→BRIEF por la vía legal (gate)').toBe('BRIEF')
  })

  test('B5 · CONSTRUCCIÓN: arrancar + escalar "me trabé" persiste', async ({ page }) => {
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    await firstVisible(page.getByRole('button', { name: 'Arrancar construcción' })).click()
    await expectToast(page, /Construcción arrancada/i)
    expect((await getDossier(leadId))?.stage).toBe('CONSTRUCCION')

    // Escalamiento: "me trabé" → modal → enviar.
    await firstVisible(page.getByRole('button', { name: 'Me trabé — avisar a Franco' })).click()
    await firstVisible(fieldControl(page, 'Qué intentaste'))
      .fill('Probé el shell pero no me cierra la sección de reseñas en mobile.')
    await firstVisible(page.getByRole('button', { name: 'Enviar aviso' })).click()

    // DB: escaladoAt marcado + UI "Ya avisaste a Franco".
    await expect(firstVisible(page.getByText('Ya avisaste a Franco'))).toBeVisible()
    const dossier = await getDossier(leadId)
    expect(dossier?.escaladoAt, 'escaladoAt marcado').not.toBeNull()
  })

  test('B6 · DRAFT + SELF-CHECK + enviar a revisión (CONSTRUCCION→EN_REVISION) + reset escalado', async ({ page }) => {
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    // Draft: URL + confirmación + guardar.
    await firstVisible(fieldControl(page, 'URL del draft')).fill('https://smoke-demo.netlify.app')
    await firstVisible(page.getByRole('switch', { name: /Confirmo que abrí el link y carga/i })).click()
    await firstVisible(page.getByRole('button', { name: 'Guardar draft' })).click()
    await expectToast(page, /Draft guardado/i)
    expect((await getDossier(leadId))?.draftUrl).toBeTruthy()

    // Self-check: TeachPanel + ejemplo presentes.
    await expect(firstVisible(page.getByText('¿Por qué importa?'))).toBeVisible()
    await expect(firstVisible(page.getByText('Ver ejemplo de un self-check bien hecho'))).toBeVisible()

    // Marcar los 6 hard-checks (role=switch por nombre).
    for (const nombre of [
      'La demo carga',
      'Se ve bien en tu celular',
      'No hay lorem ipsum ni textos de relleno',
      'Los links y el botón de WhatsApp funcionan',
      'Usa los datos y assets reales del negocio',
      'La demo dice lo que el brief pedía',
    ]) {
      await firstVisible(page.getByRole('switch', { name: nombre })).click()
    }
    await firstVisible(page.getByRole('button', { name: 'Guardar self-check' })).click()

    // Enviar a revisión (gate: draft + self-check aprobado).
    const enviar = firstVisible(page.getByRole('button', { name: 'Enviar a revisión' }))
    await expect(enviar).toBeEnabled()
    await enviar.click()
    await expectToast(page, /enviada a revisión/i)

    const dossier = await getDossier(leadId)
    expect(dossier?.stage, 'CONSTRUCCION→EN_REVISION').toBe('EN_REVISION')
    expect(dossier?.escaladoAt, 'escalado se LIMPIA en cada transición (no falso positivo)').toBeNull()
  })

  test('B7 · ADMIN aprueba la demo → EN_REVISION→APROBADA + novedad dirigida al setter', async ({ page }) => {
    await qaLogin(page, 'super-admin')
    const res = await page.goto(`/admin/leados/${leadId}`, { waitUntil: 'domcontentloaded' })
    expect(res?.status(), 'GET /admin/leados/[id]').toBeLessThan(400)

    await firstVisible(page.getByRole('button', { name: 'Aprobar' })).click()
    await firstVisible(page.getByLabel('URL permanente')).fill('https://flujo-completo.develop.com.ar')
    await firstVisible(page.getByRole('button', { name: /Confirmar aprobación/i })).click()

    await expect(async () => {
      const dossier = await getDossier(leadId)
      expect(dossier?.stage).toBe('APROBADA')
      expect(dossier?.finalUrl).toBeTruthy()
    }).toPass({ timeout: 15_000 })

    // Novedad dirigida al setter dueño.
    const aprobadas = await countNoticesFor(setterId, 'DEMO_APROBADA')
    expect(aprobadas, 'novedad "Franco aprobó tu demo" emitida').toBeGreaterThanOrEqual(1)
  })

  test('B8 · SEGUIMIENTO: enviar el link (acá SÍ va) crea la demo + idempotencia', async ({ page }) => {
    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    await firstVisible(page.getByRole('button', { name: /Ya la envié — registrar/i })).click()
    await expectToast(page, /Demo enviada|enviada/i).catch(() => undefined)

    await expect(async () => {
      const dossier = await getDossier(leadId)
      expect(dossier?.enviadaAt, 'enviadaAt (claim idempotente)').not.toBeNull()
    }).toPass({ timeout: 15_000 })
    const demos = await prisma.osDemo.count({ where: { leadId } })
    expect(demos, '1 OsDemo creada').toBe(1)

    // Idempotencia del envío: recargar y reintentar no duplica.
    await page.reload({ waitUntil: 'domcontentloaded' })
    const sendBtn = page.getByRole('button', { name: /Ya la envié — registrar/i })
    if (await sendBtn.count()) {
      await firstVisible(sendBtn).click().catch(() => undefined)
    }
    expect(await prisma.osDemo.count({ where: { leadId } }), 'sigue habiendo 1 OsDemo').toBe(1)
  })
})

// ── Ramas aparte (lead propio cada una) ──────────────────────────────────────

test('B9 · DESCARTADA: score bajo → modal → archivo + wizard colapsa al veredicto', async ({ page }) => {
  const setter = await getSetterQa()
  const lead = await createLead(tracker, { setterId: setter.id, businessName: 'Para Descartar', stage: 'FICHA' })
  // Sembrar señal de ficha vía DB para llegar directo a la evaluación.
  await prisma.osLeadDossier.update({
    where: { leadId: lead.id },
    data: { fichaJson: { identidad: { igManejadoPor: 'NO_SABE' }, presenciaDigital: 'IG muerto', resenas: 'sin reseñas reales' } },
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${lead.id}`, { waitUntil: 'domcontentloaded' })

  await firstVisible(page.getByRole('radiogroup', { name: 'Score de la evaluación' }).getByRole('radio', { name: '2' })).click()
  await pickSelect(page, 'Veredicto del Evaluador', /^Descartar$/i)
  await firstVisible(fieldControl(page, 'Razonamiento')).fill('Sin presencia ni materia prima — no hay con qué hacer demo.')
  await firstVisible(page.getByRole('button', { name: /Registrar evaluación y descartar/i })).click()

  // Modal de confirmación de descarte.
  await firstVisible(fieldControl(page, 'Motivo del descarte')).fill('Negocio sin señal digital aprovechable.')
  await firstVisible(page.getByRole('button', { name: 'Registrar y descartar' })).click()

  await expect(async () => {
    expect((await getDossier(lead.id))?.stage).toBe('DESCARTADA')
  }).toPass({ timeout: 15_000 })

  // Wizard colapsa: el self-check NO se renderiza para un lead descartado.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Self-check' })).toHaveCount(0)
})

test('B10 · ADMIN rechaza → EN_REVISION→RECHAZADA + novedad "Franco pidió cambios"', async ({ page }) => {
  const setter = await getSetterQa()
  const lead = await createLead(tracker, { setterId: setter.id, businessName: 'Para Rechazar', stage: 'EN_REVISION', status: 'RESPONDIO' })

  await qaLogin(page, 'super-admin')
  await page.goto(`/admin/leados/${lead.id}`, { waitUntil: 'domcontentloaded' })

  await firstVisible(page.getByRole('button', { name: 'Rechazar' })).click()
  await firstVisible(page.getByLabel('Qué está mal (corto)')).fill('Faltan datos reales')
  await firstVisible(page.getByLabel('Dónde (sección / elemento)')).fill('Hero')
  await firstVisible(page.getByLabel('Arreglo concreto (qué hacer)')).fill('Reemplazar placeholders por nombre y fotos reales del negocio.')
  await firstVisible(page.getByRole('button', { name: /Confirmar rechazo/i })).click()

  await expect(async () => {
    expect((await getDossier(lead.id))?.stage, 'reject → RECHAZADA (no CONSTRUCCION)').toBe('RECHAZADA')
  }).toPass({ timeout: 15_000 })
  expect(await countNoticesFor(setter.id, 'DEMO_RECHAZADA')).toBeGreaterThanOrEqual(1)
})

test('B11 · AGENDA: un lead con reunión agendada refleja "Reunión agendada" (seed)', async ({ page }) => {
  const setter = await getSetterQa()
  const lead = await createLead(tracker, { setterId: setter.id, businessName: 'Con Reunion', stage: 'APROBADA', status: 'CALL_AGENDADA', finalUrl: 'https://x.dev' })
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { agendaJson: agendaAgendadaJson() } })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${lead.id}`, { waitUntil: 'domcontentloaded' })

  await expect(firstVisible(page.getByRole('heading', { name: 'Reunión agendada' }))).toBeVisible()
})

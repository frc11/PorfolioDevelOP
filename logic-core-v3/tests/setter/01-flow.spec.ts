import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, fieldControl, pickSelect, expectToast, vis } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  fichaConSenal,
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
 *
 * 5.5 — Cada test AUTO-PROVISIONA su propio lead en el stage que necesita
 * (seed directo del stage = legítimo en setup, el helper lo documenta). Antes el
 * grupo era `describe.serial` sobre UN lead compartido que progresaba de test en
 * test: un fallo temprano (p.ej. B3 por copy-drift) marcaba B4-B8 como "did not
 * run" y enmascaraba el corazón del flujo. Sin dependencia entre tests, un fallo
 * aislado ya no cascada — cada B verifica su tramo por sí solo. Corre en 1 worker
 * sin paralelismo (playwright.setter.config), así el orden se conserva.
 *
 * 5.6 — EL CORTE: la raíz del lead sirve el manual (pantallas m1–m16). MISMA
 * sustancia (gates, transiciones, aislamiento — los asserts duros en DB no se
 * tocaron), NUEVA navegación: la raíz aterriza en la pantalla derivada y los
 * tramos que viven en otra pantalla navegan por URL (`pantalla()`), que además
 * ES una aserción — la guardia del server redirige lo no habilitado.
 */

/** URL de una pantalla del manual — la guardia del server la valida al navegar. */
const pantalla = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

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

test.describe('Recorrido completo del lead (FICHA → APROBADA → envío)', () => {
  test('B1 · FICHA: nudge de calidad advisory + señal + guardado persiste', async ({ page }) => {
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B1 Ficha', stage: 'FICHA' })
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
    // Lead en FICHA con señal ya sembrada (habilita el form de evaluación).
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B2 Eval', stage: 'FICHA' })
    await prisma.osLeadDossier.update({ where: { leadId }, data: { fichaJson: fichaConSenal() } })

    await qaLogin(page, 'setter')
    // 5.6: con señal, la raíz aterriza en m2 (llevar la ficha al Evaluador); el
    // veredicto se transcribe en m3 — habilitada por la derivación (tarea con vuelta).
    await page.goto(pantalla(leadId, 'm3'), { waitUntil: 'domcontentloaded' })

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
    // Lead ya EVALUADO (no respondió → opener activo, 0 contactos).
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B3 Opener', stage: 'EVALUADA' })

    await qaLogin(page, 'setter')
    await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })

    const opener = firstVisible(fieldControl(page, 'Tu opener'))
    const registrar = firstVisible(page.getByRole('button', { name: /Ya lo mandé en Instagram — registrar/i }))
    // Alerta del gate ACOTADA a la zona Registro del manual (5.6): el único
    // role="alert" ahí es la caja del gate del opener (hay otro role="alert"
    // global —del toaster— fuera de la zona, por eso se acota). El texto exacto
    // vive en guidance-content (GUIA_OPENER.gate) y ya driftó una vez → se asserta
    // el COMPORTAMIENTO, no la frase.
    const gateAlert = vis(page.locator('section[aria-label="Registro"]').getByRole('alert'))

    // 🔴 ASSERT CRÍTICO — COMPORTAMIENTO del gate `contieneLink`: un link BLOQUEA
    // (botón deshabilitado) y hace visible la alerta del gate.
    await opener.fill('Mirá esta demo: https://ejemplo.com')
    await expect(registrar).toBeDisabled()
    await expect(gateAlert).toHaveCount(1)

    // Opener válido (sin link): el gate se levanta (alerta se va) y el registro se habilita.
    await opener.fill('Hola! Vi que no contestan los DMs y se les escapan pedidos. Tengo algo concreto, ¿te muestro?')
    await expect(registrar).toBeEnabled()
    await expect(gateAlert).toHaveCount(0)
    await registrar.click()
    await expectToast(page, /Opener registrado/i)

    // DB: exactamente 1 actividad comercial.
    const count1 = await prisma.osLeadActivity.count({ where: { leadId, channel: { not: 'SISTEMA' } } })
    expect(count1, '1 contacto tras el opener').toBe(1)

    // Idempotencia: la posición re-deriva a la espera (la raíz ya no aterriza en
    // m4); m4 queda COMPLETADA y de consulta — figura "Enviado", sin re-registro.
    await page.goto(pantalla(leadId, 'm4'), { waitUntil: 'domcontentloaded' })
    await expect(firstVisible(page.getByText('Enviado'))).toBeVisible()
    const count2 = await prisma.osLeadActivity.count({ where: { leadId, channel: { not: 'SISTEMA' } } })
    expect(count2, 'sigue habiendo 1 contacto').toBe(1)
  })

  test('B4 · respuesta del negocio abre el BRIEF (gate) + transición EVALUADA→BRIEF', async ({ page }) => {
    // Lead EVALUADO que YA respondió (status RESPONDIO abre gateBriefAbierto).
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B4 Brief', stage: 'EVALUADA', status: 'RESPONDIO' })

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
    // Lead en BRIEF (respondió) → listo para arrancar la construcción.
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B5 Construccion', stage: 'BRIEF', status: 'RESPONDIO' })

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

    // Verdad durable: el escalamiento quedó marcado en el dossier (la action
    // awaitea el write antes de responder). El modal de escalamiento NO hace
    // router.refresh() —a diferencia de las transiciones de stage—: el aviso es un
    // canal lateral que no cambia la etapa, y la confirmación en vivo es el toast.
    // Por eso el banner "Ya avisaste a Franco" recién aparece en la próxima carga.
    // [OUT-OF-SCOPE, reportado a Franco: si se quisiera feedback en vivo del banner,
    //  EscalarModal debería refrescar; hoy es por diseño, no un bug.]
    await expect(async () => {
      expect((await getDossier(leadId))?.escaladoAt, 'escaladoAt marcado').not.toBeNull()
    }).toPass({ timeout: 15_000 })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(firstVisible(page.getByText('Ya avisaste a Franco'))).toBeVisible()
  })

  test('B6 · DRAFT + SELF-CHECK + enviar a revisión (CONSTRUCCION→EN_REVISION) + reset escalado', async ({ page }) => {
    // Lead en CONSTRUCCION con un escalamiento vigente sembrado — para que la
    // aserción "escalado se LIMPIA en la transición" tenga algo real que limpiar.
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B6 Revision', stage: 'CONSTRUCCION', status: 'RESPONDIO' })
    await prisma.osLeadDossier.update({ where: { leadId }, data: { escaladoAt: new Date() } })

    await qaLogin(page, 'setter')
    // 5.6: el borrador vive en m13 (habilitada en CONSTRUCCION sin draft; la
    // raíz aterriza en la primera fase sin tildar).
    await page.goto(pantalla(leadId, 'm13'), { waitUntil: 'domcontentloaded' })

    // Borrador (el «draft» del wizard, vocabulario 2.x): URL + confirmación + guardar.
    await firstVisible(fieldControl(page, 'URL del borrador')).fill('https://smoke-demo.netlify.app')
    await firstVisible(page.getByRole('switch', { name: /Confirmo que abrí el link y carga/i })).click()
    await firstVisible(page.getByRole('button', { name: 'Guardar borrador' })).click()
    await expectToast(page, /Borrador guardado/i)
    expect((await getDossier(leadId))?.draftUrl).toBeTruthy()

    // El chequeo final vive en m14 (se habilita con el borrador publicado).
    await page.goto(pantalla(leadId, 'm14'), { waitUntil: 'domcontentloaded' })

    // Self-check: TeachPanel + ejemplo presentes.
    await expect(firstVisible(page.getByText('¿Por qué importa?'))).toBeVisible()
    await expect(firstVisible(page.getByText('Ver ejemplo de un chequeo final bien hecho'))).toBeVisible()

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
    await firstVisible(page.getByRole('button', { name: 'Guardar el chequeo' })).click()

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
    // Lead en EN_REVISION (respondió) → el admin lo aprueba.
    const { id: leadId } = await createLead(tracker, { setterId, businessName: 'B7 Aprobar', stage: 'EN_REVISION', status: 'RESPONDIO' })

    await qaLogin(page, 'super-admin')
    const res = await page.goto(`/admin/leados/${leadId}`, { waitUntil: 'domcontentloaded' })
    expect(res?.status(), 'GET /admin/leados/[id]').toBeLessThan(400)

    await firstVisible(page.getByRole('button', { name: 'Aprobar' })).click()
    await firstVisible(page.getByLabel('URL permanente')).fill('https://flujo-completo.develop.com.ar')
    await firstVisible(page.getByRole('button', { name: /Confirmar aprobación/i })).click()

    // stage + novedad en el MISMO retry: el aviso al setter es fire-and-forget
    // DESPUÉS del commit del stage (revision.actions), así que la novedad puede
    // aparecer un tick más tarde que APROBADA — asertar ambas juntas evita el race.
    await expect(async () => {
      const dossier = await getDossier(leadId)
      expect(dossier?.stage).toBe('APROBADA')
      expect(dossier?.finalUrl).toBeTruthy()
      const aprobadas = await countNoticesFor(setterId, 'DEMO_APROBADA')
      expect(aprobadas, 'novedad "Franco aprobó tu demo" emitida').toBeGreaterThanOrEqual(1)
    }).toPass({ timeout: 15_000 })
  })

  test('B8 · SEGUIMIENTO: enviar el link (acá SÍ va) crea la demo + idempotencia', async ({ page }) => {
    // Lead APROBADO con finalUrl y que respondió → gate del envío abierto.
    const { id: leadId } = await createLead(tracker, {
      setterId,
      businessName: 'B8 Envio',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      finalUrl: 'https://flujo-completo.develop.com.ar',
    })

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
  const lead = await createLead(tracker, { setterId, businessName: 'Para Descartar', stage: 'FICHA' })
  // Sembrar señal de ficha vía DB para llegar directo a la evaluación.
  await prisma.osLeadDossier.update({
    where: { leadId: lead.id },
    data: { fichaJson: { identidad: { igManejadoPor: 'NO_SABE' }, presenciaDigital: 'IG muerto', resenas: 'sin reseñas reales' } },
  })

  await qaLogin(page, 'setter')
  // 5.6: el veredicto se transcribe en m3 (habilitada — la ficha tiene señal).
  await page.goto(pantalla(lead.id, 'm3'), { waitUntil: 'domcontentloaded' })

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

  // El manual colapsa al veredicto: DESCARTADA es terminal — la raíz aterriza en
  // m3 (sin pantallas por delante) y nada de producción se renderiza.
  await page.goto(`/setter/leads/${lead.id}`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m3$/)
  await expect(page.getByRole('heading', { name: 'Self-check' })).toHaveCount(0)
  // La guardia del server: el chequeo final (m14) NO es alcanzable — redirige a m3.
  await page.goto(pantalla(lead.id, 'm14'), { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m3$/)
})

test('B10 · ADMIN rechaza → EN_REVISION→RECHAZADA + novedad "Franco pidió cambios"', async ({ page }) => {
  const lead = await createLead(tracker, { setterId, businessName: 'Para Rechazar', stage: 'EN_REVISION', status: 'RESPONDIO' })

  await qaLogin(page, 'super-admin')
  await page.goto(`/admin/leados/${lead.id}`, { waitUntil: 'domcontentloaded' })

  await firstVisible(page.getByRole('button', { name: 'Rechazar' })).click()
  await firstVisible(page.getByLabel('Qué está mal (corto)')).fill('Faltan datos reales')
  await firstVisible(page.getByLabel('Dónde (sección / elemento)')).fill('Hero')
  await firstVisible(page.getByLabel('Arreglo concreto (qué hacer)')).fill('Reemplazar placeholders por nombre y fotos reales del negocio.')
  await firstVisible(page.getByRole('button', { name: /Confirmar rechazo/i })).click()

  // stage + novedad en el MISMO retry: `avisarDecisionAlSetter` es fire-and-forget
  // DESPUÉS del commit de la transición (revision.actions), así que el stage se ve
  // en DB un tick antes que la novedad. Asertarlas juntas dentro del toPass mata la
  // flakiness (la cuenta suelta afuera leía 0 bajo carga del suite).
  await expect(async () => {
    expect((await getDossier(lead.id))?.stage, 'reject → RECHAZADA (no CONSTRUCCION)').toBe('RECHAZADA')
    expect(await countNoticesFor(setterId, 'DEMO_RECHAZADA')).toBeGreaterThanOrEqual(1)
  }).toPass({ timeout: 15_000 })
})

test('B11 · AGENDA: un lead con reunión agendada refleja "Reunión agendada" (seed)', async ({ page }) => {
  const lead = await createLead(tracker, { setterId, businessName: 'Con Reunion', stage: 'APROBADA', status: 'CALL_AGENDADA', finalUrl: 'https://x.dev' })
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { agendaJson: agendaAgendadaJson() } })

  await qaLogin(page, 'setter')
  // 5.6: la agenda vive en m16 — COMPLETADA con la reunión agendada (navegable
  // de consulta; la raíz aterriza en el envío/espera según el gate).
  await page.goto(pantalla(lead.id, 'm16'), { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/manual\/m16$/)
  await expect(firstVisible(page.getByText('Reunión agendada'))).toBeVisible()
})

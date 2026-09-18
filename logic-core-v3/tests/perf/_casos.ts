import type { Page } from '@playwright/test'
import { ActivityChannel, ActivityResult } from '@prisma/client'
import { firstVisible, pickSelect } from '../helpers/setter-ui'
import { createLead, prisma, registerActivity, type SmokeTracker } from '../helpers/setter-db'
import { registrarContactoComercial } from '../../src/lib/os-commercial'
import { getOwnedLead } from '../../src/lib/leados/ownership'
import { listOwnedLeadActivities } from '../../src/lib/leados/outreach'
import {
  getOwnedDossier,
  saveOwnedBrief,
  saveOwnedDraftUrl,
  saveOwnedFicha,
  saveOwnedProgreso,
  saveOwnedSelfCheck,
  marcarEscaladoOwned,
  marcarDemoEnviadaOwned,
  transitionDossier,
} from '../../src/lib/leados/dossier'
import { HARD_CHECKS } from '../../src/lib/leados/flow'
import { ownedLeadCreateData } from '../../src/lib/leados/isolation'

/**
 * P28 — LAS DIECISIETE ACCIONES CON REGISTRO DEL RECORRIDO.
 *
 * Qué entra y qué no. Entra todo acto del setter que ESCRIBE mientras lleva un
 * lead de la nada a la reunión, incluida la vuelta del re-loop. No entran los
 * de administración de la cartera (fijar, pausar, nota, novedades vistas): no
 * son pasos del recorrido, son mantenimiento del panel.
 *
 * Las dos de m16 (`ofrecerHorarios`, `confirmarReunion`) NO están, y el motivo
 * está escrito en el reporte: las dos cruzan a Cal.com, así que su latencia no
 * es de este sistema — y `confirmarReunion` además CREA una reunión real en la
 * agenda de Franco, que no es algo que un instrumento de medición pueda hacer
 * diecisiete veces. Comparten `revalidarSetter` con las demás, así que lo que
 * este sprint mueva las mueve igual.
 *
 * Cada caso trae:
 *   - `sembrar`: el lead en el estado exacto de partida (uno por pasada: las
 *     acciones escriben, así que reusar el lead mediría la segunda vez).
 *   - `url`: dónde aterriza.
 *   - `alistar`: lo previo que NO es el registro (llenar campos, elegir opción).
 *     Queda FUERA de la medición a propósito: tipear no es la latencia del
 *     sistema.
 *   - `actuar`: EL acto. El cronómetro arranca en ese clic.
 *   - `verificar`: que la escritura ocurrió, releída de la base — sin esto, un
 *     número rápido podría ser el de una acción que no hizo nada.
 *   - `escrituraSola`: el MISMO camino de dominio que la action usa para
 *     escribir, corrido en proceso contra un lead gemelo sembrado igual. Es la
 *     columna «la base, sola».
 *   - `adoptarCreado` (P39): solo para el caso cuya acción CREA la fila en vez
 *     de recibirla sembrada. La registra en el tracker para que el teardown la
 *     borre. Corre después de la medición, así que no la toca.
 */

export type PreparacionCaso = { leadId: string; url: string; nombre?: string }

export type Caso = {
  clave: string
  titulo: string
  pantalla: string
  sembrar: (tracker: SmokeTracker, setterId: string) => Promise<PreparacionCaso>
  alistar?: (page: Page, prep: PreparacionCaso) => Promise<void>
  actuar: (page: Page, prep: PreparacionCaso) => Promise<void>
  verificar: (leadId: string) => Promise<boolean>
  escrituraSola: (leadId: string, setterId: string) => Promise<void>
  adoptarCreado?: (page: Page, tracker: SmokeTracker) => Promise<void>
}

const pantallaUrl = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

/**
 * TODO selector va scopeado al área de trabajo (`main`) o al diálogo abierto, y
 * no a la página. Medido: el riel de navegación tiene una entrada «Cargar
 * prospecto» que `getByRole('button', …)` a nivel page agarraba ANTES que el
 * botón del formulario — el clic salía «bien» (llegaba a un botón real,
 * `isTrusted`), no pasaba nada, y la medición registraba cero mutaciones y cero
 * viajes sin fallar. Un instrumento que mide la nada en silencio es peor que uno
 * que se rompe.
 */
const zona = (page: Page) => page.locator('main')

/** El control de un `<Field>` por el texto de su label, DENTRO de `main`
 *  (`fieldControl` del helper compartido va con xpath absoluto). */
function campo(page: Page, label: string) {
  const seguro = label.replace(/"/g, '\\"')
  return firstVisible(
    zona(page).locator(
      `xpath=.//label[contains(normalize-space(.), "${seguro}")]/parent::div//*[self::input or self::textarea][1]`,
    ),
  )
}

const boton = (page: Page, nombre: string | RegExp) =>
  firstVisible(zona(page).getByRole('button', { name: nombre }))

const interruptor = (page: Page, nombre: string | RegExp) =>
  firstVisible(zona(page).getByRole('switch', { name: nombre }))

const OPENER = 'Hola! Vi que no contestan los DMs y se les escapan pedidos. Tengo algo concreto, ¿te muestro?'
const RAZONAMIENTO = 'Negocio con presencia y reseñas reales — buen fit para una demo.'
const BRIEF_GEM = 'Respuesta cruda del Gem de diseño para la medición de latencia.'
const DRAFT_URL = 'https://p28-medicion.netlify.app'

/** Ficha con señal mínima, en el shape del formulario (no el del seed). */
const FICHA_SENAL = {
  identidad: { igManejadoPor: 'DUENO' as const, notas: 'Dueño visible en historias' },
  presenciaDigital: 'IG activo (~1.2k seguidores), web vieja sin mobile, Maps sin fotos.',
  resenas: '4.6 en Google Maps, 38 reseñas, una queja repetida por WhatsApp.',
  contenidoReal: 'Logo propio + fotos reales del local',
}

const BRIEF = {
  titulo: 'Landing demo — negocio local',
  concepto: 'One-page mobile-first con CTA de WhatsApp',
  secciones: ['Hero', 'Servicios', 'Reseñas', 'Contacto'],
  pegadoGem: BRIEF_GEM,
}

const TILDES_CONSTRUCCION = 'main section[aria-label="Registro"] button[aria-pressed]'

async function dossierDe(leadId: string) {
  return prisma.osLeadDossier.findUnique({ where: { leadId } })
}

async function contactos(leadId: string): Promise<number> {
  return prisma.osLeadActivity.count({ where: { leadId, channel: { not: 'SISTEMA' } } })
}

/** El primer hard-check vigente: el sujeto del tilde de m14. */
const PRIMER_HARD_CHECK = HARD_CHECKS[0]!.nombre

export const CASOS: readonly Caso[] = [
  {
    clave: 'alta',
    titulo: 'Cargar el prospecto',
    pantalla: 'alta',
    sembrar: async () => ({ leadId: '', url: '/setter/nuevo' }),
    alistar: async (page) => {
      await campo(page, 'Nombre del negocio').fill(
        `SMOKE-SETTER P28 alta ${Date.now()}`,
      )
      await campo(page, 'Rubro').fill('Gastronomía')
    },
    actuar: async (page) => {
      await boton(page, 'Cargar prospecto').click()
    },
    // El lead lo crea la acción: la prueba es que la URL destino ya es su ficha.
    verificar: async () => true,
    // P39 — el lead lo creó el formulario, así que nadie lo había registrado: uno
    // por pasada quedaba en la cartera de setter-qa para siempre (51 hasta P37). Su
    // id es el de la URL destino — la ficha a la que la acción redirige.
    adoptarCreado: async (page, tracker) => {
      await page.waitForURL(/\/setter\/leads\/[^/?#]+/, { timeout: 30_000 })
      const id = /\/setter\/leads\/([^/?#]+)/.exec(new URL(page.url()).pathname)?.[1]
      if (!id) throw new Error(`alta: la URL destino no trae el id del lead creado (${page.url()})`)
      tracker.leadIds.push(id)
    },
    escrituraSola: async (_leadId, setterId) => {
      const creado = await prisma.osLead.create({
        data: ownedLeadCreateData(
          { businessName: `SMOKE-SETTER P28 escritura ${Date.now()}`, industry: 'Gastronomía' },
          setterId,
        ),
        select: { id: true },
      })
      await prisma.osLead.delete({ where: { id: creado.id } })
    },
  },

  {
    clave: 'foco',
    titulo: 'Trabajar este lead (anclar el foco)',
    pantalla: 'panel',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, { setterId, businessName: 'P28 Foco', stage: 'FICHA' })
      return { leadId: lead.id, url: '/setter', nombre: lead.businessName }
    },
    // El sujeto es el PRIMERO de la cola del día, no el lead sembrado: la cola
    // muestra la cima (cuatro filas), y forzar ahí un lead recién creado pediría
    // manipular el orden — otra cosa que la que se está midiendo. `anclarFoco`
    // solo escribe la cookie del foco: no muta ningún lead, así que medirlo
    // sobre la cima no deja rastro en los datos.
    actuar: async (page) => {
      await boton(page, /^Trabajar /).click()
    },
    verificar: async () => true,
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
    },
  },

  {
    clave: 'm1-ficha',
    titulo: 'Guardar la ficha',
    pantalla: 'm1',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, { setterId, businessName: 'P28 Ficha', stage: 'FICHA' })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm1') }
    },
    alistar: async (page) => {
      const abrir = (nombre: string) => boton(page, nombre).click()
      await abrir('1 · En Instagram')
      await firstVisible(zona(page).getByPlaceholder(/la cuenta la firma/i)).fill(
        'La firma "Marce", dueño visible en las fotos del local.',
      )
      await abrir('2 · En Google y Maps')
      await firstVisible(zona(page).getByPlaceholder(/Nunca contestan/i)).fill(
        '★☆☆☆☆ "Nunca contestan el WhatsApp" (mar 2026). Repetida 3 veces.',
      )
      await abrir('4 · Mirando las tres juntas')
      await firstVisible(zona(page).getByPlaceholder(/IG activo/i)).fill(
        'IG activo, publican 2-3 veces por semana, sin web, Maps sin fotos.',
      )
    },
    actuar: async (page) => {
      await boton(page, 'Guardar ficha').click()
    },
    verificar: async (leadId) => Boolean((await dossierDe(leadId))?.fichaJson),
    escrituraSola: async (leadId, setterId) => {
      await saveOwnedFicha(leadId, setterId, FICHA_SENAL)
    },
  },

  {
    clave: 'm1-veredicto',
    titulo: 'Registrar el veredicto',
    pantalla: 'm1',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, { setterId, businessName: 'P28 Veredicto', stage: 'FICHA' })
      await prisma.osLeadDossier.update({
        where: { leadId: lead.id },
        data: { fichaJson: FICHA_SENAL },
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm1') }
    },
    alistar: async (page) => {
      await firstVisible(
        zona(page).getByRole('radiogroup', { name: 'Score de la evaluación' }).getByRole('radio', { name: '3' }),
      ).click()
      await pickSelect(page, 'Tu veredicto', /^Avanzar$/i)
      await campo(page, 'Razonamiento').fill(RAZONAMIENTO)
    },
    actuar: async (page) => {
      await boton(page, /^Registrar evaluación$/i).click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.stage === 'EVALUADA',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
      await getOwnedDossier(leadId, setterId)
      await transitionDossier(leadId, {
        to: 'EVALUADA',
        evaluacion: { score: 3, veredicto: 'AVANZAR', razonamiento: RAZONAMIENTO },
      })
    },
  },

  {
    clave: 'm4-opener',
    titulo: 'Registrar el opener',
    pantalla: 'm4',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, { setterId, businessName: 'P28 Opener', stage: 'EVALUADA' })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm4') }
    },
    alistar: async (page) => {
      await campo(page, 'Tu opener').fill(OPENER)
    },
    actuar: async (page) => {
      await boton(page, /Ya lo mandé en Instagram — registrar/i).click()
    },
    verificar: async (leadId) => (await contactos(leadId)) === 1,
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
      await getOwnedDossier(leadId, setterId)
      await listOwnedLeadActivities(leadId, setterId)
      await registrarContactoComercial({
        leadId,
        channel: ActivityChannel.INSTAGRAM_DM,
        result: ActivityResult.SIN_RESPUESTA,
        notes: `Opener: ${OPENER}`,
        performedById: setterId,
      })
    },
  },

  {
    clave: 'm5-respondio',
    titulo: 'Registrar «Respondió»',
    pantalla: 'm5',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Respondio',
        stage: 'EVALUADA',
        nextFollowUpAt: new Date(Date.now() - 60 * 60 * 1000),
      })
      await registerActivity(lead.id, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'Opener: seed P28')
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm5') }
    },
    alistar: async (page) => {
      await boton(page, /^Respondió/).click()
    },
    actuar: async (page) => {
      await boton(page, 'Registrar resultado').click()
    },
    verificar: async (leadId) =>
      (await prisma.osLeadActivity.count({ where: { leadId, result: 'RESPONDIO' } })) === 1,
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
      await listOwnedLeadActivities(leadId, setterId)
      await registrarContactoComercial({
        leadId,
        channel: ActivityChannel.INSTAGRAM_DM,
        result: ActivityResult.RESPONDIO,
        notes: undefined,
        performedById: setterId,
      })
    },
  },

  {
    clave: 'm5-postergar',
    titulo: 'Postergar el lead',
    pantalla: 'm5',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Postergar',
        stage: 'EVALUADA',
        nextFollowUpAt: new Date(Date.now() - 60 * 60 * 1000),
      })
      await registerActivity(lead.id, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'Opener: seed P28')
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm5') }
    },
    alistar: async (page) => {
      await boton(page, /^Postergar/).click()
      const manana = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      await campo(page, '¿Cuándo retomamos el contacto?').fill(manana)
    },
    actuar: async (page) => {
      await boton(page, 'Registrar resultado').click()
    },
    verificar: async (leadId) =>
      (await prisma.osLead.findUnique({ where: { id: leadId } }))?.status === 'POSTERGADO',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
      await listOwnedLeadActivities(leadId, setterId)
      await registrarContactoComercial({
        leadId,
        channel: ActivityChannel.INSTAGRAM_DM,
        result: ActivityResult.POSTERGADO,
        notes: undefined,
        performedById: setterId,
      })
    },
  },

  {
    clave: 'm6-brief',
    titulo: 'Guardar el brief',
    pantalla: 'm6',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Brief',
        stage: 'EVALUADA',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm6') }
    },
    alistar: async (page) => {
      await campo(page, 'Respuesta del Gem').fill(BRIEF_GEM)
      await campo(page, 'Título del brief').fill(BRIEF.titulo)
      await campo(page, 'Secciones de la demo').fill(BRIEF.secciones.join('\n'))
    },
    actuar: async (page) => {
      await boton(page, 'Guardar brief').click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.stage === 'BRIEF',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedDossier(leadId, setterId)
      await saveOwnedBrief(leadId, setterId, BRIEF)
    },
  },

  {
    clave: 'mc-arrancar',
    titulo: 'Arrancar la construcción',
    pantalla: 'mc1',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Arrancar',
        stage: 'BRIEF',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'mc1') }
    },
    actuar: async (page) => {
      await boton(page, 'Arrancar construcción').click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.stage === 'CONSTRUCCION',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedDossier(leadId, setterId)
      await transitionDossier(leadId, { to: 'CONSTRUCCION' })
    },
  },

  {
    clave: 'mc1-tilde',
    titulo: 'Tildar una fase (mc1)',
    pantalla: 'mc1',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Tilde mc1',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'mc1') }
    },
    actuar: async (page) => {
      await firstVisible(page.locator(TILDES_CONSTRUCCION)).click()
    },
    verificar: async (leadId) => {
      const progreso = (await dossierDe(leadId))?.progresoJson as { completadas?: string[] } | null
      return (progreso?.completadas?.length ?? 0) >= 1
    },
    escrituraSola: async (leadId, setterId) => {
      await saveOwnedProgreso(leadId, setterId, { completadas: ['estructura'] })
    },
  },

  {
    clave: 'mc2-tilde',
    titulo: 'Tildar una fase (mc2)',
    pantalla: 'mc2',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Tilde mc2',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
        progresoCompletadas: ['estructura', 'personalizacion', 'assets'],
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'mc2') }
    },
    actuar: async (page) => {
      await firstVisible(page.locator(TILDES_CONSTRUCCION)).click()
    },
    verificar: async (leadId) => {
      const progreso = (await dossierDe(leadId))?.progresoJson as { completadas?: string[] } | null
      return (progreso?.completadas?.length ?? 0) >= 4
    },
    escrituraSola: async (leadId, setterId) => {
      await saveOwnedProgreso(leadId, setterId, {
        completadas: ['estructura', 'personalizacion', 'assets', 'cta'],
      })
    },
  },

  {
    clave: 'mc-escalar',
    titulo: 'Escalar «me trabé»',
    pantalla: 'mc1',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Escalar',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'mc1') }
    },
    alistar: async (page) => {
      await boton(page, 'Me trabé — avisar a Franco').click()
      // El modal se portalea fuera de `main`, así que acá el ámbito es la
      // página. El label «Qué intentaste» y el botón «Enviar aviso» existen una
      // sola vez y solo con el modal abierto — no hay con qué confundirlos.
      await firstVisible(
        page.locator(
          'xpath=//label[contains(normalize-space(.), "Qué intentaste")]/parent::div//*[self::input or self::textarea][1]',
        ),
      ).fill('Probé el shell pero no me cierra la sección de reseñas en mobile.')
    },
    actuar: async (page) => {
      await firstVisible(page.getByRole('button', { name: 'Enviar aviso' })).click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.escaladoAt !== null,
    escrituraSola: async (leadId, setterId) => {
      await marcarEscaladoOwned(leadId, setterId, 'Probé el shell y no me cierra el mobile.')
    },
  },

  {
    clave: 'm13-borrador',
    titulo: 'Guardar el link del borrador',
    pantalla: 'm13',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Borrador',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm13') }
    },
    alistar: async (page) => {
      await campo(page, 'URL del borrador').fill(DRAFT_URL)
      await interruptor(page, /Confirmo que abrí el link y carga/i).click()
    },
    actuar: async (page) => {
      await boton(page, 'Guardar borrador').click()
    },
    verificar: async (leadId) => Boolean((await dossierDe(leadId))?.draftUrl),
    escrituraSola: async (leadId, setterId) => {
      await saveOwnedDraftUrl(leadId, setterId, DRAFT_URL)
    },
  },

  {
    clave: 'm14-tilde',
    titulo: 'Tildar un chequeo',
    pantalla: 'm14',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Chequeo',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
        draftUrl: DRAFT_URL,
        selfCheckDurosOk: [],
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm14') }
    },
    actuar: async (page) => {
      await interruptor(page, PRIMER_HARD_CHECK).click()
    },
    verificar: async (leadId) => {
      const blob = (await dossierDe(leadId))?.selfCheckJson as
        | { itemsDuros?: { nombre: string; ok: boolean }[] }
        | null
      return Boolean(blob?.itemsDuros?.some((item) => item.ok))
    },
    escrituraSola: async (leadId, setterId) => {
      await saveOwnedSelfCheck(leadId, setterId, {
        itemsDuros: HARD_CHECKS.map((check, indice) => ({ nombre: check.nombre, ok: indice === 0 })),
        softFlags: [],
      })
    },
  },

  {
    clave: 'm14-enviar',
    titulo: 'Enviar a revisión',
    pantalla: 'm14',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Enviar',
        stage: 'CONSTRUCCION',
        status: 'RESPONDIO',
        draftUrl: DRAFT_URL,
        selfCheckDurosOk: HARD_CHECKS.map((check) => check.nombre),
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm14') }
    },
    actuar: async (page) => {
      await boton(page, 'Enviar a revisión').click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.stage === 'EN_REVISION',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedDossier(leadId, setterId)
      await transitionDossier(leadId, { to: 'EN_REVISION' })
    },
  },

  {
    clave: 'm15-envio',
    titulo: 'Registrar el envío de la demo',
    pantalla: 'm15',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Envio',
        stage: 'APROBADA',
        status: 'RESPONDIO',
        finalUrl: 'https://p28-final.develop.com.ar',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'm15') }
    },
    actuar: async (page) => {
      await boton(page, /Ya la envié — registrar/i).click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.enviadaAt !== null,
    escrituraSola: async (leadId, setterId) => {
      await getOwnedLead(leadId, setterId)
      await marcarDemoEnviadaOwned(leadId, setterId)
    },
  },

  {
    clave: 'mr-reabrir',
    titulo: 'Reabrir la construcción (re-loop)',
    pantalla: 'mr',
    sembrar: async (tracker, setterId) => {
      const lead = await createLead(tracker, {
        setterId,
        businessName: 'P28 Reabrir',
        stage: 'RECHAZADA',
        status: 'RESPONDIO',
      })
      return { leadId: lead.id, url: pantallaUrl(lead.id, 'mr') }
    },
    actuar: async (page) => {
      await boton(page, 'Reabrir construcción').click()
    },
    verificar: async (leadId) => (await dossierDe(leadId))?.stage === 'CONSTRUCCION',
    escrituraSola: async (leadId, setterId) => {
      await getOwnedDossier(leadId, setterId)
      await transitionDossier(leadId, { to: 'CONSTRUCCION' })
    },
  },
]

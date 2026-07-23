/**
 * Corrida M0 — SEMBRADOR de la galería de estados del Panel del Setter.
 *
 * Lleva la app a CADA estado enumerado en `docs/manual-usuario/galeria/INDICE.md`,
 * un lead por estado, todos owned por el setter de prueba (`setter-qa@develop.test`)
 * y namespaced con el prefijo `M0-GAL` — aislados de cualquier dato real.
 *
 * Idempotente: borra los leads del prefijo (solo los propios, por prefijo EXACTO
 * y assignedToId del setter de prueba) y los vuelve a sembrar. Re-correrlo
 * CONVERGE. Nada destructivo fuera del namespace; jamás `migrate reset`.
 *
 * REUSA los helpers de fixture de `tests/helpers/setter-db.ts` (factories de JSON
 * por contrato + `createLead` + `registerActivity`) en vez de escribir un
 * sembrador paralelo. Lo que a esos helpers les faltaba para la galería se sumó
 * ahí como campos opcionales (`exactName`, `progresoCompletadas`, `rechazosCount`,
 * `sinFinalUrl`, `draftUrl`, `nextFollowUpAt`), no acá.
 *
 * FLUJO REAL vs SEMBRADO DIRECTO — la distinción se registra en el INDICE:
 *   · Los toques de la cadencia son actividades REALES (`OsLeadActivity`), las
 *     mismas filas que escribe el motor al registrar un toque.
 *   · La oferta de horarios de m16 pasa por `guardarHorariosOfrecidosOwned`, el
 *     write-path EXACTO que la action `ofrecerHorarios` usa por dentro (mismo
 *     criterio que la suite 13-m16-memoria).
 *   · El resto de los estados se coloca por stage + blobs del dossier: SEMBRADO
 *     DIRECTO. Manejar 30 leads por la UI real sería impracticable para una
 *     galería reproducible, y cada combinación sembrada es una que el flujo real
 *     sí produce (no se fuerza ningún estado imposible).
 *
 * Uso: npx tsx scripts/dev/m0-galeria-seed.ts
 */
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

// Mismo guard que el resto de los seeds dev: solo contra la branch Neon dev.
const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(`ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*).`)
  process.exit(1)
}

/** Prefijo del namespace de la galería. Todo lo sembrado acá lo lleva. */
export const GAL_TAG = 'M0-GAL'

const DIA_MS = 24 * 60 * 60 * 1000

/** Los 3 horarios de la oferta de m16, tal como los devuelve Cal.com. */
const HORARIOS_OFRECIDOS = [
  '2026-09-01T14:00:00.000-03:00',
  '2026-09-02T16:30:00.000-03:00',
  '2026-09-03T11:00:00.000-03:00',
]

async function main() {
  const {
    prisma,
    getSetterQa,
    createLead,
    registerActivity,
    agendaAgendadaJson,
    newTracker,
  } = await import('../../tests/helpers/setter-db')
  const { guardarHorariosOfrecidosOwned } = await import('../../src/lib/leados/agenda')

  const setter = await getSetterQa()
  const setterId = setter.id

  // ── Limpieza idempotente: SOLO el namespace propio ────────────────────────
  const previos = await prisma.osLead.findMany({
    where: { businessName: { startsWith: `${GAL_TAG} ` }, assignedToId: setterId },
    select: { id: true },
  })
  if (previos.length > 0) {
    const ids = previos.map((l) => l.id)
    await prisma.osSetterNotice.deleteMany({ where: { leadId: { in: ids } } })
    await prisma.osLead.deleteMany({ where: { id: { in: ids } } })
    console.log(`Limpieza: ${ids.length} leads previos del namespace ${GAL_TAG} borrados.`)
  }

  // El tracker existe por contrato del helper; el teardown de la galería es el
  // barrido por prefijo de arriba (los leads tienen que SOBREVIVIR a la corrida).
  const tracker = newTracker()

  const vencido = new Date(Date.now() - DIA_MS)
  const futuro = new Date(Date.now() + 2 * DIA_MS)

  const sembrados: Array<{ estado: string; leadId: string; modo: 'flujo' | 'directo' }> = []

  /** Siembra un estado y lo anota. `nombre` = el del INDICE (NN-nombre). */
  const sembrar = async (
    nombre: string,
    opts: Parameters<typeof createLead>[1],
    modo: 'flujo' | 'directo' = 'directo',
  ) => {
    const lead = await createLead(tracker, {
      ...opts,
      setterId,
      exactName: `${GAL_TAG} ${nombre}`,
    })
    sembrados.push({ estado: nombre, leadId: lead.id, modo })
    return lead.id
  }

  // ── Tramo Ficha y Evaluación ──────────────────────────────────────────────
  await sembrar('01-m1-ficha-vacia', { setterId, stage: 'FICHA' })
  await sembrar('02-m1-ficha-cargada', { setterId, stage: 'FICHA' })
  await sembrar('03-m2-al-evaluador', { setterId, stage: 'FICHA' })
  await sembrar('04-m3-veredicto-registrar', { setterId, stage: 'FICHA' })
  await sembrar('05-m3-veredicto-descartado', { setterId, stage: 'DESCARTADA' })

  // 02/03/04 necesitan ficha CON señal (el gate de m2/m3). `createLead` solo la
  // pone en stages posteriores a FICHA → se completa acá, con la misma factory.
  const { fichaConSenal } = await import('../../tests/helpers/setter-db')
  for (const nombre of ['02-m1-ficha-cargada', '03-m2-al-evaluador', '04-m3-veredicto-registrar']) {
    const s = sembrados.find((x) => x.estado === nombre)!
    await prisma.osLeadDossier.update({
      where: { leadId: s.leadId },
      data: { fichaJson: fichaConSenal() },
    })
  }

  // ── Tramo Opener y Seguimiento ────────────────────────────────────────────
  await sembrar('06-m4-opener-pendiente', { setterId, stage: 'EVALUADA', status: 'PROSPECTO' })

  const openerEnviado = await sembrar(
    '07-m4-opener-enviado',
    { setterId, stage: 'EVALUADA', status: 'PROSPECTO', nextFollowUpAt: futuro },
    'flujo',
  )
  await registerActivity(openerEnviado, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')

  const esperaPostOpener = await sembrar(
    '08-espera-post-opener',
    { setterId, stage: 'EVALUADA', status: 'PROSPECTO', nextFollowUpAt: futuro },
    'flujo',
  )
  await registerActivity(esperaPostOpener, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')

  // Cadencia VIVA: 2 SIN_RESPUESTA (toquesHechos 1, próximo toque 2) + vencido.
  const toqueVencido = await sembrar(
    '09-m5-toque-vencido',
    { setterId, stage: 'EVALUADA', status: 'PROSPECTO', nextFollowUpAt: vencido },
    'flujo',
  )
  for (let i = 1; i <= 2; i++) {
    await registerActivity(toqueVencido, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, null)
  }

  // Cadencia AGOTADA: 4 SIN_RESPUESTA — el motor deja nextFollowUpAt en null.
  const agotada = await sembrar(
    '10-m5-cadencia-agotada',
    { setterId, stage: 'EVALUADA', status: 'PROSPECTO', nextFollowUpAt: null },
    'flujo',
  )
  for (let i = 1; i <= 4; i++) {
    await registerActivity(agotada, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, `toque ${i}`)
  }

  // «Lo último de la charla» poblado (5.1): toques con nota real.
  const charla = await sembrar(
    '11-m5-charla-poblada',
    { setterId, stage: 'EVALUADA', status: 'PROSPECTO', nextFollowUpAt: vencido },
    'flujo',
  )
  await registerActivity(charla, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'Mandé el opener, visto sin respuesta.')
  await registerActivity(
    charla,
    'WHATSAPP',
    'SIN_RESPUESTA',
    setterId,
    'Le escribí al WhatsApp del local. Contestó la empleada: el dueño viene a la tarde.',
  )

  // ── Tramo Brief ───────────────────────────────────────────────────────────
  await sembrar('12-m6-brief-abierto', { setterId, stage: 'EVALUADA', status: 'RESPONDIO' })
  await sembrar('13-m6-brief-guardado', { setterId, stage: 'BRIEF' })

  // ── Tramo Construcción ────────────────────────────────────────────────────
  await sembrar('14-m7-tilde-deshabilitado', { setterId, stage: 'BRIEF' })
  await sembrar('15-m7-estructura', { setterId, stage: 'CONSTRUCCION' })
  await sembrar('16-m8-personalizacion', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: ['estructura'],
  })
  await sembrar('17-m9-assets', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: ['estructura', 'personalizacion'],
  })
  await sembrar('18-m10-cta', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: ['estructura', 'personalizacion', 'assets'],
  })
  await sembrar('19-m11-calidad', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: ['estructura', 'personalizacion', 'assets', 'cta'],
  })
  await sembrar('20-m12-mobile-fases-hechas', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: ['estructura', 'personalizacion', 'assets', 'cta', 'calidad'],
  })

  // ── Borrador, Chequeo y Revisión ──────────────────────────────────────────
  const TODAS_LAS_FASES = ['estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile']
  await sembrar('21-m13-borrador-vacio', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: null,
  })
  await sembrar('22-m14-chequeo', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
  })
  await sembrar('23-revision-franco', { setterId, stage: 'EN_REVISION' })
  // 24 es un estado de INTERACCIÓN: el error lo provoca la captura enviando el
  // form. Lleva lead PROPIO igual —la captura tilda los 6 checks y mueve el
  // stage por detrás, y eso no puede ensuciar el lead del estado 22.
  await sembrar('24-error-chequeo', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
  })

  // ── Re-loop ───────────────────────────────────────────────────────────────
  await sembrar('25-mr-correccion-1', { setterId, stage: 'RECHAZADA', rechazosCount: 1 })
  await sembrar('26-mr-correccion-2', { setterId, stage: 'RECHAZADA', rechazosCount: 2 })

  // ── Envío ─────────────────────────────────────────────────────────────────
  await sembrar('27-m15-envio-abierto', { setterId, stage: 'APROBADA', status: 'RESPONDIO' })
  await sembrar('28-m15-espera-sin-respuesta', { setterId, stage: 'APROBADA', status: 'PROSPECTO' })
  await sembrar('29-m15-espera-sin-final-url', {
    setterId,
    stage: 'APROBADA',
    status: 'RESPONDIO',
    sinFinalUrl: true,
  })

  // ── Agenda ────────────────────────────────────────────────────────────────
  await sembrar('30-m16-virgen', {
    setterId,
    stage: 'APROBADA',
    status: 'RESPONDIO',
    enviada: true,
  })

  // FLUJO REAL: la oferta pasa por el write-path exacto de `ofrecerHorarios`.
  const ofrecidos = await sembrar(
    '31-m16-ofrecidos',
    { setterId, stage: 'APROBADA', status: 'RESPONDIO', enviada: true },
    'flujo',
  )
  const ok = await guardarHorariosOfrecidosOwned(ofrecidos, setterId, HORARIOS_OFRECIDOS)
  if (!ok) {
    console.error('ABORT: guardarHorariosOfrecidosOwned falló para 31-m16-ofrecidos.')
    process.exit(1)
  }

  const agendada = await sembrar('32-m16-agendada', {
    setterId,
    stage: 'APROBADA',
    status: 'CALL_AGENDADA',
    enviada: true,
  })
  await prisma.osLeadDossier.update({
    where: { leadId: agendada },
    data: { agendaJson: agendaAgendadaJson() },
  })

  const postEnvio = await sembrar(
    '33-m5-post-envio',
    {
      setterId,
      stage: 'APROBADA',
      status: 'RESPONDIO',
      enviada: true,
      nextFollowUpAt: vencido,
    },
    'flujo',
  )
  await registerActivity(postEnvio, 'WHATSAPP', 'SIN_RESPUESTA', setterId, 'Le mandé el link de la demo.')

  // ── Terminal ──────────────────────────────────────────────────────────────
  const perdido = await sembrar(
    '34-archivo-perdido',
    { setterId, stage: 'EVALUADA', status: 'PERDIDO', nextFollowUpAt: vencido },
    'flujo',
  )
  await registerActivity(perdido, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')

  await prisma.$disconnect()

  console.log(`\n${'='.repeat(84)}\nGalería M0 sembrada — ${sembrados.length} estados (owned por ${setter.email}):\n`)
  for (const s of sembrados) {
    console.log(`  ${s.estado.padEnd(32)} ${s.modo.padEnd(8)} ${s.leadId}`)
  }
  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

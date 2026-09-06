/**
 * Corrida M0/G — SEMBRADOR de la galería de estados del Panel del Setter.
 *
 * Lleva la app a CADA estado enumerado en `docs/manual-usuario/galeria/INDICE.md`,
 * un lead por estado, todos owned por un setter de prueba y namespaced con el
 * prefijo `M0-GAL` — aislados de cualquier dato real.
 *
 * Idempotente: borra lo del prefijo (leads por prefijo EXACTO de `businessName`
 * y owner conocido; setters dedicados por prefijo EXACTO de email) y lo vuelve a
 * sembrar. Re-correrlo CONVERGE. Nada destructivo fuera del namespace; jamás
 * `migrate reset`.
 *
 * REUSA los helpers de fixture de `tests/helpers/setter-db.ts` (factories de JSON
 * por contrato + `createLead` + `registerActivity`) en vez de escribir un
 * sembrador paralelo. Lo que a esos helpers les faltaba para la galería se sumó
 * ahí como campos opcionales (`exactName`, `progresoCompletadas`, `rechazosCount`,
 * `sinFinalUrl`, `draftUrl`, `nextFollowUpAt`, `selfCheckDurosOk`), no acá.
 *
 * ── Qué cambió en la corrida G (después de la poda) ──────────────────────────
 *   · RETIRADOS los cinco estados de las pantallas m8…m12: P6-B agrupó las seis
 *     fases del checklist en DOS pantallas (mc1 «Construir» = estructura +
 *     personalización + assets; mc2 «Refinar» = cta + calidad + mobile) y esos
 *     ids salieron del registro. Los estados 14…20 se reconvirtieron en su lugar
 *     a mc1/mc2 con progreso parcial y completo — la numeración NO se corrió,
 *     así el resto del índice queda estable.
 *   · AGREGADOS: el chequeo con tildes parciales y completos (22b/22c: P7 llevó
 *     los hard-checks de 6 a 10, en dos grupos), y cuatro panel-de-inicio (37…40)
 *     con el foco de P8 en sus situaciones distinguibles.
 *   · Los homes 37…40 cuelgan de SETTERS DEDICADOS, no del setter QA: el foco se
 *     deriva de la cartera ENTERA del setter, así que sobre `setter-qa` (44 leads
 *     de smoke viejo + los 36 de esta galería) no hay forma de fotografiar «el
 *     foco es construir» ni «no hay nada para trabajar». Un setter por situación
 *     es la única manera de que la foto muestre lo que su nombre dice.
 *
 * FLUJO REAL vs SEMBRADO DIRECTO — la distinción se registra en el INDICE:
 *   · Los toques de la cadencia son actividades REALES (`OsLeadActivity`), las
 *     mismas filas que escribe el motor al registrar un toque.
 *   · La oferta de horarios de m16 pasa por `guardarHorariosOfrecidosOwned`, el
 *     write-path EXACTO que la action `ofrecerHorarios` usa por dentro (mismo
 *     criterio que la suite 13-m16-memoria).
 *   · El resto de los estados se coloca por stage + blobs del dossier: SEMBRADO
 *     DIRECTO. Manejar 40 leads por la UI real sería impracticable para una
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

/** Prefijo de email de los setters dedicados a los estados del panel de inicio. */
export const GAL_SETTER_PREFIX = 'm0-gal-'

const DIA_MS = 24 * 60 * 60 * 1000

/** Los 3 horarios de la oferta de m16, tal como los devuelve Cal.com. */
const HORARIOS_OFRECIDOS = [
  '2026-09-01T14:00:00.000-03:00',
  '2026-09-02T16:30:00.000-03:00',
  '2026-09-03T11:00:00.000-03:00',
]

/**
 * Las fases del checklist que contiene cada pantalla de Construcción. Se importa
 * la tabla viva (`PANTALLA_DE_FASE`) en `main()` en vez de copiar el reparto:
 * si mañana una fase se muda de pantalla, el progreso sembrado la sigue sola.
 */
async function fasesDe(pantalla: 'mc1' | 'mc2'): Promise<string[]> {
  const { FASE_IDS } = await import('../../src/lib/leados/contracts')
  const { PANTALLA_DE_FASE } = await import('../../src/lib/leados/manual')
  return FASE_IDS.filter((fase) => PANTALLA_DE_FASE[fase] === pantalla)
}

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
  const { HARD_CHECKS } = await import('../../src/lib/leados/flow')

  const setter = await getSetterQa()
  const setterId = setter.id

  // Nombres de los hard-checks DERIVADOS de la lista viva, nunca copiados: P7 la
  // llevó de 6 a 10 y cualquier espejo hardcodeado habría quedado stale en
  // silencio (el `nombre` es la llave con la que el formulario re-encuentra un
  // tilde guardado, así que un espejo viejo siembra tildes que no matchean).
  const CHEQUEO_GRUPO_SETTER = HARD_CHECKS.filter((c) => c.grupo === 'setter').map((c) => c.nombre)
  const CHEQUEO_TODOS = HARD_CHECKS.map((c) => c.nombre)

  const MC1 = await fasesDe('mc1')
  const MC2 = await fasesDe('mc2')
  const TODAS_LAS_FASES = [...MC1, ...MC2]

  // ── Setters dedicados a los estados del panel de inicio ───────────────────
  const SETTERS_HOME = [
    { slug: 'foco-construir', nombre: `${GAL_TAG} home foco construir` },
    { slug: 'foco-espera-accion', nombre: `${GAL_TAG} home foco espera acción` },
    { slug: 'vacio', nombre: `${GAL_TAG} home vacío` },
    { slug: 'nada-para-trabajar', nombre: `${GAL_TAG} home nada para trabajar` },
  ] as const
  const emailDe = (slug: string) => `${GAL_SETTER_PREFIX}${slug}@develop.test`

  // ── Limpieza idempotente: SOLO el namespace propio ────────────────────────
  // Owners conocidos = el setter QA + los setters dedicados que hayan quedado de
  // una corrida anterior. El filtro sigue siendo prefijo EXACTO de businessName
  // AND owner conocido — nunca una heurística amplia sobre una DB compartida.
  const setteresDedicadosPrevios = await prisma.user.findMany({
    where: { email: { startsWith: GAL_SETTER_PREFIX } },
    select: { id: true },
  })
  const ownersConocidos = [setterId, ...setteresDedicadosPrevios.map((u) => u.id)]
  const previos = await prisma.osLead.findMany({
    where: {
      businessName: { startsWith: `${GAL_TAG} ` },
      assignedToId: { in: ownersConocidos },
    },
    select: { id: true },
  })
  if (previos.length > 0) {
    const ids = previos.map((l) => l.id)
    await prisma.osSetterNotice.deleteMany({ where: { leadId: { in: ids } } })
    await prisma.osLead.deleteMany({ where: { id: { in: ids } } })
    console.log(`Limpieza: ${ids.length} leads previos del namespace ${GAL_TAG} borrados.`)
  }
  if (setteresDedicadosPrevios.length > 0) {
    const ids = setteresDedicadosPrevios.map((u) => u.id)
    await prisma.osSetterNotice.deleteMany({ where: { setterId: { in: ids } } })
    await prisma.user.deleteMany({ where: { id: { in: ids } } })
    console.log(`Limpieza: ${ids.length} setters dedicados previos borrados.`)
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
      exactName: `${GAL_TAG} ${nombre}`,
    })
    sembrados.push({ estado: nombre, leadId: lead.id, modo })
    return lead.id
  }

  // ── Tramo Ficha y Evaluación ──────────────────────────────────────────────
  await sembrar('01-m1-ficha-vacia', { setterId, stage: 'FICHA' })
  await sembrar('02-m1-ficha-cargada', { setterId, stage: 'FICHA' })
  // D15-bis fusionó m2 dentro de m1 y mandó el descartado al archivo. El estado
  // 03 («ir al Evaluador») se retiró: sin viaje a la herramienta sembraba y
  // fotografiaba exactamente lo mismo que 02. 04 sigue siendo la variación real
  // —veredicto YA registrado (stage EVALUADA → m1 congelada y navegable)— y 05
  // pasó a fotografiar el archivo, que es donde aterriza un descartado.
  await sembrar('04-m1-veredicto-registrado', { setterId, stage: 'EVALUADA' })
  await sembrar('05-archivo-descartado', { setterId, stage: 'DESCARTADA' })

  // 02 necesita ficha CON señal (el gate del veredicto). `createLead` solo la
  // pone en stages posteriores a FICHA → se completa acá, con la misma factory.
  const { fichaConSenal } = await import('../../tests/helpers/setter-db')
  for (const nombre of ['02-m1-ficha-cargada']) {
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

  // ── Tramo Brief (m6 reconvertido en P5-B: «Decidí cómo va a ser la demo») ──
  await sembrar('12-m6-brief-abierto', { setterId, stage: 'EVALUADA', status: 'RESPONDIO' })
  await sembrar('13-m6-brief-guardado', { setterId, stage: 'BRIEF' })

  // ── Tramo Construcción (P6-B: dos pantallas, mc1 «Construir» / mc2 «Refinar») ─
  // El progreso persistido sigue siendo el checklist de SEIS fases; la pantalla
  // es presentación. Por eso «mc1 completa» = sus tres fases tildadas, no una.
  await sembrar('14-mc1-tilde-deshabilitado', { setterId, stage: 'BRIEF' })
  await sembrar('15-mc1-construir', { setterId, stage: 'CONSTRUCCION' })
  await sembrar('16-mc1-parcial', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: MC1.slice(0, 1),
  })
  await sembrar('17-mc1-completa', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: MC1,
  })
  await sembrar('18-mc2-refinar', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: MC1,
  })
  await sembrar('19-mc2-parcial', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: [...MC1, ...MC2.slice(0, 1)],
  })
  await sembrar('20-mc2-completa', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
  })

  // ── Borrador, Chequeo y Revisión ──────────────────────────────────────────
  await sembrar('21-m13-borrador-vacio', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: null,
  })
  // El chequeo en sus tres momentos (P7 lo llevó a 10 puntos en DOS grupos):
  // sin tildar / con el grupo del setter cerrado y el de Franco abierto / los
  // diez en verde, que es cuando el botón de mandar a revisión se destraba.
  await sembrar('22-m14-chequeo', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
  })
  await sembrar('22b-m14-chequeo-parcial', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
    selfCheckDurosOk: CHEQUEO_GRUPO_SETTER,
    selfCheckSoftFlags: ['Tiene más de 3 colores'],
  })
  await sembrar('22c-m14-chequeo-completo', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
    selfCheckDurosOk: CHEQUEO_TODOS,
  })
  await sembrar('23-revision-franco', { setterId, stage: 'EN_REVISION' })
  // 24 es un estado de INTERACCIÓN: el error lo provoca la captura enviando el
  // form. Lleva lead PROPIO igual —la captura tilda los duros y mueve el stage
  // por detrás, y eso no puede ensuciar el lead del estado 22.
  await sembrar('24-error-chequeo', {
    setterId,
    stage: 'CONSTRUCCION',
    progresoCompletadas: TODAS_LAS_FASES,
    draftUrl: 'https://m0-galeria-borrador.netlify.app',
  })

  // ── Re-loop (reentrada tras una demo rechazada) ───────────────────────────
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

  // ── Panel de inicio: el foco de P8 en sus situaciones distinguibles ────────
  // Un setter dedicado por situación (ver la cabecera): el foco se deriva de la
  // cartera entera, así que sobre el setter QA la foto sale de lo que haya.
  const setteresHome: Array<{ slug: string; id: string; email: string }> = []
  for (const s of SETTERS_HOME) {
    const email = emailDe(s.slug)
    const user = await prisma.user.create({
      data: { email, name: s.nombre, role: 'SETTER' },
      select: { id: true, email: true },
    })
    setteresHome.push({ slug: s.slug, id: user.id, email: user.email })
  }
  const idDe = (slug: string) => setteresHome.find((s) => s.slug === slug)!.id

  // 37 — el foco manda a CONSTRUIR (tier 0). Un lead en CONSTRUCCION alcanza; el
  // segundo, en FICHA, existe para que se vea el «próximo» y el contador.
  await sembrar('37-home-foco-construir', {
    setterId: idDe('foco-construir'),
    stage: 'CONSTRUCCION',
    progresoCompletadas: MC1,
  })
  await sembrar('37b-home-foco-construir-proximo', {
    setterId: idDe('foco-construir'),
    stage: 'FICHA',
  })

  // 38 — el foco es «te está esperando a vos» (tier 1): una demo que Franco
  // rechazó. Sin ningún lead de tier 0 en la cartera, si no ganaría construir.
  await sembrar('38-home-foco-espera-accion', {
    setterId: idDe('foco-espera-accion'),
    stage: 'RECHAZADA',
    rechazosCount: 1,
  })

  // 39 — cartera vacía: el setter recién creado no tiene un solo lead. (No se
  // siembra nada a propósito: ESE es el estado.)

  // 40 — hay cartera pero nada accionable: la cola `trabajar` queda en cero y el
  // home cae en «nada para trabajar ahora». EN_REVISION va a la cola `revision`.
  await sembrar('40-home-nada-para-trabajar', {
    setterId: idDe('nada-para-trabajar'),
    stage: 'EN_REVISION',
  })

  await prisma.$disconnect()

  console.log(
    `\n${'='.repeat(84)}\nGalería M0/G sembrada — ${sembrados.length} leads (${setter.email} + ${setteresHome.length} setters dedicados):\n`,
  )
  for (const s of sembrados) {
    console.log(`  ${s.estado.padEnd(34)} ${s.modo.padEnd(8)} ${s.leadId}`)
  }
  console.log('\nSetters dedicados al panel de inicio:')
  for (const s of setteresHome) {
    console.log(`  ${s.slug.padEnd(34)} ${s.email}`)
  }
  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

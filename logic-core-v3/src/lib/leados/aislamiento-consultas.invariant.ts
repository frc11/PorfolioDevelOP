/**
 * Censo congelado de TODA consulta sobre los modelos con dueño del setter, y de
 * cómo se aísla cada una. Corre sin DB.
 *
 *   npm run check:invariant:aislamiento
 *
 * ── Qué promete ──────────────────────────────────────────────────────────────
 * La regla 4 del brief: «Un setter no ve ni toca los negocios de otro, EN
 * NINGUNA CONSULTA». El énfasis está en «ninguna», y ésa es la mitad que los
 * otros invariantes de aislamiento no pueden cubrir.
 *
 * ── Por qué existe, además de los nueve ──────────────────────────────────────
 * P27 ató cada uno de los nueve invariantes de aislamiento a SU call-site: ahora
 * `setter-meta` mira el `where` de `listOwnedLeads`, `timeline` mira el gate de
 * `listOwnedLeadTimeline`, y así. Eso cierra la puerta «alguien reescribe ESTA
 * consulta a mano». Deja abierta la otra, que es la más probable: alguien
 * escribe una consulta NUEVA, en otra función, sin filtro. Ninguno de los nueve
 * la vería — no miran donde no está escrito que miren.
 *
 * Este censo mira TODO el eje del setter y falla en las dos direcciones:
 *   · una consulta NUEVA que no esté censada → rojo, y hay que clasificarla;
 *   · una consulta censada que DESAPARECIÓ  → rojo, y hay que sacarla del censo.
 * Fallar hacia los dos lados es lo mismo que `run-invariants.mjs` aprendió con
 * su piso: un guard que sólo mira para un lado se atrasa por construcción.
 *
 * ── Qué NO hace ──────────────────────────────────────────────────────────────
 * · No prueba que un `where` sea CORRECTO. Prueba que existe el mecanismo que la
 *   fila declara. La corrección de cada filtro la prueban los nueve, cada uno
 *   sobre el suyo, y las suites que operan la aplicación.
 * · No cubre `src/app/(protected)/admin/**`, `src/app/api/cron/**` ni
 *   `src/modules/chatbot/**`: son superficies de ALCANCE GLOBAL a propósito
 *   (`requireSuperAdmin()`, secreto de cron), no del eje del setter. El censo de
 *   P27 las recorrió una por una y quedó anotado en la bitácora; meterlas acá
 *   sería censar 47 filas cuyo aislamiento no es el que este archivo custodia.
 * · No es una barrera estructural. La barrera —que una consulta sin filtro no
 *   compile, como `src/lib/isolation/` le impone al Motor y al chatbot— exigiría
 *   reescribir las 99 llamadas de producción del eje. Está medido y anotado; no
 *   es este sprint.
 */
import assert from 'node:assert/strict'
import {
  archivosFuente,
  bloqueTopLevelDe,
  consultasPrismaEn,
  cuerpoDeFuncion,
  fuenteDe,
} from '../invariant-call-site.ts'

/** Los modelos cuyo dueño es un setter (directo o por el lead). */
const MODELOS = [
  'osLead',
  'osLeadSetterMeta',
  'osSetterNotice',
  'osLeadActivity',
  'osLeadDossier',
  'osDemo',
] as const

/**
 * Cómo se aísla una consulta. No son etiquetas decorativas: cada una tiene su
 * chequeo abajo, y elegir la equivocada pone el invariante en rojo.
 */
type Aislamiento =
  /** El `where` sale de un helper de `isolation.ts` — la fuente única. */
  | 'HELPER'
  /** Resuelve el dueño en su propio cuerpo (`getOwnedLead`/`getOwnedDossier`/…). */
  | 'GATE'
  /** Es agnóstica del dueño A PROPÓSITO: cada caller pone el gate. Ver CALLERS. */
  | 'GATE_EN_CALLER'
  /** Alcance global deliberado: sólo la alcanza un admin (`requireSuperAdmin`). */
  | 'ADMIN'
  /** Escritura ADDRESSED: el destinatario sale de la regla única de novedades. */
  | 'DESTINATARIO'
  /** Escritura direccionada por la unique (leadId, setterId): el dueño va en la llave. */
  | 'UNIQUE_COMPUESTA'
  /** Cruza el aislamiento de lectura a propósito, con su comentario y su límite. */
  | 'EXCEPCION_DECLARADA'

type Fila = readonly [archivo: string, funcion: string, consultas: string, como: Aislamiento]

/**
 * EL CENSO. Escrito a mano contra el árbol de P27. Una consulta nueva que no
 * esté acá pone esto en rojo, y el rojo pide una decisión: ¿por qué eje se
 * aísla? Que cueste un renglón es el punto.
 */
const CENSO: readonly Fila[] = [
  // ── agenda.ts — el tramo de agenda del dossier ──
  ['src/lib/leados/agenda.ts', 'marcarAgendandoOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/agenda.ts', 'revertirAgendandoOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/agenda.ts', 'guardarHorariosOfrecidosOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/agenda.ts', 'revertirAgendaConfirmadaOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/agenda.ts', 'guardarAgendaOwned', 'osLeadDossier.updateMany', 'GATE'],
  // El cierre de loop post-reunión: declarado «SOLO actions admin con requireSuperAdmin».
  ['src/lib/leados/agenda.ts', 'marcarReunionRealizadaAdmin', 'osLeadDossier.updateMany', 'ADMIN'],
  ['src/lib/leados/agenda.ts', 'guardarResultadoReunionAdmin', 'osLeadDossier.updateMany', 'ADMIN'],
  ['src/lib/leados/agenda.ts', 'leerAgendaAgendada', 'osLeadDossier.findUnique', 'ADMIN'],

  // ── assignment-trail.ts — el rastro de reasignación ──
  // La ESCRIBE el admin al reasignar; su aislamiento de lectura lo da el timeline.
  ['src/lib/leados/assignment-trail.ts', 'registrarReasignacion', 'osLeadActivity.create', 'ADMIN'],
  ['src/lib/leados/assignment-trail.ts', 'getUltimaAsignacion', 'osLeadActivity.findFirst', 'GATE'],

  // ── dossier.ts — la máquina del dossier ──
  ['src/lib/leados/dossier.ts', 'getOwnedDossier', 'osLeadDossier.findUnique', 'GATE'],
  ['src/lib/leados/dossier.ts', 'ensureOwnedDossier', 'osLeadDossier.upsert', 'GATE'],
  // Declarada agnóstica: «QUIÉN puede transicionar no se resuelve acá».
  [
    'src/lib/leados/dossier.ts',
    'transitionDossier',
    'osLeadDossier.findUnique osLeadDossier.updateMany',
    'GATE_EN_CALLER',
  ],
  ['src/lib/leados/dossier.ts', 'saveOwnedFicha', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'saveOwnedDraftUrl', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'marcarEscaladoOwned', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'saveOwnedSelfCheck', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'saveOwnedProgreso', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'marcarDemoEnviadaOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'revertirDemoEnviadaOwned', 'osLeadDossier.updateMany', 'GATE'],
  ['src/lib/leados/dossier.ts', 'saveOwnedBrief', 'osLeadDossier.findUnique osLeadDossier.updateMany', 'GATE'],

  // ── notify.ts — avisos a Franco, fire-and-forget. Lead-scoped: el gate ya
  //    corrió en la action del setter que las llama (ver CALLERS).
  ['src/lib/leados/notify.ts', 'notificarEscalamientoConstruccion', 'osLeadDossier.findUnique', 'GATE_EN_CALLER'],
  ['src/lib/leados/notify.ts', 'notificarReunionAgendada', 'osLeadDossier.findUnique', 'GATE_EN_CALLER'],
  [
    'src/lib/leados/notify.ts',
    'notificarEvaluacionScoreAlto',
    'osLeadDossier.findUnique osLeadDossier.update',
    'GATE_EN_CALLER',
  ],

  // ── novedades.ts — el feed dirigido (modelo ADDRESSED) ──
  ['src/lib/leados/novedades.ts', 'emitirNovedadSetter', 'osSetterNotice.create', 'DESTINATARIO'],
  ['src/lib/leados/novedades.ts', 'getNovedadesSetter', 'osSetterNotice.count osSetterNotice.findMany', 'HELPER'],
  ['src/lib/leados/novedades.ts', 'contarNovedadesSinLeer', 'osSetterNotice.count', 'HELPER'],
  ['src/lib/leados/novedades.ts', 'marcarNovedadesVistas', 'osSetterNotice.updateMany', 'HELPER'],

  // ── outreach / progreso / timeline / ownership — las lecturas del setter ──
  ['src/lib/leados/outreach.ts', 'listOwnedLeadActivities', 'osLeadActivity.findMany', 'HELPER'],
  ['src/lib/leados/outreach.ts', 'contarDmsHoy', 'osLeadActivity.count', 'HELPER'],
  ['src/lib/leados/ownership.ts', 'getOwnedLead', 'osLead.findFirst', 'HELPER'],
  ['src/lib/leados/ownership.ts', 'listOwnedLeads', 'osLead.findMany', 'HELPER'],
  ['src/lib/leados/progreso.ts', 'getProgresoSemana', 'osLeadActivity.count', 'HELPER'],
  ['src/lib/leados/timeline.ts', 'listOwnedLeadTimeline', 'osLeadActivity.findMany', 'HELPER'],

  // ── setter-carga.ts — la carga comparada de TODOS los setters, para Franco ──
  ['src/lib/leados/setter-carga.ts', 'cargarCargaSetters', 'osLead.groupBy osLeadDossier.findMany', 'ADMIN'],

  // ── setter-meta.ts — el meta privado; el dueño va en la llave ──
  ['src/lib/leados/setter-meta.ts', 'upsertSetterMeta', 'osLeadSetterMeta.upsert', 'UNIQUE_COMPUESTA'],

  // ── superficies del setter ──
  [
    'src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts',
    'importarProspectos',
    'osLead.create osLead.findMany',
    'HELPER',
  ],
  [
    'src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts',
    'nombresEnSistema',
    'osLead.findMany',
    'EXCEPCION_DECLARADA',
  ],
  ['src/app/(protected)/setter/_actions/prospecto.actions.ts', 'cargarProspecto', 'osLead.create', 'HELPER'],
  ['src/app/(protected)/setter/nuevo/page.tsx', 'NuevoProspectoPage', 'osLead.findMany', 'HELPER'],

  // ── os-commercial.ts — sin auth propia POR DISEÑO: «cada caller pone su guard» ──
  [
    'src/lib/os-commercial.ts',
    'registrarContactoComercial',
    'osLead.update osLeadActivity.create osLeadActivity.findMany',
    'GATE_EN_CALLER',
  ],
  ['src/lib/os-commercial.ts', 'crearDemoComercial', 'osDemo.create osLead.update', 'GATE_EN_CALLER'],
  ['src/lib/os-commercial.ts', 'postergarLead', 'osLead.update', 'GATE_EN_CALLER'],
]

/**
 * Los CALLERS de cada función `GATE_EN_CALLER` y `UNIQUE_COMPUESTA`, con el
 * mecanismo por el que cada uno resuelve el dueño. Congelado a mano.
 *
 * ── Por qué esta tabla es el corazón del censo ────────────────────────────────
 * `os-commercial.ts` escribe `osLead`/`osDemo`/`osLeadActivity` con `where: { id }`
 * puro, no recibe `userId`, y su invariante de ownership vive SÓLO en un
 * comentario de cabecera. El tipo no la fuerza. Un call-site nuevo del setter que
 * olvide `getOwnedLead` produce un IDOR de ESCRITURA sobre el lead de otro
 * setter: sin error de tipos, sin log, sin nada. Es el eslabón más débil que el
 * censo de P27 encontró, y esta tabla es lo que lo vigila — el descubrimiento de
 * abajo falla si aparece un caller que no está acá.
 */
type Mecanismo =
  /** Resuelve ownership en su propio cuerpo. */
  | 'GATE_PROPIO'
  /** Llama a un helper que resuelve ownership (y que el CENSO clasifica GATE). */
  | 'GATE_DELEGADO'
  /** Server action de admin: `requireSuperAdmin()` antes de tocar nada. */
  | 'ADMIN_ACTION'
  /** Página bajo `admin/`, gateada por `admin/layout.tsx` (rol SUPER_ADMIN). */
  | 'ADMIN_LAYOUT'

const CALLERS: readonly (readonly [
  llamada: string,
  archivo: string,
  funcion: string,
  como: Mecanismo,
  /** Para GATE_DELEGADO: la función intermedia que sí resuelve el dueño. */
  via: string,
])[] = [
  // transitionDossier — la única puerta del stage
  ['transitionDossier', 'src/app/(protected)/admin/leados/_actions/revision.actions.ts', 'aprobarRevision', 'ADMIN_ACTION', ''],
  ['transitionDossier', 'src/app/(protected)/admin/leados/_actions/revision.actions.ts', 'rechazarRevision', 'ADMIN_ACTION', ''],
  ['transitionDossier', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'registrarEvaluacion', 'GATE_PROPIO', ''],
  ['transitionDossier', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'guardarBrief', 'GATE_PROPIO', ''],
  ['transitionDossier', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'iniciarConstruccion', 'GATE_PROPIO', ''],
  ['transitionDossier', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'reabrirConstruccion', 'GATE_PROPIO', ''],
  ['transitionDossier', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'enviarARevision', 'GATE_PROPIO', ''],

  // os-commercial — el módulo sin guard propio
  ['registrarContactoComercial', 'src/app/(protected)/admin/leads/_actions/activity.actions.ts', 'createActivity', 'ADMIN_ACTION', ''],
  ['registrarContactoComercial', 'src/app/(protected)/setter/_actions/agenda.actions.ts', 'confirmarReunion', 'GATE_PROPIO', ''],
  ['registrarContactoComercial', 'src/app/(protected)/setter/_actions/outreach.actions.ts', 'registrarOpener', 'GATE_PROPIO', ''],
  ['registrarContactoComercial', 'src/app/(protected)/setter/_actions/outreach.actions.ts', 'registrarResultado', 'GATE_PROPIO', ''],
  ['crearDemoComercial', 'src/app/(protected)/admin/leads/_actions/demo.actions.ts', 'createDemo', 'ADMIN_ACTION', ''],
  ['crearDemoComercial', 'src/app/(protected)/setter/_actions/outreach.actions.ts', 'enviarDemoAprobada', 'GATE_PROPIO', ''],
  ['postergarLead', 'src/app/(protected)/setter/_actions/outreach.actions.ts', 'registrarResultado', 'GATE_PROPIO', ''],

  // notify — los avisos a Franco
  ['notificarEscalamientoConstruccion', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'escalarConstruccion', 'GATE_DELEGADO', 'marcarEscaladoOwned'],
  ['notificarReunionAgendada', 'src/app/(protected)/setter/_actions/agenda.actions.ts', 'confirmarReunion', 'GATE_PROPIO', ''],
  ['notificarEvaluacionScoreAlto', 'src/app/(protected)/setter/_actions/dossier.actions.ts', 'registrarEvaluacion', 'GATE_PROPIO', ''],

  // el rastro y la carga comparada — sólo admin
  ['registrarReasignacion', 'src/app/(protected)/admin/leads/_actions/lead.actions.ts', 'assignLeadSetter', 'ADMIN_ACTION', ''],
  ['cargarCargaSetters', 'src/app/(protected)/admin/leads/[leadId]/page.tsx', 'AgencyOsLeadDetailPage', 'ADMIN_LAYOUT', ''],
  ['marcarReunionRealizadaAdmin', 'src/app/(protected)/admin/leads/_actions/reunion.actions.ts', 'marcarReunionRealizada', 'ADMIN_ACTION', ''],
  ['guardarResultadoReunionAdmin', 'src/app/(protected)/admin/leads/_actions/reunion.actions.ts', 'registrarResultadoReunion', 'ADMIN_ACTION', ''],

  // upsertSetterMeta — la escritura del meta privado, por la unique compuesta.
  // Las cuatro delegan en `resolverLeadPropio`, que hace requireSetter + getOwnedLead.
  ['upsertSetterMeta', 'src/app/(protected)/setter/_actions/cartera.actions.ts', 'fijarLead', 'GATE_DELEGADO', 'resolverLeadPropio'],
  ['upsertSetterMeta', 'src/app/(protected)/setter/_actions/cartera.actions.ts', 'pausarLead', 'GATE_DELEGADO', 'resolverLeadPropio'],
  ['upsertSetterMeta', 'src/app/(protected)/setter/_actions/cartera.actions.ts', 'reanudarLead', 'GATE_DELEGADO', 'resolverLeadPropio'],
  ['upsertSetterMeta', 'src/app/(protected)/setter/_actions/cartera.actions.ts', 'guardarNota', 'GATE_DELEGADO', 'resolverLeadPropio'],
]

// ── El ámbito: el eje del setter ─────────────────────────────────────────────
const AMBITO = [
  ...archivosFuente('src', 'lib', 'leados'),
  ...archivosFuente('src', 'app', '(protected)', 'setter'),
  'src/lib/os-commercial.ts',
].filter((a) => !a.includes('.invariant.') && !a.includes('_experimental'))

assert.ok(
  AMBITO.length >= 100,
  `el barrido encontró ${AMBITO.length} archivos en el eje del setter — se esperaban ≥100. ` +
    'Si el árbol se movió, este censo está mirando donde ya no hay nada: un censo sobre cero ' +
    'archivos pasa en verde sobre cualquier fuga.',
)

// ── 1. LO QUE HAY ES EXACTAMENTE LO CENSADO (en las dos direcciones) ─────────
const encontradas = new Map<string, string>()
for (const archivo of AMBITO) {
  const porFuncion = new Map<string, Set<string>>()
  for (const c of consultasPrismaEn(archivo.split('/'), MODELOS)) {
    if (!porFuncion.has(c.funcion)) porFuncion.set(c.funcion, new Set())
    porFuncion.get(c.funcion)!.add(`${c.modelo}.${c.operacion}`)
  }
  for (const [funcion, ops] of porFuncion) {
    encontradas.set(`${archivo}::${funcion}`, [...ops].sort().join(' '))
  }
}

const censadas = new Map(CENSO.map((f) => [`${f[0]}::${f[1]}`, f[2]]))

for (const [clave, ops] of encontradas) {
  const censada = censadas.get(clave)
  assert.ok(
    censada !== undefined,
    `CONSULTA NUEVA SIN CENSAR: ${clave} → ${ops}\n` +
      '  Toca un modelo con dueño de setter y nadie declaró por qué eje se aísla. Los nueve\n' +
      '  invariantes de aislamiento NO la ven: cada uno mira su propio call-site, y éste no\n' +
      '  existía cuando se escribieron.\n' +
      '  Sumala a CENSO con su clase —HELPER, GATE, GATE_EN_CALLER, ADMIN, DESTINATARIO,\n' +
      '  UNIQUE_COMPUESTA o EXCEPCION_DECLARADA— en el MISMO commit. Elegir la clase es\n' +
      '  responder la única pregunta que importa: ¿quién puede alcanzar esta fila?',
  )
  assert.equal(
    ops,
    censada,
    `${clave} cambió sus consultas.\n  censadas:  ${censada}\n  ahora:     ${ops}\n` +
      '  Una operación nueva sobre el mismo modelo puede tener otro alcance que las censadas ' +
      '(un `findMany` donde había un `findUnique` deja de estar acotado por la llave). ' +
      'Actualizá el censo y confirmá que la clase sigue valiendo.',
  )
}

for (const clave of censadas.keys()) {
  assert.ok(
    encontradas.has(clave),
    `${clave} está censada y YA NO EXISTE.\n` +
      '  Un censo con filas muertas se atrasa en silencio: cada fila que sobra es una ' +
      'coincidencia menos que exigir, y llega el día en que el censo entero describe un ' +
      'árbol que no está. Sacala en el mismo commit que sacó la consulta.',
  )
}

assert.equal(
  encontradas.size,
  CENSO.length,
  `el censo tiene ${CENSO.length} filas y el árbol ${encontradas.size} funciones con consultas. ` +
    'El total se chequea aparte de las coincidencias una por una para que un cambio compensado ' +
    '(una función que se va y otra que entra) no pase.',
)

// ── 2. CADA FILA TIENE EL MECANISMO QUE DECLARA ─────────────────────────────
const HELPERS =
  /ownedLeadWhere\(|ownedListWhere\(|ownSetterMetaWhere\(|ownSetterNoticeWhere\(|timelineActivityWhere\(|dmsMandadosHoyWhere\(|SOLO_CONTACTOS_COMERCIALES|SOLO_DMS_MANDADOS|ownedLeadCreateData\(|construirAltasLote\(/
const GATES = /getOwnedLead\(|getOwnedDossier\(|ensureOwnedDossier\(|gateAgenda\(/

let conHelper = 0
let conGate = 0
for (const [archivo, funcion, , como] of CENSO) {
  const cuerpo = cuerpoDeFuncion(archivo.split('/'), funcion)
  const donde = `${archivo}::${funcion}`

  if (como === 'HELPER') {
    conHelper += 1
    assert.match(
      cuerpo,
      HELPERS,
      `${donde} está censada como HELPER y su cuerpo ya no llama a ningún helper de ` +
        '`isolation.ts`.\n' +
        '  O el `where` se reescribió a mano —y entonces hay una segunda copia de la regla de\n' +
        '  aislamiento, que es lo que `isolation.ts` existe para que no pase— o se perdió.\n' +
        '  Si la consulta pasó a aislarse por otro eje, cambiá su clase en el censo y decí cuál.',
    )
  } else if (como === 'GATE') {
    conGate += 1
    assert.match(
      cuerpo,
      GATES,
      `${donde} está censada como GATE y su cuerpo ya no resuelve el dueño.\n` +
        '  Estas funciones son las que llegan al dossier «por el lead propio»: sin\n' +
        '  `getOwnedLead`/`getOwnedDossier` escriben o leen por `leadId` pelado, y los ids de\n' +
        '  lead viajan al cliente. Es un IDOR, no un detalle de estilo.',
    )
  } else if (como === 'GATE_EN_CALLER') {
    assert.ok(
      CALLERS.some((c) => c[0] === funcion),
      `${donde} está censada como GATE_EN_CALLER y no tiene NINGÚN caller declarado en ` +
        'CALLERS. Delegar el gate sin decir en quién es no delegarlo: es no tenerlo.',
    )
  } else if (como === 'EXCEPCION_DECLARADA') {
    // Una excepción al aislamiento vale mientras esté DICHA. El comentario no es
    // decoración: es la única constancia de que alguien la decidió y hasta dónde.
    const fuente = fuenteDe(archivo)
    assert.ok(
      /EXCEPCIÓN DELIBERADA y ACOTADA/.test(fuente),
      `${donde} está censada como EXCEPCION_DECLARADA y su declaración desapareció de ` +
        `${archivo}.\n` +
        '  Una consulta que cruza el aislamiento de lectura sin el comentario que dice por qué\n' +
        '  y hasta dónde es, para el que la lea después, indistinguible de un descuido. Si la\n' +
        '  excepción sigue vigente, volvé a declararla; si no, ponele el filtro.',
    )
  }
}

assert.ok(
  conHelper >= 12 && conGate >= 14,
  `censo flaco: ${conHelper} filas HELPER y ${conGate} GATE — se esperaban ≥12 y ≥14. Si el ` +
    'grueso de las consultas dejó de declarar un mecanismo verificable, este invariante pasó a ' +
    'ser un inventario y no una red.',
)

// ── 3. LOS CALLERS DE LAS QUE DELEGAN EL GATE, UNO POR UNO ──────────────────
const ARCHIVOS_SRC = archivosFuente('src').filter(
  (a) => !a.includes('.invariant.') && !a.startsWith('src/lib/__'),
)

for (const [llamada, archivo, funcion, como, via] of CALLERS) {
  const cuerpo = cuerpoDeFuncion(archivo.split('/'), funcion)
  const donde = `${archivo}::${funcion} → ${llamada}()`

  assert.match(
    cuerpo,
    new RegExp(`(?<![\\w.])${llamada}\\s*\\(`),
    `${donde}: el caller declarado ya no llama a \`${llamada}\`. Si se movió, movelo también ` +
      'en CALLERS — un caller declarado que no llama deja de vigilar nada, y el que sí llama ' +
      'queda sin vigilar.',
  )

  if (como === 'GATE_PROPIO') {
    assert.match(
      cuerpo,
      GATES,
      `${donde}: PERDIÓ EL GATE DE OWNERSHIP.\n` +
        `  \`${llamada}\` es agnóstica del dueño a propósito: escribe/lee por id pelado y\n` +
        '  confía en que el caller ya resolvió de quién es el lead. Sin `getOwnedLead` /\n' +
        '  `getOwnedDossier` en este cuerpo, un leadId ajeno —los ids viajan al cliente—\n' +
        '  llega hasta Prisma. Es un IDOR de escritura sobre el lead de otro setter:\n' +
        '  sin error de tipos, sin log, sin síntoma.',
    )
  } else if (como === 'GATE_DELEGADO') {
    assert.match(
      cuerpo,
      new RegExp(`(?<![\\w.])${via}\\s*\\(`),
      `${donde}: dejó de pasar por \`${via}\`, que era quien le resolvía el dueño. O recupera ` +
        `ese camino, o resuelve el ownership acá y cambiá su mecanismo a GATE_PROPIO.`,
    )
    // Y el INTERMEDIARIO tiene que seguir resolviendo el dueño. Vive en el
    // propio archivo del caller (un helper local, como `resolverLeadPropio`) o
    // en el censo (una función `GATE`, como `marcarEscaladoOwned`). Este chequeo
    // es lo que impide que un gate COMPARTIDO se afloje y deje sin protección a
    // sus cuatro callers de una sola vez, sin que ninguno de ellos cambie.
    const censadoComoGate = CENSO.find((f) => f[1] === via)
    if (censadoComoGate) {
      assert.equal(
        censadoComoGate[3],
        'GATE',
        `${donde}: el intermediario \`${via}\` está censado como ${censadoComoGate[3]} y no ` +
          'como GATE. Si dejó de resolver el dueño, este caller —y todos los que deleguen en ' +
          'él— se quedaron sin gate.',
      )
    } else {
      assert.match(
        cuerpoDeFuncion(archivo.split('/'), via),
        GATES,
        `${donde}: el helper local \`${via}\` ya no resuelve ownership. Es el gate COMPARTIDO ` +
          'de las acciones de este archivo: cuando se afloja, todas se quedan sin él a la vez ' +
          'y ninguna cambia una línea. Por eso se vigila acá y no en cada caller.',
      )
    }
  } else if (como === 'ADMIN_ACTION') {
    assert.match(
      cuerpo,
      /requireSuperAdmin\(\)/,
      `${donde}: es una server action de admin y perdió \`requireSuperAdmin()\`.\n` +
        '  Los ids de server action de Next son invocables por CUALQUIER sesión: el gate del\n' +
        '  layout NO las cubre. Sin esta línea, un setter logueado alcanza una operación de\n' +
        '  alcance global sobre los leads de todo el equipo.',
    )
  } else if (como === 'ADMIN_LAYOUT') {
    assert.ok(
      archivo.includes('/admin/') && archivo.endsWith('page.tsx'),
      `${donde}: está declarado como gateado por \`admin/layout.tsx\` pero no es una página ` +
        'bajo `admin/`. El layout sólo cubre páginas de su árbol.',
    )
    const layout = fuenteDe('src', 'app', '(protected)', 'admin', 'layout.tsx')
    assert.match(
      layout,
      /session\.user\.role !== 'SUPER_ADMIN'[\s\S]{0,80}redirect\(/,
      'el gate de rol de `admin/layout.tsx` desapareció. Es el ÚNICO gate de las páginas de ' +
        'admin (no hay middleware.ts ni (protected)/layout.tsx en el repo): sin él, toda ' +
        'página de admin —con su alcance global sobre los leads— queda abierta a cualquier ' +
        'sesión con cuenta.',
    )
  }
}

// Descubrimiento: ningún caller NUEVO de las que delegan el gate.
const DELEGAN = [...new Set(CALLERS.map((c) => c[0]))]
const declarados = new Set(CALLERS.map((c) => `${c[0]}@${c[1]}::${c[2]}`))
let callSitesVistos = 0
for (const llamada of DELEGAN) {
  const patron = new RegExp(`(?<![\\w.])${llamada}\\s*\\(`, 'g')
  for (const archivo of ARCHIVOS_SRC) {
    const fuente = fuenteDe(archivo)
    if (!fuente.includes(llamada)) continue
    for (const m of fuente.matchAll(patron)) {
      const idx = m.index!
      const inicio = fuente.lastIndexOf('\n', idx) + 1
      const linea = fuente.slice(inicio, fuente.indexOf('\n', idx))
      // La propia declaración, los imports y las menciones en comentarios no son call-sites.
      if (/^\s*(\*|\/\/|import|export |async function|function )/.test(linea)) continue
      const bloque = bloqueTopLevelDe(fuente, idx)
      if (!bloque) continue
      callSitesVistos += 1
      assert.ok(
        declarados.has(`${llamada}@${archivo}::${bloque.nombre}`),
        `CALLER NUEVO SIN DECLARAR: ${archivo}::${bloque.nombre} llama a \`${llamada}()\`.\n` +
          `  \`${llamada}\` no resuelve el dueño: lo delega en quien la llama. Este call-site\n` +
          '  no está en CALLERS, así que NADIE está verificando que tenga el gate — y es\n' +
          '  exactamente la forma en que se abre un IDOR de escritura entre setters.\n' +
          '  Sumalo a CALLERS con su mecanismo (GATE_PROPIO / GATE_DELEGADO / ADMIN_ACTION /\n' +
          '  ADMIN_LAYOUT) en el mismo commit, y el chequeo de arriba lo va a verificar.',
      )
    }
  }
}

assert.ok(
  callSitesVistos >= CALLERS.length,
  `barrido flaco: ${callSitesVistos} call-sites vistos contra ${CALLERS.length} declarados. Si ` +
    'el descubrimiento dejó de encontrarlos, el guard de «caller nuevo» pasó a ser decorativo.',
)

console.log(
  `✓ invariante OK: las ${CENSO.length} funciones que consultan los ${MODELOS.length} modelos con ` +
    `dueño del setter son exactamente las censadas (${AMBITO.length} archivos barridos, ninguna ` +
    `nueva y ninguna muerta), cada una tiene el mecanismo de aislamiento que declara ` +
    `(${conHelper} por helper, ${conGate} con gate propio), y los ${CALLERS.length} callers de ` +
    'las que delegan el gate lo siguen teniendo — sin ningún call-site nuevo sin declarar.',
)

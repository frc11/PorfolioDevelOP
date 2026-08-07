/**
 * LeadOS Bloque 4 — Manual paso-por-pantalla: el REGISTRO de pantallas (el mapa
 * v1 como contrato) y la DERIVACIÓN de posición a granularidad de pantalla.
 *
 * Hermano de `flow.ts`: acá NO hay gates nuevos ni transiciones — solo se LEE
 * stage + datos capturados + checklist y se deriva presentación (qué pantalla
 * es la actual, cuáles quedaron completadas, cuáles se pueden trabajar). La
 * posición NUNCA se persiste: se re-deriva en cada request, así jamás se
 * desincroniza del dossier (mismo principio que `pasoActual` del rail del
 * wizard, extendido de 5 pasos a las pantallas del mapa).
 *
 * Reglas de navegación del mapa que esta derivación garantiza:
 *   - atrás siempre libre a pantallas completadas;
 *   - el futuro no se renderiza (pedir una pantalla no habilitada → la actual);
 *   - las 6 fases de Construcción son AUTO-REPORTE con navegación libre entre
 *     ellas — jamás gates (§6-3 del brief; `progreso-isolation.invariant.ts`).
 *     P6-B las agrupó en DOS pantallas (mc1/mc2) sin tocar la lista de fases:
 *     lo persistido sigue siendo el checklist de 6, la pantalla es presentación.
 *
 * Imports relativos a propósito (patrón de flow.ts): el módulo queda importable
 * por un harness ts-node sin tsconfig-paths si algún día suma invariante.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
import type { Agenda, Ficha, Progreso } from './contracts.ts'
import { FASE_IDS, type FaseId } from './contracts.ts'
import {
  cadenciaInfo,
  fichaTieneSenal,
  gateBriefAbierto,
  gateEnvioDemo,
  reunionAgendada,
} from './flow.ts'
import { derivarPasoDelLead } from './paso.ts'

// ── El registro de pantallas (mapa v1) ───────────────────────────────────────

/**
 * Ids de pantalla del mapa: m1…m16 (manual, sin m3 — P4 fusionó el registro del
 * veredicto dentro de m2; sin m7…m12 — P6-B agrupó las seis fases en mc1/mc2) +
 * mr (reentrada re-loop) + los estados de espera. El `[paso]` de la URL es uno
 * de estos — cualquier otra cosa redirige a la actual (así el `m3` de un
 * bookmark viejo, o un `m9` de la galería, aterrizan solos en la pantalla
 * vigente: la posición se re-deriva, nunca se guarda).
 */
export const PANTALLA_IDS = [
  'm1',
  'm2',
  'm4',
  'm5',
  'm6',
  'mc1',
  'mc2',
  'm13',
  'm14',
  'm15',
  'm16',
  'mr',
  'espera',
  'revision',
  'archivo',
] as const

export type PantallaId = (typeof PANTALLA_IDS)[number]

export function esPantallaId(valor: string): valor is PantallaId {
  return (PANTALLA_IDS as readonly string[]).includes(valor)
}

/**
 * `manual` = tarea atómica del manual (cuenta para "paso N de M" de su fase);
 * `reentrada` = aterrizaje del re-loop (pertenece a Construcción, sin índice);
 * `estado` = pantalla de espera (no es pantalla del manual: sin checklist,
 * sin indicador).
 */
export type PantallaTipo = 'manual' | 'reentrada' | 'estado'

export type FaseManualId =
  | 'ficha'
  | 'evaluacion'
  | 'opener'
  | 'seguimiento'
  | 'brief'
  | 'construccion'
  | 'borrador'
  | 'chequeo'
  | 'envio'
  | 'agenda'

export type PantallaDef = {
  id: PantallaId
  tipo: PantallaTipo
  /** Fase del indicador "paso N de M". null solo en estados (no tienen fase). */
  fase: FaseManualId | null
  /** La instrucción corta de la pantalla (una línea, contrato del mapa). */
  titulo: string
  /** Bajada de una línea — de qué va la tarea. */
  detalle: string
  /** Etiqueta corta para chips de navegación. */
  corto: string
}

/**
 * Las pantallas de Construcción, en orden de presentación (el rail de fases y
 * el indicador "paso N de M" cuentan sobre esta lista). Es la lista de
 * PRESENTACIÓN: el mapeo fase→pantalla vive en `PANTALLA_DE_FASE`, y el
 * invariante `check:invariant:pantallas` ata las dos.
 */
export const PANTALLAS_CONSTRUCCION = ['mc1', 'mc2'] as const satisfies readonly PantallaId[]

export type PantallaConstruccionId = (typeof PANTALLAS_CONSTRUCCION)[number]

/**
 * Tabla EXPLÍCITA fase del checklist → pantalla que la contiene.
 *
 * `Record<FaseId, …>` es la RED que el acoplamiento posicional anterior no
 * daba. Antes esto era `PANTALLAS_CONSTRUCCION[FASE_IDS.indexOf(fase)]`:
 * indexar una tupla con un `number` —sin `noUncheckedIndexedAccess` en el
 * tsconfig— devuelve la unión de los tipos de sus elementos, así que desalinear
 * las dos listas COMPILABA EN VERDE y devolvía `undefined` en runtime, tipado
 * como `PantallaId`. La consecuencia era muda y cara: fases que dejan de
 * marcarse como completadas, `actual = undefined`, y `/manual/undefined` en
 * loop de redirects. Con la tabla, una fase sin entrada NO COMPILA.
 *
 * La dirección que el tipo NO cubre —una pantalla del registro que ninguna fase
 * mapea, que renderizaría con los tres slots vacíos— la cubre el invariante.
 *
 * N:1 a propósito: varias fases pueden compartir pantalla (P6-B agrupó las seis
 * fases en dos pantallas). La lista de fases (`FASE_IDS`, llave del progreso
 * persistido) NO se toca al reagrupar: sólo cambian los valores de esta tabla.
 */
export const PANTALLA_DE_FASE = {
  // Se hacen con el BRIEF a la vista, contra una demo que todavía no existe.
  estructura: 'mc1',
  personalizacion: 'mc1',
  assets: 'mc1',
  // Se hacen con la DEMO ya en pantalla: verificar y pulir.
  cta: 'mc2',
  calidad: 'mc2',
  mobile: 'mc2',
} as const satisfies Record<FaseId, PantallaConstruccionId>

/** Pantalla del manual que contiene una fase del checklist. */
export function pantallaDeFaseConstruccion(fase: FaseId): PantallaConstruccionId {
  return PANTALLA_DE_FASE[fase]
}

/**
 * Las fases del checklist que contiene una pantalla de Construcción — inversa
 * de la tabla, en el orden de `FASE_IDS`. `[]` para cualquier otra pantalla
 * (incluida la reentrada `mr`, que pertenece a la fase 'construccion' del
 * indicador pero NO es una pantalla del checklist). El árbol de slots de la
 * página despacha por esto: lista vacía = no es pantalla de Construcción.
 */
export function fasesDePantallaConstruccion(id: PantallaId): readonly FaseId[] {
  return FASE_IDS.filter((fase) => PANTALLA_DE_FASE[fase] === id)
}

export const PANTALLAS: Record<PantallaId, PantallaDef> = {
  m1: {
    id: 'm1',
    tipo: 'manual',
    fase: 'ficha',
    titulo: 'Cargá los datos del negocio',
    detalle: 'Completá la ficha de observación — es la materia prima del Evaluador.',
    corto: 'Ficha',
  },
  m2: {
    id: 'm2',
    tipo: 'manual',
    fase: 'evaluacion',
    titulo: 'Llevá la ficha a evaluar y registrá el veredicto',
    detalle:
      'Copiá el bloque, pasalo por el chat de evaluación y transcribí acá lo que te devolvió: score, veredicto y razonamiento.',
    corto: 'Evaluación',
  },
  m4: {
    id: 'm4',
    tipo: 'manual',
    fase: 'opener',
    titulo: 'Mandá el opener',
    detalle: 'El primer mensaje sale SIN link — registrá acá que lo mandaste.',
    corto: 'Opener',
  },
  m5: {
    id: 'm5',
    tipo: 'manual',
    fase: 'seguimiento',
    titulo: 'Registrá lo que pasó',
    detalle: 'Cada toque de la cadencia se registra al hacerse — la fecha del próximo la pone la maquinaria.',
    corto: 'Toque',
  },
  // P5-B — «Armá el brief» nombraba el ARTEFACTO, y con palabra de agencia. Lo
  // que el setter hace acá es decidir cómo va a ser la demo antes de existir:
  // qué secciones lleva, qué cuenta y a qué invita. Mismo registro que dejó el
  // colapso de la construcción (mc1/mc2): verbo en voseo + la demo como objeto.
  m6: {
    id: 'm6',
    tipo: 'manual',
    fase: 'brief',
    titulo: 'Decidí cómo va a ser la demo',
    detalle:
      'Antes de construirla: qué secciones lleva, qué cuenta y a qué invita. El Gem de diseño te lo propone y vos lo cerrás acá.',
    corto: 'Brief',
  },
  // P6-B — las seis fases agrupadas en dos pantallas. El corte NO es por orden
  // del array (4+2) sino por el criterio que el repo ya tenía codificado:
  // ¿esto se hace mirando el brief, o mirando la demo ya construida? Las tres
  // primeras son lead-específicas y no tienen prompt (`FASE_PROMPTS`); las tres
  // últimas se verifican y pulen sobre algo que ya existe.
  mc1: {
    id: 'mc1',
    tipo: 'manual',
    fase: 'construccion',
    titulo: 'Construí la demo en Claude Design',
    detalle: 'Con el brief y los materiales del negocio a la vista, armá la demo.',
    corto: 'Construir',
  },
  mc2: {
    id: 'mc2',
    tipo: 'manual',
    fase: 'construccion',
    titulo: 'Refiná la demo antes de publicarla',
    detalle: 'Con la demo ya en pantalla: verificá lo que hiciste y pulí el detalle.',
    corto: 'Refinar',
  },
  m13: {
    id: 'm13',
    tipo: 'manual',
    fase: 'borrador',
    titulo: 'Publicá y registrá el link del borrador',
    detalle: 'Subí la demo a Netlify Drop y guardá el link del borrador — se valida que sea un link real.',
    corto: 'Borrador',
  },
  m14: {
    id: 'm14',
    tipo: 'manual',
    fase: 'chequeo',
    titulo: 'Pasá los checks duros',
    detalle: 'Con el link del borrador a la vista, verificá los obligatorios y mandá la demo a revisión.',
    corto: 'Chequeo final',
  },
  m15: {
    id: 'm15',
    tipo: 'manual',
    fase: 'envio',
    titulo: 'Mandá el link al negocio',
    detalle: 'Se habilita solo con la demo aprobada y el negocio respondiendo — se destraba solo, sin que tengas que hacer nada.',
    corto: 'Envío',
  },
  m16: {
    id: 'm16',
    tipo: 'manual',
    fase: 'agenda',
    titulo: 'Agendá la reunión',
    detalle: 'Cuando la conversación llega a «sí, reunámonos», ofrecé horarios reales y agendá.',
    corto: 'Agenda',
  },
  mr: {
    id: 'mr',
    tipo: 'reentrada',
    fase: 'construccion',
    titulo: 'Aplicá las correcciones de Franco',
    detalle: 'La nota del rechazo al frente — checklist y borrador quedan como estaban; el chequeo final se resetea.',
    corto: 'Correcciones',
  },
  espera: {
    id: 'espera',
    tipo: 'estado',
    fase: null,
    titulo: 'Esperando respuesta',
    detalle: 'La pelota la tiene el negocio — no hay nada del manual para hacer ahora.',
    corto: 'Espera',
  },
  revision: {
    id: 'revision',
    tipo: 'estado',
    fase: null,
    titulo: 'Franco está revisando tu demo',
    detalle: 'No hay nada que hacer ahora — te avisamos cuando la apruebe o pida cambios.',
    corto: 'Revisión',
  },
  archivo: {
    id: 'archivo',
    tipo: 'estado',
    fase: null,
    titulo: 'Este negocio quedó cerrado',
    detalle: 'Se cerró sin avanzar — no hay nada que hacer acá. Seguí con el próximo.',
    corto: 'Archivo',
  },
}

export const FASES_MANUAL: Record<
  FaseManualId,
  { titulo: string; pantallas: readonly PantallaId[] }
> = {
  ficha: { titulo: 'Ficha', pantallas: ['m1'] },
  evaluacion: { titulo: 'Evaluación', pantallas: ['m2'] },
  opener: { titulo: 'Opener', pantallas: ['m4'] },
  seguimiento: { titulo: 'Seguimiento', pantallas: ['m5'] },
  brief: { titulo: 'Brief', pantallas: ['m6'] },
  construccion: { titulo: 'Construcción', pantallas: PANTALLAS_CONSTRUCCION },
  borrador: { titulo: 'Borrador', pantallas: ['m13'] },
  chequeo: { titulo: 'Chequeo final', pantallas: ['m14'] },
  envio: { titulo: 'Envío', pantallas: ['m15'] },
  agenda: { titulo: 'Agenda', pantallas: ['m16'] },
}

/**
 * Indicador "paso N de M" POR FASE (contrato del mapa: nunca global). Estados y
 * reentrada no llevan indicador → null.
 */
export function indicadorDeFase(
  id: PantallaId,
): { fase: string; n: number; m: number } | null {
  const def = PANTALLAS[id]
  if (def.tipo !== 'manual' || def.fase === null) return null
  const fase = FASES_MANUAL[def.fase]
  const n = fase.pantallas.indexOf(id) + 1
  if (n === 0) return null
  return { fase: fase.titulo, n, m: fase.pantallas.length }
}

/** Ruta canónica de una pantalla del manual (ruta paralela al wizard). */
export function rutaManual(leadId: string, paso: PantallaId): string {
  return `/setter/leads/${leadId}/manual/${paso}`
}

// ── Derivación de posición ───────────────────────────────────────────────────

/**
 * Lo que la derivación LEE — todo sale de los caminos owned existentes (misma
 * materia prima que arma `WizardData` en la página del wizard). Nada de esto
 * lo escribe el manual.
 */
export type DerivacionManualInput = {
  stage: DossierStage | null
  status: LeadStatus
  /** Campo crudo que marca Franco — mismo criterio que el gate del wizard. */
  caliente: boolean
  ficha: Ficha | null
  draftUrl: string | null
  /** Checklist de Construcción (auto-reporte, jamás gate). */
  progreso: Progreso
  agenda: Agenda | null
  /** Contactos comerciales registrados (opener incluido). */
  contactos: number
  /** Conteo SIN_RESPUESTA (opener incluido) — alimenta `cadenciaInfo`. */
  followUpCount: number
  /** El toque agendado ya venció (nextFollowUpAt <= ahora) — reloj del caller. */
  followUpVencido: boolean
  /** URL permanente que registra el admin al aprobar (gate del envío). */
  finalUrl: string | null
  /** La demo aprobada ya se envió (dossier.enviadaAt). */
  demoEnviada: boolean
}

/**
 * Posición derivada. `actual` = dónde aterriza el setter; `completadas` = lo
 * hecho, navegable sin resetear nada; `habilitadas` = donde puede trabajar
 * AHORA. Una pantalla puede estar en ambas listas (m5 es por-toque: repetible).
 * Todo lo que no esté en ninguna es futuro: no se renderiza, redirige a la
 * actual. Invariante: `actual` siempre es accesible (∈ completadas ∪
 * habilitadas) — sin eso, la guardia del server entraría en loop de redirects.
 */
export type PosicionManual = {
  actual: PantallaId
  completadas: PantallaId[]
  habilitadas: PantallaId[]
}

/** Orden canónico del manual — `completadas` se devuelve siempre en este orden. */
const ORDEN_MANUAL = [
  'm1',
  'm2',
  'm4',
  'm5',
  'm6',
  'mc1',
  'mc2',
  'm13',
  'm14',
  'm15',
  'm16',
] as const satisfies readonly PantallaId[]

/** Stages donde la evaluación quedó registrada (m1–m2 atrás). */
const STAGES_POST_EVALUACION: readonly DossierStage[] = [
  'EVALUADA',
  'DESCARTADA',
  'BRIEF',
  'CONSTRUCCION',
  'RECHAZADA',
  'EN_REVISION',
  'APROBADA',
]

/** Stages donde el brief quedó guardado (m6 atrás; conversación pre-brief cerrada). */
const STAGES_POST_BRIEF: readonly DossierStage[] = [
  'BRIEF',
  'CONSTRUCCION',
  'RECHAZADA',
  'EN_REVISION',
  'APROBADA',
]

/**
 * Stages donde el chequeo final quedó mandado (m14 atrás). RECHAZADA queda
 * FUERA a propósito: el re-loop resetea el self-check (motor `RELOOP_RESET`),
 * así que m14 vuelve a ser futuro hasta re-pasarlo.
 */
const STAGES_POST_CHEQUEO: readonly DossierStage[] = ['EN_REVISION', 'APROBADA']

/**
 * Pantallas completadas, re-derivadas de stage + datos capturados + checklist.
 * Cada marca sale de un dato persistido por el motor (nunca de posición
 * guardada): el stage prueba los hitos, los blobs prueban las capturas.
 */
function completadasDe(input: DerivacionManualInput): PantallaId[] {
  const done = new Set<PantallaId>()
  const { stage } = input

  if (stage !== null && STAGES_POST_EVALUACION.includes(stage)) {
    done.add('m1')
    done.add('m2')
  } else if (fichaTieneSenal(input.ficha)) {
    // Todavía en FICHA pero con señal mínima: la ficha ya cumplió su gate.
    done.add('m1')
  }

  if (input.contactos > 0) done.add('m4')

  // m5 cierra cuando hubo toques Y la conversación pre-brief quedó atrás. En
  // EVALUADA sigue "en curso" (habilitada, no completada); en APROBADA vuelve a
  // habilitarse por los toques post-envío (repetible), aunque figure completada.
  const { toquesHechos } = cadenciaInfo(input.followUpCount)
  if (toquesHechos > 0 && stage !== null && STAGES_POST_BRIEF.includes(stage)) {
    done.add('m5')
  }

  if (stage !== null && STAGES_POST_BRIEF.includes(stage)) done.add('m6')

  // P6-B — con las fases agrupadas N:1, una pantalla de Construcción se marca
  // completada SÓLO cuando TODAS sus fases lo están: si bastara una, «Construir»
  // figuraría hecha con un tercio del trabajo. La unidad persistida sigue siendo
  // la fase (`progresoJson.completadas`), no la pantalla.
  for (const pantalla of PANTALLAS_CONSTRUCCION) {
    const fases = fasesDePantallaConstruccion(pantalla)
    const todas = fases.every((fase) => input.progreso.completadas.includes(fase))
    if (fases.length > 0 && todas) done.add(pantalla)
  }

  if (input.draftUrl) done.add('m13')
  if (stage !== null && STAGES_POST_CHEQUEO.includes(stage)) done.add('m14')
  if (input.demoEnviada) done.add('m15')

  const agendada =
    reunionAgendada(input.agenda) ||
    input.status === 'CALL_AGENDADA' ||
    input.status === 'CERRADO'
  if (agendada) done.add('m16')

  return ORDEN_MANUAL.filter((id) => done.has(id))
}

/**
 * Actual + habilitadas por stage. Espeja el mapeo de `pasoActual` (rail del
 * wizard) llevado a granularidad de pantalla — misma fuente de verdad (stage).
 *
 * EVALUADA (5.0): lee la rama abierto/espera/opener directo de
 * `derivarPasoDelLead` (A-29) en vez de re-derivar `gateBriefAbierto` y el
 * proxy de `openerPendiente` a mano — mismo cálculo que arma el cartel del
 * wizard, así el manual y el wizard NUNCA pueden desincronizarse sobre "¿está
 * abierto el brief?". APROBADA sigue llamando a `gateEnvioDemo` directo a
 * propósito: exige `finalUrl` (la URL que registra el admin al aprobar), un
 * factor que `derivarPasoDelLead` no recibe — leerlo del `gateAbierto`
 * genérico cambiaría el comportamiento en el borde finalUrl=null, así que esa
 * rama no se toca. Exhaustivo por stage: un stage nuevo rompe el build hasta
 * contemplarse acá (mismo candado que el wizard).
 */
function posicionDe(
  input: DerivacionManualInput,
): { actual: PantallaId; habilitadas: PantallaId[] } {
  const { stage } = input
  // 2.3 (B-02): terminal por STATUS (PERDIDO — el cierre lo decide Franco desde
  // admin, jamás se automatiza) → archivo read-only, ANTES de derivar por stage.
  // Un negocio muerto no invita a trabajar: sin esta rama, un PERDIDO en EVALUADA
  // (o cualquier stage vivo) caería en m5/espera pidiendo contactar un negocio
  // que ya no está. DESCARTADA (terminal por STAGE) mantiene su case (m2, el
  // veredicto a la vista). El never-guard del switch queda intacto: sólo se
  // saltea la derivación por stage para este status, la exhaustividad sigue.
  if (input.status === 'PERDIDO') {
    return { actual: 'archivo', habilitadas: [] }
  }
  const gateAbierto = gateBriefAbierto(input.status, input.caliente)
  const openerPendiente = stage === 'EVALUADA' && !gateAbierto && input.contactos === 0
  const paso = derivarPasoDelLead(stage, gateAbierto, openerPendiente)
  switch (stage) {
    case null:
    case 'FICHA': {
      // La evaluación ocurre con stage=FICHA: registrar el veredicto ES la
      // transición. Sin señal mínima, m2 es futuro (gate de la ficha).
      if (!fichaTieneSenal(input.ficha)) {
        return { actual: 'm1', habilitadas: ['m1'] }
      }
      // P4: el viaje a la herramienta y la vuelta con el resultado son UNA
      // pantalla — no hace falta habilitar un destino aparte para la vuelta (no
      // había dato que persistiera "ya fui a evaluar": la posición no se guarda).
      return { actual: 'm2', habilitadas: ['m2'] }
    }
    case 'DESCARTADA':
      // Terminal del archivo: el manual muestra el veredicto registrado; no
      // hay pantallas por delante. Con la fusión de P4 el veredicto vive en m2.
      return { actual: 'm2', habilitadas: [] }
    case 'EVALUADA': {
      if (paso.anchor === 'opener') {
        return { actual: 'm4', habilitadas: ['m4'] }
      }
      if (paso.foco.tono === 'foco') {
        return { actual: 'm6', habilitadas: ['m6'] }
      }
      // anchor === 'brief' con tono 'espera': gate cerrado y opener ya
      // mandado. Toque vencido o cadencia agotada (estructura de cierre) →
      // m5. Si no, estado de espera con m5 alcanzable: una respuesta puede
      // llegar antes del toque y hay que poder registrarla.
      const cadencia = cadenciaInfo(input.followUpCount)
      const toqueAhora = input.followUpVencido || cadencia.agotada
      return toqueAhora
        ? { actual: 'm5', habilitadas: ['m5'] }
        : { actual: 'espera', habilitadas: ['espera', 'm5'] }
    }
    case 'BRIEF':
    case 'CONSTRUCCION': {
      // Navegación LIBRE entre las 6 fases SIEMPRE — son auto-reporte, jamás
      // gates (§6-3). El borrador y el chequeo sí tienen condición real: el
      // draft se registra recién en CONSTRUCCION (gate server-side existente)
      // y el chequeo necesita el draft publicado.
      const enConstruccion = stage === 'CONSTRUCCION'
      const habilitadas: PantallaId[] = [...PANTALLAS_CONSTRUCCION]
      if (enConstruccion && !input.draftUrl) habilitadas.push('m13')
      if (enConstruccion && input.draftUrl) habilitadas.push('m14')
      const primeraFase = FASE_IDS.find(
        (fase) => !input.progreso.completadas.includes(fase),
      )
      const actual: PantallaId = primeraFase
        ? pantallaDeFaseConstruccion(primeraFase)
        : enConstruccion
          ? input.draftUrl
            ? 'm14'
            : 'm13'
          : PANTALLAS_CONSTRUCCION[0]
      return { actual, habilitadas }
    }
    case 'RECHAZADA':
      // Reentrada del re-loop: aterrizaje en M-R con la nota de Franco al
      // frente. Checklist y borrador preservados (navegables); el chequeo
      // final quedó reseteado → m14 es futuro hasta reabrir la construcción.
      return { actual: 'mr', habilitadas: ['mr', ...PANTALLAS_CONSTRUCCION] }
    case 'EN_REVISION':
      return { actual: 'revision', habilitadas: ['revision'] }
    case 'APROBADA': {
      const agendada =
        reunionAgendada(input.agenda) ||
        input.status === 'CALL_AGENDADA' ||
        input.status === 'CERRADO'
      if (input.demoEnviada) {
        if (agendada) {
          // Reunión agendada: la cierra Franco — el manual no tiene pantalla
          // por delante (m16 queda completada y navegable).
          return { actual: 'm16', habilitadas: [] }
        }
        // Demo enviada: agendar es el objetivo; los toques post-envío se
        // registran en m5 (por-toque, repetible).
        return input.followUpVencido
          ? { actual: 'm5', habilitadas: ['m5', 'm16'] }
          : { actual: 'm16', habilitadas: ['m5', 'm16'] }
      }
      const envioAbierto = gateEnvioDemo({
        status: input.status,
        caliente: input.caliente,
        stage,
        finalUrl: input.finalUrl,
      })
      if (envioAbierto) {
        return { actual: 'm15', habilitadas: ['m15'] }
      }
      // Aprobada sin condición de envío (falta que responda, o falta la URL
      // final del admin): espera con la conversación viva — mismo tono del
      // estado post-opener. m15 es consulta (5.3): nombra la causa real de la
      // espera, no habilita enviar — el gate server-side (`gateEnvioDemo`,
      // arriba) sigue idéntico.
      return input.followUpVencido
        ? { actual: 'm5', habilitadas: ['m5', 'm15'] }
        : { actual: 'espera', habilitadas: ['espera', 'm5', 'm15'] }
    }
    default: {
      // Exhaustividad: un stage nuevo no compila hasta derivarse acá.
      const _exhaustivo: never = stage
      throw new Error(`derivarPantalla: stage no contemplado: ${String(_exhaustivo)}`)
    }
  }
}

/**
 * La derivación completa: `pasoActual` del wizard extendida a granularidad de
 * pantalla. Pura y sin reloj propio (`followUpVencido` ya viene resuelto) —
 * misma entrada, misma salida.
 */
export function derivarPantalla(input: DerivacionManualInput): PosicionManual {
  const completadas = completadasDe(input)
  const { actual, habilitadas } = posicionDe(input)
  // Invariante de accesibilidad de la actual (ver `PosicionManual`).
  const actualAccesible =
    habilitadas.includes(actual) || completadas.includes(actual)
  return {
    actual,
    completadas,
    habilitadas: actualAccesible ? habilitadas : [...habilitadas, actual],
  }
}

/**
 * LeadOS Bloque 4 — Manual paso-por-pantalla: el REGISTRO de pantallas (el mapa
 * v1 como contrato) y la DERIVACIÓN de posición a granularidad de pantalla.
 *
 * Hermano de `flow.ts`: acá NO hay gates nuevos ni transiciones — solo se LEE
 * stage + datos capturados + checklist y se deriva presentación (qué pantalla
 * es la actual, cuáles quedaron completadas, cuáles se pueden trabajar). La
 * posición NUNCA se persiste: se re-deriva en cada request, así jamás se
 * desincroniza del dossier (mismo principio que `pasoActual` del rail del
 * wizard, extendido de 5 pasos a 19 pantallas).
 *
 * Reglas de navegación del mapa que esta derivación garantiza:
 *   - atrás siempre libre a pantallas completadas;
 *   - el futuro no se renderiza (pedir una pantalla no habilitada → la actual);
 *   - las 6 fases de Construcción son AUTO-REPORTE con navegación libre entre
 *     ellas — jamás gates (§6-3 del brief; `progreso-isolation.invariant.ts`).
 *
 * Imports relativos a propósito (patrón de flow.ts): el módulo queda importable
 * por un harness ts-node sin tsconfig-paths si algún día suma invariante.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
import type { Agenda, Ficha, Progreso } from './contracts.ts'
import { FASE_IDS, type FaseId } from './contracts.ts'
import { SHELL_CONSTRUCCION } from './flow-content.ts'
import {
  cadenciaInfo,
  fichaTieneSenal,
  gateBriefAbierto,
  gateEnvioDemo,
  reunionAgendada,
} from './flow.ts'

// ── El registro de pantallas (mapa v1) ───────────────────────────────────────

/**
 * Ids de pantalla del mapa: m1…m16 (manual) + mr (reentrada re-loop) + los dos
 * estados de espera. El `[paso]` de la URL es uno de estos — cualquier otra
 * cosa redirige a la actual.
 */
export const PANTALLA_IDS = [
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
  'm7',
  'm8',
  'm9',
  'm10',
  'm11',
  'm12',
  'm13',
  'm14',
  'm15',
  'm16',
  'mr',
  'espera',
  'revision',
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

/** Las 6 pantallas de Construcción, en el MISMO orden que `FASE_IDS`. */
export const PANTALLAS_CONSTRUCCION = [
  'm7',
  'm8',
  'm9',
  'm10',
  'm11',
  'm12',
] as const satisfies readonly PantallaId[]

/** Pantalla del manual que corresponde a una fase del checklist (m7…m12). */
export function pantallaDeFaseConstruccion(fase: FaseId): PantallaId {
  return PANTALLAS_CONSTRUCCION[FASE_IDS.indexOf(fase)]
}

/** Fase del checklist detrás de una pantalla de Construcción (inversa). */
export function faseDePantallaConstruccion(id: PantallaId): FaseId | null {
  const index = (PANTALLAS_CONSTRUCCION as readonly PantallaId[]).indexOf(id)
  return index === -1 ? null : FASE_IDS[index]
}

/**
 * Título/bajada de las pantallas de Construcción: se toman del shell vigente
 * (`SHELL_CONSTRUCCION`, editable por Franco) — única copia del contenido de
 * las fases, igual que en el wizard.
 */
function shellDe(fase: FaseId): { titulo: string; detalle: string } {
  const shell = SHELL_CONSTRUCCION.find((s) => s.id === fase)
  return {
    titulo: shell?.titulo ?? fase,
    detalle: shell?.detalle ?? '',
  }
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
    titulo: 'Llevá la ficha al Evaluador',
    detalle: 'Copiá el bloque de la ficha, pasalo por el Gem Evaluador y volvé con el resultado.',
    corto: 'Al Evaluador',
  },
  m3: {
    id: 'm3',
    tipo: 'manual',
    fase: 'evaluacion',
    titulo: 'Registrá el veredicto',
    detalle: 'Score, veredicto y razonamiento del Evaluador — quedan en el dossier.',
    corto: 'Veredicto',
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
  m6: {
    id: 'm6',
    tipo: 'manual',
    fase: 'brief',
    titulo: 'Armá el brief',
    detalle: 'Con la ficha y la evaluación a la vista, generá el brief de diseño y traelo acá.',
    corto: 'Brief',
  },
  m7: {
    id: 'm7',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('estructura'),
    corto: 'Estructura',
  },
  m8: {
    id: 'm8',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('personalizacion'),
    corto: 'Personalización',
  },
  m9: {
    id: 'm9',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('assets'),
    corto: 'Assets',
  },
  m10: {
    id: 'm10',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('cta'),
    corto: 'CTA',
  },
  m11: {
    id: 'm11',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('calidad'),
    corto: 'Calidad',
  },
  m12: {
    id: 'm12',
    tipo: 'manual',
    fase: 'construccion',
    ...shellDe('mobile'),
    corto: 'Mobile',
  },
  m13: {
    id: 'm13',
    tipo: 'manual',
    fase: 'borrador',
    titulo: 'Publicá y registrá el link del borrador',
    detalle: 'Subí la demo a Netlify Drop y guardá el link del draft — se valida que sea un link real.',
    corto: 'Borrador',
  },
  m14: {
    id: 'm14',
    tipo: 'manual',
    fase: 'chequeo',
    titulo: 'Pasá los checks duros',
    detalle: 'Con el link del borrador a la vista, verificá los hard-blocks y mandá la demo a revisión.',
    corto: 'Chequeo final',
  },
  m15: {
    id: 'm15',
    tipo: 'manual',
    fase: 'envio',
    titulo: 'Mandá el link al negocio',
    detalle: 'Se habilita solo con la demo aprobada y el negocio respondiendo — el gate es server-side.',
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
}

export const FASES_MANUAL: Record<
  FaseManualId,
  { titulo: string; pantallas: readonly PantallaId[] }
> = {
  ficha: { titulo: 'Ficha', pantallas: ['m1'] },
  evaluacion: { titulo: 'Evaluación', pantallas: ['m2', 'm3'] },
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
  'm3',
  'm4',
  'm5',
  'm6',
  'm7',
  'm8',
  'm9',
  'm10',
  'm11',
  'm12',
  'm13',
  'm14',
  'm15',
  'm16',
] as const satisfies readonly PantallaId[]

/** Stages donde la evaluación quedó registrada (m1–m3 atrás). */
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
    done.add('m3')
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

  for (const fase of input.progreso.completadas) {
    done.add(pantallaDeFaseConstruccion(fase))
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
 * wizard) llevado a granularidad de pantalla — misma fuente de verdad (stage),
 * refinada con los MISMOS gates del motor (`gateBriefAbierto`, `gateEnvioDemo`,
 * `cadenciaInfo`) que el wizard ya calcula. Exhaustivo por stage: un stage
 * nuevo rompe el build hasta contemplarse acá (mismo candado que el wizard).
 */
function posicionDe(
  input: DerivacionManualInput,
): { actual: PantallaId; habilitadas: PantallaId[] } {
  const { stage } = input
  switch (stage) {
    case null:
    case 'FICHA': {
      // La evaluación ocurre con stage=FICHA: registrar el veredicto ES la
      // transición. Sin señal mínima, m2/m3 son futuro (gate de la ficha).
      if (!fichaTieneSenal(input.ficha)) {
        return { actual: 'm1', habilitadas: ['m1'] }
      }
      // Tarea externa con vuelta: m3 tiene que ser alcanzable desde m2 (no hay
      // dato que persista "ya fui al Evaluador" — la posición no se guarda).
      return { actual: 'm2', habilitadas: ['m2', 'm3'] }
    }
    case 'DESCARTADA':
      // Terminal del archivo: el manual muestra el veredicto registrado; no
      // hay pantallas por delante.
      return { actual: 'm3', habilitadas: [] }
    case 'EVALUADA': {
      if (gateBriefAbierto(input.status, input.caliente)) {
        return { actual: 'm6', habilitadas: ['m6'] }
      }
      if (input.contactos === 0) {
        return { actual: 'm4', habilitadas: ['m4'] }
      }
      // Toque vencido o cadencia agotada (estructura de cierre) → m5. Si no,
      // estado de espera con m5 alcanzable: una respuesta puede llegar antes
      // del toque y hay que poder registrarla.
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
      // estado post-opener.
      return input.followUpVencido
        ? { actual: 'm5', habilitadas: ['m5'] }
        : { actual: 'espera', habilitadas: ['espera', 'm5'] }
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

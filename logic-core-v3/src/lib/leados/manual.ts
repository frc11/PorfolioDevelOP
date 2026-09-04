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
  gateBriefAbierto,
  gateEnvioDemo,
  reunionAgendada,
} from './flow.ts'
import { derivarPasoDelLead } from './paso.ts'

// ── El registro de pantallas (mapa v1) ───────────────────────────────────────

/**
 * Ids de pantalla del mapa: diez del manual (sin m3 — P4 fusionó el registro del
 * veredicto dentro de m2; sin m2 — D15-bis fusionó ESA pantalla dentro de m1;
 * sin m7…m12 — P6-B agrupó las seis fases en mc1/mc2) + mr (reentrada re-loop) +
 * los estados de espera. El `[paso]` de la URL es uno de estos — cualquier otra
 * cosa redirige a la actual (así el `m3` de un bookmark viejo, el `m2` de uno
 * de ayer, o un `m9` de la galería, aterrizan solos en la pantalla vigente: la
 * posición se re-deriva, nunca se guarda).
 */
export const PANTALLA_IDS = [
  'm1',
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
  // D15-bis — la ficha y el veredicto son UNA pantalla. Antes el veredicto vivía
  // en m2 y salía de una herramienta externa: el setter copiaba la ficha, la
  // pegaba en un chat de evaluación y transcribía la respuesta. Esa herramienta
  // no tiene link cargado, así que los tres campos —obligatorios, porque
  // sostienen el gate— no se podían llenar sin inventarlos. Ahora el juicio es
  // del setter: mira lo que acaba de anotar y lo cierra ahí mismo.
  m1: {
    id: 'm1',
    tipo: 'manual',
    fase: 'ficha',
    titulo: 'Mirá el negocio y decidí si vale una demo',
    detalle:
      'Anotá lo que ves y, con eso a la vista, dejá tu veredicto: cuánto le ves, si avanza o se descarta, y por qué.',
    corto: 'Ficha',
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
  // P9 — «Pasá los checks duros» nombraba la lista con la palabra del sistema
  // (los hard-checks del motor). El setter no ve «checks duros»: ve puntos
  // obligatorios de un chequeo final. Mismo registro que el resto de la poda
  // (verbo en voseo + la demo como objeto), y «chequeo» ya es el vocabulario
  // del rail, del gate y del propio formulario.
  m14: {
    id: 'm14',
    tipo: 'manual',
    fase: 'chequeo',
    titulo: 'Chequeá la demo antes de mandarla',
    detalle: 'Con el link del borrador a la vista, verificá los obligatorios y mandá la demo a revisión.',
    corto: 'Chequeo final',
  },
  // P11 — el detalle decía «se destraba solo, sin que tengas que hacer nada», y
  // se muestra IGUAL con el gate abierto: la única pantalla donde el turno es
  // del setter se leía como una espera. Ahora dice qué hacer; el «todavía no»,
  // cuando corresponde, lo nombra el registro con su turno y su causa real.
  m15: {
    id: 'm15',
    tipo: 'manual',
    fase: 'envio',
    titulo: 'Mandá el link al negocio',
    detalle: 'El segundo mensaje: la demo aprobada, con su link, al negocio que respondió.',
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
    // P19 — Absorbe el párrafo que quedó suelto en la zona de trabajo cuando P18
    // se llevó el botón a la barra. Y cambia lo que promete: hasta este sprint
    // decía «después volvés a publicar y a pasar el chequeo» mientras la
    // derivación aterrizaba DIRECTO en el chequeo. Ahora reabrir aterriza en la
    // construcción, y la frase describe lo que de verdad pasa.
    detalle:
      'Reabrí y rehacé lo que marcó: aterrizás en la construcción, con el checklist y el borrador como estaban y el pedido a la vista en cada pantalla. Después republicás el borrador y volvés a pasar el chequeo final, que se reseteó.',
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
  opener: { titulo: 'Opener', pantallas: ['m4'] },
  seguimiento: { titulo: 'Seguimiento', pantallas: ['m5'] },
  brief: { titulo: 'Brief', pantallas: ['m6'] },
  construccion: { titulo: 'Construcción', pantallas: PANTALLAS_CONSTRUCCION },
  borrador: { titulo: 'Borrador', pantallas: ['m13'] },
  chequeo: { titulo: 'Chequeo final', pantallas: ['m14'] },
  envio: { titulo: 'Envío', pantallas: ['m15'] },
  agenda: { titulo: 'Agenda', pantallas: ['m16'] },
}

/*
 * P20 — Acá vivía `indicadorDeFase`, el "paso N de M" por fase. Lo reemplazó la
 * franja del recorrido (`recorrido.ts`): el indicador decía el nombre de la
 * fase y, cuando la fase tenía más de una pantalla, en cuál ibas — nunca cuántas
 * fases faltaban ni cuál venía. La franja dice las tres cosas y en el mismo
 * lugar, así que el rótulo pasó a repetir la mitad de lo que ya se lee al lado.
 * `FASES_MANUAL` sigue: es de donde la franja saca los nombres.
 */

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
  /**
   * P19 — La POSTERGACIÓN comercial ya venció (`status = POSTERGADO` y
   * `reactivateAt <= ahora`). Mismo nombre, mismo cálculo y mismo reloj del
   * caller que `HomeLeadInput.postergadoVencido`, del que sale la decisión del
   * panel de inicio.
   *
   * Sin este campo la derivación no podía distinguir un postergado VENCIDO —que
   * ya volvió a ser trabajo— de uno con la fecha todavía por delante, porque el
   * status solo dice que HAY una postergación, nunca cuándo termina. El barrido
   * lo midió: cambiando únicamente el status, POSTERGADO daba la MISMA pantalla
   * que PROSPECTO en los 20.736 escenarios, así que un lead pausado seguía
   * mostrando el paso de trabajo que le tocara por stage («Agendá la reunión»,
   * «Construí la demo», «Aplicá las correcciones»…). No es una fecha nueva: es
   * el mismo dato que la cabecera de estas pantallas YA muestra.
   */
  postergadoVencido: boolean
  /**
   * P19 — El dossier tiene al menos un rechazo de Franco (`dossier.rechazos`).
   * En CONSTRUCCION equivale a «esta vuelta es un re-loop», y no por
   * aproximación: el único camino a CONSTRUCCION con rechazos registrados es
   * RECHAZADA→CONSTRUCCION (`reabrirConstruccion`). Distingue el checklist
   * TILDADO DE LA VUELTA ANTERIOR —que el re-loop preserva a propósito— del
   * progreso de la vuelta en curso.
   */
  hayRechazo: boolean
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
export const ORDEN_MANUAL = [
  'm1',
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

/** Stages donde el veredicto quedó registrado (m1, la pantalla fusionada, atrás). */
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

  // D15-bis — m1 se completa con el VEREDICTO, no con la señal de la ficha.
  // Antes eran dos pantallas: la ficha con señal cerraba m1 y el veredicto
  // cerraba m2. Fusionadas, marcar m1 con la sola señal diría «hecho» sobre una
  // pantalla cuya segunda mitad todavía está en blanco, y la pondría en el rail
  // de completadas mientras es el paso de ahora.
  if (stage !== null && STAGES_POST_EVALUACION.includes(stage)) {
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
  // P19 — PAUSA COMERCIAL vigente: postergado a una fecha que todavía no llegó.
  // Va acá arriba, junto al otro corte por status, porque es la MISMA precedencia
  // que el panel de inicio ya aplica (`grupoPara` decide por status antes que por
  // stage: POSTERGADO no vencido → «seguimiento», y `proximaAccionPara` lo
  // devuelve `accionable: false`). Sin esta rama el manual derivaba solo por
  // stage y le proponía al setter el trabajo que le tocara —construir, corregir,
  // agendar— sobre un negocio que él mismo decidió no tocar hasta esa fecha.
  //
  // `m5` queda alcanzable por la misma razón que en el resto de las esperas: la
  // respuesta puede llegar antes de la fecha y hay que poder registrarla (y ese
  // registro es, además, lo que saca al lead de la pausa). Las completadas
  // siguen navegables como en cualquier otra pantalla.
  //
  // La PRECEDENCIA es la del panel (`grupoPara`) y la de la causa de espera
  // (`causaDeEspera`), no una nueva: el cierre por stage (DESCARTADA) y la cola
  // de Franco (EN_REVISION) ganan sobre la pausa. Sin esas dos exclusiones un
  // descartado postergado aterrizaba en «espera» en vez del archivo, y una demo
  // en revisión decía «esperá al negocio» mientras la pelota la tenía Franco —
  // los dos los encontró el barrido de este mismo sprint, ya introducidos.
  if (
    input.status === 'POSTERGADO' &&
    !input.postergadoVencido &&
    stage !== 'DESCARTADA' &&
    stage !== 'EN_REVISION'
  ) {
    return { actual: 'espera', habilitadas: ['espera', 'm5'] }
  }
  const gateAbierto = gateBriefAbierto(input.status, input.caliente)
  const openerPendiente = stage === 'EVALUADA' && !gateAbierto && input.contactos === 0
  const paso = derivarPasoDelLead(stage, gateAbierto, openerPendiente)
  switch (stage) {
    case null:
    case 'FICHA': {
      // La evaluación ocurre con stage=FICHA: registrar el veredicto ES la
      // transición, y desde D15-bis ocurre en la MISMA pantalla que la ficha.
      // Sin bifurcación por señal: no hay un segundo destino al que mandar. El
      // gate de la señal mínima no se aflojó — sigue donde estaba, en
      // `registrarEvaluacion` (server) y en el form, que no habilita el
      // veredicto hasta que la ficha tenga con qué juzgar.
      return { actual: 'm1', habilitadas: ['m1'] }
    }
    case 'DESCARTADA':
      // Terminal del archivo. Hasta D15-bis aterrizaba en m2 «con el veredicto a
      // la vista»: una pantalla titulada «llevá la ficha a evaluar y registrá el
      // veredicto», que a un lead ya cerrado le proponía trabajo que no existe.
      // Con la fusión el veredicto vive en m1, que queda completada y navegable;
      // el aterrizaje es el ARCHIVO, la pantalla de cierre que ya sabía decir
      // «Descartado» y mostrar el motivo (`causa`/`motivo` de la página, misma
      // regla que el home: `archivoMotivo`).
      return { actual: 'archivo', habilitadas: [] }
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
      // P19 — El re-loop reabre una construcción cuyo checklist quedó TILDADO
      // de la vuelta anterior (`reabrirConstruccion` preserva checklist y
      // borrador a propósito: son el punto de partida del retrabajo). Leer esos
      // tildes como progreso DE ESTA vuelta hacía que «Reabrir construcción»
      // aterrizara en el chequeo final —«Chequeá la demo antes de mandarla»—
      // sin que se hubiera rehecho nada: la pantalla de correcciones promete
      // «rehacer lo que Franco marcó, después publicar y después chequear», y la
      // derivación mandaba directo al último paso de esa frase.
      //
      // Con un rechazo en el dossier la construcción reabierta arranca donde
      // arranca el retrabajo: en la primera pantalla de Construcción. Nada se
      // bloquea —mc2, el borrador y el chequeo siguen alcanzables, y el pie de
      // Construcción sirve el enlace directo al chequeo—, y los seis tildes se
      // conservan intactos (§6-3: auto-reporte, jamás gate).
      //
      // LÍMITE CONOCIDO, y es de datos: el producto no registra QUÉ correcciones
      // se aplicaron, así que la derivación no puede saber cuándo el retrabajo
      // terminó — mientras la vuelta siga abierta, el paso señalado sigue siendo
      // la construcción. No se inventa el dato: se declara.
      const reloop = enConstruccion && input.hayRechazo
      const actual: PantallaId = primeraFase
        ? pantallaDeFaseConstruccion(primeraFase)
        : enConstruccion && !reloop
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

/**
 * P23 — LA SALIDA QUE UNA PANTALLA DE ESTADO OFRECE.
 *
 * `espera` no es un paso: es el residuo honesto de un estado donde el setter no
 * tiene trabajo. Pero ofrece UNA puerta —«¿Respondió o pasó algo antes?
 * Registralo»— porque si el negocio contesta durante la pausa hay que poder
 * registrarlo. Esa puerta es legítima y se queda.
 *
 * Existe acá, y no dentro del componente, por el ciclo que cerró: el bloque de
 * avance de `PantallaManual` ofrece «Ir a tu paso actual» en TODA pantalla que
 * no sea la actual, y en `m5` el paso actual es `espera` — la misma pantalla que
 * acaba de mandar al setter a `m5`. Las dos derivaciones son correctas por
 * separado; el ciclo lo hace la composición. Con el predicado en un solo lugar,
 * la punta que ofrece y la punta que vuelve leen el MISMO dato: la vuelta no se
 * pinta cuando la ida salió de la pantalla a la que volvería.
 *
 * `enlaces-manual.invariant.ts` barre este predicado contra el bloque de avance
 * y falla si aparece un ciclo de dos nodos nuevo.
 */
export function ofreceSalida(
  desde: PantallaId,
  hacia: PantallaId,
  posicion: PosicionManual,
): boolean {
  return desde === 'espera' && hacia === 'm5' && posicion.habilitadas.includes('m5')
}

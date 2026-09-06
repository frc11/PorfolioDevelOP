/**
 * LeadOS P19 — ¿EL ESTADO ADMITE LA TAREA DE LA PANTALLA QUE SE SEÑALA?
 *
 * `derivarPantalla` decide QUÉ pantalla es la actual. Este módulo decide algo
 * distinto y a propósito independiente: dado un estado, ¿la TAREA de una
 * pantalla es hacible ahí? Las dos respuestas tienen que coincidir, y cuando no
 * coinciden el producto señala un paso que su estado no admite — que es
 * exactamente el defecto que P19 vino a cerrar.
 *
 * ── Por qué no es una segunda copia de `posicionDe` ──────────────────────────
 * Un oráculo derivado de la misma rama que eligió la pantalla no puede estar en
 * desacuerdo con nada: coincidiría siempre, y el chequeo pasaría en verde sin
 * mirar. Acá cada condición sale de dos fuentes que NO son `posicionDe`:
 *
 *   - el CONTRATO de la pantalla — su título en `PANTALLAS` («Mandá el opener»,
 *     «Agendá la reunión»): la tarea que le promete al setter;
 *   - los GATES REALES del motor — `gateBriefAbierto`, `gateEnvioDemo`,
 *     `reunionAgendada`, `cadenciaInfo`, que no se tocan ni se reimplementan.
 *
 * Y la PRECEDENCIA (cierre → revisión → pausa comercial → trabajo) es la que el
 * panel de inicio ya aplica en `grupoPara`: el home siempre supo que un lead
 * cerrado, uno en revisión y uno postergado no son trabajo de ahora. Lo que
 * faltaba era que el manual lo supiera también.
 *
 * Imports relativos y sin `@/` (patrón de `flow.ts`/`manual.ts`): así el harness
 * de invariante lo carga sin tsconfig-paths y sin DB.
 */
import type { DossierStage, LeadStatus } from '@prisma/client'
import { FASE_IDS, type Agenda, type FaseId } from './contracts.ts'
import {
  cadenciaInfo,
  gateBriefAbierto,
  gateEnvioDemo,
  reunionAgendada,
} from './flow.ts'
import { PANTALLAS, type DerivacionManualInput, type PantallaId } from './manual.ts'

// ── El veredicto ────────────────────────────────────────────────────────────

export type Veredicto = { admite: boolean; motivo: string }

const SI: Veredicto = { admite: true, motivo: '' }
const NO = (motivo: string): Veredicto => ({ admite: false, motivo })

/** El lead está CERRADO: nada del manual se hace sobre un negocio muerto. */
function cerrado(i: DerivacionManualInput): boolean {
  return i.status === 'PERDIDO' || i.stage === 'DESCARTADA'
}

/** PAUSA COMERCIAL vigente: postergado a una fecha que todavía no llegó. */
function pausado(i: DerivacionManualInput): boolean {
  return i.status === 'POSTERGADO' && !i.postergadoVencido
}

/** Hay reunión: por booking real de Cal.com o porque el status ya la registra. */
function conReunion(i: DerivacionManualInput): boolean {
  return (
    reunionAgendada(i.agenda) || i.status === 'CALL_AGENDADA' || i.status === 'CERRADO'
  )
}

/**
 * ¿El estado admite que ESTA pantalla sea la actual? Exhaustivo por pantalla: un
 * id nuevo en `PANTALLA_IDS` no compila hasta declarar bajo qué condición su
 * tarea es hacible (mismo candado que `posicionDe` tiene sobre los stages).
 */
export function admitePantalla(id: PantallaId, i: DerivacionManualInput): Veredicto {
  // 1) Cierre y revisión mandan sobre todo lo demás — misma precedencia del panel.
  if (cerrado(i)) {
    return id === 'archivo'
      ? SI
      : NO('el lead está cerrado (perdido/descartado): solo «archivo»')
  }
  if (i.stage === 'EN_REVISION') {
    return id === 'revision' ? SI : NO('la demo está en la cola de Franco: solo «revisión»')
  }
  if (id === 'archivo') return NO('el lead no está cerrado')
  if (id === 'revision') return NO('la demo no está en revisión')

  // 2) La pausa comercial vigente no admite NINGUNA pantalla de trabajo.
  if (pausado(i) && PANTALLAS[id].tipo !== 'estado') {
    return NO('postergado a una fecha futura: no hay trabajo hasta que se reactive')
  }

  // 3) La tarea de cada pantalla, contra el contrato de su título y los gates.
  switch (id) {
    case 'm1':
      // «Mirá el negocio y decidí si vale una demo» — el veredicto todavía no está.
      return i.stage === null || i.stage === 'FICHA'
        ? SI
        : NO('el veredicto ya está registrado (stage posterior a FICHA)')
    case 'm4':
      // «Mandá el opener» — el primer contacto todavía no salió.
      return i.contactos === 0 ? SI : NO('el opener ya está registrado (contactos > 0)')
    case 'm5':
      // «Registrá lo que pasó» — como paso de AHORA solo si toca un toque.
      return i.followUpVencido || cadenciaInfo(i.followUpCount).agotada
        ? SI
        : NO('no hay toque vencido ni cadencia agotada: no toca registrar nada')
    case 'm6':
      // «Decidí cómo va a ser la demo» — el gate del brief, tal cual el motor.
      if (i.stage !== 'EVALUADA') return NO('el brief solo se decide en EVALUADA')
      return gateBriefAbierto(i.status, i.caliente)
        ? SI
        : NO('el gate del brief está cerrado (no respondió y no es caliente)')
    case 'mc1':
    case 'mc2':
      return i.stage === 'BRIEF' || i.stage === 'CONSTRUCCION'
        ? SI
        : NO('la demo no está en construcción')
    case 'm13':
      // El registro del borrador exige CONSTRUCCION (gate server-side existente).
      return i.stage === 'CONSTRUCCION'
        ? SI
        : NO('el borrador solo se registra en CONSTRUCCION')
    case 'm14':
      if (i.stage !== 'CONSTRUCCION') return NO('el chequeo solo se pasa en CONSTRUCCION')
      return i.draftUrl ? SI : NO('el chequeo necesita el borrador publicado')
    case 'm15':
      // «Mandá el link al negocio» — el gate del envío, tal cual el motor.
      if (i.demoEnviada) return NO('la demo ya se envió')
      return gateEnvioDemo({
        status: i.status,
        caliente: i.caliente,
        stage: i.stage,
        finalUrl: i.finalUrl,
      })
        ? SI
        : NO('el gate del envío está cerrado (falta aprobación, link o respuesta)')
    case 'm16':
      // «Agendá la reunión» — hay demo enviada y todavía no hay reunión.
      if (!i.demoEnviada) return NO('no hay demo enviada: no hay reunión que agendar')
      return conReunion(i) ? NO('la reunión ya está agendada') : SI
    case 'mr':
      return i.stage === 'RECHAZADA' ? SI : NO('no hay correcciones pendientes')
    case 'espera':
      // Esperar nunca es una tarea imposible: es el residuo honesto.
      return SI
    default: {
      const _exhaustivo: never = id
      throw new Error(`admitePantalla: pantalla no contemplada: ${String(_exhaustivo)}`)
    }
  }
}

// ── El censo de estados ─────────────────────────────────────────────────────

const STAGES: (DossierStage | null)[] = [
  null,
  'FICHA',
  'EVALUADA',
  'DESCARTADA',
  'BRIEF',
  'CONSTRUCCION',
  'RECHAZADA',
  'EN_REVISION',
  'APROBADA',
]

const STATUSES: LeadStatus[] = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
  'PERDIDO',
  'POSTERGADO',
]

/**
 * Progresos representativos: la derivación solo mira «cuál es la primera fase
 * sin tildar», así que alcanza con un prefijo por corte de pantalla — más el
 * caso NO-prefijo (una fase de mc2 tildada sin las de mc1), que es el que
 * detectaría un acoplamiento posicional entre las dos listas.
 */
const PROGRESOS: { nombre: string; completadas: FaseId[] }[] = [
  { nombre: 'ninguna', completadas: [] },
  { nombre: 'primera', completadas: [FASE_IDS[0]!] },
  { nombre: 'mc1', completadas: [FASE_IDS[0]!, FASE_IDS[1]!, FASE_IDS[2]!] },
  { nombre: 'mc1+1', completadas: [FASE_IDS[0]!, FASE_IDS[1]!, FASE_IDS[2]!, FASE_IDS[3]!] },
  { nombre: 'todas', completadas: [...FASE_IDS] },
  { nombre: 'salteada', completadas: [FASE_IDS[3]!] },
]

/** 0 = sin toques · 1 = cadencia viva · 4 = cadencia agotada. */
const FOLLOW_UP_COUNTS = [0, 1, 4]

const AGENDA_AGENDADA = {
  estado: 'AGENDADA',
  calBookingUid: 'uid-qa',
} as unknown as Agenda

const AGENDAS: { nombre: string; agenda: Agenda | null }[] = [
  { nombre: 'sin', agenda: null },
  { nombre: 'agendada', agenda: AGENDA_AGENDADA },
]

/** La ficha no entra en la derivación de posición; va fija y con señal. */
const FICHA = {
  negocio: 'Bar Modelo',
  instagram: '@barmodelo',
  seguidores: '3k',
  ubicacion: 'Palermo',
  rubro: 'gastronomia',
  tieneWeb: 'no',
  senalesOperativas: 'pedidos por DM',
  resenasUrl: '',
  imagenesUrl: '',
  otraRedUrl: '',
  queVende: '',
  comoSePresenta: '',
  otros: '',
} as unknown as DerivacionManualInput['ficha']

/** El estado de la postergación comercial, nombrado para el reporte. */
export type Postergacion = 'no' | 'futuro' | 'vencido'

export type EstadoBarrido = {
  input: DerivacionManualInput
  postergacion: Postergacion
  progreso: string
  agenda: string
}

/**
 * TODOS los estados que la derivación distingue. La postergación se cruza SOLO
 * con `status = POSTERGADO`: un lead que no está postergado no puede tener una
 * postergación vencida, y barrer esa combinación sería medir estados que el
 * producto no puede producir.
 */
export function* estadosDelBarrido(): Generator<EstadoBarrido> {
  for (const stage of STAGES) {
    for (const status of STATUSES) {
      const postergaciones: Postergacion[] =
        status === 'POSTERGADO' ? ['futuro', 'vencido'] : ['no']
      for (const postergacion of postergaciones) {
        for (const caliente of [false, true]) {
          for (const draftUrl of [null, 'https://demo.netlify.app']) {
            for (const finalUrl of [null, 'https://demo.develop.ar']) {
              for (const demoEnviada of [false, true]) {
                for (const progreso of PROGRESOS) {
                  for (const followUpVencido of [false, true]) {
                    for (const contactos of [0, 1]) {
                      for (const followUpCount of FOLLOW_UP_COUNTS) {
                        for (const agenda of AGENDAS) {
                          for (const hayRechazo of [false, true]) {
                            yield {
                              postergacion,
                              progreso: progreso.nombre,
                              agenda: agenda.nombre,
                              input: {
                                stage,
                                status,
                                caliente,
                                ficha: FICHA,
                                draftUrl,
                                progreso: { completadas: progreso.completadas },
                                agenda: agenda.agenda,
                                contactos,
                                followUpCount,
                                followUpVencido,
                                postergadoVencido: postergacion === 'vencido',
                                hayRechazo,
                                finalUrl,
                                demoEnviada,
                              },
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// ── El censo de desacuerdos ─────────────────────────────────────────────────

/**
 * Cuánto pesa el desacuerdo EN PANTALLA, y P18 lo encareció: con la acción
 * principal siempre visible, un paso actual equivocado dejó de ser una etiqueta
 * al pasar.
 *
 *   'activo'   — `habilitadas` no vacía: badge «Tu paso ahora» y la acción de la
 *                pantalla se pinta en la barra fija. Una tarea que el estado no
 *                admite, ofrecida permanentemente.
 *   'terminal' — `habilitadas` vacía: aterrizaje sin trabajo (badge «Completada»
 *                o «Disponible», ninguna acción en la barra). El título puede
 *                nombrar una tarea que no corresponde, pero no la ofrece.
 */
export type Peso = 'activo' | 'terminal'

export type Desacuerdo = {
  stage: string
  status: LeadStatus
  postergacion: Postergacion
  senala: PantallaId
  peso: Peso
  motivo: string
  n: number
}

export type Censo = {
  barridos: number
  desacuerdos: Desacuerdo[]
  /** Cuántos estados señalan cada pantalla — la red contra un barrido que se secó. */
  senaladas: Map<PantallaId, number>
}

/** La derivación bajo examen. Parametrizada para poder censar un saboteador. */
export type Derivacion = (input: DerivacionManualInput) => {
  actual: PantallaId
  habilitadas: PantallaId[]
}

/**
 * Recorre el barrido entero y agrupa los desacuerdos por clase. NO afirma nada:
 * el censo es el instrumento, las afirmaciones viven en el invariante. Recibe la
 * derivación como parámetro para que el par conducta/sabotaje pueda censar una
 * derivación torcida a propósito y exigir que el censo la vea.
 */
export function censarDesacuerdos(derivar: Derivacion): Censo {
  const clases = new Map<string, Desacuerdo>()
  const senaladas = new Map<PantallaId, number>()
  let barridos = 0

  for (const { input, postergacion } of estadosDelBarrido()) {
    barridos += 1
    const { actual, habilitadas } = derivar(input)
    senaladas.set(actual, (senaladas.get(actual) ?? 0) + 1)
    const peso: Peso = habilitadas.length > 0 ? 'activo' : 'terminal'
    const veredicto = admitePantalla(actual, input)
    if (veredicto.admite) continue
    const clave = `${String(input.stage)}|${input.status}|${postergacion}|${actual}|${peso}|${veredicto.motivo}`
    const previo = clases.get(clave)
    if (previo) {
      previo.n += 1
      continue
    }
    clases.set(clave, {
      stage: String(input.stage),
      status: input.status,
      postergacion,
      senala: actual,
      peso,
      motivo: veredicto.motivo,
      n: 1,
    })
  }

  return { barridos, desacuerdos: [...clases.values()], senaladas }
}

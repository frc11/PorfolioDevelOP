/**
 * P19 — EL BARRIDO DE LA DERIVACIÓN.
 *
 *   npx tsx scripts/qa-corridas/barrido-derivacion.ts
 *   BARRIDO_OUT=docs/baselines/p19-barrido-antes.json npx tsx ...
 *
 * No lee: EJECUTA. Recorre el espacio de estados que `derivarPantalla` admite y,
 * por cada combinación, compara QUÉ PANTALLA SEÑALA contra CUÁL CORRESPONDERÍA.
 *
 * El oráculo (`admite`) NO es una segunda copia de `posicionDe`: es la condición
 * bajo la cual la TAREA de cada pantalla es hacible, escrita desde el contrato de
 * la pantalla (su título) y desde los gates REALES del motor (`gateBriefAbierto`,
 * `gateEnvioDemo`, `reunionAgendada`) — nunca desde la rama que la eligió. Por eso
 * puede estar en desacuerdo con la derivación: ese desacuerdo es el hallazgo.
 *
 * Sin DB y sin reloj: `followUpVencido` y la postergación entran como ejes.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { FASE_IDS, type FaseId } from '../../src/lib/leados/contracts.ts'
import {
  cadenciaInfo,
  gateBriefAbierto,
  gateEnvioDemo,
  reunionAgendada,
} from '../../src/lib/leados/flow.ts'
import {
  derivarPantalla,
  PANTALLAS,
  type DerivacionManualInput,
  type PantallaId,
} from '../../src/lib/leados/manual.ts'

// ── Los ejes ────────────────────────────────────────────────────────────────

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

/** El estado de la postergación comercial — el eje que la derivación no tenía. */
type Postergacion = 'no' | 'futuro' | 'vencido'

/**
 * Progresos representativos: la derivación solo mira "cuál es la primera fase sin
 * tildar", así que basta un prefijo por corte de pantalla, más el caso NO-prefijo
 * (una fase de mc2 tildada sin las de mc1) que detecta acoplamiento posicional.
 */
const PROGRESOS: { nombre: string; completadas: FaseId[] }[] = [
  { nombre: 'ninguna', completadas: [] },
  { nombre: 'primera', completadas: [FASE_IDS[0]!] },
  { nombre: 'mc1', completadas: [FASE_IDS[0]!, FASE_IDS[1]!, FASE_IDS[2]!] },
  { nombre: 'mc1+1', completadas: [FASE_IDS[0]!, FASE_IDS[1]!, FASE_IDS[2]!, FASE_IDS[3]!] },
  { nombre: 'todas', completadas: [...FASE_IDS] },
  { nombre: 'salteada', completadas: [FASE_IDS[3]!] },
]

/** 0 = sin toques · 1 = cadencia viva · 4 = cadencia agotada (`calculateNextFollowUp`). */
const FOLLOW_UP_COUNTS = [0, 1, 4]

const AGENDAS: { nombre: string; agenda: DerivacionManualInput['agenda'] }[] = [
  { nombre: 'sin', agenda: null },
  {
    nombre: 'agendada',
    agenda: {
      estado: 'AGENDADA',
      calBookingUid: 'uid-1',
    } as unknown as DerivacionManualInput['agenda'],
  },
]

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

type Fila = {
  stage: string
  status: LeadStatus
  postergacion: Postergacion
  caliente: boolean
  draftUrl: boolean
  finalUrl: boolean
  demoEnviada: boolean
  agenda: string
  contactos: number
  followUpCount: number
  followUpVencido: boolean
  hayRechazo: boolean
  progreso: string
}

type Caso = { fila: Fila; input: DerivacionManualInput; postergacion: Postergacion }

/**
 * ¿La derivación RECIBE el estado de la postergación? Se prueba por
 * COMPORTAMIENTO, no por el tipo (que en runtime no existe): si sacarle el campo
 * cambia alguna salida, la derivación lo lee. Así el MISMO barrido corre contra
 * las dos puntas del sprint —el código viejo no tiene el campo y lo ignora— y
 * declara en su cabecera cuál de las dos está midiendo.
 */
function detectarCampo(): boolean {
  const base: DerivacionManualInput = {
    stage: 'APROBADA',
    status: 'POSTERGADO',
    caliente: false,
    ficha: FICHA,
    draftUrl: null,
    progreso: { completadas: [] },
    agenda: null,
    contactos: 1,
    followUpCount: 1,
    followUpVencido: false,
    postergadoVencido: false,
    hayRechazo: false,
    finalUrl: 'https://demo.develop.ar',
    demoEnviada: true,
  }
  const vencido: DerivacionManualInput = { ...base, postergadoVencido: true }
  return derivarPantalla(base).actual !== derivarPantalla(vencido).actual
}

const POSTERGACION_EN_INPUT = detectarCampo()

function* estados(): Generator<Caso> {
  for (const stage of STAGES) {
    for (const status of STATUSES) {
      // La postergación es un estado DEL status: solo POSTERGADO puede estar
      // pausado. Cruzarla con el resto barrería estados que el producto no
      // puede producir.
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
                            const input: DerivacionManualInput = {
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
                            }
                            yield {
                              postergacion,
                              input,
                              fila: {
                                stage: String(stage),
                                status,
                                postergacion,
                                caliente,
                                draftUrl: draftUrl !== null,
                                finalUrl: finalUrl !== null,
                                demoEnviada,
                                agenda: agenda.nombre,
                                contactos,
                                followUpCount,
                                followUpVencido,
                                hayRechazo,
                                progreso: progreso.nombre,
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

// ── El oráculo: ¿el estado ADMITE la tarea de esta pantalla? ─────────────────

type Veredicto = { admite: boolean; motivo: string }

const OK: Veredicto = { admite: true, motivo: '' }
const no = (motivo: string): Veredicto => ({ admite: false, motivo })

/**
 * El lead está CERRADO: nada del manual se hace sobre un negocio muerto. Misma
 * precedencia del panel de inicio (`grupoPara` manda PERDIDO y DESCARTADA a
 * `archivo` antes que cualquier stage).
 */
function cerrado(i: DerivacionManualInput): boolean {
  return i.status === 'PERDIDO' || i.stage === 'DESCARTADA'
}

/**
 * PAUSA COMERCIAL vigente: POSTERGADO cuya reactivación todavía no llegó. El
 * panel ya lo decide así —`grupoPara` lo manda a «seguimiento» y
 * `proximaAccionPara` lo devuelve `accionable: false`, «Postergado — vuelve el
 * DD/MM»—. Es el MISMO criterio, no uno nuevo.
 */
function pausado(p: Postergacion): boolean {
  return p === 'futuro'
}

function agendadaDe(i: DerivacionManualInput): boolean {
  return reunionAgendada(i.agenda) || i.status === 'CALL_AGENDADA' || i.status === 'CERRADO'
}

/**
 * ¿El estado admite que ESTA pantalla sea la actual? Escrito desde el contrato de
 * cada pantalla (su título) más los gates reales del motor. Nunca desde
 * `posicionDe`: si lo fuera, el barrido no podría estar en desacuerdo con nada.
 */
function admite(id: PantallaId, i: DerivacionManualInput, p: Postergacion): Veredicto {
  // Cierre y revisión mandan sobre todo lo demás (misma precedencia del panel).
  if (cerrado(i)) {
    return id === 'archivo'
      ? OK
      : no('el lead está cerrado (perdido/descartado): solo «archivo»')
  }
  if (i.stage === 'EN_REVISION') {
    return id === 'revision' ? OK : no('la demo está en la cola de Franco: solo «revisión»')
  }
  if (id === 'archivo') return no('el lead no está cerrado')
  if (id === 'revision') return no('la demo no está en revisión')

  // La pausa comercial vigente no admite NINGUNA pantalla de trabajo.
  if (pausado(p) && PANTALLAS[id].tipo !== 'estado') {
    return no('postergado a una fecha futura: no hay trabajo hasta que se reactive')
  }

  switch (id) {
    case 'm1':
      return i.stage === null || i.stage === 'FICHA'
        ? OK
        : no('el veredicto ya está registrado (stage posterior a FICHA)')
    case 'm4':
      return i.contactos === 0 ? OK : no('el opener ya está registrado (contactos > 0)')
    case 'm5': {
      const cad = cadenciaInfo(i.followUpCount)
      return i.followUpVencido || cad.agotada
        ? OK
        : no('no hay toque vencido ni cadencia agotada: no toca registrar nada')
    }
    case 'm6':
      if (i.stage !== 'EVALUADA') return no('el brief solo se decide en EVALUADA')
      return gateBriefAbierto(i.status, i.caliente)
        ? OK
        : no('el gate del brief está cerrado (no respondió y no es caliente)')
    case 'mc1':
    case 'mc2':
      return i.stage === 'BRIEF' || i.stage === 'CONSTRUCCION'
        ? OK
        : no('la demo no está en construcción')
    case 'm13':
      return i.stage === 'CONSTRUCCION'
        ? OK
        : no('el borrador solo se registra en CONSTRUCCION')
    case 'm14':
      if (i.stage !== 'CONSTRUCCION') return no('el chequeo solo se pasa en CONSTRUCCION')
      return i.draftUrl ? OK : no('el chequeo necesita el borrador publicado')
    case 'm15':
      if (i.demoEnviada) return no('la demo ya se envió')
      return gateEnvioDemo({
        status: i.status,
        caliente: i.caliente,
        stage: i.stage,
        finalUrl: i.finalUrl,
      })
        ? OK
        : no('el gate del envío está cerrado (falta aprobación, link o respuesta)')
    case 'm16':
      if (!i.demoEnviada) return no('no hay demo enviada: no hay reunión que agendar')
      return agendadaDe(i) ? no('la reunión ya está agendada') : OK
    case 'mr':
      return i.stage === 'RECHAZADA' ? OK : no('no hay correcciones pendientes')
    case 'espera':
      // Esperar nunca es una tarea imposible: es el residuo honesto.
      return OK
  }
}

// ── La corrida ──────────────────────────────────────────────────────────────

/**
 * Cuánto pesa el desacuerdo EN PANTALLA, que es lo que P18 encareció:
 *
 *   'activo'   — la derivación la da por PASO DE AHORA (`habilitadas` no vacía):
 *                badge «Tu paso ahora» y su acción puede vivir en la barra fija.
 *                Una tarea que el estado no admite, invitando a hacerse.
 *   'terminal' — aterrizaje sin trabajo (`habilitadas` vacía): badge «Completada»
 *                o «Disponible», sin acción en la barra. El título igual nombra
 *                una tarea que no corresponde, pero no la ofrece.
 */
type Peso = 'activo' | 'terminal'

type Clase = {
  stage: string
  status: LeadStatus
  postergacion: Postergacion
  senala: PantallaId
  peso: Peso
  motivo: string
  ejemplo: Fila
  n: number
}

const clases = new Map<string, Clase>()
const senaladas = new Map<PantallaId, number>()
/** Todo fijo salvo el status → ¿cambia la pantalla señalada? */
const porStatus = new Map<string, Map<LeadStatus, PantallaId>>()
let barridos = 0
let malos = 0
let malosActivos = 0

for (const { fila, input, postergacion } of estados()) {
  barridos += 1
  const posicion = derivarPantalla(input)
  const { actual } = posicion
  const peso: Peso = posicion.habilitadas.length > 0 ? 'activo' : 'terminal'
  senaladas.set(actual, (senaladas.get(actual) ?? 0) + 1)

  if (postergacion !== 'vencido') {
    const clave = JSON.stringify({ ...fila, status: '', postergacion: '' })
    const mapa = porStatus.get(clave) ?? new Map<LeadStatus, PantallaId>()
    mapa.set(fila.status, actual)
    porStatus.set(clave, mapa)
  }

  const veredicto = admite(actual, input, postergacion)
  if (veredicto.admite) continue
  malos += 1
  if (peso === 'activo') malosActivos += 1
  const k = `${fila.stage}|${fila.status}|${postergacion}|${actual}|${peso}|${veredicto.motivo}`
  const previo = clases.get(k)
  if (previo) {
    previo.n += 1
    continue
  }
  clases.set(k, {
    stage: fila.stage,
    status: fila.status,
    postergacion,
    senala: actual,
    peso,
    motivo: veredicto.motivo,
    ejemplo: fila,
    n: 1,
  })
}

const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s.padEnd(n))

console.log('')
console.log(`BARRIDO DE LA DERIVACIÓN — ${barridos} combinaciones`)
console.log(`la derivación recibe la postergación: ${POSTERGACION_EN_INPUT ? 'SÍ' : 'NO'}`)
console.log('')
console.log(
  `${pad('stage', 14)}${pad('status', 15)}${pad('pausa', 9)}${pad('señala', 8)}${pad('peso', 10)}${pad('n', 7)}por qué NO corresponde`,
)
console.log('-'.repeat(140))
const orden = [...clases.values()].sort(
  (a, b) => Number(b.peso === 'activo') - Number(a.peso === 'activo') || b.n - a.n,
)
for (const c of orden) {
  console.log(
    `${pad(c.stage, 14)}${pad(c.status, 15)}${pad(c.postergacion, 9)}${pad(c.senala, 8)}${pad(c.peso, 10)}${pad(String(c.n), 7)}${c.motivo}`,
  )
}
console.log('-'.repeat(140))
console.log('')
console.log(`-> combinaciones barridas:            ${barridos}`)
console.log(
  `-> señalan una pantalla NO admitida:  ${malos}  (${((malos / barridos) * 100).toFixed(1)}%)`,
)
console.log(
  `   de esas, como PASO DE AHORA:      ${malosActivos}  (badge «Tu paso ahora» + acción en la barra)`,
)
console.log(`   de esas, aterrizaje terminal:     ${malos - malosActivos}`)
console.log(`-> clases distintas de desacuerdo:    ${clases.size}`)
console.log('')
console.log('reparto de lo señalado:')
for (const [id, n] of [...senaladas.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`   ${pad(id, 10)} ${n}`)
}

// ── Pregunta 2: ¿qué combinaciones caen en un default de status? ────────────
let sensibles = 0
let ciegos = 0
const difiere = new Map<LeadStatus, number>()
for (const mapa of porStatus.values()) {
  const base = mapa.get('PROSPECTO')
  let cambia = false
  for (const [status, id] of mapa) {
    if (status === 'PROSPECTO') continue
    if (id === base) continue
    cambia = true
    difiere.set(status, (difiere.get(status) ?? 0) + 1)
  }
  if (cambia) sensibles += 1
  else ciegos += 1
}
console.log('')
console.log('CEGUERA AL STATUS (todo fijo salvo el status: ¿cambia la pantalla?)')
console.log(`   escenarios:                            ${porStatus.size}`)
console.log(`   donde ALGÚN status cambia la pantalla: ${sensibles}`)
console.log(`   donde NINGUNO la cambia:               ${ciegos}`)
for (const status of STATUSES) {
  if (status === 'PROSPECTO') continue
  console.log(`   ${pad(status, 16)} difiere de PROSPECTO en ${difiere.get(status) ?? 0} escenarios`)
}

const out = process.env.BARRIDO_OUT
if (out) {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(
    out,
    JSON.stringify(
      {
        barridos,
        malos,
        postergacionEnInput: POSTERGACION_EN_INPUT,
        clases: orden,
        senaladas: Object.fromEntries(senaladas),
        ceguera: { escenarios: porStatus.size, sensibles, ciegos },
      },
      null,
      2,
    ),
  )
  console.log(`\nJSON -> ${out}`)
}

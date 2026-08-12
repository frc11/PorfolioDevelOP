/**
 * Chequeo de invariante DEL TURNO — corre sin DB.
 *
 *   npm run check:invariant:turno
 *
 * El defecto que este invariante existe para impedir no fue un bug de lógica:
 * fue que tres pantallas independientes terminaron mostrando LA MISMA FRASE
 * («esperando respuesta del negocio») para dos turnos distintos. Eso no lo
 * atrapa el compilador, y no lo atrapa un test de una pantalla: cada una,
 * mirada sola, era correcta.
 *
 * Lo que se fija acá:
 *
 *   1. TOTALIDAD — toda situación tiene turno. Sobre el producto cartesiano
 *      completo de status × stage × acción-pendiente × finalUrl, `turnoDelLead`
 *      devuelve siempre uno de los tres turnos declarados. Un stage o un status
 *      nuevo no puede caer en un hueco sin dueño.
 *   2. TEXTO PROPIO — cada turno tiene sus tres textos, y ninguno vacío.
 *   3. NINGÚN TEXTO COMPARTIDO — dos turnos distintos NO pueden mostrar el mismo
 *      texto. Es la red de la corrida: si alguien vuelve a escribir la misma
 *      frase para «espera al negocio» y «espera a Franco», esto falla en rojo.
 *   4. LAS TRES SITUACIONES SON ALCANZABLES — los tres turnos salen de estados
 *      reales del producto. Un turno que nunca se deriva es un texto muerto.
 *   5. COHERENCIA CON LO QUE EL PRODUCTO YA DECIDIÓ — sin acción pendiente el
 *      turno JAMÁS es del setter (no se le inventa trabajo), y lo que es
 *      estructuralmente de Franco (revisión, link permanente, reunión, cierre)
 *      gana sobre cualquier acción pendiente: mientras la demo está en su cola,
 *      no hay nada que el setter destrabe.
 *   6. EL CASO QUE LO DELATÓ — aprobada + el negocio YA respondió + Franco
 *      todavía no cargó el link ⇒ turno de FRANCO, y su texto NO es el del
 *      negocio. Es exactamente la captura #29 del manual, fijada por ejecución.
 *
 * Importa el módulo puro directo (relativo, sin `@/`): `turno.ts` es una hoja
 * que solo trae tipos de Prisma, así que ts-node lo carga sin tsconfig-paths.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { TEXTO_TURNO, turnoDelLead, type Turno, type TurnoInput } from './turno.ts'

const TURNOS: readonly Turno[] = ['negocio', 'franco', 'setter']

// El universo real. Se escribe como `Record` sobre el enum de Prisma —no como
// lista suelta— para que el COMPILADOR exija la cobertura: un status o un stage
// nuevo deja el objeto incompleto y no compila, en vez de escaparse en silencio
// de la matriz y dejar sin ejercer la rama que lo derive.
const STATUS_UNIVERSO: Record<LeadStatus, true> = {
  PROSPECTO: true,
  DEMO_ENVIADA: true,
  VIO_VIDEO: true,
  RESPONDIO: true,
  CALL_AGENDADA: true,
  CERRADO: true,
  PERDIDO: true,
  POSTERGADO: true,
}
const STAGE_UNIVERSO: Record<DossierStage, true> = {
  FICHA: true,
  EVALUADA: true,
  BRIEF: true,
  CONSTRUCCION: true,
  EN_REVISION: true,
  APROBADA: true,
  RECHAZADA: true,
  DESCARTADA: true,
}
const STATUSES = Object.keys(STATUS_UNIVERSO) as LeadStatus[]
const STAGES: readonly (DossierStage | null)[] = [
  null,
  ...(Object.keys(STAGE_UNIVERSO) as DossierStage[]),
]
const FINAL_URLS: readonly (string | null | undefined)[] = [undefined, null, 'https://demo.dev']

/** Todas las combinaciones del universo — el barrido que ejerce la derivación. */
const MATRIZ: TurnoInput[] = []
for (const status of STATUSES) {
  for (const stage of STAGES) {
    for (const finalUrl of FINAL_URLS) {
      for (const accionPendiente of [true, false]) {
        MATRIZ.push({ status, stage, finalUrl, accionPendiente })
      }
    }
  }
}

// ── 1. Totalidad: toda situación tiene turno ────────────────────────────────
const derivados = new Set<Turno>()
for (const caso of MATRIZ) {
  const turno = turnoDelLead(caso)
  assert.ok(
    TURNOS.includes(turno),
    `turnoDelLead devolvió "${String(turno)}" —fuera de los tres turnos— para ` +
      `status=${caso.status} stage=${String(caso.stage)} finalUrl=${String(caso.finalUrl)} ` +
      `accionPendiente=${caso.accionPendiente}`,
  )
  derivados.add(turno)
}

// ── 2. Cada turno tiene sus tres textos, y ninguno vacío ────────────────────
for (const turno of TURNOS) {
  const texto = TEXTO_TURNO[turno]
  assert.ok(texto, `el turno "${turno}" no tiene texto en TEXTO_TURNO`)
  for (const [campo, valor] of Object.entries(texto)) {
    assert.ok(
      typeof valor === 'string' && valor.trim().length > 0,
      `TEXTO_TURNO.${turno}.${campo} está vacío — una espera sin palabras es la que obliga ` +
        'a leer una etiqueta al costado',
    )
  }
}

// ── 3. Dos turnos distintos NO pueden mostrar el mismo texto ────────────────
// Es la red del sprint. Se compara campo por campo Y en cruzado: que el `titulo`
// de uno no sea el `chip` de otro tampoco — el setter no lee nombres de campo,
// lee frases, y dos frases iguales en dos lugares vuelven a confundir el turno.
const vistos = new Map<string, string>()
for (const turno of TURNOS) {
  for (const [campo, valor] of Object.entries(TEXTO_TURNO[turno])) {
    const clave = valor.trim().toLocaleLowerCase('es')
    const duenio = vistos.get(clave)
    assert.ok(
      duenio === undefined || duenio.startsWith(`${turno}.`),
      `dos turnos distintos muestran el MISMO texto: ${duenio} y ${turno}.${campo} dicen ` +
        `«${valor}». Cada turno se nombra distinto — si no, el setter no puede saber a quién ` +
        'le toca sin leer otra cosa al lado.',
    )
    vistos.set(clave, `${turno}.${campo}`)
  }
}

// ── 4. Los tres turnos son alcanzables desde estados reales ─────────────────
for (const turno of TURNOS) {
  assert.ok(
    derivados.has(turno),
    `el turno "${turno}" no se deriva de ninguna situación real — es texto muerto`,
  )
}

// ── 5. Coherencia con lo que el producto ya decidió ─────────────────────────
for (const caso of MATRIZ) {
  const turno = turnoDelLead(caso)
  if (!caso.accionPendiente) {
    assert.notEqual(
      turno,
      'setter',
      `sin acción pendiente el turno no puede ser del setter (status=${caso.status} ` +
        `stage=${String(caso.stage)}): inventarle trabajo es tan malo como esconderlo`,
    )
  }
  const estructuralDeFranco =
    caso.status === 'CALL_AGENDADA' ||
    caso.status === 'CERRADO' ||
    caso.status === 'PERDIDO' ||
    caso.stage === 'DESCARTADA' ||
    caso.stage === 'EN_REVISION' ||
    (caso.stage === 'APROBADA' && caso.finalUrl === null)
  if (estructuralDeFranco) {
    assert.equal(
      turno,
      'franco',
      `lo que está en la cola de Franco es de Franco, aunque haya acción pendiente ` +
        `(status=${caso.status} stage=${String(caso.stage)} finalUrl=${String(caso.finalUrl)})`,
    )
  }
}

// ── 6. El caso que lo delató: aprobada, respondió, y sin el link de Franco ──
const capturaVeintinueve: TurnoInput = {
  status: 'RESPONDIO',
  stage: 'APROBADA',
  finalUrl: null,
  accionPendiente: false,
}
assert.equal(
  turnoDelLead(capturaVeintinueve),
  'franco',
  'aprobada + el negocio YA respondió + sin link permanente cargado es turno de FRANCO: ' +
    'mandar a esperar una respuesta que ya llegó es el hallazgo H-02 del manual',
)
assert.notEqual(
  TEXTO_TURNO.franco.titulo,
  TEXTO_TURNO.negocio.titulo,
  'el turno de Franco y el del negocio no pueden compartir titular',
)

// La contraparte, para que el caso de arriba no pase por casualidad: con el link
// cargado y el negocio sin responder, la pelota SÍ está afuera.
assert.equal(
  turnoDelLead({
    status: 'DEMO_ENVIADA',
    stage: 'APROBADA',
    finalUrl: 'https://demo.dev',
    accionPendiente: false,
  }),
  'negocio',
  'aprobada con link cargado y sin respuesta del negocio: la espera SÍ es del negocio',
)

console.log(
  '✓ invariante OK: el turno tiene un solo lugar donde se decide y cada situación tiene el ' +
    `suyo — las ${MATRIZ.length} combinaciones de status × stage × finalUrl × acción-pendiente ` +
    `derivan uno de los ${TURNOS.length} turnos, los tres son alcanzables, cada uno tiene sus ` +
    'tres textos y NINGÚN texto se comparte entre dos turnos. Sin acción pendiente el turno ' +
    'nunca es del setter, y lo que está en la cola de Franco (revisión, link permanente, ' +
    'reunión, cierre) es de Franco aunque haya acción pendiente: aprobada + respondió + sin ' +
    'link cargado se lee «le toca a Franco», no «esperando respuesta del negocio».',
)

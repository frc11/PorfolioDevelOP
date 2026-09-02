/**
 * Chequeo de invariante de los DESTINOS que el manual nombra — corre sin DB.
 *
 *   npm run check:invariant:enlaces
 *
 * El sprint que lo trajo censó las quince pantallas buscando una sola cosa: una
 * instrucción que nombra un lugar, un botón o una acción que desde ahí no se
 * alcanza. Estas dos reglas son las que se pueden AFIRMAR sin leer prosa.
 *
 * ── 1. Ningún enlace del manual rebota, y ninguno se gatea de más ────────────
 * Cada pantalla que ofrece el salto a otra declara acá su par (desde → destino)
 * con la condición en que ese salto se RENDERIZA y su garantía:
 *
 *   · `siempre`     — el destino está en la posición derivada en TODO estado
 *                     donde el salto se renderiza. El enlace puede ser directo.
 *   · `condicional` — hay al menos un estado donde NO está. El enlace tiene que
 *                     preguntar (`EnlacePantalla accesible={…}`): sin eso el
 *                     salto rebota en silencio contra el `redirect` de la
 *                     guardia de la página — el callejón con un paso más que
 *                     `EnlaceChequeoFinal` (P3) existe para no reintroducir.
 *
 * Se afirman las DOS direcciones sobre la derivación real, barriendo la matriz
 * de estados. La primera dirección es la que importa (un `siempre` que miente es
 * un enlace roto); la segunda evita que la tabla se vuelva decorativa — un
 * `condicional` que en realidad nunca falla deja viva una rama de copy que
 * ningún estado muestra.
 *
 * Esto ya pagó: el par mc1/mc2 → `mr` («Correcciones») se escribió `siempre`
 * porque RECHAZADA devuelve `mr` en `habilitadas`. Es falso — un lead PERDIDO
 * con el dossier en RECHAZADA cae a `archivo` (`posicionDe` corta por status
 * ANTES de derivar por stage), mc1/mc2 siguen navegables como completadas, y el
 * enlace habría rebotado. El invariante lo levantó antes de que saliera.
 *
 * ── 2. Ninguna guía manda a una fase que no es una pantalla ──────────────────
 * El colapso de pantallas dejó títulos de FASE que ya no nombran ningún lugar al
 * que se pueda ir: el rail, los títulos y los enlaces usan el nombre de la
 * PANTALLA. Una instrucción que dice «marcá "Respondió" en "Seguimiento"» manda
 * a buscar una pantalla que con ese nombre no existe — existe «Registrá lo que
 * pasó», y es el nombre que lleva el botón de al lado.
 *
 * El conjunto prohibido NO está escrito a mano: se DERIVA de tres registros — es
 * el de los títulos de `FASES_MANUAL` que no son también nombre de alguna
 * pantalla (`PANTALLAS`: título o corto) ni etiqueta de stage (`STAGE_LABELS`,
 * que sí se cita entre guillemets con toda razón: «el dossier pasa a
 * "Construcción"» habla de la etiqueta del badge, no de un destino). Si mañana
 * una pantalla se llama «Seguimiento», el conjunto se vacía solo y la regla se
 * afloja donde corresponde; si aparece una fase nueva sin pantalla ni stage
 * homónimos, entra sola.
 *
 * ALCANCE, dicho: el barrido 2 recorre los REGISTROS DE CONTENIDO exportados
 * (`guidance-content`, `herramientas`, `flow-content`) — las palabras que las
 * pantallas renderizan como guía. No recorre las literales sueltas en JSX (ahí
 * el nombre ya no se escribe a mano: `EnlacePantalla` lo lee de `PANTALLAS`), ni
 * el cartel del home (`paso.ts`), que es otra superficie.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { FASE_IDS, type FaseId } from './contracts.ts'
import * as CONTENIDO_FLOW from './flow-content.ts'
import { STAGE_LABELS } from './flow-content.ts'
import { gateEnvioDemo, leadRespondio } from './flow.ts'
import * as CONTENIDO_GUIA from './guidance-content.ts'
import { HERRAMIENTAS } from './herramientas.ts'
import {
  derivarPantalla,
  FASES_MANUAL,
  PANTALLAS,
  PANTALLAS_CONSTRUCCION,
  type DerivacionManualInput,
  type PantallaId,
  type PosicionManual,
} from './manual.ts'

// ── 1. Ningún enlace del manual rebota ───────────────────────────────────────

type Garantia = 'siempre' | 'condicional'

type EnlaceDeclarado = {
  /** Pantalla(s) que ofrecen el salto. */
  desde: readonly PantallaId[]
  destino: PantallaId
  /** En qué estados ESA pantalla renderiza el salto (además de ser accesible). */
  renderiza: (input: DerivacionManualInput) => boolean
  garantia: Garantia
  /** Dónde vive el enlace, para que el mensaje del fallo lleve al archivo. */
  donde: string
}

/**
 * Todos los saltos pantalla→pantalla que el manual ofrece hoy. Un enlace nuevo
 * que no entre acá queda sin red: es el renglón que cuesta agregarlo, y es el
 * punto.
 *
 * Fuera de la tabla a propósito: los saltos a `/setter` (salida del manual, no
 * es una pantalla del mapa) y el «Ir a tu paso actual» del bloque de avance
 * (apunta a `posicion.actual`, que la propia derivación garantiza accesible).
 */
const ENLACES: readonly EnlaceDeclarado[] = [
  {
    // Este sprint. El motivo del tilde nombraba «Correcciones» y no había un
    // solo control que la nombrara.
    desde: PANTALLAS_CONSTRUCCION,
    destino: 'mr',
    renderiza: (input) => input.stage === 'RECHAZADA',
    garantia: 'condicional',
    donde: 'MotivoDelTilde — m-construccion.tsx',
  },
  {
    // P3: el chequeo final se nombraba en varias pantallas y ninguna enlazaba.
    desde: [...PANTALLAS_CONSTRUCCION, 'm13'],
    destino: 'm14',
    renderiza: (input) => input.stage === 'CONSTRUCCION' && Boolean(input.draftUrl),
    garantia: 'condicional',
    donde: 'EnlaceChequeoFinal — enlace-chequeo.tsx (rama con borrador)',
  },
  {
    // La otra rama del MISMO enlace: sin borrador no ofrece el chequeo, lleva a
    // publicarlo. Las dos ramas son `condicional` por el mismo motivo: el bloque
    // que las monta se decide por STAGE y la posición se deriva antes por STATUS.
    desde: PANTALLAS_CONSTRUCCION,
    destino: 'm13',
    renderiza: (input) => input.stage === 'CONSTRUCCION' && !input.draftUrl,
    garantia: 'condicional',
    donde: 'EnlaceChequeoFinal — enlace-chequeo.tsx (rama sin borrador)',
  },
  // FUERA de la tabla, y dicho: m14 → m13 («Ir a publicar el borrador», la rama
  // sin `draftUrl` de `M14Registro`). Su condición de render es
  // `CONSTRUCCION ∧ ¬draftUrl`, y en ese estado m14 NO es accesible —
  // `posicionDe` habilita m13, y `completadasDe` marca m14 recién en
  // EN_REVISION/APROBADA—: es una rama defensiva que ningún estado alcanza (su
  // propio comentario lo dice: «la guardia del server no habilita m14 acá, pero
  // si se llega»). Declararla acá agregaba un renglón que no afirma nada; el
  // guard de «ejercitados > 0» de más abajo es el que no dejó que pasara.
  {
    // Este sprint. La munición decía «la reunión se agenda en "Agendá la
    // reunión"» desde que el negocio contesta, y m16 no se habilita hasta
    // APROBADA con la demo YA enviada.
    desde: ['m5'],
    destino: 'm16',
    renderiza: (input) => leadRespondio(input.status),
    garantia: 'condicional',
    donde: 'M5Municion — m5-seguimiento.tsx',
  },
  {
    // Este sprint. El resumen del opener decía «la conversación sigue en
    // "Seguimiento"» — el nombre de la fase, y sin enlace.
    desde: ['m4'],
    destino: 'm5',
    renderiza: (input) => input.contactos > 0,
    garantia: 'condicional',
    donde: 'OpenerResumen — opener-form.tsx',
  },
  {
    // 5.3: el «todavía no» del envío encausa a seguir la cadencia.
    desde: ['m15'],
    destino: 'm5',
    renderiza: (input) =>
      !input.demoEnviada &&
      !gateEnvioDemo({
        status: input.status,
        caliente: input.caliente,
        stage: input.stage,
        finalUrl: input.finalUrl,
      }),
    garantia: 'siempre',
    donde: 'M15Registro — m15-envio.tsx (gate cerrado)',
  },
  {
    // D15-bis. El descartado dejó de aterrizar en m2 (la pantalla del veredicto,
    // que además le pedía registrar lo que ya estaba registrado) y aterriza en el
    // archivo. El veredicto completo quedó en m1, la pantalla fusionada: el
    // archivo lo nombra y hay que poder llegar. Es 'siempre' y no puede no serlo:
    // DESCARTADA ∈ STAGES_POST_EVALUACION, así que `completadasDe` marca m1 en
    // todos los estados donde este enlace se renderiza.
    desde: ['archivo'],
    destino: 'm1',
    renderiza: (input) => input.stage === 'DESCARTADA',
    garantia: 'siempre',
    donde: 'ArchivoManual — archivo-manual.tsx (causa descartado)',
  },
  {
    // 5.5: la salida del gate de la agenda es marcar «Respondió» en m5.
    desde: ['m16'],
    destino: 'm5',
    renderiza: (input) =>
      input.status !== 'RESPONDIO' &&
      input.status !== 'CALL_AGENDADA' &&
      input.status !== 'CERRADO',
    garantia: 'siempre',
    donde: 'M16Registro — m16-agenda.tsx (gate cerrado)',
  },
]

const fichaConSenal = {
  igManejadoPor: 'DUENO',
  identidadNotas: 'firma la duena',
  presenciaDigital: 'IG activo',
  resenas: 'dos quejas por demora',
  contenidoReal: 'fotos propias',
  senalesOperativas: 'pedidos por DM',
  resenasUrl: '',
  imagenesUrl: '',
  otraRedUrl: '',
  queVende: '',
  comoSePresenta: '',
  otros: '',
} as unknown as DerivacionManualInput['ficha']

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
 * Todos los estados que la derivación distingue, barridos exhaustivamente.
 *
 * P19 sumó dos ejes, y no por completitud: son los dos que estrenaron rama
 * propia en `posicionDe`. `postergadoVencido` corta por status ANTES del stage
 * (un lead pausado aterriza en `espera`) y `hayRechazo` cambia el aterrizaje de
 * la construcción reabierta — dos destinos nuevos que los enlaces declarados
 * tienen que seguir alcanzando. Sin los ejes, el barrido pasaba en verde sin
 * haber visitado ninguna de las dos.
 */
function* estados(): Generator<DerivacionManualInput> {
  const progresos: FaseId[][] = [[], [...FASE_IDS], [FASE_IDS[0]!]]
  for (const stage of STAGES) {
    for (const status of STATUSES) {
      for (const caliente of [false, true]) {
        for (const draftUrl of [null, 'https://demo.netlify.app']) {
          for (const finalUrl of [null, 'https://demo.develop.ar']) {
            for (const demoEnviada of [false, true]) {
              for (const completadas of progresos) {
                for (const followUpVencido of [false, true]) {
                 for (const postergadoVencido of [false, true]) {
                  for (const hayRechazo of [false, true]) {
                  yield {
                    stage,
                    status,
                    caliente,
                    postergadoVencido,
                    hayRechazo,
                    ficha: fichaConSenal,
                    draftUrl,
                    progreso: { completadas },
                    agenda: null,
                    contactos: 1,
                    followUpCount: 1,
                    followUpVencido,
                    finalUrl,
                    demoEnviada,
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

const accesibleEn = (posicion: PosicionManual, id: PantallaId) =>
  posicion.completadas.includes(id) || posicion.habilitadas.includes(id)

/** Por enlace: en cuántos estados se ejercitó y en cuántos el destino faltó. */
const marcador = ENLACES.map(() => ({ ejercitados: 0, faltantes: 0 }))
let barridos = 0

for (const input of estados()) {
  barridos += 1
  const posicion = derivarPantalla(input)

  for (const [i, enlace] of ENLACES.entries()) {
    if (!enlace.renderiza(input)) continue
    for (const desde of enlace.desde) {
      if (!accesibleEn(posicion, desde)) continue
      const marca = marcador[i]!
      marca.ejercitados += 1
      if (accesibleEn(posicion, enlace.destino)) continue
      marca.faltantes += 1
      assert.ok(
        enlace.garantia === 'condicional',
        `enlace roto: desde "${PANTALLAS[desde].corto}" se ofrece el salto directo a ` +
          `"${PANTALLAS[enlace.destino].corto}", pero la derivacion no lo alcanza en ` +
          `stage=${String(input.stage)} status=${input.status} — el salto rebota contra la ` +
          `guardia de la pagina. O se gatea con EnlacePantalla accesible={...}, o se ` +
          `declara "condicional" acá. Origen: ${enlace.donde}`,
      )
    }
  }
}

assert.ok(barridos > 1000, `el barrido de estados se quedo corto (${barridos})`)

for (const [i, enlace] of ENLACES.entries()) {
  const marca = marcador[i]!
  assert.ok(
    marca.ejercitados > 0,
    `el enlace ${PANTALLAS[enlace.desde[0]!].corto} -> ` +
      `${PANTALLAS[enlace.destino].corto} no se ejercitó en ningún estado del barrido: su ` +
      `predicado "renderiza" dejó de matchear y la afirmación pasa en verde sin mirar nada. ` +
      `Origen: ${enlace.donde}`,
  )
  if (enlace.garantia !== 'condicional') continue
  assert.ok(
    marca.faltantes > 0,
    `el enlace ${PANTALLAS[enlace.desde[0]!].corto} -> ` +
      `${PANTALLAS[enlace.destino].corto} está declarado "condicional" pero el destino está ` +
      `accesible en los ${marca.ejercitados} estados donde se renderiza: la rama de copy ` +
      `"cuandoFalta" ya no la muestra ningún estado. Pasalo a "siempre" y sacá el gate. ` +
      `Origen: ${enlace.donde}`,
  )
}

// ── 2. Ninguna guía manda a una fase que no es una pantalla ──────────────────

const NOMBRES_DE_PANTALLA = new Set(
  Object.values(PANTALLAS).flatMap((def) => [def.titulo, def.corto]),
)
const ETIQUETAS_DE_STAGE = new Set<string>(Object.values(STAGE_LABELS))

/** Títulos de fase que no nombran ninguna pantalla ni ningún stage. */
const FASES_SIN_DESTINO = Object.values(FASES_MANUAL)
  .map((fase) => fase.titulo)
  .filter((titulo) => !NOMBRES_DE_PANTALLA.has(titulo) && !ETIQUETAS_DE_STAGE.has(titulo))

assert.ok(
  FASES_SIN_DESTINO.length > 0,
  'el conjunto prohibido quedo vacio: la regla 2 pasaria en verde sin mirar nada. Si de ' +
    'verdad toda fase nombra una pantalla o un stage, borra esta afirmacion en el mismo ' +
    'commit y deci por que.',
)

/** Cada fragmento entre guillemets de un registro de contenido, con su ruta. */
function* citas(nodo: unknown, ruta: string): Generator<{ cita: string; ruta: string }> {
  if (typeof nodo === 'string') {
    for (const match of nodo.matchAll(/«([^»]+)»/g)) {
      yield { cita: match[1]!, ruta }
    }
    return
  }
  if (Array.isArray(nodo)) {
    for (const [i, valor] of nodo.entries()) yield* citas(valor, `${ruta}[${i}]`)
    return
  }
  if (nodo && typeof nodo === 'object') {
    for (const [clave, valor] of Object.entries(nodo)) yield* citas(valor, `${ruta}.${clave}`)
  }
}

const REGISTROS: readonly [string, unknown][] = [
  ['guidance-content', CONTENIDO_GUIA],
  ['herramientas', HERRAMIENTAS],
  ['flow-content', CONTENIDO_FLOW],
]

let citasVistas = 0
for (const [nombre, registro] of REGISTROS) {
  for (const { cita, ruta } of citas(registro, nombre)) {
    citasVistas += 1
    assert.ok(
      !FASES_SIN_DESTINO.includes(cita),
      `"${cita}" es el titulo de una FASE y no el nombre de ninguna pantalla ni de ningun ` +
        `stage: quien lo lea va a buscar un lugar que con ese nombre no existe. Nombra la ` +
        `pantalla (PANTALLAS[...].titulo / .corto). En ${ruta}`,
    )
  }
}

assert.ok(
  citasVistas > 20,
  `el barrido de citas se quedo corto (${citasVistas}): el extractor dejo de matchear`,
)

console.log(
  `OK enlaces del manual — ${barridos} estados barridos, ${ENLACES.length} enlaces ` +
    `declarados (${marcador.reduce((n, m) => n + m.ejercitados, 0)} ejercicios), ` +
    `${citasVistas} citas revisadas contra [${FASES_SIN_DESTINO.join(', ')}]`,
)

/**
 * Chequeo de invariante de LA FRANJA DEL RECORRIDO (P20) — corre sin DB.
 *
 *   npm run check:invariant:recorrido
 *
 * La franja pinta nueve chips en las catorce pantallas, y cada chip que lleva
 * destino es un enlace. Tres cosas tienen que ser verdad en TODOS los estados
 * que la derivación admite, y ninguna se puede afirmar mirando una pantalla:
 *
 *   §1 · La lista de pasos es la del manual, entera y sin repetir. `FASES_EN_ORDEN`
 *        se proyecta de `ORDEN_MANUAL` en vez de escribirse a mano justamente
 *        para que no pueda divergir; esto lo afirma contra `FASES_MANUAL`, que
 *        es la otra punta.
 *   §2 · NINGÚN chip navega a donde el motor no deja. Es la regla del sprint y
 *        el defecto que este repo ya pagó cuatro veces: un salto a una pantalla
 *        no habilitada rebota en silencio contra el `redirect` de la guardia y
 *        el setter ve un callejón con un paso más. Se barre la matriz entera y
 *        se exige `destino ∈ completadas ∪ habilitadas` — el MISMO criterio de
 *        la guardia, no una copia.
 *   §3 · El paso marcado como el de AHORA sale del dato de P19 y de ningún otro:
 *        es la fase de `posicion.actual`, hay a lo sumo uno, y las pantallas de
 *        estado (que no tienen fase) no marcan ninguno.
 *
 * ── Por qué no puede pasar en verde sin mirar ────────────────────────────────
 * Un barrido que deja de producir estados afirma sobre cero casos y sale 0.
 * Contra eso hay tres dientes: el piso de estados barridos (§4), el piso de
 * ejercicios por ESTADO de paso —los cuatro tienen que ocurrir, si no la regla
 * §2 estaría afirmando sólo sobre chips alcanzables— y el par CONDUCTA/SABOTAJE
 * de §0, que le pasa a las tres reglas posiciones torcidas a propósito y exige
 * que las vea. Una de las dos torceduras es LITERALMENTE la forma de romperlo
 * que el sprint tenía que evitar: una franja que enlaza los nueve pasos siempre.
 *
 * Imports relativos y sin `@/` (patrón de `flow.ts`/`manual.ts`): así el harness
 * lo carga sin tsconfig-paths y sin DB.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { FASE_IDS, type FaseId } from './contracts.ts'
import {
  derivarPantalla,
  FASES_MANUAL,
  PANTALLAS,
  type DerivacionManualInput,
  type FaseManualId,
  type PantallaId,
  type PosicionManual,
} from './manual.ts'
import { derivarRecorrido, FASES_EN_ORDEN, type PasoRecorrido } from './recorrido.ts'

// ── §0 · El detector, probado contra sí mismo ────────────────────────────────

/** Las tres reglas, aplicadas a UNA posición. Devuelve los incumplimientos. */
function fallas(posicion: PosicionManual, viendo: PantallaId, pasos: PasoRecorrido[]) {
  const problemas: string[] = []
  const alcanzable = (id: PantallaId) =>
    posicion.completadas.includes(id) || posicion.habilitadas.includes(id)

  // §1 — la lista entera, sin repetir y en el orden del manual.
  if (pasos.length !== FASES_EN_ORDEN.length) {
    problemas.push(`la franja trae ${pasos.length} pasos y el manual tiene ${FASES_EN_ORDEN.length}`)
  }
  for (const [i, paso] of pasos.entries()) {
    if (paso.fase !== FASES_EN_ORDEN[i]) {
      problemas.push(`el paso ${i + 1} es "${paso.fase}" y el orden del manual dice "${FASES_EN_ORDEN[i]}"`)
    }
  }

  // §2 — ningún chip navega a donde el motor no deja.
  for (const paso of pasos) {
    if (paso.destino === null) continue
    if (!alcanzable(paso.destino)) {
      problemas.push(
        `el paso "${paso.titulo}" enlaza a "${PANTALLAS[paso.destino].corto}", que la ` +
          `derivacion no alcanza: el salto rebota contra la guardia de la pagina`,
      )
    }
  }

  // §3 — el paso de AHORA sale de `posicion.actual` y de ningún otro lado.
  const faseActual = PANTALLAS[posicion.actual].fase
  const marcados = pasos.filter((p) => p.estado === 'actual')
  if (marcados.length > 1) {
    problemas.push(`hay ${marcados.length} pasos marcados como el de ahora`)
  }
  const esperado = faseActual === null ? [] : [faseActual]
  const obtenido = marcados.map((p) => p.fase)
  if (esperado.join('|') !== obtenido.join('|')) {
    problemas.push(
      `el paso de ahora deberia ser [${esperado.join(',')}] (la fase de "${posicion.actual}") ` +
        `y la franja marca [${obtenido.join(',')}]`,
    )
  }
  // …y la marca de «lo estás mirando» sale de la pantalla que se renderiza.
  const faseVista = PANTALLAS[viendo].fase
  const viendoMarcado = pasos.filter((p) => p.viendo).map((p) => p.fase)
  const viendoEsperado = faseVista === null ? [] : [faseVista]
  if (viendoEsperado.join('|') !== viendoMarcado.join('|')) {
    problemas.push(
      `el "lo estas mirando" deberia ser [${viendoEsperado.join(',')}] y la franja marca ` +
        `[${viendoMarcado.join(',')}]`,
    )
  }

  return problemas
}

const POSICION_MUESTRA: PosicionManual = {
  actual: 'm6',
  completadas: ['m1', 'm4'],
  habilitadas: ['m6'],
}

// CONDUCTA — la franja real sobre una posición sana no tiene nada que reportar.
assert.deepEqual(
  fallas(POSICION_MUESTRA, 'm6', derivarRecorrido(POSICION_MUESTRA, 'm6')),
  [],
  '§0 conducta: la franja real sobre una posicion sana no puede tener incumplimientos',
)

// SABOTAJE A — la franja que enlaza los nueve pasos SIEMPRE. Es la forma exacta
// en que este sprint podía salir mal: nueve chips lindos, cuatro de los cuales
// rebotan contra la guardia.
const sabotajeEnlaceMuerto = derivarRecorrido(POSICION_MUESTRA, 'm6').map((p) => ({
  ...p,
  destino: FASES_MANUAL[p.fase].pantallas[0]!,
}))
assert.ok(
  fallas(POSICION_MUESTRA, 'm6', sabotajeEnlaceMuerto).some((f) => f.includes('rebota')),
  '§0 sabotaje A: una franja que enlaza los nueve pasos siempre TIENE que salir en rojo',
)

// SABOTAJE B — la franja que marca como paso de ahora la pantalla que estás
// MIRANDO en vez de donde está el lead. Es el otro error natural: dos datos
// parecidos, uno solo confiable (P19).
const sabotajeActualDelOjo = derivarRecorrido(POSICION_MUESTRA, 'm1').map((p) => ({
  ...p,
  estado: (p.viendo ? 'actual' : p.estado === 'actual' ? 'alcanzable' : p.estado) as PasoRecorrido['estado'],
}))
assert.ok(
  fallas(POSICION_MUESTRA, 'm1', sabotajeActualDelOjo).some((f) =>
    f.includes('el paso de ahora'),
  ),
  '§0 sabotaje B: marcar el paso de ahora con la pantalla que se mira TIENE que salir en rojo',
)

// ── §1 · La lista de pasos, contra la otra punta ─────────────────────────────

const FASES_DEL_REGISTRO = Object.keys(FASES_MANUAL) as FaseManualId[]
assert.equal(
  FASES_EN_ORDEN.length,
  FASES_DEL_REGISTRO.length,
  `FASES_EN_ORDEN tiene ${FASES_EN_ORDEN.length} pasos y FASES_MANUAL declara ` +
    `${FASES_DEL_REGISTRO.length}: la proyeccion de ORDEN_MANUAL dejo una fase afuera (o de ` +
    `mas). Una fase sin chip es un tramo del recorrido que la franja no muestra.`,
)
for (const fase of FASES_DEL_REGISTRO) {
  assert.equal(
    FASES_EN_ORDEN.filter((f) => f === fase).length,
    1,
    `la fase "${fase}" aparece ${FASES_EN_ORDEN.filter((f) => f === fase).length} veces en el ` +
      `recorrido: tiene que aparecer exactamente una`,
  )
}
assert.ok(
  FASES_EN_ORDEN.length >= 5,
  `el recorrido quedo en ${FASES_EN_ORDEN.length} pasos: eso no es un recorrido, es un piso que ` +
    `no se cumplio`,
)

// ── El censo de estados ──────────────────────────────────────────────────────

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

const FICHA = {
  igManejadoPor: 'DUENO',
  identidadNotas: 'firma la duena',
  presenciaDigital: 'IG activo',
  resenas: 'dos quejas por demora',
  contenidoReal: 'fotos propias',
  senalesOperativas: 'pedidos por DM',
} as unknown as DerivacionManualInput['ficha']

/**
 * Los ejes que mueven la POSICIÓN, que es lo único de lo que depende la franja.
 * Son los mismos de `enlaces-manual.invariant.ts` (incluidos los dos que P19
 * estrenó: la postergación vigente y el rechazo previo), porque los dos
 * chequeos barren el mismo espacio: el de `derivarPantalla`.
 */
function* estados(): Generator<DerivacionManualInput> {
  const progresos: FaseId[][] = [[], [...FASE_IDS], [FASE_IDS[0]!], [FASE_IDS[3]!]]
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
                      for (const contactos of [0, 1]) {
                        yield {
                          stage,
                          status,
                          caliente,
                          postergadoVencido,
                          hayRechazo,
                          ficha: FICHA,
                          draftUrl,
                          progreso: { completadas },
                          agenda: null,
                          contactos,
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
}

// ── §2 y §3 · El barrido ─────────────────────────────────────────────────────

/**
 * La franja se dibuja en la pantalla que el setter está mirando, y ésa no es
 * siempre la actual: las completadas quedan navegables. Se barren las dos
 * lecturas —la actual y una completada cuando la hay— porque `viendo` sale de
 * ahí y §3 lo afirma.
 */
let barridos = 0
let franjasVistas = 0
const porEstado: Record<PasoRecorrido['estado'], number> = {
  actual: 0,
  completado: 0,
  alcanzable: 0,
  futuro: 0,
}

for (const input of estados()) {
  barridos += 1
  const posicion = derivarPantalla(input)
  const miradas: PantallaId[] = [posicion.actual]
  const otra = posicion.completadas.find((id) => id !== posicion.actual)
  if (otra) miradas.push(otra)

  for (const viendo of miradas) {
    const pasos = derivarRecorrido(posicion, viendo)
    franjasVistas += 1
    for (const paso of pasos) porEstado[paso.estado] += 1
    const problemas = fallas(posicion, viendo, pasos)
    assert.deepEqual(
      problemas,
      [],
      `franja rota en stage=${String(input.stage)} status=${input.status} ` +
        `postergadoVencido=${input.postergadoVencido} hayRechazo=${input.hayRechazo} ` +
        `draftUrl=${input.draftUrl ? 'si' : 'no'} enviada=${input.demoEnviada} ` +
        `contactos=${input.contactos} · actual=${posicion.actual} viendo=${viendo}\n` +
        problemas.map((p) => `  - ${p}`).join('\n'),
    )
  }
}

// ── §4 · Los pisos, para que el verde no pueda ser vacío ─────────────────────

assert.ok(barridos > 10_000, `el barrido de estados se quedo corto (${barridos})`)
assert.ok(
  franjasVistas > barridos,
  `las franjas vistas (${franjasVistas}) no superaron los estados (${barridos}): la segunda ` +
    `lectura —la de una pantalla completada— dejo de ejercitarse y §3 ya no prueba que "lo ` +
    `estas mirando" salga de la pantalla renderizada`,
)
for (const [estado, veces] of Object.entries(porEstado)) {
  assert.ok(
    veces > 0,
    `ningun paso salio "${estado}" en las ${franjasVistas} franjas barridas: la regla §2 ` +
      `estaria afirmando sobre un solo tipo de chip`,
  )
}

console.log(
  `OK franja del recorrido — ${FASES_EN_ORDEN.length} pasos (${FASES_EN_ORDEN.join(' → ')}), ` +
    `${barridos} estados barridos, ${franjasVistas} franjas, ` +
    `${Object.entries(porEstado)
      .map(([k, v]) => `${k}=${v}`)
      .join(' · ')}`,
)

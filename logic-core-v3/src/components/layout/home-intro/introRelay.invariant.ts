import { sampleRelay, type IntroRelay } from './introRelay'
import { CALIBRATIONS, check, pct, report, s, section, sweep } from './introChecks'
import { sampleSwap } from './introSampling'
import { buildTimeline, HOME_INTRO_PHASES, type IntroTimeline } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA — **NADIE PUEDE QUEDARSE SIN DIBUJAR EL LOGO.**
 *
 *     npx tsx src/components/layout/home-intro/introRelay.invariant.ts
 *
 * ── Qué defecto custodia ───────────────────────────────────────────────────
 *
 * El logo del preloader desaparecía. La causa no era el destino —el vuelo llega
 * al píxel exacto donde la escena tiene su logo— sino que **desde `swapEndS` el
 * SVG valía 0 exacto y el mesh era el único que podía dibujar**, con un latch de
 * una sola vía que sólo se resetea yendo hacia atrás. Cualquier caída del 3D en
 * esa ventana convertía "el logo aterriza plano" en "el logo no está".
 *
 * Este archivo afirma la propiedad que lo hace imposible: **en todo instante y
 * en toda calibración, `mesh + svg = 1`, y si el mesh no pinta, `svg = 1`.**
 *
 * ── Por qué la regla vive en un módulo puro ────────────────────────────────
 *
 * Porque adentro de `useIntroChannels.ts` era un `useTransform` y no se podía
 * correr sin React. Sacarla a `introRelay.ts` es lo que permite barrer una
 * secuencia entera de cuadros —incluida una en la que el canvas se cae a mitad
 * del vuelo— sin montar nada. La misma costura que separa `introTimeline.ts` de
 * `introSampling.ts`.
 */

const EPS = 1e-12
const T = buildTimeline(HOME_INTRO_PHASES)

/** La regla VIEJA, tal cual estaba en `useIntroChannels.ts` antes de V3-A. */
function sampleRelayViejo(swap: number, latch: boolean | null, painted: boolean): IntroRelay {
  if (swap <= 0) return { mesh: 0, svg: 1, latch: null }
  const decided = latch === null ? painted : latch
  const mesh = decided ? swap : 0
  return { mesh, svg: 1 - mesh, latch: decided }
}

/**
 * Corre una secuencia entera de cuadros con una función de "¿está pintando?"
 * que puede cambiar en el camino, y devuelve el peor caso de cada propiedad.
 *
 * Es una simulación de cuadros y no una evaluación punto a punto **porque el
 * latch es estado**: la propiedad que interesa —que el SVG vuelva— sólo se
 * puede ver arrastrando el latch de un cuadro al siguiente, que es exactamente
 * lo que el `useTransform` hace en vivo.
 */
type Corrida = {
  /** El menor `mesh + svg` visto. Tiene que ser 1. */
  readonly menorCobertura: number
  /**
   * 🔴 **LA TINTA QUE DE VERDAD LLEGA A LA PANTALLA**, que es otra cosa que la
   * cobertura declarada: `svg + mesh × (el mesh está pintando)`. La regla vieja
   * mantenía la cobertura en 1 y **esto en 0**, porque le adjudicaba el logo
   * entero a una capa que no dibujaba. Es la cifra del defecto.
   */
  readonly menorTintaReal: number
  /** Cuántos cuadros dibujó el mesh. */
  readonly cuadrosDeMesh: number
  /** Cuántos cuadros dibujó el SVG entero. */
  readonly cuadrosDeSvgPleno: number
  /** Cuántos cuadros quedaron con la pantalla SIN logo. Tiene que ser 0. */
  readonly cuadrosSinNadie: number
}

function correr(
  timeline: IntroTimeline,
  pinta: (timeS: number) => boolean,
  regla: (swap: number, latch: boolean | null, painted: boolean) => IntroRelay = sampleRelay
): Corrida {
  let latch: boolean | null = null
  let menorCobertura = Infinity
  let menorTintaReal = Infinity
  let cuadrosDeMesh = 0
  let cuadrosDeSvgPleno = 0
  let cuadrosSinNadie = 0

  const CUADROS = 600
  for (let i = 0; i <= CUADROS; i += 1) {
    const progress = i / CUADROS
    const timeS = progress * timeline.totalS
    const painted = pinta(timeS)
    const relay = regla(sampleSwap(timeline, progress), latch, painted)
    latch = relay.latch

    const tintaReal = relay.svg + (painted ? relay.mesh : 0)
    menorCobertura = Math.min(menorCobertura, relay.mesh + relay.svg)
    menorTintaReal = Math.min(menorTintaReal, tintaReal)
    if (relay.mesh > 0) cuadrosDeMesh += 1
    if (relay.svg >= 1 - EPS) cuadrosDeSvgPleno += 1
    if (tintaReal <= EPS) cuadrosSinNadie += 1
  }

  return { menorCobertura, menorTintaReal, cuadrosDeMesh, cuadrosDeSvgPleno, cuadrosSinNadie }
}

const SIEMPRE = () => true
const NUNCA = () => false

// ── 1 · La propiedad, en las once calibraciones ─────────────────────────────

section('1 · alguien dibuja el logo SIEMPRE — las once calibraciones')

for (const [name, phases] of CALIBRATIONS) {
  const timeline = buildTimeline(phases)
  // Tres mundos: el mesh pinta siempre, no pinta nunca, y se cae a mitad del
  // acomodamiento, que es la ventana donde el defecto se veía.
  const seCae = (timeS: number) => timeS < timeline.placeStartS
  for (const [mundo, pinta] of [
    ['el mesh pinta', SIEMPRE],
    ['el mesh no llegó', NUNCA],
    ['el mesh se cae en el acomodamiento', seCae],
  ] as const) {
    const r = correr(timeline, pinta)
    check(
      `${name} · ${mundo} — las dos capas suman 1 en los 601 cuadros`,
      Math.abs(r.menorCobertura - 1) < EPS
    )
    check(
      `${name} · ${mundo} — y la tinta que LLEGA a la pantalla nunca baja de 1`,
      r.menorTintaReal >= 1 - EPS && r.cuadrosSinNadie === 0,
      `menor tinta real ${r.menorTintaReal.toFixed(4)} · ${r.cuadrosSinNadie} cuadros sin nadie`
    )
  }
}

// ── 2 · Las dos vías del latch ──────────────────────────────────────────────

section('2 · el latch protege la subida y ya NO clava la bajada')

const subida = correr(T, (timeS) => timeS >= T.swapStartS + 0.05)
check(
  'el mesh que llega tarde NO aparece de golpe a mitad del cruce',
  subida.cuadrosDeMesh === 0,
  `${subida.cuadrosDeMesh} cuadros de mesh · el latch se tomó en ${s(T.swapStartS)} y el mesh llegó 0,050 s después`
)

const bajada = correr(T, (timeS) => timeS < T.placeStartS)
check(
  'y el mesh que se cae DEVUELVE el logo al SVG',
  bajada.cuadrosDeSvgPleno > 0 && bajada.cuadrosDeMesh > 0,
  `${bajada.cuadrosDeMesh} cuadros de mesh · ${bajada.cuadrosDeSvgPleno} cuadros de SVG pleno`
)

const enteros = correr(T, SIEMPRE)
check(
  'con el mesh sano el relevo no cambió: el mesh toma el logo y no lo suelta',
  enteros.cuadrosDeMesh > 0 && enteros.menorTintaReal >= 1 - EPS,
  `${enteros.cuadrosDeMesh} de 601 cuadros con mesh`
)

// ── 3 · Volver hacia atrás rearma la pregunta (el scrub del controlador) ────

section('3 · el scrub hacia atrás rearma el relevo')

const antesDelCruce = sampleRelay(0, true, true)
check('antes del cruce el mesh no dibuja', antesDelCruce.mesh === 0 && antesDelCruce.svg === 1)
check('y el latch se rearma', antesDelCruce.latch === null)

// ── 4 · La ventana que el defecto ocupaba, en segundos ──────────────────────

section('4 · la ventana en la que el mesh era el único que podía dibujar')

let soloMeshS = 0
sweep((progress) => {
  if (sampleSwap(T, progress) >= 1 - EPS) soloMeshS += T.totalS / 600
})
check(
  '🔴 el SVG valía 0 exacto durante casi toda la segunda mitad de la secuencia',
  soloMeshS > 4 && soloMeshS < 4.5,
  `${s(soloMeshS)} de ${s(T.totalS)} — ${pct(soloMeshS / T.totalS)} del reel, y el acomodamiento entero`
)
check(
  '  y el acomodamiento cae adentro de esa ventana, de punta a punta',
  T.placeStartS > T.swapEndS,
  `relevo cierra en ${s(T.swapEndS)} · el acomodamiento va de ${s(T.placeStartS)} a ${s(T.totalS)}`
)

// ── Controles positivos ─────────────────────────────────────────────────────

section('Que estas comprobaciones puedan fallar')

const viejoSeCae = correr(T, (timeS) => timeS < T.placeStartS, sampleRelayViejo)
check(
  '🔴 control positivo — con la regla VIEJA y el mismo mundo, la pantalla se queda SIN LOGO',
  viejoSeCae.menorTintaReal <= EPS && viejoSeCae.cuadrosSinNadie > 0,
  `${viejoSeCae.cuadrosSinNadie} de 601 cuadros sin nadie que dibuje (tinta real ${viejoSeCae.menorTintaReal.toFixed(4)}) — con la regla nueva son ${bajada.cuadrosSinNadie}`
)
check(
  'control positivo — y esa regla vieja jamás devuelve el logo al SVG',
  viejoSeCae.cuadrosDeSvgPleno < bajada.cuadrosDeSvgPleno,
  `vieja ${viejoSeCae.cuadrosDeSvgPleno} cuadros de SVG pleno contra ${bajada.cuadrosDeSvgPleno} de la nueva`
)

const viejoNunca = correr(T, NUNCA, sampleRelayViejo)
check(
  'control positivo — la regla vieja SÍ cubría el caso que documentaba (el chunk que no llega)',
  viejoNunca.menorTintaReal >= 1 - EPS && viejoNunca.cuadrosDeMesh === 0,
  'el defecto era el OTRO modo de falla: el chunk que llega y el canvas que no dibuja'
)

check(
  'control positivo — el simulador distingue los tres mundos y no devuelve lo mismo siempre',
  enteros.cuadrosDeMesh !== bajada.cuadrosDeMesh &&
    bajada.cuadrosDeMesh !== correr(T, NUNCA).cuadrosDeMesh,
  `sano ${enteros.cuadrosDeMesh} · se cae ${bajada.cuadrosDeMesh} · nunca ${correr(T, NUNCA).cuadrosDeMesh}`
)

report('introRelay')

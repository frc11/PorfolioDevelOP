/**
 * INVARIANTE — EL TECHO DE VELOCIDAD DE LA CÁMARA (B2 §0.2).
 *
 * Corre con `npm run test:s16-techo`.
 *
 * ── Qué custodia ───────────────────────────────────────────────────────────
 *
 * `techoDeVelocidad.ts` publica un número —**1,0 altura de cuadro por pantalla
 * de scroll**— y una regla: ningún segmento del recorrido puede pasarlo. Este
 * archivo **integra el arco real de la cámara** con el mismo instrumento que ya
 * usa `s13b-soporte.ts` (`speedAt`, del arnés del probe), lo divide por las
 * pantallas que el reparto le da a cada segmento, y compara.
 *
 * ⚠ **DOS SEGMENTOS NO CUMPLEN, Y ESTÁN DECLARADOS ACÁ CON SU CAUSA.** No se
 * aflojó el techo para que dieran verde: se declara la lista de incumplidores y
 * **se afirma que es exactamente ésa** —ni uno más, ni uno menos—, así que el
 * día que uno se arregle o aparezca otro, esto se pone rojo. Un techo con una
 * excepción sin nombre es un techo que no existe.
 *
 * ── Por qué la unidad es la PANTALLA y no el progreso ─────────────────────
 *
 * Porque el humano no controla el progreso: controla el SCROLL. `s13b-soporte`
 * ya lo dejó escrito, y es lo que hace que el mismo número de alturas por unidad
 * de progreso se sienta diez veces más rápido en un tramo que en otro. El
 * porqué entero, con la queja que lo origina y las dos derivaciones del valor,
 * está en `techoDeVelocidad.ts` y en `docs/rediseno/sprints/B2-DELTAS.md` §2.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { cameraAt, emptyPose, frameHeight, makeTrack } from '@/app/probe-escena/__tests__/harness'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { SECCIONES } from '../../secciones'
import { CHOREO_KEYFRAMES } from '../choreography'
import { ANCLAJE } from '../anclaje'
import { RITMO_POR_SEGMENTO, progresoDePantalla } from '../recorrido'
import { TECHO_DE_VELOCIDAD } from '../techoDeVelocidad'

const PISTA = makeTrack(CHOREO_KEYFRAMES)
const PASOS = 20000

/**
 * EL ARCO DE LA CÁMARA, acumulado sobre [0, p], en alturas de cuadro.
 *
 * Es la integral de `speedAt`, y se calcula con la MISMA normalización que
 * aquélla —`frameHeight` a la distancia media del paso— para que las dos cifras
 * sean la misma magnitud. No se copia una constante de FOV: se importa
 * `frameHeight` del arnés, que es de donde sale la de `speedAt`.
 */
function arcoAcumulado(): readonly number[] {
  const pose = emptyPose()
  const s: number[] = [0]
  let acumulado = 0
  let anterior = cameraAt(PISTA, 0, 16 / 9, pose)
  let posAnterior: [number, number, number] = [anterior.position[0], anterior.position[1], anterior.position[2]]
  let dAnterior = anterior.pose.distance
  for (let i = 1; i <= PASOS; i += 1) {
    const c = cameraAt(PISTA, i / PASOS, 16 / 9, pose)
    const d = Math.hypot(
      c.position[0] - posAnterior[0],
      c.position[1] - posAnterior[1],
      c.position[2] - posAnterior[2],
    )
    acumulado += d / frameHeight((dAnterior + c.pose.distance) / 2)
    s.push(acumulado)
    posAnterior = [c.position[0], c.position[1], c.position[2]]
    dAnterior = c.pose.distance
  }
  return s
}

const ARCO = arcoAcumulado()
const enProgreso = (p: number): number => ARCO[Math.min(PASOS, Math.max(0, Math.round(p * PASOS)))]
const TOTAL = ARCO[ARCO.length - 1]

export interface VelocidadDeSegmento {
  readonly tramo: string
  readonly pantallas: number
  readonly arco: number
  readonly porPantalla: number
  readonly pantallasQuePide: number
}

/** El arco y la velocidad de cada segmento, en la unidad de la PANTALLA. */
export function velocidadPorSegmento(techo: number): readonly VelocidadDeSegmento[] {
  return RITMO_POR_SEGMENTO.map((r) => {
    const arco = enProgreso(progresoDePantalla(r.hastaPantalla)) - enProgreso(progresoDePantalla(r.desdePantalla))
    return {
      tramo: r.tramo,
      pantallas: r.pantallas,
      arco,
      porPantalla: arco / r.pantallas,
      pantallasQuePide: arco / techo,
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El techo, y las DOS derivaciones que lo eligen')

afirmarIgual(TECHO_DE_VELOCIDAD, 1, 'el techo es UNA altura de cuadro por pantalla de scroll')

/**
 * ⚠ **LA PRIMERA DERIVACIÓN ES UNA IDENTIDAD Y SE ESCRIBE COMO TAL.** Scrollear
 * una pantalla mueve la página exactamente una pantalla: en la unidad de este
 * techo, la página corre a 1,0. No hay nada que medir ahí — lo que hace falta es
 * que quede dicho que el techo ES esa velocidad y no una fracción elegida.
 */
const RITMO_DE_LA_PAGINA = 1
afirmarIgual(
  TECHO_DE_VELOCIDAD,
  RITMO_DE_LA_PAGINA,
  '  derivación 1 · es el ritmo de la propia página: una pantalla de scroll mueve la página una pantalla',
)

const parejo = TOTAL / ANCLAJE.pantallasDeScroll
console.log(
  `  el arco entero de la cámara mide ${TOTAL.toFixed(2)} alturas de cuadro sobre ${ANCLAJE.pantallasDeScroll} pantallas de scroll`,
)
/**
 * ⚠ **LA SEGUNDA DERIVACIÓN SE AFIRMA COMO DESIGUALDAD Y NO COMO CERCANÍA, y el
 * motivo importa.** Cuando B2 eligió el techo, el ritmo parejo del recorrido
 * valía **0,9451** sobre las 13 pantallas de scroll de la tabla de entonces: a
 * 5,8 % del techo, y ésa fue la corroboración. **Aplicar el techo estiró el
 * documento**, así que el ritmo parejo bajó —hoy es el de abajo— y una
 * afirmación de «cae cerca» tendría que aflojarse cada vez que el documento
 * crece. La propiedad que NO cambia, y que es la que hace falta, es que el techo
 * **no sea más apretado que el promedio del propio recorrido**: si lo fuera, el
 * techo sería inalcanzable por construcción y no habría reparto que lo cumpla.
 */
afirmar(
  parejo <= TECHO_DE_VELOCIDAD,
  '  derivación 2 · el ritmo PAREJO del propio recorrido está por debajo del techo: el techo es alcanzable, no un imposible',
  `${parejo.toFixed(4)} contra ${TECHO_DE_VELOCIDAD} — cuando B2 lo eligió valía 0,9451 sobre 13 pantallas de scroll, a 5,8 % del techo`,
)
controlPositivo(
  'la desigualdad NO se cumple sola: con el arco al doble, el ritmo parejo pasaría el techo',
  2 * TOTAL,
  (t: number) => t / ANCLAJE.pantallasDeScroll <= TECHO_DE_VELOCIDAD,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los seis segmentos, medidos')

const V = velocidadPorSegmento(TECHO_DE_VELOCIDAD)
console.log('  segmento          pantallas   arco(fh)   fh/pantalla   pide')
for (const v of V) {
  console.log(
    `  ${v.tramo.padEnd(16)} ${v.pantallas.toFixed(3).padStart(9)}  ${v.arco.toFixed(3).padStart(8)}  ` +
      `${v.porPantalla.toFixed(4).padStart(11)}  ${v.pantallasQuePide.toFixed(3).padStart(6)}` +
      `   ${v.porPantalla <= TECHO_DE_VELOCIDAD ? 'cumple' : '❌ SE PASA'}`,
  )
}

afirmar(
  V.every((v) => v.arco > 0 && v.pantallas > 0),
  'los seis segmentos tienen arco y pantallas: la medición no corrió sobre el vacío',
)
afirmar(
  Math.abs(V.reduce((n, v) => n + v.arco, 0) - TOTAL) < 1e-6,
  '  y los seis arcos suman el arco entero: el reparto cubre el recorrido sin huecos ni solapes',
  `${V.reduce((n, v) => n + v.arco, 0).toFixed(4)} contra ${TOTAL.toFixed(4)}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Quiénes cumplen, y LOS DOS QUE NO, con su causa')

/**
 * LOS INCUMPLIDORES DECLARADOS. La lista es cerrada y se afirma por igualdad:
 * un segmento que se arregle y no salga de acá pone esto en rojo, y uno que
 * empiece a pasarse y no esté acá también. **Es lo que impide que «hay
 * excepciones» se vuelva una excusa sin nombre.**
 */
const NO_CUMPLEN: readonly { readonly tramo: string; readonly porQue: string }[] = [
  {
    tramo: 'hero',
    porQue:
      'pide 2 pantallas y tiene 1. El alto del hero esta trabado: `s8-chrome.invariant.ts` afirma ' +
      '`pantallasDe(primera) === 1` porque de ahi sale el nacimiento de la pastilla de navegacion ' +
      '(100svh - 72px). Subirlo a 200svh no mueve la pastilla —vive en un envoltorio de alto cero— ' +
      'pero la saca del pie del hero, y eso es una decision del chrome y no de este bloque.',
  },
  {
    tramo: 'cierre',
    porQue:
      'pide 2,253 pantallas y tiene 1,695. Ese largo NO es libre: vale exactamente ' +
      '1,694915 x (pantallas de por-que-develop), fijado por el ancla declarada 0,8525; y ' +
      'por-que-develop no puede crecer sin mover el ancla de tu-panel, porque servicios:tu-panel:' +
      'por-que-develop tiene que quedarse en 3:2:1. La derivacion, en B2-DELTAS.md §5.',
  },
]

afirmarIgual(
  V.filter((v) => v.porPantalla > TECHO_DE_VELOCIDAD).map((v) => v.tramo),
  NO_CUMPLEN.map((n) => n.tramo),
  'los segmentos que se pasan del techo son EXACTAMENTE los dos declarados',
)
for (const n of NO_CUMPLEN) {
  const v = V.find((x) => x.tramo === n.tramo)
  afirmar(
    v !== undefined,
    `  \`${n.tramo}\` se pasa, y su causa está escrita`,
    v === undefined ? '' : `${v.porPantalla.toFixed(4)} contra ${TECHO_DE_VELOCIDAD} — ${n.porQue}`,
  )
}
afirmar(
  V.filter((v) => v.porPantalla <= TECHO_DE_VELOCIDAD).length === V.length - NO_CUMPLEN.length,
  `  y los otros ${V.length - NO_CUMPLEN.length} cumplen`,
  V.filter((v) => v.porPantalla <= TECHO_DE_VELOCIDAD)
    .map((v) => `${v.tramo} ${v.porPantalla.toFixed(4)}`)
    .join(' · '),
)
controlPositivo(
  'el detector de incumplidores NO es una lista vacía: con el techo en la décima parte se pasan los seis',
  TECHO_DE_VELOCIDAD / 10,
  (techo: number) => velocidadPorSegmento(techo).every((v) => v.porPantalla <= techo),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las dos trabas, afirmadas contra la PROPIEDAD y no contra la prosa')

/** La afirmación del chrome que traba el alto del hero, leída del fuente. */
const RUTA_CHROME = 'src/app/v3/_chrome/__tests__/s8-chrome.invariant.ts'
const FUENTE_CHROME = readFileSync(path.join(process.cwd(), RUTA_CHROME), 'utf8').replace(/\r\n/g, '\n')
const trabaElHero = (fuente: string): boolean => /afirmarIgual\(pantallasDe\(primera\),\s*1,/.test(fuente)
afirmar(
  trabaElHero(FUENTE_CHROME),
  'TRABA 1 — `s8-chrome.invariant.ts` sigue afirmando que la primera sección mide UNA pantalla',
  `${RUTA_CHROME} · es lo que impide darle al hero las 2 pantallas que su arco pide`,
)
controlPositivo(
  'y el lector de esa traba no da verde sobre un fuente que no la tiene',
  'afirmarIgual(pantallasDe(primera), 2, "dos pantallas")',
  trabaElHero,
)

/**
 * La segunda traba es aritmética y se comprueba como tal: el largo del segmento
 * `cierre` es `1,694915 × (pantallas de por-que-develop)`, y ese factor sale del
 * ancla declarada, no de una constante escrita acá.
 */
const pantallasDePqd =
  (ANCLAJE.geometria.find((g) => g.id === 'por-que-develop')?.altoEnPantallas ?? 0)
const segmentoDelCierre = V[V.length - 1].pantallas
const FACTOR = segmentoDelCierre / pantallasDePqd
afirmar(
  Math.abs(FACTOR - 1.694915254237288) < 1e-9,
  'TRABA 2 — el segmento `cierre` mide 1,694915 × las pantallas de `por-que-develop`',
  `${segmentoDelCierre.toFixed(6)} / ${pantallasDePqd} = ${FACTOR.toFixed(9)} — el factor sale del ancla declarada, no de una constante`,
)
afirmar(
  pantallasDePqd * FACTOR < V[V.length - 1].pantallasQuePide,
  '  y con `por-que-develop` en una pantalla ese segmento NO alcanza lo que su arco pide',
  `${segmentoDelCierre.toFixed(3)} contra ${V[V.length - 1].pantallasQuePide.toFixed(3)} pantallas`,
)
afirmarIgual(
  SECCIONES.filter((s) => ['servicios', 'tu-panel', 'por-que-develop'].includes(s.id)).map((s) => s.alto),
  ['300svh', '200svh', '100svh'],
  '  y la razón 3:2:1 que lo fija sigue declarada en la tabla',
)

cerrar('s16-techo.invariant')

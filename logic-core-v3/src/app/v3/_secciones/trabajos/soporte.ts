/**
 * EL ARNÉS DE `trabajos.invariant` — lo que se lee del disco, y nada más.
 *
 * ── Por qué existe (B1) ───────────────────────────────────────────────────
 *
 * Porque `trabajos.invariant.tsx` pasó las 300 líneas y la regla del proyecto es
 * que se parte, no que se afloja. El corte no es por tamaño: es el mismo que
 * `cierre/soporte.ts` ya tiene, y separa **la plomería** —abrir archivos,
 * componer rutas, derivar colores del tema— de **las afirmaciones**, que son lo
 * que alguien lee cuando quiere saber qué protege el invariante.
 *
 * ⚠ **El montaje de las tres ramas NO se mudó acá, y es deliberado.** Renderizar
 * la sección con la compuerta abierta, cerrada y con la preferencia puesta es
 * parte de lo que el invariante AFIRMA —las tres ramas y sus diferencias son el
 * sujeto—, y sacarlo lo dejaría hablando de un HTML que no se ve producir.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { acotar01 } from '../../_lib/acotar'
import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { valoresDePieza } from '../../_lib/motion/fotograma'
import { PATRONES } from '../../_lib/motion/patrones'
import { ALTO_DE_CALIBRACION, FUSION_DEL_CENSO } from '../_contrato/asentamiento'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { especificacionDe } from '../_contrato/bloqueAnimado'

import { GEOMETRIA, MESETA, localDelPlano } from './geometria'
// prettier-ignore
import { MUESTRAS_DEL_REPARTO, aterrizajesMedidos, desviosDelContrato, repartoMonotono, separacionMinima, type RepartoDePlanos } from './trabajos-piezas'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/** Un archivo del disco, relativo a esta carpeta. */
export const leer = (relativa: string): string => readFileSync(path.join(AQUI, relativa), 'utf8')

/** El archivo real de una captura: la ruta del contenido es de la web. */
export const abrirCaptura = (rutaWeb: string): Uint8Array =>
  readFileSync(path.join(AQUI, '../../../../..', 'public', rutaWeb))

/**
 * Los DOS archivos que llegan al navegador. **El invariante queda afuera a
 * propósito**: lleva adentro el literal `three` como entrada del control
 * positivo del detector, y no se despacha — incluirlo daría un rojo producido
 * por la propia comprobación.
 */
export const FUENTES: readonly { readonly archivo: string; readonly texto: string }[] = [
  'Trabajos.tsx',
  'geometria.ts',
  'asentamiento.ts',
  'contenido.ts',
].map((f) => ({ archivo: f, texto: leer(f) }))

/** El CSS del tema, de donde salen el fondo invertido, la tinta y los acentos. */
export const CSS = leer('../../../theme-develop.css')

/** El fuente de `Panel.tsx`, para el puente del atributo del panel (§1b). */
export const FUENTE_DEL_PANEL = leer('../../_componentes/Panel.tsx')

const IMPORTA_3D = /from\s+['"](three(\/[^'"]*)?|drei|@react-three\/[^'"]+)['"]/

/** Si un fuente NO importa un motor 3D. El efecto de P7 es HTML con perspectiva. */
export const sinTres = (src: string): boolean => !IMPORTA_3D.test(src)

/** Cuántas veces aparece una aguja en un HTML. */
export const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

/**
 * ═══ B4-A · EL BARRIDO DEL PIN — ¿queda algún cuadro sin un solo plano? ═════
 *
 * ── Por qué vive acá y no en `trabajos-piezas.ts` ─────────────────────────
 *
 * Porque para saber si un plano se VE hay que pasar su progreso local por el
 * fotograma de P7 —`autoAlpha` sale de las claves del patrón, no del reparto— y
 * eso pide importar `PATRONES` y `valoresDePieza` de `_lib/motion/`.
 * `trabajos-piezas.ts` cuenta como PRODUCTO para `s7-contrato` §3 y no puede;
 * este archivo es un **módulo de apoyo declarado** (`soporte.ts`), lo consume
 * sólo el invariante y no viaja al navegador. La regla no se toca.
 *
 * ── Qué barre, y por qué el rango sale derivado ──────────────────────────
 *
 * El ancla de P7 sobre la `<section>` es `top bottom → bottom bottom`, así que
 * el recorrido arranca con la sección entrando por el pie del viewport y cierra
 * cuando el pin suelta. **El pin es el último `(pantallas − 1) / pantallas` de
 * ese recorrido**: empieza cuando la sección toca el tope. De ahí sale
 * `PROGRESO_DEL_PIN`, sin un número escrito.
 *
 * Antes de B4-A este barrido devolvía tres progresos —los dos bordes de tramo
 * que B2 publicó y el cierre del recorrido, que no estaba reportado—. Es el
 * control positivo del detector: con el reparto viejo TIENE que encontrarlos.
 */

/** Dónde arranca el pin, como fracción del recorrido de P7. Derivado del alto
 *  declarado: una sección de N pantallas con un hijo de una queda clavada N−1. */
export function progresoDelPin(pantallas: number): number {
  return 1 / pantallas
}

/** El `autoAlpha` que P7 le escribe a un plano con ese progreso local. */
export function alphaDelPlano(local: number): number {
  const valores = valoresDePieza(especificacionDe(PATRONES.P7, 1), 0, local) as {
    readonly autoAlpha?: number
  }
  return valores.autoAlpha ?? 0
}

/**
 * Los puntos del recorrido —desde `desde` hasta 1— donde **ningún** plano tiene
 * tinta. Vacío es la propiedad que la instrucción pide: *ningún instante con
 * los tres invisibles*.
 */
export function cuadrosSinNingunPlano(
  reparto: RepartoDePlanos,
  planos: number,
  desde: number,
  muestras = 1081,
): number[] {
  const apagados: number[] = []
  for (let k = 0; k < muestras; k += 1) {
    const p = desde + ((1 - desde) * k) / (muestras - 1)
    let mayor = 0
    for (let i = 0; i < planos; i += 1) mayor = Math.max(mayor, alphaDelPlano(reparto(p, i)))
    if (mayor <= 0) apagados.push(p)
  }
  return apagados
}

/**
 * LA MESETA DE CADA PLANO, medida sobre la función real: el tramo del recorrido
 * más largo donde su progreso local **no cambia** y está entre 0 y 1, o sea
 * pintado y quieto. Es lo que un acontecimiento del censo de `B2-DELTAS.md` §0
 * es: un lugar donde algo termina de cambiar y se queda.
 *
 * Devuelve `null` para un plano sin meseta —el caso de antes de B4-A, donde la
 * llegada y la salida se tocaban sin banda quieta en el medio— para que la
 * ausencia sea un valor y no un cero que se confunda con una meseta de largo 0.
 */
export function mesetasMedidas(
  reparto: RepartoDePlanos,
  planos: number,
  muestras: number = MUESTRAS_DEL_REPARTO,
): ({ desde: number; hasta: number } | null)[] {
  const salida: ({ desde: number; hasta: number } | null)[] = []
  for (let i = 0; i < planos; i += 1) {
    let mejor: { desde: number; hasta: number } | null = null
    let desde: number | null = null
    let anterior = Number.NaN
    for (let k = 0; k < muestras; k += 1) {
      const p = k / (muestras - 1)
      const v = reparto(p, i)
      const quieto = v === anterior && v > 0 && v < 1
      if (quieto) {
        desde ??= (k - 1) / (muestras - 1)
        const largo = p - desde
        if (mejor === null || largo > mejor.hasta - mejor.desde) mejor = { desde, hasta: p }
      } else {
        desde = null
      }
      anterior = v
    }
    salida.push(mejor)
  }
  return salida
}

/** El reparto de B2 —tercios acotados arriba, sin meseta—, que es el control
 *  positivo de todo §16: el barrido TIENE que encontrarle los cuadros vacíos. */
const REPARTO_DE_B2: RepartoDePlanos = (p, i) => acotar01(acotar01(p) * GEOMETRIA.planos - i)

/**
 * El `scrollY` de un progreso a 1920×1080, para poder leer los números al lado
 * de los que B2 publicó. **El tope de la sección está MEDIDO en el navegador**
 * (puerto 3001, `[data-panel="trabajos"]`, `top` 8640 con el documento en
 * 19440); ninguna afirmación lo mira, sólo los `console.log`.
 */
const TOPE_MEDIDO_PX = 8640
const aY = (p: number): number =>
  Math.round(TOPE_MEDIDO_PX + (p * PANTALLAS - 1) * ALTO_DE_CALIBRACION)

const PANTALLAS = pantallasDe(seccionDe('trabajos'))

/**
 * §16 DEL INVARIANTE — la meseta: cada proyecto llega, SE QUEDA, y sale.
 *
 * Vive con su barrido y no con las otras quince afirmaciones por la misma razón
 * que §8 de `s10-mobile` vive con su modelo: la comprobación y la aritmética que
 * la sostiene son la misma pieza. Y además por una regla: el barrido necesita el
 * fotograma de P7, que el invariante —producto para `s7-contrato` §3— no puede
 * importar y este módulo de apoyo sí.
 */
export function afirmarElRepartoYLaMeseta(): void {
titulo('15 · B2 · El reparto de los tres planos: cada proyecto, su tercio del scroll')

/** ⚠ **B4-A: `aterrizajesMedidos` mide la ÚLTIMA muestra en la que algo cambia**
 *  y con la meseta eso ya no es el aterrizaje sino el final de la SALIDA, que
 *  para los dos primeros cae en el tramo del siguiente. El aterrizaje pasa a ser
 *  el arranque de la meseta y se afirma en §16, sobre la misma función. */
const ATERRIZAJES = aterrizajesMedidos(localDelPlano, GEOMETRIA.planos)
afirmar(separacionMinima(ATERRIZAJES) > 0, 'los tres planos terminan de moverse en puntos distintos del recorrido, y en orden', ATERRIZAJES.map((a) => a.toFixed(4)).join(' · '))
afirmar(repartoMonotono(localDelPlano, GEOMETRIA.planos), 'ningún plano retrocede: uno que volviera atrás se desarmaría solo mientras el visitante baja')
afirmarIgual(desviosDelContrato(localDelPlano, GEOMETRIA.planos, MESETA.remapear), [], 'y el plano vigente lee el `local` de `tramoDeSecuencia` del contrato CON el remapeo declarado de esta sección encima: es la secuencia de Servicios más el asentamiento, no una copia parecida')
controlPositivo('el detector ve un reparto que NO separa: con los tres leyendo el progreso entero, los tres terminan en el mismo punto', (p: number) => p, (r: (p: number, i: number) => number) => separacionMinima(aterrizajesMedidos(r, GEOMETRIA.planos)) >= 1 / GEOMETRIA.planos - 1e-9)
controlPositivo('  y ve un reparto que retrocede', (p: number) => 1 - p, (r: (p: number, i: number) => number) => repartoMonotono(r, GEOMETRIA.planos))
controlPositivo('  y ve un reparto SIN el remapeo declarado', (p: number, i: number) => acotar01(acotar01(p) * GEOMETRIA.planos - i), (r: (p: number, i: number) => number) => desviosDelContrato(r, GEOMETRIA.planos, MESETA.remapear).length === 0)

  titulo('16 · B4-A · LA MESETA: cada proyecto llega, SE QUEDA, y sale')

  const desdeElPin = progresoDelPin(PANTALLAS)
  console.log(`  el pin arranca en el progreso ${desdeElPin.toFixed(4)} — derivado de las ${PANTALLAS} pantallas de la tabla, no escrito`)
  console.log(`  el tramo de un plano mide ${MESETA.tramoEnPx} px de scroll a la altura de calibración: llegada ${(MESETA.fraccionDeLaLlegada * MESETA.tramoEnPx).toFixed(1)} · meseta ${(MESETA.fraccionDeLaMeseta * MESETA.tramoEnPx).toFixed(1)} · salida ${(MESETA.fraccionDeLaSalida * MESETA.tramoEnPx).toFixed(1)}, desbordada al tramo siguiente`)

  const apagados = cuadrosSinNingunPlano(localDelPlano, GEOMETRIA.planos, desdeElPin)
  afirmarIgual(apagados, [], 'BARRIENDO EL PIN ENTERO, no queda un solo cuadro con los tres planos invisibles')
  const apagadosDeB2 = cuadrosSinNingunPlano(REPARTO_DE_B2, GEOMETRIA.planos, desdeElPin)
  afirmar(
    apagadosDeB2.length > 0,
    `  y el barrido NO está ciego: con el reparto de B2 encuentra ${apagadosDeB2.length} cuadros apagados`,
    `a 1920×1080, scrollY ${apagadosDeB2.map(aY).join(' · ')} — los 8640 y 9720 que B2 publicó, MÁS el cierre del recorrido, que no estaba reportado`,
  )
  controlPositivo('el barrido ve un reparto que apaga todo', () => 1, (r: RepartoDePlanos) => cuadrosSinNingunPlano(r, GEOMETRIA.planos, desdeElPin).length === 0)

  /** El largo de la meseta se afirma sobre la DERIVACIÓN, que es exacta, y no
   *  sobre el barrido, que tiene la resolución de su paso. El barrido después
   *  comprueba que la función real reproduzca ese número. */
  afirmar(
    MESETA.fraccionDeLaMeseta * MESETA.tramoEnPx >= FUSION_DEL_CENSO,
    `la meseta declarada dura ${(MESETA.fraccionDeLaMeseta * MESETA.tramoEnPx).toFixed(1)} px de scroll: no menos que los ${FUSION_DEL_CENSO} px con los que el censo funde dos acontecimientos, o sea que el «se queda» se LEE`,
  )

  const mesetas = mesetasMedidas(localDelPlano, GEOMETRIA.planos)
  afirmarIgual(mesetas.filter((m) => m === null).length, 0, `y los ${GEOMETRIA.planos} planos la TIENEN sobre la función real: un tramo del recorrido donde su progreso no cambia y siguen pintados`)
  /** Un paso del barrido, en píxeles de scroll: es la resolución con la que el
   *  medido puede diferir del declarado, y por eso está escrita y no es un
   *  margen elegido. */
  const PASO_EN_PX = (PANTALLAS * ALTO_DE_CALIBRACION) / (MUESTRAS_DEL_REPARTO - 1)
  const largos = mesetas.map((m) => (m === null ? 0 : (m.hasta - m.desde) * PANTALLAS * ALTO_DE_CALIBRACION))
  afirmar(
    Math.min(...largos) >= MESETA.fraccionDeLaMeseta * MESETA.tramoEnPx - PASO_EN_PX,
    `  y la medida más corta —${Math.min(...largos).toFixed(1)} px— reproduce la declarada dentro de un paso del barrido (${PASO_EN_PX} px)`,
    `las tres: ${mesetas.map((m) => (m === null ? '—' : `scrollY ${aY(m.desde)} → ${aY(m.hasta)}`)).join(' · ')}`,
  )
  const aterrizajes = mesetas.map((m) => (m === null ? -1 : m.desde))
  afirmar(
    separacionMinima(aterrizajes) >= 1 / GEOMETRIA.planos - PASO_EN_PX / (PANTALLAS * ALTO_DE_CALIBRACION),
    'los tres ATERRIZAJES —el arranque de cada meseta— siguen separados por un tercio del recorrido: el reparto de B2 no se movió',
    `a 1920×1080, scrollY ${aterrizajes.map(aY).join(' · ')} — eran 8640 · 9720 · 10800, el final de la SALIDA, porque sin meseta no había otro punto donde algo se quedara`,
  )
  afirmar(mesetasMedidas(REPARTO_DE_B2, GEOMETRIA.planos).every((m) => m === null), '  y el reparto de B2 no tenía ninguna meseta: la llegada y la salida se tocaban sin banda quieta en el medio')
  console.log(
    '  ⚠️ EL ÚLTIMO PLANO NO SALE, y se reporta: su salida caería en progreso > 1, que es scroll que este recorrido no tiene. Se ' +
      'queda en su meseta mientras la sección se va — lo contrario del defecto de 1080 px que el reparto de B2 tenía ahí mismo. Ver `asentamiento.ts`.',
  )
}

/**
 * §12 DEL INVARIANTE DEL CIERRE — CÓMO ENTRA EL CIERRE, afirmado aparte.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas del repo**, y el
 * corte es por TEMA y no por tamaño: es la única sección del invariante que
 * afirma sobre CUÁNDO entra cada pieza —el escalonado de las columnas y el
 * asentamiento del titular que B2 agregó— y no sobre el marcado, el contenido,
 * el foco ni la superficie. Misma costura que `servicios/s6-asentamiento.ts`.
 *
 * ⚠ **Los valores del sistema de motion entran por PARÁMETRO.** Este archivo no
 * es un `*.invariant.*`, así que para `s7-contrato` §3 y `s6-lane` §4 es código
 * de producto, y un producto que importe un valor de `_lib/motion/` rompe la
 * compuerta. Los tipos sí se importan: `import type` se borra al compilar.
 *
 * ⚠️ **AFIRMA UNA PROPIEDAD NUEVA Y NO REEMPLAZA A NINGUNA.** Lo de las
 * columnas está igual que antes, carácter por carácter. Lo que se agrega es el
 * asentamiento del titular, con el defecto que cierra medido en el navegador y
 * transcripto en `asentamiento.ts`: el titular aterrizaba a **135 px** de las
 * columnas del pie, adentro del umbral de fusión de 240 px del censo de
 * `B2-DELTAS.md` §0, así que el Cierre medía **CERO acontecimientos propios**.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import type { Ancla } from '../../_lib/motion/anclas'
import type { Ventana } from '../../_lib/motion/cronograma'
import { COLUMNAS } from './contenido'
import {
  ALTO_DE_CALIBRACION,
  ALTO_DEL_TITULAR,
  FRACCION_DE_REVELADO,
  FUSION_DEL_CENSO,
  RANGO_DEL_TITULAR,
  SOBREPASO_DEL_TITULAR,
  asentar,
} from './asentamiento'
import { MUESTRAS_DEL_RANGO, esMonotono, fraccionAsentada } from '../_invariantes/asentamiento'

/**
 * LAS CAJAS DE LOS TRES BLOQUES, en coordenadas del documento.
 *
 * ⚠️ **[medido en el navegador]**, 1920×1080, con la receta de
 * `docs/rediseno/MEDICION-NAVEGADOR.md` y `visibilityState: 'visible'` e
 * `innerWidth > 0` verificados antes de la lectura. No son derivables de los
 * tokens: dependen de dónde cae cada fila del pie con su `content-between`.
 * Están acá —en el instrumento— y no en el producto, porque el producto no las
 * necesita para funcionar: le alcanza con la fracción.
 */
const ABAJO_DEL_TITULAR = 18804.35
const ABAJO_DEL_CTA = 18921.25
const ARRIBA_DE_LAS_COLUMNAS = 18991.16
const ALTO_DE_LAS_COLUMNAS = 264

/** Lo que el instrumento le pasa: los valores medidos del sistema de motion. */
export interface EntradaMedida {
  /** `ANCLAS.P1.inicio`, para leer de ahí el desplazamiento de 80 px. */
  readonly inicioDeP1: Ancla
  /** `ANCLAS.P1.fin`, para leer de ahí el sobrepaso de 240 px. */
  readonly finDeP1: Ancla
  /** `ANCLAS.P2.fin`: el punto de ENTRADA, `bottom bottom`. */
  readonly finDeP2: Ancla
  /** Las ventanas de las tres columnas, con el escalonado medido de P2. */
  readonly ventanas: readonly Ventana[]
  /** Las mismas, con el escalonado forzado a cero. Es el control positivo. */
  readonly ventanasSinEscalonado: readonly Ventana[]
  /** El escalonado y la duración declarados de P2, tal como se midieron. */
  readonly escalonadoDeP2: number
  readonly duracionDeP2: number
  /** El escalonado que el cronograma armado le pasa a las piezas. */
  readonly escalonadoDelCronograma: number
  /** Cuántas piezas declara el cronograma. */
  readonly cantidad: number
  /** `S.escalonan`, el detector que ya vivía en el arnés de la sección. */
  readonly escalonan: (v: readonly Ventana[]) => boolean
}

/** §12 entero. Se llama desde `s8-cierre.invariant.tsx`, bajo su `titulo`. */
export function afirmarComoEntraElCierre(e: EntradaMedida): void {
  titulo('12 · Cómo entra el Cierre — las columnas escalonadas y el titular que aterriza')

  afirmarIgual(e.cantidad, COLUMNAS.length, `el conjunto tiene ${COLUMNAS.length} piezas, que es cuántas columnas hay`)
  afirmar(e.escalonan(e.ventanas), 'las ventanas arrancan escalonadas y no todas en cero', e.ventanas.map((v) => v.desde.toFixed(4)).join(' · '))
  afirmarIgual(e.ventanas[0].desde, 0, 'la primera arranca en cero y las otras después')
  afirmarIgual(e.escalonadoDelCronograma, e.escalonadoDeP2, 'el escalonado es el medido, sin factor')
  controlPositivo('un cronograma con escalonado 0 NO escalona: todas arrancan juntas', e.ventanasSinEscalonado, e.escalonan)
  console.log(`  ⚠️ P2 mide UN target por instancia y ahí su escalonado queda inerte. Acá son ${COLUMNAS.length} piezas de un mismo conjunto, así que se aplica: la duración pasa de ${e.duracionDeP2} a ${(e.duracionDeP2 + e.escalonadoDeP2 * (COLUMNAS.length - 1)).toFixed(1)} s. Es la desviación que pide la instrucción.`)

  /**
   * ── B2 · EL ASENTAMIENTO DEL TITULAR, derivado de las propias anclas ─────
   *
   * La regla es una sola y la comparte con `tu-panel/asentamiento.ts`: **un
   * patrón se completa cuando su bloque terminó de ENTRAR al cuadro**, que es
   * el fin de P2 (`bottom bottom`) escrito como regla. P1 se pasa de ese punto
   * exactamente lo que su ancla declara —`bottom-=240px`— y ése es el tramo que
   * se devuelve al asentamiento.
   */
  console.log(`  titular ${ALTO_DEL_TITULAR} px · rango de P1 ${RANGO_DEL_TITULAR} · revelado ${FRACCION_DE_REVELADO.toFixed(5)} del rango`)
  afirmarIgual(e.finDeP2.viewport.fraccion, 1, 'el punto de ENTRADA es el fin de P2 (`bottom bottom`): el bloque terminó de entrar al cuadro')
  afirmarIgual(e.finDeP1.viewport.fraccion, 1, '  P1 cierra sobre el mismo borde del viewport, corrido en píxeles')
  afirmarIgual(SOBREPASO_DEL_TITULAR, -e.finDeP1.viewport.px, '  y se pasa exactamente lo que su ancla declara, leído de `ANCLAS.P1`')
  afirmarIgual(RANGO_DEL_TITULAR, ALTO_DEL_TITULAR + (-e.finDeP1.viewport.px - -e.inicioDeP1.viewport.px), '  el rango declarado es `alto + (240 − 80)`, los dos desplazamientos del ancla')
  afirmarIgual(FRACCION_DE_REVELADO, (RANGO_DEL_TITULAR - SOBREPASO_DEL_TITULAR) / RANGO_DEL_TITULAR, 'la fracción de revelado está DERIVADA del ancla y del alto medido, no elegida')
  afirmarIgual(asentar(0), 0, 'en el borde del rango el revelado arranca en cero: el titular entra desde su estado inicial')
  afirmarIgual(asentar(FRACCION_DE_REVELADO), 1, '  llega a 1 cuando el bloque terminó de entrar, y de ahí no se mueve más')
  afirmarIgual(asentar(1), 1, '  ni en el último píxel del ancla')
  afirmar(esMonotono(asentar), 'el remapeo nunca retrocede: ninguna línea se desarma mientras el visitante baja')
  const quieta = fraccionAsentada(asentar)
  afirmar(Math.abs(quieta - (1 - FRACCION_DE_REVELADO)) <= 1 / (MUESTRAS_DEL_RANGO - 1), `${(100 * quieta).toFixed(1)} % del rango pasa SIN que nada cambie — eso es el aterrizaje, medido sobre el remapeo`, `derivado: ${(100 * (1 - FRACCION_DE_REVELADO)).toFixed(1)} %, con ${MUESTRAS_DEL_RANGO} muestras`)
  afirmarIgual((1 - FRACCION_DE_REVELADO) * RANGO_DEL_TITULAR, SOBREPASO_DEL_TITULAR, '  y la banda quieta mide exactamente el sobrepaso del ancla')
  controlPositivo('el progreso pelado —lo que la sección hacía— NO deja una sola banda quieta', (l: number) => l, (r) => fraccionAsentada(r) > 0)

  /**
   * ⚠️ **LA PRIMERA FORMA DE ESTA AFIRMACIÓN ESTABA MAL Y SE DECLARA.** Decía
   * «la banda quieta supera el umbral de fusión» y se puso ROJA: la banda que
   * el remapeo abre mide **exactamente 240 px**, que es exactamente el umbral.
   * O sea que el asentamiento por sí solo NO separa nada, y afirmar que sí era
   * afirmar de más. Lo que separa es otra cosa y es lo que se afirma acá: las
   * columnas no aterrizan en el `fin` del titular sino 375 px después, porque
   * su propio bloque está 187 px más abajo en el documento.
   */
  afirmarIgual(SOBREPASO_DEL_TITULAR, FUSION_DEL_CENSO, `la banda quieta mide ${SOBREPASO_DEL_TITULAR} px y el umbral de fusión ${FUSION_DEL_CENSO}: son el mismo número, así que el asentamiento por sí solo NO separa`)
  const titularSinAsentar = ABAJO_DEL_TITULAR - ALTO_DE_CALIBRACION + SOBREPASO_DEL_TITULAR
  const titular = ABAJO_DEL_TITULAR - ALTO_DE_CALIBRACION
  const primeraColumna = ARRIBA_DE_LAS_COLUMNAS - ALTO_DE_CALIBRACION + e.ventanas[0].hasta * ALTO_DE_LAS_COLUMNAS
  const cta = ABAJO_DEL_CTA - ALTO_DE_CALIBRACION + SOBREPASO_DEL_TITULAR
  console.log(`  aterrizajes derivados de las cajas medidas: titular ${titularSinAsentar.toFixed(0)} → ${titular.toFixed(0)} · CTA ${cta.toFixed(0)} · primera columna ${primeraColumna.toFixed(0)}`)
  afirmar(primeraColumna - titularSinAsentar <= FUSION_DEL_CENSO, `EL DEFECTO, en un número: sin asentar, el titular aterrizaba a ${(primeraColumna - titularSinAsentar).toFixed(0)} px de las columnas y el censo los leía como UN grupo`)
  afirmar(primeraColumna - titular > FUSION_DEL_CENSO, `con el asentamiento la distancia pasa a ${(primeraColumna - titular).toFixed(0)} px y los dos grupos se separan`)
  afirmar(primeraColumna - cta <= FUSION_DEL_CENSO, `  y el CTA aterriza a ${(primeraColumna - cta).toFixed(0)} px de la primera columna: entra CON el pie, que es la decisión escrita en Cierre.tsx`)
  console.log('  [medido en el navegador, 1920×1080, receta de MEDICION-NAVEGADOR.md] el censo lo confirma: el titular pasa de aterrizar en las muestras 17880 y 18000')
  console.log('  a hacerlo entero en 17760, y el Cierre gana el grupo propio que no tenía — 18120 → 18240, con el CTA y las tres columnas adentro.')
}

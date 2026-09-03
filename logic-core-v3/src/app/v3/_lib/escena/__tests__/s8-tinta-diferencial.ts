/**
 * §5 DE `s8-tinta.invariant.ts` — EL DIFERENCIAL, la cifra que decide §7.29.
 *
 * ⚠ **VIVE ACÁ DESDE V3-E, por la regla de las 300 líneas del repo.** El
 * invariante llegó a este sprint en 300 líneas exactas —cero margen— y la
 * reescritura de la afirmación del AAA (el ancla del diferencial se descuantizó)
 * no entraba. El corte es el mismo que `s10-logo-columna.ts` estrenó para el §9
 * de `s10-logo` y `s13b-diferencial.ts` para el §4 de `s13b-escena`: **por tema**
 * — ésta es la única sección que pregunta por UNA sección del home.
 *
 * ⚠ **Y NO COMPARTE UNA CONSTANTE CON LO QUE QUEDÓ DEL OTRO LADO: las recibe.**
 * El muestreador, la bisección, el cruce de AA y los dos umbrales entran por
 * parámetro. Es la misma razón por la que `errorDeVuelta` recibe sus dos
 * funciones en `s9-soporte.ts`: una sección que importa las constantes del
 * archivo que la llama no se puede correr contra un instrumento distinto, y con
 * eso «el §5 pasa» dejaría de distinguirse de «el §5 mide otra cosa».
 */

import { ANCLAJE } from '../anclaje'
import { pantallaDeProgreso, type TramoDeSeccion } from '../recorrido'
import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { MAPEO_PROVISIONAL_HISTORICO } from './tablas'

/** Lo que el §5 necesita del archivo que lo llama, y que por eso no importa. */
export interface InstrumentosDeTinta {
  /** El contraste de la tinta contra el fondo en un progreso y un cuantil. */
  readonly contrasteEn: (progreso: number, cuantil: number) => number
  /** Dónde el recorrido cruza un umbral de contraste, por bisección. */
  readonly bisecar: (umbral: number, cuantil?: number) => number
  /** Dónde cruza AA el peor píxel. Lo mide §3 y no se vuelve a bisecar. */
  readonly cruceAA: number
  readonly AA: number
  readonly AAA: number
}

export function afirmarElDiferencial(
  i: InstrumentosDeTinta,
  transparentes: readonly TramoDeSeccion[],
): void {
  titulo('5 · 🔴 EL DIFERENCIAL — la cifra que decide §7.29, y la que no la decide')

  const diferencial = transparentes[1]
  const difLlena = i.contrasteEn(diferencial.llenaDesde, 0)
  const difP05 = i.contrasteEn(diferencial.llenaDesde, 0.05)
  const difMedia = i.contrasteEn(diferencial.llenaDesde, 0.5)

  /**
   * ⚠️ **ESTA ES LA AFIRMACIÓN QUE SITIO-S8 NO PODÍA HACER.** Su `noCorre` decía,
   * con todas las letras, que el número era *downstream* de un mapeo provisional y
   * que **cualquier mapeo que dejara al diferencial abajo de p=0,878 lo resolvía
   * sin tocar la escena**. V3-E lo deja en el ancla DECLARADA, p=0,8525, que es
   * 0,0257 abajo de ese cruce: se cierra con el número, no con el argumento.
   */
  const viejo = MAPEO_PROVISIONAL_HISTORICO.find((f) => f.id === diferencial.id)
  if (viejo === undefined) throw new Error('el mapeo histórico no tiene al diferencial')
  const difViejo = i.contrasteEn(viejo.llenaDesde, 0)

  afirmar(
    difLlena >= i.AA,
    `POR QUÉ DEVELOP — la tinta PASA AA donde la sección llena el cuadro (p=${diferencial.llenaDesde.toFixed(3)})`,
    `${difLlena.toFixed(2)}:1 (mín) · ${difP05.toFixed(2)}:1 (p05) · ${difMedia.toFixed(2)}:1 (mediana), contra ${i.AA}:1`,
  )
  afirmar(
    diferencial.llenaDesde < i.cruceAA,
    '  y no por poco: llena el cuadro ANTES del cruce de AA de la escena',
    `p=${diferencial.llenaDesde.toFixed(4)} contra el cruce en p=${i.cruceAA.toFixed(4)}`,
  )
  afirmar(
    difLlena > difViejo,
    `  contra el provisional, que la ponía en p=${viejo.llenaDesde.toFixed(3)}`,
    `${difViejo.toFixed(2)}:1 → ${difLlena.toFixed(2)}:1 — la sección se movió ${(viejo.llenaDesde - diferencial.llenaDesde).toFixed(3)} de progreso hacia atrás`,
  )
  /**
   * ⚠ **REESCRITA EN V3-E — LA MEDIANA YA NO PASA AAA, Y NO SE AFLOJA: SE MIDE.**
   * `difMedia >= AAA` era verdad **porque el ancla estaba cuantizada en p=0,750**,
   * encima de la pose `demos`, que es donde el logo tapaba el titular (defecto 7).
   * Y no hay elección adentro de la ventana: la mediana cruza AAA en p=0,8227 y el
   * titular no queda limpio en los cuatro cuadros hasta p=0,8232 — **incompatibles
   * por 0,0005 de progreso**, así que cualquier ancla que cierre el defecto 7 pierde
   * el AAA de la mediana (`s16-anclaje` §5 lo mide contra la ventana entera). Bajar
   * el umbral sería aflojar; se afirman las dos cosas que sí se pueden pedir y que
   * tienen dientes: que la mediana **siga pasando AA con margen** —en 0,9167 daba
   * 4,46:1 y no pasaría— y que el cruce de AAA haya quedado ATRÁS del ancla: el día
   * que alguien la devuelva antes de p=0,8227 esto se pone en rojo, y ese rojo dice
   * «volvió el defecto 7».
   */
  const cruceAAAdeLaMediana = i.bisecar(i.AAA, 0.5)
  afirmar(
    difMedia >= i.AA,
    '  y la mediana del cuadro pasa AA con margen donde la sección llena el cuadro',
    `${difMedia.toFixed(2)}:1 contra ${i.AA}:1 — el provisional no alcanzaba ni AA (${i.contrasteEn(viejo.llenaDesde, 0.5).toFixed(2)}:1)`,
  )
  afirmar(
    cruceAAAdeLaMediana < diferencial.llenaDesde,
    '  EL AAA DE LA MEDIANA SE GASTÓ EN EL RE-ANCLAJE: el cruce quedó ATRÁS del ancla declarada',
    `la mediana cruza AAA (${i.AAA}:1) en p=${cruceAAAdeLaMediana.toFixed(4)} y el ancla está en p=${diferencial.llenaDesde.toFixed(4)}` +
      `, ${(diferencial.llenaDesde - cruceAAAdeLaMediana).toFixed(4)} después — con el ancla cuantizada en 0,7500 la mediana daba 7,58:1 y el titular se superponía con el logo`,
  )

  /**
   * ⚠️ **LA COLA QUE NO SE AFIRMA, Y POR QUÉ NO ES AFLOJAR (regla 13).**
   *
   * La ventana en la que el diferencial SE VE termina en p=1,000, donde el peor
   * píxel da 2,34:1. Podría parecer que la afirmación de arriba se hizo sobre el
   * punto cómodo. No lo es, y la razón se afirma abajo: el borde inferior de
   * `por-que-develop` sale del cuadro **exactamente en el final del scroll**, así
   * que su ventana termina en p=1,000 **con cualquier mapeo monótono que complete
   * el recorrido**, y un criterio que ningún mapeo puede cumplir no distingue un
   * mapeo de otro. Lo que SÍ controla el mapeo es dónde cae la sección. Lo que
   * queda —qué pasa mientras el panel se va y el Cierre lo tapa— es **§7.4**, la
   * reserva (b) que la parada de SITIO-S8 ya había nombrado.
   */
  const finDeLaVentana = i.contrasteEn(diferencial.seVeHasta, 0)
  const cruceEnPantallas = pantallaDeProgreso(i.cruceAA)
  const geometria = ANCLAJE.geometria.find((g) => g.id === diferencial.id)
  if (geometria === undefined) throw new Error('la geometría no tiene al diferencial')
  const enCuadroAlCruzar = Math.max(0, Math.min(1, geometria.hastaPantalla - cruceEnPantallas))

  afirmar(
    geometria.hastaPantalla === ANCLAJE.pantallasDeScroll,
    'LA COLA NO ES DEL MAPEO: el diferencial sale del cuadro en el final del scroll, por geometría',
    `su borde inferior está en la pantalla ${geometria.hastaPantalla} de ${ANCLAJE.pantallasDeScroll} — con cualquier mapeo, su ventana termina en p=1`,
  )
  controlPositivo(
    'y el detector distingue una sección que NO termina con el scroll',
    'hero',
    (id: string) => {
      const g = ANCLAJE.geometria.find((f) => f.id === id)
      return g !== undefined && g.hastaPantalla === ANCLAJE.pantallasDeScroll
    },
  )
  console.log(
    `  la cola, publicada con su dueño (§7.4): la tinta cruza AA en p=${i.cruceAA.toFixed(4)}, que es la pantalla ` +
      `${cruceEnPantallas.toFixed(3)} de ${ANCLAJE.pantallasDeScroll}. Ahí el diferencial todavía ocupa el ` +
      `${(enCuadroAlCruzar * 100).toFixed(1)}% del cuadro —el resto ya es el Cierre, que es opaco— y al terminar de salir ` +
      `da ${finDeLaVentana.toFixed(2)}:1. El mapeo no puede moverlo; componer la salida de la escena, sí.`,
  )
}

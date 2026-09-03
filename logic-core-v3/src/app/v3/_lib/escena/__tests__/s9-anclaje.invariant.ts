/**
 * INVARIANTE — SITIO-S9 · EL ANCLAJE DEL RECORRIDO AL SCROLL.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s9-anclaje.invariant.ts
 *     npm run test:s9-anclaje
 *
 * Mide **el mapeo del progreso**: la respuesta a §7.2 de `DIRECCION-ESCENA.md`.
 * No mide la escena —ni un keyframe, ni una opacidad, ni una pose— y **no mide
 * tinta**: eso es `s8-tinta.invariant.ts`.
 *
 * ⚠ **DÓNDE VIVE CADA COSA.** La decisión, en `anclaje.ts`. La aritmética, en
 * `anclajeDerivacion.ts` y `recorrido.ts`. Los detectores y agregados, en
 * `s9-soporte.ts` (y la caminata del grafo en `s9-compuerta.ts`), para que el
 * control positivo corra la misma función contra una entrada rota. La impresión,
 * en `tablas.ts`, porque imprimir una tabla no es afirmar nada. **Acá quedan las
 * afirmaciones.** Un número que no salga de una de esas fuentes sería una cuarta
 * copia de la tabla, que es como se desincronizan.
 */

import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../choreography'
import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA } from '../../secciones'
import { ANCLAJE, TRAMOS_ANCLADOS, pantallaDeScroll, type Nudo } from '../anclaje'
// prettier-ignore
import { MAPEO_DE_LAS_SECCIONES, PANTALLAS_DEL_DOCUMENTO, PANTALLAS_DE_SCROLL, RITMO_COMPUESTO, RITMO_POR_SEGMENTO, pantallaDeProgreso, progresoDePantalla, progresoDelScroll, tramoEn } from '../recorrido'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
// prettier-ignore
import { CUATRO_DE_LA_72, MUESTRAS_DE_SCROLL, NUDOS_FUERA_DE_ORDEN, PANTALLAS, PROGRESOS, RITMO_DEL_PROVISIONAL, caeEnLaEntrada, errorDeVuelta, esEstrictamenteCreciente, esMonotonaLaTabla, llenaEn, losNudosSonExactos, progresosSobre, ventanaDelTramo, veredictoDeNombres, veredictoDeReasignaciones, veredictoDelRitmo } from './s9-soporte'
import { afirmarLaCompuerta } from './s9-compuerta'
// prettier-ignore
import { MAPEO_PROVISIONAL_HISTORICO, bordesDe, imprimirAnclaje, imprimirComparacion, imprimirMapeo, imprimirReparto, imprimirVentanas, ventanasEnProgreso } from './tablas'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL ANCLAJE — los nudos y el ritmo de cada segmento (la ESCALA)')

imprimirAnclaje()

// prettier-ignore
afirmarIgual([PANTALLAS_DEL_DOCUMENTO, PANTALLAS_DE_SCROLL], [ANCLAJE.pantallasDelDocumento, ANCLAJE.pantallasDeScroll],
  'el documento y el recorrido de scroll salen del anclaje, no de una cuenta propia')
/**
 * ⚠ **REESCRITA EN V3-E.** Decía el par `[12, 0.75]` para el quinto nudo, y ese
 * par ERA la cuantización. Se parte en dos, y **ninguna mitad es más floja**: la
 * primera es NUEVA e impide que descuantizar sea inventar un progreso.
 */
afirmarIgual(
  ANCLAJE.nudos.map((n) => n.progreso),
  [CHOREO_TRAMOS[0].from, ...CHOREO_TRAMOS.map((t) => t.to)],
  'los progresos de los SIETE nudos son los de la coreografía: descuantizar NO inventó un progreso',
)
afirmarIgual(
  ANCLAJE.nudos.map((n) => Number(n.pantalla.toFixed(6))),
  [0, 1, 3, 4, 7, 11.305085, 13],
  '  y sus pantallas son los bordes de las secciones SALVO el quinto: el diferencial declara su ancla y `demos` cierra adentro de tu-panel',
)
afirmarIgual(RITMO_POR_SEGMENTO.length, CHOREO_TRAMOS.length, 'hay un ritmo por tramo: SEIS, no una cifra de estiramiento')
afirmarIgual(RITMO_COMPUESTO, 0.125, 'el ritmo compuesto es 1 / CHOREO_SCREENS, leído de la coreografía')

const ritmo = veredictoDelRitmo()
afirmar(
  ritmo.alCompuesto.length === 3,
  'TRES de los seis segmentos corren al ritmo compuesto EXACTO (0,125 por pantalla)',
  `${ritmo.alCompuesto.join(' · ')} — los otros: ${ritmo.fueraDelCompuesto.join(' · ')}`,
)
afirmar(
  RITMO_POR_SEGMENTO.every((r) => r.porPantalla > 0),
  '  y ninguno es cero ni negativo: no hay segmento que no avance',
)
afirmar(
  Math.abs(RITMO_DEL_PROVISIONAL / RITMO_COMPUESTO - 8 / 13) < 1e-12,
  'ESCALA · el provisional corría a ×0,615 del ritmo compuesto en TODO el recorrido',
  `${RITMO_DEL_PROVISIONAL.toFixed(4)} por pantalla = ×${(RITMO_DEL_PROVISIONAL / RITMO_COMPUESTO).toFixed(3)} — el recíproco del ×1,625 de §7.2`,
)
afirmar(
  ritmo.distintos === 4,
  '  y el anclaje tiene CUATRO ritmos distintos donde el provisional tenía UNO para las trece',
  ritmo.multiplos.join(' · '),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA TABLA NUEVA CONTRA LA VIEJA, sección por sección')

imprimirMapeo()
imprimirComparacion()

afirmarIgual(
  [MAPEO_DE_LAS_SECCIONES.map((f) => f.id), MAPEO_PROVISIONAL_HISTORICO.map((f) => f.id)],
  [SECCIONES.map((s) => s.id), SECCIONES.map((s) => s.id)],
  'las DOS tablas tienen una fila por sección en el orden del recorrido: comparan las mismas ocho',
)
afirmar(
  esMonotonaLaTabla(MAPEO_DE_LAS_SECCIONES),
  'ninguna sección arranca antes de que la anterior termine de llenar el cuadro',
)
afirmarIgual(
  MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena).map((f) => f.id),
  [...SECCIONES_QUE_DEJAN_VER_LA_ESCENA],
  'las dos secciones que dejan ver la escena salen de la tabla de superficies, no de acá',
)
afirmarIgual(
  CUATRO_DE_LA_72.map((id) => tramoEn(llenaEn(MAPEO_PROVISIONAL_HISTORICO, id))),
  ['quiénes somos', 'cierre', 'cierre', 'cierre'],
  'los CUATRO casos que §7.2 nombra —Números, tu-panel, por-que-develop y cierre— eran ciertos',
)
/**
 * ⚠ **REESCRITA EN V3-E.** Decía `[0.375, 0.7, 0.75, 1]`. `por-que-develop` llena
 * el cuadro en el ancla declarada y `tu-panel` se corre de 0,7000 a 0,7121: es el
 * único de las otras siete que se mueve. `numeros` y `cierre`, ni un bit.
 */
afirmarIgual(
  CUATRO_DE_LA_72.map((id) => Number(llenaEn(MAPEO_DE_LAS_SECCIONES, id).toFixed(6))),
  [0.375, 0.712106, 0.8525, 1],
  '  y con el anclaje llenan el cuadro acá — en qué tramo cae cada ventana, en §5',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · ESTRICTAMENTE MONÓTONO Y EXACTAMENTE REVERSIBLE')

afirmar(
  esEstrictamenteCreciente(progresosSobre(ANCLAJE.nudos, PANTALLAS)),
  `el progreso crece estrictamente sobre las ${PANTALLAS.length} muestras del recorrido`,
)
controlPositivo(
  'el detector ve un nudo fuera de orden — no lo interpola en silencio',
  NUDOS_FUERA_DE_ORDEN,
  (nudos: readonly Nudo[]) => esEstrictamenteCreciente(progresosSobre(nudos, PANTALLAS)),
)

const errorIda = errorDeVuelta(progresoDePantalla, pantallaDeProgreso, PANTALLAS)
const errorVuelta = errorDeVuelta(pantallaDeProgreso, progresoDePantalla, PROGRESOS)
afirmar(
  errorIda < 1e-12 && errorVuelta < 1e-12,
  'pantalla → progreso → pantalla y progreso → pantalla → progreso cierran en los DOS sentidos',
  `error máximo ${errorIda.toExponential(2)} y ${errorVuelta.toExponential(2)}`,
)
afirmar(
  losNudosSonExactos(progresoDePantalla, pantallaDeProgreso),
  '  y en los siete nudos la vuelta es EXACTA, no aproximada: se devuelven literales',
)
controlPositivo(
  'una inversa mentirosa —media pantalla corrida— no pasa el detector de vuelta',
  (p: number) => pantallaDeProgreso(p) + 0.5,
  (mentirosa: (p: number) => number) =>
    errorDeVuelta(progresoDePantalla, mentirosa, PANTALLAS) < 1e-12,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · CUBRE [0, 1] — y el scroll entra por la coordenada COMPARTIDA')

afirmarIgual(
  [progresoDePantalla(0), progresoDePantalla(PANTALLAS_DE_SCROLL)],
  [0, 1],
  'en la pantalla 0 el progreso es 0 y en la última es 1, exacto',
)
afirmarIgual(
  MUESTRAS_DE_SCROLL.map(([y, arriba, abajo, ven]) => progresoDelScroll(y, arriba, abajo, ven)),
  [0, 1, 1, 0, 0],
  'progresoDelScroll: 0 arriba, 1 abajo, acotado a los dos lados, 0 si no hay recorrido',
)
afirmar(
  progresoDelScroll(650, 0, 1400, 100) ===
    progresoDePantalla(pantallaDeScroll(650, 0, 1400, 100)),
  'progresoDelScroll es la composición literal de pantallaDeScroll con el mapeo',
  'la coordenada del contrato es la MISMA que lee la visibilidad: no hay dos traducciones',
)
controlPositivo(
  'el detector no daría por buena una composición que no es la del contrato',
  (s: number) => progresoDePantalla(pantallaDeScroll(s, 0, 1400, 100) + 1),
  (falsa: (s: number) => number) => falsa(650) === progresoDelScroll(650, 0, 1400, 100),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LOS NOMBRES — cuántos tramos sin sección y cuántas secciones sin tramo')

imprimirReparto()
const nombres = veredictoDeNombres()

afirmarIgual(
  [nombres.antesTramosSinSeccion.length, nombres.antesSeccionesSinTramo.length],
  [1, 3],
  'ANTES: un tramo sin sección (demos) y tres secciones sin tramo',
)
afirmarIgual(
  [nombres.despuesTramosSinSeccion.length, nombres.despuesSeccionesSinTramo.length],
  [0, 1],
  'DESPUÉS: ningún tramo sin sección, y UNA sección sin tramo',
)
// prettier-ignore
afirmarIgual(nombres.despuesSeccionesSinTramo, ['cierre'],
  '  y es `cierre`, que no tiene recorrido de scroll propio: es donde el recorrido TERMINA')

/**
 * ⚠ **LAS TRES QUE SIGUEN CAYENDO EN UN TRAMO QUE NO LLEVA SU NOMBRE, con el
 * número.** No son un residuo: son el reparto que `TRAMOS_ANCLADOS` declara a
 * mano — `servicios` y `tu-panel` adentro de `demos` (los dos paneles opacos que
 * el tramo escondido recorre) y `por-que-develop` adentro de `cierre`.
 */
afirmarIgual(
  nombres.conOtroNombre,
  ['servicios', 'tu-panel', 'por-que-develop'],
  'TRES secciones caen en un tramo que no lleva su nombre — y las tres están DECLARADAS',
)
// prettier-ignore
afirmarIgual(nombres.declaradas, [true, true, true],
  '  cada una aparece en TRAMOS_ANCLADOS: ninguna cae ahí por accidente del reparto')
afirmar(
  nombres.antesDesajustadas.length === 6,
  '  contra SEIS de ocho con el provisional: el desajuste de nombres baja de 6 a 3',
  nombres.antesDesajustadas.join(' · '),
)

/**
 * La identidad más fuerte de la sección: la ventana de scroll de cada tramo —de
 * que su primera sección llena el cuadro a que la última deja de verse— **es** su
 * `[from, to]` en la coreografía.
 *
 * ⚠ **REESCRITA EN V3-E, Y ES EL PRECIO EXACTO DE DESCUANTIZAR.** El ancla
 * declarada rompe la identidad **en los dos tramos que toca —y sólo en ésos**. Se
 * afirma en dos mitades derivadas de `TRAMOS_ANCLADOS`: intacta en los otros
 * cuatro, y en los dos tocados el borde que comparten **es el ancla declarada**.
 */
const bordesDeLosTramos = CHOREO_TRAMOS.map((t) => [t.from, t.to])
const iDeclarado = TRAMOS_ANCLADOS.findIndex((t) => t.ancla !== undefined)
const anclaDeclarada = TRAMOS_ANCLADOS[iDeclarado].ancla
const tocados = [iDeclarado - 1, iDeclarado]
const intactos = CHOREO_TRAMOS.map((_, i) => i).filter((i) => !tocados.includes(i))
afirmarIgual(
  intactos.map((i) => ventanaDelTramo(i)),
  intactos.map((i) => bordesDeLosTramos[i]),
  `la ventana de scroll de cada tramo ES su [from, to] en la coreografía — los ${intactos.length} que el ancla declarada no toca`,
)
afirmarIgual(
  [ventanaDelTramo(tocados[0])[1], ventanaDelTramo(tocados[1])[0]],
  [anclaDeclarada, anclaDeclarada],
  `  y los DOS que sí toca comparten su borde en el ANCLA DECLARADA (${anclaDeclarada}), no en el \`to\` del tramo`,
)
controlPositivo(
  'el detector ve una ventana corrida un octavo',
  0.125,
  (delta: number) =>
    JSON.stringify(intactos.map((i) => ventanaDelTramo(i, delta))) ===
    JSON.stringify(intactos.map((i) => bordesDeLosTramos[i])),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LA FORMA — las ventanas de progreso con panel transparente en cuadro')

/**
 * ⚠ **QUE LA ESCENA SE APAGUE Y VUELVA NO ES DE ESTE FRENTE.** §2.4 pide esa
 * forma y la construye `visibilidad.ts`. Acá se publica su insumo: en qué
 * ventanas de PROGRESO hay panel transparente en cuadro. El hueco, allá.
 */
imprimirVentanas()
const ventanas = ventanasEnProgreso()

/**
 * ⚠ **REESCRITA EN V3-E.** Decía `[0.725, 1]`: el progreso una pantalla antes del
 * ancla CUANTIZADA. Ahora el panel del diferencial asoma en **0,7411** —la escena
 * se enciende 0,0161 más tarde—. La primera ventana no se mueve un bit.
 */
// prettier-ignore
afirmarIgual(ventanas.map((v) => v.map((p) => Number(p.toFixed(6)))), [[0, 0.125], [0.741142, 1]],
  'son DOS ventanas de progreso, una por sección transparente')
afirmar(
  ventanas[1][0] > ventanas[0][1],
  '  y no se solapan: el hueco es real, no un artefacto de redondeo',
  `hueco p=[${ventanas[0][1].toFixed(3)}, ${ventanas[1][0].toFixed(3)}] = ${(ventanas[1][0] - ventanas[0][1]).toFixed(3)} de progreso sin panel transparente`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · LA REASIGNACIÓN DEL KEYFRAME `demos`, consumida como dato')

/** No se decide ni se repite acá: está en `anclaje.ts`. Se afirma lo que promete. */
const reasignaciones = veredictoDeReasignaciones()
afirmarIgual(reasignaciones.length, 1, 'hay UNA reasignación declarada, y no más')

for (const v of reasignaciones) {
  console.log(`  keyframe "${v.keyframe}" (at=${v.at}) → "${v.seccion}", bordes ${JSON.stringify(v.bordes)}`)
  afirmar(v.at !== null, `el keyframe "${v.keyframe}" existe en CHOREO_KEYFRAMES`, `at=${v.at}`)
  afirmar(v.noEsUnaSeccion, '  y su nombre no es el id de ninguna sección: por eso hacía falta adoptarlo')
  afirmar(
    v.enLaEntrada,
    `  y su progreso cae en la ENTRADA de "${v.seccion}": entre que el panel asoma y que llena el cuadro`,
    `at=${v.at} en (${v.bordes[0].toFixed(4)}, ${v.bordes[1].toFixed(4)}) — V3-E: hasta la descuantización coincidía con el borde de llenado, y ésa era la causa del defecto 7`,
  )
  afirmar(v.loAlcanzaAhi, '  y la coreografía alcanza ESE keyframe ahí, leído de la coreografía')
}
controlPositivo(
  'el detector de la entrada acota por los DOS lados: ni un progreso anterior a que el panel asome ni uno posterior al llenado',
  [0.7, 0.9],
  (ats: readonly number[]) => ats.some((at) => caeEnLaEntrada(bordesDe('por-que-develop'), at)),
)
controlPositivo(
  'y el de existencia no encuentra un keyframe que no está compuesto',
  'demos · sostén',
  (nombre: string) => CHOREO_KEYFRAMES.some((k) => k.name === nombre),
)

afirmarLaCompuerta()

cerrar('s9-anclaje.invariant')

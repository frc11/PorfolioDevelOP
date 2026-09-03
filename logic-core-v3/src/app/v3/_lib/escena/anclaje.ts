/**
 * EL CONTRATO DEL ANCLAJE — dónde cae cada tramo del recorrido sobre las
 * catorce pantallas del home, y en qué ventana la escena se ve.
 *
 * ⚠ **ESTE ARCHIVO NO LO ESCRIBE NINGÚN SUBAGENTE.** Lo escribió el agente
 * principal en la Fase 0 de SITIO-S9, ANTES de despachar, y es la razón por la
 * que dos frentes pueden trabajar a la vez sin pisarse: `recorrido.ts` implementa
 * el mapeo sobre estos nudos y `visibilidad.ts` suspende el render sobre estas
 * ventanas. **Ninguno de los dos decide dónde caen.**
 *
 * Cierra §7.2 de `DIRECCION-ESCENA.md`, que estaba *decidida en forma y sin
 * construir*: el mapeo va **por anclaje** y no por estiramiento lineal.
 *
 * ── QUÉ SE ANCLA A QUÉ, y por qué ésta y no la otra lectura ────────────────
 *
 * `CHOREO_TRAMOS` declara seis tramos que llevan **el nombre de la sección para
 * la que se compusieron**. La pregunta que §7.2 dejaba abierta —*"no se decidió
 * todavía cómo se ancla exactamente"*— tiene dos respuestas posibles y hay que
 * elegir una:
 *
 *   (i)  **LLEGADA** — la pose que nombra a la sección se alcanza cuando la
 *        sección EMPIEZA a llenar el cuadro.
 *   (ii) **TRAMO** — el tramo que nombra a la sección OCUPA la sección: la
 *        cámara recorre el tramo mientras el panel está en pantalla, y llega a
 *        la pose al final.
 *
 * **Se elige (ii), y hay cuatro cosas medidas o escritas que la fuerzan:**
 *
 * 1. **§2.2 lo dice como tabla.** *"Tramo 2 · Quiénes somos · 2 pantallas ·
 *    0,125–0,375 · órbita 0° → 130°"*. El tramo ES el tiempo en pantalla de la
 *    sección y la pose lo cierra. Con (i), la sección llamada «quiénes somos»
 *    viviría en el tramo llamado «números» — la desalineación de nombres
 *    quedaría PEOR que con el provisional, corrida un lugar entera.
 * 2. **§2.4 y el keyframe `hero · sostén`.** *"Empieza en la pose del hero, y se
 *    queda ahí la pantalla entera."* Con (i) el hero llevaría 0,375 de progreso
 *    en una pantalla: la cámara saldría de la pose a un tercio de la primera
 *    pantalla y haría los 130° completos mientras el panel se va. El docblock
 *    del propio sostén dice que existe para que *«la cámara no esté orbitando
 *    ~20° durante la pantalla del hero»* — con (i) orbitaría **130°**, 6,5× lo
 *    que ese keyframe fue escrito para impedir. Sería anular un valor de la
 *    escena sin tocarlo, que es lo que la regla 4 del sprint prohíbe.
 * 3. **La instrucción del sprint cuenta DOS paneles opacos** entre Trabajos y
 *    Por qué develOP (*"avanza sin que nadie lo vea, detrás de dos paneles
 *    opacos"*). Con (ii) son exactamente dos —Servicios y Tu panel—; con (i)
 *    son tres, porque el tramo escondido arrancaría adentro de Trabajos.
 * 4. **Las dos filas *(avanza oculto)* de la instrucción son Servicios y Tu
 *    panel.** Con (ii) el tramo `demos` es literalmente el de esas dos
 *    secciones. Con (i) no.
 *
 * **Lo que (ii) cuesta, y se declara:** la línea de la instrucción *"cada
 * sección llena el cuadro en el progreso de su ancla"* es literal para **tres**
 * de las seis —Hero (0,000), Por qué develOP y Cierre (1,000), que son las tres
 * que ARRIBAN sobre su ancla— y para las otras tres la pose es la de **salida**:
 * Quiénes somos, Números y Trabajos entran sobre la pose de la anterior y llegan
 * a la suya al entregar el cuadro. Las tres que arriban son las que la medición
 * de tinta necesita, incluida la única que decide §7.29. ⚠️ Desde V3-E el ancla
 * del diferencial es **declarada** (0,8525) y ya no coincide con la pose `demos`.
 *
 * ── LA REASIGNACIÓN DE `demos`, escrita para que no se lea como accidente ──
 *
 * `demos` era una sección del plan viejo que el sitio ya no tiene. Su pose es la
 * más íntima del recorrido —el logo llena el 81% del alto del cuadro, la cámara
 * a distancia 9 en contrapicado, el sol en contraluz a γ 155–166°— y es la única
 * del track compuesta para mirarse sin texto encima. **El diferencial es la
 * segunda de las dos únicas secciones que dejan ver la sala**, y es la que
 * argumenta por qué develOP: la pose que le faltaba es exactamente ésa.
 *
 * No es una conveniencia de contraste, aunque también lo resuelva: el tramo
 * `demos` corre escondido detrás de Servicios y Tu panel, y **la pose con la que
 * ese tramo cierra es la pose con la que el diferencial ASOMA** — desde V3-E el
 * cierre pasó a caer ADENTRO de Tu panel y el ancla se declara más tarde. Por eso
 * la reasignación se declara acá como dato, con un guardián que exige que el
 * keyframe exista, que no sea el de ninguna sección, y que su progreso caiga en
 * la ventana de ENTRADA de la sección que lo recibe: entre que asoma y que llena.
 *
 * ── LA CUENTA QUE CIERRA SOLA ──────────────────────────────────────────────
 *
 * El documento mide 14 pantallas y el recorrido de scroll es 13 —el documento
 * menos la ventana—. Las siete primeras secciones suman **exactamente 13**, y la
 * octava mide una pantalla: o sea que **las secciones que llevan el recorrido
 * son todas menos la última, y la última es donde el recorrido termina.** No es
 * una coincidencia que haya que escribir: sale de que el `alto` del Cierre es
 * `100svh`, y si mañana deja de serlo, la derivación de abajo le da su propio
 * tramo de scroll sola. Lo único que hay que declarar a mano es qué tramo corre
 * sobre qué secciones — el resto se deriva.
 *
 * ── CÓMO SE INTERPOLA ENTRE DOS ANCLAS, con su razón ──────────────────────
 *
 * **Recta, por tramos, sobre el scroll.** Entre dos nudos consecutivos el
 * progreso avanza a ritmo constante. Tres razones, y ninguna es "es lo más
 * simple":
 *
 * 1. **Es exactamente reversible en forma cerrada.** `progresoDePantalla` y
 *    `pantallaDeProgreso` son una división y una multiplicación por segmento, y
 *    la ida y vuelta cierra hasta el error de punto flotante. Cualquier curva
 *    con forma pediría una inversión numérica, y "exactamente reversible" es la
 *    propiedad que los nueve patrones del sistema de motion asumen.
 * 2. **La coreografía YA tiene su curva.** Cada keyframe lleva su `ease`
 *    (`shift`, `arrive`) y el arco de luz la suya. Poner una segunda curva
 *    encima cambiaría qué pose se ve en cada punto del scroll sin tocar un
 *    keyframe: sería mover la escena por la puerta de atrás.
 * 3. **El escalón de ritmo en un nudo no se ve, y está medido por qué.** La
 *    cámara no salta a la pose del progreso: la **persigue** con amortiguación
 *    (§2.3, `SETTLE_TAU` de 0,20 a 0,28 s). Un cambio de velocidad en un nudo lo
 *    absorbe esa constante de tiempo; lo que se vería es un salto de POSICIÓN, y
 *    la recta por tramos es continua.
 *
 * ── LO QUE ESTE CONTRATO NO DECIDE ─────────────────────────────────────────
 *
 * **Cómo entra y sale la escena** (§7.4). Acá se deriva **cuándo** un panel
 * transparente está en cuadro; con qué gesto aparece o desaparece la sala sigue
 * siendo decisión del humano, y es la reserva de §7.29.
 */

import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from './choreography'
import { SECCIONES } from '../secciones'
import { type Anclaje, type TramoAnclado, derivarAnclaje } from './anclajeDerivacion'

export { comoId, pantallasDe } from './anclajeDerivacion'
export type {
  Anclaje,
  BordeDeTramo,
  GeometriaDeSeccion,
  Nudo,
  TramoAnclado,
} from './anclajeDerivacion'

// ── LA DECISIÓN, como dato ──────────────────────────────────────────────────

/**
 * **QUÉ TRAMO CORRE SOBRE QUÉ SECCIONES.** Es lo único escrito a mano de este
 * archivo, y es la decisión del sprint. Todo lo demás se deriva de acá, de
 * `secciones.ts` y de `choreography.ts`.
 *
 * Los cuatro primeros son la identidad —el tramo corre sobre la sección que le
 * da el nombre—. Los dos últimos son el reparto que el home obliga:
 *
 * - `demos` no tiene sección propia y corre sobre las dos que no tienen
 *   keyframe. Es el tramo que **avanza sin que nadie lo vea**.
 * - `cierre` corre sobre `por-que-develop` porque la sección `cierre` **no tiene
 *   recorrido de scroll propio**: mide una pantalla y es la última, así que
 *   llena el cuadro exactamente en el final del scroll. Un tramo sobre ella
 *   sería un tramo de ancho cero, y el guardián 3 de la derivación lo rechaza.
 *
 * ── ⚠️ V3-E · EL ANCLA DEL DIFERENCIAL YA NO ESTÁ CUANTIZADA: SE DECLARA ─────
 *
 * V3-B midió el defecto 7 de §7.46 —en `por-que-develop` el logo tapa el titular
 * y ahí el contraste es 1,00:1 **por construcción**, porque la tinta del texto y
 * la del logo son el mismo negro— y publicó las dos mitades juntas en
 * `s13b-escena.invariant.ts` §4: **la ventana existe, p = [0,8232 · 0,8782]**
 * —desde donde el titular puede quedar limpio en los cuatro cuadros hasta donde
 * el peor píxel del fondo deja de llegar a AA— **y con este array solo no se
 * llegaba**: enumerados los 28 repartos posibles, el ancla sólo podía tomar
 * **0,7500 y 0,9167**. Estaba cuantizada porque una sección llena el cuadro en
 * `progresoDePantalla(su desdePantalla)`, y ese progreso cae en un NUDO —el `to`
 * de un tramo, múltiplo exacto de 1/8— siempre que la sección sea la primera de
 * su grupo. Esa enumeración **sigue corriendo y sigue dando dos valores**: no se
 * aflojó nada, se le agregó una perilla que el reparto no tenía.
 *
 * ✅ **LA SALIDA (c), CONSTRUIDA: el ancla se DECLARA.** Un tramo puede decir
 * dónde ADENTRO de él ancla su primera sección (`ancla`, en `TramoAnclado`) y la
 * derivación corre la PANTALLA en la que cierra el tramo anterior hasta que la
 * recta pase por ahí — `cierreCorridoPorElAncla`. No toca una pose, no toca
 * `secciones.ts` y no agrega un nudo: los siete siguen siendo el origen más un
 * borde por tramo, y sus siete progresos siguen siendo los de la coreografía.
 *
 * **El valor: 0,8525**, con las cuatro cifras que lo eligen (`s16-anclaje` §5):
 * queda **+0,0293** arriba del borde de abajo y **−0,0257** abajo del cruce de
 * AA; el borde de abajo es un **escalón** cuyo próximo peldaño está en 0,8509 —el
 * que aparece si el titular crece un 7%—, así que el ancla se pone arriba de ese
 * peldaño y la superposición no vuelve por una recomposición tipográfica; el
 * contraste ahí da **4,98:1**, 10,7% arriba de AA, contra 4,59:1 (1,9%) en
 * 0,8750, o sea que comprar más margen de superposición cuesta contraste rápido;
 * y **vuelve exacta del mapeo**: `progresoDePantalla(12) === 0,8525` al bit.
 *
 * ⚠️ **LO QUE CUESTA, declarado (regla 12):** el ancla de `tu-panel` se corre de
 * 0,7000 a 0,7121 (+0,0121). Es inevitable con siete nudos —si el nudo que lleva
 * el progreso 0,750 se queda en la pantalla 12, el ancla del diferencial ES 0,750;
 * si se corre, el segmento que lo precede cambia de ritmo— y `tu-panel` es
 * `papel-opaco`: el tramo `demos` corre escondido detrás de él y su ancla no se
 * ve. La forma que NO lo movería pide un nudo por sección (ocho nudos), y eso
 * rompe `RITMO_POR_SEGMENTO` en `recorrido.ts`, que asume uno por tramo.
 */
export const TRAMOS_ANCLADOS: readonly TramoAnclado[] = [
  { tramo: 'hero', secciones: ['hero'] },
  { tramo: 'quiénes somos', secciones: ['quienes-somos'] },
  { tramo: 'números', secciones: ['numeros'] },
  { tramo: 'trabajos', secciones: ['trabajos'] },
  { tramo: 'demos', secciones: ['servicios', 'tu-panel'] },
  { tramo: 'cierre', secciones: ['por-que-develop'], ancla: 0.8525 },
]

export type Reasignacion = {
  readonly keyframe: string
  readonly seccion: string
  readonly razon: string
}

/**
 * **EL KEYFRAME QUE CAMBIA DE DUEÑO.** Un keyframe cuyo nombre no es el de
 * ninguna sección, adoptado por la sección que lo necesita. Se declara acá, con
 * su razón, para que nadie lo lea como un accidente del reparto.
 */
export const REASIGNACIONES: readonly Reasignacion[] = [
  {
    keyframe: 'demos',
    seccion: 'por-que-develop',
    razon:
      'demos era una seccion del plan viejo que el sitio ya no tiene. Su pose es la mas intima ' +
      'del recorrido —el logo llena el 81% del alto del cuadro, contrapicado a distancia 9, el ' +
      'sol en contraluz a gamma 155-166°— y es la unica compuesta para mirarse sin texto encima. ' +
      'El diferencial es la segunda de las dos secciones que dejan ver la sala y la que argumenta ' +
      'por que develOP: la pose que le faltaba es esa. El tramo demos corre escondido detras de ' +
      'Servicios y Tu panel, y desde V3-E cierra ADENTRO de Tu panel: la pose con la que ese tramo ' +
      'CIERRA es la pose con la que el diferencial ASOMA, y para cuando llena el cuadro —en el ancla ' +
      'declarada— la camara ya se alejo lo suficiente para que el titular quede limpio. Antes de la ' +
      'descuantizacion el diferencial LLENABA el cuadro sobre esa pose, y ahi el titular se superponia ' +
      'con el logo entre 7,1% y 15,1% segun el cuadro: era el defecto 7.',
  },
]

/** El anclaje del home, derivado una vez de las tres fuentes reales. */
export const ANCLAJE: Anclaje = derivarAnclaje(SECCIONES, CHOREO_TRAMOS, TRAMOS_ANCLADOS)

/**
 * El keyframe que la coreografía alcanza en un progreso exacto, si hay uno.
 * Es de dónde sale la tabla sección ↔ keyframe sin escribirla a mano.
 */
export function keyframeEn(progreso: number): string | null {
  const k = CHOREO_KEYFRAMES.find((f) => f.at === progreso)
  return k === undefined ? null : k.name
}

/**
 * EL SCROLL DE LA PÁGINA, EN PANTALLAS DEL RECORRIDO — la coordenada que
 * comparten el mapeo y la visibilidad.
 *
 * ⚠ **Está acá, en el contrato, y no en ninguno de los dos frentes**, porque es
 * la traducción de la que dependen los dos: si el mapeo dijera que el
 * diferencial llena el cuadro en la pantalla 12 y la visibilidad creyera que la
 * 12 es otro lugar, la escena se encendería en el momento equivocado sin que
 * ningún invariante de ninguno de los dos lo viera. Una sola definición.
 *
 * ── ⚠️ V3-B · EL DENOMINADOR ES LA EXTENSIÓN DE LAS SECCIONES, NO EL DOCUMENTO ─
 *
 * Hasta V3-B esta función recibía `altoDelDocumento` —o sea
 * `document.documentElement.scrollHeight`, medido en `EscenaDelHome.tsx`— y
 * §7.46 midió lo que eso cuesta: **el documento tiene cosas que no son
 * secciones**, y el anclaje se deriva de la tabla de secciones. Las dos
 * coincidían *mientras* todo lo que sumara alto fuera una de las ocho. Sacar el
 * pie de la `<section id="cierre">` —el defecto 6, frenado por esto— le suma
 * **485 px a 1440 y 746 px a 375** por fuera de la tabla, y con eso el progreso
 * que entonces valía **0,750** donde el diferencial llena el cuadro pasaba a
 * **0,7201 y 0,6906**: movía el anclaje de SITIO-S9 sin tocar una línea de él.
 *
 * Ahora entra **la extensión de las secciones**: dónde empieza la primera y
 * dónde termina la última, en coordenadas del documento. Con eso el defecto 6 se
 * destraba solo — el pie puede vivir donde quiera, adentro o afuera del `<main>`,
 * y el progreso de cada sección **no se mueve un bit**, porque nada que no sea
 * una sección entra en la cuenta. Lo mide `s13b-escena.invariant.ts` §3 con la
 * regla vieja al lado como control.
 *
 * **Sigue siendo PROPORCIONAL y no absoluta**, y ésa es la decisión que NO
 * cambió:
 *
 *   pantalla = PANTALLAS_DE_SCROLL × (scrollY − arriba) / ((abajo − arriba) − ventana)
 *
 * La alternativa —`scrollY / ventana`, o sea contar pantallas absolutas— es más
 * directa y tiene un modo de falla que este proyecto ya conoce: si las secciones
 * reales no miden exactamente lo que la tabla declara, el final del recorrido
 * deja de caer en el último nudo y **el último keyframe no se alcanza nunca**.
 * Con la forma proporcional, el borde de arriba de la primera sección y el de
 * abajo de la última caen SIEMPRE en `0` y en `PANTALLAS_DE_SCROLL`, y cuando
 * las secciones miden lo que la tabla dice —que es el caso arriba de 1025, donde
 * el `alto` de cada una es un `min-height` que el contenido no pasa— esta forma
 * y la de antes son la misma función. Lo único que cambió es **de qué** es
 * proporcional: de las ocho secciones, y no del documento que las contiene.
 *
 * ⚠ **La ventana de validez, declarada (regla 12):** una pantalla es `100svh` y
 * acá se mide con `altoDeLaVentana`. Los dos coinciden en escritorio, que es
 * donde la escena existe —abajo de 1025 la compuerta no monta nada de esto—;
 * en mobile `svh` es la altura chica y `innerHeight` crece cuando la barra del
 * navegador se retrae. La forma proporcional acota ese desajuste a un
 * reescalado del recorrido entero, nunca a un corrimiento de los anclajes.
 *
 * Con unas secciones que no scrollean —o con la pestaña oculta, donde toda
 * medida da cero— devuelve 0, que es la primera pantalla: el lado seguro.
 */
export function pantallaDeScroll(
  scrollY: number,
  arribaDeLasSecciones: number,
  abajoDeLasSecciones: number,
  altoDeLaVentana: number,
): number {
  const recorrido = abajoDeLasSecciones - arribaDeLasSecciones - altoDeLaVentana
  if (!(recorrido > 0)) return 0
  const fraccion = (scrollY - arribaDeLasSecciones) / recorrido
  const acotada = fraccion < 0 ? 0 : fraccion > 1 ? 1 : fraccion
  return acotada * ANCLAJE.pantallasDeScroll
}

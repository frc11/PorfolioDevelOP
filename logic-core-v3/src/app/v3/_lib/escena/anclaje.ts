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
 * de las seis —Hero (0,000), Por qué develOP (0,750) y Cierre (1,000), que son
 * las tres que ARRIBAN sobre su pose— y para las otras tres la pose es la de
 * **salida**: Quiénes somos, Números y Trabajos entran sobre la pose de la
 * anterior y llegan a la suya al entregar el cuadro. Las tres que arriban son
 * las que la medición de tinta necesita, incluida la única que decide §7.29.
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
 * ese tramo cierra es la pose con la que el diferencial ENTRA**. Por eso la
 * reasignación se declara acá como dato, con un guardián que exige que el
 * keyframe exista, que no sea el de ninguna sección, y que caiga en un borde de
 * la ventana de progreso de la sección que lo recibe.
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
 */
export const TRAMOS_ANCLADOS: readonly TramoAnclado[] = [
  { tramo: 'hero', secciones: ['hero'] },
  { tramo: 'quiénes somos', secciones: ['quienes-somos'] },
  { tramo: 'números', secciones: ['numeros'] },
  { tramo: 'trabajos', secciones: ['trabajos'] },
  { tramo: 'demos', secciones: ['servicios', 'tu-panel'] },
  { tramo: 'cierre', secciones: ['por-que-develop'] },
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
      'Servicios y Tu panel, asi que la pose con la que ese tramo CIERRA es la pose con la que el ' +
      'diferencial ENTRA.',
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
 * **Es PROPORCIONAL al recorrido real y no absoluta**, y ésa es la decisión:
 *
 *   pantalla = PANTALLAS_DE_SCROLL × scrollY / (altoDelDocumento − ventana)
 *
 * La alternativa —`scrollY / ventana`, o sea contar pantallas absolutas— es más
 * directa y tiene un modo de falla que este proyecto ya conoce: si el documento
 * real no mide exactamente lo que la tabla declara, el final del scroll deja de
 * caer en el último nudo y **el último keyframe del recorrido no se alcanza
 * nunca**. Es el mismo motivo por el que el mapeo provisional restaba la ventana
 * en vez de normalizar contra el alto entero. Con la forma proporcional, `0` y
 * el final del scroll caen SIEMPRE en `0` y en `PANTALLAS_DE_SCROLL`, y cuando
 * el documento mide lo que la tabla dice —que es el caso arriba de 1025, donde
 * el `alto` de cada sección es un `min-height` que el contenido no pasa— las dos
 * formas son la misma función.
 *
 * ⚠ **La ventana de validez, declarada (regla 12):** una pantalla es `100svh` y
 * acá se mide con `altoDeLaVentana`. Los dos coinciden en escritorio, que es
 * donde la escena existe —abajo de 1025 la compuerta no monta nada de esto—;
 * en mobile `svh` es la altura chica y `innerHeight` crece cuando la barra del
 * navegador se retrae. La forma proporcional acota ese desajuste a un
 * reescalado del recorrido entero, nunca a un corrimiento de los anclajes.
 *
 * Con un documento que no scrollea —o con la pestaña oculta, donde el alto da
 * cero— devuelve 0, que es la primera pantalla: el lado seguro.
 */
export function pantallaDeScroll(
  scrollY: number,
  altoDelDocumento: number,
  altoDeLaVentana: number,
): number {
  const recorrido = altoDelDocumento - altoDeLaVentana
  if (!(recorrido > 0)) return 0
  const fraccion = scrollY / recorrido
  const acotada = fraccion < 0 ? 0 : fraccion > 1 ? 1 : fraccion
  return acotada * ANCLAJE.pantallasDeScroll
}

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
import { join } from 'node:path'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'

import { CONTENIDO } from './contenido'
import {
  DESTINO_DEL_CTA,
  MEDIDAS_DE_LAS_CAPTURAS,
  CORTES_DEL_CARTEL,
  PX_DEL_CARTEL,
  PX_DE_LA_APROXIMACION,
  PX_DE_LA_SECCION,
} from './geometria'
import { ENTRADAS_AL_TRAMO, cruceDelTramo, gestoDelCruce, type CruceObservado, type EntradaAlTramo } from './gota'
import { afirmarElRotulo } from './trabajos-rotulo'
import { afirmarLasVentanas } from './trabajos-ventanas'
import {
  ANCHO_DEL_CTA,
  ANCHO_DEL_CUADRO_DE_REFERENCIA,
  CAPAS_DEL_TUNEL,
  DURACION_DEL_FRENO_MS,
  PX_DEL_ESPACIO_DE_DEMOS,
  PX_DEL_TUNEL,
  PX_DE_LA_SALIDA,
  PX_MINIMOS_DE_LA_ESPERA_DEL_CTA,
  RESORTE_DEL_TUNEL,
  ZETA_DEL_RESORTE,
  avanzarElResorte,
  escalaDeLaCapa,
  poseDelTunel,
  type CapaDeLaTabla,
} from './tunel'
import {
  CRUCES_DEL_TRAMO,
  ancestrosDe,
  medidasDeWebp,
  pxDelTema,
  recorridoDelResorte,
  type EstadoDeUnResorte,
} from './trabajos-piezas'

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
  // B12: las piezas y la capa de la gota salieron de `Trabajos.tsx` al mudar el
  // título y la bajada al escenario. Se despachan igual, así que se leen igual.
  'piezas.tsx',
  // El trabajo con sus dos medios: la etapa 1 del portfolio lo volvió pieza de
  // composición, así que entra a la fuente que el instrumento lee.
  'Proyecto.tsx',
  'CapaDeLaGota.tsx',
  'gota.ts',
  // PORTFOLIO: el túnel, con el mismo reparto que la gota — el núcleo puro y la
  // capa fina que lo escribe.
  'CapaDelTunel.tsx',
  'tunel.ts',
  'geometria.ts',
  'asentamiento.ts',
  'contenido.ts',
].map((f) => ({ archivo: f, texto: leer(f) }))

/** El fuente de la COMPOSICIÓN y el de las PIEZAS, juntos: desde B12 los
 *  `patron="…"` viven en el segundo y el marcado de la sección en los dos. */
export const FUENTE_DE_LA_COMPOSICION: string = FUENTES.filter((f) => f.archivo === 'Trabajos.tsx' || f.archivo === 'piezas.tsx' || f.archivo === 'Proyecto.tsx' || f.archivo === 'CapaDelTunel.tsx')
  .map((f) => f.texto)
  .join(String.fromCharCode(10))

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
 * ⚠️ **§19 DEL INVARIANTE, MUDADO ACÁ POR LA REGLA DE LAS 300 LÍNEAS.**
 *
 * Es el mismo corte que la cabecera describe: el invariante se parte, no se
 * afloja. **No se tocó una afirmación al mudarlo.** Va en el arnés y no en
 * `trabajos-piezas.ts` porque eso son detectores puros y esto son afirmaciones,
 * que es la misma división que `s5-contenido-piezas.ts` y `s21-llave-soporte.tsx`
 * ya hacen en sus lanes.
 */
export function afirmarLasCuatroEntradas(): void {
  // ════════════════════════════════════════════════════════════════════════════
  titulo('19 · El barrido: las CUATRO entradas al tramo, y en cuáles corre')

  /**
   * ⚠️ **EL DEFECTO QUE ESTO CIERRA: el barrido se disparaba al volver desde
   * Servicios**, a pantalla completa y encima de las capturas del túnel.
   *
   * La causa es la de siempre en este archivo: **un booleano que junta dos
   * situaciones distintas.** `isIntersecting` es cierto al llegar desde Quiénes
   * somos —bajando— y también al volver desde Servicios —subiendo—, y el
   * observador dispara igual en las dos. Es hermano del que `salioPorArriba` ya
   * había mostrado: ahí era «volvimos» contra «todavía no llegamos».
   *
   * El tramo tiene dos fronteras y cada una se cruza en dos sentidos: **cuatro**
   * entradas. Acá se afirman las cuatro por separado, con la caja que el evento
   * trae, y se declara en cuáles corre el barrido y en cuáles no.
   */

  for (const c of CRUCES_DEL_TRAMO) {
    afirmarIgual(cruceDelTramo(c.caja), c.entrada, `«${c.cuando}» se clasifica como \`${c.entrada}\``)
    afirmarIgual(gestoDelCruce(c.entrada), c.gesto, `  y ahí el barrido hace \`${c.gesto}\``)
  }
  afirmarIgual(
    [...CRUCES_DEL_TRAMO].map((c) => c.entrada).sort(),
    [...ENTRADAS_AL_TRAMO].sort(),
    'las cuatro entradas están cubiertas y no hay una quinta: el censo es el vocabulario entero',
  )
  afirmarIgual(
    ENTRADAS_AL_TRAMO.filter((e) => gestoDelCruce(e) !== 'nada'),
    ['arriba-bajando', 'arriba-subiendo'],
    'el barrido corre en DOS de las cuatro, y las dos son la frontera con Quiénes somos: en la de Servicios no corre en ningún sentido',
  )
  controlPositivo(
    'el censo ve una guarda que confunde entrar por arriba con volver desde abajo',
    (c: CruceObservado): EntradaAlTramo => (c.cruza ? 'arriba-bajando' : 'arriba-subiendo'),
    (clasificar: (c: CruceObservado) => EntradaAlTramo) => CRUCES_DEL_TRAMO.every((c) => clasificar(c.caja) === c.entrada),
  )
  controlPositivo(
    '  y ve una política que hace correr el barrido en la frontera de abajo',
    (e: EntradaAlTramo) => (e === 'abajo-subiendo' ? 'ida' : gestoDelCruce(e)),
    (politica: (e: EntradaAlTramo) => string) =>
      ENTRADAS_AL_TRAMO.filter((e) => politica(e) !== 'nada').join(' ') === 'arriba-bajando arriba-subiendo',
  )
}

/**
 * LO QUE PIDE EL RECORRIDO ENTERO, en píxeles de scroll.
 *
 * Es la cuenta que reemplazó a «los pasos son los proyectos»: el alto de la
 * sección ya no sale del contenido sino de esto. Vive en el arnés porque es
 * plomería —sumar constantes— y no una afirmación.
 *
 * ⚠️ **DEL CARTEL SUMA LO QUE NO SE SOLAPA, y por eso no es `PX_DEL_CARTEL`.**
 * El túnel arranca donde el cartel EMPIEZA A HUIR y no donde termina —es una
 * derivación declarada: la primera captura nace mientras el cartel se va—, así
 * que los últimos 38 % del cartel corren encima del túnel. Sumar el cartel
 * entero contaría ese solapamiento dos veces y pediría 456 px que nadie gasta.
 *
 * ⚠️ **Y LA APROXIMACIÓN SUMA aunque no sea un tramo del recorrido.** El progreso
 * de esta sección abre un viewport antes de que el panel quede puesto, y ese
 * tramo se gasta igual: si no entrara en la cuenta, el alto declarado alcanzaría
 * para los cuatro gestos y el último se cortaría contra el final del progreso.
 * Su motivo, con la medición que lo encontró, está en `PX_DE_LA_APROXIMACION`.
 *
 * ⚠️ **Y EL CTA NO SUMA APARTE.** Es la última capa de la tabla, así que su
 * recorrido está adentro de `PX_DEL_TUNEL`. Lo que sí suma son la SALIDA —lo que
 * tarda el contenido en irse a velocidad de scroll— y el ESPACIO DE DEMOS.
 */
export function sumaDeLosTramos(cuantas: number): number {
  void cuantas
  return (
    PX_DE_LA_APROXIMACION +
    PX_DEL_CARTEL * CORTES_DEL_CARTEL.seVa +
    PX_DEL_TUNEL +
    PX_MINIMOS_DE_LA_ESPERA_DEL_CTA +
    PX_DE_LA_SALIDA +
    PX_DEL_ESPACIO_DE_DEMOS
  )
}

/**
 * ⚠️ **§17 DEL INVARIANTE — el túnel: la tabla, el anidamiento y el CTA.**
 *
 * Esto no comprueba que el túnel se vea bien —eso lo dice la superposición con la
 * referencia, en el navegador—: comprueba que su función de avance sea la de
 * ella, que las capas estén anidadas DE VERDAD en el marcado, y que el CTA llegue
 * a su tamaño con la fracción que el túnel produce y no con una puesta a mano.
 */
/** Cuántos `will-change-transform` tiene que escribir `CapaDelTunel`: TRES —el
 *  escenario y las capas de proyecto, que escalan, y la capa entera, que se
 *  traslada en la salida—. La capa del CTA lleva el suyo en `piezas.tsx`. */
const CUANTAS_CAPAS_PROMOVIDAS = 3

export function afirmarElTunel(conMotion: string, quieto: string, cuantas: number): void {
  titulo('17 · El túnel: la tabla medida, anidada, y el CTA que llega')

  // ── CADA CAPA ES UNA RECTA CON CLAMP ────────────────────────────────────
  /**
   * ⚠️ **La función de avance es la de la referencia**, leída de su bundle y
   * reproducida por sus 36 muestras: recta entre `arranca` y `topa`, quieta
   * afuera. Se mira en las dos puntas, a un cuarto y a la mitad, y afuera de las
   * dos. El control es una exponencial entre las MISMAS puntas —lo que se
   * derivaba antes—: coincide en los extremos y falla en el medio.
   */
  const CAPAS: readonly CapaDeLaTabla[] = [CAPAS_DEL_TUNEL.escenario, ...CAPAS_DEL_TUNEL.proyectos, CAPAS_DEL_TUNEL.cta]
  const esRectaConClamp = (ley: (capa: CapaDeLaTabla, y: number) => number): boolean =>
    CAPAS.every((c) => {
      const en = (t: number): number => ley(c, c.arranca + t * (c.topa - c.arranca))
      return (
        ley(c, c.arranca - 500) === c.de &&
        ley(c, c.topa + 500) === c.a &&
        Math.abs(en(0.25) - (c.de + (c.a - c.de) * 0.25)) < 1e-12 &&
        Math.abs(en(0.5) - (c.de + c.a) / 2) < 1e-12
      )
    })
  afirmar(esRectaConClamp(escalaDeLaCapa), `las ${CAPAS.length} capas escalan en RECTA entre su arranque y su tope, y se quedan quietas afuera: la función de avance de la referencia`)
  controlPositivo(
    'el chequeo vería una exponencial entre las mismas puntas, que es la clase de ley que se derivaba',
    (c: CapaDeLaTabla, y: number): number => {
      const t = Math.min(1, Math.max(0, (y - c.arranca) / (c.topa - c.arranca)))
      return c.de + ((c.a - c.de) * (Math.exp(3 * t) - 1)) / (Math.exp(3) - 1)
    },
    esRectaConClamp,
  )

  // ── EL ANIDAMIENTO ESTÁ EN EL MARCADO, NO SÓLO EN LA CUENTA ─────────────
  /**
   * ⚠️ **Multiplicar las escalas a mano no es anidar**, y la decisión fue anidar:
   * es la estructura la que produce el efecto. Así que se lee del marcado que
   * sale del servidor qué capas envuelven al CTA, en orden. Y que entre ellas no
   * haya ni un ancla ni una captura: la hija va AFUERA de la captura de su madre,
   * o habría un enlace adentro de otro y el orden anunciado cambiaría.
   */
  const cadena = (html: string): string[] =>
    ancestrosDe(html, 'data-capa="cta"')
      .map((t) => /data-capa="([^"]+)"/.exec(t)?.[1] ?? null)
      .filter((c): c is string => c !== null)
  const CADENA_ESPERADA = ['escenario', ...CAPAS_DEL_TUNEL.proyectos.map((_, i) => `proyecto-${String(i)}`)]
  afirmarIgual(cadena(conMotion), CADENA_ESPERADA, 'el CTA vive adentro del tercer proyecto, que vive adentro del segundo, del primero y del escenario: la matrioska, en el marcado')
  controlPositivo(
    'el detector vería las capas como hermanas con la escala multiplicada a mano',
    '<div data-capa="escenario"></div><div data-capa="proyecto-0"></div><div data-capa="proyecto-1"></div><div data-capa="proyecto-2"></div><div data-capa="cta"></div>',
    (html: string) => cadena(html).join() === CADENA_ESPERADA.join(),
  )
  const entreMedio = ancestrosDe(conMotion, 'data-capa="cta"').filter((t) => t.startsWith('<a ') || t.includes('data-captura='))
  afirmarIgual(entreMedio, [], '  y entre ellas no hay un ancla ni una captura: cada hija va después de la captura de su madre, afuera de ella')

  // ── LOS PROYECTOS TERMINAN ADENTRO DE UNA IMAGEN, COMO EN ELLA ──────────
  /**
   * ⚠️ Nuestras capturas son 16:9, así que cubren el cuadro de 1440 × 900 recién
   * a 900 / 810 = 1,111 anchos. Los tres proyectos de la tabla terminan por
   * encima —el espectador queda ADENTRO de cada uno, como en la referencia— y ésa
   * es una propiedad de la ELECCIÓN de capas, no de la cuenta. El control es la
   * otra elección que se evaluó (sus #1, #2 y #3): termina en 0,983 y deja la sala
   * a la vista arriba y abajo.
   */
  const CUBRE_EL_CUADRO = ALTO_DE_VIEWPORT_DE_LA_REFERENCIA / (ANCHO_DEL_CUADRO_DE_REFERENCIA * (9 / 16))
  const finales = poseDelTunel(PX_DEL_TUNEL).anchos
  afirmar(
    finales.every((a) => a >= CUBRE_EL_CUADRO),
    `los tres proyectos terminan cubriendo el cuadro: ${finales.map((a) => a.toFixed(3)).join(' · ')} anchos, todos arriba de ${CUBRE_EL_CUADRO.toFixed(3)}`,
  )
  controlPositivo(
    'el chequeo vería la elección que termina sin cubrir (sus #1, #2 y #3)',
    [1.3 * 0.7, 1.3 * 0.7 * 0.9, 1.3 * 0.7 * 0.9 * 1.2],
    (anchos: number[]) => anchos.every((a) => a >= CUBRE_EL_CUADRO),
  )

  // §22 —la tabla, el CTA que llega y nada nace ni muere— vive en
  // `trabajos-nacimiento.ts`, que se llama desde §21.

  afirmar(
    PX_DEL_TUNEL < PX_DE_LA_SECCION,
    `el túnel entero entra en la sección sin tocarle el alto: pide ${PX_DEL_TUNEL} px de los ${PX_DE_LA_SECCION}`,
  )

  // §23 —las cuatro ventanas del recorrido— vive en `trabajos-ventanas.ts`,
  // por la regla de las 300 líneas. Mismo corte por TEMA que §21 y §22.
  afirmarLasVentanas(cuantas, pxDelTema(CSS, 'foco-desplazamiento') + pxDelTema(CSS, 'foco-grosor'))

  // §21 —el rótulo y su banda— vive en `trabajos-rotulo.ts`, por la regla de
  // las 300 líneas. Mismo corte por TEMA que usó servicios con `s6-traspaso.ts`.
  afirmarElRotulo(cuantas, conMotion)

  // ── EL CTA ───────────────────────────────────────────────────────────────────────────
  afirmar(ANCHO_DEL_CTA < 1, `la ventana del CTA NO cubre la pantalla: crece hasta ${ANCHO_DEL_CTA} del ancho y ahí se queda`)
  afirmar(
    conMotion.includes(DESTINO_DEL_CTA) && quieto.includes(DESTINO_DEL_CTA),
    `el CTA es un enlace real a contacto —${DESTINO_DEL_CTA}, el mismo destino que declara la navegación— en las DOS ramas`,
  )
  afirmarIgual(veces(conMotion, 'data-pieza="enlace-del-cta"'), 1, '  y es UNO solo: no hay dos anclas al mismo lugar en el mismo cuadro')

  // ── EL FRENO NO TOCA EL SCROLL ──────────────────────────────────────────
  /**
   * ⚠️ **El repo prohíbe frenar el scroll, y acá no se frena.** Lo que se detiene
   * es el AVANCE del tramo. Esto lo afirma sobre la fuente porque es la clase de
   * cosa que se agrega sin querer cuando alguien quiere «que frene de verdad».
   */
  const FUENTE_DEL_TUNEL = FUENTES.find((f) => f.archivo.includes('CapaDelTunel'))?.texto ?? ''
  afirmar(FUENTE_DEL_TUNEL.length > 0, 'se leyó del disco la fuente de la capa del túnel')
  // ⚠️ El nombre del motor de scroll NO se escribe entero en la lista: el detector
  // lee esta misma fuente y un literal acá se contaría a sí mismo. Se arma partido.
  for (const prohibido of ['preventDefault', 'scrollTo', 'scrollBy', 'len' + 'is', 'overscroll']) {
    afirmarIgual(veces(FUENTE_DEL_TUNEL, prohibido), 0, `  la capa no usa \`${prohibido}\`: el freno es del gesto, no del scroll`)
  }
  afirmarIgual(
    veces(FUENTE_DEL_TUNEL, "setProperty('visibility'"),
    0,
    '  y no esconde con `visibility`: eso sacaría del recorrido de teclado a las anclas del túnel',
  )
  afirmar(
    FUENTE_DEL_TUNEL.includes('focusin') && FUENTE_DEL_TUNEL.includes('pisoDelFoco'),
    '  hay un piso del foco: una parada que no se ve no sirve, así que enfocar una captura la muestra',
  )
  controlPositivo(
    'el detector vería una capa que vuelve a esconder con `visibility`',
    "el.style.setProperty('visibility', 'hidden')",
    (src: string) => veces(src, "setProperty('visibility'") === 0,
  )

  // ── LA SALIDA VA A VELOCIDAD DE SCROLL, Y NADA SE DESVANECE ───────────
  const fuenteDeLaCapa = FUENTES.find((f) => f.archivo.includes('CapaDelTunel'))?.texto ?? ''
  /**
   * ⚠️ **ESTAS AFIRMACIONES CAMBIARON DE SIGNO TRES VECES. La cuarta es la buena.**
   *
   * Primero la capa se iba con una huida —z negativo y desvanecido— y se
   * comprobaba que la opacidad llegara a cero. Después subía con un
   * `translateY(−130 %)` y se comprobaba la traslación. Después se exigía que NO
   * se trasladara, porque las dos anteriores eran deslizamientos impuestos.
   *
   * Y esa tercera dejó un defecto de estructura: sin traslación, lo único que
   * saca el contenido es el despineado del panel, que dura exactamente un
   * viewport y ocurre **mientras servicios entra por abajo**. Nunca queda un
   * cuadro con la sala sola, y por eso el espacio de demos no se percibía.
   *
   * Así que la capa vuelve a trasladarse, y lo que se afirma es la VELOCIDAD:
   * que lo haga en PÍXELES —no en porcentaje del contenedor, que ataría la
   * velocidad a cuánto mida la caja— y que la cuenta sea 1:1 con el scroll. A
   * esa velocidad no hay nada que distinguir de un scroll normal, porque es la
   * velocidad del scroll.
   */
  afirmarIgual(
    veces(fuenteDeLaCapa, "capa.style.setProperty('transform'"),
    1,
    'la capa se traslada UNA vez, en la salida: el contenido se va a velocidad de scroll',
  )
  afirmar(
    /translateY\(\$\{\(-salida\)\.toFixed\(1\)\}px\)/.test(fuenteDeLaCapa),
    '  y lo escribe en PÍXELES: en porcentaje la velocidad dependería de cuánto mida la caja, y la igualdad con el scroll se perdería',
  )
  controlPositivo(
    'el detector vería la levantada vieja, escrita en porcentaje del contenedor',
    'capa.style.setProperty(`transform`, `translateY(${-subida}%)`)',
    (src: string) => /translateY\(\$\{\(-salida\)\.toFixed\(1\)\}px\)/.test(src),
  )
  afirmarIgual(
    veces(fuenteDeLaCapa, "capa.style.setProperty('opacity'"),
    0,
    '  y NO toca su opacidad: nada se desvanece, todo sale por arriba — la variable se llama `capa` justo para que esto se pueda afirmar',
  )
  controlPositivo(
    '  y un desvanecido que vuelve',
    "capa.style.setProperty('opacity', '0')",
    (src: string) => veces(src, "capa.style.setProperty('opacity'") === 0,
  )
  /**
   * ⚠️ **Y AHORA SÍ VA `will-change` SOBRE LA CAPA**, porque volvió a moverse.
   * La regla del repo pide la capa de composición sobre el elemento que
   * efectivamente se transforma, y en la salida ése es este contenedor.
   */
  afirmarIgual(
    veces(fuenteDeLaCapa, 'will-change-transform'),
    CUANTAS_CAPAS_PROMOVIDAS,
    `  y quedan ${CUANTAS_CAPAS_PROMOVIDAS} capas promovidas en el archivo: el escenario y las de proyecto, que escalan, y la capa entera, que se traslada en la salida`,
  )

  // ── EL RECORTE Y SU MARGEN ──────────────────────────────────────────────
  afirmar(conMotion.includes('overflow:clip'), 'la capa recorta al cuadro: sin eso el desborde le da al sitio 459 px de scroll horizontal')
  afirmar(conMotion.includes('overflow-clip-margin'), '  y recorta con margen: `hidden` se comería el anillo de foco de las anclas')
  // El recorte de la VENTANA del CTA sí es `hidden`, y está bien: recorta a sus
  // propios hijos, no al anillo de foco, que se dibuja por fuera de su caja. Que
  // ningún focalizable quede adentro de una caja recortada lo afirma `s5-compacto`
  // sobre las cuatro secciones enteras, que es donde esa regla vive.
  const margenDelAnillo = pxDelTema(CSS, 'foco-desplazamiento') + pxDelTema(CSS, 'foco-grosor')
  const margenEscrito = Number(/overflow-clip-margin:\s*(\d+(?:\.\d+)?)px/.exec(conMotion)?.[1] ?? NaN)
  afirmarIgual(margenEscrito, margenDelAnillo, `  y el margen son los ${margenDelAnillo} px del anillo, leídos del tema y no elegidos acá`)

  // ── LAS CAPTURAS MIDEN LO QUE LA GEOMETRÍA DECLARA ──────────────────────
  for (const [i, proyecto] of CONTENIDO.proyectos.entries()) {
    const declarada = MEDIDAS_DE_LAS_CAPTURAS[i]
    const real = medidasDeWebp(new Uint8Array(readFileSync(join('public', proyecto.pagina.fuente))))
    afirmarIgual([real.ancho, real.alto], [declarada.ancho, declarada.alto], `«${proyecto.nombre}» — el archivo en disco mide lo que declara la geometría`)
  }
  afirmarIgual(
    [...new Set(MEDIDAS_DE_LAS_CAPTURAS.map((m) => (m.ancho / m.alto).toFixed(6)))],
    [(16 / 9).toFixed(6)],
    '  y las tres comparten relación: por eso las tres crecen igual sin que nadie lo declare',
  )
  afirmarIgual(MEDIDAS_DE_LAS_CAPTURAS.length, cuantas, '  y hay exactamente una medida por proyecto')

  // ── EL RESORTE ES EL DE LA REFERENCIA ───────────────────────────────────
  afirmarIgual(
    ZETA_DEL_RESORTE.toFixed(2),
    '3.41',
    `el resorte es el de la referencia —rigidez ${RESORTE_DEL_TUNEL.rigidez}, amortiguamiento ${RESORTE_DEL_TUNEL.amortiguamiento}, masa ${RESORTE_DEL_TUNEL.masa}—: ζ = 3,41, sobreamortiguado`,
  )
  const hacia1 = (e: EstadoDeUnResorte, dt: number): EstadoDeUnResorte => avanzarElResorte(e, 1, dt)
  const a60 = recorridoDelResorte(3000, 1000 / 60, hacia1)
  const a144 = recorridoDelResorte(3000, 1000 / 144, hacia1)
  afirmar(a60.maximo <= 1, `  y no rebota: en 3 s de escalón no pasa nunca del objetivo (lo más lejos que llega: ${a60.maximo.toFixed(6)})`)
  controlPositivo(
    'el chequeo del rebote vería un resorte flojo (ζ = 0,34)',
    (e: EstadoDeUnResorte, dt: number): EstadoDeUnResorte => {
      let x = e.posicion
      let v = e.velocidad
      for (let ms = 0; ms < dt; ms += 1) {
        v += (-RESORTE_DEL_TUNEL.rigidez * (x - 1) - 10 * v) * 0.001
        x += v * 0.001
      }
      return { posicion: x, velocidad: v }
    },
    (paso: (e: EstadoDeUnResorte, dt: number) => EstadoDeUnResorte) => recorridoDelResorte(3000, 1000 / 60, paso).maximo <= 1,
  )
  afirmar(
    Math.abs(a60.final - a144.final) < 1e-9,
    `  y el mismo tiempo da el mismo resultado a 60 y a 144 cuadros por segundo: ${a60.final.toFixed(9)} contra ${a144.final.toFixed(9)}`,
  )
  controlPositivo(
    '  y el de los cuadros por segundo vería el mismo resorte integrado con Euler',
    (e: EstadoDeUnResorte, dt: number): EstadoDeUnResorte => {
      const s = dt / 1000
      const a = -RESORTE_DEL_TUNEL.rigidez * (e.posicion - 1) - RESORTE_DEL_TUNEL.amortiguamiento * e.velocidad
      return { posicion: e.posicion + e.velocidad * s, velocidad: e.velocidad + a * s }
    },
    (paso: (e: EstadoDeUnResorte, dt: number) => EstadoDeUnResorte) =>
      Math.abs(recorridoDelResorte(3000, 1000 / 60, paso).final - recorridoDelResorte(3000, 1000 / 144, paso).final) < 1e-9,
  )
  /**
   * ⚠️ **LO QUE EVITA EL SALTO AL SOLTAR EL FRENO es que el resorte quede EN
   * REPOSO mientras frena** —posición quieta y velocidad cero—, no cuánto dure.
   * Así que se lee del fuente, y el control es un freno que congela la posición
   * pero se guarda la velocidad.
   */
  const frenaEnReposo = (src: string): boolean => /if \(frenaSiCorresponde\(ahora\)\) reposarEn\(/.test(src)
  afirmar(frenaEnReposo(FUENTE_DEL_TUNEL), '  mientras frena, el resorte queda en reposo —velocidad cero—: al soltar retoma desde ahí y no salta')
  controlPositivo('  el detector vería un freno que conserva la velocidad', 'if (frenaSiCorresponde(ahora)) resorte.current = { ...resorte.current }', frenaEnReposo)
  afirmar(
    DURACION_DEL_FRENO_MS < a60.msAl99,
    `  y la pausa (${DURACION_DEL_FRENO_MS} ms) es más corta que lo que el túnel mismo tarda en posarse (${a60.msAl99.toFixed(0)} ms): se lee como el túnel asentándose, no como un corte`,
  )
}

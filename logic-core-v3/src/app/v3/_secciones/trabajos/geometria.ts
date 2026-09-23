/**
 * LA GEOMETRÍA DE TRABAJOS — todos los números de la sección, juntos y fuera del
 * contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que lleguen los medios reales.
 * Mezclarlos con el contenido obligaría a exceptuarlos del escáner de cifras, y
 * una excepción es por donde vuelve a entrar la primera cifra inventada.
 *
 * ── ⚠️ LA SECCIÓN SE LEE EN CINCO TRAMOS, Y SE MIDEN EN PÍXELES ──────────
 *
 * El reparto dejó de escribirse en fracciones del progreso el día que la sección
 * cambió de alto: una fracción fija de una sección que crece le da a su tramo más
 * scroll sin que nadie lo haya decidido. Ahora cada tramo pide lo suyo en píxeles
 * y las fracciones se derivan, así que mover el alto no desarma la composición.
 *
 *     el cartel      1.200 px   llega con el gesto de la casa, se lee, y vuela
 *     el túnel       1.480 px   la tabla medida en la referencia, CTA incluido
 *     la espera     el resto    el CTA quieto en su tamaño: hoy 552, con piso de 550
 *     la salida      1.131 px   un vacío crece desde el centro y revela la escena
 *     los demos      1.800 px   la sala de noche sola
 *
 * **La suma tiene que entrar en el alto declarado**, y eso lo afirma el
 * invariante: es lo que reemplazó a «los pasos son los proyectos», que dejó de
 * ser cierto cuando el alto pasó a salir del recorrido y no del contenido.
 */

import { sizesPorViewport } from '../../_lib/imagen'
import { CLASE_INTERLETRADO, CLASE_INTERLINEADO, NIVELES_TIPOGRAFICOS } from '../../_lib/tipografia'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, ENLACES_DE_MUESTRA } from '../../_lib/navegacion'
import { PANTALLAS_DE_NUMEROS } from '../../_lib/secciones'

import { pantallasDe, seccionDe } from '../_contrato/forma'

import { ATRASO_DEL_RESORTE_PX, type BandaDelEfecto } from './regulador'
import {
  CAPAS_DEL_TUNEL,
  ORIGEN_DEL_TUNEL,
  PX_DEL_ESPACIO_DE_DEMOS,
  PX_DEL_TUNEL,
  PX_DE_LA_SALIDA,
  PX_POR_SCROLL,
  type Caja,
  type PuntoDelCuadro,
  type TiemposDelGesto,
  capaDelVacio,
} from './tunel'

/** Lo que hay que PEDIR de un medio (ancho × alto) más el `sizes` con el que se
 *  sirve. Vive acá porque es geometría y no contenido. */
export interface CajaDeLaCaptura {
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
}

/**
 * Cuántas pantallas se monta la sección sobre Números, leídas de la tabla. Es lo
 * que adelanta a Portfolio al cambio de plano de la cámara (`secciones.ts`).
 */
export const SOLAPE_DE_LA_SECCION = seccionDe('trabajos').solape ?? 0

/**
 * Las pantallas que la sección MIDE, leídas de la tabla: su alto más el solape.
 * El progreso de P7 va de «tope abajo» a «pie abajo» sobre la caja real, y la
 * caja real arranca el solape antes.
 */
export const PANTALLAS_DE_LA_SECCION = pantallasDe(seccionDe('trabajos')) + SOLAPE_DE_LA_SECCION

/**
 * ⚠️ **EL ALTO CON EL QUE SE CUENTAN LOS PÍXELES DEL RITMO — y no es nuestro.**
 *
 * El ritmo del túnel está declarado por cada 100 px de SCROLL, y el scroll que
 * una sección de tres pantallas ofrece depende del alto de la ventana. Se cuenta
 * contra 900, que es el alto de referencia con el que se compuso todo. En una
 * ventana más alta la sección da más píxeles y el mismo tramo se recorre un poco
 * más lento: a 1.080 el ritmo real es ×1,205 en vez de ×1,25 — 4 % —, y eso queda
 * declarado en vez de corregido, porque corregirlo pediría medir la ventana para
 * decidir una ventana de progreso, y este archivo no mide nada.
 *
 * El 900 no se escribe acá: es `ALTO_DE_VIEWPORT_DE_LA_REFERENCIA`, que el lane de
 * navegación ya declara como el alto con el que se compuso el sitio.
 */
export const PX_DE_LA_SECCION = PANTALLAS_DE_LA_SECCION * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

/** Una fracción del progreso de la sección, a partir de píxeles de scroll. */
export function fraccionDeScroll(px: number): number {
  return px / PX_DE_LA_SECCION
}


/**
 * ⚠️ **LAS DOS LÍNEAS DEL BARRIDO, en porcentaje del alto de la ventana.**
 *
 * Son el `rootMargin` de dos `IntersectionObserver` sobre el panel de Trabajos, o
 * sea **cuánto se BAJA el borde de abajo de la raíz**. Positivo = la raíz se
 * estira hacia abajo, así que la sección cruza la línea **antes de asomar**.
 *
 * `ida` se deriva: cuando el pie de Quiénes somos toca el tope del cuadro, el
 * tope de Trabajos está exactamente `(PANTALLAS_DE_NUMEROS − 1)` alturas de
 * ventana por debajo del pie. Estirar la raíz justo eso hace que la noche empiece
 * en el mismo píxel de scroll en que termina Quiénes somos. Si Números cambia de
 * alto, la línea lo sigue sola.
 *
 * ⚠️ **`vuelta` es MÁS GRANDE, y el orden importa.** Una raíz más estirada se
 * cruza ANTES bajando y se abandona DESPUÉS subiendo. Con `vuelta > ida`, bajando
 * se cruza primero la de la vuelta —que no hace nada— y después la de la ida;
 * subiendo se abandona primero la de la ida —que tampoco hace nada— y recién
 * después la de la vuelta. Esos ocho puntos entre una y otra son la histéresis:
 * sin ellos, un dedo apoyado en el umbral hace ir y venir el barrido.
 *
 * ⚠️ **SIN EL SOLAPE, y es a propósito.** La gota no observa el panel sino la
 * caja que `Panel` pone donde el panel estaría sin subir sobre Números. El solape
 * rige sólo desde escritorio y esa caja lo sigue por CSS, así que las líneas son
 * las de siempre a cualquier ancho y ninguna sección decide nada por ancho.
 */
export const DISPARO_DE_LA_NOCHE = {
  ida: (PANTALLAS_DE_NUMEROS - 1) * 100,
  vuelta: (PANTALLAS_DE_NUMEROS - 1) * 100 + 8,
} as const

/** Normaliza un progreso contra una ventana. Fuera de ella satura. */
export function enLaVentana(progreso: number, ventana: { desde: number; hasta: number }): number {
  const u = (progreso - ventana.desde) / (ventana.hasta - ventana.desde)
  return u < 0 ? 0 : u > 1 ? 1 : u
}

// ===========================================================================
// EL CARTEL — su tipografía, su caja y su tiempo
// ===========================================================================

/**
 * ⚠️ **LA MEDIDA DEL CUERPO DEL CARTEL, EN `ch` Y NO EN PX NI EN %.**
 *
 * `ch` es el ancho del glifo cero de la fuente que esté puesta, así que la medida
 * se mueve con la tipografía y con el nivel: 50 ch son 50 ceros de ancho, midan
 * lo que midan. Un ancho en píxeles se desincroniza el día que cambie el cuerpo,
 * y un porcentaje mide la CALLE y no el RENGLÓN —que es justo el defecto que esto
 * viene a cerrar: la bajada ocupaba la calle entera y caía en un solo renglón a
 * todo el ancho—.
 *
 * 50 ch sobre los 111 caracteres de la bajada dan **tres renglones**.
 */
export const MEDIDA_DEL_CUERPO_CH = 50


/**
 * ⚠️ **LAS CLASES DEL CUERPO DEL CARTEL, DERIVADAS DE LA TABLA — y es una
 * DUPLICACIÓN DECLARADA.**
 *
 * `CanalDePiezas` recibe las clases de su contenedor como CADENA, no como
 * componente: el cuerpo pintado no puede pasar por `<Cuerpo>`. Servicios tiene
 * exactamente este helper (`servicios/geometria.ts`, `clasesDeNivel`) y **no se
 * importa a propósito**: ese lane está abierto con otra sesión reescribiéndolo, y
 * un import cruzado entre dos secciones por cuatro clases es peor acoplamiento
 * que cuatro líneas repetidas. La deuda —unificar cuando cierre ese lane— está
 * anotada en `DIRECCION-ESCENA.md` §78.
 *
 * Lo que NO se duplica es la tabla: sale de `NIVELES_TIPOGRAFICOS`, que es la
 * misma que consume `<Texto>`. Escribir las clases a mano habría sido una copia
 * capaz de desviarse sola.
 *
 * ⚠️ **SUBE EL TAMAÑO, NO EL REGISTRO — y las dos mitades salen de niveles
 * DISTINTOS a propósito.** El tamaño es el de `titulo-s` (20 px contra los 15 de
 * `cuerpo`); el interlineado y el interletrado son los de `cuerpo`. Tomar los
 * cuatro valores del mismo nivel se probó y se ve: `titulo-s` declara
 * `interlineado: 'titulo'`, que es el apretado de los titulares, y un párrafo de
 * TRES renglones con interlineado de título se lee amontonado. Un titular de una
 * línea no paga eso; un cuerpo sí.
 */
export const TAMANO_DEL_CUERPO_DEL_CARTEL = 'titulo-s'
export const REGISTRO_DEL_CUERPO_DEL_CARTEL = 'cuerpo'

export function clasesDelCuerpoDelCartel(): string {
  const tamano = NIVELES_TIPOGRAFICOS[TAMANO_DEL_CUERPO_DEL_CARTEL]
  const registro = NIVELES_TIPOGRAFICOS[REGISTRO_DEL_CUERPO_DEL_CARTEL]
  return [
    'font-cuerpo',
    tamano.claseFija,
    CLASE_INTERLINEADO[registro.interlineado],
    CLASE_INTERLETRADO[registro.interletrado],
  ].join(' ')
}

/**
 * Una ventana del gesto, escrita en progreso de la SECCIÓN y no en fracciones de
 * sí misma, que es como se puede leer el orden de un vistazo. La fracción de la
 * huida se DERIVA, y acá se guarda que caiga adentro de la ventana.
 */
export interface VentanaDelGesto extends TiemposDelGesto {
  readonly desde: number
  readonly hasta: number
}

export function gesto(desde: number, hasta: number, empiezaAHuir: number | null): VentanaDelGesto {
  const largo = hasta - desde
  if (!(largo > 0)) throw new Error(`ventana inválida: ${desde} → ${hasta}`)
  const huirDesde = empiezaAHuir === null ? null : (empiezaAHuir - desde) / largo
  if (huirDesde !== null && !(huirDesde > 0 && huirDesde < 1)) throw new Error(`huirDesde inválido: ${huirDesde}`)
  return { desde, hasta, huirDesde }
}

/** Devuelve al progreso de SECCIÓN un instante escrito en fracción de una
 *  ventana. Es la inversa de `enLaVentana`, y con ella una ventana puede
 *  derivarse de otra sin repetir un número. */
export function progresoDeLaVentana(ventana: VentanaDelGesto, u: number): number {
  return ventana.desde + u * (ventana.hasta - ventana.desde)
}

/**
 * ⚠️ **EL CARTEL, EN PÍXELES DE SCROLL COMO TODO LO DEMÁS DEL TRAMO.**
 *
 * Estaba escrito en fracciones del progreso —`gesto(0, 0.52, …)`— y eso dejó de
 * servir el día que la sección cambió de alto: una fracción fija de una sección
 * que crece de tres pantallas a seis le da al cartel el doble de scroll sin que
 * nadie lo haya decidido. Ahora pide lo suyo en píxeles y la fracción se deriva.
 *
 * 1.200 px son un tercio del tramo del túnel: alcanza para que el cartel llegue
 * con el gesto de la casa, se lea, y se vaya.
 */
export const PX_DEL_CARTEL = 1200

/**
 * ⚠️ **LOS CORTES DEL CARTEL, Y EL DE LA HUIDA VA EN SCROLLS.**
 *
 * Había un `llega`, vestigial desde que el titular y el cuerpo toman el rango de
 * su propio call site: se fue con `poseDelGesto`, que era el único que lo leía.
 *
 * `seVa` SÍ gobierna, y es uno de los tres tiempos que el usuario contó: **cuánto
 * tarda el cartel en irse de la pantalla**. Lo medía en 4 scrolls y lo quiere en
 * 2 o 3. Así que deja de escribirse como una fracción de la ventana —que no es
 * una unidad que nadie pueda contar— y se DERIVA de los scrolls que tiene que
 * durar la huida.
 *
 * ⚠️ Y mover esto mueve el arranque del túnel: `ventanaDelTunel` empieza en el
 * instante exacto en que el cartel empieza a huir. Es una derivación declarada,
 * no un acople accidental — la primera captura nace mientras el cartel se va.
 */
export const SCROLLS_DE_LA_HUIDA_DEL_CARTEL = 2.5

export const CORTES_DEL_CARTEL = {
  seVa: 1 - (SCROLLS_DE_LA_HUIDA_DEL_CARTEL * PX_POR_SCROLL) / PX_DEL_CARTEL,
} as const

/**
 * ⚠️ **EL PROGRESO DE ESTA SECCIÓN ARRANCA UN VIEWPORT ANTES DE LA SECCIÓN, Y
 * ESE TRAMO NO SE PUEDE USAR.**
 *
 * `Trabajos.tsx` monta su `<Bloque patron="P7" anclaje="seccion">`: el progreso
 * lo resuelve el ANCLA DE P7 sobre la caja de la `<section>`, y esa ancla abre
 * cuando el tope de la sección cruza el BORDE DE ABAJO del viewport —no el de
 * arriba, como haría el ancla del pin—. O sea que el progreso ya lleva un
 * viewport recorrido cuando el panel recién termina de entrar.
 *
 * **Medido, no leído** (`scripts-b4/s4-cartel.ts`, perfil 1440×900, con la
 * sección en `top 5.433`): el cartel vale `u = 0` en `y = 4.533` —exactamente
 * `top − 900`— y vale `u = 0,75` en `y = 5.433`, que es donde el panel queda
 * puesto. O sea: **los primeros 900 px del progreso transcurren con el panel
 * todavía subiendo**, con su caja a `top 1.017` —abajo del cuadro— al abrir.
 *
 * Eso convertía al gesto de la casa en un gesto invisible: el cartel llegaba
 * renglón por renglón mientras su caja estaba abajo del borde, quedaba quieto
 * mientras subía a la vista, y para cuando el panel se poseó ya estaba huyendo
 * —opacidad 0,88 en el primer píxel de la sección, escondido 300 px después—.
 * En la grabación a 1440 son ~150 cuadros en blanco donde el cartel debería
 * estar llegando.
 *
 * Así que el recorrido entero arranca DESPUÉS de ese tramo. No es un número
 * elegido: es un viewport, y el viewport con el que se cuenta es el mismo con el
 * que se cuenta el ritmo del túnel. La deriva en una ventana más alta es la ya
 * declarada arriba y de la misma clase: a 1.080 el panel se posa 180 px más
 * tarde que donde este número lo pone.
 */
export const PX_DE_LA_APROXIMACION = ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

export const CARTEL = gesto(
  fraccionDeScroll(PX_DE_LA_APROXIMACION),
  fraccionDeScroll(PX_DE_LA_APROXIMACION + PX_DEL_CARTEL),
  fraccionDeScroll(PX_DE_LA_APROXIMACION + PX_DEL_CARTEL * CORTES_DEL_CARTEL.seVa),
)

/**
 * ⚠️ **LA VENTANA DE LA PINTURA ES LA MESETA DEL CARTEL.**
 *
 * El cuerpo se pinta exactamente mientras el cartel está QUIETO: ni mientras
 * crece ni mientras huye. Es la única ventana en la que el texto no se está
 * moviendo, y pintar palabra por palabra algo que además escala o se aleja es
 * pedirle dos cosas al ojo al mismo tiempo. Derivada del gesto del cartel.
 */
/**
 * ⚠️ **LAS DOS VENTANAS DEL CARTEL SE FUERON, Y ES EL ARREGLO DEL SPRINT.**
 *
 * Había una `VENTANA_DE_LA_LLEGADA` y una `VENTANA_DEL_CUERPO`, las dos en
 * fracción de la ventana del cartel, que repartían su meseta entre el titular y
 * su bajada. El problema no era el reparto: era que la ventana del cartel
 * **abre en el píxel 0 de la sección**, o sea en el instante exacto en que el
 * pin engancha. Con eso la llegada entera cabía en 420 px, de golpe y con el
 * panel recién posado — que es lo que se reportó como «está ya puesto».
 *
 * Y había un segundo motivo, más difícil de ver: P2 baja la pieza el **60 % de
 * su propio alto**, así que adentro de su ventana de recorte queda un 46 % del
 * titular visible desde el primer cuadro. Una llegada corta que además empieza
 * medio mostrada no se lee como llegada.
 *
 * Ahora cada pieza toma el rango de SU call site —`ventana-de-la-mascara` para
 * el titular, `ventana-visible` para el cuerpo, igual que «El equipo» y la
 * bajada de la agencia— y esos rangos abren con la sección todavía entrando. La
 * ventana del cartel se queda gobernando lo único que le toca: cuándo la caja
 * se va hacia adelante.
 */

/**
 * ⚠️ **EL CARTEL — su caja y su punto interior.**
 *
 * Arranca en `x = 0,54`: seis puntos a la derecha del medio del cuadro, donde el
 * título puede ser gigante sin pisar el logo. Vive ARRIBA del túnel y no adentro:
 * no es una captura, es el encabezado de la sección, y cuando la primera captura
 * nace el cartel ya está huyendo.
 *
 * Su punto interior está cerca del vértice de arriba a la izquierda —pero no en
 * él— así que crece hacia abajo y a la derecha desde ahí.
 */
/**
 * ⚠️ **Y SU REPOSO ES LA MITAD DE LA PANTALLA, no el tercio de arriba.**
 *
 * Venía en `y0 0,13 – y1 0,55`: el centro de la caja caía en **0,34**, o sea un
 * tercio del cuadro, y el cartel se leía colgado del techo con media pantalla
 * vacía debajo. El alto de la caja no cambia —0,42 del cuadro, que es lo que el
 * titular y su cuerpo piden—; lo que cambia es dónde se apoya: centrada, `0,29
 * – 0,71`, con su centro en **0,50** exacto. Desde ahí se va hacia adelante.
 */
export const CAJA_DEL_CARTEL: Caja = { x0: 0.54, y0: 0.29, x1: 0.98, y1: 0.71 }
export const ORIGEN_DEL_CARTEL: PuntoDelCuadro = { x: 0.08, y: 0.12 }

// ===========================================================================
// EL TÚNEL Y LOS DEMOS — las dos ventanas que quedan, y una deriva de la otra
// ===========================================================================

/**
 * ⚠️ **LA VENTANA DEL TÚNEL NO SE ELIGE: ARRANCA CON LA HUIDA DEL CARTEL Y DURA
 * LO QUE DICE LA TABLA.**
 *
 * Empieza en el instante exacto en que el cartel arranca a huir —el paso 2 de la
 * secuencia, dicho como derivación y no como coincidencia— y dura `PX_DEL_TUNEL`:
 * del arranque del primer proyecto al tope del CTA, en los píxeles de la
 * referencia. El CTA no tiene ventana propia: es la última capa de la tabla, y su
 * tope ES el fin del túnel, así que no hay dos números que mantener de acuerdo.
 */
const ARRANQUE_DEL_TUNEL = progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1)

export function ventanaDelTunel(cuantas: number): { readonly desde: number; readonly hasta: number } {
  // El día que entre un cuarto proyecto sin su capa en la tabla, esto tira acá.
  if (cuantas !== CAPAS_DEL_TUNEL.proyectos.length) {
    throw new Error(`hay ${cuantas} proyectos y la tabla tiene ${CAPAS_DEL_TUNEL.proyectos.length} capas`)
  }
  return { desde: ARRANQUE_DEL_TUNEL, hasta: ARRANQUE_DEL_TUNEL + fraccionDeScroll(PX_DEL_TUNEL) }
}

/** El píxel del túnel —contado desde su arranque— para un progreso de la sección. */
export function pxDelTunelEn(progreso: number): number {
  return (progreso - ARRANQUE_DEL_TUNEL) * PX_DE_LA_SECCION
}

/** La inversa: el progreso de la sección en un píxel del túnel. */
export function progresoDelPxDelTunel(px: number): number {
  return ARRANQUE_DEL_TUNEL + fraccionDeScroll(px)
}

/**
 * ⚠️ **LA ESPERA — la ventana quieta en su máximo, y se queda con el sobrante.**
 *
 * Arranca cuando el túnel termina —o sea cuando la ventana del CTA llegó a su
 * tamaño— y dura lo que el alto de la sección le deje, con el piso declarado en
 * `PX_MINIMOS_DE_LA_ESPERA_DEL_CTA`. Es el único tramo del recorrido donde
 * estirarse no cuesta nada: la ventana ya no cambia de tamaño, así que un píxel
 * de más es un píxel más de lectura.
 */
export function ventanaDeLaEspera(cuantas: number): { readonly desde: number; readonly hasta: number } {
  const desde = ventanaDelTunel(cuantas).hasta
  return { desde, hasta: arranqueDeLaSalida(cuantas) }
}

/** Cuántos píxeles de scroll le quedan de verdad a la espera. */
export function pxDeLaEspera(cuantas: number): number {
  const v = ventanaDeLaEspera(cuantas)
  return (v.hasta - v.desde) * PX_DE_LA_SECCION
}

/**
 * ⚠️ **LA SALIDA Y LOS DEMOS SE CUENTAN DESDE EL FINAL, no desde el principio.**
 *
 * Los dos tienen largo fijo —la salida lo que tarda en salir lo más alto, los
 * demos sus dos pantallas— y los dos tienen que terminar exactamente donde el
 * pin se despega, que es donde el progreso llega a 1. Así que se restan del
 * final y lo que sobra se lo queda la espera, que es lo que puede absorberlo.
 */
export function arranqueDeLaSalida(cuantas: number): number {
  void cuantas
  return 1 - fraccionDeScroll(PX_DE_LA_SALIDA + PX_DEL_ESPACIO_DE_DEMOS)
}

export function ventanaDeLaSalida(cuantas: number): { readonly desde: number; readonly hasta: number } {
  const desde = arranqueDeLaSalida(cuantas)
  return { desde, hasta: desde + fraccionDeScroll(PX_DE_LA_SALIDA) }
}

/**
 * ⚠️ **DÓNDE EMPIEZA EL TRAMO DE DEMOS — y ahora sí está adentro del pin.**
 *
 * Empieza cuando la ventana de la salida terminó —el vacío ya llenó el cuadro—, y
 * de ahí al final del progreso queda la sala de noche sola: el fondo 3D, sin nada
 * encima, con la sección todavía clavada. Es el espacio reservado, y sigue vacío
 * por dentro — lo que va adentro es contenido y todavía no lo sabemos.
 */
export function arranqueDeDemos(cuantas: number): number {
  return ventanaDeLaSalida(cuantas).hasta
}

/** El vacío en la regla de la referencia: nace donde arranca la ventana de la salida. */
export const CAPA_DEL_VACIO = capaDelVacio(
  ORIGEN_DEL_TUNEL + pxDelTunelEn(arranqueDeLaSalida(CAPAS_DEL_TUNEL.proyectos.length)),
)

/**
 * ⚠️ **LA HUIDA DEL CARTEL EN LAS DOS DIRECCIONES, leída del túnel MOSTRADO.**
 * Bajando es la de siempre —de `huirDesde` al final del cartel— y de ahí sale
 * (c). Subiendo es la misma duración corrida hacia atrás, terminada donde arranca
 * el túnel: cuando el cartel empieza a volver, las capas ya están en 0.
 */
const HUIDA_BAJANDO = { desde: ARRANQUE_DEL_TUNEL, hasta: CARTEL.hasta } as const
export const HUIDA_DEL_CARTEL = {
  bajando: HUIDA_BAJANDO,
  subiendo: { desde: 2 * HUIDA_BAJANDO.desde - HUIDA_BAJANDO.hasta, hasta: HUIDA_BAJANDO.desde },
} as const

/** Un progreso de la sección en px de la sección, que es la unidad del regulador. */
export const pxDeLaSeccion = (progreso: number): number => progreso * PX_DE_LA_SECCION

/**
 * ⚠️ **LOS DOS RIELES DEL EFECTO REGULADO — cada punta es un lugar de la sección.**
 *
 * **El piso (bajando).** El pin se suelta en el progreso 1, y ahí lo mostrado
 * tiene que estar en el arranque de los demos: la salida terminada y la sala sola.
 * La salida es el vacío que se lleva el túnel, así que sus 1.131 px pueden ir a la
 * velocidad del scroll;
 * la espera no muestra nada moverse, así que se puede SALTAR; lo que se estira es
 * el túnel, repartido en todo el scroll que queda desde su arranque. Por eso el
 * túnel, aun a scroll desesperado, va a 0,54 de la velocidad de la página. Y el
 * piso deja pasar en el arranque del túnel UNA RÁFAGA ENTERA sin tocarla: con
 * menos aire la ráfaga lo alcanzaba a los 350 ms y el túnel saltaba de 244 a 674
 * px/s, para caer a 200 al soltarse.
 *
 * **El techo (subiendo).** El pin se suelta arriba en la aproximación, y ahí el
 * cartel tiene que haber vuelto entero. La espera se salta igual. Acá no entra
 * una ráfaga de aire: arriba del túnel quedan 1.200 px, y un riel más empinado
 * que el scroll sería peor que no regular.
 *
 * Las puntas donde lo mostrado toca el scroll dejan por lo menos
 * `ATRASO_DEL_RESORTE_PX` de aire: quien scrollea más lento que el efecto nunca
 * toca un riel. Y los dos llegan UNA MUESCA ANTES de que el pin se suelte: medido,
 * entre el scroll y lo pintado hay un cuadro, y a scroll desesperado un cuadro son
 * 30 px de salida que quedaban sin terminar en el cuadro del despineado.
 */
const PX_DEL_ARRANQUE_DEL_TUNEL = pxDeLaSeccion(ARRANQUE_DEL_TUNEL)
const PX_DEL_FIN_DEL_TUNEL = PX_DEL_ARRANQUE_DEL_TUNEL + PX_DEL_TUNEL
const PX_DEL_ARRANQUE_DE_LA_SALIDA = pxDeLaSeccion(arranqueDeLaSalida(CAPAS_DEL_TUNEL.proyectos.length))
export const MARGEN_DEL_DESPINEADO = PX_POR_SCROLL
const SCROLL_DEL_SALTO_BAJANDO = PX_DEL_ARRANQUE_DE_LA_SALIDA + PX_DEL_ESPACIO_DE_DEMOS - MARGEN_DEL_DESPINEADO
const SCROLL_DEL_SALTO_SUBIENDO = PX_DEL_FIN_DEL_TUNEL - ATRASO_DEL_RESORTE_PX

/** La ráfaga del pedido: diez muescas de rueda seguidas. */
export const PX_DE_UNA_RAFAGA = 10 * PX_POR_SCROLL

export const BANDA_DEL_EFECTO: BandaDelEfecto = {
  piso: [
    { scroll: PX_DEL_ARRANQUE_DEL_TUNEL + PX_DE_UNA_RAFAGA, efecto: PX_DEL_ARRANQUE_DEL_TUNEL },
    { scroll: SCROLL_DEL_SALTO_BAJANDO, efecto: PX_DEL_FIN_DEL_TUNEL },
    { scroll: SCROLL_DEL_SALTO_BAJANDO, efecto: PX_DEL_ARRANQUE_DE_LA_SALIDA },
  ],
  techo: [
    { scroll: PX_DE_LA_APROXIMACION + MARGEN_DEL_DESPINEADO, efecto: pxDeLaSeccion(HUIDA_DEL_CARTEL.subiendo.desde) },
    { scroll: SCROLL_DEL_SALTO_SUBIENDO, efecto: PX_DEL_FIN_DEL_TUNEL },
    { scroll: SCROLL_DEL_SALTO_SUBIENDO, efecto: PX_DEL_ARRANQUE_DE_LA_SALIDA },
  ],
}

/**
 * ⚠️ **LAS MEDIDAS DE LOS TRES ARCHIVOS, leídas del disco y no elegidas.**
 *
 * Están acá y no en `contenido.ts` porque un ancho y un alto son GEOMETRÍA:
 * `s5-contenido` afirma, sección por sección, que el contenido no tiene un solo
 * número, y el docblock de ese archivo declara que la relación de aspecto y el
 * `sizes` viven de este lado.
 *
 * Las tres capturas son 1920 × 1080. Que compartan relación es lo que hace que
 * **las tres crezcan exactamente igual** sin declararlo en ningún lado: el túnel
 * sólo escala, así que dos relaciones distintas se leerían como dos gestos.
 */

export const MEDIDAS_DE_LAS_CAPTURAS: readonly { readonly ancho: number; readonly alto: number }[] = [
  { ancho: 1920, alto: 1080 },
  { ancho: 1920, alto: 1080 },
  { ancho: 1920, alto: 1080 },
]

/**
 * ⚠️ **EL `sizes` DE UNA CAPTURA — 100 vw en las dos ramas, y en el túnel es un
 * TECHO y no una medida.**
 *
 * En la lista de abajo de 1025 la captura ocupa la columna entera, así que 100 vw
 * es exacto. En el túnel no: la captura CRECE hasta 1,47 anchos de cuadro —lo que
 * termina midiendo el último proyecto de la tabla—, o sea que en el último tramo
 * el navegador estira el archivo. `sizesPorViewport` no admite más de 100 —lo
 * valida— y pedir más tampoco serviría: el archivo mide 1920 px y a 1440 el
 * navegador ya elige ese. Lo que se estira es lo que pasa de 1,33 anchos, con la
 * imagen ya desbordada y en movimiento. Queda declarado.
 */
export const SIZES_DE_LA_CAPTURA = sizesPorViewport(100)

/**
 * ⚠️ **A DÓNDE LLEVA EL CTA — al mismo lugar que dice la navegación, no a una
 * cadena escrita acá.**
 *
 * «Contacto» es la sección de cierre, y su destino vive en la tabla de la
 * navegación. Escribirlo de nuevo sería un segundo lugar donde mantenerlo. Si
 * mañana contacto deja de ser una sección del home, la tabla lo dice y el CTA la
 * sigue sin que nadie se acuerde de este archivo.
 */
export const DESTINO_DEL_CTA = (():
  string => {
  const entrada = ENLACES_DE_MUESTRA.find((e) => e.id === 'cierre')
  if (entrada === undefined) throw new Error('la navegación ya no declara la sección de cierre')
  return entrada.destino
})()


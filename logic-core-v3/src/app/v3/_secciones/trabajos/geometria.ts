/**
 * LA GEOMETRÍA DE TRABAJOS — todos los números de la sección, juntos y fuera del
 * contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que lleguen los medios reales.
 * Mezclarlos con el contenido obligaría a exceptuarlos del escáner de cifras, y
 * una excepción es por donde vuelve a entrar la primera cifra inventada.
 *
 * ── ⚠️ PORTFOLIO · LA SECCIÓN SE LEE EN CUATRO TIEMPOS ────────────────────
 *
 * Todo lo de abajo cuelga de UNA cuenta —las pantallas que la tabla le da a la
 * sección— y de UNA decisión —cuántas de esas pantallas son preludio—. Las dos
 * viven en `secciones.ts`, así que acá no se elige ninguna: se derivan.
 *
 *     el cartel   p ∈ [0 · 0,52]     Portfolio nace, se lee y empieza a huir
 *     el túnel    p ∈ [0,34 · 0,84]  las capturas, encimadas con la huida
 *     los demos   p ∈ [0,84 · 1]     el espacio reservado, hoy vacío
 *
 * **El `+1` de la cuenta no es un ajuste**: el par de anclas de P7 es
 * `top bottom → bottom bottom`, o sea que el progreso arranca cuando el tope de
 * la sección toca el PIE del cuadro. Entre ese instante y el pin hay exactamente
 * una pantalla, y por eso la pantalla `k` del pin cae en `(k+1)/pantallas`.
 */

import { sizesPorViewport } from '../../_lib/imagen'
import { CLASE_INTERLETRADO, CLASE_INTERLINEADO, NIVELES_TIPOGRAFICOS } from '../../_lib/tipografia'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, ENLACES_DE_MUESTRA } from '../../_lib/navegacion'
import { PANTALLAS_DE_NUMEROS } from '../../_lib/secciones'

import { pantallasDe, seccionDe } from '../_contrato/forma'

import { pxQuePideElTunel, type Caja, type PuntoDelCuadro, type TiemposDelGesto } from './tunel'

/** Lo que hay que PEDIR de un medio (ancho × alto) más el `sizes` con el que se
 *  sirve. Vive acá porque es geometría y no contenido. */
export interface CajaDeLaCaptura {
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
}

/** Las pantallas que la tabla le da a la sección, leídas de la tabla. */
export const PANTALLAS_DE_LA_SECCION = pantallasDe(seccionDe('trabajos'))

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
 * sí misma, que es como se puede leer el orden de un vistazo. Las fracciones que
 * `poseDelGesto` necesita se DERIVAN.
 */
export interface VentanaDelGesto extends TiemposDelGesto {
  readonly desde: number
  readonly hasta: number
}

export function gesto(
  desde: number,
  hasta: number,
  terminaDeCrecer: number,
  empiezaAHuir: number | null,
): VentanaDelGesto {
  const largo = hasta - desde
  if (!(largo > 0)) throw new Error(`ventana inválida: ${desde} → ${hasta}`)
  return {
    desde,
    hasta,
    crecerHasta: (terminaDeCrecer - desde) / largo,
    huirDesde: empiezaAHuir === null ? null : (empiezaAHuir - desde) / largo,
  }
}

/** Devuelve al progreso de SECCIÓN un instante escrito en fracción de una
 *  ventana. Es la inversa de `enLaVentana`, y con ella una ventana puede
 *  derivarse de otra sin repetir un número. */
export function progresoDeLaVentana(ventana: VentanaDelGesto, u: number): number {
  return ventana.desde + u * (ventana.hasta - ventana.desde)
}

/**
 * ⚠️ **EL CARTEL — se adelanta, y lo que lo frena es la ENTRADA.**
 *
 * Termina de crecer en 0,10 y empieza a huir en 0,34. El techo de cuánto más se
 * puede adelantar no es una preferencia: hasta `p = 1/3` la sección todavía está
 * ENTRANDO —el hijo pegado sube con la página— así que el cartel, por temprano
 * que crezca, sube con ella. Lo que se gana adelantándolo es que ya esté ENTERO
 * cuando asoma, en vez de terminar de armarse a mitad del recorrido.
 */
export const CARTEL = gesto(0, 0.52, 0.1, 0.34)

/**
 * ⚠️ **LA VENTANA DE LA PINTURA ES LA MESETA DEL CARTEL.**
 *
 * El cuerpo se pinta exactamente mientras el cartel está QUIETO: ni mientras
 * crece ni mientras huye. Es la única ventana en la que el texto no se está
 * moviendo, y pintar palabra por palabra algo que además escala o se aleja es
 * pedirle dos cosas al ojo al mismo tiempo. Derivada del gesto del cartel.
 */
export const VENTANA_DE_LA_PINTURA = {
  desde: CARTEL.crecerHasta,
  hasta: CARTEL.huirDesde ?? 1,
} as const

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
export const CAJA_DEL_CARTEL: Caja = { x0: 0.54, y0: 0.13, x1: 0.98, y1: 0.55 }
export const ORIGEN_DEL_CARTEL: PuntoDelCuadro = { x: 0.08, y: 0.12 }

// ===========================================================================
// EL TÚNEL Y LOS DEMOS — las dos ventanas que quedan, y una deriva de la otra
// ===========================================================================

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
 * ⚠️ **LA VENTANA DEL TÚNEL NO SE ELIGE: ARRANCA CON LA HUIDA DEL CARTEL Y DURA
 * LO QUE EL RITMO PIDE.**
 *
 * Empieza en el instante exacto en que el cartel arranca a huir —el paso 2 de la
 * secuencia, dicho como derivación y no como coincidencia— y su largo sale de
 * `pxQuePideElTunel`, que a su vez sale del ritmo, del relevo y del tamaño de
 * nacimiento. Si cualquiera de los tres cambia, la ventana se mueve sola y lo que
 * viene después se corre con ella.
 */
export function ventanaDelTunel(cuantas: number): { readonly desde: number; readonly hasta: number } {
  const desde = progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1)
  return { desde, hasta: desde + fraccionDeScroll(pxQuePideElTunel(cuantas)) }
}

/**
 * ⚠️ **LO QUE LE TOCA AL CTA, A LA HUIDA Y A LOS DEMOS, en píxeles de scroll.**
 *
 * Los tres van en píxeles y no en fracciones de progreso porque es la unidad en
 * la que se piensan: cuánto scroll tarda el visitante en recorrerlos. Se
 * convierten a progreso con la misma cuenta que el túnel.
 *
 *   · **el CTA** crece mientras se escribe la frase. 324 px son un tercio de
 *     pantalla: alcanza para leer veintinueve caracteres sin que se sienta lento.
 *   · **la huida** se lleva las capturas y el CTA. 216 px, un cuarto de pantalla:
 *     es un gesto, no un tramo.
 *   · **los demos** son lo que queda, y no se declara: es el resto. Así la suma
 *     cierra siempre en 1 y nadie tiene que mantener cuatro números de acuerdo.
 */
export const PX_DEL_CTA = 324
export const PX_DE_LA_HUIDA = 216

export function ventanaDelCta(cuantas: number): { readonly desde: number; readonly hasta: number } {
  const desde = ventanaDelTunel(cuantas).hasta
  return { desde, hasta: desde + fraccionDeScroll(PX_DEL_CTA) }
}

export function ventanaDeLaHuida(cuantas: number): { readonly desde: number; readonly hasta: number } {
  const desde = ventanaDelCta(cuantas).hasta
  return { desde, hasta: desde + fraccionDeScroll(PX_DE_LA_HUIDA) }
}

/**
 * ⚠️ **DÓNDE EMPIEZA EL TRAMO DE DEMOS — y ahora es un RESTO, no un número.**
 *
 * Empieza cuando la huida termina de llevarse todo, y de ahí al final de la
 * sección queda la sala de noche sola: el fondo 3D en negro, sin nada encima. Es
 * el espacio reservado, y sigue vacío por dentro — lo que va adentro es contenido
 * y todavía no lo sabemos.
 */
export function arranqueDeDemos(cuantas: number): number {
  return ventanaDeLaHuida(cuantas).hasta
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
 * es exacto. En el túnel no: la captura CRECE hasta 1,64 anchos de cuadro, o sea
 * que en el último tramo el navegador estira el archivo. `sizesPorViewport` no
 * admite más de 100 —lo valida— y pedir más tampoco serviría: el archivo mide
 * 1920 px y a 1440 el navegador ya elige ese. Lo que se estira son los últimos
 * 0,64 anchos, con la imagen ya desbordada y en movimiento. Queda declarado.
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


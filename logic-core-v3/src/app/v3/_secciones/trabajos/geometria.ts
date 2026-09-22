/**
 * LA GEOMETRÍA DE TRABAJOS — todos los números de la sección, juntos y fuera
 * del contenido.
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
 *     entrada    p ∈ [0, 1/7]     la sección sube por el pie del cuadro
 *     preludio   p ∈ [1/7, 4/7]   la cámara recorre, la sala todavía clara
 *     conversión p ∈ [4/7, 5/7]   el círculo crece y la sala llega a la noche
 *     contenido  p ∈ [5/7, 1]     Portfolio y después el túnel
 *
 * **El `+1` de la cuenta no es un ajuste**: el par de anclas de P7 es
 * `top bottom → bottom bottom`, o sea que el progreso arranca cuando el tope de
 * la sección toca el PIE del cuadro. Entre ese instante y el pin hay exactamente
 * una pantalla, y por eso la pantalla `k` del pin cae en `(k+1)/pantallas`.
 */

import { sizesPorViewport } from '../../_lib/imagen'
import { CLASE_INTERLETRADO, CLASE_INTERLINEADO, NIVELES_TIPOGRAFICOS } from '../../_lib/tipografia'
import { PANTALLAS_DE_NUMEROS } from '../../_lib/secciones'

import { pantallasDe, seccionDe } from '../_contrato/forma'

import { type Caja, type PuntoDelCuadro, type TiemposDelGesto } from './tunel'

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

/** Lo que el cartel se queda en cuadro DESPUÉS de que engancha el pin. Media
/** Normaliza un progreso contra una ventana. Fuera de ella satura. */
export function enLaVentana(progreso: number, ventana: { desde: number; hasta: number }): number {
  const u = (progreso - ventana.desde) / (ventana.hasta - ventana.desde)
  return u < 0 ? 0 : u > 1 ? 1 : u
}



/**
 * ⚠️ **LA MEDIDA DEL CUERPO DEL CARTEL, EN `ch` Y NO EN PX NI EN %.**
 *
 * `ch` es el ancho del glifo cero de la fuente que esté puesta, así que la medida
 * se mueve con la tipografía y con el nivel: 50 ch son 50 ceros de ancho, midan
 * lo que midan. Un ancho en píxeles se desincroniza el día que cambie el cuerpo,
 * y un porcentaje mide la CALLE y no el RENGLÓN —que es justo el defecto que
 * esto viene a cerrar: la bajada ocupaba la calle entera y caía en un solo
 * renglón a todo el ancho—.
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
 * anotada en `DIRECCION-ESCENA.md` §7.
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
 * TRES renglones con interlineado de título se lee amontonado —los renglones casi
 * se tocan—. Un titular de una línea no paga eso; un cuerpo sí.
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
 * Y la del nombre de un proyecto: llega mientras el par crece y **se sostiene
 * hasta el final de la ventana**.
 *
 * ⚠️ El `0,9` es de la MITAD 1 y está declarado como tal. Valía 0,75 cuando la
 * cadena tenía tres tercios y el nombre de uno se iba porque llegaba el del
 * siguiente. Con un solo par vivo no hay quién lo releve, y un par posado sin
 * título es justo lo que la mitad 1 tiene que poder mostrar. La mitad 2 lo
 * devuelve a su tercio cuando el florecido traiga el relevo.
/**
 * LAS CAJAS DE LOS DOS MEDIOS. El logo va cuadrado; el sitio, en el 16:9 de una
 * captura de pantalla. Son la RELACIÓN y el archivo que hay que pedir, no el
 * tamaño en pantalla: el tamaño lo pone `PARES`, en anchos de cuadro.
 *
 * ⚠️ **El `sizes` de `100vw` quedó sobrado y se declara como deuda, no se
 * arregla acá.** Se justificaba con el desborde —«la imagen crece hasta
 * desbordar el cuadro»— y el par ya no desborda: el más grande mide 36 % del
 * ancho. Bajarlo es una mejora de peso de imagen real, pero estas dos cajas
 * también las consume la rama quieta (`Proyecto.tsx`, grilla de 3 columnas), así
 * que el número correcto es otro de cada lado y eso es un sprint de imagen, no
 * de composición.
 */
export const CAJA_DEL_LOGO: CajaDeLaCaptura = {
  ancho: 1200,
  alto: 1200,
  sizes: sizesPorViewport(100),
}

export const CAJA_DE_LA_PAGINA: CajaDeLaCaptura = {
  ancho: 1920,
  alto: 1080,
  sizes: sizesPorViewport(100),
}

/**


// ===========================================================================
// LOS TIEMPOS - cuando nace, cuando termina de crecer y cuando huye cada cosa
// ===========================================================================

/**
 * Una ventana del gesto, escrita en progreso de la SECCION y no en fracciones de
 * si misma, que es como se puede leer el orden de un vistazo. Las fracciones que
 * `poseDelGesto` necesita se DERIVAN: asi las cuatro piezas de un proyecto
 * comparten la escala normalizada **al bit**, y no por redondeo.
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
  if (!(largo > 0)) throw new Error(`ventana invalida: ${desde} -> ${hasta}`)
  return {
    desde,
    hasta,
    crecerHasta: (terminaDeCrecer - desde) / largo,
    huirDesde: empiezaAHuir === null ? null : (empiezaAHuir - desde) / largo,
  }
}

/**
 * ⚠️ **EL CARTEL - se adelanta otra vez, y lo que lo frena es la ENTRADA.**
 *
 * Termina de crecer en **0,10** —llega temprano— y recién empieza a huir en
 * **0,34**, o sea que la meseta pasó de 0,08 a 0,24 de la sección: llega antes y
 * **se queda más**. El techo de cuánto más se puede adelantar no es una
 * preferencia: hasta `p = 1/3` la sección todavía está ENTRANDO —el hijo pegado
 * sube con la página— así que el cartel, por temprano que crezca, sube con ella.
 * Lo que se gana adelantándolo es que ya esté ENTERO cuando asoma.
 */
export const CARTEL = gesto(0, 0.52, 0.1, 0.34)

/**
 * ⚠️ **LA VENTANA DE LA PINTURA ES LA MESETA DEL CARTEL.**
 *
 * El cuerpo se pinta exactamente mientras el cartel esta QUIETO: ni mientras
 * crece ni mientras huye. Es la unica ventana en la que el texto no se esta
 * moviendo, y pintar palabra por palabra algo que ademas escala o se aleja es
 * pedirle dos cosas al ojo al mismo tiempo. Derivada del gesto del cartel.
 */
export const VENTANA_DE_LA_PINTURA = {
  desde: CARTEL.crecerHasta,
  hasta: CARTEL.huirDesde ?? 1,
} as const

/**
 * ⚠️ **LAS VENTANAS DE LOS PROYECTOS - una por proyecto, y las CUATRO piezas
 * la comparten.**
 *
 * Que el nombre, el rubro, el logo y la captura de un mismo proyecto compartan la
 * ventana entera **es** la sincronia: comparten `crecerHasta`, comparten
 * `huirDesde` y por lo tanto comparten `poseDelGesto` cuadro a cuadro. No hay dos
 * cuentas que mantener alineadas.
 *
 * Los tramos se pisan a proposito: el proyecto 1 empieza a crecer en 0,62, que es
 * el mismo progreso en que el proyecto 0 empieza a huir. Uno entra mientras el
 * otro se va, que es lo que hace que no haya un cuadro vacio entre los dos.
 *
 * ⚠️ **Hay DOS, y es el corte del sprint.** El tercero entra cuando el humano
 * apruebe como sale este; su fila de `DISPOSICIONES` ya esta escrita.
 */
export const VENTANAS_DE_LOS_PROYECTOS: readonly VentanaDelGesto[] = [
  gesto(0.38, 0.7, 0.56, 0.62),
  gesto(0.62, 0.9, 0.78, 0.84),
]

/**
 * ⚠️ **EL TRAMO DE DEMOS, RESERVADO Y VACÍO.**
 *
 * Arranca donde el último proyecto empieza a huir y llega al pie de la sección.
 * **Hoy no monta nada**: lo que hay es el espacio —ese tramo de scroll ya no lo
 * usa ningún proyecto— y el enganche —esta ventana, con la misma forma que las
 * otras, lista para que una pieza le cuelgue su `poseDelGesto`—. No se inventa
 * qué va adentro: eso es contenido y no lo sabemos.
 *
 * Se deriva de la última ventana declarada, así que cuando entre el tercer
 * proyecto el tramo se corre solo.
 */
export function ventanaDeDemos(): VentanaDelGesto {
  const ultima = VENTANAS_DE_LOS_PROYECTOS[VENTANAS_DE_LOS_PROYECTOS.length - 1]
  const arranque = ultima.desde + (ultima.huirDesde ?? 1) * (ultima.hasta - ultima.desde)
  return gesto(arranque, 1, arranque + (1 - arranque) * 0.6, null)
}

export function ventanaDelProyecto(indice: number): VentanaDelGesto | null {
  return VENTANAS_DE_LOS_PROYECTOS[indice] ?? null
}

// ===========================================================================
// LOS LUGARES - la zona central, sus cuatro ranuras y quien ocupa cual
// ===========================================================================

/**
 * ⚠️ **LA ZONA CENTRAL - todo nace y vive adentro, y nada afuera.**
 *
 * Las piezas aparecian en cualquier lado del cuadro: una foto abajo a la
 * izquierda, un texto pegado al margen derecho, el cartel arriba. Eso no es una
 * composicion, es una lista de coordenadas. La zona es el marco que las ordena:
 * **esta centrada** -su centro es el centro del cuadro, 0,50 / 0,50-.
 *
 * ⚠️ **Se apreto: de 0,68 x 0,72 a 0,54 x 0,60.** Con la zona grande las cuatro
 * piezas se leian como cuatro cosas repartidas por la pantalla; el conjunto tiene
 * que leerse como UN bloque. A 1440x900 la zona pasa de 979 x 648 a **778 x 540
 * px**, y el aire alrededor de 230 a 331 px por lado. El canal entre ranuras baja
 * de 29 a 16 px por el mismo motivo.
 *
 * Que este centrada es comprobable y no una impresion: los dos margenes salen
 * iguales de la propia declaracion.
 */
export const ZONA_CENTRAL: Caja = { x0: 0.23, y0: 0.2, x1: 0.77, y1: 0.8 }

/** El canal entre ranuras. En fracciones de cada eje, elegido para que el hueco
 *  mida lo mismo en px en los dos: 0,020 x 1440 = 28,8 y 0,032 x 900 = 28,8. */
export const CANAL_DE_LA_ZONA = { x: 0.011, y: 0.0176 } as const

/** Las cuatro ranuras de la zona, en el orden de lectura de una grilla 2x2. */
export const RANURAS = ['arriba-izquierda', 'arriba-derecha', 'abajo-izquierda', 'abajo-derecha'] as const
export type Ranura = (typeof RANURAS)[number]

/** La caja de una ranura, derivada de la zona y del canal. Las cuatro miden lo
 *  mismo, que es lo que hace que todas las capturas terminen en la misma caja. */
export function cajaDeLaRanura(ranura: Ranura): Caja {
  const ancho = (ZONA_CENTRAL.x1 - ZONA_CENTRAL.x0 - CANAL_DE_LA_ZONA.x) / 2
  const alto = (ZONA_CENTRAL.y1 - ZONA_CENTRAL.y0 - CANAL_DE_LA_ZONA.y) / 2
  const aLaDerecha = ranura === 'arriba-derecha' || ranura === 'abajo-derecha'
  const abajo = ranura === 'abajo-izquierda' || ranura === 'abajo-derecha'
  const x0 = ZONA_CENTRAL.x0 + (aLaDerecha ? ancho + CANAL_DE_LA_ZONA.x : 0)
  const y0 = ZONA_CENTRAL.y0 + (abajo ? alto + CANAL_DE_LA_ZONA.y : 0)
  return { x0, y0, x1: x0 + ancho, y1: y0 + alto }
}

/**
 * ⚠️ **EL PUNTO INTERIOR DE CADA RANURA - donde nace la pieza que la ocupa.**
 *
 * En porcentaje de la caja PROPIA, que es como lo consume `transform-origin`.
 * Los cuatro miran hacia el CENTRO de la zona: la pieza de arriba a la izquierda
 * nace cerca de su esquina de abajo a la derecha, y asi. Con eso las cuatro se
 * abren desde el medio hacia afuera en vez de aparecer cada una por su lado.
 *
 * Ninguno es una esquina -el mas extremo esta a 0,24 de su borde- y los cuatro
 * son distintos: la simetria perfecta se lee como una plantilla. Van como DATO
 * porque son una decision de composicion y se corrigen en una linea.
 *
 * ⚠️ Los cuatro caen adentro de la parte que la pieza OCUPA de verdad, no solo
 * de la celda: una captura 16:9 deja 6,9 % de celda libre arriba y abajo, y un
 * logo cuadrado 17,4 % a los costados. Con `x` en [0,26 · 0,74] e `y` en
 * [0,24 · 0,76] el punto esta adentro de cualquiera de las cuatro piezas, que es
 * lo que hace cierto «nace dentro de la caja del proyecto anterior» sin importar
 * que ranura ocupaba.
 */
export const ORIGEN_DE_LA_RANURA: Readonly<Record<Ranura, PuntoDelCuadro>> = {
  'arriba-izquierda': { x: 0.74, y: 0.7 },
  'arriba-derecha': { x: 0.26, y: 0.76 },
  'abajo-izquierda': { x: 0.7, y: 0.3 },
  'abajo-derecha': { x: 0.32, y: 0.24 },
}

/** Las cuatro cosas que un proyecto pone en la zona. */
export const PIEZAS_DEL_PROYECTO = ['nombre', 'rubro', 'logo', 'captura'] as const
export type PiezaDelProyecto = (typeof PIEZAS_DEL_PROYECTO)[number]

/**
 * ⚠️ **LA TABLA DE DISPOSICIONES - una fila por proyecto, editable a mano.**
 *
 * Va como DATO y no como formula a proposito: «la asignacion invertida» y
 * «rotada otra vez» son lecturas, y si la lectura no es la que el humano quiere,
 * se corrige una linea y no una derivacion.
 *
 *   proyecto 1 - nombre arriba-izq, captura arriba-der, logo abajo-izq, rubro abajo-der
 *   proyecto 2 - la misma, invertida: cada pieza pasa a la ranura OPUESTA
 *   proyecto 3 - rotada un cuarto en sentido horario sobre la fila 1
 *
 * La propiedad que las tres filas cumplen, y que es la que el pedido pide:
 * **dos proyectos consecutivos no comparten la ranura de ninguna pieza.** Se
 * comprueba mirando las columnas, no hace falta correr nada.
 */
export const DISPOSICIONES: readonly Readonly<Record<PiezaDelProyecto, Ranura>>[] = [
  { nombre: 'arriba-izquierda', captura: 'arriba-derecha', logo: 'abajo-izquierda', rubro: 'abajo-derecha' },
  { nombre: 'abajo-derecha', captura: 'abajo-izquierda', logo: 'arriba-derecha', rubro: 'arriba-izquierda' },
  { nombre: 'arriba-derecha', captura: 'abajo-derecha', logo: 'arriba-izquierda', rubro: 'abajo-izquierda' },
]

/**
 * LA CAJA DE UN MEDIO ADENTRO DE SU RANURA: entra entero y centrado, guardando su
 * relacion. Es lo que hace que **todas las capturas terminen en la misma caja**
 * -misma ranura, misma relacion, mismo resultado- sin que haya que declararla.
 *
 * `aspecto` es ancho/alto del CUADRO: hace falta porque la relacion del medio se
 * mide en pixeles y la ranura en fracciones de dos ejes distintos.
 */
export function cajaDelMedio(ranura: Ranura, relacion: number, aspecto: number): Caja {
  const celda = cajaDeLaRanura(ranura)
  const ancho = celda.x1 - celda.x0
  const alto = celda.y1 - celda.y0
  // El alto de la celda, expresado en anchos de cuadro, para poder comparar.
  const altoEnAnchos = alto / aspecto
  const anchoQueEntra = Math.min(ancho, altoEnAnchos * relacion)
  const altoQueEntra = (anchoQueEntra / relacion) * aspecto
  const cx = (celda.x0 + celda.x1) / 2
  const cy = (celda.y0 + celda.y1) / 2
  return {
    x0: cx - anchoQueEntra / 2,
    x1: cx + anchoQueEntra / 2,
    y0: cy - altoQueEntra / 2,
    y1: cy + altoQueEntra / 2,
  }
}

/**
 * El aspecto con el que se dibujan las cajas en el servidor. El cliente las
 * vuelve a derivar con el aspecto REAL apenas mide su caja: aca solo hace falta
 * que el primer cuadro no salga absurdo, y la seccion no esta en pantalla al
 * cargar. Solo lo necesitan los MEDIOS, que entran a su ranura guardando su
 * relacion; el texto llena la celda y no depende del aspecto.
 */
export const ASPECTO_DE_REFERENCIA = 1440 / 900

/**
 * ⚠️ **EL CARTEL - su caja y su punto interior.**
 *
 * Arranca en `x = 0,54`, que es el ancla que el sprint anterior fijo y que este
 * conserva: seis puntos a la derecha del medio del cuadro, donde el titulo puede
 * ser gigante sin pisar el logo. Vive ARRIBA de la zona central y no adentro: no
 * es una de las cuatro piezas de un proyecto, es el encabezado de la seccion, y
 * cuando los proyectos empiezan a nacer el cartel ya esta huyendo.
 *
 * Su punto interior esta cerca del vertice de arriba a la izquierda -pero no en
 * el- asi que crece hacia abajo y a la derecha desde ahi.
 */
export const CAJA_DEL_CARTEL: Caja = { x0: 0.54, y0: 0.13, x1: 0.98, y1: 0.55 }
export const ORIGEN_DEL_CARTEL: PuntoDelCuadro = { x: 0.08, y: 0.12 }

/**
 * ⚠️ **EL `sizes` DE UN MEDIO SALE DE LA RANURA, no de una caja pedida.**
 *
 * La ranura mide 0,2645 del ancho del cuadro, así que un medio nunca se sirve más
 * grande que eso. Redondeado hacia arriba a 27 vw: pedir de menos hace que el
 * navegador estire un archivo chico, y eso sí se ve.
 */
export const SIZES_DE_LA_RANURA = sizesPorViewport(27)

/**
 * ⚠️ **LAS MEDIDAS DE LOS SEIS ARCHIVOS, leídas del disco y no elegidas.**
 *
 * Están acá y no en `contenido.ts` porque un ancho y un alto son GEOMETRÍA:
 * `s5-contenido` afirma, sección por sección, que el contenido no tiene un solo
 * número, y el docblock de ese archivo declara que la relación de aspecto y el
 * `sizes` viven de este lado.
 *
 * Las capturas son las tres 1920 × 1080 —de ahí sale que terminen todas en la
 * misma caja— y los logos son **tres relaciones distintas**: 3,661 · 1,500 ·
 * 3,052. Una caja común para los tres los deformaría o los recortaría, así que
 * cada uno entra contenido en su ranura con la suya.
 */
export const MEDIDAS_DE_LOS_MEDIOS: readonly {
  readonly logo: { readonly ancho: number; readonly alto: number }
  readonly pagina: { readonly ancho: number; readonly alto: number }
}[] = [
  { logo: { ancho: 853, alto: 233 }, pagina: { ancho: 1920, alto: 1080 } },
  { logo: { ancho: 1536, alto: 1024 }, pagina: { ancho: 1920, alto: 1080 } },
  { logo: { ancho: 1172, alto: 384 }, pagina: { ancho: 1920, alto: 1080 } },
]

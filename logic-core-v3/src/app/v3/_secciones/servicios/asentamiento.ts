/**
 * EL ASENTAMIENTO — cuándo un servicio TERMINA de armarse, y cuánto se queda
 * quieto antes de que lo reemplace el siguiente.
 *
 * ═══ EL DEFECTO QUE ARREGLA, MEDIDO EN EL NAVEGADOR (B2 · frente C) ═══
 *
 * Los tres canales de un servicio —las tres filas de P2, las 33 palabras de P3
 * y los once ítems de P4— se consumían sobre el progreso LOCAL del tramo, de 0
 * a 1. Y las ventanas de los tres cierran en 1: la última palabra de P3 se
 * enciende en `local = 1`, el último ítem de P4 se posa en `local = 1` y las
 * tres filas de P2 llegan a su lugar en `local = 1`. **`local = 1` es
 * exactamente el píxel donde la secuencia cambia de servicio.**
 *
 * O sea: **ningún servicio llegaba a verse terminado.** Medido a 1920×1080 con
 * scroll real, sobre el primer tramo (11880 → 12600 del documento):
 *
 *     scroll   palabras encendidas de 33   ítems posados de 11
 *     11880              0                        0
 *     12000              4                        0
 *     12240             15                        3
 *     12480             27                        8
 *     12580             32 (una en transición)   11
 *     12600            ← acá se reemplaza el servicio
 *
 * Y el censo de acontecimientos de `B2-DELTAS.md` §0 lo ve como lo que es: un
 * único grupo de aterrizajes de **2.040 px de ancho con 131 piezas**, o sea la
 * secuencia entera leída como **un** acontecimiento. Un acontecimiento es un
 * ATERRIZAJE —algo que estaba cambiando deja de cambiar y se queda quieto— y
 * acá no había ninguno: algo cambiaba en cada uno de los pasos del censo, de
 * punta a punta del pin.
 *
 * ═══ QUÉ HACE ═══
 *
 * Reparte el tramo en dos: **la armada** —donde los canales corren, tal cual,
 * con sus valores medidos— y **el asentamiento**, donde el progreso ya vale 1 y
 * el servicio se queda quieto, entero y legible, hasta que entra el siguiente.
 *
 * **No toca un solo valor de un patrón.** P2, P3 y P4 conservan sus claves, su
 * curva, su duración declarada y su escalonado; lo único que cambia es el
 * RECORRIDO DE SCROLL sobre el que se consumen, que es exactamente lo que un
 * ancla hace en cualquier otra sección. Acá el ancla de un canal adentro de un
 * tramo pinneado era implícita —el tramo entero— y pasa a estar escrita.
 *
 * ═══ DE DÓNDE SALE EL NÚMERO, QUE NO ES UN GUSTO ═══
 *
 * Sale del instrumento del bloque, el censo de `B2-DELTAS.md` §0:
 *
 * 1. El censo barre el scroll a **paso fijo** y **funde dos grupos de
 *    aterrizajes separados por dos pasos o menos**. Una banda quieta de dos
 *    pasos NO separa dos acontecimientos: los une.
 * 2. Así que la banda quieta se toma en **tres pasos** — el umbral de fusión
 *    más un paso de margen, para que un aterrizaje que llegue una muestra tarde
 *    no funda los dos grupos.
 * 3. El tramo de esta secuencia mide `ventana × (pasos − 1) / pasos`: con tres
 *    servicios y una ventana de 1080, **720**. La armada se queda con lo que
 *    sobra: `720 − 360 = 360`, o sea **la mitad del tramo**.
 *
 * El hueco que el censo va a medir no es la banda quieta sino un paso más
 * —`ini` del grupo siguiente cae en la primera muestra en la que ya cambió
 * algo—, o sea **cuatro pasos: 480 px, 0,44 pantallas**. Queda arriba del
 * umbral de fusión con margen y abajo del techo de la vara (1,56 pantallas).
 *
 * ⚠️ **La fracción se calibra a 1920×1080 y se aplica en todos los anchos.** Es
 * deliberado y hay que decirlo: el paso del censo son píxeles absolutos, así que
 * su resolución empeora en una ventana más baja, mientras que la fracción del
 * tramo es la misma composición en todas. Se calibra donde el bloque mide.
 *
 * ⚠️ **Lo que esto NO puede dar es un cuarto acontecimiento.** Con la armada
 * arrancando en el borde del tramo, el primer aterrizaje de un servicio cae en
 * la primera muestra del tramo; para que la cabecera fuera un acontecimiento
 * aparte tendría que aterrizar tres pasos ANTES, y la única muestra anterior es
 * el borde del pin. Separarla obligaría a arrancar la armada del primer servicio
 * a mitad de su tramo, dejando 360 px de scroll con el servicio congelado en su
 * estado inicial —filas corridas, lista invisible, párrafo en 0,3—. Está
 * reportado, no arreglado.
 */

import { ALTO_DE_CALIBRACION, FUSION_DEL_CENSO, PASO_DEL_CENSO, saturarEn } from '../_contrato/asentamiento'

export { ALTO_DE_CALIBRACION, FUSION_DEL_CENSO, PASO_DEL_CENSO }
import { SERVICIOS } from '../_contrato/acento'

/**
 * EL PASO DEL CENSO DE ACONTECIMIENTOS, en píxeles de scroll.
 *
 * No es una preferencia de esta sección: es el paso con el que `B2-DELTAS.md`
 * §0 barrió los dos sitios, y el que la instrucción de la Fase 1 reparte a los
 * cuatro frentes. Vive acá como número porque de él sale la geometría de abajo.
 */

/**
 * El umbral de FUSIÓN del censo: dos grupos separados por esto o menos se
 * cuentan como uno. Es la línea que hay que superar para que un momento se lea
 * como un momento y no como la cola del anterior.
 */

/**
 * La banda quieta que se busca, en pasos: el umbral de fusión MÁS UN PASO.
 *
 * El margen no es prudencia: el censo registra el aterrizaje de una pieza en la
 * MUESTRA siguiente al último cambio, así que un aterrizaje puede caer hasta un
 * paso más tarde de donde la matemática lo pone. Con la banda justa en el
 * umbral, ese paso de más funde los dos grupos.
 */
export const BANDA_QUIETA_EN_PASOS = 3

/** La banda quieta, en píxeles. */
export const BANDA_QUIETA = BANDA_QUIETA_EN_PASOS * PASO_DEL_CENSO

/**
 * El alto de ventana donde se calibra. Es el de las capturas del reporte y el
 * de la medición de `B2-DELTAS.md`. Ver la advertencia del docblock de arriba.
 */

/** Los pasos de la secuencia son los servicios, que es de donde sale el alto. */
export const PASOS_DE_LA_SECUENCIA = SERVICIOS.length

/**
 * EL TRAMO, en píxeles, a la ventana de calibración.
 *
 * El pin recorre `alto − ventana`, y el alto de una secuencia pinneada es
 * `pasos × ventana` (`altoDeSecuenciaPinneada`). Así que el recorrido del pin
 * es `ventana × (pasos − 1)` y cada tramo se lleva su parte:
 *
 *     tramo = ventana × (pasos − 1) / pasos = 1080 × 2 / 3 = 720
 */
export const TRAMO_CALIBRADO =
  (ALTO_DE_CALIBRACION * (PASOS_DE_LA_SECUENCIA - 1)) / PASOS_DE_LA_SECUENCIA

/**
 * LA FRACCIÓN DEL TRAMO QUE SE LLEVA LA ARMADA. Todo lo demás es asentamiento.
 *
 * Derivada, no elegida: `(tramo − banda quieta) / tramo`. Con los números de
 * arriba da **0,5**, y el invariante afirma esa igualdad contra la derivación,
 * no contra la constante.
 */
export const FRACCION_DE_ARMADO = (TRAMO_CALIBRADO - BANDA_QUIETA) / TRAMO_CALIBRADO

/** El hueco que el censo debería medir entre dos servicios: la banda quieta más
 *  el paso en el que el siguiente ya cambió algo. */
export const HUECO_PREVISTO = BANDA_QUIETA + PASO_DEL_CENSO

/** El mismo hueco, en pantallas de la ventana de calibración. */
export const HUECO_PREVISTO_EN_PANTALLAS = HUECO_PREVISTO / ALTO_DE_CALIBRACION

/**
 * EL REMAPEO — de progreso del tramo a progreso de la armada.
 *
 * Es una sola función, monótona y acotada, y la consumen los CINCO canales a la
 * vez porque se aplica UNA vez, sobre el número que los cinco leen. Por eso la
 * simultaneidad que `secuencia.ts` afirma no se toca: los cinco siguen leyendo
 * el mismo número, y ese número ahora satura antes.
 *
 * ⚠️ Con `FRACCION_DE_ARMADO` en 1 esta función es la identidad, o sea el
 * comportamiento anterior. El control positivo del invariante corre exactamente
 * eso y comprueba que la propiedad se pierde.
 */
export const asentar = saturarEn(FRACCION_DE_ARMADO)

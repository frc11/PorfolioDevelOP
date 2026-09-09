/**
 * EL ASENTAMIENTO POR ENTRADA — cuándo la lista de capacidades TERMINA de
 * armarse, y cuánto se queda quieta antes de que el visitante siga.
 *
 * ═══ EL DEFECTO QUE ARREGLA, MEDIDO EN EL NAVEGADOR (B2 · frente D) ═══
 *
 * El ancla de P4 es la más larga del sistema: `top bottom` → `bottom top`, o
 * sea **el alto del bloque MÁS un viewport entero**. Traducido a esta sección,
 * con la receta de `docs/rediseno/MEDICION-NAVEGADOR.md` a 1920×1080 sobre el
 * puerto de este bloque:
 *
 *     bloque de la lista   arriba 16323   alto 877,25   abajo 17200,25
 *     rango de P4          15243 → 17200,25            (1957,25 de recorrido)
 *     11 ítems, uno cada   0,05 · 1957,25 = 97,9       de scroll
 *
 * El censo de acontecimientos de `B2-DELTAS.md` §0 lo lee como lo que es: **un
 * único grupo de 960 px con once aterrizajes seguidos**, uno por muestra. Un
 * acontecimiento es un ATERRIZAJE —algo que estaba cambiando deja de cambiar y
 * se queda quieto— y acá no había ninguno adentro: la lista **seguía armándose
 * mientras se iba por arriba del cuadro**, y recién terminaba en 17200, el
 * último píxel de su propia sección.
 *
 * Y el otro lado de la misma cuenta: el primer ítem no aterrizaba hasta 16221,
 * así que entre el último aterrizaje del primer tiempo (15120) y el primero de
 * la lista había **1.200 px sin que pase nada — 1,11 pantallas**, el pozo que
 * este frente vino a cerrar.
 *
 * ═══ LA REGLA, QUE ES UNA SOLA Y SALE DE LAS PROPIAS ANCLAS ═══
 *
 * > **Un patrón se completa cuando su bloque terminó de ENTRAR al cuadro, y el
 * > punto de llegada es `DESCANSO_ANTES_DE_SALIR_PX` por encima del borde
 * > inferior del viewport. Lo que el ancla declare más allá de ese punto es
 * > asentamiento: el bloque ya está entero y quieto.**
 *
 * ⚠️ **ESTA REGLA DECÍA OTRA COSA Y SE REESCRIBE CONTRA LA PROPIEDAD NUEVA
 * (regla 15, B9).** Decía que el punto de llegada es **`bottom bottom`** —el
 * borde inferior de la caja al ras del borde de abajo del cuadro— y lo
 * justificaba diciendo que ése es *«el ancla de P2 escrita como regla»*. La
 * derivación era correcta; **la vara no**: se eligió otro patrón nuestro en vez
 * de medir la referencia.
 *
 * B9 la midió (`scripts-b9/b9-referencia.ts`, una navegación a
 * `https://www.nk.studio/`, 1920×1080, 202 elementos animados sin pinnear): el
 * borde inferior de la caja en el píxel donde el elemento llega a su estado
 * final cae en **p25 0,58 · p50 0,70 · p75 0,77** de pantalla desde el tope.
 * `bottom bottom` es **1,00** — el extremo, no el centro. El punto que cae
 * sobre ese centro es `bottom bottom-=240px`, y esos 240 son los de `ANCLAS.P1`,
 * el patrón con 142 de las 244 instancias del corpus de la referencia. El
 * número y su procedencia viven en `_contrato/asentamiento.ts`.
 *
 * Los tres patrones de esta sección, contra el punto de llegada corregido:
 *
 *     P1   `bottom bottom-=240px`   sobrepaso 0     → llega justo, identidad
 *     P2   `bottom bottom`          sobrepaso −240  → se queda CORTO
 *     P4   `bottom top`             sobrepaso un viewport MENOS 240 = 840 px
 *
 * **P2 se queda corto y por eso no se arregla acá**: un sobrepaso negativo no
 * es asentamiento, es un rango que hay que ALARGAR, y eso lo hace el ancla y no
 * un remapeo. Los cuatro bloques P2 de esta sección lo resuelven declarando
 * `rango="ventana-visible"` en el contrato. Éste —el de la lista— es el único
 * que sigue con el ancla de su patrón, porque su sobrepaso sigue siendo
 * positivo y el asentamiento sigue teniendo trabajo que hacer.
 *
 * **No toca un solo valor de un patrón.** P4 conserva sus claves (`y` 100 → 0
 * y `opacity` 0 → 1), su curva `power4.out`, su duración declarada y su
 * escalonado de 0,2. Lo único que cambia es el RECORRIDO DE SCROLL sobre el que
 * se consume, que es lo que un ancla hace en cualquier otra sección.
 *
 * ═══ POR QUÉ ACÁ SÍ Y EN EL TITULAR NO ═══
 *
 * ⚠️ **ESTE PÁRRAFO DESCRIBÍA UN MUNDO QUE YA NO EXISTE Y SE REESCRIBE (B9).**
 * Decía que sobre el titular «el sobrepaso son 240 px de un rango de 276, así
 * que la regla dejaría el revelado de dos líneas en 36 px de scroll: un golpe,
 * no un gesto». Esa cuenta salía del punto de llegada viejo. Con el corregido
 * **el sobrepaso de P1 es 0**: su ancla ya llega donde la regla dice, así que
 * no hay 36 px ni golpe — no hay nada que remapear. El titular declara
 * `rango="ventana-visible"` como los demás y eso es, para P1, un **no-op
 * comprobable**: el par de anclas de la regla ES `ANCLAS.P1`, y `s19-sincronia`
 * lo afirma. La conclusión —«el asentamiento queda sin aplicar en el titular»—
 * sobrevive; el motivo era otro.
 *
 * ⚠️ **La fracción se calibra a 1920×1080 y se aplica en todos los anchos.** Es
 * la misma decisión declarada que `servicios/asentamiento.ts` toma para la
 * suya, y por la misma razón: el paso del censo son píxeles absolutos y la
 * fracción del rango es la misma composición en todas las ventanas. La
 * sensibilidad es de segundo orden — con la lista 77 px más baja el punto de
 * asentamiento se corre 43 px, un tercio de un paso del censo.
 */

import {
  ALTO_DE_CALIBRACION,
  DESCANSO_ANTES_DE_SALIR_PX,
  FUSION_DEL_CENSO,
  PASO_DEL_CENSO,
  saturarEn,
} from '../_contrato/asentamiento'

export { ALTO_DE_CALIBRACION, DESCANSO_ANTES_DE_SALIR_PX, FUSION_DEL_CENSO, PASO_DEL_CENSO }

/**
 * EL PASO DEL CENSO DE ACONTECIMIENTOS, en píxeles de scroll.
 *
 * No es una preferencia de esta sección: es el paso con el que `B2-DELTAS.md`
 * §0 barrió los dos sitios. Vive acá porque de él sale el umbral de abajo, que
 * es contra el que se lee si dos aterrizajes son uno o son dos.
 */

/** Dos grupos separados por esto o menos, el censo los cuenta como UNO. */

/**
 * El alto de ventana donde se calibra. Es el de las capturas del reporte y el
 * de la medición de `B2-DELTAS.md`. Ver la advertencia del docblock de arriba.
 */

/**
 * EL ALTO DEL BLOQUE DE LA LISTA, medido a la ventana de calibración.
 *
 * No es un número elegido: es lo que la composición del segundo tiempo deja.
 * Una pantalla menos el `pb` de la pastilla, el `pt` de la costura, la caja del
 * `titulo-m` y el `gap` que los separa. Medido sobre el píxel con
 * `getBoundingClientRect()` del bloque, con la sección en su lugar del
 * documento y sin una transformada activa en su cadena de ancestros.
 */
export const ALTO_DE_LA_LISTA = 877.25

/** El rango de P4: `alto + un viewport entero`, leído de su ancla. */
export const RANGO_DE_LA_LISTA = ALTO_DE_LA_LISTA + ALTO_DE_CALIBRACION

/**
 * CUÁNTO SE PASA EL ANCLA DE P4 DEL PUNTO DE LLEGADA — **840 px**.
 *
 * Su fin es `bottom top` y el punto de llegada es `bottom bottom-=240px`: la
 * diferencia entre los dos lados es **un viewport menos el descanso**. Ese
 * tramo es el que la lista se pasa armándose mientras sale del cuadro.
 *
 * ⚠️ **Valía `ALTO_DE_CALIBRACION` —un viewport entero, 1080— y B9 le resta el
 * descanso.** No es un ajuste: es la corrección del punto de llegada, medido
 * contra la referencia. Con 1080 la lista aterrizaba con su borde inferior al
 * ras del borde de abajo del cuadro (fracción **0,926** medida a 1920, 0,978 a
 * 1440); con 840 aterriza en **0,778 / 0,733**, que es donde aterriza la
 * referencia. El invariante afirma la resta contra las anclas, no la constante.
 */
export const SOBREPASO_DE_LA_LISTA = ALTO_DE_CALIBRACION - DESCANSO_ANTES_DE_SALIR_PX

/**
 * LA FRACCIÓN DEL RANGO QUE SE LLEVA LA ARMADA. Todo lo demás es asentamiento.
 *
 * Derivada, no elegida: `(rango − sobrepaso) / rango`, que para P4 es
 * `(alto + descanso) / (alto + viewport)`. ⚠️ Era `alto / (alto + viewport)`
 * con el punto de llegada viejo; el descanso del numerador es lo que B9 le
 * suma. El invariante afirma esa igualdad contra la derivación y contra el
 * ancla, no contra la constante.
 */
export const FRACCION_DE_ARMADO =
  (RANGO_DE_LA_LISTA - SOBREPASO_DE_LA_LISTA) / RANGO_DE_LA_LISTA

/**
 * EL REMAPEO — de progreso del bloque a progreso de la armada.
 *
 * Es una sola función, monótona y acotada, y la consumen los once ítems a la
 * vez porque se aplica UNA vez, sobre el número que los once leen. Por eso el
 * escalonado del patrón no se toca: los once siguen leyendo el mismo número, y
 * ese número ahora satura antes.
 *
 * ⚠️ Con `FRACCION_DE_ARMADO` en 1 esta función es la identidad, o sea el
 * comportamiento anterior. El control positivo del invariante corre exactamente
 * eso y comprueba que la propiedad se pierde.
 */
export const asentar = saturarEn(FRACCION_DE_ARMADO)

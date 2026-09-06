/**
 * EL ASENTAMIENTO POR ENTRADA — cuándo el titular del cierre TERMINA de
 * revelarse, y por qué eso decide si el Cierre tiene un momento propio.
 *
 * ═══ EL DEFECTO QUE ARREGLA, MEDIDO EN EL NAVEGADOR (B2 · frente D) ═══
 *
 * El Cierre es la última pantalla del documento y **el scroll termina antes que
 * él**: la sección ocupa el documento de 18360 a 19440 y el último píxel de
 * scroll es 18360. Medido con la receta de `docs/rediseno/MEDICION-NAVEGADOR.md`
 * a 1920×1080, todo lo que esta sección puede llegar a aterrizar cabe en una
 * ventana de scroll de 211 px:
 *
 *     pieza          caja del bloque            aterriza en
 *     titular   P1   18521 → 18804,44           17964,44   (4 líneas: 17798 · 17853 · 17909 · 17964)
 *     columnas  P2   18991 → 19255              18175      (3 columnas: 18099 · 18137 · 18175)
 *
 * El censo de acontecimientos de `B2-DELTAS.md` §0 barre a 120 px y **funde dos
 * grupos separados por 240 px o menos**. Entre el último aterrizaje del titular
 * y el primero de las columnas hay **135 px**, así que el censo los lee como un
 * grupo solo; y ese grupo arranca 87 px después del aterrizaje de las piezas de
 * `por-que-develop` (17680), así que también se funde con el de la sección
 * anterior. Resultado publicado por la Fase 0: **el Cierre medía CERO
 * acontecimientos propios**, no porque no pase nada sino porque todo pasa junto.
 *
 * ═══ LA REGLA, QUE ES LA MISMA QUE USA `tu-panel/asentamiento.ts` ═══
 *
 * > **Un patrón se completa cuando su bloque terminó de ENTRAR al cuadro
 * > —`bottom` sobre el borde inferior del viewport—. Lo que el ancla declare
 * > más allá de ese punto es asentamiento: el bloque ya está entero y quieto.**
 *
 * Es el ancla de **P2** escrita como regla: `bottom bottom` ES «terminó de
 * entrar», así que sobre las columnas del pie la regla es la identidad y no
 * mueve un píxel. P1 cierra en `bottom bottom-=240px`, o sea que **se pasa
 * exactamente 240 px** —los que su propia ancla declara— y ésos son los que se
 * devuelven al asentamiento.
 *
 * **No toca un solo valor del patrón.** P1 conserva su `yPercent` 120 → 0, su
 * curva principal, su duración declarada y su escalonado de 0,2. Lo único que
 * cambia es el recorrido de scroll sobre el que se consume.
 *
 * ═══ QUÉ PASA A MEDIR DESPUÉS, Y POR QUÉ ESO ES EL MOMENTO ═══
 *
 * Con el remapeo, las cuatro líneas aterrizan entre 17648 y 17724 —todas en la
 * misma muestra del censo, 17760— y las columnas siguen aterrizando en 18099 →
 * 18175. **La distancia entre los dos pasa de 135 px a 375**, arriba del umbral
 * de fusión, y el Cierre gana el acontecimiento propio que no tenía: el pie que
 * sube, en 18120 → 18240.
 *
 * ⚠️ **Y publica el techo, que es una imposibilidad y no una decisión.** Dos
 * acontecimientos DENTRO del Cierre no se pueden: su ventana de aterrizajes
 * mide 451 px con el CTA incluido, y el segundo grupo tendría que empezar más
 * de 240 px después del primero y terminar antes de 18360. Entra uno. Está
 * medido, no supuesto.
 *
 * ⚠️ **La fracción se calibra a 1920×1080 y se aplica en todos los anchos**, la
 * misma decisión declarada que toman `servicios/asentamiento.ts` y
 * `tu-panel/asentamiento.ts`, y por la misma razón: el paso del censo son
 * píxeles absolutos y la fracción del rango es la misma composición en todas
 * las ventanas.
 */

import { ALTO_DE_CALIBRACION, FUSION_DEL_CENSO, PASO_DEL_CENSO, saturarEn } from '../_contrato/asentamiento'

export { ALTO_DE_CALIBRACION, FUSION_DEL_CENSO, PASO_DEL_CENSO }

/** El paso del censo de acontecimientos de `B2-DELTAS.md` §0, en píxeles. */

/** Dos grupos separados por esto o menos, el censo los cuenta como UNO. */

/** El alto de ventana donde se calibra: el de las capturas del reporte. */

/**
 * EL ALTO DEL BLOQUE DEL TITULAR, medido a la ventana de calibración.
 *
 * Son las cuatro líneas que la medida de seis cuerpos (§15 del invariante, B1)
 * le deja al titular a 1920. Medido sobre el píxel con
 * `getBoundingClientRect()` del bloque, con la sección en su lugar del
 * documento y sin una transformada activa en su cadena de ancestros.
 */
export const ALTO_DEL_TITULAR = 283.44

/**
 * CUÁNTO SE PASA EL ANCLA DE P1 DEL PUNTO DE ENTRADA — 240 px.
 *
 * Sale de la propia ancla: su fin es `bottom bottom-=240px` y el punto de
 * entrada es `bottom bottom`. El invariante lo afirma contra `ANCLAS.P1`, que
 * es donde ese número vive; acá está escrito porque el árbol quieto no puede
 * importar un valor del sistema de motion sin romper la compuerta.
 */
export const SOBREPASO_DEL_TITULAR = 240

/**
 * EL RANGO DE P1: `alto + 160 px`.
 *
 * Los 160 son la diferencia entre los dos desplazamientos de su ancla
 * (`bottom-=240px` contra `bottom-=80px`). Igual que arriba: escrito acá,
 * afirmado contra `ANCLAS.P1` en el instrumento.
 */
export const RANGO_DEL_TITULAR = ALTO_DEL_TITULAR + 160

/**
 * LA FRACCIÓN DEL RANGO QUE SE LLEVA EL REVELADO. El resto es asentamiento.
 *
 * Derivada, no elegida: `(rango − sobrepaso) / rango`. El invariante afirma esa
 * igualdad contra la derivación y contra el ancla, no contra la constante.
 */
export const FRACCION_DE_REVELADO =
  (RANGO_DEL_TITULAR - SOBREPASO_DEL_TITULAR) / RANGO_DEL_TITULAR

/**
 * EL REMAPEO — de progreso del bloque a progreso del revelado.
 *
 * Monótono y acotado, y lo consumen las cuatro líneas a la vez porque se aplica
 * UNA vez, sobre el número que las cuatro leen. Por eso el escalonado del
 * patrón no se toca: las cuatro siguen leyendo el mismo número, y ese número
 * ahora satura antes.
 *
 * ⚠️ Con `FRACCION_DE_REVELADO` en 1 esta función es la identidad, o sea el
 * comportamiento anterior. El control positivo del invariante corre eso y
 * comprueba que la propiedad se pierde.
 */
export const asentar = saturarEn(FRACCION_DE_REVELADO)

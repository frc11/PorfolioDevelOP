/**
 * EL PRESUPUESTO DE PESO DE `/v3` — LAS SIETE LÍNEAS, UNA POR DUEÑO.
 *
 * Acá viven **los números**; en `s5-peso.invariant.ts`, **la medición que los
 * compara contra el build**. Cada constante lleva un docblock corto —qué es,
 * cuánto, quién lo decidió— y **un puntero a su recibo completo**, que es donde
 * está la medición, lo que se achicó antes de subirla, la alternativa descartada
 * y el reparto por dueño. Los recibos viven en `s5-presupuesto-recibos.ts` (el
 * techo, B4-A, B7 y B6-A) y en `s5-presupuesto-recibos-del-merge.ts` (B9, B8 y
 * el heredado); se mudaron ahí en B10, cuando este archivo llegó a 356 líneas al
 * resolverse a mano el merge de las cuatro ramas. **Se mudó el texto: las
 * constantes y sus valores no se tocaron.**
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Cada aumento es **una línea con nombre y con su dueño**, y el techo original
 * de 60 KiB sigue vivo restándolas todas: un byte que crezca sin declararse no
 * tiene línea que lo cubra y pone la comprobación en rojo igual.
 *
 * ⚠️⚠️ **EL MARGEN DE HOY SON 2,9 BYTES** —62,367 escritos contra 62,37 de
 * techo, medido por B10—, **el más fino de la historia de este presupuesto: el
 * próximo byte lo rompe.** Es lo que tiene que pasar. Si estás acá porque
 * agregaste una línea de producto y `s5-peso` se puso en rojo, las dos salidas
 * son **declarar tu montaje** (con su A/B, lo que achicaste antes y la
 * alternativa escrita) o **re-medir el heredado** sobre tu árbol. **Subir el
 * techo de 60 no es una salida.** Está desarrollado en
 * `s5-presupuesto-recibos-del-merge.ts`.
 */

/**
 * EL TECHO DEL LANE: **60 KiB** de lo que `/v3` escribe en su carga inicial.
 * Es la suma de dos medidos —los 30 KiB que S1 fijó para el esqueleto más lo
 * que agregan las ocho secciones—, y cubre ocho porque el sistema de motion
 * dejó de bajar estáticamente. **No se mueve**: cada montaje se le resta.
 *
 * Recibo completo, con la cuenta y con los 1,36 KiB de preámbulo de Sentry que
 * se restan sin aflojarlo: `s5-presupuesto-recibos.ts`.
 */
export const PRESUPUESTO_DEL_LANE_KIB = 60

/**
 * **+1,25 KiB** — lo que B4-A monta: la marca en sus tres superficies (los ocho
 * rótulos, el pie, la pastilla) y la meseta de Trabajos. 1,200 medidos entre dos
 * builds, y con eso el techo queda en 61,25 con 0,11 KiB de aire sobre lo que el
 * lane escribe. **Lo decidió el humano en la parada de B4-A**, con la
 * alternativa escrita: no montar la marca.
 *
 * Recibo completo, con los 503 B que se achicaron antes: `s5-presupuesto-recibos.ts`.
 */
export const MONTAJE_DE_B4A_KIB = 1.25

/**
 * **+0,55 KiB** — lo que B7 arregla: el proveedor de `prefers-reduced-motion`
 * en el layout de `/v3`. 0,52 medidos A/B entre tres builds del mismo árbol más
 * 0,03 de aire. **Lo decidió el humano en la parada de B7.** Sin él, 2.450
 * transformadas corren igual con la preferencia puesta.
 *
 * Recibo completo, con el reparto por dueño que estrenó B7:
 * `s5-presupuesto-recibos.ts`.
 */
export const ARREGLO_DE_B7_KIB = 0.55

/**
 * **+0,25 KiB** — lo que B6-A monta: la cuarta superficie, la que deja ver la
 * escena en Trabajos y en el Cierre. 225 B medidos entre dos builds más 0,03 de
 * aire. **Lo decidió el humano en la PARADA 2 de B6-A**, con la alternativa
 * escrita: poner la clase a mano en las dos secciones.
 *
 * Recibo completo: `s5-presupuesto-recibos.ts`.
 */
export const MONTAJE_DE_B6A_KIB = 0.25

/**
 * **+0,31 KiB** — lo que B9 monta: la regla del rango en 13 sitios. 312 B
 * contados por dos caminos que coinciden a la unidad, declarados 0,31. **Lo
 * decidió el humano en la parada de B9**, con las cinco formas más baratas
 * medidas y descartadas una por una.
 *
 * Recibo completo, con las cinco y con lo que compra: `s5-presupuesto-recibos-del-merge.ts`.
 */
export const MONTAJE_DE_B9_KIB = 0.31

/**
 * **−0,09 KiB** — lo que B8 monta, y va con signo NEGATIVO: el velo pesaba más
 * que la noche. 92 B menos, medidos entre el árbol mergeado y el build final.
 * Un montaje negativo que no se declarara dejaría 92 B de aire sin dueño.
 *
 * ⚠️ **No es un error de signo.** Recibo completo, con qué salió y qué entró:
 * `s5-presupuesto-recibos-del-merge.ts`.
 */
export const MONTAJE_DE_B8_KIB = -0.09

/**
 * **+0,10 KiB** — lo que queda SIN DUEÑO después de restarle a lo escrito las
 * seis líneas de arriba. No es un montaje: es el residuo, y por eso **se publica
 * con atribución y no se afirma** (regla 13). **Medido por B10 sobre ESTE árbol,
 * el de las cuatro ramas mergeadas**: 63.864 B escritos − 62,27 KiB de líneas
 * con nombre = 99,5 B.
 *
 * ⚠️ Va por su cuarta medición —0,15 en el worktree de B7, 1,35 en el de B6-A,
 * 0,07 en el árbol mergeado sin B9 que midió B8—, y **las tres primeras se
 * midieron en otros árboles: no se suman.** Creció 28,5 B contra la de B8, y de
 * dónde puede venir está escrito en el recibo. Recibo completo, con las cuatro
 * mediciones y la razón de cada una: `s5-presupuesto-recibos-del-merge.ts`.
 */
export const HEREDADO_SIN_DECLARAR_KIB = 0.10

/**
 * ⚠️ **TODO AUMENTO ES UNA LÍNEA CON NOMBRE, Y EL TECHO VIEJO LAS RESTA TODAS.**
 *
 * Es lo que impide que esto se convierta en un número que sube solo: el
 * presupuesto original de 60 KiB sigue vivo y se afirma **restando cada montaje
 * declarado**. Un byte que crezca sin declararse no tiene línea que lo cubra y
 * pone la comprobación en rojo igual.
 *
 * ⚠️ Son **los cinco montajes más el heredado**, sin repetir ni faltar; la sexta
 * línea con nombre es el techo de 60, y se la suma `PRESUPUESTO_PROPIO_KIB`.
 * El merge de las cuatro ramas dejó este sumatorio con la forma que traía B8
 * —que se escribió cuando B9 todavía no estaba en el árbol— y **`MONTAJE_DE_B9_KIB`
 * quedó afuera**: la constante existía, con su valor de origen, y no se sumaba.
 * B10 la volvió a poner.
 */
export const MONTAJES_DECLARADOS_KIB =
  MONTAJE_DE_B4A_KIB +
  ARREGLO_DE_B7_KIB +
  MONTAJE_DE_B6A_KIB +
  MONTAJE_DE_B9_KIB +
  MONTAJE_DE_B8_KIB +
  HEREDADO_SIN_DECLARAR_KIB
export const PRESUPUESTO_PROPIO_KIB = PRESUPUESTO_DEL_LANE_KIB + MONTAJES_DECLARADOS_KIB

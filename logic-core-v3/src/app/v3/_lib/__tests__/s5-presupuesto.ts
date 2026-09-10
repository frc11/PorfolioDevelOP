/**
 * EL PRESUPUESTO DE PESO DE `/v3` — LAS OCHO LÍNEAS, UNA POR DUEÑO.
 *
 * Acá viven **los números**; en `s5-peso.invariant.ts`, **la medición que los
 * compara contra el build**. Cada constante lleva un docblock corto —qué es,
 * cuánto, quién lo decidió— y **un puntero a su recibo completo**, que es donde
 * está la medición, lo que se achicó antes de subirla, la alternativa descartada
 * y el reparto por dueño. Los recibos viven en `s5-presupuesto-recibos.ts` (el
 * techo, B4-A, B7 y B6-A), en `s5-presupuesto-recibos-del-merge.ts` (B9, B8 y
 * el heredado) y en `s5-presupuesto-recibos-de-b11.ts` (B11); se mudaron ahí en
 * B10, cuando este archivo llegó a 356 líneas al resolverse a mano el merge de
 * las cuatro ramas. **Se mudó el texto: las constantes y sus valores no se
 * tocaron.**
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Cada aumento es **una línea con nombre y con su dueño**, y el techo original
 * de 60 KiB sigue vivo restándolas todas: un byte que crezca sin declararse no
 * tiene línea que lo cubra y pone la comprobación en rojo igual.
 *
 * ⚠️⚠️ **EL MARGEN ERA DE 2,9 BYTES, Y B11 FUE EL SPRINT QUE CHOCÓ CON ÉL:**
 * movió tres piezas de texto de donde pasa el logo, subió dos tintas a plena y
 * el lane creció 25 B netos. Hizo lo que estas líneas piden —declaró su montaje
 * con su A/B sobre el mismo árbol, su reparto byte a byte y su alternativa
 * escrita (`s5-presupuesto-recibos-de-b11.ts`)— y **el techo de 60 no se
 * movió.** El margen de hoy son **8,6 B** —63.889 escritos contra 62,40 de
 * techo—, fino a propósito. Si estás acá porque agregaste una línea de producto y `s5-peso` se
 * puso en rojo, las dos salidas son **declarar tu montaje** (con su A/B, lo que
 * achicaste antes y la alternativa escrita) o **re-medir el heredado** sobre tu
 * árbol. **Subir el techo de 60 no es una salida.** Está desarrollado en
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
 * **+0,03 KiB** — lo que B11 monta: el texto corrido de donde pasa el logo, con
 * dos tintas de Quiénes somos subidas a plena. 25 B netos medidos A/B entre dos
 * builds del MISMO árbol y el mismo entorno —`.next-b11` antes de tocar producto
 * (63.864 B escritos, los mismos que midió B10) y `.next` después (63.889)— con
 * la única variable que cambia, y atribuidos byte a byte sobre el chunk
 * minificado: +27 la caja de la foto, +34 su epígrafe alineado a la derecha, +2
 * las celdas de Números, 0 el renglón de Trabajos, −38 las dos clases
 * `opacity-casi` que se fueron. Declarados 0,03 con la convención de B8 y B10
 * (al centésimo de arriba). **Lo decidió el humano en las dos paradas de B11**,
 * con la alternativa escrita: no mover la foto ni su epígrafe (−61 B, y el
 * marcador de la foto se queda el 100 % bajo el logo en los tres anchos).
 *
 * Recibo completo, con las formas más baratas medidas y con por qué el primer
 * build de B11 dio 63 B: `s5-presupuesto-recibos-de-b11.ts`.
 */
export const MONTAJE_DE_B11_KIB = 0.03

/**
 * **+1,36 KiB** — lo que B12 monta, y es la línea más grande que este techo
 * llevó. **1.393 B**, medidos A/B entre builds del MISMO árbol y el mismo
 * entorno, apagando cada pieza en el árbol de trabajo sólo durante la medición y
 * restaurándola byte a byte (SHA-1 de `Trabajos.tsx` antes y después:
 * `79484340…`). El reparto completo, con la alternativa de cada renglón y la
 * medición que se descartó, en `s5-presupuesto-recibos-de-b12.ts`:
 *
 *     LA GOTA            +1.304 B   la transición de entrada a la noche
 *     LA BANDA DEL PIE     +176 B   el velo local que cierra 16 bloques del pie
 *     EL RESTO, NETO         −87 B  los rótulos afuera, el pie sin relleno,
 *                                   la portada, el centrado, el corte de piezas
 *
 * ⚠️ **Las dos piezas que pagan son NUEVAS y las dos las pidió el humano por su
 * nombre** —«un efecto de gota o algo exótico y deluxe» y «un velo LOCAL en la
 * banda del pie»—; el resto del bloque DEVUELVE bytes. Que la resta de §1, §2 y
 * §3 dé −87 es lo que hace que la decisión sea limpia: lo único que se paga es
 * lo que se agregó.
 *
 * ⚠️ **Autorizado en 1,28 KiB y declarado en 1,36, con la diferencia escrita.**
 * El humano subió el techo en la PARADA 1 con la cifra que había ahí: la gota
 * sola. En la misma parada pidió probar la banda y dejarla si cerraba —cerró, de
 * 8 bloques bajo AA a 4 y 2— y la banda son 176 B más. No se esconde en el
 * redondeo ni en el heredado: es su propio renglón del recibo.
 *
 * Al centésimo de arriba, con la convención de B8, B10 y B11: 1.384,4 B de
 * desvío / 1024 = 1,3520 → **1,36**, que deja 8,2 B de aire, los mismos 8,6 que
 * B11 dejó dentro del redondeo.
 */
export const MONTAJE_DE_B12_KIB = 1.36

/**
 * ⚠️ **+4,20 KiB — EL PESO DE LA LLAVE, Y NO ES UN MONTAJE DEL LANE.**
 *
 * Es lo que agrega el contenido inventado de B12 §4: las veinte casillas
 * falsas, la maquinaria que las hace reversibles y el tercer estado del marco de
 * medio. **4.303 B**, medidos A/B entre builds del MISMO árbol, apagando cada
 * pieza y restaurándola byte a byte. El reparto completo, con su método y con la
 * corrección que hay que leer, en `s5-presupuesto-recibos-de-la-llave.ts`:
 *
 *     LA MAQUINARIA        +2.422 B   las dos caras de cada casilla y sus 20 usos
 *     EL TEXTO INVENTADO   +1.064 B   las 20 cadenas de `mentira`
 *     LOS PLACEHOLDERS       +817 B   el tercer estado del marco y sus tres usos
 *     LA MARCA EN PANTALLA      0 B   es un componente de SERVIDOR
 *
 * ⚠️ **NO se suma a `MONTAJES_DECLARADOS_KIB`, y ésa es toda la idea.** El techo
 * del lane —60 del original más los siete montajes con nombre— **no se movió ni
 * un byte por §4** y se puede seguir leyendo solo: `s5-peso` resta esta línea
 * APARTE y dice en voz alta que la resta es andamio. La instrucción lo pide con
 * esas palabras: *«se declara como PESO DE LA LLAVE, aparte del montaje de B12…
 * No subas el techo.»*
 *
 * ⚠️ **Y la corrección, publicada: apagar la llave devuelve 0 bytes.** El A/B
 * con `CONTENIDO_INVENTADO` en `false` da **la misma cifra al byte**, porque
 * `INVENTOS` es un objeto en tiempo de ejecución y sus cadenas viajan igual.
 * Apagar devuelve la PANTALLA —los marcadores, la franja, el build— y lo que
 * devuelve los BYTES es borrar las veinte entradas de `_contrato/inventado.ts`.
 * Está medido: 1.064 B.
 *
 * Al centésimo de arriba, con la convención de B8, B10, B11 y B12: 4.303 / 1024
 * = 4,2021 → **4,20**, que deja **6,0 B de aire** bajo la línea.
 */
export const PESO_DE_LA_LLAVE_KIB = 4.2

/**
 * **+0,10 KiB** — lo que queda SIN DUEÑO después de restarle a lo escrito las
 * seis líneas de arriba. No es un montaje: es el residuo, y por eso **se publica
 * con atribución y no se afirma** (regla 13). **Medido por B10 sobre ESTE árbol,
 * el de las cuatro ramas mergeadas**: 63.864 B escritos − 62,27 KiB de líneas
 * con nombre = 99,5 B. B11 no lo re-midió y no hacía falta: el «antes» de su
 * A/B es exactamente el árbol que B10 midió, con los mismos 63.864 B.
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
 * ⚠️ Son **los SIETE montajes más el heredado**, sin repetir ni faltar; la novena
 * línea con nombre es el techo de 60, y se la suma `PRESUPUESTO_PROPIO_KIB`.
 * El merge de las cuatro ramas dejó este sumatorio con la forma que traía B8
 * —que se escribió cuando B9 todavía no estaba en el árbol— y **`MONTAJE_DE_B9_KIB`
 * quedó afuera**: la constante existía, con su valor de origen, y no se sumaba.
 * B10 la volvió a poner. B11 agregó la suya en el mismo acto en que la declaró.
 */
export const MONTAJES_DECLARADOS_KIB =
  MONTAJE_DE_B4A_KIB +
  ARREGLO_DE_B7_KIB +
  MONTAJE_DE_B6A_KIB +
  MONTAJE_DE_B9_KIB +
  MONTAJE_DE_B8_KIB +
  MONTAJE_DE_B11_KIB +
  MONTAJE_DE_B12_KIB +
  HEREDADO_SIN_DECLARAR_KIB
export const PRESUPUESTO_PROPIO_KIB = PRESUPUESTO_DEL_LANE_KIB + MONTAJES_DECLARADOS_KIB

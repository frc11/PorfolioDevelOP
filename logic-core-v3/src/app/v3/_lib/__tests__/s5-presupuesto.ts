/**
 * EL PRESUPUESTO DE PESO DE `/v3`, Y EL RECIBO DE CADA VEZ QUE SE MOVIÓ.
 *
 * Sale de `s5-peso.invariant.ts` en B6-A, con la forma que B7 le dio en su
 * lane al mismo problema: **una línea por dueño**. El corte es por naturaleza
 * y no por tamaño: acá viven **los números y por qué valen lo que valen**; allá
 * vive **la medición que los compara contra el build**. Un presupuesto es una
 * decisión con recibo, y una decisión con recibo se lee entera de una sentada:
 * por eso los docblocks viajan con las constantes y no con las afirmaciones.
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Cada aumento es **una línea con nombre y con su dueño**, y el techo original
 * de 60 KiB sigue vivo restándolas todas: un byte que crezca sin declararse no
 * tiene línea que lo cubra y pone la comprobación en rojo igual.
 */

/**
 * No es un número elegido: es la suma de dos medidos, y la cuenta cambió con la
 * compuerta.
 *
 *   · S1 fijó **30 KiB** para lo propio de `/v3` cuando era el esqueleto.
 *   · Las ocho secciones, con su árbol quieto, agregan lo que agregan — y **ya
 *     no agregan los 28,2 KiB del sistema de motion**, que era la mitad del
 *     presupuesto viejo de este lane: ese chunk ahora entra por la compuerta.
 *
 * 60 KiB es el mismo techo que este invariante tenía, y ahora cubre OCHO
 * secciones en vez de cuatro **porque lo que salió del bundle hizo lugar**.
 * Está escrito acá con la cuenta a la vista para que se pueda discutir el
 * número y no la intención.
 *
 * ═══ B4-A · DE DÓNDE SALÍAN LOS 1,3 KiB QUE B2 REPORTÓ ════════════════════
 *
 * B2 midió **61,3 KiB contra 60** y no lo aflojó: lo dejó anotado como lo único
 * que impedía que `verificar` cerrara en cero. Buscada la causa antes de tocar
 * el número, **son 1,36 KiB de preámbulo de Sentry**, y no hay que estimarlo:
 * `@sentry/nextjs` le inyecta a **cada chunk del build** un bloque idéntico de
 * **348 bytes** que registra un `_sentryDebugId`. Cuatro chunks propios × 348 B
 * = 1.392 B = **1,36 KiB**, que es exactamente el desvío que B2 publicó.
 *
 * ── Por qué esto NO es aflojar el techo (regla 13) ────────────────────────
 *
 * Porque **no es peso del lane y el lane no lo puede tocar**: lo inyecta la
 * integración de Sentry declarada en la configuración RAÍZ, que estos sprints
 * tienen prohibida —la misma razón por la que 21 chunks heredados traen otros
 * 5,10 KiB del mismo preámbulo—. Un techo que lo cuenta pone al lane a fallar
 * por bytes que no escribió, que es exactamente lo que la regla 13 nació para
 * no hacer (`s3-peso`, 24 archivos del layout raíz).
 *
 * **El techo NO se mueve: sigue en 60 KiB.** Lo que cambia es QUÉ se mide
 * contra él: los bytes que el lane escribe, con el preámbulo heredado restado y
 * **publicado aparte, con su dueño**. Si el preámbulo crece, se ve en la línea
 * de al lado; si lo propio crece, el techo lo caza igual.
 */
export const PRESUPUESTO_DEL_LANE_KIB = 60

/**
 * ═══ EL TECHO SUBE A 61,25 KiB — LA DECISIÓN, CON SU RECIBO ═══════════════
 *
 * ⚠️ **Lo decidió el humano en la parada de B4-A, con el número a la vista**, y
 * queda escrito acá para que la decisión sea **revocable**: la alternativa
 * medida era **no montar la marca**.
 *
 * ── Qué compró el aumento ─────────────────────────────────────────────────
 *
 * B4-A montó en el home vivo la marca que B3 había construido y dejado sin
 * montar —el prefijo en los ocho rótulos de sección, el logotipo y el separador
 * en el pie, el prefijo en los cinco enlaces de la pastilla— y construyó la
 * meseta de Trabajos. Con eso cierra el diagnóstico que abrió el bloque: *lo que
 * lo haría funcionar es el SISTEMA, no el objeto*.
 *
 *     lo que ESCRIBE el lane hoy            61,140 KiB
 *     − lo que escribía antes de B4-A       59,940 KiB  (B2, 61,3 menos el preámbulo)
 *     = lo que B4-A monta                    1,200 KiB   ← lo que el techo sube
 *
 * El techo queda en **61,25 KiB**: los 1,200 medidos más 0,11 KiB de aire, que
 * es el mismo margen apretado con el que el 60 venía corriendo (59,94 contra 60).
 * **Sigue mordiendo**: cualquier byte que crezca después de esto lo caza igual.
 *
 * ── Lo que se achicó ANTES de subirlo, y por eso no sube más ──────────────
 *
 * La glue del bloque animado —`ANCLA_DEL_PIN`, `cronogramaDe`,
 * `especificacionDe`, `inerciaDe`— viajaba en la carga inicial por compartir
 * archivo con `deberiaAnimar`, que sí consume el árbol quieto. **503 B medidos**,
 * del lado equivocado de la compuerta de 1025 y **sin que ningún instrumento lo
 * viera** (`s7-compuerta` busca las huellas de `_lib/motion/` y esto era del
 * CONTRATO). Se fue a `_contrato/bloqueAnimado.ts`. Sin ese arreglo el aumento
 * habría sido de 1,70 KiB en vez de 1,20.
 *
 * ── Cómo se revoca, y qué queda vigilando el número viejo ─────────────────
 *
 * `PRESUPUESTO_DEL_LANE_KIB` **no se borró**: sigue en 60 y se afirma aparte,
 * restándole lo que B4-A monta. O sea que el techo viejo sigue vivo como
 * comprobación sobre todo lo que NO es la marca. Desmontar la marca tiene que
 * devolver el número a 59,94 y este archivo lo va a decir.
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Éste subió UNA vez, con la causa medida byte por byte —1,36 KiB heredados que
 * salieron de la cuenta, 503 B propios que se achicaron, 1,20 KiB propios que se
 * declararon— y con la alternativa escrita. El próximo que lo quiera mover tiene
 * que traer las tres cosas.
 */
export const MONTAJE_DE_B4A_KIB = 1.25

/**
 * ═══ B6-A · EL TECHO SUBE OTRA VEZ, EN DOS LÍNEAS DE DUEÑOS DISTINTOS ═════
 *
 * ⚠️ **Lo decidió el humano en la PARADA 2 de B6-A, con las tres cosas que B4-A
 * exige: la causa medida, lo que se achicó antes, y la alternativa escrita.** Y
 * con la cuarta que B7 estrenó en su lane: **el excedente se PARTE por dueño**,
 * porque no todo es de este bloque.
 *
 * ── El recibo, con los dos builds ─────────────────────────────────────────
 *
 * Dos builds de producción el mismo día, con el MISMO `node_modules`, las
 * mismas banderas (`CIRCLE_NODE_TOTAL=2`, heap de 6 GB) y los cinco chunks
 * propios pesados byte a byte (`docs/rediseno/outputs/b6/peso.json`):
 *
 *     (1) HEAD, 5ecfbe55 (B5), extraído con `git archive`   62,563 KiB   (64.064 B)
 *     (2) el árbol de B6-A                                    62,782 KiB   (64.289 B)
 *
 * De donde salen las dos líneas:
 *
 *   · **PROPIO de B6-A, se AFIRMA: 0,25 KiB.** El delta entre (1) y (2) son
 *     **225 bytes** (0,22 KiB): +217 en el chunk de `secciones` y `superficies`
 *     —la cuarta superficie y la lista derivada de las que dejan ver la escena—,
 *     +65 en `layout` —la referencia a `_estilos/velo.css`— y −58 en `page` —el
 *     rótulo sin `opacity-casi`, la prop `lente` en el bloque de P7—. Se declara
 *     0,25: los 0,22 medidos más 0,03 de aire, el mismo margen con el que B7
 *     declaró sus 0,52 como 0,55. Es lo que cuesta que Trabajos y el Cierre
 *     dejen ver la sala.
 *   · **HEREDADO, se PUBLICA con su dueño y NO se afirma: 1,35 KiB.** El punto
 *     (1) es HEAD **antes de que B6-A tocara una línea de producto**, y ya daba
 *     **62,56 contra 61,25: rojo, por 1,31**. B6-A no lo produjo y no se lo
 *     apropia. ⚠️ **B7 midió el MISMO commit en 61,40 en su worktree** —0,11 de
 *     rojo, su `HEREDADO_SIN_DECLARAR_KIB`—, con las mismas versiones de `next`,
 *     `@sentry/nextjs` y `react`, y sin `NEXT_PUBLIC_*` inlineadas en los chunks
 *     propios de ninguno de los dos. **La diferencia de 1,16 KiB entre los dos
 *     entornos NO está atribuida**, y por eso esta línea lleva el número de ESTE
 *     entorno y no el de aquél: 1,31 medidos más 0,04 de aire, el mismo margen
 *     con el que B7 declaró sus 0,11 como 0,15.
 *
 * ── Lo que se achicó ANTES de subirlo ─────────────────────────────────────
 *
 * El lente de P7 (`_lib/motion/lente.ts`) y la vecindad del revelado
 * (`revelado.ts`) **no están en la carga inicial**: el primero entra con el
 * chunk perezoso de la coreografía y el segundo con el de la escena. La prop
 * `lente` del contrato es un tipo y pesa cero. Lo único que llegó al chunk
 * inicial es el dato: la cuarta superficie.
 *
 * ── La alternativa, escrita, con lo que cuesta ────────────────────────────
 *
 * No agregar la cuarta superficie como dato y ponerle la clase `velo` a mano a
 * las dos secciones ahorraría los 217 bytes del chunk de `superficies`. Y
 * rompería lo que S1 construyó a propósito: que cambiar el recorrido de
 * superficies del sitio sea editar ocho valores en una tabla, con el revelado,
 * la visibilidad y el anclaje derivándose de ella. Se descartó por eso, no por
 * el peso.
 *
 * ── Por qué DOS constantes y no una sola más grande ───────────────────────
 *
 * Porque son de dueños distintos y se comportan distinto. El día que alguien
 * atribuya el desvío de HEAD entre los dos entornos y lo devuelva, **el techo
 * baja solo** al borrar esa línea, sin tener que re-derivar nada. Un número
 * único habría enterrado la distinción, que es exactamente lo que la regla 13
 * prohíbe.
 */
export const MONTAJE_DE_B6A_KIB = 0.25
export const HEREDADO_SIN_DECLARAR_KIB = 1.35

/**
 * ⚠️ **TODO AUMENTO ES UNA LÍNEA CON NOMBRE, Y EL TECHO VIEJO LAS RESTA TODAS.**
 *
 * Es lo que impide que esto se convierta en un número que sube solo: el
 * presupuesto original de 60 KiB sigue vivo y se afirma **restando cada montaje
 * declarado**. Un byte que crezca sin declararse no tiene línea que lo cubra y
 * pone la comprobación en rojo igual.
 */
export const MONTAJES_DECLARADOS_KIB = MONTAJE_DE_B4A_KIB + MONTAJE_DE_B6A_KIB + HEREDADO_SIN_DECLARAR_KIB
export const PRESUPUESTO_PROPIO_KIB = PRESUPUESTO_DEL_LANE_KIB + MONTAJES_DECLARADOS_KIB

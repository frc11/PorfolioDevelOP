/**
 * EL RECIBO DE TAPADO-1 — los bytes de producto que dejaron el lane arriba del
 * techo, medidos y **con su línea aplicada en la parada de PAPEL-1**.
 *
 * ── Por qué existe este archivo ───────────────────────────────────────────
 *
 * La parada de PESO-1 aprobó subir `MONTAJE_DEL_TITULAR_KIB` de 0,69 a 0,70.
 * Aplicado, eso da **+10,24 B de techo**, y el lane estaba **12,4 B arriba**:
 * quedaban **2,2 B sin cubrir y el gate en rojo**. Ésos son los bytes que este
 * recibo mide y que la línea de abajo, aplicada en la parada de PAPEL-1, cubre.
 *
 * ⚠️ **Eso no es un defecto de la propuesta del titular.** Esa línea hablaba del
 * AIRE DE SU PROPIO REDONDEO —0,6 B, la convención del centésimo de arriba
 * cayendo dos veces del lado malo— y lo arregla: pasa a 10,8 B. El excedente del
 * lane es otra cuenta y tiene otro dueño.
 *
 * El dueño es **TAPADO-1**, que movió el texto del hero abajo del breakpoint. Su
 * único archivo de PRODUCTO es `_secciones/hero/Hero.tsx`: lo que viaja de ese
 * cambio es la cadena de clases `justify-end … escritorio:justify-center` y las
 * utilidades que Tailwind emite por ella. **TAPADO-1 no declaró su línea**, así
 * que sus bytes se le cargaron al techo de los demás.
 *
 * ── EL MÉTODO ─────────────────────────────────────────────────────────────
 *
 * `scripts-peso/a-atribuir.ts`. Dos builds de producción del MISMO árbol en la
 * MISMA máquina, con **una sola variable**: `Hero.tsx` devuelto a `cdd7ae03` —el
 * commit anterior a TAPADO-1— con `git show`, y restaurado después desde una
 * copia guardada FUERA del árbol. Los dos con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`,
 * que es como se construye este árbol. Entre medio, `s5-peso` lee el lane.
 *
 * El restore se verificó por sha256 contra el original:
 *
 *     a0b730487469aa916f778ee1050cf0d197e72e0849662f438ee53d4dd4896cd4
 *
 * ⚠️ **Las dos lecturas son con la línea del titular YA en 0,70**, o sea con el
 * mismo techo. Por eso la resta de los aires (20,8 − (−2,2) = 23,0) da lo mismo
 * que la resta de los bytes escritos: la única variable fue `Hero.tsx`.
 */

/** Lo que el `Hero.tsx` de TAPADO-1 le suma a la carga inicial de `/v3`. */
export const DESVIO_DE_TAPADO_BYTES = 23.0

/**
 * Las dos lecturas del A/B, en bytes de lo que ESCRIBE el lane (crudo, sin el
 * andamio de la llave). Salen de la misma afirmación de `s5-peso`.
 */
export const ESCRITO_ANTES_DE_TAPADO_BYTES = 66_027.2
export const ESCRITO_DESPUES_DE_TAPADO_BYTES = 66_050.2

/** Y el aire que publicaba cada una, con el techo de hoy. */
export const AIRE_ANTES_DE_TAPADO_BYTES = 20.8
export const AIRE_DESPUES_DE_TAPADO_BYTES = -2.2

// ════════════════════════════════════════════════════════════════════════════
// ✅ LA PROPUESTA — APLICADA en la parada de PAPEL-1. El humano la aprobó, y
//    la subió del centésimo que proponía al siguiente.
// ════════════════════════════════════════════════════════════════════════════

/**
 * **APLICADA: una línea nueva, `MONTAJE_DE_TAPADO_KIB = 0,04`.** El texto de la
 * propuesta va abajo INTACTO, con el criterio con el que se escribió, porque lo
 * que hay que poder leer después es cómo se decidió. Lo que cambió es el estado
 * **y el centésimo**: la parada eligió 0,04 y no 0,03, y el porqué es una regla
 * nueva que queda escrita acá.
 *
 * ── 🔴 LA REGLA NUEVA, que esta línea estrena ────────────────────────────
 *
 * > **UNA LÍNEA NUEVA NO NACE POR DEBAJO DEL UMBRAL DE AIRE ÚTIL.** Si la cifra
 * > al centésimo de arriba la deja abajo de `AIRE_MINIMO_UTIL_BYTES` (8 B), se
 * > sube al centésimo siguiente **y se dice**.
 *
 * No reemplaza la convención del centésimo de arriba: la acota en un solo caso,
 * el que la propuesta de abajo describe y no se animaba a resolver sola. El
 * disparador es objetivo —el aire cae abajo del umbral declarado— y la
 * consecuencia es una sola: un centésimo más, publicado.
 *
 * Por qué vale la pena: el aire es **la parte útil del redondeo**, y una línea
 * que nace con 7,7 B de aire nace siendo la más apretada del tablero y vuelve a
 * la parada al primer byte de producto que alguien agregue. Es exactamente lo
 * que le pasó a la línea del titular, que costó TRES paradas por caer dos veces
 * seguidas del lado malo del centésimo (`s5-presupuesto-recibos-del-titular.ts`).
 * La regla convierte ese modo de falla en una decisión de una sola vez.
 *
 * Y lo que la regla NO hace: **no mueve el techo de 60**, no sube ninguna de las
 * nueve líneas ya vivas, y no autoriza a redondear «por las dudas» — el
 * disparador es haber caído abajo del umbral, no la comodidad.
 *
 * ── Los números de ESTA línea con el centésimo elegido ───────────────────
 *
 *     medido            23,0 B
 *     0,04 KiB          40,96 B  →  **17,96 B de aire**, arriba del umbral de 8
 *     (0,03 KiB         30,72 B  →  7,7 B, 0,3 B DEBAJO: el caso que la regla ataca)
 *
 * ── El texto de la propuesta, intacto ────────────────────────────────────
 *
 * **PROPUESTA: una línea nueva, `MONTAJE_DE_TAPADO_KIB = 0,03`.**
 *
 * Es la convención del repo sin excepciones: los bytes medidos, al centésimo de
 * arriba. 23,0 / 1024 = 0,0225 → **0,03 KiB**. Es la misma cuenta con la que
 * salieron B11 (25 B → 0,03) y MOVIL-1 (31,0 B → 0,04).
 *
 * **El techo de 60 NO se mueve.** Lo que se agrega es una línea con nombre que se
 * le SUMA, revocable sola, igual que las otras ocho. Con ella el lane pasa de
 * −2,2 B de aire a **+28,5 B** y `s5-peso` vuelve a verde.
 *
 * ⚠️ **Y lo que esta propuesta deja peor de lo que a uno le gustaría, dicho acá
 * y no escondido:** 0,03 KiB son 30,72 B contra 23,0 medidos, o sea **7,7 B de
 * aire** — **0,3 B por debajo** del umbral de aire útil de 8 B que
 * `s5-presupuesto-recibos-del-titular.ts` declara. O sea que esta línea nace
 * siendo la más apretada del tablero y es la próxima candidata a moverse.
 *
 * El centésimo siguiente (0,04 → 17,96 B de aire) lo arreglaría, pero **eso sería
 * inventar una regla nueva en una propuesta**: ninguna de las ocho líneas vivas
 * se redondeó para comprar aire, y la del titular tardó tres paradas justamente
 * porque el repo no deja hacer eso solo. La cuenta se publica; elegir 0,03 o 0,04
 * es de la parada.
 */
export const PROPUESTA_DE_TAPADO_KIB = 0.04

/**
 * El centésimo que la propuesta pedía, ANTES de la parada. Vive acá por el mismo
 * motivo que `LINEA_VIEJA_DEL_TITULAR_KIB` vive en el invariante: su único uso es
 * ser la entrada equivocada del control positivo del aire. Un control que se
 * alimentara de la constante de verdad no probaría nada.
 */
export const LINEA_QUE_LA_PROPUESTA_PEDIA_KIB = 0.03

/** El aire que deja esta línea, en bytes. Misma forma que `aireDe` del titular. */
export const aireDeTapado = (kib: number): number => kib * 1024 - DESVIO_DE_TAPADO_BYTES

/** El aire de la línea aplicada, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_BYTES = aireDeTapado(PROPUESTA_DE_TAPADO_KIB)

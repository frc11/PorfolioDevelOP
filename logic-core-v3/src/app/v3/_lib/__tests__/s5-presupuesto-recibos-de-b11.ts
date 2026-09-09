/**
 * LOS RECIBOS DEL PRESUPUESTO DE PESO DE `/v3` — TERCERA PARTE: B11, el primer
 * sprint que chocó contra los 2,9 bytes.
 *
 * Es la continuación de `s5-presupuesto-recibos.ts` (el techo, B4-A, B7 y B6-A)
 * y de `s5-presupuesto-recibos-del-merge.ts` (B9, B8 y el heredado), y existe
 * por la misma razón que las dos: el recibo completo no entra en las 300 líneas
 * de `-del-merge.ts` (278 antes de B11), y la regla del repo es **partir por
 * dueño, no recortar**.
 *
 * Este archivo es prosa y no exporta un valor: el `export {}` está para que
 * `isolatedModules` lo trate como módulo y no como script global.
 */
export {}

/**
 * ═══ RECIBO DE `MONTAJE_DE_B11_KIB` ══════════════════════════════════════
 * B11 · EL TEXTO CORRIDO DE DONDE PASA EL LOGO — 0,03 KiB (25 B netos medidos)
 *
 * ⚠️ **Lo decidió el humano en las dos paradas de B11** («declarado, con la
 * alternativa escrita —no mover la foto— como todos los anteriores. No subas el
 * techo», PARADA 1; «usá la palanca de la tinta en la persona 2», PARADA 2), y
 * las tres cosas que B4-A exige para mover este número están abajo.
 *
 * ── Por qué B11 es el sprint que la advertencia de B10 anunciaba ──────────
 *
 * B10 dejó el margen en **2,9 B** y escribió que el próximo sprint que agregara
 * una línea de producto a `/v3` iba a chocar contra eso, con dos salidas
 * legítimas —declarar el montaje o re-medir el heredado— y una que no existe
 * —subir el 60—. B11 movió tres piezas de texto y el lane creció. Ésta es la
 * salida legítima, con su forma exacta.
 *
 * ── La medición: A/B sobre el MISMO árbol y el mismo entorno ──────────────
 *
 * Builds de producción en primer plano, `CIRCLE_NODE_TOTAL=2`, con el mismo
 * instrumento que las dos líneas anteriores (`scripts-b8/peso.ts`: los 5 chunks
 * propios, el preámbulo de Sentry restado chunk por chunk):
 *
 *     `.next-b11`  el árbol ANTES de tocar producto (distDir aislado, agregado
 *                  a `.gitignore` antes del build)
 *                  5 chunks · 65.604 B crudos · 1.740 B de preámbulo
 *                  = **63.864 B escritos por el lane** — EXACTAMENTE los de B10
 *     `.next`      el build final de B11 (después de la PARADA 2)
 *                  5 chunks · 65.629 B crudos · 1.740 B de preámbulo
 *                  = **63.889 B escritos por el lane = 62,392 KiB**
 *     ────────────────────────────────────────────────────────────────────
 *     delta        **+25 B**, y los 25 están en UN chunk: el de `page`
 *                  (49.098 → 49.123 B); los otros cuatro son idénticos byte a
 *                  byte, hash incluido.
 *
 * Que el «antes» dé los mismos 63.864 B que midió B10 es el control de que el
 * instrumento y el entorno no se movieron entre los dos sprints: la única
 * variable entre los dos builds es el producto de B11.
 *
 * ── El reparto byte a byte, leído del chunk minificado ────────────────────
 *
 * Un diff por tokens entre los dos `page-*.js` (`difflib`, sin autojunk) suma
 * exactamente 25 B, y cada byte tiene dueño:
 *
 *     Quiénes somos · la caja de la foto (c3–c5)                    **+27 B**
 *         el minificador saca la clase nueva a una variable:
 *         `y="escritorio:col-start-3 escritorio:col-span-3",w` (+49)
 *         y la referencia reemplaza al literal viejo
 *         `className:"escritorio:col-span-4"` → `className:y` (−22)
 *     Quiénes somos · el epígrafe alineado a la derecha             **+34 B**
 *         `className:"escritorio:text-right",` en el `Caption`
 *     Quiénes somos · dos tintas a plena (PARADA 2)                 **−38 B**
 *         ` opacity-casi` fuera del rótulo del pedido (−13) y
 *         `className:(0,t.cn)(C,"opacity-casi")` → `className:E` en
 *         «Tucumán, Argentina» (−25)
 *     Números · las celdas en c7–c12                                 **+2 B**
 *         `tablet:col-start-7` → `tablet:col-start-10` (+1) y
 *         `tablet:col-span-3` → `tablet:col-start-7` en el rótulo (+1);
 *         los otros ocho arranques y anchos cambian un dígito por otro (0)
 *     Trabajos · el renglón del nombre arriba de la captura          **0 B**
 *         `(0,r.jsx)(E.C,{marcador:"[CAPTURA]",…})` sale de un lugar y
 *         entra en otro: −120 y +120
 *     el `_sentryDebugId`, un UUID por build                         **0 B**
 *     ────────────────────────────────────────────────────────────────────
 *                                                                    **25 B**
 *
 * ── ⚠️ 0,03 ESTIMADOS, 0,07 MEDIDOS, 0,03 DECLARADOS: tres cifras que NO ──
 * ──    se comparan entre sí                                              ──
 *
 * La PARADA 1 habló de **0,03 KiB**: una estimación sobre los literales del
 * FUENTE —foto +23, epígrafe +22, Números +2 = 47 B—, hecha antes de construir.
 * El primer build de B11 midió **63 B (0,07)** sobre el CHUNK: el minificador no
 * copia el fuente —la clase de la foto entra como variable (+27 y no +23) y el
 * epígrafe paga su propiedad `className:` entera (+34 y no +22)—, y ése fue el
 * número de la PARADA 2. La PARADA 2 pidió la palanca de la tinta y las dos
 * clases `opacity-casi` que se fueron devolvieron 38 B: **25 B netos, 0,03
 * declarados**. Que el número final coincida con la estimación es casualidad de
 * dos desvíos de signo contrario, y NO valida estimar sobre el fuente: una
 * cifra medida sobre literales y una medida sobre el chunk son dos varas, y
 * dos cifras del mismo sprint sólo se comparan si salen de la misma. Acá vale
 * la del chunk, y las otras dos quedan escritas para que nadie las sume.
 *
 * ── Lo que se achicó antes: nada, y lo que se midió y descartó ────────────
 *
 * B11 no tocó un byte fuera de las tres piezas y las dos tintas, así que no hay
 * «lo que se achicó antes» que restar. Las formas más baratas, cada una con su
 * número, contra el techo viejo de 62,37 KiB = 63.866,9 B:
 *
 *     no mover la foto ni su epígrafe            −61 B → 63.828 B, cierra sin
 *                                                declarar, y deja el marcador
 *                                                «[FOTO DEL EQUIPO]» el 100 %
 *                                                bajo el logo en los tres anchos
 *                                                (1,11:1) y el epígrafe el 76,6 %
 *     mover la foto, el epígrafe a la izquierda  −34 B → 63.855 B, cierra por
 *                                                11,9 B, y los 372 px del
 *                                                epígrafe arrancan en c3, que el
 *                                                logo tapa entre el 34 y el 60 %
 *                                                del tramo
 *     la clase de la foto inline, sin campo      ~−5 B → 63.884 B, no cierra, y
 *     en `GEOMETRIA`                             saca la caja de donde el `sizes`
 *                                                se deriva de ella
 *
 * **Las dos primeras cierran sin declarar nada y las dos cuestan legibilidad
 * medida.** Se descartaron por eso, no por el ahorro: la alternativa escrita es
 * la primera —no mover la foto—, y cuesta la mitad de la foto de D-B8.6.
 *
 * ── El número declarado, y el aire que deja ──────────────────────────────
 *
 * 25 B = 0,0244 KiB, declarados **0,03** con la convención de B8 (70,8 → 0,07)
 * y B10 (99,5 → 0,10): al centésimo de arriba. El techo pasa de 62,37 a
 * **62,40 KiB** = 63.897,6 B; contra los 63.889 escritos quedan **8,6 B de
 * aire**. Y el techo VIEJO sigue vigilando: 62,392 − 2,40 de líneas con nombre
 * = 59,992 < 60. **El 60 no se tocó.**
 *
 * ── La alternativa, escrita ──────────────────────────────────────────────
 *
 * No mover la foto ni su epígrafe: devuelve 61 B y esta línea se borra (los
 * 25 − 61 = −36 B restantes son aire). Por eso la decisión es **revocable**, y
 * el precio de revocarla está medido: la mitad de la foto de D-B8.6 vuelve a
 * abrirse.
 *
 * ── El reparto por dueño ─────────────────────────────────────────────────
 *
 * **Los 25 B son enteros de B11.** No hay una segunda línea como la de B7:
 * nada heredado que separar, y el heredado de B10 (0,10) sigue midiendo lo
 * mismo por construcción —el «antes» de este A/B ES el árbol que B10 midió.
 */

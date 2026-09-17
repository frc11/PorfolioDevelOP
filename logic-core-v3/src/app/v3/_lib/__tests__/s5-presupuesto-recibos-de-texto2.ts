/**
 * EL RECIBO DE TEXTO-2 — los 40 bytes que este sprint le suma al lane, medidos
 * y declarados **en el mismo acto**.
 *
 * ── Por qué existe este archivo ───────────────────────────────────────────
 *
 * TEXTO-2 tocó PRODUCTO: corrigió el alcance del `col-span` del titular, bajó
 * los dos huecos del bloque abajo de 1025 y acortó la bajada. Con eso `s5-peso`
 * quedó en **−1,2 B de aire**. La regla que obliga a esto está escrita en
 * `MONTAJE_DE_TAPADO_KIB`, y se escribió porque TAPADO-1 no la cumplió: *«un
 * sprint que toca producto declara su línea en el mismo acto, como hicieron B11
 * y MOVIL-1»*. Éste la cumple.
 *
 * ── EL MÉTODO ─────────────────────────────────────────────────────────────
 *
 * `scripts-texto/g-peso.ts`, que es `scripts-peso/a-atribuir.ts` con cuatro
 * archivos en vez de uno. Dos builds de producción del MISMO árbol en la MISMA
 * máquina, con **una sola variable**: el hero devuelto a `HEAD` —`4009d327`,
 * TEXTO-1, que no tocó `src/`— con `git show`, y restaurado después desde copias
 * guardadas FUERA del árbol. Los dos con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`, que es
 * como se construye este árbol. Entre medio, `s5-peso` lee el lane.
 *
 * Los cuatro archivos y su sha256, verificados contra el original después de
 * restaurar —los cuatro dieron IDÉNTICO—:
 *
 *     Hero.tsx            81039bd0dcfe2b6a3b67f729f936d576fa7facbf830bb59d6713b21c1506ad8f
 *     geometria.ts        63a43b32f1ed4ed32c7305656a926265059c6c6a4a856351e8e09f9a5e6d2386
 *     contenido.ts        a05883c4be82fbd5256d4443e9339092f398cb0c77437a724e7968c3af772378
 *     hero.invariant.tsx  7f5e035bba4008a9c31d1aed087bb472bffc9d644551b0c76ab2822bab3d1aab
 *
 * ⚠️ **EL INVARIANTE ENTRA EN EL SWAP AUNQUE NO VIAJE, y se aprendió fallando.**
 * La primera corrida lo dejó afuera —no está en ningún chunk, así que no puede
 * mover un byte— y el build del «antes» falló a los tres minutos: con
 * `geometria.ts` devuelto a `HEAD`, el invariante nuevo referencia
 * `columnasDelTitularEnTablet`, que ahí no existe, y el paso de tipos del build
 * tira. El swap tiene que dejar el árbol **compilable**, no sólo el bundle
 * comparable.
 *
 * ── ⚠️ EL CONTROL QUE NADIE PIDIÓ Y QUE CIERRA LA CADENA ─────────────────
 *
 * El «antes» de este A/B da **66.050,2 B**, que es **exactamente** el «después»
 * del A/B de TAPADO-1 (`ESCRITO_DESPUES_DE_TAPADO_BYTES`), al décimo de byte. Y
 * el aire cierra igual: TAPADO-1 leía −2,2 B con el techo de entonces; la parada
 * de PAPEL-1 le sumó 0,04 KiB (40,96 B) y acá se leen **38,8**. −2,2 + 40,96 =
 * 38,76.
 *
 * Las dos cuentas dicen lo mismo: **entre TAPADO-1 y TEXTO-2 ningún sprint
 * agregó un byte de producto.** PAPEL-1, CAMARA-1, CAMARA-2, PESO-1 y TEXTO-1
 * fueron de medición, y esto lo confirma sobre el byte en vez de sobre la
 * intención.
 */

/** Lo que el hero de TEXTO-2 le suma a la carga inicial de `/v3`. */
export const DESVIO_DE_TEXTO2_BYTES = 40.0

/**
 * Las dos lecturas del A/B, en bytes de lo que ESCRIBE el lane (crudo, sin el
 * andamio de la llave). Salen de la misma afirmación de `s5-peso`.
 */
export const ESCRITO_ANTES_DE_TEXTO2_BYTES = 66_050.2
export const ESCRITO_DESPUES_DE_TEXTO2_BYTES = 66_090.2

/** Y el aire que publicaba cada una, con el techo de hoy. */
export const AIRE_ANTES_DE_TEXTO2_BYTES = 38.8
export const AIRE_DESPUES_DE_TEXTO2_BYTES = -1.2

/**
 * ── QUÉ HAY ADENTRO DE LOS 40 BYTES: el inventario, DERIVADO y no medido ──
 *
 * ⚠️ **El reparto por pieza NO está medido, y se declara como tal.** Es la misma
 * franqueza que `s5-presupuesto-recibos-del-titular.ts` estrenó: el total son 40
 * B medidos A/B y esto es la lista de lo que cambió, leída del diff, no una
 * atribución byte a byte. Cerrarla costaría un build por pieza.
 *
 * Lo que SÍ se verificó sobre el `.css` construido: **ninguna de las cinco clases
 * nuevas estrena una regla** — `tablet:col-span-3`, `escritorio:col-span-2`,
 * `gap-2`, `escritorio:gap-8` y `escritorio:gap-6` ya se emitían para otras
 * secciones, así que lo que viaja son cadenas más largas en el chunk, no CSS
 * nuevo. Y la bajada DEVUELVE bytes: 49 caracteres pasan a 33.
 */
export const INVENTARIO_DE_TEXTO2: readonly (readonly [string, string])[] = [
  ['claseDelTitular', 'de `tablet:col-span-2` a `tablet:col-span-3 escritorio:col-span-2` — 21 caracteres mas en la cadena'],
  ['columnasDelTitularEnTablet', 'una clave nueva en el objeto GEOMETRIA, con su valor'],
  ['los dos huecos', '`gap-8` -> `gap-2 escritorio:gap-8` y `gap-6` -> `gap-2 escritorio:gap-6` — 34 caracteres mas entre las dos'],
  ['la bajada', 'DEVUELVE: 49 caracteres pasan a 33'],
]

// ════════════════════════════════════════════════════════════════════════════
// LA PROPUESTA — el centésimo de arriba deja la línea abajo del umbral, así que
//    nace en el siguiente. La regla YA existe: la escribió la parada de PAPEL-1.
// ════════════════════════════════════════════════════════════════════════════

/**
 * **`MONTAJE_DE_TEXTO2_KIB = 0,05`.**
 *
 * La convención del repo es los bytes medidos al centésimo de arriba: 40,0 /
 * 1024 = 0,0391 → **0,04 KiB**. Pero 0,04 son 40,96 B contra 40,0 medidos, o sea
 * **0,96 B de aire**: 7,04 B por debajo del umbral de `AIRE_MINIMO_UTIL_BYTES`
 * (8 B), y la línea más apretada que el tablero haya tenido.
 *
 * Ahí entra la regla que la parada de PAPEL-1 escribió y que esta línea es la
 * segunda en usar:
 *
 * > **UNA LÍNEA NUEVA NO NACE POR DEBAJO DEL UMBRAL DE AIRE ÚTIL.** Si la cifra
 * > al centésimo de arriba la deja abajo de `AIRE_MINIMO_UTIL_BYTES` (8 B), se
 * > sube al centésimo siguiente **y se dice**.
 *
 * Los números, con los dos centésimos a la vista:
 *
 *     medido            40,0 B
 *     0,05 KiB          51,20 B  →  **11,2 B de aire**, arriba del umbral de 8
 *     (0,04 KiB         40,96 B  →  0,96 B, 7,04 B DEBAJO: el caso que la regla ataca)
 *
 * 11,2 B es el orden de B11 (8,6), B12 (8,2), el titular (10,8) y MOVIL-1
 * (10,0). No es holgura de más: es el mismo aire que las demás.
 *
 * ⚠️ **El techo de 60 NO se mueve.** Es una línea con nombre que se le SUMA,
 * revocable sola: revocarla es devolver `tablet:col-span-2`, los dos huecos a
 * 32/24 en todos los anchos y la bajada de 49 caracteres — o sea exactamente la
 * composición que este sprint midió y cambió, y nada más.
 *
 * ⚠️ **Y la aprueba la parada, no este archivo.** Acá está el recibo; aplicar la
 * línea es del humano. Está escrita en `s5-presupuesto.ts` porque la regla del
 * repo pide declararla en el mismo acto, y `s5-peso` afirma que las dos digan lo
 * mismo — si la parada la rechaza, se borran las dos juntas y el gate vuelve a
 * ponerse rojo por los 40 B, que es lo correcto.
 */
export const PROPUESTA_DE_TEXTO2_KIB = 0.05

/**
 * El centésimo que la convención sola habría dado, ANTES de aplicarle la regla
 * del aire útil. Vive acá por el mismo motivo que `LINEA_QUE_LA_PROPUESTA_PEDIA_KIB`
 * vive en el recibo de TAPADO-1: su único uso es ser la entrada equivocada del
 * control positivo del aire. Un control que se alimentara de la constante de
 * verdad no probaría nada.
 */
export const CENTESIMO_DE_LA_CONVENCION_KIB = 0.04

/** El aire que deja esta línea, en bytes. Misma forma que `aireDe` del titular. */
export const aireDeTexto2 = (kib: number): number => kib * 1024 - DESVIO_DE_TEXTO2_BYTES

/** El aire de la línea propuesta, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_DE_TEXTO2_BYTES = aireDeTexto2(PROPUESTA_DE_TEXTO2_KIB)

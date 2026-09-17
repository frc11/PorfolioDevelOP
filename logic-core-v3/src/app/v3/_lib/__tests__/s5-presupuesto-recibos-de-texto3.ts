/**
 * EL RECIBO DE TEXTO-3 — los 216 bytes que cuesta tapar la escena a 320,
 * medidos y declarados **en el mismo acto**.
 *
 * ── Qué compró, y por qué no había otra cosa que comprar ──────────────────
 *
 * A 320 el Hero no tiene composición limpia y está agotado como problema: el
 * bloque de texto ocupa el 51 % del viewport y la masa del logo otro 37 %, la
 * suma pasa de 100, y **no existe ninguna posición en la que no se toquen**.
 * TEXTO-1 barrió 16 configuraciones de tipografía y la de entonces era la mejor
 * de las 16; TEXTO-2 lo empeoró de 31,6 % a 46,7 %. Las palancas de escena están
 * descartadas con número. Lo que estos bytes compran es la única salida que
 * quedaba: **a ese ancho, y sólo a ese, el Hero pinta papel y tapa la escena**.
 *
 * ── EL MÉTODO, y por qué no pudo ser el de `g-peso.ts` ───────────────────
 *
 * `scripts-texto/h-peso.ts`. El A/B de TEXTO-2 devolvía sus archivos a `HEAD`, y
 * eso servía porque aquel sprint abría sobre `HEAD`. **Éste no**: abre sobre el
 * árbol de TEXTO-2, que está sin commitear, así que devolver a `HEAD` habría
 * medido los dos sprints juntos y le habría cargado a éste los 40 B que aquél ya
 * declaró. El «antes» se arma por archivo, de dos fuentes:
 *
 *   · **cinco desde `HEAD`** — los que TEXTO-2 no tocó, así que su estado en
 *     `HEAD` es su estado al abrir este sprint.
 *   · **dos desde el respaldo de TEXTO-2** — `contenido.ts` y
 *     `hero.invariant.tsx`, que aquel sprint sí tocó. Sus versiones quedaron
 *     guardadas FUERA del árbol por su propio A/B, y el script **verifica su
 *     sha256 contra el que publica `s5-presupuesto-recibos-de-texto2.ts`** antes
 *     de usarlas: no se le está creyendo a un archivo de temporales.
 *
 * ── ⚠️ EL CONTROL QUE HACE QUE LA RESTA SIGNIFIQUE ALGO ──────────────────
 *
 * El «antes» de este A/B **reproduce el «después» del A/B de TEXTO-2 al décimo
 * de byte**: 66.090,2 B contra 66.090,2 B, desvío **−0,0 B**. O sea que el árbol
 * que se construyó como «antes» ES el árbol con el que este sprint abrió, y no
 * una aproximación. Sin ese control la resta sería una cuenta entre dos builds
 * que nadie ató a nada.
 *
 * ⚠ Los cuatro invariantes entran en el swap aunque no viajen en ningún chunk,
 * por la lección de `g-peso.ts`: el swap tiene que dejar el árbol **compilable**,
 * no sólo el bundle comparable.
 */

/** Lo que TEXTO-3 le suma a la carga inicial de `/v3`. */
export const DESVIO_DE_TEXTO3_BYTES = 216.0

/** Las dos lecturas del A/B, en bytes de lo que ESCRIBE el lane. */
export const ESCRITO_ANTES_DE_TEXTO3_BYTES = 66_090.2
export const ESCRITO_DESPUES_DE_TEXTO3_BYTES = 66_306.2

/** Y el aire que publicaba cada una, con el techo de hoy. */
export const AIRE_ANTES_DE_TEXTO3_BYTES = 50.0
export const AIRE_DESPUES_DE_TEXTO3_BYTES = -166.0

/**
 * ── QUÉ HAY ADENTRO DE LOS 216 BYTES: el inventario, DERIVADO y no medido ──
 *
 * ⚠️ **El reparto por pieza NO está medido, y se declara como tal**, igual que
 * en el titular y en TEXTO-2. El total son 216 B medidos A/B; esto es la lista
 * de lo que cambió, leída del diff. Cerrarla costaría un build por pieza.
 *
 * ⚠️ **Y hay que decir que son MUCHOS bytes para lo que compran**: 216 B es la
 * quinta línea más grande del tablero, por un fondo que se pinta en una banda de
 * 55 px de ancho. La razón es que el mecanismo es nuevo —un campo en el tipo del
 * recorrido, una tabla de clases, una rama en el panel y un atributo—, no la
 * decisión en sí. El día que una segunda sección declare banda angosta, la
 * maquinaria ya está paga y sólo cuesta su fila.
 *
 * ⚠️ **El token NO está en esta cuenta, y no es un olvido.**
 * `--breakpoint-angosto` y la regla `.max-angosto\:bg-fondo` son CSS, y este
 * techo mide **sólo los `<script src>` de la ruta**. El CSS del lane tiene su
 * propia vigilancia y no se toca acá.
 */
export const INVENTARIO_DE_TEXTO3: readonly (readonly [string, string])[] = [
  ['superficies.ts', 'el tipo `ModoSuperficieAngosta` y la tabla `CLASES_DE_LA_BANDA_ANGOSTA` con sus dos entradas'],
  ['secciones.ts', 'el campo `superficieAngosta` en el tipo y su valor en la fila del Hero'],
  ['Panel.tsx', 'la rama del `cn()` y el atributo `data-superficie-angosta`'],
  ['contenido.ts', 'la bajada A contra la B: 35 caracteres contra 33, o sea +2'],
]

// ════════════════════════════════════════════════════════════════════════════
// LA PROPUESTA — el centésimo de arriba alcanza, y por primera vez en tres
//    líneas seguidas no hace falta la regla del aire útil.
// ════════════════════════════════════════════════════════════════════════════

/**
 * **`MONTAJE_DE_TEXTO3_KIB = 0,22`.**
 *
 * La convención del repo sin excepciones: los bytes medidos al centésimo de
 * arriba. 216,0 / 1024 = 0,2109 → **0,22 KiB**, que son 225,28 B y dejan **9,3 B
 * de aire**, por encima del umbral de `AIRE_MINIMO_UTIL_BYTES` (8 B).
 *
 * ⚠ **Es la primera de las tres últimas que NO necesita la regla del aire útil.**
 * TAPADO-1 (23 B → 0,03 dejaba 7,7) y TEXTO-2 (40 B → 0,04 dejaba 0,96) tuvieron
 * que subir un centésimo; ésta cae del lado bueno sola. No es mérito de nadie:
 * es que 216 B cae cerca del medio de su centésimo y los otros dos caían al
 * borde. Se dice para que no se lea como que la regla dejó de hacer falta.
 *
 * ⚠️ **El techo de 60 NO se mueve.** Es una línea con nombre que se le SUMA, y es
 * revocable sola: revocarla es sacar `superficieAngosta` de la fila del Hero y
 * con ella el campo, la tabla de clases, la rama del panel y el atributo — o sea
 * volver a mostrar la escena a 320, que es exactamente la composición que este
 * sprint midió y descartó.
 */
export const PROPUESTA_DE_TEXTO3_KIB = 0.22

/** El aire que deja esta línea, en bytes. Misma forma que las tres anteriores. */
export const aireDeTexto3 = (kib: number): number => kib * 1024 - DESVIO_DE_TEXTO3_BYTES

/** El aire de la línea propuesta, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_DE_TEXTO3_BYTES = aireDeTexto3(PROPUESTA_DE_TEXTO3_KIB)

/**
 * El centésimo de ABAJO. Su único uso es ser la entrada equivocada del control
 * positivo: con 0,21 el aire queda en −0,9 B, o sea la línea no alcanza a cubrir
 * lo medido. Un control que se alimentara de la constante de verdad no probaría
 * nada.
 */
export const CENTESIMO_QUE_NO_ALCANZA_KIB = 0.21

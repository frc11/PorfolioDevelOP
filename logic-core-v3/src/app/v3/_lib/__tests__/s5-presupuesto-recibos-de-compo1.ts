/**
 * EL RECIBO DE COMPO-1 — los 589 bytes que cuestan diez ajustes de composición
 * del Hero, medidos y declarados **en el mismo acto**.
 *
 * ── Qué compró ───────────────────────────────────────────────────────────
 *
 * Diez pedidos del dueño mirando el sitio, todos de composición y ninguno de
 * escena. Los que dejan bytes en la carga inicial son seis:
 *
 *   1. el titular en TRES filas abajo de 1025, con el quiebre declarado;
 *   2. la bajada en DOS filas, también declarado;
 *   3. la bajada un escalón más grande (`cuerpo` → `base`);
 *   4. el CTA alineado al borde de la columna, cancelando su propio relleno;
 *   5. la columna lateral de 140 px, que en el Hero está VACÍA, colapsada de
 *      768 a 1025 — el texto arranca en x 32 en los seis anchos de abajo;
 *   6. el aire del pie en portátil, de 8 a 24 px.
 *
 * ── EL MÉTODO, y por qué el «antes» no pudo salir de `git` (otra vez) ─────
 *
 * `scripts-compo/c-peso.ts`. Este sprint abre sobre el árbol de **TEXTO-3**,
 * que sigue sin commitear —y arriba de MOVIL-1 y TEXTO-2, que tampoco—, así que
 * devolver a `HEAD` habría medido cuatro sprints juntos y le habría cargado a
 * éste los 216 B de TEXTO-3, los 40 de TEXTO-2 y los 23 de TAPADO-1. El «antes»
 * se arma por archivo, de tres fuentes:
 *
 *   · **ocho desde el respaldo** que este sprint copió FUERA del árbol antes de
 *     su primera edición, con su sha256 publicado abajo;
 *   · **uno desde `HEAD`** — `src/lib/utils.ts`, el único que ningún sprint sin
 *     commitear había tocado, y el script publica su `git status` para que eso
 *     sea verificable y no una afirmación;
 *   · **uno que NO existía** — `composicion.ts`, que en el «antes» se borra.
 *
 * ── ⚠️ EL CONTROL QUE HACE QUE LA RESTA SIGNIFIQUE ALGO ──────────────────
 *
 * El «antes» de este A/B **reproduce el «después» del A/B de TEXTO-3 al décimo
 * de byte**: 66.306,2 B contra 66.306,2 B, desvío **0,0 B**. O sea que el árbol
 * que se construyó como «antes» ES el árbol con el que este sprint abrió, y no
 * una aproximación. Sin ese control la resta sería una cuenta entre dos builds
 * que nadie ató a nada.
 *
 * ⚠ Los seis invariantes entran en el swap aunque no viajen en ningún chunk,
 * por la lección de `g-peso.ts`: el swap tiene que dejar el árbol **compilable**,
 * no sólo el bundle comparable.
 */

/** Lo que COMPO-1 le suma a la carga inicial de `/v3`. */
export const DESVIO_DE_COMPO1_BYTES = 589.0

/** Las dos lecturas del A/B, en bytes de lo que ESCRIBE el lane. */
export const ESCRITO_ANTES_DE_COMPO1_BYTES = 66_306.2
export const ESCRITO_DESPUES_DE_COMPO1_BYTES = 66_895.2

/**
 * Y el aire que publicaba cada una.
 *
 * ⚠️ **ESTAS DOS CIFRAS SE LEYERON CON LA LÍNEA YA DECLARADA, y por eso NO son
 * comparables con las de los recibos anteriores.** El A/B tuvo que correrse dos
 * veces: la primera midió 573 B y la línea se declaró en 0,57; después la
 * medición del navegador encontró que `medio:mb-4` llegaba a 1440 y a 1920 —una
 * variante de ancho es `min-width` y no se apaga sola— y la corrección
 * (`escritorio:mb-0`) agregó 16 B. La segunda corrida ya tenía el techo con la
 * línea adentro. **Lo que sostiene la línea es la RESTA**, que es
 * ceiling-independiente: 66.895,2 − 66.306,2 = 589,0.
 */
export const AIRE_ANTES_DE_COMPO1_BYTES = 642.9
export const AIRE_DESPUES_DE_COMPO1_BYTES = 53.9

/**
 * Los sha256 de los archivos del «antes», para que el próximo sprint que abra
 * sobre ESTE árbol pueda armar el suyo sin adivinar — que es exactamente el
 * servicio que TEXTO-2 nos hizo a nosotros. Son los que este sprint copió fuera
 * del árbol antes de tocar nada.
 */
export const SHA256_DEL_ARBOL_DE_TEXTO3: readonly (readonly [string, string])[] = [
  ['src/app/theme-develop.css', '5637c1ae5134e6ca49ae92245c56783baba653877e07bc841af541cec6fe9c96'],
  ['src/app/v3/_secciones/hero/contenido.ts', '74624254fde21ff472967d50469371aa0ee31f7892d4a6cecac39f89dd56a0f1'],
  ['src/app/v3/_secciones/hero/Hero.tsx', '81039bd0dcfe2b6a3b67f729f936d576fa7facbf830bb59d6713b21c1506ad8f'],
  ['src/app/v3/_secciones/hero/geometria.ts', '63a43b32f1ed4ed32c7305656a926265059c6c6a4a856351e8e09f9a5e6d2386'],
  ['src/app/v3/_secciones/hero/soporte.ts', '1d710f4c4f5f87dd78a382dd3446fce5644d8cfd0b8414a9676c3c54b919aeb3'],
  ['src/app/v3/_secciones/hero/hero.invariant.tsx', 'a8536647f363c48af1af6925e0884fbb3206c24b50190496ddbd2c4f388b5753'],
  ['src/app/v3/_lib/__tests__/s3-banda-consecuencias.ts', 'd9040076b056a39cf2903b43199d336529e8bdcd9a87fec028cdb3e386fbb7b0'],
  ['src/app/v3/_lib/__tests__/padron-de-tokens.ts', 'd24d992d262b2f9576d8cac55f2d2c21e1ca95eabeef3dabc4076b51a42c9a5c'],
  ['src/app/v3/_lib/__tests__/tokens.invariant.ts', 'c56f1e8f34389015d3f4b6b2140dbdaac36f6864c5e8b2ad054f565b09d04110'],
]

/**
 * ── QUÉ HAY ADENTRO DE LOS 589 BYTES: el inventario, DERIVADO y no medido ──
 *
 * ⚠️ **El reparto por pieza NO está medido, y se declara como tal**, igual que
 * en el titular, en TEXTO-2 y en TEXTO-3. El total son 589 B medidos A/B; esto
 * es la lista de lo que cambió y viaja, leída del diff. Cerrarla costaría un
 * build por pieza.
 *
 * ⚠️ **Es la CUARTA línea más grande del tablero —detrás de B12 (1,36), B4-A
 * (1,25) y el titular (0,70)— y hay que decir por qué.** No es un mecanismo nuevo como el de TEXTO-3: son
 * seis decisiones de composición que dejan **seis cadenas de clase y ocho
 * claves de geometría** adentro de un objeto que viaja entero. La más cara de
 * todas es una sola línea de texto —la clase que colapsa la columna lateral—
 * que mide 78 caracteres porque nombra un token y una plantilla de grilla.
 *
 * ⚠️ **Lo que se podría haber achicado y NO se achicó, con su número**: tres de
 * las ocho claves nuevas de `GEOMETRIA` las lee sólo el invariante
 * —`renglonesDelTitularEnEscritorio`, `envoltoriosDelTitular` y
 * `escalonDeLaSangriaDelCta`— y sacarlas del objeto que viaja ahorraría unos
 * **84 B**, el 14 % de la línea. No se hizo porque volverlas literales escritos
 * a mano adentro del invariante es exactamente el defecto que
 * `padron-de-tokens.ts` documenta: *«un instrumento que afirma una cardinalidad
 * escrita a mano se rompe cada vez que el sistema crece legítimamente, y entrena
 * a que se lo actualice sin pensar»*. Se paga la diferencia y se dice.
 *
 * ⚠️ **El token nuevo NO está en esta cuenta, y no es un olvido.**
 * `--text-display-xl-angosto` y su regla `.max-angosto\:text-display-xl-angosto`
 * son CSS, y este techo mide **sólo los `<script src>` de la ruta**.
 */
export const INVENTARIO_DE_COMPO1: readonly (readonly [string, string])[] = [
  ['geometria.ts', 'ocho claves nuevas en `GEOMETRIA`, cuatro de ellas cadenas de clase; la más larga es `claseDeLaColumnaLateral` (78 caracteres)'],
  ['geometria.ts', '`TIPOGRAFIA_DEL_REGISTRO_2` gana la clase acotada de la banda angosta: +36 caracteres'],
  ['Hero.tsx', 'tres `<span>` de más en el marcado —el envoltorio del registro 1 y las dos filas de la bajada— y dos `cn()` nuevos'],
  ['contenido.ts', 'el titular pasa de dos cadenas a tres y la bajada de una a dos: cinco claves donde había tres'],
  ['src/lib/utils.ts', 'la clase `text-display-xl-angosto` en la lista de tamaños de `cn()`, que `test:s7-cn` §1 exige'],
  ['geometria.ts', '⚠ los 16 B de `escritorio:mb-0`, la segunda mitad del par del aire del pie: sin ella el margen llegaba a 1440 y a 1920 y los corría 8,8 px'],
]

// ════════════════════════════════════════════════════════════════════════════
// LA PROPUESTA — el centésimo de arriba NO alcanza, y vuelve la regla del aire.
// ════════════════════════════════════════════════════════════════════════════

/**
 * **`MONTAJE_DE_COMPO1_KIB = 0,57`.**
 *
 * La convención del repo son los bytes medidos al centésimo de arriba: 589,0 /
 * 1024 = 0,5752 → 0,58 KiB. Pero 0,58 KiB son 593,92 B y dejan **4,9 B de
 * aire**, o sea **3,1 B DEBAJO** del umbral de `AIRE_MINIMO_UTIL_BYTES` (8 B):
 * un aire de cinco décimas no es aire, es el redondeo. Así que se aplica la
 * regla del aire útil —la misma que estrenó TAPADO-1 y que TEXTO-2 usó— y la
 * línea sube un centésimo: **0,59 KiB**, que son 604,16 B y dejan **15,2 B**.
 *
 * ⚠️ **El techo de 60 NO se mueve.** Es una línea con nombre que se le SUMA, y
 * es revocable sola: revocarla es deshacer los seis cambios de composición que
 * viajan —el titular vuelve a dos filas, la bajada a una y a 15 px, el CTA a su
 * sangría de 8 px, la columna lateral a colapsar en 768 y el pie a 8 px de
 * aire—, o sea volver exactamente a la pantalla que el dueño miró y pidió
 * cambiar.
 */
export const PROPUESTA_DE_COMPO1_KIB = 0.59

/** El aire que deja esta línea, en bytes. Misma forma que las cuatro anteriores. */
export const aireDeCompo1 = (kib: number): number => kib * 1024 - DESVIO_DE_COMPO1_BYTES

/** El aire de la línea propuesta, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_DE_COMPO1_BYTES = aireDeCompo1(PROPUESTA_DE_COMPO1_KIB)

/**
 * El centésimo de la CONVENCIÓN, 0,58. Su único uso es ser la entrada
 * equivocada del control positivo: con él el aire queda en 4,9 B, debajo del
 * umbral. Un control que se alimentara de la constante de verdad no probaría
 * nada.
 */
export const CENTESIMO_DE_LA_CONVENCION_DE_COMPO1_KIB = 0.58

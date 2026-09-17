/**
 * EL RECIBO DE DESLIZAR-1 — el deslizamiento del CTA del hero, byte por byte.
 *
 * Es el décimo recibo del techo, y el que menos bytes trae. El hallazgo de peso
 * del bloque es que **el código del sprint cae del lado DIFERIDO de la compuerta
 * de 1025**, así que casi todo el desvío es una línea de `import` de una hoja de
 * estilos. Conviene decir cómo, y también decir los 9 B que no cerraron.
 *
 * ── ⚠️ EL HALLAZGO: EL CÓDIGO DEL SPRINT CUESTA CERO EN LA CARGA INICIAL ──
 *
 * `s5-peso` mide los chunks que `/v3` pide en su HTML prerenderizado, o sea la
 * CARGA INICIAL. El deslizamiento vive adentro de `ScrollSuaveDeV3`, que es el
 * módulo que `CompuertaDelScrollSuave` pide con `dynamic(…, { ssr: false })`, así
 * que sus dos archivos —el módulo de datos y el hook del efecto— viajan en un
 * chunk ASÍNCRONO que la carga inicial no nombra.
 *
 * Medido sobre el build de este sprint: ese chunk es `437.*.js`, pesa **4.151 B**
 * crudos, contiene el `data-v3-deslizando` y el selector del CTA, y **no aparece
 * en los 26 `<script src>` de `/v3`**. Cero de sus bytes entran al techo.
 *
 * Eso no es una excusa y se declara con su otra cara: **los 4.151 B los descarga
 * cualquiera que cruce el umbral de 1025 sin `prefers-reduced-motion`**, sólo
 * que después del primer pintado. El techo mide la carga inicial; esto es carga
 * diferida, y sumarlo dejaría al gate sin capacidad de fallar. Es el mismo
 * criterio con el que `MOVIL-1` publicó sus 259,8 KiB aparte.
 *
 * ── EL A/B, con la única variable que quedó ──────────────────────────────────
 *
 * Los dos extremos son dos builds de producción del MISMO árbol, en la misma
 * máquina, los dos con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`, con `s5-peso` leyendo el
 * lane en el medio. El desvío es +68,0 B, y **el reparto por chunk lo acorrala en
 * UN solo chunk, aunque no lo reparta**:
 *
 *     chunk                              antes      después   delta
 *     ───────────────────────────────────────────────────────────────
 *     app/v3/layout-*.js                 5.894      5.962      +68
 *     app/v3/page-*.js                  57.066     57.066        0
 *     los otros tres propios            10.924     10.924        0
 *
 * Todo el desvío está en el chunk del LAYOUT, y lo único que este sprint le
 * agregó al layout ES una línea: `import './_estilos/deslizamiento.css'`. De ahí
 * salió la predicción —«los 68 son la hoja»— y de ahí salió la corrección.
 *
 * ── ⚠️ Y SE MIDIÓ, en vez de dejarlo derivado — Y DIO OTRA COSA ─────────────
 *
 * Una tercera corrida, con la hoja DESCONECTADA del layout y todo lo demás
 * intacto —el respaldo con sha256 publicado abajo—, sobre un `distDir` propio
 * (`.next-deslizar`, agregado a `.gitignore` ANTES del build, por la lección del
 * `distDir` que envenena a Tailwind 4).
 *
 * **La predicción era 72.144,0 —el «antes» exacto— y dio 72.153,0.** O sea que
 * el reparto por chunk NO alcanzaba, y la tercera corrida sirvió justamente para
 * eso. El desvío se parte en dos:
 *
 *     +59,0 B   la registración de `_estilos/deslizamiento.css` (72.212 − 72.153)
 *     + 9,0 B   del lado del JS, en el MISMO chunk del layout (72.153 − 72.144)
 *     ───────
 *      68,0 B
 *
 * ── 🔴 Y LOS 9,0 B NO SE PUEDEN SEPARAR DEL RUIDO, Y SE DICE ────────────────
 *
 * Son **exactamente** el piso de ruido entre dos builds que COMPO-2 publicó, y
 * eso los deja sin resolver: pueden ser ruido, o pueden ser reales. Hay un
 * mecanismo plausible y no medido —el chunk asíncrono nuevo (`437.*.js`) tiene
 * que quedar registrado en el mapa de chunks que el chunk del layout lleva
 * adentro, y eso son bytes en el layout aunque el código viva afuera— pero
 * distinguirlo del ruido pide una cuarta corrida contra el mismo árbol de la
 * tercera, y no se corrió.
 *
 * **Se declara como una fila SIN ATRIBUIR de 9,0 B**, que es lo que es. Lo que el
 * reparto sí sostiene con holgura es la conclusión que importa: el grueso del
 * desvío (59 de 68, el 87 %) es **una línea de `import`**, y los dos archivos de
 * producto del sprint no aparecen en la carga inicial ni con el chunk medido
 * aparte.
 */

/** El desvío MEDIDO entre los dos builds, en bytes. */
export const DESVIO_DE_DESLIZAR_BYTES = 68.0

/** Los dos extremos del A/B, con el mismo instrumento y la misma cuenta. */
export const ESCRITO_ANTES_DE_DESLIZAR_BYTES = 72_144.0
export const ESCRITO_DESPUES_DE_DESLIZAR_BYTES = 72_212.0

/**
 * LA TERCERA CORRIDA: el mismo árbol con la hoja desconectada del layout.
 *
 * ⚠ No pegó con el «antes», y eso es el hallazgo: quedan 9,0 B del lado del JS
 * que no se pueden separar del piso de ruido. Ver el docblock de arriba.
 */
export const ESCRITO_SIN_LA_HOJA_BYTES = 72_153.0

/** Lo que cuesta la registración de la hoja, DESPEJADO de la tercera corrida. */
export const COSTO_DE_LA_HOJA_BYTES = ESCRITO_DESPUES_DE_DESLIZAR_BYTES - ESCRITO_SIN_LA_HOJA_BYTES

/** Y lo que queda del otro lado, que es lo que no se puede separar del ruido. */
export const RESTO_DEL_LADO_DEL_JS_BYTES = ESCRITO_SIN_LA_HOJA_BYTES - ESCRITO_ANTES_DE_DESLIZAR_BYTES

/** El sha256 de `v3/layout.tsx` restaurado después de la tercera corrida. */
export const SHA256_DEL_LAYOUT_RESTAURADO =
  '4f60db6a281c9335ced7c2bfca6a7e71b316cdbcac83a0d679bfc2fa994d8138'

/**
 * ⚠️ **EL PISO DE RUIDO ENTRE DOS BUILDS DEL MISMO ÁRBOL: 9,0 B.**
 *
 * No se re-midió: es el que COMPO-2 publicó sobre este mismo árbol y con este
 * mismo instrumento, y re-medirlo cuesta dos builds para reproducir un número
 * que no cambió de causa. Se consume, se cita y se dice que es heredado.
 *
 * Lo que sí se verificó es que el «antes» de este A/B reproduce el «después» de
 * COMPO-2: **72.144,0 contra 72.146,0 publicados, o sea 2,0 B de diferencia**,
 * dentro del piso de ruido y sin una causa atribuible en el medio (ORDEN-2, el
 * commit que va entre los dos, reparte commits y no toca producto). Queda dicho
 * en vez de redondeado: la convención pide reproducir «al décimo de byte» y esto
 * reproduce al byte, no al décimo.
 */
export const RUIDO_ENTRE_BUILDS_BYTES = 9.0

/** Lo que COMPO-2 publicó como su «después», para poder restarlo a la vista. */
export const CIERRE_PUBLICADO_DE_COMPO2_BYTES = 72_146.0

/**
 * EL INVENTARIO — **MEDIDO con tres builds**, no derivado del código. Las dos
 * primeras filas salen de una resta entre corridas; las tres del medio dicen
 * cero porque su chunk no está en la carga inicial; la última dice lo que no se
 * pudo separar.
 */
export const INVENTARIO_DE_DESLIZAR: readonly (readonly [string, string])[] = [
  ['+59 B', 'la registración de `_estilos/deslizamiento.css` en el chunk del LAYOUT: una línea de `import`, y el 87 % del desvío (72.212 − 72.153, MEDIDO)'],
  ['0 B', '`_componentes/deslizamiento.ts` — los datos y la compuerta del intro: viajan en el chunk diferido `437.*.js`, que la carga inicial no nombra'],
  ['0 B', '`_componentes/useDeslizamientoDelCta.ts` — el escucha, el velo y las cinco salidas: el mismo chunk diferido'],
  ['0 B', '`ScrollSuaveDeV3.tsx` — la `ref` y la llamada al hook: también diferido, es el módulo que la compuerta pide'],
  ['0 B', 'el CSS de la hoja: `s5-peso` cuenta `<script src>`, no hojas. Sus 2 reglas se publican aparte, abajo'],
  ['+9 B', '🔴 SIN ATRIBUIR — del lado del JS, en el mismo chunk del layout (72.153 − 72.144). Son EXACTAMENTE el piso de ruido, así que no se pueden separar de él. Candidato plausible y no medido: el mapa de chunks del layout tiene que registrar el chunk asíncrono nuevo'],
]

/**
 * EL PESO DE LA HOJA EN SÍ, publicado porque el techo no lo mira.
 *
 * Dos reglas, sin una propiedad de componente propia. Entra al CSS servido de
 * `/v3`, que `s3-peso` §2 pesa por separado y que este techo no cuenta. Se dice
 * para que nadie lo busque en los 68 B y crea que falta algo.
 */
export const REGLAS_DE_LA_HOJA = 2

/**
 * ⚠️ **LA REGLA DEL AIRE ÚTIL SE APLICA, Y ES LA CUARTA VEZ.**
 *
 * Al centésimo de arriba: 68,0 / 1024 = 0,0664 → **0,07**, que deja
 * 0,07 × 1024 − 68 = **3,68 B** de aire. Está por DEBAJO del umbral de 8 B, así
 * que la línea nace en el centésimo siguiente —**0,08**, con 13,92 B de aire—
 * como pide la regla que TAPADO-1 introdujo y que TEXTO-2, COMPO-1 y PAPEL-2 ya
 * usaron.
 *
 * ⚠️ Y conviene decir qué compra ese redondeo hacia arriba, porque no es
 * gratuito en la dirección obvia: la línea se le SUMA al techo propio (66,35 →
 * 66,43) pero también se le RESTA a la cifra que el 60 vigila. Declarar 0,08 por
 * 68 B medidos **agranda** el margen contra el 60, de 99,2 B a 113,1 B. El techo
 * de 60 no se movió, y esta línea se puede revocar sola.
 */
export const PROPUESTA_DE_DESLIZAR_KIB = 0.08

/** El aire que deja esta línea, en bytes. Misma forma que las nueve anteriores. */
export const aireDeDeslizar = (kib: number): number => kib * 1024 - DESVIO_DE_DESLIZAR_BYTES

/** El aire de la línea propuesta, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_DE_DESLIZAR_BYTES = aireDeDeslizar(PROPUESTA_DE_DESLIZAR_KIB)

/**
 * El centésimo de ABAJO, 0,07. Su único uso es ser la entrada equivocada del
 * control positivo: con él la línea deja 3,68 B de aire, **abajo del umbral de
 * 8**, que es exactamente la condición que la regla del aire útil existe para
 * detectar. Un control que se alimentara de la constante de verdad no probaría
 * nada.
 */
export const CENTESIMO_DE_ABAJO_DE_DESLIZAR_KIB = 0.07

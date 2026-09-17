/**
 * EL RECIBO DE COMPO-2 — los 186 bytes que cuestan cinco ajustes de composición
 * y una regla global, medidos y declarados **en el mismo acto**.
 *
 * ── Qué compró ───────────────────────────────────────────────────────────
 *
 * Seis pedidos del dueño mirando el sitio, todos de composición y ninguno de
 * escena. Los que dejan bytes en la carga inicial son cinco:
 *
 *   0. la bajada en UN renglón en los ocho anchos — **y esta línea DEVUELVE
 *      bytes**: se van dos `<span>`, el separador de texto entre ellos y el
 *      envoltorio que conmutaba;
 *   1. la marca del Hero ×2,63 y el bloque CENTRADO en la banda de papel, con
 *      el aire de arriba igualado al del pie y la celda lateral apagada;
 *   3. el registro 1 del titular a 67 px en 768 y a 95 en 1024, con su mitad de
 *      apagado en escritorio;
 *   3b. el renglón que la regla global le sacó al bloque, devuelto como margen
 *      en la banda 768–859;
 *   2b/3a. la pastilla apagada hasta 860 — **cuesta 0 B**: la clase cambia de
 *      `max-chico:hidden` a `max-medio:hidden`, que mide lo mismo, y
 *      `ChromeDelHome` es un componente de SERVIDOR.
 *
 * ── EL MÉTODO, y el control que hace que la resta signifique algo ─────────
 *
 * `scripts-compo2/c-antes.mjs` + `scripts-papel/c-peso.mjs`. Este sprint abre
 * sobre el árbol de **PAPEL-2**, que sigue sin commitear —y arriba de COMPO-1,
 * MOVIL-1, TEXTO-2 y TEXTO-3, que tampoco—, así que devolver a `HEAD` habría
 * medido seis sprints juntos. El «antes» se RECONSTRUYE quitando de cada
 * archivo exactamente lo que este sprint le puso, con un `assert` por quite.
 *
 * **El control: el «antes» reconstruido da 71.960,0 B, que es EXACTAMENTE el
 * número que PAPEL-2 dejó publicado en su §10** — y lo da en un `distDir`
 * distinto del suyo, o sea que la reconstrucción es fiel y el directorio de
 * build no mueve la cifra. Sin ese control la resta sería una cuenta entre dos
 * builds que nadie ató a nada.
 *
 * ⚠️ **LO QUE EL «ANTES» *NO* RECONSTRUYE, Y POR QUÉ ALCANZA.** No devuelve los
 * docblocks —que son la mayor parte del diff de este sprint— porque el
 * minificador los borra y no pesan un byte; y saca del `tsconfig` los archivos
 * de INSTRUMENTO, que hablan de una API que el «antes» no tiene. Ninguna línea
 * de la aplicación los importa, así que no están en el grafo del build.
 *
 * ⚠️ **Y ACÁ SE ESTRENA UN DATO QUE EL REPO TENÍA AL REVÉS: `next build` SÍ
 * CORRE EL TYPECHECK** en esta versión (Next 16.2.9). La nota del repo decía que
 * lo ignoraba. Se descubrió porque el primer intento del «antes» falló con
 * `Failed to type check` sobre `scripts-compo2/b-derivacion.ts`.
 */

/** El desvío MEDIDO entre los dos builds, en bytes. */
export const DESVIO_DE_COMPO2_BYTES = 186.0

/** Los dos extremos del A/B, con el mismo instrumento y la misma cuenta. */
export const ESCRITO_ANTES_DE_COMPO2_BYTES = 71_960.0
export const ESCRITO_DESPUES_DE_COMPO2_BYTES = 72_146.0

/**
 * ⚠️ **EL PISO DE RUIDO ENTRE DOS BUILDS DEL MISMO ÁRBOL, MEDIDO: 9,0 B.**
 *
 * El árbol de cierre se construyó DOS veces —una en `.next-compo2` y otra en
 * `.next`, con el mismo comando y el mismo contenido— y dio **72.155,0 y
 * 72.146,0 B**. El «antes», en cambio, dio 71.960,0 en sus dos builds. O sea que
 * hay un ruido de hasta 9 B que no es del sprint y que se declara en vez de
 * apropiarse: la línea se calcula con el par que el GATE lee (`.next`), y el
 * otro par queda publicado acá.
 */
export const RUIDO_ENTRE_BUILDS_BYTES = 9.0

/**
 * EL INVENTARIO, **DERIVADO Y NO MEDIDO PIEZA POR PIEZA** — y se dice.
 *
 * Los ocho renglones salen de comparar las cadenas literales que el chunk de
 * `/v3` tiene en el «después» y no en el «antes» (y al revés), contando bytes
 * sobre el propio archivo construido. No es una atribución medida con un build
 * por pieza: para eso haría falta un build por renglón, y este sprint corrió
 * tres. **La suma da 171 B contra los 186 medidos: los 15 B de diferencia
 * quedan SIN atribuir**, y se publican en vez de repartirse.
 *
 * ⚠ Las claves del objeto `GEOMETRIA` **no pesan**: el bundler lo inlinea y en
 * el chunk sólo quedan las cadenas de clase. Por eso el inventario habla de
 * clases y de marcado, y no de propiedades.
 */
export const INVENTARIO_DE_COMPO2: readonly (readonly [string, string])[] = [
  ['+63 B', 'el registro 1 en la banda portatil, con sus DOS mitades: `tablet:text-display-r1-portatil escritorio:text-fluido-display`'],
  ['+56 B', 'el renglon devuelto al pie en 768-859: `tablet:mb-[calc(var(--text-base)*var(--leading-texto))]`'],
  ['+44 B', 'las dos clases del §1 en la pantalla del Hero: `max-chico:pt-2` y `max-chico:justify-center`'],
  ['+35 B', 'la palabra `develOP` pasa de `text-fluido-caption` al `calc()` con el factor'],
  ['+27 B', 'la celda lateral vacia, apagada en la banda de papel: `className="max-chico:hidden"` sobre un `<div>` que no tenia ninguno'],
  ['+16 B', 'el factor de la marca en las dos variantes del isotipo: `*2.63219` dos veces'],
  ['-70 B', 'LA REGLA GLOBAL DEVUELVE: se van dos `<span>`, el separador de texto entre ellos y el `className` del envoltorio de la bajada'],
  ['+15 B', 'SIN ATRIBUIR — la suma de los siete de arriba da 171 y lo medido son 186'],
]

/**
 * ⚠️ **LO QUE SE PODRÍA HABER AHORRADO, DICHO CON EL NÚMERO.** Las cinco cadenas
 * de clase nuevas suman 205 B y **ninguna se puede acortar sin perder lo que
 * dice**: son literales que Tailwind tiene que ver enteros en el fuente (una
 * clase armada por concatenación no la ve nadie y su regla no se emite nunca).
 * La única palanca real es la misma que PAPEL-2 dejó escrita: **`Hero.tsx`
 * lleva `'use client'`, así que todo esto viaja en el chunk de cliente; montado
 * desde un componente de SERVIDOR costaría 0 B de JS**. No se hizo porque pasar
 * el Hero por el contrato de secciones es cambiarle la forma a las ocho.
 *
 * ⚠ El token `--text-display-r1-portatil` y sus reglas NO están en esta cuenta:
 * son CSS, y este techo mide sólo los `<script src>` de la ruta.
 *
 * Al centésimo de arriba: 186,0 / 1024 = 0,1816 → **0,19**, que deja **8,6 B**
 * de aire, por encima del umbral de 8. **No hace falta la regla del aire útil**
 * —la que estrenó TAPADO-1— por primera vez en cinco líneas seguidas.
 *
 * ⚠️ **El techo de 60 NO se mueve.** Revocarla entera es volver a la pantalla
 * que el dueño pidió cambiar. Lo que SÍ es revocable solo, y con su número: la
 * regla global **devuelve** 70 B, así que deshacerla no ahorra — cuesta.
 */
export const PROPUESTA_DE_COMPO2_KIB = 0.19

/** El aire que deja esta línea, en bytes. Misma forma que las cinco anteriores. */
export const aireDeCompo2 = (kib: number): number => kib * 1024 - DESVIO_DE_COMPO2_BYTES

/** El aire de la línea propuesta, para poder compararlo con el umbral. */
export const AIRE_DE_LA_PROPUESTA_DE_COMPO2_BYTES = aireDeCompo2(PROPUESTA_DE_COMPO2_KIB)

/**
 * El centésimo de ABAJO, 0,18. Su único uso es ser la entrada equivocada del
 * control positivo: con él la línea da 184,3 B y **no alcanza a cubrir los 186
 * medidos**, o sea aire NEGATIVO. Un control que se alimentara de la constante
 * de verdad no probaría nada.
 */
export const CENTESIMO_DE_ABAJO_DE_COMPO2_KIB = 0.18

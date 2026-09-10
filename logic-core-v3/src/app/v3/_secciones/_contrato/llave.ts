/**
 * ⚠️ LA LLAVE DEL CONTENIDO INVENTADO — una constante, sola, en su módulo.
 *
 * ── Qué es esto, y por qué hace falta ─────────────────────────────────────
 *
 * develOP tiene **deuda registrada por cifras fabricadas**: sus cuatro landings
 * vivas llevan `+340% en consultas`, `86% más económico`, `2+ años en el
 * mercado` y `Respondemos en menos de 2hs`, que nadie midió y que están
 * publicadas. Este lane se escribió para no repetirla: el contenido no llevaba
 * un solo dígito y lo que falta se declara con un marcador a la vista
 * —`[CIFRA]`, `[MÉTRICA]`, `[TESTIMONIO]`— que nadie puede confundir con un
 * dato.
 *
 * **B12 §4 mete cifras falsas a propósito**, porque el dueño del proyecto pidió
 * ver el sitio poblado antes de que exista el contenido real. El pedido es
 * legítimo. Lo que no puede pasar es que esas cifras se publiquen.
 *
 * La asimetría que gobierna este archivo es la de siempre: **un marcador se
 * nota; una cifra falsa se lee igual que una verdadera.** Así que lo inventado
 * no se saca acordándose: se apaga.
 *
 * ── Las cuatro propiedades, y dónde vive cada una ─────────────────────────
 *
 *   1. **Una constante en su módulo propio.** Es este archivo y no tiene nada
 *      más adentro. Apagar todo el contenido inventado del sitio es cambiar
 *      `true` por `false` en la última línea.
 *   2. **Todo lo inventado, detrás de ella.** La lista cerrada vive en
 *      `inventado.ts` y ninguna sección escribe una mentira: escribe
 *      `conLlave(INVENTOS.x)`. Con la llave apagada esa llamada devuelve el
 *      texto con su marcador — el mismo que había antes de §4, carácter por
 *      carácter.
 *   3. **Una marca visible mientras esté prendida.** `MarcaDeLaLlave.tsx`, que
 *      el layout monta afuera del `<main>` y que devuelve `null` con la llave
 *      apagada.
 *   4. **Y el build de producción FALLA con ella prendida.**
 *      `scripts/llave-contenido-inventado.mjs`, enganchado como `prebuild`:
 *      `npm run build` lo corre solo, y el deploy también, porque el comando
 *      que `netlify.toml` declara termina en `npm run build`. **Acordarse no es
 *      un mecanismo.**
 *
 * ── ⚠️ Por qué es un LITERAL y no una variable de entorno ─────────────────
 *
 * Se pensó y se descartó, con dos razones, y las dos son del sistema:
 *
 *   · **Hidratación.** Un `process.env.X` que no empiece con `NEXT_PUBLIC_`
 *     llega al cliente como `undefined` mientras el servidor lee el valor de
 *     verdad. Apagada por entorno, el servidor pintaría los marcadores y el
 *     cliente las cifras: desajuste de hidratación en la sección de Números.
 *   · **Y una llave de ambiente no se lee en el diff.** Que esto esté prendido
 *     o apagado tiene que quedar escrito en el árbol, con su commit, no en la
 *     consola de alguien.
 *
 * ── ⚠️ Qué NO hace esta llave ─────────────────────────────────────────────
 *
 * **No afloja el escáner.** Los detectores de `escaneo.ts` y de `marcadores.ts`
 * siguen corriendo con su condición intacta; lo único que cambia es que el
 * texto se escanea con las mentiras DEVUELTAS a su marcador, o sea **el sitio
 * tal como queda cuando la llave se apaga**. Una cifra escrita a mano en un
 * `contenido.ts`, sin pasar por la lista cerrada, la sigue viendo el escáner y
 * pone el invariante en rojo. Afirmado en `s21-llave`, con control positivo.
 *
 * **Y no mueve el techo de peso.** Lo que el contenido inventado agrega se
 * declara aparte, como PESO DE LA LLAVE, en `s5-presupuesto.ts`: no es montaje
 * del lane y el techo no subió por él.
 */

/**
 * ⚠️ **PRENDIDA. El sitio muestra cifras, métricas y un testimonio INVENTADOS.**
 *
 * Apagarla —`false`— devuelve los marcadores en las ocho secciones y hace que
 * `npm run build` vuelva a pasar. No hay nada más que borrar: la lista de
 * `inventado.ts` queda escrita, con lo que dice cada casilla y a qué marcador
 * vuelve, para que el día del contenido real se lea al lado de lo que llegue.
 *
 * ⚠ El tipo está ANOTADO `boolean` y no inferido, y no es cosmético: con el
 * literal `true`, TypeScript estrecha cada `CONTENIDO_INVENTADO ? a : b` a una
 * sola rama y el invariante que comprueba **las dos** no compilaría.
 */
export const CONTENIDO_INVENTADO: boolean = true

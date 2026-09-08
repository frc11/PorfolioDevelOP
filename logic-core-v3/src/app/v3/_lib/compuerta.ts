/**
 * LA COMPUERTA DE 1025 — los datos, sin React.
 *
 * Vive aparte del componente por una razón práctica: los invariantes la
 * importan y la verifican sin montar nada ni tocar el DOM. Un número que solo
 * existe adentro de un JSX no se puede afirmar.
 *
 * ── Qué es la compuerta ────────────────────────────────────────────────────
 *
 * NO es una clase de CSS que esconde el escenario abajo del umbral: **el
 * bundle no se importa**. El componente que la implementa
 * (`_componentes/EscenarioCompuerta.tsx`) devuelve `null` abajo de 1025 y el
 * `import()` perezoso nunca se ejecuta, así que el navegador no pide el chunk.
 *
 * Se verifica sobre la SALIDA DEL BUILD, nunca mirando la página: un chunk que
 * no se descarga no se prueba a ojo. El instrumento es
 * `__tests__/bundle.invariant.ts`, y tiene control positivo — la ruta gemela
 * `/v3/control-estatico` importa el mismo módulo de forma estática y la
 * comprobación TIENE que encontrarlo ahí. Sin ese control, el check pasa en
 * verde aunque el escenario no exista todavía, que es exactamente el caso hoy.
 *
 * ── Por ancho, no por táctil ───────────────────────────────────────────────
 *
 * Está medido en la referencia: la compuerta responde al ancho del viewport.
 * No a `(hover: none)`, no a `(pointer: coarse)`, no al user-agent. Un
 * escritorio con pantalla táctil queda ARRIBA del umbral, y una tablet ancha
 * también. Es deliberado.
 *
 * ── Qué cruza el umbral y qué no ───────────────────────────────────────────
 *
 * Abajo de 1025: sin canvas y sin coreografía. **Lo que cruza es el MECANISMO,
 * no el pin.** `position: sticky` es CSS y no depende de JavaScript, así que
 * abajo del umbral sigue existiendo y sigue funcionando sin bajar un byte de
 * más. Lo que NO cruza es el efecto: de los dos pines del recorrido, mobile no
 * conserva ninguno.
 *
 * ⚠️ **Esto es una corrección, y hay que decir qué decía antes.** Hasta B7 este
 * párrafo afirmaba que «mobile conserva el ritmo del pinneado gratis». Está
 * refutado por medición: es cierto que el mecanismo cruza y es falso que el
 * ritmo se conserve.
 *
 * Medido el 2026-09-07 con `scripts-b7/f0-reproduccion.ts`
 * (`docs/rediseno/outputs/b7/f0-reproduccion.json`, claves `pines1024` y
 * `pines1920`), leyendo `position: sticky` computado y el **recorrido
 * disponible** de cada uno —el alto del padre menos el alto propio, que es
 * cuánto puede quedarse pegado antes de irse con el flujo—:
 *
 *   · **a 1024 hay 2 elementos `sticky` y ninguno es un pin del recorrido.**
 *     Uno es `header[data-pieza="navegacion"]`, el envoltorio de la pastilla:
 *     recorrido disponible 14.720,92 px pero **alto propio 0**, así que no pinea
 *     contenido, sostiene la pastilla. El otro es el envoltorio de `servicios`,
 *     con **recorrido disponible 0 por construcción** (su alto propio es el alto
 *     entero de su padre): declara `sticky` y no se pega nunca, a NINGÚN ancho.
 *
 *     ⚠️ **Eso RECLASIFICA una cifra heredada, y se dice.** `b-pines.json` de
 *     B4-B publica a 1024 `pinesQueAndan: 1`, contando ese `header` — que en su
 *     criterio anda, porque se queda pegado 221 paradas y 13.200 px. Las dos
 *     lecturas son ciertas sobre el mismo elemento y responden preguntas
 *     distintas: aquélla cuenta **elementos que se pegan**; ésta cuenta **pines
 *     del recorrido**, y un elemento de alto 0 no pinea contenido — no hay nada
 *     adentro que quede quieto. La afirmación de este párrafo es la segunda, y
 *     la cifra de B4-B no se corrige: se acota.
 *   · **a 1920 hay 4** (B4-B había contado 3). Los dos que se suman son los dos
 *     pines de verdad, y los dos se pegan en **18 de las 154 paradas** del
 *     barrido grueso de 120 px: el envoltorio de `trabajos`, que es `sticky` sólo
 *     `desde-escritorio`, y el `sticky` propio de la coreografía de `servicios`.
 *
 *     ⚠️ **Los 2.040 px que este párrafo publicaba eran el paso grueso, no el
 *     rango.** 18 paradas de 120 px dan 2.040 entre la primera y la última, pero
 *     el recorrido real, con los dos bordes bisectados a 2 px, es **2.158 px**
 *     (`scripts-b7/b-pin.ts` → `b-pin.json`). Se corrige acá para que los dos
 *     archivos del árbol no publiquen dos números del mismo pin.
 *
 * O sea: los dos pines que dan el ritmo cuelgan del umbral —uno por su breakpoint
 * y el otro porque es de la coreografía—, y abajo de 1025 no queda ninguno.
 *
 * ⚠️ **Lo que sigue abierto, y NO se arregla acá.** Que `trabajos` pinee también
 * abajo de 1025 es un cambio de composición en `_secciones/trabajos/`, que en
 * B7 es zona prohibida (otra sesión trabaja ahí). Queda anotado como diferido:
 * este archivo describe la compuerta, no decide la composición.
 */

/**
 * 1025px exactos. Medido, no interpolado: es el ancho al que la referencia
 * conmuta, y es además `--breakpoint-escritorio` en `theme-develop.css`.
 * Las dos definiciones tienen que decir lo mismo y hay un invariante que lo
 * comprueba leyendo el CSS — si alguien mueve una y no la otra, falla.
 */
export const ESCENARIO_MIN_ANCHO_PX = 1025

/** La consulta que se le pasa a `matchMedia`. Una sola fuente. */
export const CONSULTA_ESCENARIO = `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px)`

/**
 * El snapshot de servidor de la compuerta: **siempre `false`**.
 *
 * En el servidor el ancho no existe, y ésta es la mitad de la respuesta a la
 * hidratación. React usa `getServerSnapshot` también durante el render de
 * HIDRATACIÓN, no solo en el SSR: el primer render de cliente devuelve `false`
 * igual que el HTML servido, y el valor real entra recién en el re-render
 * posterior. Cero mismatch, y sin leer `window` durante el render.
 *
 * Es función y no una constante para que el hook la pueda pasar por
 * referencia sin crear una nueva en cada render (`useSyncExternalStore`
 * compara identidades).
 */
export function snapshotServidor(): boolean {
  return false
}

/**
 * Las clases que sacan al escenario del flujo del documento.
 *
 * Están acá, en un dato exportado, y no sueltas en el JSX, porque son LA
 * razón por la que cruzar el umbral no puede producir un salto de layout:
 * `fixed` + `inset-0` significa que el escenario no ocupa espacio, así que
 * montarlo o desmontarlo no mueve un píxel de los paneles. Un invariante lo
 * afirma sobre esta constante.
 *
 * `pointer-events-none`: es ornamento y no puede comerse un click.
 * `z-0` contra el `z-10` de los paneles: el escenario queda ABAJO del flujo y
 * ARRIBA del piso de papel del envoltorio.
 */
export const CLASES_FUERA_DE_FLUJO = 'fixed inset-0 z-0 pointer-events-none'

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
 * Abajo de 1025: sin canvas y sin coreografía. **El `sticky` SÍ cruza**, y esa
 * es media razón para haberlo hecho con CSS: no depende de JavaScript, así que
 * mobile conserva el ritmo del pinneado gratis, sin bajar un byte de más.
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

'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_SCROLL_SUAVE, deberiaCorrerElScrollSuave } from '../_lib/scrollSuave'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'

/**
 * LAS DOS COMPUERTAS DEL SCROLL SUAVE — de MONTAJE, no de CSS.
 *
 * Es la tercera compuerta con la misma forma que las otras dos de /v3
 * (`EscenarioCompuerta` y `CursorCompuerta`), y que se lean igual no es
 * cosmética: las tres fuentes de movimiento de B5 cruzan el umbral juntas.
 *
 *   1. **Abajo de 1025 no se monta.** Devuelve `null` y el `import()` de abajo
 *      nunca se ejecuta: no se construye instancia y no corre un solo
 *      `requestAnimationFrame`. La referencia usa el scroll nativo ahí y es
 *      decisión tomada.
 *   2. **Con `prefers-reduced-motion` no se monta.** Un motor que interpola la
 *      posición del scroll ES movimiento, y es movimiento que nadie pidió. Es
 *      la misma corrección que S3 le hizo al cursor, aplicada a la pieza que
 *      B5 agrega.
 *
 * ── Por qué `ssr: false` no es opcional ───────────────────────────────────
 *
 * El ancho y la preferencia no existen en el servidor, así que el servidor no
 * puede decidir. Y con `ssr: false` webpack emite el módulo en un chunk
 * asíncrono aparte, que es lo que hace que la compuerta 1 signifique algo del
 * lado del build y no sólo del lado del runtime.
 *
 * ⚠️ **Lo que esa segunda mitad NO compra, declarado.** Los bytes de `lenis`
 * viajan igual en la carga inicial de toda ruta, porque el layout RAÍZ importa
 * `SmoothScroll` de forma estática — está medido y publicado como hallazgo de
 * peso con dueño ajeno. Lo que la compuerta decide es si se construye una
 * instancia; el peso neto de prenderla en /v3 es **cero**, y ése es justamente
 * el argumento: se pagaba el peso sin el beneficio.
 *
 * ── Por qué no hay discrepancia de hidratación ────────────────────────────
 *
 * Los dos hooks son `useSyncExternalStore` con snapshot de servidor, y React
 * usa ese snapshot también en el render de hidratación. El de ancho devuelve
 * `false` y el de preferencia devuelve `true`: los dos significan "no montes",
 * así que el primer render de cliente es idéntico al HTML servido y el valor
 * real entra recién en el re-render.
 *
 * ⚠ Los dos hooks se llaman ANTES de cualquier `return`. Con el `if` de ancho
 * arriba, el hook de preferencia quedaría condicionado y React lo reporta.
 *
 * ── Y por qué no hay salto de layout ──────────────────────────────────────
 *
 * Porque el módulo perezoso **no renderiza nada**: devuelve `null` y todo lo que
 * hace vive en un efecto. Montarlo o desmontarlo no puede mover una caja.
 */
const ScrollSuaveDeV3 = dynamic(() => import('./ScrollSuaveDeV3'), { ssr: false })

export function CompuertaDelScrollSuave() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_SCROLL_SUAVE)
  const prefiereMenosMovimiento = usePrefiereMenosMovimiento()

  // La decisión vive en `_lib/scrollSuave.ts`, como función pura, para que se
  // pueda afirmar sin montar React con un DOM.
  if (!deberiaCorrerElScrollSuave(arribaDelUmbral, prefiereMenosMovimiento)) return null

  return <ScrollSuaveDeV3 />
}

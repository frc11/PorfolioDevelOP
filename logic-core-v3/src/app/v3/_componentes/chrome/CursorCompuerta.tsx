'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_CURSOR, deberiaMontarseElCursor } from '../../_lib/cursor'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

/**
 * LAS DOS COMPUERTAS DEL CURSOR — de montaje, no de CSS.
 *
 * ── Qué hacen ─────────────────────────────────────────────────────────────
 *
 *   1. **Abajo de 1025 no se monta.** Está medido: a 390 el barrido devuelve
 *      0 candidatos y 0 elementos circulares montados — los dos `div` del
 *      cursor sencillamente no existen en el árbol. No es peso muerto que se
 *      esconde con CSS: es montaje condicional.
 *   2. **Con `prefers-reduced-motion` no se monta.** La interpolación hacia el
 *      puntero ES movimiento, y es movimiento que nadie pidió. La referencia
 *      no midió esto (`COMPONENTS.md`, hueco 4): es una corrección nuestra.
 *
 * Las dos devuelven `null`, y con `null` el `import()` de abajo nunca se
 * ejecuta: el navegador no pide el chunk. Es el mismo mecanismo que S1 usa
 * para el escenario, y se verifica igual — sobre la salida del build, no
 * mirando la página, porque un chunk que no se descarga no se prueba a ojo.
 *
 * ── Por qué `ssr: false` no es opcional ───────────────────────────────────
 *
 * Dos cosas a la vez. El ancho y la preferencia no existen en el servidor, así
 * que el servidor no puede decidir. Y con `ssr: false` webpack emite el módulo
 * en un chunk asíncrono aparte: con un import estático el cursor viajaría en
 * la carga inicial en TODOS los anchos y las dos compuertas serían decorativas.
 *
 * ── Por qué no hay discrepancia de hidratación ────────────────────────────
 *
 * Los dos hooks son `useSyncExternalStore` con snapshot de servidor, y React
 * usa ese snapshot también en el render de hidratación. El de ancho devuelve
 * `false` y el de preferencia devuelve `true`: los dos significan "no montes",
 * así que el primer render de cliente es idéntico al HTML servido —los dos sin
 * cursor— y el valor real entra recién en el re-render.
 *
 * ⚠ Los dos hooks se llaman ANTES de cualquier `return`. Con el `if` de ancho
 * arriba, el hook de preferencia quedaría condicionado y React lo reporta.
 */
const CursorPropio = dynamic(() => import('./CursorPropio'), { ssr: false })

export function CursorCompuerta() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_CURSOR)
  const prefiereMenosMovimiento = usePrefiereMenosMovimiento()

  // La decisión vive en `_lib/cursor.ts`, como función pura, para que se pueda
  // afirmar sin montar React con un DOM. Ver el comentario de esa función.
  if (!deberiaMontarseElCursor(arribaDelUmbral, prefiereMenosMovimiento)) return null

  return <CursorPropio />
}

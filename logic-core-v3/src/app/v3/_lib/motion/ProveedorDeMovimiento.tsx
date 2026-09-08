'use client'

import { MotionConfigContext } from 'motion/react'
import { useContext, useMemo, type ReactNode } from 'react'

import { usePrefiereMenosMovimiento } from '../usePrefiereMenosMovimiento'

/**
 * LA PREFERENCIA, PUESTA EN EL CONTEXTO QUE EL SISTEMA DE MOTION YA LEE.
 *
 * ── El defecto que este archivo arregla, medido ────────────────────────────
 *
 * B7 · Fase 0 (`docs/rediseno/outputs/b7/f0-reproduccion.json`), a 1920, con la
 * preferencia emulada por `Emulation.setEmulatedMedia` y verificada con
 * `matchMedia` DESDE la página:
 *
 *     sin la preferencia   2450 transformadas acumuladas · 5 piezas de línea
 *     con la preferencia   2450 transformadas acumuladas · 5 piezas de línea
 *
 * Idénticas. **El sitio ignoraba `prefers-reduced-motion`.** No es cosmético:
 * es accesibilidad, y era el defecto más grave del inventario.
 *
 * ── La causa, y por qué el arreglo va acá y no en el hook ──────────────────
 *
 * `_lib/motion/reducido.ts` lee `useReducedMotionConfig()`, que mira PRIMERO el
 * contexto de `MotionConfig` y sólo cae al media query si el contexto dice
 * `"user"`:
 *
 *     if (reducedMotion === "never")  return false        ← cortaba acá
 *     else if (reducedMotion === "always") return true
 *     else return reducedMotionPreference                 ← nunca se llegaba
 *
 * Y el valor por defecto de `MotionConfigContext` es, textual,
 * `reducedMotion: "never"` (`framer-motion/dist/es/context/MotionConfigContext.mjs`).
 * En todo `/v3` no había un solo `<MotionConfig>` fuera del arnés de
 * invariantes, así que el contexto devolvía siempre su default y el media query
 * nunca se consultaba. El hook no estaba roto: **le faltaba la entrada**.
 *
 * ── ⚠️ HABÍA DOS POLÍTICAS, Y LA QUE NO LLEGABA ERA LA DEL SISTEMA ─────────
 *
 * El repo YA tenía una política de movimiento reducido que FUNCIONA:
 * `_lib/usePrefiereMenosMovimiento.ts`, `useSyncExternalStore` sobre
 * `matchMedia('(prefers-reduced-motion: reduce)')`, con snapshot de servidor
 * `true` —la opción conservadora, argumentada en su propio docblock— y reactiva
 * a que la preferencia cambie con la ventana abierta. De ahí leen el cursor
 * (`_lib/cursor.ts`) y el scroll suave (`_lib/scrollSuave.ts`), que son dos de
 * las tres piezas que B5 verificó que SÍ honran la preferencia.
 *
 * O sea que la elección no era «una política o dos»: **ya eran dos**, la de
 * `MotionConfig` con default `"never"` y la de `usePrefiereMenosMovimiento`, y
 * la que no llegaba era la del sistema de motion. Este proveedor **no escribe
 * una tercera**: toma la que ya funciona y la traduce al vocabulario que el
 * sistema de motion sabe leer. Después de esto hay UNA fuente —el store de
 * `usePrefiereMenosMovimiento`— y tres lectores: el cursor, el scroll suave y
 * el sistema de motion.
 *
 * ── Por qué el `Provider` pelado y no `<MotionConfig>` ────────────────────
 *
 * `<MotionConfig>` hace tres cosas más que este componente y ninguna hace falta
 * acá: llama `loadExternalIsValidProp` (sólo si le pasás `isValidProp`),
 * `resolveTransition` de `motion-dom` (sólo importa si declarás una
 * `transition` por defecto, y no declaramos ninguna) y `useConstant` para clavar
 * `isStatic`. Traerlas costaría módulos de librería para heredarlos igual.
 * `MotionConfigContext` en cambio **ya está en el grafo de la carga inicial**:
 * lo importa `reducido.ts`, que el árbol quieto importa por su excepción de
 * política declarada. Medido en `scripts-b7/a-peso.ts`.
 *
 * ── Por qué NO `reducedMotion: 'user'`, que sería una línea menos ─────────
 *
 * Porque delegaría en `useReducedMotion()` de la librería, y esa es una CUARTA
 * lectura de la preferencia con tres propiedades peores, las tres leídas del
 * fuente instalado:
 *
 *   1. consulta `"(prefers-reduced-motion)"` —sin `: reduce`—, que es otra
 *      consulta que la del cursor y la del scroll suave. ⚠️ Medidas las dos en
 *      la misma página (`scripts-b7/a-reducido.ts`, bloque A4) **coincidieron**
 *      en los dos sentidos, así que ésta es una razón de higiene —dos consultas
 *      son dos cosas que se pueden desincronizar— y NO una divergencia medida;
 *   2. usa `useState(prefersReducedMotion.current)`: se captura UNA vez al
 *      montar y no vuelve a mirar. Cambiar la preferencia con la ventana
 *      abierta no hace nada;
 *   3. `prefersReducedMotion.current` arranca en `null` y en el servidor se
 *      queda ahí, o sea que el valor de servidor es «no reducido» — la
 *      dirección NO conservadora, justo la contraria a la que
 *      `usePrefiereMenosMovimiento` eligió con su argumento escrito.
 *
 * ── El forzado por contexto se conserva ENTERO ────────────────────────────
 *
 * Un `<MotionConfig>` anidado más adentro gana, porque es el mismo contexto de
 * React y el proveedor más cercano manda. `__tests__/reducido.invariant.tsx`
 * sigue pudiendo renderizar los DOS árboles —con y sin— y ahora además afirma
 * que ese forzado gana ADENTRO de la composición de producción (R9). Nada se
 * aflojó: se agregó la mitad que faltaba.
 *
 * ── Qué HTML sirve el servidor, y por qué no hay salto ni mismatch ────────
 *
 * `usePrefiereMenosMovimiento` es `useSyncExternalStore` con
 * `snapshotDeServidor = true`, y React usa ese snapshot también en el render de
 * HIDRATACIÓN. Así que el servidor sirve `reducedMotion: 'always'` y el primer
 * render de cliente sirve exactamente lo mismo: **el árbol quieto, idéntico al
 * HTML servido**. El valor real entra en el re-render posterior, igual que en
 * las otras dos compuertas. Y en el home no cambia una coma respecto de hoy,
 * porque `CompuertaDelHome` ya servía el árbol quieto por `useAnchoMinimo`,
 * que devuelve `false` en servidor y en hidratación.
 *
 * Este componente **no emite un solo elemento**: es un proveedor de contexto.
 * Montarlo o desmontarlo no puede mover una caja.
 */

/** El vocabulario de `MotionConfig`, acotado a los dos valores que decidimos. */
export type VocabularioDeMovimiento = 'always' | 'never'

/**
 * LA TRADUCCIÓN, COMO FUNCIÓN PURA — para que se pueda afirmar sin montar React.
 *
 * Es total y son dos valores, no tres: `'user'` queda deliberadamente afuera por
 * las tres razones de arriba. Que sea pura es lo que permite afirmar la política
 * sin que el instrumento tenga que inyectar la preferencia.
 */
export function vocabularioDeMovimiento(prefiereMenos: boolean): VocabularioDeMovimiento {
  return prefiereMenos ? 'always' : 'never'
}

export function ProveedorDeMovimiento({
  children,
}: {
  readonly children: ReactNode
}): React.JSX.Element {
  /**
   * Se hereda el contexto de arriba en vez de escribir uno nuevo: `isStatic` y
   * `transformPagePoint` tienen valores por defecto que el sistema usa, y un
   * proveedor que los pisara con `undefined` cambiaría comportamiento que este
   * archivo no tiene por qué tocar. Lo único que decide acá es `reducedMotion`.
   */
  const heredado = useContext(MotionConfigContext)
  const reducedMotion = vocabularioDeMovimiento(usePrefiereMenosMovimiento())

  // Un objeto nuevo por render re-renderizaría a todo consumidor del contexto.
  const valor = useMemo(() => ({ ...heredado, reducedMotion }), [heredado, reducedMotion])

  return <MotionConfigContext.Provider value={valor}>{children}</MotionConfigContext.Provider>
}

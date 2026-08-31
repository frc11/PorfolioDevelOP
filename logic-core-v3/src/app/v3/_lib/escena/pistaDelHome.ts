/**
 * LA PISTA DEL HOME — el track del recorrido definitivo, sin editor.
 *
 * ⚠️ **ESTO ES UN PROVISIONAL Y ESTÁ ACÁ PORQUE EL SPRINT FRENÓ.** Ver el
 * reporte de SITIO-S8: la decisión de fondo es del humano y son dos caminos.
 *
 * ── El problema, exacto ────────────────────────────────────────────────────
 *
 * `OrbitRig` lee **una sola cosa** del editor —`editor.track`, una vez por
 * frame, en el modo `coreografia`— pero su prop está tipada como `ChoreoEditor`
 * entero: quince miembros, catorce de los cuales son del panel de calibración
 * (seleccionar variante, mover un `at`, duplicar, borrar, resetear, avisarle a
 * la pantalla).
 *
 * Y `createChoreoEditor()` **carga las cinco variantes al construirse**, así que
 * consumirlo desde el home arrastra `choreographyVariants.ts`, los cuatro
 * `variant*.ts` y los tres `choreographyNotes*.ts`: **66,7 KiB de código y datos
 * vivos** —medido sin comentarios por `s8-escena.invariant.ts` §5— de los cuales
 * **61,3 KiB son variantes y notas**. Eso es material del panel: el home no
 * muestra ninguno de los otros cuatro recorridos y no puede cambiar de variante.
 *
 * ── Lo que se eligió mientras tanto ────────────────────────────────────────
 *
 * Servir el track de `CHOREO_KEYFRAMES` —el recorrido definitivo, el mismo que
 * el panel carga por default— construido con `buildTrack`, que es el mismo
 * constructor que usa el editor. **No hay una sola constante nueva y no hay una
 * segunda fuente del recorrido.**
 *
 * Los catorce miembros del panel **tiran**, y es deliberado: el home no tiene
 * editor de keyframes, así que pedirle uno es un error de programación y no un
 * estado. Un `no-op` silencioso o un array vacío serían la otra salida y son la
 * peor: dejarían pasar en silencio a un consumidor que cree estar editando.
 *
 * ⚠️ **El `import type` de `ChoreoEditor` apunta a `/probe-escena`, que tiene
 * fecha de baja.** Es type-only —se borra al compilar, cero bytes en el
 * bundle— pero significa que el día que la ruta se borre, `tsc` rompe acá y hay
 * que mover el tipo. Es el costo declarado de NO mudar el editor; el otro
 * camino lo cambia por 66,7 KiB en el chunk de la escena.
 *
 * ── Por qué el track es perezoso acá también ───────────────────────────────
 *
 * Mismo motivo que en `choreographyEditor.ts`: `buildTrack` **tira** si los
 * `at` no son estrictamente crecientes, y ese error tiene que caer adentro del
 * `useFrame` —donde lo contiene el boundary del canvas— y no en el render del
 * componente que crea la pista.
 */

import { CHOREO_KEYFRAMES } from './choreography'
import { buildTrack, type ChoreoTrack } from './choreographySampler'
import type { ChoreoEditor } from '@/app/probe-escena/_components/choreographyEditor'

function sinEditor(miembro: string): never {
  throw new Error(
    `EscenaDelHome no tiene editor de keyframes: se pidió "${miembro}". ` +
      'El recorrido del home es CHOREO_KEYFRAMES y se calibra en /probe-escena.',
  )
}

/**
 * La pista del home, con la forma que `ProbeStage` pide.
 *
 * Se llama una vez por montaje, igual que `createChoreoEditor()` en el panel.
 */
export function crearPistaDelHome(): ChoreoEditor {
  let track: ChoreoTrack | null = null

  return {
    get track() {
      if (track === null) track = buildTrack(CHOREO_KEYFRAMES)
      return track
    },

    // ── Lo que es del panel de calibración y el home no tiene ──────────────
    get variant() {
      return sinEditor('variant')
    },
    get variantId() {
      return sinEditor('variantId')
    },
    get keyframes() {
      return sinEditor('keyframes')
    },
    get version() {
      return sinEditor('version')
    },
    get dirty() {
      return sinEditor('dirty')
    },
    setVariant: () => sinEditor('setVariant'),
    isDirty: () => sinEditor('isDirty'),
    subscribe: () => sinEditor('subscribe'),
    find: () => sinEditor('find'),
    indexOf: () => sinEditor('indexOf'),
    setAt: () => sinEditor('setAt'),
    applyPose: () => sinEditor('applyPose'),
    duplicate: () => sinEditor('duplicate'),
    remove: () => sinEditor('remove'),
    reset: () => sinEditor('reset'),
  }
}

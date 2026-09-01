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
 * ⚠️ **EL ACOPLAMIENTO HACIA `/probe-escena` SE CERRÓ EN SITIO-S11 (§7.36).**
 *
 * Hasta SITIO-S10 el `import type` de `ChoreoEditor` de acá arriba apuntaba a
 * `@/app/probe-escena/_components/choreographyEditor`, y eran **tres** los
 * módulos de producción que lo hacían: éste, `OrbitRig.tsx` y `ProbeStage.tsx`.
 * El costo en bytes era cero —`import type` con `isolatedModules`, y un alias de
 * tipo no tiene valor en runtime— pero el otro costo no: **el día que
 * `/probe-escena` se borre, `tsc --noEmit` cortaba con TS2307 en los tres y `npm
 * run build` seguía en verde**, porque `next.config.ts` declara
 * `typescript.ignoreBuildErrors`. Un acoplamiento sin guardia en el build es un
 * acoplamiento que nadie ve hasta que duele.
 *
 * **Lo que se hizo:** los tres tipos —`ChoreoEditor`, `EditableKeyframe` y
 * `KeyframeOrigin`— se mudaron a `./choreographyEditorTypes.ts`, del lado de la
 * escena, y `choreographyEditor.ts` los **re-exporta**. Los tres imports de
 * producción apuntan al módulo nuevo y ningún consumidor del panel cambió una
 * línea. La flecha, que es lo único que importaba, ahora va del panel hacia
 * producción: borrar el panel no rompe la escena.
 *
 * ⚠️ **El costo REAL fue mayor que el que §7.36 publicaba, y queda anotado:**
 * decía *«1 archivo nuevo, 4 líneas de import y DOS instrumentos reescritos»*, y
 * los tipos que hubo que mudar eran **tres y no dos** — `KeyframeOrigin` es del
 * lado del panel y `EditableKeyframe` lo nombra, así que dejarlo allá habría
 * movido el acoplamiento en vez de cerrarlo. Los dos instrumentos reescritos son
 * `_lib/escena/__tests__/s8-escena.invariant.ts` §3 y
 * `_lib/__tests__/s9-instrumentos.invariant.ts` §2, que es el que lo MIDE.
 *
 * **Lo que NO cambió, y sigue siendo el provisional de arriba:** los catorce
 * miembros del panel siguen tirando, el home sigue sin editor, y la decisión
 * entre este provisional y mudar el editor entero —66,7 KiB en el chunk de la
 * escena— sigue siendo del humano. Lo que se cerró es el vínculo de TIPO, que
 * era la mitad barata.
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
import type { ChoreoEditor } from './choreographyEditorTypes'

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

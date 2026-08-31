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
 * ⚠️ **EL ACOPLAMIENTO QUE QUEDA, DECLARADO CON SU NÚMERO (SITIO-S9).**
 *
 * El `import type` de `ChoreoEditor` apunta a `/probe-escena`, que tiene fecha
 * de baja. Son **tres** los archivos del destino que lo hacen —éste,
 * `OrbitRig.tsx:28` y `ProbeStage.tsx:9`— y los tres importan **el mismo y único
 * tipo**. `s8-escena.invariant.ts` §3 los afirma nominalmente: ningún módulo de
 * la escena importa un VALOR del panel, y estos tres lo nombran sólo por el
 * tipo.
 *
 * **Cero bytes, verificado sobre el fuente y no de memoria.** Las tres líneas
 * empiezan con `import type`, que TypeScript borra por especificación; el
 * símbolo importado está declarado `export type ChoreoEditor = { … }`
 * (`choreographyEditor.ts:147`), o sea un alias que **no tiene valor en tiempo
 * de ejecución** ni siquiera si alguien lo importara mal; y en los tres archivos
 * el nombre aparece únicamente en posición de tipo (`editor: ChoreoEditor` y
 * `): ChoreoEditor`). Con `isolatedModules: true` en `tsconfig.json`, un
 * `import type` es la forma que el compilador tiene garantizado poder borrar sin
 * mirar el módulo del otro lado.
 *
 * ⚠️ **Y lo que pasa el día que `/probe-escena` se borre es peor que un error:
 * es un error que el build NO muestra.** `npx tsc --noEmit` corta con TS2307 en
 * los tres archivos (más un TS2304 por cada uso del nombre), pero
 * `next.config.ts` declara `typescript.ignoreBuildErrors: true`, así que
 * **`npm run build` sigue pasando en verde** y el bundle no cambia un byte. El
 * acoplamiento no tiene guardia en el build: la única que lo ve es la
 * verificación de tipos, que hay que correr aparte.
 *
 * **NO se resuelve acá, y no por falta de ganas.** Mover el tipo obliga a tocar
 * `s8-escena.invariant.ts` §3 —que otro frente está reescribiendo en este mismo
 * sprint— y a tocar `ProbeStage.tsx`, que está en **exactamente 300 líneas**, el
 * límite del repo. Es el caso de §7.26 con todas las letras: repartir archivos
 * no reparte un sprint cuando el TIPO de un dato compartido cruza la frontera.
 * El plan exacto —qué módulo definiría el tipo, qué tres imports cambian y qué
 * afirmación cambia de valor— está en el reporte de SITIO-S9; la decisión de
 * ejecutarlo es del agente principal.
 *
 * Es el costo declarado de NO mudar el editor; el otro camino lo cambia por
 * 66,7 KiB en el chunk de la escena.
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

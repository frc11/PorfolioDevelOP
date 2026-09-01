/**
 * EL CONTRATO DEL EDITOR DE COREOGRAFÍA — los tres tipos que la escena necesita
 * nombrar, del lado de la escena.
 *
 * ── QUÉ RESUELVE, y por qué es un archivo y no un import más (§7.36) ───────
 *
 * `pistaDelHome.ts`, `OrbitRig.tsx` y `ProbeStage.tsx` son módulos de
 * PRODUCCIÓN —viajan en el bundle de `/v3`— y hasta SITIO-S10 los tres escribían
 * `import type { ChoreoEditor } from '@/app/probe-escena/_components/choreographyEditor'`,
 * o sea que el destino de la mudanza de SITIO-S8 seguía nombrando al panel de
 * calibración, que tiene fecha de vencimiento.
 *
 * **El costo en bytes era cero** y estaba verificado por cuatro caminos —las
 * tres líneas eran `import type`, el símbolo era un `export type`, ninguno lo
 * usaba en posición de valor, y `tsconfig.json` declara `isolatedModules`—. Lo
 * que NO era cero es el otro costo, y es el que decidió el arreglo: **el día que
 * `/probe-escena` se borre, `tsc --noEmit` corta con TS2307 en los tres, y `npm
 * run build` sigue en verde** porque `next.config.ts` declara
 * `typescript.ignoreBuildErrors`. Un acoplamiento sin guardia en el build es un
 * acoplamiento que se descubre en runtime o no se descubre.
 *
 * ── LA DIRECCIÓN, que es lo único que cambió ──────────────────────────────
 *
 * Los tipos viven acá, del lado de la escena, y `choreographyEditor.ts` los
 * **re-exporta**: ningún consumidor del panel cambió una línea, y la flecha que
 * antes iba de producción hacia el panel ahora va del panel hacia producción,
 * que es la única dirección en la que borrar el panel no rompe nada.
 *
 * ── POR QUÉ ACÁ Y NO EN `choreographyTypes.ts` ────────────────────────────
 *
 * Porque ese archivo mide 240 líneas y con estos tres tipos pasaría de las 300
 * del repo. Pero además son otra cosa: `choreographyTypes.ts` describe **la
 * coreografía** —canales, poses, keyframes, variantes—, o sea el dato que la
 * escena lee; esto describe **la sesión de edición** de ese dato, que es una
 * pieza del panel aunque su tipo tenga que vivir de este lado.
 */

import type { ChoreoTrack } from './choreographySampler'
import type {
  ChoreoChannel,
  ChoreoEase,
  ChoreoTurn,
  ChoreoVariant,
  ChoreoVariantId,
  MutableChoreoPose,
} from './choreographyTypes'

/** De dónde salió el keyframe. Los del archivo no se pueden borrar. */
export type KeyframeOrigin = 'archivo' | 'editor'

/** Un keyframe de la sesión de trabajo: el del archivo más lo que lo hace editable. */
export type EditableKeyframe = {
  /** Identidad estable. La selección apunta acá y no a un índice. */
  readonly id: number
  at: number
  name: string
  /** `true` = derivado por Claude, no capturado por el humano. */
  readonly derived: boolean
  ease?: ChoreoEase
  turn?: ChoreoTurn
  readonly pose: MutableChoreoPose
  readonly origin: KeyframeOrigin
  /** `true` = se le movió algo en esta sesión. Es la marca "esto lo tocaste". */
  edited: boolean
}

/**
 * La sesión de edición de la coreografía, vista desde afuera.
 *
 * El rig la recibe como prop y le lee `.track` y `.version`; el panel además la
 * muta. Los dos hablan de este contrato, y por eso vive del lado de la escena:
 * el que MUTA puede desaparecer, el que LEE no.
 */
export type ChoreoEditor = {
  /** La variante activa: su descriptor completo (nombre, tesis, archivo, notas). */
  readonly variant: ChoreoVariant
  readonly variantId: ChoreoVariantId
  /** Cambia de recorrido. NO descarta la sesión de la variante que se deja. */
  setVariant(id: ChoreoVariantId): void
  /** `true` = esa variante tiene cambios sin exportar. Para marcarla en el panel. */
  isDirty(id: ChoreoVariantId): boolean
  /** El array vivo de la ACTIVA, en orden. Se lee; se muta por los métodos. */
  readonly keyframes: readonly EditableKeyframe[]
  /** El track muestreable de la ACTIVA. Se rearma solo, después de cada mutación. */
  readonly track: ChoreoTrack
  /** Sube con cada cambio que la pantalla tenga que reflejar. */
  readonly version: number
  /** `true` = la activa tiene algo distinto del archivo. Es lo que habilita el reset. */
  readonly dirty: boolean
  subscribe(listener: () => void): () => void
  find(id: number): EditableKeyframe | undefined
  indexOf(id: number): number
  /** Mueve el punto del recorrido. Devuelve el `at` EFECTIVO, ya acotado. */
  setAt(id: number, at: number): number
  /** Escribe los cinco canales de una. Ignora lo que no cambió. */
  applyPose(id: number, values: Readonly<Record<ChoreoChannel, number>>): void
  /** Copia con la misma pose y un `at` nuevo. `null` = no había lugar. */
  duplicate(id: number): EditableKeyframe | null
  /** Solo los que creó el editor. `false` = no se borró. */
  remove(id: number): boolean
  /** Vuelve a los valores del archivo. Descarta la sesión de la variante ACTIVA. */
  reset(): void
}

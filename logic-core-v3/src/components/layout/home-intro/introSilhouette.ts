import { PROBE_EXTRUDE } from '@/app/probe-escena/_components/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

import { sampleFill } from './introSampling'
import { type IntroTimeline } from './introTimeline'

/**
 * LA SILUETA DEL LOGO — cuánto pinta cada capa por fuera del path.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * EL BUG
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Al completarse el relleno, el contorno se apaga y **la silueta se achicaba el
 * ancho del trazo**. Se veía como un salto.
 *
 * La causa es de SVG, no de la secuencia: un `stroke` se pinta **centrado sobre
 * el borde** del path, así que la mitad de su ancho queda por FUERA de la
 * región que el `fill` cubre. Con el trazo de 7 unidades de viewBox eso son 3,5
 * unidades por lado — **1,87 px** con la tinta de 364 px de desktop, 2,50 px en
 * 1920×1080. Mientras el contorno estaba prendido, la silueta era `path + 3,5`;
 * al apagarse pasaba a ser `path`.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * POR QUÉ EL ARREGLO ES UN CLIP Y NO OTRA COSA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * La restricción que decide: **la silueta del relleno tiene que coincidir con la
 * del mesh 3D**, porque el relevo depende de eso. Y el mesh no se puede mover:
 * `IntroLogoCanvas` lo escala por `inkHeightPx / LOGO_INK_VIEWBOX.height`, o sea
 * mapea el **path** a `inkHeightPx`, que es exactamente lo que
 * `scene-framing.ts` proyecta como destino. Cambiar esa escala desalinearía el
 * logo del preloader del logo de la escena cuando la escena se monte.
 *
 * O sea: **el SVG tiene que pintar exactamente el path.** Eso descarta las
 * alternativas:
 *
 * | enfoque | silueta final | ¿calza con el mesh? |
 * |---|---|---|
 * | dejar el contorno prendido, del color del relleno | `path + 3,5` | **no** — habría que agrandar el mesh 3,5 unidades y romper el calce con la escena |
 * | `paint-order` | `path + 3,5` | no — cambia el orden de pintado, no la extensión |
 * | `stroke-alignment: inner` | `path` | sería ideal, pero **ningún navegador lo implementa** (quedó en el borrador de SVG 2) |
 * | achicar el ancho hasta que su mitad sea sub-píxel | `path + ε` | no — deja de ser un trazo visible |
 * | **clipear el contorno a la propia silueta** | **`path`** | **sí, sin tocar nada más** |
 *
 * El clip es el `stroke-alignment: inner` que el navegador no tiene: se pinta el
 * trazo al doble de ancho y se recorta contra el mismo path, así que **solo
 * sobrevive la mitad de adentro**. El ancho aparente queda igual que antes
 * (`STROKE_VISIBLE_WIDTH_VB`), la línea se corre 3,5 unidades hacia adentro, y
 * el borde exterior de lo dibujado ES el borde de la silueta final: cuando el
 * relleno llega, la forma no crece ni se achica.
 *
 * Efecto secundario bueno: el SVG ya no pinta fuera de su propia caja, así que
 * dejó de necesitar `overflow: visible`.
 *
 * ── El calce con el mesh, con los números ──────────────────────────────────
 *
 * No cambió, y ésa es la idea. El mesh asoma `PROBE_EXTRUDE.bevelSize` = 1
 * unidad por lado (su bisel, geometría real del objeto), o sea **0,53 px** en
 * 1440×810 y 0,71 px en 1920×1080: sub-píxel, como estaba documentado desde
 * S8b. Lo que el arreglo elimina son las 3,5 unidades del trazo, que sí se
 * veían.
 *
 *     npx tsx src/components/layout/home-intro/introSilhouette.invariant.ts
 */

/**
 * Ancho DECLARADO del trazo, en unidades del viewBox de la tinta (978 × 681).
 *
 * Es el doble de lo que se ve: el clip se come la mitad de afuera. Se subió de 7
 * a 14 justamente para que el hairline conserve el grosor aparente que ya estaba
 * aprobado en pantalla.
 */
export const STROKE_WIDTH_VB = 14

/** Lo que efectivamente se ve del trazo, todo hacia adentro del borde. */
export const STROKE_VISIBLE_WIDTH_VB = STROKE_WIDTH_VB / 2

/**
 * Los modelos de pintado del contorno, como datos. El vigente es `CLIPPED`; los
 * centrados existen para que la comprobación estática pueda **medir** el bug en
 * vez de solo afirmar que no está.
 */
export type SilhouetteModel = {
  readonly name: string
  /** Cuánto pinta el contorno por fuera del path, en unidades de viewBox. */
  readonly strokeOutsetVb: number
}

/** El vigente: el trazo está recortado contra la silueta y no asoma. */
export const CLIPPED: SilhouetteModel = { name: 'clipeado', strokeOutsetVb: 0 }

/** Un trazo centrado sobre el borde: la mitad de su ancho queda afuera. */
export function centeredModel(strokeWidthVb: number): SilhouetteModel {
  return { name: `centrado ${strokeWidthVb}`, strokeOutsetVb: strokeWidthVb / 2 }
}

/**
 * **El bug tal como se vio en pantalla**: trazo de 7 unidades, centrado. Se
 * conserva el 7 literal a propósito — es el ancho que tenía el código roto, no
 * el declarado de hoy.
 */
export const CENTERED_LEGACY: SilhouetteModel = centeredModel(7)

/** Y lo que pasaría HOY si alguien sacara el clip: el doble, porque el ancho es el doble. */
export const CENTERED_WITHOUT_CLIP: SilhouetteModel = centeredModel(STROKE_WIDTH_VB)

/** Cuánto asoma el mesh por fuera del path: su bisel, una unidad por lado. */
export const MESH_OUTSET_VB = PROBE_EXTRUDE.bevelSize

/** Un desfase en unidades de viewBox, llevado a píxeles de pantalla. */
export function vbToPx(units: number, inkHeightPx: number): number {
  return (units * inkHeightPx) / LOGO_INK_VIEWBOX.height
}

/**
 * El contorno se apaga cuando el relleno terminó, no antes: mientras rellena,
 * los dos suman y la marca se ve sólida sin transparencias intermedias.
 *
 * Vive acá y no adentro del componente para que la comprobación pueda evaluar
 * la misma regla que el render — una sola definición, dos consumidores.
 */
export function strokeOpacityForFill(fill: number): number {
  return fill >= 1 ? 0 : 1
}

/**
 * Cuánto sobresale del path lo que está pintado, en un instante. **Con el
 * modelo vigente vale 0 siempre**, y eso es literalmente la propiedad: apagar el
 * contorno no puede cambiar la silueta.
 */
export function sampleSilhouetteOutsetVb(
  model: SilhouetteModel,
  timeline: IntroTimeline,
  progress: number
): number {
  const fill = sampleFill(timeline, progress)
  return strokeOpacityForFill(fill) > 0 ? model.strokeOutsetVb : 0
}

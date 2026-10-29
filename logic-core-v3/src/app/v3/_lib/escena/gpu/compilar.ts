import type * as THREE from 'three'

/**
 * [T0 · 2026-10-22] COMPILAR SIN QUE UN MATERIAL LIBERADO TIRE LA PÁGINA — el reemplazo de `WebGLRenderer.compileAsync` en la escena.
 *
 * El defecto (medido en el dev: `/v3/pagina-base` con la composición 1 de entonces (la bandera se fue en L6) a 1440 y la ventana a 360 enseguida, 2 `pageerror` «Cannot read
 * properties of undefined (reading 'isReady')»): `compileAsync` (three 0.182, `checkMaterialsReady`) guarda los materiales que compila y,
 * cada 10 ms, le pregunta al programa de cada uno si está listo (`properties.get(material).currentProgram.isReady()`). Si en el medio el
 * material se libera (`dispose`: el título de la página se suelta al cruzar abajo de 1024, el pie se rearma, el lienzo se rehace), sus
 * propiedades se borran, `currentProgram` es `undefined` y la pregunta tira adentro de un `setTimeout`: un error sin atrapar en la página, y
 * la promesa no se resuelve NUNCA (lo que esperaba la compilación —`COMPILANDO` de los títulos, `compilando` del pie— queda colgado).
 *
 * La causa no es liberar (soltar lo que se desmonta es lo correcto, sin esperar a la GPU): es que la espera de three supone que nada de lo
 * que compila se libera mientras espera. Ésta hace lo mismo que la suya (compila con `compile` y pregunta cada `ESPERA_MS`, la primera vez
 * en el acto si está `KHR_parallel_shader_compile`) y da por terminado el material que ya no tiene programa: liberado, no hay nada que
 * esperar. Se resuelve siempre (con un techo, por si el contexto se pierde y ningún programa contesta).
 */

/** Cada cuánto se pregunta (ms): lo de three. */
export const ESPERA_MS = 10
/** El techo (ms): con el contexto perdido `isReady` no contesta nunca; pasado esto, se da por terminado. */
export const TOPE_DE_LA_COMPILACION_MS = 20_000

/** Lo que la espera usa del renderer (el de three lo cumple; la prueba sin navegador usa uno falso). */
export interface RendererQueCompila {
  readonly compile: (objeto: THREE.Object3D, camara: THREE.Camera, escena?: THREE.Scene | null) => Set<THREE.Material>
  readonly properties: { readonly has: (o: unknown) => boolean; readonly get: (o: unknown) => unknown }
  readonly extensions: { has(nombre: string): boolean }
}

interface ProgramaQueCompila {
  readonly isReady: () => boolean
}

/** El programa de un material, si todavía lo tiene; uno liberado (o que nunca llegó a compilarse) no tiene. No crea propiedades. */
export function programaDe(r: Pick<RendererQueCompila, 'properties'>, material: THREE.Material): ProgramaQueCompila | null {
  if (!r.properties.has(material)) return null
  const propiedades = r.properties.get(material)
  if (typeof propiedades !== 'object' || propiedades === null || !('currentProgram' in propiedades)) return null
  const programa = propiedades.currentProgram
  return typeof programa === 'object' && programa !== null && 'isReady' in programa && typeof programa.isReady === 'function' ? (programa as ProgramaQueCompila) : null
}

/** Saca de `pendientes` los que terminaron: listos, o sin programa (liberados). Devuelve cuántos siguen compilando. */
export function quitarLosTerminados(r: Pick<RendererQueCompila, 'properties'>, pendientes: Set<THREE.Material>): number {
  for (const material of pendientes) {
    const programa = programaDe(r, material)
    if (programa === null || programa.isReady()) pendientes.delete(material)
  }
  return pendientes.size
}

/**
 * Compila `objeto` (con las luces de `escena`, si se da: como `compileAsync`) y resuelve cuando cada material está listo o se liberó.
 * Un material que se suelta mientras compila no tira ni deja la promesa colgada.
 */
export function compilarConCuidado(r: RendererQueCompila, objeto: THREE.Object3D, camara: THREE.Camera, escena: THREE.Scene | null = null): Promise<void> {
  const pendientes = r.compile(objeto, camara, escena)
  const desde = Date.now()
  return new Promise<void>((resolver) => {
    const revisar = (): void => {
      if (quitarLosTerminados(r, pendientes) === 0 || Date.now() - desde > TOPE_DE_LA_COMPILACION_MS) resolver()
      else setTimeout(revisar, ESPERA_MS)
    }
    if (r.extensions.has('KHR_parallel_shader_compile')) revisar()
    else setTimeout(revisar, ESPERA_MS)
  })
}

import type * as THREE from 'three'

/** [C2-81] En cuántas partes se calienta la escena (una por cuadro, `Precompilar.tsx`). */
export const PARTES_DEL_CALENTADO = 6

type Dibujable = THREE.Object3D & { readonly isMesh?: boolean; readonly isPoints?: boolean; readonly isLine?: boolean; readonly isSprite?: boolean }

const esDibujable = (o: THREE.Object3D): boolean => {
  const d = o as Dibujable
  return d.isMesh === true || d.isPoints === true || d.isLine === true || d.isSprite === true
}

/** [C2-81] Lo que se dibuja en la escena, partido en `partes` grupos parejos (en el orden del árbol). */
export function partesParaCalentar(escena: THREE.Object3D, partes: number = PARTES_DEL_CALENTADO): THREE.Object3D[][] {
  const dibujables: THREE.Object3D[] = []
  escena.traverse((o) => {
    if (esDibujable(o)) dibujables.push(o)
  })
  const n = Math.max(1, Math.min(partes, dibujables.length))
  return Array.from({ length: n }, (_, i) => dibujables.slice(Math.floor((i * dibujables.length) / n), Math.floor(((i + 1) * dibujables.length) / n))).filter((p) => p.length > 0)
}

/**
 * [C2-81] Un dibujo de UNA parte (lo de `parte`, aunque esté invisible o fuera de cuadro; lo demás que se dibuja, apagado), en un píxel.
 * Lo que no se dibuja (los grupos) se prende para que sus hijos lleguen.
 */
export function calentarUnaParte(gl: Pick<THREE.WebGLRenderer, 'setScissorTest' | 'setScissor' | 'render'>, escena: THREE.Object3D, camara: THREE.Camera, parte: readonly THREE.Object3D[]): void {
  const en = new Set(parte)
  const tocados: { readonly o: THREE.Object3D; readonly visible: boolean; readonly descarte: boolean }[] = []
  escena.traverse((o) => {
    tocados.push({ o, visible: o.visible, descarte: o.frustumCulled })
    if (esDibujable(o)) {
      o.visible = en.has(o)
      o.frustumCulled = false
    } else o.visible = true
  })
  gl.setScissorTest(true)
  gl.setScissor(0, 0, 1, 1)
  gl.render(escena, camara)
  gl.setScissorTest(false)
  for (const t of tocados) {
    t.o.visible = t.visible
    t.o.frustumCulled = t.descarte
  }
}

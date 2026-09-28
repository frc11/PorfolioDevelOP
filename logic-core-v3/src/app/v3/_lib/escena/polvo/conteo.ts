import * as THREE from 'three'

import { POLVO_PAREJO, envolver } from './volumen'

/**
 * [ESCENA 5] EL CONTEO DEL BANCO — cuántas motas caen en cada zona de la pantalla. Repite en JS la
 * cuenta del shader (la caja que se repite, el desvanecido de sus caras, la trama y el piso) para el
 * campo parejo, y proyecta tal cual el campo de la base. Una mota cuenta si se ve a más de la mitad.
 * Sólo lo usa el banco: no corre en el producto.
 */
export function contarPorZonas(puntos: readonly THREE.Points[], camara: THREE.Camera, parejo: boolean, columnas: number, filas: number): number[] {
  const zonas = new Array<number>(columnas * filas).fill(0)
  const v = new THREE.Vector3()
  const mundo = new THREE.Vector3()
  const enPantalla = new THREE.Vector3()
  camara.updateMatrixWorld()
  const adelante = camara.getWorldDirection(new THREE.Vector3())
  const L = POLVO_PAREJO.lado
  for (const p of puntos) {
    p.updateMatrixWorld()
    const inversa = p.matrixWorld.clone().invert()
    const centro = camara.position.clone().applyMatrix4(inversa).add(adelante.clone().transformDirection(inversa).multiplyScalar(L / 2 - POLVO_PAREJO.atras))
    const posicion = p.geometry.getAttribute('position')
    const n = Math.min(p.geometry.drawRange.count, posicion.count)
    for (let i = 0; i < n; i += 1) {
      v.fromBufferAttribute(posicion, i)
      if (parejo) {
        v.set(envolver(v.x, centro.x, L), envolver(v.y, centro.y, L), envolver(v.z, centro.z, L))
        const borde = Math.max(Math.abs(v.x - centro.x), Math.abs(v.y - centro.y), Math.abs(v.z - centro.z)) / (L / 2)
        if (borde > 1 - POLVO_PAREJO.fundido / 2) continue
      }
      mundo.copy(v).applyMatrix4(p.matrixWorld)
      if (parejo && (Math.hypot(mundo.x, mundo.z) > POLVO_PAREJO.radio - 0.75 || mundo.y < POLVO_PAREJO.piso + 0.15 || mundo.distanceTo(camara.position) < (0.8 + POLVO_PAREJO.cerca) / 2 || mundo.distanceTo(camara.position) > POLVO_PAREJO.alcance - 2)) continue
      if (mundo.clone().sub(camara.position).dot(adelante) < 0.2) continue
      enPantalla.copy(mundo).project(camara)
      if (Math.abs(enPantalla.x) > 1 || Math.abs(enPantalla.y) > 1) continue
      const col = Math.min(columnas - 1, Math.floor(((enPantalla.x + 1) / 2) * columnas))
      const fila = Math.min(filas - 1, Math.floor(((1 - enPantalla.y) / 2) * filas))
      zonas[fila * columnas + col] += 1
    }
  }
  return zonas
}

'use client'

import { useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from './entorno'

/**
 * [PULIDO 10] J1 · SÓLO CON BANCO: LA SILUETA DEL LOGO EN EL CUADRO, para el instrumento de solapes (`solapes.ts` del banco y
 * `s61`). Proyecta los triángulos de las mallas visibles del logo con la cámara de ahora y los rasteriza en una grilla de
 * `celda` px: devuelve las celdas cuyo centro cae adentro de algún triángulo. Se calcula al pedirla (nunca por cuadro).
 */
type Silueta = { readonly celda: number; readonly cols: number; readonly filas: number; readonly ocupadas: number[] }
type VentanaDelBanco = Window & { __siluetaDelBanco?: (celda?: number) => Silueta | null; __crucesDelBanco?: (muestras?: number) => Cruce[] }
/** [PULIDO 12] 1 · cuántos puntos de la superficie del logo caen adentro de la caja de una pieza del pie de volumen. */
type Cruce = { readonly pieza: string; readonly dentro: number; readonly total: number; readonly cerca: number }

const [A, B, C] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
const [P, INVERSA, MUNDO] = [new THREE.Vector3(), new THREE.Matrix4(), new THREE.Box3()]

export function SiluetaDelBanco({ logoGroupRef }: { readonly logoGroupRef: RefObject<THREE.Group | null> }): null {
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const escena = useThree((s) => s.scene)
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__siluetaDelBanco = (celda = 8) => {
      const grupo = logoGroupRef.current
      if (grupo === null) return null
      grupo.updateMatrixWorld(true)
      camara.updateMatrixWorld()
      const [cols, filas] = [Math.ceil(tam.width / celda), Math.ceil(tam.height / celda)]
      const grilla = new Uint8Array(cols * filas) // banco
      const enPx = (v: THREE.Vector3): [number, number, boolean] => {
        v.project(camara)
        return [((v.x + 1) / 2) * tam.width, ((1 - v.y) / 2) * tam.height, v.z < 1]
      }
      grupo.traverseVisible((o) => {
        if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
        const pos = o.geometry.getAttribute('position')
        if (pos === undefined) return
        const indice = o.geometry.index
        const n = indice === null ? pos.count : indice.count
        for (let t = 0; t + 2 < n; t += 3) {
          const [i0, i1, i2] = indice === null ? [t, t + 1, t + 2] : [indice.getX(t), indice.getX(t + 1), indice.getX(t + 2)]
          const [ax, ay, av] = enPx(A.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld))
          const [bx, by, bv] = enPx(B.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld))
          const [cx, cy, cv] = enPx(C.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld))
          if (!av || !bv || !cv) continue
          const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
          if (Math.abs(area) < 1e-6) continue
          const [c0, c1] = [Math.max(0, Math.floor(Math.min(ax, bx, cx) / celda)), Math.min(cols - 1, Math.floor(Math.max(ax, bx, cx) / celda))]
          const [f0, f1] = [Math.max(0, Math.floor(Math.min(ay, by, cy) / celda)), Math.min(filas - 1, Math.floor(Math.max(ay, by, cy) / celda))]
          for (let f = f0; f <= f1; f += 1) {
            for (let c = c0; c <= c1; c += 1) {
              const [px, py] = [(c + 0.5) * celda, (f + 0.5) * celda]
              const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area
              const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area
              if (w0 >= 0 && w1 >= 0 && w0 + w1 <= 1) grilla[f * cols + c] = 1
            }
          }
        }
      })
      const ocupadas: number[] = [] // banco
      for (let k = 0; k < grilla.length; k += 1) if (grilla[k] === 1) ocupadas.push(k)
      return { celda, cols, filas, ocupadas }
    }
    // [PULIDO 12] 1 · la interpenetración del logo con las piezas del pie (el logo que cae pasa delante de su plano): puntos de la
    // superficie del logo (`muestras` por lado de cada triángulo, en el mundo) contra la caja local de cada malla visible de cada
    // pieza (`pie de volumen · …`, `armadas.ts`).
    ventana.__crucesDelBanco = (muestras = 5) => {
      const grupo = logoGroupRef.current
      if (grupo === null) return []
      escena.updateMatrixWorld(true)
      const puntos: number[] = [] // banco
      grupo.traverseVisible((o) => {
        if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
        const pos = o.geometry.getAttribute('position')
        if (pos === undefined) return
        const indice = o.geometry.index
        const n = indice === null ? pos.count : indice.count
        for (let t = 0; t + 2 < n; t += 3) {
          const [i0, i1, i2] = indice === null ? [t, t + 1, t + 2] : [indice.getX(t), indice.getX(t + 1), indice.getX(t + 2)]
          A.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld)
          B.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld)
          C.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld)
          for (let i = 0; i <= muestras; i += 1) {
            for (let j = 0; i + j <= muestras; j += 1) {
              const [u, v] = [i / muestras, j / muestras]
              P.copy(A).multiplyScalar(1 - u - v).addScaledVector(B, u).addScaledVector(C, v)
              puntos.push(P.x, P.y, P.z)
            }
          }
        }
      })
      const cruces: Cruce[] = [] // banco
      escena.traverseVisible((o) => {
        if (!(o instanceof THREE.Group) || !o.name.startsWith('pie de volumen · ')) return
        let [dentro, cerca] = [0, Number.POSITIVE_INFINITY]
        o.traverseVisible((m) => {
          if (!(m instanceof THREE.Mesh)) return
          if (m.geometry.boundingBox === null) m.geometry.computeBoundingBox()
          const caja = m.geometry.boundingBox
          if (caja === null) return
          INVERSA.copy(m.matrixWorld).invert()
          for (let k = 0; k < puntos.length; k += 3) if (caja.containsPoint(P.set(puntos[k], puntos[k + 1], puntos[k + 2]).applyMatrix4(INVERSA))) dentro += 1
          // Y lo más cerca que pasa (en el mundo, contra la caja de la malla ya puesta): el margen que queda.
          MUNDO.copy(caja).applyMatrix4(m.matrixWorld)
          for (let k = 0; k < puntos.length; k += 3) cerca = Math.min(cerca, MUNDO.distanceToPoint(P.set(puntos[k], puntos[k + 1], puntos[k + 2])))
        })
        cruces.push({ pieza: o.name, dentro, total: puntos.length / 3, cerca })
      })
      return cruces
    }
    return () => {
      delete ventana.__siluetaDelBanco
      delete ventana.__crucesDelBanco
    }
  }, [camara, escena, tam.width, tam.height, logoGroupRef])
  return null
}

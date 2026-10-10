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
type VentanaDelBanco = Window & { __siluetaDelBanco?: (celda?: number) => Silueta | null }

const [A, B, C] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]

export function SiluetaDelBanco({ logoGroupRef }: { readonly logoGroupRef: RefObject<THREE.Group | null> }): null {
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
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
    return () => {
      delete ventana.__siluetaDelBanco
    }
  }, [camara, tam.width, tam.height, logoGroupRef])
  return null
}

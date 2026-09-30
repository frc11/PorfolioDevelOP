'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from './entorno'
import { ESCENAS_APARTE } from './gpu/Precompilar'
import { CAPA_DEL_POLVO, crearPosproceso } from './gpu/posproceso'

/**
 * LAS PRUEBAS DE LA ESCENA QUE CORREN POR CUADRO — un solo montaje en `ProbeStage` (que no pasa de 300 líneas), y cada
 * una sólo con su bandera: sin ninguna, no se monta nada. [ESCENA 10] T1: queda el antialiasing de ESCENA 9 (T3), que
 * no se decidió; el bloom se borró.
 */
export function PruebasDeLaEscena() {
  const { pruebas } = entornoDeLaEscena()
  return pruebas.aa !== 'no' ? <Posproceso /> : null
}

/**
 * [ESCENA 9] T3 · el posproceso del antialiasing (TAA u 8 muestras: `gpu/posproceso.ts`): toma el dibujo de la escena
 * (prioridad 1: r3f deja de dibujar solo) y lo pasa por sus pasos.
 */
function Posproceso() {
  const { pruebas } = entornoDeLaEscena()
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const pp = useMemo(() => crearPosproceso({ aa: pruebas.aa }), [pruebas])
  useEffect(() => {
    ESCENAS_APARTE.add(pp.aparte)
    const ventana = window as Window & { __posprocesoDelBanco?: typeof pp.banco & { dibujar: () => void; pasos: (n: number) => Promise<Record<string, number>> } }
    // Con banco: el TAA, un dibujo entero (la escena y los pasos) para el mismo cuadro, y lo que cuesta cada paso.
    const dibujo = (): void => pp.dibujar(gl, escena, camara)
    if (hayBanco()) ventana.__posprocesoDelBanco = Object.assign(pp.banco, { dibujar: dibujo, pasos: (n: number) => pp.banco.medirPasos(gl, dibujo, n) })
    return () => {
      ESCENAS_APARTE.delete(pp.aparte)
      delete ventana.__posprocesoDelBanco
      pp.soltar()
    }
  }, [pp, gl, escena, camara])
  // Con el TAA, el polvo va SOLO en su capa (se dibuja encima, después de resolverlo). Vuelve a la capa 0 al desmontar.
  const polvo = useRef(new Set<THREE.Object3D>())
  useEffect(
    () => () => {
      for (const o of polvo.current) o.traverse((x) => x.layers.set(0))
      polvo.current.clear()
    },
    [],
  )
  useFrame((state) => {
    if (pruebas.aa === 'taa' && polvo.current.size < 2) {
      for (const nombre of ['polvo', 'bokeh']) {
        const o = state.scene.getObjectByName(nombre)
        if (o === undefined || polvo.current.has(o)) continue
        o.traverse((x) => x.layers.set(CAPA_DEL_POLVO))
        polvo.current.add(o)
      }
    }
    pp.dibujar(state.gl, state.scene, state.camera)
  }, 1)
  return null
}

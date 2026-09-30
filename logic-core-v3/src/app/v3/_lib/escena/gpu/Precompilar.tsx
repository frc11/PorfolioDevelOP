'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { hayBanco } from '../entorno'

/**
 * [CALIDAD 1] B1 · PRECOMPILAR LOS SHADERS AL ARRANCAR — que nada tironee la primera vez que aparece.
 *
 * three compila el programa de un material la primera vez que lo DIBUJA. Lo que está en la escena desde el principio
 * pero invisible (los rayos del amanecer, la estrella fugaz) se compilaba recién cuando aparecía: medido en la base, el
 * programa de los rayos se compilaba al llegar a Por qué develOP con un cuadro de 1,4 s, y ningún otro programa nuevo
 * aparecía en el recorrido (`motor.ts programas`). La noche, el amanecer y el túnel no cambian de programa: cambian
 * uniforms.
 *
 * Dos pasos, unos cuadros después de que el logo existe (así su material ya tiene el parche del amanecer):
 *
 * 1. **Compilar** la escena entera, lo visible y lo invisible (`compileAsync` recorre todo), con
 *    `KHR_parallel_shader_compile`: el enlace corre en otro hilo y la página no se frena. Lo ya compilado es un acierto
 *    de la caché.
 * 2. **Calentar**: un dibujo de la escena entera con lo invisible prendido y sin descarte por encuadre, recortado a UN
 *    píxel. Hace falta porque ANGLE (Direct3D 11, la placa de medición) arma el ejecutable de cada programa recién en su
 *    primer dibujo (depende del búfer y de los atributos): medido, con el programa ya compilado el primer dibujo de los
 *    rayos igual frenaba el hilo 1,37 s. El píxel lo vuelve a pintar el cuadro siguiente.
 *
 * El costo no desaparece en la PRIMERA visita (Chrome guarda lo compilado en disco para las siguientes): se muda de
 * la mitad del recorrido a la carga (medido en frío: 1,1 s al arrancar, ninguno después). Con la caché, 15 ms.
 */
const CUADROS_DESPUES_DEL_LOGO = 8

/**
 * [CALIDAD 1] B5 · lo que se dibuja en una escena aparte, en su propio búfer (los haces del amanecer, a media
 * resolución): se compila y se calienta igual, en su búfer. Lo registra quien la dibuja, al montarse.
 */
export const ESCENAS_APARTE = new Set<{ readonly escena: THREE.Scene; readonly bufer: THREE.WebGLRenderTarget }>()

type Dibujable = THREE.Object3D & { readonly isMesh?: boolean; readonly isPoints?: boolean; readonly isLine?: boolean; readonly isSprite?: boolean }

type VentanaDelBanco = Window & { __precompiladoDelBanco?: { readonly compilarMs: number; readonly calentarMs: number } }

/** Un dibujo de todo lo que se puede dibujar (lo invisible y lo que está fuera de cuadro), en un píxel. */
function calentar(gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera): void {
  const tocados: { readonly o: THREE.Object3D; readonly visible: boolean; readonly descarte: boolean }[] = []
  escena.traverse((o) => {
    const d = o as Dibujable
    const dibujable = d.isMesh === true || d.isPoints === true || d.isLine === true || d.isSprite === true
    if (!dibujable && o.visible) return
    tocados.push({ o, visible: o.visible, descarte: o.frustumCulled })
    o.visible = true
    o.frustumCulled = false
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

export function Precompilar({ logoMaterialRef }: { readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null> }) {
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const estado = useRef({ cuadros: 0, compilado: false, calentar: false, hecho: false, compilarMs: 0 })
  useFrame(() => {
    const e = estado.current
    if (e.hecho) return
    if (e.calentar) {
      e.calentar = false
      e.hecho = true
      const t0 = performance.now()
      calentar(gl, escena, camara)
      for (const a of ESCENAS_APARTE) {
        const previo = gl.getRenderTarget()
        gl.setRenderTarget(a.bufer)
        calentar(gl, a.escena, camara)
        gl.setRenderTarget(previo)
      }
      if (hayBanco()) {
        // Con banco, lo que tardó de verdad (esperando a la GPU): en frío es la compilación de Direct3D de lo invisible.
        gl.getContext().finish()
        ;(window as VentanaDelBanco).__precompiladoDelBanco = { compilarMs: e.compilarMs, calentarMs: Math.round(performance.now() - t0) }
      }
      return
    }
    if (e.compilado || logoMaterialRef.current === null) return
    e.cuadros += 1
    if (e.cuadros < CUADROS_DESPUES_DEL_LOGO) return
    e.compilado = true
    const t0 = performance.now()
    void Promise.all([gl.compileAsync(escena, camara), ...[...ESCENAS_APARTE].map((a) => gl.compileAsync(a.escena, camara))]).then(() => {
      e.compilarMs = Math.round(performance.now() - t0)
      e.calentar = true
    })
  })
  return null
}

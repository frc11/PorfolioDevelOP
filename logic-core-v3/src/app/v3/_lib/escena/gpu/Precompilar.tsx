'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { marcarElPrimerCuadro, marcarLaEscenaPreparada } from '../../carga'
import { laPreparacionPuede } from '../../entrada'
import { hayBanco } from '../entorno'

import { compilarConCuidado } from './compilar'
import { calentarUnaParte, partesParaCalentar } from './partes'

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
 *
 * [C2-81] REPARTIDO, para que no trabe la bienvenida del preloader (ítem 18): con el preloader, la compilación espera a que el texto
 * terminó de aparecer (`laPreparacionPuede`, `entrada.ts`), y el calentado va EN PARTES (`PARTES_DEL_CALENTADO` grupos de mallas, uno por
 * cuadro: `partesParaCalentar`, `calentarUnaParte`), así el armado de los ejecutables de Direct3D se reparte en varios tirones chicos.
 */
const CUADROS_DESPUES_DEL_LOGO = 8


/**
 * [CALIDAD 1] B5 · lo que se dibuja en una escena aparte, en su propio búfer (los haces del amanecer, a media
 * resolución): se compila y se calienta igual, en su búfer. Lo registra quien la dibuja, al montarse.
 */
export const ESCENAS_APARTE = new Set<{ readonly escena: THREE.Scene; readonly bufer: THREE.WebGLRenderTarget }>()

type Dibujable = THREE.Object3D & { readonly isMesh?: boolean; readonly isPoints?: boolean; readonly isLine?: boolean; readonly isSprite?: boolean }

type VentanaDelBanco = Window & { __precompiladoDelBanco?: { readonly compilarMs: number; readonly calentarMs: number } }

/**
 * Un dibujo de todo lo que se puede dibujar (lo invisible y lo que está fuera de cuadro), en un píxel. [ESCENA 10] T3:
 * exportado, para lo que llega después del precompilado (un módulo perezoso) y se calienta al montarse.
 */
export function calentar(gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera): void {
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
  const estado = useRef({ cuadros: 0, compilado: false, calentar: false, hecho: false, compilarMs: 0, primerCuadro: false, partes: null as THREE.Object3D[][] | null, parte: 0, calentarMs: 0 })
  useFrame(() => {
    const e = estado.current
    // [AJUSTES FINALES] A4 · el primer cuadro de la escena, cuando ya se pintó (el cuadro siguiente): el velo de carga lo espera.
    if (!e.primerCuadro) {
      e.primerCuadro = true
      requestAnimationFrame(marcarElPrimerCuadro)
    }
    if (e.hecho) return
    if (e.calentar) {
      // [C2-81] Cada parte, sólo en un rato quieto del preloader (sin él, siempre).
      if (!laPreparacionPuede()) return
      const t0 = performance.now()
      // [C2-81] Una parte por cuadro; con la última, las escenas aparte.
      e.partes ??= partesParaCalentar(escena)
      if (e.parte < e.partes.length) {
        calentarUnaParte(gl, escena, camara, e.partes[e.parte])
        e.parte += 1
        e.calentarMs += performance.now() - t0
        return
      }
      e.calentar = false
      e.hecho = true
      for (const a of ESCENAS_APARTE) {
        const previo = gl.getRenderTarget()
        gl.setRenderTarget(a.bufer)
        calentar(gl, a.escena, camara)
        gl.setRenderTarget(previo)
      }
      // [B12c] Compilada y calentada: el preloader del sitio lo espera (el tirón queda debajo de su blanco).
      marcarLaEscenaPreparada()
      if (hayBanco()) {
        // Con banco, lo que tardó de verdad (esperando a la GPU): en frío es la compilación de Direct3D de lo invisible.
        gl.getContext().finish()
        ;(window as VentanaDelBanco).__precompiladoDelBanco = { compilarMs: e.compilarMs, calentarMs: Math.round(e.calentarMs + performance.now() - t0) }
      }
      return
    }
    if (e.compilado || logoMaterialRef.current === null) return
    e.cuadros += 1
    if (e.cuadros < CUADROS_DESPUES_DEL_LOGO) return
    // [C2-81] Con el preloader, recién cuando la bienvenida terminó de aparecer (`entrada.ts`).
    if (!laPreparacionPuede()) return
    e.compilado = true
    const t0 = performance.now()
    // [T0] Sin `compileAsync`: lo que se libera mientras compila no tira en la página ni deja esto colgado (`compilar.ts`).
    void Promise.all([compilarConCuidado(gl, escena, camara), ...[...ESCENAS_APARTE].map((a) => compilarConCuidado(gl, a.escena, camara))]).then(() => {
      e.compilarMs = Math.round(performance.now() - t0)
      e.calentar = true
    })
  })
  return null
}

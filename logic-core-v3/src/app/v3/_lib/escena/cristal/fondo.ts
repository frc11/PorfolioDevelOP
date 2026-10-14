import * as THREE from 'three'

import { crearElDestino } from '../pase/pase'
import { CRISTAL } from './cristal'

/**
 * [PULIDO 20] R2 · EL FONDO QUE REFRACTAN LAS ESQUIRLAS: un render target a media resolución con SÓLO el fondo (el cielo, la trama del domo
 * y su zócalo, la fábrica de logos, las estrellas y la fugaz), dibujado con la cámara del cuadro en una capa propia (`CAPA_DEL_FONDO`), más
 * las luces (los programas son los mismos del cuadro: el destino se declara «como la pantalla», como el pase de profundidad). No tiene el
 * logo, los títulos, las partículas ni el pie: una esquirla nunca dobla un texto ni el logo, y nunca se lleva una partícula. Se dibuja sólo
 * en los cuadros en que el cristal se ve (sin pedido, nada), después de que todo se movió (el componente va al final del escenario).
 */
export const CAPA_DEL_FONDO = 8

/** Lo que es fondo, por su nombre (`MoireScreen`, `formacion/armado.ts`, `Estrellas`, `Fugaz`, `CieloDeDia`). */
export const NOMBRES_DEL_FONDO: readonly string[] = ['trama gruesa', 'trama fina', 'zócalo', 'formación · primeras filas', 'formación · siluetas', 'estrellas', 'vía láctea', 'fugaz', 'cielo de día']

/** Cada cuántos cuadros se vuelve a marcar la capa (lo que entra o sale de la escena). */
const MARCAR_CADA = 30

const marcar = (o: THREE.Object3D): void => {
  if (o instanceof THREE.Light || NOMBRES_DEL_FONDO.includes(o.name)) o.layers.enable(CAPA_DEL_FONDO)
}

export interface FondoDelCristal {
  readonly destino: THREE.WebGLRenderTarget
  /** [PULIDO 24] V1 · la vista con la que se dibujó (la del margen): la que usa el vidrio para leerlo. */
  readonly vista: THREE.Matrix4
  readonly tam: THREE.Vector2
  readonly antes: THREE.Color
  cuadro: number
  listo: boolean
}

export function crearElFondo(): FondoDelCristal {
  const destino = crearElDestino()
  destino.texture.minFilter = THREE.LinearFilter
  destino.texture.magFilter = THREE.LinearFilter
  return { destino, vista: new THREE.Matrix4(), tam: new THREE.Vector2(), antes: new THREE.Color(), cuadro: 0, listo: false }
}

export function soltarElFondo(f: FondoDelCristal): void {
  f.destino.depthTexture?.dispose()
  f.destino.dispose()
}

const AMPLIA = new THREE.PerspectiveCamera()

/**
 * Dibuja el fondo de este cuadro: a `escala` del búfer, sólo la capa del fondo, limpio con `limpio` (el color de la niebla: lo que hay
 * detrás de todo). [PULIDO 24] V1 · con margen: una cámara de trabajo igual a la del cuadro con el campo `sobra` veces más ancho y alto
 * (la refracción de los costados lee afuera de la pantalla y ahí hay fondo); su vista queda en `f.vista`.
 */
export function dibujarElFondo(f: FondoDelCristal, gl: THREE.WebGLRenderer, escena: THREE.Scene, deLaEscena: THREE.Camera, limpio: THREE.Color): THREE.Texture {
  let camara: THREE.Camera = deLaEscena
  if (deLaEscena instanceof THREE.PerspectiveCamera) {
    AMPLIA.copy(deLaEscena, false)
    AMPLIA.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(deLaEscena.fov) / 2) * CRISTAL.fondo.sobra))
    AMPLIA.updateProjectionMatrix()
    AMPLIA.matrixWorld.copy(deLaEscena.matrixWorld)
    AMPLIA.matrixWorldInverse.copy(deLaEscena.matrixWorldInverse)
    AMPLIA.matrixAutoUpdate = false
    camara = AMPLIA
  }
  f.vista.multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse)
  gl.getDrawingBufferSize(f.tam)
  const ancho = Math.max(1, Math.round(f.tam.x * CRISTAL.fondo.escala))
  const alto = Math.max(1, Math.round(f.tam.y * CRISTAL.fondo.escala))
  if (f.destino.width !== ancho || f.destino.height !== alto) f.destino.setSize(ancho, alto)
  if (!f.listo) {
    gl.initRenderTarget(f.destino)
    f.listo = true
  }
  if (f.cuadro % MARCAR_CADA === 0) escena.traverse(marcar)
  f.cuadro += 1
  const anterior = gl.getRenderTarget()
  const mascara = camara.layers.mask
  gl.getClearColor(f.antes)
  const alfa = gl.getClearAlpha()
  camara.layers.set(CAPA_DEL_FONDO)
  gl.setRenderTarget(f.destino)
  gl.setClearColor(limpio, 1)
  gl.clear(true, true, false)
  gl.render(escena, camara)
  gl.setRenderTarget(anterior)
  gl.setClearColor(f.antes, alfa)
  camara.layers.mask = mascara
  return f.destino.texture
}

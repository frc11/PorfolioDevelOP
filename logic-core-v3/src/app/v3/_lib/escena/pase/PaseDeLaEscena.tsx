'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { PASE, PASE_EN_VIVO, PEDIDOS_DEL_PASE, crearElDestino, marcarLasCapas } from './pase'

/**
 * [PULIDO 18] P1.a · EL PASE COMPARTIDO DE LA ESCENA (`pase.ts`: qué es y por qué). Va ÚLTIMO en el escenario: su cuadro corre después
 * de todos los demás (el rig, el logo, el piso y el pie ya se movieron) y antes de que r3f dibuje. Sin pedidos, no hace nada. P1.c · y
 * el disparador del color: un triángulo que no pinta nada, dibujado después de la trama, que en su `onBeforeRender` copia el cuadro.
 */
interface Armado {
  readonly destino: THREE.WebGLRenderTarget
  readonly tam: THREE.Vector2
  readonly disparador: THREE.Mesh
  color: THREE.FramebufferTexture | null
  cuadro: number
  listo: boolean
}

const TAM_DEL_COLOR = new THREE.Vector2()

/** La textura del color, del tamaño del búfer de dibujo (se rehace sólo si cambió el tamaño). */
function texturaDelColor(a: Armado, ancho: number, alto: number): THREE.FramebufferTexture {
  if (a.color === null || a.color.image.width !== ancho || a.color.image.height !== alto) {
    a.color?.dispose()
    a.color = new THREE.FramebufferTexture(ancho, alto)
    a.color.minFilter = THREE.LinearFilter
    a.color.magFilter = THREE.LinearFilter
  }
  return a.color
}

/** El color de este cuadro hasta la trama (si alguien lo pidió): a resolución completa. */
function copiarElColor(a: Armado, gl: THREE.WebGLRenderer): void {
  if (!PEDIDOS_DEL_PASE.colorEsteCuadro) {
    PASE_EN_VIVO.uHayColor.value = 0
    return
  }
  PEDIDOS_DEL_PASE.colorEsteCuadro = false
  gl.getDrawingBufferSize(TAM_DEL_COLOR)
  const textura = texturaDelColor(a, TAM_DEL_COLOR.x, TAM_DEL_COLOR.y)
  gl.copyFramebufferToTexture(textura)
  PASE_EN_VIVO.uColorDeLaEscena.value = textura
  PASE_EN_VIVO.uHayColor.value = 1
}

function armar(): Armado {
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3))
  const material = new THREE.ShaderMaterial({ vertexShader: 'void main() { gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 ); }', fragmentShader: 'void main() { gl_FragColor = vec4( 0.0 ); }', transparent: true, depthWrite: false, depthTest: false })
  const disparador = new THREE.Mesh(geometria, material)
  disparador.name = 'pase: el color de la escena'
  disparador.frustumCulled = false
  disparador.renderOrder = PASE.orden
  const a: Armado = { destino: crearElDestino(), tam: new THREE.Vector2(), disparador, color: null, cuadro: 0, listo: false }
  disparador.onBeforeRender = (gl) => copiarElColor(a, gl)
  return a
}

/** La pasada de profundidad de este cuadro: a media resolución, sólo la capa de lo opaco, con la cámara del cuadro. */
function profundidad(a: Armado, gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera): void {
  gl.getDrawingBufferSize(a.tam)
  const ancho = Math.max(1, Math.round(a.tam.x * PASE.escala))
  const alto = Math.max(1, Math.round(a.tam.y * PASE.escala))
  if (a.destino.width !== ancho || a.destino.height !== alto) a.destino.setSize(ancho, alto)
  if (!a.listo) {
    gl.initRenderTarget(a.destino)
    a.listo = true
  }
  if (a.cuadro % PASE.marcarCada === 0) marcarLasCapas(escena)
  a.cuadro += 1
  const antes = gl.getRenderTarget()
  const mascara = camara.layers.mask
  camara.layers.set(PASE.capa)
  gl.setRenderTarget(a.destino)
  gl.render(escena, camara)
  gl.setRenderTarget(antes)
  camara.layers.mask = mascara
  PASE_EN_VIVO.uProfundidad.value = a.destino.depthTexture
  PASE_EN_VIVO.uHayProfundidad.value = 1
  if (camara instanceof THREE.PerspectiveCamera) PASE_EN_VIVO.uCercaLejos.value.set(camara.near, camara.far)
}

export function PaseDeLaEscena(): React.JSX.Element {
  const armado = useMemo(() => armar(), [])
  useEffect(
    () => () => {
      armado.destino.depthTexture?.dispose()
      armado.destino.dispose()
      armado.color?.dispose()
      armado.disparador.geometry.dispose()
      if (armado.disparador.material instanceof THREE.Material) armado.disparador.material.dispose()
      PASE_EN_VIVO.uProfundidad.value = null
      PASE_EN_VIVO.uHayProfundidad.value = 0
      PASE_EN_VIVO.uColorDeLaEscena.value = null
      PASE_EN_VIVO.uHayColor.value = 0
    },
    [armado],
  )
  useFrame((state) => {
    if (PEDIDOS_DEL_PASE.profundidad > 0) profundidad(armado, state.gl, state.scene, state.camera)
    else PASE_EN_VIVO.uHayProfundidad.value = 0
  })
  return <primitive object={armado.disparador} />
}

'use client'

import { addAfterEffect, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { PORTFOLIO_EN_LA_ESCENA } from './portfolioEnLaEscena'

/** El elemento del DOM cuyo rectángulo ocupa el «?» (lo pone la tira de «la tuya», `trabajos/portfolio/LaTuya.tsx`). */
const SELECTOR_DEL_HUECO = '[data-signo-de-la-tuya]'
/** El color con el que se limpia el hueco: el de la tira (el negro de la marca, `--color-fondo` de la sala invertida). */
const COLOR_DEL_HUECO = new THREE.Color('#0E0E0E')
/** El giro lento, en radianes por segundo. */
const GIRO_RAD_S = 0.45

/** El «?» como volumen: un tubo a lo largo de su trazo (un arco y la bajada) y el punto. Centrado en el origen, ~2 u de alto. */
function armarElSigno(material: THREE.Material): THREE.Group {
  const trazo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 0.45, 0),
    new THREE.Vector3(-0.45, 0.85, 0),
    new THREE.Vector3(0, 1.02, 0),
    new THREE.Vector3(0.45, 0.85, 0),
    new THREE.Vector3(0.5, 0.45, 0),
    new THREE.Vector3(0.18, 0.12, 0),
    new THREE.Vector3(0, -0.12, 0),
    new THREE.Vector3(0, -0.38, 0),
  ])
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.TubeGeometry(trazo, 96, 0.16, 20, false), material))
  const tapa = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), material)
  tapa.position.copy(trazo.getPoint(0))
  g.add(tapa)
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), material)
  fin.position.copy(trazo.getPoint(1))
  g.add(fin)
  const punto = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20), material)
  punto.position.set(0, -0.82, 0)
  g.add(punto)
  return g
}

interface Armado {
  readonly escena: THREE.Scene
  readonly camara: THREE.PerspectiveCamera
  readonly signo: THREE.Group
  readonly material: THREE.MeshPhysicalMaterial
}

function armar(): Armado {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#E9E6DF'),
    roughness: 0.42,
    metalness: 0.15,
    sheen: 1,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color('#FFFFFF'),
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  })
  const escena = new THREE.Scene()
  const signo = armarElSigno(material)
  escena.add(signo)
  escena.add(new THREE.HemisphereLight('#FFFFFF', '#30302C', 1.1))
  const clave = new THREE.DirectionalLight('#FFFFFF', 2.2)
  clave.position.set(2.5, 3, 4)
  escena.add(clave)
  const contra = new THREE.DirectionalLight('#BFD3FF', 1.1)
  contra.position.set(-3, 1, -2)
  escena.add(contra)
  const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camara.position.set(0, 0, 6.2)
  camara.lookAt(0, 0.05, 0)
  return { escena, camara, signo, material }
}

/** El estado que se guarda de un cuadro a otro (el reloj del giro) y lo que se restaura del renderer. */
interface Cuadro {
  antes: number
  readonly color: THREE.Color
  readonly vista: THREE.Vector4
}

/** Dibuja el «?» en el hueco (si corresponde): después del render del cuadro, con scissor, y deja el renderer como estaba. */
function dibujar(a: Armado, gl: THREE.WebGLRenderer, c: Cuadro): void {
  const ahora = performance.now()
  const dt = Math.min(0.1, (ahora - c.antes) / 1000)
  c.antes = ahora
  if (!PORTFOLIO_EN_LA_ESCENA.adentro) return
  const hueco = document.querySelector<HTMLElement>(SELECTOR_DEL_HUECO)
  if (hueco === null) return
  const r = hueco.getBoundingClientRect()
  const l = gl.domElement.getBoundingClientRect()
  if (r.width < 8 || r.height < 8 || r.bottom < l.top || r.top > l.bottom) return
  // En px de CSS: three multiplica el scissor y el viewport por el `dpr` del lienzo; la `y` del búfer va de abajo.
  const x = r.left - l.left
  const y = l.bottom - r.bottom
  if (!PORTFOLIO_EN_LA_ESCENA.reducido) a.signo.rotation.y += GIRO_RAD_S * dt
  a.camara.aspect = r.width / r.height
  a.camara.updateProjectionMatrix()
  const autoClear = gl.autoClear
  const alfa = gl.getClearAlpha()
  gl.getClearColor(c.color)
  gl.getViewport(c.vista)
  gl.autoClear = false
  gl.setScissorTest(true)
  gl.setScissor(x, y, r.width, r.height)
  gl.setViewport(x, y, r.width, r.height)
  gl.setClearColor(COLOR_DEL_HUECO, 1)
  gl.clear(true, true, false)
  gl.render(a.escena, a.camara)
  gl.setScissorTest(false)
  gl.setViewport(c.vista)
  gl.setClearColor(c.color, alfa)
  gl.autoClear = autoClear
}

function desarmar(a: Armado): void {
  a.escena.traverse((o) => {
    if (o instanceof THREE.Mesh) o.geometry.dispose()
  })
  a.material.dispose()
}

/**
 * [B1] EL «?» DE «LA PRÓXIMA ES LA TUYA» — satinado, girando despacio, en el lienzo de la escena y SIN un contexto nuevo (plan §5.5).
 *
 * Se dibuja DESPUÉS del render del cuadro (`addAfterEffect`), así que no le toma el lazo a r3f, no lo oscurece el multiplicador del
 * Portfolio y no lo tocan la niebla ni las luces de la sala (escena, cámara y luces propias). El rectángulo es el del hueco de la
 * tira (`[data-signo-de-la-tuya]`, que deja ver el lienzo), medido en cada cuadro (la tira puede estar animando su ancho), con la `y`
 * dada vuelta (three lo lleva al búfer con el `dpr`); ahí se limpia al color de la tira y se dibuja el signo. Sólo con la tira de la
 * tuya activa y el panel adentro; con movimiento reducido, quieto.
 */
export function SignoDeLaTuya(): null {
  const gl = useThree((s) => s.gl)
  const armado = useMemo(() => armar(), [])
  useEffect(() => {
    const cuadro: Cuadro = { antes: performance.now(), color: new THREE.Color(), vista: new THREE.Vector4() }
    const soltar = addAfterEffect(() => dibujar(armado, gl, cuadro))
    return () => {
      soltar()
      desarmar(armado)
    }
  }, [armado, gl])
  return null
}

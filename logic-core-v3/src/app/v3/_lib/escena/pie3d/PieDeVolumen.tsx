'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datos400 from '../../../_fuentes/chivo-400-pie.json'
import datos500 from '../../../_fuentes/chivo-500-pie.json'
import datos600 from '../../../_fuentes/chivo-600-pie.json'
import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { firmaDeLaForma, medirLaPieza, type MedidaDeLaPieza } from '../../pie3d/medida'
import { HUNDIDOS, PIEZAS_DEL_PIE, cuantoSeHunde, marcarElPieListo, suscribirALasPiezas, versionDeLasPiezas, type PiezaDelPie } from '../../pie3d/registro'
import { entornoDeLaEscena, hayBanco, type Pruebas } from '../entorno'
import { crearElEstudio } from '../estudio'
import { calentar } from '../gpu/Precompilar'
import { KEY_INTENSITY } from '../probeLighting'
import { FLOOR_Y } from '../probeScene'
import { ONDA_PEDIDA } from '../interfaz/pedidos'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { caraEnElCuadro, colocarLaPieza, profundidadDeLaPieza } from './colocacion'
import { armarLaPieza, contenidoDe, type FuentesDelPie } from './geometria'
import { alFinalDeLaPagina, aplicarLaLlegada, cuantoLeFalta, llegadaDe, type LlegadaDeLaPieza } from './llegada'
import { materialDelPie } from './material'
import { MAXIMO_DE_SOMBRAS_DEL_PIE, SOMBRAS_DEL_PIE, SOMBRA_DEL_PIE, formaDeLaSombra } from './sombras'

/**
 * [RETOQUE DEL PIE] P2 · EL PIE DE VOLUMEN EN LA ESCENA — en un módulo que se descarga aparte, desde 1025 (como los
 * títulos). Cada pieza que anota el pie (`_lib/pie3d/registro.ts`) se mide en el DOM (`medida.ts`), se arma en WebGL
 * (`geometria.ts`: el texto extruido, las placas con su texto en relieve, el formulario con sus pozos y su tecla) y en
 * cada cuadro se pone donde la cámara sin el mouse la ve en su lugar del DOM (`colocacion.ts`): fija en el mundo y de
 * frente; lo único que se mueve es la cámara, y el paralaje le deja ver la perspectiva y los costados.
 *
 * **Lo interactivo sigue a su pieza.** El DOM de verdad (el enlace, el botón, el formulario con sus campos) queda donde
 * la cámara viva ve la cara de su pieza: cada cuadro se le escribe la homografía (`homografia.ts`) como `transform`, sin
 * `setState` (y sólo si cambió). Se enfoca, se escribe y lo anuncia el lector; el anillo de foco cae sobre la placa.
 *
 * **Se hunde** en su eje (sin girar): con el mouse encima o el foco del teclado, `encima` px; apretada, `apretada` px
 * (los escuchas del DOM escriben `HUNDIDOS`; el tic y el pestillo, los del sonido). **Sombras de contacto** en el piso
 * vivo (`sombras.ts`). Se arma con las fuentes cargadas, al anotarse y cuando cambia una caja (el formulario con sus
 * errores, «Enviando…»); se compila una vez y recién ahí el DOM apaga lo que el 3D dibuja (`marcarElPieListo`).
 */
const FUENTES: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData) }

/** Cuánto se hunde (px) y en cuánto tiempo (la constante, s). */
export const HUNDIDA_DEL_PIE = { encima: 5, apretada: 12, tau: 0.05 } as const

/** Lo que se dibuja fuera del cuadro (px): una pieza que entra ya está. */
const MARGEN = 120

/** [RETOQUE DEL PIE] P3 · lo interactivo de una pieza que todavía no se armó (`pie=llegada`). */
const SIN_ARMAR = 'scale(0)'

interface Armada {
  readonly pieza: PiezaDelPie
  medida: MedidaDeLaPieza
  readonly firma: string
  readonly grupo: THREE.Group
  /** Lo que se hunde: la placa de un enlace; en el formulario, la tecla. */
  readonly cuerpo: THREE.Group
  readonly mallas: readonly THREE.Mesh[]
  readonly espesor: number
  readonly contenido: ReturnType<typeof contenidoDe>
  readonly delHundido: Element | null
  /** [RETOQUE DEL PIE] P3 · de dónde sale con `pie=llegada`. */
  readonly llegada: LlegadaDeLaPieza
  hundido: number
  css: string
  d: number
  mundoPorPx: number
}

interface Estado {
  armadas: Armada[]
  /** Uno para todas las piezas (lo arma el efecto del estudio). */
  material: THREE.MeshStandardMaterial | null
  quieto: boolean
  fuentes: boolean
  /** Se compila una vez: mientras, no se dibuja ni se le escribe al DOM. */
  compilando: boolean
  listo: boolean
  montado: boolean
  /** [RETOQUE DEL PIE] P3 · la prueba de esta carga, y cuándo se llegó al final de la página (la llegada, una vez). */
  prueba: Pruebas['pie']
  inicio: number | null
  readonly cuadrilatero: number[]
  readonly matriz: number[]
}

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
}

type VentanaDelBanco = Window & { __pieDelBanco?: { piezas: () => unknown; ondas: () => number } }

const PUNTO = new THREE.Vector3()

export default function PieDeVolumen({ keyLightRef }: Props) {
  const version = useSyncExternalStore(suscribirALasPiezas, versionDeLasPiezas, versionDeLasPiezas)
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const m = useRef<Estado>({ armadas: [], material: null, quieto: false, fuentes: false, compilando: false, listo: false, montado: false, prueba: 'no', inicio: null, cuadrilatero: [], matriz: [] })

  useEffect(() => {
    m.current.prueba = entornoDeLaEscena().pruebas.pie
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const leer = (): void => {
      m.current.quieto = q.matches
    }
    leer()
    q.addEventListener('change', leer)
    return () => q.removeEventListener('change', leer)
  }, [])

  // El material y el estudio de sus reflejos (como los de los títulos); al irse, todo lo armado y el DOM como estaba.
  useEffect(() => {
    const s = m.current
    const material = materialDelPie()
    const rt = crearElEstudio(gl)
    material.envMap = rt.texture
    s.material = material
    s.montado = true
    return () => {
      s.montado = false
      s.listo = false
      for (const a of s.armadas) soltar(a)
      s.armadas = []
      s.material = null
      SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0
      marcarElPieListo(false)
      material.dispose()
      rt.dispose()
    }
  }, [gl])

  // Se arma (y se rearma lo que cambió) con las fuentes cargadas: al anotarse, al cambiar el cuadro o una caja.
  useEffect(() => {
    void version
    const g = raiz.current
    const s = m.current
    if (g === null) return undefined
    let vivo = true
    let reloj = 0
    const armarYa = (): void => {
      if (!vivo || !s.fuentes || s.material === null) return
      rearmar(s, g, s.material)
      if (s.listo || s.compilando || s.armadas.length === 0) return
      s.compilando = true
      void gl.compileAsync(escena, camara).then(() => {
        s.compilando = false
        if (!s.montado) return
        calentar(gl, escena, camara)
        s.listo = true
        marcarElPieListo(true)
      })
    }
    const pedir = (): void => {
      window.clearTimeout(reloj)
      reloj = window.setTimeout(armarYa, 80)
    }
    const tamanos = new ResizeObserver(pedir)
    const textos = new MutationObserver(pedir)
    tamanos.observe(document.body)
    for (const p of PIEZAS_DEL_PIE.values()) {
      tamanos.observe(p.elemento)
      if (p.forma === 'formulario') textos.observe(p.elemento, { childList: true, subtree: true, characterData: true })
    }
    void document.fonts.ready.then(() => {
      s.fuentes = true
      if (vivo) pedir()
    })
    return () => {
      vivo = false
      window.clearTimeout(reloj)
      tamanos.disconnect()
      textos.disconnect()
    }
  }, [version, tam.width, tam.height, gl, escena, camara])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__pieDelBanco = {
      piezas: () =>
        m.current.armadas.map((a) => {
          const r = a.pieza.elemento.getBoundingClientRect()
          return { id: a.pieza.id, forma: a.pieza.forma, visible: a.grupo.visible, d: a.d, mundoPorPx: a.mundoPorPx, hundido: a.hundido, css: a.css, dom: [r.left, r.top, r.right, r.bottom].map(Math.round), caja: [a.medida.caja.x, a.medida.caja.y - scrollY, a.medida.caja.ancho, a.medida.caja.alto].map(Math.round), letras: a.medida.letras.length, trazos: a.medida.trazos.length, pozos: a.medida.pozos.length }
        }),
      // [RETOQUE DEL PIE] P3 · cuántas ondas pidió el piso (`pie=onda`).
      ondas: () => ONDA_PEDIDA.n,
    }
    return () => {
      delete ventana.__pieDelBanco
    }
  }, [])

  useFrame((state, delta) => alCuadro(m.current, state.camera, keyLightRef.current, { ancho: tam.width, alto: tam.height }, Math.min(delta, 0.1)))

  return <group ref={raiz} name="pie de volumen" />
}

/** Un cuadro: cada pieza a la vista, en su lugar del mundo; su hundido; lo interactivo sobre ella; su sombra. */
function alCuadro(s: Estado, viva: THREE.Camera, principal: THREE.DirectionalLight | null, cuadro: { readonly ancho: number; readonly alto: number }, dt: number): void {
  if (!s.listo || s.material === null || s.armadas.length === 0) return
  viva.updateMatrixWorld()
  // [RETOQUE DEL PIE] P3 · `pie=llegada`: hasta el final de la página no están; ahí se arman (una vez) y quedan fijas.
  const conLlegada = s.prueba === 'llegada' && !s.quieto
  if (conLlegada && s.inicio === null && alFinalDeLaPagina(scrollY, cuadro.alto, document.documentElement.scrollHeight)) s.inicio = performance.now()
  const desdeElInicioS = s.inicio === null ? 0 : (performance.now() - s.inicio) / 1000
  s.material.envMapIntensity = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  // A la profundidad del logo, o adelante si ahí alguna quedaría bajo el piso (`colocacion.ts`): todas en el mismo plano
  // (el pie se mueve entero con el paralaje: un rótulo no se despega de su columna).
  let d = Number.POSITIVE_INFINITY
  for (const a of s.armadas) {
    const arriba = a.medida.caja.y - scrollY
    const c = a.contenido
    a.grupo.visible = arriba + c.abajo > -MARGEN && arriba + c.arriba < cuadro.alto + MARGEN && !(conLlegada && s.inicio === null)
    // Sin armar todavía, lo interactivo tampoco está (se ve el placeholder de un campo, si no).
    if (conLlegada && s.inicio === null && a.pieza.forma !== 'texto' && a.css !== SIN_ARMAR) a.pieza.elemento.style.transform = a.css = SIN_ARMAR
    if (a.grupo.visible) d = Math.min(d, profundidadDeLaPieza(CAMARA_SIN_EL_MOUSE, a.medida.caja.x - scrollX + (c.izquierda + c.derecha) / 2, arriba + c.abajo, cuadro.ancho, cuadro.alto))
  }
  let sombras = 0
  for (const a of s.armadas) {
    if (!a.grupo.visible) continue
    const izquierda = a.medida.caja.x - scrollX
    const arriba = a.medida.caja.y - scrollY
    a.d = d
    a.mundoPorPx = colocarLaPieza(a.grupo, CAMARA_SIN_EL_MOUSE, izquierda, arriba, cuadro.ancho, cuadro.alto, d)
    if (conLlegada) aplicarLaLlegada(a.grupo, a.llegada, cuantoLeFalta(desdeElInicioS, a.llegada))
    const pedido = cuantoSeHunde(a.delHundido === null ? undefined : HUNDIDOS.get(a.delHundido), HUNDIDA_DEL_PIE.encima / HUNDIDA_DEL_PIE.apretada) * HUNDIDA_DEL_PIE.apretada
    a.hundido = s.quieto ? pedido : pedido + (a.hundido - pedido) * Math.exp(-dt / HUNDIDA_DEL_PIE.tau)
    a.cuerpo.position.z = -a.hundido
    a.grupo.updateMatrixWorld(true)
    if (a.pieza.forma !== 'texto') seguirLaPieza(a, viva, cuadro, izquierda, arriba, s)
    if (sombras < MAXIMO_DE_SOMBRAS_DEL_PIE) sombras = sombraDe(a, sombras)
  }
  SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = sombras
}

/** Mide todas las piezas; arma las nuevas y las que cambiaron de forma, y suelta las que se fueron. */
function rearmar(s: Estado, raiz: THREE.Group, material: THREE.Material): void {
  const antes = new Map(s.armadas.map((a) => [a.pieza.id, a]))
  const ahora: Armada[] = []
  for (const [k, p] of [...PIEZAS_DEL_PIE.values()].sort((a, b) => a.orden - b.orden).entries()) {
    const medida = medirLaPieza(p.elemento, p.forma)
    const firma = firmaDeLaForma(medida)
    const vieja = antes.get(p.id)
    if (vieja !== undefined && vieja.pieza === p && vieja.firma === firma) {
      vieja.medida = medida
      antes.delete(p.id)
      ahora.push(vieja)
      continue
    }
    const a = armar(p, medida, firma, material, k)
    if (vieja !== undefined) a.hundido = vieja.hundido
    raiz.add(a.grupo)
    ahora.push(a)
  }
  for (const a of antes.values()) {
    raiz.remove(a.grupo)
    soltar(a)
  }
  s.armadas = ahora
}

function armar(pieza: PiezaDelPie, medida: MedidaDeLaPieza, firma: string, material: THREE.Material, indice: number): Armada {
  const { fija, hundible, espesor } = armarLaPieza(pieza.forma, medida, FUENTES)
  const grupo = new THREE.Group()
  const cuerpo = new THREE.Group()
  grupo.add(cuerpo)
  grupo.name = `pie de volumen · ${pieza.forma}`
  const mallas: THREE.Mesh[] = []
  for (const [geo, padre] of [[fija, grupo], [hundible, cuerpo]] as const) {
    if (geo === null) continue
    const malla = new THREE.Mesh(geo, material)
    padre.add(malla)
    mallas.push(malla)
  }
  grupo.visible = false
  if (pieza.forma !== 'texto') pieza.elemento.style.transformOrigin = '0 0'
  const delHundido = pieza.forma === 'placa' ? pieza.elemento : pieza.forma === 'formulario' ? pieza.elemento.querySelector('[data-forma="principal"]') : null
  return { pieza, medida, firma, grupo, cuerpo, mallas, espesor, contenido: contenidoDe(pieza.forma, medida), delHundido, llegada: llegadaDe(indice), hundido: 0, css: '', d: 0, mundoPorPx: 0 }
}

function soltar(a: Armada): void {
  a.grupo.removeFromParent()
  for (const malla of a.mallas) malla.geometry.dispose()
  if (a.pieza.forma !== 'texto') {
    a.pieza.elemento.style.transform = ''
    a.pieza.elemento.style.transformOrigin = ''
  }
}

/** Lo interactivo, sobre la cara de su pieza como la ve la cámara viva (la placa, hundida con ella). */
function seguirLaPieza(a: Armada, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, izquierda: number, arriba: number, s: Estado): void {
  const { ancho, alto } = a.medida.caja
  caraEnElCuadro(a.pieza.forma === 'placa' ? a.cuerpo : a.grupo, viva, ancho, alto, 0, cuadro, { x: izquierda, y: arriba }, s.cuadrilatero)
  if (!homografia(ancho, alto, s.cuadrilatero, s.matriz)) return
  const css = matrix3dCss(s.matriz)
  if (css === a.css) return
  a.css = css
  a.pieza.elemento.style.transform = css
}

/** La sombra de la pieza en el piso: debajo de su borde de abajo (y de la mitad de su espesor), con su ancho. */
function sombraDe(a: Armada, n: number): number {
  const c = a.contenido
  PUNTO.set((c.izquierda + c.derecha) / 2, -c.abajo, -a.espesor / 2).applyMatrix4(a.grupo.matrixWorld)
  const { alfa, blanda } = formaDeLaSombra(PUNTO.y - FLOOR_Y)
  if (alfa < 0.01) return n
  const mpp = a.mundoPorPx
  SOMBRAS_DEL_PIE.uSombrasDelPie.value[n].set(PUNTO.x, PUNTO.z, ((c.derecha - c.izquierda) / 2) * mpp + SOMBRA_DEL_PIE.sobra, (a.espesor / 2) * mpp + SOMBRA_DEL_PIE.sobra)
  SOMBRAS_DEL_PIE.uFormaDeLasSombrasDelPie.value[n].set(blanda, alfa, 0, 0)
  return n + 1
}

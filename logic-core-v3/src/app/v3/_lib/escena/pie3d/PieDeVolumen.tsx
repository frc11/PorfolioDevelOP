'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { PIEZAS_DEL_PIE, marcarElPieListo, suscribirALasPiezas, versionDeLasPiezas } from '../../pie3d/registro'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearElEstudio } from '../estudio'
import { calentar } from '../gpu/Precompilar'
import { ONDA_PEDIDA } from '../interfaz/pedidos'
import { alCuadro, rearmar, soltar, type EstadoDelPie } from './armadas'
import { materialDelPie } from './material'
import { SOMBRAS_DEL_PIE } from './sombras'

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
 * errores, «Enviando…»); se compila una vez y recién ahí el DOM apaga lo que el 3D dibuja (`marcarElPieListo`). Lo que se arma y lo que pasa en cada cuadro, en `armadas.ts`.
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
}

type VentanaDelBanco = Window & { __pieDelBanco?: { piezas: () => unknown; ondas: () => number } }

export default function PieDeVolumen({ keyLightRef }: Props) {
  const version = useSyncExternalStore(suscribirALasPiezas, versionDeLasPiezas, versionDeLasPiezas)
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const m = useRef<EstadoDelPie>({ armadas: [], material: null, quieto: false, fuentes: false, compilando: false, listo: false, montado: false, prueba: 'no', inicio: null, cuadrilatero: [], matriz: [] })

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

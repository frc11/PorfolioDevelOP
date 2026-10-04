'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { ESCENAS_APARTE } from '../gpu/Precompilar'
import { KEY_INTENSITY } from '../probeLighting'
import { crearMapaDeLaSombra } from '../sombra/delLogo'
import { SOMBRA_DE_LOS_TITULOS, SOMBRA_DE_LOS_TITULOS_EN_VIVO, ajustarLaCamara, direccionDeLaLuz, fuerzasDeLaSombra, materialDeLaSombraDelTitulo } from '../sombra/deLosTitulos'
import type { Armado } from './armado'
import { FORMA_DE_LAS_LETRAS, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, llegadaNormalGlsl, llegadaParsGlsl, llegadaPosicionGlsl, mismaLlegada } from './llegada'

/**
 * [PASADA FINAL] C3 · LA SOMBRA DE LOS TÍTULOS, EN CADA CUADRO — con la prueba `sombratitulos=si` (la monta
 * `TitulosDeVolumen`). Cada título armado tiene su copia en la escena del mapa (su geometría, con un material que repite
 * su llegada y su disuelto: `sombra/deLosTitulos.ts`), con su matriz copiada en cada cuadro; la cámara de la luz abraza
 * a los que se ven, desde el sol de día y desde arriba de noche (el haz). Sin luz (o sin títulos a la vista), no se dibuja.
 */
interface Props {
  readonly armados: () => readonly Armado[]
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
}

interface Copia {
  readonly copia: THREE.Mesh
  readonly material: THREE.ShaderMaterial
}

type VentanaDelBanco = Window & { __sombraDeLosTitulosDelBanco?: { poner: (prendida: boolean) => void; estado: () => { readonly dia: number; readonly noche: number; readonly copias: number; readonly radio: number } } }

export function SombraDeLosTitulos({ armados, keyLightRef }: Props) {
  const gl = useThree((s) => s.gl)
  const mapa = useMemo(() => crearMapaDeLaSombra(SOMBRA_DE_LOS_TITULOS, 'sombra de los títulos'), [])
  const m = useRef({ copias: new Map<Armado, Copia>(), esfera: new THREE.Sphere(), caja: new THREE.Box3(), unaCaja: new THREE.Box3(), direccion: new THREE.Vector3(), apagada: false, fuerzas: { dia: 0, noche: 0 } })

  useEffect(() => {
    const u = SOMBRA_DE_LOS_TITULOS_EN_VIVO
    u.uMapaDeLosTitulos.value = mapa.bufer.texture
    const aparte = { escena: mapa.escena, bufer: mapa.bufer }
    ESCENAS_APARTE.add(aparte)
    ESCENAS_APARTE.add(mapa.desenfoque)
    const copias = m.current.copias
    return () => {
      ESCENAS_APARTE.delete(aparte)
      ESCENAS_APARTE.delete(mapa.desenfoque)
      for (const c of copias.values()) c.material.dispose()
      copias.clear()
      u.uMapaDeLosTitulos.value = null
      u.uHayDeLosTitulos.value = 0
      u.uFuerzaDeLosTitulos.value = 0
      u.uNocheDeLosTitulos.value = 0
      mapa.soltar()
    }
  }, [mapa])

  // Con banco: prenderla y apagarla en la misma tarea (para compararla en el mismo cuadro) y lo que está pasando.
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__sombraDeLosTitulosDelBanco = {
      poner: (prendida) => {
        m.current.apagada = !prendida
      },
      estado: () => ({ dia: m.current.fuerzas.dia, noche: m.current.fuerzas.noche, copias: m.current.copias.size, radio: m.current.esfera.radius }),
    }
    return () => {
      delete ventana.__sombraDeLosTitulosDelBanco
    }
  }, [])

  useFrame(() => {
    const principal = keyLightRef.current
    const u = SOMBRA_DE_LOS_TITULOS_EN_VIVO
    const s = m.current
    if (principal === null) return
    // Las copias: una por título armado (las de los que se soltaron, afuera).
    const lista = armados()
    for (const [a, c] of s.copias) {
      if (lista.includes(a)) continue
      mapa.escena.remove(c.copia)
      c.material.dispose()
      s.copias.delete(a)
    }
    for (const a of lista) if (!s.copias.has(a)) s.copias.set(a, copiar(a, mapa.escena))
    const fuerzas = fuerzasDeLaSombra(principal.intensity / KEY_INTENSITY, VIVO.uNocheDelLogo.value)
    s.fuerzas = fuerzas
    // Lo que se ve: la esfera que abraza a los títulos a la vista.
    s.caja.makeEmpty()
    for (const [a, c] of s.copias) {
      c.copia.visible = a.malla.visible
      if (!a.malla.visible) continue
      a.malla.updateWorldMatrix(true, false)
      c.copia.matrixWorld.copy(a.malla.matrixWorld)
      const g = a.malla.geometry
      if (g.boundingBox === null) g.computeBoundingBox()
      if (g.boundingBox !== null) s.caja.union(s.unaCaja.copy(g.boundingBox).applyMatrix4(a.malla.matrixWorld))
    }
    const hay = !s.apagada && !s.caja.isEmpty() && Math.max(fuerzas.dia, fuerzas.noche) > 0.001
    u.uHayDeLosTitulos.value = hay ? 1 : 0
    u.uFuerzaDeLosTitulos.value = hay ? fuerzas.dia : 0
    u.uNocheDeLosTitulos.value = hay ? fuerzas.noche : 0
    if (!hay) return
    s.caja.getBoundingSphere(s.esfera)
    ajustarLaCamara(mapa.camara, s.esfera, direccionDeLaLuz(principal.position, VIVO.uNocheDelLogo.value, s.direccion))
    u.uVistaDeLosTitulos.value.copy(mapa.camara.matrixWorldInverse)
    u.uLuzDeLosTitulos.value.multiplyMatrices(mapa.camara.projectionMatrix, mapa.camara.matrixWorldInverse)
    const previo = gl.getRenderTarget()
    gl.setRenderTarget(mapa.bufer)
    gl.render(mapa.escena, mapa.camara)
    mapa.desenfocar(gl)
    gl.setRenderTarget(previo)
  })
  return null
}

/** La copia de un título en la escena del mapa: su geometría, con su llegada y sus uniformes (los mismos objetos). */
function copiar(a: Armado, escena: THREE.Scene): Copia {
  const forma = a.titulo.forma ?? FORMA_DE_LAS_LETRAS
  const propia = !mismaLlegada(forma, FORMA_DE_LAS_LETRAS)
  const llegada = propia ? { pars: llegadaParsGlsl(forma), normal: llegadaNormalGlsl(forma), posicion: llegadaPosicionGlsl(forma) } : { pars: LLEGADA_PARS_GLSL, normal: LLEGADA_NORMAL_GLSL, posicion: LLEGADA_POSICION_GLSL }
  const material = materialDeLaSombraDelTitulo(llegada, a.uniforms)
  const copia = new THREE.Mesh(a.malla.geometry, material)
  copia.name = `sombra de los títulos · ${a.titulo.id}`
  // Su matriz es la del título, copiada en cada cuadro; las letras salen de su caja: sin descarte por encuadre.
  copia.matrixAutoUpdate = false
  copia.matrixWorldAutoUpdate = false
  copia.frustumCulled = false
  escena.add(copia)
  return { copia, material }
}

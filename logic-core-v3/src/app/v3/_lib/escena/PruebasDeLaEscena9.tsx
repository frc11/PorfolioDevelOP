'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, lazy, useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from './entorno'
import { ESTUDIO_EN_VIVO } from './estudio'
import { ESCENAS_APARTE } from './gpu/Precompilar'
import { CAPA_DEL_BLOOM, CAPA_DEL_POLVO, LOS_QUE_BRILLAN, crearPosproceso } from './gpu/posproceso'
import { VIVO } from './entorno/vivo'
import { KEY_INTENSITY } from './probeLighting'
import { SOMBRA_DEL_LOGO, SOMBRA_EN_VIVO, crearMapaDeLaSombra } from './sombra/delLogo'

/**
 * [ESCENA 9] LAS PRUEBAS DE T3 Y T5 QUE CORREN POR CUADRO — un solo montaje en `ProbeStage` (que no pasa de 300
 * líneas), y cada una sólo con su bandera: sin ninguna, no se monta nada.
 */

/** T5 · los títulos en la escena: un módulo aparte que sólo se descarga con `titulos=webgl` (troika no viaja con la escena). */
const TitulosEnLaEscena = lazy(() => import('./titulos/TitulosEnLaEscena'))
interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

export function PruebasDeLaEscena9(props: Props) {
  const { pruebas } = entornoDeLaEscena()
  return (
    <>
      {pruebas.materialDelLogo !== 'no' ? <ReflejosDelLogo {...props} /> : null}
      {pruebas.sombraDelLogo ? <SombraDelLogo {...props} /> : null}
      {pruebas.bloom || pruebas.aa !== 'no' ? <Posproceso /> : null}
      {pruebas.titulos === 'webgl' ? (
        <Suspense fallback={null}>
          <TitulosEnLaEscena />
        </Suspense>
      ) : null}
    </>
  )
}

/**
 * T3 · los reflejos del estudio siguen a la luz de la sala: cuánto se ven es el nivel de la principal en este cuadro
 * (de noche la sala se apaga y el estudio también). La variante (y el «como el producto» del banco) la pone `estudio.ts`.
 */
function ReflejosDelLogo({ keyLightRef, logoMaterialRef }: Props) {
  useFrame(() => {
    const material = logoMaterialRef.current
    const principal = keyLightRef.current
    if (material === null || principal === null) return
    ESTUDIO_EN_VIVO.nivel = Math.min(1, principal.intensity / KEY_INTENSITY)
    material.envMapIntensity = ESTUDIO_EN_VIVO.reflejos * ESTUDIO_EN_VIVO.nivel
  })
  return null
}

/**
 * T3 · la sombra proyectada: en cada cuadro, el mapa de profundidad del logo visto desde la principal (`sombra/delLogo.ts`)
 * y cuánto oscurece (el nivel de la principal). Las copias de las mallas del logo se arman una vez; nada se reserva por
 * cuadro. Su escena se precompila con el resto (`ESCENAS_APARTE`).
 */
function SombraDelLogo({ keyLightRef, logoGroupRef }: Props) {
  const gl = useThree((s) => s.gl)
  const mapa = useMemo(() => crearMapaDeLaSombra(), [])
  const memoria = useRef({ copias: [] as { readonly origen: THREE.Object3D; readonly copia: THREE.Mesh }[], centro: new THREE.Vector3(), direccion: new THREE.Vector3(), fuerza: 0 })
  useEffect(() => {
    // Con banco: la sombra se prende y se apaga en la misma tarea (para compararla en el mismo cuadro).
    if (!hayBanco()) return undefined
    const ventana = window as Window & { __sombraDelLogoDelBanco?: { poner: (prendida: boolean) => void; mapa: () => { tapados: number; minimo: number }; depurar: () => unknown } }
    ventana.__sombraDelLogoDelBanco = {
      poner: (prendida) => {
        SOMBRA_EN_VIVO.uFuerzaDeLaSombra.value = prendida ? memoria.current.fuerza : 0
      },
      depurar: () => ({ hijos: mapa.escena.children.length, camara: mapa.camara.position.toArray(), primera: mapa.escena.children[0]?.matrixWorld.elements.slice(12, 15) ?? null, fuerza: memoria.current.fuerza, visible: mapa.escena.children[0]?.visible ?? null }),
      // Cuántos texeles del mapa tapa el logo y la profundidad más cercana (0 a 1).
      mapa: () => {
        const lado = SOMBRA_DEL_LOGO.resolucion
        const datos = new Float32Array(lado * lado * 4) // banco
        gl.readRenderTargetPixels(mapa.bufer, 0, 0, lado, lado, datos)
        let [tapados, minimo] = [0, 1]
        for (let k = 0; k < datos.length; k += 4) {
          const v = datos[k]
          if (v < 0.999) tapados += 1
          minimo = Math.min(minimo, v)
        }
        return { tapados, minimo }
      },
    }
    return () => {
      delete ventana.__sombraDelLogoDelBanco
    }
  }, [gl, mapa])
  useEffect(() => {
    SOMBRA_EN_VIVO.uMapaDeLaSombra.value = mapa.bufer.texture
    const aparte = { escena: mapa.escena, bufer: mapa.bufer }
    ESCENAS_APARTE.add(aparte)
    ESCENAS_APARTE.add(mapa.desenfoque)
    return () => {
      ESCENAS_APARTE.delete(aparte)
      ESCENAS_APARTE.delete(mapa.desenfoque)
      SOMBRA_EN_VIVO.uMapaDeLaSombra.value = null
      SOMBRA_EN_VIVO.uFuerzaDeLaSombra.value = 0
      mapa.soltar()
    }
  }, [mapa])
  useFrame(() => {
    const logo = logoGroupRef.current
    const principal = keyLightRef.current
    if (logo === null || principal === null) return
    const m = memoria.current
    if (m.copias.length === 0) {
      logo.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        const copia = new THREE.Mesh(o.geometry, mapa.material) // una vez
        copia.name = 'sombra del logo · copia'
        // Su matriz es la del logo, copiada en cada cuadro: que el dibujo de la escena no la recalcule (quedaba la identidad).
        copia.matrixAutoUpdate = false
        copia.matrixWorldAutoUpdate = false
        mapa.escena.add(copia)
        m.copias.push({ origen: o, copia }) // una vez
      })
    }
    // De noche la principal no llega a cero (el nivel de la noche es 0,04): una sombra de menos del 3 % no se ve, y no se dibuja.
    const cruda = SOMBRA_DEL_LOGO.fuerza * Math.min(1, principal.intensity / KEY_INTENSITY)
    const fuerza = cruda < 0.03 ? 0 : cruda
    m.fuerza = fuerza
    SOMBRA_EN_VIVO.uFuerzaDeLaSombra.value = fuerza
    if (fuerza < 0.001) return
    logo.updateMatrixWorld(true)
    for (const { origen, copia } of m.copias) copia.matrixWorld.copy(origen.matrixWorld)
    // La cámara de la luz: desde la principal, mirando al logo, a media caja de distancia.
    logo.getWorldPosition(m.centro)
    m.direccion.copy(principal.position).normalize()
    mapa.camara.position.copy(m.centro).addScaledVector(m.direccion, SOMBRA_DEL_LOGO.lejos / 2)
    mapa.camara.lookAt(m.centro)
    mapa.camara.updateMatrixWorld()
    SOMBRA_EN_VIVO.uVistaDeLaSombra.value.copy(mapa.camara.matrixWorldInverse)
    SOMBRA_EN_VIVO.uLuzDeLaSombra.value.multiplyMatrices(mapa.camara.projectionMatrix, mapa.camara.matrixWorldInverse)
    const previo = gl.getRenderTarget()
    gl.setRenderTarget(mapa.bufer)
    gl.render(mapa.escena, mapa.camara)
    // La penumbra: el mapa de varianza desenfocado (dos pasadas, a baja resolución).
    mapa.desenfocar(gl)
    gl.setRenderTarget(previo)
  })
  return null
}

/**
 * T3 · el posproceso (bloom de noche, TAA u 8 muestras: `gpu/posproceso.ts`): toma el dibujo de la escena (prioridad 1:
 * r3f deja de dibujar solo) y lo pasa por sus pasos. La noche es la del entorno (`VIVO.uNoche`).
 */
function Posproceso() {
  const { pruebas } = entornoDeLaEscena()
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const pp = useMemo(() => crearPosproceso({ bloom: pruebas.bloom, aa: pruebas.aa }), [pruebas])
  useEffect(() => {
    ESCENAS_APARTE.add(pp.aparte)
    const ventana = window as Window & { __posprocesoDelBanco?: typeof pp.banco & { dibujar: () => void; pasos: (n: number) => Promise<Record<string, number>> } }
    // Con banco: la fuerza del bloom, el TAA, un dibujo entero (la escena y los pasos) para el mismo cuadro, y lo que
    // cuesta cada paso.
    const dibujo = (): void => pp.dibujar(gl, escena, camara, VIVO.uNoche.value)
    if (hayBanco()) ventana.__posprocesoDelBanco = Object.assign(pp.banco, { dibujar: dibujo, pasos: (n: number) => pp.banco.medirPasos(gl, dibujo, n) })
    return () => {
      ESCENAS_APARTE.delete(pp.aparte)
      delete ventana.__posprocesoDelBanco
      pp.soltar()
    }
  }, [pp, gl, escena, camara])
  // Con el bloom, lo que brilla va también en su capa (cuando existe; la fugaz y las estrellas pueden llegar después). Con
  // el TAA, el polvo va SOLO en la suya (se dibuja encima, después de resolverlo). Todo vuelve a la capa 0 al desmontar.
  const marcados = useRef(new Set<THREE.Object3D>())
  const polvo = useRef(new Set<THREE.Object3D>())
  useEffect(
    () => () => {
      for (const o of marcados.current) o.traverse((x) => x.layers.disable(CAPA_DEL_BLOOM))
      for (const o of polvo.current) o.traverse((x) => x.layers.set(0))
      marcados.current.clear()
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
    if (pruebas.bloom && marcados.current.size < LOS_QUE_BRILLAN.length) {
      for (const nombre of LOS_QUE_BRILLAN) {
        const o = state.scene.getObjectByName(nombre)
        if (o === undefined || marcados.current.has(o)) continue
        o.traverse((x) => x.layers.enable(CAPA_DEL_BLOOM))
        marcados.current.add(o)
      }
    }
    pp.dibujar(state.gl, state.scene, state.camera, VIVO.uNoche.value)
  }, 1)
  return null
}

'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from './entorno'
import { VIVO } from './entorno/vivo'
import { ESCENAS_APARTE } from './gpu/Precompilar'
import { KEY_INTENSITY } from './probeLighting'
import { SOMBRA_DEL_LOGO, SOMBRA_EN_EL_FINAL, SOMBRA_EN_VIVO, crearMapaDeLaSombra } from './sombra/delLogo'
import { conElRimDeLaLuz } from './final/rimDeLaLuz'

/**
 * [ESCENA 10] T1 · LA LUZ DEL LOGO — lo que de ESCENA 9 (T3) pasó al producto y corre por cuadro: los reflejos del
 * estudio en el negro satinado (`estudio.ts`) y la sombra del logo sobre el piso vivo (`sombra/delLogo.ts`). Un solo
 * montaje en `ProbeStage` (que no pasa de 300 líneas); el banco los apaga con `material=no` y `sombra-logo=no`.
 */
interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly logoGroupRef: RefObject<THREE.Group | null>
  /** [PULIDO 1] P22 · abajo de 1024: el mapa de la sombra a la mitad de resolución (el costo del teléfono). */
  readonly compacta?: boolean
}

export function LuzDelLogo(props: Props) {
  const e = entornoDeLaEscena()
  return (
    <>
      {e.materialDelLogo ? <ReflejosDelLogo {...props} /> : null}
      {e.sombraDelLogo && e.pisoVivo ? <SombraDelLogo {...props} /> : null}
      {/* [PULIDO 3B] B0 · el logo brilla con la energía: su filo y el pulso de cada onda (`final/rimDeLaLuz.ts`). */}
      <RimDelLogo logoMaterialRef={props.logoMaterialRef} />
    </>
  )
}

/** [PULIDO 3] A1 · parchea el logo una vez (cuando su material existe) con el brillo de la energía. */
function RimDelLogo({ logoMaterialRef }: Pick<Props, 'logoMaterialRef'>) {
  const parcheado = useRef<THREE.MeshStandardMaterial | null>(null)
  useFrame(() => {
    const material = logoMaterialRef.current
    if (material === null || parcheado.current === material) return
    conElRimDeLaLuz(material)
    parcheado.current = material
  })
  return null
}

/** Los reflejos del estudio siguen a la luz de la sala: cuánto se ven es el nivel de la principal (de noche, nada). */
function ReflejosDelLogo({ keyLightRef, logoMaterialRef }: Props) {
  useFrame(() => {
    const material = logoMaterialRef.current
    const principal = keyLightRef.current
    if (material === null || principal === null) return
    material.envMapIntensity = Math.min(1, principal.intensity / KEY_INTENSITY)
  })
  return null
}

/**
 * La sombra proyectada: en cada cuadro, el mapa de profundidad del logo visto desde la principal y cuánto oscurece.
 * Cuánto: el nivel de la principal por el día que hay en el logo (`VIVO.uNocheDelLogo`), así que se va con la noche y
 * vuelve cuando el frente del amanecer alcanza al logo, sin saltos; de noche vale cero y no se dibuja. Las copias de las
 * mallas del logo se arman una vez; nada se reserva por cuadro. Su escena se precompila con el resto (`ESCENAS_APARTE`).
 */
function SombraDelLogo({ keyLightRef, logoGroupRef, compacta = false }: Props) {
  const gl = useThree((s) => s.gl)
  const resolucion = compacta ? SOMBRA_DEL_LOGO.resolucion / 2 : SOMBRA_DEL_LOGO.resolucion
  const mapa = useMemo(() => crearMapaDeLaSombra({ ...SOMBRA_DEL_LOGO, resolucion }), [resolucion])
  const memoria = useRef({ copias: [] as { readonly origen: THREE.Object3D; readonly copia: THREE.Mesh }[], centro: new THREE.Vector3(), direccion: new THREE.Vector3(), fuerza: 0 })
  useEffect(() => {
    // Con banco: la sombra se prende y se apaga en la misma tarea (para compararla en el mismo cuadro).
    if (!hayBanco()) return undefined
    const ventana = window as Window & { __sombraDelLogoDelBanco?: { poner: (prendida: boolean) => void; fuerza: () => number; mapa: () => { tapados: number; minimo: number } } }
    ventana.__sombraDelLogoDelBanco = {
      poner: (prendida) => {
        SOMBRA_EN_VIVO.uFuerzaDeLaSombra.value = prendida ? memoria.current.fuerza : 0
      },
      fuerza: () => memoria.current.fuerza,
      // Cuántos texeles del mapa tapa el logo y la profundidad más cercana (0 a 1).
      mapa: () => {
        const lado = resolucion
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
  }, [gl, mapa, resolucion])
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
    // [NOCTURNO FINAL] B1 · y se apaga con el logo en el aire (cuando cae al cargar): lejos del piso, estirada, cruzaba el cuadro.
    const enElAire = Math.min(1, Math.max(0, (logo.position.y - SOMBRA_DEL_LOGO.aire[0]) / (SOMBRA_DEL_LOGO.aire[1] - SOMBRA_DEL_LOGO.aire[0])))
    // [PULIDO 2] 6 · y por el fundido del final (al rebobinar, el logo sale del hueco en cinco cuadros).
    const fuerza = SOMBRA_DEL_LOGO.fuerza * Math.min(1, principal.intensity / KEY_INTENSITY) * (1 - VIVO.uNocheDelLogo.value) * (1 - enElAire) * SOMBRA_EN_EL_FINAL.fundido
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

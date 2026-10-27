'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from './entorno'
import { ANISOTROPIA_DE_LAS_TRAMAS } from './gpu/anisotropia'
import { fijarLaEntradaDelMoire, hayEntradaDeAfuera, laEntradaDelMoire, type PosicionDeLaEntrada } from './moire/entrada'
import { conElAmanecer } from './amanecer/luz'
import { conPliegue } from './espejo/pliegue'
import { bandEnvelope, createGridCellData } from './moireTextures'
import {
  MOIRE_BASE_ALPHA,
  MOIRE_COARSE_CELLS,
  MOIRE_COLOR,
  MOIRE_FADE,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_ORDER,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_HEIGHT_SEGMENTS,
  MOIRE_OPACITY,
  MOIRE_SEGMENTS,
  MOIRE_TILE_SIZE,
  lineDuty,
  verticalRepeat,
} from './probeMoire'
import { FLOOR_Y } from './probeScene'
import { TRAMA_ANCLADA, ZOCALO, LIMITE } from './moire/limite'

/**
 * LA ENVOLVENTE DE RENDIJAS — un cilindro, la cámara adentro.
 *
 * Los números y el porqué de cada uno están en `probeMoire.ts`; acá está el
 * cableado. **Un draw call, una superficie transparente.** [C2-31m] Era la
 * variante `?moire=mouse` y es la única: la capa gruesa (la retícula del hero) en
 * la pared, corrida por el puntero (`moire/MoireDelMouse.tsx`). La capa fina y el
 * desajuste que la redefinía (las variantes `0`, `1` y `2`) se borraron.
 *
 * ── `MeshLambertMaterial`, la excepción heredada de S7 ─────────────────────
 *
 * La regla de la escena es que todo sea `meshStandardMaterial` para que la sala
 * entera se apague con el arco. Ésta es una de las piezas con Lambert, y la
 * razón es de costo: es una de las superficies que más área de pantalla cubren con
 * mezcla encendida (57% del cuadro en promedio, 100% en el pico), así que
 * su shader se paga sobre medio cuadro y encima con blending. Lo que la regla
 * protege se conserva entero: Lambert responde a las mismas tres luces, al mismo
 * hemisférico y a la misma niebla, así que se apaga con el arco igual. Lo único
 * que no calcula es el lóbulo especular, que una pantalla mate no tiene.
 *
 * ── `BackSide` ─────────────────────────────────────────────────────────────
 *
 * La cámara está siempre adentro del cilindro. Con `BackSide` three
 * dibuja las caras internas y además **invierte la normal** al sombrear
 * (`FLIP_SIDED`), o sea que la superficie se ilumina como lo que es: una pared
 * mirando hacia adentro.
 *
 * ── La envolvente va en el ALFA DE VÉRTICE ─────────────────────────────────
 *
 * `vertexColors` con un atributo de 4 componentes activa `USE_COLOR_ALPHA` en
 * three 0.182, y `color_fragment` hace `diffuseColor *= vColor`: el alfa del
 * vértice multiplica al del material. Con el RGB en 1, lo único que aporta es el
 * desvanecido de los bordes de la banda.
 *
 * **Y tiene que ser de la geometría y no de la textura**, porque la capa
 * corre su `offset` con el puntero: una envolvente horneada en la textura se
 * movería con ella.
 */

export type MoireHandle = {
  /** La capa (la gruesa, en la pared). [B8] Quieta salvo el corrimiento que le escribe `MoireDelMouse`. */
  readonly gruesa: THREE.Texture
  /** [B8] Si se dibuja (no con `fondo=cristal`): lo que leen las estrellas, la fugaz y el amanecer (`estrellas/trama.ts`). */
  readonly dibuja: boolean
  readonly radio: number
  /**
   * [ESCENA 7] Dónde está la capa (abajo, arriba, fundido de abajo y de arriba, fracción del alto):
   * el cielo de afuera lee la trama para quedar detrás (`estrellas/cielo.ts`).
   */
  readonly banda: readonly [number, number, number, number]
}

/** [C2-31m] Lo que lee y escribe el banco (`scripts-carga/moire.ts`): el corrimiento de la capa, la entrada, y fijar una de afuera. */
interface MoireDelBanco {
  /** `entrada`: la de afuera (0, 0 si no hay: manda el mouse). */
  readonly estado: () => { readonly dibuja: boolean; readonly gruesa: number[]; readonly entrada: { readonly x: number; readonly y: number; readonly deAfuera: boolean } }
  readonly fijarLaEntrada: (p: PosicionDeLaEntrada | null) => void
}
type VentanaDelBanco = Window & { __moireDelBanco?: MoireDelBanco }

type LayerSpec = {
  readonly radius: number
  readonly bottom: number
  readonly top: number
  readonly cells: number
  readonly order: number
  /** [ESCENA 5] El desvanecido de abajo, si no es el de siempre. [ESCENA 8] 0: ninguno (anclada, T2). */
  readonly fadeBottom?: number
}

/**
 * [ESCENA 5] CON LA FORMACIÓN, LA TRAMA LLEGA AL PISO — el cilindro se para sobre el escenario, como
 * en el dibujo: la capa baja hasta el piso y el desvanecido de abajo se acorta. Sin esto las
 * copias (paradas un piso más abajo, a 60 o más de la cámara) quedan justo debajo de la banda y la
 * trama no las tapa. Arriba no cambia nada.
 */
export const TRAMA_HASTA_EL_PISO = { abajo: FLOOR_Y + 0.02, fundido: 0.035 } as const

/** Cilindro abierto con el desvanecido de banda en el alfa de vértice. */
function buildLayerGeometry(spec: LayerSpec): THREE.CylinderGeometry {
  const height = spec.top - spec.bottom
  const geometry = new THREE.CylinderGeometry(
    spec.radius,
    spec.radius,
    height,
    MOIRE_SEGMENTS,
    MOIRE_HEIGHT_SEGMENTS,
    true
  )

  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 4)
  for (let i = 0; i < position.count; i += 1) {
    // El cilindro nace centrado en su propio origen: y va de −h/2 a +h/2.
    const v = (position.getY(i) + height / 2) / height
    colors[i * 4] = 1
    colors[i * 4 + 1] = 1
    colors[i * 4 + 2] = 1
    // [ESCENA 8] T2: anclada, abajo no hay fundido (el alfa de vértice lo estiraba a todo el primer tramo): la corta el piso.
    colors[i * 4 + 3] = spec.fadeBottom === 0 && v < 0.5 ? 1 : bandEnvelope(v, spec.fadeBottom !== undefined && v < 0.5 ? spec.fadeBottom : MOIRE_FADE)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))

  return geometry
}

function buildTexture(data: Uint8Array): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    data,
    MOIRE_TILE_SIZE,
    MOIRE_TILE_SIZE,
    THREE.RGBAFormat
  )
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  // Mipmaps + anisotropía: el seguro contra ventanas chicas y DPR alto. En el
  // caso medido sobran 26 veces, pero no cuestan nada en el caso normal — y son
  // lo que hace que la línea rasante degrade a gris en vez de titilar.
  // [PULIDO 19] Q4 · la anisotropía al máximo de la placa (`gpu/anisotropia.ts`; era 4).
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = ANISOTROPIA_DE_LAS_TRAMAS
  texture.needsUpdate = true
  return texture
}

function applyRepeat(texture: THREE.Texture, spec: LayerSpec): void {
  texture.repeat.set(
    spec.cells,
    verticalRepeat(spec.radius, spec.cells, spec.top - spec.bottom)
  )
}

type MoireScreenProps = {
  /** [ESCENA 5] Con la formación, la trama baja hasta el escenario (`TRAMA_HASTA_EL_PISO`). */
  hastaElPiso?: boolean
}

export const MoireScreen = forwardRef<MoireHandle, MoireScreenProps>(function MoireScreen(
  { hastaElPiso = false },
  ref
) {
  // [ESCENA 8] T2: con la formación y la bandera, la capa baja a pleno hasta debajo del piso.
  const anclada = hastaElPiso && entornoDeLaEscena().limite
  // [PULIDO 20] R2 · `fondo=espejo`: el cristal solo, sin la trama (la capa y el zócalo no se dibujan; [B8] y nada la lee).
  const conTrama = entornoDeLaEscena().pruebas['sin-moire'] !== 'si'
  const capa = useMemo(() => {
    const abajo = anclada ? TRAMA_ANCLADA.abajo : TRAMA_HASTA_EL_PISO.abajo
    const fundido = anclada ? 0 : TRAMA_HASTA_EL_PISO.fundido
    const spec: LayerSpec = {
      radius: MOIRE_FAR_RADIUS,
      bottom: hastaElPiso ? abajo : MOIRE_FAR_BOTTOM,
      top: MOIRE_FAR_TOP,
      fadeBottom: hastaElPiso ? fundido : undefined,
      cells: MOIRE_COARSE_CELLS,
      order: MOIRE_FAR_ORDER,
    }
    const texture = buildTexture(createGridCellData(MOIRE_TILE_SIZE, lineDuty(spec.cells), MOIRE_BASE_ALPHA))
    applyRepeat(texture, spec)
    const material = new THREE.MeshLambertMaterial({
      color: MOIRE_COLOR,
      // [CALIDAD 1] B8: con dithering (ruido azul).
      dithering: true,
      alphaMap: texture,
      transparent: true,
      opacity: MOIRE_OPACITY,
      depthWrite: false,
      side: THREE.BackSide,
      vertexColors: true,
    })
    // [ESCENA 7] T11: con la bandera, el amanecer (no hace nada sin ella).
    conElAmanecer(material)
    // [PULIDO 18] P2 · el pliegue de la cúpula (la dimensión espejo), sólo con `?espejo=pliegue`.
    if (entornoDeLaEscena().pruebas.espejo === 'pliegue') {
      conPliegue(material)
    }
    return { spec, texture, material, geometry: buildLayerGeometry(spec) }
  }, [hastaElPiso, anclada])

  // [ESCENA 8] T2: el zócalo de la pared, del color de la trama y más denso que sus líneas.
  const zocalo = useMemo(() => {
    if (!anclada) return null
    const alto = ZOCALO.arriba - ZOCALO.abajo
    const geometry = new THREE.CylinderGeometry(ZOCALO.radio, ZOCALO.radio, alto, MOIRE_SEGMENTS, 1, true)
    const material = new THREE.MeshLambertMaterial({ color: MOIRE_COLOR, transparent: true, opacity: LIMITE.zocalo.opacidad, depthWrite: false, side: THREE.BackSide, dithering: true })
    conElAmanecer(material)
    return { geometry, material, y: ZOCALO.abajo + alto / 2 }
  }, [anclada])
  useEffect(
    () => () => {
      zocalo?.geometry.dispose()
      zocalo?.material.dispose()
    },
    [zocalo]
  )

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(
    () => () => {
      capa.geometry.dispose()
      capa.material.dispose()
      capa.texture.dispose()
    },
    [capa]
  )

  useEffect(() => {
    // [ESCENA 8] T2: sin fundido abajo, el cielo lee uno ínfimo (divide por él en el shader).
    const { spec } = capa
    const banda: readonly [number, number, number, number] = [spec.bottom, spec.top, spec.fadeBottom === 0 ? 1e-4 : (spec.fadeBottom ?? MOIRE_FADE), MOIRE_FADE]
    const handle: MoireHandle = { gruesa: capa.texture, dibuja: conTrama, radio: spec.radius, banda }
    if (typeof ref === 'function') ref(handle)
    else if (ref) ref.current = handle
    // [C2-31m] Para el banco: el corrimiento de la capa y la entrada (el mouse o la de afuera), y fijar una de afuera.
    if (hayBanco()) {
      const sinAfuera = { x: 0, y: 0 }
      ;(window as VentanaDelBanco).__moireDelBanco = {
        estado: () => {
          const e = laEntradaDelMoire(sinAfuera)
          return { dibuja: conTrama, gruesa: capa.texture.offset.toArray(), entrada: { x: e.x, y: e.y, deAfuera: hayEntradaDeAfuera() } }
        },
        fijarLaEntrada: fijarLaEntradaDelMoire,
      }
    }
  }, [ref, capa, conTrama])

  return (
    <>
      <mesh
        name="trama gruesa"
        geometry={capa.geometry}
        material={capa.material}
        renderOrder={capa.spec.order}
        position={[0, capa.spec.bottom + (capa.spec.top - capa.spec.bottom) / 2, 0]}
        visible={conTrama}
      />
      {zocalo !== null && <mesh name="zócalo" geometry={zocalo.geometry} material={zocalo.material} renderOrder={MOIRE_FAR_ORDER} position={[0, zocalo.y, 0]} visible={conTrama} />}
    </>
  )
})

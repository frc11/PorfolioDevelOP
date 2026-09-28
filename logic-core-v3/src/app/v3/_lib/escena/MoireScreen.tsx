'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from './entorno'
import { conDesajusteVivo } from './moire/parche'
import { conElAmanecer } from './amanecer/luz'
import { bandEnvelope, createDottedGridCellData, createGridCellData } from './moireTextures'
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
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_ORDER,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  MOIRE_OPACITY,
  MOIRE_SEGMENTS,
  MOIRE_TILE_SIZE,
  dotDiameter,
  fineCells,
  lineDuty,
  verticalRepeat,
} from './probeMoire'
import type { ProbeParamsStore } from './probeStore'
import { FLOOR_Y } from './probeScene'
import { TRAMA_ANCLADA, ZOCALO, LIMITE } from './moire/limite'

/**
 * LA ENVOLVENTE DE RENDIJAS — dos cilindros coaxiales, la cámara adentro.
 *
 * Los números y el porqué de cada uno están en `probeMoire.ts`; acá está el
 * cableado. **Dos draw calls, dos superficies transparentes.**
 *
 * ── `MeshLambertMaterial`, la excepción heredada de S7 ─────────────────────
 *
 * La regla de la escena es que todo sea `meshStandardMaterial` para que la sala
 * entera se apague con el arco. Éstas son las dos únicas piezas con Lambert, y la
 * razón es de costo: son las superficies que más área de pantalla cubren con
 * mezcla encendida (51% y 57% del cuadro en promedio, 100% en el pico), así que
 * su shader se paga sobre medio cuadro y encima con blending. Lo que la regla
 * protege se conserva entero: Lambert responde a las mismas tres luces, al mismo
 * hemisférico y a la misma niebla, así que se apaga con el arco igual. Lo único
 * que no calcula es el lóbulo especular, que una pantalla mate no tiene.
 *
 * ── `BackSide` ─────────────────────────────────────────────────────────────
 *
 * La cámara está siempre adentro de los dos cilindros. Con `BackSide` three
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
 * **Y tiene que ser de la geometría y no de la textura**, porque la capa gruesa
 * desplaza su `offset.y` en cada frame: una envolvente horneada en la textura se
 * movería con la deriva y el borde de la pantalla subiría y bajaría.
 */

export type MoireHandle = {
  /** La capa gruesa. El loop le escribe `offset.y` para que baje. */
  readonly drift: THREE.Texture
  /** [ESCENA 5] La capa fina: el moiré vivo le corre la fase y le cambia el desajuste (`moire/MoireVivo.tsx`). */
  readonly fina: THREE.Texture
  /** [ESCENA 5] El alto de la banda fina (con la formación llega hasta el piso): lo necesita M4. */
  readonly altoDeLaFina: number
  /**
   * [ESCENA 7] Dónde está cada capa (abajo, arriba, fundido de abajo y de arriba, fracción del alto):
   * el cielo de afuera lee la trama para quedar detrás (`estrellas/cielo.ts`).
   */
  readonly bandas: { readonly gruesa: readonly [number, number, number, number]; readonly fina: readonly [number, number, number, number] }
}

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
 * en el dibujo: las dos capas bajan hasta el piso y el desvanecido de abajo se acorta. Sin esto las
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
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 4
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
  /** De acá sale `moireMismatch`, que redefine la trama fina. */
  store: ProbeParamsStore
  /** [ESCENA 5] Con la formación, la trama baja hasta el escenario (`TRAMA_HASTA_EL_PISO`). */
  hastaElPiso?: boolean
}

export const MoireScreen = forwardRef<MoireHandle, MoireScreenProps>(function MoireScreen(
  { store, hastaElPiso = false },
  ref
) {
  // [ESCENA 8] T2: con la formación y la bandera, las dos capas bajan a pleno hasta debajo del piso.
  const anclada = hastaElPiso && entornoDeLaEscena().limite
  const layers = useMemo(() => {
    const abajo = anclada ? TRAMA_ANCLADA.abajo : TRAMA_HASTA_EL_PISO.abajo
    const fundido = anclada ? 0 : TRAMA_HASTA_EL_PISO.fundido
    const coarse: LayerSpec = {
      radius: MOIRE_FAR_RADIUS,
      bottom: hastaElPiso ? abajo : MOIRE_FAR_BOTTOM,
      top: MOIRE_FAR_TOP,
      fadeBottom: hastaElPiso ? fundido : undefined,
      cells: MOIRE_COARSE_CELLS,
      order: MOIRE_FAR_ORDER,
    }
    const fine: LayerSpec = {
      radius: MOIRE_NEAR_RADIUS,
      bottom: hastaElPiso ? abajo : MOIRE_NEAR_BOTTOM,
      top: MOIRE_NEAR_TOP,
      fadeBottom: hastaElPiso ? fundido : undefined,
      cells: fineCells(store.current.moireMismatch),
      order: MOIRE_NEAR_ORDER,
    }

    const coarseTexture = buildTexture(
      createGridCellData(MOIRE_TILE_SIZE, lineDuty(coarse.cells), MOIRE_BASE_ALPHA)
    )
    applyRepeat(coarseTexture, coarse)

    const fineTexture = buildTexture(
      createDottedGridCellData(
        MOIRE_TILE_SIZE,
        lineDuty(fine.cells),
        dotDiameter(fine.cells),
        MOIRE_BASE_ALPHA
      )
    )
    applyRepeat(fineTexture, fine)

    const make = (spec: LayerSpec, texture: THREE.DataTexture) => ({
      spec,
      texture,
      geometry: buildLayerGeometry(spec),
      material: new THREE.MeshLambertMaterial({
        color: MOIRE_COLOR,
        alphaMap: texture,
        transparent: true,
        opacity: MOIRE_OPACITY,
        depthWrite: false,
        side: THREE.BackSide,
        vertexColors: true,
      }),
    })

    const capas = { coarse: make(coarse, coarseTexture), fine: make(fine, fineTexture) }
    // [ESCENA 5] M4: la fina lee dos desajustes en las transiciones entre tramos (`moire/parche.ts`).
    if (entornoDeLaEscena().moire) conDesajusteVivo(capas.fine.material)
    // [ESCENA 7] T11: con la bandera, el amanecer (no hace nada sin ella).
    conElAmanecer(capas.coarse.material)
    conElAmanecer(capas.fine.material)
    return capas
  }, [store, hastaElPiso, anclada])

  // [ESCENA 8] T2: el zócalo de la pared (la capa gruesa), del color de la trama y más denso que sus líneas.
  const zocalo = useMemo(() => {
    if (!anclada) return null
    const alto = ZOCALO.arriba - ZOCALO.abajo
    const geometry = new THREE.CylinderGeometry(ZOCALO.radio, ZOCALO.radio, alto, MOIRE_SEGMENTS, 1, true)
    const material = new THREE.MeshLambertMaterial({ color: MOIRE_COLOR, transparent: true, opacity: LIMITE.zocalo.opacidad, depthWrite: false, side: THREE.BackSide })
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

  /**
   * El desajuste se mueve con un slider, o sea por click y no por frame. Se
   * aplica MUTANDO la textura en vez de re-renderizando: la disciplina del
   * módulo es que el store sea un canal al loop, no estado de React.
   */
  useEffect(() => {
    let applied = Math.round(store.current.moireMismatch)
    const apply = (values: { moireMismatch: number }) => {
      const next = Math.round(values.moireMismatch)
      if (next === applied) return
      applied = next
      const spec = { ...layers.fine.spec, cells: fineCells(next) }
      const data = createDottedGridCellData(
        MOIRE_TILE_SIZE,
        lineDuty(spec.cells),
        dotDiameter(spec.cells),
        MOIRE_BASE_ALPHA
      )
      ;(layers.fine.texture.image.data as Uint8Array).set(data)
      layers.fine.texture.needsUpdate = true
      applyRepeat(layers.fine.texture, spec)
    }

    apply(store.current)
    return store.subscribe(apply)
  }, [store, layers])

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(
    () => () => {
      for (const layer of [layers.coarse, layers.fine]) {
        layer.geometry.dispose()
        layer.material.dispose()
        layer.texture.dispose()
      }
    },
    [layers]
  )

  useEffect(() => {
    // [ESCENA 8] T2: sin fundido abajo, el cielo lee uno ínfimo (divide por él en el shader).
    const banda = (spec: LayerSpec): readonly [number, number, number, number] => [spec.bottom, spec.top, spec.fadeBottom === 0 ? 1e-4 : (spec.fadeBottom ?? MOIRE_FADE), MOIRE_FADE]
    const handle: MoireHandle = { drift: layers.coarse.texture, fina: layers.fine.texture, altoDeLaFina: layers.fine.spec.top - layers.fine.spec.bottom, bandas: { gruesa: banda(layers.coarse.spec), fina: banda(layers.fine.spec) } }
    if (typeof ref === 'function') ref(handle)
    else if (ref) ref.current = handle
  }, [ref, layers])

  return (
    <>
      {[layers.coarse, layers.fine].map((layer) => (
        <mesh
          key={layer.spec.radius}
          geometry={layer.geometry}
          material={layer.material}
          renderOrder={layer.spec.order}
          position={[0, layer.spec.bottom + (layer.spec.top - layer.spec.bottom) / 2, 0]}
        />
      ))}
      {zocalo !== null && <mesh geometry={zocalo.geometry} material={zocalo.material} renderOrder={MOIRE_FAR_ORDER} position={[0, zocalo.y, 0]} />}
    </>
  )
})

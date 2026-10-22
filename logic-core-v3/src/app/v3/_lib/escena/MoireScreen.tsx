'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from './entorno'
import { ANISOTROPIA_DE_LAS_TRAMAS } from './gpu/anisotropia'
import { disposicionDelMoire, type VarianteDelMoire } from './moire/fijo'
import { conElAmanecer } from './amanecer/luz'
import { conPliegue } from './espejo/pliegue'
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
 * **Y tiene que ser de la geometría y no de la textura**, porque una capa
 * puede correr su `offset` ([B8] sólo la rendija de `?moire=mouse`): una
 * envolvente horneada en la textura se movería con ella.
 *
 * [B8] **Qué capas, dónde y quietas** lo dice la variante (`moire/fijo.ts`): `0`
 * ninguna, `1` la gruesa, `2` (el defecto) las dos en la pared —coplanares: el
 * batido no depende de la cámara— y `mouse` la gruesa corrida por el puntero.
 */

export type MoireHandle = {
  /** La capa gruesa. [B8] Quieta; con `?moire=mouse`, `MoireDelMouse` le corre el `offset`. */
  readonly gruesa: THREE.Texture
  /** La capa fina. [B8] Quieta. */
  readonly fina: THREE.Texture
  /** [B8] Qué capas se dibujan y en qué radio: lo que leen las estrellas, la fugaz y el amanecer (`estrellas/trama.ts`). */
  readonly capas: { readonly gruesa: boolean; readonly fina: boolean }
  readonly radios: { readonly gruesa: number; readonly fina: number }
  /**
   * [ESCENA 7] Dónde está cada capa (abajo, arriba, fundido de abajo y de arriba, fracción del alto):
   * el cielo de afuera lee la trama para quedar detrás (`estrellas/cielo.ts`).
   */
  readonly bandas: { readonly gruesa: readonly [number, number, number, number]; readonly fina: readonly [number, number, number, number] }
}

type VentanaDelBanco = Window & { __moireDelBanco?: { estado: () => { variante: VarianteDelMoire; capas: MoireHandle['capas']; gruesa: number[]; fina: number[] } } }

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
  // [PULIDO 20] R2 · `fondo=espejo`: el cristal solo, sin la trama (las capas y el zócalo no se dibujan; [B8] y nada la lee).
  const conTrama = entornoDeLaEscena().pruebas['sin-moire'] !== 'si'
  // [B8] Qué capas y dónde, por la variante de `?moire=` (`moire/fijo.ts`).
  const variante = entornoDeLaEscena().moire
  const disposicion = disposicionDelMoire(variante)
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
    // [B8] En la pared (`2`, coplanar con la gruesa) la fina toma la banda de la gruesa; si no, la suya.
    const enLaPared = disposicion.fina.radio === MOIRE_FAR_RADIUS
    const fine: LayerSpec = {
      radius: disposicion.fina.radio,
      bottom: hastaElPiso ? abajo : enLaPared ? MOIRE_FAR_BOTTOM : MOIRE_NEAR_BOTTOM,
      top: enLaPared ? MOIRE_FAR_TOP : MOIRE_NEAR_TOP,
      fadeBottom: hastaElPiso ? fundido : undefined,
      cells: fineCells(disposicion.desajuste ?? store.current.moireMismatch),
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

    const make = (spec: LayerSpec, texture: THREE.DataTexture, dibuja: boolean) => ({
      spec,
      texture,
      dibuja,
      geometry: buildLayerGeometry(spec),
      material: new THREE.MeshLambertMaterial({
        color: MOIRE_COLOR,
        // [CALIDAD 1] B8: con dithering (ruido azul).
        dithering: true,
        alphaMap: texture,
        transparent: true,
        opacity: MOIRE_OPACITY,
        depthWrite: false,
        side: THREE.BackSide,
        vertexColors: true,
      }),
    })

    const capas = { coarse: make(coarse, coarseTexture, disposicion.gruesa.dibuja), fine: make(fine, fineTexture, disposicion.fina.dibuja) }
    // [ESCENA 7] T11: con la bandera, el amanecer (no hace nada sin ella).
    conElAmanecer(capas.coarse.material)
    conElAmanecer(capas.fine.material)
    // [PULIDO 18] P2 · el pliegue de la cúpula (la dimensión espejo), sólo con `?espejo=pliegue`.
    if (entornoDeLaEscena().pruebas.espejo === 'pliegue') {
      conPliegue(capas.coarse.material)
      conPliegue(capas.fine.material)
    }
    return capas
  }, [store, hastaElPiso, anclada, disposicion])

  // [ESCENA 8] T2: el zócalo de la pared (la capa gruesa), del color de la trama y más denso que sus líneas. [B8] Sin la gruesa, no.
  const zocalo = useMemo(() => {
    if (!anclada || !disposicion.gruesa.dibuja) return null
    const alto = ZOCALO.arriba - ZOCALO.abajo
    const geometry = new THREE.CylinderGeometry(ZOCALO.radio, ZOCALO.radio, alto, MOIRE_SEGMENTS, 1, true)
    const material = new THREE.MeshLambertMaterial({ color: MOIRE_COLOR, transparent: true, opacity: LIMITE.zocalo.opacidad, depthWrite: false, side: THREE.BackSide, dithering: true })
    conElAmanecer(material)
    return { geometry, material, y: ZOCALO.abajo + alto / 2 }
  }, [anclada, disposicion])
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
   * módulo es que el store sea un canal al loop, no estado de React. [B8] Si la
   * variante fija el desajuste (`2`), el slider no lo mueve.
   */
  useEffect(() => {
    const desajusteDe = (m: number): number => Math.round(disposicion.desajuste ?? m)
    let applied = desajusteDe(store.current.moireMismatch)
    const apply = (values: { moireMismatch: number }) => {
      const next = desajusteDe(values.moireMismatch)
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
  }, [store, layers, disposicion])

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
    const capas = { gruesa: conTrama && layers.coarse.dibuja, fina: conTrama && layers.fine.dibuja }
    const handle: MoireHandle = { gruesa: layers.coarse.texture, fina: layers.fine.texture, capas, radios: { gruesa: layers.coarse.spec.radius, fina: layers.fine.spec.radius }, bandas: { gruesa: banda(layers.coarse.spec), fina: banda(layers.fine.spec) } }
    if (typeof ref === 'function') ref(handle)
    else if (ref) ref.current = handle
    // [B8] Para el banco: la variante, las capas y el corrimiento de cada textura (sólo se mueve con `?moire=mouse`).
    if (hayBanco()) (window as VentanaDelBanco).__moireDelBanco = { estado: () => ({ variante, capas, gruesa: layers.coarse.texture.offset.toArray(), fina: layers.fine.texture.offset.toArray() }) }
  }, [ref, layers, conTrama, variante])

  return (
    <>
      {[layers.coarse, layers.fine].filter((layer) => layer.dibuja).map((layer) => (
        <mesh
          key={layer === layers.coarse ? 'gruesa' : 'fina'}
          name={layer === layers.coarse ? 'trama gruesa' : 'trama fina'}
          geometry={layer.geometry}
          material={layer.material}
          renderOrder={layer.spec.order}
          position={[0, layer.spec.bottom + (layer.spec.top - layer.spec.bottom) / 2, 0]}
          visible={conTrama}
        />
      ))}
      {zocalo !== null && <mesh name="zócalo" geometry={zocalo.geometry} material={zocalo.material} renderOrder={MOIRE_FAR_ORDER} position={[0, zocalo.y, 0]} visible={conTrama} />}
    </>
  )
})

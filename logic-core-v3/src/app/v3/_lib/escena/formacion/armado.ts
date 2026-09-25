import { mergeBufferGeometries } from 'three-stdlib'
import * as THREE from 'three'

import type { Escena4 } from '../entorno'
import { FLOOR_RADIUS, FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { copiaHorneada } from './copia'
import { APOYAR_EN_EL_PISO, FORMACION, desnivelDe, formar, radioDelPisoDeAbajo, type Copia, type Lectura, type Pieza } from './enFormacion'
import { CAJAS_DE_LA_FORMACION, DESENFOQUE, TEXTO, materialDeLaComposicion, materialDeLaCopia, materialDelTapon, type UniformsDeLaComposicion, type UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 4] EL ARMADO DE LA FORMACIÓN — lo que se construye una vez: las piezas instanciadas, la
 * escena aparte con sus tapones, el búfer del desenfoque, el plano que las compone y el piso de abajo.
 * Sin React: `Formacion.tsx` lo monta y le escribe cada cuadro.
 */

export interface Armado {
  readonly copias: readonly Copia[]
  readonly instancias: THREE.InstancedMesh
  readonly aparte: THREE.Scene
  readonly pozo: THREE.Mesh
  readonly composicion: THREE.Mesh
  readonly buffer: THREE.WebGLRenderTarget
  readonly copia: UniformsDeLaCopia
  readonly compuesta: UniformsDeLaComposicion
  /** Los tapones del logo, uno por malla, y de qué malla copian la matriz. */
  readonly taponesDelLogo: { tapon: THREE.Mesh; de: THREE.Mesh }[]
  readonly tapon: THREE.Material
  readonly soltar: () => void
}

/** Cuántas copias caen adentro del cuadro (para el banco). */
export function contarVisibles(copias: readonly Copia[], camara: THREE.Camera, lectura: Lectura): number {
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse))
  const alto = 2.5 * FORMACION[lectura].escala
  const y = FLOOR_Y - desnivelDe(lectura) + alto
  const punto = new THREE.Vector3()
  return copias.filter((c) => frustum.containsPoint(punto.set(c.x, y, c.z))).length
}

const lineal = (srgb: number): number => (srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4)

export function armar(formas: THREE.Shape[], lectura: Lectura, escena4: Escena4, movil: boolean): Armado {
  const horneada = copiaHorneada(formas)
  const caja = horneada.geometria.boundingBox ?? new THREE.Box3()
  const medidas = { ancho: caja.max.x - caja.min.x, alto: caja.max.y - caja.min.y, caja: horneada.caja }
  const copias = formar(lectura, escena4.densidad, medidas, { movil })
  const piezas = copias.flatMap((copia) => copia.piezas.map((pieza) => ({ copia, pieza })))

  const copia: UniformsDeLaCopia = { uMirada: { value: 0 } }
  const material = materialDeLaCopia(horneada.fronteras, copia)
  const instancias = new THREE.InstancedMesh(horneada.geometria, material, piezas.length)
  instancias.frustumCulled = false
  const datosDePieza = new Float32Array(piezas.length * 4)
  const datosDeAncla = new Float32Array(piezas.length * 4)
  const escala = FORMACION[lectura].escala
  const piso = FLOOR_Y - desnivelDe(lectura)
  piezas.forEach(({ copia: c, pieza }, i) => {
    const local = matrizDeLaPieza(pieza, APOYAR_EN_EL_PISO.has(c.falla) ? horneada.caja(pieza.region, pieza.corte) : null)
    const m = new THREE.Matrix4().makeTranslation(c.x, piso, c.z).multiply(new THREE.Matrix4().makeScale(escala, escala, escala)).multiply(local)
    instancias.setMatrixAt(i, m)
    datosDePieza.set([pieza.region, pieza.corte, lineal(pieza.tono), Math.sign(m.determinant()) || 1], i * 4)
    datosDeAncla.set([c.x, c.z, c.anguloAlCentro, c.retardo], i * 4)
  })
  horneada.geometria.setAttribute('aPieza', new THREE.InstancedBufferAttribute(datosDePieza, 4))
  horneada.geometria.setAttribute('aAncla', new THREE.InstancedBufferAttribute(datosDeAncla, 4))
  instancias.instanceMatrix.needsUpdate = true

  const papel = new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0, side: THREE.DoubleSide })
  const geometriaDelPozo = geometriaDelPiso(lectura)
  const pozo = new THREE.Mesh(geometriaDelPozo, papel)
  pozo.position.y = FLOOR_Y

  const tapon = materialDelTapon()
  const aparte = new THREE.Scene()
  aparte.add(instancias)
  const taponDelPozo = new THREE.Mesh(geometriaDelPozo, tapon)
  taponDelPozo.position.y = FLOOR_Y
  const geometriaDeLaLosa = new THREE.CircleGeometry(FORMACION.radioDelClaro, 128)
  const taponDeLaLosa = new THREE.Mesh(geometriaDeLaLosa, tapon)
  taponDeLaLosa.rotation.x = -Math.PI / 2
  taponDeLaLosa.position.y = FLOOR_Y
  taponDelPozo.renderOrder = -1
  taponDeLaLosa.renderOrder = -1
  aparte.add(taponDelPozo, taponDeLaLosa)

  const buffer = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true })
  buffer.texture.colorSpace = THREE.SRGBColorSpace
  const compuesta: UniformsDeLaComposicion = {
    uTexto: { value: Array.from({ length: CAJAS_DE_LA_FORMACION }, () => new THREE.Vector4(-1, -1, -2, -2)) },
    uPluma: { value: TEXTO.plumaCss },
    uCopias: { value: buffer.texture },
    uTexel: { value: new THREE.Vector2(0.5, 0.5) },
    uRadio: { value: DESENFOQUE.radio },
    uVisible: { value: 1 },
  }
  const geometriaDePantalla = new THREE.PlaneGeometry(2, 2)
  const materialDeComposicion = materialDeLaComposicion(compuesta)
  const composicion = new THREE.Mesh(geometriaDePantalla, materialDeComposicion)
  composicion.frustumCulled = false
  // Después de la cúpula (−20, −19), que está detrás de las copias; antes de la sombra y del polvo.
  composicion.renderOrder = -18

  return {
    copias,
    instancias,
    aparte,
    pozo,
    composicion,
    buffer,
    copia,
    compuesta,
    taponesDelLogo: [],
    tapon,
    soltar: () => {
      instancias.dispose()
      for (const cosa of [horneada.geometria, material, papel, geometriaDelPozo, tapon, geometriaDeLaLosa, buffer, geometriaDePantalla, materialDeComposicion]) cosa.dispose()
    },
  }
}

/**
 * El piso de abajo, relativo a `FLOOR_Y`: el escalón (L1) o la rampa (L2) que baja desde el borde
 * del claro, el piso de la formación y la pared que vuelve a subir al ciclorama en el radio 34. Tres
 * piezas con sus propias normales (un torno las promediaría en las esquinas) en una sola geometría.
 */
function geometriaDelPiso(lectura: Lectura): THREE.BufferGeometry {
  const hondo = desnivelDe(lectura)
  const abajo = radioDelPisoDeAbajo(lectura)
  const escalon = new THREE.CylinderGeometry(FORMACION.radioDelClaro, abajo, hondo, 128, 1, true)
  escalon.translate(0, -hondo / 2, 0)
  const piso = new THREE.RingGeometry(abajo, FLOOR_RADIUS, 128, 1)
  piso.rotateX(-Math.PI / 2)
  piso.translate(0, -hondo, 0)
  const pared = new THREE.CylinderGeometry(FLOOR_RADIUS, FLOOR_RADIUS, hondo, 128, 1, true)
  pared.translate(0, -hondo / 2, 0)
  const junta = mergeBufferGeometries([escalon, piso, pared]) ?? piso
  for (const g of [escalon, piso, pared]) if (g !== junta) g.dispose()
  return junta
}

/**
 * La matriz de una pieza en el espacio de la copia: escala, giro alrededor de su pivote y
 * corrimiento. Con `apoyo`, además la baja o la sube para que lo más bajo de la pieza toque el piso.
 */
function matrizDeLaPieza(p: Pieza, apoyo: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number } | null): THREE.Matrix4 {
  const pivote = new THREE.Vector3(...p.pivote)
  const m = new THREE.Matrix4()
    .makeTranslation(p.desplazamiento[0], p.desplazamiento[1], p.desplazamiento[2])
    .multiply(new THREE.Matrix4().makeTranslation(pivote.x, pivote.y, pivote.z))
    .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(p.giro[0], p.giro[1], p.giro[2])))
    .multiply(new THREE.Matrix4().makeTranslation(-pivote.x, -pivote.y, -pivote.z))
    .multiply(new THREE.Matrix4().makeScale(p.escala[0], p.escala[1], p.escala[2]))
  if (apoyo === null) return m
  let bajo = Infinity
  const v = new THREE.Vector3()
  for (const x of [apoyo.x0, apoyo.x1]) for (const y of [apoyo.y0, apoyo.y1]) for (const z of [apoyo.z0, apoyo.z1]) bajo = Math.min(bajo, v.set(x, y, z).applyMatrix4(m).y)
  return new THREE.Matrix4().makeTranslation(0, -bajo, 0).multiply(m)
}

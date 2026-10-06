import * as THREE from 'three'

import { FLOOR_Y, PROBE_SVG_SCALE } from '../probeScene'

/**
 * [EL ENCASTRE] 2D · EL HUECO EXACTO — en el piso, un hueco con la forma exacta del logo (la pieza de un rompecabezas) que
 * se abre cuando el logo está por llegar; el logo cae justo ahí y se hunde a presión hasta quedar al ras.
 *
 *   · LA MÁSCARA (una vez, al montar): las formas del SVG en el plano del logo acostado, dibujadas en una textura. R: la
 *     forma, con una holgura mínima (el logo entra sin rozar); G: la misma, muy desenfocada (un campo que vale ~1 en el
 *     medio de los trazos y baja hacia afuera). El piso descarta sus tapas y costados donde R dice «adentro» y G pasa el
 *     umbral de la apertura: el hueco se abre desde el medio de los trazos hacia sus bordes exactos (`enElPiso.ts`).
 *   · EL POZO: las paredes (el contorno extruido hacia abajo) y el fondo, oscuros, de un espesor del logo y un pelo más:
 *     por el hueco se ve un pozo con la forma del logo, y el logo entra en él.
 *
 * En el plano del piso, un punto del logo acostado de coordenadas (X, Y) en su grupo cae en (x, z) = (X, −Y): el grupo
 * del logo lleva el SVG dado vuelta (Y = −y del SVG) y acostado gira −90° sobre x.
 */
export const HUECO = {
  /** La textura (px por lado), su margen alrededor de la caja del logo (u), la holgura del hueco (u) y el desenfoque de G (px). */
  lado: 512,
  margen: 0.8,
  holgura: 0.035,
  desenfoque: 14,
  /** Cuándo se abre (s del reloj): el logo cae a los 2,2 s y toca a los 2,76. */
  abre: { desdeS: 1.6, hastaS: 2.4 },
  /** La profundidad del pozo, en espesores del logo (un pelo más: el fondo no toca la cara de abajo). */
  hondo: 1.06,
  /** El color de las paredes y del fondo del pozo (tinta y casi negro). */
  pared: '#2a2a2a',
  fondo: '#121212',
} as const

export interface SvgDelLogo {
  readonly paths: readonly { toShapes: (agujerosSonAntihorarios: boolean) => THREE.Shape[] }[]
}

/** Las formas del logo en el plano de su grupo (centradas en su caja, en u, con el SVG dado vuelta) y su caja. */
export function formasDelLogo(svg: SvgDelLogo): { readonly formas: readonly THREE.Shape[]; readonly caja: THREE.Box2 } {
  const crudas = svg.paths.flatMap((p) => p.toShapes(true))
  const cajaDelSvg = new THREE.Box2()
  for (const f of crudas) for (const q of f.extractPoints(12).shape) cajaDelSvg.expandByPoint(q)
  const c = cajaDelSvg.getCenter(new THREE.Vector2())
  const llevar = (q: THREE.Vector2): THREE.Vector2 => new THREE.Vector2((q.x - c.x) * PROBE_SVG_SCALE, -(q.y - c.y) * PROBE_SVG_SCALE)
  const caja = new THREE.Box2()
  const formas = crudas.map((f) => {
    const { shape, holes } = f.extractPoints(24)
    const forma = new THREE.Shape(shape.map(llevar))
    forma.holes = holes.map((h) => new THREE.Path(h.map(llevar)))
    for (const q of forma.getPoints()) caja.expandByPoint(q)
    return forma
  })
  return { formas, caja }
}

/** La máscara: la textura (R la forma con holgura, G el campo ancho) y su marco en el plano del logo (min x, min y, ancho, alto). */
export interface MascaraDelLogo {
  readonly textura: THREE.DataTexture
  readonly marco: THREE.Vector4
}

function dibujar(formas: readonly THREE.Shape[], marco: THREE.Vector4, lado: number, desenfoque: number, holguraPx: number): Uint8ClampedArray {
  const lienzo = document.createElement('canvas')
  lienzo.width = lado
  lienzo.height = lado
  const ctx = lienzo.getContext('2d')
  if (ctx === null) return new Uint8ClampedArray(lado * lado * 4)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, lado, lado)
  if (desenfoque > 0) ctx.filter = `blur(${String(desenfoque)}px)`
  // Sin dar vuelta: la fila 0 del lienzo es la fila 0 de la textura (v = 0).
  const px = (q: THREE.Vector2): [number, number] => [((q.x - marco.x) / marco.z) * lado, ((q.y - marco.y) / marco.w) * lado]
  ctx.beginPath()
  for (const f of formas) {
    for (const contorno of [f.getPoints(), ...f.holes.map((h) => h.getPoints())]) {
      contorno.forEach((q, i) => (i === 0 ? ctx.moveTo(...px(q)) : ctx.lineTo(...px(q))))
      ctx.closePath()
    }
  }
  ctx.fillStyle = '#fff'
  ctx.fill('evenodd')
  if (holguraPx > 0) {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2 * holguraPx
    ctx.stroke()
  }
  return ctx.getImageData(0, 0, lado, lado).data
}

/** Arma la máscara una vez (necesita el DOM: un lienzo 2D). */
export function mascaraDelLogo(formas: readonly THREE.Shape[], caja: THREE.Box2): MascaraDelLogo {
  const m = HUECO.margen
  const ancho = caja.max.x - caja.min.x + 2 * m
  const alto = caja.max.y - caja.min.y + 2 * m
  const lado = Math.max(ancho, alto)
  const marco = new THREE.Vector4(caja.min.x - m - (lado - ancho) / 2, caja.min.y - m - (lado - alto) / 2, lado, lado)
  const n = HUECO.lado
  const nitida = dibujar(formas, marco, n, 0, (HUECO.holgura / lado) * n)
  const ancha = dibujar(formas, marco, n, HUECO.desenfoque, 0)
  const datos = new Uint8Array(n * n * 4)
  for (let i = 0; i < n * n; i += 1) {
    datos[i * 4] = nitida[i * 4]
    datos[i * 4 + 1] = ancha[i * 4]
    datos[i * 4 + 3] = 255
  }
  const textura = new THREE.DataTexture(datos, n, n, THREE.RGBAFormat)
  textura.magFilter = THREE.LinearFilter
  textura.minFilter = THREE.LinearFilter
  textura.needsUpdate = true
  return { textura, marco }
}

/** El pozo: las paredes y el fondo, debajo del hueco (el grupo, acostado, con el tope al ras del piso). Invisible al armarse. */
export function crearElPozo(formas: readonly THREE.Shape[], espesor: number): { readonly grupo: THREE.Group; readonly soltar: () => void } {
  const hondo = espesor * HUECO.hondo
  const paredes = new THREE.ExtrudeGeometry([...formas], { depth: hondo, bevelEnabled: false, curveSegments: 12 })
  paredes.translate(0, 0, -hondo)
  const fondo = new THREE.ShapeGeometry([...formas], 12)
  fondo.translate(0, 0, -hondo)
  // Las tapas de la extrusión no se dibujan (la de arriba taparía el hueco): sólo las paredes.
  const sinTapas = new THREE.MeshBasicMaterial({ visible: false })
  const pared = new THREE.MeshStandardMaterial({ color: HUECO.pared, roughness: 0.95, metalness: 0, side: THREE.DoubleSide })
  const deFondo = new THREE.MeshStandardMaterial({ color: HUECO.fondo, roughness: 1, metalness: 0, side: THREE.DoubleSide })
  const grupo = new THREE.Group()
  grupo.name = 'pozo del final'
  grupo.add(new THREE.Mesh(paredes, [sinTapas, pared]), new THREE.Mesh(fondo, deFondo))
  grupo.rotation.x = -Math.PI / 2
  grupo.position.set(0, FLOOR_Y, 0)
  grupo.visible = false
  return {
    grupo,
    soltar: () => {
      paredes.dispose()
      fondo.dispose()
      sinTapas.dispose()
      pared.dispose()
      deFondo.dispose()
    },
  }
}

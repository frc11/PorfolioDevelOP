import * as THREE from 'three'

import { FLOOR_Y, PAPER_COLOR, PROBE_SVG_SCALE } from '../probeScene'

/**
 * [EL ENCASTRE] 2D · EL HUECO EXACTO — en el piso, un hueco con la forma exacta del logo (la pieza de un rompecabezas) que
 * se abre cuando el logo está por llegar; el logo cae justo ahí y se hunde a presión hasta quedar al ras.
 *
 *   · LA MÁSCARA (una vez, al montar): las formas del SVG en el plano del logo acostado, dibujadas en una textura. R: la
 *     forma, [RETOQUE DEL ENCASTRE] 1C · apenas achicada (`solape`: el piso pisa el borde del logo); G: la misma, muy
 *     desenfocada (un campo que vale ~1 en el medio de los trazos y baja hacia afuera). El piso descarta sus tapas y
 *     costados donde R dice «adentro» y G pasa el umbral de la apertura: el hueco se abre desde el medio de los trazos
 *     hacia sus bordes (`enElPiso.ts`).
 *   · EL POZO: las paredes (el contorno extruido hacia abajo) y el fondo, de un espesor del logo y un pelo más: por el
 *     hueco se ve un pozo con la forma del logo, y el logo entra en él. [RETOQUE DEL ENCASTRE] 1B · del tono del piso,
 *     un poco más sombreado adentro (de tinta, el hueco se leía como un logo negro pintado en el piso).
 *
 * [RETOQUE DEL ENCASTRE] 1C · SIN LÍNEA BLANCA: el corte iba 0,035 u por AFUERA del contorno (la holgura) y las paredes
 * del pozo, en el contorno: por ese anillo se veía el fondo claro de la escena, una línea fina alrededor del logo
 * encastrado. Ahora el corte va por ADENTRO (el piso pisa el borde del logo), y el piso calmo y el borde del pozo quedan
 * un pelo debajo de la cara del logo al ras (`bajoElRas`): la cara del logo queda encima, su canto es el borde.
 *
 * En el plano del piso, un punto del logo acostado de coordenadas (X, Y) en su grupo cae en (x, z) = (X, −Y): el grupo
 * del logo lleva el SVG dado vuelta (Y = −y del SVG) y acostado gira −90° sobre x.
 */
export const HUECO = {
  /** La textura (px por lado), su margen alrededor de la caja del logo (u), cuánto pisa el piso el borde del logo (u) y el desenfoque de G (px). */
  lado: 512,
  margen: 0.8,
  solape: 0.02,
  /** [RETOQUE DEL ENCASTRE] 1C · cuánto debajo de la cara del logo al ras quedan el piso calmo y el borde del pozo (u). */
  bajoElRas: 0.005,
  desenfoque: 14,
  /** Cuándo se abre (s del reloj): el logo cae a los 2,2 s y toca a los 2,76. */
  abre: { desdeS: 1.6, hastaS: 2.4 },
  /** La profundidad del pozo, en espesores del logo (un pelo más: el fondo no toca la cara de abajo). */
  hondo: 1.06,
  /** [RETOQUE DEL ENCASTRE] 1B · el color de las paredes y del fondo del pozo: el papel del piso, un poco más sombreado adentro. */
  sombra: { pared: 0.86, fondo: 0.74 },
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

/**
 * [RETOQUE DEL ENCASTRE] 1C · el trazo del borde de la forma, para agrandarla (`bordePx` > 0: blanco) o achicarla (< 0:
 * negro, por adentro); sin borde, ninguno. Puro (lo usa el invariante).
 */
export function trazoDelBorde(bordePx: number): { readonly color: '#fff' | '#000'; readonly ancho: number } | null {
  if (bordePx === 0) return null
  return { color: bordePx > 0 ? '#fff' : '#000', ancho: 2 * Math.abs(bordePx) }
}

function dibujar(formas: readonly THREE.Shape[], marco: THREE.Vector4, lado: number, desenfoque: number, bordePx: number): Uint8ClampedArray {
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
  const trazo = trazoDelBorde(bordePx)
  if (trazo !== null) {
    ctx.strokeStyle = trazo.color
    ctx.lineWidth = trazo.ancho
    ctx.stroke()
  }
  return ctx.getImageData(0, 0, lado, lado).data
}

/** Arma la máscara una vez (necesita el DOM: un lienzo 2D). */
/** [PULIDO 1] P22 · `resolucion`: en el teléfono, la mitad (se arma una vez y el piso la lee en cada píxel). */
export function mascaraDelLogo(formas: readonly THREE.Shape[], caja: THREE.Box2, resolucion: number = HUECO.lado): MascaraDelLogo {
  const m = HUECO.margen
  const ancho = caja.max.x - caja.min.x + 2 * m
  const alto = caja.max.y - caja.min.y + 2 * m
  const lado = Math.max(ancho, alto)
  const marco = new THREE.Vector4(caja.min.x - m - (lado - ancho) / 2, caja.min.y - m - (lado - alto) / 2, lado, lado)
  const n = resolucion
  const nitida = dibujar(formas, marco, n, 0, -(HUECO.solape / lado) * n)
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

/** El pozo: las paredes y el fondo, debajo del hueco (el grupo, acostado, con el tope apenas debajo del piso). Invisible al armarse. */
export function crearElPozo(formas: readonly THREE.Shape[], espesor: number): { readonly grupo: THREE.Group; readonly soltar: () => void } {
  const hondo = espesor * HUECO.hondo
  const paredes = new THREE.ExtrudeGeometry([...formas], { depth: hondo, bevelEnabled: false, curveSegments: 12 })
  paredes.translate(0, 0, -hondo)
  const fondo = new THREE.ShapeGeometry([...formas], 12)
  fondo.translate(0, 0, -hondo)
  // Las tapas de la extrusión no se dibujan (la de arriba taparía el hueco): sólo las paredes.
  const sinTapas = new THREE.MeshBasicMaterial({ visible: false })
  const pared = new THREE.MeshStandardMaterial({ color: new THREE.Color(PAPER_COLOR).multiplyScalar(HUECO.sombra.pared), roughness: 0.95, metalness: 0, side: THREE.DoubleSide })
  const deFondo = new THREE.MeshStandardMaterial({ color: new THREE.Color(PAPER_COLOR).multiplyScalar(HUECO.sombra.fondo), roughness: 1, metalness: 0, side: THREE.DoubleSide })
  const grupo = new THREE.Group()
  grupo.name = 'pozo del final'
  grupo.add(new THREE.Mesh(paredes, [sinTapas, pared]), new THREE.Mesh(fondo, deFondo))
  grupo.rotation.x = -Math.PI / 2
  grupo.position.set(0, FLOOR_Y - HUECO.bajoElRas, 0)
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

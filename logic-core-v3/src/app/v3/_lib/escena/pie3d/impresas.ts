import * as THREE from 'three'

import type { MedidaDeLaPieza } from '../../pie3d/medida'
import type { FormaDeLaPieza } from '../../pie3d/registro'
import { DERRETIDO } from './derretido'
import { COLORES_DEL_PIE, VOLUMEN_DEL_PIE, aLoAnchoDeLaTecla, baseDeLaLetra, deRotulo, pintar, sinLetra, type FuentesDelPie } from './geometria'
import { materialDelPie } from './material'
import type { UniformesDelPie } from './coreografia'
import { teselar } from './teselado'

/**
 * [PULIDO 28] AA1 · LAS LETRAS DEL FORMULARIO, IMPRESAS. La letra del form TITILABA al mover la cámara (quieta, no): no era el DOM (en
 * volumen los rótulos del DOM son transparentes) sino su relieve: letras de unos 10 px extruidas 2,5 px, cuyas caras y cantos caen en
 * otro píxel en cada cuadro de la órbita (medido en el sitio, cuadro a cuadro: la misma palabra con otro grosor de uno al otro). Ahora se
 * IMPRIMEN en la cara de la placa: los mismos glifos, en su lugar del DOM, en una textura a `escala` veces (con sus mipmaps y el filtro
 * anisótropo), sobre un plano apenas delante de la cara con el material de la pieza (su luz, su llegada, su disolución, su derretido):
 * la GPU la muestrea filtrada y la letra no cambia de grosor con la cámara. Los rótulos en la placa; el de la tecla (Enviar), en su cara
 * y con lo que la tecla le pide (el relleno del hover, sin dibujarse con el botón ocupado). Los renglones en Archivo, en relieve.
 * La escala, una potencia de dos: el nivel del mipmap que cae a 1:1 (dpr 1: el 2; dpr 2: el 1) es la letra entera, sin mezclarse con uno
 * más chico (con 3 la mezcla de 1,5x y 0,75x la dejaba blanda). Y `peso` (px): un trazo alrededor del glifo, el peso que el relieve
 * sumaba con sus costados (sin él, medido en el sitio: el 81 % de la tinta y el brillo más alto en 213 contra 248).
 */
export const IMPRESAS = { escala: 4, peso: 0.3, adelante: 0.6, margen: 2, anisotropia: 8, pasos: 8 } as const

export interface LetrasImpresas {
  readonly geometria: THREE.BufferGeometry
  readonly textura: THREE.CanvasTexture
}

/** Las letras del formulario de la placa o de la tecla (no las de Archivo) impresas en una textura, con el plano donde van (px); `null` si no hay. */
export function imprimirLasLetras(m: MedidaDeLaPieza, fuentes: FuentesDelPie, enLaTecla: boolean): LetrasImpresas | null {
  const ls = m.letras.filter((l) => l.enLaTecla === enLaTecla && l.archivo !== true && fuentes[l.peso].data.glyphs[l.ch] !== undefined)
  if (ls.length === 0 || typeof document === 'undefined') return null
  let [x0, y0, x1, y1] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
  for (const l of ls) {
    const f = fuentes[l.peso].data
    x0 = Math.min(x0, l.x - 0.2 * l.cuerpo)
    x1 = Math.max(x1, l.x + (f.glyphs[l.ch].ha / f.resolution + 0.2) * l.cuerpo)
    y0 = Math.min(y0, l.arriba)
    y1 = Math.max(y1, l.arriba + l.alto)
  }
  const M = IMPRESAS.margen
  ;[x0, y0, x1, y1] = [Math.floor(x0) - M, Math.floor(y0) - M, Math.ceil(x1) + M, Math.ceil(y1) + M]
  const S = IMPRESAS.escala
  const lienzo = document.createElement('canvas')
  lienzo.width = (x1 - x0) * S
  lienzo.height = (y1 - y0) * S
  const c = lienzo.getContext('2d')
  if (c === null) return null
  // Lo que se ve es el blanco (la transparencia: el canal verde); el color es el del relieve, de la geometría.
  c.fillStyle = '#000'
  c.fillRect(0, 0, lienzo.width, lienzo.height)
  c.fillStyle = '#fff'
  c.strokeStyle = '#fff'
  c.lineWidth = IMPRESAS.peso * S
  c.lineJoin = 'round'
  for (const l of ls) {
    const fuente = fuentes[l.peso]
    const base = baseDeLaLetra(l, fuente.data)
    for (const forma of fuente.generateShapes(l.ch, l.cuerpo)) {
      const { shape, holes } = forma.extractPoints(IMPRESAS.pasos)
      c.beginPath()
      for (const contorno of [shape, ...holes]) {
        contorno.forEach((p, k) => {
          const [x, y] = [(l.x + p.x - x0) * S, (base - p.y - y0) * S]
          if (k === 0) c.moveTo(x, y)
          else c.lineTo(x, y)
        })
        c.closePath()
      }
      c.fill('evenodd')
      c.stroke()
    }
  }
  const plano = new THREE.PlaneGeometry(x1 - x0, y1 - y0)
  plano.translate((x0 + x1) / 2, -(y0 + y1) / 2, (enLaTecla ? VOLUMEN_DEL_PIE.tecla : 0) + IMPRESAS.adelante)
  const textura = new THREE.CanvasTexture(lienzo)
  textura.anisotropy = IMPRESAS.anisotropia
  const pintado = pintar(plano, COLORES_DEL_PIE.claro)
  const conLetra = enLaTecla && m.tecla !== null ? aLoAnchoDeLaTecla(deRotulo(pintado), m.tecla) : sinLetra(pintado)
  return { geometria: teselar(conLetra, DERRETIDO.lado), textura }
}

/**
 * Las mallas de una pieza en sus grupos: lo fijo en el del viaje, lo que se hunde en el cuerpo (con el material de la pieza) y, en el
 * formulario, sus letras impresas (las de la placa en el del viaje, las de la tecla en el cuerpo; con un material propio que comparte los
 * uniformes y la luz del de la pieza; se suelta con su geometría). Las letras del titular salen de su caja en el sombreador: sin descarte
 * por encuadre (el pie son pocas mallas).
 */
export function colgarLasMallas(forma: FormaDeLaPieza, m: MedidaDeLaPieza, fuentes: FuentesDelPie, fija: THREE.BufferGeometry | null, hundible: THREE.BufferGeometry | null, material: THREE.MeshStandardMaterial, uniformes: UniformesDelPie, viaje: THREE.Object3D, cuerpo: THREE.Object3D): THREE.Mesh[] {
  const mallas: THREE.Mesh[] = []
  for (const [geo, padre] of [[fija, viaje], [hundible, cuerpo]] as const) {
    if (geo === null) continue
    const malla = new THREE.Mesh(geo, material)
    malla.frustumCulled = false
    padre.add(malla)
    mallas.push(malla)
  }
  if (forma !== 'formulario') return mallas
  for (const [enLaTecla, padre] of [[false, viaje], [true, cuerpo]] as const) {
    const impresas = imprimirLasLetras(m, fuentes, enLaTecla)
    if (impresas !== null) mallas.push(colgarLasImpresas(impresas, material, uniformes, padre))
  }
  return mallas
}

/** La malla de unas letras impresas, en `padre`: el material de la pieza con la textura como transparencia. */
function colgarLasImpresas(impresas: LetrasImpresas, material: THREE.MeshStandardMaterial, uniformes: UniformesDelPie, padre: THREE.Object3D): THREE.Mesh {
  const propio = materialDelPie(uniformes)
  propio.alphaMap = impresas.textura
  propio.transparent = true
  propio.depthWrite = false
  propio.polygonOffset = true
  propio.polygonOffsetFactor = -1
  propio.polygonOffsetUnits = -4
  propio.envMap = material.envMap
  const malla = new THREE.Mesh(impresas.geometria, propio)
  malla.frustumCulled = false
  malla.name = 'letras impresas'
  // La luz de la pieza (la acostada, la mojada del derretido): la de su material, en cada cuadro.
  malla.onBeforeRender = () => {
    propio.envMapIntensity = material.envMapIntensity
    propio.roughness = material.roughness
  }
  impresas.geometria.addEventListener('dispose', () => {
    propio.dispose()
    impresas.textura.dispose()
  })
  padre.add(malla)
  return malla
}

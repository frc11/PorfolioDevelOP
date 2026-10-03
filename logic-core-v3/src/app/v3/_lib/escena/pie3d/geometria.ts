import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import type { CajaDelPie, LetraDelPie, MedidaDeLaPieza, PesoDelPie, TrazoDelPie } from '../../pie3d/medida'
import { INK_COLOR } from '../probeScene'

/**
 * [RETOQUE DEL PIE] P2 · LA GEOMETRÍA DE LAS PIEZAS DEL PIE — en px CSS (la escena la escala al mundo), con el origen en
 * la esquina de arriba a la izquierda de la caja del DOM, la y hacia arriba (la del DOM, negada) y la cara del DOM en
 * z = 0: lo que sale hacia la cámara va en +z y el cuerpo hacia atrás. Cada vértice lleva su color (el negro satinado,
 * el claro del relieve, el gris del pozo): una malla por pieza, un material para todas.
 *
 *   · el texto suelto: extruido como los títulos (el espesor y el bisel en em: el mismo aire que el logo);
 *   · la placa: un rectángulo redondeado con bisel (el canto que agarra la luz), y su texto y sus íconos en relieve;
 *   · el formulario: una placa con un pozo por campo (agujeros con su pared y su fondo) y la tecla de Enviar aparte (se
 *     hunde sola).
 */
export const VOLUMEN_DEL_PIE = {
  /** El espesor de la placa de un enlace y el del formulario (px). */
  placa: 22,
  formulario: 30,
  /** Lo que la tecla de Enviar sale de la cara del formulario, y lo hondo de los pozos (px). */
  tecla: 12,
  pozo: 9,
  /** El bisel de las placas (px): el canto redondeado que agarra la luz. */
  bisel: 2,
  /** El relieve del texto y los íconos sobre una placa: el mayor de los dos (px y em). */
  relieve: { px: 2.5, em: 0.18 },
  /** El texto suelto, como los títulos (em). */
  texto: { profundidad: 0.14, bisel: { grosor: 0.012, tamano: 0.008, segmentos: 2 } },
  curvas: 4,
  /** El radio de una placa cuyo elemento no tiene (px). */
  radio: 6,
  /** Los pasos de una curva de un ícono, y los lados de cada unión del trazo. */
  pasosDelTrazo: 10,
  ladosDeLaUnion: 10,
} as const

/** Los colores (el negro es la tinta, como el logo y los títulos; el claro, un papel apenas bajo; el pozo, un gris hondo). */
export const COLORES_DEL_PIE = {
  negro: new THREE.Color(INK_COLOR),
  claro: new THREE.Color('#e9e9e5'),
  pozo: new THREE.Color('#2b2b2b'),
} as const

export type FuentesDelPie = Readonly<Record<PesoDelPie, Font>>

/** Un rectángulo redondeado de la caja del DOM (px, y hacia abajo) en el plano de la pieza (y hacia arriba). */
export function rectanguloRedondeado<T extends THREE.Path>(destino: T, c: Pick<CajaDelPie, 'x' | 'y' | 'ancho' | 'alto'>, radio: number): T {
  const [x0, x1, y0, y1] = [c.x, c.x + c.ancho, -(c.y + c.alto), -c.y]
  const r = Math.max(0, Math.min(radio, c.ancho / 2 - 0.01, c.alto / 2 - 0.01))
  if (r <= 0.01) {
    destino.moveTo(x0, y0)
    destino.lineTo(x1, y0)
    destino.lineTo(x1, y1)
    destino.lineTo(x0, y1)
    destino.lineTo(x0, y0)
    return destino
  }
  destino.moveTo(x0 + r, y0)
  destino.lineTo(x1 - r, y0)
  destino.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false)
  destino.lineTo(x1, y1 - r)
  destino.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false)
  destino.lineTo(x0 + r, y1)
  destino.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false)
  destino.lineTo(x0, y0 + r)
  destino.absarc(x0 + r, y0 + r, r, Math.PI, (3 * Math.PI) / 2, false)
  return destino
}

/** Le pone a la geometría su color (en cada vértice). */
function pintar(g: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry {
  const n = g.getAttribute('position').count
  const colores = new Float32Array(n * 3)
  for (let i = 0; i < n; i += 1) colores.set([color.r, color.g, color.b], i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(colores, 3))
  return g
}

/** Un sólido con bisel: de z = −espesor a z = 0 (la cara), corrido `adelante` px hacia la cámara. */
function solido(formas: THREE.Shape | THREE.Shape[], espesor: number, bisel: number, adelante = 0): THREE.BufferGeometry {
  const b = Math.min(bisel, espesor / 3)
  const g = new THREE.ExtrudeGeometry(formas, { depth: Math.max(0.1, espesor - 2 * b), curveSegments: 6, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2 })
  g.translate(0, 0, adelante - (espesor - b))
  return g
}

/** La línea de base de una letra (px, y hacia abajo): la caja del carácter con las medidas de su fuente (el modelo de CSS). */
export function baseDeLaLetra(l: Pick<LetraDelPie, 'arriba' | 'alto' | 'cuerpo'>, f: Pick<Font['data'], 'ascender' | 'descender' | 'resolution'>): number {
  const contenido = ((f.ascender - f.descender) / f.resolution) * l.cuerpo
  return l.arriba + (l.alto - contenido) / 2 + (f.ascender / f.resolution) * l.cuerpo
}

/** Las letras: en relieve (`relieve` px hacia la cámara desde `z`) o, sin relieve, extruidas como los títulos (cara en `z`). */
function letras(ls: readonly LetraDelPie[], fuentes: FuentesDelPie, z: number, relieve: number | null): THREE.BufferGeometry[] {
  const { profundidad, bisel } = VOLUMEN_DEL_PIE.texto
  const piezas: THREE.BufferGeometry[] = []
  for (const l of ls) {
    const fuente = fuentes[l.peso]
    // Sin el glifo (un texto que cambió y no se regeneró la fuente): esa letra queda en el DOM... y el invariante lo caza.
    if (fuente.data.glyphs[l.ch] === undefined) continue
    const formas = fuente.generateShapes(l.ch, l.cuerpo)
    const base = baseDeLaLetra(l, fuente.data)
    if (relieve !== null) {
      const alto = Math.max(relieve, VOLUMEN_DEL_PIE.relieve.em * l.cuerpo)
      const g = new THREE.ExtrudeGeometry(formas, { depth: alto, curveSegments: VOLUMEN_DEL_PIE.curvas, bevelEnabled: false })
      g.translate(l.x, -base, z)
      piezas.push(g)
    } else {
      const [d, bg, bt] = [profundidad * l.cuerpo, bisel.grosor * l.cuerpo, bisel.tamano * l.cuerpo]
      const g = new THREE.ExtrudeGeometry(formas, { depth: d, curveSegments: VOLUMEN_DEL_PIE.curvas, bevelEnabled: true, bevelThickness: bg, bevelSize: bt, bevelOffset: -bt, bevelSegments: bisel.segmentos })
      g.translate(l.x, -base, z - d)
      piezas.push(g)
    }
  }
  return piezas
}

const cargador = new SVGLoader()

/**
 * Un ícono en relieve: cada trazo (los `path` del `svg`, en unidades del `viewBox`) como tramos rectos con su grosor y una
 * unión redonda en cada punto (como `stroke-linecap` y `stroke-linejoin` en `round`): sólidos que se pisan, del mismo
 * color, así que se ven como uno. Necesita el navegador (lee el trazo con el `DOMParser`).
 */
function trazo(t: TrazoDelPie, z: number, relieve: number): THREE.BufferGeometry | null {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${t.d.map((d) => `<path d="${d}"/>`).join('')}</svg>`
  const r = (t.grosor / 2) * t.escala
  const formas: THREE.Shape[] = []
  const punto = (p: THREE.Vector2): [number, number] => [t.x + p.x * t.escala, -(t.y + p.y * t.escala)]
  for (const camino of cargador.parse(svg).paths) {
    for (const sub of camino.subPaths) {
      const pts = sub.getPoints(VOLUMEN_DEL_PIE.pasosDelTrazo).map(punto)
      for (let k = 0; k < pts.length; k += 1) {
        const [x, y] = pts[k]
        const union = new THREE.Shape()
        for (let i = 0; i <= VOLUMEN_DEL_PIE.ladosDeLaUnion; i += 1) {
          const a = (i / VOLUMEN_DEL_PIE.ladosDeLaUnion) * Math.PI * 2
          if (i === 0) union.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
          else union.lineTo(x + r * Math.cos(a), y + r * Math.sin(a))
        }
        formas.push(union)
        if (k === 0) continue
        const [px, py] = pts[k - 1]
        const largo = Math.hypot(x - px, y - py)
        if (largo < 1e-3) continue
        const [nx, ny] = [(-(y - py) / largo) * r, ((x - px) / largo) * r]
        formas.push(new THREE.Shape([new THREE.Vector2(px + nx, py + ny), new THREE.Vector2(x + nx, y + ny), new THREE.Vector2(x - nx, y - ny), new THREE.Vector2(px - nx, py - ny)]))
      }
    }
  }
  if (formas.length === 0) return null
  const g = new THREE.ExtrudeGeometry(formas, { depth: relieve, curveSegments: 1, bevelEnabled: false })
  g.translate(0, 0, z)
  return g
}

function relieveDe(m: MedidaDeLaPieza, fuentes: FuentesDelPie, enLaTecla: boolean, z: number): THREE.BufferGeometry[] {
  const { px } = VOLUMEN_DEL_PIE.relieve
  const geos = letras(
    m.letras.filter((l) => l.enLaTecla === enLaTecla),
    fuentes,
    z,
    px,
  )
  for (const t of m.trazos.filter((x) => x.enLaTecla === enLaTecla)) {
    const g = trazo(t, z, px)
    if (g !== null) geos.push(g)
  }
  return geos.map((g) => pintar(g, COLORES_DEL_PIE.claro))
}

function unir(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(geos, false)
  for (const x of geos) x.dispose()
  if (g === null) throw new Error('[RETOQUE DEL PIE] no se pudo unir la pieza')
  g.computeBoundingBox()
  g.computeBoundingSphere()
  return g
}

export interface PiezaArmada {
  /** Lo que se queda quieto en la pieza (la placa del formulario, el texto suelto). */
  readonly fija: THREE.BufferGeometry | null
  /** Lo que se hunde (la placa de un enlace; la tecla del formulario). */
  readonly hundible: THREE.BufferGeometry | null
  /** El espesor de la pieza (px), para su sombra. */
  readonly espesor: number
}

/** Arma la geometría de una pieza con lo que se midió del DOM. */
export function armarLaPieza(forma: 'texto' | 'placa' | 'formulario', m: MedidaDeLaPieza, fuentes: FuentesDelPie): PiezaArmada {
  const v = VOLUMEN_DEL_PIE
  const cara = { x: 0, y: 0, ancho: m.caja.ancho, alto: m.caja.alto }
  if (forma === 'texto') {
    const geos = letras(m.letras, fuentes, 0, null).map((g) => pintar(g, COLORES_DEL_PIE.negro))
    const cuerpo = m.letras.reduce((a, l) => Math.max(a, l.cuerpo), 0)
    return { fija: geos.length === 0 ? null : unir(geos), hundible: null, espesor: v.texto.profundidad * cuerpo }
  }
  if (forma === 'placa') {
    const placa = pintar(solido(rectanguloRedondeado(new THREE.Shape(), cara, m.caja.radio > 0 ? m.caja.radio : v.radio), v.placa, v.bisel), COLORES_DEL_PIE.negro)
    return { fija: null, hundible: unir([placa, ...relieveDe(m, fuentes, false, 0)]), espesor: v.placa }
  }
  // El formulario: la placa con un agujero por campo (su pared es la del pozo) y el fondo de cada pozo, más adentro.
  const contorno = rectanguloRedondeado(new THREE.Shape(), cara, m.caja.radio > 0 ? m.caja.radio : 2 * v.radio)
  for (const p of m.pozos) contorno.holes.push(rectanguloRedondeado(new THREE.Path(), p, p.radio))
  const placa = pintar(solido(contorno, v.formulario, v.bisel), COLORES_DEL_PIE.negro)
  const fondos = m.pozos.map((p) => pintar(solido(rectanguloRedondeado(new THREE.Shape(), { x: p.x - 2, y: p.y - 2, ancho: p.ancho + 4, alto: p.alto + 4 }, p.radio + 2), 1, 0, -v.pozo), COLORES_DEL_PIE.pozo))
  const fija = unir([placa, ...fondos, ...relieveDe(m, fuentes, false, 0)])
  if (m.tecla === null) return { fija, hundible: null, espesor: v.formulario }
  // La tecla: sale `tecla` px de la cara (y entra 4 en la placa, para que hundida no deje luz); su texto, en su cara.
  const tecla = pintar(solido(rectanguloRedondeado(new THREE.Shape(), m.tecla, m.tecla.radio > 0 ? m.tecla.radio : v.radio), v.tecla + 4, v.bisel, v.tecla), COLORES_DEL_PIE.negro)
  return { fija, hundible: unir([tecla, ...relieveDe(m, fuentes, true, v.tecla)]), espesor: v.formulario }
}

/** La caja de lo que se ve de una pieza (px, y hacia abajo, relativa a su caja): para el texto suelto, sus letras. */
export function contenidoDe(forma: 'texto' | 'placa' | 'formulario', m: MedidaDeLaPieza): { readonly izquierda: number; readonly derecha: number; readonly arriba: number; readonly abajo: number } {
  if (forma !== 'texto' || m.letras.length === 0) return { izquierda: 0, derecha: m.caja.ancho, arriba: 0, abajo: m.caja.alto }
  return {
    izquierda: Math.min(...m.letras.map((l) => l.x)),
    derecha: Math.max(...m.letras.map((l) => l.x + l.cuerpo * 0.6)),
    arriba: Math.min(...m.letras.map((l) => l.arriba)),
    abajo: Math.max(...m.letras.map((l) => l.arriba + l.alto)),
  }
}

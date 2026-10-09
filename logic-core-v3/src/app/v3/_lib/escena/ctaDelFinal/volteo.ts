import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { conElAmanecer } from '../amanecer/luz'
import { SATINADO } from '../estudio'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import type { Variante } from '../titulos3d/armado'
import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import type { MetamorfosisArmada } from './EscenaDelCta'
import type { ValorMedido } from './medidaDeLosValores'
import { geometriaDeLaLetra, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { TRANSFORMACION, suave } from './transformacion'

/**
 * [PULIDO 7] F2 · EL VOLTEO — los seis valores se alinean y se voltean en VERTICAL hasta la frase ([PULIDO 8] G1 · aprobado: la
 * metamorfosis `contorno` se borró con su código). Función pura del progreso (el del giro de «HABLANOS»):
 *   1 · ALINEARSE: lo que no es el título de cada valor (su línea y su ícono) se desvanece; los títulos salen de su grilla y se
 *       alinean en las filas de la frase, cada uno sobre su TRAMO (los 4 primeros valores en el primer renglón y los 2 últimos en
 *       el destacado; en el teléfono, en los renglones que tenga la frase en ese ancho), escalados parejo para entrar en él.
 *   2 · VOLTEARSE: cada valor es una placa de dos caras que gira sobre X (en el medio del giro sólo se ve el canto); en la cara de
 *       atrás está su tramo de la frase, por palabras («Este sitio» / «empezó» / «con una» / «charla.» y «El tuyo» / «también.»),
 *       con la malla EXACTA de la frase en su lugar final (con su kerning): al terminar ES la frase, sin ningún cambio de malla.
 *       [PULIDO 8] G1 · todas a la vez (la cascada se borró).
 *   3 · La frase queda rígida y quieta. El último volteo termina cuando termina el giro de «HABLANOS» (`TRANSFORMACION.giro`).
 * En px del lienzo (x a la derecha, y hacia arriba, z hacia la cámara): detrás del logo.
 */
export const VOLTEO = {
  /** Lo que no es el título se desvanece (fracciones del progreso: desde, dura). */
  seVa: [0, 0.1],
  /**
   * Los títulos se alinean en su tramo (desde, dura): cuando el cartel del giro ya bajó a la franja de «HABLANOS» (a 0,22 le
   * falta un 4 % del camino; en el teléfono cruza la de las filas y la lista hasta ~0,21), así no se cruzan; terminan antes del
   * primer volteo.
   */
  alinea: [0.22, 0.08],
  /** Lo que dura el volteo de las placas. */
  voltea: { dura: 0.2 },
  /** El espesor de la placa (cuerpos de la frase): el del cartel del giro. */
  espesor: TRANSFORMACION.giro.espesor,
  /** El título en su cara: no más ancho que esta fracción del tramo ni con más cuerpo que esta fracción del de la frase. */
  cara: { ancho: 0.92, cuerpo: 0.62 },
  /** Las palabras de cada tramo, en orden de lectura: los 4 del primer renglón y los 2 del destacado. */
  tramos: [2, 1, 2, 1, 2, 1],
  /** El espesor de los valores (em de su letra), como el del DOM, y el tramo recto más largo al leer las letras (em). */
  grosor: 0.05,
  maximo: 0.02,
} as const

/** Dónde están los valores en un cuadro (px de la pantalla: la esquina de su caja y su escala) y el progreso (lo arma `EscenaDelCta.tsx`). */
export interface CuadroDelVolteo {
  readonly items: readonly { readonly x: number; readonly y: number; readonly escala: number }[]
  readonly progreso: number
  /** Cuánto se ven los valores de la escena: en el escenario, desde que arranca (antes es el DOM); en la lista, con su entrada. */
  readonly apareceDeLosValores: number
}

const acotar = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (p: number, desde: number, dura: number): number => acotar((p - desde) / dura)

/** Cuándo termina el último volteo: con el giro de «HABLANOS». */
export const FIN_DEL_VOLTEO = TRANSFORMACION.giro.desde + TRANSFORMACION.giro.gira

/** Cuándo arranca el volteo (todas las placas a la vez). */
export const ARRANCA_EL_VOLTEO = FIN_DEL_VOLTEO - VOLTEO.voltea.dura

/** El estado de las placas con el progreso: cuánto se fue lo demás, cuánto se alinearon los títulos y su ángulo (0 a π). */
export function placaDelVolteo(progreso: number): { readonly seVa: number; readonly alinea: number; readonly angulo: number } {
  const p = acotar(progreso)
  return {
    seVa: suave(tramo(p, VOLTEO.seVa[0], VOLTEO.seVa[1])),
    alinea: suave(tramo(p, VOLTEO.alinea[0], VOLTEO.alinea[1])),
    angulo: Math.PI * suave(tramo(p, ARRANCA_EL_VOLTEO, VOLTEO.voltea.dura)),
  }
}

/** Una caja por su centro (px de la pantalla, y hacia abajo). */
export interface CajaDeLaPlaca {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** El ancho de una letra (px): su avance en la fuente. */
const avance = (f: Font, c: string, cuerpo: number): number => ((f.data.glyphs[c]?.ha ?? 0) / f.data.resolution) * cuerpo

/**
 * Los tramos de la frase: sus letras, por palabras (`VOLTEO.tramos`), recorriendo los renglones en orden (`letrasDeLaFrase` las
 * pone así: las que no son espacio, renglón por renglón). Un tramo no cruza renglones: si cae partido, se corta en el renglón.
 */
export function tramosDeLaFrase(renglones: readonly { readonly texto: string }[], letras: readonly LetraDeLaFrase[]): LetraDeLaFrase[][] {
  const palabras: LetraDeLaFrase[][] = []
  let i = 0
  for (const r of renglones) {
    for (const palabra of r.texto.split(/\s+/).filter((w) => w !== '')) {
      palabras.push(letras.slice(i, i + palabra.length))
      i += palabra.length
    }
  }
  const salida: LetraDeLaFrase[][] = []
  let w = 0
  for (const cuantas of VOLTEO.tramos) {
    salida.push(palabras.slice(w, w + cuantas).flat())
    w += cuantas
  }
  return salida
}

/** La caja de un tramo (px de la pantalla): de su primera letra al final del avance de la última, y de su cuerpo. */
export function cajaDelTramo(letras: readonly LetraDeLaFrase[], fuentes: { readonly frase: Font; readonly fuerte: Font }): CajaDeLaPlaca {
  if (letras.length === 0) return { x: 0, y: 0, ancho: 1, alto: 1 }
  const ultima = letras[letras.length - 1]
  const x0 = letras[0].x
  const x1 = ultima.x + avance(ultima.fuerte ? fuentes.fuerte : fuentes.frase, ultima.c, ultima.cuerpo)
  const cuerpo = Math.max(...letras.map((l) => l.cuerpo))
  return { x: (x0 + x1) / 2, y: letras[0].base - 0.35 * cuerpo, ancho: x1 - x0, alto: cuerpo }
}

/** Las letras del título de un valor (las primeras: el DOM lo pone antes que su línea). */
export const letrasDelTitulo = (titulo: string): number => [...titulo].filter((c) => c.trim() !== '').length

/** La caja del título (px de su caja del valor, y hacia abajo). */
export function cajaDelTitulo(v: ValorMedido, cuantas: number, fuente: Font): CajaDeLaPlaca {
  const letras = v.letras.slice(0, cuantas)
  if (letras.length === 0) return { x: 0, y: 0, ancho: 1, alto: 1 }
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const l of letras) {
    x0 = Math.min(x0, l.x)
    x1 = Math.max(x1, l.x + avance(fuente, l.c, l.cuerpo))
    y0 = Math.min(y0, l.base - 0.75 * l.cuerpo)
    y1 = Math.max(y1, l.base + 0.2 * l.cuerpo)
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: x1 - x0, alto: y1 - y0 }
}

/**
 * La escala del título en su cara (la misma en x y en y: ni apretado ni estirado): que entre a lo ancho del tramo y que su cuerpo
 * no pase una fracción del de la frase.
 */
export function escalaDeLaCara(titulo: CajaDeLaPlaca, cuerpoDelTitulo: number, placa: CajaDeLaPlaca): number {
  return Math.min((VOLTEO.cara.ancho * placa.ancho) / Math.max(1e-6, titulo.ancho), (VOLTEO.cara.cuerpo * placa.alto) / Math.max(1e-6, cuerpoDelTitulo))
}

/**
 * Dónde se ve la cara de adelante (el título) con el progreso, en la pantalla (sin el giro): de su lugar en el valor (`item`: la
 * esquina de su caja y su escala de ahora) al centro de su placa, con su escala de la cara.
 */
export function caraEnLaPantalla(alinea: number, titulo: CajaDeLaPlaca, item: { readonly x: number; readonly y: number; readonly escala: number }, placa: CajaDeLaPlaca, escala: number): CajaDeLaPlaca {
  const k = item.escala + (escala - item.escala) * alinea
  const x = item.x + titulo.x * item.escala + (placa.x - (item.x + titulo.x * item.escala)) * alinea
  const y = item.y + titulo.y * item.escala + (placa.y - (item.y + titulo.y * item.escala)) * alinea
  return { x, y, ancho: titulo.ancho * k, alto: titulo.alto * k }
}

// ─── En la escena ────────────────────────────────────────────────────────

const DIA = `( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) )`
const TRAMADO_GLSL = 'fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) )'

/** El satinado de los títulos (el de la frase exacta de la metamorfosis), con un tramado para aparecer y desaparecer. */
function materialDelVolteo(color: Variante, nombre: string): { readonly material: THREE.MeshStandardMaterial; readonly aparece: { value: number } } {
  const aparece = { value: 1 }
  const m = new THREE.MeshStandardMaterial({ color: color === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uAparece = aparece
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vTapa;').replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvTapa = step( 0.5, abs( normal.z ) );')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vTapa;\nuniform float uAparece;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n\tif ( uAparece < 0.999 && ${TRAMADO_GLSL} >= uAparece ) discard;`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, mix( 1.0, vTapa, ${DIA} ) );`)
  }
  m.customProgramCacheKey = () => `volteo-${nombre}-${color}`
  conElAmanecer(m)
  return { material: m, aparece }
}

const juntas = (partes: THREE.BufferGeometry[]): THREE.BufferGeometry => {
  const planas = partes.map((g) => (g.index === null ? g : g.toNonIndexed()))
  const g = planas.length === 0 ? new THREE.BufferGeometry() : mergeGeometries(planas) ?? new THREE.BufferGeometry()
  for (const p of [...partes, ...planas]) if (p !== g) p.dispose()
  return g
}

const area = (c: readonly THREE.Vector2[]): number => Math.abs(c.reduce((s, p, k) => s + p.x * c[(k + 1) % c.length].y - c[(k + 1) % c.length].x * p.y, 0)) / 2

/** Un ícono como geometría (px de la caja del valor, y hacia arriba), con el espesor de los valores: cada trazo abierto, una banda; uno cerrado, un anillo. */
function geometriaDelIcono(svg: string, x: number, y: number, ancho: number): THREE.BufferGeometry[] {
  const k = ancho / 24
  const medio = (1.5 * k) / 2
  return new SVGLoader().parse(svg).paths.flatMap((camino) => camino.subPaths.flatMap((sub) => {
    const pts = sub.getPoints(8).map((p) => new THREE.Vector2(x + p.x * k, -(y + p.y * k)))
    if (pts.length < 2) return []
    const cerrado = pts[0].distanceTo(pts[pts.length - 1]) < 1e-3
    if (cerrado) pts.pop()
    const corrido = (s: number): THREE.Vector2[] => pts.map((p, i) => {
      const t = cerrado ? pts[(i + 1) % pts.length].clone().sub(pts[(i - 1 + pts.length) % pts.length]) : pts[Math.min(pts.length - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)])
      return p.clone().addScaledVector(new THREE.Vector2(-t.y, t.x).normalize(), s * medio)
    })
    const [afuera, adentro] = [corrido(1), corrido(-1)].sort((u, v) => area(v) - area(u))
    const forma = new THREE.Shape(cerrado ? afuera : [...corrido(1), ...corrido(-1).reverse()])
    if (cerrado) forma.holes = [new THREE.Path(adentro)]
    const g = new THREE.ExtrudeGeometry(forma, { depth: VOLTEO.grosor * ancho, curveSegments: 1, bevelEnabled: false })
    g.translate(0, 0, -VOLTEO.grosor * ancho)
    return [g]
  }))
}

/**
 * Arma el volteo: por valor, lo que se va (su línea y su ícono, en su caja) y su placa (el título adelante y su tramo de la frase
 * atrás). `titulos`: el texto de cada título (cuántas letras del valor son suyas).
 */
export function armarElVolteo(valores: readonly (ValorMedido | null)[], renglones: readonly { readonly texto: string }[], frase: readonly LetraDeLaFrase[], fuentes: { readonly valores: Font; readonly frase: Font; readonly fuerte: Font }, color: Variante, titulos: readonly string[]): MetamorfosisArmada {
  const materiales = { titulos: materialDelVolteo(color, 'titulos'), resto: materialDelVolteo(color, 'resto'), frase: materialDelVolteo(color, 'frase') }
  const tramos = tramosDeLaFrase(renglones, frase)
  const objetos: THREE.Object3D[] = []
  const geometrias: THREE.BufferGeometry[] = []
  const malla = (g: THREE.BufferGeometry, m: THREE.Material, nombre: string): THREE.Mesh => {
    geometrias.push(g)
    const o = new THREE.Mesh(g, m)
    o.frustumCulled = false
    o.name = `volteo · ${nombre}`
    return o
  }
  const piezas = valores.map((v, k) => {
    const cuantas = letrasDelTitulo(titulos[k] ?? '')
    const placa = cajaDelTramo(tramos[k] ?? [], fuentes)
    const espesor = VOLTEO.espesor * placa.alto
    // Lo que se va: la línea y el ícono, en px de la caja del valor.
    const valor = new THREE.Group()
    const cara = new THREE.Group()
    const atras = new THREE.Group()
    const grupo = new THREE.Group()
    grupo.name = `volteo · la placa ${String(k)}`
    grupo.add(cara, atras)
    objetos.push(valor, grupo)
    if (v === null) return { valor, cara, atras, grupo, placa, espesor, titulo: { x: 0, y: 0, ancho: 1, alto: 1 }, escala: 1 }
    const resto = [...v.letras.slice(cuantas).map((l) => geometriaDeLaLetra(fuentes.valores, l.c, l.x, l.base, l.cuerpo, VOLTEO.grosor, false, VOLTEO.maximo)), ...v.iconos.flatMap((i) => geometriaDelIcono(i.svg, i.x, i.y, i.ancho))]
    valor.add(malla(juntas(resto), materiales.resto.material, `lo que se va del valor ${String(k)}`))
    cara.add(malla(juntas(v.letras.slice(0, cuantas).map((l) => geometriaDeLaLetra(fuentes.valores, l.c, l.x, l.base, l.cuerpo, VOLTEO.grosor, false, VOLTEO.maximo))), materiales.titulos.material, `el título ${String(k)}`))
    // Atrás, el tramo exacto (el de la frase, con su bisel), relativo al centro de la placa: con la placa volteada queda en su lugar.
    const delTramo = juntas((tramos[k] ?? []).map((l) => geometriaDeLaLetra(l.fuerte ? fuentes.fuerte : fuentes.frase, l.c, l.x, l.base, l.cuerpo, VOLUMEN_DEL_TITULO.profundidad, true, VOLTEO.maximo)))
    delTramo.translate(-placa.x, placa.y, 0)
    atras.add(malla(delTramo, materiales.frase.material, `el tramo ${String(k)}`))
    atras.rotation.x = Math.PI
    atras.position.z = -espesor / 2
    const titulo = cajaDelTitulo(v, cuantas, fuentes.valores)
    const cuerpo = Math.max(1, ...v.letras.slice(0, cuantas).map((l) => l.cuerpo))
    return { valor, cara, atras, grupo, placa, espesor, titulo, escala: escalaDeLaCara(titulo, cuerpo, placa) }
  })
  let costo = 0

  const poner = (c: CuadroDelVolteo): void => {
    const t0 = performance.now()
    const estado = placaDelVolteo(c.progreso)
    piezas.forEach((pz, k) => {
      const item = c.items[k]
      if (item === undefined) return
      // Lo que se va, en la caja de ahora del valor.
      pz.valor.position.set(item.x, -item.y, 0)
      pz.valor.scale.setScalar(item.escala)
      pz.valor.visible = estado.seVa < 1 && c.apareceDeLosValores > 0
      // La placa, en su tramo; voltea con la parte de arriba hacia atrás. Su centro, medio espesor atrás: cada cara queda en z = 0.
      pz.grupo.position.set(pz.placa.x, -pz.placa.y, -pz.espesor / 2)
      pz.grupo.rotation.x = -estado.angulo
      // La cara de adelante: el título, de su lugar en el valor al centro de la placa (relativo a ella, sin girar).
      const enPantalla = caraEnLaPantalla(estado.alinea, pz.titulo, item, pz.placa, pz.escala)
      const k2 = enPantalla.ancho / Math.max(1e-6, pz.titulo.ancho)
      pz.cara.scale.setScalar(k2)
      pz.cara.position.set(enPantalla.x - pz.placa.x - pz.titulo.x * k2, -(enPantalla.y - pz.placa.y - pz.titulo.y * k2), pz.espesor / 2)
      pz.cara.visible = estado.angulo < Math.PI / 2 && c.apareceDeLosValores > 0
      pz.atras.visible = estado.angulo >= Math.PI / 2
      pz.grupo.visible = pz.cara.visible || pz.atras.visible
    })
    materiales.titulos.aparece.value = c.apareceDeLosValores
    materiales.resto.aparece.value = c.apareceDeLosValores * (1 - estado.seVa)
    costo = performance.now() - t0
  }
  return {
    objetos,
    materiales: [materiales.titulos.material, materiales.resto.material, materiales.frase.material],
    poner,
    soltar: () => {
      for (const g of geometrias) g.dispose()
      for (const m of Object.values(materiales)) m.material.dispose()
    },
    costo: () => costo,
  }
}

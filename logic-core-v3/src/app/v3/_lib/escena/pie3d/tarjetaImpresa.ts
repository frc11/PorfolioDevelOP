import * as THREE from 'three'

import { anotarElSuelto, anotarLaImpresion } from '../../diagnostico/anotar'
import { conReimpresion, versionDeLasFuentes } from '../../fuentes'
import type { Armada } from './armadas'
import { pintar, sinLetra } from './geometria'
import { IMPRESAS } from './impresas'
import { materialDelPie } from './material'

/**
 * [CIERRE A-bis] A11 · LA TARJETA DE GRACIAS Y DE ERROR, IMPRESA (la misma solución que [PULIDO 28] AA1 para la letra del formulario,
 * `impresas.ts`). En volumen la tarjeta es DOM sobre la placa lisa (`data-sin-volumen`): su texto seguía a la placa con la transformada
 * del DOM (`domQueSigue.ts`) y, con la órbita del mouse, cada vez que la forma de la cara cambiaba más de medio píxel Chrome volvía a
 * rasterizarlo en otra fase y con otro grosor: titilaba. Ahora lo que se ve del bloque de texto (las letras, el borde y el relleno de
 * los botones, el subrayado) se IMPRIME en la cara de la placa: el mismo dibujo del DOM (sus fuentes, sus colores, el hover y el foco), en
 * una textura a `escala` veces con sus mipmaps y el filtro anisótropo, sobre un plano apenas delante de la cara con el material de la
 * pieza; se vuelve a imprimir sólo cuando cambia lo que se ve, y sigue la entrada del texto (su opacidad y lo que sube). El DOM queda
 * vivo y en píxel entero (los clics, el foco, el lector), con su dibujo apagado (`filter`: la opacidad la anima Motion).
 */
export const TARJETA_IMPRESA = { escala: IMPRESAS.escala, margen: 4, apagado: 'opacity(0)' } as const

interface Impresa {
  readonly id: string
  firma: string
  readonly bloque: HTMLElement
  readonly malla: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
}

const DE_LA_ARMADA = new Map<Armada, Impresa>()
const NEGRO = new THREE.Color(0, 0, 0)

/** Lo que sube el bloque (px) en su transformada calculada (`none` o `matrix(a, b, c, d, x, y)`). */
export function subidaDe(transformada: string): number {
  const m = /^matrix\((.+)\)$/.exec(transformada)
  return m === null ? 0 : parseFloat(m[1].split(',')[5])
}

/**
 * El bloque de texto de la tarjeta de la pieza (no el de la copia de precalentar), o `null`. Sólo en la pieza armada con la tarjeta
 * (`data-estado`): la del formulario, hasta que se rearma, ya tiene la tarjeta en su DOM.
 */
function bloqueDe(a: Armada): HTMLElement | null {
  if (a.pieza.forma !== 'formulario' || a.estado !== 'resultado') return null
  for (const e of a.pieza.elemento.querySelectorAll<HTMLElement>('[data-texto-de-la-tarjeta]')) if (e.closest('[data-precalentar]') === null) return e
  return null
}

/**
 * Lo que se ve del bloque (si cambia, se vuelve a imprimir): el texto, la caja y los colores de cada elemento (el hover, el foco). [CIERRE
 * A-ter] A13 · y las fuentes cargadas (impresa con la de respaldo, se vuelve a imprimir cuando llega la suya).
 */
function firmaDe(bloque: HTMLElement): string {
  let f = `${conReimpresion() ? String(versionDeLasFuentes()) : ''}|${bloque.textContent}|${String(bloque.offsetWidth)}x${String(bloque.offsetHeight)}`
  for (const e of [bloque, ...bloque.querySelectorAll('*')]) {
    const s = getComputedStyle(e)
    f += `|${s.color}${s.backgroundColor}${s.borderTopColor}${s.textDecorationColor}`
  }
  return f
}

/** Dibuja en `c` (px de la pieza, ya escalado y corrido) el bloque como lo pinta el DOM: cajas (relleno y borde), letras y subrayados. */
function dibujar(c: CanvasRenderingContext2D, bloque: HTMLElement, origen: DOMRect): void {
  const rango = document.createRange()
  const recorrido = document.createTreeWalker(bloque, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  for (let n: Node | null = recorrido.currentNode; n !== null; n = recorrido.nextNode()) {
    if (n instanceof Element) {
      const s = getComputedStyle(n)
      const r = n.getBoundingClientRect()
      const [x, y, radio, borde] = [r.left - origen.left, r.top - origen.top, parseFloat(s.borderTopLeftRadius) || 0, parseFloat(s.borderTopWidth) || 0]
      c.fillStyle = s.backgroundColor
      c.beginPath()
      c.roundRect(x, y, r.width, r.height, radio)
      c.fill()
      if (borde > 0) {
        c.strokeStyle = s.borderTopColor
        c.lineWidth = borde
        c.beginPath()
        c.roundRect(x + borde / 2, y + borde / 2, r.width - borde, r.height - borde, Math.max(0, radio - borde / 2))
        c.stroke()
      }
      continue
    }
    const padre = n.parentElement
    if (!(n instanceof Text) || padre === null || padre.closest('.sr-only') !== null) continue
    const s = getComputedStyle(padre)
    c.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
    c.fillStyle = s.color
    const subraya = s.textDecorationLine.includes('underline')
    const cuerpo = parseFloat(s.fontSize)
    for (let k = 0; k < n.length; k += 1) {
      const ch = n.data[k]
      // Un espacio no se dibuja, pero el subrayado sigue por él (como en el DOM).
      const espacio = ch.trim() === ''
      if (espacio && !subraya) continue
      rango.setStart(n, k)
      rango.setEnd(n, k + 1)
      const r = rango.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      const letra = s.textTransform === 'uppercase' ? ch.toLocaleUpperCase('es') : ch
      const base = r.top - origen.top + c.measureText(letra).fontBoundingBoxAscent
      if (!espacio) c.fillText(letra, r.left - origen.left, base)
      if (subraya) {
        c.save()
        c.fillStyle = s.textDecorationColor
        c.fillRect(r.left - origen.left, base + 0.1 * cuerpo + (parseFloat(s.textUnderlineOffset) || 0), r.width, parseFloat(s.textDecorationThickness) || 1)
        c.restore()
      }
    }
  }
}

/** Imprime el bloque (en px de la pieza: la caja del DOM sin su transformada ni la de la entrada del texto): la geometría y la textura. */
function imprimir(a: Armada, bloque: HTMLElement): { readonly geometria: THREE.BufferGeometry; readonly textura: THREE.CanvasTexture } | null {
  const el = a.pieza.elemento
  const [antes, subida] = [el.style.transform, bloque.style.transform]
  el.style.transform = ''
  bloque.style.transform = 'none'
  const origen = el.getBoundingClientRect()
  const r = bloque.getBoundingClientRect()
  const M = TARJETA_IMPRESA.margen
  const [x0, y0] = [Math.floor(r.left - origen.left) - M, Math.floor(r.top - origen.top) - M]
  const [ancho, alto] = [Math.ceil(r.width) + 2 * M, Math.ceil(r.height) + 2 * M]
  const S = TARJETA_IMPRESA.escala
  const lienzo = document.createElement('canvas')
  lienzo.width = ancho * S
  lienzo.height = alto * S
  const c = lienzo.getContext('2d')
  if (c !== null) {
    c.scale(S, S)
    c.translate(-x0, -y0)
    dibujar(c, bloque, origen)
  }
  el.style.transform = antes
  bloque.style.transform = subida
  if (c === null) return null
  const plano = new THREE.PlaneGeometry(ancho, alto)
  plano.translate(x0 + ancho / 2, -(y0 + alto / 2), IMPRESAS.adelante)
  const textura = new THREE.CanvasTexture(lienzo)
  textura.colorSpace = THREE.SRGBColorSpace
  textura.anisotropy = IMPRESAS.anisotropia
  return { geometria: sinLetra(pintar(plano, NEGRO)), textura }
}

/**
 * La malla de la tarjeta impresa en el viaje de la pieza: el material de la pieza (su llegada, su caída) con la textura como su brillo
 * propio, sin luz, reflejos ni tono: los colores del DOM (con la luz del satinado, el rojo del error salía lavado).
 */
function colgar(a: Armada, geometria: THREE.BufferGeometry, textura: THREE.CanvasTexture): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
  const material = materialDelPie(a.uniformes)
  material.map = textura
  material.emissiveMap = textura
  material.emissive.setRGB(1, 1, 1)
  material.roughness = 1
  material.toneMapped = false
  material.transparent = true
  material.depthWrite = false
  material.polygonOffset = true
  material.polygonOffsetFactor = -1
  material.polygonOffsetUnits = -4
  const malla = new THREE.Mesh(geometria, material)
  malla.frustumCulled = false
  malla.name = 'tarjeta impresa'
  a.viaje.add(malla)
  return malla
}

function soltarLaImpresa(i: Impresa): void {
  i.malla.removeFromParent()
  i.malla.geometry.dispose()
  i.malla.material.map?.dispose()
  i.malla.material.dispose()
  anotarElSuelto(i.id)
  // El DOM, otra vez a la vista (si ninguna otra lo imprime).
  if (![...DE_LA_ARMADA.values()].some((x) => x !== i && x.bloque === i.bloque)) i.bloque.style.filter = ''
}

/**
 * Un cuadro (y cada rearmado, antes de compilar la transformación: la malla se compila con la entrante): la tarjeta de cada formulario,
 * impresa si cambió lo que se ve, con la opacidad y la subida de la entrada del texto. Las de una pieza que ya no está (ni como saliente
 * de una transformación) se sueltan; sin armadas, todas.
 */
export function imprimirLasTarjetas(armadas: readonly Armada[]): void {
  const vivas = new Set<Armada>()
  for (const a of armadas) {
    vivas.add(a)
    if (a.transformacion !== null) vivas.add(a.transformacion.saliente)
  }
  for (const [a, i] of DE_LA_ARMADA) {
    if (vivas.has(a)) continue
    soltarLaImpresa(i)
    DE_LA_ARMADA.delete(a)
  }
  for (const a of armadas) {
    const bloque = bloqueDe(a)
    let i = DE_LA_ARMADA.get(a)
    if (i !== undefined && i.bloque !== bloque) {
      soltarLaImpresa(i)
      DE_LA_ARMADA.delete(a)
      i = undefined
    }
    if (bloque === null) continue
    const firma = firmaDe(bloque)
    if (i === undefined || i.firma !== firma) {
      const hecha = imprimir(a, bloque)
      if (hecha === null) continue
      if (i === undefined) {
        i = { id: `tarjeta:${a.pieza.id}`, firma, bloque, malla: colgar(a, hecha.geometria, hecha.textura) }
        DE_LA_ARMADA.set(a, i)
      } else {
        i.malla.geometry.dispose()
        i.malla.material.map?.dispose()
        i.malla.geometry = hecha.geometria
        i.malla.material.map = hecha.textura
        i.malla.material.emissiveMap = hecha.textura
        i.firma = firma
      }
      bloque.style.filter = TARJETA_IMPRESA.apagado
      anotarLaImpresion(i.id, bloque)
    }
    // La entrada del texto (Motion: su opacidad y lo que sube), en la placa: lo calculado (Motion puede animar sin escribir el estilo).
    const calculado = getComputedStyle(bloque)
    i.malla.material.opacity = parseFloat(calculado.opacity)
    i.malla.position.y = -subidaDe(calculado.transform)
  }
}

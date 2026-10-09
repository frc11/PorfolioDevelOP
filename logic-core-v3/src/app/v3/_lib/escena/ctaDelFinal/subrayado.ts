import * as THREE from 'three'

import type { ContornoDelLogo } from '../logoDeNoche'
import type { Variante } from '../titulos3d/armado'
import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import { contornoDelRenglon, materialDelCta, type MaterialDelCta } from './material'
import { ctaTocable, enLaCaraDelCta, suave, type CajaEnPantalla } from './transformacion'

/**
 * [PULIDO 8] G2 · EL SUBRAYADO DE «HABLANOS» — que se note que es un botón: con el mouse encima o con el foco del teclado (visible),
 * una barra se dibuja debajo de «HABLANOS» de izquierda a derecha (`SUBRAYADO.s`) y se retira al salir. Es 3D, en el marco del CTA
 * y con su giro (anclada en el mundo bajo el texto, acompaña la perspectiva): el volumen de los títulos (su espesor y su bisel) y
 * el material del CTA con su propio contorno (el filo de noche). Con el dedo no hay hover: se dibuja una vez, cuando «HABLANOS»
 * termina de formarse, y queda. Con movimiento reducido aparece sin animación.
 */
export const SUBRAYADO = {
  /** Lo que tarda en dibujarse entero (y en retirarse), s. */
  s: 0.3,
  /** Su alto y dónde va su centro, debajo de la línea de base (em del CTA). */
  grosor: 0.07,
  debajo: 0.13,
} as const

export interface SubrayadoDelCta {
  readonly grupo: THREE.Group
  readonly material: MaterialDelCta
  readonly contorno: ContornoDelLogo
  readonly geometria: THREE.BufferGeometry
  /** Cuánto está dibujado (0 a 1). */
  dibujado: number
}

/** La barra: de 0 a `ancho` (em) en x, centrada en y; la cara de adelante en z = 0 y el volumen atrás, como las letras. */
export function armarElSubrayado(ancho: number, color: Variante): SubrayadoDelCta {
  const { bisel, curvas, profundidad } = VOLUMEN_DEL_TITULO
  const medio = SUBRAYADO.grosor / 2
  const borde = [new THREE.Vector2(0, -medio), new THREE.Vector2(ancho, -medio), new THREE.Vector2(ancho, medio), new THREE.Vector2(0, medio)]
  const geometria = new THREE.ExtrudeGeometry(new THREE.Shape(borde), { depth: profundidad, curveSegments: curvas, bevelEnabled: true, bevelThickness: bisel.grosor, bevelSize: bisel.tamano, bevelOffset: -bisel.tamano, bevelSegments: bisel.segmentos })
  geometria.translate(0, 0, -profundidad)
  const contorno = contornoDelRenglon([borde])
  const material = materialDelCta(color, contorno)
  const malla = new THREE.Mesh(geometria, material.material)
  malla.frustumCulled = false
  const grupo = new THREE.Group()
  grupo.name = 'cta del final · el subrayado'
  grupo.add(malla)
  grupo.visible = false
  return { grupo, material, contorno, geometria, dibujado: 0 }
}

export function soltarElSubrayado(s: SubrayadoDelCta): void {
  s.geometria.dispose()
  s.material.material.dispose()
  s.contorno.textura.dispose()
}

/** Lo pide: con el dedo, «HABLANOS» formado; con el mouse o el teclado, el hover o el foco visible sobre el CTA ya tocable. */
export function pideElSubrayado(progreso: number, e: { readonly hover: boolean; readonly foco: boolean; readonly tactil: boolean }): boolean {
  return e.tactil ? progreso >= 0.999 : (e.hover || e.foco) && ctaTocable(progreso)
}

/** Cuánto está dibujado después de `dt` (s): hacia 1 si lo pide, hacia 0 si no, parejo (`SUBRAYADO.s` de punta a punta); quieto, de golpe. */
export function pasoDelSubrayado(dibujado: number, pide: boolean, dt: number, quieto: boolean): number {
  const meta = pide ? 1 : 0
  if (quieto) return meta
  const paso = dt / SUBRAYADO.s
  return pide ? Math.min(meta, dibujado + paso) : Math.max(meta, dibujado - paso)
}

/** Lo que se ve dibujado (de izquierda a derecha, con la curva de la casa). */
export const anchoDelSubrayado = (dibujado: number): number => suave(dibujado)

const EN_LA_CARA = { x: 0, y: 0, z: 0 }

/**
 * El subrayado en este cuadro: cuánto está dibujado (lo pide el hover, el foco o, con el dedo, el CTA formado) y dónde: su comienzo
 * en la cara de «HABLANOS» con el giro (`g`: la caja del CTA, dónde se arma el cartel, el progreso, el giro de sus letras, si su
 * cara se ve y el levante del hover).
 */
export function ponerElSubrayado(u: SubrayadoDelCta, linea: { readonly izquierda: number; readonly base: number; readonly cuerpo: number } | null, g: { readonly c: CajaEnPantalla; readonly armado: number; readonly p: number; readonly giro: number; readonly seVe: boolean; readonly levanta: number }, e: { readonly hover: boolean; readonly foco: boolean; readonly tactil: boolean }, quieto: boolean, dt: number): void {
  u.dibujado = pasoDelSubrayado(u.dibujado, pideElSubrayado(g.p, e), dt, quieto)
  const ancho = anchoDelSubrayado(u.dibujado)
  u.grupo.visible = linea !== null && g.seVe && ancho > 0.001
  if (!u.grupo.visible || linea === null) return
  enLaCaraDelCta(g.p, g.c, g.armado, { x: linea.izquierda, y: linea.base + SUBRAYADO.debajo * linea.cuerpo }, linea.cuerpo, EN_LA_CARA)
  u.grupo.position.set(EN_LA_CARA.x, -EN_LA_CARA.y, EN_LA_CARA.z + g.levanta)
  u.grupo.rotation.set(0, g.giro, 0)
  u.grupo.scale.set(linea.cuerpo * ancho, linea.cuerpo, linea.cuerpo)
}

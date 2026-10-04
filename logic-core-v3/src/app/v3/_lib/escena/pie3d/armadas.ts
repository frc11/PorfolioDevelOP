import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datos400 from '../../../_fuentes/chivo-400-pie.json'
import datos500 from '../../../_fuentes/chivo-500-pie.json'
import datos600 from '../../../_fuentes/chivo-600-pie.json'
import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { firmaDeLaForma, medirLaPieza, type MedidaDeLaPieza } from '../../pie3d/medida'
import { HUNDIDOS, PIEZAS_DEL_PIE, PROGRESO_DEL_PIE, cuantoSeHunde, type PiezaDelPie } from '../../pie3d/registro'
import { ASIENTO } from '../../titulos3d/repeticiones'
import { KEY_INTENSITY } from '../probeLighting'
import { FLOOR_Y } from '../probeScene'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { caraEnElCuadro, colocarLaPieza, profundidadDeLaPieza } from './colocacion'
import { apareceDeLaPieza, avanceDelPie, deLaPieza, ordenesDelGrupo, poseDeLaPieza, progresoDelTramo, tramoDe, uniformesDelPie, type UniformesDelPie } from './coreografia'
import { armarLaPieza, contenidoDe, type FuentesDelPie } from './geometria'
import { materialDelPie } from './material'
import { MAXIMO_DE_SOMBRAS_DEL_PIE, SOMBRAS_DEL_PIE, SOMBRA_DEL_PIE, formaDeLaSombra } from './sombras'

/**
 * [RETOQUE DEL PIE] P2 · LAS PIEZAS ARMADAS DEL PIE Y SU CUADRO — sin React (el componente, `PieDeVolumen.tsx`, sólo
 * engancha esto a la escena): medir y armar las piezas (`rearmar`), y en cada cuadro ponerlas en su lugar del mundo,
 * hundirlas, llevar lo interactivo del DOM sobre su cara y escribir sus sombras en el piso (`alCuadro`).
 *
 * [PASADA FINAL] C2 · y su coreografía por columnas (`coreografia.ts`): entre su lugar en el mundo y su geometría, cada
 * pieza tiene su viaje (`viaje`, la pose de su llegada); el DOM se lleva con el viaje en cero (donde la pieza va a quedar)
 * y no recibe clics hasta que la pieza llegó.
 */
const FUENTES: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData) }

/** Cuánto se hunde (px) y en cuánto tiempo (la constante, s). */
export const HUNDIDA_DEL_PIE = { encima: 5, apretada: 12, tau: 0.05 } as const

/** Lo que se dibuja fuera del cuadro (px): una pieza que entra ya está. */
const MARGEN = 120

export interface Armada {
  readonly pieza: PiezaDelPie
  medida: MedidaDeLaPieza
  readonly firma: string
  readonly grupo: THREE.Group
  /** [PASADA FINAL] C2 · la pose de su llegada, entre su lugar (`grupo`) y su geometría. */
  readonly viaje: THREE.Group
  /** Lo que se hunde: la placa de un enlace; en el formulario, la tecla. */
  readonly cuerpo: THREE.Group
  readonly mallas: readonly THREE.Mesh[]
  readonly material: THREE.MeshStandardMaterial
  readonly uniformes: UniformesDelPie
  readonly espesor: number
  readonly contenido: ReturnType<typeof contenidoDe>
  readonly delHundido: Element | null
  hundido: number
  css: string
  d: number
  mundoPorPx: number
  /** Su lugar en el escalonado de su columna (0 la primera, 1 la última), cuánto llegó y si el DOM ya recibe clics. */
  orden: number
  llego: number
  tocable: boolean
}

export interface EstadoDelPie {
  armadas: Armada[]
  /** Los reflejos del estudio, para el material de cada pieza (lo arma el efecto del estudio). */
  estudio: THREE.Texture | null
  quieto: boolean
  fuentes: boolean
  /** Se compila una vez: mientras, no se dibuja ni se le escribe al DOM. */
  compilando: boolean
  listo: boolean
  montado: boolean
  readonly cuadrilatero: number[]
  readonly matriz: number[]
  /** [PASADA FINAL] C2 · lo mostrado de la coreografía (0 a 1) y el último movimiento del scroll (para el asiento). */
  readonly coreografia: { mostrado: number; y: number; cuando: number }
}

const PUNTO = new THREE.Vector3()

/** Un cuadro: cada pieza a la vista, en su lugar del mundo; su llegada; su hundido; lo interactivo sobre ella; su sombra. */
export function alCuadro(s: EstadoDelPie, viva: THREE.Camera, principal: THREE.DirectionalLight | null, cuadro: { readonly ancho: number; readonly alto: number }, dt: number): void {
  if (!s.listo || s.estudio === null || s.armadas.length === 0) return
  viva.updateMatrixWorld()
  const nivel = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  avanzarLaCoreografia(s.coreografia, dt)
  // A la profundidad del logo, o adelante si ahí alguna quedaría bajo el piso (`colocacion.ts`): todas en el mismo plano
  // (el pie se mueve entero con el paralaje: un rótulo no se despega de su columna).
  let d = Number.POSITIVE_INFINITY
  for (const a of s.armadas) {
    const arriba = a.medida.caja.y - scrollY
    const c = a.contenido
    a.grupo.visible = arriba + c.abajo > -MARGEN && arriba + c.arriba < cuadro.alto + MARGEN
    if (a.grupo.visible) d = Math.min(d, profundidadDeLaPieza(CAMARA_SIN_EL_MOUSE, a.medida.caja.x - scrollX + (c.izquierda + c.derecha) / 2, arriba + c.abajo, cuadro.ancho, cuadro.alto))
  }
  let sombras = 0
  for (const a of s.armadas) {
    if (!a.grupo.visible) continue
    a.material.envMapIntensity = nivel
    const izquierda = a.medida.caja.x - scrollX
    const arriba = a.medida.caja.y - scrollY
    a.d = d
    a.mundoPorPx = colocarLaPieza(a.grupo, CAMARA_SIN_EL_MOUSE, izquierda, arriba, cuadro.ancho, cuadro.alto, d)
    const pedido = cuantoSeHunde(a.delHundido === null ? undefined : HUNDIDOS.get(a.delHundido), HUNDIDA_DEL_PIE.encima / HUNDIDA_DEL_PIE.apretada) * HUNDIDA_DEL_PIE.apretada
    a.hundido = s.quieto ? pedido : pedido + (a.hundido - pedido) * Math.exp(-dt / HUNDIDA_DEL_PIE.tau)
    a.cuerpo.position.z = -a.hundido
    // El DOM, donde la pieza va a quedar (el viaje en cero); después, la pieza en camino.
    a.viaje.matrix.identity()
    a.grupo.updateMatrixWorld(true)
    if (a.pieza.forma !== 'texto') seguirLaPieza(a, viva, cuadro, izquierda, arriba, s)
    llegar(a, s)
    a.viaje.updateMatrixWorld(true)
    if (sombras < MAXIMO_DE_SOMBRAS_DEL_PIE) sombras = sombraDe(a, sombras)
  }
  SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = sombras
}

/** [PASADA FINAL] C2 · lo mostrado persigue al scroll por tramos (en un viaje del menú, desarmado); con el scroll quieto, se asienta. */
function avanzarLaCoreografia(c: EstadoDelPie['coreografia'], dt: number): void {
  const ahora = performance.now()
  if (scrollY !== c.y) {
    c.y = scrollY
    c.cuando = ahora
  }
  const enViaje = viajeEnCurso() !== null
  const pedido = enViaje ? 0 : (PROGRESO_DEL_PIE.valor?.get() ?? 1)
  c.mostrado = avanceDelPie(c.mostrado, pedido, !enViaje && ahora - c.cuando > ASIENTO.quietoMs, dt, enViaje)
}

/** La pieza en su tramo: su pose, cuánto se ve (y sus letras, el titular) y si su DOM ya recibe clics. */
function llegar(a: Armada, s: EstadoDelPie): void {
  const tramo = tramoDe(a.pieza.llegada)
  const e = deLaPieza(progresoDelTramo(tramo, s.coreografia.mostrado), a.orden, tramo.dura)
  const porLetras = a.pieza.forma === 'texto' && a.pieza.llegada === 'atras'
  a.llego = e
  poseDeLaPieza(a.pieza.llegada, e, { ancho: a.medida.caja.ancho, alto: a.medida.caja.alto, espesor: a.espesor }, porLetras, s.quieto, a.viaje.matrix)
  a.uniformes.uLetrasDelPie.value = porLetras ? e : -1
  a.uniformes.uApareceDelPie.value = apareceDeLaPieza(a.pieza.llegada, e, porLetras)
  a.uniformes.uQuietoDelPie.value = s.quieto ? 1 : 0
  const tocable = e >= 0.999
  if (a.pieza.forma === 'texto' || tocable === a.tocable) return
  a.tocable = tocable
  a.pieza.elemento.style.pointerEvents = tocable ? '' : 'none'
}

/** Mide todas las piezas; arma las nuevas y las que cambiaron de forma, y suelta las que se fueron. */
export function rearmar(s: EstadoDelPie, raiz: THREE.Group, estudio: THREE.Texture): void {
  const antes = new Map(s.armadas.map((a) => [a.pieza.id, a]))
  const ahora: Armada[] = []
  for (const p of [...PIEZAS_DEL_PIE.values()].sort((a, b) => a.orden - b.orden)) {
    const medida = medirLaPieza(p.elemento, p.forma)
    const firma = firmaDeLaForma(medida)
    const vieja = antes.get(p.id)
    if (vieja !== undefined && vieja.pieza === p && vieja.firma === firma) {
      vieja.medida = medida
      antes.delete(p.id)
      ahora.push(vieja)
      continue
    }
    const a = armar(p, medida, firma, estudio)
    if (vieja !== undefined) a.hundido = vieja.hundido
    raiz.add(a.grupo)
    ahora.push(a)
  }
  for (const a of antes.values()) {
    raiz.remove(a.grupo)
    soltar(a)
  }
  // [PASADA FINAL] C2 · el escalonado de cada columna: de arriba abajo y de izquierda a derecha (las cajas del DOM).
  for (const llegada of ['atras', 'tapa', 'fundido'] as const) {
    const delGrupo = ahora.filter((a) => a.pieza.llegada === llegada)
    const ordenes = ordenesDelGrupo(delGrupo.map((a) => ({ x: a.medida.caja.x, y: a.medida.caja.y })))
    delGrupo.forEach((a, k) => {
      a.orden = ordenes[k]
    })
  }
  s.armadas = ahora
}

function armar(pieza: PiezaDelPie, medida: MedidaDeLaPieza, firma: string, estudio: THREE.Texture): Armada {
  const { fija, hundible, espesor } = armarLaPieza(pieza.forma, medida, FUENTES)
  const uniformes = uniformesDelPie()
  uniformes.uCuerpoDelPie.value = medida.letras.reduce((m, l) => Math.max(m, l.cuerpo), 0)
  const material = materialDelPie(uniformes)
  material.envMap = estudio
  const grupo = new THREE.Group()
  const viaje = new THREE.Group()
  viaje.matrixAutoUpdate = false
  const cuerpo = new THREE.Group()
  grupo.add(viaje)
  viaje.add(cuerpo)
  grupo.name = `pie de volumen · ${pieza.forma}`
  const mallas: THREE.Mesh[] = []
  for (const [geo, padre] of [[fija, viaje], [hundible, cuerpo]] as const) {
    if (geo === null) continue
    const malla = new THREE.Mesh(geo, material)
    // Las letras del titular salen de su caja en el sombreador: sin descarte por encuadre (el pie son pocas mallas).
    malla.frustumCulled = false
    padre.add(malla)
    mallas.push(malla)
  }
  grupo.visible = false
  if (pieza.forma !== 'texto') pieza.elemento.style.transformOrigin = '0 0'
  const delHundido = pieza.forma === 'placa' ? pieza.elemento : pieza.forma === 'formulario' ? pieza.elemento.querySelector('[data-forma="principal"]') : null
  return { pieza, medida, firma, grupo, viaje, cuerpo, mallas, material, uniformes, espesor, contenido: contenidoDe(pieza.forma, medida), delHundido, hundido: 0, css: '', d: 0, mundoPorPx: 0, orden: 0, llego: 0, tocable: true }
}

export function soltar(a: Armada): void {
  a.grupo.removeFromParent()
  for (const malla of a.mallas) malla.geometry.dispose()
  a.material.dispose()
  if (a.pieza.forma !== 'texto') {
    a.pieza.elemento.style.transform = ''
    a.pieza.elemento.style.transformOrigin = ''
    a.pieza.elemento.style.pointerEvents = ''
  }
}

/** Lo interactivo, sobre la cara de su pieza como la ve la cámara viva (la placa, hundida con ella). */
function seguirLaPieza(a: Armada, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, izquierda: number, arriba: number, s: EstadoDelPie): void {
  const { ancho, alto } = a.medida.caja
  caraEnElCuadro(a.pieza.forma === 'placa' ? a.cuerpo : a.grupo, viva, ancho, alto, 0, cuadro, { x: izquierda, y: arriba }, s.cuadrilatero)
  if (!homografia(ancho, alto, s.cuadrilatero, s.matriz)) return
  const css = matrix3dCss(s.matriz)
  if (css === a.css) return
  a.css = css
  a.pieza.elemento.style.transform = css
}

/** La sombra de la pieza en el piso: debajo de su borde de abajo (y de la mitad de su espesor), con su ancho; en camino, con ella. */
function sombraDe(a: Armada, n: number): number {
  const c = a.contenido
  PUNTO.set((c.izquierda + c.derecha) / 2, -c.abajo, -a.espesor / 2).applyMatrix4(a.viaje.matrixWorld)
  const { alfa, blanda } = formaDeLaSombra(PUNTO.y - FLOOR_Y)
  // [PASADA FINAL] C2 · lo que todavía no se ve no deja sombra (el titular, letra por letra: con lo que llegó).
  const ve = a.uniformes.uLetrasDelPie.value >= 0 ? a.llego : a.uniformes.uApareceDelPie.value
  if (alfa * ve < 0.01) return n
  const mpp = a.mundoPorPx
  SOMBRAS_DEL_PIE.uSombrasDelPie.value[n].set(PUNTO.x, PUNTO.z, ((c.derecha - c.izquierda) / 2) * mpp + SOMBRA_DEL_PIE.sobra, (a.espesor / 2) * mpp + SOMBRA_DEL_PIE.sobra)
  SOMBRAS_DEL_PIE.uFormaDeLasSombrasDelPie.value[n].set(blanda, alfa * ve, 0, 0)
  return n + 1
}

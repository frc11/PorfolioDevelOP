import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datos400 from '../../../_fuentes/chivo-400-pie.json'
import datos500 from '../../../_fuentes/chivo-500-pie.json'
import datos600 from '../../../_fuentes/chivo-600-pie.json'
import datosArchivo from '../../../_fuentes/archivo-700-titulos.json'
import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { firmaDeLaForma, medirLaPieza, type MedidaDeLaPieza } from '../../pie3d/medida'
import { HUNDIDOS, PIEZAS_DEL_PIE, PROGRESO_DEL_PIE, cuantoSeHunde, type PiezaDelPie } from '../../pie3d/registro'
import { ASIENTO } from '../../titulos3d/repeticiones'
import { KEY_INTENSITY } from '../probeLighting'
import { EN_VIVO, profundidadDelFinal, scrollDelPie } from '../final/recorridoDelFinal'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { varianteDeGracias, type VarianteDeGracias } from '../../formularios/gracias'
import { viajeEnCurso } from '../viaje'
import { caraEnElCuadro, colocarLaPieza, profundidadDeLaPieza } from './colocacion'
import { apareceDeLaPieza, avanceDelPie, deLaPieza, ordenesDelGrupo, poseDeLaPieza, progresoDelTramo, tramoDe, uniformesDelPie, type UniformesDelPie } from './coreografia'
import { armarLaPieza, contenidoDe, type FuentesDelPie } from './geometria'
import { LUZ_DEL_PIE, giroDeLaLuzDelPie, materialDelPie } from './material'
import { CAJAS_DEL_PIE, escribirLaCaja } from './cajasDelPolvo'
import { SOMBRAS_DEL_PIE } from './sombras'
import { duracionDeLaTransformacion, poseDeLaTransformacion } from './transformacionDelPie'

/**
 * [RETOQUE DEL PIE] P2 · LAS PIEZAS ARMADAS DEL PIE Y SU CUADRO — sin React (el componente, `PieDeVolumen.tsx`, sólo
 * engancha esto a la escena): medir y armar las piezas (`rearmar`), y en cada cuadro ponerlas en su lugar del mundo,
 * hundirlas y llevar lo interactivo del DOM sobre su cara (`alCuadro`; [NOCTURNO FINAL] A4 · ya sin sombras en el piso).
 *
 * [PASADA FINAL] C2 · y su coreografía por columnas (`coreografia.ts`): entre su lugar en el mundo y su geometría, cada
 * pieza tiene su viaje (`viaje`, la pose de su llegada); el DOM se lleva con el viaje en cero (donde la pieza va a quedar)
 * y no recibe clics hasta que la pieza llegó.
 */
// [PULIDO 9] H2 · y Archivo, para el mensaje de la tarjeta de gracias.
const FUENTES: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData), archivo: new Font(datosArchivo as FontData) }

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
  /** [NOCTURNO FINAL] B4 · su caja en la pieza (px): para que el polvo que cae no la atraviese. */
  readonly caja: THREE.Box3
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
  /** [PULIDO 9] H2 · el estado del formulario al medirlo (`data-estado`) y, si cambió, su transformación en curso. */
  readonly estado: string | null
  transformacion: TransformacionEnCurso | null
}

/** [PULIDO 9] H2 · la placa que estaba (sus mallas, en el grupo de la nueva) y cuánto va (0 a 1). */
interface TransformacionEnCurso {
  readonly variante: VarianteDeGracias
  readonly saliente: Armada
  t: number
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

/** Un cuadro: cada pieza a la vista, en su lugar del mundo; su llegada; su hundido; lo interactivo sobre ella. */
export function alCuadro(s: EstadoDelPie, viva: THREE.Camera, principal: THREE.DirectionalLight | null, cuadro: { readonly ancho: number; readonly alto: number }, dt: number): void {
  // [RETOQUE DEL ENCASTRE] 1D · el final del pie espera a que el pie haya aparecido entero (lo de abajo, al terminar el cuadro).
  EN_VIVO.pieEntero = false
  if (!s.listo || s.estudio === null || s.armadas.length === 0) {
    CAJAS_DEL_PIE.uCuantasCajasDelPie.value = 0
    return
  }
  viva.updateMatrixWorld()
  const nivel = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  // [RETOQUE DEL ENCASTRE] 1G · la luz como antes de la cinemática (`material.ts`).
  giroDeLaLuzDelPie(viva.quaternion, EN_VIVO.giroDelPie, LUZ_DEL_PIE.uGiroDeLaLuz.value)
  avanzarLaCoreografia(s.coreografia, dt)
  // A la profundidad del logo, o adelante si ahí alguna quedaría bajo el piso (`colocacion.ts`): todas en el mismo plano
  // (el pie se mueve entero con el paralaje: un rótulo no se despega de su columna).
  let d = Number.POSITIVE_INFINITY
  // [CIERRE] 3 · en la cola del final el pie queda pegado arriba: sus piezas, con el scroll en que se pegó.
  const sy = scrollDelPie(scrollY)
  for (const a of s.armadas) {
    const arriba = a.medida.caja.y - sy
    const c = a.contenido
    a.grupo.visible = arriba + c.abajo > -MARGEN && arriba + c.arriba < cuadro.alto + MARGEN
    if (a.grupo.visible) d = Math.min(d, profundidadDeLaPieza(CAMARA_SIN_EL_MOUSE, a.medida.caja.x - scrollX + (c.izquierda + c.derecha) / 2, arriba + c.abajo, cuadro.ancho, cuadro.alto))
  }
  // [CIERRE] 3 · en el final del pie van con la cámara (que sube a mirar el logo desde arriba): adelante del piso, con aire.
  d = Math.min(d, profundidadDelFinal(CAMARA_SIN_EL_MOUSE))
  for (const a of s.armadas) {
    if (!a.grupo.visible) continue
    a.material.envMapIntensity = nivel
    const izquierda = a.medida.caja.x - scrollX
    const arriba = a.medida.caja.y - sy
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
    if (a.transformacion !== null) transformar(a, a.transformacion, s.quieto, dt)
    a.viaje.updateMatrixWorld(true)
  }
  // [NOCTURNO FINAL] A4 · las piezas del pie no proyectan sombra sobre la escena (eran sombras de contacto en el piso vivo).
  SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0
  // [NOCTURNO FINAL] B4 · y el polvo que cae no las atraviesa: sus cajas, para la simulación (`cajasDelPolvo.ts`).
  let cajas = 0
  for (const a of s.armadas) if (a.grupo.visible && a.pieza.forma !== 'texto') cajas = escribirLaCaja(cajas, a.viaje.matrixWorld, a.caja)
  CAJAS_DEL_PIE.uCuantasCajasDelPie.value = cajas
  EN_VIVO.pieEntero = s.coreografia.mostrado >= 0.999 && s.armadas.every((a) => !a.grupo.visible || a.llego >= 0.999)
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
    // [CIERRE] 3 · medida con el pie pegado (en la cola del final): en el documento, donde estaba al pegarse.
    const cruda = medirLaPieza(p.elemento, p.forma)
    const medida = { ...cruda, caja: { ...cruda.caja, y: cruda.caja.y - (scrollY - scrollDelPie(scrollY)) } }
    const firma = firmaDeLaForma(medida)
    const vieja = antes.get(p.id)
    if (vieja !== undefined && vieja.pieza === p && vieja.firma === firma) {
      vieja.medida = medida
      antes.delete(p.id)
      ahora.push(vieja)
      continue
    }
    // [PULIDO 9] H2 · la vieja se suelta ANTES de armar la nueva: `soltar` le devuelve al DOM su transformada y su origen, y
    // después le borraba a la nueva el origen (`0 0`) de su homografía: con la cámara en perspectiva (la órbita del mouse en
    // el final), el formulario quedaba corrido de su placa desde «Enviando…». La transformada se conserva hasta el cuadro.
    // [PULIDO 9] H2 · si el formulario cambió de estado (a la tarjeta de gracias o de vuelta), la vieja se queda como la placa
    // saliente de la transformación (sólo sus mallas: el DOM es de la nueva).
    const estado = p.elemento.getAttribute('data-estado')
    const transforma = vieja !== undefined && vieja.pieza.elemento === p.elemento && p.forma === 'formulario' && vieja.estado !== null && estado !== null && vieja.estado !== estado
    if (vieja !== undefined) {
      antes.delete(p.id)
      raiz.remove(vieja.grupo)
      if (transforma) soltarLasMallas(vieja.transformacion?.saliente)
      else soltar(vieja)
    }
    const a = armar(p, medida, firma, estudio, estado)
    if (vieja !== undefined) {
      a.hundido = vieja.hundido
      if (vieja.pieza.elemento === p.elemento && p.forma !== 'texto') {
        a.css = vieja.css
        p.elemento.style.transform = a.css
      }
      if (transforma) {
        vieja.transformacion = null
        a.grupo.add(vieja.viaje)
        a.transformacion = { variante: varianteDeGracias(p.elemento.getAttribute('data-gracias')), saliente: vieja, t: 0 }
        p.elemento.style.opacity = '0'
      }
    }
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

function armar(pieza: PiezaDelPie, medida: MedidaDeLaPieza, firma: string, estudio: THREE.Texture, estado: string | null = null): Armada {
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
  // [NOCTURNO FINAL] B4 · su caja en la pieza (lo de la tecla, en la placa: lo que se hunde es apenas).
  const caja = new THREE.Box3()
  for (const malla of mallas) {
    malla.geometry.computeBoundingBox()
    if (malla.geometry.boundingBox !== null) caja.union(malla.geometry.boundingBox)
  }
  const delHundido = pieza.forma === 'placa' ? pieza.elemento : pieza.forma === 'formulario' ? pieza.elemento.querySelector('[data-forma="principal"]') : null
  return { pieza, medida, firma, grupo, viaje, cuerpo, mallas, material, uniformes, espesor, contenido: contenidoDe(pieza.forma, medida), delHundido, hundido: 0, css: '', d: 0, mundoPorPx: 0, orden: 0, llego: 0, tocable: true, caja, estado, transformacion: null }
}

export function soltar(a: Armada): void {
  soltarLasMallas(a)
  if (a.pieza.forma !== 'texto') {
    a.pieza.elemento.style.transform = ''
    a.pieza.elemento.style.transformOrigin = ''
    a.pieza.elemento.style.pointerEvents = ''
    a.pieza.elemento.style.opacity = ''
  }
}

/** [PULIDO 9] H2 · lo de three de una pieza (y de la saliente de su transformación), sin tocar el DOM. */
function soltarLasMallas(a: Armada | undefined): void {
  if (a === undefined) return
  soltarLasMallas(a.transformacion?.saliente)
  a.transformacion = null
  a.grupo.removeFromParent()
  a.viaje.removeFromParent()
  for (const malla of a.mallas) malla.geometry.dispose()
  a.material.dispose()
}

const POSE = new THREE.Matrix4()

/**
 * [PULIDO 9] H2 · un cuadro de la transformación (`transformacionDelPie.ts`): la entrante sobre su llegada y la saliente en su
 * lugar; el DOM, apagado hasta que termina (lo nuevo ya está en él: el foco, el lector).
 */
function transformar(a: Armada, x: TransformacionEnCurso, quieto: boolean, dt: number): void {
  x.t = Math.min(1, x.t + dt / duracionDeLaTransformacion(x.variante, quieto))
  const caja = a.medida.caja
  const vieja = x.saliente.medida.caja
  const desde = { ancho: vieja.ancho, alto: vieja.alto, dx: vieja.x - caja.x, dy: vieja.y - caja.y }
  const entra = poseDeLaTransformacion(x.variante, quieto, x.t, true, caja, desde, a.espesor, POSE)
  a.viaje.matrix.multiply(POSE)
  a.viaje.visible = entra.visible
  a.uniformes.uApareceDelPie.value *= entra.aparece
  const sale = poseDeLaTransformacion(x.variante, quieto, x.t, false, caja, desde, a.espesor, x.saliente.viaje.matrix)
  x.saliente.viaje.visible = sale.visible
  x.saliente.uniformes.uApareceDelPie.value = sale.aparece
  x.saliente.material.envMapIntensity = a.material.envMapIntensity
  x.saliente.viaje.updateMatrixWorld(true)
  if (x.t < 1) return
  soltarLasMallas(x.saliente)
  a.transformacion = null
  a.viaje.visible = true
  a.pieza.elemento.style.opacity = ''
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

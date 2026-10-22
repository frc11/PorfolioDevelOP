/**
 * [B13] EL CIERRE DE UNA PÁGINA EN LA ESCENA — su pantalla, su pista de cámara y la resolución (puro: sin three ni react; lo leen la atadura
 * al scroll, el rig, la ranura de variantes y el final del home).
 *
 * El cierre es el final del home sin las reseñas (`_componentes/pagina/cierre/`): Seis razones (desde 1024, el escenario clavado de siempre;
 * abajo de 1024 o con menos movimiento, la lista), el CTA que sale del título (la transformación de B3), una pantalla de la sala sola (LA
 * RESOLUCIÓN) y el pie. La escena es la de la página: su preset (la noche y el acento) y su variante.
 *
 * · **La pantalla del cierre** (`pantallaDelCierre`): la del pin del home, contada desde que Seis razones toca el tope del cuadro. En el
 *   escenario, una por pantalla de scroll (de 0 a 6, clavado, como «Por qué develOP»); en la lista, su recorrido repartido en esas seis;
 *   antes, negativa; después, las pantallas que siguen: la resolución (de 6 a 7) y el pie (de 7 a 8).
 * · **La pista** (`PISTA_DEL_CIERRE`): la del final del home (las poses A, B, C y E con sus curvas, de `CHOREO_KEYFRAMES`), llevada a esas
 *   pantallas, con el ángulo en 0 (360 es la misma cámara; así no da una vuelta al llegar desde la pose de la intro). Manda desde
 *   `RELEVO_DEL_CIERRE`: media pantalla antes de que el cierre asome (la escena despierta un octavo antes, ya en la frase).
 * · **La resolución** (`RESOLUCION_DEL_CIERRE`, de 0 a 1 en la pantalla que sigue al pin, con la curva suave): la señal del tramo del pie
 *   que la ranura le pasa a la variante (P-H29, un dueño por tramo). En 1 la variante está resuelta: lo que movió, en reposo, y su luz, la
 *   de la composición; el piso queda liso y calmo. Recién después entra el pie. Al subir, vuelve.
 * · **El final del home no corre en una página** (`enUnaPagina`): el encastre del logo en su hueco es el pie del home; el de una página es
 *   la resolución.
 */

import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../../secciones'
import { CHOREO_KEYFRAMES } from '../choreography'
import { buildTrack, sampleTrack, type ChoreoTrack } from '../choreographySampler'
import type { ChoreoKeyframe, MutableChoreoPose } from '../choreographyTypes'
import { hayBanco } from '../entorno'
import { ANCLA_DE_POR_QUE_DEVELOP } from '../finalDelRecorrido'

import { PARTES_DEL_CIERRE } from './atributoDelCierre'
import { presetActual, type CajaVertical } from './preset'

/** Las pantallas en que Seis razones está clavada: las del home (el escenario mide `PANTALLAS_DE_POR_QUE_DEVELOP`; clavado, una menos). */
export const PANTALLAS_DEL_PIN_DEL_CIERRE = PANTALLAS_DE_POR_QUE_DEVELOP - 1
/** La resolución: una pantalla (el bloque transparente entre el CTA y el pie; mientras entra, el CTA se va). */
export const PANTALLAS_DE_LA_RESOLUCION = 1
/** El pie: una pantalla (llega mientras entra, como el del home). */
export const PANTALLAS_DEL_PIE_DEL_CIERRE = 1
/** Desde qué pantalla manda la pista del cierre sobre la de la intro (con el cuerpo en papel en medio: la escena duerme ahí). */
export const RELEVO_DEL_CIERRE = -1.5
/** La pantalla en que el pie está entero (el fondo de la página). */
export const FIN_DEL_CIERRE = PANTALLAS_DEL_PIN_DEL_CIERRE + PANTALLAS_DE_LA_RESOLUCION + PANTALLAS_DEL_PIE_DEL_CIERRE

/** La pantalla del pin (desde que la sección llena el cuadro) de un nudo del final del home: la inversa de `progresoDelFinal`. */
export function pantallaDelNudo(at: number): number {
  return ((at - ANCLA_DE_POR_QUE_DEVELOP) / (1 - ANCLA_DE_POR_QUE_DEVELOP)) * PANTALLAS_DE_POR_QUE_DEVELOP
}

/** El avance de la pista (0 en el relevo, 1 con el pie entero) en una pantalla del cierre. */
export const avanceDeLaPista = (pantalla: number): number => (pantalla - RELEVO_DEL_CIERRE) / (FIN_DEL_CIERRE - RELEVO_DEL_CIERRE)

/** Los nudos del final del home que hace el cierre, del sostén de la frase (A) al del pie (E). */
export const NUDOS_DEL_CIERRE = ['frase · sostén', 'valores', 'valores · sostén', 'cta', 'cta · sostén', 'pie', 'pie · sostén'] as const

function nudo(nombre: string): ChoreoKeyframe {
  const k = CHOREO_KEYFRAMES.find((n) => n.name === nombre)
  if (k === undefined) throw new Error(`cierre: no hay un nudo «${nombre}» en la coreografía del home`)
  return k
}

/** Un nudo del home en el cierre: su pose y su curva, en otro lugar de la pista y con el ángulo en 0 (360 − 360). */
const enElCierre = (k: ChoreoKeyframe, at: number, name: string = k.name): ChoreoKeyframe => ({ ...k, at, name, pose: { ...k.pose, angleDeg: k.pose.angleDeg - 360 } })

/** La pista del cierre: la frase desde el relevo, los nudos del home en sus pantallas y el pie sostenido hasta el fondo. */
export const PISTA_DEL_CIERRE: readonly ChoreoKeyframe[] = [
  enElCierre(nudo('frase'), 0, 'cierre · frase'),
  ...NUDOS_DEL_CIERRE.map((n) => enElCierre(nudo(n), avanceDeLaPista(pantallaDelNudo(nudo(n).at)))),
  enElCierre(nudo('pie · sostén'), 1, 'cierre · pie entero'),
]

/**
 * La pantalla del cierre (puro). `seis`: la caja de Seis razones en el documento (medida en el LAYOUT: el bloque, no su escenario clavado).
 * Antes de su tope, negativa (en pantallas); adentro, la del pin (0 a 6, repartida en lo que el bloque recorre: su alto menos una
 * pantalla); después, 6 más las pantallas que siguió.
 */
export function pantallaDelCierre(seis: CajaVertical, scrollY: number, alto: number): number {
  if (!(alto > 0)) return Number.NEGATIVE_INFINITY
  const d = scrollY - seis.arriba
  if (d <= 0) return d / alto
  const recorrido = Math.max(1, seis.abajo - seis.arriba - alto)
  return d <= recorrido ? (PANTALLAS_DEL_PIN_DEL_CIERRE * d) / recorrido : PANTALLAS_DEL_PIN_DEL_CIERRE + (d - recorrido) / alto
}

/** La resolución en una pantalla del cierre: 0 hasta que se suelta el pin, 1 con la pantalla de la resolución entera (la curva suave). */
export function resolucionDelCierre(pantalla: number): number {
  const t = Math.min(1, Math.max(0, (pantalla - PANTALLAS_DEL_PIN_DEL_CIERRE) / PANTALLAS_DE_LA_RESOLUCION))
  return t * t * (3 - 2 * t)
}

/** La pantalla de ahora (la escribe la lectura del scroll; sin cierre a la vista o en el home, −∞). */
export const CIERRE_EN_VIVO: { pantalla: number } = { pantalla: Number.NEGATIVE_INFINITY }
/** La señal que la ranura le pasa a la variante (`PropsDeLaVariante.resolucion`): se lee en el `useFrame`. */
export const RESOLUCION_DEL_CIERRE: { current: number } = { current: 0 }

/** ¿Manda la pista del cierre (y su dueño de la luz)? */
export const cierreManda = (pantalla: number = CIERRE_EN_VIVO.pantalla): boolean => pantalla > RELEVO_DEL_CIERRE

/** Lo mínimo de un documento que la medida necesita. */
export interface FuenteDelCierre {
  querySelector(selector: string): { getBoundingClientRect(): { readonly top: number; readonly bottom: number } } | null
}

/** Mide el cierre de la página (`selector`: el `tramos.pie` del preset; `null`, ninguno) y escribe la pantalla y la resolución. */
export function medirElCierre(documento: FuenteDelCierre, selector: string | null, scrollY: number, alto: number): void {
  const r = selector === null ? undefined : documento.querySelector(`${selector} [data-parte="${PARTES_DEL_CIERRE.seisRazones}"]`)?.getBoundingClientRect()
  CIERRE_EN_VIVO.pantalla = r === undefined ? Number.NEGATIVE_INFINITY : pantallaDelCierre({ arriba: r.top + scrollY, abajo: r.bottom + scrollY }, scrollY, alto)
  RESOLUCION_DEL_CIERRE.current = resolucionDelCierre(CIERRE_EN_VIVO.pantalla)
}

let pista: ChoreoTrack | null = null

/** La pose del cierre en su pantalla, si manda (lo llama el rig, por la pose de la intro); si no, `false` y no toca nada. */
export function poseDelCierre(objetivo: MutableChoreoPose, pantalla: number = CIERRE_EN_VIVO.pantalla): boolean {
  if (!cierreManda(pantalla)) return false
  pista ??= buildTrack(PISTA_DEL_CIERRE)
  sampleTrack(pista, avanceDeLaPista(pantalla), objetivo)
  return true
}

/** ¿La escena está en una página (su preset tiene pista)? Ahí el final del home (el encastre) no corre: el gesto del pie es la resolución. */
export const enUnaPagina = (): boolean => (presetActual()?.pista ?? null) !== null

// Sólo con banco: la pantalla del cierre y la resolución, para medirlas en el sitio.
if (hayBanco()) (window as Window & { __cierreDelBanco?: () => { pantalla: number; resolucion: number; manda: boolean } }).__cierreDelBanco = () => ({ pantalla: CIERRE_EN_VIVO.pantalla, resolucion: RESOLUCION_DEL_CIERRE.current, manda: cierreManda() })

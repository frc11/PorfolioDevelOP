import * as THREE from 'three'
import { SVGLoader } from 'three-stdlib'

import { LOGO_INK_VIEWBOX, LOGO_PATH_D } from '@/components/ui/LogoMark'

import { PROBE_EXTRUDE } from '../probeScene'

/**
 * [PULIDO 13] K1 · EL TEXTO DETRÁS DEL LOGO — el cuerpo de Quiénes somos va en el plano de su título (`acompanantes.ts`), y ese
 * plano está a la profundidad del CENTRO del logo (`colocacion.ts`): la mitad de adelante del logo queda delante del texto. Lo
 * coherente con la profundidad de verdad es que el logo lo TAPE, como un objeto adelante. Nunca «lo atraviesa» ni queda mitad sí
 * y mitad no.
 *
 * Lo que tapa es la parte del sólido que queda DELANTE del plano del texto (del lado de la cámara). El plano es perpendicular a la
 * cámara de LECTURA y el logo está girado respecto de él (en Quiénes somos se le ve el costado): no es «su mitad de adelante» por
 * su propio eje. Cada cuadro, el contorno del logo (el de `LOGO_PATH_D`, en la malla, con sus agujeros) a varias `profundidades`
 * del sólido (de la cara de atrás a la de adelante) se recorta con el plano (queda lo que está del lado de la cámara), se proyecta
 * desde la cámara viva sobre el plano y se pasa a los píxeles del elemento (la inversa exacta de lo que hace su homografía:
 * `cuadrilateroEnElPlano`). En renglones de `renglonPx`: los intervalos que cubre cada contorno (par-impar: los agujeros quedan
 * afuera) y su UNIÓN entre profundidades (las paredes; por los agujeros se ve lo que se ve a todas). El elemento se recorta con
 * `clip-path: path(evenodd, su caja + esos rectángulos)`: queda la caja menos lo que el logo tapa. Sólo con los elementos que lo
 * piden (`data-detras-del-logo`) y sólo si se cruzan; si no, sin recorte.
 */
export const DETRAS_DEL_LOGO = { atributo: 'data-detras-del-logo', divisiones: 10, profundidades: [-1, -0.6, -0.2, 0.2, 0.6, 1], renglonPx: 2, juntaPx: 0.75 } as const

/** [PULIDO 13] K1 · el último plano del texto con que se recortó (su origen y su normal hacia la cámara): sólo lo lee el banco. */
export const PLANO_DEL_RECORTE = { origen: new THREE.Vector3(), normal: new THREE.Vector3(), hay: false }

let CONTORNOS: readonly Float32Array[] | null = null

/** Los contornos del logo (unidades del SVG), el de afuera y sus agujeros: leídos una vez de `LOGO_PATH_D`. */
export function contornosDelLogo(): readonly Float32Array[] {
  if (CONTORNOS !== null) return CONTORNOS
  const datos = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${LOGO_PATH_D}"/></svg>`)
  const lista: Float32Array[] = []
  for (const camino of datos.paths) {
    for (const forma of camino.toShapes(true)) {
      const { shape, holes } = forma.extractPoints(DETRAS_DEL_LOGO.divisiones)
      for (const c of [shape, ...holes]) lista.push(Float32Array.from(c.flatMap((v) => [v.x, v.y])))
    }
  }
  CONTORNOS = lista
  return lista
}

const MALLAS = new WeakMap<THREE.Object3D, THREE.Mesh | null>()
/** La malla del logo (la geometría centrada de `ProbeLogo`: su matriz lleva las unidades del SVG al mundo). */
function mallaDelLogo(logo: THREE.Object3D): THREE.Mesh | null {
  const guardada = MALLAS.get(logo)
  if (guardada !== undefined && guardada !== null && guardada.parent !== null) return guardada
  let malla: THREE.Mesh | null = null
  logo.traverse((o) => {
    if (malla === null && o instanceof THREE.Mesh) malla = o
  })
  MALLAS.set(logo, malla)
  return malla
}

/** Los intervalos (en x) que un juego de contornos cubre en el renglón `y` (par-impar), agregados a `destino` como pares. */
export function intervalosDelRenglon(contornos: readonly Float32Array[], y: number, destino: number[]): void {
  const xs: number[] = []
  for (const c of contornos) {
    const n = c.length / 2
    for (let i = 0; i < n; i += 1) {
      const j = (i + 1) % n
      const [u0, v0, u1, v1] = [c[2 * i], c[2 * i + 1], c[2 * j], c[2 * j + 1]]
      if (v0 <= y !== v1 <= y) xs.push(u0 + ((y - v0) * (u1 - u0)) / (v1 - v0))
    }
  }
  xs.sort((a, b) => a - b)
  for (let k = 0; k + 1 < xs.length; k += 2) destino.push(xs[k], xs[k + 1])
}

/** La unión de intervalos (pares), acotada a [0, ancho]. */
export function unirIntervalos(pares: readonly number[], ancho: number): number[] {
  const lista: [number, number][] = []
  for (let k = 0; k + 1 < pares.length; k += 2) lista.push([Math.max(0, pares[k]), Math.min(ancho, pares[k + 1])])
  lista.sort((a, b) => a[0] - b[0])
  const out: number[] = []
  for (const [a, b] of lista) {
    if (b <= a) continue
    if (out.length > 0 && a <= out[out.length - 1]) out[out.length - 1] = Math.max(out[out.length - 1], b)
    else out.push(a, b)
  }
  return out
}

/**
 * El recorte en px del elemento para contornos ya proyectados (uno o más juegos: su unión), en renglones; `''` si no tocan la caja.
 * Pura: el invariante la prueba sin navegador.
 */
export function recorteDeContornos(juegos: readonly (readonly Float32Array[])[], ancho: number, alto: number): string {
  let [minV, maxV, minU, maxU] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const juego of juegos) {
    for (const c of juego) {
      for (let i = 0; i < c.length; i += 2) [minU, maxU, minV, maxV] = [Math.min(minU, c[i]), Math.max(maxU, c[i]), Math.min(minV, c[i + 1]), Math.max(maxV, c[i + 1])]
    }
  }
  if (maxU <= 0 || minU >= ancho || maxV <= 0 || minV >= alto) return ''
  const { renglonPx: h, juntaPx } = DETRAS_DEL_LOGO
  let camino = ''
  let abierto: { readonly y: number; readonly pares: readonly number[] } | null = null
  const cerrar = (hasta: number): void => {
    if (abierto === null) return
    const { y, pares } = abierto
    for (let k = 0; k + 1 < pares.length; k += 2) camino += `M${pares[k].toFixed(1)} ${y.toFixed(1)}H${pares[k + 1].toFixed(1)}V${hasta.toFixed(1)}H${pares[k].toFixed(1)}Z`
    abierto = null
  }
  for (let y = Math.max(0, Math.floor(minV)); y < Math.min(alto, maxV); y += h) {
    const todos: number[] = []
    for (const juego of juegos) intervalosDelRenglon(juego, y + h / 2, todos)
    const pares = unirIntervalos(todos, ancho)
    // Un renglón igual al de arriba (con su tolerancia) estira el rectángulo abierto: un palito es un rectángulo, no cien.
    const previo = abierto as { readonly y: number; readonly pares: readonly number[] } | null
    if (previo !== null && previo.pares.length === pares.length && pares.every((x, k) => Math.abs(x - previo.pares[k]) <= juntaPx)) continue
    cerrar(y)
    if (pares.length > 0) abierto = { y, pares }
  }
  cerrar(Math.min(alto, maxV))
  if (camino === '') return ''
  return `path(evenodd, "M0 0H${ancho.toFixed(1)}V${alto.toFixed(1)}H0Z${camino}")`
}

const DESDE = new THREE.Vector3()
const NORMAL = new THREE.Vector3()
const ORIGEN = new THREE.Vector3()
const RAYO = new THREE.Vector3()
const EN_EL_PLANO = new THREE.Vector3()
const CORTE = new THREE.Vector3()
const INVERSA = new THREE.Matrix4()
// La cara de adelante: la tapa del principio de la extrusión, centrada como la centra `ProbeLogo` (el centro de la tinta y el de
// la profundidad: −biselado − profundidad/2); la de atrás, del otro lado (las profundidades van de −1 a 1 de eso).
const CARA_Z = -(PROBE_EXTRUDE.depth / 2 + PROBE_EXTRUDE.bevelThickness)
const MUNDO: THREE.Vector3[] = []
const DISTANCIA: number[] = []
const [CENTRO_X, CENTRO_Y] = [LOGO_INK_VIEWBOX.x + LOGO_INK_VIEWBOX.width / 2, LOGO_INK_VIEWBOX.y + LOGO_INK_VIEWBOX.height / 2]
/**
 * El recorte del acompañante en este cuadro (`''`: sin recorte). `plano`: el de su título (en em, origen en el comienzo de la línea
 * de base); `ancla`: ese origen en px del cuadro; `cuerpo`: px por em; `caja`: el elemento sin transformar, en px del cuadro.
 */
export function recorteDetrasDelLogo(plano: THREE.Object3D, ancla: { readonly x: number; readonly y: number }, cuerpo: number, caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }, viva: THREE.Camera, logo: THREE.Object3D | null): string {
  if (logo === null || cuerpo <= 0) return ''
  const malla = mallaDelLogo(logo)
  if (malla === null) return ''
  viva.getWorldPosition(DESDE)
  ORIGEN.setFromMatrixPosition(plano.matrixWorld)
  NORMAL.set(0, 0, 1).transformDirection(plano.matrixWorld)
  INVERSA.copy(plano.matrixWorld).invert()
  // La normal, hacia la cámara (el lado de lo que tapa).
  if (RAYO.copy(DESDE).sub(ORIGEN).dot(NORMAL) < 0) NORMAL.negate()
  PLANO_DEL_RECORTE.hay = true
  PLANO_DEL_RECORTE.origen.copy(ORIGEN)
  PLANO_DEL_RECORTE.normal.copy(NORMAL)
  const alPlano = RAYO.copy(ORIGEN).sub(DESDE).dot(NORMAL)
  const contornos = contornosDelLogo()
  const juegos: Float32Array[][] = []
  for (const f of DETRAS_DEL_LOGO.profundidades) {
    const juego: Float32Array[] = []
    for (const c of contornos) {
      const n = c.length / 2
      for (let i = 0; i < n; i += 1) {
        MUNDO[i] ??= new THREE.Vector3()
        MUNDO[i].set(c[2 * i] - CENTRO_X, c[2 * i + 1] - CENTRO_Y, CARA_Z * f).applyMatrix4(malla.matrixWorld)
        DISTANCIA[i] = RAYO.copy(MUNDO[i]).sub(ORIGEN).dot(NORMAL)
      }
      // Lo del anillo que queda del lado de la cámara (recortado con el plano: el corte cae sobre él), proyectado sobre el plano.
      const px: number[] = []
      const llevar = (w: THREE.Vector3): void => {
        RAYO.copy(w).sub(DESDE)
        const den = RAYO.dot(NORMAL)
        const t = Math.abs(den) < 1e-9 ? 0 : Math.max(0, alPlano / den)
        EN_EL_PLANO.copy(DESDE).addScaledVector(RAYO, t).applyMatrix4(INVERSA)
        px.push(ancla.x + EN_EL_PLANO.x * cuerpo - caja.x, ancla.y - EN_EL_PLANO.y * cuerpo - caja.y)
      }
      for (let i = 0; i < n; i += 1) {
        const j = (i + 1) % n
        if (DISTANCIA[i] >= 0) llevar(MUNDO[i])
        if (DISTANCIA[i] >= 0 !== DISTANCIA[j] >= 0) llevar(CORTE.copy(MUNDO[i]).lerp(MUNDO[j], DISTANCIA[i] / (DISTANCIA[i] - DISTANCIA[j])))
      }
      if (px.length >= 6) juego.push(Float32Array.from(px))
    }
    juegos.push(juego)
  }
  return recorteDeContornos(juegos, caja.ancho, caja.alto)
}

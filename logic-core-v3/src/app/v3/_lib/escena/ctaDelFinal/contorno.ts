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
import { RUIDO_DE_LA_METAMORFOSIS_GLSL, contornosDeLaLetra, geometriaDeLaLetra, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { ATRAS, type EstadoDeLaMetamorfosis } from './transformacion'

/**
 * [PULIDO 4] C1 · LA METAMORFOSIS `contorno` — los contornos de las letras (y los trazos de los íconos) de los valores y los de
 * la frase, remuestreados a la MISMA cantidad de puntos, se interpolan con turbulencia; los agujeros de los valores se cierran
 * al arrancar y los de la frase se abren al llegar su letra; al asentarse crece su extrusión y vuelve adelante.
 *
 * [PULIDO 5] D1 · la del producto, rehecha:
 *   · EMPAREJADOS POR POSICIÓN Y ÁREA, con asignación óptima (el método húngaro): cada contorno de la frase recibe el de los
 *     valores que mejor le queda (su lugar en la composición de cada texto y su área relativa); los de los valores que sobran
 *     colapsan a un punto (el centro de la letra de la frase más cercana) y, si sobraran de la frase, nacerían de uno.
 *   · REMUESTREO EQUIDISTANTE (por largo de arco, del contorno densificado) y el PUNTO DE ARRANQUE de cada par alineado (el giro
 *     de puntos con menos distancia, cada uno centrado y en su escala): no se retuerce.
 *   · TURBULENCIA en campana (`estadoDeLaMetamorfosis`): sube y baja suave y es CERO exacto antes del final; formada, la frase
 *     queda rígida (lo que sigue es venir adelante y crecer en espesor) y al terminar se cambia, sin que se vea, por su malla
 *     3D exacta (la de los títulos, con su bisel).
 *   · TOPOLOGÍA FIJA, sin rehacer nada por cuadro (era 8–11 ms de CPU por cuadro): todo se arma una vez y el vértice calcula
 *     dónde va cada punto con el progreso (uniformes). Las paredes son tiras de N puntos (una instancia por tramo, con sus dos
 *     puntas). Las tapas, por STENCIL: el abanico de cada contorno suma +1 por sus triángulos de frente y −1 por los de
 *     espaldas (la regla no-cero: un agujero resta, dos letras que se pisan se unen) y una cubierta con el mismo abanico pinta
 *     donde la cuenta no es cero y la vuelve a cero. Acepta cualquier polígono (cóncavo, con agujeros, que se cruza a mitad de
 *     camino) sin triangular. Necesita el búfer de stencil del lienzo (`configuracionDelCanvas.ts`).
 *
 * [PULIDO 6] E1 · EL ENTREMEDIO, TAN LIMPIO COMO EL FINAL — «cuando no se termina de formar queda muy feo». Medido: 17 de los 47
 * pares, en el camino directo de su letra de los valores a la de la frase, se cruzaban a sí mismos (un contorno que se cruza
 * da manchas, rulos y parpadeos con cualquier relleno). Ahora cada par va por un CAMINO CANÓNICO: su letra de los valores se
 * redondea de a poco (`fotosDelFlujo`: el suavizado laplaciano del contorno, que es el acortamiento de curvas —una curva simple
 * sigue simple y se vuelve redonda— con el área de siempre), viaja redonda y se desenrolla en la de la frase (las fotos de la
 * frase, al revés). Los centros viajan como antes (la coreografía no cambió); lo que cambia es la forma de cada cuadro. Las
 * fotos van en una textura y el vértice interpola entre las dos vecinas. Los demás contornos (los agujeros, los que sobran,
 * los que nacen) sólo se escalan sobre un punto, que no cruza nada; la turbulencia es un campo suave cuyo gradiente no llega a
 * 1 (no puede plegar). `s57` muestrea el progreso y afirma que ningún contorno se cruza. Y el cambio a la malla exacta es un
 * fundido de tramado complementario en el último `fundido` del progreso (los dos dibujos no se suman: cada píxel es de uno).
 */

/** Dónde están los valores y la frase en un cuadro (lo arma `EscenaDelCta.tsx`). */
export interface CuadroDeLaMetamorfosis {
  readonly items: readonly { readonly x: number; readonly y: number; readonly escala: number; readonly cuerpo: number; readonly cx: number; readonly cy: number }[]
  readonly cajaDeLosValores: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly cajaDeLaFrase: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly corrimiento: { readonly x: number; readonly y: number }
  readonly cuerpoDeLaFrase: number
  readonly fuga: { readonly x: number; readonly y: number }
  readonly fondo: number
  readonly progreso: number
  /** Cuánto se ven los valores de la escena: en el escenario, desde que arranca (antes es el DOM); en la lista, con su entrada. */
  readonly apareceDeLosValores: number
}

export const CONTORNO = {
  /** Los puntos de cada contorno (los dos textos): con 40, la «o» de la frase a 80 px no muestra facetas. */
  puntos: 40,
  /** Cuánto demora cada contorno (fracción del cambio): por su orden de lectura y un poco al azar. */
  demora: 0.38,
  /** La turbulencia (px, por el cuerpo de la frase: [PULIDO 6] E1 · una deriva del contorno entero) y la vida del flujo con el progreso. */
  turbulencia: 0.4,
  vidaDelFlujo: 2.2,
  /** Los agujeros de los valores se cierran en esta fracción del cambio de su contorno. */
  cierra: 0.3,
  /** Los contornos de los valores que sobran se cierran sobre su centro en esta fracción de su cambio. */
  seDesarma: 0.3,
  /** Cuánto de la demora es azar (el resto, el orden de lectura): poco, así cada palabra arranca como una ola y no salpicada. */
  azar: 0.12,
  /** Los de la frase se abren cuando su letra ya llegó (en esta fracción más del cambio, o con `limpia`). */
  abre: 0.25,
  /** Los tramos rectos más largos al leer las letras (em), antes de remuestrear: el largo de arco, preciso. */
  maximo: 0.02,
  /** Cuánto pesa el área (su logaritmo, relativa a la media de su texto) contra el lugar en el emparejamiento. */
  area: 0.35,
  /** El espesor de los valores (em de su letra), como el del DOM. */
  grosor: 0.05,
  /** El orden de dibujo: paredes, las dos cuentas del stencil y la cubierta. */
  orden: 10,
  /**
   * [PULIDO 6] E1 · el camino canónico de los pares: las fotos del flujo (iteraciones acumuladas del laplaciano: chicas al
   * principio, donde la forma cambia más), el paso de cada iteración, y en qué parte del camino de cada contorno la letra de los
   * valores termina de redondearse y la de la frase empieza a desenrollarse.
   */
  flujo: { fotos: [0, 2, 6, 14, 30, 60, 90], paso: 0.5, redondo: [0.42, 0.58] },
  /** [PULIDO 6] E1 · el fundido con la malla exacta: la última fracción del progreso. */
  fundido: 0.03,
  /** [PULIDO 6] E1 · en qué parte de su camino el centro de cada contorno ya llegó a la altura de su destino. */
  vertical: 0.6,
} as const

/** Un contorno en px (y hacia abajo), cerrado, sin repetir el primer punto. */
type Contorno = readonly THREE.Vector2[]

/** Remuestrea un contorno cerrado a `n` puntos por largo de arco (equidistantes). */
export function remuestrear(c: Contorno, n: number): THREE.Vector2[] {
  const largos = [0]
  for (let k = 1; k <= c.length; k += 1) largos.push(largos[k - 1] + c[k - 1].distanceTo(c[k % c.length]))
  const total = largos[c.length]
  const salida: THREE.Vector2[] = []
  let j = 0
  for (let i = 0; i < n; i += 1) {
    const s = (total * i) / n
    while (j < c.length - 1 && largos[j + 1] < s) j += 1
    const tramo = Math.max(1e-9, largos[j + 1] - largos[j])
    salida.push(new THREE.Vector2().lerpVectors(c[j], c[(j + 1) % c.length], (s - largos[j]) / tramo))
  }
  return salida
}

/** El área con signo en la pantalla (y hacia abajo): negativa, el sentido de un borde; positiva, el de un agujero. */
export const areaConSigno = (c: Contorno): number => c.reduce((a, p, k) => a + p.x * c[(k + 1) % c.length].y - c[(k + 1) % c.length].x * p.y, 0) / 2
const centroDe = (c: Contorno): THREE.Vector2 => c.reduce((a, p) => a.add(p), new THREE.Vector2()).multiplyScalar(1 / Math.max(1, c.length))
/** En el sentido de su rol: los bordes con área negativa (antihorarios en el plano, de frente: +1) y los agujeros al revés (−1). */
const enSentido = (c: THREE.Vector2[], agujero: boolean): THREE.Vector2[] => ((areaConSigno(c) > 0) !== agujero ? c.reverse() : c)

/** El inicio de `a` que menos se tuerce contra `b` (cada uno centrado y en su escala). */
export function mejorGiro(a: Contorno, b: Contorno): number {
  const [ca, cb] = [centroDe(a), centroDe(b)]
  const escala = (c: Contorno, m: THREE.Vector2): number => Math.max(1e-6, Math.sqrt(c.reduce((s, p) => s + p.distanceToSquared(m), 0) / c.length))
  const [ea, eb] = [escala(a, ca), escala(b, cb)]
  let mejor = 0
  let menor = Infinity
  for (let r = 0; r < a.length; r += 1) {
    let suma = 0
    for (let i = 0; i < a.length; i += 1) {
      const p = a[(i + r) % a.length]
      const q = b[i]
      suma += ((p.x - ca.x) / ea - (q.x - cb.x) / eb) ** 2 + ((p.y - ca.y) / ea - (q.y - cb.y) / eb) ** 2
    }
    if (suma < menor) [menor, mejor] = [suma, r]
  }
  return mejor
}

/**
 * La ASIGNACIÓN ÓPTIMA (el método húngaro, con potenciales: O(n²·m)) de una matriz de costos de `n` filas por `m` columnas, con
 * n ≤ m: la columna de cada fila, sin repetir, con la menor suma de costos.
 */
export function asignar(costo: readonly (readonly number[])[]): number[] {
  const n = costo.length
  const m = n === 0 ? 0 : costo[0].length
  const u = new Float64Array(n + 1)
  const v = new Float64Array(m + 1)
  const p = new Int32Array(m + 1)
  const camino = new Int32Array(m + 1)
  for (let i = 1; i <= n; i += 1) {
    p[0] = i
    let j0 = 0
    const minimo = new Float64Array(m + 1).fill(Infinity)
    const usado = new Uint8Array(m + 1)
    do {
      usado[j0] = 1
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0
      for (let j = 1; j <= m; j += 1) {
        if (usado[j] === 1) continue
        const actual = costo[i0 - 1][j - 1] - u[i0] - v[j]
        if (actual < minimo[j]) [minimo[j], camino[j]] = [actual, j0]
        if (minimo[j] < delta) [delta, j1] = [minimo[j], j]
      }
      for (let j = 0; j <= m; j += 1) {
        if (usado[j] === 1) {
          u[p[j]] += delta
          v[j] -= delta
        } else minimo[j] -= delta
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = camino[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0 !== 0)
  }
  const fila = new Array<number>(n).fill(-1)
  for (let j = 1; j <= m; j += 1) if (p[j] > 0) fila[p[j] - 1] = j - 1
  return fila
}

interface FormaRemuestreada {
  readonly borde: THREE.Vector2[]
  readonly agujeros: THREE.Vector2[][]
  readonly centro: THREE.Vector2
  readonly area: number
}

/** Los contornos de una letra en px (y hacia abajo), con su avance en `x` y su línea de base en `base`, remuestreados y en su sentido. */
function formasDeLaLetra(fuente: Font, c: string, x: number, base: number, cuerpo: number, n: number): FormaRemuestreada[] {
  const enPx = (p: THREE.Vector2): THREE.Vector2 => new THREE.Vector2(x + p.x * cuerpo, base - p.y * cuerpo)
  return contornosDeLaLetra(fuente, c, CONTORNO.maximo).map((f) => conSusMedidas(f.borde.map(enPx), f.agujeros.map((h) => h.map(enPx)), n))
}

function conSusMedidas(borde: THREE.Vector2[], agujeros: THREE.Vector2[][], n: number): FormaRemuestreada {
  const b = enSentido(remuestrear(borde, n), false)
  return { borde: b, agujeros: agujeros.map((h) => enSentido(remuestrear(h, n), true)), centro: centroDe(b), area: Math.abs(areaConSigno(b)) }
}

/** Los trazos de un ícono como contornos (px de la caja del valor): cada trazo abierto, una banda; uno cerrado, un anillo. [PULIDO 7] F2 · lo usa también el volteo. */
export function formasDelIcono(svg: string, x: number, y: number, ancho: number, n: number): FormaRemuestreada[] {
  const datos = new SVGLoader().parse(svg)
  const k = ancho / 24
  const medio = (1.5 * k) / 2
  const salida: FormaRemuestreada[] = []
  for (const camino of datos.paths) {
    for (const sub of camino.subPaths) {
      const pts = sub.getPoints(8).map((p) => new THREE.Vector2(x + p.x * k, y + p.y * k))
      if (pts.length < 2) continue
      const cerrado = pts[0].distanceTo(pts[pts.length - 1]) < 1e-3
      if (cerrado) pts.pop()
      const corrido = (s: number): THREE.Vector2[] => pts.map((p, i) => {
        const a = pts[Math.max(0, i - 1)]
        const b = pts[Math.min(pts.length - 1, i + 1)]
        const t = cerrado ? pts[(i + 1) % pts.length].clone().sub(pts[(i - 1 + pts.length) % pts.length]) : b.clone().sub(a)
        const normal = new THREE.Vector2(-t.y, t.x).normalize()
        return p.clone().addScaledVector(normal, s * medio)
      })
      salida.push(cerrado ? conSusMedidas(corrido(1), [corrido(-1)], n) : conSusMedidas([...corrido(1), ...corrido(-1).reverse()], [], n))
    }
  }
  return salida
}

/** Un azar determinista (0 a 1). */
function azar(i: number, j: number, k: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** Lo que hace cada pista en el vértice (`aPista.z`). */
export const TIPO = { par: 0, agujeroDeLosValores: 1, agujeroDeLaFrase: 2, sobra: 3, nace: 4 } as const

/** Una pista: los N puntos de un contorno en los valores (px de la caja de su valor) y en la frase (px de la pantalla). */
interface Pista {
  readonly s: readonly THREE.Vector2[]
  readonly t: readonly THREE.Vector2[]
  /** El centro de lo que se cierra (en los valores) y de lo que se abre (en la frase). */
  readonly centros: readonly [number, number, number, number]
  readonly item: number
  readonly demora: number
  readonly tipo: number
  /** El espesor de su valor (px de su caja). */
  readonly grosor: number
  /** [PULIDO 6] E1 · los pares: las fotos del flujo de sus dos letras (la de los valores en px de su caja; la de la frase, de la pantalla). */
  readonly fotos?: { readonly s: readonly (readonly THREE.Vector2[])[]; readonly t: readonly (readonly THREE.Vector2[])[] }
}

/**
 * [PULIDO 6] E1 · EL FLUJO DE UN CONTORNO: el suavizado laplaciano (cada punto hacia el medio de sus vecinos, `paso`) en fotos
 * a las iteraciones de `CONTORNO.flujo.fotos`, cada una vuelta a su área de origen (escalada sobre su centro, que el laplaciano
 * no mueve): la primera es el contorno y la última, casi redonda. Es el acortamiento de curvas discreto: un contorno simple
 * sigue simple en cada foto.
 */
export function fotosDelFlujo(contorno: readonly THREE.Vector2[]): THREE.Vector2[][] {
  const { fotos, paso } = CONTORNO.flujo
  const area0 = Math.abs(areaConSigno(contorno))
  const salida: THREE.Vector2[][] = []
  let c = contorno.map((q) => q.clone())
  let hechas = 0
  for (const meta of fotos) {
    for (; hechas < meta; hechas += 1) {
      const n = c.length
      c = c.map((q, i) => {
        const [a, b] = [c[(i - 1 + n) % n], c[(i + 1) % n]]
        return new THREE.Vector2(q.x + paso * ((a.x + b.x) / 2 - q.x), q.y + paso * ((a.y + b.y) / 2 - q.y))
      })
    }
    const k = Math.sqrt(area0 / Math.max(1e-9, Math.abs(areaConSigno(c))))
    const m = centroDe(c)
    salida.push(c.map((q) => new THREE.Vector2(m.x + (q.x - m.x) * k, m.y + (q.y - m.y) * k)))
  }
  return salida
}

const repetido = (p: THREE.Vector2, n: number): THREE.Vector2[] => Array.from({ length: n }, () => p)
const girado = (c: readonly THREE.Vector2[], r: number): THREE.Vector2[] => c.map((_, i) => c[(i + r) % c.length])

/** Una caja donde empieza un valor (px de la pantalla) y su escala: para emparejar por lugar. */
export interface CajaDelValor {
  readonly x: number
  readonly y: number
  readonly escala: number
}

interface DeLosValores extends FormaRemuestreada {
  readonly item: number
  readonly grosor: number
  readonly demora: number
  /** Su lugar en la pantalla (centro y área), para emparejar. */
  readonly visto: THREE.Vector2
  readonly areaVista: number
}

/**
 * Las pistas: cada contorno de la frase con el de los valores que le asigna el método húngaro (por lugar en la composición de
 * su texto y área relativa), los que sobran hacia un punto y los agujeros de los dos lados.
 */
export function pistasDeLaMetamorfosis(valores: readonly (ValorMedido | null)[], inicio: readonly CajaDelValor[], frase: readonly LetraDeLaFrase[], fuentes: { readonly valores: Font; readonly frase: Font; readonly fuerte: Font }, n: number = CONTORNO.puntos): Pista[] {
  const deLaFrase: FormaRemuestreada[] = frase.flatMap((l) => formasDeLaLetra(l.fuerte ? fuentes.fuerte : fuentes.frase, l.c, l.x, l.base, l.cuerpo, n))
  const crudos: { item: number; grosor: number; forma: FormaRemuestreada }[] = []
  valores.forEach((v, item) => {
    if (v === null) return
    for (const l of v.letras) for (const forma of formasDeLaLetra(fuentes.valores, l.c, l.x, l.base, l.cuerpo, n)) crudos.push({ item, grosor: CONTORNO.grosor * l.cuerpo, forma })
    for (const i of v.iconos) for (const forma of formasDelIcono(i.svg, i.x, i.y, i.ancho, n)) crudos.push({ item, grosor: CONTORNO.grosor * i.ancho, forma })
  })
  const deLosValores: DeLosValores[] = crudos.map((c, i) => {
    const caja = inicio[c.item] ?? { x: 0, y: 0, escala: 1 }
    const orden = crudos.length <= 1 ? 0 : i / (crudos.length - 1)
    return { ...c.forma, item: c.item, grosor: c.grosor, demora: CONTORNO.demora * ((1 - CONTORNO.azar) * orden + CONTORNO.azar * azar(i, 3, 7)), visto: new THREE.Vector2(caja.x + c.forma.centro.x * caja.escala, caja.y + c.forma.centro.y * caja.escala), areaVista: c.forma.area * caja.escala * caja.escala }
  })
  // El lugar de cada contorno en la composición de su texto (0 a 1 en la caja de sus centros) y su área sobre la media.
  const normal = (ps: readonly THREE.Vector2[]): ((p: THREE.Vector2) => THREE.Vector2) => {
    const caja = new THREE.Box2().setFromPoints([...ps])
    const tam = caja.getSize(new THREE.Vector2()).max(new THREE.Vector2(1, 1))
    return (p) => p.clone().sub(caja.min).divide(tam)
  }
  const enS = normal(deLosValores.map((s) => s.visto))
  const enT = normal(deLaFrase.map((t) => t.centro))
  const mediaS = deLosValores.reduce((a, s) => a + s.areaVista, 0) / Math.max(1, deLosValores.length)
  const mediaT = deLaFrase.reduce((a, t) => a + t.area, 0) / Math.max(1, deLaFrase.length)
  const lugaresS = deLosValores.map((s) => enS(s.visto))
  const lugaresT = deLaFrase.map((t) => enT(t.centro))
  const costo = (s: number, t: number): number => lugaresS[s].distanceToSquared(lugaresT[t]) + CONTORNO.area * Math.log(Math.max(1e-6, (deLosValores[s].areaVista / mediaS) / Math.max(1e-6, deLaFrase[t].area / mediaT))) ** 2
  const [nS, nT] = [deLosValores.length, deLaFrase.length]
  // La asignación (filas: el texto con menos contornos): de cada contorno de la frase, el de los valores (−1: nace de un punto).
  const deCadaT = new Array<number>(nT).fill(-1)
  if (nT <= nS) asignar(deLaFrase.map((_, t) => deLosValores.map((__, s) => costo(s, t)))).forEach((s, t) => (deCadaT[t] = s))
  else asignar(deLosValores.map((_, s) => deLaFrase.map((__, t) => costo(s, t)))).forEach((t, s) => (deCadaT[t] = s))
  const tieneT = new Array<boolean>(nS).fill(false)
  deCadaT.forEach((s) => {
    if (s >= 0) tieneT[s] = true
  })
  const masCercano = <T>(desde: THREE.Vector2, lugares: readonly THREE.Vector2[], de: readonly T[]): number => lugares.reduce((mejor, l, k) => (de[k] !== undefined && l.distanceToSquared(desde) < lugares[mejor].distanceToSquared(desde) ? k : mejor), 0)
  const pistas: Pista[] = []
  const conSusAgujeros = (s: DeLosValores, destino: THREE.Vector2): void => {
    for (const h of s.agujeros) pistas.push({ s: h, t: repetido(destino, n), centros: [centroDe(h).x, centroDe(h).y, destino.x, destino.y], item: s.item, demora: s.demora, tipo: TIPO.agujeroDeLosValores, grosor: s.grosor })
  }
  deLaFrase.forEach((t, j) => {
    const i = deCadaT[j]
    if (i < 0) {
      // Nace de un punto: el centro del contorno de los valores más cercano en la composición.
      const s = deLosValores[masCercano(lugaresT[j], lugaresS, deLosValores)]
      const demora = CONTORNO.demora * (j / Math.max(1, nT - 1))
      pistas.push({ s: repetido(s.centro, n), t: t.borde, centros: [s.centro.x, s.centro.y, t.centro.x, t.centro.y], item: s.item, demora, tipo: TIPO.nace, grosor: 0 })
      for (const h of t.agujeros) pistas.push({ s: repetido(s.centro, n), t: h, centros: [s.centro.x, s.centro.y, centroDe(h).x, centroDe(h).y], item: s.item, demora, tipo: TIPO.agujeroDeLaFrase, grosor: 0 })
      return
    }
    const s = deLosValores[i]
    // [PULIDO 6] E1 · el camino canónico: las fotos del flujo de las dos letras, con el arranque alineado entre las redondas.
    const [fs, ft] = [fotosDelFlujo(s.borde), fotosDelFlujo(t.borde)]
    const giro = mejorGiro(fs[fs.length - 1], ft[ft.length - 1])
    const fsg = fs.map((f) => girado(f, giro))
    pistas.push({ s: fsg[0], t: t.borde, centros: [s.centro.x, s.centro.y, t.centro.x, t.centro.y], item: s.item, demora: s.demora, tipo: TIPO.par, grosor: s.grosor, fotos: { s: fsg, t: ft } })
    conSusAgujeros(s, t.centro)
    for (const h of t.agujeros) pistas.push({ s: repetido(s.centro, n), t: h, centros: [s.centro.x, s.centro.y, centroDe(h).x, centroDe(h).y], item: s.item, demora: s.demora, tipo: TIPO.agujeroDeLaFrase, grosor: 0 })
  })
  // Los que sobran: se cierran sobre su centro mientras arrancan hacia la letra de la frase más cercana en la composición.
  deLosValores.forEach((s, i) => {
    if (tieneT[i]) return
    const t = deLaFrase[masCercano(lugaresS[i], lugaresT, deLaFrase)]
    const destino = t?.centro ?? s.centro
    pistas.push({ s: s.borde, t: repetido(destino, n), centros: [s.centro.x, s.centro.y, destino.x, destino.y], item: s.item, demora: s.demora, tipo: TIPO.sobra, grosor: s.grosor })
    conSusAgujeros(s, destino)
  })
  return pistas
}

/** Los uniformes de la metamorfosis (los mismos objetos en los cuatro materiales). */
interface UniformesDelContorno {
  readonly uItems: { value: THREE.Vector4[] }
  readonly uCentrosDeLosItems: { value: THREE.Vector2[] }
  readonly uMasa: { value: THREE.Vector2 }
  readonly uCorrimiento: { value: THREE.Vector2 }
  readonly uFuga: { value: THREE.Vector2 }
  readonly uFondo: { value: number }
  readonly uZS: { value: number }
  readonly uZF: { value: number }
  readonly uKS: { value: number }
  readonly uKF: { value: number }
  readonly uCambia: { value: number }
  readonly uTurbulencia: { value: number }
  readonly uTiempo: { value: number }
  readonly uAbre: { value: number }
  readonly uEspesorT: { value: number }
  readonly uAparece: { value: number }
  /** [PULIDO 6] E1 · las fotos del flujo de los pares y el fundido con la malla exacta. */
  readonly uFormas: { value: THREE.Texture | null }
  readonly uFundido: { value: number }
}

/**
 * El vértice de la metamorfosis, compartido: dónde va un punto de una pista con el progreso. Los valores, en su caja de ahora y
 * achicados hacia atrás alrededor del centro de su valor; la frase, en la masa (atrás, achicada alrededor de su centro) y
 * viniendo adelante; entre los dos, cada pista con su demora, la turbulencia en campana y la profundidad que corresponde.
 * `metaAlPlano`: lo que se ve en (x, y) a la profundidad z, en el plano del lienzo (y para arriba).
 */
const VERTICE_GLSL = /* glsl */ `
uniform vec4 uItems[ 6 ];
uniform vec2 uCentrosDeLosItems[ 6 ];
uniform vec2 uMasa;
uniform vec2 uCorrimiento;
uniform vec2 uFuga;
uniform float uFondo;
uniform float uZS;
uniform float uZF;
uniform float uKS;
uniform float uKF;
uniform float uCambia;
uniform float uTurbulencia;
uniform float uTiempo;
uniform float uAbre;
uniform float uEspesorT;
uniform sampler2D uFormas;
varying float vTapa;
${RUIDO_DE_LA_METAMORFOSIS_GLSL}
// [PULIDO 6] E1 · una foto del flujo de un par (lado 0: la letra de los valores; 1: la de la frase), punto i; y entre dos fotos.
vec2 metaFoto( float fila, float lado, float foto, float i ) {
	float col = ( lado * ${String(CONTORNO.flujo.fotos.length)}.0 + foto ) * ${String(CONTORNO.puntos / 2)}.0 + floor( i * 0.5 );
	vec4 t = texelFetch( uFormas, ivec2( int( col + 0.5 ), int( fila + 0.5 ) ), 0 );
	return mod( i, 2.0 ) < 0.5 ? t.xy : t.zw;
}
vec2 metaForma( float fila, float lado, float f, float i ) {
	float f0 = floor( f );
	float f1 = min( f0 + 1.0, ${String(CONTORNO.flujo.fotos.length - 1)}.0 );
	return mix( metaFoto( fila, lado, f0, i ), metaFoto( fila, lado, f1, i ), f - f0 );
}
float metaCrudo( vec4 pista ) {
	return ( uCambia - pista.y ) / ( 1.0 - ${CONTORNO.demora.toFixed(3)} );
}
float metaSuave( float crudo ) {
	float m = clamp( crudo, 0.0, 1.0 );
	return m * m * ( 3.0 - 2.0 * m );
}
vec3 metaPunto( vec2 s, vec2 t, vec4 centros, vec4 pista, vec2 forma ) {
	int item = int( pista.x + 0.5 );
	vec4 caja = uItems[ item ];
	vec2 cItem = uCentrosDeLosItems[ item ];
	float crudo = metaCrudo( pista );
	float m = clamp( crudo, 0.0, 1.0 );
	float u = metaSuave( crudo );
	vec2 sl = s;
	if ( abs( pista.z - ${TIPO.agujeroDeLosValores.toFixed(1)} ) < 0.5 ) sl = mix( s, centros.xy, smoothstep( 0.0, ${CONTORNO.cierra.toFixed(3)}, m ) );
	// Los que sobran se desarman donde están: se cierran sobre su centro en la primera parte de su camino (no viajan como motas).
	if ( abs( pista.z - ${TIPO.sobra.toFixed(1)} ) < 0.5 ) sl = mix( s, centros.xy, smoothstep( 0.0, ${CONTORNO.seDesarma.toFixed(3)}, m ) );
	vec2 S = caja.xy + sl * caja.z;
	S = cItem + ( S - cItem ) * uKS;
	vec2 tt = t;
	if ( abs( pista.z - ${TIPO.agujeroDeLaFrase.toFixed(1)} ) < 0.5 ) tt = mix( centros.zw, t, max( smoothstep( 1.0, ${(1 + CONTORNO.abre).toFixed(3)}, crudo ), uAbre ) );
	vec2 T = uMasa + ( tt + uCorrimiento - uMasa ) * uKF;
	vec2 P = mix( S, T, u );
	vec2 cS = cItem + ( caja.xy + centros.xy * caja.z - cItem ) * uKS;
	vec2 cT = uMasa + ( centros.zw + uCorrimiento - uMasa ) * uKF;
	if ( forma.x >= 0.0 ) {
		// [PULIDO 6] E1 · un par: su letra de los valores se redondea (las fotos de su flujo), viaja redonda y se desenrolla en la
		// de la frase; los centros viajan con u (como antes) y las formas, relativas a ellos.
		float redondoS = ${String(CONTORNO.flujo.fotos.length - 1)}.0 * clamp( u / ${CONTORNO.flujo.redondo[0].toFixed(3)}, 0.0, 1.0 );
		float redondoT = ${String(CONTORNO.flujo.fotos.length - 1)}.0 * clamp( ( 1.0 - u ) / ${(1 - CONTORNO.flujo.redondo[1]).toFixed(3)}, 0.0, 1.0 );
		vec2 fS = cItem + ( caja.xy + metaForma( forma.x, 0.0, redondoS, forma.y ) * caja.z - cItem ) * uKS;
		vec2 fT = uMasa + ( metaForma( forma.x, 1.0, redondoT, forma.y ) + uCorrimiento - uMasa ) * uKF;
		float w = smoothstep( ${CONTORNO.flujo.redondo[0].toFixed(3)}, ${CONTORNO.flujo.redondo[1].toFixed(3)}, u );
		P = mix( cS, cT, u ) + mix( fS - cS, fT - cT, w );
	}
	// [PULIDO 6] E1 · el centro de cada contorno se ajusta primero en vertical (llega a la franja de la frase antes de acercarse de
	// costado: no cruza la de «HABLANOS» ya formada la mitad); y la turbulencia lo lleva ENTERO con el flujo (la misma deriva
	// para todos sus puntos: no lo deforma, no puede cruzarlo).
	vec2 lineal = mix( cS, cT, u );
	vec2 centro = vec2( lineal.x, mix( cS.y, cT.y, smoothstep( 0.0, ${CONTORNO.vertical.toFixed(3)}, u ) ) );
	P += centro - lineal + metaFlujo( centro, uTiempo ) * uTurbulencia * sin( 3.14159265 * u );
	return vec3( P, mix( uZS, uZF, u ) );
}
vec3 metaAlPlano( vec3 p ) {
	vec2 v = uFuga + ( p.xy - uFuga ) * ( uFondo - p.z ) / uFondo;
	return vec3( v.x, -v.y, p.z );
}
float metaGrosor( vec4 pista ) {
	int item = int( pista.x + 0.5 );
	return mix( pista.w * uItems[ item ].z * uKS, uEspesorT, metaSuave( metaCrudo( pista ) ) );
}
`

const ATRIBUTOS_DE_LA_TAPA = 'attribute vec2 aS;\nattribute vec2 aT;\nattribute vec4 aCentros;\nattribute vec4 aPista;\nattribute vec2 aForma;\n'
const ATRIBUTOS_DE_LA_PARED = 'attribute vec2 aEsquina;\nattribute vec4 iS;\nattribute vec4 iT;\nattribute vec4 iCentros;\nattribute vec4 iPista;\nattribute vec4 iForma;\n'
const NORMAL_DE_LA_TAPA = 'vec3 objectNormal = vec3( 0.0, 0.0, 1.0 );'
const PUNTO_DE_LA_TAPA = 'vec3 transformed = metaAlPlano( metaPunto( aS, aT, aCentros, aPista, aForma ) );\n\tvTapa = 1.0;'
const NORMAL_DE_LA_PARED = `vec3 metaA = metaAlPlano( metaPunto( iS.xy, iT.xy, iCentros, iPista, iForma.xy ) );
	vec3 metaB = metaAlPlano( metaPunto( iS.zw, iT.zw, iCentros, iPista, iForma.xz ) );
	vec2 metaD = metaB.xy - metaA.xy;
	vec3 objectNormal = length( metaD ) > 1e-4 ? normalize( vec3( metaD.y, -metaD.x, 0.0 ) ) : vec3( 0.0, 0.0, 1.0 );`
const PUNTO_DE_LA_PARED = 'vec3 transformed = mix( metaA, metaB, aEsquina.x );\n\ttransformed.z -= metaGrosor( iPista ) * aEsquina.y;\n\tvTapa = 0.0;'

/** El fundido con el DOM (el tramado fijo en la pantalla) y el costado de día: lo que comparten la cubierta, las paredes y la malla exacta. */
const DIA = `( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) )`
const TRAMADO_GLSL = 'fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) )'
const APARECE_GLSL = /* glsl */ `
	float metaTramado = ${TRAMADO_GLSL};
	if ( ( uAparece < 0.999 && metaTramado >= uAparece ) || metaTramado < uFundido ) discard;
`
/** [PULIDO 6] E1 · la malla exacta, en el fundido: los píxeles que la que se mueve deja (el tramado complementario). */
const FUNDIDO_DE_LA_EXACTA_GLSL = /* glsl */ `
	if ( uFundido < 0.999 && ${TRAMADO_GLSL} >= uFundido ) discard;
`
const COSTADO_GLSL = `#include <map_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, mix( 1.0, vTapa, ${DIA} ) );`

type Pieza = 'tapa' | 'pared' | 'exacta'

/** El material con luz de cada pieza (la cubierta de las tapas, las paredes, la malla exacta): el satinado de los títulos. */
function materialConLuz(color: Variante, u: UniformesDelContorno, pieza: Pieza): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: color === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true, side: pieza === 'tapa' ? THREE.DoubleSide : THREE.FrontSide })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    if (pieza === 'exacta') {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vTapa;').replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvTapa = step( 0.5, abs( normal.z ) );')
    } else {
      const atributos = pieza === 'tapa' ? ATRIBUTOS_DE_LA_TAPA : ATRIBUTOS_DE_LA_PARED
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${atributos}${VERTICE_GLSL}`)
        .replace('#include <beginnormal_vertex>', pieza === 'tapa' ? NORMAL_DE_LA_TAPA : NORMAL_DE_LA_PARED)
        .replace('#include <begin_vertex>', pieza === 'tapa' ? PUNTO_DE_LA_TAPA : PUNTO_DE_LA_PARED)
    }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vTapa;\nuniform float uAparece;\nuniform float uFundido;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${pieza === 'exacta' ? FUNDIDO_DE_LA_EXACTA_GLSL : APARECE_GLSL}`)
      .replace('#include <map_fragment>', COSTADO_GLSL)
    // La cubierta se dibuja de los dos lados (el abanico tiene triángulos de frente y de espaldas): su normal mira siempre a la cámara.
    if (pieza === 'tapa') shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n\tnormal = normalize( vNormal );')
  }
  m.customProgramCacheKey = () => `metamorfosis-contorno-${pieza}-${color}`
  conElAmanecer(m)
  if (pieza === 'tapa') {
    // La cubierta: pinta donde la cuenta del stencil no es cero y la vuelve a cero (pase o no la profundidad).
    m.stencilWrite = true
    m.stencilFunc = THREE.NotEqualStencilFunc
    m.stencilRef = 0
    m.stencilFail = THREE.KeepStencilOp
    m.stencilZFail = THREE.ZeroStencilOp
    m.stencilZPass = THREE.ZeroStencilOp
  }
  return m
}

/** Una cuenta del stencil: el abanico de las tapas, sin color ni profundidad, +1 de frente (`suma`) o −1 de espaldas. */
function cuentaDelStencil(u: UniformesDelContorno, suma: boolean): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    uniforms: u as unknown as Record<string, THREE.IUniform>,
    vertexShader: `${ATRIBUTOS_DE_LA_TAPA}${VERTICE_GLSL}\nvoid main() {\n\tvec3 transformed = metaAlPlano( metaPunto( aS, aT, aCentros, aPista, aForma ) );\n\tvTapa = 1.0;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );\n}\n`,
    fragmentShader: 'void main() {\n\tgl_FragColor = vec4( 0.0 );\n}\n',
    side: suma ? THREE.FrontSide : THREE.BackSide,
    colorWrite: false,
    depthWrite: false,
    depthTest: false,
  })
  m.stencilWrite = true
  m.stencilFunc = THREE.AlwaysStencilFunc
  m.stencilFail = THREE.KeepStencilOp
  const op = suma ? THREE.IncrementWrapStencilOp : THREE.DecrementWrapStencilOp
  m.stencilZFail = op
  m.stencilZPass = op
  return m
}

function uniformes(): UniformesDelContorno {
  return {
    uItems: { value: Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uCentrosDeLosItems: { value: Array.from({ length: 6 }, () => new THREE.Vector2()) },
    uMasa: { value: new THREE.Vector2() },
    uCorrimiento: { value: new THREE.Vector2() },
    uFuga: { value: new THREE.Vector2() },
    uFondo: { value: 1000 },
    uZS: { value: 0 },
    uZF: { value: 0 },
    uKS: { value: 1 },
    uKF: { value: 1 },
    uCambia: { value: 0 },
    uTurbulencia: { value: 0 },
    uTiempo: { value: 0 },
    uAbre: { value: 0 },
    uEspesorT: { value: 0 },
    uAparece: { value: 1 },
    uFormas: { value: null },
    uFundido: { value: 0 },
  }
}

/**
 * [PULIDO 6] E1 · LAS FOTOS DEL FLUJO EN UNA TEXTURA (RGBA de 32 bits, sin filtrar: dos puntos por texel): una fila por par; en
 * cada fila, las fotos de su letra de los valores y después las de la de la frase, N/2 texeles por foto. Devuelve también la
 * fila de cada pista (−1: no es un par).
 */
function texturaDeLasFormas(pistas: readonly Pista[], n: number): { readonly textura: THREE.DataTexture; readonly filas: number[] } {
  const fotos = CONTORNO.flujo.fotos.length
  const filas: number[] = []
  let total = 0
  for (const p of pistas) filas.push(p.fotos === undefined ? -1 : total++)
  const ancho = 2 * fotos * (n / 2)
  const alto = Math.max(1, total)
  const datos = new Float32Array(ancho * alto * 4)
  pistas.forEach((p, k) => {
    if (p.fotos === undefined) return
    const fila = filas[k]
    ;[p.fotos.s, p.fotos.t].forEach((lado, l) => lado.forEach((foto, f) => foto.forEach((q, i) => datos.set([q.x, q.y], (fila * ancho + (l * fotos + f) * (n / 2) + Math.floor(i / 2)) * 4 + (i % 2) * 2))))
  })
  const textura = new THREE.DataTexture(datos, ancho, alto, THREE.RGBAFormat, THREE.FloatType)
  textura.minFilter = THREE.NearestFilter
  textura.magFilter = THREE.NearestFilter
  textura.needsUpdate = true
  return { textura, filas }
}

/** Las tapas: los N puntos de cada pista y su abanico (desde su primer punto). */
function geometriaDeLasTapas(pistas: readonly Pista[], n: number, filas: readonly number[]): THREE.BufferGeometry {
  const v = pistas.length * n
  const [aS, aT, aCentros, aPista, aForma] = [new Float32Array(v * 2), new Float32Array(v * 2), new Float32Array(v * 4), new Float32Array(v * 4), new Float32Array(v * 2)]
  const indices = new Uint32Array(pistas.length * (n - 2) * 3)
  let k = 0
  pistas.forEach((p, i) => {
    const base = i * n
    for (let j = 0; j < n; j += 1) {
      const w = base + j
      aS.set([p.s[j].x, p.s[j].y], w * 2)
      aT.set([p.t[j].x, p.t[j].y], w * 2)
      aCentros.set(p.centros, w * 4)
      aPista.set([p.item, p.demora, p.tipo, p.grosor], w * 4)
      aForma.set([filas[i], j], w * 2)
    }
    for (let j = 1; j < n - 1; j += 1) {
      indices.set([base, base + j, base + j + 1], k)
      k += 3
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
  g.setAttribute('aS', new THREE.BufferAttribute(aS, 2))
  g.setAttribute('aT', new THREE.BufferAttribute(aT, 2))
  g.setAttribute('aCentros', new THREE.BufferAttribute(aCentros, 4))
  g.setAttribute('aPista', new THREE.BufferAttribute(aPista, 4))
  g.setAttribute('aForma', new THREE.BufferAttribute(aForma, 2))
  g.setIndex(new THREE.BufferAttribute(indices, 1))
  return g
}

/** Las paredes: un rectángulo por tramo (instancias), con las dos puntas del tramo; la de adelante en el contorno y la de atrás, a su espesor. */
function geometriaDeLasParedes(pistas: readonly Pista[], n: number, filas: readonly number[]): THREE.InstancedBufferGeometry {
  const total = pistas.length * n
  const [iS, iT, iCentros, iPista, iForma] = [new Float32Array(total * 4), new Float32Array(total * 4), new Float32Array(total * 4), new Float32Array(total * 4), new Float32Array(total * 4)]
  pistas.forEach((p, i) => {
    for (let j = 0; j < n; j += 1) {
      const w = i * n + j
      const q = (j + 1) % n
      iS.set([p.s[j].x, p.s[j].y, p.s[q].x, p.s[q].y], w * 4)
      iT.set([p.t[j].x, p.t[j].y, p.t[q].x, p.t[q].y], w * 4)
      iCentros.set(p.centros, w * 4)
      iPista.set([p.item, p.demora, p.tipo, p.grosor], w * 4)
      iForma.set([filas[i], j, q, 0], w * 4)
    }
  })
  const g = new THREE.InstancedBufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3))
  // Las esquinas: (punta, atrás). Los dos triángulos miran hacia afuera del contorno (A, D, C) y (A, C, B).
  g.setAttribute('aEsquina', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2))
  g.setIndex([0, 3, 2, 0, 2, 1])
  g.setAttribute('iS', new THREE.InstancedBufferAttribute(iS, 4))
  g.setAttribute('iT', new THREE.InstancedBufferAttribute(iT, 4))
  g.setAttribute('iCentros', new THREE.InstancedBufferAttribute(iCentros, 4))
  g.setAttribute('iPista', new THREE.InstancedBufferAttribute(iPista, 4))
  g.setAttribute('iForma', new THREE.InstancedBufferAttribute(iForma, 4))
  g.instanceCount = total
  return g
}

/** La frase entera, exacta: la malla 3D de cada letra (la de los títulos, con su bisel), juntas. */
function geometriaExacta(frase: readonly LetraDeLaFrase[], fuentes: { readonly frase: Font; readonly fuerte: Font }): THREE.BufferGeometry {
  const partes = frase.map((l) => {
    const g = geometriaDeLaLetra(l.fuerte ? fuentes.fuerte : fuentes.frase, l.c, l.x, l.base, l.cuerpo, VOLUMEN_DEL_TITULO.profundidad, true, CONTORNO.maximo)
    return g.index === null ? g : g.toNonIndexed()
  })
  const junta = partes.length === 0 ? new THREE.BufferGeometry() : mergeGeometries(partes) ?? new THREE.BufferGeometry()
  for (const g of partes) g.dispose()
  return junta
}

/**
 * [PULIDO 6] E1 · LOS VALORES DE UN CUADRO, puros (los uniformes del vértice sin three): los escribe `poner` y con ellos el
 * invariante rehace en la CPU la misma cuenta del vértice (que ningún contorno se cruce en ningún cuadro).
 */
export interface ValoresDelCuadro {
  readonly items: readonly (readonly [number, number, number])[]
  readonly centrosDeLosItems: readonly (readonly [number, number])[]
  readonly masa: readonly [number, number]
  readonly corrimiento: readonly [number, number]
  readonly fuga: readonly [number, number]
  readonly fondo: number
  readonly zS: number
  readonly zF: number
  readonly kS: number
  readonly kF: number
  readonly cambia: number
  readonly turbulencia: number
  readonly tiempo: number
  readonly abre: number
  readonly espesorT: number
  readonly aparece: number
  readonly fundido: number
}

const suaveEntre = (u: number): number => {
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

export function valoresDelCuadro(e: EstadoDeLaMetamorfosis, c: CuadroDeLaMetamorfosis): ValoresDelCuadro {
  const fondo = Math.max(1, c.fondo)
  const zM = -ATRAS * fondo
  const zS = zM * e.atras
  const zF = zM * (1 - e.adelante)
  const kF = fondo / (fondo - zF)
  return {
    items: c.items.map((it) => [it.x, it.y, it.escala] as const),
    centrosDeLosItems: c.items.map((it) => [it.cx, it.cy] as const),
    masa: [c.cajaDeLaFrase.x, c.cajaDeLaFrase.y],
    corrimiento: [c.corrimiento.x, c.corrimiento.y],
    fuga: [c.fuga.x, c.fuga.y],
    fondo,
    zS,
    zF,
    kS: fondo / (fondo - zS),
    kF,
    cambia: e.cambia,
    turbulencia: CONTORNO.turbulencia * c.cuerpoDeLaFrase * e.turbulencia,
    tiempo: CONTORNO.vidaDelFlujo * c.progreso,
    abre: 1 - e.sucia,
    espesorT: VOLUMEN_DEL_TITULO.profundidad * c.cuerpoDeLaFrase * kF * e.espesor,
    aparece: c.apareceDeLosValores,
    // [PULIDO 6] E1 · el fundido con la malla exacta, en el último `fundido` del progreso.
    fundido: suaveEntre((c.progreso - (1 - CONTORNO.fundido)) / CONTORNO.fundido),
  }
}

/**
 * Arma `contorno`: las pistas (una vez) y las cuatro piezas de la metamorfosis (paredes, las dos cuentas y la cubierta), más la
 * malla exacta de la frase. `inicio`: dónde empieza cada valor (px de la pantalla), para emparejar por lugar.
 */
export function armarElContorno(valores: readonly (ValorMedido | null)[], inicio: readonly CajaDelValor[], frase: readonly LetraDeLaFrase[], fuentes: { readonly valores: Font; readonly frase: Font; readonly fuerte: Font }, color: Variante): MetamorfosisArmada {
  const n = CONTORNO.puntos
  const pistas = pistasDeLaMetamorfosis(valores, inicio, frase, fuentes, n)
  const u = uniformes()
  const formas = texturaDeLasFormas(pistas, n)
  u.uFormas.value = formas.textura
  const tapas = geometriaDeLasTapas(pistas, n, formas.filas)
  const paredes = geometriaDeLasParedes(pistas, n, formas.filas)
  const materiales = { pared: materialConLuz(color, u, 'pared'), cubierta: materialConLuz(color, u, 'tapa'), exacta: materialConLuz(color, u, 'exacta') }
  const cuentas = [cuentaDelStencil(u, true), cuentaDelStencil(u, false)]
  const malla = (g: THREE.BufferGeometry, m: THREE.Material, nombre: string, orden: number): THREE.Mesh => {
    const o = new THREE.Mesh(g, m)
    o.frustumCulled = false
    o.visible = false
    o.name = `metamorfosis · ${nombre}`
    o.renderOrder = orden
    return o
  }
  const O = CONTORNO.orden
  const enMovimiento = [malla(paredes, materiales.pared, 'paredes', O), malla(tapas, cuentas[0], 'stencil +1', O + 1), malla(tapas, cuentas[1], 'stencil −1', O + 2), malla(tapas, materiales.cubierta, 'tapas', O + 3)]
  const exacta = malla(geometriaExacta(frase, fuentes), materiales.exacta, 'la frase exacta', 0)
  let costo = 0

  const poner = (e: EstadoDeLaMetamorfosis, c: CuadroDeLaMetamorfosis): void => {
    const t0 = performance.now()
    const v = valoresDelCuadro(e, c)
    u.uZS.value = v.zS
    u.uZF.value = v.zF
    u.uKS.value = v.kS
    u.uKF.value = v.kF
    v.items.forEach(([x, y, escala], k) => u.uItems.value[k]?.set(x, y, escala, 0))
    v.centrosDeLosItems.forEach(([x, y], k) => u.uCentrosDeLosItems.value[k]?.set(x, y))
    u.uMasa.value.set(...v.masa)
    u.uCorrimiento.value.set(...v.corrimiento)
    u.uFuga.value.set(...v.fuga)
    u.uFondo.value = v.fondo
    u.uCambia.value = v.cambia
    u.uTurbulencia.value = v.turbulencia
    u.uTiempo.value = v.tiempo
    u.uAbre.value = v.abre
    u.uEspesorT.value = v.espesorT
    u.uAparece.value = v.aparece
    u.uFundido.value = v.fundido
    // [PULIDO 6] E1 · al final, la malla exacta (en el mismo lugar que las pistas en 1) entra con el tramado complementario
    // mientras la que se mueve sale: los dos dibujos se reparten los píxeles, sin sumarse.
    for (const o of enMovimiento) o.visible = v.fundido < 1 && v.aparece > 0
    exacta.visible = v.fundido > 0
    exacta.position.set(v.corrimiento[0], -v.corrimiento[1], 0)
    costo = performance.now() - t0
  }
  return {
    objetos: [...enMovimiento, exacta],
    materiales: [materiales.pared, materiales.cubierta, materiales.exacta],
    poner,
    soltar: () => {
      tapas.dispose()
      paredes.dispose()
      formas.textura.dispose()
      exacta.geometry.dispose()
      for (const m of [materiales.pared, materiales.cubierta, materiales.exacta, ...cuentas]) m.dispose()
    },
    costo: () => costo,
  }
}

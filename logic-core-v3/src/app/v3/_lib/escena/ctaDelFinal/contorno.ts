import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import { conElAmanecer } from '../amanecer/luz'
import { SATINADO } from '../estudio'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import type { Variante } from '../titulos3d/armado'
import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import type { MetamorfosisArmada } from './EscenaDelCta'
import type { CuadroDeLaMetamorfosis } from './fusion'
import type { ValorMedido } from './medidaDeLosValores'
import { contornosDeLaLetra, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { ATRAS, type EstadoDeLaMetamorfosis } from './transformacion'

/**
 * [PULIDO 4] C1 · LA METAMORFOSIS `contorno` — los contornos de las letras (y los trazos de los íconos) de los valores y los de
 * la frase, remuestreados a la MISMA cantidad de puntos, se interpolan con turbulencia: cada contorno de los valores va a uno
 * de la frase (en el orden de lectura: los de la izquierda a la izquierda), con su demora; los agujeros de los valores se
 * cierran al arrancar y los de la frase se abren al asentarse, cuando además crece su extrusión y vuelve adelante. La
 * geometría se REHACE en cada cuadro (la forma cambia de verdad: un contorno que se mueve no se puede triangular una vez):
 * la triangulación de three (earcut) y los costados, en una malla con búferes reservados; `costo()` dice cuánto tarda.
 */

export const CONTORNO = {
  /** Los puntos de cada contorno (los dos textos): con 28, la «o» de la frase a 56 px no muestra facetas (0,24 px). */
  puntos: 28,
  /** Cuánto demora cada contorno (fracción del cambio): por su orden de lectura y un poco al azar. */
  demora: 0.38,
  /** La turbulencia (px, por el cuerpo de la frase) y la vida del flujo con el progreso. */
  turbulencia: 0.55,
  vidaDelFlujo: 2.2,
  /** Los agujeros de los valores se cierran en esta fracción del cambio de su contorno. */
  cierra: 0.3,
  /** Los tramos rectos más largos al leer las letras (em), antes de remuestrear. */
  maximo: 0.05,
} as const

/** Un contorno en px (y hacia abajo), cerrado, sin repetir el primer punto. */
type Contorno = readonly THREE.Vector2[]

interface ContornoDeLosValores {
  readonly item: number
  /** En px de la caja de su valor (sin escala), remuestreado. */
  readonly borde: Contorno
  readonly agujeros: readonly Contorno[]
  /** A qué contorno de la frase va, con qué giro de puntos (el inicio que menos se tuerce) y su demora. */
  readonly destino: number
  readonly giro: number
  readonly demora: number
}

interface LetraDeLaFraseEnContornos {
  /** En px de la pantalla (y hacia abajo), remuestreado. */
  readonly borde: Contorno
  readonly agujeros: readonly Contorno[]
}

/** Remuestrea un contorno cerrado a `n` puntos por largo de arco. */
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

const area = (c: Contorno): number => c.reduce((a, p, k) => a + p.x * c[(k + 1) % c.length].y - c[(k + 1) % c.length].x * p.y, 0) / 2
const centroDe = (c: Contorno): THREE.Vector2 => c.reduce((a, p) => a.add(p), new THREE.Vector2()).multiplyScalar(1 / Math.max(1, c.length))
/** Todos en el mismo sentido (el de un borde de la fuente en la pantalla). */
const enSentido = (c: THREE.Vector2[]): THREE.Vector2[] => (area(c) < 0 ? c.reverse() : c)

/** El inicio de `a` que menos se tuerce contra `b` (cada uno centrado y en su escala). */
function mejorGiro(a: Contorno, b: Contorno): number {
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

/** Los contornos de una letra en px (y hacia abajo), con su avance en `x` y su línea de base en `base`. */
function contornosEnPx(fuente: Font, c: string, x: number, base: number, cuerpo: number): { borde: THREE.Vector2[]; agujeros: THREE.Vector2[][] }[] {
  return contornosDeLaLetra(fuente, c, CONTORNO.maximo).map((f) => ({
    borde: f.borde.map((p) => new THREE.Vector2(x + p.x * cuerpo, base - p.y * cuerpo)),
    agujeros: f.agujeros.map((h) => h.map((p) => new THREE.Vector2(x + p.x * cuerpo, base - p.y * cuerpo))),
  }))
}

/** Los trazos de un ícono como contornos (px de la caja del valor): cada trazo abierto, una banda; uno cerrado, un anillo. */
function contornosDelIcono(svg: string, x: number, y: number, ancho: number): { borde: THREE.Vector2[]; agujeros: THREE.Vector2[][] }[] {
  const datos = new SVGLoader().parse(svg)
  const k = ancho / 24
  const medio = (1.5 * k) / 2
  const salida: { borde: THREE.Vector2[]; agujeros: THREE.Vector2[][] }[] = []
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
        const n = new THREE.Vector2(-t.y, t.x).normalize()
        return p.clone().addScaledVector(n, s * medio)
      })
      if (cerrado) salida.push({ borde: corrido(1), agujeros: [corrido(-1)] })
      else salida.push({ borde: [...corrido(1), ...corrido(-1).reverse()], agujeros: [] })
    }
  }
  return salida
}

/** Un ruido suave (valor en una grilla, interpolación quíntica) para la turbulencia de los contornos. Determinista. */
function azar(i: number, j: number, k: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453
  return s - Math.floor(s)
}
const quintica = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10)
function ruido(x: number, y: number, z: number): number {
  const [i, j, k] = [Math.floor(x), Math.floor(y), Math.floor(z)]
  const [u, v, w] = [quintica(x - i), quintica(y - j), quintica(z - k)]
  const l = (a: number, b: number, t: number): number => a + (b - a) * t
  const cara = (kk: number): number => l(l(azar(i, j, kk), azar(i + 1, j, kk), u), l(azar(i, j + 1, kk), azar(i + 1, j + 1, kk), u), v)
  return l(cara(k), cara(k + 1), w) * 2 - 1
}

/** El búfer de la malla que se rehace: posiciones y normales, reservado para lo más que puede llegar a tener. */
interface Bufer {
  readonly posiciones: Float32Array
  readonly normales: Float32Array
  n: number
}

function triangulo(b: Bufer, a: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, nx: number, ny: number, nz: number): void {
  if (b.n + 3 > b.posiciones.length / 3) return
  for (const p of [a, c, d]) {
    b.posiciones.set([p.x, p.y, p.z], b.n * 3)
    b.normales.set([nx, ny, nz], b.n * 3)
    b.n += 1
  }
}

const A = new THREE.Vector3()
const B = new THREE.Vector3()
const C = new THREE.Vector3()
const D = new THREE.Vector3()

/**
 * Una forma (borde y agujeros, en px del plano del marco con la y ya dada vuelta) en la malla: su cara de adelante en `z`
 * y, si tiene espesor (px), la de atrás y sus costados.
 */
function forma(b: Bufer, borde: readonly THREE.Vector2[], agujeros: readonly (readonly THREE.Vector2[])[], z: number, espesor: number): void {
  const caras = THREE.ShapeUtils.triangulateShape(borde as THREE.Vector2[], agujeros as THREE.Vector2[][])
  const todos = [...borde, ...agujeros.flat()]
  for (const [i, j, k] of caras) {
    const [p, q, r] = [todos[i], todos[j], todos[k]]
    const lado = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
    const [x, y] = lado >= 0 ? [q, r] : [r, q]
    triangulo(b, A.set(p.x, p.y, z), B.set(x.x, x.y, z), C.set(y.x, y.y, z), 0, 0, 1)
    if (espesor > 0.01) triangulo(b, A.set(p.x, p.y, z - espesor), B.set(y.x, y.y, z - espesor), C.set(x.x, x.y, z - espesor), 0, 0, -1)
  }
  if (espesor <= 0.01) return
  for (const anillo of [borde, ...agujeros]) {
    for (let i = 0; i < anillo.length; i += 1) {
      const p = anillo[i]
      const q = anillo[(i + 1) % anillo.length]
      const n = new THREE.Vector2(q.y - p.y, p.x - q.x).normalize()
      A.set(p.x, p.y, z)
      B.set(q.x, q.y, z)
      C.set(q.x, q.y, z - espesor)
      D.set(p.x, p.y, z - espesor)
      triangulo(b, A, D, C, n.x, n.y, 0)
      triangulo(b, A, C, B, n.x, n.y, 0)
    }
  }
}

function materialDelContorno(color: Variante): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: color === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true, side: THREE.DoubleSide })
  const dia = `( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) )`
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vTapa;').replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvTapa = step( 0.5, abs( normal.z ) );')
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vTapa;').replace('#include <map_fragment>', `#include <map_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, mix( 1.0, vTapa, ${dia} ) );`)
  }
  m.customProgramCacheKey = () => `metamorfosis-contorno-${color}`
  conElAmanecer(m)
  return m
}

const suave = (u: number): number => u * u * (3 - 2 * u)
const acotar = (x: number): number => Math.min(1, Math.max(0, x))

/** Arma `contorno`: los contornos de los dos textos remuestreados y apareados, y la malla que se rehace en cada cuadro. */
export function armarElContorno(valores: readonly (ValorMedido | null)[], frase: readonly LetraDeLaFrase[], fuentes: { readonly valores: Font; readonly frase: Font; readonly fuerte: Font }, color: Variante): MetamorfosisArmada {
  const N = CONTORNO.puntos
  // La frase: cada letra, sus bordes remuestreados (y sus agujeros, densificados) en px de la pantalla.
  const deLaFrase: LetraDeLaFraseEnContornos[] = []
  for (const l of frase) {
    for (const f of contornosEnPx(l.fuerte ? fuentes.fuerte : fuentes.frase, l.c, l.x, l.base, l.cuerpo)) {
      deLaFrase.push({ borde: enSentido(remuestrear(f.borde, N)), agujeros: f.agujeros.map((h) => enSentido(remuestrear(h, Math.max(12, Math.round(N * 0.7)))).reverse()) })
    }
  }
  // Los valores: cada borde (de letra o de trazo) remuestreado, en px de su caja, en el orden de lectura.
  const crudos: { item: number; borde: THREE.Vector2[]; agujeros: THREE.Vector2[][] }[] = []
  valores.forEach((v, item) => {
    if (v === null) return
    for (const l of v.letras) for (const f of contornosEnPx(fuentes.valores, l.c, l.x, l.base, l.cuerpo)) crudos.push({ item, ...f })
    for (const i of v.iconos) for (const f of contornosDelIcono(i.svg, i.x, i.y, i.ancho)) crudos.push({ item, ...f })
  })
  const nD = Math.max(1, deLaFrase.length)
  const deLosValores: ContornoDeLosValores[] = crudos.map((c, i) => {
    const borde = enSentido(remuestrear(c.borde, N))
    const destino = Math.min(nD - 1, Math.floor((i * nD) / Math.max(1, crudos.length)))
    const giro = deLaFrase[destino] === undefined ? 0 : mejorGiro(borde, deLaFrase[destino].borde)
    const orden = crudos.length <= 1 ? 0 : i / (crudos.length - 1)
    return { item: c.item, borde, agujeros: c.agujeros.map((h) => enSentido(remuestrear(h, 12)).reverse()), destino, giro, demora: CONTORNO.demora * (0.7 * orden + 0.3 * azar(i, 3, 7)) }
  })
  const maximo = deLosValores.length * (N * 3 * 2 + 12 * 6) + deLaFrase.length * (N * 18 + 60 * 6)
  const bufer: Bufer = { posiciones: new Float32Array(maximo * 3), normales: new Float32Array(maximo * 3), n: 0 }
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(bufer.posiciones, 3).setUsage(THREE.DynamicDrawUsage))
  geometria.setAttribute('normal', new THREE.BufferAttribute(bufer.normales, 3).setUsage(THREE.DynamicDrawUsage))
  geometria.setDrawRange(0, 0)
  const material = materialDelContorno(color)
  const malla = new THREE.Mesh(geometria, material)
  malla.frustumCulled = false
  malla.visible = false
  malla.name = 'metamorfosis · contornos'
  let costo = 0
  // Lo que se reusa entre cuadros (sin reservar en cada uno).
  const puntos = Array.from({ length: N }, () => new THREE.Vector2())
  const enElPlano = (v: THREE.Vector2, z: number, fondo: number, fuga: { readonly x: number; readonly y: number }): THREE.Vector2 => {
    // Lo que se ve en `v` (px de la pantalla) a la profundidad `z`: en el plano, sin achicarse hacia el punto de fuga; y dado vuelta.
    const k = (fondo - z) / Math.max(1, fondo)
    return v.set(fuga.x + (v.x - fuga.x) * k, -(fuga.y + (v.y - fuga.y) * k))
  }

  const poner = (e: EstadoDeLaMetamorfosis, c: CuadroDeLaMetamorfosis): void => {
    const t0 = performance.now()
    bufer.n = 0
    const zM = -ATRAS * c.fondo
    const kM = c.fondo / (c.fondo - zM)
    const F = c.cajaDeLaFrase
    const zS = zM * e.atras
    const kS = c.fondo / (c.fondo - zS)
    const amplitud = CONTORNO.turbulencia * c.cuerpoDeLaFrase * e.turbulencia
    const tiempo = CONTORNO.vidaDelFlujo * c.progreso
    // La frase, achicada en la masa (su centro, en su lugar), y vuelta adelante con `adelante`.
    const zF = zM * (1 - e.adelante)
    const kF = c.fondo / (c.fondo - zF)
    const aLaMasa = (p: THREE.Vector2, k: number, salida: THREE.Vector2): THREE.Vector2 => salida.set(F.x + (p.x + c.corrimiento.x - F.x) * k, F.y + (p.y + c.corrimiento.y - F.y) * k)
    const turbulento = (p: THREE.Vector2, fuerza: number): void => {
      if (fuerza <= 0) return
      p.x += ruido(p.x * 0.009, p.y * 0.009, tiempo) * fuerza
      p.y += ruido(p.x * 0.009 + 17.3, p.y * 0.009, tiempo + 5.1) * fuerza
    }
    if (e.cambia < 1 && c.apareceDeLosValores > 0) {
      const T = new THREE.Vector2()
      for (const s of deLosValores) {
        const it = c.items[s.item]
        if (it === undefined) continue
        const m = acotar((e.cambia - s.demora) / (1 - CONTORNO.demora))
        const u = suave(m)
        const destino = deLaFrase[s.destino]
        const z = zS + (zM - zS) * u
        // Cada punto: en su caja de ahora, atrás (achicado alrededor del centro de su valor), hacia su punto de la frase en la masa.
        for (let i = 0; i < N; i += 1) {
          const q = s.borde[(i + s.giro) % N]
          const p = puntos[i].set(it.x + q.x * it.escala, it.y + q.y * it.escala)
          p.set(it.cx + (p.x - it.cx) * kS, it.cy + (p.y - it.cy) * kS)
          if (destino !== undefined) p.lerp(aLaMasa(destino.borde[i], kM, T), u)
          turbulento(p, amplitud * Math.sin(Math.PI * u))
          enElPlano(p, z, c.fondo, c.fuga)
        }
        // Los agujeros del valor se cierran (hacia su centro) al arrancar, y van con el borde hacia su letra de la frase.
        const cierra = 1 - suave(acotar(m / CONTORNO.cierra))
        const haciaLaLetra = destino === undefined ? null : aLaMasa(centroDe(destino.borde), kM, new THREE.Vector2())
        const agujeros = cierra <= 0.02 ? [] : s.agujeros.map((h) => {
          const ch = centroDe(h)
          return h.map((q) => {
            const p = new THREE.Vector2(it.x + (ch.x + (q.x - ch.x) * cierra) * it.escala, it.y + (ch.y + (q.y - ch.y) * cierra) * it.escala)
            p.set(it.cx + (p.x - it.cx) * kS, it.cy + (p.y - it.cy) * kS)
            if (haciaLaLetra !== null) p.lerp(haciaLaLetra, u)
            return enElPlano(p, z, c.fondo, c.fuga)
          })
        })
        forma(bufer, puntos, agujeros, z, m <= 0 ? 0.05 * it.cuerpo * it.escala : 0)
      }
    } else if (e.cambia >= 1) {
      // La frase: sus bordes (donde terminaron los de los valores), sus agujeros que se abren y su espesor que crece.
      const abre = 1 - e.sucia
      const espesor = VOLUMEN_DEL_TITULO.profundidad * c.cuerpoDeLaFrase * kF * e.espesor
      for (const l of deLaFrase) {
        const borde = l.borde.map((q) => {
          const p = aLaMasa(q, kF, new THREE.Vector2())
          turbulento(p, amplitud)
          return enElPlano(p, zF, c.fondo, c.fuga)
        })
        const agujeros = abre <= 0.02 ? [] : l.agujeros.map((h) => {
          const ch = centroDe(h)
          return h.map((q) => {
            const p = aLaMasa(new THREE.Vector2(ch.x + (q.x - ch.x) * abre, ch.y + (q.y - ch.y) * abre), kF, new THREE.Vector2())
            turbulento(p, amplitud)
            return enElPlano(p, zF, c.fondo, c.fuga)
          })
        })
        forma(bufer, borde, agujeros, zF, espesor)
      }
    }
    geometria.setDrawRange(0, bufer.n)
    const pos = geometria.getAttribute('position')
    const nor = geometria.getAttribute('normal')
    if (pos instanceof THREE.BufferAttribute && nor instanceof THREE.BufferAttribute) {
      pos.clearUpdateRanges()
      pos.addUpdateRange(0, bufer.n * 3)
      pos.needsUpdate = true
      nor.clearUpdateRanges()
      nor.addUpdateRange(0, bufer.n * 3)
      nor.needsUpdate = true
    }
    malla.visible = bufer.n > 0
    costo = performance.now() - t0
  }
  return {
    objetos: [malla],
    materiales: [material],
    poner,
    soltar: () => {
      geometria.dispose()
      material.dispose()
    },
    costo: () => costo,
  }
}

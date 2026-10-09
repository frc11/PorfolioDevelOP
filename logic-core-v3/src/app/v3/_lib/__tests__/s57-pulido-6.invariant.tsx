/**
 * PULIDO 6 — el invariante: npm run test:s57-pulido-6
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   E1 · el entremedio del CTA tan limpio como el final: ningún contorno se cruza a sí mismo en ningún cuadro (el camino
 *        canónico por flujo), el cartel del giro y la frase que se arma no se pisan, el cambio a la malla exacta es un fundido
 *        complementario, el foco del teclado llega a «HABLANOS» transformado; `?meta=fusion` y `?ancho=expandido`, borrados.
 *   E2 · el filo con poder: por AFUERA del logo (el negro entero), sin el círculo liso (la energía llega hasta el logo, los
 *        bloques pegados al ras, las ondas nacen en el filo), tres maneras de hacer luz (`?filo=corriente|pulso|descarga`) y el
 *        filo que se enciende de golpe con el golpe; el anillo, el disco y el filo de adentro, borrados. [PULIDO 7] F1 · ganó la
 *        descarga (la corriente, el pulso y `?filo=`, borrados: la sección 3 fija lo que queda; lo nuevo, `s58`).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-6.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { CONTORNO, TIPO, pistasDeLaMetamorfosis, valoresDelCuadro, type CuadroDeLaMetamorfosis, type ValoresDelCuadro } from '../escena/ctaDelFinal/contorno'
import { FUENTES_DEL_CTA, TRACKING_DEL_CTA, avancesDe } from '../escena/ctaDelFinal/fuentesDelCta'
import { letrasDeLaFrase, type LetraDeLaFrase } from '../escena/ctaDelFinal/piezasDeLaMetamorfosis'
import { TRANSFORMACION, armadoSobreElCta, estadoDeLaMetamorfosis, nuevaPose, posesDe, type EscenaDeLaTransformacion, type LetraEnPantalla, type PosesDeLaTransformacion } from '../escena/ctaDelFinal/transformacion'
import { CTA, FRASE, VALORES } from '../../_secciones/por-que-develop/contenido'
import CHIVO_400_VALORES from '../../_fuentes/chivo-400-valores.json'
import { CALMA_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { HUECO, distanciaAfuera } from '../escena/final/hueco'
import { ENERGIA_EN_LA_SIMULACION_GLSL, LUZ_DE_ABAJO, radioDeLaExpansion } from '../escena/final/luzDeAbajo'
import { FILO, bandaDelFilo, contornosDelLogo, creceDelFilo, enElNegro, luzDelFilo } from '../escena/final/filoConPoder'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL } from '../escena/final/recorridoDelFinal'
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('E1 · El entremedio del CTA, tan limpio como el final')

// LA COMPOSICIÓN DE PRUEBA (las medidas del banco a 1440 × 900 y a 390 × 844): los seis valores en la Chivo del DOM (en el teléfono,
// sólo sus títulos), la frase en sus renglones y «HABLANOS» abajo, y «Seis razones» arriba (el título).
const CHIVO = new Font(CHIVO_400_VALORES as FontData)
const av = (c: string): number => (CHIVO.data.glyphs[c]?.ha ?? 0) / CHIVO.data.resolution
type Valor = Parameters<typeof pistasDeLaMetamorfosis>[0][number]
function valorDePrueba(titular: string, linea: string | null): Valor {
  const letras: { c: string; x: number; base: number; cuerpo: number }[] = []
  let x = 0
  for (const c of titular) {
    if (c.trim() !== '') letras.push({ c, x, base: 22, cuerpo: 20 })
    x += av(c) * 20
  }
  let [lx, base] = [0, 50]
  for (const palabra of linea === null ? [] : linea.split(' ')) {
    if (lx + [...palabra].reduce((a, c) => a + av(c) * 14, 0) > 260) [lx, base] = [0, base + 18]
    for (const c of palabra) {
      if (c.trim() !== '') letras.push({ c, x: lx, base, cuerpo: 14 })
      lx += av(c) * 14
    }
    lx += av(' ') * 14
  }
  return { letras, iconos: [], ancho: 270, alto: base + 6, enLaRaiz: null }
}
interface Composicion {
  readonly valores: Valor[]
  readonly inicio: { x: number; y: number; escala: number }[]
  readonly frase: LetraDeLaFrase[]
  readonly origen: LetraEnPantalla[]
  readonly destino: LetraEnPantalla[]
  readonly pantalla: { readonly ancho: number; readonly alto: number }
}
const letrasDe = (texto: string, x0: number, y: number, cuerpo: number, renglon: number, f: (c: string) => number): LetraEnPantalla[] => {
  let x = x0
  return [...texto].flatMap((c) => {
    const l = { x: x + (f(c) * cuerpo) / 2, y, cuerpo, ancho: f(c) * cuerpo, alto: 0.7 * cuerpo, renglon, letra: c }
    x += f(c) * cuerpo
    return c.trim() === '' ? [] : [l]
  })
}
function composicion(escritorio: boolean): Composicion {
  const [ancho, alto] = escritorio ? [1440, 900] : [390, 844]
  const valores = VALORES.map((v) => valorDePrueba(v.titulo, escritorio ? v.linea : null))
  const inicio = escritorio ? [0, 1, 2, 3, 4, 5].map((k) => ({ x: k < 3 ? 160 : 1010, y: 240 + (k % 3) * 120, escala: 1 })) : [0, 1, 2, 3, 4, 5].map((k) => ({ x: 110, y: 330 + k * 30, escala: 1 }))
  const renglones = escritorio
    ? [{ texto: CTA.frase, fuerte: false, izquierda: 150, arriba: 300, ancho: 1140, alto: 90, cuerpo: 87 }, { texto: CTA.destacado, fuerte: true, izquierda: 150, arriba: 390, ancho: 1140, alto: 90, cuerpo: 87 }]
    : [{ texto: 'Este sitio empezó', fuerte: false, izquierda: 16, arriba: 290, ancho: 358, alto: 46, cuerpo: 40 }, { texto: 'con una charla.', fuerte: false, izquierda: 16, arriba: 336, ancho: 358, alto: 46, cuerpo: 40 }, { texto: CTA.destacado, fuerte: true, izquierda: 16, arriba: 382, ancho: 358, alto: 46, cuerpo: 40 }]
  const frase = letrasDeLaFrase(renglones, FUENTES_DEL_CTA.frase, FUENTES_DEL_CTA.fuerte, escritorio ? 1238 : 350)
  const fuerte = FUENTES_DEL_CTA.fuerte
  const cuerpoDelCta = escritorio ? 104 : 46
  const avCta = avancesDe(fuerte, CTA.rotulo.toUpperCase(), TRACKING_DEL_CTA.fuerte)
  const xCta = ancho / 2 - (avCta.ancho * cuerpoDelCta) / 2
  const destino = letrasDe(CTA.rotulo.toUpperCase(), xCta, escritorio ? 555 : 470, cuerpoDelCta, 0, (c) => (fuerte.fuente.data.glyphs[c]?.ha ?? 0) / fuerte.fuente.data.resolution)
  const origen = [...letrasDe(FRASE.izquierda, escritorio ? 450 : 60, escritorio ? 150 : 120, escritorio ? 64 : 34, 0, av), ...letrasDe(FRASE.derecha, escritorio ? 470 : 40, escritorio ? 220 : 160, escritorio ? 64 : 34, 1, av)]
  return { valores, inicio, frase, origen, destino, pantalla: { ancho, alto } }
}
const COMPOSICIONES = [composicion(true), composicion(false)]
const FUENTES = { valores: CHIVO, frase: FUENTES_DEL_CTA.frase.fuente, fuerte: FUENTES_DEL_CTA.fuerte.fuente }
const cajaDeLaFrase = (letras: readonly LetraDeLaFrase[]): { x: number; y: number; ancho: number; alto: number } => {
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const l of letras) {
    x0 = Math.min(x0, l.x)
    x1 = Math.max(x1, l.x + 0.6 * l.cuerpo)
    y0 = Math.min(y0, l.base - 0.75 * l.cuerpo)
    y1 = Math.max(y1, l.base + 0.2 * l.cuerpo)
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: x1 - x0, alto: y1 - y0 }
}
const cuadroDe = (k: Composicion, p: number): CuadroDeLaMetamorfosis => ({
  items: k.inicio.map((c, i) => ({ ...c, cuerpo: 20, cx: c.x + (k.valores[i]?.ancho ?? 0) / 2, cy: c.y + (k.valores[i]?.alto ?? 0) / 2 })),
  cajaDeLosValores: { x: k.pantalla.ancho / 2, y: 360, ancho: k.pantalla.ancho * 0.8, alto: 300 },
  cajaDeLaFrase: cajaDeLaFrase(k.frase),
  corrimiento: { x: 0, y: 0 },
  cuerpoDeLaFrase: Math.max(...k.frase.map((l) => l.cuerpo)),
  fuga: { x: k.pantalla.ancho / 2, y: k.pantalla.alto / 2 },
  fondo: k.pantalla.alto * 1.8,
  progreso: p,
  apareceDeLosValores: 1,
})

// LA CUENTA DEL VÉRTICE, EN LA CPU: la misma de `contorno.ts` (`metaPunto`), con su ruido (el simplex de Ashima, portado). Lo que
// se ve de cada punto en la pantalla (el vértice lo lleva al plano a su profundidad para que se vea ahí: `metaAlPlano`).
const mod289 = (x: number): number => x - Math.floor(x / 289) * 289
const permutar = (x: number): number => mod289((x * 34 + 1) * x)
function ruido(vx: number, vy: number, vz: number): number {
  const s = (vx + vy + vz) / 3
  const [ix, iy, iz] = [Math.floor(vx + s), Math.floor(vy + s), Math.floor(vz + s)]
  const t = (ix + iy + iz) / 6
  const x0 = [vx - ix + t, vy - iy + t, vz - iz + t]
  const g = [x0[0] >= x0[1] ? 1 : 0, x0[1] >= x0[2] ? 1 : 0, x0[2] >= x0[0] ? 1 : 0]
  const l = g.map((v) => 1 - v)
  const i1 = [Math.min(g[0], l[2]), Math.min(g[1], l[0]), Math.min(g[2], l[1])]
  const i2 = [Math.max(g[0], l[2]), Math.max(g[1], l[0]), Math.max(g[2], l[1])]
  const x1 = x0.map((v, k) => v - i1[k] + 1 / 6)
  const x2 = x0.map((v, k) => v - i2[k] + 1 / 3)
  const x3 = x0.map((v) => v - 0.5)
  const [mx, my, mz] = [mod289(ix), mod289(iy), mod289(iz)]
  const pz = [0, i1[2], i2[2], 1].map((o) => permutar(mz + o))
  const py = pz.map((v, k) => permutar(v + my + [0, i1[1], i2[1], 1][k]))
  const p = py.map((v, k) => permutar(v + mx + [0, i1[0], i2[0], 1][k]))
  const n = 0.142857142857
  const ns = [n * 2, n * 0.5 - 1, n]
  const j = p.map((v) => v - 49 * Math.floor(v * ns[2] * ns[2]))
  const xx = j.map((v) => Math.floor(v * ns[2]))
  const yy = j.map((v, k) => Math.floor(v - 7 * xx[k]))
  const X = xx.map((v) => v * ns[0] + ns[1])
  const Y = yy.map((v) => v * ns[0] + ns[1])
  const h = X.map((v, k) => 1 - Math.abs(v) - Math.abs(Y[k]))
  const b0 = [X[0], X[1], Y[0], Y[1]]
  const b1 = [X[2], X[3], Y[2], Y[3]]
  const s0 = b0.map((v) => Math.floor(v) * 2 + 1)
  const s1 = b1.map((v) => Math.floor(v) * 2 + 1)
  const sh = h.map((v) => (v <= 0 ? -1 : 0))
  const a0 = [b0[0] + s0[0] * sh[0], b0[2] + s0[2] * sh[0], b0[1] + s0[1] * sh[1], b0[3] + s0[3] * sh[1]]
  const a1 = [b1[0] + s1[0] * sh[2], b1[2] + s1[2] * sh[2], b1[1] + s1[1] * sh[3], b1[3] + s1[3] * sh[3]]
  const gs = [[a0[0], a0[1], h[0]], [a0[2], a0[3], h[1]], [a1[0], a1[1], h[2]], [a1[2], a1[3], h[3]]].map((q) => {
    const norma = 1.79284291400159 - 0.85373472095314 * (q[0] * q[0] + q[1] * q[1] + q[2] * q[2])
    return q.map((v) => v * norma)
  })
  const xs = [x0, x1, x2, x3]
  let suma = 0
  xs.forEach((x, k) => {
    const m = Math.max(0.6 - (x[0] * x[0] + x[1] * x[1] + x[2] * x[2]), 0)
    suma += m * m * m * m * (gs[k][0] * x[0] + gs[k][1] * x[1] + gs[k][2] * x[2])
  })
  return 42 * suma
}
const flujo = (x: number, y: number, t: number): [number, number] => [ruido(x * 0.0075, y * 0.0075, t), ruido(x * 0.0075 + 19.3, y * 0.0075 + 19.3, t + 7.1)]
const acotar = (x: number): number => Math.min(1, Math.max(0, x))
const escalon = (a: number, b: number, x: number): number => {
  const t = acotar((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
type Pista = ReturnType<typeof pistasDeLaMetamorfosis>[number]
function puntoVisto(p: Pista, i: number, v: ValoresDelCuadro): [number, number] {
  const [cx, cy, escala] = v.items[p.item]
  const [ix, iy] = v.centrosDeLosItems[p.item]
  const crudo = (v.cambia - p.demora) / (1 - CONTORNO.demora)
  const m = acotar(crudo)
  const u = m * m * (3 - 2 * m)
  const C = p.centros
  let [sx, sy] = [p.s[i].x, p.s[i].y]
  if (p.tipo === TIPO.agujeroDeLosValores) [sx, sy] = [sx + (C[0] - sx) * escalon(0, CONTORNO.cierra, m), sy + (C[1] - sy) * escalon(0, CONTORNO.cierra, m)]
  if (p.tipo === TIPO.sobra) [sx, sy] = [sx + (C[0] - sx) * escalon(0, CONTORNO.seDesarma, m), sy + (C[1] - sy) * escalon(0, CONTORNO.seDesarma, m)]
  const enS = (x: number, y: number): [number, number] => [ix + (cx + x * escala - ix) * v.kS, iy + (cy + y * escala - iy) * v.kS]
  const enT = (x: number, y: number): [number, number] => [v.masa[0] + (x + v.corrimiento[0] - v.masa[0]) * v.kF, v.masa[1] + (y + v.corrimiento[1] - v.masa[1]) * v.kF]
  const S = enS(sx, sy)
  let [tx, ty] = [p.t[i].x, p.t[i].y]
  if (p.tipo === TIPO.agujeroDeLaFrase) {
    const a = Math.max(escalon(1, 1 + CONTORNO.abre, crudo), v.abre)
    ;[tx, ty] = [C[2] + (tx - C[2]) * a, C[3] + (ty - C[3]) * a]
  }
  const T = enT(tx, ty)
  let P: [number, number] = [S[0] + (T[0] - S[0]) * u, S[1] + (T[1] - S[1]) * u]
  const cS = enS(C[0], C[1])
  const cT = enT(C[2], C[3])
  if (p.fotos !== undefined) {
    const K = CONTORNO.flujo.fotos.length - 1
    const [A, B] = CONTORNO.flujo.redondo
    const forma = (fotos: readonly (readonly THREE.Vector2[])[], f: number): [number, number] => {
      const f0 = Math.floor(f)
      const f1 = Math.min(f0 + 1, K)
      const [a, b] = [fotos[f0][i], fotos[f1][i]]
      return [a.x + (b.x - a.x) * (f - f0), a.y + (b.y - a.y) * (f - f0)]
    }
    const fS = enS(...forma(p.fotos.s, K * acotar(u / A)))
    const fT = enT(...forma(p.fotos.t, K * acotar((1 - u) / (1 - B))))
    const w = escalon(A, B, u)
    P = [cS[0] + (cT[0] - cS[0]) * u + (fS[0] - cS[0]) * (1 - w) + (fT[0] - cT[0]) * w, cS[1] + (cT[1] - cS[1]) * u + (fS[1] - cS[1]) * (1 - w) + (fT[1] - cT[1]) * w]
  }
  const lineal = [cS[0] + (cT[0] - cS[0]) * u, cS[1] + (cT[1] - cS[1]) * u]
  const centro = [lineal[0], cS[1] + (cT[1] - cS[1]) * escalon(0, CONTORNO.vertical, u)]
  const [dx, dy] = flujo(centro[0], centro[1], v.tiempo)
  const fuerza = v.turbulencia * Math.sin(Math.PI * u)
  return [P[0] + centro[0] - lineal[0] + dx * fuerza, P[1] + centro[1] - lineal[1] + dy * fuerza]
}
type P2 = readonly [number, number]
function seCruza(c: readonly P2[]): boolean {
  const n = c.length
  const corta = (p: P2, q: P2, r: P2, s: P2): boolean => {
    const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0])
    if (Math.abs(d) < 1e-12) return false
    const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d
    const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d
    return t > 1e-7 && t < 1 - 1e-7 && u > 1e-7 && u < 1 - 1e-7
  }
  for (let i = 0; i < n; i += 1) for (let j = i + 2; j < n; j += 1) if (!(i === 0 && j === n - 1) && corta(c[i], c[(i + 1) % n], c[j], c[(j + 1) % n])) return true
  return false
}
const MUESTRAS = [...Array(30).keys()].map((k) => (k + 0.5) / 30)
const PISTAS = COMPOSICIONES.map((k) => pistasDeLaMetamorfosis(k.valores, k.inicio, k.frase, FUENTES))
function cruces(pistasPorComposicion: readonly (readonly Pista[])[]): { cruzados: number; contornos: number } {
  let [cruzados, contornos] = [0, 0]
  pistasPorComposicion.forEach((pistas, k) => {
    for (const p of MUESTRAS) {
      const v = valoresDelCuadro(estadoDeLaMetamorfosis(p), cuadroDe(COMPOSICIONES[k], p))
      for (const pista of pistas) {
        contornos += 1
        if (seCruza(Array.from({ length: CONTORNO.puntos }, (_, i) => puntoVisto(pista, i, v)))) cruzados += 1
      }
    }
  })
  return { cruzados, contornos }
}
const contornoFuente = sinComentarios(leer('_lib/escena/ctaDelFinal/contorno.ts'))
const caminoEnElVertice = (f: string): boolean => f.includes('float w = smoothstep( ${CONTORNO.flujo.redondo[0].toFixed(3)}, ${CONTORNO.flujo.redondo[1].toFixed(3)}, u );') &&
  f.includes('P = mix( cS, cT, u ) + mix( fS - cS, fT - cT, w );') && f.includes('vec2 fS = cItem + ( caja.xy + metaForma( forma.x, 0.0, redondoS, forma.y ) * caja.z - cItem ) * uKS;') && f.includes('const [fs, ft] = [fotosDelFlujo(s.borde), fotosDelFlujo(t.borde)]')
const medida = cruces(PISTAS)
afirmar(medida.cruzados === 0 && medida.contornos > 20000 && caminoEnElVertice(contornoFuente), '1 · a 1440 y a 390, en 30 cuadros del progreso, NINGÚN contorno se cruza a sí mismo (la cuenta del vértice, en la CPU, con su turbulencia): el camino canónico por flujo', `${String(medida.cruzados)} cruzados de ${String(medida.contornos)} contornos medidos (antes, en el camino directo, 17 de los 47 pares se cruzaban)`)
// El control: un par con dos puntos de su letra de la frase intercambiados (un cruce de verdad).
const conUnCruce = PISTAS.map((pistas, k) => (k > 0 ? pistas : pistas.map((p, j) => {
  if (j !== pistas.findIndex((q) => q.tipo === TIPO.par)) return p
  const t = [...p.t]
  ;[t[3], t[17]] = [t[17], t[3]]
  return { ...p, t, fotos: undefined }
})))
controlPositivo('1 · el detector VE un par con un cruce inyectado', conUnCruce, (x: readonly (readonly Pista[])[]) => cruces(x).cruzados === 0)
controlPositivo('  y el camino directo de antes (sin el flujo)', PISTAS.map((pistas) => pistas.map((p) => ({ ...p, fotos: undefined }))), (x: readonly (readonly Pista[])[]) => cruces(x).cruzados === 0)

// 2 · EL GIRO Y LA FRASE NO SE PISAN: el cartel va en la franja de «HABLANOS» (no más alto que ella) y la frase se arma en la suya.
// En cada cuadro, la caja de lo que el giro muestra y la de los contornos que ya van a la frase (pasada la mitad de su camino)
// no se cruzan, a 1440 y a 390.
const escena = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
type Caja = { x0: number; y0: number; x1: number; y1: number }
const unir = (a: Caja | null, b: Caja): Caja => (a === null ? b : { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) })
const seTocan = (a: Caja, b: Caja): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const altoDelCartel = (k: Composicion): number => {
  const ys = k.destino.map((l) => l.y + l.alto / 2)
  const f = cajaDeLaFrase(k.frase)
  return Math.max(1, Math.max(...ys) - (f.y + f.alto / 2) - 0.12 * (k.destino[0]?.cuerpo ?? 0))
}
function pisadas(conAlto: boolean): number {
  let n = 0
  COMPOSICIONES.forEach((k, j) => {
    const alto = conAlto ? altoDelCartel(k) : undefined
    const e: EscenaDeLaTransformacion = { origen: k.origen, destino: k.destino, pantalla: k.pantalla, armado: armadoSobreElCta(k.origen, k.destino, alto), altoDelCartel: alto }
    const poses: PosesDeLaTransformacion = { origen: k.origen.map(nuevaPose), destino: k.destino.map(nuevaPose) }
    for (let c = 0; c <= 60; c += 1) {
      const p = c / 60
      posesDe(p, e, poses)
      let giro: Caja | null = null
      ;[...poses.origen.map((q, i) => ({ q, l: k.origen[i] })), ...poses.destino.map((q, i) => ({ q, l: k.destino[i] }))].forEach(({ q, l }) => {
        if (q.aparece <= 0) return
        const [w, h] = [(l.ancho * q.escala) / l.cuerpo / 2, (l.alto * q.escala) / l.cuerpo / 2]
        giro = unir(giro, { x0: q.x - w, y0: q.y - h, x1: q.x + w, y1: q.y + h })
      })
      const v = valoresDelCuadro(estadoDeLaMetamorfosis(p), cuadroDe(k, p))
      let frase: Caja | null = null
      for (const pista of PISTAS[j]) {
        const m = acotar((v.cambia - pista.demora) / (1 - CONTORNO.demora))
        if (m * m * (3 - 2 * m) < 0.5 || pista.tipo === TIPO.sobra || pista.tipo === TIPO.agujeroDeLosValores) continue
        for (let i = 0; i < CONTORNO.puntos; i += 4) {
          const [x, y] = puntoVisto(pista, i, v)
          frase = unir(frase, { x0: x, y0: y, x1: x, y1: y })
        }
      }
      if (giro !== null && frase !== null && seTocan(giro, frase)) n += 1
    }
  })
  return n
}
const pisadasDeHoy = pisadas(true)
afirmar(pisadasDeHoy === 0 && escena.includes('posesDe(p, { origen: a.letras.origen, destino, pantalla: { ancho: tam.width, alto: tam.height }, armado: armadoSobreElCta(a.letras.origen, destino, alto), altoDelCartel: alto }, a.poses)'), '2 · el cartel del giro, en la franja de «HABLANOS»; la frase se arma en la suya: sus cajas no se tocan en ningún cuadro (1440 y 390)', `${String(pisadasDeHoy)} cuadros con las cajas tocándose`)
controlPositivo('2 · el detector VE el cartel del ancho del CTA (el de antes, que subía a la franja de la frase)', false, (conAlto: boolean) => pisadas(conAlto) === 0)

// 3 · EL CAMBIO A LA MALLA EXACTA: un fundido de tramado complementario en el último `fundido` del progreso (cada píxel es de un
// dibujo o del otro, sin sumarse ni dejar huecos): antes, todo de la que se mueve; en 1, todo de la exacta; continuo en el medio.
const relevoDe = (p: number): number => valoresDelCuadro(estadoDeLaMetamorfosis(p), cuadroDe(COMPOSICIONES[0], p)).fundido
const relevoBien = (f: string, r: (p: number) => number): boolean => {
  const pasos = [...Array(1001).keys()].map((k) => r(k / 1000))
  const continuo = pasos.slice(1).every((v, k) => Math.abs(v - pasos[k]) < 0.06)
  return r(1 - CONTORNO.fundido - 0.001) === 0 && r(1) === 1 && continuo && CONTORNO.fundido >= 0.02 && CONTORNO.fundido <= 0.03 &&
    f.includes('if ( ( uAparece < 0.999 && metaTramado >= uAparece ) || metaTramado < uFundido ) discard;') && f.includes('if ( uFundido < 0.999 && ${TRAMADO_GLSL} >= uFundido ) discard;') &&
    f.includes('for (const o of enMovimiento) o.visible = v.fundido < 1 && v.aparece > 0') && f.includes('exacta.visible = v.fundido > 0')
}
afirmar(relevoBien(contornoFuente, relevoDe), '3 · el cambio a la malla exacta es un fundido complementario del último 3 % (sin el salto de brillo del bisel)', `del ${String((1 - CONTORNO.fundido) * 100)} % al 100 %`)
controlPositivo('3 · el detector VE el cambio de golpe en 1', [contornoFuente, (p: number) => (p >= 1 ? 1 : 0)] as const, ([a, b]: readonly [string, (p: number) => number]) => relevoBien(a, b))

// 4 · EL FOCO DEL TECLADO: «HABLANOS» es un enlace enfocable (sin `tabIndex` negativo) que abre Contacto con Enter (es un clic: lo
// atrapa la apertura del Contacto), y la homografía va en el ENLACE: su anillo de foco rodea el 3D. Medido en el banco
// (`e1-foco.ts`): Tab desde lo anterior llega a «HABLANOS» con :focus-visible, el anillo en su caja proyectada, Enter abre el diálogo.
const dom = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const focoBien = (d: string, e: string): boolean => d.includes('<motion.a') && d.includes('href={destino}') && d.includes('data-abre-contacto="panel"') && !/tabIndex=\{-1\}|tabIndex="-1"/.test(d) &&
  e.includes("const enlaceDelCta = (): HTMLElement | null => CTA_EN_VIVO.destino?.closest('a') ?? null")
afirmar(focoBien(dom, escena), '4 · el foco del teclado llega a «HABLANOS» transformado (un enlace, con el anillo en su plano) y Enter abre Contacto')
controlPositivo('4 · el detector VE el enlace fuera del Tab', [dom.replace('<motion.a', '<motion.a tabIndex={-1}'), escena] as const, ([a, b]: readonly [string, string]) => focoBien(a, b))

// 5 · LAS DECISIONES: `contorno` y el ancho normal son el producto; `fusion` (su código) y `?meta=`, `?ancho=expandido` (sus fuentes),
// borrados.
const decisionesBien = (pruebas: readonly string[], f: typeof entornoPedido): boolean => !existsSync(`${V3}/_lib/escena/ctaDelFinal/fusion.ts`) && !existsSync(`${V3}/_fuentes/archivo-expandido-cta.json`) && !existsSync(`${V3}/_fuentes/archivo-expandido-cta-fuerte.json`) &&
  !pruebas.includes('meta') && !pruebas.includes('ancho') && !('meta' in f('producto,meta=fusion').pruebas) && !('ancho' in f('producto,ancho=expandido').pruebas) && !('meta' in ENTORNO.pruebas) &&
  !/fusion/.test(escena) && !/expandido/.test(sinComentarios(leer('_lib/escena/ctaDelFinal/fuentesDelCta.ts')))
afirmar(decisionesBien(PRUEBAS_SUELTAS, entornoPedido), '5 · `fusion` (su código) y `?meta=`, `?ancho=expandido` (y sus fuentes), borrados: `contorno` y el ancho normal, el producto')
controlPositivo('5 · el detector VE la bandera `meta` todavía pedible', [...PRUEBAS_SUELTAS, 'meta'], (x: readonly string[]) => decisionesBien(x, entornoPedido))

// ═══════════════════════════════════════════════════════════════════════════
titulo('E2 · El filo con poder')

// UNA FORMA DE PRUEBA con la topología del logo (en Node no hay SVG): un contorno con una muesca (esquinas cóncavas, donde el
// inglete se cruza si está mal) y dos agujeros redondos. Y la misma con el contorno al revés: de qué lado queda el negro se prueba.
const circulo = (cx: number, cy: number, r: number, horario: boolean): THREE.Vector2[] => Array.from({ length: 48 }, (_, k) => {
  const a = ((horario ? -1 : 1) * k * 2 * Math.PI) / 48
  return new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))
})
const AFUERA = [[-3.4, -1.2], [3.4, -1.2], [3.4, 2.4], [0.6, 2.4], [0.6, 1.0], [-0.6, 1.0], [-0.6, 2.4], [-3.4, 2.4]].map(([x, y]) => new THREE.Vector2(x, y))
const formaDePrueba = (alReves: boolean): THREE.Shape[] => {
  const f = new THREE.Shape(alReves ? [...AFUERA].reverse() : AFUERA)
  f.holes = [new THREE.Path(circulo(-2, 0.6, 0.6, !alReves)), new THREE.Path(circulo(2, 0.6, 0.6, !alReves))]
  return [f]
}

// 1 · POR AFUERA: «el área negra del logo con filo es igual a la del logo sin filo». En una grilla de 0,01 u, ningún punto del
// negro queda debajo de la banda del filo (el negro con filo = el negro sin filo), y la banda está (su área es la del contorno por
// su ancho). La banda nace en la silueta del logo (el contorno más lo que sale su bisel) y el logo ya no pinta su borde de blanco.
type Banda = (contornos: readonly (readonly THREE.Vector2[])[]) => THREE.BufferGeometry
const ANCHO_ENTERO = FILO.ancho * (1 + FILO.crece)
const tapadoYArea = (formas: readonly THREE.Shape[], banda: Banda): { readonly negroTapado: number; readonly area: number; readonly esperada: number } => {
  const contornos = contornosDelLogo(formas)
  const g = banda(contornos)
  const pos = g.getAttribute('position')
  const idx = g.getIndex()
  const paso = 0.01
  const tapadas = new Set<string>()
  for (let t = 0; idx !== null && t < idx.count; t += 3) {
    const [a, b, c2] = [0, 1, 2].map((k) => new THREE.Vector2(pos.getX(idx.getX(t + k)), pos.getY(idx.getX(t + k))))
    const [x0, x1] = [Math.min(a.x, b.x, c2.x), Math.max(a.x, b.x, c2.x)]
    const [y0, y1] = [Math.min(a.y, b.y, c2.y), Math.max(a.y, b.y, c2.y)]
    const lado = (p: THREE.Vector2, q: THREE.Vector2, r: THREE.Vector2): number => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
    for (let i = Math.ceil(x0 / paso); i * paso <= x1; i += 1) {
      for (let j = Math.ceil(y0 / paso); j * paso <= y1; j += 1) {
        const q = new THREE.Vector2(i * paso, j * paso)
        const [d1, d2, d3] = [lado(a, b, q), lado(b, c2, q), lado(c2, a, q)]
        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) tapadas.add(`${String(i)},${String(j)}`)
      }
    }
  }
  let negroTapado = 0
  for (const k of tapadas) {
    const [i, j] = k.split(',').map(Number)
    if (enElNegro(contornos, i * paso, j * paso)) negroTapado += 1
  }
  const perimetro = contornos.reduce((s2, c3) => s2 + c3.reduce((a2, p2, i) => a2 + p2.distanceTo(c3[(i + 1) % c3.length]), 0), 0)
  return { negroTapado, area: tapadas.size * paso * paso, esperada: perimetro * ANCHO_ENTERO }
}
const filoFuente = sinComentarios(leer('_lib/escena/final/filoConPoder.ts'))
const logoDelFinal = sinComentarios(leer('_lib/escena/final/logoDelFinal.ts'))
const porAfueraBien = (banda: Banda): boolean => [false, true].every((alReves) => {
  const m = tapadoYArea(formaDePrueba(alReves), banda)
  return m.negroTapado === 0 && Math.abs(m.area - m.esperada) / m.esperada < 0.15
}) && FILO.desde === PROBE_EXTRUDE.bevelSize * PROBE_SVG_SCALE && FILO.desde > 0 && filoFuente.includes('bandaDelFilo(contornosDelLogo(formas), FILO.desde, FILO.desde + ANCHO_ENTERO)') &&
  !logoDelFinal.includes('uFiloDelFinal') && !logoDelFinal.includes('anchoDelFilo')
const medidaDelFilo = tapadoYArea(formaDePrueba(false), (c2) => bandaDelFilo(c2, FILO.desde, FILO.desde + ANCHO_ENTERO))
afirmar(porAfueraBien((c2) => bandaDelFilo(c2, FILO.desde, FILO.desde + ANCHO_ENTERO)), '1 · el filo va por AFUERA: el área negra con filo es igual a la de sin filo (ningún punto del negro bajo la banda, con el contorno en los dos sentidos); nace en la silueta (el bisel) y el logo ya no pinta su borde', `negro tapado ${String(medidaDelFilo.negroTapado)} de 0 · banda ${medidaDelFilo.area.toFixed(2)} u² (esperada ${medidaDelFilo.esperada.toFixed(2)})`)
controlPositivo('1 · el detector VE un filo por adentro (el de antes: le come el negro)', ((c2) => bandaDelFilo(c2, -FILO.desde, -FILO.desde - ANCHO_ENTERO)) as Banda, porAfueraBien)

// 2 · SIN EL CÍRCULO LISO: la calma es un margen pegado al hueco, medido con la distancia al logo (un campo exacto, la transformada
// de Felzenszwalb; más allá, la caja con un fundido): al ras quedan los bloques que tocan el filo entero; la luz no se calma
// (llega hasta el borde); la energía, el golpe y las ondas se miden desde el filo (la expansión, desde 0).
const transformadaBien = (d: (dentro: Uint8Array, lado: number) => Float32Array): boolean => {
  const n = 64
  const dentro = Uint8Array.from({ length: n * n }, (_, i) => (Math.hypot((i % n) - 31.5, Math.floor(i / n) - 31.5) <= 10 ? 1 : 0))
  const dist = d(dentro, n)
  let peor = 0
  for (let i = 0; i < n * n; i += 1) {
    const r = Math.hypot((i % n) - 31.5, Math.floor(i / n) - 31.5)
    peor = Math.max(peor, dentro[i] === 1 ? dist[i] : Math.abs(dist[i] - (r - 10)))
  }
  return peor <= 1
}
const manhattan = (dentro: Uint8Array, lado: number): Float32Array => Float32Array.from(dentro, (_, i) => {
  let m = Infinity
  for (let k = 0; k < dentro.length; k += 1) if (dentro[k] === 1) m = Math.min(m, Math.abs((k % lado) - (i % lado)) + Math.abs(Math.floor(k / lado) - Math.floor(i / lado)))
  return m
})
const simE2 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const cuadroE2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const sinCirculoBien = (sim: string, energia: string): boolean => !('radio' in CALMA_EN_EL_PISO) && CALMA_EN_EL_PISO.margen >= FILO.desde + ANCHO_ENTERO &&
  sim.includes('distanciaAlLogo( xz ) ) );') && !/length\( xz \) \) \);/.test(sim.slice(sim.indexOf('float calmaDelFinal('))) &&
  sim.includes('float desde = uCalmaDelFinal > 0.0 ? distanciaAlLogo( xz ) + 1.5 : length( xz - uGolpe.yz );') &&
  sim.includes('azarDeLaLuz( celda + 0.37 ) ) * ( 1.0 - calmaDelFinal( xz ) );') &&
  energia.includes('float r = distanciaAlLogo( xz );') && energia.includes('return min( 1.8, e ) * uEnergiaDeLaLuz;') && energia.includes('float d = ( r - 58.0 * ( 1.0 - pow( 1.0 - t, 2.2 ) ) )') &&
  LUZ_DE_ABAJO.ondas.desde === 0 && cuadroE2.includes('radioDeLaExpansion(expansion, 0)') && radioDeLaExpansion(0, 0) === 0 && HUECO.campo.margen >= 8
afirmar(transformadaBien(distanciaAfuera) && sinCirculoBien(simE2, ENERGIA_EN_LA_SIMULACION_GLSL), '2 · sin el círculo liso: la calma es un margen pegado al hueco (con la distancia al logo, exacta), los bloques que tocan el filo al ras; la luz llega hasta el borde; la energía, el golpe y las ondas nacen en el filo', `al ras hasta ${(0.7072 * 0.8 + CALMA_EN_EL_PISO.margen).toFixed(2)} u del logo · campo de ${String(HUECO.campo.margen)} u alrededor`)
controlPositivo('2 · el detector VE una distancia de a cuadras (no la exacta)', manhattan, transformadaBien)
controlPositivo('2 · y el círculo de antes (la calma medida con el radio)', simE2.replace('distanciaAlLogo( xz ) ) );', 'length( xz ) ) );'), (sim: string) => sinCirculoBien(sim, ENERGIA_EN_LA_SIMULACION_GLSL))
controlPositivo('2 · y la luz que se apaga contra la calma', ENERGIA_EN_LA_SIMULACION_GLSL.replace('return min( 1.8, e ) * uEnergiaDeLaLuz;', 'return min( 1.8, e ) * uEnergiaDeLaLuz * ( 1.0 - calmaDelFinal( xz ) );'), (e: string) => sinCirculoBien(simE2, e))

// 3 · LAS TRES MANERAS (`?filo=`; sin bandera, `corriente`) y EL GOLPE. [PULIDO 7] F1 · ganó la descarga: la corriente, el pulso y
// `?filo=` se borraron con su código (lo nuevo de la descarga lo fija `s58` F1). Lo que queda fijo acá: el filo se enciende entero
// en el cuadro en que `fin` pasa el golpe (el mismo que suena), con un destello que lo ensancha; la descarga corre hacia afuera
// desde el filo por las juntas (en el dibujo y en el plano de abajo), en el producto. Sin partículas. El anillo, el disco y
// `?anillo=`, borrados.
const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS
const pisoE2 = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const planoE2 = sinComentarios(leer('_lib/escena/final/planoDeLaLuz.ts'))
type Luz = typeof luzDelFilo
const manerasBien = (luz: Luz, c: string): boolean => {
  const sinVariantes = !('filo' in ENTORNO.pruebas) && !/corriente|latido|FiloDelLogo/i.test(filoFuente.replace(/corrientes del piso/g, '')) &&
    !('anillo' in ENTORNO.pruebas) && !existsSync(`${V3}/_lib/escena/final/anilloDeLuz.ts`) && !pisoE2.includes('conElAnillo')
  const deGolpe = luz(golpe - 1e-6, golpe) === 0 && luz(golpe, golpe) === 1 && luz(1, golpe) === 1 && c.includes('const luz = luzDelFilo(fin, golpe)') &&
    /if \(!s\.estatico && s\.antes < golpe && fin >= golpe\) \{[\s\S]*?sonar\('golpe'\)/.test(c) && creceDelFilo(0) === FILO.golpe.crece && creceDelFilo(Infinity) === 0
  const descarga = filoFuente.includes('float detras = cabeza - r;') && pisoE2.includes('float descarga = descargaDelFilo( vPiso.xz, uLado );') && planoE2.includes('descargaDelFilo( vXZ, uGrillaDelPiso.y )') &&
    c.includes('F.uDescargaDelFilo.value = s.estatico ? 0 : luz') && !/THREE\.Points|PointsMaterial/.test(filoFuente)
  return sinVariantes && deGolpe && descarga && FILO.blanco >= 0.9 && filoFuente.includes('toneMapped: false')
}
afirmar(manerasBien(luzDelFilo, cuadroE2), '3 · [PULIDO 7] la descarga (la corriente, el pulso y `?filo=`, borrados) corre por las juntas; en el golpe el filo se enciende entero, en el cuadro que suena; `?anillo=` borrado', `descarga hasta ${String(FILO.descarga.alcance)} u`)
controlPositivo('3 · el detector VE un filo que se prende de a poco (no de golpe)', ((fin: number, g: number) => Math.min(1, Math.max(0, (fin - g + 0.05) / 0.05))) as Luz, (l: Luz) => manerasBien(l, cuadroE2))
controlPositivo('3 · y una descarga apagada en el producto', cuadroE2.replace('F.uDescargaDelFilo.value = s.estatico ? 0 : luz', 'F.uDescargaDelFilo.value = 0'), (c2: string) => manerasBien(luzDelFilo, c2))

// 4 · EN EL TELÉFONO Y LA TABLET: el mismo filo (sin rama por ancho) y el campo de distancia a la mitad de resolución (se arma una
// vez); la energía se expande más allá de la pantalla (36 u: la vista del teléfono no pasa de ~20). Medido en las capturas a 390
// y a 820: el logo con su filo entero en el cuadro y la energía hasta los bordes.
const finalDelPie = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const angostoBien = (f: string, filo: string): boolean => f.includes('const distancia = distanciaDelLogo(logo.formas, logo.caja, angosto ? HUECO.campo.lado / 2 : HUECO.campo.lado)') &&
  f.includes('g.add(estado.pozo.grupo, estado.filo.malla, plano)') && !/angosto|compacta/.test(filo) && radioDeLaExpansion(1, 0) >= 30
afirmar(angostoBien(finalDelPie, filoFuente), '4 · en el teléfono y la tablet, el mismo filo y la distancia a media resolución; la energía pasa los bordes de la pantalla')
controlPositivo('4 · el detector VE un filo con rama por ancho', `${filoFuente}\nconst angosto = true`, (x: string) => angostoBien(finalDelPie, x))

void TRANSFORMACION

cerrar('s57-pulido-6')

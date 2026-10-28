/**
 * s78 · B9 (2026-10-22) + C2-31g (2026-10-27) · EL CRISTAL QUE SE AGRIETA, CADA CELDA POR DENTRO, sin navegador. Cada afirmación con su
 * control positivo. Lo que se ve lo mira el orquestador en el navegador; las fotos, la medida en la foto y el costo por cuadro,
 * `scripts-carga/grietas.ts`. Plan y log: `docs/rediseno/SPRINT-B9-NOCTURNO.md` y `docs/rediseno/SPRINT-C2-31-grietas.md`.
 *
 *   1 · los TIEMPOS (los de B9, sin cambios): se forman en 1,5 s, quedan oscuras 1 s y se encienden; al volver, se apagan y se cierran
 *       (también a medio camino); con movimiento reducido, de una;
 *   2 · la BANDERA `?grietas=centro|borde` (centro por defecto) y las VARIANTES 1, 2 y 3 de B9 BORRADAS con su código;
 *   3 · POR CELDA, en la geometría: cada punto del muro sabe dónde está en SU celda (desde el centro de su abanico) y la semilla de su celda;
 *   4 · LA TELARAÑA (el espejo en la CPU del sombreador, sobre las celdas de verdad): cada celda con la suya, sus rayos juntándose en SU
 *       centro, todas a la vez; el SENTIDO según la bandera (del centro al borde, o al revés) y progresiva;
 *   5 · EN EL CUADRO: SIN BRILLO EN EL HOME (la luz en 0 todo el ciclo), con el acento en las páginas; la bandera llega a la uniforme; al
 *       cambiar de página se borran; el pedido de otra página no las toca;
 *   6 · el SOMBREADOR: el trozo va en el vidrio, detrás de una uniforme, con las coordenadas de la celda (sin texturas ni listas);
 *   7 · los ENGANCHES: el título de la página (cuando terminó de entrar) y el del CTA del home (B3), con su firma.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { CRISTAL } from '../escena/cristal/cristal'
import { GRIETAS, GRIETAS_EN_VIVO, avanzarLasGrietas, brillanLasGrietas, dispararLasGrietas, faseDeLasGrietas, grietasAlVolverseElCta, grietasCerradas, origenDeLasGrietas, type EstadoDeLasGrietas, type FaseDeLasGrietas } from '../escena/cristal/grietas'
import { GRIETAS_EN_EL_MAIN, GRIETAS_GLSL, uniformesDeLasGrietas } from '../escena/cristal/grietasDelVidrio'
import { crearLasGrietas } from '../escena/cristal/grietasEnVivo'
import { armarElMuro, celdasDelMuro, rayosDeLaCelda, type Celda } from '../escena/cristal/muro'
import { FRAGMENTOS_DEL_VIDRIO, VERTICES_DEL_VIDRIO, uniformesDelVidrio } from '../escena/cristal/vidrio'
import { COMPOSICION_INICIAL } from '../escena/ruta/pistaDeLaIntro'
import { PRESET_DEL_HOME, apilarElPreset, type PresetDeLaEscena } from '../escena/ruta/preset'
import { CAMERA_FOV, FLOOR_Y, ORBIT_TARGET_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (rel: string): string => readFileSync(path.join(V3, rel), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
type P = readonly [number, number]

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los tiempos: se forman en ~1,5 s, quedan oscuras ~1 s, se encienden; al subir, en reversa; con movimiento reducido, de una')

type Avanzar = (e: EstadoDeLasGrietas, dt: number, reducido: boolean) => void
interface Recorrido {
  readonly formadas: number
  readonly oscurasDesde: number
  readonly encendidaDesde: number
  readonly encendidas: number
  readonly fases: readonly FaseDeLasGrietas[]
  readonly monotona: boolean
}
/** El reloj con pasos `dt` (o los de `pasos`), desde `e`, durante `s` segundos: cuándo terminó cada tramo y las fases en orden. */
function recorrer(avanzar: Avanzar, e: EstadoDeLasGrietas, s: number, pasos: () => number): Recorrido {
  let t = 0
  let formadas = Number.NaN
  let oscurasDesde = Number.NaN
  let encendidaDesde = Number.NaN
  let encendidas = Number.NaN
  const fases: FaseDeLasGrietas[] = [faseDeLasGrietas(e)]
  let monotona = true
  let antes = { f: e.formacion, l: e.luz }
  while (t < s) {
    const dt = pasos()
    avanzar(e, dt, false)
    t += dt
    const f = faseDeLasGrietas(e)
    if (f !== fases[fases.length - 1]) fases.push(f)
    const sube = e.sentido === 'avance'
    if (sube ? e.formacion < antes.f - 1e-12 || e.luz < antes.l - 1e-12 : e.formacion > antes.f + 1e-12 || e.luz > antes.l + 1e-12) monotona = false
    antes = { f: e.formacion, l: e.luz }
    if (Number.isNaN(formadas) && (sube ? e.formacion >= 1 : e.luz <= 0)) formadas = t
    if (Number.isNaN(oscurasDesde) && f === 'oscuras') oscurasDesde = t
    if (Number.isNaN(encendidaDesde) && (sube ? e.luz > 0 : e.formacion < 1)) encendidaDesde = t
    if (Number.isNaN(encendidas) && (sube ? e.luz >= 1 : e.formacion <= 0)) encendidas = t
  }
  return { formadas, oscurasDesde, encendidaDesde, encendidas, fases, monotona }
}
const PASO = 1 / 60
const cerca = (a: number, b: number, tol = PASO + 1e-9): boolean => Math.abs(a - b) <= tol
const ida = (e: EstadoDeLasGrietas): EstadoDeLasGrietas => ({ ...e, sentido: 'avance' })
const T = GRIETAS.tiempos

/** `cuadro`: el más largo de los pasos (cada tiempo se lee al final de un cuadro: a lo sumo uno tarde). */
const tiemposBien = (avanzar: Avanzar, pasos: () => number, cuadro = PASO): boolean => {
  const a = recorrer(avanzar, ida(grietasCerradas()), 5, pasos)
  // Desde el pedido (el sentido ya es `avance`): formándose desde el primer cuadro.
  const fasesIda: readonly FaseDeLasGrietas[] = ['formandose', 'oscuras', 'encendiendose', 'encendidas']
  const tol = cuadro + 1e-9
  return a.monotona && cerca(a.formadas, T.formarseS, tol) && cerca(a.encendidaDesde - a.formadas, T.oscurasS, tol) && cerca(a.encendidas, T.formarseS + T.oscurasS + T.encenderseS, tol) && JSON.stringify(a.fases) === JSON.stringify(fasesIda)
}
const ida60 = recorrer(avanzarLasGrietas, ida(grietasCerradas()), 5, () => PASO)
afirmar(tiemposBien(avanzarLasGrietas, () => PASO), `a 60 Hz: formadas a los ${ida60.formadas.toFixed(3)} s, oscuras hasta ${ida60.encendidaDesde.toFixed(3)} s (${(ida60.encendidaDesde - ida60.formadas).toFixed(3)} s), encendidas a los ${ida60.encendidas.toFixed(3)} s; fases formándose → oscuras → encendiéndose → encendidas, sin volver atrás`)
let semilla = 7
const azarDelPaso = (): number => {
  semilla = (semilla * 16807) % 2147483647
  return 0.008 + ((semilla - 1) / 2147483646) * 0.025
}
afirmar(tiemposBien(avanzarLasGrietas, azarDelPaso, 0.033), '  y con cuadros desparejos (8 a 33 ms): los mismos tiempos, a un cuadro')
controlPositivo('  el detector VE un reloj sin la espera oscura (se encienden apenas se forman)', ((e, dt, r) => {
  avanzarLasGrietas(e, dt, r)
  if (e.formacion >= 1) e.espera = 1
}) as Avanzar, (f: Avanzar) => tiemposBien(f, () => PASO))
controlPositivo('  y uno que se forma de golpe', ((e, dt, r) => {
  if (e.sentido === 'avance') e.formacion = 1
  avanzarLasGrietas(e, dt, r)
}) as Avanzar, (f: Avanzar) => tiemposBien(f, () => PASO))

const encendidasDel = (): EstadoDeLasGrietas => ({ formacion: 1, espera: 1, luz: 1, sentido: 'reversa' })
const reversaBien = (avanzar: Avanzar): boolean => {
  const r = recorrer(avanzar, encendidasDel(), 4, () => PASO)
  return r.monotona && cerca(r.formadas, T.apagarseS) && cerca(r.encendidas, T.apagarseS + T.cerrarseS, 2 * PASO) && JSON.stringify(r.fases) === JSON.stringify(['apagandose', 'cerrandose', 'cerradas'])
}
const rev = recorrer(avanzarLasGrietas, encendidasDel(), 4, () => PASO)
afirmar(reversaBien(avanzarLasGrietas), `la reversa, a la vista: la luz se apaga en ${rev.formadas.toFixed(3)} s y recién después se cierran, cerradas a los ${rev.encendidas.toFixed(3)} s (la formación al revés)`)
controlPositivo('  el detector VE una reversa que corta de golpe', ((e, dt, r) => {
  avanzarLasGrietas(e, dt, r)
  if (e.sentido === 'reversa') {
    e.formacion = 0
    e.luz = 0
  }
}) as Avanzar, reversaBien)

// A medio camino: subiendo a los 0,7 s de formarse, se cierran desde ahí (sin encenderse); bajando otra vez con la luz a medias, no
// vuelven a esperar oscuras.
const aMedio = ida(grietasCerradas())
for (let k = 0; k < 42; k += 1) avanzarLasGrietas(aMedio, PASO, false)
const formadaA = aMedio.formacion
aMedio.sentido = 'reversa'
const r1 = recorrer(avanzarLasGrietas, aMedio, 2, () => PASO)
const conLuzAMedias: EstadoDeLasGrietas = { formacion: 1, espera: 0, luz: 0.4, sentido: 'avance' }
avanzarLasGrietas(conLuzAMedias, PASO, false)
afirmar(cerca(r1.encendidas, formadaA * T.cerrarseS, 2 * PASO) && r1.fases[0] === 'cerrandose' && conLuzAMedias.luz > 0.4, `a medio camino: con ${(formadaA * 100).toFixed(0)} % formadas, al volver se cierran en ${r1.encendidas.toFixed(2)} s sin encenderse; y con la luz a medias, al bajar de nuevo no esperan otra vez`)
controlPositivo('  el detector VE una vuelta a medio camino que primero termina de formarse', { ...r1, fases: ['formandose', ...r1.fases] }, (r: Recorrido) => r.fases[0] === 'cerrandose')

const largo = ida(grietasCerradas())
avanzarLasGrietas(largo, 2, false)
afirmar(cerca(largo.formacion, T.pasoMaximoS / T.formarseS, 1e-9), `un cuadro largo (la escena dormida, la pestaña oculta) avanza a lo sumo ${String(T.pasoMaximoS)} s: no saltan`)
const reducidoBien = (avanzar: Avanzar): boolean => {
  const a = ida(grietasCerradas())
  avanzar(a, 0, true)
  const b = encendidasDel()
  avanzar(b, 0, true)
  return a.formacion === 1 && a.luz === 1 && b.formacion === 0 && b.luz === 0
}
afirmar(reducidoBien(avanzarLasGrietas), 'con movimiento reducido, de una: encendidas en el mismo cuadro del pedido, y cerradas en el de la vuelta')
controlPositivo('  el detector VE un reloj que anima también con movimiento reducido', ((e, dt) => avanzarLasGrietas(e, dt, false)) as Avanzar, reducidoBien)


// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La bandera `?grietas=centro|borde` (centro por defecto); las variantes 1, 2 y 3 de B9, borradas con su código')

const banderaBien = (f: typeof origenDeLasGrietas): boolean => f(null) === 'centro' && f('centro') === 'centro' && f('borde') === 'borde' && ['1', '2', '3', 'no', 'x'].every((v) => f(v) === 'centro')
afirmar(banderaBien(origenDeLasGrietas), '`?grietas=centro|borde`: centro por defecto; los viejos `1`, `2`, `3` y `no` (y cualquier otro valor), el por defecto')
controlPositivo('  el detector VE una bandera que no deja pasar el borde', ((v: string | null) => (v === 'borde' ? 'centro' : origenDeLasGrietas(v))) as typeof origenDeLasGrietas, banderaBien)

const CRISTAL_DIR = '_lib/escena/cristal'
interface Borrado {
  readonly claves: readonly string[]
  readonly archivos: readonly boolean[]
  readonly fuente: string
}
const BORRADO: Borrado = {
  claves: Object.keys(GRIETAS),
  archivos: ['formas.ts', 'trazado.ts'].map((a) => existsSync(path.join(V3, CRISTAL_DIR, a))),
  fuente: ['grietas.ts', 'grietasDelVidrio.ts', 'grietasEnVivo.ts', 'vidrio.ts', 'muro.ts', 'CristalDeLaEscena.tsx'].map((a) => sinComentarios(leer(`${CRISTAL_DIR}/${a}`))).join('\n'),
}
const VIEJO = /telarana\(|fractura|juntas|trazarLasGrietas|empaquetar|ventanaEnElMuro|uGrietasCeldas|uGrietasTramos|uGrietasMarco|uGrietasRejilla|VarianteDeLasGrietas|varianteDeLasGrietas|compacta/
const borradoBien = (b: Borrado): boolean => !b.claves.some((k) => ['variantes', 'fractura', 'juntas', 'rejilla', 'ventanaMaxima', 'tamanoPorElAncho', 'semilla'].includes(k)) && b.archivos.every((x) => !x) && !VIEJO.test(b.fuente)
afirmar(borradoBien(BORRADO), 'las variantes 1, 2 y 3 se borraron con su código muerto: sin `formas.ts` ni `trazado.ts` (las formas, la ventana, la rejilla), sin sus constantes, sin las texturas del sombreador ni la versión compacta')
controlPositivo('  el detector VE una fractura que quedó', { ...BORRADO, fuente: `${BORRADO.fuente}\nfunction fractura() {}` }, borradoBien)
controlPositivo('  y el trazado de vuelta', { ...BORRADO, archivos: [false, true] }, borradoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Por celda, en la geometría: cada punto sabe dónde está en SU celda (desde el centro de su abanico) y la semilla de su celda')

const CELDAS = celdasDelMuro()
const R = CRISTAL.muro.radio
const VUELTA = 2 * Math.PI * R
/** El centro del abanico de una celda (el promedio de sus vértices, como `armarElMuro`). */
function centroDe(c: Celda): P {
  const n = c.poligono.length / 2
  let u = 0
  let v = 0
  for (let k = 0; k < n; k += 1) {
    u += c.poligono[k * 2] / n
    v += c.poligono[k * 2 + 1] / n
  }
  return [u, v]
}
const MURO = armarElMuro(CELDAS)
interface DeLaGeometria {
  readonly pos: ArrayLike<number>
  readonly interior: ArrayLike<number>
  readonly grieta: ArrayLike<number>
}
const GEOMETRIA: DeLaGeometria = { pos: MURO.getAttribute('position').array, interior: MURO.getAttribute('aInterior').array, grieta: MURO.getAttribute('aGrieta').array }
const alrededor = (x: number): number => (((x + VUELTA / 2) % VUELTA) + VUELTA) % VUELTA - VUELTA / 2
function porCeldaBien(g: DeLaGeometria): boolean {
  let vertice = 0
  const semillas = new Set<number>()
  let celdas = 0
  for (const [i, c] of CELDAS.entries()) {
    const n = c.poligono.length / 2
    if (n < 3) continue
    celdas += 1
    const [cu, cv] = centroDe(c)
    for (let k = 0; k < n * 3; k += 1, vertice += 1) {
      const [gx, gy, semilla, rayos] = [g.grieta[vertice * 4], g.grieta[vertice * 4 + 1], g.grieta[vertice * 4 + 2], g.grieta[vertice * 4 + 3]]
      const [x, y, z] = [g.pos[vertice * 3], g.pos[vertice * 3 + 1], g.pos[vertice * 3 + 2]]
      semillas.add(semilla)
      if (semilla !== i || Math.hypot(gx, gy) > 12 || Math.abs(rayos - rayosDeLaCelda(i)) > 1e-6) return false
      if (g.interior[vertice] === 1 && Math.hypot(gx, gy) > 1e-6) return false
      // El punto en el muro desenrollado es el centro de su celda más lo que dice su `aGrieta`.
      if (Math.abs(alrededor(Math.atan2(x, z) * R - (cu + gx))) > 5e-3 || Math.abs(y - FLOOR_Y - (cv + gy)) > 5e-3) return false
    }
  }
  return semillas.size === celdas && vertice * 3 === g.pos.length
}
afirmar(porCeldaBien(GEOMETRIA), `en las ${String(CELDAS.length)} celdas: cada vértice lleva dónde está desde el centro de SU celda (el centro del abanico en 0) y la semilla de su celda (una por celda, todas distintas)`)
/** Una grieta general: las coordenadas del muro entero, no las de la celda. */
const GENERAL_EN_LA_GEOMETRIA: DeLaGeometria = {
  ...GEOMETRIA,
  grieta: Float32Array.from(GEOMETRIA.grieta, (x, k) => {
    const v = Math.floor(k / 4) * 3
    return k % 4 === 0 ? Math.atan2(GEOMETRIA.pos[v], GEOMETRIA.pos[v + 2]) * R : k % 4 === 1 ? GEOMETRIA.pos[v + 1] - FLOOR_Y : x
  }),
}
controlPositivo('  el detector VE una grieta general (las coordenadas del muro entero)', GENERAL_EN_LA_GEOMETRIA, porCeldaBien)
controlPositivo('  y una sola semilla para todas', { ...GEOMETRIA, grieta: Float32Array.from(GEOMETRIA.grieta, (x, k) => (k % 4 === 2 ? 0 : x)) }, porCeldaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La telaraña (el espejo en la CPU del sombreador): cada celda con la suya, todas a la vez; el sentido según la bandera, progresiva')

const TL = GRIETAS.telarana
const DB = GRIETAS.dibujo
const fract = (x: number): number => x - Math.floor(x)
const modulo = (a: number, n: number): number => a - n * Math.floor(a / n)
const entre01 = (x: number): number => Math.min(1, Math.max(0, x))
const suave = (a: number, b: number, x: number): number => {
  const t = entre01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const azar = (a: number, b: number): number => fract(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453)
const alcanceDelRayo = (h: number): number => (fract(h * 31.7) < TL.cortos ? TL.corto[0] + (TL.corto[1] - TL.corto[0]) * fract(h * 57.1) : 2)
const alRayo = (arco: number, r: number, h: number, porPx: number): number => Math.abs(arco - TL.zigzag * suave(0, 0.6, r) * Math.sin(r * TL.zigzagPorU + fract(h * 17.31) * 2 * Math.PI)) / porPx
const banda = (dPx: number, grosor: number, ve: number): number => entre01(DB.bandaPx * grosor + 0.5 - dPx) * ve
/** `lasGrietas` del sombreador, sólo la banda oscura: `d` (u) desde el centro, `s` el camino del centro al borde, `forma` la formación. */
type Oscura = (d: P, s: number, semilla: number, rayos: number, porPx: number, porPxDelCamino: number, forma: number, borde: boolean) => number
const oscuraEnCpu: Oscura = (d, s, semilla, rayos, porPx, porPxS, forma, borde) => {
  // Sin formación no hay grietas (`uGrietas.z` en 0: el sombreador ni entra); detrás del frente, tampoco.
  const camino = borde ? 1 - s : s
  if (forma <= 0 || camino > forma + 3 * porPxS) return 0
  const n = Math.floor(rayos)
  const r = Math.hypot(d[0], d[1])
  const x = fract(Math.atan2(d[1], d[0] + 1e-7) / (2 * Math.PI) - fract(rayos)) * n
  const i = Math.floor(x)
  const corrido = (j: number, h: number): number => j + (h - 0.5) * 2 * TL.desorden
  const [ha, hb] = [azar(semilla, i), azar(semilla, modulo(i + 1, n))]
  let [j0, x0, h0, x1, h1] = [i, corrido(i, ha), ha, corrido(i + 1, hb), hb]
  if (corrido(i, ha) > x) {
    j0 = modulo(i - 1, n)
    h0 = azar(semilla, j0)
    ;[x0, x1, h1] = [corrido(i - 1, h0), corrido(i, ha), ha]
  } else if (corrido(i + 1, hb) <= x) {
    j0 = modulo(i + 1, n)
    h1 = azar(semilla, modulo(i + 2, n))
    ;[x0, h0, x1] = [corrido(i + 1, hb), hb, corrido(i + 2, h1)]
  }
  const alArco = (r * 2 * Math.PI) / n
  const d0 = alRayo((x - x0) * alArco, r, h0, porPx)
  const d1 = alRayo((x - x1) * alArco, r, h1, porPx)
  const r0 = camino <= alcanceDelRayo(h0) ? d0 : 1e9
  const r1 = camino <= alcanceDelRayo(h1) ? d1 : 1e9
  let g = banda(Math.min(r0, r1), GRIETAS.grosor.rayo, entre01((forma - camino) / porPxS + 0.5))
  // El anillo más cercano (los otros están a más de medio espacio).
  const k = TL.anillos.reduce((m, a, q) => (Math.abs(s - a) < Math.abs(s - TL.anillos[m]) ? q : m), 0)
  const hk = azar(semilla + k, j0 + 7)
  const rho = TL.anillos[k] + (hk - 0.5) * 2 * TL.corre
  const nace = borde ? 1 - rho : rho
  if (fract(hk * 7.31) >= TL.falta && forma > nace) {
    const ve = entre01(entre01((forma - nace) / TL.barre) * 0.5 * (d0 + d1) - Math.min(d0, d1) + 0.5)
    g = Math.max(g, banda(Math.abs(s - rho) / porPxS, GRIETAS.grosor.anillo, ve))
  }
  return g
}
/** u por px (a 1440, la franja del muro que se ve mide ~55 u: ~0,04 u por px). */
const PX = 0.04
interface Muestra {
  readonly d: P
  readonly abs: P
  readonly s: number
  readonly porPxS: number
}
/** Puntos de la celda (cada `paso` u) con su camino al borde (el peso del centro en su triángulo del abanico) y cuánto cambia por px. */
function muestrasDe(c: Celda, paso: number): Muestra[] {
  const [cu, cv] = centroDe(c)
  const q = c.poligono
  const n = q.length / 2
  const us = Array.from({ length: n }, (_, k) => q[k * 2])
  const vs = Array.from({ length: n }, (_, k) => q[k * 2 + 1])
  const salida: Muestra[] = []
  for (let u = Math.min(...us); u <= Math.max(...us); u += paso) {
    for (let v = Math.min(...vs); v <= Math.max(...vs); v += paso) {
      for (let k = 0; k < n; k += 1) {
        const a: P = [us[k] - cu, vs[k] - cv]
        const b: P = [us[(k + 1) % n] - cu, vs[(k + 1) % n] - cv]
        const p: P = [u - cu, v - cv]
        const det = a[0] * b[1] - a[1] * b[0]
        const wa = (p[0] * b[1] - p[1] * b[0]) / det
        const wb = (a[0] * p[1] - a[1] * p[0]) / det
        if (wa < 0 || wb < 0 || wa + wb > 1) continue
        const ab: P = [b[0] - a[0], b[1] - a[1]]
        const largo = Math.hypot(ab[0], ab[1])
        const h = Math.abs(det) / largo
        salida.push({ d: p, abs: [u, v], s: wa + wb, porPxS: PX / h })
        break
      }
    }
  }
  return salida
}
const ALGUNAS = CELDAS.map((c, i) => ({ c, i })).filter(({ i }) => i % 6 === 0)
const MUESTRAS = ALGUNAS.map(({ c, i }) => ({ i, puntos: muestrasDe(c, 2 * PX) }))
interface DeLaCelda {
  readonly oscuras: number
  readonly total: number
  readonly enElCentro: number
  readonly centro: number
  readonly sMin: number
  readonly sMax: number
  readonly fuera: number
}
/** Lo de cada celda con la formación `forma`: cuántas muestras oscuras, en el centro (s < 0,12), y las que se pasan del frente. */
function medir(evaluar: (m: Muestra, semilla: number) => number, forma: number, borde: boolean): DeLaCelda[] {
  return MUESTRAS.map(({ i, puntos }) => {
    let oscuras = 0
    let enElCentro = 0
    let centro = 0
    let sMin = 1
    let sMax = 0
    let fuera = 0
    for (const m of puntos) {
      if (m.s < 0.12) centro += 1
      if (evaluar(m, i) < 0.5) continue
      oscuras += 1
      if (m.s < 0.12) enElCentro += 1
      sMin = Math.min(sMin, m.s)
      sMax = Math.max(sMax, m.s)
      if (borde ? m.s < 1 - forma - 2 * m.porPxS : m.s > forma + 2 * m.porPxS) fuera += 1
    }
    return { oscuras, total: puntos.length, enElCentro, centro, sMin, sMax, fuera }
  })
}
const deLaCelda = (forma: number, borde: boolean): ((m: Muestra, semilla: number) => number) => (m, semilla) => oscuraEnCpu(m.d, m.s, semilla, rayosDeLaCelda(semilla), PX, m.porPxS, forma, borde)
/** EL CONTROL: una grieta general (como en el sombreador con `CONTROL=general`): un centro para todo el muro, a la altura de la vista. */
const CENTRO_GENERAL: P = [centroDe(CELDAS[ALGUNAS[2].i])[0], 4]
const general = (forma: number, borde: boolean): ((m: Muestra) => number) => (m) => {
  const d: P = [alrededor(m.abs[0] - CENTRO_GENERAL[0]), m.abs[1] - CENTRO_GENERAL[1]]
  return oscuraEnCpu(d, Math.min(1, Math.hypot(d[0], d[1]) / GRIETAS.general.radio), 0, 9.5, PX, PX / GRIETAS.general.radio, forma, borde)
}
/** La densidad de grieta en el centro de la celda contra la de toda la celda: los rayos de SU telaraña se juntan en SU centro. */
const juntaEnElCentro = (c: DeLaCelda): number => (c.enElCentro / Math.max(1, c.centro)) / Math.max(1e-9, c.oscuras / c.total)
const ENTERAS = medir(deLaCelda(1, false), 1, false)
const MITAD = medir(deLaCelda(0.5, false), 0.5, false)
const porCeldaEnLaTelarana = (enteras: readonly DeLaCelda[], mitad: readonly DeLaCelda[]): boolean =>
  enteras.every((c) => c.oscuras / c.total > 0.05 && c.oscuras / c.total < 0.5) && enteras.filter((c) => juntaEnElCentro(c) >= 1.8).length >= 0.9 * enteras.length && mitad.every((c) => c.oscuras > 0)
const rangoDe = (xs: readonly number[], d = 2): string => `${Math.min(...xs).toFixed(d)} a ${Math.max(...xs).toFixed(d)}`
afirmar(porCeldaEnLaTelarana(ENTERAS, MITAD), `en ${String(ENTERAS.length)} celdas: cada una agrietada (${rangoDe(ENTERAS.map((c) => (100 * c.oscuras) / c.total), 0)} % de su vidrio), con sus rayos juntándose en SU centro (la grieta, ${rangoDe(ENTERAS.map(juntaEnElCentro), 1)} veces más densa ahí que en toda la celda) y todas a la vez (a mitad de la formación, todas ya tienen)`)
const GENERAL_ENTERAS = MUESTRAS.map(({ puntos }) => {
  const evaluar = general(1, false)
  const oscuras = puntos.filter((m) => evaluar(m) >= 0.5)
  return { oscuras: oscuras.length, total: puntos.length, enElCentro: oscuras.filter((m) => m.s < 0.12).length, centro: puntos.filter((m) => m.s < 0.12).length, sMin: 0, sMax: 1, fuera: 0 }
})
controlPositivo(`  el detector VE una grieta general que cruza las celdas (en el centro de cada una, ${rangoDe(GENERAL_ENTERAS.map(juntaEnElCentro), 1)} veces)`, GENERAL_ENTERAS, (g) => porCeldaEnLaTelarana(g, g))

const FORMAS = [0, 0.25, 0.5, 0.75, 1] as const
interface Progreso {
  readonly borde: boolean
  readonly pasos: readonly (readonly DeLaCelda[])[]
}
const progresoDe = (borde: boolean, evaluar: (forma: number) => (m: Muestra, semilla: number) => number): Progreso => ({ borde, pasos: FORMAS.map((f) => medir(evaluar(f), f, borde)) })
const total = (l: readonly DeLaCelda[]): number => l.reduce((s, c) => s + c.oscuras, 0)
const sentidoBien = (p: Progreso): boolean =>
  total(p.pasos[0]) === 0 && p.pasos.every((l, k) => k === 0 || total(l) > total(p.pasos[k - 1])) && p.pasos.every((l) => l.every((c) => c.fuera === 0)) &&
  // En el primer cuarto ya hay grieta en todas, y del lado que corresponde: cerca del centro (centro) o del borde (borde).
  p.pasos[1].every((c) => c.oscuras > 0 && (p.borde ? c.sMin >= 0.7 : c.sMax <= 0.3))
const CENTRO = progresoDe(false, (f) => deLaCelda(f, false))
const BORDE = progresoDe(true, (f) => deLaCelda(f, true))
const cuenta = (p: Progreso): string => p.pasos.map(total).join(' → ')
afirmar(sentidoBien(CENTRO), `\`centro\`: de adentro hacia los bordes de cada celda, progresiva (muestras oscuras en 0, 25, 50, 75 y 100 %: ${cuenta(CENTRO)}); nunca más allá del frente`)
afirmar(sentidoBien(BORDE), `\`borde\`: de los bordes hacia el centro de cada celda, progresiva (${cuenta(BORDE)}); nunca más allá del frente`)
controlPositivo('  el detector VE un borde que arranca del centro (la bandera ignorada)', { ...CENTRO, borde: true }, sentidoBien)
controlPositivo('  y una que se forma de golpe', { ...CENTRO, pasos: CENTRO.pasos.map((l, k) => (k === 0 ? l : CENTRO.pasos[4])) }, sentidoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · En el cuadro: sin brillo en el home (la luz en 0 todo el ciclo), el acento en las páginas; la bandera llega a la uniforme')

const brilloBien = (f: typeof brillanLasGrietas): boolean => f('base', 'web') && !f('home', null) && !f('home', 'web') && !f('base', null)
afirmar(brilloBien(brillanLasGrietas), 'brillan sólo en una página con acento (las de servicio): en el home, nunca')
controlPositivo('  el detector VE el brillo en el home', (() => true) as typeof brillanLasGrietas, brilloBien)

function camaraDe(pose: { readonly angleDeg: number; readonly height: number; readonly distance: number }): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(CAMERA_FOV, 1440 / 900, 0.1, 500)
  const a = (pose.angleDeg * Math.PI) / 180
  cam.position.set(Math.sin(a) * pose.distance, pose.height, Math.cos(a) * pose.distance)
  cam.lookAt(0, ORBIT_TARGET_Y, 0)
  cam.updateMatrixWorld()
  cam.updateProjectionMatrix()
  return cam
}
const CAM = camaraDe(COMPOSICION_INICIAL)
const ACENTO_DE_WEB = new THREE.Color('#8FC0E8')
const leerAcento = (a: string | null): THREE.Color => (a === 'web' ? ACENTO_DE_WEB.clone() : new THREE.Color(1, 1, 1))
const BASE: PresetDeLaEscena = { id: 'base', tramos: { intro: '[data-x]', pie: null }, pista: null, noche: 'noche', acento: 'web', variante: null }
/** Una ventana de mentira para `grietasEnVivo.ts`: la consulta (`?grietas=`) y el defecto de un control del banco. */
interface VentanaDeMentira {
  readonly location: { readonly search: string }
  readonly __defectosDeLasGrietas?: string
}
function conVentana<T>(w: VentanaDeMentira | null, f: () => T): T {
  const g = globalThis as { window?: unknown }
  if (w !== null) g.window = w
  try {
    return f()
  } finally {
    delete g.window
  }
}
type Cuadro = readonly [number, number, number, number]
interface DelCuadro {
  readonly colorPagina: string
  readonly brilloPagina: boolean
  readonly pagina: readonly Cuadro[]
  readonly colorHome: string
  readonly home: readonly Cuadro[]
  readonly faseHome: FaseDeLasGrietas
  readonly borradas: boolean
  readonly ajena: boolean
}
function enElCuadro(w: VentanaDeMentira | null, reducido = false): DelCuadro {
  return conVentana(w, () => {
    const sacar = apilarElPreset(BASE)
    const u = uniformesDeLasGrietas()
    const g = crearLasGrietas(u, leerAcento, reducido)
    const leerUniformes = (): Cuadro => [u.uGrietas.value.x, u.uGrietas.value.y, u.uGrietas.value.z, u.uGrietas.value.w]
    dispararLasGrietas('avance', 'base')
    const pagina: Cuadro[] = []
    for (let k = 0; k < 240; k += 1) {
      g.cuadro(CAM, PASO)
      pagina.push(leerUniformes())
    }
    const colorPagina = u.uGrietasColor.value.getHexString()
    const brilloPagina = g.estado().brillo
    // Un pedido de otra página (el home) no toca las de esta.
    dispararLasGrietas('reversa', 'home')
    g.cuadro(CAM, PASO)
    const ajena = g.estado().fase === 'encendidas'
    // La página cambia (el home): se borran en el acto; en el home, el CTA las pide: sin brillo en todo el ciclo.
    const sacarHome = apilarElPreset(PRESET_DEL_HOME)
    g.cuadro(CAM, PASO)
    const borradas = u.uGrietas.value.z === 0 && g.estado().fase === 'cerradas'
    grietasAlVolverseElCta('ida')
    const home: Cuadro[] = []
    for (let k = 0; k < 300; k += 1) {
      g.cuadro(CAM, PASO)
      home.push(leerUniformes())
    }
    const faseHome = g.estado().fase
    const colorHome = u.uGrietasColor.value.getHexString()
    sacarHome()
    sacar()
    g.soltar()
    return { colorPagina, brilloPagina, pagina, colorHome, home, faseHome, borradas, ajena }
  })
}
const CUADRO = enElCuadro({ location: { search: '' } })
const sinBrilloEnElHome = (c: DelCuadro): boolean => c.faseHome === 'encendidas' && c.home.some((x) => x[0] >= 1) && c.home.every((x) => x[1] === 0) && c.colorHome === '000000'
afirmar(sinBrilloEnElHome(CUADRO), `en el home, sin brillo: el reloj llega a «encendidas» y la luz de la uniforme queda en 0 en los ${String(CUADRO.home.length)} cuadros (color #${CUADRO.colorHome})`)
controlPositivo('  el detector VE el brillo en el home (el defecto del banco `brillo-en-el-home`)', enElCuadro({ location: { search: '' }, __defectosDeLasGrietas: 'brillo-en-el-home' }), sinBrilloEnElHome)
const acentoBien = (c: DelCuadro): boolean => c.colorPagina === ACENTO_DE_WEB.getHexString() && c.brilloPagina && c.pagina.some((x) => x[1] >= 1) && c.borradas && c.ajena
afirmar(acentoBien(CUADRO), `en la página (con acento), la luz con el acento claro (#${CUADRO.colorPagina}); un pedido de otra página no las toca; al cambiar de página se borran en el acto`)
controlPositivo('  el detector VE unas grietas que se quedan al cambiar de página', { ...CUADRO, borradas: false }, acentoBien)
const enCuadros = (c: DelCuadro, i: number): number => c.pagina.findIndex((x) => x[i] >= 1) + 1
const curvaBien = (c: DelCuadro): boolean =>
  c.pagina[0][2] === 1 && Math.abs(enCuadros(c, 0) - 90) <= 1 && c.pagina.slice(0, 148).every((x) => x[1] === 0) && Math.abs(enCuadros(c, 1) - 192) <= 2 && c.pagina.every((x, i) => i === 0 || (x[0] >= c.pagina[i - 1][0] && x[1] >= c.pagina[i - 1][1]))
afirmar(curvaBien(CUADRO), `en las uniformes, a 60 Hz: la formación llega a 1 en el cuadro ${String(enCuadros(CUADRO, 0))} (1,5 s), la luz se queda en 0 hasta el 148 (2,47 s: la espera oscura) y llega a 1 en el ${String(enCuadros(CUADRO, 1))} (3,2 s)`)
controlPositivo('  el detector VE la luz encendida durante la espera', { ...CUADRO, pagina: CUADRO.pagina.map((x, i) => (i === 120 ? ([x[0], 0.2, x[2], x[3]] as const) : x)) }, curvaBien)
const CON_BORDE = enElCuadro({ location: { search: '?grietas=borde' } })
const banderaEnLaUniforme = (centro: DelCuadro, borde: DelCuadro): boolean => [...centro.pagina, ...centro.home].every((x) => x[3] === 0) && [...borde.pagina, ...borde.home].every((x) => x[3] === 1)
afirmar(banderaEnLaUniforme(CUADRO, CON_BORDE), '`?grietas=borde` llega a la uniforme del sombreador (`uGrietas.w` en 1; sin la bandera, en 0), en la página y en el home')
controlPositivo('  el detector VE el borde sin llegar', [CUADRO, CUADRO] as const, ([a, b]) => banderaEnLaUniforme(a, b))
const REDUCIDO = enElCuadro(null, true)
afirmar(REDUCIDO.pagina[0][0] === 1 && REDUCIDO.pagina[0][1] === 1, 'con movimiento reducido (si el cristal está), formadas y encendidas (en la página) desde el primer cuadro')
controlPositivo('  el detector VE las de siempre (animadas)', CUADRO, (c: DelCuadro) => c.pagina[0][0] === 1 && c.pagina[0][1] === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El sombreador: en el material del cristal, detrás de una uniforme, con las coordenadas de la celda (sin texturas ni listas)')

const sombreadorBien = (frag: string, vert: string, uniformes: Record<string, unknown>): boolean => {
  const main = frag.slice(frag.indexOf('void main()'))
  const [antes, conGeneral = ''] = GRIETAS_EN_EL_MAIN.split('if ( uGrietasGeneral.x > 0.5 ) {')
  const despues = conGeneral.slice(conGeneral.indexOf('\n\t\t}') + 4)
  return frag.includes(GRIETAS_GLSL) && main.includes(GRIETAS_EN_EL_MAIN) && main.indexOf(GRIETAS_EN_EL_MAIN) < main.indexOf('gl_FragColor') &&
    /if \( uGrietas\.z > 0\.5 \) \{\s*vec2 dGrieta = vGrieta\.xy;\s*float sGrieta = 1\.0 - vInterior;\s*float semillaGrieta = floor\( vGrieta\.z \+ 0\.5 \);\s*float rayosGrieta = vGrieta\.w;/.test(main) &&
    // Sólo el control del banco mira el muro entero; la telaraña, nunca.
    !antes.includes('vMundo') && !despues.includes('vMundo') && !GRIETAS_GLSL.includes('vMundo') &&
    vert.includes('attribute vec4 aGrieta;') && vert.includes('vGrieta = aGrieta;') && !/sampler2D uGrietas|texelFetch\( uGrietas/.test(frag) &&
    ['uGrietas', 'uGrietasColor', 'uGrietasGeneral'].every((k) => k in uniformes) && !['uGrietasCeldas', 'uGrietasTramos', 'uGrietasMarco', 'uGrietasRejilla'].some((k) => k in uniformes)
}
const VERT = VERTICES_DEL_VIDRIO(CELDAS.length)
afirmar(sombreadorBien(FRAGMENTOS_DEL_VIDRIO, VERT, uniformesDelVidrio()), 'el trozo de las grietas va en el fragmento del vidrio (antes de escribir el color), detrás de `uGrietas.z` (sin grietas, una comparación), con el punto en SU celda (`vGrieta`, de `aGrieta`) y el camino al borde (`vInterior`): sin texturas ni el muro entero')
controlPositivo('  el detector VE el vidrio sin las grietas en el main', FRAGMENTOS_DEL_VIDRIO.replace(GRIETAS_EN_EL_MAIN, ''), (f: string) => sombreadorBien(f, VERT, uniformesDelVidrio()))
controlPositivo('  y una telaraña con las coordenadas del muro entero (la grieta general)', FRAGMENTOS_DEL_VIDRIO.replace('vec2 dGrieta = vGrieta.xy;', 'vec2 dGrieta = vMundo.xy;'), (f: string) => sombreadorBien(f, VERT, uniformesDelVidrio()))
const atributos = Object.keys(MURO.attributes).sort().join(',')
afirmar(atributos === 'aBorde,aCelda,aGrieta,aHondura,aInterior,normal,position' && MURO.getAttribute('position').count === CELDAS.reduce((s, c) => s + (c.poligono.length / 2) * 3, 0), `sin partir la geometría: un muro, un abanico por celda (${atributos})`)
MURO.dispose()

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Los enganches: el título de la página (cuando terminó de entrar) y el CTA del home (B3)')

const titulo3d = sinComentarios(leer('_componentes/titulos3d/TituloDePagina.tsx'))
const enganchado = (t: string): boolean =>
  /useEffect\(\(\) => \{\s*if \(!entrada \|\| \(activo && !listo\)\) return undefined\s*const reloj = window\.setTimeout\(\(\) => dispararLasGrietas\('avance', id\), LLEGADA_DEL_TITULAR_S \* 1000\)\s*return \(\) => window\.clearTimeout\(reloj\)\s*\}, \[activo, entrada, listo, id\]\)/.test(t) && !/dispararLasGrietas\('reversa'/.test(t)
afirmar(enganchado(titulo3d), 'en las páginas: con la entrada abierta y el título armado, al terminar su llegada (el reloj del titular), avance con el id de la página; sin reversa (se quedan)')
controlPositivo('  el detector VE un disparo sin esperar al título', titulo3d.replace('if (!entrada || (activo && !listo)) return undefined', 'if (!entrada) return undefined'), enganchado)
const firma: (sentido: 'ida' | 'vuelta') => void = grietasAlVolverseElCta
const antes = GRIETAS_EN_VIVO.vez
firma('ida')
const trasLaIda = { ...GRIETAS_EN_VIVO }
firma('vuelta')
const ctaBien = (a: typeof trasLaIda, b: typeof trasLaIda): boolean => a.vez === antes + 1 && a.sentido === 'avance' && a.donde === 'home' && b.vez === antes + 2 && b.sentido === 'reversa' && b.donde === 'home'
afirmar(ctaBien(trasLaIda, { ...GRIETAS_EN_VIVO }), 'en el home: `grietasAlVolverseElCta` tiene la firma del enganche de B3 (`ida` | `vuelta`): ida forma, vuelta cierra, sin brillo (el home)')
controlPositivo('  el detector VE una vuelta que no cierra', [trasLaIda, { ...GRIETAS_EN_VIVO, sentido: 'avance' as const }] as const, ([a, b]) => ctaBien(a, b))
const enganches = sinComentarios(leer('_lib/escena/resenas/enganches.ts'))
afirmar(/alVolverseElCta: grietasAlVolverseElCta,/.test(enganches), 'el enganche del CTA del home sigue instalado (`resenas/enganches.ts`)')

const lineas = (t: string): number => sinComentarios(t).split('\n').filter((l) => l.trim() !== '').length
const MODULOS = ['grietas.ts', 'grietasDelVidrio.ts', 'grietasEnVivo.ts', 'vidrio.ts', 'muro.ts', 'CristalDeLaEscena.tsx'].map((a) => [a, lineas(leer(`_lib/escena/cristal/${a}`))] as const)
afirmar(MODULOS.every(([, n]) => n <= 300), `los módulos del cristal, de menos de 300 líneas de código: ${MODULOS.map(([a, n]) => `${a} ${String(n)}`).join(', ')}`)
const sinTres = (t: string): boolean => !/from '(three|@react-three\/[a-z]+)'/.test(t) && !/from '\.\/(grietasEnVivo|grietasDelVidrio|vidrio|muro)'/.test(t)
afirmar(sinTres(leer('_lib/escena/cristal/grietas.ts')), 'el disparador (`grietas.ts`) no importa three ni el lienzo: lo importa el título de una página, que viaja con la página')
controlPositivo('  el detector VE un import de three', `${leer('_lib/escena/cristal/grietas.ts')}\nimport * as THREE from 'three'`, sinTres)

cerrar('s78-b9.invariant')

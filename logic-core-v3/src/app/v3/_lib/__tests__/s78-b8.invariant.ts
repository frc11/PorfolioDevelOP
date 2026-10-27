/**
 * s78 · B8 (2026-10-22) · EL MOIRÉ QUIETO, sin navegador. Cada afirmación con su control positivo. Lo que se ve lo mira el orquestador
 * en el navegador; el costo por cuadro, `scripts-carga/moire.ts`. El plan y el log, en `docs/rediseno/SPRINT-B8-NOCTURNO.md`.
 *
 * [C2-31m] B8 dejó cuatro variantes (`?moire=0|1|2|mouse`); Valentino eligió `mouse` y las otras se borraron con la bandera (lo nuevo,
 * en `s78-c2-31m`). Esta suite afirma lo de B8 que sigue valiendo para la que quedó; el batido de `2` (§6 de antes) se retiró con `2`.
 *
 *   1 · la rendija: una sola capa, la gruesa, en la pared;
 *   2 · la CÁMARA: con dos poses distintas del recorrido, el patrón cae en el mismo lugar de la pared; el de antes (la fina en 38, la
 *       gruesa en 44) no;
 *   3 · el SCROLL: con dos velocidades de scroll (y las dos poses) el corrimiento de la textura es el mismo; el moiré vivo de ESCENA 5
 *       (M2) no;
 *   4 · nadie más mueve la trama: sólo la rendija del mouse escribe un corrimiento, y no lee la cámara, el progreso ni el reloj;
 *   5 · el tope (1°) medido en px a 1440×900 en todo el recorrido, hacia donde va el puntero, y suave;
 *   7 · lo que lee la trama (las estrellas, la fugaz, el amanecer) sigue a lo que se dibuja.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { buildTrack, sampleTrack } from '../escena/choreographySampler'
import type { MutableChoreoPose } from '../escena/choreographyTypes'
import { TRAMA_FILTRADA_GLSL, TRAMA_GLSL } from '../escena/estrellas/cielo'
import { TRAMA_EN_VIVO, leerLaTrama } from '../escena/estrellas/trama'
import type { MoireHandle } from '../escena/MoireScreen'
import { perseguirAlPuntero } from '../escena/modulacionDeLaPose'
import { MOUSE_DEL_MOIRE, corrimientoPorElMouse } from '../escena/moire/fijo'
import { TRAMA_ANCLADA } from '../escena/moire/limite'
import { MOIRE_COARSE_CELLS, MOIRE_FAR_RADIUS, MOIRE_MISMATCH, MOIRE_NEAR_RADIUS, fineCells, verticalPitch } from '../escena/probeMoire'
import { CAMERA_FOV, ORBIT_TARGET_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

type V3 = readonly [number, number, number]
const resta = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const punto = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unitaria = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}
/** La distancia en una vuelta (fases en [0, 1)). */
const enLaVuelta = (a: number, b: number): number => {
  const d = Math.abs((((a - b) % 1) + 1) % 1)
  return Math.min(d, 1 - d)
}

// La cámara del recorrido: el ojo de la pose, mirando al blanco (sin el encuadre, que la gira apenas).
const PISTA = buildTrack(CHOREO_KEYFRAMES)
const ojoEn = (p: number): V3 => {
  const pose: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
  sampleTrack(PISTA, p, pose)
  const a = (pose.angleDeg * Math.PI) / 180
  return [Math.sin(a) * pose.distance, pose.height, Math.cos(a) * pose.distance]
}
const BLANCO: V3 = [0, ORBIT_TARGET_Y, 0]
const [ANCHO, ALTO] = [1440, 900]
const TAN_V = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
const TAN_H = TAN_V * (ANCHO / ALTO)
/** Un punto del mundo en la pantalla (px) de la cámara en `ojo` que mira al blanco. */
function enPantalla(ojo: V3, p: V3): readonly [number, number] {
  const f = unitaria(resta(BLANCO, ojo))
  const r = unitaria(cruz(f, [0, 1, 0]))
  const u = cruz(r, f)
  const v = resta(p, ojo)
  const z = punto(v, f)
  return [ANCHO / 2 + (punto(v, r) / z / TAN_H) * (ANCHO / 2), ALTO / 2 - (punto(v, u) / z / TAN_V) * (ALTO / 2)]
}
/** Dónde sale de un cilindro de `radio` el rayo de `o` en la dirección `d` (el ojo está adentro). */
function salida(o: V3, d: V3, radio: number): V3 {
  const a = d[0] * d[0] + d[2] * d[2]
  const b = o[0] * d[0] + o[2] * d[2]
  const c = o[0] * o[0] + o[2] * o[2] - radio * radio
  const t = (-b + Math.sqrt(b * b - a * c)) / a
  return [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]
}

// ── 1 · la rendija ──────────────────────────────────────────────────────────
titulo('1 · la rendija: una sola capa, la gruesa (la retícula del hero), en la pared')
const PANTALLA = leer('MoireScreen.tsx')
const pantallaBien = (c: string): boolean =>
  /radius: MOIRE_FAR_RADIUS,/.test(c) && /cells: MOIRE_COARSE_CELLS,/.test(c) && (c.match(/name="trama gruesa"/g) ?? []).length === 1 && !/trama fina|createDottedGridCellData|moireMismatch/.test(c) &&
  /if \(!anclada\) return null/.test(c) && !/conDesajusteVivo|moire\/parche/.test(c)
afirmar(pantallaBien(PANTALLA), 'la pantalla monta una sola capa, la gruesa en la pared (44), con su zócalo; sin la fina ni el desajuste que la redefinía')
controlPositivo('el detector VE la pantalla de B8 (la gruesa y la fina, por variante)', PANTALLA.replace('name="trama gruesa"', "name={layer === layers.coarse ? 'trama gruesa' : 'trama fina'}"), pantallaBien)

// ── 2 · la cámara ───────────────────────────────────────────────────────────
titulo('2 · la CÁMARA: con dos poses distintas, el patrón cae en el mismo lugar de la pared')
interface CapaGeometrica { readonly radio: number; readonly celdas: number }
/** Las capas que se dibujan, con su radio y sus celdas por vuelta. */
const LA_RENDIJA: readonly CapaGeometrica[] = [{ radio: MOIRE_FAR_RADIUS, celdas: MOIRE_COARSE_CELLS }]
/**
 * El patrón que se ve en el punto `p` de la pared desde `ojo`: la fase (en celdas, a lo ancho y a lo alto) de cada capa donde el rayo del
 * ojo a `p` la cruza. Con dos capas, también el batido (la fina menos dos veces la gruesa), que es lo que se lee como moiré.
 */
function patron(capasGeo: readonly CapaGeometrica[], ojo: V3, p: V3): number[] {
  const d = unitaria(resta(p, ojo))
  const fases = capasGeo.map((c) => {
    const q = salida(ojo, d, c.radio)
    return [(Math.atan2(q[0], q[2]) / (2 * Math.PI)) * c.celdas, (q[1] - TRAMA_ANCLADA.abajo) / verticalPitch(c.radio, c.celdas)] as const
  })
  const batido = fases.length === 2 ? [fases[1][0] - 2 * fases[0][0], fases[1][1] - 2 * fases[0][1]] : []
  return [...fases.flatMap(([u, v]) => [u, v]), ...batido]
}
const [P_A, P_B] = [0.05, 0.62]
const [OJO_A, OJO_B] = [ojoEn(P_A), ojoEn(P_B)]
const separacion = Math.hypot(...resta(OJO_A, OJO_B))
afirmar(separacion > 8, 'las dos poses son distintas', `el hero (p ${String(P_A)}) y p ${String(P_B)}: los ojos a ${separacion.toFixed(1)} u`)
/** Los puntos de la pared que se comparan: una franja de la pared de la trama, alrededor de todo el cilindro y a varias alturas. */
const PARED: V3[] = []
for (let k = 0; k < 72; k += 1) for (const y of [2, 10, 18, 26]) PARED.push([Math.sin((k / 72) * 2 * Math.PI) * MOIRE_FAR_RADIUS, y, Math.cos((k / 72) * 2 * Math.PI) * MOIRE_FAR_RADIUS])
/** Cuánto se corre el patrón (en celdas o bandas, la peor de todas las fases) de una pose a la otra. */
const corrimientoConLaCamara = (g: readonly CapaGeometrica[]): number => {
  let peor = 0
  for (const p of PARED) {
    const [a, b] = [patron(g, OJO_A, p), patron(g, OJO_B, p)]
    for (let i = 0; i < a.length; i += 1) peor = Math.max(peor, enLaVuelta(a[i], b[i]))
  }
  return peor
}
const quieto = (g: readonly CapaGeometrica[]): boolean => corrimientoConLaCamara(g) < 1e-9
afirmar(quieto(LA_RENDIJA), `la rendija: el mismo patrón en los ${String(PARED.length)} puntos desde las dos poses`, `corre ${corrimientoConLaCamara(LA_RENDIJA).toExponential(1)}`)
const DE_ANTES: readonly CapaGeometrica[] = [...LA_RENDIJA, { radio: MOIRE_NEAR_RADIUS, celdas: fineCells(MOIRE_MISMATCH) }]
controlPositivo(`el detector VE el moiré de antes (la fina en ${String(MOIRE_NEAR_RADIUS)}, la gruesa en ${String(MOIRE_FAR_RADIUS)}): corre ${corrimientoConLaCamara(DE_ANTES).toFixed(2)} de banda con la cámara`, DE_ANTES, quieto)

// ── 3 · el scroll ───────────────────────────────────────────────────────────
titulo('3 · el SCROLL: con dos velocidades de scroll el corrimiento de la textura es el mismo')
/** Lo que corre por cuadro: el progreso del scroll y su velocidad, la pose y el puntero (el mismo en los dos contextos). */
interface Cuadro { readonly progreso: number; readonly velocidad: number; readonly ojo: V3; readonly puntero: readonly [number, number] }
type Paso = (estado: { x: number; y: number; bajada: number }, c: Cuadro, dt: number, textura: { x: number; y: number }) => void
/** El producto: lo que hace `MoireDelMouse` por cuadro. */
const pasoDelProducto: Paso = (estado, c, dt, s) => {
  perseguirAlPuntero(estado, c.puntero[0], c.puntero[1], dt)
  corrimientoPorElMouse(s, estado, MOIRE_COARSE_CELLS)
}
/** Cuatro segundos a 60 Hz: el mismo puntero, con el scroll quieto o rápido y cada uno con su pose. */
const contexto = (rapido: boolean): Cuadro[] =>
  Array.from({ length: 240 }, (_, i) => {
    const t = i / 60
    const velocidad = rapido ? 0.08 * Math.sin(t * 3) : 0
    const progreso = rapido ? 0.3 + 0.08 * (1 - Math.cos(t * 3)) / 3 : 0.3
    return { progreso, velocidad, ojo: rapido ? OJO_B : OJO_A, puntero: [Math.sin(t * 1.3), Math.cos(t * 0.7)] as const }
  })
const correr = (paso: Paso, cuadros: readonly Cuadro[]): number[] => {
  const estado = { x: 0, y: 0, bajada: 0 }
  const s = { x: 0, y: 0 }
  const serie: number[] = []
  for (const c of cuadros) {
    paso(estado, c, 1 / 60, s)
    serie.push(s.x, s.y)
  }
  return serie
}
const [QUIETO, RAPIDO] = [contexto(false), contexto(true)]
const reacciona = (paso: Paso): number => {
  const [a, b] = [correr(paso, QUIETO), correr(paso, RAPIDO)]
  return Math.max(...a.map((x, i) => Math.abs(x - b[i])))
}
afirmar(reacciona(pasoDelProducto) < 1e-12, 'el mismo corrimiento cuadro a cuadro con el scroll quieto y a 0,08 de progreso por segundo (y con la otra pose)', `difiere ${reacciona(pasoDelProducto).toExponential(1)}`)
// El de ESCENA 5 (M1a + M2, de `moire/variantes.ts`, borrado): la gruesa bajaba a base × min(24, 3 + 160 × |velocidad|) celdas por segundo.
const pasoVivo: Paso = (estado, c, dt, s) => {
  estado.bajada += (dt / 18.7) * Math.min(24, 3 + 160 * Math.abs(c.velocidad))
  s.y = estado.bajada % 1
}
controlPositivo(`el detector VE el moiré vivo de ESCENA 5 (M2: el scroll lo acelera): difiere ${reacciona(pasoVivo).toFixed(3)} de celda`, pasoVivo, (p: Paso) => reacciona(p) < 1e-12)

// ── 4 · nadie más mueve la trama ────────────────────────────────────────────
titulo('4 · nadie más mueve la trama: sólo la rendija del mouse, y sin leer la cámara, el progreso ni el reloj')
const fuentes = (dir: string): [string, string][] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e): [string, string][] => {
    const ruta = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === '__tests__' ? [] : fuentes(ruta)
    return /\.tsx?$/.test(e.name) ? [[path.relative(ESCENA, ruta).replace(/\\/g, '/'), sinComentarios(readFileSync(ruta, 'utf8'))]] : []
  })
const ESCRIBE = /\b(moire|moireRef\.current|handle)\.(gruesa|fina|drift)\.offset\b|corrimientoPorElMouse\(/
const quienesEscriben = (lista: readonly (readonly [string, string])[]): string[] => lista.filter(([r, c]) => r !== 'moire/fijo.ts' && ESCRIBE.test(c)).map(([r]) => r)
const FUENTES = fuentes(ESCENA)
afirmar(JSON.stringify(quienesEscriben(FUENTES)) === JSON.stringify(['moire/MoireDelMouse.tsx']), 'sólo `MoireDelMouse` corre una textura de la trama (el rig ya no la hace bajar)', quienesEscriben(FUENTES).join(', '))
controlPositivo('el detector VE la deriva del rig de antes', [...FUENTES, ['OrbitRig.tsx', 'if (moire) moire.drift.offset.y = drift'] as const], (l: readonly (readonly [string, string])[]) => JSON.stringify(quienesEscriben(l)) === JSON.stringify(['moire/MoireDelMouse.tsx']))
const DEL_MOUSE = sinComentarios(leer('moire/MoireDelMouse.tsx'))
const LEE_DE_MAS = /\brig\b|progress|progreso|state\.camera|\.camera\b|clock|elapsed|scrollY|uTiempo/
afirmar(!LEE_DE_MAS.test(DEL_MOUSE) && /punteroDeLaOrbita\(state\.pointer\.x, state\.pointer\.y\)/.test(DEL_MOUSE), 'la rendija del mouse lee sólo el puntero (el de la órbita: ignora los controles fijos)')
controlPositivo('el detector VE el moiré vivo (leía el progreso del rig)', `${DEL_MOUSE}\nconst progreso = rig.current.progress`, (c: string) => !LEE_DE_MAS.test(c))
// [C2-31m] Con movimiento reducido el mouse no la mueve (sólo una entrada de afuera, que alguien prendió a mano: `moire/entrada.ts`).
const reducido = (c: string): boolean => /if \(moire === null \|\| \(quieto && !hayEntradaDeAfuera\(\)\)\) return/.test(c)
afirmar(reducido(DEL_MOUSE), '  con movimiento reducido el mouse no la mueve: la trama queda en cero')
controlPositivo('  el detector VE una rendija que sigue al mouse con movimiento reducido', DEL_MOUSE.replace('(quieto && !hayEntradaDeAfuera())', 'false'), reducido)
const RIG = sinComentarios(leer('OrbitRig.tsx'))
afirmar(!/MOIRE_DRIFT_PERIOD_S|moireRef/.test(RIG), 'el rig no conoce más la trama (ni su deriva ni su referencia)')
afirmar(['moire/variantes.ts', 'moire/parche.ts', 'moire/MoireVivo.tsx'].every((a) => !existsSync(path.join(ESCENA, a))), 'el moiré vivo (M1a a M4) no tiene código')

// ── 5 · el tope y la suavidad ───────────────────────────────────────────────
titulo(`5 · el tope (${String(MOUSE_DEL_MOIRE.topeGrados)}° de vuelta) en px a ${String(ANCHO)}×${String(ALTO)}, hacia donde va el puntero, y suave`)
/** Para cada pose del recorrido: cuánto se mueve en pantalla el punto de la pared que está en el centro, con el puntero en un borde. */
const medidas: { readonly p: number; readonly x: number; readonly y: number; readonly celda: number }[] = []
let malSentido = 0
for (let p = 0; p <= 1.0001; p += 0.01) {
  const ojo = ojoEn(p)
  const centro = salida(ojo, unitaria(resta(BLANCO, ojo)), MOIRE_FAR_RADIUS)
  const enPx = enPantalla(ojo, centro)
  // Con el puntero en el borde derecho y arriba: el corrimiento de la textura y adónde lleva un rasgo de la trama que estaba en el centro.
  const off = { x: 0, y: 0 }
  corrimientoPorElMouse(off, { x: 1, y: 1 }, MOIRE_COARSE_CELLS)
  const theta = Math.atan2(centro[0], centro[2]) - (2 * Math.PI * off.x) / MOIRE_COARSE_CELLS
  const corrido: V3 = [Math.sin(theta) * MOIRE_FAR_RADIUS, centro[1] - off.y * verticalPitch(MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS), Math.cos(theta) * MOIRE_FAR_RADIUS]
  const [cx, cy] = enPantalla(ojo, corrido)
  const celda = Math.hypot(...enPantalla(ojo, [Math.sin(Math.atan2(centro[0], centro[2]) + (2 * Math.PI) / MOIRE_COARSE_CELLS) * MOIRE_FAR_RADIUS, centro[1], Math.cos(Math.atan2(centro[0], centro[2]) + (2 * Math.PI) / MOIRE_COARSE_CELLS) * MOIRE_FAR_RADIUS]).map((q, i) => q - enPx[i]))
  if (!(cx > enPx[0] && cy < enPx[1])) malSentido += 1
  medidas.push({ p, x: Math.abs(cx - enPx[0]), y: Math.abs(cy - enPx[1]), celda })
}
const [xMin, xMax] = [Math.min(...medidas.map((m) => m.x)), Math.max(...medidas.map((m) => m.x))]
const [yMin, yMax] = [Math.min(...medidas.map((m) => m.y)), Math.max(...medidas.map((m) => m.y))]
const fraccion = Math.max(...medidas.map((m) => m.x / m.celda))
afirmar(malSentido === 0, 'con el puntero a la derecha y arriba, la rendija se corre a la derecha y arriba en la pantalla (sigue al puntero)', `${String(medidas.length)} poses`)
afirmar(xMax <= 30 && yMax <= 30 && xMin >= 8, 'el tope es chico: a lo sumo 30 px y al menos 8 (que se note) en todo el recorrido', `a lo ancho ${xMin.toFixed(1)} a ${xMax.toFixed(1)} px; a lo alto ${yMin.toFixed(1)} a ${yMax.toFixed(1)} px`)
afirmar(fraccion < 0.2, '  y es una fracción chica de la celda de la trama (no la confunde con la de al lado)', `a lo sumo ${(fraccion * 100).toFixed(1)} % de la celda en pantalla`)
// Suave: el amortiguador del puntero (MOUSE_TAU), de golpe de 0 al borde.
const sigue = { x: 0, y: 0 }
const offs: number[] = []
const s5 = { x: 0, y: 0 }
for (let i = 0; i < 180; i += 1) {
  perseguirAlPuntero(sigue, 1, 0, 1 / 60)
  corrimientoPorElMouse(s5, sigue, MOIRE_COARSE_CELLS)
  offs.push(s5.x)
}
const tope = (MOUSE_DEL_MOIRE.topeGrados / 360) * MOIRE_COARSE_CELLS
const pasoMax = Math.max(...offs.map((o, i) => (i === 0 ? o : o - offs[i - 1]))) / tope
const llega = offs.findIndex((o) => o >= 0.95 * tope) / 60
const suave = (pm: number): boolean => pm < 0.05
afirmar(suave(pasoMax) && llega > 0.8 && llega < 2 && Math.abs(offs[offs.length - 1] - tope) < 0.01 * tope, 'suave: con el puntero de golpe al borde, a lo sumo 5 % del tope por cuadro a 60 Hz, y llega al 95 % en ~1,3 s', `${(pasoMax * 100).toFixed(1)} % por cuadro; 95 % a los ${llega.toFixed(2)} s`)
controlPositivo('el detector VE una rendija sin amortiguar (salta al tope en un cuadro)', 1, suave)
corrimientoPorElMouse(s5, { x: 3, y: -7 }, MOIRE_COARSE_CELLS)
afirmar(Math.abs(s5.x - tope) < 1e-12 && Math.abs(s5.y - tope) < 1e-12, '  y con tope: un puntero fuera de la ventana no la lleva más lejos')

// ── 7 · lo que lee la trama ─────────────────────────────────────────────────
titulo('7 · lo que lee la trama (estrellas, fugaz, amanecer) sigue a lo que se dibuja')
const mango = (dibuja: boolean): MoireHandle => ({ gruesa: new THREE.Texture(), dibuja, radio: MOIRE_FAR_RADIUS, banda: [0, 40, 0.2, 0.2] })
const leido = (m: MoireHandle | null): string => {
  leerLaTrama(m)
  const u = TRAMA_EN_VIVO
  return `${String(u.uHayTrama.value)}|${u.uCapasDeLaTrama.value.toArray().join(',')}|${String(u.uRadiosDeLaTrama.value.y)}`
}
const sigueALaRendija = (m: MoireHandle): boolean => leido(m) === `1|0,1|${String(MOIRE_FAR_RADIUS)}`
afirmar(sigueALaRendija(mango(true)), 'sólo la gruesa tapa, desde la pared (la fina no existe: su lugar en el shader queda apagado)')
controlPositivo('  el detector VE una trama apagada leída como si tapara', mango(false), sigueALaRendija)
afirmar(leido(mango(false)).startsWith('0|') && leido(null).startsWith('0|'), '`fondo=cristal` (la capa no se dibuja) o sin trama: nada tapa')
const gateada = (g: string): boolean => (g.match(/if \( uCapasDeLaTrama\.x > 0\.5 && uv\.y >= 0\.0/g) ?? []).length === 1 && (g.match(/if \( uCapasDeLaTrama\.y > 0\.5 && uv\.y >= 0\.0/g) ?? []).length === 1 && !/uMezclaB|uRepeticionB|uCorrimientoB/.test(g)
afirmar(gateada(TRAMA_GLSL) && gateada(TRAMA_FILTRADA_GLSL), 'el shader compartido (y su versión prefiltrada, la del piso) salta la capa que no se dibuja, y no lee más el desajuste de M4')
controlPositivo('el detector VE la cuenta de antes (las dos capas siempre)', TRAMA_GLSL.replace(/uCapasDeLaTrama\.x > 0\.5 && /g, ''), gateada)

cerrar('s78-b8')

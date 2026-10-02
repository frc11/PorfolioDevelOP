/**
 * RETOQUE 3D · LOS SONIDOS DEL SITIO, generados: npx tsx scripts-retoque/sonidos.ts
 *
 * La versión de este sprint de `scripts-3d-sonido/t2-sonidos.ts` (que queda como historia: escribía el sprite de antes).
 * Síntesis propia, renderizada fuera de línea (lo mismo que un `OfflineAudioContext`, pero en Node: sin navegador y
 * determinista): osciladores, ruido con semilla, filtros de dos polos (el «Audio EQ Cookbook» de R. Bristow-Johnson),
 * envolventes, un retardo y una reverb de Schroeder. Nada descargado: cada sonido es obra de este archivo, con la
 * licencia CC0 (`docs/rediseno/SONIDO.md`).
 *
 * Escribe:
 *   · UN sprite mono (`public/v3/sonido/sonidos.{webm,m4a}`): tic, clic, pestillo, abre, cierra, pulso, encendido y foto.
 *     [CIERRE RETOQUE 3D] S1 · el clic de la barra y el de los CTA son el pestillo (era el candidato `barra-d`); los otros
 *     siete candidatos se borraron. S2 · los ambientes ya no son archivos: el ambiente es generativo, en el navegador
 *     (`src/app/v3/_lib/sonido/ambienteGenerativo.ts`); los bucles de antes se borraron (código y archivos).
 *   · Los cortes (`src/app/v3/_lib/sonido/sprite.ts`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

import { FALLA_S, FIRME, GUION_S, guionEn } from '../src/app/v3/_lib/escena/entorno/encendido'

const SR = 48000
const RAIZ = process.cwd()

// ── Herramientas (las de t2-sonidos.ts) ─────────────────────────────────────

const muestras = (s: number): number => Math.round(s * SR)

function ruido(n: number, semilla: number): Float32Array {
  let a = semilla >>> 0
  const r = new Float32Array(n)
  for (let i = 0; i < n; i += 1) {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    r[i] = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1
  }
  return r
}

function rosa(blanco: Float32Array): Float32Array {
  const r = new Float32Array(blanco.length)
  let [b0, b1, b2] = [0, 0, 0]
  for (let i = 0; i < blanco.length; i += 1) {
    const w = blanco[i]
    b0 = 0.99765 * b0 + w * 0.099046
    b1 = 0.963 * b1 + w * 0.2965164
    b2 = 0.57 * b2 + w * 1.0526913
    r[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2
  }
  return r
}

type Tipo = 'pasabajos' | 'pasaaltos' | 'pasabanda'

function filtrar(x: Float32Array, tipo: Tipo, frecuencia: (i: number) => number, q: number): Float32Array {
  const y = new Float32Array(x.length)
  let [b0, b1, b2, a1, a2] = [0, 0, 0, 0, 0]
  let [x1, x2, y1, y2] = [0, 0, 0, 0]
  for (let i = 0; i < x.length; i += 1) {
    if (i % 16 === 0) {
      const f = Math.min(SR * 0.45, Math.max(10, frecuencia(i)))
      const w = (2 * Math.PI * f) / SR
      const [c, s] = [Math.cos(w), Math.sin(w)]
      const alfa = s / (2 * q)
      const a0 = 1 + alfa
      if (tipo === 'pasabajos') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2]
      else if (tipo === 'pasaaltos') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
      else [b0, b1, b2] = [alfa, 0, -alfa]
      ;[b0, b1, b2, a1, a2] = [b0 / a0, b1 / a0, b2 / a0, (-2 * c) / a0, (1 - alfa) / a0]
    }
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
    ;[x2, x1, y2, y1] = [x1, x[i], y1, v]
    y[i] = v
  }
  return y
}

function seno(n: number, frecuencia: (t: number) => number, fase = 0): Float32Array {
  const r = new Float32Array(n)
  let ph = fase
  for (let i = 0; i < n; i += 1) {
    r[i] = Math.sin(ph)
    ph += (2 * Math.PI * frecuencia(i / SR)) / SR
  }
  return r
}

function por(x: Float32Array, env: (t: number) => number): Float32Array {
  const r = new Float32Array(x.length)
  for (let i = 0; i < x.length; i += 1) r[i] = x[i] * env(i / SR)
  return r
}

function sumar(...partes: readonly (readonly [Float32Array, number])[]): Float32Array {
  const n = Math.max(...partes.map(([p]) => p.length))
  const r = new Float32Array(n)
  for (const [p, g] of partes) for (let i = 0; i < p.length; i += 1) r[i] += p[i] * g
  return r
}

function pico(x: Float32Array, db: number): Float32Array {
  let m = 0
  for (const v of x) m = Math.max(m, Math.abs(v))
  const g = m === 0 ? 0 : 10 ** (db / 20) / m
  return x.map((v) => v * g)
}

function bordes(x: Float32Array, entraS: number, saleS: number): Float32Array {
  const [a, b] = [muestras(entraS), muestras(saleS)]
  return x.map((v, i) => v * Math.min(1, a === 0 ? 1 : i / a, b === 0 ? 1 : (x.length - 1 - i) / b))
}

const exp = (t: number, tau: number): number => Math.exp(-t / tau)
const suave = (u: number): number => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u))

// ── Los que quedan (los de t2-sonidos.ts, tal cual) ─────────────────────────

function tic(): Float32Array {
  const n = muestras(0.06)
  const tono = por(seno(n, () => 3100), (t) => exp(t, 0.006))
  const golpe = por(filtrar(ruido(n, 11), 'pasaaltos', () => 2500, 0.7), (t) => exp(t, 0.0015))
  return bordes(pico(sumar([tono, 0.6], [golpe, 0.5]), -6), 0.0005, 0.01)
}

function clic(): Float32Array {
  const n = muestras(0.1)
  const tono = por(seno(n, (t) => 700 + 700 * exp(t, 0.012)), (t) => (1 - exp(t, 0.0008)) * exp(t, 0.018))
  const golpe = por(filtrar(ruido(n, 23), 'pasabanda', () => 2400, 1.1), (t) => exp(t, 0.003))
  return bordes(pico(sumar([tono, 0.8], [golpe, 0.45]), -3), 0.0005, 0.015)
}

const MS_DEL_GENIE = 560

function genie(abre: boolean): Float32Array {
  const d = MS_DEL_GENIE / 1000
  const n = muestras(d + 0.16)
  const u = (t: number): number => suave(t / d)
  const barrido = (t: number): number => (abre ? 350 * (2600 / 350) ** u(t) : 2600 * (350 / 2600) ** u(t))
  const env = (t: number): number => (t < 0.09 ? suave(t / 0.09) : 1) * (t < d ? 1 - 0.55 * u(t) ** 2 : 0.45 * exp(t - d, 0.05))
  const aire = por(filtrar(rosa(ruido(n, abre ? 31 : 37)), 'pasabanda', (i) => barrido(i / SR), 1.3), env)
  const cuerpo = por(seno(n, (t) => (abre ? 220 + 220 * u(t) : 440 - 220 * u(t))), (t) => 0.5 * env(t))
  const apoyo = abre ? new Float32Array(n) : por(seno(n, () => 120), (t) => (t < d ? 0 : (1 - exp(t - d, 0.002)) * exp(t - d, 0.05)))
  return bordes(pico(sumar([aire, 1], [cuerpo, 0.25], [apoyo, 0.5]), -4), 0.002, 0.03)
}

function pulso(): Float32Array {
  const n = muestras(0.9)
  const f = (t: number): number => 44 + 34 * exp(t, 0.05)
  const grave = por(seno(n, f), (t) => (1 - exp(t, 0.006)) * exp(t, 0.22))
  const arm = por(seno(n, (t) => 2.5 * f(t)), (t) => (1 - exp(t, 0.006)) * exp(t, 0.12))
  return bordes(pico(filtrar(sumar([grave, 1], [arm, 0.35]), 'pasabajos', () => 260, 0.7), -3), 0.002, 0.08)
}

function encendido(): Float32Array {
  const cola = 1.6
  const total = GUION_S + cola
  const n = muestras(total)
  const k = (t: number): number => (t < GUION_S ? guionEn(t) / FIRME : 1)
  const nivel = new Float32Array(n)
  let v = 0
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    v += (k(t) - v) * (1 - Math.exp(-1 / (SR * 0.002)))
    nivel[i] = v * (t > GUION_S ? exp(t - GUION_S, cola / 4) : 1)
  }
  const zumbido = sumar([seno(n, () => 100), 1], [seno(n, () => 200), 0.55], [seno(n, () => 300), 0.3], [seno(n, () => 400), 0.18])
  const bzz = filtrar(zumbido.map((x) => Math.tanh(3 * x)), 'pasabanda', () => 900, 0.8)
  const crudo = new Float32Array(n)
  for (let i = 0; i < n; i += 1) crudo[i] = (zumbido[i] * 0.6 + bzz[i] * 0.5) * nivel[i]
  const chispas = new Float32Array(n)
  const blanco = ruido(n, 47)
  for (const desde of [0.1, 0.36, 0.92, 1.58]) {
    const i0 = muestras(desde)
    for (let i = i0; i < Math.min(n, i0 + muestras(0.05)); i += 1) chispas[i] = blanco[i] * exp((i - i0) / SR, 0.008)
  }
  const chisporroteo = filtrar(chispas, 'pasaaltos', () => 1800, 0.7)
  const g0 = FALLA_S
  const golpeGrave = por(seno(n, (t) => (t < g0 ? 65 : 42 + 26 * exp(t - g0, 0.06))), (t) => (t < g0 ? 0 : (1 - exp(t - g0, 0.003)) * exp(t - g0, 0.2)))
  const golpeRuido = por(filtrar(ruido(n, 53), 'pasabajos', () => 900, 0.7), (t) => (t < g0 ? 0 : exp(t - g0, 0.035)))
  return bordes(pico(sumar([crudo, 0.55], [chisporroteo, 0.35], [golpeGrave, 1], [golpeRuido, 0.5]), -3), 0.002, 0.2)
}

function foto(): Float32Array {
  const n = muestras(0.17)
  const granos = ruido(n, 83)
  const grano = new Float32Array(n)
  for (let i = 0; i < n; i += 1) grano[i] = 0.6 + 0.4 * Math.sin((i / SR) * 2 * Math.PI * 34 + granos[i] * 0.8)
  const roce = filtrar(filtrar(ruido(n, 89), 'pasaaltos', () => 2600, 0.7), 'pasabanda', () => 5200, 0.9)
  return bordes(pico(por(roce, (t) => (t < 0.018 ? suave(t / 0.018) : exp(t - 0.018, 0.045)) * grano[Math.min(n - 1, muestras(t))]), -6), 0.001, 0.02)
}

// ── [CIERRE RETOQUE 3D] S1 · El pestillo: el clic de la barra y de los CTA (era el candidato `barra-d`) ───

/** Pestillo: dos golpes mecánicos a 18 ms, el segundo más grave (un cerrojo que encaja). */
function pestillo(): Float32Array {
  const n = muestras(0.08)
  const golpe = (desde: number, f: number, semilla: number): Float32Array =>
    por(filtrar(ruido(n, semilla), 'pasabanda', () => f, 2.4), (t) => (t < desde ? 0 : exp(t - desde, 0.004)))
  const cuerpo = por(seno(n, () => 190), (t) => (t < 0.018 ? 0 : (1 - exp(t - 0.018, 0.0008)) * exp(t - 0.018, 0.015)))
  return bordes(pico(sumar([golpe(0, 3400, 211), 0.8], [golpe(0.018, 1700, 223), 1], [cuerpo, 0.4]), -4), 0.0003, 0.015)
}

// ── Los archivos ────────────────────────────────────────────────────────────

const HUECO_S = 0.3

function wav(canales: readonly Float32Array[]): Buffer {
  const n = canales[0].length
  const c = canales.length
  const datos = Buffer.alloc(44 + n * 2 * c)
  datos.write('RIFF', 0, 'latin1')
  datos.writeUInt32LE(36 + n * 2 * c, 4)
  datos.write('WAVEfmt ', 8, 'latin1')
  datos.writeUInt32LE(16, 16)
  datos.writeUInt16LE(1, 20)
  datos.writeUInt16LE(c, 22)
  datos.writeUInt32LE(SR, 24)
  datos.writeUInt32LE(SR * 2 * c, 28)
  datos.writeUInt16LE(2 * c, 32)
  datos.writeUInt16LE(16, 34)
  datos.write('data', 36, 'latin1')
  datos.writeUInt32LE(n * 2 * c, 40)
  for (let i = 0; i < n; i += 1) for (let k = 0; k < c; k += 1) datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, canales[k][i])) * 32767), 44 + (i * c + k) * 2)
  return datos
}

function codificar(datos: Buffer, nombre: string, kbpsOpus: number, kbpsAac: number, tmp: string): { readonly webm: number; readonly m4a: number } {
  const dir = `${RAIZ}/public/v3/sonido`
  mkdirSync(dir, { recursive: true })
  const crudo = `${tmp}/${nombre}.wav`
  writeFileSync(crudo, datos)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', crudo, '-c:a', 'libopus', '-b:a', `${String(kbpsOpus)}k`, `${dir}/${nombre}.webm`])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', crudo, '-c:a', 'aac', '-b:a', `${String(kbpsAac)}k`, '-movflags', '+faststart', `${dir}/${nombre}.m4a`])
  if (process.env.WAV_DE_CONTROL !== undefined) writeFileSync(`${process.env.WAV_DE_CONTROL}-${nombre}.wav`, datos)
  return { webm: statSync(`${dir}/${nombre}.webm`).size, m4a: statSync(`${dir}/${nombre}.m4a`).size }
}

function principal(): void {
  const tmp = `${tmpdir()}/sonidos-retoque-${String(process.pid)}`
  mkdirSync(tmp, { recursive: true })

  // El sprite.
  const sonidos: readonly (readonly [string, Float32Array])[] = [
    ['tic', tic()],
    ['clic', clic()],
    ['abre', genie(true)],
    ['cierra', genie(false)],
    ['pulso', pulso()],
    ['encendido', encendido()],
    ['foto', foto()],
    ['pestillo', pestillo()],
  ]
  const trozos: Float32Array[] = []
  const cortes: Record<string, readonly [number, number]> = {}
  let pos = muestras(HUECO_S)
  trozos.push(new Float32Array(pos))
  for (const [nombre, x] of sonidos) {
    trozos.push(x)
    cortes[nombre] = [Math.round((pos / SR) * 1000), Math.round((x.length / SR) * 1000) + 40]
    pos += x.length
    const h = muestras(HUECO_S)
    trozos.push(new Float32Array(h))
    pos += h
  }
  const todo = new Float32Array(pos)
  let k = 0
  for (const t of trozos) {
    todo.set(t, k)
    k += t.length
  }
  const pesoDelSprite = codificar(wav([todo]), 'sonidos', 32, 40, tmp)

  rmSync(tmp, { recursive: true, force: true })

  const kb = (b: number): string => String(Math.round(b / 1024))
  const ts = `/**
 * [RETOQUE 3D] LOS CORTES DEL SONIDO — generado por \`scripts-retoque/sonidos.ts\` (no se edita a mano).
 *
 *   · El sprite (\`public/v3/sonido/sonidos.{webm,m4a}\`): dónde empieza cada sonido y cuánto dura (ms). ${(todo.length / SR).toFixed(1)} s en total;
 *     ${kb(pesoDelSprite.webm)} KB en Opus y ${kb(pesoDelSprite.m4a)} KB en AAC. [CIERRE RETOQUE 3D] El ambiente no tiene
 *     archivo: es generativo (\`ambienteGenerativo.ts\`).
 */
export const CORTES_DEL_SPRITE = {
${Object.entries(cortes).map(([nombre, [desde, dura]]) => `  '${nombre}': [${String(desde)}, ${String(dura)}],`).join('\n')}
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE
`
  writeFileSync(`${RAIZ}/src/app/v3/_lib/sonido/sprite.ts`, ts)
  console.log(JSON.stringify({ sprite: { segundos: +(todo.length / SR).toFixed(2), peso: pesoDelSprite } }))
}

principal()

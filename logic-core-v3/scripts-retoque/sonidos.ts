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
 *   · UN sprite mono (`public/v3/sonido/sonidos.{webm,m4a}`): los que quedan (tic, clic, abre, cierra, pulso, encendido,
 *     foto) y los candidatos nuevos del clic de la barra (`barra-a` a `barra-d`) y del clic de los CTA (`cta-a` a `cta-d`).
 *     Se fueron el túnel, el amanecer y los dos ambientes.
 *   · TRES ambientes, uno por archivo y en estéreo (`public/v3/sonido/ambiente-{a,b,c}.{webm,m4a}`): un bucle tecnológico
 *     y melódico de 24 s cada uno. Empalman sin corte: cada nota y cada cola (el retardo, la reverb) se arman en un búfer
 *     más largo y lo que pasa del final se suma al principio (lo que una vuelta le deja a la siguiente); el filtro que
 *     barre lo hace con el período del bucle. En el archivo van con un colchón (su final antes y su principio después),
 *     así el relleno del decodificador cae adentro de lo mismo y el bucle se toca entre sus cortes.
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
const nota = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)

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

// ── Los candidatos del clic de la barra: cuatro, distintos de todo lo que hay ─

/** a · Tecla de madera: un golpe de ruido en una banda media con un cuerpo grave, seco. */
function barraA(): Float32Array {
  const n = muestras(0.09)
  const madera = por(filtrar(ruido(n, 201), 'pasabanda', () => 1250, 3.2), (t) => exp(t, 0.012))
  const cuerpo = por(seno(n, (t) => 310 + 80 * exp(t, 0.01)), (t) => (1 - exp(t, 0.0006)) * exp(t, 0.022))
  return bordes(pico(sumar([madera, 1], [cuerpo, 0.55]), -4), 0.0004, 0.02)
}

/** b · Burbuja: un «blup» que sube (seno de 520 a 1150 Hz en 45 ms), redondo y corto. */
function barraB(): Float32Array {
  const n = muestras(0.11)
  const sube = (t: number): number => 520 + 630 * suave(t / 0.045)
  const blup = por(seno(n, sube), (t) => suave(t / 0.004) * exp(t, 0.03))
  const arm = por(seno(n, (t) => 2 * sube(t)), (t) => 0.2 * suave(t / 0.004) * exp(t, 0.015))
  return bordes(pico(sumar([blup, 1], [arm, 1]), -5), 0.0005, 0.02)
}

/** c · Cristal: una campanita de FM (portadora de 1.760 Hz, moduladora ×1,41), muy corta. */
function barraC(): Float32Array {
  const n = muestras(0.16)
  const r = new Float32Array(n)
  let [pc, pm] = [0, 0]
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    const indice = 2.2 * exp(t, 0.02)
    r[i] = Math.sin(pc + indice * Math.sin(pm)) * suave(t / 0.002) * exp(t, 0.045)
    pc += (2 * Math.PI * 1760) / SR
    pm += (2 * Math.PI * 1760 * 1.41) / SR
  }
  return bordes(pico(r, -7), 0.0004, 0.03)
}

/** d · Pestillo: dos golpes mecánicos a 18 ms, el segundo más grave (un cerrojo que encaja). */
function barraD(): Float32Array {
  const n = muestras(0.08)
  const golpe = (desde: number, f: number, semilla: number): Float32Array =>
    por(filtrar(ruido(n, semilla), 'pasabanda', () => f, 2.4), (t) => (t < desde ? 0 : exp(t - desde, 0.004)))
  const cuerpo = por(seno(n, () => 190), (t) => (t < 0.018 ? 0 : (1 - exp(t - 0.018, 0.0008)) * exp(t - 0.018, 0.015)))
  return bordes(pico(sumar([golpe(0, 3400, 211), 0.8], [golpe(0.018, 1700, 223), 1], [cuerpo, 0.4]), -4), 0.0003, 0.015)
}

// ── Los candidatos del clic de los CTA: cuatro, distintos del clic de siempre ──

/** a · Confirmación: dos notas que suben (mi y si), un pellizco suave cada una. */
function ctaA(): Float32Array {
  const n = muestras(0.28)
  const pellizco = (f: number, desde: number): Float32Array =>
    por(sumar([seno(n, () => f), 1], [seno(n, () => 2 * f), 0.25], [seno(n, () => 3 * f), 0.08]), (t) => (t < desde ? 0 : suave((t - desde) / 0.003) * exp(t - desde, 0.06)))
  return bordes(pico(sumar([pellizco(nota(76), 0), 0.8], [pellizco(nota(83), 0.075), 1]), -4), 0.0005, 0.04)
}

/** b · Golpe de fieltro: un grave que cae (150 a 95 Hz) con un toque suave arriba. */
function ctaB(): Float32Array {
  const n = muestras(0.22)
  const grave = por(seno(n, (t) => 95 + 55 * exp(t, 0.02)), (t) => (1 - exp(t, 0.0015)) * exp(t, 0.06))
  const fieltro = por(filtrar(ruido(n, 241), 'pasabajos', () => 1400, 0.7), (t) => exp(t, 0.008))
  return bordes(pico(sumar([grave, 1], [fieltro, 0.35]), -3), 0.0005, 0.04)
}

/** c · Destello: tres campanitas que suben (do, mi, sol), muy rápido, con brillo. */
function ctaC(): Float32Array {
  const n = muestras(0.34)
  const r = new Float32Array(n)
  for (const [k, midi] of [84, 88, 91].entries()) {
    const desde = k * 0.045
    let [pc, pm] = [0, 0]
    const f = nota(midi)
    for (let i = muestras(desde); i < n; i += 1) {
      const t = i / SR - desde
      r[i] += Math.sin(pc + 1.4 * exp(t, 0.03) * Math.sin(pm)) * suave(t / 0.002) * exp(t, 0.08) * (0.7 + 0.15 * k)
      pc += (2 * Math.PI * f) / SR
      pm += (2 * Math.PI * f * 2) / SR
    }
  }
  return bordes(pico(r, -6), 0.0004, 0.05)
}

/** d · Tecla grave: un «bonk» redondo (la de 220 Hz con su segunda) filtrado, con una cola corta. */
function ctaD(): Float32Array {
  const n = muestras(0.3)
  const tono = sumar([seno(n, () => 220), 1], [seno(n, () => 440), 0.35], [seno(n, () => 660), 0.1])
  const cerrado = filtrar(tono, 'pasabajos', (i) => 400 + 2400 * exp(i / SR, 0.03), 0.9)
  return bordes(pico(por(cerrado, (t) => suave(t / 0.003) * exp(t, 0.085)), -4), 0.0005, 0.05)
}

// ── Los ambientes: tres candidatos, bucles de 24 s, en estéreo ─────────────

const BUCLE_S = 24 // múltiplo de 20 ms (el cuadro de Opus) y de cada compás de los tres
const COLA_S = 6

interface Estereo {
  readonly i: Float32Array
  readonly d: Float32Array
}

const estereo = (n: number): Estereo => ({ i: new Float32Array(n), d: new Float32Array(n) })

/** Suma una voz mono al estéreo, en `desde` (s), con su volumen y su paneo (−1 izquierda, 1 derecha). */
function poner(e: Estereo, voz: Float32Array, desde: number, g: number, paneo: number): void {
  const i0 = muestras(desde)
  const [gi, gd] = [g * Math.cos(((paneo + 1) * Math.PI) / 4), g * Math.sin(((paneo + 1) * Math.PI) / 4)]
  for (let k = 0; k < voz.length && i0 + k < e.i.length; k += 1) {
    e.i[i0 + k] += voz[k] * gi
    e.d[i0 + k] += voz[k] * gd
  }
}

/** Una campana de FM (el «cristal» del arpegio). */
function campana(f: number, dura: number, indice: number, razon: number, tau: number): Float32Array {
  const n = muestras(dura)
  const r = new Float32Array(n)
  let [pc, pm] = [0, 0]
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    r[i] = Math.sin(pc + indice * exp(t, tau * 0.6) * Math.sin(pm)) * suave(t / 0.004) * exp(t, tau)
    pc += (2 * Math.PI * f) / SR
    pm += (2 * Math.PI * f * razon) / SR
  }
  return r
}

/** Un pellizco con cuerpo de diente de sierra (armónicos que caen) y un filtro que se cierra. */
function pellizco(f: number, dura: number, brillo: number): Float32Array {
  const n = muestras(dura)
  const crudo = new Float32Array(n)
  for (let h = 1; h <= 8; h += 1) {
    const g = 1 / h
    let ph = h * 0.7
    for (let i = 0; i < n; i += 1) {
      crudo[i] += Math.sin(ph) * g
      ph += (2 * Math.PI * f * h) / SR
    }
  }
  return por(filtrar(crudo, 'pasabajos', (i) => f * 1.5 + brillo * exp(i / SR, 0.05), 0.9), (t) => suave(t / 0.003) * exp(t, dura / 3))
}

/** Un acorde de colchón: senos de a pares apenas desafinados, que entran y salen despacio. */
function colchon(notas: readonly number[], dura: number, entra: number, sale: number, semilla: number): Float32Array {
  const n = muestras(dura + sale)
  const r = new Float32Array(n)
  notas.forEach((m, k) => {
    const f = nota(m)
    for (const [desafinado, fase] of [[-0.11 - k * 0.013, semilla + k], [0.09 + k * 0.017, semilla + k + 1.7]] as const) {
      let ph = fase
      for (let i = 0; i < n; i += 1) {
        r[i] += Math.sin(ph) / notas.length
        ph += (2 * Math.PI * (f + desafinado)) / SR
      }
    }
  })
  return por(r, (t) => (t < entra ? suave(t / entra) : t < dura ? 1 : 1 - suave((t - dura) / sale)))
}

/** Un retardo de ida y vuelta (izquierda ↔ derecha) con realimentación y su filtro. */
function retardo(e: Estereo, tiempo: number, realim: number, mezcla: number): Estereo {
  const d = muestras(tiempo)
  const r = estereo(e.i.length)
  const [bi, bd] = [new Float32Array(e.i.length), new Float32Array(e.i.length)]
  let [li, ld] = [0, 0]
  for (let k = 0; k < e.i.length; k += 1) {
    const ei = k >= d ? bd[k - d] : 0
    const ed = k >= d ? bi[k - d] : 0
    li += (ei - li) * 0.35
    ld += (ed - ld) * 0.35
    bi[k] = e.i[k] + li * realim
    bd[k] = e.d[k] + ld * realim
    r.i[k] = e.i[k] + li * mezcla
    r.d[k] = e.d[k] + ld * mezcla
  }
  return r
}

/** Una reverb de Schroeder (cuatro peines con su amortiguación y dos pasatodo), un poco distinta en cada lado. */
function reverb(e: Estereo, tamano: number, mezcla: number): Estereo {
  const lado = (x: Float32Array, corrimiento: number): Float32Array => {
    const peines = [1557, 1617, 1491, 1422].map((v) => Math.round((v + corrimiento) * (SR / 44100) * tamano))
    const salida = new Float32Array(x.length)
    for (const largo of peines) {
      const buf = new Float32Array(largo)
      let [k, filtro] = [0, 0]
      for (let i = 0; i < x.length; i += 1) {
        const y = buf[k]
        filtro = y * 0.8 + filtro * 0.2
        buf[k] = x[i] + filtro * 0.82
        salida[i] += y / peines.length
        k = (k + 1) % largo
      }
    }
    let actual = salida
    for (const largo of [225, 556].map((v) => Math.round((v + corrimiento / 3) * (SR / 44100)))) {
      const buf = new Float32Array(largo)
      const y = new Float32Array(x.length)
      let k = 0
      for (let i = 0; i < x.length; i += 1) {
        const b = buf[k]
        const v = -actual[i] * 0.5 + b
        buf[k] = actual[i] + b * 0.5
        y[i] = v
        k = (k + 1) % largo
      }
      actual = y
    }
    return actual
  }
  const [ri, rd] = [lado(e.i, 0), lado(e.d, 23)]
  const r = estereo(e.i.length)
  for (let k = 0; k < e.i.length; k += 1) {
    r.i[k] = e.i[k] + ri[k] * mezcla
    r.d[k] = e.d[k] + rd[k] * mezcla
  }
  return r
}

/** El bucle: lo que pasa del final (las colas) se suma al principio, y queda de 24 s exactos. */
function cerrarElBucle(e: Estereo): Estereo {
  const L = muestras(BUCLE_S)
  const r = estereo(L)
  for (let k = 0; k < e.i.length; k += 1) {
    r.i[k % L] += e.i[k]
    r.d[k % L] += e.d[k]
  }
  return r
}

/** Lleva el pico de los dos lados a `db` dBFS. */
function picoEstereo(e: Estereo, db: number): Estereo {
  let m = 0
  for (let k = 0; k < e.i.length; k += 1) m = Math.max(m, Math.abs(e.i[k]), Math.abs(e.d[k]))
  const g = m === 0 ? 0 : 10 ** (db / 20) / m
  return { i: e.i.map((v) => v * g), d: e.d.map((v) => v * g) }
}

/**
 * a · CRISTALES — 80 BPM, ocho compases. Un arpegio de campanitas de FM en corcheas sobre un colchón cálido
 * (lam9 → fa maj9 → do maj9 → sol6, dos compases cada uno) y la fundamental abajo; el retardo de ida y vuelta abre el
 * estéreo y la reverb lo lleva lejos. El más cercano al de nk: melódico y quieto, con algo que se mueve siempre.
 */
function ambienteA(): Estereo {
  const n = muestras(BUCLE_S + COLA_S)
  const e = estereo(n)
  const compas = 3
  const acordes = [
    { raiz: 45, notas: [57, 60, 64, 67, 71] },
    { raiz: 41, notas: [53, 57, 60, 64, 67] },
    { raiz: 48, notas: [60, 64, 67, 71, 74] },
    { raiz: 43, notas: [55, 59, 62, 64, 69] },
  ]
  const figura = [0, 2, 4, 3, 1, 4, 2, 3]
  acordes.forEach((a, k) => {
    const desde = k * 2 * compas
    poner(e, colchon(a.notas, 2 * compas, 1.2, 2.2, k * 3), desde, 0.5, 0)
    poner(e, por(seno(muestras(2 * compas + 1), () => nota(a.raiz)), (t) => suave(t / 0.8) * (t < 2 * compas ? 1 : 1 - suave(t - 2 * compas))), desde, 0.32, 0)
    for (let c = 0; c < 16; c += 1) {
      const m = a.notas[figura[c % 8]] + 12 + (c >= 8 && c % 4 === 3 ? 12 : 0)
      const fuerza = c % 2 === 0 ? 0.32 : 0.22
      poner(e, campana(nota(m), 1.6, 1.6, 3.5, 0.45), desde + c * (compas / 8), fuerza, c % 2 === 0 ? -0.45 : 0.45)
    }
  })
  return picoEstereo(cerrarElBucle(reverb(retardo(e, (compas / 8) * 1.5, 0.38, 0.5), 1.15, 0.45)), -6)
}

/**
 * b · DATOS — 120 BPM, doce compases. Una secuencia de pellizcos en semicorcheas (pentatónica de re menor) que cambia
 * de fundamental cada cuatro compases (re, si bemol, fa), con un filtro que se abre y se cierra con el bucle; un pulso
 * grave muy bajo en cada negra y un tic de ruido en las semicorcheas. El más tecnológico.
 */
function ambienteB(): Estereo {
  const n = muestras(BUCLE_S + COLA_S)
  const e = estereo(n)
  const negra = 0.5
  const frases = [{ raiz: 38 }, { raiz: 34 }, { raiz: 41 }]
  const escala = [0, 3, 5, 7, 10, 12, 15, 17]
  const paso = [0, 4, 2, 5, 1, 4, 3, 6, 0, 5, 2, 4, 1, 6, 3, 7]
  const apertura = (t: number): number => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / BUCLE_S)
  frases.forEach((f, k) => {
    const desde = k * 4 * 4 * negra
    poner(e, colchon([f.raiz + 12, f.raiz + 19, f.raiz + 24], 4 * 4 * negra, 1.5, 2, k * 5), desde, 0.28, 0)
    for (let s = 0; s < 64; s += 1) {
      const t = desde + s * (negra / 4)
      const m = f.raiz + 24 + escala[paso[s % 16]]
      if (s % 16 === 7 || s % 16 === 13) continue
      poner(e, pellizco(nota(m), 0.32, 700 + 2600 * apertura(t)), t, s % 4 === 0 ? 0.3 : 0.2, Math.sin(s * 0.9) * 0.5)
    }
    for (let b = 0; b < 16; b += 1) {
      const t = desde + b * negra
      poner(e, por(seno(muestras(0.35), (u) => 50 + 35 * exp(u, 0.03)), (u) => suave(u / 0.004) * exp(u, 0.09)), t, 0.22, 0)
    }
  })
  const tics = estereo(n)
  const blanco = ruido(n, 307)
  for (let s = 0; s < (BUCLE_S / negra) * 4; s += 1) {
    const i0 = muestras(s * (negra / 4))
    for (let i = i0; i < Math.min(n, i0 + muestras(0.03)); i += 1) {
      const v = blanco[i] * exp((i - i0) / SR, 0.006) * (s % 2 === 1 ? 0.06 : 0.035)
      tics.i[i] += v * (s % 4 === 1 ? 1 : 0.6)
      tics.d[i] += v * (s % 4 === 3 ? 1 : 0.6)
    }
  }
  const tic = { i: filtrar(tics.i, 'pasaaltos', () => 7000, 0.7), d: filtrar(tics.d, 'pasaaltos', () => 7000, 0.7) }
  const mezcla = estereo(n)
  for (let k = 0; k < n; k += 1) {
    mezcla.i[k] = e.i[k] + tic.i[k]
    mezcla.d[k] = e.d[k] + tic.d[k]
  }
  return picoEstereo(cerrarElBucle(reverb(retardo(mezcla, negra * 0.75, 0.3, 0.35), 0.9, 0.3)), -6)
}

/**
 * c · NIEBLA — 60 BPM, seis compases. Colchones largos (re maj9 → si m9 → sol maj9, ocho segundos cada uno) y una
 * melodía de vidrio espaciada (una nota cada dos tiempos, con su octava apenas), con un retardo largo y mucha sala. El
 * más tranquilo.
 */
function ambienteC(): Estereo {
  const n = muestras(BUCLE_S + COLA_S)
  const e = estereo(n)
  const acordes = [
    { raiz: 38, notas: [50, 54, 57, 61, 64] },
    { raiz: 35, notas: [47, 50, 54, 57, 61] },
    { raiz: 31, notas: [43, 47, 50, 54, 57] },
  ]
  const melodia = [78, 81, 76, 74, 78, 73, 71, 74, 69, 71, 66, 69]
  acordes.forEach((a, k) => {
    poner(e, colchon(a.notas, 8, 2.5, 3.5, k * 7), k * 8, 0.6, 0)
    poner(e, por(seno(muestras(9), () => nota(a.raiz)), (t) => suave(t / 1.5) * (t < 8 ? 1 : 1 - suave(t - 8))), k * 8, 0.25, 0)
  })
  melodia.forEach((m, k) => {
    const vidrio = sumar([campana(nota(m), 3, 0.7, 2, 0.9), 1], [campana(nota(m + 12), 2, 0.4, 3, 0.5), 0.2])
    poner(e, vidrio, k * 2 + 0.5, 0.26, k % 2 === 0 ? -0.35 : 0.35)
  })
  return picoEstereo(cerrarElBucle(reverb(retardo(e, 0.75, 0.45, 0.45), 1.35, 0.6)), -6)
}

// ── Los archivos ────────────────────────────────────────────────────────────

const HUECO_S = 0.3
const COLCHON_S = 0.4

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
    ['barra-a', barraA()],
    ['barra-b', barraB()],
    ['barra-c', barraC()],
    ['barra-d', barraD()],
    ['cta-a', ctaA()],
    ['cta-b', ctaB()],
    ['cta-c', ctaC()],
    ['cta-d', ctaD()],
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

  // Los ambientes: cada uno con su colchón (el final antes y el principio después).
  const ambientes: Record<string, { readonly corte: readonly [number, number]; readonly peso: { readonly webm: number; readonly m4a: number } }> = {}
  for (const [nombre, armar] of [['a', ambienteA], ['b', ambienteB], ['c', ambienteC]] as const) {
    const bucle = armar()
    const c = muestras(COLCHON_S)
    const L = bucle.i.length
    const con = (x: Float32Array): Float32Array => {
      const r = new Float32Array(c + L + c)
      r.set(x.slice(L - c), 0)
      r.set(x, c)
      r.set(x.slice(0, c), c + L)
      return r
    }
    const peso = codificar(wav([con(bucle.i), con(bucle.d)]), `ambiente-${nombre}`, 48, 64, tmp)
    ambientes[nombre] = { corte: [Math.round((c / SR) * 1000), Math.round((L / SR) * 1000)], peso }
  }
  rmSync(tmp, { recursive: true, force: true })

  const kb = (b: number): string => String(Math.round(b / 1024))
  const ts = `/**
 * [RETOQUE 3D] LOS CORTES DEL SONIDO — generado por \`scripts-retoque/sonidos.ts\` (no se edita a mano).
 *
 *   · El sprite (\`public/v3/sonido/sonidos.{webm,m4a}\`): dónde empieza cada sonido y cuánto dura (ms). ${(todo.length / SR).toFixed(1)} s en total;
 *     ${kb(pesoDelSprite.webm)} KB en Opus y ${kb(pesoDelSprite.m4a)} KB en AAC.
 *   · Los ambientes, uno por archivo (\`public/v3/sonido/ambiente-{a,b,c}.{webm,m4a}\`, en estéreo): dónde empieza el bucle
 *     adentro de su colchón y cuánto dura (ms). ${Object.entries(ambientes).map(([n, a]) => `${n}: ${kb(a.peso.webm)} KB en Opus, ${kb(a.peso.m4a)} en AAC`).join('; ')}.
 */
export const CORTES_DEL_SPRITE = {
${Object.entries(cortes).map(([nombre, [desde, dura]]) => `  '${nombre}': [${String(desde)}, ${String(dura)}],`).join('\n')}
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE

export const CORTES_DEL_AMBIENTE = {
${Object.entries(ambientes).map(([nombre, a]) => `  ${nombre}: [${String(a.corte[0])}, ${String(a.corte[1])}],`).join('\n')}
} as const

export type Ambiente = keyof typeof CORTES_DEL_AMBIENTE
`
  writeFileSync(`${RAIZ}/src/app/v3/_lib/sonido/sprite.ts`, ts)
  console.log(JSON.stringify({ sprite: { segundos: +(todo.length / SR).toFixed(2), peso: pesoDelSprite }, ambientes }))
}

principal()

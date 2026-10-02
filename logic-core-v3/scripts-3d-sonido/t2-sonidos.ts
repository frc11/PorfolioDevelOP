/**
 * 3D Y SONIDO · T2 — los sonidos del sitio, generados: t2-sonidos.ts
 *
 * Síntesis propia, renderizada fuera de línea a un archivo (lo mismo que un `OfflineAudioContext`, pero en Node: sin
 * navegador y determinista): osciladores, ruido con semilla, filtros de dos polos (las fórmulas del «Audio EQ Cookbook»
 * de R. Bristow-Johnson) y envolventes. Nada descargado: cada sonido es obra de este archivo y va con la licencia CC0
 * (`docs/rediseno/SONIDO.md`). Mono, 48 kHz.
 *
 * Escribe UN sprite (`public/v3/sonido/sonidos.webm`, Opus, y `sonidos.m4a`, AAC, de respaldo para Safari) y sus cortes
 * (`src/app/v3/_lib/sonido/sprite.ts`). Cada sonido va separado por silencio; los dos ambientes (de día y de noche) son
 * bucles que se repiten sin costura: cada uno va con un pedazo de su final antes y uno de su principio después, así un
 * corrimiento del decodificador (el relleno de Opus o de AAC) cae adentro de lo mismo y el bucle sigue entero.
 *
 * El encendido del haz sigue al guion de la escena (`entorno/encendido.ts`): el zumbido sube y baja con cada intento que
 * falla y el golpe cae en el instante del encendido de verdad. El Genie dura lo del Genie (`MS_DEL_GENIE`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

import { FALLA_S, FIRME, GUION_S, guionEn } from '../src/app/v3/_lib/escena/entorno/encendido'

const SR = 48000
const RAIZ = process.cwd()

// ── Herramientas ──────────────────────────────────────────────────────────

const muestras = (s: number): number => Math.round(s * SR)

/** Ruido blanco con semilla (mulberry32): el mismo archivo en cada corrida. */
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

/** Ruido rosa (Paul Kellet, la versión económica) y marrón (integrado con fuga). */
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
function marron(blanco: Float32Array): Float32Array {
  const r = new Float32Array(blanco.length)
  let y = 0
  for (let i = 0; i < blanco.length; i += 1) {
    y = (y + 0.02 * blanco[i]) * 0.998
    r[i] = y * 3.5
  }
  return r
}

type Tipo = 'pasabajos' | 'pasaaltos' | 'pasabanda'

/** Un filtro de dos polos con la frecuencia (Hz) que puede cambiar por muestra (se recalcula cada 16). */
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

/** Un seno con la frecuencia (Hz) que cambia por muestra (la fase se integra: sin chasquidos al deslizar). */
function seno(n: number, frecuencia: (t: number) => number, fase = 0): Float32Array {
  const r = new Float32Array(n)
  let ph = fase
  for (let i = 0; i < n; i += 1) {
    r[i] = Math.sin(ph)
    ph += (2 * Math.PI * frecuencia(i / SR)) / SR
  }
  return r
}

/** Multiplica por una envolvente (en segundos). */
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

/** Lleva el pico a `db` dBFS. */
function pico(x: Float32Array, db: number): Float32Array {
  let m = 0
  for (const v of x) m = Math.max(m, Math.abs(v))
  const g = m === 0 ? 0 : 10 ** (db / 20) / m
  return x.map((v) => v * g)
}

/** Ataque y caída suaves en los bordes (sin chasquido al cortar). */
function bordes(x: Float32Array, entraS: number, saleS: number): Float32Array {
  const [a, b] = [muestras(entraS), muestras(saleS)]
  return x.map((v, i) => v * Math.min(1, a === 0 ? 1 : i / a, b === 0 ? 1 : (x.length - 1 - i) / b))
}

const exp = (t: number, tau: number): number => Math.exp(-t / tau)
const suave = (u: number): number => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u))

// ── Los sonidos ───────────────────────────────────────────────────────────

/** El tic del hover de la barra: un toque agudo, muy corto. */
function tic(): Float32Array {
  const n = muestras(0.06)
  const tono = por(seno(n, () => 3100), (t) => exp(t, 0.006))
  const golpe = por(filtrar(ruido(n, 11), 'pasaaltos', () => 2500, 0.7), (t) => exp(t, 0.0015))
  return bordes(pico(sumar([tono, 0.6], [golpe, 0.5]), -6), 0.0005, 0.01)
}

/** El clic de los botones y del CTA: un «toc» con un poco de cuerpo. */
function clic(): Float32Array {
  const n = muestras(0.1)
  const tono = por(seno(n, (t) => 700 + 700 * exp(t, 0.012)), (t) => (1 - exp(t, 0.0008)) * exp(t, 0.018))
  const golpe = por(filtrar(ruido(n, 23), 'pasabanda', () => 2400, 1.1), (t) => exp(t, 0.003))
  return bordes(pico(sumar([tono, 0.8], [golpe, 0.45]), -3), 0.0005, 0.015)
}

const MS_DEL_GENIE = 560

/** El Genie: aire filtrado que barre al abrir (sube) y al cerrar (baja), con un cuerpo de seno; al cerrar, un apoyo. */
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

/** El pulso del logo: un golpe grave, casi imperceptible (con un armónico para que exista en un parlante chico). */
function pulso(): Float32Array {
  const n = muestras(0.9)
  const f = (t: number): number => 44 + 34 * exp(t, 0.05)
  const grave = por(seno(n, f), (t) => (1 - exp(t, 0.006)) * exp(t, 0.22))
  const arm = por(seno(n, (t) => 2.5 * f(t)), (t) => (1 - exp(t, 0.006)) * exp(t, 0.12))
  return bordes(pico(filtrar(sumar([grave, 1], [arm, 0.35]), 'pasabajos', () => 260, 0.7), -3), 0.002, 0.08)
}

/**
 * El encendido del haz: un zumbido eléctrico (100 Hz y sus armónicos, la red de 50 Hz rectificada) que sigue a la
 * intensidad del guion: tenue y cortado en los intentos que fallan, con un chisporroteo al arrancar cada uno; en el
 * encendido de verdad, el golpe; después, el zumbido firme que se apaga solo en un segundo y medio.
 */
function encendido(): Float32Array {
  const cola = 1.6
  const total = GUION_S + cola
  const n = muestras(total)
  const k = (t: number): number => (t < GUION_S ? guionEn(t) / FIRME : 1)
  // La intensidad suavizada (2 ms), para que los cortes del guion no chasqueen.
  const nivel = new Float32Array(n)
  let v = 0
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    v += (k(t) - v) * (1 - Math.exp(-1 / (SR * 0.002)))
    nivel[i] = v * (t > GUION_S ? exp(t - GUION_S, cola / 4) : 1)
  }
  const zumbido = sumar([seno(n, () => 100), 1], [seno(n, () => 200), 0.55], [seno(n, () => 300), 0.3], [seno(n, () => 400), 0.18])
  // El «bzz»: el zumbido recortado y filtrado (los armónicos de arriba).
  const bzz = filtrar(zumbido.map((x) => Math.tanh(3 * x)), 'pasabanda', () => 900, 0.8)
  const crudo = new Float32Array(n)
  for (let i = 0; i < n; i += 1) crudo[i] = (zumbido[i] * 0.6 + bzz[i] * 0.5) * nivel[i]
  // El chisporroteo al empezar cada tramo que falla.
  const chispas = new Float32Array(n)
  const blanco = ruido(n, 47)
  for (const desde of [0.1, 0.36, 0.92, 1.58]) {
    const i0 = muestras(desde)
    for (let i = i0; i < Math.min(n, i0 + muestras(0.05)); i += 1) chispas[i] = blanco[i] * exp((i - i0) / SR, 0.008)
  }
  const chisporroteo = filtrar(chispas, 'pasaaltos', () => 1800, 0.7)
  // El golpe del encendido.
  const g0 = FALLA_S
  const golpeGrave = por(seno(n, (t) => (t < g0 ? 65 : 42 + 26 * exp(t - g0, 0.06))), (t) => (t < g0 ? 0 : (1 - exp(t - g0, 0.003)) * exp(t - g0, 0.2)))
  const golpeRuido = por(filtrar(ruido(n, 53), 'pasabajos', () => 900, 0.7), (t) => (t < g0 ? 0 : exp(t - g0, 0.035)))
  return bordes(pico(sumar([crudo, 0.55], [chisporroteo, 0.35], [golpeGrave, 1], [golpeRuido, 0.5]), -3), 0.002, 0.2)
}

/** El amanecer: un acorde que crece desde nada y se abre (el filtro sube con el día), y se va. */
function amanecer(): Float32Array {
  const d = 5.2
  const n = muestras(d)
  const notas = [110, 164.81, 220, 277.18, 329.63]
  const partes: [Float32Array, number][] = []
  // Cada nota con su par apenas desafinado, y cada par con otro desafinado: los batidos no coinciden (si coincidían, el
  // acorde entero latía como un trémolo y el crescendo se leía en cuatro golpes).
  const desafinado = [0.07, 0.13, 0.19, 0.11, 0.17]
  notas.forEach((f, k) => {
    partes.push([seno(n, () => f - desafinado[k], k), 1 / (1 + k * 0.4)])
    partes.push([seno(n, () => f + desafinado[k], k + 1.3), 0.6 / (1 + k * 0.4)])
  })
  const acorde = sumar(...partes)
  const crece = (t: number): number => (t < 3.4 ? suave(t / 3.4) ** 1.6 : t < 3.9 ? 1 : 1 - suave((t - 3.9) / (d - 3.9)))
  const abierto = filtrar(acorde, 'pasabajos', (i) => 380 * (3200 / 380) ** suave(i / SR / 3.6), 0.8)
  const brillo = por(filtrar(rosa(ruido(n, 61)), 'pasabanda', () => 4200, 0.6), (t) => 0.25 * crece(t) * suave(t / 3.6))
  return bordes(pico(sumar([por(abierto, crece), 1], [brillo, 1]), -4), 0.05, 0.3)
}

/** El túnel: un soplido (aire que se abre y se cierra). */
function tunel(): Float32Array {
  const d = 1.4
  const n = muestras(d)
  const forma = (t: number): number => (t < 0.55 ? suave(t / 0.55) : 1 - suave((t - 0.55) / (d - 0.55)))
  const aire = filtrar(rosa(ruido(n, 71)), 'pasabajos', (i) => 260 + 1600 * forma(i / SR), 0.9)
  const silbido = filtrar(ruido(n, 73), 'pasabanda', (i) => 700 + 1300 * forma(i / SR), 4)
  return bordes(pico(sumar([por(aire, forma), 1], [por(silbido, (t) => 0.12 * forma(t)), 1]), -4), 0.02, 0.1)
}

/** El hover de las fotos: un roce mínimo (ruido agudo granulado). */
function foto(): Float32Array {
  const n = muestras(0.17)
  const granos = ruido(n, 83)
  const grano = new Float32Array(n)
  for (let i = 0; i < n; i += 1) grano[i] = 0.6 + 0.4 * Math.sin(i / SR * 2 * Math.PI * 34 + granos[i] * 0.8)
  const roce = filtrar(filtrar(ruido(n, 89), 'pasaaltos', () => 2600, 0.7), 'pasabanda', () => 5200, 0.9)
  return bordes(pico(por(roce, (t) => (t < 0.018 ? suave(t / 0.018) : exp(t - 0.018, 0.045)) * grano[Math.min(n - 1, muestras(t))]), -6), 0.001, 0.02)
}

/** Un bucle sin costura: se arma más largo y la cola se funde en la cabeza (potencia constante). */
function enBucle(x: Float32Array, largoS: number, fundidoS: number): Float32Array {
  const L = muestras(largoS)
  const F = muestras(fundidoS)
  const r = new Float32Array(L)
  for (let i = 0; i < L; i += 1) r[i] = x[i]
  for (let i = 0; i < F; i += 1) {
    const u = i / F
    r[i] = x[i] * Math.sin((Math.PI / 2) * u) + x[L + i] * Math.cos((Math.PI / 2) * u)
  }
  return r
}

const BUCLE_S = 6

/** El ambiente de día: aire claro (rosa entre 300 Hz y 2,2 kHz) que respira lento, y un brillo apenas. */
function dia(): Float32Array {
  const n = muestras(BUCLE_S + 1.5)
  const aire = filtrar(filtrar(rosa(ruido(n, 97)), 'pasaaltos', () => 300, 0.7), 'pasabajos', () => 2200, 0.7)
  const respira = (t: number): number => 0.75 + 0.25 * Math.sin((2 * Math.PI * t) / BUCLE_S)
  const brillo = sumar([por(seno(n, () => 1760), (t) => 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / (BUCLE_S / 2))), 1], [por(seno(n, () => 2637), (t) => 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / (BUCLE_S / 3) + 1)), 0.7])
  return pico(enBucle(sumar([por(aire, respira), 1], [brillo, 0.012]), BUCLE_S, 1.2), -6)
}

/** El ambiente de noche: un grave hondo (marrón bajo 250 Hz) y un zumbido de 55 Hz con su quinta, que laten lento. */
function noche(): Float32Array {
  const n = muestras(BUCLE_S + 1.5)
  const hondo = filtrar(marron(ruido(n, 101)), 'pasabajos', () => 250, 0.7)
  const late = (t: number): number => 0.7 + 0.3 * Math.sin((2 * Math.PI * t) / BUCLE_S)
  const dron = sumar([seno(n, () => 55), 1], [seno(n, () => 82.5), 0.6], [seno(n, () => 110), 0.25])
  return pico(enBucle(sumar([por(hondo, late), 1], [por(dron, (t) => 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / (BUCLE_S / 2))), 0.35]), BUCLE_S, 1.2), -6)
}

// ── El sprite ─────────────────────────────────────────────────────────────

const HUECO_S = 0.3
const COLCHON_S = 0.4

interface Corte {
  readonly desde: number
  readonly dura: number
  readonly bucle: boolean
}

function principal(): void {
  const sonidos: readonly (readonly [string, Float32Array, boolean])[] = [
    ['tic', tic(), false],
    ['clic', clic(), false],
    ['abre', genie(true), false],
    ['cierra', genie(false), false],
    ['pulso', pulso(), false],
    ['encendido', encendido(), false],
    ['amanecer', amanecer(), false],
    ['tunel', tunel(), false],
    ['foto', foto(), false],
    ['dia', dia(), true],
    ['noche', noche(), true],
  ]
  const trozos: Float32Array[] = []
  const cortes: Record<string, Corte> = {}
  let pos = muestras(HUECO_S)
  trozos.push(new Float32Array(pos))
  for (const [nombre, x, bucle] of sonidos) {
    if (bucle) {
      // El colchón: el final del bucle antes y su principio después (un corrimiento del decodificador cae adentro).
      const c = muestras(COLCHON_S)
      trozos.push(x.slice(x.length - c), x, x.slice(0, c))
      cortes[nombre] = { desde: Math.round(((pos + c) / SR) * 1000), dura: Math.round((x.length / SR) * 1000), bucle }
      pos += c + x.length + c
    } else {
      trozos.push(x)
      cortes[nombre] = { desde: Math.round((pos / SR) * 1000), dura: Math.round((x.length / SR) * 1000) + 40, bucle }
      pos += x.length
    }
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
  // WAV de 16 bits, mono.
  const datos = Buffer.alloc(44 + todo.length * 2)
  datos.write('RIFF', 0, 'latin1')
  datos.writeUInt32LE(36 + todo.length * 2, 4)
  datos.write('WAVEfmt ', 8, 'latin1')
  datos.writeUInt32LE(16, 16)
  datos.writeUInt16LE(1, 20)
  datos.writeUInt16LE(1, 22)
  datos.writeUInt32LE(SR, 24)
  datos.writeUInt32LE(SR * 2, 28)
  datos.writeUInt16LE(2, 32)
  datos.writeUInt16LE(16, 34)
  datos.write('data', 36, 'latin1')
  datos.writeUInt32LE(todo.length * 2, 40)
  for (let i = 0; i < todo.length; i += 1) datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, todo[i])) * 32767), 44 + i * 2)
  const tmp = `${tmpdir()}/sonidos-3d-${String(process.pid)}`
  mkdirSync(tmp, { recursive: true })
  const wav = `${tmp}/sonidos.wav`
  writeFileSync(wav, datos)
  const dir = `${RAIZ}/public/v3/sonido`
  mkdirSync(dir, { recursive: true })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libopus', '-b:a', '32k', '-ac', '1', `${dir}/sonidos.webm`])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '40k', '-ac', '1', '-movflags', '+faststart', `${dir}/sonidos.m4a`])
  if (process.env.WAV_DE_CONTROL !== undefined) writeFileSync(process.env.WAV_DE_CONTROL, datos)
  rmSync(tmp, { recursive: true, force: true })
  const pesos = { webm: statSync(`${dir}/sonidos.webm`).size, m4a: statSync(`${dir}/sonidos.m4a`).size }
  const ts = `/**
 * [3D Y SONIDO] T2 · LOS CORTES DEL SPRITE — generado por \`scripts-3d-sonido/t2-sonidos.ts\` (no se edita a mano): dónde
 * empieza cada sonido en \`public/v3/sonido/sonidos.{webm,m4a}\` y cuánto dura (ms), y si es un bucle. ${(todo.length / SR).toFixed(1)} s en total;
 * ${String(Math.round(pesos.webm / 1024))} KB en Opus y ${String(Math.round(pesos.m4a / 1024))} KB en AAC.
 */
export const CORTES_DEL_SPRITE = {
${Object.entries(cortes).map(([nombre, c]) => `  ${nombre}: [${String(c.desde)}, ${String(c.dura)}${c.bucle ? ', true' : ''}],`).join('\n')}
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE
`
  mkdirSync(`${RAIZ}/src/app/v3/_lib/sonido`, { recursive: true })
  writeFileSync(`${RAIZ}/src/app/v3/_lib/sonido/sprite.ts`, ts)
  console.log(JSON.stringify({ segundos: +(todo.length / SR).toFixed(2), pesos, cortes }))
}

principal()

/**
 * SPRINT ESCENA 10 · CIERRE — EL DESTELLO DE UN CUADRO: el instrumento y el detector (los usan el banco `destello.ts` y
 * el invariante `destello.invariant.ts`).
 *
 * **El instrumento** envuelve el `render` del lienzo (el del cuadro, sin búfer propio) y, en el mismo cuadro, apenas
 * termina de dibujar: lee los píxeles (`readPixels` en la misma tarea que el dibujo lee ESE cuadro; el aviso de
 * `repo_medicion_navegador` es para una lectura en otro momento, que encuentra el búfer ya entregado) y anota el
 * instante, el scroll, dónde están los dos paneles opacos (Servicios y Tu panel), lo que el amanecer decidió en ese
 * cuadro (prendido, segundo, si sostiene la noche), la noche que leyó la sala (`uNoche`) y la del logo. De los píxeles
 * guarda la luminancia en una grilla de 30 bandas por 8 columnas y una miniatura de 128 × 80 (para el clip).
 *
 * **El detector** compara cada cuadro con el anterior en lo que se VE: las celdas que ningún panel opaco tapa en los dos
 * cuadros (con el `<main>` apagado por un viaje, todas). No cuenta el barrido del amanecer (ahí la luz cambia a
 * propósito), los cortes (más de 100 ms entre dos cuadros: la escena vuelve de estar suspendida detrás del bloque, y el
 * revelado no la muestra hasta que pinta) ni los cuadros con menos de dos bandas a la vista.
 */
import { AMANECER } from '../src/app/v3/_lib/escena/amanecer/linea'

export const BANDAS = 30
export const COLUMNAS = 8
export const MINI = { ancho: 128, alto: 80 } as const
/** Los campos de cada cuadro, antes de la grilla. */
export const CAMPOS = ['t', 'y', 'servTope', 'servPie', 'tuTope', 'tuPie', 'alto', 'activo', 's', 'sostiene', 'avance', 'pedido', 'frente', 'noche', 'nocheDelLogo', 'viaje', 'gota', 'opacidadDelMain'] as const
const NC = CAMPOS.length
const POR_CUADRO = NC + BANDAS * COLUMNAS

/** El instrumento, en la página (después de que la escena montó: necesita `__gpuDelBanco`). */
export const INSTRUMENTO = `(() => {
  if (window.__destello) return 'ya'
  const { gl } = window.__gpuDelBanco.tres()
  const ctx = gl.getContext()
  const [B, C, TW, TH, NC, PC] = [${BANDAS}, ${COLUMNAS}, ${MINI.ancho}, ${MINI.alto}, ${NC}, ${POR_CUADRO}]
  const TOPE = 2400
  const filas = new Float64Array(TOPE * PC)
  const minis = new Uint8Array(TOPE * TW * TH * 3)
  let [n, grabando, px, w0, h0] = [0, false, null, 0, 0]
  const caja = (sel) => { const e = document.querySelector(sel); if (!e) return [NaN, NaN]; const r = e.getBoundingClientRect(); return [r.top, r.bottom] }
  const main = document.querySelector('[data-v3] main')
  const gota = document.querySelector('[data-pieza="gota"]')
  const original = gl.render
  gl.render = function (escena, camara) {
    original.call(this, escena, camara)
    if (!grabando || n >= TOPE || this.getRenderTarget() !== null) return
    const [w, h] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
    if (px === null || w !== w0 || h !== h0) { px = new Uint8Array(w * h * 4); w0 = w; h0 = h }
    ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
    const a = window.__amanecerDelBanco ? window.__amanecerDelBanco.estado() : null
    const v = window.__escenaViva || {}
    const [st, sp] = caja('[data-panel="servicios"]')
    const [tt, tp] = caja('[data-panel="tu-panel"]')
    const gs = gota ? getComputedStyle(gota) : null
    const campos = [performance.now(), scrollY, st, sp, tt, tp, innerHeight, a ? (a.activo ? 1 : 0) : -1, a ? a.s : -1, a ? (a.sostiene ? 1 : 0) : -1, a ? a.avance : -1, a ? a.pedido : -1, a ? a.frente : -1, v.noche ?? -1, v.nocheDelLogo ?? -1, main && main.hasAttribute('data-v3-deslizando') ? 1 : 0, gs && gs.visibility === 'visible' ? Number(gs.opacity) : 0, main ? Number(getComputedStyle(main).opacity) : 1]
    const base = n * PC
    for (let k = 0; k < NC; k += 1) filas[base + k] = campos[k]
    for (let b = 0; b < B; b += 1) {
      const [y0, y1] = [Math.floor((b * h) / B), Math.floor(((b + 1) * h) / B)]
      for (let c = 0; c < C; c += 1) {
        const [x0, x1] = [Math.floor((c * w) / C), Math.floor(((c + 1) * w) / C)]
        let [s, m] = [0, 0]
        for (let y = y0; y < y1; y += 3) {
          const fila = (h - 1 - y) * w
          for (let x = x0; x < x1; x += 3) { const i = (fila + x) * 4; s += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; m += 1 }
        }
        filas[base + NC + b * C + c] = s / Math.max(1, m) / 255
      }
    }
    const mb = n * TW * TH * 3
    for (let y = 0; y < TH; y += 1) {
      const sy = h - 1 - Math.floor(((y + 0.5) * h) / TH)
      for (let x = 0; x < TW; x += 1) { const i = (sy * w + Math.floor(((x + 0.5) * w) / TW)) * 4; const o = mb + (y * TW + x) * 3; minis[o] = px[i]; minis[o + 1] = px[i + 1]; minis[o + 2] = px[i + 2] }
    }
    n += 1
  }
  const base64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s) }
  window.__destello = {
    empezar() { n = 0; grabando = true },
    parar() { grabando = false; return n },
    filas(desde, hasta) { return Array.from(filas.subarray(desde * PC, hasta * PC), (x) => Math.round(x * 1e4) / 1e4) },
    minis(desde, hasta) { return base64(minis.subarray(desde * TW * TH * 3, hasta * TW * TH * 3)) },
  }
  return 'puesto'
})()`

export type Cuadro = Record<(typeof CAMPOS)[number], number> & { readonly celdas: readonly number[] }

/** Las filas planas del instrumento, en cuadros. */
export function cuadrosDe(plano: readonly number[]): Cuadro[] {
  const r: Cuadro[] = []
  for (let i = 0; i + POR_CUADRO <= plano.length; i += POR_CUADRO) {
    const c = Object.fromEntries(CAMPOS.map((k, j) => [k, plano[i + j]])) as Record<(typeof CAMPOS)[number], number>
    r.push({ ...c, celdas: plano.slice(i + NC, i + POR_CUADRO) })
  }
  return r
}

/** ¿El amanecer barre en este cuadro (la sala de día y lo no alcanzado oscurecido)? */
export const enElBarrido = (c: Cuadro): boolean => c.activo === 1 && c.s >= AMANECER.cambio && c.s < AMANECER.final

/** Las bandas que se ven: ningún panel opaco las tapa (con el `<main>` apagado o fundiéndose, todas). */
export function bandasALaVista(c: Cuadro): boolean[] {
  const tapan = c.opacidadDelMain >= 0.95 ? [[c.servTope, c.servPie], [c.tuTope, c.tuPie]].filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b)) : []
  return Array.from({ length: BANDAS }, (_, b) => {
    const [y0, y1] = [(b * c.alto) / BANDAS, ((b + 1) * c.alto) / BANDAS]
    return !tapan.some(([a, z]) => y1 > a && y0 < z)
  })
}

export interface Salto {
  readonly i: number
  readonly t: number
  readonly delta: number
  readonly bandas: number
  readonly antes: Omit<Cuadro, 'celdas'>
  readonly ahora: Omit<Cuadro, 'celdas'>
}

export interface Lectura {
  readonly pares: number
  readonly medidos: number
  readonly barrido: number
  readonly tapados: number
  readonly cortes: number
  /** El mayor cambio medido (media de |ΔL| sobre las celdas a la vista en los dos cuadros). */
  readonly mayor: number
  readonly p999: number
  readonly saltos: Salto[]
}

const sinCeldas = (c: Cuadro): Omit<Cuadro, 'celdas'> => Object.fromEntries(CAMPOS.map((k) => [k, c[k]])) as Omit<Cuadro, 'celdas'>

/** Los saltos de luminancia entre cuadros seguidos, en lo que se ve, fuera del barrido. */
export function saltosEn(cuadros: readonly Cuadro[], umbral: number): Lectura {
  let [medidos, barrido, tapados, cortes, mayor] = [0, 0, 0, 0, 0]
  const deltas: number[] = []
  const saltos: Salto[] = []
  for (let i = 1; i < cuadros.length; i += 1) {
    const [a, b] = [cuadros[i - 1], cuadros[i]]
    if (b.t - a.t > 100) { cortes += 1; continue }
    if (enElBarrido(a) || enElBarrido(b)) { barrido += 1; continue }
    const [va, vb] = [bandasALaVista(a), bandasALaVista(b)]
    const comunes = va.map((x, k) => x && vb[k])
    const n = comunes.filter(Boolean).length
    if (n < 2) { tapados += 1; continue }
    let suma = 0
    for (let k = 0; k < BANDAS; k += 1) {
      if (!comunes[k]) continue
      for (let c = 0; c < COLUMNAS; c += 1) suma += Math.abs(b.celdas[k * COLUMNAS + c] - a.celdas[k * COLUMNAS + c])
    }
    const delta = suma / (n * COLUMNAS)
    medidos += 1
    deltas.push(delta)
    mayor = Math.max(mayor, delta)
    if (delta > umbral) saltos.push({ i, t: Math.round(b.t), delta: Math.round(delta * 1e4) / 1e4, bandas: n, antes: sinCeldas(a), ahora: sinCeldas(b) })
  }
  deltas.sort((x, y) => x - y)
  const p999 = deltas.length === 0 ? 0 : deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * 0.999))]
  return { pares: Math.max(0, cuadros.length - 1), medidos, barrido, tapados, cortes, mayor: Math.round(mayor * 1e4) / 1e4, p999: Math.round(p999 * 1e4) / 1e4, saltos }
}

export interface Pico {
  readonly i: number
  readonly cuadros: number
  readonly t: number
  /** Cuánto se sale del rango de sus dos vecinos (luminancia media de lo que se ve en toda la ventana). */
  readonly fuera: number
  readonly luminancias: readonly number[]
  /** [NAVBAR] Qué fracción de las celdas a la vista se sale, cada una, del rango de sus vecinos en la misma dirección. */
  readonly celdas: number
  readonly estados: Omit<Cuadro, 'celdas'>[]
}

/** Lo más largo que se cuenta como destello: 12 cuadros (0,16 s a 75 Hz). */
export const CUADROS_DEL_DESTELLO = 12

/**
 * [NAVBAR] Cuánto de lo que se ve tiene que salirse para que el pico sea de LUZ: la mitad de las celdas, cada una por
 * más de medio umbral y en la dirección del pico. Un destello de luz (la sala de día un cuadro entre cuadros de noche)
 * mueve la sala entera: el control positivo de este invariante saca el 100 % de las celdas (0,78 de luminancia). La
 * geometría que va y vuelve en un cuadro no: en un viaje rápido que cruza Trabajos el logo queda UN cuadro de canto
 * (menos negro en pantalla, la media sube 0,025–0,035) y eso saca el 24–31 % de las celdas. Medido en el sprint NAVBAR
 * (`scripts-navbar/t1-sonda-destello.ts`): el viaje del hero a Por qué develOP ya lo daba a veces antes del sprint (una
 * de dos corridas), y la verde de antes era suerte del muestreo.
 */
export const FRACCION_DEL_DESTELLO = 0.5

/** Qué fracción de las celdas comunes a la ventana se sale, cada una, del rango de sus dos vecinos, en una dirección. */
function celdasQueSeSalen(ventana: readonly Cuadro[], comunes: readonly boolean[], sube: boolean, umbral: number): number {
  let [n, fuera] = [0, 0]
  const [a, z] = [ventana[0], ventana[ventana.length - 1]]
  const medio = ventana.slice(1, -1)
  for (let b = 0; b < BANDAS; b += 1) {
    if (!comunes[b]) continue
    for (let col = 0; col < COLUMNAS; col += 1) {
      const k = b * COLUMNAS + col
      const valores = medio.map((c) => c.celdas[k])
      const d = sube ? Math.min(...valores) - Math.max(a.celdas[k], z.celdas[k]) : Math.min(a.celdas[k], z.celdas[k]) - Math.max(...valores)
      n += 1
      if (d > umbral / 2) fuera += 1
    }
  }
  return fuera / Math.max(1, n)
}

/**
 * Los DESTELLOS, en todo el recorrido (barrido incluido): de uno a `CUADROS_DEL_DESTELLO` cuadros seguidos que se salen
 * del rango de sus dos vecinos (todos más claros, o todos más oscuros, que el más claro y el más oscuro de los vecinos)
 * por más de `umbral`, en la luminancia media de lo que se ve en toda la ventana. Un fundido rápido (el de la luz de un
 * viaje) o la cámara volando cambian mucho de un cuadro al otro, pero no ida y vuelta: no son picos. Gana la ventana que
 * más se sale (una chica adentro de una larga no la tapa). [NAVBAR] Y es de LUZ: se sale por lo menos
 * `FRACCION_DEL_DESTELLO` de lo que se ve (la geometría que va y vuelve, como el logo de canto, no).
 */
export function destellosEn(cuadros: readonly Cuadro[], umbral: number, fraccion = FRACCION_DEL_DESTELLO): Pico[] {
  const candidatos: Pico[] = []
  for (let k = 1; k <= CUADROS_DEL_DESTELLO; k += 1) {
    for (let i = 1; i + k < cuadros.length; i += 1) {
      const ventana = cuadros.slice(i - 1, i + k + 1)
      if (ventana.some((c, j) => j > 0 && c.t - ventana[j - 1].t > 100)) continue
      const vistas = ventana.map(bandasALaVista)
      const comunes = vistas[0].map((_, b) => vistas.every((v) => v[b]))
      const n = comunes.filter(Boolean).length
      if (n < 2) continue
      const L = ventana.map((c) => {
        let s = 0
        for (let b = 0; b < BANDAS; b += 1) if (comunes[b]) for (let col = 0; col < COLUMNAS; col += 1) s += c.celdas[b * COLUMNAS + col]
        return s / (n * COLUMNAS)
      })
      const [a, z] = [L[0], L[L.length - 1]]
      const medio = L.slice(1, -1)
      const arriba = Math.min(...medio) - Math.max(a, z)
      const abajo = Math.min(a, z) - Math.max(...medio)
      const fuera = Math.max(arriba, abajo)
      if (fuera <= umbral) continue
      const celdas = celdasQueSeSalen(ventana, comunes, arriba >= abajo, umbral)
      if (celdas >= fraccion) candidatos.push({ i, cuadros: k, t: Math.round(cuadros[i].t), fuera: Math.round(fuera * 1e4) / 1e4, luminancias: L.map((x) => Math.round(x * 1e3) / 1e3), celdas: Math.round(celdas * 100) / 100, estados: ventana.map(sinCeldas) })
    }
  }
  const picos: Pico[] = []
  for (const c of candidatos.sort((x, y) => y.fuera - x.fuera)) if (!picos.some((p) => p.i <= c.i + c.cuadros - 1 && c.i <= p.i + p.cuadros - 1)) picos.push(c)
  return picos.sort((x, y) => x.i - y.i)
}

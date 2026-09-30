/**
 * SPRINT ESCENA 9 — T4 · ninguna animación cambia de velocidad a 120 ni a 144 Hz: t4-hz.ts [ancho alto]
 *
 * Este monitor es de 75 Hz: no se puede mirar a 120 ni a 144. Así que se CORRE a esas frecuencias con un reloj virtual
 * inyectado antes de cargar la página: `requestAnimationFrame`, `performance.now` y `Date.now` pasan a un tiempo que el
 * banco avanza de a 1/60, 1/75, 1/120 o 1/144 s exactos. Todo lo que se mueve por cuadro en la escena (r3f), el scroll
 * suave (Lenis) y Motion leen ese tiempo, así que corren EXACTAMENTE a esa frecuencia, con la misma entrada: la misma
 * ráfaga de rueda (en los mismos instantes virtuales). Lo que no pasa por ahí (las transiciones de CSS, los temporizadores)
 * corre con el reloj del navegador, que no depende de los cuadros.
 *
 * El evento de scroll también se despacha en cada cuadro virtual, antes de los pedidos de cuadro (como en el navegador):
 * la escena lee el scroll en ese evento.
 *
 * Cada 50 ms virtuales anota: el scroll (Lenis), la cámara (posición), el giro del logo (la vira), el progreso de la
 * coreografía, el aire del polvo y los modos de la física. Después compara cada frecuencia contra 60 Hz en los mismos
 * instantes (interpolando entre cuadros): cuánto se aparta, en proporción a lo que la magnitud recorre. Una animación
 * atada a los cuadros se aparta en proporción a la frecuencia (a 144 Hz iría 2,4 veces más rápido); una atada al tiempo
 * se aparta sólo por la discretización.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrirBanco } from '../scripts-viajes/banco'
import { CONTADOR, ESPIA_DE_SALTOS, PUNTO_DEL_CURSOR } from '../scripts-escena/banco-escena'
import { ERRORES } from '../scripts-escena/formacion'
import { carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
export const FRECUENCIAS = [60, 75, 120, 144] as const
/** Lo que dura la corrida virtual (s) y la ráfaga de rueda: [instante (s), deltaY]. */
const DURA_S = 7
const RUEDA: readonly (readonly [number, number])[] = [
  [0.5, 100], [0.55, 100], [0.6, 100], [0.65, 100], [0.7, 100],
  [2.5, 240], [2.52, 240], [2.54, 240], [2.56, 240], [2.58, 240], [2.6, 240], [2.62, 240], [2.64, 240],
  [4.8, -120], [4.85, -120], [4.9, -120],
]

/** El reloj virtual: antes de que cargue nada. En modo real no cambia nada. */
export const RELOJ_VIRTUAL = `(() => {
  const rafNativo = window.requestAnimationFrame.bind(window)
  const cancelarNativo = window.cancelAnimationFrame.bind(window)
  const ahoraNativo = performance.now.bind(performance)
  const fechaNativa = Date.now
  let virtual = false
  let t = 0
  let corrimientoDeFecha = 0
  let cola = new Map()
  let siguiente = 1
  window.requestAnimationFrame = (cb) => { if (!virtual) return rafNativo(cb); const k = siguiente++; cola.set(k, cb); return -k }
  window.cancelAnimationFrame = (k) => { if (k < 0) cola.delete(-k); else cancelarNativo(k) }
  performance.now = () => (virtual ? t : ahoraNativo())
  Date.now = () => (virtual ? Math.round(corrimientoDeFecha + t) : fechaNativa())
  window.__relojVirtual = {
    entrar() { t = ahoraNativo(); corrimientoDeFecha = fechaNativa() - t; virtual = true },
    ahora() { return t },
    // Un cuadro: el tiempo avanza y corren los pedidos de cuadro (los que se pidan adentro, en el cuadro que viene).
    cuadro(ms) { t += ms; const lista = cola; cola = new Map(); for (const cb of lista.values()) { try { cb(t) } catch (e) { console.error(e) } } },
    salir() { virtual = false; for (const cb of cola.values()) rafNativo(cb); cola.clear() },
  }
})()`

/** La corrida en la página: avanza el reloj a `hz` y anota cada 50 ms virtuales. */
const CORRER = (hz: number): string => `(async () => {
  const reloj = window.__relojVirtual
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const dibujar = gl.render.bind(gl)
  gl.render = (s, c) => { if (s === escena) camara = c; dibujar(s, c) }
  reloj.entrar()
  // Que se vacíen los pedidos nativos que quedaron (corren una vez más con el reloj real y se vuelven a pedir al virtual).
  await new Promise((r) => setTimeout(r, 200))
  const t0 = reloj.ahora()
  const logo = escena.getObjectByName('logo')
  const rueda = ${JSON.stringify(RUEDA)}
  let r = 0
  const muestras = []
  const paso = 1000 / ${String(hz)}
  let proxima = 0
  const anotar = (s) => {
    const f = window.__fisicaDelBanco
    const modos = f ? f.modos() : []
    muestras.push({
      s: +s.toFixed(4),
      scroll: scrollY,
      camara: camara ? [camara.position.x, camara.position.y, camara.position.z] : null,
      vira: logo ? [logo.rotation.x, logo.rotation.y] : null,
      aire: window.__aireDelBanco ? window.__aireDelBanco.aire : null,
      deriva: window.__aireDelBanco ? window.__aireDelBanco.deriva : null,
      suelta: modos.length ? modos[0] : null,
    })
  }
  while (reloj.ahora() - t0 < ${String(DURA_S * 1000)}) {
    const s = (reloj.ahora() - t0) / 1000
    while (r < rueda.length && rueda[r][0] <= s) { window.dispatchEvent(new WheelEvent('wheel', { deltaY: rueda[r][1], deltaMode: 0, bubbles: true, cancelable: true })); r += 1 }
    // Como en un cuadro de verdad: primero el evento de scroll (del scroll que Lenis movió el cuadro anterior), después
    // los pedidos de cuadro. Sin esto la escena leía el scroll sólo cuando el navegador despachaba el suyo (en las pausas).
    window.dispatchEvent(new Event('scroll'))
    reloj.cuadro(paso)
    const s2 = (reloj.ahora() - t0) / 1000
    if (s2 >= proxima) { anotar(s2); proxima += 0.05 }
    // Cada tanto se le devuelve el control al navegador (que pinte, que no se cuelgue).
    if (Math.round(s2 / (paso / 1000)) % 30 === 0) await new Promise((res) => setTimeout(res, 0))
  }
  reloj.salir()
  gl.render = dibujar
  return muestras
})()`

interface Muestra {
  readonly s: number
  readonly scroll: number
  readonly camara: readonly number[] | null
  readonly vira: readonly number[] | null
  readonly aire: readonly number[] | null
  readonly deriva: readonly number[] | null
  readonly suelta: number | null
}

/** El valor de una magnitud en el instante `s` (interpolado entre las muestras vecinas). */
function en(lista: readonly Muestra[], s: number, f: (m: Muestra) => number): number {
  const k = lista.findIndex((m) => m.s >= s)
  if (k <= 0) return f(lista[Math.max(0, k)])
  const [a, b] = [lista[k - 1], lista[k]]
  const u = (s - a.s) / Math.max(1e-9, b.s - a.s)
  return f(a) + (f(b) - f(a)) * u
}

const MAGNITUDES: Readonly<Record<string, (m: Muestra) => number>> = {
  scroll: (m) => m.scroll,
  'cámara x': (m) => m.camara?.[0] ?? 0,
  'cámara y': (m) => m.camara?.[1] ?? 0,
  'cámara z': (m) => m.camara?.[2] ?? 0,
  'vira x': (m) => m.vira?.[0] ?? 0,
  'vira y': (m) => m.vira?.[1] ?? 0,
  'aire x': (m) => m.aire?.[0] ?? 0,
  'aire z': (m) => m.aire?.[2] ?? 0,
  'deriva x': (m) => m.deriva?.[0] ?? 0,
  'deriva z': (m) => m.deriva?.[2] ?? 0,
}

async function principal(): Promise<void> {
  const dir = carpeta('t4-fluidez/hz')
  const corridas: Record<number, Muestra[]> = {}
  for (const hz of FRECUENCIAS) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena9-hz', antesDeCargar: `${RELOJ_VIRTUAL}; window.__entornoDeLaEscena = 'producto'; ${PUNTO_DEL_CURSOR}; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
    try {
      await esperar(4000)
      corridas[hz] = await medir<Muestra[]>(b.p, CORRER(hz))
      console.log(hz, corridas[hz].length, 'muestras; scroll final', corridas[hz][corridas[hz].length - 1]?.scroll)
    } finally {
      await b.cerrar()
    }
  }
  // Contra 60 Hz: el apartamiento máximo, en proporción a lo que la magnitud recorre en la corrida de 60.
  const base = corridas[60]
  const tabla: Record<string, Record<string, number>> = {}
  for (const [nombre, f] of Object.entries(MAGNITUDES)) {
    const valores = base.map(f)
    const rango = Math.max(...valores) - Math.min(...valores)
    tabla[nombre] = { recorre: +rango.toFixed(4) }
    for (const hz of FRECUENCIAS.slice(1)) {
      let peor = 0
      for (let s = 0.2; s < DURA_S - 0.2; s += 0.05) peor = Math.max(peor, Math.abs(en(corridas[hz], s, f) - en(base, s, f)))
      tabla[nombre][`${String(hz)} Hz`] = rango > 1e-9 ? +((peor / rango) * 100).toFixed(3) : 0
    }
  }
  writeFileSync(`${dir}/hz-${String(ANCHO)}.json`, JSON.stringify({ frecuencias: FRECUENCIAS, rueda: RUEDA, tabla, corridas }, null, 1))
  console.log(JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('t4-hz.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })

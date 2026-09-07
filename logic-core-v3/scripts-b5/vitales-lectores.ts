import { BORDE_INFERIOR_EN_REPOSO_PX } from '../src/app/v3/_lib/navegacion'
import { DESTINOS_DE_LA_RUTA } from '../src/app/v3/_secciones/cierre/contenido'

/**
 * LOS LECTORES DE `d-vitales.ts` — los fuentes que corren adentro de la página.
 *
 * Salieron del instrumento cuando pasó las 300 líneas del repo. El corte es por
 * naturaleza y no por tamaño: acá está **lo que se ejecuta en el navegador**
 * —cadenas de JavaScript— y allá quedó **lo que decide y compara**, que es lo
 * que se lee para juzgar si la medición significa algo.
 */

/** El observador de LCP tiene que existir ANTES del primer pintado. */
export const OBSERVADOR_DE_LCP = `
try {
  window.__lcp = { ms: 0, elemento: '' }
  new PerformanceObserver((lista) => {
    for (const e of lista.getEntries()) {
      window.__lcp = { ms: e.startTime, elemento: e.element ? e.element.tagName + '.' + String(e.element.className).slice(0, 40) : '(sin elemento)' }
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })
} catch (e) {}`

export interface Entradas {
  readonly scrollY: number
  readonly arriba: number
  readonly abajo: number
  readonly ventana: number
}

export const LECTOR_DE_ENTRADAS = `(() => {
  const ps = [...document.querySelectorAll('[data-panel]')]
  const cajas = ps.map((p) => { const r = p.getBoundingClientRect(); return { a: r.top + window.scrollY, b: r.bottom + window.scrollY } })
  return {
    scrollY: window.scrollY,
    arriba: Math.min(...cajas.map((c) => c.a)),
    abajo: Math.max(...cajas.map((c) => c.b)),
    ventana: window.innerHeight,
  }
})()`

export const CONTADOR_DE_CUADROS = (ms: number, conScroll: boolean): string => `(async () => {
  const t0 = performance.now()
  const marcas = []
  await new Promise((listo) => {
    const paso = (t) => {
      marcas.push(t)
      ${conScroll ? 'window.scrollBy(0, 24)' : ''}
      if (t - t0 < ${ms}) requestAnimationFrame(paso)
      else listo()
    }
    requestAnimationFrame(paso)
  })
  const dt = []
  let peor = 0
  let indiceDelPeor = 0
  for (let i = 1; i < marcas.length; i += 1) {
    const d = marcas[i] - marcas[i - 1]
    dt.push(d)
    if (d > peor) { peor = d; indiceDelPeor = i }
  }
  dt.sort((a, b) => a - b)
  const fps = (d) => (d > 0 ? 1000 / d : 0)
  // Las MISMAS tres cifras que publico B4-B (mediana, p05, minimo), para que la
  // comparacion sea contra el mismo estadistico y no contra otro parecido.
  return {
    cuadros: marcas.length,
    duracionMs: marcas[marcas.length - 1] - marcas[0],
    fpsMediana: fps(dt[Math.floor(dt.length * 0.5)]),
    fpsP05: fps(dt[Math.floor(dt.length * 0.95)]),
    fpsMinimo: fps(dt[dt.length - 1]),
    // Donde cae el cuadro largo: el primero de la corrida no es lo mismo que uno
    // en el medio. El primero es el arranque; uno en el medio es el recorrido.
    indiceDelPeor,
    cuadrosLargos: dt.filter((d) => d > 20).length,
    scrollFinal: window.scrollY,
  }
})()`

/**
 * EL ATERRIZAJE DE LAS SIETE ANCLAS. El salto lo hace el NAVEGADOR
 * (`location.hash`), que es quien lee `scroll-padding-top`: si lo hiciera el
 * instrumento con un `scrollTo`, estaria midiendo su propia cuenta.
 */
export const LECTOR_DE_ANCLAS = `(async () => {
          const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          const salida = []
          for (const ancla of ${JSON.stringify(DESTINOS_DE_LA_RUTA.map((d) => d.ancla))}) {
            window.scrollTo(0, 0)
            await raf2()
            const id = ancla.slice(1)
            const destino = document.getElementById(id)
            if (destino === null) { salida.push({ ancla, topDelPanel: NaN, scrollY: window.scrollY, topeDelDocumento: false, ok: false }); continue }
            // El salto lo hace el NAVEGADOR, que es quien lee scroll-padding-top.
            location.hash = ancla
            await raf2()
            await new Promise((r) => setTimeout(r, 900))
            await raf2()
            const top = Math.round(destino.getBoundingClientRect().top * 100) / 100
            /**
             * El PRIMER destino del documento no puede aterrizar a 72 px: su
             * borde vive en y=0 y el navegador no scrollea arriba del tope. Ahi
             * la vara es la otra mitad de la misma regla — quedar pegado al
             * borde con el scroll en cero—, y se declara en vez de aflojarse.
             */
            const topeDelDocumento = window.scrollY === 0 && Math.abs(top) <= 1.5
            salida.push({
              ancla,
              topDelPanel: top,
              scrollY: window.scrollY,
              topeDelDocumento,
              ok: Math.abs(top - ${BORDE_INFERIOR_EN_REPOSO_PX}) <= 1.5 || topeDelDocumento,
            })
          }
          return salida
        })()`

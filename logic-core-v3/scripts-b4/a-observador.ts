/**
 * FRENTE A · EL OBSERVADOR DE MÉTRICAS WEB, como fuente para inyectar.
 *
 * ── Por qué un `PerformanceObserver` en la página y no la traza cruda ─────
 *
 * Porque la traza da eventos del motor y hay que reconstruir la métrica; el
 * observador da **la métrica que el navegador ya calculó**, con la misma
 * definición que usa Chrome para reportarla. Y sobre todo: la entrada de
 * `largest-contentful-paint` trae **`entry.element`**, o sea *cuál* es el
 * elemento LCP. Es lo que decide qué optimizar, y de la traza no sale.
 *
 * ── ⚠️ SE INSTALA ANTES DE NAVEGAR, Y ESO NO ES UN DETALLE ───────────────
 *
 * Va por `Page.addScriptToEvaluateOnNewDocument`, que corre antes que cualquier
 * script del documento. Un observador instalado después de la carga se pierde
 * las entradas que no son bufereables —`layout-shift` y `longtask` NO se
 * rebuferean— y devolvería un CLS y un TBT de cero. Un cero que parece una
 * medición es peor que una medición ausente.
 *
 * `buffered: true` va igual en las cuatro, por si alguna entrada se emitió entre
 * el primer pintado y el `observe`.
 *
 * ── Lo que este archivo NO puede dar ─────────────────────────────────────
 *
 * **INP.** Se mide sobre interacciones reales y sostenidas del usuario; una
 * carga sin un solo click no produce ninguna entrada de `event` que califique.
 * Reportar 0 sería reportar la ausencia de clicks, no la latencia del sitio.
 */

/**
 * La fuente, como cadena, para `Page.addScriptToEvaluateOnNewDocument`.
 *
 * Se guarda en `window.__b4vitales` y la lee `a-vitales.ts` con un
 * `Runtime.evaluate` al final de la ventana de observación.
 */
export const FUENTE_DEL_OBSERVADOR = `
(() => {
  const bolsa = {
    lcp: null,
    lcpHistoria: [],
    cls: 0,
    clsEventos: 0,
    clsPeor: null,
    tareasLargas: [],
    fcp: null,
    fp: null,
    errores: [],
  }
  window.__b4vitales = bolsa

  function describir(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null
    let panel = null
    try { panel = el.closest ? el.closest('[data-panel]') : null } catch (e) { panel = null }
    const r = el.getBoundingClientRect()
    let clases = null
    try {
      clases = typeof el.className === 'string' ? el.className.slice(0, 240) : (el.getAttribute('class') || null)
    } catch (e) { clases = null }
    let texto = null
    try { texto = (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 140) || null } catch (e) { texto = null }
    return {
      tag: el.tagName,
      id: el.id || null,
      clases: clases,
      panel: panel ? panel.getAttribute('data-panel') : null,
      texto: texto,
      caja: { x: Math.round(r.x), y: Math.round(r.y), ancho: Math.round(r.width), alto: Math.round(r.height) },
      fuente: el.currentSrc || el.src || null,
    }
  }

  try {
    new PerformanceObserver((lista) => {
      const entradas = lista.getEntries()
      for (const e of entradas) {
        const registro = {
          startTime: Math.round(e.startTime * 10) / 10,
          renderTime: Math.round((e.renderTime || 0) * 10) / 10,
          loadTime: Math.round((e.loadTime || 0) * 10) / 10,
          size: e.size,
          url: e.url || null,
          elemento: describir(e.element),
        }
        bolsa.lcpHistoria.push(registro)
        bolsa.lcp = registro
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) { bolsa.errores.push('lcp: ' + e.message) }

  try {
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        if (e.hadRecentInput) continue
        bolsa.cls += e.value
        bolsa.clsEventos += 1
        if (bolsa.clsPeor === null || e.value > bolsa.clsPeor.value) {
          const fuentes = []
          for (const s of (e.sources || [])) fuentes.push(describir(s.node))
          bolsa.clsPeor = { value: e.value, startTime: Math.round(e.startTime), fuentes: fuentes }
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  } catch (e) { bolsa.errores.push('cls: ' + e.message) }

  try {
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        bolsa.tareasLargas.push({
          inicio: Math.round(e.startTime * 10) / 10,
          duracion: Math.round(e.duration * 10) / 10,
        })
      }
    }).observe({ type: 'longtask', buffered: true })
  } catch (e) { bolsa.errores.push('longtask: ' + e.message) }

  try {
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        if (e.name === 'first-contentful-paint') bolsa.fcp = Math.round(e.startTime * 10) / 10
        if (e.name === 'first-paint') bolsa.fp = Math.round(e.startTime * 10) / 10
      }
    }).observe({ type: 'paint', buffered: true })
  } catch (e) { bolsa.errores.push('paint: ' + e.message) }
})()
`

/**
 * La lectura, como expresión para `Runtime.evaluate`. Devuelve la bolsa más la
 * navegación y el reparto de TBT.
 *
 * ⚠️ **TBT se declara con su ventana.** La definición canónica es «entre FCP y
 * TTI»; TTI no lo da ningún observador, así que acá se publican DOS ventanas
 * —hasta `loadEventEnd` y hasta el fin de la observación— y ninguna se llama
 * «el» TBT sin decir cuál es. Una cifra de TBT sin su ventana no se puede
 * comparar con la de nadie.
 */
export const FUENTE_DE_LECTURA = `
(() => {
  const b = window.__b4vitales
  if (!b) return { falta: true }
  const nav = performance.getEntriesByType('navigation')[0] || null
  const finDeLaVentana = performance.now()
  const finDeLoad = nav ? nav.loadEventEnd : finDeLaVentana
  const desde = b.fcp === null ? 0 : b.fcp
  function bloqueo(hasta) {
    let t = 0
    for (const x of b.tareasLargas) {
      if (x.inicio + x.duracion <= desde) continue
      if (x.inicio >= hasta) continue
      t += Math.max(0, x.duracion - 50)
    }
    return Math.round(t * 10) / 10
  }
  return {
    falta: false,
    lcpMs: b.lcp ? (b.lcp.renderTime || b.lcp.loadTime || b.lcp.startTime) : null,
    lcp: b.lcp,
    lcpCandidatos: b.lcpHistoria.length,
    lcpHistoria: b.lcpHistoria,
    cls: Math.round(b.cls * 10000) / 10000,
    clsEventos: b.clsEventos,
    clsPeor: b.clsPeor,
    fcpMs: b.fcp,
    fpMs: b.fp,
    tareasLargas: b.tareasLargas.length,
    tareaMasLargaMs: b.tareasLargas.length === 0 ? 0 : Math.max.apply(null, b.tareasLargas.map((x) => x.duracion)),
    tbtDesdeFcpHastaLoadMs: bloqueo(finDeLoad),
    tbtDesdeFcpHastaElFinDeLaVentanaMs: bloqueo(finDeLaVentana),
    ventanaDeObservacionMs: Math.round(finDeLaVentana),
    navegacion: nav ? {
      responseStart: Math.round(nav.responseStart),
      domContentLoadedEventEnd: Math.round(nav.domContentLoadedEventEnd),
      loadEventEnd: Math.round(nav.loadEventEnd),
      transferSize: nav.transferSize,
      encodedBodySize: nav.encodedBodySize,
    } : null,
    recursos: performance.getEntriesByType('resource').length,
    bytesTransferidos: performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0),
    errores: b.errores,
    visibilityState: document.visibilityState,
    innerWidth: window.innerWidth,
  }
})()
`

/**
 * ⚠️ **EL GATE DEL PRELOADER, RESTITUIDO — y por qué no es hacer trampa.**
 *
 * El gate pre-paint del intro (`introBoot.tsx`, `HOME_INTRO_BOOT_JS`) tiene
 * cuatro condiciones y la segunda es `navigator.webdriver !== true`. Esa bandera
 * la enciende el NAVEGADOR porque hay un cliente de CDP conectado, y el gate la
 * usa para no dejar colgada a una corrida headless — su propio docblock lo dice:
 * *«el intro no corre bajo automatización … este componente NO se puede
 * verificar por automatización»*.
 *
 * Ponerla en `false` antes del primer script **no desactiva una protección del
 * sitio: restituye la condición del visitante real**, que es la única forma de
 * medir cuánto cuesta el preloader. Las otras tres condiciones se cumplen solas.
 *
 * Vive acá, y no en el script que lo descubrió, porque `a-gate-del-intro.ts`
 * corre su `principal()` al ser importado: importar de allá para reusar una
 * constante lanzaba una segunda medición completa como efecto de import.
 */
export const RESTITUIR_EL_GATE =
  "Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true })"

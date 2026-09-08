/**
 * B7 · FRENTE D — LOS TIPOS Y EL LECTOR DE LA ANATOMÍA DEL LCP.
 *
 * Sale de `d-lcp-anatomia.ts` por la regla de las 300 líneas del repo, y el
 * corte es el mismo que el resto del banco usa: acá está **lo que corre adentro
 * de la página** y la forma de lo que devuelve; allá queda la corrida y el
 * juicio. La `mediana` y `veredictoDelTecho` viven con la corrida y con el
 * veredicto respectivamente, porque son decisiones de lectura y no de captura.
 */

export interface Recurso {
  readonly nombre: string
  readonly tipo: string
  readonly bloqueante: string | null
  readonly inicio: number
  readonly finDeCabecera: number
  readonly fin: number
  readonly esperaDeRed: number
  readonly transferidos: number
  readonly codificados: number
}

export interface Lectura {
  readonly fcpMs: number | null
  readonly lcpMs: number | null
  readonly lcpEsTexto: boolean
  readonly lcpTag: string | null
  readonly navegacion: Record<string, number>
  readonly recursos: readonly Recurso[]
  readonly fuentes: readonly { readonly familia: string; readonly estado: string; readonly display: string }[]
  readonly visibilityState: string
  readonly innerWidth: number
}

export const LECTOR = `
(() => {
  const r1 = (x) => Math.round(x * 10) / 10
  const b = window.__b4vitales
  const nav = performance.getEntriesByType('navigation')[0]
  const recursos = performance.getEntriesByType('resource').map((r) => ({
    nombre: r.name.replace(location.origin, ''),
    tipo: r.initiatorType,
    bloqueante: r.renderBlockingStatus === undefined ? null : r.renderBlockingStatus,
    inicio: r1(r.startTime),
    finDeCabecera: r1(r.responseStart),
    fin: r1(r.responseEnd),
    esperaDeRed: r1(r.responseStart - r.requestStart),
    transferidos: r.transferSize,
    codificados: r.encodedBodySize,
  }))
  const fuentes = []
  try {
    document.fonts.forEach((f) => fuentes.push({ familia: f.family, estado: f.status, display: f.display }))
  } catch (e) {}
  return {
    fcpMs: b ? b.fcp : null,
    lcpMs: b && b.lcp ? (b.lcp.renderTime || b.lcp.startTime) : null,
    lcpEsTexto: !!(b && b.lcp && b.lcp.url === null),
    lcpTag: b && b.lcp && b.lcp.elemento ? b.lcp.elemento.tag : null,
    navegacion: nav === undefined ? {} : {
      redirectEnd: r1(nav.redirectEnd),
      dnsFin: r1(nav.domainLookupEnd),
      conexionFin: r1(nav.connectEnd),
      pedidoInicio: r1(nav.requestStart),
      primerByte: r1(nav.responseStart),
      htmlCompleto: r1(nav.responseEnd),
      domInteractivo: r1(nav.domInteractive),
      domContentLoaded: r1(nav.domContentLoadedEventEnd),
      domCompleto: r1(nav.domComplete),
      loadFin: r1(nav.loadEventEnd),
      htmlTransferido: nav.transferSize,
      htmlCodificado: nav.encodedBodySize,
      htmlDecodificado: nav.decodedBodySize,
    },
    recursos: recursos,
    fuentes: fuentes,
    visibilityState: document.visibilityState,
    innerWidth: window.innerWidth,
  }
})()
`

/**
 * ⚠️ **EL BRAZO QUE CONVIERTE UNA ESTIMACIÓN EN UNA MEDICIÓN.**
 *
 * La hoja de estilos bloqueante de 65,8 KiB tarda casi un segundo en bajar. A
 * los 204.800 B/s del preset, sus 67.373 bytes son **329 ms**: está recibiendo
 * un tercio del caño. Lo que se lo come son los **25 chunks de JS, 350,0 KiB**
 * medidos en la corrida, que arrancan casi en el mismo milisegundo y que **no
 * participan del primer pintado** — el LCP es texto del HTML del servidor.
 * (Las cifras exactas de cada corrida están en `recursos` del JSON; acá van
 * redondeadas y se corrigieron: la primera versión decía «26 chunks, ~340 KiB»
 * y «67.379 bytes», y ninguna de las tres reproduce.)
 *
 * Eso es una hipótesis con aritmética, y una hipótesis con aritmética todavía no
 * es una cifra. El brazo `sin-chunks` la mide: se bloquean los chunks con
 * `Network.setBlockedURLs` y se vuelve a medir el FCP con TODO lo demás igual.
 * La diferencia es **cuánto del FCP es contención de ancho de banda con JS que
 * no pinta**.
 *
 * ⚠️ **NO es una propuesta de producto.** Una página sin sus chunks no hidrata y
 * no es el sitio. Es un experimento de ATRIBUCIÓN: pone un techo medido a lo que
 * podría ganar cualquier palanca de prioridad, y ese techo es lo que se reporta.
 */
